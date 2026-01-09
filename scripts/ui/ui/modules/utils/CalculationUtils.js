/**
 * CalculationUtils - Pure utility functions for parsing and validation
 * Improved: Better error handling, type safety, performance
 */
export class CalculationUtils {
    constructor(expressionParser, safeMathEvaluator) {
        this.expressionParser = expressionParser;
        this.safeMathEvaluator = safeMathEvaluator;
    }
    /**
     * Parse numeric value from input string
     */
    parseNumericValue(input, unit = null) {
        if (input === null || input === undefined || input === '') {
            return null;
        }
        // Normalize input
        let normalized = String(input).trim()
            .replace(/[\u2013\u2014\u2212]/g, '-') // Unicode minus signs
            .replace(/[\u00A0]/g, ' '); // Non-breaking spaces
        // If already a number, validate and return
        if (typeof input === 'number') {
            if (isNaN(input) || !Number.isFinite(input))
                return null;
            if (Math.abs(input) > Number.MAX_SAFE_INTEGER) {
                console.warn('[CalculationUtils] Number exceeds MAX_SAFE_INTEGER:', input);
            }
            return input;
        }
        // Try ExpressionParser first
        if (this.expressionParser?.parse) {
            try {
                const parsed = this.expressionParser.parse(normalized, unit);
                if (parsed !== null && typeof parsed === 'number' && Number.isFinite(parsed)) {
                    return parsed;
                }
            }
            catch (e) {
                // Fall through to parseFloat
            }
        }
        // Fallback to parseFloat
        const parsed = parseFloat(normalized);
        if (!isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
        }
        return null;
    }
    /**
     * Safely evaluate expression
     */
    safeEvaluateExpression(expression, values = {}, constants = {}) {
        if (!expression || typeof expression !== 'string') {
            return null;
        }
        // Try SafeMathEvaluator first
        if (this.safeMathEvaluator?.evaluate) {
            try {
                return this.safeMathEvaluator.evaluate(expression, { ...values, ...constants });
            }
            catch (e) {
                // Fall through
            }
        }
        // Try ExpressionParser
        if (this.expressionParser?.parse) {
            try {
                return this.expressionParser.parse(expression);
            }
            catch (e) {
                // Fall through
            }
        }
        console.warn('[CalculationUtils] No safe evaluator available for:', expression);
        return null;
    }
    /**
     * Replace variables in expression with numeric values
     */
    replaceVariables(expression, values = {}, constants = {}) {
        if (!expression || typeof expression !== 'string') {
            return expression;
        }
        const allValues = { ...values, ...constants };
        let result = expression;
        // Sort by length descending to avoid partial replacements
        const symbols = Object.keys(allValues).sort((a, b) => b.length - a.length);
        symbols.forEach(symbol => {
            const value = allValues[symbol];
            if (value !== null && value !== undefined && Number.isFinite(value)) {
                const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                result = result.replace(regex, value.toString());
            }
        });
        // Replace Unicode operators
        result = result.replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/√/g, 'Math.sqrt');
        return result;
    }
    /**
     * Validate numeric input
     */
    isValidNumber(value) {
        if (typeof value === 'number') {
            return !isNaN(value) && Number.isFinite(value);
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return !isNaN(parsed) && Number.isFinite(parsed);
        }
        return false;
    }
    /**
     * Format number with significant figures
     */
    formatWithSignificantFigures(value, sigFigs) {
        if (!Number.isFinite(value))
            return String(value);
        if (value === 0)
            return '0';
        const magnitude = Math.floor(Math.log10(Math.abs(value)));
        const factor = Math.pow(10, sigFigs - 1 - magnitude);
        const rounded = Math.round(value * factor) / factor;
        return rounded.toPrecision(sigFigs);
    }
}
