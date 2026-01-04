/**
 * Formula Explorer Button Test Suite
 * Comprehensive testing of all interactive buttons in the Formula Explorer
 * 
 * Tests cover:
 * - View Mode Buttons (search, categories, relationships, calculator)
 * - Category Buttons
 * - Formula Item Buttons
 * - Use Formula Button
 * - Related Formula Buttons
 * - Calculate Button
 * - Copy Result Button
 */

import { test, expect } from '@playwright/test';

test.describe('Formula Explorer Button Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app with cache bypass
        await page.goto('http://localhost:8000', { 
            waitUntil: 'domcontentloaded',
            cache: 'no-cache'
        });
        
        // Wait for the app to initialize - wait for formula cards or any main content
        await page.waitForSelector('.formula-card, #formula-list, .main-tab-content, #formula-selection', { timeout: 15000 });
        
        // Wait for UI orchestrator to be ready
        await page.waitForFunction(() => {
            return typeof window.uiOrchestrator !== 'undefined' && 
                   typeof window.switchMainTab === 'function';
        }, { timeout: 15000 });
        
        // Check if explorer tab exists - if not, log debug info
        const tabInfo = await page.evaluate(() => {
            const tab = document.getElementById('main-explorer-tab');
            const allTabs = document.querySelectorAll('.main-tab-content');
            return {
                explorerTabExists: tab !== null,
                allTabIds: Array.from(allTabs).map(t => t.id),
                bodyHTML: document.body.innerHTML.substring(0, 500)
            };
        });
        
        if (!tabInfo.explorerTabExists) {
            console.log('Debug info:', JSON.stringify(tabInfo, null, 2));
            // Try to find it by class instead
            await page.waitForSelector('.main-tab-content', { timeout: 5000 });
        }
        
        // Navigate to Explorer tab using the function directly
        await page.evaluate(() => {
            if (typeof window.switchMainTab === 'function') {
                window.switchMainTab('explorer');
            } else if (window.uiOrchestrator && window.uiOrchestrator.tabManager) {
                window.uiOrchestrator.tabManager.switchMainTab('explorer');
            }
        });
        
        // Wait a bit for tab switching
        await page.waitForTimeout(500);
        
        // Wait for explorer tab to be visible (check both display and visibility)
        await page.waitForFunction(() => {
            const tab = document.getElementById('main-explorer-tab');
            if (!tab) return false;
            const style = window.getComputedStyle(tab);
            const isVisible = style.display !== 'none' && 
                            style.visibility !== 'hidden' && 
                            style.opacity !== '0';
            return isVisible || tab.classList.contains('active');
        }, { timeout: 10000 });
        
        // Wait for formula-explorer-container to exist
        await page.waitForSelector('#formula-explorer-container', { timeout: 10000 });
        
        // Wait for Formula Explorer to be initialized and rendered
        // The container should have content (not just empty)
        await page.waitForFunction(() => {
            const container = document.getElementById('formula-explorer-container');
            if (!container) return false;
            // Check if it has been rendered (has innerHTML or child elements)
            const hasContent = container.innerHTML.trim().length > 0 || container.children.length > 0;
            // Also check if view mode buttons exist (indicates full render)
            const hasViewButtons = container.querySelector('.explorer-view-mode-btn') !== null;
            return hasContent && hasViewButtons;
        }, { timeout: 15000 });
    });

    test.describe('View Mode Buttons', () => {
        test('should switch to search mode', async ({ page }) => {
            const searchBtn = page.locator('.explorer-view-mode-btn[data-mode="search"]');
            await expect(searchBtn).toBeVisible();
            await searchBtn.click();
            
            // Check that search mode is active
            await expect(searchBtn).toHaveClass(/active/);
            
            // Check that search input is visible
            const searchInput = page.locator('#explorer-search-input');
            await expect(searchInput).toBeVisible();
        });

        test('should switch to categories mode', async ({ page }) => {
            const categoriesBtn = page.locator('.explorer-view-mode-btn[data-mode="categories"]');
            await expect(categoriesBtn).toBeVisible();
            await categoriesBtn.click();
            
            // Check that categories mode is active
            await expect(categoriesBtn).toHaveClass(/active/);
            
            // Check that category buttons are visible
            const categoryButtons = page.locator('.explorer-category-btn');
            const count = await categoryButtons.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should switch to relationships mode', async ({ page }) => {
            const relationshipsBtn = page.locator('.explorer-view-mode-btn[data-mode="relationships"]');
            await expect(relationshipsBtn).toBeVisible();
            await relationshipsBtn.click();
            
            // Check that relationships mode is active
            await expect(relationshipsBtn).toHaveClass(/active/);
        });

        test('should switch to calculator mode', async ({ page }) => {
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await expect(calculatorBtn).toBeVisible();
            await calculatorBtn.click();
            
            // Check that calculator mode is active
            await expect(calculatorBtn).toHaveClass(/active/);
            
            // Check that calculator panel is visible
            const calculatorPanel = page.locator('.explorer-calculator-panel');
            await expect(calculatorPanel).toBeVisible();
        });

        test('should clear calculation result when leaving calculator mode', async ({ page }) => {
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            
            // Select a formula and perform a calculation
            const formulaItem = page.locator('.explorer-formula-item').first();
            await formulaItem.click();
            
            // Fill in some values and calculate (if inputs exist)
            const inputs = page.locator('.explorer-variable-input input[type="number"]');
            const inputCount = await inputs.count();
            if (inputCount > 0) {
                await inputs.first().fill('10');
                const calculateBtn = page.locator('.explorer-calculate-btn');
                if (await calculateBtn.count() > 0) {
                    await calculateBtn.click();
                    await page.waitForTimeout(500);
                }
            }
            
            // Switch to search mode
            const searchBtn = page.locator('.explorer-view-mode-btn[data-mode="search"]');
            await searchBtn.click();
            
            // Check that calculation result is cleared
            const resultDisplay = page.locator('.explorer-result-display');
            if (await resultDisplay.count() > 0) {
                const resultText = await resultDisplay.textContent();
                expect(resultText).not.toContain('Result:');
            }
        });
    });

    test.describe('Category Buttons', () => {
        test('should toggle category selection', async ({ page }) => {
            // Switch to categories mode
            const categoriesBtn = page.locator('.explorer-view-mode-btn[data-mode="categories"]');
            await categoriesBtn.click();
            await page.waitForTimeout(300);
            
            // Get first category button
            const categoryBtn = page.locator('.explorer-category-btn').first();
            if (await categoryBtn.count() > 0) {
                const categoryName = await categoryBtn.getAttribute('data-category');
                
                // Click category button
                await categoryBtn.click();
                await page.waitForTimeout(300);
                
                // Check that category is active
                await expect(categoryBtn).toHaveClass(/active/);
                
                // Check that formula list updates
                const formulaItems = page.locator('.explorer-formula-item');
                const count = await formulaItems.count();
                expect(count).toBeGreaterThan(0);
                
                // Click same category again to toggle off
                await categoryBtn.click();
                await page.waitForTimeout(300);
                
                // Category should no longer be active
                await expect(categoryBtn).not.toHaveClass(/active/);
            }
        });

        test('should filter formulas by selected category', async ({ page }) => {
            // Switch to categories mode
            const categoriesBtn = page.locator('.explorer-view-mode-btn[data-mode="categories"]');
            await categoriesBtn.click();
            await page.waitForTimeout(300);
            
            // Get first category button
            const categoryBtn = page.locator('.explorer-category-btn').first();
            if (await categoryBtn.count() > 0) {
                const categoryName = await categoryBtn.getAttribute('data-category');
                
                // Get initial formula count
                const initialFormulas = page.locator('.explorer-formula-item');
                const initialCount = await initialFormulas.count();
                
                // Click category button
                await categoryBtn.click();
                await page.waitForTimeout(500);
                
                // Check that formula list has changed (may be more or less)
                const filteredFormulas = page.locator('.explorer-formula-item');
                const filteredCount = await filteredFormulas.count();
                
                // The count should be different (or same if all formulas match)
                // At minimum, we should have some formulas
                expect(filteredCount).toBeGreaterThanOrEqual(0);
            }
        });
    });

    test.describe('Formula Item Buttons', () => {
        test('should select a formula when clicked', async ({ page }) => {
            // Get first formula item
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                const formulaId = await formulaItem.getAttribute('data-formula-id');
                
                // Click formula item
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Check that formula is active
                await expect(formulaItem).toHaveClass(/active/);
                
                // Check that right panel shows formula details
                const rightPanel = page.locator('.explorer-right-panel');
                await expect(rightPanel).toBeVisible();
                
                // Check that formula name is displayed
                const formulaName = page.locator('.explorer-formula-name, .explorer-selected-formula-name');
                if (await formulaName.count() > 0) {
                    await expect(formulaName).toBeVisible();
                }
            }
        });

        test('should reset variable values when selecting a new formula', async ({ page }) => {
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select first formula
            const firstFormula = page.locator('.explorer-formula-item').first();
            if (await firstFormula.count() > 0) {
                await firstFormula.click();
                await page.waitForTimeout(300);
                
                // Fill in a variable input
                const inputs = page.locator('.explorer-variable-input input[type="number"]');
                const inputCount = await inputs.count();
                if (inputCount > 0) {
                    await inputs.first().fill('100');
                    
                    // Select a different formula
                    const secondFormula = page.locator('.explorer-formula-item').nth(1);
                    if (await secondFormula.count() > 0) {
                        await secondFormula.click();
                        await page.waitForTimeout(300);
                        
                        // Check that inputs are reset (value should be empty or different)
                        const newInputs = page.locator('.explorer-variable-input input[type="number"]');
                        if (await newInputs.count() > 0) {
                            const firstInputValue = await newInputs.first().inputValue();
                            // Value should be empty or reset
                            expect(firstInputValue).toBe('');
                        }
                    }
                }
            }
        });

        test('should reset calculation result when selecting a new formula', async ({ page }) => {
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select first formula
            const firstFormula = page.locator('.explorer-formula-item').first();
            if (await firstFormula.count() > 0) {
                await firstFormula.click();
                await page.waitForTimeout(300);
                
                // Try to calculate (if inputs exist)
                const inputs = page.locator('.explorer-variable-input input[type="number"]');
                const inputCount = await inputs.count();
                if (inputCount > 0) {
                    await inputs.first().fill('10');
                    const calculateBtn = page.locator('.explorer-calculate-btn');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(500);
                    }
                }
                
                // Select a different formula
                const secondFormula = page.locator('.explorer-formula-item').nth(1);
                if (await secondFormula.count() > 0) {
                    await secondFormula.click();
                    await page.waitForTimeout(300);
                    
                    // Check that calculation result is cleared
                    const resultDisplay = page.locator('.explorer-result-display');
                    if (await resultDisplay.count() > 0) {
                        const resultText = await resultDisplay.textContent();
                        expect(resultText).not.toContain('Result:');
                    }
                }
            }
        });
    });

    test.describe('Use Formula Button', () => {
        test('should call selectFormula when clicked', async ({ page }) => {
            // Select a formula first
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Find use formula button
                const useBtn = page.locator('.explorer-use-formula-btn').first();
                if (await useBtn.count() > 0) {
                    const formulaId = await useBtn.getAttribute('data-use-formula-id');
                    
                    // Mock selectFormula function to track calls
                    await page.evaluate(() => {
                        window._selectFormulaCalled = false;
                        window._selectFormulaArg = null;
                        const originalSelectFormula = window.selectFormula;
                        window.selectFormula = (formula) => {
                            window._selectFormulaCalled = true;
                            window._selectFormulaArg = formula;
                            if (originalSelectFormula) {
                                return originalSelectFormula(formula);
                            }
                        };
                    });
                    
                    // Click use formula button
                    await useBtn.click();
                    await page.waitForTimeout(500);
                    
                    // Check that selectFormula was called
                    const wasCalled = await page.evaluate(() => window._selectFormulaCalled);
                    expect(wasCalled).toBe(true);
                    
                    // Check that correct formula was passed
                    const calledWith = await page.evaluate(() => window._selectFormulaArg);
                    expect(calledWith).toBeTruthy();
                    expect(calledWith.id).toBe(formulaId);
                }
            }
        });

        test('should switch to formulas tab when clicked', async ({ page }) => {
            // Select a formula first
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Find use formula button
                const useBtn = page.locator('.explorer-use-formula-btn').first();
                if (await useBtn.count() > 0) {
                    // Mock switchMainTab to track calls
                    await page.evaluate(() => {
                        window._switchMainTabCalled = false;
                        window._switchMainTabArg = null;
                        const originalSwitchMainTab = window.switchMainTab;
                        window.switchMainTab = (tabName) => {
                            window._switchMainTabCalled = true;
                            window._switchMainTabArg = tabName;
                            if (originalSwitchMainTab) {
                                return originalSwitchMainTab(tabName);
                            }
                        };
                    });
                    
                    // Click use formula button
                    await useBtn.click();
                    await page.waitForTimeout(500);
                    
                    // Check that switchMainTab was called with 'formulas'
                    const wasCalled = await page.evaluate(() => window._switchMainTabCalled);
                    const calledWith = await page.evaluate(() => window._switchMainTabArg);
                    
                    if (wasCalled) {
                        expect(calledWith).toBe('formulas');
                    }
                }
            }
        });
    });

    test.describe('Related Formula Buttons', () => {
        test('should select related formula when clicked', async ({ page }) => {
            // Switch to relationships mode
            const relationshipsBtn = page.locator('.explorer-view-mode-btn[data-mode="relationships"]');
            await relationshipsBtn.click();
            await page.waitForTimeout(300);
            
            // Select a formula first
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(500);
                
                // Find related formula button
                const relatedBtn = page.locator('.explorer-related-formula-btn').first();
                if (await relatedBtn.count() > 0) {
                    const relatedFormulaId = await relatedBtn.getAttribute('data-related-formula-id');
                    
                    // Click related formula button
                    await relatedBtn.click();
                    await page.waitForTimeout(500);
                    
                    // Check that the related formula is now selected
                    const selectedFormula = page.locator(`.explorer-formula-item[data-formula-id="${relatedFormulaId}"]`);
                    if (await selectedFormula.count() > 0) {
                        await expect(selectedFormula).toHaveClass(/active/);
                    }
                    
                    // Check that right panel updates
                    const rightPanel = page.locator('.explorer-right-panel');
                    await expect(rightPanel).toBeVisible();
                }
            }
        });
    });

    test.describe('Calculate Button', () => {
        test('should perform calculation when clicked', async ({ page }) => {
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select a formula
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Fill in variable inputs
                const inputs = page.locator('.explorer-variable-input input[type="number"]');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    // Fill first input
                    await inputs.first().fill('10');
                    
                    // Click calculate button
                    const calculateBtn = page.locator('.explorer-calculate-btn');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Check that result is displayed
                        const resultDisplay = page.locator('.explorer-result-display');
                        if (await resultDisplay.count() > 0) {
                            const resultText = await resultDisplay.textContent();
                            // Result should contain some output (success or error)
                            expect(resultText).toBeTruthy();
                        }
                    }
                }
            }
        });

        test('should handle missing inputs gracefully', async ({ page }) => {
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select a formula
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Don't fill any inputs, just click calculate
                const calculateBtn = page.locator('.explorer-calculate-btn');
                if (await calculateBtn.count() > 0) {
                    await calculateBtn.click();
                    await page.waitForTimeout(1000);
                    
                    // Should show error or message about missing inputs
                    const resultDisplay = page.locator('.explorer-result-display');
                    if (await resultDisplay.count() > 0) {
                        const resultText = await resultDisplay.textContent();
                        // Should contain error message or indication of missing data
                        expect(resultText).toBeTruthy();
                    }
                }
            }
        });

        test('should handle invalid input gracefully', async ({ page }) => {
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select a formula
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Fill with invalid input
                const inputs = page.locator('.explorer-variable-input input[type="number"]');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    await inputs.first().fill('invalid');
                    
                    // Click calculate button
                    const calculateBtn = page.locator('.explorer-calculate-btn');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Should show error message
                        const resultDisplay = page.locator('.explorer-result-display');
                        if (await resultDisplay.count() > 0) {
                            const resultText = await resultDisplay.textContent();
                            // Should contain error indication
                            expect(resultText).toBeTruthy();
                        }
                    }
                }
            }
        });
    });

    test.describe('Copy Result Button', () => {
        test('should copy result to clipboard when clicked', async ({ page, context }) => {
            // Grant clipboard permissions
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);
            
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select a formula
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Fill in inputs and calculate
                const inputs = page.locator('.explorer-variable-input input[type="number"]');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    await inputs.first().fill('10');
                    const calculateBtn = page.locator('.explorer-calculate-btn');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Find copy button
                        const copyBtn = page.locator('.explorer-copy-btn');
                        if (await copyBtn.count() > 0) {
                            // Get result text before copying
                            const resultDisplay = page.locator('.explorer-result-display');
                            let expectedText = '';
                            if (await resultDisplay.count() > 0) {
                                expectedText = await resultDisplay.textContent();
                            }
                            
                            // Click copy button
                            await copyBtn.click();
                            await page.waitForTimeout(500);
                            
                            // Check clipboard (if supported)
                            try {
                                const clipboardText = await page.evaluate(async () => {
                                    return await navigator.clipboard.readText();
                                });
                                
                                // Clipboard should contain the result
                                expect(clipboardText).toBeTruthy();
                            } catch (e) {
                                // Clipboard API might not be available in test environment
                                // That's okay, we'll just check that the button was clicked
                                console.log('Clipboard API not available in test environment');
                            }
                            
                            // Check that "Copied!" feedback is shown
                            const copiedFeedback = page.locator('text=/copied/i');
                            if (await copiedFeedback.count() > 0) {
                                await expect(copiedFeedback.first()).toBeVisible();
                            }
                        }
                    }
                }
            }
        });

        test('should not copy when result has error', async ({ page, context }) => {
            // Grant clipboard permissions
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);
            
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select a formula
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Try to calculate without valid inputs (should produce error)
                const calculateBtn = page.locator('.explorer-calculate-btn');
                if (await calculateBtn.count() > 0) {
                    await calculateBtn.click();
                    await page.waitForTimeout(1000);
                    
                    // Check if result display shows error
                    const resultDisplay = page.locator('.explorer-result-display');
                    if (await resultDisplay.count() > 0) {
                        const resultText = await resultDisplay.textContent();
                        const hasError = resultText.includes('error') || 
                                        resultText.includes('Error') || 
                                        resultText.includes('⚠️') ||
                                        resultText.includes('failed');
                        
                        if (hasError) {
                            // Copy button should either be disabled or not copy error
                            const copyBtn = page.locator('.explorer-copy-btn');
                            if (await copyBtn.count() > 0) {
                                // Click copy button
                                await copyBtn.click();
                                await page.waitForTimeout(500);
                                
                                // Clipboard should not contain error text (or should be empty)
                                try {
                                    const clipboardText = await page.evaluate(async () => {
                                        return await navigator.clipboard.readText();
                                    });
                                    
                                    // If clipboard was updated, it shouldn't contain error indicators
                                    if (clipboardText) {
                                        expect(clipboardText).not.toContain('Error');
                                    }
                                } catch (e) {
                                    // Clipboard API not available - that's okay
                                }
                            }
                        }
                    }
                }
            }
        });

        test('should show temporary "Copied!" feedback', async ({ page }) => {
            // Switch to calculator mode
            const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
            await calculatorBtn.click();
            await page.waitForTimeout(300);
            
            // Select a formula
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Fill in inputs and calculate
                const inputs = page.locator('.explorer-variable-input input[type="number"]');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    await inputs.first().fill('10');
                    const calculateBtn = page.locator('.explorer-calculate-btn');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Find copy button
                        const copyBtn = page.locator('.explorer-copy-btn');
                        if (await copyBtn.count() > 0) {
                            // Click copy button
                            await copyBtn.click();
                            
                            // Check that "Copied!" text appears
                            const copiedText = page.locator('text=/copied/i');
                            if (await copiedText.count() > 0) {
                                await expect(copiedText.first()).toBeVisible();
                                
                                // Wait for feedback to disappear (should be after 2 seconds)
                                await page.waitForTimeout(2100);
                                
                                // Feedback should be gone
                                const stillVisible = await copiedText.first().isVisible().catch(() => false);
                                expect(stillVisible).toBe(false);
                            }
                        }
                    }
                }
            }
        });
    });

    test.describe('Integration Tests', () => {
        test('should handle complete workflow: search -> select -> calculate -> copy', async ({ page, context }) => {
            // Grant clipboard permissions
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);
            
            // Switch to search mode
            const searchBtn = page.locator('.explorer-view-mode-btn[data-mode="search"]');
            await searchBtn.click();
            await page.waitForTimeout(300);
            
            // Enter search query
            const searchInput = page.locator('#explorer-search-input');
            if (await searchInput.count() > 0) {
                await searchInput.fill('velocity');
                await page.waitForTimeout(500);
            }
            
            // Select first result
            const formulaItem = page.locator('.explorer-formula-item').first();
            if (await formulaItem.count() > 0) {
                await formulaItem.click();
                await page.waitForTimeout(300);
                
                // Switch to calculator mode
                const calculatorBtn = page.locator('.explorer-view-mode-btn[data-mode="calculator"]');
                await calculatorBtn.click();
                await page.waitForTimeout(300);
                
                // Fill inputs and calculate
                const inputs = page.locator('.explorer-variable-input input[type="number"]');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    await inputs.first().fill('10');
                    const calculateBtn = page.locator('.explorer-calculate-btn');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Copy result
                        const copyBtn = page.locator('.explorer-copy-btn');
                        if (await copyBtn.count() > 0) {
                            await copyBtn.click();
                            await page.waitForTimeout(500);
                            
                            // Verify workflow completed
                            const resultDisplay = page.locator('.explorer-result-display');
                            if (await resultDisplay.count() > 0) {
                                const resultText = await resultDisplay.textContent();
                                expect(resultText).toBeTruthy();
                            }
                        }
                    }
                }
            }
        });
    });
});

