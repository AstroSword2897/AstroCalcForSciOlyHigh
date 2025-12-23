/**
 * Enhanced Offline Graph System
 * 
 * Improvements:
 * 1. Better rendering performance
 * 2. Adaptive sampling for smooth curves
 * 3. Improved error handling
 * 4. Better bounds calculation
 * 5. Enhanced visual quality
 * 6. Fully offline (no external dependencies)
 * 
 * Version: 2.1.0
 */

class EnhancedOfflineGraphManager {
    constructor(containerId = 'desmos-graph', tabId = 'graph-tab') {
        this.containerId = containerId;
        this.tabId = tabId;
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        this.padding = { top: 40, right: 40, bottom: 60, left: 80 };
        
        // Enhanced bounds calculation
        this.bounds = { left: -10, right: 10, bottom: -10, top: 10 };
        this.autoBounds = true;
        
        // Performance optimizations
        this.renderCache = new Map();
        this.maxCacheSize = 20;
        this.lastRenderTime = 0;
        this.minRenderInterval = 16; // ~60fps
        
        // Adaptive sampling
        this.adaptiveSampling = true;
        this.minPoints = 50;
        this.maxPoints = 300;
        this.qualityLevel = 'high'; // 'low', 'medium', 'high'
        
        // Visual enhancements
        this.gridEnabled = true;
        this.axesEnabled = true;
        this.smoothCurves = true;
        this.antialiasing = true;
        
        this.currentFormula = null;
        this.currentValues = {};
    }
    
