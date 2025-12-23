import { formulas, constants } from "./data/formulas";
import { parseExpression } from "./expressionParser";
import { safeEvaluate } from "./safeExpressionEvaluator";

export function listFormulas() {
  return formulas;
}

export function getFormulaById(id) {
  return formulas.find((f) => f.id === id);
}

export function evaluateFormula(formulaId, rawInputs = {}) {
  const formula = getFormulaById(formulaId);
  if (!formula) {
    throw new Error(`Unknown formula: ${formulaId}`);
  }

  const parsedVars = {};
  for (const variable of formula.variables) {
    const raw = rawInputs[variable.symbol];
    if (raw === undefined || raw === null || raw === "") {
      parsedVars[variable.symbol] = 0; // default to 0 for optional terms
      continue;
    }
    parsedVars[variable.symbol] = parseExpression(raw, variable.unit);
  }

  const scope = { ...constants, ...parsedVars };
  const result = safeEvaluate(formula.expression, scope);
  if (result === null) {
    throw new Error("Unable to evaluate expression with provided inputs.");
  }

  return {
    value: result,
    unit: formula.resultUnit,
    variables: scope,
  };
}
