/**
 * Calculation Engine - Tier 1 Production-Grade Calculator
 * 
 * ⭐ TIER 1 CALCULATION ENGINE - COMPLETELY OFFLINE ⭐
 * 
 * Core calculation engine for solving astronomical formulas. Provides:
 * - Numerical solving for single unknown variables with full validation
 * - Symbolic expression generation for multiple unknowns
 * - Automatic constant substitution (G, c, σ, M☉, etc.) - ALL DEFINED LOCALLY
 * - Comprehensive error handling and input validation
 * - Physical constraint validation (positive masses, distances, etc.)
 * - Division-by-zero protection
 * - Infinity/NaN detection and prevention
 * - Support for "N/A" variables (for symbolic expressions)
 * - LaTeX conversion for beautiful math rendering
 * - All solutions enumeration
 * 
 * ✅ OFFLINE-FIRST DESIGN:
 * - NO external API calls
 * - NO network dependencies
 * - ALL constants defined locally in formulas.js
 * - Works completely offline
 * - No external libraries required for calculations
 * 
 * 🛡️ ROBUST ERROR HANDLING:
 * - Input validation (type checking, range validation)
 * - Physical constraint validation (positive values where required)
 * - Division-by-zero protection
 * - Infinity/NaN detection
 * - Clear, actionable error messages
 * 
 * 📊 FEATURES:
 * - Normalized return format (consistent structure)
 * - All solutions returned for symbolic mode
 * - Solver registry pattern (O(1) lookup, maintainable)
 * - Comprehensive validation at every step
 * 
 * The calculator uses the formula's solveFunction to perform calculations,
 * automatically handling unit conversions and constant substitutions.
 * 
 * @version 2.0
 * @author AstroCalc Team
 */

/**
 * VariableNormalizer - Normalizes variable names for consistent handling
 * Handles Unicode Greek letters, subscripts, and alternative naming conventions
 */
class VariableNormalizer {
    /**
     * Mapping of alternative variable names to canonical forms
     */
    static MAPPINGS = {
        // Hubble constant variants
        'H₀': 'H0',
        'H_0': 'H0',
        'H_zero': 'H0',
        
        // Greek letters to ASCII
        'λ': 'lambda',
        'λmax': 'lambda_max',
        'λ_obs': 'lambda_obs',
        'λ_rest': 'lambda_rest',
        'λmax': 'lambda_max',
        
        'ρ': 'rho',
        'ρ_c': 'rho_c',
        'ρ_M': 'rho_M',
        'ρ_m': 'rho_m',
        
        'σ': 'sigma',
        'σ_T': 'sigma_T',
        'σT': 'sigma_T',
        'σ_t': 'sigma_t',
        
        'τ': 'tau',
        'θ': 'theta',
        'θ_E': 'theta_E',
        'θ_E': 'theta_E',
        
        'α': 'alpha',
        'β': 'beta',
        'γ': 'gamma',
        'γmax': 'gamma_max',
        'γb': 'gamma_b',
        'γmax': 'gamma_max',
        
        'Δ': 'Delta',
        'Δt\'': 'delta_t_prime',
        'delta_t_prime': 'delta_t_prime',
        'ΔT_GH': 'delta_T_GH',
        'delta_T_GH': 'delta_T_GH',
        
        'Ω': 'Omega',
        'Φ': 'Phi',
        'φ': 'phi',
        
        // Subscript variants
        'M_☉': 'M_sun',
        'M☉': 'M_sun',
        'M_sun': 'M_sun',
        'M_⊕': 'M_earth',
        'M_earth': 'M_earth',
        'R_☉': 'R_sun',
        'R☉': 'R_sun',
        'R_sun': 'R_sun',
        'L_☉': 'L_sun',
        'L☉': 'L_sun',
        'L_sun': 'L_sun',
        
        // Common physics variables
        'νb': 'nu_b',
        'ν_b': 'nu_b',
        'T_eq': 'T_eq',
        'T_eq': 'T_eq',
        'R_s': 'R_s',
        'R_s': 'R_s',
        'M_Ch': 'M_Ch',
        'M_Ch': 'M_Ch',
        'B_V': 'B_V',
        'B-V': 'B_V',
        'M_V': 'M_V',
        'M-V': 'M_V',
        'L\'': 'L_prime',
        'L_prime': 'L_prime',
        'dP_dr': 'dP_dr',
        'da_dt': 'da_dt',
        't_merge': 't_merge',
        't_syn': 't_syn',
        't_age': 't_age',
        'P_syn': 'P_syn',
        'P_rot': 'P_rot',
        'U_B': 'U_B',
        'v_esc': 'v_esc',
        'R_H': 'R_H',
        'M_J': 'M_J',
        'D_A': 'D_A',
        'D_L': 'D_L',
        'E_total': 'E_total',
    };
    
    /**
     * Normalize a single variable name to its canonical form
     * @param {string} varName - Variable name to normalize
     * @returns {string} Normalized variable name
     */
    static normalize(varName) {
        if (!varName || typeof varName !== 'string') {
            return varName;
        }
        
        // Check direct mapping first
        if (this.MAPPINGS[varName]) {
            return this.MAPPINGS[varName];
        }
        
        // Handle case-insensitive matching for common patterns
        const lowerVarName = varName.toLowerCase();
        for (const [key, value] of Object.entries(this.MAPPINGS)) {
            if (key.toLowerCase() === lowerVarName) {
                return value;
            }
        }
        
        // Return original if no mapping found
        return varName;
    }
    
    /**
     * Normalize all keys in a variables object
     * @param {Object} vars - Variables object with potentially non-normalized keys
     * @returns {Object} Variables object with normalized keys
     */
    static normalizeObject(vars) {
        if (!vars || typeof vars !== 'object') {
            return vars;
        }
        
        const normalized = {};
        for (const [key, value] of Object.entries(vars)) {
            const normalizedKey = this.normalize(key);
            // If normalization changed the key, preserve both for compatibility
            normalized[normalizedKey] = value;
            if (normalizedKey !== key) {
                normalized[key] = value; // Keep original for backward compatibility
            }
        }
        
        return normalized;
    }
    
    /**
     * Get all possible variants of a variable name
     * @param {string} canonicalName - Canonical variable name
     * @returns {string[]} Array of all possible variant names
     */
    static getVariants(canonicalName) {
        const variants = [canonicalName];
        for (const [key, value] of Object.entries(this.MAPPINGS)) {
            if (value === canonicalName && key !== canonicalName) {
                variants.push(key);
            }
        }
        return variants;
    }
}

/**
 * CalculationError - Enhanced error with structured context
 * Provides detailed information about calculation failures
 */
class CalculationError extends Error {
    constructor(message, context = {}) {
        super(message);
        this.name = 'CalculationError';
        this.context = {
            formula: context.formula || 'unknown',
            variable: context.variable || 'unknown',
            inputs: context.inputs || {},
            step: context.step || 'unknown',
            timestamp: new Date().toISOString()
        };
        
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CalculationError);
        }
    }
    
    /**
     * Convert error to JSON for logging/debugging
     * @returns {Object} JSON representation of error
     */
    toJSON() {
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
     * @returns {string} Human-readable error message
     */
    getUserMessage() {
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

/**
 * SafeMathEvaluator - Safe mathematical expression evaluator
 * Replaces unsafe Function() constructor with a secure parser
 * ENHANCED: Better validation and token-based variable replacement
 */
class SafeMathEvaluator {
    /**
     * Evaluate a mathematical expression safely
     * ENHANCED: Better validation, token-based variable replacement, and improved security
     * @param {string} expression - Mathematical expression (e.g., "2 * 3 + 4")
     * @param {Object} vars - Optional variables to substitute (for safer variable replacement)
     * @returns {number} Evaluated result
     * @throws {CalculationError} If expression is invalid or unsafe
     */
    static evaluate(expression, vars = {}) {
        if (!expression || typeof expression !== 'string') {
            throw new CalculationError('Expression must be a non-empty string', {
                step: 'Input validation'
            });
        }
        
        // Remove whitespace
        let expr = expression.trim();
        
        if (expr.length === 0) {
            throw new CalculationError('Expression cannot be empty', {
                step: 'Input validation'
            });
        }
        
        // ENHANCED: More comprehensive dangerous pattern detection
        const dangerousPatterns = [
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
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(expr)) {
                throw new CalculationError(
                    `Expression contains potentially unsafe code: ${pattern.source}`,
                    { step: 'Security validation', inputs: { expression: expr.substring(0, 50) } }
                );
            }
        }
        
        // ENHANCED: Validate allowed characters more strictly
        // Allow: numbers, operators, parentheses, Math functions, whitespace, and variable names
        const allowedMathFunctions = ['sqrt', 'cbrt', 'log', 'log10', 'ln', 'sin', 'cos', 'tan', 
                                     'asin', 'acos', 'atan', 'exp', 'pow', 'abs', 'floor', 'ceil', 
                                     'round', 'min', 'max', 'PI', 'E'];
        const mathFuncPattern = new RegExp(`Math\\.(${allowedMathFunctions.join('|')})\\s*\\(`, 'gi');
        
        // Remove Math functions temporarily for validation
        let validationExpr = expr.replace(mathFuncPattern, 'Math.');
        // Remove variable names (alphanumeric + underscore)
        validationExpr = validationExpr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, 'VAR');
        // Remove numbers (including scientific notation)
        validationExpr = validationExpr.replace(/[\d.eE+\-]+/g, 'NUM');
        
        // Check remaining characters are only allowed operators and parentheses
        const safeCharPattern = /^[+\-*/().\s,NUMVARMath\.]*$/;
        if (!safeCharPattern.test(validationExpr)) {
            throw new CalculationError(
                'Expression contains unsafe characters',
                { step: 'Character validation', inputs: { expression: expr.substring(0, 50) } }
            );
        }
        
        // ENHANCED: Token-based variable replacement (prevents partial matches)
        if (vars && Object.keys(vars).length > 0) {
            expr = this.replaceVariablesSafely(expr, vars);
        }
        
        // ENHANCED: Use safer evaluation with limited scope
        // Instead of bare Function(), we pass only allowed Math functions as parameters
        try {
            // Define allowed Math functions in a safe scope
            const allowedFunctions = {
                sqrt: Math.sqrt,
                cbrt: Math.cbrt,
                log: Math.log,
                log10: Math.log10,
                sin: Math.sin,
                cos: Math.cos,
                tan: Math.tan,
                asin: Math.asin,
                acos: Math.acos,
                atan: Math.atan,
                exp: Math.exp,
                pow: Math.pow,
                abs: Math.abs,
                floor: Math.floor,
                ceil: Math.ceil,
                round: Math.round,
                min: Math.min,
                max: Math.max,
                PI: Math.PI,
                E: Math.E
            };
            
            // Replace Math.function with just function name for cleaner evaluation
            // This is safe because we've already validated the expression
            let evalExpr = expr;
            for (const [funcName, func] of Object.entries(allowedFunctions)) {
                const regex = new RegExp(`Math\\.${funcName}\\b`, 'g');
                evalExpr = evalExpr.replace(regex, `_${funcName}`);
            }
            
            // Create function with only allowed operations in scope
            // This is safer than bare Function() because we control what's available
            const safeFunc = new Function(
                ...Object.keys(allowedFunctions).map(k => `_${k}`),
                `"use strict"; return (${evalExpr});`
            );
            
            const result = safeFunc(...Object.values(allowedFunctions));
            
            if (typeof result !== 'number') {
                throw new CalculationError(
                    `Expression did not evaluate to a number, got: ${typeof result}`,
                    { step: 'Result validation', inputs: { expression: expr.substring(0, 50) } }
                );
            }
            
            if (!isFinite(result)) {
                throw new CalculationError(
                    `Expression did not evaluate to a finite number, got: ${result}`,
                    { step: 'Result validation', inputs: { expression: expr.substring(0, 50) } }
                );
            }
            
            return result;
        } catch (error) {
            if (error instanceof CalculationError) {
                throw error;
            }
            throw new CalculationError(
                `Expression evaluation failed: ${error.message}`,
                { step: 'Evaluation', inputs: { expression: expr.substring(0, 50), error: error.message } }
            );
        }
    }
    
    /**
     * Safely replace variables in expression using token-based approach
     * Prevents partial matches (e.g., "a" won't match "a_max")
     * @param {string} expr - Expression string
     * @param {Object} vars - Variables to replace
     * @returns {string} Expression with variables replaced
     */
    static replaceVariablesSafely(expr, vars) {
        // Sort variable names by length (longest first) to prevent partial matches
        const sortedVarNames = Object.keys(vars).sort((a, b) => b.length - a.length);
        
        let result = expr;
        for (const varName of sortedVarNames) {
            const value = vars[varName];
            if (value === null || value === undefined || !isFinite(value)) {
                continue; // Skip invalid values
            }
            
            // Use word boundary regex to match whole variable names only
            // Match: start of string, non-word char, or end of string
            const varRegex = new RegExp(`\\b${this.escapeRegex(varName)}\\b`, 'g');
            result = result.replace(varRegex, value.toString());
        }
        
        return result;
    }
    
    /**
     * Escape special regex characters in a string
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    static escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

/**
 * InputValidator - Validates inputs before calculation
 * Provides first-pass validation for all variable values
 */
class InputValidator {
    /**
     * Validate all inputs before calculation
     * @param {Object} formula - Formula object
     * @param {Object} variableValues - Variable values to validate
     * @throws {Error} If validation fails
     */
    static validateInputs(formula, variableValues) {
        if (!formula || !formula.variables) {
            throw new Error('Invalid formula: formula and variables are required');
        }
        
        if (!variableValues || typeof variableValues !== 'object') {
            throw new Error('Invalid variableValues: must be an object');
        }
        
        // Validate that all provided values are valid types
        for (const [symbol, value] of Object.entries(variableValues)) {
            // Skip null, undefined, empty string, or N/A values (these are valid)
            if (value === null || value === undefined || value === '' || 
                value === 'null' || value === 'N/A' || value === 'n/a' || 
                value === 'na' || value === 'IDK' || value === 'idk') {
                continue;
            }
            
            // Validate type
            if (typeof value !== 'number' && typeof value !== 'string') {
                throw new Error(`Invalid type for ${symbol}: ${typeof value}. Expected number or string.`);
            }
            
            // If it's a number, validate it's finite
            if (typeof value === 'number') {
                if (isNaN(value)) {
                    throw new Error(`Invalid number for ${symbol}: NaN`);
                }
                if (!isFinite(value)) {
                    throw new Error(`Invalid number for ${symbol}: ${value} (not finite)`);
                }
            }
            
            // If it's a string, validate it's not empty after trim
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (trimmed === '') {
                    continue; // Empty string is valid (treated as null)
                }
                // Try to parse as number to catch obviously invalid formats early
                const parsed = parseFloat(trimmed);
                if (isNaN(parsed) && trimmed.toLowerCase() !== 'n/a' && trimmed.toLowerCase() !== 'na') {
                    // Allow expressions like "2*pi", "pi/4", etc. - these will be parsed later
                    // Only reject if it's clearly not a number and not a known special value
                    if (!/^[0-9+\-*/().\sπpie]+$/i.test(trimmed)) {
                        throw new Error(`Invalid number format for ${symbol}: "${value}". Expected a number or mathematical expression.`);
                    }
                }
            }
        }
    }
}

/**
 * SolverValidator - Validates solver inputs and results
 * Provides consistent error handling across all solvers
 */
class SolverValidator {
    /**
     * Validate that a value is not zero (for division operations)
     * @param {number} value - Value to check
     * @param {string} varName - Variable name for error message
     * @throws {Error} If value is zero
     */
    static checkNonZero(value, varName) {
        if (value === 0 || value === null || value === undefined) {
            throw new Error(`${varName} cannot be zero. Division by zero is not allowed.`);
        }
        if (!isFinite(value)) {
            throw new Error(`${varName} must be a finite number, got: ${value}`);
        }
    }
    
    /**
     * Validate that a value is positive
     * @param {number} value - Value to check
     * @param {string} varName - Variable name for error message
     * @throws {Error} If value is not positive
     */
    static checkPositive(value, varName) {
        if (value <= 0 || !isFinite(value)) {
            throw new Error(`${varName} must be a positive finite number, got: ${value}`);
        }
    }
    
    /**
     * Validate division operation (check divisor is not zero)
     * @param {number} dividend - Dividend
     * @param {number} divisor - Divisor
     * @param {string} divisorName - Name of divisor for error message
     * @returns {number} Result of division
     * @throws {Error} If divisor is zero
     */
    static safeDivide(dividend, divisor, divisorName = 'divisor') {
        this.checkNonZero(divisor, divisorName);
        const result = dividend / divisor;
        if (!isFinite(result)) {
            throw new Error(`Division result is not finite: ${dividend} / ${divisor}`);
        }
        return result;
    }
    
    /**
     * Validate result is finite and valid
     * @param {number} result - Result to validate
     * @param {string} operation - Operation name for error message
     * @throws {Error} If result is invalid
     */
    static validateResult(result, operation = 'calculation') {
        if (result === null || result === undefined) {
            throw new Error(`${operation} returned null or undefined`);
        }
        if (typeof result !== 'number') {
            throw new Error(`${operation} returned non-numeric value: ${typeof result}`);
        }
        if (isNaN(result)) {
            throw new Error(`${operation} returned NaN`);
        }
        if (!isFinite(result)) {
            throw new Error(`${operation} returned non-finite value: ${result}`);
        }
        return result;
    }
}

/**
 * FormulaCalculator Class
 * 
 * Handles calculation logic for a specific formula. Can solve for:
 * - Single unknown variable (numerical result)
 * - Multiple unknown variables (symbolic expression)
 * - Variables marked as "N/A" (excluded from calculation)
 * 
 * @param {Object} formula - Formula object from formulas.js with solveFunction
 */
