import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft,
  FileText,
  Phone,
  Mail
} from 'lucide-react';

export const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id');
  const reason = searchParams.get('reason') || 'Payment was not completed';

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToAPC = () => {
    navigate('/apc');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Payment Unsuccessful
          </h2>
          <p className="mt-2 text-gray-600">
            {reason}
          </p>
        </div>

        {orderId && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">
              <p><strong>Reference ID:</strong></p>
              <p className="font-mono text-xs break-all">{orderId}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <div className="text-sm text-yellow-800">
              <p className="font-medium">What went wrong?</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Payment may have been cancelled</li>
                <li>Network connectivity issues</li>
                <li>Insufficient funds or card declined</li>
                <li>Session timeout during payment</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="text-sm text-blue-800">
              <p className="font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Need Help?
              </p>
              <div className="mt-2 space-y-1">
                <p>If money was deducted from your account:</p>
                <p className="font-medium">Contact our support team</p>
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  editor@ijrt.in
                </p>
                <p>Include your reference ID for faster assistance</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToAPC}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Try Payment Again
            </button>
            
            <button
              onClick={handleBackToHome}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
