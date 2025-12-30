/**
 * UI Initialization - Wires all modules together and initializes the application
 * This replaces the monolithic initialization in ui.js
 */
import { UIModuleOrchestrator } from './UIModuleOrchestrator';
import { Formula } from '../types/formula';
declare global {
    interface Window {
        formulas: Formula[];
        formulaCategories: Record<string, string[]>;
        FormulaCalculator: any;
        UnitConverter: any;
        ExpressionParser?: any;
        SafeMathEvaluator?: any;
        EnhancedOfflineGraphManagerV2?: any;
        StellarClassifier?: any;
        semanticSearchSystem?: any;
        performanceOptimizer?: any;
        searchCache?: any;
        globalConstants?: Record<string, number>;
        uiOrchestrator?: UIModuleOrchestrator;
    }
}
/**
 * Initialize the UI system with all modules
 */
export declare function initializeUI(): UIModuleOrchestrator | null;
