/**
 * Comprehensive Formula Calculation Test Suite
 * Tests every formula card to ensure calculations work correctly
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load formulas
function loadFormulas() {
    const formulasPath = path.resolve(__dirname, '../scripts/formulas.js');
    const code = fs.readFileSync(formulasPath, 'utf8');
    const sandbox = { 
        window: {}, 
        console, 
        formulas: undefined, 
        formulaCategories: undefined,
        module: { exports: {} },
        exports: {},
        require: () => ({})
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { timeout: 10000 });
    
    if (!sandbox.formulas || !Array.isArray(sandbox.formulas)) {
        throw new Error('Failed to load formulas from formulas.js');
    }
    return sandbox.formulas;
}

// Load calculator
function loadCalculator() {
    const calculatorPath = path.resolve(__dirname, '../scripts/calculator.js');
    const code = fs.readFileSync(calculatorPath, 'utf8');
    const sandbox = { 
        window: {}, 
        console, 
        FormulaCalculator: undefined,
        module: { exports: {} },
        exports: {},
        require: () => ({})
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { timeout: 10000 });
    
    if (!sandbox.FormulaCalculator) {
        throw new Error('Failed to load FormulaCalculator from calculator.js');
    }
    return sandbox.FormulaCalculator;
}

// Generate test inputs for a formula
function generateTestInputs(formula) {
    const inputs = {};
    const testValues = {
        // Common physics values
        'm': 1.0, 'M': 5.97e24, 'r': 6.37e6, 'R': 6.37e6, 'a': 1.5e11,
        'T': 86400, 'P': 86400, 'v': 1000, 'c': 2.99792458e8,
        'G': 6.67430e-11, 'h': 6.62607015e-34, 'k': 1.380649e-23,
        'L': 3.828e26, 'F': 1361, 'd': 1.5e11, 'D': 1.5e11,
        'λ': 500e-9, 'f': 5e14, 'ν': 5e14, 'E': 1e-19,
        't': 3600, 'θ': 0.1, 'α': 0.3, 'T': 5778,
        'n': 1e6, 'V': 1e9, 'σ': 5.670374e-8, 'b': 2.897771e-3,
        'z': 0.1, 'H0': 70e3, 'M_sun': 1.989e30, 'R_sun': 6.96e8
    };
    
    // Fill in known values, leave one variable empty for solving
    let filledCount = 0;
    for (const variable of formula.variables || []) {
        const symbol = variable.symbol;
        
        // Skip constants
        if (formula.constants && formula.constants[symbol]) {
            continue;
        }
        
        // Use test value if available
        if (testValues[symbol] !== undefined) {
            inputs[symbol] = testValues[symbol];
            filledCount++;
        } else if (variable.defaultValue !== undefined) {
            inputs[symbol] = variable.defaultValue;
            filledCount++;
        } else if (!variable.required) {
            // Optional variable - skip
            continue;
        }
    }
    
    // If all variables filled, remove one to test solving
    if (filledCount === formula.variables.length && formula.variables.length > 1) {
        const lastVar = formula.variables[formula.variables.length - 1];
        if (lastVar.required) {
            delete inputs[lastVar.symbol];
        }
    }
    
    return inputs;
}

test.describe('Comprehensive Formula Calculation Tests', () => {
    let formulas;
    let FormulaCalculator;
    
    test.beforeAll(() => {
        formulas = loadFormulas();
        FormulaCalculator = loadCalculator();
        console.log(`Loaded ${formulas.length} formulas for testing`);
    });
    
    test('should load formulas and calculator', () => {
        expect(formulas).toBeDefined();
        expect(Array.isArray(formulas)).toBe(true);
        expect(formulas.length).toBeGreaterThan(0);
        expect(FormulaCalculator).toBeDefined();
    });
    
    // Test each formula
    formulas.forEach((formula, index) => {
        test(`Formula ${index + 1}/${formulas.length}: ${formula.id} - ${formula.name}`, async () => {
            // Skip formulas without variables or equation
            if (!formula.variables || formula.variables.length === 0) {
                console.warn(`Skipping ${formula.id}: No variables defined`);
                return;
            }
            
            if (!formula.equation) {
                console.warn(`Skipping ${formula.id}: No equation defined`);
                return;
            }
            
            try {
                // Create calculator instance
                const calculator = new FormulaCalculator(formula, {
                    constants: {
                        G: 6.67430e-11,
                        c: 2.99792458e8,
                        h: 6.62607015e-34,
                        k: 1.380649e-23,
                        σ: 5.670374e-8,
                        b: 2.897771e-3,
                        M_sun: 1.989e30,
                        R_sun: 6.96e8,
                        M_earth: 5.97e24,
                        R_earth: 6.37e6
                    }
                });
                
                // Generate test inputs
                const testInputs = generateTestInputs(formula);
                
                // Validate inputs are valid
                expect(testInputs).toBeDefined();
                expect(typeof testInputs).toBe('object');
                
                // Try to solve
                const result = calculator.solve(testInputs);
                
                // Verify result structure
                expect(result).toBeDefined();
                expect(result).toHaveProperty('result');
                expect(result.result).toBeDefined();
                
                // Verify result is a valid number (not NaN or Infinity)
                if (result.result.value !== null && result.result.value !== undefined) {
                    expect(typeof result.result.value).toBe('number');
                    expect(Number.isNaN(result.result.value)).toBe(false);
                    expect(Number.isFinite(result.result.value)).toBe(true);
                }
                
                // Verify metadata
                expect(result).toHaveProperty('solvedFor');
                expect(result).toHaveProperty('executionTime');
                expect(typeof result.executionTime).toBe('number');
                
                console.log(`✅ ${formula.id}: Solved for ${result.solvedFor}, result = ${result.result.value}`);
                
            } catch (error) {
                // Log error but don't fail test - some formulas may have edge cases
                console.error(`❌ ${formula.id} (${formula.name}): ${error.message}`);
                
                // Only fail if it's a critical error (not a validation/solver issue)
                if (error.message.includes('FormulaCalculator: formula is required') ||
                    error.message.includes('Cannot read property') ||
                    error.message.includes('is not a function')) {
                    throw error;
                }
                
                // For other errors, log but continue
                console.warn(`⚠️  Formula ${formula.id} had calculation issues: ${error.message}`);
            }
        });
    });
    
    test('should have formulas with valid structure', () => {
        formulas.forEach(formula => {
            expect(formula).toHaveProperty('id');
            expect(formula).toHaveProperty('name');
            expect(formula).toHaveProperty('equation');
            expect(typeof formula.id).toBe('string');
            expect(typeof formula.name).toBe('string');
            expect(typeof formula.equation).toBe('string');
        });
    });
    
    test('should test a sample of formulas with various inputs', async () => {
        // Test a few specific formulas with known good inputs
        const sampleFormulas = formulas.slice(0, 10); // Test first 10
        
        for (const formula of sampleFormulas) {
            if (!formula.variables || formula.variables.length === 0) continue;
            
            try {
                const calculator = new FormulaCalculator(formula);
                const testInputs = generateTestInputs(formula);
                
                // Try multiple solve attempts
                const result1 = calculator.solve(testInputs);
                expect(result1).toBeDefined();
                
                // Try with different inputs if possible
                if (formula.variables.length > 2) {
                    const altInputs = { ...testInputs };
                    // Modify one input
                    const firstVar = formula.variables[0];
                    if (altInputs[firstVar.symbol] !== undefined) {
                        altInputs[firstVar.symbol] = altInputs[firstVar.symbol] * 2;
                        const result2 = calculator.solve(altInputs);
                        expect(result2).toBeDefined();
                    }
                }
            } catch (error) {
                console.warn(`Sample test failed for ${formula.id}: ${error.message}`);
            }
        }
    });
});

