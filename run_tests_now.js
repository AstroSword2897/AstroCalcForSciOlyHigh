/**
 * Quick Test Runner - Executes calculator tests immediately
 * Run this in browser console on the test page
 */

// Check if we're in browser
if (typeof window === 'undefined') {
    console.log('This script must be run in a browser console');
    process.exit(1);
}

console.log('🧪 QUICK TEST RUNNER');
console.log('='.repeat(80));
console.log('');

// Check if test functions are available
if (typeof runCalculatorOnly === 'function') {
    console.log('✅ Found runCalculatorOnly() function');
    console.log('🚀 Starting calculator tests...\n');
    runCalculatorOnly();
} else if (typeof CalculatorTestRunner !== 'undefined' && CalculatorTestRunner.runUntilPerfect) {
    console.log('✅ Found CalculatorTestRunner.runUntilPerfect()');
    console.log('🚀 Starting calculator tests...\n');
    CalculatorTestRunner.runUntilPerfect();
} else if (typeof CalculatorTestSuite !== 'undefined' && CalculatorTestSuite.runUntilPerfect) {
    console.log('✅ Found CalculatorTestSuite.runUntilPerfect()');
    console.log('🚀 Starting calculator tests...\n');
    CalculatorTestSuite.runUntilPerfect();
} else {
    console.log('❌ Test functions not available');
    console.log('Available functions:');
    console.log('  - runCalculatorOnly:', typeof runCalculatorOnly);
    console.log('  - CalculatorTestRunner:', typeof CalculatorTestRunner);
    console.log('  - CalculatorTestSuite:', typeof CalculatorTestSuite);
    console.log('\n💡 Make sure you are on the test page:');
    console.log('   http://localhost:8000/tests/run_production_tests.html');
}
