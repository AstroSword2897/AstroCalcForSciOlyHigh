/**
 * Production-Ready Formula Verification Test Suite
 * 
 * Modular, reusable test framework for verifying fundamental astrophysical formulas
 * with automatic pass/fail tracking, JSON export, and CI/CD integration.
 * 
 * Version: 2.1.0
 * Date: December 23, 2025
 * 
 * Features:
 * - Verbose/silent modes for CI/CD
 * - Custom test registry for dynamic test addition
 * - Node.js exit codes for automated builds
 * - Comprehensive unit annotation
 * - Flexible tolerance handling (relative/absolute)
 * - Async support ready
 */

class FormulaVerificationSuite {
    constructor(options = {}) {
        this.results = [];
        this.summary = {
            total: 0,
            passed: 0,
            failed: 0,
            successRate: 0
        };
        
        // Configuration options
        this.verbose = options.verbose !== false; // Default to true
        this.exitOnFailure = options.exitOnFailure !== false; // Default to true in Node.js
        this.customTests = []; // Registry for dynamically added tests
        
        // Physical constants
        this.constants = {
            G: 6.67430e-11,      // Gravitational constant
            M_sun: 1.989e30,     // Solar mass
            M_earth: 5.972e24,   // Earth mass
            R_earth: 6.371e6,    // Earth radius in meters
            AU: 1.496e11,        // 1 AU in meters
            year_sec: 3.156e7,   // 1 year in seconds
            L_sun: 3.828e26,     // Solar luminosity
            b_wien: 2.898e-3,    // Wien's constant
            T_sun: 5778          // Solar temperature
        };
    }
    
    /**
     * Add a custom test to the registry
     * Allows dynamic test addition without modifying runAll()
     * 
     * @param {string} name - Test name
     * @param {Function} testFn - Test function that returns {calculated, expected, threshold?, unit?, useAbsoluteTolerance?}
     * @param {Object} metadata - Optional metadata (description, category, etc.)
     */
    addTest(name, testFn, metadata = {}) {
        this.customTests.push({
            name,
            testFn,
            metadata: {
                description: metadata.description || '',
                category: metadata.category || 'custom',
                ...metadata
            }
        });
    }
    
