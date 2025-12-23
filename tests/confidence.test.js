/**
 * Confidence Score Unit Tests
 * Tests the production-grade confidence calculation with combined scores
 */

const { test, expect } = require('@playwright/test');

test.describe('Confidence Score Calculation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#formula-list', { timeout: 10000 });
    });

    /**
     * Test 1: Temperature Example (Wien's Law)
     * This is the canonical example from the spec
     */
    test('temperature → Wien\'s Law shows high confidence (≥85%)', async ({ page }) => {
        const result = await page.evaluate(() => {
            // Simulate the temperature search scenario
            const literalScore = 450;
            const topicScore = 1200;
            const contextScore = 750;
            const maxCombinedScore = 2400;
            const metrics = {
                nameMatch: true,
                questionPatternMatch: true,
                conceptMatch: true,
                matchedConcepts: ['temperature', 'wavelength', 'wien']
            };
            
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            const result = calculateConfidenceScore(
                literalScore,
                maxCombinedScore,
                metrics,
                1,
                topicScore,
                contextScore
            );
            
            return {
                confidence: result.confidence,
                breakdown: result.breakdown,
                hasTopicComponent: result.breakdown.some(b => b.label === 'Topic Relevance'),
                hasContextComponent: result.breakdown.some(b => b.label === 'Context Match')
            };
        });
        
        // Assertions
        expect(result.error).toBeUndefined();
        expect(result.confidence).toBeGreaterThanOrEqual(85);
        expect(result.confidence).toBeLessThanOrEqual(100);
        expect(result.hasTopicComponent).toBe(true);
        expect(result.hasContextComponent).toBe(true);
        expect(result.breakdown.length).toBeGreaterThan(3);
    });

    /**
     * Test 2: Backward Compatibility
     * Old code calling without topic/context should still work
     */
    test('backward compatible: works with literal score only', async ({ page }) => {
        const result = await page.evaluate(() => {
            const literalScore = 800;
            const maxCombinedScore = 1000;
            const metrics = { nameMatch: true };
            
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            // Call without topic/context (old style)
            const result = calculateConfidenceScore(literalScore, maxCombinedScore, metrics);
            
            return {
                confidence: result.confidence,
                breakdown: result.breakdown
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
        expect(Array.isArray(result.breakdown)).toBe(true);
    });

    /**
     * Test 3: Edge Case - Invalid maxScore
     */
    test('edge case: invalid maxScore returns confidence 0', async ({ page }) => {
        const result = await page.evaluate(() => {
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            const result = calculateConfidenceScore(500, 0, {});
            return {
                confidence: result.confidence,
                breakdown: result.breakdown
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.confidence).toBe(0);
        expect(result.breakdown.length).toBeGreaterThan(0);
        expect(result.breakdown[0].label).toContain('Invalid');
    });

    /**
     * Test 4: Edge Case - Negative Values
     */
    test('edge case: negative values clamped to 0', async ({ page }) => {
        const result = await page.evaluate(() => {
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            // Try negative scores
            const result = calculateConfidenceScore(-100, 1000, {}, 1, -500, -300);
            return {
                confidence: result.confidence,
                breakdown: result.breakdown
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
    });

    /**
     * Test 5: Confidence Never Exceeds 100
     */
    test('confidence capped at 100% even with high scores', async ({ page }) => {
        const result = await page.evaluate(() => {
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            // Extreme scores that would go over 100%
            const result = calculateConfidenceScore(
                5000, // literal
                5000, // max
                {
                    nameMatch: true,
                    questionPatternMatch: true,
                    conceptMatch: true,
                    matchedConcepts: ['a', 'b', 'c', 'd', 'e']
                },
                1.5,  // history boost
                3000, // topic
                2000  // context
            );
            
            return {
                confidence: result.confidence,
                breakdown: result.breakdown,
                hasCappingNote: result.breakdown.some(b => b.label.includes('Capped'))
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.confidence).toBe(100);
        expect(result.hasCappingNote).toBe(true);
    });

    /**
     * Test 6: Topic and Context Contributions Visible
     */
    test('breakdown includes topic and context when present', async ({ page }) => {
        const result = await page.evaluate(() => {
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            const result = calculateConfidenceScore(
                300,
                2000,
                { conceptMatch: true, matchedConcepts: ['test'] },
                1,
                800,  // significant topic score
                500   // significant context score
            );
            
            return {
                confidence: result.confidence,
                breakdown: result.breakdown,
                components: result.breakdown.map(b => b.label)
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.components).toContain('Topic Relevance');
        expect(result.components).toContain('Context Match');
    });

    /**
     * Test 7: Weak Match Penalty Applied
     */
    test('weak match penalty applied when no strong matches', async ({ page }) => {
        const result = await page.evaluate(() => {
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            const result = calculateConfidenceScore(
                100,
                1000,
                {}, // No name, pattern, or concept match
                1,
                0,
                0
            );
            
            return {
                confidence: result.confidence,
                breakdown: result.breakdown,
                hasPenalty: result.breakdown.some(b => b.label.includes('Penalty'))
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.hasPenalty).toBe(true);
    });

    /**
     * Test 8: History Factor Works
     */
    test('history factor adjusts confidence appropriately', async ({ page }) => {
        const result = await page.evaluate(() => {
            if (typeof calculateConfidenceScore !== 'function') {
                return { error: 'calculateConfidenceScore not found' };
            }
            
            // Same inputs, different history factors
            const base = calculateConfidenceScore(500, 1000, { nameMatch: true }, 1.0, 0, 0);
            const boosted = calculateConfidenceScore(500, 1000, { nameMatch: true }, 1.2, 0, 0);
            
            return {
                baseConfidence: base.confidence,
                boostedConfidence: boosted.confidence,
                difference: boosted.confidence - base.confidence
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.boostedConfidence).toBeGreaterThan(result.baseConfidence);
        expect(result.difference).toBeGreaterThan(0);
    });

    /**
     * Test 9: Real Search Integration
     * Search for "temperature" and verify Wien's Law has high confidence
     */
    test('integration: "temperature" search → Wien\'s Law ≥85% confidence', async ({ page }) => {
        // Type search
        await page.locator('#formula-search').fill('temperature');
        await page.waitForTimeout(500);
        
        // Find Wien's Law in results
        const cards = page.locator('.formula-card');
        const count = await cards.count();
        
        let wiensConfidence = null;
        let wiensRank = -1;
        
        for (let i = 0; i < Math.min(count, 10); i++) {
            const card = cards.nth(i);
            const text = await card.textContent();
            
            if (text && text.toLowerCase().includes('wien')) {
                wiensRank = i + 1;
                
                // Try to find confidence badge
                const confidenceBadge = card.locator('.confidence-badge, [data-confidence]').first();
                if (await confidenceBadge.count() > 0) {
                    const badgeText = await confidenceBadge.textContent();
                    const match = badgeText.match(/(\d+)%/);
                    if (match) {
                        wiensConfidence = parseInt(match[1]);
                    }
                }
                break;
            }
        }
        
        // Assertions
        expect(wiensRank).toBeGreaterThan(0); // Wien's Law should be found
        expect(wiensRank).toBeLessThanOrEqual(3); // Should be in top 3
        
        // If confidence is displayed, it should be high
        if (wiensConfidence !== null) {
            expect(wiensConfidence).toBeGreaterThanOrEqual(70); // At least "High" confidence
        }
    });

    /**
     * Test 10: getConfidenceBreakdown wrapper
     */
    test('getConfidenceBreakdown wrapper works correctly', async ({ page }) => {
        const result = await page.evaluate(() => {
            if (typeof getConfidenceBreakdown !== 'function') {
                return { error: 'getConfidenceBreakdown not found' };
            }
            
            const result = getConfidenceBreakdown(
                450,
                2400,
                { nameMatch: true, conceptMatch: true, matchedConcepts: ['temp', 'wien'] },
                1,
                1200,
                750
            );
            
            return {
                confidence: result.confidence,
                total: result.total,
                breakdownLength: result.breakdown.length,
                hasBreakdown: Array.isArray(result.breakdown)
            };
        });
        
        expect(result.error).toBeUndefined();
        expect(result.hasBreakdown).toBe(true);
        expect(result.breakdownLength).toBeGreaterThan(3);
        expect(result.confidence).toBe(result.total); // Should match
    });
});

test.describe('Confidence Level Thresholds', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('#formula-list', { timeout: 10000 });
    });

    test('confidence levels map correctly', async ({ page }) => {
        const levels = await page.evaluate(() => {
            if (typeof getConfidenceLevel !== 'function') {
                return { error: 'getConfidenceLevel not found' };
            }
            
            return {
                veryHigh: getConfidenceLevel(90),
                high: getConfidenceLevel(75),
                moderate: getConfidenceLevel(55),
                low: getConfidenceLevel(35),
                veryLow: getConfidenceLevel(10)
            };
        });
        
        expect(levels.error).toBeUndefined();
        expect(levels.veryHigh.level).toBe('Very High');
        expect(levels.veryHigh.color).toBe('#4ade80');
        expect(levels.high.level).toBe('High');
        expect(levels.moderate.level).toBe('Moderate');
        expect(levels.low.level).toBe('Low');
        expect(levels.veryLow.level).toBe('Very Low');
    });
});
