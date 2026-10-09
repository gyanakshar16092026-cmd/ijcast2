import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  Mail,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { PaymentService } from '../services/paymentService';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [verificationState, setVerificationState] = useState('verifying'); // verifying, success, failed, error
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setVerificationState('error');
      setError('Order ID not found in URL');
      return;
    }

    verifyPayment();
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      setVerificationState('verifying');
      
      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await PaymentService.verifyPayment(orderId);
      
      if (result.success) {
        setPaymentData(result.data);
        
        // Set final state based on payment status
        switch (result.data.paymentStatus) {
          case 'PAID':
            setVerificationState('success');
            break;
          case 'FAILED':
            setVerificationState('failed');
            break;
          case 'CANCELLED':
            setVerificationState('failed');
            setError('Payment was cancelled');
            break;
          default:
            setVerificationState('verifying');
            // Retry verification after a delay
            setTimeout(verifyPayment, 3000);
        }
      } else {
        setVerificationState('error');
        setError(result.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setVerificationState('error');
      setError(err.message || 'Failed to verify payment status');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToAPC = () => {
    navigate('/apc');
  };

  // Verifying state
  if (verificationState === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <Loader2 className="mx-auto h-16 w-16 text-blue-600 animate-spin" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Verifying Payment
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we confirm your payment with the bank...
            </p>
          </div>
          
          {paymentData && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500 space-y-2">
                <p><strong>Order ID:</strong> {paymentData.orderId}</p>
                <p><strong>Amount:</strong> {paymentData.orderCurrency} {paymentData.orderAmount}</p>
                <p><strong>Manuscript:</strong> {paymentData.manuscriptId}</p>
                <p><strong>Status:</strong> {paymentData.paymentStatus}</p>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500">
            This may take a few seconds. Please do not close this window.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (verificationState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Payment Successful!
            </h2>
            <p className="mt-2 text-gray-600">
              Your Article Processing Charge (APC) payment has been confirmed.
            </p>
          </div>

          {paymentData && (
            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Payment Details
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Order ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{paymentData.orderId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{paymentData.transactionId || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Amount Paid</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {paymentData.orderCurrency} {paymentData.orderAmount}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="mt-1 text-sm text-gray-900">{paymentData.paymentMethod || 'Online Payment'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Manuscript ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{paymentData.manuscriptId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Author</label>
                  <p className="mt-1 text-sm text-gray-900">{paymentData.authorName}</p>
                </div>
                
                {paymentData.paymentTime && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Payment Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(paymentData.paymentTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="text-green-800 font-medium">What happens next?</p>
                      <p className="text-green-700 mt-1">
                        A payment confirmation email has been sent to your registered email address. 
                        Your manuscript will now proceed to the editorial review process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
            
            <button
              onClick={handleBackToAPC}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Submit Another Manuscript
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed or Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {verificationState === 'failed' ? 'Payment Failed' : 'Verification Error'}
          </h2>
          <p className="mt-2 text-gray-600">
            {error || 'There was an issue with your payment. Please try again.'}
          </p>
        </div>

        {paymentData && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 space-y-2">
              <p><strong>Order ID:</strong> {paymentData.orderId}</p>
              <p><strong>Amount:</strong> {paymentData.orderCurrency} {paymentData.orderAmount}</p>
              <p><strong>Manuscript:</strong> {paymentData.manuscriptId}</p>
              <p><strong>Status:</strong> {paymentData.paymentStatus}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Need Help?</p>
              <p className="mt-1">
                If money has been deducted from your account, please contact our support team 
                with your order ID for assistance.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToAPC}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              Try Payment Again
            </button>
            
            <button
              onClick={handleBackToHome}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
