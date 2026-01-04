import { test, expect } from '@playwright/test';

test.describe('Debug: Formula Card Click', () => {
    test('Check formula card click behavior', async ({ page }) => {
        await page.goto('/');
        
        // Wait for initial setup
        await page.waitForTimeout(3000);
        
        // Check if formula cards are rendered
        const cardCount = await page.locator('.formula-card').count();
        console.log(`Formula cards found: ${cardCount}`);
        
        if (cardCount > 0) {
            // Get first formula card
            const firstCard = page.locator('.formula-card').first();
            
            // Check card details
            const cardText = await firstCard.textContent();
            console.log(`First card text: ${cardText}`);
            
            // Check if card has data attributes
            const formulaId = await firstCard.getAttribute('data-formula-id');
            console.log(`Formula ID: ${formulaId}`);
            
            // Try clicking the card
            console.log('Clicking formula card...');
            await firstCard.click();
            await page.waitForTimeout(2000);
            
            // Check if calculator screen appeared
            const calculatorScreenVisible = await page.locator('#input-screen').isVisible();
            console.log(`Calculator screen visible: ${calculatorScreenVisible}`);
            
            // Check if calculate button is visible
            const calculateBtnVisible = await page.locator('#calculate-btn').isVisible();
            console.log(`Calculate button visible: ${calculateBtnVisible}`);
            
            // Check current screen states
            const formulaSelectionVisible = await page.locator('#formula-selection').isVisible();
            console.log(`Formula selection visible: ${formulaSelectionVisible}`);
            
            // Check for any calculator inputs
            const inputCount = await page.locator('#calculator-screen input').count();
            console.log(`Calculator inputs found: ${inputCount}`);
        } else {
            console.log('No formula cards found!');
        }
    });
});
