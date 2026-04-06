/**
 * Display labels for formula variables vs internal symbols (e.g. orbital eccentricity: ecc → "e").
 * Attached to globalThis for classic scripts; ES modules may import if added later.
 */
(function attachFormulaDisplayUtils(global) {
    function getVariableDisplayLabel(v) {
        if (!v || v.symbol == null) return '';
        const d = v.displaySymbol;
        if (d != null && String(d).trim() !== '') return String(d).trim();
        return String(v.symbol);
    }

    /**
     * Show equation text with display symbols (for cards, headers).
     */
    function formatEquationForDisplay(equation, formula) {
        let s = String(equation ?? '');
        const vars = (formula && formula.variables) || [];
        const mapped = vars
            .filter(
                (v) =>
                    v &&
                    v.displaySymbol != null &&
                    String(v.displaySymbol).trim() !== '' &&
                    v.symbol !== v.displaySymbol
            )
            .sort((a, b) => String(b.symbol).length - String(a.symbol).length);
        for (const v of mapped) {
            const esc = String(v.symbol).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            s = s.replace(new RegExp(`\\b${esc}\\b`, 'g'), v.displaySymbol);
        }
        return s;
    }

    function displaySymbolForSolved(formula, symbol) {
        if (symbol == null || symbol === '') return '';
        const sym = String(symbol);
        const v = formula && formula.variables ? formula.variables.find((x) => x.symbol === sym) : null;
        return v ? getVariableDisplayLabel(v) : sym;
    }

    /** Substituted expressions / work-step strings that still use internal symbols. */
    function formatMathDisplayString(str, formula) {
        return formatEquationForDisplay(str, formula);
    }

    global.formulaDisplayUtils = {
        getVariableDisplayLabel,
        formatEquationForDisplay,
        displaySymbolForSolved,
        formatMathDisplayString
    };
})(typeof globalThis !== 'undefined' ? globalThis : this);
