const ALLOWED_FUNCTIONS = [
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "atan2",
  "sinh",
  "cosh",
  "tanh",
  "sqrt",
  "cbrt",
  "exp",
  "log",
  "log10",
  "log2",
  "abs",
  "floor",
  "ceil",
  "round",
  "min",
  "max",
  "pow",
];

const ALLOWED_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  π: Math.PI,
};

export function safeEvaluate(expression, variables = {}) {
  if (!expression || typeof expression !== "string") return null;

  let expr = expression.trim();
  for (const [key, value] of Object.entries(ALLOWED_CONSTANTS)) {
    const regex = new RegExp(`(?<![A-Za-z0-9_\\.])${escapeRegex(key)}\\b`, "g");
    expr = expr.replace(regex, String(value));
  }

  for (const [name, value] of Object.entries(variables)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, "g");
      expr = expr.replace(regex, String(value));
    }
  }

  for (const func of ALLOWED_FUNCTIONS) {
    const regex = new RegExp(`(?<![A-Za-z0-9_\\.])${func}\\s*\\(`, "g");
    expr = expr.replace(regex, `Math.${func}(`);
  }

  expr = expr.replace(/\^/g, "**");

  try {
    const argNames = Object.keys(variables);
    const argValues = Object.values(variables);
    const fn = new Function(...argNames, `"use strict"; return (${expr});`);
    const scoped = fn(...argValues);
    if (typeof scoped === "number" && Number.isFinite(scoped)) {
      return scoped;
    }
  } catch (e) {
    return null;
  }

  try {
    const result = Function(`"use strict"; return (${expr});`)();
    return typeof result === "number" && Number.isFinite(result) ? result : null;
  } catch (err) {
    return null;
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
