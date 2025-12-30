/**
 * EnhancedOfflineGraphManagerV2
 * - safer expression evaluation (whitelist + sanitizer)
 * - devicePixelRatio support (crisp canvas)
 * - offscreen canvas support where available
 * - recursive adaptive subdivision for curves
 * - requestAnimationFrame rendering throttle
 * - responsive resize handling
 * - simple tooltip on hover
 *
 * NOTE: For production-grade expression parsing/eval, replace safeEvaluate
 * with a math expression parser (mathjs, expr-eval) and avoid Function().
 */

class EnhancedOfflineGraphManagerV2 {
  constructor(opts = {}) {
    // container & sizing
    this.containerId = opts.containerId || 'desmos-graph';
    this.tabId = opts.tabId || 'graph-tab';
    this.canvas = null;
    this.ctx = null;
    this.offscreen = null;
    
    // size defaults (will adapt on init/resize)
    this.width = opts.width || 800;
    this.height = opts.height || 600;
    this.padding = opts.padding || { top: 40, right: 40, bottom: 60, left: 80 };
    
    // bounds & autoscaling
    this.bounds = opts.bounds || { left: -10, right: 10, bottom: -10, top: 10 };
    this.autoBounds = opts.autoBounds ?? true;
    
    // sampling / quality
    this.adaptiveSampling = opts.adaptiveSampling ?? true;
    this.minPoints = opts.minPoints || 50;
    this.maxPoints = opts.maxPoints || 600;
    this.qualityLevel = opts.qualityLevel || 'high'; // 'low'|'medium'|'high'
    this.adaptiveTolerance = opts.adaptiveTolerance || 1e-2; // relative tolerance for subdivision
    
    // rendering / visuals
    this.gridEnabled = opts.gridEnabled ?? true;
    this.axesEnabled = opts.axesEnabled ?? true;
    this.smoothCurves = opts.smoothCurves ?? true;
    this.antialiasing = opts.antialiasing ?? true;
    this.bgColor = opts.bgColor || '#0f172a';
    this.curveColor = opts.curveColor || '#3b82f6';
    this.axisColor = opts.axisColor || '#ffffff';
    
    // performance / caching
    this.renderCache = new Map();
    this.maxCacheSize = opts.maxCacheSize || 20;
    this.lastRenderTime = 0;
    this.minRenderInterval = opts.minRenderInterval || 8; // ms (cap rAF)
    
    // ENHANCED: Bounds caching per formula+variables
    this.boundsCache = new Map();
    this.maxBoundsCacheSize = opts.maxBoundsCacheSize || 50;
    
    // ENHANCED: Screen coordinates cache for performance
    this.screenCoordsCache = null;
    
    // internals
    this.currentFormula = null;
    this.currentValues = {};
    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.rafId = null;
    this.needsRender = false;
    
    // tooltip
    this.tooltip = null;
    this.hoverRadiusPx = opts.hoverRadiusPx || 6;
    this.lastHoverPoint = null;
    
    // calculated point highlighting
    this.calculatedPoint = null;
    this.showCalculatedPoint = false;
    this.highlightPoint = null;
    
    // click-to-set functionality
    this.onPointClick = opts.onPointClick || null;
    this.clickable = opts.clickable ?? true;
    
    // resize handling
    this.resizeTimeout = null;
    this.resizeDebounceMs = opts.resizeDebounceMs || 150;
    this.isResizing = false;
    this.lastResizeTime = 0;
    this.resizeObserver = null; // ENHANCED: Use ResizeObserver for precise resize detection
    
    // ENHANCED: Initialization state tracking
    this._initialized = false;
    this._initAttempted = false;
    
    // Safe eval whitelist
    this.allowedMathFns = new Set([
      'abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','round','sin','sqrt','tan','PI','E'
    ]);
    
    // Bind handlers
    this._onResize = this._onResize.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onCanvasClick = this._onCanvasClick.bind(this);
  }

  /* ---------------------------
     Init / Resize / Destroy
     --------------------------- */

