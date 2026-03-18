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
        
        // Remove delegated handlers
        const container = this.getElement('variables-container');
        if (container) {
            if (this.delegatedInputHandler) {
                container.removeEventListener('input', this.delegatedInputHandler, true);
                this.delegatedInputHandler = null;
            }
            if (this.delegatedBlurHandler) {
                container.removeEventListener('blur', this.delegatedBlurHandler, true);
                this.delegatedBlurHandler = null;
            }
            if (this.delegatedKeydownHandler) {
                container.removeEventListener('keydown', this.delegatedKeydownHandler, true);
                this.delegatedKeydownHandler = null;
            }
        }
        
        // Clear timeout
        if (this.solveIndicatorTimeout) {
            clearTimeout(this.solveIndicatorTimeout);
            this.solveIndicatorTimeout = null;
        }
        
        // Clear input elements map
        if (this.inputElementsBySymbol) {
            this.inputElementsBySymbol.clear();
        }
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
        
        // Vectorized: Get constant symbols to exclude using Set operations
        const constantSymbols = new Set();
        if (formula.constants) {
            // Vectorized: Use flatMap to create array of all constant variations
            const constantKeys = Object.keys(formula.constants);
            constantKeys.flatMap(key => {
                const variations = [key];
                // Add symbol variations
                if (key === 'pi' || key === 'π') variations.push('π');
                if (key === 'G') variations.push('G');
                if (key === 'c') variations.push('c');
                if (key === 'σ' || key === 'sigma') variations.push('σ');
                return variations;
            }).forEach(symbol => constantSymbols.add(symbol));
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
            
            // Vectorized: Use map + DocumentFragment for batch DOM operations
            const constantsFragment = document.createDocumentFragment();
            Object.entries(formula.constants).map(([key, value]) => {
                const constantItem = document.createElement('div');
                constantItem.className = 'constant-item';
                
                // Vectorized: Use object mapping for constant formatting
                const constantFormats = {
                    'pi': { key: 'π', value: '3.14159...' },
                    'π': { key: 'π', value: '3.14159...' },
                    'G': { key: 'G', value: '6.67430 × 10⁻¹¹ N·m²/kg²' },
                    'c': { key: 'c', value: '2.998 × 10⁸ m/s' },
                    'σ': { key: 'σ', value: '5.670 × 10⁻⁸ W/(m²·K⁴)' },
                    'sigma': { key: 'σ', value: '5.670 × 10⁻⁸ W/(m²·K⁴)' }
                };
                
                const format = constantFormats[key] || {};
                const displayKey = format.key || key;
                let displayValue = format.value || value;
                
                // Format numeric values
                if (!format.value && typeof value === 'number') {
                    displayValue = (Math.abs(value) < 0.001 || Math.abs(value) > 1000)
                        ? value.toExponential(3)
                        : value.toString();
                }
                
                constantItem.innerHTML = `<strong>${escapeHtml(displayKey)}:</strong> ${escapeHtml(String(displayValue))}`;
                constantsFragment.appendChild(constantItem);
                return constantItem;
            });
            constantsList.appendChild(constantsFragment);
            
            container.appendChild(constantsDiv);
        }
        
        // Vectorized: Render input fields using map + DocumentFragment
        const variablesFragment = document.createDocumentFragment();
        userVariables.map(variable => {
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
                            autocomplete="off"
                            spellcheck="false"
                            inputmode="decimal"
                            tabindex="0"
                        >
                    </div>
                `;
            });
            
            // Calculate firstInputId to match the actual first input in the generated HTML
            // The first input is always the first unit in alternativeUnits (or baseUnit if empty)
            const firstUnit = alternativeUnits.length > 0 ? alternativeUnits[0] : baseUnit;
            const firstInputId = `var-${variable.symbol}-${firstUnit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            
            // Verify the firstInputId matches an actual input ID in the HTML
            // This ensures the label's 'for' attribute correctly references the first input
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
            `;
            
            variablesFragment.appendChild(inputDiv);
            
            // Store input elements for this variable (for unit synchronization)
            const inputElements = alternativeUnits.map((unit, currentIndex) => {
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const input = document.getElementById(inputId);
                return { input, unit, currentIndex, symbol: variable.symbol };
            }).filter(item => item.input !== null);
            
            // Store for event delegation (more efficient than individual listeners)
            if (!this.inputElementsBySymbol) {
                this.inputElementsBySymbol = new Map();
            }
            this.inputElementsBySymbol.set(variable.symbol, inputElements);
            
            // Use event delegation for better performance (single listener per variable group)
            if (inputElements.length > 0 && !this.delegatedInputHandler) {
                this.delegatedInputHandler = (e) => {
                    if (!e.target.classList.contains('unit-input-field')) return;
                    
                    const symbol = e.target.getAttribute('data-symbol');
                    if (!symbol) return;
                    
                    const elements = this.inputElementsBySymbol?.get(symbol);
                    if (!elements) return;

                    // Remember which unit-field the user is actively editing.
                    // This avoids using stale values from a different unit-field when the user
                    // hits "Calculate" before blur events clear other inputs.
                    elements.forEach(({ input: otherInput }) => {
                        if (!otherInput) return;
                        otherInput.dataset.userEdited = otherInput === e.target ? 'true' : 'false';
                    });
                    
                    // CRITICAL FIX: Don't clear other inputs on input event
                    // This prevents clearing partially typed numbers
                    // We'll handle clearing in a blur handler instead
                    
                    // Clear the "calculated" flag when user manually edits
                    if (e.target.dataset.calculated === 'true') {
                        e.target.dataset.calculated = 'false';
                    }
                    
                    // Debounced update of solve indicators and graph
                    clearTimeout(this.solveIndicatorTimeout);
                    this.solveIndicatorTimeout = setTimeout(() => {
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
                
                container.addEventListener('input', this.delegatedInputHandler, true);
                
                // Add blur handler to clear other unit inputs when a valid value is entered
                if (!this.delegatedBlurHandler) {
                    this.delegatedBlurHandler = (e) => {
                        if (!e.target.classList.contains('unit-input-field')) return;
                        
                        const symbol = e.target.getAttribute('data-symbol');
                        if (!symbol) return;
                        
                        const elements = this.inputElementsBySymbol?.get(symbol);
                        if (!elements) return;
                        
                        const currentValue = e.target.value.trim();
                        const currentIndex = elements.findIndex(el => el.input === e.target);
                        
                        // Only clear other inputs if we have a valid number
                        if (currentValue && currentValue.toLowerCase() !== 'null') {
                            const numericValue = parseFloat(currentValue);
                            const isValidNumber = !isNaN(numericValue) && isFinite(numericValue);
                            
                            if (isValidNumber) {
                                // Clear the "calculated" flag since user is manually entering a value
                                e.target.dataset.calculated = 'false';
                                
                                // Clear other unit inputs for the same variable
                                elements.forEach(({ input: otherInput, currentIndex: otherIndex }) => {
                                    if (otherIndex !== currentIndex && otherInput) {
                                        otherInput.value = '';
                                        otherInput.dataset.calculated = 'false';
                                    }
                                });
                            }
                        }
                    };
                    
                    container.addEventListener('blur', this.delegatedBlurHandler, true);
                }
            }
            
            return inputDiv;
        });
        
        // Single DOM update for all variable inputs
        container.appendChild(variablesFragment);
        
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
        
        // Keyboard navigation with event delegation (more efficient)
        if (!this.delegatedKeydownHandler) {
            this.delegatedKeydownHandler = (e) => {
                if (!e.target.classList.contains('unit-input-field')) return;
                
                const allInputs = Array.from(container.querySelectorAll('.unit-input-field'));
                const index = allInputs.indexOf(e.target);
                if (index === -1) return;
                
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    
                    // CRITICAL FIX: Count VARIABLES, not INPUTS
                    // A single variable may have multiple unit inputs (e.g., meters, km, miles)
                    // We need to count how many unique variables have values, not total inputs
                    const filledSymbols = new Set(
                        allInputs
                            .filter(inp => {
                                const value = inp.value.trim();
                                if (!value) return false;
                                // Only count if it's a valid number
                                const num = parseFloat(value);
                                return !isNaN(num) && isFinite(num);
                            })
                            .map(inp => inp.getAttribute('data-symbol'))
                            .filter(symbol => symbol) // Filter out null/undefined
                    );
                    
                    // If we have N-1 variables filled (where N is total variables), calculate
                    // Or if user explicitly wants to calculate (Enter key), always allow it
                    if (filledSymbols.size >= userVariables.length - 1 || filledSymbols.size > 0) {
                        if (typeof performCalculation === 'function') {
                            performCalculation();
                        }
                    } else {
                        const nextIndex = (index + 1) % allInputs.length;
                        allInputs[nextIndex]?.focus();
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
            
            container.addEventListener('keydown', this.delegatedKeydownHandler, true);
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.VariableInputsRenderer = VariableInputsRenderer;
    // Create singleton instance
    window.variableInputsRenderer = new VariableInputsRenderer();
}

