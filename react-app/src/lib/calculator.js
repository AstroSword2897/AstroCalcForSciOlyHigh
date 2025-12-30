import { formulas, constants } from "./data/formulas";
import { parseExpression } from "./expressionParser";
import { safeEvaluate } from "./safeExpressionEvaluator";
import { validateUnit } from "./dimensionalAnalysis";

/**
 * List all available formulas.
 */
export function listFormulas() {
  return formulas;
}

/**
 * Retrieve formula by its ID.
 */
export function getFormulaById(id) {
  return formulas.find((f) => f.id === id);
}

/**
 * Evaluate a formula safely.
 * @param {string} formulaId - The formula's ID
 * @param {Object} rawInputs - User-supplied variable inputs
 */
export function evaluateFormula(formulaId, rawInputs = {}) {
  const formula = getFormulaById(formulaId);
  if (!formula) {
    throw new Error(`Unknown formula: ${formulaId}`);
  }

  const parsedVars = {};
  for (const variable of formula.variables) {
    const raw = rawInputs[variable.symbol];

    if ((raw === undefined || raw === null || raw === "") && !variable.optional) {
      throw new Error(
        `Missing required variable "${variable.symbol}" for formula "${formulaId}"`
      );
    }

    try {
      parsedVars[variable.symbol] = raw
        ? parseExpression(raw, variable.unit)
        : variable.optional
        ? variable.default ?? 0
        : undefined; // should never hit undefined due to check above
    } catch (err) {
      throw new Error(
        `Failed to parse variable "${variable.symbol}" for formula "${formulaId}": ${err.message}`
      );
    }
  }

  const scope = { ...constants, ...parsedVars };
  const result = safeEvaluate(formula.expression, scope);

  if (result === null || result === undefined || Number.isNaN(result)) {
    throw new Error(
      `Evaluation failed for formula "${formulaId}" with inputs: ${JSON.stringify(parsedVars)}`
    );
  }

  // Validate result units
  try {
    validateUnit(result, formula.resultUnit);
  } catch (err) {
    console.warn(
      `Unit mismatch for formula "${formulaId}". Expected "${formula.resultUnit}", got value: ${result}. Error: ${err.message}`
    );
  }

  return {
    value: result,
    unit: formula.resultUnit,
    variables: parsedVars,
    constantsUsed: constants,
  };
}
