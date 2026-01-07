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
        this.unitConverter = options.unitConverter;
        this.globalConstants = options.globalConstants || {};
        this.graphUpdatesEnabled = options.graphUpdatesEnabled ?? true;
    }
    /**
     * Perform calculation with improved error handling and validation
     */
    performCalculation() {
        console.log('[CalculationOrchestrator] ⚡ performCalculation() called');
        const startTime = performance.now();
        try {
            console.log('[CalculationOrchestrator] Getting calculator and formula...');
            const calculator = this.getCalculator();
            const formula = this.getFormula();
            console.log('[CalculationOrchestrator] Calculator:', calculator ? '✅ Found' : '❌ Missing');
            console.log('[CalculationOrchestrator] Formula:', formula ? `✅ Found: ${formula.name || formula.id}` : '❌ Missing');
            
            if (!calculator || !formula) {
                const errorMsg = '⚠️ Please select a formula first';
                console.error('[CalculationOrchestrator] ❌', errorMsg, { calculator: !!calculator, formula: !!formula });
                this.displayError(errorMsg);
                return;
            }
            // Collect and validate variable values
            console.log('[CalculationOrchestrator] Collecting variable values...');
            const variableValues = this.collectVariableValues(formula);
            console.log('[CalculationOrchestrator] Collected values:', variableValues);
            
            const validation = this.validateVariableValues(variableValues, formula);
            if (!validation.valid) {
                console.error('[CalculationOrchestrator] ❌ Validation failed:', validation.error);
                this.displayError(validation.error || 'Invalid input values');
                return;
            }
            
            const hasAnyValues = Object.values(variableValues).some(v => v !== null && typeof v === 'number');
            const unknownCount = Object.values(variableValues).filter(v => v === null).length;
            const knownCount = Object.values(variableValues).filter(v => v !== null).length;
            
            console.log(`[CalculationOrchestrator] Values status: ${knownCount} known, ${unknownCount} unknown`);
            
            // If no values provided, show symbolic result
            if (!hasAnyValues) {
                console.log('[CalculationOrchestrator] No values provided, showing symbolic result...');
                this.handleSymbolicResult(calculator, formula, variableValues);
                return;
            }
            
            // Try to solve - calculator.solve() can handle:
            // - 0 unknowns: evaluates the formula
            // - 1 unknown: solves for that variable
            // - Multiple unknowns: returns symbolic result with known values substituted
            console.log(`[CalculationOrchestrator] Attempting calculation: ${knownCount} known, ${unknownCount} unknown`);
            console.log('[CalculationOrchestrator] Calling calculator.solve() with values:', variableValues);
            let result;
            try {
                result = calculator.solve(variableValues);
                console.log('[CalculationOrchestrator] Calculation result:', result);
                
                // Check if result is already symbolic (from calculator's internal fallback)
                if (result && result.isSymbolic) {
                    console.log('[CalculationOrchestrator] Result is symbolic, displaying directly');
                    this.displayResult(result);
                    return;
                }
            } catch (solveError) {
                // Determine if this error is solvable with symbolic calculation
                const shouldFallbackToSymbolic = this.shouldFallbackToSymbolic(solveError, variableValues);
                
                if (shouldFallbackToSymbolic) {
                    console.log('[CalculationOrchestrator] Solve failed, falling back to symbolic calculation:', solveError.message);
                    this.handleSymbolicResult(calculator, formula, variableValues);
                    return;
                }
                throw solveError; // Re-throw if it's not a solvable case
            }
            
            // Validate result
            if (!this.validateResult(result)) {
                // If validation fails but we have some known values, try symbolic as fallback
                const knownCount = Object.values(variableValues).filter(v => v !== null && typeof v === 'number').length;
                if (knownCount > 0) {
                    console.log('[CalculationOrchestrator] Result validation failed, attempting symbolic fallback with known values');
                    this.handleSymbolicResult(calculator, formula, variableValues);
                    return;
                }
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
            console.log(`[CalculationOrchestrator] ✅ Calculation completed in ${duration.toFixed(2)}ms`);
        }
        catch (error) {
            console.error('[CalculationOrchestrator] ❌ Exception during calculation:', error);
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
        // Try multiple input ID patterns to handle different rendering methods
        // Pattern 1: Simple ID (var-symbol)
        let inputId = `var-${variable.symbol}`;
        let input = document.getElementById(inputId);
        
        // Pattern 2: With unit suffix (var-symbol-unit) - used by VariableInputsRenderer
        if (!input && this.unitConverter) {
            const baseUnit = variable.unit;
            const alternativeUnits = this.unitConverter.getAlternativeUnits(baseUnit);
            for (const unit of alternativeUnits) {
                const unitSuffix = unit.replace(/[^a-zA-Z0-9]/g, '_');
                inputId = `var-${variable.symbol}-${unitSuffix}`;
                input = document.getElementById(inputId);
                if (input && input.value.trim()) {
                    break; // Found an input with a value
                }
            }
        }
        
        // Pattern 3: Use data attributes as fallback
        if (!input) {
            input = document.querySelector(`input[data-symbol="${variable.symbol}"]`);
        }
        
        if (!input) {
            console.warn(`[CalculationOrchestrator] Input not found: var-${variable.symbol}`);
            return null;
        }
        
        const value = input.value.trim();
        
        // Return null if empty (no N/A checkbox needed - empty means unknown)
        if (!value || this.isNAValue(value)) {
            return null;
        }
        
        // Get the unit from the input if available
        const inputUnit = input.getAttribute('data-unit') || input.getAttribute('data-base-unit') || variable.unit;
        
        // Parse and convert (using the input's unit or variable's base unit)
        const parsedValue = this.parseNumericValue(value, inputUnit);
        if (parsedValue === null) {
            throw new Error(`Invalid value for ${variable.symbol}: "${value}"`);
        }
        
        return parsedValue;
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
    /**
     * Determine if an error should trigger symbolic calculation fallback
     * @param {Error} error - The error from calculator.solve()
     * @param {Object} variableValues - The variable values that were used
     * @returns {boolean} - True if symbolic fallback should be attempted
     */
    shouldFallbackToSymbolic(error, variableValues) {
        if (!error || !error.message) return false;
        
        const errorMsg = error.message.toLowerCase();
        const knownCount = Object.values(variableValues).filter(v => v !== null && typeof v === 'number').length;
        
        // Cases where symbolic fallback makes sense:
        const fallbackCases = [
            'multiple variables',           // Multiple unknowns
            'cannot solve for multiple',    // Multiple unknowns (alternate wording)
            'too many unknowns',            // Multiple unknowns (alternate wording)
            'solver failed',                // Solver couldn't find numeric solution
            'no solution found',            // No numeric solution exists
            'cannot isolate',               // Cannot isolate variable
            'underdetermined',              // System is underdetermined
            'overdetermined'                // System is overdetermined (might still benefit from symbolic)
        ];
        
        // Check if error message matches any fallback case
        const matchesFallbackCase = fallbackCases.some(caseStr => errorMsg.includes(caseStr));
        
        // Also check if we have partial information (some known values)
        // This allows partial numeric evaluation
        const hasPartialInfo = knownCount > 0 && knownCount < Object.keys(variableValues).length;
        
        // Fallback if:
        // 1. Error matches a known fallback case, OR
        // 2. We have partial information (can do partial evaluation)
        if (matchesFallbackCase || hasPartialInfo) {
            console.log(`[CalculationOrchestrator] Fallback condition met: ${matchesFallbackCase ? 'error case' : 'partial evaluation'} (${knownCount} known values)`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle symbolic calculation result
     * Supports partial numeric evaluation when some values are known
     */
    handleSymbolicResult(calculator, formula, knownVars = {}) {
        try {
            console.log('[CalculationOrchestrator] Getting symbolic result with known vars:', knownVars);
            
            // solveSymbolically expects knownVars as an object mapping variable names to values
            // Filter out null values (unknowns) and pass only known values for partial evaluation
            const filteredKnownVars = {};
            for (const [key, value] of Object.entries(knownVars)) {
                if (value !== null && value !== undefined && typeof value === 'number') {
                    filteredKnownVars[key] = value;
                }
            }
            
            const knownCount = Object.keys(filteredKnownVars).length;
            const totalCount = Object.keys(knownVars).length;
            
            console.log(`[CalculationOrchestrator] Partial evaluation: ${knownCount}/${totalCount} variables known`);
            console.log('[CalculationOrchestrator] Filtered known vars for symbolic solve:', filteredKnownVars);
            
            const result = calculator.solveSymbolically(filteredKnownVars);
            console.log('[CalculationOrchestrator] Symbolic result:', result);
            
            // Enhance result with partial evaluation info if applicable
            if (knownCount > 0 && knownCount < totalCount) {
                result.partialEvaluation = true;
                result.knownVariables = Object.keys(filteredKnownVars);
                result.unknownVariables = Object.keys(knownVars).filter(k => !filteredKnownVars[k]);
                
                // Add helpful context about what was substituted
                if (result.result && typeof result.result === 'string') {
                    const knownVarsList = result.knownVariables.map(v => {
                        const val = filteredKnownVars[v];
                        const formatted = Math.abs(val) >= 1e6 || (Math.abs(val) < 1e-3 && val !== 0) 
                            ? val.toExponential(3) 
                            : val.toString();
                        return `${v} = ${formatted}`;
                    }).join(', ');
                    
                    // Prepend context if not already in the result
                    if (!result.result.includes('Known values:')) {
                        result.result = `Known values: ${knownVarsList}\n${result.result}`;
                    }
                }
            }
            
            this.displayResult(result);
        }
        catch (error) {
            console.error('[CalculationOrchestrator] Error getting symbolic result:', error);
            
            // If we have some known values, show a helpful message about partial evaluation
            const knownCount = Object.values(knownVars).filter(v => v !== null && typeof v === 'number').length;
            if (knownCount > 0) {
                this.displayError(`Unable to generate symbolic expression with ${knownCount} known value(s). Please check your inputs or provide more values.`);
            } else {
                this.displayError('Unable to generate symbolic expression. Please enter values to calculate numerically.');
            }
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
        // Improve error messagesx
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
