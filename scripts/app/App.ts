/**
 * App - The Real Orchestrator
 * Proper dependency injection, no globals, ES modules
 */

import { SearchEngine } from '../ui/modules/search/SearchEngine';
import { CalculationOrchestrator } from '../ui/modules/calculation/CalculationOrchestrator';
import { TabManager } from '../ui/modules/tabs/TabManager';
import { GraphCoordinator } from '../ui/modules/graph/GraphCoordinator';
import { FormulaSelector } from '../ui/modules/formula/FormulaSelector';
import { EventCoordinator } from '../ui/modules/events/EventCoordinator';
import { CalculationUtils } from '../ui/modules/utils/CalculationUtils';
import { FormattingUtils } from '../ui/modules/utils/FormattingUtils';
import { Formula } from '../types/formula';
// UnitConverter will be converted next
declare const UnitConverter: any;

// Type for FormulaCalculator (will be properly typed when migrated)
type FormulaCalculatorType = any;

export interface AppDependencies {
    formulas: Formula[];
    formulaCategories: Record<string, string[]>;
    calculator: FormulaCalculatorType;
    unitConverter: any;
    expressionParser?: any;
    safeMathEvaluator?: any;
    enhancedOfflineGraphManagerV2?: any;
    stellarClassifier?: any;
    semanticSearchSystem?: any;
    performanceOptimizer?: any;
    searchCache?: any;
    globalConstants?: Record<string, number>;
}

export class App {
    private state: Map<string, any> = new Map();
    private searchEngine!: SearchEngine; // Initialized in initializeModules()
    private calculationOrchestrator!: CalculationOrchestrator; // Initialized in initializeModules()
    private tabManager!: TabManager; // Initialized in initializeModules()
    private graphCoordinator!: GraphCoordinator; // Initialized in initializeModules()
    private formulaSelector!: FormulaSelector; // Initialized in initializeModules()
    private eventCoordinator!: EventCoordinator; // Initialized in initializeModules()
    private calculationUtils!: CalculationUtils; // Initialized in constructor
    private formattingUtils!: FormattingUtils; // Initialized in constructor
    private dependencies: AppDependencies;

    constructor(dependencies: AppDependencies) {
        // Validate required dependencies
        if (!dependencies.formulas || !Array.isArray(dependencies.formulas) || dependencies.formulas.length === 0) {
            throw new Error('App: formulas array is required and must not be empty');
        }
        if (!dependencies.calculator) {
            throw new Error('App: calculator instance is required');
        }
        if (!dependencies.unitConverter) {
            throw new Error('App: unitConverter instance is required');
        }

        this.dependencies = dependencies;
        this.formattingUtils = new FormattingUtils();
        this.calculationUtils = new CalculationUtils(
            dependencies.expressionParser,
            dependencies.safeMathEvaluator
        );

        this.initializeModules();
    }

    private initializeModules(): void {
        // Initialize SearchEngine
        this.searchEngine = new SearchEngine({
            formulas: this.dependencies.formulas,
            formulaCategories: this.dependencies.formulaCategories,
            cache: this.dependencies.searchCache,
            performanceOptimizer: this.dependencies.performanceOptimizer,
            semanticSearchSystem: this.dependencies.semanticSearchSystem
        });

        // Initialize GraphCoordinator
        this.graphCoordinator = new GraphCoordinator({
            enabled: true,
            containerId: 'desmos-graph',
            tabId: 'graph-tab',
            createGraphManager: () => {
                if (this.dependencies.enhancedOfflineGraphManagerV2) {
                    const manager = new this.dependencies.enhancedOfflineGraphManagerV2({
                        containerId: 'desmos-graph',
                        tabId: 'graph-tab'
                    });
                    this.state.set('graphManager', manager);
                    return manager;
                }
                return null;
            },
            getGraphManager: () => this.state.get('graphManager') || null,
            onGraphError: (error, _formula) => {
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
                // Will be injected
            },
            initStellarClassifier: () => {
                if (this.dependencies.stellarClassifier) {
                    return new this.dependencies.stellarClassifier();
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
            updateGraphInterpretation: (_formula, _values) => {
                // Will be injected
            },
            updateSolveIndicators: () => {
                // Will be injected
            },
            unitConverter: this.dependencies.unitConverter,
            globalConstants: this.dependencies.globalConstants,
            graphUpdatesEnabled: true
        });

        // Initialize FormulaSelector
        this.formulaSelector = new FormulaSelector({
            createCalculator: (formula) => {
                // Use the provided calculator instance, but create a new one for each formula
                const calculator = new (this.dependencies.calculator.constructor as any)(formula);
                this.state.set('calculator', calculator);
                this.state.set('currentFormula', formula);
                return calculator;
            },
            getGraphCoordinator: () => this.graphCoordinator,
            renderVariableInputs: (_formula) => {
                // Will be injected
            },
            renderFormulaPresets: (_formula) => {
                // Will be injected
            },
            switchTab: (tabName) => this.tabManager.switchTab(tabName as any),
            performCalculation: () => this.calculationOrchestrator.performCalculation(),
            updateSolveIndicators: () => {
                // Will be injected
            },
            updateGraphIfEnabled: (formula, values) => {
                this.graphCoordinator.updateGraphIfEnabled(formula, values);
            },
            updateGraphInterpretation: (_formula, _values) => {
                // Will be injected
            },
            getCurrentVariableValues: () => this.getCurrentVariableValues(),
            graphUpdatesEnabled: true,
            cleanupGlobalState: () => {
                this.state.delete('calculator');
                this.state.delete('currentFormula');
            },
            trackUsage: (term) => {
                if (this.dependencies.semanticSearchSystem?.trackUsage) {
                    this.dependencies.semanticSearchSystem.trackUsage(term);
                }
            },
            displayRelatedFormulas: (_formula) => {
                // Will be injected
            }
        });

        // Initialize EventCoordinator
        this.eventCoordinator = new EventCoordinator({
            onBackButton: () => this.handleBackButton(),
            onMainTabSwitch: (tabName) => this.tabManager.switchMainTab(tabName as any),
            onSubTabSwitch: (tabName) => this.tabManager.switchTab(tabName as any),
            onCalculate: () => this.calculationOrchestrator.performCalculation(),
            onFormulaCardClick: (formulaId) => {
                const formula = this.dependencies.formulas.find(f => f.id === formulaId);
                if (formula) {
                    this.formulaSelector.selectFormula(formula);
                }
            },
            onClassify: () => {
                // Will be injected
            },
            onMainClassify: () => {
                // Will be injected
            },
            setupGraphControls: () => {
                // Will be injected
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
        const formulaList = document.getElementById('formula-list');
        if (formulaList && typeof (window as any).renderFormulaCards === 'function') {
            (window as any).renderFormulaCards(this.dependencies.formulas, formulaList);
        }
    }

    /**
     * Setup search functionality
     */
    private setupSearch(): void {
        const searchInput = document.getElementById('command-palette-input');
        
        if (!searchInput) {
            console.warn('[App] Command palette input not found');
            return;
        }

        let debounceTimer: number | null = null;
        const DEBOUNCE_MS = 50;

        searchInput.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const searchTerm = target.value.trim();
            
            if (searchTerm.length === 0) {
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

        // Handle Escape key to clear search
        searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
            (searchInput as HTMLInputElement).value = '';
            this.renderFormulaList();
            }
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
            const alternativeUnits = this.dependencies.unitConverter.getAlternativeUnits(baseUnit);

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
                        values[variable.symbol] = this.dependencies.unitConverter.convertToBase(parsed, foundUnit, baseUnit);
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

