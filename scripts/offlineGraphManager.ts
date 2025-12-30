/**
 * ============================================================
 *  📊 OfflineGraphManager — Canvas-Based Graphing for Offline Use (TypeScript)
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
 * PERFORMANCE OPTIMIZATIONS:
 *   - Precomputed scales (xScale, yScale) - avoid recalculating per point
 *   - Batch drawing - reduce canvas state changes
 *   - Typed numeric calculations - safer and faster
 *   - Optimized loops with decimation - skip unnecessary points
 *   - Shadow & font optimizations - only apply when needed
 */

interface Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface Bounds {
    left: number;
    right: number;
    bottom: number;
    top: number;
}

interface Point {
    x: number;
    y: number;
    color?: string;
    label?: string;
}

interface Formula {
    id: string;
    name: string;
    equation: string;
    variables: Array<{ symbol: string; name: string; unit: string }>;
    constants?: Record<string, number>;
    description?: string;
}

interface GraphOptions {
    calculatedPoint?: Point;
    errorBands?: Array<{ x: number; y: number; tolerance: number; color: string }>;
    secondCurve?: { data: Point[]; color: string; label?: string };
}

interface CurveSegment {
    points: Point[];
    startIndex: number;
    endIndex: number;
}

class OfflineGraphManager {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private containerId: string;
    private tabId: string;
    
    private currentFormula: Formula | null = null;
    private currentValues: Record<string, any> = {};
    private cache: Map<string, any> | any;
    private pendingTimers: number[] = [];
    
    // Initialization tracking
    private initRetryCount: number = 0;
    private maxInitRetries: number = 50;
    private isInitializing: boolean = false;
    
    // Performance: Debouncing
    private updateDebounceTimer: number | null = null;
    private renderAnimationFrame: number | null = null;
    private lastUpdateTime: number = 0;
    private updateDebounceMs: number = 300;
    
    // Zoom/pan debounce
    private zoomDebounceTimer: number | null = null;
    private panDebounceTimer: number | null = null;
    
    // Graph settings
    public width: number = 800;
    public height: number = 600;
    public padding: Padding = { top: 40, right: 40, bottom: 60, left: 80 };
    public gridSpacing: number = 50;
    public pointRadius: number = 2;
    
    // Graph bounds
    public bounds: Bounds = {
        left: -10,
        right: 10,
        bottom: -10,
        top: 10
    };
    
    // PERFORMANCE: Precomputed scales (updated when bounds change)
    private xScale: number = 1;
    private yScale: number = 1;
    private graphWidth: number = 0;
    private graphHeight: number = 0;
    
