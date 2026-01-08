/**
 * Comprehensive Formula Calculation Test
 * Tests every formula card to ensure calculations work correctly
 * Run: node scripts/tools/testAllFormulas.js
 */

import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load formulas
function loadFormulas() {
    const formulasPath = path.resolve(__dirname, '../../scripts/formulas.js');
    const code = fs.readFileSync(formulasPath, 'utf8');
    const sandbox = { 
        window: {}, 
        console, 
        formulas: undefined, 
        formulaCategories: undefined,
        module: { exports: {} },
        exports: {},
        require: () => ({}),
        Math: Math,
        globalConstants: {}
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { timeout: 15000 });
    
    if (!sandbox.formulas || !Array.isArray(sandbox.formulas)) {
        throw new Error('Failed to load formulas from formulas.js');
    }
    return sandbox.formulas;
}

// Load calculator
function loadCalculator() {
    const calculatorPath = path.resolve(__dirname, '../../scripts/calculator.js');
    const code = fs.readFileSync(calculatorPath, 'utf8');
    const sandbox = { 
        window: { FormulaCalculator: undefined }, 
        console, 
        FormulaCalculator: undefined,
        module: { exports: {} },
        exports: {},
        require: () => ({}),
        Math: Math,
        performance: { now: () => Date.now() }
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { timeout: 15000 });
    
    // Check both window.FormulaCalculator and direct FormulaCalculator
    const FormulaCalculator = sandbox.window?.FormulaCalculator || sandbox.FormulaCalculator;
    
    if (!FormulaCalculator) {
        throw new Error('Failed to load FormulaCalculator from calculator.js');
    }
    return FormulaCalculator;
}

// Generate test inputs for a formula
function generateTestInputs(formula) {
    const inputs = {};
    
    // Common physics test values
    const testValues = {
        'm': 1.0, 'M': 5.97e24, 'r': 6.37e6, 'R': 6.37e6, 'a': 1.5e11,
        'T': 86400, 'P': 86400, 'v': 1000, 'c': 2.99792458e8,
        'G': 6.67430e-11, 'h': 6.62607015e-34, 'k': 1.380649e-23,
        'L': 3.828e26, 'F': 1361, 'd': 1.5e11, 'D': 1.5e11,
        'λ': 500e-9, 'f': 5e14, 'ν': 5e14, 'E': 1e-19,
        't': 3600, 'θ': 0.1, 'α': 0.3, 'T_surf': 5778,
        'n': 1e6, 'V': 1e9, 'σ': 5.670374e-8, 'b': 2.897771e-3,
        'z': 0.1, 'H0': 70e3, 'M_sun': 1.989e30, 'R_sun': 6.96e8,
        'M_earth': 5.97e24, 'R_earth': 6.37e6, 'AU': 1.496e11,
        'm1': 1.989e30, 'm2': 5.97e24, 'r1': 1.5e11, 'r2': 1.5e11,
        'A': 0.3, 'T_eq': 255, 'T_eff': 5778, 'L_sun': 3.828e26,
        'f': 0.1, 'D': 0.1, 'θ_min': 1e-6, 'M': 5, 'm': 10,
        'B': 1e-5, 'I': 1e-6, 'N': 1e23, 'ρ': 1e3, 'p': 1e5,
        'V_esc': 11186, 'ω': 7.292e-5, 'τ': 1e6, 'η': 0.1,
        'Q': 1e6, 'S': 1361, 'ε': 0.9, 'κ': 0.1, 'μ': 1.67e-27
    };
    
    // Fill in known values, leave one variable empty for solving
    let filledCount = 0;
    const variables = formula.variables || [];
    
    for (const variable of variables) {
        const symbol = variable.symbol;
        
        // Skip constants
        if (formula.constants && formula.constants[symbol]) {
            continue;
        }
        
        // Use test value if available
        if (testValues[symbol] !== undefined) {
            inputs[symbol] = testValues[symbol];
            filledCount++;
        } else if (variable.defaultValue !== undefined && variable.defaultValue !== null) {
            inputs[symbol] = variable.defaultValue;
            filledCount++;
        } else if (!variable.required) {
            // Optional variable - skip
            continue;
        }
    }
    
    // If all variables filled and we have more than 1, remove one to test solving
    if (filledCount === variables.length && variables.length > 1) {
        // Find a required variable to remove (for solving)
        const requiredVars = variables.filter(v => v.required);
        if (requiredVars.length > 1) {
            const lastVar = requiredVars[requiredVars.length - 1];
            delete inputs[lastVar.symbol];
        }
    }
    
    return inputs;
}

