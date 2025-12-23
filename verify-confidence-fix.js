/**
 * Verification Script for Production-Grade Confidence System
 * Run this in browser console to verify all improvements
 */

console.log('🧪 === CONFIDENCE SYSTEM VERIFICATION ===\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        const result = fn();
        if (result) {
            console.log(`✅ ${name}`);
            passed++;
        } else {
            console.error(`❌ ${name}`);
            failed++;
        }
        return result;
    } catch (e) {
        console.error(`❌ ${name} - Exception: ${e.message}`);
        failed++;
        return false;
    }
}

// Test 1: Function exists
test('calculateConfidenceScore() exists', () => {
    return typeof calculateConfidenceScore === 'function';
});

// Test 2: Returns structured object
test('Returns { confidence, breakdown } structure', () => {
    const result = calculateConfidenceScore(500, 1000, {});
    return result && 
           typeof result.confidence === 'number' && 
           Array.isArray(result.breakdown);
});

// Test 3: Temperature example (THE KEY TEST)
console.log('\n🔬 Testing Temperature Example (Wien\'s Law scenario)...');
const tempResult = calculateConfidenceScore(
    450,    // literal
    2400,   // max combined
    {
        nameMatch: true,
        questionPatternMatch: true,
        conceptMatch: true,
        matchedConcepts: ['temperature', 'wavelength', 'wien']
    },
    1,      // history
    1200,   // topic
    750     // context
);

test('Temperature example: confidence ≥ 85%', () => {
    console.log(`   Confidence: ${tempResult.confidence}%`);
    return tempResult.confidence >= 85;
});

test('Temperature example: confidence ≤ 100%', () => {
    return tempResult.confidence <= 100;
});

test('Temperature example: has Topic Relevance component', () => {
    const hasTopic = tempResult.breakdown.some(b => b.label === 'Topic Relevance');
    if (hasTopic) {
        const comp = tempResult.breakdown.find(b => b.label === 'Topic Relevance');
        console.log(`   Topic contribution: +${comp.value}%`);
    }
    return hasTopic;
});

test('Temperature example: has Context Match component', () => {
    const hasContext = tempResult.breakdown.some(b => b.label === 'Context Match');
    if (hasContext) {
        const comp = tempResult.breakdown.find(b => b.label === 'Context Match');
        console.log(`   Context contribution: +${comp.value}%`);
    }
    return hasContext;
});

// Test 4: Backward compatibility
console.log('\n🔄 Testing Backward Compatibility...');
const legacyResult = calculateConfidenceScore(800, 1000, { nameMatch: true });
test('Works without topic/context (old API)', () => {
    return legacyResult.confidence >= 0 && legacyResult.confidence <= 100;
});

// Test 5: Edge cases
console.log('\n⚠️  Testing Edge Cases...');

test('Invalid maxScore returns confidence 0', () => {
    const result = calculateConfidenceScore(500, 0, {});
    return result.confidence === 0;
});

test('Negative values clamped to 0', () => {
    const result = calculateConfidenceScore(-100, 1000, {}, 1, -500, -300);
    return result.confidence >= 0;
});

test('Confidence never exceeds 100%', () => {
    const result = calculateConfidenceScore(5000, 5000, {
        nameMatch: true,
        questionPatternMatch: true,
        conceptMatch: true,
        matchedConcepts: ['a', 'b', 'c', 'd', 'e']
    }, 1.5, 3000, 2000);
    console.log(`   Extreme case confidence: ${result.confidence}%`);
    return result.confidence === 100;
});

// Test 6: Configuration constants
console.log('\n⚙️  Testing Configuration...');
test('CONFIDENCE_CONFIG defined', () => {
    return typeof CONFIDENCE_CONFIG !== 'undefined';
});

if (typeof CONFIDENCE_CONFIG !== 'undefined') {
    console.log(`   BASE_MAX: ${CONFIDENCE_CONFIG.BASE_MAX}`);
    console.log(`   TOPIC_CAP: ${CONFIDENCE_CONFIG.TOPIC_CAP}`);
    console.log(`   CONTEXT_CAP: ${CONFIDENCE_CONFIG.CONTEXT_CAP}`);
    console.log(`   MAX_BOOSTS: ${CONFIDENCE_CONFIG.MAX_BOOSTS}`);
}

// Test 7: getConfidenceLevel
console.log('\n🎨 Testing Confidence Levels...');
test('getConfidenceLevel() exists', () => {
    return typeof getConfidenceLevel === 'function';
});

if (typeof getConfidenceLevel === 'function') {
    const levels = {
        90: getConfidenceLevel(90),
        75: getConfidenceLevel(75),
        55: getConfidenceLevel(55),
        35: getConfidenceLevel(35),
        10: getConfidenceLevel(10)
    };
    
    console.log('   90% →', levels[90].level, levels[90].color);
    console.log('   75% →', levels[75].level, levels[75].color);
    console.log('   55% →', levels[55].level, levels[55].color);
    console.log('   35% →', levels[35].level, levels[35].color);
    console.log('   10% →', levels[10].level, levels[10].color);
    
    test('90% = Very High', () => levels[90].level === 'Very High');
    test('75% = High', () => levels[75].level === 'High');
    test('55% = Moderate', () => levels[55].level === 'Moderate');
}

// Test 8: getConfidenceBreakdown
console.log('\n📊 Testing Breakdown Wrapper...');
test('getConfidenceBreakdown() exists', () => {
    return typeof getConfidenceBreakdown === 'function';
});

if (typeof getConfidenceBreakdown === 'function') {
    const breakdownResult = getConfidenceBreakdown(450, 2400, {
        nameMatch: true,
        conceptMatch: true,
        matchedConcepts: ['temp', 'wien']
    }, 1, 1200, 750);
    
    test('Breakdown returns confidence', () => {
        return typeof breakdownResult.confidence === 'number';
    });
    
    test('Breakdown returns array', () => {
        return Array.isArray(breakdownResult.breakdown);
    });
    
    test('Breakdown has ≥4 components', () => {
        console.log(`   Breakdown components: ${breakdownResult.breakdown.length}`);
        return breakdownResult.breakdown.length >= 4;
    });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`Total tests: ${passed + failed}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Confidence system is production-ready');
    console.log('✅ All improvements verified');
    console.log('\n🚀 Ready for deployment!');
} else {
    console.warn(`\n⚠️  ${failed} test(s) failed`);
    console.warn('Please review the implementation');
}

// Bonus: Show detailed breakdown for temperature example
if (failed === 0) {
    console.log('\n📋 Temperature Example Breakdown:');
    console.log('─'.repeat(50));
    tempResult.breakdown.forEach(comp => {
        const sign = comp.value >= 0 ? '+' : '';
        console.log(`${comp.label.padEnd(25)} ${sign}${comp.value}%`);
        console.log(`  ↳ ${comp.description}`);
    });
    console.log('─'.repeat(50));
    console.log(`FINAL CONFIDENCE: ${tempResult.confidence}%`);
    console.log(`LEVEL: ${getConfidenceLevel(tempResult.confidence).level}`);
}
