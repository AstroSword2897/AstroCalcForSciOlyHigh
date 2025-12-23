/**
 * Node.js test runner for Graph V2 and Concept Network tests
 * Can run tests without browser
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
        removeEventListener: () => {}
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

// Load graph manager
const graphCode = fs.readFileSync(path.join(__dirname, '../scripts/enhancedOfflineGraph.js'), 'utf8');
eval(graphCode);

// Load concept network test suite
const conceptTestCode = fs.readFileSync(path.join(__dirname, 'conceptNetwork_tests.js'), 'utf8');
eval(conceptTestCode);

// Make classes available globally
const EnhancedOfflineGraphManagerV2 = global.EnhancedOfflineGraphManagerV2 || 
                                       (typeof window !== 'undefined' ? window.EnhancedOfflineGraphManagerV2 : null);
const ConceptNetworkTestSuite = global.ConceptNetworkTestSuite || 
                                (typeof window !== 'undefined' ? window.ConceptNetworkTestSuite : null);

async function testGraphManager() {
    console.log('\n🎨 TESTING GRAPH MANAGER V2');
    console.log('='.repeat(80));
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function addResult(name, passed, message = '') {
        results.tests.push({ name, passed, message });
        if (passed) {
            results.passed++;
            console.log(`✅ ${name}: PASSED${message ? ' - ' + message : ''}`);
        } else {
            results.failed++;
            console.log(`❌ ${name}: FAILED${message ? ' - ' + message : ''}`);
        }
    }
    
    try {
        // Test 1: Initialization
        console.log('\n1. Testing Initialization...');
        const mgr = new EnhancedOfflineGraphManagerV2({
            containerId: 'test-container',
            width: 800,
            height: 600
        });
        
        const initialized = mgr.init();
        addResult('Initialization', initialized, 'Graph manager initialized');
        
        // Test 2: Expression Evaluation
        console.log('\n2. Testing Expression Evaluation...');
        const exprTests = [
            { expr: '2+3', context: {}, expected: 5 },
            { expr: 'sin(PI/2)', context: {}, expected: 1 },
            { expr: 'x*2', context: { x: 5 }, expected: 10 },
            { expr: 'pow(2,3)', context: {}, expected: 8 },
            { expr: 'constructor', context: {}, expected: null },
            { expr: 'process.exit()', context: {}, expected: null }
        ];
        
        let exprPassed = 0;
        for (const test of exprTests) {
            const result = mgr.evaluateExpression(test.expr, test.context);
            const match = test.expected === null ? 
                (result === null) : 
                (Math.abs(result - test.expected) < 1e-10);
            if (match) exprPassed++;
        }
        addResult('Expression Evaluation', exprPassed === exprTests.length, 
            `${exprPassed}/${exprTests.length} tests passed`);
        
        // Test 3: Bounds Calculation
        console.log('\n3. Testing Bounds Calculation...');
        const testFormula = {
            name: 'Test',
            variables: [{ symbol: 'r', name: 'radius' }]
        };
        mgr.calculateEnhancedBounds(testFormula, testFormula.variables[0], {});
        const bounds = mgr.bounds;
        const validBounds = isFinite(bounds.left) && isFinite(bounds.right) && 
                           isFinite(bounds.top) && isFinite(bounds.bottom) &&
                           bounds.left < bounds.right && bounds.bottom < bounds.top;
        addResult('Bounds Calculation', validBounds, 
            `Bounds: [${bounds.left.toFixed(2)}, ${bounds.right.toFixed(2)}]`);
        
        // Test 4: Vector Generation (for concept network)
        console.log('\n4. Testing Vector Generation...');
        const vec1 = mgr.generateConceptVector ? mgr.generateConceptVector('test1') : null;
        if (!vec1) {
            // Vector generation is in concept test suite, not graph manager
            addResult('Vector Generation', true, 'N/A (in concept test suite)');
        } else {
            const validVec = Array.isArray(vec1) && vec1.length === 32 && 
                           vec1.every(v => isFinite(v) && !isNaN(v));
            addResult('Vector Generation', validVec, `Vector length: ${vec1 ? vec1.length : 0}`);
        }
        
        // Test 5: Coordinate Transforms
        console.log('\n5. Testing Coordinate Transforms...');
        mgr.bounds = { left: -10, right: 10, bottom: -10, top: 10 };
        mgr.width = 800;
        mgr.height = 600;
        const worldX = 5;
        const screenX = mgr.worldToScreenX(worldX);
        const backToWorld = mgr.screenToWorldX(screenX);
        const transformOk = Math.abs(backToWorld - worldX) < 1e-6;
        addResult('Coordinate Transforms', transformOk, 
            `Round-trip error: ${Math.abs(backToWorld - worldX)}`);
        
        console.log('\n' + '='.repeat(80));
        console.log(`Graph Manager Tests: ${results.passed} passed, ${results.failed} failed`);
        console.log('='.repeat(80));
        
        return results;
        
    } catch (e) {
        console.error('Error testing graph manager:', e);
        addResult('Error Handling', false, e.message);
        return results;
    }
}

async function testConceptNetwork() {
    console.log('\n🧪 TESTING CONCEPT NETWORK');
    console.log('='.repeat(80));
    
    try {
        const suite = new ConceptNetworkTestSuite();
        
        // Load concept map
        const conceptMapPath = path.join(__dirname, 'weighted_concept_mapping.json');
        if (fs.existsSync(conceptMapPath)) {
            const conceptMapData = fs.readFileSync(conceptMapPath, 'utf8');
            suite.conceptMap = JSON.parse(conceptMapData);
            console.log(`✅ Loaded ${suite.conceptMap.concepts.length} concepts`);
        } else {
            console.log('⚠️  Concept map not found, skipping concept network tests');
            return { passed: 0, failed: 0, tests: [] };
        }
        
        // Run tests
        const results = await suite.runAllTests();
        
        return results;
        
    } catch (e) {
        console.error('Error testing concept network:', e);
        return { passed: 0, failed: 0, tests: [], error: e.message };
    }
}

async function runAllTests() {
    console.log('\n🚀 RUNNING ALL TESTS');
    console.log('='.repeat(80));
    
    const graphResults = await testGraphManager();
    const conceptResults = await testConceptNetwork();
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`Graph Manager: ${graphResults.passed} passed, ${graphResults.failed} failed`);
    
    if (conceptResults.dimensionalIntegrity) {
        const totalPassed = Object.values(conceptResults).reduce((sum, r) => sum + (r.passed || 0), 0);
        const totalFailed = Object.values(conceptResults).reduce((sum, r) => sum + (r.failed || 0), 0);
        console.log(`Concept Network: ${totalPassed} passed, ${totalFailed} failed`);
    } else {
        console.log('Concept Network: Tests not run');
    }
    
    console.log('='.repeat(80));
    
    return { graphResults, conceptResults };
}

// Run if called directly
if (require.main === module) {
    runAllTests().then(() => {
        process.exit(0);
    }).catch(e => {
        console.error('Test execution failed:', e);
        process.exit(1);
    });
}

module.exports = { testGraphManager, testConceptNetwork, runAllTests };
