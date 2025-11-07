// User Interface Controller

let currentFormula = null;
let calculator = null;
let mainGraphManager = null; // Separate graph manager for main page Desmos tab
let mainDesmosCalculator = null; // Standalone Desmos calculator for main page

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    renderFormulaList();
    setupEventListeners();
});

// Render the list of formulas
function renderFormulaList() {
    const formulaList = document.getElementById('formula-list');
    
    if (!formulaList) {
        console.error('formula-list element not found!');
        return;
    }
    
    // Check if formulas array exists
    if (typeof formulas === 'undefined' || !formulas) {
        console.error('Formulas array not found!', typeof formulas);
        formulaList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Error: Formulas not loaded. Please check the console.</p>';
        return;
    }
    
    if (!Array.isArray(formulas) || formulas.length === 0) {
        console.error('Formulas array is empty or not an array!', formulas);
        formulaList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Error: No formulas found in array.</p>';
        return;
    }
    
    // Clear and populate formula list
    formulaList.innerHTML = '';
    
    // Group formulas by category
    const categorizedFormulas = {};
    const uncategorized = [];
    
    formulas.forEach(formula => {
        let found = false;
        for (const [category, ids] of Object.entries(formulaCategories)) {
            if (ids.includes(formula.id)) {
                if (!categorizedFormulas[category]) {
                    categorizedFormulas[category] = [];
                }
                categorizedFormulas[category].push(formula);
                found = true;
                break;
            }
        }
        if (!found) {
            uncategorized.push(formula);
        }
    });
    
    // Render categorized formulas
    const categoryOrder = [
        'Orbital Mechanics',
        'Radiation & Stellar Properties',
        'Telescopes & Optics',
        'Cosmology & Relativity',
        'Doppler & Spectroscopy',
        'Planetary Science & Exoplanets',
        'High Energy Astrophysics',
        'Stellar Structure'
    ];
    
    categoryOrder.forEach(category => {
        if (categorizedFormulas[category] && categorizedFormulas[category].length > 0) {
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'formula-category-header';
            categoryHeader.innerHTML = `<h2>${category}</h2>`;
            formulaList.appendChild(categoryHeader);
            
            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'formula-category';
            
            // Add formulas to category
            categorizedFormulas[category].forEach(formula => {
                const card = createFormulaCard(formula);
                categoryContainer.appendChild(card);
            });
            
            formulaList.appendChild(categoryContainer);
        }
    });
    
    // Render uncategorized formulas if any
    if (uncategorized.length > 0) {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'formula-category-header';
        categoryHeader.innerHTML = '<h2>Other</h2>';
        formulaList.appendChild(categoryHeader);
        
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'formula-category';
        
        uncategorized.forEach(formula => {
            const card = createFormulaCard(formula);
            categoryContainer.appendChild(card);
        });
        
        formulaList.appendChild(categoryContainer);
    }
    
    console.log(`Rendered ${formulas.length} formula cards in ${Object.keys(categorizedFormulas).length} categories`);
}

// Create a formula card element
function createFormulaCard(formula) {
    const card = document.createElement('div');
    card.className = 'formula-card';
    card.onclick = () => selectFormula(formula);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    // Add keyboard support
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectFormula(formula);
        }
    });
    
    card.innerHTML = `
        <div class="formula-card-header">
            <h3>${formula.name}</h3>
            <span class="click-hint">Click to calculate →</span>
        </div>
        <div class="formula-preview">${formula.equation}</div>
        <p class="description">${formula.description}</p>
        <div class="formula-variables">
            <strong>Variables:</strong> ${formula.variables.map(v => `<span class="var-tag">${v.symbol}</span>`).join(' ')}
        </div>
    `;
    
    return card;
}

