/**
 * FormulaCalculator - Core calculation engine
 * TypeScript implementation with proper types and dependency injection
 */

import type { Formula, CalculationResult } from './types/formula';
import type { 
  PrecisionCalculator, 
  ErrorPropagator, 
  UnitConverter, 
  MathEvaluator, 
  SolverOptions, 
  SolverFunction
} from './types/calculator';

// Default constants if not provided
const DEFAULT_CONSTANTS: Record<string, number> = {
  G: 6.67430e-11,  // Gravitational constant
  c: 2.99792458e8,  // Speed of light
  h: 6.62607015e-34, // Planck's constant
  // Add other constants as needed
};

// Default solver options
const DEFAULT_SOLVER_OPTIONS: Required<SolverOptions> = {
  maxIterations: 100,
  tolerance: 1e-6,
  initialGuess: 1.0,
  precision: 8
};

// Type guard for number or null values
const isNumberOrNull = (value: unknown): value is number | null => {
  return value === null || typeof value === 'number';
};

export class FormulaCalculator {
    private readonly formula: Formula;
    private readonly precisionCalculator?: PrecisionCalculator;
    private readonly errorPropagator?: ErrorPropagator;
    private readonly unitConverter?: UnitConverter;
    private readonly mathEvaluator?: MathEvaluator;
    private readonly constants: Record<string, number>;
    private readonly solver?: SolverFunction;

    // Performance optimization: expression cache
    private expressionCache = new Map<string, any>();
    private static readonly MAX_CACHE_SIZE = 1000;

    constructor(
        formula: Formula,
        options: {
            precisionCalculator?: PrecisionCalculator;
            errorPropagator?: ErrorPropagator;
            unitConverter?: UnitConverter;
            mathEvaluator?: MathEvaluator;
            constants?: Record<string, number>;
            solver?: SolverFunction;
        } = {}
    ) {
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
    private validateInputs(variableValues: Record<string, number | null>): void {
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
            if (!varDef) continue;

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
    solve(variableValues: Record<string, number | null>): CalculationResult {
        const startTime = performance.now();

        try {
            this.validateInputs(variableValues);

            const knownVars: Record<string, number> = {};
            const unknownVars: string[] = [];

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

            let solvedFor: string;
            let numericResult: number;

            if (unknownVars.length === 0) {
                solvedFor = 'result';
                numericResult = this.evaluateFormula(knownVars);
            } else if (unknownVars.length === 1) {
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
                } else {
                    // Numeric solving
                    numericResult = this.solveForVariable(solvedFor, knownVars);
                }
            } else {
                throw new Error(
                    `Cannot solve for multiple variables at once: ${unknownVars.join(', ')}. ` +
                    'Please provide all but one variable.'
                );
            }

            let significantFigures: number | undefined;
            let arithmeticContext: CalculationResult['arithmeticContext'] | undefined;
            if (this.precisionCalculator) {
                const precision = this.precisionCalculator.determinePrecision(Object.values(knownVars));
                significantFigures = precision.significantFigures;
                arithmeticContext = {
                    stability: precision.stability,
                    precision: 'standard'
                };
            }

            let errorInfo: CalculationResult['errorInfo'] | undefined;
            if (this.errorPropagator) {
                try {
                    const errors = Object.fromEntries(
                        Object.entries(knownVars).map(([key, value]) => [key, 0.01 * Math.abs(value)])
                    );

                    const errorResult = this.errorPropagator.calculateAbsoluteError(
                        this.formula.equation,
                        { ...knownVars, ...(solvedFor !== 'result' ? { [solvedFor]: numericResult } : {}) },
                        errors
                    );

                    const ci95 = 1.96 * errorResult.absolute;
                    const ci99 = 2.576 * errorResult.absolute;

                    errorInfo = {
                        absoluteError: errorResult.absolute,
                        relativeError: errorResult.relative,
                        confidenceInterval95: ci95,
                        confidenceInterval99: ci99
                    };
                } catch {
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
                ...(significantFigures !== undefined ? { significantFigures } : {}),
                ...(arithmeticContext ? { arithmeticContext } : {}),
                ...(errorInfo ? { errorInfo } : {})
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Calculation failed: ${message}`);
        }
    }

    /**
     * Generates symbolic expression for solving a variable
     */
    private generateSymbolicExpression(targetVar: string, knownVars: Record<string, number>): string {
        // For Kepler's Third Law: P^2 = a^3 / M
        // If solving for P: P = sqrt(a^3 / M)
        // If solving for a: a = (P^2 * M)^(1/3)
        // If solving for M: M = a^3 / P^2
        
        const { a, M, P } = knownVars;
        
        switch (targetVar) {
            case 'P':
                if (a && M) {
                    return `sqrt(${a}^3 / ${M})`;
                } else if (a) {
                    return `sqrt(${a}^3 / M)`;
                } else if (M) {
                    return `sqrt(a^3 / ${M}^2)`;
                }
                return 'sqrt(a^3 / M)';
                
            case 'a':
                if (P && M) {
                    return `(${P}^2 * ${M})^(1/3)`;
                } else if (P) {
                    return `(${P}^2 * M)^(1/3)`;
                } else if (M) {
                    return '(P^2 * M)^(1/3)';
                }
                return '(P^2 * M)^(1/3)';
                
            case 'M':
                if (P && a) {
                    return `${a}^3 / ${P}^2`;
                } else if (P) {
                    return `a^3 / P^2`;
                } else if (a) {
                    return 'a^3 / P^2';
                }
                return 'a^3 / P^2';
                
            default:
                return `${targetVar} = symbolic_expression`;
        }
    }

    /**
     * Evaluates mathematical expressions with caching for performance
     */
    private evaluateExpression(expression: string, variables: Record<string, number>): any {
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
    private evaluateFormula(variables: Record<string, number>): any {
        const allValues = { ...this.constants, ...variables };
        return this.evaluateExpression(this.formula.equation, allValues);
    }

    private solveForVariable(targetVar: string, knownVars: Record<string, number>): number {
        if (this.solver) {
            const solverResult = this.solver(
                this.formula.equation,
                targetVar,
                { ...this.constants, ...(this.formula.constants || {}), ...knownVars },
                DEFAULT_SOLVER_OPTIONS
            );

            if (solverResult && solverResult.converged && isFinite(solverResult.result)) {
                return solverResult.result;
            }
        }

        throw new Error(`No solver available to solve for ${targetVar}`);
    }

    
}

// Export as default for convenience
export default FormulaCalculator;

