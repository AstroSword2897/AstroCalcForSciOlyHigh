/**
 * Test Case Validator
 * Validates all generated test cases to ensure they're physically valid
 * and won't cause calculation failures
 */

// Validation rules for different variable types
const VALIDATION_RULES = {
    // Variables that must be positive
    mustBePositive: [
        'mass', 'radius', 'distance', 'period', 'temperature', 
        'wavelength', 'frequency', 'parallax', 'luminosity', 'flux',
        'separation', 'semi-major', 'velocity', 'speed'
    ],
    
    // Variables that can be negative
    canBeNegative: [
        'magnitude', 'energy', 'pressure', 'dp', 'dP', 'redshift'
    ],
    
    // Special cases
    specialCases: {
        'magnitude_flux_relation': {
            'm1': 'canBeNegative',
            'm2': 'canBeNegative',
            'F1': 'mustBePositive',
            'F2': 'mustBePositive'
        },
        'orbital_energy': {
            'E': 'canBeNegative', // Bound orbits have negative energy
            'M': 'mustBePositive',
            'm': 'mustBePositive',
            'a': 'mustBePositive'
        },
        'hydrostatic_balance': {
            'dP_dr': 'canBeNegative', // Negative for hydrostatic equilibrium
            'M': 'mustBePositive',
            'ρ': 'mustBePositive',
            'r': 'mustBePositive'
        },
        'power_law_spectrum': {
            'N': 'mustBePositive',
            'K': 'mustBePositive',
            'E': 'mustBePositive', // But E ≠ 1
            'p': 'any'
        }
    }
};

/**
 * Validate a test case
 */
