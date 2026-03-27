/**
 * Test Suite: Numeric Calculation Verification
 * Tests that the calculator computes numeric results (not just symbolic) when variables are provided
 */

// Test utilities
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertApproxEqual(actual, expected, tolerance, message) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
        throw new Error(`Assertion failed: ${message}\n  Expected: ${expected} ± ${tolerance}\n  Actual: ${actual}\n  Difference: ${diff}`);
    }
}

// Load formulas
let formulas;
let FormulaCalculator;
let UnitConverter;
let SafeExpressionEvaluator;

if (typeof window !== 'undefined') {
    // Browser environment
    formulas = window.formulas || window.globalFormulas;
    FormulaCalculator = window.FormulaCalculator;
    UnitConverter = window.UnitConverter;
    SafeExpressionEvaluator = window.SafeExpressionEvaluator;
} else {
    // Node.js environment - would need to import
    console.log('Node.js environment - formulas need to be loaded');
}

/**
 * Test cases for numeric calculation
 */
const TEST_CASES = [
    {
        name: 'Period-Luminosity Relation (Cepheid)',
        description: 'M_V = -2.76 * log10(P) - 1.4, with P = 2',
        formulaId: 'period_luminosity_relation',
        inputs: { P: 2 },
        expectedUnknown: 'M_V',
        expectedValue: -2.76 * Math.log10(2) - 1.4,
        tolerance: 0.01
    },
    {
        name: 'Distance Modulus',
        description: 'μ = 5 * log10(d) - 5, with d = 10 pc',
        formulaId: 'distance_modulus',
        inputs: { d: 10 },
        expectedUnknown: 'μ',
        expectedValue: 5 * Math.log10(10) - 5, // Should be 0
        tolerance: 0.01
    },
    {
        name: 'Magnitude-Flux Relation',
        description: 'm1 = m2 - 2.5 * log10(F1/F2)',
        formulaId: 'magnitude_flux_relation',
        inputs: { m2: 1, F1: 100, F2: 50 },
        expectedUnknown: 'm1',
        expectedValue: 1 - 2.5 * Math.log10(100/50), // 1 - 2.5 * log10(2)
        tolerance: 0.01
    },
    {
        name: 'Kepler\'s Third Law (Simple)',
        description: 'P² = (4π²/GM) * a³, solve for P',
        formulaId: 'kepler_third_law',
        inputs: { M: 1.989e30, a: 1.496e11 },
        expectedUnknown: 'P',
        expectedValue: Math.sqrt((4 * Math.PI * Math.PI / (6.67430e-11 * 1.989e30)) * Math.pow(1.496e11, 3)),
        tolerance: 1000 // Seconds - large tolerance for orbital period
    }
];

/**
 * Run a single test case
 */
