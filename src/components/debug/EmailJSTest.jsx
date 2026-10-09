import React, { useState } from 'react';
import { emailService } from '../../services/emailService';

export const EmailJSTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testEmailJS = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Test with dummy submission data
      const testSubmission = {
        author_name: 'Test Author',
        author_email: 'test@example.com',
        paper_title: 'Test Paper Title',
        submission_id: 'TEST-001',
        abstract: 'This is a test abstract',
        keywords: 'test, debug, emailjs'
      };

      console.log('🧪 Testing EmailJS with environment variables:');
      console.log('PUBLIC_KEY:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'SET' : 'MISSING');
      console.log('SERVICE_ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID ? 'SET' : 'MISSING');
      console.log('SUBMISSION_TEMPLATE:', import.meta.env.VITE_EMAILJS_SUBMISSION_TEMPLATE_ID ? 'SET' : 'MISSING');
      console.log('ACCEPTANCE_TEMPLATE:', import.meta.env.VITE_EMAILJS_ACCEPTANCE_TEMPLATE_ID ? 'SET' : 'MISSING');

      const response = await emailService.sendSubmissionNotification(testSubmission);
      
      setResult({
        success: true,
        method: response.method,
        message: response.method === 'emailjs' ? 'Email sent successfully!' : 'Fallback to console logging',
        details: response
      });

    } catch (error) {
      setResult({
        success: false,
        message: error.message,
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">EmailJS Debug Tool</h2>
      
      <div className="space-y-4">
        <div className="bg-slate-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Variables Status:</h3>
          <div className="text-sm space-y-1">
            <div>PUBLIC_KEY: {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '✅ SET' : '❌ MISSING'}</div>
            <div>SERVICE_ID: {import.meta.env.VITE_EMAILJS_SERVICE_ID ? '✅ SET' : '❌ MISSING'}</div>
            <div>SUBMISSION_TEMPLATE: {import.meta.env.VITE_EMAILJS_SUBMISSION_TEMPLATE_ID ? '✅ SET' : '❌ MISSING'}</div>
            <div>ACCEPTANCE_TEMPLATE: {import.meta.env.VITE_EMAILJS_ACCEPTANCE_TEMPLATE_ID ? '✅ SET' : '❌ MISSING'}</div>
          </div>
        </div>

        <button
          onClick={testEmailJS}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Testing EmailJS...' : 'Test EmailJS Functionality'}
        </button>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h4 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              Test Result: {result.success ? 'SUCCESS' : 'FAILED'}
            </h4>
            <p className={`${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
            <div className="mt-2 text-sm">
              <strong>Method:</strong> {result.details?.method || 'Unknown'}
            </div>
          </div>
        )}

        <div className="text-sm text-slate-600 bg-amber-50 p-3 rounded-lg">
          <strong>Debug Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Check that all environment variables show "✅ SET"</li>
            <li>Click "Test EmailJS Functionality"</li>
            <li>Check browser console for detailed logs</li>
            <li>If using "console" method, environment variables are missing</li>
            <li>If using "emailjs" method, email should be sent successfully</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