  init() {
    // ENHANCED: Ensure init() is called once per lifecycle
    if (this._initialized) {
      return true; // Already initialized
    }
    
    if (this._initAttempted) {
      // If init was attempted but failed, allow retry only if container is now available
      const container = document.getElementById(this.containerId);
      if (!container) {
        return false; // Still no container
      }
      // Reset attempt flag to allow retry
      this._initAttempted = false;
    }
    
    try {
      const container = document.getElementById(this.containerId);
      if (!container) {
        console.warn(`[EnhancedGraphV2] Container ${this.containerId} not found`);
        this._initAttempted = true;
        return false;
      }

      // create canvas if missing
      if (!this.canvas) {
        try {
          this.canvas = document.createElement('canvas');
          this.canvas.style.width = '100%';
          this.canvas.style.height = '100%';
          this.canvas.style.display = 'block';
          this.canvas.tabIndex = 0;
          container.innerHTML = '';
          container.appendChild(this.canvas);
        } catch (e) {
          console.error('[EnhancedGraphV2] Error creating canvas:', e);
          return false;
        }
      }

      // create tooltip
      try {
        this._createTooltip(container);
      } catch (e) {
        console.warn('[EnhancedGraphV2] Error creating tooltip:', e);
        // Tooltip is not critical, continue
      }

      // sizing and DPR handling
      try {
        this._updateSize();
      } catch (e) {
        console.warn('[EnhancedGraphV2] Error updating size:', e);
        // Try to continue with default size
        if (!this.width || !this.height) {
          this.width = 800;
          this.height = 600;
        }
      }

      // try offscreen canvas if available (not critical for offline)
      if (typeof OffscreenCanvas !== 'undefined') {
        try {
          this.offscreen = new OffscreenCanvas(this.width * this.dpr, this.height * this.dpr);
          this.offscreenCtx = this.offscreen.getContext('2d');
        } catch (e) {
          // Offscreen canvas not available - use main canvas (works offline)
          this.offscreen = null;
          console.log('[EnhancedGraphV2] Offscreen canvas not available, using main canvas');
        }
      }

      // Get 2D context (required)
      try {
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
          console.error('[EnhancedGraphV2] Could not get 2D context');
          return false;
        }
        
        if (this.antialiasing && this.ctx) {
          this.ctx.imageSmoothingEnabled = true;
          this.ctx.imageSmoothingQuality = 'high';
        }
      } catch (e) {
        console.error('[EnhancedGraphV2] Error getting context:', e);
        return false;
      }

      // ENHANCED: Use ResizeObserver instead of window resize for precise detection
      try {
        if (typeof ResizeObserver !== 'undefined' && container) {
          this.resizeObserver = new ResizeObserver((entries) => {
            // Debounce resize handling
            if (this.resizeTimeout) {
              clearTimeout(this.resizeTimeout);
            }
            this.isResizing = true;
            this.resizeTimeout = setTimeout(() => {
              this.isResizing = false;
              this._updateSize();
              this.requestRender();
            }, this.resizeDebounceMs);
          });
          this.resizeObserver.observe(container);
        } else {
          // Fallback to window resize if ResizeObserver not available
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', this._onResize, { passive: true });
        }
        }
      } catch (e) {
        console.warn('[EnhancedGraphV2] Error setting up ResizeObserver, falling back to window resize:', e);
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', this._onResize, { passive: true });
        }
      }
      
      // events (with error handling)
      try {
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('mouseleave', this._onMouseLeave);
        if (this.clickable) {
          this.canvas.addEventListener('click', this._onCanvasClick);
        }
      } catch (e) {
        console.warn('[EnhancedGraphV2] Error adding event listeners:', e);
        // Continue - events are nice-to-have
      }

      // ENHANCED: Mark as initialized
      this._initialized = true;
      this._initAttempted = false;
      return true;
    } catch (e) {
      console.error('[EnhancedGraphV2] Error in init:', e);
      return false;
    }
  }

  destroy() {
    try {
      // ENHANCED: Disconnect ResizeObserver
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      
      // Clear resize timeout
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }
      
      // ENHANCED: Reset initialization state
      this._initialized = false;
      this._initAttempted = false;
      
      // Remove event listeners safely
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this._onResize);
      }
      
      if (this.canvas) {
        try {
          this.canvas.removeEventListener('mousemove', this._onMouseMove);
          this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
          if (this.clickable) {
            this.canvas.removeEventListener('click', this._onCanvasClick);
          }
        } catch (e) {
          console.warn('[EnhancedGraphV2] Error removing canvas listeners:', e);
        }
      }
      
      // Cancel animation frame
      if (this.rafId) {
        try {
          cancelAnimationFrame(this.rafId);
        } catch (e) {
          console.warn('[EnhancedGraphV2] Error canceling animation frame:', e);
        }
        this.rafId = null;
      }
      
      // Clear references
      this.canvas = null;
      this.ctx = null;
      this.offscreen = null;
      this.offscreenCtx = null;
      this.tooltip = null;
      
      // Clear cache
      if (this.renderCache) {
        this.renderCache.clear();
      }
    } catch (e) {
      console.error('[EnhancedGraphV2] Error in destroy:', e);
      // Don't throw - just log
    }
  }

  _updateSize() {
    try {
      const container = document.getElementById(this.containerId);
      if (!container) {
        console.warn(`[EnhancedGraphV2] Container ${this.containerId} not found during resize`);
        return false;
      }

      const rect = container.getBoundingClientRect();
      const newWidth = Math.max(200, rect.width || this.width);
      const newHeight = Math.max(150, rect.height || this.height);
      
      // Only update if size actually changed (avoid unnecessary redraws)
      if (Math.abs(newWidth - this.width) < 1 && Math.abs(newHeight - this.height) < 1) {
        return false;
      }
      
      this.width = newWidth;
      this.height = newHeight;
      this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

      if (this.canvas) {
        try {
          this.canvas.width = Math.round(this.width * this.dpr);
          this.canvas.height = Math.round(this.height * this.dpr);
          this.canvas.style.width = `${this.width}px`;
          this.canvas.style.height = `${this.height}px`;
          
          if (this.ctx) {
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
          }
        } catch (e) {
          console.warn('[EnhancedGraphV2] Error updating canvas size:', e);
          return false;
        }
      }

      if (this.offscreen) {
        try {
          this.offscreen.width = Math.round(this.width * this.dpr);
          this.offscreen.height = Math.round(this.height * this.dpr);
        } catch (e) {
          // Offscreen canvas not critical, fall back to main canvas
          console.warn('[EnhancedGraphV2] Offscreen canvas resize failed, using main canvas:', e);
          this.offscreen = null;
        }
      }
      
      return true;
    } catch (e) {
      console.error('[EnhancedGraphV2] Error in _updateSize:', e);
      return false;
    }
  }

  _onResize() {
    // Debounce resize events to avoid excessive redraws
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    const now = performance.now();
    this.isResizing = true;
    
    this.resizeTimeout = setTimeout(() => {
      this.isResizing = false;
      this.lastResizeTime = now;
      
      try {
        const sizeChanged = this._updateSize();
        if (sizeChanged) {
          // Only request render if size actually changed
          this.requestRender();
        }
      } catch (e) {
        console.error('[EnhancedGraphV2] Error handling resize:', e);
        // Don't crash - just log the error
      }
      
      this.resizeTimeout = null;
    }, this.resizeDebounceMs);
  }

  /* ---------------------------
     Tooltip
     --------------------------- */

  _createTooltip(container) {
    if (this.tooltip) return;
    const tip = document.createElement('div');
    tip.style.position = 'absolute';
    tip.style.pointerEvents = 'none';
    tip.style.padding = '6px 8px';
    tip.style.background = 'rgba(0,0,0,0.7)';
    tip.style.color = '#fff';
    tip.style.font = '12px monospace';
    tip.style.borderRadius = '4px';
    tip.style.display = 'none';
    container.style.position = container.style.position || 'relative';
    container.appendChild(tip);
    this.tooltip = tip;
  }

  _onMouseMove(e) {
    if (!this.lastRenderedData) return;
    const rect = this.canvas.getBoundingClientRect();
    const xPx = (e.clientX - rect.left);
    const yPx = (e.clientY - rect.top);

    // ENHANCED: Use cached screen coordinates if available
    const screenCoords = this.screenCoordsCache || this.lastRenderedData.map(p => ({
      point: p,
      sx: this.worldToScreenX(p.x),
      sy: this.worldToScreenY(p.y)
    }));

    // ENHANCED: Optimized hover detection with early exit
    let best = null;
    let minDist = Infinity;
    
    for (const coord of screenCoords) {
      const dx = (coord.sx - xPx);
      const dy = (coord.sy - yPx);
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < minDist && dist <= this.hoverRadiusPx) {
        minDist = dist;
        best = {point: coord.point, sx: coord.sx, sy: coord.sy, dist};
        // ENHANCED: Early exit if we find a very close point
        if (dist < this.hoverRadiusPx * 0.5) break;
      }
    }

    // ENHANCED: Only request render if hover state actually changed
    const hoverChanged = (best && !this.lastHoverPoint) || 
                        (!best && this.lastHoverPoint) ||
                        (best && this.lastHoverPoint && 
                         (best.point !== this.lastHoverPoint.point || 
                          Math.abs(best.sx - this.lastHoverPoint.sx) > 1 ||
                          Math.abs(best.sy - this.lastHoverPoint.sy) > 1));

    if (best) {
      this.lastHoverPoint = best;
      if (this.tooltip) {
      this.tooltip.style.left = `${Math.max(0, best.sx + 10)}px`;
      this.tooltip.style.top = `${Math.max(0, best.sy - 10)}px`;
      // ENHANCED: Improved precision display with significant figures
      const xSigFigs = Math.min(10, Math.max(3, Math.floor(-Math.log10(Math.abs(best.point.x) * 1e-10))));
      const ySigFigs = Math.min(10, Math.max(3, Math.floor(-Math.log10(Math.abs(best.point.y) * 1e-10))));
      
      let tooltipText = `x: ${best.point.x.toPrecision(xSigFigs)}<br>y: ${best.point.y.toPrecision(ySigFigs)}`;
      
      // ENHANCED: Add error information if available
      if (this.currentFormula && typeof ErrorPropagator !== 'undefined') {
        try {
          const inputErrors = ErrorPropagator.estimateInputErrors(this.currentValues || {});
          if (Object.keys(inputErrors).length > 0) {
            const unknownVarSymbol = this.currentUnknownVar?.symbol || 'x';
            const testValues = { ...this.currentValues, [unknownVarSymbol]: best.point.x };
            const errorInfo = ErrorPropagator.propagateError(this.currentFormula, testValues, inputErrors, best.point.y);
            if (errorInfo) {
              tooltipText += `<br><span style="color: #94a3b8; font-size: 0.9em;">Error: ±${ErrorPropagator.formatError(errorInfo.absoluteError)}</span>`;
            }
          }
        } catch (e) {
          // Error propagation failed, continue without it
        }
      }
      
      this.tooltip.innerHTML = tooltipText;
      this.tooltip.style.display = 'block';
      }
      // Only request render if hover state changed
      if (hoverChanged) {
        this.requestRender();
      }
    } else {
      this.lastHoverPoint = null;
      if (this.tooltip) {
      this.tooltip.style.display = 'none';
      }
      // Only request render if hover state changed
      if (hoverChanged) {
      this.requestRender();
      }
    }
  }

  _onMouseLeave() {
    this.lastHoverPoint = null;
    if (this.tooltip) this.tooltip.style.display = 'none';
    this.requestRender();
  }

  _onCanvasClick(e) {
    if (!this.clickable || !this.lastRenderedData) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    // Convert to world coordinates
    const worldX = this.screenToWorldX(xPx);
    const worldY = this.screenToWorldY(yPx);
    
    // Find closest point on curve
    let closest = null;
    let minDist = Infinity;
    
    for (const p of this.lastRenderedData) {
      const sx = this.worldToScreenX(p.x);
      const sy = this.worldToScreenY(p.y);
      const dist = Math.sqrt((sx - xPx) ** 2 + (sy - yPx) ** 2);
      
      if (dist < minDist && dist < 20) { // 20px click radius
        minDist = dist;
        closest = p;
      }
    }
    
    if (closest && this.onPointClick) {
      this.onPointClick(closest.x, closest.y, closest);
    }
  }

  /* ---------------------------
     Public render API
     --------------------------- */

  render(formula, variableValues = {}) {
    // schedule rather than run immediately
    this.currentFormula = formula;
    this.currentValues = variableValues;
    this.requestRender();
  }

  /**
   * Compatibility method for existing UI code
   * Maps updateGraph() calls to render()
   * CRITICAL: Ensures formula.equation is used for graph rendering
   */
  updateGraph(formula, variableValues = {}, options = {}) {
    // CRITICAL: Validate formula has equation before rendering
    if (!formula) {
      console.error('[EnhancedGraphV2] updateGraph() called without formula');
      return;
    }
    
    if (!formula.equation && !formula.solveFunction) {
      console.error('[EnhancedGraphV2] Formula missing equation and solveFunction:', formula.id || formula.name);
      console.error('[EnhancedGraphV2] Formula object keys:', Object.keys(formula));
      // Don't render if no equation available
      return;
    }
    
    this.render(formula, variableValues);
    
    // Handle options
    if (options.highlightPoint) {
      this.highlightPoint = options.highlightPoint;
    }
    if (options.showCalculatedPoint !== undefined) {
      this.showCalculatedPoint = options.showCalculatedPoint;
    }
  }

  /**
   * Set calculated point to highlight on graph
   * Called after calculation to show result point
   */
  setCalculatedPoint(x, y, label = '') {
    this.calculatedPoint = { x, y, label };
    this.showCalculatedPoint = true;
    this.requestRender();
  }

  /**
   * Clear calculated point highlight
   */
  clearCalculatedPoint() {
    this.calculatedPoint = null;
    this.showCalculatedPoint = false;
    this.requestRender();
  }

  /**
   * Get formula's solve function from FormulaCalculator if available
   */
  _getSolveFunction(formula) {
    // Try to get solve function from FormulaCalculator.solvers
    if (typeof FormulaCalculator !== 'undefined' && 
        FormulaCalculator.solvers && 
        formula.id && 
        FormulaCalculator.solvers[formula.id]) {
      
      // Return a wrapper that calls the solver
      return (context) => {
        try {
          const calculator = new FormulaCalculator(formula);
          const unknownVar = formula.variables.find(v => !(v.symbol in context));
          if (!unknownVar) return null;
          
          const result = calculator.solveForVariable(unknownVar.symbol, context);
          return typeof result === 'number' && isFinite(result) ? result : null;
        } catch (e) {
          return null;
        }
      };
    }
    
    // Fallback to formula's solveFunction
    return formula.solveFunction;
  }

  requestRender() {
    if (this.rafId) return; // already scheduled
    
    try {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        try {
          this._renderNow();
        } catch (e) {
          console.error('[EnhancedGraphV2] Error in requestAnimationFrame callback:', e);
          // Don't re-throw - just log
        }
      });
    } catch (e) {
      console.error('[EnhancedGraphV2] Error scheduling render:', e);
      // Fallback: try immediate render (may be less smooth but won't crash)
      try {
        this._renderNow();
      } catch (e2) {
        console.error('[EnhancedGraphV2] Error in fallback render:', e2);
      }
    }
  }

  _renderNow() {
    try {
      // Skip render if currently resizing (will render after resize completes)
      if (this.isResizing) {
        return;
      }
      
      // ENHANCED: Initialize once, not every frame
      if (!this._initialized) {
      if (!this.init()) {
        console.warn('[EnhancedGraphV2] Init failed, skipping render');
        return;
        }
      }

      const now = performance.now();
      if (now - this.lastRenderTime < this.minRenderInterval) {
        // throttle
        return;
      }
      this.lastRenderTime = now;
    
      // ENHANCED: Split _renderNow into logical phases
    const formula = this.currentFormula;
    const variableValues = { ...(this.currentValues || {}) };

    if (!formula) {
      this._clearCanvas();
      this._drawBackground();
      return;
    }

      // Phase 1: Prepare data
      const preparedData = this._prepareData(formula, variableValues);
      if (!preparedData) {
        return; // Error message already shown
      }

      // ENHANCED: Store current values for error propagation in tooltips
      this.currentValues = variableValues;

      // Phase 2: Compute bounds
      this._computeBounds(formula, preparedData.unknownVar, variableValues, preparedData.data);

      // Phase 3: Draw graph (store unknownVar for tooltip error propagation)
      this.currentUnknownVar = preparedData.unknownVar;
      this._drawGraph(preparedData.data, preparedData.unknownVar, formula);

      // Phase 4: Draw UI overlays
      this._drawUIOverlays(this.ctx);
    } catch (e) {
      console.error('[EnhancedGraphV2] Error during render:', e);
      // Show error message on canvas
      try {
        if (this.ctx) {
          this.ctx.fillStyle = '#ff4444';
          this.ctx.font = '14px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('Graph rendering error', this.width / 2, this.height / 2);
        }
      } catch (e2) {
        // Even error display failed - just log
        console.error('[EnhancedGraphV2] Error displaying error message:', e2);
      }
    }
  }

  /* ---------------------------
     ENHANCED: Split rendering into logical phases
     --------------------------- */

  /**
   * Phase 1: Prepare data (identify unknown variable, generate graph data)
   * @returns {Object|null} Prepared data object or null if error
   */
  _prepareData(formula, variableValues) {
    // identify unknown variable (use formula-specific default if available)
    const vars = formula.variables || [];
    let unknownVar = null;
    
    // PRIORITY 1: Use formula-specific default variable
    if (typeof getDefaultGraphVariable === 'function') {
      const defaultVarSymbol = getDefaultGraphVariable(formula);
      if (defaultVarSymbol) {
        unknownVar = vars.find(v => v.symbol === defaultVarSymbol);
      }
    }
    
    // PRIORITY 2: Use first variable without value
    if (!unknownVar) {
      unknownVar = vars.find(v => !(v.symbol in variableValues));
    }
    
    // PRIORITY 3: Use first variable
    if (!unknownVar && vars.length > 0) {
      unknownVar = vars[0];
    }

    if (!unknownVar) {
      this._clearCanvas();
      this._showMessage(`${formula.name}: all variables provided — relationship view`);
      return null;
    }

    // choose numPoints based on quality
    const numPoints = this.qualityLevel === 'high' ? this.maxPoints : (this.qualityLevel === 'medium' ? Math.round((this.minPoints + this.maxPoints)/2) : this.minPoints);

    // generate data using adaptive subdivision
    let data;
    try {
      data = this.adaptiveSampling ? 
        this._adaptiveSubdivide(formula, unknownVar, variableValues, numPoints) : 
        this.generateGraphData(formula, unknownVar, variableValues, numPoints);
    } catch (e) {
      console.error('[EnhancedGraphV2] sampling error', e);
      data = [];
    }

    if (!data || data.length === 0) {
      this._showMessage('Unable to generate graph data');
      return null;
    }

    // store lastRenderedData for hover/tooltip
    this.lastRenderedData = data;

    // ENHANCED: Precompute screen coordinates for performance
    this.screenCoordsCache = data.map(p => ({
      point: p,
      sx: this.worldToScreenX(p.x),
      sy: this.worldToScreenY(p.y)
    }));

    return { data, unknownVar };
  }

  /**
   * Phase 2: Compute bounds (formula config, heuristics, data-based)
   */
  _computeBounds(formula, unknownVar, variableValues, data) {
    // compute bounds (improve using provided values)
    this.calculateEnhancedBounds(formula, unknownVar, {
      ...(typeof globalConstants !== 'undefined' ? globalConstants : {}),
      ...(formula.constants || {}),
      ...variableValues
    });

    // adjust bounds to data (Y-bounds computed from actual data)
    this.adjustBoundsToData(data);

    // ENHANCED: Recompute screen coordinates after bounds adjustment
    this.screenCoordsCache = data.map(p => ({
      point: p,
      sx: this.worldToScreenX(p.x),
      sy: this.worldToScreenY(p.y)
    }));
  }

  /**
   * Phase 3: Draw graph (background, grid, axes, curve, title)
   */
  _drawGraph(data, unknownVar, formula) {
    // ENHANCED: Store formula, values, and unknown variable for error propagation
    this.currentFormula = formula;
    this.currentUnknownVar = unknownVar;
    
    // draw to either offscreen or main canvas
    const targetCtx = this.offscreen ? (this.offscreenCtx || this.ctx) : this.ctx;
    
    // Draw main graph
    this._drawToContext(targetCtx, data, unknownVar, formula);

    // if offscreen canvas used, blit to main canvas
    if (this.offscreen && this.ctx) {
      try {
        // transferImageBitmap is not used here for compatibility; drawImage is fine
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreen, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
      } catch (e) {
        // fall back to drawing using main ctx if offscreen fails
        this._drawToContext(this.ctx, data, unknownVar, formula);
      }
    }
  }

  /* ---------------------------
     Sampling: recursive adaptive subdivision
     --------------------------- */

  _adaptiveSubdivide(formula, unknownVar, allValues, targetPoints) {
    // Start with coarse grid then subdivide recursively where curvature > tol
    const left = this.bounds.left;
    const right = this.bounds.right;
    const initialPoints = Math.max(8, Math.min(64, Math.round(targetPoints / 8)));
    const xs = [];
    for (let i = 0; i <= initialPoints; i++) xs.push(left + (i / initialPoints) * (right - left));

    // Evaluate y at x safely
    const evalY = (x) => {
      try {
        const ctx = { ...allValues, [unknownVar.symbol]: x };
        
        // Try to get solve function from FormulaCalculator first
        const solveFn = this._getSolveFunction(formula);
        if (solveFn && typeof solveFn === 'function') {
          const r = solveFn(ctx);
          return (typeof r === 'number' && isFinite(r)) ? r : null;
        } else if (formula.solveFunction && typeof formula.solveFunction === 'function') {
          const r = formula.solveFunction(ctx);
          return (typeof r === 'number' && isFinite(r)) ? r : null;
        } else if (formula.equation) {
          return this.evaluateExpression(formula.equation, ctx);
        }
      } catch (e) { /* swallow */ }
      return null;
    };

    // initial points
    const pts = [];
    for (const x of xs) {
      const y = evalY(x);
      if (y == null) { pts.push(null); } else { pts.push({x, y}); }
    }

    // ENHANCED: Subdivide function with recursion depth limit
    const MAX_RECURSION_DEPTH = 20; // Prevent stack overflow
    const subdivide = (a, b, pa, pb, accum, depth = 0) => {
      // ENHANCED: Strict recursion depth limit
      if (depth > MAX_RECURSION_DEPTH) {
        // Max depth reached - add endpoints and stop
        if (accum.length === 0 || accum[accum.length - 1] !== pa) {
          accum.push(pa);
        }
        return;
      }
      
      // a,b: x; pa,pb: points {x,y} or null
      if (pa == null || pb == null) {
        // if either endpoint invalid, attempt midpoint but limit recursion
        return;
      }

      // midpoint
      const mx = 0.5 * (a + b);
      const my = evalY(mx);
      if (my == null) {
        accum.push(pa); // keep endpoints but skip midpoint
        return;
      }

      // difference between linear interpolation and actual
      const linY = pa.y + (pb.y - pa.y) * ((mx - a) / (b - a));
      const err = Math.abs(my - linY);

      // relative tolerance scaled by |y| or domain
      const scale = Math.max(1, Math.abs(my), Math.abs(pa.y), Math.abs(pb.y));
      if (err / scale > this.adaptiveTolerance && accum.length < this.maxPoints) {
        // subdivide left and right with depth tracking
        subdivide(a, mx, pa, {x: mx, y: my}, accum, depth + 1);
        subdivide(mx, b, {x: mx, y: my}, pb, accum, depth + 1);
      } else {
        // keep left point; right will be added by caller/end
        accum.push(pa);
      }
    };

    // run subdivisions across each initial segment
    const result = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const pa = pts[i];
      const pb = pts[i + 1];
      if (pa == null && pb == null) continue;
      if (pa == null && pb != null) { result.push(pb); continue; }
      if (pa != null && pb == null) { result.push(pa); continue; }

      // recursive accum for this segment (start at depth 0)
      const accum = [];
      subdivide(xs[i], xs[i+1], pa, pb, accum, 0);

      // accum now contains sequence of left endpoints; ensure last endpoint appended
      if (accum.length === 0) accum.push(pa);
      for (const p of accum) result.push(p);
    }

    // append final endpoint
    const last = pts[pts.length - 1];
    if (last && last !== result[result.length - 1]) result.push(last);

    // Post-process: clamp result length to [minPoints,maxPoints]
    let final = result.filter(Boolean);
    if (final.length > this.maxPoints) {
      // simple downsample: keep every n-th point
      const n = Math.ceil(final.length / this.maxPoints);
      final = final.filter((_, idx) => idx % n === 0);
      if (final.length > this.maxPoints) final = final.slice(0, this.maxPoints);
    }

    if (final.length < this.minPoints) {
      // fill in with linear sampling
      final = this.generateGraphData(formula, unknownVar, allValues, Math.max(this.minPoints, final.length));
    }

    return final;
  }

  /* ---------------------------
     Non-adaptive generator
     --------------------------- */

  generateGraphData(formula, unknownVar, allValues, numPoints = 200) {
    const data = [];
    const left = this.bounds.left;
    const right = this.bounds.right;
    const step = (right - left) / Math.max(1, numPoints);

    for (let i = 0; i <= numPoints; i++) {
      const x = left + i * step;
      try {
        const ctx = { ...allValues, [unknownVar.symbol]: x };
        let y = null;

        // Try to get solve function from FormulaCalculator first
        const solveFn = this._getSolveFunction(formula);
        if (solveFn && typeof solveFn === 'function') {
          const r = solveFn(ctx);
          y = (typeof r === 'number' && isFinite(r)) ? r : null;
        } else if (formula.solveFunction) {
          const r = formula.solveFunction(ctx);
          y = (typeof r === 'number' && isFinite(r)) ? r : null;
        } else if (formula.equation) {
          y = this.evaluateExpression(formula.equation, ctx);
        }

        if (y != null && isFinite(y)) data.push({x, y});
      } catch (e) { /* ignore invalid points */ }
    }

    return data;
  }

  /* ---------------------------
     Bounds calculation
     --------------------------- */

  calculateEnhancedBounds(formula, unknownVar, allValues) {
    // ENHANCED: Cache bounds per formula+variables to avoid recomputation
    const cacheKey = `${formula?.id || 'unknown'}_${unknownVar?.symbol || 'x'}_${JSON.stringify(allValues)}`;
    
    if (this.boundsCache.has(cacheKey)) {
      const cached = this.boundsCache.get(cacheKey);
      this.bounds.left = cached.left;
      this.bounds.right = cached.right;
      this.bounds.bottom = cached.bottom;
      this.bounds.top = cached.top;
      return;
    }
    
    const unknownSymbol = unknownVar.symbol || 'x';

    // PRIORITY 1: Use formula-specific graph configuration if available
    let defaultRange = null;
    if (typeof getVariableBounds === 'function') {
      defaultRange = getVariableBounds(formula, unknownSymbol);
    }
    
    // PRIORITY 2: Use formula graph config directly
    if (!defaultRange && typeof getFormulaGraphConfig === 'function') {
      const config = getFormulaGraphConfig(formula);
      if (config && config.bounds && config.bounds[unknownSymbol]) {
        defaultRange = config.bounds[unknownSymbol];
      }
    }

    // PRIORITY 3: Fallback to heuristics
    if (!defaultRange) {
      defaultRange = { min: -10, max: 10 };
      const s = unknownSymbol.toLowerCase();
      if (s.includes('distance') || s === 'd' || s === 'r' || s === 'a') {
        defaultRange = { min: 0, max: 1e12 };
      } else if (s.includes('mass') || s === 'm' || s === 'M') {
        defaultRange = { min: 1e20, max: 1e31 };
      } else if (s.includes('temperature') || s === 't' || s === 'T') {
        defaultRange = { min: 1, max: 1e5 };
      } else if (s.includes('wavelength') || s.includes('lambda')) {
        defaultRange = { min: 1e-12, max: 1e-4 };
      } else if (s.includes('velocity') || s === 'v') {
        defaultRange = { min: -1e5, max: 1e5 };
      } else if (s.includes('period') || s === 'p' || s === 'P') {
        defaultRange = { min: 0, max: 1e8 };
      } else if (s.includes('luminosity') || s === 'L' || s === 'l') {
        defaultRange = { min: 1e-10, max: 1e40 };
      }
    }

    // refine with provided numeric values
    const provided = Object.values(allValues).filter(v => typeof v === 'number' && isFinite(v));
    if (provided.length > 0) {
      const minVal = Math.min(...provided);
      const maxVal = Math.max(...provided);
      const range = Math.max(1, maxVal - minVal);
      defaultRange.min = Math.min(defaultRange.min, minVal - 0.5*range);
      defaultRange.max = Math.max(defaultRange.max, maxVal + 1.0*range);
    }

    // assign bounds (ensure finite)
    this.bounds.left = isFinite(defaultRange.min) ? defaultRange.min : -10;
    this.bounds.right = isFinite(defaultRange.max) ? defaultRange.max : 10;

    // ENHANCED: Y-bounds will be computed from data in adjustBoundsToData()
    // For now, use symmetric bounds as initial estimate
    this.bounds.bottom = Math.min(-Math.abs(this.bounds.right), -Math.abs(this.bounds.left));
    this.bounds.top = Math.max(Math.abs(this.bounds.right), Math.abs(this.bounds.left));
    
    // ENHANCED: Cache the computed bounds
    if (this.boundsCache.size >= this.maxBoundsCacheSize) {
      // Remove oldest entry (FIFO)
      const firstKey = this.boundsCache.keys().next().value;
      this.boundsCache.delete(firstKey);
    }
    this.boundsCache.set(cacheKey, {
      left: this.bounds.left,
      right: this.bounds.right,
      bottom: this.bounds.bottom,
      top: this.bounds.top
    });
  }

  /* ---------------------------
     Expression evaluation (sanitized)
     --------------------------- */

  evaluateExpression(expression, context = {}) {
    // ENHANCED: Use SafeMathEvaluator if available (more secure than Function())
    if (typeof SafeMathEvaluator !== 'undefined' && SafeMathEvaluator.evaluate) {
      try {
        // Merge context with global constants
        const allVars = {
          ...(typeof globalConstants !== 'undefined' ? globalConstants : {}),
          ...context
        };
        
        // SafeMathEvaluator handles sanitization and AST-based evaluation
        const result = SafeMathEvaluator.evaluate(String(expression), allVars);
        
        if (typeof result === 'number' && isFinite(result)) {
          return result;
        }
        return null;
      } catch (e) {
        // Fall through to fallback if SafeMathEvaluator fails
        console.warn('[EnhancedGraphV2] SafeMathEvaluator failed, using fallback:', e.message);
      }
    }
    
    // FALLBACK: Original implementation (less secure but works offline)
    try {
      // quick sanitize and replace variables
      let expr = String(expression);

      // allow characters: digits, operators, parentheses, decimal point, variable names (letters, underscore),
      // math function names, spaces, comma
      // but ensure no suspicious tokens: ;, :, new Function, window, document, constructor, prototype
      const badPattern = /(?:;|=>|process|require|module|window|document|constructor|prototype|Function|eval|setTimeout|setInterval)/i;
      if (badPattern.test(expr)) return null;

      // ENHANCED: Sort variable names by length (longest first) to prevent substring collisions
      const sortedContextKeys = Object.keys(context).sort((a, b) => b.length - a.length);
      
      // replace constants & variables (word boundaries, longest first)
      for (const k of sortedContextKeys) {
        const v = context[k];
        if (typeof v === 'number' && isFinite(v)) {
          const regex = new RegExp(`\\b${this._escapeRegExp(k)}\\b`, 'g');
          expr = expr.replace(regex, `(${v})`);
        }
      }

      // replace known globalConstants if available (also sorted by length)
      if (typeof globalConstants !== 'undefined') {
        const sortedGlobalKeys = Object.keys(globalConstants).sort((a, b) => b.length - a.length);
        for (const k of sortedGlobalKeys) {
          const v = globalConstants[k];
          if (typeof v === 'number' && isFinite(v)) {
            const regex = new RegExp(`\\b${this._escapeRegExp(k)}\\b`, 'g');
            expr = expr.replace(regex, `(${v})`);
          }
        }
      }

      // allow only permitted characters now
      if (!/^[0-9\.\+\-\*\/\^\%\(\),\sA-Za-z_]+$/.test(expr)) return null;

      // replace ^ with Math.pow
      expr = expr.replace(/\^/g, '**'); // using ES exponent operator

      // Whitelist Math functions and map names like PI, E
      // We'll create a Function with Math only; but still ensure function names are allowed
      const fnNames = Array.from(this.allowedMathFns).join('|');

      // ensure there are no disallowed identifier names (very conservative)
      const identifiers = (expr.match(/[A-Za-z_]\w*/g) || []).filter(id => !/^[0-9]+$/.test(id));
      for (const id of identifiers) {
        if (!this.allowedMathFns.has(id) && !(id in context) && !(typeof globalConstants !== 'undefined' && id in globalConstants)) {
          // unknown identifier — reject
          return null;
        }
      }

      // build safe function
      // create function body that extracts Math as m for clarity
      const body = `with(Math){ return (${expr}); }`;

      // Create function in a restricted scope — still uses Function() but we've sanitized heavily
      const f = new Function('Math', body);
      const result = f(Math);

      if (typeof result === 'number' && isFinite(result)) return result;
      return null;
    } catch (e) {
      return null;
    }
  }

  _escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ---------------------------
     Drawing helpers
     --------------------------- */

  _clearCanvas() {
    if (!this.ctx) return;
    // use logical pixels (not DPR)
    this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
  }

  _drawBackground() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    ctx.restore();
  }

  _drawToContext(targetCtx, data, unknownVar, formula) {
    // Prepare context - support offscreen ctx
    const ctx = targetCtx || this.ctx;
    if (!ctx) return;

    // clear & draw background
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

    if (this.gridEnabled) this._drawGrid(ctx);
    if (this.axesEnabled) this._drawAxes(ctx, unknownVar);

    // draw curve
    this._drawCurveOnCtx(ctx, data, this.curveColor, this.smoothCurves);

    // draw title
    this._drawTitle(ctx, formula);

    // ENHANCED: Draw UI overlays (calculated points, hover markers, etc.)
    this._drawUIOverlays(ctx);

    ctx.restore();
  }

  _drawGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const vertical = 10, horizontal = 10;
    const xStep = (this.bounds.right - this.bounds.left) / vertical;
    const yStep = (this.bounds.top - this.bounds.bottom) / horizontal;

    for (let i = 0; i <= vertical; i++) {
      const x = this.bounds.left + i * xStep;
      const sx = this.worldToScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, this.padding.top);
      ctx.lineTo(sx, this.height - this.padding.bottom);
      ctx.stroke();
    }

    for (let j = 0; j <= horizontal; j++) {
      const y = this.bounds.bottom + j * yStep;
      const sy = this.worldToScreenY(y);
      ctx.beginPath();
      ctx.moveTo(this.padding.left, sy);
      ctx.lineTo(this.width - this.padding.right, sy);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawAxes(ctx, unknownVar) {
    ctx.save();
    ctx.strokeStyle = this.axisColor;
    ctx.lineWidth = 1.5;

    // x axis (y=0)
    const zeroY = this.worldToScreenY(0);
    if (zeroY >= this.padding.top && zeroY <= this.height - this.padding.bottom) {
      ctx.beginPath();
      ctx.moveTo(this.padding.left, zeroY);
      ctx.lineTo(this.width - this.padding.right, zeroY);
      ctx.stroke();
    }

    // y axis (x=0)
    const zeroX = this.worldToScreenX(0);
    if (zeroX >= this.padding.left && zeroX <= this.width - this.padding.right) {
      ctx.beginPath();
      ctx.moveTo(zeroX, this.padding.top);
      ctx.lineTo(zeroX, this.height - this.padding.bottom);
      ctx.stroke();
    }

    // label with proper axis labels from formula config
    ctx.fillStyle = this.axisColor;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    
    // Get axis labels from formula config if available
    let xLabel = unknownVar.symbol || 'x';
    if (typeof getAxisLabels === 'function' && this.currentFormula) {
      const labels = getAxisLabels(this.currentFormula, unknownVar.symbol, 'y');
      if (labels && labels.x) {
        xLabel = labels.x;
      }
    }
    
    ctx.fillText(xLabel, this.width / 2, this.height - 10);
    ctx.restore();
  }

  /**
   * ENHANCED: Consolidated overlay drawing - single pass for all UI elements
   */
  _drawUIOverlays(ctx) {
    if (!ctx) return;
    
    ctx.save();
    
    // Draw calculated point if set
    if (this.showCalculatedPoint && this.calculatedPoint) {
      this._drawCalculatedPoint(this.calculatedPoint, ctx);
    }
    
    // Draw hover marker last so it's on top
    if (this.lastHoverPoint) {
      this._drawHoverMarker(this.lastHoverPoint, ctx);
    }
    
    // Draw highlight point if set
    if (this.highlightPoint) {
      const sx = this.worldToScreenX(this.highlightPoint.x);
      const sy = this.worldToScreenY(this.highlightPoint.y);
      ctx.save();
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    ctx.restore();
  }

  _drawCurveOnCtx(ctx, data, color = '#3b82f6', smooth = true) {
    if (!data || data.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    // ENHANCED: Use precomputed screen coordinates if available
    const screenCoords = this.screenCoordsCache || data.map(p => ({
      sx: this.worldToScreenX(p.x),
      sy: this.worldToScreenY(p.y)
    }));

    const p0 = screenCoords[0];
    ctx.moveTo(p0.sx, p0.sy);

    if (smooth) {
      // simple smoothing using midpoints
      for (let i = 1; i < screenCoords.length; i++) {
        const coord = screenCoords[i];
        const prev = screenCoords[i - 1];
        const cx = (prev.sx + coord.sx) / 2;
        const cy = (prev.sy + coord.sy) / 2;
        ctx.quadraticCurveTo(prev.sx, prev.sy, cx, cy);
      }
      // final line to last point
      const last = screenCoords[screenCoords.length - 1];
      ctx.lineTo(this.worldToScreenX(last.x), this.worldToScreenY(last.y));
    } else {
      for (let i = 1; i < data.length; i++) {
        const p = data[i];
        ctx.lineTo(this.worldToScreenX(p.x), this.worldToScreenY(p.y));
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  _drawTitle(ctx, formula) {
    ctx.save();
    ctx.fillStyle = this.axisColor;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    
    // ENHANCED: Display formula name
    const title = (formula && formula.name) || '';
    ctx.fillText(title, this.width / 2, 20);
    
    // ENHANCED: Display equation below title if available
    if (formula && formula.equation) {
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      // Truncate long equations to fit on screen
      let equationText = String(formula.equation);
      const maxWidth = this.width - 40;
      if (ctx.measureText(equationText).width > maxWidth) {
        // Truncate and add ellipsis
        while (ctx.measureText(equationText + '...').width > maxWidth && equationText.length > 0) {
          equationText = equationText.slice(0, -1);
        }
        equationText += '...';
      }
      ctx.fillText(equationText, this.width / 2, 38);
    }
    
    ctx.restore();
  }

  _drawHoverMarker(hit, ctx = this.ctx) {
    if (!hit || !ctx) return;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(hit.sx, hit.sy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawCalculatedPoint(point, ctx = this.ctx) {
    if (!point || !ctx) return;
    ctx.save();
    
    const sx = this.worldToScreenX(point.x);
    const sy = this.worldToScreenY(point.y);
    
    // ENHANCED: Check if point is within visible bounds
    if (sx < this.padding.left || sx > this.width - this.padding.right ||
        sy < this.padding.top || sy > this.height - this.padding.bottom) {
      ctx.restore();
      return; // Point is outside visible area
    }
    
    // ENHANCED: Draw outer circle (highlight) with better visibility
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 255, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw inner filled circle
    ctx.fillStyle = '#00ff00';
    ctx.shadowBlur = 0; // Remove shadow for filled circle
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label if provided
    if (point.label) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, sx, sy - 15);
    }
    
    ctx.restore();
  }

  _showMessage(msg) {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    container.innerHTML = `<div style="padding:20px;color:#fff;text-align:center">${msg}</div>`;
  }

  /* ---------------------------
     Bounds adjust based on data
     --------------------------- */

  adjustBoundsToData(data) {
    if (!data || data.length === 0) return;
    const xs = data.map(p => p.x).filter(v => isFinite(v));
    const ys = data.map(p => p.y).filter(v => isFinite(v));
    if (xs.length === 0 || ys.length === 0) return;

    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    this.bounds.left = xMin - 0.1 * xRange;
    this.bounds.right = xMax + 0.1 * xRange;
    this.bounds.bottom = yMin - 0.1 * yRange;
    this.bounds.top = yMax + 0.1 * yRange;
  }

  /* ---------------------------
     Coordinate transforms (screen coords in CSS px)
     --------------------------- */

  worldToScreenX(worldX) {
    const worldWidth = this.bounds.right - this.bounds.left || 1;
    const screenWidth = this.width - this.padding.left - this.padding.right;
    return this.padding.left + ((worldX - this.bounds.left) / worldWidth) * screenWidth;
  }

  worldToScreenY(worldY) {
    const worldHeight = this.bounds.top - this.bounds.bottom || 1;
    const screenHeight = this.height - this.padding.top - this.padding.bottom;
    return this.height - this.padding.bottom - ((worldY - this.bounds.bottom) / worldHeight) * screenHeight;
  }

  screenToWorldX(screenX) {
    const worldWidth = this.bounds.right - this.bounds.left || 1;
    const screenWidth = this.width - this.padding.left - this.padding.right;
    return this.bounds.left + ((screenX - this.padding.left) / screenWidth) * worldWidth;
  }

  screenToWorldY(screenY) {
    const worldHeight = this.bounds.top - this.bounds.bottom || 1;
    const screenHeight = this.height - this.padding.top - this.padding.bottom;
    return this.bounds.bottom + ((this.height - this.padding.bottom - screenY) / screenHeight) * worldHeight;
  }
}

/* Export for browser and node */
if (typeof window !== 'undefined') {
  window.EnhancedOfflineGraphManagerV2 = EnhancedOfflineGraphManagerV2;
  // Also export as EnhancedOfflineGraphManager for backward compatibility
  window.EnhancedOfflineGraphManager = EnhancedOfflineGraphManagerV2;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedOfflineGraphManagerV2;
}
