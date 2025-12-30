/**
 * FormulaCalculator - Core calculation engine
 * Converted to TypeScript with proper types and ES module exports
 * 
 * Handles calculation logic for a specific formula. Can solve for:
 * - Single unknown variable (numerical result)
 * - Multiple unknown variables (symbolic expression)
 * - Variables marked as "N/A" (excluded from calculation)
 */

import { Formula, Variable, CalculationResult } from '../types/formula';
import { VariableNormalizer } from './VariableNormalizer';
import { CalculationError } from './CalculationError';
import { InputValidator } from './InputValidator';
import { SolverValidator } from './SolverValidator';
import { SafeMathEvaluator } from './SafeMathEvaluator';

// Dependencies that will be injected or available globally
declare const globalConstants: Record<string, number>;
declare const performanceOptimizer: any;
declare const calculationCache: any;
declare const ErrorPropagator: any;
declare const roundToSignificantFigures: (value: number, sigFigs: number) => number;

export class FormulaCalculator {
    private formula: Formula;
    
    // Static solver registry - maps formula IDs to solver functions
    static solvers: Record<string, (this: FormulaCalculator, unknownVar: string, vars: Record<string, number>) => number> = {};
    
    constructor(formula: Formula) {
        // Validate formula object
        if (!formula) {
            throw new Error('FormulaCalculator: formula is required');
        }
        if (!formula.id) {
            throw new Error('FormulaCalculator: formula must have an id');
        }
        if (!formula.variables || !Array.isArray(formula.variables)) {
            throw new Error('FormulaCalculator: formula must have a variables array');
        }
        this.formula = formula;
    }
    
    /**
     * Check for common edge cases in calculations
     */
    checkEdgeCases(
        vars: Record<string, number>, 
        requiredVars: string[] = [], 
        mustBePositive: string[] = [], 
        mustBeNonZero: string[] = []
    ): void {
        // Check required variables exist
        for (const varName of requiredVars) {
            if (vars[varName] === undefined || vars[varName] === null) {
                throw new Error(`${varName} is required but not provided`);
            }
            if (!isFinite(vars[varName])) {
                throw new Error(`${varName} must be a finite number, got: ${vars[varName]}`);
            }
        }
        
        // Check must be positive
        for (const varName of mustBePositive) {
            if (vars[varName] !== undefined && vars[varName] <= 0) {
                throw new Error(`${varName} must be positive, got: ${vars[varName]}`);
            }
        }
        
        // Check must be non-zero
        for (const varName of mustBeNonZero) {
            if (vars[varName] !== undefined && vars[varName] === 0) {
                throw new Error(`${varName} cannot be zero`);
            }
        }
    }
    
