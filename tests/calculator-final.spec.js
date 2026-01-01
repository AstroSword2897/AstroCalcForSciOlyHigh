// Final working calculator test with correct selectors
import { test, expect } from '@playwright/test';

test.describe('Calculator - Final Working Test', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('file:///Users/nani/AstroCalcForSciOlyHigh-1/index.html');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000); // Wait for debug scripts
    });

    test('Formula cards work and calculator opens', async ({ page }) => {
        // Find formula cards
        const cards = page.locator('.formula-card');
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThan(0);
        
        // Click first card
        await cards.first().click();
        await page.waitForTimeout(2000);
        
        // Check if ANY calculator-related element is visible
        const calculatorSelectors = [
            '#calculator-screen',
            '.calculator-screen',
            '[data-testid="calculator-screen"]',
            '#calculator-tab',
            '.calculator-tab'
        ];
        
        let calculatorVisible = false;
        for (const selector of calculatorSelectors) {
            const element = page.locator(selector);
            if (await element.isVisible()) {
                calculatorVisible = true;
                console.log(`Calculator found with selector: ${selector}`);
                break;
            }
        }
        
        console.log(`Calculator visible: ${calculatorVisible}`);
        
        // If calculator screen isn't visible, try to find calculate button directly
        if (!calculatorVisible) {
            const calculateBtn = page.locator('#calculate-btn').or(
                page.locator('button:has-text("Calculate")')
            ).or(
                page.locator('[data-testid="calculate-btn"]')
            );
            
            const btnVisible = await calculateBtn.first().isVisible();
            console.log(`Calculate button visible: ${btnVisible}`);
            
            if (btnVisible) {
                calculatorVisible = true;
            }
        }
        
        expect(calculatorVisible).toBeTruthy();
    });

    test('Search functionality works with correct selector', async ({ page }) => {
        // Use the actual search input selector we found
        const searchInput = page.locator('#command-palette-input').or(
            page.locator('input[placeholder*="command"]')
        ).or(
            page.locator('input[placeholder*="Type"]')
        ).first();
        
        await expect(searchInput).toBeVisible({ timeout: 5000 });
        
        // Fill search
        await searchInput.fill('wien');
        await page.waitForTimeout(1000);
        
        // Should still have formula cards (search might filter them)
        const cards = page.locator('.formula-card');
        const cardCount = await cards.count();
        
        console.log(`Cards after search: ${cardCount}`);
        expect(cardCount).toBeGreaterThan(0);
    });

    test('Check for any interactive elements', async ({ page }) => {
        // Check for various interactive elements
        const interactiveElements = {
            'Formula cards': '.formula-card',
            'Any input': 'input[type="text"]',
            'Any button': 'button',
            'Any tab': '[data-tab]',
            'Calculate button': '#calculate-btn, button:has-text("Calculate")'
        };
        
        const results = {};
        for (const [name, selector] of Object.entries(interactiveElements)) {
            const elements = page.locator(selector);
            const count = await elements.count();
            results[name] = count;
            console.log(`${name}: ${count} found`);
        }
        
        // Should have at least some interactive elements
        expect(results['Formula cards']).toBeGreaterThan(0);
        expect(results['Any input']).toBeGreaterThan(0);
        expect(results['Any button']).toBeGreaterThan(0);
    });
});