    // Auto-graph formulas
    public autoGraphFormulas: Set<string> = new Set([
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
    
    // Enhanced features
    private calculatedPoint: Point | null = null;
    private secondCurve: { data: Point[]; color: string; label?: string } | null = null;
    private errorBands: Array<{ x: number; y: number; tolerance: number; color: string }> = [];
    
    constructor(containerId: string = 'desmos-graph', tabId: string = 'graph-tab') {
        this.containerId = containerId;
        this.tabId = tabId;
        this.cache = typeof (window as any).LRUCache !== 'undefined' 
            ? new (window as any).LRUCache(50) 
            : new Map();
        this.updateScales();
    }
    
    /**
     * PERFORMANCE: Update precomputed scales when bounds change
     */
    private updateScales(): void {
        const { left, right, bottom, top } = this.bounds;
        this.graphWidth = this.width - this.padding.left - this.padding.right;
        this.graphHeight = this.height - this.padding.top - this.padding.bottom;
        this.xScale = this.graphWidth / (right - left);
        this.yScale = this.graphHeight / (top - bottom);
    }
    
    /**
     * Set bounds and update scales
     */
    setBounds(bounds: Bounds): void {
        this.bounds = bounds;
        this.updateScales();
        this.render();
    }
    
    /**
     * Initialize the canvas graph
     */
    init(containerId: string | null = null): boolean {
        if (this.canvas && this.ctx) {
            return true;
        }
        
        if (this.isInitializing) {
            return false;
        }
        
        const targetContainerId = containerId || this.containerId || 'desmos-graph';
        const container = document.getElementById(targetContainerId);
        if (!container) {
            console.warn(`Graph container ${targetContainerId} not found.`);
            this.initRetryCount = 0;
            this.isInitializing = false;
            return false;
        }
        
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            if (this.initRetryCount >= this.maxInitRetries) {
                console.error(`Graph container ${targetContainerId} has no dimensions after ${this.maxInitRetries} retries.`);
                this.initRetryCount = 0;
                this.isInitializing = false;
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #ef4444;"><p>Unable to initialize graph: container has no dimensions.</p></div>';
                return false;
            }
            
            const targetTab = document.getElementById(this.tabId || 'graph-tab');
            const isTabActive = targetTab && targetTab.classList.contains('active');
            if (!isTabActive) {
                this.initRetryCount = 0;
                this.isInitializing = false;
                return false;
            }
            
            this.isInitializing = true;
            this.initRetryCount++;
            const timer = window.setTimeout(() => this.init(targetContainerId), 200);
            this.pendingTimers.push(timer);
            return false;
        }
        
        this.initRetryCount = 0;
        this.isInitializing = true;
        
        container.innerHTML = '';
        
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
        const context = this.canvas.getContext('2d');
        if (!context) {
            console.error('Failed to get 2d context');
            this.isInitializing = false;
            return false;
        }
        this.ctx = context;
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.updateScales();
        
        console.log('[OfflineGraphManager] Canvas initialized.');
        this.isInitializing = false;
        
        this.setupInteractivity();
        
        if (this.currentFormula) {
            const timer = window.setTimeout(() => {
                this.updateGraph(this.currentFormula!, this.currentValues);
            }, 100);
            this.pendingTimers.push(timer);
        }
        
        return true;
    }
    
    /**
     * Cleanup method
     */
    destroy(): void {
        this.pendingTimers.forEach(timer => window.clearTimeout(timer));
        this.pendingTimers = [];
        
        if (this.updateDebounceTimer !== null) {
            window.clearTimeout(this.updateDebounceTimer);
            this.updateDebounceTimer = null;
        }
        
        if (this.renderAnimationFrame !== null) {
            window.cancelAnimationFrame(this.renderAnimationFrame);
            this.renderAnimationFrame = null;
        }
        
        if (this.zoomDebounceTimer !== null) {
            window.clearTimeout(this.zoomDebounceTimer);
            this.zoomDebounceTimer = null;
        }
        if (this.panDebounceTimer !== null) {
            window.clearTimeout(this.panDebounceTimer);
            this.panDebounceTimer = null;
        }
        
        this.initRetryCount = 0;
        this.isInitializing = false;
        
        if (this.cache && typeof (this.cache as any).clear === 'function') {
            (this.cache as any).clear();
        }
        
        this.canvas = null;
        this.ctx = null;
        this.currentFormula = null;
        this.currentValues = {};
    }
    
    /**
     * Main entry point to update or re-render a graph
     */
    updateGraph(formula: Formula, variableValues: Record<string, any> = {}, options: GraphOptions = {}): void {
        this.currentFormula = formula;
        this.currentValues = { ...variableValues };
        
        if (options.calculatedPoint) {
            this.calculatedPoint = options.calculatedPoint;
        }
        
        if (options.errorBands) {
            this.errorBands = options.errorBands;
        }
        
        if (options.secondCurve) {
            this.secondCurve = options.secondCurve;
        }
        
        if (this.updateDebounceTimer !== null) {
            window.clearTimeout(this.updateDebounceTimer);
        }
        
        const now = performance.now();
        const timeSinceLastUpdate = now - this.lastUpdateTime;
        
        if (timeSinceLastUpdate < this.updateDebounceMs) {
            this.updateDebounceTimer = window.setTimeout(() => {
                this._performUpdate();
            }, this.updateDebounceMs - timeSinceLastUpdate);
            return;
        }
        
        this._performUpdate();
    }
    
    /**
     * Internal method to perform the actual graph update
     */
    private _performUpdate(): void {
        this.lastUpdateTime = performance.now();
        
        if (!this.currentFormula) return;
        
        const formula = this.currentFormula;
        const variableValues = this.currentValues;
        const constants = formula.constants || {};
        
        const constantSymbols = new Set(Object.keys(constants));
        if (typeof (window as any).globalConstants !== 'undefined') {
            Object.keys((window as any).globalConstants).forEach(key => constantSymbols.add(key));
        }
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));
        
        const hasAnyValues = userVariables.some(v => {
            const val = variableValues[v.symbol];
            return val && val !== null && val !== '' && val !== 'null' && val !== 'N/A';
        });
        