    /**
     * Validate variable value against physical constraints
     * Ensures calculations are physically meaningful
     */
    validateVariableValue(symbol: string, value: number, varDef?: Variable): void {
        if (!isFinite(value)) {
            throw new Error(`${symbol} must be a finite number, got: ${value}`);
        }
        
        // Physical constraints based on variable type
        const varName = (varDef?.name || symbol).toLowerCase();
        const varSymbol = symbol.toLowerCase();
        
        // Mass must be positive
        const unit = (varDef?.unit || '').toLowerCase();
        const isMagnitude =
            (this.formula && this.formula.id === 'magnitude_flux_relation' && (varSymbol === 'm1' || varSymbol === 'm2')) ||
            varName.includes('magnitude') ||
            unit.includes('magnitude');
        
        const isMass = !isMagnitude && (
            varName.includes('mass') ||
            varSymbol === 'm' ||
            /^m\d+$/.test(varSymbol) ||
            varSymbol === 'm_sun' || varSymbol === 'msun' || varSymbol.includes('m☉') ||
            /^m_/.test(varSymbol) ||
            varSymbol === 'm1' || varSymbol === 'm2' ||
            symbol === 'M' || symbol === 'M1' || symbol === 'M2' || symbol === 'M3'
        );
        
        if (isMass) {
            if (value <= 0) {
                throw new Error(`${symbol} (mass) must be positive, got: ${value}`);
            }
        }
        
        // Albedo is dimensionless in [0, 1]
        if (varName.includes('albedo')) {
            if (value < 0 || value > 1) {
                throw new Error(`${symbol} (albedo) must be between 0 and 1, got: ${value}`);
            }
            return;
        }

        // Scale factor must be positive
        if (varName.includes('scale factor')) {
            if (value <= 0) {
                throw new Error(`${symbol} (scale factor) must be positive, got: ${value}`);
            }
            return;
        }

        // Rates / derivatives can be negative
        const isRateOrDerivative =
            varSymbol.endsWith('_dt') ||
            varSymbol.includes('da_dt') ||
            varSymbol.includes('dadt') ||
            varName.includes('rate') ||
            varName.includes('rate of change') ||
            varName.includes('decay rate');
        if (isRateOrDerivative) {
            return;
        }

        // Distance/radius must be positive
        const isAxisA = (varSymbol === 'a') && (
            varName.includes('semi-major') ||
            varName.includes('axis') ||
            varName.includes('separation') ||
            varName.includes('distance')
        );
        if (varName.includes('distance') || varName.includes('radius') || 
            varName.includes('separation') || varName.includes('semi-major') ||
            varSymbol === 'r' || varSymbol === 'd' || isAxisA ||
            varSymbol.includes('r_') || varSymbol.includes('d_') || varSymbol.includes('a_')) {
            if (value <= 0) {
                throw new Error(`${symbol} (distance/radius) must be positive, got: ${value}`);
            }
        }
        
        // Temperature differences can be zero/negative
        const isTemperatureDelta =
            symbol.startsWith('ΔT') ||
            symbol.toLowerCase().startsWith('delta_t') ||
            varSymbol.includes('delta_t') ||
            varName.includes('temperature difference') ||
            varName.includes('temperature change') ||
            varName.includes('temperature increase');
        if (isTemperatureDelta) {
            return;
        }

        // Temperature must be positive (in Kelvin)
        if (varName.includes('temperature') || varSymbol === 't' || varSymbol.includes('t_')) {
            if (value <= 0) {
                throw new Error(`${symbol} (temperature) must be positive, got: ${value}. Temperature must be in Kelvin.`);
            }
        }
        
        // Pressure gradients can be negative
        const isPressureGradient =
            varSymbol === 'dp_dr' ||
            varSymbol === 'dpdr' ||
            varName.includes('pressure gradient') ||
            (varName.includes('pressure') && varSymbol.startsWith('dp_'));
        if (isPressureGradient) {
            return;
        }

        // Period must be positive
        if (varName.includes('period') || 
            varSymbol.includes('p_') || (varSymbol === 't' && !varName.includes('temperature'))) {
            if (value <= 0) {
                throw new Error(`${symbol} (period/time) must be positive, got: ${value}`);
            }
        }
        
        // Wavelength must be positive
        if (varName.includes('wavelength') || varSymbol === 'λ' || varSymbol.includes('lambda')) {
            if (value <= 0) {
                throw new Error(`${symbol} (wavelength) must be positive, got: ${value}`);
            }
        }
        
        // Frequency must be positive
        if (varName.includes('frequency') || varSymbol === 'f' || varSymbol === 'ν' || 
            varSymbol.includes('nu') || varSymbol.includes('freq')) {
            if (value <= 0) {
                throw new Error(`${symbol} (frequency) must be positive, got: ${value}`);
            }
        }
        
        // Parallax must be positive
        if (varName.includes('parallax') && varSymbol === 'p') {
            if (value <= 0) {
                throw new Error(`${symbol} (parallax) must be positive, got: ${value}`);
            }
        }
    }
    
    /**
     * Check if we can solve for a variable
     */
    canSolveFor(symbol: string): boolean {
        const formulaId = this.formula.id;
        const solver = FormulaCalculator.solvers[formulaId];
        if (!solver) return false;
        
        // Try to solve with dummy values to see if it works
        try {
            const dummyVars: Record<string, number> = {};
            this.formula.variables.forEach(v => {
                if (v.symbol !== symbol) {
                    dummyVars[v.symbol] = 1;
                }
            });
            // Add constants
            const constants = typeof globalConstants !== 'undefined' ? globalConstants : {};
            Object.assign(dummyVars, constants, this.formula.constants || {});
            
            const result = solver.call(this, symbol, dummyVars);
            return result !== null && result !== undefined && isFinite(result);
        } catch (e) {
            return false;
        }
    }

