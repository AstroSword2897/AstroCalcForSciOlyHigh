/**
 * Comprehensive Test Runner
 * Runs all calculator tests programmatically
 * 
 * Usage: node run_all_tests_comprehensive.js
 */

const fs = require('fs');
const path = require('path');

// Mock DOM for Node.js
global.window = {
    devicePixelRatio: 1,
    addEventListener: () => {},
    removeEventListener: () => {}
};

global.document = {
    getElementById: (id) => ({
        getBoundingClientRect: () => ({ width: 800, height: 600 }),
        appendChild: () => {},
        innerHTML: '',
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        textContent: '',
        scrollTop: 0,
        scrollHeight: 0
    }),
    createElement: (tag) => ({
        style: {},
        width: 0,
        height: 0,
        getContext: () => ({
            clearRect: () => {},
            fillRect: () => {},
            stroke: () => {},
            fill: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            quadraticCurveTo: () => {},
            arc: () => {},
            setTransform: () => {},
            save: () => {},
            restore: () => {},
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        }),
        tabIndex: 0
    })
};

global.performance = {
    now: () => Date.now()
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

console.log('🧪 COMPREHENSIVE TEST RUNNER');
console.log('='.repeat(80));
console.log('');

// Load formulas
console.log('📚 Loading formulas...');
try {
    const formulasCode = fs.readFileSync(path.join(__dirname, 'scripts/formulas.js'), 'utf8');
    eval(formulasCode);
    console.log(`✅ Loaded ${typeof formulas !== 'undefined' ? formulas.length : 0} formulas`);
} catch (e) {
    console.error('❌ Error loading formulas:', e.message);
    process.exit(1);
}

// Load calculator
console.log('🧮 Loading calculator...');
try {
    // Load utils first (calculator depends on it)
    const utilsCode = fs.readFileSync(path.join(__dirname, 'scripts/utils.js'), 'utf8');
    eval(utilsCode);
    
    const calculatorCode = fs.readFileSync(path.join(__dirname, 'scripts/calculator.js'), 'utf8');
    eval(calculatorCode);
    
    // Check if FormulaCalculator is available
    if (typeof FormulaCalculator === 'undefined') {
        // Try global scope
        if (typeof global !== 'undefined' && global.FormulaCalculator) {
            global.FormulaCalculator = global.FormulaCalculator;
        } else {
            throw new Error('FormulaCalculator class not found after loading');
        }
    }
    
    const solverCount = FormulaCalculator.solvers ? Object.keys(FormulaCalculator.solvers).length : 0;
    console.log(`✅ Calculator loaded (${solverCount} solvers)`);
} catch (e) {
    console.error('❌ Error loading calculator:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
}

// Test results
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    byFormula: {},
    byCategory: {},
    errors: []
};

/**
 * Run calculator test for a formula
 */
function testFormula(formula, testCase) {
    testResults.total++;
    
    try {
        if (!FormulaCalculator.solvers || !FormulaCalculator.solvers[formula.id]) {
            // No solver - skip but don't count as failure
            return { passed: true, note: 'No solver defined' };
        }
        
        const calculator = new FormulaCalculator(formula);
        const result = calculator.solve(testCase.inputs);
        
        if (!result || result.error) {
            testResults.failed++;
            return { passed: false, error: result.error || 'Calculation failed' };
        }
        
        if (typeof result.result !== 'number' || !isFinite(result.result)) {
            testResults.failed++;
            return { passed: false, error: `Invalid result: ${result.result}` };
        }
        
        if (isNaN(result.result) || Math.abs(result.result) > 1e50) {
            testResults.failed++;
            return { passed: false, error: `Unreasonable result: ${result.result}` };
        }
        
        testResults.passed++;
        return { passed: true, result: result.result };
        
    } catch (e) {
        testResults.failed++;
        return { passed: false, error: e.message };
    }
}

/**
 * Generate test cases for a formula
 */
function generateTestCases(formula) {
    const cases = [];
    const vars = formula.variables || [];
    
    if (vars.length === 0) return cases;
    
    // Test 1: Standard values
    const test1 = { inputs: {} };
    vars.forEach((v, i) => {
        if (i === vars.length - 1) {
            test1.inputs[v.symbol] = null;
        } else {
            test1.inputs[v.symbol] = getStandardValue(v);
        }
    });
    cases.push(test1);
    
    // Test 2: Edge values
    const test2 = { inputs: {} };
    vars.forEach((v, i) => {
        if (i === vars.length - 1) {
            test2.inputs[v.symbol] = null;
        } else {
            test2.inputs[v.symbol] = getEdgeValue(v);
        }
    });
    cases.push(test2);
    
    // Test 3: Solve for first variable
    if (vars.length >= 2) {
        const test3 = { inputs: {} };
        vars.forEach((v, i) => {
            if (i === 0) {
                test3.inputs[v.symbol] = null;
            } else {
                test3.inputs[v.symbol] = getStandardValue(v);
            }
        });
        cases.push(test3);
    }
    
    return cases;
}

function getStandardValue(varDef) {
    const symbol = varDef.symbol.toLowerCase();
    const name = (varDef.name || '').toLowerCase();
    
    if (name.includes('mass') || symbol === 'm' || symbol.startsWith('m_')) {
        return symbol.includes('sun') ? 1.989e30 : 1e30;
    }
    if (name.includes('radius') || symbol === 'r' || symbol.startsWith('r_')) {
        return symbol.includes('sun') ? 6.96e8 : 1e8;
    }
    if (name.includes('distance') || symbol === 'd' || symbol === 'a') {
        return 1.496e11;
    }
    if (name.includes('period') || symbol === 'p' || (symbol === 't' && !name.includes('temp'))) {
        return 3.156e7;
    }
    if (name.includes('temperature') || (symbol === 't' && name.includes('temp'))) {
        return 5778;
    }
    if (name.includes('wavelength') || symbol.includes('lambda')) {
        return 500e-9;
    }
    if (name.includes('velocity') || symbol === 'v') {
        return 29780;
    }
    if (name.includes('luminosity') || symbol === 'l') {
        return 3.828e26;
    }
    return 1.0;
}

function getEdgeValue(varDef) {
    const symbol = varDef.symbol.toLowerCase();
    const name = (varDef.name || '').toLowerCase();
    
    if (name.includes('mass')) {
        return 1e20;
    }
    if (name.includes('distance')) {
        return 1e15;
    }
    if (name.includes('temperature')) {
        return 1000;
    }
    return 0.1;
}

/**
 * Run all calculator tests
 */
function runAllCalculatorTests() {
    console.log('\n🧮 RUNNING CALCULATOR TESTS');
    console.log('='.repeat(80));
    
    if (typeof formulas === 'undefined' || !formulas || !Array.isArray(formulas)) {
        console.error('❌ Formulas not loaded');
        return;
    }
    
    const formulasWithSolvers = formulas.filter(f => 
        FormulaCalculator.solvers && FormulaCalculator.solvers[f.id]
    );
    
    console.log(`Testing ${formulasWithSolvers.length} formulas with solvers (3 tests each)...\n`);
    
    formulasWithSolvers.forEach((formula, idx) => {
        const category = formula.category || 'Unknown';
        const testCases = generateTestCases(formula);
        
        if (!testResults.byCategory[category]) {
            testResults.byCategory[category] = { total: 0, passed: 0, failed: 0 };
        }
        
        if (!testResults.byFormula[formula.id]) {
            testResults.byFormula[formula.id] = { name: formula.name, total: 0, passed: 0, failed: 0 };
        }
        
        testCases.forEach((testCase, testIdx) => {
            const result = testFormula(formula, testCase);
            
            testResults.byCategory[category].total++;
            testResults.byFormula[formula.id].total++;
            
            if (result.passed) {
                testResults.byCategory[category].passed++;
                testResults.byFormula[formula.id].passed++;
            } else {
                testResults.byCategory[category].failed++;
                testResults.byFormula[formula.id].failed++;
                testResults.errors.push({
                    formula: formula.name,
                    formulaId: formula.id,
                    category: category,
                    testCase: testIdx + 1,
                    error: result.error
                });
            }
        });
        
        if ((idx + 1) % 10 === 0) {
            process.stdout.write(`\rProgress: ${idx + 1}/${formulasWithSolvers.length} formulas tested...`);
        }
    });
    
    console.log('\n');
}

/**
 * Print results
 */
function printResults() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(80));
    
    const passRate = testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) : 0;
    
    console.log(`\nTotal Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed} (${passRate}%)`);
    console.log(`Failed: ${testResults.failed}`);
    
    console.log('\n📊 By Category:');
    Object.entries(testResults.byCategory)
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([cat, stats]) => {
            const pct = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
            const emoji = pct === '100.0' ? '🟢' : pct >= '95.0' ? '🟡' : '🔴';
            console.log(`  ${emoji} ${cat.padEnd(30)} ${stats.passed}/${stats.total} (${pct}%)`);
        });
    
    if (testResults.errors.length > 0) {
        console.log(`\n❌ Failures (first 10):`);
        testResults.errors.slice(0, 10).forEach((e, i) => {
            console.log(`  ${i+1}. ${e.formula} (${e.category}): ${e.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (testResults.failed === 0) {
        console.log('✅ ALL TESTS PASSED!');
    } else {
        console.log(`⚠️  ${testResults.failed} test(s) failed`);
    }
    
    console.log('='.repeat(80));
}

// Run tests
console.log('\n🚀 Starting test execution...\n');
runAllCalculatorTests();
printResults();

// Exit with appropriate code
process.exit(testResults.failed === 0 ? 0 : 1);
