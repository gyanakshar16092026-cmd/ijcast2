# 📧 EmailJS Setup Guide for IJCAST

EmailJS allows you to send emails directly from your React app without a backend server.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up with `editor.ijcast.in@gmail.com` or `gyanakshar16092026@gmail.com`
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, click **"Add New Service"**
2. Choose **Gmail** (recommended)
3. Connect your Gmail account (`editor.ijcast.in@gmail.com`)
4. Note down the **Service ID** (looks like `service_xxxxxxx`)

### Step 3: Create Email Template
1. Click **"Create New Template"**
2. Use this template content:

**Template Name:** `ijcast_acceptance_email`

**Subject:** `Paper Accepted - {{paper_title}} - IJCAST`

**Content:**
```
Dear {{author_name}},

🎉 Congratulations! Your paper has been ACCEPTED for publication!

Paper Title: "{{paper_title}}"
Submission ID: {{submission_id}}

NEXT STEPS:
1. Complete APC payment (₹2000 for Indian authors)
2. Sign copyright transfer agreement
3. Your paper will be published immediately after payment

Complete payment here: {{payment_url}}

Contact us:
• Primary: {{primary_email}}
• Administrative: {{admin_email}}

{{message}}

Best regards,
Editorial Team
IJCAST - International Journal of Commerce, Arts, Science and Technology
```

3. Save the template and note the **Template ID** (looks like `template_xxxxxxx`)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. Copy the **Public Key** (looks like `xxxxxxxxxxxxxx`)

### Step 5: Update .env File
```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
```

### Step 6: Test It!
1. Restart your React app: `npm run dev`
2. Go to Admin → Submissions
3. Change a submission status to "ACCEPTED"
4. Click "Send Acceptance Email"
5. ✅ Real email should be sent!

---

## 📋 EmailJS Template Variables

The system automatically fills these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{author_name}}` | Author's name | Dr. John Smith |
| `{{author_email}}` | Author's email | john@university.edu |
| `{{paper_title}}` | Paper title | Advanced AI Research |
| `{{submission_id}}` | Submission ID | RJ-2025-1234 |
| `{{payment_url}}` | Payment link | /apc-payment?submission=... |
| `{{primary_email}}` | Primary contact | editor.ijcast.in@gmail.com |
| `{{admin_email}}` | Admin contact | gyanakshar16092026@gmail.com |
| `{{message}}` | Full message content | Complete acceptance text |

---

## 🔧 Advanced Configuration

### Multiple Recipients (CC/BCC)
In your EmailJS template settings:
- **To:** `{{to_email}}` (author's email)
- **CC:** `editor.ijcast.in@gmail.com,gyanakshar16092026@gmail.com`

### Custom From Name
- **From Name:** `IJCAST Editorial Team`
- **From Email:** `editor.ijcast.in@gmail.com`

### Email Limits
- **Free Plan:** 200 emails/month
- **Paid Plans:** More emails + better support
- **Recommended:** Start with free plan, upgrade if needed

---

## 🔀 Alternative: Server-Side Email

If you prefer server-side email sending, you can use:

### Option 1: SendGrid API
```javascript
// Already implemented in emailService.js
await emailService.sendViaSendGrid(submission);
```

### Option 2: Supabase Edge Function
```sql
-- Create edge function for email sending
-- Use Supabase built-in email integration
```

---

## ✅ Verification Checklist

- [ ] EmailJS account created
- [ ] Gmail service connected
- [ ] Email template created with all variables
- [ ] Public key, service ID, template ID added to .env
- [ ] React app restarted
- [ ] Test email sent successfully
- [ ] Both emails (primary + admin) receive copy

---

## 🚨 Troubleshooting

### "EmailJS not configured" message
- Check .env file has all 3 EmailJS variables
- Restart your development server

### Emails not sending
- Verify EmailJS service is connected to Gmail
- Check Gmail account has 2FA enabled
- Ensure template variables match exactly

### Gmail security issues
- Enable "Less secure app access" if needed
- Use App Passwords instead of main password
- Check Gmail spam folder

---

## 📞 Support

- **EmailJS Help:** [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **IJCAST Support:** editor.ijcast.in@gmail.com

Once configured, your acceptance emails will be sent automatically to authors with payment links! 🎯