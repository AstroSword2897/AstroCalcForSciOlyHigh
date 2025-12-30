/**
 * DOM Reference Cache
 * Efficient DOM caching with automatic invalidation
 * Uses WeakMap to prevent memory leaks automatically
 */

export class DOMRefs {
    private cache: WeakMap<Element, string> = new WeakMap(); // element -> id
    private idCache: Map<string, HTMLElement> = new Map();   // id -> element
    private observer: MutationObserver | null = null;
    
    constructor() {
        this.setupObserver();
    }
    
    /**
     * Setup MutationObserver to invalidate cache on DOM removal
     * PERFORMANCE: Batch child invalidations to reduce querySelectorAll calls
     */
    private setupObserver(): void {
        if (typeof MutationObserver === 'undefined' || !document.body) return;
        
        this.observer = new MutationObserver((mutations) => {
            // Batch all IDs to invalidate
            const idsToInvalidate = new Set<string>();
            
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const element = node as HTMLElement;
                        
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
    get<T extends HTMLElement = HTMLElement>(id: string): T | null {
        if (!id || typeof id !== 'string') return null;
        
        // Check cache first
        const cached = this.idCache.get(id);
        if (cached) {
            // MutationObserver already invalidates removed nodes, so cached element is valid
            return cached as T;
        }
        
        // Query DOM
        const el = document.getElementById(id) as T | null;
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
    getMultiple<T extends HTMLElement = HTMLElement>(ids: string[]): T[] {
        return ids.map(id => this.get<T>(id)).filter((el): el is T => el !== null);
    }
    
    /**
     * Query selector (not cached, but useful for utility)
     * TYPE-SAFE: Generic type support
     */
    query<T extends Element = Element>(selector: string, parent: Document | Element = document): T | null {
        return parent.querySelector<T>(selector);
    }
    
    /**
     * Query selector all (not cached, but useful for utility)
     * TYPE-SAFE: Generic type support
     */
    queryAll<T extends Element = Element>(selector: string, parent: Document | Element = document): T[] {
        return Array.from(parent.querySelectorAll<T>(selector));
    }
    
    /**
     * Invalidate cache for specific ID
     */
    invalidate(id: string): void {
        const el = this.idCache.get(id);
        if (el) {
            this.cache.delete(el);
        }
        this.idCache.delete(id);
    }
    
    /**
     * Invalidate all cached elements
     */
    invalidateAll(): void {
        this.cache = new WeakMap();
        this.idCache.clear();
    }
    
    /**
     * Preload common elements
     */
    preload(ids: string[]): void {
        ids.forEach(id => this.get(id));
    }
    
    /**
     * Get cache statistics
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.idCache.size,
            keys: Array.from(this.idCache.keys())
        };
    }
    
    /**
     * Cleanup observers and cache
     */
    destroy(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.invalidateAll();
    }
}

// Singleton instance
let domRefsInstance: DOMRefs | null = null;

export function getDOMRefs(): DOMRefs {
    if (!domRefsInstance) {
        domRefsInstance = new DOMRefs();
    }
    return domRefsInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).DOMRefs = DOMRefs;
    (window as any).getDOMRefs = getDOMRefs;
    (window as any).dom = getDOMRefs();
}
