/**
 * Exam Subparts Runner (Node, CommonJS)
 *
 * Runs a focused set of calculation subparts from pasted exams using the real
 * FormulaCalculator + formulas.js definitions.
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertApprox(actual, expected, tolerance, message) {
    const diff = Math.abs(actual - expected);
    if (!(diff <= tolerance)) {
        throw new Error(`${message}\n  expected=${expected}\n  actual=${actual}\n  diff=${diff}\n  tol=${tolerance}`);
    }
}

function loadScriptIntoGlobal(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInThisContext(code, { filename: filePath });
}

function ensureNodeDomShims() {
    global.window = global.window || global;
    global.document = global.document || {
        createElement: () => ({
            textContent: '',
            innerHTML: ''
        })
    };
    global.performance = global.performance || { now: () => Date.now() };
}

function getFormulaById(id) {
    const formulas = global.formulas || global.window?.formulas || global.globalFormulas;
    assert(Array.isArray(formulas), 'formulas not loaded');
    const formula = formulas.find(f => f.id === id);
    assert(formula, `Formula not found: ${id}`);
    return formula;
}

function solveFormula(formulaId, inputs, expectedUnknown) {
    const FormulaCalculator = global.FormulaCalculator || global.window?.FormulaCalculator;
    const UnitConverter = global.UnitConverter || global.window?.UnitConverter;
    const SafeExpressionEvaluator = global.SafeExpressionEvaluator || global.window?.SafeExpressionEvaluator;

    assert(FormulaCalculator, 'FormulaCalculator not loaded');

    const formula = getFormulaById(formulaId);
    const calc = new FormulaCalculator(formula, {
        unitConverter: UnitConverter ? new UnitConverter() : null,
        mathEvaluator: SafeExpressionEvaluator || null
    });

    const values = {};
    for (const v of (formula.variables || [])) {
        values[v.symbol] = Object.prototype.hasOwnProperty.call(inputs, v.symbol) ? inputs[v.symbol] : null;
    }
    const result = calc.solve(values);
    assert(result && !result.isSymbolic, `${formulaId}: expected numeric result, got symbolic`);

    const solvedFor = result.solvedFor || result.variable;
    if (expectedUnknown) {
        assert(solvedFor === expectedUnknown, `${formulaId}: solved for ${solvedFor}, expected ${expectedUnknown}`);
    }
    assert(typeof result.result === 'number' && Number.isFinite(result.result), `${formulaId}: result not finite number`);
    return result.result;
}

function run() {
    ensureNodeDomShims();

    const root = path.join(__dirname, '..');
    loadScriptIntoGlobal(path.join(root, 'scripts', 'safeExpressionEvaluator.js'));
    loadScriptIntoGlobal(path.join(root, 'scripts', 'unitConverter.js'));
    loadScriptIntoGlobal(path.join(root, 'scripts', 'formulas.js'));
    loadScriptIntoGlobal(path.join(root, 'scripts', 'calculator.js'));

    const tests = [];

    // Purdue / generic astrophysics
    tests.push(() => {
        const actual = solveFormula('parallax_from_distance', { d: 70 }, 'p');
        assertApprox(actual, 1 / 70, 1e-6, 'parallax_from_distance (70 pc)');
    });

    tests.push(() => {
        const lambda = 400e-9;
        const wiens = getFormulaById('wiens_law');
        const b = (wiens.constants && typeof wiens.constants.b === 'number') ? wiens.constants.b : 2.898e-3;
        const expected = b / lambda;
        const actual = solveFormula('wiens_law', { λmax: lambda }, 'T');
        assertApprox(actual, expected, 1e-9 * expected, 'wiens_law (400 nm)');
    });

    tests.push(() => {
        const M = 1.988409870440e30; // IAU nominal solar mass (kg)
        const v1 = 9.4e4;
        const r1 = 4.7e10;
        const r2 = 6e12;
        const expected = Math.sqrt(v1 * v1 + 2 * 6.67430e-11 * M * (1 / r2 - 1 / r1));
        const actual = solveFormula('velocity_from_orbital_energy', { v1, r1, r2, M }, 'v2');
        assertApprox(actual, expected, 1e-2, 'velocity_from_orbital_energy (comet)');
    });

    // GGSO Section B numeric subparts
    tests.push(() => {
        const r = 6e6;
        const M = 5e30;
        const m = 8e24;
        const expected = r * Math.pow((2 * M) / m, 1 / 3);
        const actual = solveFormula('roche_limit_rigid', { r, M, m }, 'R');
        assertApprox(actual, expected, 1e-6 * expected, 'roche_limit_rigid (GGSO 1c)');
    });

    tests.push(() => {
        const M = 1e30;
        const R = 1e14;
        const mu = 1e-27;
        const k_B = 1.380649e-23;
        const expected = (6.67430e-11 * M * mu) / (5 * k_B * R);
        const actual = solveFormula('virial_temperature_gas', { M, R, mu }, 'T_vir');
        assertApprox(actual, expected, 1e-6 * expected, 'virial_temperature_gas (GGSO 4a)');
    });

    tests.push(() => {
        const M = 1e30;
        const R = 1e14;
        const expected = Math.sqrt((6.67430e-11 * M) / (5 * R));
        const actual = solveFormula('virial_velocity_dispersion', { M, R }, 'sigma_vir');
        assertApprox(actual, expected, 1e-6 * expected, 'virial_velocity_dispersion (GGSO 4b)');
    });

    tests.push(() => {
        const p = 0.02;
        const expected = 3.26 / p;
        const actual = solveFormula('parallax_to_light_years', { p }, 'd_ly');
        assertApprox(actual, expected, 1e-9 * expected, 'parallax_to_light_years (GGSO 3a)');
    });

    console.log('\n🧪 Exam Subparts Runner (Node)');
    console.log('='.repeat(72));
    let pass = 0;
    for (const t of tests) {
        t();
        pass++;
    }
    console.log(`✅ Passed ${pass}/${tests.length} calculation subparts`);
    console.log('='.repeat(72));
}

if (require.main === module) {
    try {
        run();
        process.exit(0);
    } catch (e) {
        console.error('❌ Exam subparts failed:');
        console.error(e && e.stack ? e.stack : e);
        process.exit(1);
    }
}

module.exports = { run };

