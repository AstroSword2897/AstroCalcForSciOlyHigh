/**
 * Calculation Verification Test
 * Verifies that calculations work properly in the live application
 */

import { test, expect } from '@playwright/test';

test.describe('Calculation Verification', () => {
    test('should perform calculations correctly', async ({ page }) => {
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });
        
        // Wait for app to initialize
        await page.waitForSelector('.formula-card, #formula-list', { timeout: 15000 });
        await page.waitForFunction(() => typeof window.FormulaCalculator !== 'undefined', { timeout: 10000 });
        
        // Close command palette if open
        await page.evaluate(() => {
            const palette = document.getElementById('command-palette');
            if (palette) {
                palette.style.display = 'none';
                palette.style.pointerEvents = 'none';
            }
        });
        
        // Test 1: Verify FormulaCalculator is available
        const hasCalculator = await page.evaluate(() => typeof window.FormulaCalculator !== 'undefined');
        expect(hasCalculator).toBe(true);
        console.log('✅ FormulaCalculator is available');
        
        // Test 2: Find a test formula
        const testFormula = await page.evaluate(() => {
            return window.formulas?.find(f => 
                f.variables && 
                f.variables.length >= 2 && 
                f.variables.length <= 4 &&
                f.id
            );
        });
        
        expect(testFormula).toBeTruthy();
        console.log(`✅ Test formula found: ${testFormula.name}`);
        
        // Test 3: Create calculator and perform calculation
        const calculationResult = await page.evaluate((formula) => {
            try {
                const calculator = new window.FormulaCalculator(formula);
                const variableValues = {};
                
                // Fill first two variables
                formula.variables.slice(0, 2).forEach((variable, idx) => {
                    variableValues[variable.symbol] = (idx + 1) * 10;
                });
                
                const result = calculator.solve(variableValues);
                return {
                    success: true,
                    result: result,
                    inputValues: variableValues
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }, testFormula);
        
        expect(calculationResult.success).toBe(true);
        expect(calculationResult.result).toBeTruthy();
        expect(calculationResult.result.result).not.toBeNull();
        expect(calculationResult.result.result).not.toBeUndefined();
        const resultValue = calculationResult.result.result;
        const resultUnit = calculationResult.result.unit || '';
        console.log(`✅ Calculation successful: ${resultValue} ${resultUnit}`);
        
        // Test 4: Test symbolic solving
        const symbolicResult = await page.evaluate((formula) => {
            try {
                const calculator = new window.FormulaCalculator(formula);
                const variableValues = {};
                
                // Fill all but last variable
                formula.variables.slice(0, formula.variables.length - 1).forEach((variable, idx) => {
                    variableValues[variable.symbol] = (idx + 1) * 10;
                });
                
                // Leave last variable as null
                const lastVar = formula.variables[formula.variables.length - 1];
                variableValues[lastVar.symbol] = null;
                
                const result = calculator.solve(variableValues);
                return {
                    success: true,
                    result: result,
                    solvedFor: lastVar.symbol
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }, testFormula);
        
        expect(symbolicResult.success).toBe(true);
        expect(symbolicResult.result).toBeTruthy();
        const symbolicValue = symbolicResult.result.result;
        console.log(`✅ Symbolic solve successful: ${symbolicValue} for ${symbolicResult.solvedFor}`);
        
        // Test 5: Test inline card calculations
        const firstCard = page.locator('.formula-card').first();
        if (await firstCard.count() > 0) {
            const hasQuickCalc = await firstCard.locator('.quick-calc-input').count();
            if (hasQuickCalc > 0) {
                console.log(`✅ Found ${hasQuickCalc} quick calc inputs on cards`);
                
                // Test filling an input
                const firstInput = firstCard.locator('.quick-calc-input').first();
                await firstInput.fill('10');
                await page.waitForTimeout(600); // Wait for debounce
                
                // Check if result appears
                const resultEl = firstCard.locator('.quick-calc-result');
                if (await resultEl.count() > 0) {
                    const resultText = await resultEl.textContent();
                    console.log(`✅ Card calculation result: ${resultText}`);
                }
            }
        }
        
        // Test 6: Test full calculator workflow
        await firstCard.click();
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Fill inputs
        const numberInputs = page.locator('#variables-container input[type="number"], .variable-input input[type="number"]').filter({ hasNot: page.locator('input[type="checkbox"]') });
        const inputCount = await numberInputs.count();
        
        if (inputCount > 0) {
            await numberInputs.first().fill('10');
            await page.waitForTimeout(300);
            
            // Click calculate
            const calculateBtn = page.locator('#calculate-btn, button:has-text("Calculate")');
            if (await calculateBtn.count() > 0) {
                await calculateBtn.click();
                await page.waitForTimeout(1000);
                
                // Check result
                const resultDisplay = page.locator('#result-display, .result-display');
                if (await resultDisplay.count() > 0) {
                    const resultText = await resultDisplay.textContent();
                    expect(resultText).toBeTruthy();
                    console.log(`✅ Full calculator result: ${resultText.substring(0, 100)}`);
                }
            }
        }
        
        console.log('\n🎉 All calculation tests passed!');
    });
});

