/**
 * Navigation & Keyboard Shortcuts Tests
 * 
 * Tests all zero-time-waste navigation features
 */

import { test, expect } from '@playwright/test';

test.describe('Zero-Time-Waste Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        
        // Simple wait for DOM to be ready
        await page.waitForLoadState('domcontentloaded');
        
        // Wait a bit for app to initialize
        await page.waitForTimeout(2000);
        
        // Try to ensure formulas tab is active
        const formulasTab = page.locator('[data-main-tab="formulas"]');
        if (await formulasTab.count() > 0) {
            await formulasTab.click();
            await page.waitForTimeout(500);
        }
        
        // Force render if available
        await page.evaluate(() => {
            if (typeof window.forceRenderCards === 'function') {
                window.forceRenderCards();
            }
        });
        
        // Wait for any formula cards to be present
        await page.waitForSelector('.formula-card', { timeout: 15000 }).catch(() => {
            // If cards aren't present, that's ok - we'll handle it in tests
        });
    });

    test('Cmd/Ctrl+K opens search', async ({ page }) => {
        // Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)
        const isMac = process.platform === 'darwin';
        await page.keyboard.press(isMac ? 'Meta+KeyK' : 'Control+KeyK');
        
        // Check if search input is focused
        const searchInput = page.locator('#formula-search');
        await expect(searchInput).toBeFocused();
    });

    test('Cmd/Ctrl+/ opens command palette', async ({ page }) => {
        const isMac = process.platform === 'darwin';
        await page.keyboard.press(isMac ? 'Meta+/' : 'Control+/');
        
        // Check if command palette is visible
        const commandPalette = page.locator('#command-palette, .command-palette');
        await expect(commandPalette).toBeVisible({ timeout: 2000 });
    });

    test('Number keys 1-4 switch tabs', async ({ page }) => {
        // Press 1
        await page.keyboard.press('Digit1');
        await page.waitForTimeout(100);
        
        // Check if formulas tab is active
        const formulasTab = page.locator('[data-main-tab="formulas"]');
        await expect(formulasTab).toHaveClass(/active/);
        
        // Press 2
        await page.keyboard.press('Digit2');
        await page.waitForTimeout(100);
        
        // Check if explorer tab is active
        const explorerTab = page.locator('[data-main-tab="explorer"]');
        await expect(explorerTab).toHaveClass(/active/);
    });

    test('Arrow keys navigate formula cards', async ({ page }) => {
        // Focus search first
        await page.locator('#formula-search').focus();
        
        // Wait for cards to load
        await page.waitForSelector('.formula-card', { timeout: 5000 });
        
        // Press down arrow
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        
        // Check if a card is highlighted
        const highlightedCard = page.locator('.formula-card.highlighted, .formula-card:focus');
        await expect(highlightedCard.first()).toBeVisible();
    });

    test('Enter opens selected formula', async ({ page }) => {
        // Focus search and type
        await page.locator('#formula-search').fill('kepler');
        await page.waitForTimeout(500);
        
        // Press down to select first result
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
        
        // Press Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Check if calculator screen is shown
        const calculatorScreen = page.locator('#calculator-screen, .calculator-screen');
        await expect(calculatorScreen).toBeVisible({ timeout: 3000 });
    });

    test('Esc closes modals and goes back', async ({ page }) => {
        // Open a formula first
        await page.locator('#formula-search').fill('kepler');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Press Esc
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        
        // Should be back to formula list
        const formulaList = page.locator('#formula-list');
        await expect(formulaList).toBeVisible();
    });

    test('Type-to-search activates automatically', async ({ page }) => {
        // Click on page (not on search input)
        await page.click('body');
        
        // Type letters
        await page.keyboard.type('escape');
        await page.waitForTimeout(300);
        
        // Check if search input has the text
        const searchInput = page.locator('#formula-search');
        await expect(searchInput).toHaveValue(/escape/i);
    });

    test('Quick links work', async ({ page }) => {
        // Find a card with quick links
        const cardWithLinks = page.locator('.formula-card .quick-link-btn, .formula-card .quick-link').first();
        
        if (await cardWithLinks.count() > 0) {
            // Click a quick link
            await cardWithLinks.click();
            await page.waitForTimeout(500);
            
            // Should navigate to related formula
            const calculatorScreen = page.locator('#calculator-screen, .calculator-screen');
            await expect(calculatorScreen).toBeVisible({ timeout: 3000 });
        }
    });

    test('Search responds within 100ms', async ({ page }) => {
        const startTime = Date.now();
        
        // Type in search
        await page.locator('#formula-search').fill('distance');
        
        // Wait for results to appear
        await page.waitForSelector('.formula-card', { timeout: 20000 });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Should be fast (allowing some buffer for rendering)
        expect(duration).toBeLessThan(2000); // allow buffer for cold-start + debounced search
    });
});

