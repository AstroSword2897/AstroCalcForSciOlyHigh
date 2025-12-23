/**
 * Calculation Cache - Offline-Ready Result Caching
 * 
 * Provides in-memory and persistent caching for calculation results
 * to improve performance and enable offline operation.
 */

class CalculationCache {
    constructor(maxSize = 1000) {
        this.memoryCache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
    }
    
    /**
     * Generate cache key from formula ID and inputs
     */
    generateKey(formulaId, inputs) {
        // Normalize inputs (sort keys, handle null/undefined)
        const normalized = {};
        const sortedKeys = Object.keys(inputs).sort();
        for (const key of sortedKeys) {
            const value = inputs[key];
            // Skip null/undefined/empty values for key generation
            if (value !== null && value !== undefined && value !== '') {
                normalized[key] = typeof value === 'number' ? value : String(value);
            }
        }
        return `${formulaId}:${JSON.stringify(normalized)}`;
    }
    
    /**
     * Get cached result
     */
    get(formulaId, inputs) {
        const key = this.generateKey(formulaId, inputs);
        const cached = this.memoryCache.get(key);
        
        if (cached) {
            this.hits++;
            return cached.result;
        }
        
        this.misses++;
        return null;
    }
    
    /**
     * Store result in cache
     */
    set(formulaId, inputs, result) {
        const key = this.generateKey(formulaId, inputs);
        
        // Evict oldest entry if cache is full
        if (this.memoryCache.size >= this.maxSize) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }
        
        this.memoryCache.set(key, {
            result: result,
            timestamp: Date.now(),
            formulaId: formulaId
        });
    }
    
    /**
     * Clear cache
     */
    clear() {
        this.memoryCache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total * 100).toFixed(2) : 0;
        return {
            size: this.memoryCache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`
        };
    }
    
    /**
     * Load from IndexedDB (for persistent offline storage)
     */
    async loadFromStorage() {
        if (typeof indexedDB === 'undefined') {
            return; // IndexedDB not available
        }
        
        try {
            // Implementation would go here for IndexedDB loading
            // For now, using in-memory cache only
            console.log('[Cache] IndexedDB loading not yet implemented, using memory cache');
        } catch (e) {
            console.warn('[Cache] Failed to load from storage:', e);
        }
    }
    
    /**
     * Save to IndexedDB (for persistent offline storage)
     */
    async saveToStorage() {
        if (typeof indexedDB === 'undefined') {
            return; // IndexedDB not available
        }
        
        try {
            // Implementation would go here for IndexedDB saving
            // For now, using in-memory cache only
            console.log('[Cache] IndexedDB saving not yet implemented, using memory cache');
        } catch (e) {
            console.warn('[Cache] Failed to save to storage:', e);
        }
    }
}

// Create global instance
const calculationCache = new CalculationCache(1000);

// Expose globally
if (typeof window !== 'undefined') {
    window.CalculationCache = CalculationCache;
    window.calculationCache = calculationCache;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CalculationCache, calculationCache };
}