// Main test function
async function testAllFormulas() {
    console.log('🧪 Starting Comprehensive Formula Calculation Test\n');
    
    let formulas;
    let FormulaCalculator;
    
    try {
        console.log('📦 Loading formulas...');
        formulas = loadFormulas();
        console.log(`✅ Loaded ${formulas.length} formulas\n`);
        
        console.log('📦 Loading FormulaCalculator...');
        FormulaCalculator = loadCalculator();
        console.log('✅ FormulaCalculator loaded\n');
    } catch (error) {
        console.error('❌ Failed to load dependencies:', error.message);
        process.exit(1);
    }
    
    const results = {
        total: formulas.length,
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: []
    };
    
    const constants = {
        G: 6.67430e-11,
        c: 2.99792458e8,
        h: 6.62607015e-34,
        k: 1.380649e-23,
        σ: 5.670374e-8,
        sigma: 5.670374e-8,
        b: 2.897771e-3,
        M_sun: 1.989e30,
        R_sun: 6.96e8,
        M_earth: 5.97e24,
        R_earth: 6.37e6,
        L_sun: 3.828e26,
        AU: 1.496e11,
        pi: Math.PI,
        π: Math.PI
    };
    
    console.log('🔬 Testing each formula...\n');
    
    for (let i = 0; i < formulas.length; i++) {
        const formula = formulas[i];
        const progress = `[${i + 1}/${formulas.length}]`;
        
        // Skip formulas without variables or equation
        if (!formula.variables || formula.variables.length === 0) {
            console.log(`${progress} ⏭️  ${formula.id}: No variables defined`);
            results.skipped++;
            continue;
        }
        
        if (!formula.equation) {
            console.log(`${progress} ⏭️  ${formula.id}: No equation defined`);
            results.skipped++;
            continue;
        }
        
        try {
            // Create calculator instance
            const calculator = new FormulaCalculator(formula, { constants });
            
            // Generate test inputs
            const testInputs = generateTestInputs(formula);
            
            // Validate we have some inputs
            const inputCount = Object.keys(testInputs).length;
            if (inputCount === 0 && formula.variables.some(v => v.required)) {
                console.log(`${progress} ⏭️  ${formula.id}: Could not generate test inputs`);
                results.skipped++;
                continue;
            }
            
            // Try to solve
            const result = calculator.solve(testInputs);
            
            // Verify result structure
            if (!result) {
                throw new Error('No result returned');
            }
            
            // Verify metadata
            if (!result.solvedFor) {
                throw new Error('Missing solvedFor field');
            }
            
            const solvedVar = result.solvedFor;
            const resultValue = result.result;
            
            // Verify result is valid (can be number or string for symbolic)
            if (result.isSymbolic) {
                // Symbolic result - should be a string
                if (typeof resultValue !== 'string') {
                    throw new Error(`Symbolic result should be string, got ${typeof resultValue}`);
                }
            } else {
                // Numeric result - should be a number
                if (resultValue !== null && resultValue !== undefined) {
                    if (typeof resultValue !== 'number') {
                        throw new Error(`Result value is not a number: ${typeof resultValue}`);
                    }
                    if (Number.isNaN(resultValue)) {
                        throw new Error('Result is NaN');
                    }
                    if (!Number.isFinite(resultValue)) {
                        throw new Error('Result is Infinity');
                    }
                }
            }
            
            const displayValue = result.isSymbolic 
                ? `"${resultValue}"` 
                : (resultValue !== null && resultValue !== undefined 
                    ? resultValue.toExponential(3) 
                    : 'null');
            console.log(`${progress} ✅ ${formula.id}: Solved for ${solvedVar} = ${displayValue}`);
            results.passed++;
            
        } catch (error) {
            console.log(`${progress} ❌ ${formula.id} (${formula.name}): ${error.message}`);
            results.failed++;
            results.errors.push({
                formula: formula.id,
                name: formula.name,
                error: error.message
            });
        }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Formulas:  ${results.total}`);
    console.log(`✅ Passed:       ${results.passed}`);
    console.log(`❌ Failed:       ${results.failed}`);
    console.log(`⏭️  Skipped:      ${results.skipped}`);
    console.log(`Success Rate:    ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));
    
    if (results.errors.length > 0) {
        console.log('\n❌ FAILED FORMULAS:');
        results.errors.slice(0, 20).forEach(err => {
            console.log(`  - ${err.formula} (${err.name}): ${err.error}`);
        });
        if (results.errors.length > 20) {
            console.log(`  ... and ${results.errors.length - 20} more`);
        }
    }
    
    // Exit with error code if any failures
    if (results.failed > 0) {
        process.exit(1);
    }
}

// Run tests
testAllFormulas().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

