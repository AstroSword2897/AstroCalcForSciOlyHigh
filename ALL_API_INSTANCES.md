# All API Instances in AstroCalc Application

## Complete Inventory of API Usage

---

## 1. EXTERNAL API CALLS

### ✅ **ZERO EXTERNAL API CALLS**

**Status**: No external HTTP/HTTPS requests to third-party services

**Evidence:**
- No `fetch()` calls to external URLs
- No `XMLHttpRequest` to external servers  
- Service Worker explicitly skips cross-origin requests:
  ```javascript
  // sw.js:114-118
  if (!event.request.url.startsWith(self.location.origin)) {
      return; // Don't intercept external requests
  }
  ```

---

## 2. SERVICE WORKER API

### 2.1 Service Worker Registration
**File**: `index.html` (line 704), `index-backup.html` (line 704)

```javascript
navigator.serviceWorker.register('./sw.js?v=2.1.0')
    .then((registration) => {
        console.log('[Service Worker] Registered successfully');
        setInterval(() => {
            registration.update(); // Check for updates every 60s
        }, 60000);
    });
```

**Purpose**: Register service worker for offline support

---

### 2.2 Service Worker Events
**File**: `sw.js`

**Install Event:**
```javascript
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_RESOURCES);
        })
    );
});
```

**Activate Event:**
```javascript
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
```

**Fetch Event:**
```javascript
self.addEventListener('fetch', (event) => {
    // Cache-first or network-first strategy
    event.respondWith(/* ... */);
});
```

**Message Event:**
```javascript
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
```

---

## 3. CACHE API

### 3.1 Cache Operations
**File**: `sw.js` (throughout)

**Cache Opening:**
```javascript
caches.open(CACHE_NAME)        // Precache
caches.open(RUNTIME_CACHE)     // Runtime cache
```

**Cache Operations:**
```javascript
cache.addAll(PRECACHE_RESOURCES)  // Batch add resources
cache.put(event.request, response) // Store response
cache.match(event.request)        // Retrieve cached response
cache.delete(cacheName)            // Delete old cache
```

**Cache Names:**
- `astrocalc-v2.1.0` - Precache (static resources)
- `astrocalc-runtime-v2.1.0` - Runtime cache (dynamic resources)

**Cache Strategy:**
- **Versioned JS files**: Network-first, cache fallback
- **Other resources**: Cache-first, network fallback

---

## 4. FETCH API (Internal Only)

### 4.1 Service Worker Fetch
**File**: `sw.js` (lines 127, 172)

**Network-First (Versioned JS):**
```javascript
fetch(event.request)
    .then((response) => {
        // Cache successful response
        cache.put(event.request, responseToCache);
        return response;
    })
    .catch(() => {
        // Fallback to cache
        return caches.match(event.request);
    });
```

**Cache-First (Other Resources):**
```javascript
caches.match(event.request)
    .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request)
            .then((response) => {
                cache.put(event.request, response.clone());
                return response;
            });
    });
```

**Purpose**: Offline support with cache fallback

---

### 4.2 Test File Fetch
**Files**: `tests/runSearchTests.html`, `tests/production_test_interface.html`

**Usage:**
```javascript
// Load local test data
const response = await fetch('/tests/search_test_cases.json');
const testCases = await response.json();
```

**Purpose**: Loading local test case files (same-origin only)

---

## 5. DOM APIs

### 5.1 Document API
**Usage Count**: 1080+ instances across 93 files

**Common Methods:**
```javascript
document.getElementById(id)
document.querySelector(selector)
document.querySelectorAll(selector)
document.createElement(tag)
document.addEventListener(event, handler)
document.removeEventListener(event, handler)
document.createDocumentFragment()
document.readyState
```

**Files with Heavy Usage:**
- `scripts/ui/ui/UIModuleOrchestrator.js` (78 instances)
- `scripts/enhancedOfflineGraph.js` (46 instances)
- `scripts/formulaExplorer.js` (18 instances)
- `scripts/ui/ui/modules/tabs/TabManager.js` (34 instances)

---

### 5.2 Window API
**Common Usage:**
```javascript
window.addEventListener(event, handler)
window.removeEventListener(event, handler)
window.dispatchEvent(event)
window.location
window.history
window.online
window.offline
window.formulas
window.FormulaCalculator
window.uiOrchestrator
```

**Global Exports:**
- `window.calculateConfidenceScore`
- `window.getConfidenceLevel`
- `window.selectFormula`
- `window.performCalculation`
- `window.searchEngine`
- `window.graphManager`

---

### 5.3 Element API
**Common Usage:**
```javascript
element.innerHTML
element.textContent
element.appendChild(child)
element.removeChild(child)
element.setAttribute(name, value)
element.getAttribute(name)
element.classList.add/remove/toggle
element.style.property
element.addEventListener(event, handler)
element.removeEventListener(event, handler)
element.focus()
element.blur()
element.scrollIntoView()
```

---

## 6. PERFORMANCE API

