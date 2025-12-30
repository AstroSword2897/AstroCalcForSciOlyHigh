/**
 * Main Entry Point
 * Proper ES module initialization - no globals, no fallbacks
 */

import { App } from './app/App';
import { FormulaCalculator } from './calculator/index';
// These will be converted to TypeScript next
declare const UnitConverter: any;
declare const formulas: any[];
declare const formulaCategories: Record<string, string[]>;
declare const globalConstants: Record<string, number>;

/**
 * Initialize the application
 * Creates all dependencies and wires them together
 */
function initializeApp(): void {
    // Validate required dependencies - fail fast
    if (!formulas || !Array.isArray(formulas) || formulas.length === 0) {
        throw new Error('Missing required dependency: formulas array is empty or invalid');
    }

    // Build formula categories
    const categories: Record<string, string[]> = {};
    formulas.forEach(formula => {
        if (formula.category) {
            if (!categories[formula.category]) {
                categories[formula.category] = [];
            }
            categories[formula.category].push(formula.id);
        }
    });

    // Create dependencies (instances, not classes)
    const calculator = new FormulaCalculator(formulas[0]); // Will be recreated per formula
    const unitConverter = new UnitConverter();

    // Create app with all dependencies
    const app = new App({
        formulas,
        formulaCategories: categories,
        calculator,
        unitConverter,
        expressionParser: typeof (window as any).ExpressionParser !== 'undefined' ? (window as any).ExpressionParser : undefined,
        safeMathEvaluator: typeof (window as any).SafeMathEvaluator !== 'undefined' ? (window as any).SafeMathEvaluator : undefined,
        enhancedOfflineGraphManagerV2: typeof (window as any).EnhancedOfflineGraphManagerV2 !== 'undefined' ? (window as any).EnhancedOfflineGraphManagerV2 : undefined,
        stellarClassifier: typeof (window as any).StellarClassifier !== 'undefined' ? (window as any).StellarClassifier : undefined,
        semanticSearchSystem: typeof (window as any).semanticSearchSystem !== 'undefined' ? (window as any).semanticSearchSystem : undefined,
        performanceOptimizer: typeof (window as any).performanceOptimizer !== 'undefined' ? (window as any).performanceOptimizer : undefined,
        searchCache: typeof (window as any).searchCache !== 'undefined' ? (window as any).searchCache : undefined,
        globalConstants
    });

    // Start the app
    app.start();

    // Expose for debugging ONLY
    if (typeof window !== 'undefined') {
        (window as any).__app = app;
    }

    console.log('[Main] ✅ Application initialized successfully');
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

