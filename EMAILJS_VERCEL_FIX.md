# 🔧 EmailJS Not Working on Vercel - Complete Fix Guide

## 🚨 **Problem**: Gmail functionality (EmailJS) not working on Vercel

## ✅ **Step-by-Step Solution**

### **Step 1: Add Environment Variables to Vercel**

Go to **Vercel Dashboard** → Your project → **Settings** → **Environment Variables**

Add these **EXACT** variables:

```
VITE_EMAILJS_PUBLIC_KEY = SYDuB88Ya82DphWbk
VITE_EMAILJS_SERVICE_ID = service_3t96x0h
VITE_EMAILJS_SUBMISSION_TEMPLATE_ID = template_0qwvp8i
VITE_EMAILJS_ACCEPTANCE_TEMPLATE_ID = template_wkpicqg
VITE_FRONTEND_URL = https://your-actual-vercel-url.vercel.app
```

**⚠️ CRITICAL**: Replace `https://your-actual-vercel-url.vercel.app` with your real Vercel URL!

### **Step 2: Redeploy Project**

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. **OR** push any change to GitHub (auto-redeploys)

### **Step 3: Test EmailJS**

Once redeployed, visit:
```
https://your-vercel-url.vercel.app/debug/emailjs
```

This debug page will:
- ✅ Check if all environment variables are properly set
- ✅ Test EmailJS functionality in production
- ✅ Show detailed error logs
- ✅ Verify email sending works

### **Step 4: Verify Results**

**Expected Results:**
- All environment variables show "✅ SET"
- Test button sends email successfully
- Method shows "emailjs" (not "console")
- No errors in browser console

**If Still Not Working:**
1. Check Vercel **Function Logs** for errors
2. Verify EmailJS service status at [emailjs.com](https://emailjs.com)
3. Check your EmailJS templates are properly configured

## 🔧 **Common Issues & Solutions**

### Issue 1: Variables Show "❌ MISSING"
**Solution**: Environment variables not added or deployment not redeployed
- Add variables in Vercel dashboard
- **Must redeploy** after adding variables

### Issue 2: Method shows "console" instead of "emailjs"
**Solution**: EmailJS initialization failed
- Check public key is correct
- Verify service ID exists in your EmailJS account
- Ensure templates exist and are published

### Issue 3: CORS Errors
**Solution**: EmailJS blocked by security policies
- EmailJS should work in production (not a CORS issue)
- Check browser developer tools for specific errors

## 📋 **EmailJS Account Verification**

Login to your EmailJS account and verify:
1. **Service ID**: `service_3t96x0h` exists and is active
2. **Templates exist**:
   - `template_0qwvp8i` (submission notifications)
   - `template_wkpicqg` (acceptance emails)
3. **Public Key**: `SYDuB88Ya82DphWbk` is correct
4. **Templates are published** (not draft)

## ⚡ **Quick Debug Commands**

Open browser console on your Vercel site and run:

```javascript
// Check environment variables
console.log('PUBLIC_KEY:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
console.log('SERVICE_ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);

// Test EmailJS manually
import emailjs from '@emailjs/browser';
emailjs.init('SYDuB88Ya82DphWbk');
emailjs.send('service_3t96x0h', 'template_0qwvp8i', {
  author_name: 'Test Author',
  author_email: 'test@example.com',
  paper_title: 'Test Paper',
  message: 'This is a test email'
}).then(response => {
  console.log('EmailJS Test Success:', response);
}).catch(error => {
  console.error('EmailJS Test Failed:', error);
});
```

## 🎯 **Expected End Result**

After following these steps:
- ✅ Paper submissions send notification emails to `gyanakshar16092026@gmail.com`
- ✅ Admin can send acceptance emails to authors
- ✅ All emails include proper CC to `editor.ijcast.in@gmail.com`
- ✅ No console fallback - real emails are sent
- ✅ Debug page shows all green checkmarks

---

## 🚀 **Action Items for You**

1. **Add environment variables** in Vercel dashboard
2. **Update VITE_FRONTEND_URL** with your real Vercel URL  
3. **Redeploy** the project
4. **Test** using `/debug/emailjs` route
5. **Submit a test paper** to verify email notifications work

The EmailJS functionality should work perfectly after these steps! 📧✅