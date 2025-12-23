/**
 * Simple Test Runner - Executes tests via browser automation
 * Uses built-in browser automation or provides instructions
 */

const http = require('http');
const { exec } = require('child_process');

const PORT = 8000;
const TEST_URL = `http://localhost:${PORT}/tests/run_production_tests.html`;

console.log('🧪 AUTOMATED TEST EXECUTOR');
console.log('='.repeat(80));
console.log('');

// Check if server is running
function checkServer() {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${PORT}`, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function main() {
    console.log('📡 Checking server...');
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log('⚠️  Server not running on port 8000');
        console.log('🚀 Starting server...');
        
        const server = exec('python3 -m http.server 8000', (error) => {
            if (error) {
                console.error('❌ Error starting server:', error);
            }
        });
        
        console.log('⏳ Waiting for server to start...');
        await new Promise(r => setTimeout(r, 3000));
    } else {
        console.log('✅ Server is running');
    }
    
    console.log('');
    console.log('📋 TEST EXECUTION INSTRUCTIONS');
    console.log('='.repeat(80));
    console.log('');
    console.log('Since tests require browser APIs, please:');
    console.log('');
    console.log('1. Open browser:');
    console.log(`   ${TEST_URL}`);
    console.log('');
    console.log('2. Open browser console (F12)');
    console.log('');
    console.log('3. Run this command in console:');
    console.log('   runCalculatorOnly()');
    console.log('');
    console.log('OR click the "🧮 Calculator Tests Only" button');
    console.log('');
    console.log('4. Monitor progress in console');
    console.log('');
    console.log('Tests will run until 100% achieved 10 times consecutively');
    console.log('');
    console.log('='.repeat(80));
    
    // Try to open browser automatically if possible
    const platform = process.platform;
    let openCommand = '';
    
    if (platform === 'darwin') {
        openCommand = `open "${TEST_URL}"`;
    } else if (platform === 'win32') {
        openCommand = `start "${TEST_URL}"`;
    } else if (platform === 'linux') {
        openCommand = `xdg-open "${TEST_URL}"`;
    }
    
    if (openCommand) {
        console.log(`\n🌐 Attempting to open browser...`);
        exec(openCommand, (error) => {
            if (error) {
                console.log('⚠️  Could not auto-open browser');
            } else {
                console.log('✅ Browser opened');
            }
        });
    }
}

main().catch(console.error);
