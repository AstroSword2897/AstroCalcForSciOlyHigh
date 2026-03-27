/**
 * CalculationOrchestrator - IMPROVED VERSION
 * Better error handling, validation, and user feedback
 */
export class CalculationOrchestrator {
    constructor(options) {
        this.calculationHistory = [];
        this.MAX_HISTORY = 100;
        this.getCalculator = options.getCalculator;
        this.getFormula = options.getFormula;
        this.getGraphManager = options.getGraphManager;
        this.parseNumericValue = options.parseNumericValue;
        this.displayResult = options.displayResult;
        this.displayError = options.displayError;
        this.updateGraphIfEnabled = options.updateGraphIfEnabled;
        this.updateGraphInterpretation = options.updateGraphInterpretation;
        this.updateSolveIndicators = options.updateSolveIndicators;
        this.unitConverter = options.unitConverter || (typeof window !== 'undefined' && window.UnitConverter ? {
            convertToBase: (value, fromUnit, baseUnit) => window.UnitConverter.convertToBase(value, fromUnit, baseUnit),
            convert: (value, fromUnit, toUnit) => window.UnitConverter.convert(value, fromUnit, toUnit),
            getAlternativeUnits: (baseUnit) => window.UnitConverter.getAlternativeUnits(baseUnit),
            convertAndFormat: (value, unit, opts) => window.UnitConverter.convertAndFormat(value, unit, opts),
            getCanonical: (unit) => window.UnitConverter.getCanonical(unit),
            getUnitCategory: (unit) => window.UnitConverter.getUnitCategory(unit)
        } : null);
        this.globalConstants = options.globalConstants || {};
        this.graphUpdatesEnabled = options.graphUpdatesEnabled ?? false;
    }
    /**
     * Perform calculation with improved error handling and validation
     */
    performCalculation() {
        const startTime = performance.now();
        try {
            const calculator = this.getCalculator();
            const formula = this.getFormula();
            if (!calculator || !formula) {
                this.displayError('⚠️ Please select a formula first');
                return;
            }
            // Collect and validate variable values
            const variableValues = this.collectVariableValues(formula);
            const validation = this.validateVariableValues(variableValues, formula);
            if (!validation.valid) {
                this.displayError(validation.error || 'Invalid input values');
                return;
            }
            const hasAnyValues = Object.values(variableValues).some(v => v !== null && typeof v === 'number');
            // Handle symbolic result if no values
            if (!hasAnyValues) {
                this.handleSymbolicResult(calculator, formula);
                return;
            }
            // Perform calculation
            const result = calculator.solve(variableValues);
            // Validate result
            if (!this.validateResult(result)) {
                this.displayError('Invalid calculation result. Please check your inputs.');
                return;
            }
            // Track calculation
            this.addToHistory(formula.id, result);
            // Display result
            this.displayResult(result);
            // Update UI
            if (this.updateSolveIndicators) {
                this.updateSolveIndicators();
            }
            // Update graph if enabled
            if (this.graphUpdatesEnabled) {
                this.updateGraphAfterCalculation(formula, variableValues, result);
            }
            const duration = performance.now() - startTime;
            console.log(`[CalculationOrchestrator] Calculation completed in ${duration.toFixed(2)}ms`);
        }
        catch (error) {
            this.handleCalculationError(error);
        }
    }
    /**
     * Collect variable values with improved error handling
     */
    collectVariableValues(formula) {
        const variableValues = {};
        const constantSymbols = this.getConstantSymbols(formula);
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));
        for (let i = 0; i < userVariables.length; i++) {
            const variable = userVariables[i];
            try {
                const value = this.collectVariableValue(variable, formula);
                variableValues[variable.symbol] = value;
            }
            catch (error) {
                throw new Error(`Error collecting value for ${variable.symbol}: ${error.message}`);
            }
        }
        return variableValues;
    }
    collectVariableValue(variable, formula) {
        const baseUnit = variable.unit;
        const alternativeUnits = this.unitConverter.getAlternativeUnits(baseUnit);
        // Find which input field has a value
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
                if (value && !this.isNAValue(value)) {
                    foundValue = value;
                    foundUnit = unit;
                    break;
                }
            }
        }
        // Check for N/A checkbox
        const naCheckbox = document.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
        const isNA = naCheckbox?.checked || false;
        // Return null if N/A or empty
        if (!foundValue || this.isNAValue(foundValue) || isNA) {
            return null;
        }
        // Parse and convert
        const parsedValue = this.parseNumericValue(foundValue, foundUnit);
        if (parsedValue === null) {
            throw new Error(`Invalid input: "${foundValue}"`);
        }
        try {
            const baseValue = this.unitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
            return baseValue;
        }
        catch (error) {
            throw new Error(`Unit conversion error: ${error.message}`);
        }
    }
    validateVariableValues(values, formula) {
        const nonNullCount = Object.values(values).filter(v => v !== null).length;
        if (nonNullCount === 0) {
            return { valid: true }; // Symbolic result is valid
        }
        // Check for invalid numbers
        for (const [symbol, value] of Object.entries(values)) {
            if (value !== null && (!isFinite(value) || isNaN(value))) {
                return { valid: false, error: `Invalid value for ${symbol}` };
            }
        }
        return { valid: true };
    }
    validateResult(result) {
        if (!result)
            return false;
        if (result.isSymbolic) {
            return typeof result.result === 'string' && result.result.length > 0;
        }
        if (typeof result.result === 'number') {
            return isFinite(result.result) && !isNaN(result.result);
        }
        return false;
    }
    getConstantSymbols(formula) {
        const constantSymbols = new Set();
        if (formula.constants) {
            Object.keys(formula.constants).forEach(key => {
                constantSymbols.add(key);
                if (key === 'pi' || key === 'π')
                    constantSymbols.add('π');
                if (key === 'G')
                    constantSymbols.add('G');
                if (key === 'c')
                    constantSymbols.add('c');
                if (key === 'σ' || key === 'sigma')
                    constantSymbols.add('σ');
            });
        }
        return constantSymbols;
    }
    isNAValue(value) {
        const lower = value.toLowerCase();
        return lower === 'null' || lower === 'n/a' || lower === 'na' || lower === 'idk' || lower === '';
    }
    handleSymbolicResult(calculator, formula) {
        const constantSymbols = this.getConstantSymbols(formula);
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));
        try {
            const result = calculator.solveSymbolically(userVariables.map(v => v.symbol), {}, userVariables.map(v => v.symbol));
            this.displayResult(result);
        }
        catch (error) {
            console.error('[CalculationOrchestrator] Error getting symbolic result:', error);
            this.displayError('Please enter at least one value to calculate, or leave all empty for a symbolic expression.');
        }
    }
    updateGraphAfterCalculation(formula, variableValues, result) {
        if (!this.updateGraphIfEnabled)
            return;
        const graphManager = this.getGraphManager();
        if (!graphManager || !formula)
            return;
        const graphVariableValues = {
            ...variableValues,
            ...(result.variable && typeof result.result === 'number' ? { [result.variable]: result.result } : {}),
            ...(formula.constants ? Object.fromEntries(Object.entries(formula.constants).map(([k, v]) => [k, typeof v === 'number' ? v : null])) : {}),
            ...Object.fromEntries(Object.entries(this.globalConstants).map(([k, v]) => [k, typeof v === 'number' ? v : null]))
        };
        const graphOptions = {
            calculatedPoint: result.variable && typeof result.result === 'number' ? {
                x: result.result,
                label: `${result.variable} = ${result.result} ${result.unit || ''}`.trim()
            } : undefined,
            equation: formula.equation || formula.name,
            result: result
        };
        this.updateGraphIfEnabled(formula, graphVariableValues, graphOptions);
        if (this.updateGraphInterpretation) {
            this.updateGraphInterpretation(formula, variableValues);
        }
    }
    handleCalculationError(error) {
        console.error('[CalculationOrchestrator] Error:', error);
        let errorMessage = error.message || 'An error occurred during calculation.';
        // Improve error messages
        const improvedMessage = this.improveErrorMessage(errorMessage);
        this.displayError(improvedMessage);
    }
    improveErrorMessage(message) {
        if (message.includes('null values')) {
            return 'You can leave multiple variables empty or mark them as N/A to get a symbolic expression. For a numeric result, leave exactly one variable empty.';
        }
        if (message.includes('must be null') || message.includes('must be unknown')) {
            return 'Please leave at least one variable empty (or set to "null") to solve for it, or mark variables as N/A for symbolic results.';
        }
        if (message.includes('Invalid number') || message.includes('Cannot parse')) {
            return 'Please enter valid numbers. You can use expressions like "2*pi", "1e10", or "45°" for angles. Use "N/A" for variables you don\'t know.';
        }
        if (message.includes('cannot be zero') || message.includes('Division by zero')) {
            return `Division by zero error: ${message}. Please check your input values.`;
        }
        if (message.includes('must be positive')) {
            return `Invalid input: ${message}. Please enter a positive value.`;
        }
        if (message.includes('not a finite number')) {
            return `Calculation error: ${message}. Please check your input values and see the browser console for details.`;
        }
        return message;
    }
    addToHistory(formulaId, result) {
        this.calculationHistory.unshift({
            formula: formulaId,
            timestamp: Date.now(),
            result: result
        });
        if (this.calculationHistory.length > this.MAX_HISTORY) {
            this.calculationHistory = this.calculationHistory.slice(0, this.MAX_HISTORY);
        }
    }
    getCalculationHistory() {
        return [...this.calculationHistory];
    }
}
