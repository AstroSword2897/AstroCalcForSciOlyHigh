/**
 * Expression Parser for Mathematical Inputs
 * 
 * Parses and evaluates mathematical expressions entered by users.
 * Supports:
 * - Direct numbers (integers and decimals)
 * - Scientific notation (1e10, 2.5e-3)
 * - Fractions (1/2, pi/4, 3/2)
 * - Mathematical constants (pi, e, π)
 * - Basic operations (+, -, *, /, ^, **)
 * - Trigonometric functions (sin, cos, tan, etc.)
 * - Degree to radian conversion
 * - Complex nested expressions
 * 
 * Used by the calculator to parse user input before calculations.
 */

/**
 * ExpressionParser Class
 * 
 * Static utility class for parsing mathematical expressions. All methods are static.
 */
class ExpressionParser {
    /**
     * Parse and evaluate mathematical expressions
     * 
     * Converts string input into a numerical value. Handles various formats:
     * - Numbers: "123", "3.14", "1e10"
     * - Fractions: "1/2", "pi/4"
     * - Expressions: "2*pi", "sqrt(16)", "sin(pi/2)"
     * - Degrees: "90°", "45deg" (converts to radians if unit is radians)
     * 
     * @param {string|number} value - Input value to parse (string or number)
     * @param {string} unit - Optional unit hint (e.g., "rad" triggers degree conversion)
     * @returns {number|null} Parsed numerical value, or null if input is empty/null
     * @throws {Error} If expression is invalid or cannot be evaluated
     * 
     * @example
     * ExpressionParser.parse("3.14159") // Returns: 3.14159
     * ExpressionParser.parse("pi/2") // Returns: 1.5707963267948966
     * ExpressionParser.parse("90°", "rad") // Returns: 1.5707963267948966 (converted from degrees)
     * ExpressionParser.parse("2*pi*6371000") // Returns: 40030173.59204109
     */
    static parse(value, unit = null) {
        if (!value || value === '' || value.toLowerCase() === 'null') {
            return null;
        }

        // If already a number, return it
        if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
            return value;
        }

        // Remove whitespace
        const trimmedValue = String(value).trim();

        // Check for degree notation (°, deg, degrees)
        let isDegrees = false;
        let valueWithoutUnit = trimmedValue;
        
        if (trimmedValue.match(/°|deg(rees)?$/i)) {
            isDegrees = true;
            valueWithoutUnit = trimmedValue.replace(/°|deg(rees)?$/i, '').trim();
        }
        
        // If unit is specified as radians but user entered degrees, or vice versa
        if (unit && (unit.toLowerCase().includes('radian') || unit.toLowerCase().includes('rad'))) {
            // Unit expects radians, but if user entered degrees, we'll convert
            if (isDegrees) {
                // Will convert after parsing
            }
        }

        // Try direct number parsing first
        const directNumber = parseFloat(valueWithoutUnit);
        if (!isNaN(directNumber) && valueWithoutUnit === directNumber.toString()) {
            // Convert degrees to radians if needed
            if (isDegrees) {
                return directNumber * Math.PI / 180;
            }
            return directNumber;
        }

        // Check if it's a simple fraction first (like "pi/4", "1/2")
        if (valueWithoutUnit.includes('/') && !valueWithoutUnit.includes('(') && !valueWithoutUnit.includes(')')) {
            try {
                let result = this.parseFraction(valueWithoutUnit);
                // Convert degrees to radians if needed
                if (isDegrees) {
                    result = result * Math.PI / 180;
                }
                return result;
            } catch (e) {
                // If fraction parsing fails, continue to expression evaluation
            }
        }

        // Replace pi in the expression (use valueWithoutUnit for expression)
        let expression = valueWithoutUnit;
        expression = expression.replace(/\bpi\b/gi, Math.PI.toString());
        expression = expression.replace(/\bπ\b/g, Math.PI.toString());
        expression = expression.replace(/\be\b(?![\d.])/gi, Math.E.toString());

