/**
 * Application State Manager
 * Centralized state management to replace scattered globals
 * 
 * Provides:
 * - Single source of truth for application state
 * - State change notifications
 * - Immutable state updates
 */

class StateManager {
    constructor() {
        this.state = {
            currentFormula: null,
            calculator: null,
            graphManager: null,
            ui: {
                activeTab: 'formulas',
                searchTerm: '',
                isCalculating: false,
                isSearching: false
            },
            search: {
                results: [],
                lastQuery: '',
                cache: new Map()
            }
        };
        
        this.listeners = new Set();
        this.history = []; // For undo/redo if needed
        this.maxHistorySize = 50;
    }

    /**
     * Get current state (read-only copy)
     * @returns {Object} Current state
     */
    getState() {
        return Object.freeze(JSON.parse(JSON.stringify(this.state)));
    }

    /**
     * Get specific state property
     * @param {string} path - Dot-separated path (e.g., 'ui.activeTab')
     * @returns {*} Property value
     */
    get(path) {
        const parts = path.split('.');
        let value = this.state;
        
        for (const part of parts) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[part];
        }
        
        return value;
    }

    /**
     * Update state with partial updates
     * @param {Object} updates - Partial state updates
     * @param {boolean} notify - Whether to notify listeners (default: true)
     */
    setState(updates, notify = true) {
        // Save to history
        this.history.push(JSON.parse(JSON.stringify(this.state)));
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        // Deep merge updates
        this.state = this.deepMerge(this.state, updates);

        // Notify listeners
        if (notify) {
            this.notifyListeners();
        }
    }

    /**
     * Deep merge two objects
     * @private
     */
    deepMerge(target, source) {
        const output = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (
                    typeof source[key] === 'object' &&
                    source[key] !== null &&
                    !Array.isArray(source[key]) &&
                    !(source[key] instanceof Map) &&
                    !(source[key] instanceof Set)
                ) {
                    output[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    output[key] = source[key];
                }
            }
        }
        
        return output;
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }
        
        this.listeners.add(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Notify all listeners of state change
     * @private
     */
    notifyListeners() {
        const state = this.getState();
        this.listeners.forEach(listener => {
            try {
                listener(state);
            } catch (error) {
                console.error('[StateManager] Error in listener:', error);
            }
        });
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.state = {
            currentFormula: null,
            calculator: null,
            graphManager: null,
            ui: {
                activeTab: 'formulas',
                searchTerm: '',
                isCalculating: false,
                isSearching: false
            },
            search: {
                results: [],
                lastQuery: '',
                cache: new Map()
            }
        };
        this.notifyListeners();
    }

    /**
     * Clear all listeners
     */
    clearListeners() {
        this.listeners.clear();
    }

    /**
     * Get state statistics
     * @returns {Object} State stats
     */
    getStats() {
        return {
            listeners: this.listeners.size,
            historySize: this.history.length,
            stateSize: JSON.stringify(this.state).length
        };
    }
}

// Create global state manager instance
const stateManager = new StateManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StateManager = StateManager;
    window.stateManager = stateManager;
}

