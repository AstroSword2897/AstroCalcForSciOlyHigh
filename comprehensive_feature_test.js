/**
 * Comprehensive Feature Testing Suite
 * Tests all features 5 times:
 * 1. Basic run-down
 * 2-4. In-depth complex problem testing
 * 5. Complex equation response testing
 * 
 * Continues improving until seamless integration, accurate answers, and proper declarations
 */

class ComprehensiveFeatureTester {
    constructor() {
        this.results = {
            round1: { basic: {} },
            round2: { complex1: {} },
            round3: { complex2: {} },
            round4: { complex3: {} },
            round5: { equations: {} }
        };
        this.issues = [];
        this.testCount = 0;
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Feature Testing Suite');
        console.log('='.repeat(80));
        
        // Round 1: Basic Run-Down
        console.log('\n📋 ROUND 1: Basic Run-Down of All Features');
        console.log('-'.repeat(80));
        await this.round1Basic();
        
        // Round 2-4: Complex Problem Testing
        console.log('\n🔬 ROUND 2: In-Depth Complex Problem Testing (Integration & Accuracy)');
        console.log('-'.repeat(80));
        await this.round2Complex1();
        
        console.log('\n🔬 ROUND 3: In-Depth Complex Problem Testing (Edge Cases & Precision)');
        console.log('-'.repeat(80));
        await this.round3Complex2();
        
        console.log('\n🔬 ROUND 4: In-Depth Complex Problem Testing (Multi-Step Workflows)');
        console.log('-'.repeat(80));
        await this.round4Complex3();
        
        // Round 5: Complex Equations
        console.log('\n📐 ROUND 5: Complex Equation Response Testing');
        console.log('-'.repeat(80));
        await this.round5Equations();
        
        // Summary
        this.printSummary();
        
        // Fix issues and iterate
        if (this.issues.length > 0) {
            console.log('\n🔧 Issues found. Fixing and re-testing...');
            await this.fixAndRetest();
        }
    }

    async round1Basic() {
        const features = [
            'Formula Search',
            'Calculator',
            'Graph',
            'Classification',
            'Explorer',
            'FRQ Support'
        ];

        for (const feature of features) {
            console.log(`\n  Testing ${feature} (Basic)...`);
            try {
                const result = await this.testFeatureBasic(feature);
                this.results.round1.basic[feature] = result;
                if (!result.success) {
                    this.issues.push({ round: 1, feature, issue: result.error });
                }
            } catch (error) {
                this.issues.push({ round: 1, feature, issue: error.message });
                this.results.round1.basic[feature] = { success: false, error: error.message };
            }
        }
    }

    async testFeatureBasic(feature) {
        this.testCount++;
        const startTime = performance.now();
        
        switch (feature) {
            case 'Formula Search':
                return await this.testSearchBasic();
            case 'Calculator':
                return await this.testCalculatorBasic();
            case 'Graph':
                return await this.testGraphBasic();
            case 'Classification':
                return await this.testClassificationBasic();
            case 'Explorer':
                return await this.testExplorerBasic();
            case 'FRQ Support':
                return await this.testFRQBasic();
            default:
                return { success: false, error: 'Unknown feature' };
        }
    }

    async testSearchBasic() {
        // Test 1: Simple keyword search
        if (!window.FormulaSearchEngine) {
            return { success: false, error: 'FormulaSearchEngine not available' };
        }
        
        const searchEngine = new FormulaSearchEngine(formulas);
        const results = searchEngine.search('escape velocity', { limit: 5 });
        
        if (!results || results.length === 0) {
            return { success: false, error: 'No search results returned' };
        }
        
        // Test 2: Natural language query
        const nlResults = searchEngine.search('how to calculate the speed needed to escape a planet', { limit: 5 });
        
        return {
            success: true,
            keywordResults: results.length,
            nlResults: nlResults.length,
            topResult: results[0]?.formula?.name || 'N/A'
        };
    }

    async testCalculatorBasic() {
        // Test with escape velocity formula
        const formula = formulas.find(f => f.id === 'escape_velocity');
        if (!formula) {
            return { success: false, error: 'Escape velocity formula not found' };
        }
        
        if (!window.FormulaCalculator) {
            return { success: false, error: 'FormulaCalculator not available' };
        }
        
        const calc = new FormulaCalculator(formula);
        
        // Test: Calculate escape velocity for Earth
        // M = 5.972e24 kg, r = 6.371e6 m
        const result = calc.solve({
            M: 5.972e24,
            r: 6.371e6
        });
        
        if (!result || !result.result) {
            return { success: false, error: 'Calculation failed' };
        }
        
        // Expected: ~11,186 m/s
        const expected = 11186;
        const actual = result.result;
        const error = Math.abs(actual - expected) / expected;
        
        return {
            success: error < 0.01, // Within 1%
            calculated: actual,
            expected: expected,
            errorPercent: (error * 100).toFixed(2)
        };
    }

