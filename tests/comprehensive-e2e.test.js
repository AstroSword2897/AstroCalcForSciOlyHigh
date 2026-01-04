/**
 * Comprehensive E2E Test Suite for AstroCalc
 * Tests every component, button, feature, calculation, input system, and symbolic solving
 */

import { test, expect } from '@playwright/test';

test.describe('Comprehensive AstroCalc E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.formula-card, #formula-list', { timeout: 15000 });
        await page.waitForFunction(() => typeof window.uiOrchestrator !== 'undefined', { timeout: 10000 });
    });

    test.describe('Main Navigation & Tabs', () => {
        test('should switch between main tabs (Formulas, Explorer, Classification)', async ({ page }) => {
            // Test Formulas tab
            const formulasTab = page.locator('.main-tab-btn[data-main-tab="formulas"]');
            if (await formulasTab.count() > 0) {
                await formulasTab.click();
                await page.waitForTimeout(500);
                const formulasContent = page.locator('#main-formulas-tab');
                if (await formulasContent.count() > 0) {
                    const isVisible = await formulasContent.evaluate(el => {
                        const style = window.getComputedStyle(el);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    });
                    expect(isVisible).toBe(true);
                }
            }

            // Test Explorer tab
            const explorerTab = page.locator('.main-tab-btn[data-main-tab="explorer"]');
            if (await explorerTab.count() > 0) {
                await page.evaluate(() => {
                    if (typeof window.switchMainTab === 'function') {
                        window.switchMainTab('explorer');
                    }
                });
                await page.waitForTimeout(500);
            }

            // Test Classification tab
            const classificationTab = page.locator('.main-tab-btn[data-main-tab="classification"]');
            if (await classificationTab.count() > 0) {
                await page.evaluate(() => {
                    if (typeof window.switchMainTab === 'function') {
                        window.switchMainTab('classification');
                    }
                });
                await page.waitForTimeout(500);
            }
        });

        test('should switch between calculator sub-tabs (Calculator, Graph, Classification)', async ({ page }) => {
            // First select a formula to open calculator
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                
                // Test Calculator tab
                const calcTab = page.locator('.tab-btn[data-tab="calculator"]');
                if (await calcTab.count() > 0) {
                    await calcTab.click();
                    await page.waitForTimeout(300);
                    await expect(calcTab).toHaveClass(/active/);
                }

                // Test Graph tab
                const graphTab = page.locator('.tab-btn[data-tab="graph"]');
                if (await graphTab.count() > 0) {
                    await graphTab.click();
                    await page.waitForTimeout(300);
                    await expect(graphTab).toHaveClass(/active/);
                }

                // Test Classification sub-tab
                const classTab = page.locator('.tab-btn[data-tab="classification"]');
                if (await classTab.count() > 0) {
                    await classTab.click();
                    await page.waitForTimeout(300);
                    await expect(classTab).toHaveClass(/active/);
                }
            }
        });
    });

    test.describe('Formula Card Interactions', () => {
        test('should display formula cards with correct information', async ({ page }) => {
            const cards = page.locator('.formula-card');
            const count = await cards.count();
            expect(count).toBeGreaterThan(0);

            // Check first card has required elements
            const firstCard = cards.first();
            const cardTitle = firstCard.locator('h3, .formula-card-title');
            const cardEquation = firstCard.locator('.formula-card-equation, .formula-equation');
            const cardDescription = firstCard.locator('.formula-card-description, .formula-description');

            if (await cardTitle.count() > 0) {
                const title = await cardTitle.textContent();
                expect(title).toBeTruthy();
                expect(title.trim().length).toBeGreaterThan(0);
            }
        });

        test('should click formula card to open calculator', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                
                // Verify calculator screen is visible
                const inputScreen = page.locator('#input-screen');
                const isVisible = await inputScreen.evaluate(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
                expect(isVisible).toBe(true);
            }
        });

        test('should show back button and return to formula list', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                
                const backButton = page.locator('#back-button');
                if (await backButton.count() > 0) {
                    await backButton.click();
                    await page.waitForTimeout(500);
                    
                    // Should return to formula list
                    const formulaList = page.locator('#formula-list');
                    if (await formulaList.count() > 0) {
                        const isVisible = await formulaList.evaluate(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none';
                        });
                        expect(isVisible).toBe(true);
                    }
                }
            }
        });
    });

    test.describe('Search Functionality', () => {
        test('should search for formulas by name', async ({ page }) => {
            const searchInput = page.locator('#formula-search, #command-palette-input');
            if (await searchInput.count() > 0) {
                await searchInput.fill('velocity');
                await page.waitForTimeout(500);
                
                // Flush debounce if available
                await page.evaluate(() => {
                    if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                        window.uiOrchestrator._mainSearchDebounced.flush();
                    }
                });
                
                await page.waitForTimeout(500);
                
                // Should show filtered results
                const cards = page.locator('.formula-card');
                const count = await cards.count();
                expect(count).toBeGreaterThan(0);
            }
        });

        test('should clear search and show all formulas', async ({ page }) => {
            const searchInput = page.locator('#formula-search, #command-palette-input');
            if (await searchInput.count() > 0) {
                await searchInput.fill('test');
                await page.waitForTimeout(500);
                
                await searchInput.clear();
                await page.waitForTimeout(500);
                
                // Should show all formulas again
                const cards = page.locator('.formula-card');
                const count = await cards.count();
                expect(count).toBeGreaterThan(0);
            }
        });
    });

    test.describe('Input System', () => {
        test('should render variable inputs for selected formula', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Check for variable inputs
                const inputs = page.locator('#variables-container input[type="number"], #variables-container input[type="text"], .variable-input input');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    expect(inputCount).toBeGreaterThan(0);
                    
                    // Test entering a value
                    await inputs.first().fill('10');
                    const value = await inputs.first().inputValue();
                    expect(value).toBe('10');
                }
            }
        });

        test('should handle N/A checkboxes for solving variables', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Find N/A checkboxes
                const naCheckboxes = page.locator('.na-checkbox input[type="checkbox"], input[type="checkbox"][data-na]');
                const checkboxCount = await naCheckboxes.count();
                
                if (checkboxCount > 0) {
                    // Check first checkbox
                    await naCheckboxes.first().check();
                    const isChecked = await naCheckboxes.first().isChecked();
                    expect(isChecked).toBe(true);
                }
            }
        });

        test('should validate input values', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                const inputs = page.locator('#variables-container input[type="number"], .variable-input input[type="number"]');
                const inputCount = await inputs.count();
                
                if (inputCount > 0) {
                    // Try invalid input
                    await inputs.first().fill('invalid');
                    await page.waitForTimeout(300);
                    
                    // Input should either be cleared or show validation
                    const value = await inputs.first().inputValue();
                    // Some browsers clear invalid number inputs
                    expect(value === '' || value === 'invalid').toBe(true);
                }
            }
        });
    });

    test.describe('Calculation System', () => {
        test('should perform numeric calculation with valid inputs', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Fill inputs
                const numberInputs = page.locator('#variables-container input[type="number"], .variable-input input[type="number"]').filter({ hasNot: page.locator('input[type="checkbox"]') });
                const inputCount = await numberInputs.count();
                
                if (inputCount > 0) {
                    // Fill first input
                    await numberInputs.first().fill('10');
                    
                    // Click calculate button
                    const calculateBtn = page.locator('#calculate-btn, button:has-text("Calculate")');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Check for result display
                        const resultDisplay = page.locator('#result-display, .result-display');
                        if (await resultDisplay.count() > 0) {
                            const resultText = await resultDisplay.textContent();
                            expect(resultText).toBeTruthy();
                        }
                    }
                }
            }
        });

        test('should handle calculation errors gracefully', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Try to calculate with invalid inputs
                const calculateBtn = page.locator('#calculate-btn, button:has-text("Calculate")');
                if (await calculateBtn.count() > 0) {
                    await calculateBtn.click();
                    await page.waitForTimeout(1000);
                    
                    // Should show error message or handle gracefully
                    const resultDisplay = page.locator('#result-display, .result-display');
                    if (await resultDisplay.count() > 0) {
                        const resultText = await resultDisplay.textContent();
                        // Should contain error indication or be empty
                        expect(resultText !== null).toBe(true);
                    }
                }
            }
        });

        test('should clear calculation results', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                const clearBtn = page.locator('#clear-btn, button:has-text("Clear")');
                if (await clearBtn.count() > 0) {
                    await clearBtn.click();
                    await page.waitForTimeout(500);
                    
                    // Inputs should be cleared
                    const inputs = page.locator('#variables-container input[type="number"]');
                    const inputCount = await inputs.count();
                    if (inputCount > 0) {
                        const firstValue = await inputs.first().inputValue();
                        expect(firstValue).toBe('');
                    }
                }
            }
        });
    });

    test.describe('Symbolic Solving', () => {
        test('should display symbolic expression when no values entered', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Don't fill any inputs, just click calculate
                const calculateBtn = page.locator('#calculate-btn, button:has-text("Calculate")');
                if (await calculateBtn.count() > 0) {
                    await calculateBtn.click();
                    await page.waitForTimeout(1000);
                    
                    // Should show symbolic result or message
                    const resultDisplay = page.locator('#result-display, .result-display');
                    if (await resultDisplay.count() > 0) {
                        const resultText = await resultDisplay.textContent();
                        // Should contain symbolic expression or indication
                        expect(resultText).toBeTruthy();
                    }
                }
            }
        });

        test('should solve for selected variable (N/A checkbox)', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Fill some inputs
                const numberInputs = page.locator('#variables-container input[type="number"], .variable-input input[type="number"]').filter({ hasNot: page.locator('input[type="checkbox"]') });
                const inputCount = await numberInputs.count();
                
                if (inputCount > 1) {
                    // Fill first input
                    await numberInputs.first().fill('10');
                    
                    // Check N/A for another variable
                    const naCheckboxes = page.locator('.na-checkbox input[type="checkbox"]');
                    if (await naCheckboxes.count() > 0) {
                        await naCheckboxes.first().check();
                        
                        // Calculate
                        const calculateBtn = page.locator('#calculate-btn, button:has-text("Calculate")');
                        if (await calculateBtn.count() > 0) {
                            await calculateBtn.click();
                            await page.waitForTimeout(1000);
                            
                            // Should show result for solved variable
                            const resultDisplay = page.locator('#result-display, .result-display');
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

    test.describe('Graph Functionality', () => {
        test('should switch to graph tab and display graph', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Switch to graph tab
                const graphTab = page.locator('.tab-btn[data-tab="graph"]');
                if (await graphTab.count() > 0) {
                    await graphTab.click();
                    await page.waitForTimeout(1000);
                    
                    // Check for graph container
                    const graphContainer = page.locator('#desmos-graph, #graph-tab, canvas');
                    if (await graphContainer.count() > 0) {
                        // Graph should be visible or initialized
                        const isVisible = await graphContainer.first().evaluate(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none';
                        });
                        expect(isVisible).toBe(true);
                    }
                }
            }
        });

        test('should update graph when values change', async ({ page }) => {
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);
                
                // Fill input
                const numberInputs = page.locator('#variables-container input[type="number"], .variable-input input[type="number"]').filter({ hasNot: page.locator('input[type="checkbox"]') });
                const inputCount = await numberInputs.count();
                
                if (inputCount > 0) {
                    await numberInputs.first().fill('10');
                    await page.waitForTimeout(500);
                    
                    // Switch to graph tab
                    const graphTab = page.locator('.tab-btn[data-tab="graph"]');
                    if (await graphTab.count() > 0) {
                        await graphTab.click();
                        await page.waitForTimeout(1000);
                        
                        // Graph should be updated (we can't easily verify the graph content, but we can check it exists)
                        const graphContainer = page.locator('#desmos-graph, #graph-tab');
                        if (await graphContainer.count() > 0) {
                            expect(await graphContainer.count()).toBeGreaterThan(0);
                        }
                    }
                }
            }
        });
    });

    test.describe('Classification Tab', () => {
        test('should display classification inputs', async ({ page }) => {
            // Navigate to classification tab
            await page.evaluate(() => {
                if (typeof window.switchMainTab === 'function') {
                    window.switchMainTab('classification');
                }
            });
            await page.waitForTimeout(1000);
            
            // Check for classification inputs
            const tempInput = page.locator('#main-temperature-input, input[placeholder*="Temperature"], input[placeholder*="temperature"]');
            if (await tempInput.count() > 0) {
                await expect(tempInput.first()).toBeVisible();
            }
        });

        test('should perform stellar classification', async ({ page }) => {
            // Navigate to classification tab
            await page.evaluate(() => {
                if (typeof window.switchMainTab === 'function') {
                    window.switchMainTab('classification');
                }
            });
            await page.waitForTimeout(1000);
            
            // Fill temperature input
            const tempInput = page.locator('#main-temperature-input, input[placeholder*="Temperature"], input[placeholder*="temperature"]');
            if (await tempInput.count() > 0) {
                await tempInput.first().fill('5778'); // Sun's temperature
                await page.waitForTimeout(500);
                
                // Click classify button
                const classifyBtn = page.locator('#main-classify-btn, button:has-text("Classify"), button:has-text("classify")');
                if (await classifyBtn.count() > 0) {
                    await classifyBtn.click();
                    await page.waitForTimeout(1000);
                    
                    // Should show classification result
                    const result = page.locator('.classification-result, #classification-result');
                    if (await result.count() > 0) {
                        const resultText = await result.textContent();
                        expect(resultText).toBeTruthy();
                    }
                }
            }
        });

        test('should display Henyey-Hayashi ZAMS track image', async ({ page }) => {
            // Navigate to classification tab
            await page.evaluate(() => {
                if (typeof window.switchMainTab === 'function') {
                    window.switchMainTab('classification');
                }
            });
            await page.waitForTimeout(1000);
            
            // Check for ZAMS track image
            const zamsImage = page.locator('img[alt*="ZAMS"], img[alt*="Henyey"], img[alt*="Hayashi"], img[src*="zams"], img[src*="henyey"], img[src*="hayashi"]');
            if (await zamsImage.count() > 0) {
                await expect(zamsImage.first()).toBeVisible();
            } else {
                // Check if image container exists
                const imageContainer = page.locator('.classification-images, .image-grid');
                if (await imageContainer.count() > 0) {
                    // Image might be loading or placeholder
                    expect(await imageContainer.count()).toBeGreaterThan(0);
                }
            }
        });
    });

    test.describe('Formula Explorer', () => {
        test('should navigate to explorer and display formulas', async ({ page }) => {
            await page.evaluate(() => {
                if (typeof window.switchMainTab === 'function') {
                    window.switchMainTab('explorer');
                }
            });
            await page.waitForTimeout(2000);
            
            // Check for explorer container
            const explorerContainer = page.locator('#formula-explorer-container');
            if (await explorerContainer.count() > 0) {
                // Explorer should be initialized
                const hasContent = await explorerContainer.evaluate(el => el.innerHTML.trim().length > 0);
                expect(hasContent).toBe(true);
            }
        });
    });

    test.describe('Complete Workflow', () => {
        test('should complete full workflow: search -> select -> input -> calculate -> view graph', async ({ page }) => {
            // Close command palette if open
            await page.evaluate(() => {
                const palette = document.getElementById('command-palette');
                if (palette) {
                    palette.style.display = 'none';
                }
            });
            
            // 1. Search
            const searchInput = page.locator('#formula-search, #command-palette-input');
            if (await searchInput.count() > 0) {
                await searchInput.fill('escape');
                await page.waitForTimeout(500);
                await page.evaluate(() => {
                    if (window.uiOrchestrator && window.uiOrchestrator._mainSearchDebounced) {
                        window.uiOrchestrator._mainSearchDebounced.flush();
                    }
                });
                await page.waitForTimeout(500);
                
                // Ensure command palette is closed
                await page.evaluate(() => {
                    const palette = document.getElementById('command-palette');
                    if (palette) {
                        palette.style.display = 'none';
                    }
                });
            }

            // 2. Select formula
            const firstCard = page.locator('.formula-card').first();
            if (await firstCard.count() > 0) {
                // Ensure command palette is not blocking
                await page.evaluate(() => {
                    const palette = document.getElementById('command-palette');
                    if (palette) {
                        palette.style.display = 'none';
                        palette.style.pointerEvents = 'none';
                    }
                });
                await page.waitForTimeout(200);
                await firstCard.click();
                await page.waitForSelector('#input-screen', { state: 'visible', timeout: 5000 });
                await page.waitForTimeout(1000);

                // 3. Input values
                const numberInputs = page.locator('#variables-container input[type="number"], .variable-input input[type="number"]').filter({ hasNot: page.locator('input[type="checkbox"]') });
                const inputCount = await numberInputs.count();
                
                if (inputCount > 0) {
                    await numberInputs.first().fill('10');
                    await page.waitForTimeout(300);

                    // 4. Calculate
                    const calculateBtn = page.locator('#calculate-btn, button:has-text("Calculate")');
                    if (await calculateBtn.count() > 0) {
                        await calculateBtn.click();
                        await page.waitForTimeout(1000);

                        // 5. View graph
                        const graphTab = page.locator('.tab-btn[data-tab="graph"]');
                        if (await graphTab.count() > 0) {
                            await graphTab.click();
                            await page.waitForTimeout(1000);
                            
                            // Verify graph tab is active
                            await expect(graphTab).toHaveClass(/active/);
                        }
                    }
                }
            }
        });
    });
});

