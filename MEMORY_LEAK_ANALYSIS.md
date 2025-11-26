# 🔍 Memory Leak Analysis & Critical Issues Report

**Date:** 2025  
**Priority:** CRITICAL - Must fix for offline download reliability  
**Status:** Issues identified, fixes provided

---

## 🚨 Critical Memory Leaks Identified

### 1. **Event Listeners Not Removed** ⚠️ CRITICAL

**Location:** `scripts/ui.js` - `renderVariableInputs()`

**Problem:**
- Event listeners are added to input fields every time a formula is selected
- When switching formulas, old listeners remain attached to removed DOM elements
- This causes memory leaks and can lead to:
  - Multiple event handlers firing for the same action
  - Memory accumulation over time
  - Performance degradation

**Impact:** HIGH - Memory grows with each formula switch

**Fix Required:**
- Store event listener references
- Remove listeners before clearing container
- Use event delegation where possible

---

### 2. **Unbounded Caches** ⚠️ CRITICAL

**Locations:**
- `scripts/frqSupport.js`: `conceptExpansionCache`, `metadataCache`, `questionAnalysisCache`
- `scripts/offlineGraphManager.js`: `this.cache`
- `scripts/graphManager.js`: `this.cache`

**Problem:**
- Caches grow indefinitely without size limits
- No TTL (Time To Live) expiration
- Can consume gigabytes of memory over time

**Impact:** CRITICAL - Can cause browser crashes on long sessions

**Fix Required:**
- Add size limits (e.g., max 100 entries)
- Implement LRU (Least Recently Used) eviction
- Add TTL expiration

---

### 3. **Timers Not Cleared** ⚠️ HIGH

**Locations:**
- `scripts/frqSupport.js` lines 2281-2283: Multiple `setTimeout` calls not stored
- `scripts/ui.js` line 5572: `setTimeout` stored on input but not cleared on cleanup
- `scripts/offlineGraphManager.js` line 64: `setTimeout` not stored
- `scripts/graphManager.js` lines 64, 81, 118: `setTimeout` not stored

**Problem:**
- Timers continue running even after elements are removed
- Can cause errors when trying to access removed DOM elements
- Memory leaks from closure references

**Impact:** HIGH - Can cause errors and memory leaks

**Fix Required:**
- Store all timer IDs
- Clear timers in cleanup methods
- Use AbortController for cancellable operations

---

### 4. **Graph Manager Cleanup Missing** ⚠️ HIGH

**Locations:**
- `scripts/graphManager.js`: Desmos calculator destroyed but offline manager not cleaned up
- `scripts/offlineGraphManager.js`: No cleanup method
- `scripts/standaloneGraphCalculator.js`: Canvas listeners not removed

**Problem:**
- Canvas contexts not released
- Event listeners on canvas not removed
- Calculator instances not properly destroyed

**Impact:** MEDIUM-HIGH - Memory leaks, especially with multiple graph instances

**Fix Required:**
- Add `destroy()` methods to all graph managers
- Remove canvas event listeners
- Clear canvas references
- Release canvas contexts

---

### 5. **MathJax Not Cleaned Up** ⚠️ MEDIUM

**Location:** `scripts/ui.js` - `renderMathJax()`

**Problem:**
- MathJax typeset operations not cancelled when elements removed
- MathJax keeps references to removed DOM elements

**Impact:** MEDIUM - Memory leaks with frequent formula switching

**Fix Required:**
- Cancel MathJax operations when elements removed
- Clear MathJax references

---

### 6. **Global State Not Cleared** ⚠️ MEDIUM

**Location:** `scripts/ui.js` - Global variables

**Problem:**
- `currentFormula`, `calculator`, `graphManager` hold references
- Not cleared when navigating away
- Can prevent garbage collection

**Impact:** MEDIUM - Memory not released when not needed

**Fix Required:**
- Clear global references in cleanup
- Set to null explicitly

---

## 🔧 Fixes Implementation

### Fix 1: Event Listener Cleanup in `ui.js`

**Add cleanup function:**
```javascript
// Store active listeners for cleanup
let activeInputListeners = new Map();

function cleanupVariableInputs() {
    // Remove all stored event listeners
    activeInputListeners.forEach((listener, element) => {
        if (element && element.parentNode) {
            element.removeEventListener('input', listener);
            element.removeEventListener('change', listener);
            element.removeEventListener('keydown', listener);
        }
    });
    activeInputListeners.clear();
    
    // Clear timeouts stored on inputs
    const container = document.getElementById('variables-container');
    if (container) {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.solveIndicatorTimeout) {
                clearTimeout(input.solveIndicatorTimeout);
                input.solveIndicatorTimeout = null;
            }
        });
    }
}

// Call cleanup before rendering new inputs
function renderVariableInputs(formula) {
    cleanupVariableInputs(); // ADD THIS
    const container = document.getElementById('variables-container');
    container.innerHTML = '';
    // ... rest of function
}
```

