/**
 * Algebraic Solver - step-by-step solving with normalization,
 * linear symbolic isolation, and numeric fallback.
 */
(function (global) {
    'use strict';

    const SafeMathEvaluator = global.SafeMathEvaluator;
    const TOKEN_TYPES = SafeMathEvaluator?.TOKEN_TYPES || { IDENTIFIER: 'IDENTIFIER' };
    const CONSTANTS = new Set(['pi', 'e', 'π', 'PI', 'E', 'deg']);
    const RESERVED_IDENTIFIERS = new Set([
        ...CONSTANTS,
        ...Object.keys(SafeMathEvaluator?.FUNCTIONS || {})
    ]);
    const SUPER_MAP = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
    };
    const EPS = 1e-8;

    function formatNum(n) {
        if (typeof n !== 'number' || !Number.isFinite(n)) return String(n);
        if (Math.abs(n) >= 1e8 || (Math.abs(n) < 1e-5 && n !== 0)) return n.toExponential(5).replace(/\.?0+e/, 'e');
        if (Number.isInteger(n)) return String(n);
        // Up to 8 significant figures, strip trailing zeros
        return n.toPrecision(8).replace(/\.?0+$/, '');
    }

    function approxEqual(a, b, eps = EPS) {
        return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= eps;
    }

    function convertSuperscripts(input) {
        let out = '';
        let inRun = false;

        for (const ch of String(input)) {
            if (SUPER_MAP[ch] !== undefined) {
                if (!inRun) out += '^';
                out += SUPER_MAP[ch];
                inRun = true;
            } else {
                inRun = false;
                out += ch;
            }
        }

        return out;
    }

    function normalizeExpression(expr) {
        if (!expr || typeof expr !== 'string') return '';

        let out = convertSuperscripts(expr)
            .replace(/[≈]/g, '=')
            .replace(/[\u2013\u2014\u2212]/g, '-')
            .replace(/×|·/g, '*')
            .replace(/÷/g, '/')
            .replace(/√\s*\(/g, 'sqrt(')
            .replace(/√\s*([a-zA-Z_π\u0370-\u03FF0-9]+)/g, 'sqrt($1)')
            // Implicit multiplication: "3w" -> "3*w", "36w" -> "36*w", "5y" -> "5*y"
            // but do NOT break scientific notation like "1e-3" or "2E10".
            .replace(/(\d+(?:\.\d+)?)(\s*)([A-Za-z_π\u0370-\u03FF])(?![A-Za-z0-9_π\u0370-\u03FF])/, (m, num, ws, ident) => {
                if ((ident === 'e' || ident === 'E')) return `${num}${ws}${ident}`;
                return `${num}${ws}*${ident}`;
            });

        // Handle "number + identifier" when identifier is followed by more identifier characters
        // e.g. "2pi" / "2λ" / "3w" (above replacement may not catch these).
        out = out.replace(/(\d+(?:\.\d+)?)(\s*)([A-Za-z_π\u0370-\u03FF])([A-Za-z0-9_π\u0370-\u03FF]*)/g, (m, num, ws, first, rest, offset, str) => {
            // Avoid scientific notation exponent marker: 1e10, 1e-3, 2E+7
            if (first === 'e' || first === 'E') {
                // Inspect the char *after* the identifier to distinguish:
                // - scientific notation: 1e-3 or 2E+7
                // - Euler constant: 2e (usually not used with +/-, but if user writes it, treat as sci notation)
                const idxAfterIdent = offset + m.length;
                const c1 = str[idxAfterIdent];
                const c2 = str[idxAfterIdent + 1];
                const isSci = (c1 && /\d/.test(c1)) || ((c1 === '+' || c1 === '-') && c2 && /\d/.test(c2));
                if (isSci) return `${num}${ws}${first}${rest}`;

                // Otherwise, treat `e` as Euler's constant and insert multiplication.
                return `${num}${ws}*${first}${rest}`;
            }
            return `${num}${ws}*${first}${rest}`;
        });

        // ")x" -> ")*x"
        out = out.replace(/\)\s*([A-Za-z_π\u0370-\u03FF])/g, ')*$1');

        out = out
            .replace(/\s+/g, ' ')
            .trim();

        return out;
    }

    function normalizeEquation(equation) {
        return normalizeExpression(String(equation || ''));
    }

    function splitEquation(equation) {
        const normalized = normalizeEquation(equation);
        const eqIdx = normalized.indexOf('=');

        if (!normalized || eqIdx < 0) {
            return { error: 'Enter an equation with "="', equation: normalized };
        }

        const lhs = normalized.substring(0, eqIdx).trim();
        const rhs = normalized.substring(eqIdx + 1).trim();

        if (!lhs || !rhs) {
            return { error: 'Both sides of the equation must be non-empty', equation: normalized };
        }

        return { equation: normalized, lhs, rhs };
    }

    function extractVariables(expr) {
        if (!expr || typeof expr !== 'string' || !SafeMathEvaluator?.tokenize) return [];

        const vars = new Set();
        try {
            const tokens = SafeMathEvaluator.tokenize(normalizeExpression(expr));
            for (const token of tokens) {
                if (token.type === TOKEN_TYPES.IDENTIFIER && !RESERVED_IDENTIFIERS.has(token.value)) {
                    vars.add(token.value);
                }
            }
        } catch (_) {
            return [];
        }

        return Array.from(vars);
    }

    function parseEquation(equation) {
        const parts = splitEquation(equation);
        if (parts.error) {
            return { ...parts, variables: [] };
        }

        const variables = [...new Set([...extractVariables(parts.lhs), ...extractVariables(parts.rhs)])];
        return { ...parts, variables };
    }

    function buildDifferenceExpression(parsed) {
        return `(${parsed.lhs}) - (${parsed.rhs})`;
    }

    function evaluateDifference(parsed, assignments) {
        return SafeMathEvaluator.evaluate(buildDifferenceExpression(parsed), assignments);
    }

    function substituteValues(expression, values) {
        let out = String(expression);

        for (const [symbol, value] of Object.entries(values)) {
            if (!Number.isFinite(value)) continue;
            const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            out = out.replace(new RegExp(`\\b${escaped}\\b`, 'g'), formatNum(value));
        }

        return out;
    }

    function buildLinearExpression(coefficients, constant) {
        const parts = [];

        for (const [symbol, coefficient] of coefficients) {
            if (!Number.isFinite(coefficient) || Math.abs(coefficient) < EPS) continue;

            const abs = Math.abs(coefficient);
            const term = approxEqual(abs, 1) ? symbol : `${formatNum(abs)}*${symbol}`;

            if (parts.length === 0) {
                parts.push(coefficient < 0 ? `-${term}` : term);
            } else {
                parts.push(coefficient < 0 ? `- ${term}` : `+ ${term}`);
            }
        }

        if (Number.isFinite(constant) && Math.abs(constant) >= EPS) {
            const abs = formatNum(Math.abs(constant));
            if (parts.length === 0) {
                parts.push(constant < 0 ? `-${abs}` : abs);
            } else {
                parts.push(constant < 0 ? `- ${abs}` : `+ ${abs}`);
            }
        }

        return parts.length > 0 ? parts.join(' ') : '0';
    }

    function deriveDirectSolvedForm(equation, targetVar) {
        const parsed = typeof equation === 'string' ? parseEquation(equation) : equation;
        if (!parsed || parsed.error) return null;
        if (!parsed.variables.includes(targetVar)) return null;

        const lhsVars = extractVariables(parsed.lhs);
        const rhsVars = extractVariables(parsed.rhs);

        if (parsed.lhs === targetVar && !rhsVars.includes(targetVar)) {
            return {
                targetVar,
                expression: parsed.rhs,
                equation: `${targetVar} = ${parsed.rhs}`,
                direct: true
            };
        }

        if (parsed.rhs === targetVar && !lhsVars.includes(targetVar)) {
            return {
                targetVar,
                expression: parsed.lhs,
                equation: `${targetVar} = ${parsed.lhs}`,
                direct: true
            };
        }

        const lhsPowerMatch = parsed.lhs.match(new RegExp(`^${targetVar.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\^(\\d+)$`));
        if (lhsPowerMatch && !rhsVars.includes(targetVar)) {
            const power = Number(lhsPowerMatch[1]);
            if (power === 2) {
                return {
                    targetVar,
                    expression: `sqrt(${parsed.rhs})`,
                    equation: `${targetVar} = sqrt(${parsed.rhs})`,
                    direct: true,
                    note: 'Using the principal root.'
                };
            }
            if (power > 1) {
                return {
                    targetVar,
                    expression: `(${parsed.rhs})^(1/${power})`,
                    equation: `${targetVar} = (${parsed.rhs})^(1/${power})`,
                    direct: true
                };
            }
        }

        const rhsPowerMatch = parsed.rhs.match(new RegExp(`^${targetVar.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\^(\\d+)$`));
        if (rhsPowerMatch && !lhsVars.includes(targetVar)) {
            const power = Number(rhsPowerMatch[1]);
            if (power === 2) {
                return {
                    targetVar,
                    expression: `sqrt(${parsed.lhs})`,
                    equation: `${targetVar} = sqrt(${parsed.lhs})`,
                    direct: true,
                    note: 'Using the principal root.'
                };
            }
            if (power > 1) {
                return {
                    targetVar,
                    expression: `(${parsed.lhs})^(1/${power})`,
                    equation: `${targetVar} = (${parsed.lhs})^(1/${power})`,
                    direct: true
                };
            }
        }

        return null;
    }

    function deriveLinearSolvedForm(equation, targetVar) {
        const parsed = typeof equation === 'string' ? parseEquation(equation) : equation;
        if (!parsed || parsed.error) return null;
        if (!parsed.variables.includes(targetVar)) return null;

        // New approach:
        // If the equation is linear in targetVar, then for f(targetVar, others)=0,
        // we can write: f(0, others) + targetVar * (f(1, others) - f(0, others)) = 0
        // => targetVar = -f(0, others) / (f(1, others) - f(0, others))
        //
        // This keeps non-linear terms in other variables intact (e.g. sin(x), y^2),
        // unlike the previous coefficient-per-variable method.

        const fExpr = `(${parsed.lhs}) - (${parsed.rhs})`;

        const escapedTarget = targetVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const replaceTarget = (expr, value) => {
            // Unicode-aware variable boundary to avoid replacing inside other identifiers.
            const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escapedTarget}(?![\\p{L}\\p{N}_])`, 'gu');
            return expr.replace(pattern, String(value));
        };

        // After replacing targetVar with 0/1, prune trivial arithmetic patterns
        // so the symbolic form stays readable (e.g. "2*0 + y" → "y").
        // Simplify trivial arithmetic produced by textual variable substitution.
        const pruneZero = (s) => {
            let out = String(s);
            for (let i = 0; i < 8; i++) {
                const prev = out;
                out = out
                    // N*0 and 0*N → 0
                    .replace(/\b(\d+(?:\.\d+)?)\s*\*\s*0\b/g, '0')
                    .replace(/\b0\s*\*\s*(\d+(?:\.\d+)?)\b/g, '0')
                    // 0 + expr and expr + 0 → expr (inside parens)
                    .replace(/\(\s*0\s*\+\s*([^()]+?)\s*\)/g, '($1)')
                    .replace(/\(\s*([^()]+?)\s*\+\s*0\s*\)/g, '($1)')
                    // expr - 0 → expr (inside parens)
                    .replace(/\(\s*([^()]+?)\s*-\s*0\s*\)/g, '($1)')
                    // 0 - expr → -expr (inside parens)
                    .replace(/\(\s*0\s*-\s*([^()]+?)\s*\)/g, '(-$1)')
                    // strip redundant parens around plain atoms (variable or number)
                    .replace(/\(\s*([A-Za-z_\u0370-\u03FF][A-Za-z0-9_\u0370-\u03FF]*)\s*\)/g, '$1')
                    .replace(/\(\s*(\d+(?:\.\d+)?)\s*\)/g, '$1')
                    // collapse double negatives
                    .replace(/--/g, '')
                    .replace(/\(-(-[^()]+)\)/g, '($1)')
                    .replace(/\s{2,}/g, ' ');
                if (out === prev) break;
            }
            return out.trim();
        };

        // Build the expression for: x = -f0 / denom
        // When denom is negative, flip both signs so the denominator is positive.
        const buildTargetExpr = (numerator, denom) => {
            if (approxEqual(Math.abs(denom), 1, EPS)) {
                // denom = ±1: just return ∓numerator
                return denom > 0 ? `-${numerator}` : numerator;
            }
            if (denom < 0) {
                // -numerator / negative_denom = numerator / positive_denom
                return `${numerator} / ${formatNum(-denom)}`;
            }
            // denom > 0: standard form
            return `-${numerator} / ${formatNum(denom)}`;
        };

        const f0Expr = pruneZero(replaceTarget(fExpr, 0));
        const f1Expr = replaceTarget(fExpr, 1);
        const denomExpr = `(${f1Expr}) - (${pruneZero(replaceTarget(fExpr, 0))})`;

        const otherVars = parsed.variables.filter(s => s !== targetVar);

        // If the denominator is a constant (independent of other variables),
        // simplify the solved form substantially.
        let denomConstant = null;
        try {
            if (otherVars.length === 0) {
                const v = SafeMathEvaluator.evaluate(denomExpr, {});
                if (Number.isFinite(v)) denomConstant = v;
            } else {
                const samples = [
                    Object.fromEntries(otherVars.map(s => [s, 0])),
                    Object.fromEntries(otherVars.map(s => [s, 1])),
                    Object.fromEntries(otherVars.map(s => [s, -1]))
                ];
                const vals = samples.map(ctx => SafeMathEvaluator.evaluate(denomExpr, ctx)).filter(Number.isFinite);
                if (vals.length === samples.length && vals.every(v => approxEqual(v, vals[0], EPS * 10))) {
                    denomConstant = vals[0];
                }
            }
        } catch (_) {
            // ignore
        }

        // When the equation has no other variables, f0Expr is a pure constant.
        // Compute the numeric solved value directly so the solved form shows a clean
        // number (e.g. x = -1.666667) instead of a raw substitution expression.
        if (otherVars.length === 0 && Number.isFinite(denomConstant) && Math.abs(denomConstant) > EPS) {
            try {
                const f0Value = SafeMathEvaluator.evaluate(f0Expr, {});
                if (Number.isFinite(f0Value)) {
                    const val = -f0Value / denomConstant;
                    if (Number.isFinite(val)) {
                        const cleanExpr = formatNum(val);
                        return {
                            targetVar,
                            expression: cleanExpr,
                            equation: `${targetVar} = ${cleanExpr}`,
                            linear: true
                        };
                    }
                }
            } catch (_) { /* fall through to symbolic form */ }
        }

        const _f0 = `(${f0Expr})`;

        const targetExpr = (Number.isFinite(denomConstant) && Math.abs(denomConstant) > EPS)
            ? buildTargetExpr(_f0, denomConstant)
            : `-${_f0} / (${denomExpr})`;

        // Verify numerically that f is affine (linear) in targetVar:
        // f(2) == f(0) + 2*(f(1)-f(0)) for several assignments of other vars.
        const combos = [];

        // All others = 0
        combos.push(Object.fromEntries(otherVars.map(s => [s, 0])));

        // Each other var = 1
        for (const s of otherVars) {
            const obj = Object.fromEntries(otherVars.map(x => [x, x === s ? 1 : 0]));
            combos.push(obj);
        }
        // First two others = 1 (if present)
        if (otherVars.length >= 2) {
            const obj = Object.fromEntries(otherVars.map(x => [x, (x === otherVars[0] || x === otherVars[1]) ? 1 : 0]));
            combos.push(obj);
        }

        try {
            for (const others of combos) {
                const all0 = { ...others, [targetVar]: 0 };
                const all1 = { ...others, [targetVar]: 1 };
                const all2 = { ...others, [targetVar]: 2 };

                const f0 = SafeMathEvaluator.evaluate(fExpr, all0);
                const f1 = SafeMathEvaluator.evaluate(fExpr, all1);
                const f2 = SafeMathEvaluator.evaluate(fExpr, all2);

                if (!Number.isFinite(f0) || !Number.isFinite(f1) || !Number.isFinite(f2)) return null;

                const rhs = f0 + 2 * (f1 - f0);
                if (!approxEqual(f2, rhs, EPS * 10)) return null;
            }
        } catch (_) {
            return null;
        }

        // Extra check: denom shouldn't be identically zero.
        try {
            const sampleOthers = Object.fromEntries(otherVars.map(s => [s, 0]));
            const denomVal = SafeMathEvaluator.evaluate(denomExpr, { ...sampleOthers });
            if (!Number.isFinite(denomVal) || Math.abs(denomVal) < EPS) return null;
        } catch (_) {
            // If evaluation fails, we still allow the symbolic form to be shown.
        }

        return {
            targetVar,
            expression: targetExpr,
            equation: `${targetVar} = ${targetExpr}`,
            linear: true
        };
    }

    function tryEvaluateSolvedForm(solvedForm, knownValues) {
        if (!solvedForm?.expression) return null;

        try {
            return SafeMathEvaluator.evaluate(solvedForm.expression, knownValues);
        } catch (_) {
            return null;
        }
    }

    function solveNumerically(parsed, targetVar, knownValues) {
        const fExpr = buildDifferenceExpression(parsed);

        function f(val) {
            try {
                return SafeMathEvaluator.evaluate(fExpr, { ...knownValues, [targetVar]: val });
            } catch (_) {
                return NaN;
            }
        }

        // Two scan passes: positive values first (most physical quantities > 0),
        // then negative. Each pass is monotonic so sign-change detection works.
        // Wide logarithmic coverage ensures roots from sub-atomic to cosmic scales.
        const positiveSamples = [0, 1e-12, 1e-9, 1e-6, 1e-3, 1e-1, 1, 10, 100,
            1e3, 1e5, 1e7, 1e9, 1e12, 1e14, 1e16, 1e18, 1e20, 1e22, 1e24, 1e26, 1e30];
        const negativeSamples = [-1e-1, -1, -10, -100, -1e3, -1e6, -1e9,
            -1e12, -1e16, -1e20, -1e24, -1e30];
        // Scan monotonic sample lists for sign changes, bisect to find root.
        // Positive pass runs first — most physical quantities are > 0.
        const bisect = (lo, hi, flo) => {
            for (let iter = 0; iter < 200; iter++) {
                const mid = (lo + hi) / 2;
                const fmid = f(mid);
                if (!Number.isFinite(fmid)) break;
                if (Math.abs(hi - lo) <= Math.abs(mid) * 2e-14 + 1e-300) return mid;
                if (Math.sign(fmid) === Math.sign(flo)) { lo = mid; flo = fmid; }
                else { hi = mid; }
            }
            return (lo + hi) / 2;
        };

        const scanSamples = (sampleList) => {
            let prevX = null, prevY = null;
            for (const x of sampleList) {
                const y = f(x);
                if (!Number.isFinite(y)) { prevX = null; prevY = null; continue; }
                if (prevX !== null && Number.isFinite(prevY) && Math.sign(y) !== Math.sign(prevY)) {
                    return bisect(prevX, x, prevY);
                }
                prevX = x; prevY = y;
            }
            return null;
        };

        return scanSamples(positiveSamples) ?? scanSamples(negativeSamples);
    }

    function solveForVariable(equation, targetVar, knownValues = {}) {
        const parsed = parseEquation(equation);
        const steps = [];

        if (parsed.error) return { error: parsed.error, steps };

        steps.push({ text: `Original: ${parsed.lhs} = ${parsed.rhs}`, type: 'original' });

        if (!parsed.variables.includes(targetVar)) {
            return { error: `Variable "${targetVar}" not found in equation`, steps };
        }

        const others = parsed.variables.filter(symbol => symbol !== targetVar);
        const missing = others.filter(symbol => knownValues[symbol] === undefined || knownValues[symbol] === null || knownValues[symbol] === '');

        const solvedForm = deriveDirectSolvedForm(parsed, targetVar) || deriveLinearSolvedForm(parsed, targetVar);
        if (solvedForm) {
            steps.push({ text: `Solve for ${targetVar}: ${solvedForm.equation}`, type: 'symbolic' });
            if (solvedForm.note) {
                steps.push({ text: solvedForm.note, type: 'note' });
            }
        }

        if (missing.length > 0) {
            return {
                error: `Provide values for: ${missing.join(', ')}`,
                steps,
                solvedForm: solvedForm?.equation || null
            };
        }

        if (others.length > 0) {
            steps.push({
                text: `Given: ${others.map(symbol => `${symbol} = ${formatNum(knownValues[symbol])}`).join(', ')}`,
                type: 'given'
            });
        }

        if (solvedForm) {
            const substituted = substituteValues(solvedForm.expression, knownValues);
            steps.push({ text: `Substitute values: ${targetVar} = ${substituted}`, type: 'substitute' });
            const directValue = tryEvaluateSolvedForm(solvedForm, knownValues);
            if (Number.isFinite(directValue)) {
                steps.push({ text: `Result: ${targetVar} = ${formatNum(directValue)}`, type: 'result' });
                return {
                    result: directValue,
                    variable: targetVar,
                    solved: true,
                    solvedForm: solvedForm.equation,
                    steps
                };
            }
        }

        steps.push({ text: `Rearrange: ${parsed.lhs} - (${parsed.rhs}) = 0`, type: 'step' });
        const numericResult = solveNumerically(parsed, targetVar, knownValues);

        if (Number.isFinite(numericResult)) {
            steps.push({ text: `Numeric solve: ${targetVar} = ${formatNum(numericResult)}`, type: 'result' });
            return {
                result: numericResult,
                variable: targetVar,
                solved: true,
                solvedForm: solvedForm?.equation || null,
                steps
            };
        }

        return {
            error: 'Could not solve this equation numerically with the provided values',
            steps,
            solvedForm: solvedForm?.equation || null
        };
    }

    function solveSingleVariable(parsed) {
        const targetVar = parsed.variables[0];
        const steps = [{ text: `Original: ${parsed.lhs} = ${parsed.rhs}`, type: 'original' }];
        const solvedForm = deriveDirectSolvedForm(parsed, targetVar) || deriveLinearSolvedForm(parsed, targetVar);

        if (solvedForm) {
            steps.push({ text: `Solve for ${targetVar}: ${solvedForm.equation}`, type: 'symbolic' });
            if (solvedForm.note) {
                steps.push({ text: solvedForm.note, type: 'note' });
            }
            const directValue = tryEvaluateSolvedForm(solvedForm, {});
            if (Number.isFinite(directValue)) {
                steps.push({ text: `Result: ${targetVar} = ${formatNum(directValue)}`, type: 'result' });
                return {
                    result: directValue,
                    variable: targetVar,
                    solved: true,
                    solvedForm: solvedForm.equation,
                    steps
                };
            }
        }

        const numericResult = solveNumerically(parsed, targetVar, {});
        if (Number.isFinite(numericResult)) {
            steps.push({ text: `Numeric solve: ${targetVar} = ${formatNum(numericResult)}`, type: 'result' });
            return {
                result: numericResult,
                variable: targetVar,
                solved: true,
                solvedForm: solvedForm?.equation || null,
                steps
            };
        }

        return { error: 'Could not find a solution numerically', steps };
    }

    function solve(equation) {
        const parsed = parseEquation(equation);
        if (parsed.error) return { error: parsed.error, steps: [] };

        if (parsed.variables.length === 0) {
            try {
                const left = SafeMathEvaluator.evaluate(parsed.lhs, {});
                const right = SafeMathEvaluator.evaluate(parsed.rhs, {});
                return {
                    result: approxEqual(left, right) ? 'Equation is true' : 'Equation is false',
                    solved: true,
                    steps: [{ text: `Original: ${parsed.lhs} = ${parsed.rhs}`, type: 'original' }]
                };
            } catch (error) {
                return { error: error.message || 'Could not evaluate the equation', steps: [] };
            }
        }

        if (parsed.variables.length > 1) {
            const solvedForms = {};
            for (const variable of parsed.variables) {
                const solvedForm = deriveDirectSolvedForm(parsed, variable) || deriveLinearSolvedForm(parsed, variable);
                if (solvedForm) {
                    solvedForms[variable] = solvedForm.equation;
                }
            }

            return {
                multiVar: true,
                variables: parsed.variables,
                equation: parsed.equation,
                normalizedEquation: parsed.equation,
                solvedForms,
                steps: [{
                    text: `Variables: ${parsed.variables.join(', ')}. Use the tabs to solve for each.`,
                    type: 'original'
                }]
            };
        }

        return solveSingleVariable(parsed);
    }

    global.AlgebraicSolver = {
        solve,
        solveForVariable,
        parseEquation,
        extractVariables,
        normalizeEquation,
        deriveDirectSolvedForm,
        deriveLinearSolvedForm
    };
})(typeof window !== 'undefined' ? window : globalThis);
