/**
 * ============================================================
 *  📊 StandaloneGraphCalculator — Full-Featured Canvas Graphing Calculator
 * ============================================================
 * 
 * PURPOSE:
 *  A Desmos-like graphing calculator that:
 *   - Uses HTML5 Canvas for rendering (fully offline)
 *   - Supports multiple expressions simultaneously
 *   - Interactive zoom/pan controls
 *   - Sliders for parameters
 *   - Table of values
 *   - Grid and axis customization
 *   - Export functionality
 * 
 * FEATURES:
 *   - Multiple graph expressions (y = f(x), parametric, polar)
 *   - Real-time expression evaluation
 *   - Zoom in/out, pan, reset view
 *   - Sliders for variable parameters
 *   - Table view of calculated values
 *   - Color-coded graphs
 *   - Grid and axis labels
 */

class StandaloneGraphCalculator {
    constructor(containerId) {
        this.containerId = containerId;
        this.canvas = null;
        this.ctx = null;
        
        // Graph expressions
        this.expressions = [];
        this.nextExpressionId = 1;
        
        // Graph settings
        this.width = 800;
        this.height = 600;
        this.padding = { top: 40, right: 40, bottom: 60, left: 80 };
        
        // View bounds
        this.bounds = {
            left: -10,
            right: 10,
            bottom: -10,
            top: 10
        };
        
        // Sliders
        this.sliders = new Map();
        this.nextSliderId = 1;
        
        // Interaction state
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.lastBounds = null;
        
        // Grid settings
        this.showGrid = true;
        this.gridSpacing = 1;
        
        // Performance optimizations
        // FIXED: Use LRU cache with size limit to prevent memory leaks
        this.renderCache = typeof LRUCache !== 'undefined' ? new LRUCache(20) : new Map(); // Cache rendered graph data
        this.lastRenderTime = 0;
        this.renderDebounceMs = 16; // ~60fps
        this.pendingRender = null;
        
        // FIXED: Store ResizeObserver for cleanup
        this.resizeObserver = null;
        
        // Quality settings - REDUCED to prevent crashes
        this.adaptiveSampling = false; // Disabled by default to prevent excessive computation
        this.minPoints = 100;
        this.maxPoints = 500; // Reduced from 2000 to prevent memory issues
        this.qualityMultiplier = 1.0; // Adjust based on zoom level
        this.maxDataPoints = 1000; // Hard limit on total points per expression
        
        // Colors for different expressions (Desmos-like palette)
        this.colors = [
            '#3b82f6', // blue
            '#ef4444', // red
            '#10b981', // green
            '#f59e0b', // amber
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#06b6d4', // cyan
            '#84cc16'  // lime
        ];
        
        // Points for click-to-add functionality
        this.points = [];
        this.nextPointId = 1;
        
        // Coordinate display
        this.showCoordinates = true;
        this.mousePosition = null;
        
        // Keyboard shortcuts
        this.keyboardShortcuts = {
            'Enter': () => this.addExpression('', true),
            'Delete': () => this.removeSelectedExpression(),
            'Escape': () => this.clearSelection(),
            'r': () => this.resetView(),
            'g': () => { this.showGrid = !this.showGrid; this.render(); },
            '=': () => this.focusFirstExpression()
        };
        
        this.selectedExpressionId = null;
    }
    
