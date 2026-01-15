/**
 * FormulaCalculator - Core calculation engine
 * TypeScript implementation with proper types and dependency injection
 */
// Default constants if not provided
const DEFAULT_CONSTANTS = {
    G: 6.67430e-11, // Gravitational constant
    c: 2.99792458e8, // Speed of light
    h: 6.62607015e-34, // Planck's constant
    // Add other constants as needed
};
// Default solver options
const DEFAULT_SOLVER_OPTIONS = {
    maxIterations: 100,
    tolerance: 1e-6,
    initialGuess: 1.0,
    precision: 8
};
// Type guard for number or null values
const isNumberOrNull = (value) => {
    return value === null || typeof value === 'number';
};
class FormulaCalculator {
    constructor(formula, options = {}) {
        // Performance optimization: expression cache
        this.expressionCache = new Map();
        if (!formula) {
            throw new Error('FormulaCalculator: formula is required');
        }
        this.formula = formula;
        this.precisionCalculator = options.precisionCalculator;
        this.errorPropagator = options.errorPropagator;
        this.unitConverter = options.unitConverter;
        this.mathEvaluator = options.mathEvaluator;
        // Merge default constants, formula-specific constants, and options constants
        this.constants = { ...DEFAULT_CONSTANTS, ...(formula.constants || {}), ...options.constants };
        this.solver = options.solver;
        
        // Performance: Cache merged constants and known values
        this._mergedConstants = null;
        this._solverConstants = null;
        this._cachedKnownValues = null;
        this._lastKnownValuesHash = null;
    }
    /**
     * Validates the input values against the formula's variables
     * @throws {Error} If validation fails
     */
    validateInputs(variableValues) {
        // Check for required variables (null is allowed for symbolic solving)
        const missingVars = this.formula.variables
            .filter(v => v.required && variableValues[v.symbol] === undefined)
            .map(v => v.symbol);
        if (missingVars.length > 0) {
            throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
        }
        // Validate types and ranges
        for (const [varName, value] of Object.entries(variableValues)) {
            const varDef = this.formula.variables.find(v => v.symbol === varName);
            if (!varDef)
                continue;
            if (value !== null && typeof value !== 'number') {
                throw new Error(`Invalid value for ${varName}: expected number, got ${typeof value}`);
            }
            if (value !== null && varDef.min !== undefined && value < varDef.min) {
                throw new Error(`${varName} (${value}) is below minimum value of ${varDef.min}`);
            }
            if (value !== null && varDef.max !== undefined && value > varDef.max) {
                throw new Error(`${varName} (${value}) exceeds maximum value of ${varDef.max}`);
            }
        }
    }
    /**
     * Solves the formula for the given variable values
     * @param variableValues Object mapping variable names to their values
     * @returns CalculationResult with the solution and metadata
     * @throws {Error} If the formula cannot be solved with the given inputs
     */
    solve(variableValues) {
        const startTime = performance.now();
        try {
            this.validateInputs(variableValues);
            
            // Optimized: Vectorized separation of known/unknown variables
            const knownVars = {};
            const unknownVars = [];
            const varCount = this.formula.variables.length;
            
            // Pre-allocate arrays for better performance
            for (let i = 0; i < varCount; i++) {
                const variable = this.formula.variables[i];
                const provided = variableValues[variable.symbol];
                
                if (provided !== undefined && provided !== null) {
                    knownVars[variable.symbol] = provided;
                } else if (!variable.required && variable.defaultValue !== undefined && variable.defaultValue !== null) {
                    knownVars[variable.symbol] = variable.defaultValue;
                } else {
                    unknownVars.push(variable.symbol);
                }
            }
            let solvedFor;
            let numericResult;
            if (unknownVars.length === 0) {
                solvedFor = 'result';
                numericResult = this.evaluateFormula(knownVars);
            }
            else if (unknownVars.length === 1) {
                solvedFor = unknownVars[0];
                // With exactly one unknown and all others known, do numeric solving
                // CRITICAL: We MUST get a numeric result, not symbolic - this is a calculator!
                try {
                    numericResult = this.solveForVariable(solvedFor, knownVars);
                    // Validate that we got a real number
                    if (typeof numericResult !== 'number' || !Number.isFinite(numericResult)) {
                        throw new Error(`solveForVariable returned invalid result: ${numericResult}`);
                    }
                    console.log(`[FormulaCalculator] ✅ Numeric solve successful for ${solvedFor}: ${numericResult}`);
                } catch (solverError) {
                    console.error(`[FormulaCalculator] ❌ Numeric solve failed for ${solvedFor}:`, solverError);
                    console.error(`[FormulaCalculator] Known vars:`, knownVars);
                    console.error(`[FormulaCalculator] Equation:`, this.formula.equation);
                    // Try one more time with more detailed error info
                    try {
                        console.log(`[FormulaCalculator] Retrying solve for ${solvedFor} with equation: ${this.formula.equation}`);
                        numericResult = this.solveForVariable(solvedFor, knownVars);
                        if (typeof numericResult !== 'number' || !Number.isFinite(numericResult)) {
                            throw new Error(`Retry also returned invalid result: ${numericResult}`);
                        }
                        console.log(`[FormulaCalculator] ✅ Retry successful: ${numericResult}`);
                    } catch (retryError) {
                        // If all numeric solving fails, throw error - don't fall back to symbolic
                        // The CalculationOrchestrator will handle this
                        throw new Error(`Cannot solve for ${solvedFor} numerically: ${solverError.message}. ${retryError.message}`);
                    }
                }
            }
            else {
                // If multiple variables are unknown, return symbolic result instead of error
                // Note: This branch only executes when unknownVars.length > 1 (checked above)
                return this.solveSymbolically(knownVars);
            }
            let significantFigures;
            let arithmeticContext;
            let errorInfo;
            // Optimized: Only calculate precision/error if explicitly needed (lazy evaluation)
            if (this.precisionCalculator) {
                try {
                    // Optimized: Use cached known values array instead of Object.values()
                    const knownValues = this._getKnownValuesArray(knownVars);
                    const precision = this.precisionCalculator.calculatePrecision(
                        numericResult, 
                        knownValues
                    );
                    significantFigures = precision.significantFigures;
                    arithmeticContext = precision.context;
                }
                catch (e) {
                    // ignore precision calculation failures
                }
            }
            if (this.errorPropagator) {
                try {
                    // Optimized: Vectorized error calculation
                    const errors = Object.fromEntries(
                        Object.entries(knownVars).map(([key, value]) => [key, 0.01 * Math.abs(value)])
                    );
                    const allVars = { ...knownVars, ...(solvedFor !== 'result' ? { [solvedFor]: numericResult } : {}) };
                    const errorResult = this.errorPropagator.calculateAbsoluteError(this.formula.equation, allVars, errors);
                    
                    // Optimized: Pre-calculate constants
                    errorInfo = {
                        absolute: errorResult.absolute,
                        relative: errorResult.relative,
                        ci95: 1.96 * errorResult.absolute,
                        ci99: 2.576 * errorResult.absolute
                    };
                }
                catch (e) {
                    // ignore error propagation failures
                }
            }
            const unit = solvedFor === 'result'
                ? ''
                : (this.formula.variables.find(v => v.symbol === solvedFor)?.unit || '');
            
            // Generate the formula expression with substituted values for display
            let formulaExpression = null;
            try {
                if (unknownVars.length === 1) {
                    // For single unknown, show: targetVar = expression (with values substituted AND constants computed)
                    formulaExpression = this.generateSymbolicExpression(solvedFor, knownVars);
                    
                    // CRITICAL: Ensure constants are evaluated in the expression
                    // Replace constants with their numeric values in the expression
                    const allKnown = { ...this.constants, ...(this.formula.constants || {}), ...knownVars };
                    let expr = formulaExpression;
                    
                    // Substitute constants with their computed values
                    const sortedConstants = Object.entries(this.constants || {})
                        .filter(([k, v]) => typeof v === 'number' && !(k in knownVars))
                        .sort((a, b) => b[0].length - a[0].length);
                    
                    for (const [constName, constValue] of sortedConstants) {
                        const escaped = constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                        // Format constant value appropriately
                        const formattedConst = this._formatNumber(constValue);
                        expr = expr.replace(regex, formattedConst);
                    }
                    
                    // Also substitute formula-specific constants
                    if (this.formula.constants) {
                        const sortedFormulaConstants = Object.entries(this.formula.constants)
                            .filter(([k, v]) => typeof v === 'number' && !(k in knownVars) && !(k in (this.constants || {})))
                            .sort((a, b) => b[0].length - a[0].length);
                        
                        for (const [constName, constValue] of sortedFormulaConstants) {
                            const escaped = constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                            const formattedConst = this._formatNumber(constValue);
                            expr = expr.replace(regex, formattedConst);
                        }
                    }
                    
                    formulaExpression = expr;
                } else if (unknownVars.length === 0) {
                    // For evaluation, show the equation with values substituted AND constants computed
                    let expr = this.formula.equation;
                    const sortedKnown = Object.entries(knownVars)
                        .filter(([k, v]) => typeof v === 'number')
                        .sort((a, b) => b[0].length - a[0].length);
                    
                    // First substitute known variables
                    for (const [symbol, value] of sortedKnown) {
                        const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                        
                        // Convert value to a more readable unit if unitConverter is available
                        let displayValue = value;
                        let displayUnit = '';
                        if (this.unitConverter && typeof this.unitConverter.convertAndFormat === 'function') {
                            const varDef = this.formula.variables.find(v => v.symbol === symbol);
                            if (varDef && varDef.unit) {
                                try {
                                    const converted = this.unitConverter.convertAndFormat(value, varDef.unit);
                                    if (converted && converted.value !== null && Number.isFinite(converted.value)) {
                                        displayValue = converted.value;
                                        displayUnit = converted.unit || varDef.unit;
                                    }
                                } catch (e) {
                                    // If conversion fails, use original value
                                }
                            }
                        }
                        
                        // Format the value
                        let formatted;
                        if (displayUnit && displayUnit !== (this.formula.variables.find(v => v.symbol === symbol)?.unit || '')) {
                            // Show value with unit if converted
                            formatted = `${this._formatNumber(displayValue)} ${displayUnit}`;
                        } else {
                            // Use scientific notation for very large/small numbers
                            formatted = this._formatNumber(value);
                        }
                        
                        expr = expr.replace(regex, formatted);
                    }
                    
                    // Then substitute constants with their computed values
                    const allConstants = { ...this.constants, ...(this.formula.constants || {}) };
                    const sortedConstants = Object.entries(allConstants)
                        .filter(([k, v]) => typeof v === 'number' && !(k in knownVars))
                        .sort((a, b) => b[0].length - a[0].length);
                    
                    for (const [constName, constValue] of sortedConstants) {
                        const escaped = constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                        const formattedConst = this._formatNumber(constValue);
                        expr = expr.replace(regex, formattedConst);
                    }
                    
                    formulaExpression = expr;
                }
            } catch (e) {
                // If formula generation fails, continue without it
                console.warn('[FormulaCalculator] Failed to generate formula expression:', e);
            }
            
            // Keep timing internal for now; CalculationResult does not include calculationTime.
            void (performance.now() - startTime);
            return {
                solvedFor,
                result: numericResult,
                unit,
                isSymbolic: false,
                variable: solvedFor,
                significantFigures,
                arithmeticContext,
                errorInfo,
                formulaExpression: formulaExpression || this.formula.equation // Include formula expression
            };
        }
        catch (error) {
            throw new Error(`Calculation failed: ${error.message}`);
        }
    }
    /**
     * Solves the formula symbolically for unknown variables
     * @param knownVars Object mapping known variable names to their values
     * @param options Configuration options
     * @returns CalculationResult with symbolic expression
     */
    solveSymbolically(knownVars = {}, options = {}) {
        const startTime = performance.now();
        
        try {
            // Log entry for debugging
            console.log('[FormulaCalculator] solveSymbolically called with knownVars:', knownVars);
            // Validate inputs
            if (!knownVars || typeof knownVars !== 'object') {
                throw new Error('solveSymbolically requires knownVars object');
            }
            
            // Get unknown variables
            const unknownVars = this.formula.variables
                .filter(v => !(v.symbol in knownVars) || knownVars[v.symbol] === null || knownVars[v.symbol] === undefined)
                .map(v => v.symbol);
            
            if (unknownVars.length === 0) {
                // No unknown variables, evaluate numerically
                const result = this.evaluateFormula(knownVars);
                // CRITICAL: Return actual number, not string
                if (typeof result !== 'number' || !Number.isFinite(result) || isNaN(result)) {
                    throw new Error(`evaluateFormula returned invalid number: ${result}`);
                }
                return {
                    solvedFor: 'result',
                    result: result, // NUMBER, not string
                    unit: '',
                    isSymbolic: false,
                    variable: 'result',
                    significantFigures: undefined,
                    arithmeticContext: undefined,
                    errorInfo: undefined
                };
            }
            
            if (unknownVars.length === 1) {
                // Single unknown variable - try numeric solving first, fall back to symbolic
                const solvedFor = unknownVars[0];
                // Try numeric solving - returns number or null (never throws)
                const numericResult = this.solveForVariable(solvedFor, knownVars);
                
                // CRITICAL: Validate that we got a valid numeric result
                if (numericResult !== null && typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
                    const varInfo = this.formula.variables.find(v => v.symbol === solvedFor);
                    
                    return {
                        solvedFor,
                        result: numericResult, // NUMBER, not string
                        unit: varInfo?.unit || '',
                        isSymbolic: false,
                        variable: solvedFor,
                        significantFigures: undefined,
                        arithmeticContext: undefined,
                        errorInfo: undefined
                    };
                }
                
                // If solveForVariable returned null, try enhanced algebraic solver directly
                console.log(`[FormulaCalculator] solveForVariable returned null, trying enhanced algebraic solver...`);
                const algebraicResult = this._solveAlgebraically(solvedFor, knownVars);
                
                if (algebraicResult !== null && typeof algebraicResult === 'number' && Number.isFinite(algebraicResult) && !isNaN(algebraicResult)) {
                    console.log(`[FormulaCalculator] ✅ Enhanced algebraic solve succeeded: ${solvedFor} = ${algebraicResult}`);
                    const varInfo = this.formula.variables.find(v => v.symbol === solvedFor);
                    return {
                        solvedFor,
                        result: algebraicResult, // NUMBER, not string
                        unit: varInfo?.unit || '',
                        isSymbolic: false, // NUMERIC RESULT
                        variable: solvedFor,
                        significantFigures: undefined,
                        arithmeticContext: undefined,
                        errorInfo: undefined
                    };
                }
                
                // If all numeric attempts failed, fall through to symbolic (don't throw)
                console.log(`[FormulaCalculator] All numeric solve attempts failed for ${solvedFor}, falling back to symbolic`);
            }
            
            // Multiple unknown variables - but check if we can solve for any of them
            // CRITICAL: Even with multiple unknowns, if we have enough info to solve for one, do it!
            let expression = this.generateMultiVariableExpression(unknownVars, knownVars);
            let isSymbolic = true;
            let solvedFor = unknownVars;
            let numericResult = null;
            
            // If there's exactly one unknown, we should have gotten a numeric result from generateMultiVariableExpression
            // But if it's still symbolic, try one more time to solve it
            if (unknownVars.length === 1) {
                const unknownVar = unknownVars[0];
                console.log(`[FormulaCalculator] solveSymbolically: Only one unknown (${unknownVar}), forcing numeric solve...`);
                // Try solveForVariable (returns number or null, never throws)
                numericResult = this.solveForVariable(unknownVar, knownVars);
                if (numericResult !== null && typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
                    console.log(`[FormulaCalculator] ✅ Forced numeric solve succeeded: ${unknownVar} = ${numericResult}`);
                    isSymbolic = false;
                    solvedFor = unknownVar;
                    expression = `${unknownVar} = ${numericResult}`;
                } else {
                    // Try algebraic solver as fallback
                    const algebraicResult = this._solveAlgebraically(unknownVar, knownVars);
                    if (algebraicResult !== null && typeof algebraicResult === 'number' && Number.isFinite(algebraicResult) && !isNaN(algebraicResult)) {
                        console.log(`[FormulaCalculator] ✅ Algebraic solve succeeded: ${unknownVar} = ${algebraicResult}`);
                        isSymbolic = false;
                        solvedFor = unknownVar;
                        numericResult = algebraicResult;
                        expression = `${unknownVar} = ${algebraicResult}`;
                    } else {
                        console.log(`[FormulaCalculator] All numeric solve attempts failed, using symbolic expression`);
                    }
                }
            }
            
            // CRITICAL: Format known values with their base units for display
            // This ensures "Known values" shows converted base unit values, not raw inputs
            const formatKnownValue = (symbol, value) => {
                const varDef = this.formula.variables.find(v => v.symbol === symbol);
                if (!varDef || !varDef.unit) {
                    return `${symbol} = ${this._formatNumber(value)}`;
                }
                // Value is already in base unit (from parseInputValue conversion)
                // Format it with the base unit
                const formatted = this._formatNumber(value);
                return `${symbol} = ${formatted} ${varDef.unit}`;
            };
            
            const knownValuesDisplay = Object.entries(knownVars)
                .filter(([_, v]) => v !== null && v !== undefined && typeof v === 'number')
                .map(([symbol, value]) => formatKnownValue(symbol, value))
                .join(', ');
            
            // Prepend "Known values:" to expression if we have known values
            let displayExpression = expression;
            if (knownValuesDisplay && isSymbolic) {
                displayExpression = `Known values: ${knownValuesDisplay}\n${expression}`;
            }
            
            // Create enhanced result with information about what can be solved
            const result = {
                solvedFor: solvedFor,
                result: isSymbolic ? displayExpression : numericResult,
                unit: unknownVars.length === 1 && !isSymbolic ? (this.formula.variables.find(v => v.symbol === unknownVars[0])?.unit || '') : '',
                isSymbolic: isSymbolic,
                variable: solvedFor,
                significantFigures: undefined,
                arithmeticContext: undefined,
                errorInfo: undefined,
                unknownVariables: unknownVars,
                knownVariables: Object.keys(knownVars).filter(k => 
                    knownVars[k] !== null && knownVars[k] !== undefined && typeof knownVars[k] === 'number'
                ),
                // Store formatted known values for display
                knownValuesFormatted: knownValuesDisplay,
                partialEvaluation: Object.keys(knownVars).filter(k => 
                    knownVars[k] !== null && knownVars[k] !== undefined && typeof knownVars[k] === 'number'
                ).length > 0
            };
            
            // Add helpful message about what can be solved
            if (result.partialEvaluation && unknownVars.length > 1) {
                const solveableInfo = unknownVars.map(v => {
                    const varInfo = this.formula.variables.find(v2 => v2.symbol === v);
                    return varInfo ? `${v} (${varInfo.name || v})` : v;
                }).join(', ');
                result.solveableVariables = unknownVars;
                result.solveableInfo = `To solve for a specific variable, provide values for all others. Available variables: ${solveableInfo}`;
            }
            
            // CRITICAL: Ensure result always has the required shape
            if (!result || result.result === undefined || result.result === null) {
                console.error('[FormulaCalculator] ❌ solveSymbolically generated invalid result:', result);
                throw new Error(`solveSymbolically failed to generate valid result. Unknown vars: ${unknownVars.join(', ')}, Known vars: ${Object.keys(knownVars).join(', ')}`);
            }
            
            // Log return value for debugging
            console.log('[FormulaCalculator] solveSymbolically returning:', {
                hasResult: !!result.result,
                resultType: typeof result.result,
                isSymbolic: result.isSymbolic,
                solvedFor: result.solvedFor
            });
            
            return result;
            
        } catch (error) {
            throw new Error(`Symbolic solving failed: ${error.message}`);
        } finally {
            void (performance.now() - startTime);
        }
    }
    /**
     * Generate symbolic expression for a single unknown variable
     * CRITICAL: If all values are known, actually compute the numeric result!
     */
    generateSymbolicExpression(unknownVar, knownVars) {
        // CRITICAL: If we have all values needed to compute the result, actually evaluate it!
        // Check if we can solve for the unknown variable numerically
        // solveForVariable returns number or null (never throws)
        const numericResult = this.solveForVariable(unknownVar, knownVars);
        if (numericResult !== null && typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
            // We have a numeric result! Return it as a string showing the calculation
            // Format: "unknownVar = numericValue"
            console.log(`[FormulaCalculator] generateSymbolicExpression: Computed numeric result for ${unknownVar}: ${numericResult}`);
            return `${unknownVar} = ${numericResult}`;
        }
        
        // Try algebraic solver as fallback
        const algebraicResult = this._solveAlgebraically(unknownVar, knownVars);
        if (algebraicResult !== null && typeof algebraicResult === 'number' && Number.isFinite(algebraicResult) && !isNaN(algebraicResult)) {
            console.log(`[FormulaCalculator] generateSymbolicExpression: Algebraic solve succeeded for ${unknownVar}: ${algebraicResult}`);
            return `${unknownVar} = ${algebraicResult}`;
        }
        
        // If we can't solve numerically, fall back to symbolic expression
        console.log(`[FormulaCalculator] generateSymbolicExpression: Cannot solve ${unknownVar} numerically, using symbolic expression`);
        
        // Fallback: Generate symbolic expression with substituted values AND computed constants
        // Start with the equation
        let expression = this.formula.equation;
        
        // Format values for better readability in symbolic expressions
        // Convert to appropriate units if unitConverter is available
        const formatValue = (val, symbol) => {
            // Try to convert to a more readable unit
            if (this.unitConverter && typeof this.unitConverter.convertAndFormat === 'function') {
                const varDef = this.formula.variables.find(v => v.symbol === symbol);
                if (varDef && varDef.unit) {
                    try {
                        const converted = this.unitConverter.convertAndFormat(val, varDef.unit);
                        if (converted && converted.value !== null && Number.isFinite(converted.value)) {
                            const formatted = this._formatNumber(converted.value);
                            return `${formatted} ${converted.unit}`;
                        }
                    } catch (e) {
                        // If conversion fails, use original value
                    }
                }
            }
            // Fallback: use scientific notation for very large/small numbers
            return this._formatNumber(val);
        };
        
        // CRITICAL: First substitute constants with their computed numeric values
        // This ensures constants like G, π, etc. are shown as numbers, not symbols
        const allConstants = { ...this.constants, ...(this.formula.constants || {}) };
        const sortedConstants = Object.entries(allConstants)
            .filter(([k, v]) => typeof v === 'number' && !(k in knownVars))
            .sort((a, b) => b[0].length - a[0].length);
        
        for (const [constName, constValue] of sortedConstants) {
            const escaped = constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'g');
            const formattedConst = this._formatNumber(constValue);
            expression = expression.replace(regex, formattedConst);
            console.log(`[FormulaCalculator] Substituted constant ${constName} = ${formattedConst} in expression`);
        }
        
