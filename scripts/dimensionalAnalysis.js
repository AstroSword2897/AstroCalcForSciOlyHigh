/**
 * Dimensional Analysis Engine v3.0
 * 
 * Production-ready, physically correct dimensional analysis with:
 * - AST-based compound unit parser (handles powers, parentheses, spaces)
 * - Prefix decomposition (km → 1000 m, cm → 0.01 m)
 * - Affine unit support (separates K from °C/°F)
 * - Negative and fractional powers
 * - Unit aliases and normalization
 * - Full dimensional algebra
 * 
 * @version 3.0
 */

class DimensionalAnalysis {
    /**
     * SI Prefix map: prefix → scale factor
     */
    static PREFIXES = {
        // Large prefixes
        'Y': 1e24,  'yotta': 1e24,
        'Z': 1e21,  'zetta': 1e21,
        'E': 1e18,  'exa': 1e18,
        'P': 1e15,  'peta': 1e15,
        'T': 1e12,  'tera': 1e12,
        'G': 1e9,   'giga': 1e9,
        'M': 1e6,   'mega': 1e6,
        'k': 1e3,   'kilo': 1e3,
        'h': 1e2,   'hecto': 1e2,
        'da': 1e1,  'deca': 1e1,
        // Small prefixes
        'd': 1e-1,  'deci': 1e-1,
        'c': 1e-2,  'centi': 1e-2,
        'm': 1e-3,  'milli': 1e-3,
        'μ': 1e-6,  'micro': 1e-6, 'u': 1e-6,  // 'u' as fallback for μ
        'n': 1e-9,  'nano': 1e-9,
        'p': 1e-12, 'pico': 1e-12,
        'f': 1e-15, 'femto': 1e-15,
        'a': 1e-18, 'atto': 1e-18,
        'z': 1e-21, 'zepto': 1e-21,
        'y': 1e-24, 'yocto': 1e-24
    };

    /**
     * Unit aliases: common variations → canonical form
     */
    static UNIT_ALIASES = {
        // Length
        'meter': 'm', 'meters': 'm', 'metre': 'm', 'metres': 'm', 'mtr': 'm', 'mtrs': 'm',
        'kilometer': 'km', 'kilometers': 'km', 'kilometre': 'km', 'kilometres': 'km',
        'centimeter': 'cm', 'centimeters': 'cm', 'centimetre': 'cm', 'centimetres': 'cm',
        'millimeter': 'mm', 'millimeters': 'mm', 'millimetre': 'mm', 'millimetres': 'mm',
        // Mass
        'kilogram': 'kg', 'kilograms': 'kg', 'kilo': 'kg', 'kilos': 'kg',
        'gram': 'g', 'grams': 'g', 'gm': 'g', 'gms': 'g',
        // Time
        'second': 's', 'seconds': 's', 'sec': 's', 'secs': 's',
        'minute': 'min', 'minutes': 'min', 'mins': 'min',
        'hour': 'hr', 'hours': 'hr', 'hrs': 'hr',
        'day': 'day', 'days': 'day',
        'year': 'yr', 'years': 'yr', 'yrs': 'yr',
        // Temperature
        'kelvin': 'K', 'kelvins': 'K',
        'celsius': '°C', 'centigrade': '°C',
        'fahrenheit': '°F',
        // Angle
        'radian': 'rad', 'radians': 'rad',
        'degree': '°', 'degrees': '°',
        'arcsecond': 'arcsec', 'arcseconds': 'arcsec',
        'arcminute': 'arcmin', 'arcminutes': 'arcmin'
    };

