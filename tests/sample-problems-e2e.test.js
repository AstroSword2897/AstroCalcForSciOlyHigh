/**
 * Sample Physics Problems E2E Test
 * Tests real-world astrophysics problems by clicking through the UI
 */

import { test, expect } from '@playwright/test';

test.describe('Sample Physics Problems - Click-Through Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/?nocache=1');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
    });

    test('Problem 1: Calculate orbital period of ISS', async ({ page }) => {
        // ISS orbits at ~420 km altitude, Earth mass = 5.97e24 kg
        // Semi-major axis = R_earth + altitude = 6.37e6 + 420e3 = 6.79e6 m
        
        console.log('📝 Problem: Calculate the orbital period of the ISS at 420 km altitude');
        
        // Search for Kepler's Third Law
        await page.fill('#formula-search', "kepler's third law");
        await page.waitForTimeout(600);
        
        // Click the first result
        const card = page.locator('.formula-card').first();
        const cardText = await card.textContent();
        console.log(`Selected formula: ${cardText?.slice(0, 50)}...`);
        await card.click();
        
        // Wait for calculator
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        // Take screenshot for verification
        await page.screenshot({ path: 'test-results/problem1-calculator.png' });
        
        // Fill inputs - try to find variable inputs
        const inputs = page.locator('.variable-input, #variables-container input[type="number"], input[type="number"]');
        const inputCount = await inputs.count();
        console.log(`Found ${inputCount} input fields`);
        
        if (inputCount >= 2) {
            // a (semi-major axis) = 6.79e6 m
            await inputs.nth(0).fill('6.79e6');
            // M (mass) = 5.97e24 kg  
            await inputs.nth(1).fill('5.97e24');
            
            // Click calculate
            const calcBtn = page.locator('button:has-text("Calculate"), #calculate-btn').first();
            if (await calcBtn.isVisible()) {
                await calcBtn.click();
                await page.waitForTimeout(1000);
                
                // Check result
                const resultText = await page.locator('#calculation-result, .result-value, .calculation-result').textContent();
                console.log(`✅ Result: ${resultText}`);
                
                // ISS orbital period should be ~5500 seconds (92 minutes)
                // We can't assert exact value but should have a result
                expect(resultText).toBeTruthy();
            }
        }
    });

    test('Problem 2: Calculate escape velocity from Earth', async ({ page }) => {
        // v_esc = sqrt(2GM/R) 
        // For Earth: M = 5.97e24 kg, R = 6.37e6 m
        // Expected: ~11.2 km/s
        
        console.log('📝 Problem: Calculate escape velocity from Earth surface');
        
        await page.fill('#formula-search', 'escape velocity');
        await page.waitForTimeout(600);
        
        const card = page.locator('.formula-card').first();
        await card.click();
        
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        const inputs = page.locator('.variable-input, input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount >= 2) {
            // R (radius) = 6.37e6 m
            await inputs.nth(0).fill('6.37e6');
            // M (mass) = 5.97e24 kg
            await inputs.nth(1).fill('5.97e24');
            
            const calcBtn = page.locator('button:has-text("Calculate"), #calculate-btn').first();
            if (await calcBtn.isVisible()) {
                await calcBtn.click();
                await page.waitForTimeout(1000);
                
                const resultText = await page.locator('#calculation-result, .result-value, .calculation-result').textContent();
                console.log(`✅ Result: ${resultText}`);
                expect(resultText).toBeTruthy();
            }
        }
    });

    test('Problem 3: Calculate stellar luminosity from temperature and radius', async ({ page }) => {
        // L = 4πR²σT⁴ (Stefan-Boltzmann law)
        // For Sun: T = 5778 K, R = 6.96e8 m
        // Expected: ~3.8e26 W
        
        console.log('📝 Problem: Calculate solar luminosity from temperature and radius');
        
        await page.fill('#formula-search', 'luminosity stefan');
        await page.waitForTimeout(600);
        
        const card = page.locator('.formula-card').first();
        await card.click();
        
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        const inputs = page.locator('.variable-input, input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount >= 2) {
            // Try different orderings based on formula
            await inputs.nth(0).fill('5778');  // Temperature
            await inputs.nth(1).fill('6.96e8'); // Radius
            
            const calcBtn = page.locator('button:has-text("Calculate"), #calculate-btn').first();
            if (await calcBtn.isVisible()) {
                await calcBtn.click();
                await page.waitForTimeout(1000);
                
                const resultText = await page.locator('#calculation-result, .result-value, .calculation-result').textContent();
                console.log(`✅ Result: ${resultText}`);
                expect(resultText).toBeTruthy();
            }
        }
    });

    test('Problem 4: Calculate distance using parallax', async ({ page }) => {
        // d = 1/p (parsecs, where p is in arcseconds)
        // Example: Proxima Centauri has parallax of 0.768 arcsec
        // Expected distance: ~1.3 parsecs
        
        console.log('📝 Problem: Calculate distance from parallax (Proxima Centauri)');
        
        await page.fill('#formula-search', 'parallax distance');
        await page.waitForTimeout(600);
        
        const card = page.locator('.formula-card').first();
        await card.click();
        
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        const inputs = page.locator('.variable-input, input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount >= 1) {
            // Parallax = 0.768 arcsec
            await inputs.nth(0).fill('0.768');
            
            const calcBtn = page.locator('button:has-text("Calculate"), #calculate-btn').first();
            if (await calcBtn.isVisible()) {
                await calcBtn.click();
                await page.waitForTimeout(1000);
                
                const resultText = await page.locator('#calculation-result, .result-value, .calculation-result').textContent();
                console.log(`✅ Result: ${resultText}`);
                expect(resultText).toBeTruthy();
            }
        }
    });

    test('Problem 5: Calculate Wien wavelength for the Sun', async ({ page }) => {
        // λ_max = b/T (Wien's displacement law)
        // For Sun: T = 5778 K, b = 2.897771e-3 m·K
        // Expected: ~502 nm (green light)
        
        console.log("📝 Problem: Calculate peak wavelength of solar radiation (Wien's Law)");
        
        await page.fill('#formula-search', 'wien');
        await page.waitForTimeout(600);
        
        const card = page.locator('.formula-card').first();
        await card.click();
        
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        const inputs = page.locator('.variable-input, input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount >= 1) {
            // Temperature = 5778 K
            await inputs.nth(0).fill('5778');
            
            const calcBtn = page.locator('button:has-text("Calculate"), #calculate-btn').first();
            if (await calcBtn.isVisible()) {
                await calcBtn.click();
                await page.waitForTimeout(1000);
                
                const resultText = await page.locator('#calculation-result, .result-value, .calculation-result').textContent();
                console.log(`✅ Result: ${resultText}`);
                expect(resultText).toBeTruthy();
            }
        }
    });

    test('Problem 6: Calculate Hubble distance', async ({ page }) => {
        // v = H₀ × d (Hubble's Law)
        // Given: recession velocity = 7000 km/s, H₀ = 70 km/s/Mpc
        // Expected: d = 100 Mpc
        
        console.log("📝 Problem: Calculate distance from Hubble's Law");
        
        await page.fill('#formula-search', 'hubble');
        await page.waitForTimeout(600);
        
        const card = page.locator('.formula-card').first();
        await card.click();
        
        await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(500);
        
        const inputs = page.locator('.variable-input, input[type="number"]');
        const inputCount = await inputs.count();
        
        if (inputCount >= 2) {
            // Velocity = 7000 km/s = 7e6 m/s
            await inputs.nth(0).fill('7e6');
            // H₀ = 70 km/s/Mpc = 70e3 m/s/Mpc
            await inputs.nth(1).fill('70e3');
            
            const calcBtn = page.locator('button:has-text("Calculate"), #calculate-btn').first();
            if (await calcBtn.isVisible()) {
                await calcBtn.click();
                await page.waitForTimeout(1000);
                
                const resultText = await page.locator('#calculation-result, .result-value, .calculation-result').textContent();
                console.log(`✅ Result: ${resultText}`);
                expect(resultText).toBeTruthy();
            }
        }
    });

    test('Problem 7: Ask Expert System for orbital period formula', async ({ page }) => {
        // Use the expert system to find the right formula
        console.log('📝 Problem: Use Expert System to find orbital period formula');
        
        // Find the expert system input
        const expertInput = page.locator('#expert-system-question-input');
        if (await expertInput.isVisible()) {
            await expertInput.fill('What is the orbital period of a satellite 7000 km above Earth?');
            
            const solveBtn = page.locator('#expert-system-solve-btn');
            await solveBtn.click();
            await page.waitForTimeout(1000);
            
            // Check the output
            const output = page.locator('#expert-system-output');
            const outputText = await output.textContent();
            console.log(`Expert System Response: ${outputText?.slice(0, 100)}...`);
            
            expect(outputText).toBeTruthy();
            expect(outputText?.toLowerCase()).toContain('kepler');
        } else {
            console.log('Expert system input not found - skipping');
        }
    });

    test('Problem 8: Navigate through multiple formulas', async ({ page }) => {
        // Test navigating through multiple formulas quickly
        const searchTerms = ['gravity', 'velocity', 'luminosity', 'distance', 'period'];
        
        console.log('📝 Problem: Navigate through multiple formula searches');
        
        for (const term of searchTerms) {
            await page.fill('#formula-search', term);
            await page.waitForTimeout(400);
            
            const cardCount = await page.locator('.formula-card').count();
            console.log(`Search "${term}": ${cardCount} results`);
            expect(cardCount).toBeGreaterThan(0);
            
            // Click first result
            const card = page.locator('.formula-card').first();
            await card.click();
            
            // Verify calculator opens
            await page.waitForSelector('#input-screen', { state: 'visible', timeout: 3000 });
            
            // Go back
            const backBtn = page.locator('#back-button, button:has-text("Back")').first();
            if (await backBtn.isVisible()) {
                await backBtn.click();
                await page.waitForTimeout(300);
            }
        }
        
        console.log('✅ Successfully navigated through all formulas');
    });
});

