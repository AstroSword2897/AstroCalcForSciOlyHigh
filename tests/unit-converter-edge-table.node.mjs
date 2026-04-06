/**
 * Edge-case QA matrix: canonical → category → base unit → factor for 1 unit → base value.
 * Run: node tests/unit-converter-edge-table.node.mjs
 * Dump full matrix: DUMP_UNIT_TABLE=1 node tests/unit-converter-edge-table.node.mjs
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

const REL = 1e-9;
const assertClose = (name, got, exp, tol = REL) => {
    const ok =
        typeof got === 'number' &&
        typeof exp === 'number' &&
        Number.isFinite(got) &&
        Number.isFinite(exp) &&
        (exp === 0 ? Math.abs(got) < 1e-15 : Math.abs((got - exp) / exp) <= tol);
    if (!ok) {
        throw new Error(`${name}: expected ${exp}, got ${got}`);
    }
};

/** SI / IAU constants (must match scripts/unitConverter.js intent) */
const AU_M = 149597870700;
const PARSEC_M = AU_M * (648000 / Math.PI);
const LY_M = 299792458 * 365.25 * 86400;
const JULIAN_YR_S = 365.25 * 86400;
const M_SUN_KG = 1.98840987044e30;
const M_EARTH_KG = 5.9721684356e24;
const R_SUN_M = 695700000;
const KM_S_MPC_TO_HZ = 1000 / (1e6 * PARSEC_M);

// --- Reference table: representative inputs → expectations ---
const linearToBase = [
    // distance → m
    ['m', 'm', 1],
    ['km', 'm', 1000],
    ['cm', 'm', 0.01],
    ['mm', 'm', 0.001],
    ['μm', 'm', 1e-6],
    ['nm', 'm', 1e-9],
    ['Å', 'm', 1e-10],
    ['AU', 'm', AU_M],
    ['ly', 'm', LY_M],
    ['pc', 'm', PARSEC_M],
    ['Mpc', 'm', 1e6 * PARSEC_M],
    ['R☉', 'm', R_SUN_M],
    // mass → kg
    ['kg', 'kg', 1],
    ['g', 'kg', 0.001],
    ['M☉', 'kg', M_SUN_KG],
    ['M_earth', 'kg', M_EARTH_KG],
    // time → s
    ['s', 's', 1],
    ['min', 's', 60],
    ['h', 's', 3600],
    ['day', 's', 86400],
    ['yr', 's', JULIAN_YR_S],
    // velocity → m/s
    ['m/s', 'm/s', 1],
    ['km/s', 'm/s', 1000],
    ['km/h', 'm/s', 1000 / 3600],
    // angle → rad
    ['rad', 'rad', 1],
    ['deg', 'rad', Math.PI / 180],
    ['arcmin', 'rad', Math.PI / (180 * 60)],
    ['arcsec', 'rad', Math.PI / (180 * 3600)],
    // angular speed → rad/s
    ['rad/s', 'rad/s', 1],
    ['deg/s', 'rad/s', Math.PI / 180],
    // energy → J
    ['J', 'J', 1],
    ['erg', 'J', 1e-7],
    ['eV', 'J', 1.602176634e-19],
    // power → W
    ['W', 'W', 1],
    ['erg/s', 'W', 1e-7],
    ['L☉', 'W', 3.828e26],
    // density → kg/m³
    ['kg/m³', 'kg/m³', 1],
    ['g/cm³', 'kg/m³', 1000],
    // frequency → Hz
    ['Hz', 'Hz', 1],
    ['kHz', 'Hz', 1e3],
    ['MHz', 'Hz', 1e6],
    ['GHz', 'Hz', 1e9],
    ['km/(s·Mpc)', 'Hz', KM_S_MPC_TO_HZ],
    // angular momentum → J·s
    ['J·s', 'J·s', 1],
    ['erg·s', 'J·s', 1e-7],
    // acceleration → m/s²
    ['m/s²', 'm/s²', 1],
    ['cm/s²', 'm/s²', 0.01],
    // flux → W/m²
    ['W/m²', 'W/m²', 1],
    ['erg/(s·cm²)', 'W/m²', 0.001],
    // area → m²
    ['m²', 'm²', 1],
    ['km²', 'm²', 1e6],
    ['cm²', 'm²', 1e-4],
    // force → N
    ['N', 'N', 1],
    ['dyn', 'N', 1e-5],
    // pressure → Pa
    ['Pa', 'Pa', 1],
    ['J/m³', 'Pa', 1],
    // magnetic B → T
    ['T', 'T', 1],
    ['G', 'T', 1e-4]
];

