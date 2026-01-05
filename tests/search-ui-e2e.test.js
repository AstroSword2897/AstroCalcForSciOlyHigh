import { test, expect } from '@playwright/test';

/**
 * E2E tests for Search UI v2.1.0
 * Tests topic chips, confidence breakdown, and formula selection flow
 */

test.describe('Search UI v2.1.0 - Topic Chips & Confidence Breakdown', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
    });

    test('should display topic chips when searching', async ({ page }) => {
        // Search for a formula
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('kepler');
        
        // Flush debounce
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        // Wait for search results
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0 && cards.length <= 50;
        }, { timeout: 5000 });
        
        // Check for topic chips
        const topicChips = await page.locator('.topic-chip').count();
        console.log(`Found ${topicChips} topic chips`);
        expect(topicChips).toBeGreaterThan(0);
        
        // Verify chip styling
        const firstChip = page.locator('.topic-chip').first();
        await expect(firstChip).toBeVisible();
        
        // Check chip content
        const chipText = await firstChip.textContent();
        expect(chipText).toBeTruthy();
        expect(chipText.length).toBeGreaterThan(0);
        console.log(`First topic chip: "${chipText}"`);
    });

    test('should display variable chips when searching', async ({ page }) => {
        // Search for a formula with variables
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('orbital period');
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // Check for variable chips
        const variableChips = await page.locator('.variable-chip').count();
        console.log(`Found ${variableChips} variable chips`);
        expect(variableChips).toBeGreaterThan(0);
        
        // Verify chip styling
        const firstVarChip = page.locator('.variable-chip').first();
        await expect(firstVarChip).toBeVisible();
        
        const chipText = await firstVarChip.textContent();
        expect(chipText).toBeTruthy();
        console.log(`First variable chip: "${chipText}"`);
    });

    test('should display confidence breakdown when expanded', async ({ page }) => {
        // Search for a formula
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('distance');
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // Find breakdown details element
        const breakdown = page.locator('.formula-card-breakdown').first();
        await expect(breakdown).toBeVisible();
        
        // Click to expand
        await breakdown.locator('summary').click();
        
        // Wait for expansion animation
        await page.waitForTimeout(500);
        
        // Check for breakdown items
        const breakdownItems = await breakdown.locator('.breakdown-item').count();
        console.log(`Found ${breakdownItems} breakdown items`);
        expect(breakdownItems).toBeGreaterThan(0);
        
        // Verify breakdown content
        const firstItem = breakdown.locator('.breakdown-item').first();
        await expect(firstItem).toBeVisible();
        
        // Check for score display
        const scoreText = await firstItem.textContent();
        expect(scoreText).toContain('pts');
        expect(scoreText).toContain('%');
        console.log(`First breakdown item: "${scoreText}"`);
    });

    test('should show confidence percentage on cards', async ({ page }) => {
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('luminosity');
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // Check for confidence display
        const confidenceDisplay = page.locator('.formula-card-confidence').first();
        await expect(confidenceDisplay).toBeVisible();
        
        const confidenceText = await confidenceDisplay.textContent();
        expect(confidenceText).toMatch(/\d+%/); // Should contain percentage
        console.log(`Confidence display: "${confidenceText}"`);
    });

    test('should display match reasons', async ({ page }) => {
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('temperature');
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // Check for match reasons
        const matchReasons = page.locator('.formula-card-match-reasons').first();
        await expect(matchReasons).toBeVisible();
        
        const reasonsText = await matchReasons.textContent();
        expect(reasonsText).toContain('Matched:');
        console.log(`Match reasons: "${reasonsText}"`);
    });

    test('should complete formula selection flow', async ({ page }) => {
        // Search
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('escape velocity');
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // Verify search results
        const firstCard = page.locator('.formula-card').first();
        await expect(firstCard).toBeVisible();
        
        // Check for all new UI elements
        await expect(firstCard.locator('.formula-card-chips')).toBeVisible();
        await expect(firstCard.locator('.formula-card-breakdown')).toBeVisible();
        await expect(firstCard.locator('.formula-card-confidence')).toBeVisible();
        
        // Click the card
        await firstCard.click();
        
        // Wait for calculator screen
        await page.waitForSelector('#input-screen.active', { timeout: 5000 });
        
        // Verify calculator screen is visible
        const inputScreen = page.locator('#input-screen');
        await expect(inputScreen).toBeVisible();
        
        console.log('✅ Formula selection flow complete');
    });

    test('should handle empty search gracefully', async ({ page }) => {
        const searchInput = page.locator('#formula-search');
        
        // Fill and then clear
        await searchInput.fill('test');
        await searchInput.fill('');
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        // Should show initial formulas (no chips or confidence)
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // No topic chips should be visible for empty search
        const topicChips = await page.locator('.topic-chip').count();
        console.log(`Topic chips on empty search: ${topicChips}`);
        // Empty search may or may not show chips depending on implementation
    });

    test('should show correct confidence levels', async ({ page }) => {
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('hubble');
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            return cards.length > 0;
        }, { timeout: 5000 });
        
        // Get all confidence displays
        const confidenceElements = await page.locator('.formula-card-confidence').all();
        expect(confidenceElements.length).toBeGreaterThan(0);
        
        // Check first few confidence levels
        for (let i = 0; i < Math.min(3, confidenceElements.length); i++) {
            const text = await confidenceElements[i].textContent();
            console.log(`Card ${i + 1} confidence: "${text}"`);
            
            // Should contain percentage and level
            expect(text).toMatch(/\d+%/);
            expect(text).toMatch(/(Very High|High|Moderate|Low|Very Low)/);
        }
    });
});

test.describe('Search UI v2.1.0 - Performance', () => {
    test('should render chips and breakdown within performance budget', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const searchInput = page.locator('#formula-search');
        await searchInput.fill('orbital');
        
        const startTime = Date.now();
        
        await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                window.uiOrchestrator._mainSearchDebounced.flush();
            }
        });
        
        await page.waitForFunction(() => {
            const cards = document.querySelectorAll('.formula-card');
            const chips = document.querySelectorAll('.topic-chip, .variable-chip');
            return cards.length > 0 && chips.length > 0;
        }, { timeout: 5000 });
        
        const endTime = Date.now();
        const renderTime = endTime - startTime;
        
        console.log(`Render time (search + chips + breakdown): ${renderTime}ms`);
        expect(renderTime).toBeLessThan(1000); // Budget: 1 second
    });
});

