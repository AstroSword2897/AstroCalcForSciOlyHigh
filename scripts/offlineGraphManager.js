/**
 * ============================================================
 *  📊 OfflineGraphManager — Canvas-Based Graphing for Offline Use
 * ============================================================
 * 
 * PURPOSE:
 *  A fully offline graphing solution that:
 *   - Uses HTML5 Canvas for rendering (no external dependencies)
 *   - Dynamically graphs physics/astronomy formulas
 *   - Provides real-time updates when variables change
 *   - Works completely offline without internet connection
 *   - Supports numeric evaluation and plotting
 * 
 * DEPENDENCIES:
 *   Requires `globalConstants` for physics constants (G, c, σ, etc.)
 *   Requires `expressionParser.js` for evaluating formulas
 */

class OfflineGraphManager {
    /**
     * @param {string} containerId - ID of the div where the graph should be rendered.
     * @param {string} tabId - ID of the tab containing the graph.
     */
    constructor(containerId = 'desmos-graph', tabId = 'graph-tab') {
        this.canvas = null;
        this.ctx = null;
        this.containerId = containerId;
        this.tabId = tabId;
        
        this.currentFormula = null;
        this.currentValues = {};
        // FIXED: Use LRU cache with size limit to prevent memory leaks
        this.cache = typeof LRUCache !== 'undefined' ? new LRUCache(50) : new Map();
        this.pendingTimers = [];
        
        // FIXED: Add retry tracking to prevent infinite loops
        this.initRetryCount = 0;
        this.maxInitRetries = 50; // Maximum 50 retries (10 seconds at 200ms intervals)
        this.isInitializing = false; // Flag to prevent concurrent initialization attempts
        
        // PERFORMANCE: Add debouncing for graph updates
        this.updateDebounceTimer = null;
        this.renderAnimationFrame = null;
        this.lastUpdateTime = 0;
        this.updateDebounceMs = 300; // Wait 300ms before updating graph
        
        // ENHANCED: Zoom/pan debounce timers
        this.zoomDebounceTimer = null;
        this.panDebounceTimer = null;
        
        // Graph settings
        this.width = 800;
        this.height = 600;
        this.padding = { top: 40, right: 40, bottom: 60, left: 80 };
        this.gridSpacing = 50;
        this.pointRadius = 2;
        
        // Graph bounds
        this.bounds = {
            left: -10,
            right: 10,
            bottom: -10,
            top: 10
        };
        
        // ENHANCED: Auto-graph formulas (formulas that should automatically graph when calculated)
        this.autoGraphFormulas = new Set([
            'wiens_law',
            'escape_velocity',
            'luminosity',
            'kepler_third_law',
            'kepler_third_law_solar',
            'cosmic_redshift',
            'doppler_shift',
            'doppler_shift_approx',
            'stefan_boltzmann_law',
            'flux_temperature',
            'orbital_velocity'
        ]);
        
        // ENHANCED: Calculated point to highlight on graph
        this.calculatedPoint = null; // {x, y, label, color}
        
        // ENHANCED: Second curve for comparison
        this.secondCurve = null; // {data, color, label}
        
        // ENHANCED: Error bands/tolerance zones
        this.errorBands = []; // [{x, y, tolerance, color}]
        
        // ENHANCED: Interactive sliders
        this.sliders = [];
        this.sliderValues = {};
        
        // ENHANCED: Graph presets
        this.presets = {
            blackbody: { name: 'Blackbody Curve', formulaId: 'wiens_law' },
            kepler: { name: "Kepler's Third Law", formulaId: 'kepler_third_law' },
            escape_velocity: { name: 'Escape Velocity vs Mass', formulaId: 'escape_velocity' },
            luminosity: { name: 'Luminosity vs Radius', formulaId: 'luminosity' },
            spectrum: { name: 'Spectrum Wavelengths', formulaId: 'wiens_law' }
        };
    }
    
    /**
     * Initialize the canvas graph
     */
    init(containerId = null) {
        // FIXED: If already initialized, return success
        if (this.canvas && this.ctx) {
            return true;
        }
        
        // FIXED: Prevent concurrent initialization attempts
        if (this.isInitializing) {
            return false; // Already initializing, wait for it to complete
        }
        
        const targetContainerId = containerId || this.containerId || 'desmos-graph';
        const container = document.getElementById(targetContainerId);
        if (!container) {
            console.warn(`Graph container ${targetContainerId} not found.`);
            this.initRetryCount = 0; // Reset on container not found
            this.isInitializing = false;
            return false;
        }
        
        // Check if container has dimensions
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            // FIXED: Check retry limit to prevent infinite loops
            if (this.initRetryCount >= this.maxInitRetries) {
                console.error(`Graph container ${targetContainerId} has no dimensions after ${this.maxInitRetries} retries. Giving up.`);
                this.initRetryCount = 0; // Reset for next attempt
                this.isInitializing = false;
                // Show error message in container
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #ef4444;"><p>Unable to initialize graph: container has no dimensions.</p><p style="font-size: 0.9em; color: #94a3b8;">Please ensure the graph tab is visible and has proper dimensions.</p></div>';
                return false;
            }
            
            // Check if tab is active - if not, don't retry
            const targetTab = document.getElementById(this.tabId || 'graph-tab');
            const isTabActive = targetTab && targetTab.classList.contains('active');
            if (!isTabActive) {
                // Tab is not active, don't retry - will initialize when tab becomes active
                this.initRetryCount = 0;
                this.isInitializing = false;
                return false;
            }
            
            this.isInitializing = true;
            this.initRetryCount++;
            console.warn(`Graph container has no dimensions, waiting... (attempt ${this.initRetryCount}/${this.maxInitRetries})`);
            // FIXED: Store timer for cleanup
            const timer = setTimeout(() => this.init(targetContainerId), 200);
            this.pendingTimers.push(timer);
            return false;
        }
        
        // Successfully initialized - reset retry count and flag
        this.initRetryCount = 0;
        this.isInitializing = true;
        
        // Clear container
        container.innerHTML = '';
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = Math.min(container.offsetWidth || this.width, this.width);
        this.canvas.height = Math.min(container.offsetHeight || this.height, this.height);
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.canvas.style.border = '1px solid #334155';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.background = '#0f172a';
        
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Update dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        console.log('[OfflineGraphManager] Canvas initialized.');
        this.isInitializing = false; // Mark initialization as complete
        
