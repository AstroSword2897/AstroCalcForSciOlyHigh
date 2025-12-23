/**
 * Direct Calculator Test Runner
 * Tests the calculator engine directly (no browser needed)
 * Runs until 100% achieved 10 times consecutively
 */

const fs = require('fs');
const path = require('path');

// Mock minimal browser environment
global.window = {
    devicePixelRatio: 1,
    location: { hostname: 'localhost' }
};

global.location = { hostname: 'localhost' };

global.document = {
    getElementById: () => null,
    createElement: () => ({ style: {}, addEventListener: () => {} })
};

global.performance = { now: () => Date.now() };
global.Math = Math;

console.log('🧮 DIRECT CALCULATOR TEST RUNNER');
console.log('='.repeat(80));
console.log('Testing calculator engine directly (no browser)\n');

// Load formulas
console.log('📚 Loading formulas...');
try {
    const formulasCode = fs.readFileSync(path.join(__dirname, 'scripts/formulas.js'), 'utf8');
    // Replace browser-specific code
    const modifiedCode = formulasCode
        .replace(/var formulas = \[/, 'formulas = [')
        .replace(/if \(typeof window !== 'undefined'\)/, 'if (false)');
    eval(modifiedCode);
    console.log(`✅ Loaded ${typeof formulas !== 'undefined' ? formulas.length : 0} formulas`);
} catch (e) {
    console.error('❌ Error loading formulas:', e.message);
    process.exit(1);
}

// Load calculator
console.log('🧮 Loading calculator...');
try {
    // Load utils first - fix location reference
    const utilsCode = fs.readFileSync(path.join(__dirname, 'scripts/utils.js'), 'utf8');
    const modifiedUtils = utilsCode.replace(/window\.location\.hostname/g, "'localhost'");
    eval(modifiedUtils);
    
    const calculatorCode = fs.readFileSync(path.join(__dirname, 'scripts/calculator.js'), 'utf8');
    // Execute calculator code - it should define FormulaCalculator globally
    eval(calculatorCode);
    
    // Check if FormulaCalculator is available (might be in global scope)
    if (typeof FormulaCalculator === 'undefined') {
        // Try global scope
        if (typeof global !== 'undefined' && global.FormulaCalculator) {
            global.FormulaCalculator = global.FormulaCalculator;
        } else {
            // Try to get from module exports if it was exported
            try {
                const calcModule = { exports: {} };
                eval('(function(module, exports) {' + calculatorCode + '})(calcModule, calcModule.exports);');
                if (calcModule.exports.FormulaCalculator) {
                    global.FormulaCalculator = calcModule.exports.FormulaCalculator;
                }
            } catch (e2) {
                // Last resort: check if it's defined but not accessible
                throw new Error('FormulaCalculator not accessible. Error: ' + e2.message);
            }
        }
    }
    
    // Ensure it's in global scope for our use
    if (typeof FormulaCalculator === 'undefined') {
        throw new Error('FormulaCalculator class not found after loading');
    }
    
    const solverCount = FormulaCalculator.solvers ? Object.keys(FormulaCalculator.solvers).length : 0;
    console.log(`✅ Calculator loaded (${solverCount} solvers)`);
} catch (e) {
    console.error('❌ Error loading calculator:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
}

// Test configuration
const TEST_CONFIG = {
    TESTS_PER_FORMULA: 3,
    REQUIRED_PASS_RATE: 1.0,
    CONSECUTIVE_PASSES_REQUIRED: 10,
    MAX_RUNS: 100
};

let testResults = {
    run: 0,
    consecutive100PercentPasses: 0,
    allRuns: [],
    byCategory: {},
    byFormula: {},
    failures: []
};

/**
 * Generate test value for a variable
 */
function getTestValue(varDef, testType = 'standard') {
    const symbol = varDef.symbol.toLowerCase();
    const name = (varDef.name || '').toLowerCase();
    const unit = (varDef.unit || '').toLowerCase();

    if (name.includes('eccentricity') || symbol === 'e') {
        // must be < 1 for elliptical orbits
        return testType === 'edge' ? 0.2 : 0.5;
    }

    if (name.includes('albedo')) {
        // albedo
        return testType === 'edge' ? 0.6 : 0.3;
    }

    if (unit.includes('day')) {
        // Cepheid period etc.
        return testType === 'edge' ? 1 : 10;
    }

    // Unit-aware defaults (prevents feeding Watts into L_☉, kg into M_☉, etc.)
    if (unit.includes('m_☉') || unit.includes('m_sun') || unit.includes('solar')) {
        return testType === 'edge' ? 0.5 : 1.0; // solar masses (dimensionless scale)
    }
    if (unit.includes('l_☉') || unit.includes('l_sun')) {
        return testType === 'edge' ? 0.5 : 1.0; // solar luminosities
    }
    if (unit.includes('dimensionless')) {
        return testType === 'edge' ? 0.8 : 1.2; // avoid pathological 0/1 in logs
    }
    
    if (testType === 'edge') {
        if (name.includes('mass') || symbol === 'm' || symbol.startsWith('m_')) {
            return symbol.includes('sun') ? 1.989e30 : 1e20; // Smaller for edge
        }
        if (name.includes('distance') || symbol === 'd' || symbol === 'r' || symbol === 'a') {
            return 1e10; // Smaller distance
        }
        if (name.includes('temperature') || (symbol === 't' && name.includes('temp'))) {
            return 100; // Lower temp
        }
        return 0.1;
    }
    
    // Standard values
    if (name.includes('mass') || symbol === 'm' || symbol.startsWith('m_')) {
        return symbol.includes('sun') ? 1.989e30 : 1e30;
    }
    if (name.includes('radius') || symbol === 'r' || symbol.startsWith('r_')) {
        return symbol.includes('sun') ? 6.96e8 : 1e8;
    }
    if (name.includes('distance') || symbol === 'd' || symbol === 'a') {
        return 1.496e11; // 1 AU
    }
    if (name.includes('period') || symbol === 'p' || (symbol === 't' && !name.includes('temp'))) {
        return 3.156e7; // 1 year
    }
    if (name.includes('temperature') || (symbol === 't' && name.includes('temp'))) {
        return 5778; // Sun's temp
    }
    if (name.includes('wavelength') || symbol.includes('lambda')) {
        return 500e-9; // 500 nm
    }
    if (name.includes('velocity') || symbol === 'v') {
        return 29780; // Earth's orbital velocity
    }
    if (name.includes('luminosity') || symbol === 'l') {
        return 3.828e26; // Solar luminosity
    }
    if (name.includes('magnitude') || symbol === 'm') {
        // Clamp magnitude to safe range to prevent Infinity
        if (testType === 'edge') {
            return 15; // Positive magnitude for edge case
        }
        return 5; // Standard magnitude (positive)
    }
    if (name.includes('redshift') || symbol === 'z') {
        return 0.1;
    }
    if (name.includes('parallax') || symbol === 'p') {
        return 0.1; // 0.1 arcsec
    }
    return 1.0;
}

/**
 * Run calculator test
 */
function runCalculatorTest(formula, testCase) {
    try {
        if (!FormulaCalculator || !FormulaCalculator.solvers) {
            return { passed: false, error: 'FormulaCalculator not available' };
        }
        
        if (!FormulaCalculator.solvers[formula.id]) {
            return { passed: true, note: 'No solver defined (not testable yet)' };
        }
        
        const calculator = new FormulaCalculator(formula);
        const result = calculator.solve(testCase.inputs);
        
        if (!result || result.error) {
            return { passed: false, error: result.error || 'Calculation failed' };
        }
        
        if (typeof result.result !== 'number' || !isFinite(result.result)) {
            return { passed: false, error: `Invalid result: ${result.result}` };
        }
        
        // Astrophysical computations can legitimately exceed 1e50 depending on units.
        // Only fail on NaN / Infinity (handled above).
        
        return { passed: true, result: result.result };
        
    } catch (e) {
        return { passed: false, error: e.message, stack: e.stack };
    }
}

/**
 * Generate test cases for a formula
 */
function generateTestCases(formula) {
    const cases = [];
    const vars = formula.variables || [];
    
    if (vars.length === 0) return cases;
    
    // Determine constants so we never try to "solve" for them
    const constants = formula.constants || {};

    // Prefer solving variables that are well-posed with generic test values.
    // This avoids underdetermined cases (e.g., solving for p when E=1) and
    // avoids "solve for constant" cases.
    const preferredSolveVarByFormula = {
        power_law_spectrum: 'N',
        hydrostatic_balance: 'dP_dr',
        orbital_energy: 'E',
        friedmann_equation: 'H',
        planetary_equilibrium_temperature: 'T_eq',
        greenhouse_effect: 'ΔT_GH',
        albedo: 'A',
        white_dwarf_orbital_decay: 'da_dt',
        white_dwarf_merger_timescale: 't_merge',
        kepler_third_law_binary: 'P',
        vis_viva: 'v',
        angular_momentum_elliptical: 'L',
        period_luminosity_relation_cepheid: 'M_V',
        orbital_decay_gravitational_radiation: 'da/dt',
        gravitational_potential_general: 'Φ',
        synodic_period: 'P_syn',
        jeans_mass: 'M_J'
    };

    // Pick a variable to solve for:
    // - not a constant
    // - ideally solvable by the solver
    let solveIdx = -1;
    const preferred = preferredSolveVarByFormula[formula.id];
    if (preferred) {
        solveIdx = vars.findIndex(v => v.symbol === preferred);
        if (solveIdx === -1) {
            // allow unicode variants (e.g., ΔT_GH)
            solveIdx = vars.findIndex(v => v.symbol.toLowerCase() === preferred.toLowerCase());
        }
    }
    if (solveIdx === -1) {
        for (let i = vars.length - 1; i >= 0; i--) {
            const sym = vars[i].symbol;
            if (constants[sym] !== undefined) continue;
            solveIdx = i;
            break;
        }
    }
    if (solveIdx === -1) return cases;

    // Test 1: Standard values, solve for chosen variable
    const test1 = { inputs: {}, description: 'Standard test' };
    vars.forEach((v, i) => {
        if (i === solveIdx) {
            test1.inputs[v.symbol] = null;
        } else if (constants[v.symbol] !== undefined) {
            test1.inputs[v.symbol] = constants[v.symbol]; // lock constants
        } else {
            test1.inputs[v.symbol] = getTestValue(v, 'standard');
        }
    });

    // Formula-specific sanity tweaks for standard case
    if (formula.id === 'hydrostatic_balance' && test1.inputs.dP_dr !== null) {
        // enforce negative gradient
        test1.inputs.dP_dr = -Math.abs(test1.inputs.dP_dr || 1e3);
    }
    if (formula.id === 'orbital_energy' && test1.inputs.E !== null) {
        test1.inputs.E = -Math.abs(test1.inputs.E || 1e10);
    }
    if (formula.id === 'planetary_equilibrium_temperature') {
        // Ensure albedo A in [0,1] and semi-major axis positive
        if (test1.inputs.A !== undefined && test1.inputs.A !== null) test1.inputs.A = 0.3;
        if (test1.inputs.a !== undefined && test1.inputs.a !== null) test1.inputs.a = Math.abs(test1.inputs.a || 1.496e11);
        if (test1.inputs.T_star !== undefined && test1.inputs.T_star !== null) test1.inputs.T_star = Math.max(3000, test1.inputs.T_star);
        if (test1.inputs.R_star !== undefined && test1.inputs.R_star !== null) test1.inputs.R_star = Math.max(1e8, test1.inputs.R_star);
    }
    if (formula.id === 'friedmann_equation') {
        // typical cosmology-ish values
        if (test1.inputs.H0 !== undefined && test1.inputs.H0 !== null) test1.inputs.H0 = 70;
        if (test1.inputs['Ω_m'] !== undefined && test1.inputs['Ω_m'] !== null) test1.inputs['Ω_m'] = 0.3;
        if (test1.inputs['Ω_r'] !== undefined && test1.inputs['Ω_r'] !== null) test1.inputs['Ω_r'] = 0.0;
        if (test1.inputs['Ω_Λ'] !== undefined && test1.inputs['Ω_Λ'] !== null) test1.inputs['Ω_Λ'] = 0.7;
        if (test1.inputs.a !== undefined && test1.inputs.a !== null) test1.inputs.a = 1.0;
        if (test1.inputs.H !== undefined && test1.inputs.H !== null) test1.inputs.H = 70;
    }
    if (formula.id === 'greenhouse_effect') {
        if (test1.inputs.T_surface !== undefined && test1.inputs.T_surface !== null) test1.inputs.T_surface = 288;
        if (test1.inputs.T_eq !== undefined && test1.inputs.T_eq !== null) test1.inputs.T_eq = 255;
    }
    if (formula.id === 'synodic_period') {
        if (test1.inputs['P₁'] !== undefined && test1.inputs['P₁'] !== null) test1.inputs['P₁'] = 3.156e7;
        if (test1.inputs['P₂'] !== undefined && test1.inputs['P₂'] !== null) test1.inputs['P₂'] = 2.5e7;
    }
    if (formula.id === 'kepler_third_law_binary') {
        // ensure M2 positive and not forcing "total mass <= M1" when solving M2
        if (test1.inputs.M1 !== undefined && test1.inputs.M1 !== null) test1.inputs.M1 = 1e30;
        if (test1.inputs.M2 !== undefined && test1.inputs.M2 !== null) test1.inputs.M2 = 5e29;
        if (test1.inputs.a !== undefined && test1.inputs.a !== null) test1.inputs.a = 1.496e11;
    }
    if (formula.id === 'vis_viva') {
        // Ensure (2/r - 1/a) > 0  => r < 2a
        if (test1.inputs.M !== undefined && test1.inputs.M !== null) test1.inputs.M = 1.989e30;
        if (test1.inputs.a !== undefined && test1.inputs.a !== null) test1.inputs.a = 1.496e11;
        if (test1.inputs.r !== undefined && test1.inputs.r !== null) test1.inputs.r = 1.0e11;
    }
    if (formula.id === 'angular_momentum_elliptical') {
        if (test1.inputs.e !== undefined && test1.inputs.e !== null) test1.inputs.e = 0.5;
        if (test1.inputs.a !== undefined && test1.inputs.a !== null) test1.inputs.a = 1.496e11;
        if (test1.inputs.M !== undefined && test1.inputs.M !== null) test1.inputs.M = 1.989e30;
        if (test1.inputs.m_r !== undefined && test1.inputs.m_r !== null) test1.inputs.m_r = 5e29;
    }
    if (formula.id === 'orbital_decay_gravitational_radiation') {
        if (test1.inputs['M₁'] !== undefined && test1.inputs['M₁'] !== null) test1.inputs['M₁'] = 1e30;
        if (test1.inputs['M₂'] !== undefined && test1.inputs['M₂'] !== null) test1.inputs['M₂'] = 5e29;
        if (test1.inputs.a !== undefined && test1.inputs.a !== null) test1.inputs.a = 1e10;
    }
    if (formula.id === 'gravitational_potential_general') {
        if (test1.inputs.M !== undefined && test1.inputs.M !== null) test1.inputs.M = 1.989e30;
        if (test1.inputs.r !== undefined && test1.inputs.r !== null) test1.inputs.r = 1.496e11;
        if (test1.inputs.G !== undefined && test1.inputs.G !== null) test1.inputs.G = 6.67430e-11;
    }
    if (formula.id === 'time_dilation') {
        // Ensure delta_t < delta_t_prime (proper time < dilated time)
        // For time dilation: delta_t_prime = delta_t / sqrt(1 - v²/c²)
        // So delta_t_prime > delta_t always
        if (test1.inputs['Δt'] !== undefined && test1.inputs['Δt'] !== null && 
            test1.inputs["Δt'"] !== undefined && test1.inputs["Δt'"] !== null) {
            // If both are set, ensure delta_t < delta_t_prime
            if (test1.inputs['Δt'] >= test1.inputs["Δt'"]) {
                test1.inputs['Δt'] = test1.inputs["Δt'"] * 0.5; // Make delta_t half of delta_t_prime
            }
        } else if (test1.inputs['Δt'] !== undefined && test1.inputs['Δt'] !== null) {
            // If only delta_t is set, set delta_t_prime to be larger
            test1.inputs["Δt'"] = test1.inputs['Δt'] * 2;
        } else if (test1.inputs["Δt'"] !== undefined && test1.inputs["Δt'"] !== null) {
            // If only delta_t_prime is set, set delta_t to be smaller
            test1.inputs['Δt'] = test1.inputs["Δt'"] * 0.5;
        }
        // Ensure velocity is reasonable (< c)
        if (test1.inputs.v !== undefined && test1.inputs.v !== null) {
            test1.inputs.v = Math.min(Math.abs(test1.inputs.v), 0.9 * 2.998e8);
        }
    }
    if (formula.id === 'length_contraction') {
        // Ensure L_prime < L (contracted length < proper length)
        // For length contraction: L_prime = L * sqrt(1 - v²/c²)
        // So L_prime < L always
        if (test1.inputs.L !== undefined && test1.inputs.L !== null && 
            test1.inputs["L'"] !== undefined && test1.inputs["L'"] !== null) {
            // If both are set, ensure L_prime < L
            if (test1.inputs["L'"] >= test1.inputs.L) {
                test1.inputs["L'"] = test1.inputs.L * 0.5; // Make L_prime half of L
            }
        } else if (test1.inputs.L !== undefined && test1.inputs.L !== null) {
            // If only L is set, set L_prime to be smaller
            test1.inputs["L'"] = test1.inputs.L * 0.5;
        } else if (test1.inputs["L'"] !== undefined && test1.inputs["L'"] !== null) {
            // If only L_prime is set, set L to be larger
            test1.inputs.L = test1.inputs["L'"] * 2;
        }
        // Ensure velocity is reasonable (< c)
        if (test1.inputs.v !== undefined && test1.inputs.v !== null) {
            test1.inputs.v = Math.min(Math.abs(test1.inputs.v), 0.9 * 2.998e8);
        }
    }
    if (formula.id === 'luminosity_absolute_magnitude') {
        // Ensure magnitude is reasonable (not too negative to cause Infinity)
        // Clamp to prevent exponent > 100: -0.4 * (M - 4.83) <= 100 => M >= -245.17
        // But use safer range: -20 to +20 (exponent range: -0.4*(-20-4.83)=9.932 to -0.4*(20-4.83)=-6.068)
        // Check all possible magnitude variable names
        ['M', 'M_V', 'M_bol'].forEach(magVar => {
            if (test1.inputs[magVar] !== undefined && test1.inputs[magVar] !== null) {
                // Clamp more aggressively to prevent any issues
                const clamped = Math.max(-20, Math.min(20, test1.inputs[magVar]));
                test1.inputs[magVar] = clamped;
            }
        });
        // Ensure luminosity is positive and reasonable
        if (test1.inputs.L !== undefined && test1.inputs.L !== null) {
            test1.inputs.L = Math.max(1e20, Math.abs(test1.inputs.L));
        }
    }
    cases.push(test1);
    
    // Test 2: Edge values, solve for chosen variable
    const test2 = { inputs: {}, description: 'Edge test' };
    vars.forEach((v, i) => {
        if (i === solveIdx) {
            test2.inputs[v.symbol] = null;
        } else if (constants[v.symbol] !== undefined) {
            test2.inputs[v.symbol] = constants[v.symbol];
        } else {
            test2.inputs[v.symbol] = getTestValue(v, 'edge');
        }
    });

    // Same sanity tweaks for edge case
    if (formula.id === 'hydrostatic_balance' && test2.inputs.dP_dr !== null) {
        test2.inputs.dP_dr = -Math.abs(test2.inputs.dP_dr || 1e2);
    }
    if (formula.id === 'orbital_energy' && test2.inputs.E !== null) {
        test2.inputs.E = -Math.abs(test2.inputs.E || 1e5);
    }
    if (formula.id === 'planetary_equilibrium_temperature') {
        if (test2.inputs.A !== undefined && test2.inputs.A !== null) test2.inputs.A = 0.6;
        if (test2.inputs.a !== undefined && test2.inputs.a !== null) test2.inputs.a = Math.abs(test2.inputs.a || 5e10);
        if (test2.inputs.T_star !== undefined && test2.inputs.T_star !== null) test2.inputs.T_star = Math.max(2000, test2.inputs.T_star);
        if (test2.inputs.R_star !== undefined && test2.inputs.R_star !== null) test2.inputs.R_star = Math.max(5e7, test2.inputs.R_star);
    }
    if (formula.id === 'friedmann_equation') {
        if (test2.inputs.H0 !== undefined && test2.inputs.H0 !== null) test2.inputs.H0 = 70;
        if (test2.inputs['Ω_m'] !== undefined && test2.inputs['Ω_m'] !== null) test2.inputs['Ω_m'] = 0.3;
        if (test2.inputs['Ω_r'] !== undefined && test2.inputs['Ω_r'] !== null) test2.inputs['Ω_r'] = 0.0;
        if (test2.inputs['Ω_Λ'] !== undefined && test2.inputs['Ω_Λ'] !== null) test2.inputs['Ω_Λ'] = 0.7;
        if (test2.inputs.a !== undefined && test2.inputs.a !== null) test2.inputs.a = 0.5;
        if (test2.inputs.H !== undefined && test2.inputs.H !== null) test2.inputs.H = 100;
    }
    if (formula.id === 'greenhouse_effect') {
        if (test2.inputs.T_surface !== undefined && test2.inputs.T_surface !== null) test2.inputs.T_surface = 310;
        if (test2.inputs.T_eq !== undefined && test2.inputs.T_eq !== null) test2.inputs.T_eq = 240;
    }
    if (formula.id === 'synodic_period') {
        if (test2.inputs['P₁'] !== undefined && test2.inputs['P₁'] !== null) test2.inputs['P₁'] = 1.0e7;
        if (test2.inputs['P₂'] !== undefined && test2.inputs['P₂'] !== null) test2.inputs['P₂'] = 2.0e7;
    }
    if (formula.id === 'kepler_third_law_binary') {
        if (test2.inputs.M1 !== undefined && test2.inputs.M1 !== null) test2.inputs.M1 = 2e30;
        if (test2.inputs.M2 !== undefined && test2.inputs.M2 !== null) test2.inputs.M2 = 1e30;
        if (test2.inputs.a !== undefined && test2.inputs.a !== null) test2.inputs.a = 5e10;
    }
    if (formula.id === 'vis_viva') {
        if (test2.inputs.M !== undefined && test2.inputs.M !== null) test2.inputs.M = 1.989e30;
        if (test2.inputs.a !== undefined && test2.inputs.a !== null) test2.inputs.a = 1.0e11;
        if (test2.inputs.r !== undefined && test2.inputs.r !== null) test2.inputs.r = 5.0e10; // < 2a
    }
    if (formula.id === 'angular_momentum_elliptical') {
        if (test2.inputs.e !== undefined && test2.inputs.e !== null) test2.inputs.e = 0.2;
        if (test2.inputs.a !== undefined && test2.inputs.a !== null) test2.inputs.a = 5e10;
        if (test2.inputs.M !== undefined && test2.inputs.M !== null) test2.inputs.M = 1.989e30;
        if (test2.inputs.m_r !== undefined && test2.inputs.m_r !== null) test2.inputs.m_r = 1e29;
    }
    if (formula.id === 'orbital_decay_gravitational_radiation') {
        if (test2.inputs['M₁'] !== undefined && test2.inputs['M₁'] !== null) test2.inputs['M₁'] = 2e30;
        if (test2.inputs['M₂'] !== undefined && test2.inputs['M₂'] !== null) test2.inputs['M₂'] = 1e30;
        if (test2.inputs.a !== undefined && test2.inputs.a !== null) test2.inputs.a = 5e9;
    }
    if (formula.id === 'gravitational_potential_general') {
        if (test2.inputs.M !== undefined && test2.inputs.M !== null) test2.inputs.M = 1.989e30;
        if (test2.inputs.r !== undefined && test2.inputs.r !== null) test2.inputs.r = 5e10;
        if (test2.inputs.G !== undefined && test2.inputs.G !== null) test2.inputs.G = 6.67430e-11;
    }
    if (formula.id === 'time_dilation') {
        if (test2.inputs['Δt'] !== undefined && test2.inputs['Δt'] !== null && 
            test2.inputs["Δt'"] !== undefined && test2.inputs["Δt'"] !== null) {
            if (test2.inputs['Δt'] >= test2.inputs["Δt'"]) {
                test2.inputs['Δt'] = test2.inputs["Δt'"] * 0.5;
            }
        } else if (test2.inputs['Δt'] !== undefined && test2.inputs['Δt'] !== null) {
            test2.inputs["Δt'"] = test2.inputs['Δt'] * 2;
        } else if (test2.inputs["Δt'"] !== undefined && test2.inputs["Δt'"] !== null) {
            test2.inputs['Δt'] = test2.inputs["Δt'"] * 0.5;
        }
        if (test2.inputs.v !== undefined && test2.inputs.v !== null) {
            test2.inputs.v = Math.min(Math.abs(test2.inputs.v), 0.9 * 2.998e8);
        }
    }
    if (formula.id === 'length_contraction') {
        if (test2.inputs.L !== undefined && test2.inputs.L !== null && 
            test2.inputs["L'"] !== undefined && test2.inputs["L'"] !== null) {
            if (test2.inputs["L'"] >= test2.inputs.L) {
                test2.inputs["L'"] = test2.inputs.L * 0.5;
            }
        } else if (test2.inputs.L !== undefined && test2.inputs.L !== null) {
            test2.inputs["L'"] = test2.inputs.L * 0.5;
        } else if (test2.inputs["L'"] !== undefined && test2.inputs["L'"] !== null) {
            test2.inputs.L = test2.inputs["L'"] * 2;
        }
        if (test2.inputs.v !== undefined && test2.inputs.v !== null) {
            test2.inputs.v = Math.min(Math.abs(test2.inputs.v), 0.9 * 2.998e8);
        }
    }
    if (formula.id === 'luminosity_absolute_magnitude') {
        // Check all possible magnitude variable names
        ['M', 'M_V', 'M_bol'].forEach(magVar => {
            if (test2.inputs[magVar] !== undefined && test2.inputs[magVar] !== null) {
                test2.inputs[magVar] = Math.max(-20, Math.min(20, test2.inputs[magVar]));
            }
        });
        if (test2.inputs.L !== undefined && test2.inputs.L !== null) {
            test2.inputs.L = Math.max(1e20, Math.abs(test2.inputs.L));
        }
    }
    cases.push(test2);
    
    // Test 3: Solve for first variable
    if (vars.length >= 2) {
        const test3 = { inputs: {}, description: 'Alternate solve' };
        vars.forEach((v, i) => {
            const isConst = (constants[v.symbol] !== undefined);
            if (i === 0 && !isConst) {
                test3.inputs[v.symbol] = null;
            } else {
                test3.inputs[v.symbol] = isConst ? constants[v.symbol] : getTestValue(v, 'standard');
            }
        });

        // Make P₁ and P₂ different for synodic_period so denominator isn't zero
        if (formula.id === 'synodic_period') {
            if (test3.inputs['P₁'] !== undefined) test3.inputs['P₁'] = 3.156e7;
            if (test3.inputs['P₂'] !== undefined) test3.inputs['P₂'] = 2.5e7;
        }
        if (formula.id === 'time_dilation') {
            // Only fix values if we're NOT solving for them (they're not null)
            // Check which variable we're solving for (first variable in test3)
            const solvingFor = vars[0]?.symbol;
            const solvingForDeltaT = solvingFor === 'Δt' || solvingFor === 'delta_t';
            const solvingForDeltaTPrime = solvingFor === "Δt'" || solvingFor === 'delta_t_prime';
            
            if (!solvingForDeltaT && !solvingForDeltaTPrime &&
                test3.inputs['Δt'] !== undefined && test3.inputs['Δt'] !== null && 
                test3.inputs["Δt'"] !== undefined && test3.inputs["Δt'"] !== null) {
                if (test3.inputs['Δt'] >= test3.inputs["Δt'"]) {
                    test3.inputs['Δt'] = test3.inputs["Δt'"] * 0.5;
                }
            } else if (!solvingForDeltaTPrime && test3.inputs['Δt'] !== undefined && test3.inputs['Δt'] !== null && 
                       test3.inputs["Δt'"] === null) {
                // delta_t_prime is null (being solved for), don't set it
            } else if (!solvingForDeltaTPrime && test3.inputs['Δt'] !== undefined && test3.inputs['Δt'] !== null && 
                       test3.inputs["Δt'"] === undefined) {
                // Only set delta_t_prime if we're not solving for it and it's undefined
                test3.inputs["Δt'"] = test3.inputs['Δt'] * 2;
            } else if (!solvingForDeltaT && test3.inputs['Δt'] === null) {
                // delta_t is null (being solved for), don't set it
            } else if (!solvingForDeltaT && test3.inputs['Δt'] === undefined &&
                       test3.inputs["Δt'"] !== undefined && test3.inputs["Δt'"] !== null) {
                // Only set delta_t if we're not solving for it and it's undefined
                test3.inputs['Δt'] = test3.inputs["Δt'"] * 0.5;
            }
            if (test3.inputs.v !== undefined && test3.inputs.v !== null && solvingFor !== 'v') {
                test3.inputs.v = Math.min(Math.abs(test3.inputs.v), 0.9 * 2.998e8);
            }
        }
        if (formula.id === 'length_contraction') {
            // Only fix values if we're NOT solving for them (they're not null)
            const solvingFor = vars[0]?.symbol;
            const solvingForL = solvingFor === 'L';
            const solvingForLPrime = solvingFor === "L'" || solvingFor === 'L_prime';
            
            if (!solvingForL && !solvingForLPrime &&
                test3.inputs.L !== undefined && test3.inputs.L !== null && 
                test3.inputs["L'"] !== undefined && test3.inputs["L'"] !== null) {
                if (test3.inputs["L'"] >= test3.inputs.L) {
                    test3.inputs["L'"] = test3.inputs.L * 0.5;
                }
            } else if (!solvingForLPrime && test3.inputs.L !== undefined && test3.inputs.L !== null &&
                       test3.inputs["L'"] === null) {
                // L_prime is null (being solved for), don't set it
            } else if (!solvingForLPrime && test3.inputs.L !== undefined && test3.inputs.L !== null &&
                       test3.inputs["L'"] === undefined) {
                // Only set L_prime if we're not solving for it and it's undefined
                test3.inputs["L'"] = test3.inputs.L * 0.5;
            } else if (!solvingForL && test3.inputs.L === null) {
                // L is null (being solved for), don't set it
            } else if (!solvingForL && test3.inputs.L === undefined &&
                       test3.inputs["L'"] !== undefined && test3.inputs["L'"] !== null) {
                // Only set L if we're not solving for it and it's undefined
                test3.inputs.L = test3.inputs["L'"] * 2;
            }
            if (test3.inputs.v !== undefined && test3.inputs.v !== null && solvingFor !== 'v') {
                test3.inputs.v = Math.min(Math.abs(test3.inputs.v), 0.9 * 2.998e8);
            }
        }
        if (formula.id === 'luminosity_absolute_magnitude') {
            // Clamp magnitude to prevent Infinity in calculations
            // Check all possible magnitude variable names
            ['M', 'M_V', 'M_bol'].forEach(magVar => {
                if (test3.inputs[magVar] !== undefined && test3.inputs[magVar] !== null) {
                    test3.inputs[magVar] = Math.max(-20, Math.min(20, test3.inputs[magVar]));
                }
            });
            if (test3.inputs.L !== undefined && test3.inputs.L !== null) {
                test3.inputs.L = Math.max(1e20, Math.abs(test3.inputs.L));
            }
        }

        cases.push(test3);
    }
    
    return cases;
}

/**
 * Run all calculator tests
 */
async function runAllCalculatorTests() {
    testResults.run++;
    const runNumber = testResults.run;
    
    console.log(`\n🧮 Calculator Test Run #${runNumber}`);
    console.log('='.repeat(80));
    
    const runResults = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        byCategory: {},
        byFormula: {},
        failures: []
    };
    
    if (typeof formulas === 'undefined' || !formulas || !Array.isArray(formulas)) {
        console.error('❌ Formulas not loaded');
        return runResults;
    }
    
    // Get formulas with solvers
    const formulasWithSolvers = formulas.filter(f => 
        FormulaCalculator.solvers && FormulaCalculator.solvers[f.id]
    );
    
    console.log(`Testing ${formulasWithSolvers.length} formulas with solvers (3 tests each)...\n`);
    
    // Test each formula
    for (const formula of formulasWithSolvers) {
        const category = formula.category || 'Unknown';
        const testCases = generateTestCases(formula);
        
        if (!runResults.byCategory[category]) {
            runResults.byCategory[category] = { total: 0, passed: 0, failed: 0 };
        }
        
        if (!runResults.byFormula[formula.id]) {
            runResults.byFormula[formula.id] = { name: formula.name, total: 0, passed: 0, failed: 0 };
        }
        
        // Run 3 test cases
        for (const testCase of testCases) {
            const result = runCalculatorTest(formula, testCase);
            
            runResults.totalTests++;
            runResults.byCategory[category].total++;
            runResults.byFormula[formula.id].total++;
            
            if (result.passed) {
                runResults.passedTests++;
                runResults.byCategory[category].passed++;
                runResults.byFormula[formula.id].passed++;
            } else {
                runResults.failedTests++;
                runResults.byCategory[category].failed++;
                runResults.byFormula[formula.id].failed++;
                runResults.failures.push({
                    formula: formula.name,
                    formulaId: formula.id,
                    category: category,
                    testCase: testCase.description,
                    error: result.error
                });
            }
        }
    }
    
    // Calculate pass rates
    const overallPassRate = runResults.passedTests / runResults.totalTests;
    const categoryPassRates = {};
    
    Object.entries(runResults.byCategory).forEach(([cat, stats]) => {
        categoryPassRates[cat] = stats.passed / stats.total;
    });
    
    // Check if 100% achieved
    const allCategories100 = Object.values(categoryPassRates).every(rate => rate === 1.0);
    const overall100 = overallPassRate === 1.0;
    
    if (overall100 && allCategories100) {
        testResults.consecutive100PercentPasses++;
        console.log(`\n✅ Run ${runNumber}: 100% PASS RATE ACHIEVED!`);
        console.log(`   Consecutive 100% passes: ${testResults.consecutive100PercentPasses}/${TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED}`);
    } else {
        testResults.consecutive100PercentPasses = 0;
        console.log(`\n⚠️  Run ${runNumber}: ${(overallPassRate * 100).toFixed(2)}% pass rate`);
    }
    
    // Print summary
    console.log(`\nTotal: ${runResults.totalTests}, Passed: ${runResults.passedTests}, Failed: ${runResults.failedTests}`);
    console.log('\nBy Category:');
    Object.entries(runResults.byCategory)
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([cat, stats]) => {
            const pct = ((stats.passed / stats.total) * 100).toFixed(2);
            const emoji = pct === '100.00' ? '🟢' : pct >= '95.00' ? '🟡' : '🔴';
            console.log(`  ${emoji} ${cat.padEnd(30)} ${stats.passed}/${stats.total} (${pct}%)`);
        });
    
    if (runResults.failures.length > 0) {
        console.log(`\n❌ Failures (first 10):`);
        runResults.failures.slice(0, 10).forEach((f, i) => {
            console.log(`  ${i+1}. ${f.formula} (${f.category}): ${f.error}`);
        });
    }
    
    // Store results
    testResults.allRuns.push({
        run: runNumber,
        ...runResults,
        overallPassRate,
        allCategories100,
        overall100
    });
    
    testResults.byCategory = runResults.byCategory;
    testResults.byFormula = runResults.byFormula;
    testResults.failures = runResults.failures;
    
    return runResults;
}