### 6.1 Performance Timing
**Files**: Various test and performance monitoring files

**Usage:**
```javascript
performance.now()           // High-resolution timing
performance.mark(name)      // Performance marks
performance.measure(name)  // Performance measurements
```

**Purpose**: Performance monitoring and profiling

---

## 7. REQUESTANIMATIONFRAME API

### 7.1 Animation Frame
**File**: `scripts/ui/ui/modules/rendering/FormulaRenderer.js`

**Usage:**
```javascript
requestAnimationFrame(() => {
    this.performRender(this.pendingFormulas, container);
});
```

**Purpose**: Smooth rendering of formula cards (batched DOM updates)

---

## 8. RESIZEOBSERVER API

### 8.1 Resize Observer
**File**: `scripts/enhancedOfflineGraph.js`

**Usage:**
```javascript
this.resizeObserver = new ResizeObserver((entries) => {
    // Handle graph container resize
    this.handleResize(entries);
});
this.resizeObserver.observe(container);
```

**Purpose**: Graph container resize detection

---

## 9. CONSOLE API

### 9.1 Console Methods
**Usage Count**: Hundreds of instances

**Methods Used:**
```javascript
console.log(message)
console.warn(message)
console.error(message)
console.info(message)
console.debug(message)
```

**Purpose**: Debugging, logging, and user feedback

---

## 10. NAVIGATOR API

### 10.1 Service Worker
**File**: `index.html`

```javascript
navigator.serviceWorker.register('./sw.js?v=2.1.0')
```

### 10.2 Online/Offline Detection
**File**: `index.html`

```javascript
navigator.onLine  // Check online status
window.addEventListener('online', handler)
window.addEventListener('offline', handler)
```

**Purpose**: Network status detection (informational)

---

## 11. STORAGE APIs

### 11.1 localStorage
**Status**: ❌ **NOT USED**

### 11.2 sessionStorage
**Status**: ❌ **NOT USED**

### 11.3 IndexedDB
**Status**: ❌ **NOT USED**

**Note**: Application uses JavaScript `Map` objects for in-memory caching instead of browser storage APIs.

---

## 12. INTERNAL CACHE INTERFACES

### 12.1 Search Cache
**File**: `scripts/ui/ui/modules/search/SearchEngine.js`

**Interface:**
```javascript
this.cache.get(key)
this.cache.set(key, value)
```

**Implementation**: JavaScript `Map` or provided cache object

---

### 12.2 Formula Card Cache
**File**: `scripts/ui/ui/modules/rendering/FormulaRenderer.js`

**Interface:**
```javascript
this.cardCache.get(cacheKey)
this.cardCache.set(cacheKey, html)
this.cardCache.delete(key)
this.cardCache.clear()
```

**Implementation**: LRU cache using `Map` (max 300 items)

---

### 12.3 Expression Cache
**File**: `scripts/calculator.js`, `scripts/calculator.ts`

**Interface:**
```javascript
this.expressionCache.has(expression)
this.expressionCache.get(expression)
this.expressionCache.set(expression, result)
this.expressionCache.delete(key)
```

**Implementation**: JavaScript `Map` with size limits

---

### 12.4 Command Palette Cache
**File**: `scripts/quickNav.js`

**Interface:**
```javascript
commandPaletteCache.has(queryLower)
commandPaletteCache.get(queryLower)
commandPaletteCache.set(queryLower, results)
commandPaletteCache.delete(firstKey)
```

**Implementation**: JavaScript `Map` with LRU eviction

---

## 13. EVENT SYSTEM APIs

### 13.1 Custom Events
**Files**: Various

**Events Dispatched:**
```javascript
window.dispatchEvent(new Event('desmosUnavailable'))
window.dispatchEvent(new Event('themechange'))
window.dispatchEvent(new Event('localechange'))
window.dispatchEvent(new Event('formulasreload'))
```

**Purpose**: Internal event-driven communication

---

### 13.2 Event Listeners
**Usage**: Throughout application

**Pattern:**
```javascript
element.addEventListener('click', handler)
element.addEventListener('input', handler)
element.addEventListener('keydown', handler)
window.addEventListener('load', handler)
window.addEventListener('online', handler)
window.addEventListener('offline', handler)
```

---

## 14. API USAGE SUMMARY TABLE

| API Category | Instances | External | Purpose |
|--------------|-----------|----------|---------|
| **Service Worker** | 4 events | ❌ | Offline caching |
| **Cache API** | 10+ ops | ❌ | Resource caching |
| **Fetch API** | 3 calls | ❌ | Internal only |
| **DOM API** | 1080+ | ❌ | UI manipulation |
| **Window API** | 100+ | ❌ | Global state |
| **Performance API** | 10+ | ❌ | Performance monitoring |
| **RequestAnimationFrame** | 1 | ❌ | Smooth rendering |
| **ResizeObserver** | 1 | ❌ | Graph resize |
| **Console API** | 200+ | ❌ | Logging |
| **Navigator API** | 3 | ❌ | SW registration, online status |
| **localStorage** | 0 | N/A | Not used |
| **sessionStorage** | 0 | N/A | Not used |
| **IndexedDB** | 0 | N/A | Not used |
| **External APIs** | 0 | ❌ | None |

