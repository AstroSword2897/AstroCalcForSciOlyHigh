/**
 * Performance Optimizer
 * Implements caching, batching, and lazy loading optimizations
 */

class PerformanceOptimizer {
    constructor() {
        this.calculationCache = new Map();
        this.searchCache = new Map();
        this.renderCache = new Map();
        this.maxCacheSize = 500;
        
        // Batch DOM updates
        this.pendingDOMUpdates = [];
        this.domUpdateScheduled = false;
        
        // Performance metrics
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            renderTime: 0,
            calculationTime: 0
        };
    }
    
    /**
     * Cache calculation result
     */
    cacheCalculation(formulaId, inputs, result) {
        const key = this.generateCacheKey(formulaId, inputs);
        
        // LRU eviction
        if (this.calculationCache.size >= this.maxCacheSize) {
            const firstKey = this.calculationCache.keys().next().value;
            this.calculationCache.delete(firstKey);
        }
        
        this.calculationCache.set(key, {
            result,
            timestamp: Date.now()
        });
    }
    
    /**
     * Get cached calculation
     */
    getCachedCalculation(formulaId, inputs) {
        const key = this.generateCacheKey(formulaId, inputs);
        const cached = this.calculationCache.get(key);
        
        if (cached) {
            this.metrics.cacheHits++;
            return cached.result;
        }
        
        this.metrics.cacheMisses++;
        return null;
    }
    
    /**
     * Cache search results
     */
    cacheSearch(query, results) {
        const key = query.toLowerCase().trim();
        
        if (this.searchCache.size >= 100) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        
        this.searchCache.set(key, {
            results,
            timestamp: Date.now()
        });
    }
    
    /**
     * Get cached search results
     */
    getCachedSearch(query) {
        const key = query.toLowerCase().trim();
        const cached = this.searchCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < 300000) { // 5 min TTL
            return cached.results;
        }
        
        return null;
    }
    
    /**
     * Batch DOM updates for better performance
     */
    batchDOMUpdate(updateFn) {
        this.pendingDOMUpdates.push(updateFn);
        
        if (!this.domUpdateScheduled) {
            this.domUpdateScheduled = true;
            requestAnimationFrame(() => {
                // Execute all pending updates
                const updates = this.pendingDOMUpdates.slice();
                this.pendingDOMUpdates = [];
                this.domUpdateScheduled = false;
                
                // Use DocumentFragment for batch updates
                const fragment = document.createDocumentFragment();
                
                updates.forEach(fn => {
                    try {
                        fn(fragment);
                    } catch (e) {
                        console.error('[PerformanceOptimizer] DOM update error:', e);
                    }
                });
            });
        }
    }
    
    /**
     * Lazy render formulas (virtual scrolling)
     */
    lazyRenderFormulas(formulas, container, renderFn, batchSize = 20) {
        let currentIndex = 0;
        const fragment = document.createDocumentFragment();
        
        const renderBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, formulas.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const element = renderFn(formulas[i]);
                if (element) {
                    fragment.appendChild(element);
                }
            }
            
            container.appendChild(fragment);
            currentIndex = endIndex;
            
            if (currentIndex < formulas.length) {
                // Schedule next batch
                requestIdleCallback ? 
                    requestIdleCallback(renderBatch, { timeout: 100 }) :
                    setTimeout(renderBatch, 0);
            }
        };
        
        renderBatch();
    }
    
    /**
     * Optimized formula card rendering with memoization
     */
    memoizedRenderCard(formula) {
        const cacheKey = `card_${formula.id}`;
        const cached = this.renderCache.get(cacheKey);
        
        if (cached && cached.version === formula.version) {
            return cached.element.cloneNode(true);
        }
        
        // Create new card
        const card = this.createFormulaCard(formula);
        
        // Cache it
        this.renderCache.set(cacheKey, {
            element: card.cloneNode(true),
            version: formula.version || Date.now()
        });
        
        return card;
    }
    
    /**
     * Create formula card (delegated to actual implementation)
     */
    createFormulaCard(formula) {
        // This will be overridden by actual implementation
        return null;
    }
    
    /**
     * Generate cache key
     */
    generateCacheKey(formulaId, inputs) {
        const sorted = Object.keys(inputs)
            .sort()
            .map(k => `${k}:${inputs[k]}`)
            .join('|');
        return `${formulaId}|${sorted}`;
    }
    
    /**
     * Clear all caches
     */
    clearCaches() {
        this.calculationCache.clear();
        this.searchCache.clear();
        this.renderCache.clear();
    }
    
    /**
     * Get performance metrics
     */
    getMetrics() {
        const hitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0 ?
            (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100).toFixed(2) : 0;
        
        return {
            ...this.metrics,
            cacheHitRate: `${hitRate}%`,
            cacheSize: this.calculationCache.size
        };
    }
}

// Create global instance
const performanceOptimizer = new PerformanceOptimizer();

// Expose globally
if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
    window.performanceOptimizer = performanceOptimizer;
}

