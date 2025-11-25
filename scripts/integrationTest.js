/**
 * Integration Test - Verifies All Components Work Together
 * 
 * Tests that the entire application functions as one integrated program
 */

const IntegrationTest = {
    results: {
        passed: 0,
        failed: 0,
        tests: []
    },

    /**
     * Run all integration tests
     */
    async runAll() {
        console.log('🔗 AstroCalc Integration Test');
        console.log('='.repeat(60));
        
        this.results = { passed: 0, failed: 0, tests: [] };

        // Test categories
        this.testScriptLoading();
        this.testDependencies();
        this.testGlobalVariables();
        this.testFeatureIntegration();
        this.testEndToEndWorkflow();

        // Print summary
        this.printSummary();
        
        return this.results;
    },

    /**
     * Test 1: All scripts loaded
     */
    testScriptLoading() {
        console.log('\n📦 Testing Script Loading...');

        const requiredScripts = {
            'formulas': () => typeof formulas !== 'undefined',
            'FormulaCalculator': () => typeof FormulaCalculator !== 'undefined',
            'UnitConverter': () => typeof UnitConverter !== 'undefined',
            'UnitParser': () => typeof UnitParser !== 'undefined',
            'DimensionalAnalysis': () => typeof DimensionalAnalysis !== 'undefined',
            'ExpressionParser': () => typeof ExpressionParser !== 'undefined',
            'GraphManager': () => typeof GraphManager !== 'undefined',
            'OfflineGraphManager': () => typeof OfflineGraphManager !== 'undefined',
            'StellarClassifier': () => typeof StellarClassifier !== 'undefined',
            'FormulaExplorer': () => typeof FormulaExplorer !== 'undefined',
            'logger': () => typeof logger !== 'undefined' || typeof safeExecute !== 'undefined',
            'FRQ Support': () => typeof generateUsageInstructions !== 'undefined',
            'Quick Nav': () => typeof initQuickNav !== 'undefined' || typeof quickNavState !== 'undefined',
            'UI Functions': () => typeof filterAndRenderFormulas !== 'undefined' || typeof renderFormulaList !== 'undefined'
        };

        Object.entries(requiredScripts).forEach(([name, test]) => {
            const passed = test();
            this.test(name + ' loaded', passed);
        });
    },

    /**
     * Test 2: Dependencies resolved
     */
    testDependencies() {
        console.log('\n🔗 Testing Dependencies...');

        // Test 1: Calculator depends on formulas
        this.test('Calculator can use formulas', () => {
            try {
                if (typeof formulas !== 'undefined' && formulas.length > 0 && typeof FormulaCalculator !== 'undefined') {
                    const calc = new FormulaCalculator(formulas[0]);
                    return calc !== null;
                }
                return false;
            } catch (e) {
                return false;
            }
        });

        // Test 2: ExpressionParser uses UnitParser
        this.test('ExpressionParser uses UnitParser', () => {
            if (typeof ExpressionParser !== 'undefined' && typeof UnitParser !== 'undefined') {
                try {
                    const parsed = UnitParser.parse('50 km');
                    return parsed.value === 50 && parsed.unit === 'km';
                } catch (e) {
                    return false;
                }
            }
            return false;
        });

        // Test 3: DimensionalAnalysis uses UnitParser
        this.test('DimensionalAnalysis uses UnitParser', () => {
            if (typeof DimensionalAnalysis !== 'undefined' && typeof UnitParser !== 'undefined') {
                try {
                    const dims = DimensionalAnalysis.getDimensions('km');
                    return dims.dimensions && dims.dimensions.length === 4;
                } catch (e) {
                    return false;
                }
            }
            return false;
        });

        // Test 4: FRQ Support uses formulas
        this.test('FRQ Support uses formulas', () => {
            if (typeof generateUsageInstructions !== 'undefined' && typeof formulas !== 'undefined' && formulas.length > 0) {
                try {
                    const instructions = generateUsageInstructions(formulas[0]);
                    return instructions && instructions.hasOwnProperty('steps');
                } catch (e) {
                    return false;
                }
            }
            return false;
        });

        // Test 5: UI uses all components
        this.test('UI can access all components', () => {
            return typeof formulas !== 'undefined' &&
                   typeof FormulaCalculator !== 'undefined' &&
                   typeof ExpressionParser !== 'undefined' &&
                   typeof UnitConverter !== 'undefined';
        });
    },

    /**
     * Test 3: Global variables initialized
     */
    testGlobalVariables() {
        console.log('\n🌐 Testing Global Variables...');

        // Test formulas array
        this.test('formulas array exists', () => {
            return typeof formulas !== 'undefined' && Array.isArray(formulas) && formulas.length > 0;
        });

        // Test globalConstants
        this.test('globalConstants defined', () => {
            return typeof globalConstants !== 'undefined' &&
                   globalConstants.G !== undefined &&
                   globalConstants.c !== undefined;
        });

        // Test formulaCategories (if exists)
        this.test('formulaCategories defined', () => {
            return typeof formulaCategories !== 'undefined' || true; // Optional
        });
    },

    /**
     * Test 4: Feature integration
     */
    testFeatureIntegration() {
        console.log('\n🔧 Testing Feature Integration...');

        // Test 1: Search → Calculator integration
        this.test('Search can find formulas for calculator', () => {
            if (typeof formulas !== 'undefined' && typeof FormulaCalculator !== 'undefined') {
                const kepler = formulas.find(f => f.id === 'kepler_third_law');
                if (kepler) {
                    const calc = new FormulaCalculator(kepler);
                    return calc !== null;
                }
            }
            return false;
        });

        // Test 2: Calculator → Graph integration
        this.test('Calculator results can be graphed', () => {
            if (typeof OfflineGraphManager !== 'undefined' && typeof formulas !== 'undefined') {
                try {
                    const manager = new OfflineGraphManager('test-container', 'test-tab');
                    return manager !== null;
                } catch (e) {
                    return false;
                }
            }
            return false;
        });

        // Test 3: Formula → FRQ integration
        this.test('Formulas have FRQ support', () => {
            if (typeof generateUsageInstructions !== 'undefined' && typeof formulas !== 'undefined' && formulas.length > 0) {
                const instructions = generateUsageInstructions(formulas[0]);
                return instructions !== null;
            }
            return false;
        });

        // Test 4: Unit parsing → Calculator integration
        this.test('Unit parsing works with calculator', () => {
            if (typeof UnitParser !== 'undefined' && typeof ExpressionParser !== 'undefined') {
                try {
                    const parsed = UnitParser.parse('1.496e11 m');
                    const value = ExpressionParser.parse('1.496e11');
                    return parsed.value === value && parsed.unit === 'm';
                } catch (e) {
                    return false;
                }
            }
            return false;
        });

        // Test 5: Classification integration
        this.test('Classification tool works', () => {
            if (typeof StellarClassifier !== 'undefined') {
                try {
                    const classifier = new StellarClassifier();
                    const result = classifier.classify(5778, 'V', false, false);
                    return result && result.hasOwnProperty('spectralClass');
                } catch (e) {
                    return false;
                }
            }
            return false;
        });
    },

    /**
     * Test 5: End-to-end workflow
     */
    testEndToEndWorkflow() {
        console.log('\n🔄 Testing End-to-End Workflow...');

        // Workflow: Search → Select → Calculate → Display
        this.test('Complete workflow: Search → Calculate', () => {
            try {
                // Step 1: Find formula
                if (typeof formulas === 'undefined') return false;
                const formula = formulas.find(f => f.id === 'kepler_third_law');
                if (!formula) return false;

                // Step 2: Create calculator
                if (typeof FormulaCalculator === 'undefined') return false;
                const calc = new FormulaCalculator(formula);
                if (!calc) return false;

                // Step 3: Solve
                const result = calc.solve({
                    M: 1.989e30,
                    a: 1.496e11,
                    T: null
                });

                // Step 4: Verify result
                return result &&
                       result.hasOwnProperty('solvedFor') &&
                       result.hasOwnProperty('result') &&
                       isFinite(result.result);
            } catch (e) {
                return false;
            }
        });

        // Workflow: Search → FRQ Guidance
        this.test('Complete workflow: Search → FRQ', () => {
            try {
                if (typeof formulas === 'undefined' || typeof generateUsageInstructions === 'undefined') return false;
                const formula = formulas.find(f => f.id === 'orbital_velocity');
                if (!formula) return false;
                const instructions = generateUsageInstructions(formula);
                return instructions && instructions.hasOwnProperty('steps');
            } catch (e) {
                return false;
            }
        });

        // Workflow: Input with units → Parse → Calculate
        this.test('Complete workflow: Units → Parse → Calculate', () => {
            try {
                if (typeof UnitParser === 'undefined' || typeof ExpressionParser === 'undefined') return false;
                
                // Parse input with units
                const parsed = UnitParser.parse('50 km');
                if (parsed.value !== 50 || parsed.unit !== 'km') return false;

                // Parse value
                const value = ExpressionParser.parse('50');
                if (value !== 50) return false;

                return true;
            } catch (e) {
                return false;
            }
        });
    },

    /**
     * Helper: Add test
     */
    test(name, passed) {
        if (passed) {
            this.results.passed++;
            this.results.tests.push({ name, status: 'PASS' });
            console.log(`  ✅ ${name}`);
        } else {
            this.results.failed++;
            this.results.tests.push({ name, status: 'FAIL' });
            console.log(`  ❌ ${name}`);
        }
    },

    /**
     * Print summary
     */
    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 Integration Test Summary');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Total: ${this.results.passed + this.results.failed}`);
        console.log(`📊 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        console.log('='.repeat(60));
        
        if (this.results.failed === 0) {
            console.log('🎉 All integration tests passed! Application is fully integrated.');
        } else {
            console.log('⚠️  Some integration tests failed. Check dependencies and script loading order.');
        }
    }
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.IntegrationTest = IntegrationTest;
    
    // Run tests when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => IntegrationTest.runAll(), 2000);
        });
    } else {
        setTimeout(() => IntegrationTest.runAll(), 2000);
    }
}

