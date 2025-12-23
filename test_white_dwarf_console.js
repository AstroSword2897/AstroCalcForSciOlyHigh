// Test script for white dwarf binary problem - run in browser console
(function() {
    console.log("=== TESTING WHITE DWARF BINARY PROBLEM ===\n");
    
    // Constants
    const M_SUN = 1.989e30; // kg
    const G = 6.67430e-11; // m³/(kg·s²)
    const c = 2.99792458e8; // m/s
    
    // Problem data
    const K_red = 10000; // m/s (primary, larger amplitude)
    const K_blue = 5000; // m/s (secondary, smaller amplitude)
    const M_total = 1.5 * M_SUN; // kg
    
    console.log("Given data:");
    console.log(`K_red (primary) = ${K_red} m/s`);
    console.log(`K_blue (secondary) = ${K_blue} m/s`);
    console.log(`M_total = ${M_total.toExponential(3)} kg = 1.5 M☉\n`);
    
    // Step 1: Find mass ratio
    const mass_ratio = K_blue / K_red; // M₁/M₂
    const M2 = M_total / (mass_ratio + 1);
    const M1 = mass_ratio * M2;
    
    console.log("Step 1: Mass ratio from velocity amplitudes");
    console.log(`M₁/M₂ = K₂/K₁ = ${K_blue}/${K_red} = ${mass_ratio}`);
    console.log(`M₁ = ${M1.toExponential(3)} kg = ${(M1/M_SUN).toFixed(3)} M☉`);
    console.log(`M₂ = ${M2.toExponential(3)} kg = ${(M2/M_SUN).toFixed(3)} M☉\n`);
    
    // Step 2: Find a/P from radial velocity
    const a_over_P = (K_red * M_total) / (2 * Math.PI * M2);
    const P = (G * M_total) / (4 * Math.PI * Math.PI * Math.pow(a_over_P, 3));
    const a = a_over_P * P;
    
    console.log("Step 2: Orbital parameters");
    console.log(`a/P = ${a_over_P.toExponential(3)} m/s`);
    console.log(`Period P = ${P.toExponential(3)} s = ${(P/86400).toFixed(2)} days`);
    console.log(`Semi-major axis a = ${a.toExponential(3)} m = ${(a/1.496e11).toFixed(3)} AU\n`);
    
    // Test Part A: Orbital Period using calculator
    console.log("=== PART A: ORBITAL PERIOD ===");
    try {
        const keplerBinary = formulas.find(f => f.id === 'kepler_third_law_binary');
        if (keplerBinary) {
            const calc = new FormulaCalculator(keplerBinary);
            const periodResult = calc.solve('P', {
                'M1': M1,
                'M2': M2,
                'a': a,
                'G': G
            });
            console.log(`✅ Calculator result: P = ${periodResult.value.toExponential(3)} ${periodResult.unit}`);
            console.log(`   P = ${(periodResult.value/86400).toFixed(2)} days`);
            console.log(`   P = ${(periodResult.value/(365.25*86400)).toFixed(2)} years`);
        } else {
            console.log("❌ Formula 'kepler_third_law_binary' not found");
        }
    } catch (e) {
        console.error("❌ Error in Part A:", e.message);
    }
    
    // Test Part B: Total Orbital Energy
    console.log("\n=== PART B: TOTAL ORBITAL ENERGY ===");
    try {
        const energyFormula = formulas.find(f => f.id === 'orbital_energy');
        if (energyFormula) {
            const calc = new FormulaCalculator(energyFormula);
            const energyResult = calc.solve('E', {
                'M': M1,
                'm': M2,
                'a': a,
                'G': G
            });
            console.log(`✅ Calculator result: E = ${energyResult.value.toExponential(3)} ${energyResult.unit}`);
            console.log(`   E = ${(energyResult.value/1e37).toExponential(3)} × 10^37 J`);
        } else {
            console.log("❌ Formula 'orbital_energy' not found");
        }
    } catch (e) {
        console.error("❌ Error in Part B:", e.message);
    }
    
    // Test Part C: Rate of Orbital Decay
    console.log("\n=== PART C: RATE OF ORBITAL DECAY ===");
    try {
        const decayFormula = formulas.find(f => f.id === 'orbital_decay_gravitational_radiation');
        if (decayFormula) {
            const calc = new FormulaCalculator(decayFormula);
            const decayResult = calc.solve('da/dt', {
                'M₁': M1,
                'M₂': M2,
                'a': a,
                'G': G,
                'c': c
            });
            console.log(`✅ Calculator result: da/dt = ${decayResult.value.toExponential(3)} ${decayResult.unit}`);
        } else {
            console.log("❌ Formula 'orbital_decay_gravitational_radiation' not found");
        }
    } catch (e) {
        console.error("❌ Error in Part C:", e.message);
    }
    
    // Test Part D: Merger Time
    console.log("\n=== PART D: MERGER TIME ===");
    try {
        const mergerFormula = formulas.find(f => f.id === 'white_dwarf_merger_timescale');
        if (mergerFormula) {
            const calc = new FormulaCalculator(mergerFormula);
            const mergerResult = calc.solve('t_merge', {
                'M1': M1,
                'M2': M2,
                'a': a
            });
            console.log(`✅ Calculator result: t_merge = ${mergerResult.value.toExponential(3)} ${mergerResult.unit}`);
            console.log(`   t_merge = ${(mergerResult.value/(365.25*86400)).toExponential(3)} years`);
            console.log(`   t_merge = ${(mergerResult.value/(365.25*86400*1e9)).toExponential(3)} billion years`);
        } else {
            console.log("❌ Formula 'white_dwarf_merger_timescale' not found");
        }
    } catch (e) {
        console.error("❌ Error in Part D:", e.message);
    }
    
    console.log("\n=== TEST COMPLETE ===");
})();

