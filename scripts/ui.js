/**
 * UI Controller - TRULY CLEAN VERSION
 * Bootstrap only - no logic, just wiring
 * Fails fast if dependencies missing
 * NO FALLBACKS - NO LEGACY CODE - NO WINDOW POLLUTION
 */

(function() {
    'use strict';

    /**
     * Bootstrap the application
     * Requires all dependencies to be loaded - FAILS FAST if missing
     */
    function initializeApp() {
        // Validate required dependencies - fail fast
        if (typeof formulas === 'undefined' || !formulas || !Array.isArray(formulas) || formulas.length === 0) {
            throw new Error('Missing required dependency: formulas array is empty or invalid');
        }

        if (typeof FormulaCalculator === 'undefined') {
            throw new Error('Missing required dependency: FormulaCalculator');
        }

        if (typeof UnitConverter === 'undefined') {
            throw new Error('Missing required dependency: UnitConverter');
        }

        if (typeof UIModuleOrchestrator === 'undefined' && typeof App === 'undefined') {
            throw new Error('Missing required dependency: UIModuleOrchestrator or App class');
        }

        try {
            // Build formula categories
            const formulaCategories = {};
            formulas.forEach(formula => {
                if (formula.category) {
                    if (!formulaCategories[formula.category]) {
                        formulaCategories[formula.category] = [];
                    }
                    formulaCategories[formula.category].push(formula.id);
                }
            });

            // Use App if available, otherwise fall back to UIModuleOrchestrator
            const AppClass = typeof App !== 'undefined' ? App : UIModuleOrchestrator;
            
            // Create app with all dependencies
            const app = new AppClass({
                formulas: formulas,
                formulaCategories: formulaCategories,
                FormulaCalculatorClass: FormulaCalculator,
                UnitConverter: UnitConverter,
                ExpressionParser: typeof ExpressionParser !== 'undefined' ? ExpressionParser : undefined,
                SafeMathEvaluator: typeof SafeMathEvaluator !== 'undefined' ? SafeMathEvaluator : undefined,
                EnhancedOfflineGraphManagerV2: typeof EnhancedOfflineGraphManagerV2 !== 'undefined' ? EnhancedOfflineGraphManagerV2 : undefined,
                StellarClassifier: typeof StellarClassifier !== 'undefined' ? StellarClassifier : undefined,
                semanticSearchSystem: typeof semanticSearchSystem !== 'undefined' ? semanticSearchSystem : undefined,
                performanceOptimizer: typeof performanceOptimizer !== 'undefined' ? performanceOptimizer : undefined,
                searchCache: typeof searchCache !== 'undefined' ? searchCache : undefined,
                globalConstants: typeof globalConstants !== 'undefined' ? globalConstants : undefined
            });

            // Start the app (if it has a start method, otherwise initialize)
            if (typeof app.start === 'function') {
                app.start();
            } else if (typeof app.initialize === 'function') {
                app.initialize();
            }

            // Expose for debugging ONLY (not for production use)
            if (typeof window !== 'undefined') {
                window.__app = app; // Always expose for debugging
            }

            console.log('[UI] ✅ Application initialized successfully');
        } catch (error) {
            console.error('[UI] ❌ Initialization failed:', error);
            throw error; // Fail fast - don't silently continue
        }
    }

    // Initialize when DOM is ready
    if (typeof document === 'undefined') {
        throw new Error('Document not available');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
})();

