import { getUnitCategory, normalizeUnit } from "./unitParser";

export function validateDimensions(value, fromUnit, expectedUnit) {
  const from = normalizeUnit(fromUnit);
  const expected = normalizeUnit(expectedUnit);
  if (!expected) {
    return { valid: true, value };
  }

  const fromCat = getUnitCategory(from);
  const expectedCat = getUnitCategory(expected);

  if (!fromCat || !expectedCat || fromCat !== expectedCat) {
    return {
      valid: false,
      error: `Unit mismatch: received ${from || "dimensionless"} but expected ${expected}`,
    };
  }

  return { valid: true, value };
}
