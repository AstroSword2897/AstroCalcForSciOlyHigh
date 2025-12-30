/**
 * UI State Manager
 * Centralized state management with event system
 * Prevents global state pollution and race conditions
 */

import { Formula } from '../../types/formula';
import { CalculationResult } from '../../types/formula';

export interface UIState {
    currentFormula: Formula | null;
    selectedFormula: Formula | null;
    calculationResult: CalculationResult | null;
    searchTerm: string;
    activeTab: 'formulas' | 'explorer' | 'classification';
    inputValues: Record<string, any>;
    error: Error | null;
}

type EventHandler = (data: any) => void;
type EventType = 
    | 'formulaChanged' 
    | 'calculatorChanged' 
    | 'graphManagerChanged' 
    | 'calculationResultChanged'
    | 'searchTermChanged'
    | 'activeTabChanged'
    | 'inputValuesChanged'
    | 'errorChanged'
    | 'stateReset';

export class StateManager {
    private currentFormula: Formula | null = null;
    private calculator: any | null = null;
    private graphManager: any | null = null;
    private listeners: Map<EventType, EventHandler[]> = new Map();
    private state: UIState;

    constructor() {
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
    setFormula(formula: Formula | null): void {
        const oldFormula = this.currentFormula;
        this.currentFormula = formula;
        this.state.currentFormula = formula;
        this.state.selectedFormula = formula;
        this.notify('formulaChanged', { formula, oldFormula });
    }
    
    /**
     * Get current formula
     */
    getFormula(): Formula | null {
        return this.currentFormula;
    }
    
    /**
     * Set calculator instance
     */
    setCalculator(calculator: any | null): void {
        this.calculator = calculator;
        this.notify('calculatorChanged', { calculator });
    }
    
    /**
     * Get calculator instance
     */
    getCalculator(): any | null {
        return this.calculator;
    }
    
    /**
     * Set graph manager instance
     */
    setGraphManager(graphManager: any | null): void {
        this.graphManager = graphManager;
        this.notify('graphManagerChanged', { graphManager });
    }
    
    /**
     * Get graph manager instance
     */
    getGraphManager(): any | null {
        return this.graphManager;
    }
    
    /**
     * Set calculation result
     */
    setCalculationResult(result: CalculationResult | null): void {
        this.state.calculationResult = result;
        this.notify('calculationResultChanged', { result });
    }
    
    /**
     * Get calculation result
     */
    getCalculationResult(): CalculationResult | null {
        return this.state.calculationResult;
    }
    
    /**
     * Set search term
     */
    setSearchTerm(term: string): void {
        this.state.searchTerm = term;
        this.notify('searchTermChanged', { term });
    }
    
    /**
     * Get search term
     */
    getSearchTerm(): string {
        return this.state.searchTerm;
    }
    
    /**
     * Set active tab
     */
    setActiveTab(tab: 'formulas' | 'explorer' | 'classification'): void {
        const oldTab = this.state.activeTab;
        this.state.activeTab = tab;
        this.notify('activeTabChanged', { tab, oldTab });
    }
    
    /**
     * Get active tab
     */
    getActiveTab(): 'formulas' | 'explorer' | 'classification' {
        return this.state.activeTab;
    }
    
    /**
     * Set input values
     */
    setInputValues(values: Record<string, any>): void {
        this.state.inputValues = { ...this.state.inputValues, ...values };
        this.notify('inputValuesChanged', { values: this.state.inputValues });
    }
    
    /**
     * Get input values
     */
    getInputValues(): Record<string, any> {
        return { ...this.state.inputValues };
    }
    
    /**
     * Set error
     */
    setError(error: Error | null): void {
        this.state.error = error;
        this.notify('errorChanged', { error });
    }
    
    /**
     * Clear error
     */
    clearError(): void {
        this.state.error = null;
        this.notify('errorChanged', { error: null });
    }
    
    /**
     * Get error
     */
    getError(): Error | null {
        return this.state.error;
    }
    
    /**
     * Subscribe to state changes
     */
    on(event: EventType, handler: EventHandler): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler);
        
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
    off(event: EventType, handler: EventHandler): void {
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
    private notify(event: EventType, data: any): void {
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
    getState(): Readonly<UIState> {
        return { ...this.state };
    }
    
    /**
     * Reset state
     */
    reset(): void {
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
    cleanup(): void {
        // Cleanup calculator if it has cleanup method
        if (this.calculator && typeof (this.calculator as any).cleanup === 'function') {
            (this.calculator as any).cleanup();
        }
        
        // Cleanup graph manager if it has cleanup method
        if (this.graphManager && typeof (this.graphManager as any).destroy === 'function') {
            (this.graphManager as any).destroy();
        }
        
        // Clear listeners
        this.listeners.clear();
    }
}

// Export singleton instance
let stateManagerInstance: StateManager | null = null;

export function getStateManager(): StateManager {
    if (!stateManagerInstance) {
        stateManagerInstance = new StateManager();
    }
    return stateManagerInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).StateManager = StateManager;
    (window as any).getStateManager = getStateManager;
    (window as any).uiState = getStateManager();
}

