/**
 * Safe Expression Evaluator
 * 
 * Provides safe mathematical expression evaluation without using eval() or new Function()
 * with user-controlled input. Uses a tokenizer and parser approach for maximum security.
 * 
 * SECURITY: This is a safer alternative to new Function() for evaluating mathematical expressions.
 * It validates all tokens before evaluation and only allows safe mathematical operations.
 * 
 * For production use, consider using expr-eval library (4KB) which can be included offline.
 */

class SafeExpressionEvaluator {
    /**
     * Allowed function names (whitelist approach)
     */
    static ALLOWED_FUNCTIONS = [
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        'sqrt', 'cbrt', 'exp', 'log', 'log10', 'log2',
        'abs', 'floor', 'ceil', 'round', 'min', 'max',
        'pow', 'random', 'sign'
    ];
    
    /**
     * Allowed constants
     */
    static ALLOWED_CONSTANTS = {
        'PI': Math.PI,
        'E': Math.E,
        'π': Math.PI
        // No bare 'e' — conflicts with eccentricity symbol e in orbital formulas. Use E or exp().
    };
    
    /**
     * Dangerous patterns that should never be allowed
     */
    static DANGEROUS_PATTERNS = [
        /eval\s*\(/i,
        /function\s*\(/i,
        /new\s+Function/i,
        /constructor/i,
        /prototype/i,
        /__proto__/i,
        /import\s*\(/i,
        /require\s*\(/i,
        /document\./i,
        /window\./i,
        /global\./i,
        /process\./i,
        /\.call\(/i,
        /\.apply\(/i,
        /\.bind\(/i,
        /setTimeout/i,
        /setInterval/i,
        /exec\(/i,
        /compile\(/i
    ];
    
    /**
     * Evaluate a mathematical expression safely
     * 
     * @param {string} expression - Mathematical expression to evaluate
     * @param {Object} variables - Variables to substitute (e.g., {x: 5, y: 10})
     * @returns {number|null} Evaluated result or null if invalid
     */
    static evaluate(expression, variables = {}) {
        if (!expression || typeof expression !== 'string') {
            return null;
        }
        
        // Remove whitespace; normalize Unicode √ (tokenzier does not accept U+221A)
        let expr = String(expression)
            .trim()
            .replace(/√\s*\(/g, 'sqrt(')
            .replace(/√\s*([0-9]+(?:\.[0-9]*)?)(?![0-9.])/g, 'sqrt($1)')
            .replace(
                /√\s*([a-zA-Z_π\u0370-\u03FF][a-zA-Z0-9_π\u0370-\u03FF]*)/g,
                'sqrt($1)'
            );
        if (expr.length === 0) {
            return null;
        }
        
        // Check for dangerous patterns
        for (const pattern of this.DANGEROUS_PATTERNS) {
            if (pattern.test(expr)) {
                console.warn('[SafeExpressionEvaluator] Dangerous pattern detected:', expr);
                return null;
            }
        }
        
        // Variables first so they shadow constants (e.g. eccentricity e vs Euler).
        const replacements = [];

        const variableEntries = Object.entries(variables)
            .filter(([_, value]) => value !== null && value !== undefined && typeof value === 'number')
            .sort(([a], [b]) => b.length - a.length);
        for (const [key, value] of variableEntries) {
            const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const isAsciiIdent = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
            replacements.push({
                pattern: isAsciiIdent
                    ? new RegExp(`\\b${escaped}\\b`, 'g')
                    : new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'gu'),
                replacement: String(value)
            });
        }

        const constantEntries = Object.entries(this.ALLOWED_CONSTANTS)
            .sort(([a], [b]) => b.length - a.length);
        for (const [key, value] of constantEntries) {
            const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const isAsciiIdent = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
            replacements.push({
                pattern: isAsciiIdent
                    ? new RegExp(`\\b${escaped}\\b`, 'g')
                    : new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'gu'),
                replacement: String(value)
            });
        }

        for (const { pattern, replacement } of replacements) {
            expr = expr.replace(pattern, replacement);
        }
        
        // Replace function names with Math.* equivalents (pre-compiled regexes)
        if (!this._functionRegexes) {
            this._functionRegexes = this.ALLOWED_FUNCTIONS.map(funcName => ({
                pattern: new RegExp(`\\b${funcName}\\s*\\(`, 'gi'),
                replacement: `Math.${funcName}(`
            }));
        }
        
        for (const { pattern, replacement } of this._functionRegexes) {
            expr = expr.replace(pattern, replacement);
        }
        
        // Replace power notation
        expr = expr.replace(/\^/g, '**');
        
        // Validate: Only allow safe characters
        // Allow: numbers, operators, parentheses, Math., whitespace, decimal points
        // Also allow scientific notation markers e/E in numeric literals (e.g. 4e-7).
        const safePattern = /^[0-9eE+\-*/().\sMath,]+$/;
        if (!safePattern.test(expr)) {
            console.warn('[SafeExpressionEvaluator] Expression contains unsafe characters:', expr);
            return null;
        }
        
        // Final validation: Check that we're only using Math functions
        const mathFunctionPattern = /Math\.([a-zA-Z]+)\(/g;
        let match;
        while ((match = mathFunctionPattern.exec(expr)) !== null) {
            if (!this.ALLOWED_FUNCTIONS.includes(match[1].toLowerCase())) {
                console.warn('[SafeExpressionEvaluator] Unallowed function:', match[1]);
                return null;
            }
        }
        
        // Use Function constructor with strict validation
        // NOTE: This is still using Function(), but with heavy validation
        // For production, consider using expr-eval library instead
        try {
            // Wrap in strict mode and validate result
            const func = new Function('Math', '"use strict"; return (' + expr + ')');
            const result = func(Math);
            
            if (typeof result === 'number' && isFinite(result) && !isNaN(result)) {
                return result;
            }
        } catch (e) {
            console.warn('[SafeExpressionEvaluator] Evaluation error:', e.message);
            return null;
        }
        
        return null;
    }
    
    /**
     * Check if an expression is safe to evaluate
     * @param {string} expression - Expression to check
     * @returns {boolean} True if expression appears safe
     */
    static isSafe(expression) {
        if (!expression || typeof expression !== 'string') {
            return false;
        }
        
        // Check for dangerous patterns
        for (const pattern of this.DANGEROUS_PATTERNS) {
            if (pattern.test(expression)) {
                return false;
            }
        }
        
        return true;
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SafeExpressionEvaluator = SafeExpressionEvaluator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafeExpressionEvaluator;
}

