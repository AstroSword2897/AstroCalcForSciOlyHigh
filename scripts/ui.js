// User Interface Controller

let currentFormula = null;
let calculator = null;

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
    formulas.forEach(formula => {
        const card = createFormulaCard(formula);
        formulaList.appendChild(card);
    });
    
    console.log(`Rendered ${formulas.length} formula cards`);
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
}

// Render input fields for each variable
function renderVariableInputs(formula) {
    const container = document.getElementById('variables-container');
    container.innerHTML = '';
    
    formula.variables.forEach(variable => {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'variable-input';
        
        inputDiv.innerHTML = `
            <label>
                <span class="symbol">${variable.symbol}</span> - ${variable.name}
            </label>
            <input 
                type="text" 
                id="var-${variable.symbol}" 
                placeholder="Enter value or 'null'"
                data-symbol="${variable.symbol}"
            >
            <div class="unit">Unit: ${variable.unit}</div>
            <div class="var-description">${variable.description}</div>
        `;
        
        container.appendChild(inputDiv);
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
    });
    
    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', performCalculation);
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
        currentFormula.variables.forEach(variable => {
            const input = document.getElementById(`var-${variable.symbol}`);
            if (input) input.value = '';
        });
        document.getElementById('result-display').classList.remove('show');
    });
    
    // Allow Enter key to calculate
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && document.getElementById('input-screen').classList.contains('active')) {
            performCalculation();
        }
    });
}

// Perform the calculation
function performCalculation() {
    if (!calculator || !currentFormula) {
        return;
    }
    
    // Collect variable values
    const variableValues = {};
    currentFormula.variables.forEach(variable => {
        const input = document.getElementById(`var-${variable.symbol}`);
        const value = input.value.trim();
        
        // Convert 'null' or empty to null
        if (value === '' || value.toLowerCase() === 'null') {
            variableValues[variable.symbol] = null;
        } else {
            variableValues[variable.symbol] = value;
        }
    });
    
    // Perform calculation
    try {
        const result = calculator.solve(variableValues);
        displayResult(result);
    } catch (error) {
        displayError(error.message);
    }
}

// Display calculation result
function displayResult(result) {
    const resultDisplay = document.getElementById('result-display');
    const varInfo = currentFormula.variables.find(v => v.symbol === result.variable);
    
    // Format the result (use scientific notation for very large/small numbers)
    let formattedValue = result.value;
    if (Math.abs(result.value) >= 1e6 || (Math.abs(result.value) < 1e-3 && result.value !== 0)) {
        formattedValue = result.value.toExponential(4);
    } else {
        formattedValue = result.value.toFixed(4);
    }
    
    resultDisplay.innerHTML = `
        <h3>Result</h3>
        <div class="result-value">${formattedValue}</div>
        <div class="result-unit">${varInfo.name} (${result.unit})</div>
    `;
    
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

