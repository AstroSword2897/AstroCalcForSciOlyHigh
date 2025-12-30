/**
 * CalculationError - Enhanced error with structured context
 * Provides detailed information about calculation failures
 */

export interface ErrorContext {
    formula?: string;
    variable?: string;
    inputs?: Record<string, unknown>;
    step?: string;
    timestamp?: string;
    [key: string]: unknown;
}

export class CalculationError extends Error {
    public readonly name = 'CalculationError';
    public readonly context: ErrorContext;

    constructor(message: string, context: ErrorContext = {}) {
        super(message);
        this.context = {
            formula: context.formula || 'unknown',
            variable: context.variable || 'unknown',
            inputs: context.inputs || {},
            step: context.step || 'unknown',
            timestamp: new Date().toISOString(),
            ...context
        };
        
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CalculationError);
        }
    }
    
    /**
     * Convert error to JSON for logging/debugging
     */
    toJSON(): Record<string, unknown> {
        return {
            error: this.message,
            name: this.name,
            formula: this.context.formula,
            variable: this.context.variable,
            inputs: this.context.inputs,
            step: this.context.step,
            timestamp: this.context.timestamp,
            stack: this.stack
        };
    }
    
    /**
     * Get user-friendly error message
     */
    getUserMessage(): string {
        let msg = this.message;
        if (this.context.formula !== 'unknown') {
            msg += ` (Formula: ${this.context.formula})`;
        }
        if (this.context.variable !== 'unknown') {
            msg += ` (Variable: ${this.context.variable})`;
        }
        if (this.context.step !== 'unknown') {
            msg += ` (Step: ${this.context.step})`;
        }
        return msg;
    }
}

