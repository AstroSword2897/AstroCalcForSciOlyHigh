/**
 * GraphCoordinator - IMPROVED VERSION
 * Better error handling, retry logic, state management, and performance
 */

import { Formula } from '../../../types/formula';

export interface GraphManager {
    init(): boolean;
    updateGraph?(formula: Formula, values: Record<string, number | null>, options?: any): void;
    render?(formula: Formula, values: Record<string, number | null>): void;
    setFormula?(formula: Formula, values: Record<string, number | null>): void;
    visualizeSolveGraph?(solveGraph: any, context: any, options?: any): void;
    visualizeExecutionTrace?(context: any, options?: any): void;
    pendingOptions?: any;
    offlineManager?: {
        shouldAutoGraph?(formulaId: string): boolean;
        getCalculatedPoint?(formula: Formula, values: Record<string, number | null>, constants: Record<string, number>): any;
    };
}

export interface GraphCoordinatorOptions {
    enabled?: boolean;
    containerId?: string;
    tabId?: string;
    getGraphManager?: () => GraphManager | null;
    createGraphManager?: () => GraphManager | null;
    onGraphUpdate?: (formula: Formula, values: Record<string, number | null>) => void;
    onGraphError?: (error: any, formula: Formula) => void;
}

export class GraphCoordinator {
    private enabled: boolean;
    private containerId: string;
    private tabId: string;
    private getGraphManager: () => GraphManager | null;
    private createGraphManager: () => GraphManager | null;
    private onGraphUpdate?: (formula: Formula, values: Record<string, number | null>) => void;
    private onGraphError?: (error: any, formula: Formula) => void;
    private initializationAttempts: Map<GraphManager, number> = new Map();
    private updateQueue: Array<{ formula: Formula; values: Record<string, number | null>; options: any }> = [];
    private isUpdating: boolean = false;
    private readonly MAX_INIT_ATTEMPTS = 3;
    private readonly MAX_QUEUE_SIZE = 10;

    constructor(options: GraphCoordinatorOptions = {}) {
        this.enabled = options.enabled ?? true;
        this.containerId = options.containerId || 'desmos-graph';
        this.tabId = options.tabId || 'graph-tab';
        this.getGraphManager = options.getGraphManager || (() => null);
        this.createGraphManager = options.createGraphManager || (() => null);
        this.onGraphUpdate = options.onGraphUpdate;
        this.onGraphError = options.onGraphError;
    }

    /**
     * Ensure graph manager is initialized with improved retry logic
     */
    ensureGraphManager(): GraphManager | null {
        if (!this.enabled) return null;

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
        if (!manager) return null;

        // Track initialization attempts
        const attempts = this.initializationAttempts.get(manager) || 0;
        if (attempts >= this.MAX_INIT_ATTEMPTS) {
            console.warn('[GraphCoordinator] Max initialization attempts reached');
            return null;
        }

        // Initialize with retry
        if (typeof manager.init === 'function') {
            const initialized = manager.init();
            if (initialized) {
                this.initializationAttempts.delete(manager);
                return manager;
            } else {
                this.initializationAttempts.set(manager, attempts + 1);
                // Retry initialization
                this.retryInitialization(manager);
            }
        }

        return manager;
    }

    private validateManager(manager: GraphManager): boolean {
        // Check if manager has at least one update method
        return typeof manager.updateGraph === 'function' ||
               typeof manager.render === 'function' ||
               typeof manager.setFormula === 'function';
    }

    private retryInitialization(manager: GraphManager, attempt: number = 1): void {
        if (attempt > this.MAX_INIT_ATTEMPTS) return;

        setTimeout(() => {
            if (typeof manager.init === 'function') {
                const initialized = manager.init();
                if (initialized) {
                    this.initializationAttempts.delete(manager);
                    // Process queued updates
                    this.processUpdateQueue();
                } else {
                    this.retryInitialization(manager, attempt + 1);
                }
            }
        }, 200 * attempt); // Exponential backoff
    }

