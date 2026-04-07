/**
 * Variable Inputs Rendering Module
 * Extracted from ui.js for better modularity
 */

class VariableInputsRenderer {
    constructor() {
        this.helpers = typeof window !== 'undefined' && typeof window.helpers ? window.helpers : null;
        this.activeInputListeners = new Map();
    }

    /** Avoid undefined.getCanonical when globals load late or options.UnitConverter is missing. */
    _resolveUnitConverter() {
        try {
            if (
                typeof globalThis !== 'undefined' &&
                globalThis.UnitConverter &&
                typeof globalThis.UnitConverter.getCanonical === 'function'
            ) {
                return globalThis.UnitConverter;
            }
        } catch (_) {
            /* ignore */
        }
        if (
            typeof window !== 'undefined' &&
            window.UnitConverter &&
            typeof window.UnitConverter.getCanonical === 'function'
        ) {
            return window.UnitConverter;
        }
        return null;
    }

    _escapeHtml(text) {
        const value = String(text ?? '');
        if (this.helpers && typeof this.helpers.escapeHtml === 'function') {
            return this.helpers.escapeHtml(value);
        }
        if (typeof escapeHtml === 'function') {
            return escapeHtml(value);
        }
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /** Shown label for a variable (displaySymbol ?? symbol); internal symbol stays on data-symbol. */
    _getVariableDisplayLabel(variable) {
        const u = typeof globalThis !== 'undefined' && globalThis.formulaDisplayUtils;
        if (u && typeof u.getVariableDisplayLabel === 'function') {
            return u.getVariableDisplayLabel(variable);
        }
        return variable.symbol;
    }

    /** Prefer full definition from window.formulas when variables are missing (wrapped/stale objects). */
    _resolveFormula(formula) {
        if (!formula) return formula;
        let f = formula;
        if (f.formula && typeof f.formula === 'object' && f.formula.id) {
            f = f.formula;
        }
        const vars = f.variables;
        if ((!Array.isArray(vars) || vars.length === 0) && f.id && typeof window !== 'undefined' && Array.isArray(window.formulas)) {
            const canon = window.formulas.find((x) => x.id === f.id);
            if (canon) {
                f = canon;
            }
        }
        const UC = this._resolveUnitConverter();
        if (UC && typeof UC.normalizeFormulaUnit === 'function' && Array.isArray(f.variables)) {
            return {
                ...f,
                variables: f.variables.map((v) => ({
                    ...v,
                    unit: UC.normalizeFormulaUnit(v.unit) || v.unit
                }))
            };
        }
        return f;
    }

    /**
     * Stable, readable order for multi-unit cards; formula base unit stays first.
     */
    _orderAlternativeUnits(baseUnit, units) {
        const UC = this._resolveUnitConverter();
        if (!UC || typeof UC.getCanonical !== 'function' || !units || units.length < 2) {
            return units;
        }
        const baseC = UC.getCanonical(baseUnit);
        const cat = UC.getUnitCategory(baseC);
        const list = [...units];
        if (cat === 'distance') {
            const order = ['pc', 'ly', 'AU', 'R☉', 'm', 'km', 'cm', 'mm', 'μm', 'nm'];
            list.sort((a, b) => {
                const ia = order.indexOf(UC.getCanonical(a));
                const ib = order.indexOf(UC.getCanonical(b));
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            });
        } else if (cat === 'mass') {
            const order = ['kg', 'g', 'M☉', 'M_earth'];
            list.sort((a, b) => {
                const ia = order.indexOf(UC.getCanonical(a));
                const ib = order.indexOf(UC.getCanonical(b));
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            });
        } else if (cat === 'time') {
            const order = ['s', 'min', 'h', 'day', 'yr'];
            list.sort((a, b) => {
                const ia = order.indexOf(UC.getCanonical(a));
                const ib = order.indexOf(UC.getCanonical(b));
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            });
        } else if (cat === 'power') {
            const order = ['W', 'L☉', 'erg/s'];
            list.sort((a, b) => {
                const ia = order.indexOf(UC.getCanonical(a));
                const ib = order.indexOf(UC.getCanonical(b));
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            });
        } else if (cat === 'frequency') {
            const order = ['Hz', 'kHz', 'MHz', 'GHz', 'km/(s·Mpc)'];
            list.sort((a, b) => {
                const ia = order.indexOf(UC.getCanonical(a));
                const ib = order.indexOf(UC.getCanonical(b));
                return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            });
        }
        const bi = list.findIndex((u) => UC.getCanonical(u) === baseC);
        if (bi > 0) {
            const [row] = list.splice(bi, 1);
            list.unshift(row);
        }
        return list;
    }

    /**
     * Stellar radius / size: offer R☉ when the variable is clearly a radius, not e.g. generic separation.
     */
    _shouldOfferSolarRadius(variable) {
        const sym = String(variable.symbol || '').trim();
        const n = (variable.name || '').toLowerCase();
        const d = (variable.description || '').toLowerCase();
        const t = `${n} ${d}`;
        if (/\bradius|radii|stellar|photosphere|solar|subtend|angular diameter|limb|disk|size of|extent/i.test(t)) {
            return true;
        }
        if (/^r$/i.test(sym) || /^R$/i.test(sym)) return true;
        if (/^r_|^R_/i.test(sym) && /radius|star|sun|☉|orbit/i.test(sym + t)) return true;
        return false;
    }

    /**
     * Ensure solar mass (M☉), luminosity (L☉), or radius (R☉) appears alongside SI so conversions use the same nominal solar values as the engine.
     */
    _ensureSolarUnitsForVariable(variable, baseUnit, units) {
        const UC = this._resolveUnitConverter();
        if (!units || !UC) return units;
        const norm = UC.normalizeFormulaUnit ? UC.normalizeFormulaUnit(baseUnit) || baseUnit : baseUnit;
        const c = UC.getCanonical(norm);
        const cat = UC.getUnitCategory(c);
        const set = new Set(units);
        if (cat === 'mass') {
            set.add('M☉');
        } else if (cat === 'power') {
            set.add('L☉');
        } else if (cat === 'distance' && this._shouldOfferSolarRadius(variable)) {
            set.add('R☉');
        }
        return [...set];
    }
    
    /**
     * Get DOM element (with caching)
     */
    getElement(id) {
        if (this.helpers && typeof this.helpers.getElement === 'function') {
            const el = this.helpers.getElement(id);
            if (el) {
                return el;
            }
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

        formula = this._resolveFormula(formula);
        const UC = this._resolveUnitConverter();

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
                    'G': { key: 'G', value: '6.67430 × 10⁻¹¹ N·m²/kg² (CODATA 2022)' },
                    'c': { key: 'c', value: '299792458 m/s (SI exact)' },
                    'σ': { key: 'σ', value: '5.670374419… × 10⁻⁸ W/(m²·K⁴) (SI exact)' },
                    'sigma': { key: 'σ', value: '5.670374419… × 10⁻⁸ W/(m²·K⁴) (SI exact)' }
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
                
                constantItem.innerHTML = `<strong>${this._escapeHtml(displayKey)}:</strong> ${this._escapeHtml(String(displayValue))}`;
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
            
            const baseUnit =
                UC && typeof UC.normalizeFormulaUnit === 'function'
                    ? UC.normalizeFormulaUnit(variable.unit) || variable.unit
                    : variable.unit;
            const fullUnitName = UC ? UC.formatUnit(baseUnit) : baseUnit;

            // Get alternative units
            let alternativeUnits = UC ? UC.getAlternativeUnits(baseUnit) : [baseUnit];
            alternativeUnits = this._ensureSolarUnitsForVariable(variable, baseUnit, alternativeUnits);
            
            // Wavelength-style variables: keep a compact set of length units for the card grid.
            const isWavelengthVar = variable.symbol.toLowerCase().includes('lambda') || 
                                    variable.symbol.toLowerCase().includes('λ') ||
                                    variable.symbol.toLowerCase().includes('wavelength') ||
                                    variable.name.toLowerCase().includes('wavelength') ||
                                    baseUnit === 'nm' || baseUnit === 'μm' || baseUnit === 'mm' || baseUnit === 'cm';
            
            let skipGlobalUnitOrder = false;
            if (isWavelengthVar && (baseUnit === 'meters' || baseUnit === 'm')) {
                alternativeUnits = ['m', 'nm', 'μm', 'mm', 'cm'].filter(u => 
                    alternativeUnits.includes(u) || u === baseUnit
                );
                skipGlobalUnitOrder = true;
            }

            if (!skipGlobalUnitOrder) {
                alternativeUnits = this._orderAlternativeUnits(baseUnit, alternativeUnits);
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
            
            const colUnit = (u) =>
                u != null && String(u).trim() !== '' ? String(u).trim() : String(baseUnit);

            const displaySym = this._getVariableDisplayLabel(variable);

            // Create input fields HTML
            let inputFieldsHTML = '';
            alternativeUnits.forEach((unit, index) => {
                const safeUnit = colUnit(unit);
                const isBase = UC
                    ? UC.getCanonical(safeUnit) === UC.getCanonical(baseUnit)
                    : safeUnit === baseUnit || safeUnit.toLowerCase() === baseUnit.toLowerCase();
                const inputId = `var-${variable.symbol}-${safeUnit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                let placeholder;
                if (isBase) {
                    if (exampleValue) {
                        placeholder = `Enter ${variable.name.toLowerCase()} (e.g., ${exampleValue})`;
                    } else {
                        placeholder = `Enter ${variable.name.toLowerCase()}`;
                    }
                } else {
                    placeholder = `Or enter in ${safeUnit}`;
                }
                
                const unitName = UC ? UC.formatUnit(safeUnit) : safeUnit;

                const conversionHint = !isBase && UC ? UC.getConversionHintToBase(safeUnit, baseUnit) : '';
                const hintHtml = conversionHint
                    ? `<div class="unit-conversion-hint" title="How this field converts to the formula base unit">${this._escapeHtml(conversionHint)}</div>`
                    : '';
                
                inputFieldsHTML += `
                    <div class="unit-input-group">
                        <label class="unit-input-label" for="${inputId}">
                            <span class="unit-symbol">${safeUnit}</span>
                            <span class="unit-name">${unitName}</span>
                        </label>
                        ${hintHtml}
                        <input 
                            type="text" 
                            id="${inputId}" 
                            name="${inputId}"
                            class="unit-input-field"
                            placeholder="${placeholder}"
                            data-symbol="${variable.symbol}"
                            data-unit="${safeUnit}"
                            data-unit-index="${index}"
                            data-base-unit="${baseUnit}"
                            aria-label="${variable.name} in ${safeUnit}"
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
            const multiUnitNote = alternativeUnits.length > 1
                ? `<div class="unit-options-note" role="note">Enter any unit below; values sync with Calculate. <strong>Formula unit</strong> for <code>${this._escapeHtml(displaySym)}</code>: <strong>${this._escapeHtml(fullUnitName)}</strong> (${this._escapeHtml(baseUnit)}).</div>`
                : '';

            const siContext =
                UC && typeof UC.getSiBaseContextForUnit === 'function' ? UC.getSiBaseContextForUnit(baseUnit) : '';
            const siContextHtml = siContext
                ? `<div class="unit-si-context" role="note" title="How this dimension relates to SI">${this._escapeHtml(siContext)}</div>`
                : '';

            inputDiv.innerHTML = `
                <label class="variable-main-label" for="${firstInputId}">
                    <span class="symbol">${this._escapeHtml(displaySym)}</span>
                    <span class="variable-name">${variable.name}</span>
                    <span class="solve-hint" data-symbol="${variable.symbol}">Leave empty to calculate this</span>
                </label>
                ${multiUnitNote}
                ${siContextHtml}
                <div class="unit-inputs-container">
                    ${inputFieldsHTML}
                </div>
                <div class="var-description">${this._escapeHtml(variable.description || '')}</div>
            `;
            
            variablesFragment.appendChild(inputDiv);
            
            // Store input elements for this variable (for unit synchronization)
            const inputElements = alternativeUnits.map((unit, currentIndex) => {
                const safeUnit = colUnit(unit);
                const inputId = `var-${variable.symbol}-${safeUnit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const input = document.getElementById(inputId);
                return { input, unit: safeUnit, currentIndex, symbol: variable.symbol };
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

                    // When the user starts typing in one unit field, clear all other unit fields
                    // for the same variable so stale/synced values don't confuse the calculation.
                    const currentText = (e.target.value || '').trim();
                    if (currentText.length > 0) {
                        elements.forEach(({ input: otherInput }) => {
                            if (!otherInput || otherInput === e.target) return;
                            if (otherInput.value && otherInput.value.trim()) {
                                otherInput.value = '';
                                otherInput.dataset.calculated = 'false';
                                otherInput.dataset.userEdited = 'false';
                            }
                        });
                    }
                    
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
                
                // Blur: mirror the value into other unit fields via UnitConverter (same chain as engine)
                if (!this.delegatedBlurHandler) {
                    this.delegatedBlurHandler = (e) => {
                        if (!e.target.classList.contains('unit-input-field')) return;
                        
                        const symbol = e.target.getAttribute('data-symbol');
                        if (!symbol) return;
                        
                        const elements = this.inputElementsBySymbol?.get(symbol);
                        if (!elements) return;
                        
                        const currentValue = e.target.value.trim();
                        const currentIndex = elements.findIndex(el => el.input === e.target);
                        
                        if (!currentValue || currentValue.toLowerCase() === 'null') {
                            elements.forEach(({ input: otherInput, currentIndex: otherIndex }) => {
                                if (otherIndex !== currentIndex && otherInput) {
                                    otherInput.value = '';
                                    otherInput.dataset.calculated = 'false';
                                }
                            });
                            return;
                        }
                        
                        const numericValue = parseFloat(currentValue);
                        const isValidNumber = !isNaN(numericValue) && isFinite(numericValue);
                        
                        if (!isValidNumber) {
                            elements.forEach(({ input: otherInput, currentIndex: otherIndex }) => {
                                if (otherIndex !== currentIndex && otherInput) {
                                    otherInput.value = '';
                                    otherInput.dataset.calculated = 'false';
                                }
                            });
                            return;
                        }
                        
                        e.target.dataset.calculated = 'false';
                        e.target.dataset.userEdited = 'true';
                        
                        const UCb = this._resolveUnitConverter();
                        if (UCb) {
                            const fromUnit = e.target.getAttribute('data-unit');
                            if (!fromUnit) return;
                            elements.forEach(({ input: otherInput, unit: otherUnit, currentIndex: otherIndex }) => {
                                if (otherIndex === currentIndex || !otherInput) return;
                                const c = UCb.convert(numericValue, fromUnit, otherUnit);
                                if (c !== null && Number.isFinite(c)) {
                                    otherInput.value = UCb.formatNumber(c);
                                    otherInput.dataset.calculated = 'true';
                                    otherInput.dataset.userEdited = 'false';
                                } else {
                                    otherInput.value = '';
                                    otherInput.dataset.calculated = 'false';
                                }
                            });
                        } else {
                            elements.forEach(({ input: otherInput, currentIndex: otherIndex }) => {
                                if (otherIndex !== currentIndex && otherInput) {
                                    otherInput.value = '';
                                    otherInput.dataset.calculated = 'false';
                                }
                            });
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
                        // Blur first so delegated blur handler mirrors this field into sibling unit columns
                        // before the orchestrator reads the DOM. Otherwise Calculate can see stale values
                        // or empty siblings → false "no inputs" → symbolic / conversion errors.
                        const target = e.target;
                        if (typeof target.blur === 'function') {
                            target.blur();
                        }
                        const run = () => {
                            if (typeof performCalculation === 'function') {
                                performCalculation();
                            }
                        };
                        if (typeof queueMicrotask === 'function') {
                            queueMicrotask(run);
                        } else {
                            setTimeout(run, 0);
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

