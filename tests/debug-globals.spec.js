import { test, expect } from '@playwright/test';

test.describe('Debug: Check Global Dependencies', () => {
    test('Check what globals are loaded', async ({ page }) => {
        await page.goto('/');
        
        // Wait a bit for scripts to load
        await page.waitForTimeout(2000);
        
        // Check what globals are available
        const globals = await page.evaluate(() => {
            return {
                formulas: typeof window.formulas,
                FormulaCalculator: typeof window.FormulaCalculator,
                UnitConverter: typeof window.UnitConverter,
                ExpressionParser: typeof window.ExpressionParser,
                SafeMathEvaluator: typeof window.SafeMathEvaluator,
                uiOrchestrator: typeof window.uiOrchestrator,
                selectFormula: typeof window.selectFormula,
                performCalculation: typeof window.performCalculation
            };
        });
        
        console.log('Loaded globals:', globals);
        
        // Check if formula list is visible
        const formulaListVisible = await page.locator('#formula-list').isVisible();
        console.log('Formula list visible:', formulaListVisible);
        
        // Check if command palette input exists
        const commandPaletteExists = await page.locator('#command-palette-input').isVisible();
        console.log('Command palette input exists:', commandPaletteExists);
    });
});
