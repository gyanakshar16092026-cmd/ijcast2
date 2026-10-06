import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentRoutes from './routes/payment.js';
import webhookRoutes from './routes/webhook.js';
import apcPaymentRoutes from './routes/apc-payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (main project root)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug environment variables
console.log('🔍 Debug Environment Variables:');
console.log('CASHFREE_APP_ID:', process.env.CASHFREE_APP_ID);
console.log('CASHFREE_SECRET_KEY:', process.env.CASHFREE_SECRET_KEY ? process.env.CASHFREE_SECRET_KEY.substring(0, 20) + '...' : 'Not set');
console.log('CASHFREE_ENVIRONMENT:', process.env.CASHFREE_ENVIRONMENT);
console.log('ENV file path:', path.join(__dirname, '..', '.env'));
console.log('');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'IJCAST API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/apc-payment', apcPaymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 IJCAST API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Cashfree Environment: ${process.env.CASHFREE_ENVIRONMENT || 'sandbox'}`);
});

export default app;