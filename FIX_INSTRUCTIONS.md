# 🔧 How to Fix Formula Cards Not Appearing

## Quick Fix (Try This First)

1. **Open the cache clearer tool:**
   ```
   http://localhost:8000/clear-cache.html
   ```

2. **Click "4. Clear Everything"**

3. **Hard refresh your browser:**
   - Safari: `Cmd + Shift + R`
   - Chrome: `Cmd + Shift + R`
   - Firefox: `Cmd + Shift + R`

4. **Go back to AstroCalc:**
   ```
   http://localhost:8000/
   ```

## If That Doesn't Work

### Option 1: Manual Service Worker Unregister

**Safari:**
1. Enable Develop menu: Safari → Settings → Advanced → Check "Show Develop menu"
2. Develop → Service Workers
3. Find `localhost:8000` → Click "Unregister"
4. Hard refresh: `Cmd + Shift + R`

**Chrome:**
1. Press `Cmd + Option + I` (DevTools)
2. Application tab → Service Workers (left sidebar)
3. Find `localhost:8000` → Click "Unregister"
4. Hard refresh: `Cmd + Shift + R`

**Firefox:**
1. Press `Cmd + Option + I` (DevTools)
2. Storage tab → Service Workers
3. Find `localhost:8000` → Click "Unregister"
4. Hard refresh: `Cmd + Shift + R`

### Option 2: Clear Browser Cache

**Safari:**
1. Safari → Settings → Privacy
2. Click "Manage Website Data..."
3. Search for `localhost`
4. Select and click "Remove"

**Chrome:**
1. Press `Cmd + Shift + Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

**Firefox:**
1. Press `Cmd + Shift + Delete`
2. Select "Cache"
3. Time range: "Everything"
4. Click "Clear Now"

### Option 3: Test in Private/Incognito Mode

This bypasses all cache and extensions:

- **Safari:** `Cmd + Shift + N` → Navigate to `localhost:8000`
- **Chrome:** `Cmd + Shift + N` → Navigate to `localhost:8000`
- **Firefox:** `Cmd + Shift + P` → Navigate to `localhost:8000`

## Diagnostic Commands

Open browser console (`Cmd + Option + J` in Chrome, `Cmd + Option + C` in Safari) and run:

```javascript
// Check if everything is loaded
astrocalcDiagnostics()

// Check card count
console.log('Cards found:', window.astrocalcCardCount || document.querySelectorAll('.formula-card').length)

// Try manual render
if (typeof renderFormulaList === 'function') {
    renderFormulaList()
}
```

## What to Look For

After running diagnostics, check:

1. **Formulas loaded?** Should show `count: 193`
2. **Cards rendered?** Should show `cards: 193` (or close to it)
3. **Elements visible?** `display` should be `block`, `visibility` should be `visible`
4. **Service worker?** Check if old version is still registered

## Most Common Issue

**Service Worker Caching** - The old service worker (v2.0.2) is serving cached JavaScript files. The new version (v2.0.3) has the fixes, but browsers won't load it until you unregister the old one.

## Still Not Working?

1. Check browser console for errors (red text)
2. Check Network tab - are scripts loading? (should be 200 status)
3. Try a different browser to isolate the issue
4. Make sure Python server is running: `python3 -m http.server 8000`

