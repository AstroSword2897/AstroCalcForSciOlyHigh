/**
 * Calculator module - handles calculation logic and display
 */

import { Formula, CalculationResult } from '../../types/formula';

export class CalculatorModule {
    private calculator: any | null = null; // FormulaCalculator - will be properly typed later

    /**
     * Initialize calculator for a formula
     */
    initCalculator(formula: Formula): void {
        this.cleanup();
        
        // FormulaCalculator is loaded globally
        const FormulaCalculatorClass = (typeof window !== 'undefined' && (window as any).FormulaCalculator) 
            || (typeof globalThis !== 'undefined' && (globalThis as any).FormulaCalculator)
            || (typeof global !== 'undefined' && (global as any).FormulaCalculator);
        
        if (FormulaCalculatorClass) {
            this.calculator = new FormulaCalculatorClass(formula);
        } else {
            console.error('[CalculatorModule] FormulaCalculator not available');
        }
    }

    /**
     * Perform calculation
     */
    calculate(variableValues: Record<string, number | null>): CalculationResult {
        if (!this.calculator) {
            throw new Error('Calculator not initialized');
        }

        if (typeof this.calculator.solve === 'function') {
            return this.calculator.solve(variableValues);
        } else {
            throw new Error('Calculator.solve method not available');
        }
    }

    /**
     * Validate inputs before calculation
     */
    validateInputs(
        variableValues: Record<string, number | null>,
        requiredVariables: string[]
    ): { valid: boolean; error?: string } {
        const emptyCount = requiredVariables.filter(
            v => variableValues[v] === null || variableValues[v] === undefined
        ).length;
        
        if (emptyCount === 0) {
            return {
                valid: false,
                error: 'All variables filled. Leave one empty to solve for it.'
            };
        }
        
        if (emptyCount > 1) {
            return {
                valid: false,
                error: 'Leave exactly one variable empty to calculate it.'
            };
        }
        
        return { valid: true };
    }

    /**
     * Get current calculator instance
     */
    getCalculator(): any {
        return this.calculator;
    }

    /**
     * Cleanup
     */
    cleanup(): void {
        if (this.calculator && typeof (this.calculator as any).cleanup === 'function') {
            (this.calculator as any).cleanup();
        }
        this.calculator = null;
    }
}

// Singleton instance
let calculatorModuleInstance: CalculatorModule | null = null;

export function getCalculatorModule(): CalculatorModule {
    if (!calculatorModuleInstance) {
        calculatorModuleInstance = new CalculatorModule();
    }
    return calculatorModuleInstance;
}

// Expose to window for backward compatibility
if (typeof window !== 'undefined') {
    (window as any).CalculatorModule = CalculatorModule;
    (window as any).getCalculatorModule = getCalculatorModule;
}

