/**
 * Dimensional Analysis Engine v3.0 (TypeScript)
 */

export type DimensionVector = [number, number, number, number]; // [L, M, T, Θ]

export interface PrefixDecomposition {
    baseUnit: string;
    scale: number;
    prefix: string | null;
}

export interface AffineUnit {
    base: string;
    offset: number;
}

export type TokenType = 'unit' | 'operator' | 'number';

export interface Token {
    type: TokenType;
    value: string;
}

/* ===================== AST TYPES ===================== */

export interface BaseASTNode {
    type: string;
    dimensions: DimensionVector;
}

export interface UnitNode extends BaseASTNode {
    type: 'unit';
    unit: string;
    baseUnit: string;
    scale: number;
    isAffine: boolean;
}

export interface BinaryNode extends BaseASTNode {
    type: 'multiplication' | 'division';
    left: ASTNode;
    right: ASTNode;
}

export interface PowerNode extends BaseASTNode {
    type: 'power';
    base: ASTNode;
    exponent: number;
}

export interface DimensionlessNode extends BaseASTNode {
    type: 'dimensionless';
}

export type ASTNode =
    | UnitNode
    | BinaryNode
    | PowerNode
    | DimensionlessNode;

/* ===================== MAIN CLASS ===================== */

export class DimensionalAnalysis {
    /* ---------- Prefixes ---------- */
    static readonly PREFIXES: Record<string, number> = {
        Y: 1e24, yotta: 1e24,
        Z: 1e21, zetta: 1e21,
        E: 1e18, exa: 1e18,
        P: 1e15, peta: 1e15,
        T: 1e12, tera: 1e12,
        G: 1e9, giga: 1e9,
        M: 1e6, mega: 1e6,
        k: 1e3, kilo: 1e3,
        h: 1e2, hecto: 1e2,
        da: 1e1, deca: 1e1,
        d: 1e-1, deci: 1e-1,
        c: 1e-2, centi: 1e-2,
        m: 1e-3, milli: 1e-3,
        μ: 1e-6, micro: 1e-6, u: 1e-6,
        n: 1e-9, nano: 1e-9,
        p: 1e-12, pico: 1e-12,
        f: 1e-15, femto: 1e-15,
        a: 1e-18, atto: 1e-18,
        z: 1e-21, zepto: 1e-21,
        y: 1e-24, yocto: 1e-24
    };

    /* ---------- Aliases ---------- */
    static readonly UNIT_ALIASES: Record<string, string> = {
        meter: 'm', meters: 'm', metre: 'm', metres: 'm',
        kilometer: 'km', kilometers: 'km', kilometre: 'km', kilometres: 'km',
        centimeter: 'cm', centimeters: 'cm',
        millimeter: 'mm', millimeters: 'mm',

        kilogram: 'kg', kilograms: 'kg',
        gram: 'g', grams: 'g',

        second: 's', seconds: 's', sec: 's',
        minute: 'min', minutes: 'min',
        hour: 'hr', hours: 'hr',

        kelvin: 'K',
        celsius: '°C',
        fahrenheit: '°F',

        radian: 'rad', radians: 'rad',
        degree: '°', degrees: '°'
    };

    /* ---------- Base Dimensions ---------- */
    static readonly BASE_DIMENSIONS: Record<string, DimensionVector> = {
        m: [1, 0, 0, 0],
        kg: [0, 1, 0, 0],
        s: [0, 0, 1, 0],
        K: [0, 0, 0, 1],
        rad: [0, 0, 0, 0],
        '°': [0, 0, 0, 0]
    };

    /* ---------- Affine Units ---------- */
    static readonly AFFINE_UNITS: Record<string, AffineUnit> = {
        '°C': { base: 'K', offset: 273.15 },
        '°F': { base: 'K', offset: 255.3722222222222 }
    };

    /* ===================== CORE ===================== */

    static decomposePrefix(unit: string): PrefixDecomposition {
        if (!unit) return { baseUnit: unit, scale: 1, prefix: null };

        const prefixes = Object.keys(this.PREFIXES).sort(
            (a, b) => b.length - a.length
        );

        for (const p of prefixes) {
            if (unit.toLowerCase().startsWith(p.toLowerCase())) {
                const rest = unit.slice(p.length);
                if (this.BASE_DIMENSIONS[rest]) {
                    return {
                        baseUnit: rest,
                        scale: this.PREFIXES[p],
                        prefix: p
                    };
                }
            }
        }

        return { baseUnit: unit, scale: 1, prefix: null };
    }

    static normalizeUnit(unit: string): string {
        if (!unit) return '';
        const trimmed = unit.trim();
        const lower = trimmed.toLowerCase();
        return this.UNIT_ALIASES[lower] ?? trimmed;
    }

