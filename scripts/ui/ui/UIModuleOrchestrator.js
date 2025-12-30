/**
 * UIModuleOrchestrator - IMPROVED VERSION
 * Better dependency injection, error handling, and initialization
 */
import { SearchEngine } from './modules/search/SearchEngine';
import { CalculationOrchestrator } from './modules/calculation/CalculationOrchestrator';
import { TabManager } from './modules/tabs/TabManager';
import { GraphCoordinator } from './modules/graph/GraphCoordinator';
import { FormulaSelector } from './modules/formula/FormulaSelector';
import { EventCoordinator } from './modules/events/EventCoordinator';
import { CalculationUtils } from './modules/utils/CalculationUtils';
import { FormattingUtils } from './modules/utils/FormattingUtils';
export class UIModuleOrchestrator {
    constructor(options) {
        this.initialized = false;
        this.options = options;
        this.formattingUtils = new FormattingUtils();
        this.calculationUtils = new CalculationUtils(options.ExpressionParser, options.SafeMathEvaluator);
        this.initializeModules();
        this.wireModules();
    }
    initializeModules() {
        try {
            // Initialize SearchEngine
            this.searchEngine = new SearchEngine({
                formulas: this.options.formulas,
                formulaCategories: this.options.formulaCategories,
                cache: this.options.searchCache,
                performanceOptimizer: this.options.performanceOptimizer,
                semanticSearchSystem: this.options.semanticSearchSystem
            });
            // Initialize GraphCoordinator
            this.graphCoordinator = new GraphCoordinator({
                enabled: true,
                containerId: 'desmos-graph',
                tabId: 'graph-tab',
                createGraphManager: () => {
                    if (this.options.EnhancedOfflineGraphManagerV2) {
                        const manager = new this.options.EnhancedOfflineGraphManagerV2({
                            containerId: 'desmos-graph',
                            tabId: 'graph-tab'
                        });
                        // Store in window for backward compatibility
                        window.graphManager = manager;
                        return manager;
                    }
                    return null;
                },
                getGraphManager: () => {
                    return window.graphManager || null;
                },
                onGraphError: (error, formula) => {
                    console.error('[Orchestrator] Graph error:', error);
                }
            });
            // Initialize TabManager
            this.tabManager = new TabManager({
                onMainTabSwitch: (tabName) => {
                    console.log('[Orchestrator] Main tab switched:', tabName);
                },
                onTabSwitch: (tabName) => {
                    if (tabName === 'graph') {
                        const formula = this.formulaSelector?.getCurrentFormula();
                        if (formula) {
                            this.graphCoordinator.forceUpdateOnTabActivation(formula, () => this.getCurrentVariableValues());
                        }
                    }
                },
                initFormulaExplorer: () => {
                    if (typeof window.initFormulaExplorer === 'function') {
                        window.initFormulaExplorer();
                    }
                },
                initStellarClassifier: () => {
                    if (this.options.StellarClassifier) {
                        return new this.options.StellarClassifier();
                    }
                    return null;
                },
                onGraphTabActivated: () => {
                    const formula = this.formulaSelector?.getCurrentFormula();
                    if (formula) {
                        const values = this.getCurrentVariableValues();
                        this.graphCoordinator.updateGraphIfEnabled(formula, values);
                    }
                }
            });
            // Initialize CalculationOrchestrator
            this.calculationOrchestrator = new CalculationOrchestrator({
                getCalculator: () => this.formulaSelector?.getCurrentCalculator() || null,
                getFormula: () => this.formulaSelector?.getCurrentFormula() || null,
                getGraphManager: () => this.graphCoordinator.ensureGraphManager(),
                parseNumericValue: (input, unit) => this.calculationUtils.parseNumericValue(input, unit),
                displayResult: (result) => this.displayResult(result),
                displayError: (message) => this.displayError(message),
                updateGraphIfEnabled: (formula, values, options) => {
                    this.graphCoordinator.updateGraphIfEnabled(formula, values, options);
                },
                updateGraphInterpretation: (formula, values) => {
                    // Handle graph interpretation if needed
                    if (typeof window.updateGraphInterpretation === 'function') {
                        window.updateGraphInterpretation(formula, values);
                    }
                },
                updateSolveIndicators: () => {
                    if (typeof window.updateSolveIndicators === 'function') {
                        window.updateSolveIndicators();
                    }
                },
                unitConverter: this.options.UnitConverter,
                globalConstants: this.options.globalConstants,
                graphUpdatesEnabled: true
            });
            // Initialize FormulaSelector
            this.formulaSelector = new FormulaSelector({
                createCalculator: (formula) => {
                    if (this.options.FormulaCalculatorClass) {
                        return new this.options.FormulaCalculatorClass(formula);
                    }
                    return null;
                },
                getGraphCoordinator: () => this.graphCoordinator,
                renderVariableInputs: (formula) => {
                    if (typeof window.renderVariableInputs === 'function') {
                        window.renderVariableInputs(formula);
                    }
                },
                renderFormulaPresets: (formula) => {
                    if (typeof window.renderFormulaPresets === 'function') {
                        window.renderFormulaPresets(formula);
                    }
                },
                switchTab: (tabName) => this.tabManager.switchTab(tabName),
                performCalculation: () => this.calculationOrchestrator.performCalculation(),
                updateSolveIndicators: () => {
                    if (typeof window.updateSolveIndicators === 'function') {
                        window.updateSolveIndicators();
                    }
                },
                updateGraphIfEnabled: (formula, values) => {
                    this.graphCoordinator.updateGraphIfEnabled(formula, values);
                },
                updateGraphInterpretation: (formula, values) => {
                    if (typeof window.updateGraphInterpretation === 'function') {
                        window.updateGraphInterpretation(formula, values);
                    }
                },
                getCurrentVariableValues: () => this.getCurrentVariableValues(),
                graphUpdatesEnabled: true,
                cleanupGlobalState: () => {
                    if (typeof window.cleanupGlobalState === 'function') {
                        window.cleanupGlobalState();
                    }
                },
                trackUsage: (term) => {
                    if (this.options.semanticSearchSystem?.trackUsage) {
                        this.options.semanticSearchSystem.trackUsage(term);
                    }
                },
                displayRelatedFormulas: (formula) => {
                    if (typeof window.displayRelatedFormulas === 'function') {
                        window.displayRelatedFormulas(formula);
                    }
                }
            });
            // Initialize EventCoordinator
            this.eventCoordinator = new EventCoordinator({
                onBackButton: () => this.handleBackButton(),
                onMainTabSwitch: (tabName) => this.tabManager.switchMainTab(tabName),
                onSubTabSwitch: (tabName) => this.tabManager.switchTab(tabName),
                onCalculate: () => this.calculationOrchestrator.performCalculation(),
                onFormulaCardClick: (formulaId) => {
                    const formula = this.options.formulas.find(f => f.id === formulaId);
                    if (formula) {
                        this.formulaSelector.selectFormula(formula);
                    }
                },
                onClassify: () => {
                    if (typeof window.performClassification === 'function') {
                        window.performClassification();
                    }
                },
                onMainClassify: () => {
                    if (typeof window.performMainClassification === 'function') {
                        window.performMainClassification();
                    }
                },
                setupGraphControls: () => {
                    if (typeof window.setupGraphControls === 'function') {
                        window.setupGraphControls();
                    }
                }
            });
            console.log('[UIModuleOrchestrator] ✅ All modules initialized');
        }
        catch (error) {
            console.error('[UIModuleOrchestrator] Error initializing modules:', error);
            throw error;
        }
    }
    wireModules() {
        // Expose to window for backward compatibility
        if (typeof window !== 'undefined') {
            window.uiOrchestrator = this;
            window.selectFormula = (formula) => this.formulaSelector.selectFormula(formula);
            window.performCalculation = () => this.calculationOrchestrator.performCalculation();
            window.switchTab = (tabName) => this.tabManager.switchTab(tabName);
            window.switchMainTab = (tabName) => this.tabManager.switchMainTab(tabName);
            window.searchEngine = this.searchEngine;
            window.graphCoordinator = this.graphCoordinator;
        }
    }
    /**
     * Initialize the UI system
     */
    initialize() {
        if (this.initialized) {
            console.warn('[UIModuleOrchestrator] Already initialized');
            return;
        }
        try {
            this.eventCoordinator.setupAll();
            this.initialized = true;
            console.log('[UIModuleOrchestrator] ✅ Initialized');
        }
        catch (error) {
            console.error('[UIModuleOrchestrator] Initialization error:', error);
            throw error;
        }
    }
    /**
     * Search formulas
     */
    searchFormulas(query) {
        return this.searchEngine.search(query);
    }
    /**
     * Get current variable values from DOM
     */
    getCurrentVariableValues() {
        const values = {};
        const formula = this.formulaSelector.getCurrentFormula();
        if (!formula)
            return values;
        formula.variables.forEach(variable => {
            const baseUnit = variable.unit;
            const alternativeUnits = this.options.UnitConverter.getAlternativeUnits(baseUnit);
            let foundValue = null;
            let foundUnit = null;
            for (let i = 0; i < alternativeUnits.length; i++) {
                const unit = alternativeUnits[i];
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                let input = document.getElementById(inputId);
                if (!input) {
                    input = document.querySelector(`input[data-symbol="${variable.symbol}"][data-unit-index="${i}"]`);
                }
                if (input) {
                    const value = input.value.trim();
                    if (value && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'n/a') {
                        foundValue = value;
                        foundUnit = unit;
                        break;
                    }
                }
            }
            if (foundValue && foundUnit) {
                const parsed = this.calculationUtils.parseNumericValue(foundValue, foundUnit);
                if (parsed !== null) {
                    try {
                        values[variable.symbol] = this.options.UnitConverter.convertToBase(parsed, foundUnit, baseUnit);
                    }
                    catch (e) {
                        values[variable.symbol] = null;
                    }
                }
                else {
                    values[variable.symbol] = null;
                }
            }
            else {
                values[variable.symbol] = null;
            }
        });
        return values;
    }
    /**
     * Display result
     */
    displayResult(result) {
        if (typeof window.resultDisplayRenderer !== 'undefined') {
            const formula = this.formulaSelector.getCurrentFormula();
            window.resultDisplayRenderer.displayResult(result, formula);
        }
        else {
            // Fallback display
            const resultDisplay = document.getElementById('result-display');
            if (resultDisplay) {
                const formatted = this.formattingUtils.formatResult(typeof result.result === 'number' ? result.result : result.result, result.unit || '');
                resultDisplay.innerHTML = `<div class="result">${this.formattingUtils.escapeHtml(formatted)}</div>`;
            }
        }
    }
    /**
     * Display error
     */
    displayError(message) {
        const formatted = this.formattingUtils.formatErrorMessage({ message });
        const resultDisplay = document.getElementById('result-display');
        if (resultDisplay) {
            resultDisplay.innerHTML = `<div class="error-message">${this.formattingUtils.escapeHtml(formatted)}</div>`;
        }
    }
    /**
     * Handle back button
     */
    handleBackButton() {
        const inputScreen = document.getElementById('input-screen');
        const formulaSelection = document.getElementById('formula-selection');
        if (inputScreen) {
            inputScreen.classList.remove('active');
            inputScreen.style.setProperty('display', 'none', 'important');
        }
        if (formulaSelection) {
            formulaSelection.classList.add('active');
            formulaSelection.style.setProperty('display', 'block', 'important');
        }
    }
    /**
     * Update formulas list (for dynamic updates)
     */
    updateFormulas(formulas) {
        this.options.formulas = formulas;
        this.searchEngine.updateFormulas(formulas);
    }
    /**
     * Get module instances (for testing/debugging)
     */
    getModules() {
        return {
            searchEngine: this.searchEngine,
            calculationOrchestrator: this.calculationOrchestrator,
            tabManager: this.tabManager,
            graphCoordinator: this.graphCoordinator,
            formulaSelector: this.formulaSelector,
            eventCoordinator: this.eventCoordinator
        };
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.eventCoordinator.cleanup();
        this.graphCoordinator.cleanup();
        this.initialized = false;
    }
}
