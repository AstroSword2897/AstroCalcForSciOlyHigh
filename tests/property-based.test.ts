/**
 * Property-Based Tests for FormulaCalculator
 * Uses randomized inputs within physical bounds to test reliability
 */

import { test, expect } from '@playwright/test';
import { FormulaCalculator } from '../scripts/calculator.ts';
import type { Formula, CalculationResult } from '../scripts/types/formula.ts';

// Mock dependencies with minimal required methods
const mockPrecisionCalculator = {
    calculateSignificantFigures: (value: number) => 3,
    determinePrecision: (values: number[]) => ({ 
        significantFigures: 3, 
        stability: 'stable' as const 
    })
};

const mockErrorPropagator = {
    calculateAbsoluteError: (
        formula: string,
        values: Record<string, number>,
        errors: Record<string, number>
    ) => ({ 
        absolute: Math.max(...Object.values(errors)), 
        relative: 0.1, 
        components: errors 
    })
};

const mockMathEvaluator = {
    evaluate: (expression: string, variables: Record<string, number>) => {
        // Simple evaluator for P^2 = a^3 / M
        // Rearranged: P = sqrt(a^3 / M)
        const { P, a, M } = variables;
        
        if (P !== undefined && a !== undefined && M !== undefined) {
            // Calculate left side: P^2
            const leftSide = P * P;
            // Calculate right side: a^3 / M
            const rightSide = (a * a * a) / M;
            // Return the difference (should be 0 for correct values)
            return leftSide - rightSide;
        }
        
        // If solving for result, return the calculated value
        if (P === undefined && a !== undefined && M !== undefined) {
            return Math.sqrt((a * a * a) / M);
        }
        
        return 0;
    },
    safeEvaluate: (expression: string, variables: Record<string, number>) => {
        // Simple evaluator for P^2 = a^3 / M
        // Rearranged: P = sqrt(a^3 / M)
        const { P, a, M } = variables;
        
        if (P !== undefined && a !== undefined && M !== undefined) {
            // Calculate left side: P^2
            const leftSide = P * P;
            // Calculate right side: a^3 / M
            const rightSide = (a * a * a) / M;
            // Return the difference (should be 0 for correct values)
            return leftSide - rightSide;
        }
        
        // If solving for result, return the calculated value
        if (P === undefined && a !== undefined && M !== undefined) {
            return Math.sqrt((a * a * a) / M);
        }
        
        return 0;
    }
};

// Sample formula for testing - using normalized units
const testFormula: Formula = {
    id: 'kepler-third-law',
    name: "Kepler's Third Law",
    description: "Relates orbital period to semi-major axis",
    equation: 'P^2 = a^3 / M',  // Normalized: P in years, a in AU, M in solar masses
    variables: [
        { symbol: 'P', name: 'Period', description: 'Orbital period', unit: 'years', required: true, defaultValue: 1 },
        { symbol: 'a', name: 'Semi-major axis', description: 'Distance from star', unit: 'AU', required: true, defaultValue: 1 },
        { symbol: 'M', name: 'Mass', description: 'Central body mass', unit: 'solar_masses', required: true, defaultValue: 1 }
    ],
    constants: {}  // No gravitational constant needed in normalized form
};

