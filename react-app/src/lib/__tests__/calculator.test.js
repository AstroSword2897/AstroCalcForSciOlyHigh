import { describe, expect, it } from "vitest";
import { evaluateFormula } from "../calculator";

describe("calculator formulas", () => {
  it("solves escape velocity", () => {
    const result = evaluateFormula("escape-velocity", { M: "5.972e24 kg", r: "6371000 m" });
    expect(result.value).toBeGreaterThan(11000); // m/s for Earth ~11186
    expect(result.unit).toBe("m/s");
  });

  it("solves Kepler third law", () => {
    const result = evaluateFormula("kepler-third", { a: "1 AU", m1: "1.988e30 kg" });
    expect(result.value).toBeGreaterThan(3e7);
  });
});
