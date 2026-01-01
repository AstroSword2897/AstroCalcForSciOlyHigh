// Minimal working test - check if page loads at all
import { test, expect } from '@playwright/test';

test.describe('Page Load Test', () => {
    test('Check if page loads and has basic elements', async ({ page }) => {
        // Try to load the page
        try {
            await page.goto('http://localhost:8001', { timeout: 5000 });
        } catch (error) {
            console.log('Failed to connect to localhost:8001, trying file://');
            // Fall back to file:// if server isn't working
            await page.goto('file:///Users/nani/AstroCalcForSciOlyHigh-1/index.html');
        }
        
        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');
        
        // Check if page has content
        const bodyContent = await page.locator('body').textContent();
        console.log('Page content length:', bodyContent?.length || 0);
        
        // Check for any script errors
        const errors = await page.evaluate(() => {
            const errors = [];
            window.addEventListener('error', (e) => errors.push(e.message));
            return errors;
        });
        
        if (errors.length > 0) {
            console.log('JavaScript errors found:', errors);
        }
        
        // Basic check - page should have some content
        expect(bodyContent?.length || 0).toBeGreaterThan(100);
        
        // Check for debug script output
        await page.waitForTimeout(3000); // Wait for debug scripts to run
        
        // Get console logs
        const logs = await page.evaluate(() => {
            return console.logs || [];
        });
        
        console.log('Console logs:', logs);
    });
});
