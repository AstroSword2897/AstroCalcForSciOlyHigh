// Deep verification - what was ACTUALLY the issue
console.log('DEEP VERIFICATION: Checking actual root cause...');

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('=== ACTUAL ISSUE ANALYSIS ===');
        
        // 1. Check if formula-search ACTUALLY exists
        const formulaSearch = document.getElementById('formula-search');
        console.log('1. #formula-search exists:', !!formulaSearch);
        if (formulaSearch) {
            console.log('   - ID:', formulaSearch.id);
            console.log('   - Display:', window.getComputedStyle(formulaSearch).display);
            console.log('   - Visibility:', window.getComputedStyle(formulaSearch).visibility);
            console.log('   - Placeholder:', formulaSearch.placeholder);
        }
        
        // 2. Check command-palette-input (what we found)
        const commandPalette = document.getElementById('command-palette-input');
        console.log('2. #command-palette-input exists:', !!commandPalette);
        if (commandPalette) {
            console.log('   - ID:', commandPalette.id);
            console.log('   - Display:', window.getComputedStyle(commandPalette).display);
            console.log('   - Visibility:', window.getComputedStyle(commandPalette).visibility);
            console.log('   - Placeholder:', commandPalette.placeholder);
        }
        
        // 3. Check ALL text inputs to see what's available
        const allTextInputs = document.querySelectorAll('input[type="text"]');
        console.log('3. All text inputs found:', allTextInputs.length);
        allTextInputs.forEach((input, index) => {
            console.log(`   Input ${index}:`, {
                id: input.id,
                placeholder: input.placeholder,
                className: input.className,
                display: window.getComputedStyle(input).display,
                visibility: window.getComputedStyle(input).visibility
            });
        });
        
        // 4. Check if formula cards are ACTUALLY clickable
        const formulaCards = document.querySelectorAll('.formula-card');
        console.log('4. Formula cards found:', formulaCards.length);
        
        if (formulaCards.length > 0) {
            const firstCard = formulaCards[0];
            const rect = firstCard.getBoundingClientRect();
            console.log('   First card rect:', {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                visible: rect.width > 0 && rect.height > 0
            });
            
            // Check computed styles
            const styles = window.getComputedStyle(firstCard);
            console.log('   First card styles:', {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                zIndex: styles.zIndex,
                pointerEvents: styles.pointerEvents
            });
            
            // Test if it's actually clickable
            console.log('   Testing clickability...');
            const clickTest = document.createElement('div');
            clickTest.style.position = 'absolute';
            clickTest.style.top = rect.top + 'px';
            clickTest.style.left = rect.left + 'px';
            clickTest.style.width = rect.width + 'px';
            clickTest.style.height = rect.height + 'px';
            clickTest.style.zIndex = '9999';
            clickTest.style.background = 'rgba(255,0,0,0.5)';
            document.body.appendChild(clickTest);
            
            setTimeout(() => {
                document.body.removeChild(clickTest);
                console.log('   Click test overlay added and removed');
            }, 1000);
        }
        
        // 5. Check calculator screen ACTUAL state
        const calculatorScreen = document.getElementById('calculator-screen');
        console.log('5. Calculator screen exists:', !!calculatorScreen);
        if (calculatorScreen) {
            const styles = window.getComputedStyle(calculatorScreen);
            console.log('   Calculator screen styles:', {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                zIndex: styles.zIndex
            });
        }
        
        // 6. Check calculate buttons
        const calculateBtns = document.querySelectorAll('#calculate-btn, button:has-text("Calculate")');
        console.log('6. Calculate buttons found:', calculateBtns.length);
        calculateBtns.forEach((btn, index) => {
            console.log(`   Button ${index}:`, {
                id: btn.id,
                text: btn.textContent,
                display: window.getComputedStyle(btn).display,
                visibility: window.getComputedStyle(btn).visibility
            });
        });
        
        // 7. Check N/A elements
        const naCheckboxes = document.querySelectorAll('.na-checkbox');
        const naInputs = document.querySelectorAll('input[value="N/A"], input[placeholder*="N/A"]');
        console.log('7. N/A elements:', {
            checkboxes: naCheckboxes.length,
            inputs: naInputs.length
        });
        
        // 8. CONCLUSION - What was ACTUALLY the issue?
        console.log('=== ROOT CAUSE ANALYSIS ===');
        const issues = [];
        
        if (!formulaSearch && commandPalette) {
            issues.push('Test expected #formula-search but actual is #command-palette-input');
        }
        
        if (commandPalette && window.getComputedStyle(commandPalette).display === 'none') {
            issues.push('Search input exists but is hidden by CSS');
        }
        
        if (formulaCards.length === 0) {
            issues.push('No formula cards rendered at all');
        } else if (formulaCards.length > 0) {
            const firstCard = formulaCards[0];
            if (window.getComputedStyle(firstCard).pointerEvents === 'none') {
                issues.push('Formula cards exist but pointer-events: none (not clickable)');
            }
        }
        
        if (calculateBtns.length > 1) {
            issues.push('Multiple calculate buttons causing strict mode violations');
        }
        
        if (issues.length > 0) {
            console.log('ACTUAL ISSUES FOUND:');
            issues.forEach(issue => console.log('  -', issue));
        } else {
            console.log('No obvious issues found - problem may be elsewhere');
        }
        
        console.log('=== END ANALYSIS ===');
    }, 3000);
});