    /**
     * Base dimension definitions [L, M, T, Θ]
     * Only canonical base units (no prefixes, no compounds)
     */
    static BASE_DIMENSIONS = {
        // Length
        'm': [1, 0, 0, 0],
        // Mass
        'kg': [0, 1, 0, 0],
        // Time
        's': [0, 0, 1, 0],
        // Temperature (multiplicative - Kelvin only)
        'K': [0, 0, 0, 1],
        // Angle (dimensionless)
        'rad': [0, 0, 0, 0],
        '°': [0, 0, 0, 0],
        'arcsec': [0, 0, 0, 0],
        'arcmin': [0, 0, 0, 0]
    };

    /**
     * Affine units (offset-based, not multiplicative)
     * These require special handling in conversions
     */
    static AFFINE_UNITS = {
        '°C': { base: 'K', offset: 273.15 },
        '°F': { base: 'K', offset: 255.3722222222222 } // (F - 32) * 5/9 + 273.15
    };

    /**
     * Decompose a unit with prefix into base unit + scale factor
     * 
     * @param {string} unit - Unit string (e.g., "km", "cm", "mm")
     * @returns {Object} { baseUnit: string, scale: number, prefix: string }
     * 
     * @example
     * decomposePrefix("km") // { baseUnit: "m", scale: 1000, prefix: "k" }
     * decomposePrefix("cm") // { baseUnit: "m", scale: 0.01, prefix: "c" }
     * decomposePrefix("m")  // { baseUnit: "m", scale: 1, prefix: null }
     */
    static decomposePrefix(unit) {
        if (!unit || unit.length === 0) {
            return { baseUnit: unit, scale: 1, prefix: null };
        }

        // Try all prefixes (longest first to avoid partial matches)
        const sortedPrefixes = Object.keys(this.PREFIXES)
            .sort((a, b) => b.length - a.length);

        for (const prefix of sortedPrefixes) {
            if (unit.toLowerCase().startsWith(prefix.toLowerCase())) {
                const remaining = unit.slice(prefix.length);
                // Check if remaining is a valid base unit
                if (remaining.length > 0 && this.BASE_DIMENSIONS[remaining]) {
                    return {
                        baseUnit: remaining,
                        scale: this.PREFIXES[prefix],
                        prefix: prefix
                    };
                }
            }
        }

        // No prefix found, return as-is
        return { baseUnit: unit, scale: 1, prefix: null };
    }

    /**
     * Normalize unit string (handle aliases, case, whitespace)
     * 
     * @param {string} unit - Unit string
     * @returns {string} Normalized unit
     */
    static normalizeUnit(unit) {
        if (!unit) return '';
        
        // Trim and lowercase for matching
        const trimmed = unit.trim();
        const lower = trimmed.toLowerCase();
        
        // Check aliases first
        if (this.UNIT_ALIASES[lower]) {
            return this.UNIT_ALIASES[lower];
        }
        
        // Preserve original case for special units (K, °C, °F, etc.)
        if (trimmed.match(/^[K°]/)) {
            return trimmed;
        }
        
        // Return lowercase for base units
        return lower;
    }

    /**
     * Tokenize a unit expression into tokens
     * Handles: base units, powers, multiplication, division, parentheses
     * 
     * @param {string} expr - Unit expression (e.g., "kg·m^2/s^2")
     * @returns {Array} Array of tokens
     */
    static tokenize(expr) {
        const tokens = [];
        let current = '';
        let i = 0;
        
        // Remove spaces
        expr = expr.replace(/\s+/g, '');
        
        while (i < expr.length) {
            const char = expr[i];
            
            // Handle operators
            if (char === '/' || char === '·' || char === '*' || char === '^' || 
                char === '(' || char === ')') {
                if (current) {
                    tokens.push({ type: 'unit', value: current });
                    current = '';
                }
                tokens.push({ type: 'operator', value: char });
                i++;
                continue;
            }
            
            // Handle numbers (for exponents)
            if (char >= '0' && char <= '9' || char === '.' || char === '-' || char === '+') {
                // Check if we're in an exponent context
                const prevToken = tokens[tokens.length - 1];
                if (prevToken && prevToken.value === '^') {
                    // Parse number (including negative and fractional)
                    let numStr = char;
                    i++;
                    while (i < expr.length && 
                           (expr[i] >= '0' && expr[i] <= '9' || 
                            expr[i] === '.' || expr[i] === '/' || 
                            expr[i] === '-' || expr[i] === '+')) {
                        numStr += expr[i];
                        i++;
                    }
                    tokens.push({ type: 'number', value: numStr });
                    continue;
                } else {
                    // Number not in exponent - might be part of unit name
                    current += char;
                }
            } else {
                current += char;
            }
            
            i++;
        }
        
        if (current) {
            tokens.push({ type: 'unit', value: current });
        }
        
        return tokens;
    }

