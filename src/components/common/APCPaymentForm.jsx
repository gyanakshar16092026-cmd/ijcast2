import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Calculator
} from 'lucide-react';
import { PaymentService } from '../../services/paymentService';

export const APCPaymentForm = () => {
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    authorPhone: '',
    manuscriptId: '',
    authorType: 'indian',
    gasfMembership: ''
  });

  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Calculate APC amount when form data changes
  useEffect(() => {
    if (formData.authorType) {
      const isMember = Boolean(formData.gasfMembership?.trim());
      const calc = PaymentService.calculateAPC(formData.authorType, isMember);
      setCalculation(calc);
    }
  }, [formData.authorType, formData.gasfMembership]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.authorName.trim()) {
      newErrors.authorName = 'Author name is required';
    } else if (formData.authorName.trim().length < 2) {
      newErrors.authorName = 'Author name must be at least 2 characters';
    }

    if (!formData.authorEmail.trim()) {
      newErrors.authorEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.authorEmail)) {
      newErrors.authorEmail = 'Please enter a valid email address';
    }

    if (!formData.authorPhone.trim()) {
      newErrors.authorPhone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.authorPhone.replace(/\s+/g, ''))) {
      newErrors.authorPhone = 'Please enter a valid phone number';
    }

    if (!formData.manuscriptId.trim()) {
      newErrors.manuscriptId = 'Manuscript ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!calculation) {
      alert('Unable to calculate payment amount. Please try again.');
      return;
    }

    setLoading(true);
    setPaymentStatus('initiating');

    try {
      // Create payment order
      const orderData = {
        ...formData,
        amount: calculation.amount,
        currency: calculation.currency
      };

      const response = await PaymentService.createOrder(orderData);
      
      if (response.success) {
        setPaymentStatus('redirecting');
        
        // Load Cashfree SDK and initiate payment
        if (response.data.paymentSessionId) {
          // Use SDK integration
          await PaymentService.initiateCashfreePayment(response.data);
        } else {
          throw new Error('Payment session not created. Please try again.');
        }
      } else {
        throw new Error(response.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('error');
      alert(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
        <p className="text-slate-600">Your APC payment has been processed successfully.</p>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Payment Failed</h3>
        <p className="text-slate-600">There was an issue processing your payment.</p>
        <button
          onClick={() => setPaymentStatus(null)}
          className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Status Messages */}
      {paymentStatus && (
        <div className={`p-4 rounded-lg border ${
          paymentStatus === 'initiating' 
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : paymentStatus === 'redirecting'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {paymentStatus === 'initiating' && <Loader2 className="w-4 h-4 animate-spin" />}
            {paymentStatus === 'redirecting' && <CheckCircle2 className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {paymentStatus === 'initiating' && 'Creating payment order...'}
              {paymentStatus === 'redirecting' && 'Redirecting to payment gateway...'}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handlePayment} className="space-y-6">
        {/* Author Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-600" />
            Author Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                value={formData.authorName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.authorName ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.authorName && (
                <p className="text-red-500 text-xs mt-1">{errors.authorName}</p>
              )}
            </div>

            <div>
              <label htmlFor="authorEmail" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="authorEmail"
                name="authorEmail"
                value={formData.authorEmail}
                onChange={handleInputChange}
                placeholder="author@example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.authorEmail ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.authorEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.authorEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="authorPhone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="authorPhone"
                name="authorPhone"
                value={formData.authorPhone}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.authorPhone ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.authorPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.authorPhone}</p>
              )}
            </div>

            <div>
              <label htmlFor="manuscriptId" className="block text-sm font-medium text-slate-700 mb-1">
                Manuscript ID *
              </label>
              <input
                type="text"
                id="manuscriptId"
                name="manuscriptId"
                value={formData.manuscriptId}
                onChange={handleInputChange}
                placeholder="e.g., IJCAST-2024-001"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.manuscriptId ? 'border-red-300' : 'border-slate-300'
                }`}
              />
              {errors.manuscriptId && (
                <p className="text-red-500 text-xs mt-1">{errors.manuscriptId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Author Type & Membership */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-slate-600" />
            Payment Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorType" className="block text-sm font-medium text-slate-700 mb-1">
                Author Type *
              </label>
              <select
                id="authorType"
                name="authorType"
                value={formData.authorType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="indian">🇮🇳 Indian Author</option>
                <option value="foreign">🌍 Foreign Author</option>
              </select>
            </div>

            <div>
              <label htmlFor="gasfMembership" className="block text-sm font-medium text-slate-700 mb-1">
                GASF Membership Number
                <span className="text-xs text-slate-500 ml-1">(optional, for 40% discount)</span>
              </label>
              <input
                type="text"
                id="gasfMembership"
                name="gasfMembership"
                value={formData.gasfMembership}
                onChange={handleInputChange}
                placeholder="Enter membership number"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Calculation */}
        {calculation && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h5 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment Summary
            </h5>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Author Type:</span>
                <span className="font-medium">
                  {formData.authorType === 'indian' ? 'Indian' : 'Foreign'}
                </span>
              </div>
              
              {calculation.isMember && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Original Amount:</span>
                    <span className="line-through text-slate-400">
                      {calculation.currency} {calculation.originalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-600">GASF Discount (40%):</span>
                    <span className="text-emerald-600">
                      -{calculation.currency} {calculation.discountAmount}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-300">
                <span>Total Amount:</span>
                <span className="text-emerald-600">
                  {calculation.currency} {calculation.amount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading || !calculation}
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            {loading ? 'Processing...' : `Pay ${calculation ? calculation.currency + ' ' + calculation.amount : ''}`}
          </button>
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>🔒 Secure payment processing powered by Cashfree</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </form>
    </div>
  );
};
