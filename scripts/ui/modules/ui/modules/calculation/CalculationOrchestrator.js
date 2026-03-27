/**
 * CalculationOrchestrator - Handles calculation execution and result processing
 * Extracted from ui.js performCalculation function
 */
export class CalculationOrchestrator {
    constructor(options) {
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
     * Perform calculation for current formula
     */
    performCalculation() {
        console.log('[CalculationOrchestrator] ⚡ Called!');
        const calculator = this.getCalculator();
        const formula = this.getFormula();
        if (!calculator || !formula) {
            console.error('[CalculationOrchestrator] ❌ Calculator or formula not available');
            this.displayError('⚠️ Please select a formula first');
            return;
        }
        try {
            // Collect variable values
            const variableValues = this.collectVariableValues(formula);
            const hasAnyValues = Object.values(variableValues).some(v => v !== null && typeof v === 'number');
            // If no values, return symbolic result
            if (!hasAnyValues) {
                this.handleSymbolicResult(calculator, formula);
                return;
            }
            // Perform calculation
            const result = calculator.solve(variableValues);
            console.log('[CalculationOrchestrator] Result:', result);
            this.displayResult(result);
            if (this.updateSolveIndicators) {
                this.updateSolveIndicators();
            }
            // Update graph if enabled
            if (this.graphUpdatesEnabled) {
                this.updateGraphAfterCalculation(formula, variableValues, result);
            }
        }
        catch (error) {
            this.handleCalculationError(error);
        }
    }
    /**
     * Collect variable values from input fields
     */
    collectVariableValues(formula) {
        const variableValues = {};
        const constantSymbols = this.getConstantSymbols(formula);
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));
        userVariables.forEach(variable => {
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
            // Set value
            if (!foundValue || this.isNAValue(foundValue) || isNA) {
                variableValues[variable.symbol] = null;
            }
            else {
                const parsedValue = this.parseNumericValue(foundValue, foundUnit);
                if (parsedValue === null) {
                    throw new Error(`Invalid input for ${variable.symbol}: "${foundValue}"`);
                }
                try {
                    const baseValue = this.unitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
                    variableValues[variable.symbol] = baseValue;
                }
                catch (error) {
                    throw new Error(`Unit conversion error for ${variable.symbol}: ${error.message}`);
                }
            }
        });
        return variableValues;
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
        if (errorMessage.includes('null values')) {
            errorMessage = 'You can leave multiple variables empty or mark them as N/A to get a symbolic expression. For a numeric result, leave exactly one variable empty.';
        }
        else if (errorMessage.includes('must be null') || errorMessage.includes('must be unknown')) {
            errorMessage = 'Please leave at least one variable empty (or set to "null") to solve for it, or mark variables as N/A for symbolic results.';
        }
        else if (errorMessage.includes('Invalid number') || errorMessage.includes('Cannot parse')) {
            errorMessage = 'Please enter valid numbers. You can use expressions like "2*pi", "1e10", or "45°" for angles. Use "N/A" for variables you don\'t know.';
        }
        else if (errorMessage.includes('cannot be zero') || errorMessage.includes('Division by zero')) {
            errorMessage = `Division by zero error: ${errorMessage}. Please check your input values.`;
        }
        else if (errorMessage.includes('must be positive')) {
            errorMessage = `Invalid input: ${errorMessage}. Please enter a positive value.`;
        }
        else if (errorMessage.includes('not a finite number')) {
            errorMessage = `Calculation error: ${errorMessage}. Please check your input values and see the browser console for details.`;
        }
        this.displayError(errorMessage);
    }
}
