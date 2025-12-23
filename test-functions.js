// Test script to verify all improvements
console.log('=== Testing Code Improvements ===\n');

let passedTests = 0;
let failedTests = 0;

function testResult(name, passed, message) {
    if (passed) {
        console.log(`✅ PASS: ${name}`);
        if (message) console.log(`   ${message}`);
        passedTests++;
    } else {
        console.error(`❌ FAIL: ${name}`);
        if (message) console.error(`   ${message}`);
        failedTests++;
    }
}

// Test 1: escapeHtml function
try {
    const testXSS = '<script>alert("xss")</script>';
    const escaped = escapeHtml(testXSS);
    testResult('escapeHtml() exists and works', 
        !escaped.includes('<script>'), 
        `Properly escaped XSS: ${escaped.substring(0, 50)}...`);
} catch (e) {
    testResult('escapeHtml() exists and works', false, `Error: ${e.message}`);
}

// Test 2: safeHTML function
try {
    const userInput = '<img src=x onerror=alert(1)>';
    const safe = safeHTML`<div>${userInput}</div>`;
    testResult('safeHTML() template helper', 
        !safe.includes('onerror='), 
        'Template literals properly sanitized');
} catch (e) {
    testResult('safeHTML() template helper', false, `Error: ${e.message}`);
}

// Test 3: Tracked timeouts
try {
    testResult('trackedSetTimeout() exists', 
        typeof trackedSetTimeout === 'function', 
        'Timeout tracking system available');
    testResult('clearAllTimeouts() exists', 
        typeof clearAllTimeouts === 'function', 
        'Timeout cleanup available');
} catch (e) {
    testResult('Timeout tracking', false, `Error: ${e.message}`);
}

// Test 4: Event listener tracking
try {
    testResult('addTrackedEventListener() exists', 
        typeof addTrackedEventListener === 'function', 
        'Event listener tracking available');
    testResult('cleanupAllListeners() exists', 
        typeof cleanupAllListeners === 'function', 
        'Event listener cleanup available');
} catch (e) {
    testResult('Event listener tracking', false, `Error: ${e.message}`);
}

// Test 5: Debouncer
try {
    testResult('Debouncer class exists', 
        typeof Debouncer === 'function', 
        'Debouncer class defined');
    testResult('globalDebouncer instance exists', 
        typeof globalDebouncer !== 'undefined' && globalDebouncer instanceof Debouncer, 
        'Global debouncer instance available');
} catch (e) {
    testResult('Debouncer', false, `Error: ${e.message}`);
}

// Test 6: Cache management
try {
    testResult('cleanupCaches() exists', 
        typeof cleanupCaches === 'function', 
        'Cache cleanup function available');
    testResult('clearAllCaches() exists', 
        typeof clearAllCaches === 'function', 
        'Cache clear function available');
} catch (e) {
    testResult('Cache management', false, `Error: ${e.message}`);
}

// Test 7: Master cleanup
try {
    testResult('cleanupAllResources() exists', 
        typeof cleanupAllResources === 'function', 
        'Master cleanup function available');
    testResult('cleanupAllResources() globally accessible', 
        typeof window.cleanupAllResources === 'function', 
        'Accessible via window object');
} catch (e) {
    testResult('Master cleanup', false, `Error: ${e.message}`);
}

// Test 8: Check for memory management
try {
    testResult('activeTimeouts Set exists', 
        typeof activeTimeouts !== 'undefined', 
        'Timeout tracking data structure exists');
    testResult('globalEventListeners Map exists', 
        typeof globalEventListeners !== 'undefined', 
        'Event listener tracking data structure exists');
} catch (e) {
    testResult('Memory management structures', false, `Error: ${e.message}`);
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Total tests: ${passedTests + failedTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Code improvements verified.');
} else {
    console.warn(`\n⚠️  ${failedTests} test(s) failed. Please review the implementation.`);
}
