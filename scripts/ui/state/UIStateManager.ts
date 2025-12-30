/**
 * Centralized UI state management with proper typing
 * Replaces global variables with type-safe state
 */

import { Formula } from '../../types/formula';
import { CalculationResult } from '../../types/formula';

export interface UIState {
    currentFormula: Formula | null;
    calculator: any | null; // FormulaCalculator - will be properly typed later
    graphManager: any | null; // GraphManager - will be properly typed later
    searchTerm: string;
    activeTab: 'formulas' | 'explorer' | 'classification';
    calculatorTab: 'calculator' | 'graph' | 'classification';
    lastCalculationResult: CalculationResult | null;
    stellarClassifier: any | null;
}

type StateListener = (state: UIState) => void;
type StateKey = keyof UIState;

export class UIStateManager {
    private state: UIState;
    private listeners: Map<StateKey, Set<StateListener>>;

    constructor() {
        this.state = {
            currentFormula: null,
            calculator: null,
            graphManager: null,
            searchTerm: '',
            activeTab: 'formulas',
            calculatorTab: 'calculator',
            lastCalculationResult: null,
            stellarClassifier: null
        };
        this.listeners = new Map();
    }

    /**
     * Get current state (immutable)
     */
    getState(): Readonly<UIState> {
        return { ...this.state };
    }

    /**
     * Get specific state value
     */
    get<K extends StateKey>(key: K): UIState[K] {
        return this.state[key];
    }

    /**
     * Update state (batched)
     */
    setState(updates: Partial<UIState>): void {
        const changedKeys = new Set<StateKey>();
        
        for (const [key, value] of Object.entries(updates)) {
            const k = key as StateKey;
            if (this.state[k] !== value) {
                (this.state as any)[k] = value;
                changedKeys.add(k);
            }
        }
        
        // Notify listeners only for changed keys
        changedKeys.forEach(key => {
            this.notifyListeners(key);
        });
    }

    /**
     * Subscribe to state changes
     */
    subscribe(key: StateKey, listener: StateListener): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners.get(key)?.delete(listener);
        };
    }

    /**
     * Clear all state and listeners
     */
    cleanup(): void {
        // Cleanup calculator
        if (this.state.calculator && typeof (this.state.calculator as any).cleanup === 'function') {
            (this.state.calculator as any).cleanup();
        }
        this.state.calculator = null;

        // Cleanup graph manager
        if (this.state.graphManager && typeof (this.state.graphManager as any).destroy === 'function') {
            (this.state.graphManager as any).destroy();
        }
        this.state.graphManager = null;

        this.state.currentFormula = null;
        this.state.lastCalculationResult = null;
        this.listeners.clear();
    }

    private notifyListeners(key: StateKey): void {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(this.state);
                } catch (error) {
                    console.error(`Error in state listener for ${key}:`, error);
                }
            });
        }
    }
}

// Singleton instance - expose to window for backward compatibility
let uiStateManagerInstance: UIStateManager | null = null;

export function getUIStateManager(): UIStateManager {
    if (!uiStateManagerInstance) {
        uiStateManagerInstance = new UIStateManager();
    }
    return uiStateManagerInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).UIStateManager = UIStateManager;
    (window as any).getUIStateManager = getUIStateManager;
}

