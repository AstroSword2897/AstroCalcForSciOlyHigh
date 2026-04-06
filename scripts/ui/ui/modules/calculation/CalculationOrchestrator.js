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
        this.unitConverter = this._makeUnitConverterShim(options.unitConverter);
        this.globalConstants = options.globalConstants || {};
        this.graphUpdatesEnabled = options.graphUpdatesEnabled ?? false;
        
        // Performance optimizations: caching and locking
        this._calculationInProgress = false; // Pure lock pattern (no debounce)
        this._inputCache = new Map(); // Cache DOM queries: O(1) lookup instead of O(n)
        this._constantSymbolsCache = new Map(); // Cache constant symbols per formula
        this._lastCalculationHash = null; // Prevent duplicate calculations
        
        // Calculation result cache - returns immediately if same inputs
        this._calculationResultCache = new Map(); // formulaId + input hash -> result with all unit conversions
        this._maxCacheSize = 100; // Maximum cached calculations
        this._lastConversionMetadata = {};
        
        // Configurable error message rules (can be extended)
        this.errorMessageRules = options.errorMessageRules || this._getDefaultErrorMessageRules();
    }

    _globalUnitConverterClass() {
        if (typeof globalThis !== 'undefined' && globalThis.UnitConverter) {
            return globalThis.UnitConverter;
        }
        if (typeof window !== 'undefined' && window.UnitConverter) {
            return window.UnitConverter;
        }
        return null;
    }

    _makeUnitConverterShim(injected) {
        const UC = this._globalUnitConverterClass();
        const safeCanon = (u) => String(u == null ? '' : u).trim();
        if (injected && typeof injected.convertToBase === 'function') {
            const needPatch =
                UC &&
                (typeof injected.getCanonical !== 'function' ||
                    typeof injected.getAlternativeUnits !== 'function' ||
                    typeof injected.convert !== 'function' ||
                    typeof injected.convertAndFormat !== 'function' ||
                    typeof injected.getUnitCategory !== 'function');
            if (needPatch) {
                return {
                    convertToBase: (v, a, b) => injected.convertToBase(v, a, b),
                    convert: (v, a, b) =>
                        typeof injected.convert === 'function'
                            ? injected.convert(v, a, b)
                            : UC && typeof UC.convert === 'function'
                              ? UC.convert(v, a, b)
                              : null,
                    getAlternativeUnits: (u) =>
                        typeof injected.getAlternativeUnits === 'function'
                            ? injected.getAlternativeUnits(u)
                            : UC && typeof UC.getAlternativeUnits === 'function'
                              ? UC.getAlternativeUnits(u)
                              : [u],
                    convertAndFormat: (v, u, o) =>
                        typeof injected.convertAndFormat === 'function'
                            ? injected.convertAndFormat(v, u, o)
                            : UC && typeof UC.convertAndFormat === 'function'
                              ? UC.convertAndFormat(v, u, o)
                              : { value: v, unit: u },
                    getCanonical: (u) =>
                        typeof injected.getCanonical === 'function'
                            ? injected.getCanonical(u)
                            : UC && typeof UC.getCanonical === 'function'
                              ? UC.getCanonical(u)
                              : safeCanon(u),
                    getUnitCategory: (u) =>
                        typeof injected.getUnitCategory === 'function'
                            ? injected.getUnitCategory(u)
                            : UC && typeof UC.getUnitCategory === 'function'
                              ? UC.getUnitCategory(u)
                              : null
                };
            }
            return injected;
        }
        if (!UC || typeof UC.convertToBase !== 'function') {
            return null;
        }
        return {
            convertToBase: (value, fromUnit, baseUnit) => UC.convertToBase(value, fromUnit, baseUnit),
            convert: (value, fromUnit, toUnit) => UC.convert(value, fromUnit, toUnit),
            getAlternativeUnits: (baseUnit) => UC.getAlternativeUnits(baseUnit),
            convertAndFormat: (value, unit, opts) => UC.convertAndFormat(value, unit, opts),
            getCanonical: (unit) => UC.getCanonical(unit),
            getUnitCategory: (unit) => UC.getUnitCategory(unit)
        };
    }

    _ensureUnitConverter() {
        if (this.unitConverter && typeof this.unitConverter.convertToBase === 'function') {
            return;
        }
        this.unitConverter = this._makeUnitConverterShim(null);
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
        this._ensureUnitConverter();
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
            this._lastConversionMetadata = {};
            console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: Collecting variable values...');
            const variableValues = this.collectVariableValues(formula);
            console.log('[CalculationOrchestrator] Collected values:', variableValues);
            console.log('[CalculationOrchestrator] Collected values (detailed):', JSON.stringify(variableValues, null, 2));
            
            // CRITICAL: Verify all values are in base units
            console.log('[CalculationOrchestrator] 🔍 VERIFYING BASE UNIT CONVERSION:');
            Object.entries(variableValues).forEach(([symbol, value]) => {
                if (value !== null && typeof value === 'number') {
                    const varDef = formula.variables.find(v => v.symbol === symbol);
                    const baseUnit = varDef?.unit || 'unknown';
                    console.log(`[CalculationOrchestrator]   ${symbol} = ${value} ${baseUnit} (should be in base unit)`);
                }
            });
            this._validateConversionMetadata(formula, variableValues);
            
            console.log('[CalculationOrchestrator] ⏱️ BREAKPOINT: Variable collection completed at', new Date().toISOString());
            
            // CRITICAL: Check cache first for immediate return
            const cacheKey = this._generateCalculationCacheKey(formula.id, variableValues);
            const cachedResult = this._calculationResultCache.get(cacheKey);
            if (cachedResult) {
                console.log('[CalculationOrchestrator] ⚡ CACHE HIT - Returning cached result immediately');
                console.log('[CalculationOrchestrator] Cached result:', cachedResult.result);
                
                // Display cached result with all unit conversions
                this.displayResult(cachedResult.result);
                
                // Update unit inputs if result has a solved variable
                if (cachedResult.result && !cachedResult.result.isSymbolic && 
                    typeof cachedResult.result.result === 'number' && 
                    Number.isFinite(cachedResult.result.result)) {
                    const solvedFor = cachedResult.result.solvedFor || cachedResult.result.variable;
                    if (solvedFor && solvedFor !== 'result') {
                        this.updateVariableUnitInputs(solvedFor, cachedResult.result.result, formula);
                    }
                }
                
                // Update graph if enabled
                if (this.graphUpdatesEnabled && this.updateGraphIfEnabled) {
                    this.updateGraphIfEnabled(formula, variableValues, { useCache: true });
                }
                
                this._calculationInProgress = false;
                return;
            }
            console.log('[CalculationOrchestrator] ⚡ CACHE MISS - Performing new calculation');
            
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
            console.log('[CalculationOrchestrator] 🔍 HAS ANY VALUES CHECK:', hasAnyValues);
            console.log('[CalculationOrchestrator] Variable values:', variableValues);
            
            // If no values provided, show symbolic result
            if (!hasAnyValues) {
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
                console.log('[CalculationOrchestrator] Result.result type:', typeof result?.result);
                console.log('[CalculationOrchestrator] Result.isSymbolic:', result?.isSymbolic);
                console.log('[CalculationOrchestrator] Result.isFinite:', typeof result?.result === 'number' ? Number.isFinite(result.result) : 'N/A');
                console.log('[CalculationOrchestrator] Result.isNaN:', typeof result?.result === 'number' ? isNaN(result.result) : 'N/A');
                
                // CRITICAL DIAGNOSTIC: Check if result is actually numeric
                if (result && typeof result.result === 'string') {
                    console.error('[CalculationOrchestrator] ❌❌❌ RESULT IS A STRING, NOT A NUMBER! ❌❌❌');
                    console.error('[CalculationOrchestrator] This means the calculator is doing string substitution, not math!');
                    console.error('[CalculationOrchestrator] Result.result:', result.result);
                    console.error('[CalculationOrchestrator] Attempting to force numeric calculation...');
                    
                    // Force numeric calculation by trying to solve for the first unknown
                    const unknownVars = Object.keys(variableValues).filter(k => 
                        variableValues[k] === null || variableValues[k] === undefined
                    );
                    
                    if (unknownVars.length > 0 && knownCount > 0 && calculator.solveForVariable) {
                        const unknownVar = unknownVars[0];
                        try {
                            const filteredVars = Object.fromEntries(
                                Object.entries(variableValues).filter(([k, v]) => 
                                    v !== null && v !== undefined && typeof v === 'number' && Number.isFinite(v)
                                )
                            );
                            console.log('[CalculationOrchestrator] 🔄 Force-attempting numeric solve for', unknownVar, 'with known vars:', filteredVars);
                            
                            const numericResult = calculator.solveForVariable(unknownVar, filteredVars);
                            
                            if (numericResult !== null && typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
                                console.log('[CalculationOrchestrator] ✅ Force numeric solve succeeded! Result:', numericResult);
                                const varInfo = formula.variables.find(v => v.symbol === unknownVar);
                                result = {
                                    solvedFor: unknownVar,
                                    result: numericResult,
                                    unit: varInfo?.unit || '',
                                    isSymbolic: false,
                                    variable: unknownVar
                                };
                                console.log('[CalculationOrchestrator] ✅ Replaced string result with numeric result');
                            } else {
                                console.warn('[CalculationOrchestrator] ⚠️ Force numeric solve failed, result:', numericResult);
                            }
                        } catch (forceError) {
                            console.error('[CalculationOrchestrator] ❌ Force numeric solve exception:', forceError);
                        }
                    }
                }
                
                // CRITICAL: Check if we have enough values for numeric calculation
                // If we have all but one variable, we should get a numeric result, not symbolic
                // ALSO: If we have symbolic result with 2 unknowns but enough known values to solve for one, try it
                if (result && result.isSymbolic === true && knownCount > 0) {
                    const unknownVars = Object.keys(variableValues).filter(k => 
                        variableValues[k] === null || variableValues[k] === undefined
                    );
                    
                    // If we have exactly 1 unknown, try to solve for it
                    // If we have 2 unknowns but the formula can be solved for one of them, try it
                    if (unknownVars.length === 1 || (unknownVars.length === 2 && knownCount >= 1)) {
                        console.warn(`[CalculationOrchestrator] ⚠️ Got symbolic result but we have ${unknownVars.length} unknown(s) and ${knownCount} known value(s)!`);
                        console.warn('[CalculationOrchestrator] This suggests the algebraic solver failed. Variable values:', variableValues);
                        console.warn('[CalculationOrchestrator] Attempting to force numeric calculation...');
                        
                        // Try to solve for the first unknown variable
                        const unknownVar = unknownVars[0];
                        if (unknownVar && calculator.solveForVariable) {
                            try {
                            const filteredVars = Object.fromEntries(
                                Object.entries(variableValues).filter(([k, v]) => v !== null && v !== undefined && typeof v === 'number')
                            );
                            console.log('[CalculationOrchestrator] Attempting manual solve for', unknownVar, 'with known vars:', filteredVars);
                            const numericResult = calculator.solveForVariable(unknownVar, filteredVars);
                            if (typeof numericResult === 'number' && Number.isFinite(numericResult)) {
                                console.log('[CalculationOrchestrator] ✅ Manual solve succeeded! Result:', numericResult);
                                // Create a proper numeric result object
                                const varInfo = formula.variables.find(v => v.symbol === unknownVar);
                                
                                // Generate formula expression showing the calculation steps with actual computed values
                                let formulaExpression = null;
                                try {
                                    // Try to generate a readable expression with substituted values
                                    const sortedVars = Object.entries(filteredVars)
                                        .filter(([_, v]) => typeof v === 'number' && Number.isFinite(v))
                                        .sort((a, b) => b[0].length - a[0].length);
                                    
                                    let expr = formula.equation || '';
                                    for (const [symbol, value] of sortedVars) {
                                        const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                                        const formatted = Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)
                                            ? value.toExponential(3)
                                            : value.toString();
                                        expr = expr.replace(regex, formatted);
                                    }
                                    // Show the formula with substituted values AND the computed result
                                    formulaExpression = `${unknownVar} = ${expr} = ${numericResult}`;
                                } catch (e) {
                                    // If expression generation fails, use the equation
                                    formulaExpression = `${unknownVar} = ${formula.equation || ''} = ${numericResult}`;
                                }
                                
                                result = {
                                    solvedFor: unknownVar,
                                    result: numericResult,
                                    unit: varInfo?.unit || '',
                                    isSymbolic: false,
                                    variable: unknownVar,
                                    formulaExpression: formulaExpression
                                };
                                console.log('[CalculationOrchestrator] ✅ Created numeric result object:', result);
                            }
                            } catch (manualError) {
                                console.error('[CalculationOrchestrator] Manual solve failed:', manualError);
                            }
                        }
                    }
                }
                
                // CRITICAL: If we have exactly one unknown, we MUST get a numeric result
                // Don't accept symbolic results when numeric calculation is possible
                if (result && result.isSymbolic === true && unknownCount === 1 && knownCount > 0) {
                    console.warn('[CalculationOrchestrator] ⚠️ Got symbolic result with exactly 1 unknown - this should not happen!');
                    console.warn('[CalculationOrchestrator] Forcing numeric calculation attempt...');
                    
                    // Try harder to get a numeric result
                    const unknownVar = Object.keys(variableValues).find(k => variableValues[k] === null || variableValues[k] === undefined);
                    if (unknownVar && calculator.solveForVariable) {
                        try {
                            const filteredVars = Object.fromEntries(
                                Object.entries(variableValues).filter(([k, v]) => v !== null && v !== undefined && typeof v === 'number' && Number.isFinite(v))
                            );
                            console.log('[CalculationOrchestrator] 🔄 Force-attempting numeric solve for', unknownVar, 'with known vars:', filteredVars);
                            
                            // Try the algebraic solver directly (returns number or null, never throws)
                            const numericResult = calculator.solveForVariable(unknownVar, filteredVars);
                            
                            if (numericResult !== null && typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
                                console.log('[CalculationOrchestrator] ✅ Force numeric solve succeeded! Result:', numericResult);
                                const varInfo = formula.variables.find(v => v.symbol === unknownVar);
                                result = {
                                    solvedFor: unknownVar,
                                    result: numericResult,
                                    unit: varInfo?.unit || '',
                                    isSymbolic: false,
                                    variable: unknownVar,
                                    formulaExpression: calculator.generateSymbolicExpression ? calculator.generateSymbolicExpression(unknownVar, filteredVars) : null
                                };
                                console.log('[CalculationOrchestrator] ✅ Created numeric result from force solve:', result);
                            } else {
                                // solveForVariable returned null - try algebraic solver directly
                                console.log('[CalculationOrchestrator] solveForVariable returned null, trying _solveAlgebraically...');
                                if (calculator._solveAlgebraically) {
                                    const algebraicResult = calculator._solveAlgebraically(unknownVar, filteredVars);
                                    if (algebraicResult !== null && typeof algebraicResult === 'number' && Number.isFinite(algebraicResult) && !isNaN(algebraicResult)) {
                                        console.log('[CalculationOrchestrator] ✅ Algebraic solve succeeded! Result:', algebraicResult);
                                        const varInfo = formula.variables.find(v => v.symbol === unknownVar);
                                        result = {
                                            solvedFor: unknownVar,
                                            result: algebraicResult,
                                            unit: varInfo?.unit || '',
                                            isSymbolic: false,
                                            variable: unknownVar,
                                            formulaExpression: calculator.generateSymbolicExpression ? calculator.generateSymbolicExpression(unknownVar, filteredVars) : null
                                        };
                                        console.log('[CalculationOrchestrator] ✅ Created numeric result from algebraic solve:', result);
                                    } else {
                                        console.log('[CalculationOrchestrator] All numeric solve attempts failed, falling back to symbolic');
                                    }
                                } else {
                                    console.log('[CalculationOrchestrator] No algebraic solver available, falling back to symbolic');
                                }
                            }
                        } catch (forceError) {
                            console.error('[CalculationOrchestrator] ❌ Force numeric solve exception caught:', forceError);
                            // If force solve fails, fall back to symbolic (don't show error - let symbolic display handle it)
                            console.log('[CalculationOrchestrator] Force solve exception caught, falling back to symbolic');
                        }
                    } else {
                        // Can't force solve - show error
                        this.displayError('Unable to perform numeric calculation. Please check your input values.');
                        return; // finally block will reset _calculationInProgress
                    }
                }
                
                // IMPORTANT: If result is numeric (not symbolic), display it immediately
                // Only treat as symbolic if explicitly marked or if result is a string expression
                if (result && result.isSymbolic === true) {
                    console.log('[CalculationOrchestrator] Result is explicitly symbolic (multiple unknowns), displaying directly');
                    this.displayResult(result);
                    return; // finally block will reset _calculationInProgress
                }
                
                // CRITICAL: Strict numeric validation - if isSymbolic === false, result.result MUST be a number
                if (result && result.isSymbolic === false) {
                    if (typeof result.result !== 'number' || !Number.isFinite(result.result) || isNaN(result.result)) {
                        console.error('[CalculationOrchestrator] ❌❌❌ NUMERIC SOLVER RETURNED NON-NUMBER! ❌❌❌');
                        console.error('[CalculationOrchestrator] Result.result:', result.result, 'Type:', typeof result.result);
                        console.error('[CalculationOrchestrator] This is a contract violation - numeric results must be numbers!');
                        throw new Error(`Numeric solver returned non-number: ${result.result}. Type: ${typeof result.result}`);
                    }
                    console.log('[CalculationOrchestrator] ✅ Result is numeric (validated), proceeding to display');
                    // Continue to validation and display below
                } else {
                    console.log('[CalculationOrchestrator] Result is symbolic, displaying directly');
                    this.displayResult(result);
                    return; // finally block will reset _calculationInProgress
                }
            } catch (solveError) {
                console.error('[CalculationOrchestrator] ❌ Solve error:', solveError);
                console.error('[CalculationOrchestrator] Error message:', solveError.message);
                console.error('[CalculationOrchestrator] Error stack:', solveError.stack);
                
                // CRITICAL: If we have exactly one unknown, we MUST try harder to get a numeric result
                // Don't fall back to symbolic immediately
                if (unknownCount === 1 && knownCount > 0) {
                    console.warn('[CalculationOrchestrator] ⚠️ Solve failed with exactly 1 unknown - attempting force numeric solve...');
                    const unknownVar = Object.keys(variableValues).find(k => variableValues[k] === null || variableValues[k] === undefined);
                    if (unknownVar && calculator.solveForVariable) {
                        try {
                            const filteredVars = Object.fromEntries(
                                Object.entries(variableValues).filter(([k, v]) => v !== null && v !== undefined && typeof v === 'number' && Number.isFinite(v))
                            );
                            console.log('[CalculationOrchestrator] 🔄 Force-attempting numeric solve for', unknownVar, 'with known vars:', filteredVars);
                            
                            // Try the algebraic solver directly
                            const numericResult = calculator.solveForVariable(unknownVar, filteredVars);
                            
                            if (typeof numericResult === 'number' && Number.isFinite(numericResult) && !isNaN(numericResult)) {
                                console.log('[CalculationOrchestrator] ✅ Force numeric solve succeeded! Result:', numericResult);
                                const varInfo = formula.variables.find(v => v.symbol === unknownVar);
                                
                                // Generate formula expression showing the calculation steps with actual computed values
                                let formulaExpression = null;
                                try {
                                    const sortedVars = Object.entries(filteredVars)
                                        .filter(([_, v]) => typeof v === 'number' && Number.isFinite(v))
                                        .sort((a, b) => b[0].length - a[0].length);
                                    
                                    let expr = formula.equation || '';
                                    for (const [symbol, value] of sortedVars) {
                                        const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                        const regex = new RegExp(`\\b${escaped}\\b`, 'g');
                                        const formatted = Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)
                                            ? value.toExponential(3)
                                            : value.toString();
                                        expr = expr.replace(regex, formatted);
                                    }
                                    formulaExpression = `${unknownVar} = ${expr} = ${numericResult}`;
                                } catch (e) {
                                    formulaExpression = `${unknownVar} = ${formula.equation || ''} = ${numericResult}`;
                                }
                                
                                result = {
                                    solvedFor: unknownVar,
                                    result: numericResult, // NUMBER
                                    unit: varInfo?.unit || '',
                                    isSymbolic: false, // NUMERIC
                                    variable: unknownVar,
                                    formulaExpression: formulaExpression
                                };
                                console.log('[CalculationOrchestrator] ✅ Created numeric result from force solve:', result);
                                // Continue to validation and display below
                            } else {
                                throw new Error(`Force solve returned invalid result: ${numericResult}`);
                            }
                        } catch (forceError) {
                            console.error('[CalculationOrchestrator] ❌ Force numeric solve failed:', forceError);
                            // Only now fall back to symbolic if force solve also fails
                            const shouldFallbackToSymbolic = this.shouldFallbackToSymbolic(solveError, variableValues);
                            if (shouldFallbackToSymbolic) {
                                console.log('[CalculationOrchestrator] All numeric attempts failed, falling back to symbolic:', forceError.message);
                                this.handleSymbolicResult(calculator, formula, variableValues);
                                return;
                            }
                            throw forceError;
                        }
                    } else {
                        // Can't force solve - determine if we should fall back to symbolic
                        const shouldFallbackToSymbolic = this.shouldFallbackToSymbolic(solveError, variableValues);
                        if (shouldFallbackToSymbolic) {
                            console.log('[CalculationOrchestrator] Cannot force solve, falling back to symbolic:', solveError.message);
                            this.handleSymbolicResult(calculator, formula, variableValues);
                return;
                        }
                        throw solveError;
                    }
                } else {
                    // Multiple unknowns or no known values - determine if this error is solvable with symbolic calculation
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
            
            // CRITICAL: Cache the result for immediate future returns
            // Cache key includes formula ID and all input values (in base units)
            const resultCacheKey = this._generateCalculationCacheKey(formula.id, variableValues);
            
            // Enhance result with all unit conversions before caching
            const enhancedResult = this._enhanceResultWithUnitConversions(result, formula);
            const given = Object.fromEntries(
                Object.entries(variableValues).filter(([_, v]) => v != null && typeof v === 'number' && Number.isFinite(v))
            );
            const resultWithFlow = {
                ...enhancedResult,
                given,
                conversionMetadata: this._lastConversionMetadata
            };
            
            // Cache the enhanced result (with given for flow display on cache hit)
            this._cacheCalculationResult(resultCacheKey, resultWithFlow);
            console.log('[CalculationOrchestrator] 💾 Result cached for immediate future returns');
            
            // Track calculation
            this.addToHistory(formula.id, enhancedResult);
            this.displayResult(resultWithFlow);
            console.log('[CalculationOrchestrator] ✅ Result displayed');
            
            // CRITICAL: Update all unit inputs for the solved variable with converted values
            if (enhancedResult && !enhancedResult.isSymbolic && typeof enhancedResult.result === 'number' && Number.isFinite(enhancedResult.result)) {
                const solvedFor = enhancedResult.solvedFor || enhancedResult.variable;
                if (solvedFor && solvedFor !== 'result') {
                    this.updateVariableUnitInputs(solvedFor, enhancedResult.result, formula);
                }
            }
            
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

        // CRITICAL: Prefer the currently focused input field if it belongs to this variable.
        // This avoids race conditions between blur/input handlers and the user hitting "Calculate"
        // immediately after typing into a non-base unit input.
        try {
            const active = document.activeElement;
            if (
                active &&
                typeof active.matches === 'function' &&
                active.matches(`input[data-symbol="${variable.symbol}"]`) &&
                typeof active.value === 'string' &&
                active.value.trim()
            ) {
                console.log(`[CalculationOrchestrator] ⭐ Using activeElement for ${variable.symbol}: ${active.id} (data-unit: ${active.getAttribute('data-unit')})`);
                return active;
            }
        } catch (_) {
            // Ignore and fall back to normal resolution strategies
        }

        // CRITICAL: Prefer the most recently edited unit field (set by VariableInputsRenderer).
        // This prevents stale values from being used when a user types into a non-base unit
        // and presses "Calculate" before blur handlers have cleared the other unit inputs.
        try {
            const scope = document.getElementById('variables-container') || document;
            const userEdited = Array.from(scope.querySelectorAll(`input[data-symbol="${variable.symbol}"]`))
                .filter(inp => inp.type !== 'checkbox' && inp.type !== 'radio')
                .find(inp => inp.dataset.userEdited === 'true' && inp.value && inp.value.trim());
            if (userEdited) {
                const eff = this._effectiveInputUnit(userEdited, variable);
                console.log(`[CalculationOrchestrator] ⭐ Using user-edited input for ${variable.symbol}: ${userEdited.id} (effective unit: ${eff})`);
                return userEdited;
            }
        } catch (_) {
            // Ignore and fall back to normal resolution strategies
        }
        
        // If cached input exists and has a value, use it — unless another unit field for this
        // symbol was edited (avoids using stale base-unit cache after typing in km, etc.).
        if (cachedInput && document.contains(cachedInput) && cachedInput.value && cachedInput.value.trim()) {
            const siblings = Array.from(document.querySelectorAll(`input[data-symbol="${variable.symbol}"]`))
                .filter(inp => inp.type !== 'checkbox' && inp.type !== 'radio');
            const editedOther = siblings.some(
                inp => inp !== cachedInput && inp.dataset.userEdited === 'true' && inp.value && inp.value.trim()
            );
            if (editedOther) {
                console.log(`[CalculationOrchestrator] 🔄 Skipping cache for ${variable.symbol}: a different unit field was user-edited`);
                this._inputCache.delete(cacheKey);
            }
            else {
                console.log(`[CalculationOrchestrator] ✅ Using cached input with value: ${cachedInput.id} = "${cachedInput.value}"`);
                return cachedInput;
            }
        }
        
        // Clear cache if it's stale or empty
        if (cachedInput && (!document.contains(cachedInput) || !cachedInput.value || !cachedInput.value.trim())) {
            console.log(`[CalculationOrchestrator] 🗑️ Clearing stale/empty cache for ${variable.symbol}`);
            this._inputCache.delete(cacheKey);
        }
        
        // Rank every matching field inside the calculator container (fixes km vs m mis-picks).
        console.log(`[CalculationOrchestrator] 🔍 Picking best input in #variables-container for ${variable.symbol}...`);
        let input = this._pickBestVariableInputFromContainer(variable);
        
        if (!input) {
            console.log(`[CalculationOrchestrator] 🔍 No container inputs; legacy strategies for ${variable.symbol}...`);
            const strategies = this._getInputResolutionStrategies(variable);
            const baseUnit = variable.unit;
            let inputWithValue = null;
            let nonBaseUnitInput = null;
            let firstInput = null;
            for (const strategy of strategies) {
                const candidate = strategy();
                if (candidate) {
                    if (candidate.value && candidate.value.trim()) {
                        const candidateUnit = this._effectiveInputUnit(candidate, variable);
                        if (!this._unitsCanonicallyEqual(candidateUnit, baseUnit)) {
                            nonBaseUnitInput = candidate;
                        } else if (!inputWithValue) {
                            inputWithValue = candidate;
                        }
                    }
                    if (!firstInput) {
                        firstInput = candidate;
                    }
                }
            }
            input = nonBaseUnitInput || inputWithValue || firstInput;
        }
        
        if (input) {
            const baseUnit = variable.unit;
            const selectedUnit = this._effectiveInputUnit(input, variable);
            const selectedId = input.id || 'unknown';
            const selectedValue = input.value?.trim() || '';
            console.log(`[CalculationOrchestrator] 📍 Selected input for ${variable.symbol}:`, {
                id: selectedId,
                value: selectedValue,
                effectiveUnit: selectedUnit,
                baseUnit,
                needsConversion: !this._unitsCanonicallyEqual(selectedUnit, baseUnit)
            });
        }
        
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
            // Strategy 0: Prefer inputs inside #variables-container (calculator tab) so we always read from the active formula
            () => {
                const container = document.getElementById('variables-container');
                if (!container) return null;
                const inContainer = Array.from(container.querySelectorAll(`input[data-symbol="${variable.symbol}"], input[id="${cacheKey}"], input[id^="var-${variable.symbol}-"]`))
                    .filter(inp => inp.type !== 'checkbox' && inp.type !== 'radio');
                const baseUnit = variable.unit;
                const withValue = inContainer.filter(inp => inp.value && inp.value.trim());

                // CRITICAL: If multiple unit fields have values, prefer:
                // 1) the one the user last edited, then
                // 2) any non-base unit field (so conversion happens), then
                // 3) base unit field.
                const rank = (inp) => {
                    const unit = this._effectiveInputUnit(inp, variable);
                    const isNonBase = !this._unitsCanonicallyEqual(unit, baseUnit);
                    const userEdited = inp.dataset && inp.dataset.userEdited === 'true';
                    return (userEdited ? 1000 : 0) + (isNonBase ? 100 : 0);
                };

                const chosen = (withValue.length > 0
                    ? withValue.sort((a, b) => rank(b) - rank(a))[0]
                    : inContainer[0]) || null;
                if (chosen) console.log(`[CalculationOrchestrator] Strategy 0: Found in variables-container: ${chosen.id} = "${(chosen.value || '').trim()}"`);
                return chosen;
            },
            // Strategy 1: Find by data-symbol attribute (most reliable - matches actual rendered inputs)
            // Search entire document first, prioritizing inputs with values AND non-base units
            // CRITICAL: Exclude checkboxes - only text/number inputs
            () => {
                console.log(`[CalculationOrchestrator] Strategy 1: Searching for input[data-symbol="${variable.symbol}"]`);
                const allInputs = Array.from(document.querySelectorAll(`input[data-symbol="${variable.symbol}"]`))
                    .filter(inp => inp.type !== 'checkbox' && inp.type !== 'radio'); // Exclude checkboxes/radios
                console.log(`[CalculationOrchestrator] Found ${allInputs.length} inputs with data-symbol="${variable.symbol}" (excluding checkboxes)`);
                
                if (allInputs.length > 0) {
                    // CRITICAL: Sort inputs - prioritize non-base unit inputs with values
                    const baseUnit = variable.unit;
                    const inputsWithValues = allInputs.filter(inp => inp.value && inp.value.trim());
                    const nonBaseInputs = inputsWithValues.filter(inp => {
                        const unit = this._effectiveInputUnit(inp, variable);
                        return !this._unitsCanonicallyEqual(unit, baseUnit);
                    });
                    const baseInputs = inputsWithValues.filter(inp => {
                        const unit = this._effectiveInputUnit(inp, variable);
                        return this._unitsCanonicallyEqual(unit, baseUnit);
                    });
                    
                    // Log all found inputs for debugging
                    allInputs.forEach((inp, idx) => {
                        const unit = this._effectiveInputUnit(inp, variable);
                        console.log(`[CalculationOrchestrator] Input ${idx}:`, {
                            id: inp.id,
                            value: inp.value,
                            hasValue: !!inp.value.trim(),
                            unit: unit,
                            isBaseUnit: this._unitsCanonicallyEqual(unit, baseUnit),
                            visible: inp.offsetParent !== null
                        });
                    });
                    
                    console.log(`[CalculationOrchestrator] Strategy 1: Found ${nonBaseInputs.length} non-base inputs with values, ${baseInputs.length} base inputs with values`);
                    
                    // CRITICAL: Prefer non-base unit inputs (they need conversion)
                    if (nonBaseInputs.length > 0) {
                        const selected = nonBaseInputs[0];
                        console.log(`[CalculationOrchestrator] ✅ Strategy 1: Selected non-base unit input: ${selected.id} = "${selected.value}" (unit: ${selected.getAttribute('data-unit')})`);
                        return selected;
                    }
                    
                    // Fallback to base unit input with value
                    if (baseInputs.length > 0) {
                        const selected = baseInputs[0];
                        console.log(`[CalculationOrchestrator] ⚠️ Strategy 1: Selected base unit input: ${selected.id} = "${selected.value}" (unit: ${selected.getAttribute('data-unit')})`);
                        return selected;
                    }
                    
                    // No inputs with values, return first empty input
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
                // CRITICAL: Exclude checkboxes - only text/number inputs
                const inputsWithValues = alternativeUnits
                    .map(unit => {
                        const sanitizedUnit = unit.replace(/[^a-zA-Z0-9]/g, '_');
                        const inputId = `var-${variable.symbol}-${sanitizedUnit}`;
                        const input = document.getElementById(inputId);
                        // CRITICAL: Exclude checkboxes/radios - only text/number inputs
                        if (input && input.type !== 'checkbox' && input.type !== 'radio') {
                            console.log(`[CalculationOrchestrator] Strategy 3: Found input ${inputId}:`, {
                                id: input.id,
                                value: input.value,
                                hasValue: !!input.value.trim(),
                                unit: unit,
                                type: input.type
                            });
                            return input;
                        }
                        return null;
                    })
                    .filter(inp => inp !== null);
                
                // CRITICAL: Prioritize non-base unit inputs
                const baseUnit = variable.unit;
                const nonBaseInput = inputsWithValues.find(inp => {
                    const unit = this._effectiveInputUnit(inp, variable);
                    return inp.value && inp.value.trim() && !this._unitsCanonicallyEqual(unit, baseUnit);
                });
                if (nonBaseInput) {
                    console.log(`[CalculationOrchestrator] ✅ Strategy 3: Found non-base unit input with value: ${nonBaseInput.id} = "${nonBaseInput.value}" (unit: ${nonBaseInput.getAttribute('data-unit')})`);
                    return nonBaseInput;
                }
                
                // Fallback to base unit input with value
                const inputWithValue = inputsWithValues.find(inp => inp.value && inp.value.trim());
                if (inputWithValue) {
                    console.log(`[CalculationOrchestrator] ⚠️ Strategy 3: Found base unit input with value: ${inputWithValue.id} = "${inputWithValue.value}"`);
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
            // CRITICAL: Exclude checkboxes - only text/number inputs
            () => {
                const inputs = Array.from(document.querySelectorAll(`input[data-symbol="${variable.symbol}"]`))
                    .filter(inp => inp.type !== 'checkbox' && inp.type !== 'radio'); // Exclude checkboxes/radios
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
    /**
     * Parse and convert input value to base unit
     * Improved: Cleaner, stricter, single exit path
     */
    parseInputValue(input, variable) {
        const value = input.value?.trim();
        
        // Return null if empty (empty means unknown)
        if (!value || this.isNAValue(value)) {
            return null;
        }
        
        const inputUnit = this._effectiveInputUnit(input, variable);
        const baseUnit = variable.unit;
        
        // CRITICAL: Log which input field was selected
        const inputId = input.id || 'unknown';
        const inputDataUnit = input.getAttribute('data-unit') || 'not set';
        console.log(`[CalculationOrchestrator] parseInputValue for ${variable.symbol}:`, {
            inputId,
            inputDataUnitAttr: inputDataUnit,
            rawValue: value,
            inputUnit,
            baseUnit,
            needsConversion: !this._unitsCanonicallyEqual(inputUnit, baseUnit),
            willConvert: !this._unitsCanonicallyEqual(inputUnit, baseUnit) && this.unitConverter
        });
        
        // Parse numeric value
        const numericValue = this.parseNumericValue(value, inputUnit);
        
        // Validate: must be a finite number
        if (!Number.isFinite(numericValue)) {
            throw new Error(`Invalid numeric value for ${variable.symbol}: "${value}"`);
        }
        
        // Prepare metadata used for conversion auditing and accuracy checks.
        const symbol = variable.symbol;
        const canonicalFrom = this.unitConverter?.getCanonical
            ? this.unitConverter.getCanonical(inputUnit)
            : inputUnit;
        const canonicalBase = this.unitConverter?.getCanonical
            ? this.unitConverter.getCanonical(baseUnit)
            : baseUnit;
        const categoryFrom = this.unitConverter?.getUnitCategory
            ? this.unitConverter.getUnitCategory(canonicalFrom)
            : null;
        const categoryBase = this.unitConverter?.getUnitCategory
            ? this.unitConverter.getUnitCategory(canonicalBase)
            : null;
        const metadata = {
            symbol,
            rawInput: value,
            inputUnit,
            baseUnit,
            canonicalFrom,
            canonicalBase,
            categoryFrom,
            categoryBase,
            originalValue: numericValue,
            convertedValue: numericValue,
            converted: false,
            factorApplied: 1
        };

        // CRITICAL: Always convert to base unit if unitConverter is available
        // This ensures values are in the correct units before being used in formulas
        if (this.unitConverter) {
            if (!this._unitsCanonicallyEqual(inputUnit, baseUnit)) {
                // Convert from input unit to base unit
                console.log(`[CalculationOrchestrator] 🔄 Converting ${variable.symbol}: ${numericValue} ${inputUnit} → base unit (${baseUnit})`);
                console.log(`[CalculationOrchestrator] Input field ID: ${inputId}, data-unit: "${inputDataUnit}"`);
                
                const baseValue = this.unitConverter.convertToBase(numericValue, inputUnit, baseUnit);
                
                // CRITICAL: Validate conversion actually happened
                if (!Number.isFinite(baseValue)) {
                    throw new Error(`Unit conversion failed for ${variable.symbol}: ${numericValue} ${inputUnit} → ${baseUnit}`);
                }
                
                metadata.converted = true;
                metadata.convertedValue = baseValue;
                metadata.factorApplied = numericValue !== 0 ? (baseValue / numericValue) : null;
                metadata.temperatureAffine = categoryFrom === 'temperature' || categoryBase === 'temperature';
                if (!metadata.temperatureAffine) {
                    const expectedFactor = this.unitConverter.convertToBase(1, inputUnit, baseUnit);
                    metadata.expectedFactor = expectedFactor;
                    if (Number.isFinite(expectedFactor)) {
                        const expectedValue = numericValue * expectedFactor;
                        const tolerance = Math.max(1e-12, Math.abs(expectedValue) * 1e-9);
                        if (Math.abs(baseValue - expectedValue) > tolerance) {
                            throw new Error(
                                `Conversion mismatch for ${symbol}: expected ${expectedValue} ${baseUnit}, got ${baseValue} ${baseUnit}`
                            );
                        }
                    }
                }
                
                console.log(`[CalculationOrchestrator] ✅ Converted ${variable.symbol}: ${numericValue} ${inputUnit} = ${baseValue} ${baseUnit}`);
                console.log(`[CalculationOrchestrator] ✅ Conversion verified: ${baseValue} ${baseUnit} will be used in calculation`);
                this._lastConversionMetadata[symbol] = metadata;
                return baseValue;
            } else {
                // Already in base unit, but verify we're not missing a conversion
                if (inputDataUnit !== 'not set' && !this._unitsCanonicallyEqual(inputDataUnit, baseUnit)) {
                    console.warn(`[CalculationOrchestrator] ⚠️ WARNING: Input has data-unit="${inputDataUnit}" but inputUnit=${inputUnit} equals baseUnit=${baseUnit}`);
                    console.warn(`[CalculationOrchestrator] ⚠️ This might indicate the wrong input field was selected!`);
                }
                // Already in base unit, but log for verification
                console.log(`[CalculationOrchestrator] ${variable.symbol} already in base unit: ${numericValue} ${baseUnit}`);
            }
        } else {
            console.warn(`[CalculationOrchestrator] ⚠️ No unitConverter available for ${variable.symbol}, using raw value`);
        }

        this._lastConversionMetadata[symbol] = metadata;
        return numericValue;
    }

    _validateConversionMetadata(formula, variableValues) {
        if (!this.unitConverter) return;
        for (const variable of (formula?.variables || [])) {
            const symbol = variable.symbol;
            const value = variableValues[symbol];
            if (value === null || value === undefined || !Number.isFinite(value)) continue;
            const meta = this._lastConversionMetadata[symbol];
            if (!meta) continue;
            if (!this._unitsCanonicallyEqual(meta.inputUnit, meta.baseUnit) && !meta.temperatureAffine) {
                if (!Number.isFinite(meta.expectedFactor)) {
                    throw new Error(`Missing conversion metadata factor for ${symbol} (${meta.inputUnit} → ${meta.baseUnit})`);
                }
            }
            if (meta.categoryFrom && meta.categoryBase && meta.categoryFrom !== meta.categoryBase) {
                throw new Error(`Unit category mismatch for ${symbol}: ${meta.categoryFrom} cannot convert to ${meta.categoryBase}`);
            }
        }
    }
    
    /**
     * Clear input cache (call when inputs are re-rendered)
     */
    clearInputCache() {
        this._inputCache.clear();
    }

    /**
     * Whether two unit strings are the same physical unit (e.g. m vs meters).
     * Prevents mis-ranking inputs when formula uses "meters" but fields use data-unit "m".
     */
    _unitsCanonicallyEqual(a, b) {
        if (a == null || b == null) {
            return a === b;
        }
        if (!this.unitConverter || typeof this.unitConverter.getCanonical !== 'function') {
            return String(a) === String(b);
        }
        try {
            return this.unitConverter.getCanonical(a) === this.unitConverter.getCanonical(b);
        } catch (_) {
            return String(a) === String(b);
        }
    }

    /**
     * Physical unit for this input: data-unit, else infer from id var-{sym}-{sanitizedUnit}, else formula base.
     */
    _effectiveInputUnit(input, variable) {
        if (!input) {
            return variable.unit || '';
        }
        let u = input.getAttribute('data-unit');
        if (u != null && String(u).trim() !== '') {
            return String(u).trim();
        }
        // Never use data-base-unit here: it is the same formula base on every column (kg, m, …).
        // Empty/missing data-unit would wrongly make g, AU, etc. look like the base unit.
        const id = input.id || '';
        const prefix = `var-${variable.symbol}-`;
        if (id.startsWith(prefix) && this.unitConverter && typeof this.unitConverter.getAlternativeUnits === 'function') {
            const suffix = id.slice(prefix.length);
            try {
                const alts = this.unitConverter.getAlternativeUnits(variable.unit);
                const found = alts.find((unit) => unit.replace(/[^a-zA-Z0-9]/g, '_') === suffix);
                if (found) {
                    return found;
                }
            } catch (_) {
                /* ignore */
            }
        }
        return variable.unit || '';
    }

    /**
     * Single source of truth: rank all unit fields in the calculator container.
     * Prefers user-edited, then non–base-unit (so km converts to meters), then DOM order.
     */
    _pickBestVariableInputFromContainer(variable) {
        const container = document.getElementById('variables-container');
        if (!container) {
            return null;
        }
        const cacheKey = `var-${variable.symbol}`;
        const baseUnit = variable.unit;
        const inContainer = Array.from(
            container.querySelectorAll(
                `input[data-symbol="${variable.symbol}"], input[id="${cacheKey}"], input[id^="var-${variable.symbol}-"]`
            )
        ).filter((inp) => inp.type !== 'checkbox' && inp.type !== 'radio');
        if (inContainer.length === 0) {
            return null;
        }
        const withValue = inContainer.filter((inp) => inp.value && inp.value.trim());
        if (withValue.length === 0) {
            return inContainer[0];
        }
        const rank = (inp) => {
            const unit = this._effectiveInputUnit(inp, variable);
            const isNonBase = !this._unitsCanonicallyEqual(unit, baseUnit);
            const userEdited = inp.dataset && inp.dataset.userEdited === 'true';
            return (userEdited ? 1000 : 0) + (isNonBase ? 100 : 0);
        };
        return [...withValue].sort((a, b) => rank(b) - rank(a))[0];
    }
    
    /**
     * Generate cache key for calculation results
     * Key includes formula ID and all input values (normalized to base units)
     */
    _generateCalculationCacheKey(formulaId, variableValues) {
        // Sort variable values by symbol for consistent keys
        const sortedEntries = Object.entries(variableValues)
            .filter(([_, v]) => v !== null && typeof v === 'number' && Number.isFinite(v))
            .sort((a, b) => a[0].localeCompare(b[0]));
        
        // Create deterministic key: formulaId + sorted variable values
        const varString = sortedEntries.map(([symbol, value]) => `${symbol}:${value}`).join('|');
        return `${formulaId}|${varString}`;
    }
    
    /**
     * Cache calculation result with LRU eviction
     */
    _cacheCalculationResult(cacheKey, result) {
        // LRU eviction: remove oldest if cache is full
        if (this._calculationResultCache.size >= this._maxCacheSize) {
            // Remove first (oldest) entry
            const firstKey = this._calculationResultCache.keys().next().value;
            if (firstKey !== undefined) {
                this._calculationResultCache.delete(firstKey);
                console.log(`[CalculationOrchestrator] 🗑️ Evicted oldest cache entry: ${firstKey}`);
            }
        }
        
        this._calculationResultCache.set(cacheKey, {
            result,
            timestamp: Date.now()
        });
        console.log(`[CalculationOrchestrator] 💾 Cached result for key: ${cacheKey}`);
    }
    
    /**
     * Enhance result with all unit conversions for display
     * This ensures cached results include all unit information
     */
    _enhanceResultWithUnitConversions(result, formula) {
        if (!result || result.isSymbolic || typeof result.result !== 'number' || !Number.isFinite(result.result)) {
            return result; // Return as-is for symbolic results
        }
        
        const solvedFor = result.solvedFor || result.variable;
        if (!solvedFor || solvedFor === 'result' || !this.unitConverter) {
            return result; // Can't enhance without variable info or unit converter
        }
        
        const varDef = formula.variables.find(v => v.symbol === solvedFor);
        if (!varDef || !varDef.unit) {
            return result; // No unit defined for this variable
        }
        
        const baseUnit = varDef.unit;
        const baseValue = result.result;
        
        // Get all alternative units and create conversions
        try {
            const alternativeUnits = this.unitConverter.getAlternativeUnits(baseUnit);
            const unitConversions = [];
            
            for (const altUnit of alternativeUnits) {
                if (this._unitsCanonicallyEqual(altUnit, baseUnit)) continue;
                try {
                    const convertedValue = this.unitConverter.convert(baseValue, baseUnit, altUnit);
                    if (convertedValue !== null && Number.isFinite(convertedValue)) {
                        unitConversions.push({
                            unit: altUnit,
                            value: convertedValue
                        });
                    }
                } catch (e) {
                    // Skip failed conversions
                }
            }
            
            // Add unit conversions to result
            return {
                ...result,
                unitConversions: unitConversions,
                baseUnit: baseUnit,
                baseValue: baseValue
            };
        } catch (e) {
            console.warn('[CalculationOrchestrator] Failed to generate unit conversions:', e);
            return result; // Return original if conversion fails
        }
    }
    
    /**
     * Validate variable values
     * Improved: Cleaner, linear scan, no unnecessary vectorization
     */
    validateVariableValues(values, formula) {
        for (const [symbol, value] of Object.entries(values)) {
            if (value !== null && !Number.isFinite(value)) {
                return { valid: false, error: `Invalid value for ${symbol}` };
            }
        }
        return { valid: true };
    }
    validateResult(result) {
        if (!result)
            return false;
        if (result.isSymbolic) {
            // Symbolic results must be strings
            return typeof result.result === 'string' && result.result.length > 0;
        }
        // CRITICAL: Numeric results MUST be numbers - no string parsing allowed
        if (typeof result.result !== 'number') {
            console.error('[CalculationOrchestrator] ❌ Validation failed: Numeric result has non-number type:', typeof result.result, 'Value:', result.result);
            return false;
        }
        return Number.isFinite(result.result) && !isNaN(result.result);
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
    /**
     * Handle symbolic calculation result
     * Improved: Streamlined, enforces contracts, removes messy recovery logic
     */
    handleSymbolicResult(calculator, formula, knownVars = {}) {
        const filteredKnownVars = Object.fromEntries(
            Object.entries(knownVars).filter(([_, val]) => Number.isFinite(val))
        );
        
        const result = calculator.solveSymbolically(filteredKnownVars);
        
        // Enforce contract: symbolic results must have .result and .isSymbolic = true
        if (!result || typeof result.result === 'undefined') {
            throw new Error('Symbolic solver returned invalid result');
        }
        
        if (typeof result.result === 'number' && !Number.isFinite(result.result)) {
            throw new Error('Symbolic solver returned non-finite numeric result');
        }
        
        result.isSymbolic = true;
        this.displayResult(result);
    }
    
    /**
     * Update all unit input fields for a variable with converted values
     * This makes the system fully unit-aware - when a result is calculated,
     * all unit inputs for that variable are automatically populated
     */
    updateVariableUnitInputs(symbol, baseValue, formula) {
        if (!this.unitConverter || !formula) {
            return;
        }
        
        const variable = formula.variables.find(v => v.symbol === symbol);
        if (!variable) {
            console.warn(`[CalculationOrchestrator] Variable ${symbol} not found in formula`);
            return;
        }
        
        const baseUnit = variable.unit;
        if (!baseUnit) {
            console.warn(`[CalculationOrchestrator] Variable ${symbol} has no unit defined`);
            return;
        }
        
        try {
            const alternativeUnits = this.unitConverter.getAlternativeUnits(baseUnit);
            
            console.log(`[CalculationOrchestrator] 🔄 Updating unit inputs for ${symbol} = ${baseValue} ${baseUnit}`);
            console.log(`[CalculationOrchestrator] Alternative units:`, alternativeUnits);
            
            // Update each unit input with the converted value
            alternativeUnits.forEach((unit, index) => {
                try {
                    // Convert from base unit to this unit
                    const convertedValue = this.unitConverter.convert(baseValue, baseUnit, unit);
                    
                    if (convertedValue !== null && Number.isFinite(convertedValue)) {
                        // Find the input field
                        const inputId = `var-${symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                        let input = document.getElementById(inputId);
                        
                        if (!input) {
                            // Fallback: find by data attributes
                            input = document.querySelector(`input[data-symbol="${symbol}"][data-unit-index="${index}"]`);
                        }
                        
                        if (input) {
                            // Format the value appropriately
                            let formattedValue;
                            if (Math.abs(convertedValue) >= 1e6 || (Math.abs(convertedValue) < 1e-3 && convertedValue !== 0)) {
                                formattedValue = convertedValue.toExponential(6);
                            } else {
                                // Show reasonable precision, remove trailing zeros
                                formattedValue = convertedValue.toFixed(6).replace(/\.?0+$/, '');
                            }
                            
                            // Only update if the input is empty or was previously calculated
                            // Don't overwrite user-entered values unless they were calculated
                            const currentValue = input.value.trim();
                            if (!currentValue || currentValue === '' || input.dataset.calculated === 'true') {
                                input.value = formattedValue;
                                input.dataset.calculated = 'true'; // Mark as calculated
                                console.log(`[CalculationOrchestrator] ✅ Updated ${inputId} = ${formattedValue} ${unit}`);
                            } else {
                                console.log(`[CalculationOrchestrator] ⏭️  Skipped ${inputId} (has user value: ${currentValue})`);
                            }
                        } else {
                            console.warn(`[CalculationOrchestrator] Input field not found for ${symbol} in ${unit} (${inputId})`);
                        }
                    }
                } catch (error) {
                    console.warn(`[CalculationOrchestrator] Failed to convert ${symbol} to ${unit}:`, error.message);
                }
            });
        } catch (error) {
            console.error(`[CalculationOrchestrator] Error updating unit inputs for ${symbol}:`, error);
        }
    }
    
    /**
     * Update graph after calculation
     * Improved: Checks symbolic result first, removes redundant type warnings
     */
    updateGraphAfterCalculation(formula, variableValues, result) {
        if (!this.updateGraphIfEnabled || result.isSymbolic) return;
        
        const graphManager = this.getGraphManager();
        if (!graphManager) return;
        
        const graphVariableValues = { ...(variableValues || {}) };
        const solvedFor = result?.solvedFor || result?.variable;
        if (solvedFor != null && typeof result?.result === 'number' && Number.isFinite(result.result)) {
            graphVariableValues[solvedFor] = result.result;
        }
        
        this.updateGraphIfEnabled(formula, graphVariableValues, {
            calculatedPoint: result.variable
                ? { x: result.result, label: `${result.variable} = ${result.result} ${result.unit || ''}`.trim() }
                : undefined,
            equation: formula.equation || formula.name,
            result: result
        });
        
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
