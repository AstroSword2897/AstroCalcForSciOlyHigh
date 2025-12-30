/**
 * CalculationUtils - Pure utility functions for parsing and validation
 * Improved: Better error handling, type safety, performance
 */
export interface ExpressionParser {
    parse(expression: string, unit?: string | null): number | null;
}
export interface SafeMathEvaluator {
    evaluate(expression: string, scope: Record<string, number>): number;
}
export declare class CalculationUtils {
    private expressionParser?;
    private safeMathEvaluator?;
    constructor(expressionParser?: ExpressionParser, safeMathEvaluator?: SafeMathEvaluator);
    /**
     * Parse numeric value from input string
     */
    parseNumericValue(input: string | number | null | undefined, unit?: string | null): number | null;
    /**
     * Safely evaluate expression
     */
    safeEvaluateExpression(expression: string, values?: Record<string, number>, constants?: Record<string, number>): number | null;
    /**
     * Replace variables in expression with numeric values
     */
    replaceVariables(expression: string, values?: Record<string, number>, constants?: Record<string, number>): string;
    /**
     * Validate numeric input
     */
    isValidNumber(value: any): boolean;
    /**
     * Format number with significant figures
     */
    formatWithSignificantFigures(value: number, sigFigs: number): string;
}
