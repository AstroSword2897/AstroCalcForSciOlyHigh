/**
 * App - The Real Orchestrator
 * Wires all modules together with proper dependency injection
 */
import { SearchEngine } from './modules/search/SearchEngine';
import { CalculationOrchestrator } from './modules/calculation/CalculationOrchestrator';
import { TabManager } from './modules/tabs/TabManager';
import { GraphCoordinator } from './modules/graph/GraphCoordinator';
import { FormulaSelector } from './modules/formula/FormulaSelector';
import { EventCoordinator } from './modules/events/EventCoordinator';
import { Formula } from '../types/formula';
export interface AppOptions {
    formulas: Formula[];
    formulaCategories: Record<string, string[]>;
    FormulaCalculatorClass: any;
    UnitConverter: any;
    ExpressionParser?: any;
    SafeMathEvaluator?: any;
    EnhancedOfflineGraphManagerV2?: any;
    StellarClassifier?: any;
    semanticSearchSystem?: any;
    performanceOptimizer?: any;
    searchCache?: any;
    globalConstants?: Record<string, number>;
}
export declare class App {
    private state;
    private searchEngine;
    private calculationOrchestrator;
    private tabManager;
    private graphCoordinator;
    private formulaSelector;
    private eventCoordinator;
    private calculationUtils;
    private formattingUtils;
    private options;
    constructor(options: AppOptions);
    private initializeModules;
    /**
     * Start the application
     */
    start(): void;
    /**
     * Render formula list
     */
    private renderFormulaList;
    /**
     * Setup search functionality
     */
    private setupSearch;
    /**
     * Get current variable values from DOM
     */
    private getCurrentVariableValues;
    /**
     * Display result
     */
    private displayResult;
    /**
     * Display error
     */
    private displayError;
    /**
     * Handle back button
     */
    private handleBackButton;
    /**
     * Cleanup resources
     */
    cleanup(): void;
    /**
     * Get module instances (for testing/debugging)
     */
    getModules(): {
        searchEngine: SearchEngine;
        calculationOrchestrator: CalculationOrchestrator;
        tabManager: TabManager;
        graphCoordinator: GraphCoordinator;
        formulaSelector: FormulaSelector;
        eventCoordinator: EventCoordinator;
    };
}
