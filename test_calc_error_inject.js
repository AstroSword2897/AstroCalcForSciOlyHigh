// Test script to inject into browser
(async () => {
    console.log('🧪 Testing Calculation Error Messages...\n');
    
    // Wait for UI
    await new Promise(r => setTimeout(r, 2000));
    
    // Test 1: Check ResultDisplayRenderer with null result
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
                    return true;
                } else {
                    console.log('❌ Test 1 FAILED: No error message found');
                    console.log('Full content:', content);
                    return false;
                }
            } else {
                console.log('⚠️ result-display element not found');
                return false;
            }
        } catch (e) {
            console.log('✅ Test 1 PASSED: Error caught:', e.message);
            return true;
        }
    } else {
        console.log('⚠️ ResultDisplayRenderer not available');
        return false;
    }
})();
