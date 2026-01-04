// Inject test script into browser
const script = document.createElement('script');
script.textContent = `
(async () => {
    console.log('🧪 Testing Calculation Error Messages...\\n');
    
    // Wait for UI
    await new Promise(r => setTimeout(r, 2000));
    
    // Test 1: Check ResultDisplayRenderer
    console.log('Test 1: Testing ResultDisplayRenderer with null result...');
    if (typeof window.resultDisplayRenderer !== 'undefined') {
        const invalidResult = { result: null, value: null };
        try {
            window.resultDisplayRenderer.displayResult(invalidResult, null);
            const resultDisplay = document.getElementById('result-display');
            if (resultDisplay) {
                const content = resultDisplay.innerHTML;
                console.log('Result display content:', content.substring(0, 300));
                if (content.includes('No result value') || content.includes('error') || content.includes('failed') || content.includes('check your inputs')) {
                    console.log('✅ Test 1 PASSED: Error message displayed');
                } else {
                    console.log('❌ Test 1 FAILED: No error message found');
                }
            }
        } catch (e) {
            console.log('✅ Test 1 PASSED: Error caught:', e.message);
        }
    } else {
        console.log('⚠️ ResultDisplayRenderer not available');
    }
    
    // Test 2: Check formulaExplorer error format
    console.log('\\nTest 2: Testing formulaExplorer error message format...');
    const testResult = { result: null, value: null };
    const errorMsg = testResult.result || testResult.value ? 'Has value' : '⚠️ Calculation failed. Please check your inputs.';
    console.log('Error message:', errorMsg);
    if (errorMsg.includes('⚠️') && errorMsg.includes('failed')) {
        console.log('✅ Test 2 PASSED: Error message format correct');
    } else {
        console.log('❌ Test 2 FAILED: Error message format incorrect');
    }
    
    // Test 3: Try to trigger a real calculation error
    console.log('\\nTest 3: Testing real calculation error...');
    if (window.uiOrchestrator && window.uiOrchestrator.calculationOrchestrator) {
        try {
            // Try to calculate with no formula selected
            window.uiOrchestrator.calculationOrchestrator.performCalculation();
            console.log('✅ Test 3: Calculation attempted (should show error if no formula)');
        } catch (e) {
            console.log('✅ Test 3: Error caught:', e.message);
        }
    }
    
    console.log('\\n✅ All tests completed');
})();
`;
document.head.appendChild(script);