    /**
     * Solve for a specific variable given the other values
     * 
     * Determines which variable to solve for based on which ones are null/empty.
     * If exactly one variable is null, solves numerically.
     * If multiple variables are null or any are "N/A", returns symbolic expression.
     */
    solve(variableValues: Record<string, number | string | null>): CalculationResult {
        // PERFORMANCE: Check multiple cache layers
        if (typeof performanceOptimizer !== 'undefined') {
            const cached = performanceOptimizer.getCachedCalculation(this.formula.id, variableValues);
            if (cached !== null) {
                return cached;
            }
        }
        
        if (typeof calculationCache !== 'undefined') {
            const cached = calculationCache.get(this.formula.id, variableValues);
            if (cached !== null) {
                if (typeof performanceOptimizer !== 'undefined') {
                    performanceOptimizer.cacheCalculation(this.formula.id, variableValues, cached);
                }
                return cached;
            }
        }
        
        const startTime = performance.now();
        
        // ENHANCED: Validate inputs first using InputValidator
        try {
            InputValidator.validateInputs(this.formula, variableValues);
        } catch (error: any) {
            if (error instanceof ReferenceError && error.message.includes('InputValidator')) {
                throw new Error('InputValidator is not defined. The calculator script may not have loaded properly. Please refresh the page.');
            }
            throw new CalculationError(
                `Input validation failed: ${error.message}`,
                {
                    formula: this.formula.id,
                    step: 'Input validation',
                    originalError: error.message
                }
            );
        }
        
        const nullVars: string[] = [];
        const naVars: string[] = [];
        const providedVars: Record<string, number> = {};

        // Treat formula/global constants as always-known
        const constants = typeof globalConstants !== 'undefined' ? globalConstants : {};
        const constantPool = { ...constants, ...(this.formula.constants || {}) };

        // Separate null, N/A, and provided variables
        for (const varDef of this.formula.variables) {
            const symbol = varDef.symbol;
            const value = variableValues[symbol];

            // If this symbol is a known constant and user didn't explicitly override it, treat as provided.
            if ((value === null || value === '' || value === 'null' || value === undefined) &&
                constantPool[symbol] !== undefined &&
                constantPool[symbol] !== null &&
                isFinite(constantPool[symbol])) {
                providedVars[symbol] = constantPool[symbol];
                continue;
            }
            
            if (value === 'N/A' || value === 'n/a' || value === 'na' || value === 'IDK' || value === 'idk') {
                naVars.push(symbol);
            } else if (value === null || value === '' || value === 'null' || value === undefined) {
                nullVars.push(symbol);
            } else {
                // Parse and validate numeric value
                let numValue: number;
                if (typeof value === 'number') {
                    if (!isNaN(value) && isFinite(value)) {
                        numValue = value;
                    } else {
                        throw new Error(`Invalid number for ${symbol}: ${value} (NaN or Infinity)`);
                    }
                } else if (typeof value === 'string') {
                    const trimmed = value.trim();
                    numValue = parseFloat(trimmed);
                    if (isNaN(numValue)) {
                        throw new Error(`Invalid number format for ${symbol}: "${value}". Expected a number.`);
                    }
                    if (!isFinite(numValue)) {
                        throw new Error(`Invalid number for ${symbol}: ${value} (Infinity)`);
                    }
                } else {
                    throw new Error(`Invalid type for ${symbol}: ${typeof value}. Expected number or string.`);
                }
                
                // Validate physical constraints
                this.validateVariableValue(symbol, numValue, varDef);
                
                providedVars[symbol] = numValue;
            }
        }

        // If we have N/A variables, return symbolic expression
        if (naVars.length > 0 || nullVars.length > 1) {
            const allUnknownVars = [...nullVars, ...naVars];
            if (allUnknownVars.length === 0) {
                throw new Error('At least one variable must be unknown (null or N/A)');
            }
            
            // Try to solve symbolically - return expression
            return this.solveSymbolically(allUnknownVars, providedVars, naVars);
        }

        // Standard case: exactly one unknown
        if (nullVars.length === 0) {
            throw new Error('At least one variable must be null (unknown)');
        }

        const unknownVar = nullVars[0];
        const unknownVarDef = this.formula.variables.find(v => v.symbol === unknownVar);
        
        // Normalize unknown variable name
        const normalizedUnknownVar = VariableNormalizer.normalize(unknownVar);
        
        // Determine if this should be a numeric or symbolic solve
        const isSymbolicMode = naVars.length > 0 || nullVars.length > 1;
        
        // Solve for the variable
        let result: number;
        try {
            const varToSolve = this.canSolveFor(normalizedUnknownVar) ? normalizedUnknownVar : unknownVar;
            
            // Check for unknown variable in formula
            const varExists = this.formula.variables.some(v => 
                v.symbol === varToSolve || v.symbol === unknownVar
            );
            if (!varExists) {
                throw new CalculationError(
                    `Variable '${unknownVar}' is not defined in formula '${this.formula.id}'. Available variables: ${this.formula.variables.map(v => v.symbol).join(', ')}`,
                    {
                        formula: this.formula.id,
                        variable: unknownVar,
                        availableVariables: this.formula.variables.map(v => v.symbol),
                        step: 'Variable validation'
                    }
                );
            }
            
            result = this.solveForVariable(varToSolve, providedVars);
        } catch (error: any) {
            if (error instanceof CalculationError) {
                error.context.formula = this.formula.id;
                error.context.variable = unknownVar;
                error.context.inputs = providedVars;
                error.context.mode = isSymbolicMode ? 'symbolic' : 'numeric';
                throw error;
            }
            
            let errorMessage = `Error solving for ${unknownVar}: ${error.message}`;
            if (error.message.includes('zero') || error.message.includes('division')) {
                errorMessage += ' This may indicate a division by zero or invalid input values.';
            } else if (error.message.includes('undefined') || error.message.includes('not found')) {
                errorMessage += ' Ensure all required variables are provided and the formula supports solving for this variable.';
            }
            
            throw new CalculationError(
                errorMessage,
                {
                    formula: this.formula.id,
                    variable: unknownVar,
                    inputs: providedVars,
                    step: 'Variable solving',
                    mode: isSymbolicMode ? 'symbolic' : 'numeric',
                    originalError: error.message
                }
            );
        }
        
        // Validate result
        if (result === null || result === undefined) {
            throw new CalculationError(
                `Solver returned null/undefined for ${unknownVar}. Check input values and ensure the formula can solve for this variable.`,
                {
                    formula: this.formula.id,
                    variable: unknownVar,
                    inputs: providedVars,
                    step: 'Result validation',
                    mode: isSymbolicMode ? 'symbolic' : 'numeric'
                }
            );
        }
        if (!isSymbolicMode && !isFinite(result)) {
            let errorMsg = `Result for ${unknownVar} is ${result}.`;
            if (result === Infinity || result === -Infinity) {
                errorMsg += ' This may indicate division by zero, overflow, or invalid input values.';
            } else if (isNaN(result)) {
                errorMsg += ' This may indicate invalid mathematical operations (e.g., sqrt of negative number).';
            }
            throw new CalculationError(
                errorMsg,
                {
                    formula: this.formula.id,
                    variable: unknownVar,
                    inputs: providedVars,
                    step: 'Result validation',
                    result: result,
                    mode: isSymbolicMode ? 'symbolic' : 'numeric'
                }
            );
        }
        
        const endTime = performance.now();
        // calculationTime available for future use in result object
        const _calculationTime = endTime - startTime;
        
        // Calculate error propagation and confidence intervals
        let errorInfo = null;
        let significantFigures = 6; // Default
        let arithmeticContext = {
            precision: 'standard' as 'standard' | 'reduced' | 'enhanced',
            method: 'direct',
            stability: 'stable' as 'stable' | 'unstable' | 'marginal'
        };
        
        if (!isSymbolicMode && typeof ErrorPropagator !== 'undefined') {
            try {
                const inputErrors = ErrorPropagator.estimateInputErrors(providedVars);
                
                if (Object.keys(inputErrors).length > 0) {
                    errorInfo = ErrorPropagator.propagateError(
                        this.formula,
                        providedVars,
                        inputErrors,
                        result
                    );
                    
                    if (errorInfo) {
                        significantFigures = ErrorPropagator.calculateSignificantFigures(
                            result,
                            errorInfo.absoluteError
                        );
                        
                        if (typeof roundToSignificantFigures === 'function') {
                            const roundedResult = roundToSignificantFigures(result, significantFigures);
                            if (isFinite(roundedResult) && roundedResult !== 0) {
                                // Use rounded value for display, but keep original for calculations
                                // resultObj.displayValue = roundedResult;
                            }
                        }
                    }
                }
                
                // Assess arithmetic stability
                const resultMagnitude = Math.abs(result);
                if (resultMagnitude > 1e50) {
                    arithmeticContext.stability = 'unstable';
                    arithmeticContext.precision = 'reduced';
                } else if (resultMagnitude < 1e-50 && result !== 0) {
                    arithmeticContext.stability = 'unstable';
                    arithmeticContext.precision = 'reduced';
                } else if (resultMagnitude > 1e15 || (resultMagnitude < 1e-15 && result !== 0)) {
                    arithmeticContext.precision = 'reduced';
                }
                
            } catch (e) {
                console.warn('[Calculator] Error propagation failed:', e);
            }
        }
        
        // Build result object
        const resultObj: CalculationResult = {
            result: result,
            solvedFor: unknownVar,
            isSymbolic: isSymbolicMode,
            unit: unknownVarDef ? unknownVarDef.unit : '',
            value: result,
            variable: unknownVar,
            errorInfo: errorInfo,
            significantFigures: significantFigures,
            arithmeticContext: arithmeticContext
        };
        
        // PERFORMANCE: Cache the result
        if (typeof performanceOptimizer !== 'undefined') {
            performanceOptimizer.cacheCalculation(this.formula.id, variableValues, resultObj);
        }
        if (typeof calculationCache !== 'undefined') {
            calculationCache.set(this.formula.id, variableValues, resultObj);
        }
        
        // Validate physical constraints on result
        this.validateVariableValue(unknownVar, result, unknownVarDef);
        
        return resultObj;
    }
    
