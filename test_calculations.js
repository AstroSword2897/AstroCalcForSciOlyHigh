// Test script to verify formula calculations
// Run this in browser console or use a simpler approach

console.log('Manual Calculation Verification Tests\n');
console.log('='.repeat(60));

// Test values
const G = 6.67430e-11; // Gravitational constant
const M_sun = 1.989e30; // Solar mass
const M_earth = 5.972e24; // Earth mass
const R_earth = 6.371e6; // Earth radius in meters
const AU = 1.496e11; // 1 AU in meters
const year_sec = 3.156e7; // 1 year in seconds

console.log('\n1. Kepler\'s Third Law: T² = (4π²/GM) × a³');
console.log('   Earth around Sun: T = 1 year, M = 1 M☉');
const T_earth = year_sec;
const a_calc = Math.cbrt((T_earth * T_earth * G * M_sun) / (4 * Math.PI * Math.PI));
const error1 = Math.abs(a_calc - AU) / AU * 100;
console.log(`   Calculated a: ${a_calc.toExponential(3)} m`);
console.log(`   Expected a: ${AU.toExponential(3)} m (1 AU)`);
console.log(`   Error: ${error1.toFixed(2)}% ${error1 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n2. Orbital Velocity: v = √(GM/r)');
console.log('   Earth: r = 1 AU, M = 1 M☉');
const v_orbital = Math.sqrt((G * M_sun) / AU);
const expected_v = 29780;
const error2 = Math.abs(v_orbital - expected_v) / expected_v * 100;
console.log(`   Calculated v: ${v_orbital.toFixed(0)} m/s`);
console.log(`   Expected v: ~${expected_v} m/s`);
console.log(`   Error: ${error2.toFixed(2)}% ${error2 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n3. Escape Velocity: v_esc = √(2GM/r)');
console.log('   Earth: r = 6371 km, M = 5.972e24 kg');
const v_escape = Math.sqrt((2 * G * M_earth) / R_earth);
const expected_escape = 11186;
const error3 = Math.abs(v_escape - expected_escape) / expected_escape * 100;
console.log(`   Calculated v_esc: ${v_escape.toFixed(0)} m/s`);
console.log(`   Expected v_esc: ~${expected_escape} m/s`);
console.log(`   Error: ${error3.toFixed(2)}% ${error3 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n4. Parallax Distance: d = 1 / p');
console.log('   Proxima Centauri: p = 0.7687 arcsec');
const p_prox = 0.7687;
const d_prox = 1 / p_prox;
const expected_prox = 1.301;
const error4 = Math.abs(d_prox - expected_prox) / expected_prox * 100;
console.log(`   Calculated d: ${d_prox.toFixed(3)} pc`);
console.log(`   Expected d: ~${expected_prox} pc`);
console.log(`   Error: ${error4.toFixed(2)}% ${error4 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n5. Surface Gravity: g = GM/r²');
console.log('   Earth: M = 5.972e24 kg, r = 6371 km');
const g_earth = (G * M_earth) / (R_earth * R_earth);
const expected_g = 9.81;
const error5 = Math.abs(g_earth - expected_g) / expected_g * 100;
console.log(`   Calculated g: ${g_earth.toFixed(2)} m/s²`);
console.log(`   Expected g: ${expected_g} m/s²`);
console.log(`   Error: ${error5.toFixed(2)}% ${error5 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n6. Distance Modulus: m - M = 5 log₁₀(d) - 5');
console.log('   Star at 10 pc: M = 5, d = 10 pc');
const M_star = 5;
const d_star = 10;
const m_star = M_star + 5 * Math.log10(d_star) - 5;
const expected_m = 5; // At 10 pc, m = M
const error6 = Math.abs(m_star - expected_m);
console.log(`   Calculated m: ${m_star.toFixed(2)}`);
console.log(`   Expected m: ${expected_m} (m = M at 10 pc)`);
console.log(`   Error: ${error6.toFixed(2)} ${error6 < 0.1 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n7. Average Density: ρ = 3M / (4πR³)');
console.log('   Earth: M = 5.972e24 kg, R = 6371 km');
const rho_earth = (3 * M_earth) / (4 * Math.PI * R_earth * R_earth * R_earth);
const expected_rho = 5514;
const error7 = Math.abs(rho_earth - expected_rho) / expected_rho * 100;
console.log(`   Calculated ρ: ${rho_earth.toFixed(0)} kg/m³`);
console.log(`   Expected ρ: ~${expected_rho} kg/m³`);
console.log(`   Error: ${error7.toFixed(2)}% ${error7 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n8. Rotational Velocity: v = (2πR) / P_rot');
console.log('   Earth: R = 6371 km, P_rot = 1 day');
const P_rot = 86400; // 1 day in seconds
const v_rot = (2 * Math.PI * R_earth) / P_rot;
const expected_rot = 463;
const error8 = Math.abs(v_rot - expected_rot) / expected_rot * 100;
console.log(`   Calculated v: ${v_rot.toFixed(0)} m/s`);
console.log(`   Expected v: ~${expected_rot} m/s`);
console.log(`   Error: ${error8.toFixed(2)}% ${error8 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n9. Wien\'s Law: λmax = b / T');
console.log('   Sun: T = 5778 K');
const b_wien = 2.898e-3; // Wien's constant
const T_sun = 5778;
const lambda_max = b_wien / T_sun;
const expected_wien = 5.01e-7;
const error9 = Math.abs(lambda_max - expected_wien) / expected_wien * 100;
console.log(`   Calculated λmax: ${(lambda_max * 1e9).toFixed(0)} nm`);
console.log(`   Expected λmax: ~${(expected_wien * 1e9).toFixed(0)} nm`);
console.log(`   Error: ${error9.toFixed(2)}% ${error9 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n10. Flux from Luminosity: F = L / (4πd²)');
console.log('   Sun at 1 AU: L = 3.828e26 W, d = 1 AU');
const L_sun = 3.828e26;
const F_sun = L_sun / (4 * Math.PI * AU * AU);
const expected_flux = 1361;
const error10 = Math.abs(F_sun - expected_flux) / expected_flux * 100;
console.log(`   Calculated F: ${F_sun.toFixed(0)} W/m²`);
console.log(`   Expected F: ~${expected_flux} W/m² (solar constant)`);
console.log(`   Error: ${error10.toFixed(2)}% ${error10 < 5 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n' + '='.repeat(60));
console.log('\nTest Summary:');
console.log('All basic formulas verified with known astronomical values.');
console.log('Errors should be < 5% for accurate calculations.');
