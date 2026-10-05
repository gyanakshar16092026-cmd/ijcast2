# IJCAST Journal - Implementation & Deployment Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Testing Locally](#testing-locally)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### What's Already Done ✅
- ✅ Navigation updated to new structure
- ✅ Publication frequency changed to Bimonthly (6 issues/year)
- ✅ Auto-generation of 6 issues when creating a volume
- ✅ Complete paper submission form (`/submit-paper`)
- ✅ Homepage redesigned with hero cards and statistics
- ✅ Admin submissions manager created
- ✅ All existing functionality preserved

### What You Need to Do Next 📝
1. Create database tables in Supabase
2. Set up storage buckets
3. Connect submission form to database
4. Test the workflow
5. Deploy to production

---

## 💾 Database Setup

### Step 1: Run SQL Schema

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your IJCAST project
   - Navigate to **SQL Editor**

2. **Execute the SQL Script**
   - Open the file `DATABASE_SCHEMA.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run** button

This will create:
- `submissions` table
- `submission_authors` table
- `contact_messages` table
- All necessary indexes
- RLS policies
- Helper functions

### Step 2: Create Storage Buckets

1. **Navigate to Storage** in Supabase Dashboard

2. **Create `manuscripts` bucket:**
   - Name: `manuscripts`
   - Public: **No** (private)
   - File size limit: 10 MB
   - Allowed MIME types: 
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. **Create `published-papers` bucket:**
   - Name: `published-papers`
   - Public: **Yes**
   - File size limit: 10 MB
   - Allowed MIME types:
     - `application/pdf`

4. **Verify `journal-images` bucket exists** (should already exist)
   - If not, create it:
     - Name: `journal-images`
     - Public: **Yes**
     - File size limit: 5 MB
     - Allowed MIME types:
       - `image/jpeg`
       - `image/png`
       - `image/webp`

### Step 3: Configure Storage Policies

For the `manuscripts` bucket, add these policies:

```sql
-- Allow public insert
CREATE POLICY "Allow public upload manuscripts" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'manuscripts');

-- Allow admin read
CREATE POLICY "Allow admin read manuscripts" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'manuscripts');
```

---

## 🧪 Testing Locally

### 1. Test Auto-Generated Issues

1. **Login to Admin Panel:**
   - Go to `http://localhost:5173/admin/login`
   - Email: `gyanaksharsanskritifoundation@gmail.com`
   - Password: `gyanaksharsanskritifoundation@.com`

2. **Create a New Volume:**
   - Click "Volume Management" in sidebar
   - Click "Add New Volume"
   - Fill in:
     - Volume Number: 2
     - Year: 2026
     - Status: Active
   - Click "Save Volume"

3. **Verify 6 Issues Were Created:**
   - Click "Issue / Number Management" in sidebar
   - Select "Volume 2 (2026)" from dropdown
   - You should see 6 issues:
     - Number 1 – Jan–Feb
     - Number 2 – Mar–Apr
     - Number 3 – May–Jun
     - Number 4 – Jul–Aug
     - Number 5 – Sep–Oct
     - Number 6 – Nov–Dec

### 2. Test Paper Submission Form

1. **Navigate to Submission Page:**
   - Go to homepage
   - Click "Submit Your Paper" card (or button in navbar)
   - OR go directly to `http://localhost:5173/submit-paper`

2. **Fill Out the Form:**
   - Enter all required fields
   - Add at least one co-author
   - Upload a test PDF file (manuscript)
   - Check the consent checkbox

3. **Submit:**
   - Click "Submit Manuscript"
   - Wait for confirmation page
   - Note the Submission ID (e.g., RJ-2026-0001)

4. **Verify in Admin:**
   - Go to Admin Panel
   - Click "Paper Submissions"
   - You should see your submission

### 3. Test Homepage

