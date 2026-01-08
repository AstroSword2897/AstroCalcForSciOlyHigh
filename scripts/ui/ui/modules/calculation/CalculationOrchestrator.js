/**
 * CalculationOrchestrator - IMPROVED VERSION
 * Better error handling, validation, and user feedback
 */
export class CalculationOrchestrator {
    constructor(options) {
        this.calculationHistory = [];
        this.MAX_HISTORY = 100;
        this.getCalculator = options.getCalculator;
        this.getFormula = options.getFormula;
        this.getGraphManager = options.getGraphManager;
        this.parseNumericValue = options.parseNumericValue;
        this.displayResult = options.displayResult;
        this.displayError = options.displayError;
        this.updateGraphIfEnabled = options.updateGraphIfEnabled;
        this.updateGraphInterpretation = options.updateGraphInterpretation;
        this.updateSolveIndicators = options.updateSolveIndicators;
        this.unitConverter = options.unitConverter;
        this.globalConstants = options.globalConstants || {};
        this.graphUpdatesEnabled = options.graphUpdatesEnabled ?? true;
        
        // Performance optimizations: caching and locking
        this._calculationInProgress = false; // Pure lock pattern (no debounce)
        this._inputCache = new Map(); // Cache DOM queries: O(1) lookup instead of O(n)
        this._constantSymbolsCache = new Map(); // Cache constant symbols per formula
        this._lastCalculationHash = null; // Prevent duplicate calculations
        
        // Configurable error message rules (can be extended)
        this.errorMessageRules = options.errorMessageRules || this._getDefaultErrorMessageRules();
    }
    