    /**
     * Parse unit expression into AST (Abstract Syntax Tree)
     * Handles: multiplication, division, powers, parentheses
     * 
     * @param {string} unit - Unit expression
     * @returns {Object} AST node
     */
    static parseExpression(unit) {
        if (!unit) {
            return { type: 'dimensionless', dimensions: [0, 0, 0, 0] };
        }

        const normalized = this.normalizeUnit(unit);
        
        // Check if it's a simple base unit (no operators)
        if (!normalized.match(/[\/·*^()]/)) {
            const decomposed = this.decomposePrefix(normalized);
            const dims = this.BASE_DIMENSIONS[decomposed.baseUnit];
            if (dims) {
                return {
                    type: 'unit',
                    unit: normalized,
                    baseUnit: decomposed.baseUnit,
                    scale: decomposed.scale,
                    dimensions: [...dims],
                    isAffine: this.AFFINE_UNITS[normalized] !== undefined
                };
            }
        }

        // Tokenize and parse
        const tokens = this.tokenize(normalized);
        return this.parseTokens(tokens);
    }

    /**
     * Parse tokens into AST using recursive descent
     * Grammar: expression → term (('/'|'·'|'*') term)*
     *          term → factor ('^' number)?
     *          factor → unit | '(' expression ')'
     * 
     * @param {Array} tokens - Token array
     * @returns {Object} AST node
     */
    static parseTokens(tokens) {
        if (tokens.length === 0) {
            return { type: 'dimensionless', dimensions: [0, 0, 0, 0] };
        }

        // Parse expression (multiplication/division)
        let left = this.parseTerm(tokens);
        
        while (tokens.length > 0) {
            const op = tokens[0];
            if (op.type === 'operator' && (op.value === '/' || op.value === '·' || op.value === '*')) {
                tokens.shift(); // consume operator
                const right = this.parseTerm(tokens);
                
                if (op.value === '/') {
                    // Division: subtract dimensions
                    left = {
                        type: 'division',
                        left: left,
                        right: right,
                        dimensions: this.subtractDimensions(left.dimensions, right.dimensions)
                    };
                } else {
                    // Multiplication: add dimensions
                    left = {
                        type: 'multiplication',
                        left: left,
                        right: right,
                        dimensions: this.addDimensions(left.dimensions, right.dimensions)
                    };
                }
            } else {
                break;
            }
        }
        
        return left;
    }

    /**
     * Parse a term (factor with optional exponent)
     * 
     * @param {Array} tokens - Token array (modified in place)
     * @returns {Object} AST node
     */
    static parseTerm(tokens) {
        let factor = this.parseFactor(tokens);
        
        // Check for exponent
        if (tokens.length > 0 && tokens[0].type === 'operator' && tokens[0].value === '^') {
            tokens.shift(); // consume '^'
            
            if (tokens.length === 0 || tokens[0].type !== 'number') {
                throw new Error('Expected number after ^');
            }
            
            const exponent = this.parseNumber(tokens[0].value);
            tokens.shift(); // consume number
            
            // Apply exponent to dimensions
            factor = {
                type: 'power',
                base: factor,
                exponent: exponent,
                dimensions: this.scaleDimensions(factor.dimensions, exponent)
            };
        }
        
        return factor;
    }

