/**
 * SafeMathEvaluator - Safe mathematical expression evaluator
 * Replaces unsafe Function() constructor with a secure parser
 * ENHANCED: Better validation and token-based variable replacement
 */

import { CalculationError } from './CalculationError';

type Token = 
    | { type: 'number'; value: number }
    | { type: 'operator'; value: string }
    | { type: 'variable'; name: string }
    | { type: 'function'; name: string }
    | { type: 'comma'; value: ',' };

type ASTNode = 
    | { type: 'number'; value: number }
    | { type: 'variable'; name: string }
    | { type: 'binary'; operator: string; left: ASTNode; right: ASTNode }
    | { type: 'unary'; operator: string; arg: ASTNode }
    | { type: 'function'; name: string; args: ASTNode[] };

export class SafeMathEvaluator {
    private static readonly MAX_EXPRESSION_LENGTH = 10000;
    private static readonly MAX_RECURSION_DEPTH = 100;

    /**
     * Evaluate a mathematical expression safely
     * Security Features:
     * - AST-based evaluation (no eval/Function)
     * - Dangerous pattern detection
     * - Character whitelist validation
     * - Variable injection protection
     * - Recursion depth limits
     * - Result validation
     */
    static evaluate(expression: string, vars: Record<string, number> = {}): number {
        // Comprehensive input validation
        if (!expression || typeof expression !== 'string') {
            throw new CalculationError(
                'Expression must be a non-empty string',
                {
                    step: 'Input validation',
                    inputType: typeof expression,
                    inputValue: String(expression).substring(0, 50)
                }
            );
        }
        
        if (vars !== null && typeof vars !== 'object') {
            throw new CalculationError(
                `Variables must be an object or null, got: ${typeof vars}`,
                {
                    step: 'Input validation',
                    varsType: typeof vars
                }
            );
        }
        
        if (expression.length > this.MAX_EXPRESSION_LENGTH) {
            throw new CalculationError(
                `Expression too long (${expression.length} chars). Maximum allowed: ${this.MAX_EXPRESSION_LENGTH}`,
                {
                    step: 'Input validation',
                    length: expression.length,
                    maxLength: this.MAX_EXPRESSION_LENGTH
                }
            );
        }
        
        let expr = expression.trim();
        
        if (expr.length === 0) {
            throw new CalculationError('Expression cannot be empty after trimming', {
                step: 'Input validation',
                originalLength: expression.length
            });
        }
        
        // Validate variable names in vars object (prevent prototype pollution)
        if (vars && typeof vars === 'object') {
            const dangerousVarNames = ['__proto__', 'constructor', 'prototype', '__defineGetter__', '__defineSetter__'];
            for (const varName of Object.keys(vars)) {
                if (dangerousVarNames.includes(varName)) {
                    throw new CalculationError(
                        `Dangerous variable name detected: ${varName}. This may indicate a security issue.`,
                        {
                            step: 'Input validation',
                            variable: varName
                        }
                    );
                }
                const varValue = vars[varName];
                if (varValue !== null && varValue !== undefined) {
                    if (typeof varValue !== 'number' || !isFinite(varValue)) {
                        throw new CalculationError(
                            `Variable '${varName}' has invalid value: ${varValue}. Must be a finite number.`,
                            {
                                step: 'Input validation',
                                variable: varName,
                                value: varValue,
                                valueType: typeof varValue
                            }
                        );
                    }
                }
            }
        }
        
        // Dangerous pattern detection
        const dangerousPatterns = [
            { pattern: /eval\s*\(/i, reason: 'eval() can execute arbitrary code' },
            { pattern: /function\s*\(/i, reason: 'Function declaration can execute code' },
            { pattern: /new\s+Function/i, reason: 'Function constructor can execute code' },
            { pattern: /constructor/i, reason: 'Constructor access can modify prototypes' },
            { pattern: /prototype/i, reason: 'Prototype access can modify object behavior' },
            { pattern: /__proto__/i, reason: 'Prototype pollution vulnerability' },
            { pattern: /import\s*\(/i, reason: 'Dynamic import can load external code' },
            { pattern: /require\s*\(/i, reason: 'require() can load modules' },
            { pattern: /document\./i, reason: 'DOM access not allowed in math expressions' },
            { pattern: /window\./i, reason: 'Window object access not allowed' },
            { pattern: /global\./i, reason: 'Global object access not allowed' },
            { pattern: /process\./i, reason: 'Process object access not allowed' },
        ];
        
        for (const { pattern, reason } of dangerousPatterns) {
            if (pattern.test(expr)) {
                throw new CalculationError(
                    `Expression contains potentially unsafe code: ${reason}. Pattern: ${pattern.source}`,
                    {
                        step: 'Security validation',
                        inputs: { expression: expr.substring(0, 50) },
                        reason: reason,
                        pattern: pattern.source
                    }
                );
            }
        }
        
        // Normalize common unicode operators to ASCII
        expr = expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/π/g, 'PI');

        // Validate allowed characters
        const allowedMathFunctions = ['sqrt', 'cbrt', 'log', 'log10', 'ln', 'sin', 'cos', 'tan', 
                                     'asin', 'acos', 'atan', 'exp', 'pow', 'abs', 'floor', 'ceil', 
                                     'round', 'min', 'max', 'PI', 'E'];
        const mathFuncPattern = new RegExp(`Math\\.(${allowedMathFunctions.join('|')})\\s*\\(`, 'gi');
        
        let validationExpr = expr.replace(mathFuncPattern, 'Math.');
        validationExpr = validationExpr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, 'VAR');
        validationExpr = validationExpr.replace(/[\d.eE+\-]+/g, 'NUM');
        
        const safeCharPattern = /^[+\-*/^().\s,NUMVARMath\.]*$/;
        if (!safeCharPattern.test(validationExpr)) {
            throw new CalculationError(
                'Expression contains unsafe characters',
                { step: 'Character validation', inputs: { expression: expr.substring(0, 50) } }
            );
        }
        
        // Token-based variable replacement
        if (vars && Object.keys(vars).length > 0) {
            expr = this.replaceVariablesSafely(expr, vars);
        }
        
        try {
            // Support expressions generated as Math.<fn>(...) by downstream code
            expr = expr.replace(/\bMath\./g, '');

            if (expr.length === 0) {
                throw new CalculationError(
                    'Expression became empty after normalization',
                    {
                        step: 'Normalization',
                        originalExpression: expression.substring(0, 50)
                    }
                );
            }

            // Tokenize and parse
            let tokens: Token[];
            try {
                tokens = this.tokenize(expr);
            } catch (error: any) {
                throw new CalculationError(
                    `Tokenization failed: ${error.message}`,
                    {
                        step: 'Tokenization',
                        inputs: { expression: expr.substring(0, 50) },
                        originalError: error.message
                    }
                );
            }
            
            if (!Array.isArray(tokens) || tokens.length === 0) {
                throw new CalculationError(
                    'Tokenization produced invalid or empty token array',
                    {
                        step: 'Tokenization validation',
                        tokensType: typeof tokens,
                        tokensLength: Array.isArray(tokens) ? tokens.length : 'N/A'
                    }
                );
            }

            let ast: ASTNode;
            try {
                ast = this.parse(tokens);
            } catch (error: any) {
                throw new CalculationError(
                    `Parsing failed: ${error.message}`,
                    {
                        step: 'Parsing',
                        inputs: { expression: expr.substring(0, 50), tokenCount: tokens.length },
                        originalError: error.message
                    }
                );
            }
            
            if (!ast || typeof ast !== 'object' || !ast.type) {
                throw new CalculationError(
                    'Parsing produced invalid AST',
                    {
                        step: 'AST validation',
                        astType: typeof ast,
                        astValue: String(ast).substring(0, 50)
                    }
                );
            }

            // Evaluate AST safely
            let result: number;
            try {
                result = this.evaluateAST(ast, vars);
            } catch (error: any) {
                if (error instanceof CalculationError) {
                    error.context.expression = expr.substring(0, 50);
                    throw error;
                }
                throw new CalculationError(
                    `AST evaluation failed: ${error.message}`,
                    {
                        step: 'AST evaluation',
                        inputs: { expression: expr.substring(0, 50) },
                        originalError: error.message,
                        errorType: error.constructor.name
                    }
                );
            }
            
            // Comprehensive result validation
            if (result === null || result === undefined) {
                throw new CalculationError(
                    'Expression evaluation returned null or undefined',
                    {
                        step: 'Result validation',
                        inputs: { expression: expr.substring(0, 50) },
                        result: result
                    }
                );
            }
            
            if (typeof result !== 'number') {
                throw new CalculationError(
                    `Expression did not evaluate to a number, got: ${typeof result} (${String(result).substring(0, 50)})`,
                    {
                        step: 'Result validation',
                        inputs: { expression: expr.substring(0, 50) },
                        resultType: typeof result,
                        resultValue: String(result).substring(0, 50)
                    }
                );
            }
            
            if (isNaN(result)) {
                throw new CalculationError(
                    'Expression evaluated to NaN (Not a Number). This may indicate invalid mathematical operations.',
                    {
                        step: 'Result validation',
                        inputs: { expression: expr.substring(0, 50) },
                        result: result
                    }
                );
            }
            
            if (!isFinite(result)) {
                let errorMsg = `Expression did not evaluate to a finite number, got: ${result}.`;
                if (result === Infinity || result === -Infinity) {
                    errorMsg += ' This may indicate division by zero, overflow, or extremely large input values.';
                }
                throw new CalculationError(
                    errorMsg,
                    {
                        step: 'Result validation',
                        inputs: { expression: expr.substring(0, 50) },
                        result: result
                    }
                );
            }
            
            return result;
        } catch (error: unknown) {
            if (error instanceof CalculationError) {
                if (!error.context.expression) {
                    error.context.expression = expression.substring(0, 50);
                }
                throw error;
            }
            
            throw new CalculationError(
                `Expression evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
                {
                    step: 'Evaluation',
                    inputs: { expression: expression.substring(0, 50) },
                    error: error instanceof Error ? error.message : String(error),
                    errorType: error instanceof Error ? error.constructor.name : typeof error,
                    stack: error instanceof Error && error.stack ? error.stack.substring(0, 200) : undefined
                }
            );
        }
    }
    
    /**
     * Safely replace variables in expression using optimized single-pass approach
     */
    private static replaceVariablesSafely(expr: string, vars: Record<string, number>): string {
        const sortedVarNames = Object.keys(vars)
            .filter(k => vars[k] !== null && vars[k] !== undefined && isFinite(vars[k]))
            .sort((a, b) => b.length - a.length);
        
        if (sortedVarNames.length === 0) return expr;
        
        const escaped = sortedVarNames.map(name => this.escapeRegex(name));
        const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'g');
        
        return expr.replace(pattern, (match) => {
            const value = vars[match];
            return (value !== null && value !== undefined && isFinite(value)) 
                ? value.toString() 
                : match;
        });
    }
    
    /**
     * Escape special regex characters in a string
     */
    private static escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Tokenize expression into safe tokens
     */
    private static tokenize(expr: string): Token[] {
        const tokens: Token[] = [];
        let i = 0;
        
        while (i < expr.length) {
            // Skip whitespace
            if (/\s/.test(expr[i])) {
                i++;
                continue;
            }
            
            // Numbers
            if (/\d/.test(expr[i]) || (expr[i] === '.' && /\d/.test(expr[i + 1]))) {
                const start = i;
                while (i < expr.length && /\d/.test(expr[i])) i++;
                if (i < expr.length && expr[i] === '.') {
                    i++;
                    while (i < expr.length && /\d/.test(expr[i])) i++;
                }
                if (i < expr.length && (expr[i] === 'e' || expr[i] === 'E')) {
                    i++;
                    if (i < expr.length && (expr[i] === '+' || expr[i] === '-')) i++;
                    const expStart = i;
                    while (i < expr.length && /\d/.test(expr[i])) i++;
                    if (expStart === i) {
                        throw new CalculationError('Invalid scientific notation exponent', { step: 'Tokenization' });
                    }
                }

                const numStr = expr.slice(start, i);
                const parsed = Number(numStr);
                if (!isFinite(parsed)) {
                    throw new CalculationError(`Invalid number: ${numStr}`, { step: 'Tokenization' });
                }
                tokens.push({ type: 'number', value: parsed });
                continue;
            }
            
            // Operators
            if ('+-*/^()'.includes(expr[i])) {
                tokens.push({ type: 'operator', value: expr[i] });
                i++;
                continue;
            }

            // Comma
            if (expr[i] === ',') {
                tokens.push({ type: 'comma', value: ',' });
                i++;
                continue;
            }
            
            // Variables and functions
            if (/[a-zA-Z_]/.test(expr[i])) {
                let name = '';
                while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
                    name += expr[i++];
                }
                
                if (i < expr.length && expr[i] === '(') {
                    tokens.push({ type: 'function', name: name.toLowerCase() });
                } else {
                    if (name === 'PI' || name === 'pi') {
                        tokens.push({ type: 'number', value: Math.PI });
                    } else if (name === 'E' || name === 'e') {
                        tokens.push({ type: 'number', value: Math.E });
                    } else {
                        tokens.push({ type: 'variable', name });
                    }
                }
                continue;
            }
            
            throw new CalculationError(`Unexpected character: ${expr[i]}`, { step: 'Tokenization' });
        }
        
        return tokens;
    }
    
    /**
     * Parse tokens into Abstract Syntax Tree (AST)
     */
    private static parse(tokens: Token[]): ASTNode {
        if (!Array.isArray(tokens) || tokens.length === 0) {
            throw new CalculationError('Invalid tokens: must be a non-empty array', { step: 'Parsing' });
        }
        
        let pos = 0;
        
        const peek = (): Token | undefined => tokens[pos];
        const consume = (): Token => {
            if (pos >= tokens.length) {
                throw new CalculationError('Unexpected end of tokens', { step: 'Parsing', position: pos });
            }
            return tokens[pos++];
        };
        const eof = (): boolean => pos >= tokens.length;
        
        const parseExpression = (): ASTNode => {
            let left = parseTerm();
            
            while (!eof()) {
                const next = peek();
                if (next?.type === 'operator' && (next.value === '+' || next.value === '-')) {
                    const op = consume();
                    if (op.type === 'operator') {
                        const right = parseTerm();
                        left = { type: 'binary', operator: op.value, left, right };
                    } else {
                        throw new CalculationError('Expected operator', { step: 'Parsing' });
                    }
                } else {
                    break;
                }
            }
            
            return left;
        };
        
        const parseTerm = (): ASTNode => {
            let left = parsePower();
            
            while (!eof()) {
                const next = peek();
                if (next?.type === 'operator' && (next.value === '*' || next.value === '/')) {
                    const op = consume();
                    if (op.type === 'operator') {
                        const right = parsePower();
                        left = { type: 'binary', operator: op.value, left, right };
                    } else {
                        throw new CalculationError('Expected operator', { step: 'Parsing' });
                    }
                } else {
                    break;
                }
            }
            
            return left;
        };

        const parsePower = (): ASTNode => {
            let left = parseFactor();
            if (!eof()) {
                const next = peek();
                if (next?.type === 'operator' && next.value === '^') {
                    consume();
                    const right = parsePower();
                    left = { type: 'binary', operator: '^', left, right };
                }
            }
            return left;
        };
        
        const parseFactor = (): ASTNode => {
            if (eof()) {
                throw new CalculationError(
                    'Unexpected end of expression. Expected number, variable, function, or opening parenthesis.',
                    { step: 'Parsing', position: pos, tokensRemaining: tokens.length - pos }
                );
            }
            
            const token = peek();
            
            if (!token || typeof token !== 'object' || !token.type) {
                throw new CalculationError(
                    `Invalid token at position ${pos}: ${JSON.stringify(token)}`,
                    { step: 'Parsing', position: pos, token: token }
                );
            }
            
            // Numbers
            if (token.type === 'number') {
                consume();
                return { type: 'number', value: token.value };
            }
            
            // Variables
            if (token.type === 'variable') {
                consume();
                return { type: 'variable', name: token.name };
            }
            
            // Functions
            if (token.type === 'function') {
                const funcToken = consume();
                if (funcToken.type !== 'function') {
                    throw new CalculationError('Expected function token', { step: 'Parsing' });
                }
                const funcName = funcToken.name;
                const next = peek();
                if (eof() || (next?.type !== 'operator' || next.value !== '(')) {
                    throw new CalculationError('Expected ( after function name', { step: 'Parsing' });
                }
                consume();
                const args: ASTNode[] = [];
                const afterParen = peek();
                if (!eof() && !(afterParen?.type === 'operator' && afterParen.value === ')')) {
                    args.push(parseExpression());
                    while (!eof()) {
                        const commaCheck = peek();
                        if (commaCheck?.type === 'comma') {
                            consume();
                            args.push(parseExpression());
                        } else {
                            break;
                        }
                    }
                }
                const closingParen = peek();
                if (eof() || (closingParen?.type !== 'operator' || closingParen.value !== ')')) {
                    throw new CalculationError('Expected ) after function argument', { step: 'Parsing' });
                }
                consume();
                return { type: 'function', name: funcName, args };
            }
            
            // Parentheses
            if (token.type === 'operator' && token.value === '(') {
                consume();
                const expr = parseExpression();
                const closingParen = peek();
                if (eof() || (closingParen?.type !== 'operator' || closingParen.value !== ')')) {
                    throw new CalculationError('Expected )', { step: 'Parsing' });
                }
                consume();
                return expr;
            }
            
            // Unary minus
            if (token.type === 'operator' && token.value === '-') {
                consume();
                const arg = parseFactor();
                return { type: 'unary', operator: '-', arg };
            }
            
            // Unary plus (no-op)
            if (token.type === 'operator' && token.value === '+') {
                consume();
                return parseFactor();
            }
            
            throw new CalculationError(`Unexpected token: ${JSON.stringify(token)}`, { step: 'Parsing' });
        };
        
        return parseExpression();
    }
    
    /**
     * Evaluate AST node safely
     */
    private static evaluateAST(node: ASTNode, vars: Record<string, number>, depth: number = 0, maxDepth: number = this.MAX_RECURSION_DEPTH): number {
        if (depth > maxDepth) {
            throw new CalculationError(
                `Maximum recursion depth (${maxDepth}) exceeded. Expression may be too complex or contain circular references.`,
                {
                    step: 'AST evaluation',
                    depth: depth,
                    maxDepth: maxDepth,
                    nodeType: node?.type
                }
            );
        }
        
        if (!node || typeof node !== 'object') {
            throw new CalculationError(
                `Invalid AST node: expected object, got ${typeof node}`,
                {
                    step: 'AST evaluation',
                    nodeType: typeof node,
                    depth: depth
                }
            );
        }
        
        if (!node.type) {
            throw new CalculationError(
                'AST node missing type property',
                {
                    step: 'AST evaluation',
                    node: JSON.stringify(node).substring(0, 100),
                    depth: depth
                }
            );
        }

        try {
            switch (node.type) {
                case 'number':
                    if (typeof node.value !== 'number' || !isFinite(node.value)) {
                        throw new CalculationError(
                            `Number node has invalid value: ${node.value}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'number',
                                value: node.value,
                                depth: depth
                            }
                        );
                    }
                    return node.value;
                    
                case 'variable':
                    if (!node.name || typeof node.name !== 'string') {
                        throw new CalculationError(
                            `Variable node has invalid name: ${typeof node.name}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'variable',
                                nameType: typeof node.name,
                                depth: depth
                            }
                        );
                    }
                    
                    if (vars === null || vars === undefined || typeof vars !== 'object') {
                        throw new CalculationError(
                            `Variables object is invalid: ${typeof vars}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'variable',
                                variable: node.name,
                                varsType: typeof vars,
                                depth: depth
                            }
                        );
                    }
                    
                    if (vars[node.name] === undefined) {
                        throw new CalculationError(
                            `Undefined variable: ${node.name}. Available variables: ${Object.keys(vars).join(', ') || 'none'}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'variable',
                                variable: node.name,
                                availableVariables: Object.keys(vars),
                                depth: depth
                            }
                        );
                    }
                    
                    const value = vars[node.name];
                    if (typeof value !== 'number' || !isFinite(value)) {
                        throw new CalculationError(
                            `Variable '${node.name}' has invalid type: expected number, got ${typeof value}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'variable',
                                variable: node.name,
                                valueType: typeof value,
                                value: value,
                                depth: depth
                            }
                        );
                    }
                    return value;
                    
