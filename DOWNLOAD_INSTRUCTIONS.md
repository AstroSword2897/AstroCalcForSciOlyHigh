# 📦 Download & Share Instructions

## Quick Start - Download and Use

### Option 1: Direct Download (Recommended)
1. **Download the entire folder** as a ZIP file
2. **Extract** the ZIP file to any location on your computer
3. **Open `index.html`** in any modern web browser (Chrome, Firefox, Safari, Edge)
   - Simply double-click `index.html` or right-click → "Open with" → your browser
4. **That's it!** The calculator will work immediately

### Option 2: Using a Local Web Server (For Best Experience)
Some features work better when served through a web server:

1. **Download and extract** the folder
2. **Open a terminal/command prompt** in the extracted folder
3. **Run one of these commands:**

   **Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Node.js (if you have it installed):**
   ```bash
   npx http-server
   ```

   **PHP:**
   ```bash
   php -S localhost:8000
   ```

4. **Open your browser** and go to:
   - `http://localhost:8000` (or the port shown in the terminal)

## 📤 Sharing the Calculator

### To Share with Others:

1. **Create a ZIP file** containing:
   - `index.html`
   - `scripts/` folder (all files)
   - `styles/` folder (all files)
   - `README.md` (optional but helpful)

2. **Upload to:**
   - Google Drive / Dropbox / OneDrive
   - GitHub (as a repository)
   - Your own web server
   - Any file sharing service

3. **Recipients can:**
   - Download the ZIP
   - Extract it
   - Open `index.html` in their browser

### File Structure for Sharing:
```
AstroCalcForSciOlyHigh/
├── index.html              ← Main file (open this!)
├── scripts/
│   ├── calculator.js
│   ├── classification.js
│   ├── expressionParser.js
│   ├── formulas.js
│   ├── graphManager.js
│   ├── unitConverter.js
│   └── ui.js
├── styles/
│   └── main.css
└── README.md               ← Optional documentation
```

## 🌐 Internet Requirements

**Note:** The calculator requires an internet connection for:
- **MathJax** (mathematical formula rendering) - loaded from CDN
- **Desmos API** (interactive graphs) - loaded from CDN

If you need a fully offline version, you would need to:
1. Download MathJax locally
2. Get a Desmos API key and host it locally (requires Desmos permission)

For most use cases, the CDN approach works perfectly and keeps the download size small.

## ✅ System Requirements

- **Browser:** Any modern web browser (Chrome, Firefox, Safari, Edge)
- **Internet:** Required for MathJax and Desmos (see above)
- **No installation needed:** Pure HTML/CSS/JavaScript - no server required

## 🚀 Quick Test

After downloading:
1. Open `index.html` in your browser
2. You should see the AstroCalc interface
3. Try searching for "escape velocity" or "Kepler's law"
4. Click on a formula to open the calculator

If it works, you're all set!

## 📝 Troubleshooting

**Problem:** Formulas don't render properly
- **Solution:** Check your internet connection (MathJax needs to load)

**Problem:** Graphs don't appear
- **Solution:** Ensure internet connection (Desmos API needs to load)

**Problem:** Can't open the file
- **Solution:** Make sure you're opening `index.html`, not a folder

**Problem:** Some features don't work
- **Solution:** Try using a local web server (see Option 2 above)

## 📧 Support

If you encounter issues, check:
1. Browser console for error messages (F12 → Console tab)
2. Internet connection status
3. That all files are in the correct folder structure

---

**Version:** 2.1  
**Last Updated:** 2025  
**License:** Open source for educational use