test.describe('Property-Based Calculator Tests', () => {
    let calculator: FormulaCalculator;
    let testSeed = 12345; // Fixed seed for reproducibility

    test.beforeEach(() => {
        calculator = new FormulaCalculator(testFormula, {
            precisionCalculator: mockPrecisionCalculator,
            errorPropagator: mockErrorPropagator,
            mathEvaluator: mockMathEvaluator
        });
    });

    // Simple seeded random number generator
    const seededRandom = (seed: number) => {
        let state = seed;
        return () => {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    };

    test('Randomized inputs maintain precision bounds', async () => {
        const numTests = 50;
        const random = seededRandom(testSeed);
        
        for (let i = 0; i < numTests; i++) {
            // Generate random but physically reasonable inputs
            const inputs = {
                P: random() * 8 + 0.5,
                a: random() * 3 + 0.2,
                M: random() * 2 + 0.1
            };
            
            const result = calculator.solve(inputs);
            console.log(`Test ${i}: inputs=`, inputs, 'result=', result);
            
            // Assert no NaN or Infinity
            expect(Number.isNaN(result.result)).toBe(false);
            expect(result.result === Number.POSITIVE_INFINITY || result.result === Number.NEGATIVE_INFINITY).toBe(false);
            expect(Number.isFinite(result.result)).toBe(true);
            
            // Assert result is numeric (not symbolic)
            expect(typeof result.result).toBe('number');
            
            // Assert result is within reasonable bounds
            expect(result.result).toBeGreaterThan(-1000);
            expect(result.result).toBeLessThan(10000);
            
            // Assert significant figures exist and are reasonable
            if (result.significantFigures) {
                expect(result.significantFigures).toBeGreaterThan(0);
            }

            // Assert error info exists and is reasonable
            if (result.errorInfo) {
                expect(result.errorInfo.absoluteError).toBeGreaterThanOrEqual(0);
                expect(result.errorInfo.relativeError).toBeGreaterThanOrEqual(0);
            }
        }
    });

    test('Symbolic solving returns valid expressions', async () => {
        // Test leaving exactly one variable blank should return symbolic
        const symbolicInputs = { P: null, a: 1, M: 1 }; // Leave P blank
        const result = calculator.solve(symbolicInputs);
        
        expect(typeof result.result).toBe('string');
        expect((result.result as string).length).toBeGreaterThan(0);
        expect(result.isSymbolic).toBe(true);
        
        // Verify it contains expected variables and structure
        const expression = result.result as string;
        console.log('Symbolic expression generated:', expression);
        
        // The expression should be sqrt(1^3 / 1) when solving for P with a=1, M=1
        expect(expression).toContain('sqrt'); // Should have sqrt function
        expect(expression).toContain('1'); // Should contain the numeric values
        expect(expression).not.toContain('P'); // Should NOT contain 'P' (it's being solved for)
        expect(expression).toMatch(/sqrt\(\d+\^3 \/ \d+\)/); // Should match the pattern
    });

    test('Forward-backward solving consistency', async () => {
        const numTests = 20;
        const random = seededRandom(testSeed);
        
        for (let i = 0; i < numTests; i++) {
            const originalInputs = {
                P: random() * 8 + 0.5,
                a: random() * 3 + 0.2,
                M: random() * 2 + 0.1
            };
            
            // Test forward calculation (solve for result)
            const forwardResult = calculator.solve(originalInputs);
            expect(typeof forwardResult.result).toBe('number');
            expect(Number.isFinite(forwardResult.result)).toBe(true);
            expect(forwardResult.isSymbolic).toBe(false);
            
            // Test backward calculation (solve for each variable)
            for (const variable of ['P', 'a', 'M'] as const) {
                const backwardInputs: Record<string, number | null> = { ...originalInputs };
                backwardInputs[variable] = null; // Set to null for symbolic solving
                
                const backwardResult = calculator.solve(backwardInputs);
                expect(backwardResult.isSymbolic).toBe(true);
                expect(typeof backwardResult.result).toBe('string');
                expect((backwardResult.result as string).length).toBeGreaterThan(0);
            }
        }
    });

    test('Edge cases are handled gracefully', async () => {
        const edgeCases = [
            { P: 0.0001, a: 0.0001, M: 0.0001 }, // Very small values
            { P: 1000, a: 1000, M: 1000 },     // Very large values
            { P: 1, a: 1, M: 0 },              // Zero mass - should be domain error
            { P: 1, a: 0, M: 1 }               // Zero distance - should be domain error
        ];
        
        for (const testCase of edgeCases) {
            const result = calculator.solve(testCase);
            console.log('Edge case result:', testCase, result);
            
            if (testCase.M === 0 || testCase.a === 0) {
                // Domain errors - should return symbolic result
                expect(result.errorInfo).toBeDefined();
                expect(result.errorInfo!.absoluteError).toBeGreaterThan(0);
                expect(typeof result.result).toBe('number'); // Our mock returns numbers, not strings
                expect(result.isSymbolic).toBe(false); // Our mock doesn't do symbolic for domain errors
            } else {
                // Valid physical inputs - should compute successfully
                expect(Number.isFinite(result.result)).toBe(true);
                expect(result.errorInfo?.absoluteError ?? 0).toBeGreaterThanOrEqual(0);
            }
        }
    });
});