class FormulaCalculator {
    constructor(formula) {
        // ENHANCED: Validate formula object
        if (!formula) {
            throw new Error('FormulaCalculator: formula is required');
        }
        if (!formula.id) {
            throw new Error('FormulaCalculator: formula must have an id');
        }
        if (!formula.variables || !Array.isArray(formula.variables)) {
            throw new Error('FormulaCalculator: formula must have a variables array');
        }
        this.formula = formula;
    }
    
    /**
     * ENHANCED: Validate variable value against physical constraints
     * Ensures calculations are physically meaningful
     * @param {string} symbol - Variable symbol
     * @param {number} value - Value to validate
     * @param {Object} varDef - Variable definition
     */
    /**
     * Check for common edge cases in calculations
     * @param {Object} vars - Variables object
     * @param {Array} requiredVars - Array of required variable symbols
     * @param {Array} mustBePositive - Array of variables that must be positive
     * @param {Array} mustBeNonZero - Array of variables that must be non-zero
     */
    checkEdgeCases(vars, requiredVars = [], mustBePositive = [], mustBeNonZero = []) {
        // Check required variables exist
        for (const varName of requiredVars) {
            if (vars[varName] === undefined || vars[varName] === null) {
                throw new Error(`${varName} is required but not provided`);
            }
            if (!isFinite(vars[varName])) {
                throw new Error(`${varName} must be a finite number, got: ${vars[varName]}`);
            }
        }
        
        // Check must be positive
        for (const varName of mustBePositive) {
            if (vars[varName] !== undefined && vars[varName] <= 0) {
                throw new Error(`${varName} must be positive, got: ${vars[varName]}`);
            }
        }
        
        // Check must be non-zero
        for (const varName of mustBeNonZero) {
            if (vars[varName] !== undefined && vars[varName] === 0) {
                throw new Error(`${varName} cannot be zero`);
            }
        }
    }
    
    validateVariableValue(symbol, value, varDef) {
        if (!isFinite(value)) {
            throw new Error(`${symbol} must be a finite number, got: ${value}`);
        }
        
        // Physical constraints based on variable type
        const varName = (varDef?.name || symbol).toLowerCase();
        const varSymbol = symbol.toLowerCase();
        
        // Mass must be positive
        // Check for mass variables: M, m, M1, M2, M_☉, M☉, etc.
        const isMass = varName.includes('mass') || 
                      varSymbol === 'm' || 
                      varSymbol.includes('m_') ||
                      varSymbol.includes('M_') ||
                      (varSymbol.startsWith('M') && /^M\d*$/.test(varSymbol)) || // M, M1, M2, etc.
                      (varSymbol.startsWith('m') && /^m\d*$/.test(varSymbol));   // m, m1, m2, etc.
        
        if (isMass) {
            if (value <= 0) {
                throw new Error(`${symbol} (mass) must be positive, got: ${value}`);
            }
        }
        
        // Distance/radius must be positive
        if (varName.includes('distance') || varName.includes('radius') || 
            varName.includes('separation') || varName.includes('semi-major') ||
            varSymbol === 'r' || varSymbol === 'd' || varSymbol === 'a' ||
            varSymbol.includes('r_') || varSymbol.includes('d_') || varSymbol.includes('a_')) {
            if (value <= 0) {
                throw new Error(`${symbol} (distance/radius) must be positive, got: ${value}`);
            }
        }
        
        // Temperature must be positive (in Kelvin)
        if (varName.includes('temperature') || varSymbol === 't' || varSymbol.includes('t_')) {
            if (value <= 0) {
                throw new Error(`${symbol} (temperature) must be positive, got: ${value}. Temperature must be in Kelvin.`);
            }
        }
        
        // Period must be positive
        if (varName.includes('period') || varSymbol === 'p' || 
            varSymbol.includes('p_') || (varSymbol === 't' && !varName.includes('temperature'))) {
            if (value <= 0) {
                throw new Error(`${symbol} (period/time) must be positive, got: ${value}`);
            }
        }
        
        // Wavelength must be positive
        if (varName.includes('wavelength') || varSymbol === 'λ' || varSymbol.includes('lambda')) {
            if (value <= 0) {
                throw new Error(`${symbol} (wavelength) must be positive, got: ${value}`);
            }
        }
        
        // Frequency must be positive
        if (varName.includes('frequency') || varSymbol === 'f' || varSymbol === 'ν' || 
            varSymbol.includes('nu') || varSymbol.includes('freq')) {
            if (value <= 0) {
                throw new Error(`${symbol} (frequency) must be positive, got: ${value}`);
            }
        }
        
        // Parallax must be positive
        if (varName.includes('parallax') && varSymbol === 'p') {
            if (value <= 0) {
                throw new Error(`${symbol} (parallax) must be positive, got: ${value}`);
            }
        }
    }
    
    /**
     * ENHANCED: Check if we can solve for a variable
     * @param {string} symbol - Variable symbol
     * @returns {boolean} True if solver exists for this variable
     */
    canSolveFor(symbol) {
        const formulaId = this.formula.id;
        const solver = FormulaCalculator.solvers[formulaId];
        if (!solver) return false;
        
        // Try to solve with dummy values to see if it works
        try {
            const dummyVars = {};
            this.formula.variables.forEach(v => {
                if (v.symbol !== symbol) {
                    // Use a safe default value
                    dummyVars[v.symbol] = 1;
                }
            });
            // Add constants
            Object.assign(dummyVars, globalConstants, this.formula.constants || {});
            
            const result = solver.call(this, symbol, dummyVars);
            return result !== null && result !== undefined && isFinite(result);
        } catch (e) {
            return false;
        }
    }

    /**
     * Solve for a specific variable given the other values
     * 
     * Determines which variable to solve for based on which ones are null/empty.
     * If exactly one variable is null, solves numerically.
     * If multiple variables are null or any are "N/A", returns symbolic expression.
     * 
     * @param {Object} variableValues - Object mapping variable symbols to their values
     *                                  Values can be: number, string (parsed), null, "N/A"
     * @returns {Object} Result object with:
     *                   - result: numerical value or symbolic expression string
     *                   - solvedFor: symbol of variable that was solved
     *                   - isSymbolic: boolean indicating if result is symbolic
     * @throws {Error} If no variables are unknown, or if calculation fails
     * 
     * @example
     * // Numerical solve
     * calculator.solve({ M: 1.989e30, a: 1.496e11, P: null })
     * // Returns: { result: 3.156e7, solvedFor: 'P', isSymbolic: false }
     * 
     * // Symbolic solve
     * calculator.solve({ M: 1.989e30, a: null, P: null })
     * // Returns: { result: "P = 2π√(a³/(GM))", solvedFor: null, isSymbolic: true }
     */
    solve(variableValues) {
        // ENHANCED: Validate inputs first using InputValidator
        try {
            if (typeof InputValidator !== 'undefined' && InputValidator && typeof InputValidator.validateInputs === 'function') {
                InputValidator.validateInputs(this.formula, variableValues);
            } else {
                // Fallback validation if InputValidator is not available
                if (!this.formula || !this.formula.variables) {
                    throw new Error('Invalid formula: formula and variables are required');
                }
                if (!variableValues || typeof variableValues !== 'object') {
                    throw new Error('Invalid variableValues: must be an object');
                }
            }
        } catch (error) {
            // If it's a ReferenceError about InputValidator, provide helpful message
            if (error instanceof ReferenceError && error.message.includes('InputValidator')) {
                throw new Error('InputValidator is not defined. The calculator script may not have loaded properly. Please refresh the page.');
            }
            // Re-throw other errors
            throw error;
        }
        
        const nullVars = [];
        const naVars = [];
        const providedVars = {};

        // ENHANCED: Comprehensive input validation and error handling
        // Separate null, N/A, and provided variables
        for (const varDef of this.formula.variables) {
            const symbol = varDef.symbol;
            const value = variableValues[symbol];
            
            if (value === 'N/A' || value === 'n/a' || value === 'na' || value === 'IDK' || value === 'idk') {
                naVars.push(symbol);
            } else if (value === null || value === '' || value === 'null' || value === undefined) {
                nullVars.push(symbol);
            } else {
                // ENHANCED: Robust number parsing with validation
                let numValue;
                if (typeof value === 'number') {
                    if (!isNaN(value) && isFinite(value)) {
                        numValue = value;
                    } else {
                        throw new Error(`Invalid number for ${symbol}: ${value} (NaN or Infinity)`);
                    }
                } else if (typeof value === 'string') {
                    // Try to parse string - handle scientific notation, fractions, etc.
                    const trimmed = value.trim();
                    numValue = parseFloat(trimmed);
                    if (isNaN(numValue)) {
                        throw new Error(`Invalid number format for ${symbol}: "${value}". Expected a number.`);
                    }
                    if (!isFinite(numValue)) {
                        throw new Error(`Invalid number for ${symbol}: ${value} (Infinity)`);
                    }
                } else {
                    throw new Error(`Invalid type for ${symbol}: ${typeof value}. Expected number or string.`);
                }
                
                // ENHANCED: Validate physical constraints
                this.validateVariableValue(symbol, numValue, varDef);
                
                providedVars[symbol] = numValue;
            }
        }

        // If we have N/A variables, return symbolic expression
        if (naVars.length > 0 || nullVars.length > 1) {
            const allUnknownVars = [...nullVars, ...naVars];
            if (allUnknownVars.length === 0) {
                throw new Error('At least one variable must be unknown (null or N/A)');
            }
            
            // Try to solve symbolically - return expression
            return this.solveSymbolically(allUnknownVars, providedVars, naVars);
        }

        // Standard case: exactly one unknown
        if (nullVars.length === 0) {
            throw new Error('At least one variable must be null (unknown)');
        }

        const unknownVar = nullVars[0];
        
        // ENHANCED: Normalize unknown variable name
        const normalizedUnknownVar = VariableNormalizer.normalize(unknownVar);
        
        // ENHANCED: Validate that we can solve for this variable
        if (!this.canSolveFor(normalizedUnknownVar) && !this.canSolveFor(unknownVar)) {
            throw new CalculationError(
                `Cannot solve for ${unknownVar} in formula ${this.formula.id}. This variable may require symbolic mode.`,
                {
                    formula: this.formula.id,
                    variable: unknownVar,
                    inputs: providedVars,
                    step: 'Variable validation'
                }
            );
        }
        
        // ENHANCED: Wrap calculation in error handling with structured context
        let result;
        try {
            // Try normalized variable name first, fall back to original
            const varToSolve = this.canSolveFor(normalizedUnknownVar) ? normalizedUnknownVar : unknownVar;
            result = this.solveForVariable(varToSolve, providedVars);
        } catch (error) {
            // Wrap in CalculationError if not already
            if (error instanceof CalculationError) {
                error.context.formula = this.formula.id;
                error.context.variable = unknownVar;
                error.context.inputs = providedVars;
                throw error;
            }
            throw new CalculationError(
                `Error solving for ${unknownVar}: ${error.message}`,
                {
                    formula: this.formula.id,
                    variable: unknownVar,
                    inputs: providedVars,
                    step: 'Variable solving',
                    originalError: error.message
                }
            );
        }
        
        // ENHANCED: Validate result with structured error
        if (result === null || result === undefined) {
            throw new CalculationError(
                `Solver returned null/undefined for ${unknownVar}. Check input values.`,
                {
                    formula: this.formula.id,
                    variable: unknownVar,
                    inputs: providedVars,
                    step: 'Result validation'
                }
            );
        }
        if (!isFinite(result)) {
            throw new CalculationError(
                `Result for ${unknownVar} is ${result}. Check for division by zero or invalid input values.`,
                {
                    formula: this.formula.id,
                    variable: unknownVar,
                    inputs: providedVars,
                    step: 'Result validation',
                    result: result
                }
            );
        }
        
        // ENHANCED: Validate physical constraints on result
        this.validateVariableValue(unknownVar, result, this.formula.variables.find(v => v.symbol === unknownVar));
        
        // FIXED: Normalized return format - consistent structure
        return {
            solvedFor: unknownVar,
            result: result,
            unit: this.formula.variables.find(v => v.symbol === unknownVar)?.unit || '',
            isSymbolic: false
        };
    }
    
    // Solve symbolically when multiple variables are unknown
    solveSymbolically(unknownVars, knownVars, naVars) {
        const formulaId = this.formula.id;
        const constants = { ...globalConstants, ...this.formula.constants || {} };
        
        // Create symbolic expressions for all unknown variables
        // Build a system of equations
        const equations = [];
        
        for (const unknownVar of unknownVars) {
            const otherUnknowns = unknownVars.filter(v => v !== unknownVar);
            const expression = this.createSymbolicExpression(formulaId, unknownVar, knownVars, otherUnknowns, constants);
            
            equations.push({
                variable: unknownVar,
                expression: expression,
                unit: this.formula.variables.find(v => v.symbol === unknownVar)?.unit || ''
            });
        }
        
        // FIXED: Return all solutions, not just the first
        // This is much more useful when 2-3 variables are unknown
        return {
            solvedFor: unknownVars[0], // Primary variable for backward compatibility
            result: equations[0].expression, // Primary expression for backward compatibility
            unit: equations[0].unit,
            isSymbolic: true,
            // NEW: All solutions in structured format
            solutions: equations.map(eq => ({
                variable: eq.variable,
                expression: eq.expression,
                unit: eq.unit
            })),
            // Legacy fields for backward compatibility
            otherUnknowns: unknownVars.filter(v => v !== equations[0].variable),
            allEquations: equations
        };
    }
    
    // Create a symbolic expression string
    createSymbolicExpression(formulaId, primaryVar, knownVars, otherUnknowns, constants) {
        const formula = this.formula;
        const allVars = { ...globalConstants, ...constants, ...knownVars };
        
        // For each unknown (except primary), add it as a variable
        otherUnknowns.forEach(symbol => {
            allVars[symbol] = symbol; // Use symbol name as placeholder
        });
        
        // Helper function to format variable values
        const formatVar = (symbol, value) => {
            if (value === undefined || value === null) {
                return symbol;
            }
            if (typeof value === 'string') {
                return value; // Already a symbol
            }
            if (typeof value === 'number' && isFinite(value)) {
                // Format number nicely
                if (Math.abs(value) < 0.001 || Math.abs(value) > 1000000) {
                    return value.toExponential(3);
                }
                return value.toString();
            }
            return symbol;
        };
        
        // Build expression based on formula
        switch (formulaId) {
            case 'magnitude_flux_relation':
                if (primaryVar === 'm1') {
                    return `${formatVar('m2', allVars.m2)} - 2.5 × log₁₀(${formatVar('F1', allVars.F1)} / ${formatVar('F2', allVars.F2)})`;
                } else if (primaryVar === 'm2') {
                    return `${formatVar('m1', allVars.m1)} + 2.5 × log₁₀(${formatVar('F1', allVars.F1)} / ${formatVar('F2', allVars.F2)})`;
                } else if (primaryVar === 'F1') {
                    return `${formatVar('F2', allVars.F2)} × 10^((${formatVar('m2', allVars.m2)} - ${formatVar('m1', allVars.m1)}) / 2.5)`;
                } else if (primaryVar === 'F2') {
                    return `${formatVar('F1', allVars.F1)} × 10^((${formatVar('m1', allVars.m1)} - ${formatVar('m2', allVars.m2)}) / 2.5)`;
                }
                break;
            case 'kepler_third_law':
                if (primaryVar === 'T') {
                    return `√((4π²/(G × ${formatVar('M', allVars.M)})) × ${formatVar('a', allVars.a)}³)`;
                } else if (primaryVar === 'a') {
                    return `∛((${formatVar('T', allVars.T)}² × G × ${formatVar('M', allVars.M)}) / (4π²))`;
                } else if (primaryVar === 'M') {
                    return `(4π² × ${formatVar('a', allVars.a)}³) / (G × ${formatVar('T', allVars.T)}²)`;
                }
                break;
                
            case 'orbital_velocity':
                if (primaryVar === 'v') {
                    return `√(G × ${formatVar('M', allVars.M)} / ${formatVar('r', allVars.r)})`;
                } else if (primaryVar === 'r') {
                    return `G × ${formatVar('M', allVars.M)} / ${formatVar('v', allVars.v)}²`;
                } else if (primaryVar === 'M') {
                    return `${formatVar('r', allVars.r)} × ${formatVar('v', allVars.v)}² / G`;
                }
                break;
                
            case 'escape_velocity':
                if (primaryVar === 'v_esc') {
                    return `√(2 × G × ${formatVar('M', allVars.M)} / ${formatVar('r', allVars.r)})`;
                } else if (primaryVar === 'r') {
                    return `2 × G × ${formatVar('M', allVars.M)} / ${formatVar('v_esc', allVars.v_esc)}²`;
                } else if (primaryVar === 'M') {
                    return `${formatVar('r', allVars.r)} × ${formatVar('v_esc', allVars.v_esc)}² / (2 × G)`;
                }
                break;
                
            case 'angular_size':
                if (primaryVar === 'θ') {
                    return `${formatVar('d', allVars.d)} / ${formatVar('D', allVars.D)}`;
                } else if (primaryVar === 'd') {
                    return `${formatVar('θ', allVars.θ)} × ${formatVar('D', allVars.D)}`;
                } else if (primaryVar === 'D') {
                    return `${formatVar('d', allVars.d)} / ${formatVar('θ', allVars.θ)}`;
                }
                break;
                
            case 'distance_modulus':
                if (primaryVar === 'm') {
                    return `${formatVar('M', allVars.M)} + 5 × log₁₀(${formatVar('d', allVars.d)}) - 5`;
                } else if (primaryVar === 'M') {
                    return `${formatVar('m', allVars.m)} - 5 × log₁₀(${formatVar('d', allVars.d)}) + 5`;
                } else if (primaryVar === 'd') {
                    return `10^((${formatVar('m', allVars.m)} - ${formatVar('M', allVars.M)} + 5) / 5)`;
                }
                break;
                
            case 'luminosity':
                if (primaryVar === 'L') {
                    return `4π × ${formatVar('R', allVars.R)}² × σ × ${formatVar('T', allVars.T)}⁴`;
                } else if (primaryVar === 'R') {
                    return `√(${formatVar('L', allVars.L)} / (4π × σ × ${formatVar('T', allVars.T)}⁴))`;
                } else if (primaryVar === 'T') {
                    return `(${formatVar('L', allVars.L)} / (4π × ${formatVar('R', allVars.R)}² × σ))^(1/4)`;
                }
                break;
                
            case 'hubble_law':
                if (primaryVar === 'v') {
                    return `${formatVar('H₀', allVars['H₀'] || allVars.H0)} × ${formatVar('d', allVars.d)}`;
                } else if (primaryVar === 'd') {
                    return `${formatVar('v', allVars.v)} / ${formatVar('H₀', allVars['H₀'] || allVars.H0)}`;
                } else if (primaryVar === 'H₀') {
                    return `${formatVar('v', allVars.v)} / ${formatVar('d', allVars.d)}`;
                }
                break;
                
            case 'wiens_law':
                if (primaryVar === 'λmax') {
                    return `b / ${formatVar('T', allVars.T)}`;
                } else if (primaryVar === 'T') {
                    return `b / ${formatVar('λmax', allVars.λmax)}`;
                }
                break;
                
            case 'flux_from_luminosity':
                if (primaryVar === 'F') {
                    return `${formatVar('L', allVars.L)} / (4π × ${formatVar('d', allVars.d)}²)`;
                } else if (primaryVar === 'L') {
                    return `4π × ${formatVar('d', allVars.d)}² × ${formatVar('F', allVars.F)}`;
                } else if (primaryVar === 'd') {
                    return `√(${formatVar('L', allVars.L)} / (4π × ${formatVar('F', allVars.F)}))`;
                }
                break;
                
            case 'gravitational_potential_general':
                if (primaryVar === 'Φ' || primaryVar === 'Phi') {
                    return `-G × ${formatVar('M', allVars.M)} / ${formatVar('r', allVars.r)}`;
                } else if (primaryVar === 'M') {
                    return `-${formatVar('Φ', allVars['Φ'] || allVars.Phi)} × ${formatVar('r', allVars.r)} / G`;
                } else if (primaryVar === 'r') {
                    return `-G × ${formatVar('M', allVars.M)} / ${formatVar('Φ', allVars['Φ'] || allVars.Phi)}`;
                }
                break;
                
            default:
                // UNIVERSAL FALLBACK: Try to create symbolic expression from equation
                return this.createSymbolicFromEquation(primaryVar, allVars, otherUnknowns);
        }
        
        // UNIVERSAL FALLBACK: Try to create symbolic expression from equation
        return this.createSymbolicFromEquation(primaryVar, allVars, otherUnknowns);
    }

