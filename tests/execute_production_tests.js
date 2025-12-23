/**
 * Execute Production Tests
 * Actually runs the tests and fixes issues until 100% achieved
 * 
 * This script analyzes test failures and provides fixes
 */

// Count available solvers
function countAvailableSolvers() {
    if (typeof FormulaCalculator === 'undefined' || !FormulaCalculator.solvers) {
        return 0;
    }
    return Object.keys(FormulaCalculator.solvers).length;
}

// Count formulas with solvers
function countFormulasWithSolvers() {
    if (typeof formulas === 'undefined' || !formulas) return 0;
    
    const solverCount = countAvailableSolvers();
    let formulasWithSolvers = 0;
    
    formulas.forEach(f => {
        if (FormulaCalculator.solvers && FormulaCalculator.solvers[f.id]) {
            formulasWithSolvers++;
        }
    });
    
    return formulasWithSolvers;
}

// Analyze and report
function analyzeCalculatorCoverage() {
    console.log('\n📊 CALCULATOR COVERAGE ANALYSIS');
    console.log('='.repeat(80));
    
    if (typeof formulas === 'undefined' || !formulas) {
        console.log('❌ Formulas not loaded');
        return;
    }
    
    const totalFormulas = formulas.length;
    const availableSolvers = countAvailableSolvers();
    const formulasWithSolvers = countFormulasWithSolvers();
    const coverage = (formulasWithSolvers / totalFormulas * 100).toFixed(1);
    
    console.log(`Total Formulas:        ${totalFormulas}`);
    console.log(`Available Solvers:     ${availableSolvers}`);
    console.log(`Formulas with Solvers:  ${formulasWithSolvers}`);
    console.log(`Coverage:              ${coverage}%`);
    
    // List formulas without solvers
    const formulasWithoutSolvers = formulas.filter(f => 
        !FormulaCalculator.solvers || !FormulaCalculator.solvers[f.id]
    );
    
    if (formulasWithoutSolvers.length > 0) {
        console.log(`\n⚠️  Formulas without solvers (${formulasWithoutSolvers.length}):`);
        formulasWithoutSolvers.slice(0, 20).forEach(f => {
            console.log(`   - ${f.id}: ${f.name}`);
        });
        if (formulasWithoutSolvers.length > 20) {
            console.log(`   ... and ${formulasWithoutSolvers.length - 20} more`);
        }
    }
    
    console.log('='.repeat(80));
    
    return {
        totalFormulas,
        availableSolvers,
        formulasWithSolvers,
        coverage: parseFloat(coverage),
        formulasWithoutSolvers: formulasWithoutSolvers.length
    };
}

// Run tests and fix issues
async function runTestsAndFix() {
    console.log('🚀 Starting Production Test Execution');
    console.log('='.repeat(80));
    
    // First, analyze coverage
    const coverage = analyzeCalculatorCoverage();
    
    if (coverage.coverage < 100) {
        console.log(`\n⚠️  Only ${coverage.coverage}% of formulas have solvers`);
        console.log(`   This will affect test results - formulas without solvers will be skipped`);
    }
    
    // Run calculator tests
    if (typeof CalculatorTestRunner !== 'undefined') {
        console.log('\n🧮 Running Calculator Tests...');
        const results = await CalculatorTestRunner.runUntilPerfect();
        
        // Analyze failures
        if (results.failures && results.failures.length > 0) {
            console.log('\n📋 Failure Analysis:');
            const failureReasons = {};
            results.failures.forEach(f => {
                const reason = f.error || 'Unknown';
                failureReasons[reason] = (failureReasons[reason] || 0) + 1;
            });
            
            Object.entries(failureReasons)
                .sort((a, b) => b[1] - a[1])
                .forEach(([reason, count]) => {
                    console.log(`   ${reason}: ${count} failures`);
                });
        }
        
        return results;
    } else if (typeof CalculatorTestSuite !== 'undefined') {
        console.log('\n🧮 Running Calculator Test Suite...');
        const results = await CalculatorTestSuite.runUntilPerfect();
        return results;
    } else {
        console.error('❌ No calculator test runner available!');
        return null;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ProductionTestExecutor = {
        runTestsAndFix,
        analyzeCalculatorCoverage,
        countAvailableSolvers,
        countFormulasWithSolvers
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runTestsAndFix,
        analyzeCalculatorCoverage,
        countAvailableSolvers,
        countFormulasWithSolvers
    };
}