    /**
     * Get default error message rules (can be overridden via constructor)
     */
    _getDefaultErrorMessageRules() {
        return [
            {
                pattern: /null values/i,
                message: 'You can leave multiple variables empty or mark them as N/A to get a symbolic expression. For a numeric result, leave exactly one variable empty.'
            },
            {
                pattern: /must be null|must be unknown/i,
                message: 'Please leave at least one variable empty (or set to "null") to solve for it, or mark variables as N/A for symbolic results.'
            },
            {
                pattern: /Invalid number|Cannot parse/i,
                message: 'Please enter valid numbers. You can use expressions like "2*pi", "1e10", or "45°" for angles. Use "N/A" for variables you don\'t know.'
            },
            {
                pattern: /cannot be zero|Division by zero/i,
                message: (match, original) => `Division by zero error: ${original}. Please check your input values.`
            },
            {
                pattern: /must be positive/i,
                message: (match, original) => `Invalid input: ${original}. Please enter a positive value.`
            },
            {
                pattern: /not a finite number/i,
                message: (match, original) => `Calculation error: ${original}. Please check your input values and see the browser console for details.`
            }
        ];
    }
    /**
     * Perform calculation with improved error handling and validation
     * Uses pure lock pattern to prevent overlapping calculations
     */
    performCalculation() {
        console.log('[CalculationOrchestrator] ⚡⚡⚡ performCalculation() CALLED ⚡⚡⚡');
        console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: performCalculation entry at', new Date().toISOString());
        console.log('[CalculationOrchestrator] This function is being executed!');
        console.log('[CalculationOrchestrator] 📍 Stack trace:', new Error().stack);
        console.log('[CalculationOrchestrator] this:', this);
        console.log('[CalculationOrchestrator] this.constructor.name:', this.constructor?.name);
        
        // Pure lock pattern: prevent overlapping calculations
        if (this._calculationInProgress) {
            console.log('[CalculationOrchestrator] ⏳ Calculation already in progress, skipping');
            console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: Early return due to lock');
            return;
        }
        
        this._calculationInProgress = true;
        console.log('[CalculationOrchestrator] ✅ Lock acquired, starting calculation...');
        const startTime = performance.now();
        
        try {
            console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: Getting calculator and formula...');
            
            // CRITICAL: Verify getCalculator and getFormula functions exist
            if (typeof this.getCalculator !== 'function') {
                throw new Error('getCalculator is not a function. Check CalculationOrchestrator initialization.');
            }
            if (typeof this.getFormula !== 'function') {
                throw new Error('getFormula is not a function. Check CalculationOrchestrator initialization.');
            }
            
            console.log('[CalculationOrchestrator] 🔍 Calling getCalculator()...');
            const calculator = this.getCalculator();
            console.log('[CalculationOrchestrator] 🔍 Calling getFormula()...');
            const formula = this.getFormula();
            
            // Detailed logging for calculator
            console.log('[CalculationOrchestrator] Calculator:', calculator ? '✅ Found' : '❌ Missing');
            if (calculator) {
                console.log('[CalculationOrchestrator] 📝 Calculator type:', typeof calculator);
                console.log('[CalculationOrchestrator] 📝 Calculator constructor:', calculator.constructor?.name);
                console.log('[CalculationOrchestrator] 📝 Calculator methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(calculator || {})));
                console.log('[CalculationOrchestrator] 📝 Calculator has solve method:', typeof calculator.solve === 'function');
                if (calculator.solve) {
                    console.log('[CalculationOrchestrator] 📝 Calculator.solve function code (first 500 chars):', 
                        calculator.solve.toString().substring(0, 500));
                }
            }
            
            // Detailed logging for formula
            console.log('[CalculationOrchestrator] Formula:', formula ? `✅ Found: ${formula.name || formula.id}` : '❌ Missing');
            if (formula) {
                console.log('[CalculationOrchestrator] 📝 Formula details:', {
                    id: formula.id,
                    name: formula.name,
                    variables: formula.variables?.length || 0,
                    hasExpression: !!formula.expression,
                    hasFormula: !!formula.formula
                });
                console.log('[CalculationOrchestrator] 📝 Formula variables:', formula.variables);
                console.log('[CalculationOrchestrator] 📝 Formula expression:', formula.expression);
                console.log('[CalculationOrchestrator] 📝 Formula formula:', formula.formula);
            }
            
            if (!calculator || !formula) {
                const errorMsg = '⚠️ Please select a formula first';
                console.error('[CalculationOrchestrator] ❌', errorMsg, { calculator: !!calculator, formula: !!formula });
                console.error('[CalculationOrchestrator] ❌ getCalculator() returned:', calculator);
                console.error('[CalculationOrchestrator] ❌ getFormula() returned:', formula);
                console.error('[CalculationOrchestrator] This usually means:');
                console.error('[CalculationOrchestrator]   1. No formula is selected (formulaSelector.currentFormula is null)');
                console.error('[CalculationOrchestrator]   2. formulaSelector.getCurrentCalculator() is failing');
                console.error('[CalculationOrchestrator]   3. FormulaCalculatorClass is not provided in options');
                console.warn('[CalculationOrchestrator] ⚠️⚠️⚠️ EARLY EXIT → CALCULATOR OR FORMULA MISSING');
                this.displayError(errorMsg);
                return;
            }
            
            // FIXED: Enforce calculator contract - assert required methods exist
            if (typeof calculator.solve !== 'function') {
                const errorMsg = 'Calculator is missing solve() method';
                console.error('[CalculationOrchestrator] ❌', errorMsg);
                throw new Error(errorMsg);
            }
            
            if (typeof calculator.solveSymbolically !== 'function') {
                const errorMsg = 'Calculator is missing solveSymbolically() method';
                console.error('[CalculationOrchestrator] ❌', errorMsg);
                throw new Error(errorMsg);
            }
            // Collect and validate variable values (single DOM read)
            console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: Collecting variable values...');
            const variableValues = this.collectVariableValues(formula);
            console.log('[CalculationOrchestrator] Collected values:', variableValues);
            console.log('[CalculationOrchestrator] Collected values (detailed):', JSON.stringify(variableValues, null, 2));
            console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: Variable collection completed at', new Date().toISOString());
            
            // Debug: Check each value type with full inspection
            console.log('[CalculationOrchestrator] 📝 Variable values inspection:');
            Object.entries(variableValues).forEach(([key, value]) => {
                const inspection = {
                    key,
                    value,
                    type: typeof value,
                    isNumber: typeof value === 'number',
                    isNull: value === null,
                    isUndefined: value === undefined,
                    isFinite: typeof value === 'number' ? Number.isFinite(value) : null,
                    stringified: JSON.stringify(value)
                };
                console.log(`[CalculationOrchestrator] Variable ${key}:`, inspection);
            });
            
            // Check for duplicate calculation using already-collected values
            const inputHash = this._createInputHash(variableValues);
            console.log('[CalculationOrchestrator] 🔍 Input hash:', inputHash, 'Last hash:', this._lastCalculationHash);
            console.log('[CalculationOrchestrator] 🔍 Variable values for hash:', variableValues);
            // TEMP DEBUG: Disable duplicate hash check to prevent silent skipping during debugging
            // Re-enable this after fixing input collection
            // if (inputHash === this._lastCalculationHash && this._lastCalculationHash !== null) {
            //     console.warn('[CalculationOrchestrator] ⚠️⚠️⚠️ EARLY EXIT → DUPLICATE HASH (inputs unchanged)');
            //     console.warn('[CalculationOrchestrator] Hash:', inputHash, 'Last:', this._lastCalculationHash);
            //     return; // finally block will reset _calculationInProgress
            // }
            this._lastCalculationHash = inputHash;
            
            console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: Validating variable values...');
            const validation = this.validateVariableValues(variableValues, formula);
            console.log('[CalculationOrchestrator] 📝 Validation result:', validation);
            if (!validation.valid) {
                console.error('[CalculationOrchestrator] ❌ Validation failed:', validation.error);
                console.error('[CalculationOrchestrator] ⏱️ BREAKPOINT: Validation failed, returning early');
                console.warn('[CalculationOrchestrator] ⚠️⚠️⚠️ EARLY EXIT → VALIDATION FAILED');
                this.displayError(validation.error || 'Invalid input values');
                return; // finally block will reset _calculationInProgress
            }
            console.log('[CalculationOrchestrator] ✅ Validation passed');
            
            // More robust check: look for any non-null, finite number values
            const valuesArray = Object.values(variableValues);
            
            // CRITICAL DEBUG: Log all variable values before checking
            console.log('[CalculationOrchestrator] 🔍🔍🔍 CHECKING hasAnyValues - Variable values object:', variableValues);
            console.log('[CalculationOrchestrator] Values array:', valuesArray);
            valuesArray.forEach((val, idx) => {
                const keys = Object.keys(variableValues);
                const key = keys[idx];
                console.log(`[CalculationOrchestrator]   ${key}:`, {
                    value: val,
                    type: typeof val,
                    isNumber: typeof val === 'number',
                    isFinite: typeof val === 'number' ? Number.isFinite(val) : 'N/A',
                    isNull: val === null,
                    isUndefined: val === undefined
                });
            });
            
            const hasAnyValues = valuesArray.some(v => {
                const isNumber = typeof v === 'number';
                const isValueFinite = isNumber && Number.isFinite(v);
                const isNotNull = v !== null && v !== undefined;
                const passes = isNotNull && isNumber && isValueFinite;
                if (passes) {
                    console.log('[CalculationOrchestrator] ✅ Found valid value:', v);
                }
                return passes;
            });
            
            const unknownCount = valuesArray.filter(v => v === null || v === undefined).length;
            const knownCount = valuesArray.filter(v => v !== null && v !== undefined && typeof v === 'number' && Number.isFinite(v)).length;
            
            console.log('[CalculationOrchestrator] 📊 Calculation summary:', {
                totalVariables: valuesArray.length,
                knownCount,
                unknownCount,
                hasAnyValues,
                variableValues
            });
            
            console.log(`[CalculationOrchestrator] Values status: ${knownCount} known, ${unknownCount} unknown, hasAnyValues=${hasAnyValues}`);
            console.log(`[CalculationOrchestrator] Values breakdown:`, valuesArray.map(v => ({ value: v, type: typeof v, isNumber: typeof v === 'number', isFinite: typeof v === 'number' ? Number.isFinite(v) : false })));
            
            // CRITICAL LOG: Check hasAnyValues before symbolic path
            console.warn('[CalculationOrchestrator] 🔍🔍🔍 HAS ANY VALUES CHECK:', hasAnyValues);
            console.warn('[CalculationOrchestrator] Variable values:', variableValues);
            
            // If no values provided, show symbolic result
            if (!hasAnyValues) {
                console.warn('[CalculationOrchestrator] ⚠️⚠️⚠️ EARLY EXIT → NO VALUES (going symbolic)');
                console.log('[CalculationOrchestrator] No values provided, showing symbolic result...');
                this.handleSymbolicResult(calculator, formula, variableValues);
                return; // finally block will reset _calculationInProgress
            }
            
            // Try to solve - calculator.solve() can handle:
            // - 0 unknowns: evaluates the formula
            // - 1 unknown: solves for that variable
            // - Multiple unknowns: returns symbolic result with known values substituted
            console.log(`[CalculationOrchestrator] 🧮 Attempting NUMERIC calculation: ${knownCount} known, ${unknownCount} unknown`);
            console.log('[CalculationOrchestrator] Variable values being passed to calculator:', variableValues);
            console.log('[CalculationOrchestrator] Calculator type:', typeof calculator);
            console.log('[CalculationOrchestrator] Calculator.solve type:', typeof calculator.solve);
            
            let result;
            try {
                console.log('[CalculationOrchestrator] ⚡ Calling calculator.solve() NOW...');
                result = calculator.solve(variableValues);
                console.log('[CalculationOrchestrator] ✅ calculator.solve() returned:', result);
                console.log('[CalculationOrchestrator] Result type:', typeof result);
                console.log('[CalculationOrchestrator] Result.result:', result?.result);
                console.log('[CalculationOrchestrator] Result.isSymbolic:', result?.isSymbolic);
                
                // Check if result is already symbolic (from calculator's internal fallback)
                if (result && result.isSymbolic) {
                    console.log('[CalculationOrchestrator] Result is symbolic, displaying directly');
                    this.displayResult(result);
                    return; // finally block will reset _calculationInProgress
                }
            } catch (solveError) {
                console.error('[CalculationOrchestrator] ❌ Solve error:', solveError);
                console.error('[CalculationOrchestrator] Error message:', solveError.message);
                console.error('[CalculationOrchestrator] Error stack:', solveError.stack);
                // Determine if this error is solvable with symbolic calculation
                const shouldFallbackToSymbolic = this.shouldFallbackToSymbolic(solveError, variableValues);
                
                if (shouldFallbackToSymbolic) {
                    console.log('[CalculationOrchestrator] Solve failed, falling back to symbolic calculation:', solveError.message);
                    this.handleSymbolicResult(calculator, formula, variableValues);
                    return; // finally block will reset _calculationInProgress
                }
                // Re-throw if it's not a solvable case
                console.error('[CalculationOrchestrator] ❌ Non-recoverable solve error, re-throwing');
                throw solveError; // finally block will reset _calculationInProgress
            }
            
            // Validate result
            console.log('[CalculationOrchestrator] Validating result...');
            if (!this.validateResult(result)) {
                console.warn('[CalculationOrchestrator] ❌ Result validation failed, result:', result);
                // If validation fails but we have some known values, try symbolic as fallback
                const knownCountCheck = Object.values(variableValues).filter(v => v !== null && typeof v === 'number').length;
                if (knownCountCheck > 0) {
                    console.log('[CalculationOrchestrator] Result validation failed, attempting symbolic fallback with known values');
                    this.handleSymbolicResult(calculator, formula, variableValues);
                    return; // finally block will reset _calculationInProgress
                }
                this.displayError('Invalid calculation result. Please check your inputs.');
                return; // finally block will reset _calculationInProgress
            }
            
            console.log('[CalculationOrchestrator] ✅ Result validated successfully, displaying...');
            // Track calculation
            this.addToHistory(formula.id, result);
            // Display result
            this.displayResult(result);
            console.log('[CalculationOrchestrator] ✅ Result displayed');
            // Update UI
            if (this.updateSolveIndicators) {
                this.updateSolveIndicators();
            }
            // Update graph if enabled
            if (this.graphUpdatesEnabled) {
                this.updateGraphAfterCalculation(formula, variableValues, result);
            }
            const duration = performance.now() - startTime;
            console.log(`[CalculationOrchestrator] ✅✅✅ NUMERIC CALCULATION COMPLETED in ${duration.toFixed(2)}ms ✅✅✅`);
        }
        catch (error) {
            console.error('[CalculationOrchestrator] ❌ Exception during calculation:', error);
            this.handleCalculationError(error);
        }
        finally {
            this._calculationInProgress = false;
        }
    }
    
    /**
     * Create hash of variable values to detect duplicates
     * O(n) where n = number of variables
     * @param {Object} variableValues - Already collected values (avoids re-reading DOM)
     */
    _createInputHash(variableValues) {
        if (!variableValues || Object.keys(variableValues).length === 0) {
            return 'empty';
        }
        // Create simple hash from sorted key-value pairs
        return Object.entries(variableValues)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join('|');
    }
    /**
     * Collect variable values with improved error handling
     * Vectorized: O(n) -> O(n) but with caching for O(1) DOM lookups
     */
    collectVariableValues(formula) {
        // CRITICAL DEBUG: Inspect DOM before collecting values
        console.log('[CalculationOrchestrator] 🔍🔍🔍 DOM INSPECTION BEFORE VALUE COLLECTION 🔍🔍🔍');
        const allInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"]'));
        console.log(`[CalculationOrchestrator] Total inputs in DOM: ${allInputs.length}`);
        const inputsWithValues = allInputs.filter(inp => inp.value && inp.value.trim());
        console.log(`[CalculationOrchestrator] Inputs with values: ${inputsWithValues.length}`);
        inputsWithValues.forEach(inp => {
            console.log(`[CalculationOrchestrator] Input with value:`, {
                id: inp.id,
                value: inp.value,
                dataSymbol: inp.getAttribute('data-symbol'),
                dataUnit: inp.getAttribute('data-unit'),
                className: inp.className,
                visible: inp.offsetParent !== null
            });
        });
        
        // Use cached constant symbols (O(1) lookup after first call)
        const constantSymbols = this.getConstantSymbols(formula);
        
        // Vectorized: Use filter + map instead of for loop
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));
        
