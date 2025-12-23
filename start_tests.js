// Quick script to start tests - paste this in browser console
(function() {
    console.log('🧪 Starting Calculator Tests...');
    
    // Try different methods to start tests
    if (typeof runCalculatorOnly === 'function') {
        console.log('✅ Using runCalculatorOnly()');
        runCalculatorOnly();
    } else if (typeof CalculatorTestRunner !== 'undefined' && CalculatorTestRunner.runUntilPerfect) {
        console.log('✅ Using CalculatorTestRunner.runUntilPerfect()');
        CalculatorTestRunner.runUntilPerfect();
    } else if (typeof CalculatorTestSuite !== 'undefined' && CalculatorTestSuite.runUntilPerfect) {
        console.log('✅ Using CalculatorTestSuite.runUntilPerfect()');
        CalculatorTestSuite.runUntilPerfect();
    } else {
        console.error('❌ Test functions not available');
        console.log('Available functions:', {
            runCalculatorOnly: typeof runCalculatorOnly,
            CalculatorTestRunner: typeof CalculatorTestRunner,
            CalculatorTestSuite: typeof CalculatorTestSuite,
            runFullSuite: typeof runFullSuite
        });
        
        // Try to find the button and click it
        const btn = document.querySelector('button[onclick*="runCalculatorOnly"], button:contains("Calculator Tests")');
        if (btn) {
            console.log('✅ Found test button, clicking...');
            btn.click();
        } else {
            console.log('❌ Could not find test button');
        }
    }
})();
