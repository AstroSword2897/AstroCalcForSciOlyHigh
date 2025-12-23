# Offline Testing Guide

**How to verify offline functionality works**

## 🧪 **Testing Steps**

### **1. Install Service Worker**
1. Open `http://localhost:8000` in browser
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Click "Update" if new version available
5. Wait for "activated and is running" status

### **2. Verify Cache**
1. DevTools → Application → Cache Storage
2. Find `astrocalc-v2.1.0` cache
3. Verify all scripts are cached:
   - `scripts/enhancedOfflineGraph.js`
   - `scripts/search/formula-search.js`
   - `tests/weighted_concept_mapping.json`
   - All other core scripts

### **3. Test Offline**
1. DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh page (Cmd+R / Ctrl+R)
4. Page should load from cache

### **4. Verify Features Work**
Test each feature offline:
- ✅ Formula search
- ✅ Formula calculation
- ✅ Graph rendering
- ✅ Multi-step solver
- ✅ UI interactions
- ✅ Concept network search

### **5. Check Console**
- No errors about missing scripts
- No network fetch errors
- All features functional

## ✅ **Success Criteria**
- Page loads fully offline
- All features work
- No console errors
- Service worker active

## 🔧 **Troubleshooting**

**Service worker not updating:**
- Hard refresh (Cmd+Shift+R)
- Unregister old service worker
- Clear cache storage
- Reload page

**Scripts not loading offline:**
- Check cache storage for missing files
- Verify file paths in `sw.js`
- Check console for 404 errors

