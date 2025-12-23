/**
 * Headless Test Runner
 * Runs tests using Puppeteer (if available) or provides fallback
 */

const http = require('http');

const PORT = 8000;
const TEST_URL = `http://localhost:${PORT}/tests/run_production_tests.html`;

async function runWithPuppeteer() {
    try {
        const puppeteer = require('puppeteer');
        
        console.log('🚀 Launching headless browser...');
        const browser = await puppeteer.launch({ 
            headless: false,  // Show browser for monitoring
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Capture console output
        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'log' || msg.type() === 'info') {
                console.log(`[BROWSER] ${text}`);
            } else if (msg.type() === 'error') {
                console.error(`[BROWSER ERROR] ${text}`);
            }
        });
        
        console.log(`📄 Navigating to ${TEST_URL}...`);
        await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });
        
        console.log('⏳ Waiting for page to initialize...');
        await page.waitForTimeout(5000);
        
        // Check if test functions are available
        const functionsAvailable = await page.evaluate(() => {
            return {
                runCalculatorOnly: typeof runCalculatorOnly,
                CalculatorTestRunner: typeof CalculatorTestRunner,
                CalculatorTestSuite: typeof CalculatorTestSuite
            };
        });
        
        console.log('📊 Available functions:', functionsAvailable);
        
        if (functionsAvailable.runCalculatorOnly === 'function' || 
            functionsAvailable.CalculatorTestRunner !== 'undefined' ||
            functionsAvailable.CalculatorTestSuite !== 'undefined') {
            
            console.log('\n🧮 Executing calculator tests...\n');
            
            // Execute tests
            await page.evaluate(() => {
                if (typeof runCalculatorOnly === 'function') {
                    runCalculatorOnly();
                } else if (typeof CalculatorTestRunner !== 'undefined') {
                    CalculatorTestRunner.runUntilPerfect();
                } else if (typeof CalculatorTestSuite !== 'undefined') {
                    CalculatorTestSuite.runUntilPerfect();
                }
            });
            
            console.log('✅ Tests started! Monitoring progress...');
            console.log('📊 Watch the browser window for real-time results');
            console.log('📝 Console output will appear below\n');
            
            // Monitor for completion (check every 5 seconds)
            let consecutivePasses = 0;
            let runCount = 0;
            const maxWaitTime = 600000; // 10 minutes max
            const startTime = Date.now();
            
            while (Date.now() - startTime < maxWaitTime) {
                await page.waitForTimeout(5000);
                
                const status = await page.evaluate(() => {
                    if (typeof CalculatorTestRunner !== 'undefined' && CalculatorTestRunner.results) {
                        return {
                            consecutive: CalculatorTestRunner.results.consecutive100PercentPasses || 0,
                            run: CalculatorTestRunner.results.run || 0
                        };
                    }
                    if (typeof CalculatorTestSuite !== 'undefined' && CalculatorTestSuite.results) {
                        return {
                            consecutive: CalculatorTestSuite.results.consecutivePasses || 0,
                            run: CalculatorTestSuite.results.currentRun || 0
                        };
                    }
                    return null;
                });
                
                if (status) {
                    if (status.consecutive !== consecutivePasses || status.run !== runCount) {
                        consecutivePasses = status.consecutive;
                        runCount = status.run;
                        console.log(`📊 Progress: Run ${runCount}, Consecutive 100%: ${consecutivePasses}/10`);
                        
                        if (consecutivePasses >= 10) {
                            console.log('\n🎉🎉🎉 SUCCESS! 🎉🎉🎉');
                            console.log('Achieved 100% pass rate 10 times consecutively!');
                            break;
                        }
                    }
                }
            }
            
            // Get final results
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
                console.log(`   Consecutive 100% passes: ${finalResults.consecutive100PercentPasses || finalResults.consecutivePasses || 0}/10`);
                console.log(`   Total runs: ${finalResults.run || finalResults.currentRun || 0}`);
                console.log(`   Total tests: ${finalResults.totalTests || 0}`);
                console.log(`   Passed: ${finalResults.passedTests || 0}`);
                console.log(`   Failed: ${finalResults.failedTests || 0}`);
            }
            
            console.log('\n⏳ Keeping browser open for 30 seconds to view results...');
            await page.waitForTimeout(30000);
            
        } else {
            console.error('❌ Test functions not available on page');
        }
        
        await browser.close();
        console.log('\n✅ Test execution completed');
        
    } catch (error) {
        if (error.message.includes('Cannot find module')) {
            console.error('❌ Puppeteer not installed');
            console.log('\n📋 To install:');
            console.log('   npm install puppeteer');
            console.log('\n📋 Or run tests manually:');
            console.log(`   ${TEST_URL}`);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

// Check if server is running
function checkServer() {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${PORT}`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function main() {
    console.log('🧪 HEADLESS TEST RUNNER');
    console.log('='.repeat(80));
    console.log('');
    
    console.log('📡 Checking server...');
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log('⚠️  Server not running, starting...');
        const { spawn } = require('child_process');
        const server = spawn('python3', ['-m', 'http.server', PORT.toString()], {
            detached: true,
            stdio: 'ignore'
        });
        server.unref();
        console.log('⏳ Waiting for server...');
        await new Promise(r => setTimeout(r, 3000));
    } else {
        console.log('✅ Server is running');
    }
    
    console.log('');
    await runWithPuppeteer();
}

main().catch(console.error);
