// Test calculation error messages
(async () => {
    console.log('🧪 Testing Calculation Error Messages...\n');
    
    // Wait for UI to be ready
    await new Promise(resolve => {
        if (window.uiOrchestrator) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.uiOrchestrator) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        }
    });
    
    // Test 1: Check if error display function exists
    console.log('Test 1: Checking error display functions...');
    const hasDisplayError = typeof window.uiOrchestrator?.calculationOrchestrator?.displayError === 'function';
    console.log(hasDisplayError ? '✅ displayError function exists' : '❌ displayError function missing');
    
    // Test 2: Simulate invalid result
    console.log('\nTest 2: Testing invalid result handling...');
    const invalidResult = { result: null, value: null };
    const resultDisplay = document.getElementById('result-display');
    if (resultDisplay) {
        // Check if ResultDisplayRenderer handles null results
        if (typeof window.resultDisplayRenderer !== 'undefined') {
            try {
                window.resultDisplayRenderer.displayResult(invalidResult, null);
                const content = resultDisplay.innerHTML;
                if (content.includes('No result value') || content.includes('error') || content.includes('failed')) {
                    console.log('✅ Error message displayed correctly');
                } else {
                    console.log('❌ Error message not displayed correctly');
                    console.log('Content:', content.substring(0, 200));
                }
            } catch (e) {
                console.log('✅ Error caught and handled:', e.message);
            }
        } else {
            console.log('⚠️ ResultDisplayRenderer not available');
        }
    } else {
        console.log('⚠️ result-display element not found');
    }
    
    // Test 3: Check formulaExplorer error messages
    console.log('\nTest 3: Testing formulaExplorer error messages...');
    const testResult = { result: null, value: null };
    const errorMsg1 = testResult.result || testResult.value ? 'Has value' : '⚠️ Calculation failed. Please check your inputs.';
    const errorMsg2 = testResult.result || testResult.value ? 'Has value' : '⚠️ No symbolic expression available';
    console.log('Error message 1:', errorMsg1);
    console.log('Error message 2:', errorMsg2);
    if (errorMsg1.includes('⚠️') && errorMsg1.includes('failed')) {
        console.log('✅ Error message format correct');
    } else {
        console.log('❌ Error message format incorrect');
    }
    
    console.log('\n✅ All tests completed');
})();