    /**
     * Initialize the calculator
     */
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container ${this.containerId} not found`);
            return false;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Create calculator structure (Desmos-like layout)
        const calculatorHTML = `
            <div class="standalone-calculator-container desmos-style">
                <div class="calculator-expressions-panel desmos-expressions">
                    <div class="expressions-header">
                        <h4>Expressions</h4>
                        <div class="expression-actions">
                            <button class="btn-add-expression" id="add-expression-btn" title="Add Expression (Enter)">+</button>
                            <button class="btn-help" id="help-btn" title="Keyboard Shortcuts">?</button>
                        </div>
                    </div>
                    <div class="expressions-list" id="expressions-list" tabindex="0"></div>
                    <div class="expressions-hint">Press Enter to add expression</div>
                </div>
                <div class="calculator-graph-panel">
                    <div class="graph-controls desmos-controls">
                        <button class="graph-control-btn" id="zoom-in-btn" title="Zoom In (Ctrl +)">+</button>
                        <button class="graph-control-btn" id="zoom-out-btn" title="Zoom Out (Ctrl -)">−</button>
                        <button class="graph-control-btn" id="reset-view-btn" title="Reset View (R)">↺</button>
                        <button class="graph-control-btn" id="toggle-grid-btn" title="Toggle Grid (G)">⊞</button>
                        <button class="graph-control-btn" id="export-graph-btn" title="Export Graph">💾</button>
                    </div>
                    <div class="graph-canvas-container" id="graph-container">
                        <canvas id="${this.containerId}-canvas"></canvas>
                        <div class="coordinate-display" id="coordinate-display"></div>
                        <div class="graph-hint">Click to add point • Drag to pan • Scroll to zoom</div>
                    </div>
                </div>
                <div class="calculator-sidebar">
                    <div class="sliders-panel">
                        <div class="sliders-header">
                            <h4>Sliders</h4>
                            <button class="btn-add-slider" id="add-slider-btn" title="Add Slider">+</button>
                        </div>
                        <div class="sliders-list" id="sliders-list"></div>
                    </div>
                    <div class="table-panel">
                        <div class="table-header">
                            <h4>Table</h4>
                            <button class="btn-toggle-table" id="toggle-table-btn">Show</button>
                        </div>
                        <div class="table-content" id="table-content" style="display: none;"></div>
                    </div>
                </div>
            </div>
            <div class="keyboard-shortcuts-modal" id="shortcuts-modal" style="display: none;">
                <div class="shortcuts-content">
                    <h3>Keyboard Shortcuts</h3>
                    <div class="shortcuts-list">
                        <div class="shortcut-item"><kbd>Enter</kbd> Add new expression</div>
                        <div class="shortcut-item"><kbd>Delete</kbd> Remove selected expression</div>
                        <div class="shortcut-item"><kbd>R</kbd> Reset view</div>
                        <div class="shortcut-item"><kbd>G</kbd> Toggle grid</div>
                        <div class="shortcut-item"><kbd>=</kbd> Focus first expression</div>
                        <div class="shortcut-item"><kbd>Esc</kbd> Clear selection</div>
                        <div class="shortcut-item"><kbd>Click</kbd> Add point on graph</div>
                        <div class="shortcut-item"><kbd>Drag</kbd> Pan graph</div>
                        <div class="shortcut-item"><kbd>Scroll</kbd> Zoom in/out</div>
                    </div>
                    <button class="close-shortcuts" id="close-shortcuts">Close</button>
                </div>
            </div>
        `;
        
        container.innerHTML = calculatorHTML;
        
        // Get canvas
        const canvas = document.getElementById(`${this.containerId}-canvas`);
        if (!canvas) {
            console.error('Canvas not found');
            return false;
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas size
        const graphContainer = container.querySelector('.graph-canvas-container');
        if (graphContainer) {
            const resizeCanvas = () => {
                const rect = graphContainer.getBoundingClientRect();
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
                this.width = this.canvas.width;
                this.height = this.canvas.height;
                this.render();
            };
            
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            // Use ResizeObserver for better responsiveness
            // FIXED: Store ResizeObserver for cleanup
            if (typeof ResizeObserver !== 'undefined') {
                this.resizeObserver = new ResizeObserver(resizeCanvas);
                this.resizeObserver.observe(graphContainer);
            }
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add default expression
        this.addExpression('y = x^2', true);
        
        // Initial render
        this.render();
        
        console.log('[StandaloneGraphCalculator] Initialized with Desmos-like features');
        return true;
    }
    
    /**
     * Setup keyboard shortcuts (Desmos-like)
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const key = e.key;
            const ctrl = e.ctrlKey || e.metaKey;
            
            // Ctrl/Cmd + shortcuts
            if (ctrl && key === '=') {
                e.preventDefault();
                this.zoom(1.2);
            } else if (ctrl && key === '-') {
                e.preventDefault();
                this.zoom(0.833);
            } else if (this.keyboardShortcuts[key]) {
                e.preventDefault();
                this.keyboardShortcuts[key]();
            }
        });
        
        // Help modal
        const helpBtn = document.getElementById('help-btn');
        const shortcutsModal = document.getElementById('shortcuts-modal');
        const closeShortcuts = document.getElementById('close-shortcuts');
        
        if (helpBtn && shortcutsModal) {
            helpBtn.addEventListener('click', () => {
                shortcutsModal.style.display = 'flex';
            });
        }
        
        if (closeShortcuts && shortcutsModal) {
            closeShortcuts.addEventListener('click', () => {
                shortcutsModal.style.display = 'none';
            });
        }
        
        // Close modal on outside click
        if (shortcutsModal) {
            shortcutsModal.addEventListener('click', (e) => {
                if (e.target === shortcutsModal) {
                    shortcutsModal.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add expression button
        const addExprBtn = document.getElementById('add-expression-btn');
        if (addExprBtn) {
            addExprBtn.addEventListener('click', () => this.addExpression('', false));
        }
        
        // Zoom controls
        const zoomInBtn = document.getElementById('zoom-in-btn');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoom(1.2));
        }
        
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoom(0.833));
        }
        
        const resetBtn = document.getElementById('reset-view-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetView());
        }
        
        const toggleGridBtn = document.getElementById('toggle-grid-btn');
        if (toggleGridBtn) {
            toggleGridBtn.addEventListener('click', () => {
                this.showGrid = !this.showGrid;
                this.render();
            });
        }
        
        const exportBtn = document.getElementById('export-graph-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportGraph());
        }
        
        // Add slider button
        const addSliderBtn = document.getElementById('add-slider-btn');
        if (addSliderBtn) {
            addSliderBtn.addEventListener('click', () => this.addSlider('a', 1, -10, 10));
        }
        
        // Toggle table button
        const toggleTableBtn = document.getElementById('toggle-table-btn');
        if (toggleTableBtn) {
            toggleTableBtn.addEventListener('click', () => {
                const tableContent = document.getElementById('table-content');
                if (tableContent) {
                    const isVisible = tableContent.style.display !== 'none';
                    tableContent.style.display = isVisible ? 'none' : 'block';
                    toggleTableBtn.textContent = isVisible ? 'Show Table' : 'Hide Table';
                    if (!isVisible) {
                        this.updateTable();
                    }
                }
            });
        }
        
        // Canvas interaction (pan, click to add points)
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
            this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('mouseleave', () => {
                this.mousePosition = null;
                this.updateCoordinateDisplay();
            });
        }
    }
    
    /**
     * Add a new expression
     */
    addExpression(expression = '', focus = true) {
        const id = this.nextExpressionId++;
        const color = this.colors[(id - 1) % this.colors.length];
        
        const expr = {
            id,
            expression: expression,
            color,
            enabled: true,
            type: 'function' // function, parametric, polar
        };
        
        this.expressions.push(expr);
        this.renderExpressionItem(expr);
        
        if (focus) {
            const input = document.getElementById(`expr-input-${id}`);
            if (input) {
                input.focus();
                input.select();
            }
        }
        
        this.render();
    }
    
    /**
     * Render expression item in the list
     */
    renderExpressionItem(expr) {
        const list = document.getElementById('expressions-list');
        if (!list) return;
        
        const item = document.createElement('div');
        item.className = `expression-item ${this.selectedExpressionId === expr.id ? 'selected' : ''}`;
        item.id = `expr-item-${expr.id}`;
        item.innerHTML = `
            <div class="expression-controls">
                <div class="expr-color-indicator" style="background: ${expr.color}"></div>
                <input type="color" class="expr-color" value="${expr.color}" data-id="${expr.id}" title="Change color">
                <input type="checkbox" class="expr-enabled" ${expr.enabled ? 'checked' : ''} data-id="${expr.id}" title="Toggle visibility">
            </div>
            <input type="text" class="expr-input" id="expr-input-${expr.id}" 
                   value="${expr.expression}" placeholder="y = x^2" data-id="${expr.id}">
            <button class="expr-delete" data-id="${expr.id}" title="Delete (Delete key)">×</button>
        `;
        
        list.appendChild(item);
        
        // Setup event listeners
        const input = item.querySelector('.expr-input');
        const colorInput = item.querySelector('.expr-color');
        const enabledCheck = item.querySelector('.expr-enabled');
        const deleteBtn = item.querySelector('.expr-delete');
        
        // Debounce expression input for better performance
        let exprTimeout = null;
        input.addEventListener('focus', () => {
            this.selectedExpressionId = expr.id;
            this.updateExpressionSelection();
        });
        
        input.addEventListener('input', (e) => {
            expr.expression = e.target.value;
            
            // Clear cache when expression changes
            this.renderCache.clear();
            
            // Debounce render during typing
            if (exprTimeout) {
                clearTimeout(exprTimeout);
            }
            exprTimeout = setTimeout(() => {
                this.render();
            }, 300);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.render();
                // Add new expression on Enter
                this.addExpression('', true);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (e.target.value === '') {
                    e.preventDefault();
                    this.removeExpression(expr.id);
                }
            }
        });
        
        colorInput.addEventListener('change', (e) => {
            expr.color = e.target.value;
            this.render();
        });
        
        enabledCheck.addEventListener('change', (e) => {
            expr.enabled = e.target.checked;
            this.render();
        });
        
        deleteBtn.addEventListener('click', () => {
            this.removeExpression(expr.id);
        });
    }
    
    /**
     * Remove an expression
     */
    removeExpression(id) {
        this.expressions = this.expressions.filter(e => e.id !== id);
        const item = document.getElementById(`expr-item-${id}`);
        if (item) {
            item.remove();
        }
        if (this.selectedExpressionId === id) {
            this.selectedExpressionId = null;
        }
        this.render();
    }
    
    /**
     * Update expression selection highlighting
     */
    updateExpressionSelection() {
        this.expressions.forEach(expr => {
            const item = document.getElementById(`expr-item-${expr.id}`);
            if (item) {
                if (this.selectedExpressionId === expr.id) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            }
        });
    }
    
    /**
     * Remove selected expression
     */
    removeSelectedExpression() {
        if (this.selectedExpressionId) {
            this.removeExpression(this.selectedExpressionId);
        }
    }
    
    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedExpressionId = null;
        this.updateExpressionSelection();
    }
    
    /**
     * Focus first expression
     */
    focusFirstExpression() {
        if (this.expressions.length > 0) {
            const firstInput = document.getElementById(`expr-input-${this.expressions[0].id}`);
            if (firstInput) {
                firstInput.focus();
            }
        }
    }
    
    /**
     * Add a slider
     */
    addSlider(name, value, min, max) {
        const id = this.nextSliderId++;
        const slider = {
            id,
            name,
            value,
            min,
            max,
            step: (max - min) / 100
        };
        
        this.sliders.set(id, slider);
        this.renderSlider(slider);
        this.render();
    }
    
    /**
     * Render slider item
     */
    renderSlider(slider) {
        const list = document.getElementById('sliders-list');
        if (!list) return;
        
        const item = document.createElement('div');
        item.className = 'slider-item';
        item.id = `slider-item-${slider.id}`;
        item.innerHTML = `
            <div class="slider-header">
                <label>${slider.name} = <span id="slider-value-${slider.id}">${slider.value.toFixed(2)}</span></label>
                <button class="slider-delete" data-id="${slider.id}" title="Delete">×</button>
            </div>
            <input type="range" class="slider-input" id="slider-input-${slider.id}"
                   min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${slider.value}" data-id="${slider.id}">
        `;
        
        list.appendChild(item);
        
        // Setup event listeners
        const input = item.querySelector('.slider-input');
        const valueSpan = item.querySelector(`#slider-value-${slider.id}`);
        const deleteBtn = item.querySelector('.slider-delete');
        
