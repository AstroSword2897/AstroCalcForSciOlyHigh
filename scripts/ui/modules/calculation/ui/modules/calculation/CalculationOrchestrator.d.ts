/**
 * CalculationOrchestrator - IMPROVED VERSION
 * Better error handling, validation, and user feedback
 */
import { Formula, CalculationResult } from '../../../types/formula';
export interface Calculator {
    solve(variableValues: Record<string, number | null>): CalculationResult;
    solveSymbolically(variables: string[], values: Record<string, number | null>, unknowns: string[]): CalculationResult;
}
export interface UnitConverter {
    getAlternativeUnits(baseUnit: string): string[];
    convertToBase(value: number, fromUnit: string, toUnit: string): number;
}
export interface CalculationOrchestratorOptions {
    getCalculator: () => Calculator | null;
    getFormula: () => Formula | null;
    getGraphManager: () => any | null;
    parseNumericValue: (input: string, unit?: string | null) => number | null;
    displayResult: (result: CalculationResult) => void;
    displayError: (message: string) => void;
    updateGraphIfEnabled?: (formula: Formula, values: Record<string, number | null>, options?: any) => void;
    updateGraphInterpretation?: (formula: Formula, values: Record<string, number | null>) => void;
    updateSolveIndicators?: () => void;
    unitConverter: UnitConverter;
    globalConstants?: Record<string, number>;
    graphUpdatesEnabled?: boolean;
}
export declare class CalculationOrchestrator {
    private getCalculator;
    private getFormula;
    private getGraphManager;
    private parseNumericValue;
    private displayResult;
    private displayError;
    private updateGraphIfEnabled?;
    private updateGraphInterpretation?;
    private updateSolveIndicators?;
    private unitConverter;
    private globalConstants;
    private graphUpdatesEnabled;
    private calculationHistory;
    private readonly MAX_HISTORY;
    constructor(options: CalculationOrchestratorOptions);
    /**
     * Perform calculation with improved error handling and validation
     */
    performCalculation(): void;
    /**
     * Collect variable values with improved error handling
     */
    private collectVariableValues;
    private collectVariableValue;
    private validateVariableValues;
    private validateResult;
    private getConstantSymbols;
    private isNAValue;
    private handleSymbolicResult;
    private updateGraphAfterCalculation;
    private handleCalculationError;
    private improveErrorMessage;
    private addToHistory;
    getCalculationHistory(): Array<{
        formula: string;
        timestamp: number;
        result: any;
    }>;
}
