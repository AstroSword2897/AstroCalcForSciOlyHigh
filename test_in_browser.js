/**
 * Quick test script to run in browser console
 * Copy and paste this into the browser console on the main page (localhost:8000)
 */

async function testNumericCalculation() {
    console.log('🧪 Testing Numeric Calculation...\n');
    
    // Find the period-luminosity formula
    const formula = formulas.find(f => f.id === 'period_luminosity_relation_cepheid');
    if (!formula) {
        console.error('❌ Formula not found');
        return;
    }
    
    console.log(`✅ Found formula: ${formula.name}`);
    console.log(`Equation: ${formula.equation}\n`);
    
    // Create calculator
    const calculator = new FormulaCalculator(formula, {
        unitConverter: UnitConverter ? new UnitConverter() : null,
        mathEvaluator: SafeExpressionEvaluator || null
    });
    
    // Test with P = 2
    const period = 2;
    const variableValues = {
        P: period,
        M_V: null
    };
    
    console.log(`Input: P = ${period}`);
    console.log(`Solving for M_V...\n`);
    
    try {
        const result = calculator.solve(variableValues);
        
        console.log('Result object:', result);
        console.log(`Result type: ${typeof result?.result}`);
        console.log(`Is symbolic: ${result?.isSymbolic}`);
        console.log(`Result value: ${result?.result}\n`);
        
        // Check if numeric
        if (result.isSymbolic) {
            console.error('❌ FAIL: Result is SYMBOLIC (not numeric)');
            console.error(`Result: ${result.result}`);
            return false;
        }
        
        if (typeof result.result !== 'number') {
            console.error(`❌ FAIL: Result is not a number! Type: ${typeof result.result}`);
            console.error(`Result: ${result.result}`);
            return false;
        }
        
        // Calculate expected
        const expected = -2.76 * Math.log10(period) - 1.4;
        const actual = result.result;
        const diff = Math.abs(actual - expected);
        const tolerance = 0.01;
        
        console.log(`Expected: ${expected.toFixed(4)}`);
        console.log(`Actual: ${actual.toFixed(4)}`);
        console.log(`Difference: ${diff.toFixed(4)}`);
        console.log(`Tolerance: ${tolerance}\n`);
        
        if (diff <= tolerance) {
            console.log('✅ PASS: Result matches expected value!');
            return true;
        } else {
            console.error(`❌ FAIL: Result does not match (difference ${diff} exceeds tolerance ${tolerance})`);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error(error.stack);
        return false;
    }
}

// Run test
console.log('💡 Run: testNumericCalculation()');
console.log('Or call it directly:');
testNumericCalculation();

