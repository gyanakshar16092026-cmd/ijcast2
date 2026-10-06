# 🚀 Deploy Database Schema to Supabase - URGENT FIX

**Problem:** All tables are missing from your Supabase database (404 errors)

**Solution:** Run the SQL schema to create all tables

---

## Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Login to your account
3. Select your project: **wnextwrzgxrrmmuuabtv**

---

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"**

---

### Step 3: Copy & Paste Schema

1. Open this file: `c:\Users\saile\Desktop\IJCAST\supabase\schema.sql`
2. **Copy the ENTIRE contents** (Ctrl+A, then Ctrl+C)
3. **Paste into Supabase SQL Editor** (Ctrl+V)
4. Click **"Run"** button (bottom right)

**⏱️ This will take ~10-30 seconds to complete**

---

### Step 4: Verify Tables Created

After the query runs successfully:

1. In left sidebar, click **"Table Editor"**
2. You should now see these tables:
   - ✅ volumes
   - ✅ issues
   - ✅ articles
   - ✅ research_areas
   - ✅ editorial_members
   - ✅ page_content
   - ✅ media
   - ✅ submissions ⭐ (for paper submissions)
   - ✅ submission_authors ⭐ (for co-authors)
   - ✅ contact_messages
   - ✅ theses
   - ✅ conferences
   - ✅ announcements

---

### Step 5: Create Storage Bucket

1. In left sidebar, click **"Storage"**
2. Click **"New bucket"**
3. Name: **manuscripts**
4. Settings:
   - ✅ Public bucket (check this)
   - File size limit: **10 MB**
5. Click **"Create bucket"**

---

### Step 6: Set Storage Policies

1. Click on the **manuscripts** bucket
2. Click **"Policies"** tab
3. Click **"New policy"**
4. Select **"Get started quickly"** → **"Allow public access"**
5. Policy name: **Public read access**
6. Click **"Review"** → **"Save policy"**

---

### Step 7: Refresh Your Website

1. Go back to your website: `http://localhost:5173`
2. **Hard refresh:** Press **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
3. Check browser console - **404 errors should be gone!**

---

## Alternative Method: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Navigate to project directory
cd c:\Users\saile\Desktop\IJCAST

# Push schema to Supabase
supabase db push

# OR apply migrations
supabase db reset
```

---

## What This Does

The `schema.sql` file contains SQL commands to create:

### Core Tables (Required for website)
- **volumes** - Journal volumes (e.g., Volume 1, 2025)
- **issues** - Journal issues (e.g., Issue 1: Jan-Feb)
- **articles** - Published papers
- **research_areas** - Research categories

### Submission Tables (For paper submissions) ⭐
- **submissions** - User submitted papers
- **submission_authors** - Co-authors for submissions

### Editorial Tables
- **editorial_members** - Editorial board members
- **page_content** - Dynamic page content (About, Guidelines, etc.)
- **media** - Uploaded media files

### Additional Tables
- **contact_messages** - Contact form submissions
- **theses** - Thesis abstracts
- **conferences** - Conference information
- **announcements** - Website announcements

### Database Functions
- **generate_submission_id()** - Generates RJ-YYYY-#### format IDs
- **update_updated_at_column()** - Auto-updates timestamps

### Indexes (For performance)
- Full-text search indexes (GIN)
- Foreign key indexes
- Lookup indexes

---

## Troubleshooting

### Problem: "Permission denied" error

**Solution:**
1. You might not have permission to create tables
2. Check if you're the project owner
3. Try using the project's Service Role Key (from Settings → API)

---

### Problem: "Table already exists" error

**Solution:**
1. Some tables might already exist
2. Either:
   - Drop existing tables first (⚠️ WARNING: deletes data)
   - Or skip the error and continue

**To drop all tables and start fresh:**
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS submission_authors CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS volumes CASCADE;
DROP TABLE IF EXISTS editorial_members CASCADE;
DROP TABLE IF EXISTS research_areas CASCADE;
DROP TABLE IF EXISTS page_content CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS theses CASCADE;
DROP TABLE IF EXISTS conferences CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP FUNCTION IF EXISTS generate_submission_id();
DROP FUNCTION IF EXISTS update_updated_at_column();
```

Then run the full schema again.

---

### Problem: Still getting 404 errors after running schema

**Solution:**
1. Check if tables were actually created (Table Editor in Supabase)
2. Verify your `.env` file has correct credentials:
   ```
   VITE_SUPABASE_URL=https://wnextwrzgxrrmmuuabtv.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Hard refresh browser (Ctrl+Shift+R)
4. Check Supabase logs (Logs → API Logs)

---

## After Database is Deployed

### Test the Workflow

1. **Submit a test paper:**
   ```
   Go to: http://localhost:5173/submit-paper
   Fill form and upload a PDF
   Click Submit
   ```

2. **Check in admin:**
   ```
   Go to: http://localhost:5173/admin/login
   Login with your credentials
   Click "Submissions" tab
   Should see your test submission!
   ```

3. **Publish the paper:**
   ```
   Click eye icon to view submission
   Change status to "ACCEPTED"
   Click "Convert to Published Paper"
   ```

4. **See on website:**
   ```
   Go to: http://localhost:5173/latest-papers
   Your paper should appear!
   ```

---

## Quick Reference

### Supabase Project Details
- **Project ID:** wnextwrzgxrrmmuuabtv
- **Project URL:** https://wnextwrzgxrrmmuuabtv.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/wnextwrzgxrrmmuuabtv

### Required Buckets
- **manuscripts** - For paper uploads (manuscript, cover letter, copyright)
- **published-papers** - For final published PDFs (optional)

### Key Tables for Submissions
- **submissions** - Main submission data
- **submission_authors** - Co-authors
- **articles** - Published papers (destination after approval)

---

## Summary

✅ **Step 1:** Open Supabase SQL Editor  
✅ **Step 2:** Copy entire `supabase/schema.sql`  
✅ **Step 3:** Paste and run in SQL Editor  
✅ **Step 4:** Create "manuscripts" storage bucket  
✅ **Step 5:** Set public read policy on bucket  
✅ **Step 6:** Refresh website and test  

**Time Required:** 5-10 minutes  
**Difficulty:** Easy (just copy-paste SQL)

---

## Need Help?

If you encounter errors:

1. **Copy the exact error message**
2. **Check which line failed** (SQL Editor shows line numbers)
3. **Common fixes:**
   - Drop existing tables first
   - Check project permissions
   - Verify you're logged in as project owner

---

**Once database is deployed, the entire submission workflow will work perfectly! 🎉**

---

**Document Version:** 1.0  
**Status:** 🚨 URGENT - Database not deployed  
**Solution:** Run schema.sql in Supabase SQL Editor