    /**
     * Update graph with queuing and batching for performance
     */
    updateGraphIfEnabled(
        formula: Formula,
        values: Record<string, number | null> = {},
        options: any = {}
    ): void {
        if (!this.enabled || !formula) return;

        // Queue update if already updating
        if (this.isUpdating) {
            this.queueUpdate(formula, values, options);
            return;
        }

        this.isUpdating = true;

        try {
            const manager = this.ensureGraphManager();
            if (!manager) {
                console.warn('[GraphCoordinator] Graph manager not available');
                this.queueUpdate(formula, values, options);
                this.isUpdating = false;
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
        } catch (error) {
            console.error('[GraphCoordinator] Error updating graph:', error);
            this.handleGraphError(error, formula, values, options);
        } finally {
            this.isUpdating = false;
            // Process queued updates
            this.processUpdateQueue();
        }
    }

    private performGraphUpdate(
        manager: GraphManager,
        formula: Formula,
        values: Record<string, number | null>,
        options: any
    ): void {
        if (typeof manager.updateGraph === 'function') {
            manager.updateGraph(formula, values, options);
        } else if (typeof manager.render === 'function') {
            manager.render(formula, values);
        } else if (typeof manager.setFormula === 'function') {
            manager.setFormula(formula, values);
        } else {
            console.warn('[GraphCoordinator] No valid update method found');
        }
    }

    private queueUpdate(
        formula: Formula,
        values: Record<string, number | null>,
        options: any
    ): void {
        // Remove old updates for same formula
        this.updateQueue = this.updateQueue.filter(
            item => item.formula.id !== formula.id
        );

        // Add new update
        this.updateQueue.unshift({ formula, values, options });

        // Limit queue size
        if (this.updateQueue.length > this.MAX_QUEUE_SIZE) {
            this.updateQueue = this.updateQueue.slice(0, this.MAX_QUEUE_SIZE);
        }
    }

    private processUpdateQueue(): void {
        if (this.updateQueue.length === 0 || this.isUpdating) return;

        const update = this.updateQueue.shift();
        if (update) {
            this.updateGraphIfEnabled(update.formula, update.values, update.options);
        }
    }

    /**
     * Update graph with calculated point highlight
     */
    updateGraphWithCalculatedPoint(
        formula: Formula,
        values: Record<string, number | null>,
        calculatedVar: string,
        calculatedValue: number
    ): void {
        if (!this.enabled) return;

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
    isGraphTabActive(): boolean {
        const graphTab = document.getElementById(this.tabId);
        return graphTab?.classList.contains('active') || false;
    }

    /**
     * Force graph update when tab becomes active
     */
    forceUpdateOnTabActivation(
        formula: Formula,
        getCurrentValues: () => Record<string, number | null>
    ): void {
        if (!this.isGraphTabActive()) return;

        const manager = this.ensureGraphManager();
        if (!manager || !formula) return;

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

    private retryUpdateGraph(
        formula: Formula,
        values: Record<string, number | null>,
        options: any,
        attempt: number = 1
    ): void {
        if (attempt > this.MAX_INIT_ATTEMPTS) {
            console.warn('[GraphCoordinator] Max retry attempts reached');
            return;
        }

        setTimeout(() => {
            const manager = this.ensureGraphManager();
            if (manager && typeof manager.init === 'function' && manager.init()) {
                this.updateGraphIfEnabled(formula, values, options);
            } else {
                this.retryUpdateGraph(formula, values, options, attempt + 1);
            }
        }, 200 * attempt); // Exponential backoff
    }

    private handleGraphError(
        error: any,
        formula: Formula,
        values: Record<string, number | null>,
        options: any
    ): void {
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
    shouldAutoGraph(formulaId: string): boolean {
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
    getCalculatedPoint(
        formula: Formula,
        values: Record<string, number | null>,
        constants: Record<string, number>
    ): any {
        const manager = this.ensureGraphManager();
        if (manager?.offlineManager?.getCalculatedPoint) {
            return manager.offlineManager.getCalculatedPoint(formula, values, constants);
        }
        return null;
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        this.initializationAttempts.clear();
        this.updateQueue = [];
        this.isUpdating = false;
    }
}

