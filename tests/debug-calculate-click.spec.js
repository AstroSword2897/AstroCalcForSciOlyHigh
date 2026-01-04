import { test, expect } from '@playwright/test';

test.describe('Debug: Calculate Button Click', () => {
    test('Test if calculate button is clickable', async ({ page }) => {
        await page.goto('/');
        
        // Wait for initial setup
        await page.waitForTimeout(3000);
        
        // Type in command palette to open a formula
        await page.locator('#command-palette-input').fill('wien');
        await page.waitForTimeout(500);
        
        // Click first result
        const firstResult = page.locator('.command-palette-item').first();
        await firstResult.click();
        await page.waitForTimeout(2000);
        
        // Check if calculator screen appears
        const calculatorScreenVisible = await page.locator('#input-screen').isVisible();
        console.log(`Calculator screen visible: ${calculatorScreenVisible}`);
        
        // Check for N/A checkbox (but don't check it for now)
        const naCheckbox = page.locator('.na-checkbox').first();
        const naCheckboxCount = await naCheckbox.count();
        console.log(`N/A checkboxes found: ${naCheckboxCount}`);
        
        // Get all variable inputs
        const variableInputs = page.locator('.variable-input');
        const inputCount = await variableInputs.count();
        console.log(`Variable inputs found: ${inputCount}`);
        
        if (inputCount > 0) {
            // Enter a value for the first input
            await variableInputs.first().fill('100');
            console.log('Entered value 100 for first variable');
            
            // If there's a second input, enter a value for it too
            if (inputCount > 1) {
                await variableInputs.nth(1).fill('200');
                console.log('Entered value 200 for second variable');
            }
        }
        
        // Check if calculate button appears
        const calculateBtn = page.locator('#calculate-btn');
        const calculateBtnVisible = await calculateBtn.isVisible();
        console.log(`Calculate button visible: ${calculateBtnVisible}`);
        
        if (calculateBtnVisible) {
            // Try to click the calculate button
            console.log('Attempting to click calculate button...');
            await calculateBtn.click();
            console.log('Calculate button clicked!');
            await page.waitForTimeout(2000);
            
            // Check for results in multiple possible locations
            const resultSelectors = [
                '.result',
                '.calculation-result', 
                '#result-display',
                '.error-message',
                '.result-display'
            ];
            
            for (const selector of resultSelectors) {
                const result = page.locator(selector);
                const resultVisible = await result.isVisible();
                console.log(`Result ${selector} visible: ${resultVisible}`);
                
                if (resultVisible) {
                    const resultText = await result.textContent();
                    console.log(`Result text from ${selector}: ${resultText}`);
                }
            }
            
            // Check console for errors
            const consoleMessages = await page.evaluate(() => {
                const messages = [];
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.log = (...args) => messages.push(['log', ...args]);
                console.error = (...args) => messages.push(['error', ...args]);
                console.warn = (...args) => messages.push(['warn', ...args]);
                
                return messages;
            });
            
            console.log('Console messages:', consoleMessages);
        }
    });
});