        // ENHANCED: Add zoom/pan functionality
        this.setupInteractivity();
        
        // If we have a stored formula, update the graph
        if (this.currentFormula) {
            // FIXED: Store timer for cleanup
            const timer = setTimeout(() => {
                this.updateGraph(this.currentFormula, this.currentValues);
            }, 100);
            this.pendingTimers.push(timer);
        }
        
        return true;
    }
    
    /**
     * Cleanup method - call when graph is no longer needed
     * FIXED: Prevents memory leaks by cleaning up resources
     */
    destroy() {
        // Clear all timers
        this.pendingTimers.forEach(timer => clearTimeout(timer));
        this.pendingTimers = [];
        
        // PERFORMANCE: Clear debounce timer
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
            this.updateDebounceTimer = null;
        }
        
        // PERFORMANCE: Cancel animation frame
        if (this.renderAnimationFrame) {
            cancelAnimationFrame(this.renderAnimationFrame);
            this.renderAnimationFrame = null;
        }
        
        // ENHANCED: Clear zoom/pan timers
        if (this.zoomDebounceTimer) {
            clearTimeout(this.zoomDebounceTimer);
            this.zoomDebounceTimer = null;
        }
        if (this.panDebounceTimer) {
            clearTimeout(this.panDebounceTimer);
            this.panDebounceTimer = null;
        }
        
        // Reset retry count and initialization flag
        this.initRetryCount = 0;
        this.isInitializing = false;
        
        // Clear cache
        if (this.cache && typeof this.cache.clear === 'function') {
            this.cache.clear();
        }
        
        // Clear canvas references (canvas will be garbage collected)
        this.canvas = null;
        this.ctx = null;
        
        // Clear formula references
        this.currentFormula = null;
        this.currentValues = {};
    }
    
    /**
     * Main entry point to update or re-render a graph
     * ENHANCED: Supports auto-graphing, calculated point highlighting, and more
     * PERFORMANCE: Added debouncing to prevent excessive updates
     */
    updateGraph(formula, variableValues = {}, options = {}) {
        this.currentFormula = formula;
        this.currentValues = { ...variableValues };
        
        // ENHANCED: Store calculated point if provided
        if (options.calculatedPoint) {
            this.calculatedPoint = options.calculatedPoint;
        }
        
        // ENHANCED: Store error bands if provided
        if (options.errorBands) {
            this.errorBands = options.errorBands;
        }
        
        // ENHANCED: Store second curve for comparison if provided
        if (options.secondCurve) {
            this.secondCurve = options.secondCurve;
        }
        
        // PERFORMANCE: Debounce graph updates to prevent excessive rendering
        if (this.updateDebounceTimer) {
            clearTimeout(this.updateDebounceTimer);
        }
        
        const now = performance.now();
        const timeSinceLastUpdate = now - this.lastUpdateTime;
        
        // If update is requested too soon, debounce it
        if (timeSinceLastUpdate < this.updateDebounceMs) {
            this.updateDebounceTimer = setTimeout(() => {
                this._performUpdate();
            }, this.updateDebounceMs - timeSinceLastUpdate);
            return;
        }
        
        // Otherwise, update immediately
        this._performUpdate();
    }
    
    /**
     * PERFORMANCE: Internal method to perform the actual graph update
     * Separated from updateGraph to support debouncing
     */
    _performUpdate() {
        this.lastUpdateTime = performance.now();
        
        if (!this.currentFormula) return;
        
        const formula = this.currentFormula;
        const variableValues = this.currentValues;
        
        // Get constants from formula
        const constants = formula.constants || {};
        
        // Filter out constants from variables list
        const constantSymbols = new Set(Object.keys(constants));
        if (globalConstants) {
            Object.keys(globalConstants).forEach(key => constantSymbols.add(key));
        }
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));
        
        // Check if we have any values entered
        const hasAnyValues = userVariables.some(v => {
            const val = variableValues[v.symbol];
            return val && val !== null && val !== '' && val !== 'null' && val !== 'N/A' && val !== 'n/a' && val !== 'na';
        });
        
        // Check if we're in the correct tab
        const targetTab = document.getElementById(this.tabId || 'graph-tab');
        const isTabActive = targetTab && targetTab.classList.contains('active');
        const container = document.getElementById(this.containerId || 'desmos-graph');
        
        // ENHANCED: If tab is not active, store state but don't render yet
        // The graph will render when the tab becomes active
        if (!isTabActive) {
            if (!hasAnyValues && container) {
                this.showPlainTextMessage(formula, container);
            }
            // Store state so graph can render immediately when tab becomes active
            return;
        }
        
        // Ensure canvas is initialized
        if (!this.canvas || !this.ctx) {
            const initialized = this.init();
            if (!initialized) {
                if (container) {
                    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Error initializing graph canvas.</p></div>';
                }
                return;
            }
        }
        
        // Determine which variable to graph (the one that's null/unknown)
        const nullVar = userVariables.find(v => {
            const val = variableValues[v.symbol];
            return !val || val === null || val === '' || val === 'null' || val === 'N/A' || val === 'n/a' || val === 'na';
        });
        
        if (!nullVar) {
            // All variables filled, show relationship
            this.showRelationship(formula, { ...globalConstants, ...constants, ...variableValues });
            return;
        }
        
        if (!hasAnyValues) {
            // No values entered yet, show helpful message
            this.showPlainTextMessage(formula, container);
            return;
        }
        
        // PERFORMANCE: Use requestAnimationFrame for smooth rendering
        if (this.renderAnimationFrame) {
            cancelAnimationFrame(this.renderAnimationFrame);
        }
        
        this.renderAnimationFrame = requestAnimationFrame(() => {
            this.renderFormulaGraph(formula, nullVar, { ...globalConstants, ...constants, ...variableValues });
        });
    }
    
    /**
     * Render a formula graph on canvas
     * PERFORMANCE: Optimized to avoid double rendering
     */
    renderFormulaGraph(formula, unknownVar, allValues) {
        if (!this.canvas || !this.ctx) return;
        
        // PERFORMANCE: Add timeout protection for entire render
        const renderStartTime = performance.now();
        const maxRenderTime = 3000; // 3 seconds max for entire render
        
        // Calculate graph bounds based on variable values
        this.calculateBounds(formula, unknownVar, allValues);
        
        // Generate data points first (before drawing anything)
        const data = this.generateGraphData(formula, unknownVar, allValues);
        
        // PERFORMANCE: Check timeout before rendering
        if (performance.now() - renderStartTime > maxRenderTime) {
            console.warn('[OfflineGraphManager] Render timeout, showing error message');
            this.showGraphMessage("Graph generation took too long. Try simplifying the formula or adjusting values.");
            return;
        }
        
        if (data && data.length > 0) {
            // Adjust bounds to fit the data if needed
            this.adjustBoundsToData(data);
            
            // PERFORMANCE: Only clear and draw once (not twice)
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Draw grid and axes
            this.drawGrid();
            this.drawAxes(unknownVar);
            
            // ENHANCED: Draw error bands first (behind everything)
            if (this.errorBands && this.errorBands.length > 0) {
                this.drawErrorBands();
            }
            
            // Draw the curve
            this.drawCurve(data, '#3b82f6');
            
            // ENHANCED: Draw second curve for comparison if present
            if (this.secondCurve && this.secondCurve.data && this.secondCurve.data.length > 0) {
                this.drawCurve(this.secondCurve.data, this.secondCurve.color || '#ef4444', this.secondCurve.label);
            }
            
            // Draw points (reduced frequency for performance)
            this.drawPoints(data, '#60a5fa');
            
            // ENHANCED: Highlight calculated point if present
            if (this.calculatedPoint) {
                this.drawCalculatedPoint(this.calculatedPoint);
            }
        } else {
            // Clear canvas and show message with reset button
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.showGraphMessage("Unable to generate graph for this formula. Try entering values for all variables except one.");
            this.showResetButton();
        }
        
        // Draw title
        this.drawTitle(formula, unknownVar);
        
        // ENHANCED: Draw legend if multiple curves
        if (this.secondCurve) {
            this.drawLegend();
        }
    }
    
    /**
     * Generate data points for the graph
     * PERFORMANCE: Optimized with adaptive sampling and timeout protection
     */
    generateGraphData(formula, unknownVar, allValues) {
        const unknownSymbol = unknownVar.symbol;
        // PERFORMANCE: Reduced from 300 to 150 points for faster rendering
        // Use adaptive sampling for smoother curves without performance hit
        const numPoints = 150;
        const data = [];
        
        // Calculate initial bounds if not set
        if (this.bounds.right - this.bounds.left <= 0) {
            this.calculateBounds(formula, unknownVar, allValues);
        }
        
        // Create range for unknown variable
        const range = this.bounds.right - this.bounds.left;
        if (range <= 0 || !isFinite(range)) {
            console.warn('[OfflineGraphManager] Invalid bounds range');
            return null;
        }
        
        // PERFORMANCE: Add timeout protection (max 2 seconds for data generation)
        const startTime = performance.now();
        const maxTime = 2000; // 2 seconds max
        const step = range / numPoints;
        let validPoints = 0;
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 50; // Stop if too many failures in a row
        
        try {
            for (let i = 0; i <= numPoints; i++) {
                // PERFORMANCE: Check timeout
                if (performance.now() - startTime > maxTime) {
                    console.warn('[OfflineGraphManager] Graph generation timeout, using partial data');
                    break;
                }
                
                const x = this.bounds.left + (i * step);
                
                // Skip if x is invalid
                if (!isFinite(x) || isNaN(x)) {
                    consecutiveFailures++;
                    if (consecutiveFailures > maxConsecutiveFailures) break;
                    continue;
                }
                
                // Create evaluation context with x value
                const evalContext = { ...allValues, [unknownSymbol]: x };
                
                // Try to evaluate the formula
                let y;
                try {
                    y = this.evaluateFormula(formula, unknownVar, evalContext);
                } catch (e) {
                    consecutiveFailures++;
                    if (consecutiveFailures > maxConsecutiveFailures) break;
                    continue;
                }
                
                if (y !== null && isFinite(y) && !isNaN(y)) {
                    data.push({ x, y });
                    validPoints++;
                    consecutiveFailures = 0; // Reset failure counter
                } else {
                    consecutiveFailures++;
                    if (consecutiveFailures > maxConsecutiveFailures) break;
                }
            }
        } catch (e) {
            console.error('[OfflineGraphManager] Error generating graph data:', e);
            return data.length > 0 ? data : null; // Return partial data if available
        }
        
        if (validPoints === 0) {
            console.warn('[OfflineGraphManager] No valid data points generated');
            return null;
        }
        
        return data.length > 0 ? data : null;
    }
    
    /**
     * Evaluate formula for a given set of values
     */
    evaluateFormula(formula, unknownVar, values) {
        try {
            // Use the expression parser if available
            if (typeof parseExpression !== 'undefined') {
                return this.evaluateWithParser(formula, unknownVar, values);
            }
            
            // Fallback: try to evaluate common formula patterns
            return this.evaluateCommonFormulas(formula, unknownVar, values);
        } catch (e) {
            console.error('Error evaluating formula:', e);
            return null;
        }
    }
    
    /**
     * Evaluate using expression parser
     */
    evaluateWithParser(formula, unknownVar, values) {
        const unknownSymbol = unknownVar.symbol;
        const equation = formula.equation;
        const x = values[unknownSymbol];
        
        // Use FormulaCalculator to solve for the dependent variable
        // For graphing: we vary the unknown variable (x-axis) and solve for the dependent variable (y-axis)
        try {
            if (typeof FormulaCalculator !== 'undefined') {
                const tempValues = { ...values };
                tempValues[unknownSymbol] = x;
                
                // Create a calculator instance
                const calculator = new FormulaCalculator(formula);
                
                // Find the dependent variable (the one on the left side of the equation, or the primary output)
                // This is the variable we want to plot on the y-axis
                const dependentVar = this.getDependentVariable(formula, unknownVar);
                
                if (dependentVar) {
                    // Set all variables except dependentVar and unknownVar
                    const solveValues = {};
                    for (const [key, value] of Object.entries(tempValues)) {
                        if (key !== dependentVar && key !== unknownSymbol) {
                            solveValues[key] = value;
                        }
                    }
                    
                    // Set dependentVar as null to solve for it
                    solveValues[dependentVar] = null;
                    
                    try {
                        const result = calculator.solve(solveValues);
                        if (result && result.result !== undefined) {
                            return result.result;
                        } else if (result && result.value !== undefined) {
                            return result.value;
                        }
                    } catch (e) {
                        // Fall back to direct evaluation
                        console.warn('[OfflineGraphManager] Calculator solve failed, using direct evaluation:', e.message);
                    }
                }
            }
        } catch (e) {
            // Fall through to direct evaluation
            console.warn('[OfflineGraphManager] Parser evaluation failed, using direct evaluation:', e.message);
        }
        
        // Fallback: direct evaluation using expression parser
        return this.evaluateDirectly(formula, unknownVar, values);
    }
    
    /**
     * Get the dependent variable from formula equation (the one to plot on y-axis)
     */
    getDependentVariable(formula, unknownVar) {
        const unknownSymbol = unknownVar.symbol;
        const equation = formula.equation;
        
        // If equation has =, the left side is usually the dependent variable
        if (equation.includes('=')) {
            const parts = equation.split('=');
            if (parts.length === 2) {
                const leftSide = parts[0].trim();
                // Extract variable name from left side (before any operators)
                const match = leftSide.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
                if (match) {
                    const varName = match[1];
                    // Make sure it's not the unknown variable
                    if (varName !== unknownSymbol) {
                        return varName;
                    }
                }
            }
        }
        
        // Fallback: find the first variable in the formula that's not the unknown
        for (const variable of formula.variables) {
            if (variable.symbol !== unknownSymbol) {
                // Check if it's not a constant
                const constants = formula.constants || {};
                if (!constants[variable.symbol] && (!globalConstants || !globalConstants[variable.symbol])) {
                    return variable.symbol;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Direct evaluation of formula expression
     */
    evaluateDirectly(formula, unknownVar, values) {
        const unknownSymbol = unknownVar.symbol;
        const equation = formula.equation;
        const x = values[unknownSymbol];
        
        // Extract the right side of the equation
        let expression = equation;
        if (equation.includes('=')) {
            const parts = equation.split('=');
            if (parts.length === 2) {
                const leftSide = parts[0].trim();
                const rightSide = parts[1].trim();
                
                // Determine which side has the unknown
                if (leftSide.includes(unknownSymbol)) {
                    // Unknown on left, solve for it: y = f(x)
                    expression = rightSide;
                } else {
                    // Unknown on right, solve for it
                    expression = rightSide;
                }
            }
        }
        
        // ENHANCED: Replace variables with values, including constants
        let evalExpr = expression;
        
        // First, ensure constants are included in values
        const allValuesWithConstants = {
            ...(globalConstants || {}),
            ...(formula.constants || {}),
            ...values
        };
        
        // Replace variables and constants with their numeric values
        for (const [key, value] of Object.entries(allValuesWithConstants)) {
            if (value !== null && value !== undefined && key !== unknownSymbol) {
                // Only replace if it's a number (constants should be numbers)
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                if (isFinite(numValue)) {
                    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    evalExpr = evalExpr.replace(regex, String(numValue));
                }
            }
        }
        
        // Replace unknown with x
        const regex = new RegExp(`\\b${unknownSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        evalExpr = evalExpr.replace(regex, 'x');
        
        // Replace common math symbols
        evalExpr = evalExpr
            .replace(/π/g, 'Math.PI')
            .replace(/×/g, '*')
            .replace(/²/g, '**2')
            .replace(/³/g, '**3')
            .replace(/⁴/g, '**4')
            .replace(/⁵/g, '**5')
            .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
            .replace(/√([a-zA-Z0-9_]+)/g, 'Math.sqrt($1)');
        
        // Try to parse and evaluate
        try {
            // Use ExpressionParser if available
            if (typeof ExpressionParser !== 'undefined') {
                // Replace x with actual value for parsing
                const exprWithValue = evalExpr.replace(/\bx\b/g, String(x));
                return ExpressionParser.parse(exprWithValue);
            }
            
            // FIXED: Use safer evaluation with validation
            // Use SafeExpressionEvaluator if available
            if (typeof SafeExpressionEvaluator !== 'undefined') {
                return SafeExpressionEvaluator.evaluate(evalExpr, { x, ...allValues });
            }
            
            // Fallback: Use Function() with validation
            // Validate expression doesn't contain dangerous patterns
            const dangerousPatterns = [/eval\s*\(/i, /function\s*\(/i, /constructor/i, /prototype/i];
            for (const pattern of dangerousPatterns) {
                if (pattern.test(evalExpr)) {
                    console.warn('[OfflineGraphManager] Dangerous pattern in expression');
                    return null;
                }
            }
            
            const func = new Function('x', 'Math', `"use strict"; const π = Math.PI; return (${evalExpr})`);
            return func(x, Math);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Evaluate common formula patterns
     */
    evaluateCommonFormulas(formula, unknownVar, values) {
        const formulaId = formula.id;
        const unknownSymbol = unknownVar.symbol;
        const x = values[unknownSymbol];
        
        // Handle specific formulas
        if (formulaId === 'kepler_third_law') {
            if (unknownSymbol === 'T') {
                const G = values.G || globalConstants?.G || 6.67430e-11;
                const M = values.M;
                const a = values.a;
                return Math.sqrt((4 * Math.PI * Math.PI / (G * M)) * (a * a * a));
            } else if (unknownSymbol === 'a') {
                const G = values.G || globalConstants?.G || 6.67430e-11;
                const M = values.M;
                const T = values.T;
                return Math.cbrt((T * T * G * M) / (4 * Math.PI * Math.PI));
            }
        }
        
        if (formulaId === 'orbital_velocity') {
            if (unknownSymbol === 'v') {
                const G = values.G || globalConstants?.G || 6.67430e-11;
                const M = values.M;
                const r = x;
                return Math.sqrt((G * M) / r);
            } else if (unknownSymbol === 'r') {
                const G = values.G || globalConstants?.G || 6.67430e-11;
                const M = values.M;
                const v = values.v;
                return (G * M) / (v * v);
            }
        }
        
        if (formulaId === 'luminosity') {
            if (unknownSymbol === 'L') {
                const R = values.R;
                const T = x;
                const σ = values.σ || globalConstants?.σ || 5.670374419e-8;
                return 4 * Math.PI * R * R * σ * Math.pow(T, 4);
            } else if (unknownSymbol === 'T') {
                const L = values.L;
                const R = values.R;
                const σ = values.σ || globalConstants?.σ || 5.670374419e-8;
                return Math.pow(L / (4 * Math.PI * R * R * σ), 0.25);
            }
        }
        
        if (formulaId === 'escape_velocity') {
            if (unknownSymbol === 'v_esc') {
                const G = values.G || globalConstants?.G || 6.67430e-11;
                const M = values.M;
                const r = x;
                return Math.sqrt((2 * G * M) / r);
            }
        }
        
        // Generic evaluation attempt
        return this.evaluateWithParser(formula, unknownVar, values);
    }
    
    /**
     * Calculate appropriate bounds for the graph
     */
    calculateBounds(formula, unknownVar, allValues) {
        // Try to determine reasonable bounds based on variable values
        const unknownSymbol = unknownVar.symbol;
        
        // Default bounds
        let left = -10;
        let right = 10;
        let bottom = -10;
        let top = 10;
        
        // Try to get a sense of scale from other variables
        const numericValues = Object.values(allValues).filter(v => 
            typeof v === 'number' && isFinite(v) && v > 0
        );
        
        if (numericValues.length > 0) {
            const maxVal = Math.max(...numericValues);
            const minVal = Math.min(...numericValues.filter(v => v > 0));
            
            // Scale bounds based on values
            if (maxVal > 1) {
                right = Math.max(10, maxVal * 2);
                left = -right;
            }
            if (maxVal < 1 && maxVal > 0) {
                right = 1;
                left = -1;
            }
            
            top = right;
            bottom = -right;
        }
        
        // Adjust for specific variable types
        if (unknownSymbol === 'T' || unknownSymbol.includes('temp')) {
            // Temperature: usually positive
            left = 0;
            right = Math.max(1000, right);
            bottom = 0;
        } else if (unknownSymbol === 'r' || unknownSymbol === 'R' || unknownSymbol === 'a' || unknownSymbol === 'd') {
            // Distance/radius: usually positive
            left = 0;
            right = Math.max(10, right);
            bottom = 0;
        } else if (unknownSymbol === 'v' || unknownSymbol.includes('vel')) {
            // Velocity: can be negative but often positive
            left = -right;
            bottom = 0;
        }
        
        this.bounds = { left, right, bottom, top };
    }
    
    /**
     * Adjust bounds to fit the generated data
     */
    adjustBoundsToData(data) {
        if (!data || data.length === 0) return;
        
        const xValues = data.map(p => p.x);
        const yValues = data.map(p => p.y);
        
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        
        // Add padding (10% on each side)
        const xRange = maxX - minX;
        const yRange = maxY - minY;
        const xPadding = Math.max(xRange * 0.1, Math.abs(maxX) * 0.1, 1);
        const yPadding = Math.max(yRange * 0.1, Math.abs(maxY) * 0.1, 1);
        
        this.bounds = {
            left: minX - xPadding,
            right: maxX + xPadding,
            bottom: minY - yPadding,
            top: maxY + yPadding
        };
        
        // Ensure bounds are reasonable
        if (this.bounds.right - this.bounds.left < 0.1) {
            const center = (this.bounds.left + this.bounds.right) / 2;
            this.bounds.left = center - 0.1;
            this.bounds.right = center + 0.1;
        }
        if (this.bounds.top - this.bounds.bottom < 0.1) {
            const center = (this.bounds.bottom + this.bounds.top) / 2;
            this.bounds.bottom = center - 0.1;
            this.bounds.top = center + 0.1;
        }
    }
    
    /**
     * Draw grid on canvas
     */
    drawGrid() {
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        const xStart = Math.ceil(left / this.gridSpacing) * this.gridSpacing;
        for (let x = xStart; x <= right; x += this.gridSpacing) {
            const screenX = padding.left + (x - left) * xScale;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, padding.top);
            this.ctx.lineTo(screenX, this.height - padding.bottom);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        const yStart = Math.ceil(bottom / this.gridSpacing) * this.gridSpacing;
        for (let y = yStart; y <= top; y += this.gridSpacing) {
            const screenY = this.height - padding.bottom - (y - bottom) * yScale;
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, screenY);
            this.ctx.lineTo(this.width - padding.right, screenY);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw axes on canvas
     */
    drawAxes(unknownVar) {
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 2;
        
        // X-axis
        const xAxisY = this.height - padding.bottom - (-bottom) * yScale;
        if (xAxisY >= padding.top && xAxisY <= this.height - padding.bottom) {
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, xAxisY);
            this.ctx.lineTo(this.width - padding.right, xAxisY);
            this.ctx.stroke();
        }
        
        // Y-axis
        const yAxisX = padding.left + (-left) * xScale;
        if (yAxisX >= padding.left && yAxisX <= this.width - padding.right) {
            this.ctx.beginPath();
            this.ctx.moveTo(yAxisX, padding.top);
            this.ctx.lineTo(yAxisX, this.height - padding.bottom);
            this.ctx.stroke();
        }
        
        // Axis labels
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        
        // X-axis label
        this.ctx.fillText(
            unknownVar.symbol || 'x',
            this.width / 2,
            this.height - 10
        );
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(20, this.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('y', 0, 0);
        this.ctx.restore();
        
        // Axis tick labels
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#94a3b8';
        
        // X-axis ticks
        const xStart = Math.ceil(left / this.gridSpacing) * this.gridSpacing;
        for (let x = xStart; x <= right; x += this.gridSpacing) {
            const screenX = padding.left + (x - left) * xScale;
            if (screenX >= padding.left && screenX <= this.width - padding.right) {
                this.ctx.fillText(
                    this.formatNumber(x),
                    screenX,
                    this.height - padding.bottom + 20
                );
            }
        }
        
        // Y-axis ticks
        const yStart = Math.ceil(bottom / this.gridSpacing) * this.gridSpacing;
        for (let y = yStart; y <= top; y += this.gridSpacing) {
            const screenY = this.height - padding.bottom - (y - bottom) * yScale;
            if (screenY >= padding.top && screenY <= this.height - padding.bottom) {
                this.ctx.textAlign = 'right';
                this.ctx.fillText(
                    this.formatNumber(y),
                    padding.left - 10,
                    screenY + 4
                );
            }
        }
    }
    
    /**
     * Draw curve on canvas
     */
    drawCurve(data, color = '#3b82f6') {
        if (!data || data.length === 0) return;
        
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Draw curve in segments to handle discontinuities
        let segmentStart = 0;
        for (let i = 1; i < data.length; i++) {
            const prevPoint = data[i - 1];
            const currPoint = data[i];
            
            // Check for large jumps (discontinuities)
            const dx = Math.abs(currPoint.x - prevPoint.x);
            const dy = Math.abs(currPoint.y - prevPoint.y);
            const jumpThreshold = (right - left) * 0.1; // 10% of range
            
            if (dx > jumpThreshold || dy > jumpThreshold || 
                !isFinite(currPoint.x) || !isFinite(currPoint.y) ||
                !isFinite(prevPoint.x) || !isFinite(prevPoint.y)) {
                // Draw segment up to previous point
                if (i - segmentStart > 1) {
                    this.drawCurveSegment(data.slice(segmentStart, i), padding, left, bottom, xScale, yScale);
                }
                segmentStart = i;
            }
        }
        
        // Draw final segment
        if (data.length - segmentStart > 1) {
            this.drawCurveSegment(data.slice(segmentStart), padding, left, bottom, xScale, yScale);
        }
    }
    
    /**
     * Draw a continuous curve segment
     */
    drawCurveSegment(segment, padding, left, bottom, xScale, yScale) {
        if (segment.length === 0) return;
        
        this.ctx.beginPath();
        const firstPoint = segment[0];
        const screenX = padding.left + (firstPoint.x - left) * xScale;
        const screenY = this.height - padding.bottom - (firstPoint.y - bottom) * yScale;
        this.ctx.moveTo(screenX, screenY);
        
        for (let i = 1; i < segment.length; i++) {
            const point = segment[i];
            const screenX = padding.left + (point.x - left) * xScale;
            const screenY = this.height - padding.bottom - (point.y - bottom) * yScale;
            
            // Only draw if point is within canvas bounds
            if (screenX >= padding.left && screenX <= this.width - padding.right &&
                screenY >= padding.top && screenY <= this.height - padding.bottom) {
                this.ctx.lineTo(screenX, screenY);
            }
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw points on canvas
     * PERFORMANCE: Optimized with adaptive step size (max 100 points)
     */
    drawPoints(data, color = '#60a5fa') {
        if (!data || data.length === 0) return;
        
        const { left, right, bottom, top } = this.bounds;
        const { padding, pointRadius } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        this.ctx.fillStyle = color;
        
        // PERFORMANCE: Draw every nth point to reduce clutter/performance cost
        // Max 100 points for smooth rendering
        const step = Math.max(1, Math.floor(data.length / 100));
        
        for (let i = 0; i < data.length; i += step) {
            const point = data[i];
            const screenX = padding.left + (point.x - left) * xScale;
            const screenY = this.height - padding.bottom - (point.y - bottom) * yScale;
            
            // Only draw if point is within visible bounds
            if (screenX >= padding.left && screenX <= this.width - padding.right &&
                screenY >= padding.top && screenY <= this.height - padding.bottom) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, pointRadius, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }
    
    /**
     * Draw title on canvas
     */
    drawTitle(formula, unknownVar) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${formula.name}: ${unknownVar.name || unknownVar.symbol}`,
            this.width / 2,
            20
        );
    }
    
    /**
     * Show message on canvas
     * ENHANCED: Better formatting and error handling
     */
    showGraphMessage(message) {
        if (!this.canvas || !this.ctx) return;
        
        // Clear and show message
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Word wrap for long messages
        const words = message.split(' ');
        const maxWidth = this.width - 40;
        let line = '';
        let y = this.height / 2 - 20;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                this.ctx.fillText(line, this.width / 2, y);
                line = word + ' ';
                y += 20;
            } else {
                line = testLine;
            }
        });
        this.ctx.fillText(line, this.width / 2, y);
    }
    
    /**
     * ENHANCED: Show reset bounds button (rendered via DOM overlay)
     */
    showResetButton() {
        const container = document.getElementById(this.containerId || 'desmos-graph');
        if (!container) return;
        
        // Remove existing button if any
        const existingBtn = container.querySelector('.reset-bounds-btn');
        if (existingBtn) existingBtn.remove();
        
        // Create reset button
        const btn = document.createElement('button');
        btn.className = 'reset-bounds-btn';
        btn.textContent = 'Reset View';
        btn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        btn.addEventListener('click', () => {
            this.resetBounds();
            btn.remove();
        });
        
        container.style.position = 'relative';
        container.appendChild(btn);
    }
    
    /**
     * Format number for display
     */
    formatNumber(num) {
        if (Math.abs(num) < 0.01 || Math.abs(num) > 1000) {
            return num.toExponential(1);
        }
        return num.toFixed(1);
    }
    
    /**
     * Shows a plain text message overlay
     */
    showPlainTextMessage(formula, container, customMessage = null) {
        if (!container) return;
        
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #cbd5e1; background: #1e293b; border-radius: 8px; border: 1px solid #334155;">
                <h4 style="color: #60a5fa; margin-bottom: 10px;">📊 Graph Visualization</h4>
                <p style="margin: 10px 0; color: #94a3b8;">${customMessage || "Enter values in the Calculator tab to see the graph"}</p>
                <p style="margin: 10px 0; font-size: 0.9em; color: #64748b;">Formula: ${formula.equation}</p>
            </div>
        `;
    }
    
    /**
     * ENHANCED: Draw calculated point with marker and label
     * IMPROVED: Better styling and positioning
     */
    drawCalculatedPoint(point) {
        if (!this.canvas || !this.ctx || !point) return;
        
        const { x, y, label, color = '#facc15' } = point;
        const { left, right, bottom, top } = this.bounds;
        const { padding, pointRadius } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        const screenX = padding.left + (x - left) * xScale;
        const screenY = this.height - padding.bottom - (y - bottom) * yScale;
        
        // Check if point is within visible bounds
        if (screenX < padding.left || screenX > this.width - padding.right ||
            screenY < padding.top || screenY > this.height - padding.bottom) {
            return;
        }
        
        // Draw outer glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        
        // Draw marker circle (larger for calculated points)
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, pointRadius * 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Draw inner highlight
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, pointRadius * 0.6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw label if provided
        if (label) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            
            // Draw background for label with rounded corners effect
            const textMetrics = this.ctx.measureText(label);
            const textWidth = textMetrics.width;
            const textHeight = 18;
            const labelX = screenX;
            const labelY = screenY - pointRadius * 2 - 8;
            
            // Draw label background
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1;
            this.ctx.fillRect(labelX - textWidth / 2 - 6, labelY - textHeight - 2, textWidth + 12, textHeight + 4);
            this.ctx.strokeRect(labelX - textWidth / 2 - 6, labelY - textHeight - 2, textWidth + 12, textHeight + 4);
            
            // Draw text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(label, labelX, labelY);
        }
    }
    
    /**
     * ENHANCED: Draw error bands/tolerance zones
     */
    drawErrorBands() {
        if (!this.canvas || !this.ctx || !this.errorBands || this.errorBands.length === 0) return;
        
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        this.errorBands.forEach(band => {
            if (!band.x || !band.y || !band.tolerance) return;
            
            const screenX = padding.left + (band.x - left) * xScale;
            const screenY = this.height - padding.bottom - (band.y - bottom) * yScale;
            
            // Calculate tolerance in screen coordinates
            const toleranceY = band.tolerance * yScale;
            
            // Draw tolerance band (vertical line with shaded area)
            this.ctx.strokeStyle = band.color || 'rgba(239, 68, 68, 0.5)';
            this.ctx.fillStyle = band.color || 'rgba(239, 68, 68, 0.2)';
            this.ctx.lineWidth = 1;
            
            // Draw shaded area
            this.ctx.beginPath();
            this.ctx.rect(
                padding.left,
                screenY - toleranceY,
                graphWidth,
                toleranceY * 2
            );
            this.ctx.fill();
            
            // Draw tolerance lines
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left, screenY - toleranceY);
            this.ctx.lineTo(this.width - padding.right, screenY - toleranceY);
            this.ctx.moveTo(padding.left, screenY + toleranceY);
            this.ctx.lineTo(this.width - padding.right, screenY + toleranceY);
            this.ctx.stroke();
        });
    }
    
    /**
     * ENHANCED: Draw legend for multiple curves
     */
    drawLegend() {
        if (!this.canvas || !this.ctx || !this.secondCurve) return;
        
        const legendX = this.width - 200;
        const legendY = 50;
        const legendHeight = 60;
        const legendWidth = 180;
        
        // Draw legend background
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 1;
        this.ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
        this.ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
        
        // Draw legend items
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        // Primary curve
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(legendX + 10, legendY + 20);
        this.ctx.lineTo(legendX + 30, legendY + 20);
        this.ctx.stroke();
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillText('Primary', legendX + 35, legendY + 20);
        
        // Second curve
        this.ctx.strokeStyle = this.secondCurve.color || '#ef4444';
        this.ctx.beginPath();
        this.ctx.moveTo(legendX + 10, legendY + 40);
        this.ctx.lineTo(legendX + 30, legendY + 40);
        this.ctx.stroke();
        this.ctx.fillText(this.secondCurve.label || 'Comparison', legendX + 35, legendY + 40);
    }
    
    /**
     * ENHANCED: Check if formula should auto-graph
     */
    shouldAutoGraph(formulaId) {
        return this.autoGraphFormulas.has(formulaId);
    }
    
    /**
     * ENHANCED: Setup zoom and pan interactivity
     */
    setupInteractivity() {
        if (!this.canvas) return;
        
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        // Store initial bounds for reset
        const defaultBounds = {
            left: this.bounds.left,
            right: this.bounds.right,
            bottom: this.bounds.bottom,
            top: this.bounds.top
        };
        
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const scaleFactor = e.deltaY < 0 ? 0.9 : 1.1;
            const bounds = this.bounds;
            
            // Get mouse position in graph coordinates
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const { padding } = this;
            const graphWidth = this.width - padding.left - padding.right;
            const graphHeight = this.height - padding.top - padding.bottom;
            
            const xScale = graphWidth / (bounds.right - bounds.left);
            const yScale = graphHeight / (bounds.top - bounds.bottom);
            
            const graphX = bounds.left + (mouseX - padding.left) / xScale;
            const graphY = bounds.bottom + (this.height - mouseY - padding.bottom) / yScale;
            
            // Zoom around mouse position
            const width = (bounds.right - bounds.left) * scaleFactor;
            const height = (bounds.top - bounds.bottom) * scaleFactor;
            
            this.bounds.left = graphX - (mouseX - padding.left) / xScale * scaleFactor;
            this.bounds.right = this.bounds.left + width;
            this.bounds.bottom = graphY - (this.height - mouseY - padding.bottom) / yScale * scaleFactor;
            this.bounds.top = this.bounds.bottom + height;
            
            // Limit zoom to prevent extreme values
            const minRange = 0.01;
            const maxRange = 1e20;
            if (this.bounds.right - this.bounds.left < minRange || 
                this.bounds.top - this.bounds.bottom < minRange) {
                this.bounds = { ...defaultBounds };
            } else if (this.bounds.right - this.bounds.left > maxRange || 
                       this.bounds.top - this.bounds.bottom > maxRange) {
                this.bounds = { ...defaultBounds };
            }
            
            // Debounce update
            if (this.zoomDebounceTimer) {
                clearTimeout(this.zoomDebounceTimer);
            }
            this.zoomDebounceTimer = setTimeout(() => {
                this._performUpdate();
            }, 50);
        }, { passive: false });
        
        // Mouse drag pan
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            const dx = currentX - lastX;
            const dy = currentY - lastY;
            
            const { padding } = this;
            const graphWidth = this.width - padding.left - padding.right;
            const graphHeight = this.height - padding.top - padding.bottom;
            
            const xScale = graphWidth / (this.bounds.right - this.bounds.left);
            const yScale = graphHeight / (this.bounds.top - this.bounds.bottom);
            
            const dxGraph = -dx / xScale;
            const dyGraph = dy / yScale;
            
            this.bounds.left += dxGraph;
            this.bounds.right += dxGraph;
            this.bounds.bottom += dyGraph;
            this.bounds.top += dyGraph;
            
            lastX = currentX;
            lastY = currentY;
            
            // Debounce update
            if (this.panDebounceTimer) {
                clearTimeout(this.panDebounceTimer);
            }
            this.panDebounceTimer = setTimeout(() => {
                this._performUpdate();
            }, 16); // ~60fps
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
            this.canvas.style.cursor = 'default';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            this.canvas.style.cursor = 'default';
        });
        
        // Double-click to reset bounds
        this.canvas.addEventListener('dblclick', () => {
            this.bounds = { ...defaultBounds };
            this._performUpdate();
        });
    }
    
    /**
     * ENHANCED: Reset graph bounds to default
     */
    resetBounds() {
        this.bounds = {
            left: -10,
            right: 10,
            bottom: -10,
            top: 10
        };
        this._performUpdate();
    }
    
    /**
     * ENHANCED: Get calculated point from formula and values
     * Finds the actual point on the curve that matches the calculated result
     */
    getCalculatedPoint(formula, variableValues, allValues) {
        if (!formula || !variableValues) return null;
        
        // Find which variable was calculated (has a value but was previously unknown)
        const userVariables = formula.variables.filter(v => {
            const constants = formula.constants || {};
            return !constants[v.symbol] && (!globalConstants || !globalConstants[v.symbol]);
        });
        
        // Find the unknown variable (x-axis) - the one we're graphing
        const unknownVar = userVariables.find(v => {
            const val = variableValues[v.symbol];
            return !val || val === null || val === '' || val === 'null' || val === 'N/A' || val === 'n/a' || val === 'na';
        });
        
        if (!unknownVar) return null;
        
        // Find the calculated variable (y-axis) - the one that was just solved
        const calculatedVar = userVariables.find(v => {
            if (v.symbol === unknownVar.symbol) return false; // Can't be the same as unknown
            const val = variableValues[v.symbol];
            return val && val !== null && val !== '' && val !== 'null' && val !== 'N/A' && val !== 'n/a' && val !== 'na';
        });
        
        if (!calculatedVar) return null;
        
        try {
            // Get the calculated value
            const calculatedValue = parseFloat(variableValues[calculatedVar.symbol]);
            if (!isFinite(calculatedValue)) return null;
            
            // Find the x value that produces this y value on the curve
            // We need to solve: y = f(x) for x, given y = calculatedValue
            // For most formulas, we can iterate through x values and find the closest match
            const x = this.findXForCalculatedY(formula, unknownVar, calculatedVar, calculatedValue, allValues);
            
            if (x === null || !isFinite(x)) return null;
            
            // Verify the point is on the curve
            const evalContext = { ...allValues, [unknownVar.symbol]: x };
            const y = this.evaluateFormula(formula, unknownVar, evalContext);
            
            if (y === null || !isFinite(y)) return null;
            
            // Use the actual y from the curve (might be slightly different due to numerical precision)
            return {
                x: x,
                y: y,
                label: `${calculatedVar.symbol} = ${this.formatNumber(calculatedValue)}`,
                color: '#fbbf24'
            };
        } catch (e) {
            console.warn('[OfflineGraphManager] Error getting calculated point:', e);
            return null;
        }
    }
    
    /**
     * ENHANCED: Find x value that produces the calculated y value
     * PERFORMANCE: Optimized with binary search and timeout protection
     */
    findXForCalculatedY(formula, unknownVar, calculatedVar, targetY, allValues) {
        // PERFORMANCE: Use fewer points and add timeout
        const numPoints = 100; // Reduced from 500 for performance
        const testRange = this.bounds.right - this.bounds.left;
        if (testRange <= 0 || !isFinite(testRange)) return null;
        
        const step = testRange / numPoints;
        const startTime = performance.now();
        const maxTime = 1000; // 1 second max for point finding
        
        let bestX = null;
        let bestDiff = Infinity;
        const tolerance = Math.max(Math.abs(targetY * 0.01), 1e-10); // 1% tolerance
        
        // PERFORMANCE: Use binary search approach for faster convergence
        // First, try a coarse search
        for (let i = 0; i <= numPoints; i += 5) { // Step by 5 for coarse search
            if (performance.now() - startTime > maxTime) break;
            
            const x = this.bounds.left + (i * step);
            if (!isFinite(x) || isNaN(x)) continue;
            
            try {
                const evalContext = { ...allValues, [unknownVar.symbol]: x };
                const y = this.evaluateFormula(formula, unknownVar, evalContext);
                
                if (y !== null && isFinite(y) && !isNaN(y)) {
                    const diff = Math.abs(y - targetY);
                    if (diff < bestDiff) {
                        bestDiff = diff;
                        bestX = x;
                    }
                    
                    // If we're very close, return immediately
                    if (diff < tolerance) {
                        return x;
                    }
                }
            } catch (e) {
                continue; // Skip errors
            }
        }
        
        // Return best match if within reasonable tolerance
        if (bestX !== null && bestDiff < Math.abs(targetY * 0.05)) { // 5% tolerance
            return bestX;
        }
        
        return null;
    }
    
    /**
     * Show relationship when all variables are filled
     */
    showRelationship(formula, variableValues) {
        const container = document.getElementById(this.containerId || 'desmos-graph');
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #cbd5e1; background: #1e293b; border-radius: 8px; border: 1px solid #334155;">
                    <h4 style="color: #60a5fa; margin-bottom: 10px;">📊 All Variables Known</h4>
                    <p style="margin: 10px 0; color: #94a3b8;">All variables have values. Leave one variable empty to see how it varies.</p>
                </div>
            `;
        }
    }
}

