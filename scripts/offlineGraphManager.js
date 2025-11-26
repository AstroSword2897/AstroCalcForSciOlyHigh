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
        this.cache = new Map();
        
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
    }
    
    /**
     * Initialize the canvas graph
     */
    init(containerId = null) {
        const targetContainerId = containerId || this.containerId || 'desmos-graph';
        const container = document.getElementById(targetContainerId);
        if (!container) {
            console.warn(`Graph container ${targetContainerId} not found.`);
            return false;
        }
        
        // Check if container has dimensions
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            console.warn('Graph container has no dimensions, waiting...');
            setTimeout(() => this.init(targetContainerId), 200);
            return false;
        }
        
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
        
        // If we have a stored formula, update the graph
        if (this.currentFormula) {
            setTimeout(() => {
                this.updateGraph(this.currentFormula, this.currentValues);
            }, 100);
        }
        
        return true;
    }
    
    /**
     * Main entry point to update or re-render a graph
     */
    updateGraph(formula, variableValues = {}) {
        this.currentFormula = formula;
        this.currentValues = { ...variableValues };
        
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
        
        // If tab is not active, still show message if no values
        if (!isTabActive) {
            if (!hasAnyValues && container) {
                this.showPlainTextMessage(formula, container);
            }
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
        
        // Render the graph
        this.renderFormulaGraph(formula, nullVar, { ...globalConstants, ...constants, ...variableValues });
    }
    
    /**
     * Render a formula graph on canvas
     */
    renderFormulaGraph(formula, unknownVar, allValues) {
        if (!this.canvas || !this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Calculate graph bounds based on variable values
        this.calculateBounds(formula, unknownVar, allValues);
        
        // Draw grid and axes
        this.drawGrid();
        this.drawAxes(unknownVar);
        
        // Generate data points
        const data = this.generateGraphData(formula, unknownVar, allValues);
        
        if (data && data.length > 0) {
            // Adjust bounds to fit the data if needed
            this.adjustBoundsToData(data);
            
            // Redraw grid and axes with new bounds
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawGrid();
            this.drawAxes(unknownVar);
            
            // Draw the curve
            this.drawCurve(data, '#3b82f6');
            
            // Draw points
            this.drawPoints(data, '#60a5fa');
        } else {
            // Show message if graph cannot be generated
            this.showGraphMessage("Unable to generate graph for this formula. Try entering values for all variables except one.");
        }
        
        // Draw title
        this.drawTitle(formula, unknownVar);
    }
    
    /**
     * Generate data points for the graph
     */
    generateGraphData(formula, unknownVar, allValues) {
        const unknownSymbol = unknownVar.symbol;
        const numPoints = 300; // Increased for smoother curves
        const data = [];
        
        // Calculate initial bounds if not set
        if (this.bounds.right - this.bounds.left <= 0) {
            this.calculateBounds(formula, unknownVar, allValues);
        }
        
        // Create range for unknown variable
        const range = this.bounds.right - this.bounds.left;
        if (range <= 0) {
            console.warn('[OfflineGraphManager] Invalid bounds range');
            return null;
        }
        
        const step = range / numPoints;
        let validPoints = 0;
        
        try {
            for (let i = 0; i <= numPoints; i++) {
                const x = this.bounds.left + (i * step);
                
                // Skip if x is invalid
                if (!isFinite(x) || isNaN(x)) continue;
                
                // Create evaluation context with x value
                const evalContext = { ...allValues, [unknownSymbol]: x };
                
                // Try to evaluate the formula
                const y = this.evaluateFormula(formula, unknownVar, evalContext);
                
                if (y !== null && isFinite(y) && !isNaN(y)) {
                    data.push({ x, y });
                    validPoints++;
                }
            }
        } catch (e) {
            console.error('[OfflineGraphManager] Error generating graph data:', e);
            return null;
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
        
        // Replace variables with values
        let evalExpr = expression;
        for (const [key, value] of Object.entries(values)) {
            if (value !== null && value !== undefined && key !== unknownSymbol) {
                const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                evalExpr = evalExpr.replace(regex, String(value));
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
            
            // Fallback: direct evaluation
            const func = new Function('x', 'Math', `
                const π = Math.PI;
                return ${evalExpr};
            `);
            
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
     */
    drawPoints(data, color = '#60a5fa') {
        if (!data || data.length === 0) return;
        
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        this.ctx.fillStyle = color;
        
        // Draw every 10th point to avoid clutter
        for (let i = 0; i < data.length; i += 10) {
            const point = data[i];
            const screenX = padding.left + (point.x - left) * xScale;
            const screenY = this.height - padding.bottom - (point.y - bottom) * yScale;
            
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, this.pointRadius, 0, 2 * Math.PI);
            this.ctx.fill();
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
     */
    showGraphMessage(message) {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            message,
            this.width / 2,
            this.height / 2
        );
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