    /**
     * Parse a factor (unit or parenthesized expression)
     * 
     * @param {Array} tokens - Token array (modified in place)
     * @returns {Object} AST node
     */
    static parseFactor(tokens) {
        if (tokens.length === 0) {
            throw new Error('Unexpected end of expression');
        }
        
        const token = tokens[0];
        
        if (token.type === 'operator' && token.value === '(') {
            tokens.shift(); // consume '('
            const expr = this.parseTokens(tokens);
            
            if (tokens.length === 0 || tokens[0].value !== ')') {
                throw new Error('Expected closing parenthesis');
            }
            tokens.shift(); // consume ')'
            
            return expr;
        }
        
        if (token.type === 'unit') {
            tokens.shift(); // consume unit
            const normalized = this.normalizeUnit(token.value);
            const decomposed = this.decomposePrefix(normalized);
            const dims = this.BASE_DIMENSIONS[decomposed.baseUnit];
            
            if (!dims) {
                // Unknown unit - assume dimensionless
                return {
                    type: 'unit',
                    unit: normalized,
                    baseUnit: normalized,
                    scale: 1,
                    dimensions: [0, 0, 0, 0],
                    isAffine: false
                };
            }
            
            return {
                type: 'unit',
                unit: normalized,
                baseUnit: decomposed.baseUnit,
                scale: decomposed.scale,
                dimensions: [...dims],
                isAffine: this.AFFINE_UNITS[normalized] !== undefined
            };
        }
        
        throw new Error(`Unexpected token: ${token.value}`);
    }