    /**
     * Solve symbolically when multiple variables are unknown
     */
    solveSymbolically(unknownVars: string[], knownVars: Record<string, number>, naVars: string[]): CalculationResult {
        const formulaId = this.formula.id;
        const constants = typeof globalConstants !== 'undefined' ? globalConstants : {};
        const allConstants = { ...constants, ...(this.formula.constants || {}) };
        
        const MAX_SYMBOLIC_DEPTH = 10;
        const MAX_UNKNOWN_VARS = 5;
        
        if (unknownVars.length > MAX_UNKNOWN_VARS) {
            throw new CalculationError(
                `Too many unknown variables (${unknownVars.length}) for symbolic solving. Maximum allowed: ${MAX_UNKNOWN_VARS}.`,
                {
                    formula: formulaId,
                    unknownVars: unknownVars,
                    step: 'Symbolic solving',
                    maxAllowed: MAX_UNKNOWN_VARS
                }
            );
        }
        
        const validUnknownVars = unknownVars.filter(v => !naVars.includes(v));
        if (validUnknownVars.length === 0 && naVars.length > 0) {
            throw new CalculationError(
                `All variables are marked as N/A. At least one variable must be solvable.`,
                {
                    formula: formulaId,
                    naVars: naVars,
                    step: 'Symbolic solving'
                }
            );
        }
        
        // Create symbolic expressions for all unknown variables
        const equations: Array<{variable: string; expression: string; unit: string}> = [];
        let depth = 0;
        
        for (const unknownVar of validUnknownVars) {
            if (depth >= MAX_SYMBOLIC_DEPTH) {
                throw new CalculationError(
                    `Symbolic expression depth limit (${MAX_SYMBOLIC_DEPTH}) exceeded. Expression may be too complex.`,
                    {
                        formula: formulaId,
                        variable: unknownVar,
                        step: 'Symbolic solving',
                        depth: depth
                    }
                );
            }
            
            const otherUnknowns = validUnknownVars.filter(v => v !== unknownVar);
            const expression = this.createSymbolicExpression(formulaId, unknownVar, knownVars, otherUnknowns, allConstants);
            
            if (!expression || expression.trim() === '') {
                throw new CalculationError(
                    `Failed to create symbolic expression for ${unknownVar}. The formula may not support symbolic solving for this variable.`,
                    {
                        formula: formulaId,
                        variable: unknownVar,
                        step: 'Symbolic expression creation'
                    }
                );
            }
            
            equations.push({
                variable: unknownVar,
                expression: expression,
                unit: this.formula.variables.find(v => v.symbol === unknownVar)?.unit || ''
            });
            
            depth++;
        }
        
        // Return all solutions
        return {
            solvedFor: unknownVars[0],
            result: equations[0].expression,
            unit: equations[0].unit,
            isSymbolic: true,
            allEquations: equations.map(eq => ({
                expression: eq.expression,
                numericValue: undefined
            }))
        };
    }
    