                case 'binary':
                    if (!node.left || !node.right || !node.operator) {
                        throw new CalculationError(
                            `Binary node missing operands or operator`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'binary',
                                operator: node.operator,
                                depth: depth
                            }
                        );
                    }
                    
                    const left = this.evaluateAST(node.left, vars, depth + 1, maxDepth);
                    const right = this.evaluateAST(node.right, vars, depth + 1, maxDepth);
                    
                    if (typeof left !== 'number' || !isFinite(left) || typeof right !== 'number' || !isFinite(right)) {
                        throw new CalculationError(
                            `Binary operands are not finite numbers`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'binary',
                                operator: node.operator,
                                leftType: typeof left,
                                rightType: typeof right,
                                depth: depth
                            }
                        );
                    }
                    
                    switch (node.operator) {
                        case '+':
                            const sum = left + right;
                            if (!isFinite(sum)) {
                                throw new CalculationError(
                                    `Addition overflow: ${left} + ${right} = ${sum}`,
                                    { step: 'AST evaluation', operator: '+', left, right, depth }
                                );
                            }
                            return sum;
                            
                        case '-':
                            const diff = left - right;
                            if (!isFinite(diff)) {
                                throw new CalculationError(
                                    `Subtraction overflow: ${left} - ${right} = ${diff}`,
                                    { step: 'AST evaluation', operator: '-', left, right, depth }
                                );
                            }
                            return diff;
                            
                        case '*':
                            const product = left * right;
                            if (!isFinite(product)) {
                                throw new CalculationError(
                                    `Multiplication overflow: ${left} * ${right} = ${product}`,
                                    { step: 'AST evaluation', operator: '*', left, right, depth }
                                );
                            }
                            return product;
                            
                        case '/':
                            if (right === 0) {
                                throw new CalculationError(
                                    `Division by zero: ${left} / ${right}`,
                                    {
                                        step: 'AST evaluation',
                                        operator: '/',
                                        left: left,
                                        right: right,
                                        depth: depth
                                    }
                                );
                            }
                            const quotient = left / right;
                            if (!isFinite(quotient)) {
                                throw new CalculationError(
                                    `Division result is not finite: ${left} / ${right} = ${quotient}`,
                                    {
                                        step: 'AST evaluation',
                                        operator: '/',
                                        left: left,
                                        right: right,
                                        result: quotient,
                                        depth: depth
                                    }
                                );
                            }
                            return quotient;
                            
                        case '^':
                            if (Math.abs(right) > 1000) {
                                throw new CalculationError(
                                    `Exponent too large: ${left}^${right}. This may cause overflow.`,
                                    {
                                        step: 'AST evaluation',
                                        operator: '^',
                                        base: left,
                                        exponent: right,
                                        depth: depth
                                    }
                                );
                            }
                            
                            if (left < 0 && right !== Math.floor(right)) {
                                throw new CalculationError(
                                    `Invalid operation: negative base (${left}) with fractional exponent (${right})`,
                                    {
                                        step: 'AST evaluation',
                                        operator: '^',
                                        base: left,
                                        exponent: right,
                                        depth: depth
                                    }
                                );
                            }
                            
                            const powerResult = Math.pow(left, right);
                            if (!isFinite(powerResult)) {
                                throw new CalculationError(
                                    `Power operation result is not finite: ${left}^${right} = ${powerResult}`,
                                    {
                                        step: 'AST evaluation',
                                        operator: '^',
                                        base: left,
                                        exponent: right,
                                        result: powerResult,
                                        depth: depth
                                    }
                                );
                            }
                            return powerResult;
                            
                        default:
                            throw new CalculationError(
                                `Unknown binary operator: ${node.operator}. Supported operators: +, -, *, /, ^`,
                                {
                                    step: 'AST evaluation',
                                    nodeType: 'binary',
                                    operator: node.operator,
                                    depth: depth
                                }
                            );
                    }
                    
                case 'unary':
                    if (!node.arg || !node.operator) {
                        throw new CalculationError(
                            `Unary node missing argument or operator`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'unary',
                                operator: node.operator,
                                depth: depth
                            }
                        );
                    }
                    
                    const arg = this.evaluateAST(node.arg, vars, depth + 1, maxDepth);
                    
                    if (typeof arg !== 'number' || !isFinite(arg)) {
                        throw new CalculationError(
                            `Unary argument is not a finite number: ${arg}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'unary',
                                operator: node.operator,
                                argType: typeof arg,
                                argValue: arg,
                                depth: depth
                            }
                        );
                    }
                    
                    if (node.operator === '-') {
                        return -arg;
                    } else if (node.operator === '+') {
                        return arg;
                    } else {
                        throw new CalculationError(
                            `Unknown unary operator: ${node.operator}. Supported operators: +, -`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'unary',
                                operator: node.operator,
                                depth: depth
                            }
                        );
                    }
                    
                case 'function':
                    if (!node.name || !Array.isArray(node.args)) {
                        throw new CalculationError(
                            `Function node has invalid structure`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                depth: depth
                            }
                        );
                    }
                    
                    const argValues: number[] = [];
                    for (let i = 0; i < node.args.length; i++) {
                        try {
                            const argValue = this.evaluateAST(node.args[i], vars, depth + 1, maxDepth);
                            if (typeof argValue !== 'number' || !isFinite(argValue)) {
                                throw new CalculationError(
                                    `Function argument ${i + 1} is not a finite number: ${argValue}`,
                                    {
                                        step: 'AST evaluation',
                                        nodeType: 'function',
                                        functionName: node.name,
                                        argumentIndex: i,
                                        argumentValue: argValue,
                                        depth: depth
                                    }
                                );
                            }
                            argValues.push(argValue);
                        } catch (error: any) {
                            if (error instanceof CalculationError) {
                                error.context.operation = `Argument ${i + 1} of function ${node.name}()`;
                                throw error;
                            }
                            throw new CalculationError(
                                `Failed to evaluate function argument ${i + 1}: ${error.message}`,
                                {
                                    step: 'AST evaluation',
                                    nodeType: 'function',
                                    functionName: node.name,
                                    argumentIndex: i,
                                    originalError: error.message,
                                    depth: depth
                                }
                            );
                        }
                    }
                    
                    const allowedFunctions: Record<string, (...args: number[]) => number> = {
                        sqrt: Math.sqrt,
                        cbrt: Math.cbrt,
                        log: Math.log,
                        log10: Math.log10,
                        ln: Math.log,
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
                        max: Math.max
                    };
                    
                    const func = allowedFunctions[node.name.toLowerCase()];
                    if (!func) {
                        throw new CalculationError(
                            `Unknown function: ${node.name}. Allowed functions: ${Object.keys(allowedFunctions).join(', ')}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                allowedFunctions: Object.keys(allowedFunctions),
                                depth: depth
                            }
                        );
                    }
                    
                    // Validate arity
                    if (node.name.toLowerCase() === 'pow' && argValues.length !== 2) {
                        throw new CalculationError(
                            `pow(x, y) requires exactly 2 arguments, got ${argValues.length}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                expectedArity: 2,
                                actualArity: argValues.length,
                                depth: depth
                            }
                        );
                    }
                    
                    if ((node.name.toLowerCase() === 'min' || node.name.toLowerCase() === 'max') && argValues.length < 1) {
                        throw new CalculationError(
                            `${node.name}(...) requires at least 1 argument, got ${argValues.length}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                minimumArity: 1,
                                actualArity: argValues.length,
                                depth: depth
                            }
                        );
                    }
                    
                    if (node.name.toLowerCase() !== 'pow' && node.name.toLowerCase() !== 'min' && node.name.toLowerCase() !== 'max' && argValues.length !== 1) {
                        throw new CalculationError(
                            `${node.name}(x) requires exactly 1 argument, got ${argValues.length}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                expectedArity: 1,
                                actualArity: argValues.length,
                                depth: depth
                            }
                        );
                    }
                    
                    // Function-specific validation
                    if (node.name.toLowerCase() === 'sqrt' && argValues[0] < 0) {
                        throw new CalculationError(
                            `sqrt() of negative number: sqrt(${argValues[0]})`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                argument: argValues[0],
                                depth: depth
                            }
                        );
                    }
                    
                    if ((node.name.toLowerCase() === 'log' || node.name.toLowerCase() === 'ln' || node.name.toLowerCase() === 'log10') && argValues[0] <= 0) {
                        throw new CalculationError(
                            `${node.name}() of non-positive number: ${node.name}(${argValues[0]})`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                argument: argValues[0],
                                depth: depth
                            }
                        );
                    }
                    
                    if ((node.name.toLowerCase() === 'asin' || node.name.toLowerCase() === 'acos') && (argValues[0] < -1 || argValues[0] > 1)) {
                        throw new CalculationError(
                            `${node.name}() argument out of range [-1, 1]: ${node.name}(${argValues[0]})`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                argument: argValues[0],
                                depth: depth
                            }
                        );
                    }

                    // Execute function
                    let funcResult: number;
                    try {
                        funcResult = func(...argValues);
                    } catch (error: any) {
                        throw new CalculationError(
                            `Function ${node.name}() execution failed: ${error.message}`,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                arguments: argValues,
                                originalError: error.message,
                                depth: depth
                            }
                        );
                    }
                    
                    // Validate function result
                    if (typeof funcResult !== 'number' || !isFinite(funcResult)) {
                        let errorMsg = `Function ${node.name}() returned non-finite result: ${funcResult}`;
                        if (isNaN(funcResult)) {
                            errorMsg += ' (NaN)';
                        } else if (funcResult === Infinity || funcResult === -Infinity) {
                            errorMsg += ' (Infinity)';
                        }
                        throw new CalculationError(
                            errorMsg,
                            {
                                step: 'AST evaluation',
                                nodeType: 'function',
                                functionName: node.name,
                                arguments: argValues,
                                result: funcResult,
                                depth: depth
                            }
                        );
                    }
                    
                    return funcResult;
                
                default:
                    throw new CalculationError(
                        `Unknown node type: ${(node as any).type}. Supported types: number, variable, binary, unary, function`,
                        {
                            step: 'AST evaluation',
                            nodeType: (node as any).type,
                            node: JSON.stringify(node).substring(0, 100),
                            depth: depth
                        }
                    );
            }
        } catch (error: unknown) {
            if (error instanceof CalculationError) {
                if (error.context.depth === undefined) {
                    error.context.depth = depth;
                }
                throw error;
            }
            
            throw new CalculationError(
                `AST evaluation error: ${error instanceof Error ? error.message : String(error)}`,
                {
                    step: 'AST evaluation',
                    nodeType: node?.type,
                    depth: depth,
                    originalError: error instanceof Error ? error.message : String(error),
                    errorType: error instanceof Error ? error.constructor.name : typeof error,
                    stack: error instanceof Error && error.stack ? error.stack.substring(0, 200) : undefined
                }
            );
        }
    }
}