// Select a formula and show input screen
function selectFormula(formula) {
    currentFormula = formula;
    calculator = new FormulaCalculator(formula);
    
    // Initialize graph manager if not already done
    if (!graphManager) {
        graphManager = new GraphManager();
        // Wait for Desmos to load
        if (typeof Desmos !== 'undefined') {
            graphManager.init();
        } else {
            // Wait a bit for Desmos to load
            let attempts = 0;
            const maxAttempts = 10;
            const checkDesmos = setInterval(() => {
                attempts++;
                if (typeof Desmos !== 'undefined' && graphManager) {
                    graphManager.init();
                    clearInterval(checkDesmos);
                } else if (attempts >= maxAttempts) {
                    console.warn('Desmos API failed to load after multiple attempts');
                    clearInterval(checkDesmos);
                }
            }, 200);
        }
    }
    
    // Switch to input screen
    document.getElementById('formula-selection').classList.remove('active');
    document.getElementById('input-screen').classList.add('active');
    
    // Populate formula info
    document.getElementById('formula-name').textContent = formula.name;
    document.getElementById('formula-equation').textContent = formula.equation;
    document.getElementById('formula-description').textContent = formula.description;
    
    // Create variable inputs
    renderVariableInputs(formula);
    
    // Clear previous results
    document.getElementById('result-display').classList.remove('show');
    
    // Update graph
    updateGraph();
}

