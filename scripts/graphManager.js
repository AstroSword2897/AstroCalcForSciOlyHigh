/**
 * ============================================================
 *  🚀 GraphManager — Optimized Desmos Integration for Astronomy
 * ============================================================
 * 
 * Author: BC (v2.1, 2025) - Adapted for AstroCalc
 * 
 * PURPOSE:
 *  A modular, efficient, and extensible class that:
 *   - Dynamically graphs physics/astronomy formulas in Desmos
 *   - Provides real-time updates when variables change
 *   - Automatically determines graph type (linear, inverse-square, etc.)
 *   - Supports caching, scaling, and fallback visualizations
 * 
 * DEPENDENCIES:
 *   Requires Desmos GraphingCalculator to be globally available.
 *   Requires `globalConstants` for physics constants (G, c, σ, etc.)
 */

class GraphManager {
    /**
     * @param {string} containerId - ID of the div where the graph should be rendered.
     * @param {string} tabId - ID of the tab containing the graph.
     */
    constructor(containerId = 'desmos-graph', tabId = 'graph-tab') {
        this.calculator = null;
        this.containerId = containerId;
        this.tabId = tabId;

        this.currentFormula = null;
        this.currentValues = {};
        this.cache = new Map(); // cache for repeated plots

        // Used to prevent redundant graph updates
        this.lastRenderedKey = null;
    }

    /**
     * Initializes Desmos graph safely.
     * Called automatically when first graphing.
     */
    init(containerId = null) {
        if (this.calculator) return true;

        const targetContainerId = containerId || this.containerId || 'desmos-graph';
        const elt = document.getElementById(targetContainerId);
        if (!elt) {
            console.warn(`Graph container ${targetContainerId} not found.`);
            return false;
        }

        if (typeof Desmos === 'undefined') {
            console.error("Desmos library not loaded.");
            return false;
        }

        // Check if container has dimensions
        if (elt.offsetWidth === 0 || elt.offsetHeight === 0) {
            console.warn('Graph container has no dimensions, waiting...');
            setTimeout(() => this.init(targetContainerId), 200);
            return false;
        }

        // If calculator already exists, destroy it first
        if (this.calculator) {
            try {
                this.calculator.destroy();
            } catch (e) {
                console.warn('Error destroying existing calculator:', e);
            }
            this.calculator = null;
        }

        // Clear any existing content (but preserve message overlays)
        const existingMessage = elt.querySelector('.graph-message');
        elt.innerHTML = '';
        if (existingMessage) {
            elt.appendChild(existingMessage);
        }

        try {
            this.calculator = Desmos.GraphingCalculator(elt, {
                keypad: false,
                expressions: false,
                settingsMenu: false,
                zoomButtons: false,
                showGrid: true,
                xAxisLabel: 'x',
                yAxisLabel: 'y',
                fontSize: 14
            });

            console.log('[GraphManager] Desmos initialized.');

            // If we have a stored formula, update the graph
            if (this.currentFormula) {
                setTimeout(() => {
                    this.updateGraph(this.currentFormula, this.currentValues);
                }, 100);
            }

            return true;
        } catch (error) {
            console.error('Error initializing Desmos calculator:', error);
            elt.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Error initializing graph: ' + error.message + '</p><p style="font-size: 0.9em; color: #999;">Please refresh the page.</p></div>';
            return false;
        }
    }

