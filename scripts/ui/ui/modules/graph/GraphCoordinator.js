/**
 * GraphCoordinator - IMPROVED VERSION
 * Better error handling, readiness gating, state management, and performance
 */
export class GraphCoordinator {
    constructor(options = {}) {
        this.updateQueue = [];
        this.isUpdating = false;
        this.MAX_QUEUE_SIZE = 10;
        this.enabled = options.enabled ?? true;
        this.containerId = options.containerId || 'desmos-graph';
        this.tabId = options.tabId || 'graph-tab';
        this.getGraphManager = options.getGraphManager || (() => null);
        this.createGraphManager = options.createGraphManager || (() => null);
        this.onGraphUpdate = options.onGraphUpdate;
        this.onGraphError = options.onGraphError;
        this.graphReady = false;
        this.initializationPromise = null;
    }
    
    /**
     * Ensure graph is ready before operations
     */
    async ensureGraphReady() {
        if (!this.enabled) return false;
        
        // If already ready, return immediately
        if (this.graphReady) {
            return true;
        }
        
        // If initialization is in progress, wait for it
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        // Start initialization
        this.initializationPromise = this.initializeGraphOnce();
        return this.initializationPromise;
    }
    
    /**
     * Initialize graph exactly once, no retries
     */
    async initializeGraphOnce() {
        try {
            // Try to get existing manager
            let manager = this.getGraphManager();
            
            if (manager) {
                // Validate manager is functional
                if (this.validateManager(manager)) {
                    this.graphReady = true;
                    console.log('[GraphCoordinator] ✅ Graph ready with existing manager');
                    return true;
                }
            }
            
            // Create new manager
            manager = this.createGraphManager();
            if (!manager) {
                console.warn('[GraphCoordinator] No graph manager available');
                this.graphReady = false;
                return false;
            }
            
            // Initialize once
            if (typeof manager.init === 'function') {
                const initialized = manager.init();
                if (initialized) {
                    this.graphReady = true;
                    console.log('[GraphCoordinator] ✅ Graph initialized successfully');
                    return true;
                }
            }
            
            console.warn('[GraphCoordinator] Graph initialization failed');
            this.graphReady = false;
            return false;
            
        } catch (error) {
            console.error('[GraphCoordinator] Error during graph initialization:', error);
            this.graphReady = false;
            return false;
        }
    }
    
    /**
     * Ensure graph manager is initialized with readiness gating
     */
    async ensureGraphManager() {
        if (!this.enabled)
            return null;
        
        // Ensure graph is ready
        const ready = await this.ensureGraphReady();
        if (!ready) {
            console.warn('[GraphCoordinator] Graph not ready');
            return null;
        }
        
        // Try to get existing manager
        let manager = this.getGraphManager();
        if (manager) {
            // Validate manager is still functional
            if (this.validateManager(manager)) {
                return manager;
            }
        }
        
        // Create new manager
        manager = this.createGraphManager();
        if (!manager)
            return null;
        
        return manager;
    }
    validateManager(manager) {
        // Check if manager has at least one update method
        return typeof manager.updateGraph === 'function' ||
            typeof manager.render === 'function' ||
            typeof manager.setFormula === 'function';
    }
    