// Render input fields for each variable
function renderVariableInputs(formula) {
    const container = document.getElementById('variables-container');
    container.innerHTML = '';
    
    // Get list of constant symbols to exclude from input fields
    const constantSymbols = new Set();
    if (formula.constants) {
        Object.keys(formula.constants).forEach(key => {
            constantSymbols.add(key);
            // Also check for common constant names
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    // Filter out constants from variables - only show user-input variables
    const userVariables = formula.variables.filter(variable => {
        return !constantSymbols.has(variable.symbol);
    });
    
    // Display constants info if any exist
    if (formula.constants && Object.keys(formula.constants).length > 0) {
        const constantsDiv = document.createElement('div');
        constantsDiv.className = 'constants-info';
        constantsDiv.innerHTML = '<h4>Constants (automatically used):</h4><div class="constants-list"></div>';
        const constantsList = constantsDiv.querySelector('.constants-list');
        
        Object.entries(formula.constants).forEach(([key, value]) => {
            const constantItem = document.createElement('div');
            constantItem.className = 'constant-item';
            let displayValue = value;
            let displayKey = key;
            
            // Format common constants
            if (key === 'pi' || key === 'π') {
                displayKey = 'π';
                displayValue = '3.14159...';
            } else if (key === 'G') {
                displayKey = 'G';
                displayValue = '6.67430 × 10⁻¹¹ N·m²/kg²';
            } else if (key === 'c') {
                displayKey = 'c';
                displayValue = '2.998 × 10⁸ m/s';
            } else if (key === 'σ' || key === 'sigma') {
                displayKey = 'σ';
                displayValue = '5.670 × 10⁻⁸ W/(m²·K⁴)';
            } else if (typeof value === 'number') {
                if (Math.abs(value) < 0.001 || Math.abs(value) > 1000) {
                    displayValue = value.toExponential(3);
                } else {
                    displayValue = value.toString();
                }
            }
            
            constantItem.innerHTML = `<strong>${displayKey}:</strong> ${displayValue}`;
            constantsList.appendChild(constantItem);
        });
        
        container.appendChild(constantsDiv);
    }
    
    userVariables.forEach(variable => {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'variable-input';
        
        const baseUnit = variable.unit;
        const fullUnitName = UnitConverter.formatUnit(baseUnit);
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        const isAngle = baseUnit.toLowerCase().includes('radian') || baseUnit.toLowerCase().includes('rad');
        
        // Create unit options note
        let unitOptionsNote = '';
        if (alternativeUnits.length > 1) {
            const unitLabels = alternativeUnits.map(u => {
                const full = UnitConverter.formatUnit(u);
                return u === full ? u : `${u} (${full})`;
            }).join(', ');
            unitOptionsNote = `<div class="unit-options-note"><strong>Available units:</strong> ${unitLabels}</div>`;
        }
        
        // Create input fields for each alternative unit
        let inputFieldsHTML = '';
        alternativeUnits.forEach((unit, index) => {
            const isBase = unit === baseUnit || unit.toLowerCase() === baseUnit.toLowerCase();
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const placeholder = isBase ? "Enter value or 'null'" : `Enter in ${unit} or leave empty`;
            
            inputFieldsHTML += `
                <div class="unit-input-group">
                    <label class="unit-input-label">
                        <span class="unit-symbol">${unit}</span>
                        <span class="unit-name">${UnitConverter.formatUnit(unit)}</span>
                    </label>
                    <input 
                        type="text" 
                        id="${inputId}" 
                        class="unit-input-field"
                        placeholder="${placeholder}"
                        data-symbol="${variable.symbol}"
                        data-unit="${unit}"
                        data-base-unit="${baseUnit}"
                    >
                </div>
            `;
        });
        
        inputDiv.innerHTML = `
            <label class="variable-main-label">
                <span class="symbol">${variable.symbol}</span> - ${variable.name}
            </label>
            ${unitOptionsNote}
            <div class="unit-inputs-container">
                ${inputFieldsHTML}
            </div>
            <div class="var-description">${variable.description}</div>
        `;
        
        container.appendChild(inputDiv);
        
        // Add input listeners to all unit input fields
        alternativeUnits.forEach(unit => {
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const input = document.getElementById(inputId);
            if (input) {
                // Clear other inputs when this one is filled
                input.addEventListener('input', (e) => {
                    const currentValue = e.target.value.trim();
                    if (currentValue && currentValue.toLowerCase() !== 'null') {
                        // Clear other unit inputs for this variable
                        alternativeUnits.forEach(otherUnit => {
                            if (otherUnit !== unit) {
                                const otherInputId = `var-${variable.symbol}-${otherUnit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                                const otherInput = document.getElementById(otherInputId);
                                if (otherInput) {
                                    otherInput.value = '';
                                }
                            }
                        });
                    }
                    
                    // Debounce graph updates
                    clearTimeout(input.graphUpdateTimeout);
                    input.graphUpdateTimeout = setTimeout(() => {
                        updateGraph();
                    }, 500);
                });
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        document.getElementById('input-screen').classList.remove('active');
        document.getElementById('formula-selection').classList.add('active');
        currentFormula = null;
        calculator = null;
        if (graphManager) {
            graphManager.clear();
        }
    });
    
    // Main page tab buttons (Formulas/Classification)
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-main-tab');
            switchMainTab(tabName);
        });
    });
    
    // Input screen tab buttons (Calculator/Graph/Classification)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', performCalculation);
    
    // Classification button (in input screen)
    const classifyBtn = document.getElementById('classify-btn');
    if (classifyBtn) {
        classifyBtn.addEventListener('click', performClassification);
    }
    
    // Main page classification button
    const mainClassifyBtn = document.getElementById('main-classify-btn');
    if (mainClassifyBtn) {
        mainClassifyBtn.addEventListener('click', performMainClassification);
    }
    
    // Protostar checkbox handlers - clear luminosity/white dwarf selection if protostar is checked
    const mainProtostarCheckbox = document.getElementById('main-protostar-checkbox');
    if (mainProtostarCheckbox) {
        mainProtostarCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                const luminositySelect = document.getElementById('main-luminosity-class');
                if (luminositySelect) luminositySelect.value = '';
            }
        });
    }
    
    const protostarCheckbox = document.getElementById('protostar-checkbox');
    if (protostarCheckbox) {
        protostarCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                const luminositySelect = document.getElementById('luminosity-class');
                if (luminositySelect) luminositySelect.value = '';
            }
        });
    }
    
    // Luminosity/White Dwarf dropdown handlers - uncheck protostar if selection is made
    const mainLuminositySelect = document.getElementById('main-luminosity-class');
    if (mainLuminositySelect) {
        mainLuminositySelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const protostarCheckbox = document.getElementById('main-protostar-checkbox');
                if (protostarCheckbox) protostarCheckbox.checked = false;
            }
        });
    }
    
    const luminositySelect = document.getElementById('luminosity-class');
    if (luminositySelect) {
        luminositySelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const protostarCheckbox = document.getElementById('protostar-checkbox');
                if (protostarCheckbox) protostarCheckbox.checked = false;
            }
        });
    }
    
    // Allow Enter key in classification temperature inputs
    const tempInput = document.getElementById('temperature-input');
    if (tempInput) {
        tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performClassification();
            }
        });
    }
    
    const mainTempInput = document.getElementById('main-temperature-input');
    if (mainTempInput) {
        mainTempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performMainClassification();
            }
        });
    }
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
        // Get list of constant symbols to exclude
        const constantSymbols = new Set();
        if (currentFormula && currentFormula.constants) {
            Object.keys(currentFormula.constants).forEach(key => {
                constantSymbols.add(key);
                if (key === 'pi' || key === 'π') constantSymbols.add('π');
                if (key === 'G') constantSymbols.add('G');
                if (key === 'c') constantSymbols.add('c');
                if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
            });
        }
        
        const userVariables = currentFormula ? currentFormula.variables.filter(v => !constantSymbols.has(v.symbol)) : [];
        
        userVariables.forEach(variable => {
            const baseUnit = variable.unit;
            const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
            
            // Clear all unit input fields for this variable
            alternativeUnits.forEach(unit => {
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const input = document.getElementById(inputId);
                if (input) input.value = '';
            });
            
            // Also clear old format for backwards compatibility
            const oldInput = document.getElementById(`var-${variable.symbol}`);
            if (oldInput) oldInput.value = '';
        });
        
        document.getElementById('result-display').classList.remove('show');
        updateGraph();
    });
    
    // Allow Enter key to calculate
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && document.getElementById('input-screen').classList.contains('active')) {
            performCalculation();
        }
    });
}

// Switch between main page tabs (Formulas/Classification/Desmos)
function switchMainTab(tabName) {
    // Update main tab buttons
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-main-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update main tab content
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'formulas') {
        document.getElementById('main-formulas-tab').classList.add('active');
    } else if (tabName === 'classification') {
        document.getElementById('main-classification-tab').classList.add('active');
        // Initialize classifier if needed
        if (!stellarClassifier) {
            stellarClassifier = new StellarClassifier();
        }
    } else if (tabName === 'desmos') {
        document.getElementById('main-desmos-tab').classList.add('active');
        
        // Initialize standalone Desmos calculator (full-featured, not formula-linked)
        // Wait longer to ensure tab is fully visible
        setTimeout(() => {
            if (typeof Desmos === 'undefined') {
                // Wait for Desmos to load
                let attempts = 0;
                const maxAttempts = 30;
                const checkDesmos = setInterval(() => {
                    attempts++;
                    if (typeof Desmos !== 'undefined') {
                        clearInterval(checkDesmos);
                        // Try initialization with retry
                        let initAttempts = 0;
                        const initInterval = setInterval(() => {
                            initAttempts++;
                            if (initMainDesmosCalculator()) {
                                clearInterval(initInterval);
                            } else if (initAttempts >= 10) {
                                clearInterval(initInterval);
                                console.error('Failed to initialize Desmos after multiple attempts');
                            }
                        }, 200);
                    } else if (attempts >= maxAttempts) {
                        console.warn('Desmos API failed to load after multiple attempts');
                        const container = document.getElementById('main-desmos-graph');
                        if (container) {
                            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Desmos API failed to load. Please refresh the page.</p><p style="font-size: 0.9em; color: #999;">Make sure you have an internet connection.</p></div>';
                        }
                        clearInterval(checkDesmos);
                    }
                }, 200);
            } else {
                // Desmos is loaded, try to initialize
                let initAttempts = 0;
                const initInterval = setInterval(() => {
                    initAttempts++;
                    if (initMainDesmosCalculator()) {
                        clearInterval(initInterval);
                    } else if (initAttempts >= 10) {
                        clearInterval(initInterval);
                        console.error('Failed to initialize Desmos after multiple attempts');
                    }
                }, 200);
            }
        }, 200);
    }
}

// Switch between calculator, graph, and classification tabs (in input screen)
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'calculator') {
        document.getElementById('calculator-tab').classList.add('active');
    } else if (tabName === 'graph') {
        document.getElementById('graph-tab').classList.add('active');
        
        // Ensure graph manager is initialized
        if (!graphManager) {
            graphManager = new GraphManager();
        }
        
        // Initialize Desmos if not already done (wait for tab to be visible)
        setTimeout(() => {
            if (graphManager && !graphManager.calculator) {
                if (typeof Desmos !== 'undefined') {
                    graphManager.init();
                } else {
                    // Wait for Desmos to load
                    let attempts = 0;
                    const maxAttempts = 20;
                    const checkDesmos = setInterval(() => {
                        attempts++;
                        if (typeof Desmos !== 'undefined' && graphManager) {
                            graphManager.init();
                            clearInterval(checkDesmos);
                        } else if (attempts >= maxAttempts) {
                            console.warn('Desmos API failed to load after multiple attempts');
                            clearInterval(checkDesmos);
                        }
                    }, 200);
                }
            }
            // Update graph after initialization
            updateGraph();
        }, 100);
    } else if (tabName === 'classification') {
        document.getElementById('classification-tab').classList.add('active');
        // Initialize classifier if needed
        if (!stellarClassifier) {
            stellarClassifier = new StellarClassifier();
        }
    }
}

// Update graph based on current inputs
function updateGraph() {
    if (!currentFormula || !graphManager) return;
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Collect current variable values
    const variableValues = {};
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        // Find which input field has a value
        let foundValue = null;
        let foundUnit = null;
        
        for (const unit of alternativeUnits) {
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const input = document.getElementById(inputId);
            if (input) {
                const value = input.value.trim();
                if (value && value.toLowerCase() !== 'null') {
                    foundValue = value;
                    foundUnit = unit;
                    break;
                }
            }
        }
        
        // If no value found, check old format for backwards compatibility
        if (!foundValue) {
            const oldInput = document.getElementById(`var-${variable.symbol}`);
            if (oldInput) {
                const value = oldInput.value.trim();
                if (value && value.toLowerCase() !== 'null') {
                    foundValue = value;
                    foundUnit = baseUnit;
                }
            }
        }
        
        if (!foundValue || foundValue === '' || foundValue.toLowerCase() === 'null') {
            variableValues[variable.symbol] = null;
        } else {
            try {
                const parsedValue = ExpressionParser.parse(foundValue, foundUnit);
                if (parsedValue !== null && typeof parsedValue === 'number' && !isNaN(parsedValue) && isFinite(parsedValue)) {
                    // Convert to base unit
                    const baseValue = UnitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
                    variableValues[variable.symbol] = baseValue;
                } else {
                    variableValues[variable.symbol] = foundValue;
                }
            } catch (e) {
                variableValues[variable.symbol] = foundValue;
            }
        }
    });
    
    // Update graph
    graphManager.updateGraph(currentFormula, variableValues);
}

// Perform the calculation
function performCalculation() {
    if (!calculator || !currentFormula) {
        return;
    }
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Collect variable values
    const variableValues = {};
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        // Find which input field has a value
        let foundValue = null;
        let foundUnit = null;
        
        for (const unit of alternativeUnits) {
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const input = document.getElementById(inputId);
            if (input) {
                const value = input.value.trim();
                if (value && value.toLowerCase() !== 'null') {
                    foundValue = value;
                    foundUnit = unit;
                    break;
                }
            }
        }
        
        // If no value found, check old format for backwards compatibility
        if (!foundValue) {
            const oldInput = document.getElementById(`var-${variable.symbol}`);
            if (oldInput) {
                const value = oldInput.value.trim();
                if (value && value.toLowerCase() !== 'null') {
                    foundValue = value;
                    foundUnit = baseUnit;
                }
            }
        }
        
        // Convert 'null' or empty to null
        if (!foundValue || foundValue === '' || foundValue.toLowerCase() === 'null') {
            variableValues[variable.symbol] = null;
        } else {
            // Try to parse as mathematical expression
            try {
                // Pass the unit to the parser so it can handle degree/radian conversion
                const parsedValue = ExpressionParser.parse(foundValue, foundUnit);
                if (parsedValue === null) {
                    variableValues[variable.symbol] = null;
                } else if (typeof parsedValue === 'number' && !isNaN(parsedValue) && isFinite(parsedValue)) {
                    // Convert to base unit
                    const baseValue = UnitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
                    variableValues[variable.symbol] = baseValue;
                } else {
                    throw new Error(`Could not parse "${foundValue}" as a number`);
                }
            } catch (error) {
                // Show a more helpful error message
                const isAngle = baseUnit.toLowerCase().includes('radian') || baseUnit.toLowerCase().includes('rad');
                const angleHint = isAngle ? ' You can use degrees (45°) or radians (pi/4).' : '';
                displayError(`Invalid input for ${variable.symbol}: "${foundValue}". ${error.message || 'Please enter a number or mathematical expression (e.g., pi/4, 2*pi, etc.)'}${angleHint}`);
                return;
            }
        }
    });
    
    // Perform calculation
    try {
        const result = calculator.solve(variableValues);
        displayResult(result);
        // Update graph after calculation
        updateGraph();
    } catch (error) {
        displayError(error.message);
    }
}

// Display calculation result
function displayResult(result) {
    const resultDisplay = document.getElementById('result-display');
    const varInfo = currentFormula.variables.find(v => v.symbol === result.variable);
    
    // Ensure result.value is always a numeric value, not an expression
    let numericValue = result.value;
    if (typeof numericValue === 'string') {
        // If somehow we got a string, try to parse it
        try {
            numericValue = ExpressionParser.parse(numericValue);
        } catch (e) {
            numericValue = parseFloat(numericValue);
            if (isNaN(numericValue)) {
                displayError('Invalid result value. Please check your inputs.');
                return;
            }
        }
    }
    
    // Ensure it's a finite number
    if (!isFinite(numericValue)) {
        displayError('Result is not a finite number. Please check your inputs.');
        return;
    }
    
    // Format the original value (always numeric)
    const formattedValue = UnitConverter.formatNumber(numericValue);
    const unitName = UnitConverter.formatUnit(result.unit);
    
    // Get unit conversion
    const conversion = UnitConverter.convertAndFormat(numericValue, result.unit);
    
    // Build result HTML
    let resultHTML = `
        <h3>Result</h3>
        <div class="result-value">${formattedValue}</div>
        <div class="result-unit">${varInfo.name} (${result.unit})</div>
        <div class="result-unit-full">${unitName}</div>
    `;
    
    // Add converted value if available
    if (conversion && conversion.unit && conversion.unit !== result.unit && conversion.value !== numericValue) {
        const convertedFormatted = UnitConverter.formatNumber(conversion.value);
        const convertedUnitName = UnitConverter.formatUnit(conversion.unit);
        resultHTML += `
            <div class="result-converted">
                <div class="converted-label">Also:</div>
                <div class="converted-value">${convertedFormatted} ${conversion.unit}</div>
                <div class="converted-unit">${convertedUnitName}</div>
            </div>
        `;
    }
    
    // For radians, always show degrees conversion if not already shown
    const isRadians = result.unit.toLowerCase().includes('radian') || result.unit.toLowerCase().includes('rad');
    if (isRadians && (!conversion || conversion.unit !== 'degrees')) {
        const degreesValue = numericValue * 180 / Math.PI;
        const degreesFormatted = UnitConverter.formatNumber(degreesValue);
        resultHTML += `
            <div class="result-converted">
                <div class="converted-label">Also in degrees:</div>
                <div class="converted-value">${degreesFormatted}°</div>
                <div class="converted-unit">degrees</div>
            </div>
        `;
    }
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
    
    // Scroll to result
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display error message
function displayError(message) {
    const resultDisplay = document.getElementById('result-display');
    resultDisplay.innerHTML = `
        <div class="error-message">${message}</div>
    `;
    resultDisplay.classList.add('show');
    
    // Scroll to error
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Perform stellar classification
function performClassification() {
    if (!stellarClassifier) {
        stellarClassifier = new StellarClassifier();
    }
    
    const temperatureInput = document.getElementById('temperature-input');
    const luminositySelect = document.getElementById('luminosity-class');
    const protostarCheckbox = document.getElementById('protostar-checkbox');
    const resultDisplay = document.getElementById('classification-result');
    
    if (!temperatureInput || !resultDisplay) {
        return;
    }
    
    const temperature = parseFloat(temperatureInput.value);
    const selectedValue = luminositySelect ? luminositySelect.value : '';
    
    // Determine if it's a white dwarf type or luminosity class
    const whiteDwarfTypes = ['DA', 'DB', 'DC', 'DO', 'DQ', 'DZ', 'DX'];
    const isWhiteDwarf = whiteDwarfTypes.includes(selectedValue);
    const whiteDwarfType = isWhiteDwarf ? selectedValue : '';
    const luminosityClass = isWhiteDwarf ? '' : selectedValue;
    
    const isProtostar = protostarCheckbox ? protostarCheckbox.checked : false;
    
    // Validate input
    if (!temperature || isNaN(temperature) || temperature <= 0) {
        displayClassificationError('Please enter a valid temperature (positive number in Kelvin)');
        return;
    }
    
    try {
        const classification = stellarClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
        displayClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
    } catch (error) {
        displayClassificationError(error.message);
    }
}

// Display classification result
function displayClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
    const resultDisplay = document.getElementById('classification-result');
    if (!resultDisplay) return;
    
    let resultHTML = '<div class="classification-result-content">';
    resultHTML += '<h4>Classification Result</h4>';
    resultHTML += `<div class="classification-value">${classification}</div>`;
    
    // Add details
    resultHTML += '<div class="classification-details">';
    resultHTML += `<p><strong>Temperature:</strong> ${UnitConverter.formatNumber(temperature)} K</p>`;
    
    if (isWhiteDwarf && whiteDwarfType) {
        const wdDesc = stellarClassifier.getWhiteDwarfDescription(whiteDwarfType);
        resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
        resultHTML += `<p><strong>White Dwarf Type:</strong> ${whiteDwarfType} (${wdDesc})</p>`;
    } else if (isProtostar) {
        resultHTML += '<p><strong>Type:</strong> Young Stellar Object (YSO)</p>';
    } else {
        if (luminosityClass) {
            const desc = stellarClassifier.getLuminosityDescription(luminosityClass);
            resultHTML += `<p><strong>Luminosity Class:</strong> ${luminosityClass} (${desc})</p>`;
        }
    }
    resultHTML += '</div>';
    
    resultHTML += '</div>';
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
}

// Perform classification from main page
function performMainClassification() {
    if (!stellarClassifier) {
        stellarClassifier = new StellarClassifier();
    }
    
    const temperatureInput = document.getElementById('main-temperature-input');
    const luminositySelect = document.getElementById('main-luminosity-class');
    const protostarCheckbox = document.getElementById('main-protostar-checkbox');
    const resultDisplay = document.getElementById('main-classification-result');
    
    if (!temperatureInput || !resultDisplay) {
        return;
    }
    
    const temperature = parseFloat(temperatureInput.value);
    const selectedValue = luminositySelect ? luminositySelect.value : '';
    
    // Determine if it's a white dwarf type or luminosity class
    const whiteDwarfTypes = ['DA', 'DB', 'DC', 'DO', 'DQ', 'DZ', 'DX'];
    const isWhiteDwarf = whiteDwarfTypes.includes(selectedValue);
    const whiteDwarfType = isWhiteDwarf ? selectedValue : '';
    const luminosityClass = isWhiteDwarf ? '' : selectedValue;
    
    const isProtostar = protostarCheckbox ? protostarCheckbox.checked : false;
    
    // Validate input
    if (!temperature || isNaN(temperature) || temperature <= 0) {
        displayMainClassificationError('Please enter a valid temperature (positive number in Kelvin)');
        return;
    }
    
    try {
        const classification = stellarClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
        displayMainClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
    } catch (error) {
        displayMainClassificationError(error.message);
    }
}

// Display classification result on main page
function displayMainClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
    const resultDisplay = document.getElementById('main-classification-result');
    if (!resultDisplay) return;
    
    let resultHTML = '<div class="classification-result-content">';
    resultHTML += '<h4>Classification Result</h4>';
    resultHTML += `<div class="classification-value">${classification}</div>`;
    
    // Add details
    resultHTML += '<div class="classification-details">';
    resultHTML += `<p><strong>Temperature:</strong> ${UnitConverter.formatNumber(temperature)} K</p>`;
    
    if (isWhiteDwarf && whiteDwarfType) {
        const wdDesc = stellarClassifier.getWhiteDwarfDescription(whiteDwarfType);
        resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
        resultHTML += `<p><strong>White Dwarf Type:</strong> ${whiteDwarfType} (${wdDesc})</p>`;
    } else if (isProtostar) {
        resultHTML += '<p><strong>Type:</strong> Young Stellar Object (YSO)</p>';
    } else {
        if (luminosityClass) {
            const desc = stellarClassifier.getLuminosityDescription(luminosityClass);
            resultHTML += `<p><strong>Luminosity Class:</strong> ${luminosityClass} (${desc})</p>`;
        }
    }
    resultHTML += '</div>';
    
    resultHTML += '</div>';
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
}

// Display classification error on main page
function displayMainClassificationError(message) {
    const resultDisplay = document.getElementById('main-classification-result');
    if (!resultDisplay) return;
    
    resultDisplay.innerHTML = `
        <div class="classification-error">${message}</div>
    `;
    resultDisplay.classList.add('show');
}

// Display classification error (in input screen)
function displayClassificationError(message) {
    const resultDisplay = document.getElementById('classification-result');
    if (!resultDisplay) return;
    
    resultDisplay.innerHTML = `
        <div class="classification-error">${message}</div>
    `;
    resultDisplay.classList.add('show');
}

// Initialize standalone Desmos calculator for main page
function initMainDesmosCalculator() {
    const container = document.getElementById('main-desmos-graph');
    if (!container) {
        console.error('Main Desmos container not found');
        return false;
    }

    // Check if container is visible
    const tab = container.closest('.main-tab-content');
    if (tab && !tab.classList.contains('active')) {
        console.warn('Desmos container is in hidden tab');
        return false;
    }

    // Ensure container has dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('Desmos container has no dimensions, waiting...');
        setTimeout(() => initMainDesmosCalculator(), 200);
        return false;
    }

    // Destroy existing calculator if it exists
    if (mainDesmosCalculator) {
        try {
            mainDesmosCalculator.destroy();
        } catch (e) {
            console.warn('Error destroying existing Desmos calculator:', e);
        }
        mainDesmosCalculator = null;
    }

    // Clear any error messages
    container.innerHTML = '';

    try {
        // Initialize full-featured Desmos calculator (with keypad and expressions enabled)
        mainDesmosCalculator = Desmos.GraphingCalculator(container, {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            showGrid: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y'
        });
        console.log('Main Desmos calculator initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing main Desmos calculator:', error);
        if (container) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Error initializing Desmos calculator: ' + error.message + '</p><p style="font-size: 0.9em; color: #999;">Please refresh the page.</p></div>';
        }
        return false;
    }
}

