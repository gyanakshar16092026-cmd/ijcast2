import Joi from 'joi';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cashfree configuration
const cashfreeConfig = {
  clientId: process.env.VITE_CASHFREE_CLIENT_ID || process.env.CASHFREE_CLIENT_ID,
  clientSecret: process.env.VITE_CASHFREE_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET,
  environment: process.env.VITE_CASHFREE_ENVIRONMENT || 'sandbox',
  apiUrl: process.env.VITE_CASHFREE_ENVIRONMENT === 'production' 
    ? 'https://api.cashfree.com' 
    : 'https://sandbox.cashfree.com'
};

// ================================
// HELPER FUNCTIONS
// ================================

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

const getCashfreeOrder = async (orderId) => {
  const response = await fetch(`${cashfreeConfig.apiUrl}/pg/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'x-client-id': cashfreeConfig.clientId,
      'x-client-secret': cashfreeConfig.clientSecret,
      'x-api-version': '2022-09-01'
    }
  });

  if (!response.ok) {
    throw new Error(`Cashfree API error: ${response.status}`);
  }

  return await response.json();
};

const getCashfreePayments = async (orderId) => {
  const response = await fetch(`${cashfreeConfig.apiUrl}/pg/orders/${orderId}/payments`, {
    method: 'GET',
    headers: {
      'x-client-id': cashfreeConfig.clientId,
      'x-client-secret': cashfreeConfig.clientSecret,
      'x-api-version': '2022-09-01'
    }
  });

  if (!response.ok) {
    throw new Error(`Cashfree API error: ${response.status}`);
  }

  return await response.json();
};

const verifyWebhookSignature = (body, signature, timestamp) => {
  if (!signature || !timestamp) {
    return false;
  }

  try {
    const signatureTime = timestamp + "." + JSON.stringify(body);
    const computedSignature = createHmac('sha256', cashfreeConfig.clientSecret)
      .update(signatureTime)
      .digest('base64');

    return computedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// ================================
// MAIN API HANDLER
// ================================

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature, x-webhook-timestamp');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // Route to different handlers based on action or path
    switch (action) {
      case 'test':
        return handleTest(req, res);
      case 'webhook':
        return handleWebhook(req, res);
      case 'create-order':
        return handleCreateOrder(req, res);
      case 'verify-payment':
        return handleVerifyPayment(req, res);
      case 'apc-create':
        return handleAPCCreate(req, res);
      case 'apc-verify':
        return handleAPCVerify(req, res);
      case 'status':
        return handleStatus(req, res);
      default:
        // If no action, check if it's a webhook (has signature header)
        if (req.headers['x-webhook-signature']) {
          return handleWebhook(req, res);
        }
        // Otherwise, default to test endpoint
        return handleTest(req, res);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// ================================
// HANDLER FUNCTIONS
// ================================

// Test endpoint
function handleTest(req, res) {
  res.status(200).json({
    success: true,
    message: 'IJCAST API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url,
    endpoints: {
      test: 'GET /api?action=test',
      webhook: 'POST /api?action=webhook',
      createOrder: 'POST /api?action=create-order',
      verifyPayment: 'POST /api?action=verify-payment',
      apcCreate: 'POST /api?action=apc-create',
      apcVerify: 'GET /api?action=apc-verify',
      status: 'GET /api?action=status&manuscriptId=X'
    }
  });
}

// Webhook handler
async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  
  console.log('🔔 Cashfree webhook received:', req.body);

  // Verify webhook signature
  const isValidSignature = verifyWebhookSignature(
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
    await supabase
      .from('apc_payments')
      .update({
        payment_status: 'SUCCESS',
        cashfree_payment_id: data.payment?.cf_payment_id,
        payment_method: data.payment?.payment_method
      })
      .eq('cashfree_order_id', order.order_id);

    console.log('✅ Payment webhook processed - payment successful:', order.order_id);
  } else if (order.order_status === 'FAILED') {
    await supabase
      .from('apc_payments')
      .update({
        payment_status: 'FAILED'
      })
      .eq('cashfree_order_id', order.order_id);

    console.log('❌ Payment webhook processed - payment failed:', order.order_id);
  }

  res.json({ status: 'success' });
}

// Create payment order
async function handleCreateOrder(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const { data: memberData } = await supabase
      .from('gasf_members')
      .select('*')
      .eq('membership_id', gasfMembership)
      .eq('status', 'active')
      .single();
    
    isMember = !!memberData;
  }

  // Calculate and verify APC amount
  const apcCalculation = calculateAPCAmount(authorType, isMember);
  
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
      metadata: { authorType, apcCalculation }
    })
    .select()
    .single();

  if (dbError) {
    throw new Error('Failed to create payment record');
  }

  // Auto-detect frontend URL from request
  const frontendUrl = req.headers.origin || 
                     req.headers.host ? `https://${req.headers.host}` : 
                     process.env.VITE_FRONTEND_URL || 
                     'https://localhost:5173';

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
      return_url: `${frontendUrl}/apc-payment/success?order_id=${orderId}`,
      notify_url: `${frontendUrl}/api`
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
}

// Verify payment
async function handleVerifyPayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  // Get payment record
  const { data: paymentRecord } = await supabase
    .from('apc_payments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (!paymentRecord) {
    return res.status(404).json({ error: 'Payment record not found' });
  }

  // Get Cashfree order details
  const cashfreeOrder = await getCashfreeOrder(paymentRecord.cashfree_order_id);
  
  let paymentDetails = null;
  if (cashfreeOrder.order_status === 'PAID') {
    const payments = await getCashfreePayments(paymentRecord.cashfree_order_id);
    paymentDetails = payments.data && payments.data.length > 0 ? payments.data[0] : null;
  }

  // Update payment record
  await supabase
    .from('apc_payments')
    .update({
      payment_status: cashfreeOrder.order_status,
      payment_method: paymentDetails?.payment_method || null,
      cashfree_payment_id: paymentDetails?.cf_payment_id || null,
      metadata: {
        ...paymentRecord.metadata,
        cashfreeOrder,
        paymentDetails,
        verifiedAt: new Date().toISOString()
      }
    })
    .eq('order_id', orderId);

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
}

