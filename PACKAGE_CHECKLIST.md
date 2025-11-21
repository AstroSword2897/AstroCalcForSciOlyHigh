# 📋 Package Checklist for Distribution

Use this checklist when preparing the calculator for download/sharing:

## ✅ Required Files

- [ ] `index.html` - Main HTML file
- [ ] `scripts/calculator.js` - Calculation engine
- [ ] `scripts/classification.js` - Stellar classification
- [ ] `scripts/expressionParser.js` - Math expression parser
- [ ] `scripts/formulas.js` - Formula database
- [ ] `scripts/graphManager.js` - Graph visualization
- [ ] `scripts/unitConverter.js` - Unit conversion
- [ ] `scripts/ui.js` - User interface
- [ ] `styles/main.css` - All styling
- [ ] `libs/mathjax/es5/tex-mml-chtml.js` - Local MathJax (for offline use)
- [ ] `README.md` - Documentation
- [ ] `DOWNLOAD_INSTRUCTIONS.md` - User guide

## ✅ Optional Files (Helpful but not required)

- [ ] `CHECKLIST.md` - Development checklist
- [ ] `STRUCTURE.md` - Code structure documentation
- [ ] `VERIFICATION.md` - Testing documentation
- [ ] `test_calculations.js` - Test file (optional)

## ✅ Pre-Distribution Checks

- [ ] All JavaScript files are present and unminified
- [ ] All CSS files are present
- [ ] `libs/mathjax/` folder is included (for offline MathJax)
- [ ] `index.html` references all scripts correctly
- [ ] MathJax loads from local file (offline mode)
- [ ] Calculator works when opening `index.html` directly (offline)
- [ ] Calculator works when served via local web server
- [ ] Search functionality works (offline)
- [ ] Formula calculations work (offline)
- [ ] Math formulas render correctly (offline)
- [ ] Graph visualization shows offline message when offline
- [ ] Classification tool works (offline)
- [ ] No console errors in browser

## ✅ Package Structure

When creating ZIP file, ensure structure is:
```
AstroCalcForSciOlyHigh/
├── index.html
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
├── libs/
│   └── mathjax/
│       └── es5/
│           └── tex-mml-chtml.js
├── README.md
└── DOWNLOAD_INSTRUCTIONS.md
```

## ✅ Testing Before Distribution

1. **Test in multiple browsers:**
   - [ ] Chrome
   - [ ] Firefox
   - [ ] Safari
   - [ ] Edge

2. **Test opening methods:**
   - [ ] Direct file open (double-click index.html)
   - [ ] Via local web server

3. **Test core features:**
   - [ ] Search for formulas
   - [ ] Calculate a formula
   - [ ] View graphs
   - [ ] Use classification tool
   - [ ] Unit conversions

4. **Test edge cases:**
   - [ ] Empty search
   - [ ] Invalid inputs
   - [ ] Missing variables
   - [ ] Symbolic calculations (N/A)

## ✅ Documentation

- [ ] README.md is up to date
- [ ] DOWNLOAD_INSTRUCTIONS.md is clear
- [ ] All features are documented
- [ ] Troubleshooting section included

## 📦 Creating the Distribution Package

1. **Clean the folder:**
   - Remove any temporary files
   - Remove `.git` folder if present (optional)
   - Remove any test files you don't want to include

2. **Create ZIP file:**
   - Select all required files
   - Create ZIP archive
   - Name it something like: `AstroCalc-v2.1.zip`

3. **Test the ZIP:**
   - Extract to a new location
   - Test that everything works
   - Verify file structure is correct

## 🚀 Distribution Options

- **GitHub:** Upload as repository or release
- **Google Drive / Dropbox:** Share ZIP file
- **Personal Website:** Host files directly
- **Email:** Send ZIP as attachment (if small enough)

## 📝 Version Information

Before distributing, update:
- Version number in README.md
- Date in README.md
- Any changelog or version history

---

**Last Updated:** 2025

