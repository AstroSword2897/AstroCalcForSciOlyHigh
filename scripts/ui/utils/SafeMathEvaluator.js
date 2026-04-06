/**
 * Safe Math Expression Evaluator
 * NO eval(), NO Function() constructor - Pure tokenizer/parser approach
 * 
 * This is a secure alternative to eval() that parses and evaluates
 * mathematical expressions using a tokenizer and recursive descent parser.
 */

class ValidationError extends Error {
    constructor(field, message) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

class CalculationError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'CalculationError';
        this.details = details;
    }
}

class SafeMathEvaluator {
    /**
     * Allowed operators
     */
    static OPERATORS = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => {
            if (b === 0) throw new Error('Division by zero');
            return a / b;
        },
        '^': (a, b) => Math.pow(a, b),
        '%': (a, b) => a % b,
        '×': (a, b) => a * b,
        '÷': (a, b) => (b === 0 ? (() => { throw new Error('Division by zero'); })() : a / b),
        '·': (a, b) => a * b
    };
    
    /**
     * Allowed functions
     */
    static FUNCTIONS = {
        'sin': Math.sin,
        'cos': Math.cos,
        'tan': Math.tan,
        'asin': Math.asin,
        'acos': Math.acos,
        'atan': Math.atan,
        'atan2': Math.atan2,
        'sinh': Math.sinh,
        'cosh': Math.cosh,
        'tanh': Math.tanh,
        'sqrt': (x) => {
            if (x < 0) throw new Error('Square root of negative number');
            return Math.sqrt(x);
        },
        'cbrt': Math.cbrt,
        'exp': Math.exp,
        'log': Math.log,
        'log10': Math.log10,
        'log2': Math.log2,
        'abs': Math.abs,
        'floor': Math.floor,
        'ceil': Math.ceil,
        'round': Math.round,
        'min': Math.min,
        'max': Math.max,
        'pow': Math.pow,
        'sign': Math.sign
    };
    
    /**
     * Constants
     */
    static CONSTANTS = {
        'PI': Math.PI,
        'pi': Math.PI,
        'E': Math.E,
        'π': Math.PI
        // Intentionally no bare 'e': clashes with eccentricity e. Use E or exp(...).
    };
    
    /**
     * Token types
     */
    static TOKEN_TYPES = {
        NUMBER: 'NUMBER',
        IDENTIFIER: 'IDENTIFIER',
        OPERATOR: 'OPERATOR',
        LEFT_PAREN: 'LEFT_PAREN',
        RIGHT_PAREN: 'RIGHT_PAREN',
        COMMA: 'COMMA',
        EOF: 'EOF'
    };
    
    /**
     * Tokenize expression
     */
    static tokenize(expression) {
        const tokens = [];
        let i = 0;
        
        while (i < expression.length) {
            const char = expression[i];
            
            // Skip whitespace
            if (/\s/.test(char)) {
                i++;
                continue;
            }
            
            // Number (including scientific notation)
            if (/\d/.test(char) || char === '.') {
                let numStr = '';
                let seenDot = false;

                while (i < expression.length) {
                    const current = expression[i];

                    if (/\d/.test(current)) {
                        numStr += current;
                        i++;
                        continue;
                    }

                    if (current === '.' && !seenDot) {
                        seenDot = true;
                        numStr += current;
                        i++;
                        continue;
                    }

                    if ((current === 'e' || current === 'E') && /[\d.]/.test(numStr)) {
                        numStr += current;
                        i++;
                        if (expression[i] === '+' || expression[i] === '-') {
                            numStr += expression[i];
                            i++;
                        }
                        continue;
                    }

                    break;
                }

                const num = parseFloat(numStr);
                if (isNaN(num)) {
                    throw new Error(`Invalid number: ${numStr}`);
                }
                tokens.push({ type: this.TOKEN_TYPES.NUMBER, value: num });
                continue;
            }
            
            // Operators (including × ÷ ·)
            if (char === '×' || char === '÷' || char === '·') {
                tokens.push({ type: this.TOKEN_TYPES.OPERATOR, value: char });
                i++;
                continue;
            }
            if (this.OPERATORS[char]) {
                tokens.push({ type: this.TOKEN_TYPES.OPERATOR, value: char });
                i++;
                continue;
            }
            
            // Parentheses
            if (char === '(') {
                tokens.push({ type: this.TOKEN_TYPES.LEFT_PAREN, value: char });
                i++;
                continue;
            }
            
            if (char === ')') {
                tokens.push({ type: this.TOKEN_TYPES.RIGHT_PAREN, value: char });
                i++;
                continue;
            }
            
            // Comma
            if (char === ',') {
                tokens.push({ type: this.TOKEN_TYPES.COMMA, value: char });
                i++;
                continue;
            }
            
            // Identifier (variable or function; includes Greek letters)
            if (/[a-zA-Z_π\u0370-\u03FF]/.test(char)) {
                let ident = '';
                while (i < expression.length && /[a-zA-Z0-9_π\u0370-\u03FF]/.test(expression[i])) {
                    ident += expression[i];
                    i++;
                }
                tokens.push({ type: this.TOKEN_TYPES.IDENTIFIER, value: ident });
                continue;
            }
            
            throw new Error(`Unexpected character: ${char}`);
        }
        
        tokens.push({ type: this.TOKEN_TYPES.EOF, value: null });
        return tokens;
    }
    
    /**
     * Parse and evaluate expression
     */
    static evaluate(expression, variables = {}) {
        if (!expression || typeof expression !== 'string') {
            throw new ValidationError('expression', 'Expression must be a non-empty string');
        }
        
        // Validate expression doesn't contain dangerous patterns
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
            /window\./i
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(expression)) {
                throw new ValidationError('expression', 'Expression contains dangerous patterns');
            }
        }
        
        try {
            const tokens = this.tokenize(expression);
            const parser = new SafeExpressionParser(tokens, variables);
            return parser.parse();
        } catch (error) {
            if (error instanceof ValidationError || error instanceof CalculationError) {
                throw error;
            }
            throw new CalculationError(`Expression evaluation failed: ${error.message}`, {
                expression,
                error: error.message
            });
        }
    }
}