        console.log(`[CalculationOrchestrator] Variables to collect:`, userVariables.map(v => v.symbol));
        
        // Vectorized: Use Object.fromEntries + map for better performance
        return Object.fromEntries(
            userVariables.map(variable => {
            try {
                const value = this.collectVariableValue(variable, formula);
                    return [variable.symbol, value];
            }
            catch (error) {
                throw new Error(`Error collecting value for ${variable.symbol}: ${error.message}`);
            }
            })
        );
    }
    collectVariableValue(variable, formula) {
        // Split responsibility: resolve input element first
        console.log(`[CalculationOrchestrator] 🔍 Resolving input for ${variable.symbol}...`);
        const input = this.resolveInputElement(variable);
        
        if (!input) {
            console.warn(`[CalculationOrchestrator] ⚠️ Input not found for ${variable.symbol} (tried all strategies)`);
            console.warn(`[CalculationOrchestrator] Tried patterns: var-${variable.symbol}, var-${variable.symbol}-*, input[data-symbol="${variable.symbol}"]`);
            // Debug: List all available inputs
            const allInputs = Array.from(document.querySelectorAll('input[data-symbol]'));
            if (allInputs.length > 0) {
                console.warn(`[CalculationOrchestrator] Available inputs with data-symbol:`, 
                    allInputs.map(inp => ({ id: inp.id, symbol: inp.getAttribute('data-symbol'), value: inp.value, trimmed: inp.value.trim() })));
            } else {
                console.warn(`[CalculationOrchestrator] No inputs with data-symbol found in DOM`);
            }
            return null;
        }
        
        console.log(`[CalculationOrchestrator] ✅ Found input for ${variable.symbol}:`, { 
            id: input.id, 
            value: input.value, 
            valueLength: input.value.length,
            trimmed: input.value.trim(),
            trimmedLength: input.value.trim().length,
            hasValue: !!input.value.trim(),
            isEmpty: !input.value.trim(),
            dataSymbol: input.getAttribute('data-symbol'),
            dataUnit: input.getAttribute('data-unit'),
            inputHTML: input.outerHTML.substring(0, 200)
        });
        
        // Extract and parse value
        try {
            const parsed = this.parseInputValue(input, variable);
            console.log(`[CalculationOrchestrator] ✅ Collected value for ${variable.symbol}:`, parsed, `(type: ${typeof parsed})`);
            return parsed;
        } catch (error) {
            console.error(`[CalculationOrchestrator] ❌ Error collecting value for ${variable.symbol}:`, error);
            console.error(`[CalculationOrchestrator] Error details:`, { message: error.message, stack: error.stack });
            // FIXED: Throw error instead of swallowing - let global error handling work
            throw error;
        }
    }
    
    /**
     * Resolve input element for a variable (separated for clarity)
     * Uses abstracted resolution strategies for maintainability
     * @param {Object} variable - Variable definition
     * @returns {HTMLElement|null} - Input element or null
     */
    resolveInputElement(variable) {
        // CRITICAL: Always search for inputs with values first, don't rely on cache
        // The cache can return stale/empty inputs, causing values to be missed
        const cacheKey = `var-${variable.symbol}`;
        
        console.log(`[CalculationOrchestrator] 🔍 Resolving input for ${variable.symbol}, checking cache first...`);
        let cachedInput = this._inputCache.get(cacheKey);
        
        // If cached input exists and has a value, use it
        if (cachedInput && document.contains(cachedInput) && cachedInput.value && cachedInput.value.trim()) {
            console.log(`[CalculationOrchestrator] ✅ Using cached input with value: ${cachedInput.id} = "${cachedInput.value}"`);
            return cachedInput;
        }
        
        // Clear cache if it's stale or empty
        if (cachedInput && (!document.contains(cachedInput) || !cachedInput.value || !cachedInput.value.trim())) {
            console.log(`[CalculationOrchestrator] 🗑️ Clearing stale/empty cache for ${variable.symbol}`);
            this._inputCache.delete(cacheKey);
        }
        
        // Search all strategies, prioritizing inputs with values
        console.log(`[CalculationOrchestrator] 🔍 Searching for inputs with values for ${variable.symbol}...`);
        const strategies = this._getInputResolutionStrategies(variable);
        
        let inputWithValue = null;
        let firstInput = null;
        
        for (const strategy of strategies) {
            const candidate = strategy();
            if (candidate) {
                // CRITICAL: Always prefer inputs with values
                if (candidate.value && candidate.value.trim()) {
                    console.log(`[CalculationOrchestrator] ✅ Found input with value: ${candidate.id} = "${candidate.value}"`);
                    inputWithValue = candidate;
                    break; // Stop immediately when we find an input with a value
                }
                // Keep first input as fallback only
                if (!firstInput) {
                    firstInput = candidate;
                    console.log(`[CalculationOrchestrator] 📝 Found empty input (fallback): ${candidate.id}`);
                }
            }
        }
        
        // Use input with value if found, otherwise use first input found
        const input = inputWithValue || firstInput;
        
        // Only cache inputs that have values
        if (input && input.value && input.value.trim()) {
            this._inputCache.set(cacheKey, input);
            console.log(`[CalculationOrchestrator] 💾 Cached input with value: ${input.id}`);
        } else if (input) {
            console.log(`[CalculationOrchestrator] ⚠️ Found input but it's empty, not caching: ${input.id}`);
        } else {
            console.log(`[CalculationOrchestrator] ❌ No input found for ${variable.symbol}`);
        }
        
        return input;
    }
    
    /**
     * Get input resolution strategies (abstracted for maintainability)
     * @param {Object} variable - Variable definition
     * @returns {Array<Function>} - Array of strategy functions
     */
    _getInputResolutionStrategies(variable) {
        const cacheKey = `var-${variable.symbol}`;
        
        return [
            // Strategy 1: Find by data-symbol attribute (most reliable - matches actual rendered inputs)
            // Search entire document first, prioritizing inputs with values
            () => {
                console.log(`[CalculationOrchestrator] Strategy 1: Searching for input[data-symbol="${variable.symbol}"]`);
                const allInputs = Array.from(document.querySelectorAll(`input[data-symbol="${variable.symbol}"]`));
                console.log(`[CalculationOrchestrator] Found ${allInputs.length} inputs with data-symbol="${variable.symbol}"`);
                
                if (allInputs.length > 0) {
                    // Log all found inputs for debugging
                    allInputs.forEach((inp, idx) => {
                        console.log(`[CalculationOrchestrator] Input ${idx}:`, {
                            id: inp.id,
                            value: inp.value,
                            hasValue: !!inp.value.trim(),
                            unit: inp.getAttribute('data-unit'),
                            visible: inp.offsetParent !== null
                        });
                    });
                    
                    // Prefer input with a value, otherwise return first input
                    const inputWithValue = allInputs.find(inp => inp && inp.value && inp.value.trim());
                    if (inputWithValue) {
                        console.log(`[CalculationOrchestrator] ✅ Strategy 1: Found input with value: ${inputWithValue.id} = "${inputWithValue.value}"`);
                        return inputWithValue;
                    }
                    const firstInput = allInputs[0];
                    console.log(`[CalculationOrchestrator] ⚠️ Strategy 1: Found input but empty: ${firstInput.id}`);
                    return firstInput;
                }
                console.log(`[CalculationOrchestrator] ❌ Strategy 1: No inputs found with data-symbol="${variable.symbol}"`);
                return null;
            },
            
            // Strategy 2: Simple ID (var-symbol) - O(1) lookup
            () => document.getElementById(cacheKey),
            
            // Strategy 3: With unit suffix (var-symbol-unit) - matches VariableInputs.js rendering
            () => {
                if (!this.unitConverter) {
                    console.log(`[CalculationOrchestrator] Strategy 3: unitConverter not available`);
                    return null;
                }
                const alternativeUnits = this.unitConverter.getAlternativeUnits(variable.unit);
                console.log(`[CalculationOrchestrator] Strategy 3: Searching for ${variable.symbol} with units:`, alternativeUnits);
                
                // First try to find input with a value
                const inputsWithValues = alternativeUnits
                    .map(unit => {
                        const sanitizedUnit = unit.replace(/[^a-zA-Z0-9]/g, '_');
                        const inputId = `var-${variable.symbol}-${sanitizedUnit}`;
                        const input = document.getElementById(inputId);
                        if (input) {
                            console.log(`[CalculationOrchestrator] Strategy 3: Found input ${inputId}:`, {
                                id: input.id,
                                value: input.value,
                                hasValue: !!input.value.trim(),
                                unit: unit
                            });
                        }
                        return input;
                    })
                    .filter(inp => inp !== null);
                
                const inputWithValue = inputsWithValues.find(inp => inp.value && inp.value.trim());
                if (inputWithValue) {
                    console.log(`[CalculationOrchestrator] ✅ Strategy 3: Found input with value: ${inputWithValue.id} = "${inputWithValue.value}"`);
                    return inputWithValue;
                }
                
                // If no input with value, find any input for this variable
                if (inputsWithValues.length > 0) {
                    const firstInput = inputsWithValues[0];
                    console.log(`[CalculationOrchestrator] ⚠️ Strategy 3: Found input but empty: ${firstInput.id}`);
                    return firstInput;
                }
                
                console.log(`[CalculationOrchestrator] ❌ Strategy 3: No inputs found for ${variable.symbol} with any unit`);
                return null;
            },
            
            // Strategy 4: Last resort - find ANY input with matching data-symbol anywhere
            () => {
                const inputs = Array.from(document.querySelectorAll(`input[data-symbol="${variable.symbol}"]`));
                return inputs.find(inp => inp.value.trim()) || inputs[0] || null;
            }
        ];
    }
    
    /**
     * Parse input value and convert to base unit (separated for clarity)
     * @param {HTMLElement} input - Input element
     * @param {Object} variable - Variable definition
     * @returns {number|null} - Parsed value or null if empty/invalid
     */
    parseInputValue(input, variable) {
        const rawValue = input.value;
        const value = rawValue.trim();
        
        console.log(`[CalculationOrchestrator] 🔍 parseInputValue for ${variable.symbol}:`, { 
            rawValue, 
            rawValueLength: rawValue.length,
            value, 
            valueLength: value.length,
            isEmpty: !value,
            isNAValue: this.isNAValue(value),
            inputId: input.id,
            inputValue: input.value,
            inputValueType: typeof input.value
        });
        
        // Return null if empty (empty means unknown)
        if (!value || this.isNAValue(value)) {
            console.warn(`[CalculationOrchestrator] ⚠️ Value is empty/NA for ${variable.symbol}, returning null`);
            console.warn(`[CalculationOrchestrator] Debug: rawValue="${rawValue}", trimmed="${value}", isEmpty=${!value}, isNAValue=${this.isNAValue(value)}`);
            return null;
        }
        
        // Get the unit from the input if available
        const inputUnit = input.getAttribute('data-unit') || 
                         input.getAttribute('data-base-unit') || 
                         variable.unit;
        
        console.log(`[CalculationOrchestrator] Parsing value "${value}" with unit "${inputUnit}" for ${variable.symbol}`);
        
        // Parse and convert (using the input's unit or variable's base unit)
        const parsedValue = this.parseNumericValue(value, inputUnit);
        console.log(`[CalculationOrchestrator] Parsed value for ${variable.symbol}:`, parsedValue, `(type: ${typeof parsedValue})`);
        
        if (parsedValue === null || parsedValue === undefined) {
            console.error(`[CalculationOrchestrator] Failed to parse value "${value}" for ${variable.symbol}`);
            throw new Error(`Invalid value for ${variable.symbol}: "${value}"`);
        }
        
        // Ensure parsedValue is a number
        let numericValue;
        if (typeof parsedValue === 'number') {
            numericValue = parsedValue;
        } else if (typeof parsedValue === 'string') {
            numericValue = parseFloat(parsedValue);
            if (isNaN(numericValue)) {
                console.error(`[CalculationOrchestrator] Parsed value is not a valid number: ${parsedValue}`);
                throw new Error(`Invalid numeric value for ${variable.symbol}: "${parsedValue}"`);
            }
        } else {
            console.error(`[CalculationOrchestrator] Parsed value is not a number or string: ${parsedValue} (type: ${typeof parsedValue})`);
            throw new Error(`Invalid value type for ${variable.symbol}: expected number, got ${typeof parsedValue}`);
        }
        
        // Convert to base unit if needed
        if (this.unitConverter && inputUnit !== variable.unit) {
            try {
                const baseValue = this.unitConverter.convertToBase(numericValue, inputUnit, variable.unit);
                console.log(`[CalculationOrchestrator] Converted ${numericValue} ${inputUnit} to ${baseValue} ${variable.unit} for ${variable.symbol}`);
                console.log(`[CalculationOrchestrator] Base value type: ${typeof baseValue}, isFinite: ${Number.isFinite(baseValue)}`);
                return baseValue;
            } catch (error) {
                console.error(`[CalculationOrchestrator] Unit conversion error for ${variable.symbol}:`, error);
                throw new Error(`Unit conversion error for ${variable.symbol}: ${error.message}`);
            }
        }
        
        console.log(`[CalculationOrchestrator] ✅ Final value for ${variable.symbol}:`, numericValue, `(type: ${typeof numericValue}, isFinite: ${Number.isFinite(numericValue)})`);
        return numericValue;
    }
    
    /**
     * Clear input cache (call when inputs are re-rendered)
     */
    clearInputCache() {
        this._inputCache.clear();
    }
    validateVariableValues(values, formula) {
        // Vectorized: Use array methods instead of for loop
        const valuesArray = Object.values(values);
        const nonNullCount = valuesArray.filter(v => v !== null).length;
        if (nonNullCount === 0) {
            return { valid: true }; // Symbolic result is valid
        }
        
        // Vectorized: Use find() to stop at first invalid value
        const invalidEntry = Object.entries(values).find(([symbol, value]) => 
            value !== null && (!Number.isFinite(value) || isNaN(value))
        );
        
        if (invalidEntry) {
            return { valid: false, error: `Invalid value for ${invalidEntry[0]}` };
        }
        
        return { valid: true };
    }
    validateResult(result) {
        if (!result)
            return false;
        if (result.isSymbolic) {
            return typeof result.result === 'string' && result.result.length > 0;
        }
        if (typeof result.result === 'number') {
            return Number.isFinite(result.result) && !isNaN(result.result);
        }
        return false;
    }
    getConstantSymbols(formula) {
        // Cache constant symbols per formula (O(1) lookup after first call)
        const cacheKey = formula.id || formula.name;
        if (this._constantSymbolsCache.has(cacheKey)) {
            return this._constantSymbolsCache.get(cacheKey);
        }
        
        const constantSymbols = new Set();
        if (formula.constants) {
            // Vectorized: Use flatMap to create all symbol variations at once
            const symbolVariations = Object.keys(formula.constants).flatMap(key => {
                const variations = [key];
                // Add symbol variations using Map lookup (O(1))
                const variationMap = {
                    'pi': ['π'],
                    'π': ['π'],
                    'G': ['G'],
                    'c': ['c'],
                    'σ': ['σ'],
                    'sigma': ['σ']
                };
                if (variationMap[key]) {
                    variations.push(...variationMap[key]);
                }
                return variations;
            });
            symbolVariations.forEach(symbol => constantSymbols.add(symbol));
        }
        
        // Cache the result
        this._constantSymbolsCache.set(cacheKey, constantSymbols);
        return constantSymbols;
    }
    isNAValue(value) {
        // Short-circuit empty string early for performance
        if (!value || value === '') return true;
        const lower = value.toLowerCase();
        return lower === 'null' || lower === 'n/a' || lower === 'na' || lower === 'idk';
    }
    /**
     * Determine if an error should trigger symbolic calculation fallback
     * @param {Error} error - The error from calculator.solve()
     * @param {Object} variableValues - The variable values that were used
     * @returns {boolean} - True if symbolic fallback should be attempted
     */
    shouldFallbackToSymbolic(error, variableValues) {
        if (!error || !error.message) return false;
        
        const errorMsg = error.message.toLowerCase();
        
        // Vectorized: Use Set for O(1) lookups instead of array.includes (O(n))
        const fallbackCasesSet = new Set([
            'multiple variables',           // Multiple unknowns
            'cannot solve for multiple',    // Multiple unknowns (alternate wording)
            'too many unknowns',            // Multiple unknowns (alternate wording)
            'solver failed',                // Solver couldn't find numeric solution
            'no solution found',            // No numeric solution exists
            'cannot isolate',               // Cannot isolate variable
            'underdetermined',              // System is underdetermined
            'overdetermined'                // System is overdetermined (might still benefit from symbolic)
        ]);
        
        // Vectorized: Check if any fallback case is in error message
        const matchesFallbackCase = Array.from(fallbackCasesSet).some(caseStr => errorMsg.includes(caseStr));
        
        // Vectorized: Count known values efficiently
        const valuesArray = Object.values(variableValues);
        const knownCount = valuesArray.filter(v => v !== null && typeof v === 'number').length;
        const totalCount = valuesArray.length;
        
        // Also check if we have partial information (some known values)
        // This allows partial numeric evaluation
        const hasPartialInfo = knownCount > 0 && knownCount < totalCount;
        
        // Fallback if:
        // 1. Error matches a known fallback case, OR
        // 2. We have partial information (can do partial evaluation)
        if (matchesFallbackCase || hasPartialInfo) {
            console.log(`[CalculationOrchestrator] Fallback condition met: ${matchesFallbackCase ? 'error case' : 'partial evaluation'} (${knownCount} known values)`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle symbolic calculation result
     * Supports partial numeric evaluation when some values are known
     */
    handleSymbolicResult(calculator, formula, knownVars = {}) {
        try {
            console.log('[CalculationOrchestrator] Getting symbolic result with known vars:', knownVars);
            
            // Vectorized: Use Object.fromEntries + filter instead of for loop
            const filteredKnownVars = Object.fromEntries(
                Object.entries(knownVars).filter(([key, value]) => 
                    value !== null && value !== undefined && typeof value === 'number'
                )
            );
            
            const knownCount = Object.keys(filteredKnownVars).length;
            const totalCount = Object.keys(knownVars).length;
            
            console.log(`[CalculationOrchestrator] Partial evaluation: ${knownCount}/${totalCount} variables known`);
            console.log('[CalculationOrchestrator] Filtered known vars for symbolic solve:', filteredKnownVars);
            
            const result = calculator.solveSymbolically(filteredKnownVars);
            console.log('[CalculationOrchestrator] 🔍 Symbolic calculation completed');
            console.log('[CalculationOrchestrator] Symbolic result:', result);
            console.log('[CalculationOrchestrator] Symbolic result type:', typeof result);
            console.log('[CalculationOrchestrator] Symbolic result.result:', result?.result);
            console.log('[CalculationOrchestrator] Symbolic result.isSymbolic:', result?.isSymbolic);
            console.log('[CalculationOrchestrator] Symbolic result.solvedFor:', result?.solvedFor);
            
            // Validate symbolic result structure
            if (!result) {
                throw new Error('solveSymbolically returned null/undefined');
            }
            if (!result.result) {
                throw new Error('solveSymbolically returned result without result.result property');
            }
            
            // Ensure result is marked as symbolic
            if (result) {
                result.isSymbolic = true;
            }
            
            // Enhance result with partial evaluation info if applicable
            if (knownCount > 0 && knownCount < totalCount) {
                result.partialEvaluation = true;
                result.knownVariables = Object.keys(filteredKnownVars);
                result.unknownVariables = Object.keys(knownVars).filter(k => !filteredKnownVars[k]);
                
                // Mark which constants were used (from formula and global constants)
                const usedConstants = [];
                if (formula.constants) {
                    Object.keys(formula.constants).forEach(key => usedConstants.push(key));
                }
                if (this.globalConstants) {
                    Object.keys(this.globalConstants).forEach(key => {
                        if (!usedConstants.includes(key)) {
                            usedConstants.push(key);
                        }
                    });
                }
                if (usedConstants.length > 0) {
                    result.usedConstants = usedConstants;
                }
                
                // Vectorized: Add helpful context about what was substituted
                if (result.result && typeof result.result === 'string') {
                    const knownVarsList = result.knownVariables
                        .map(v => {
                            const val = filteredKnownVars[v];
                            const formatted = Math.abs(val) >= 1e6 || (Math.abs(val) < 1e-3 && val !== 0) 
                                ? val.toExponential(3) 
                                : val.toString();
                            return `${v} = ${formatted}`;
                        })
                        .join(', ');
                    
                    // Prepend context if not already in the result
                    if (!result.result.includes('Known values:')) {
                        result.result = `Known values: ${knownVarsList}\n${result.result}`;
                    }
                }
            }
            
            console.log('[CalculationOrchestrator] ✅ About to display symbolic result:', result);
            console.log('[CalculationOrchestrator] displayResult function:', typeof this.displayResult);
            this.displayResult(result);
            console.log('[CalculationOrchestrator] ✅ displayResult() called');
        }
        catch (error) {
            console.error('[CalculationOrchestrator] Error getting symbolic result:', error);
            
            // If we have some known values, show a helpful message about partial evaluation
            const knownCount = Object.values(knownVars).filter(v => v !== null && typeof v === 'number').length;
            if (knownCount > 0) {
                this.displayError(`Unable to generate symbolic expression with ${knownCount} known value(s). Please check your inputs or provide more values.`);
            } else {
                this.displayError('Unable to generate symbolic expression. Please enter values to calculate numerically.');
            }
        }
    }
    updateGraphAfterCalculation(formula, variableValues, result) {
        if (!this.updateGraphIfEnabled)
            return;
        const graphManager = this.getGraphManager();
        if (!graphManager || !formula)
            return;
        
        // Guard against symbolic results - graphs need numeric values
        if (result.isSymbolic || (typeof result.result === 'string' && !Number.isFinite(Number(result.result)))) {
            console.log('[CalculationOrchestrator] Skipping graph update for symbolic result');
            return;
        }
        
        // Ensure result.result is numeric before plotting
        if (result.variable && typeof result.result !== 'number') {
            console.warn('[CalculationOrchestrator] Graph update skipped: result.result is not numeric', result);
            return;
        }
        
        // Extract graph context into named helper for clarity
        const graphVariableValues = this.buildGraphVariableContext(formula, variableValues, result);
        const graphOptions = {
            calculatedPoint: result.variable && typeof result.result === 'number' ? {
                x: result.result,
                label: `${result.variable} = ${result.result} ${result.unit || ''}`.trim()
            } : undefined,
            equation: formula.equation || formula.name,
            result: result
        };
        this.updateGraphIfEnabled(formula, graphVariableValues, graphOptions);
        if (this.updateGraphInterpretation) {
            this.updateGraphInterpretation(formula, variableValues);
        }
    }
    handleCalculationError(error) {
        console.error('[CalculationOrchestrator] Error:', error);
        let errorMessage = error.message || 'An error occurred during calculation.';
        // Improve error messagesx
        const improvedMessage = this.improveErrorMessage(errorMessage);
        this.displayError(improvedMessage);
    }
    improveErrorMessage(message) {
        // Try each rule in order (first match wins)
        for (const rule of this.errorMessageRules) {
            const match = message.match(rule.pattern);
            if (match) {
                // Support both string and function messages
                if (typeof rule.message === 'function') {
                    return rule.message(match, message);
                }
                return rule.message;
            }
        }
        return message;
    }
    addToHistory(formulaId, result) {
        this.calculationHistory.unshift({
            formula: formulaId,
            timestamp: Date.now(),
            result: result
        });
        if (this.calculationHistory.length > this.MAX_HISTORY) {
            this.calculationHistory = this.calculationHistory.slice(0, this.MAX_HISTORY);
        }
    }
    getCalculationHistory() {
        return [...this.calculationHistory];
    }
}
