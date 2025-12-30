/**
 * FormattingUtils - Utility functions for formatting numbers, units, and results
 * Improved: Better precision handling, unit formatting, error messages
 */
export declare class FormattingUtils {
    /**
     * Format number with appropriate precision
     */
    formatNumber(value: number, precision?: number): string;
    /**
     * Format result with unit
     */
    formatResult(value: number | string, unit?: string): string;
    /**
     * Format error message for display
     */
    formatErrorMessage(error: any): string;
    /**
     * Escape HTML for safe display
     */
    escapeHtml(text: string): string;
    /**
     * Format confidence interval
     */
    formatConfidenceInterval(value: number, error: number, confidence?: number): string;
    /**
     * Format scientific notation
     */
    formatScientific(value: number, precision?: number): string;
}
