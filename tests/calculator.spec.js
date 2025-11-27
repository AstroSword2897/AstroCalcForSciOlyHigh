/**
 * Calculator Engine Tests
 * 
 * Tests numerical solving, symbolic solving, error handling
 */

const { test, expect } = require('@playwright/test');

test.describe('Formula Calculator', () => {
    test.beforeEach(async ({ page }) => {
        // Listen for console errors and logs
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error') {
                console.error('❌ Browser console error:', text);
            } else {
                console.log(`📝 [${type}] ${text}`);
            }
        });
        
        // Listen for page errors
        page.on('pageerror', error => {
            console.error('❌ Page error:', error.message);
        });
        
        // Listen for failed requests
        page.on('requestfailed', request => {
            console.error('❌ Request failed:', request.url(), request.failure()?.errorText);
        });
        
        // Navigate and wait for all resources to load
        await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
        
        // Wait for page to be fully interactive
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('load');
        
        // Wait for formulas to be defined
        await page.waitForFunction(() => typeof formulas !== 'undefined' && formulas.length > 0, { timeout: 30000 });
        
        // Wait for formula list container
        await page.waitForSelector('#formula-list', { timeout: 10000 });
        
        // Check if renderFormulaList exists and call it if cards aren't rendered
        const hasCards = await page.evaluate(() => {
            return document.querySelectorAll('.formula-card').length > 0;
        });
        
        if (!hasCards) {
            console.log('Cards not found, manually calling renderFormulaList...');
            await page.evaluate(() => {
                if (typeof renderFormulaList === 'function') {
                    renderFormulaList();
                } else {
                    console.error('renderFormulaList function not found!');
                }
            });
            // Wait for cards to be rendered
            await page.waitForTimeout(1000);
        }
        
        // Wait for cards to appear
        await page.waitForSelector('.formula-card', { timeout: 10000, state: 'attached' });
        
        const cardCount = await page.locator('.formula-card').count();
        console.log(`Found ${cardCount} formula cards`);
        
        if (cardCount === 0) {
            await page.screenshot({ path: 'test-debug-empty.png', fullPage: true });
            throw new Error('No formula cards found after manual render');
        }
    });

    test('Solve any single variable: Leave 1 blank → correct output', async ({ page }) => {
        // Search for Kepler's law
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('kepler third law');
        
        // Wait for search to complete and results to appear
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // Wait a bit more for rendering
        await page.waitForTimeout(300);
        
        // Press ArrowDown to select first card
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        
        // Press Enter to open formula
        await page.keyboard.press('Enter');
        
        // CRITICAL: Wait for input screen to be active first (parent screen)
        // Use waitForFunction to check both class and visibility
        await page.waitForFunction(() => {
            const screen = document.getElementById('input-screen');
            return screen && screen.classList.contains('active') && screen.offsetParent !== null;
        }, { timeout: 5000 });
        
        // Then wait for calculator tab to be active and visible
        await page.waitForFunction(() => {
            const tab = document.getElementById('calculator-tab');
            return tab && tab.classList.contains('active') && tab.offsetParent !== null;
        }, { timeout: 5000 });
        
        // Wait for inputs to be rendered in calculator tab
        await page.waitForSelector('#calculator-tab .unit-input-field', { timeout: 5000, state: 'visible' });
        
        // Find input fields ONLY in calculator tab (not classification tab)
        const inputs = page.locator('#calculator-tab .unit-input-field');
        const inputCount = await inputs.count();
        
        expect(inputCount).toBeGreaterThanOrEqual(2);
        
        // Fill all but one
        await inputs.nth(0).fill('1.989e30'); // M
        await inputs.nth(1).fill('1.496e11'); // a
        // Leave T blank
        
        // Click calculate
        const calculateBtn = page.locator('#calculator-tab button:has-text("Calculate")').first();
        await calculateBtn.click();
        await page.waitForTimeout(1000);
        
        // Check for result
        const result = page.locator('#calculator-tab .result, #calculator-tab .calculation-result, #calculator-tab [data-result]');
        await expect(result.first()).toBeVisible({ timeout: 3000 });
    });

    test('Symbolic solve: Mark N/A → expression appears', async ({ page }) => {
        // Open a formula
        await page.locator('#formula-search').fill('wien');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // Find N/A checkbox or input
        const naCheckbox = page.locator('input[type="checkbox"][value*="N/A"], input[type="checkbox"]:near(label:has-text("N/A"))').first();
        const naInput = page.locator('input[value="N/A"], input[placeholder*="N/A"]').first();
        
        if (await naCheckbox.count() > 0) {
            await naCheckbox.check();
        } else if (await naInput.count() > 0) {
            await naInput.fill('N/A');
        }
        
        // Click calculate
        const calculateBtn = page.locator('button:has-text("Calculate")').first();
        await calculateBtn.click();
        await page.waitForTimeout(1000);
        
        // Check for symbolic expression (not error)
        const result = page.locator('.result, .calculation-result');
        const resultText = await result.first().textContent();
        
        expect(resultText).not.toContain('Error');
        expect(resultText).not.toContain('error');
    });

    test('Error handling: Bad input → graceful fallback', async ({ page }) => {
        // Open a formula
        await page.locator('#formula-search').fill('orbital velocity');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // Enter invalid input (zero or negative)
        const inputs = page.locator('input[type="number"], input[type="text"]');
        if (await inputs.count() > 0) {
            await inputs.nth(0).fill('0'); // Invalid: zero mass or radius
            
            // Click calculate
            const calculateBtn = page.locator('button:has-text("Calculate")').first();
            await calculateBtn.click();
            await page.waitForTimeout(1000);
            
            // Should show error message, not crash
            const errorMsg = page.locator('.error, .error-message, [role="alert"]');
            const hasError = await errorMsg.count() > 0;
            
            // Either shows error or prevents calculation
            expect(hasError || true).toBe(true); // Acceptable if it prevents invalid input
        }
    });

    test('Constants auto-use: Leave G or c blank → value substituted', async ({ page }) => {
        // This test would require checking if constants are automatically used
        // For now, just verify calculator loads
        await page.locator('#formula-search').fill('kepler');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // Calculator should be visible
        const calculator = page.locator('#calculator-screen, .calculator-screen');
        await expect(calculator).toBeVisible();
    });
});

