/**
 * Performance Optimizer
 * Implements caching, batching, and lazy loading optimizations
 */

class PerformanceOptimizer {
    constructor() {
        // True LRU caches: Map maintains insertion order, we'll track access times
        this.calculationCache = new Map(); // key -> { result, timestamp, lastAccess }
        this.searchCache = new Map(); // key -> { results, timestamp, lastAccess }
        this.renderCache = new Map(); // key -> { element, version, lastAccess }
        this.maxCacheSize = 500;
        
        // Batch DOM updates
        this.pendingDOMUpdates = [];
        this.domUpdateScheduled = false;
        
        // Performance metrics
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            renderTime: 0,
            calculationTime: 0,
            domUpdateTime: 0
        };
    }
    
    /**
     * Cache calculation result with true LRU eviction
     */
    cacheCalculation(formulaId, inputs, result) {
        const key = this.generateCacheKey(formulaId, inputs);
        const now = Date.now();
        
        // True LRU eviction: remove least recently used
        if (this.calculationCache.size >= this.maxCacheSize) {
            // Find least recently accessed entry
            let lruKey = null;
            let lruTime = Infinity;
            for (const [k, v] of this.calculationCache.entries()) {
                if (v.lastAccess < lruTime) {
                    lruTime = v.lastAccess;
                    lruKey = k;
                }
            }
            if (lruKey) {
                this.calculationCache.delete(lruKey);
            }
        }
        
        this.calculationCache.set(key, {
            result,
            timestamp: now,
            lastAccess: now
        });
    }
    
    /**
     * Get cached calculation with access tracking
     */
    getCachedCalculation(formulaId, inputs) {
        const key = this.generateCacheKey(formulaId, inputs);
        const cached = this.calculationCache.get(key);
        
        if (cached) {
            // Update last access time (true LRU)
            cached.lastAccess = Date.now();
            this.metrics.cacheHits++;
            return cached.result;
        }
        
        this.metrics.cacheMisses++;
        return null;
    }
    
    /**
     * Cache search results with TTL and LRU
     */
    cacheSearch(query, results) {
        const key = query.toLowerCase().trim();
        const now = Date.now();
        
        if (this.searchCache.size >= 100) {
            // Find least recently accessed entry
            let lruKey = null;
            let lruTime = Infinity;
            for (const [k, v] of this.searchCache.entries()) {
                if (v.lastAccess < lruTime) {
                    lruTime = v.lastAccess;
                    lruKey = k;
                }
            }
            if (lruKey) {
                this.searchCache.delete(lruKey);
            }
        }
        
        this.searchCache.set(key, {
            results,
            timestamp: now,
            lastAccess: now
        });
    }
    
    /**
     * Get cached search results with TTL check
     */
    getCachedSearch(query) {
        const key = query.toLowerCase().trim();
        const cached = this.searchCache.get(key);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < 300000) { // 5 min TTL
            cached.lastAccess = now; // Update access time
            return cached.results;
        }
        
        return null;
    }
    
    /**
     * Batch DOM updates for better performance with timing
     */
    batchDOMUpdate(updateFn) {
        this.pendingDOMUpdates.push(updateFn);
        
        if (!this.domUpdateScheduled) {
            this.domUpdateScheduled = true;
            requestAnimationFrame(() => {
                const startTime = performance.now();
                
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
                
                // Track timing
                this.metrics.domUpdateTime += performance.now() - startTime;
            });
        }
    }
    
    /**
     * Lazy render formulas (virtual scrolling)
     * Fixed: Creates new DocumentFragment per batch
     */
    lazyRenderFormulas(formulas, container, renderFn, batchSize = 20) {
        let currentIndex = 0;
        
        const renderBatch = () => {
            // Create new fragment for each batch (fixes reuse issue)
            const fragment = document.createDocumentFragment();
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
                // Polyfill requestIdleCallback for older browsers
                const ric = window.requestIdleCallback || function(cb) { 
                    return setTimeout(cb, 50); 
                };
                ric(renderBatch, { timeout: 100 });
            }
        };
        
        renderBatch();
    }
    
    /**
     * Generate stable hash for formula content (for versioning)
     */
    _hashFormulaContent(formula) {
        // Create stable hash from formula content instead of Date.now()
        const content = JSON.stringify({
            id: formula.id,
            name: formula.name,
            equation: formula.equation,
            description: formula.description,
            variables: formula.variables?.map(v => v.symbol).sort()
        });
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    
    /**
     * Optimized formula card rendering with memoization
     * Fixed: Uses content hash instead of Date.now() for versioning
     */
    memoizedRenderCard(formula) {
        const cacheKey = `card_${formula.id}`;
        const cached = this.renderCache.get(cacheKey);
        const version = formula.version || this._hashFormulaContent(formula);
        
        if (cached && cached.version === version) {
            cached.lastAccess = Date.now();
            return cached.element.cloneNode(true);
        }
        
        const startTime = performance.now();
        
        // Create new card
        const card = this.createFormulaCard(formula);
        
        if (!card) {
            console.warn('[PerformanceOptimizer] createFormulaCard returned null for:', formula.id);
            return null;
        }
        
        // Cache it with version and access time
        this.renderCache.set(cacheKey, {
            element: card.cloneNode(true),
            version: version,
            lastAccess: Date.now()
        });
        
        // Track render time
        this.metrics.renderTime += performance.now() - startTime;
        
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

