# API Instances Quick Reference

## External API Calls: **0** ✅

No external HTTP/HTTPS requests found.

---

## Browser API Instances

### 1. Service Worker API

**Registration:**
- `index.html:704` - `navigator.serviceWorker.register('./sw.js?v=2.1.0')`

**Events (sw.js):**
- Line 74: `self.addEventListener('install', ...)`
- Line 92: `self.addEventListener('activate', ...)`
- Line 113: `self.addEventListener('fetch', ...)`
- Line 208: `self.addEventListener('message', ...)`

---

### 2. Cache API

**sw.js:**
- Line 74: `caches.open(CACHE_NAME)`
- Line 77: `cache.addAll(PRECACHE_RESOURCES)`
- Line 95: `caches.keys()`
- Line 100: `caches.delete(cacheName)`
- Line 136: `caches.open(RUNTIME_CACHE)`
- Line 138: `cache.put(event.request, responseToCache)`
- Line 145: `caches.match(event.request)`
- Line 165: `caches.match(event.request)`
- Line 183: `caches.open(RUNTIME_CACHE)`
- Line 185: `cache.put(event.request, responseToCache)`
- Line 193: `caches.match('./index.html')`
- Line 216: `caches.open(CACHE_NAME)`
- Line 217: `cache.addAll(event.data.urls)`

---

### 3. Fetch API (Internal Only)

**sw.js:**
- Line 127: `fetch(event.request)` - Network-first for versioned JS
- Line 172: `fetch(event.request)` - Cache-first fallback

**Test Files:**
- `tests/runSearchTests.html:154` - `fetch('/tests/search_test_cases.json')`
- `tests/production_test_interface.html:244` - `fetch('/tests/search_test_cases.json')`
- `tests/conceptNetwork_tests.js:32` - `fetch('/tests/weighted_concept_mapping.json')`
- `tests/searchTestHarness.js:46` - `fetch('/tests/weighted_concept_mapping.json')`

**All fetch calls are same-origin (no external URLs)**

---

### 4. DOM API

**Total Instances**: 1080+ across 93 files

**Top Files:**
- `scripts/ui/ui/UIModuleOrchestrator.js` - 78 instances
- `scripts/enhancedOfflineGraph.js` - 46 instances
- `scripts/formulaExplorer.js` - 18 instances
- `scripts/ui/ui/modules/tabs/TabManager.js` - 34 instances

**Common Methods:**
- `document.getElementById()` - 200+ instances
- `document.querySelector()` - 150+ instances
- `document.createElement()` - 100+ instances
- `element.appendChild()` - 80+ instances
- `element.innerHTML` - 60+ instances
- `element.addEventListener()` - 200+ instances

---

### 5. Canvas API

**File**: `scripts/enhancedOfflineGraph.js`

**Methods Used:**
- `canvas.getContext('2d')`
- `ctx.clearRect()`
- `ctx.fillRect()`
- `ctx.strokeRect()`
- `ctx.beginPath()`
- `ctx.moveTo()`
- `ctx.lineTo()`
- `ctx.quadraticCurveTo()`
- `ctx.bezierCurveTo()`
- `ctx.stroke()`
- `ctx.fill()`
- `ctx.save()`
- `ctx.restore()`
- `ctx.translate()`
- `ctx.scale()`
- `ctx.fillStyle`
- `ctx.strokeStyle`
- `ctx.lineWidth`
- `ctx.font`
- `ctx.fillText()`
- `ctx.strokeText()`
- `ctx.measureText()`

**Purpose**: Offline graph rendering

---

### 6. Performance API

**Files**: Various test and monitoring files

**Methods:**
- `performance.now()` - High-resolution timing
- `performance.mark()` - Performance marks
- `performance.measure()` - Performance measurements

---

### 7. RequestAnimationFrame API

**File**: `scripts/ui/ui/modules/rendering/FormulaRenderer.js`

**Usage:**
```javascript
requestAnimationFrame(() => {
    this.performRender(this.pendingFormulas, container);
});
```

**Purpose**: Smooth batched rendering

---

### 8. ResizeObserver API

**File**: `scripts/enhancedOfflineGraph.js`

**Usage:**
```javascript
this.resizeObserver = new ResizeObserver((entries) => {
    this.handleResize(entries);
});
this.resizeObserver.observe(container);
this.resizeObserver.disconnect(); // Cleanup
```

---

### 9. Console API

**Total Instances**: 200+ across all files

**Methods:**
- `console.log()` - 150+ instances
- `console.warn()` - 30+ instances
- `console.error()` - 20+ instances
- `console.info()` - 5+ instances

---

### 10. Navigator API

**index.html:**
- Line 704: `navigator.serviceWorker.register()`
- Line 739: `navigator.onLine` - Check online status

**Event Listeners:**
- `window.addEventListener('online', ...)`
- `window.addEventListener('offline', ...)`

---

## Internal Cache Interfaces (Map-based)

### Search Cache
**File**: `scripts/ui/ui/modules/search/SearchEngine.js`
- `cache.get(key)`
- `cache.set(key, value)`

### Formula Card Cache
**File**: `scripts/ui/ui/modules/rendering/FormulaRenderer.js`
- `this.cardCache.get(cacheKey)`
- `this.cardCache.set(cacheKey, html)`
- `this.cardCache.delete(key)`
- `this.cardCache.clear()`
- Max size: 300 items (LRU)

### Expression Cache
**File**: `scripts/calculator.js`
- `this.expressionCache.has(expression)`
- `this.expressionCache.get(expression)`
- `this.expressionCache.set(expression, result)`

### Command Palette Cache
**File**: `scripts/quickNav.js`
- `commandPaletteCache.has(queryLower)`
- `commandPaletteCache.get(queryLower)`
- `commandPaletteCache.set(queryLower, results)`

---

## Summary

- **External API Calls**: 0 ✅
- **Browser APIs**: 9 used
- **Storage APIs**: 0 (using Maps)
- **Total API Instances**: ~1,400+ (mostly DOM)
- **Network Dependencies**: 0 ✅

**Status**: Fully Offline-Capable PWA
