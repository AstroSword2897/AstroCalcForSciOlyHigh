/**
 * UI Orchestrator - Thin orchestrator that uses modular architecture
 * This replaces the monolithic ui.js with a clean, maintainable structure
 */

(function() {
    'use strict';

    // Wait for all dependencies to load
    function waitForDependencies(callback, maxAttempts = 50) {
        let attempts = 0;
        const checkDependencies = () => {
            attempts++;
            
            const hasFormulas = typeof formulas !== 'undefined' && formulas && formulas.length > 0;
            const hasFormulaCalculator = typeof FormulaCalculator !== 'undefined';
            const hasUnitConverter = typeof UnitConverter !== 'undefined';
            const hasOrchestrator = typeof UIModuleOrchestrator !== 'undefined';

            if (hasFormulas && hasFormulaCalculator && hasUnitConverter && hasOrchestrator) {
                callback();
            } else if (attempts < maxAttempts) {
                setTimeout(checkDependencies, 100);
            } else {
                console.error('[UI Orchestrator] Dependencies not loaded after max attempts');
            }
        };
        checkDependencies();
    }

    // Initialize UI system
    function initializeUI() {
        try {
            // Get formula categories
            const formulaCategories = {};
            if (typeof formulas !== 'undefined' && formulas) {
                formulas.forEach(formula => {
                    if (formula.category) {
                        if (!formulaCategories[formula.category]) {
                            formulaCategories[formula.category] = [];
                        }
                        formulaCategories[formula.category].push(formula.id);
                    }
                });
            }

            // Create orchestrator
            const orchestrator = new UIModuleOrchestrator({
                formulas: formulas || [],
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

            // Initialize
            orchestrator.initialize();

            // Setup search functionality
            setupSearchWithOrchestrator(orchestrator);

            // Render initial formula list
            if (typeof renderFormulaList === 'function') {
                renderFormulaList();
            }

            console.log('[UI Orchestrator] ✅ UI system initialized');
        } catch (error) {
            console.error('[UI Orchestrator] Initialization error:', error);
        }
    }

    // Setup search with orchestrator
    function setupSearchWithOrchestrator(orchestrator) {
        const searchInput = document.getElementById('formula-search');
        const clearBtn = document.getElementById('clear-search');
        
        if (!searchInput || !clearBtn) {
            setTimeout(() => setupSearchWithOrchestrator(orchestrator), 200);
            return;
        }

        let debounceTimer = null;
        const DEBOUNCE_MS = 50;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            
            if (searchTerm.length > 0) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
                if (typeof renderFormulaList === 'function') {
                    renderFormulaList();
                }
                return;
            }

            // Debounce search
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                const results = orchestrator.searchFormulas(searchTerm);
                if (typeof window !== 'undefined' && typeof window.searchResultsRenderer !== 'undefined') {
                    window.searchResultsRenderer.renderFilteredFormulas(
                        results,
                        searchTerm,
                        results.length > 0 ? results[0].score : 1
                    );
                } else if (typeof renderFilteredFormulas === 'function') {
                    renderFilteredFormulas(results, searchTerm, results.length > 0 ? results[0].score : 1);
                }
            }, DEBOUNCE_MS);
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            if (typeof renderFormulaList === 'function') {
                renderFormulaList();
            }
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                clearBtn.style.display = 'none';
                if (typeof renderFormulaList === 'function') {
                    renderFormulaList();
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForDependencies(initializeUI);
        });
    } else {
        waitForDependencies(initializeUI);
    }

    // Expose initialization function
    window.initializeUI = initializeUI;
})();

