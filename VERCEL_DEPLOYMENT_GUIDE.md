# 🚀 IJCAST Full-Stack Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. **Project Status**
- ✅ Code pushed to GitHub: `https://github.com/gyanakshar16092026-cmd/ijcast2.git`
- ✅ Frontend: React + Vite build configuration ready
- ✅ Backend: API converted to Vercel serverless functions
- ✅ Environment variables identified
- ✅ Vercel.json configured for full-stack deployment

### 2. **Required Environment Variables**
These need to be added to Vercel dashboard:

```env
# Frontend Variables (VITE_ prefix)
VITE_SUPABASE_URL=https://wnextwrzgxrrmmuuabtv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZXh0d3J6Z3hycm1tdXVhYnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTIyNTcsImV4cCI6MjEwNjY2ODI1N30.55ryFQ9bsp6YwwQ1Hzu3XUqrJCSGqYF9AgRX1VSdnD0
VITE_CASHFREE_ENVIRONMENT=production
VITE_EMAILJS_PUBLIC_KEY=SYDuB88Ya82DphWbk
VITE_EMAILJS_SERVICE_ID=service_3t96x0h
VITE_EMAILJS_SUBMISSION_TEMPLATE_ID=template_0qwvp8i
VITE_EMAILJS_ACCEPTANCE_TEMPLATE_ID=template_wkpicqg
VITE_FRONTEND_URL=https://your-app-name.vercel.app

# Backend API Variables (No prefix needed)
SUPABASE_SERVICE_KEY=your_service_key_here
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
```

**IMPORTANT**: You'll need to get the Cashfree credentials from your Cashfree dashboard and Supabase service key from your Supabase project settings.

## 🔧 Deployment Steps

### Step 1: Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find your repository: `gyanakshar16092026-cmd/ijcast2`
3. Click **"Import"**

### Step 3: Configure Project Settings
1. **Project Name**: `ijcast-journal` (or your preferred name)
2. **Framework Preset**: Vite (should auto-detect)
3. **Root Directory**: `./` (default)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### Step 4: Add Environment Variables
1. In the deployment configuration, scroll to **"Environment Variables"**
2. Add **ALL** variables from the list above:
   
   **Frontend Variables:**
   - `VITE_SUPABASE_URL` = `https://wnextwrzgxrrmmuuabtv.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `VITE_CASHFREE_ENVIRONMENT` = `production`
   - `VITE_EMAILJS_PUBLIC_KEY` = `SYDuB88Ya82DphWbk`
   - `VITE_EMAILJS_SERVICE_ID` = `service_3t96x0h`
   - `VITE_EMAILJS_SUBMISSION_TEMPLATE_ID` = `template_0qwvp8i`
   - `VITE_EMAILJS_ACCEPTANCE_TEMPLATE_ID` = `template_wkpicqg`
   - `VITE_FRONTEND_URL` = `https://your-app-name.vercel.app`
   
   **Backend Variables (GET THESE FROM YOUR DASHBOARDS):**
   - `SUPABASE_SERVICE_KEY` = Get from Supabase → Settings → API → service_role key
   - `CASHFREE_CLIENT_ID` = Get from Cashfree dashboard
   - `CASHFREE_CLIENT_SECRET` = Get from Cashfree dashboard

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build process to complete (~2-3 minutes)
3. You'll get a deployment URL like: `https://your-app-name.vercel.app`

## 🔄 Post-Deployment Configuration

### Step 1: Update Frontend URL
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `VITE_FRONTEND_URL` with your actual Vercel URL
3. Redeploy the project

### Step 2: Update Supabase Configuration
1. Go to your Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel URL to:
   - **Site URL**: `https://your-app-name.vercel.app`
   - **Redirect URLs**: `https://your-app-name.vercel.app/**`

### Step 3: Update Cashfree Configuration
1. Log into Cashfree dashboard
2. Update webhook URLs to point to your Vercel deployment
3. Update any redirect URLs in payment flows

### Step 4: Test API Functions
After deployment, test these API endpoints:
- ✅ GET `https://your-app-name.vercel.app/api/apc-payment/status/TEST123` - Should return payment status
- ✅ POST `https://your-app-name.vercel.app/api/payment/verify-payment` - Payment verification
- ✅ Homepage loads correctly
- ✅ Paper submission works
- ✅ Email notifications work
- ✅ Payment flow works end-to-end
- ✅ Admin dashboard accessible
- ✅ File uploads work

## 🛠️ Custom Domain (Optional)

### Add Custom Domain
1. In Vercel dashboard → Your project → Settings → Domains
2. Add your domain (e.g., `www.ijcast.in`)
3. Update DNS records as instructed by Vercel
4. Update all environment variables with new domain

## 🔍 Troubleshooting

### Common Issues:

**Build Fails**
- Check if all dependencies are in package.json
- Ensure Node.js version compatibility
- Check for any TypeScript errors

**Environment Variables Not Working**
- Ensure all variables have `VITE_` prefix
- Redeploy after adding new variables
- Check variable names for typos

**Images Not Loading**
- Ensure `herobg.png` and `herobgmobile.png` are in `/public` folder
- Check file paths are correct (`/herobg.png`)

**API Functions Not Working**
- Check environment variables are set correctly
- Verify Cashfree and Supabase credentials
- Check Vercel function logs in dashboard
- Ensure API routes follow `/api/folder/file.js` pattern

**Database Connection Fails**
- Verify `SUPABASE_SERVICE_KEY` is the service role key, not anon key
- Check Supabase URL is correct
- Ensure RLS policies allow service role access

### Quick Fixes:
```bash
# If build fails locally, test first:
npm run build
npm run preview

# Check for any console errors:
# Open browser dev tools after deployment
```

## 📊 Performance Optimization

### Vercel Analytics (Optional)
1. Go to Vercel dashboard → Your project → Analytics
2. Enable Web Vitals monitoring
3. Monitor Core Web Vitals scores

### Speed Optimizations
- ✅ Images optimized (consider WebP format)
- ✅ Code splitting enabled (Vite default)
- ✅ Proper caching headers in vercel.json
- ✅ Security headers configured

## 🚀 Deployment Complete!

Your IJCAST journal is now live on Vercel as a **full-stack application** with:
- ✅ Modern React + Vite frontend
- ✅ Serverless API functions for payment processing
- ✅ Supabase backend integration  
- ✅ Cashfree payment system
- ✅ EmailJS notification system
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Security headers
- ✅ SSL certificate (automatic)
- ✅ Auto-scaling serverless backend

### API Endpoints Available:
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify-payment` - Verify payment
- `POST /api/apc-payment/create-order` - Create APC payment
- `GET /api/apc-payment/verify` - Verify APC payment
- `GET /api/apc-payment/status/[manuscriptId]` - Check payment status
- `POST /api/webhooks/cashfree` - Payment webhooks

### Next Steps:
1. Test all functionality thoroughly
2. Set up monitoring/analytics
3. Configure custom domain if needed
4. Set up automated deployments (already configured via GitHub)

---

**Need Help?** 
- Vercel Documentation: https://vercel.com/docs
- Supabase Integration: https://supabase.com/docs/guides/getting-started/tutorials/with-react