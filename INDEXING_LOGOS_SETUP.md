# 🏛️ Indexing Logos Setup Guide

## ✅ **What's Already Added**

I've added the Impact Factor and Indexing section to the homepage:

### **1. Impact Factor Badge** 
- **Location**: Top of homepage in status badges
- **Display**: "IMPACT FACTOR: 6.255" with Award icon
- **Style**: Red badge with prominent positioning

### **2. Indexing Section**
- **Location**: Between statistics bar and action cards
- **Title**: "Indexed In" 
- **Description**: "IJCAST is indexed in prestigious academic databases and platforms"
- **Layout**: Responsive grid (2 cols mobile → 4 cols tablet → 6 cols desktop)

## 🖼️ **How to Add Your Indexing Logos**

### **Step 1: Add Logo Files**
1. Save your indexing logos to the `public` folder
2. Recommended file formats: `.png`, `.svg`, `.jpg`
3. Recommended size: 100-200px wide, transparent background preferred

**Example file structure:**
```
public/
├── indexing-logos/
│   ├── scopus-logo.png
│   ├── google-scholar-logo.png
│   ├── crossref-logo.svg
│   ├── doaj-logo.png
│   ├── researchgate-logo.png
│   └── academia-logo.png
```

### **Step 2: Replace Placeholder Code**

In `src/pages/Home.jsx`, replace the placeholder divs with actual logo images:

**BEFORE** (Current placeholder):
```jsx
<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-24 h-16 flex items-center justify-center">
  <span className="text-xs font-semibold text-gray-500 text-center">SCOPUS</span>
</div>
```

**AFTER** (With actual logo):
```jsx
<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-24 h-16 flex items-center justify-center">
  <img 
    src="/indexing-logos/scopus-logo.png" 
    alt="Scopus Database" 
    className="max-w-full max-h-full object-contain"
  />
</div>
```

### **Step 3: Complete Example Replacement**

Replace the entire grid section with your actual logos:

```jsx
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
  {/* Scopus */}
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-24 h-16 flex items-center justify-center">
    <img 
      src="/indexing-logos/scopus-logo.png" 
      alt="Scopus Database" 
      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
    />
  </div>

  {/* Google Scholar */}
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-24 h-16 flex items-center justify-center">
    <img 
      src="/indexing-logos/google-scholar-logo.png" 
      alt="Google Scholar" 
      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
    />
  </div>

  {/* Add more logos as needed */}
</div>
```

## 🎨 **Logo Styling Options**

### **Option 1: Grayscale with Color on Hover**
```jsx
className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
```

### **Option 2: Always Full Color**
```jsx
className="max-w-full max-h-full object-contain"
```

### **Option 3: Subtle opacity with hover effect**
```jsx
className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
```

## 📋 **Common Indexing Databases**

Here are typical academic indexing services you might want to include:

- **Scopus** (Elsevier)
- **Google Scholar** 
- **CrossRef** (DOI Registration)
- **DOAJ** (Directory of Open Access Journals)
- **ResearchGate**
- **Academia.edu**
- **Microsoft Academic**
- **Semantic Scholar**
- **EBSCO**
- **ProQuest**
- **JSTOR** (if applicable)
- **Web of Science** (Clarivate)

## 🔧 **Customization Options**

### **Change Grid Layout**
```jsx
{/* 3 columns on all screen sizes */}
<div className="grid grid-cols-3 gap-8">

{/* Different responsive breakpoints */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
```

### **Adjust Logo Container Size**
```jsx
{/* Larger containers */}
<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 w-32 h-20 flex items-center justify-center">

{/* Smaller containers */}
<div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 w-20 h-12 flex items-center justify-center">
```

## 🚀 **After Adding Logos**

Once you've added your logo files and updated the code:

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add indexing logos to homepage"
   git push origin main
   ```

2. **Test the display**:
   - Check responsive layout on different screen sizes
   - Verify all logos load properly
   - Test hover effects (if implemented)

3. **Remove the instruction note**:
   Delete the "Note for adding actual logos" section at the bottom of the indexing section

## 📸 **Current Status**

✅ **Impact Factor**: Prominently displayed as "6.255"  
✅ **Section Layout**: Ready and responsive  
⏳ **Logo Images**: Placeholder text - ready for your logo files  
⏳ **Final Styling**: Customize once logos are added

Your homepage now has professional credibility indicators that showcase IJCAST's academic standing and indexing status! 🎓📊