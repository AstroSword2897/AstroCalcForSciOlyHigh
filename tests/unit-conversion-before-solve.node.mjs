/**
 * Regression: AU vs m must convert to formula base (m) before values enter solve().
 * Run: node tests/unit-conversion-before-solve.node.mjs
 */
import { readFileSync } from 'fs';
import vm from 'vm';

const code =
    readFileSync(new URL('../scripts/unitConverter.js', import.meta.url), 'utf8') +
    '\n;globalThis.UnitConverter = UnitConverter;';
const ctx = { console, globalThis: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);
const UC = ctx.UnitConverter;

const AU_M = 149597870700;
const base = 'm';

const D_from_AU = UC.convertToBase(1, 'AU', base);
const D_from_m = UC.convertToBase(1, 'm', base);

if (Math.abs(D_from_AU - AU_M) > 1) {
    console.error('FAIL: 1 AU → m expected', AU_M, 'got', D_from_AU);
    process.exit(1);
}
if (D_from_m !== 1) {
    console.error('FAIL: 1 m → m expected 1, got', D_from_m);
    process.exit(1);
}

const theta = 0.01;
const d_AU = theta * D_from_AU;
const d_m = theta * D_from_m;
const ratio = d_AU / d_m;

if (Math.abs(ratio - AU_M) / AU_M > 1e-9) {
    console.error('FAIL: ratio d(AU)/d(m) should be', AU_M, 'got', ratio);
    process.exit(1);
}

const fiveG = UC.convertToBase(5, 'g', 'kg');
if (Math.abs(fiveG - 0.005) > 1e-15) {
    console.error('FAIL: 5 g → kg expected 0.005, got', fiveG);
    process.exit(1);
}

console.log('PASS unit-conversion-before-solve');
console.log('  1 AU →', D_from_AU, 'm');
console.log('  θ=0.01, D=1 AU → d =', d_AU, 'm');
console.log('  θ=0.01, D=1 m  → d =', d_m, 'm');
console.log('  5 g →', fiveG, 'kg');
