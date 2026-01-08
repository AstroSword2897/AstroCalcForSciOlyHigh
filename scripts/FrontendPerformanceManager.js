/**
 * FrontendPerformanceManager
 * Unified high-performance frontend manager combining:
 * - Caching (calculations, searches, renders)
 * - Lazy module loading
 * - DOM batching and virtual scrolling
 * - Performance metrics
 */

class FrontendPerformanceManager {
    constructor(options = {}) {
        // Cache configuration
        this.maxCacheSize = options.maxCacheSize || 500;
        this.searchCacheSize = options.searchCacheSize || 100;
        this.searchCacheTTL = options.searchCacheTTL || 300000; // 5 min default
        
        // True LRU caches with access tracking
        this.calculationCache = new Map(); // key -> { result, timestamp, lastAccess }
        this.searchCache = new Map(); // key -> { results, timestamp, lastAccess }
        this.renderCache = new Map(); // key -> { element, version, lastAccess }
        
        // Lazy module loading
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.modulePaths = options.modulePaths || {
            explorer: './formulaExplorer.js',
            frq: './frqSupport.js',
            graph: ['./enhancedOfflineGraph.js', './graphManager.js']
        };
        
        // Batch DOM updates
        this.pendingDOMUpdates = [];
        this.domUpdateScheduled = false;
        
        // Performance metrics
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            renderTime: 0,
            calculationTime: 0,
            domUpdateTime: 0,
            moduleLoadTime: 0
        };
    }
    
    // ============================================
    // CACHING METHODS
    // ============================================
    
    /**
     * Cache calculation result with true LRU eviction
     */
    cacheCalculation(formulaId, inputs, result) {
        const key = this.generateCacheKey(formulaId, inputs);
        const now = Date.now();
        
        // True LRU eviction: remove least recently used
        if (this.calculationCache.size >= this.maxCacheSize) {
            this._evictLRU(this.calculationCache);
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
        
        if (this.searchCache.size >= this.searchCacheSize) {
            this._evictLRU(this.searchCache);
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
        
        if (cached && (now - cached.timestamp) < this.searchCacheTTL) {
            cached.lastAccess = now;
            return cached.results;
        }
        
        return null;
    }
    
    /**
     * Evict least recently used entry from cache
     */
    _evictLRU(cache) {
        let lruKey = null;
        let lruTime = Infinity;
        for (const [k, v] of cache.entries()) {
            if (v.lastAccess < lruTime) {
                lruTime = v.lastAccess;
                lruKey = k;
            }
        }
        if (lruKey) {
            cache.delete(lruKey);
        }
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
    
    // ============================================
    // LAZY MODULE LOADING
    // ============================================
    
    /**
     * Lazy load module by name
     */
    async loadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }
        
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }
        
        const startTime = performance.now();
        const modulePath = this.modulePaths[moduleName];
        
        if (!modulePath) {
            throw new Error(`Module path not configured for: ${moduleName}`);
        }
        
        const loadPromise = (Array.isArray(modulePath) 
            ? Promise.all(modulePath.map(p => import(p)))
            : import(modulePath)
        )
            .then(modules => {
                const result = Array.isArray(modules) 
                    ? modules.reduce((acc, m, i) => {
                        acc[Object.keys(m)[0] || `module${i}`] = m;
                        return acc;
                    }, {})
                    : modules;
                
                this.loadedModules.set(moduleName, result);
                this.loadingPromises.delete(moduleName);
                this.metrics.moduleLoadTime += performance.now() - startTime;
                console.log(`[FrontendPerformanceManager] ✅ Module loaded: ${moduleName}`);
                return result;
            })
            .catch(error => {
                this.loadingPromises.delete(moduleName);
                console.error(`[FrontendPerformanceManager] Failed to load ${moduleName}:`, error);
                throw error;
            });
        
        this.loadingPromises.set(moduleName, loadPromise);
        return loadPromise;
    }
    
    /**
     * Lazy load explorer module
     */
    async loadExplorerModule() {
        return this.loadModule('explorer');
    }
    
    /**
     * Lazy load FRQ module
     */
    async loadFRQModule() {
        return this.loadModule('frq');
    }
    
    /**
     * Lazy load graph modules
     */
    async loadGraphModule() {
        return this.loadModule('graph');
    }
    
    /**
     * Preload modules in background
     */
    preloadModules(delay = 2000) {
        setTimeout(() => {
            this.loadExplorerModule().catch(() => {});
            this.loadFRQModule().catch(() => {});
            this.loadGraphModule().catch(() => {});
        }, delay);
    }
    
    /**
     * Check if module is loaded
     */
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
    
    // ============================================
    // DOM BATCHING & RENDERING
    // ============================================
    
    /**
     * Batch DOM updates for better performance with timing
     */
    batchDOMUpdate(updateFn) {
        this.pendingDOMUpdates.push(updateFn);
        
        if (!this.domUpdateScheduled) {
            this.domUpdateScheduled = true;
            requestAnimationFrame(() => {
                const startTime = performance.now();
                
                const updates = this.pendingDOMUpdates.slice();
                this.pendingDOMUpdates = [];
                this.domUpdateScheduled = false;
                
                const fragment = document.createDocumentFragment();
                
                updates.forEach(fn => {
                    try {
                        fn(fragment);
                    } catch (e) {
                        console.error('[FrontendPerformanceManager] DOM update error:', e);
                    }
                });
                
                this.metrics.domUpdateTime += performance.now() - startTime;
            });
        }
    }
    
    /**
     * Lazy render formulas with virtual scrolling
     * Fixed: Creates new DocumentFragment per batch
     */
    lazyRenderFormulas(formulas, container, renderFn, batchSize = 20) {
        let currentIndex = 0;
        
        const renderBatch = () => {
            const fragment = document.createDocumentFragment(); // New per batch
            const endIndex = Math.min(currentIndex + batchSize, formulas.length);
            const startTime = performance.now();
            
            for (let i = currentIndex; i < endIndex; i++) {
                const element = renderFn(formulas[i]);
                if (element) {
                    fragment.appendChild(element);
                }
            }
            
            container.appendChild(fragment);
            this.metrics.renderTime += performance.now() - startTime;
            currentIndex = endIndex;
            
            if (currentIndex < formulas.length) {
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
        const content = JSON.stringify({
            id: formula.id,
            name: formula.name,
            equation: formula.equation,
            description: formula.description,
            variables: formula.variables?.map(v => v.symbol).sort()
        });
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    /**
     * Optimized formula card rendering with memoization
     */
    memoizedRenderCard(formula, createCardFn) {
        const cacheKey = `card_${formula.id}`;
        const cached = this.renderCache.get(cacheKey);
        const version = formula.version || this._hashFormulaContent(formula);
        
        if (cached && cached.version === version) {
            cached.lastAccess = Date.now();
            return cached.element.cloneNode(true);
        }
        
        const startTime = performance.now();
        const card = createCardFn ? createCardFn(formula) : this.createFormulaCard(formula);
        
        if (!card) {
            console.warn('[FrontendPerformanceManager] createFormulaCard returned null for:', formula.id);
            return null;
        }
        
        this.renderCache.set(cacheKey, {
            element: card.cloneNode(true),
            version: version,
            lastAccess: Date.now()
        });
        
        this.metrics.renderTime += performance.now() - startTime;
        return card;
    }
    
    /**
     * Create formula card (override in implementation)
     */
    createFormulaCard(formula) {
        console.warn('[FrontendPerformanceManager] createFormulaCard not implemented. Override this method.');
        return null;
    }
    
    /**
     * Wrap expensive calculation with timing
     */
    timedCalculation(calcFn) {
        const startTime = performance.now();
        const result = calcFn();
        this.metrics.calculationTime += performance.now() - startTime;
        return result;
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
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
        const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
        const hitRate = totalRequests > 0 
            ? ((this.metrics.cacheHits / totalRequests) * 100).toFixed(2) 
            : 0;
        
        return {
            ...this.metrics,
            cacheHitRate: `${hitRate}%`,
            cacheSizes: {
                calculations: this.calculationCache.size,
                searches: this.searchCache.size,
                renders: this.renderCache.size
            },
            loadedModules: Array.from(this.loadedModules.keys())
        };
    }
    
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            renderTime: 0,
            calculationTime: 0,
            domUpdateTime: 0,
            moduleLoadTime: 0
        };
    }
}

// Create global singleton
const frontendPerformanceManager = new FrontendPerformanceManager();

// Expose globally
if (typeof window !== 'undefined') {
    window.FrontendPerformanceManager = FrontendPerformanceManager;
    window.frontendPerformanceManager = frontendPerformanceManager;
    
    // Backward compatibility aliases
    window.performanceOptimizer = frontendPerformanceManager;
    window.moduleLazyLoader = frontendPerformanceManager;
}

export { FrontendPerformanceManager, frontendPerformanceManager };

