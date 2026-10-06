@echo off
echo IJCAST Cashfree Production Integration - Deployment Script
echo ============================================================
echo.

echo Setting up Supabase secrets...
echo.

echo Setting Cashfree App ID...
echo Please run this command manually with your actual App ID:
echo supabase secrets set CASHFREE_APP_ID=YOUR_ACTUAL_APP_ID

echo.
echo IMPORTANT: Replace the placeholder below with your actual production secret key
echo Example: supabase secrets set CASHFREE_SECRET_KEY=cfsk_ma_prod_1234567890abcdef_12345678
pause
echo.
echo Please run this command manually with your actual secret key:
echo supabase secrets set CASHFREE_SECRET_KEY=YOUR_ACTUAL_SECRET_KEY
echo.

echo Setting frontend URL...
supabase secrets set FRONTEND_URL=http://localhost:5173

echo.
echo Deploying Edge Functions...
echo.

echo Deploying create-cashfree-order function...
supabase functions deploy create-cashfree-order

echo.
echo Deploying cashfree-webhook function...  
supabase functions deploy cashfree-webhook

echo.
echo Deploying verify-payment function...
supabase functions deploy verify-payment

echo.
echo ============================================================
echo Deployment Complete!
echo.
echo Next steps:
echo 1. Set your Cashfree webhook URL to:
echo    https://ccethswedisoehyxujqt.supabase.co/functions/v1/cashfree-webhook
echo.
echo 2. Test the payment flow on /apc page
echo.
echo 3. Monitor Edge Function logs in Supabase dashboard
echo.
echo 4. Remember to set both CASHFREE_APP_ID and CASHFREE_SECRET_KEY manually
echo ============================================================
pause