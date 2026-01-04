/**
 * FormulaSelector - Handles formula selection, calculator initialization, and UI updates
 * Improved: Better error handling, state management, lifecycle management
 */
export class FormulaSelector {
    constructor(options) {
        this.currentFormula = null;
        this.currentCalculator = null;
        this.createCalculator = options.createCalculator;
        this.getGraphCoordinator = options.getGraphCoordinator;
        this.renderVariableInputs = options.renderVariableInputs;
        this.renderFormulaPresets = options.renderFormulaPresets;
        this.switchTab = options.switchTab;
        this.performCalculation = options.performCalculation;
        this.updateSolveIndicators = options.updateSolveIndicators;
        this.updateGraphIfEnabled = options.updateGraphIfEnabled;
        this.updateGraphInterpretation = options.updateGraphInterpretation;
        this.displayRelatedFormulas = options.displayRelatedFormulas;
        this.cleanupGlobalState = options.cleanupGlobalState;
        this.trackUsage = options.trackUsage;
        this.getCurrentVariableValues = options.getCurrentVariableValues;
        this.graphUpdatesEnabled = options.graphUpdatesEnabled ?? true;
    }
    /**
     * Select a formula and initialize calculator
     */
    selectFormula(formula) {
        if (!formula) {
            console.error('[FormulaSelector] No formula provided');
            return;
        }
        
        try {
            console.log('[FormulaSelector] Selecting formula:', formula.name);
            // Step 1: Cleanup previous state
            this.cleanupPreviousState();
            // Step 2: Track usage for prioritization
            this.trackFormulaUsage(formula);
            // Step 3: Create calculator
            const calculator = this.createCalculator(formula);
            if (!calculator) {
                console.error('[FormulaSelector] Failed to create calculator');
                this.handleSelectionError('Failed to initialize calculator. Please try again.');
                return;
            }
            
            this.currentFormula = formula;
            this.currentCalculator = calculator;
            // Expose to window for backward compatibility
            this.exposeToWindow(formula, calculator);
            // Step 4: Initialize graph
            this.initializeGraph(formula);
            // Step 5: Switch to input screen
            this.switchToInputScreen();
            // Step 6: Populate formula info
            this.populateFormulaInfo(formula);
            // Step 7: Render inputs and presets
            this.renderVariableInputs(formula);
            this.renderFormulaPresets(formula);
            // Step 8: Finalize UI state
            this.finalizeUIState(formula);
            // Step 9: Setup delayed updates
            this.setupDelayedUpdates(formula);
            // Step 10: Display related formulas
            if (this.displayRelatedFormulas) {
                this.displayRelatedFormulas(formula);
            }
            console.log('[FormulaSelector] ✅ Formula selection completed');
        }
        catch (error) {
            console.error('[FormulaSelector] Error selecting formula:', error);
            this.handleSelectionError(error instanceof Error ? error.message : 'Unknown error');
        }
    }
    getCurrentFormula() {
        return this.currentFormula;
    }
    getCurrentCalculator() {
        return this.currentCalculator;
    }
    cleanupPreviousState() {
        if (this.cleanupGlobalState) {
            this.cleanupGlobalState();
        }
    }
    trackFormulaUsage(formula) {
        if (!this.trackUsage)
            return;
        if (formula.concepts) {
            formula.concepts.forEach(concept => this.trackUsage(concept));
        }
        if (formula.keywords) {
            formula.keywords.forEach((keyword) => this.trackUsage(keyword));
        }
    }
    exposeToWindow(formula, calculator) {
        if (typeof window !== 'undefined') {
            window.currentFormula = formula;
            window.calculator = calculator;
        }
        if (typeof globalThis !== 'undefined') {
            globalThis.currentFormula = formula;
            globalThis.calculator = calculator;
        }
    }
    initializeGraph(formula) {
        if (!this.graphUpdatesEnabled)
            return;
        const graphCoordinator = this.getGraphCoordinator();
        if (!graphCoordinator)
            return;
        try {
            // Setup click handler for graph points
            const manager = graphCoordinator.ensureGraphManager();
            if (manager && (typeof manager._onCanvasClick === 'function' || manager.clickable)) {
                manager.onPointClick = (x, y, point) => {
                    const unknownVar = formula.variables.find(v => !(v.symbol in {}));
                    if (unknownVar) {
                        const inputId = `input-${unknownVar.symbol}`;
                        const input = document.getElementById(inputId);
                        if (input) {
                            input.value = point.x.toPrecision(8);
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                };
            }
            // Update graph
            if (this.updateGraphIfEnabled) {
                this.updateGraphIfEnabled(formula, {});
            }
            if (this.updateGraphInterpretation && this.graphUpdatesEnabled) {
                this.updateGraphInterpretation(formula, {});
            }
        }
        catch (error) {
            console.warn('[FormulaSelector] Error initializing graph:', error);
        }
    }
    switchToInputScreen() {
        const formulaSelection = document.getElementById('formula-selection');
        const inputScreen = document.getElementById('input-screen');
        if (formulaSelection) {
            formulaSelection.classList.remove('active');
            formulaSelection.style.setProperty('display', 'none', 'important');
        }
        if (inputScreen) {
            inputScreen.classList.add('active');
            inputScreen.style.setProperty('display', 'block', 'important');
            inputScreen.style.setProperty('visibility', 'visible', 'important');
            inputScreen.style.setProperty('opacity', '1', 'important');
        }
        // Ensure calculator tab is active
        this.switchTab('calculator');
    }
    populateFormulaInfo(formula) {
        const formulaNameEl = document.getElementById('formula-name');
        const equationEl = document.getElementById('formula-equation');
        const formulaDescEl = document.getElementById('formula-description');
        if (formulaNameEl)
            formulaNameEl.textContent = formula.name;
        if (equationEl)
            equationEl.textContent = formula.equation;
        if (formulaDescEl)
            formulaDescEl.textContent = formula.description;
    }
    finalizeUIState(formula) {
        // Ensure calculator tab is visible
        const calcTab = document.getElementById('calculator-tab');
        if (calcTab && !calcTab.classList.contains('active')) {
            calcTab.classList.add('active');
            calcTab.setAttribute('aria-hidden', 'false');
            calcTab.style.setProperty('display', 'block', 'important');
        }
        // Ensure variables container is visible
        const varsContainer = document.getElementById('variables-container');
        if (varsContainer) {
            varsContainer.style.display = 'grid';
            varsContainer.style.visibility = 'visible';
            varsContainer.style.opacity = '1';
            varsContainer.classList.remove('hidden');
        }
        // Ensure tab button is active
        const calculatorTabBtn = document.querySelector('[data-tab="calculator"]');
        if (calculatorTabBtn && !calculatorTabBtn.classList.contains('active')) {
            calculatorTabBtn.classList.add('active');
            calculatorTabBtn.setAttribute('aria-selected', 'true');
        }
        // Clear previous results
        const resultDisplay = document.getElementById('result-display');
        if (resultDisplay) {
            resultDisplay.classList.remove('show');
        }
        // Remove existing instructions
        if (calcTab) {
            const existingInstructions = calcTab.querySelector('.usage-instructions-container');
            if (existingInstructions)
                existingInstructions.remove();
            const existingHints = calcTab.querySelector('.contextual-hints-container');
            if (existingHints)
                existingHints.remove();
        }
    }
    setupDelayedUpdates(formula) {
        // Re-attach calculate button handler
        setTimeout(() => {
            const calcBtn = document.getElementById('calculate-btn');
            if (calcBtn) {
                const newBtn = calcBtn.cloneNode(true);
                calcBtn.parentNode?.replaceChild(newBtn, calcBtn);
                const handler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.performCalculation) {
                        this.performCalculation();
                    }
                };
                newBtn.addEventListener('click', handler);
                newBtn.onclick = handler;
            }
        }, 100);
        // Update solve indicators and graph
        setTimeout(() => {
            if (this.updateSolveIndicators) {
                this.updateSolveIndicators();
            }
            if (this.graphUpdatesEnabled && this.currentFormula && this.getCurrentVariableValues) {
                const values = this.getCurrentVariableValues();
                if (this.updateGraphIfEnabled) {
                    this.updateGraphIfEnabled(this.currentFormula, values);
                }
            }
        }, 150);
    }
    handleSelectionError(message) {
        console.error('[FormulaSelector] Selection error:', message);
        try {
            const inputScreen = document.getElementById('input-screen');
            if (inputScreen) {
                inputScreen.classList.add('active');
                inputScreen.style.setProperty('display', 'block', 'important');
            }
        }
        catch (e) {
            console.error('[FormulaSelector] Failed to show input screen:', e);
        }
    }
}