    async testGraphBasic() {
        // Test graph initialization
        if (!window.OfflineGraphManager) {
            return { success: false, error: 'OfflineGraphManager not available' };
        }
        
        const formula = formulas.find(f => f.id === 'wiens_law');
        if (!formula) {
            return { success: false, error: 'Wien\'s law formula not found' };
        }
        
        const graphManager = new OfflineGraphManager('desmos-graph', 'graph-tab');
        const initialized = graphManager.init('desmos-graph');
        
        if (!initialized) {
            return { success: false, error: 'Graph initialization failed' };
        }
        
        // Test graph update
        graphManager.updateGraph(formula, { T: 5000 }, {});
        
        return {
            success: true,
            initialized: true,
            formula: formula.name
        };
    }

    async testClassificationBasic() {
        if (!window.StellarClassifier) {
            return { success: false, error: 'StellarClassifier not available' };
        }
        
        const classifier = new StellarClassifier();
        
        // Test classification: O5 star at 40000K
        const result = classifier.classify({
            temperature: 40000,
            luminosityClass: '',
            isProtostar: false
        });
        
        if (!result || !result.spectralType) {
            return { success: false, error: 'Classification failed' };
        }
        
        return {
            success: true,
            spectralType: result.spectralType,
            temperature: result.temperature
        };
    }

    async testExplorerBasic() {
        // Test formula explorer functionality
        if (!window.FormulaExplorer) {
            return { success: false, error: 'FormulaExplorer not available' };
        }
        
        const explorer = new FormulaExplorer();
        const formula = formulas.find(f => f.id === 'kepler_third_law');
        
        if (!formula) {
            return { success: false, error: 'Kepler formula not found' };
        }
        
        // Test explorer can access formula
        const canAccess = explorer.formulas && explorer.formulas.length > 0;
        
        return {
            success: canAccess,
            formulasAvailable: explorer.formulas?.length || 0
        };
    }

    async testFRQBasic() {
        if (!window.generateUsageInstructions) {
            return { success: false, error: 'FRQ support functions not available' };
        }
        
        const formula = formulas.find(f => f.id === 'escape_velocity');
        if (!formula) {
            return { success: false, error: 'Formula not found for FRQ test' };
        }
        
        const instructions = generateUsageInstructions(formula);
        
        if (!instructions || typeof instructions !== 'string') {
            return { success: false, error: 'Usage instructions not generated' };
        }
        
        return {
            success: true,
            instructionsLength: instructions.length,
            hasSteps: instructions.includes('Step') || instructions.includes('step')
        };
    }

    async round2Complex1() {
        // Complex problems testing integration and accuracy
        const problems = [
            {
                name: 'Multi-variable escape velocity',
                formula: 'escape_velocity',
                inputs: { M: 1.989e30, r: 6.96e8 }, // Sun
                expected: 617500,
                tolerance: 0.01
            },
            {
                name: 'Wien\'s law for hot star',
                formula: 'wiens_law',
                inputs: { T: 30000 },
                expected: 9.66e-8,
                tolerance: 0.05
            },
            {
                name: 'Kepler\'s third law',
                formula: 'kepler_third_law',
                inputs: { M: 1.989e30, a: 1.496e11 }, // Earth orbit
                expected: 3.156e7,
                tolerance: 0.01
            }
        ];

        for (const problem of problems) {
            console.log(`\n  Testing: ${problem.name}`);
            const result = await this.testComplexProblem(problem);
            this.results.round2.complex1[problem.name] = result;
            if (!result.success) {
                this.issues.push({ round: 2, problem: problem.name, issue: result.error });
            }
        }
    }

    async round3Complex2() {
        // Edge cases and precision testing
        const edgeCases = [
            {
                name: 'Very small numbers',
                formula: 'wiens_law',
                inputs: { T: 3000 },
                check: (r) => r > 0 && r < 1e-5
            },
            {
                name: 'Very large numbers',
                formula: 'escape_velocity',
                inputs: { M: 1e35, r: 1e10 },
                check: (r) => r > 1e5 && isFinite(r)
            },
            {
                name: 'Precision test (many decimals)',
                formula: 'escape_velocity',
                inputs: { M: 5.972184e24, r: 6.371009e6 },
                check: (r) => {
                    const expected = 11186;
                    return Math.abs(r - expected) / expected < 0.001;
                }
            }
        ];

        for (const test of edgeCases) {
            console.log(`\n  Testing: ${test.name}`);
            const result = await this.testEdgeCase(test);
            this.results.round3.complex2[test.name] = result;
            if (!result.success) {
                this.issues.push({ round: 3, test: test.name, issue: result.error });
            }
        }
    }

    async round4Complex3() {
        // Multi-step workflows
        const workflows = [
            {
                name: 'Star classification workflow',
                steps: [
                    { action: 'classify', params: { temperature: 6000, luminosityClass: 'V' } },
                    { action: 'calculate_luminosity', params: { T: 6000, R: 6.96e8 } }
                ]
            },
            {
                name: 'Distance calculation workflow',
                steps: [
                    { action: 'calculate_parallax', params: { distance: 10 } },
                    { action: 'calculate_distance_modulus', params: { apparentMag: 5, absoluteMag: 0 } }
                ]
            }
        ];

        for (const workflow of workflows) {
            console.log(`\n  Testing: ${workflow.name}`);
            const result = await this.testWorkflow(workflow);
            this.results.round4.complex3[workflow.name] = result;
            if (!result.success) {
                this.issues.push({ round: 4, workflow: workflow.name, issue: result.error });
            }
        }
    }

