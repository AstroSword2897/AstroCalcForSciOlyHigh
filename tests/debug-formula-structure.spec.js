import { test, expect } from '@playwright/test';

test.describe('Debug: Formula Structure', () => {
    test('Check formula structure', async ({ page }) => {
        await page.goto('/');
        
        // Wait for initial setup
        await page.waitForTimeout(3000);
        
        // Get the first formula from window.formulas
        const formulaInfo = await page.evaluate(() => {
            if (window.formulas && window.formulas.length > 0) {
                const formula = window.formulas[0];
                return {
                    id: formula.id,
                    name: formula.name,
                    equation: formula.equation,
                    hasVariables: Array.isArray(formula.variables),
                    variablesCount: formula.variables ? formula.variables.length : 0,
                    keys: Object.keys(formula),
                    variableKeys: formula.variables && formula.variables[0] ? Object.keys(formula.variables[0]) : []
                };
            }
            return null;
        });
        
        console.log('Formula structure:', JSON.stringify(formulaInfo, null, 2));
    });
});
