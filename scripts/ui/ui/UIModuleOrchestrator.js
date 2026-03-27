/**
 * UIModuleOrchestrator - IMPROVED VERSION
 * Better dependency injection, error handling, and initialization
 */
import { SearchEngine } from './modules/search/SearchEngine.js';
import { CalculationOrchestrator } from './modules/calculation/CalculationOrchestrator.js?v=2.3.1';
import { TabManager } from './modules/tabs/TabManager.js';
import { GraphCoordinator } from './modules/graph/GraphCoordinator.js';
import { FormulaSelector } from './modules/formula/FormulaSelector.js';
import { EventCoordinator } from './modules/events/EventCoordinator.js?v=2.1.9';
import { CalculationUtils } from './modules/utils/CalculationUtils.js';
import { FormattingUtils } from './modules/utils/FormattingUtils.js';
import { FormulaRenderer } from './modules/rendering/FormulaRenderer.js?v=2.1.7';
import { debounceSearch } from './utils/debounce.js';
import { validateCalculator, validateFormula } from './contracts.js';
import { AstrophysicsExpertSystem } from './modules/expert/ExpertSystem.js';
export class UIModuleOrchestrator {
    constructor(options) {
        this.initialized = false;
        this.options = options;
        this.formattingUtils = new FormattingUtils();
        this.calculationUtils = new CalculationUtils(options.ExpressionParser, options.SafeMathEvaluator);
        this.initializeModules();
        this.wireModules();
    }
    initializeModules() {
        try {
            // Initialize SearchEngine
            this.searchEngine = new SearchEngine({
                formulas: this.options.formulas,
                formulaCategories: this.options.formulaCategories,
                cache: this.options.searchCache,
                performanceOptimizer: this.options.performanceOptimizer,
                semanticSearchSystem: this.options.semanticSearchSystem,
                version: 'v2.2.0' // For cache key invalidation
            });
            // Initialize Expert System (question -> formula)
            this.expertSystem = new AstrophysicsExpertSystem(
                this.options.formulas,
                this.searchEngine
            );
            // Expose globally for easy access
            window.expertSystem = this.expertSystem;
            window.solveQuestion = (q) => this.expertSystem.solveQuestion(q);

            // Initialize GraphCoordinator (disabled in calculator card flow)
            this.graphCoordinator = new GraphCoordinator({
                enabled: false,
                containerId: 'desmos-graph',
                tabId: 'graph-tab',
                createGraphManager: () => {
                    if (this.options.EnhancedOfflineGraphManagerV2) {
                        const manager = new this.options.EnhancedOfflineGraphManagerV2({
                            containerId: 'desmos-graph',
                            tabId: 'graph-tab'
                        });
                        // Store in window for backward compatibility
                        window.graphManager = manager;
                        return manager;
                    }
                    return null;
                },
                getGraphManager: () => {
                    return window.graphManager || null;
                },
                onGraphError: (error, formula) => {
                    console.error('[Orchestrator] Graph error:', error);
                }
            });
            // Initialize TabManager
            this.tabManager = new TabManager({
                onMainTabSwitch: (tabName) => {
                    console.log('[Orchestrator] Main tab switched:', tabName);
                },
                onTabSwitch: (_tabName) => {},
                initFormulaExplorer: () => {
                    if (typeof window.initFormulaExplorer === 'function') {
                        window.initFormulaExplorer();
                    }
                },
                initStellarClassifier: () => {
                    if (this.options.StellarClassifier) {
                        return new this.options.StellarClassifier();
                    }
                    return null;
                },
                onGraphTabActivated: () => {}
            });
            // Initialize CalculationOrchestrator
            this.calculationOrchestrator = new CalculationOrchestrator({
                getCalculator: () => this.formulaSelector?.getCurrentCalculator() || null,
                getFormula: () => this.formulaSelector?.getCurrentFormula() || null,
                getGraphManager: () => null,
                parseNumericValue: (input, unit) => this.calculationUtils.parseNumericValue(input, unit),
                displayResult: (result) => this.displayResult(result),
                displayError: (message) => this.displayError(message),
                updateGraphIfEnabled: () => {},
                updateGraphInterpretation: () => {},
                updateSolveIndicators: () => {
                    if (typeof window.updateSolveIndicators === 'function') {
                        window.updateSolveIndicators();
                    }
                },
                unitConverter: this.options.UnitConverter ? {
                    // Wrapper to convert static methods to instance methods
                    convertToBase: (value, fromUnit, baseUnit) => this.options.UnitConverter.convertToBase(value, fromUnit, baseUnit),
                    convert: (value, fromUnit, toUnit) => this.options.UnitConverter.convert(value, fromUnit, toUnit),
                    getAlternativeUnits: (baseUnit) => this.options.UnitConverter.getAlternativeUnits(baseUnit),
                    convertAndFormat: (value, unit, options) => this.options.UnitConverter.convertAndFormat(value, unit, options),
                    getCanonical: (unit) => this.options.UnitConverter.getCanonical(unit),
                    getUnitCategory: (unit) => this.options.UnitConverter.getUnitCategory(unit)
                } : null,
                globalConstants: this.options.globalConstants,
                graphUpdatesEnabled: false
            });
            // Initialize FormulaSelector
            this.formulaSelector = new FormulaSelector({
                createCalculator: (formula) => {
                    if (this.options.FormulaCalculatorClass) {
                        // CRITICAL: Pass mathEvaluator so expressions are actually evaluated!
                        return new this.options.FormulaCalculatorClass(formula, {
                            mathEvaluator: this.options.SafeMathEvaluator || window.SafeMathEvaluator,
                            unitConverter: this.options.UnitConverter ? new this.options.UnitConverter() : undefined,
                            precisionCalculator: window.precisionCalculator,
                            errorPropagator: window.errorPropagator
                        });
                    }
                    return null;
                },
                getGraphCoordinator: () => null,
                renderVariableInputs: (formula) => {
                    // Use VariableInputsRenderer if available, otherwise use fallback
                    if (window.variableInputsRenderer && typeof window.variableInputsRenderer.render === 'function') {
                        window.variableInputsRenderer.render(formula);
                    } else {
                        this.renderCalculatorInputs(formula);
                    }
                },
                renderFormulaPresets: (formula) => {
                    if (typeof window.renderFormulaPresets === 'function') {
                        window.renderFormulaPresets(formula);
                    }
                },
                switchTab: (tabName) => this.tabManager.switchTab(tabName),
                performCalculation: () => this.calculationOrchestrator.performCalculation(),
                updateSolveIndicators: () => {
                    if (typeof window.updateSolveIndicators === 'function') {
                        window.updateSolveIndicators();
                    }
                },
                updateGraphIfEnabled: () => {},
                updateGraphInterpretation: () => {},
                getCurrentVariableValues: () => this.getCurrentVariableValues(),
                graphUpdatesEnabled: false,
                cleanupGlobalState: () => {
                    if (typeof window.cleanupGlobalState === 'function') {
                        window.cleanupGlobalState();
                    }
                },
                trackUsage: (term) => {
                    if (this.options.semanticSearchSystem?.trackUsage) {
                        this.options.semanticSearchSystem.trackUsage(term);
                    }
                },
                displayRelatedFormulas: (formula) => {
                    if (typeof window.displayRelatedFormulas === 'function') {
                        window.displayRelatedFormulas(formula);
                    }
                }
            });
            // Initialize EventCoordinator
            // Create bound methods for callbacks to ensure correct 'this' context
            const boundOnClassify = () => {
                console.log('[UIModuleOrchestrator] onClassify callback invoked');
                if (this.performClassification && typeof this.performClassification === 'function') {
                    console.log('[UIModuleOrchestrator] Calling performClassification() directly...');
                    try {
                        this.performClassification();
                    } catch (error) {
                        console.error('[UIModuleOrchestrator] Error in performClassification:', error);
                        if (typeof window.performClassification === 'function') {
                            console.log('[UIModuleOrchestrator] Falling back to window.performClassification');
                            window.performClassification();
                        }
                    }
                } else if (typeof window.performClassification === 'function') {
                    console.log('[UIModuleOrchestrator] Using window.performClassification fallback');
                    window.performClassification();
                } else {
                    console.error('[UIModuleOrchestrator] ❌ performClassification not available');
                }
            };
            
            const boundOnMainClassify = () => {
                console.log('[UIModuleOrchestrator] onMainClassify callback invoked');
                if (this.performMainClassification && typeof this.performMainClassification === 'function') {
                    console.log('[UIModuleOrchestrator] Calling performMainClassification() directly...');
                    try {
                        this.performMainClassification();
                    } catch (error) {
                        console.error('[UIModuleOrchestrator] Error in performMainClassification:', error);
                        if (typeof window.performMainClassification === 'function') {
                            console.log('[UIModuleOrchestrator] Falling back to window.performMainClassification');
                            window.performMainClassification();
                        }
                    }
                } else if (typeof window.performMainClassification === 'function') {
                    console.log('[UIModuleOrchestrator] Using window.performMainClassification fallback');
                    window.performMainClassification();
                } else {
                    console.error('[UIModuleOrchestrator] ❌ performMainClassification not available');
                }
            };
            
            // Bind onCalculate to ensure 'this' context is correct
            this.onCalculate = () => {
                console.log('[UIModuleOrchestrator] ⚡⚡⚡ onCalculate callback invoked ⚡⚡⚡');
                console.log('[UIModuleOrchestrator] this:', this);
                console.log('[UIModuleOrchestrator] this.calculationOrchestrator:', this.calculationOrchestrator);
                console.log('[UIModuleOrchestrator] typeof performCalculation:', typeof this.calculationOrchestrator?.performCalculation);
                
                // Single execution path: calculationOrchestrator.performCalculation()
                if (this.calculationOrchestrator && typeof this.calculationOrchestrator.performCalculation === 'function') {
                    console.log('[UIModuleOrchestrator] ✅ Calling calculationOrchestrator.performCalculation() NOW...');
                    try {
                        this.calculationOrchestrator.performCalculation();
                        console.log('[UIModuleOrchestrator] ✅ performCalculation() call completed');
                    } catch (error) {
                        console.error('[UIModuleOrchestrator] ❌ Error in performCalculation:', error);
                        console.error('[UIModuleOrchestrator] Error stack:', error.stack);
                        throw error;
                    }
                } else {
                    console.error('[UIModuleOrchestrator] ❌ calculationOrchestrator or performCalculation not available');
                    console.error('[UIModuleOrchestrator] calculationOrchestrator exists:', !!this.calculationOrchestrator);
                    console.error('[UIModuleOrchestrator] performCalculation type:', typeof this.calculationOrchestrator?.performCalculation);
                }
            };
            
            this.eventCoordinator = new EventCoordinator({
                onBackButton: () => this.handleBackButton(),
                onMainTabSwitch: (tabName) => this.tabManager.switchMainTab(tabName),
                onSubTabSwitch: (tabName) => this.tabManager.switchTab(tabName),
                onCalculate: this.onCalculate.bind(this),
                onClear: () => {
                    // Clear input cache
                    if (this.calculationOrchestrator && typeof this.calculationOrchestrator.clearInputCache === 'function') {
                        this.calculationOrchestrator.clearInputCache();
                    }
                },
                onFormulaCardClick: (formulaId) => {
                    const formula = this.options.formulas.find(f => f.id === formulaId);
                    if (formula) {
                        this.formulaSelector.selectFormula(formula);
                    }
                },
                onClassify: boundOnClassify,
                onMainClassify: boundOnMainClassify,
                setupGraphControls: () => {
                    if (typeof window.setupGraphControls === 'function') {
                        window.setupGraphControls();
                    }
                }
            });
            // Initialize FormulaRenderer
            this.formulaRenderer = new FormulaRenderer({
                onFormulaClick: (formula) => {
                    this.formulaSelector.selectFormula(formula);
                }
            });
            
            // Setup cache invalidation hooks
            this.setupCacheInvalidationHooks();
            
            console.log('[UIModuleOrchestrator] ✅ All modules initialized');
            
            // Verify initialization order
            this.verifyInitializationOrder();
        }
        catch (error) {
            console.error('[UIModuleOrchestrator] Error initializing modules:', error);
            throw error;
        }
    }

