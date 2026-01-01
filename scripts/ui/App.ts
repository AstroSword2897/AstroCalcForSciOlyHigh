/**
 * App - The Real Orchestrator
 * Wires all modules together with proper dependency injection
 */

import { SearchEngine } from './modules/search/SearchEngine';
import { CalculationOrchestrator } from './modules/calculation/CalculationOrchestrator';
import { TabManager } from './modules/tabs/TabManager';
import { GraphCoordinator } from './modules/graph/GraphCoordinator';
import { FormulaSelector } from './modules/formula/FormulaSelector';
import { EventCoordinator } from './modules/events/EventCoordinator';
import { CalculationUtils } from './modules/utils/CalculationUtils';
import { FormattingUtils } from './modules/utils/FormattingUtils';
import { Formula } from '../types/formula';

export interface AppOptions {
    formulas: Formula[];
    formulaCategories: Record<string, string[]>;
    FormulaCalculatorClass: any;
    UnitConverter: any;
    ExpressionParser?: any;
    SafeMathEvaluator?: any;
    EnhancedOfflineGraphManagerV2?: any;
    StellarClassifier?: any;
    semanticSearchSystem?: any;
    performanceOptimizer?: any;
    searchCache?: any;
    globalConstants?: Record<string, number>;
}

export class App {
    private state: Map<string, any> = new Map();
    private searchEngine!: SearchEngine;
    private calculationOrchestrator!: CalculationOrchestrator;
    private tabManager!: TabManager;
    private graphCoordinator!: GraphCoordinator;
    private formulaSelector!: FormulaSelector;
    private eventCoordinator!: EventCoordinator;
    private calculationUtils: CalculationUtils;
    private formattingUtils: FormattingUtils;
    private options: AppOptions;

    constructor(options: AppOptions) {
        // Validate required options
        if (!options.formulas || !Array.isArray(options.formulas) || options.formulas.length === 0) {
            throw new Error('App: formulas array is required and must not be empty');
        }
        if (!options.FormulaCalculatorClass) {
            throw new Error('App: FormulaCalculatorClass is required');
        }
        if (!options.UnitConverter) {
            throw new Error('App: UnitConverter is required');
        }

        this.options = options;
        this.formattingUtils = new FormattingUtils();
        this.calculationUtils = new CalculationUtils(
            options.ExpressionParser,
            options.SafeMathEvaluator
        );

        this.initializeModules();
    }

