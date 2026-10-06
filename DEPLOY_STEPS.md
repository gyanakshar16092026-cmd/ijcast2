# 🚀 Database Deployment - Simple Steps

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: **wnextwrzgxrrmmuuabtv**
3. Click **SQL Editor** in left sidebar
4. Click **New query**

## Step 2: Run the Clean Deployment SQL

1. Open this file: `supabase/deploy-clean.sql`
2. Copy **ALL** contents (Ctrl+A, then Ctrl+C)
3. Paste into Supabase SQL Editor (Ctrl+V)
4. Click **RUN** button (bottom right)
5. Wait 10-30 seconds for completion

✅ **Expected:** "Success. No rows returned"

## Step 3: Create Storage Bucket

1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Name: `manuscripts`
4. Check **✓ Public bucket**
5. Click **Create bucket**

## Step 4: Set Bucket Policy

1. Click on **manuscripts** bucket
2. Click **Policies** tab
3. Click **New policy**
4. Select **For full customization**
5. Policy name: `Public read access`
6. Target roles: `public`
7. Operations: Check **SELECT**
8. Policy definition: Use this SQL:
   ```sql
   true
   ```
9. Click **Review** → **Save policy**

## Step 5: Test Your Website

1. Go to: http://localhost:5173
2. Hard refresh: **Ctrl+Shift+R**
3. Check browser console - **404 errors should be GONE! ✅**

## Step 6: Test Submission Workflow

### Test as User:
1. Go to: http://localhost:5173/submit-paper
2. Fill the form with test data
3. Upload any PDF as manuscript
4. Click "Submit Manuscript"
5. ✅ Should see success page with submission ID

### Test as Admin:
1. Go to: http://localhost:5173/admin/login
2. Login with your admin credentials
3. Click **Submissions** tab
4. ✅ Should see your test submission!
5. Click eye icon to view details
6. Change status to "ACCEPTED"
7. Click "Convert to Published Paper"
8. ✅ Should see success message

### Verify on Website:
1. Go to: http://localhost:5173/latest-papers
2. ✅ Your paper should appear at the top!

---

## Troubleshooting

### Still getting 404 errors?

**Check:**
1. Tables created? Go to **Table Editor** in Supabase - you should see all tables
2. Correct credentials in `.env` file?
3. Hard refreshed browser? (Ctrl+Shift+R)

### Error: "permission denied"?

**Solution:** You might not be the project owner. Ask the owner to run the SQL.

### Submission not saving?

**Check:**
1. Storage bucket "manuscripts" created?
2. Bucket is public?
3. Check browser console for errors

---

## What Gets Created

### Tables (15 total):
- ✅ journal_settings
- ✅ volumes
- ✅ issues
- ✅ articles
- ✅ submissions ⭐
- ✅ submission_authors ⭐
- ✅ contact_messages
- ✅ editorial_members
- ✅ research_areas
- ✅ page_content
- ✅ media
- ✅ theses
- ✅ announcements
- ✅ conferences
- ✅ apc_payments

### Functions (2):
- ✅ generate_submission_id() - Creates RJ-YYYY-#### format IDs
- ✅ update_updated_at_column() - Auto-updates timestamps

### Triggers (3):
- ✅ update_articles_updated_at
- ✅ update_submissions_updated_at
- ✅ update_apc_payments_updated_at

### Indexes (25+):
- ✅ Performance indexes for fast queries
- ✅ Full-text search indexes (GIN)
- ✅ Foreign key indexes

### RLS Policies:
- ✅ Row Level Security enabled on all tables
- ✅ Allow all operations (app uses app-level auth)

---

## After Deployment

Your submission workflow is now **FULLY FUNCTIONAL**:

✅ User submits paper → Saves to database  
✅ Files upload to Supabase Storage  
✅ Admin sees submission in dashboard  
✅ Admin can review and change status  
✅ Admin can publish to website  
✅ Published paper appears on Latest Papers page  

**Everything works! 🎉**

---

**Total Time:** 5-10 minutes  
**Difficulty:** Easy  
**Result:** Fully working submission system!
