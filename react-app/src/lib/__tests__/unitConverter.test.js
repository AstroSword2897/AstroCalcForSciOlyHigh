import { describe, expect, it } from "vitest";
import { convert } from "../unitConverter";

describe("unitConverter", () => {
  it("converts distance units", () => {
    expect(convert(1000, "m", "km")).toBeCloseTo(1);
    expect(convert(1, "AU", "km")).toBeCloseTo(1.495978707e8, 2);
  });

  it("converts temperature with offsets", () => {
    expect(convert(0, "°C", "K")).toBeCloseTo(273.15, 2);
    expect(convert(32, "°F", "°C")).toBeCloseTo(0, 2);
  });

  it("rejects incompatible units", () => {
    expect(convert(1, "m", "kg")).toBeNull();
  });
});
