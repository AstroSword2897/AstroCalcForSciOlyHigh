/**
 * SolverValidator - Validates solver inputs and results
 * Provides consistent error handling across all solvers
 */

import { CalculationError } from './CalculationError';

export class SolverValidator {
    /**
     * Validate that a value is not zero (for division operations)
     * @throws {Error} If value is zero
     */
    static checkNonZero(value: number, varName: string): void {
        if (value === 0 || value === null || value === undefined) {
            throw new Error(`${varName} cannot be zero. Division by zero is not allowed.`);
        }
        if (!isFinite(value)) {
            throw new Error(`${varName} must be a finite number, got: ${value}`);
        }
    }
    
    /**
     * Validate that a value is positive
     * @throws {Error} If value is not positive
     */
    static checkPositive(value: number, varName: string): void {
        if (value <= 0 || !isFinite(value)) {
            throw new Error(`${varName} must be a positive finite number, got: ${value}`);
        }
    }
    
    /**
     * Validate division operation (check divisor is not zero)
     * @returns Result of division
     * @throws {Error} If divisor is zero
     */
    static safeDivide(dividend: number, divisor: number, divisorName: string = 'divisor'): number {
        this.checkNonZero(divisor, divisorName);
        const result = dividend / divisor;
        if (!isFinite(result)) {
            throw new Error(`Division result is not finite: ${dividend} / ${divisor}`);
        }
        return result;
    }
    
    /**
     * Validate result is finite and valid
     * @throws {CalculationError} If result is invalid with comprehensive error details
     */
    static validateResult(
        result: number, 
        operation: string = 'calculation', 
        context: Record<string, unknown> = {}
    ): number {
        if (result === null || result === undefined) {
            throw new CalculationError(
                `${operation} returned null or undefined. This may indicate a solver error or missing input.`,
                {
                    step: 'Result validation',
                    operation: operation,
                    result: result,
                    ...context
                }
            );
        }
        if (typeof result !== 'number') {
            throw new CalculationError(
                `${operation} returned non-numeric value: ${typeof result}. Expected a number.`,
                {
                    step: 'Result validation',
                    operation: operation,
                    resultType: typeof result,
                    result: result,
                    ...context
                }
            );
        }
        if (isNaN(result)) {
            throw new CalculationError(
                `${operation} returned NaN (Not a Number). This may indicate invalid mathematical operations (e.g., sqrt of negative number, 0/0).`,
                {
                    step: 'Result validation',
                    operation: operation,
                    result: result,
                    ...context
                }
            );
        }
        if (!isFinite(result)) {
            let errorMsg = `${operation} returned non-finite value: ${result}.`;
            if (result === Infinity || result === -Infinity) {
                errorMsg += ' This may indicate division by zero, overflow, or extremely large input values.';
            }
            throw new CalculationError(
                errorMsg,
                {
                    step: 'Result validation',
                    operation: operation,
                    result: result,
                    ...context
                }
            );
        }
        
        // Additional validation for extreme values (potential overflow/underflow)
        if (Math.abs(result) > 1e100) {
            console.warn(`[SolverValidator] Very large result from ${operation}: ${result} (possible overflow)`);
        }
        if (result !== 0 && Math.abs(result) < 1e-100) {
            console.warn(`[SolverValidator] Very small result from ${operation}: ${result} (possible underflow)`);
        }
        
        return result;
    }
}