function runTest(testCase) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`   ${testCase.description}`);
    
    if (!formulas || !FormulaCalculator) {
        console.error('   ❌ Formulas or FormulaCalculator not available');
        return { pass: false, error: 'Dependencies not loaded' };
    }
    
    // Find the formula
    const formula = formulas.find(f => f.id === testCase.formulaId);
    if (!formula) {
        console.error(`   ❌ Formula not found: ${testCase.formulaId}`);
        return { pass: false, error: `Formula ${testCase.formulaId} not found` };
    }
    
    console.log(`   📝 Formula: ${formula.name || formula.id}`);
    console.log(`   📝 Equation: ${formula.equation || formula.formula}`);
    
    try {
        // Create calculator
        const calculator = new FormulaCalculator(formula, {
            unitConverter: UnitConverter ? new UnitConverter() : null,
            mathEvaluator: SafeExpressionEvaluator || null
        });
        
        // Prepare variable values (set known values, leave unknown as null)
        const variableValues = {};
        for (const varDef of formula.variables) {
            if (testCase.inputs[varDef.symbol] !== undefined) {
                variableValues[varDef.symbol] = testCase.inputs[varDef.symbol];
                console.log(`   ✅ Input: ${varDef.symbol} = ${testCase.inputs[varDef.symbol]}`);
            } else {
                variableValues[varDef.symbol] = null;
            }
        }
        
        // Solve
        console.log(`   🔍 Solving for ${testCase.expectedUnknown}...`);
        const result = calculator.solve(variableValues);
        
        console.log(`   📊 Result:`, result);
        console.log(`   📊 Result type:`, typeof result?.result);
        console.log(`   📊 Is symbolic:`, result?.isSymbolic);
        
        // Validate result
        if (!result) {
            return { pass: false, error: 'No result returned' };
        }
        
        if (result.isSymbolic) {
            console.error(`   ❌ Result is symbolic, not numeric!`);
            console.error(`   Result: ${result.result}`);
            return { pass: false, error: 'Result is symbolic instead of numeric', result };
        }
        
        if (typeof result.result !== 'number') {
            console.error(`   ❌ Result is not a number! Type: ${typeof result.result}`);
            return { pass: false, error: `Result is not a number: ${result.result}`, result };
        }
        
        if (!Number.isFinite(result.result)) {
            console.error(`   ❌ Result is not finite: ${result.result}`);
            return { pass: false, error: `Result is not finite: ${result.result}`, result };
        }
        
        // Check if solved for correct variable
        const solvedFor = result.solvedFor || result.variable;
        if (solvedFor !== testCase.expectedUnknown) {
            console.warn(`   ⚠️ Solved for ${solvedFor}, expected ${testCase.expectedUnknown}`);
        }
        
        // Compare with expected value
        const actual = result.result;
        const expected = testCase.expectedValue;
        const diff = Math.abs(actual - expected);
        const tolerance = testCase.tolerance;
        
        console.log(`   📈 Expected: ${expected}`);
        console.log(`   📈 Actual: ${actual}`);
        console.log(`   📈 Difference: ${diff}`);
        console.log(`   📈 Tolerance: ${tolerance}`);
        
        if (diff <= tolerance) {
            console.log(`   ✅ PASS: Result matches expected value within tolerance`);
            return { pass: true, actual, expected, diff };
        } else {
            console.error(`   ❌ FAIL: Result does not match expected value`);
            console.error(`   Expected: ${expected} ± ${tolerance}`);
            console.error(`   Actual: ${actual}`);
            console.error(`   Difference: ${diff} (exceeds tolerance of ${tolerance})`);
            return { pass: false, actual, expected, diff, tolerance, error: 'Result outside tolerance' };
        }
        
    } catch (error) {
        console.error(`   ❌ Error during calculation:`, error);
        return { pass: false, error: error.message, stack: error.stack };
    }
}

/**
 * Run all tests
 */
function runAllTests() {
    console.log('🧪 Starting Numeric Calculation Tests...\n');
    console.log('='.repeat(60));
    
    if (!formulas || !FormulaCalculator) {
        console.error('❌ Required dependencies not loaded');
        console.error('   Make sure formulas and FormulaCalculator are available');
        return { passed: 0, failed: 0, total: 0 };
    }
    
    let passed = 0;
    let failed = 0;
    const results = [];
    
    for (const testCase of TEST_CASES) {
        const result = runTest(testCase);
        results.push({ testCase, result });
        
        if (result.pass) {
            passed++;
        } else {
            failed++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed, ${TEST_CASES.length} total\n`);
    
    if (failed > 0) {
        console.log('❌ Failed Tests:');
        results.forEach(({ testCase, result }) => {
            if (!result.pass) {
                console.log(`   - ${testCase.name}: ${result.error || 'Unknown error'}`);
            }
        });
    }
    
    return { passed, failed, total: TEST_CASES.length, results };
}

// Export for use
if (typeof window !== 'undefined') {
    window.testNumericCalculation = runAllTests;
    console.log('💡 Run tests with: window.testNumericCalculation()');
} else if (typeof module !== 'undefined') {
    module.exports = { runAllTests, runTest, TEST_CASES };
}

// Auto-run if executed directly
if (typeof window !== 'undefined' && window.location && window.location.href.includes('test')) {
    // Only auto-run in test pages
    setTimeout(() => {
        if (formulas && FormulaCalculator) {
            runAllTests();
        }
    }, 1000);
}

