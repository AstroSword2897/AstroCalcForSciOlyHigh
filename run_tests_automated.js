/**
 * Automated Test Runner
 * Runs calculator tests until 100% achieved 10 times consecutively
 * Can be run in Node.js with Playwright
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TEST_URL = 'http://localhost:8000/tests/run_production_tests.html';
const TARGET_CONSECUTIVE_PASSES = 10;
const MAX_RUNS = 100;

async function runTestsAutomated() {
    console.log('🚀 AUTOMATED TEST RUNNER');
    console.log('='.repeat(80));
    console.log(`Target: 100% pass rate, ${TARGET_CONSECUTIVE_PASSES} times consecutively\n`);
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push({ type: msg.type(), text });
        if (msg.type() === 'log' || msg.type() === 'info') {
            console.log(`[${msg.type()}] ${text}`);
        } else if (msg.type() === 'error') {
            console.error(`[ERROR] ${text}`);
        }
    });
    
    try {
        console.log(`📄 Navigating to ${TEST_URL}...`);
        await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });
        
        console.log('⏳ Waiting for page to load...');
        await page.waitForTimeout(3000);
        
        // Wait for test functions to be available
        await page.waitForFunction(() => {
            return typeof runCalculatorOnly === 'function' || 
                   typeof CalculatorTestRunner !== 'undefined' ||
                   typeof CalculatorTestSuite !== 'undefined';
        }, { timeout: 10000 });
        
        console.log('✅ Page loaded, test functions available');
        
        // Execute tests
        console.log('\n🧮 Starting calculator tests...\n');
        
        const result = await page.evaluate(async () => {
            return new Promise((resolve) => {
                // Override console to capture output
                const logs = [];
                const originalLog = console.log;
                const originalError = console.error;
                
                console.log = (...args) => {
                    logs.push({ type: 'log', msg: args.join(' ') });
                    originalLog.apply(console, args);
                };
                
                console.error = (...args) => {
                    logs.push({ type: 'error', msg: args.join(' ') });
                    originalError.apply(console, args);
                };
                
                // Start tests
                if (typeof runCalculatorOnly === 'function') {
                    runCalculatorOnly().then(() => {
                        setTimeout(() => {
                            resolve({
                                logs: logs,
                                completed: true
                            });
                        }, 5000);
                    }).catch(e => {
                        resolve({
                            logs: logs,
                            error: e.message,
                            completed: false
                        });
                    });
                } else if (typeof CalculatorTestRunner !== 'undefined') {
                    CalculatorTestRunner.runUntilPerfect().then(() => {
                        setTimeout(() => {
                            resolve({
                                logs: logs,
                                completed: true
                            });
                        }, 5000);
                    }).catch(e => {
                        resolve({
                            logs: logs,
                            error: e.message,
                            completed: false
                        });
                    });
                } else {
                    resolve({
                        logs: logs,
                        error: 'Test functions not available',
                        completed: false
                    });
                }
            });
        });
        
        console.log('\n📊 Test Execution Results:');
        console.log('='.repeat(80));
        
        if (result.logs) {
            result.logs.forEach(log => {
                if (log.type === 'log') {
                    console.log(log.msg);
                } else if (log.type === 'error') {
                    console.error(log.msg);
                }
            });
        }
        
        if (result.error) {
            console.error(`\n❌ Error: ${result.error}`);
        }
        
        // Wait a bit for final results
        await page.waitForTimeout(5000);
        
        // Try to get final results from page
        const finalResults = await page.evaluate(() => {
            if (typeof CalculatorTestRunner !== 'undefined' && CalculatorTestRunner.results) {
                return CalculatorTestRunner.results;
            }
            if (typeof CalculatorTestSuite !== 'undefined' && CalculatorTestSuite.results) {
                return CalculatorTestSuite.results;
            }
            return null;
        });
        
        if (finalResults) {
            console.log('\n📈 Final Results:');
            console.log(`   Consecutive 100% passes: ${finalResults.consecutive100PercentPasses || finalResults.consecutivePasses || 0}/${TARGET_CONSECUTIVE_PASSES}`);
            console.log(`   Total runs: ${finalResults.run || finalResults.currentRun || 0}`);
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ Test execution completed');
        console.log('='.repeat(80));
        
        // Keep browser open for a bit to see results
        console.log('\n⏳ Keeping browser open for 10 seconds to view results...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Error running tests:', error);
    } finally {
        await browser.close();
    }
}

// Check if Playwright is available
try {
    require('playwright');
    console.log('✅ Playwright available\n');
    runTestsAutomated().catch(console.error);
} catch (e) {
    console.error('❌ Playwright not available');
    console.log('\n📋 To install Playwright:');
    console.log('   npm install -D @playwright/test');
    console.log('   npx playwright install chromium');
    console.log('\n📋 Alternative: Run tests manually in browser:');
    console.log(`   ${TEST_URL}`);
    process.exit(1);
}
