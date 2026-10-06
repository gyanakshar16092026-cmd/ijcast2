import crypto from 'crypto';
import { supabase } from '../config/supabase-vercel.js';
import { cashfreeConfig } from '../config/cashfree-vercel.js';

const verifyWebhookSignature = (body, signature, timestamp) => {
  if (!signature || !timestamp) {
    return false;
  }

  try {
    const signatureTime = timestamp + "." + JSON.stringify(body);
    const computedSignature = crypto
      .createHmac('sha256', cashfreeConfig.clientSecret)
      .update(signatureTime)
      .digest('base64');

    return computedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature, x-webhook-timestamp');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
}