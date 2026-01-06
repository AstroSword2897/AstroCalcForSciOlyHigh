/**
 * UIModuleOrchestrator - IMPROVED VERSION
 * Better dependency injection, error handling, and initialization
 */
import { SearchEngine } from './modules/search/SearchEngine.js';
import { CalculationOrchestrator } from './modules/calculation/CalculationOrchestrator.js';
import { TabManager } from './modules/tabs/TabManager.js';
import { GraphCoordinator } from './modules/graph/GraphCoordinator.js';
import { FormulaSelector } from './modules/formula/FormulaSelector.js';
import { EventCoordinator } from './modules/events/EventCoordinator.js';
import { CalculationUtils } from './modules/utils/CalculationUtils.js';
import { FormattingUtils } from './modules/utils/FormattingUtils.js';
import { FormulaRenderer } from './modules/rendering/FormulaRenderer.js';
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
                version: 'v2.1.0' // For cache key invalidation
            });
            // Initialize Expert System (question -> formula)
            this.expertSystem = new AstrophysicsExpertSystem(
                this.options.formulas,
                this.searchEngine
            );
            // Expose globally for easy access
            window.expertSystem = this.expertSystem;
            window.solveQuestion = (q) => this.expertSystem.solveQuestion(q);

            // Initialize GraphCoordinator
            this.graphCoordinator = new GraphCoordinator({
                enabled: true,
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
                onTabSwitch: (tabName) => {
                    if (tabName === 'graph') {
                        const formula = this.formulaSelector?.getCurrentFormula();
                        if (formula) {
                            this.graphCoordinator.forceUpdateOnTabActivation(formula, () => this.getCurrentVariableValues());
                        }
                    }
                },
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
                onGraphTabActivated: () => {
                    const formula = this.formulaSelector?.getCurrentFormula();
                    if (formula) {
                        const values = this.getCurrentVariableValues();
                        this.graphCoordinator.updateGraphIfEnabled(formula, values);
                    }
                }
            });
            // Initialize CalculationOrchestrator
            this.calculationOrchestrator = new CalculationOrchestrator({
                getCalculator: () => this.formulaSelector?.getCurrentCalculator() || null,
                getFormula: () => this.formulaSelector?.getCurrentFormula() || null,
                getGraphManager: () => this.graphCoordinator.ensureGraphManager(),
                parseNumericValue: (input, unit) => this.calculationUtils.parseNumericValue(input, unit),
                displayResult: (result) => this.displayResult(result),
                displayError: (message) => this.displayError(message),
                updateGraphIfEnabled: (formula, values, options) => {
                    this.graphCoordinator.updateGraphIfEnabled(formula, values, options);
                },
                updateGraphInterpretation: (formula, values) => {
                    // Handle graph interpretation if needed
                    if (typeof window.updateGraphInterpretation === 'function') {
                        window.updateGraphInterpretation(formula, values);
                    }
                },
                updateSolveIndicators: () => {
                    if (typeof window.updateSolveIndicators === 'function') {
                        window.updateSolveIndicators();
                    }
                },
                unitConverter: this.options.UnitConverter,
                globalConstants: this.options.globalConstants,
                graphUpdatesEnabled: true
            });
            // Initialize FormulaSelector
            this.formulaSelector = new FormulaSelector({
                createCalculator: (formula) => {
                    if (this.options.FormulaCalculatorClass) {
                        return new this.options.FormulaCalculatorClass(formula);
                    }
                    return null;
                },
                getGraphCoordinator: () => this.graphCoordinator,
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
                updateGraphIfEnabled: (formula, values) => {
                    this.graphCoordinator.updateGraphIfEnabled(formula, values);
                },
                updateGraphInterpretation: (formula, values) => {
                    if (typeof window.updateGraphInterpretation === 'function') {
                        window.updateGraphInterpretation(formula, values);
                    }
                },
                getCurrentVariableValues: () => this.getCurrentVariableValues(),
                graphUpdatesEnabled: true,
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
            this.eventCoordinator = new EventCoordinator({
                onBackButton: () => this.handleBackButton(),
                onMainTabSwitch: (tabName) => this.tabManager.switchMainTab(tabName),
                onSubTabSwitch: (tabName) => this.tabManager.switchTab(tabName),
                onCalculate: () => this.calculationOrchestrator.performCalculation(),
                onFormulaCardClick: (formulaId) => {
                    const formula = this.options.formulas.find(f => f.id === formulaId);
                    if (formula) {
                        this.formulaSelector.selectFormula(formula);
                    }
                },
                onClassify: () => {
                    if (typeof window.performClassification === 'function') {
                        window.performClassification();
                    }
                },
                onMainClassify: () => {
                    if (typeof window.performMainClassification === 'function') {
                        window.performMainClassification();
                    }
                },
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
        }
        catch (error) {
            console.error('[UIModuleOrchestrator] Error initializing modules:', error);
            throw error;
        }
    }
    wireModules() {
        // Expose to window for backward compatibility
        if (typeof window !== 'undefined') {
            window.uiOrchestrator = this;
            window.selectFormula = (formula) => this.formulaSelector.selectFormula(formula);
            window.performCalculation = () => this.calculationOrchestrator.performCalculation();
            window.switchTab = (tabName) => this.tabManager.switchTab(tabName);
            window.switchMainTab = (tabName) => this.tabManager.switchMainTab(tabName);
            window.searchEngine = this.searchEngine;
            window.graphCoordinator = this.graphCoordinator;
            window.renderFormulaList = () => this.renderInitialFormulas();
        }
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
        
        if (isQuestion && this.expertSystem) {
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
                
                // Also update command palette with single result
                this.renderCommandPaletteResults([expertResultItem]);
                
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
        
        // Update command palette
        this.renderCommandPaletteResults(results);
        
        // Update main formula list (limited to 50 for performance)
        const formulaList = document.getElementById('formula-list');
        if (formulaList && this.formulaRenderer) {
            const maxScore = results.length > 0 ? results[0].score : 1;
            
            // Pass full search results (with confidence/topic data) to renderer
            this.formulaRenderer.renderFormulaCards(
                results.slice(0, 50), // Limit to 50 for performance
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
        
        results.slice(0, 10).forEach(result => {
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
            
            resultsContainer.appendChild(item);
        });
        
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
        
        // Hook for theme changes
        this.formulaRenderer.onCacheInvalidation((reason, previousSize) => {
            console.log(`[UIModuleOrchestrator] Cache invalidated: ${reason} (${previousSize} items cleared)`);
        });
        
        // Listen for theme changes (if theme system exists)
        if (typeof window.addEventListener === 'function') {
            // Custom event for theme changes
            window.addEventListener('themechange', () => {
                this.formulaRenderer?.invalidateCache('theme-change');
            });
            
            // Custom event for locale changes
            window.addEventListener('localechange', () => {
                this.formulaRenderer?.invalidateCache('locale-change');
            });
            
            // Custom event for formula data reload
            window.addEventListener('formulasreload', () => {
                this.formulaRenderer?.invalidateCache('formulas-reload');
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
        const formulaList = document.getElementById('formula-list');
        if (formulaList && this.formulaRenderer) {
            formulaList.innerHTML = '';
            // Render without confidence/topic data (initial view)
            this.formulaRenderer.renderFormulaCards(
                this.options.formulas,
                formulaList,
                {
                    showConfidence: false,
                    showTopicScope: false
                }
            );
            console.log('[UIModuleOrchestrator] ✅ Initial formulas rendered');
        }
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
        const values = {};
        const formula = this.formulaSelector.getCurrentFormula();
        if (!formula) {
            return values;
        }

        formula.variables.forEach(variable => {
            // Get the input directly by ID (matching renderCalculatorInputs)
            const inputId = `var-${variable.symbol}`;
            const input = document.getElementById(inputId);
            
            if (!input) {
                console.warn(`[UIModuleOrchestrator] Input not found: ${inputId}`);
                values[variable.symbol] = null;
                return;
            }

            const value = input.value.trim();
            
            // Check for N/A checkbox
            const naCheckbox = document.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
            const isNA = naCheckbox?.checked || false;
            
            // Return null if N/A or empty
            if (!value || this.isNAValue(value) || isNA) {
                values[variable.symbol] = null;
                return;
            }
            
            // Parse and convert (using base unit)
            const parsedValue = this.calculationUtils.parseNumericValue(value, variable.unit);
            if (parsedValue === null) {
                console.warn(`[UIModuleOrchestrator] Invalid value for ${variable.symbol}: "${value}"`);
                values[variable.symbol] = null;
                return;
            }
            
            values[variable.symbol] = parsedValue;
        });

        return values;
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

        // Filter out constants
        const constantSymbols = new Set();
        if (formula.constants) {
            Object.keys(formula.constants).forEach(key => constantSymbols.add(key));
        }
        if (window.globalConstants) {
            Object.keys(window.globalConstants).forEach(key => constantSymbols.add(key));
        }
        
        const userVariables = formula.variables.filter(v => !constantSymbols.has(v.symbol));

        // Render each variable
        userVariables.forEach(variable => {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'variable-input-group';

            // Variable label with symbol and name
            const label = document.createElement('label');
            label.className = 'variable-main-label';
            label.innerHTML = `
                <span class="symbol">${this.escapeHtml(variable.symbol)}</span>
                <span class="variable-name">${this.escapeHtml(variable.name || variable.symbol)}</span>
                <span class="solve-hint" data-symbol="${this.escapeHtml(variable.symbol)}">Leave empty to calculate this</span>
            `;

            // Input field
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `var-${variable.symbol}`;
            input.className = 'variable-input';
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

            // N/A checkbox for solving
            const naContainer = document.createElement('div');
            naContainer.className = 'na-option';

            const naLabel = document.createElement('label');
            naLabel.className = 'na-checkbox-label';
            naLabel.setAttribute('for', `na-${variable.symbol}`);

            const naCheckbox = document.createElement('input');
            naCheckbox.type = 'checkbox';
            naCheckbox.className = 'na-checkbox';
            naCheckbox.id = `na-${variable.symbol}`;
            naCheckbox.setAttribute('data-symbol', variable.symbol);
            naCheckbox.setAttribute('aria-label', `Mark ${variable.symbol} as unknown`);

            const naText = document.createElement('span');
            naText.textContent = 'N/A (solve for this)';

            naLabel.appendChild(naCheckbox);
            naLabel.appendChild(naText);
            naContainer.appendChild(naLabel);

            // Assemble input group
            inputDiv.appendChild(label);
            inputDiv.appendChild(input);
            if (unitSpan.textContent) {
                inputDiv.appendChild(unitSpan);
            }
            if (description.textContent) {
                inputDiv.appendChild(description);
            }
            inputDiv.appendChild(naContainer);
            
            container.appendChild(inputDiv);
        });

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
        if (typeof window.resultDisplayRenderer !== 'undefined') {
            const formula = this.formulaSelector.getCurrentFormula();
            window.resultDisplayRenderer.displayResult(result, formula);
        }
        else {
            // Fallback display
            const resultDisplay = document.getElementById('result-display');
            if (resultDisplay) {
                const formatted = this.formattingUtils.formatResult(typeof result.result === 'number' ? result.result : result.result, result.unit || '');
                resultDisplay.innerHTML = `<div class="result">${this.formattingUtils.escapeHtml(formatted)}</div>`;
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
