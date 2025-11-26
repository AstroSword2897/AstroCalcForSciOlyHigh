/**
 * Utility Functions for AstroCalc
 * Shared utilities for logging, caching, and performance
 */

// Debug flag - set to true for development, false for production
const DEBUG = window.location.hostname === 'localhost' || 
              window.location.search.includes('debug=true') ||
              window.location.search.includes('DEBUG=true');

/**
 * Logger utility - conditionally logs based on DEBUG flag
 */
const logger = {
    log: (...args) => {
        if (DEBUG) console.log('[LOG]', ...args);
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },
    warn: (...args) => {
        if (DEBUG) console.warn('[WARN]', ...args);
    },
    info: (...args) => {
        if (DEBUG) console.info('[INFO]', ...args);
    },
    debug: (...args) => {
        if (DEBUG) console.debug('[DEBUG]', ...args);
    }
};

/**
 * Safe execution wrapper - catches errors and provides fallback
 */
function safeExecute(fn, fallback = null, errorMessage = 'Error executing function') {
    try {
        return fn();
    } catch (error) {
        logger.error(errorMessage, error);
        if (fallback) {
            if (typeof fallback === 'function') {
                return fallback();
            }
            return fallback;
        }
        return null;
    }
}

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds (default: 300)
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    // Input validation
    if (typeof func !== 'function') {
        throw new Error('debounce: First argument must be a function');
    }
    if (typeof wait !== 'number' || !isFinite(wait) || wait < 0) {
        wait = 300; // Default to 300ms
    }
    
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - limits execution to once per wait time
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds (default: 300)
 * @returns {Function} Throttled function
 */
function throttle(func, wait = 300) {
    // Input validation
    if (typeof func !== 'function') {
        throw new Error('throttle: First argument must be a function');
    }
    if (typeof wait !== 'number' || !isFinite(wait) || wait < 0) {
        wait = 300; // Default to 300ms
    }
    
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

/**
 * Simple cache with size limit and TTL (time to live)
 */
class SimpleCache {
    constructor(maxSize = 100, ttl = 300000) { // Default: 100 entries, 5 min TTL
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        // Check if expired
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    set(key, value) {
        // Remove oldest if at max size
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    clear() {
        this.cache.clear();
    }
    
    size() {
        return this.cache.size;
    }
}

/**
 * LRU Cache - Least Recently Used cache with size limit
 * Moves accessed items to end, removes from beginning when full
 */
class LRUCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    
    get(key) {
        if (!this.cache.has(key)) return null;
        const value = this.cache.get(key);
        // Move to end (most recently used) - LRU behavior
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            // Update existing - move to end
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    
    has(key) {
        return this.cache.has(key);
    }
    
    delete(key) {
        return this.cache.delete(key);
    }
    
    clear() {
        this.cache.clear();
    }
    
    size() {
        return this.cache.size;
    }
}

/**
 * Memoization helper - caches function results
 */
function memoize(fn, keyGenerator = null) {
    const cache = new Map();
    return function(...args) {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.logger = logger;
    window.safeExecute = safeExecute;
    window.debounce = debounce;
    window.throttle = throttle;
    window.SimpleCache = SimpleCache;
    window.LRUCache = LRUCache;
    window.memoize = memoize;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        logger,
        safeExecute,
        debounce,
        throttle,
        SimpleCache,
        LRUCache,
        memoize
    };
}