/**
 * Recursive Descent Parser
 */
class SafeExpressionParser {
    constructor(tokens, variables) {
        this.tokens = tokens;
        this.variables = variables;
        this.current = 0;
    }
    
    /**
     * Get current token
     */
    peek() {
        return this.tokens[this.current];
    }
    
    /**
     * Consume current token and advance
     */
    advance() {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.tokens[this.current - 1];
    }
    
    /**
     * Check if at end
     */
    isAtEnd() {
        return this.peek().type === SafeMathEvaluator.TOKEN_TYPES.EOF;
    }
    
    /**
     * Check if current token matches type
     */
    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }
    
    /**
     * Parse expression (entry point)
     */
    parse() {
        const result = this.expression();
        if (!this.isAtEnd()) {
            throw new CalculationError('Unexpected token after expression');
        }
        return result;
    }
    
    /**
     * Parse expression (lowest precedence)
     */
    expression() {
        let expr = this.term();
        
        while (this.check(SafeMathEvaluator.TOKEN_TYPES.OPERATOR) && 
               (this.peek().value === '+' || this.peek().value === '-')) {
            const op = this.advance().value;
            const right = this.term();
            expr = SafeMathEvaluator.OPERATORS[op](expr, right);
        }
        
        return expr;
    }
    
    /**
     * Parse term (multiplication, division, and implicit multiplication e.g. 3x or 2(1+a))
     */
    term() {
        let expr = this.factor();
        
        while (true) {
            if (this.check(SafeMathEvaluator.TOKEN_TYPES.OPERATOR) &&
                (this.peek().value === '*' || this.peek().value === '/' || this.peek().value === '%' ||
                 this.peek().value === '×' || this.peek().value === '÷' || this.peek().value === '·')) {
                const op = this.advance().value;
                const right = this.factor();
                expr = SafeMathEvaluator.OPERATORS[op](expr, right);
            } else if (this.check(SafeMathEvaluator.TOKEN_TYPES.NUMBER) ||
                       this.check(SafeMathEvaluator.TOKEN_TYPES.IDENTIFIER) ||
                       this.check(SafeMathEvaluator.TOKEN_TYPES.LEFT_PAREN)) {
                // Implicit multiplication: 3x, 2(1+a), xy
                const right = this.factor();
                expr = SafeMathEvaluator.OPERATORS['*'](expr, right);
            } else {
                break;
            }
        }
        
        return expr;
    }
    
    /**
     * Parse factor (power, unary, primary)
     */
    factor() {
        let expr = this.unary();
        
        if (this.check(SafeMathEvaluator.TOKEN_TYPES.OPERATOR) && this.peek().value === '^') {
            const op = this.advance().value;
            const right = this.factor(); // Right-associative
            expr = SafeMathEvaluator.OPERATORS[op](expr, right);
        }
        
        return expr;
    }
    
    /**
     * Parse unary expression
     */
    unary() {
        if (this.check(SafeMathEvaluator.TOKEN_TYPES.OPERATOR) && this.peek().value === '-') {
            this.advance();
            return -this.unary();
        }
        
        if (this.check(SafeMathEvaluator.TOKEN_TYPES.OPERATOR) && this.peek().value === '+') {
            this.advance();
            return this.unary();
        }
        
        return this.primary();
    }
    
    /**
     * Parse primary expression
     */
    primary() {
        // Number
        if (this.check(SafeMathEvaluator.TOKEN_TYPES.NUMBER)) {
            return this.advance().value;
        }
        
        // Parentheses
        if (this.check(SafeMathEvaluator.TOKEN_TYPES.LEFT_PAREN)) {
            this.advance(); // Consume '('
            const expr = this.expression();
            if (!this.check(SafeMathEvaluator.TOKEN_TYPES.RIGHT_PAREN)) {
                throw new CalculationError('Expected closing parenthesis');
            }
            this.advance(); // Consume ')'
            return expr;
        }
        
        // Identifier (variable, constant, or function)
        if (this.check(SafeMathEvaluator.TOKEN_TYPES.IDENTIFIER)) {
            const ident = this.advance().value;

            // Variables shadow constants (eccentricity e vs Euler E in CONSTANTS)
            if (Object.prototype.hasOwnProperty.call(this.variables, ident)) {
                const v = this.variables[ident];
                if (typeof v === 'number' && Number.isFinite(v)) {
                    return v;
                }
                throw new CalculationError(`Missing or non-numeric value for variable: ${ident}`);
            }

            // Check if it's a constant
            if (SafeMathEvaluator.CONSTANTS[ident]) {
                return SafeMathEvaluator.CONSTANTS[ident];
            }
            
            // Check if it's a function call
            if (this.check(SafeMathEvaluator.TOKEN_TYPES.LEFT_PAREN)) {
                if (!SafeMathEvaluator.FUNCTIONS[ident]) {
                    throw new CalculationError(`Unknown function: ${ident}`);
                }
                
                this.advance(); // Consume '('
                const args = [];
                
                if (!this.check(SafeMathEvaluator.TOKEN_TYPES.RIGHT_PAREN)) {
                    do {
                        args.push(this.expression());
                    } while (this.check(SafeMathEvaluator.TOKEN_TYPES.COMMA) && this.advance());
                }
                
                if (!this.check(SafeMathEvaluator.TOKEN_TYPES.RIGHT_PAREN)) {
                    throw new CalculationError('Expected closing parenthesis');
                }
                this.advance(); // Consume ')'
                
                const fn = SafeMathEvaluator.FUNCTIONS[ident];
                return fn(...args);
            }
            
            throw new CalculationError(`Unknown identifier: ${ident}`);
        }
        
        throw new CalculationError('Unexpected token');
    }
}

// Export
if (typeof window !== 'undefined') {
    window.SafeMathEvaluator = SafeMathEvaluator;
    window.ValidationError = ValidationError;
    window.CalculationError = CalculationError;
}

