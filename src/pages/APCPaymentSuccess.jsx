import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Clock } from 'lucide-react';

export const APCPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order_id');
  const orderToken = searchParams.get('order_token');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // Verify payment with your backend
        const response = await fetch(`/api?action=apc-verify&order_id=${orderId}&order_token=${orderToken || ''}`);
        const result = await response.json();
        
        if (result.success) {
          setPaymentDetails(result.paymentDetails);
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, orderToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-amber-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Verifying payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center text-white">
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your Article Processing Charge payment has been completed</p>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Payment Details */}
            {paymentDetails && (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Transaction ID:</span>
                    <p className="font-mono font-semibold">{paymentDetails.paymentId}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Amount Paid:</span>
                    <p className="font-semibold text-green-600">{paymentDetails.currency} {paymentDetails.amount}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Manuscript ID:</span>
                    <p className="font-semibold">{paymentDetails.manuscriptId}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Payment Date:</span>
                    <p className="font-semibold">{new Date(paymentDetails.paidAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">What Happens Next?</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-800">Payment Verified</h4>
                    <p className="text-sm text-emerald-700">Your payment has been successfully processed and verified.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Publication Processing</h4>
                    <p className="text-sm text-amber-700">Our editorial team will now process your paper for publication. This typically takes 1-2 business days.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <ArrowRight className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Publication Notice</h4>
                    <p className="text-sm text-blue-700">You'll receive an email confirmation with your paper's DOI and publication link once it's live on the website.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-slate-900 text-white rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Important Information</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Your paper will be published with <strong>free open access</strong> - accessible to everyone forever</li>
                <li>• A unique DOI (Digital Object Identifier) will be assigned to your paper</li>
                <li>• The final published version will be available for download in PDF format</li>
                <li>• Your paper will be indexed in our journal archives and search systems</li>
                <li>• Copyright ownership remains with the authors under Creative Commons licensing</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/latest-papers')}
                className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <span>Browse Published Papers</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
              >
                Return to Home
              </button>
            </div>

            {/* Contact Information */}
            <div className="text-center pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">
                Questions about your publication? Contact us at:
              </p>
              <div className="space-y-1">
                <div>
                  <span className="text-slate-500 text-xs">Primary: </span>
                  <a href="mailto:editor.ijcast.in@gmail.com" className="text-amber-600 hover:underline font-semibold">
                    editor.ijcast.in@gmail.com
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Administrative: </span>
                  <a href="mailto:gyanakshar16092026@gmail.com" className="text-amber-600 hover:underline font-semibold">
                    gyanakshar16092026@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};