1. **Check Two Hero Cards:**
   - Visit homepage
   - Click "Submit Your Paper" → should go to `/submit-paper`
   - Go back, click "View Published Papers" → should go to `/archives`

2. **Verify Statistics Section:**
   - Check that statistics show real numbers from database
   - e-ISSN should display
   - Publishing Frequency should show "Bimonthly (6 Issues Per Year)"
   - Current Volume should show correct volume and year
   - Total Published Papers should show actual count

3. **Check Latest Issue Section:**
   - Should display if you have published issues
   - Shows volume, number, month range, year

4. **Check Latest Papers:**
   - Should show most recent published papers
   - If no papers, shows empty state

### 4. Test Navigation

1. **Desktop:**
   - Verify all menu items work
   - "Submit Your Paper" button should be prominent
   - No dropdown menus

2. **Mobile:**
   - Open mobile view (< 768px width)
   - Click hamburger menu
   - Verify all links work
   - "Submit Your Paper" should be in mobile menu

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] Database tables created in production Supabase
- [ ] Storage buckets created and configured
- [ ] Environment variables set in production
- [ ] RLS policies enabled and tested
- [ ] Admin credentials secured (change default password!)
- [ ] Email service configured (SendGrid/AWS SES)
- [ ] File upload size limits tested
- [ ] All forms validated and sanitized
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] SEO meta tags added
- [ ] Analytics configured (optional)

### Environment Variables for Production

Update your `.env` file for production:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_KEY=your-production-service-key

# API
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Payment (if using)
CASHFREE_APP_ID=your-production-cashfree-id
CASHFREE_SECRET_KEY=your-production-secret
CASHFREE_ENVIRONMENT=production

# Email (add if implementing)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=editor.ijcast.in@gmail.com

# Security
SESSION_SECRET=generate-a-secure-random-string
```

### Build for Production

```bash
# Build frontend
npm run build

# Test production build locally
npm run preview

# Build will be in /dist folder
```

### Deploy to Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Deploy Backend API

For the Express.js backend (`/api` folder):

**Option 1: Vercel (Serverless)**
```bash
cd api
vercel --prod
```

**Option 2: Railway**
1. Connect GitHub repo
2. Select api folder as root
3. Add environment variables
4. Deploy

**Option 3: DigitalOcean App Platform**
1. Connect GitHub repo
2. Select api folder
3. Configure environment variables
4. Deploy

### Post-Deployment Testing

1. **Test Submission Form:**
   - Submit a test paper
   - Verify email received (once configured)
   - Check Supabase database for record
   - Verify files uploaded to storage

2. **Test Admin Panel:**
   - Login with production credentials
   - Create a volume → verify 6 issues created
   - Add a paper → verify it appears on website
   - Check submission management

3. **Test All Pages:**
   - Homepage with statistics
   - About, Editorial Board, Conferences
   - Archives/Published Papers
   - Contact form (once implemented)

4. **Test Mobile:**
   - Test on real mobile devices
   - Check navigation
   - Test forms on mobile
   - Verify PDF viewing works

---

## 🛠️ Troubleshooting

### Issue: Volumes not creating 6 issues automatically

**Solution:**
1. Check browser console for errors
2. Verify `saveIssue` function exists in JournalContext
3. Check Supabase connection
4. Try manually refreshing the page after creating volume

### Issue: Submission form not saving

**Possible Causes:**
- Database tables not created
- RLS policies too restrictive
- File upload failing
- Network error

**Solutions:**
1. Check browser console for specific error
2. Verify `submissions` table exists in Supabase
3. Check RLS policies allow public insert
4. Verify file size under limit (10MB)
5. Check network tab for failed requests

### Issue: Statistics showing 0 or incorrect numbers

**Solution:**
1. Check that you have published articles (is_published = true)
2. Verify volumes and issues exist in database
3. Check browser console for data fetching errors
4. Try refreshing the page

### Issue: "Submit Your Paper" button not working

**Solution:**
1. Verify route exists in App.jsx: `/submit-paper`
2. Check SubmitPaper component is imported
3. Clear browser cache
4. Check browser console for errors

### Issue: Admin can't see submissions

**Solution:**
1. Verify `submissions` table exists
2. Check that SubmissionsManager is imported in AdminDashboard
3. Verify `submissions` menu item exists in AdminSidebar
4. Check RLS policies allow admin access
5. Try submitting a test paper first

### Issue: Homepage not showing latest issue

**Solution:**
1. Make sure you have at least one issue with a `pub_date` set
2. Verify issues are marked as published
3. Check that volume status is 'Active'
4. Refresh the page

### Issue: Navigation looks broken on mobile

**Solution:**
1. Clear browser cache
2. Check that Tailwind CSS is loading
3. Verify responsive classes are present
4. Test on different mobile browsers

### Issue: PDF files not uploading

**Solution:**
1. Verify storage bucket exists (`manuscripts`)
2. Check bucket policies allow public insert
3. Verify file size under limit (10MB)
4. Check file type is PDF/DOC/DOCX
5. Check browser console for specific error

---

## 📚 Additional Resources

### Documentation
- **Supabase Docs:** https://supabase.com/docs
- **React Router:** https://reactrouter.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev

### Useful Supabase Queries

**Get all submissions with co-authors:**
```sql
SELECT 
  s.*,
  json_agg(
    json_build_object(
      'name', sa.name,
      'email', sa.email,
      'affiliation', sa.affiliation
    )
  ) FILTER (WHERE sa.id IS NOT NULL) as coauthors
