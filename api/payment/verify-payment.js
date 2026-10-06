import Joi from 'joi';
import { supabase } from '../config/supabase-vercel.js';
import { cashfreeConfig } from '../config/cashfree-vercel.js';

const verifyPaymentSchema = Joi.object({
  orderId: Joi.string().required()
});

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const { data: paymentRecord } = await supabase
      .from('apc_payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (!paymentRecord) {
      return res.status(404).json({
        error: true,
        message: 'Payment record not found'
      });
    }

    // Get order details from Cashfree
    const cashfreeOrder = await getCashfreeOrder(paymentRecord.cashfree_order_id);
    
    // Get payment details
    let paymentDetails = null;
    if (cashfreeOrder.order_status === 'PAID') {
      const payments = await getCashfreePayments(paymentRecord.cashfree_order_id);
      paymentDetails = payments.data && payments.data.length > 0 ? payments.data[0] : null;
    }

    // Update payment record with latest status
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

  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to verify payment status'
    });
  }
}