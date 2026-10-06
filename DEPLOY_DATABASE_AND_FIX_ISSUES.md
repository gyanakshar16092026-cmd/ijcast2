# 🚀 Deploy Database & Fix Current Issues

This guide will fix all current issues in your IJCAST journal platform.

## 🔧 Issues Fixed

1. ✅ **Fixed SubmissionsManager.jsx** - Removed duplicate author information display
2. ✅ **Clarified workflow** - Updated messaging to reflect offline editorial review process
3. 🟡 **Database deployment** - Need to run SQL scripts in Supabase
4. 🟡 **ISSN display** - Will be fixed after running initial data

## 📋 Step-by-Step Deployment

### Step 1: Deploy Clean Database Schema

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run the deploy script:**
   ```sql
   -- Copy and paste the entire contents of:
   -- c:\Users\saile\Desktop\IJCAST\supabase\deploy-clean.sql
   ```
3. **Verify no errors** - All tables should be created successfully

### Step 2: Insert Initial Journal Data

1. **In Supabase SQL Editor**, run:
   ```sql
   -- Copy and paste the entire contents of:
   -- c:\Users\saile\Desktop\IJCAST\supabase\insert-initial-data.sql
   ```
2. **Verify success** - You should see "Journal Settings", research areas, and sample volume/issue

### Step 3: Create Storage Buckets

1. **Go to Supabase Storage** section
2. **Create these buckets:**
   - `manuscripts` (for submission files)
   - `published-papers` (for final published PDFs)
3. **Set bucket policies to public** for `published-papers`

### Step 4: Test the Complete Workflow

#### 4.1 Test Submission Form
1. **Navigate to** `/submit-paper`
2. **Fill out all required fields:**
   - Author name, email, phone, affiliation, institution, country
   - Paper title, abstract, keywords
   - Upload manuscript file
   - Check consent checkbox
3. **Submit and verify** you get submission ID like `RJ-2024-####`

#### 4.2 Test Admin View
1. **Navigate to** `/admin` 
2. **Go to Submissions tab**
3. **Verify you can see:**
   - Submitted paper in the list
   - All author details when clicking "View Details"
   - Files can be downloaded
   - Status shows as "SUBMITTED"

#### 4.3 Test ISSN Display
1. **Navigate to home page**
2. **Verify ISSN shows:** `ISSN 2394-9007`
3. **Check footer/header** for correct journal information

## 📧 Updated Workflow (As Per User Requirements)

### Current Workflow ✅
```
User Submits → Admin Views Submission → [Offline Editorial Review] → Manual Email with Payment Link → Manual Publishing
```

**No website approval needed** - Editorial team handles review offline and manually publishes after payment.

### What Users See:
- **Submit paper** → Get submission ID
- **Confirmation message** explains offline review process
- **Status remains "SUBMITTED"** until manual publishing

### What Admins See:
- **All submission details** in clean admin panel
- **Download all files** (manuscript, cover letter, copyright)
- **Read-only status** (no website approval buttons)
- **Complete author information**

## 🛠️ Files That Were Updated

1. **`src/components/admin/SubmissionsManager.jsx`** - Fixed duplicate fields, clean admin view
2. **`src/pages/SubmitPaper.jsx`** - Enhanced validation, updated success message
3. **`supabase/deploy-clean.sql`** - Clean database deployment script  
4. **`supabase/insert-initial-data.sql`** - Initial data with correct ISSN 2394-9007

## ✅ Expected Results After Deployment

- **Homepage shows:** IJCAST with ISSN 2394-9007
- **Submission form:** Works perfectly, saves all data
- **Admin panel:** Shows complete submission details
- **File uploads:** Work to Supabase Storage
- **Database:** All tables exist with proper relationships
- **No 404 errors** from missing tables

## 🚨 If You Still Have Issues

1. **Check browser console** for specific errors
2. **Verify Supabase connection** in `.env` file
3. **Ensure all SQL scripts ran** without errors
4. **Test with a fresh submission** to verify data flow

---

**Status: Ready to deploy** 🎯
**Next: Run the SQL scripts in order, test submission workflow**