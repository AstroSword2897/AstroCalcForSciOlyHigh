import { test, expect } from '@playwright/test';

test.describe('Debug: Command Palette Flow', () => {
    test('Test command palette search and selection', async ({ page }) => {
        await page.goto('/');
        
        // Wait for initial setup
        await page.waitForTimeout(3000);
        
        // Type in command palette
        await page.locator('#command-palette-input').fill('wien');
        await page.waitForTimeout(500);
        
        // Check if command palette results appear
        const resultsVisible = await page.locator('#command-palette-results').isVisible();
        console.log(`Command palette results visible: ${resultsVisible}`);
        
        if (resultsVisible) {
            // Check results count
            const resultCount = await page.locator('.command-palette-item').count();
            console.log(`Command palette result count: ${resultCount}`);
            
            if (resultCount > 0) {
                // Click first result
                const firstResult = page.locator('.command-palette-item').first();
                await firstResult.click();
                await page.waitForTimeout(2000);
                
                // Check if calculator screen appears
                const calculatorScreenVisible = await page.locator('#input-screen').isVisible();
                console.log(`Calculator screen visible: ${calculatorScreenVisible}`);
                
                // Check if calculate button appears
                const calculateBtnVisible = await page.locator('#calculate-btn').isVisible();
                console.log(`Calculate button visible: ${calculateBtnVisible}`);
                
                // Check for N/A checkboxes
                const naCheckboxCount = await page.locator('.na-checkbox').count();
                console.log(`N/A checkboxes found: ${naCheckboxCount}`);
            }
        }
    });
});
