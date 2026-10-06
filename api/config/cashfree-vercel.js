// Vercel-compatible Cashfree configuration
export const cashfreeConfig = {
  clientId: process.env.VITE_CASHFREE_CLIENT_ID || process.env.CASHFREE_CLIENT_ID,
  clientSecret: process.env.VITE_CASHFREE_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET,
  environment: process.env.VITE_CASHFREE_ENVIRONMENT || 'sandbox',
  apiUrl: process.env.VITE_CASHFREE_ENVIRONMENT === 'production' 
    ? 'https://api.cashfree.com' 
    : 'https://sandbox.cashfree.com'
};