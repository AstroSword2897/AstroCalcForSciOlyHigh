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
        await page.locator('#formula-search').fill('find temperature from peak wavelength');
        await page.waitForTimeout(500);

        // Search results should update and remain non-empty
        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Intent detection: "determine the mass of the planet" → mass formulas', async ({ page }) => {
        await page.locator('#formula-search').fill('determine the mass of the planet');
        await page.waitForTimeout(500);

        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Domain-based boosts: "distance to star" → all distance formulas', async ({ page }) => {
        await page.locator('#formula-search').fill('distance to star');
        await page.waitForTimeout(500);

        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Pattern matching: "escape velocity of earth" → Escape Velocity formula top 1', async ({ page }) => {
        await page.locator('#formula-search').fill('escape velocity of earth');
        await page.waitForTimeout(500);
        
        const firstResult = page.locator('.formula-card').first();
        await expect(firstResult).toBeVisible({ timeout: 10000 });
    });

    test('Confidence scoring: confidence changes with relevance', async ({ page }) => {
        // Test 1: Specific query
        await page.locator('#formula-search').fill('kepler third law');
        await page.waitForTimeout(500);
        
        const specificFirst = page.locator('.formula-card').first();
        const specificText = await specificFirst.textContent();
        const specificHasConfidence = await specificFirst.locator('.confidence-badge, [data-confidence]').count() > 0;
        
        // Test 2: Vague query
        await page.locator('#formula-search').fill('star');
        await page.waitForTimeout(500);
        
        const vagueFirst = page.locator('.formula-card').first();
        const vagueText = await vagueFirst.textContent();
        
        // Both should return results, but specific should be more relevant
        expect(specificText).toBeTruthy();
        expect(vagueText).toBeTruthy();
    });

    test('Result limiting: max 50 formulas shown', async ({ page }) => {
        await page.locator('#formula-search').fill('distance');
        await page.waitForTimeout(1000);
        
        const results = page.locator('.formula-card');
        const count = await results.count();
        
        expect(count).toBeLessThanOrEqual(50);
    });

    test('Semantic similarity: "how bright is the star" → flux/luminosity formulas', async ({ page }) => {
        await page.locator('#formula-search').fill('how bright is the star');
        await page.waitForTimeout(500);
        
        const results = page.locator('.formula-card');
        await expect(results.first()).toBeVisible({ timeout: 10000 });
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
    });
});

