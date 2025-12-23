/**
 * DOM Reference Cache
 * Reduces repeated DOM queries and improves performance
 */

class DOMRefs {
    constructor() {
        this.cache = new Map();
        this.observer = null;
        this.setupObserver();
    }
    
    /**
     * Setup MutationObserver to invalidate cache when DOM changes
     */
    setupObserver() {
        if (typeof MutationObserver === 'undefined') {
            return;
        }
        
        this.observer = new MutationObserver((mutations) => {
            // Invalidate cache if elements are removed
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const id = node.id;
                        if (id) {
                            this.invalidate(id);
                        }
                        // Also check children
                        const children = node.querySelectorAll('[id]');
                        children.forEach(child => {
                            this.invalidate(child.id);
                        });
                    }
                });
            });
        });
        
        // Observe document body for changes
        if (document.body) {
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    /**
     * Get element by ID (cached)
     */
    get(id) {
        if (!id || typeof id !== 'string') {
            return null;
        }
        
        // Check cache first
        if (this.cache.has(id)) {
            const element = this.cache.get(id);
            // Verify element still exists in DOM
            if (element && document.contains(element)) {
                return element;
            } else {
                // Element was removed, invalidate cache
                this.cache.delete(id);
            }
        }
        
        // Query DOM
        const element = document.getElementById(id);
        if (element) {
            this.cache.set(id, element);
        }
        
        return element;
    }
    
    /**
     * Get multiple elements by IDs
     */
    getMultiple(ids) {
        return ids.map(id => this.get(id)).filter(el => el !== null);
    }
    
    /**
     * Query selector (not cached, but useful for utility)
     */
    query(selector, parent = document) {
        return parent.querySelector(selector);
    }
    
    /**
     * Query selector all (not cached, but useful for utility)
     */
    queryAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }
    
    /**
     * Invalidate cache for specific ID
     */
    invalidate(id) {
        this.cache.delete(id);
    }
    
    /**
     * Invalidate all cache
     */
    invalidateAll() {
        this.cache.clear();
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
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.invalidateAll();
    }
}

// Export singleton instance
if (typeof window !== 'undefined') {
    window.DOMRefs = DOMRefs;
    window.dom = new DOMRefs();
}

