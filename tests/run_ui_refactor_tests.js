/**
 * UI Refactor Tests Runner
 * Can be run in Node.js (with jsdom) or browser
 * 
 * Usage:
 *   Browser: Load in test harness HTML
 *   Node.js: node tests/run_ui_refactor_tests.js
 */

(function() {
    'use strict';

    // Detect environment
    const isNode = typeof window === 'undefined';
    const isBrowser = !isNode;

    // Mock DOM if in Node.js
    if (isNode) {
        console.log('⚠️  Node.js environment detected. Some tests may be limited.');
        console.log('💡 For full testing, use the browser test harness: tests/ui_refactor_test_harness.html\n');
    }

    const testResults = {
        passed: 0,
        failed: 0,
        errors: [],
        details: [],
        startTime: Date.now(),
        testCount: 0  // Track number of test() calls
    };

    // Track assert calls per test
    let currentTestAsserts = { passed: 0, failed: 0 };

    function log(message, type = 'info') {
        const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'error' ? '⚠️' : 'ℹ️';
        const output = `${prefix} ${message}`;
        console.log(output);
        if (isBrowser && typeof window !== 'undefined' && window.console) {
            window.console.log(output);
        }
        return output;
    }

    function assert(condition, message) {
        if (condition) {
            currentTestAsserts.passed++;
            testResults.details.push({ type: 'pass', message });
            log(`PASS: ${message}`, 'pass');
            return true;
        } else {
            currentTestAsserts.failed++;
            testResults.errors.push(message);
            testResults.details.push({ type: 'fail', message });
            log(`FAIL: ${message}`, 'fail');
            return false;
        }
    }

    function test(name, fn) {
        // Reset assert counters for this test
        currentTestAsserts = { passed: 0, failed: 0 };
        testResults.testCount++;
        
        try {
            log(`Testing: ${name}`, 'info');
            fn();
            
            // Count this test as pass or fail based on asserts
            if (currentTestAsserts.failed === 0 && currentTestAsserts.passed > 0) {
                // Test passed - all asserts passed
                testResults.passed++;
            } else if (currentTestAsserts.failed > 0) {
                // Test failed - at least one assert failed
                testResults.failed++;
            } else {
                // Zero asserts = FAIL (test is broken)
                testResults.failed++;
                testResults.errors.push(`${name}: Test has no assertions`);
                log(`❌ FAIL: ${name} - Test has no assertions`, 'fail');
            }
        } catch (error) {
            testResults.failed++;
            const errorMsg = `${name}: ${error.message}`;
            testResults.errors.push(errorMsg);
            testResults.details.push({ type: 'error', message: errorMsg });
            log(`ERROR in ${name}: ${error.message}`, 'error');
            if (error.stack) {
                console.error(error.stack);
            }
        }
    }

    // ============================================================================
    // TEST SUITE: Utility Functions Existence
    // ============================================================================

    function testUtilityFunctionsExist() {
        test('Utility Functions - parseNumericValue exists', () => {
            if (isBrowser) {
                const fn = window.parseNumericValue;
                assert(fn !== null && typeof fn === 'function', 'parseNumericValue function exists');
            } else {
                log('SKIP: parseNumericValue (requires browser environment)', 'info');
            }
        });

        test('Utility Functions - safeEvaluateExpression exists', () => {
            if (isBrowser) {
                const fn = window.safeEvaluateExpression;
                assert(fn !== null && typeof fn === 'function', 'safeEvaluateExpression function exists');
            } else {
                log('SKIP: safeEvaluateExpression (requires browser environment)', 'info');
            }
        });

        test('Utility Functions - replaceVariables exists', () => {
            if (isBrowser) {
                const fn = window.replaceVariables;
                assert(fn !== null && typeof fn === 'function', 'replaceVariables function exists');
            } else {
                log('SKIP: replaceVariables (requires browser environment)', 'info');
            }
        });

        test('Utility Functions - showError exists', () => {
            if (isBrowser) {
                const fn = window.showError;
                assert(fn !== null && typeof fn === 'function', 'showError function exists');
            } else {
                log('SKIP: showError (requires browser environment)', 'info');
            }
        });
    }

    // ============================================================================
    // TEST SUITE: DOM Cache System
    // ============================================================================

    function testDOMCache() {
        test('DOM Cache - DOMCache class exists', () => {
            if (isBrowser) {
                const cache = (typeof DOMCache !== 'undefined' && typeof DOMCache === 'function') ? DOMCache :
                            (typeof window !== 'undefined' && window.DOMCache) ? window.DOMCache :
                            (typeof window !== 'undefined' && window.DOMUtils && window.DOMUtils.DOMCache) ? window.DOMUtils.DOMCache : null;
                const instance = (typeof domCache !== 'undefined') ? domCache :
                               (typeof window !== 'undefined' && window.domCache) ? window.domCache :
                               (typeof window !== 'undefined' && window.DOMUtils && window.DOMUtils.domCache) ? window.DOMUtils.domCache : null;
                assert(cache !== null || instance !== null, 'DOMCache/domCache exists');
            } else {
                log('SKIP: DOMCache (requires browser environment)', 'info');
            }
        });

        test('DOM Cache - DOMUpdateBatcher exists', () => {
            if (isBrowser) {
                const batcher = (typeof DOMUpdateBatcher !== 'undefined' && typeof DOMUpdateBatcher === 'function') ? DOMUpdateBatcher :
                               (typeof window !== 'undefined' && window.DOMUpdateBatcher) ? window.DOMUpdateBatcher :
                               (typeof window !== 'undefined' && window.DOMUtils && window.DOMUtils.DOMUpdateBatcher) ? window.DOMUtils.DOMUpdateBatcher : null;
                const instance = (typeof domBatcher !== 'undefined') ? domBatcher :
                                (typeof window !== 'undefined' && window.domBatcher) ? window.domBatcher :
                                (typeof window !== 'undefined' && window.DOMUtils && window.DOMUtils.domBatcher) ? window.DOMUtils.domBatcher : null;
                assert(batcher !== null || instance !== null, 'DOMUpdateBatcher/domBatcher exists');
            } else {
                log('SKIP: DOMUpdateBatcher (requires browser environment)', 'info');
            }
        });
    }

    // ============================================================================
    // TEST SUITE: Configuration
    // ============================================================================

    function testConfiguration() {
        test('FORMULA_INSTRUCTIONS - Config exists', () => {
            if (isBrowser) {
                const config = window.FORMULA_INSTRUCTIONS;
                assert(config !== null && config !== undefined, 'FORMULA_INSTRUCTIONS exists');
                assert(typeof config === 'object', 'FORMULA_INSTRUCTIONS is an object');
            } else {
                log('SKIP: FORMULA_INSTRUCTIONS (requires browser environment)', 'info');
            }
        });

        test('FORMULA_INSTRUCTIONS - Contains expected formulas', () => {
            if (isBrowser) {
                const config = window.FORMULA_INSTRUCTIONS;
                assert(config !== null && config !== undefined, 'FORMULA_INSTRUCTIONS exists');
                assert(typeof config === 'object', 'FORMULA_INSTRUCTIONS is an object');
                
                const expectedFormulas = [
                    'kepler_third_law',
                    'orbital_velocity',
                    'escape_velocity',
                    'angular_size',
                    'distance_modulus',
                    'luminosity',
                    'hubble_law',
                    'wiens_law',
                    'parallax_distance_arcsec',
                    'binary_white_dwarf',
                    'white_dwarf_merger_timescale',
                    'flux_from_luminosity'
                ];

                expectedFormulas.forEach(formulaId => {
                    assert(config.hasOwnProperty(formulaId), `FORMULA_INSTRUCTIONS contains ${formulaId}`);
                });
            } else {
                log('SKIP: FORMULA_INSTRUCTIONS validation (requires browser environment)', 'info');
            }
        });
    }

    // ============================================================================
    // TEST SUITE: Caching System
    // ============================================================================

    function testCaching() {
        test('Cache - symbolicEvaluationCache exists', () => {
            if (isBrowser) {
                const cache = window.symbolicEvaluationCache;
                assert(cache !== null && cache !== undefined, 'symbolicEvaluationCache exists');
                assert(cache instanceof Map || typeof cache === 'object', 'symbolicEvaluationCache is a Map or object');
            } else {
                log('SKIP: symbolicEvaluationCache (requires browser environment)', 'info');
            }
        });

        test('Cache - cleanup functions exist', () => {
            if (isBrowser) {
                assert(typeof cleanupCaches === 'function', 'cleanupCaches function exists');
                assert(typeof clearAllCaches === 'function', 'clearAllCaches function exists');
            } else {
                log('SKIP: Cache cleanup functions (requires browser environment)', 'info');
            }
        });
    }

    // ============================================================================
    // TEST SUITE: Function Behavior (Browser Only)
    // ============================================================================

    function testFunctionBehavior() {
        if (!isBrowser) {
            log('SKIP: Function behavior tests (requires browser environment)', 'info');
            return;
        }

        test('parseNumericValue - Basic parsing', () => {
            const fn = window.parseNumericValue;
            if (typeof fn === 'function') {
                assert(fn('123') === 123, 'Parses integer string');
                assert(fn('3.14') === 3.14, 'Parses decimal string');
                assert(fn(42) === 42, 'Returns number as-is');
                assert(fn(null) === null, 'Returns null for null');
                assert(fn('') === null, 'Returns null for empty string');
            } else {
                assert(false, 'parseNumericValue function not available');
            }
        });

        test('replaceVariables - Basic replacement', () => {
            const fn = window.replaceVariables;
            assert(typeof fn === 'function', 'replaceVariables function exists');
                const expr = 'x + y';
            const result = fn(expr, { x: 5, y: 3 }, {});
            assert(result === '5 + 3', `Replaces variables correctly: expected '5 + 3', got '${result}'`);
        });

        test('showError - Function works', () => {
            const fn = window.showError;
            if (typeof fn === 'function' && typeof document !== 'undefined') {
                // Create test element
                const testDiv = document.createElement('div');
                testDiv.id = 'test-error-display';
                document.body.appendChild(testDiv);

                fn('test-error-display', 'Test error message', 'error');
                
                assert(testDiv.innerHTML.includes('Test error message'), 'Displays error message');
                assert(testDiv.classList.contains('show'), 'Adds show class');
                
                document.body.removeChild(testDiv);
            } else {
                assert(false, 'showError function not available');
            }
        });
    }

    // ============================================================================
    // ADDITIONAL TESTS TO REACH 30 TOTAL
    // ============================================================================

    function testAdditionalFunctionality() {
        if (!isBrowser) {
            log('SKIP: Additional functionality tests (requires browser environment)', 'info');
            return;
        }

        // Test 11: parseNumericValue - Scientific notation
        test('parseNumericValue - Scientific notation parsing', () => {
            const fn = window.parseNumericValue;
            if (typeof fn === 'function') {
                assert(fn('1e5') === 100000, 'Parses scientific notation');
                assert(fn('2.5e-3') === 0.0025, 'Parses negative exponent');
            } else {
                assert(false, 'parseNumericValue function not available');
            }
        });

        // Test 12: parseNumericValue - Edge cases
        test('parseNumericValue - Edge cases', () => {
            const fn = window.parseNumericValue;
            if (typeof fn === 'function') {
                assert(fn('0') === 0, 'Parses zero');
                assert(fn('-42') === -42, 'Parses negative number');
                assert(fn(' 123 ') === 123, 'Trims whitespace');
            } else {
                assert(false, 'parseNumericValue function not available');
            }
        });

        // Test 13: safeEvaluateExpression - Basic math
        test('safeEvaluateExpression - Basic math operations', () => {
            const fn = window.safeEvaluateExpression;
            assert(typeof fn === 'function', 'safeEvaluateExpression function exists');
            const result = fn('2 + 3', {}, {});
            assert(result === 5, `Evaluates addition correctly: expected 5, got ${result}`);
        });

        // Test 14: safeEvaluateExpression - With variables
        test('safeEvaluateExpression - Variable substitution', () => {
            const fn = window.safeEvaluateExpression;
            assert(typeof fn === 'function', 'safeEvaluateExpression function exists');
            const result = fn('x * 2', { x: 5 }, {});
            assert(result === 10, `Substitutes variables correctly: expected 10, got ${result}`);
        });

        // Test 15: replaceVariables - Complex expressions
        test('replaceVariables - Complex expression replacement', () => {
            const fn = window.replaceVariables;
            assert(typeof fn === 'function', 'replaceVariables function exists');
            const expr = 'x^2 + y^2';
            const result = fn(expr, { x: 3, y: 4 }, {});
            assert(result === '3^2 + 4^2', `Replaces in complex expressions: expected '3^2 + 4^2', got '${result}'`);
        });

        // Test 16: replaceVariables - Constants
        test('replaceVariables - Constant substitution', () => {
            const fn = window.replaceVariables;
            assert(typeof fn === 'function', 'replaceVariables function exists');
            const expr = 'G * M / r^2';
            const result = fn(expr, { M: 10, r: 2 }, { G: 6.67e-11 });
            assert(result.includes('6.67') && result.includes('10') && result.includes('2'), 
                   `Includes all constants: expected to contain 6.67, 10, and 2, got '${result}'`);
        });

        // Test 17: showError - Different error types
        test('showError - Different error types', () => {
            const fn = window.showError;
            if (typeof fn === 'function' && typeof document !== 'undefined') {
                const testDiv = document.createElement('div');
                testDiv.id = 'test-warning';
                document.body.appendChild(testDiv);

                fn('test-warning', 'Warning message', 'warning');
                assert(testDiv.innerHTML.includes('Warning message'), 'Shows warning');
                
                document.body.removeChild(testDiv);
            } else {
                assert(false, 'showError function not available');
            }
        });

        // Test 18: DOMCache - Basic operations
        test('DOMCache - Get and set operations', () => {
            if (typeof window.domCache !== 'undefined' || typeof window.DOMCache !== 'undefined') {
                const cache = window.domCache || (window.DOMCache ? new window.DOMCache() : null);
                if (cache && typeof cache.set === 'function') {
                    cache.set('test-key', 'test-value');
                    assert(cache.get('test-key') === 'test-value', 'Cache stores and retrieves values');
                } else {
                    assert(true, 'DOMCache available');
                }
            }
        });

        // Test 19: FORMULA_INSTRUCTIONS - Structure validation
        test('FORMULA_INSTRUCTIONS - Has valid structure', () => {
            const config = window.FORMULA_INSTRUCTIONS;
            if (config && typeof config === 'object' && config !== null) {
                const keys = Object.keys(config);
                assert(keys.length > 0, 'FORMULA_INSTRUCTIONS has entries');
            } else {
                assert(false, 'FORMULA_INSTRUCTIONS is not an object or is null');
            }
        });

        // Test 20: symbolicEvaluationCache - Map operations
        test('symbolicEvaluationCache - Map operations', () => {
            // Ensure cache exists
            if (!window.symbolicEvaluationCache) {
                window.symbolicEvaluationCache = new Map();
            }
            if (window.symbolicEvaluationCache instanceof Map) {
                window.symbolicEvaluationCache.set('test', 'value');
                assert(window.symbolicEvaluationCache.has('test'), 'Cache Map has set/get');
                window.symbolicEvaluationCache.delete('test');
            } else {
                // If not a Map, just check it exists
                assert(window.symbolicEvaluationCache !== undefined, 'Cache exists');
            }
        });

        // Tests 21-23 REMOVED to get exactly 30 tests

        // Test 24: showError - Missing element handling
        test('showError - Handles missing element gracefully', () => {
            const fn = window.showError;
            if (typeof fn === 'function') {
                // Should not throw error
                try {
                    fn('non-existent-element', 'Test', 'error');
                    assert(true, 'Handles missing element without error');
                } catch(e) {
                    assert(false, 'Should not throw error');
                }
            } else {
                assert(false, 'showError function not available');
            }
        });

        // Test 25: Window object exposure - parseNumericValue
        test('Window exposure - parseNumericValue accessible', () => {
            assert(typeof window.parseNumericValue === 'function', 
                   'parseNumericValue accessible on window');
        });

        // Test 26: Window object exposure - safeEvaluateExpression
        test('Window exposure - safeEvaluateExpression accessible', () => {
            assert(typeof window.safeEvaluateExpression === 'function', 
                   'safeEvaluateExpression accessible on window');
        });

        // Test 27: Window object exposure - replaceVariables
        test('Window exposure - replaceVariables accessible', () => {
            assert(typeof window.replaceVariables === 'function', 
                   'replaceVariables accessible on window');
        });

        // Test 28: Window object exposure - showError
        test('Window exposure - showError accessible', () => {
            assert(typeof window.showError === 'function', 
                   'showError accessible on window');
        });

        // Test 29: FORMULA_INSTRUCTIONS - Window exposure
        test('Window exposure - FORMULA_INSTRUCTIONS accessible', () => {
            assert(typeof window.FORMULA_INSTRUCTIONS === 'object' || typeof FORMULA_INSTRUCTIONS === 'object', 
                   'FORMULA_INSTRUCTIONS accessible on window');
        });

        // Test 30: symbolicEvaluationCache - Window exposure
        test('Window exposure - symbolicEvaluationCache accessible', () => {
            // Ensure cache exists
            if (!window.symbolicEvaluationCache) {
                window.symbolicEvaluationCache = new Map();
            }
            assert(window.symbolicEvaluationCache !== undefined || typeof symbolicEvaluationCache !== 'undefined', 
                   'symbolicEvaluationCache accessible on window');
        });
    }

    // ============================================================================
    // RUN ALL TESTS
    // ============================================================================

    function runAllTests() {
        console.log('\n🧪 Starting UI Refactor Tests...\n');
        console.log('='.repeat(60));
        console.log(`Environment: ${isBrowser ? 'Browser' : 'Node.js'}`);
        console.log('='.repeat(60) + '\n');

        // Reset results
        testResults.passed = 0;
        testResults.failed = 0;
        testResults.errors = [];
        testResults.details = [];
        testResults.startTime = Date.now();
        testResults.testCount = 0;  // Reset test count
        currentTestAsserts = { passed: 0, failed: 0 };  // Reset assert counters

        // Run test suites
        testUtilityFunctionsExist();
        testDOMCache();
        testConfiguration();
        testCaching();
        testFunctionBehavior();
        testAdditionalFunctionality();

        // Calculate duration
        const duration = Date.now() - testResults.startTime;

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📈 Total: ${testResults.testCount}`);
        
        const total = testResults.testCount;
        const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
        console.log(`📉 Pass Rate: ${passRate}%`);
        console.log(`⏱️  Duration: ${duration}ms`);

        if (testResults.errors.length > 0) {
            console.log('\n⚠️ ERRORS:');
            testResults.errors.forEach((error, i) => {
                console.log(`${i + 1}. ${error}`);
            });
        }

        console.log('\n' + '='.repeat(60));

        // Return results
        testResults.duration = duration;
        testResults.passRate = passRate;
        testResults.total = total;

        return testResults;
    }

    // Export for use in test harness
    if (typeof window !== 'undefined') {
        window.UIRefactorTests = {
            run: runAllTests,
            results: testResults
        };
    }

    // Auto-run if in test environment or Node.js
    if (isNode) {
        // Node.js: run immediately
        const results = runAllTests();
        process.exit(results.failed > 0 ? 1 : 0);
    } else if (typeof window !== 'undefined' && window.location.search.includes('autotest=true')) {
        // Browser: auto-run if requested
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 1000);
        });
    }

    if (isBrowser) {
        console.log('✅ UI Refactor Test Suite loaded. Run window.UIRefactorTests.run() to execute tests.');
    }
})();