// Handle APC create
async function handleAPCCreate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    orderId,
    orderAmount,
    customerName,
    customerEmail,
    customerPhone,
    manuscriptId
  } = req.body;

  if (!orderId || !orderAmount || !customerName || !customerEmail || !customerPhone || !manuscriptId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Auto-detect frontend URL from request
  const frontendUrl = req.headers.origin || 
                     req.headers.host ? `https://${req.headers.host}` : 
                     'https://localhost:3000';

  const cashfreeOrderData = {
    order_id: orderId,
    order_amount: orderAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: `ijcast_${customerEmail}`,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone
    },
    order_meta: {
      return_url: `${frontendUrl}/apc-payment/success`,
      notify_url: `${frontendUrl}/api`
    },
    order_note: `APC Payment for manuscript ${manuscriptId}`
  };

  const cashfreeOrder = await createCashfreeOrder(cashfreeOrderData);

  const { data: paymentRecord } = await supabase
    .from('apc_payments')
    .insert({
      order_id: orderId,
      cashfree_order_id: cashfreeOrder.order_id,
      author_name: customerName,
      author_email: customerEmail,
      author_phone: customerPhone,
      manuscript_id: manuscriptId,
      amount: orderAmount,
      currency: 'INR',
      payment_status: 'INITIATED'
    })
    .select()
    .single();

  res.json({
    success: true,
    paymentSessionId: cashfreeOrder.payment_session_id,
    payment_link: cashfreeOrder.payment_link,
    order_id: cashfreeOrder.order_id,
    orderAmount,
    customerEmail
  });
}

// Handle APC verify
async function handleAPCVerify(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id } = req.query;
  if (!order_id) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

  const orderDetails = await getCashfreeOrder(order_id);
  const paymentResponse = await getCashfreePayments(order_id);
  const paymentDetails = paymentResponse.data && paymentResponse.data.length > 0 ? paymentResponse.data[0] : null;

  const { data: paymentRecord } = await supabase
    .from('apc_payments')
    .select('*')
    .eq('cashfree_order_id', order_id)
    .single();

  if (orderDetails.order_status === 'PAID' && paymentDetails?.payment_status === 'SUCCESS') {
    await supabase
      .from('apc_payments')
      .update({
        payment_status: 'SUCCESS',
        cashfree_payment_id: paymentDetails.cf_payment_id,
        payment_method: paymentDetails.payment_method
      })
      .eq('cashfree_order_id', order_id);

    res.json({
      success: true,
      paymentDetails: {
        orderId: order_id,
        paymentId: paymentDetails.cf_payment_id,
        amount: orderDetails.order_amount,
        currency: orderDetails.order_currency,
        status: 'SUCCESS',
        paidAt: paymentDetails.payment_time,
        manuscriptId: paymentRecord?.manuscript_id,
        authorEmail: paymentRecord?.author_email
      }
    });
  } else {
    res.json({
      success: false,
      message: 'Payment not completed or failed',
      orderStatus: orderDetails.order_status,
      paymentStatus: paymentDetails?.payment_status
    });
  }
}

// Handle status check
async function handleStatus(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { manuscriptId } = req.query;
  if (!manuscriptId) {
    return res.status(400).json({ success: false, message: 'Manuscript ID is required' });
  }

  const { data: paymentRecord } = await supabase
    .from('apc_payments')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .single();

  if (!paymentRecord) {
    return res.json({
      success: false,
      paid: false,
      message: 'No payment record found'
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
}