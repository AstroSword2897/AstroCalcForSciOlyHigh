/**
 * DOM element cache to reduce repeated queries
 */

export class DOMCache {
    private cache: Map<string, HTMLElement | null> = new Map();

    /**
     * Get element by ID (cached)
     */
    get(id: string): HTMLElement | null {
        if (!this.cache.has(id)) {
            this.cache.set(id, document.getElementById(id));
        }
        return this.cache.get(id)!;
    }

    /**
     * Query selector (cached by selector string)
     */
    query(selector: string): HTMLElement | null {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelector(selector));
        }
        return this.cache.get(selector)!;
    }

    /**
     * Invalidate cache for specific ID
     */
    invalidate(id: string): void {
        this.cache.delete(id);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Preload common elements
     */
    preload(ids: string[]): void {
        ids.forEach(id => {
            if (!this.cache.has(id)) {
                this.cache.set(id, document.getElementById(id));
            }
        });
    }
}

// Singleton instance
let domCacheInstance: DOMCache | null = null;

export function getDOMCache(): DOMCache {
    if (!domCacheInstance) {
        domCacheInstance = new DOMCache();
    }
    return domCacheInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).DOMCache = DOMCache;
    (window as any).getDOMCache = getDOMCache;
    (window as any).domCache = getDOMCache();
}

