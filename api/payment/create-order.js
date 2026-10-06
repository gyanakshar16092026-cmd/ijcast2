import Joi from 'joi';
import { supabase } from '../config/supabase-vercel.js';
import { cashfreeConfig } from '../config/cashfree-vercel.js';

// Validation schema
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

// Helper functions
const calculateAPCAmount = (authorType, isMember) => {
  if (authorType === 'indian') {
    return {
      amount: isMember ? 800 : 1000,
      currency: 'INR',
      discountPercent: isMember ? 20 : 0
    };
  } else {
    return {
      amount: isMember ? 40 : 50,
      currency: 'USD',
      discountPercent: isMember ? 20 : 0
    };
  }
};

const createCashfreeOrder = async (orderData) => {
  const response = await fetch(`${cashfreeConfig.apiUrl}/pg/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': cashfreeConfig.clientId,
      'x-client-secret': cashfreeConfig.clientSecret,
      'x-api-version': '2022-09-01'
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error(`Cashfree API error: ${response.status}`);
  }

  return await response.json();
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    if (gasfMembership) {
      // Check membership in Supabase
      const { data: memberData } = await supabase
        .from('gasf_members')
        .select('*')
        .eq('membership_id', gasfMembership)
        .eq('status', 'active')
        .single();
      
      isMember = !!memberData;
    }

    // Calculate and verify APC amount server-side
    const apcCalculation = calculateAPCAmount(authorType, isMember);
    
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
    const { data: paymentRecord, error: dbError } = await supabase
      .from('apc_payments')
      .insert({
        order_id: orderId,
        author_name: authorName,
        author_email: authorEmail,
        author_phone: authorPhone,
        manuscript_id: manuscriptId,
        amount,
        currency,
        payment_status: 'INITIATED',
        gasf_membership: gasfMembership,
        is_member: isMember,
        discount_applied: apcCalculation.discountPercent,
        metadata: {
          authorType,
          apcCalculation
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create payment record');
    }

    // Create Cashfree order
    const cashfreeOrderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: `ijcast_${authorEmail}`,
        customer_name: authorName,
        customer_email: authorEmail,
        customer_phone: authorPhone
      },
      order_meta: {
        return_url: `${process.env.VITE_FRONTEND_URL}/apc-payment/success?order_id=${orderId}`,
        notify_url: `${req.headers.origin || process.env.VITE_FRONTEND_URL}/api/webhooks/cashfree`
      },
      order_note: `IJCAST APC Payment - Manuscript: ${manuscriptId}`
    };

    const cashfreeOrder = await createCashfreeOrder(cashfreeOrderData);

    // Update payment record with Cashfree order ID
    await supabase
      .from('apc_payments')
      .update({
        cashfree_order_id: cashfreeOrder.order_id,
        payment_status: 'PENDING'
      })
      .eq('order_id', orderId);

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
}