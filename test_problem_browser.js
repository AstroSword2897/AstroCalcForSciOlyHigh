/**
 * Browser-based test for white dwarf binary problem
 * This script tests the calculator with the actual problem data
 */

// Wait for page to load
window.addEventListener('load', function() {
    console.log("=== TESTING WHITE DWARF BINARY PROBLEM IN CALCULATOR ===\n");
    
    // Constants
    const M_SUN = 1.989e30; // kg
    const K_red = 10000; // m/s
    const K_blue = 5000; // m/s
    const M_total = 1.5 * M_SUN; // kg
    
    // Step 1: Find mass ratio
    const mass_ratio = K_blue / K_red; // 0.5
    const M2 = M_total / (mass_ratio + 1); // 1.0 M☉
    const M1 = mass_ratio * M2; // 0.5 M☉
    
    console.log("Step 1: Mass ratio =", mass_ratio);
    console.log("M₁ =", M1, "kg =", M1/M_SUN, "M☉");
    console.log("M₂ =", M2, "kg =", M2/M_SUN, "M☉\n");
    
    // Test Part A: Find orbital period
    console.log("=== PART A: ORBITAL PERIOD ===");
    testPartA(M1, M2, M_total, K_red, K_blue);
    
    // Test Part B: Total orbital energy
    console.log("\n=== PART B: TOTAL ORBITAL ENERGY ===");
    testPartB(M1, M2);
    
    // Test Part C: Rate of orbital decay
    console.log("\n=== PART C: RATE OF ORBITAL DECAY ===");
    testPartC(M1, M2);
    
    // Test Part D: Merger time
    console.log("\n=== PART D: MERGER TIME ===");
    testPartD(M1, M2);
});

function testPartA(M1, M2, M_total, K_red, K_blue) {
    // First, find a/P from radial velocity
    const a_over_P = (K_red * M_total) / (2 * Math.PI * M2);
    const a = a_over_P * calculatePeriod(M1, M2, a_over_P);
    
    // Use Kepler's Third Law
    if (typeof FormulaCalculator !== 'undefined' && typeof formulas !== 'undefined') {
        const keplerFormula = formulas.find(f => f.id === 'kepler_third_law');
        if (keplerFormula) {
            try {
                const calc = new FormulaCalculator(keplerFormula);
                // We need to solve for T given a and M
                // But we need a first, which requires P...
                // This is circular, so let's use the analytical solution
                const G = 6.67430e-11;
                const P = (G * M_total) / (4 * Math.PI * Math.PI * Math.pow(a_over_P, 3));
                console.log("Period calculated:", P, "s =", P/86400, "days");
                return P;
            } catch (e) {
                console.error("Error in Part A:", e);
            }
        }
    }
}

function calculatePeriod(M1, M2, a_over_P) {
    const G = 6.67430e-11;
    const M_total = M1 + M2;
    const P = (G * M_total) / (4 * Math.PI * Math.PI * Math.pow(a_over_P, 3));
    return P;
}

function testPartB(M1, M2) {
    if (typeof FormulaCalculator !== 'undefined' && typeof formulas !== 'undefined') {
        const energyFormula = formulas.find(f => f.id === 'orbital_energy');
        if (energyFormula) {
            try {
                const calc = new FormulaCalculator(energyFormula);
                // First need to find 'a' from Part A
                const K_red = 10000;
                const M_total = M1 + M2;
                const M2_val = M2;
                const a_over_P = (K_red * M_total) / (2 * Math.PI * M2_val);
                const G = 6.67430e-11;
                const P = (G * M_total) / (4 * Math.PI * Math.PI * Math.pow(a_over_P, 3));
                const a = a_over_P * P;
                
                const result = calc.solve('E', {
                    M: M1, // Central mass (using M1 as central)
                    m: M2, // Orbiting mass
                    a: a,
                    G: 6.67430e-11
                });
                console.log("Orbital energy:", result.value, result.unit);
                return result;
            } catch (e) {
                console.error("Error in Part B:", e);
            }
        }
    }
}

function testPartC(M1, M2) {
    if (typeof FormulaCalculator !== 'undefined' && typeof formulas !== 'undefined') {
        const decayFormula = formulas.find(f => f.id === 'orbital_decay_gravitational_radiation');
        if (decayFormula) {
            try {
                const calc = new FormulaCalculator(decayFormula);
                // Need 'a' from Part A
                const K_red = 10000;
                const M_total = M1 + M2;
                const M2_val = M2;
                const a_over_P = (K_red * M_total) / (2 * Math.PI * M2_val);
                const G = 6.67430e-11;
                const P = (G * M_total) / (4 * Math.PI * Math.PI * Math.pow(a_over_P, 3));
                const a = a_over_P * P;
                
                const result = calc.solve('da/dt', {
                    'M₁': M1,
                    'M₂': M2,
                    'a': a,
                    'G': 6.67430e-11,
                    'c': 2.99792458e8
                });
                console.log("Orbital decay rate:", result.value, result.unit);
                return result;
            } catch (e) {
                console.error("Error in Part C:", e);
            }
        }
    }
}

function testPartD(M1, M2) {
    if (typeof FormulaCalculator !== 'undefined' && typeof formulas !== 'undefined') {
        const mergerFormula = formulas.find(f => f.id === 'white_dwarf_merger_timescale');
        if (mergerFormula) {
            try {
                const calc = new FormulaCalculator(mergerFormula);
                // Need 'a' from Part A
                const K_red = 10000;
                const M_total = M1 + M2;
                const M2_val = M2;
                const a_over_P = (K_red * M_total) / (2 * Math.PI * M2_val);
                const G = 6.67430e-11;
                const P = (G * M_total) / (4 * Math.PI * Math.PI * Math.pow(a_over_P, 3));
                const a = a_over_P * P;
                
                const result = calc.solve('t_merge', {
                    'M1': M1,
                    'M2': M2,
                    'a': a
                });
                console.log("Merger time:", result.value, result.unit);
                console.log("Merger time:", result.value / (365.25 * 86400), "years");
                return result;
            } catch (e) {
                console.error("Error in Part D:", e);
            }
        }
    }
}

