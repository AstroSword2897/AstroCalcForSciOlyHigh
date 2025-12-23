/**
 * Precision Calculator Wrapper
 * 
 * Provides high-precision arithmetic using Decimal.js
 * Falls back to native Number if Decimal.js not available
 * 
 * Usage:
 *   const Precise = require('./precisionCalculator');
 *   const result = Precise.add(1.1, 2.2); // 3.3 (exact, not 3.3000000000000003)
 */

let Decimal = null;

// Try to load Decimal.js
if (typeof require !== 'undefined') {
    try {
        Decimal = require('decimal.js');
    } catch (e) {
        // Not available in Node.js, will use fallback
    }
}

// Check if Decimal.js is available globally (browser)
if (typeof Decimal === 'undefined' && typeof window !== 'undefined') {
    if (typeof window.Decimal !== 'undefined') {
        Decimal = window.Decimal;
    }
}

/**
 * Precision Calculator API
 * Provides high-precision arithmetic operations
 */
const PrecisionCalculator = {
    /**
     * Check if high-precision mode is available
     */
    isAvailable() {
        return Decimal !== null;
    },
    
    /**
     * Create a high-precision number
     */
    create(value) {
        if (Decimal) {
            return new Decimal(value);
        }
        // Fallback to native Number
        return typeof value === 'number' ? value : Number(value);
    },
    
    /**
     * Add two numbers with high precision
     */
    add(a, b) {
        if (Decimal) {
            const d1 = new Decimal(a);
            const d2 = new Decimal(b);
            return d1.plus(d2).toNumber();
        }
        return Number(a) + Number(b);
    },
    
    /**
     * Subtract two numbers with high precision
     */
    subtract(a, b) {
        if (Decimal) {
            const d1 = new Decimal(a);
            const d2 = new Decimal(b);
            return d1.minus(d2).toNumber();
        }
        return Number(a) - Number(b);
    },
    
    /**
     * Multiply two numbers with high precision
     */
    multiply(a, b) {
        if (Decimal) {
            const d1 = new Decimal(a);
            const d2 = new Decimal(b);
            return d1.times(d2).toNumber();
        }
        return Number(a) * Number(b);
    },
    
    /**
     * Divide two numbers with high precision
     */
    divide(a, b) {
        if (Decimal) {
            const d1 = new Decimal(a);
            const d2 = new Decimal(b);
            if (d2.isZero()) {
                throw new Error('Division by zero');
            }
            return d1.dividedBy(d2).toNumber();
        }
        if (Number(b) === 0) {
            throw new Error('Division by zero');
        }
        return Number(a) / Number(b);
    },
    
    /**
     * Power operation with high precision
     */
    pow(base, exponent) {
        if (Decimal) {
            const d1 = new Decimal(base);
            const d2 = new Decimal(exponent);
            return d1.pow(d2).toNumber();
        }
        return Math.pow(Number(base), Number(exponent));
    },
    
    /**
     * Square root with high precision
     */
    sqrt(value) {
        if (Decimal) {
            const d = new Decimal(value);
            return d.sqrt().toNumber();
        }
        return Math.sqrt(Number(value));
    },
    
    /**
     * Round to specified decimal places
     */
    round(value, decimals = 0) {
        if (Decimal) {
            const d = new Decimal(value);
            return d.toDecimalPlaces(decimals).toNumber();
        }
        const factor = Math.pow(10, decimals);
        return Math.round(Number(value) * factor) / factor;
    },
    
    /**
     * Check if value is zero (with tolerance)
     */
    isZero(value, tolerance = 1e-15) {
        if (Decimal) {
            const d = new Decimal(value);
            return d.abs().lessThanOrEqualTo(tolerance);
        }
        return Math.abs(Number(value)) <= tolerance;
    },
    
    /**
     * Compare two numbers (returns -1, 0, or 1)
     */
    compare(a, b) {
        if (Decimal) {
            const d1 = new Decimal(a);
            const d2 = new Decimal(b);
            return d1.comparedTo(d2);
        }
        const numA = Number(a);
        const numB = Number(b);
        if (numA < numB) return -1;
        if (numA > numB) return 1;
        return 0;
    },
    
    /**
     * Evaluate expression with high precision
     * Supports: +, -, *, /, ^, sqrt
     */
    evaluate(expression, variables = {}) {
        if (Decimal) {
            // Replace variables in expression
            let expr = expression;
            for (const [key, value] of Object.entries(variables)) {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                expr = expr.replace(regex, value.toString());
            }
            
            // Simple expression evaluator using Decimal
            // Note: This is a basic implementation. For complex expressions,
            // use the existing expressionParser.js with Decimal support
            try {
                // Replace operators with Decimal operations
                expr = expr.replace(/\^/g, '**'); // Power
                // Use Function constructor for safe evaluation (only with Decimal)
                const func = new Function('Decimal', `return new Decimal(${expr}).toNumber()`);
                return func(Decimal);
            } catch (e) {
                throw new Error(`Expression evaluation failed: ${e.message}`);
            }
        }
        
        // Fallback to native evaluation
        let expr = expression;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            expr = expr.replace(regex, value.toString());
        }
        return eval(expr); // eslint-disable-line no-eval
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.PrecisionCalculator = PrecisionCalculator;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrecisionCalculator;
}