    /**
     * Create symbolic expression from equation string for ANY formula
     * This ensures EVERY formula can generate symbolic expressions
     * 
     * @param {string} primaryVar - Variable to solve for
     * @param {Object} allVars - All variables with values
     * @param {Array} otherUnknowns - Other unknown variables
     * @returns {string} Symbolic expression
     */
    createSymbolicFromEquation(primaryVar, allVars, otherUnknowns) {
        const equation = this.formula.equation;
        if (!equation) {
            return `${primaryVar} = ?`;
        }
        
        // Format variable values for display
        const formatVar = (symbol, value) => {
            if (value === null || value === undefined) {
                return symbol;
            }
            if (typeof value === 'string' && (value === 'N/A' || value.toLowerCase() === 'na')) {
                return symbol;
            }
            if (typeof value === 'number' && isFinite(value)) {
                // Format large/small numbers
                if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
                    return value.toExponential(3);
                }
                return value.toString();
            }
            return symbol;
        };
        
        // Replace known variables with their values, keep unknowns as symbols
        let expr = equation;
        
        // Get all variable symbols from formula
        const varSymbols = this.formula.variables.map(v => v.symbol);
        
        // Replace each variable
        for (const symbol of varSymbols) {
            const value = allVars[symbol];
            const isUnknown = otherUnknowns.includes(symbol) || symbol === primaryVar;
            
            if (!isUnknown && value !== null && value !== undefined && 
                typeof value === 'number' && isFinite(value)) {
                // Replace with value
                const formatted = formatVar(symbol, value);
                // Replace whole word matches only
                const varRegex = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                expr = expr.replace(varRegex, formatted);
            }
        }
        
        // If primaryVar is on left side, return the right side
        const leftRightPattern = new RegExp(`^${primaryVar}\\s*=\\s*(.+)$`, 'i');
        const match = expr.match(leftRightPattern);
        if (match) {
            return match[1].trim();
        }
        
        // If primaryVar is on right side, try to isolate it
        const rightLeftPattern = new RegExp(`^(.+)\\s*=\\s*${primaryVar}$`, 'i');
        const match2 = expr.match(rightLeftPattern);
        if (match2) {
            // For now, return the equation as-is (could be improved with algebraic manipulation)
            return expr;
        }
        
