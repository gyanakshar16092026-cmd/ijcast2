import express from 'express';
import { cashfreeService } from '../services/cashfreeService.js';
import { paymentService } from '../services/paymentService.js';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// PHASE 15: SECURITY - Enhanced webhook validation
router.post('/cashfree', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    
    if (!signature || !timestamp) {
      console.error('Missing webhook signature or timestamp');
      return res.status(400).json({ error: 'Missing signature or timestamp' });
    }

    // PHASE 15: Validate timestamp to prevent replay attacks
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    const timeDifference = Math.abs(currentTime - webhookTime);
    
    // Reject webhooks older than 5 minutes (300 seconds)
    if (timeDifference > 300) {
      console.error('Webhook timestamp too old:', { timeDifference, webhookTime, currentTime });
      return res.status(400).json({ error: 'Webhook timestamp expired' });
    }

    // Parse the raw body
    let payload;
    try {
      payload = JSON.parse(req.body.toString());
    } catch (error) {
      console.error('Invalid JSON in webhook payload');
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // Verify webhook signature
    const isValidSignature = cashfreeService.verifyWebhookSignature(
      payload,
      signature,
      timestamp
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('Cashfree webhook received:', {
      type: payload.type,
      orderId: payload.data?.order?.order_id,
      status: payload.data?.order?.order_status
    });

    // Handle different webhook events
    switch (payload.type) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        await handlePaymentSuccess(payload.data);
        break;
      
      case 'PAYMENT_FAILED_WEBHOOK':
        await handlePaymentFailed(payload.data);
        break;
      
      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        await handlePaymentDropped(payload.data);
        break;
      
      default:
        console.log('Unhandled webhook type:', payload.type);
    }

    // Always return 200 OK to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook processing error:', error.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful payment
async function handlePaymentSuccess(data) {
  try {
    const order = data.order;
    const payment = data.payment;
    
    // Find payment record by Cashfree order ID
    const orderId = await findOrderBycashfreeId(order.order_id);
    if (!orderId) {
      console.error('Payment record not found for Cashfree order:', order.order_id);
      return;
    }

    // Update payment record
    await paymentService.updatePaymentRecord(orderId, {
      payment_status: 'SUCCESS',
      payment_method: payment.payment_method,
      cashfree_payment_id: payment.cf_payment_id,
      metadata: {
        webhookData: data,
        processedAt: new Date().toISOString()
      }
    });

    console.log('Payment success processed for order:', orderId);
  } catch (error) {
    console.error('Error processing payment success:', error.message);
  }
}

// Handle failed payment
async function handlePaymentFailed(data) {
  try {
    const order = data.order;
    
    const orderId = await findOrderByCashfreeId(order.order_id);
    if (!orderId) {
      console.error('Payment record not found for Cashfree order:', order.order_id);
      return;
    }

    await paymentService.updatePaymentRecord(orderId, {
      payment_status: 'FAILED',
      metadata: {
        webhookData: data,
        processedAt: new Date().toISOString()
      }
    });

    console.log('Payment failure processed for order:', orderId);
  } catch (error) {
    console.error('Error processing payment failure:', error.message);
  }
}

// Handle dropped/cancelled payment
async function handlePaymentDropped(data) {
  try {
    const order = data.order;
    
    const orderId = await findOrderByCashfreeId(order.order_id);
    if (!orderId) {
      console.error('Payment record not found for Cashfree order:', order.order_id);
      return;
    }

    await paymentService.updatePaymentRecord(orderId, {
      payment_status: 'CANCELLED',
      metadata: {
        webhookData: data,
        processedAt: new Date().toISOString()
      }
    });

    console.log('Payment cancellation processed for order:', orderId);
  } catch (error) {
    console.error('Error processing payment cancellation:', error.message);
  }
}

// Helper function to find order ID by Cashfree order ID
async function findOrderByCashfreeId(cashfreeOrderId) {
  try {
    // Query Supabase for the order
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Cannot find order by Cashfree ID.');
      return null;
    }

    const { data, error } = await supabase
      .from('apc_payments')
      .select('order_id')
      .eq('cashfree_order_id', cashfreeOrderId)
      .single();

    if (error) {
      console.error('Error finding order by Cashfree ID:', error.message);
      return null;
    }

    return data?.order_id || null;
  } catch (error) {
    console.error('Error finding order by Cashfree ID:', error.message);
    return null;
  }
}

export default router;