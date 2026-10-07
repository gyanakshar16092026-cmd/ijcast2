# 🔍 Editorial Board Photo Sync Debug Guide

## 🚨 **Problem**
Photos uploaded in the admin panel don't appear on the public editorial board page.

## 🧪 **Debugging Steps**

### **Step 1: Test Storage Bucket Access**
1. Go to **Admin Dashboard** → **Editorial Board**
2. Click **"Test Storage"** button
3. **Expected**: `✅ journal-images: OK`
4. **If Error**: Create `journal-images` bucket in Supabase Dashboard

### **Step 2: Debug Admin Data**
1. In **Admin Dashboard** → **Editorial Board**
2. Click **"Debug Data"** button
3. Check browser console for detailed member info
4. **Look for**:
   - Total members count
   - Photo URLs (should start with `https://` for Supabase or `data:` for base64)
   - Active status

### **Step 3: Debug Public Data**
1. Go to **Public Editorial Board** page (`/editorial-board`)
2. Open browser **Developer Tools** → **Console**
3. **Look for**: `🌐 PUBLIC EDITORIAL BOARD - Data loaded:`
4. **Check**: 
   - Are total members the same as admin?
   - Are photo URLs present?
   - Any `❌ Image load failed` errors?

### **Step 4: Compare Data Sources**
Both admin and public pages use the **same data source** from `JournalContext`, so if data differs:
- **Database sync failed**
- **Storage upload failed**
- **Browser cache issue**

## 🔧 **Common Issues & Fixes**

### **Issue 1: Storage Bucket Missing**
**Symptoms**: Console shows storage errors during upload  
**Fix**: Create `journal-images` bucket in Supabase Dashboard
- **Name**: `journal-images`
- **Public**: ✅ Yes 
- **File limit**: 5MB

### **Issue 2: Image Upload Failed Silently**
**Symptoms**: Photo shows in admin temporarily, but disappears after refresh  
**Fix**: Check error handling in browser console during upload

### **Issue 3: Database Save Failed**
**Symptoms**: Image uploads but URL not saved to database  
**Fix**: Check Supabase connection and RLS policies

### **Issue 4: URL Format Issues**
**Symptoms**: Photo URL exists but image doesn't load  
**Fix**: Check if URLs are:
- ✅ **Supabase URLs**: `https://project.supabase.co/storage/v1/object/public/journal-images/editorial/...`
- ❌ **Base64 URLs**: `data:image/png;base64,...` (should be uploaded to storage)
- ❌ **Broken URLs**: Invalid or inaccessible paths

### **Issue 5: CSP Blocking**
**Symptoms**: Console shows CSP violation errors  
**Fix**: Ensure `vercel.json` includes proper CSP for storage domains

## 📊 **Debug Console Commands**

### **Check Editorial Data in Console**
```javascript
// Run in browser console on any page
console.log('Editorial Members:', JSON.stringify(editorialMembers, null, 2));
```

### **Test Image URL Manually**
```javascript
// Test if image URL is accessible
const testUrl = 'https://your-supabase-url/storage/...';
fetch(testUrl).then(r => console.log('Image accessible:', r.ok));
```

## 🎯 **Step-by-Step Troubleshooting**

### **Scenario A: Photos Never Upload**
1. ✅ Create storage bucket first
2. ✅ Test bucket access 
3. ✅ Check CSP allows storage domains
4. ✅ Try uploading again

### **Scenario B: Photos Upload But Don't Persist**
1. ✅ Check if Supabase connection works
2. ✅ Verify database `editorial_members` table exists
3. ✅ Check RLS policies allow updates
4. ✅ Look for database error messages

### **Scenario C: Photos Save But Don't Display**
1. ✅ Compare admin vs public data (Debug buttons)
2. ✅ Check image URLs are valid
3. ✅ Test direct image URL in new browser tab
4. ✅ Clear browser cache and refresh

### **Scenario D: Different Data Between Admin/Public**
1. ✅ Refresh both pages
2. ✅ Check if localStorage is interfering
3. ✅ Clear localStorage: `localStorage.clear()`
4. ✅ Check Supabase dashboard for actual data

## 🚀 **Quick Fixes**

### **Quick Fix 1: Clear Browser Storage**
```javascript
// Run in console to reset all local data
localStorage.clear();
location.reload();
```

### **Quick Fix 2: Force Data Refresh**
1. Go to admin dashboard
2. Make a small edit to any editorial member
3. Save changes
4. Check if data syncs to public page

### **Quick Fix 3: Direct Database Check**
1. Go to **Supabase Dashboard** → **Table Editor**
2. Open `editorial_members` table
3. Check `photo_url` column values
4. Verify URLs are accessible

## 🔗 **Expected Photo URL Format**
```
✅ CORRECT: https://abcdefgh.supabase.co/storage/v1/object/public/journal-images/editorial/1673024567890.jpg

❌ WRONG: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA... (should be uploaded)
❌ WRONG: /uploads/photo.jpg (local path)
❌ WRONG: https://broken-url.com/missing.jpg (inaccessible)
```

## 📋 **Checklist Before Reporting Issue**

- [ ] **Storage bucket exists** (`journal-images`)
- [ ] **Test Storage button** shows `✅ journal-images: OK`
- [ ] **Debug Data button** shows member with photo URL
- [ ] **Public page console** shows same member count
- [ ] **Image URLs are valid** Supabase storage URLs
- [ ] **No CSP violations** in browser console
- [ ] **Cleared browser cache** and localStorage

If all items are checked ✅ and photos still don't show, there may be a deeper database or network issue requiring further investigation.