/**
 * Accessibility Tests for AstroCalc
 * Tests keyboard navigation, screen reader compatibility, and input abuse
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
    });

    test('Keyboard navigation works for all interactive elements', async ({ page }) => {
        // Test Tab navigation through main elements
        await page.keyboard.press('Tab');
        
        // Should focus on search input or first formula card
        const focusedElement = await page.locator(':focus');
        expect(await focusedElement.count()).toBeGreaterThan(0);
        
        // Test arrow key navigation in formula cards
        const formulaCards = page.locator('.formula-card');
        if (await formulaCards.count() > 0) {
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowUp');
            
            // Should still have focus on formula cards
            const stillFocused = await page.locator(':focus');
            expect(await stillFocused.count()).toBeGreaterThan(0);
        }
    });

    test('Screen reader attributes are present', async ({ page }) => {
        // Check for proper ARIA labels
        const searchInput = page.locator('#command-palette-input');
        await expect(searchInput).toHaveAttribute('aria-label');
        
        const formulaCards = page.locator('.formula-card');
        const cardCount = await formulaCards.count();
        
        for (let i = 0; i < Math.min(cardCount, 5); i++) {
            const card = formulaCards.nth(i);
            await expect(card).toHaveAttribute('role', 'button');
            await expect(card).toHaveAttribute('tabindex', '0');
        }
    });

    test('High contrast mode works', async ({ page }) => {
        // Toggle accessibility mode
        const accessibilityToggle = page.locator('.accessibility-toggle');
        if (await accessibilityToggle.count() > 0) {
            await accessibilityToggle.click();
            
            // Check for reduced motion
            const body = page.locator('body');
            await expect(body).toHaveClass(/reduced-motion/);
        }
    });

    test('Focus indicators are visible', async ({ page }) => {
        const formulaCards = page.locator('.formula-card');
        const cardCount = await formulaCards.count();
        
        if (cardCount > 0) {
            const firstCard = formulaCards.first();
            
            // Focus the first card
            await firstCard.focus();
            
            // Should show focus indicator
            await expect(firstCard).toHaveCSS('outline', /rgb\(102, 126, 234\)/);
        }
    });

    test('Input abuse handling', async ({ page }) => {
        const searchInput = page.locator('#command-palette-input');
        
        // Test XSS protection
        await searchInput.fill('<script>alert("xss")</script>');
        await page.waitForTimeout(500);
        
        // Should sanitize input
        const value = await searchInput.inputValue();
        expect(value).not.toContain('<script>');
        
        // Test rapid input changes
        const rapidInputs = ['a', 'ab', 'abc', 'abcd', 'abcde'];
        for (const input of rapidInputs) {
            await searchInput.fill(input);
            await page.waitForTimeout(50);
        }
        
        // Should still be responsive
        const finalValue = await searchInput.inputValue();
        expect(finalValue.length).toBeGreaterThan(0);
    });
});
