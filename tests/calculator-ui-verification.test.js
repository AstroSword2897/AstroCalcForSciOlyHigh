/**
 * Calculator UI Verification Test
 * Verifies that the calculator displays correctly with all inputs, buttons, and features
 */

import { test, expect } from '@playwright/test';

test.describe('Calculator UI Verification', () => {
    test('should display calculator with all required elements', async ({ page }) => {
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });
        
        // Wait for app to initialize
        await page.waitForSelector('.formula-card, #formula-list', { timeout: 15000 });
        await page.waitForFunction(() => typeof window.uiOrchestrator !== 'undefined', { timeout: 10000 });
        
        // Close command palette if open
        await page.evaluate(() => {
            const palette = document.getElementById('command-palette');
            if (palette) {
                palette.style.display = 'none';
                palette.style.pointerEvents = 'none';
            }
        });
        
        // Select a formula
        const firstCard = page.locator('.formula-card').first();
        await expect(firstCard).toBeVisible();
        await firstCard.click();
        
        // Wait for calculator screen
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Verify calculator tab is active
        const calcTab = page.locator('.tab-btn[data-tab="calculator"]');
        await expect(calcTab).toHaveClass(/active/);
        
        // Verify formula name is displayed
        const formulaName = page.locator('#formula-name');
        if (await formulaName.count() > 0) {
            const nameText = await formulaName.textContent();
            expect(nameText).toBeTruthy();
            expect(nameText.trim().length).toBeGreaterThan(0);
            console.log(`✅ Formula name displayed: ${nameText}`);
        }
        
        // Verify formula equation is displayed
        const formulaEquation = page.locator('#formula-equation');
        if (await formulaEquation.count() > 0) {
            const equationText = await formulaEquation.textContent();
            expect(equationText).toBeTruthy();
            console.log(`✅ Formula equation displayed: ${equationText.substring(0, 50)}...`);
        }
        
        // Verify formula description is displayed
        const formulaDescription = page.locator('#formula-description');
        if (await formulaDescription.count() > 0) {
            const descText = await formulaDescription.textContent();
            expect(descText).toBeTruthy();
            console.log(`✅ Formula description displayed`);
        }
        
        // Verify variables container exists and has inputs
        const varsContainer = page.locator('#variables-container');
        await expect(varsContainer).toBeVisible();
        
        // Check for variable inputs
        const variableInputs = page.locator('#variables-container input[type="number"], #variables-container input[type="text"], .variable-input');
        const inputCount = await variableInputs.count();
        expect(inputCount).toBeGreaterThan(0);
        console.log(`✅ Found ${inputCount} variable inputs`);
        
        // Verify each input has proper structure
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
            const input = variableInputs.nth(i);
            const symbol = await input.getAttribute('data-symbol');
            const id = await input.getAttribute('id');
            expect(symbol || id).toBeTruthy();
        }
        
        // Verify N/A checkboxes exist
        const naCheckboxes = page.locator('#variables-container input[type="checkbox"].na-checkbox');
        const checkboxCount = await naCheckboxes.count();
        expect(checkboxCount).toBeGreaterThan(0);
        console.log(`✅ Found ${checkboxCount} N/A checkboxes`);
        
        // Verify Calculate button exists
        const calculateBtn = page.locator('#calculate-btn, button:has-text("Calculate")');
        await expect(calculateBtn).toBeVisible();
        console.log('✅ Calculate button visible');
        
        // Verify Clear button exists
        const clearBtn = page.locator('#clear-btn, button:has-text("Clear")');
        if (await clearBtn.count() > 0) {
            await expect(clearBtn).toBeVisible();
            console.log('✅ Clear button visible');
        }
        
        // Verify result display area exists
        const resultDisplay = page.locator('#result-display, .result-display');
        if (await resultDisplay.count() > 0) {
            await expect(resultDisplay).toBeVisible();
            console.log('✅ Result display area visible');
        }
        
        // Test entering a value
        if (inputCount > 0) {
            const firstInput = variableInputs.first();
            await firstInput.fill('10');
            const value = await firstInput.inputValue();
            expect(value).toBe('10');
            console.log('✅ Input value entered successfully');
        }
        
        // Test calculation
        await calculateBtn.click();
        await page.waitForTimeout(1000);
        
        // Check if result appears
        if (await resultDisplay.count() > 0) {
            const resultText = await resultDisplay.textContent();
            expect(resultText).toBeTruthy();
            console.log(`✅ Calculation result displayed: ${resultText.substring(0, 100)}`);
        }
        
        console.log('\n🎉 Calculator UI verification complete!');
    });
    
    test('should display all calculator tabs correctly', async ({ page }) => {
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.formula-card', { timeout: 15000 });
        
        // Close command palette
        await page.evaluate(() => {
            const palette = document.getElementById('command-palette');
            if (palette) {
                palette.style.display = 'none';
            }
        });
        
        // Select a formula
        const firstCard = page.locator('.formula-card').first();
        await firstCard.click();
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Test Calculator tab
        const calcTab = page.locator('.tab-btn[data-tab="calculator"]');
        await calcTab.click();
        await page.waitForTimeout(300);
        await expect(calcTab).toHaveClass(/active/);
        const calcContent = page.locator('#calculator-tab');
        await expect(calcContent).toBeVisible();
        console.log('✅ Calculator tab works');
        
        // Test Graph tab
        const graphTab = page.locator('.tab-btn[data-tab="graph"]');
        await graphTab.click();
        await page.waitForTimeout(300);
        await expect(graphTab).toHaveClass(/active/);
        const graphContent = page.locator('#graph-tab');
        await expect(graphContent).toBeVisible();
        console.log('✅ Graph tab works');
        
        // Test Classification sub-tab
        const classTab = page.locator('.tab-btn[data-tab="classification"]');
        await classTab.click();
        await page.waitForTimeout(300);
        await expect(classTab).toHaveClass(/active/);
        const classContent = page.locator('#classification-tab');
        await expect(classContent).toBeVisible();
        console.log('✅ Classification tab works');
    });
});

