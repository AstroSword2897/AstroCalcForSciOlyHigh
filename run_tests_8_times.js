/**
 * Run Calculator Tests 8 Times - Verify 100% Pass Rate Each Time
 * This script runs the calculator tests 8 times consecutively
 * and verifies that all 8 runs achieve 100% pass rate
 */

const { spawn } = require('child_process');
const path = require('path');

const TOTAL_RUNS = 8;
const REQUIRED_PASS_RATE = 1.0; // 100%

let allRuns = [];
let currentRun = 0;

function runSingleTest() {
    return new Promise((resolve, reject) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🧪 Running Test ${currentRun + 1}/${TOTAL_RUNS}`);
        console.log('='.repeat(80));
        
        const testScript = path.join(__dirname, 'test_calculator_direct.js');
        const child = spawn('node', [testScript, '--single-run'], {
            cwd: __dirname,
            stdio: 'pipe'
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            process.stdout.write(output);
        });
        
        child.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            process.stderr.write(output);
        });
        
        child.on('close', (code) => {
            // Parse results from output
            const passed = code === 0;
            const has100Percent = stdout.includes('100% Pass Rate: ✅ YES') || 
                                 stdout.includes('100% PASS RATE ACHIEVED') || 
                                 stdout.includes('SUCCESS!') ||
                                 (stdout.includes('Pass Rate: 100.00%'));
            
            const result = {
                run: currentRun + 1,
                exitCode: code,
                passed: passed && has100Percent,
                stdout: stdout,
                stderr: stderr,
                timestamp: new Date().toISOString()
            };
            
            resolve(result);
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function runAllTests() {
    console.log('🚀 Starting 8-Run Test Verification');
    console.log('='.repeat(80));
    console.log(`Target: ${TOTAL_RUNS} consecutive runs with 100% pass rate`);
    console.log('='.repeat(80));
    
    for (let i = 0; i < TOTAL_RUNS; i++) {
        currentRun = i;
        const result = await runSingleTest();
        allRuns.push(result);
        
        if (!result.passed) {
            console.log(`\n❌ Run ${i + 1} FAILED - Did not achieve 100% pass rate`);
            console.log(`   Exit code: ${result.exitCode}`);
            console.log(`\n${'='.repeat(80)}`);
            console.log('❌ VERIFICATION FAILED');
            console.log('='.repeat(80));
            console.log(`Failed at run ${i + 1}/${TOTAL_RUNS}`);
            console.log(`Need all ${TOTAL_RUNS} runs to achieve 100% pass rate`);
            console.log('='.repeat(80));
            process.exit(1);
        } else {
            console.log(`\n✅ Run ${i + 1}/${TOTAL_RUNS}: 100% PASS RATE ACHIEVED`);
        }
        
        // Small delay between runs
        if (i < TOTAL_RUNS - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    // All runs passed
    console.log(`\n${'='.repeat(80)}`);
    console.log('🎉🎉🎉 SUCCESS! 🎉🎉🎉');
    console.log('='.repeat(80));
    console.log(`✅ All ${TOTAL_RUNS} runs achieved 100% pass rate!`);
    console.log('='.repeat(80));
    
    // Summary
    console.log('\n📊 Final Summary:');
    allRuns.forEach((run, idx) => {
        console.log(`  Run ${idx + 1}: ✅ 100% Pass Rate`);
    });
    console.log(`\n✅ Verification Complete: ${TOTAL_RUNS}/${TOTAL_RUNS} runs passed`);
    console.log('='.repeat(80));
    
    process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});

// Run tests
runAllTests().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});