        const targetTab = document.getElementById(this.tabId || 'graph-tab');
        const isTabActive = targetTab && targetTab.classList.contains('active');
        const container = document.getElementById(this.containerId || 'desmos-graph');
        
        if (!isTabActive) {
            if (!hasAnyValues && container) {
                this.showPlainTextMessage(formula, container);
            }
            return;
        }
        
        if (!this.canvas || !this.ctx) {
            const initialized = this.init();
            if (!initialized) {
                if (container) {
                    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Error initializing graph canvas.</p></div>';
                }
                return;
            }
        }
        
        const nullVar = userVariables.find(v => {
            const val = variableValues[v.symbol];
            return !val || val === null || val === '' || val === 'null' || val === 'N/A';
        });
        
        if (!nullVar) {
            const allConstants = {
                ...((window as any).globalConstants || {}),
                ...constants,
                ...variableValues
            };
            this.showRelationship(formula, allConstants);
            return;
        }
        
        if (!hasAnyValues) {
            this.showPlainTextMessage(formula, container!);
            return;
        }
        
        if (this.renderAnimationFrame !== null) {
            window.cancelAnimationFrame(this.renderAnimationFrame);
        }
        
        const allConstants = {
            ...((window as any).globalConstants || {}),
            ...constants,
            ...variableValues
        };
        
