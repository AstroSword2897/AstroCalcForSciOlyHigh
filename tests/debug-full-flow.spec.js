import { test, expect } from '@playwright/test';

test.describe('Debug: Full Test Flow', () => {
    test('Run the exact test flow', async ({ page }) => {
        await page.goto('/');
        
        // Wait for initial setup
        await page.waitForTimeout(3000);
        
        // Open a formula using command palette (click result directly)
        await page.locator('#command-palette-input').fill('wien');
        await page.waitForTimeout(500);
        
        // Click first result
        const firstResult = page.locator('.command-palette-item').first();
        await firstResult.click();
        await page.waitForTimeout(2000);
        
        // Find N/A checkbox and variable inputs
        const naCheckbox = page.locator('.na-checkbox').first();
        const variableInputs = page.locator('.variable-input');
        
        console.log(`N/A checkbox count: ${await naCheckbox.count()}`);
        console.log(`Variable inputs count: ${await variableInputs.count()}`);
        
        if (await naCheckbox.count() > 0 && await variableInputs.count() > 0) {
            // Check N/A checkbox for first variable
            await naCheckbox.check();
            console.log('Checked N/A checkbox for first variable');
            
            // Enter value for second variable
            if (await variableInputs.count() > 1) {
                await variableInputs.nth(1).fill('100');
                console.log('Entered value 100 for second variable');
            }
        }
        
        // Click calculate (exact same as test)
        const calculateBtn = page.locator('button:has-text("Calculate")').first();
        console.log('Calculate button selector found');
        
        // Check if button is attached and visible
        const attached = await calculateBtn.count();
        const visible = await calculateBtn.isVisible();
        console.log(`Button attached: ${attached}, visible: ${visible}`);
        
        if (attached && visible) {
            console.log('Attempting to click calculate button...');
            try {
                await calculateBtn.click({ timeout: 5000 });
                console.log('Calculate button clicked successfully!');
                await page.waitForTimeout(1000);
                
                // Check for symbolic expression (not error)
                const result = page.locator('.result, .calculation-result');
                const resultCount = await result.count();
                console.log(`Result elements found: ${resultCount}`);
                
                if (resultCount > 0) {
                    const resultText = await result.first().textContent();
                    console.log(`Result text: ${resultText}`);
                    
                    expect(resultText).not.toContain('Error');
                    expect(resultText).not.toContain('error');
                } else {
                    // Check for result-display
                    const resultDisplay = page.locator('#result-display');
                    if (await resultDisplay.isVisible()) {
                        const resultText = await resultDisplay.textContent();
                        console.log(`Result display text: ${resultText}`);
                    }
                }
            } catch (error) {
                console.error(`Failed to click calculate button: ${error.message}`);
            }
        }
    });
});
