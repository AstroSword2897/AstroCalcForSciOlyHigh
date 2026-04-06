/**
 * Comprehensive UnitConverter Test Suite
 * Run this in browser console to diagnose conversion issues
 */

// Test cases
const testCases = [
    // Distance conversions
    { name: '5 km → m', value: 5, from: 'km', to: 'm', expected: 5000 },
    { name: '13 km → m', value: 13, from: 'km', to: 'm', expected: 13000 },
    { name: '100 cm → m', value: 100, from: 'cm', to: 'm', expected: 1 },
    { name: '1 AU → m', value: 1, from: 'AU', to: 'm', expected: 149597870700 },
    { name: '1 km → pc', value: 1, from: 'km', to: 'pc', expected: 1000 / (149597870700 * (648000 / Math.PI)) },
    
    // Mass conversions
    { name: '2 M☉ → kg', value: 2, from: 'M☉', to: 'kg', expected: 2 * 1.988409870440e30 },
    { name: '1 M_earth → kg', value: 1, from: 'M_earth', to: 'kg', expected: 5.9721684356e24 },
    { name: '1000 g → kg', value: 1000, from: 'g', to: 'kg', expected: 1 },
    
    // Temperature conversions
    { name: '0 °C → K', value: 0, from: '°C', to: 'K', expected: 273.15 },
    { name: '100 °C → K', value: 100, from: '°C', to: 'K', expected: 373.15 },
    { name: '32 °F → K', value: 32, from: '°F', to: 'K', expected: 273.15 },
    { name: '273.15 K → °C', value: 273.15, from: 'K', to: '°C', expected: 0 },
    
    // Time conversions
    { name: '60 min → s', value: 60, from: 'min', to: 's', expected: 3600 },
    { name: '1 h → s', value: 1, from: 'h', to: 's', expected: 3600 },
    
    // Case sensitivity
    { name: '5 Km → m (case)', value: 5, from: 'Km', to: 'm', expected: 5000 },
    { name: '5 KM → m (uppercase)', value: 5, from: 'KM', to: 'm', expected: 5000 },
];

// Test convertToBase specifically
const convertToBaseTests = [
    { name: 'convertToBase(13, km, m)', value: 13, from: 'km', to: 'm', expected: 13000 },
    { name: 'convertToBase(2, M☉, kg)', value: 2, from: 'M☉', to: 'kg', expected: 2 * 1.988409870440e30 },
    { name: 'convertToBase(100, cm, m)', value: 100, from: 'cm', to: 'm', expected: 1 },
    {
        name: 'convertToBase(1, km, pc)',
        value: 1,
        from: 'km',
        to: 'pc',
        expected: 1000 / (149597870700 * (648000 / Math.PI))
    },
];

function runTests() {
    console.log('🧪 Running UnitConverter Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test convert()
    console.log('📊 Testing convert():');
    testCases.forEach(test => {
        try {
            const result = UnitConverter.convert(test.value, test.from, test.to);
            const tolerance = Math.abs(test.expected) * 0.0001; // 0.01% tolerance
            const passed = Math.abs(result - test.expected) < tolerance;
            
            if (passed) {
                console.log(`  ✅ ${test.name}: ${result} (expected ${test.expected})`);
                passed++;
            } else {
                console.error(`  ❌ ${test.name}: got ${result}, expected ${test.expected}`);
                failed++;
            }
        } catch (e) {
            console.error(`  ❌ ${test.name}: ERROR - ${e.message}`);
            failed++;
        }
    });
    
    console.log('\n📊 Testing convertToBase():');
    convertToBaseTests.forEach(test => {
        try {
            const result = UnitConverter.convertToBase(test.value, test.from, test.to);
            const tolerance = Math.abs(test.expected) * 0.0001;
            const passed = Math.abs(result - test.expected) < tolerance;
            
            if (passed) {
                console.log(`  ✅ ${test.name}: ${result} (expected ${test.expected})`);
                passed++;
            } else {
                console.error(`  ❌ ${test.name}: got ${result}, expected ${test.expected}`);
                failed++;
            }
        } catch (e) {
            console.error(`  ❌ ${test.name}: ERROR - ${e.message}`);
            failed++;
        }
    });
    
    // Test canonicalization
    console.log('\n📊 Testing canonicalization:');
    const canonicalTests = [
        { input: 'km', expected: 'km' },
        { input: 'Km', expected: 'km' },
        { input: 'KM', expected: 'km' },
        { input: 'M☉', expected: 'M☉' },
        { input: 'm☉', expected: 'M☉' },
        { input: 'M_sun', expected: 'M☉' },
    ];
    
    canonicalTests.forEach(test => {
        const result = UnitConverter.getCanonical(test.input);
        if (result === test.expected) {
            console.log(`  ✅ getCanonical('${test.input}'): '${result}'`);
            passed++;
        } else {
            console.error(`  ❌ getCanonical('${test.input}'): got '${result}', expected '${test.expected}'`);
            failed++;
        }
    });
    
    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);
    
    return { passed, failed };
}

// Export for browser console
if (typeof window !== 'undefined') {
    window.testUnitConverter = runTests;
    console.log('✅ Test suite loaded! Run testUnitConverter() in console to test conversions.');
}

