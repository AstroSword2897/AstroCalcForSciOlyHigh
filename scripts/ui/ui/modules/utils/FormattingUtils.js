/**
 * FormattingUtils - Utility functions for formatting numbers, units, and results
 * Improved: Better precision handling, unit formatting, error messages
 */
export class FormattingUtils {
    /**
     * Format number with appropriate precision (default Desmos-like: 15 significant figures).
     */
    formatNumber(value, precision = 15) {
        if (!Number.isFinite(value)) {
            return String(value);
        }
        if (value === 0) return '0';
        const abs = Math.abs(value);
        // Scientific for very large or very small
        if (abs >= 1e10 || (abs < 1e-6 && abs > 0)) {
            const exp = value.toExponential(Math.min(precision - 1, 14));
            return exp.replace(/(\.\d*?)0+e/, '$1e');
        }
        // Decimal: enough digits for precision, strip trailing zeros
        const magnitude = Math.floor(Math.log10(abs)) + 1;
        const decimals = Math.max(0, precision - magnitude);
        let s = value.toFixed(decimals);
        if (s.indexOf('.') !== -1) s = s.replace(/\.?0+$/, '');
        return s;
    }
    /**
     * Format result with unit
     */
    formatResult(value, unit = '') {
        if (typeof value === 'string') {
            return unit ? `${value} ${unit}` : value;
        }
        if (!Number.isFinite(value)) {
            return unit ? `${value} ${unit}` : String(value);
        }
        const formatted = this.formatNumber(value);
        return unit ? `${formatted} ${unit}` : formatted;
    }
    /**
     * Format error message for display
     */
    formatErrorMessage(error) {
        if (!error)
            return 'An error occurred';
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
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * Format confidence interval
     */
    formatConfidenceInterval(value, error, confidence = 95) {
        const lower = value - error;
        const upper = value + error;
        return `${this.formatNumber(value)} ± ${this.formatNumber(error)} (${confidence}% CI: ${this.formatNumber(lower)} to ${this.formatNumber(upper)})`;
    }
    /**
     * Format scientific notation
     */
    formatScientific(value, precision = 3) {
        if (!Number.isFinite(value))
            return String(value);
        return value.toExponential(precision);
    }
}