        // Replace common functions
        expression = expression
            .replace(/\bsin\s*\(/gi, 'Math.sin(')
            .replace(/\bcos\s*\(/gi, 'Math.cos(')
            .replace(/\btan\s*\(/gi, 'Math.tan(')
            .replace(/\basin\s*\(/gi, 'Math.asin(')
            .replace(/\bacos\s*\(/gi, 'Math.acos(')
            .replace(/\batan\s*\(/gi, 'Math.atan(')
            .replace(/\bsqrt\s*\(/gi, 'Math.sqrt(')
            .replace(/\bexp\s*\(/gi, 'Math.exp(')
            .replace(/\bln\s*\(/gi, 'Math.log(')
            .replace(/\blog\s*\(/gi, 'Math.log10(')
            .replace(/\bpow\s*\(/gi, 'Math.pow(');

        // Handle power notation (^)
        expression = expression.replace(/\^/g, '**');

        // Try to evaluate the expression safely
        try {
            // Use Function constructor for safer evaluation
            const result = Function('"use strict"; return (' + expression + ')')();
            
            if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                // Convert degrees to radians if needed
                if (isDegrees) {
                    return result * Math.PI / 180;
                }
                return result;
            }
        } catch (e) {
            // If evaluation fails, try parsing as a simple fraction as last resort
            try {
                let result = this.parseFraction(valueWithoutUnit);
                if (isDegrees) {
                    result = result * Math.PI / 180;
                }
                return result;
            } catch (e2) {
                throw new Error(`Cannot parse expression: ${trimmedValue}. ${e.message || ''}`);
            }
        }

        // If all else fails, try parsing as a fraction
        let result = this.parseFraction(valueWithoutUnit);
        if (isDegrees) {
            result = result * Math.PI / 180;
        }
        return result;
    }

    // Parse simple fractions like "pi/4", "1/2", etc.
    static parseFraction(value) {
        const fractionMatch = value.match(/^(.+)\/(.+)$/);
        if (fractionMatch) {
            const numeratorStr = fractionMatch[1].trim();
            const denominatorStr = fractionMatch[2].trim();
            
            // Parse numerator and denominator (could be numbers or constants)
            let numerator = this.parseValue(numeratorStr);
            let denominator = this.parseValue(denominatorStr);
            
            // If direct parsing failed, try evaluating as expressions
            if (numerator === null) {
                try {
                    let numExpr = numeratorStr.replace(/\bpi\b/gi, Math.PI.toString());
                    numerator = Function('"use strict"; return (' + numExpr + ')')();
                } catch (e) {
                    throw new Error(`Cannot parse numerator: ${numeratorStr}`);
                }
            }
            
            if (denominator === null) {
                try {
                    let denExpr = denominatorStr.replace(/\bpi\b/gi, Math.PI.toString());
                    denominator = Function('"use strict"; return (' + denExpr + ')')();
                } catch (e) {
                    throw new Error(`Cannot parse denominator: ${denominatorStr}`);
                }
            }
            
            if (denominator === 0) {
                throw new Error('Division by zero');
            }
            
            return numerator / denominator;
        }
        
        // If not a fraction, try to parse as a number one more time
        const num = parseFloat(value);
        if (!isNaN(num)) {
            return num;
        }
        
        throw new Error(`Cannot parse value: ${value}`);
    }

    // Parse a single value (could be a number or constant)
    static parseValue(value) {
        if (typeof value === 'number') {
            return value;
        }
        
        const trimmed = String(value).trim().toLowerCase();
        
        // Check for constants
        if (trimmed === 'pi' || trimmed === 'π') {
            return Math.PI;
        }
        if (trimmed === 'e') {
            return Math.E;
        }
        
        // Try parsing as number
        const num = parseFloat(trimmed);
        if (!isNaN(num)) {
            return num;
        }
        
        return null;
    }
}