    private initializeModules(): void {
        // Initialize SearchEngine
        this.searchEngine = new SearchEngine({
            formulas: this.options.formulas,
            formulaCategories: this.options.formulaCategories,
            cache: this.options.searchCache,
            performanceOptimizer: this.options.performanceOptimizer,
            semanticSearchSystem: this.options.semanticSearchSystem
        });

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
                    this.state.set('graphManager', manager);
                    return manager;
                }
                return null;
            },
            getGraphManager: () => this.state.get('graphManager') || null,
            onGraphError: (error, formula) => {
                console.error('[App] Graph error:', error);
            }
        });

        // Initialize TabManager
        this.tabManager = new TabManager({
            onMainTabSwitch: (tabName) => {
                console.log('[App] Main tab switched:', tabName);
            },
            onTabSwitch: (tabName) => {
                if (tabName === 'graph') {
                    const formula = this.formulaSelector?.getCurrentFormula();
                    if (formula) {
                        this.graphCoordinator.forceUpdateOnTabActivation(
                            formula,
                            () => this.getCurrentVariableValues()
                        );
                    }
                }
            },
            initFormulaExplorer: () => {
                if (typeof (window as any).initFormulaExplorer === 'function') {
                    (window as any).initFormulaExplorer();
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
            getCalculator: () => this.state.get('calculator') || null,
            getFormula: () => this.state.get('currentFormula') || null,
            getGraphManager: () => this.graphCoordinator.ensureGraphManager(),
            parseNumericValue: (input, unit) => this.calculationUtils.parseNumericValue(input, unit),
            displayResult: (result) => this.displayResult(result),
            displayError: (message) => this.displayError(message),
            updateGraphIfEnabled: (formula, values, options) => {
                this.graphCoordinator.updateGraphIfEnabled(formula, values, options);
            },
            updateGraphInterpretation: (formula, values) => {
                if (typeof (window as any).updateGraphInterpretation === 'function') {
                    (window as any).updateGraphInterpretation(formula, values);
                }
            },
            updateSolveIndicators: () => {
                if (typeof (window as any).updateSolveIndicators === 'function') {
                    (window as any).updateSolveIndicators();
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
                    const calculator = new this.options.FormulaCalculatorClass(formula);
                    this.state.set('calculator', calculator);
                    this.state.set('currentFormula', formula);
                    return calculator;
                }
                return null;
            },
            getGraphCoordinator: () => this.graphCoordinator,
            renderVariableInputs: (formula) => {
                if (typeof (window as any).renderVariableInputs === 'function') {
                    (window as any).renderVariableInputs(formula);
                }
            },
            renderFormulaPresets: (formula) => {
                if (typeof (window as any).renderFormulaPresets === 'function') {
                    (window as any).renderFormulaPresets(formula);
                }
            },
            switchTab: (tabName) => this.tabManager.switchTab(tabName as any),
            performCalculation: () => this.calculationOrchestrator.performCalculation(),
            updateSolveIndicators: () => {
                if (typeof (window as any).updateSolveIndicators === 'function') {
                    (window as any).updateSolveIndicators();
                }
            },
            updateGraphIfEnabled: (formula, values) => {
                this.graphCoordinator.updateGraphIfEnabled(formula, values);
            },
            updateGraphInterpretation: (formula, values) => {
                if (typeof (window as any).updateGraphInterpretation === 'function') {
                    (window as any).updateGraphInterpretation(formula, values);
                }
            },
            getCurrentVariableValues: () => this.getCurrentVariableValues(),
            graphUpdatesEnabled: true,
            cleanupGlobalState: () => {
                this.state.delete('calculator');
                this.state.delete('currentFormula');
            },
            trackUsage: (term) => {
                if (this.options.semanticSearchSystem?.trackUsage) {
                    this.options.semanticSearchSystem.trackUsage(term);
                }
            },
            displayRelatedFormulas: (formula) => {
                if (typeof (window as any).displayRelatedFormulas === 'function') {
                    (window as any).displayRelatedFormulas(formula);
                }
            }
        });

        // Initialize EventCoordinator
        this.eventCoordinator = new EventCoordinator({
            onBackButton: () => this.handleBackButton(),
            onMainTabSwitch: (tabName) => this.tabManager.switchMainTab(tabName as any),
            onSubTabSwitch: (tabName) => this.tabManager.switchTab(tabName as any),
            onCalculate: () => this.calculationOrchestrator.performCalculation(),
            onFormulaCardClick: (formulaId) => {
                const formula = this.options.formulas.find(f => f.id === formulaId);
                if (formula) {
                    this.formulaSelector.selectFormula(formula);
                }
            },
            onClassify: () => {
                if (typeof (window as any).performClassification === 'function') {
                    (window as any).performClassification();
                }
            },
            onMainClassify: () => {
                if (typeof (window as any).performMainClassification === 'function') {
                    (window as any).performMainClassification();
                }
            },
            setupGraphControls: () => {
                if (typeof (window as any).setupGraphControls === 'function') {
                    (window as any).setupGraphControls();
                }
            }
        });
    }

    /**
     * Start the application
     */
    start(): void {
        this.eventCoordinator.setupAll();
        this.renderFormulaList();
        this.setupSearch();
        console.log('[App] ✅ Started');
    }

    /**
     * Render formula list
     */
    private renderFormulaList(): void {
        if (typeof (window as any).renderFormulaCards === 'function') {
            (window as any).renderFormulaCards(this.options.formulas, document.getElementById('formula-list'));
        }
    }

    /**
     * Setup search functionality
     */
    private setupSearch(): void {
        const searchInput = document.getElementById('formula-search');
        const clearBtn = document.getElementById('clear-search');
        
        if (!searchInput || !clearBtn) {
            console.warn('[App] Search elements not found');
            return;
        }

        let debounceTimer: number | null = null;
        const DEBOUNCE_MS = 50;

        searchInput.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const searchTerm = target.value.trim();
            
            if (searchTerm.length > 0) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
                this.renderFormulaList();
                return;
            }

            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = window.setTimeout(() => {
                const results = this.searchEngine.search(searchTerm);
                if (typeof (window as any).searchResultsRenderer !== 'undefined') {
                    (window as any).searchResultsRenderer.renderFilteredFormulas(
                        results,
                        searchTerm,
                        results.length > 0 ? results[0].score : 1
                    );
                }
            }, DEBOUNCE_MS);
        });

        clearBtn.addEventListener('click', () => {
            (searchInput as HTMLInputElement).value = '';
            clearBtn.style.display = 'none';
            this.renderFormulaList();
            searchInput.focus();
        });
    }

    /**
     * Get current variable values from DOM
     */
    private getCurrentVariableValues(): Record<string, number | null> {
        const values: Record<string, number | null> = {};
        const formula = this.state.get('currentFormula') as Formula | null;
        
        if (!formula) return values;

        formula.variables.forEach(variable => {
            const baseUnit = variable.unit;
            const alternativeUnits = this.options.UnitConverter.getAlternativeUnits(baseUnit);

            let foundValue: string | null = null;
            let foundUnit: string | null = null;

            for (let i = 0; i < alternativeUnits.length; i++) {
                const unit = alternativeUnits[i];
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                let input = document.getElementById(inputId) as HTMLInputElement | null;

                if (!input) {
                    input = document.querySelector(`input[data-symbol="${variable.symbol}"][data-unit-index="${i}"]`) as HTMLInputElement | null;
                }

                if (input) {
                    const value = input.value.trim();
                    if (value && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'n/a') {
                        foundValue = value;
                        foundUnit = unit;
                        break;
                    }
                }
            }

            if (foundValue && foundUnit) {
                const parsed = this.calculationUtils.parseNumericValue(foundValue, foundUnit);
                if (parsed !== null) {
                    try {
                        values[variable.symbol] = this.options.UnitConverter.convertToBase(parsed, foundUnit, baseUnit);
                    } catch (e) {
                        values[variable.symbol] = null;
                    }
                } else {
                    values[variable.symbol] = null;
                }
            } else {
                values[variable.symbol] = null;
            }
        });

        return values;
    }

    /**
     * Display result
     */
    private displayResult(result: any): void {
        if (typeof (window as any).resultDisplayRenderer !== 'undefined') {
            const formula = this.state.get('currentFormula') as Formula | null;
            (window as any).resultDisplayRenderer.displayResult(result, formula);
        } else {
            // Fallback display
            const resultDisplay = document.getElementById('result-display');
            if (resultDisplay) {
                const formatted = typeof result.result === 'number' 
                    ? result.result.toPrecision(4) 
                    : String(result.result);
                resultDisplay.innerHTML = `<div class="result">${this.formattingUtils.escapeHtml(formatted)} ${result.unit || ''}</div>`;
            }
        }
    }

    /**
     * Display error
     */
    private displayError(message: string): void {
        const resultDisplay = document.getElementById('result-display');
        if (resultDisplay) {
            resultDisplay.innerHTML = `<div class="error-message">${this.formattingUtils.escapeHtml(message)}</div>`;
        }
    }

    /**
     * Handle back button
     */
    private handleBackButton(): void {
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

        this.state.delete('calculator');
        this.state.delete('currentFormula');
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        this.eventCoordinator.cleanup();
        this.graphCoordinator.cleanup();
        this.state.clear();
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
}