for (const [from, base, expected] of linearToBase) {
    const got = UC.convert(1, from, base);
    assertClose(`convert(1, ${from} → ${base})`, got, expected, 1e-8);
}

// Temperature offsets (not multiplicative)
assertClose('0 °C → K', UC.convert(0, '°C', 'K'), 273.15);
assertClose('100 °C → K', UC.convert(100, '°C', 'K'), 373.15);
assertClose('32 °F → K', UC.convert(32, '°F', 'K'), 273.15);
assertClose('0 K → °C', UC.convert(0, 'K', '°C'), -273.15);

// Dimensionless / mag
assertClose('dimensionless', UC.convert(1, 'dimensionless', 'dimensionless'), 1);
assertClose('mag', UC.convert(1, 'mag', 'mag'), 1);

// Aliases → same factor as canonical
const aliasPairs = [
    ['meters', 'm'],
    ['parsecs', 'pc'],
    ['years', 'yr'],
    ['arcseconds', 'arcsec'],
    ['M_☉', 'M☉']
];
for (const [alias, canon] of aliasPairs) {
    const ca = UC.getCanonical(alias);
    const cb = UC.getCanonical(canon);
    if (ca !== cb) {
        throw new Error(`alias ${alias} → ${ca}, expected same as ${canon} → ${cb}`);
    }
}

// Incompatible categories → null (suppress expected converter warning)
const _warn = console.warn;
console.warn = () => {};
const bad = UC.convert(1, 'kg', 'm');
console.warn = _warn;
if (bad !== null) {
    throw new Error('expected null for kg → m');
}

// Grav G unit and σ unit: identity to self
assertClose('m³/(kg·s²)', UC.convert(1, 'm³/(kg·s²)', 'm³/(kg·s²)'), 1);
assertClose('W/(m²·K⁴)', UC.convert(1, 'W/(m²·K⁴)', 'W/(m²·K⁴)'), 1);

// --- Optional: print QA matrix for all registered canonical keys in unitCategory ---
if (process.env.DUMP_UNIT_TABLE === '1') {
    const rows = [];
    const seen = new Set();
    for (const canonical of Object.keys(UC.unitCategory)) {
        if (seen.has(canonical)) continue;
        seen.add(canonical);
        const cat = UC.unitCategory[canonical];
        const base = UC.baseUnit[cat];
        if (!base) continue;
        let factor = null;
        let note = 'linear';
        if (cat === 'temperature') {
            factor = UC.convert(1, canonical, base);
            note = canonical === 'K' ? 'identity' : 'offset (see convert)';
        } else {
            const c = UC.convert(1, canonical, base);
            factor = c;
        }
        rows.push({
            canonical,
            category: cat,
            base,
            factorOneToBase: factor,
            note
        });
    }
    rows.sort((a, b) => a.category.localeCompare(b.category) || a.canonical.localeCompare(b.canonical));
    console.log('canonical\tcategory\tbase\t1 unit → base\tnotes');
    for (const r of rows) {
        console.log(
            `${r.canonical}\t${r.category}\t${r.base}\t${r.factorOneToBase}\t${r.note}`
        );
    }
}

console.log('PASS unit-converter-edge-table (' + linearToBase.length + ' linear rows + temperature + aliases)');