    /**
     * Main entry point to update or re-render a graph.
     * @param {Object} formula - Formula object with id, equation, variables, etc.
     * @param {Object} variableValues - Dictionary of variable:value pairs.
     */
    updateGraph(formula, variableValues = {}) {
        // Always store the formula and values, even if tab isn't active
        this.currentFormula = formula;
        this.currentValues = { ...variableValues };

        // Get constants from formula
        const constants = formula.constants || {};
        
        // Filter out constants from variables list for finding null variable
        const constantSymbols = new Set(Object.keys(constants));
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));

        // Check if we have any values entered (do this early)
        const hasAnyValues = userVariables.some(v => {
            const val = variableValues[v.symbol];
            return val && val !== null && val !== '' && val !== 'null' && val !== 'N/A' && val !== 'n/a' && val !== 'na';
        });

        // Check if we're in the correct tab
        const targetTab = document.getElementById(this.tabId || 'graph-tab');
        const isTabActive = targetTab && targetTab.classList.contains('active');
        const container = document.getElementById(this.containerId || 'desmos-graph');
        
        // If tab is not active, still show message if no values
        if (!isTabActive) {
            if (!hasAnyValues && container) {
                this.showPlainTextMessage(formula, container);
            }
            return;
        }

        // Create cache key
        const key = `${formula.id}-${JSON.stringify(variableValues)}`;
        if (this.lastRenderedKey === key && this.calculator) {
            return; // skip redundant renders
        }
        this.lastRenderedKey = key;

        // Ensure calculator is initialized
        if (!this.calculator) {
            const initialized = this.init();
            if (!initialized) {
                if (container && !container.querySelector('.desmos-calculator')) {
                    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Desmos API failed to load. Please refresh the page.</p><p style="font-size: 0.9em; color: #999;">If the problem persists, check your internet connection.</p></div>';
                }
                return;
            }
        }

        if (!this.calculator) {
            return;
        }

        // Remove message overlay if it exists
        if (container) {
            const messageDiv = container.querySelector('.graph-message');
            if (messageDiv) {
                messageDiv.remove();
            }
        }

        // Clear existing expressions
        this.calculator.setExpressions([]);

        // Merge global constants, formula constants, and variable values for graphing
        const allValues = { ...globalConstants, ...constants, ...variableValues };

        // Determine which variable to graph (the one that's null/unknown)
        const nullVar = userVariables.find(v => {
            const val = variableValues[v.symbol];
            return !val || val === null || val === '' || val === 'null' || val === 'N/A' || val === 'n/a' || val === 'na';
        });

        if (!nullVar) {
            // All variables filled, show relationship
            this.showRelationship(formula, allValues);
            return;
        }

        if (!hasAnyValues) {
            // No values entered yet, show helpful message as plain HTML
            this.showPlainTextMessage(formula, container);
            return;
        }

        // Check cache
        if (this.cache.has(key)) {
            const cached = this.cache.get(key);
            this.calculator.setExpressions(cached.expressions);
            if (cached.bounds) {
                this.calculator.setMathBounds(cached.bounds);
            }
            return;
        }

        // Graph the relationship for the unknown variable
        const graphData = this.createGraphExpression(formula, nullVar, allValues);
        if (!graphData || !graphData.expressions || graphData.expressions.length === 0) {
            this.showPlainTextMessage(formula, container, "Graph not available for this formula.");
            return;
        }

        this.renderGraph(graphData.expressions, graphData.bounds);
        this.cache.set(key, { expressions: graphData.expressions, bounds: graphData.bounds });
    }

    /**
     * Shows a plain text message overlay (not LaTeX)
     */
    showPlainTextMessage(formula, container, customMessage = null) {
        if (!container) return;
        
        // Clear the calculator and show plain text message
        if (this.calculator) {
            this.calculator.setExpressions([]);
        }
        
        // Add a message overlay
        let messageDiv = container.querySelector('.graph-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'graph-message';
            messageDiv.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #333; background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px; z-index: 1000; max-width: 80%;';
            container.style.position = 'relative';
            container.appendChild(messageDiv);
        }
        
        const message = customMessage || "Enter values in the Calculator tab to see the graph";
        messageDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #0066cc;">Formula: ${formula.equation}</h4>
            <p style="margin: 0; color: #666;">${message}</p>
        `;
    }

    /**
     * Renders the graph using Desmos.
     * @param {Array} expressions - Array of Desmos expression objects
     * @param {Object} bounds - Optional bounds object {left, right, bottom, top}
     */
    renderGraph(expressions, bounds = null) {
        if (!this.calculator) return;
        this.calculator.setExpressions(expressions);
        // Set bounds if provided
        if (bounds) {
            this.calculator.setMathBounds(bounds);
        }
    }

    /**
     * Show relationship when all variables are filled
     */
    showRelationship(formula, variableValues) {
        // This can be extended to show relationships between variables
        // For now, just show a message
        const container = document.getElementById(this.containerId || 'desmos-graph');
        if (container) {
            const messageDiv = container.querySelector('.graph-message');
            if (messageDiv) {
                messageDiv.remove();
            }
        }
        // Could implement relationship visualization here
    }

    /**
     * Creates a Desmos expression for a known formula.
     * Returns object with expressions array and optional bounds.
     */
    createGraphExpression(formula, unknownVar, allValues) {
        const formulaId = formula.id;
        const G = globalConstants?.G || 6.6743e-11;
        const σ = globalConstants?.σ || 5.670374419e-8;
        const c = globalConstants?.c || 299792458;
        const π = Math.PI;
        const h = globalConstants?.h || 6.62607015e-34;
        const k = globalConstants?.k || 1.380649e-23;

        // Get the unknown variable symbol
        const unknownSymbol = unknownVar.symbol;
        const unknownName = unknownVar.name || unknownSymbol;

        // Create a generic graph based on the formula equation
        // Convert the formula to a Desmos expression
        try {
            const expression = this.convertFormulaToDesmos(formula, unknownVar, allValues);
            if (expression) {
                return {
                    expressions: [expression],
                    bounds: this.calculateBounds(formula, unknownVar, allValues)
                };
            }
        } catch (e) {
            console.error('Error creating graph expression:', e);
        }

        // Fall back to generic graph
        return this.createGenericGraph(formula, unknownVar, allValues);
    }

    /**
     * Converts a formula equation to a Desmos LaTeX expression
     */
    convertFormulaToDesmos(formula, unknownVar, allValues) {
        const unknownSymbol = unknownVar.symbol;
        const equation = formula.equation;
        
        // Replace known variables with their values
        let desmosExpr = equation;
        for (const [key, value] of Object.entries(allValues)) {
            if (key !== unknownSymbol && value !== null && value !== undefined) {
                // Replace variable in equation (handle subscripts, etc.)
                const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                desmosExpr = desmosExpr.replace(regex, value);
            }
        }
        
        // Replace unknown variable with 'x' for Desmos
        const regex = new RegExp(`\\b${unknownSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        desmosExpr = desmosExpr.replace(regex, 'x');
        
        // Replace result variable with 'y'
        // Find the variable on the left side of the equation
        const leftSide = equation.split('=')[0].trim();
        const resultVar = leftSide.split(/[+\-*/=()]/)[0].trim();
        if (resultVar === unknownSymbol) {
            desmosExpr = desmosExpr.replace(new RegExp(`\\b${resultVar}\\b`, 'g'), 'y');
        } else {
            // If unknown is on right side, swap to y = ...
            desmosExpr = `y = ${desmosExpr.split('=')[1]}`;
        }
        
        // Convert Unicode symbols to LaTeX
        desmosExpr = desmosExpr
            .replace(/π/g, '\\pi')
            .replace(/σ/g, '\\sigma')
            .replace(/×/g, '*')
            .replace(/²/g, '^2')
            .replace(/³/g, '^3')
            .replace(/⁴/g, '^4')
            .replace(/⁵/g, '^5')
            .replace(/√/g, '\\sqrt');
        
        return {
            id: 'formula-graph',
            latex: desmosExpr,
            color: Desmos.Colors.BLUE
        };
    }

    /**
     * Calculates appropriate bounds for the graph
     */
    calculateBounds(formula, unknownVar, allValues) {
        // Default bounds - can be made smarter based on variable types
        return {
            left: -10,
            right: 10,
            bottom: -10,
            top: 10
        };
    }

    /**
     * Creates a generic fallback graph for unsupported formulas.
     */
    createGenericGraph(formula, nullVar, allValues) {
        // Try to create a simple graph showing the formula
        try {
            const expression = this.convertFormulaToDesmos(formula, nullVar, allValues);
            if (expression && expression.latex) {
                return {
                    expressions: [expression],
                    bounds: this.calculateBounds(formula, nullVar, allValues)
                };
            }
        } catch (e) {
            console.error('Error in generic graph creation:', e);
        }
        
        // If all else fails, return empty to show message
        return { expressions: [] };
    }
}
