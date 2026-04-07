/**
 * UI Initialization - Wires all modules together and initializes the application
 * This replaces the monolithic initialization in ui.js
 */
import { UIModuleOrchestrator } from './UIModuleOrchestrator.js?v=2.3.17';

let retryCount = 0;
const MAX_RETRIES = 50;

/**
 * Initialize the UI system with all modules
 */
export function initializeUI() {
    try {
        retryCount++;
        
        // Check if we've exceeded max retries
        if (retryCount > MAX_RETRIES) {
            console.error('[UI Init] ❌ Max retries exceeded. Dependencies not loaded:');
            console.error('[UI Init] - formulas:', typeof window.formulas);
            console.error('[UI Init] - FormulaCalculator:', typeof window.FormulaCalculator);
            console.error('[UI Init] - UnitConverter:', typeof window.UnitConverter);
            return null;
        }
        
        // Wait for required dependencies
        if (typeof window.formulas === 'undefined' || !window.formulas) {
            console.warn(`[UI Init] Formulas not loaded yet, retrying... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(() => initializeUI(), 200);
            return null;
        }
        
        if (typeof window.FormulaCalculator === 'undefined') {
            console.warn(`[UI Init] FormulaCalculator not loaded yet, retrying... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(() => initializeUI(), 200);
            return null;
        }

        if (typeof window.UnitConverter === 'undefined' || window.UnitConverter == null) {
            console.warn(`[UI Init] UnitConverter not loaded yet, retrying... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(() => initializeUI(), 200);
            return null;
        }
        
        console.log('[UI Init] ✅ All dependencies loaded, initializing modular system...');
        
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
    }
    catch (error) {
        console.error('[UI Init] ❌ Failed to initialize UI:', error);
        return null;
    }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => initializeUI(), 500);
        });
    }
    else {
        setTimeout(() => initializeUI(), 500);
    }
}
