/**
 * FormulaSystem - High-Performance Integrated Formula Management
 * 
 * Integrates:
 * - FrontendPerformanceManager (caching, lazy loading, DOM batching)
 * - FormulaRenderer (optimized rendering with per-card timers, O(1) lookup)
 * - Calculation caching and quick calculations
 * 
 * Features:
 * - Lazy-load heavy modules (explorer, FRQ, graphs) only when needed
 * - Cache calculations and searches for instant response
 * - Render formula cards efficiently with batching and chunked updates
 * - Per-card quick calculation timers (no interference)
 * - O(1) formula lookup via indexed Map
 * - Performance metrics tracking
 */

import { FrontendPerformanceManager } from './FrontendPerformanceManager.js';
import { FormulaRenderer } from './ui/ui/modules/rendering/FormulaRenderer.js';

export class FormulaSystem {
    constructor(options = {}) {
        // Performance manager (handles caching, lazy loading, DOM batching)
        this.performanceManager = options.performanceManager || new FrontendPerformanceManager({
            maxCacheSize: options.maxCacheSize || 500,
            searchCacheSize: options.searchCacheSize || 100,
            searchCacheTTL: options.searchCacheTTL || 300000, // 5 min
            modulePaths: options.modulePaths
        });
        
        // Formula data & categories
        this.formulas = options.formulas || (() => window.formulas || []);
        this.formulaCategories = options.formulaCategories || (() => window.formulaCategories || {});
        
        // Calculator & confidence functions
        this.FormulaCalculator = options.FormulaCalculator || (() => window.FormulaCalculator);
        this.calculateConfidenceScore = options.calculateConfidenceScore || (() => window.calculateConfidenceScore);
        
        // Renderer instance with injected dependencies
        this.renderer = new FormulaRenderer({
            formulas: this.formulas,
            formulaCategories: this.formulaCategories,
            FormulaCalculator: this.FormulaCalculator,
            calculateConfidenceScore: this.calculateConfidenceScore,
            selectFormula: options.selectFormula || (() => window.selectFormula),
            onFormulaClick: options.onFormulaClick || null
        });
        
        // Container for formula cards
        this.container = null;
        
        // Formula index for O(1) lookup (maintained separately for system-level access)
        this._formulaIndex = new Map();
        this._rebuildFormulaIndex();
    }
    
    /**
     * Rebuild formula index for O(1) lookup
     */
    _rebuildFormulaIndex() {
        this._formulaIndex.clear();
        const formulas = typeof this.formulas === 'function' ? this.formulas() : this.formulas;
        if (Array.isArray(formulas)) {
            formulas.forEach(formula => {
                if (formula.id) {
                    this._formulaIndex.set(formula.id, formula);
                }
            });
        }
    }
    
    /**
     * Get formula by ID (O(1) lookup)
     */
    getFormulaById(formulaId) {
        if (this._formulaIndex.size === 0) {
            this._rebuildFormulaIndex();
        }
        return this._formulaIndex.get(formulaId);
    }
    
    /**
     * Set the container where formulas will render
     */
    setContainer(container) {
        this.container = container;
    }
    
    /**
     * Lazy-load modules if needed
     */
    async loadModule(moduleName) {
        return await this.performanceManager.loadModule(moduleName);
    }
    
    /**
     * Lazy-load explorer module
     */
    async loadExplorerModule() {
        return await this.performanceManager.loadExplorerModule();
    }
    
    /**
     * Lazy-load FRQ module
     */
    async loadFRQModule() {
        return await this.performanceManager.loadFRQModule();
    }
    
    /**
     * Lazy-load graph modules
     */
    async loadGraphModule() {
        return await this.performanceManager.loadGraphModule();
    }
    
    /**
     * Render formulas (optimized + cached)
     */
    renderFormulas(formulas = null, options = {}) {
        if (!this.container) {
            console.warn('[FormulaSystem] No container set for rendering');
            return;
        }
        
        const formulaList = formulas || (typeof this.formulas === 'function' ? this.formulas() : this.formulas);
        
        // Apply search/filter if query exists
        const query = options.searchQuery || '';
        const filteredFormulas = query ? this.filterFormulasCached(formulaList, query) : formulaList;
        
        // Render using FormulaRenderer (which uses performance manager internally if needed)
        this.renderer.renderFormulaCards(filteredFormulas, this.container, options);
    }
    
    /**
     * Filter formulas with caching
     */
    filterFormulasCached(formulas, query) {
        if (!query || !query.trim()) {
            return formulas;
        }
        
        const cacheKey = `filter:${query.toLowerCase().trim()}`;
        const cached = this.performanceManager.getCachedSearch(cacheKey);
        if (cached) {
            return cached;
        }
        
        const filtered = this.renderer.filterFormulas(formulas, query);
        this.performanceManager.cacheSearch(cacheKey, filtered);
        
        return filtered;
    }
    
    /**
     * Quick calculation helper (with caching)
     */
    quickCalculate(formulaId, variableValues) {
        // Check cache first
        const cachedResult = this.performanceManager.getCachedCalculation(formulaId, variableValues);
        if (cachedResult !== null) {
            return cachedResult;
        }
        
        // Get formula using O(1) lookup
        const formula = this.getFormulaById(formulaId);
        if (!formula) {
            console.warn(`[FormulaSystem] Formula not found: ${formulaId}`);
            return null;
        }
        
        try {
            const FormulaCalc = typeof this.FormulaCalculator === 'function' 
                ? this.FormulaCalculator() 
                : this.FormulaCalculator;
            
            if (!FormulaCalc) {
                console.warn('[FormulaSystem] FormulaCalculator not available');
                return null;
            }
            
            // Use performance manager's timed calculation wrapper
            const result = this.performanceManager.timedCalculation(() => {
                const calculator = new FormulaCalc(formula);
                return calculator.solve(variableValues);
            });
            
            // Cache result if valid
            if (result && result.result !== null && result.result !== undefined) {
                this.performanceManager.cacheCalculation(formulaId, variableValues, result);
            }
            
            return result;
        } catch (e) {
            console.error('[FormulaSystem] Quick calculation failed:', e);
            return null;
        }
    }
    
    /**
     * Preload heavy modules in background
     */
    preloadModules(delay = 2000) {
        this.performanceManager.preloadModules(delay);
    }
    
    /**
     * Get combined performance metrics from all components
     */
    getMetrics() {
        const perfMetrics = this.performanceManager.getMetrics();
        const renderMetrics = this.renderer.getMetrics();
        
        return {
            ...perfMetrics,
            renderer: renderMetrics,
            formulaIndexSize: this._formulaIndex.size
        };
    }
    
    /**
     * Clear all caches
     */
    clearCaches() {
        this.performanceManager.clearCaches();
    }
    
    /**
     * Reset all metrics
     */
    resetMetrics() {
        this.performanceManager.resetMetrics();
        this.renderer.resetMetrics();
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        this.renderer.cleanup();
        this.clearCaches();
    }
}

// Create global singleton
if (typeof window !== 'undefined') {
    window.FormulaSystem = FormulaSystem;
    window.formulaSystem = new FormulaSystem();
}

export default FormulaSystem;

