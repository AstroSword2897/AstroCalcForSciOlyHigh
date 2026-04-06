/**
 * Runtime validation for formula.validityConditions and unitSystem hints.
 * Works with numeric inputs only (SI/base units after conversion).
 */

/**
 * @param {Record<string, unknown>} rawVars
 * @param {Record<string, number>} globalConstants
 * @returns {Record<string, number>}
 */
function mergeNumericVars(rawVars, globalConstants) {
    const out = {};
    const g = globalConstants && typeof globalConstants === 'object' ? globalConstants : {};
    for (const [k, v] of Object.entries(g)) {
        if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    }
    for (const [k, v] of Object.entries(rawVars || {})) {
        if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    }
    return out;
}

/**
 * @param {object} formula
 * @param {Record<string, unknown>} rawVars
 * @param {Record<string, number>} globalConstants
 * @returns {{
 *   valid: boolean,
 *   errors: { message: string, variable?: string }[],
 *   warnings: { message: string, variable?: string }[],
 *   unchecked: { message: string, variable?: string, condition?: string }[],
 *   validitySearchMultiplier: number
 * }}
 */
export function validateFormulaInputs(formula, rawVars, globalConstants = {}) {
    const errors = [];
    const warnings = [];
    const unchecked = [];
    const vars = mergeNumericVars(rawVars || {}, globalConstants);

    const conditions = formula?.confidence?.validityConditions;
    if (Array.isArray(conditions)) {
        for (const cond of conditions) {
            if (!cond || typeof cond !== 'object') continue;
            const msg = cond.violationMessage || cond.condition || 'Validity check';
            const variable = cond.variable;
            if (cond.checkable === false) {
                unchecked.push({
                    message: msg,
                    variable,
                    condition: cond.condition
                });
                continue;
            }
            if (typeof cond.check !== 'function') {
                unchecked.push({
                    message: msg,
                    variable,
                    condition: cond.condition
                });
                continue;
            }
            let passed = true;
            try {
                passed = !!cond.check(vars, globalConstants || {});
            } catch (e) {
                warnings.push({ message: `Could not evaluate validity check: ${e?.message || e}` });
                continue;
            }
            if (!passed) {
                const entry = { message: msg, variable };
                if (cond.violationSeverity === 'error') errors.push(entry);
                else warnings.push(entry);
            }
        }
    }

    const us = formula?.confidence?.unitSystem;
    if (us && typeof us === 'object') {
        if (us.system === 'mixed' && us.conversionWarning) {
            warnings.push({ message: us.conversionWarning });
        } else if (us.conversionWarning && (us.system === 'CGS' || us.system === 'mixed')) {
            warnings.push({ message: us.conversionWarning });
        }
    }

    let validitySearchMultiplier = 1;
    if (errors.length > 0) validitySearchMultiplier = 0.35;
    else if (warnings.length > 0) validitySearchMultiplier = 0.82;

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        unchecked,
        validitySearchMultiplier
    };
}

if (typeof globalThis !== 'undefined') {
    globalThis.validateFormulaInputs = validateFormulaInputs;
}
