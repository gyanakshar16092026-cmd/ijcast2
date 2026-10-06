import { supabase } from '../config/supabase-vercel.js';
import { cashfreeConfig } from '../config/cashfree-vercel.js';

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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const orderDetails = await getCashfreeOrder(order_id);
    
    // Get payment details
    const paymentResponse = await getCashfreePayments(order_id);
    const paymentDetails = paymentResponse.data && paymentResponse.data.length > 0 ? paymentResponse.data[0] : null;

    // Get payment record from database
    const { data: paymentRecord } = await supabase
      .from('apc_payments')
      .select('*')
      .eq('cashfree_order_id', order_id)
      .single();

    if (orderDetails.order_status === 'PAID' && paymentDetails?.payment_status === 'SUCCESS') {
      // Update payment record to SUCCESS
      await supabase
        .from('apc_payments')
        .update({
          payment_status: 'SUCCESS',
          cashfree_payment_id: paymentDetails.cf_payment_id,
          payment_method: paymentDetails.payment_method
        })
        .eq('cashfree_order_id', order_id);

      console.log('✅ APC payment verified successfully:', order_id);

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
  } catch (error) {
    console.error('❌ APC payment verification failed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
}