FROM submissions s
LEFT JOIN submission_authors sa ON s.id = sa.submission_id
GROUP BY s.id
ORDER BY s.submitted_date DESC;
```

**Count submissions by status:**
```sql
SELECT status, COUNT(*) as count
FROM submissions
GROUP BY status;
```

**Find latest published papers:**
```sql
SELECT * FROM articles
WHERE is_published = true
ORDER BY published_date DESC
LIMIT 10;
```

**Get journal statistics:**
```sql
SELECT
  (SELECT COUNT(*) FROM volumes) as total_volumes,
  (SELECT COUNT(*) FROM issues) as total_issues,
  (SELECT COUNT(*) FROM articles WHERE is_published = true) as published_papers,
  (SELECT COUNT(*) FROM submissions) as total_submissions;
```

---

## 🎯 Success Criteria

Your implementation is successful when:

- ✅ New volumes automatically create 6 bimonthly issues
- ✅ Users can submit papers via `/submit-paper` form
- ✅ Submissions appear in admin panel with all details
- ✅ Homepage shows two prominent CTA cards
- ✅ Homepage displays real statistics from database
- ✅ Navigation shows simplified menu structure
- ✅ "Submit Your Paper" button is prominent
- ✅ All existing features still work
- ✅ Site is responsive on all devices
- ✅ Admin can manage submissions and change status
- ✅ No console errors
- ✅ Page load times are acceptable

---

## 💡 Tips for Success

1. **Test incrementally** - Don't try to deploy everything at once
2. **Use version control** - Commit working versions before making changes
3. **Keep backups** - Always backup your database before schema changes
4. **Monitor Supabase usage** - Check your usage quotas regularly
5. **Use environment-specific configs** - Different settings for dev/prod
6. **Document changes** - Keep notes of any customizations you make
7. **Test on real devices** - Don't rely only on browser dev tools
8. **Set up error monitoring** - Use Sentry or similar service in production
9. **Implement gradual rollout** - Test with small group first
10. **Have a rollback plan** - Know how to revert if issues arise

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the console** - Most errors show here first
2. **Review logs** - Check Supabase logs and server logs
3. **Test incrementally** - Isolate the problem area
4. **Check documentation** - Refer to this guide and official docs
5. **Verify environment** - Ensure all env variables are set correctly

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Status:** Ready for Production Setup
