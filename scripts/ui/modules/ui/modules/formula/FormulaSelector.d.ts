/**
 * FormulaSelector - Handles formula selection, calculator initialization, and UI updates
 * Improved: Better error handling, state management, lifecycle management
 */
import { Formula } from '../../../types/formula';
export interface Calculator {
    solve(variableValues: Record<string, number | null>): any;
    solveSymbolically(variables: string[], values: Record<string, number | null>, unknowns: string[]): any;
}
export interface FormulaSelectorOptions {
    createCalculator: (formula: Formula) => Calculator | null;
    getGraphCoordinator: () => any;
    renderVariableInputs: (formula: Formula) => void;
    renderFormulaPresets: (formula: Formula) => void;
    switchTab: (tabName: string) => void;
    performCalculation?: () => void;
    updateSolveIndicators?: () => void;
    updateGraphIfEnabled?: (formula: Formula, values: Record<string, number | null>) => void;
    updateGraphInterpretation?: (formula: Formula, values: Record<string, number | null>) => void;
    displayRelatedFormulas?: (formula: Formula) => void;
    cleanupGlobalState?: () => void;
    trackUsage?: (term: string) => void;
    getCurrentVariableValues?: () => Record<string, number | null>;
    graphUpdatesEnabled?: boolean;
}
export declare class FormulaSelector {
    private createCalculator;
    private getGraphCoordinator;
    private renderVariableInputs;
    private renderFormulaPresets;
    private switchTab;
    private performCalculation?;
    private updateSolveIndicators?;
    private updateGraphIfEnabled?;
    private updateGraphInterpretation?;
    private displayRelatedFormulas?;
    private cleanupGlobalState?;
    private trackUsage?;
    private getCurrentVariableValues?;
    private graphUpdatesEnabled;
    private currentFormula;
    private currentCalculator;
    constructor(options: FormulaSelectorOptions);
    /**
     * Select a formula and initialize calculator
     */
    selectFormula(formula: Formula): void;
    getCurrentFormula(): Formula | null;
    getCurrentCalculator(): Calculator | null;
    private cleanupPreviousState;
    private trackFormulaUsage;
    private exposeToWindow;
    private initializeGraph;
    private switchToInputScreen;
    private populateFormulaInfo;
    private finalizeUIState;
    private setupDelayedUpdates;
    private handleSelectionError;
}
