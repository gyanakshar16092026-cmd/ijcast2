import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

export const APCPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [error, setError] = useState('');

  const submissionId = searchParams.get('submission');
  const authorEmail = searchParams.get('email');

  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: authorEmail || '',
    authorPhone: '',
    manuscriptId: submissionId || '',
    gasfMembership: '',
    authorType: 'indian', // indian or foreign
    isMember: false,
    agreeTerms: false,
    agreeCopyright: false
  });

  const [paymentDetails, setPaymentDetails] = useState({
    amount: 2000,
    currency: 'INR',
    discountPercent: 0,
    discountAmount: 0,
    finalAmount: 2000
  });

  useEffect(() => {
    if (!submissionId || !authorEmail) {
      setError('Invalid payment link. Missing submission ID or email.');
    }
  }, [submissionId, authorEmail]);

  useEffect(() => {
    // Recalculate payment amount when membership changes
    const baseAmount = formData.authorType === 'indian' ? 2000 : 40;
    const currency = formData.authorType === 'indian' ? 'INR' : 'USD';
    
    if (formData.isMember) {
      const discountAmount = Math.round(baseAmount * 0.4); // 40% discount for GASF members
      const finalAmount = baseAmount - discountAmount;
      
      setPaymentDetails({
        amount: baseAmount,
        currency,
        discountPercent: 40,
        discountAmount,
        finalAmount
      });
    } else {
      setPaymentDetails({
        amount: baseAmount,
        currency,
        discountPercent: 0,
        discountAmount: 0,
        finalAmount: baseAmount
      });
    }
  }, [formData.authorType, formData.isMember]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-check membership if GASF number is provided
    if (name === 'gasfMembership' && value.trim()) {
      setFormData(prev => ({ ...prev, isMember: true }));
    }
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    
    if (!formData.authorName || !formData.authorEmail || !formData.authorPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!formData.agreeTerms || !formData.agreeCopyright) {
      setError('Please accept the terms and copyright agreement.');
      return;
    }

    setPaymentStep(2);
  };

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Call your API to create Cashfree order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: `APC-${submissionId}-${Date.now()}`,
          orderAmount: paymentDetails.finalAmount,
          customerName: formData.authorName,
          customerEmail: formData.authorEmail,
          customerPhone: formData.authorPhone,
          manuscriptId: formData.manuscriptId,
          gasfMembership: formData.gasfMembership,
          isMember: formData.isMember,
          discountApplied: paymentDetails.discountPercent,
          returnUrl: `${window.location.origin}/apc-payment/success`,
          orderNote: `APC Payment for manuscript ${submissionId}`
        })
      });

      const result = await response.json();
      
      if (result.success && result.paymentSessionId) {
        // Redirect to Cashfree payment page
        window.location.href = result.payment_link || `https://payments.cashfree.com/order/#${result.paymentSessionId}`;
      } else {
        throw new Error(result.message || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error && !submissionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Invalid Payment Link</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Article Processing Charge Payment</h1>
          <p className="text-slate-600">Complete your payment to publish your accepted paper</p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Paper Accepted - ID: {submissionId}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${paymentStep >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${paymentStep >= 2 ? 'bg-amber-600' : 'bg-slate-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${paymentStep >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${paymentStep >= 3 ? 'bg-amber-600' : 'bg-slate-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${paymentStep >= 3 ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
              3
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Step 1: Author Details & Agreement */}
          {paymentStep === 1 && (
            <form onSubmit={handleSubmitDetails} className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Author Details & Agreement</h2>

              {/* Author Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Author Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="authorName"
                    required
                    value={formData.authorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="authorEmail"
                    required
                    value={formData.authorEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="authorPhone"
                    required
                    value={formData.authorPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Manuscript ID
                  </label>
                  <input
                    type="text"
                    name="manuscriptId"
                    value={formData.manuscriptId}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>
              </div>

              {/* Author Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Author Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="authorType"
                      value="indian"
                      checked={formData.authorType === 'indian'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Indian Author (₹2000)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="authorType"
                      value="foreign"
                      checked={formData.authorType === 'foreign'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Foreign Author ($40)</span>
                  </label>
                </div>
              </div>

              {/* GASF Membership */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  GASF Membership Number (Optional - 40% discount)
                </label>
                <input
                  type="text"
                  name="gasfMembership"
                  value={formData.gasfMembership}
                  onChange={handleInputChange}
                  placeholder="Enter GASF membership number for discount"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {formData.gasfMembership && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ 40% GASF member discount will be applied
                  </p>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Article Processing Charge:</span>
                    <span>{paymentDetails.currency} {paymentDetails.amount}</span>
                  </div>
                  {formData.isMember && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>GASF Member Discount (40%):</span>
                        <span>-{paymentDetails.currency} {paymentDetails.discountAmount}</span>
                      </div>
                      <hr className="border-slate-300" />
                    </>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>{paymentDetails.currency} {paymentDetails.finalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                  <span className="text-sm text-slate-700">
                    I agree to the <strong>Terms and Conditions</strong> and understand that the Article Processing Charge is non-refundable once the paper is published.
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeCopyright"
                    checked={formData.agreeCopyright}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                  <span className="text-sm text-slate-700">
                    I agree to the <strong>Copyright Transfer Agreement</strong> and confirm that I have the authority to transfer copyright for this work to IJCAST.
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Payment */}
          {paymentStep === 2 && (
            <div className="p-8 text-center">
              <CreditCard className="w-16 h-16 text-amber-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Complete Payment</h2>
              
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount to Pay:</span>
                    <span className="font-bold text-lg">{paymentDetails.currency} {paymentDetails.finalAmount}</span>
                  </div>
                  {formData.isMember && (
                    <div className="text-sm text-green-600">
                      (40% GASF member discount applied)
                    </div>
                  )}
                </div>
              </div>

              <p className="text-slate-600 mb-6">
                Click below to complete payment via Cashfree secure payment gateway
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setPaymentStep(1)}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={initiatePayment}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{loading ? 'Processing...' : 'Pay Now'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};