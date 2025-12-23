// Lightweight unit parser adapted from the legacy implementation.
// Parses numeric values with optional units and normalizes common aliases.

const UNIT_MAP = {
  // Distance
  meter: "m",
  meters: "m",
  metre: "m",
  metres: "m",
  km: "km",
  kilometer: "km",
  kilometers: "km",
  kilometre: "km",
  kilometres: "km",
  cm: "cm",
  millimeter: "mm",
  millimeters: "mm",
  millimetre: "mm",
  millimetres: "mm",
  au: "AU",
  "astronomical unit": "AU",
  "astronomical units": "AU",
  pc: "pc",
  parsec: "pc",
  parsecs: "pc",
  ly: "ly",
  "light year": "ly",
  "light years": "ly",

  // Mass
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  g: "g",
  gram: "g",
  grams: "g",
  "solar mass": "M☉",
  "solar masses": "M☉",
  msun: "M☉",
  m_sun: "M☉",
  "earth mass": "M⊕",
  "earth masses": "M⊕",

  // Time
  s: "s",
  second: "s",
  seconds: "s",
  min: "min",
  minute: "min",
  minutes: "min",
  hr: "hr",
  h: "hr",
  hour: "hr",
  hours: "hr",
  day: "day",
  days: "day",
  yr: "yr",
  year: "yr",
  years: "yr",

  // Angle
  rad: "rad",
  radian: "rad",
  radians: "rad",
  degree: "°",
  degrees: "°",
  deg: "°",

  // Frequency
  hz: "Hz",
  hertz: "Hz",
  khz: "kHz",
  mhz: "MHz",
  ghz: "GHz",

  // Temperature
  k: "K",
  kelvin: "K",
  c: "°C",
  celsius: "°C",
  f: "°F",
  fahrenheit: "°F",
};

export function normalizeUnit(unit = "") {
  if (!unit) return "";
  const cleaned = unit.trim();
  const direct = UNIT_MAP[cleaned];
  if (direct) return direct;
  const lower = cleaned.toLowerCase();
  return UNIT_MAP[lower] || cleaned;
}

export function isValidUnit(unit = "") {
  const normalized = normalizeUnit(unit);
  return [
    "m",
    "km",
    "cm",
    "mm",
    "AU",
    "pc",
    "ly",
    "kg",
    "g",
    "M☉",
    "M⊕",
    "s",
    "min",
    "hr",
    "day",
    "yr",
    "K",
    "°C",
    "°F",
    "rad",
    "°",
    "Hz",
    "kHz",
    "MHz",
    "GHz",
    "",
  ].includes(normalized);
}

export function getUnitCategory(unit = "") {
  const normalized = normalizeUnit(unit);
  const categories = {
    distance: ["m", "km", "cm", "mm", "AU", "pc", "ly"],
    mass: ["kg", "g", "M☉", "M⊕"],
    time: ["s", "min", "hr", "day", "yr"],
    temperature: ["K", "°C", "°F"],
    angle: ["rad", "°"],
    frequency: ["Hz", "kHz", "MHz", "GHz"],
  };

  for (const [category, units] of Object.entries(categories)) {
    if (units.includes(normalized)) return category;
  }
  return null;
}

export function parseUnitValue(input) {
  if (input === null || input === undefined) {
    return { value: null, unit: "", original: input, hasUnit: false };
  }

  const text = String(input).trim();
  const unitPattern =
    /^([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?(?:\s*×\s*10\^?\d+)?)\s*([a-zA-Z°µΩÅαβγδθλμπσφωΩ°'"]+)?$/;
  const match = text.match(unitPattern);

  if (!match) {
    const num = parseFloat(text);
    return {
      value: Number.isFinite(num) ? num : null,
      unit: "",
      original: input,
      hasUnit: false,
    };
  }

  const valueStr = match[1].replace(/\s*×\s*10\^?/g, "e");
  const unitStr = match[2] ? normalizeUnit(match[2]) : "";
  const value = parseFloat(valueStr);

  return {
    value: Number.isFinite(value) ? value : null,
    unit: unitStr,
    original: input,
    hasUnit: Boolean(unitStr),
  };
}

export function parse(value) {
  return parseUnitValue(value);
}