    /**
     * Verify a calculation with automatic error checking
     * 
     * @param {string} name - Test name
     * @param {number} calculated - Calculated value
     * @param {number} expected - Expected value
     * @param {number} threshold - Error threshold (default 0.05 = 5%)
     * @param {string} unit - Unit string for display
     * @param {boolean} useAbsoluteTolerance - Use absolute instead of relative error (for magnitudes)
     * @returns {boolean} True if test passed
     */
    verifyTest(name, calculated, expected, threshold = 0.05, unit = '', useAbsoluteTolerance = false) {
        this.summary.total++;
        
        let errorPct;
        let errorAbs;
        let pass;
        
        if (useAbsoluteTolerance) {
            // Absolute tolerance (for magnitudes, logarithmic quantities)
            // NOTE: When expected === 0, errorAbs is just |calculated|, and pass is true if errorAbs < threshold
            errorAbs = Math.abs(calculated - expected);
            pass = errorAbs < threshold;
            errorPct = expected !== 0 ? (errorAbs / Math.abs(expected)) * 100 : (errorAbs > 0 ? Infinity : 0);
        } else {
            // Relative percentage error
            if (expected === 0) {
                // Handle zero expected value: use absolute tolerance
                // NOTE: This is documented behavior - when expected === 0, we use absolute tolerance
                errorAbs = Math.abs(calculated);
                pass = errorAbs < threshold;
                errorPct = errorAbs > 0 ? Infinity : 0;
            } else {
                errorPct = Math.abs(calculated - expected) / Math.abs(expected) * 100;
                pass = errorPct < (threshold * 100);
                errorAbs = Math.abs(calculated - expected);
            }
        }
        
        const testResult = {
            name: name,
            calculated: calculated,
            expected: expected,
            error: useAbsoluteTolerance ? errorAbs : errorPct,
            threshold: useAbsoluteTolerance ? threshold : (threshold * 100),
            unit: unit,
            useAbsoluteTolerance: useAbsoluteTolerance,
            passed: pass,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(testResult);
        
        // Verbose logging (skip in CI/CD mode)
        if (this.verbose) {
            if (pass) {
                console.log(`\n✅ ${name}`);
            } else {
                console.log(`\n❌ ${name}`);
            }
            
            console.log(`   Calculated: ${this.formatValue(calculated)}${unit}`);
            console.log(`   Expected:   ${this.formatValue(expected)}${unit}`);
            
            if (useAbsoluteTolerance) {
                console.log(`   Error:      ${errorAbs.toExponential(3)} (threshold: ${threshold}) ${pass ? '✓ PASS' : '✗ FAIL'}`);
            } else {
                console.log(`   Error:      ${errorPct.toFixed(2)}% (threshold: ${(threshold * 100).toFixed(2)}%) ${pass ? '✓ PASS' : '✗ FAIL'}`);
            }
        }
        
        return pass;
    }
    
    /**
     * Format value for display (scientific notation for large/small numbers)
     * 
     * @param {number} value - Value to format
     * @param {number} precision - Decimal precision
     * @param {boolean} forceScientific - Force scientific notation
     * @returns {string} Formatted value string
     */
    formatValue(value, precision = 3, forceScientific = false) {
        if (forceScientific || Math.abs(value) < 0.001 || Math.abs(value) > 1e6) {
            return value.toExponential(precision);
        }
        return value.toFixed(precision);
    }
    
    /**
     * Run all formula verification tests (built-in + custom)
     */
    runAll() {
        if (this.verbose) {
            console.log('🧪 Formula Verification Test Suite');
            console.log('='.repeat(80));
            console.log('Testing fundamental astrophysical formulas with known values\n');
        }
        
        const c = this.constants;
        
        // Test 1: Kepler's Third Law
        this.verifyTest(
            "Kepler's Third Law - Earth around Sun",
            Math.cbrt((c.year_sec * c.year_sec * c.G * c.M_sun) / (4 * Math.PI * Math.PI)),
            c.AU,
            0.05,
            ' m'
        );
        
        // Test 2: Orbital Velocity
        const v_orbital = Math.sqrt((c.G * c.M_sun) / c.AU);
        this.verifyTest(
            "Orbital Velocity - Earth",
            v_orbital,
            29780,
            0.05,
            ' m/s'
        );
        
        // Test 3: Escape Velocity
        const v_escape = Math.sqrt((2 * c.G * c.M_earth) / c.R_earth);
        this.verifyTest(
            "Escape Velocity - Earth",
            v_escape,
            11186,
            0.05,
            ' m/s'
        );
        
        // Test 4: Parallax Distance
        // NOTE: Parallax is in arcseconds (arcsec), distance in parsecs (pc)
        // Formula: d (pc) = 1 / p (arcsec)
        const p_prox = 0.7687; // arcseconds
        const d_prox = 1 / p_prox;
        this.verifyTest(
            "Parallax Distance - Proxima Centauri",
            d_prox,
            1.301,
            0.05,
            ' pc'
        );
        
        // Test 5: Surface Gravity
        const g_earth = (c.G * c.M_earth) / (c.R_earth * c.R_earth);
        this.verifyTest(
            "Surface Gravity - Earth",
            g_earth,
            9.81,
            0.05,
            ' m/s²'
        );
        
        // Test 6: Distance Modulus
        // NOTE: Standard formula: m - M = 5 log₁₀(d) - 5
        // At 10 pc, m = M (by definition), so m = M = 5 gives m = 5
        const M_star = 5;
        const d_star = 10; // parsecs
        const m_star = M_star + 5 * Math.log10(d_star) - 5;
        this.verifyTest(
            "Distance Modulus - Star at 10 pc",
            m_star,
            5,
            0.1, // 0.1 magnitude absolute tolerance
            '',
            true // Use absolute tolerance
        );
        
        // Test 7: Average Density
        const rho_earth = (3 * c.M_earth) / (4 * Math.PI * c.R_earth * c.R_earth * c.R_earth);
        this.verifyTest(
            "Average Density - Earth",
            rho_earth,
            5514,
            0.05,
            ' kg/m³'
        );
        
        // Test 8: Rotational Velocity
        const P_rot = 86400; // 1 day in seconds
        const v_rot = (2 * Math.PI * c.R_earth) / P_rot;
        this.verifyTest(
            "Rotational Velocity - Earth",
            v_rot,
            463,
            0.05,
            ' m/s'
        );
        
        // Test 9: Wien's Law
        const lambda_max = c.b_wien / c.T_sun;
        const expected_wien = 5.01e-7;
        this.verifyTest(
            "Wien's Law - Sun",
            lambda_max,
            expected_wien,
            0.05,
            ' m'
        );
        
        // Test 10: Flux from Luminosity
        const F_sun = c.L_sun / (4 * Math.PI * c.AU * c.AU);
        this.verifyTest(
            "Flux from Luminosity - Sun at 1 AU",
            F_sun,
            1361,
            0.05,
            ' W/m²'
        );
        
        // Run custom tests from registry
        for (const customTest of this.customTests) {
            try {
                const testData = customTest.testFn();
                this.verifyTest(
                    customTest.name,
                    testData.calculated,
                    testData.expected,
                    testData.threshold || 0.05,
                    testData.unit || '',
                    testData.useAbsoluteTolerance || false
                );
            } catch (error) {
                // Custom test failed to execute
                this.summary.total++;
                this.summary.failed++;
                this.results.push({
                    name: customTest.name,
                    calculated: null,
                    expected: null,
                    error: null,
                    threshold: null,
                    unit: '',
                    useAbsoluteTolerance: false,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
                if (this.verbose) {
                    console.log(`\n❌ ${customTest.name} - Test execution error: ${error.message}`);
                }
            }
        }
        
        // Calculate summary (ensure counts are correct)
        this.summary.passed = this.results.filter(r => r.passed).length;
        this.summary.failed = this.results.filter(r => !r.passed).length;
        this.summary.total = this.results.length;
        this.summary.successRate = this.summary.total > 0 
            ? (this.summary.passed / this.summary.total * 100).toFixed(2)
            : 0;
        
        // Print summary
        this.printSummary();
        
        // Export results
        const exportData = this.exportResults();
        
        // Node.js exit code handling for CI/CD
        if (typeof process !== 'undefined' && process.exit && this.exitOnFailure) {
            if (this.summary.failed > 0) {
                process.exit(1); // Fail build if any tests failed
            } else {
                process.exit(0); // Success
            }
        }
        
        return exportData;
    }
    
    /**
     * Print test summary
     */
    printSummary() {
        if (this.verbose) {
            console.log('\n' + '='.repeat(80));
            console.log('📊 Test Summary');
            console.log('='.repeat(80));
            console.log(`Total Tests:  ${this.summary.total}`);
            console.log(`✅ Passed:     ${this.summary.passed}`);
            console.log(`❌ Failed:     ${this.summary.failed}`);
            console.log(`📈 Success Rate: ${this.summary.successRate}%`);
            console.log('='.repeat(80));
            
            if (this.summary.failed === 0) {
                console.log('\n🎉 All tests passed!');
            } else {
                console.log(`\n⚠️  ${this.summary.failed} test(s) failed. Review errors above.`);
            }
        } else {
            // Silent mode: only print summary
            console.log(`Tests: ${this.summary.passed}/${this.summary.total} passed (${this.summary.successRate}%)`);
            if (this.summary.failed > 0) {
                console.error(`FAILED: ${this.summary.failed} test(s) failed`);
            }
        }
    }
    
    /**
     * Export results as JSON for CI/CD
     * Includes comprehensive unit annotation and metadata
     */
    exportResults() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2.1.0',
            summary: this.summary,
            tests: this.results.map(result => ({
                name: result.name,
                calculated: result.calculated,
                expected: result.expected,
                error: result.error,
                threshold: result.threshold,
                unit: result.unit,
                useAbsoluteTolerance: result.useAbsoluteTolerance,
                passed: result.passed,
                timestamp: result.timestamp
            })),
            constants: this.constants,
            metadata: {
                verbose: this.verbose,
                exitOnFailure: this.exitOnFailure,
                customTestsCount: this.customTests.length
            }
        };
        
        // Store in global for access
        if (typeof window !== 'undefined') {
            window.formulaVerificationResults = exportData;
        }
        
        // Log JSON for CI/CD (always, even in silent mode)
        if (this.verbose) {
            console.log('\n📄 JSON Export (for CI/CD):');
            console.log(JSON.stringify(exportData, null, 2));
        } else {
            // Silent mode: output JSON only (for CI/CD parsing)
            console.log(JSON.stringify(exportData, null, 2));
        }
        
        return exportData;
    }
    
    /**
     * Get failed tests for detailed analysis
     * @returns {Array} Array of failed test results
     */
    getFailedTests() {
        return this.results.filter(r => !r.passed);
    }
    
    /**
     * Get passed tests
     * @returns {Array} Array of passed test results
     */
    getPassedTests() {
        return this.results.filter(r => r.passed);
    }
}

// Auto-run if in browser console (with verbose mode)
if (typeof window !== 'undefined') {
    window.FormulaVerificationSuite = FormulaVerificationSuite;
    
    // Run tests automatically (verbose mode for browser)
    const suite = new FormulaVerificationSuite({ verbose: true, exitOnFailure: false });
    suite.runAll();
}

// Node.js support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormulaVerificationSuite;
    
    // Auto-run in Node.js if executed directly
    // Supports --silent flag for CI/CD
    if (require.main === module) {
        const args = process.argv.slice(2);
        const silent = args.includes('--silent') || args.includes('-s');
        const noExit = args.includes('--no-exit');
        
        const suite = new FormulaVerificationSuite({
            verbose: !silent,
            exitOnFailure: !noExit
        });
        
        suite.runAll();
    }
}