    /**
     * Update graph with queuing and batching for performance
     */
    async updateGraphIfEnabled(formula, values = {}, options = {}) {
        if (!this.enabled || !formula)
            return;
            
        // Ensure graph is ready before updating
        const ready = await this.ensureGraphReady();
        if (!ready) {
            console.warn('[GraphCoordinator] Graph not ready, skipping update');
            return;
        }
        
        // Queue update if already updating
        if (this.isUpdating) {
            this.queueUpdate(formula, values, options);
            return;
        }
        
        this.isUpdating = true;
        try {
            const manager = await this.ensureGraphManager();
            if (!manager) {
                console.warn('[GraphCoordinator] Graph manager not available');
                this.queueUpdate(formula, values, options);
                return;
            }
            
            // Handle special visualization modes
            if (options.solveGraph && options.context) {
                if (typeof manager.visualizeSolveGraph === 'function') {
                    manager.visualizeSolveGraph(options.solveGraph, options.context, options.graphOptions || {});
                    this.isUpdating = false;
                    return;
                }
            }
            
            if (options.executionTrace && options.context) {
                if (typeof manager.visualizeExecutionTrace === 'function') {
                    manager.visualizeExecutionTrace(options.context, options.traceOptions || {});
                    this.isUpdating = false;
                    return;
                }
            }
            // Ensure initialization
            if (typeof manager.init === 'function') {
                const initialized = manager.init();
                if (!initialized) {
                    this.queueUpdate(formula, values, options);
                    this.retryUpdateGraph(formula, values, options);
                    this.isUpdating = false;
                    return;
                }
            }
            // Check if graph tab is active
            const graphTab = document.getElementById(this.tabId);
            const isActive = graphTab?.classList.contains('active');
            // Update graph using available method
            this.performGraphUpdate(manager, formula, values, options);
            // Call update callback
            if (this.onGraphUpdate) {
                this.onGraphUpdate(formula, values);
            }
        }
        catch (error) {
            console.error('[GraphCoordinator] Error updating graph:', error);
            this.handleGraphError(error, formula, values, options);
        }
        finally {
            this.isUpdating = false;
            // Process queued updates
            this.processUpdateQueue();
        }
    }
    performGraphUpdate(manager, formula, values, options) {
        if (typeof manager.updateGraph === 'function') {
            manager.updateGraph(formula, values, options);
        }
        else if (typeof manager.render === 'function') {
            manager.render(formula, values);
        }
        else if (typeof manager.setFormula === 'function') {
            manager.setFormula(formula, values);
        }
        else {
            console.warn('[GraphCoordinator] No valid update method found');
        }
    }
    queueUpdate(formula, values, options) {
        // Remove old updates for same formula
        this.updateQueue = this.updateQueue.filter(item => item.formula.id !== formula.id);
        // Add new update
        this.updateQueue.unshift({ formula, values, options });
        // Limit queue size
        if (this.updateQueue.length > this.MAX_QUEUE_SIZE) {
            this.updateQueue = this.updateQueue.slice(0, this.MAX_QUEUE_SIZE);
        }
    }
    processUpdateQueue() {
        if (this.updateQueue.length === 0 || this.isUpdating)
            return;
        const update = this.updateQueue.shift();
        if (update) {
            this.updateGraphIfEnabled(update.formula, update.values, update.options);
        }
    }
    /**
     * Update graph with calculated point highlight
     */
    updateGraphWithCalculatedPoint(formula, values, calculatedVar, calculatedValue) {
        if (!this.enabled)
            return;
        const options = {
            calculatedPoint: {
                x: calculatedValue,
                label: `${calculatedVar} = ${calculatedValue}`
            },
            equation: formula.equation || formula.name
        };
        this.updateGraphIfEnabled(formula, values, options);
    }
    /**
     * Check if graph tab is active
     */
    isGraphTabActive() {
        const graphTab = document.getElementById(this.tabId);
        return graphTab?.classList.contains('active') || false;
    }
    /**
     * Force graph update when tab becomes active
     */
    forceUpdateOnTabActivation(formula, getCurrentValues) {
        if (!this.isGraphTabActive())
            return;
        const manager = this.ensureGraphManager();
        if (!manager || !formula)
            return;
        // Wait for container to be visible with timeout
        const container = document.getElementById(this.containerId);
        if (!container || container.offsetWidth === 0) {
            setTimeout(() => {
                if (this.isGraphTabActive()) {
                    this.forceUpdateOnTabActivation(formula, getCurrentValues);
                }
            }, 100);
            return;
        }
        const values = getCurrentValues();
        const options = manager.pendingOptions || {};
        this.updateGraphIfEnabled(formula, values, options);
    }
    retryUpdateGraph(formula, values, options, attempt = 1) {
        if (attempt > this.MAX_INIT_ATTEMPTS) {
            console.warn('[GraphCoordinator] Max retry attempts reached');
            return;
        }
        setTimeout(() => {
            const manager = this.ensureGraphManager();
            if (manager && typeof manager.init === 'function' && manager.init()) {
                this.updateGraphIfEnabled(formula, values, options);
            }
            else {
                this.retryUpdateGraph(formula, values, options, attempt + 1);
            }
        }, 200 * attempt); // Exponential backoff
    }
    handleGraphError(error, formula, values, options) {
        console.error('[GraphCoordinator] Graph error details:', {
            formula: formula.id,
            error: error.message,
            stack: error.stack
        });
        // Store pending options for retry
        const manager = this.ensureGraphManager();
        if (manager) {
            manager.pendingOptions = options;
        }
        // Notify error handler
        if (this.onGraphError) {
            this.onGraphError(error, formula);
        }
    }
    /**
     * Check if formula should auto-graph
     */
    shouldAutoGraph(formulaId) {
        const manager = this.ensureGraphManager();
        if (manager?.offlineManager?.shouldAutoGraph) {
            return manager.offlineManager.shouldAutoGraph(formulaId);
        }
        // Fallback: known auto-graph formulas
        const autoGraphFormulas = new Set([
            'wiens_law',
            'escape_velocity',
            'luminosity',
            'kepler_third_law',
            'kepler_third_law_solar',
            'redshift_definition',
            'doppler_shift',
            'doppler_shift_approx',
            'stefan_boltzmann_law',
            'orbital_velocity'
        ]);
        return autoGraphFormulas.has(formulaId);
    }
    /**
     * Get calculated point for graph
     */
    getCalculatedPoint(formula, values, constants) {
        const manager = this.ensureGraphManager();
        if (manager?.offlineManager?.getCalculatedPoint) {
            return manager.offlineManager.getCalculatedPoint(formula, values, constants);
        }
        return null;
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.initializationAttempts.clear();
        this.updateQueue = [];
        this.isUpdating = false;
    }
}
