import { parse as parseUnit } from "./unitParser";
import { convert } from "./unitConverter";
import { validateDimensions } from "./dimensionalAnalysis";

// Core expression parser used by calculator and converters.
export function parseExpression(value, expectedUnit = null) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const unitParse = parseUnit(String(value));
  if (unitParse.hasUnit && unitParse.value !== null) {
    if (expectedUnit) {
      const converted = convert(unitParse.value, unitParse.unit, expectedUnit);
      if (converted !== null) {
        return converted;
      }
      const validation = validateDimensions(
        unitParse.value,
        unitParse.unit,
        expectedUnit,
      );
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }
    return unitParse.value;
  }

  const trimmed = String(value).trim();
  let isDegrees = /°|deg(rees)?$/i.test(trimmed);
  let expression = trimmed.replace(/°|deg(rees)?$/i, "").trim();

  const direct = parseFloat(expression);
  if (!Number.isNaN(direct) && expression === direct.toString()) {
    return isDegrees ? (direct * Math.PI) / 180 : direct;
  }

  // Basic substitution for constants and Math functions
  expression = expression
    .replace(/\bpi\b/gi, Math.PI.toString())
    .replace(/\bπ\b/g, Math.PI.toString())
    .replace(/\be\b(?![\d.])/gi, Math.E.toString())
    .replace(/\^/g, "**")
    .replace(/\bsin\s*\(/gi, "Math.sin(")
    .replace(/\bcos\s*\(/gi, "Math.cos(")
    .replace(/\btan\s*\(/gi, "Math.tan(")
    .replace(/\basin\s*\(/gi, "Math.asin(")
    .replace(/\bacos\s*\(/gi, "Math.acos(")
    .replace(/\batan\s*\(/gi, "Math.atan(")
    .replace(/\bsqrt\s*\(/gi, "Math.sqrt(")
    .replace(/\bexp\s*\(/gi, "Math.exp(")
    .replace(/\bln\s*\(/gi, "Math.log(")
    .replace(/\blog\s*\(/gi, "Math.log10(")
    .replace(/\bpow\s*\(/gi, "Math.pow(");

  try {
    const result = Function(`"use strict"; return (${expression});`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return isDegrees ? (result * Math.PI) / 180 : result;
    }
  } catch (err) {
    // try simple fraction fallback
  }

  const fractionResult = parseFraction(expression);
  return isDegrees ? (fractionResult * Math.PI) / 180 : fractionResult;
}

export function parseFraction(value) {
  const fractionMatch = value.match(/^(.+)\/(.+)$/);
  if (fractionMatch) {
    const numerator = parseValue(fractionMatch[1]);
    const denominator = parseValue(fractionMatch[2]);
    if (denominator === 0) throw new Error("Division by zero");
    if (numerator === null || denominator === null) {
      throw new Error(`Cannot parse fraction: ${value}`);
    }
    return numerator / denominator;
  }
  const num = parseFloat(value);
  if (!Number.isNaN(num)) return num;
  throw new Error(`Cannot parse expression: ${value}`);
}

export function parseValue(input) {
  if (typeof input === "number") return input;
  const text = String(input).trim().toLowerCase();
  if (text === "pi" || text === "π") return Math.PI;
  if (text === "e") return Math.E;
  const num = parseFloat(text);
  return Number.isNaN(num) ? null : num;
}