    /**
     * Verify initialization order and log dependency graph
     */
    verifyInitializationOrder() {
        console.log('[UIModuleOrchestrator] 🔍 Verifying initialization order...');
        console.log('[UIModuleOrchestrator] ⏱️ BREAKPOINT: Initialization verification at', new Date().toISOString());
        
        const dependencies = {
            searchEngine: !!this.searchEngine,
            expertSystem: !!this.expertSystem,
            graphCoordinator: !!this.graphCoordinator,
            tabManager: !!this.tabManager,
            calculationOrchestrator: !!this.calculationOrchestrator,
            formulaSelector: !!this.formulaSelector,
            eventCoordinator: !!this.eventCoordinator,
            formulaRenderer: !!this.formulaRenderer
        };
        
        console.log('[UIModuleOrchestrator] 📊 Dependency status:', dependencies);
        
        // Check critical dependencies
        const criticalDeps = {
            calculationOrchestrator: !!this.calculationOrchestrator,
            eventCoordinator: !!this.eventCoordinator,
            formulaSelector: !!this.formulaSelector
        };
        
        const allCriticalPresent = Object.values(criticalDeps).every(v => v === true);
        console.log('[UIModuleOrchestrator] Critical dependencies:', criticalDeps);
        console.log('[UIModuleOrchestrator] All critical dependencies present:', allCriticalPresent);
        
        // Verify calculationOrchestrator is created before eventCoordinator
        if (this.calculationOrchestrator && this.eventCoordinator) {
            console.log('[UIModuleOrchestrator] ✅ Initialization order correct: calculationOrchestrator before eventCoordinator');
        } else {
            console.error('[UIModuleOrchestrator] ❌ Initialization order issue detected');
            if (!this.calculationOrchestrator) {
                console.error('[UIModuleOrchestrator] ❌ calculationOrchestrator is missing!');
            }
            if (!this.eventCoordinator) {
                console.error('[UIModuleOrchestrator] ❌ eventCoordinator is missing!');
            }
        }
        
        // Verify window.performCalculation is assigned
        const hasWindowPerformCalculation = typeof window.performCalculation === 'function';
        console.log('[UIModuleOrchestrator] window.performCalculation assigned:', hasWindowPerformCalculation);
        if (!hasWindowPerformCalculation) {
            console.warn('[UIModuleOrchestrator] ⚠️ window.performCalculation not assigned yet (may be assigned later)');
        }
        
        // Verify window.uiOrchestrator is assigned
        const hasWindowUiOrchestrator = typeof window.uiOrchestrator !== 'undefined';
        console.log('[UIModuleOrchestrator] window.uiOrchestrator assigned:', hasWindowUiOrchestrator);
        if (!hasWindowUiOrchestrator) {
            console.warn('[UIModuleOrchestrator] ⚠️ window.uiOrchestrator not assigned yet (may be assigned later)');
        }
        
        // Log dependency graph
        console.log('[UIModuleOrchestrator] 📊 Dependency Graph:');
        console.log('  searchEngine → expertSystem');
        console.log('  graphCoordinator → tabManager');
        console.log('  formulaSelector → calculationOrchestrator');
        console.log('  calculationOrchestrator → eventCoordinator (onCalculate callback)');
        console.log('  formulaRenderer → formulaSelector');
        
        return {
            dependencies,
            criticalDeps,
            allCriticalPresent,
            hasWindowPerformCalculation,
            hasWindowUiOrchestrator
        };
    }
    wireModules() {
        // Expose to window for backward compatibility
        if (typeof window !== 'undefined') {
            window.uiOrchestrator = this;
            window.selectFormula = (formula) => this.formulaSelector.selectFormula(formula);
            window.performCalculation = () => {
                console.log('[UIModuleOrchestrator] 🎯 window.performCalculation() called');
                console.log('[UIModuleOrchestrator] calculationOrchestrator:', this.calculationOrchestrator);
                console.log('[UIModuleOrchestrator] formulaSelector:', this.formulaSelector);
                console.log('[UIModuleOrchestrator] currentFormula:', this.formulaSelector?.getCurrentFormula());
                console.log('[UIModuleOrchestrator] currentCalculator:', this.formulaSelector?.getCurrentCalculator());
                
                if (!this.calculationOrchestrator) {
                    console.error('[UIModuleOrchestrator] ❌ calculationOrchestrator is null/undefined!');
                    return;
                }
                
                if (typeof this.calculationOrchestrator.performCalculation !== 'function') {
                    console.error('[UIModuleOrchestrator] ❌ performCalculation is not a function!', typeof this.calculationOrchestrator.performCalculation);
                    return;
                }
                
                try {
                    console.log('[UIModuleOrchestrator] Calling calculationOrchestrator.performCalculation()...');
                    const result = this.calculationOrchestrator.performCalculation();
                    console.log('[UIModuleOrchestrator] ✅ performCalculation() completed, result:', result);
                    return result;
                } catch (error) {
                    console.error('[UIModuleOrchestrator] ❌ Error calling performCalculation():', error);
                    console.error('[UIModuleOrchestrator] Error stack:', error.stack);
                    throw error;
                }
            };
            window.switchTab = (tabName) => this.tabManager.switchTab(tabName);
            window.switchMainTab = (tabName) => this.tabManager.switchMainTab(tabName);
            window.searchEngine = this.searchEngine;
            window.graphCoordinator = this.graphCoordinator;
            window.renderFormulaList = () => this.renderInitialFormulas();
            window.performClassification = () => this.performClassification();
            window.performMainClassification = () => this.performMainClassification();
            
            // Diagnostic function
            window.diagnoseCalculation = () => {
                console.log('=== CALCULATION SYSTEM DIAGNOSTICS ===');
                console.log('1. UI Orchestrator:', this ? '✅ Exists' : '❌ Missing');
                console.log('2. Calculation Orchestrator:', this.calculationOrchestrator ? '✅ Exists' : '❌ Missing');
                console.log('3. Formula Selector:', this.formulaSelector ? '✅ Exists' : '❌ Missing');
                console.log('4. Event Coordinator:', this.eventCoordinator ? '✅ Exists' : '❌ Missing');
                console.log('5. Current Formula:', this.formulaSelector?.getCurrentFormula() || '❌ None selected');
                console.log('6. Current Calculator:', this.formulaSelector?.getCurrentCalculator() ? '✅ Exists' : '❌ Missing');
                console.log('7. Calculate Button:', document.getElementById('calculate-btn') ? '✅ Found in DOM' : '❌ Not in DOM');
                console.log('8. onCalculate callback:', this.eventCoordinator?.options?.onCalculate ? '✅ Set' : '❌ Not set');
                console.log('9. window.performCalculation:', typeof window.performCalculation === 'function' ? '✅ Exists' : '❌ Missing');
                console.log('10. Input Screen visible:', document.getElementById('input-screen')?.style.display !== 'none' ? '✅ Visible' : '❌ Hidden');
                console.log('=====================================');
                return {
                    uiOrchestrator: !!this,
                    calculationOrchestrator: !!this.calculationOrchestrator,
                    formulaSelector: !!this.formulaSelector,
                    eventCoordinator: !!this.eventCoordinator,
                    currentFormula: this.formulaSelector?.getCurrentFormula() || null,
                    currentCalculator: !!this.formulaSelector?.getCurrentCalculator(),
                    calculateButton: !!document.getElementById('calculate-btn'),
                    onCalculateCallback: !!this.eventCoordinator?.options?.onCalculate,
                    performCalculationFunction: typeof window.performCalculation === 'function',
                    inputScreenVisible: document.getElementById('input-screen')?.style.display !== 'none'
                };
            };
        }
    }
    /**
     * Perform classification for the calculator tab classification section
     */
    performClassification() {
        try {
            console.log('[UIModuleOrchestrator] performClassification() called');
            
            // Try calculator tab inputs first
            let tempInput = document.getElementById('calc-classification-temperature-input');
            let lumSelect = document.getElementById('calc-classification-luminosity-class');
            let protostarCheckbox = document.getElementById('protostar-checkbox');
            let resultDiv = document.getElementById('classification-result');
            
            // If calculator tab inputs not found, try main classification tab
            if (!tempInput || !resultDiv) {
                console.log('[UIModuleOrchestrator] Calculator tab inputs not found, trying main classification tab...');
                tempInput = document.getElementById('main-temperature-input');
                lumSelect = document.getElementById('main-luminosity-class');
                protostarCheckbox = document.getElementById('main-protostar-checkbox');
                resultDiv = document.getElementById('main-classification-result');
            }
            
            if (!tempInput || !resultDiv) {
                console.error('[UIModuleOrchestrator] Classification inputs not found in either tab');
                console.error('[UIModuleOrchestrator] tempInput:', tempInput);
                console.error('[UIModuleOrchestrator] resultDiv:', resultDiv);
                // Try to show error in any available result div
                const anyResultDiv = document.getElementById('classification-result') || document.getElementById('main-classification-result');
                if (anyResultDiv) {
                    anyResultDiv.innerHTML = '<div class="error">Classification inputs not found. Please check the form.</div>';
                    anyResultDiv.classList.add('show');
                }
                return;
            }
            
            console.log('[UIModuleOrchestrator] Found inputs:', {
                tempInput: !!tempInput,
                lumSelect: !!lumSelect,
                protostarCheckbox: !!protostarCheckbox,
                resultDiv: !!resultDiv
            });
            
            const temperature = parseFloat(tempInput.value);
            console.log('[UIModuleOrchestrator] Temperature value:', tempInput.value, 'parsed:', temperature);
            
            if (!temperature || temperature <= 0 || isNaN(temperature)) {
                const errorMsg = '<div class="error">Please enter a valid temperature (K)</div>';
                resultDiv.innerHTML = errorMsg;
                resultDiv.classList.add('show');
                console.error('[UIModuleOrchestrator] Invalid temperature:', tempInput.value);
                return;
            }
            
            const lumValue = lumSelect?.value || null;
            // Parse luminosity class (e.g., "Ia", "V") vs white dwarf type (e.g., "DA")
            const isWhiteDwarf = lumValue?.startsWith('D') || false;
            const whiteDwarfType = isWhiteDwarf ? lumValue : null;
            // Extract luminosity class (I, II, III, IV, V) from values like "Ia", "Ib", "V"
            let luminosityClass = null;
            if (lumValue && !isWhiteDwarf) {
                if (lumValue.startsWith('I')) {
                    luminosityClass = lumValue; // "Ia" or "Ib"
                } else if (lumValue.match(/^[IVX]+$/)) {
                    luminosityClass = lumValue; // "II", "III", "IV", "V"
                }
            }
            const isProtostar = protostarCheckbox?.checked || false;
            
            console.log('[UIModuleOrchestrator] Classification parameters:', {
                temperature,
                luminosityClass,
                isProtostar,
                isWhiteDwarf,
                whiteDwarfType
            });
            
            // Get classifier from TabManager
            const classifier = this.tabManager?.stellarClassifier;
            console.log('[UIModuleOrchestrator] Classifier available:', {
                fromTabManager: !!classifier,
                fromWindow: typeof window.StellarClassifier !== 'undefined'
            });
            
            if (!classifier && window.StellarClassifier) {
                // Fallback: create new instance
                console.log('[UIModuleOrchestrator] Creating new StellarClassifier instance');
                const StellarClassifier = window.StellarClassifier;
                const tempClassifier = new StellarClassifier();
                const classification = tempClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
                console.log('[UIModuleOrchestrator] Classification result:', classification);
                this.displayClassificationResult(resultDiv, classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
            } else if (classifier) {
                console.log('[UIModuleOrchestrator] Using TabManager classifier');
                const classification = classifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
                console.log('[UIModuleOrchestrator] Classification result:', classification);
                this.displayClassificationResult(resultDiv, classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
            } else {
                console.error('[UIModuleOrchestrator] Classification system not available');
                resultDiv.innerHTML = '<div class="error">Classification system not available</div>';
                resultDiv.classList.add('show');
            }
        } catch (error) {
            console.error('[UIModuleOrchestrator] Classification error:', error);
            console.error('[UIModuleOrchestrator] Error stack:', error.stack);
            const resultDiv = document.getElementById('classification-result') || document.getElementById('main-classification-result');
            if (resultDiv) {
                resultDiv.innerHTML = `<div class="error">Classification error: ${error.message}</div>`;
                resultDiv.classList.add('show');
            }
        }
    }
    /**
     * Perform classification for the main classification tab
     */
    performMainClassification() {
        console.log('[UIModuleOrchestrator] performMainClassification() called');
        try {
            const tempInput = document.getElementById('main-temperature-input');
            const lumSelect = document.getElementById('main-luminosity-class');
            const protostarCheckbox = document.getElementById('main-protostar-checkbox');
            const resultDiv = document.getElementById('main-classification-result');
            
            console.log('[UIModuleOrchestrator] Main classification inputs:', {
                tempInput: !!tempInput,
                lumSelect: !!lumSelect,
                protostarCheckbox: !!protostarCheckbox,
                resultDiv: !!resultDiv
            });
            
            if (!tempInput || !resultDiv) {
                console.error('[UIModuleOrchestrator] Main classification inputs not found');
                console.error('[UIModuleOrchestrator] tempInput:', tempInput);
                console.error('[UIModuleOrchestrator] resultDiv:', resultDiv);
                return;
            }
            
            const temperature = parseFloat(tempInput.value);
            console.log('[UIModuleOrchestrator] Temperature value:', tempInput.value, 'parsed:', temperature);
            
            if (!temperature || temperature <= 0 || isNaN(temperature)) {
                const errorMsg = '<div class="error">Please enter a valid temperature (K)</div>';
                resultDiv.innerHTML = errorMsg;
                resultDiv.classList.add('show');
                console.error('[UIModuleOrchestrator] Invalid temperature:', tempInput.value);
                return;
            }
            
            const lumValue = lumSelect?.value || null;
            // Parse luminosity class (e.g., "Ia", "V") vs white dwarf type (e.g., "DA")
            const isWhiteDwarf = lumValue?.startsWith('D') || false;
            const whiteDwarfType = isWhiteDwarf ? lumValue : null;
            // Extract luminosity class (I, II, III, IV, V) from values like "Ia", "Ib", "V"
            let luminosityClass = null;
            if (lumValue && !isWhiteDwarf) {
                if (lumValue.startsWith('I')) {
                    luminosityClass = lumValue; // "Ia" or "Ib"
                } else if (lumValue.match(/^[IVX]+$/)) {
                    luminosityClass = lumValue; // "II", "III", "IV", "V"
                }
            }
            const isProtostar = protostarCheckbox?.checked || false;
            
            console.log('[UIModuleOrchestrator] Main classification parameters:', {
                temperature,
                luminosityClass,
                isProtostar,
                isWhiteDwarf,
                whiteDwarfType
            });
            
            // Get classifier from TabManager
            const classifier = this.tabManager?.stellarClassifier;
            console.log('[UIModuleOrchestrator] Main classifier available:', {
                fromTabManager: !!classifier,
                fromWindow: typeof window.StellarClassifier !== 'undefined'
            });
            
            if (!classifier && window.StellarClassifier) {
                // Fallback: create new instance
                console.log('[UIModuleOrchestrator] Creating new StellarClassifier instance for main tab');
                const StellarClassifier = window.StellarClassifier;
                const tempClassifier = new StellarClassifier();
                const classification = tempClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
                console.log('[UIModuleOrchestrator] Main classification result:', classification);
                this.displayClassificationResult(resultDiv, classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
            } else if (classifier) {
                console.log('[UIModuleOrchestrator] Using TabManager classifier for main tab');
                const classification = classifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
                console.log('[UIModuleOrchestrator] Main classification result:', classification);
                this.displayClassificationResult(resultDiv, classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
            } else {
                console.error('[UIModuleOrchestrator] Classification system not available for main tab');
                resultDiv.innerHTML = '<div class="error">Classification system not available</div>';
                resultDiv.classList.add('show');
            }
        } catch (error) {
            console.error('[UIModuleOrchestrator] Main classification error:', error);
            const resultDiv = document.getElementById('main-classification-result');
            if (resultDiv) {
                resultDiv.innerHTML = `<div class="error">Classification error: ${error.message}</div>`;
            }
        }
    }
    /**
     * Display classification result
     */
    displayClassificationResult(resultDiv, classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
        console.log('[UIModuleOrchestrator] displayClassificationResult called', {
            resultDiv: !!resultDiv,
            classification,
            temperature
        });
        
        if (!resultDiv) {
            console.error('[UIModuleOrchestrator] Result div not provided');
            return;
        }
        
        resultDiv.innerHTML = `
            <div class="classification-result-content">
                <h4>Classification Result</h4>
                <div class="result-badge">${this.formattingUtils.escapeHtml(classification)}</div>
                <div class="result-details">
                    <p><strong>Temperature:</strong> ${temperature.toLocaleString()} K</p>
                    ${luminosityClass ? `<p><strong>Luminosity Class:</strong> ${this.formattingUtils.escapeHtml(luminosityClass)}</p>` : ''}
                    ${isProtostar ? '<p><strong>Type:</strong> Protostar (YSO)</p>' : ''}
                    ${isWhiteDwarf && whiteDwarfType ? `<p><strong>White Dwarf Type:</strong> ${this.formattingUtils.escapeHtml(whiteDwarfType)}</p>` : ''}
                </div>
            </div>
        `;
        
        // Make sure the result div is visible
        resultDiv.classList.add('show');
        console.log('[UIModuleOrchestrator] ✅ Classification result displayed');
    }
    /**
     * Initialize the UI system
     */
    initialize() {
        if (this.initialized) {
            console.warn('[UIModuleOrchestrator] Already initialized');
            return;
        }
        try {
            this.eventCoordinator.setupAll();
            
            // Render initial formulas
            this.renderInitialFormulas();
            
            // Setup command palette event delegation
            this.setupCommandPaletteEvents();
            
            // Setup main search input (if it exists)
            this.setupMainSearchInput();

            // Wire minimal expert question UI (authoritative path)
            this.wireExpertQuestionUI();
            
            this.initialized = true;
            console.log('[UIModuleOrchestrator] ✅ Initialized');
        }
        catch (error) {
            console.error('[UIModuleOrchestrator] Initialization error:', error);
            throw error;
        }
    }
    
    /**
     * Setup command palette event delegation
     */
    setupCommandPaletteEvents() {
        const commandInput = document.getElementById('command-palette-input');
        if (!commandInput) {
            console.warn('[UIModuleOrchestrator] Command palette input not found');
            return;
        }
        
        // Centralized debounced search handler
        const debouncedSearch = debounceSearch((query) => {
            if (query.length > 0) {
                this.handleSearch(query);
            } else {
                this.renderInitialFormulas();
                this.hideCommandPaletteResults();
            }
        }, 75); // 75ms for better performance on slower devices
        
        // Input event for search (debounced)
        commandInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            debouncedSearch(query);
        });
        
        // Keyboard navigation
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Cancel pending search
                debouncedSearch.cancel();
                this.renderInitialFormulas();
                this.hideCommandPaletteResults();
                e.target.value = '';
            }
        });
        
