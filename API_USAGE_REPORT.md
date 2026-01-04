# API Usage Report - AstroCalc Application

## Summary

**Application Type**: Offline-First PWA (Progressive Web App)  
**External API Calls**: **NONE** ✅  
**Browser APIs Used**: Service Worker, Cache API, DOM APIs, Performance API  
**Network Dependencies**: None (fully offline-capable)

---

## 1. External API Calls

### ✅ **NO EXTERNAL API CALLS FOUND**

The application is designed to be **completely offline-first**:
- No `fetch()` calls to external URLs
- No `XMLHttpRequest` to external servers
- No third-party API dependencies
- All data is bundled locally

**Evidence:**
```javascript
// From index.html
window.desmosUnavailable = true;
window.offlineMode = true;
console.log('[App] Offline-first mode: All features work without internet connection');
```

**Service Worker Configuration:**
```javascript
// From sw.js line 114-118
// Skip ALL cross-origin requests - we don't make any external API calls
if (!event.request.url.startsWith(self.location.origin)) {
    // Don't intercept external requests - app is offline-first
    return;
}
```

---

## 2. Browser APIs Used

### 2.1 Service Worker API
**Location**: `index.html` (line 704), `sw.js`

**Usage:**
```javascript
// Service Worker Registration
navigator.serviceWorker.register('./sw.js?v=2.0.3')
    .then((registration) => {
        console.log('[Service Worker] Registered successfully:', registration.scope);
        // Periodic update checks
        setInterval(() => {
            registration.update();
        }, 60000);
    });
```

**Purpose**: Offline caching and PWA functionality

---

### 2.2 Cache API
**Location**: `sw.js` (throughout)

**Usage:**
```javascript
// Cache operations
caches.open(CACHE_NAME)
caches.open(RUNTIME_CACHE)
cache.put(event.request, responseToCache)
cache.match(event.request)
cache.delete(oldCache)
```

**Purpose**: 
- Pre-caching application resources
- Runtime caching for offline support
- Cache versioning and cleanup

**Cache Names:**
- `astrocalc-v2.1.0` - Precache
- `astrocalc-runtime-v2.1.0` - Runtime cache

---

### 2.3 Fetch API (Internal Only)
**Location**: `sw.js`, `tests/runSearchTests.html`, `tests/production_test_interface.html`

**Usage:**
```javascript
// Service Worker - internal fetch only
event.respondWith(
    fetch(event.request)
        .then((response) => {
            // Cache response
            cache.put(event.request, responseToCache);
            return response;
        })
        .catch(() => {
            // Fallback to cache
            return caches.match(event.request);
        })
);

// Test files - loading local JSON
fetch('/tests/search_test_cases.json')
    .then(response => response.json())
```

**Purpose**:
- Service Worker: Cache-first strategy for offline support
- Tests: Loading local test data files

**No External URLs**: All fetch calls are to same-origin resources

---

### 2.4 DOM APIs
**Location**: Throughout application

**Common Usage:**
- `document.getElementById()`
- `document.querySelector()`
- `document.createElement()`
- `document.addEventListener()`
- `element.innerHTML`
- `element.appendChild()`
- `window.location`
- `window.history`

**Purpose**: Standard DOM manipulation for UI

---

### 2.5 Storage APIs

#### localStorage
**Status**: ❌ **NOT USED** (application uses in-memory caching)

#### sessionStorage
**Status**: ❌ **NOT USED**

#### IndexedDB
**Status**: ❌ **NOT USED** (application uses Map-based in-memory caches)

**Note**: The application uses JavaScript `Map` objects for caching instead of browser storage APIs.

---

### 2.6 Performance API
**Location**: Various files

**Usage:**
```javascript
performance.now()
performance.mark()
performance.measure()
```

**Purpose**: Performance monitoring and timing

---

### 2.7 RequestAnimationFrame API
**Location**: `scripts/ui/ui/modules/rendering/FormulaRenderer.js`

**Usage:**
```javascript
requestAnimationFrame(() => {
    this.performRender(this.pendingFormulas, container);
});
```

**Purpose**: Smooth rendering of formula cards

---

### 2.8 ResizeObserver API
**Location**: `scripts/enhancedOfflineGraph.js`

**Usage:**
```javascript
this.resizeObserver = new ResizeObserver((entries) => {
    // Handle resize
});
```

**Purpose**: Graph container resize handling

---

### 2.9 Console API
**Location**: Throughout application

**Usage:**
- `console.log()`
- `console.warn()`
- `console.error()`
- `console.info()`

**Purpose**: Debugging and logging

---

## 3. Internal API-Like Interfaces

### 3.1 Window Global Functions
**Location**: Various files expose functions to `window` object

**Examples:**
```javascript
window.FormulaCalculator
window.UnitConverter
window.ExpressionParser
window.SafeMathEvaluator
window.calculateConfidenceScore
window.getConfidenceLevel
window.uiOrchestrator
window.formulas
window.formulaCategories
```