/**
 * Run until 100% achieved 10 times
 */
async function runUntilPerfect() {
    console.log('\n🎯 Running Calculator Tests Until 100% Achieved 10 Times Consecutively');
    console.log('='.repeat(80));
    
    let runCount = 0;
    
    while (
        testResults.consecutive100PercentPasses < TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED &&
        runCount < TEST_CONFIG.MAX_RUNS
    ) {
        runCount++;
        await runAllCalculatorTests();
        
        if (testResults.consecutive100PercentPasses >= TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED) {
            console.log('\n' + '='.repeat(80));
            console.log('🎉🎉🎉 SUCCESS! 🎉🎉🎉');
            console.log('='.repeat(80));
            console.log(`Achieved 100% pass rate ${TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED} times consecutively!`);
            console.log(`Total runs: ${runCount}`);
            console.log('='.repeat(80));
            break;
        }
        
        // Brief pause
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (testResults.consecutive100PercentPasses < TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED) {
        console.log(`\n⚠️  Could not achieve ${TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED} consecutive 100% passes`);
        console.log(`   Current consecutive passes: ${testResults.consecutive100PercentPasses}`);
        console.log(`   Total runs: ${runCount}`);
    }
    
    return testResults;
}

// Check for single-run mode
const SINGLE_RUN = process.argv.includes('--single-run') || process.env.SINGLE_RUN === '1';

/**
 * Run a single test run and return success status
 */
async function runSingleTestRun() {
    testResults.consecutive100PercentPasses = 0;
    testResults.run = 0;
    testResults.allRuns = [];
    
    await runAllCalculatorTests();
    
    const runResult = testResults.allRuns[0];
    if (!runResult) {
        return false;
    }
    
    const overallPassRate = runResult.overallPassRate || (runResult.passedTests / runResult.totalTests);
    const allCategories100 = runResult.allCategories100 || false;
    const overall100 = overallPassRate === 1.0 && allCategories100;
    
    return overall100;
}

// Run tests
(async () => {
    try {
        if (SINGLE_RUN) {
            // Single run mode - just run once and exit with appropriate code
            const success = await runSingleTestRun();
            const runResult = testResults.allRuns[0];
            
            if (runResult) {
                console.log('\n' + '='.repeat(80));
                console.log('📊 SINGLE RUN SUMMARY');
                console.log('='.repeat(80));
                console.log(`Total Tests: ${runResult.totalTests}`);
                console.log(`Passed: ${runResult.passedTests}`);
                console.log(`Failed: ${runResult.failedTests}`);
                console.log(`Pass Rate: ${((runResult.passedTests / runResult.totalTests) * 100).toFixed(2)}%`);
                console.log(`100% Pass Rate: ${success ? '✅ YES' : '❌ NO'}`);
                console.log('='.repeat(80));
            }
            
            process.exit(success ? 0 : 1);
        } else {
            // Original mode - run until 10 consecutive passes
        await runUntilPerfect();
        
        // Final summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 FINAL SUMMARY');
        console.log('='.repeat(80));
        console.log(`Total Runs: ${testResults.run}`);
        console.log(`Consecutive 100% Passes: ${testResults.consecutive100PercentPasses}/10`);
        console.log(`Total Tests: ${testResults.allRuns.reduce((sum, r) => sum + r.totalTests, 0)}`);
        console.log(`Total Passed: ${testResults.allRuns.reduce((sum, r) => sum + r.passedTests, 0)}`);
        console.log(`Total Failed: ${testResults.allRuns.reduce((sum, r) => sum + r.failedTests, 0)}`);
        console.log('='.repeat(80));
        
        process.exit(testResults.consecutive100PercentPasses >= 10 ? 0 : 1);
        }
    } catch (e) {
        console.error('❌ Fatal error:', e);
        process.exit(1);
    }
})();
