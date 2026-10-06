import express from 'express';
import { cashfreeService } from '../services/cashfreeService.js';
import { paymentService } from '../services/paymentService.js';

const router = express.Router();

// Create APC payment order
router.post('/create-order', async (req, res) => {
  try {
    const {
      orderId,
      orderAmount,
      customerName,
      customerEmail,
      customerPhone,
      manuscriptId,
      gasfMembership,
      isMember,
      discountApplied,
      returnUrl,
      orderNote
    } = req.body;

    console.log('🔄 Creating APC payment order:', { orderId, orderAmount, customerEmail, manuscriptId });

    // Validate required fields
    if (!orderId || !orderAmount || !customerName || !customerEmail || !customerPhone || !manuscriptId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for payment order creation'
      });
    }

    // Create Cashfree order
    const cashfreeOrder = await cashfreeService.createOrder({
      orderId,
      orderAmount,
      customerName,
      customerEmail,
      customerPhone,
      orderNote: orderNote || `APC Payment for manuscript ${manuscriptId}`,
      returnUrl: returnUrl || `${req.protocol}://${req.get('host')}/apc-payment/success`,
      notifyUrl: `${req.protocol}://${req.get('host')}/api/apc-payment/webhook`
    });

    console.log('✅ Cashfree order created:', cashfreeOrder.order_id);

    // Store payment record in database
    const paymentRecord = await paymentService.createPaymentRecord({
      orderId,
      cashfreeOrderId: cashfreeOrder.order_id,
      authorName: customerName,
      authorEmail: customerEmail,
      authorPhone: customerPhone,
      manuscriptId,
      amount: orderAmount,
      currency: 'INR',
      paymentStatus: 'INITIATED',
      gasfMembership: gasfMembership || null,
      isMember: isMember || false,
      discountApplied: discountApplied || 0,
      metadata: {
        cashfreeResponse: cashfreeOrder,
        returnUrl,
        orderNote
      }
    });

    console.log('💾 Payment record created:', paymentRecord.data?.id);

    res.json({
      success: true,
      paymentSessionId: cashfreeOrder.payment_session_id,
      payment_link: cashfreeOrder.payment_link,
      order_id: cashfreeOrder.order_id,
      orderAmount,
      customerEmail
    });
  } catch (error) {
    console.error('❌ APC payment order creation failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
});

// Verify APC payment
router.get('/verify', async (req, res) => {
  try {
    const { order_id, order_token } = req.query;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    console.log('🔍 Verifying APC payment:', { order_id, order_token });

    // Get order details from Cashfree
    const orderDetails = await cashfreeService.getOrder(order_id);
    
    // Get payment details
    const paymentDetails = await cashfreeService.getPayments(order_id);

    // Get payment record from database
    const paymentRecord = await paymentService.getPaymentRecord(order_id);

    if (orderDetails.order_status === 'PAID' && paymentDetails?.[0]?.payment_status === 'SUCCESS') {
      // Update payment record to SUCCESS
      await paymentService.updatePaymentRecord(order_id, {
        payment_status: 'SUCCESS',
        cashfree_payment_id: paymentDetails[0].cf_payment_id,
        payment_method: paymentDetails[0].payment_method
      });

      console.log('✅ APC payment verified successfully:', order_id);

      res.json({
        success: true,
        paymentDetails: {
          orderId: order_id,
          paymentId: paymentDetails[0].cf_payment_id,
          amount: orderDetails.order_amount,
          currency: orderDetails.order_currency,
          status: 'SUCCESS',
          paidAt: paymentDetails[0].payment_time,
          manuscriptId: paymentRecord?.manuscript_id,
          authorEmail: paymentRecord?.author_email
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Payment not completed or failed',
        orderStatus: orderDetails.order_status,
        paymentStatus: paymentDetails?.[0]?.payment_status
      });
    }
  } catch (error) {
    console.error('❌ APC payment verification failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});

// Check payment status by manuscript ID
router.get('/status/:manuscriptId', async (req, res) => {
  try {
    const { manuscriptId } = req.params;

    console.log('📊 Checking payment status for manuscript:', manuscriptId);

    // Query payment record by manuscript_id
    const paymentRecord = await paymentService.getPaymentRecord(manuscriptId);

    if (!paymentRecord) {
      return res.json({
        success: false,
        paid: false,
        message: 'No payment record found for this manuscript'
      });
    }

    if (paymentRecord.payment_status === 'SUCCESS') {
      res.json({
        success: true,
        paid: true,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        paymentId: paymentRecord.cashfree_payment_id,
        paidAt: paymentRecord.updated_at,
        discountApplied: paymentRecord.discount_applied
      });
    } else {
      res.json({
        success: true,
        paid: false,
        status: paymentRecord.payment_status,
        message: 'Payment is pending or incomplete'
      });
    }
  } catch (error) {
    console.error('❌ Failed to check payment status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check payment status'
    });
  }
});

// Webhook to handle payment notifications
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    
    console.log('🔔 APC payment webhook received:', req.body);

    // Verify webhook signature
    const isValidSignature = cashfreeService.verifyWebhookSignature(
      req.body,
      signature,
      timestamp
    );

    if (!isValidSignature) {
      console.log('❌ Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { data } = req.body;
    const { order } = data;

    // Update payment record based on webhook data
    if (order.order_status === 'PAID') {
      await paymentService.updatePaymentRecord(order.order_id, {
        payment_status: 'SUCCESS',
        cashfree_payment_id: data.payment?.cf_payment_id,
        payment_method: data.payment?.payment_method
      });

      console.log('✅ APC payment webhook processed - payment successful:', order.order_id);
    } else if (order.order_status === 'FAILED') {
      await paymentService.updatePaymentRecord(order.order_id, {
        payment_status: 'FAILED'
      });

      console.log('❌ APC payment webhook processed - payment failed:', order.order_id);
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('❌ APC payment webhook processing failed:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;