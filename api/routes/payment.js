import express from 'express';
import Joi from 'joi';
import { cashfreeService } from '../services/cashfreeService.js';
import { paymentService } from '../services/paymentService.js';

const router = express.Router();

// Validation schemas
const createOrderSchema = Joi.object({
  authorName: Joi.string().required().min(2).max(100),
  authorEmail: Joi.string().email().required(),
  authorPhone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
  manuscriptId: Joi.string().required().min(1).max(50),
  authorType: Joi.string().valid('indian', 'foreign').required(),
  gasfMembership: Joi.string().optional().allow('').max(50),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('INR', 'USD').required()
});

const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().required()
});

// Create payment order
router.post('/create-order', async (req, res) => {
  try {
    // Validate request data
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const {
      authorName,
      authorEmail,
      authorPhone,
      manuscriptId,
      authorType,
      gasfMembership,
      amount,
      currency
    } = value;

    // Validate GASF membership if provided
    let isMember = false;
    let membershipDetails = null;
    if (gasfMembership) {
      membershipDetails = await paymentService.validateGASFMembership(gasfMembership);
      isMember = membershipDetails.isValid;
    }

    // Calculate and verify APC amount server-side
    const apcCalculation = paymentService.calculateAPCAmount(authorType, isMember);
    
    // Security: Don't trust the amount from frontend
    if (Math.abs(amount - apcCalculation.amount) > 0.01 || currency !== apcCalculation.currency) {
      return res.status(400).json({
        error: true,
        message: 'Amount mismatch. Please refresh and try again.',
        calculatedAmount: apcCalculation
      });
    }

    // Generate unique order ID
    const orderId = `IJCAST_${manuscriptId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record in database
    const paymentData = {
      orderId,
      authorName,
      authorEmail,
      authorPhone,
      manuscriptId,
      amount,
      currency,
      paymentStatus: 'INITIATED',
      gasfMembership,
      isMember,
      discountApplied: apcCalculation.discountPercent,
      metadata: {
        authorType,
        apcCalculation,
        membershipDetails
      }
    };

    await paymentService.createPaymentRecord(paymentData);

    // Create Cashfree order
    const cashfreeOrder = await cashfreeService.createOrder({
      orderId,
      orderAmount: amount,
      customerName: authorName,
      customerEmail: authorEmail,
      customerPhone: authorPhone,
      orderNote: `IJCAST APC Payment - Manuscript: ${manuscriptId}`,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
      notifyUrl: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/webhooks/cashfree`
    });

    // Update payment record with Cashfree order ID
    await paymentService.updatePaymentRecord(orderId, {
      cashfree_order_id: cashfreeOrder.order_id,
      payment_status: 'PENDING'
    });

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId,
        cashfreeOrderId: cashfreeOrder.order_id,
        paymentSessionId: cashfreeOrder.payment_session_id,
        orderAmount: amount,
        orderCurrency: currency,
        checkoutUrl: cashfreeOrder.checkout_url || null,
        apcCalculation
      }
    });

  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to create payment order'
    });
  }
});

// Verify payment status
router.post('/verify-payment', async (req, res) => {
  try {
    const { error, value } = verifyPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Invalid order ID'
      });
    }

    const { orderId } = value;

    // Get payment record from database
    const paymentRecord = await paymentService.getPaymentRecord(orderId);
    if (!paymentRecord) {
      return res.status(404).json({
        error: true,
        message: 'Payment record not found'
      });
    }

    // Get order details from Cashfree
    const cashfreeOrder = await cashfreeService.getOrder(paymentRecord.cashfree_order_id);
    
    // Get payment details
    let paymentDetails = null;
    if (cashfreeOrder.order_status === 'PAID') {
      const payments = await cashfreeService.getPayments(paymentRecord.cashfree_order_id);
      paymentDetails = payments.data && payments.data.length > 0 ? payments.data[0] : null;
    }

    // Update payment record with latest status
    const updateData = {
      payment_status: cashfreeOrder.order_status,
      payment_method: paymentDetails?.payment_method || null,
      cashfree_payment_id: paymentDetails?.cf_payment_id || null,
      metadata: {
        ...paymentRecord.metadata,
        cashfreeOrder,
        paymentDetails,
        verifiedAt: new Date().toISOString()
      }
    };

    await paymentService.updatePaymentRecord(orderId, updateData);

    res.status(200).json({
      success: true,
      data: {
        orderId,
        paymentStatus: cashfreeOrder.order_status,
        orderAmount: cashfreeOrder.order_amount,
        orderCurrency: cashfreeOrder.order_currency,
        paymentMethod: paymentDetails?.payment_method || null,
        transactionId: paymentDetails?.cf_payment_id || null,
        paymentTime: paymentDetails?.payment_time || null,
        authorName: paymentRecord.author_name,
        manuscriptId: paymentRecord.manuscript_id
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to verify payment status'
    });
  }
});

// Get payment history (ADMIN ONLY - requires authentication)
router.get('/history', async (req, res) => {
  try {
    // PHASE 15: SECURITY FIX - This endpoint requires admin authentication
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required'
      });
    }

    // TODO: Implement proper admin token verification with Supabase
    // For now, return error requiring proper authentication
    return res.status(403).json({
      error: true,
      message: 'Admin authentication required. This endpoint is protected.'
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Failed to fetch payment history'
    });
  }
});

export default router;