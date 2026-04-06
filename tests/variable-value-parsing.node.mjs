/**
 * Smoke test: parseVariableRawToFormulaBase (quick-calc / explorer path).
 * Run: node tests/variable-value-parsing.node.mjs
 */
import { readFileSync } from 'fs';
import vm from 'vm';

const root = new URL('../', import.meta.url);
const load = (ctx, rel) => {
    const code = readFileSync(new URL(rel, root), 'utf8');
    vm.runInContext(code, ctx);
};

const ctx = vm.createContext({ console });
load(ctx, 'scripts/unitConverter.js');
vm.runInContext('globalThis.UnitConverter = UnitConverter;', ctx);
load(ctx, 'scripts/unitParser.js');
vm.runInContext('globalThis.UnitParser = UnitParser;', ctx);
load(ctx, 'scripts/expressionParser.js');
vm.runInContext('globalThis.ExpressionParser = ExpressionParser;', ctx);
load(ctx, 'scripts/variableValueParsing.js');

const parse = ctx.parseVariableRawToFormulaBase;
if (typeof parse !== 'function') {
    console.error('FAIL: parseVariableRawToFormulaBase missing');
    process.exit(1);
}

const g5 = parse('5 g', { symbol: 'M', unit: 'kg' });
if (Math.abs(g5 - 0.005) > 1e-12) {
    console.error('FAIL: 5 g with base kg expected 0.005, got', g5);
    process.exit(1);
}

const plain5 = parse('5', { symbol: 'M', unit: 'kg' });
if (plain5 !== 5) {
    console.error('FAIL: plain 5 kg expected 5, got', plain5);
    process.exit(1);
}

const au = parse('1 AU', { symbol: 'D', unit: 'm' });
const AU_M = 149597870700;
if (Math.abs(au - AU_M) > 1) {
    console.error('FAIL: 1 AU → m expected', AU_M, 'got', au);
    process.exit(1);
}

const sci = parse('1e23', { symbol: 'N', unit: '' });
if (sci !== 1e23) {
    console.error('FAIL: 1e23 expected 1e23, got', sci);
    process.exit(1);
}

console.log('PASS variable-value-parsing (5 g → kg, 5 → kg, 1 AU → m, 1e23)');
