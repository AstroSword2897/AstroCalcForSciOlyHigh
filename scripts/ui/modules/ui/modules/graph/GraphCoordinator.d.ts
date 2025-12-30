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
export declare class GraphCoordinator {
    private enabled;
    private containerId;
    private tabId;
    private getGraphManager;
    private createGraphManager;
    private onGraphUpdate?;
    private onGraphError?;
    private initializationAttempts;
    private updateQueue;
    private isUpdating;
    private readonly MAX_INIT_ATTEMPTS;
    private readonly MAX_QUEUE_SIZE;
    constructor(options?: GraphCoordinatorOptions);
    /**
     * Ensure graph manager is initialized with improved retry logic
     */
    ensureGraphManager(): GraphManager | null;
    private validateManager;
    private retryInitialization;
    /**
     * Update graph with queuing and batching for performance
     */
    updateGraphIfEnabled(formula: Formula, values?: Record<string, number | null>, options?: any): void;
    private performGraphUpdate;
    private queueUpdate;
    private processUpdateQueue;
    /**
     * Update graph with calculated point highlight
     */
    updateGraphWithCalculatedPoint(formula: Formula, values: Record<string, number | null>, calculatedVar: string, calculatedValue: number): void;
    /**
     * Check if graph tab is active
     */
    isGraphTabActive(): boolean;
    /**
     * Force graph update when tab becomes active
     */
    forceUpdateOnTabActivation(formula: Formula, getCurrentValues: () => Record<string, number | null>): void;
    private retryUpdateGraph;
    private handleGraphError;
    /**
     * Check if formula should auto-graph
     */
    shouldAutoGraph(formulaId: string): boolean;
    /**
     * Get calculated point for graph
     */
    getCalculatedPoint(formula: Formula, values: Record<string, number | null>, constants: Record<string, number>): any;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
