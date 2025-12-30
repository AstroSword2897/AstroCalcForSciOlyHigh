/**
 * Variable Inputs Rendering Module
 * Extracted from ui.js for better modularity
 */

class VariableInputsRenderer {
    constructor() {
        this.helpers = typeof window !== 'undefined' && typeof window.helpers ? window.helpers : null;
        this.activeInputListeners = new Map();
    }
    
    /**
     * Get DOM element (with caching)
     */
    getElement(id) {
        if (this.helpers) {
            return this.helpers.getElement(id);
        }
        return document.getElementById(id);
    }
    
    /**
     * Cleanup variable inputs
     */
    cleanup() {
        // Remove all active listeners
        this.activeInputListeners.forEach((listeners, element) => {
            if (listeners.inputListener) {
                element.removeEventListener('input', listeners.inputListener);
            }
            if (listeners.changeListener) {
                element.removeEventListener('change', listeners.changeListener);
            }
            if (listeners.keydownListener) {
                element.removeEventListener('keydown', listeners.keydownListener);
            }
        });
        this.activeInputListeners.clear();
    }
    
    /**
     * Render input fields for each variable in a formula
     * @param {Object} formula - Formula object with variables
     */
    render(formula) {
        // Cleanup previous inputs
        this.cleanup();
        
        const container = this.getElement('variables-container');
        if (!container) {
            console.error('[VariableInputsRenderer] ❌ variables-container element not found!');
            return;
        }
        
        // Ensure container is visible
        container.style.display = 'grid';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.classList.remove('hidden');
        container.innerHTML = '';
        
        // Get constant symbols to exclude
        const constantSymbols = new Set();
        if (formula.constants) {
            Object.keys(formula.constants).forEach(key => {
                constantSymbols.add(key);
                if (key === 'pi' || key === 'π') constantSymbols.add('π');
                if (key === 'G') constantSymbols.add('G');
                if (key === 'c') constantSymbols.add('c');
                if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
            });
        }
        
        // Filter out formula-specific constants
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
                
                constantItem.innerHTML = `<strong>${escapeHtml(displayKey)}:</strong> ${escapeHtml(String(displayValue))}`;
                constantsList.appendChild(constantItem);
            });
            
            container.appendChild(constantsDiv);
        }
        
        // Render input fields for each variable
        userVariables.forEach(variable => {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'variable-input';
            
            const baseUnit = variable.unit;
            const fullUnitName = typeof UnitConverter !== 'undefined' 
                ? UnitConverter.formatUnit(baseUnit)
                : baseUnit;
            
            // Get alternative units
            let alternativeUnits = typeof UnitConverter !== 'undefined'
                ? UnitConverter.getAlternativeUnits(baseUnit)
                : [baseUnit];
            
            // Detect wavelength variables for unit filtering
            const isWavelengthVar = variable.symbol.toLowerCase().includes('lambda') || 
                                    variable.symbol.toLowerCase().includes('λ') ||
                                    variable.symbol.toLowerCase().includes('wavelength') ||
                                    variable.name.toLowerCase().includes('wavelength') ||
                                    baseUnit === 'nm' || baseUnit === 'μm' || baseUnit === 'mm' || baseUnit === 'cm';
            
            if ((baseUnit === 'meters' || baseUnit === 'm') && !isWavelengthVar) {
                alternativeUnits = alternativeUnits.filter(u => 
                    !['nm', 'μm', 'mm', 'cm'].includes(u) || u === baseUnit
                );
            } else if (isWavelengthVar && (baseUnit === 'meters' || baseUnit === 'm')) {
                alternativeUnits = ['m', 'nm', 'μm', 'mm', 'cm'].filter(u => 
                    alternativeUnits.includes(u) || u === baseUnit
                );
            }
            
            // Get example value for placeholder
            let exampleValue = null;
            try {
                if (typeof getExampleValue === 'function') {
                    exampleValue = getExampleValue(variable.symbol, baseUnit);
                }
            } catch (error) {
                console.warn(`[VariableInputsRenderer] Symbol lookup failed for ${variable.symbol}:`, error);
            }
            
            // Create input fields HTML
            let inputFieldsHTML = '';
            alternativeUnits.forEach((unit, index) => {
                const isBase = unit === baseUnit || unit.toLowerCase() === baseUnit.toLowerCase();
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                let placeholder;
                if (isBase) {
                    if (exampleValue) {
                        placeholder = `Enter ${variable.name.toLowerCase()} (e.g., ${exampleValue})`;
                    } else {
                        placeholder = `Enter ${variable.name.toLowerCase()}`;
                    }
                } else {
                    placeholder = `Or enter in ${unit}`;
                }
                
                const unitName = typeof UnitConverter !== 'undefined'
                    ? UnitConverter.formatUnit(unit)
                    : unit;
                
                inputFieldsHTML += `
                    <div class="unit-input-group">
                        <label class="unit-input-label" for="${inputId}">
                            <span class="unit-symbol">${unit}</span>
                            <span class="unit-name">${unitName}</span>
                        </label>
                        <input 
                            type="text" 
                            id="${inputId}" 
                            name="${inputId}"
                            class="unit-input-field"
                            placeholder="${placeholder}"
                            data-symbol="${variable.symbol}"
                            data-unit="${unit}"
                            data-unit-index="${index}"
                            data-base-unit="${baseUnit}"
                            aria-label="${variable.name} in ${unit}"
                        >
                    </div>
                `;
            });
            
            const firstInputId = `var-${variable.symbol}-${baseUnit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            
            inputDiv.innerHTML = `
                <label class="variable-main-label" for="${firstInputId}">
                    <span class="symbol">${variable.symbol}</span>
                    <span class="variable-name">${variable.name}</span>
                    <span class="solve-hint" data-symbol="${variable.symbol}">Leave empty to calculate this</span>
                </label>
                <div class="unit-inputs-container">
                    ${inputFieldsHTML}
                </div>
                <div class="var-description">${variable.description}</div>
                <div class="na-option">
                    <label class="na-checkbox-label" for="na-${variable.symbol}">
                        <input type="checkbox" class="na-checkbox" id="na-${variable.symbol}" name="na-${variable.symbol}" data-symbol="${variable.symbol}" aria-label="Mark ${variable.symbol} as unknown">
                        <span>Mark as unknown (use as variable in symbolic calculations)</span>
                    </label>
                </div>
            `;
            
            container.appendChild(inputDiv);
            
            // Add input listeners
            const inputElements = alternativeUnits.map((unit, currentIndex) => {
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                return { input: document.getElementById(inputId), unit, currentIndex };
            }).filter(item => item.input !== null);
            
            inputElements.forEach(({ input, currentIndex }) => {
                if (input) {
                    const inputListener = (e) => {
                        const currentValue = e.target.value.trim();
                        if (currentValue && currentValue.toLowerCase() !== 'null') {
                            inputElements.forEach(({ input: otherInput, currentIndex: otherIndex }) => {
                                if (otherIndex !== currentIndex && otherInput) {
                                    otherInput.value = '';
                                }
                            });
                        }
                        
                        clearTimeout(input.solveIndicatorTimeout);
                        input.solveIndicatorTimeout = setTimeout(() => {
                            if (typeof updateSolveIndicators === 'function') {
                                updateSolveIndicators();
                            }
                            if (typeof GRAPH_UPDATES_ENABLED !== 'undefined' && GRAPH_UPDATES_ENABLED && typeof currentFormula !== 'undefined' && currentFormula) {
                                if (typeof getCurrentVariableValues === 'function' && typeof updateGraphIfEnabled === 'function') {
                                    const variableValues = getCurrentVariableValues();
                                    updateGraphIfEnabled(currentFormula, variableValues);
                                }
                            }
                        }, typeof TIMING !== 'undefined' ? TIMING.DEBOUNCE_INDICATORS : 300);
                    };
                    input.addEventListener('input', inputListener);
                    this.activeInputListeners.set(input, { inputListener });
                }
            });
            
            // Add N/A checkbox listener
            const naCheckbox = inputDiv.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
            if (naCheckbox) {
                const changeListener = (e) => {
                    if (e.target.checked) {
                        inputElements.forEach(({ input }) => {
                            if (input) input.value = '';
                        });
                    }
                    clearTimeout(naCheckbox.updateTimeout);
                    naCheckbox.updateTimeout = setTimeout(() => {
                        if (typeof updateSolveIndicators === 'function') {
                            updateSolveIndicators();
                        }
                        if (typeof GRAPH_UPDATES_ENABLED !== 'undefined' && GRAPH_UPDATES_ENABLED && typeof currentFormula !== 'undefined' && currentFormula) {
                            if (typeof getCurrentVariableValues === 'function' && typeof updateGraphIfEnabled === 'function') {
                                const variableValues = getCurrentVariableValues();
                                updateGraphIfEnabled(currentFormula, variableValues);
                            }
                        }
                    }, typeof TIMING !== 'undefined' ? TIMING.DEBOUNCE_INDICATORS : 300);
                };
                naCheckbox.addEventListener('change', changeListener);
                this.activeInputListeners.set(naCheckbox, { changeListener });
            }
        });
        
        // Initial update of solve indicators
        if (typeof updateSolveIndicators === 'function') {
            setTimeout(() => {
                updateSolveIndicators();
            }, typeof TIMING !== 'undefined' ? TIMING.INIT_RETRY_DELAY : 100);
        }
        
        // Auto-focus first input
        const firstInput = container.querySelector('.unit-input-field');
        if (firstInput) {
            setTimeout(() => {
                firstInput.focus();
            }, typeof TIMING !== 'undefined' ? TIMING.AUTO_FOCUS_DELAY : 200);
        }
        
        // Keyboard navigation
        const allInputs = container.querySelectorAll('.unit-input-field');
        allInputs.forEach((input, index) => {
            const keydownListener = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const filledCount = Array.from(allInputs).filter(inp => inp.value.trim()).length;
                    if (filledCount >= userVariables.length - 1) {
                        if (typeof performCalculation === 'function') {
                            performCalculation();
                        }
                    } else {
                        const nextIndex = (index + 1) % allInputs.length;
                        allInputs[nextIndex].focus();
                    }
                } else if (e.key === 'Tab' && !e.shiftKey) {
                    const nextIndex = (index + 1) % allInputs.length;
                    if (nextIndex === 0) {
                        const calcBtn = this.getElement('calculate-btn');
                        if (calcBtn) {
                            e.preventDefault();
                            calcBtn.focus();
                        }
                    }
                }
            };
            input.addEventListener('keydown', keydownListener);
            this.activeInputListeners.set(input, { ...this.activeInputListeners.get(input), keydownListener });
        });
    }
}

// Export
if (typeof window !== 'undefined') {
    window.VariableInputsRenderer = VariableInputsRenderer;
    // Create singleton instance
    window.variableInputsRenderer = new VariableInputsRenderer();
}

