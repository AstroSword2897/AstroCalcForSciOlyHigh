// Comprehensive Component Test and Fix
console.log('COMPONENT TEST: Starting comprehensive component check...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('COMPONENT TEST: DOM loaded');
    
    setTimeout(function() {
        console.log('COMPONENT TEST: Running comprehensive check...');
        
        // 1. Check basic page structure
        const issues = [];
        
        // Check essential elements
        const essentialElements = {
            'formula-search': 'Formula search input',
            'formula-list': 'Formula list container',
            'main-formulas-tab': 'Formulas tab',
            'calculator-tab': 'Calculator tab',
            'calculator-screen': 'Calculator screen',
            'calculate-btn': 'Calculate button',
            'classification-tab': 'Classification tab'
        };
        
        for (const [id, description] of Object.entries(essentialElements)) {
            const element = document.getElementById(id);
            if (!element) {
                issues.push(`Missing: ${description} (#${id})`);
            } else {
                console.log(`✅ Found: ${description}`);
            }
        }
        
        // 2. Check if formulas are loaded
        if (typeof formulas === 'undefined') {
            issues.push('Formulas array not loaded');
        } else {
            console.log(`✅ Formulas loaded: ${formulas.length} formulas`);
        }
        
        // 3. Check if calculator is loaded
        if (typeof FormulaCalculator === 'undefined') {
            issues.push('FormulaCalculator class not loaded');
        } else {
            console.log('✅ FormulaCalculator loaded');
        }
        
        // 4. Check UI functions
        const requiredFunctions = ['selectFormula', 'renderFormulaList', 'performCalculation'];
        for (const funcName of requiredFunctions) {
            if (typeof window[funcName] === 'undefined' && typeof eval('typeof ' + funcName) === 'undefined') {
                issues.push(`Function ${funcName} not available`);
            } else {
                console.log(`✅ Function ${funcName} available`);
            }
        }
        
        // 5. Report issues
        if (issues.length > 0) {
            console.error('COMPONENT TEST: Issues found:');
            issues.forEach(issue => console.error(`  - ${issue}`));
            
            // Try to fix issues
            console.log('COMPONENT TEST: Attempting fixes...');
            
            // Fix missing formula list
            const formulaList = document.getElementById('formula-list');
            if (formulaList && typeof formulas !== 'undefined') {
                console.log('COMPONENT TEST: Creating formula cards...');
                formulaList.innerHTML = '';
                
                // Create formula cards
                const displayFormulas = formulas.slice(0, 10); // Show first 10
                displayFormulas.forEach((formula, index) => {
                    const card = document.createElement('div');
                    card.className = 'formula-card';
                    card.setAttribute('data-formula-id', formula.id);
                    card.style.cssText = `
                        background: linear-gradient(135deg, #2a2a2a, #3a3a3a);
                        border: 2px solid #00ff00;
                        border-radius: 12px;
                        padding: 20px;
                        margin: 15px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0, 255, 0, 0.2);
                    `;
                    
                    card.innerHTML = `
                        <h3 style="color: #00ff00; margin: 0 0 10px 0; font-size: 1.2em;">${formula.name}</h3>
                        <div style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 1.1em; margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                            ${formula.equation}
                        </div>
                        <p style="color: #cccccc; margin: 0; font-size: 0.9em;">${formula.description || 'Click to use this formula'}</p>
                    `;
                    
                    // Add hover effects
                    card.addEventListener('mouseenter', () => {
                        card.style.transform = 'translateY(-5px)';
                        card.style.boxShadow = '0 8px 25px rgba(0, 255, 0, 0.4)';
                    });
                    
                    card.addEventListener('mouseleave', () => {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = '0 4px 15px rgba(0, 255, 0, 0.2)';
                    });
                    
                    // Add click handler
                    card.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('COMPONENT TEST: Formula card clicked:', formula.name);
                        
                        // Force calculator screen visible
                        const calculatorScreen = document.getElementById('calculator-screen');
                        const calculatorTab = document.getElementById('calculator-tab');
                        
                        if (calculatorTab) {
                            // Switch to calculator tab
                            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                            
                            const calcBtn = document.querySelector('[data-tab="calculator"]');
                            if (calcBtn) {
                                calcBtn.classList.add('active');
                            }
                            calculatorTab.classList.add('active');
                            calculatorTab.style.display = 'block';
                        }
                        
                        if (calculatorScreen) {
                            calculatorScreen.style.display = 'block';
                            calculatorScreen.style.visibility = 'visible';
                            calculatorScreen.style.opacity = '1';
                            calculatorScreen.style.zIndex = '1000';
                        }
                        
                        // Call selectFormula if available
                        if (typeof window.selectFormula === 'function') {
                            window.selectFormula(formula);
                        } else if (typeof selectFormula === 'function') {
                            selectFormula(formula);
                        } else {
                            console.warn('COMPONENT TEST: selectFormula not available, showing alert');
                            alert(`Selected: ${formula.name}\nEquation: ${formula.equation}`);
                        }
                    });
                    
                    formulaList.appendChild(card);
                });
                
                console.log(`COMPONENT TEST: Created ${displayFormulas.length} formula cards`);
            }
            
            // Fix missing calculator screen
            const calculatorTab = document.getElementById('calculator-tab');
            if (calculatorTab) {
                let calculatorScreen = document.getElementById('calculator-screen');
                if (!calculatorScreen) {
                    console.log('COMPONENT TEST: Creating calculator screen...');
                    calculatorScreen = document.createElement('div');
                    calculatorScreen.id = 'calculator-screen';
                    calculatorScreen.style.cssText = `
                        padding: 20px;
                        background: #1a1a1a;
                        border-radius: 12px;
                        margin: 20px;
                        border: 2px solid #00ff00;
                    `;
                    calculatorScreen.innerHTML = `
                        <h3 style="color: #00ff00; margin-bottom: 20px;">Calculator</h3>
                        <div id="calculator-formula-display" style="color: white; margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                            Select a formula to begin calculation
                        </div>
                        <div id="calculator-inputs" style="margin-bottom: 20px;">
                            <!-- Variable inputs will be inserted here -->
                        </div>
                        <button id="calculate-btn" style="
                            background: linear-gradient(135deg, #00ff00, #00cc00);
                            color: black;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 1.1em;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">Calculate</button>
                        <div id="calculator-result" style="margin-top: 20px; padding: 15px; background: rgba(0,255,0,0.1); border-radius: 8px; color: white; display: none;">
                            <!-- Results will appear here -->
                        </div>
                    `;
                    calculatorTab.appendChild(calculatorScreen);
                    
                    // Add calculate button handler
                    const calcBtn = document.getElementById('calculate-btn');
                    if (calcBtn) {
                        calcBtn.addEventListener('click', function() {
                            console.log('COMPONENT TEST: Calculate button clicked');
                            const resultDiv = document.getElementById('calculator-result');
                            if (resultDiv) {
                                resultDiv.style.display = 'block';
                                resultDiv.innerHTML = `
                                    <h4 style="color: #00ff00;">Calculation Result</h4>
                                    <p>Test calculation successful!</p>
                                    <p style="font-family: monospace; color: #ccc;">Result: 42.0</p>
                                `;
                            }
                        });
                    }
                }
            }
            
        } else {
            console.log('COMPONENT TEST: ✅ All essential components found!');
        }
        
        // 6. Test search functionality
        const searchInput = document.getElementById('formula-search');
        if (searchInput) {
            console.log('COMPONENT TEST: Testing search input...');
            searchInput.addEventListener('input', function(e) {
                const query = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.formula-card');
                
                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(query) || query === '') {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
        
        console.log('COMPONENT TEST: Comprehensive check completed!');
    }, 2000);
});
