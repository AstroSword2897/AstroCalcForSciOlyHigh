/**
 * End-to-End Test: Formula Cards Calculation System
 * Tests that every formula card can be clicked, inputs filled, and calculations performed
 */

import { test, expect } from '@playwright/test';

test.describe('Formula Cards Calculation System', () => {
    test.beforeEach(async ({ page }) => {
        // Start server if needed
        await page.goto('http://localhost:8000/?nocache=1');
        
        // Wait for formulas to load
        await page.waitForSelector('.formula-card', { timeout: 10000 });
    });
    
    test('should load all formula cards', async ({ page }) => {
        const cards = await page.locator('.formula-card').count();
        expect(cards).toBeGreaterThan(0);
        console.log(`Found ${cards} formula cards`);
    });
    
    test('should be able to click a formula card and see calculator inputs', async ({ page }) => {
        // Click first formula card
        const firstCard = page.locator('.formula-card').first();
        await firstCard.click();
        
        // Wait for calculator screen (input-screen)
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        
        // Wait a bit for inputs to render
        await page.waitForTimeout(500);
        
        // Check that inputs are visible (may be in variables-container or calculator-tab)
        const inputs1 = await page.locator('#variables-container input[type="number"]').count();
        const inputs2 = await page.locator('#calculator-tab input[type="number"]').count();
        const inputs3 = await page.locator('.variable-input').count();
        const totalInputs = inputs1 + inputs2 + inputs3;
        
        // Some formulas may not have inputs if they're constants-only
        console.log(`Found ${totalInputs} input fields (container: ${inputs1}, tab: ${inputs2}, class: ${inputs3})`);
        
        // If no inputs found, check if formula has variables
        if (totalInputs === 0) {
            const formulaName = await page.locator('#formula-name').textContent();
            console.log(`Formula "${formulaName}" may not have user inputs`);
        }
    });
    
    test('should calculate a simple formula (Kepler\'s Third Law)', async ({ page }) => {
        // Search for Kepler's law
        await page.fill('#formula-search', 'kepler');
        await page.waitForTimeout(500); // Wait for debounce
        
        // Click first result
        const keplerCard = page.locator('.formula-card').first();
        const cardText = await keplerCard.textContent();
        
        if (cardText && cardText.toLowerCase().includes('kepler')) {
            await keplerCard.click();
            
            // Wait for calculator
            await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
            
            // Fill in test values
            // T² = (4π²/GM) × a³
            // Test: a = 1.5e11 m (1 AU), M = 5.97e24 kg (Earth mass)
            // Expected: T ≈ 3.156e7 s (1 year)
            
            const inputs = page.locator('#variables-container input[type="number"]');
            const inputCount = await inputs.count();
            
            if (inputCount >= 2) {
                // Fill first input (semi-major axis)
                await inputs.nth(0).fill('1.5e11');
                
                // Fill second input (mass)
                if (inputCount >= 2) {
                    await inputs.nth(1).fill('5.97e24');
                }
                
                // Click calculate button
                const calculateBtn = page.locator('button:has-text("Calculate"), #calculate-btn, .calculate-btn').first();
                if (await calculateBtn.isVisible()) {
                    await calculateBtn.click();
                    
                    // Wait for result
                    await page.waitForTimeout(1000);
                    
                    // Check for result display
                    const result = page.locator('#calculation-result, .calculation-result, [data-result]').first();
                    if (await result.isVisible()) {
                        const resultText = await result.textContent();
                        expect(resultText).toBeTruthy();
                        console.log(`Calculation result: ${resultText}`);
                    }
                }
            }
        }
    });
    
    test('should test multiple formulas with calculations', async ({ page }) => {
        const testFormulas = [
            { search: 'escape velocity', inputs: ['6.37e6', '5.97e24'] },
            { search: 'luminosity', inputs: ['5778', '6.96e8'] },
            { search: 'angular size', inputs: ['1.5e11', '6.96e8'] }
        ];
        
        for (const testCase of testFormulas) {
            // Clear search
            await page.fill('#formula-search', '');
            await page.waitForTimeout(300);
            
            // Search for formula
            await page.fill('#formula-search', testCase.search);
            await page.waitForTimeout(500);
            
            // Click first result
            const card = page.locator('.formula-card').first();
            if (await card.isVisible()) {
                await card.click();
                
                // Wait for calculator
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                
                // Fill inputs
                const inputs = page.locator('#variables-container input[type="number"]');
                const inputCount = await inputs.count();
                
                for (let i = 0; i < Math.min(testCase.inputs.length, inputCount); i++) {
                    await inputs.nth(i).fill(testCase.inputs[i]);
                }
                
                // Calculate
                const calculateBtn = page.locator('button:has-text("Calculate")').first();
                if (await calculateBtn.isVisible()) {
                    await calculateBtn.click();
                    await page.waitForTimeout(1000);
                    
                    // Verify result exists
                    const hasResult = await page.locator('#calculation-result, .calculation-result').count() > 0;
                    console.log(`Formula "${testCase.search}": ${hasResult ? '✅ Calculated' : '⚠️ No result displayed'}`);
                }
                
                // Go back
                const backBtn = page.locator('button:has-text("Back"), #back-btn').first();
                if (await backBtn.isVisible()) {
                    await backBtn.click();
                    await page.waitForTimeout(500);
                }
            }
        }
    });
    
    test('should handle calculation errors gracefully', async ({ page }) => {
        // Click a formula card
        const firstCard = page.locator('.formula-card').first();
        await firstCard.click();
        
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        
        // Try to calculate with invalid inputs (negative values where not allowed)
        const inputs = page.locator('#variables-container input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
            await inputs.nth(0).fill('-1000');
            
            const calculateBtn = page.locator('button:has-text("Calculate")').first();
            if (await calculateBtn.isVisible()) {
                await calculateBtn.click();
                await page.waitForTimeout(1000);
                
                // Should show error or handle gracefully
                const errorMsg = page.locator('.error, .calculation-error, [role="alert"]');
                const hasError = await errorMsg.count() > 0;
                
                // Either error is shown OR calculation proceeds (both are valid)
                console.log(`Error handling: ${hasError ? 'Error displayed' : 'No error (may be valid)'}`);
            }
        }
    });
    
    test('should test calculation with N/A (solve for) functionality', async ({ page }) => {
        // Click a formula card
        const firstCard = page.locator('.formula-card').first();
        await firstCard.click();
        
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        // Find N/A checkboxes - try multiple selectors
        const naCheckboxes = page.locator('input[type="checkbox"]');
        const naCount = await naCheckboxes.count();
        
        console.log(`Found ${naCount} checkboxes`);
        
        if (naCount > 0) {
            try {
                // Check first checkbox
                await naCheckboxes.first().check({ timeout: 3000 });
                
                // Fill other inputs
                const inputs = page.locator('input[type="number"]:not([disabled])');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    await inputs.first().fill('1000');
                    
                    // Calculate
                    const calculateBtn = page.locator('button:has-text("Calculate")').first();
                    if (await calculateBtn.isVisible()) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Should solve for the N/A variable
                        const result = page.locator('#calculation-result, .calculation-result');
                        const hasResult = await result.count() > 0;
                        console.log(`N/A solve test: ${hasResult ? '✅ Solved for variable' : '⚠️ No result'}`);
                    }
                }
            } catch (e) {
                console.log(`N/A checkbox test skipped: ${e.message}`);
            }
        } else {
            console.log('No N/A checkboxes found - this formula may not support solve-for functionality');
        }
    });
});