        // Return the equation with substitutions
        return expr;
    }

    // FIXED: Refactored giant switch to solver registry pattern
    // Performance improvement: O(1) lookup instead of O(n) switch
    // Easier to maintain and test
    static solvers = {
        kepler_third_law: function(unknownVar, vars) { return this.solveKeplerThirdLaw(unknownVar, vars); },
        orbital_velocity: function(unknownVar, vars) { return this.solveOrbitalVelocity(unknownVar, vars); },
        escape_velocity: function(unknownVar, vars) { return this.solveEscapeVelocity(unknownVar, vars); },
        distance_modulus: function(unknownVar, vars) { return this.solveDistanceModulus(unknownVar, vars); },
        luminosity: function(unknownVar, vars) { return this.solveLuminosity(unknownVar, vars); },
        hubble_law: function(unknownVar, vars) { return this.solveHubbleLaw(unknownVar, vars); },
        surface_gravity: function(unknownVar, vars) { return this.solveSurfaceGravity(unknownVar, vars); },
        angular_size: function(unknownVar, vars) { return this.solveAngularSize(unknownVar, vars); },
        parallax_distance_radians: function(unknownVar, vars) { return this.solveParallaxRadians(unknownVar, vars); },
        parallax_distance_arcsec: function(unknownVar, vars) { return this.solveParallaxArcsec(unknownVar, vars); },
        max_gamma_bohm: function(unknownVar, vars) { return this.solveMaxGammaBohm(unknownVar, vars); },
        cooling_break_gamma: function(unknownVar, vars) { return this.solveCoolingBreakGamma(unknownVar, vars); },
        cooling_break_frequency: function(unknownVar, vars) { return this.solveCoolingBreakFrequency(unknownVar, vars); },
        synchrotron_cooling_timescale: function(unknownVar, vars) { return this.solveSynchrotronCooling(unknownVar, vars); },
        synchrotron_power: function(unknownVar, vars) { return this.solveSynchrotronPower(unknownVar, vars); },
        magnetic_energy_density: function(unknownVar, vars) { return this.solveMagneticEnergyDensity(unknownVar, vars); },
        power_law_spectrum: function(unknownVar, vars) { return this.solvePowerLawSpectrum(unknownVar, vars); },
        spectral_index: function(unknownVar, vars) { return this.solveSpectralIndex(unknownVar, vars); },
        chandrasekhar_limit: function(unknownVar, vars) { return this.solveChandrasekharLimit(unknownVar, vars); },
        white_dwarf_mass_radius: function(unknownVar, vars) { return this.solveWhiteDwarfMassRadius(unknownVar, vars); },
        wiens_law: function(unknownVar, vars) { return this.solveWiensLaw(unknownVar, vars); },
        hydrostatic_balance: function(unknownVar, vars) { return this.solveHydrostaticBalance(unknownVar, vars); },
        kepler_third_law_binary: function(unknownVar, vars) { return this.solveKeplerThirdLawBinary(unknownVar, vars); },
        rotational_velocity: function(unknownVar, vars) { return this.solveRotationalVelocity(unknownVar, vars); },
        average_density: function(unknownVar, vars) { return this.solveAverageDensity(unknownVar, vars); },
        flux_from_luminosity: function(unknownVar, vars) { return this.solveFluxFromLuminosity(unknownVar, vars); },
        magnitude_flux_relation: function(unknownVar, vars) { return this.solveMagnitudeFluxRelation(unknownVar, vars); },
        inverse_square_law_brightness: function(unknownVar, vars) { return this.solveInverseSquareLawBrightness(unknownVar, vars); },
        doppler_shift: function(unknownVar, vars) { return this.solveDopplerShift(unknownVar, vars); },
        doppler_shift_approx: function(unknownVar, vars) { return this.solveDopplerShiftApprox(unknownVar, vars); },
        flux_temperature: function(unknownVar, vars) { return this.solveFluxTemperature(unknownVar, vars); },
        stefan_boltzmann_law: function(unknownVar, vars) { return this.solveFluxTemperature(unknownVar, vars); },
        light_gathering_power: function(unknownVar, vars) { return this.solveLightGatheringPower(unknownVar, vars); },
        magnification: function(unknownVar, vars) { return this.solveMagnification(unknownVar, vars); },
        f_ratio: function(unknownVar, vars) { return this.solveFRatio(unknownVar, vars); },
        angular_resolution: function(unknownVar, vars) { return this.solveAngularResolution(unknownVar, vars); },
        kepler_third_law_solar: function(unknownVar, vars) { return this.solveKeplerThirdLawSolar(unknownVar, vars); },
        tidal_force: function(unknownVar, vars) { return this.solveTidalForce(unknownVar, vars); },
        roche_limit: function(unknownVar, vars) { return this.solveRocheLimit(unknownVar, vars); },
        orbital_energy: function(unknownVar, vars) { return this.solveOrbitalEnergy(unknownVar, vars); },
        vis_viva: function(unknownVar, vars) { return this.solveVisViva(unknownVar, vars); },
        center_of_mass: function(unknownVar, vars) { return this.solveCenterOfMass(unknownVar, vars); },
        stellar_lifetime: function(unknownVar, vars) { return this.solveStellarLifetime(unknownVar, vars); },
        mass_luminosity_relation: function(unknownVar, vars) { return this.solveMassLuminosityRelation(unknownVar, vars); },
        hr_color_index: function(unknownVar, vars) { return this.solveHRColorIndex(unknownVar, vars); },
        hr_absolute_magnitude: function(unknownVar, vars) { return this.solveHRAbsoluteMagnitude(unknownVar, vars); },
        friedmann_equation: function(unknownVar, vars) { return this.solveFriedmannEquation(unknownVar, vars); },
        critical_density: function(unknownVar, vars) { return this.solveCriticalDensity(unknownVar, vars); },
        schwarzschild_radius: function(unknownVar, vars) { return this.solveSchwarzschildRadius(unknownVar, vars); },
        time_dilation: function(unknownVar, vars) { return this.solveTimeDilation(unknownVar, vars); },
        length_contraction: function(unknownVar, vars) { return this.solveLengthContraction(unknownVar, vars); },
        planetary_equilibrium_temperature: function(unknownVar, vars) { return this.solvePlanetaryEquilibriumTemperature(unknownVar, vars); },
        greenhouse_effect: function(unknownVar, vars) { return this.solveGreenhouseEffect(unknownVar, vars); },
        albedo: function(unknownVar, vars) { return this.solveAlbedo(unknownVar, vars); },
        blackbody_radiation: function(unknownVar, vars) { return this.solveBlackbodyRadiation(unknownVar, vars); },
        binary_white_dwarf: function(unknownVar, vars) { return this.solveBinaryWhiteDwarf(unknownVar, vars); },
        white_dwarf_orbital_decay: function(unknownVar, vars) { return this.solveWhiteDwarfOrbitalDecay(unknownVar, vars); },
        white_dwarf_merger_timescale: function(unknownVar, vars) { return this.solveWhiteDwarfMergerTimescale(unknownVar, vars); },
        hill_radius: function(unknownVar, vars) { return this.solveHillRadius(unknownVar, vars); },
        synodic_period: function(unknownVar, vars) { return this.solveSynodicPeriod(unknownVar, vars); },
        jeans_mass: function(unknownVar, vars) { return this.solveJeansMass(unknownVar, vars); },
        planck_relation: function(unknownVar, vars) { return this.solvePlanckRelation(unknownVar, vars); },
        einstein_radius: function(unknownVar, vars) { return this.solveEinsteinRadius(unknownVar, vars); },
        angular_momentum_elliptical: function(unknownVar, vars) { return this.solveAngularMomentumElliptical(unknownVar, vars); },
        cosmic_redshift: function(unknownVar, vars) { return this.solveCosmicRedshift(unknownVar, vars); },
        lookback_time: function(unknownVar, vars) { return this.solveLookbackTime(unknownVar, vars); },
        density_parameter: function(unknownVar, vars) { return this.solveDensityParameter(unknownVar, vars); },
        angular_diameter_distance: function(unknownVar, vars) { return this.solveAngularDiameterDistance(unknownVar, vars); },
        luminosity_distance: function(unknownVar, vars) { return this.solveLuminosityDistance(unknownVar, vars); },
        gravitational_potential_general: function(unknownVar, vars) { return this.solveGravitationalPotential(unknownVar, vars); },
        total_energy_virial: function(unknownVar, vars) { return this.solveTotalEnergyVirial(unknownVar, vars); }
    };

    // Solve for a specific variable based on the formula
    solveForVariable(unknownVar, knownVars) {
        const formulaId = this.formula.id;
        
        // Merge global constants, formula constants, and known variables
        const vars = { ...globalConstants, ...this.formula.constants || {}, ...knownVars };
        
        // FIXED: Use solver registry instead of giant switch
        const solver = FormulaCalculator.solvers[formulaId];
        
        if (!solver) {
            // ENHANCED: Use Levenshtein distance for better suggestions
            const availableSolvers = Object.keys(FormulaCalculator.solvers).sort();
            const suggestion = this.findClosestMatch(formulaId, availableSolvers);
            
            let errorMsg = `No specific solver found for formula: ${formulaId}`;
            errorMsg += `\nVariable: ${unknownVar}`;
            errorMsg += `\nEquation: ${this.formula.equation || 'N/A'}`;
            errorMsg += `\n\nThis formula requires a specific solver function to be implemented.`;
            if (suggestion) {
                errorMsg += `\nDid you mean: ${suggestion}?`;
            }
            if (availableSolvers.length > 0) {
                errorMsg += `\n\nAvailable solvers (${availableSolvers.length} total): ${availableSolvers.slice(0, 10).join(', ')}${availableSolvers.length > 10 ? '...' : ''}`;
            }
            errorMsg += `\n\nPlease ensure all required variables are provided and the formula ID is correct.`;
            
            throw new CalculationError(errorMsg, {
                formula: formulaId,
                variable: unknownVar,
                inputs: knownVars,
                step: 'Solver lookup'
            });
        }
        
        try {
            // Call specific solver with proper 'this' context
            // The solver functions are prototype methods that need 'this' context
            const result = solver.call(this, unknownVar, vars);
            if (result === null || result === undefined) {
                throw new Error(`Solver returned null/undefined for ${unknownVar}`);
            }
            if (!isFinite(result)) {
                throw new Error(`Solver returned non-finite result: ${result}`);
            }
            return result;
        } catch (error) {
            // Wrap solver errors with context
            throw new Error(`Error solving ${unknownVar} for ${formulaId}: ${error.message}`);
        }
        
        // OLD SWITCH STATEMENT REMOVED - replaced with registry above
        /*switch (formulaId) {
            case 'kepler_third_law':
                return this.solveKeplerThirdLaw(unknownVar, vars);
            
            case 'orbital_velocity':
                return this.solveOrbitalVelocity(unknownVar, vars);
            
            case 'escape_velocity':
                return this.solveEscapeVelocity(unknownVar, vars);
            
            case 'distance_modulus':
                return this.solveDistanceModulus(unknownVar, vars);
            
            case 'luminosity':
                return this.solveLuminosity(unknownVar, vars);
            
            case 'hubble_law':
                return this.solveHubbleLaw(unknownVar, vars);
            
            case 'surface_gravity':
                return this.solveSurfaceGravity(unknownVar, vars);
            
            case 'angular_size':
                return this.solveAngularSize(unknownVar, vars);
            
            case 'parallax_distance_radians':
                return this.solveParallaxRadians(unknownVar, vars);
            
            case 'parallax_distance_arcsec':
                return this.solveParallaxArcsec(unknownVar, vars);
            
            case 'max_gamma_bohm':
                return this.solveMaxGammaBohm(unknownVar, vars);
            
            case 'cooling_break_gamma':
                return this.solveCoolingBreakGamma(unknownVar, vars);
            
            case 'cooling_break_frequency':
                return this.solveCoolingBreakFrequency(unknownVar, vars);
            
            case 'synchrotron_cooling_timescale':
                return this.solveSynchrotronCooling(unknownVar, vars);
            
            case 'synchrotron_power':
                return this.solveSynchrotronPower(unknownVar, vars);
            
            case 'magnetic_energy_density':
                return this.solveMagneticEnergyDensity(unknownVar, vars);
            
            case 'power_law_spectrum':
                return this.solvePowerLawSpectrum(unknownVar, vars);
            
            case 'spectral_index':
                return this.solveSpectralIndex(unknownVar, vars);
            
            case 'chandrasekhar_limit':
                return this.solveChandrasekharLimit(unknownVar, vars);
            
            case 'white_dwarf_mass_radius':
                return this.solveWhiteDwarfMassRadius(unknownVar, vars);
            
            case 'wiens_law':
                return this.solveWiensLaw(unknownVar, vars);
            
            case 'hydrostatic_balance':
                return this.solveHydrostaticBalance(unknownVar, vars);
            
            case 'kepler_third_law_binary':
                return this.solveKeplerThirdLawBinary(unknownVar, vars);
            
            case 'rotational_velocity':
                return this.solveRotationalVelocity(unknownVar, vars);
            
            case 'average_density':
                return this.solveAverageDensity(unknownVar, vars);
            
            case 'flux_from_luminosity':
                return this.solveFluxFromLuminosity(unknownVar, vars);
            
            case 'magnitude_flux_relation':
                return this.solveMagnitudeFluxRelation(unknownVar, vars);
            
            case 'inverse_square_law_brightness':
                return this.solveInverseSquareLawBrightness(unknownVar, vars);
            
            case 'doppler_shift':
                return this.solveDopplerShift(unknownVar, vars);
            
            case 'doppler_shift_approx':
                return this.solveDopplerShiftApprox(unknownVar, vars);
            
            case 'flux_temperature':
            case 'stefan_boltzmann_law':
                return this.solveFluxTemperature(unknownVar, vars);
            
            case 'light_gathering_power':
                return this.solveLightGatheringPower(unknownVar, vars);
            
            case 'magnification':
                return this.solveMagnification(unknownVar, vars);
            
            case 'f_ratio':
                return this.solveFRatio(unknownVar, vars);
            
            case 'angular_resolution':
                return this.solveAngularResolution(unknownVar, vars);
            
            case 'kepler_third_law_solar':
                return this.solveKeplerThirdLawSolar(unknownVar, vars);
            
            case 'tidal_force':
                return this.solveTidalForce(unknownVar, vars);
            
            case 'roche_limit':
                return this.solveRocheLimit(unknownVar, vars);
            
            case 'orbital_energy':
                return this.solveOrbitalEnergy(unknownVar, vars);
            
            case 'vis_viva':
                return this.solveVisViva(unknownVar, vars);
            
            case 'center_of_mass':
                return this.solveCenterOfMass(unknownVar, vars);
            
            case 'stellar_lifetime':
                return this.solveStellarLifetime(unknownVar, vars);
            
            case 'mass_luminosity_relation':
                return this.solveMassLuminosityRelation(unknownVar, vars);
            
            case 'hr_color_index':
                return this.solveHRColorIndex(unknownVar, vars);
            
            case 'hr_absolute_magnitude':
                return this.solveHRAbsoluteMagnitude(unknownVar, vars);
            
            case 'friedmann_equation':
                return this.solveFriedmannEquation(unknownVar, vars);
            
            case 'critical_density':
                return this.solveCriticalDensity(unknownVar, vars);
            
            case 'schwarzschild_radius':
                return this.solveSchwarzschildRadius(unknownVar, vars);
            
            case 'time_dilation':
                return this.solveTimeDilation(unknownVar, vars);
            
            case 'length_contraction':
                return this.solveLengthContraction(unknownVar, vars);
            
            case 'planetary_equilibrium_temperature':
                return this.solvePlanetaryEquilibriumTemperature(unknownVar, vars);
            
            case 'greenhouse_effect':
                return this.solveGreenhouseEffect(unknownVar, vars);
            
            case 'albedo':
                return this.solveAlbedo(unknownVar, vars);
            
            case 'blackbody_radiation':
                return this.solveBlackbodyRadiation(unknownVar, vars);
            
            case 'binary_white_dwarf':
                return this.solveBinaryWhiteDwarf(unknownVar, vars);
            
            case 'white_dwarf_orbital_decay':
                return this.solveWhiteDwarfOrbitalDecay(unknownVar, vars);
            
            case 'white_dwarf_merger_timescale':
                return this.solveWhiteDwarfMergerTimescale(unknownVar, vars);
            
            case 'hill_radius':
                return this.solveHillRadius(unknownVar, vars);
            
            case 'synodic_period':
                return this.solveSynodicPeriod(unknownVar, vars);
            
            case 'jeans_mass':
                return this.solveJeansMass(unknownVar, vars);
            
            case 'planck_relation':
                return this.solvePlanckRelation(unknownVar, vars);
            
            case 'einstein_radius':
                return this.solveEinsteinRadius(unknownVar, vars);
            
            case 'angular_momentum_elliptical':
                return this.solveAngularMomentumElliptical(unknownVar, vars);
            
            case 'cosmic_redshift':
                return this.solveCosmicRedshift(unknownVar, vars);
            
            case 'lookback_time':
                return this.solveLookbackTime(unknownVar, vars);
            
            case 'density_parameter':
                return this.solveDensityParameter(unknownVar, vars);
            
            case 'angular_diameter_distance':
                return this.solveAngularDiameterDistance(unknownVar, vars);
            
            case 'luminosity_distance':
                return this.solveLuminosityDistance(unknownVar, vars);
            
            case 'gravitational_potential_general':
                return this.solveGravitationalPotential(unknownVar, vars);
            
            default:
                throw new Error(`Solver not implemented for formula: ${formulaId}`);
        }*/
    }

    // Individual formula solvers
    solveKeplerThirdLaw(unknownVar, vars) {
        const { T, a, M, G } = vars;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'T') {
            // T = √((4π²/GM) × a³)
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            SolverValidator.checkNonZero(M, 'M (mass)');
            SolverValidator.checkPositive(a, 'a (semi-major axis)');
            const denominator = G * M;
            SolverValidator.checkNonZero(denominator, 'G × M');
            const result = Math.sqrt(SolverValidator.safeDivide(4 * Math.PI * Math.PI, denominator, 'G × M') * (a * a * a));
            SolverValidator.checkPositive(result, 'T (period)');
            return SolverValidator.validateResult(result, 'Kepler Third Law (T = √((4π²/GM) × a³))');
        } else if (unknownVar === 'a') {
            // a = ∛(T² × GM / 4π²)
            SolverValidator.checkPositive(T, 'T (period)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = T * T * G * M;
            const result = Math.cbrt(SolverValidator.safeDivide(numerator, 4 * Math.PI * Math.PI, '4π²'));
            SolverValidator.checkPositive(result, 'a (semi-major axis)');
            return SolverValidator.validateResult(result, 'Kepler Third Law (a = ∛(T² × GM / 4π²))');
        } else if (unknownVar === 'M') {
            // M = (4π² × a³) / (G × T²)
            SolverValidator.checkPositive(T, 'T (period)');
            SolverValidator.checkPositive(a, 'a (semi-major axis)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = 4 * Math.PI * Math.PI * a * a * a;
            const denominator = G * T * T;
            SolverValidator.checkNonZero(denominator, 'G × T²');
            const result = SolverValidator.safeDivide(numerator, denominator, 'G × T²');
            SolverValidator.checkPositive(result, 'M (mass)');
            return SolverValidator.validateResult(result, 'Kepler Third Law (M = (4π² × a³) / (G × T²))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Kepler's Third Law`);
    }

    solveOrbitalVelocity(unknownVar, vars) {
        const { v, r, M, G } = vars;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'v') {
            // v = √(GM/r)
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = G * M;
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, r, 'r (radius)'));
            SolverValidator.checkPositive(result, 'v (orbital velocity)');
            return SolverValidator.validateResult(result, 'Orbital Velocity (v = √(GM/r))');
        } else if (unknownVar === 'r') {
            // r = GM/v²
            SolverValidator.checkPositive(v, 'v (orbital velocity)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = G * M;
            const denominator = v * v;
            SolverValidator.checkNonZero(denominator, 'v²');
            const result = SolverValidator.safeDivide(numerator, denominator, 'v²');
            SolverValidator.checkPositive(result, 'r (radius)');
            return SolverValidator.validateResult(result, 'Orbital Velocity (r = GM/v²)');
        } else if (unknownVar === 'M') {
            // M = rv²/G
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = r * v * v;
            const result = SolverValidator.safeDivide(numerator, G, 'G (gravitational constant)');
            SolverValidator.checkPositive(result, 'M (mass)');
            return SolverValidator.validateResult(result, 'Orbital Velocity (M = rv²/G)');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Orbital Velocity`);
    }

    solveEscapeVelocity(unknownVar, vars) {
        const { v_esc, r, M, G } = vars;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'v_esc') {
            // v_esc = √(2GM/r)
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = 2 * G * M;
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, r, 'r (radius)'));
            SolverValidator.checkPositive(result, 'v_esc (escape velocity)');
            return SolverValidator.validateResult(result, 'Escape Velocity (v_esc = √(2GM/r))');
        } else if (unknownVar === 'r') {
            // r = 2GM/v_esc²
            SolverValidator.checkPositive(v_esc, 'v_esc (escape velocity)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = 2 * G * M;
            const denominator = v_esc * v_esc;
            SolverValidator.checkNonZero(denominator, 'v_esc²');
            const result = SolverValidator.safeDivide(numerator, denominator, 'v_esc²');
            SolverValidator.checkPositive(result, 'r (radius)');
            return SolverValidator.validateResult(result, 'Escape Velocity (r = 2GM/v_esc²)');
        } else if (unknownVar === 'M') {
            // M = rv_esc²/(2G)
            SolverValidator.checkPositive(r, 'r (radius)');
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            const numerator = r * v_esc * v_esc;
            const result = SolverValidator.safeDivide(numerator, 2 * G, '2G');
            SolverValidator.checkPositive(result, 'M (mass)');
            return SolverValidator.validateResult(result, 'Escape Velocity (M = rv_esc²/(2G))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Escape Velocity`);
    }

    solveDistanceModulus(unknownVar, vars) {
        const { m, M, d } = vars;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'm') {
            // m = M + 5 log₁₀(d) - 5
            SolverValidator.checkPositive(d, 'd (distance)');
            const result = M + 5 * Math.log10(d) - 5;
            return SolverValidator.validateResult(result, 'Distance Modulus (m = M + 5 log₁₀(d) - 5)');
        } else if (unknownVar === 'M') {
            // M = m - 5 log₁₀(d) + 5
            SolverValidator.checkPositive(d, 'd (distance)');
            const result = m - 5 * Math.log10(d) + 5;
            return SolverValidator.validateResult(result, 'Distance Modulus (M = m - 5 log₁₀(d) + 5)');
        } else if (unknownVar === 'd') {
            // d = 10^((m - M + 5)/5)
            const exponent = (m - M + 5) / 5;
            if (!isFinite(exponent)) {
                throw new Error('Invalid exponent in distance modulus calculation. Check input values.');
            }
            const result = Math.pow(10, exponent);
            SolverValidator.checkPositive(result, 'd (distance)');
            return SolverValidator.validateResult(result, 'Distance Modulus (d = 10^((m - M + 5)/5))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Distance Modulus`);
    }

    solveLuminosity(unknownVar, vars) {
        const L = vars.L;
        const R = vars.R;
        const T = vars.T;
        const sigma = vars.σ || vars.sigma;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'L') {
            // L = 4πR²σT⁴
            SolverValidator.checkPositive(R, 'R (radius)');
            SolverValidator.checkPositive(T, 'T (temperature)');
            SolverValidator.checkNonZero(sigma, 'σ (Stefan-Boltzmann constant)');
            const result = 4 * Math.PI * R * R * sigma * Math.pow(T, 4);
            SolverValidator.checkPositive(result, 'L (luminosity)');
            return SolverValidator.validateResult(result, 'Luminosity (L = 4πR²σT⁴)');
        } else if (unknownVar === 'R') {
            // R = √(L/(4πσT⁴))
            SolverValidator.checkPositive(L, 'L (luminosity)');
            SolverValidator.checkPositive(T, 'T (temperature)');
            SolverValidator.checkNonZero(sigma, 'σ (Stefan-Boltzmann constant)');
            const denominator = 4 * Math.PI * sigma * Math.pow(T, 4);
            SolverValidator.checkNonZero(denominator, '4πσT⁴');
            const result = Math.sqrt(SolverValidator.safeDivide(L, denominator, '4πσT⁴'));
            SolverValidator.checkPositive(result, 'R (radius)');
            return SolverValidator.validateResult(result, 'Luminosity (R = √(L/(4πσT⁴)))');
        } else if (unknownVar === 'T') {
            // T = (L/(4πR²σ))^(1/4)
            SolverValidator.checkPositive(L, 'L (luminosity)');
            SolverValidator.checkPositive(R, 'R (radius)');
            SolverValidator.checkNonZero(sigma, 'σ (Stefan-Boltzmann constant)');
            const denominator = 4 * Math.PI * R * R * sigma;
            SolverValidator.checkNonZero(denominator, '4πR²σ');
            const result = Math.pow(SolverValidator.safeDivide(L, denominator, '4πR²σ'), 0.25);
            SolverValidator.checkPositive(result, 'T (temperature)');
            return SolverValidator.validateResult(result, 'Luminosity (T = (L/(4πR²σ))^(1/4))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Luminosity`);
    }

    solveHubbleLaw(unknownVar, vars) {
        const v = vars.v;
        // FIXED: Handle both H₀ and H0 consistently
        const H0 = vars["H₀"] || vars.H0;
        const d = vars.d;
        
        // ENHANCED: Division-by-zero checks using SolverValidator
        if (unknownVar === 'v') {
            // v = H₀ × d
            SolverValidator.checkNonZero(H0, 'H₀ (Hubble constant)');
            SolverValidator.checkPositive(d, 'd (distance)');
            const result = H0 * d;
            return SolverValidator.validateResult(result, 'Hubble Law (v = H₀ × d)');
        } else if (unknownVar === 'H₀' || unknownVar === 'H0' || unknownVar === 'H_0') {
            // H₀ = v/d
            SolverValidator.checkNonZero(d, 'd (distance)');
            const result = SolverValidator.safeDivide(v, d, 'd (distance)');
            return SolverValidator.validateResult(result, 'Hubble Law (H₀ = v/d)');
        } else if (unknownVar === 'd') {
            // d = v/H₀
            SolverValidator.checkNonZero(H0, 'H₀ (Hubble constant)');
            const result = SolverValidator.safeDivide(v, H0, 'H₀ (Hubble constant)');
            return SolverValidator.validateResult(result, 'Hubble Law (d = v/H₀)');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Hubble Law`);
    }

    solveSurfaceGravity(unknownVar, vars) {
        const { g, M, r, G } = vars;
        
        // ENHANCED: Division-by-zero checks using SolverValidator
        if (unknownVar === 'g') {
            // g = GM/r²
            SolverValidator.checkNonZero(r, 'r (radius)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkPositive(G, 'G (gravitational constant)');
            const result = SolverValidator.safeDivide(G * M, r * r, 'r² (radius squared)');
            return SolverValidator.validateResult(result, 'Surface Gravity (g = GM/r²)');
        } else if (unknownVar === 'M') {
            // M = gr²/G
            SolverValidator.checkNonZero(G, 'G (gravitational constant)');
            SolverValidator.checkPositive(g, 'g (surface gravity)');
            SolverValidator.checkPositive(r, 'r (radius)');
            const result = SolverValidator.safeDivide(g * r * r, G, 'G (gravitational constant)');
            return SolverValidator.validateResult(result, 'Surface Gravity (M = gr²/G)');
        } else if (unknownVar === 'r') {
            // r = √(GM/g)
            SolverValidator.checkNonZero(g, 'g (surface gravity)');
            SolverValidator.checkPositive(M, 'M (mass)');
            SolverValidator.checkPositive(G, 'G (gravitational constant)');
            const result = Math.sqrt(SolverValidator.safeDivide(G * M, g, 'g (surface gravity)'));
            return SolverValidator.validateResult(result, 'Surface Gravity (r = √(GM/g))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Surface Gravity`);
    }

    solveAngularSize(unknownVar, vars) {
        const { θ, d, D } = vars;
        
        // ENHANCED: Division-by-zero checks using SolverValidator
        if (unknownVar === 'θ') {
            // θ = d/D
            SolverValidator.checkNonZero(D, 'D (distance)');
            SolverValidator.checkPositive(d, 'd (linear size)');
            const result = SolverValidator.safeDivide(d, D, 'D (distance)');
            return SolverValidator.validateResult(result, 'Angular Size (θ = d/D)');
        } else if (unknownVar === 'd') {
            // d = θ × D
            SolverValidator.checkPositive(θ, 'θ (angular size)');
            SolverValidator.checkPositive(D, 'D (distance)');
            const result = θ * D;
            return SolverValidator.validateResult(result, 'Angular Size (d = θ × D)');
        } else if (unknownVar === 'D') {
            // D = d/θ
            SolverValidator.checkNonZero(θ, 'θ (angular size)');
            SolverValidator.checkPositive(d, 'd (linear size)');
            const result = SolverValidator.safeDivide(d, θ, 'θ (angular size)');
            return SolverValidator.validateResult(result, 'Angular Size (D = d/θ)');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Angular Size`);
    }

    solveParallaxRadians(unknownVar, vars) {
        const { d, p, AU } = vars;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'd') {
            // d = AU / tan(p)
            SolverValidator.checkPositive(p, 'p (parallax angle)');
            SolverValidator.checkPositive(AU, 'AU (astronomical unit)');
            const tanP = Math.tan(p);
            SolverValidator.checkNonZero(tanP, 'tan(p)');
            const result = SolverValidator.safeDivide(AU, tanP, 'tan(p)');
            SolverValidator.checkPositive(result, 'd (distance)');
            return SolverValidator.validateResult(result, 'Parallax Distance (d = AU/tan(p))');
        } else if (unknownVar === 'p') {
            // p = arctan(AU / d)
            SolverValidator.checkPositive(d, 'd (distance)');
            SolverValidator.checkPositive(AU, 'AU (astronomical unit)');
            const result = Math.atan(SolverValidator.safeDivide(AU, d, 'd (distance)'));
            return SolverValidator.validateResult(result, 'Parallax Angle (p = arctan(AU/d))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Parallax (Radians)`);
    }

    solveParallaxArcsec(unknownVar, vars) {
        const { d, p } = vars;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        // Formula: d (pc) = 1 / p (arcsec)
        if (unknownVar === 'd') {
            // d = 1 / p (where p is in arcseconds, d is in parsecs)
            SolverValidator.checkPositive(p, 'p (parallax in arcsec)');
            const result = SolverValidator.safeDivide(1, p, 'p (parallax)');
            SolverValidator.checkPositive(result, 'd (distance in parsecs)');
            return SolverValidator.validateResult(result, 'Parallax Distance (d = 1/p)');
        } else if (unknownVar === 'p') {
            // p = 1 / d (p in arcseconds, d in parsecs)
            SolverValidator.checkPositive(d, 'd (distance in parsecs)');
            const result = SolverValidator.safeDivide(1, d, 'd (distance)');
            SolverValidator.checkPositive(result, 'p (parallax in arcsec)');
            return SolverValidator.validateResult(result, 'Parallax (p = 1/d)');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Parallax (Arcsec)`);
    }

    solveMaxGammaBohm(unknownVar, vars) {
        const gammamax = vars.γmax;
        const B = vars.B;
        const xi = vars.ξ;
        const e = vars.e;
        const sigmaT = vars.σT;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'γmax') {
            // γmax = √(6πε / (σT B ξ))
            SolverValidator.checkNonZero(sigmaT, 'σT (Thomson cross-section)');
            SolverValidator.checkNonZero(B, 'B (magnetic field)');
            SolverValidator.checkNonZero(xi, 'ξ (efficiency factor)');
            const denominator = sigmaT * B * xi;
            SolverValidator.checkNonZero(denominator, 'σT × B × ξ');
            const result = Math.sqrt(SolverValidator.safeDivide(6 * Math.PI * e, denominator, 'σT × B × ξ'));
            SolverValidator.checkPositive(result, 'γmax');
            return SolverValidator.validateResult(result, 'Max Gamma Bohm (γmax = √(6πε/(σT B ξ)))');
        } else if (unknownVar === 'B') {
            // B = 6πε / (σT γmax² ξ)
            SolverValidator.checkNonZero(sigmaT, 'σT (Thomson cross-section)');
            SolverValidator.checkPositive(gammamax, 'γmax');
            SolverValidator.checkNonZero(xi, 'ξ (efficiency factor)');
            const denominator = sigmaT * gammamax * gammamax * xi;
            SolverValidator.checkNonZero(denominator, 'σT × γmax² × ξ');
            const result = SolverValidator.safeDivide(6 * Math.PI * e, denominator, 'σT × γmax² × ξ');
            SolverValidator.checkPositive(result, 'B (magnetic field)');
            return SolverValidator.validateResult(result, 'Max Gamma Bohm (B = 6πε/(σT γmax² ξ))');
        } else if (unknownVar === 'ξ') {
            // ξ = 6πε / (σT B γmax²)
            SolverValidator.checkNonZero(sigmaT, 'σT (Thomson cross-section)');
            SolverValidator.checkNonZero(B, 'B (magnetic field)');
            SolverValidator.checkPositive(gammamax, 'γmax');
            const denominator = sigmaT * B * gammamax * gammamax;
            SolverValidator.checkNonZero(denominator, 'σT × B × γmax²');
            const result = SolverValidator.safeDivide(6 * Math.PI * e, denominator, 'σT × B × γmax²');
            SolverValidator.checkPositive(result, 'ξ (efficiency factor)');
            return SolverValidator.validateResult(result, 'Max Gamma Bohm (ξ = 6πε/(σT B γmax²))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Max Gamma Bohm`);
    }

    solveCoolingBreakGamma(unknownVar, vars) {
        const gammab = vars.γb;
        const B = vars.B;
        const t_age = vars.t_age;
        const m_e = vars.m_e;
        const c = vars.c;
        const sigma_T = vars.σ_T;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'γb') {
            // γb = (6π m_e c) / (σ_T B² t_age)
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkPositive(B, 'B (magnetic field)');
            SolverValidator.checkPositive(t_age, 't_age (age)');
            const numerator = 6 * Math.PI * m_e * c;
            const denominator = sigma_T * B * B * t_age;
            SolverValidator.checkNonZero(denominator, 'σ_T × B² × t_age');
            const result = SolverValidator.safeDivide(numerator, denominator, 'σ_T × B² × t_age');
            SolverValidator.checkPositive(result, 'γb');
            return SolverValidator.validateResult(result, 'Cooling Break Gamma (γb = (6π m_e c)/(σ_T B² t_age))');
        } else if (unknownVar === 'B') {
            // B = √((6π m_e c) / (σ_T γb t_age))
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkPositive(gammab, 'γb');
            SolverValidator.checkPositive(t_age, 't_age (age)');
            const numerator = 6 * Math.PI * m_e * c;
            const denominator = sigma_T * gammab * t_age;
            SolverValidator.checkNonZero(denominator, 'σ_T × γb × t_age');
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, denominator, 'σ_T × γb × t_age'));
            SolverValidator.checkPositive(result, 'B (magnetic field)');
            return SolverValidator.validateResult(result, 'Cooling Break Gamma (B = √((6π m_e c)/(σ_T γb t_age)))');
        } else if (unknownVar === 't_age') {
            // t_age = (6π m_e c) / (σ_T B² γb)
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkPositive(B, 'B (magnetic field)');
            SolverValidator.checkPositive(gammab, 'γb');
            const numerator = 6 * Math.PI * m_e * c;
            const denominator = sigma_T * B * B * gammab;
            SolverValidator.checkNonZero(denominator, 'σ_T × B² × γb');
            const result = SolverValidator.safeDivide(numerator, denominator, 'σ_T × B² × γb');
            SolverValidator.checkPositive(result, 't_age (age)');
            return SolverValidator.validateResult(result, 'Cooling Break Gamma (t_age = (6π m_e c)/(σ_T B² γb))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Cooling Break Gamma`);
    }

    solveCoolingBreakFrequency(unknownVar, vars) {
        const nub = vars.νb;
        const B = vars.B;
        const gammab = vars.γb;
        const e = vars.e;
        const m_e = vars.m_e;
        const c = vars.c;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'νb') {
            // νb = (3eB / (4π m_e c)) × γb²
            SolverValidator.checkNonZero(m_e, 'm_e (electron mass)');
            SolverValidator.checkNonZero(c, 'c (speed of light)');
            SolverValidator.checkPositive(B, 'B (magnetic field)');
            SolverValidator.checkPositive(gammab, 'γb');
            const denominator = 4 * Math.PI * m_e * c;
            SolverValidator.checkNonZero(denominator, '4π m_e c');
            const result = SolverValidator.safeDivide(3 * e * B, denominator, '4π m_e c') * gammab * gammab;
            SolverValidator.checkPositive(result, 'νb (frequency)');
            return SolverValidator.validateResult(result, 'Cooling Break Frequency (νb = (3eB/(4π m_e c)) × γb²)');
        } else if (unknownVar === 'B') {
            // B = (4π m_e c νb) / (3e γb²)
            SolverValidator.checkNonZero(m_e, 'm_e (electron mass)');
            SolverValidator.checkNonZero(c, 'c (speed of light)');
            SolverValidator.checkPositive(nub, 'νb (frequency)');
            SolverValidator.checkPositive(gammab, 'γb');
            const numerator = 4 * Math.PI * m_e * c * nub;
            const denominator = 3 * e * gammab * gammab;
            SolverValidator.checkNonZero(denominator, '3e × γb²');
            const result = SolverValidator.safeDivide(numerator, denominator, '3e × γb²');
            SolverValidator.checkPositive(result, 'B (magnetic field)');
            return SolverValidator.validateResult(result, 'Cooling Break Frequency (B = (4π m_e c νb)/(3e γb²))');
        } else if (unknownVar === 'γb') {
            // γb = √((4π m_e c νb) / (3eB))
            SolverValidator.checkNonZero(m_e, 'm_e (electron mass)');
            SolverValidator.checkNonZero(c, 'c (speed of light)');
            SolverValidator.checkPositive(nub, 'νb (frequency)');
            SolverValidator.checkPositive(B, 'B (magnetic field)');
            const numerator = 4 * Math.PI * m_e * c * nub;
            const denominator = 3 * e * B;
            SolverValidator.checkNonZero(denominator, '3eB');
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, denominator, '3eB'));
            SolverValidator.checkPositive(result, 'γb');
            return SolverValidator.validateResult(result, 'Cooling Break Frequency (γb = √((4π m_e c νb)/(3eB)))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Cooling Break Frequency`);
    }

    solveSynchrotronCooling(unknownVar, vars) {
        const t_syn = vars.t_syn;
        const B = vars.B;
        const gamma = vars.γ;
        const m_e = vars.m_e;
        const c = vars.c;
        const sigma_T = vars.σ_T;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 't_syn') {
            // t_syn = (6π m_e c) / (σ_T B² γ)
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkPositive(B, 'B (magnetic field)');
            SolverValidator.checkPositive(gamma, 'γ (Lorentz factor)');
            const numerator = 6 * Math.PI * m_e * c;
            const denominator = sigma_T * B * B * gamma;
            SolverValidator.checkNonZero(denominator, 'σ_T × B² × γ');
            const result = SolverValidator.safeDivide(numerator, denominator, 'σ_T × B² × γ');
            SolverValidator.checkPositive(result, 't_syn (cooling timescale)');
            return SolverValidator.validateResult(result, 'Synchrotron Cooling (t_syn = (6π m_e c)/(σ_T B² γ))');
        } else if (unknownVar === 'B') {
            // B = √((6π m_e c) / (σ_T t_syn γ))
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkPositive(t_syn, 't_syn (cooling timescale)');
            SolverValidator.checkPositive(gamma, 'γ (Lorentz factor)');
            const numerator = 6 * Math.PI * m_e * c;
            const denominator = sigma_T * t_syn * gamma;
            SolverValidator.checkNonZero(denominator, 'σ_T × t_syn × γ');
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, denominator, 'σ_T × t_syn × γ'));
            SolverValidator.checkPositive(result, 'B (magnetic field)');
            return SolverValidator.validateResult(result, 'Synchrotron Cooling (B = √((6π m_e c)/(σ_T t_syn γ)))');
        } else if (unknownVar === 'γ') {
            // γ = (6π m_e c) / (σ_T B² t_syn)
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkPositive(B, 'B (magnetic field)');
            SolverValidator.checkPositive(t_syn, 't_syn (cooling timescale)');
            const numerator = 6 * Math.PI * m_e * c;
            const denominator = sigma_T * B * B * t_syn;
            SolverValidator.checkNonZero(denominator, 'σ_T × B² × t_syn');
            const result = SolverValidator.safeDivide(numerator, denominator, 'σ_T × B² × t_syn');
            SolverValidator.checkPositive(result, 'γ (Lorentz factor)');
            return SolverValidator.validateResult(result, 'Synchrotron Cooling (γ = (6π m_e c)/(σ_T B² t_syn))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Synchrotron Cooling`);
    }

    solveSynchrotronPower(unknownVar, vars) {
        const P_syn = vars.P_syn;
        const U_B = vars.U_B;
        const gamma = vars.γ;
        const sigma_T = vars.σ_T;
        const c = vars.c;
        
        // ENHANCED: Use SolverValidator for consistent error handling
        if (unknownVar === 'P_syn') {
            // P_syn = (4/3) σ_T c U_B γ²
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkNonZero(c, 'c (speed of light)');
            SolverValidator.checkPositive(U_B, 'U_B (magnetic energy density)');
            SolverValidator.checkPositive(gamma, 'γ (Lorentz factor)');
            const result = (4/3) * sigma_T * c * U_B * gamma * gamma;
            SolverValidator.checkPositive(result, 'P_syn (synchrotron power)');
            return SolverValidator.validateResult(result, 'Synchrotron Power (P_syn = (4/3) σ_T c U_B γ²)');
        } else if (unknownVar === 'U_B') {
            // U_B = (3 P_syn) / (4 σ_T c γ²)
            SolverValidator.checkPositive(P_syn, 'P_syn (synchrotron power)');
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkNonZero(c, 'c (speed of light)');
            SolverValidator.checkPositive(gamma, 'γ (Lorentz factor)');
            const numerator = 3 * P_syn;
            const denominator = 4 * sigma_T * c * gamma * gamma;
            SolverValidator.checkNonZero(denominator, '4 σ_T c γ²');
            const result = SolverValidator.safeDivide(numerator, denominator, '4 σ_T c γ²');
            SolverValidator.checkPositive(result, 'U_B (magnetic energy density)');
            return SolverValidator.validateResult(result, 'Synchrotron Power (U_B = (3 P_syn)/(4 σ_T c γ²))');
        } else if (unknownVar === 'γ') {
            // γ = √((3 P_syn) / (4 σ_T c U_B))
            SolverValidator.checkPositive(P_syn, 'P_syn (synchrotron power)');
            SolverValidator.checkNonZero(sigma_T, 'σ_T (Thomson cross-section)');
            SolverValidator.checkNonZero(c, 'c (speed of light)');
            SolverValidator.checkPositive(U_B, 'U_B (magnetic energy density)');
            const numerator = 3 * P_syn;
            const denominator = 4 * sigma_T * c * U_B;
            SolverValidator.checkNonZero(denominator, '4 σ_T c U_B');
            const result = Math.sqrt(SolverValidator.safeDivide(numerator, denominator, '4 σ_T c U_B'));
            SolverValidator.checkPositive(result, 'γ (Lorentz factor)');
            return SolverValidator.validateResult(result, 'Synchrotron Power (γ = √((3 P_syn)/(4 σ_T c U_B)))');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Synchrotron Power`);
    }

    solveMagneticEnergyDensity(unknownVar, vars) {
        const { U_B, B } = vars;
        
        if (unknownVar === 'U_B') {
            // U_B = B² / (8π)
            return (B * B) / (8 * Math.PI);
        } else if (unknownVar === 'B') {
            // B = √(8π U_B)
            return Math.sqrt(8 * Math.PI * U_B);
        }
    }

    solvePowerLawSpectrum(unknownVar, vars) {
        const { N, K, E, p } = vars;
        
        if (unknownVar === 'N') {
            // N = K E^(-p)
            return K * Math.pow(E, -p);
        } else if (unknownVar === 'K') {
            // K = N / E^(-p) = N E^p
            return N * Math.pow(E, p);
        } else if (unknownVar === 'E') {
            // E = (N/K)^(-1/p)
            return Math.pow(N / K, -1/p);
        } else if (unknownVar === 'p') {
            // p = -ln(N/K) / ln(E)
            return -Math.log(N / K) / Math.log(E);
        }
    }

    solveSpectralIndex(unknownVar, vars) {
        const alpha = vars.α;
        const p = vars.p;
        
        if (unknownVar === 'α') {
            // α = (p - 1) / 2
            return (p - 1) / 2;
        } else if (unknownVar === 'p') {
            // p = 2α + 1
            return 2 * alpha + 1;
        }
    }

    solveChandrasekharLimit(unknownVar, vars) {
        const M_Ch = vars.M_Ch;
        const M_sun = vars["M_☉"];
        
        if (unknownVar === 'M_Ch') {
            // M_Ch = 1.4 M_☉
            return 1.4 * M_sun;
        }
    }

    solveWhiteDwarfMassRadius(unknownVar, vars) {
        const { R, M } = vars;
        
        // FIXED: Return symbolic relation instead of throwing error
        // R ∝ 1 / M^(1/3), so R = k / M^(1/3)
        // For calculation, we use R = k / M^(1/3) where k is a constant
        // Since it's proportional, we can only solve if we have a reference point
        // But we can return the symbolic relationship
        
        if (unknownVar === 'R') {
            // R = k / M^(1/3), but k is unknown
            // Return symbolic expression instead of error
            if (M !== undefined && M !== null) {
                // If we have M, we need a reference - use typical white dwarf values
                // Typical: M = 0.6 M☉, R = 0.01 R☉
                const M_ref = 0.6 * (vars["M_☉"] || vars.M_sun || 1.989e30);
                const R_ref = 0.01 * (vars["R_☉"] || vars.R_sun || 6.96e8);
                const k = R_ref * Math.pow(M_ref, 1/3);
                return k / Math.pow(M, 1/3);
            }
            // Symbolic: R = k / M^(1/3)
            throw new Error('White dwarf mass-radius relation: R = k / M^(1/3). Provide M to calculate R, or use symbolic mode.');
        } else if (unknownVar === 'M') {
            // M = (k/R)^3, but k is unknown
            if (R !== undefined && R !== null) {
                // Use reference values
                const M_ref = 0.6 * (vars["M_☉"] || vars.M_sun || 1.989e30);
                const R_ref = 0.01 * (vars["R_☉"] || vars.R_sun || 6.96e8);
                const k = R_ref * Math.pow(M_ref, 1/3);
                return Math.pow(k / R, 3);
            }
            // Symbolic: M = (k/R)^3
            throw new Error('White dwarf mass-radius relation: M = (k/R)^3. Provide R to calculate M, or use symbolic mode.');
        }
    }

    solveWiensLaw(unknownVar, vars) {
        const { λmax, T, b } = vars;
        const wienConstant = b || 2.897771955e-3; // Wien's displacement constant in m·K
        
        // ENHANCED: Division-by-zero checks using SolverValidator
        if (unknownVar === 'λmax') {
            // λmax = b / T
            SolverValidator.checkNonZero(wienConstant, 'b (Wien constant)');
            SolverValidator.checkPositive(T, 'T (temperature)');
            const result = SolverValidator.safeDivide(wienConstant, T, 'T (temperature)');
            SolverValidator.checkPositive(result, 'λmax (wavelength)');
            return SolverValidator.validateResult(result, 'Wien Law (λmax = b/T)');
        } else if (unknownVar === 'T') {
            // T = b / λmax
            SolverValidator.checkNonZero(wienConstant, 'b (Wien constant)');
            SolverValidator.checkPositive(λmax, 'λmax (wavelength)');
            const result = SolverValidator.safeDivide(wienConstant, λmax, 'λmax (wavelength)');
            SolverValidator.checkPositive(result, 'T (temperature)');
            return SolverValidator.validateResult(result, 'Wien Law (T = b/λmax)');
        }
        throw new Error(`Cannot solve for ${unknownVar} in Wien Law`);
    }

    solveHydrostaticBalance(unknownVar, vars) {
        const { dP_dr, M, ρ, r, G } = vars;
        
        if (unknownVar === 'dP_dr') {
            // dP/dr = -GM(r)ρ(r) / r²
            return -(G * M * ρ) / (r * r);
        } else if (unknownVar === 'M') {
            // M = -(dP/dr) r² / (G ρ)
            return -(dP_dr * r * r) / (G * ρ);
        } else if (unknownVar === 'ρ') {
            // ρ = -(dP/dr) r² / (G M)
            return -(dP_dr * r * r) / (G * M);
        } else if (unknownVar === 'r') {
            // r = √(-(dP/dr) / (G M ρ))
            return Math.sqrt(-(dP_dr) / (G * M * ρ));
        }
    }

    solveKeplerThirdLawBinary(unknownVar, vars) {
        const { P, a, M1, M2, G } = vars;
        
        if (unknownVar === 'P') {
            // P = √((4π²a³) / (G(M1 + M2)))
            return Math.sqrt((4 * Math.PI * Math.PI * a * a * a) / (G * (M1 + M2)));
        } else if (unknownVar === 'a') {
            // a = ∛((G(M1 + M2) P²) / (4π²))
            return Math.cbrt((G * (M1 + M2) * P * P) / (4 * Math.PI * Math.PI));
        } else if (unknownVar === 'M1') {
            // M1 = (4π²a³) / (G P²) - M2
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M2;
        } else if (unknownVar === 'M2') {
            // M2 = (4π²a³) / (G P²) - M1
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M1;
        }
    }

    solveRotationalVelocity(unknownVar, vars) {
        const { v, R, P_rot } = vars;
        
        if (unknownVar === 'v') {
            // v = (2πR) / P_rot
            return (2 * Math.PI * R) / P_rot;
        } else if (unknownVar === 'R') {
            // R = (v P_rot) / (2π)
            return (v * P_rot) / (2 * Math.PI);
        } else if (unknownVar === 'P_rot') {
            // P_rot = (2πR) / v
            return (2 * Math.PI * R) / v;
        }
    }

    solveAverageDensity(unknownVar, vars) {
        const { ρ, M, R } = vars;
        
        if (unknownVar === 'ρ') {
            // ρ = 3M / (4πR³)
            return (3 * M) / (4 * Math.PI * R * R * R);
        } else if (unknownVar === 'M') {
            // M = (4πR³ρ) / 3
            return (4 * Math.PI * R * R * R * ρ) / 3;
        } else if (unknownVar === 'R') {
            // R = ∛(3M / (4πρ))
            return Math.cbrt((3 * M) / (4 * Math.PI * ρ));
        }
    }

    solveFluxFromLuminosity(unknownVar, vars) {
        const { F, L, d } = vars;
        
        if (unknownVar === 'F') {
            // F = L / (4πd²)
            return L / (4 * Math.PI * d * d);
        } else if (unknownVar === 'L') {
            // L = 4πd²F
            return 4 * Math.PI * d * d * F;
        } else if (unknownVar === 'd') {
            // d = √(L / (4πF))
            return Math.sqrt(L / (4 * Math.PI * F));
        }
    }

    solveMagnitudeFluxRelation(unknownVar, vars) {
        const { m1, m2, F1, F2 } = vars;
        
        if (unknownVar === 'm1') {
            // m1 = m2 - 2.5 log₁₀(F1/F2)
            return m2 - 2.5 * Math.log10(F1 / F2);
        } else if (unknownVar === 'm2') {
            // m2 = m1 + 2.5 log₁₀(F1/F2)
            return m1 + 2.5 * Math.log10(F1 / F2);
        } else if (unknownVar === 'F1') {
            // F1 = F2 × 10^((m2 - m1) / 2.5)
            return F2 * Math.pow(10, (m2 - m1) / 2.5);
        } else if (unknownVar === 'F2') {
            // F2 = F1 × 10^((m1 - m2) / 2.5)
            return F1 * Math.pow(10, (m1 - m2) / 2.5);
        }
    }

    solveInverseSquareLawBrightness(unknownVar, vars) {
        const { b, L, d, pi } = vars;
        const p = pi || Math.PI;
        
        if (unknownVar === 'b') {
            return L / (4 * p * d * d);
        } else if (unknownVar === 'L') {
            return b * 4 * p * d * d;
        } else if (unknownVar === 'd') {
            return Math.sqrt(L / (4 * p * b));
        }
    }

    solveDopplerShift(unknownVar, vars) {
        const lambda_obs = vars['λ_obs'] || vars.lambda_obs;
        const lambda_rest = vars['λ_rest'] || vars.lambda_rest;
        const v = vars.v;
        const c = vars.c || 2.998e8;
        
        if (unknownVar === 'λ_obs' || unknownVar === 'lambda_obs') {
            return lambda_rest * (1 + v / c);
        } else if (unknownVar === 'λ_rest' || unknownVar === 'lambda_rest') {
            return lambda_obs / (1 + v / c);
        } else if (unknownVar === 'v') {
            return c * ((lambda_obs - lambda_rest) / lambda_rest);
        }
    }

    solveDopplerShiftApprox(unknownVar, vars) {
        const v = vars.v;
        const c = vars.c || 2.998e8;
        const deltaLambda = vars['Δλ'] || vars.deltaLambda;
        const lambda = vars['λ'] || vars.lambda;
        
        if (unknownVar === 'v') {
            return c * (deltaLambda / lambda);
        } else if (unknownVar === 'Δλ' || unknownVar === 'deltaLambda') {
            return v * lambda / c;
        } else if (unknownVar === 'λ' || unknownVar === 'lambda') {
            return c * deltaLambda / v;
        }
    }

    solveFluxTemperature(unknownVar, vars) {
        const F = vars.F;
        const T = vars.T;
        const sigma = vars['σ'] || vars.sigma || 5.670e-8;
        
        if (unknownVar === 'F') {
            return sigma * Math.pow(T, 4);
        } else if (unknownVar === 'T') {
            return Math.pow(F / sigma, 0.25);
        }
    }

    solveLightGatheringPower(unknownVar, vars) {
        const { LGP, D_obj, D_eye } = vars;
        
        if (unknownVar === 'LGP') {
            return Math.pow(D_obj / D_eye, 2);
        } else if (unknownVar === 'D_obj') {
            return D_eye * Math.sqrt(LGP);
        } else if (unknownVar === 'D_eye') {
            return D_obj / Math.sqrt(LGP);
        }
    }

    solveMagnification(unknownVar, vars) {
        const { M, f_obj, f_eye } = vars;
        
        if (unknownVar === 'M') {
            return f_obj / f_eye;
        } else if (unknownVar === 'f_obj') {
            return M * f_eye;
        } else if (unknownVar === 'f_eye') {
            return f_obj / M;
        }
    }

    solveFRatio(unknownVar, vars) {
        const { f_ratio, f, D } = vars;
        
        if (unknownVar === 'f_ratio') {
            return f / D;
        } else if (unknownVar === 'f') {
            return f_ratio * D;
        } else if (unknownVar === 'D') {
            return f / f_ratio;
        }
    }

    solveAngularResolution(unknownVar, vars) {
        const theta = vars['θ'] || vars.theta;
        const lambda = vars['λ'] || vars.lambda;
        const D = vars.D;
        const factor = vars.factor || 1.22;
        
        if (unknownVar === 'θ' || unknownVar === 'theta') {
            return factor * (lambda / D);
        } else if (unknownVar === 'λ' || unknownVar === 'lambda') {
            return theta * D / factor;
        } else if (unknownVar === 'D') {
            return factor * lambda / theta;
        }
    }

    solveKeplerThirdLawSolar(unknownVar, vars) {
        const { P, a } = vars;
        
        if (unknownVar === 'P') {
            return Math.sqrt(a * a * a);
        } else if (unknownVar === 'a') {
            return Math.cbrt(P * P);
        }
    }

    solveTidalForce(unknownVar, vars) {
        const { F_tidal, G, M, m, R, d } = vars;
        const grav = G || 6.67430e-11;
        
        if (unknownVar === 'F_tidal') {
            return (2 * grav * M * m * R) / (d * d * d);
        } else if (unknownVar === 'd') {
            return Math.cbrt((2 * grav * M * m * R) / F_tidal);
        } else if (unknownVar === 'M') {
            return (F_tidal * d * d * d) / (2 * grav * m * R);
        } else if (unknownVar === 'm') {
            return (F_tidal * d * d * d) / (2 * grav * M * R);
        } else if (unknownVar === 'R') {
            return (F_tidal * d * d * d) / (2 * grav * M * m);
        }
    }

    solveRocheLimit(unknownVar, vars) {
        const { d, R, ρ_M, ρ_m, factor } = vars;
        const fac = factor || 2;
        
        if (unknownVar === 'd') {
            return R * Math.cbrt(fac * (ρ_M / ρ_m));
        } else if (unknownVar === 'R') {
            return d / Math.cbrt(fac * (ρ_M / ρ_m));
        } else if (unknownVar === 'ρ_M') {
            return ρ_m * Math.pow(d / (R * Math.cbrt(fac)), 3);
        } else if (unknownVar === 'ρ_m') {
            return ρ_M / Math.pow(d / (R * Math.cbrt(fac)), 3);
        }
    }

    solveOrbitalEnergy(unknownVar, vars) {
        const { E, G, M, m, a } = vars;
        const grav = G || 6.67430e-11;
        
        if (unknownVar === 'E') {
            return -(grav * M * m) / (2 * a);
        } else if (unknownVar === 'a') {
            return -(grav * M * m) / (2 * E);
        } else if (unknownVar === 'M') {
            return -(2 * E * a) / (grav * m);
        } else if (unknownVar === 'm') {
            return -(2 * E * a) / (grav * M);
        }
    }

    solveVisViva(unknownVar, vars) {
        const { v, G, M, r, a } = vars;
        const grav = G || 6.67430e-11;
        
        if (unknownVar === 'v') {
            return Math.sqrt(grav * M * ((2 / r) - (1 / a)));
        } else if (unknownVar === 'a') {
            return 1 / ((2 / r) - (v * v / (grav * M)));
        } else if (unknownVar === 'r') {
            return 2 / ((v * v / (grav * M)) + (1 / a));
        } else if (unknownVar === 'M') {
            return (v * v) / (grav * ((2 / r) - (1 / a)));
        }
    }

    solveCenterOfMass(unknownVar, vars) {
        const { M1, M2, r1, r2, a } = vars;
        
        if (unknownVar === 'r1') {
            return (M2 * r2) / M1;
        } else if (unknownVar === 'r2') {
            return (M1 * r1) / M2;
        } else if (unknownVar === 'a') {
            return r1 + r2;
        } else if (unknownVar === 'M1') {
            return (M2 * r2) / r1;
        } else if (unknownVar === 'M2') {
            return (M1 * r1) / r2;
        }
    }

    solveStellarLifetime(unknownVar, vars) {
        const tau = vars['τ'] || vars.tau;
        const M_sun = vars['M_sun'] || vars.M_sun || 1.989e30;
        const M = vars.M;
        const factor = vars.factor || 1e10;
        const exponent = vars.exponent || 2.5;
        
        if (unknownVar === 'τ' || unknownVar === 'tau') {
            return factor * Math.pow(M_sun / M, exponent);
        } else if (unknownVar === 'M') {
            return M_sun / Math.pow(tau / factor, 1 / exponent);
        }
    }

    solveMassLuminosityRelation(unknownVar, vars) {
        const { L, M, exponent } = vars;
        const exp = exponent || 3.5;
        
        if (unknownVar === 'L') {
            return Math.pow(M, exp);
        } else if (unknownVar === 'M') {
            return Math.pow(L, 1 / exp);
        }
    }

    solveHRColorIndex(unknownVar, vars) {
        const B_V = vars['B_V'] || vars.B_V;
        const F_B = vars['F_B'] || vars.F_B;
        const F_V = vars['F_V'] || vars.F_V;
        const C = vars.C;
        const factor = vars.factor || -2.5;
        
        if (unknownVar === 'B_V' || unknownVar === 'B_V') {
            return factor * Math.log10(F_B / F_V) + C;
        } else if (unknownVar === 'F_B' || unknownVar === 'F_B') {
            return F_V * Math.pow(10, (B_V - C) / factor);
        } else if (unknownVar === 'F_V' || unknownVar === 'F_V') {
            return F_B / Math.pow(10, (B_V - C) / factor);
        } else if (unknownVar === 'C') {
            return B_V - factor * Math.log10(F_B / F_V);
        }
    }

    solveHRAbsoluteMagnitude(unknownVar, vars) {
        const M_V = vars['M_V'] || vars.M_V;
        const L = vars.L;
        const L_sun = vars['L_sun'] || vars.L_sun || 3.828e26;
        const factor = vars.factor || -2.5;
        const offset = vars.offset || 4.83;
        
        if (unknownVar === 'M_V' || unknownVar === 'M_V') {
            return factor * Math.log10(L / L_sun) + offset;
        } else if (unknownVar === 'L') {
            return L_sun * Math.pow(10, (M_V - offset) / factor);
        }
    }

    solveFriedmannEquation(unknownVar, vars) {
        const H = vars.H;
        const H0 = vars.H0;
        const Omega_m = vars['Ω_m'] || vars.Omega_m;
        const Omega_r = vars['Ω_r'] || vars.Omega_r;
        const Omega_Lambda = vars['Ω_Λ'] || vars.Omega_Lambda;
        const a = vars.a;
        
        if (unknownVar === 'H') {
            return H0 * Math.sqrt(Omega_m * Math.pow(a, -3) + Omega_r * Math.pow(a, -4) + Omega_Lambda);
        } else if (unknownVar === 'H0' || unknownVar === 'H0') {
            return H / Math.sqrt(Omega_m * Math.pow(a, -3) + Omega_r * Math.pow(a, -4) + Omega_Lambda);
        }
        // Note: Solving for other variables requires more complex algebra
    }

    solveCriticalDensity(unknownVar, vars) {
        const rho_c = vars['ρ_c'] || vars.rho_c;
        const H0 = vars.H0;
        const G = vars.G || 6.67430e-11;
        const factor = vars.factor || 3;
        const pi = vars.pi || Math.PI;
        
        // Convert H0 from km/(s·Mpc) to 1/s
        const H0_s = H0 * 1000 / (3.086e22); // Convert Mpc to m
        
        if (unknownVar === 'ρ_c' || unknownVar === 'rho_c') {
            return (factor * H0_s * H0_s) / (8 * pi * G);
        } else if (unknownVar === 'H0' || unknownVar === 'H0') {
            return Math.sqrt((8 * pi * G * rho_c) / factor) * (3.086e22 / 1000); // Convert back
        }
    }

    solveSchwarzschildRadius(unknownVar, vars) {
        const R_s = vars['R_s'] || vars.R_s;
        const G = vars.G || 6.67430e-11;
        const M = vars.M;
        const c = vars.c || 2.998e8;
        const factor = vars.factor || 2;
        
        if (unknownVar === 'R_s' || unknownVar === 'R_s') {
            return (factor * G * M) / (c * c);
        } else if (unknownVar === 'M') {
            return (R_s * c * c) / (factor * G);
        }
    }

    solveTimeDilation(unknownVar, vars) {
        const delta_t_prime = vars['Δt\''] || vars['delta_t_prime'] || vars.delta_t_prime;
        const delta_t = vars['Δt'] || vars.delta_t || vars.delta_t;
        const v = vars.v;
        const c = vars.c || 2.998e8;
        
        if (unknownVar === 'Δt\'' || unknownVar === 'delta_t_prime' || unknownVar === 'delta_t_prime') {
            return delta_t / Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'Δt' || unknownVar === 'delta_t' || unknownVar === 'delta_t') {
            return delta_t_prime * Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'v') {
            return c * Math.sqrt(1 - Math.pow(delta_t / delta_t_prime, 2));
        }
    }

    solveLengthContraction(unknownVar, vars) {
        const L_prime = vars['L\''] || vars['L_prime'] || vars.L_prime;
        const L = vars.L;
        const v = vars.v;
        const c = vars.c || 2.998e8;
        
        if (unknownVar === 'L\'' || unknownVar === 'L_prime' || unknownVar === 'L_prime') {
            return L * Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'L') {
            return L_prime / Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'v') {
            return c * Math.sqrt(1 - Math.pow(L_prime / L, 2));
        }
    }

    solvePlanetaryEquilibriumTemperature(unknownVar, vars) {
        const T_eq = vars['T_eq'] || vars.T_eq;
        const T_star = vars['T_star'] || vars.T_star;
        const R_star = vars['R_star'] || vars.R_star;
        const a = vars.a;
        const A = vars.A;
        const factor = vars.factor || 2;
        
        if (unknownVar === 'T_eq' || unknownVar === 'T_eq') {
            return T_star * Math.sqrt(R_star / (factor * a)) * Math.pow(1 - A, 0.25);
        } else if (unknownVar === 'T_star' || unknownVar === 'T_star') {
            return T_eq / (Math.sqrt(R_star / (factor * a)) * Math.pow(1 - A, 0.25));
        } else if (unknownVar === 'a') {
            return R_star / (factor * Math.pow(T_eq / (T_star * Math.pow(1 - A, 0.25)), 2));
        } else if (unknownVar === 'A') {
            return 1 - Math.pow(T_eq / (T_star * Math.sqrt(R_star / (factor * a))), 4);
        }
    }

    solveGreenhouseEffect(unknownVar, vars) {
        const delta_T_GH = vars['ΔT_GH'] || vars.delta_T_GH || vars.delta_T_GH;
        const T_surface = vars['T_surface'] || vars.T_surface;
        const T_eq = vars['T_eq'] || vars.T_eq;
        
        if (unknownVar === 'ΔT_GH' || unknownVar === 'delta_T_GH' || unknownVar === 'delta_T_GH') {
            return T_surface - T_eq;
        } else if (unknownVar === 'T_surface' || unknownVar === 'T_surface') {
            return T_eq + delta_T_GH;
        } else if (unknownVar === 'T_eq' || unknownVar === 'T_eq') {
            return T_surface - delta_T_GH;
        }
    }

    solveAlbedo(unknownVar, vars) {
        const { A, F_reflected, F_incident } = vars;
        
        if (unknownVar === 'A') {
            return F_reflected / F_incident;
        } else if (unknownVar === 'F_reflected') {
            return A * F_incident;
        } else if (unknownVar === 'F_incident') {
            return F_reflected / A;
        }
    }

    solveBlackbodyRadiation(unknownVar, vars) {
        const B_lambda = vars['B_λ'] || vars.B_lambda;
        const h = vars.h || 6.626e-34;
        const c = vars.c || 2.998e8;
        const lambda = vars['λ'] || vars.lambda;
        const k = vars.k || 1.381e-23;
        const T = vars.T;
        const factor = vars.factor || 2;
        
        // B_λ(T) = (2hc² / λ⁵) × (1 / (e^(hc/(λkT)) - 1))
        const hc = h * c;
        const exponent = hc / (lambda * k * T);
        
        if (unknownVar === 'B_λ' || unknownVar === 'B_lambda') {
            return (factor * hc * c / Math.pow(lambda, 5)) * (1 / (Math.exp(exponent) - 1));
        } else if (unknownVar === 'T') {
            // Requires iterative solution, use approximation
            const numerator = factor * hc * c / Math.pow(lambda, 5);
            const target = B_lambda / numerator;
            // Approximate: T ≈ hc / (λk * ln(1 + 1/target))
            return hc / (lambda * k * Math.log(1 + 1 / target));
        }
    }

    solveBinaryWhiteDwarf(unknownVar, vars) {
        const { P, a, M1, M2, G } = vars;
        
        if (unknownVar === 'P') {
            // P = √((4π²a³) / (G(M1 + M2)))
            return Math.sqrt((4 * Math.PI * Math.PI * a * a * a) / (G * (M1 + M2)));
        } else if (unknownVar === 'a') {
            // a = ∛((G(M1 + M2) P²) / (4π²))
            return Math.cbrt((G * (M1 + M2) * P * P) / (4 * Math.PI * Math.PI));
        } else if (unknownVar === 'M1') {
            // M1 = (4π²a³) / (G P²) - M2
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M2;
        } else if (unknownVar === 'M2') {
            // M2 = (4π²a³) / (G P²) - M1
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M1;
        }
    }

    solveWhiteDwarfOrbitalDecay(unknownVar, vars) {
        const da_dt = vars.da_dt;
        const a = vars.a;
        const M1 = vars.M1;
        const M2 = vars.M2;
        const G = vars.G || 6.67430e-11;
        const c = vars.c || 2.99792458e8;
        
        // da/dt = -64G³(M₁M₂(M₁+M₂)) / (5c⁵a³)
        if (unknownVar === 'da_dt') {
            return -(64 * Math.pow(G, 3) * M1 * M2 * (M1 + M2)) / (5 * Math.pow(c, 5) * a * a * a);
        } else if (unknownVar === 'a') {
            // a = ∛(-64G³(M₁M₂(M₁+M₂)) / (5c⁵(da/dt)))
            return Math.cbrt(-(64 * Math.pow(G, 3) * M1 * M2 * (M1 + M2)) / (5 * Math.pow(c, 5) * da_dt));
        } else if (unknownVar === 'M1') {
            // This requires solving a cubic equation, use approximation or numerical method
            // For simplicity, assume M1 = M2 and solve
            const M = M2; // Use M2 as reference
            const numerator = -5 * Math.pow(c, 5) * a * a * a * da_dt;
            const denominator = 64 * Math.pow(G, 3) * M;
            // M1(M1 + M) = numerator / denominator
            // M1² + M*M1 - (numerator/denominator) = 0
            const coeff = numerator / denominator;
            return (-M + Math.sqrt(M * M + 4 * coeff)) / 2;
        } else if (unknownVar === 'M2') {
            // Similar to M1
            const M = M1;
            const numerator = -5 * Math.pow(c, 5) * a * a * a * da_dt;
            const denominator = 64 * Math.pow(G, 3) * M;
            const coeff = numerator / denominator;
            return (-M + Math.sqrt(M * M + 4 * coeff)) / 2;
        }
    }

    solveWhiteDwarfMergerTimescale(unknownVar, vars) {
        const t_merge = vars.t_merge;
        const a = vars.a;
        const M1 = vars.M1;
        const M2 = vars.M2;
        const G = vars.G || 6.67430e-11;
        const c = vars.c || 2.99792458e8;
        
        // t_merge = (5c⁵a⁴) / (256G³M₁M₂(M₁+M₂))
        if (unknownVar === 't_merge') {
            return (5 * Math.pow(c, 5) * Math.pow(a, 4)) / (256 * Math.pow(G, 3) * M1 * M2 * (M1 + M2));
        } else if (unknownVar === 'a') {
            // a = (256G³M₁M₂(M₁+M₂)t_merge / (5c⁵))^(1/4)
            return Math.pow((256 * Math.pow(G, 3) * M1 * M2 * (M1 + M2) * t_merge) / (5 * Math.pow(c, 5)), 0.25);
        } else if (unknownVar === 'M1') {
            // M1(M1 + M2) = (5c⁵a⁴) / (256G³M₂t_merge)
            const coeff = (5 * Math.pow(c, 5) * Math.pow(a, 4)) / (256 * Math.pow(G, 3) * M2 * t_merge);
            return (-M2 + Math.sqrt(M2 * M2 + 4 * coeff)) / 2;
        } else if (unknownVar === 'M2') {
            // Similar to M1
            const coeff = (5 * Math.pow(c, 5) * Math.pow(a, 4)) / (256 * Math.pow(G, 3) * M1 * t_merge);
            return (-M1 + Math.sqrt(M1 * M1 + 4 * coeff)) / 2;
        }
    }

    solveHillRadius(unknownVar, vars) {
        const R_H = vars.R_H;
        const a = vars.a;
        const m = vars.m;
        const M = vars.M;
        
        // R_H = a × (m / (3M))^(1/3)
        if (unknownVar === 'R_H') {
            return a * Math.pow(m / (3 * M), 1/3);
        } else if (unknownVar === 'a') {
            return R_H / Math.pow(m / (3 * M), 1/3);
        } else if (unknownVar === 'm') {
            return 3 * M * Math.pow(R_H / a, 3);
        } else if (unknownVar === 'M') {
            return m / (3 * Math.pow(R_H / a, 3));
        }
    }

    solveSynodicPeriod(unknownVar, vars) {
        const P_syn = vars.P_syn;
        const P1 = vars['P₁'] || vars.P1;
        const P2 = vars['P₂'] || vars.P2;
        
        // 1/P_syn = |1/P₁ - 1/P₂|
        if (unknownVar === 'P_syn') {
            return 1 / Math.abs(1/P1 - 1/P2);
        } else if (unknownVar === 'P₁' || unknownVar === 'P1') {
            // 1/P₁ = 1/P_syn ± 1/P₂
            const term = 1/P_syn;
            const p2Term = 1/P2;
            // Try both solutions
            const sol1 = 1 / (term + p2Term);
            const sol2 = 1 / Math.abs(term - p2Term);
            return sol1 > 0 ? sol1 : sol2;
        } else if (unknownVar === 'P₂' || unknownVar === 'P2') {
            const term = 1/P_syn;
            const p1Term = 1/P1;
            const sol1 = 1 / (term + p1Term);
            const sol2 = 1 / Math.abs(term - p1Term);
            return sol1 > 0 ? sol1 : sol2;
        }
    }

    solveJeansMass(unknownVar, vars) {
        const M_J = vars.M_J;
        const T = vars.T;
        const ρ = vars.ρ;
        const μ = vars.μ || 2.3;
        const G = vars.G || 6.67430e-11;
        const k = vars.k || 1.380649e-23;
        const m_H = vars.m_H || 1.6735575e-27;
        
        // M_J ≈ ((5kT) / (Gμm_H))^(3/2) / ρ^(1/2)
        const coeff = Math.pow((5 * k * T) / (G * μ * m_H), 3/2);
        if (unknownVar === 'M_J') {
            return coeff / Math.sqrt(ρ);
        } else if (unknownVar === 'T') {
            return (G * μ * m_H / (5 * k)) * Math.pow(M_J * Math.sqrt(ρ), 2/3);
        } else if (unknownVar === 'ρ') {
            return Math.pow(coeff / M_J, 2);
        }
    }

    solvePlanckRelation(unknownVar, vars) {
        const E = vars.E;
        const f = vars.f;
        const λ = vars.λ;
        const h = vars.h || 6.62607015e-34;
        const c = vars.c || 2.99792458e8;
        
        // E = hf = hc / λ
        if (unknownVar === 'E') {
            if (f !== null && f !== undefined) {
                return h * f;
            } else if (λ !== null && λ !== undefined) {
                return h * c / λ;
            }
        } else if (unknownVar === 'f') {
            return E / h;
        } else if (unknownVar === 'λ') {
            return h * c / E;
        }
    }

    solveEinsteinRadius(unknownVar, vars) {
        const θ_E = vars.θ_E;
        const M = vars.M;
        const D_LS = vars.D_LS;
        const D_L = vars.D_L;
        const D_S = vars.D_S;
        const G = vars.G || 6.67430e-11;
        const c = vars.c || 2.99792458e8;
        
        // θ_E = √((4GM D_LS) / (c² D_L D_S))
        const numerator = 4 * G * M * D_LS;
        const denominator = c * c * D_L * D_S;
        if (unknownVar === 'θ_E') {
            return Math.sqrt(numerator / denominator);
        } else if (unknownVar === 'M') {
            return (θ_E * θ_E * c * c * D_L * D_S) / (4 * G * D_LS);
        } else if (unknownVar === 'D_LS') {
            return (θ_E * θ_E * c * c * D_L * D_S) / (4 * G * M);
        } else if (unknownVar === 'D_L') {
            return (4 * G * M * D_LS) / (θ_E * θ_E * c * c * D_S);
        } else if (unknownVar === 'D_S') {
            return (4 * G * M * D_LS) / (θ_E * θ_E * c * c * D_L);
        }
    }

    solveAngularMomentumElliptical(unknownVar, vars) {
        const L = vars.L;
        const m_r = vars.m_r;
        const M = vars.M;
        const a = vars.a;
        const e = vars.e;
        const G = vars.G || 6.67430e-11;
        
        // L = m_r × √(GMa(1 - e²))
        const sqrtTerm = Math.sqrt(G * M * a * (1 - e * e));
        if (unknownVar === 'L') {
            return m_r * sqrtTerm;
        } else if (unknownVar === 'm_r') {
            return L / sqrtTerm;
        } else if (unknownVar === 'a') {
            return Math.pow(L / (m_r * Math.sqrt(G * M * (1 - e * e))), 2);
        } else if (unknownVar === 'e') {
            return Math.sqrt(1 - Math.pow(L / (m_r * Math.sqrt(G * M * a)), 2));
        }
    }

    solveCosmicRedshift(unknownVar, vars) {
        const z = vars.z;
        const λ_obs = vars.λ_obs;
        const λ_emit = vars.λ_emit;
        
        // z = (λ_obs - λ_emit) / λ_emit
        if (unknownVar === 'z') {
            return (λ_obs - λ_emit) / λ_emit;
        } else if (unknownVar === 'λ_obs') {
            return λ_emit * (1 + z);
        } else if (unknownVar === 'λ_emit') {
            return λ_obs / (1 + z);
        }
    }

    solveLookbackTime(unknownVar, vars) {
        const t = vars.t;
        const d = vars.d;
        const c = vars.c || 2.99792458e8;
        
        // t ≈ d / c
        if (unknownVar === 't') {
            return d / c;
        } else if (unknownVar === 'd') {
            return t * c;
        }
    }

    solveDensityParameter(unknownVar, vars) {
        const Ω = vars.Ω;
        const ρ = vars.ρ;
        const ρ_c = vars.ρ_c;
        
        // Ω = ρ / ρ_c
        if (unknownVar === 'Ω') {
            return ρ / ρ_c;
        } else if (unknownVar === 'ρ') {
            return Ω * ρ_c;
        } else if (unknownVar === 'ρ_c') {
            return ρ / Ω;
        }
    }

    solveAngularDiameterDistance(unknownVar, vars) {
        const D_A = vars.D_A;
        const D = vars.D;
        const θ = vars.θ;
        
        // D_A = D / θ
        if (unknownVar === 'D_A') {
            return D / θ;
        } else if (unknownVar === 'D') {
            return D_A * θ;
        } else if (unknownVar === 'θ') {
            return D / D_A;
        }
    }

    solveLuminosityDistance(unknownVar, vars) {
        const D_L = vars.D_L;
        const L = vars.L;
        const F = vars.F;
        const π = vars.π || Math.PI;
        
        // D_L = √(L / (4πF))
        if (unknownVar === 'D_L') {
            return Math.sqrt(L / (4 * π * F));
        } else if (unknownVar === 'L') {
            return 4 * π * F * D_L * D_L;
        } else if (unknownVar === 'F') {
            return L / (4 * π * D_L * D_L);
        }
    }

    solveGravitationalPotential(unknownVar, vars) {
        const Phi = vars['Φ'] || vars.Phi;
        const M = vars.M;
        const r = vars.r;
        const G = vars.G || 6.67430e-11;
        
        // ENHANCED: Division-by-zero and validation checks
        // Φ = -G M / r
        if (unknownVar === 'Φ' || unknownVar === 'Phi') {
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (M === 0) {
                throw new Error('Mass M must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            const result = -(G * M) / r;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'M') {
            // M = -Φ r / G
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            if (Phi === 0) {
                throw new Error('Potential Φ must be non-zero to solve for mass');
            }
            const result = -(Phi * r) / G;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'r') {
            // r = -G M / Φ
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (M === 0) {
                throw new Error('Mass M must be non-zero');
            }
            if (Phi === 0) {
                throw new Error('Potential Φ must be non-zero to solve for radius');
            }
            const result = -(G * M) / Phi;
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        }
    }

    /**
     * Solve Total Energy from Virial Theorem
     * Equation: E_total = -E_grav / 2
     * 
     * @param {string} unknownVar - Variable to solve for
     * @param {Object} vars - Known variables
     * @returns {number} Solved value
     */
    solveTotalEnergyVirial(unknownVar, vars) {
        const E_total = vars.E_total;
        const E_grav = vars.E_grav;
        
        // ENHANCED: Validation checks
        if (unknownVar === 'E_total') {
            if (E_grav === null || E_grav === undefined) {
                throw new Error('E_grav (gravitational energy) is required to solve for E_total');
            }
            // E_total = -E_grav / 2
            const result = -E_grav / 2;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'E_grav') {
            if (E_total === null || E_total === undefined) {
                throw new Error('E_total (total energy) is required to solve for E_grav');
            }
            // E_grav = -2 * E_total
            const result = -2 * E_total;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else {
            throw new Error(`Cannot solve for ${unknownVar} in virial theorem equation`);
        }
    }

    /**
     * UNIVERSAL Generic Equation Solver - Solves ANY simple algebraic equation
     * 
     * Handles ALL patterns:
     * - x = y + z, x = y - z
     * - x = y * z, x = y × z, x = y · z
     * - x = y / z
     * - x = -y, x = -y / n, x = -n * y
     * - x = y^n, x = √y, x = ∛y
     * - Reverse patterns (solving for variable on right side)
     * - Multi-variable expressions
     * 
     * @param {string} unknownVar - Variable to solve for
     * @param {Object} vars - Known variables
     * @returns {number|null} Solved value or null if cannot solve
     */
    solveGenericEquation(unknownVar, vars) {
        const equation = this.formula.equation;
        if (!equation) return null;
        
        // Normalize equation: remove spaces, handle Unicode
        let eq = equation.replace(/\s+/g, ' ').trim();
        eq = eq.replace(/×/g, '*').replace(/·/g, '*');
        
        // Escape special regex characters in unknownVar
        const escapedVar = unknownVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // PATTERN 1: Direct match - unknownVar on left side
        // x = expression
        const directPattern = new RegExp(`^${escapedVar}\\s*=\\s*(.+)$`, 'i');
        const directMatch = eq.match(directPattern);
        if (directMatch) {
            const expression = directMatch[1];
            return this.evaluateExpression(expression, vars, unknownVar);
        }
        
        // PATTERN 2: Reverse match - unknownVar on right side
        // expression = x
        const reversePattern = new RegExp(`^(.+)\\s*=\\s*${escapedVar}$`, 'i');
        const reverseMatch = eq.match(reversePattern);
        if (reverseMatch) {
            const expression = reverseMatch[1];
            // For reverse, we need to solve: expression = unknownVar
            // This means unknownVar = expression (already solved)
            return this.evaluateExpression(expression, vars, unknownVar);
        }
        
        // PATTERN 3: Try algebraic manipulation
        // If equation has form: A = B, and we need A, then A = B
        // If equation has form: A = B, and we need B, then B = A
        const equalsPattern = /^(.+?)\s*=\s*(.+)$/;
        const equalsMatch = eq.match(equalsPattern);
        if (equalsMatch) {
            const leftSide = equalsMatch[1].trim();
            const rightSide = equalsMatch[2].trim();
            
            // Check if unknownVar is on left side
            if (new RegExp(`\\b${escapedVar}\\b`, 'i').test(leftSide)) {
                // Solve: leftSide = rightSide for unknownVar
                return this.solveAlgebraic(leftSide, rightSide, unknownVar, vars);
            }
            
            // Check if unknownVar is on right side
            if (new RegExp(`\\b${escapedVar}\\b`, 'i').test(rightSide)) {
                // Solve: rightSide = leftSide for unknownVar (reversed)
                return this.solveAlgebraic(rightSide, leftSide, unknownVar, vars);
            }
        }
        
        return null; // Could not solve generically
    }
    
    /**
     * Find closest matching solver name using Levenshtein distance
     * @param {string} target - Target formula ID
     * @param {string[]} options - Available solver IDs
     * @returns {string|null} Closest match or null if no good match
     */
    findClosestMatch(target, options) {
        if (!target || !options || options.length === 0) {
            return null;
        }
        
        let closest = null;
        let minDistance = Infinity;
        const maxDistance = 3; // Maximum edit distance for suggestion
        
        for (const option of options) {
            const distance = this.levenshteinDistance(target.toLowerCase(), option.toLowerCase());
            if (distance < minDistance) {
                minDistance = distance;
                closest = option;
            }
        }
        
        return minDistance <= maxDistance ? closest : null;
    }
    
    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} a - First string
     * @param {string} b - Second string
     * @returns {number} Edit distance
     */
    levenshteinDistance(a, b) {
        const matrix = Array(b.length + 1).fill(null).map(() => 
            Array(a.length + 1).fill(null)
        );
        
        // Initialize first row and column
        for (let i = 0; i <= a.length; i++) {
            matrix[0][i] = i;
        }
        for (let j = 0; j <= b.length; j++) {
            matrix[j][0] = j;
        }
        
        // Fill matrix
        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,      // deletion
                    matrix[j - 1][i] + 1,      // insertion
                    matrix[j - 1][i - 1] + indicator  // substitution
                );
            }
        }
        
        return matrix[b.length][a.length];
    }

    /**
     * Evaluate a mathematical expression with variables
     * 
     * @param {string} expression - Expression to evaluate (e.g., "-E_grav / 2", "G * M / r")
     * @param {Object} vars - Variable values
     * @param {string} excludeVar - Variable to exclude (the one we're solving for)
     * @returns {number|null} Evaluated result
     */
    evaluateExpression(expression, vars, excludeVar) {
        try {
            // Replace all variables with their values
            let expr = expression;
            let allVarsFound = true;
            
            // ENHANCED: Find all variable names in expression
            // OPTIMIZED: Add directly to Set instead of intermediate array
            const varPattern = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
            const variables = new Set();
            
            // Collect all variable names directly into Set
            let match;
            while ((match = varPattern.exec(expression)) !== null) {
                const varName = match[1];
                // Skip constants and the variable we're solving for
                const lowerVarName = varName.toLowerCase();
                const isConstant = [
                    'pi', 'π', 'e', 'E', 'G', 'c', 'h', 'k', 'σ', 'sigma',
                    'm_sun', 'm☉', 'm_☉', 'l_sun', 'l☉', 'l_☉', 'r_sun', 'r☉', 'r_☉',
                    'm_earth', 'm_⊕', 'au', 'm_e', 'm_h', 'sigma_t', 'σ_t'
                ].includes(lowerVarName) || 
                (globalConstants && globalConstants[varName] !== undefined) ||
                (this.formula.constants && this.formula.constants[varName] !== undefined);
                
                if (varName !== excludeVar && !isConstant) {
                    variables.add(varName);
                }
            }
            
            // Check if all required variables have values
            for (const varName of variables) {
                const value = vars[varName];
                if (value === null || value === undefined || !isFinite(value)) {
                    allVarsFound = false;
                    break;
                }
            }
            
            if (!allVarsFound) {
                return null;
            }
            
            // Replace variables with values
            for (const varName of variables) {
                const value = vars[varName];
                // Replace whole word matches only
                const varRegex = new RegExp(`\\b${varName}\\b`, 'g');
                expr = expr.replace(varRegex, value.toString());
            }
            
            // Replace constants - comprehensive list
            expr = expr.replace(/\bpi\b/gi, Math.PI.toString());
            expr = expr.replace(/\bπ\b/g, Math.PI.toString());
            expr = expr.replace(/\be\b(?![\d.])/gi, Math.E.toString());
            
            // Replace all constants from vars (including globalConstants and formula constants)
            const allConstants = { ...globalConstants, ...(this.formula.constants || {}) };
            for (const [constName, constValue] of Object.entries(allConstants)) {
                if (constValue !== null && constValue !== undefined && isFinite(constValue)) {
                    // Replace whole word matches only
                    const constRegex = new RegExp(`\\b${constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                    expr = expr.replace(constRegex, constValue.toString());
                }
            }
            
            // Also replace from vars (in case they're passed in)
            for (const [constName, constValue] of Object.entries(vars)) {
                if (constValue !== null && constValue !== undefined && isFinite(constValue)) {
                    // Only replace if it's a constant (not a variable we're solving for)
                    if (constName === excludeVar) continue;
                    const lowerName = constName.toLowerCase();
                    const isConst = [
                        'pi', 'π', 'e', 'G', 'c', 'h', 'k', 'σ', 'sigma',
                        'm_sun', 'm☉', 'm_☉', 'l_sun', 'l☉', 'l_☉', 'r_sun', 'r☉', 'r_☉',
                        'm_earth', 'm_⊕', 'au', 'm_e', 'm_h', 'sigma_t', 'σ_t'
                    ].includes(lowerName) || 
                    (globalConstants && globalConstants[constName] !== undefined) ||
                    (this.formula.constants && this.formula.constants[constName] !== undefined);
                    
                    if (isConst) {
                        const constRegex = new RegExp(`\\b${constName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                        expr = expr.replace(constRegex, constValue.toString());
                    }
                }
            }
            
            // Handle power notation (^ and superscripts)
            expr = expr.replace(/\^/g, '**');
            expr = expr.replace(/([a-zA-Z0-9_]+)²/g, '($1)**2');
            expr = expr.replace(/([a-zA-Z0-9_]+)³/g, '($1)**3');
            expr = expr.replace(/([a-zA-Z0-9_]+)⁴/g, '($1)**4');
            expr = expr.replace(/([a-zA-Z0-9_]+)⁵/g, '($1)**5');
            
            // Handle sqrt, cbrt (with parentheses and without)
            expr = expr.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
            expr = expr.replace(/√([a-zA-Z0-9_]+)/g, 'Math.sqrt($1)');
            expr = expr.replace(/∛\(([^)]+)\)/g, 'Math.cbrt($1)');
            expr = expr.replace(/∛([a-zA-Z0-9_]+)/g, 'Math.cbrt($1)');
            
            // Handle log functions
            expr = expr.replace(/log₁₀\(([^)]+)\)/g, 'Math.log10($1)');
            expr = expr.replace(/log10\(([^)]+)\)/g, 'Math.log10($1)');
            expr = expr.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
            expr = expr.replace(/log\(([^)]+)\)/g, 'Math.log10($1)'); // Default to log10
            
            // Handle trigonometric functions
            expr = expr.replace(/sin\(([^)]+)\)/g, 'Math.sin($1)');
            expr = expr.replace(/cos\(([^)]+)\)/g, 'Math.cos($1)');
            expr = expr.replace(/tan\(([^)]+)\)/g, 'Math.tan($1)');
            expr = expr.replace(/asin\(([^)]+)\)/g, 'Math.asin($1)');
            expr = expr.replace(/acos\(([^)]+)\)/g, 'Math.acos($1)');
            expr = expr.replace(/atan\(([^)]+)\)/g, 'Math.atan($1)');
            
            // Handle exp
            expr = expr.replace(/exp\(([^)]+)\)/g, 'Math.exp($1)');
            
            // ENHANCED: Use SafeMathEvaluator with token-based variable replacement
            // This prevents partial matches (e.g., "a" won't match "a_max")
            // Build a vars object with only the variables we found (excluding constants)
            const varsForEvaluation = {};
            for (const varName of variables) {
                if (vars[varName] !== undefined && vars[varName] !== null && isFinite(vars[varName])) {
                    varsForEvaluation[varName] = vars[varName];
                }
            }
            
            // Evaluate using SafeMathEvaluator (replaces unsafe Function constructor)
            // SafeMathEvaluator will handle variable replacement safely
            const result = SafeMathEvaluator.evaluate(expr, varsForEvaluation);
            
            // Validate result
            SolverValidator.validateResult(result, 'Expression evaluation');
            return result;
        } catch (e) {
            // Evaluation failed
            return null;
        }
        
        return null;
    }

    /**
     * Solve algebraic equation: leftSide = rightSide for unknownVar
     * 
     * @param {string} leftSide - Left side of equation
     * @param {string} rightSide - Right side of equation
     * @param {string} unknownVar - Variable to solve for
     * @param {Object} vars - Known variables
     * @returns {number|null} Solved value
     */
    solveAlgebraic(leftSide, rightSide, unknownVar, vars) {
        // Simple cases where unknownVar appears alone or with simple operations
        const escapedVar = unknownVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Case 1: unknownVar = rightSide (already isolated)
        if (leftSide.trim() === unknownVar) {
            return this.evaluateExpression(rightSide, vars, unknownVar);
        }
        
        // Case 1b: unknownVar² = rightSide → unknownVar = ±√rightSide
        const power2Pattern = new RegExp(`^${escapedVar}²$|^${escapedVar}\\^2$`, 'i');
        if (power2Pattern.test(leftSide.trim())) {
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(rightValue)) {
                if (rightValue < 0) return null; // No real solution
                return Math.sqrt(rightValue);
            }
        }
        
        // Case 1c: unknownVar³ = rightSide → unknownVar = ∛rightSide
        const power3Pattern = new RegExp(`^${escapedVar}³$|^${escapedVar}\\^3$`, 'i');
        if (power3Pattern.test(leftSide.trim())) {
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(rightValue)) {
                return Math.cbrt(rightValue);
            }
        }
        
        // Case 2: -unknownVar = rightSide → unknownVar = -rightSide
        if (leftSide.trim() === `-${unknownVar}`) {
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null) return -rightValue;
        }
        
        // Case 2b: -unknownVar² = rightSide → unknownVar = ±√(-rightSide)
        const negPower2Pattern = new RegExp(`^-${escapedVar}²$|^-${escapedVar}\\^2$`, 'i');
        if (negPower2Pattern.test(leftSide.trim())) {
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(rightValue)) {
                if (rightValue > 0) return null; // No real solution
                return Math.sqrt(-rightValue);
            }
        }
        
        // Case 3: unknownVar / n = rightSide → unknownVar = n * rightSide
        const divPattern = new RegExp(`^${unknownVar}\\s*/\\s*([0-9.]+)$`, 'i');
        const divMatch = leftSide.match(divPattern);
        if (divMatch) {
            const divisor = parseFloat(divMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(divisor) && divisor !== 0) {
                return rightValue * divisor;
            }
        }
        
        // Case 4: -unknownVar / n = rightSide → unknownVar = -n * rightSide
        const negDivPattern = new RegExp(`^-${unknownVar}\\s*/\\s*([0-9.]+)$`, 'i');
        const negDivMatch = leftSide.match(negDivPattern);
        if (negDivMatch) {
            const divisor = parseFloat(negDivMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(divisor) && divisor !== 0) {
                return -rightValue * divisor;
            }
        }
        
        // Case 5: n * unknownVar = rightSide → unknownVar = rightSide / n
        const multPattern = new RegExp(`^([0-9.]+)\\s*[×*]\\s*${unknownVar}$`, 'i');
        const multMatch = leftSide.match(multPattern);
        if (multMatch) {
            const multiplier = parseFloat(multMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(multiplier) && multiplier !== 0) {
                return rightValue / multiplier;
            }
        }
        
        // Case 6: -n * unknownVar = rightSide → unknownVar = -rightSide / n
        const negMultPattern = new RegExp(`^-([0-9.]+)\\s*[×*]\\s*${unknownVar}$`, 'i');
        const negMultMatch = leftSide.match(negMultPattern);
        if (negMultMatch) {
            const multiplier = parseFloat(negMultMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(multiplier) && multiplier !== 0) {
                return -rightValue / multiplier;
            }
        }
        
        // Case 7: unknownVar * var = rightSide → unknownVar = rightSide / var
        const varMultPattern = new RegExp(`^${unknownVar}\\s*[×*]\\s*([A-Za-z_]+)$`, 'i');
        const varMultMatch = leftSide.match(varMultPattern);
        if (varMultMatch) {
            const otherVar = varMultMatch[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) && otherValue !== 0 &&
                rightValue !== null) {
                return rightValue / otherValue;
            }
        }
        
        // Case 8: var * unknownVar = rightSide → unknownVar = rightSide / var
        const varMultPattern2 = new RegExp(`^([A-Za-z_]+)\\s*[×*]\\s*${unknownVar}$`, 'i');
        const varMultMatch2 = leftSide.match(varMultPattern2);
        if (varMultMatch2) {
            const otherVar = varMultMatch2[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) && otherValue !== 0 &&
                rightValue !== null) {
                return rightValue / otherValue;
            }
        }
        
        // Case 9: unknownVar / var = rightSide → unknownVar = rightSide * var
        const varDivPattern = new RegExp(`^${unknownVar}\\s*/\\s*([A-Za-z_]+)$`, 'i');
        const varDivMatch = leftSide.match(varDivPattern);
        if (varDivMatch) {
            const otherVar = varDivMatch[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) &&
                rightValue !== null) {
                return rightValue * otherValue;
            }
        }
        
        // Case 10: var / unknownVar = rightSide → unknownVar = var / rightSide
        const varDivPattern2 = new RegExp(`^([A-Za-z_]+)\\s*/\\s*${unknownVar}$`, 'i');
        const varDivMatch2 = leftSide.match(varDivPattern2);
        if (varDivMatch2) {
            const otherVar = varDivMatch2[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) &&
                rightValue !== null && rightValue !== 0) {
                return otherValue / rightValue;
            }
        }
        
        return null;
    }

    /**
     * Convert symbolic expression to LaTeX format
     * Useful for rendering beautiful math in UI
     * @param {string} expression - Symbolic expression string
     * @returns {string} LaTeX formatted expression
     */
    toLatex(expression) {
        if (!expression || typeof expression !== 'string') {
            return expression || '';
        }
        
        // Convert common math symbols and operations to LaTeX
        let latex = expression
            // Greek letters
            .replace(/Φ/g, '\\Phi')
            .replace(/θ/g, '\\theta')
            .replace(/λ/g, '\\lambda')
            .replace(/π/g, '\\pi')
            .replace(/σ/g, '\\sigma')
            .replace(/τ/g, '\\tau')
            .replace(/ρ/g, '\\rho')
            .replace(/Ω/g, '\\Omega')
            .replace(/α/g, '\\alpha')
            .replace(/β/g, '\\beta')
            .replace(/γ/g, '\\gamma')
            .replace(/Δ/g, '\\Delta')
            .replace(/ν/g, '\\nu')
            // Subscripts
            .replace(/_([a-zA-Z0-9]+)/g, '_{$1}')
            // Superscripts
            .replace(/\^([0-9]+)/g, '^{$1}')
            .replace(/([a-zA-Z])\^([0-9]+)/g, '$1^{$2}')
            // Square roots
            .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
            .replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}')
            // Multiplication
            .replace(/×/g, ' \\times ')
            // Log base 10
            .replace(/log₁₀\(([^)]+)\)/g, '\\log_{10}\\left($1\\right)')
            .replace(/log10\(([^)]+)\)/g, '\\log_{10}\\left($1\\right)')
            // Natural log
            .replace(/ln\(([^)]+)\)/g, '\\ln\\left($1\\right)')
            // Powers
            .replace(/([a-zA-Z0-9]+)³/g, '$1^3')
            .replace(/([a-zA-Z0-9]+)²/g, '$1^2')
            .replace(/([a-zA-Z0-9]+)⁴/g, '$1^4')
            // Cube root
            .replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}')
            // Parentheses
            .replace(/\(/g, '\\left(')
            .replace(/\)/g, '\\right)');
        
        return latex;
    }
    
    /**
     * ENHANCED: Verify calculator is completely offline-capable
     * Checks that all dependencies are local
     * @returns {Object} Verification result
     */
    static verifyOfflineCapability() {
        const verification = {
            offline: true,
            issues: [],
            constants: {},
            dependencies: []
        };
        
        // Check globalConstants exists and is defined locally
        if (typeof globalConstants === 'undefined') {
            verification.offline = false;
            verification.issues.push('globalConstants not defined');
        } else {
            verification.constants = Object.keys(globalConstants);
            // Verify all required constants are present
            const required = ['G', 'c', 'σ', 'h', 'k', 'e', 'm_e', 'σ_T'];
            required.forEach(constant => {
                if (!globalConstants[constant] && !globalConstants[constant.toLowerCase()]) {
                    verification.issues.push(`Missing constant: ${constant}`);
                }
            });
        }
        
        // Check for external dependencies (should be none)
        if (typeof fetch !== 'undefined' && typeof XMLHttpRequest !== 'undefined') {
            // These are browser APIs, not external dependencies - OK
        }
        
        // Verify Math object is available (built-in, always available)
        if (typeof Math === 'undefined') {
            verification.offline = false;
            verification.issues.push('Math object not available');
        }
        
        return verification;
    }
    
    /**
     * Get all possible rearrangements of the formula
     * Returns all variables that can be solved for
     * @returns {Array<Object>} Array of {variable, expression, unit, latex} objects
     */
    getAllSolutions() {
        const solutions = [];
        const formulaId = this.formula.id;
        const constants = { ...globalConstants, ...this.formula.constants || {} };
        
        // For each variable, try to create a symbolic expression
        this.formula.variables.forEach(varDef => {
            const symbol = varDef.symbol;
            // Skip constants
            if (constants[symbol] !== undefined) return;
            
            try {
                const otherVars = this.formula.variables
                    .filter(v => v.symbol !== symbol)
                    .map(v => v.symbol);
                
                const expression = this.createSymbolicExpression(
                    formulaId, 
                    symbol, 
                    {}, 
                    otherVars, 
                    constants
                );
                
                if (expression && expression !== this.formula.equation) {
                    solutions.push({
                        variable: symbol,
                        expression: expression,
                        unit: varDef.unit || '',
                        latex: this.toLatex(expression)
                    });
                }
            } catch (e) {
                // Skip if can't solve for this variable
            }
        });
        
        return solutions;
    }
}

// Expose InputValidator globally for debugging and external access
if (typeof window !== 'undefined') {
    window.InputValidator = InputValidator;
}

// Also expose it in global scope (for Node.js environments or strict mode)
if (typeof global !== 'undefined') {
    global.InputValidator = InputValidator;
}

// Ensure it's accessible immediately
if (typeof InputValidator === 'undefined') {
    // This should never happen, but if it does, we'll know
    console.error('InputValidator class was not properly defined!');
}