    /**
     * Create a symbolic expression string
     * This is a placeholder - the full implementation will be migrated from calculator.js
     */
    createSymbolicExpression(
        _formulaId: string, 
        primaryVar: string, 
        _knownVars: Record<string, number>, 
        _otherUnknowns: string[], 
        _constants: Record<string, number>
    ): string {
        // TODO: Migrate full implementation from calculator.js
        // For now, return a placeholder
        return `${primaryVar} = ?`;
    }
    
    /**
     * Create symbolic expression from equation string for ANY formula
     */
    createSymbolicFromEquation(primaryVar: string, _allVars: Record<string, number | string>, _otherUnknowns: string[]): string {
        const equation = this.formula.equation;
        if (!equation) {
            return `${primaryVar} = ?`;
        }
        
        // TODO: Migrate full implementation from calculator.js
        return equation;
    }
    
    /**
     * Solve for a specific variable based on the formula
     */
    solveForVariable(unknownVar: string, knownVars: Record<string, number>): number {
        const formulaId = this.formula.id;
        
        // Validate unknown variable exists in formula
        const varDef = this.formula.variables.find(v => v.symbol === unknownVar);
        if (!varDef) {
            const normalizedVar = VariableNormalizer.normalize(unknownVar);
            const varDefNormalized = this.formula.variables.find(v => v.symbol === normalizedVar);
            if (!varDefNormalized) {
                throw new CalculationError(
                    `Variable '${unknownVar}' is not defined in formula '${formulaId}'. Available variables: ${this.formula.variables.map(v => v.symbol).join(', ')}`,
                    {
                        formula: formulaId,
                        variable: unknownVar,
                        availableVariables: this.formula.variables.map(v => v.symbol),
                        step: 'Variable validation'
                    }
                );
            }
        }
        
        // Merge global constants, formula constants, and known variables
        const constants = typeof globalConstants !== 'undefined' ? globalConstants : {};
        const vars = { ...constants, ...(this.formula.constants || {}), ...knownVars };
        
        // Use solver registry
        const solver = FormulaCalculator.solvers[formulaId];
        
        if (!solver) {
            // Try generic equation-based solver as fallback
            if (this.formula.equation) {
                try {
                    const genericResult = this.solveFromEquation(this.formula.equation, unknownVar, vars);
                    if (genericResult !== null && isFinite(genericResult)) {
                        return genericResult;
                    }
                } catch (e) {
                    // Fall through to error message
                }
            }
            
            const availableSolvers = Object.keys(FormulaCalculator.solvers).sort();
            let errorMsg = `No specific solver found for formula: ${formulaId}`;
            errorMsg += `\nVariable: ${unknownVar}`;
            errorMsg += `\nEquation: ${this.formula.equation || 'N/A'}`;
            errorMsg += `\n\nThis formula requires a specific solver function to be implemented.`;
            if (availableSolvers.length > 0) {
                errorMsg += `\n\nAvailable solvers (${availableSolvers.length} total): ${availableSolvers.slice(0, 10).join(', ')}${availableSolvers.length > 10 ? '...' : ''}`;
            }
            errorMsg += `\n\nPlease ensure all required variables are provided and the formula ID is correct.`;
            
            throw new CalculationError(errorMsg, {
                formula: formulaId,
                variable: unknownVar,
                inputs: knownVars,
                step: 'Solver lookup'
            });
        }
        
        try {
            const result = solver.call(this, unknownVar, vars);
            if (result === null || result === undefined) {
                throw new Error(`Solver returned null/undefined for ${unknownVar}`);
            }
            if (!isFinite(result)) {
                throw new Error(`Solver returned non-finite result: ${result}`);
            }
            return SolverValidator.validateResult(result, `Solving ${unknownVar} for ${formulaId}`);
        } catch (error: any) {
            // If the specific solver can't handle this variable, try equation-based fallback
            if (this.formula.equation) {
                try {
                    const genericResult = this.solveFromEquation(this.formula.equation, unknownVar, vars);
                    if (genericResult !== null && isFinite(genericResult)) {
                        return genericResult;
                    }
                } catch (e) {
                    // ignore and fall through
                }
            }

            let errorMessage = `Error solving ${unknownVar} for ${formulaId}: ${error.message}`;
            
            if (error.message.includes('zero') || error.message.includes('division')) {
                errorMessage += ' Check that all divisor variables are non-zero.';
            } else if (error.message.includes('undefined') || error.message.includes('not found')) {
                errorMessage += ' Ensure all required variables are provided.';
            } else if (error.message.includes('non-finite') || error.message.includes('Infinity') || error.message.includes('NaN')) {
                errorMessage += ' This may indicate invalid input values or mathematical impossibility (e.g., sqrt of negative number).';
            }
            
            throw new CalculationError(
                errorMessage,
                {
                    formula: formulaId,
                    variable: unknownVar,
                    inputs: knownVars,
                    step: 'Variable solving',
                    originalError: error.message
                }
            );
        }
    }
    