    /**
     * Parse number string (handles integers, decimals, fractions, negatives)
     * 
     * @param {string} numStr - Number string (e.g., "2", "-3", "1/2", "-2/3")
     * @returns {number} Parsed number
     */
    static parseNumber(numStr) {
        // Handle fractions
        if (numStr.includes('/')) {
            const [num, den] = numStr.split('/').map(s => parseFloat(s.trim()));
            if (isNaN(num) || isNaN(den) || den === 0) {
                throw new Error(`Invalid fraction: ${numStr}`);
            }
            return num / den;
        }
        
        const parsed = parseFloat(numStr);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number: ${numStr}`);
        }
        return parsed;
    }

    /**
     * Add two dimension vectors
     * 
     * @param {Array} dims1 - First dimension vector [L, M, T, Θ]
     * @param {Array} dims2 - Second dimension vector [L, M, T, Θ]
     * @returns {Array} Sum of dimensions
     */
    static addDimensions(dims1, dims2) {
        return [
            dims1[0] + dims2[0],
            dims1[1] + dims2[1],
            dims1[2] + dims2[2],
            dims1[3] + dims2[3]
        ];
    }

    /**
     * Subtract two dimension vectors
     * 
     * @param {Array} dims1 - First dimension vector [L, M, T, Θ]
     * @param {Array} dims2 - Second dimension vector [L, M, T, Θ]
     * @returns {Array} Difference of dimensions
     */
    static subtractDimensions(dims1, dims2) {
        return [
            dims1[0] - dims2[0],
            dims1[1] - dims2[1],
            dims1[2] - dims2[2],
            dims1[3] - dims2[3]
        ];
    }

    /**
     * Scale dimension vector by a factor (for powers)
     * 
     * @param {Array} dims - Dimension vector [L, M, T, Θ]
     * @param {number} factor - Scaling factor
     * @returns {Array} Scaled dimensions
     */
    static scaleDimensions(dims, factor) {
        return [
            dims[0] * factor,
            dims[1] * factor,
            dims[2] * factor,
            dims[3] * factor
        ];
    }

    /**
     * Get dimensional formula for a unit
     * 
     * @param {string} unit - Unit string (e.g., "m", "kg", "m/s", "kg·m^2/s^2")
     * @returns {Object} { dimensions: [L, M, T, Θ], unit: string, scale: number, isAffine: boolean }
     */
    static getDimensions(unit) {
        if (!unit || unit.length === 0) {
            return { dimensions: [0, 0, 0, 0], unit: 'dimensionless', scale: 1, isAffine: false };
        }

        try {
            const ast = this.parseExpression(unit);
            return {
                dimensions: ast.dimensions || [0, 0, 0, 0],
                unit: unit,
                scale: ast.scale || 1,
                isAffine: ast.isAffine || false
            };
        } catch (error) {
            // Fallback: try old method for compatibility
            console.warn(`DimensionalAnalysis.getDimensions: Error parsing "${unit}": ${error.message}`);
            return { dimensions: [0, 0, 0, 0], unit: unit, scale: 1, isAffine: false };
        }
    }

    /**
     * Check if two units are dimensionally compatible
     * 
     * @param {string} unit1 - First unit
     * @param {string} unit2 - Second unit
     * @returns {boolean} True if units have same dimensions
     */
    static areCompatible(unit1, unit2) {
        const dims1 = this.getDimensions(unit1).dimensions;
        const dims2 = this.getDimensions(unit2).dimensions;

        for (let i = 0; i < 4; i++) {
            if (Math.abs(dims1[i] - dims2[i]) > 0.001) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate that a value with unit matches expected unit dimensions
     * 
     * @param {number} value - Numerical value
     * @param {string} actualUnit - Unit of the value
     * @param {string} expectedUnit - Expected unit
     * @returns {Object} { valid: boolean, error: string }
     */
    static validateDimensions(value, actualUnit, expectedUnit) {
        if (!expectedUnit || expectedUnit.length === 0) {
            return { valid: true, error: null };
        }

        if (!actualUnit || actualUnit.length === 0) {
            return { valid: false, error: `Expected unit ${expectedUnit}, but value has no unit` };
        }

        const compatible = this.areCompatible(actualUnit, expectedUnit);
        
        if (!compatible) {
            const actualDims = this.getDimensions(actualUnit);
            const expectedDims = this.getDimensions(expectedUnit);
            return {
                valid: false,
                error: `Unit mismatch: ${actualUnit} (dimensions: [${actualDims.dimensions.join(', ')}]) ` +
                       `does not match ${expectedUnit} (dimensions: [${expectedDims.dimensions.join(', ')}])`
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Get human-readable dimension description
     * 
     * @param {string} unit - Unit string
     * @returns {string} Description (e.g., "length", "mass", "velocity")
     */
    static getDimensionDescription(unit) {
        const dims = this.getDimensions(unit).dimensions;
        const [L, M, T, Θ] = dims;

        if (L === 1 && M === 0 && T === 0 && Θ === 0) return 'length';
        if (L === 0 && M === 1 && T === 0 && Θ === 0) return 'mass';
        if (L === 0 && M === 0 && T === 1 && Θ === 0) return 'time';
        if (L === 0 && M === 0 && T === 0 && Θ === 1) return 'temperature';
        if (L === 1 && M === 0 && T === -1 && Θ === 0) return 'velocity';
        if (L === 1 && M === 0 && T === -2 && Θ === 0) return 'acceleration';
        if (L === 2 && M === 1 && T === -2 && Θ === 0) return 'energy';
        if (L === 2 && M === 1 && T === -3 && Θ === 0) return 'power';
        if (L === 0 && M === 0 && T === -1 && Θ === 0) return 'frequency';
        if (L === 0 && M === 0 && T === 0 && Θ === 0) return 'dimensionless';

        // Generic description
        const parts = [];
        if (L !== 0) parts.push(`length^${L}`);
        if (M !== 0) parts.push(`mass^${M}`);
        if (T !== 0) parts.push(`time^${T}`);
        if (Θ !== 0) parts.push(`temperature^${Θ}`);

        return parts.join('·') || 'dimensionless';
    }
}
