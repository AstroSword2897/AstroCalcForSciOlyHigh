/**
 * Performance Budget Tests for AstroCalc
 * Tests calculator solve time and UI render performance
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Budget Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
    });

    test('Calculator solve time within budget', async ({ page }) => {
        // Navigate to a formula card
        const formulaCards = page.locator('.formula-card');
        const cardCount = await formulaCards.count();
        
        if (cardCount > 0) {
            await formulaCards.first().click();
            await page.waitForSelector('#calculator-screen', { timeout: 5000 });
            
            // Get calculator inputs and fill them
            const inputs = page.locator('.calculator-input');
            const inputCount = await inputs.count();
            
            if (inputCount > 0) {
                // Fill first input with test value
                await inputs.first().fill('100');
                
                // Measure calculation time
                const startTime = Date.now();
                
                // Trigger calculation
                const calculateBtn = page.locator('#calculate-btn');
                if (await calculateBtn.count() > 0) {
                    await calculateBtn.click();
                    
                    // Wait for result
                    await page.waitForSelector('.calculation-result', { timeout: 3000 });
                    
                    const endTime = Date.now();
                    const calculationTime = endTime - startTime;
                    
                    // Should complete within 100ms budget
                    expect(calculationTime).toBeLessThan(100);
                }
            }
        }
    });

    test('UI render time within budget', async ({ page }) => {
        // Test search render performance
        const searchInput = page.locator('#formula-search');
        
        const startTime = Date.now();
        await searchInput.fill('kepler');
        await page.waitForTimeout(500);
        
        // Wait for search results to render
        await page.waitForSelector('.formula-card', { timeout: 5000 });
        const endTime = Date.now();
        
        const renderTime = endTime - startTime;
        
        // Should render within 200ms budget
        expect(renderTime).toBeLessThan(200);
    });

    test('Memory usage stays within bounds', async ({ page }) => {
        // Check if we can access performance metrics
        const memoryInfo = await page.evaluate(() => {
            if (performance && (performance as any).memory) {
                return {
                    used: (performance as any).memory.usedJSHeapSize,
                    total: (performance as any).memory.totalJSHeapSize,
                    limit: (performance as any).memory.jsHeapSizeLimit
                };
            }
            return null;
        });
        
        if (memoryInfo) {
            // Should not exceed 50MB
            const usedMB = memoryInfo.used / (1024 * 1024);
            expect(usedMB).toBeLessThan(50);
        }
    });

    test('Large dataset handling performance', async ({ page }) => {
        // Simulate large formula dataset
        await page.evaluate(() => {
            // Create many formula cards to test rendering performance
            const container = document.getElementById('formula-list');
            if (container) {
                const startTime = performance.now();
                
                // Simulate rendering 100 cards
                for (let i = 0; i < 100; i++) {
                    const card = document.createElement('div');
                    card.className = 'formula-card';
                    card.innerHTML = `<h3>Test Formula ${i}</h3><p>Performance test</p>`;
                    container.appendChild(card);
                }
                
                const endTime = performance.now();
                const renderTime = endTime - startTime;
                
                // Should render 100 cards within 500ms
                return renderTime < 500;
            }
            return false;
        });
        
        const performanceResult = await page.locator('body').getAttribute('data-performance-result');
        expect(performanceResult).toBe('true');
    });
});