function validateTestCase(testCase, formula) {
    const errors = [];
    const warnings = [];
    
    if (!testCase || !formula) {
        return { valid: false, errors: ['Test case or formula is missing'] };
    }
    
    const inputs = testCase.inputs || {};
    const formulaId = formula.id;
    const variables = formula.variables || [];
    
    // Check that we have exactly one null variable (the one to solve for)
    const nullVars = Object.entries(inputs).filter(([key, value]) => value === null || value === undefined);
    if (nullVars.length === 0) {
        errors.push('No variable to solve for (all variables have values)');
    } else if (nullVars.length > 1) {
        errors.push(`Multiple variables to solve for: ${nullVars.map(([k]) => k).join(', ')}`);
    }
    
    // Validate each input value
    for (const variable of variables) {
        const symbol = variable.symbol;
        const varName = (variable.name || '').toLowerCase();
        const value = inputs[symbol];
        
        // Skip null values (these are the ones we're solving for)
        if (value === null || value === undefined) {
            continue;
        }
        
        // Check if value is a number
        if (typeof value !== 'number' || !isFinite(value)) {
            errors.push(`${symbol}: Invalid value (not a finite number): ${value}`);
            continue;
        }
        
        // Check special cases first
        const specialCase = VALIDATION_RULES.specialCases[formulaId];
        if (specialCase && specialCase[symbol]) {
            const rule = specialCase[symbol];
            if (rule === 'mustBePositive' && value <= 0) {
                errors.push(`${symbol}: Must be positive (special case), got: ${value}`);
            } else if (rule === 'canBeNegative' && isNaN(value)) {
                errors.push(`${symbol}: Must be a number (special case), got: ${value}`);
            }
            continue;
        }
        
        // Check if this is a magnitude (not mass) in magnitude_flux_relation
        const isMagnitude = formulaId === 'magnitude_flux_relation' && 
                          (symbol.toLowerCase() === 'm1' || symbol.toLowerCase() === 'm2');
        
        // Check mustBePositive rules
        const mustBePositive = VALIDATION_RULES.mustBePositive.some(rule => 
            varName.includes(rule) || 
            symbol.toLowerCase().includes(rule) ||
            (rule === 'mass' && !isMagnitude && (
                symbol.toLowerCase() === 'm' ||
                symbol.toLowerCase().startsWith('m') ||
                symbol.toLowerCase().startsWith('M')
            ))
        );
        
        if (mustBePositive && value <= 0) {
            errors.push(`${symbol}: Must be positive (${varName}), got: ${value}`);
        }
        
        // Check for unreasonable values
        if (Math.abs(value) > 1e60) {
            warnings.push(`${symbol}: Extremely large value: ${value}`);
        }
        
        if (value !== 0 && Math.abs(value) < 1e-60) {
            warnings.push(`${symbol}: Extremely small value: ${value}`);
        }
        
        // Formula-specific validations
        if (formulaId === 'power_law_spectrum') {
            if (symbol === 'E' && value === 1) {
                errors.push(`${symbol}: E cannot be 1 (would cause division by zero in log)`);
            }
            if (symbol === 'K' && value === 0) {
                errors.push(`${symbol}: K cannot be 0`);
            }
            if (symbol === 'p' && value === 0) {
                errors.push(`${symbol}: p cannot be 0`);
            }
        }
        
        if (formulaId === 'magnitude_flux_relation') {
            if ((symbol === 'F1' || symbol === 'F2') && value <= 0) {
                errors.push(`${symbol}: Flux must be positive, got: ${value}`);
            }
            if (symbol === 'F1' && symbol === 'F2' && inputs['F1'] && inputs['F2'] && inputs['F1'] / inputs['F2'] <= 0) {
                errors.push(`F1/F2 must be positive for log10, got: ${inputs['F1'] / inputs['F2']}`);
            }
        }
        
        if (formulaId === 'orbital_energy') {
            if (symbol === 'E' && value >= 0) {
                warnings.push(`${symbol}: Energy is positive (unbound orbit), expected negative for bound orbit`);
            }
            if (symbol === 'E' && value === 0) {
                errors.push(`${symbol}: Energy cannot be zero (parabolic orbit edge case)`);
            }
        }
        
        if (formulaId === 'hydrostatic_balance') {
            if (symbol === 'dP_dr' && value > 0) {
                warnings.push(`${symbol}: dP_dr is positive, but hydrostatic equilibrium requires negative gradient`);
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate all test cases for a formula
 */
function validateFormulaTestCases(formula) {
    if (typeof generateFormulaTestCases !== 'function') {
        return {
            valid: false,
            errors: ['generateFormulaTestCases function not available'],
            testCases: []
        };
    }
    
    const testCases = generateFormulaTestCases(formula);
    const results = {
        formulaId: formula.id,
        formulaName: formula.name,
        testCases: [],
        totalErrors: 0,
        totalWarnings: 0,
        allValid: true
    };
    
    for (const testCase of testCases) {
        const validation = validateTestCase(testCase, formula);
        results.testCases.push({
            testCase,
            validation
        });
        
        if (!validation.valid) {
            results.allValid = false;
            results.totalErrors += validation.errors.length;
        }
        results.totalWarnings += validation.warnings.length;
    }
    
    return results;
}

/**
 * Validate all test cases for all formulas
 */
function validateAllTestCases() {
    if (typeof formulas === 'undefined' || !formulas || !Array.isArray(formulas)) {
        return {
            valid: false,
            error: 'Formulas not loaded'
        };
    }
    
    console.log('🔍 VALIDATING ALL TEST CASES');
    console.log('='.repeat(80));
    console.log(`\nValidating ${formulas.length} formulas...\n`);
    
    const results = {
        totalFormulas: formulas.length,
        validFormulas: 0,
        invalidFormulas: 0,
        totalTestCases: 0,
        validTestCases: 0,
        invalidTestCases: 0,
        totalErrors: 0,
        totalWarnings: 0,
        formulaResults: [],
        errors: []
    };
    
    for (const formula of formulas) {
        const formulaValidation = validateFormulaTestCases(formula);
        results.formulaResults.push(formulaValidation);
        results.totalTestCases += formulaValidation.testCases.length;
        
        if (formulaValidation.allValid) {
            results.validFormulas++;
            results.validTestCases += formulaValidation.testCases.length;
        } else {
            results.invalidFormulas++;
            results.invalidTestCases += formulaValidation.testCases.length;
            results.errors.push({
                formula: formula.id,
                name: formula.name,
                errors: formulaValidation.testCases
                    .filter(tc => !tc.validation.valid)
                    .flatMap(tc => tc.validation.errors.map(e => `${tc.testCase.description}: ${e}`))
            });
        }
        
        results.totalErrors += formulaValidation.totalErrors;
        results.totalWarnings += formulaValidation.totalWarnings;
    }
    
    // Print summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Formulas: ${results.validFormulas}/${results.totalFormulas} valid`);
    console.log(`Test Cases: ${results.validTestCases}/${results.totalTestCases} valid`);
    console.log(`Total Errors: ${results.totalErrors}`);
    console.log(`Total Warnings: ${results.totalWarnings}`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        console.log('='.repeat(80));
        for (const error of results.errors.slice(0, 20)) { // Show first 20
            console.log(`\n${error.formula} (${error.name}):`);
            error.errors.forEach(e => console.log(`  - ${e}`));
        }
        if (results.errors.length > 20) {
            console.log(`\n... and ${results.errors.length - 20} more formulas with errors`);
        }
    }
    
    if (results.totalWarnings > 0) {
        console.log(`\n⚠️  ${results.totalWarnings} warnings (non-critical)`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (results.allValid) {
        console.log('✅ ALL TEST CASES ARE VALID!');
    } else {
        console.log('❌ SOME TEST CASES HAVE ERRORS');
        console.log(`   Fix ${results.totalErrors} errors to achieve 100% validation`);
    }
    
    return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.validateTestCases = validateAllTestCases;
    window.validateFormulaTestCases = validateFormulaTestCases;
    window.validateTestCase = validateTestCase;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateAllTestCases,
        validateFormulaTestCases,
        validateTestCase,
        VALIDATION_RULES
    };
}
