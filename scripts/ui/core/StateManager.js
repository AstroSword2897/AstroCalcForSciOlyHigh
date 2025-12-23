/**
 * UI State Manager
 * Centralized state management with event system
 * Prevents global state pollution and race conditions
 */

class UIStateManager {
    constructor() {
        this.currentFormula = null;
        this.calculator = null;
        this.graphManager = null;
        this.listeners = new Map();
        this.state = {
            currentFormula: null,
            selectedFormula: null,
            calculationResult: null,
            searchTerm: '',
            activeTab: 'formulas',
            inputValues: {},
            error: null
        };
    }
    
    /**
     * Set current formula
     */
    setFormula(formula) {
        const oldFormula = this.currentFormula;
        this.currentFormula = formula;
        this.state.currentFormula = formula;
        this.state.selectedFormula = formula;
        this.notify('formulaChanged', { formula, oldFormula });
    }
    
    /**
     * Get current formula
     */
    getFormula() {
        return this.currentFormula;
    }
    
    /**
     * Set calculator instance
     */
    setCalculator(calculator) {
        this.calculator = calculator;
        this.notify('calculatorChanged', { calculator });
    }
    
    /**
     * Get calculator instance
     */
    getCalculator() {
        return this.calculator;
    }
    
    /**
     * Set graph manager instance
     */
    setGraphManager(graphManager) {
        this.graphManager = graphManager;
        this.notify('graphManagerChanged', { graphManager });
    }
    
    /**
     * Get graph manager instance
     */
    getGraphManager() {
        return this.graphManager;
    }
    
    /**
     * Set calculation result
     */
    setCalculationResult(result) {
        this.state.calculationResult = result;
        this.notify('calculationResultChanged', { result });
    }
    
    /**
     * Get calculation result
     */
    getCalculationResult() {
        return this.state.calculationResult;
    }
    
    /**
     * Set search term
     */
    setSearchTerm(term) {
        this.state.searchTerm = term;
        this.notify('searchTermChanged', { term });
    }
    
    /**
     * Get search term
     */
    getSearchTerm() {
        return this.state.searchTerm;
    }
    
    /**
     * Set active tab
     */
    setActiveTab(tab) {
        const oldTab = this.state.activeTab;
        this.state.activeTab = tab;
        this.notify('activeTabChanged', { tab, oldTab });
    }
    
    /**
     * Get active tab
     */
    getActiveTab() {
        return this.state.activeTab;
    }
    
    /**
     * Set input values
     */
    setInputValues(values) {
        this.state.inputValues = { ...this.state.inputValues, ...values };
        this.notify('inputValuesChanged', { values: this.state.inputValues });
    }
    
    /**
     * Get input values
     */
    getInputValues() {
        return { ...this.state.inputValues };
    }
    
    /**
     * Set error
     */
    setError(error) {
        this.state.error = error;
        this.notify('errorChanged', { error });
    }
    
    /**
     * Clear error
     */
    clearError() {
        this.state.error = null;
        this.notify('errorChanged', { error: null });
    }
    
    /**
     * Get error
     */
    getError() {
        return this.state.error;
    }
    
    /**
     * Subscribe to state changes
     */
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
        
        // Return unsubscribe function
        return () => {
            const handlers = this.listeners.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }
    
    /**
     * Unsubscribe from state changes
     */
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    /**
     * Notify listeners of state change
     */
    notify(event, data) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (e) {
                    console.error(`[StateManager] Error in handler for ${event}:`, e);
                }
            });
        }
    }
    
    /**
     * Get entire state (read-only copy)
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }
    
    /**
     * Reset state
     */
    reset() {
        this.cleanup();
        this.currentFormula = null;
        this.calculator = null;
        this.graphManager = null;
        this.state = {
            currentFormula: null,
            selectedFormula: null,
            calculationResult: null,
            searchTerm: '',
            activeTab: 'formulas',
            inputValues: {},
            error: null
        };
        this.notify('stateReset', {});
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        // Cleanup calculator if it has cleanup method
        if (this.calculator && typeof this.calculator.cleanup === 'function') {
            this.calculator.cleanup();
        }
        
        // Cleanup graph manager if it has cleanup method
        if (this.graphManager && typeof this.graphManager.destroy === 'function') {
            this.graphManager.destroy();
        }
        
        // Clear listeners
        this.listeners.clear();
    }
}

// Export singleton instance
if (typeof window !== 'undefined') {
    window.UIStateManager = UIStateManager;
    window.uiState = new UIStateManager();
}

