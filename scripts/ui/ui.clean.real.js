/**
 * UI Controller - TRULY CLEAN VERSION
 * Bootstrap only - no logic, just wiring
 * Fails fast if dependencies missing
 */

(function() {
    'use strict';

    /**
     * Bootstrap the application
     * Requires all dependencies to be loaded
     */
    function initializeApp() {
        // Validate required dependencies - fail fast
        const required = {
            formulas: typeof formulas !== 'undefined' ? formulas : null,
            FormulaCalculator: typeof FormulaCalculator !== 'undefined' ? FormulaCalculator : null,
            UnitConverter: typeof UnitConverter !== 'undefined' ? UnitConverter : null,
            UIModuleOrchestrator: typeof UIModuleOrchestrator !== 'undefined' ? UIModuleOrchestrator : null
        };

        // Check for missing dependencies
        const missing = Object.entries(required)
            .filter(([name, value]) => value === null)
            .map(([name]) => name);

        if (missing.length > 0) {
            throw new Error(`Missing required dependencies: ${missing.join(', ')}`);
        }

        if (!required.formulas || !Array.isArray(required.formulas) || required.formulas.length === 0) {
            throw new Error('Formulas array is empty or invalid');
        }

        try {
            // Build formula categories
            const formulaCategories = {};
            required.formulas.forEach(formula => {
                if (formula.category) {
                    if (!formulaCategories[formula.category]) {
                        formulaCategories[formula.category] = [];
                    }
                    formulaCategories[formula.category].push(formula.id);
                }
            });

            // Create orchestrator with all dependencies
            const orchestrator = new required.UIModuleOrchestrator({
                formulas: required.formulas,
                formulaCategories: formulaCategories,
                FormulaCalculatorClass: required.FormulaCalculator,
                UnitConverter: required.UnitConverter,
                ExpressionParser: typeof ExpressionParser !== 'undefined' ? ExpressionParser : undefined,
                SafeMathEvaluator: typeof SafeMathEvaluator !== 'undefined' ? SafeMathEvaluator : undefined,
                EnhancedOfflineGraphManagerV2: typeof EnhancedOfflineGraphManagerV2 !== 'undefined' ? EnhancedOfflineGraphManagerV2 : undefined,
                StellarClassifier: typeof StellarClassifier !== 'undefined' ? StellarClassifier : undefined,
                semanticSearchSystem: typeof semanticSearchSystem !== 'undefined' ? semanticSearchSystem : undefined,
                performanceOptimizer: typeof performanceOptimizer !== 'undefined' ? performanceOptimizer : undefined,
                searchCache: typeof searchCache !== 'undefined' ? searchCache : undefined,
                globalConstants: typeof globalConstants !== 'undefined' ? globalConstants : undefined
            });

            // Initialize
            orchestrator.initialize();

            // Expose for debugging only
            if (typeof window !== 'undefined') {
                window.__app = orchestrator; // Debug only
            }

            console.log('[UI] ✅ Application initialized successfully');
        } catch (error) {
            console.error('[UI] ❌ Initialization failed:', error);
            throw error; // Fail fast - don't silently continue
        }
    }

    // Initialize when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    } else {
        throw new Error('Document not available');
    }
})();

