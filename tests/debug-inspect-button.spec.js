import { test, expect } from '@playwright/test';

test.describe('Debug: Inspect Calculate Button', () => {
    test('Check calculate button properties', async ({ page }) => {
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
        
        // Check all buttons
        const allButtons = await page.locator('button').all();
        console.log(`Total buttons found: ${allButtons.length}`);
        
        for (let i = 0; i < allButtons.length; i++) {
            const button = allButtons[i];
            const text = await button.textContent();
            const id = await button.getAttribute('id');
            const classes = await button.getAttribute('class');
            const visible = await button.isVisible();
            console.log(`Button ${i}: text="${text}", id="${id}", classes="${classes}", visible=${visible}`);
        }
        
        // Try to find calculate button by ID
        const calculateById = page.locator('#calculate-btn');
        const byIdVisible = await calculateById.isVisible();
        console.log(`Calculate button by ID visible: ${byIdVisible}`);
        
        // Try to find calculate button by text
        const calculateByText = page.locator('button').filter({ hasText: 'Calculate' }).first();
        const byTextVisible = await calculateByText.isVisible();
        console.log(`Calculate button by text visible: ${byTextVisible}`);
    });
});
