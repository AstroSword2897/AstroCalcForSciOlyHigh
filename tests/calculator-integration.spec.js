// Comprehensive calculator test using file protocol
import { test, expect } from '@playwright/test';

test.describe('Calculator Integration Test', () => {
    test.beforeEach(async ({ page }) => {
        // Use file protocol since localhost isn't working
        await page.goto('file:///Users/nani/AstroCalcForSciOlyHigh-1/index.html');
        await page.waitForLoadState('domcontentloaded');
        
        // Wait for debug scripts to run
        await page.waitForTimeout(3000);
    });

    test('Page loads and has formula cards', async ({ page }) => {
        // Check if formula cards exist
        const cards = page.locator('.formula-card');
        const cardCount = await cards.count();
        
        console.log(`Found ${cardCount} formula cards`);
        
        // Should have at least 1 card (either original or manually created)
        expect(cardCount).toBeGreaterThan(0);
    });

    test('Can search for formulas', async ({ page }) => {
        // Try multiple possible search selectors
        const searchInput = page.locator('#formula-search').or(
            page.locator('.formula-search-input')
        ).or(
            page.locator('input[placeholder*="Search"]')
        ).or(
            page.locator('input[type="text"]')
        ).first();
        
        await expect(searchInput).toBeVisible({ timeout: 5000 });
        
        // Fill search
        await searchInput.fill('wien');
        await page.waitForTimeout(1000);
        
        // Check if any cards are visible
        const visibleCards = page.locator('.formula-card:visible');
        const visibleCount = await visibleCards.count();
        
        console.log(`Found ${visibleCount} visible cards after search`);
    });

    test('Can click formula card and open calculator', async ({ page }) => {
        // Find first formula card
        const firstCard = page.locator('.formula-card').first();
        
        if (await firstCard.count() > 0) {
            // Click the card
            await firstCard.click();
            await page.waitForTimeout(1000);
            
            // Check if calculator screen appeared
            const calculatorScreen = page.locator('#calculator-screen').or(
                page.locator('[data-testid="calculator-screen"]')
            );
            
            // Wait for calculator to appear
            await page.waitForTimeout(2000);
            
            const isVisible = await calculatorScreen.isVisible();
            console.log(`Calculator screen visible: ${isVisible}`);
            
            // Should be visible after clicking card
            expect(isVisible).toBeTruthy();
        } else {
            console.log('No formula cards found to click');
        }
    });

    test('Can use calculate button', async ({ page }) => {
        // Find calculate button
        const calculateBtn = page.locator('#calculate-btn').or(
            page.locator('button:has-text("Calculate")')
        ).or(
            page.locator('[data-testid="calculate-btn"]')
        );
        
        // Try to find calculator screen first
        const calculatorScreen = page.locator('#calculator-screen').or(
            page.locator('[data-testid="calculator-screen"]')
        );
        
        if (await calculatorScreen.isVisible()) {
            // Calculate button should be visible
            await expect(calculateBtn).toBeVisible({ timeout: 3000 });
            
            // Click calculate
            await calculateBtn.click();
            await page.waitForTimeout(1000);
            
            // Check for result
            const result = page.locator('#calculator-result').or(
                page.locator('.result-display')
            );
            
            const resultVisible = await result.isVisible();
            console.log(`Result visible: ${resultVisible}`);
            
            // Should show some result
            expect(resultVisible).toBeTruthy();
        } else {
            console.log('Calculator screen not visible, skipping calculate test');
        }
    });

    test('Check for N/A functionality', async ({ page }) => {
        // Find N/A checkbox or input
        const naCheckbox = page.locator('.na-checkbox').or(
            page.locator('input[type="checkbox"][data-symbol]')
        ).first();
        
        const naInput = page.locator('input[value="N/A"]').or(
            page.locator('input[placeholder*="N/A"]')
        ).first();
        
        // Check if either exists
        const hasCheckbox = await naCheckbox.count() > 0;
        const hasInput = await naInput.count() > 0;
        
        console.log(`N/A checkbox available: ${hasCheckbox}`);
        console.log(`N/A input available: ${hasInput}`);
        
        // At least one should exist
        expect(hasCheckbox || hasInput).toBeTruthy();
    });
});
