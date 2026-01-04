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
        this.constants = { ...DEFAULT_CONSTANTS, ...options.constants };
        this.solver = options.solver;
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
            const knownVars = {};
            const unknownVars = [];
            for (const variable of this.formula.variables) {
                const provided = variableValues[variable.symbol];
                if (provided !== undefined && provided !== null) {
                    knownVars[variable.symbol] = provided;
                    continue;
                }
                // If optional and has a default, treat as known.
                if (!variable.required && variable.defaultValue !== undefined && variable.defaultValue !== null) {
                    knownVars[variable.symbol] = variable.defaultValue;
                    continue;
                }
                unknownVars.push(variable.symbol);
            }
            let solvedFor;
            let numericResult;
            if (unknownVars.length === 0) {
                solvedFor = 'result';
                numericResult = this.evaluateFormula(knownVars);
            }
            else if (unknownVars.length === 1) {
                solvedFor = unknownVars[0];
                // Check if we should do symbolic solving (when variable is null/undefined)
                const targetValue = knownVars[solvedFor];
                if (targetValue === null || targetValue === undefined) {
                    // Symbolic solving
                    return {
                        solvedFor,
                        result: this.generateSymbolicExpression(solvedFor, knownVars),
                        unit: '',
                        isSymbolic: true,
                        variable: solvedFor,
                        significantFigures: undefined,
                        arithmeticContext: undefined,
                        errorInfo: undefined
                    };
                }
                else {
                    // Numeric solving
                    numericResult = this.solveForVariable(solvedFor, knownVars);
                }
            }
            else {
                throw new Error(`Cannot solve for multiple variables at once: ${unknownVars.join(', ')}. ` +
                    'Please provide all but one variable.');
            }
            let significantFigures;
            let arithmeticContext;
            let errorInfo;
            if (this.precisionCalculator) {
                try {
                    const precision = this.precisionCalculator.calculatePrecision(
                        numericResult, 
                        Object.values(knownVars)
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
                    const errors = Object.fromEntries(Object.entries(knownVars).map(([key, value]) => [key, 0.01 * Math.abs(value)]));
                    const errorResult = this.errorPropagator.calculateAbsoluteError(this.formula.equation, { ...knownVars, ...(solvedFor !== 'result' ? { [solvedFor]: numericResult } : {}) }, errors);
                    const ci95 = 1.96 * errorResult.absolute;
                    const ci99 = 2.576 * errorResult.absolute;
                    errorInfo = {
                        absolute: errorResult.absolute,
                        relative: errorResult.relative,
                        ci95,
                        ci99
                    };
                }
                catch (e) {
                    // ignore error propagation failures
                }
            }
            const unit = solvedFor === 'result'
                ? ''
                : (this.formula.variables.find(v => v.symbol === solvedFor)?.unit || '');
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
                errorInfo
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
                return {
                    solvedFor: 'result',
                    result: result.toString(),
                    unit: '',
                    isSymbolic: false,
                    variable: 'result',
                    significantFigures: undefined,
                    arithmeticContext: undefined,
                    errorInfo: undefined
                };
            }
            
            if (unknownVars.length === 1) {
                // Single unknown variable, solve for it
                const solvedFor = unknownVars[0];
                const symbolicExpression = this.generateSymbolicExpression(solvedFor, knownVars);
                
                return {
                    solvedFor,
                    result: symbolicExpression,
                    unit: this.formula.variables.find(v => v.symbol === solvedFor)?.unit || '',
                    isSymbolic: true,
                    variable: solvedFor,
                    significantFigures: undefined,
                    arithmeticContext: undefined,
                    errorInfo: undefined
                };
            }
            
            // Multiple unknown variables - return expression with all unknowns
            const expression = this.generateMultiVariableExpression(unknownVars, knownVars);
            
            return {
                solvedFor: unknownVars,
                result: expression,
                unit: '',
                isSymbolic: true,
                variable: unknownVars,
                significantFigures: undefined,
                arithmeticContext: undefined,
                errorInfo: undefined
            };
            
        } catch (error) {
            throw new Error(`Symbolic solving failed: ${error.message}`);
        } finally {
            void (performance.now() - startTime);
        }
    }
    /**
     * Generate symbolic expression for a single unknown variable
     */
    generateSymbolicExpression(unknownVar, knownVars) {
        // Start with the equation
        let expression = this.formula.equation;
        
        // Substitute known variables
        for (const [symbol, value] of Object.entries(knownVars)) {
            if (value !== null && value !== undefined) {
                const regex = new RegExp(`\\b${symbol}\\b`, 'g');
                expression = expression.replace(regex, value.toString());
            }
        }
        
        // Return the expression with the unknown variable isolated
        // This is a simplified version - a full implementation would require algebraic manipulation
        return `${unknownVar} = f(${expression})`;
    }
    /**
     * Generate expression for multiple unknown variables
     */
    generateMultiVariableExpression(unknownVars, knownVars) {
        let expression = this.formula.equation;
        
        // Substitute known variables
        for (const [symbol, value] of Object.entries(knownVars)) {
            if (value !== null && value !== undefined) {
                const regex = new RegExp(`\\b${symbol}\\b`, 'g');
                expression = expression.replace(regex, value.toString());
            }
        }
        
        // Return expression showing relationship between unknowns
        return `Relationship: ${expression} (unknowns: ${unknownVars.join(', ')})`;
    }
    /**
     * Evaluates mathematical expressions with caching for performance
     */
    evaluateExpression(expression, variables) {
        // Check cache first
        if (this.expressionCache.has(expression)) {
            return this.expressionCache.get(expression);
        }
        // Evaluate and cache result
        const result = this.mathEvaluator?.evaluate?.(expression, variables);
        // Manage cache size
        if (this.expressionCache.size >= FormulaCalculator.MAX_CACHE_SIZE) {
            const firstKey = this.expressionCache.keys().next().value;
            if (firstKey !== undefined) {
                this.expressionCache.delete(firstKey);
            }
        }
        this.expressionCache.set(expression, result);
        return result;
    }
    /**
     * Evaluates the formula equation for solving
     */
    evaluateFormula(variables) {
        const allValues = { ...this.constants, ...variables };
        return this.evaluateExpression(this.formula.equation, allValues);
    }
    solveForVariable(targetVar, knownVars) {
        if (this.solver) {
            const solverResult = this.solver(this.formula.equation, targetVar, { ...this.constants, ...(this.formula.constants || {}), ...knownVars }, DEFAULT_SOLVER_OPTIONS);
            if (solverResult && solverResult.converged && isFinite(solverResult.result)) {
                return solverResult.result;
            }
        }
        throw new Error(`No solver available to solve for ${targetVar}`);
    }
}
FormulaCalculator.MAX_CACHE_SIZE = 1000;
// Expose globally for legacy compatibility
if (typeof window !== 'undefined') {
    window.FormulaCalculator = FormulaCalculator;
}
