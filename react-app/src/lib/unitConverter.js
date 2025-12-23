import { getUnitCategory, normalizeUnit } from "./unitParser";

const TO_BASE = {
  // distance -> meters
  m: (v) => v,
  km: (v) => v * 1_000,
  cm: (v) => v * 0.01,
  mm: (v) => v * 0.001,
  AU: (v) => v * 1.495978707e11,
  pc: (v) => v * 3.08567758128e16,
  ly: (v) => v * 9.4607e15,

  // mass -> kilograms
  kg: (v) => v,
  g: (v) => v / 1_000,
  "M☉": (v) => v * 1.98847e30,
  "M⊕": (v) => v * 5.9722e24,

  // time -> seconds
  s: (v) => v,
  min: (v) => v * 60,
  hr: (v) => v * 3_600,
  day: (v) => v * 86_400,
  yr: (v) => v * 31_557_600,

  // angle -> radians
  rad: (v) => v,
  "°": (v) => (v * Math.PI) / 180,

  // frequency -> Hz
  Hz: (v) => v,
  kHz: (v) => v * 1_000,
  MHz: (v) => v * 1_000_000,
  GHz: (v) => v * 1_000_000_000,
};

const FROM_BASE = {
  m: (v) => v,
  km: (v) => v / 1_000,
  cm: (v) => v / 0.01,
  mm: (v) => v / 0.001,
  AU: (v) => v / 1.495978707e11,
  pc: (v) => v / 3.08567758128e16,
  ly: (v) => v / 9.4607e15,

  kg: (v) => v,
  g: (v) => v * 1_000,
  "M☉": (v) => v / 1.98847e30,
  "M⊕": (v) => v / 5.9722e24,

  s: (v) => v,
  min: (v) => v / 60,
  hr: (v) => v / 3_600,
  day: (v) => v / 86_400,
  yr: (v) => v / 31_557_600,

  rad: (v) => v,
  "°": (v) => (v * 180) / Math.PI,

  Hz: (v) => v,
  kHz: (v) => v / 1_000,
  MHz: (v) => v / 1_000_000,
  GHz: (v) => v / 1_000_000_000,
};

function toBaseWithOffset(unit, value) {
  if (unit === "K") return value;
  if (unit === "°C") return value + 273.15;
  if (unit === "°F") return (value - 32) * (5 / 9) + 273.15;
  const fn = TO_BASE[unit];
  return fn ? fn(value) : null;
}

function fromBaseWithOffset(unit, value) {
  if (unit === "K") return value;
  if (unit === "°C") return value - 273.15;
  if (unit === "°F") return (value - 273.15) * (9 / 5) + 32;
  const fn = FROM_BASE[unit];
  return fn ? fn(value) : null;
}

export function convert(value, fromUnit, toUnit) {
  if (value === null || value === undefined) return null;
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (!from || !to || from === to) return value;

  const category = getUnitCategory(from);
  const toCategory = getUnitCategory(to);
  if (!category || !toCategory || category !== toCategory) {
    return null;
  }

  const baseValue = toBaseWithOffset(from, value);
  if (baseValue === null) return null;
  return fromBaseWithOffset(to, baseValue);
}

export function convertAndFormat(value, unit) {
  const normalized = normalizeUnit(unit);
  return { value, unit: normalized };
}
