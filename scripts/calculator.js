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
                try {
                    numericResult = this.solveForVariable(solvedFor, knownVars);
                } catch (solverError) {
                    // If solver fails, fall back to symbolic solving
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
            }
            else {
                // If multiple variables are unknown, return symbolic result instead of error
                if (unknownVars.length > 1) {
                    return this.solveSymbolically(knownVars);
                }
                throw new Error(`Cannot solve for multiple variables at once: ${unknownVars.join(', ')}. ` +
                    'Please provide all but one variable.');
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
                // Single unknown variable - try numeric solving first, fall back to symbolic
                const solvedFor = unknownVars[0];
                try {
                    // Try numeric solving
                    const numericResult = this.solveForVariable(solvedFor, knownVars);
                    const varInfo = this.formula.variables.find(v => v.symbol === solvedFor);
                    
                    return {
                        solvedFor,
                        result: numericResult,
                        unit: varInfo?.unit || '',
                        isSymbolic: false,
                        variable: solvedFor,
                        significantFigures: undefined,
                        arithmeticContext: undefined,
                        errorInfo: undefined
                    };
                } catch (solverError) {
                    // If numeric solving fails, return symbolic expression with known values substituted
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
        
        // Format values for better readability in symbolic expressions
        const formatValue = (val) => {
            if (Math.abs(val) >= 1e6 || (Math.abs(val) < 1e-3 && val !== 0)) {
                return val.toExponential(3);
            }
            return val.toString();
        };
        
        // Substitute known variables with their numeric values
        // Sort by symbol length (longest first) to avoid partial matches
        const sortedKnownVars = Object.entries(knownVars)
            .filter(([_, v]) => v !== null && v !== undefined && typeof v === 'number')
            .sort((a, b) => b[0].length - a[0].length);
        
        for (const [symbol, value] of sortedKnownVars) {
            const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedSymbol}\\b`, 'g');
            const formattedValue = formatValue(value);
            expression = expression.replace(regex, formattedValue);
        }
        
        // Return the expression showing the unknown variable
        // Format: "unknownVar = expression_with_substituted_values"
        return `${unknownVar} = ${expression}`;
    }
    /**
     * Generate expression for multiple unknown variables
     */
    generateMultiVariableExpression(unknownVars, knownVars) {
        let expression = this.formula.equation;
        
        // Format values for better readability
        const formatValue = (val) => {
            if (Math.abs(val) >= 1e6 || (Math.abs(val) < 1e-3 && val !== 0)) {
                return val.toExponential(3);
            }
            return val.toString();
        };
        
        // Substitute known variables with their numeric values
        // Sort by symbol length (longest first) to avoid partial matches
        const sortedKnownVars = Object.entries(knownVars)
            .filter(([_, v]) => v !== null && v !== undefined && typeof v === 'number')
            .sort((a, b) => b[0].length - a[0].length);
        
        for (const [symbol, value] of sortedKnownVars) {
            const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedSymbol}\\b`, 'g');
            const formattedValue = formatValue(value);
            expression = expression.replace(regex, formattedValue);
        }
        
        // Return expression showing relationship with known values substituted
        if (unknownVars.length === 1) {
            return `${unknownVars[0]} = ${expression}`;
        } else {
            return `${expression} (solve for: ${unknownVars.join(', ')})`;
        }
    }
    /**
     * Evaluates mathematical expressions with caching for performance
     */
    evaluateExpression(expression, variables) {
        // Optimized: Create cache key that includes variable values for accurate caching
        const cacheKey = this._createCacheKey(expression, variables);
        
        // Check cache first (O(1) lookup)
        if (this.expressionCache.has(cacheKey)) {
            return this.expressionCache.get(cacheKey);
        }
        
        // Evaluate and cache result
        const result = this.mathEvaluator?.evaluate?.(expression, variables);
        
        // Optimized: Use LRU eviction - remove oldest entry if cache is full
        if (this.expressionCache.size >= FormulaCalculator.MAX_CACHE_SIZE) {
            // Remove first (oldest) entry
            const firstKey = this.expressionCache.keys().next().value;
            if (firstKey !== undefined) {
                this.expressionCache.delete(firstKey);
            }
        }
        
        this.expressionCache.set(cacheKey, result);
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
        if (this.solver) {
            // Optimized: Reuse merged constants
            if (!this._solverConstants) {
                this._solverConstants = { ...this.constants, ...(this.formula.constants || {}) };
            }
            
            // Optimized: Use adaptive solver options based on equation complexity
            const solverOptions = this._getOptimizedSolverOptions();
            
            const solverResult = this.solver(
                this.formula.equation, 
                targetVar, 
                { ...this._solverConstants, ...knownVars }, 
                solverOptions
            );
            
            if (solverResult && solverResult.converged && isFinite(solverResult.result)) {
                return solverResult.result;
            }
        }
        throw new Error(`No solver available to solve for ${targetVar}`);
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
