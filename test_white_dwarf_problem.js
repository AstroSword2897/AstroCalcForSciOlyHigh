/**
 * Test script for white dwarf binary problem
 * 
 * Problem data from radial velocity graph:
 * - Red curve: K_red = 10000 m/s
 * - Blue curve: K_blue = 5000 m/s  
 * - Total mass: M_total = 1.5 M☉ = 1.5 × 1.989 × 10^30 kg
 * - Graph shows one complete cycle = 10 phase units
 * 
 * Part a: Find orbital period
 * Part b: Find total orbital energy
 * Part c: Find rate of orbital decay
 * Part d: Find merger time
 */

// Constants
const G = 6.67430e-11; // m³/(kg·s²)
const c = 2.99792458e8; // m/s
const M_SUN = 1.989e30; // kg

// Problem data
const K_red = 10000; // m/s (primary, larger amplitude)
const K_blue = 5000; // m/s (secondary, smaller amplitude)
const M_total = 1.5 * M_SUN; // kg

console.log("=== WHITE DWARF BINARY PROBLEM TEST ===\n");
console.log("Given data:");
console.log(`K_red (primary) = ${K_red} m/s`);
console.log(`K_blue (secondary) = ${K_blue} m/s`);
console.log(`M_total = ${M_total.toExponential(3)} kg = 1.5 M☉\n`);

// Step 1: Find mass ratio from velocity amplitudes
// M₁/M₂ = K₂/K₁ (for circular orbits)
const mass_ratio = K_blue / K_red; // M₁/M₂
console.log("Step 1: Mass ratio from velocity amplitudes");
console.log(`M₁/M₂ = K₂/K₁ = ${K_blue}/${K_red} = ${mass_ratio}`);

// Step 2: Find individual masses
// M₁ + M₂ = M_total
// M₁ = mass_ratio × M₂
// mass_ratio × M₂ + M₂ = M_total
// M₂ × (mass_ratio + 1) = M_total
const M2 = M_total / (mass_ratio + 1);
const M1 = mass_ratio * M2;
console.log("\nStep 2: Individual masses");
console.log(`M₂ = ${M2.toExponential(3)} kg = ${(M2/M_SUN).toFixed(3)} M☉`);
console.log(`M₁ = ${M1.toExponential(3)} kg = ${(M1/M_SUN).toFixed(3)} M☉`);

// Step 3: Find semi-major axis from radial velocity
// For circular binary: K = (2πa/P) × (M_other/(M₁+M₂))
// Rearranging: a/P = K × (M₁+M₂) / (2π × M_other)
// For primary: a/P = K₁ × (M₁+M₂) / (2π × M₂)
const a_over_P_primary = (K_red * M_total) / (2 * Math.PI * M2);
const a_over_P_secondary = (K_blue * M_total) / (2 * Math.PI * M1);
console.log("\nStep 3: a/P from radial velocity");
console.log(`From primary: a/P = ${a_over_P_primary.toExponential(3)} m/s`);
console.log(`From secondary: a/P = ${a_over_P_secondary.toExponential(3)} m/s`);
console.log(`Average: a/P = ${((a_over_P_primary + a_over_P_secondary)/2).toExponential(3)} m/s`);

// Use average
const a_over_P = (a_over_P_primary + a_over_P_secondary) / 2;

// Step 4: Use Kepler's Third Law to find period
// P² = (4π²/G(M₁+M₂)) × a³
// From a/P, we have: a = (a/P) × P
// Substituting: P² = (4π²/G(M₁+M₂)) × ((a/P) × P)³
// P² = (4π²/G(M₁+M₂)) × (a/P)³ × P³
// P² = (4π²/G(M₁+M₂)) × (a/P)³ × P³
// P² / P³ = (4π²/G(M₁+M₂)) × (a/P)³
// 1/P = (4π²/G(M₁+M₂)) × (a/P)³
// P = 1 / ((4π²/G(M₁+M₂)) × (a/P)³)
// P = G(M₁+M₂) / (4π² × (a/P)³)

