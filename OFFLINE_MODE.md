# 🔌 Offline Mode Guide

The calculator has been configured to work **mostly offline**. Here's what works and what doesn't:

## ✅ Works Offline

- **Formula Search** - All search functionality works offline
- **Calculations** - All formula calculations work offline
- **Math Rendering** - MathJax is included locally, so formulas display correctly
- **Unit Conversion** - All unit conversions work offline
- **Classification Tool** - Stellar classification works offline
- **Expression Parsing** - Mathematical expression parsing works offline

## ⚠️ Requires Internet

- **Graph Visualization** - Desmos API requires internet connection
  - When offline, you'll see a friendly message instead of graphs
  - All other features continue to work normally

## 📦 What's Included

The `libs/` folder contains:
- `libs/mathjax/es5/tex-mml-chtml.js` - Local MathJax library (1.1MB)

## 🚀 How It Works

1. **MathJax**: Loaded from local file (`libs/mathjax/es5/tex-mml-chtml.js`)
   - No internet required for math rendering
   - Formulas display correctly offline

2. **Desmos**: Loaded conditionally
   - Attempts to load from CDN when online
   - Shows graceful message when offline
   - Automatically retries when connection is restored

## 📋 Packaging for Offline Use

When creating your distribution ZIP, **make sure to include**:
- ✅ `libs/` folder (contains MathJax)
- ✅ All other files (scripts, styles, index.html)

The calculator will work offline for all features except graphs!

## 🔍 Testing Offline Mode

To test offline functionality:

1. **Disable internet** (turn off WiFi/ethernet)
2. **Open `index.html`** in your browser
3. **Verify**:
   - ✅ Formulas search works
   - ✅ Calculations work
   - ✅ Math formulas render correctly
   - ⚠️ Graphs show "offline" message

## 📝 Notes

- The bundled MathJax file is self-contained and includes all necessary components
- Desmos API cannot be downloaded locally (it's a proprietary service)
- When online, graphs work normally
- When offline, users see a clear message that graphs require internet

---

**Version:** 2.1 (Offline Mode)  
**Last Updated:** 2025