    static tokenize(expr: string): Token[] {
        const tokens: Token[] = [];
        let current = '';
        expr = expr.replace(/\s+/g, '');

        for (let i = 0; i < expr.length; i++) {
            const ch = expr[i];

            if ('/*·^()'.includes(ch)) {
                if (current) {
                    tokens.push({ type: 'unit', value: current });
                    current = '';
                }
                tokens.push({ type: 'operator', value: ch });
                continue;
            }

            if (/[0-9.+\-]/.test(ch)) {
                const prev = tokens[tokens.length - 1];
                if (prev?.value === '^') {
                    let num = ch;
                    while (i + 1 < expr.length && /[0-9./+\-]/.test(expr[i + 1])) {
                        num += expr[++i];
                    }
                    tokens.push({ type: 'number', value: num });
                } else {
                    current += ch;
                }
                continue;
            }

            current += ch;
        }

        if (current) tokens.push({ type: 'unit', value: current });
        return tokens;
    }

    static parseExpression(unit: string): ASTNode {
        if (!unit) {
            return { type: 'dimensionless', dimensions: [0, 0, 0, 0] };
        }

        const tokens = this.tokenize(this.normalizeUnit(unit));
        return this.parseTokens(tokens);
    }

    static parseTokens(tokens: Token[]): ASTNode {
        let left = this.parseTerm(tokens);

        while (tokens[0]?.type === 'operator' && '/*·'.includes(tokens[0].value)) {
            const op = tokens.shift()!;
            const right = this.parseTerm(tokens);

            left = {
                type: op.value === '/' ? 'division' : 'multiplication',
                left,
                right,
                dimensions:
                    op.value === '/'
                        ? this.subtractDimensions(left.dimensions, right.dimensions)
                        : this.addDimensions(left.dimensions, right.dimensions)
            };
        }

        return left;
    }

    static parseTerm(tokens: Token[]): ASTNode {
        let node = this.parseFactor(tokens);

        if (tokens[0]?.value === '^') {
            tokens.shift();
            const exponent = this.parseNumber(tokens.shift()!.value);
            node = {
                type: 'power',
                base: node,
                exponent,
                dimensions: this.scaleDimensions(node.dimensions, exponent)
            };
        }

        return node;
    }

    static parseFactor(tokens: Token[]): ASTNode {
        const token = tokens.shift();
        if (!token) throw new Error('Unexpected end');

        if (token.value === '(') {
            const expr = this.parseTokens(tokens);
            if (tokens.shift()?.value !== ')') {
                throw new Error('Expected )');
            }
            return expr;
        }

        const normalized = this.normalizeUnit(token.value);
        const { baseUnit, scale } = this.decomposePrefix(normalized);
        const dims = this.BASE_DIMENSIONS[baseUnit] ?? [0, 0, 0, 0];

        return {
            type: 'unit',
            unit: normalized,
            baseUnit,
            scale,
            dimensions: [...dims],
            isAffine: normalized in this.AFFINE_UNITS
        };
    }

    static parseNumber(s: string): number {
        if (s.includes('/')) {
            const [a, b] = s.split('/').map(Number);
            if (!b) throw new Error(`Invalid fraction ${s}`);
            return a / b;
        }
        const n = Number(s);
        if (isNaN(n)) throw new Error(`Invalid number ${s}`);
        return n;
    }

    /* ---------- Dimension Algebra ---------- */

    static addDimensions(a: DimensionVector, b: DimensionVector): DimensionVector {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
    }

    static subtractDimensions(a: DimensionVector, b: DimensionVector): DimensionVector {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
    }

    static scaleDimensions(d: DimensionVector, f: number): DimensionVector {
        return [d[0] * f, d[1] * f, d[2] * f, d[3] * f];
    }

    /* ---------- Public API ---------- */

    static getDimensions(unit: string) {
        const ast = this.parseExpression(unit);
        return {
            dimensions: ast.dimensions,
            unit,
            scale: (ast as UnitNode).scale ?? 1,
            isAffine: (ast as UnitNode).isAffine ?? false
        };
    }

    static areCompatible(a: string, b: string): boolean {
        const da = this.getDimensions(a).dimensions;
        const db = this.getDimensions(b).dimensions;
        return da.every((v, i) => Math.abs(v - db[i]) < 1e-6);
    }
}

// Expose globally for browser compatibility
if (typeof window !== 'undefined') {
    (window as any).DimensionalAnalysis = DimensionalAnalysis;
}
if (typeof globalThis !== 'undefined') {
    (globalThis as any).DimensionalAnalysis = DimensionalAnalysis;
}
