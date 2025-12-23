import { describe, expect, it } from "vitest";
import { evaluateFormula } from "../calculator";
import { parseExpression } from "../expressionParser";
import { convert } from "../unitConverter";
import { normalizeUnit, parseUnitValue } from "../unitParser";
import { validateDimensions } from "../dimensionalAnalysis";
import { safeEvaluate } from "../safeExpressionEvaluator";

describe("calculator end-to-end coverage", () => {
  it("evaluates Kepler's Third Law with unit conversion and optional mass default", () => {
    const result = evaluateFormula("kepler-third", {
      a: "1 AU",
      m1: "1.988e30 kg",
      // m2 omitted → should default to 0
    });

    expect(result.unit).toBe("s");
    expect(result.variables.m2).toBe(0);
    // Orbital period for 1 AU around 1 M☉ is ~3.156e7 s (1 year)
    expect(result.value).toBeGreaterThan(3.0e7);
    expect(result.value).toBeLessThan(3.3e7);
  });

  it("evaluates escape velocity using mixed units", () => {
    const result = evaluateFormula("escape-velocity", {
      M: "5.972e24 kg",
      r: "6371 km", // should convert to meters
    });

    expect(result.unit).toBe("m/s");
    expect(result.value).toBeCloseTo(11186, 0); // ~11.2 km/s for Earth
  });
});

describe("expression parsing and unit safety", () => {
  it("converts units when expected unit is provided", () => {
    expect(parseExpression("1000 m", "km")).toBeCloseTo(1);
  });

  it("throws on dimensional mismatch", () => {
    expect(() => parseExpression("5 kg", "m")).toThrow(/Unit mismatch/);
  });

  it("parses degrees to radians", () => {
    expect(parseExpression("180deg", "rad")).toBeCloseTo(Math.PI, 5);
  });
});

describe("unit parsing and conversion helpers", () => {
  it("normalizes and parses unit-bearing numbers", () => {
    const parsed = parseUnitValue("1.5e3 meters");
    expect(parsed.value).toBeCloseTo(1500);
    expect(parsed.unit).toBe("m");
    expect(parsed.hasUnit).toBe(true);
    expect(normalizeUnit("astronomical unit")).toBe("AU");
  });

  it("converts temperature with offsets", () => {
    expect(convert(300, "K", "°C")).toBeCloseTo(26.85, 2);
    expect(convert(32, "°F", "K")).toBeCloseTo(273.15, 2);
  });

  it("validates dimensions and flags mismatches", () => {
    const ok = validateDimensions(1, "m", "km");
    expect(ok.valid).toBe(true);
    const bad = validateDimensions(1, "kg", "m");
    expect(bad.valid).toBe(false);
    expect(bad.error).toMatch(/Unit mismatch/);
  });
});

describe("safe expression evaluation", () => {
  it("allows whitelisted math functions and constants", () => {
    expect(safeEvaluate("sin(PI/2)", {})).toBeCloseTo(1, 5);
    expect(safeEvaluate("pow(2,3)", {})).toBe(8);
  });

  it("returns null for disallowed expressions", () => {
    expect(safeEvaluate("process.exit(1)", {})).toBeNull();
    expect(safeEvaluate("constructor('return 1')()", {})).toBeNull();
  });
});
