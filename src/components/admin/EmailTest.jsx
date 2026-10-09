import React, { useState } from 'react';
import { emailService } from '../../services/emailService';

const EmailTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [testEmail, setTestEmail] = useState('sailendrakondapalli@gmail.com');
  const [emailType, setEmailType] = useState('acceptance'); // 'acceptance' or 'publication'

  const testEmailSending = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log(`🧪 Testing ${emailType} Email Configuration...`);
      
      // Test submission data
      const testSubmission = {
        submission_id: 'TEST-2026-001',
        author_name: 'Test Author',
        author_email: testEmail,
        paper_title: `Test Paper for ${emailType} Email Configuration`,
        submitted_date: new Date().toISOString()
      };

      let emailResult;
      if (emailType === 'acceptance') {
        // Test acceptance email
        emailResult = await emailService.sendAcceptanceEmail(testSubmission);
      } else {
        // Test publication notification email
        const testArticle = {
          id: 'test-article-001',
          doi: '10.5281/ijcast.test001',
          title: testSubmission.paper_title
        };
        emailResult = await emailService.sendPublicationNotificationEmail(testSubmission, testArticle);
      }
      
      setResult({
        success: emailResult.success,
        method: emailResult.method,
        details: emailResult,
        emailType: emailType,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (error) {
      console.error('Email test failed:', error);
      setResult({
        success: false,
        error: error.message,
        emailType: emailType,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConfiguration = () => {
    const config = {
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,  
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    };

    console.log('📧 EmailJS Configuration:', config);
    return config;
  };

  const config = checkConfiguration();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">📧 Email System Test & Configuration</h3>
      
      {/* Configuration Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Configuration Status:</h4>
        <div className="space-y-1 text-sm">
          <div className={`${config.publicKey ? 'text-green-600' : 'text-red-600'}`}>
            Public Key: {config.publicKey ? '✅ Configured' : '❌ Missing'}
            {config.publicKey && <span className="text-gray-500 ml-2">({config.publicKey.slice(0,20)}...)</span>}
          </div>
          <div className={`${config.serviceId ? 'text-green-600' : 'text-red-600'}`}>
            Service ID: {config.serviceId ? '✅ Configured' : '❌ Missing'}  
            {config.serviceId && <span className="text-gray-500 ml-2">({config.serviceId})</span>}
          </div>
          <div className={`${config.templateId ? 'text-green-600' : 'text-red-600'}`}>
            Template ID: {config.templateId ? '✅ Configured' : '❌ Missing'}
            {config.templateId && <span className="text-gray-500 ml-2">({config.templateId})</span>}
          </div>
        </div>
      </div>

      {/* Email Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email Type to Test:</label>
        <select
          value={emailType}
          onChange={(e) => setEmailType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="acceptance">Acceptance Email (with payment link)</option>
          <option value="publication">Publication Notification (automatic)</option>
        </select>
      </div>

      {/* Test Email Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Email Address:</label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email to test"
        />
      </div>

      {/* Test Button */}
      <button
        onClick={testEmailSending}
        disabled={loading || !testEmail}
        className={`w-full px-4 py-2 rounded font-medium transition-colors ${
          loading || !testEmail
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading 
          ? `📤 Sending ${emailType} Test Email...` 
          : `🧪 Send ${emailType} Test Email`}
      </button>

      {/* Results */}
      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h4 className="font-medium mb-2">
            {result.success ? '✅ Test Result' : '❌ Test Failed'} ({result.emailType})
          </h4>
          <div className="text-sm space-y-1">
            <div>Status: {result.success ? 'Success' : 'Failed'}</div>
            {result.method && <div>Method: {result.method}</div>}
            {result.error && <div className="text-red-600">Error: {result.error}</div>}
            <div className="text-gray-500">Time: {result.timestamp}</div>
          </div>
          
          {result.success && result.method === 'console' && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              📝 Email was logged to console. Check browser developer tools for full email content.
            </div>
          )}
          
          {result.success && result.method === 'emailjs' && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
              📬 Real email sent via EmailJS! Check the recipient's inbox.
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
        <h4 className="font-medium mb-2">🔧 Setup Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create account at <a href="https://www.emailjs.com" className="text-blue-600 underline" target="_blank" rel="noopener">emailjs.com</a></li>
          <li>Create an email service (Gmail, Outlook, etc.)</li>
          <li>Create an email template with variables: to_email, author_name, paper_title, message</li>
          <li>Copy Public Key, Service ID, and Template ID to .env file</li>
          <li>Test both acceptance and publication emails using this component</li>
        </ol>
        
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
          <strong>How it works:</strong>
          <ul className="text-xs mt-1 space-y-1">
            <li>• <strong>Acceptance emails:</strong> Manually sent by admin when paper is accepted</li>
            <li>• <strong>Publication notifications:</strong> Automatically sent when admin publishes paper</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;
