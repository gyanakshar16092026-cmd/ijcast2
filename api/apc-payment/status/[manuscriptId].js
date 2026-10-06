import { supabase } from '../../config/supabase-vercel.js';

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
    const { manuscriptId } = req.query;

    console.log('📊 Checking payment status for manuscript:', manuscriptId);

    // Query payment record by manuscript_id
    const { data: paymentRecord } = await supabase
      .from('apc_payments')
      .select('*')
      .eq('manuscript_id', manuscriptId)
      .single();

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
}