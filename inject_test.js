// Inject this into browser console to test
(async () => {
    console.log('🧪 Starting automated test...');
    
    // Step 1: Find and click search input
    const searchInput = document.querySelector('input[placeholder*="Search"]') || 
                       document.querySelector('#main-search-input') ||
                       Array.from(document.querySelectorAll('input[type="text"]')).find(i => 
                           i.placeholder?.toLowerCase().includes('search')
                       );
    
    if (!searchInput) {
        console.error('❌ Search input not found');
        return;
    }
    
    console.log('✅ Found search input');
    searchInput.focus();
    searchInput.click();
    await new Promise(r => setTimeout(r, 500));
    
    // Step 2: Type search query
    searchInput.value = 'period luminosity cepheid';
    searchInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    searchInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter' }));
    
    console.log('✅ Typed search query');
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 3: Find and click formula card
    const cards = document.querySelectorAll('.formula-card, [data-formula-id*="period"], [data-formula-id*="luminosity"]');
    let cardClicked = false;
    
    for (const card of cards) {
        const text = (card.textContent || '').toLowerCase();
        if (text.includes('period') && text.includes('luminosity')) {
            console.log('✅ Found formula card:', card.textContent.substring(0, 50));
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(r => setTimeout(r, 500));
            card.click();
            cardClicked = true;
            break;
        }
    }
    
    if (!cardClicked && cards.length > 0) {
        console.log('⚠️ Clicking first matching card');
        cards[0].click();
    }
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 4: Find P input field
    const allInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"]'));
    let pInput = null;
    
    for (const input of allInputs) {
        const symbol = input.getAttribute('data-symbol');
        const id = input.id || '';
        const name = input.name || '';
        const placeholder = input.placeholder || '';
        const label = input.closest('label')?.textContent || '';
        const parent = input.parentElement?.textContent || '';
        
        if (symbol === 'P' || 
            id.includes('P') && !id.includes('M_V') ||
            name.includes('P') && !name.includes('M_V') ||
            (label.includes('Period') || label.includes('Pulsation')) ||
            (parent.includes('P') && parent.includes('Period') && !parent.includes('M_V'))) {
            pInput = input;
            console.log('✅ Found P input:', { symbol, id, label: label.substring(0, 30) });
            break;
        }
    }
    
    if (!pInput && allInputs.length > 0) {
        // Last resort: find any input that might be P
        pInput = allInputs.find(i => {
            const nearby = i.parentElement?.textContent || '';
            return nearby.includes('P') && !nearby.includes('M_V') && nearby.length < 100;
        }) || allInputs[0];
        console.log('⚠️ Using first available input as P');
    }
    
    if (pInput) {
        pInput.focus();
        pInput.value = '';
        await new Promise(r => setTimeout(r, 200));
        pInput.value = '2';
        pInput.dispatchEvent(new Event('input', { bubbles: true }));
        pInput.dispatchEvent(new Event('change', { bubbles: true }));
        pInput.dispatchEvent(new Event('blur', { bubbles: true }));
        console.log('✅ Entered P = 2');
    } else {
        console.error('❌ Could not find P input');
        console.log('Available inputs:', allInputs.map(i => ({
            id: i.id,
            symbol: i.getAttribute('data-symbol'),
            placeholder: i.placeholder,
            parent: i.parentElement?.textContent?.substring(0, 50)
        })));
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 5: Click Calculate button
    const calcBtn = document.querySelector('#calculate-btn') ||
                   Array.from(document.querySelectorAll('button')).find(b => 
                       b.textContent.trim().includes('Calculate') || 
                       b.textContent.trim().includes('Calc')
                   );
    
    if (calcBtn) {
        console.log('✅ Found Calculate button');
        calcBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 500));
        calcBtn.click();
        console.log('✅ Clicked Calculate button');
    } else {
        console.error('❌ Calculate button not found');
    }
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 6: Check result
    const resultDiv = document.querySelector('#result-display') ||
                     document.querySelector('.result-display') ||
                     document.querySelector('[id*="result"]') ||
                     document.querySelector('[class*="result"]');
    
    if (resultDiv) {
        const text = resultDiv.textContent || resultDiv.innerText || '';
        console.log('📊 Result text:', text.substring(0, 300));
        
        const hasNumeric = /-?\d+\.?\d+/.test(text);
        const hasSymbolic = text.includes('log₁₀') || text.includes('log10') || text.includes('× log');
        
        if (hasNumeric && !hasSymbolic) {
            console.log('✅✅✅ PASS: Result is NUMERIC!');
        } else if (hasSymbolic) {
            console.log('❌❌❌ FAIL: Result is SYMBOLIC (not computed)');
        } else {
            console.log('⚠️ Result format unclear');
        }
    } else {
        console.log('⚠️ Result display not found');
    }
    
    console.log('✅ Test complete!');
})();
