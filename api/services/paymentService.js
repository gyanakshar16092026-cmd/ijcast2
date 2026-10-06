import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export class PaymentService {
  // Store payment record in database
  async createPaymentRecord(paymentData) {
    if (!isSupabaseConfigured) {
      console.warn('⚠️  Supabase not configured. Payment will work but records won\'t be stored in database.');
      console.log('💡 To fix: Create apc_payments table in Supabase (see CREATE_TABLE_MANUALLY.md)');
      return { success: true, data: { ...paymentData, id: 'temp-' + Date.now() } };
    }

    try {
      const record = {
        order_id: paymentData.orderId,
        cashfree_order_id: paymentData.cashfreeOrderId || null,
        cashfree_payment_id: paymentData.cashfreePaymentId || null,
        author_name: paymentData.authorName,
        author_email: paymentData.authorEmail,
        author_phone: paymentData.authorPhone,
        manuscript_id: paymentData.manuscriptId,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency || 'INR',
        payment_status: paymentData.paymentStatus || 'PENDING',
        payment_method: paymentData.paymentMethod || null,
        gasf_membership: paymentData.gasfMembership || null,
        is_member: paymentData.isMember || false,
        discount_applied: paymentData.discountApplied || 0,
        metadata: paymentData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('apc_payments')
        .insert([record])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error('Failed to store payment record');
      }

      console.log('Payment record created:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to create payment record:', error.message);
      console.log('💡 This is likely because the apc_payments table doesn\'t exist.');
      console.log('📋 See CREATE_TABLE_MANUALLY.md for instructions to fix this.');
      
      // For demo purposes, continue without database storage
      console.log('⚡ Continuing payment flow without database storage...');
      return { 
        success: true, 
        data: { ...paymentData, id: 'temp-' + Date.now() },
        warning: 'Payment record not stored in database'
      };
    }
  }

  // Update payment record
  async updatePaymentRecord(orderId, updateData) {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Skipping database update.');
      return { success: true, data: updateData };
    }

    try {
      const updates = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('apc_payments')
        .update(updates)
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw new Error('Failed to update payment record');
      }

      console.log('Payment record updated:', orderId);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to update payment record:', error.message);
      throw error;
    }
  }

  // Get payment record
  async getPaymentRecord(orderId) {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured. Cannot fetch payment record.');
      return null;
    }

    try {
      // Try to get by order_id first
      let { data, error } = await supabase
        .from('apc_payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      // If not found by order_id, try by manuscript_id (for status checks)
      if (error && error.code === 'PGRST116') {
        ({ data, error } = await supabase
          .from('apc_payments')
          .select('*')
          .eq('manuscript_id', orderId)
          .eq('payment_status', 'SUCCESS')
          .single());
      }

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Record not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch payment record:', error.message);
      return null;
    }
  }

  // Calculate APC amount based on author type and membership
  calculateAPCAmount(authorType, isMember = false) {
    const rates = {
      indian: {
        nonMember: 2000,
        member: 1200
      },
      foreign: {
        nonMember: 40, // USD
        member: 24     // USD
      }
    };

    const rate = rates[authorType];
    if (!rate) {
      throw new Error('Invalid author type. Must be "indian" or "foreign".');
    }

    const amount = isMember ? rate.member : rate.nonMember;
    const currency = authorType === 'indian' ? 'INR' : 'USD';
    const discount = isMember ? 40 : 0;

    return {
      amount,
      currency,
      originalAmount: rate.nonMember,
      discountPercent: discount,
      discountAmount: rate.nonMember - amount,
      isMember
    };
  }

  // Validate GASF membership number
  async validateGASFMembership(membershipNumber) {
    // PHASE 15: SECURITY - Input validation
    if (!membershipNumber || typeof membershipNumber !== 'string') {
      return { isValid: false, message: 'Invalid membership number format' };
    }

    // Sanitize input
    const sanitized = membershipNumber.trim().toUpperCase();
    
    // Basic format validation (example: GASF-YYYY-NNNN)
    const validFormat = /^GASF-\d{4}-\d{4}$/.test(sanitized);
    
    if (!validFormat) {
      return { 
        isValid: false, 
        message: 'Invalid membership number format. Expected format: GASF-YYYY-NNNN' 
      };
    }

    // TODO: Implement actual GASF membership validation against database
    // For now, return mock validation for demo purposes
    console.log('GASF membership validation (mock):', sanitized);
    
    return {
      isValid: true,
      memberType: 'Professional',
      memberName: 'Demo Member',
      membershipNumber: sanitized
    };
  }
}

export const paymentService = new PaymentService();