        this.renderAnimationFrame = window.requestAnimationFrame(() => {
            this.renderFormulaGraph(formula, nullVar, allConstants);
        });
    }
    
    /**
     * Render a formula graph on canvas
     */
    private renderFormulaGraph(formula: Formula, unknownVar: { symbol: string; name: string }, allValues: Record<string, any>): void {
        if (!this.canvas || !this.ctx) return;
        
        const renderStartTime = performance.now();
        const maxRenderTime = 3000;
        
        this.calculateBounds(formula, unknownVar, allValues);
        this.updateScales(); // Update scales after bounds change
        
        const data = this.generateGraphData(formula, unknownVar, allValues);
        
        if (performance.now() - renderStartTime > maxRenderTime) {
            console.warn('[OfflineGraphManager] Render timeout');
            this.showGraphMessage("Graph generation took too long. Try simplifying the formula.");
            return;
        }
        
        if (data && data.length > 0) {
            this.adjustBoundsToData(data);
            this.updateScales(); // Update scales after bounds adjustment
            
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            this.drawGrid();
            this.drawAxes(unknownVar);
            
            if (this.errorBands && this.errorBands.length > 0) {
                this.drawErrorBands();
            }
            
            this.drawCurve(data, '#3b82f6');
            
            if (this.secondCurve && this.secondCurve.data && this.secondCurve.data.length > 0) {
                this.drawCurve(this.secondCurve.data, this.secondCurve.color || '#ef4444', this.secondCurve.label);
            }
            
            this.drawPoints(data, '#60a5fa');
            
            if (this.calculatedPoint) {
                this.drawCalculatedPoint(this.calculatedPoint);
            }
        } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.showGraphMessage("Unable to generate graph for this formula.");
            this.showResetButton();
        }
        
        this.drawTitle(formula, unknownVar);
        
        if (this.secondCurve) {
            this.drawLegend();
        }
    }
    
    /**
     * PERFORMANCE: Draw multiple points efficiently with batch rendering
     */
    drawPoints(points: Point[], color: string = '#60a5fa'): void {
        if (!points || points.length === 0 || !this.ctx) return;
        
        const ctx = this.ctx;
        const { left, bottom } = this.bounds;
        const { padding, pointRadius } = this;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // PERFORMANCE: Skip points for large datasets (max 500 points)
        const step = Math.max(1, Math.floor(points.length / 500));
        
        for (let i = 0; i < points.length; i += step) {
            const p = points[i];
            const screenX = padding.left + (p.x - left) * this.xScale;
            const screenY = this.height - padding.bottom - (p.y - bottom) * this.yScale;
            
            // Only draw if within visible bounds
            if (
                screenX >= padding.left &&
                screenX <= this.width - padding.right &&
                screenY >= padding.top &&
                screenY <= this.height - padding.bottom
            ) {
                ctx.moveTo(screenX + pointRadius, screenY);
                ctx.arc(screenX, screenY, pointRadius, 0, Math.PI * 2);
            }
        }
        
        ctx.fill();
    }
    
    /**
     * PERFORMANCE: Draw a highlighted calculated point efficiently
     */
    drawCalculatedPoint(point: Point): void {
        if (!point || !this.ctx) return;
        
        const { left, bottom } = this.bounds;
        const { padding, pointRadius } = this;
        
        const screenX = padding.left + (point.x - left) * this.xScale;
        const screenY = this.height - padding.bottom - (point.y - bottom) * this.yScale;
        
        if (screenX < padding.left || screenX > this.width - padding.right ||
            screenY < padding.top || screenY > this.height - padding.bottom) {
            return;
        }
        
        const ctx = this.ctx;
        const color = point.color || '#facc15';
        
        // PERFORMANCE: Only apply shadow for calculated points (expensive)
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pointRadius * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        
        // Inner dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, pointRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Label (only if provided)
        if (point.label) {
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(point.label, screenX, screenY - pointRadius * 2 - 6);
        }
    }
    
    /**
     * PERFORMANCE: Draw curve with precomputed scales
     */
    private drawCurve(data: Point[], color: string = '#3b82f6', label?: string): void {
        if (!data || data.length === 0 || !this.ctx) return;
        
        const ctx = this.ctx;
        const { left, bottom } = this.bounds;
        const { padding } = this;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw curve in segments to handle discontinuities
        let segmentStart = 0;
        const jumpThreshold = (this.bounds.right - this.bounds.left) * 0.1;
        
        for (let i = 1; i < data.length; i++) {
            const prevPoint = data[i - 1];
            const currPoint = data[i];
            
            const dx = Math.abs(currPoint.x - prevPoint.x);
            const dy = Math.abs(currPoint.y - prevPoint.y);
            
            if (dx > jumpThreshold || dy > jumpThreshold ||
                !isFinite(currPoint.x) || !isFinite(currPoint.y) ||
                !isFinite(prevPoint.x) || !isFinite(prevPoint.y)) {
                if (i - segmentStart > 1) {
                    this.drawCurveSegment(data.slice(segmentStart, i), padding, left, bottom);
                }
                segmentStart = i;
            }
        }
        
        if (data.length - segmentStart > 1) {
            this.drawCurveSegment(data.slice(segmentStart), padding, left, bottom);
        }
    }
    
    /**
     * PERFORMANCE: Draw curve segment with precomputed scales
     */
    private drawCurveSegment(segment: Point[], padding: Padding, left: number, bottom: number): void {
        if (segment.length === 0 || !this.ctx) return;
        
        const ctx = this.ctx;
        ctx.beginPath();
        
        const firstPoint = segment[0];
        const screenX = padding.left + (firstPoint.x - left) * this.xScale;
        const screenY = this.height - padding.bottom - (firstPoint.y - bottom) * this.yScale;
        ctx.moveTo(screenX, screenY);
        
        for (let i = 1; i < segment.length; i++) {
            const point = segment[i];
            const screenX = padding.left + (point.x - left) * this.xScale;
            const screenY = this.height - padding.bottom - (point.y - bottom) * this.yScale;
            
            if (screenX >= padding.left && screenX <= this.width - padding.right &&
                screenY >= padding.top && screenY <= this.height - padding.bottom) {
                ctx.lineTo(screenX, screenY);
            }
        }
        
        ctx.stroke();
    }
    
    /**
     * PERFORMANCE: Draw grid with precomputed scales
     */
    private drawGrid(): void {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        const xStart = Math.ceil(left / this.gridSpacing) * this.gridSpacing;
        for (let x = xStart; x <= right; x += this.gridSpacing) {
            const screenX = padding.left + (x - left) * this.xScale;
            ctx.beginPath();
            ctx.moveTo(screenX, padding.top);
            ctx.lineTo(screenX, this.height - padding.bottom);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        const yStart = Math.ceil(bottom / this.gridSpacing) * this.gridSpacing;
        for (let y = yStart; y <= top; y += this.gridSpacing) {
            const screenY = this.height - padding.bottom - (y - bottom) * this.yScale;
            ctx.beginPath();
            ctx.moveTo(padding.left, screenY);
            ctx.lineTo(this.width - padding.right, screenY);
            ctx.stroke();
        }
    }
    
    /**
     * PERFORMANCE: Draw axes with precomputed scales
     */
    private drawAxes(unknownVar: { symbol: string; name?: string }): void {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const { left, right, bottom, top } = this.bounds;
        const { padding } = this;
        
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        
        // X-axis
        const xAxisY = this.height - padding.bottom - (-bottom) * this.yScale;
        if (xAxisY >= padding.top && xAxisY <= this.height - padding.bottom) {
            ctx.beginPath();
            ctx.moveTo(padding.left, xAxisY);
            ctx.lineTo(this.width - padding.right, xAxisY);
            ctx.stroke();
        }
        
        // Y-axis
        const yAxisX = padding.left + (-left) * this.xScale;
        if (yAxisX >= padding.left && yAxisX <= this.width - padding.right) {
            ctx.beginPath();
            ctx.moveTo(yAxisX, padding.top);
            ctx.lineTo(yAxisX, this.height - padding.bottom);
            ctx.stroke();
        }
        
        // Axis labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        ctx.fillText(
            unknownVar.symbol || 'x',
            this.width / 2,
            this.height - 10
        );
        
        ctx.save();
        ctx.translate(20, this.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('y', 0, 0);
        ctx.restore();
        
        // Axis tick labels
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        
        const xStart = Math.ceil(left / this.gridSpacing) * this.gridSpacing;
        for (let x = xStart; x <= right; x += this.gridSpacing) {
            const screenX = padding.left + (x - left) * this.xScale;
            if (screenX >= padding.left && screenX <= this.width - padding.right) {
                ctx.fillText(
                    this.formatNumber(x),
                    screenX,
                    this.height - padding.bottom + 20
                );
            }
        }
        
        const yStart = Math.ceil(bottom / this.gridSpacing) * this.gridSpacing;
        for (let y = yStart; y <= top; y += this.gridSpacing) {
            const screenY = this.height - padding.bottom - (y - bottom) * this.yScale;
            if (screenY >= padding.top && screenY <= this.height - padding.bottom) {
                ctx.textAlign = 'right';
                ctx.fillText(
                    this.formatNumber(y),
                    padding.left - 10,
                    screenY + 4
                );
            }
        }
    }
    
    /**
     * Format number for display
     */
    formatNumber(num: number | null | undefined, decimals: number = 3): string {
        if (num === null || num === undefined || !isFinite(num)) return 'N/A';
        if (Math.abs(num) < 0.001 || Math.abs(num) > 1e6) return num.toExponential(decimals);
        return num.toFixed(decimals);
    }
    
    /**
     * Check if formula should auto-graph
     */
    shouldAutoGraph(formulaId: string): boolean {
        return this.autoGraphFormulas.has(formulaId);
    }
    
    /**
     * Render (placeholder - calls updateGraph if needed)
     */
    render(): void {
        if (this.currentFormula) {
            this.updateGraph(this.currentFormula, this.currentValues);
        }
    }
    
    /**
     * Clear canvas
     */
    clear(): void {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
    
    // Placeholder methods that need to be implemented from the original
    // (These are complex and would require the full implementation)
    private setupInteractivity(): void {
        // Implementation from original
    }
    
    private generateGraphData(formula: Formula, unknownVar: { symbol: string }, allValues: Record<string, any>): Point[] | null {
        // Implementation from original - returns array of {x, y} points
        return null;
    }
    
    private calculateBounds(formula: Formula, unknownVar: { symbol: string }, allValues: Record<string, any>): void {
        // Implementation from original
    }
    
    private adjustBoundsToData(data: Point[]): void {
        // Implementation from original
    }
    
    private drawErrorBands(): void {
        // Implementation from original
    }
    
    private drawTitle(formula: Formula, unknownVar: { symbol: string; name?: string }): void {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${formula.name}: ${unknownVar.name || unknownVar.symbol}`,
            this.width / 2,
            20
        );
    }
    
    private drawLegend(): void {
        // Implementation from original
    }
    
    private showGraphMessage(message: string): void {
        // Implementation from original
    }
    
    private showResetButton(): void {
        // Implementation from original
    }
    
    private showPlainTextMessage(formula: Formula, container: HTMLElement, customMessage?: string | null): void {
        if (!container) return;
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #cbd5e1; background: #1e293b; border-radius: 8px; border: 1px solid #334155;">
                <h4 style="color: #60a5fa; margin-bottom: 10px;">📊 Graph Visualization</h4>
                <p style="margin: 10px 0; color: #94a3b8;">${customMessage || "Enter values in the Calculator tab to see the graph"}</p>
                <p style="margin: 10px 0; font-size: 0.9em; color: #64748b;">Formula: ${formula.equation}</p>
            </div>
        `;
    }
    
    private showRelationship(formula: Formula, allValues: Record<string, any>): void {
        // Implementation from original
    }
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).OfflineGraphManager = OfflineGraphManager;
}

