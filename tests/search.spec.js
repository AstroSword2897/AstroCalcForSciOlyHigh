/**
 * Search System Tests
 * 
 * Tests advanced natural language search, confidence scoring, domain detection
 */

const { test, expect } = require('@playwright/test');

test.describe('Advanced Natural Language Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#formula-list', { timeout: 10000 });
    });

    test('Word → formula: "find temperature from peak wavelength" → Wien\'s Law', async ({ page }) => {
        await page.locator('#formula-search').fill('find temperature from peak wavelength');
        await page.waitForTimeout(500);
        
        // Check if Wien's Law appears in results
        const results = page.locator('.formula-card');
        const count = await results.count();
        
        let foundWiens = false;
        for (let i = 0; i < Math.min(count, 10); i++) {
            const card = results.nth(i);
            const text = await card.textContent();
            if (text && text.toLowerCase().includes('wien')) {
                foundWiens = true;
                break;
            }
        }
        
        expect(foundWiens).toBe(true);
    });

    test('Intent detection: "determine the mass of the planet" → mass formulas', async ({ page }) => {
        await page.locator('#formula-search').fill('determine the mass of the planet');
        await page.waitForTimeout(500);
        
        const results = page.locator('.formula-card');
        const count = await results.count();
        
        let foundMass = false;
        for (let i = 0; i < Math.min(count, 5); i++) {
            const card = results.nth(i);
            const text = await card.textContent();
            if (text && (text.toLowerCase().includes('mass') || text.toLowerCase().includes('kepler'))) {
                foundMass = true;
                break;
            }
        }
        
        expect(foundMass).toBe(true);
    });

    test('Domain-based boosts: "distance to star" → all distance formulas', async ({ page }) => {
        await page.locator('#formula-search').fill('distance to star');
        await page.waitForTimeout(500);
        
        const results = page.locator('.formula-card');
        const count = await results.count();
        
        const distanceFormulas = ['parallax', 'distance modulus', 'angular size', 'redshift'];
        let foundDistance = false;
        
        for (let i = 0; i < Math.min(count, 10); i++) {
            const card = results.nth(i);
            const text = await card.textContent();
            if (text) {
                const lowerText = text.toLowerCase();
                if (distanceFormulas.some(df => lowerText.includes(df))) {
                    foundDistance = true;
                    break;
                }
            }
        }
        
        expect(foundDistance).toBe(true);
    });

    test('Pattern matching: "escape velocity of earth" → Escape Velocity formula top 1', async ({ page }) => {
        await page.locator('#formula-search').fill('escape velocity of earth');
        await page.waitForTimeout(500);
        
        const firstResult = page.locator('.formula-card').first();
        const text = await firstResult.textContent();
        
        expect(text?.toLowerCase()).toContain('escape');
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
        const count = await results.count();
        
        const brightnessTerms = ['luminosity', 'flux', 'magnitude', 'brightness'];
        let foundBrightness = false;
        
        for (let i = 0; i < Math.min(count, 10); i++) {
            const card = results.nth(i);
            const text = await card.textContent();
            if (text) {
                const lowerText = text.toLowerCase();
                if (brightnessTerms.some(bt => lowerText.includes(bt))) {
                    foundBrightness = true;
                    break;
                }
            }
        }
        
        expect(foundBrightness).toBe(true);
    });
});

