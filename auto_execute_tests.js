/**
 * Auto-execute tests until 100% x10
 * Run this in browser console on the test page
 */

(async function autoExecuteTests() {
    console.log('🚀 AUTO-EXECUTING TESTS UNTIL 100% x10');
    console.log('='.repeat(80));
    
    // Wait for page to fully load
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if test functions are available
    if (typeof runCalculatorOnly === 'function') {
        console.log('✅ Found runCalculatorOnly function, executing...');
        runCalculatorOnly();
    } else if (typeof CalculatorTestRunner !== 'undefined') {
        console.log('✅ Found CalculatorTestRunner, executing...');
        await CalculatorTestRunner.runUntilPerfect();
    } else if (typeof CalculatorTestSuite !== 'undefined') {
        console.log('✅ Found CalculatorTestSuite, executing...');
        await CalculatorTestSuite.runUntilPerfect();
    } else {
        console.error('❌ Test functions not found!');
        console.log('Available:', {
            runCalculatorOnly: typeof runCalculatorOnly,
            CalculatorTestRunner: typeof CalculatorTestRunner,
            CalculatorTestSuite: typeof CalculatorTestSuite
        });
    }
})();