        // Expose debounced function for test flushing
        this._debouncedSearch = debouncedSearch;
        
        console.log('[UIModuleOrchestrator] ✅ Command palette events wired');
    }
    
    /**
     * Setup main search input (formula-search) to filter main formula list
     */
    setupMainSearchInput() {
        const mainSearchInput = document.getElementById('formula-search');
        if (!mainSearchInput) {
            // Main search input doesn't exist, that's ok
            return;
        }
        
        // Use same debounced search handler
        const debouncedSearch = debounceSearch((query) => {
            if (query.length > 0) {
                this.handleSearch(query);
            } else {
                this.renderInitialFormulas();
            }
        }, 75);
        
        mainSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            debouncedSearch(query);
        });
        
        // Store for test access
        this._mainSearchDebounced = debouncedSearch;
        
        console.log('[UIModuleOrchestrator] ✅ Main search input wired');
    }
    
    /**
     * Handle search - updates both command palette and main formula list
     * If query looks like a question, route through ExpertSystem for authoritative answer
     */
    handleSearch(query) {
        // Detect question-like queries (contains question words or is a full sentence)
        const isQuestion = this.detectQuestionQuery(query);
        console.log('[UIModuleOrchestrator] handleSearch:', { query, isQuestion, hasExpertSystem: !!this.expertSystem });
        
        if (isQuestion && this.expertSystem) {
            // Hide command palette dropdown - user wants clean search experience
            this.hideCommandPaletteResults();
            
            // Route through ExpertSystem for authoritative answer
            const expertResult = this.expertSystem.solveQuestion(query);
            
            if (expertResult.success) {
                // Show single authoritative formula
                const formulaList = document.getElementById('formula-list');
                if (formulaList && this.formulaRenderer) {
                    // Create a search result format for the selected formula
                    const expertResultItem = {
                        formula: expertResult.formula,
                        score: expertResult.confidence * 100, // Scale to 0-10000
                        searchData: {
                            metrics: {
                                matchedConcepts: expertResult.matchedConcepts || [],
                                matchedVariables: expertResult.matchedVariables || []
                            },
                            confidence: expertResult.confidence,
                            explanation: expertResult.explanation
                        }
                    };
                    
                    this.formulaRenderer.renderFormulaCards(
                        [expertResultItem],
                        formulaList,
                        {
                            showConfidence: true,
                            showTopicScope: true,
                            maxScore: 10000,
                            searchQuery: query,
                            isExpertResult: true
                        }
                    );
                }
                
                // Don't show command palette results - user wants clean search experience
                // this.renderCommandPaletteResults([expertResultItem]);
                
                // Show expert explanation in output area if it exists
                this.renderExpertResult(expertResult);
                return;
            } else {
                // ExpertSystem refused - show refusal reason
                this.renderExpertRefusal(expertResult);
                return;
            }
        }
        
        // Normal search flow
        const results = this.searchEngine.search(query);
        
        // Hide command palette dropdown - user wants clean search experience
        this.hideCommandPaletteResults();
        
        // Ensure results are sorted by confidence percentage (highest first)
        // The SearchEngine already sorts by score, but we'll ensure it's sorted by the displayed confidence
        const sortedResults = [...results].sort((a, b) => {
            // Primary sort: by raw score (descending) - this determines the confidence percentage
            const scoreDiff = b.score - a.score;
            if (Math.abs(scoreDiff) > 0.001) { // Use epsilon for floating point comparison
                return scoreDiff;
            }
            // Secondary sort: by percentile if available (descending)
            if (b.percentile !== undefined && a.percentile !== undefined) {
                const percentileDiff = b.percentile - a.percentile;
                if (Math.abs(percentileDiff) > 0.001) {
                    return percentileDiff;
                }
            }
            // Tertiary sort: by normalized score if available (descending)
            if (b.normalizedScore !== undefined && a.normalizedScore !== undefined) {
                const normDiff = b.normalizedScore - a.normalizedScore;
                if (Math.abs(normDiff) > 0.001) {
                    return normDiff;
                }
            }
            // Final sort: by formula name (ascending) for consistency
            return (a.formula?.name || '').localeCompare(b.formula?.name || '');
        });
        
        // Don't show command palette results - user wants clean search experience
        // this.renderCommandPaletteResults(sortedResults);
        
        // Update main formula list (limited to 50 for performance)
        const formulaList = document.getElementById('formula-list');
        if (formulaList && this.formulaRenderer) {
            const maxScore = sortedResults.length > 0 ? sortedResults[0].score : 1;
            
            // Pass full search results (with confidence/topic data) to renderer
            // Results are sorted by highest score/confidence percentage first
            this.formulaRenderer.renderFormulaCards(
                sortedResults.slice(0, 50), // Limit to 50 for performance, already sorted
                formulaList,
                {
                    showConfidence: true,
                    showTopicScope: true,
                    maxScore: maxScore,
                    searchQuery: query
                }
            );
        }
    }
    
    /**
     * Detect if query is question-like (contains question words or is a full sentence)
     */
    detectQuestionQuery(query) {
        if (!query || query.length < 10) return false;
        
        const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who', 'calculate', 'compute', 'find', 'determine', 'solve'];
        const lowerQuery = query.toLowerCase();
        
        // Check for question words at start or in sentence
        if (questionWords.some(word => lowerQuery.startsWith(word) || lowerQuery.includes(` ${word} `))) {
            return true;
        }
        
        // Check if it's a full sentence (contains multiple words and ends with ? or is long)
        if (query.includes('?') || (query.split(' ').length >= 5 && query.length > 30)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Render ExpertSystem result (success case)
     */
    renderExpertResult(result) {
        const output = document.getElementById('expert-question-output');
        if (!output) return;
        
        output.innerHTML = `
            <div style="color: #a8c7ff; font-weight: 600; margin-bottom: 8px;">
                Selected Formula: ${this.escapeHtml(result.formula.name)}
            </div>
            <div style="font-family: 'Courier New', monospace; margin-bottom: 8px; color: #cbd5e1;">
                ${this.escapeHtml(result.formula.equation)}
            </div>
            <div style="margin-bottom: 8px;">
                <span style="color: #94a3b8;">Confidence: </span>
                <span style="color: #a8c7ff; font-weight: 600;">${result.confidence.toFixed(1)}%</span>
            </div>
            <div style="font-size: 0.9em; color: #cbd5e1; margin-top: 8px;">
                ${this.escapeHtml(result.explanation)}
            </div>
        `;
    }
    
    /**
     * Render ExpertSystem refusal (failure case)
     */
    renderExpertRefusal(result) {
        const output = document.getElementById('expert-question-output');
        if (!output) return;
        
        let reason = 'Question is too ambiguous or not suitable for formula selection.';
        if (result.hasCalculus) {
            reason = 'This question involves calculus, which is not supported.';
        } else if (result.error) {
            reason = result.error;
        }
        
        output.innerHTML = `
            <div style="color: #f87171; font-weight: 600; margin-bottom: 8px;">
                Cannot determine a single formula
            </div>
            <div style="font-size: 0.9em; color: #cbd5e1;">
                ${this.escapeHtml(reason)}
            </div>
            ${result.suggestions && result.suggestions.length > 0 ? `
                <div style="margin-top: 8px; font-size: 0.85em; color: #94a3b8;">
                    Try: ${result.suggestions.map(s => `<span style="color: #a8c7ff;">${this.escapeHtml(s)}</span>`).join(', ')}
                </div>
            ` : ''}
        `;
    }
    
    /**
     * Handle command palette search (legacy method, redirects to handleSearch)
     */
    handleCommandPaletteSearch(query) {
        this.handleSearch(query);
    }
    
    /**
     * Render command palette results
     */
    renderCommandPaletteResults(results) {
        const palette = document.getElementById('command-palette');
        if (!palette) return;
        
        // Clear existing results
        const overlay = palette.querySelector('.command-palette-overlay');
        if (overlay) {
            overlay.innerHTML = '';
        }
        
        if (results.length === 0) {
            palette.style.display = 'none';
            return;
        }
        
        // Create results container with ID for test
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'command-palette-results';
        resultsContainer.className = 'command-palette-results';
        
        // Vectorized: Use map + DocumentFragment for batch DOM operations
        const fragment = document.createDocumentFragment();
        results.slice(0, 10).map(result => {
            const item = document.createElement('div');
            item.className = 'command-palette-item';
            item.innerHTML = `
                <div class="formula-name">${result.formula.name}</div>
                <div class="formula-equation">${result.formula.equation}</div>
            `;
            
            // Click handler with preventDefault and stopPropagation
            item.addEventListener('click', (e) => {
                e.preventDefault();     // stop default action
                e.stopPropagation();    // stop bubbling to input
                this.selectFormulaFromCommandPalette(result.formula); // handle selection
            });
            
            fragment.appendChild(item);
            return item;
        });
        resultsContainer.appendChild(fragment);
        
        if (overlay) {
            overlay.appendChild(resultsContainer);
        }
        
        // Ensure container is visible
        palette.style.display = 'block';
        
        // Setup outside click handler (only once)
        if (!this.commandPaletteOutsideClickHandler) {
            this.commandPaletteOutsideClickHandler = (e) => {
                const commandInput = document.getElementById('command-palette-input');
                if (!resultsContainer.contains(e.target) && e.target !== commandInput) {
                    this.hideCommandPaletteResults();
                }
            };
            document.addEventListener('click', this.commandPaletteOutsideClickHandler);
        }
    }
    
    /**
     * Hide command palette results
     */
    hideCommandPaletteResults() {
        const palette = document.getElementById('command-palette');
        if (palette) {
            palette.style.display = 'none';
        }
    }
    
    /**
     * Select formula from command palette
     */
    selectFormulaFromCommandPalette(formula) {
        this.hideCommandPaletteResults();
        const commandInput = document.getElementById('command-palette-input');
        if (commandInput) {
            commandInput.value = '';
        }
        this.formulaSelector.selectFormula(formula);
    }
    
    /**
     * Setup cache invalidation hooks for theme/locale/formula changes
     */
    setupCacheInvalidationHooks() {
        if (!this.formulaRenderer) return;
        
        // Note: onCacheInvalidation was removed from FormulaRenderer
        // Cache invalidation is now handled internally by FormulaRenderer
        // This method is kept for potential future hooks but does nothing for now
        
        // Listen for theme changes (if theme system exists)
        // Note: Cache invalidation methods were removed from FormulaRenderer
        // Cache is now managed internally by FormulaRenderer
        if (typeof window.addEventListener === 'function') {
            // Custom event for theme changes
            window.addEventListener('themechange', () => {
                // Cache invalidation handled internally by FormulaRenderer
                console.log('[UIModuleOrchestrator] Theme change detected');
            });
            
            // Custom event for locale changes
            window.addEventListener('localechange', () => {
                // Cache invalidation handled internally by FormulaRenderer
                console.log('[UIModuleOrchestrator] Locale change detected');
            });
            
            // Custom event for formula data reload
            window.addEventListener('formulasreload', () => {
                // Cache invalidation handled internally by FormulaRenderer
                console.log('[UIModuleOrchestrator] Formulas reload detected');
                // Re-render with new formulas
                if (this.options.formulas) {
                    this.renderInitialFormulas();
                }
            });
        }
    }
    
    /**
     * Render initial formula cards
     */
    renderInitialFormulas() {
        // Prevent duplicate renders
        if (this._isRenderingFormulas) {
            console.log('[UIModuleOrchestrator] ⏭️ Already rendering formulas, skipping');
            return;
        }
        
        const formulaList = document.getElementById('formula-list');
        
        if (!formulaList) {
            console.error('[UIModuleOrchestrator] ❌ formula-list element not found in DOM!');
            return;
        }
        
        if (!this.formulaRenderer) {
            console.error('[UIModuleOrchestrator] ❌ formulaRenderer not initialized!');
            return;
        }
        
        if (!this.options?.formulas || this.options.formulas.length === 0) {
            console.error('[UIModuleOrchestrator] ❌ No formulas available!');
            return;
        }
        
        this._isRenderingFormulas = true;
        formulaList.innerHTML = '';
        
        // Render without confidence/topic data (initial view) - optimized with chunked rendering
        this.formulaRenderer.renderFormulaCards(
            this.options.formulas,
            formulaList,
            {
                showConfidence: false,
                showTopicScope: false
            }
        );
        
        // Reset flag after a short delay to allow render to complete
        setTimeout(() => {
            this._isRenderingFormulas = false;
        }, 100);
        
        console.log(`[UIModuleOrchestrator] ✅ Rendering ${this.options.formulas.length} formulas (optimized)`);
    }
    /**
     * Search formulas
     */
    searchFormulas(query) {
        return this.searchEngine.search(query);
    }
    /**
     * Get current variable values from DOM
     */
    getCurrentVariableValues() {
        const formula = this.formulaSelector.getCurrentFormula();
        if (!formula) {
            return {};
        }

        // Vectorized: Use map + Object.fromEntries for better performance
        return Object.fromEntries(
            formula.variables.map(variable => {
                // Helper function to find input using multiple patterns
                const findInput = () => {
                    // Pattern 1: Simple ID (var-symbol) - used by fallback renderer
                    let input = document.getElementById(`var-${variable.symbol}`);
                    
                    // Pattern 2: With unit suffix (var-symbol-unit) - used by VariableInputsRenderer
                    // Check if simple input doesn't exist OR doesn't have a value
                    if ((!input || !input.value.trim()) && this.options.UnitConverter) {
                        const alternativeUnits = this.options.UnitConverter.getAlternativeUnits(variable.unit);
                        // Vectorized: Use find() instead of for loop
                        // First try to find input with a value, then any input
                        let unitInput = alternativeUnits
                            .map(unit => ({
                                unit,
                                input: document.getElementById(`var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`)
                            }))
                            .find(({ input: inp }) => inp !== null && inp.value.trim())?.input;
                        
                        // If no input with value found, get any input (for empty fields)
                        if (!unitInput) {
                            unitInput = alternativeUnits
                                .map(unit => document.getElementById(`var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`))
                                .find(inp => inp !== null);
                        }
                        
                        if (unitInput) input = unitInput;
                    }
                    
                    // Pattern 3: Use data attributes as fallback
                    if (!input) {
                        input = document.querySelector(`input[data-symbol="${variable.symbol}"]`);
                    }
                    
                    // Pattern 4: Try querySelector with name attribute
                    if (!input) {
                        input = document.querySelector(`input[name="var-${variable.symbol}"]`);
                    }
                    
                    // Pattern 5: Last resort - find in variables-container
                    if (!input) {
                        const container = document.getElementById('variables-container');
                        if (container) {
                            const inputs = Array.from(container.querySelectorAll(`input[data-symbol="${variable.symbol}"]`));
                            // Vectorized: Use find() instead of for loop
                            input = inputs.find(inp => inp.value.trim()) || inputs[0];
                        }
                    }
                    
                    return input;
                };

                const input = findInput();
                
                if (!input) {
                    console.warn(`[UIModuleOrchestrator] ❌ Could not find input for ${variable.symbol} after trying all patterns`);
                    return [variable.symbol, null];
                }

                const value = input.value.trim();
                
                // Return null if empty (empty means unknown, will show symbolic result)
                if (!value || this.isNAValue(value)) {
                    return [variable.symbol, null];
                }
                
                // Get the unit from the input if available
                const inputUnit = input.getAttribute('data-unit') || 
                                input.getAttribute('data-base-unit') || 
                                variable.unit;
                
                // Parse and convert (using the input's unit or variable's base unit)
                const parsedValue = this.calculationUtils.parseNumericValue(value, inputUnit);
                if (parsedValue === null) {
                    console.warn(`[UIModuleOrchestrator] Invalid value for ${variable.symbol}: "${value}"`);
                    return [variable.symbol, null];
                }
                
                // CRITICAL: Convert to base unit (e.g., °F → K for temperature)
                const baseUnit = variable.unit;
                let finalValue = parsedValue;
                if (this.options.UnitConverter && inputUnit && baseUnit && inputUnit !== baseUnit) {
                    try {
                        finalValue = this.options.UnitConverter.convertToBase(parsedValue, inputUnit, baseUnit);
                    } catch (e) {
                        console.warn(`[UIModuleOrchestrator] Unit conversion failed for ${variable.symbol}:`, e.message);
                    }
                }
                return [variable.symbol, finalValue];
            })
        );
    }
    
    /**
     * Check if a value represents N/A
     */
    isNAValue(value) {
        const naValues = ['n/a', 'na', 'null', '', 'undefined'];
        return naValues.includes(value.toLowerCase());
    }
    /**
     * Render calculator inputs for a formula
     * Uses VariableInputsRenderer if available, otherwise falls back to simple rendering
     */
    renderCalculatorInputs(formula) {
        // Clear calculation input cache when inputs are re-rendered
        if (this.calculationOrchestrator && typeof this.calculationOrchestrator.clearInputCache === 'function') {
            this.calculationOrchestrator.clearInputCache();
        }
        
        // Try to use the proper VariableInputsRenderer first
        if (window.variableInputsRenderer && typeof window.variableInputsRenderer.render === 'function') {
            try {
                window.variableInputsRenderer.render(formula);
                console.log('[UIModuleOrchestrator] ✅ Used VariableInputsRenderer for inputs');
                return;
            } catch (error) {
                console.warn('[UIModuleOrchestrator] VariableInputsRenderer failed, using fallback:', error);
            }
        }
        
        // Fallback: Use variables-container (correct container)
        const container = document.getElementById('variables-container');
        if (!container) {
            console.error('[UIModuleOrchestrator] ❌ variables-container not found!');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Create input grid
        const grid = document.createElement('div');
        grid.className = 'variable-input-grid';

        // Vectorized: Filter out constants using Set operations
        const constantSymbols = new Set([
            ...(formula.constants ? Object.keys(formula.constants) : []),
            ...(window.globalConstants ? Object.keys(window.globalConstants) : [])
        ]);
        
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));

        // Vectorized: Use map + DocumentFragment for batch DOM operations
        const fragment = document.createDocumentFragment();
        userVariables.map(variable => {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'variable-input-group';

            // Input field (create first to get ID for label)
            const inputId = `var-${variable.symbol}`;
            const input = document.createElement('input');
            input.type = 'number';
            input.id = inputId;
            input.className = 'variable-input';
            
            // Variable label with symbol and name (with correct for attribute)
            const label = document.createElement('label');
            label.className = 'variable-main-label';
            label.setAttribute('for', inputId);
            label.innerHTML = `
                <span class="symbol">${this.escapeHtml(variable.symbol)}</span>
                <span class="variable-name">${this.escapeHtml(variable.name || variable.symbol)}</span>
                <span class="solve-hint" data-symbol="${this.escapeHtml(variable.symbol)}">Leave empty to calculate this</span>
            `;
            input.placeholder = `Enter ${variable.name || variable.symbol} (${variable.unit || ''})`;
            input.setAttribute('data-symbol', variable.symbol);
            input.step = 'any';

            // Unit display
            const unitSpan = document.createElement('span');
            unitSpan.className = 'variable-unit';
            unitSpan.textContent = variable.unit || '';

            // Description
            const description = document.createElement('div');
            description.className = 'var-description';
            description.textContent = variable.description || '';

            // Assemble input group (vectorized: use array operations)
            [label, input, ...(unitSpan.textContent ? [unitSpan] : []), ...(description.textContent ? [description] : [])]
                .forEach(element => inputDiv.appendChild(element));
            
            fragment.appendChild(inputDiv);
            return inputDiv;
        });
        
        // Single DOM update for all inputs
        container.appendChild(fragment);

        console.log('[UIModuleOrchestrator] ✅ Rendered calculator inputs using fallback method');
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    /**
     * Display result
     */
    displayResult(result) {
        console.log('[UIModuleOrchestrator] 🎯 displayResult() called with:', result);
        console.log('[UIModuleOrchestrator] Result type:', typeof result);
        console.log('[UIModuleOrchestrator] Result.isSymbolic:', result?.isSymbolic);
        console.log('[UIModuleOrchestrator] Result.result:', result?.result);
        console.log('[UIModuleOrchestrator] window.resultDisplayRenderer:', typeof window.resultDisplayRenderer);
        
        if (typeof window.resultDisplayRenderer !== 'undefined') {
            const formula = this.formulaSelector.getCurrentFormula();
            console.log('[UIModuleOrchestrator] Using resultDisplayRenderer, formula:', formula?.name);
            window.resultDisplayRenderer.displayResult(result, formula);
            console.log('[UIModuleOrchestrator] ✅ resultDisplayRenderer.displayResult() called');
        }
        else {
            console.log('[UIModuleOrchestrator] Using fallback display');
            // Fallback display
            const resultDisplay = document.getElementById('result-display');
            console.log('[UIModuleOrchestrator] result-display element:', resultDisplay);
            if (resultDisplay) {
                // Show the result display element
                resultDisplay.classList.add('show');
                
                // Handle symbolic results
                if (result.isSymbolic || (typeof result.result === 'string' && !Number.isFinite(Number(result.result)))) {
                    console.log('[UIModuleOrchestrator] Displaying symbolic result in fallback');
                    const symbolicValue = result.result || result.value || 'No symbolic expression available';
                    const unit = result.unit || '';
                    
                    resultDisplay.innerHTML = `
                        <h3>Symbolic Result</h3>
                        <div class="result-value" style="font-family: 'Courier New', monospace; white-space: pre-wrap; text-align: left; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; margin: 15px 0;">
                            ${this.formattingUtils.escapeHtml(String(symbolicValue))}
                        </div>
                        ${unit ? `<div class="result-unit">${this.formattingUtils.escapeHtml(unit)}</div>` : ''}
                        ${result.unknownVariables && result.unknownVariables.length > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                                <div style="font-weight: 600; margin-bottom: 8px;">Remaining Variables:</div>
                                <div style="margin-bottom: 8px;">${result.unknownVariables.map(v => {
                                    const varInfo = this.formulaSelector?.getCurrentFormula()?.variables?.find(v2 => v2.symbol === v);
                                    return varInfo ? `${v} (${varInfo.name || v})` : v;
                                }).join(', ')}</div>
                                ${result.solveableInfo ? `<div style="font-size: 0.9em; opacity: 0.9; margin-top: 8px;">${this.formattingUtils.escapeHtml(result.solveableInfo)}</div>` : ''}
                            </div>
                        ` : ''}
                        ${result.solvedForms && Object.keys(result.solvedForms).length > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: rgba(102,126,234,0.15); border-radius: 8px; border: 1px solid rgba(102,126,234,0.3);">
                                <div style="font-weight: 600; margin-bottom: 10px;">Solve for each variable:</div>
                                ${Object.entries(result.solvedForms).map(([v, form]) => `
                                    <div style="margin-bottom: 8px; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.95em;">${this.formattingUtils.escapeHtml(form)}</div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${result.knownVariables && result.knownVariables.length > 0 && result.partialEvaluation ? `
                            <div style="margin-top: 15px; padding: 12px; background: rgba(0,255,0,0.1); border-radius: 8px;">
                                <div style="font-weight: 600; margin-bottom: 8px;">Known Values (in base units):</div>
                                <div>${result.knownValuesFormatted || result.knownVariables.map(v => {
                                    // Fallback: format with base unit if knownValuesFormatted not available
                                    const varInfo = this.formulaSelector?.getCurrentFormula()?.variables?.find(v2 => v2.symbol === v);
                                    if (varInfo && varInfo.unit) {
                                        // Try to get the actual value from the result if available
                                        // This is a fallback - ideally knownValuesFormatted should be set
                                        return `${v} = ? ${varInfo.unit}`;
                                    }
                                    return varInfo ? `${v} (${varInfo.name || v})` : v;
                                }).join(', ')}</div>
                            </div>
                        ` : ''}
                    `;
                    console.log('[UIModuleOrchestrator] ✅ Symbolic result displayed in fallback');
                } else {
                    // Numeric result - show both formula and numeric value
                    const resultValue = typeof result.result === 'number' ? result.result : parseFloat(result.result);
                    const solvedFor = result.solvedFor || result.variable;
                    const varInfo = this.formulaSelector?.getCurrentFormula()?.variables?.find(v => v.symbol === solvedFor);
                    const varName = varInfo ? (varInfo.name || solvedFor) : solvedFor;
                    const baseUnit = result.unit || (varInfo?.unit || '');
                    const formatted = this.formattingUtils.formatResult(resultValue, baseUnit);
                    const formulaExpr = result.formulaExpression || result.formula || '';
                    console.log('[UIModuleOrchestrator] Formatted result:', formatted);
                    console.log('[UIModuleOrchestrator] Formula expression:', formulaExpr);
                    
                    // Generate unit conversions for all alternative units
                    let unitConversionsHTML = '';
                    // Use cached unit conversions if available, otherwise generate them
                    if (result.unitConversions && Array.isArray(result.unitConversions) && result.unitConversions.length > 0) {
                        // Use cached unit conversions
                        const conversions = result.unitConversions.map(conv => ({
                            unit: conv.unit,
                            value: conv.value,
                            formatted: this.options.UnitConverter?.convertAndFormat(conv.value, baseUnit, conv.unit) || `${conv.value} ${conv.unit}`
                        }));
                        
                        unitConversionsHTML = `
                            <div style="margin-top: 20px; padding: 15px; background: rgba(0,255,255,0.1); border-radius: 8px;">
                                <div style="font-weight: 600; margin-bottom: 12px; opacity: 0.9;">Converted to other units:</div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                                    ${conversions.map(conv => `
                                        <div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                                            <div style="font-weight: 500; color: #00ffff;">${this.formattingUtils.escapeHtml(conv.formatted)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    } else if (this.options.UnitConverter && baseUnit && solvedFor !== 'result') {
                        // Generate unit conversions on the fly
                        try {
                            const alternativeUnits = this.options.UnitConverter.getAlternativeUnits(baseUnit);
                            const conversions = [];
                            
                            for (const altUnit of alternativeUnits) {
                                if (altUnit === baseUnit) continue; // Skip base unit (already shown)
                                try {
                                    const convertedValue = this.options.UnitConverter.convert(resultValue, baseUnit, altUnit);
                                    if (convertedValue !== null && Number.isFinite(convertedValue)) {
                                        const formattedValue = this.formattingUtils.formatResult(convertedValue, altUnit);
                                        conversions.push({ unit: altUnit, value: convertedValue, formatted: formattedValue });
                                    }
                                } catch (e) {
                                    console.warn(`[UIModuleOrchestrator] Failed to convert to ${altUnit}:`, e);
                                }
                            }
                            
                            if (conversions.length > 0) {
                                unitConversionsHTML = `
                                    <div style="margin-top: 20px; padding: 15px; background: rgba(0,255,255,0.1); border-radius: 8px;">
                                        <div style="font-weight: 600; margin-bottom: 12px; opacity: 0.9;">Converted to other units:</div>
                                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                                            ${conversions.map(conv => `
                                                <div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                                                    <div style="font-size: 1.1em; font-weight: 600;">${this.formattingUtils.escapeHtml(conv.formatted)}</div>
                                                    <div style="font-size: 0.85em; opacity: 0.8; margin-top: 4px;">${this.formattingUtils.escapeHtml(conv.unit)}</div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            }
                        } catch (e) {
                            console.warn('[UIModuleOrchestrator] Failed to generate unit conversions:', e);
                        }
                    }
                    
                    resultDisplay.innerHTML = `
                        <h3>Numeric Result</h3>
                        ${formulaExpr ? `
                            <div class="result-formula" style="font-family: 'Courier New', monospace; white-space: pre-wrap; text-align: left; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; margin: 15px 0; font-size: 1.1em;">
                                <div style="font-weight: 600; margin-bottom: 8px; opacity: 0.9;">Formula with substituted values:</div>
                                <div>${this.formattingUtils.escapeHtml(formulaExpr)}</div>
                            </div>
                        ` : ''}
                        <div class="result-value" style="font-size: 1.5em; font-weight: 600; padding: 15px; background: rgba(0,255,0,0.1); border-radius: 8px; margin: 15px 0;">
                            ${solvedFor !== 'result' ? `<div style="font-size: 0.8em; opacity: 0.9; margin-bottom: 5px;">${this.formattingUtils.escapeHtml(varName)} =</div>` : ''}
                            <div>${this.formattingUtils.escapeHtml(formatted)}</div>
                        </div>
                        ${result.unit ? `<div class="result-unit" style="opacity: 0.8; margin-top: 8px;">${this.formattingUtils.escapeHtml(result.unit)}</div>` : ''}
                        ${unitConversionsHTML}
                    `;
                    console.log('[UIModuleOrchestrator] ✅ Numeric result displayed in fallback');
                }
            } else {
                console.error('[UIModuleOrchestrator] ❌ result-display element not found!');
            }
        }
    }
    /**
     * Display error
     */
    displayError(message) {
        const formatted = this.formattingUtils.formatErrorMessage({ message });
        const resultDisplay = document.getElementById('result-display');
        if (resultDisplay) {
            resultDisplay.innerHTML = `<div class="error-message">${this.formattingUtils.escapeHtml(formatted)}</div>`;
        }
    }
    /**
     * Handle back button
     */
    handleBackButton() {
        const inputScreen = document.getElementById('input-screen');
        const formulaSelection = document.getElementById('formula-selection');
        if (inputScreen) {
            inputScreen.classList.remove('active');
            inputScreen.style.setProperty('display', 'none', 'important');
        }
        if (formulaSelection) {
            formulaSelection.classList.add('active');
            formulaSelection.style.setProperty('display', 'block', 'important');
        }
    }
    /**
     * Update formulas list (for dynamic updates)
     */
    updateFormulas(formulas) {
        this.options.formulas = formulas;
        this.searchEngine.updateFormulas(formulas);
    }
    /**
     * Get module instances (for testing/debugging)
     */
    getModules() {
        return {
            searchEngine: this.searchEngine,
            calculationOrchestrator: this.calculationOrchestrator,
            tabManager: this.tabManager,
            graphCoordinator: this.graphCoordinator,
            formulaSelector: this.formulaSelector,
            eventCoordinator: this.eventCoordinator
        };
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        this.eventCoordinator.cleanup();
        this.graphCoordinator.cleanup();
        this.initialized = false;
    }

    /**
     * Minimal authoritative UI path for ExpertSystem
     * Question -> Selected Formula -> Confidence -> Why/Reject
     */
    wireExpertQuestionUI() {
        const input = document.getElementById('expert-question-input');
        const button = document.getElementById('expert-question-submit');
        const output = document.getElementById('expert-question-output');
        if (!input || !button || !output || !this.expertSystem) return;

        const renderResult = (res) => {
            if (!res) return;
            if (res.success) {
                output.innerHTML = `
                    <div class="expert-result">
                        <div><strong>Formula:</strong> ${this.escapeHtml(res.formula.id)} — ${this.escapeHtml(res.formula.name)}</div>
                        <div><strong>Confidence:</strong> ${res.confidence}%</div>
                        <div><strong>Why:</strong> ${this.escapeHtml(res.explanation || '')}</div>
                    </div>
                `;
            } else {
                output.innerHTML = `
                    <div class="expert-result error">
                        <div><strong>Rejected:</strong> ${this.escapeHtml(res.error || 'Unknown error')}</div>
                        ${res.hasCalculus ? '<div>Reason: Calculus detected</div>' : ''}
                        ${res.suggestions ? `<div>Suggestions: ${res.suggestions.map(s => this.escapeHtml(s)).join('; ')}</div>` : ''}
                    </div>
                `;
            }
        };

        const handle = () => {
            const q = input.value.trim();
            if (!q) {
                renderResult({ success: false, error: 'Please enter a question.' });
                return;
            }
            const res = this.expertSystem.solveQuestion(q);
            renderResult(res);
        };

        button.addEventListener('click', handle);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handle();
            }
        });
    }
}