const P = (G * M_total) / (4 * Math.PI * Math.PI * Math.pow(a_over_P, 3));
console.log("\nStep 4: Orbital period from Kepler's Third Law");
console.log(`P = ${P.toExponential(3)} s`);
console.log(`P = ${(P / 3600).toExponential(3)} hours`);
console.log(`P = ${(P / 86400).toExponential(3)} days`);
console.log(`P = ${(P / (365.25 * 86400)).toExponential(3)} years`);

// Now find semi-major axis
const a = a_over_P * P;
console.log(`\nSemi-major axis: a = ${a.toExponential(3)} m`);
console.log(`a = ${(a / 1.496e11).toExponential(3)} AU`);

// Part a: Period (answer)
console.log("\n=== PART A: ORBITAL PERIOD ===");
console.log(`Period P = ${P.toExponential(3)} s`);
console.log(`Period P = ${(P / 3600).toFixed(2)} hours`);
console.log(`Period P = ${(P / 86400).toFixed(4)} days`);

// Part b: Total orbital energy
// E = -G M₁ M₂ / (2a)
const E_orbital = -G * M1 * M2 / (2 * a);
console.log("\n=== PART B: TOTAL ORBITAL ENERGY ===");
console.log(`E = ${E_orbital.toExponential(3)} J`);
console.log(`E = ${(E_orbital / 1e40).toExponential(3)} × 10^40 J`);

// Part c: Rate of orbital decay
// The problem gives: dE/dt = -32/5 G^4 c^-5 r^-5 (Ma Mb)^2 (Ma + Mb)
// But we need da/dt, not dE/dt
// From E = -G M₁ M₂ / (2a), we have: dE/da = G M₁ M₂ / (2a²)
// So: da/dt = (dE/dt) / (dE/da) = (dE/dt) × (2a²) / (G M₁ M₂)

// First calculate dE/dt from the given formula
const r = a; // orbital separation = semi-major axis for circular orbit
const dE_dt = -(32/5) * Math.pow(G, 4) * Math.pow(c, -5) * Math.pow(r, -5) * Math.pow(M1 * M2, 2) * (M1 + M2);
console.log("\n=== PART C: RATE OF ORBITAL DECAY ===");
console.log(`dE/dt = ${dE_dt.toExponential(3)} J/s`);
console.log(`dE/dt = ${(dE_dt / 1e20).toExponential(3)} × 10^20 J/s`);

// Now find da/dt
const dE_da = G * M1 * M2 / (2 * Math.pow(a, 2));
const da_dt = dE_dt / dE_da;
console.log(`da/dt = ${da_dt.toExponential(3)} m/s`);
console.log(`da/dt = ${(da_dt / 1000).toExponential(3)} km/s`);

// Part d: Merger time
// Using the formula: t_merge = (5c⁵a⁴) / (256G³M₁M₂(M₁+M₂))
const t_merge = (5 * Math.pow(c, 5) * Math.pow(a, 4)) / (256 * Math.pow(G, 3) * M1 * M2 * (M1 + M2));
console.log("\n=== PART D: MERGER TIME ===");
console.log(`t_merge = ${t_merge.toExponential(3)} s`);
console.log(`t_merge = ${(t_merge / 3600).toExponential(3)} hours`);
console.log(`t_merge = ${(t_merge / 86400).toExponential(3)} days`);
console.log(`t_merge = ${(t_merge / (365.25 * 86400)).toExponential(3)} years`);
console.log(`t_merge = ${(t_merge / (365.25 * 86400 * 1e6)).toExponential(3)} million years`);
console.log(`t_merge = ${(t_merge / (365.25 * 86400 * 1e9)).toExponential(3)} billion years`);

console.log("\n=== TEST COMPLETE ===");

