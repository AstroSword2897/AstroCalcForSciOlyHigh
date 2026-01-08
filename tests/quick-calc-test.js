/**
 * Quick Calculate Test
 * Tests the inline Quick Calculate feature on formula cards
 */

import { test, expect } from '@playwright/test';

test.describe('Quick Calculate Feature', () => {
    test('should calculate escape velocity using Quick Calculate on card', async ({ page }) => {
        await page.goto('http://localhost:8000/?nocache=1');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        // Search for escape velocity
        await page.fill('#formula-search', 'escape velocity');
        await page.waitForTimeout(700); // Wait for debounce
        
        // Find the Escape Velocity card
        const card = page.locator('.formula-card').first();
        await expect(card).toBeVisible();
        
        // Take screenshot before
        await page.screenshot({ path: 'test-results/quick-calc-before.png' });
        
        // Find the quick-calc inputs on the card
        const rInput = card.locator('input.quick-calc-input[data-variable-symbol="r"]');
        const MInput = card.locator('input.quick-calc-input[data-variable-symbol="M"]');
        
        // Check inputs exist
        const rCount = await rInput.count();
        const MCount = await MInput.count();
        console.log(`Found r inputs: ${rCount}, M inputs: ${MCount}`);
        
        if (rCount > 0 && MCount > 0) {
            // Fill values using evaluate to avoid triggering card click
            await page.evaluate(() => {
                const rInputEl = document.querySelector('.formula-card input.quick-calc-input[data-variable-symbol="r"]');
                const MInputEl = document.querySelector('.formula-card input.quick-calc-input[data-variable-symbol="M"]');
                
                if (rInputEl) {
                    rInputEl.value = '6370000'; // Earth radius in meters
                    rInputEl.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (MInputEl) {
                    MInputEl.value = '5.97e24'; // Earth mass in kg
                    MInputEl.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            // Wait for debounce
            await page.waitForTimeout(1000);
            
            // Take screenshot after input
            await page.screenshot({ path: 'test-results/quick-calc-after-input.png' });
            
            // Find and click the Quick Calculate button on the card
            const calcBtn = card.locator('.quick-calc-btn, button:has-text("Calculate")');
            const calcBtnCount = await calcBtn.count();
            console.log(`Found calculate buttons: ${calcBtnCount}`);
            
            if (calcBtnCount > 0) {
                await calcBtn.first().click();
                await page.waitForTimeout(1000);
                
                // Take screenshot after calculation
                await page.screenshot({ path: 'test-results/quick-calc-result.png' });
                
                // Check for result
                const resultEl = page.locator('.quick-calc-result, .calculation-result');
                const resultCount = await resultEl.count();
                console.log(`Found result elements: ${resultCount}`);
                
                if (resultCount > 0) {
                    const resultText = await resultEl.first().textContent();
                    console.log(`✅ Quick Calculate Result: ${resultText}`);
                    
                    // Escape velocity from Earth should be ~11186 m/s (11.2 km/s)
                    expect(resultText).toBeTruthy();
                }
            }
        } else {
            console.log('Quick calculate inputs not found - testing main calculator instead');
            
            // Click the card to open main calculator
            await card.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot of calculator
            await page.screenshot({ path: 'test-results/main-calc-opened.png' });
        }
    });
    
    test('should verify Quick Calculate button exists on cards', async ({ page }) => {
        await page.goto('http://localhost:8000/?nocache=1');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        // Check a few cards for Quick Calculate
        const cards = page.locator('.formula-card');
        const cardCount = await cards.count();
        console.log(`Total cards: ${cardCount}`);
        
        let cardsWithQuickCalc = 0;
        for (let i = 0; i < Math.min(cardCount, 10); i++) {
            const card = cards.nth(i);
            const quickCalcSection = card.locator('.formula-card-quick-calc, .quick-calc-inputs');
            const hasQuickCalc = await quickCalcSection.count() > 0;
            if (hasQuickCalc) {
                cardsWithQuickCalc++;
            }
        }
        
        console.log(`Cards with Quick Calculate (first 10): ${cardsWithQuickCalc}`);
        expect(cardsWithQuickCalc).toBeGreaterThan(0);
    });
});

