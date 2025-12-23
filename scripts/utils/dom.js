/**
 * DOM Utilities Module
 * Extracted from ui.js for better modularity and reusability
 * 
 * Provides:
 * - DOM caching to reduce repeated queries
 * - Batched DOM updates for performance
 * - Common DOM manipulation utilities
 */

/**
 * DOM Cache - Reduces repeated getElementById/querySelector calls
 * Caches frequently accessed DOM elements for better performance
 */
class DOMCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 200; // Prevent unbounded growth
    }

    /**
     * Get element by ID with caching
     * @param {string} id - Element ID
     * @param {boolean} forceRefresh - Force cache refresh
     * @returns {HTMLElement|null}
     */
    getById(id, forceRefresh = false) {
        if (!id) return null;
        
        if (!forceRefresh && this.cache.has(id)) {
            const cached = this.cache.get(id);
            // Verify element still exists in DOM
            if (cached && document.contains(cached)) {
                return cached;
            }
            // Element removed, clear cache
            this.cache.delete(id);
        }

        const element = document.getElementById(id);
        if (element) {
            // Limit cache size
            if (this.cache.size >= this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(id, element);
        }
        return element;
    }

    /**
     * Get element by selector with caching
     * @param {string} selector - CSS selector
     * @param {boolean} forceRefresh - Force cache refresh
     * @returns {HTMLElement|null}
     */
    query(selector, forceRefresh = false) {
        if (!selector) return null;
        const cacheKey = `query:${selector}`;
        
        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (cached && document.contains(cached)) {
                return cached;
            }
            this.cache.delete(cacheKey);
        }

        const element = document.querySelector(selector);
        if (element) {
            if (this.cache.size >= this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(cacheKey, element);
        }
        return element;
    }

    /**
     * Invalidate cache for specific ID or selector
     * @param {string} key - ID or selector
     */
    invalidate(key) {
        this.cache.delete(key);
        this.cache.delete(`query:${key}`);
    }

    /**
     * Clear all cached elements
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * Batch DOM updates using requestAnimationFrame
 * Prevents layout thrashing by batching multiple DOM operations
 */
class DOMUpdateBatcher {
    constructor() {
        this.pendingUpdates = [];
        this.rafId = null;
    }

    /**
     * Schedule a DOM update
     * @param {Function} updateFn - Function that performs DOM update
     * @param {number} priority - Update priority (lower = higher priority)
     */
    schedule(updateFn, priority = 0) {
        this.pendingUpdates.push({ fn: updateFn, priority });
        this.pendingUpdates.sort((a, b) => a.priority - b.priority);
        this.flush();
    }

    /**
     * Flush pending updates
     */
    flush() {
        if (this.rafId !== null) return; // Already scheduled

        this.rafId = requestAnimationFrame(() => {
            // Process updates in priority order
            const updates = this.pendingUpdates.splice(0);
            updates.forEach(({ fn }) => {
                try {
                    fn();
                } catch (error) {
                    console.error('[DOMUpdateBatcher] Error in update:', error);
                }
            });
            this.rafId = null;

            // If more updates queued, schedule another batch
            if (this.pendingUpdates.length > 0) {
                this.flush();
            }
        });
    }

    /**
     * Clear all pending updates
     */
    clear() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.pendingUpdates = [];
    }
}

/**
 * Force element visibility with all necessary style properties
 * Consolidates redundant visibility operations throughout the codebase
 * 
 * @param {HTMLElement} element - Element to make visible
 * @param {Object} options - Optional configuration
 * @param {string} options.display - Display value (default: 'block')
 * @param {boolean} options.forceReflow - Force browser reflow (default: false)
 */
function forceElementVisibility(element, options = {}) {
    if (!element) return;
    
    const {
        display = 'block',
        forceReflow = false
    } = options;
    
    element.style.setProperty('display', display, 'important');
    element.style.setProperty('visibility', 'visible', 'important');
    element.style.setProperty('opacity', '1', 'important');
    
    if (forceReflow) {
        // Force browser reflow to ensure styles are applied
        void element.offsetHeight;
    }
}

/**
 * Force element visible with batched updates
 * Uses DOMUpdateBatcher for better performance
 */
function forceElementVisibilityBatched(element, options = {}, batcher) {
    if (!element || !batcher) {
        forceElementVisibility(element, options);
        return;
    }
    
    batcher.schedule(() => {
        forceElementVisibility(element, options);
    }, 0);
}

// Create global instances
// Use var instead of const to allow redeclaration in other files if needed
var domCache = new DOMCache();
var domBatcher = new DOMUpdateBatcher();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DOMUtils = {
        DOMCache,
        DOMUpdateBatcher,
        domCache,
        domBatcher,
        forceElementVisibility,
        forceElementVisibilityBatched
    };
}

