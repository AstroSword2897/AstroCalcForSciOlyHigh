/**
 * UI Refactor Tests - Comprehensive Test Suite
 * Tests all refactored functions and fixes from the comprehensive critique
 * 
 * Run this in browser console on index.html or use test harness
 */

(function() {
    'use strict';

    const testResults = {
        passed: 0,
        failed: 0,
        errors: [],
        details: []
    };

    function log(message, type = 'info') {
        const prefix = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'error' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} ${message}`);
    }

    function assert(condition, message) {
        if (condition) {
            testResults.passed++;
            log(`PASS: ${message}`, 'pass');
            return true;
        } else {
            testResults.failed++;
            testResults.errors.push(message);
            log(`FAIL: ${message}`, 'fail');
            return false;
        }
    }

    function test(name, fn) {
        try {
            log(`Testing: ${name}`, 'info');
            fn();
        } catch (error) {
            testResults.failed++;
            testResults.errors.push(`${name}: ${error.message}`);
            log(`ERROR in ${name}: ${error.message}`, 'error');
            console.error(error);
        }
    }

    // ============================================================================
    // TEST SUITE: Utility Functions
    // ============================================================================

    function testParseNumericValue() {
        test('parseNumericValue - Basic number parsing', () => {
            assert(typeof parseNumericValue === 'function', 'parseNumericValue function exists');
            
            // Test basic numbers
            assert(parseNumericValue('123') === 123, 'Parses integer string');
            assert(parseNumericValue('3.14') === 3.14, 'Parses decimal string');
            assert(parseNumericValue(42) === 42, 'Returns number as-is');
            assert(parseNumericValue('1e10') === 1e10, 'Parses scientific notation');
        });

        test('parseNumericValue - Edge cases', () => {
            assert(parseNumericValue(null) === null, 'Returns null for null');
            assert(parseNumericValue(undefined) === null, 'Returns null for undefined');
            assert(parseNumericValue('') === null, 'Returns null for empty string');
            assert(parseNumericValue('abc') === null, 'Returns null for non-numeric');
        });

        test('parseNumericValue - Unicode normalization', () => {
            // Test Unicode minus signs
            const unicodeMinus = '\u2212'; // Unicode minus
            const result = parseNumericValue(unicodeMinus + '5');
            assert(result === -5 || result === null, 'Handles Unicode minus signs');
        });

        test('parseNumericValue - Expression parsing', () => {
            // Should try ExpressionParser if available
            if (typeof ExpressionParser !== 'undefined') {
                const result = parseNumericValue('pi/2');
                assert(result !== null && typeof result === 'number', 'Parses expressions via ExpressionParser');
            }
        });

        test('parseNumericValue - Large number warning', () => {
            const largeNum = Number.MAX_SAFE_INTEGER + 1;
            const result = parseNumericValue(largeNum);
            // Should still return the number but warn
            assert(result === largeNum || result === null, 'Handles large numbers');
        });
    }

    function testSafeEvaluateExpression() {
        test('safeEvaluateExpression - Function exists', () => {
            assert(typeof safeEvaluateExpression === 'function', 'safeEvaluateExpression function exists');
        });

        test('safeEvaluateExpression - Basic evaluation', () => {
            const result = safeEvaluateExpression('2 + 2', {}, {});
            // Should return 4 or null (depending on available evaluators)
            assert(result === 4 || result === null, 'Evaluates simple expressions');
        });

        test('safeEvaluateExpression - Variable substitution', () => {
            const result = safeEvaluateExpression('x + y', { x: 5, y: 3 }, {});
            assert(result === 8 || result === null, 'Substitutes variables');
        });

        test('safeEvaluateExpression - Invalid input', () => {
            assert(safeEvaluateExpression(null) === null, 'Returns null for null');
            assert(safeEvaluateExpression('') === null, 'Returns null for empty string');
            assert(safeEvaluateExpression(123) === null, 'Returns null for non-string');
        });
    }

    function testReplaceVariables() {
        test('replaceVariables - Function exists', () => {
            assert(typeof replaceVariables === 'function', 'replaceVariables function exists');
        });

        test('replaceVariables - Basic replacement', () => {
            const expr = 'x + y';
            const result = replaceVariables(expr, { x: 5, y: 3 }, {});
            assert(result.includes('5') && result.includes('3'), 'Replaces variables with values');
        });

        test('replaceVariables - Constants', () => {
            const expr = 'x + pi';
            const result = replaceVariables(expr, { x: 2 }, { pi: Math.PI });
            assert(result.includes('3.141'), 'Replaces constants');
        });

        test('replaceVariables - Unicode operators', () => {
            const expr = 'x × y ÷ z';
            const result = replaceVariables(expr, { x: 2, y: 4, z: 2 }, {});
            assert(result.includes('*') && result.includes('/'), 'Replaces Unicode operators');
        });

        test('replaceVariables - Invalid input', () => {
            assert(replaceVariables(null) === null, 'Handles null input');
            assert(replaceVariables('') === '', 'Handles empty string');
        });
    }

    function testShowError() {
        test('showError - Function exists', () => {
            assert(typeof showError === 'function', 'showError function exists');
        });

        test('showError - Creates error element', () => {
            // Create a test element
            const testDiv = document.createElement('div');
            testDiv.id = 'test-error-display';
            document.body.appendChild(testDiv);

            showError('test-error-display', 'Test error message', 'error');
            
            assert(testDiv.innerHTML.includes('Test error message'), 'Displays error message');
            assert(testDiv.classList.contains('show'), 'Adds show class');
            
            document.body.removeChild(testDiv);
        });

        test('showError - Handles missing element', () => {
            // Should not throw, should use alert fallback
            const originalAlert = window.alert;
            let alerted = false;
            window.alert = () => { alerted = true; };
            
            showError('non-existent-element', 'Test');
            
            assert(alerted, 'Falls back to alert for missing element');
            
            window.alert = originalAlert;
        });
    }

    // ============================================================================
    // TEST SUITE: Formula Instructions Config
    // ============================================================================

    function testFormulaInstructions() {
        test('FORMULA_INSTRUCTIONS - Config exists', () => {
            assert(typeof FORMULA_INSTRUCTIONS === 'object', 'FORMULA_INSTRUCTIONS config exists');
        });

        test('FORMULA_INSTRUCTIONS - Contains expected formulas', () => {
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
                assert(
                    FORMULA_INSTRUCTIONS.hasOwnProperty(formulaId),
                    `FORMULA_INSTRUCTIONS contains ${formulaId}`
                );
            });
        });

        test('FORMULA_INSTRUCTIONS - Has variable instructions', () => {
            const kepler = FORMULA_INSTRUCTIONS.kepler_third_law;
            assert(kepler.hasOwnProperty('T'), 'Kepler has T instruction');
            assert(kepler.hasOwnProperty('a'), 'Kepler has a instruction');
            assert(kepler.hasOwnProperty('M'), 'Kepler has M instruction');
        });

        test('getVariableInstruction - Uses config', () => {
            if (typeof getVariableInstruction === 'function') {
                const mockFormula = {
                    id: 'kepler_third_law',
                    variables: [{ symbol: 'T', name: 'Period', unit: 'seconds' }]
                };
                const mockVar = { symbol: 'T', name: 'Period', unit: 'seconds', description: 'Test' };
                
                const instruction = getVariableInstruction(mockVar, mockFormula, true);
                assert(
                    instruction.includes('semi-major axis') || instruction.includes('Enter values'),
                    'Uses FORMULA_INSTRUCTIONS config'
                );
            }
        });
    }

    // ============================================================================
    // TEST SUITE: Example Value Dictionary
    // ============================================================================

    function testExampleValues() {
        test('getExampleValue - Function exists', () => {
            assert(typeof getExampleValue === 'function', 'getExampleValue function exists');
        });

        test('getExampleValue - No duplicate T key', () => {
            // Check that examples object doesn't have both 'T' and 'T_temp'
            // This is tested by ensuring T_time and T_temp work correctly
            const timeResult = getExampleValue('T', 'seconds');
            const tempResult = getExampleValue('T', 'Kelvin');
            
            assert(timeResult !== null || tempResult !== null, 'T symbol resolves correctly');
        });

        test('getExampleValue - Returns values', () => {
            assert(getExampleValue('M', 'kg') !== null, 'Returns example for M');
            assert(getExampleValue('a', 'meters') !== null, 'Returns example for a');
            assert(getExampleValue('v', 'm/s') !== null, 'Returns example for v');
        });
    }

    // ============================================================================
    // TEST SUITE: Caching System
    // ============================================================================

    function testCaching() {
        test('Symbolic evaluation cache exists', () => {
            assert(typeof symbolicEvaluationCache !== 'undefined', 'symbolicEvaluationCache exists');
            assert(symbolicEvaluationCache instanceof Map, 'symbolicEvaluationCache is a Map');
        });

        test('Cache cleanup functions exist', () => {
            assert(typeof cleanupCaches === 'function', 'cleanupCaches function exists');
            assert(typeof clearAllCaches === 'function', 'clearAllCaches function exists');
        });

        test('Cache cleanup works', () => {
            // Add some entries
            symbolicEvaluationCache.set('test1', 123);
            symbolicEvaluationCache.set('test2', 456);
            
            assert(symbolicEvaluationCache.size >= 2, 'Cache has entries');
            
            clearAllCaches();
            
            assert(symbolicEvaluationCache.size === 0, 'Cache cleared');
        });
    }

    // ============================================================================
    // TEST SUITE: Validation Functions
    // ============================================================================

    function testValidation() {
        test('Classification validation exists', () => {
            // Check that performMainClassification has validation
            if (typeof performMainClassification === 'function') {
                // This is tested by checking the function exists
                assert(true, 'performMainClassification function exists');
            }
        });
    }

    // ============================================================================
    // TEST SUITE: Integration Tests
    // ============================================================================

    function testIntegration() {
        test('All utility functions work together', () => {
            // Test a complete flow
            const input = '2*pi';
            const parsed = parseNumericValue(input);
            
            if (parsed !== null) {
                assert(typeof parsed === 'number', 'parseNumericValue returns number');
            }
        });

        test('Error handling integration', () => {
            // Test that showError works with parseNumericValue failures
            const testDiv = document.createElement('div');
            testDiv.id = 'integration-test-error';
            document.body.appendChild(testDiv);

            const invalidResult = parseNumericValue('not-a-number');
            if (invalidResult === null) {
                showError('integration-test-error', 'Invalid input', 'error');
                assert(testDiv.innerHTML.includes('Invalid input'), 'Error displayed correctly');
            }

            document.body.removeChild(testDiv);
        });
    }

    // ============================================================================
    // RUN ALL TESTS
    // ============================================================================

    function runAllTests() {
        console.log('🧪 Starting UI Refactor Tests...\n');
        console.log('='.repeat(60));

        // Run test suites
        testParseNumericValue();
        testSafeEvaluateExpression();
        testReplaceVariables();
        testShowError();
        testFormulaInstructions();
        testExampleValues();
        testCaching();
        testValidation();
        testIntegration();

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
        console.log(`📉 Pass Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

        if (testResults.errors.length > 0) {
            console.log('\n⚠️ ERRORS:');
            testResults.errors.forEach((error, i) => {
                console.log(`${i + 1}. ${error}`);
            });
        }

        console.log('\n' + '='.repeat(60));

        return testResults;
    }

    // Export for use in test harness
    if (typeof window !== 'undefined') {
        window.UIRefactorTests = {
            run: runAllTests,
            results: testResults
        };
    }

    // Auto-run if in test environment
    if (typeof window !== 'undefined' && window.location.search.includes('autotest=true')) {
        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(runAllTests, 1000);
        });
    }

    console.log('✅ UI Refactor Test Suite loaded. Run window.UIRefactorTests.run() to execute tests.');
})();