    async round5Equations() {
        // Complex equation testing
        const equations = [
            {
                name: 'Symbolic solving',
                formula: 'escape_velocity',
                known: { M: 5.972e24 },
                unknown: 'v',
                check: (result) => result.includes('sqrt') || result.includes('√')
            },
            {
                name: 'Multi-variable symbolic',
                formula: 'kepler_third_law',
                known: { M: 1.989e30 },
                unknown: ['T', 'a'],
                check: (result) => result.isSymbolic === true
            }
        ];

        for (const eq of equations) {
            console.log(`\n  Testing: ${eq.name}`);
            const result = await this.testComplexEquation(eq);
            this.results.round5.equations[eq.name] = result;
            if (!result.success) {
                this.issues.push({ round: 5, equation: eq.name, issue: result.error });
            }
        }
    }

    async testComplexProblem(problem) {
        const formula = formulas.find(f => f.id === problem.formula);
        if (!formula) {
            return { success: false, error: `Formula ${problem.formula} not found` };
        }

        const calc = new FormulaCalculator(formula);
        const result = calc.solve(problem.inputs);

        if (!result || !result.result) {
            return { success: false, error: 'Calculation failed' };
        }

        const error = Math.abs(result.result - problem.expected) / problem.expected;
        const success = error < problem.tolerance;

        return {
            success,
            calculated: result.result,
            expected: problem.expected,
            errorPercent: (error * 100).toFixed(4),
            withinTolerance: success
        };
    }

    async testEdgeCase(test) {
        const formula = formulas.find(f => f.id === test.formula);
        if (!formula) {
            return { success: false, error: `Formula ${test.formula} not found` };
        }

        const calc = new FormulaCalculator(formula);
        const result = calc.solve(test.inputs);

        if (!result || !result.result) {
            return { success: false, error: 'Calculation failed' };
        }

        const checkPassed = test.check(result.result);

        return {
            success: checkPassed,
            result: result.result,
            isFinite: isFinite(result.result),
            checkPassed
        };
    }

    async testWorkflow(workflow) {
        // Test multi-step workflow execution
        const results = [];
        
        for (const step of workflow.steps) {
            try {
                if (step.action === 'classify') {
                    const classifier = new StellarClassifier();
                    const result = classifier.classify(step.params);
                    results.push({ step: step.action, result });
                } else if (step.action.startsWith('calculate_')) {
                    const formulaId = step.action.replace('calculate_', '').replace('_', '_');
                    const formula = formulas.find(f => f.id === formulaId);
                    if (formula) {
                        const calc = new FormulaCalculator(formula);
                        const result = calc.solve(step.params);
                        results.push({ step: step.action, result });
                    }
                }
            } catch (error) {
                return { success: false, error: `Step ${step.action} failed: ${error.message}` };
            }
        }

        return {
            success: results.length === workflow.steps.length,
            stepsCompleted: results.length,
            results
        };
    }

    async testComplexEquation(eq) {
        const formula = formulas.find(f => f.id === eq.formula);
        if (!formula) {
            return { success: false, error: `Formula ${eq.formula} not found` };
        }

        const calc = new FormulaCalculator(formula);
        
        if (Array.isArray(eq.unknown)) {
            // Multiple unknowns - symbolic solving
            const result = calc.solveSymbolically(eq.unknown, eq.known, []);
            return {
                success: eq.check(result),
                isSymbolic: result.isSymbolic,
                result: result.result
            };
        } else {
            // Single unknown
            const inputs = { ...eq.known, [eq.unknown]: null };
            const result = calc.solve(inputs);
            
            if (result.isSymbolic) {
                return {
                    success: eq.check(result.result),
                    isSymbolic: true,
                    result: result.result
                };
            } else {
                return { success: false, error: 'Expected symbolic result but got numeric' };
            }
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(80));
        
        const totalTests = this.testCount;
        const totalIssues = this.issues.length;
        
        console.log(`\nTotal Tests Run: ${totalTests}`);
        console.log(`Total Issues Found: ${totalIssues}`);
        
        if (totalIssues > 0) {
            console.log('\n🔴 Issues Found:');
            this.issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. Round ${issue.round} - ${issue.feature || issue.problem || issue.test || issue.workflow || issue.equation}: ${issue.issue}`);
            });
        } else {
            console.log('\n✅ All tests passed!');
        }
    }

    async fixAndRetest() {
        // This will be implemented to fix issues and re-run tests
        console.log('Fix and retest logic will be implemented based on found issues...');
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ComprehensiveFeatureTester = ComprehensiveFeatureTester;
}

// Auto-run if in browser
if (typeof window !== 'undefined' && window.location.href.includes('localhost')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const tester = new ComprehensiveFeatureTester();
            tester.runAllTests().catch(console.error);
        }, 3000); // Wait for all modules to load
    });
}

