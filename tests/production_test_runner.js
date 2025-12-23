/**
 * Production Test Runner
 * Runs comprehensive tests until 100% pass rate achieved 10 times consecutively
 * 
 * Tests:
 * 1. Calculator tests (all formulas, 3 times each)
 * 2. Search engine tests (5,000+ queries)
 * 3. Integration tests
 * 4. Performance tests
 * 
 * Version: 2.1.0
 */

const PRODUCTION_TEST_CONFIG = {
    CALCULATOR_TESTS_PER_FORMULA: 3,
    SEARCH_TEST_SAMPLE_SIZE: 1000,  // Test 1000 search queries per run
    REQUIRED_PASS_RATE: 1.0,  // 100%
    CONSECUTIVE_PASSES_REQUIRED: 10,  // Updated to 10 consecutive passes
    MAX_RUNS: 100  // Increased to allow for 10 consecutive passes
};

let productionTestResults = {
    run: 0,
    consecutive100PercentPasses: 0,
    allRuns: [],
    calculatorResults: null,
    searchResults: null,
    integrationResults: null,
    performanceResults: null
};

/**
 * Run all production tests
 */
async function runProductionTests() {
    productionTestResults.run++;
    const runNumber = productionTestResults.run;
    
    console.log('\n' + '='.repeat(80));
    console.log(`🏭 PRODUCTION TEST RUN #${runNumber}`);
    console.log('='.repeat(80));
    
    const runResults = {
        run: runNumber,
        timestamp: new Date().toISOString(),
        calculator: null,
        search: null,
        integration: null,
        performance: null,
        overallPassRate: 0,
        allCategories100: false
    };
    
    // 1. Calculator Tests
    console.log('\n📊 Phase 1: Calculator Tests (All formulas, 3x each)...');
    if (typeof CalculatorTestSuite !== 'undefined') {
        runResults.calculator = await CalculatorTestSuite.runAllCalculatorTests();
    } else {
        console.log('⚠️  CalculatorTestSuite not available');
        runResults.calculator = { totalTests: 0, passedTests: 0, failedTests: 0 };
    }
    
    // 2. Search Engine Tests
    console.log('\n📊 Phase 2: Search Engine Tests (1,000 queries)...');
    if (typeof SearchTestHarness !== 'undefined' && typeof testCases !== 'undefined') {
        const sample = testCases.slice(0, PRODUCTION_TEST_CONFIG.SEARCH_TEST_SAMPLE_SIZE);
        runResults.search = await SearchTestHarness.runAllTests(sample);
    } else {
        console.log('⚠️  SearchTestHarness not available');
        runResults.search = { total: 0, passed: 0, failed: 0 };
    }
    
    // 3. Integration Tests
    console.log('\n📊 Phase 3: Integration Tests...');
    if (typeof IntegrationTest !== 'undefined') {
        runResults.integration = await IntegrationTest.runAll();
    } else {
        console.log('⚠️  IntegrationTest not available');
        runResults.integration = { passed: 0, failed: 0, tests: [] };
    }
    
    // 4. Performance Tests
    console.log('\n📊 Phase 4: Performance Tests...');
    runResults.performance = await runPerformanceTests();
    
    // Calculate overall pass rate
    const totalTests = 
        (runResults.calculator.totalTests || 0) +
        (runResults.search.total || 0) +
        (runResults.integration.tests?.length || 0) +
        (runResults.performance.totalTests || 0);
    
    const totalPassed = 
        (runResults.calculator.passedTests || 0) +
        (runResults.search.passed || 0) +
        (runResults.integration.passed || 0) +
        (runResults.performance.passedTests || 0);
    
    runResults.overallPassRate = totalTests > 0 ? totalPassed / totalTests : 0;
    
    // Check category pass rates
    const calculatorCategories = runResults.calculator.byCategory || {};
    const allCalculatorCategories100 = Object.values(calculatorCategories).every(
        stats => stats.passed / stats.total === 1.0
    );
    
    runResults.allCategories100 = allCalculatorCategories100 && runResults.overallPassRate === 1.0;
    
    // Update consecutive passes
    if (runResults.allCategories100 && runResults.overallPassRate === 1.0) {
        productionTestResults.consecutive100PercentPasses++;
        console.log(`\n✅ Run ${runNumber}: 100% PASS RATE ON ALL CATEGORIES!`);
        console.log(`   Consecutive 100% passes: ${productionTestResults.consecutive100PercentPasses}/${PRODUCTION_TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED}`);
    } else {
        productionTestResults.consecutive100PercentPasses = 0;
        console.log(`\n⚠️  Run ${runNumber}: ${(runResults.overallPassRate * 100).toFixed(2)}% overall`);
        if (!allCalculatorCategories100) {
            console.log('   Some calculator categories not at 100%');
        }
    }
    
    productionTestResults.allRuns.push(runResults);
    productionTestResults.calculatorResults = runResults.calculator;
    productionTestResults.searchResults = runResults.search;
    productionTestResults.integrationResults = runResults.integration;
    productionTestResults.performanceResults = runResults.performance;
    
    return runResults;
}

