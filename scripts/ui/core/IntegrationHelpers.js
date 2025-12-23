/**
 * Integration Helpers
 * Provides backward-compatible wrappers for new modules
 * Allows gradual migration from old code to new architecture
 */

class IntegrationHelpers {
    constructor() {
        this.uiState = typeof window !== 'undefined' && typeof window.uiState ? window.uiState : null;
        this.dom = typeof window !== 'undefined' && typeof window.dom ? window.dom : null;
        this.lifecycle = typeof window !== 'undefined' && typeof window.lifecycleManager ? window.lifecycleManager : null;
        this.errorHandler = typeof window !== 'undefined' && typeof window.errorHandler ? window.errorHandler : null;
    }
    
    /**
     * Get DOM element (with caching)
     */
    getElement(id) {
        if (this.dom) {
            return this.dom.get(id);
        }
        return document.getElementById(id);
    }
    
    /**
     * Query selector (with caching for IDs)
     */
    query(selector, parent = document) {
        // If it's an ID selector, use cache
        if (selector.startsWith('#')) {
            const id = selector.substring(1);
            return this.getElement(id);
        }
        return parent.querySelector(selector);
    }
    
    /**
     * Query selector all
     */
    queryAll(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }
    
    /**
     * Add event listener (with lifecycle tracking)
     */
    addEventListener(target, event, handler, options = {}) {
        if (this.lifecycle) {
            this.lifecycle.addEventListener(target, event, handler, options);
        } else {
            target.addEventListener(event, handler, options);
        }
    }
    
    /**
     * Remove event listener
     */
    removeEventListener(target, event, handler, options = {}) {
        if (this.lifecycle) {
            this.lifecycle.removeEventListener(target, event, handler, options);
        } else {
            target.removeEventListener(event, handler, options);
        }
    }
    
    /**
     * Set timeout (with lifecycle tracking)
     */
    setTimeout(fn, delay) {
        if (this.lifecycle) {
            return this.lifecycle.setTimeout(fn, delay);
        }
        return setTimeout(fn, delay);
    }
    
    /**
     * Set interval (with lifecycle tracking)
     */
    setInterval(fn, delay) {
        if (this.lifecycle) {
            return this.lifecycle.setInterval(fn, delay);
        }
        return setInterval(fn, delay);
    }
    
    /**
     * Clear timeout
     */
    clearTimeout(id) {
        if (this.lifecycle) {
            this.lifecycle.clearTimeout(id);
        } else {
            clearTimeout(id);
        }
    }
    
    /**
     * Clear interval
     */
    clearInterval(id) {
        if (this.lifecycle) {
            this.lifecycle.clearInterval(id);
        } else {
            clearInterval(id);
        }
    }
    
    /**
     * Request animation frame (with lifecycle tracking)
     */
    requestAnimationFrame(callback) {
        if (this.lifecycle) {
            return this.lifecycle.requestAnimationFrame(callback);
        }
        return requestAnimationFrame(callback);
    }
    
    /**
     * Set current formula (with state management)
     */
    setFormula(formula) {
        if (this.uiState) {
            this.uiState.setFormula(formula);
        }
        // Also set legacy variable for backward compatibility
        if (typeof window !== 'undefined') {
            window.currentFormula = formula;
        }
    }
    
    /**
     * Get current formula (from state management)
     */
    getFormula() {
        if (this.uiState) {
            return this.uiState.getFormula();
        }
        // Fallback to legacy variable
        return typeof window !== 'undefined' ? window.currentFormula : null;
    }
    
    /**
     * Set calculator (with state management)
     */
    setCalculator(calculator) {
        if (this.uiState) {
            this.uiState.setCalculator(calculator);
        }
        // Also set legacy variable
        if (typeof window !== 'undefined') {
            window.calculator = calculator;
        }
    }
    
    /**
     * Get calculator (from state management)
     */
    getCalculator() {
        if (this.uiState) {
            return this.uiState.getCalculator();
        }
        return typeof window !== 'undefined' ? window.calculator : null;
    }
    
    /**
     * Set graph manager (with state management)
     */
    setGraphManager(graphManager) {
        if (this.uiState) {
            this.uiState.setGraphManager(graphManager);
        }
        // Also set legacy variable
        if (typeof window !== 'undefined') {
            window.graphManager = graphManager;
        }
    }
    
    /**
     * Get graph manager (from state management)
     */
    getGraphManager() {
        if (this.uiState) {
            return this.uiState.getGraphManager();
        }
        return typeof window !== 'undefined' ? window.graphManager : null;
    }
    
    /**
     * Handle error (with error handler)
     */
    handleError(error, options = {}) {
        if (this.errorHandler) {
            this.errorHandler.handle(error, options);
        } else {
            // Fallback to console
            console.error('[Error]', error);
        }
    }
    
    /**
     * Display error (with error handler)
     */
    displayError(message, type = 'error') {
        if (this.errorHandler) {
            const ErrorClass = type === 'error' ? CalculationError : ValidationError;
            const error = new ErrorClass('display', message);
            this.errorHandler.displayError(error);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
    
    /**
     * Preload common DOM elements
     */
    preloadCommonElements() {
        if (this.dom) {
            this.dom.preload([
                'formula-list',
                'formula-search',
                'result-display',
                'input-screen',
                'calculator-tab',
                'graph-tab',
                'formula-selection'
            ]);
        }
    }
}

// Export singleton
if (typeof window !== 'undefined') {
    window.IntegrationHelpers = IntegrationHelpers;
    window.helpers = new IntegrationHelpers();
}

