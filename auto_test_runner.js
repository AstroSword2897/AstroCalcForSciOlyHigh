/**
 * Automated Comprehensive Test Runner
 * Executes all 5 rounds of testing and reports results
 * Run in browser console after page loads
 */

(function() {
    'use strict';
    
    console.log('🚀 Loading Comprehensive Test Runner...');
    
    // Wait for modules to be ready
    function waitForModules(callback, maxWait = 10000) {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (typeof FormulaCalculator !== 'undefined' && 
                typeof formulas !== 'undefined' && 
                formulas && formulas.length > 0 &&
                typeof StellarClassifier !== 'undefined') {
                clearInterval(checkInterval);
                callback();
            } else if (Date.now() - startTime > maxWait) {
                clearInterval(checkInterval);
                console.error('❌ Modules not ready after', maxWait, 'ms');
                callback(false);
            }
        }, 100);
    }
    
    const TestRunner = {
        results: {
            round1: {},
            round2: {},
            round3: {},
            round4: {},
            round5: {}
        },
        issues: [],
        testCount: 0,
        
        async runAll() {
            console.log('\n' + '='.repeat(80));
            console.log('🚀 COMPREHENSIVE FEATURE TESTING SUITE');
            console.log('='.repeat(80));
            
            await new Promise(resolve => waitForModules(resolve));
            
            // Round 1: Basic
            console.log('\n📋 ROUND 1: Basic Run-Down');
            console.log('-'.repeat(80));
            this.round1();
            
            // Round 2-4: Complex
            console.log('\n🔬 ROUND 2: Complex Problems (Integration & Accuracy)');
            console.log('-'.repeat(80));
            this.round2();
            
            console.log('\n🔬 ROUND 3: Complex Problems (Edge Cases & Precision)');
            console.log('-'.repeat(80));
            this.round3();
            
            console.log('\n🔬 ROUND 4: Complex Problems (Multi-Step Workflows)');
            console.log('-'.repeat(80));
            this.round4();
            
            // Round 5: Complex Equations
            console.log('\n📐 ROUND 5: Complex Equations');
            console.log('-'.repeat(80));
            this.round5();
            
            this.printSummary();
            return this.results;
        },
        
        round1() {
            // 1. Search
            console.log('  1. Testing Formula Search...');
            try {
                const engine = new FormulaSearchEngine({formulas: formulas});
                const results = engine.search('escape velocity', formulas);
                const nlResults = engine.search('how to calculate escape speed', formulas);
                this.results.round1.search = {
                    success: results.length > 0 && nlResults.length > 0,
                    keywordResults: results.length,
                    nlResults: nlResults.length,
                    topResult: results[0]?.formula?.name || 'N/A'
                };
                if (!this.results.round1.search.success) {
                    this.issues.push({round: 1, feature: 'Search', issue: 'No results returned'});
                }
                console.log('     ✅ Search:', this.results.round1.search);
            } catch (e) {
                this.results.round1.search = {success: false, error: e.message};
                this.issues.push({round: 1, feature: 'Search', issue: e.message});
                console.log('     ❌ Search failed:', e.message);
            }
            
            // 2. Calculator
            console.log('  2. Testing Calculator...');
            try {
                const formula = formulas.find(f => f.id === 'escape_velocity');
                if (!formula) throw new Error('Formula not found');
                const calc = new FormulaCalculator(formula);
                const result = calc.solve({M: 5.972e24, r: 6.371e6});
                const expected = 11186;
                const error = Math.abs(result.result - expected) / expected;
                this.results.round1.calculator = {
                    success: error < 0.01,
                    calculated: result.result,
                    expected: expected,
                    errorPercent: (error * 100).toFixed(2) + '%'
                };
                if (!this.results.round1.calculator.success) {
                    this.issues.push({round: 1, feature: 'Calculator', issue: 'Accuracy error: ' + this.results.round1.calculator.errorPercent});
                }
                console.log('     ✅ Calculator:', this.results.round1.calculator);
            } catch (e) {
                this.results.round1.calculator = {success: false, error: e.message};
                this.issues.push({round: 1, feature: 'Calculator', issue: e.message});
                console.log('     ❌ Calculator failed:', e.message);
            }
            
            // 3. Graph
            console.log('  3. Testing Graph...');
            try {
                const formula = formulas.find(f => f.id === 'wiens_law');
                if (!formula) throw new Error('Formula not found');
                
                // Create test container if it doesn't exist
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
                
                this.results.round1.graph = {
                    success: init,
                    initialized: init,
                    containerCreated: !!testContainer
                };
                if (!init) {
                    this.issues.push({round: 1, feature: 'Graph', issue: 'Initialization failed'});
                }
                console.log('     ✅ Graph:', this.results.round1.graph);
            } catch (e) {
                this.results.round1.graph = {success: false, error: e.message};
                this.issues.push({round: 1, feature: 'Graph', issue: e.message});
                console.log('     ❌ Graph failed:', e.message);
            }
            
            // 4. Classification
            console.log('  4. Testing Classification...');
            try {
                const classifier = new StellarClassifier();
                const result = classifier.classify(40000, '', false, false, null);
                this.results.round1.classification = {
                    success: typeof result === 'string' && result.length > 0,
                    spectralType: result
                };
                if (!this.results.round1.classification.success) {
                    this.issues.push({round: 1, feature: 'Classification', issue: 'Invalid result'});
                }
                console.log('     ✅ Classification:', this.results.round1.classification);
            } catch (e) {
                this.results.round1.classification = {success: false, error: e.message};
                this.issues.push({round: 1, feature: 'Classification', issue: e.message});
                console.log('     ❌ Classification failed:', e.message);
            }
            
            // 5. Explorer
            console.log('  5. Testing Explorer...');
            try {
                const explorerTab = document.querySelector('[data-main-tab="explorer"]');
                this.results.round1.explorer = {
                    success: !!explorerTab,
                    tabExists: !!explorerTab
                };
                console.log('     ✅ Explorer:', this.results.round1.explorer);
            } catch (e) {
                this.results.round1.explorer = {success: false, error: e.message};
                this.issues.push({round: 1, feature: 'Explorer', issue: e.message});
                console.log('     ❌ Explorer failed:', e.message);
            }
            
            // 6. FRQ
            console.log('  6. Testing FRQ Support...');
            try {
                const formula = formulas.find(f => f.id === 'escape_velocity');
                if (!formula) throw new Error('Formula not found');
                if (typeof generateUsageInstructions !== 'function') {
                    throw new Error('FRQ functions not available');
                }
                const instructions = generateUsageInstructions(formula);
                // generateUsageInstructions returns an object with steps, tips, etc.
                const success = instructions && 
                               typeof instructions === 'object' && 
                               Array.isArray(instructions.steps) && 
                               instructions.steps.length > 0;
                this.results.round1.frq = {
                    success: success,
                    stepsCount: instructions?.steps?.length || 0,
                    hasTips: Array.isArray(instructions?.tips),
                    hasCommonMistakes: Array.isArray(instructions?.commonMistakes)
                };
                if (!success) {
                    this.issues.push({round: 1, feature: 'FRQ', issue: 'Instructions not generated correctly'});
                }
                console.log('     ✅ FRQ:', this.results.round1.frq);
            } catch (e) {
                this.results.round1.frq = {success: false, error: e.message};
                this.issues.push({round: 1, feature: 'FRQ', issue: e.message});
                console.log('     ❌ FRQ failed:', e.message);
            }
        },
        
        round2() {
            const problems = [
                {name: 'Sun escape velocity', formula: 'escape_velocity', inputs: {M: 1.989e30, r: 6.96e8}, expected: 617500, tolerance: 0.01},
                {name: 'Wien hot star', formula: 'wiens_law', inputs: {T: 30000}, expected: 9.66e-8, tolerance: 0.05},
                {name: 'Kepler Earth', formula: 'kepler_third_law', inputs: {M: 1.989e30, a: 1.496e11}, expected: 3.156e7, tolerance: 0.01}
            ];
            
            problems.forEach(problem => {
                console.log(`  Testing: ${problem.name}...`);
                try {
                    const formula = formulas.find(f => f.id === problem.formula);
                    if (!formula) throw new Error(`Formula ${problem.formula} not found`);
                    const calc = new FormulaCalculator(formula);
                    const result = calc.solve(problem.inputs);
                    const error = Math.abs(result.result - problem.expected) / problem.expected;
                    const success = error < problem.tolerance;
                    this.results.round2[problem.name] = {
                        success,
                        calculated: result.result,
                        expected: problem.expected,
                        errorPercent: (error * 100).toFixed(4) + '%'
                    };
                    if (!success) {
                        this.issues.push({round: 2, problem: problem.name, issue: 'Accuracy error: ' + this.results.round2[problem.name].errorPercent});
                    }
                    console.log(`    ${success ? '✅' : '❌'} ${problem.name}:`, this.results.round2[problem.name]);
                } catch (e) {
                    this.results.round2[problem.name] = {success: false, error: e.message};
                    this.issues.push({round: 2, problem: problem.name, issue: e.message});
                    console.log(`    ❌ ${problem.name} failed:`, e.message);
                }
            });
        },
        
        round3() {
            const edgeCases = [
                {name: 'Small numbers', formula: 'wiens_law', inputs: {T: 3000}, check: (r) => r > 0 && r < 1e-5 && isFinite(r)},
                {name: 'Large numbers', formula: 'escape_velocity', inputs: {M: 1e35, r: 1e10}, check: (r) => r > 1e5 && isFinite(r)},
                {name: 'High precision', formula: 'escape_velocity', inputs: {M: 5.972184e24, r: 6.371009e6}, check: (r) => {
                    const expected = 11186;
                    return Math.abs(r - expected) / expected < 0.001;
                }}
            ];
            
            edgeCases.forEach(test => {
                console.log(`  Testing: ${test.name}...`);
                try {
                    const formula = formulas.find(f => f.id === test.formula);
                    if (!formula) throw new Error(`Formula ${test.formula} not found`);
                    const calc = new FormulaCalculator(formula);
                    const result = calc.solve(test.inputs);
                    const checkPassed = test.check(result.result);
                    this.results.round3[test.name] = {
                        success: checkPassed,
                        result: result.result,
                        isFinite: isFinite(result.result)
                    };
                    if (!checkPassed) {
                        this.issues.push({round: 3, test: test.name, issue: 'Edge case check failed'});
                    }
                    console.log(`    ${checkPassed ? '✅' : '❌'} ${test.name}:`, this.results.round3[test.name]);
                } catch (e) {
                    this.results.round3[test.name] = {success: false, error: e.message};
                    this.issues.push({round: 3, test: test.name, issue: e.message});
                    console.log(`    ❌ ${test.name} failed:`, e.message);
                }
            });
        },
        
        round4() {
            console.log('  Testing: Search → Calculate workflow...');
            try {
                const engine = new FormulaSearchEngine({formulas: formulas});
                const searchResults = engine.search('escape velocity', formulas);
                if (searchResults.length === 0) throw new Error('Search returned no results');
                const formula = searchResults[0].formula;
                const calc = new FormulaCalculator(formula);
                const calcResult = calc.solve({M: 5.972e24, r: 6.371e6});
                this.results.round4['Search->Calculate'] = {
                    success: !!calcResult.result,
                    searchFound: true,
                    calculationSuccess: !!calcResult.result
                };
                console.log('    ✅ Search → Calculate:', this.results.round4['Search->Calculate']);
            } catch (e) {
                this.results.round4['Search->Calculate'] = {success: false, error: e.message};
                this.issues.push({round: 4, workflow: 'Search->Calculate', issue: e.message});
                console.log('    ❌ Search → Calculate failed:', e.message);
            }
            
            console.log('  Testing: Calculate → Graph workflow...');
            try {
                const formula = formulas.find(f => f.id === 'wiens_law');
                if (!formula) throw new Error('Formula not found');
                const calc = new FormulaCalculator(formula);
                const calcResult = calc.solve({T: 5000});
                
                // Use test container for graph
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
                if (init) {
                    graph.updateGraph(formula, {T: 5000}, {calculatedPoint: {x: 5000, y: calcResult.result}});
                }
                
                this.results.round4['Calculate->Graph'] = {
                    success: init && !!calcResult.result,
                    calculationSuccess: !!calcResult.result,
                    graphUpdated: init
                };
                console.log('    ✅ Calculate → Graph:', this.results.round4['Calculate->Graph']);
            } catch (e) {
                this.results.round4['Calculate->Graph'] = {success: false, error: e.message};
                this.issues.push({round: 4, workflow: 'Calculate->Graph', issue: e.message});
                console.log('    ❌ Calculate → Graph failed:', e.message);
            }
        },
        
        round5() {
            console.log('  Testing: Symbolic solving...');
            try {
                const formula = formulas.find(f => f.id === 'escape_velocity');
                if (!formula) throw new Error('Formula not found');
                const calc = new FormulaCalculator(formula);
                const result = calc.solve({M: 5.972e24, v: null});
                const isSymbolic = result.isSymbolic || (typeof result.result === 'string' && 
                    (result.result.includes('sqrt') || result.result.includes('√')));
                this.results.round5.symbolic = {
                    success: isSymbolic,
                    isSymbolic: isSymbolic,
                    result: result.result
                };
                if (!isSymbolic) {
                    this.issues.push({round: 5, equation: 'Symbolic', issue: 'Expected symbolic result'});
                }
                console.log('    ✅ Symbolic:', this.results.round5.symbolic);
            } catch (e) {
                this.results.round5.symbolic = {success: false, error: e.message};
                this.issues.push({round: 5, equation: 'Symbolic', issue: e.message});
                console.log('    ❌ Symbolic failed:', e.message);
            }
            
            console.log('  Testing: Multi-variable symbolic...');
            try {
                const formula = formulas.find(f => f.id === 'kepler_third_law');
                if (!formula) throw new Error('Formula not found');
                const calc = new FormulaCalculator(formula);
                const result = calc.solveSymbolically(['T', 'a'], {M: 1.989e30}, []);
                this.results.round5.multiVariable = {
                    success: result && result.isSymbolic,
                    isSymbolic: result?.isSymbolic || false,
                    solutions: result?.solutions?.length || 0
                };
                if (!this.results.round5.multiVariable.success) {
                    this.issues.push({round: 5, equation: 'Multi-variable', issue: 'Symbolic solving failed'});
                }
                console.log('    ✅ Multi-variable:', this.results.round5.multiVariable);
            } catch (e) {
                this.results.round5.multiVariable = {success: false, error: e.message};
                this.issues.push({round: 5, equation: 'Multi-variable', issue: e.message});
                console.log('    ❌ Multi-variable failed:', e.message);
            }
        },
        
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
    };
    
    // Auto-run after page loads
    if (typeof window !== 'undefined') {
        window.TestRunner = TestRunner;
        window.runComprehensiveTests = () => TestRunner.runAll();
        
        // Auto-run after modules load
        setTimeout(() => {
            console.log('✅ Test Runner loaded. Run: runComprehensiveTests()');
            console.log('   Or wait for auto-run in 2 seconds...');
            setTimeout(() => {
                TestRunner.runAll().catch(console.error);
            }, 2000);
        }, 1000);
    }
})();

