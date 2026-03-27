/**
 * Test Suite: Calculation Caching and Unit Conversion
 * Tests that:
 * 1. Cached calculations return immediately
 * 2. Results include all unit conversions
 * 3. Inputs accept different units and convert correctly
 * 4. Cache keys are deterministic and correct
 */

// Test utilities
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`Assertion failed: ${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
    }
}

function assertApproxEqual(actual, expected, tolerance, message) {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
        throw new Error(`Assertion failed: ${message}\n  Expected: ${expected} ± ${tolerance}\n  Actual: ${actual}\n  Difference: ${diff}`);
    }
}

function assertArrayIncludes(array, item, message) {
    if (!array.includes(item)) {
        throw new Error(`Assertion failed: ${message}\n  Array: [${array.join(', ')}]\n  Missing: ${item}`);
    }
}

// Mock dependencies
class MockUnitConverter {
    constructor() {
        this.conversions = {
            'm': { 'km': 0.001, 'cm': 100, 'mm': 1000 },
            'kg': { 'g': 1000, 'M☉': 1 / 1.989e30 },
            's': { 'min': 1/60, 'h': 1/3600, 'day': 1/86400 }
        };
    }
    
    getAlternativeUnits(baseUnit) {
        const units = [baseUnit];
        if (this.conversions[baseUnit]) {
            units.push(...Object.keys(this.conversions[baseUnit]));
        }
        return units;
    }
    
    convertToBase(value, fromUnit, baseUnit) {
        if (fromUnit === baseUnit) return value;
        const factor = this.conversions[baseUnit]?.[fromUnit];
        if (factor) {
            return value / factor; // Convert to base
        }
        return value;
    }
    
    convert(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) return value;
        const baseValue = this.convertToBase(value, fromUnit, fromUnit === 'm' ? 'm' : fromUnit === 'kg' ? 'kg' : 's');
        const factor = this.conversions[baseValue === value ? fromUnit : 'm']?.[toUnit];
        if (factor) {
            return baseValue * factor;
        }
        return value;
    }
    
    convertAndFormat(value, fromUnit, toUnit) {
        const converted = this.convert(value, fromUnit, toUnit);
        return `${converted} ${toUnit}`;
    }
}

class MockFormula {
    constructor(id, name, variables) {
        this.id = id;
        this.name = name;
        this.variables = variables;
    }
}

class MockCalculator {
    constructor() {
        this.solveCount = 0;
    }
    
    solve(variableValues) {
        this.solveCount++;
        // Simple mock: solve for first null variable
        const entries = Object.entries(variableValues);
        const known = entries.filter(([_, v]) => v !== null);
        const unknown = entries.find(([_, v]) => v === null);
        
        if (unknown && known.length > 0) {
            // Mock calculation: if solving for 'r' and have 'v' and 't', return v*t
            if (unknown[0] === 'r' && variableValues.v && variableValues.t) {
                return {
                    result: variableValues.v * variableValues.t,
                    isSymbolic: false,
                    solvedFor: 'r'
                };
            }
            // Mock: if solving for 'v' and have 'r' and 't', return r/t
            if (unknown[0] === 'v' && variableValues.r && variableValues.t) {
                return {
                    result: variableValues.r / variableValues.t,
                    isSymbolic: false,
                    solvedFor: 'v'
                };
            }
        }
        
        // Default: return first known value
        if (known.length > 0) {
            return {
                result: known[0][1],
                isSymbolic: false,
                solvedFor: known[0][0]
            };
        }
        
        return {
            result: 'No values provided',
            isSymbolic: true
        };
    }
}

// Test CalculationOrchestrator caching
class TestCalculationOrchestrator {
    constructor() {
        this.unitConverter = new MockUnitConverter();
        this._calculationResultCache = new Map();
        this._maxCacheSize = 100;
        this.displayResultCalls = [];
        this.updateVariableUnitInputsCalls = [];
    }
    
    _generateCalculationCacheKey(formulaId, variableValues) {
        const sortedEntries = Object.entries(variableValues)
            .filter(([_, v]) => v !== null && typeof v === 'number' && Number.isFinite(v))
            .sort((a, b) => a[0].localeCompare(b[0]));
        
        const varString = sortedEntries.map(([symbol, value]) => `${symbol}:${value}`).join('|');
        return `${formulaId}|${varString}`;
    }
    
    _cacheCalculationResult(cacheKey, result) {
        if (this._calculationResultCache.size >= this._maxCacheSize) {
            const firstKey = this._calculationResultCache.keys().next().value;
            if (firstKey !== undefined) {
                this._calculationResultCache.delete(firstKey);
            }
        }
        
        this._calculationResultCache.set(cacheKey, {
            result,
            timestamp: Date.now()
        });
    }
    
    _enhanceResultWithUnitConversions(result, formula) {
        if (!result || result.isSymbolic || typeof result.result !== 'number' || !Number.isFinite(result.result)) {
            return result;
        }
        
        const solvedFor = result.solvedFor || result.variable;
        if (!solvedFor || solvedFor === 'result' || !this.unitConverter) {
            return result;
        }
        
        const varDef = formula.variables.find(v => v.symbol === solvedFor);
        if (!varDef || !varDef.unit) {
            return result;
        }
        
        const baseUnit = varDef.unit;
        const baseValue = result.result;
        
        try {
            const alternativeUnits = this.unitConverter.getAlternativeUnits(baseUnit);
            const unitConversions = [];
            
            for (const altUnit of alternativeUnits) {
                if (altUnit === baseUnit) continue;
                try {
                    const convertedValue = this.unitConverter.convert(baseValue, baseUnit, altUnit);
                    if (convertedValue !== null && Number.isFinite(convertedValue)) {
                        unitConversions.push({
                            unit: altUnit,
                            value: convertedValue
                        });
                    }
                } catch (e) {
                    // Skip failed conversions
                }
            }
            
            return {
                ...result,
                unitConversions: unitConversions,
                baseUnit: baseUnit,
                baseValue: baseValue
            };
        } catch (e) {
            return result;
        }
    }
    
    displayResult(result) {
        this.displayResultCalls.push(result);
    }
    
    updateVariableUnitInputs(symbol, value, formula) {
        this.updateVariableUnitInputsCalls.push({ symbol, value, formula });
    }
    
    getCachedResult(formulaId, variableValues) {
        const cacheKey = this._generateCalculationCacheKey(formulaId, variableValues);
        const cached = this._calculationResultCache.get(cacheKey);
        return cached ? cached.result : null;
    }
    
    clearCache() {
        this._calculationResultCache.clear();
        this.displayResultCalls = [];
        this.updateVariableUnitInputsCalls = [];
    }
}

// Test Suite
function runTests() {
    console.log('🧪 Running Calculation Caching and Unit Conversion Tests...\n');
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    function runTest(name, testFn) {
        try {
            testFn();
            console.log(`✅ ${name}`);
            testsPassed++;
        } catch (error) {
            console.error(`❌ ${name}: ${error.message}`);
            testsFailed++;
        }
    }
    
    // Test 1: Cache key generation is deterministic
    runTest('Cache key generation is deterministic', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula = new MockFormula('test-formula', 'Test Formula', []);
        const values1 = { a: 10, b: 20, c: null };
        const values2 = { b: 20, a: 10, c: null }; // Same values, different order
        
        const key1 = orchestrator._generateCalculationCacheKey(formula.id, values1);
        const key2 = orchestrator._generateCalculationCacheKey(formula.id, values2);
        
        assertEqual(key1, key2, 'Cache keys should be identical for same values in different order');
    });
    
    // Test 2: Cache key ignores null values
    runTest('Cache key ignores null values', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula = new MockFormula('test-formula', 'Test Formula', []);
        const values1 = { a: 10, b: 20, c: null };
        const values2 = { a: 10, b: 20, d: null }; // Different null variable
        
        const key1 = orchestrator._generateCalculationCacheKey(formula.id, values1);
        const key2 = orchestrator._generateCalculationCacheKey(formula.id, values2);
        
        assertEqual(key1, key2, 'Cache keys should be identical when only null values differ');
    });
    
    // Test 3: Cached results return immediately
    runTest('Cached results return immediately', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula = new MockFormula('test-formula', 'Test Formula', [
            { symbol: 'r', unit: 'm' }
        ]);
        
        const result = {
            result: 100,
            isSymbolic: false,
            solvedFor: 'r'
        };
        
        const enhancedResult = orchestrator._enhanceResultWithUnitConversions(result, formula);
        const cacheKey = orchestrator._generateCalculationCacheKey(formula.id, { r: null, v: 10, t: 10 });
        orchestrator._cacheCalculationResult(cacheKey, enhancedResult);
        
        const cached = orchestrator.getCachedResult(formula.id, { r: null, v: 10, t: 10 });
        assert(cached !== null, 'Cached result should be found');
        assertEqual(cached.result, 100, 'Cached result value should match');
    });
    
    // Test 4: Unit conversions are included in cached results
    runTest('Unit conversions are included in cached results', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula = new MockFormula('test-formula', 'Test Formula', [
            { symbol: 'r', unit: 'm' }
        ]);
        
        const result = {
            result: 1000, // 1000 meters
            isSymbolic: false,
            solvedFor: 'r'
        };
        
        const enhancedResult = orchestrator._enhanceResultWithUnitConversions(result, formula);
        
        assert(enhancedResult.unitConversions !== undefined, 'Result should have unitConversions property');
        assert(enhancedResult.unitConversions.length > 0, 'Result should have at least one unit conversion');
        assert(enhancedResult.baseUnit === 'm', 'Base unit should be m');
        assert(enhancedResult.baseValue === 1000, 'Base value should be 1000');
        
        // Check that km conversion exists
        const kmConversion = enhancedResult.unitConversions.find(c => c.unit === 'km');
        assert(kmConversion !== undefined, 'Should have km conversion');
        assertApproxEqual(kmConversion.value, 1, 0.001, '1000m should convert to 1km');
    });
    
    // Test 5: Cache eviction works when size limit is reached
    runTest('Cache eviction works when size limit is reached', () => {
        const orchestrator = new TestCalculationOrchestrator();
        orchestrator._maxCacheSize = 3; // Small cache for testing
        
        const formula = new MockFormula('test-formula', 'Test Formula', []);
        
        // Add 4 entries
        for (let i = 0; i < 4; i++) {
            const cacheKey = orchestrator._generateCalculationCacheKey(formula.id, { a: i });
            orchestrator._cacheCalculationResult(cacheKey, { result: i });
        }
        
        // Cache should only have 3 entries
        assertEqual(orchestrator._calculationResultCache.size, 3, 'Cache should not exceed max size');
        
        // First entry should be evicted
        const firstKey = orchestrator._generateCalculationCacheKey(formula.id, { a: 0 });
        assert(!orchestrator._calculationResultCache.has(firstKey), 'First entry should be evicted');
    });
    
    // Test 6: Input unit conversion to base units
    runTest('Input unit conversion to base units', () => {
        const converter = new MockUnitConverter();
        
        // Convert 1 km to meters (base unit)
        const baseValue = converter.convertToBase(1, 'km', 'm');
        assertApproxEqual(baseValue, 1000, 0.1, '1 km should convert to 1000 m');
        
        // Convert 1000 g to kg (base unit)
        const baseMass = converter.convertToBase(1000, 'g', 'kg');
        assertApproxEqual(baseMass, 1, 0.001, '1000 g should convert to 1 kg');
    });
    
    // Test 7: Results display all unit conversions
    runTest('Results display all unit conversions', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula = new MockFormula('test-formula', 'Test Formula', [
            { symbol: 'r', unit: 'm' }
        ]);
        
        const result = {
            result: 1000,
            isSymbolic: false,
            solvedFor: 'r',
            unitConversions: [
                { unit: 'km', value: 1 },
                { unit: 'cm', value: 100000 }
            ],
            baseUnit: 'm',
            baseValue: 1000
        };
        
        orchestrator.displayResult(result);
        
        assert(orchestrator.displayResultCalls.length === 1, 'displayResult should be called once');
        const displayedResult = orchestrator.displayResultCalls[0];
        assert(displayedResult.unitConversions !== undefined, 'Displayed result should have unitConversions');
        assert(displayedResult.unitConversions.length === 2, 'Should have 2 unit conversions');
    });
    
    // Test 8: Same inputs produce same cache key
    runTest('Same inputs produce same cache key', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula = new MockFormula('test-formula', 'Test Formula', []);
        
        const values1 = { a: 10.0, b: 20.0 };
        const values2 = { a: 10, b: 20 }; // Same values, different number format
        
        const key1 = orchestrator._generateCalculationCacheKey(formula.id, values1);
        const key2 = orchestrator._generateCalculationCacheKey(formula.id, values2);
        
        assertEqual(key1, key2, 'Cache keys should be identical for same numeric values');
    });
    
    // Test 9: Different inputs produce different cache keys
    runTest('Different inputs produce different cache keys', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula = new MockFormula('test-formula', 'Test Formula', []);
        
        const values1 = { a: 10, b: 20 };
        const values2 = { a: 10, b: 30 }; // Different value
        
        const key1 = orchestrator._generateCalculationCacheKey(formula.id, values1);
        const key2 = orchestrator._generateCalculationCacheKey(formula.id, values2);
        
        assert(key1 !== key2, 'Cache keys should be different for different values');
    });
    
    // Test 10: Formula ID is part of cache key
    runTest('Formula ID is part of cache key', () => {
        const orchestrator = new TestCalculationOrchestrator();
        const formula1 = new MockFormula('formula-1', 'Formula 1', []);
        const formula2 = new MockFormula('formula-2', 'Formula 2', []);
        
        const values = { a: 10, b: 20 };
        
        const key1 = orchestrator._generateCalculationCacheKey(formula1.id, values);
        const key2 = orchestrator._generateCalculationCacheKey(formula2.id, values);
        
        assert(key1 !== key2, 'Cache keys should be different for different formulas');
        assert(key1.startsWith('formula-1'), 'Key1 should start with formula-1');
        assert(key2.startsWith('formula-2'), 'Key2 should start with formula-2');
    });
    
    console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
    
    if (testsFailed === 0) {
        console.log('✅ All tests passed!');
        return true;
    } else {
        console.error(`❌ ${testsFailed} test(s) failed`);
        return false;
    }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    runTests();
} else {
    // Browser environment - expose test function
    window.testCalculationCaching = runTests;
    console.log('💡 Run tests with: window.testCalculationCaching()');
}