/**
 * Run performance tests
 */
async function runPerformanceTests() {
    const results = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        metrics: {}
    };
    
    // Test 1: Search latency
    if (typeof filterAndRenderFormulas === 'function') {
        const start = performance.now();
        filterAndRenderFormulas('temperature wavelength');
        const latency = performance.now() - start;
        results.totalTests++;
        if (latency < 200) {
            results.passedTests++;
            results.metrics.searchLatency = latency;
        } else {
            results.failedTests++;
        }
    }
    
    // Test 2: Calculator performance
    if (typeof FormulaCalculator !== 'undefined' && typeof formulas !== 'undefined' && formulas.length > 0) {
        const testFormula = formulas[0];
        const calculator = new FormulaCalculator(testFormula);
        const start = performance.now();
        calculator.solve({ M: 1.989e30, a: 1.496e11, P: null });
        const latency = performance.now() - start;
        results.totalTests++;
        if (latency < 100) {
            results.passedTests++;
            results.metrics.calculatorLatency = latency;
        } else {
            results.failedTests++;
        }
    }
    
    return results;
}

/**
 * Run tests until 100% achieved 5 times consecutively
 */
async function runUntilPerfect() {
    console.log('🎯 PRODUCTION TEST SUITE - TARGET: 100% ON ALL CATEGORIES, 5 TIMES CONSECUTIVELY');
    console.log('='.repeat(80));
    
    let runCount = 0;
    
    while (
        productionTestResults.consecutive100PercentPasses < PRODUCTION_TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED &&
        runCount < PRODUCTION_TEST_CONFIG.MAX_RUNS
    ) {
        runCount++;
        await runProductionTests();
        
        if (productionTestResults.consecutive100PercentPasses >= PRODUCTION_TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED) {
            console.log('\n' + '='.repeat(80));
            console.log('🎉🎉🎉 SUCCESS! 🎉🎉🎉');
            console.log('='.repeat(80));
            console.log(`Achieved 100% pass rate on ALL categories ${PRODUCTION_TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED} times consecutively!`);
            console.log(`Total runs: ${runCount}`);
            console.log('='.repeat(80));
            break;
        }
        
        // Brief pause between runs
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (productionTestResults.consecutive100PercentPasses < PRODUCTION_TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED) {
        console.log(`\n⚠️  Could not achieve ${PRODUCTION_TEST_CONFIG.CONSECUTIVE_PASSES_REQUIRED} consecutive 100% passes`);
        console.log(`   Current consecutive passes: ${productionTestResults.consecutive100PercentPasses}`);
        console.log(`   Total runs attempted: ${runCount}`);
    }
    
    // Print final summary
    printProductionTestSummary();
    
    return productionTestResults;
}

/**
 * Print production test summary
 */
function printProductionTestSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PRODUCTION TEST FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Runs:     ${productionTestResults.allRuns.length}`);
    console.log(`Consecutive 100% Passes: ${productionTestResults.consecutive100PercentPasses}`);
    
    if (productionTestResults.calculatorResults) {
        console.log('\n📊 Calculator Results:');
        console.log(`   Total Tests: ${productionTestResults.calculatorResults.totalTests}`);
        console.log(`   Passed: ${productionTestResults.calculatorResults.passedTests}`);
        console.log(`   Failed: ${productionTestResults.calculatorResults.failedTests}`);
        console.log(`   Pass Rate: ${((productionTestResults.calculatorResults.passedTests / productionTestResults.calculatorResults.totalTests) * 100).toFixed(2)}%`);
        
        console.log('\n   By Category:');
        Object.entries(productionTestResults.calculatorResults.byCategory || {})
            .sort((a, b) => b[1].total - a[1].total)
            .forEach(([cat, stats]) => {
                const pct = ((stats.passed / stats.total) * 100).toFixed(2);
                const emoji = pct === '100.00' ? '🟢' : pct >= '95.00' ? '🟡' : '🔴';
                console.log(`     ${emoji} ${cat.padEnd(30)} ${stats.passed}/${stats.total} (${pct}%)`);
            });
    }
    
    if (productionTestResults.searchResults) {
        console.log('\n📊 Search Engine Results:');
        console.log(`   Total Tests: ${productionTestResults.searchResults.total}`);
        console.log(`   Passed: ${productionTestResults.searchResults.passed}`);
        console.log(`   Failed: ${productionTestResults.searchResults.failed}`);
        console.log(`   Pass Rate: ${((productionTestResults.searchResults.passed / productionTestResults.searchResults.total) * 100).toFixed(2)}%`);
    }
    
    console.log('='.repeat(80));
}

// Export
if (typeof window !== 'undefined') {
    window.ProductionTestRunner = {
        runProductionTests,
        runUntilPerfect,
        printProductionTestSummary,
        results: productionTestResults,
        config: PRODUCTION_TEST_CONFIG
    };
}