        // Debounce slider updates for better performance
        let sliderTimeout = null;
        input.addEventListener('input', (e) => {
            slider.value = parseFloat(e.target.value);
            valueSpan.textContent = slider.value.toFixed(2);
            
            // Clear cache when slider changes
            this.renderCache.clear();
            
            // Debounce render during dragging
            if (sliderTimeout) {
                clearTimeout(sliderTimeout);
            }
            sliderTimeout = setTimeout(() => {
                this.render();
            }, 50);
        });
        
        deleteBtn.addEventListener('click', () => {
            this.removeSlider(slider.id);
        });
    }
    
    /**
     * Remove a slider
     */
    removeSlider(id) {
        this.sliders.delete(id);
        const item = document.getElementById(`slider-item-${id}`);
        if (item) {
            item.remove();
        }
        this.render();
    }
    
    /**
     * Get slider values as an object
     */
    getSliderValues() {
        const values = {};
        this.sliders.forEach(slider => {
            values[slider.name] = slider.value;
        });
        return values;
    }
    
    /**
     * Evaluate an expression
     */
    evaluateExpression(expr, x) {
        try {
            // Get slider values
            const sliderValues = this.getSliderValues();
            
            // Replace variables with values
            let evalExpr = expr.expression;
            
            // Replace slider variables
            for (const [name, value] of Object.entries(sliderValues)) {
                const regex = new RegExp(`\\b${name}\\b`, 'g');
                evalExpr = evalExpr.replace(regex, String(value));
            }
            
            // Replace x
            evalExpr = evalExpr.replace(/\bx\b/g, String(x));
            
            // Handle y = ... format
            if (evalExpr.includes('=')) {
                const parts = evalExpr.split('=');
                if (parts.length === 2) {
                    const left = parts[0].trim();
                    const right = parts[1].trim();
                    if (left === 'y' || left.includes('y')) {
                        evalExpr = right;
                    }
                }
            }
            
            // Replace common math functions
            evalExpr = evalExpr
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/asin\(/g, 'Math.asin(')
                .replace(/acos\(/g, 'Math.acos(')
                .replace(/atan\(/g, 'Math.atan(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/exp\(/g, 'Math.exp(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/abs\(/g, 'Math.abs(')
                .replace(/π/g, 'Math.PI')
                .replace(/e\b/g, 'Math.E')
                .replace(/\^/g, '**');
            
            // FIXED: Use safer evaluation with validation
            // Use SafeExpressionEvaluator if available, otherwise use validated Function()
            if (typeof SafeExpressionEvaluator !== 'undefined') {
                const sliderValues = {};
                this.sliders.forEach((slider, id) => {
                    sliderValues[slider.variable] = slider.value;
                });
                return SafeExpressionEvaluator.evaluate(expr.expression, { x, ...sliderValues });
            }
            
            // Fallback: Use Function() with validation (still safer than before)
            // Validate expression doesn't contain dangerous patterns
            const dangerousPatterns = [/eval\s*\(/i, /function\s*\(/i, /constructor/i, /prototype/i];
            for (const pattern of dangerousPatterns) {
                if (pattern.test(evalExpr)) {
                    console.warn('[StandaloneGraphCalculator] Dangerous pattern in expression');
                    return null;
                }
            }
            
            const func = new Function('Math', `"use strict"; return (${evalExpr})`);
            return func(Math);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Generate graph data for an expression with safeguards
     * O(n) where n is limited to prevent crashes
     */
    generateGraphData(expr) {
        if (!expr.enabled || !expr.expression.trim()) {
            return null;
        }
        
        try {
            // Check cache first (O(1) lookup)
            const cacheKey = `${expr.id}-${expr.expression}-${this.bounds.left}-${this.bounds.right}-${this.bounds.bottom}-${this.bounds.top}`;
            if (this.renderCache.has(cacheKey)) {
                return this.renderCache.get(cacheKey);
            }
            
            const { left, right, bottom, top } = this.bounds;
            const range = Math.abs(right - left);
            
            // Safety check: prevent excessive range
            if (range > 1e10 || range === 0 || !isFinite(range)) {
                console.warn('[Graph] Invalid bounds, skipping render');
                return null;
            }
            
            // Adaptive point count based on zoom level and screen size
            // Capped to prevent memory issues
            const basePoints = Math.max(this.minPoints, Math.min(this.maxPoints, 
                Math.floor((this.width * this.qualityMultiplier) * Math.min(range / 20, 1))));
            
            const data = [];
            const step = range / basePoints;
            let pointCount = 0;
            
            // Uniform sampling with safety limits
            for (let i = 0; i <= basePoints && pointCount < this.maxDataPoints; i++) {
                const x = left + (i * step);
                
                // Safety check for x
                if (!isFinite(x)) continue;
                
                const y = this.evaluateExpression(expr, x);
                
                if (y !== null && isFinite(y) && !isNaN(y)) {
                    // Only add points within reasonable bounds
                    if (y >= -1e10 && y <= 1e10) {
                        data.push({ x, y });
                        pointCount++;
                    }
                }
            }
            
            // Cache the result (O(1) insert) - only if reasonable size
            if (data.length > 0 && data.length <= this.maxDataPoints) {
                this.renderCache.set(cacheKey, data);
                // Limit cache size to prevent memory issues
                if (this.renderCache.size > 20) { // Reduced from 50
                    const firstKey = this.renderCache.keys().next().value;
                    this.renderCache.delete(firstKey);
                }
            }
            
            return data.length > 0 ? data : null;
        } catch (error) {
            console.error('[Graph] Error generating graph data:', error);
            return null; // Return null instead of crashing
        }
    }
    
    /**
     * Adaptive sampling algorithm - DISABLED by default to prevent crashes
     * Adds more points in areas with high curvature for better quality
     * NOTE: This can cause performance issues, so it's disabled by default
     */
    adaptiveSample(expr, xMin, xMax, basePoints, yMin, yMax) {
        // Safety: Don't use adaptive sampling if disabled
        if (!this.adaptiveSampling) {
            return [];
        }
        
        const data = [];
        const tolerance = 0.01; // Maximum error tolerance
        const maxDepth = 4; // Reduced from 8 to prevent excessive recursion
        const maxPoints = 500; // Hard limit on adaptive sampling points
        
        // Initial uniform sampling
        const initialStep = (xMax - xMin) / basePoints;
        const initialPoints = [];
        for (let i = 0; i <= basePoints; i++) {
            const x = xMin + (i * initialStep);
            const y = this.evaluateExpression(expr, x);
            if (y !== null && isFinite(y) && !isNaN(y)) {
                initialPoints.push({ x, y });
            }
        }
        
        if (initialPoints.length < 2) return initialPoints;
        
        // Recursively refine areas with high curvature
        const refine = (p1, p2, depth) => {
            if (depth > maxDepth) {
                data.push(p2);
                return;
            }
            
            const xMid = (p1.x + p2.x) / 2;
            const yMid = this.evaluateExpression(expr, xMid);
            
            if (yMid === null || !isFinite(yMid) || isNaN(yMid)) {
                data.push(p2);
                return;
            }
            
            // Linear interpolation between p1 and p2
            const yInterpolated = p1.y + (p2.y - p1.y) * ((xMid - p1.x) / (p2.x - p1.x));
            
            // If error is significant, subdivide
            const error = Math.abs(yMid - yInterpolated);
            if (error > tolerance) {
                refine(p1, { x: xMid, y: yMid }, depth + 1);
                refine({ x: xMid, y: yMid }, p2, depth + 1);
            } else {
                data.push(p2);
            }
        };
        
        // Start with first point
        data.push(initialPoints[0]);
        
        // Refine between each pair of initial points
        for (let i = 0; i < initialPoints.length - 1; i++) {
            refine(initialPoints[i], initialPoints[i + 1], 0);
        }
        
        return data;
    }
    
    /**
     * Render the graph with performance optimizations and error handling
     * Uses debouncing and caching to minimize redraws
     * O(m*n) where m=expressions, n=points per expression (cached)
     */
    render(force = false) {
        if (!this.canvas || !this.ctx) return;
        
        try {
            // Debounce rapid renders (e.g., during slider dragging)
            const now = performance.now();
            if (!force && (now - this.lastRenderTime) < this.renderDebounceMs) {
                if (this.pendingRender) {
                    cancelAnimationFrame(this.pendingRender);
                }
                this.pendingRender = requestAnimationFrame(() => this.render(true));
                return;
            }
            
            this.lastRenderTime = now;
            
            // Safety check: prevent rendering if canvas is invalid
            if (this.width <= 0 || this.height <= 0 || !isFinite(this.width) || !isFinite(this.height)) {
                console.warn('[Graph] Invalid canvas dimensions, skipping render');
                return;
            }
            
            // Enable anti-aliasing for better quality
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Draw background
            this.ctx.fillStyle = '#0f172a';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw grid (optimized - only redraws when bounds change)
            if (this.showGrid) {
                try {
                    this.drawGrid();
                } catch (e) {
                    console.warn('[Graph] Error drawing grid:', e);
                }
            }
            
            // Draw axes
            try {
                this.drawAxes();
            } catch (e) {
                console.warn('[Graph] Error drawing axes:', e);
            }
            
            // Draw expressions (with caching and error handling)
            let expressionCount = 0;
            const maxExpressions = 10; // Limit number of expressions to prevent overload
            
            for (const expr of this.expressions) {
                if (expressionCount >= maxExpressions) {
                    console.warn('[Graph] Too many expressions, limiting render');
                    break;
                }
                
                try {
                    const data = this.generateGraphData(expr);
                    if (data && data.length > 0 && data.length <= this.maxDataPoints) {
                        this.drawCurve(data, expr.color);
                        expressionCount++;
                    }
                } catch (e) {
                    console.warn(`[Graph] Error rendering expression ${expr.id}:`, e);
                    // Continue with other expressions
                }
            }
            
            // Draw points (limited)
            try {
                if (this.points.length <= 100) { // Limit points
                    this.drawPoints();
                }
            } catch (e) {
                console.warn('[Graph] Error drawing points:', e);
            }
            
            // Draw labels
            try {
                this.drawLabels();
            } catch (e) {
                console.warn('[Graph] Error drawing labels:', e);
            }
        } catch (error) {
            console.error('[Graph] Fatal error in render:', error);
            // Show error message on canvas
            if (this.ctx) {
                this.ctx.fillStyle = '#ef4444';
                this.ctx.font = '14px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Graph rendering error. Please try simpler expressions.', this.width / 2, this.height / 2);
            }
        }
    }
    
    /**
     * Draw points on the graph
     */
    drawPoints() {
        if (this.points.length === 0) return;
        
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        this.points.forEach(point => {
            const screenX = padding.left + (point.x - left) * xScale;
            const screenY = this.height - padding.bottom - (point.y - bottom) * yScale;
            
            if (screenX >= padding.left && screenX <= this.width - padding.right &&
                screenY >= padding.top && screenY <= this.height - padding.bottom) {
                
                // Draw point
                this.ctx.fillStyle = point.color;
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, 5, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Draw label
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '11px sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(point.label, screenX + 8, screenY - 5);
            }
        });
    }
    
    /**
     * Draw grid with optimized rendering
     * O(n + m) where n = vertical lines, m = horizontal lines
     * Uses path optimization to reduce draw calls
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
        this.ctx.setLineDash([]);
        
        // Batch vertical lines into single path for better performance
        const xStep = this.calculateGridStep(right - left);
        const xStart = Math.ceil(left / xStep) * xStep;
        const xEnd = Math.floor(right / xStep) * xStep;
        
        if (xEnd >= xStart) {
            this.ctx.beginPath();
            for (let x = xStart; x <= xEnd; x += xStep) {
                const screenX = padding.left + (x - left) * xScale;
                if (screenX >= padding.left && screenX <= this.width - padding.right) {
                    this.ctx.moveTo(screenX, padding.top);
                    this.ctx.lineTo(screenX, this.height - padding.bottom);
                }
            }
            this.ctx.stroke();
        }
        
        // Batch horizontal lines into single path
        const yStep = this.calculateGridStep(top - bottom);
        const yStart = Math.ceil(bottom / yStep) * yStep;
        const yEnd = Math.floor(top / yStep) * yStep;
        
        if (yEnd >= yStart) {
            this.ctx.beginPath();
            for (let y = yStart; y <= yEnd; y += yStep) {
                const screenY = this.height - padding.bottom - (y - bottom) * yScale;
                if (screenY >= padding.top && screenY <= this.height - padding.bottom) {
                    this.ctx.moveTo(padding.left, screenY);
                    this.ctx.lineTo(this.width - padding.right, screenY);
                }
            }
            this.ctx.stroke();
        }
    }
    
    /**
     * Calculate appropriate grid step
     */
    calculateGridStep(range) {
        const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
        if (range / magnitude < 2) {
            return magnitude / 5;
        } else if (range / magnitude < 5) {
            return magnitude / 2;
        } else {
            return magnitude;
        }
    }
    
    /**
     * Draw axes
     */
    drawAxes() {
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
        this.ctx.fillText('x', this.width / 2, this.height - 10);
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(20, this.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('y', 0, 0);
        this.ctx.restore();
        
        // Tick labels
        this.ctx.font = '10px sans-serif';
        this.ctx.fillStyle = '#94a3b8';
        
        const xStep = this.calculateGridStep(right - left);
        const xStart = Math.ceil(left / xStep) * xStep;
        for (let x = xStart; x <= right; x += xStep) {
            const screenX = padding.left + (x - left) * xScale;
            if (screenX >= padding.left && screenX <= this.width - padding.right) {
                this.ctx.fillText(this.formatNumber(x), screenX, this.height - padding.bottom + 20);
            }
        }
        
        const yStep = this.calculateGridStep(top - bottom);
        const yStart = Math.ceil(bottom / yStep) * yStep;
        for (let y = yStart; y <= top; y += yStep) {
            const screenY = this.height - padding.bottom - (y - bottom) * yScale;
            if (screenY >= padding.top && screenY <= this.height - padding.bottom) {
                this.ctx.textAlign = 'right';
                this.ctx.fillText(this.formatNumber(y), padding.left - 10, screenY + 4);
            }
        }
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Draw curve with improved quality and performance
     * O(n) where n is the number of points
     * Uses quadratic curves for smoother rendering between points
     */
    drawCurve(data, color) {
        if (!data || data.length === 0) return;
        
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        // Enable high-quality rendering
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowBlur = 0.5;
        this.ctx.shadowColor = color;
        
        this.ctx.beginPath();
        
        // Handle discontinuities and draw smooth curves
        let lastValidPoint = null;
        let segmentStart = null;
        
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const screenX = padding.left + (point.x - left) * xScale;
            const screenY = this.height - padding.bottom - (point.y - bottom) * yScale;
            
            // Check if point is valid and within bounds
            const isValid = isFinite(screenX) && isFinite(screenY) &&
                           screenX >= padding.left && screenX <= this.width - padding.right &&
                           screenY >= padding.top && screenY <= this.height - padding.bottom;
            
            if (isValid) {
                if (segmentStart === null) {
                    // Start new segment
                    this.ctx.moveTo(screenX, screenY);
                    segmentStart = { x: screenX, y: screenY };
                } else {
                    // Use quadratic curves for smoother lines
                    const prevPoint = lastValidPoint || segmentStart;
                    const midX = (prevPoint.x + screenX) / 2;
                    const midY = (prevPoint.y + screenY) / 2;
                    
                    this.ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
                }
                lastValidPoint = { x: screenX, y: screenY };
            } else {
                // Discontinuity detected - end current segment
                if (segmentStart !== null) {
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    segmentStart = null;
                    lastValidPoint = null;
                }
            }
        }
        
        // Draw final segment if exists
        if (segmentStart !== null) {
            this.ctx.stroke();
        }
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Draw labels
     */
    drawLabels() {
        // Title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Graphing Calculator', this.width / 2, 20);
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
     * Zoom with adaptive quality adjustment
     */
    zoom(factor) {
        const centerX = (this.bounds.left + this.bounds.right) / 2;
        const centerY = (this.bounds.bottom + this.bounds.top) / 2;
        
        const width = (this.bounds.right - this.bounds.left) / factor;
        const height = (this.bounds.top - this.bounds.bottom) / factor;
        
        this.bounds.left = centerX - width / 2;
        this.bounds.right = centerX + width / 2;
        this.bounds.bottom = centerY - height / 2;
        this.bounds.top = centerY + height / 2;
        
        // Adjust quality based on zoom level (more zoomed = higher quality)
        const range = Math.max(width, height);
        this.qualityMultiplier = Math.max(0.5, Math.min(2.0, 20 / range));
        
        // Clear cache when zooming (bounds changed)
        this.renderCache.clear();
        
        this.render();
    }
    
    /**
     * Reset view
     */
    resetView() {
        this.bounds = {
            left: -10,
            right: 10,
            bottom: -10,
            top: 10
        };
        this.render();
    }
    
    /**
     * Handle mouse down (start pan)
     */
    handleMouseDown(e) {
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.dragStart = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        this.lastBounds = { ...this.bounds };
        this.canvas.style.cursor = 'grabbing';
    }
    
    /**
     * Handle mouse move (pan) with optimized rendering and coordinate display
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update coordinate display
        if (this.showCoordinates) {
            const { left, right, bottom, top } = this.bounds;
            const { padding } = this;
            
            const graphWidth = this.width - padding.left - padding.right;
            const graphHeight = this.height - padding.top - padding.bottom;
            
            const xScale = graphWidth / (right - left);
            const yScale = graphHeight / (top - bottom);
            
            if (x >= padding.left && x <= this.width - padding.right &&
                y >= padding.top && y <= this.height - padding.bottom) {
                const worldX = left + (x - padding.left) / xScale;
                const worldY = top - (y - padding.top) / yScale;
                this.mousePosition = { x: worldX, y: worldY };
            } else {
                this.mousePosition = null;
            }
            this.updateCoordinateDisplay();
        }
        
        if (!this.isDragging) return;
        
        const currentX = x;
        const currentY = y;
        
        const dx = currentX - this.dragStart.x;
        const dy = currentY - this.dragStart.y;
        
        const { padding } = this;
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (this.lastBounds.right - this.lastBounds.left);
        const yScale = graphHeight / (this.lastBounds.top - this.lastBounds.bottom);
        
        const dxWorld = -dx / xScale;
        const dyWorld = dy / yScale;
        
        this.bounds.left = this.lastBounds.left + dxWorld;
        this.bounds.right = this.lastBounds.right + dxWorld;
        this.bounds.bottom = this.lastBounds.bottom + dyWorld;
        this.bounds.top = this.lastBounds.top + dyWorld;
        
        // Clear cache when panning (bounds changed)
        this.renderCache.clear();
        
        // Use requestAnimationFrame for smooth panning
        if (this.pendingRender) {
            cancelAnimationFrame(this.pendingRender);
        }
        this.pendingRender = requestAnimationFrame(() => this.render(true));
    }
    
    /**
     * Update coordinate display
     */
    updateCoordinateDisplay() {
        const display = document.getElementById('coordinate-display');
        if (!display) return;
        
        if (this.mousePosition) {
            display.textContent = `(${this.formatNumber(this.mousePosition.x)}, ${this.formatNumber(this.mousePosition.y)})`;
            display.style.display = 'block';
        } else {
            display.style.display = 'none';
        }
    }
    
    /**
     * Handle mouse up (end pan)
     */
    handleMouseUp(e) {
        // Only add point if we didn't drag (small movement threshold)
        if (!this.isDragging && this.dragStart) {
            const rect = this.canvas.getBoundingClientRect();
            const dx = Math.abs(e.clientX - rect.left - this.dragStart.x);
            const dy = Math.abs(e.clientY - rect.top - this.dragStart.y);
            
            // If movement was small, treat as click
            if (dx < 5 && dy < 5) {
                // Point will be added in handleCanvasClick
            }
        }
        
        this.isDragging = false;
        if (this.canvas) {
            this.canvas.style.cursor = 'default';
        }
    }
    
    /**
     * Handle canvas click (add point)
     */
    handleCanvasClick(e) {
        if (this.isDragging) return; // Don't add point if we were panning
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert screen coordinates to world coordinates
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (right - left);
        const yScale = graphHeight / (top - bottom);
        
        const worldX = left + (x - padding.left) / xScale;
        const worldY = top - (y - padding.top) / yScale;
        
        // Add point
        this.addPoint(worldX, worldY);
    }
    
    /**
     * Add a point to the graph
     */
    addPoint(x, y) {
        const id = this.nextPointId++;
        const point = {
            id,
            x,
            y,
            label: `(${this.formatNumber(x)}, ${this.formatNumber(y)})`,
            color: '#f59e0b'
        };
        this.points.push(point);
        this.render();
    }
    
    /**
     * Remove a point
     */
    removePoint(id) {
        this.points = this.points.filter(p => p.id !== id);
        this.render();
    }
    
    /**
     * Handle wheel (zoom)
     */
    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const { padding } = this;
        const graphWidth = this.width - padding.left - padding.right;
        const graphHeight = this.height - padding.top - padding.bottom;
        
        const xScale = graphWidth / (this.bounds.right - this.bounds.left);
        const yScale = graphHeight / (this.bounds.top - this.bounds.bottom);
        
        const worldX = this.bounds.left + (mouseX - padding.left) / xScale;
        const worldY = this.bounds.top - (mouseY - padding.top) / yScale;
        
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        
        const width = (this.bounds.right - this.bounds.left) * zoomFactor;
        const height = (this.bounds.top - this.bounds.bottom) * zoomFactor;
        
        this.bounds.left = worldX - (worldX - this.bounds.left) * zoomFactor;
        this.bounds.right = worldX + (this.bounds.right - worldX) * zoomFactor;
        this.bounds.bottom = worldY - (worldY - this.bounds.bottom) * zoomFactor;
        this.bounds.top = worldY + (this.bounds.top - worldY) * zoomFactor;
        
        this.render();
    }
    
    /**
     * Export graph as image
     */
    exportGraph() {
        if (!this.canvas) return;
        
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'graph.png';
        link.href = dataURL;
        link.click();
    }
    
    /**
     * Update table
     */
    updateTable() {
        const tableContent = document.getElementById('table-content');
        if (!tableContent) return;
        
        if (this.expressions.length === 0) {
            tableContent.innerHTML = '<p>No expressions to display</p>';
            return;
        }
        
        let html = '<table class="value-table"><thead><tr><th>x</th>';
        this.expressions.forEach(expr => {
            if (expr.enabled) {
                html += `<th>${expr.expression || 'y'}</th>`;
            }
        });
        html += '</tr></thead><tbody>';
        
        const { left, right } = this.bounds;
        const numRows = 20;
        const step = (right - left) / numRows;
        
        for (let i = 0; i <= numRows; i++) {
            const x = left + (i * step);
            html += `<tr><td>${this.formatNumber(x)}</td>`;
            
            this.expressions.forEach(expr => {
                if (expr.enabled) {
                    const y = this.evaluateExpression(expr, x);
                    html += `<td>${y !== null && isFinite(y) ? this.formatNumber(y) : '—'}</td>`;
                }
            });
            
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        tableContent.innerHTML = html;
    }
    
    /**
     * Clear render cache (useful when expressions change significantly)
     * O(1) operation
     */
    clearCache() {
        if (this.renderCache && typeof this.renderCache.clear === 'function') {
            this.renderCache.clear();
        }
    }
    
    /**
     * Cleanup method - call when calculator is no longer needed
     * FIXED: Prevents memory leaks by cleaning up resources
     */
    destroy() {
        // Cancel pending render
        if (this.pendingRender) {
            cancelAnimationFrame(this.pendingRender);
            this.pendingRender = null;
        }
        
        // Disconnect ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        // Remove window resize listener (would need to store reference)
        // Note: This is a limitation - we'd need to store the handler
        
        // Clear cache
        this.clearCache();
        
        // Clear expressions
        this.expressions = [];
        
        // Clear sliders
        this.sliders.clear();
        
        // Clear points
        this.points = [];
        
        // Clear canvas references
        this.canvas = null;
        this.ctx = null;
        
        // Clear container reference
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
}

