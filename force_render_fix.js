// Force render fix for formula cards
(function() {
    'use strict';
    
    function forceRenderFormulas() {
        console.log('🔧 Force rendering formulas...');
        
        // Check dependencies
        if (typeof window.formulas === 'undefined' || !window.formulas) {
            console.error('❌ Formulas not loaded!');
            return false;
        }
        
        if (typeof window.uiOrchestrator === 'undefined') {
            console.error('❌ UI Orchestrator not loaded!');
            return false;
        }
        
        // Get formula list container
        const formulaList = document.getElementById('formula-list');
        if (!formulaList) {
            console.error('❌ Formula list container not found!');
            return false;
        }
        
        // Ensure formula-selection screen is active
        const formulaSelection = document.getElementById('formula-selection');
        if (formulaSelection) {
            formulaSelection.classList.add('active');
            formulaSelection.style.display = 'block';
        }
        
        // Ensure main-formulas-tab is active
        const mainFormulasTab = document.getElementById('main-formulas-tab');
        if (mainFormulasTab) {
            mainFormulasTab.classList.add('active');
            mainFormulasTab.style.display = 'block';
        }
        
        // Make formula list visible
        formulaList.style.display = 'block';
        formulaList.style.visibility = 'visible';
        formulaList.style.opacity = '1';
        
        // Force render
        try {
            window.uiOrchestrator.renderInitialFormulas();
            console.log('✅ Formulas rendered successfully');
            
            // Verify cards appeared
            setTimeout(() => {
                const cards = formulaList.querySelectorAll('.formula-card');
                console.log(`✅ Found ${cards.length} formula cards`);
                if (cards.length === 0) {
                    console.error('❌ No cards rendered!');
                } else {
                    console.log('✅ Click any card to open calculator');
                }
            }, 500);
            
            return true;
        } catch (error) {
            console.error('❌ Error rendering formulas:', error);
            return false;
        }
    }
    
    // Test calculator screen transition
    function testCalculatorScreen() {
        console.log('🧪 Testing calculator screen...');
        
        const inputScreen = document.getElementById('input-screen');
        const formulaSelection = document.getElementById('formula-selection');
        
        if (!inputScreen) {
            console.error('❌ Input screen not found!');
            return;
        }
        
        console.log('Switching to calculator screen...');
        
        // Hide formula selection
        if (formulaSelection) {
            formulaSelection.classList.remove('active');
            formulaSelection.style.display = 'none';
        }
        
        // Show input screen
        inputScreen.classList.add('active');
        inputScreen.style.display = 'block';
        inputScreen.style.visibility = 'visible';
        inputScreen.style.opacity = '1';
        
        console.log('✅ Calculator screen should now be visible');
        console.log('Input screen display:', window.getComputedStyle(inputScreen).display);
        console.log('Input screen visibility:', window.getComputedStyle(inputScreen).visibility);
        
        // Check for tabs
        const tabs = inputScreen.querySelector('.tabs');
        const tabButtons = inputScreen.querySelectorAll('.tab-btn');
        console.log('Tabs found:', tabs ? 'yes' : 'no');
        console.log('Tab buttons found:', tabButtons.length);
    }
    
    // Expose globally
    window.forceRenderFormulas = forceRenderFormulas;
    window.testCalculatorScreen = testCalculatorScreen;
    
    // Auto-run after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(forceRenderFormulas, 2000);
        });
    } else {
        setTimeout(forceRenderFormulas, 2000);
    }
    
    console.log('💡 Available commands:');
    console.log('  - forceRenderFormulas() - Re-render formula cards');
    console.log('  - testCalculatorScreen() - Test calculator screen transition');
})();