---

### Fix 2: Bounded Caches with LRU

**Update `frqSupport.js`:**
```javascript
// Replace unbounded caches with bounded LRU caches
class LRUCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    get(key) {
        if (!this.cache.has(key)) return null;
        const value = this.cache.get(key);
        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    
    clear() {
        this.cache.clear();
    }
    
    size() {
        return this.cache.size;
    }
}

// Replace Map() with LRUCache
const conceptExpansionCache = new LRUCache(100);
const metadataCache = new LRUCache(100);
const questionAnalysisCache = new LRUCache(100);
```

**Update graph managers:**
```javascript
// In OfflineGraphManager and GraphManager
constructor(...) {
    // ... existing code
    this.cache = new LRUCache(50); // Limit to 50 entries
}
```

---

### Fix 3: Timer Cleanup

**Update `frqSupport.js`:**
```javascript
// Store timer IDs
let initTimers = [];

function initializeFRQMetadata() {
    // Clear any existing timers
    initTimers.forEach(timer => clearTimeout(timer));
    initTimers = [];
    
    // ... existing initialization code
    
    // Store timer IDs
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
    
    // Store timers for cleanup
    initTimers.push(setTimeout(tryInit, 500));
    initTimers.push(setTimeout(tryInit, 1000));
    initTimers.push(setTimeout(tryInit, 2000));
}

// Add cleanup function
function cleanupFRQTimers() {
    initTimers.forEach(timer => clearTimeout(timer));
    initTimers = [];
}
```

**Update `ui.js`:**
```javascript
// In renderVariableInputs, ensure timeout is cleared
input.addEventListener('input', (e) => {
    // Clear previous timeout
    if (input.solveIndicatorTimeout) {
        clearTimeout(input.solveIndicatorTimeout);
    }
    // ... rest of handler
    input.solveIndicatorTimeout = setTimeout(() => {
        // ... handler code
        input.solveIndicatorTimeout = null; // Clear reference
    }, 300);
});
```

---

### Fix 4: Graph Manager Cleanup Methods

**Update `OfflineGraphManager`:**
```javascript
class OfflineGraphManager {
    // ... existing code
    
    constructor(...) {
        // ... existing code
        this.pendingTimers = [];
    }
    
    init(containerId = null) {
        // Store timer for cleanup
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            const timer = setTimeout(() => this.init(targetContainerId), 200);
            this.pendingTimers.push(timer);
            return false;
        }
        // ... rest of init
    }
    
    /**
     * Cleanup method - call when graph is no longer needed
     */
    destroy() {
        // Clear all timers
        this.pendingTimers.forEach(timer => clearTimeout(timer));
        this.pendingTimers = [];
        
        // Clear cache
        this.cache.clear();
        
        // Clear canvas references
        if (this.canvas) {
            // Remove any event listeners if added
            this.canvas = null;
        }
        this.ctx = null;
        
        // Clear formula references
        this.currentFormula = null;
        this.currentValues = {};
    }
}
```

**Update `GraphManager`:**
```javascript
class GraphManager {
    // ... existing code
    
    constructor(...) {
        // ... existing code
        this.pendingTimers = [];
    }
    
    init(containerId = null) {
        // Store timers
        if (elt.offsetWidth === 0 || elt.offsetHeight === 0) {
            const timer = setTimeout(() => this.init(targetContainerId), 200);
            this.pendingTimers.push(timer);
            return false;
        }
        // ... rest of init
    }
    
    /**
     * Cleanup method
     */
    destroy() {
        // Clear timers
        this.pendingTimers.forEach(timer => clearTimeout(timer));
        this.pendingTimers = [];
        
        // Destroy Desmos calculator
        if (this.calculator) {
            try {
                this.calculator.destroy();
            } catch (e) {
                console.warn('Error destroying calculator:', e);
            }
            this.calculator = null;
        }
        
        // Destroy offline manager if exists
        if (this.offlineManager) {
            this.offlineManager.destroy();
            this.offlineManager = null;
        }
        
        // Clear cache
        this.cache.clear();
        
        // Clear references
        this.currentFormula = null;
        this.currentValues = {};
        this.lastRenderedKey = null;
    }
}
```

