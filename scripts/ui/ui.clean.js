/**
 * UI Controller - CLEAN VERSION
 * Thin orchestrator that uses modular architecture
 * All extracted functionality is in modules/
 */

(function() {
    'use strict';

    // ============================================================================
    // GLOBAL STATE & CONFIGURATION
    // ============================================================================

    // Timing constants
    const TIMING = {
        DEBOUNCE_SEARCH: 50,
        DEBOUNCE_INDICATORS: 400,
        MATHJAX_RENDER: 150,
        VISIBILITY_RETRY_SHORT: 100,
        VISIBILITY_RETRY_LONG: 500,
        AUTO_FOCUS_DELAY: 150,
        INIT_RETRY_DELAY: 100
    };

    // Feature flag: enable automatic graph updates after calculations
    const GRAPH_UPDATES_ENABLED = true;

    // Legacy state (for backward compatibility during transition)
    let currentFormula = null;
    let calculator = null;
    let graphManager = null;

    // ============================================================================
    // UTILITY FUNCTIONS (Keep for backward compatibility)
    // ============================================================================

    /**
     * Parse numeric value from input string
     * Delegates to CalculationUtils if available
     */
    function parseNumericValue(input, unit = null) {
        if (typeof window !== 'undefined' && typeof window.calculationUtils !== 'undefined') {
            return window.calculationUtils.parseNumericValue(input, unit);
        }
        
        // Fallback implementation
        if (input === null || input === undefined || input === '') {
            return null;
        }

        let normalized = String(input).trim()
            .replace(/[\u2013\u2014\u2212]/g, '-')
            .replace(/[\u00A0]/g, ' ');

        if (typeof input === 'number') {
            if (isNaN(input) || !isFinite(input)) return null;
            return input;
        }

        const parsed = parseFloat(normalized);
        if (!isNaN(parsed) && isFinite(parsed)) {
            return parsed;
        }

        return null;
    }

    /**
     * Safe expression evaluation
     * Delegates to CalculationUtils if available
     */
    function safeEvaluateExpression(expression, values = {}, constants = {}) {
        if (typeof window !== 'undefined' && typeof window.calculationUtils !== 'undefined') {
            return window.calculationUtils.safeEvaluateExpression(expression, values, constants);
        }
        
        // Fallback: basic evaluation
        console.warn('[ui.js] safeEvaluateExpression: Using fallback, CalculationUtils not available');
        return null;
    }

    /**
     * Replace variables in expression
     */
    function replaceVariables(expression, values = {}, constants = {}) {
        if (!expression || typeof expression !== 'string') {
            return expression;
        }

        const allValues = { ...values, ...constants };
        let result = expression;

        const symbols = Object.keys(allValues).sort((a, b) => b.length - a.length);

        symbols.forEach(symbol => {
            const value = allValues[symbol];
            if (value !== null && value !== undefined && isFinite(value)) {
                const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                result = result.replace(regex, value.toString());
            }
        });

        result = result.replace(/×/g, '*')
                       .replace(/÷/g, '/')
                       .replace(/√/g, 'Math.sqrt');

        return result;
    }

    /**
     * Unified error display function
     */
    function showError(elementId, message, type = 'error') {
        if (typeof window !== 'undefined' && typeof window.helpers !== 'undefined') {
            window.helpers.displayError(message, type);
            return;
        }
        
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`[showError] Element not found: ${elementId}`, message);
            alert(message);
            return;
        }
        
        const className = `error-message ${type}`;
        element.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
        element.classList.add('show');
    }

    /**
     * Escape HTML
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    /**
     * Initialize the application
     * Uses modular architecture if available, falls back to legacy
     */
    function initializeApp() {
        console.log('[ui.js] 🚀 Initializing app...');

        // Try to use modular orchestrator if available
        if (typeof window !== 'undefined' && typeof window.UIModuleOrchestrator !== 'undefined') {
            try {
                const orchestrator = new window.UIModuleOrchestrator({
                    formulas: typeof formulas !== 'undefined' ? formulas : [],
                    formulaCategories: typeof formulaCategories !== 'undefined' ? formulaCategories : {},
                    FormulaCalculatorClass: typeof FormulaCalculator !== 'undefined' ? FormulaCalculator : null,
                    UnitConverter: typeof UnitConverter !== 'undefined' ? UnitConverter : null,
                    ExpressionParser: typeof ExpressionParser !== 'undefined' ? ExpressionParser : undefined,
                    SafeMathEvaluator: typeof SafeMathEvaluator !== 'undefined' ? SafeMathEvaluator : undefined,
                    EnhancedOfflineGraphManagerV2: typeof EnhancedOfflineGraphManagerV2 !== 'undefined' ? EnhancedOfflineGraphManagerV2 : undefined,
                    StellarClassifier: typeof StellarClassifier !== 'undefined' ? StellarClassifier : undefined,
                    semanticSearchSystem: typeof semanticSearchSystem !== 'undefined' ? semanticSearchSystem : undefined,
                    performanceOptimizer: typeof performanceOptimizer !== 'undefined' ? performanceOptimizer : undefined,
                    searchCache: typeof searchCache !== 'undefined' ? searchCache : undefined,
                    globalConstants: typeof globalConstants !== 'undefined' ? globalConstants : undefined
                });

                orchestrator.initialize();
                window.uiOrchestrator = orchestrator;
                console.log('[ui.js] ✅ Using modular architecture');
                return;
            } catch (error) {
                console.error('[ui.js] Modular initialization failed, using legacy:', error);
            }
        }

        // Legacy initialization (minimal)
        console.log('[ui.js] Using legacy initialization');
    }

    // ============================================================================
    // FORMULA RENDERING (Keep - not yet fully extracted)
    // ============================================================================

    /**
     * Render formula list
     * Delegates to FormulaCards renderer if available
     */
    function renderFormulaList() {
        const formulaList = document.getElementById('formula-list');
        if (!formulaList) {
            console.error('[ui.js] formula-list element not found');
            return;
        }

        if (typeof window !== 'undefined' && typeof window.renderFormulaCards === 'function') {
            window.renderFormulaCards(typeof formulas !== 'undefined' ? formulas : [], formulaList);
            return;
        }

        // Fallback: basic rendering
        if (typeof formulas === 'undefined' || !formulas || formulas.length === 0) {
            formulaList.innerHTML = '<p>No formulas available</p>';
            return;
        }

        formulaList.innerHTML = '';
        formulas.forEach(formula => {
            const card = createFormulaCard(formula);
            formulaList.appendChild(card);
        });
    }

    /**
     * Create formula card element
     */
    function createFormulaCard(formula) {
        const card = document.createElement('div');
        card.className = 'formula-card';
        card.setAttribute('data-formula-id', formula.id);
        
        card.innerHTML = `
            <h3>${escapeHtml(formula.name)}</h3>
            <p class="formula-description">${escapeHtml(formula.description || '')}</p>
            <div class="formula-equation">${escapeHtml(formula.equation || '')}</div>
        `;

        // Add click handler
        card.addEventListener('click', () => {
            if (typeof window !== 'undefined' && typeof window.selectFormula === 'function') {
                window.selectFormula(formula);
            } else if (typeof selectFormula === 'function') {
                selectFormula(formula);
            }
        });

        return card;
    }

    // ============================================================================
    // LEGACY FUNCTION WRAPPERS (For backward compatibility)
    // ============================================================================

    /**
     * Select formula - delegates to orchestrator
     */
    function selectFormula(formula) {
        if (typeof window !== 'undefined' && typeof window.selectFormula === 'function') {
            return window.selectFormula(formula);
        }
        console.warn('[ui.js] selectFormula: Orchestrator not available');
    }

    /**
     * Perform calculation - delegates to orchestrator
     */
    function performCalculation() {
        if (typeof window !== 'undefined' && typeof window.performCalculation === 'function') {
            return window.performCalculation();
        }
        console.warn('[ui.js] performCalculation: Orchestrator not available');
    }

    /**
     * Switch tab - delegates to orchestrator
     */
    function switchTab(tabName) {
        if (typeof window !== 'undefined' && typeof window.switchTab === 'function') {
            return window.switchTab(tabName);
        }
        console.warn('[ui.js] switchTab: Orchestrator not available');
    }

    /**
     * Switch main tab - delegates to orchestrator
     */
    function switchMainTab(tabName) {
        if (typeof window !== 'undefined' && typeof window.switchMainTab === 'function') {
            return window.switchMainTab(tabName);
        }
        console.warn('[ui.js] switchMainTab: Orchestrator not available');
    }

    // ============================================================================
    // EXPOSE FUNCTIONS GLOBALLY
    // ============================================================================

    if (typeof window !== 'undefined') {
        window.parseNumericValue = parseNumericValue;
        window.safeEvaluateExpression = safeEvaluateExpression;
        window.replaceVariables = replaceVariables;
        window.showError = showError;
        window.renderFormulaList = renderFormulaList;
        window.createFormulaCard = createFormulaCard;
        window.selectFormula = selectFormula;
        window.performCalculation = performCalculation;
        window.switchTab = switchTab;
        window.switchMainTab = switchMainTab;
        window.initializeApp = initializeApp;

        // Expose FORMULA_INSTRUCTIONS if available
        if (typeof FORMULA_INSTRUCTIONS !== 'undefined') {
            window.FORMULA_INSTRUCTIONS = FORMULA_INSTRUCTIONS;
        }
    }

    // Initialize when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    }
})();

