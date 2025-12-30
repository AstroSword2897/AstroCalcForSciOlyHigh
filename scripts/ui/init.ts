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
export function initializeUI(): UIModuleOrchestrator | null {
    try {
        // Wait for required dependencies
        if (typeof window.formulas === 'undefined' || !window.formulas) {
            console.warn('[UI Init] Formulas not loaded yet, retrying...');
            setTimeout(() => initializeUI(), 100);
            return null;
        }

        if (typeof window.FormulaCalculator === 'undefined') {
            console.warn('[UI Init] FormulaCalculator not loaded yet, retrying...');
            setTimeout(() => initializeUI(), 100);
            return null;
        }

        // Create orchestrator
        const orchestrator = new UIModuleOrchestrator({
            formulas: window.formulas,
            formulaCategories: window.formulaCategories || {},
            FormulaCalculatorClass: window.FormulaCalculator,
            UnitConverter: window.UnitConverter,
            ExpressionParser: window.ExpressionParser,
            SafeMathEvaluator: window.SafeMathEvaluator,
            EnhancedOfflineGraphManagerV2: window.EnhancedOfflineGraphManagerV2,
            StellarClassifier: window.StellarClassifier,
            semanticSearchSystem: window.semanticSearchSystem,
            performanceOptimizer: window.performanceOptimizer,
            searchCache: window.searchCache,
            globalConstants: window.globalConstants
        });

        // Initialize
        orchestrator.initialize();

        // Expose globally
        window.uiOrchestrator = orchestrator;

        console.log('[UI Init] ✅ UI system initialized with modular architecture');
        return orchestrator;
    } catch (error) {
        console.error('[UI Init] ❌ Failed to initialize UI:', error);
        return null;
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => initializeUI(), 100);
        });
    } else {
        setTimeout(() => initializeUI(), 100);
    }
}