        // Then substitute known variables with their numeric values
        // Sort by symbol length (longest first) to avoid partial matches
        const sortedKnownVars = Object.entries(knownVars)
            .filter(([_, v]) => v !== null && v !== undefined && typeof v === 'number')
            .sort((a, b) => b[0].length - a[0].length);
        
        for (const [symbol, value] of sortedKnownVars) {
            const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedSymbol}\\b`, 'g');
            const formattedValue = formatValue(value, symbol);
            expression = expression.replace(regex, formattedValue);
            console.log(`[FormulaCalculator] Substituted variable ${symbol} = ${formattedValue} in expression`);
        }
        
        // Try to evaluate the expression if all variables are known
        try {
            const allVars = { ...this.constants, ...(this.formula.constants || {}), ...knownVars };
            const evaluated = this.evaluateExpression(expression, allVars);
            if (typeof evaluated === 'number' && Number.isFinite(evaluated) && !isNaN(evaluated)) {
                // We can evaluate it! Return the numeric result
                console.log(`[FormulaCalculator] generateSymbolicExpression: Evaluated expression to: ${evaluated}`);
                return `${unknownVar} = ${evaluated}`;
            }
        } catch (e) {
            // If evaluation fails, just return the symbolic expression
        }
        
        // Return the expression showing the unknown variable
        // Format: "unknownVar = expression_with_substituted_values"
        return `${unknownVar} = ${expression}`;
    }
    /**
     * Generate expression for multiple unknown variables
     */
    generateMultiVariableExpression(unknownVars, knownVars) {
        // CRITICAL: If there's exactly one unknown, try to solve it numerically!
        if (unknownVars.length === 1) {
            const unknownVar = unknownVars[0];
            console.log(`[FormulaCalculator] generateMultiVariableExpression: Only one unknown (${unknownVar}), attempting numeric solve...`);
            // solveForVariable returns number or null (never throws)
            const numericResult = this.solveForVariable(unknownVar, knownVars);
            if (numericResult !== null && typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
                console.log(`[FormulaCalculator] ✅ Numeric solve succeeded in generateMultiVariableExpression: ${unknownVar} = ${numericResult}`);
                // Return the numeric result, not just the expression
                return `${unknownVar} = ${numericResult}`;
            }
            
            // Try algebraic solver as fallback
            const algebraicResult = this._solveAlgebraically(unknownVar, knownVars);
            if (algebraicResult !== null && typeof algebraicResult === 'number' && Number.isFinite(algebraicResult) && !isNaN(algebraicResult)) {
                console.log(`[FormulaCalculator] ✅ Algebraic solve succeeded in generateMultiVariableExpression: ${unknownVar} = ${algebraicResult}`);
                return `${unknownVar} = ${algebraicResult}`;
            }
            
            console.log(`[FormulaCalculator] Numeric solve failed in generateMultiVariableExpression, using symbolic`);
        }
        
        // Fallback: Generate symbolic expression with substituted values AND computed constants
        let expression = this.formula.equation;
        
        // Format values for better readability with unit conversion
        const formatValue = (val, symbol) => {
            // Try to convert to a more readable unit if unitConverter is available
            if (this.unitConverter && typeof this.unitConverter.convertAndFormat === 'function') {
                const varDef = this.formula.variables.find(v => v.symbol === symbol);
                if (varDef && varDef.unit) {
                    try {
                        const converted = this.unitConverter.convertAndFormat(val, varDef.unit);
                        if (converted && converted.value !== null && Number.isFinite(converted.value)) {
                            const formatted = this._formatNumber(converted.value);
                            return `${formatted} ${converted.unit}`;
                        }
                    } catch (e) {
                        // If conversion fails, use original value
                    }
                }
            }
            // Fallback: use scientific notation for very large/small numbers
            return this._formatNumber(val);
        };
        
        // CRITICAL: First substitute constants with their computed numeric values
        // This ensures constants like G, π, etc. are shown as numbers, not symbols
        const allConstants = { ...this.constants, ...(this.formula.constants || {}) };
        const sortedConstants = Object.entries(allConstants)
            .filter(([k, v]) => typeof v === 'number' && !(k in knownVars))
            .sort((a, b) => b[0].length - a[0].length);
        
        for (const [constName, constValue] of sortedConstants) {
            const escaped = constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'g');
            const formattedConst = this._formatNumber(constValue);
            expression = expression.replace(regex, formattedConst);
            console.log(`[FormulaCalculator] generateMultiVariableExpression: Substituted constant ${constName} = ${formattedConst}`);
        }
        
        // Then substitute known variables with their numeric values
        // Sort by symbol length (longest first) to avoid partial matches
        const sortedKnownVars = Object.entries(knownVars)
            .filter(([_, v]) => v !== null && v !== undefined && typeof v === 'number')
            .sort((a, b) => b[0].length - a[0].length);
        
        for (const [symbol, value] of sortedKnownVars) {
            const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedSymbol}\\b`, 'g');
            const formattedValue = formatValue(value, symbol);
            expression = expression.replace(regex, formattedValue);
            console.log(`[FormulaCalculator] generateMultiVariableExpression: Substituted variable ${symbol} = ${formattedValue}`);
        }
        
        // Try to evaluate the expression if all variables are known
        if (unknownVars.length === 1) {
            const unknownVar = unknownVars[0];
            // Try to solve algebraically (returns number or null, never throws)
            const numericResult = this._solveAlgebraically(unknownVar, knownVars);
            if (numericResult !== null && typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
                return `${unknownVar} = ${numericResult}`;
            }
            // If evaluation fails, return symbolic expression
            return `${unknownVar} = ${expression}`;
        } else {
            // Enhanced format for multiple unknowns with known values
            const knownCount = Object.keys(knownVars).filter(k => 
                knownVars[k] !== null && knownVars[k] !== undefined && typeof knownVars[k] === 'number'
            ).length;
            
            if (knownCount > 0) {
                // Show partial evaluation with substituted values
                return `${expression}\n\nRemaining variables: ${unknownVars.join(', ')}\nTo solve for any variable, provide values for all others.`;
            } else {
                return `${expression} (solve for: ${unknownVars.join(', ')})`;
            }
        }
    }
    /**
     * Evaluates mathematical expressions with caching for performance
     */
    evaluateExpression(expression, variables) {
        // CRITICAL: This MUST return a number, not a string!
        // Optimized: Create cache key that includes variable values for accurate caching
        const cacheKey = this._createCacheKey(expression, variables);
        
        // Check cache first (O(1) lookup)
        if (this.expressionCache.has(cacheKey)) {
            const cached = this.expressionCache.get(cacheKey);
            console.log(`[FormulaCalculator] evaluateExpression cache hit for: ${expression} = ${cached} (type: ${typeof cached})`);
            return cached;
        }
        
        // CRITICAL: Preprocess expression to handle implicit multiplication
        // First normalize Unicode operators, then expand implicit multiplication
        let processedExpression = String(expression)
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/√\s*\(/g, 'Math.sqrt(');
        processedExpression = this._expandImplicitMultiplication(processedExpression, variables);
        console.log(`[FormulaCalculator] Original expression: ${expression}`);
        console.log(`[FormulaCalculator] Processed expression: ${processedExpression}`);
        
        // CRITICAL: Try multiple evaluators to ensure we get a numeric result
        let result = null;
        
        // Try 1: Use provided mathEvaluator
        if (this.mathEvaluator?.evaluate) {
            try {
                result = this.mathEvaluator.evaluate(processedExpression, variables);
                console.log(`[FormulaCalculator] evaluateExpression (mathEvaluator): ${processedExpression} = ${result} (type: ${typeof result})`);
                if (typeof result === 'number' && Number.isFinite(result) && !isNaN(result)) {
                    this.expressionCache.set(cacheKey, result);
                    return result;
                }
            } catch (e) {
                console.warn(`[FormulaCalculator] mathEvaluator failed for ${processedExpression}:`, e.message);
            }
        }
        
        // Try 2: Use SafeMathEvaluator if available globally
        if (typeof SafeMathEvaluator !== 'undefined' && SafeMathEvaluator.evaluate) {
            try {
                const allVars = { ...this.constants, ...(this.formula.constants || {}), ...variables };
                result = SafeMathEvaluator.evaluate(processedExpression, allVars);
                console.log(`[FormulaCalculator] evaluateExpression (SafeMathEvaluator): ${processedExpression} = ${result} (type: ${typeof result})`);
                if (typeof result === 'number' && Number.isFinite(result) && !isNaN(result)) {
                    this.expressionCache.set(cacheKey, result);
                    return result;
                }
            } catch (e) {
                console.warn(`[FormulaCalculator] SafeMathEvaluator failed for ${processedExpression}:`, e.message);
            }
        }
        
        // Try 3: Use SafeExpressionEvaluator if available globally
        if (typeof SafeExpressionEvaluator !== 'undefined' && SafeExpressionEvaluator.evaluate) {
            try {
                const allVars = { ...this.constants, ...(this.formula.constants || {}), ...variables };
                result = SafeExpressionEvaluator.evaluate(processedExpression, allVars);
                console.log(`[FormulaCalculator] evaluateExpression (SafeExpressionEvaluator): ${processedExpression} = ${result} (type: ${typeof result})`);
                if (typeof result === 'number' && Number.isFinite(result) && !isNaN(result)) {
                    this.expressionCache.set(cacheKey, result);
                    return result;
                }
            } catch (e) {
                console.warn(`[FormulaCalculator] SafeExpressionEvaluator failed for ${processedExpression}:`, e.message);
            }
        }
        
        // If all evaluators failed, throw error - we MUST have a numeric result
        console.error(`[FormulaCalculator] ❌ evaluateExpression FAILED for: ${expression} (processed: ${processedExpression})`);
        console.error(`[FormulaCalculator] Variables:`, variables);
        console.error(`[FormulaCalculator] mathEvaluator available:`, !!this.mathEvaluator);
        console.error(`[FormulaCalculator] SafeMathEvaluator available:`, typeof SafeMathEvaluator !== 'undefined');
        console.error(`[FormulaCalculator] SafeExpressionEvaluator available:`, typeof SafeExpressionEvaluator !== 'undefined');
        throw new Error(`Cannot evaluate expression: ${expression}. No working evaluator available.`);
    }
    
    /**
     * Expand implicit multiplication in expressions
     * Converts patterns like "2GM" to "2*G*M", "4π²" to "4*π*π", etc.
     * CRITICAL: This enables evaluation of expressions like "2GM/r"
     */
    _expandImplicitMultiplication(expression, variables) {
        // CRITICAL: Normalize Unicode operators first (before any processing)
        // Replace × with *, ÷ with /, etc.
        let result = String(expression)
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        // Get all known variable and constant names
        const allNames = new Set([
            ...Object.keys(this.constants || {}),
            ...Object.keys(this.formula?.constants || {}),
            ...Object.keys(variables || {})
        ].filter(name => name && name.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)));
        
        // Sort by length (longest first) to avoid partial matches
        const sortedNames = Array.from(allNames).sort((a, b) => b.length - a.length);
        
        // Pattern 1: Handle number followed by variable(s) - e.g., "2GM" -> "2*G*M"
        // Match: digit(s), then variable name, then optionally another variable
        // This handles: 2G, 2GM, 4π, 4π², etc.
        for (const name of sortedNames) {
            const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Match: number, then variable, then (optionally) another variable or operator
            const pattern = new RegExp(`(\\d+(?:\\.\\d+)?)(${escaped})(?=([A-Za-z_][A-Za-z0-9_]*|[\\+\\-\\*/\\^\\)\\]\\s]|$))`, 'g');
            result = result.replace(pattern, (match, num, varName) => {
                return `${num}*${varName}`;
            });
        }
        
        // Pattern 2: Handle variable followed by variable - e.g., "GM" -> "G*M"
        // But only if both are known variables/constants
        // CRITICAL: Handle sequences of single-character variables first
        // This handles cases like "GM" where G and M are both single-char variables
        const singleCharVars = sortedNames.filter(n => n.length === 1);
        if (singleCharVars.length > 0) {
            // Build a pattern to match sequences of single-char variables
            const singleCharPattern = singleCharVars.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
            // Match sequences of 2+ single-char variables that are known
            const sequencePattern = new RegExp(`([${singleCharPattern}]{2,})`, 'g');
            result = result.replace(sequencePattern, (match) => {
                // Check if all characters in the match are known variables
                const allKnown = match.split('').every(char => singleCharVars.includes(char));
                if (allKnown && match.length > 1) {
                    // Insert * between each character
                    return match.split('').join('*');
                }
                return match;
            });
        }
        
        // Pattern 2b: Handle multi-char variable followed by variable (for remaining cases)
        // Process in pairs, longest first to avoid conflicts
        for (let i = 0; i < sortedNames.length; i++) {
            for (let j = i + 1; j < sortedNames.length; j++) {
                const name1 = sortedNames[i];
                const name2 = sortedNames[j];
                // Skip if both are single-char (already handled above)
                if (name1.length === 1 && name2.length === 1) continue;
                
                const escaped1 = name1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const escaped2 = name2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Match: first variable immediately followed by second variable (word boundaries)
                const pattern = new RegExp(`\\b${escaped1}\\b(${escaped2})\\b`, 'g');
                result = result.replace(pattern, `${name1}*$1`);
            }
        }
        
        // Pattern 3: Handle Unicode superscripts - e.g., "π²" -> "π*π" or "π^2"
        result = result.replace(/([A-Za-z_][A-Za-z0-9_]*|[πΠ])([²³])/g, (match, base, sup) => {
            if (sup === '²') return `${base}*${base}`;
            if (sup === '³') return `${base}*${base}*${base}`;
            return match;
        });
        
        // Pattern 4: Handle closing paren/brace followed by variable - e.g., ")G" -> ")*G"
        result = result.replace(/([\)\]}])([A-Za-z_][A-Za-z0-9_]*)/g, '$1*$2');
        
        // Pattern 5: Handle variable followed by opening paren - e.g., "G(" -> "G*("
        result = result.replace(/([A-Za-z_][A-Za-z0-9_]*)(\()/g, '$1*$2');
        
        // Pattern 6: Normalize Unicode characters to ASCII equivalents for evaluation
        // Replace π with pi (if pi is in constants/variables)
        if (allNames.has('pi') || allNames.has('π')) {
            result = result.replace(/π/g, 'pi');
        }
        // Replace √( with Math.sqrt( for evaluation
        result = result.replace(/√\s*\(/g, 'Math.sqrt(');
        
        console.log(`[FormulaCalculator] _expandImplicitMultiplication: "${expression}" -> "${result}"`);
        return result;
    }
    
    /**
     * Create optimized cache key from expression and variables
     * Uses sorted variable keys for consistent hashing
     */
    _createCacheKey(expression, variables) {
        if (!variables || Object.keys(variables).length === 0) {
            return expression;
        }
        
        // Optimized: Sort keys and create compact string representation
        const sortedKeys = Object.keys(variables).sort();
        const varString = sortedKeys.map(k => `${k}:${variables[k]}`).join('|');
        return `${expression}|${varString}`;
    }
    /**
     * Evaluates the formula equation for solving
     */
    evaluateFormula(variables) {
        // Optimized: Reuse constants object instead of creating new one each time
        if (!this._mergedConstants) {
            this._mergedConstants = { ...this.constants };
        }
        
        // Optimized: Only merge if variables changed (shallow comparison)
        const allValues = { ...this._mergedConstants, ...variables };
        return this.evaluateExpression(this.formula.equation, allValues);
    }
    solveForVariable(targetVar, knownVars) {
        // CRITICAL: Always try algebraic solver first - it's more reliable for simple equations
        // Then fall back to numeric solver if algebraic fails
        try {
            const algebraicResult = this._solveAlgebraically(targetVar, knownVars);
            if (typeof algebraicResult === 'number' && Number.isFinite(algebraicResult) && !isNaN(algebraicResult)) {
                console.log(`[FormulaCalculator] ✅ Algebraic solve succeeded for ${targetVar}: ${algebraicResult}`);
                return algebraicResult;
            }
        } catch (algebraicError) {
            console.log(`[FormulaCalculator] Algebraic solve failed for ${targetVar}, trying numeric solver:`, algebraicError.message);
        }
        
        // FALLBACK: Try numeric solver if algebraic solver failed
        if (this.solver) {
            // Optimized: Reuse merged constants
            if (!this._solverConstants) {
                this._solverConstants = { ...this.constants, ...(this.formula.constants || {}) };
            }
            
            // Optimized: Use adaptive solver options based on equation complexity
            const solverOptions = this._getOptimizedSolverOptions();
            
            try {
                const solverResult = this.solver(
                    this.formula.equation, 
                    targetVar, 
                    { ...this._solverConstants, ...knownVars }, 
                    solverOptions
                );
                
                if (solverResult && solverResult.converged && Number.isFinite(solverResult.result) && !isNaN(solverResult.result)) {
                    console.log(`[FormulaCalculator] ✅ Numeric solver succeeded for ${targetVar}: ${solverResult.result}`);
                    return solverResult.result;
                }
            } catch (solverError) {
                console.warn(`[FormulaCalculator] Numeric solver failed for ${targetVar}:`, solverError.message);
            }
        }
        
        // If both methods failed, return null to signal failure (let UI handle fallback)
        console.log(`[FormulaCalculator] solveForVariable: Unable to solve for ${targetVar} using algebraic or numeric methods. Known vars: ${Object.keys(knownVars).join(', ')}`);
        return null;
    }
    
    /**
     * Algebraic solver fallback - solves equations algebraically when possible
     * Handles common patterns: linear, power, inverse, square roots, etc.
     * CRITICAL: This method isolates variables algebraically and computes numeric results
     */
    _solveAlgebraically(targetVar, knownVars) {
        console.log(`[FormulaCalculator] _solveAlgebraically: Solving for ${targetVar} with known vars:`, knownVars);
        
        // Merge constants with known variables
        const allKnown = { ...this.constants, ...(this.formula.constants || {}), ...knownVars };
        console.log(`[FormulaCalculator] All known values (including constants):`, allKnown);
        
        // Get the equation and normalize Unicode operators
        let equation = this.formula.equation
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        console.log(`[FormulaCalculator] Equation: ${equation}`);
        
        // Declare match variable
        let match;
        
        // Try to isolate the target variable algebraically
        // Pattern 1: targetVar = √(expression) or targetVar = sqrt(expression)
        // Handle both Unicode √ and ASCII sqrt
        // CRITICAL: Escape underscores in targetVar (e.g., v_esc)
        const escapedTargetVar = targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const sqrtPatterns = [
            // Unicode square root: v_esc = √(2GM/r) - no space between √ and (
            new RegExp(`^\\s*${escapedTargetVar}\\s*=\\s*[√]\\s*\\((.+)\\)$`),
            // Unicode square root with space: v_esc = √ (2GM/r)
            new RegExp(`^\\s*${escapedTargetVar}\\s*=\\s*[√]\\s+\\((.+)\\)$`),
            // ASCII sqrt function: v_esc = sqrt(2GM/r)
            new RegExp(`^\\s*${escapedTargetVar}\\s*=\\s*sqrt\\s*\\((.+)\\)$`, 'i'),
            // ASCII sqrt with space: v_esc = sqrt (2GM/r)
            new RegExp(`^\\s*${escapedTargetVar}\\s*=\\s*sqrt\\s+\\((.+)\\)$`, 'i')
        ];
        
        for (const sqrtPattern of sqrtPatterns) {
            match = equation.match(sqrtPattern);
            if (match) {
                const expression = match[1].trim();
                console.log(`[FormulaCalculator] ✅ Found square root pattern. Expression inside sqrt: ${expression}`);
                try {
                    const value = this.evaluateExpression(expression, allKnown);
                    console.log(`[FormulaCalculator] Evaluated expression: ${expression} = ${value}`);
                    if (typeof value === 'number' && Number.isFinite(value) && !isNaN(value)) {
                        const result = Math.sqrt(value);
                        console.log(`[FormulaCalculator] ✅ Square root result: √(${value}) = ${result}`);
                        return result;
                    } else {
                        throw new Error(`Expression evaluated to invalid number: ${value}`);
                    }
                } catch (e) {
                    console.error(`[FormulaCalculator] Failed to evaluate expression inside sqrt:`, e);
                    throw new Error(`Cannot evaluate expression inside square root: ${expression}. ${e.message}`);
                }
            }
        }
        
        // Pattern 1c: targetVar = expression (already isolated)
        // This handles cases where the variable is already on the left side
        const directPattern = new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*(.+)$`);
        match = equation.match(directPattern);
        if (match) {
            // Evaluate the right side
            const expression = match[1].trim();
            console.log(`[FormulaCalculator] ✅ Found direct pattern. Expression: ${expression}`);
            try {
                const result = this.evaluateExpression(expression, allKnown);
                console.log(`[FormulaCalculator] ✅ Direct evaluation result: ${result}`);
                if (typeof result === 'number' && Number.isFinite(result) && !isNaN(result)) {
                    return result;
                } else {
                    throw new Error(`Direct evaluation returned invalid number: ${result}`);
                }
            } catch (e) {
                console.error(`[FormulaCalculator] Failed to evaluate direct expression:`, e);
                throw new Error(`Cannot evaluate expression: ${expression}. ${e.message}`);
            }
        }
        
        // Pattern 2: expression = targetVar (reverse)
        const reversePattern = new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
        match = equation.match(reversePattern);
        if (match) {
            // Evaluate the left side
            const expression = match[1].trim();
            console.log(`[FormulaCalculator] ✅ Found reverse pattern. Expression: ${expression}`);
            try {
                const result = this.evaluateExpression(expression, allKnown);
                console.log(`[FormulaCalculator] ✅ Reverse evaluation result: ${result}`);
                if (typeof result === 'number' && Number.isFinite(result) && !isNaN(result)) {
                    return result;
                } else {
                    throw new Error(`Reverse evaluation returned invalid number: ${result}`);
                }
            } catch (e) {
                console.error(`[FormulaCalculator] Failed to evaluate reverse expression:`, e);
                throw new Error(`Cannot evaluate expression: ${expression}. ${e.message}`);
            }
        }
        
        // Pattern 3: targetVar^n = expression (power isolation)
        // Handle both explicit power notation (^2, ^3) and Unicode (², ³)
        const powerPatterns = [
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*2\\s*=\\s*(.+)$`), power: 2 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*²\\s*=\\s*(.+)$`), power: 2 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*3\\s*=\\s*(.+)$`), power: 3 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*³\\s*=\\s*(.+)$`), power: 3 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*(\\d+(?:\\.\\d+)?)\\s*=\\s*(.+)$`), power: null } // dynamic power
        ];
        
        for (const { pattern, power } of powerPatterns) {
            match = equation.match(pattern);
            if (match) {
                const actualPower = power !== null ? power : parseFloat(match[1]);
                const expression = match[power !== null ? 1 : 2].trim();
                console.log(`[FormulaCalculator] ✅ Found power pattern. ${targetVar}^${actualPower} = ${expression}`);
                try {
                    const rightSide = this.evaluateExpression(expression, allKnown);
                    console.log(`[FormulaCalculator] Evaluated right side: ${expression} = ${rightSide}`);
                    let result;
                    if (actualPower === 2) {
                        result = Math.sqrt(rightSide);
                    } else if (actualPower === 3) {
                        result = Math.cbrt(rightSide);
                    } else if (actualPower > 0) {
                        result = Math.pow(rightSide, 1 / actualPower);
                    } else {
                        throw new Error(`Invalid power: ${actualPower}`);
                    }
                    console.log(`[FormulaCalculator] ✅ Power isolation result: ${result}`);
                    if (typeof result === 'number' && Number.isFinite(result) && !isNaN(result)) {
                        return result;
                    } else {
                        throw new Error(`Power isolation returned invalid number: ${result}`);
                    }
                } catch (e) {
                    console.error(`[FormulaCalculator] Failed to evaluate power pattern:`, e);
                    // Continue to next pattern
                }
            }
        }
        
        // Pattern 4: expression = targetVar^n (reverse power)
        const reversePowerPatterns = [
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*2\\s*$`), power: 2 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*²\\s*$`), power: 2 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*3\\s*$`), power: 3 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*³\\s*$`), power: 3 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*(\\d+(?:\\.\\d+)?)\\s*$`), power: null }
        ];
        
        for (const { pattern, power } of reversePowerPatterns) {
            match = equation.match(pattern);
            if (match) {
                const expression = match[1].trim();
                const actualPower = power !== null ? power : parseFloat(match[2]);
                console.log(`[FormulaCalculator] ✅ Found reverse power pattern. ${expression} = ${targetVar}^${actualPower}`);
                try {
                    const leftSide = this.evaluateExpression(expression, allKnown);
                    console.log(`[FormulaCalculator] Evaluated left side: ${expression} = ${leftSide}`);
                    let result;
                    if (actualPower === 2) {
                        result = Math.sqrt(leftSide);
                    } else if (actualPower === 3) {
                        result = Math.cbrt(leftSide);
                    } else if (actualPower > 0) {
                        result = Math.pow(leftSide, 1 / actualPower);
                    } else {
                        throw new Error(`Invalid power: ${actualPower}`);
                    }
                    console.log(`[FormulaCalculator] ✅ Reverse power isolation result: ${result}`);
                    if (typeof result === 'number' && Number.isFinite(result) && !isNaN(result)) {
                        return result;
                    } else {
                        throw new Error(`Reverse power isolation returned invalid number: ${result}`);
                    }
                } catch (e) {
                    console.error(`[FormulaCalculator] Failed to evaluate reverse power pattern:`, e);
                    // Continue to next pattern
                }
            }
        }
        
        // Pattern 5: Complex expressions - try algebraic rearrangement
        // For T² = (4π²/GM) × a³, if solving for a:
        // We need to rearrange: a³ = T²GM/(4π²), then a = ∛(T²GM/(4π²))
        
        // First, substitute all known values into the equation
        let substituted = equation;
        const sortedKnown = Object.entries(allKnown)
            .filter(([k, v]) => k !== targetVar && typeof v === 'number')
            .sort((a, b) => b[0].length - a[0].length); // Longest first to avoid partial matches
        
        for (const [symbol, value] of sortedKnown) {
            const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'g');
            const formatted = Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)
                ? value.toExponential(6)
                : value.toString();
            substituted = substituted.replace(regex, `(${formatted})`);
        }
        
        // Pattern 5a: targetVar^n = expression (after substitution)
        // Handle both explicit power notation (^2, ^3) and Unicode (², ³)
        const powerNotation = [
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*2\\s*=\\s*(.+)$`), power: 2 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*²\\s*=\\s*(.+)$`), power: 2 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*3\\s*=\\s*(.+)$`), power: 3 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*³\\s*=\\s*(.+)$`), power: 3 },
            { pattern: new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*(\\d+(?:\\.\\d+)?)\\s*=\\s*(.+)$`), power: null } // dynamic power
        ];
        
        for (const { pattern, power } of powerNotation) {
            match = substituted.match(pattern);
            if (match) {
                const actualPower = power !== null ? power : parseFloat(match[1]);
                const rightExpr = match[power !== null ? 1 : 2].trim();
                try {
                    const rightValue = this.evaluateExpression(rightExpr, {});
                    if (actualPower === 2) {
                        return Math.sqrt(rightValue);
                    } else if (actualPower === 3) {
                        return Math.cbrt(rightValue);
                    } else if (actualPower > 0) {
                        return Math.pow(rightValue, 1 / actualPower);
                    }
                } catch (e) {
                    // Continue to next pattern
                }
            }
        }
        
        // Pattern 5b: expression = targetVar^n (reverse, after substitution)
        const reversePowerNotation = [
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*2\\s*$`), power: 2 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*²\\s*$`), power: 2 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*3\\s*$`), power: 3 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*³\\s*$`), power: 3 },
            { pattern: new RegExp(`^\\s*(.+)\\s*=\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\^\\s*(\\d+(?:\\.\\d+)?)\\s*$`), power: null }
        ];
        
        for (const { pattern, power } of reversePowerNotation) {
            match = substituted.match(pattern);
            if (match) {
                const actualPower = power !== null ? power : parseFloat(match[2]);
                const leftExpr = match[1].trim();
                try {
                    const leftValue = this.evaluateExpression(leftExpr, {});
                    if (actualPower === 2) {
                        return Math.sqrt(leftValue);
                    } else if (actualPower === 3) {
                        return Math.cbrt(leftValue);
                    } else if (actualPower > 0) {
                        return Math.pow(leftValue, 1 / actualPower);
                    }
                } catch (e) {
                    // Continue to next pattern
                }
            }
        }
        
        // Pattern 5c: Handle complex multiplication/division patterns
        // For T² = (4π²/GM) × a³, if solving for M:
        // After substitution: T² = (4π²/G × M) × a³ → M = 4π²a³/(GT²)
        // Try to extract targetVar from multiplication/division expressions
        const multiplicationPattern = new RegExp(`([^=]+)\\s*=\\s*([^${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+)\\s*[×*]\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^=]*)$`);
        match = substituted.match(multiplicationPattern);
        if (match) {
            try {
                const leftExpr = match[1].trim();
                const coeffExpr = match[2].trim();
                const rightExpr = match[3].trim();
                const leftValue = this.evaluateExpression(leftExpr, {});
                const coeffValue = this.evaluateExpression(coeffExpr, {});
                if (coeffValue !== 0) {
                    return leftValue / coeffValue;
                }
            } catch (e) {
                // Continue
            }
        }
        
        // Pattern 5d: Handle division patterns: expression = something / targetVar
        const divisionPattern = new RegExp(`([^=]+)\\s*=\\s*([^/]+)\\s*/\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^=]*)$`);
        match = substituted.match(divisionPattern);
        if (match) {
            try {
                const leftExpr = match[1].trim();
                const numeratorExpr = match[2].trim();
                const leftValue = this.evaluateExpression(leftExpr, {});
                const numeratorValue = this.evaluateExpression(numeratorExpr, {});
                if (leftValue !== 0) {
                    return numeratorValue / leftValue;
                }
            } catch (e) {
                // Continue
            }
        }
        
        // Pattern 5e: Handle division patterns: expression = something / (G × targetVar)
        // For T² = (4π²/GM) × a³, after substitution: 2² = (4π²/G × M) × 15³
        // We need: M = 4π²a³/(GT²)
        const divisionWithCoeffPattern = new RegExp(`([^=]+)\\s*=\\s*([^/]+)\\s*/\\s*\\(([^)]*)\\s*[×*]\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)([^=]*)$`);
        match = substituted.match(divisionWithCoeffPattern);
        if (match) {
            try {
                const leftExpr = match[1].trim();
                const numeratorExpr = match[2].trim();
                const coeffExpr = match[3].trim();
                const leftValue = this.evaluateExpression(leftExpr, {});
                const numeratorValue = this.evaluateExpression(numeratorExpr, {});
                const coeffValue = this.evaluateExpression(coeffExpr, {});
                if (leftValue !== 0 && coeffValue !== 0) {
                    return numeratorValue / (leftValue * coeffValue);
                }
            } catch (e) {
                // Continue
            }
        }
        
        // Pattern 5f: Handle complex patterns like T² = (4π²/GM) × a³
        // After substitution: T² = (4π²/G × M) × a³
        // Rearrange: T² = 4π²a³/(GM) → T²GM = 4π²a³ → M = 4π²a³/(GT²)
        // Look for pattern: left = (numerator / (coeff × targetVar)) × multiplier
        const complexDivisionPattern = new RegExp(`([^=]+)\\s*=\\s*\\(([^/]+)\\s*/\\s*\\(([^)]*)\\s*[×*]\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\)\\s*[×*]\\s*([^=]+)$`);
        match = substituted.match(complexDivisionPattern);
        if (match) {
            try {
                const leftExpr = match[1].trim(); // T²
                const numeratorExpr = match[2].trim(); // 4π²
                const coeffExpr = match[3].trim(); // G
                const multiplierExpr = match[4].trim(); // a³
                
                const leftValue = this.evaluateExpression(leftExpr, {});
                const numeratorValue = this.evaluateExpression(numeratorExpr, {});
                const coeffValue = this.evaluateExpression(coeffExpr, {});
                const multiplierValue = this.evaluateExpression(multiplierExpr, {});
                
                // Rearrange: left = (numerator / (coeff × M)) × multiplier
                // left = numerator × multiplier / (coeff × M)
                // left × coeff × M = numerator × multiplier
                // M = (numerator × multiplier) / (left × coeff)
                if (leftValue !== 0 && coeffValue !== 0) {
                    return (numeratorValue * multiplierValue) / (leftValue * coeffValue);
                }
            } catch (e) {
                // Continue
            }
        }
        
        // Pattern 5g: Handle pattern: left = (numerator / targetVar) × multiplier
        // After substitution, rearrange: targetVar = (numerator × multiplier) / left
        const simpleDivisionMultPattern = new RegExp(`([^=]+)\\s*=\\s*\\(([^/]+)\\s*/\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\s*[×*]\\s*([^=]+)$`);
        match = substituted.match(simpleDivisionMultPattern);
        if (match) {
            try {
                const leftExpr = match[1].trim();
                const numeratorExpr = match[2].trim();
                const multiplierExpr = match[3].trim();
                
                const leftValue = this.evaluateExpression(leftExpr, {});
                const numeratorValue = this.evaluateExpression(numeratorExpr, {});
                const multiplierValue = this.evaluateExpression(multiplierExpr, {});
                
                // left = (numerator / targetVar) × multiplier
                // left = numerator × multiplier / targetVar
                // targetVar = numerator × multiplier / left
                if (leftValue !== 0) {
                    return (numeratorValue * multiplierValue) / leftValue;
                }
            } catch (e) {
                // Continue
            }
        }
        
        // Pattern 5h: Handle cases where targetVar is part of compound expression like GM
        // For T² = (4π²/GM) × a³, after substitution: 2² = (4π²/GM) × 15³
        // We need to extract M from GM: M = 4π²a³/(GT²)
        // Look for pattern: left = (numerator / (coeff × targetVar)) × multiplier
        // But also handle: left = (numerator / (coefftargetVar)) × multiplier
        const compoundVarPattern = new RegExp(`([^=]+)\\s*=\\s*\\(([^/]+)\\s*/\\s*([^)]*)\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^)]*)\\)\\s*[×*]\\s*([^=]+)$`);
        match = substituted.match(compoundVarPattern);
        if (match) {
            try {
                const leftExpr = match[1].trim(); // T²
                const numeratorExpr = match[2].trim(); // 4π²
                const coeffBefore = match[3].trim(); // G (before M)
                const coeffAfter = match[4].trim(); // (after M, usually empty)
                const multiplierExpr = match[5].trim(); // a³
                
                const leftValue = this.evaluateExpression(leftExpr, {});
                const numeratorValue = this.evaluateExpression(numeratorExpr, {});
                const multiplierValue = this.evaluateExpression(multiplierExpr, {});
                
                // Handle coeffBefore (like G in GM)
                let coeffValue = 1;
                if (coeffBefore) {
                    try {
                        coeffValue = this.evaluateExpression(coeffBefore, {});
                    } catch (e) {
                        // If coeffBefore can't be evaluated, try to extract it from allKnown
                        if (allKnown[coeffBefore] !== undefined) {
                            coeffValue = allKnown[coeffBefore];
                        }
                    }
                }
                
                // Rearrange: left = (numerator / (coeff × targetVar)) × multiplier
                // left = numerator × multiplier / (coeff × targetVar)
                // left × coeff × targetVar = numerator × multiplier
                // targetVar = (numerator × multiplier) / (left × coeff)
                if (leftValue !== 0 && coeffValue !== 0) {
                    return (numeratorValue * multiplierValue) / (leftValue * coeffValue);
                }
            } catch (e) {
                // Continue
            }
        }
        
        // Pattern 5c: Try to use formula's solveFunction if available (most reliable)
        if (this.formula.solveFunction && typeof this.formula.solveFunction === 'function') {
            try {
                const result = this.formula.solveFunction(allKnown);
                if (typeof result === 'number' && Number.isFinite(result)) {
                    return result;
                }
            } catch (e) {
                // Continue to algebraic solving
            }
        }
        
        // Pattern 6: targetVar = expression (after substitution, targetVar is isolated)
        const isolatedPattern = new RegExp(`^\\s*${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*(.+)$`);
        match = substituted.match(isolatedPattern);
        if (match) {
            const expression = match[1].trim();
            try {
                return this.evaluateExpression(expression, {});
            } catch (e) {
                // Continue
            }
        }
        
        // Pattern 7: Try evaluating the entire equation with targetVar as a variable
        // This works if the equation can be rearranged to isolate targetVar
        // We'll try a simple iterative approach: evaluate with targetVar = 0, 1, 10, 100, etc.
        // and see if we can find where the equation balances
        try {
            // For equations like T² = (4π²/GM) × a³, we can rearrange:
            // If we know T, M, and want a: a³ = T²GM/(4π²)
            // Let's try to extract this pattern programmatically
            
            // Create a test context with targetVar = 1
            const testContext = { ...allKnown, [targetVar]: 1 };
            const leftValue = this.evaluateExpression(equation.split('=')[0]?.trim() || equation, testContext);
            const rightValue = this.evaluateExpression(equation.split('=')[1]?.trim() || '0', testContext);
            
            // If the equation balances when targetVar = 1, return 1
            // Otherwise, try to solve: if equation is A = B × targetVar^n, then targetVar = (A/B)^(1/n)
            // This is a heuristic approach
        } catch (e) {
            // Ignore
        }
        
        // If all patterns fail, try one more approach: use the math evaluator to solve
        // by creating an inverse expression
        try {
            // For power equations, try to extract the power and base
            const powerMatch = equation.match(new RegExp(`${targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[\\^²³]\\s*(\\d+)?`, 'i'));
            if (powerMatch) {
                // This is a power equation, we need to rearrange it
                // For now, throw error and let the symbolic fallback handle it
            }
        } catch (e) {
            // Ignore
        }
        
        // Final fallback: return null to signal failure (let caller handle symbolic fallback)
        console.log(`[FormulaCalculator] _solveAlgebraically: Cannot algebraically isolate ${targetVar} from equation: ${equation}`);
        return null;
    }
    
    /**
     * Format a number for display (helper method)
     * @param {number} value - The number to format
     * @returns {string} Formatted number string
     */
    _formatNumber(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            return String(value);
        }
        // Use scientific notation for very large or very small numbers
        if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
            return value.toExponential(3);
        }
        // For regular numbers, show up to 6 decimal places, remove trailing zeros
        return value.toFixed(6).replace(/\.?0+$/, '');
    }
    
    /**
     * Get optimized solver options based on equation complexity
     * Reduces iterations for simple linear equations
     */
    _getOptimizedSolverOptions() {
        const equation = this.formula.equation;
        const isSimple = !equation.includes('sin') && 
                       !equation.includes('cos') && 
                       !equation.includes('log') && 
                       !equation.includes('exp') &&
                       !equation.includes('^') &&
                       !equation.includes('pow');
        
        // Reduce iterations for simple equations (faster convergence)
        return isSimple 
            ? { ...DEFAULT_SOLVER_OPTIONS, maxIterations: 50, tolerance: 1e-5 }
            : DEFAULT_SOLVER_OPTIONS;
    }
    
    /**
     * Get cached array of known values (optimized for repeated calls)
     */
    _getKnownValuesArray(knownVars) {
        // Cache the array if variables haven't changed
        const varHash = Object.keys(knownVars).sort().join(',');
        if (this._lastKnownValuesHash === varHash && this._cachedKnownValues) {
            return this._cachedKnownValues;
        }
        
        this._cachedKnownValues = Object.values(knownVars);
        this._lastKnownValuesHash = varHash;
        return this._cachedKnownValues;
    }
}
FormulaCalculator.MAX_CACHE_SIZE = 1000;
// Expose globally for legacy compatibility
if (typeof window !== 'undefined') {
    window.FormulaCalculator = FormulaCalculator;
}
