/**
 * Comprehensive Feature Testing - Browser Executable Version
 * Run this in browser console: 
 *   const tester = new ComprehensiveTester(); tester.runAll();
 */

class ComprehensiveTester {
    constructor() {
        this.results = {};
        this.issues = [];
        this.round = 0;
    }

    async runAll() {
        console.log('\n🚀 COMPREHENSIVE FEATURE TESTING SUITE');
        console.log('='.repeat(80));
        
        // Wait for everything to load
        await this.waitForReady();
        
        // Round 1: Basic
        this.round = 1;
        console.log('\n📋 ROUND 1: Basic Run-Down');
        await this.testRound1();
        
        // Round 2-4: Complex
        this.round = 2;
        console.log('\n🔬 ROUND 2: Complex Problems (Integration & Accuracy)');
        await this.testRound2();
        
        this.round = 3;
        console.log('\n🔬 ROUND 3: Complex Problems (Edge Cases & Precision)');
        await this.testRound3();
        
        this.round = 4;
        console.log('\n🔬 ROUND 4: Complex Problems (Multi-Step Workflows)');
        await this.testRound4();
        
        // Round 5: Complex Equations
        this.round = 5;
        console.log('\n📐 ROUND 5: Complex Equations');
        await this.testRound5();
        
        this.printSummary();
        return this.results;
    }

