/**
 * FormattingUtils - Utility functions for formatting numbers, units, and results
 * Improved: Better precision handling, unit formatting, error messages
 */

export class FormattingUtils {
    /**
     * Format number with appropriate precision
     */
    formatNumber(value: number, precision: number = 6): string {
        if (!isFinite(value)) {
            return String(value);
        }

        if (value === 0) return '0';

        // Use scientific notation for very large/small numbers
        if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
            return value.toExponential(precision - 1);
        }

        // Use fixed notation for normal numbers
        return value.toFixed(precision);
    }

    /**
     * Format result with unit
     */
    formatResult(value: number | string, unit: string = ''): string {
        if (typeof value === 'string') {
            return unit ? `${value} ${unit}` : value;
        }

        if (!isFinite(value)) {
            return unit ? `${value} ${unit}` : String(value);
        }

        const formatted = this.formatNumber(value);
        return unit ? `${formatted} ${unit}` : formatted;
    }

    /**
     * Format error message for display
     */
    formatErrorMessage(error: any): string {
        if (!error) return 'An error occurred';

        let message = error.message || String(error);

        // Improve common error messages
        if (message.includes('null values')) {
            return 'You can leave multiple variables empty or mark them as N/A to get a symbolic expression. For a numeric result, leave exactly one variable empty.';
        }

        if (message.includes('must be null') || message.includes('must be unknown')) {
            return 'Please leave at least one variable empty (or set to "null") to solve for it, or mark variables as N/A for symbolic results.';
        }

        if (message.includes('Invalid number') || message.includes('Cannot parse')) {
            return 'Please enter valid numbers. You can use expressions like "2*pi", "1e10", or "45°" for angles. Use "N/A" for variables you don\'t know.';
        }

        if (message.includes('cannot be zero') || message.includes('Division by zero')) {
            return `Division by zero error: ${message}. Please check your input values.`;
        }

        if (message.includes('must be positive')) {
            return `Invalid input: ${message}. Please enter a positive value.`;
        }

        if (message.includes('not a finite number')) {
            return `Calculation error: ${message}. Please check your input values and see the browser console for details.`;
        }

        return message;
    }

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format confidence interval
     */
    formatConfidenceInterval(value: number, error: number, confidence: number = 95): string {
        const lower = value - error;
        const upper = value + error;
        return `${this.formatNumber(value)} ± ${this.formatNumber(error)} (${confidence}% CI: ${this.formatNumber(lower)} to ${this.formatNumber(upper)})`;
    }

    /**
     * Format scientific notation
     */
    formatScientific(value: number, precision: number = 3): string {
        if (!isFinite(value)) return String(value);
        return value.toExponential(precision);
    }
}

