export const constants = {
  G: 6.67430e-11, // gravitational constant (m^3 kg^-1 s^-2)
  c: 299792458, // speed of light (m/s)
  sigma: 5.670374419e-8, // Stefan-Boltzmann constant (W·m−2·K−4)
  AU: 1.495978707e11,
};

export const formulas = [
  {
    id: "kepler-third",
    name: "Kepler's Third Law",
    category: "orbital",
    description: "Orbital period from semi-major axis and total mass.",
    latex: "T = 2\\pi\\sqrt{\\dfrac{a^3}{G(M_1 + M_2)}}",
    expression: "2 * Math.PI * Math.sqrt(Math.pow(a, 3) / (G * (m1 + m2)))",
    resultUnit: "s",
    variables: [
      { symbol: "a", name: "Semi-major axis", unit: "m" },
      { symbol: "m1", name: "Primary mass", unit: "kg" },
      { symbol: "m2", name: "Secondary mass (optional)", unit: "kg" },
    ],
  },
  {
    id: "escape-velocity",
    name: "Escape Velocity",
    category: "mechanics",
    description: "Escape velocity from a spherical body.",
    latex: "v = \\sqrt{\\dfrac{2GM}{r}}",
    expression: "Math.sqrt((2 * G * M) / r)",
    resultUnit: "m/s",
    variables: [
      { symbol: "M", name: "Mass of body", unit: "kg" },
      { symbol: "r", name: "Radius from center", unit: "m" },
    ],
  },
  {
    id: "stefan-boltzmann",
    name: "Stefan–Boltzmann Law",
    category: "radiation",
    description: "Luminosity from radius and temperature.",
    latex: "L = 4\\pi r^2 \\sigma T^4",
    expression: "4 * Math.PI * Math.pow(r, 2) * sigma * Math.pow(T, 4)",
    resultUnit: "W",
    variables: [
      { symbol: "r", name: "Radius", unit: "m" },
      { symbol: "T", name: "Temperature", unit: "K" },
    ],
  },
  {
    id: "redshift",
    name: "Spectral Redshift",
    category: "relativity",
    description: "Redshift from observed vs rest wavelength.",
    latex: "z = \\dfrac{\\lambda_{obs} - \\lambda_{rest}}{\\lambda_{rest}}",
    expression: "(lambda_obs - lambda_rest) / lambda_rest",
    resultUnit: "dimensionless",
    variables: [
      { symbol: "lambda_obs", name: "Observed wavelength", unit: "m" },
      { symbol: "lambda_rest", name: "Rest wavelength", unit: "m" },
    ],
  },
];
