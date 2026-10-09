// Frontend Payment Service for IJRT APC Payments
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export class PaymentService {
  // Calculate APC amount based on author type and membership
  static calculateAPC(authorType, isMember = false) {
    const rates = {
      indian: {
        nonMember: 2000,
        member: 1200,
        currency: 'INR'
      },
      foreign: {
        nonMember: 40,
        member: 24,
        currency: 'USD'
      }
    };

    const rate = rates[authorType];
    if (!rate) {
      throw new Error('Invalid author type. Must be "indian" or "foreign".');
    }

    const amount = isMember ? rate.member : rate.nonMember;
    const discount = isMember ? 40 : 0;

    return {
      amount,
      currency: rate.currency,
      originalAmount: rate.nonMember,
      discountPercent: discount,
      discountAmount: rate.nonMember - amount,
      isMember
    };
  }

  // Create payment order using Supabase Edge Function
  static async createOrder(orderData) {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Determine return URL (must be HTTPS for Cashfree production)
      let returnUrl;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // For local development, use a placeholder HTTPS URL
        // In production, Cashfree will redirect to this URL after payment
        returnUrl = 'https://example.com/payment/success?order_id=' + orderData.manuscriptId + '_' + Date.now();
        console.warn('⚠️ Running locally - using placeholder return URL. Deploy to HTTPS domain for production.');
      } else {
        // For production deployment (HTTPS domain)
        returnUrl = `${window.location.origin}/payment/success?order_id=${orderData.manuscriptId}_${Date.now()}`;
      }
      
      // Add return URL to order data
      const orderWithReturnUrl = {
        ...orderData,
        returnUrl
      };
      
      console.log('📤 Sending to Edge Function:', {
        ...orderWithReturnUrl,
        // Don't log sensitive data, just structure
        authorEmail: '***',
        authorPhone: '***'
      });
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: orderWithReturnUrl,
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 
            'Authorization': `Bearer ${session.access_token}` 
          })
        }
      });

      console.log('📥 Edge Function Response:', { data, error });

      if (error) {
        console.error('Edge function error details:', {
          message: error.message,
          name: error.name,
          context: error.context,
          details: error
        });
        
        // Try to get more details from the response
        if (data) {
          console.error('Error response data:', data);
        }
        
        throw new Error(error.message || 'Failed to create payment order');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment order creation failed');
      }

      return data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  }

  // Verify payment status using Supabase Edge Function
  static async verifyPayment(orderId) {
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { orderId },
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { 
            'Authorization': `Bearer ${session.access_token}` 
          })
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to verify payment');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }

  // Load Cashfree SDK
  static loadCashfreeSDK() {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        console.log('✅ Cashfree SDK already loaded');
        resolve(window.Cashfree);
        return;
      }

      console.log('📦 Loading Cashfree SDK...');
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => {
        if (window.Cashfree) {
          console.log('✅ Cashfree SDK loaded successfully');
          console.log('SDK version:', typeof window.Cashfree);
          resolve(window.Cashfree);
        } else {
          console.error('❌ Cashfree SDK loaded but window.Cashfree is undefined');
          reject(new Error('Failed to load Cashfree SDK'));
        }
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Cashfree SDK script:', error);
        reject(new Error('Failed to load Cashfree SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Initiate Cashfree payment
  static async initiateCashfreePayment(paymentData) {
    try {
      // Load Cashfree SDK
      const Cashfree = await this.loadCashfreeSDK();

      // Initialize Cashfree with the correct v3 API
      const cashfree = Cashfree({
        mode: 'production' // Use 'production' for live payments
      });

      // Payment configuration for v3 SDK
      const checkoutOptions = {
        paymentSessionId: paymentData.paymentSessionId,
        returnUrl: `${window.location.origin}/payment/success?order_id=${paymentData.orderId}`,
        redirectTarget: '_self' // Redirect in same window
      };

      console.log('🚀 Initiating Cashfree payment with options:', checkoutOptions);

      // Initiate payment - v3 SDK uses checkout() directly
      const result = await cashfree.checkout(checkoutOptions);
      
      console.log('✅ Cashfree payment result:', result);
      return result;
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  }

  // Handle payment redirect (for success/failure pages)
  static async handlePaymentRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const status = urlParams.get('order_status');

    if (!orderId) {
      throw new Error('Order ID not found in URL');
    }

    // Verify payment status with backend
    const verification = await this.verifyPayment(orderId);
    
    return {
      orderId,
      urlStatus: status,
      verifiedStatus: verification.data.paymentStatus,
      paymentData: verification.data
    };
  }

  // Format currency for display
  static formatCurrency(amount, currency) {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
    return `${currency} ${amount}`;
  }

  // Validate form data
  static validatePaymentForm(formData) {
    const errors = {};

    // Required fields
    if (!formData.authorName?.trim()) {
      errors.authorName = 'Author name is required';
    }

    if (!formData.authorEmail?.trim()) {
      errors.authorEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.authorEmail)) {
      errors.authorEmail = 'Invalid email format';
    }

    if (!formData.authorPhone?.trim()) {
      errors.authorPhone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.authorPhone.replace(/\s+/g, ''))) {
      errors.authorPhone = 'Invalid phone number format';
    }

    if (!formData.manuscriptId?.trim()) {
      errors.manuscriptId = 'Manuscript ID is required';
    }

    if (!formData.authorType) {
      errors.authorType = 'Author type is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