**Purpose**: Module communication and backward compatibility

---

### 3.2 Event System
**Location**: `scripts/events/EventManager.js`, `scripts/ui/migration/events/EventBus.js`

**Custom Events:**
- `desmosUnavailable`
- `themechange`
- `localechange`
- `formulasreload`

**Purpose**: Internal event-driven architecture

---

### 3.3 Cache Interfaces

#### Search Cache
**Location**: `scripts/ui/ui/modules/search/SearchEngine.js`

**Interface:**
```javascript
cache.get(key)
cache.set(key, value)
```

**Implementation**: JavaScript `Map` objects

#### Formula Card Cache
**Location**: `scripts/ui/ui/modules/rendering/FormulaRenderer.js`

**Interface:**
```javascript
this.cardCache.get(cacheKey)
this.cardCache.set(cacheKey, html)
this.cardCache.delete(firstKey)
```

**Implementation**: LRU cache using `Map` (max 300 items)

#### Expression Cache
**Location**: `scripts/calculator.js`

**Interface:**
```javascript
this.expressionCache.has(expression)
this.expressionCache.get(expression)
this.expressionCache.set(expression, result)
```

**Implementation**: JavaScript `Map` with size limits

---

## 4. Network-Related Code

### 4.1 Online/Offline Detection
**Location**: `index.html`

**Usage:**
```javascript
window.addEventListener('online', () => {
    console.log('[App] Online - connection restored');
});

window.addEventListener('offline', () => {
    console.log('[App] Offline - working in offline mode');
});

if (!navigator.onLine) {
    console.log('App started offline - using offline mode');
    window.desmosUnavailable = true;
}
```

**Purpose**: Detect network status (informational only, app works offline)

---

### 4.2 Service Worker Fetch Strategy

**Network-First (Versioned JS):**
```javascript
// For versioned JS files, try network first
if (isVersionedJS) {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
            // Cache successful response
            cache.put(event.request, responseToCache);
            return response;
        })
        .catch(() => {
            // Fallback to cache if network fails
            return caches.match(event.request);
        })
    );
}
```

**Cache-First (Other Resources):**
```javascript
// For other files, use cache first
event.respondWith(
    caches.match(event.request)
        .then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request)
                .then((response) => {
                    // Cache for next time
                    cache.put(event.request, response.clone());
                    return response;
                });
        })
);
```

---

## 5. Test File API Usage

### 5.1 Test Data Loading
**Location**: `tests/runSearchTests.html`, `tests/production_test_interface.html`

**Usage:**
```javascript
// Load local test data
const response = await fetch('/tests/search_test_cases.json');
const testCases = await response.json();
```

**Purpose**: Loading local test case files (same-origin)

---

## 6. API Usage Summary Table

| API Type | Used | External Calls | Purpose |
|----------|------|---------------|---------|
| **Service Worker** | ✅ | ❌ | Offline caching |
| **Cache API** | ✅ | ❌ | Resource caching |
| **Fetch API** | ✅ | ❌ | Internal only (SW, tests) |
| **DOM APIs** | ✅ | ❌ | UI manipulation |
| **Performance API** | ✅ | ❌ | Performance monitoring |
| **RequestAnimationFrame** | ✅ | ❌ | Smooth rendering |
| **ResizeObserver** | ✅ | ❌ | Graph resize handling |
| **localStorage** | ❌ | N/A | Not used |
| **sessionStorage** | ❌ | N/A | Not used |
| **IndexedDB** | ❌ | N/A | Not used |
| **External APIs** | ❌ | ❌ | None |

---

## 7. Security Considerations

### ✅ No External API Calls = No Security Risks

**Benefits:**
- No API keys to manage
- No CORS issues
- No network dependency
- No data exfiltration risk
- Works completely offline

**Offline-First Design:**
- All resources cached locally
- Service Worker handles all requests
- No external dependencies
- Self-contained application

---

## 8. Recommendations

### Current State: ✅ Excellent

The application is **properly designed as offline-first**:
- ✅ No external API dependencies
- ✅ All data bundled locally
- ✅ Service Worker for offline support
- ✅ In-memory caching (no storage API needed)

### No Changes Needed

The application architecture is correct for an offline-first PWA. No external API calls means:
- Better performance (no network latency)
- Better reliability (works offline)
- Better security (no external dependencies)
- Better user experience (instant responses)

---

## Conclusion

**Total External API Calls: 0** ✅  
**Browser APIs Used: 8** (Service Worker, Cache, Fetch, DOM, Performance, RAF, ResizeObserver, Console)  
**Storage APIs Used: 0** (using in-memory Maps instead)  
**Network Dependencies: 0** ✅

The application is **fully offline-capable** with **zero external API dependencies**.