    /**
     * Solve from equation string (generic fallback)
     * TODO: Migrate full implementation from calculator.js
     */
    solveFromEquation(_equation: string, _unknownVar: string, _vars: Record<string, number>): number | null {
        // TODO: Migrate full implementation from calculator.js
        return null;
    }
    
    /**
     * Evaluate expression with variables
     * TODO: Migrate full implementation from calculator.js
     */
    evaluateExpression(expression: string, vars: Record<string, number>, unknownVar: string): number | null {
        // Use SafeMathEvaluator for safe evaluation
        try {
            return SafeMathEvaluator.evaluate(expression, vars);
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Convert symbolic expression to LaTeX format
     */
    toLatex(expression: string): string {
        if (!expression || typeof expression !== 'string') {
            return expression || '';
        }
        
        // Convert common math symbols and operations to LaTeX
        let latex = expression
            .replace(/Φ/g, '\\Phi')
            .replace(/θ/g, '\\theta')
            .replace(/λ/g, '\\lambda')
            .replace(/π/g, '\\pi')
            .replace(/σ/g, '\\sigma')
            .replace(/τ/g, '\\tau')
            .replace(/ρ/g, '\\rho')
            .replace(/Ω/g, '\\Omega')
            .replace(/α/g, '\\alpha')
            .replace(/β/g, '\\beta')
            .replace(/γ/g, '\\gamma')
            .replace(/Δ/g, '\\Delta')
            .replace(/ν/g, '\\nu')
            .replace(/_([a-zA-Z0-9]+)/g, '_{$1}')
            .replace(/\^([0-9]+)/g, '^{$1}')
            .replace(/([a-zA-Z])\^([0-9]+)/g, '$1^{$2}')
            .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
            .replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}')
            .replace(/×/g, ' \\times ')
            .replace(/log₁₀\(([^)]+)\)/g, '\\log_{10}\\left($1\\right)')
            .replace(/log10\(([^)]+)\)/g, '\\log_{10}\\left($1\\right)')
            .replace(/ln\(([^)]+)\)/g, '\\ln\\left($1\\right)')
            .replace(/([a-zA-Z0-9]+)³/g, '$1^3')
            .replace(/([a-zA-Z0-9]+)²/g, '$1^2')
            .replace(/([a-zA-Z0-9]+)⁴/g, '$1^4')
            .replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}')
            .replace(/\(/g, '\\left(')
            .replace(/\)/g, '\\right)');
        
        return latex;
    }
    
    /**
     * Get all possible rearrangements of the formula
     */
    getAllSolutions(): Array<{variable: string; expression: string; unit: string; latex: string}> {
        const solutions: Array<{variable: string; expression: string; unit: string; latex: string}> = [];
        const formulaId = this.formula.id;
        const constants = typeof globalConstants !== 'undefined' ? globalConstants : {};
        const allConstants = { ...constants, ...(this.formula.constants || {}) };
        
        // For each variable, try to create a symbolic expression
        this.formula.variables.forEach(varDef => {
            const symbol = varDef.symbol;
            // Skip constants
            if (allConstants[symbol] !== undefined) return;
            
            try {
                const otherVars = this.formula.variables
                    .filter(v => v.symbol !== symbol)
                    .map(v => v.symbol);
                
                const expression = this.createSymbolicExpression(
                    formulaId, 
                    symbol, 
                    {}, 
                    otherVars, 
                    allConstants
                );
                
                if (expression && expression !== this.formula.equation) {
                    solutions.push({
                        variable: symbol,
                        expression: expression,
                        unit: varDef.unit || '',
                        latex: this.toLatex(expression)
                    });
                }
            } catch (e) {
                // Skip if can't solve for this variable
            }
        });
        
        return solutions;
    }
    
    /**
     * Find closest match using Levenshtein distance
     * TODO: Migrate from calculator.js
     */
    findClosestMatch(target: string, candidates: string[]): string | null {
        // TODO: Implement Levenshtein distance algorithm
        return null;
    }
}

