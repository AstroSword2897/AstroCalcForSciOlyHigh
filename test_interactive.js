// Test script to run in browser console
(async function() {
    console.log('🧪 Starting interactive test...');
    
    // Wait for page to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find search input
    const searchInput = document.querySelector('input[placeholder*="Search"]') || 
                       document.querySelector('#main-search-input') ||
                       document.querySelector('input[type="text"]');
    
    if (!searchInput) {
        console.error('❌ Search input not found');
        return;
    }
    
    console.log('✅ Found search input');
    
    // Type search query
    searchInput.focus();
    searchInput.value = 'period luminosity cepheid';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('✅ Typed search query');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find and click the first formula card
    const formulaCards = document.querySelectorAll('.formula-card, [data-formula-id]');
    let clicked = false;
    
    for (const card of formulaCards) {
        const title = card.textContent || '';
        if (title.toLowerCase().includes('period') && title.toLowerCase().includes('luminosity')) {
            console.log('✅ Found formula card:', title);
            card.click();
            clicked = true;
            break;
        }
    }
    
    if (!clicked && formulaCards.length > 0) {
        console.log('⚠️ Clicking first formula card');
        formulaCards[0].click();
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find input field for P
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    let pInput = null;
    
    for (const input of inputs) {
        const label = input.closest('label')?.textContent || '';
        const parent = input.parentElement?.textContent || '';
        const dataSymbol = input.getAttribute('data-symbol');
        
        if (dataSymbol === 'P' || label.includes('Pulsation') || label.includes('Period') || 
            parent.includes('P') && !parent.includes('M_V')) {
            pInput = input;
            console.log('✅ Found P input field');
            break;
        }
    }
    
    if (!pInput && inputs.length > 0) {
        // Try to find by placeholder or nearby text
        for (const input of inputs) {
            const nearby = input.parentElement?.textContent || '';
            if (nearby.includes('P') && !nearby.includes('M_V')) {
                pInput = input;
                break;
            }
        }
    }
    
    if (pInput) {
        pInput.focus();
        pInput.value = '2';
        pInput.dispatchEvent(new Event('input', { bubbles: true }));
        pInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Entered P = 2');
    } else {
        console.error('❌ Could not find P input field');
        console.log('Available inputs:', Array.from(inputs).map(i => ({
            id: i.id,
            name: i.name,
            placeholder: i.placeholder,
            dataSymbol: i.getAttribute('data-symbol'),
            parent: i.parentElement?.textContent?.substring(0, 50)
        })));
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find and click Calculate button
    const calcButton = document.querySelector('#calculate-btn') ||
                      document.querySelector('button:contains("Calculate")') ||
                      Array.from(document.querySelectorAll('button')).find(b => 
                          b.textContent.includes('Calculate') || b.textContent.includes('Calc')
                      );
    
    if (calcButton) {
        console.log('✅ Found Calculate button');
        calcButton.click();
        console.log('✅ Clicked Calculate button');
    } else {
        console.error('❌ Calculate button not found');
        console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => b.textContent));
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check result
    const resultDisplay = document.querySelector('#result-display') ||
                         document.querySelector('.result-display') ||
                         document.querySelector('[class*="result"]');
    
    if (resultDisplay) {
        const resultText = resultDisplay.textContent || resultDisplay.innerText || '';
        console.log('📊 Result display:', resultText.substring(0, 200));
        
        // Check if it's numeric or symbolic
        const isNumeric = /-?\d+\.?\d*/.test(resultText) && !resultText.includes('log₁₀') && !resultText.includes('log10');
        const isSymbolic = resultText.includes('log₁₀') || resultText.includes('log10') || resultText.includes('×');
        
        if (isNumeric && !isSymbolic) {
            console.log('✅ PASS: Result is numeric!');
        } else {
            console.log('❌ FAIL: Result appears to be symbolic');
        }
    } else {
        console.log('⚠️ Result display not found, checking console logs...');
    }
    
    console.log('✅ Test complete!');
})();
