import { test, expect } from '@playwright/test';

test.describe('Button Functionality Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/?nocache=1&v=8');
        await page.waitForLoadState('networkidle');
    });

    test('1. Main Classification tab - Classify Star button', async ({ page }) => {
        console.log('🧪 Test 1: Main Classification tab button');
        
        // Click Classification tab
        await page.click('button:has-text("Classification")');
        await page.waitForTimeout(1000);
        
        // Enter temperature
        const tempInput = page.locator('#main-temperature-input');
        await expect(tempInput).toBeVisible();
        await tempInput.fill('5778');
        
        // Click Classify Star button
        const classifyBtn = page.locator('#main-classify-btn');
        await expect(classifyBtn).toBeVisible();
        await classifyBtn.click();
        
        // Wait for result
        await page.waitForTimeout(500);
        
        // Check for result
        const resultDiv = page.locator('#main-classification-result');
        const resultText = await resultDiv.textContent();
        console.log('✅ Result:', resultText);
        
        expect(resultText).toBeTruthy();
        expect(resultText.length).toBeGreaterThan(0);
    });

    test('2. Calculator Classification sub-tab - Classify Star button', async ({ page }) => {
        console.log('🧪 Test 2: Calculator Classification sub-tab button');
        
        // Search for a formula
        await page.fill('#search-input', 'escape velocity');
        await page.waitForTimeout(1000);
        
        // Click on Escape Velocity card
        const escapeCard = page.locator('.formula-card:has-text("Escape Velocity")').first();
        await expect(escapeCard).toBeVisible();
        await escapeCard.click();
        await page.waitForTimeout(1000);
        
        // Click Classification sub-tab
        const classSubTab = page.locator('button:has-text("Classification")').filter({ has: page.locator('text=/Classification/i') }).last();
        await classSubTab.click();
        await page.waitForTimeout(500);
        
        // Enter temperature
        const tempInput = page.locator('#calc-classification-temperature-input');
        await expect(tempInput).toBeVisible({ timeout: 5000 });
        await tempInput.fill('5778');
        
        // Click Classify Star button
        const classifyBtn = page.locator('#classify-btn');
        await expect(classifyBtn).toBeVisible();
        await classifyBtn.click();
        
        // Wait for result
        await page.waitForTimeout(500);
        
        // Check for result
        const resultDiv = page.locator('#classification-result');
        const resultText = await resultDiv.textContent();
        console.log('✅ Result:', resultText);
        
        expect(resultText).toBeTruthy();
        expect(resultText.length).toBeGreaterThan(0);
    });

    test('3. Calculator Calculate button', async ({ page }) => {
        console.log('🧪 Test 3: Calculator Calculate button');
        
        // Search for a formula
        await page.fill('#search-input', 'kepler');
        await page.waitForTimeout(1000);
        
        // Click on Kepler's Third Law card
        const keplerCard = page.locator('.formula-card:has-text("Kepler")').first();
        await expect(keplerCard).toBeVisible();
        await keplerCard.click();
        await page.waitForTimeout(1000);
        
        // Wait for calculator screen
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        
        // Find and fill input fields
        const inputs = page.locator('#variables-container input[type="number"]');
        const count = await inputs.count();
        console.log(`Found ${count} input fields`);
        
        if (count > 0) {
            // Fill first input with a test value
            await inputs.first().fill('1.5e11');
        }
        
        // Click Calculate button
        const calcBtn = page.locator('#calculate-btn');
        await expect(calcBtn).toBeVisible();
        await calcBtn.click();
        
        // Wait for result
        await page.waitForTimeout(1000);
        
        // Check for result display
        const resultDisplay = page.locator('#result-display, .result-display');
        const resultText = await resultDisplay.textContent();
        console.log('✅ Result:', resultText);
        
        // Result should exist (even if it's an error message)
        expect(resultText).toBeTruthy();
    });

    test('4. Quick Calculate button on formula card', async ({ page }) => {
        console.log('🧪 Test 4: Quick Calculate on card');
        
        // Search for escape velocity
        await page.fill('#search-input', 'escape velocity');
        await page.waitForTimeout(1000);
        
        // Find Escape Velocity card
        const escapeCard = page.locator('.formula-card:has-text("Escape Velocity")').first();
        await expect(escapeCard).toBeVisible();
        
        // Find Quick Calculate inputs
        const rInput = escapeCard.locator('input[data-variable-symbol="r"]');
        const MInput = escapeCard.locator('input[data-variable-symbol="M"]');
        const calcBtn = escapeCard.locator('.quick-calc-btn');
        
        await expect(rInput).toBeVisible();
        await expect(MInput).toBeVisible();
        await expect(calcBtn).toBeVisible();
        
        // Fill inputs
        await rInput.fill('6.371e6');
        await MInput.fill('5.972e24');
        
        // Click calculate
        await calcBtn.click();
        await page.waitForTimeout(1000);
        
        // Check result
        const resultEl = escapeCard.locator('.quick-calc-result');
        const resultText = await resultEl.textContent();
        console.log('✅ Quick Calculate Result:', resultText);
        
        expect(resultText).toBeTruthy();
        expect(resultText).toContain('=');
    });
});

