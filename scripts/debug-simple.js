// Simple debug script to check what's happening
console.log('DEBUG: Script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG: DOM loaded');
    
    setTimeout(function() {
        console.log('DEBUG: Starting debug check...');
        
        // Check if page has content
        const body = document.body;
        console.log('DEBUG: Body HTML length:', body.innerHTML.length);
        console.log('DEBUG: Body children:', body.children.length);
        
        // Check for formula cards
        const cards = document.querySelectorAll('.formula-card');
        console.log('DEBUG: Found formula cards:', cards.length);
        
        // Check for main elements
        const mainContent = document.querySelector('.main-content');
        console.log('DEBUG: Main content found:', !!mainContent);
        
        const formulasTab = document.getElementById('main-formulas-tab');
        console.log('DEBUG: Formulas tab found:', !!formulasTab);
        
        // If no formula cards, try to force render them
        if (cards.length === 0) {
            console.error('DEBUG: No formula cards found! Forcing render...');
            
            // Try to find and call renderFormulaList
            if (typeof window.renderFormulaList === 'function') {
                console.log('DEBUG: Calling renderFormulaList...');
                window.renderFormulaList();
            } else if (typeof renderFormulaList === 'function') {
                console.log('DEBUG: Calling global renderFormulaList...');
                renderFormulaList();
            } else {
                console.error('DEBUG: renderFormulaList not available!');
                
                // Force create some formula cards manually
                const formulasContainer = document.getElementById('formula-cards') || document.getElementById('main-formulas-tab') || document.querySelector('.formula-cards-grid');
                if (formulasContainer && typeof formulas !== 'undefined') {
                    console.log('DEBUG: Manually creating formula cards...');
                    formulasContainer.innerHTML = '';
                    
                    // Create first 3 formulas as test
                    const testFormulas = formulas.slice(0, 3);
                    testFormulas.forEach((formula, index) => {
                        const card = document.createElement('div');
                        card.className = 'formula-card';
                        card.setAttribute('data-formula-id', formula.id);
                        card.style.cssText = 'background: #2a2a2a; border: 2px solid #00ff00; padding: 15px; margin: 10px; cursor: pointer; border-radius: 8px;';
                        card.innerHTML = `
                            <h3 style="color: white; margin: 0 0 10px 0;">${formula.name}</h3>
                            <div style="color: #00ff00; font-family: monospace; margin-bottom: 10px;">${formula.equation}</div>
                            <p style="color: #ccc; margin: 0;">${formula.description || 'Test formula'}</p>
                        `;
                        
                        card.addEventListener('click', function() {
                            console.log('DEBUG: Manual card clicked:', formula.name);
                            alert('Card clicked: ' + formula.name);
                            if (typeof window.selectFormula === 'function') {
                                window.selectFormula(formula);
                            }
                        });
                        
                        formulasContainer.appendChild(card);
                    });
                    
                    console.log(`DEBUG: Created ${testFormulas.length} manual formula cards`);
                }
            }
        }
    }, 1000);
});
