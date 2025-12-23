// Comprehensive manual search test - run in browser console

const testQuestions = [
    "temperature and wavelength",
    "how do I find distance using parallax",
    "Kepler's third law",
    "escape velocity",
    "black hole event horizon",
    "Hubble's law",
    "radial velocity",
    "Stefan-Boltzmann",
    "luminosity of a star",
    "orbital period",
    "transit depth",
    "angular resolution",
    "Doppler shift",
    "redshift",
    "Schwarzschild radius",
    "synodic period",
    "tidal force",
    "mass-luminosity relation",
    "distance modulus",
    "photon energy"
];

console.log('🧪 MANUAL SEARCH TEST - 20 QUESTIONS');
console.log('='.repeat(60));

testQuestions.forEach((q, i) => {
    console.log(`\n${i+1}. Question: "${q}"`);
    console.log(`   Paste this in search box and check results!`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Copy each question above and test in the search box');
console.log('✅ Expected: Top result should match the question intent');
console.log('✅ Confidence should be >80% for direct matches');
console.log('='.repeat(60));
