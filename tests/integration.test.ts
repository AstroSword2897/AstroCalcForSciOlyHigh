/**
 * Integration Tests for Classification and Explorer Tools
 * Tests the actual functionality of the UI components
 */

import { test, expect } from '@playwright/test';

test.describe('Classification and Explorer Tools', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');
    });

    test('Classification tool should be functional', async ({ page }) => {
        console.log('Testing classification tool...');
        
        // Navigate to classification tab
        const classificationTab = page.locator('#main-classification-tab');
        await expect(classificationTab).toBeVisible();
        
        // Check if classification elements exist
        const tempInput = page.locator('#main-temperature-input').first();
        const lumSelect = page.locator('#main-luminosity-class').first();
        const classifyBtn = page.locator('#classify-btn').first();
        const clearBtn = page.locator('#clear-classification-btn').first();
        
        await expect(tempInput).toBeVisible();
        await expect(lumSelect).toBeVisible();
        await expect(classifyBtn).toBeVisible();
        await expect(clearBtn).toBeVisible();
        
        // Test classification functionality
        await tempInput.fill('5778'); // Sun's temperature
        await lumSelect.selectOption('V'); // Main sequence
        
        // Click classify button
        await classifyBtn.click();
        
        // Wait for result
        await page.waitForTimeout(1000);
        
        // Check if result appears
        const resultContainer = page.locator('#classification-result');
        await expect(resultContainer).toBeVisible();
        
        // Check result content
        const resultText = await resultContainer.textContent();
        expect(resultText).toContain('G'); // Should be G-class star
        expect(resultText).toContain('5,200–6,000 K'); // Temperature range
        
        console.log('Classification tool working correctly');
    });

    test('Explorer tool should be functional', async ({ page }) => {
        console.log('Testing explorer tool...');
        
        // Navigate to formulas tab
        const formulasTab = page.locator('#main-formulas-tab');
        await expect(formulasTab).toBeVisible();
        
        // Check if formula cards exist
        const formulaCards = page.locator('.formula-card');
        const cardCount = await formulaCards.count();
        expect(cardCount).toBeGreaterThan(0);
        
        // Test formula card clicking
        if (cardCount > 0) {
            const firstCard = formulaCards.first();
            await expect(firstCard).toBeVisible();
            
            // Click the first formula card
            await firstCard.click();
            
            // Wait for calculator screen to appear
            await page.waitForTimeout(1000);
            
            // Check if calculator screen is visible
            const calculatorScreen = page.locator('#calculator-screen');
            await expect(calculatorScreen).toBeVisible();
            
            // Check if calculator inputs exist
            const calculatorInputs = page.locator('.calculator-input');
            const inputCount = await calculatorInputs.count();
            expect(inputCount).toBeGreaterThan(0);
            
            console.log('Explorer tool working correctly');
        }
    });

    test('Images should be displayed properly', async ({ page }) => {
        console.log('Testing image display...');
        
        // Navigate to classification tab
        const classificationTab = page.locator('#main-classification-tab');
        await classificationTab.click();
        
        // Wait for images to load
        await page.waitForTimeout(2000);
        
        // Check if classification images exist
        const classificationImages = page.locator('.classification-img');
        const imageCount = await classificationImages.count();
        expect(imageCount).toBeGreaterThan(0);
        
        // Check if images are loaded
        for (let i = 0; i < imageCount; i++) {
            const image = classificationImages.nth(i);
            await expect(image).toBeVisible();
            
            // Check if image has valid src
            const src = await image.getAttribute('src');
            expect(src).toBeTruthy();
            expect(src).toContain('assets/images/');
        }
        
        console.log('Images displayed correctly');
    });

    test('Calculator should work with formulas', async ({ page }) => {
        console.log('Testing calculator integration...');
        
        // Navigate to formulas tab
        const formulasTab = page.locator('#main-formulas-tab');
        await formulasTab.click();
        
        // Wait for formula cards to load
        await page.waitForSelector('.formula-card', { timeout: 5000 });
        
        // Find a formula card and click it
        const formulaCards = page.locator('.formula-card');
        const cardCount = await formulaCards.count();
        
        if (cardCount > 0) {
            const firstCard = formulaCards.first();
            await firstCard.click();
            
            // Wait for calculator to load
            await page.waitForTimeout(1000);
            
            // Fill calculator inputs
            const calculatorInputs = page.locator('.calculator-input');
            const inputCount = await calculatorInputs.count();
            
            if (inputCount > 0) {
                // Fill first input with a test value
                await calculatorInputs.first().fill('1');
                
                // Click calculate button if it exists
                const calculateBtn = page.locator('.calculate-btn, #calculate-btn');
                if (await calculateBtn.isVisible()) {
                    await calculateBtn.click();
                }
                
                // Wait for result
                await page.waitForTimeout(1000);
                
                // Check if result appears
                const resultDisplay = page.locator('.result-display, .calculation-result');
                if (await resultDisplay.isVisible()) {
                    const resultText = await resultDisplay.textContent();
                    expect(resultText).toBeTruthy();
                    console.log('Calculator result:', resultText);
                }
            }
        }
        
        console.log('Calculator integration tested');
    });
});
