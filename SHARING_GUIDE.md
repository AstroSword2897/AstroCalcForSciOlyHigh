# 📤 Sharing Guide - AstroCalc Calculator

This guide explains how to prepare and share your AstroCalc calculator with others.

## 🎯 Quick Start - Three Easy Steps

1. **Package** - Create a ZIP file with all calculator files
2. **Share** - Upload to cloud storage, email, or website
3. **Use** - Recipients download, extract, and open `index.html`

---

## 📦 Method 1: Manual Packaging (Any Platform)

### Step 1: Prepare Files
Ensure you have these files/folders:
```
✅ index.html
✅ scripts/ (folder with all .js files)
✅ styles/ (folder with main.css)
✅ README.md (optional but helpful)
✅ DOWNLOAD_INSTRUCTIONS.md (optional but helpful)
```

### Step 2: Create ZIP File

**Windows:**
1. Select all files and folders
2. Right-click → "Send to" → "Compressed (zipped) folder"
3. Rename to `AstroCalc-v2.1.zip` (or your version)

**Mac:**
1. Select all files and folders
2. Right-click → "Compress X Items"
3. Rename to `AstroCalc-v2.1.zip`

**Linux:**
```bash
zip -r AstroCalc-v2.1.zip index.html scripts/ styles/ README.md DOWNLOAD_INSTRUCTIONS.md
```

---

## 🤖 Method 2: Automated Scripts

### Windows Users:
1. Double-click `create-package.bat`
2. Wait for completion
3. Find `AstroCalc-v2.1.zip` in the same folder

### Mac/Linux Users:
1. Open terminal in the project folder
2. Run: `./create-package.sh`
3. Find `AstroCalc-v2.1.zip` in the same folder

**Note:** If script doesn't run, make it executable:
```bash
chmod +x create-package.sh
```

---

## 🌐 Method 3: Sharing Options

### Option A: Cloud Storage (Recommended)
**Best for:** Large files, easy sharing, no size limits

1. **Google Drive:**
   - Upload ZIP file
   - Right-click → "Get link"
   - Set to "Anyone with the link can view"
   - Share the link

2. **Dropbox:**
   - Upload ZIP file
   - Right-click → "Copy link"
   - Share the link

3. **OneDrive:**
   - Upload ZIP file
   - Right-click → "Share"
   - Copy link

### Option B: GitHub
**Best for:** Version control, public distribution, open source

1. Create a new repository
2. Upload all files (or use Git)
3. Create a release with the ZIP file
4. Share the repository or release link

### Option C: Personal Website
**Best for:** Professional distribution, direct downloads

1. Upload ZIP file to your web server
2. Create a download page with link
3. Share the page URL

### Option D: Email
**Best for:** Small groups, direct sharing

1. Attach ZIP file to email
2. Include brief instructions:
   ```
   Download and extract the ZIP file.
   Open index.html in your web browser.
   See README.md for full instructions.
   ```

**Note:** Some email providers have size limits (usually 25MB). The calculator should be well under this.

---

## 📋 Pre-Sharing Checklist

Before sharing, verify:

- [ ] Calculator works when opening `index.html` directly
- [ ] All JavaScript files are included
- [ ] All CSS files are included
- [ ] README.md is included (helpful for users)
- [ ] ZIP file extracts correctly
- [ ] No personal/sensitive information in files
- [ ] Version number is correct

---

## 🎓 For Educators / Teachers

### Sharing with Students:

1. **Upload to class website/LMS:**
   - Upload ZIP to Google Classroom, Canvas, Blackboard, etc.
   - Students download and use locally

2. **Create a shared folder:**
   - Use Google Drive or OneDrive
   - Share folder with class
   - Students can download anytime

3. **Include in course materials:**
   - Add to course ZIP package
   - Include in digital textbook/resources

### Instructions for Students:

Include this in your course materials:
```
AstroCalc Installation:
1. Download AstroCalc-v2.1.zip
2. Extract the ZIP file
3. Open index.html in your web browser
4. No installation needed - works immediately!

Note: Requires internet connection for graphs and math rendering.
```

---

## 🔒 Privacy & Security

### What's Included:
- ✅ Pure HTML/CSS/JavaScript (no server-side code)
- ✅ No personal data collection
- ✅ No tracking or analytics
- ✅ All code is visible (open source)

### External Dependencies:
- MathJax (CDN) - for math rendering
- Desmos API (CDN) - for graphs
- Both are loaded from public CDNs (no data sent to your server)

### Safe to Share:
- ✅ Safe for educational use
- ✅ No malware or viruses
- ✅ No data collection
- ✅ Works offline (except for CDN resources)

---

## 📊 File Size Information

**Typical package size:**
- Source files: ~500KB - 2MB
- ZIP file: ~200KB - 800KB (compressed)

**Why it's small:**
- No images or large assets
- JavaScript is unminified (readable)
- External libraries loaded from CDN

---

## 🆘 Troubleshooting for Recipients

If someone has issues:

1. **"File won't open"**
   - Ensure they're opening `index.html`, not the ZIP
   - Try a different browser

2. **"Formulas don't show"**
   - Check internet connection (MathJax needs CDN)
   - Try refreshing the page

3. **"Graphs don't work"**
   - Check internet connection (Desmos needs CDN)
   - Check browser console for errors (F12)

4. **"Can't extract ZIP"**
   - Use built-in extractor (Windows/Mac)
   - Or use 7-Zip, WinRAR, etc.

---

## 📝 Version Control

When updating and re-sharing:

1. Update version number in:
   - README.md
   - Package filename
   - Any version references

2. Create changelog (optional):
   - Document what changed
   - Include in README or separate file

3. Test thoroughly:
   - Test in multiple browsers
   - Verify all features work
   - Check for errors

---

## 🎉 Success!

Once shared, recipients can:
- ✅ Download and extract
- ✅ Use immediately (no installation)
- ✅ Work offline (except CDN resources)
- ✅ Share with others

**The calculator is completely self-contained and ready to use!**

---

**Questions?** Check `DOWNLOAD_INSTRUCTIONS.md` for user-facing help.

