/**
 * DOM Reference Cache
 * Efficient DOM caching with automatic invalidation
 * Uses WeakMap to prevent memory leaks automatically
 */
export class DOMRefs {
    constructor() {
        this.cache = new WeakMap(); // element -> id
        this.idCache = new Map(); // id -> element
        this.observer = null;
        this.setupObserver();
    }
    /**
     * Setup MutationObserver to invalidate cache on DOM removal
     * PERFORMANCE: Batch child invalidations to reduce querySelectorAll calls
     */
    setupObserver() {
        if (typeof MutationObserver === 'undefined' || !document.body)
            return;
        this.observer = new MutationObserver((mutations) => {
            // Batch all IDs to invalidate
            const idsToInvalidate = new Set();
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const element = node;
                        // Add element's own ID if it has one
                        if (element.id) {
                            idsToInvalidate.add(element.id);
                        }
                        // Batch collect child IDs (single querySelectorAll call)
                        const children = element.querySelectorAll('[id]');
                        children.forEach(child => {
                            if (child.id) {
                                idsToInvalidate.add(child.id);
                            }
                        });
                    }
                });
            });
            // Invalidate all collected IDs at once
            idsToInvalidate.forEach(id => this.invalidate(id));
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    /**
     * Get element by ID (cached)
     * PERFORMANCE: Skip document.contains check since MutationObserver handles removals
     * TYPE-SAFE: Generic type support for better type inference
     */
    get(id) {
        if (!id || typeof id !== 'string')
            return null;
        // Check cache first
        const cached = this.idCache.get(id);
        if (cached) {
            // MutationObserver already invalidates removed nodes, so cached element is valid
            return cached;
        }
        // Query DOM
        const el = document.getElementById(id);
        if (el) {
            this.idCache.set(id, el);
            this.cache.set(el, id);
        }
        return el;
    }
    /**
     * Get multiple elements by IDs
     * TYPE-SAFE: Generic type support
     */
    getMultiple(ids) {
        return ids.map(id => this.get(id)).filter((el) => el !== null);
    }
    /**
     * Query selector (not cached, but useful for utility)
     * TYPE-SAFE: Generic type support
     */
    query(selector, parent = document) {
        return parent.querySelector(selector);
    }
    /**
     * Query selector all (not cached, but useful for utility)
     * TYPE-SAFE: Generic type support
     */
    queryAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }
    /**
     * Invalidate cache for specific ID
     */
    invalidate(id) {
        const el = this.idCache.get(id);
        if (el) {
            this.cache.delete(el);
        }
        this.idCache.delete(id);
    }
    /**
     * Invalidate all cached elements
     */
    invalidateAll() {
        this.cache = new WeakMap();
        this.idCache.clear();
    }
    /**
     * Preload common elements
     */
    preload(ids) {
        ids.forEach(id => this.get(id));
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.idCache.size,
            keys: Array.from(this.idCache.keys())
        };
    }
    /**
     * Cleanup observers and cache
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.invalidateAll();
    }
}
// Singleton instance
let domRefsInstance = null;
export function getDOMRefs() {
    if (!domRefsInstance) {
        domRefsInstance = new DOMRefs();
    }
    return domRefsInstance;
}
// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    window.DOMRefs = DOMRefs;
    window.getDOMRefs = getDOMRefs;
    window.dom = getDOMRefs();
}
