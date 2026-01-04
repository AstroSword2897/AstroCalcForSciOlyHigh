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
import { FormulaRenderer } from './modules/rendering/FormulaRenderer';
import { validateCalculator, validateFormula } from './contracts.js';
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
                renderVariableInputs: (formula) => this.renderCalculatorInputs(formula),
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
            // Initialize FormulaRenderer
            this.formulaRenderer = new FormulaRenderer({
                onFormulaClick: (formula) => {
                    this.formulaSelector.selectFormula(formula);
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
            window.renderFormulaList = () => this.renderInitialFormulas();
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
            
            // Render initial formulas
            this.renderInitialFormulas();
            
            // Setup command palette event delegation
            this.setupCommandPaletteEvents();
            
            this.initialized = true;
            console.log('[UIModuleOrchestrator] ✅ Initialized');
        }
        catch (error) {
            console.error('[UIModuleOrchestrator] Initialization error:', error);
            throw error;
        }
    }
    
    /**
     * Setup command palette event delegation
     */
    setupCommandPaletteEvents() {
        const commandInput = document.getElementById('command-palette-input');
        if (!commandInput) {
            console.warn('[UIModuleOrchestrator] Command palette input not found');
            return;
        }
        
        // Input event for search
        commandInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.handleCommandPaletteSearch(query);
            } else {
                this.hideCommandPaletteResults();
            }
        });
        
        // Keyboard navigation
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCommandPaletteResults();
                e.target.value = '';
            }
        });
        
        console.log('[UIModuleOrchestrator] ✅ Command palette events wired');
    }
    
    /**
     * Handle command palette search
     */
    handleCommandPaletteSearch(query) {
        const results = this.searchEngine.search(query);
        this.renderCommandPaletteResults(results);
    }
    
    /**
     * Render command palette results
     */
    renderCommandPaletteResults(results) {
        const palette = document.getElementById('command-palette');
        if (!palette) return;
        
        // Clear existing results
        const overlay = palette.querySelector('.command-palette-overlay');
        if (overlay) {
            overlay.innerHTML = '';
        }
        
        if (results.length === 0) {
            palette.style.display = 'none';
            return;
        }
        
        // Create results container with ID for test
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'command-palette-results';
        resultsContainer.className = 'command-palette-results';
        
        results.slice(0, 10).forEach(result => {
            const item = document.createElement('div');
            item.className = 'command-palette-item';
            item.innerHTML = `
                <div class="formula-name">${result.formula.name}</div>
                <div class="formula-equation">${result.formula.equation}</div>
            `;
            
            // Click handler with preventDefault and stopPropagation
            item.addEventListener('click', (e) => {
                e.preventDefault();     // stop default action
                e.stopPropagation();    // stop bubbling to input
                this.selectFormulaFromCommandPalette(result.formula); // handle selection
            });
            
            resultsContainer.appendChild(item);
        });
        
        if (overlay) {
            overlay.appendChild(resultsContainer);
        }
        
        // Ensure container is visible
        palette.style.display = 'block';
        
        // Setup outside click handler (only once)
        if (!this.commandPaletteOutsideClickHandler) {
            this.commandPaletteOutsideClickHandler = (e) => {
                const commandInput = document.getElementById('command-palette-input');
                if (!resultsContainer.contains(e.target) && e.target !== commandInput) {
                    this.hideCommandPaletteResults();
                }
            };
            document.addEventListener('click', this.commandPaletteOutsideClickHandler);
        }
    }
    
    /**
     * Hide command palette results
     */
    hideCommandPaletteResults() {
        const palette = document.getElementById('command-palette');
        if (palette) {
            palette.style.display = 'none';
        }
    }
    
    /**
     * Select formula from command palette
     */
    selectFormulaFromCommandPalette(formula) {
        this.hideCommandPaletteResults();
        const commandInput = document.getElementById('command-palette-input');
        if (commandInput) {
            commandInput.value = '';
        }
        this.formulaSelector.selectFormula(formula);
    }
    
    /**
     * Render initial formula cards
     */
    renderInitialFormulas() {
        const formulaList = document.getElementById('formula-list');
        if (formulaList && this.formulaRenderer) {
            formulaList.innerHTML = '';
            this.formulaRenderer.renderFormulaCards(this.options.formulas, formulaList);
            console.log('[UIModuleOrchestrator] ✅ Initial formulas rendered');
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
        if (!formula) {
            return values;
        }

        formula.variables.forEach(variable => {
            // Get the input directly by ID (matching renderCalculatorInputs)
            const inputId = `var-${variable.symbol}`;
            const input = document.getElementById(inputId);
            
            if (!input) {
                console.warn(`[UIModuleOrchestrator] Input not found: ${inputId}`);
                values[variable.symbol] = null;
                return;
            }

            const value = input.value.trim();
            
            // Check for N/A checkbox
            const naCheckbox = document.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
            const isNA = naCheckbox?.checked || false;
            
            // Return null if N/A or empty
            if (!value || this.isNAValue(value) || isNA) {
                values[variable.symbol] = null;
                return;
            }
            
            // Parse and convert (using base unit)
            const parsedValue = this.calculationUtils.parseNumericValue(value, variable.unit);
            if (parsedValue === null) {
                console.warn(`[UIModuleOrchestrator] Invalid value for ${variable.symbol}: "${value}"`);
                values[variable.symbol] = null;
                return;
            }
            
            values[variable.symbol] = parsedValue;
        });

        return values;
    }
    
    /**
     * Check if a value represents N/A
     */
    isNAValue(value) {
        const naValues = ['n/a', 'na', 'null', '', 'undefined'];
        return naValues.includes(value.toLowerCase());
    }
    /**
     * Render calculator inputs for a formula
     */
    renderCalculatorInputs(formula) {
        const container = document.getElementById('calculator-screen');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Create input grid
        const grid = document.createElement('div');
        grid.className = 'variable-input-grid';

        // Render each variable
        formula.variables.forEach(variable => {
            const row = document.createElement('div');
            row.className = 'variable-row';

            // Variable label with symbol
            const label = document.createElement('label');
            label.textContent = variable.symbol;
            label.className = 'variable-label';
            label.setAttribute('for', `var-${variable.symbol}`);

            // Input field
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `var-${variable.symbol}`;
            input.className = 'variable-input';
            input.placeholder = 'Enter value';
            input.setAttribute('data-symbol', variable.symbol);

            // N/A checkbox for solving
            const naContainer = document.createElement('div');
            naContainer.className = 'na-container';

            const naCheckbox = document.createElement('input');
            naCheckbox.type = 'checkbox';
            naCheckbox.className = 'na-checkbox';
            naCheckbox.id = `na-${variable.symbol}`;
            naCheckbox.setAttribute('data-symbol', variable.symbol);

            const naLabel = document.createElement('label');
            naLabel.textContent = 'Solve for N/A';
            naLabel.setAttribute('for', `na-${variable.symbol}`);

            naContainer.appendChild(naCheckbox);
            naContainer.appendChild(naLabel);

            // Assemble row
            row.appendChild(label);
            row.appendChild(input);
            row.appendChild(naContainer);
            grid.appendChild(row);
        });

        // Add calculate button (only once)
        const calcButton = document.createElement('button');
        calcButton.id = 'calculate-btn';
        calcButton.className = 'calculate-btn';
        calcButton.textContent = 'Calculate';

        // Assemble final container
        container.appendChild(grid);
        container.appendChild(calcButton);
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
