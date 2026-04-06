/**
 * Shared path: raw string → numeric value in the variable’s formula base unit.
 * Used by formula-card quick-calc, Formula Explorer, and any single-field input that
 * must match the main calculator’s unit semantics (inline units, expressions, °, etc.).
 */
(function (global) {
    const NA = new Set(['', 'n/a', 'na', 'null', 'undefined', 'idk']);

    /**
     * @param {string|null|undefined} raw
     * @param {{ symbol?: string, unit?: string }} variable - formula.variables entry
     * @returns {number|null}
     */
    function parseVariableRawToFormulaBase(raw, variable) {
        if (raw === null || raw === undefined) {
            return null;
        }
        const s = String(raw).trim();
        if (!s || NA.has(s.toLowerCase())) {
            return null;
        }

        let baseUnit = '';
        if (variable && variable.unit != null) {
            const u = String(variable.unit).trim();
            if (
                u &&
                typeof global.UnitConverter !== 'undefined' &&
                global.UnitConverter != null &&
                typeof global.UnitConverter.normalizeFormulaUnit === 'function'
            ) {
                baseUnit = global.UnitConverter.normalizeFormulaUnit(u) || u;
            } else {
                baseUnit = u;
            }
        }

        if (typeof global.ExpressionParser === 'undefined' || typeof global.ExpressionParser.parse !== 'function') {
            const n = Number(s);
            return !Number.isNaN(n) && Number.isFinite(n) ? n : null;
        }

        try {
            const parsed = global.ExpressionParser.parse(s, baseUnit || null);
            if (parsed === null) {
                return null;
            }
            if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
                return null;
            }
            return parsed;
        } catch (err) {
            console.warn('[parseVariableRawToFormulaBase]', variable && variable.symbol, err.message);
            return null;
        }
    }

    global.parseVariableRawToFormulaBase = parseVariableRawToFormulaBase;
})(typeof window !== 'undefined' ? window : globalThis);
