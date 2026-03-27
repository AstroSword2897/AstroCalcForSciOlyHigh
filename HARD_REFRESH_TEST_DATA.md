# Hard Refresh & Calculation Test Data

**Date:** 2026-02-25 (session)  
**Test:** Reload app, search "parallax", open Parallax Distance (Arcseconds), enter p = 0.412, click Calculate.

## Steps Performed

1. **Navigate** to `http://localhost:8000/`
2. **Reload** page (browser_reload) to pick up latest JS/CSS
3. **Search** "parallax" in the formula search box
4. **Open** Parallax Distance (Arcseconds) card (click to expand / go to formula view)
5. **Fill** Parallax Angle in arcseconds: `0.412` (in calculator tab)
6. **Click** "Calculate"

## Results Gathered

- **Result type:** Symbolic Result (numeric path did not run)
- **Displayed content:**
  - "Known values: p = 0.412 arcseconds" → value for `p` **is** being collected
  - Equation shown as: `d = d ≈ 1 / 0.412` (duplicate LHS and ≈ still present; not evaluated to a number)
- **Expected:** Numeric result **d ≈ 2.427 pc** (1/0.412) with calculation flow (Given, Formula, Substitute, Evaluate, Result).

## Conclusions

1. **Value collection:** `p = 0.412` is present in the result, so the orchestrator or symbolic path is receiving known values for the parallax formula.
2. **Numeric solve path:** The UI still shows "Symbolic Result", so either:
   - `solve()` is taking the symbolic branch (e.g. treated as multiple unknowns), or
   - `solveForVariable('d', { p: 0.412 })` is failing and returning `null`, so the code falls back to symbolic.
3. **Display bug:** The shown equation is `d = d ≈ 1 / 0.412` — the formula string still contains `≈` and the LHS is duplicated. So:
   - The formula equation used for display should be normalized (≈ → =).
   - The substituted/symbolic expression should not double the LHS (`d = ...`).

## Files / Code Points

- **Formula equation:** `scripts/formulas.js` — `parallax_distance_arcsec` has `equation: "d = 1 / p"` (no ≈).
- **Display:** `scripts/ui/rendering/ResultDisplay.js` uses `currentFormula.equation` for the "Formula" step.
- **Symbolic expression:** `scripts/calculator.js` `generateSymbolicExpression()` builds fallback from `this.formula.equation` (line 559); no ≈ normalization there.
- **Solver:** `scripts/calculator.js` — `_solveAlgebraically` and `solveForVariable` already normalize `≈` to `=` for parsing.

## Next Steps (recommended)

1. **Display normalization:** When showing the formula or building the symbolic expression, normalize `≈` to `=` so the UI never shows `≈` in the equation string.
2. **Avoid duplicate LHS:** When building the symbolic/substituted string (e.g. `unknownVar = ${expression}`), ensure `expression` does not already start with `unknownVar =` (e.g. strip leading "d = " from the formula side before concatenating).
3. **Debug numeric path:** Add or inspect console logs for:
   - `collectVariableValues(formula)` return value when Calculate is clicked on the calculator tab.
   - `solveForVariable('d', knownVars)` — whether it’s called and what it returns (number vs null).
   - Any thrown errors inside `_solveAlgebraically` or `evaluateExpression` for "1 / p" with `{ p: 0.412 }".
