# IJCAST Cashfree Production Integration - Deployment Instructions

## Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link to your project: `supabase link --project-ref ccethswedisoehyxujqt`

## 1. Set Production Secrets

Set your Cashfree production credentials as Supabase secrets:

```bash
# Set Cashfree App ID (use your actual production App ID from Cashfree dashboard)
supabase secrets set CASHFREE_APP_ID=your_actual_production_app_id

# Set Cashfree Secret Key (replace with your actual production secret key)
supabase secrets set CASHFREE_SECRET_KEY=your_actual_production_secret_key

# Set frontend URL
supabase secrets set FRONTEND_URL=http://localhost:5173

# For production deployment, update with your actual domain
# supabase secrets set FRONTEND_URL=https://yourdomain.com
```

## 2. Deploy Edge Functions

Deploy all Edge Functions to Supabase:

```bash
# Deploy create order function
supabase functions deploy create-cashfree-order

# Deploy webhook handler
supabase functions deploy cashfree-webhook

# Deploy payment verification
supabase functions deploy verify-payment
```

## 3. Update RLS Policies (if needed)

The apc_payments table already has appropriate RLS policies. Edge Functions run with service role permissions.

## 4. Configure Cashfree Webhook URL

In your Cashfree dashboard, set the webhook URL to:

**Production:** `https://ccethswedisoehyxujqt.supabase.co/functions/v1/cashfree-webhook`

**Local development:** Use ngrok or similar to expose your local Supabase functions.

## 5. Test the Integration

1. Start your React app: `npm run dev`
2. Go to `/apc` page
3. Fill the APC payment form
4. Complete a test payment
5. Verify the webhook is received and processed

## 6. Environment Variables

Your `.env` file should only contain:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ccethswedisoehyxujqt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Cashfree Configuration (Frontend Only)
VITE_CASHFREE_ENVIRONMENT=production

# Frontend Configuration
VITE_FRONTEND_URL=http://localhost:5173
```

## 7. Security Checklist

- ✅ Secret key is stored in Supabase secrets (not in .env)
- ✅ Frontend never receives secret key
- ✅ Server-side amount validation implemented
- ✅ Webhook signature verification enabled
- ✅ RLS policies prevent unauthorized access
- ✅ Idempotent webhook processing
- ✅ Production Cashfree endpoint used

## 8. Monitoring

Monitor your Edge Functions in Supabase dashboard:
- Functions -> Logs
- Check for any errors or failures
- Monitor webhook delivery success

## 9. Production Deployment

When deploying to production:

1. Update `FRONTEND_URL` secret to your production domain
2. Update Cashfree webhook URL to production Edge Function URL
3. Test thoroughly in production environment
4. Monitor for webhook delivery issues

## 10. Troubleshooting

If payments fail:

1. Check Edge Function logs in Supabase dashboard
2. Verify Cashfree credentials are correct
3. Ensure webhook URL is accessible
4. Check database permissions and RLS policies
5. Verify payment amounts match server-side calculations

## Support

If you encounter issues:
- Check Supabase Edge Function logs
- Verify Cashfree dashboard for transaction status
- Contact Cashfree support for payment gateway issues