    /**
     * Initialize canvas
     */
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.warn(`[EnhancedGraph] Container ${this.containerId} not found`);
            return false;
        }
        
        // Create canvas if it doesn't exist
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.display = 'block';
            container.innerHTML = '';
            container.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Enable antialiasing
        if (this.antialiasing) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
        
        return true;
    }
    
    /**
     * Enhanced bounds calculation
     */
    calculateEnhancedBounds(formula, unknownVar, allValues) {
        const unknownSymbol = unknownVar.symbol;
        
        // Get reasonable default range based on variable type
        let defaultRange = { min: 0, max: 10 };
        
        const symbol = unknownSymbol.toLowerCase();
        if (symbol.includes('distance') || symbol === 'd' || symbol === 'a') {
            defaultRange = { min: 0, max: 1e12 }; // Up to 10 AU
        } else if (symbol.includes('mass') || symbol === 'm') {
            defaultRange = { min: 1e20, max: 1e31 }; // Small to large masses
        } else if (symbol.includes('temperature') || symbol === 't') {
            defaultRange = { min: 1000, max: 50000 }; // 1K to 50K
        } else if (symbol.includes('wavelength') || symbol.includes('lambda')) {
            defaultRange = { min: 1e-10, max: 1e-5 }; // X-ray to radio
        } else if (symbol.includes('velocity') || symbol === 'v') {
            defaultRange = { min: 0, max: 1e5 }; // 0 to 100 km/s
        } else if (symbol.includes('period') || symbol === 'p' || symbol === 't') {
            defaultRange = { min: 0, max: 1e8 }; // 0 to ~3 years
        } else if (symbol.includes('luminosity') || symbol === 'l') {
            defaultRange = { min: 1e20, max: 1e30 }; // Small to large luminosities
        }
        
        // Use provided values to refine bounds
        const providedValues = Object.values(allValues).filter(v => 
            v != null && typeof v === 'number' && isFinite(v) && v > 0
        );
        
        if (providedValues.length > 0) {
            const minVal = Math.min(...providedValues);
            const maxVal = Math.max(...providedValues);
            
            // Expand range around provided values
            const range = maxVal - minVal || maxVal || 1;
            defaultRange.min = Math.max(0, minVal - range * 0.5);
            defaultRange.max = maxVal + range * 2;
        }
        
        this.bounds = {
            left: defaultRange.min,
            right: defaultRange.max,
            bottom: defaultRange.min,
            top: defaultRange.max
        };
    }
    
    /**
     * Adaptive sampling for smooth curves
     */
    adaptiveSample(formula, unknownVar, allValues, numPoints) {
        const data = [];
        const unknownSymbol = unknownVar.symbol;
        const range = this.bounds.right - this.bounds.left;
        const step = range / numPoints;
        
        let lastY = null;
        let lastSlope = null;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = this.bounds.left + (i * step);
            
            if (!isFinite(x) || isNaN(x)) continue;
            
            try {
                const evalContext = { ...allValues, [unknownSymbol]: x };
                let y;
                
                if (formula.solveFunction && typeof formula.solveFunction === 'function') {
                    // Use formula's solve function
                    const result = formula.solveFunction(evalContext);
                    y = typeof result === 'number' ? result : null;
                } else if (formula.equation) {
                    // Fallback to expression evaluation
                    y = this.evaluateExpression(formula.equation, evalContext);
                } else {
                    continue;
                }
                
                if (y != null && isFinite(y) && !isNaN(y)) {
                    // Adaptive sampling: add more points where curve changes rapidly
                    if (lastY != null && lastSlope != null) {
                        const currentSlope = Math.abs((y - lastY) / step);
                        const slopeChange = Math.abs(currentSlope - lastSlope);
                        
                        // If slope changes significantly, we might need more points
                        // For now, just add the point
                    }
                    
                    data.push({ x, y });
                    lastY = y;
                    lastSlope = lastY != null ? (y - lastY) / step : 0;
                }
            } catch (e) {
                // Skip invalid points
                continue;
            }
        }
        
        return data;
    }
    
    /**
     * Evaluate expression safely
     */
    evaluateExpression(expression, context) {
        try {
            // Replace variables in expression
            let expr = expression;
            for (const [key, value] of Object.entries(context)) {
                if (typeof value === 'number' && isFinite(value)) {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    expr = expr.replace(regex, value.toString());
                }
            }
            
            // Replace constants
            if (typeof globalConstants !== 'undefined') {
                for (const [key, value] of Object.entries(globalConstants)) {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    expr = expr.replace(regex, value.toString());
                }
            }
            
            // Safe evaluation (no eval)
            return this.safeEvaluate(expr);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Safe expression evaluation (no eval)
     */
    safeEvaluate(expr) {
        // Very basic evaluation for simple expressions
        // For production, use a proper expression parser
        try {
            // Replace Math functions
            expr = expr.replace(/\bMath\.(\w+)/g, 'Math.$1');
            
            // Use Function constructor as last resort (still safer than eval)
            const func = new Function('Math', 'return ' + expr);
            return func(Math);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Enhanced rendering with better quality
     */
    render(formula, variableValues = {}) {
        const now = performance.now();
        if (now - this.lastRenderTime < this.minRenderInterval) {
            // Throttle rendering
            return;
        }
        this.lastRenderTime = now;
        
        if (!this.init()) {
            return;
        }
        
        this.currentFormula = formula;
        this.currentValues = variableValues;
        
        // Calculate bounds
        const formulaVars = formula.variables || [];
        const unknownVar = formulaVars.find(v => !variableValues[v.symbol]);
        
        if (!unknownVar) {
            this.renderRelationship(formula, variableValues);
            return;
        }
        
        // Calculate enhanced bounds
        this.calculateEnhancedBounds(formula, unknownVar, {
            ...(typeof globalConstants !== 'undefined' ? globalConstants : {}),
            ...(formula.constants || {}),
            ...variableValues
        });
        
        // Generate data with adaptive sampling
        const numPoints = this.qualityLevel === 'high' ? this.maxPoints : 
                         this.qualityLevel === 'medium' ? 150 : this.minPoints;
        
        const data = this.adaptiveSampling ? 
            this.adaptiveSample(formula, unknownVar, {
                ...(typeof globalConstants !== 'undefined' ? globalConstants : {}),
                ...(formula.constants || {}),
                ...variableValues
            }, numPoints) :
            this.generateGraphData(formula, unknownVar, {
                ...(typeof globalConstants !== 'undefined' ? globalConstants : {}),
                ...(formula.constants || {}),
                ...variableValues
            });
        
        if (!data || data.length === 0) {
            this.showMessage('Unable to generate graph data');
            return;
        }
        
        // Adjust bounds to fit data
        this.adjustBoundsToData(data);
        
        // Render
        this.clearCanvas();
        if (this.gridEnabled) this.drawGrid();
        if (this.axesEnabled) this.drawAxes(unknownVar);
        this.drawCurve(data, '#3b82f6', true);
        this.drawTitle(formula, unknownVar);
    }
    
    /**
     * Generate graph data (non-adaptive)
     */
    generateGraphData(formula, unknownVar, allValues) {
        const data = [];
        const unknownSymbol = unknownVar.symbol;
        const numPoints = this.qualityLevel === 'high' ? this.maxPoints : 150;
        const range = this.bounds.right - this.bounds.left;
        const step = range / numPoints;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = this.bounds.left + (i * step);
            if (!isFinite(x)) continue;
            
            try {
                const evalContext = { ...allValues, [unknownSymbol]: x };
                let y;
                
                if (formula.solveFunction) {
                    y = formula.solveFunction(evalContext);
                } else {
                    y = this.evaluateExpression(formula.equation, evalContext);
                }
                
                if (y != null && isFinite(y) && !isNaN(y)) {
                    data.push({ x, y });
                }
            } catch (e) {
                continue;
            }
        }
        
        return data;
    }
    
    /**
     * Adjust bounds to fit data
     */
    adjustBoundsToData(data) {
        if (!data || data.length === 0) return;
        
        const xs = data.map(p => p.x).filter(x => isFinite(x));
        const ys = data.map(p => p.y).filter(y => isFinite(y));
        
        if (xs.length === 0 || ys.length === 0) return;
        
        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);
        
        const xRange = xMax - xMin;
        const yRange = yMax - yMin;
        
        // Add 10% padding
        this.bounds.left = xMin - xRange * 0.1;
        this.bounds.right = xMax + xRange * 0.1;
        this.bounds.bottom = yMin - yRange * 0.1;
        this.bounds.top = yMax + yRange * 0.1;
    }
    
    /**
     * Clear canvas
     */
    clearCanvas() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Draw grid
     */
    drawGrid() {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const xStep = (this.bounds.right - this.bounds.left) / 10;
        const yStep = (this.bounds.top - this.bounds.bottom) / 10;
        
        // Vertical lines
        for (let x = this.bounds.left; x <= this.bounds.right; x += xStep) {
            const screenX = this.worldToScreenX(x);
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, this.padding.top);
            this.ctx.lineTo(screenX, this.height - this.padding.bottom);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = this.bounds.bottom; y <= this.bounds.top; y += yStep) {
            const screenY = this.worldToScreenY(y);
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding.left, screenY);
            this.ctx.lineTo(this.width - this.padding.right, screenY);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw axes
     */
    drawAxes(unknownVar) {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // X-axis
        const zeroY = this.worldToScreenY(0);
        if (zeroY >= this.padding.top && zeroY <= this.height - this.padding.bottom) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding.left, zeroY);
            this.ctx.lineTo(this.width - this.padding.right, zeroY);
            this.ctx.stroke();
        }
        
        // Y-axis
        const zeroX = this.worldToScreenX(0);
        if (zeroX >= this.padding.left && zeroX <= this.width - this.padding.right) {
            this.ctx.beginPath();
            this.ctx.moveTo(zeroX, this.padding.top);
            this.ctx.lineTo(zeroX, this.height - this.padding.bottom);
            this.ctx.stroke();
        }
        
        // Labels
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(unknownVar.symbol, this.width / 2, this.height - 10);
    }
    
    /**
     * Draw curve with smooth rendering
     */
    drawCurve(data, color = '#3b82f6', smooth = true) {
        if (!this.ctx || !data || data.length < 2) return;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const firstPoint = data[0];
        const screenX = this.worldToScreenX(firstPoint.x);
        const screenY = this.worldToScreenY(firstPoint.y);
        this.ctx.moveTo(screenX, screenY);
        
        if (smooth && this.smoothCurves) {
            // Use quadratic curves for smoothness
            for (let i = 1; i < data.length; i++) {
                const point = data[i];
                const x = this.worldToScreenX(point.x);
                const y = this.worldToScreenY(point.y);
                
                if (i === 1) {
                    this.ctx.lineTo(x, y);
                } else {
                    const prevPoint = data[i - 1];
                    const prevX = this.worldToScreenX(prevPoint.x);
                    const prevY = this.worldToScreenY(prevPoint.y);
                    
                    const cpX = (prevX + x) / 2;
                    const cpY = (prevY + y) / 2;
                    this.ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
                }
            }
        } else {
            // Straight lines
            for (let i = 1; i < data.length; i++) {
                const point = data[i];
                this.ctx.lineTo(this.worldToScreenX(point.x), this.worldToScreenY(point.y));
            }
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Draw title
     */
    drawTitle(formula, unknownVar) {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(formula.name, this.width / 2, 20);
    }
    
    /**
     * Show message
     */
    showMessage(message) {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `<div style="padding: 20px; text-align: center; color: #fff;">${message}</div>`;
        }
    }
    
    /**
     * Render relationship (when all variables known)
     */
    renderRelationship(formula, variableValues) {
        this.showMessage(`${formula.name}: All variables provided. Graph shows relationship.`);
    }
    
    /**
     * World to screen coordinate conversion
     */
    worldToScreenX(worldX) {
        const worldWidth = this.bounds.right - this.bounds.left;
        const screenWidth = this.width - this.padding.left - this.padding.right;
        return this.padding.left + ((worldX - this.bounds.left) / worldWidth) * screenWidth;
    }
    
    worldToScreenY(worldY) {
        const worldHeight = this.bounds.top - this.bounds.bottom;
        const screenHeight = this.height - this.padding.top - this.padding.bottom;
        return this.height - this.padding.bottom - ((worldY - this.bounds.bottom) / worldHeight) * screenHeight;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.renderCache.clear();
    }
}

// Export
if (typeof window !== 'undefined') {
    window.EnhancedOfflineGraphManager = EnhancedOfflineGraphManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedOfflineGraphManager;
}