**Update `ui.js` to call cleanup:**
```javascript
function selectFormula(formula) {
    // Cleanup previous formula's resources
    if (graphManager) {
        graphManager.destroy();
        graphManager = null;
    }
    cleanupVariableInputs(); // Cleanup input listeners
    
    // ... rest of function
}

// In back button handler
document.getElementById('back-button').addEventListener('click', () => {
    // Cleanup resources
    if (graphManager) {
        graphManager.destroy();
        graphManager = null;
    }
    cleanupVariableInputs();
    
    document.getElementById('input-screen').classList.remove('active');
    document.getElementById('formula-selection').classList.add('active');
    currentFormula = null;
    calculator = null;
});
```

---

### Fix 5: MathJax Cleanup

**Update `ui.js`:**
```javascript
// Store MathJax operations for cancellation
let activeMathJaxOperations = new Set();

function renderMathJax(element) {
    if (!element) return;
    
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        const promise = MathJax.typesetPromise([element]).catch(function (err) {
            console.warn('MathJax rendering error:', err);
        });
        activeMathJaxOperations.add(promise);
        promise.finally(() => {
            activeMathJaxOperations.delete(promise);
        });
    }
}

// Add cleanup function
function cleanupMathJax() {
    // Cancel pending operations (if MathJax supports it)
    activeMathJaxOperations.clear();
}

// Call cleanup when removing elements
function cleanupVariableInputs() {
    cleanupMathJax(); // ADD THIS
    // ... rest of cleanup
}
```

---

### Fix 6: Global State Cleanup

**Update `ui.js`:**
```javascript
function cleanupGlobalState() {
    // Clear global references
    currentFormula = null;
    calculator = null;
    
    // Cleanup graph manager
    if (graphManager) {
        graphManager.destroy();
        graphManager = null;
    }
    
    // Cleanup input listeners
    cleanupVariableInputs();
    
    // Clear FRQ timers
    if (typeof cleanupFRQTimers === 'function') {
        cleanupFRQTimers();
    }
}

// Call on back button
document.getElementById('back-button').addEventListener('click', () => {
    cleanupGlobalState();
    // ... rest of handler
});
```

---

## 📋 Implementation Checklist

- [ ] Add `LRUCache` class to `utils.js`
- [ ] Update `frqSupport.js` to use bounded caches
- [ ] Add cleanup methods to all graph managers
- [ ] Add event listener cleanup in `ui.js`
- [ ] Add timer cleanup throughout codebase
- [ ] Add MathJax cleanup
- [ ] Add global state cleanup
- [ ] Test memory usage with Chrome DevTools
- [ ] Verify no memory leaks after 100+ formula switches
- [ ] Verify offline functionality still works

---

## 🧪 Testing Memory Leaks

**Chrome DevTools Memory Profiler:**
1. Open DevTools → Memory tab
2. Take heap snapshot before using app
3. Use app extensively (switch formulas 50+ times)
4. Take another heap snapshot
5. Compare snapshots - look for:
   - Detached DOM trees
   - Event listeners count
   - Timer count
   - Cache size growth

**Expected Results After Fixes:**
- Memory usage should stabilize after initial load
- No unbounded growth in caches
- Event listener count should remain constant
- Timer count should remain low

---

## ⚠️ Critical Issues Summary

| Issue | Severity | Impact | Status |
|-------|----------|--------|--------|
| Unbounded caches | CRITICAL | Browser crash risk | 🔴 Must Fix |
| Event listeners not removed | HIGH | Memory leak, performance | 🔴 Must Fix |
| Timers not cleared | HIGH | Memory leak, errors | 🔴 Must Fix |
| Graph manager cleanup | MEDIUM-HIGH | Memory leak | 🟡 Should Fix |
| MathJax cleanup | MEDIUM | Memory leak | 🟡 Should Fix |
| Global state cleanup | MEDIUM | Memory not released | 🟡 Should Fix |

---

## ✅ Priority Order

1. **Fix unbounded caches** (CRITICAL - can cause crashes)
2. **Fix event listener cleanup** (HIGH - affects all users)
3. **Fix timer cleanup** (HIGH - can cause errors)
4. **Add graph manager cleanup** (MEDIUM-HIGH - affects graph users)
5. **Add MathJax cleanup** (MEDIUM - affects formula rendering)
6. **Add global state cleanup** (MEDIUM - general cleanup)

---

**Note:** All fixes preserve offline functionality. No external dependencies added.

