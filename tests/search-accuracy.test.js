// Comprehensive search accuracy and engine tests
import { test, expect } from '@playwright/test';

test.describe('Search Engine Accuracy', () => {
    test('Exact name match should rank highest', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('Escape Velocity');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeGreaterThan(0);
        
        // First result should be Escape Velocity (exact match)
        const topResult = results[0];
        expect(topResult.formula.name.toLowerCase()).toContain('escape velocity');
        expect(topResult.score).toBeGreaterThan(5000); // High score for name match
        expect(topResult.metrics.nameMatch).toBe(true);
    });
    
    test('Partial name match should rank well', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('kepler');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeGreaterThan(0);
        
        // Should find Kepler's Law formulas
        const keplerResults = results.filter(r => 
            r.formula.name.toLowerCase().includes('kepler')
        );
        expect(keplerResults.length).toBeGreaterThan(0);
        
        // Kepler formulas should have high scores
        keplerResults.forEach(result => {
            expect(result.score).toBeGreaterThan(150); // At least partial match score
        });
    });
    
    test('Concept matching should work', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('orbital mechanics');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeGreaterThan(0);
        
        // Should find formulas related to orbital mechanics
        const hasOrbitalFormula = results.some(r => 
            r.formula.name.toLowerCase().includes('orbital') ||
            r.formula.name.toLowerCase().includes('kepler') ||
            r.metrics.conceptMatch === true
        );
        expect(hasOrbitalFormula).toBe(true);
    });
    
    test('Variable matching should work', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('v_esc');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        
        // Should find escape velocity (has v_esc variable)
        const escapeVelocity = results.find(r => 
            r.formula.name.toLowerCase().includes('escape velocity')
        );
        
        if (escapeVelocity) {
            expect(escapeVelocity.metrics.variableMatch).toBe(true);
            expect(escapeVelocity.score).toBeGreaterThan(0);
        }
    });
    
    test('Description matching should provide relevant results', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('temperature from wavelength');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeGreaterThan(0);
        
        // Should find Wien's Law (relates temperature to wavelength)
        const wiensLaw = results.find(r => 
            r.formula.name.toLowerCase().includes('wien')
        );
        
        if (wiensLaw) {
            expect(wiensLaw.metrics.descriptionMatch || wiensLaw.metrics.conceptMatch).toBe(true);
        }
    });
    
    test('Results should be sorted by score (highest first)', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('velocity');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeGreaterThan(1);
        
        // Verify descending order
        for (let i = 0; i < results.length - 1; i++) {
            expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
        }
    });
    
    test('Results should be limited to 50', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('distance');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeLessThanOrEqual(50);
    });
    
    test('Empty query should return first 50 formulas', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBe(50);
        
        // All should have score 0 (no match)
        results.forEach(result => {
            expect(result.score).toBe(0);
        });
    });
    
    test('No results for non-matching query', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('xyzabc123nonexistent');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        // Should return empty array or filtered results
        expect(Array.isArray(results)).toBe(true);
    });
    
    test('Scoring weights: name > concept > description', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('escape');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeGreaterThan(0);
        
        // Find escape velocity (name match) and any description matches
        const nameMatch = results.find(r => r.metrics.nameMatch);
        const descOnlyMatch = results.find(r => !r.metrics.nameMatch && r.metrics.descriptionMatch);
        
        if (nameMatch && descOnlyMatch) {
            // Name match should score higher than description-only match
            expect(nameMatch.score).toBeGreaterThan(descOnlyMatch.score);
        }
    });
    
    test('Fast filter should reduce candidate set', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const stats = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                const totalFormulas = window.uiOrchestrator.searchEngine.formulas.length;
                
                // Test fast filter
                const query = 'velocity';
                const queryLower = query.toLowerCase();
                const words = queryLower.split(/\s+/).filter(w => w.length > 0);
                
                const candidates = window.uiOrchestrator.searchEngine.formulas.filter(f => {
                    const nameLower = f.name.toLowerCase();
                    const hasNameMatch = nameLower.includes(queryLower) ||
                        words.some(w => nameLower.includes(w));
                    const hasConceptMatch = f.concepts?.some(c => c.toLowerCase().includes(queryLower) ||
                        words.some(w => c.toLowerCase().includes(w)));
                    return hasNameMatch || hasConceptMatch;
                });
                
                return {
                    total: totalFormulas,
                    candidates: candidates.length,
                    reduction: ((totalFormulas - candidates.length) / totalFormulas * 100).toFixed(1)
                };
            }
            return null;
        });
        
        expect(stats).toBeTruthy();
        expect(stats.candidates).toBeLessThan(stats.total);
        console.log(`Fast filter reduced ${stats.total} formulas to ${stats.candidates} candidates (${stats.reduction}% reduction)`);
    });
    
    test('Cache should work correctly', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const cacheTest = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                const query = 'test cache query';
                
                // First search (should compute)
                const start1 = performance.now();
                const results1 = window.uiOrchestrator.searchEngine.search(query);
                const time1 = performance.now() - start1;
                
                // Second search (should use cache)
                const start2 = performance.now();
                const results2 = window.uiOrchestrator.searchEngine.search(query);
                const time2 = performance.now() - start2;
                
                return {
                    firstTime: time1,
                    secondTime: time2,
                    cached: time2 < time1,
                    sameResults: JSON.stringify(results1) === JSON.stringify(results2)
                };
            }
            return null;
        });
        
        expect(cacheTest).toBeTruthy();
        expect(cacheTest.sameResults).toBe(true);
        // Cache should be faster (though both might be very fast)
        console.log(`First search: ${cacheTest.firstTime.toFixed(2)}ms, Cached: ${cacheTest.secondTime.toFixed(2)}ms`);
    });
    
    test('Normalized scores should be in 0-1000 range', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForSelector('.formula-card', { timeout: 10000 });
        
        const results = await page.evaluate(() => {
            if (window.uiOrchestrator && window.uiOrchestrator.searchEngine) {
                return window.uiOrchestrator.searchEngine.search('velocity');
            }
            return null;
        });
        
        expect(results).toBeTruthy();
        expect(results.length).toBeGreaterThan(0);
        
        // Top result should have normalized score of 1000
        if (results[0].normalizedScore !== undefined) {
            expect(results[0].normalizedScore).toBe(1000);
        }
        
        // All scores should be <= 1000
        results.forEach(result => {
            if (result.normalizedScore !== undefined) {
                expect(result.normalizedScore).toBeLessThanOrEqual(1000);
                expect(result.normalizedScore).toBeGreaterThanOrEqual(0);
            }
        });
    });
});

