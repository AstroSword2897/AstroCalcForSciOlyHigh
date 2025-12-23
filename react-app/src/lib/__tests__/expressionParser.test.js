import { describe, expect, it } from "vitest";
import { parseExpression } from "../expressionParser";

describe("parseExpression", () => {
  it("handles constants and fractions", () => {
    expect(parseExpression("pi/2")).toBeCloseTo(Math.PI / 2);
    expect(parseExpression("2*pi*2")).toBeCloseTo(4 * Math.PI);
  });

  it("converts degrees when unit is radians", () => {
    expect(parseExpression("90deg", "rad")).toBeCloseTo(Math.PI / 2, 3);
  });

  it("throws on invalid expressions", () => {
    expect(() => parseExpression("foo/bar")).toThrow();
  });
});
