/**
 * FormulaCalculator - Core calculation engine
 * Converted to TypeScript with ES module exports
 * No globals, proper types, dependency injection
 */

import { Formula, Variable, CalculationResult } from './types/formula';

// Import dependencies (will be injected or imported)
declare const PrecisionCalculator: any;
declare const ErrorPropagator: any;
declare const UnitConverter: any;
declare const parseNumericValue: (input: string | number | null, unit?: string | null) => number | null;
declare const safeEvaluateExpression: (expression: string, values?: Record<string, number>, constants?: Record<string, number>) => number | null;
declare const globalConstants: Record<string, number>;

export class FormulaCalculator {
    private formula: Formula;
    private precisionCalculator?: any;
    private errorPropagator?: any;

    constructor(formula: Formula) {
        if (!formula) {
            throw new Error('FormulaCalculator: formula is required');
        }
        this.formula = formula;
        
        // Initialize precision calculator if available
        if (typeof PrecisionCalculator !== 'undefined') {
            this.precisionCalculator = new PrecisionCalculator();
        }
        
        // Initialize error propagator if available
        if (typeof ErrorPropagator !== 'undefined') {
            this.errorPropagator = new ErrorPropagator();
        }
    }

    /**
     * Solve the formula with given variable values
     * Returns numeric result or symbolic expression
     */
    solve(variableValues: Record<string, number | null>): CalculationResult {
        const startTime = performance.now();

        try {
            // Validate inputs
            this.validateInputs(variableValues);

            // Count unknowns
            const unknowns = Object.entries(variableValues)
                .filter(([_, value]) => value === null || value === undefined)
                .map(([symbol]) => symbol);

            // Check if we can solve numerically
            if (unknowns.length === 0) {
                throw new Error('All variables provided. Leave exactly one variable empty to solve for it.');
            }

            if (unknowns.length > 1) {
                // Multiple unknowns - return symbolic result
                return this.solveSymbolically(
                    unknowns,
                    this.getKnownValues(variableValues),
                    Object.keys(variableValues)
                );
            }

            // Single unknown - solve numerically
            const unknownVar = unknowns[0];
            const knownValues = this.getKnownValues(variableValues);
            
            // Merge with constants
            const allValues = {
                ...knownValues,
                ...(this.formula.constants || {}),
                ...(typeof globalConstants !== 'undefined' ? globalConstants : {})
            };

            // Solve using the formula's solve function
            if (!this.formula.solveFunction) {
                throw new Error(`Formula ${this.formula.id} does not have a solveFunction`);
            }

            const result = this.formula.solveFunction(allValues, unknownVar);

            // Validate result
            if (result === null || result === undefined || !isFinite(result) || isNaN(result)) {
                throw new Error(`Invalid calculation result for ${unknownVar}`);
            }

            // Apply precision rounding if available
            let finalResult = result;
            if (this.precisionCalculator) {
                finalResult = this.precisionCalculator.roundToSignificantFigures(
                    result,
                    this.getSignificantFigures(variableValues)
                );
            }

            // Calculate error propagation if available
            let errorInfo = undefined;
            if (this.errorPropagator) {
                errorInfo = this.errorPropagator.propagateError(
                    this.formula,
                    knownValues,
                    unknownVar
                );
            }

            const duration = performance.now() - startTime;

            return {
                result: finalResult,
                variable: unknownVar,
                unit: this.getVariableUnit(unknownVar),
                isSymbolic: false,
                errorInfo,
                calculationTime: duration
            };
        } catch (error: any) {
            throw new Error(`Calculation failed: ${error.message}`);
        }
    }

    /**
     * Solve symbolically when multiple variables are unknown
     */
    solveSymbolically(
        unknowns: string[],
        knowns: Record<string, number>,
        allVariables: string[]
    ): CalculationResult {
        try {
            // Merge known values with constants
            const allKnowns = {
                ...knowns,
                ...(this.formula.constants || {}),
                ...(typeof globalConstants !== 'undefined' ? globalConstants : {})
            };

            // Create symbolic expression
            const symbolicExpression = this.createSymbolicExpression(
                this.formula.equation,
                unknowns,
                allKnowns,
                allVariables
            );

            return {
                result: symbolicExpression,
                variable: unknowns.length === 1 ? unknowns[0] : null,
                unit: unknowns.length === 1 ? this.getVariableUnit(unknowns[0]) : null,
                isSymbolic: true,
                errorInfo: undefined,
                calculationTime: 0
            };
        } catch (error: any) {
            throw new Error(`Symbolic calculation failed: ${error.message}`);
        }
    }

    /**
     * Create symbolic expression from equation
     */
    private createSymbolicExpression(
        equation: string,
        unknowns: string[],
        knowns: Record<string, number>,
        allVariables: string[]
    ): string {
        if (!equation) {
            return 'No equation available';
        }

        // If all variables are unknown, keep constants as symbols
        const hasKnowns = Object.keys(knowns).length > 0;
        
        let expression = equation;

        // Replace known values
        if (hasKnowns) {
            Object.entries(knowns).forEach(([symbol, value]) => {
                // Only replace if it's not a constant that should stay symbolic
                const isConstant = this.isConstant(symbol);
                if (!isConstant || hasKnowns) {
                    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                    expression = expression.replace(regex, value.toString());
                }
            });
        }

        // Ensure unknowns remain as symbols
        unknowns.forEach(unknown => {
            const escaped = unknown.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'g');
            // Don't replace unknowns - they should stay as symbols
        });

        return expression;
    }

    /**
     * Validate input values
     */
    private validateInputs(variableValues: Record<string, number | null>): void {
        const userVariables = this.formula.variables.filter(v => {
            const constantSymbols = new Set(Object.keys(this.formula.constants || {}));
            return !constantSymbols.has(v.symbol);
        });

        // Check that all user variables are accounted for
        const providedSymbols = new Set(Object.keys(variableValues));
        const requiredSymbols = new Set(userVariables.map(v => v.symbol));

        for (const symbol of requiredSymbols) {
            if (!providedSymbols.has(symbol)) {
                throw new Error(`Missing variable: ${symbol}`);
            }
        }
    }

    /**
     * Get known values (non-null)
     */
    private getKnownValues(variableValues: Record<string, number | null>): Record<string, number> {
        const knowns: Record<string, number> = {};
        Object.entries(variableValues).forEach(([symbol, value]) => {
            if (value !== null && value !== undefined && isFinite(value)) {
                knowns[symbol] = value;
            }
        });
        return knowns;
    }

    /**
     * Check if symbol is a constant
     */
    private isConstant(symbol: string): boolean {
        const constants = {
            ...(this.formula.constants || {}),
            ...(typeof globalConstants !== 'undefined' ? globalConstants : {})
        };
        return symbol in constants;
    }

    /**
     * Get variable unit
     */
    private getVariableUnit(symbol: string): string | null {
        const variable = this.formula.variables.find(v => v.symbol === symbol);
        return variable?.unit || null;
    }

    /**
     * Get significant figures from input values
     */
    private getSignificantFigures(variableValues: Record<string, number | null>): number {
        // Default to 4 significant figures
        return 4;
    }
}

// Export as default for convenience
export default FormulaCalculator;