    async waitForReady() {
        let attempts = 0;
        while (attempts < 50) {
            if (typeof FormulaCalculator !== 'undefined' && 
                typeof formulas !== 'undefined' && 
                formulas && formulas.length > 0) {
                console.log('✅ All modules ready');
                return;
            }
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        throw new Error('Modules not ready after 5 seconds');
    }

    async testRound1() {
        this.results.round1 = {};
        
        // 1. Formula Search
        console.log('  Testing Formula Search...');
        try {
            const searchResult = this.testSearch();
            this.results.round1.search = searchResult;
            if (!searchResult.success) this.issues.push({round: 1, feature: 'Search', issue: searchResult.error});
        } catch (e) {
            this.issues.push({round: 1, feature: 'Search', issue: e.message});
            this.results.round1.search = {success: false, error: e.message};
        }
        
        // 2. Calculator
        console.log('  Testing Calculator...');
        try {
            const calcResult = this.testCalculator();
            this.results.round1.calculator = calcResult;
            if (!calcResult.success) this.issues.push({round: 1, feature: 'Calculator', issue: calcResult.error});
        } catch (e) {
            this.issues.push({round: 1, feature: 'Calculator', issue: e.message});
            this.results.round1.calculator = {success: false, error: e.message};
        }
        
        // 3. Graph
        console.log('  Testing Graph...');
        try {
            const graphResult = this.testGraph();
            this.results.round1.graph = graphResult;
            if (!graphResult.success) this.issues.push({round: 1, feature: 'Graph', issue: graphResult.error});
        } catch (e) {
            this.issues.push({round: 1, feature: 'Graph', issue: e.message});
            this.results.round1.graph = {success: false, error: e.message};
        }
        
        // 4. Classification
        console.log('  Testing Classification...');
        try {
            const classResult = this.testClassification();
            this.results.round1.classification = classResult;
            if (!classResult.success) this.issues.push({round: 1, feature: 'Classification', issue: classResult.error});
        } catch (e) {
            this.issues.push({round: 1, feature: 'Classification', issue: e.message});
            this.results.round1.classification = {success: false, error: e.message};
        }
        
        // 5. Explorer
        console.log('  Testing Explorer...');
        try {
            const explorerResult = this.testExplorer();
            this.results.round1.explorer = explorerResult;
            if (!explorerResult.success) this.issues.push({round: 1, feature: 'Explorer', issue: explorerResult.error});
        } catch (e) {
            this.issues.push({round: 1, feature: 'Explorer', issue: e.message});
            this.results.round1.explorer = {success: false, error: e.message};
        }
        
        // 6. FRQ Support
        console.log('  Testing FRQ Support...');
        try {
            const frqResult = this.testFRQ();
            this.results.round1.frq = frqResult;
            if (!frqResult.success) this.issues.push({round: 1, feature: 'FRQ', issue: frqResult.error});
        } catch (e) {
            this.issues.push({round: 1, feature: 'FRQ', issue: e.message});
            this.results.round1.frq = {success: false, error: e.message};
        }
    }

    testSearch() {
        if (!window.FormulaSearchEngine) {
            return {success: false, error: 'FormulaSearchEngine not available'};
        }
        
        const engine = new FormulaSearchEngine(formulas);
        
        // Test 1: Keyword search
        const keywordResults = engine.search('escape velocity', {limit: 5});
        if (!keywordResults || keywordResults.length === 0) {
            return {success: false, error: 'Keyword search returned no results'};
        }
        
        // Test 2: Natural language
        const nlResults = engine.search('how to calculate escape speed', {limit: 5});
        
        return {
            success: true,
            keywordResults: keywordResults.length,
            nlResults: nlResults.length,
            topResult: keywordResults[0]?.formula?.name || 'N/A'
        };
    }

    testCalculator() {
        const formula = formulas.find(f => f.id === 'escape_velocity');
        if (!formula) return {success: false, error: 'Escape velocity formula not found'};
        
        const calc = new FormulaCalculator(formula);
        
        // Earth escape velocity: M=5.972e24, r=6.371e6
        const result = calc.solve({M: 5.972e24, r: 6.371e6});
        
        if (!result || !result.result) {
            return {success: false, error: 'Calculation failed'};
        }
        
        const expected = 11186;
        const error = Math.abs(result.result - expected) / expected;
        
        return {
            success: error < 0.01,
            calculated: result.result,
            expected: expected,
            errorPercent: (error * 100).toFixed(2) + '%'
        };
    }

    testGraph() {
        const formula = formulas.find(f => f.id === 'wiens_law');
        if (!formula) return {success: false, error: 'Wien\'s law formula not found'};
        
        if (!window.OfflineGraphManager) {
            return {success: false, error: 'OfflineGraphManager not available'};
        }
        
        try {
            // Create a test container if it doesn't exist
            let testContainer = document.getElementById('test-graph-container');
            if (!testContainer) {
                testContainer = document.createElement('div');
                testContainer.id = 'test-graph-container';
                testContainer.style.display = 'none';
                testContainer.style.width = '400px';
                testContainer.style.height = '300px';
                document.body.appendChild(testContainer);
            }
            
            const graph = new OfflineGraphManager('test-graph-container', 'graph-tab');
            const init = graph.init('test-graph-container');
            
            if (!init) return {success: false, error: 'Graph initialization failed'};
            
            graph.updateGraph(formula, {T: 5000}, {});
            
            return {success: true, initialized: true};
        } catch (e) {
            return {success: false, error: e.message};
        }
    }

    testClassification() {
        if (!window.StellarClassifier) {
            return {success: false, error: 'StellarClassifier not available'};
        }
        
        const classifier = new StellarClassifier();
        // classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType)
        const result = classifier.classify(40000, '', false, false, null);
        
        if (!result || typeof result !== 'string' || result.length === 0) {
            return {success: false, error: 'Classification failed or returned invalid result'};
        }
        
        return {
            success: true,
            spectralType: result,
            isString: typeof result === 'string'
        };
    }

    testExplorer() {
        // FormulaExplorer might not be a class, check if it's a function or object
        if (typeof setupFormulaExplorer === 'function') {
            // Explorer is set up via function
            return {
                success: true,
                type: 'function',
                formulasAvailable: typeof formulas !== 'undefined' ? formulas.length : 0
            };
        } else if (window.FormulaExplorer) {
            const explorer = new FormulaExplorer();
            const canAccess = explorer.formulas && explorer.formulas.length > 0;
            return {
                success: canAccess,
                formulasAvailable: explorer.formulas?.length || 0
            };
        } else {
            // Check if explorer tab exists
            const explorerTab = document.querySelector('[data-main-tab="explorer"]');
            return {
                success: !!explorerTab,
                type: 'tab',
                tabExists: !!explorerTab
            };
        }
    }

    testFRQ() {
        if (typeof generateUsageInstructions !== 'function') {
            return {success: false, error: 'FRQ functions not available'};
        }
        
        const formula = formulas.find(f => f.id === 'escape_velocity');
        if (!formula) return {success: false, error: 'Formula not found'};
        
        const instructions = generateUsageInstructions(formula);
        
        if (!instructions || typeof instructions !== 'string') {
            return {success: false, error: 'Instructions not generated'};
        }
        
        return {
            success: true,
            instructionsLength: instructions.length,
            hasSteps: instructions.includes('Step') || instructions.includes('step')
        };
    }

    async testRound2() {
        this.results.round2 = {};
        
        const problems = [
            {
                name: 'Sun escape velocity',
                formula: 'escape_velocity',
                inputs: {M: 1.989e30, r: 6.96e8},
                expected: 617500,
                tolerance: 0.01
            },
            {
                name: 'Wien\'s law hot star',
                formula: 'wiens_law',
                inputs: {T: 30000},
                expected: 9.66e-8,
                tolerance: 0.05
            },
            {
                name: 'Kepler Earth orbit',
                formula: 'kepler_third_law',
                inputs: {M: 1.989e30, a: 1.496e11},
                expected: 3.156e7,
                tolerance: 0.01
            }
        ];
        
        for (const problem of problems) {
            console.log(`  Testing: ${problem.name}`);
            try {
                const result = this.testComplexProblem(problem);
                this.results.round2[problem.name] = result;
                if (!result.success) {
                    this.issues.push({round: 2, problem: problem.name, issue: result.error});
                }
            } catch (e) {
                this.issues.push({round: 2, problem: problem.name, issue: e.message});
                this.results.round2[problem.name] = {success: false, error: e.message};
            }
        }
    }

    testComplexProblem(problem) {
        const formula = formulas.find(f => f.id === problem.formula);
        if (!formula) return {success: false, error: `Formula ${problem.formula} not found`};
        
        const calc = new FormulaCalculator(formula);
        const result = calc.solve(problem.inputs);
        
        if (!result || !result.result) {
            return {success: false, error: 'Calculation failed'};
        }
        
        const error = Math.abs(result.result - problem.expected) / problem.expected;
        const success = error < problem.tolerance;
        
        return {
            success,
            calculated: result.result,
            expected: problem.expected,
            errorPercent: (error * 100).toFixed(4) + '%',
            withinTolerance: success
        };
    }

    async testRound3() {
        this.results.round3 = {};
        
        const edgeCases = [
            {
                name: 'Small numbers',
                formula: 'wiens_law',
                inputs: {T: 3000},
                check: (r) => r > 0 && r < 1e-5 && isFinite(r)
            },
            {
                name: 'Large numbers',
                formula: 'escape_velocity',
                inputs: {M: 1e35, r: 1e10},
                check: (r) => r > 1e5 && isFinite(r)
            },
            {
                name: 'High precision',
                formula: 'escape_velocity',
                inputs: {M: 5.972184e24, r: 6.371009e6},
                check: (r) => {
                    const expected = 11186;
                    return Math.abs(r - expected) / expected < 0.001;
                }
            }
        ];
        
        for (const test of edgeCases) {
            console.log(`  Testing: ${test.name}`);
            try {
                const result = this.testEdgeCase(test);
                this.results.round3[test.name] = result;
                if (!result.success) {
                    this.issues.push({round: 3, test: test.name, issue: result.error});
                }
            } catch (e) {
                this.issues.push({round: 3, test: test.name, issue: e.message});
                this.results.round3[test.name] = {success: false, error: e.message};
            }
        }
    }

    testEdgeCase(test) {
        const formula = formulas.find(f => f.id === test.formula);
        if (!formula) return {success: false, error: `Formula ${test.formula} not found`};
        
        const calc = new FormulaCalculator(formula);
        const result = calc.solve(test.inputs);
        
        if (!result || !result.result) {
            return {success: false, error: 'Calculation failed'};
        }
        
        const checkPassed = test.check(result.result);
        
        return {
            success: checkPassed,
            result: result.result,
            isFinite: isFinite(result.result),
            checkPassed
        };
    }

    async testRound4() {
        this.results.round4 = {};
        console.log('  Testing multi-step workflows...');
        
        // Test workflow: Search -> Calculate -> Graph
        try {
            const workflow1 = this.testWorkflowSearchCalculate();
            this.results.round4['Search->Calculate'] = workflow1;
        } catch (e) {
            this.results.round4['Search->Calculate'] = {success: false, error: e.message};
        }
        
        // Test workflow: Calculate -> Graph -> Classification
        try {
            const workflow2 = this.testWorkflowCalculateGraph();
            this.results.round4['Calculate->Graph'] = workflow2;
        } catch (e) {
            this.results.round4['Calculate->Graph'] = {success: false, error: e.message};
        }
    }

    testWorkflowSearchCalculate() {
        const engine = new FormulaSearchEngine(formulas);
        const results = engine.search('escape velocity', {limit: 1});
        
        if (!results || results.length === 0) {
            return {success: false, error: 'Search failed'};
        }
        
        const formula = results[0].formula;
        const calc = new FormulaCalculator(formula);
        const calcResult = calc.solve({M: 5.972e24, r: 6.371e6});
        
        return {
            success: calcResult && calcResult.result,
            searchFound: true,
            calculationSuccess: !!calcResult.result
        };
    }

    testWorkflowCalculateGraph() {
        const formula = formulas.find(f => f.id === 'wiens_law');
        if (!formula) return {success: false, error: 'Formula not found'};
        
        const calc = new FormulaCalculator(formula);
        const calcResult = calc.solve({T: 5000});
        
        if (!calcResult || !calcResult.result) {
            return {success: false, error: 'Calculation failed'};
        }
        
        const graph = new OfflineGraphManager('desmos-graph', 'graph-tab');
        graph.init('desmos-graph');
        graph.updateGraph(formula, {T: 5000}, {calculatedPoint: {x: 5000, y: calcResult.result}});
        
        return {
            success: true,
            calculationSuccess: true,
            graphUpdated: true
        };
    }

    async testRound5() {
        this.results.round5 = {};
        
        // Test symbolic solving
        console.log('  Testing symbolic equations...');
        try {
            const symResult = this.testSymbolicSolving();
            this.results.round5.symbolic = symResult;
        } catch (e) {
            this.results.round5.symbolic = {success: false, error: e.message};
        }
        
        // Test multi-variable symbolic
        try {
            const multiResult = this.testMultiVariableSymbolic();
            this.results.round5.multiVariable = multiResult;
        } catch (e) {
            this.results.round5.multiVariable = {success: false, error: e.message};
        }
    }

    testSymbolicSolving() {
        const formula = formulas.find(f => f.id === 'escape_velocity');
        if (!formula) return {success: false, error: 'Formula not found'};
        
        const calc = new FormulaCalculator(formula);
        const result = calc.solve({M: 5.972e24, v: null});
        
        if (!result) return {success: false, error: 'Symbolic solve failed'};
        
        const isSymbolic = result.isSymbolic || (typeof result.result === 'string' && 
            (result.result.includes('sqrt') || result.result.includes('√')));
        
        return {
            success: isSymbolic,
            isSymbolic: isSymbolic,
            result: result.result
        };
    }

    testMultiVariableSymbolic() {
        const formula = formulas.find(f => f.id === 'kepler_third_law');
        if (!formula) return {success: false, error: 'Formula not found'};
        
        const calc = new FormulaCalculator(formula);
        const result = calc.solveSymbolically(['T', 'a'], {M: 1.989e30}, []);
        
        return {
            success: result && result.isSymbolic,
            isSymbolic: result?.isSymbolic || false,
            solutions: result?.solutions?.length || 0
        };
    }

    printSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(80));
        
        const totalIssues = this.issues.length;
        console.log(`\nTotal Issues Found: ${totalIssues}`);
        
        if (totalIssues > 0) {
            console.log('\n🔴 Issues:');
            this.issues.forEach((issue, i) => {
                const feature = issue.feature || issue.problem || issue.test || issue.workflow || issue.equation || 'Unknown';
                console.log(`  ${i + 1}. Round ${issue.round} - ${feature}: ${issue.issue}`);
            });
        } else {
            console.log('\n✅ All tests passed!');
        }
        
        console.log('\n📋 Detailed Results:');
        console.log(JSON.stringify(this.results, null, 2));
    }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.ComprehensiveTester = ComprehensiveTester;
    console.log('✅ ComprehensiveTester loaded. Run: const tester = new ComprehensiveTester(); tester.runAll();');
}

