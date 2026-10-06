import { supabase } from '../config/supabase-vercel.js';
import { cashfreeConfig } from '../config/cashfree-vercel.js';

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

    // Create Cashfree order data
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
        return_url: returnUrl || `${process.env.VITE_FRONTEND_URL}/apc-payment/success`,
        notify_url: `${process.env.VITE_FRONTEND_URL}/api/apc-payment/webhook`
      },
      order_note: orderNote || `APC Payment for manuscript ${manuscriptId}`
    };

    // Create Cashfree order
    const cashfreeOrder = await createCashfreeOrder(cashfreeOrderData);

    console.log('✅ Cashfree order created:', cashfreeOrder.order_id);

    // Store payment record in database
    const { data: paymentRecord, error: dbError } = await supabase
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
        payment_status: 'INITIATED',
        gasf_membership: gasfMembership || null,
        is_member: isMember || false,
        discount_applied: discountApplied || 0,
        metadata: {
          cashfreeResponse: cashfreeOrder,
          returnUrl,
          orderNote
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create payment record');
    }

    console.log('💾 Payment record created:', paymentRecord.id);

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
}