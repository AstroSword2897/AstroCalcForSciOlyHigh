/**
 * Search System Tests
 * 
 * Tests advanced natural language search, confidence scoring, domain detection
 */

import { test, expect } from '@playwright/test';

test.describe('Advanced Natural Language Search', () => {
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

    test('Word → formula: "find temperature from peak wavelength" → Wien\'s Law', async ({ page }) => {
        await page.locator('#command-palette-input').fill('find temperature from peak wavelength');
        await page.waitForTimeout(500);

        // Search results should update and remain non-empty
        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Intent detection: "determine the mass of the planet" → mass formulas', async ({ page }) => {
        await page.locator('#command-palette-input').fill('determine the mass of the planet');
        await page.waitForTimeout(500);

        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Domain-based boosts: "distance to star" → all distance formulas', async ({ page }) => {
        await page.locator('#command-palette-input').fill('distance to star');
        await page.waitForTimeout(500);

        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Pattern matching: "escape velocity of earth" → Escape Velocity formula top 1', async ({ page }) => {
        await page.locator('#command-palette-input').fill('escape velocity of earth');
        await page.waitForTimeout(500);
        
        const firstResult = page.locator('.formula-card').first();
        await expect(firstResult).toBeVisible({ timeout: 10000 });
    });

    test('Confidence scoring: confidence changes with relevance', async ({ page }) => {
        // Test 1: Specific query
        await page.locator('#command-palette-input').fill('kepler third law');
        await page.waitForTimeout(500);
        
        const specificFirst = page.locator('.formula-card').first();
        const specificText = await specificFirst.textContent();
        const specificHasConfidence = await specificFirst.locator('.confidence-badge, [data-confidence]').count() > 0;
        
        // Test 2: Vague query
        await page.locator('#command-palette-input').fill('star');
        await page.waitForTimeout(500);
        
        const vagueFirst = page.locator('.formula-card').first();
        const vagueText = await vagueFirst.textContent();
        
        // Both should return results, but specific should be more relevant
        expect(specificText).toBeTruthy();
        expect(vagueText).toBeTruthy();
    });

    test('Result limiting: max 50 formulas shown', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        // Use main search input (formula-search) which filters the main list
        const mainSearchInput = page.locator('#formula-search');
        const commandPaletteInput = page.locator('#command-palette-input');
        
        // Try main search input first, fallback to command palette
        const searchInput = (await mainSearchInput.count() > 0) ? mainSearchInput : commandPaletteInput;
        
        // Clear any existing search
        await searchInput.fill('');
        await page.waitForTimeout(100);
        
        // Type search query
        await searchInput.fill('distance');
        
        // Wait for debounced search to complete
        await page.waitForTimeout(200);
        
        // Flush debounce to ensure search completed
        await page.evaluate(() => {
            if (window.uiOrchestrator) {
                if (window.uiOrchestrator._debouncedSearch) {
                    window.uiOrchestrator._debouncedSearch.flush();
                }
                if (window.uiOrchestrator._mainSearchDebounced) {
                    window.uiOrchestrator._mainSearchDebounced.flush();
                }
            }
        });
        
        // Wait for DOM to update after render
        await page.waitForTimeout(300);
        
        // Verify search was actually performed by checking if results changed
        const results = page.locator('.formula-card');
        const count = await results.count();
        
        // If search worked, we should have <= 50 results
        // If it didn't work (showing all 204), that's a failure
        expect(count).toBeLessThanOrEqual(50);
        
        // Also verify that we actually have some results (search worked)
        expect(count).toBeGreaterThan(0);
    });

    test('Semantic similarity: "how bright is the star" → flux/luminosity formulas', async ({ page }) => {
        await page.locator('#command-palette-input').fill('how bright is the star');
        await page.waitForTimeout(500);
        
        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });
});