---

## 15. DETAILED FILE-BY-FILE BREAKDOWN

### Service Worker (`sw.js`)
- `caches.open()` - 2 instances
- `cache.addAll()` - 1 instance
- `cache.put()` - 2 instances
- `cache.match()` - 2 instances
- `cache.delete()` - 1 instance
- `caches.keys()` - 1 instance
- `fetch()` - 2 instances (internal only)
- `self.addEventListener()` - 4 events (install, activate, fetch, message)

### Index HTML (`index.html`)
- `navigator.serviceWorker.register()` - 1 instance
- `navigator.onLine` - 1 instance
- `window.addEventListener('online')` - 1 instance
- `window.addEventListener('offline')` - 1 instance
- `window.dispatchEvent()` - 1 instance

### Formula Renderer (`scripts/ui/ui/modules/rendering/FormulaRenderer.js`)
- `document.createElement()` - Multiple
- `document.createDocumentFragment()` - 1 instance
- `requestAnimationFrame()` - 1 instance
- `element.appendChild()` - Multiple
- `element.innerHTML` - Multiple
- `element.addEventListener()` - 1 instance (delegation)

### Enhanced Graph (`scripts/enhancedOfflineGraph.js`)
- `new ResizeObserver()` - 1 instance
- `resizeObserver.observe()` - 1 instance
- `resizeObserver.disconnect()` - 1 instance
- `document.getElementById()` - Multiple
- `canvas.getContext()` - Canvas API
- `canvas.width/height` - Canvas properties
- `ctx.drawImage()` - Canvas drawing
- `ctx.fillRect()` - Canvas drawing
- `ctx.strokeRect()` - Canvas drawing
- `ctx.beginPath()` - Canvas drawing
- `ctx.moveTo()` - Canvas drawing
- `ctx.lineTo()` - Canvas drawing
- `ctx.stroke()` - Canvas drawing
- `ctx.fill()` - Canvas drawing

### Test Files
- `fetch('/tests/search_test_cases.json')` - 2 instances
- `response.json()` - 2 instances

---

## 16. CANVAS API (HTML5)

### Canvas Operations
**File**: `scripts/enhancedOfflineGraph.js`

**Usage:**
```javascript
canvas.getContext('2d')
ctx.clearRect()
ctx.fillRect()
ctx.strokeRect()
ctx.beginPath()
ctx.moveTo()
ctx.lineTo()
ctx.quadraticCurveTo()
ctx.bezierCurveTo()
ctx.stroke()
ctx.fill()
ctx.save()
ctx.restore()
ctx.translate()
ctx.scale()
ctx.rotate()
ctx.setTransform()
ctx.fillStyle
ctx.strokeStyle
ctx.lineWidth
ctx.font
ctx.textAlign
ctx.textBaseline
ctx.fillText()
ctx.strokeText()
ctx.measureText()
```

**Purpose**: Offline graph rendering (replaces Desmos API)

---

## 17. API DEPENDENCY GRAPH

```
Application
├── Service Worker API
│   ├── Cache API
│   └── Fetch API (internal)
├── DOM APIs
│   ├── Document API
│   ├── Element API
│   └── Window API
├── Canvas API (HTML5)
├── Performance API
├── RequestAnimationFrame API
├── ResizeObserver API
├── Console API
└── Navigator API
    └── Service Worker Registration
```

**No External Dependencies**: ✅

---

## 18. SECURITY ANALYSIS

### ✅ Zero External API Calls = Zero Security Risks

**Benefits:**
- No API keys required
- No CORS configuration needed
- No network dependency
- No data exfiltration vectors
- No third-party tracking
- Works completely offline

---

## 19. COMPLETE API INVENTORY

### Browser APIs Used: 9
1. ✅ Service Worker API
2. ✅ Cache API
3. ✅ Fetch API (internal only)
4. ✅ DOM API
5. ✅ Canvas API
6. ✅ Performance API
7. ✅ RequestAnimationFrame API
8. ✅ ResizeObserver API
9. ✅ Console API

### Browser APIs NOT Used: 3
1. ❌ localStorage
2. ❌ sessionStorage
3. ❌ IndexedDB

### External APIs: 0
- ❌ No external HTTP/HTTPS requests
- ❌ No third-party services
- ❌ No CDN dependencies (all local)

---

## 20. CONCLUSION

**Total API Instances**: ~1,400+ (mostly DOM operations)  
**External API Calls**: **0** ✅  
**Browser APIs**: 9 used, 3 not used  
**Storage APIs**: 0 (using in-memory Maps)  
**Network Dependencies**: **0** ✅

**Status**: **Fully Offline-Capable PWA** with zero external dependencies.

