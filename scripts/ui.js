// User Interface Controller

let currentFormula = null;
let calculator = null;
let graphManager = null; // Graph manager for the Graph tab
let graphInterpretationManager = null; // Graph manager for the Graph Interpretation tab
let mainGraphManager = null; // Separate graph manager for main page Desmos tab
let mainDesmosCalculator = null; // Standalone Desmos calculator for main page

// Convert Unicode math symbols to LaTeX for MathJax rendering
function convertToLaTeX(text) {
    if (!text) return '';
    
    // Step 1: Handle numeric subscripts/superscripts in plain text (like M1, M2, P2, a3)
    // This handles cases where formulas use M1 instead of M₁
    // Match pattern: letter followed by number (but not if it's part of a larger number or variable name)
    text = text.replace(/([A-Za-z])(\d+)(?![a-zA-Z0-9_])/g, function(match, base, num) {
        // If it's a single digit, it's likely a subscript (M1 -> M_1)
        // If it's multiple digits or in certain contexts, it might be a superscript
        // For now, treat single digits as subscripts, multiple as potential superscripts
        if (num.length === 1) {
            return `${base}_${num}`;
        }
        // For multiple digits, check context - if followed by operations, might be superscript
        return match; // Keep as is, will be handled by other rules
    });
    
    // Step 2: Handle special variable names with Greek letters (do this first before general Greek replacement)
    // λmax -> λ_{max} (will be converted to \lambda_{\max} later)
    text = text.replace(/λmax/g, 'λ_{max}');
    text = text.replace(/λ_obs/g, 'λ_{obs}');
    text = text.replace(/λ_rest/g, 'λ_{rest}');
    
    // Step 3: Handle subscripts that are words (like P_rot, B_λ, M_sun, F_B, F_V)
    // Match pattern: letter_letters (e.g., P_rot, B_λ, M_sun, F_B, F_V)
    text = text.replace(/([A-Za-z])_([A-Za-z]+)/g, function(match, base, sub) {
        // If subscript is a single uppercase letter, just use it
        if (sub.length === 1 && sub === sub.toUpperCase()) {
            return `${base}_{${sub}}`;
        }
        // If subscript is a Greek letter symbol name, convert it
        if (sub === 'λ' || sub === 'lambda') return `${base}_{\\lambda}`;
        if (sub === 'σ' || sub === 'sigma') return `${base}_{\\sigma}`;
        if (sub === 'θ' || sub === 'theta') return `${base}_{\\theta}`;
        // Handle special subscript words
        if (sub === 'max') return `${base}_{\\max}`;
        if (sub === 'min') return `${base}_{\\min}`;
        if (sub === 'obs') return `${base}_{\\text{obs}}`;
        if (sub === 'rest') return `${base}_{\\text{rest}}`;
        if (sub === 'rot') return `${base}_{\\text{rot}}`;
        if (sub === 'sun') return `${base}_{\\sun}`;
        if (sub === 'star') return `${base}_{\\text{star}}`;
        if (sub === 'surface') return `${base}_{\\text{surface}}`;
        if (sub === 'eq') return `${base}_{\\text{eq}}`;
        if (sub === 'age') return `${base}_{\\text{age}}`;
        // Otherwise, wrap in text for multi-letter subscripts
        return `${base}_{\\text{${sub}}}`;
    });
    
    // Step 4: Handle numeric subscripts with Greek letters (like M₁, M₂)
    text = text.replace(/([A-Za-z])_([₀₁₂₃₄₅₆₇₈₉])/g, function(match, base, sub) {
        const subMap = {'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'};
        return `${base}_{${subMap[sub]}}`;
    });
    
    // Step 5: Replace Unicode symbols with LaTeX equivalents
    let latex = text
        // Square root: √(x) -> \sqrt{x}
        .replace(/√\(([^()]+)\)/g, '\\sqrt{$1}')
        .replace(/√\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g, '\\sqrt{$1}')
        .replace(/√([a-zA-Z0-9_]+)/g, '\\sqrt{$1}')
        // Cube root: ∛(x) -> \sqrt[3]{x}
        .replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}')
        .replace(/∛([a-zA-Z0-9_]+)/g, '\\sqrt[3]{$1}')
        // Multiplication: × -> \times (do this before Greek letters to avoid conflicts)
        .replace(/×/g, ' \\times ')
        // Division: ÷ -> \div
        .replace(/÷/g, ' \\div ')
        // Greek letters - handle spacing properly
        // IMPORTANT: Process Greek letters before superscripts to avoid conflicts
        // π followed by letter/number/superscript -> \pi with space
        .replace(/π([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\pi $1')
        .replace(/π/g, '\\pi')
        // σ followed by letter/superscript -> \sigma with space
        .replace(/σ([a-zA-Z²³⁴⁵⁶⁷⁸⁹_^])/g, '\\sigma $1')
        .replace(/σ/g, '\\sigma')
        // λ followed by letter/number/superscript -> \lambda with space (but not if it's λ_{...})
        .replace(/λ_\{/g, '\\lambda_{')  // Handle λ_{max} -> \lambda_{\max}
        .replace(/λ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\lambda $1')
        .replace(/λ/g, '\\lambda')
        // Other Greek letters - handle spacing
        .replace(/θ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\theta $1')
        .replace(/θ/g, '\\theta')
        .replace(/Δ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\Delta $1')
        .replace(/Δ/g, '\\Delta')
        .replace(/α([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\alpha $1')
        .replace(/α/g, '\\alpha')
        .replace(/β([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\beta $1')
        .replace(/β/g, '\\beta')
        .replace(/γ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\gamma $1')
        .replace(/γ/g, '\\gamma')
        .replace(/δ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\delta $1')
        .replace(/δ/g, '\\delta')
        .replace(/ε([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\epsilon $1')
        .replace(/ε/g, '\\epsilon')
        .replace(/φ([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\phi $1')
        .replace(/φ/g, '\\phi')
        .replace(/Ω([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\Omega $1')
        .replace(/Ω/g, '\\Omega')
        .replace(/ω([a-zA-Z0-9²³⁴⁵⁶⁷⁸⁹_^])/g, '\\omega $1')
        .replace(/ω/g, '\\omega')
        // Superscripts: ² -> ^2, ³ -> ^3, etc. (handle these after Greek letters)
        .replace(/²/g, '^2')
        .replace(/³/g, '^3')
        .replace(/⁴/g, '^4')
        .replace(/⁵/g, '^5')
        .replace(/⁶/g, '^6')
        .replace(/⁷/g, '^7')
        .replace(/⁸/g, '^8')
        .replace(/⁹/g, '^9')
        .replace(/¹/g, '^1')
        .replace(/⁰/g, '^0')
        // Handle numeric subscripts (already handled above, but keep for standalone)
        .replace(/₀/g, '_0')
        .replace(/₁/g, '_1')
        .replace(/₂/g, '_2')
        .replace(/₃/g, '_3')
        .replace(/₄/g, '_4')
        .replace(/₅/g, '_5')
        .replace(/₆/g, '_6')
        .replace(/₇/g, '_7')
        .replace(/₈/g, '_8')
        .replace(/₉/g, '_9')
        // Log functions: log₁₀ -> \log_{10}
        .replace(/log₁₀/g, '\\log_{10}')
        .replace(/log₁/g, '\\log_{1}')
        .replace(/log/g, '\\log')
        // Infinity
        .replace(/∞/g, '\\infty')
        // Plus/minus
        .replace(/±/g, '\\pm')
        // Approximately equal
        .replace(/≈/g, '\\approx')
        // Not equal
        .replace(/≠/g, '\\neq')
        // Less than or equal
        .replace(/≤/g, '\\leq')
        // Greater than or equal
        .replace(/≥/g, '\\geq')
        // Degrees
        .replace(/°/g, '^{\\circ}')
        // Proportional to
        .replace(/∝/g, '\\propto')
        // Handle decimal exponents: M^3.5 -> M^{3.5}
        .replace(/\^(\d+\.\d+)/g, '^{$1}')
        // Handle exponents after variables: T^4 -> T^{4} (if not already braced)
        .replace(/([a-zA-Z])\^(\d+)(?![^{])/g, '$1^{$2}')
        // Handle complex exponents: e^(...) -> e^{...}
        .replace(/e\^\(([^)]+)\)/g, 'e^{$1}')
        // Handle 10^(...) -> 10^{...}
        .replace(/10\^\(([^)]+)\)/g, '10^{$1}')
        // Handle fractions in parentheses: (a/b) -> \left(\frac{a}{b}\right)
        .replace(/\(([^()]+)\/([^()]+)\)/g, function(match, num, den) {
            // Don't convert if already has LaTeX commands
            if (num.includes('\\') || den.includes('\\')) return match;
            return `\\left(\\frac{${num}}{${den}}\\right)`;
        })
        // Handle simple fractions: a/b -> \frac{a}{b} (but not if in complex expression)
        .replace(/([a-zA-Z0-9_^]+)\/([a-zA-Z0-9_^]+)/g, function(match, num, den, offset, string) {
            // Skip if already in LaTeX command
            if (num.includes('\\') || den.includes('\\')) return match;
            // Skip if part of a larger fraction structure
            const before = string.substring(0, offset);
            const after = string.substring(offset + match.length);
            if (before.match(/\\frac|\\sqrt|\\log|\\times|\\div|\\left|\\right/) || 
                after.match(/\\frac|\\sqrt|\\log|\\times|\\div|\\left|\\right/)) {
                return match;
            }
            // Skip if in parentheses (handled above)
            if (before.includes('(') && after.includes(')')) return match;
            return `\\frac{${num}}{${den}}`;
        })
        // Fix spacing around operators
        .replace(/\s*=\s*/g, ' = ')
        .replace(/\s*\+\s*/g, ' + ')
        .replace(/\s*-\s*/g, ' - ')
        // Convert common subscript words to LaTeX commands
        .replace(/_\{max\}/g, '_{\\max}')
        .replace(/_\{min\}/g, '_{\\min}')
        .replace(/_\{sun\}/g, '_{\\sun}')
        // Handle spacing between Greek letters and variables (ensure proper spacing)
        // Fix cases where we have \pi R, \sigma T, \lambda k, etc.
        // Remove extra spaces but keep single space for readability
        .replace(/\\pi\s+([A-Z])/g, '\\pi $1')  // \pi R -> \pi R
        .replace(/\\sigma\s+([A-Z])/g, '\\sigma $1')  // \sigma T -> \sigma T
        .replace(/\\lambda\s+([a-z])/g, '\\lambda $1')  // \lambda k -> \lambda k
        // Clean up multiple spaces but preserve single spaces
        .replace(/\s{2,}/g, ' ')
        .trim();
    
    // Wrap in math delimiters if not already wrapped
    if (!latex.startsWith('$') && !latex.startsWith('\\(')) {
        return `\\(${latex}\\)`;
    }
    
    return latex;
}

// Render MathJax in an element
function renderMathJax(element) {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise([element]).catch(function (err) {
            console.warn('MathJax rendering error:', err);
        });
    } else {
        // Wait for MathJax to load
        if (typeof MathJax === 'undefined') {
            let attempts = 0;
            const maxAttempts = 20;
            const checkMathJax = setInterval(() => {
                attempts++;
                if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                    MathJax.typesetPromise([element]).catch(function (err) {
                        console.warn('MathJax rendering error:', err);
                    });
                    clearInterval(checkMathJax);
                } else if (attempts >= maxAttempts) {
                    console.warn('MathJax failed to load');
                    clearInterval(checkMathJax);
                }
            }, 100);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize semantic search system
    if (typeof semanticSearchSystem !== 'undefined') {
        semanticSearchSystem.initializeEmbeddings();
    }
    
    renderFormulaList();
    setupEventListeners();
    setupSearchFunctionality();
    
    // Add event delegation for formula cards as a backup
    const formulaList = document.getElementById('formula-list');
    if (formulaList) {
        formulaList.addEventListener('click', (e) => {
            const card = e.target.closest('.formula-card');
            if (card) {
                const formulaId = card.getAttribute('data-formula-id');
                if (formulaId) {
                    const formula = formulas.find(f => f.id === formulaId);
                    if (formula) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Card clicked via delegation:', formula.name);
                        selectFormula(formula);
                    }
                }
            }
        });
    }
});

// Contextual Semantic Matching & Dynamic Term Prioritization System
var semanticSearchSystem = {
    // Usage frequency tracking
    usageFrequency: {},
    
    // Synonym expansion dictionary
    synonymDictionary: {
        'cosmic inflation boundary': ['particle horizon', 'cosmic horizon', 'observable universe', 'event horizon'],
        'particle horizon': ['cosmic horizon', 'observable universe', 'cosmic inflation boundary', 'horizon distance'],
        'cosmic horizon': ['particle horizon', 'observable universe', 'event horizon', 'cosmic inflation boundary'],
        'observable universe': ['particle horizon', 'cosmic horizon', 'causal horizon'],
        'event horizon': ['black hole horizon', 'schwarzschild radius', 'cosmic horizon'],
        'black hole horizon': ['event horizon', 'schwarzschild radius'],
        'stellar brightness': ['luminosity', 'magnitude', 'flux', 'brightness'],
        'star brightness': ['luminosity', 'magnitude', 'stellar brightness', 'flux'],
        'orbital speed': ['orbital velocity', 'circular velocity', 'orbital motion'],
        'circular velocity': ['orbital velocity', 'orbital speed'],
        'escape speed': ['escape velocity', 'breakaway velocity'],
        'gravitational acceleration': ['surface gravity', 'gravity', 'g'],
        'surface g': ['surface gravity', 'gravitational acceleration'],
        'distance measurement': ['parallax', 'distance modulus', 'luminosity distance'],
        'stellar distance': ['parallax distance', 'distance modulus', 'stellar parallax'],
        'cosmic expansion': ['hubble law', 'hubble constant', 'redshift', 'cosmic redshift'],
        'universe expansion': ['hubble law', 'cosmic expansion', 'big bang'],
        'stellar temperature': ['effective temperature', 'surface temperature', 'color temperature'],
        'star temperature': ['effective temperature', 'stellar temperature', 'surface temperature'],
        'orbital time': ['orbital period', 'revolution period', 'period'],
        'revolution time': ['orbital period', 'orbital time', 'period'],
        'telescope resolution': ['angular resolution', 'resolving power', 'diffraction limit'],
        'resolving power': ['angular resolution', 'telescope resolution', 'rayleigh criterion'],
        'light collection': ['light gathering power', 'aperture', 'telescope aperture'],
        'telescope aperture': ['light gathering power', 'light collection', 'aperture'],
        'doppler effect': ['doppler shift', 'redshift', 'radial velocity'],
        'redshift effect': ['doppler shift', 'cosmic redshift', 'redshift'],
        'stellar mass': ['mass', 'solar mass', 'planetary mass'],
        'planetary mass': ['mass', 'stellar mass', 'jupiter mass'],
        'orbital mechanics': ['kepler', 'kepler third law', 'orbital motion', 'celestial mechanics'],
        'celestial mechanics': ['orbital mechanics', 'kepler', 'planetary motion'],
        'blackbody spectrum': ['blackbody radiation', 'thermal radiation', 'stefan-boltzmann'],
        'thermal radiation': ['blackbody radiation', 'blackbody spectrum', 'stefan-boltzmann'],
        'stellar evolution': ['star evolution', 'stellar life cycle', 'main sequence'],
        'star evolution': ['stellar evolution', 'stellar life cycle'],
        'binary star system': ['binary', 'binary star', 'double star'],
        'double star': ['binary', 'binary star system', 'binary star'],
        'exoplanet detection': ['transit method', 'radial velocity method', 'exoplanet'],
        'planet detection': ['exoplanet detection', 'transit method', 'radial velocity method'],
        'stellar classification': ['spectral type', 'hr diagram', 'mk classification', 'luminosity class'],
        'spectral type': ['stellar classification', 'mk type', 'spectral classification'],
        'hr diagram': ['hertzsprung russell', 'color magnitude diagram', 'hr', 'stellar classification'],
        'color magnitude diagram': ['hr diagram', 'cm diagram', 'color magnitude'],
        'mass luminosity': ['mass luminosity relation', 'stellar mass luminosity', 'luminosity mass'],
        'stellar mass luminosity': ['mass luminosity relation', 'mass luminosity'],
        'distance ladder': ['cosmic distance ladder', 'distance scale', 'standard candle', 'standard ruler'],
        'cosmic distance ladder': ['distance ladder', 'distance scale', 'standard candle'],
        'standard candle': ['distance ladder', 'calibrated candle', 'distance indicator'],
        'standard ruler': ['distance ladder', 'geometric distance', 'distance indicator'],
        'parallax distance': ['trigonometric parallax', 'stellar parallax', 'parallax', 'geometric parallax'],
        'trigonometric parallax': ['parallax distance', 'parallax', 'geometric parallax'],
        'stellar parallax': ['parallax distance', 'trigonometric parallax', 'parallax'],
        'magnitude brightness': ['magnitude', 'apparent magnitude', 'absolute magnitude', 'brightness'],
        'stellar brightness': ['magnitude', 'luminosity', 'brightness', 'flux'],
        'flux brightness': ['flux', 'brightness', 'luminosity', 'magnitude'],
        'blackbody temperature': ['effective temperature', 'color temperature', 'brightness temperature'],
        'color temperature': ['blackbody temperature', 'effective temperature', 'brightness temperature'],
        'brightness temperature': ['color temperature', 'blackbody temperature', 'radio temperature'],
        'orbital motion': ['orbital mechanics', 'celestial mechanics', 'kepler', 'orbital dynamics'],
        'celestial mechanics': ['orbital mechanics', 'orbital motion', 'kepler'],
        'orbital dynamics': ['orbital mechanics', 'orbital motion', 'celestial mechanics'],
        'gravitational field': ['gravity', 'gravitational force', 'surface gravity', 'gravitational acceleration'],
        'gravitational force': ['gravity', 'gravitational field', 'surface gravity'],
        'tidal effects': ['tidal force', 'tidal locking', 'roche limit', 'hill radius'],
        'tidal locking': ['tidal effects', 'synchronous rotation', 'tidal synchronization'],
        'synchronous rotation': ['tidal locking', 'tidal synchronization'],
        'stellar radius': ['radius', 'stellar size', 'photospheric radius', 'star radius'],
        'star radius': ['stellar radius', 'radius', 'photospheric radius'],
        'photospheric radius': ['stellar radius', 'star radius', 'radius'],
        'stellar mass': ['mass', 'solar mass', 'stellar mass', 'star mass'],
        'star mass': ['stellar mass', 'mass', 'solar mass'],
        'planetary mass': ['mass', 'jupiter mass', 'earth mass', 'planet mass'],
        'planet mass': ['planetary mass', 'mass', 'jupiter mass'],
        'orbital separation': ['semi-major axis', 'orbital distance', 'orbital radius', 'a'],
        'orbital distance': ['semi-major axis', 'orbital separation', 'orbital radius'],
        'orbital radius': ['semi-major axis', 'orbital separation', 'orbital distance'],
        'revolution period': ['orbital period', 'period', 'orbital time', 'revolution time'],
        'orbital time': ['orbital period', 'revolution period', 'period'],
        'rotational period': ['rotation period', 'spin period', 'rotational time'],
        'rotation period': ['rotational period', 'spin period'],
        'spin period': ['rotational period', 'rotation period'],
        'angular resolution': ['resolving power', 'telescope resolution', 'diffraction limit', 'rayleigh criterion'],
        'resolving power': ['angular resolution', 'telescope resolution', 'rayleigh criterion'],
        'diffraction limit': ['angular resolution', 'resolving power', 'airy disk'],
        'light gathering': ['light gathering power', 'aperture', 'telescope aperture', 'light collection'],
        'telescope aperture': ['light gathering power', 'aperture', 'light gathering'],
        'aperture': ['light gathering power', 'telescope aperture', 'light gathering'],
        'doppler shift': ['doppler effect', 'redshift', 'radial velocity', 'doppler'],
        'redshift': ['doppler shift', 'cosmic redshift', 'z', 'redshift effect'],
        'cosmic redshift': ['redshift', 'hubble redshift', 'cosmological redshift'],
        'hubble redshift': ['cosmic redshift', 'redshift', 'cosmological redshift'],
        'cosmological redshift': ['cosmic redshift', 'hubble redshift', 'redshift'],
        'hubble expansion': ['hubble law', 'cosmic expansion', 'universe expansion', 'hubble constant'],
        'universe expansion': ['hubble expansion', 'cosmic expansion', 'hubble law'],
        'big bang': ['big bang theory', 'cosmology', 'universe expansion', 'cosmic expansion'],
        'big bang theory': ['big bang', 'cosmology', 'universe expansion'],
        'stellar lifetime': ['stellar age', 'star lifetime', 'main sequence lifetime', 'stellar age'],
        'star lifetime': ['stellar lifetime', 'stellar age', 'main sequence lifetime'],
        'main sequence lifetime': ['stellar lifetime', 'star lifetime', 'stellar age'],
        'white dwarf mass': ['chandrasekhar limit', 'white dwarf', 'compact object mass'],
        'compact object mass': ['white dwarf mass', 'chandrasekhar limit', 'neutron star mass'],
        'neutron star mass': ['compact object mass', 'tov limit', 'neutron star'],
        'black hole mass': ['schwarzschild radius', 'event horizon', 'black hole'],
        'event horizon radius': ['schwarzschild radius', 'event horizon', 'black hole horizon'],
        'black hole horizon': ['event horizon', 'schwarzschild radius', 'event horizon radius'],
        'gravitational lensing': ['einstein radius', 'lensing', 'einstein ring', 'microlensing'],
        'lensing': ['gravitational lensing', 'einstein radius', 'microlensing'],
        'einstein ring': ['einstein radius', 'gravitational lensing', 'lensing'],
        'microlensing': ['gravitational lensing', 'lensing', 'einstein radius'],
        'synchrotron radiation': ['synchrotron', 'synchrotron power', 'synchrotron emission'],
        'synchrotron emission': ['synchrotron radiation', 'synchrotron', 'synchrotron power'],
        'magnetic field energy': ['magnetic energy density', 'magnetic field', 'b field'],
        'magnetic energy density': ['magnetic field energy', 'magnetic field', 'b field'],
        'b field': ['magnetic field', 'magnetic energy density', 'magnetic field energy'],
        'power law': ['power law spectrum', 'spectral index', 'power law distribution'],
        'power law spectrum': ['power law', 'spectral index', 'power law distribution'],
        'spectral index': ['power law', 'power law spectrum', 'alpha'],
        'gamma ray energy': ['gamma ray', 'max gamma', 'gamma', 'high energy'],
        'max gamma': ['gamma ray energy', 'gamma ray', 'gamma', 'maximum gamma'],
        'cooling break': ['cooling break frequency', 'cooling break gamma', 'synchrotron cooling'],
        'cooling break frequency': ['cooling break', 'synchrotron cooling', 'cooling'],
        'synchrotron cooling': ['cooling break', 'cooling break frequency', 'synchrotron cooling timescale'],
        'equivalent width': ['line strength', 'absorption line', 'emission line', 'spectral line'],
        'line strength': ['equivalent width', 'absorption line', 'emission line'],
        'absorption line': ['equivalent width', 'line strength', 'spectral line'],
        'emission line': ['equivalent width', 'line strength', 'spectral line'],
        'spectral line': ['equivalent width', 'absorption line', 'emission line'],
        'radial velocity': ['doppler shift', 'radial velocity method', 'rv', 'doppler'],
        'rv': ['radial velocity', 'doppler shift', 'radial velocity method'],
        'radial velocity method': ['radial velocity', 'rv method', 'doppler method'],
        'transit method': ['transit photometry', 'exoplanet detection', 'transit', 'planet detection'],
        'transit photometry': ['transit method', 'transit', 'exoplanet detection'],
        'transit': ['transit method', 'transit photometry', 'exoplanet detection'],
        'planetary temperature': ['planetary equilibrium temperature', 'planet temperature', 'exoplanet temperature'],
        'planet temperature': ['planetary temperature', 'planetary equilibrium temperature', 'exoplanet temperature'],
        'exoplanet temperature': ['planetary temperature', 'planet temperature', 'planetary equilibrium temperature'],
        'albedo': ['reflectivity', 'planetary albedo', 'surface albedo'],
        'reflectivity': ['albedo', 'planetary albedo', 'surface albedo'],
        'planetary albedo': ['albedo', 'reflectivity', 'surface albedo'],
        'greenhouse effect': ['greenhouse', 'atmospheric greenhouse', 'planetary greenhouse'],
        'greenhouse': ['greenhouse effect', 'atmospheric greenhouse', 'planetary greenhouse'],
        'atmospheric greenhouse': ['greenhouse effect', 'greenhouse', 'planetary greenhouse'],
        'hydrostatic equilibrium': ['hydrostatic balance', 'pressure balance', 'stellar structure'],
        'hydrostatic balance': ['hydrostatic equilibrium', 'pressure balance', 'stellar structure'],
        'pressure balance': ['hydrostatic equilibrium', 'hydrostatic balance', 'stellar structure'],
        'stellar structure': ['hydrostatic equilibrium', 'hydrostatic balance', 'stellar interior'],
        'stellar interior': ['stellar structure', 'hydrostatic equilibrium', 'stellar physics'],
        'critical density': ['density parameter', 'omega', 'cosmic density', 'friedmann'],
        'density parameter': ['critical density', 'omega', 'cosmic density'],
        'omega': ['density parameter', 'critical density', 'cosmic density'],
        'cosmic density': ['critical density', 'density parameter', 'omega'],
        'friedmann equation': ['friedmann', 'cosmology', 'friedmann robertson walker', 'frw'],
        'friedmann': ['friedmann equation', 'cosmology', 'friedmann robertson walker'],
        'friedmann robertson walker': ['friedmann equation', 'friedmann', 'frw', 'cosmology'],
        'frw': ['friedmann robertson walker', 'friedmann equation', 'friedmann'],
        'lookback time': ['cosmic time', 'light travel time', 'cosmic age', 'universe age'],
        'cosmic time': ['lookback time', 'light travel time', 'cosmic age'],
        'light travel time': ['lookback time', 'cosmic time', 'light travel distance'],
        'cosmic age': ['lookback time', 'cosmic time', 'universe age'],
        'universe age': ['cosmic age', 'lookback time', 'cosmic time'],
        'luminosity distance': ['flux distance', 'cosmic distance', 'dl', 'distance'],
        'flux distance': ['luminosity distance', 'cosmic distance', 'distance'],
        'angular diameter distance': ['size distance', 'angular distance', 'da', 'distance'],
        'size distance': ['angular diameter distance', 'angular distance', 'distance'],
        'angular distance': ['angular diameter distance', 'size distance', 'distance'],
        'time dilation': ['relativistic time', 'special relativity', 'general relativity'],
        'relativistic time': ['time dilation', 'special relativity', 'general relativity'],
        'length contraction': ['relativistic length', 'special relativity', 'lorentz contraction'],
        'relativistic length': ['length contraction', 'special relativity', 'lorentz contraction'],
        'lorentz contraction': ['length contraction', 'relativistic length', 'special relativity'],
        'binary system': ['binary', 'binary star', 'double star', 'binary star system'],
        'binary star': ['binary system', 'binary', 'double star'],
        'double star': ['binary system', 'binary star', 'binary'],
        'center of mass': ['barycenter', 'cm', 'center of mass', 'mass center'],
        'barycenter': ['center of mass', 'cm', 'mass center'],
        'mass center': ['center of mass', 'barycenter', 'cm'],
        'orbital energy': ['vis viva', 'total energy', 'mechanical energy', 'orbital mechanics'],
        'vis viva': ['orbital energy', 'total energy', 'mechanical energy'],
        'total energy': ['orbital energy', 'vis viva', 'mechanical energy'],
        'mechanical energy': ['orbital energy', 'vis viva', 'total energy'],
        'angular momentum': ['orbital angular momentum', 'rotational angular momentum', 'l'],
        'orbital angular momentum': ['angular momentum', 'rotational angular momentum', 'l'],
        'rotational angular momentum': ['angular momentum', 'orbital angular momentum', 'l'],
        'tidal force': ['tidal effects', 'tidal acceleration', 'tidal distortion'],
        'tidal acceleration': ['tidal force', 'tidal effects', 'tidal distortion'],
        'tidal distortion': ['tidal force', 'tidal acceleration', 'tidal effects'],
        'roche limit': ['roche lobe', 'tidal disruption', 'tidal radius'],
        'roche lobe': ['roche limit', 'tidal disruption', 'tidal radius'],
        'tidal disruption': ['roche limit', 'roche lobe', 'tidal radius'],
        'tidal radius': ['roche limit', 'roche lobe', 'tidal disruption'],
        'hill radius': ['hill sphere', 'gravitational sphere', 'roche sphere'],
        'hill sphere': ['hill radius', 'gravitational sphere', 'roche sphere'],
        'gravitational sphere': ['hill radius', 'hill sphere', 'roche sphere'],
        'roche sphere': ['hill radius', 'hill sphere', 'gravitational sphere'],
        'synodic period': ['apparent period', 'relative period', 'synodic'],
        'apparent period': ['synodic period', 'relative period', 'synodic'],
        'relative period': ['synodic period', 'apparent period', 'synodic'],
        'jeans mass': ['gravitational collapse', 'collapse mass', 'instability mass'],
        'gravitational collapse': ['jeans mass', 'collapse mass', 'instability mass'],
        'collapse mass': ['jeans mass', 'gravitational collapse', 'instability mass'],
        'instability mass': ['jeans mass', 'gravitational collapse', 'collapse mass'],
        'chandrasekhar limit': ['white dwarf limit', 'wd limit', 'chandrasekhar', 'compact object limit'],
        'white dwarf limit': ['chandrasekhar limit', 'wd limit', 'chandrasekhar'],
        'wd limit': ['chandrasekhar limit', 'white dwarf limit', 'chandrasekhar'],
        'chandrasekhar': ['chandrasekhar limit', 'white dwarf limit', 'wd limit'],
        'compact object limit': ['chandrasekhar limit', 'white dwarf limit', 'tov limit'],
        'tov limit': ['compact object limit', 'neutron star limit', 'tov'],
        'neutron star limit': ['tov limit', 'compact object limit', 'tov'],
        'tov': ['tov limit', 'neutron star limit', 'compact object limit'],
        'white dwarf radius': ['white dwarf mass radius', 'wd radius', 'white dwarf size'],
        'wd radius': ['white dwarf radius', 'white dwarf mass radius', 'white dwarf size'],
        'white dwarf size': ['white dwarf radius', 'wd radius', 'white dwarf mass radius'],
        'binary white dwarf': ['wd binary', 'white dwarf binary', 'double white dwarf'],
        'wd binary': ['binary white dwarf', 'white dwarf binary', 'double white dwarf'],
        'white dwarf binary': ['binary white dwarf', 'wd binary', 'double white dwarf'],
        'double white dwarf': ['binary white dwarf', 'wd binary', 'white dwarf binary'],
        'orbital decay': ['white dwarf orbital decay', 'binary decay', 'orbital shrinking'],
        'binary decay': ['orbital decay', 'white dwarf orbital decay', 'orbital shrinking'],
        'orbital shrinking': ['orbital decay', 'binary decay', 'white dwarf orbital decay'],
        'merger timescale': ['white dwarf merger timescale', 'merger time', 'coalescence time'],
        'merger time': ['merger timescale', 'white dwarf merger timescale', 'coalescence time'],
        'coalescence time': ['merger timescale', 'merger time', 'white dwarf merger timescale'],
        'planck relation': ['photon energy', 'planck', 'e hf', 'e hc lambda'],
        'photon energy': ['planck relation', 'planck', 'e hf', 'e hc lambda'],
        'planck': ['planck relation', 'photon energy', 'e hf'],
        'e hf': ['planck relation', 'photon energy', 'planck'],
        'e hc lambda': ['planck relation', 'photon energy', 'planck'],
        'wien law': ['wien displacement', 'wien', 'peak wavelength', 'temperature wavelength'],
        'wien displacement': ['wien law', 'wien', 'peak wavelength'],
        'wien': ['wien law', 'wien displacement', 'peak wavelength'],
        'peak wavelength': ['wien law', 'wien displacement', 'wien'],
        'temperature wavelength': ['wien law', 'wien displacement', 'peak wavelength'],
        'blackbody radiation': ['stefan boltzmann', 'thermal radiation', 'blackbody', 'blackbody spectrum'],
        'stefan boltzmann': ['blackbody radiation', 'thermal radiation', 'stefan boltzmann law'],
        'stefan boltzmann law': ['stefan boltzmann', 'blackbody radiation', 'thermal radiation'],
        'thermal radiation': ['blackbody radiation', 'stefan boltzmann', 'blackbody'],
        'blackbody': ['blackbody radiation', 'thermal radiation', 'stefan boltzmann'],
        'blackbody spectrum': ['blackbody radiation', 'thermal radiation', 'blackbody'],
        'flux temperature': ['stefan boltzmann', 'blackbody flux', 'thermal flux'],
        'blackbody flux': ['flux temperature', 'stefan boltzmann', 'thermal flux'],
        'thermal flux': ['flux temperature', 'blackbody flux', 'stefan boltzmann'],
        'flux luminosity': ['flux from luminosity', 'luminosity flux', 'inverse square'],
        'luminosity flux': ['flux luminosity', 'flux from luminosity', 'inverse square'],
        'inverse square': ['flux from luminosity', 'flux luminosity', 'inverse square law'],
        'inverse square law': ['inverse square', 'flux from luminosity', 'flux luminosity'],
        'inverse square law brightness': ['inverse square', 'inverse square law', 'flux from luminosity'],
        'magnitude flux': ['magnitude flux relation', 'magnitude brightness', 'flux magnitude'],
        'flux magnitude': ['magnitude flux', 'magnitude flux relation', 'magnitude brightness'],
        'magnitude brightness': ['magnitude flux', 'flux magnitude', 'magnitude flux relation'],
        'hr color index': ['color index', 'b v', 'color magnitude', 'hr diagram'],
        'color index': ['hr color index', 'b v', 'color magnitude'],
        'b v': ['hr color index', 'color index', 'color magnitude'],
        'color magnitude': ['hr color index', 'color index', 'b v'],
        'hr absolute magnitude': ['absolute magnitude', 'hr magnitude', 'stellar absolute magnitude'],
        'hr magnitude': ['hr absolute magnitude', 'absolute magnitude', 'stellar absolute magnitude'],
        'stellar absolute magnitude': ['hr absolute magnitude', 'hr magnitude', 'absolute magnitude'],
        'mass luminosity relation': ['mass luminosity', 'stellar mass luminosity', 'luminosity mass'],
        'stellar mass luminosity': ['mass luminosity relation', 'mass luminosity', 'luminosity mass'],
        'luminosity mass': ['mass luminosity relation', 'mass luminosity', 'stellar mass luminosity'],
        'stellar lifetime': ['stellar age', 'star lifetime', 'main sequence lifetime', 'stellar timescale'],
        'stellar age': ['stellar lifetime', 'star lifetime', 'main sequence lifetime'],
        'stellar timescale': ['stellar lifetime', 'stellar age', 'main sequence lifetime'],
        'synchrotron cooling timescale': ['synchrotron cooling', 'cooling time', 'synchrotron timescale'],
        'cooling time': ['synchrotron cooling timescale', 'synchrotron cooling', 'synchrotron timescale'],
        'synchrotron timescale': ['synchrotron cooling timescale', 'cooling time', 'synchrotron cooling'],
        'tidal locking timescale': ['tidal locking time', 'synchronization time', 'tidal timescale'],
        'tidal locking time': ['tidal locking timescale', 'synchronization time', 'tidal timescale'],
        'synchronization time': ['tidal locking timescale', 'tidal locking time', 'tidal timescale'],
        'tidal timescale': ['tidal locking timescale', 'tidal locking time', 'synchronization time'],
        'angular momentum elliptical': ['elliptical angular momentum', 'orbital angular momentum', 'angular momentum'],
        'elliptical angular momentum': ['angular momentum elliptical', 'orbital angular momentum', 'angular momentum'],
        'orbital angular momentum': ['angular momentum elliptical', 'elliptical angular momentum', 'angular momentum'],
        'cosmic redshift': ['hubble redshift', 'cosmological redshift', 'redshift', 'z'],
        'hubble redshift': ['cosmic redshift', 'cosmological redshift', 'redshift'],
        'cosmological redshift': ['cosmic redshift', 'hubble redshift', 'redshift'],
        'z': ['cosmic redshift', 'hubble redshift', 'cosmological redshift', 'redshift'],
        'lookback time': ['cosmic time', 'light travel time', 'cosmic age', 'universe age'],
        'cosmic time': ['lookback time', 'light travel time', 'cosmic age'],
        'light travel time': ['lookback time', 'cosmic time', 'light travel distance'],
        'cosmic age': ['lookback time', 'cosmic time', 'universe age'],
        'universe age': ['cosmic age', 'lookback time', 'cosmic time'],
        'density parameter': ['omega', 'critical density', 'cosmic density', 'friedmann'],
        'omega': ['density parameter', 'critical density', 'cosmic density'],
        'critical density': ['density parameter', 'omega', 'cosmic density'],
        'cosmic density': ['critical density', 'density parameter', 'omega'],
        'angular diameter distance': ['size distance', 'angular distance', 'da', 'distance'],
        'size distance': ['angular diameter distance', 'angular distance', 'distance'],
        'angular distance': ['angular diameter distance', 'size distance', 'distance'],
        'luminosity distance': ['flux distance', 'cosmic distance', 'dl', 'distance'],
        'flux distance': ['luminosity distance', 'cosmic distance', 'distance'],
        'cosmic distance': ['luminosity distance', 'flux distance', 'distance'],
        'einstein radius': ['gravitational lensing', 'lensing', 'einstein ring', 'microlensing'],
        'gravitational lensing': ['einstein radius', 'lensing', 'einstein ring'],
        'lensing': ['einstein radius', 'gravitational lensing', 'microlensing'],
        'einstein ring': ['einstein radius', 'gravitational lensing', 'lensing'],
        'microlensing': ['einstein radius', 'gravitational lensing', 'lensing'],
        'luminosity function': ['luminosity distribution', 'stellar luminosity function', 'luminosity'],
        'luminosity distribution': ['luminosity function', 'stellar luminosity function', 'luminosity'],
        'stellar luminosity function': ['luminosity function', 'luminosity distribution', 'luminosity']
    },
    
    // Lightweight word embeddings (concept vectors)
    conceptEmbeddings: {},
    
    // Initialize embeddings from concepts
    initializeEmbeddings: function() {
        // Build concept vectors from formula concepts and keywords
        const allConcepts = new Set();
        
        formulas.forEach(formula => {
            if (formula.concepts) {
                formula.concepts.forEach(c => allConcepts.add(c.toLowerCase()));
            }
            if (formula.keywords) {
                formula.keywords.forEach(k => allConcepts.add(k.toLowerCase()));
            }
        });
        
        // Create simple TF-IDF-like vectors for each concept
        Array.from(allConcepts).forEach(concept => {
            const words = concept.split(/\s+/);
            const vector = {};
            words.forEach(word => {
                vector[word] = 1;
            });
            this.conceptEmbeddings[concept] = vector;
        });
    },
    
    // Calculate cosine similarity between two concept vectors
    cosineSimilarity: function(vec1, vec2) {
        const keys1 = Object.keys(vec1);
        const keys2 = Object.keys(vec2);
        const allKeys = new Set([...keys1, ...keys2]);
        
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        allKeys.forEach(key => {
            const val1 = vec1[key] || 0;
            const val2 = vec2[key] || 0;
            dotProduct += val1 * val2;
            norm1 += val1 * val1;
            norm2 += val2 * val2;
        });
        
        if (norm1 === 0 || norm2 === 0) return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    },
    
    // Expand query with synonyms
    expandWithSynonyms: function(query) {
        const queryLower = query.toLowerCase();
        const expanded = new Set([queryLower]);
        
        // Direct synonym lookup
        if (this.synonymDictionary[queryLower]) {
            this.synonymDictionary[queryLower].forEach(syn => expanded.add(syn.toLowerCase()));
        }
        
        // Partial match synonyms
        Object.keys(this.synonymDictionary).forEach(key => {
            if (queryLower.includes(key) || key.includes(queryLower)) {
                this.synonymDictionary[key].forEach(syn => expanded.add(syn.toLowerCase()));
            }
        });
        
        // Semantic similarity expansion
        Object.keys(this.conceptEmbeddings).forEach(concept => {
            const queryVector = this.buildQueryVector(queryLower);
            const conceptVector = this.conceptEmbeddings[concept];
            const similarity = this.cosineSimilarity(queryVector, conceptVector);
            
            if (similarity > 0.3) { // Threshold for semantic similarity
                expanded.add(concept);
            }
        });
        
        return Array.from(expanded);
    },
    
    // Build vector for query
    buildQueryVector: function(query) {
        const words = query.split(/\s+/);
        const vector = {};
        words.forEach(word => {
            vector[word] = 1;
        });
        return vector;
    },
    
    // Track search term usage
    trackUsage: function(term) {
        const termLower = term.toLowerCase();
        
        if (!this.usageFrequency[termLower]) {
            this.usageFrequency[termLower] = 0;
        }
        this.usageFrequency[termLower]++;
    },
    
    // Get usage frequency weight
    getFrequencyWeight: function(term) {
        const termLower = term.toLowerCase();
        const frequency = this.usageFrequency[termLower] || 0;
        
        // Logarithmic scaling to prevent over-weighting
        return Math.log10(frequency + 1) * 10;
    },
    
    // Get dynamic weight (frequency-based only)
    getDynamicWeight: function(term) {
        return this.getFrequencyWeight(term);
    },
    
    // Contextual semantic matching
    semanticMatch: function(query, formula) {
        let score = 0;
        const queryLower = query.toLowerCase();
        
        // Expand query with synonyms
        const expandedQuery = this.expandWithSynonyms(queryLower);
        
        // Check formula concepts against expanded query
        if (formula.concepts) {
            formula.concepts.forEach(concept => {
                const conceptLower = concept.toLowerCase();
                
                // Exact match
                if (expandedQuery.includes(conceptLower)) {
                    score += 200;
                } else {
                    // Semantic similarity
                    const queryVector = this.buildQueryVector(queryLower);
                    const conceptVector = this.conceptEmbeddings[conceptLower];
                    
                    if (conceptVector) {
                        const similarity = this.cosineSimilarity(queryVector, conceptVector);
                        if (similarity > 0.4) {
                            score += similarity * 150; // Weighted by similarity
                        }
                    }
                }
            });
        }
        
        // Check formula keywords
        if (formula.keywords) {
            formula.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                
                if (expandedQuery.includes(keywordLower)) {
                    score += 100;
                } else {
                    const queryVector = this.buildQueryVector(queryLower);
                    const keywordVector = this.conceptEmbeddings[keywordLower];
                    
                    if (keywordVector) {
                        const similarity = this.cosineSimilarity(queryVector, keywordVector);
                        if (similarity > 0.4) {
                            score += similarity * 80;
                        }
                    }
                }
            });
        }
        
        // Check description with semantic matching
        const descLower = formula.description.toLowerCase();
        expandedQuery.forEach(expandedTerm => {
            if (descLower.includes(expandedTerm)) {
                score += 80;
            }
        });
        
        return score;
    }
};

// Initialize semantic search system
if (typeof formulas !== 'undefined' && formulas.length > 0) {
    semanticSearchSystem.initializeEmbeddings();
}

// Setup search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('formula-search');
    const clearBtn = document.getElementById('clear-search');
    
    if (!searchInput || !clearBtn) return;
    
    // Store original formulas for filtering
    let allFormulas = [...formulas];
    
    // Debounce search for better performance
    let searchTimeout = null;
    
    // Search input handler
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        
        // Show/hide clear button
        if (searchTerm.length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }
        
        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterAndRenderFormulas(searchTerm);
        }, 150);
    });
    
    // Clear button handler
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        filterAndRenderFormulas('');
        searchInput.focus();
    });
    
    // Keyboard shortcuts
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            filterAndRenderFormulas('');
        }
    });
    
    // Filter and render formulas based on search term with scoring
    function filterAndRenderFormulas(searchTerm) {
        console.log('=== filterAndRenderFormulas START ===');
        console.log('Search term:', searchTerm);
        
        if (!searchTerm) {
            // Show all formulas
            renderFormulaList();
            console.log('=== filterAndRenderFormulas END (empty search) ===');
            return;
        }
        
        // Track usage for dynamic prioritization
        if (typeof semanticSearchSystem !== 'undefined') {
            semanticSearchSystem.trackUsage(searchTerm);
        }
        
        const searchLower = searchTerm.toLowerCase();
        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
        
        console.log('Searching through', allFormulas.length, 'formulas');
        
        // Score and filter formulas with detailed metrics
        const scoredFormulas = allFormulas.map(formula => {
            const scoreData = calculateSearchScore(formula, searchLower, searchWords);
            
            // Add contextual semantic matching score
            if (typeof semanticSearchSystem !== 'undefined') {
                const semanticScore = semanticSearchSystem.semanticMatch(searchTerm, formula);
                scoreData.score += semanticScore;
                
                if (semanticScore > 0) {
                    scoreData.metrics.semanticMatch = true;
                    scoreData.metrics.matchReasons.push('Semantic similarity match');
                    
                    // Check if synonym expansion was used
                    const expandedQuery = semanticSearchSystem.expandWithSynonyms(searchLower);
                    if (expandedQuery.length > 1) {
                        scoreData.metrics.synonymMatch = true;
                        scoreData.metrics.matchReasons.push(`Synonym expansion: ${expandedQuery.length} variants`);
                    }
                }
                
                // Apply dynamic term prioritization
                const dynamicWeight = semanticSearchSystem.getDynamicWeight(searchTerm);
                if (dynamicWeight > 0) {
                    const boost = dynamicWeight / 100;
                    scoreData.score *= (1 + boost);
                    scoreData.metrics.dynamicBoost = Math.round(boost * 100);
                    scoreData.metrics.matchReasons.push(`Dynamic boost: +${scoreData.metrics.dynamicBoost}% (usage frequency)`);
                }
            }
            
            return { formula, score: scoreData.score, metrics: scoreData.metrics };
        }).filter(item => {
            // STRICT FILTERING: Only show formulas with meaningful relevance
            // Must have at least 100 points OR be a strong match (name/question pattern)
            const hasStrongMatch = item.metrics.nameMatch || item.metrics.questionPatternMatch;
            const hasGoodScore = item.score >= 100;
            const hasPrecisionMatch = item.score >= 200; // Precision/directionality matches
            
            return hasGoodScore || (hasStrongMatch && item.score >= 50) || hasPrecisionMatch;
        })
          .sort((a, b) => b.score - a.score) // Sort by relevance (highest to lowest)
          .slice(0, 30); // LIMIT TO TOP 30 RESULTS ONLY
        
        console.log('Scored formulas:', scoredFormulas.length);
        console.log('First 3 results:', scoredFormulas.slice(0, 3).map(f => ({
            name: f.formula.name,
            score: f.score
        })));
        
        // Calculate max score for normalization
        const maxScore = scoredFormulas.length > 0 ? scoredFormulas[0].score : 1;
        
        // Render filtered formulas with accuracy metrics
        renderFilteredFormulas(scoredFormulas, searchTerm, maxScore);
        console.log('=== filterAndRenderFormulas END ===');
    }
    
    // Calculate search relevance score with advanced natural language understanding
    function calculateSearchScore(formula, searchLower, searchWords) {
        let score = 0;
        const nameLower = formula.name.toLowerCase();
        const descLower = formula.description.toLowerCase();
        const eqLower = formula.equation.toLowerCase();
        
        // Track metrics for accuracy display
        const metrics = {
            nameMatch: false,
            descriptionMatch: false,
            equationMatch: false,
            variableMatch: false,
            conceptMatch: false,
            questionPatternMatch: false,
            categoryMatch: false,
            matchedConcepts: [],
            matchedVariables: [],
            matchReasons: [],
            originalConcepts: [],
            expandedConcepts: [],
            semanticMatch: false,
            synonymMatch: false,
            dynamicBoost: 0
        };
        
        // Parse question intent and extract key concepts
        const parsedQuery = parseNaturalLanguageQuery(searchLower, searchWords);
        
        // Store original concepts for display
        metrics.originalConcepts = [...parsedQuery.concepts];
        
        // Expand concepts using hierarchical network
        const expandedConcepts = expandConceptsWithHierarchy(parsedQuery.concepts);
        parsedQuery.concepts = expandedConcepts;
        metrics.expandedConcepts = expandedConcepts;
        
        // Note if concepts were expanded
        if (expandedConcepts.length > metrics.originalConcepts.length) {
            metrics.matchReasons.push(`Hierarchical expansion: ${metrics.originalConcepts.length} → ${expandedConcepts.length} concepts`);
        }
        
        // Exact name match (highest priority)
        if (nameLower === searchLower) {
            score += 1000;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Exact name match');
        } else if (nameLower.startsWith(searchLower)) {
            score += 500;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Name starts with search term');
        } else if (nameLower.includes(searchLower)) {
            score += 200;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Name contains search term');
        }
        
        // Natural language question matching
        const questionMatch = matchQuestionToFormula(formula, parsedQuery, searchLower, searchWords);
        score += questionMatch.score;
        if (questionMatch.score > 0) {
            metrics.questionPatternMatch = true;
            metrics.matchReasons.push(`Question pattern match (${questionMatch.reason || 'high relevance'})`);
        }
        
        // ENHANCED: Precision matching with directionality and primary use
        const precisionScore = calculatePrecisionScore(formula, parsedQuery, searchLower);
        score += precisionScore.score;
        if (precisionScore.score > 0) {
            metrics.matchReasons.push(precisionScore.reason);
        }
        
        // ENHANCED: Context-aware penalties for overly generic matches
        const penalty = calculateGenericPenalty(formula, parsedQuery, score);
        score -= penalty;
        if (penalty > 0) {
            metrics.matchReasons.push(`Generic match penalty: -${penalty} points`);
        }
        
        // Word-by-word matching in name (weighted by word importance)
        searchWords.forEach(word => {
            if (word.length >= 3) { // Only match words 3+ characters
                if (nameLower === word) {
                    score += 300; // Exact word match in name
                } else if (nameLower.startsWith(word)) {
                    score += 200; // Name starts with word
                } else if (nameLower.includes(word)) {
                    score += 150; // Name contains word
                }
                // Check for word boundaries for better accuracy
                const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                if (wordRegex.test(nameLower)) {
                    score += 50; // Bonus for word boundary match
                }
            }
        });
        
        // Description matching with semantic understanding (REDUCED to prevent too many matches)
        if (descLower.includes(searchLower)) {
            score += 150; // Full phrase match in description
            metrics.descriptionMatch = true;
        }
        // Only count description word matches if they're key terms (not common words)
        const commonWords = ['the', 'is', 'to', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'from', 'what', 'how', 'find', 'calculate'];
        searchWords.forEach(word => {
            if (word.length >= 3 && !commonWords.includes(word)) {
                if (descLower.includes(word)) {
                    // Reduced weight - only 20-30 points per word to prevent spam
                    const wordIndex = descLower.indexOf(word);
                    const positionWeight = wordIndex < descLower.length / 2 ? 30 : 20;
                    score += positionWeight;
                    metrics.descriptionMatch = true;
                }
                // Word boundary match bonus (reduced)
                const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
                if (wordRegex.test(descLower)) {
                    score += 10; // Reduced from 30
                }
            }
        });
        
        // Check if description answers the question (enhanced concept matching - REDUCED)
        if (parsedQuery.intent === 'calculate' || parsedQuery.intent === 'find' || parsedQuery.intent === 'determine') {
            parsedQuery.concepts.forEach(concept => {
                // Exact concept match in description (reduced points)
                if (descLower.includes(concept)) {
                    score += 100; // Reduced from 250
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                // Concept match in name (higher weight - name is more important)
                if (nameLower.includes(concept)) {
                    score += 400; // Keep high for name matches
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                // Partial concept match (for compound concepts)
                const conceptWords = concept.split(' ');
                if (conceptWords.length > 1) {
                    const allWordsMatch = conceptWords.every(cw => 
                        descLower.includes(cw) || nameLower.includes(cw)
                    );
                    if (allWordsMatch) {
                        score += 180;
                        metrics.conceptMatch = true;
                    }
                }
            });
        }
        
        // Triple-Layer Cross-Concept Reinforcement scoring
        if (typeof crossConceptReinforcement !== 'undefined' && crossConceptReinforcement.conceptNetwork) {
            parsedQuery.concepts.forEach(concept => {
                // Layer 1: Related concepts boost score
                const reinforcedConcepts = crossConceptReinforcement.getReinforcedConcepts(concept);
                reinforcedConcepts.forEach(relatedConcept => {
                    if (descLower.includes(relatedConcept) || nameLower.includes(relatedConcept)) {
                        score += 120; // Cross-concept reinforcement bonus
                        metrics.conceptMatch = true;
                        if (!metrics.matchedConcepts.includes(relatedConcept)) {
                            metrics.matchedConcepts.push(relatedConcept);
                        }
                    }
                });
                
                // Layer 2 + Layer 3: Reinforcement score from cross-layer connections
                const reinforcementScore = crossConceptReinforcement.getReinforcementScore(concept, formula.id);
                if (reinforcementScore > 0) {
                    score += reinforcementScore * 0.5; // Weighted reinforcement bonus
                    metrics.conceptMatch = true;
                }
            });
        }
        
        // Equation matching
        if (eqLower.includes(searchLower)) {
            score += 80;
            metrics.equationMatch = true;
        }
        searchWords.forEach(word => {
            if (eqLower.includes(word)) {
                score += 30;
                metrics.equationMatch = true;
            }
        });
        
        // Concept and keyword matching (new rich metadata)
        if (formula.concepts && Array.isArray(formula.concepts)) {
            formula.concepts.forEach(concept => {
                const conceptLower = concept.toLowerCase();
                if (conceptLower === searchLower) {
                    score += 400;
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                } else if (conceptLower.includes(searchLower) || searchLower.includes(conceptLower)) {
                    score += 200;
                    metrics.conceptMatch = true;
                    if (!metrics.matchedConcepts.includes(concept)) {
                        metrics.matchedConcepts.push(concept);
                    }
                }
                // Word-by-word matching in concepts
                searchWords.forEach(word => {
                    if (word.length >= 3 && conceptLower.includes(word)) {
                        score += 150;
                        metrics.conceptMatch = true;
                        if (!metrics.matchedConcepts.includes(concept)) {
                            metrics.matchedConcepts.push(concept);
                        }
                    }
                });
            });
        }
        
        if (formula.keywords && Array.isArray(formula.keywords)) {
            formula.keywords.forEach(keyword => {
                const keywordLower = keyword.toLowerCase();
                if (keywordLower === searchLower) {
                    score += 180;
                    metrics.conceptMatch = true;
                } else if (keywordLower.includes(searchLower) || searchLower.includes(keywordLower)) {
                    score += 100;
                    metrics.conceptMatch = true;
                }
                // Word-by-word matching in keywords
                searchWords.forEach(word => {
                    if (word.length >= 3 && keywordLower.includes(word)) {
                        score += 80;
                        metrics.conceptMatch = true;
                    }
                });
            });
        }
        
        // Variable matching (high priority for symbols - improved accuracy)
        formula.variables.forEach(v => {
            const varSymbol = v.symbol.toLowerCase();
            const varName = v.name.toLowerCase();
            const varDesc = (v.description || '').toLowerCase();
            
            // Exact symbol match (highest priority)
            if (varSymbol === searchLower) {
                score += 400;
                metrics.variableMatch = true;
                if (!metrics.matchedVariables.includes(v.symbol)) {
                    metrics.matchedVariables.push(v.symbol);
                }
            } else if (varSymbol.includes(searchLower)) {
                score += 180;
                metrics.variableMatch = true;
            }
            
            // Exact variable name match
            if (varName === searchLower) {
                score += 250;
                metrics.variableMatch = true;
                if (!metrics.matchedVariables.includes(v.symbol)) {
                    metrics.matchedVariables.push(v.symbol);
                }
            } else if (varName.includes(searchLower)) {
                score += 120;
                metrics.variableMatch = true;
            }
            
            // Check if variable name matches question concepts (enhanced)
            parsedQuery.concepts.forEach(concept => {
                // Exact concept match in variable name
                if (varName === concept || varName.includes(` ${concept} `) || varName.startsWith(`${concept} `) || varName.endsWith(` ${concept}`)) {
                    score += 180;
                    metrics.variableMatch = true;
                    if (!metrics.matchedVariables.includes(v.symbol)) {
                        metrics.matchedVariables.push(v.symbol);
                    }
                } else if (varName.includes(concept) || varDesc.includes(concept)) {
                    score += 140;
                    metrics.variableMatch = true;
                    if (!metrics.matchedVariables.includes(v.symbol)) {
                        metrics.matchedVariables.push(v.symbol);
                    }
                }
                // Exact symbol-concept match
                if (varSymbol === concept) {
                    score += 250;
                    metrics.variableMatch = true;
                    if (!metrics.matchedVariables.includes(v.symbol)) {
                        metrics.matchedVariables.push(v.symbol);
                    }
                }
            });
            
            // Word-by-word matching in variables (weighted)
            searchWords.forEach(word => {
                if (word.length >= 2) {
                    if (varSymbol === word) {
                        score += 120;
                        metrics.variableMatch = true;
                    } else if (varSymbol.includes(word)) {
                        score += 80;
                    }
                    if (varName.includes(word)) {
                        score += 50;
                        metrics.variableMatch = true;
                    }
                    if (varDesc.includes(word)) {
                        score += 70;
                        metrics.variableMatch = true;
                    }
                }
            });
        });
        
        // Category matching (improved accuracy)
        for (const [category, ids] of Object.entries(formulaCategories)) {
            if (ids.includes(formula.id)) {
                const categoryLower = category.toLowerCase();
                // Exact category match
                if (categoryLower === searchLower) {
                    score += 150;
                    metrics.categoryMatch = true;
                } else if (categoryLower.includes(searchLower)) {
                    score += 80;
                    metrics.categoryMatch = true;
                }
                // Word-by-word category matching
                searchWords.forEach(word => {
                    if (word.length >= 3 && categoryLower.includes(word)) {
                        score += 60;
                        metrics.categoryMatch = true;
                    }
                });
                // Check if category matches question domain (enhanced)
                parsedQuery.concepts.forEach(concept => {
                    if (categoryLower === concept) {
                        score += 120;
                        metrics.categoryMatch = true;
                        if (!metrics.matchedConcepts.includes(concept)) {
                            metrics.matchedConcepts.push(concept);
                        }
                    } else if (categoryLower.includes(concept)) {
                        score += 90;
                        metrics.categoryMatch = true;
                        if (!metrics.matchedConcepts.includes(concept)) {
                            metrics.matchedConcepts.push(concept);
                        }
                    }
                });
                break;
            }
        }
        
        // Boost score for multiple strong matches (compound relevance)
        const strongMatchCount = [
            metrics.nameMatch && score > 200,
            metrics.questionPatternMatch,
            metrics.conceptMatch && metrics.matchedConcepts.length > 0,
            metrics.variableMatch && metrics.matchedVariables.length > 0
        ].filter(Boolean).length;
        
        if (strongMatchCount >= 2) {
            score += 100 * (strongMatchCount - 1); // Bonus for multiple strong matches
        }
        
        return { score, metrics };
    }
    
    // Hierarchical concept network - defines parent-child relationships
    function getConceptHierarchy() {
        return {
            // Top-level: Fundamental Physics
            'fundamental physics': {
                children: ['motion', 'energy', 'force', 'gravity', 'radiation', 'thermodynamics'],
                level: 0
            },
            
            // Motion & Dynamics
            'motion': {
                children: ['velocity', 'orbital velocity', 'rotational velocity', 'escape velocity', 'acceleration', 'momentum'],
                level: 1,
                parent: 'fundamental physics'
            },
            'velocity': {
                children: ['orbital velocity', 'rotational velocity', 'escape velocity', 'tangential velocity'],
                level: 2,
                parent: 'motion',
                siblings: ['acceleration', 'momentum']
            },
            'orbital velocity': {
                children: [],
                level: 3,
                parent: 'velocity',
                siblings: ['rotational velocity', 'escape velocity'],
                related: ['orbital period', 'kepler', 'semi-major axis']
            },
            'rotational velocity': {
                children: [],
                level: 3,
                parent: 'velocity',
                siblings: ['orbital velocity', 'escape velocity'],
                related: ['rotational period', 'angular frequency']
            },
            'escape velocity': {
                children: [],
                level: 3,
                parent: 'velocity',
                siblings: ['orbital velocity', 'rotational velocity'],
                related: ['gravity', 'surface gravity', 'mass', 'radius']
            },
            'acceleration': {
                children: ['surface gravity', 'centripetal acceleration'],
                level: 2,
                parent: 'motion',
                siblings: ['velocity', 'momentum']
            },
            'momentum': {
                children: ['angular momentum', 'linear momentum'],
                level: 2,
                parent: 'motion',
                siblings: ['velocity', 'acceleration']
            },
            'angular momentum': {
                children: ['angular momentum elliptical'],
                level: 3,
                parent: 'momentum',
                related: ['rotational velocity', 'orbital velocity']
            },
            
            // Energy
            'energy': {
                children: ['orbital energy', 'kinetic energy', 'potential energy', 'photon energy', 'radiative energy'],
                level: 1,
                parent: 'fundamental physics'
            },
            'orbital energy': {
                children: ['vis viva'],
                level: 2,
                parent: 'energy',
                related: ['orbital velocity', 'semi-major axis', 'period']
            },
            'photon energy': {
                children: [],
                level: 2,
                parent: 'energy',
                related: ['wavelength', 'planck relation', 'frequency']
            },
            
            // Force & Gravity
            'force': {
                children: ['gravity', 'tidal force', 'centripetal force'],
                level: 1,
                parent: 'fundamental physics'
            },
            'gravity': {
                children: ['surface gravity', 'escape velocity', 'tidal force'],
                level: 2,
                parent: 'force',
                related: ['mass', 'radius', 'density']
            },
            'surface gravity': {
                children: [],
                level: 3,
                parent: 'gravity',
                related: ['mass', 'radius', 'escape velocity']
            },
            'tidal force': {
                children: ['roche limit'],
                level: 3,
                parent: 'gravity',
                related: ['mass', 'distance', 'hill radius']
            },
            'roche limit': {
                children: [],
                level: 4,
                parent: 'tidal force',
                related: ['mass', 'density', 'hill radius']
            },
            'hill radius': {
                children: [],
                level: 3,
                parent: 'gravity',
                related: ['mass', 'semi-major axis', 'roche limit']
            },
            
            // Distance & Position
            'distance': {
                children: ['parallax', 'parallax distance', 'distance modulus', 'luminosity distance', 'angular diameter distance', 'semi-major axis'],
                level: 1,
                parent: 'fundamental physics'
            },
            'parallax': {
                children: ['parallax distance radians', 'parallax distance arcsec', 'trigonometric parallax'],
                level: 2,
                parent: 'distance',
                siblings: ['distance modulus', 'luminosity distance']
            },
            'parallax distance': {
                children: ['parallax distance radians', 'parallax distance arcsec'],
                level: 3,
                parent: 'parallax',
                related: ['distance modulus', 'standard candle']
            },
            'distance modulus': {
                children: [],
                level: 2,
                parent: 'distance',
                siblings: ['parallax', 'luminosity distance'],
                related: ['magnitude', 'apparent magnitude', 'absolute magnitude', 'extinction']
            },
            'luminosity distance': {
                children: [],
                level: 2,
                parent: 'distance',
                siblings: ['parallax', 'distance modulus'],
                related: ['luminosity', 'redshift', 'hubble']
            },
            'angular diameter distance': {
                children: [],
                level: 2,
                parent: 'distance',
                siblings: ['parallax', 'distance modulus'],
                related: ['angular size', 'redshift']
            },
            'semi-major axis': {
                children: [],
                level: 2,
                parent: 'distance',
                related: ['orbital period', 'kepler', 'orbital velocity']
            },
            
            // Time & Period
            'period': {
                children: ['orbital period', 'rotational period', 'synodic period'],
                level: 1,
                parent: 'fundamental physics'
            },
            'orbital period': {
                children: [],
                level: 2,
                parent: 'period',
                siblings: ['rotational period', 'synodic period'],
                related: ['kepler', 'semi-major axis', 'mass', 'orbital velocity']
            },
            'synodic period': {
                children: [],
                level: 2,
                parent: 'period',
                siblings: ['orbital period'],
                related: ['orbital period']
            },
            'rotational period': {
                children: [],
                level: 2,
                parent: 'period',
                siblings: ['orbital period'],
                related: ['rotational velocity', 'angular frequency']
            },
            'lifetime': {
                children: ['stellar lifetime', 'timescale'],
                level: 1,
                parent: 'fundamental physics'
            },
            'stellar lifetime': {
                children: [],
                level: 2,
                parent: 'lifetime',
                related: ['mass', 'luminosity', 'stellar evolution']
            },
            'timescale': {
                children: ['synchrotron cooling timescale', 'tidal locking timescale', 'thermal timescale', 'dynamical timescale'],
                level: 2,
                parent: 'lifetime'
            },
            
            // Mass
            'mass': {
                children: ['stellar mass', 'planetary mass', 'jeans mass', 'chandrasekhar limit'],
                level: 1,
                parent: 'fundamental physics'
            },
            'chandrasekhar limit': {
                children: [],
                level: 2,
                parent: 'mass',
                related: ['white dwarf', 'neutron star', 'compact object']
            },
            'jeans mass': {
                children: [],
                level: 2,
                parent: 'mass',
                related: ['density', 'temperature', 'gravitational collapse']
            },
            
            // Temperature
            'temperature': {
                children: ['effective temperature', 'surface temperature', 'color temperature', 'planetary equilibrium temperature'],
                level: 1,
                parent: 'fundamental physics'
            },
            'effective temperature': {
                children: [],
                level: 2,
                parent: 'temperature',
                related: ['luminosity', 'radius', 'blackbody', 'wien law']
            },
            'planetary equilibrium temperature': {
                children: [],
                level: 2,
                parent: 'temperature',
                related: ['luminosity', 'distance', 'albedo']
            },
            
            // Radiation & Stellar Properties
            'radiation': {
                children: ['blackbody', 'blackbody radiation', 'flux', 'luminosity', 'magnitude', 'wavelength'],
                level: 1,
                parent: 'fundamental physics'
            },
            'blackbody': {
                children: ['blackbody radiation', 'wien law', 'planck relation'],
                level: 2,
                parent: 'radiation',
                related: ['temperature', 'wavelength', 'flux']
            },
            'blackbody radiation': {
                children: [],
                level: 3,
                parent: 'blackbody',
                related: ['temperature', 'wavelength', 'flux', 'wien law']
            },
            'wien law': {
                children: [],
                level: 3,
                parent: 'blackbody',
                related: ['temperature', 'peak wavelength', 'wavelength']
            },
            'planck relation': {
                children: [],
                level: 3,
                parent: 'blackbody',
                related: ['photon energy', 'wavelength', 'frequency']
            },
            'flux': {
                children: ['flux from luminosity', 'flux temperature', 'inverse square law brightness'],
                level: 2,
                parent: 'radiation',
                related: ['luminosity', 'distance', 'magnitude']
            },
            'luminosity': {
                children: ['flux from luminosity', 'mass luminosity relation'],
                level: 2,
                parent: 'radiation',
                related: ['radius', 'temperature', 'magnitude', 'distance']
            },
            'magnitude': {
                children: ['apparent magnitude', 'absolute magnitude', 'distance modulus', 'magnitude flux relation'],
                level: 2,
                parent: 'radiation',
                related: ['flux', 'luminosity', 'distance']
            },
            'wavelength': {
                children: ['peak wavelength', 'doppler shift'],
                level: 2,
                parent: 'radiation',
                related: ['wien law', 'planck relation', 'redshift']
            },
            
            // Spectroscopy
            'spectroscopy': {
                children: ['doppler', 'doppler shift', 'equivalent width', 'line profile'],
                level: 1,
                parent: 'fundamental physics'
            },
            'doppler': {
                children: ['doppler shift', 'doppler shift approx', 'radial velocity'],
                level: 2,
                parent: 'spectroscopy',
                related: ['velocity', 'redshift', 'wavelength']
            },
            'doppler shift': {
                children: [],
                level: 3,
                parent: 'doppler',
                related: ['velocity', 'redshift', 'wavelength', 'radial velocity curve']
            },
            'equivalent width': {
                children: [],
                level: 2,
                parent: 'spectroscopy',
                related: ['absorption', 'emission', 'line profile']
            },
            
            // Cosmology
            'cosmology': {
                children: ['redshift', 'hubble', 'hubble law', 'lookback time', 'cosmic redshift'],
                level: 1,
                parent: 'fundamental physics'
            },
            'redshift': {
                children: ['cosmic redshift', 'doppler shift'],
                level: 2,
                parent: 'cosmology',
                related: ['hubble', 'distance', 'velocity']
            },
            'hubble': {
                children: ['hubble law', 'hubble constant'],
                level: 2,
                parent: 'cosmology',
                related: ['redshift', 'distance', 'velocity']
            },
            'hubble law': {
                children: [],
                level: 3,
                parent: 'hubble',
                related: ['redshift', 'distance', 'velocity', 'luminosity distance']
            },
            'lookback time': {
                children: [],
                level: 2,
                parent: 'cosmology',
                related: ['redshift', 'hubble', 'distance']
            },
            
            // Stellar Evolution
            'stellar evolution': {
                children: ['main sequence', 'giant', 'white dwarf', 'neutron star', 'black hole', 'stellar lifetime'],
                level: 1,
                parent: 'fundamental physics'
            },
            'main sequence': {
                children: ['mass luminosity relation', 'stellar lifetime'],
                level: 2,
                parent: 'stellar evolution',
                related: ['mass', 'luminosity', 'temperature']
            },
            'white dwarf': {
                children: ['white dwarf mass radius', 'chandrasekhar limit', 'binary white dwarf'],
                level: 2,
                parent: 'stellar evolution',
                related: ['mass', 'radius', 'density']
            },
            'binary white dwarf': {
                children: ['white dwarf orbital decay', 'white dwarf merger timescale'],
                level: 3,
                parent: 'white dwarf',
                related: ['orbital period', 'mass', 'roche limit']
            },
            
            // Binary Systems
            'binary': {
                children: ['binary white dwarf', 'kepler third law binary', 'center of mass'],
                level: 1,
                parent: 'fundamental physics'
            },
            'kepler third law binary': {
                children: [],
                level: 2,
                parent: 'binary',
                related: ['orbital period', 'mass', 'semi-major axis']
            },
            'center of mass': {
                children: [],
                level: 2,
                parent: 'binary',
                related: ['mass', 'distance', 'orbital period']
            },
            
            // Kepler's Laws
            'kepler': {
                children: ['kepler third law', 'kepler third law solar', 'kepler third law binary'],
                level: 1,
                parent: 'fundamental physics'
            },
            'kepler third law': {
                children: [],
                level: 2,
                parent: 'kepler',
                related: ['orbital period', 'semi-major axis', 'mass']
            },
            
            // Relativity
            'relativity': {
                children: ['schwarzschild radius', 'time dilation', 'length contraction', 'einstein radius'],
                level: 1,
                parent: 'fundamental physics'
            },
            'schwarzschild radius': {
                children: [],
                level: 2,
                parent: 'relativity',
                related: ['mass', 'black hole', 'event horizon']
            },
            'einstein radius': {
                children: [],
                level: 2,
                parent: 'relativity',
                related: ['gravitational lensing', 'mass', 'distance']
            },
            
            // High Energy Astrophysics
            'high energy': {
                children: ['synchrotron', 'synchrotron power', 'magnetic energy density', 'max gamma bohm'],
                level: 1,
                parent: 'fundamental physics'
            },
            'synchrotron': {
                children: ['synchrotron power', 'synchrotron cooling timescale'],
                level: 2,
                parent: 'high energy',
                related: ['magnetic field', 'energy', 'radiation']
            },
            
            // Telescopes & Optics
            'telescopes': {
                children: ['angular resolution', 'light gathering power', 'magnification', 'f ratio'],
                level: 1,
                parent: 'fundamental physics'
            },
            'angular resolution': {
                children: [],
                level: 2,
                parent: 'telescopes',
                related: ['wavelength', 'aperture', 'diffraction']
            },
            'light gathering power': {
                children: [],
                level: 2,
                parent: 'telescopes',
                related: ['aperture', 'magnitude', 'flux']
            }
        };
    }
    
    // Expand concepts using hierarchical relationships
    function expandConceptsWithHierarchy(concepts) {
        const hierarchy = getConceptHierarchy();
        const expanded = new Set(concepts);
        
        concepts.forEach(concept => {
            const node = hierarchy[concept];
            if (node) {
                // Add parent concepts (broader context)
                if (node.parent) {
                    expanded.add(node.parent);
                }
                
                // Add child concepts (more specific)
                if (node.children && node.children.length > 0) {
                    node.children.forEach(child => expanded.add(child));
                }
                
                // Add sibling concepts (related at same level)
                if (node.siblings && node.siblings.length > 0) {
                    node.siblings.forEach(sibling => expanded.add(sibling));
                }
                
                // Add related concepts (cross-references)
                if (node.related && node.related.length > 0) {
                    node.related.forEach(related => expanded.add(related));
                }
            }
        });
        
        return Array.from(expanded);
    }
    
    // Helper function to extract concepts from text
    function extractConceptsFromText(text) {
        const concepts = [];
        const lowerText = text.toLowerCase();
        
        // Use comprehensive physics terms (will be defined in parseNaturalLanguageQuery)
        // For now, use a simplified but comprehensive list
        const keyTerms = [
            'temperature', 'temp', 'hot', 'thermal',
            'spectrum', 'spectral', 'light', 'wavelength', 'color', 'colour', 'peak wavelength',
            'flux', 'luminosity', 'brightness', 'radiance',
            'distance', 'parallax', 'modulus',
            'velocity', 'speed', 'orbital velocity', 'escape velocity',
            'period', 'time', 'orbital period',
            'mass', 'weight', 'stellar mass',
            'radius', 'size', 'diameter',
            'gravity', 'gravitational', 'surface gravity',
            'energy', 'photon energy',
            'magnitude', 'apparent magnitude', 'absolute magnitude',
            'redshift', 'doppler', 'doppler shift',
            'blackbody', 'black body', 'wien', 'wien law', 'stefan', 'planck',
            'kepler', 'orbital', 'orbit',
            'white dwarf', 'star', 'stellar', 'planet'
        ];
        
        keyTerms.forEach(term => {
            if (lowerText.includes(term)) {
                concepts.push(term);
            }
        });
        
        return concepts;
    }
    
    // Parse natural language query to extract intent and concepts
    function parseNaturalLanguageQuery(searchLower, searchWords) {
        const result = {
            intent: 'search', // calculate, find, determine, how, what, etc.
            concepts: [],
            variables: [],
            actions: [],
            direction: null, // 'from', 'to', 'based_on', null
            sourceConcepts: [], // What we're calculating FROM
            targetConcepts: [] // What we're calculating TO
        };
        
        // Remove common question words and extract intent
        const questionWords = ['how', 'what', 'where', 'when', 'why', 'which', 'who'];
        const actionWords = {
            'calculate': ['calculate', 'compute', 'find', 'determine', 'solve', 'work out', 'figure out'],
            'find': ['find', 'get', 'obtain', 'discover', 'locate'],
            'determine': ['determine', 'figure', 'establish', 'ascertain'],
            'convert': ['convert', 'transform', 'change'],
            'relate': ['relate', 'connect', 'link', 'relationship', 'between']
        };
        
        // Detect intent
        for (const [intent, words] of Object.entries(actionWords)) {
            if (words.some(word => searchLower.includes(word))) {
                result.intent = intent;
                result.actions.push(intent);
                break;
            }
        }
        
        // ENHANCED: Detect directionality (FROM, TO, BASED ON)
        const directionPatterns = {
            'from': ['from', 'using', 'with', 'given', 'based on', 'based off', 'based off of', 'from the', 'using the', 'with the'],
            'to': ['to', 'into', 'for', 'as', 'in terms of'],
            'based_on': ['based on', 'based off', 'based off of', 'derived from', 'calculated from', 'determined from']
        };
        
        // Check for direction indicators
        for (const [direction, patterns] of Object.entries(directionPatterns)) {
            for (const pattern of patterns) {
                if (searchLower.includes(pattern)) {
                    result.direction = direction;
                    
                    // Extract source and target concepts
                    const parts = searchLower.split(new RegExp(`\\b${pattern}\\b`, 'i'));
                    if (parts.length >= 2) {
                        // First part is what we want (target)
                        const targetText = parts[0].trim();
                        // Second part is what we have (source)
                        const sourceText = parts.slice(1).join(' ').trim();
                        
                        // Extract concepts from each part
                        result.targetConcepts = extractConceptsFromText(targetText);
                        result.sourceConcepts = extractConceptsFromText(sourceText);
                    }
                    break;
                }
            }
            if (result.direction) break;
        }
        
        // Extract key concepts (physics/astronomy terms) with comprehensive synonyms
        const physicsTerms = {
            // Motion & Velocity
            'velocity': ['velocity', 'speed', 'v', 'how fast', 'rate of motion', 'motion', 'moving', 'mph', 'kmh', 'mps'],
            'orbital velocity': ['orbital velocity', 'orbital speed', 'circular motion', 'orbit speed', 'orbiting', 'revolve', 'orbital motion', 'circular orbit'],
            'escape velocity': ['escape velocity', 'escape speed', 'leave planet', 'escape gravity', 'break free', 'get away from', 'escape from', 'break away'],
            'rotational velocity': ['rotational velocity', 'rotation speed', 'spin', 'rotating', 'rotates', 'spinning', 'angular velocity', 'spin rate'],
            'vis viva': ['vis viva', 'orbital energy', 'total energy', 'mechanical energy'],
            
            // Distance & Position
            'distance': ['distance', 'd', 'how far', 'separation', 'away', 'far away', 'how far away', 'distant', 'separation distance'],
            'parallax': ['parallax', 'parallax distance', 'stellar parallax', 'parallax method', 'trigonometric parallax', 'annual parallax'],
            'radius': ['radius', 'r', 'size', 'diameter', 'how big', 'size of', 'stellar radius', 'planetary radius'],
            'semi-major axis': ['semi-major axis', 'orbital distance', 'a', 'orbit size', 'orbit distance', 'semi major axis', 'orbital radius'],
            'aphelion': ['aphelion', 'farthest point', 'maximum distance'],
            'perihelion': ['perihelion', 'closest point', 'minimum distance', 'periapsis'],
            'eccentricity': ['eccentricity', 'e', 'orbit shape', 'elliptical shape'],
            
            // Time & Period
            'period': ['period', 'p', 'time', 'how long', 'duration', 't', 'time period'],
            'orbital period': ['orbital period', 'orbit time', 'revolution', 'year', 'orbital time', 'revolution period'],
            'synodic period': ['synodic period', 'synodic', 'apparent period', 'relative period'],
            'lifetime': ['lifetime', 'age', 'how long', 'survive', 'live', 'stellar age', 'star age'],
            'stellar lifetime': ['stellar lifetime', 'main sequence lifetime', 'star lifetime', 'stellar age'],
            
            // Mass & Gravity
            'mass': ['mass', 'm', 'weight', 'how heavy', 'stellar mass', 'planetary mass', 'solar mass'],
            'gravity': ['gravity', 'g', 'gravitational', 'surface gravity', 'acceleration', 'gravitational acceleration', 'g force'],
            'escape': ['escape', 'leave', 'break free', 'get away'],
            'chandrasekhar limit': ['chandrasekhar limit', 'chandrasekhar', 'white dwarf limit', 'maximum mass', 'wd limit'],
            'jeans mass': ['jeans mass', 'jeans', 'gravitational collapse', 'critical mass'],
            'center of mass': ['center of mass', 'barycenter', 'center of gravity', 'com'],
            
            // Energy & Luminosity
            'luminosity': ['luminosity', 'l', 'brightness', 'how bright', 'intrinsic brightness', 'star brightness', 'stellar brightness', 'power output', 'radiative power'],
            'flux': ['flux', 'f', 'observed brightness', 'apparent brightness', 'light received', 'light flux', 'radiation flux', 'energy flux', 'flux density'],
            'magnitude': ['magnitude', 'm', 'apparent magnitude', 'absolute magnitude', 'brightness', 'star magnitude', 'stellar magnitude', 'photometric'],
            'energy': ['energy', 'e', 'kinetic', 'potential', 'orbital energy', 'total energy', 'mechanical energy'],
            'photon energy': ['photon energy', 'quantum energy', 'light energy', 'em energy'],
            'inverse square law': ['inverse square law', 'isq', 'brightness law', 'flux law'],
            
            // Temperature & Radiation
            'temperature': ['temperature', 't', 'temp', 'how hot', 'thermal', 'stellar temperature', 'surface temperature', 'effective temperature'],
            'wavelength': ['wavelength', 'lambda', 'λ', 'color', 'frequency', 'em wavelength', 'light wavelength'],
            'peak wavelength': ['peak wavelength', 'wien', 'maximum wavelength', 'lambda max', 'wien peak', 'wavelength peak'],
            'blackbody': ['blackbody', 'radiation', 'thermal radiation', 'bb radiation', 'black body'],
            'wien law': ['wien law', 'wien displacement', 'wien', 'wien displacement law'],
            'stefan boltzmann': ['stefan boltzmann', 'stefan', 'sb law', 'stefan boltzmann law', 'radiative law'],
            'planck': ['planck', 'planck relation', 'planck constant', 'quantum', 'photon'],
            
            // Stellar Properties
            'star': ['star', 'stellar', 'sun', 'solar', 'stellar object'],
            'main sequence': ['main sequence', 'ms star', 'dwarf star', 'main sequence star'],
            'red giant': ['red giant', 'giant', 'giant star', 'evolved star'],
            'white dwarf': ['white dwarf', 'dwarf', 'degenerate', 'wd', 'white dwarf star'],
            'neutron star': ['neutron star', 'pulsar', 'ns', 'compact object'],
            'black hole': ['black hole', 'bh', 'singularity', 'event horizon'],
            'supernova': ['supernova', 'sn', 'explosion', 'stellar explosion'],
            'planet': ['planet', 'planetary', 'exoplanet', 'extrasolar planet'],
            'binary star': ['binary star', 'binary', 'double star', 'binary system'],
            'hr diagram': ['hr diagram', 'hertzsprung russell', 'hr', 'color magnitude'],
            'mass luminosity': ['mass luminosity', 'mass luminosity relation', 'ml relation'],
            
            // Cosmology
            'hubble': ['hubble', 'expansion', 'universe', 'galaxy', 'redshift', 'hubble constant', 'h0', 'hubble law'],
            'redshift': ['redshift', 'z', 'cosmic', 'doppler', 'cosmological redshift'],
            'density': ['density', 'rho', 'ρ', 'critical density', 'mass density', 'energy density'],
            'critical density': ['critical density', 'omega', 'closure density', 'flat universe'],
            'dark matter': ['dark matter', 'dm', 'missing mass'],
            'dark energy': ['dark energy', 'de', 'cosmological constant'],
            'cmb': ['cmb', 'cosmic microwave background', 'microwave background', 'relic radiation'],
            'lookback time': ['lookback time', 'light travel time', 'cosmic time'],
            'friedmann': ['friedmann', 'friedmann equation', 'cosmological equation'],
            
            // Optics & Telescopes
            'angular size': ['angular size', 'angular diameter', 'apparent size', 'how big', 'angular extent', 'angular measure'],
            'angular resolution': ['angular resolution', 'resolution', 'resolving', 'resolving power', 'angular resolving'],
            'magnification': ['magnification', 'zoom', 'enlarge', 'magnifying power', 'angular magnification'],
            'light gathering': ['light gathering', 'light gathering power', 'aperture', 'collecting area'],
            'f ratio': ['f ratio', 'f number', 'focal ratio', 'f/#', 'f stop'],
            'aperture': ['aperture', 'diameter', 'telescope size', 'mirror size'],
            'focal length': ['focal length', 'f', 'focus'],
            
            // Orbital Mechanics
            'kepler': ['kepler', 'orbital', 'orbit', 'elliptical', 'kepler law', 'keplers law'],
            'kepler third law': ['kepler third law', 'kepler 3', 'period distance', 'p2 a3'],
            'tidal': ['tidal', 'tide', 'roche', 'disruption', 'tidal force', 'tidal effect'],
            'roche limit': ['roche limit', 'roche', 'tidal disruption', 'disruption radius'],
            'hill radius': ['hill radius', 'sphere of influence', 'gravitational influence', 'hill sphere'],
            'tidal locking': ['tidal locking', 'synchronous rotation', 'tidally locked'],
            'angular momentum': ['angular momentum', 'l', 'orbital angular momentum', 'spin angular momentum'],
            
            // Spectroscopy
            'doppler': ['doppler', 'doppler shift', 'doppler effect', 'radial velocity'],
            'spectroscopy': ['spectroscopy', 'spectrum', 'spectral', 'spectral line'],
            'equivalent width': ['equivalent width', 'ew', 'line strength', 'absorption strength'],
            'absorption': ['absorption', 'absorption line', 'spectral absorption'],
            'emission': ['emission', 'emission line', 'spectral emission'],
            'redshift z': ['redshift z', 'z', 'cosmological z'],
            
            // Exoplanets
            'exoplanet': ['exoplanet', 'extrasolar planet', 'exo planet', 'alien planet'],
            'transit': ['transit', 'transit method', 'transit depth', 'eclipse'],
            'radial velocity': ['radial velocity', 'rv method', 'doppler method', 'wobble'],
            'equilibrium temperature': ['equilibrium temperature', 'planet temperature', 'exoplanet temp', 'effective temp'],
            'albedo': ['albedo', 'reflectivity', 'reflection coefficient'],
            'greenhouse': ['greenhouse', 'greenhouse effect', 'atmospheric effect'],
            
            // High Energy Astrophysics
            'synchrotron': ['synchrotron', 'synchrotron radiation', 'magnetic radiation'],
            'gamma ray': ['gamma ray', 'gamma', 'high energy', 'gamma radiation'],
            'power law': ['power law', 'spectral index', 'alpha', 'spectrum slope'],
            'cooling': ['cooling', 'cooling time', 'synchrotron cooling', 'radiative cooling'],
            'magnetic field': ['magnetic field', 'b field', 'magnetic', 'b'],
            'energy density': ['energy density', 'u', 'magnetic energy', 'radiation energy'],
            
            // Relativity
            'schwarzschild': ['schwarzschild', 'schwarzschild radius', 'event horizon', 'black hole radius'],
            'time dilation': ['time dilation', 'relativistic time', 'time slow'],
            'length contraction': ['length contraction', 'lorentz contraction', 'relativistic length'],
            'einstein radius': ['einstein radius', 'gravitational lensing', 'lensing', 'einstein ring'],
            
            // Stellar Structure
            'hydrostatic': ['hydrostatic', 'hydrostatic balance', 'hydrostatic equilibrium', 'pressure balance'],
            'pressure': ['pressure', 'gas pressure', 'radiation pressure', 'stellar pressure'],
            
            // Distance Measurements
            'distance modulus': ['distance modulus', 'dm', 'magnitude distance', 'photometric distance'],
            'luminosity distance': ['luminosity distance', 'dl', 'flux distance', 'standard candle'],
            'angular diameter distance': ['angular diameter distance', 'da', 'size distance'],
            'parallax distance': ['parallax distance', 'trigonometric distance', 'geometric distance'],
            
            // Miscellaneous
            'binary': ['binary', 'binary system', 'double', 'pair', 'double star'],
            'merger': ['merger', 'merging', 'coalescence', 'collision', 'coalesce'],
            'orbital decay': ['orbital decay', 'decay', 'shrinking orbit', 'inspiral', 'spiral in'],
            'color index': ['color index', 'b-v', 'color', 'stellar color', 'bv color'],
            'stellar classification': ['stellar classification', 'spectral type', 'star type', 'classification', 'stellar type'],
            
            // Additional Motion Terms
            'acceleration': ['acceleration', 'a', 'rate of change', 'deceleration'],
            'angular velocity': ['angular velocity', 'omega', 'ω', 'angular speed', 'rotation rate'],
            'centripetal': ['centripetal', 'centripetal force', 'circular force'],
            'tangential velocity': ['tangential velocity', 'tangential speed', 'circumferential velocity'],
            
            // Additional Distance Terms
            'parsec': ['parsec', 'pc', 'parallax second'],
            'light year': ['light year', 'ly', 'lightyear'],
            'astronomical unit': ['astronomical unit', 'au', 'astronomical units'],
            'proper distance': ['proper distance', 'comoving distance', 'physical distance'],
            'comoving distance': ['comoving distance', 'comoving', 'coordinate distance'],
            
            // Additional Time Terms
            'age': ['age', 'stellar age', 'star age', 'system age'],
            'timescale': ['timescale', 'time scale', 'characteristic time'],
            'half life': ['half life', 'half-life', 'decay time'],
            'dynamical time': ['dynamical time', 'dynamical timescale', 'free fall time'],
            
            // Additional Mass Terms
            'solar mass': ['solar mass', 'm_sun', 'm☉', 'solar masses'],
            'jupiter mass': ['jupiter mass', 'm_jup', 'mj', 'jovian mass'],
            'earth mass': ['earth mass', 'm_earth', 'm⊕', 'terrestrial mass'],
            'chandrasekhar': ['chandrasekhar', 'chandrasekhar mass', 'wd limit'],
            'tov limit': ['tov limit', 'tov', 'tolman oppenheimer volkoff'],
            
            // Additional Energy Terms
            'kinetic energy': ['kinetic energy', 'ke', 'motion energy', 'translational energy'],
            'potential energy': ['potential energy', 'pe', 'gravitational energy', 'binding energy'],
            'binding energy': ['binding energy', 'gravitational binding', 'system energy'],
            'radiative energy': ['radiative energy', 'radiation energy', 'em energy'],
            'thermal energy': ['thermal energy', 'heat energy', 'internal energy'],
            
            // Additional Temperature Terms
            'effective temperature': ['effective temperature', 'teff', 't_eff', 'stellar temperature'],
            'surface temperature': ['surface temperature', 'photospheric temperature', 'star surface temp'],
            'color temperature': ['color temperature', 't_color', 'blackbody temperature'],
            'brightness temperature': ['brightness temperature', 'tb', 'radio temperature'],
            
            // Additional Radiation Terms
            'emission': ['emission', 'emission spectrum', 'emission line', 'emission feature'],
            'absorption': ['absorption', 'absorption spectrum', 'absorption line', 'absorption feature'],
            'continuum': ['continuum', 'continuous spectrum', 'blackbody continuum'],
            'spectral energy distribution': ['sed', 'spectral energy distribution', 'energy distribution'],
            'bolometric': ['bolometric', 'bolometric magnitude', 'total magnitude', 'bol'],
            
            // Additional Stellar Evolution Terms
            'main sequence': ['main sequence', 'ms', 'dwarf', 'main sequence star'],
            'giant': ['giant', 'giant star', 'red giant', 'blue giant'],
            'supergiant': ['supergiant', 'supergiant star', 'red supergiant', 'blue supergiant'],
            'subgiant': ['subgiant', 'subgiant branch'],
            'horizontal branch': ['horizontal branch', 'hb', 'horizontal branch star'],
            'asymptotic giant branch': ['agb', 'asymptotic giant branch', 'agb star'],
            'white dwarf': ['white dwarf', 'wd', 'degenerate dwarf', 'compact object'],
            'neutron star': ['neutron star', 'ns', 'pulsar', 'magnetar'],
            'black hole': ['black hole', 'bh', 'singularity', 'event horizon'],
            'protostar': ['protostar', 'protostellar', 'pre main sequence'],
            't tauri': ['t tauri', 'ttauri', 'pre main sequence star'],
            
            // Additional Binary Terms
            'eclipsing binary': ['eclipsing binary', 'eclipsing', 'eclipse', 'transit'],
            'spectroscopic binary': ['spectroscopic binary', 'sb', 'spectroscopic', 'radial velocity binary'],
            'visual binary': ['visual binary', 'visual pair', 'resolved binary'],
            'contact binary': ['contact binary', 'overcontact', 'merging binary'],
            'semi detached': ['semi detached', 'semi-detached', 'algol type'],
            'detached binary': ['detached binary', 'detached', 'well separated'],
            
            // Additional Exoplanet Terms
            'transit method': ['transit method', 'transit photometry', 'transit detection'],
            'radial velocity method': ['radial velocity method', 'rv method', 'doppler method', 'wobble method'],
            'microlensing': ['microlensing', 'gravitational microlensing', 'microlens'],
            'direct imaging': ['direct imaging', 'direct detection', 'coronagraph'],
            'habitable zone': ['habitable zone', 'hz', 'goldilocks zone', 'circumstellar habitable zone'],
            'insolation': ['insolation', 'stellar flux', 'irradiance', 'incident flux'],
            
            // Additional Cosmology Terms
            'scale factor': ['scale factor', 'a', 'cosmic scale', 'expansion factor'],
            'redshift z': ['redshift z', 'z', 'cosmological redshift', 'cosmic z'],
            'reionization': ['reionization', 'reionisation', 'epoch of reionization'],
            'dark age': ['dark age', 'dark ages', 'cosmic dark age'],
            'big bang': ['big bang', 'bb', 'big bang theory', 'cosmological model'],
            'inflation': ['inflation', 'cosmic inflation', 'inflationary epoch'],
            'baryon acoustic oscillations': ['bao', 'baryon acoustic oscillations', 'acoustic peaks'],
            'cmb anisotropy': ['cmb anisotropy', 'cmb fluctuations', 'cosmic microwave background'],
            
            // Additional Relativity Terms
            'general relativity': ['general relativity', 'gr', 'einstein', 'general theory'],
            'special relativity': ['special relativity', 'sr', 'lorentz', 'special theory'],
            'spacetime': ['spacetime', 'space time', 'space-time', 'four dimensional'],
            'metric': ['metric', 'spacetime metric', 'metric tensor'],
            'geodesic': ['geodesic', 'geodesic path', 'straightest path'],
            'gravitational wave': ['gravitational wave', 'gw', 'gravitational radiation', 'ripple'],
            'frame dragging': ['frame dragging', 'lense thirring', 'gravitomagnetism'],
            
            // Additional Optics Terms
            'diffraction': ['diffraction', 'diffraction limit', 'airy disk', 'airy pattern'],
            'rayleigh criterion': ['rayleigh criterion', 'rayleigh limit', 'resolution limit'],
            'dawes limit': ['dawes limit', 'dawes', 'visual resolution'],
            'seeing': ['seeing', 'atmospheric seeing', 'seeing disk', 'turbulence'],
            'adaptive optics': ['adaptive optics', 'ao', 'wavefront correction'],
            'interferometry': ['interferometry', 'interferometer', 'baseline', 'vlbi'],
            
            // Additional Spectroscopy Terms
            'doppler broadening': ['doppler broadening', 'thermal broadening', 'line broadening'],
            'natural broadening': ['natural broadening', 'natural width', 'intrinsic width'],
            'pressure broadening': ['pressure broadening', 'collisional broadening', 'stark broadening'],
            'rotational broadening': ['rotational broadening', 'v sin i', 'vsini'],
            'zeeman effect': ['zeeman effect', 'zeeman', 'magnetic splitting'],
            'fine structure': ['fine structure', 'fine structure splitting', 'fs'],
            'hyperfine structure': ['hyperfine structure', 'hfs', 'hyperfine'],
            
            // Additional High Energy Terms
            'inverse compton': ['inverse compton', 'ics', 'inverse compton scattering'],
            'compton scattering': ['compton scattering', 'compton', 'compton effect'],
            'synchrotron self absorption': ['ssa', 'synchrotron self absorption', 'self absorption'],
            'cooling break': ['cooling break', 'cooling frequency', 'break frequency'],
            'maxwellian': ['maxwellian', 'maxwell distribution', 'thermal distribution'],
            'power law distribution': ['power law distribution', 'non thermal', 'nonthermal'],
            
            // Additional Planetary Terms
            'roche lobe': ['roche lobe', 'roche radius', 'critical radius'],
            'hill sphere': ['hill sphere', 'roche sphere', 'gravitational sphere'],
            'libration': ['libration', 'librational motion', 'tadpole orbit'],
            'resonance': ['resonance', 'orbital resonance', 'mean motion resonance'],
            'tidal heating': ['tidal heating', 'tidal dissipation', 'tidal friction'],
            'obliquity': ['obliquity', 'axial tilt', 'inclination'],
            
            // Additional Stellar Structure Terms
            'hydrostatic equilibrium': ['hydrostatic equilibrium', 'hse', 'pressure balance'],
            'virial theorem': ['virial theorem', 'virial', 'energy balance'],
            'lane emden': ['lane emden', 'polytrope', 'polytropic'],
            'convection': ['convection', 'convective', 'convective zone'],
            'radiation zone': ['radiation zone', 'radiative zone', 'radiative transfer'],
            'opacity': ['opacity', 'κ', 'kappa', 'absorption coefficient'],
            
            // Additional Magnitude Terms
            'bolometric magnitude': ['bolometric magnitude', 'mbol', 'total magnitude'],
            'visual magnitude': ['visual magnitude', 'mv', 'v magnitude'],
            'photometric magnitude': ['photometric magnitude', 'photometry', 'magnitude system'],
            'color magnitude diagram': ['cmd', 'color magnitude diagram', 'cm diagram'],
            'isochrone': ['isochrone', 'isochrones', 'stellar isochrone'],
            
            // Additional Variable Star Terms
            'cepheid': ['cepheid', 'cepheid variable', 'classical cepheid'],
            'rr lyrae': ['rr lyrae', 'rr lyrae variable', 'rr lyr'],
            'mira': ['mira', 'mira variable', 'long period variable'],
            'delta scuti': ['delta scuti', 'δ scuti', 'dscuti'],
            'beta cephei': ['beta cephei', 'β cephei', 'bcephei'],
            'pulsation': ['pulsation', 'pulsating', 'radial pulsation'],
            
            // Additional Distance Ladder Terms
            'distance ladder': ['distance ladder', 'cosmic distance ladder', 'distance scale'],
            'standard candle': ['standard candle', 'standard candles', 'calibrated candle'],
            'standard ruler': ['standard ruler', 'standard rulers', 'geometric distance'],
            'parallax method': ['parallax method', 'trigonometric parallax', 'geometric parallax'],
            'main sequence fitting': ['main sequence fitting', 'ms fitting', 'cluster distance'],
            'tip of the red giant branch': ['trgb', 'tip of the red giant branch', 'trgb distance'],
            
            // Additional Motion & Dynamics Terms
            'momentum': ['momentum', 'p', 'linear momentum', 'angular momentum'],
            'force': ['force', 'f', 'gravitational force', 'centripetal force'],
            'angular frequency': ['angular frequency', 'omega', 'ω', 'angular speed'],
            'orbital elements': ['orbital elements', 'keplerian elements', 'orbital parameters'],
            'eccentricity': ['eccentricity', 'e', 'orbit shape', 'ellipticity'],
            'inclination': ['inclination', 'i', 'orbital inclination', 'tilt'],
            'argument of periapsis': ['argument of periapsis', 'omega', 'ω', 'argument of perihelion'],
            'longitude of ascending node': ['longitude of ascending node', 'omega', 'Ω', 'node'],
            'true anomaly': ['true anomaly', 'nu', 'ν', 'orbital position'],
            'mean anomaly': ['mean anomaly', 'm', 'orbital phase'],
            'eccentric anomaly': ['eccentric anomaly', 'e', 'orbital angle'],
            
            // Additional Stellar Physics Terms
            'stellar evolution': ['stellar evolution', 'star evolution', 'stellar life cycle'],
            'nucleosynthesis': ['nucleosynthesis', 'fusion', 'nuclear fusion', 'stellar fusion'],
            'proton proton chain': ['pp chain', 'proton proton chain', 'pp cycle'],
            'cno cycle': ['cno cycle', 'carbon nitrogen oxygen', 'cno fusion'],
            'triple alpha': ['triple alpha', '3α', 'helium burning'],
            'main sequence turnoff': ['main sequence turnoff', 'turnoff point', 'ms turnoff'],
            'red clump': ['red clump', 'rc', 'horizontal branch clump'],
            'planetary nebula': ['planetary nebula', 'pn', 'nebula'],
            'supernova type': ['supernova type', 'type ia', 'type ii', 'sn type'],
            'nova': ['nova', 'classical nova', 'dwarf nova'],
            'x ray binary': ['x ray binary', 'xrb', 'x ray source'],
            'accretion disk': ['accretion disk', 'accretion', 'disk'],
            'eddington luminosity': ['eddington luminosity', 'eddington limit', 'radiation pressure limit'],
            'schwarzschild metric': ['schwarzschild metric', 'schwarzschild solution', 'black hole metric'],
            'kerr metric': ['kerr metric', 'rotating black hole', 'kerr solution'],
            
            // Additional Cosmological Terms
            'de sitter': ['de sitter', 'de sitter space', 'exponential expansion'],
            'friedmann robertson walker': ['frw', 'friedmann robertson walker', 'frw metric'],
            'comoving coordinates': ['comoving coordinates', 'comoving frame', 'comoving'],
            'proper time': ['proper time', 'tau', 'τ', 'cosmic time'],
            'conformal time': ['conformal time', 'eta', 'η', 'conformal'],
            'particle horizon': ['particle horizon', 'cosmic horizon', 'observable universe'],
            'apparent horizon': ['apparent horizon', 'trapped surface'],
            'cosmic variance': ['cosmic variance', 'sample variance', 'cosmological variance'],
            'baryon acoustic scale': ['bao scale', 'baryon acoustic scale', 'sound horizon'],
            'last scattering': ['last scattering', 'recombination', 'cmb last scattering'],
            'decoupling': ['decoupling', 'photon decoupling', 'matter radiation decoupling'],
            
            // Additional Spectroscopy Terms
            'line profile': ['line profile', 'spectral line profile', 'line shape'],
            'gaussian profile': ['gaussian profile', 'gaussian line', 'thermal broadening'],
            'lorentzian profile': ['lorentzian profile', 'lorentzian line', 'natural broadening'],
            'voigt profile': ['voigt profile', 'voigt line', 'combined profile'],
            'full width half maximum': ['fwhm', 'full width half maximum', 'line width'],
            'radial velocity curve': ['radial velocity curve', 'rv curve', 'velocity curve'],
            'orbital solution': ['orbital solution', 'keplerian fit', 'orbit fit'],
            'mass function': ['mass function', 'binary mass function', 'minimum mass'],
            'spectral classification': ['spectral classification', 'spectral type', 'mk classification'],
            'luminosity class': ['luminosity class', 'yerkes classification', 'mk class'],
            'saha equation': ['saha equation', 'ionization equilibrium', 'saha'],
            'boltzmann distribution': ['boltzmann distribution', 'maxwell boltzmann', 'thermal distribution'],
            
            // Additional Exoplanet Detection Terms
            'transit depth': ['transit depth', 'delta', 'δ', 'dip'],
            'transit duration': ['transit duration', 'transit time', 'eclipse duration'],
            'impact parameter': ['impact parameter', 'b', 'transit geometry'],
            'limb darkening': ['limb darkening', 'u', 'stellar limb'],
            'rossiter mclaughlin': ['rossiter mclaughlin', 'rm effect', 'spin orbit'],
            'doppler beaming': ['doppler beaming', 'relativistic beaming', 'beaming'],
            'ellipsoidal variation': ['ellipsoidal variation', 'tidal distortion', 'ellipsoidal'],
            'reflection modulation': ['reflection modulation', 'phase curve', 'albedo variation'],
            'secondary eclipse': ['secondary eclipse', 'occultation', 'planet eclipse'],
            'atmospheric transmission': ['atmospheric transmission', 'transmission spectrum', 'atmosphere'],
            'emission spectrum': ['emission spectrum', 'thermal emission', 'planet emission'],
            
            // Additional High Energy Terms
            'compton y parameter': ['compton y', 'y parameter', 'comptonization'],
            'synchrotron self compton': ['ssc', 'synchrotron self compton', 'ssc scattering'],
            'inverse compton scattering': ['ics', 'inverse compton', 'compton upscattering'],
            'thomson scattering': ['thomson scattering', 'thomson', 'electron scattering'],
            'klein nishina': ['klein nishina', 'kn scattering', 'relativistic scattering'],
            'bremsstrahlung': ['bremsstrahlung', 'free free', 'thermal bremsstrahlung'],
            'pair production': ['pair production', 'gamma gamma', 'pair creation'],
            'photoionization': ['photoionization', 'photoion', 'ionization'],
            'photodisintegration': ['photodisintegration', 'photodissociation', 'nuclear breakup'],
            'hadronic interaction': ['hadronic', 'proton proton', 'pp interaction'],
            'pion decay': ['pion decay', 'pi decay', 'neutral pion'],
            'gamma ray attenuation': ['gamma ray attenuation', 'gamma absorption', 'pair opacity'],
            
            // Additional Relativistic Terms
            'proper distance': ['proper distance', 'physical distance', 'comoving distance'],
            'comoving volume': ['comoving volume', 'comoving', 'volume element'],
            'redshift space distortion': ['rsd', 'redshift space distortion', 'peculiar velocity'],
            'peculiar velocity': ['peculiar velocity', 'peculiar motion', 'local motion'],
            'hubble flow': ['hubble flow', 'hubble expansion', 'cosmic flow'],
            'virial mass': ['virial mass', 'virial theorem', 'dynamical mass'],
            'toomre q': ['toomre q', 'toomre parameter', 'disk stability'],
            'spiral density wave': ['spiral density wave', 'density wave theory', 'spiral arm'],
            
            // Additional Planetary Terms
            'libration point': ['libration point', 'lagrange point', 'l point'],
            'trojan asteroid': ['trojan', 'trojan asteroid', 'lagrange point asteroid'],
            'secular resonance': ['secular resonance', 'long term resonance', 'apsidal resonance'],
            'chaos': ['chaos', 'chaotic motion', 'orbital chaos'],
            'kirkwood gap': ['kirkwood gap', 'resonance gap', 'asteroid gap'],
            'yarkovsky effect': ['yarkovsky effect', 'yarkovsky', 'thermal force'],
            'yorp effect': ['yorp effect', 'yorp', 'radiation torque'],
            'poynting robertson': ['poynting robertson', 'pr drag', 'radiation drag'],
            
            // Additional Stellar Structure Terms
            'lane emden equation': ['lane emden', 'polytrope', 'polytropic equation'],
            'emden function': ['emden function', 'polytropic function', 'stellar structure'],
            'isothermal sphere': ['isothermal sphere', 'isothermal', 'constant temperature'],
            'plummer model': ['plummer model', 'plummer sphere', 'softened potential'],
            'king model': ['king model', 'king profile', 'truncated isothermal'],
            'hernquist profile': ['hernquist profile', 'hernquist model', 'galaxy profile'],
            'nfw profile': ['nfw', 'navarro frenk white', 'nfw halo'],
            'einasto profile': ['einasto profile', 'einasto', 'alpha profile'],
            
            // Additional Magnitude & Photometry Terms
            'extinction': ['extinction', 'a', 'interstellar extinction', 'dust'],
            'reddening': ['reddening', 'e', 'color excess', 'b v'],
            'selective extinction': ['selective extinction', 'r', 'rv', 'extinction law'],
            'cardelli law': ['cardelli law', 'cardelli', 'extinction curve'],
            'k correction': ['k correction', 'k correction', 'redshift correction'],
            'surface brightness': ['surface brightness', 'mu', 'μ', 'brightness per area'],
            'surface brightness fluctuation': ['sbf', 'surface brightness fluctuation', 'distance indicator'],
            
            // Additional Binary & Multiple System Terms
            'mass ratio': ['mass ratio', 'q', 'binary mass ratio'],
            'orbital separation': ['orbital separation', 'a', 'semi major axis', 'binary separation'],
            'common envelope': ['common envelope', 'ce', 'envelope ejection'],
            'mass transfer': ['mass transfer', 'accretion', 'roche lobe overflow'],
            'conservative mass transfer': ['conservative', 'mass conservation', 'stable transfer'],
            'non conservative': ['non conservative', 'mass loss', 'wind'],
            'thermal timescale': ['thermal timescale', 'kelvin helmholtz', 'kh timescale'],
            'dynamical timescale': ['dynamical timescale', 'free fall', 'crossing time'],
            'nuclear timescale': ['nuclear timescale', 'fusion timescale', 'burning time'],
            'merger product': ['merger product', 'merged star', 'coalescence product'],
            
            // Additional Variable Star Terms
            'period luminosity': ['period luminosity', 'pl relation', 'cepheid pl'],
            'leavitt law': ['leavitt law', 'cepheid relation', 'period luminosity'],
            'wesenheit function': ['wesenheit function', 'wesenheit', 'reddening free'],
            'fourier decomposition': ['fourier decomposition', 'fourier', 'light curve analysis'],
            'o c diagram': ['o c diagram', 'observed calculated', 'period change'],
            'blazhko effect': ['blazhko effect', 'blazhko', 'modulation'],
            'double mode': ['double mode', 'beat cepheid', 'multimode'],
            'radial mode': ['radial mode', 'fundamental mode', 'first overtone'],
            'non radial': ['non radial', 'g mode', 'p mode'],
            
            // Additional Distance Measurement Terms
            'spectroscopic parallax': ['spectroscopic parallax', 'spectroscopic distance', 'hr distance'],
            'moving cluster': ['moving cluster', 'convergent point', 'cluster parallax'],
            'statistical parallax': ['statistical parallax', 'secular parallax', 'proper motion'],
            'barycentric parallax': ['barycentric parallax', 'solar parallax', 'au'],
            'dynamical parallax': ['dynamical parallax', 'binary parallax', 'orbital parallax'],
            'expansion parallax': ['expansion parallax', 'nebular parallax', 'pn parallax'],
            'light echo': ['light echo', 'echo', 'reflected light'],
            'reverberation mapping': ['reverberation mapping', 'reverberation', 'echo mapping'],
            
            // Additional Cosmological Distance Terms
            'transverse comoving': ['transverse comoving', 'dm', 'angular distance'],
            'light travel distance': ['light travel distance', 'lookback distance', 'light cone'],
            'particle horizon distance': ['particle horizon', 'horizon distance', 'causal horizon'],
            'event horizon distance': ['event horizon distance', 'future horizon', 'cosmic horizon'],
            
            // Additional Stellar Classification Terms
            'metallicity': ['metallicity', 'z', '[fe h]', 'metal abundance'],
            'alpha enhancement': ['alpha enhancement', '[α fe]', 'alpha elements'],
            'carbon enhancement': ['carbon enhancement', '[c fe]', 'carbon star'],
            's process': ['s process', 'slow neutron', 's process element'],
            'r process': ['r process', 'rapid neutron', 'r process element'],
            'p process': ['p process', 'proton capture', 'p nuclide'],
            
            // Additional Telescope & Instrumentation Terms
            'point spread function': ['psf', 'point spread function', 'seeing profile'],
            'strehl ratio': ['strehl ratio', 'image quality', 'adaptive optics'],
            'contrast ratio': ['contrast ratio', 'dynamic range', 'detection limit'],
            'signal to noise': ['snr', 'signal to noise', 's n ratio'],
            'integration time': ['integration time', 'exposure time', 'integration'],
            'read noise': ['read noise', 'detector noise', 'readout noise'],
            'dark current': ['dark current', 'dark signal', 'thermal noise'],
            'quantum efficiency': ['qe', 'quantum efficiency', 'detector efficiency'],
            'full well capacity': ['full well', 'saturation', 'well depth'],
            
            // Additional Observational Terms
            'airmass': ['airmass', 'sec z', 'atmospheric path'],
            'extinction coefficient': ['extinction coefficient', 'k', 'atmospheric extinction'],
            'scintillation': ['scintillation', 'twinkling', 'atmospheric scintillation'],
            'differential photometry': ['differential photometry', 'relative photometry', 'comparison'],
            'all sky photometry': ['all sky', 'absolute photometry', 'standard'],
            'photometric system': ['photometric system', 'ubv', 'johnson', 'cousins'],
            'color transformation': ['color transformation', 'color term', 'photometric transformation'],
            'standard star': ['standard star', 'photometric standard', 'calibration'],
            'flat field': ['flat field', 'flat', 'illumination correction'],
            
            // Additional Data Analysis Terms
            'chi squared': ['chi squared', 'χ²', 'goodness of fit', 'chisq'],
            'reduced chi squared': ['reduced chi squared', 'reduced χ²', 'chi squared nu'],
            'maximum likelihood': ['maximum likelihood', 'ml', 'likelihood'],
            'bayesian': ['bayesian', 'bayes', 'posterior', 'prior'],
            'markov chain monte carlo': ['mcmc', 'markov chain', 'monte carlo'],
            'parameter estimation': ['parameter estimation', 'fitting', 'optimization'],
            'uncertainty': ['uncertainty', 'error', 'sigma', 'confidence'],
            'systematic error': ['systematic error', 'bias', 'systematic'],
            'random error': ['random error', 'statistical error', 'noise'],
            'propagation of errors': ['error propagation', 'uncertainty propagation', 'error analysis']
        };
        
        // Match concepts with improved accuracy (word boundary matching)
        for (const [concept, synonyms] of Object.entries(physicsTerms)) {
            for (const syn of synonyms) {
                const synLower = syn.toLowerCase();
                // Exact match (highest priority)
                if (searchLower === synLower) {
                    result.concepts.push(concept);
                    break;
                }
                // Word boundary match (better accuracy)
                const wordBoundaryRegex = new RegExp(`\\b${synLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                if (wordBoundaryRegex.test(searchLower)) {
                    result.concepts.push(concept);
                    break;
                }
                // Partial match (lower priority, but still valid)
                if (searchLower.includes(synLower) && synLower.length >= 3) {
                    result.concepts.push(concept);
                    break;
                }
            }
        }
        
        // Remove duplicate concepts
        result.concepts = [...new Set(result.concepts)];
        
        // Extract variable symbols mentioned
        const allVarSymbols = new Set();
        formulas.forEach(f => {
            f.variables.forEach(v => {
                allVarSymbols.add(v.symbol.toLowerCase());
                allVarSymbols.add(v.name.toLowerCase());
            });
        });
        
        allVarSymbols.forEach(symbol => {
            if (searchLower.includes(symbol) || searchWords.includes(symbol)) {
                result.variables.push(symbol);
            }
        });
        
        return result;
    }
    
    // Match question to formula using semantic understanding
    function matchQuestionToFormula(formula, parsedQuery, searchLower, searchWords) {
        let score = 0;
        let reason = '';
        const formulaId = formula.id;
        const nameLower = formula.name.toLowerCase();
        const descLower = formula.description.toLowerCase();
        
        // Question-to-formula mapping based on common questions
        const questionPatterns = {
            // Velocity questions
            'how fast': {
                formulas: ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                score: 400
            },
            'what is the velocity': {
                formulas: ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                score: 400
            },
            'calculate velocity': {
                formulas: ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                score: 400
            },
            
            // Distance questions
            'how far': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 400
            },
            'what is the distance': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 400
            },
            'find distance': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 400
            },
            
            // Period questions
            'how long': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'stellar_lifetime', 'synodic_period'],
                score: 400
            },
            'what is the period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'synodic_period'],
                score: 400
            },
            'orbital period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                score: 500
            },
            
            // Temperature questions
            'what is the temperature': {
                formulas: ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature'],
                score: 400
            },
            'how hot': {
                formulas: ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature'],
                score: 400
            },
            'temperature of': {
                formulas: ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature'],
                score: 350
            },
            
            // Brightness/Luminosity questions
            'how bright': {
                formulas: ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation'],
                score: 400
            },
            'what is the luminosity': {
                formulas: ['luminosity', 'flux_from_luminosity'],
                score: 400
            },
            'brightness': {
                formulas: ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation'],
                score: 350
            },
            
            // Mass questions
            'what is the mass': {
                formulas: ['chandrasekhar_limit', 'jeans_mass', 'center_of_mass'],
                score: 400
            },
            'how much mass': {
                formulas: ['chandrasekhar_limit', 'jeans_mass'],
                score: 400
            },
            
            // Gravity questions
            'what is the gravity': {
                formulas: ['surface_gravity', 'escape_velocity'],
                score: 400
            },
            'surface gravity': {
                formulas: ['surface_gravity'],
                score: 500
            },
            
            // Escape questions
            'escape': {
                formulas: ['escape_velocity'],
                score: 500
            },
            'leave planet': {
                formulas: ['escape_velocity'],
                score: 500
            },
            
            // Redshift questions
            'redshift': {
                formulas: ['cosmic_redshift', 'doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            'doppler': {
                formulas: ['doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            
            // Wavelength questions
            'wavelength': {
                formulas: ['wiens_law', 'planck_relation', 'doppler_shift'],
                score: 400
            },
            'peak wavelength': {
                formulas: ['wiens_law'],
                score: 600
            },
            
            // Energy questions
            'energy': {
                formulas: ['orbital_energy', 'planck_relation'],
                score: 350
            },
            'photon energy': {
                formulas: ['planck_relation'],
                score: 600
            },
            
            // Size/Radius questions
            'how big': {
                formulas: ['angular_size', 'angular_diameter_distance'],
                score: 400
            },
            'what is the size': {
                formulas: ['angular_size', 'angular_diameter_distance'],
                score: 400
            },
            'angular size': {
                formulas: ['angular_size', 'angular_diameter_distance'],
                score: 500
            },
            
            // Magnitude questions
            'what is the magnitude': {
                formulas: ['distance_modulus', 'hr_absolute_magnitude', 'magnitude_flux_relation'],
                score: 400
            },
            'apparent magnitude': {
                formulas: ['distance_modulus', 'magnitude_flux_relation'],
                score: 500
            },
            'absolute magnitude': {
                formulas: ['distance_modulus', 'hr_absolute_magnitude'],
                score: 500
            },
            
            // Lifetime questions
            'how long does a star live': {
                formulas: ['stellar_lifetime'],
                score: 600
            },
            'stellar lifetime': {
                formulas: ['stellar_lifetime'],
                score: 500
            },
            'main sequence lifetime': {
                formulas: ['stellar_lifetime'],
                score: 600
            },
            
            // Density questions
            'what is the density': {
                formulas: ['average_density', 'critical_density', 'density_parameter'],
                score: 400
            },
            'average density': {
                formulas: ['average_density'],
                score: 500
            },
            
            // Flux questions
            'what is the flux': {
                formulas: ['flux_from_luminosity', 'flux_temperature', 'inverse_square_law_brightness'],
                score: 400
            },
            'observed flux': {
                formulas: ['flux_from_luminosity', 'inverse_square_law_brightness'],
                score: 500
            },
            
            // Radius questions
            'what is the radius': {
                formulas: ['schwarzschild_radius', 'white_dwarf_mass_radius', 'hill_radius'],
                score: 400
            },
            'schwarzschild radius': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            'event horizon': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            
            // Orbital mechanics questions
            'how to find orbital period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 600
            },
            'calculate orbital period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 500
            },
            
            // Specific use case questions
            'how to find distance to star': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 600
            },
            'distance to star': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 500
            },
            'how to find star distance': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 600
            },
            
            'how to calculate temperature from wavelength': {
                formulas: ['wiens_law'],
                score: 600
            },
            'temperature from wavelength': {
                formulas: ['wiens_law'],
                score: 500
            },
            
            'how to find luminosity from flux': {
                formulas: ['flux_from_luminosity'],
                score: 600
            },
            'luminosity from flux': {
                formulas: ['flux_from_luminosity'],
                score: 500
            },
            
            // Kepler's Law questions
            'kepler third law': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                score: 600
            },
            'kepler 3': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                score: 600
            },
            'period squared': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 500
            },
            'p2 a3': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar'],
                score: 600
            },
            
            // Tidal questions
            'tidal force': {
                formulas: ['tidal_force', 'roche_limit'],
                score: 500
            },
            'roche limit': {
                formulas: ['roche_limit'],
                score: 600
            },
            'tidal disruption': {
                formulas: ['roche_limit', 'tidal_force'],
                score: 500
            },
            'tidal locking': {
                formulas: ['tidal_locking_timescale'],
                score: 600
            },
            
            // Binary system questions
            'binary star': {
                formulas: ['kepler_third_law_binary', 'binary_white_dwarf', 'center_of_mass'],
                score: 500
            },
            'binary system': {
                formulas: ['kepler_third_law_binary', 'binary_white_dwarf', 'center_of_mass'],
                score: 500
            },
            'white dwarf binary': {
                formulas: ['binary_white_dwarf', 'white_dwarf_orbital_decay', 'white_dwarf_merger_timescale'],
                score: 600
            },
            'orbital decay': {
                formulas: ['white_dwarf_orbital_decay'],
                score: 600
            },
            'merger timescale': {
                formulas: ['white_dwarf_merger_timescale'],
                score: 600
            },
            
            // Spectroscopy questions
            'equivalent width': {
                formulas: ['equivalent_width'],
                score: 600
            },
            'line strength': {
                formulas: ['equivalent_width'],
                score: 500
            },
            'absorption line': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 400
            },
            'spectral line': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 400
            },
            
            // Exoplanet questions
            'exoplanet temperature': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 600
            },
            'planet temperature': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 500
            },
            'transit depth': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 400
            },
            'albedo': {
                formulas: ['albedo'],
                score: 600
            },
            'greenhouse effect': {
                formulas: ['greenhouse_effect'],
                score: 600
            },
            
            // High energy questions
            'synchrotron': {
                formulas: ['synchrotron_power', 'synchrotron_cooling_timescale', 'magnetic_energy_density'],
                score: 500
            },
            'synchrotron cooling': {
                formulas: ['synchrotron_cooling_timescale'],
                score: 600
            },
            'synchrotron power': {
                formulas: ['synchrotron_power'],
                score: 600
            },
            'magnetic field': {
                formulas: ['magnetic_energy_density', 'synchrotron_power'],
                score: 500
            },
            'power law spectrum': {
                formulas: ['power_law_spectrum', 'spectral_index'],
                score: 600
            },
            'spectral index': {
                formulas: ['spectral_index', 'power_law_spectrum'],
                score: 600
            },
            'gamma ray': {
                formulas: ['max_gamma_bohm', 'cooling_break_gamma'],
                score: 500
            },
            
            // Relativity questions
            'event horizon': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            'black hole size': {
                formulas: ['schwarzschild_radius'],
                score: 600
            },
            'gravitational lensing': {
                formulas: ['einstein_radius'],
                score: 600
            },
            'lensing': {
                formulas: ['einstein_radius'],
                score: 500
            },
            'einstein ring': {
                formulas: ['einstein_radius'],
                score: 600
            },
            'time dilation': {
                formulas: ['time_dilation'],
                score: 600
            },
            'length contraction': {
                formulas: ['length_contraction'],
                score: 600
            },
            
            // Cosmology questions
            'hubble constant': {
                formulas: ['hubble_law', 'cosmic_redshift'],
                score: 600
            },
            'hubble law': {
                formulas: ['hubble_law'],
                score: 600
            },
            'universe expansion': {
                formulas: ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                score: 500
            },
            'critical density': {
                formulas: ['critical_density', 'density_parameter'],
                score: 500
            },
            'density parameter': {
                formulas: ['density_parameter', 'critical_density'],
                score: 600
            },
            'lookback time': {
                formulas: ['lookback_time'],
                score: 600
            },
            'friedmann equation': {
                formulas: ['friedmann_equation'],
                score: 600
            },
            
            // Telescope questions
            'angular resolution': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'resolving power': {
                formulas: ['angular_resolution'],
                score: 500
            },
            'light gathering power': {
                formulas: ['light_gathering_power'],
                score: 600
            },
            'telescope aperture': {
                formulas: ['light_gathering_power', 'angular_resolution'],
                score: 500
            },
            'f ratio': {
                formulas: ['f_ratio'],
                score: 600
            },
            'focal ratio': {
                formulas: ['f_ratio'],
                score: 500
            },
            'magnification': {
                formulas: ['magnification'],
                score: 600
            },
            
            // Stellar structure questions
            'hydrostatic equilibrium': {
                formulas: ['hydrostatic_balance'],
                score: 600
            },
            'pressure balance': {
                formulas: ['hydrostatic_balance'],
                score: 500
            },
            
            // HR Diagram questions
            'hr diagram': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 500
            },
            'color index': {
                formulas: ['hr_color_index'],
                score: 600
            },
            'b-v': {
                formulas: ['hr_color_index'],
                score: 600
            },
            'hertzsprung russell': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 500
            },
            
            // Mass-Luminosity questions
            'mass luminosity relation': {
                formulas: ['mass_luminosity_relation'],
                score: 600
            },
            'ml relation': {
                formulas: ['mass_luminosity_relation'],
                score: 600
            },
            
            // Distance measurement questions
            'distance modulus': {
                formulas: ['distance_modulus'],
                score: 600
            },
            'photometric distance': {
                formulas: ['distance_modulus', 'luminosity_distance'],
                score: 500
            },
            'standard candle': {
                formulas: ['luminosity_distance', 'distance_modulus'],
                score: 500
            },
            'flux distance': {
                formulas: ['luminosity_distance'],
                score: 500
            },
            
            // Angular momentum questions
            'angular momentum': {
                formulas: ['angular_momentum_elliptical'],
                score: 600
            },
            'elliptical orbit': {
                formulas: ['angular_momentum_elliptical', 'kepler_third_law'],
                score: 500
            },
            
            // Hill radius questions
            'hill radius': {
                formulas: ['hill_radius'],
                score: 600
            },
            'sphere of influence': {
                formulas: ['hill_radius'],
                score: 600
            },
            
            // Synodic period questions
            'synodic period': {
                formulas: ['synodic_period'],
                score: 600
            },
            'apparent period': {
                formulas: ['synodic_period'],
                score: 500
            },
            
            // Jeans mass questions
            'jeans mass': {
                formulas: ['jeans_mass'],
                score: 600
            },
            'gravitational collapse': {
                formulas: ['jeans_mass'],
                score: 500
            },
            
            // Center of mass questions
            'center of mass': {
                formulas: ['center_of_mass'],
                score: 600
            },
            'barycenter': {
                formulas: ['center_of_mass'],
                score: 600
            },
            
            // White dwarf questions
            'white dwarf radius': {
                formulas: ['white_dwarf_mass_radius'],
                score: 600
            },
            'white dwarf mass': {
                formulas: ['white_dwarf_mass_radius', 'chandrasekhar_limit'],
                score: 500
            },
            'chandrasekhar': {
                formulas: ['chandrasekhar_limit'],
                score: 600
            },
            
            // Wien's Law questions
            'wien law': {
                formulas: ['wiens_law'],
                score: 600
            },
            'wien displacement': {
                formulas: ['wiens_law'],
                score: 600
            },
            'temperature from peak wavelength': {
                formulas: ['wiens_law'],
                score: 600
            },
            
            // Planck questions
            'planck relation': {
                formulas: ['planck_relation'],
                score: 600
            },
            'photon energy from wavelength': {
                formulas: ['planck_relation'],
                score: 600
            },
            
            // Inverse square law questions
            'inverse square law': {
                formulas: ['inverse_square_law_brightness', 'flux_from_luminosity'],
                score: 500
            },
            'brightness distance': {
                formulas: ['inverse_square_law_brightness'],
                score: 500
            },
            
            // Luminosity function questions
            'luminosity function': {
                formulas: ['luminosity_function'],
                score: 600
            },
            
            // Vis viva questions
            'vis viva': {
                formulas: ['vis_viva'],
                score: 600
            },
            'orbital energy': {
                formulas: ['orbital_energy', 'vis_viva'],
                score: 500
            },
            
            // Parsec and distance unit questions
            'parsec': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec'],
                score: 500
            },
            'light year': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                score: 400
            },
            'astronomical unit': {
                formulas: ['kepler_third_law', 'orbital_velocity'],
                score: 400
            },
            
            // Stellar evolution questions
            'main sequence star': {
                formulas: ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                score: 500
            },
            'giant star': {
                formulas: ['hr_absolute_magnitude', 'luminosity'],
                score: 400
            },
            'white dwarf mass': {
                formulas: ['white_dwarf_mass_radius', 'chandrasekhar_limit'],
                score: 600
            },
            'neutron star': {
                formulas: ['schwarzschild_radius'],
                score: 400
            },
            'black hole mass': {
                formulas: ['schwarzschild_radius'],
                score: 500
            },
            
            // Binary system specific questions
            'eclipsing binary': {
                formulas: ['binary_white_dwarf', 'kepler_third_law_binary'],
                score: 500
            },
            'spectroscopic binary': {
                formulas: ['doppler_shift', 'kepler_third_law_binary'],
                score: 500
            },
            'contact binary': {
                formulas: ['binary_white_dwarf', 'white_dwarf_merger_timescale'],
                score: 600
            },
            
            // Exoplanet detection questions
            'transit method': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 400
            },
            'radial velocity method': {
                formulas: ['doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            'habitable zone': {
                formulas: ['planetary_equilibrium_temperature', 'flux_temperature'],
                score: 500
            },
            'exoplanet detection': {
                formulas: ['doppler_shift', 'planetary_equilibrium_temperature'],
                score: 400
            },
            
            // Cosmology specific questions
            'scale factor': {
                formulas: ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                score: 500
            },
            'universe age': {
                formulas: ['hubble_law', 'lookback_time'],
                score: 500
            },
            'cosmic expansion': {
                formulas: ['hubble_law', 'cosmic_redshift', 'friedmann_equation'],
                score: 500
            },
            'dark matter': {
                formulas: ['critical_density', 'density_parameter'],
                score: 400
            },
            'dark energy': {
                formulas: ['critical_density', 'density_parameter', 'friedmann_equation'],
                score: 400
            },
            
            // Relativity specific questions
            'general relativity': {
                formulas: ['schwarzschild_radius', 'einstein_radius', 'time_dilation', 'length_contraction'],
                score: 400
            },
            'gravitational waves': {
                formulas: ['schwarzschild_radius', 'einstein_radius'],
                score: 400
            },
            'spacetime curvature': {
                formulas: ['einstein_radius', 'schwarzschild_radius'],
                score: 500
            },
            
            // Optics specific questions
            'diffraction limit': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'rayleigh criterion': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'seeing limit': {
                formulas: ['angular_resolution'],
                score: 500
            },
            'telescope resolution': {
                formulas: ['angular_resolution'],
                score: 600
            },
            'aperture size': {
                formulas: ['light_gathering_power', 'angular_resolution'],
                score: 500
            },
            
            // Spectroscopy specific questions
            'line broadening': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 500
            },
            'doppler broadening': {
                formulas: ['doppler_shift', 'doppler_shift_approx'],
                score: 500
            },
            'rotational broadening': {
                formulas: ['rotational_velocity', 'doppler_shift'],
                score: 500
            },
            'zeeman effect': {
                formulas: ['doppler_shift'],
                score: 400
            },
            
            // High energy specific questions
            'inverse compton': {
                formulas: ['synchrotron_power', 'magnetic_energy_density'],
                score: 400
            },
            'cooling break': {
                formulas: ['cooling_break_gamma', 'cooling_break_frequency'],
                score: 600
            },
            'non thermal': {
                formulas: ['power_law_spectrum', 'spectral_index'],
                score: 500
            },
            'gamma ray burst': {
                formulas: ['max_gamma_bohm', 'synchrotron_cooling_timescale'],
                score: 400
            },
            
            // Planetary specific questions
            'roche lobe': {
                formulas: ['roche_limit'],
                score: 500
            },
            'tidal heating': {
                formulas: ['tidal_force', 'tidal_locking_timescale'],
                score: 500
            },
            'orbital resonance': {
                formulas: ['kepler_third_law', 'synodic_period'],
                score: 400
            },
            'hill sphere size': {
                formulas: ['hill_radius'],
                score: 500
            },
            
            // Stellar structure specific questions
            'virial theorem': {
                formulas: ['hydrostatic_balance', 'orbital_energy'],
                score: 400
            },
            'convection': {
                formulas: ['hydrostatic_balance'],
                score: 400
            },
            'opacity': {
                formulas: ['blackbody_radiation', 'flux_temperature'],
                score: 400
            },
            
            // Magnitude system questions
            'bolometric magnitude': {
                formulas: ['hr_absolute_magnitude', 'luminosity'],
                score: 500
            },
            'color magnitude diagram': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 600
            },
            'cmd': {
                formulas: ['hr_color_index', 'hr_absolute_magnitude'],
                score: 600
            },
            'isochrone': {
                formulas: ['hr_absolute_magnitude', 'stellar_lifetime'],
                score: 400
            },
            
            // Variable star questions
            'cepheid variable': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 500
            },
            'rr lyrae variable': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 500
            },
            'mira variable': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 500
            },
            'pulsating star': {
                formulas: ['luminosity', 'stellar_lifetime'],
                score: 400
            },
            
            // Distance ladder questions
            'distance ladder': {
                formulas: ['parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 500
            },
            'standard candle distance': {
                formulas: ['distance_modulus', 'luminosity_distance'],
                score: 600
            },
            'trigonometric parallax': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec'],
                score: 600
            },
            'cluster distance': {
                formulas: ['distance_modulus', 'hr_absolute_magnitude'],
                score: 500
            },
            
            // Additional specific calculation questions
            'how to find stellar mass': {
                formulas: ['kepler_third_law', 'kepler_third_law_binary', 'mass_luminosity_relation'],
                score: 600
            },
            'calculate stellar radius': {
                formulas: ['angular_size', 'luminosity', 'flux_temperature'],
                score: 500
            },
            'find stellar temperature': {
                formulas: ['wiens_law', 'flux_temperature', 'hr_color_index'],
                score: 500
            },
            'determine stellar age': {
                formulas: ['stellar_lifetime', 'hr_absolute_magnitude'],
                score: 500
            },
            'calculate orbital elements': {
                formulas: ['kepler_third_law', 'angular_momentum_elliptical', 'vis_viva'],
                score: 500
            },
            'find exoplanet mass': {
                formulas: ['doppler_shift', 'kepler_third_law'],
                score: 500
            },
            'calculate exoplanet radius': {
                formulas: ['planetary_equilibrium_temperature', 'angular_size'],
                score: 400
            },
            'determine galaxy distance': {
                formulas: ['hubble_law', 'cosmic_redshift', 'distance_modulus'],
                score: 500
            },
            'find black hole mass': {
                formulas: ['schwarzschild_radius', 'kepler_third_law'],
                score: 500
            },
            'calculate accretion rate': {
                formulas: ['luminosity', 'flux_from_luminosity'],
                score: 400
            },
            
            // Additional question patterns for new terms
            'orbital elements': {
                formulas: ['kepler_third_law', 'angular_momentum_elliptical', 'vis_viva'],
                score: 500
            },
            'stellar evolution': {
                formulas: ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                score: 500
            },
            'nucleosynthesis': {
                formulas: ['stellar_lifetime', 'luminosity'],
                score: 400
            },
            'accretion disk': {
                formulas: ['luminosity', 'flux_from_luminosity'],
                score: 500
            },
            'eddington luminosity': {
                formulas: ['luminosity'],
                score: 600
            },
            'line profile': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 500
            },
            'fwhm': {
                formulas: ['equivalent_width', 'doppler_shift'],
                score: 500
            },
            'radial velocity curve': {
                formulas: ['doppler_shift', 'kepler_third_law_binary'],
                score: 600
            },
            'mass function': {
                formulas: ['kepler_third_law_binary', 'center_of_mass'],
                score: 600
            },
            'transit depth': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 500
            },
            'secondary eclipse': {
                formulas: ['planetary_equilibrium_temperature'],
                score: 500
            },
            'compton scattering': {
                formulas: ['synchrotron_power', 'magnetic_energy_density'],
                score: 400
            },
            'bremsstrahlung': {
                formulas: ['synchrotron_power'],
                score: 400
            },
            'lagrange point': {
                formulas: ['hill_radius', 'roche_limit'],
                score: 500
            },
            'mass transfer': {
                formulas: ['binary_white_dwarf', 'roche_limit'],
                score: 500
            },
            'period luminosity relation': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 600
            },
            'leavitt law': {
                formulas: ['distance_modulus', 'luminosity'],
                score: 600
            },
            'extinction': {
                formulas: ['distance_modulus', 'magnitude_flux_relation'],
                score: 500
            },
            'reddening': {
                formulas: ['hr_color_index', 'distance_modulus'],
                score: 500
            },
            'signal to noise': {
                formulas: ['angular_resolution', 'light_gathering_power'],
                score: 400
            },
            'psf': {
                formulas: ['angular_resolution'],
                score: 500
            },
            'chi squared': {
                formulas: ['distance_modulus', 'luminosity_distance'],
                score: 400
            },
            'uncertainty': {
                formulas: ['parallax_distance_arcsec', 'distance_modulus'],
                score: 400
            }
        };
        
        // Check question patterns
        for (const [pattern, data] of Object.entries(questionPatterns)) {
            if (searchLower.includes(pattern)) {
                if (data.formulas.includes(formulaId)) {
                    score += data.score;
                    if (!reason) {
                        reason = `Matches question pattern: "${pattern}"`;
                    }
                }
            }
        }
        
        // Concept-based matching with expanded mapping
        parsedQuery.concepts.forEach(concept => {
            // Map concepts to formula IDs with comprehensive coverage
            const conceptMap = {
                'velocity': ['orbital_velocity', 'escape_velocity', 'rotational_velocity', 'vis_viva'],
                'orbital velocity': ['orbital_velocity', 'vis_viva', 'kepler_third_law'],
                'escape velocity': ['escape_velocity'],
                'rotational velocity': ['rotational_velocity'],
                'vis viva': ['vis_viva', 'orbital_energy'],
                'distance': ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance', 'angular_diameter_distance'],
                'parallax': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'parallax distance': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'period': ['kepler_third_law', 'kepler_third_law_solar', 'synodic_period', 'rotational_velocity'],
                'orbital period': ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                'synodic period': ['synodic_period'],
                'temperature': ['wiens_law', 'flux_temperature', 'planetary_equilibrium_temperature', 'blackbody_radiation'],
                'luminosity': ['luminosity', 'flux_from_luminosity', 'hr_absolute_magnitude', 'luminosity_function'],
                'brightness': ['luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'magnitude_flux_relation'],
                'mass': ['chandrasekhar_limit', 'jeans_mass', 'center_of_mass', 'white_dwarf_mass_radius'],
                'gravity': ['surface_gravity', 'escape_velocity'],
                'escape': ['escape_velocity'],
                'redshift': ['cosmic_redshift', 'doppler_shift', 'doppler_shift_approx'],
                'wavelength': ['wiens_law', 'planck_relation', 'doppler_shift', 'blackbody_radiation'],
                'peak wavelength': ['wiens_law', 'blackbody_radiation'],
                'wien law': ['wiens_law'],
                'energy': ['orbital_energy', 'planck_relation'],
                'photon energy': ['planck_relation'],
                'radius': ['schwarzschild_radius', 'white_dwarf_mass_radius', 'hill_radius', 'angular_size'],
                'angular size': ['angular_size', 'angular_diameter_distance'],
                'magnitude': ['distance_modulus', 'hr_absolute_magnitude', 'magnitude_flux_relation'],
                'lifetime': ['stellar_lifetime'],
                'stellar lifetime': ['stellar_lifetime'],
                'density': ['average_density', 'critical_density', 'density_parameter'],
                'critical density': ['critical_density', 'density_parameter'],
                'flux': ['flux_from_luminosity', 'flux_temperature', 'inverse_square_law_brightness'],
                'kepler': ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                'kepler third law': ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
                'tidal': ['tidal_force', 'roche_limit', 'tidal_locking_timescale'],
                'tidal force': ['tidal_force', 'roche_limit'],
                'roche limit': ['roche_limit'],
                'tidal locking': ['tidal_locking_timescale'],
                'hill radius': ['hill_radius'],
                'star': ['stellar_lifetime', 'luminosity', 'hr_absolute_magnitude', 'mass_luminosity_relation'],
                'main sequence': ['stellar_lifetime', 'mass_luminosity_relation'],
                'planet': ['surface_gravity', 'average_density', 'planetary_equilibrium_temperature'],
                'exoplanet': ['planetary_equilibrium_temperature', 'albedo', 'greenhouse_effect'],
                'white dwarf': ['white_dwarf_mass_radius', 'chandrasekhar_limit', 'binary_white_dwarf', 'white_dwarf_orbital_decay', 'white_dwarf_merger_timescale'],
                'chandrasekhar limit': ['chandrasekhar_limit'],
                'hubble': ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                'hubble constant': ['hubble_law'],
                'hubble law': ['hubble_law'],
                'blackbody': ['blackbody_radiation', 'wiens_law', 'flux_temperature'],
                'doppler': ['doppler_shift', 'doppler_shift_approx', 'cosmic_redshift'],
                'spectroscopy': ['equivalent_width', 'doppler_shift'],
                'equivalent width': ['equivalent_width'],
                'absorption': ['equivalent_width'],
                'emission': ['equivalent_width'],
                'binary': ['binary_white_dwarf', 'kepler_third_law_binary', 'center_of_mass'],
                'binary star': ['kepler_third_law_binary', 'binary_white_dwarf', 'center_of_mass'],
                'orbital decay': ['white_dwarf_orbital_decay'],
                'merger': ['white_dwarf_merger_timescale'],
                'synchrotron': ['synchrotron_power', 'synchrotron_cooling_timescale', 'magnetic_energy_density'],
                'magnetic field': ['magnetic_energy_density', 'synchrotron_power'],
                'power law': ['power_law_spectrum', 'spectral_index'],
                'spectral index': ['spectral_index', 'power_law_spectrum'],
                'gamma ray': ['max_gamma_bohm', 'cooling_break_gamma'],
                'cooling': ['synchrotron_cooling_timescale'],
                'schwarzschild': ['schwarzschild_radius'],
                'event horizon': ['schwarzschild_radius'],
                'gravitational lensing': ['einstein_radius'],
                'lensing': ['einstein_radius'],
                'einstein radius': ['einstein_radius'],
                'time dilation': ['time_dilation'],
                'length contraction': ['length_contraction'],
                'lookback time': ['lookback_time'],
                'friedmann': ['friedmann_equation'],
                'angular resolution': ['angular_resolution'],
                'resolution': ['angular_resolution'],
                'light gathering': ['light_gathering_power'],
                'aperture': ['light_gathering_power', 'angular_resolution'],
                'f ratio': ['f_ratio'],
                'magnification': ['magnification'],
                'hydrostatic': ['hydrostatic_balance'],
                'pressure': ['hydrostatic_balance'],
                'hr diagram': ['hr_color_index', 'hr_absolute_magnitude'],
                'color index': ['hr_color_index'],
                'b-v': ['hr_color_index'],
                'mass luminosity': ['mass_luminosity_relation'],
                'distance modulus': ['distance_modulus'],
                'luminosity distance': ['luminosity_distance'],
                'angular diameter distance': ['angular_diameter_distance'],
                'angular momentum': ['angular_momentum_elliptical'],
                'elliptical orbit': ['angular_momentum_elliptical', 'kepler_third_law'],
                'jeans mass': ['jeans_mass'],
                'gravitational collapse': ['jeans_mass'],
                'center of mass': ['center_of_mass'],
                'barycenter': ['center_of_mass'],
                'inverse square law': ['inverse_square_law_brightness', 'flux_from_luminosity'],
                'luminosity function': ['luminosity_function'],
                'planck': ['planck_relation'],
                'planck relation': ['planck_relation'],
                'stefan boltzmann': ['blackbody_radiation'],
                'equilibrium temperature': ['planetary_equilibrium_temperature'],
                'albedo': ['albedo'],
                'greenhouse': ['greenhouse_effect'],
                'transit': ['planetary_equilibrium_temperature'],
                'parsec': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'light year': ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus'],
                'astronomical unit': ['kepler_third_law', 'orbital_velocity'],
                'solar mass': ['kepler_third_law', 'mass_luminosity_relation', 'chandrasekhar_limit'],
                'main sequence star': ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                'giant star': ['hr_absolute_magnitude', 'luminosity'],
                'supergiant': ['hr_absolute_magnitude', 'luminosity'],
                'eclipsing binary': ['binary_white_dwarf', 'kepler_third_law_binary'],
                'spectroscopic binary': ['doppler_shift', 'kepler_third_law_binary'],
                'contact binary': ['binary_white_dwarf', 'white_dwarf_merger_timescale'],
                'transit method': ['planetary_equilibrium_temperature'],
                'radial velocity method': ['doppler_shift', 'doppler_shift_approx'],
                'habitable zone': ['planetary_equilibrium_temperature', 'flux_temperature'],
                'microlensing': ['einstein_radius'],
                'scale factor': ['hubble_law', 'cosmic_redshift', 'lookback_time'],
                'universe age': ['hubble_law', 'lookback_time'],
                'cosmic expansion': ['hubble_law', 'cosmic_redshift', 'friedmann_equation'],
                'general relativity': ['schwarzschild_radius', 'einstein_radius', 'time_dilation', 'length_contraction'],
                'gravitational wave': ['schwarzschild_radius', 'einstein_radius'],
                'spacetime': ['einstein_radius', 'schwarzschild_radius', 'time_dilation'],
                'diffraction': ['angular_resolution'],
                'rayleigh criterion': ['angular_resolution'],
                'seeing': ['angular_resolution'],
                'adaptive optics': ['angular_resolution'],
                'doppler broadening': ['doppler_shift', 'doppler_shift_approx'],
                'line broadening': ['equivalent_width', 'doppler_shift'],
                'rotational broadening': ['rotational_velocity', 'doppler_shift'],
                'inverse compton': ['synchrotron_power', 'magnetic_energy_density'],
                'cooling break': ['cooling_break_gamma', 'cooling_break_frequency'],
                'non thermal': ['power_law_spectrum', 'spectral_index'],
                'gamma ray burst': ['max_gamma_bohm', 'synchrotron_cooling_timescale'],
                'roche lobe': ['roche_limit'],
                'tidal heating': ['tidal_force', 'tidal_locking_timescale'],
                'orbital resonance': ['kepler_third_law', 'synodic_period'],
                'virial theorem': ['hydrostatic_balance', 'orbital_energy'],
                'convection': ['hydrostatic_balance'],
                'opacity': ['blackbody_radiation', 'flux_temperature'],
                'bolometric magnitude': ['hr_absolute_magnitude', 'luminosity'],
                'color magnitude diagram': ['hr_color_index', 'hr_absolute_magnitude'],
                'cmd': ['hr_color_index', 'hr_absolute_magnitude'],
                'isochrone': ['hr_absolute_magnitude', 'stellar_lifetime'],
                'cepheid': ['distance_modulus', 'luminosity'],
                'rr lyrae': ['distance_modulus', 'luminosity'],
                'mira': ['distance_modulus', 'luminosity'],
                'pulsation': ['luminosity', 'stellar_lifetime'],
                'distance ladder': ['parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                'standard candle': ['distance_modulus', 'luminosity_distance'],
                'standard ruler': ['angular_diameter_distance'],
                'trigonometric parallax': ['parallax_distance_radians', 'parallax_distance_arcsec'],
                'cluster distance': ['distance_modulus', 'hr_absolute_magnitude'],
                'effective temperature': ['wiens_law', 'flux_temperature', 'hr_color_index'],
                'surface temperature': ['wiens_law', 'flux_temperature'],
                'bolometric': ['hr_absolute_magnitude', 'luminosity'],
                'spectral energy distribution': ['blackbody_radiation', 'flux_temperature'],
                'continuum': ['blackbody_radiation'],
                'kinetic energy': ['orbital_energy', 'vis_viva'],
                'potential energy': ['orbital_energy', 'vis_viva'],
                'binding energy': ['orbital_energy'],
                'acceleration': ['surface_gravity', 'escape_velocity'],
                'angular velocity': ['rotational_velocity'],
                'age': ['stellar_lifetime'],
                'timescale': ['stellar_lifetime', 'synchrotron_cooling_timescale', 'tidal_locking_timescale'],
                'jupiter mass': ['kepler_third_law', 'orbital_velocity'],
                'earth mass': ['surface_gravity', 'average_density'],
                'momentum': ['angular_momentum_elliptical', 'vis_viva'],
                'force': ['tidal_force', 'surface_gravity'],
                'angular frequency': ['rotational_velocity'],
                'orbital elements': ['kepler_third_law', 'angular_momentum_elliptical', 'vis_viva'],
                'inclination': ['kepler_third_law'],
                'stellar evolution': ['stellar_lifetime', 'mass_luminosity_relation', 'hr_absolute_magnitude'],
                'nucleosynthesis': ['stellar_lifetime', 'luminosity'],
                'proton proton chain': ['stellar_lifetime'],
                'cno cycle': ['stellar_lifetime'],
                'accretion disk': ['luminosity', 'flux_from_luminosity'],
                'eddington luminosity': ['luminosity'],
                'line profile': ['equivalent_width', 'doppler_shift'],
                'gaussian profile': ['equivalent_width', 'doppler_shift'],
                'lorentzian profile': ['equivalent_width'],
                'voigt profile': ['equivalent_width'],
                'fwhm': ['equivalent_width', 'doppler_shift'],
                'radial velocity curve': ['doppler_shift', 'kepler_third_law_binary'],
                'orbital solution': ['kepler_third_law', 'kepler_third_law_binary'],
                'mass function': ['kepler_third_law_binary', 'center_of_mass'],
                'transit depth': ['planetary_equilibrium_temperature'],
                'transit duration': ['planetary_equilibrium_temperature'],
                'impact parameter': ['planetary_equilibrium_temperature'],
                'secondary eclipse': ['planetary_equilibrium_temperature'],
                'compton y parameter': ['synchrotron_power'],
                'synchrotron self compton': ['synchrotron_power'],
                'inverse compton scattering': ['synchrotron_power', 'magnetic_energy_density'],
                'thomson scattering': ['synchrotron_power'],
                'bremsstrahlung': ['synchrotron_power'],
                'pair production': ['max_gamma_bohm'],
                'libration point': ['hill_radius', 'roche_limit'],
                'trojan asteroid': ['hill_radius'],
                'secular resonance': ['synodic_period', 'kepler_third_law'],
                'yarkovsky effect': ['tidal_force'],
                'poynting robertson': ['tidal_force'],
                'lane emden equation': ['hydrostatic_balance'],
                'isothermal sphere': ['hydrostatic_balance'],
                'extinction': ['distance_modulus', 'magnitude_flux_relation'],
                'reddening': ['hr_color_index', 'distance_modulus'],
                'selective extinction': ['distance_modulus'],
                'surface brightness': ['angular_size', 'luminosity'],
                'mass ratio': ['kepler_third_law_binary', 'center_of_mass'],
                'orbital separation': ['kepler_third_law', 'kepler_third_law_binary'],
                'common envelope': ['binary_white_dwarf', 'white_dwarf_merger_timescale'],
                'mass transfer': ['binary_white_dwarf', 'roche_limit'],
                'thermal timescale': ['stellar_lifetime'],
                'dynamical timescale': ['stellar_lifetime'],
                'period luminosity': ['distance_modulus', 'luminosity'],
                'leavitt law': ['distance_modulus', 'luminosity'],
                'wesenheit function': ['distance_modulus'],
                'spectroscopic parallax': ['distance_modulus', 'hr_absolute_magnitude'],
                'moving cluster': ['distance_modulus', 'hr_absolute_magnitude'],
                'statistical parallax': ['parallax_distance_arcsec'],
                'barycentric parallax': ['parallax_distance_arcsec'],
                'dynamical parallax': ['kepler_third_law_binary'],
                'expansion parallax': ['parallax_distance_arcsec'],
                'reverberation mapping': ['distance_modulus'],
                'transverse comoving': ['angular_diameter_distance'],
                'light travel distance': ['lookback_time'],
                'particle horizon distance': ['lookback_time'],
                'metallicity': ['hr_absolute_magnitude'],
                's process': ['stellar_lifetime'],
                'r process': ['stellar_lifetime'],
                'point spread function': ['angular_resolution'],
                'strehl ratio': ['angular_resolution'],
                'signal to noise': ['angular_resolution', 'light_gathering_power'],
                'integration time': ['light_gathering_power'],
                'quantum efficiency': ['light_gathering_power'],
                'airmass': ['angular_resolution'],
                'extinction coefficient': ['distance_modulus'],
                'scintillation': ['angular_resolution'],
                'differential photometry': ['magnitude_flux_relation'],
                'photometric system': ['magnitude_flux_relation', 'hr_color_index'],
                'standard star': ['distance_modulus', 'magnitude_flux_relation'],
                'chi squared': ['distance_modulus', 'luminosity_distance'],
                'maximum likelihood': ['distance_modulus'],
                'uncertainty': ['parallax_distance_arcsec', 'distance_modulus'],
                'error propagation': ['parallax_distance_arcsec', 'distance_modulus']
            };
            
            if (conceptMap[concept] && conceptMap[concept].includes(formulaId)) {
                score += 300;
                if (!reason) {
                    reason = `Matches concept: "${concept}"`;
                }
            }
            
            // Also check partial concept matches
            if (concept.includes('velocity') && (formulaId.includes('velocity') || formulaId === 'vis_viva')) {
                score += 200;
            }
            if (concept.includes('distance') && formulaId.includes('distance')) {
                score += 200;
            }
            if (concept.includes('period') && (formulaId.includes('period') || formulaId.includes('kepler'))) {
                score += 200;
            }
            if (concept.includes('temperature') && (formulaId.includes('temperature') || formulaId.includes('wien'))) {
                score += 200;
            }
        });
        
        // Check if question mentions specific variables that match formula variables
        parsedQuery.variables.forEach(varSymbol => {
            const hasVar = formula.variables.some(v => 
                v.symbol.toLowerCase() === varSymbol || v.name.toLowerCase().includes(varSymbol)
            );
            if (hasVar) {
                score += 150;
            }
        });
        
        // ENHANCED: Check formula.questionPatterns if they exist (direct question matching)
        if (formula.questionPatterns && Array.isArray(formula.questionPatterns)) {
            formula.questionPatterns.forEach(pattern => {
                const patternLower = pattern.toLowerCase();
                
                // Direct substring match (high priority)
                if (searchLower.includes(patternLower) || patternLower.includes(searchLower)) {
                    score += 400;
                    if (!reason) reason = `Matches question: "${pattern}"`;
                }
                
                // Word overlap (at least 2 words match)
                const patternWords = patternLower.split(/\s+/).filter(w => w.length > 2);
                const matchedWords = patternWords.filter(w => searchLower.includes(w));
                if (matchedWords.length >= 2) {
                    score += 200 * matchedWords.length;
                    if (!reason) reason = `Question pattern match: ${matchedWords.length} words`;
                }
                
                // Individual word matches (lower priority but still valuable)
                patternWords.forEach(word => {
                    if (searchLower.includes(word) && word.length >= 4) {
                        score += 100;
                    }
                });
            });
        }
        
        return { score, reason };
    }
    
    // ENHANCED: Calculate precision score based on directionality and primary use
    function calculatePrecisionScore(formula, parsedQuery, searchLower) {
        let score = 0;
        let reason = '';
        
        // Check if formula has primaryUseCase (we'll add this to formulas)
        const primaryUseCase = formula.primaryUseCase || '';
        const primaryUseLower = primaryUseCase.toLowerCase();
        
        // Intent matching with directionality (highest priority)
        if (parsedQuery.direction === 'from' || parsedQuery.direction === 'based_on') {
            // User wants to find X FROM Y
            const targetConcepts = parsedQuery.targetConcepts;
            const sourceConcepts = parsedQuery.sourceConcepts;
            
            // Check if formula's primary use matches the direction
            if (primaryUseCase) {
                // Check if primary use case matches the query direction
                // e.g., "temperature from wavelength" matches "find temperature from spectrum"
                const useCaseWords = primaryUseLower.split(/\s+/);
                const hasTarget = targetConcepts.some(tc => 
                    useCaseWords.some(ucw => ucw.includes(tc) || tc.includes(ucw))
                );
                const hasSource = sourceConcepts.some(sc => 
                    useCaseWords.some(ucw => ucw.includes(sc) || sc.includes(ucw))
                );
                
                if (hasTarget && hasSource) {
                    // Perfect direction match
                    score += 1500;
                    reason = `🎯 Perfect match: ${primaryUseCase}`;
                } else if (hasTarget || hasSource) {
                    // Partial direction match
                    score += 500;
                    reason = `Direction match: ${primaryUseCase}`;
                }
            }
            
            // Check question patterns with direction
            if (formula.questionPatterns && Array.isArray(formula.questionPatterns)) {
                formula.questionPatterns.forEach(pattern => {
                    const patternLower = pattern.toLowerCase();
                    // Check if pattern matches the direction
                    if (patternLower.includes('from') || patternLower.includes('based')) {
                        const patternWords = patternLower.split(/\s+/);
                        const matchedWords = patternWords.filter(w => 
                            searchLower.includes(w) && w.length > 3
                        );
                        if (matchedWords.length >= 3) {
                            const specificity = formula.specificity || 5;
                            score += 300 * specificity;
                            if (!reason) reason = `📋 Question pattern: "${pattern}"`;
                        }
                    }
                });
            }
        }
        
        // Primary use case bonus (even without explicit direction)
        if (primaryUseCase && searchLower.includes(primaryUseLower.replace(/\s+/g, '.*'))) {
            score += 500;
            if (!reason) reason = `✨ Primary use case match: ${primaryUseCase}`;
        }
        
        // Specificity bonus (formulas with higher specificity get bonus for exact matches)
        const specificity = formula.specificity || 5;
        if (specificity >= 8) {
            // High specificity formulas get bonus for concept matches
            const conceptMatches = parsedQuery.concepts.filter(c => 
                formula.concepts && formula.concepts.some(fc => 
                    fc.toLowerCase().includes(c) || c.includes(fc.toLowerCase())
                )
            ).length;
            
            if (conceptMatches >= 3) {
                score += 200 * (specificity / 10);
                if (!reason) reason = `🔗 Strong concept match (${conceptMatches} concepts, specificity ${specificity}/10)`;
            }
        }
        
        return { score, reason };
    }
    
    // ENHANCED: Calculate penalty for overly generic matches
    function calculateGenericPenalty(formula, parsedQuery, currentScore) {
        let penalty = 0;
        
        // Penalize low specificity formulas if they have too many generic matches
        const specificity = formula.specificity || 5;
        const conceptMatches = parsedQuery.concepts.filter(c => 
            formula.concepts && formula.concepts.some(fc => 
                fc.toLowerCase().includes(c) || c.includes(fc.toLowerCase())
            )
        ).length;
        
        // If formula has low specificity but many concept matches, it's probably too generic
        if (specificity < 7 && conceptMatches > 2 && currentScore > 500) {
            // Apply penalty proportional to how generic it is
            penalty = Math.round(currentScore * 0.3);
        }
        
        // Penalize if formula matches many concepts but doesn't match primary use case
        if (conceptMatches >= 3 && !formula.primaryUseCase) {
            penalty += 100;
        }
        
        // Penalize if direction is specified but formula doesn't match it
        if (parsedQuery.direction && !formula.primaryUseCase) {
            penalty += 150;
        }
        
        return penalty;
    }
}

// Render filtered formulas with accuracy metrics
function renderFilteredFormulas(scoredFormulas, searchTerm, maxScore = 1) {
    const formulaList = document.getElementById('formula-list');
    
    // CRITICAL: Check if element exists
    if (!formulaList) {
        console.error('❌ formula-list element not found!');
        console.log('Available elements:', 
            Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }
    
    console.log('✅ formula-list found, clearing and rendering...');
    console.log('renderFilteredFormulas called:', { 
        searchTerm, 
        resultCount: scoredFormulas.length, 
        maxScore 
    });
    
    formulaList.innerHTML = '';
    
    // Add result count header
    if (searchTerm && scoredFormulas.length > 0) {
        const resultHeader = document.createElement('div');
        resultHeader.className = 'search-results-header';
        resultHeader.innerHTML = `Found <strong>${scoredFormulas.length}</strong> relevant formula${scoredFormulas.length !== 1 ? 's' : ''} matching "${searchTerm}" (sorted by relevance, highest score first)`;
        formulaList.appendChild(resultHeader);
    }
    
    if (scoredFormulas.length === 0) {
        // Get suggestions based on search term
        const suggestions = getSearchSuggestions(searchTerm);
        let suggestionsHTML = '';
        if (suggestions.length > 0) {
            suggestionsHTML = `
                <div style="margin-top: 20px;">
                    <p style="font-size: 0.95em; margin-bottom: 10px; color: rgba(255, 255, 255, 0.6);">Did you mean:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                        ${suggestions.map(s => `<span style="background: rgba(102, 126, 234, 0.2); padding: 6px 12px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(102, 126, 234, 0.3); transition: all 0.2s;" onclick="document.getElementById('formula-search').value='${s}'; document.getElementById('formula-search').dispatchEvent(new Event('input'));">${s}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        formulaList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: rgba(255, 255, 255, 0.7);">
                <p style="font-size: 1.2em; margin-bottom: 10px;">No formulas found</p>
                <p style="font-size: 0.9em; margin-bottom: 15px;">Try searching for a different term</p>
                ${suggestionsHTML}
            </div>
        `;
        return;
    }
    
    // Group scored formulas by category and sort by score
    const categorizedFormulas = {};
    const uncategorized = [];
    
    scoredFormulas.forEach(({ formula, score, metrics }) => {
        let found = false;
        for (const [category, ids] of Object.entries(formulaCategories)) {
            if (ids.includes(formula.id)) {
                if (!categorizedFormulas[category]) {
                    categorizedFormulas[category] = [];
                }
                categorizedFormulas[category].push({ formula, score, metrics, maxScore });
                found = true;
                break;
            }
        }
        if (!found) {
            uncategorized.push({ formula, score, metrics, maxScore });
        }
    });
    
    // Sort formulas within each category by score (highest to lowest)
    Object.keys(categorizedFormulas).forEach(category => {
        categorizedFormulas[category].sort((a, b) => b.score - a.score);
    });
    uncategorized.sort((a, b) => b.score - a.score);
    
    // Sort categories by highest score in category
    const categoryScores = {};
    Object.keys(categorizedFormulas).forEach(category => {
        const maxScoreInCategory = Math.max(...categorizedFormulas[category].map(f => f.score));
        categoryScores[category] = maxScoreInCategory;
    });
    
    // Render categorized formulas, sorted by category score (highest first)
    const categoryOrder = [
        'Orbital Mechanics',
        'Radiation & Stellar Properties',
        'Telescopes & Optics',
        'Cosmology & Relativity',
        'Doppler & Spectroscopy',
        'Planetary Science & Exoplanets',
        'High Energy Astrophysics',
        'Stellar Structure'
    ];
    
    // Sort categories by their highest score, but maintain some order preference
    const sortedCategories = Object.keys(categorizedFormulas).sort((a, b) => {
        const scoreA = categoryScores[a] || 0;
        const scoreB = categoryScores[b] || 0;
        if (Math.abs(scoreA - scoreB) > 100) {
            // If scores are very different, sort by score
            return scoreB - scoreA;
        }
        // Otherwise maintain category order preference
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
    
    sortedCategories.forEach(category => {
        if (categorizedFormulas[category] && categorizedFormulas[category].length > 0) {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'formula-category';
            
            const header = document.createElement('div');
            header.className = 'formula-category-header';
            const maxScoreInCategory = categoryScores[category];
            header.innerHTML = `<h2>${category}</h2><span class="category-score">Top score: ${Math.round(maxScoreInCategory)}</span>`;
            categoryContainer.appendChild(header);
            
            categorizedFormulas[category].forEach(({ formula, score, metrics, maxScore }, index) => {
                const card = createFormulaCard(formula, score, metrics, maxScore);
                if (card) {
                    categoryContainer.appendChild(card);
                } else {
                    console.warn('createFormulaCard returned null for:', formula.id);
                }
            });
            
            if (categoryContainer.children.length > 1) { // More than just the header
                formulaList.appendChild(categoryContainer);
            }
        }
    });
    
    // Render uncategorized formulas
    if (uncategorized.length > 0) {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'formula-category';
        
        const header = document.createElement('div');
        header.className = 'formula-category-header';
        header.innerHTML = `<h2>Other</h2>`;
        categoryContainer.appendChild(header);
        
        uncategorized.forEach(({ formula, score, metrics, maxScore }) => {
            const card = createFormulaCard(formula, score, metrics, maxScore);
            if (card) {
                categoryContainer.appendChild(card);
            } else {
                console.warn('createFormulaCard returned null for uncategorized:', formula.id);
            }
        });
        
        if (categoryContainer.children.length > 1) { // More than just the header
            formulaList.appendChild(categoryContainer);
            console.log(`Appended "Other" category with ${categoryContainer.children.length - 1} formulas`);
        }
    }
    
    // Final check - ensure we have content
    if (formulaList.children.length === 0 && scoredFormulas.length > 0) {
        console.error('Warning: No content was appended to formulaList despite having results!');
    } else {
        console.log(`Successfully rendered ${formulaList.children.length} elements to formulaList`);
    }
    
    // Highlight search term in results
    if (searchTerm) {
        highlightSearchTerm(searchTerm);
    }
}

// Get search suggestions based on common terms
function getSearchSuggestions(searchTerm) {
    const suggestions = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Common search terms and their suggestions
    const commonTerms = {
        'vel': ['velocity', 'escape velocity', 'orbital velocity'],
        'temp': ['temperature', 'wien', 'stefan'],
        'mass': ['mass', 'chandrasekhar', 'jeans'],
        'dist': ['distance', 'parallax', 'modulus'],
        'lum': ['luminosity', 'flux', 'brightness'],
        'grav': ['gravity', 'surface gravity', 'escape'],
        'orb': ['orbital', 'kepler', 'period'],
        'red': ['redshift', 'doppler'],
        'mag': ['magnitude', 'flux'],
        'rad': ['radius', 'angular', 'diameter']
    };
    
    // Check for partial matches
    for (const [key, terms] of Object.entries(commonTerms)) {
        if (searchLower.includes(key) || key.includes(searchLower)) {
            suggestions.push(...terms);
        }
    }
    
    // Get unique variable symbols that might match
    const allVariables = new Set();
    formulas.forEach(f => {
        f.variables.forEach(v => {
            if (v.symbol.toLowerCase().includes(searchLower) || 
                searchLower.includes(v.symbol.toLowerCase())) {
                allVariables.add(v.symbol);
            }
        });
    });
    
    suggestions.push(...Array.from(allVariables).slice(0, 3));
    
    return [...new Set(suggestions)].slice(0, 5); // Return up to 5 unique suggestions
}

// Highlight search term in formula cards
function highlightSearchTerm(searchTerm) {
    const cards = document.querySelectorAll('.formula-card');
    const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    cards.forEach(card => {
        // Highlight in name
        const nameEl = card.querySelector('h3');
        if (nameEl) {
            let nameText = nameEl.textContent;
            searchWords.forEach(word => {
                const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
                nameText = nameText.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.4); color: #a8c7ff; padding: 2px 4px; border-radius: 3px; font-weight: 500;">$1</mark>');
            });
            nameEl.innerHTML = nameText;
        }
        
        // Highlight in description
        const descEl = card.querySelector('.description');
        if (descEl) {
            let descText = descEl.textContent;
            searchWords.forEach(word => {
                const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
                descText = descText.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.3); color: #a8c7ff; padding: 1px 3px; border-radius: 2px;">$1</mark>');
            });
            descEl.innerHTML = descText;
        }
        
        // Highlight in formula preview (be careful with special characters)
        const formulaEl = card.querySelector('.formula-preview');
        if (formulaEl) {
            let formulaText = formulaEl.textContent;
            // Only highlight if it's a simple text match (avoid breaking math symbols)
            searchWords.forEach(word => {
                if (word.length > 1 && /^[a-zA-Z0-9_]+$/.test(word)) {
                    const regex = new RegExp(`\\b(${escapeRegex(word)})\\b`, 'gi');
                    formulaText = formulaText.replace(regex, '<mark style="background: rgba(102, 126, 234, 0.3); color: #a8c7ff; padding: 1px 2px; border-radius: 2px;">$1</mark>');
                }
            });
            formulaEl.innerHTML = formulaText;
        }
    });
}

// Render the list of formulas
function renderFormulaList() {
    const formulaList = document.getElementById('formula-list');
    
    if (!formulaList) {
        console.error('formula-list element not found!');
        return;
    }
    
    // Check if formulas array exists
    if (typeof formulas === 'undefined' || !formulas) {
        console.error('Formulas array not found!', typeof formulas);
        formulaList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Error: Formulas not loaded. Please check the console.</p>';
        return;
    }
    
    if (!Array.isArray(formulas) || formulas.length === 0) {
        console.error('Formulas array is empty or not an array!', formulas);
        formulaList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Error: No formulas found in array.</p>';
        return;
    }
    
    // Clear and populate formula list
    formulaList.innerHTML = '';
    
    // Group formulas by category
    const categorizedFormulas = {};
    const uncategorized = [];
    
    formulas.forEach(formula => {
        let found = false;
        for (const [category, ids] of Object.entries(formulaCategories)) {
            if (ids.includes(formula.id)) {
                if (!categorizedFormulas[category]) {
                    categorizedFormulas[category] = [];
                }
                categorizedFormulas[category].push(formula);
                found = true;
                break;
            }
        }
        if (!found) {
            uncategorized.push(formula);
        }
    });
    
    // Render categorized formulas
    const categoryOrder = [
        'Orbital Mechanics',
        'Radiation & Stellar Properties',
        'Telescopes & Optics',
        'Cosmology & Relativity',
        'Doppler & Spectroscopy',
        'Planetary Science & Exoplanets',
        'High Energy Astrophysics',
        'Stellar Structure'
    ];
    
    categoryOrder.forEach(category => {
        if (categorizedFormulas[category] && categorizedFormulas[category].length > 0) {
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'formula-category-header';
            categoryHeader.innerHTML = `<h2>${category}</h2>`;
            formulaList.appendChild(categoryHeader);
            
            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'formula-category';
            
            // Add formulas to category
            categorizedFormulas[category].forEach(formula => {
                const card = createFormulaCard(formula);
                categoryContainer.appendChild(card);
            });
            
            formulaList.appendChild(categoryContainer);
        }
    });
    
    // Render uncategorized formulas if any
    if (uncategorized.length > 0) {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'formula-category-header';
        categoryHeader.innerHTML = '<h2>Other</h2>';
        formulaList.appendChild(categoryHeader);
        
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'formula-category';
        
        uncategorized.forEach(formula => {
            const card = createFormulaCard(formula);
            categoryContainer.appendChild(card);
        });
        
        formulaList.appendChild(categoryContainer);
    }
    
    console.log(`Rendered ${formulas.length} formula cards in ${Object.keys(categorizedFormulas).length} categories`);
}

// Create a formula card element
function createFormulaCard(formula, score = null, metrics = null, maxScore = 1) {
    // Validate formula object
    if (!formula) {
        console.error('createFormulaCard: formula is null or undefined');
        return null;
    }
    
    if (!formula.id || !formula.name) {
        console.error('createFormulaCard: formula missing required properties', formula);
        return null;
    }
    
    const card = document.createElement('div');
    card.className = 'formula-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-formula-id', formula.id);
    
    // ADD CLICK HANDLER BEFORE SETTING INNERHTML (fixes timing issue)
    card.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Card clicked (onclick):', formula.name);
        selectFormula(formula);
    };
    
    // Calculate confidence percentage if metrics are provided (improved accuracy)
    let metricsHTML = '';
    if (score !== null && metrics && maxScore > 0) {
        // Calculate relative confidence (normalized to max score)
        const relativeConfidence = Math.min(100, Math.round((score / maxScore) * 100));
        
        // Calculate absolute confidence based on score tiers
        let absoluteConfidence = 0;
        if (score >= 1000) absoluteConfidence = 95; // Exact name match tier
        else if (score >= 800) absoluteConfidence = 90; // Very high relevance
        else if (score >= 600) absoluteConfidence = 80; // High relevance
        else if (score >= 400) absoluteConfidence = 65; // Medium-high relevance
        else if (score >= 250) absoluteConfidence = 50; // Medium relevance
        else if (score >= 150) absoluteConfidence = 35; // Low-medium relevance
        else absoluteConfidence = 20; // Low relevance
        
        // Combine relative and absolute confidence (weighted average)
        const confidencePercent = Math.round((relativeConfidence * 0.6) + (absoluteConfidence * 0.4));
        
        const matchCount = [
            metrics.nameMatch,
            metrics.descriptionMatch,
            metrics.equationMatch,
            metrics.variableMatch,
            metrics.conceptMatch,
            metrics.questionPatternMatch,
            metrics.categoryMatch,
            metrics.semanticMatch
        ].filter(Boolean).length;
        
        // Determine confidence level with more granular thresholds
        let confidenceLevel = 'low';
        let confidenceColor = '#ff6b6b';
        if (confidencePercent >= 85) {
            confidenceLevel = 'excellent';
            confidenceColor = '#51cf66';
        } else if (confidencePercent >= 70) {
            confidenceLevel = 'high';
            confidenceColor = '#74c0fc';
        } else if (confidencePercent >= 50) {
            confidenceLevel = 'medium';
            confidenceColor = '#ffd43b';
        } else if (confidencePercent >= 30) {
            confidenceLevel = 'low-medium';
            confidenceColor = '#ffa94d';
        }
        
        // Build match indicators
        const matchIndicators = [];
        if (metrics.nameMatch) matchIndicators.push('Name');
        if (metrics.descriptionMatch) matchIndicators.push('Description');
        if (metrics.equationMatch) matchIndicators.push('Equation');
        if (metrics.variableMatch) matchIndicators.push('Variables');
        if (metrics.conceptMatch) matchIndicators.push('Concepts');
        if (metrics.questionPatternMatch) matchIndicators.push('Question Pattern');
        if (metrics.categoryMatch) matchIndicators.push('Category');
        if (metrics.semanticMatch) matchIndicators.push('Semantic');
        if (metrics.synonymMatch) matchIndicators.push('Synonym');
        
        // Get concept hierarchy relationships for display
        const conceptHierarchy = getConceptHierarchy();
        const conceptRelations = [];
        metrics.matchedConcepts.forEach(concept => {
            const node = conceptHierarchy[concept];
            if (node) {
                const relations = [];
                if (node.parent) relations.push(`↑ ${node.parent}`);
                if (node.children && node.children.length > 0) {
                    relations.push(`↓ ${node.children.slice(0, 2).join(', ')}${node.children.length > 2 ? '...' : ''}`);
                }
                if (node.siblings && node.siblings.length > 0) {
                    relations.push(`↔ ${node.siblings.slice(0, 2).join(', ')}${node.siblings.length > 2 ? '...' : ''}`);
                }
                if (relations.length > 0) {
                    conceptRelations.push(`${concept}: ${relations.join(' | ')}`);
                }
            }
        });
        
        metricsHTML = `
            <div class="accuracy-metrics">
                <div class="confidence-badge" style="background: ${confidenceColor}20; border-color: ${confidenceColor}; color: ${confidenceColor};">
                    <span class="confidence-percent">${confidencePercent}%</span>
                    <span class="confidence-level">${confidenceLevel}</span>
                </div>
                <div class="match-details">
                    <div class="match-count">${matchCount}/9 match types${metrics.dynamicBoost > 0 ? ` • +${metrics.dynamicBoost}% dynamic boost` : ''}</div>
                    ${matchIndicators.length > 0 ? `<div class="match-indicators">${matchIndicators.map(m => `<span class="match-tag">${m}</span>`).join('')}</div>` : ''}
                    ${metrics.matchedConcepts.length > 0 ? `<div class="matched-concepts">Concepts: ${metrics.matchedConcepts.slice(0, 3).join(', ')}${metrics.matchedConcepts.length > 3 ? '...' : ''}</div>` : ''}
                    ${conceptRelations.length > 0 ? `<div class="concept-hierarchy" title="Hierarchical relationships: ↑ parent, ↓ children, ↔ siblings">${conceptRelations.slice(0, 2).map(r => `<span class="hierarchy-link">${r}</span>`).join('<br>')}${conceptRelations.length > 2 ? '<br>...' : ''}</div>` : ''}
                    ${metrics.matchedVariables.length > 0 ? `<div class="matched-variables">Variables: ${metrics.matchedVariables.join(', ')}</div>` : ''}
                    ${metrics.matchReasons.length > 0 ? `<div class="match-reasons">${metrics.matchReasons[0]}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    // Ensure all required properties exist with fallbacks
    const formulaName = formula.name || 'Unnamed Formula';
    const formulaEquation = formula.equation || 'No equation available';
    const formulaDescription = formula.description || 'No description available';
    const formulaVariables = (formula.variables && Array.isArray(formula.variables) && formula.variables.length > 0) 
        ? formula.variables.map(v => `<span class="var-tag">${v.symbol || '?'}</span>`).join(' ')
        : '<span class="var-tag">None</span>';
    
    // Set innerHTML first
    try {
        // Add score display if this is a search result
        const scoreDisplay = (score !== null && score !== undefined) ? 
            `<div class="formula-score-badge" style="position: absolute; top: 10px; right: 10px; background: rgba(102, 126, 234, 0.3); color: #a8c7ff; padding: 4px 10px; border-radius: 8px; font-size: 0.85em; font-weight: 600; border: 1px solid rgba(102, 126, 234, 0.5);">
                ${Math.round(score)} pts
            </div>` : '';
        
        const cardContent = `
            ${scoreDisplay}
            <div class="formula-card-header">
                <h3>${formulaName}</h3>
                <span class="click-hint">Click to calculate →</span>
            </div>
            ${metricsHTML}
            <div class="formula-preview">${formulaEquation}</div>
            <p class="description">${formulaDescription}</p>
            <div class="formula-variables">
                <strong>Variables:</strong> ${formulaVariables}
            </div>
        `;
        card.innerHTML = cardContent;
        
        // Verify content was set
        if (card.innerHTML.trim().length === 0) {
            console.error('Card innerHTML is empty after setting!', formula.id);
        }
    } catch (error) {
        console.error('Error setting card innerHTML:', error, formula);
        card.innerHTML = `
            <div class="formula-card-header">
                <h3>Error Loading Formula</h3>
            </div>
            <p class="description">Unable to display formula details.</p>
        `;
    }
    
    // Keep addEventListener as backup (onclick is already set above)
    card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Card clicked (addEventListener backup):', formula.name);
        selectFormula(formula);
    });
    
    // Add keyboard support
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectFormula(formula);
        }
    });
    
    return card;
}

// Select a formula and show input screen
// Helper function to safely initialize a graph manager
function initializeGraphManager(manager, containerId, tabId, maxAttempts = 20) {
    if (!manager) return false;
    
    // If already initialized, return true
    if (manager.calculator) return true;
    
    // Check if Desmos is available
    if (typeof Desmos === 'undefined') {
        // Wait for Desmos to load (async, returns false immediately)
            let attempts = 0;
            const checkDesmos = setInterval(() => {
                attempts++;
            if (typeof Desmos !== 'undefined' && manager) {
                manager.init(containerId);
                    clearInterval(checkDesmos);
                } else if (attempts >= maxAttempts) {
                    console.warn('Desmos API failed to load after multiple attempts');
                    clearInterval(checkDesmos);
                }
            }, 200);
        return false; // Will be initialized asynchronously
    }
    
    // Initialize immediately if Desmos is available
    return manager.init(containerId);
}

function selectFormula(formula) {
    // Track formula selection for dynamic prioritization
    if (typeof semanticSearchSystem !== 'undefined' && formula.concepts) {
        formula.concepts.forEach(concept => {
            semanticSearchSystem.trackUsage(concept);
        });
        if (formula.keywords) {
            formula.keywords.forEach(keyword => {
                semanticSearchSystem.trackUsage(keyword);
            });
        }
    }
    
    currentFormula = formula;
    calculator = new FormulaCalculator(formula);
    
    // Initialize graph manager if not already done
    if (!graphManager) {
        graphManager = new GraphManager();
    }
    
    // Try to initialize (will handle Desmos loading internally)
    initializeGraphManager(graphManager);
    
    // Switch to input screen
    document.getElementById('formula-selection').classList.remove('active');
    document.getElementById('input-screen').classList.add('active');
    
    // Populate formula info
    document.getElementById('formula-name').textContent = formula.name;
    const equationEl = document.getElementById('formula-equation');
    equationEl.textContent = formula.equation;
    document.getElementById('formula-description').textContent = formula.description;
    
    // Create variable inputs
    renderVariableInputs(formula);
    
    // Clear previous results
    document.getElementById('result-display').classList.remove('show');
    
    // Update graph
    updateGraph();
    
    // Update graph interpretation
    updateGraphInterpretation();
    
    // Update instruction banner with initial state
    updateInstructionBanner([], null, 0, currentFormula.variables.filter(v => {
        const constantSymbols = new Set();
        if (currentFormula.constants) {
            Object.keys(currentFormula.constants).forEach(key => constantSymbols.add(key));
        }
        return !constantSymbols.has(v.symbol);
    }).length);
    
    // Update solve indicators after a short delay to ensure DOM is ready
    setTimeout(() => {
        updateSolveIndicators();
    }, 150);
    
    // Display related formulas
    displayRelatedFormulas(formula);
}

// Display related formulas for the current formula with triple-layer reinforcement
function displayRelatedFormulas(formula) {
    const container = document.getElementById('related-formulas-container');
    if (!container || !formulaRelationships) return;
    
    const relationships = formulaRelationships.getRelatedFormulas(formula.id);
    
    // Get cross-concept reinforced formulas
    let reinforcedFormulas = new Set(relationships.all);
    if (typeof crossConceptReinforcement !== 'undefined' && formula.concepts) {
        formula.concepts.forEach(concept => {
            const reinforced = crossConceptReinforcement.getReinforcedFormulas(concept);
            reinforced.forEach(id => reinforcedFormulas.add(id));
        });
    }
    
    // Remove current formula
    reinforcedFormulas.delete(formula.id);
    
    if (reinforcedFormulas.size === 0 && relationships.all.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    let html = '<div class="related-formulas-header"><h4>🔗 Related Formulas (Triple-Layer Reinforcement)</h4></div><div class="related-formulas-grid">';
    
    // Group by relationship type
    const groups = {
        'Prerequisites': relationships.prerequisites,
        'Derived From': relationships.derivedFrom,
        'Related To': relationships.relatedTo,
        'Uses This': relationships.uses,
        'Generalizes': relationships.generalizes,
        'Specializes': relationships.specializes
    };
    
    // Add cross-concept reinforced formulas
    const crossConceptFormulas = Array.from(reinforcedFormulas).filter(id => 
        !relationships.all.includes(id)
    );
    
    if (crossConceptFormulas.length > 0) {
        groups['Cross-Concept Reinforced'] = crossConceptFormulas;
    }
    
    Object.entries(groups).forEach(([type, formulaIds]) => {
        if (formulaIds.length > 0) {
            html += `<div class="relationship-group">
                <div class="relationship-type">${type}</div>
                <div class="related-formulas-list">`;
            
            formulaIds.forEach(id => {
                const relatedFormula = formulas.find(f => f.id === id);
                if (relatedFormula) {
                    // Get reinforcement info
                    let reinforcementInfo = '';
                    if (type === 'Cross-Concept Reinforced' && formula.concepts) {
                        const sharedConcepts = formula.concepts.filter(c => 
                            relatedFormula.concepts && relatedFormula.concepts.includes(c)
                        );
                        if (sharedConcepts.length > 0) {
                            reinforcementInfo = `<span class="reinforcement-badge">${sharedConcepts.length} shared concept${sharedConcepts.length > 1 ? 's' : ''}</span>`;
                        }
                    }
                    
                    html += `<div class="related-formula-item" data-formula-id="${id}">
                        <span class="related-formula-name">${relatedFormula.name} ${reinforcementInfo}</span>
                        <span class="related-formula-preview">${relatedFormula.equation}</span>
                    </div>`;
                }
            });
            
            html += `</div></div>`;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add click handlers to related formula items
    container.querySelectorAll('.related-formula-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const formulaId = item.getAttribute('data-formula-id');
            const relatedFormula = formulas.find(f => f.id === formulaId);
            if (relatedFormula) {
                selectFormula(relatedFormula);
            }
        });
    });
}

// Render input fields for each variable
function renderVariableInputs(formula) {
    const container = document.getElementById('variables-container');
    container.innerHTML = '';
    
    // Get list of constant symbols to exclude from input fields
    const constantSymbols = new Set();
    if (formula.constants) {
        Object.keys(formula.constants).forEach(key => {
            constantSymbols.add(key);
            // Also check for common constant names
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    // Filter out constants from variables - only show user-input variables
    const userVariables = formula.variables.filter(variable => {
        return !constantSymbols.has(variable.symbol);
    });
    
    // Display constants info if any exist
    if (formula.constants && Object.keys(formula.constants).length > 0) {
        const constantsDiv = document.createElement('div');
        constantsDiv.className = 'constants-info';
        constantsDiv.innerHTML = '<h4>Constants (automatically used):</h4><div class="constants-list"></div>';
        const constantsList = constantsDiv.querySelector('.constants-list');
        
        Object.entries(formula.constants).forEach(([key, value]) => {
            const constantItem = document.createElement('div');
            constantItem.className = 'constant-item';
            let displayValue = value;
            let displayKey = key;
            
            // Format common constants
            if (key === 'pi' || key === 'π') {
                displayKey = 'π';
                displayValue = '3.14159...';
            } else if (key === 'G') {
                displayKey = 'G';
                displayValue = '6.67430 × 10⁻¹¹ N·m²/kg²';
            } else if (key === 'c') {
                displayKey = 'c';
                displayValue = '2.998 × 10⁸ m/s';
            } else if (key === 'σ' || key === 'sigma') {
                displayKey = 'σ';
                displayValue = '5.670 × 10⁻⁸ W/(m²·K⁴)';
            } else if (typeof value === 'number') {
                if (Math.abs(value) < 0.001 || Math.abs(value) > 1000) {
                    displayValue = value.toExponential(3);
                } else {
                    displayValue = value.toString();
                }
            }
            
            constantItem.innerHTML = `<strong>${displayKey}:</strong> ${displayValue}`;
            constantsList.appendChild(constantItem);
        });
        
        container.appendChild(constantsDiv);
    }
    
    userVariables.forEach(variable => {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'variable-input';
        
        const baseUnit = variable.unit;
        const fullUnitName = UnitConverter.formatUnit(baseUnit);
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        const isAngle = baseUnit.toLowerCase().includes('radian') || baseUnit.toLowerCase().includes('rad');
        
        // Create unit options note
        let unitOptionsNote = '';
        if (alternativeUnits.length > 1) {
            const unitLabels = alternativeUnits.map(u => {
                const full = UnitConverter.formatUnit(u);
                return u === full ? u : `${u} (${full})`;
            }).join(', ');
            unitOptionsNote = `<div class="unit-options-note"><strong>Available units:</strong> ${unitLabels}</div>`;
        }
        
        // Get example value for placeholder
        const exampleValue = getExampleValue(variable.symbol, baseUnit);
        
        // Create input fields for each alternative unit
        let inputFieldsHTML = '';
        alternativeUnits.forEach((unit, index) => {
            const isBase = unit === baseUnit || unit.toLowerCase() === baseUnit.toLowerCase();
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            let placeholder = isBase ? "Enter value, 'null', or 'N/A'" : `Enter in ${unit}, 'null', or 'N/A'`;
            if (exampleValue && isBase) {
                placeholder = `e.g., ${exampleValue}, 'null', or 'N/A'`;
            }
            
            inputFieldsHTML += `
                <div class="unit-input-group">
                    <label class="unit-input-label">
                        <span class="unit-symbol">${unit}</span>
                        <span class="unit-name">${UnitConverter.formatUnit(unit)}</span>
                    </label>
                    <input 
                        type="text" 
                        id="${inputId}" 
                        class="unit-input-field"
                        placeholder="${placeholder}"
                        data-symbol="${variable.symbol}"
                        data-unit="${unit}"
                        data-unit-index="${index}"
                        data-base-unit="${baseUnit}"
                    >
                </div>
            `;
        });
        
        inputDiv.innerHTML = `
            <label class="variable-main-label">
                <span class="symbol">${variable.symbol}</span> - ${variable.name}
                <span class="solve-hint" data-symbol="${variable.symbol}">Leave empty to solve for this</span>
            </label>
            ${unitOptionsNote}
            <div class="unit-inputs-container">
                ${inputFieldsHTML}
            </div>
            <div class="var-description">${variable.description}</div>
            <div class="na-option">
                <label class="na-checkbox-label">
                    <input type="checkbox" class="na-checkbox" data-symbol="${variable.symbol}">
                    <span>Mark as N/A (will keep as variable in result)</span>
                </label>
            </div>
        `;
        
        container.appendChild(inputDiv);
        
        // Add input listeners to all unit input fields
        alternativeUnits.forEach((unit, currentIndex) => {
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const input = document.getElementById(inputId);
            if (input) {
                // Clear other inputs when this one is filled
                input.addEventListener('input', (e) => {
                    const currentValue = e.target.value.trim();
                    if (currentValue && currentValue.toLowerCase() !== 'null') {
                        // Clear other unit inputs for this variable (using index comparison for efficiency)
                        alternativeUnits.forEach((otherUnit, otherIndex) => {
                            if (otherIndex !== currentIndex) {
                                const otherInputId = `var-${variable.symbol}-${otherUnit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                                const otherInput = document.getElementById(otherInputId);
                                if (otherInput) {
                                    otherInput.value = '';
                                }
                            }
                        });
                    }
                    
                    // Update solve indicators
                    updateSolveIndicators();
                    
                    // Debounce graph updates
                    clearTimeout(input.graphUpdateTimeout);
                    input.graphUpdateTimeout = setTimeout(() => {
                        updateGraph();
            // Also update interpretation graph if it exists
            if (graphInterpretationManager && graphInterpretationManager.calculator && currentFormula) {
                const currentValues = getCurrentVariableValues();
                graphInterpretationManager.updateGraph(currentFormula, currentValues);
            }
                    }, 500);
                });
            }
        });
        
        // Add N/A checkbox listener
        const naCheckbox = inputDiv.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
        if (naCheckbox) {
            naCheckbox.addEventListener('change', (e) => {
                // Clear all input fields for this variable when N/A is checked
                if (e.target.checked) {
                    alternativeUnits.forEach(unit => {
                        const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                        const input = document.getElementById(inputId);
                        if (input) input.value = '';
                    });
                }
                updateSolveIndicators();
            });
        }
    });
    
    // Initial update of solve indicators
    setTimeout(() => {
        updateSolveIndicators();
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', () => {
        document.getElementById('input-screen').classList.remove('active');
        document.getElementById('formula-selection').classList.add('active');
        currentFormula = null;
        calculator = null;
        if (graphManager) {
            graphManager.clear();
        }
    });
    
    // Main page tab buttons (Formulas/Classification)
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-main-tab');
            switchMainTab(tabName);
        });
    });
    
    // Input screen tab buttons (Calculator/Graph/Classification)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Calculate button
    document.getElementById('calculate-btn').addEventListener('click', performCalculation);
    
    // Classification button (in input screen)
    const classifyBtn = document.getElementById('classify-btn');
    if (classifyBtn) {
        classifyBtn.addEventListener('click', performClassification);
    }
    
    // Main page classification button
    const mainClassifyBtn = document.getElementById('main-classify-btn');
    if (mainClassifyBtn) {
        mainClassifyBtn.addEventListener('click', performMainClassification);
    }
    
    // Protostar checkbox handlers - clear luminosity/white dwarf selection if protostar is checked
    const mainProtostarCheckbox = document.getElementById('main-protostar-checkbox');
    if (mainProtostarCheckbox) {
        mainProtostarCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                const luminositySelect = document.getElementById('main-luminosity-class');
                if (luminositySelect) luminositySelect.value = '';
            }
        });
    }
    
    const protostarCheckbox = document.getElementById('protostar-checkbox');
    if (protostarCheckbox) {
        protostarCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                const luminositySelect = document.getElementById('luminosity-class');
                if (luminositySelect) luminositySelect.value = '';
            }
        });
    }
    
    // Luminosity/White Dwarf dropdown handlers - uncheck protostar if selection is made
    const mainLuminositySelect = document.getElementById('main-luminosity-class');
    if (mainLuminositySelect) {
        mainLuminositySelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const protostarCheckbox = document.getElementById('main-protostar-checkbox');
                if (protostarCheckbox) protostarCheckbox.checked = false;
            }
        });
    }
    
    const luminositySelect = document.getElementById('luminosity-class');
    if (luminositySelect) {
        luminositySelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const protostarCheckbox = document.getElementById('protostar-checkbox');
                if (protostarCheckbox) protostarCheckbox.checked = false;
            }
        });
    }
    
    // Allow Enter key in classification temperature inputs
    const tempInput = document.getElementById('temperature-input');
    if (tempInput) {
        tempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performClassification();
            }
        });
    }
    
    const mainTempInput = document.getElementById('main-temperature-input');
    if (mainTempInput) {
        mainTempInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performMainClassification();
            }
        });
    }
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
        // Get list of constant symbols to exclude
        const constantSymbols = new Set();
        if (currentFormula && currentFormula.constants) {
            Object.keys(currentFormula.constants).forEach(key => {
                constantSymbols.add(key);
                if (key === 'pi' || key === 'π') constantSymbols.add('π');
                if (key === 'G') constantSymbols.add('G');
                if (key === 'c') constantSymbols.add('c');
                if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
            });
        }
        
        const userVariables = currentFormula ? currentFormula.variables.filter(v => !constantSymbols.has(v.symbol)) : [];
        
        userVariables.forEach(variable => {
            const baseUnit = variable.unit;
            const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
            
            // Clear all unit input fields for this variable
            alternativeUnits.forEach(unit => {
                const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
                const input = document.getElementById(inputId);
                if (input) input.value = '';
            });
        });
        
        document.getElementById('result-display').classList.remove('show');
        updateGraph();
        updateSolveIndicators();
    });
    
    // Allow Enter key to calculate
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && document.getElementById('input-screen').classList.contains('active')) {
            performCalculation();
        }
    });
}

// Switch between main page tabs (Formulas/Classification/Desmos)
function switchMainTab(tabName) {
    // Update main tab buttons
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-main-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update main tab content
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'formulas') {
        document.getElementById('main-formulas-tab').classList.add('active');
    } else if (tabName === 'classification') {
        document.getElementById('main-classification-tab').classList.add('active');
        // Initialize classifier if needed
        if (!stellarClassifier) {
            stellarClassifier = new StellarClassifier();
        }
    } else if (tabName === 'desmos') {
        document.getElementById('main-desmos-tab').classList.add('active');
        
        // Initialize standalone Desmos calculator (full-featured, not formula-linked)
        // Wait longer to ensure tab is fully visible
        setTimeout(() => {
            if (typeof Desmos === 'undefined') {
                // Wait for Desmos to load
                let attempts = 0;
                const maxAttempts = 30;
                const checkDesmos = setInterval(() => {
                    attempts++;
                    if (typeof Desmos !== 'undefined') {
                        clearInterval(checkDesmos);
                        // Try initialization with retry
                        let initAttempts = 0;
                        const initInterval = setInterval(() => {
                            initAttempts++;
                            if (initMainDesmosCalculator()) {
                                clearInterval(initInterval);
                            } else if (initAttempts >= 10) {
                                clearInterval(initInterval);
                                console.error('Failed to initialize Desmos after multiple attempts');
                            }
                        }, 200);
                    } else if (attempts >= maxAttempts) {
                        console.warn('Desmos API failed to load after multiple attempts');
                        const container = document.getElementById('main-desmos-graph');
                        if (container) {
                            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Desmos API failed to load. Please refresh the page.</p><p style="font-size: 0.9em; color: #999;">Make sure you have an internet connection.</p></div>';
                        }
                        clearInterval(checkDesmos);
                    }
                }, 200);
            } else {
                // Desmos is loaded, try to initialize
                let initAttempts = 0;
                const initInterval = setInterval(() => {
                    initAttempts++;
                    if (initMainDesmosCalculator()) {
                        clearInterval(initInterval);
                    } else if (initAttempts >= 10) {
                        clearInterval(initInterval);
                        console.error('Failed to initialize Desmos after multiple attempts');
                    }
                }, 200);
            }
        }, 200);
    }
}

// Switch between calculator, graph, and classification tabs (in input screen)
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'calculator') {
        document.getElementById('calculator-tab').classList.add('active');
    } else if (tabName === 'graph') {
        document.getElementById('graph-tab').classList.add('active');
        
        // Ensure graph manager is initialized
        if (!graphManager) {
            graphManager = new GraphManager();
        }
        
        // Initialize Desmos if not already done (wait for tab to be visible)
        setTimeout(() => {
            if (graphManager) {
                const wasInitialized = graphManager.calculator !== undefined;
                const initialized = initializeGraphManager(graphManager);
                
                if (initialized && currentFormula) {
                    // Update graph after initialization
                    updateGraph();
                    // Also update interpretation graph if it exists
                    if (graphInterpretationManager && graphInterpretationManager.calculator && currentFormula) {
                        const currentValues = getCurrentVariableValues();
                        graphInterpretationManager.updateGraph(currentFormula, currentValues);
                    }
                } else if (wasInitialized && currentFormula) {
                    // Already initialized, just update
                    updateGraph();
                    if (graphInterpretationManager && graphInterpretationManager.calculator && currentFormula) {
                        const currentValues = getCurrentVariableValues();
                        graphInterpretationManager.updateGraph(currentFormula, currentValues);
                    }
                }
            }
        }, 150);
    } else if (tabName === 'graph-interpretation') {
        document.getElementById('graph-interpretation-tab').classList.add('active');
        // Initialize graph in interpretation tab if not already done
        if (!graphInterpretationManager) {
            graphInterpretationManager = new GraphManager('graph-interpretation-desmos', 'graph-interpretation-tab');
        }
        // Update interpretation content and graph when tab is switched
        setTimeout(() => {
            updateGraphInterpretation();
            // Initialize or update the Desmos graph in interpretation tab
            if (currentFormula) {
                const graphContainer = document.getElementById('graph-interpretation-desmos');
                if (graphContainer) {
                    const initialized = initializeGraphManager(graphInterpretationManager, 'graph-interpretation-desmos', 'graph-interpretation-tab');
                    // Update graph with current values
                    if (initialized || graphInterpretationManager.calculator) {
                        setTimeout(() => {
                            const currentValues = getCurrentVariableValues();
                            graphInterpretationManager.updateGraph(currentFormula, currentValues);
                    }, 200);
                }
            }
            }
        }, 100);
    } else if (tabName === 'classification') {
        document.getElementById('classification-tab').classList.add('active');
        // Initialize classifier if needed
        if (!stellarClassifier) {
            stellarClassifier = new StellarClassifier();
        }
    }
}

// Get current variable values from inputs
function getCurrentVariableValues() {
    const variableValues = {};
    if (!currentFormula) return variableValues;
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Collect current variable values using ID-based approach with data-unit-index fallback
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        // Find which input field has a value (use ID-based selection with fallback)
        let foundValue = null;
        let foundUnit = null;
        
        for (let i = 0; i < alternativeUnits.length; i++) {
            const unit = alternativeUnits[i];
            // Primary: ID-based selection
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            let input = document.getElementById(inputId);
            
            // Fallback: data-unit-index selector (for robustness)
            if (!input) {
                input = document.querySelector(`input[data-symbol="${variable.symbol}"][data-unit-index="${i}"]`);
            }
            
            if (input) {
                const value = input.value.trim();
                if (value && 
                    value.toLowerCase() !== 'null' && 
                    value.toLowerCase() !== 'n/a' && 
                    value.toLowerCase() !== 'na' &&
                    value.toLowerCase() !== 'idk') {
                    foundValue = value;
                    foundUnit = unit;
                    break;
                }
            }
        }
        
        if (foundValue) {
            try {
                const parsedValue = ExpressionParser.parse(foundValue, foundUnit);
                if (parsedValue !== null && typeof parsedValue === 'number' && !isNaN(parsedValue) && isFinite(parsedValue)) {
                    const baseValue = UnitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
                    variableValues[variable.symbol] = baseValue;
                }
            } catch (e) {
                // Skip invalid values
            }
        }
    });
    
    return variableValues;
}

// Update graph based on current inputs
function updateGraph() {
    if (!currentFormula || !graphManager) return;
    
    const variableValues = getCurrentVariableValues();
    graphManager.updateGraph(currentFormula, variableValues);
}

// Perform the calculation
function performCalculation() {
    if (!calculator || !currentFormula) {
        return;
    }
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Collect variable values
    const variableValues = {};
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        // Find which input field has a value (ID-based with data-unit-index fallback)
        let foundValue = null;
        let foundUnit = null;
        
        for (let i = 0; i < alternativeUnits.length; i++) {
            const unit = alternativeUnits[i];
            // Primary: ID-based selection
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            let input = document.getElementById(inputId);
            
            // Fallback: data-unit-index selector (for robustness)
            if (!input) {
                input = document.querySelector(`input[data-symbol="${variable.symbol}"][data-unit-index="${i}"]`);
            }
            
            if (input) {
                const value = input.value.trim();
                if (value && 
                    value.toLowerCase() !== 'null' && 
                    value.toLowerCase() !== 'n/a' && 
                    value.toLowerCase() !== 'na' &&
                    value.toLowerCase() !== 'idk') {
                    foundValue = value;
                    foundUnit = unit;
                    break;
                }
            }
        }
        
        // Check for N/A checkbox
        const naCheckbox = document.querySelector(`.na-checkbox[data-symbol="${variable.symbol}"]`);
        const isNA = naCheckbox && naCheckbox.checked;
        
        // Convert 'null', 'N/A', 'IDK', empty, or N/A checkbox to null
        if (!foundValue || foundValue === '' || 
            foundValue.toLowerCase() === 'null' || 
            foundValue.toLowerCase() === 'n/a' || 
            foundValue.toLowerCase() === 'na' ||
            foundValue.toLowerCase() === 'idk' ||
            isNA) {
            variableValues[variable.symbol] = isNA ? 'N/A' : null;
        } else {
            // Try to parse as mathematical expression
            try {
                // Pass the unit to the parser so it can handle degree/radian conversion
                const parsedValue = ExpressionParser.parse(foundValue, foundUnit);
                if (parsedValue === null) {
                    variableValues[variable.symbol] = null;
                } else if (typeof parsedValue === 'number' && !isNaN(parsedValue) && isFinite(parsedValue)) {
                    // Convert to base unit
                    const baseValue = UnitConverter.convertToBase(parsedValue, foundUnit, baseUnit);
                    variableValues[variable.symbol] = baseValue;
                } else {
                    throw new Error(`Could not parse "${foundValue}" as a number`);
                }
            } catch (error) {
                // Show a more helpful error message
                const isAngle = baseUnit.toLowerCase().includes('radian') || baseUnit.toLowerCase().includes('rad');
                const angleHint = isAngle ? ' You can use degrees (45°) or radians (pi/4).' : '';
                displayError(`Invalid input for ${variable.symbol}: "${foundValue}". ${error.message || 'Please enter a number or mathematical expression (e.g., pi/4, 2*pi, etc.)'}${angleHint}`);
                return;
            }
        }
    });
    
    // Perform calculation
    try {
        const result = calculator.solve(variableValues);
        displayResult(result);
        // Update graph after calculation
        updateGraph();
            // Also update interpretation graph if it exists
            if (graphInterpretationManager && graphInterpretationManager.calculator && currentFormula) {
                const currentValues = getCurrentVariableValues();
                graphInterpretationManager.updateGraph(currentFormula, currentValues);
            }
            // Update solve indicators
            updateSolveIndicators();
    } catch (error) {
            // Improve error messages
            let errorMessage = error.message;
            if (errorMessage.includes('null values')) {
                errorMessage = 'You can leave multiple variables empty or mark them as N/A to get a symbolic expression. For a numeric result, leave exactly one variable empty.';
            } else if (errorMessage.includes('must be null') || errorMessage.includes('must be unknown')) {
                errorMessage = 'Please leave at least one variable empty (or set to "null") to solve for it, or mark variables as N/A for symbolic results.';
            } else if (errorMessage.includes('Invalid number')) {
                errorMessage = 'Please enter valid numbers. You can use expressions like "2*pi", "1e10", or "45°" for angles. Use "N/A" for variables you don\'t know.';
            }
            displayError(errorMessage);
    }
}

// Display calculation result
function displayResult(result) {
    const resultDisplay = document.getElementById('result-display');
    const varInfo = currentFormula.variables.find(v => v.symbol === result.variable);
    
    // Check if this is a symbolic result
    if (result.isSymbolic || (typeof result.value === 'string' && 
        (result.value.includes('√') || result.value.includes('×') || 
         result.value.includes('log') || result.value.includes('^') ||
         result.value.match(/[a-zA-Z_]/)))) {
        displaySymbolicResult(result, varInfo);
        return;
    }
    
    // Ensure result.value is always a numeric value, not an expression
    let numericValue = result.value;
    if (typeof numericValue === 'string') {
        // If somehow we got a string, try to parse it
        try {
            numericValue = ExpressionParser.parse(numericValue);
        } catch (e) {
            numericValue = parseFloat(numericValue);
            if (isNaN(numericValue)) {
                displayError('Invalid result value. Please check your inputs.');
                return;
            }
        }
    }
    
    // Ensure it's a finite number
    if (!isFinite(numericValue)) {
        displayError('Result is not a finite number. Please check your inputs.');
        return;
    }
    
    // Format the original value (always numeric)
    const formattedValue = UnitConverter.formatNumber(numericValue);
    const unitName = UnitConverter.formatUnit(result.unit);
    
    // Get unit conversion
    const conversion = UnitConverter.convertAndFormat(numericValue, result.unit);
    
    // Build result HTML
    let resultHTML = `
        <h3>Result</h3>
        <div class="result-value">${formattedValue}</div>
        <div class="result-unit">${varInfo.name} (${result.unit})</div>
        <div class="result-unit-full">${unitName}</div>
    `;
    
    // Add converted value if available
    if (conversion && conversion.unit && conversion.unit !== result.unit && conversion.value !== numericValue) {
        const convertedFormatted = UnitConverter.formatNumber(conversion.value);
        const convertedUnitName = UnitConverter.formatUnit(conversion.unit);
        resultHTML += `
            <div class="result-converted">
                <div class="converted-label">Also:</div>
                <div class="converted-value">${convertedFormatted} ${conversion.unit}</div>
                <div class="converted-unit">${convertedUnitName}</div>
            </div>
        `;
    }
    
    // For radians, always show degrees conversion if not already shown
    const isRadians = result.unit.toLowerCase().includes('radian') || result.unit.toLowerCase().includes('rad');
    if (isRadians && (!conversion || conversion.unit !== 'degrees')) {
        const degreesValue = numericValue * 180 / Math.PI;
        const degreesFormatted = UnitConverter.formatNumber(degreesValue);
        resultHTML += `
            <div class="result-converted">
                <div class="converted-label">Also in degrees:</div>
                <div class="converted-value">${degreesFormatted}°</div>
                <div class="converted-unit">degrees</div>
            </div>
        `;
    }
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
    
    // Scroll to result
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display error message
function displayError(message) {
    const resultDisplay = document.getElementById('result-display');
    resultDisplay.innerHTML = `
        <div class="error-message">${message}</div>
    `;
    resultDisplay.classList.add('show');
    
    // Scroll to error
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display symbolic result (when N/A variables are used)
function displaySymbolicResult(result, varInfo) {
    const resultDisplay = document.getElementById('result-display');
    
    const expression = result.value;
    const unitName = UnitConverter.formatUnit(result.unit);
    
    let resultHTML = `
        <h3>Symbolic Result</h3>
    `;
    
    // If we have a system of equations, display all of them
    if (result.allEquations && result.allEquations.length > 1) {
        resultHTML += `<div class="system-of-equations">`;
        result.allEquations.forEach((eq, index) => {
            const eqVarInfo = currentFormula.variables.find(v => v.symbol === eq.variable);
            resultHTML += `
                <div class="equation-item">
                    <div class="result-value symbolic-result">${eq.variable} = ${eq.expression}</div>
                    <div class="result-unit">${eqVarInfo ? eqVarInfo.name : eq.variable} (${eq.unit})</div>
                </div>
            `;
        });
        resultHTML += `</div>`;
    } else {
        // Single equation
        resultHTML += `
            <div class="result-value symbolic-result">${result.variable} = ${expression}</div>
            <div class="result-unit">${varInfo.name} (${result.unit})</div>
            <div class="result-unit-full">${unitName}</div>
        `;
    }
    
    if (result.otherUnknowns && result.otherUnknowns.length > 0) {
        const otherVars = result.otherUnknowns.map(symbol => {
            const v = currentFormula.variables.find(v => v.symbol === symbol);
            return v ? `${symbol} (${v.name})` : symbol;
        }).join(', ');
        resultHTML += `
            <div class="symbolic-note">
                <p><strong>Note:</strong> This expression also depends on: ${otherVars}</p>
                <p>Enter values for these variables to get a numeric result, or mark them as N/A to keep them as variables.</p>
            </div>
        `;
    } else if (!result.allEquations || result.allEquations.length === 1) {
        resultHTML += `
            <div class="symbolic-note">
                <p><strong>Note:</strong> This is a symbolic expression. Enter values for all variables to get a numeric result.</p>
            </div>
        `;
    }
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
    
    // Scroll to result
    resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Perform stellar classification
function performClassification() {
    if (!stellarClassifier) {
        stellarClassifier = new StellarClassifier();
    }
    
    const temperatureInput = document.getElementById('temperature-input');
    const luminositySelect = document.getElementById('luminosity-class');
    const protostarCheckbox = document.getElementById('protostar-checkbox');
    const resultDisplay = document.getElementById('classification-result');
    
    if (!temperatureInput || !resultDisplay) {
        return;
    }
    
    const temperature = parseFloat(temperatureInput.value);
    const selectedValue = luminositySelect ? luminositySelect.value : '';
    
    // Determine if it's a white dwarf type or luminosity class
    const whiteDwarfTypes = ['DA', 'DB', 'DC', 'DO', 'DQ', 'DZ', 'DX'];
    const isWhiteDwarf = whiteDwarfTypes.includes(selectedValue);
    const whiteDwarfType = isWhiteDwarf ? selectedValue : '';
    const luminosityClass = isWhiteDwarf ? '' : selectedValue;
    
    const isProtostar = protostarCheckbox ? protostarCheckbox.checked : false;
    
    // Validate input
    if (!temperature || isNaN(temperature) || temperature <= 0) {
        displayClassificationError('Please enter a valid temperature (positive number in Kelvin)');
        return;
    }
    
    try {
        const classification = stellarClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
        displayClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
    } catch (error) {
        displayClassificationError(error.message);
    }
}

// Display classification result
function displayClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
    const resultDisplay = document.getElementById('classification-result');
    if (!resultDisplay) return;
    
    let resultHTML = '<div class="classification-result-content">';
    resultHTML += '<h4>Classification Result</h4>';
    resultHTML += `<div class="classification-value">${classification}</div>`;
    
    // Add details
    resultHTML += '<div class="classification-details">';
    resultHTML += `<p><strong>Temperature:</strong> ${UnitConverter.formatNumber(temperature)} K</p>`;
    
    if (isWhiteDwarf && whiteDwarfType) {
        const wdDesc = stellarClassifier.getWhiteDwarfDescription(whiteDwarfType);
        resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
        resultHTML += `<p><strong>White Dwarf Type:</strong> ${whiteDwarfType} (${wdDesc})</p>`;
    } else if (isProtostar) {
        resultHTML += '<p><strong>Type:</strong> Young Stellar Object (YSO)</p>';
    } else {
        if (luminosityClass) {
            const desc = stellarClassifier.getLuminosityDescription(luminosityClass);
            resultHTML += `<p><strong>Luminosity Class:</strong> ${luminosityClass} (${desc})</p>`;
        }
    }
    resultHTML += '</div>';
    
    resultHTML += '</div>';
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
}

// Perform classification from main page
function performMainClassification() {
    if (!stellarClassifier) {
        stellarClassifier = new StellarClassifier();
    }
    
    const temperatureInput = document.getElementById('main-temperature-input');
    const luminositySelect = document.getElementById('main-luminosity-class');
    const protostarCheckbox = document.getElementById('main-protostar-checkbox');
    const resultDisplay = document.getElementById('main-classification-result');
    
    if (!temperatureInput || !resultDisplay) {
        return;
    }
    
    const temperature = parseFloat(temperatureInput.value);
    const selectedValue = luminositySelect ? luminositySelect.value : '';
    
    // Determine if it's a white dwarf type or luminosity class
    const whiteDwarfTypes = ['DA', 'DB', 'DC', 'DO', 'DQ', 'DZ', 'DX'];
    const isWhiteDwarf = whiteDwarfTypes.includes(selectedValue);
    const whiteDwarfType = isWhiteDwarf ? selectedValue : '';
    const luminosityClass = isWhiteDwarf ? '' : selectedValue;
    
    const isProtostar = protostarCheckbox ? protostarCheckbox.checked : false;
    
    // Validate input
    if (!temperature || isNaN(temperature) || temperature <= 0) {
        displayMainClassificationError('Please enter a valid temperature (positive number in Kelvin)');
        return;
    }
    
    try {
        const classification = stellarClassifier.classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
        displayMainClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType);
    } catch (error) {
        displayMainClassificationError(error.message);
    }
}

// Display classification result on main page
function displayMainClassificationResult(classification, temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
    const resultDisplay = document.getElementById('main-classification-result');
    if (!resultDisplay) return;
    
    let resultHTML = '<div class="classification-result-content">';
    resultHTML += '<h4>Classification Result</h4>';
    resultHTML += `<div class="classification-value">${classification}</div>`;
    
    // Add details
    resultHTML += '<div class="classification-details">';
    resultHTML += `<p><strong>Temperature:</strong> ${UnitConverter.formatNumber(temperature)} K</p>`;
    
    if (isWhiteDwarf && whiteDwarfType) {
        const wdDesc = stellarClassifier.getWhiteDwarfDescription(whiteDwarfType);
        resultHTML += `<p><strong>Type:</strong> White Dwarf</p>`;
        resultHTML += `<p><strong>White Dwarf Type:</strong> ${whiteDwarfType} (${wdDesc})</p>`;
    } else if (isProtostar) {
        resultHTML += '<p><strong>Type:</strong> Young Stellar Object (YSO)</p>';
    } else {
        if (luminosityClass) {
            const desc = stellarClassifier.getLuminosityDescription(luminosityClass);
            resultHTML += `<p><strong>Luminosity Class:</strong> ${luminosityClass} (${desc})</p>`;
        }
    }
    resultHTML += '</div>';
    
    resultHTML += '</div>';
    
    resultDisplay.innerHTML = resultHTML;
    resultDisplay.classList.add('show');
}

// Display classification error on main page
function displayMainClassificationError(message) {
    const resultDisplay = document.getElementById('main-classification-result');
    if (!resultDisplay) return;
    
    resultDisplay.innerHTML = `
        <div class="classification-error">${message}</div>
    `;
    resultDisplay.classList.add('show');
}

// Display classification error (in input screen)
function displayClassificationError(message) {
    const resultDisplay = document.getElementById('classification-result');
    if (!resultDisplay) return;
    
    resultDisplay.innerHTML = `
        <div class="classification-error">${message}</div>
    `;
    resultDisplay.classList.add('show');
}

// Get example value for a variable based on its symbol and unit
function getExampleValue(symbol, unit) {
    const examples = {
        'T': { 'seconds': '86400', 'years': '1', 'hours': '24' },
        'a': { 'meters': '1.5e11', 'AU': '1' },
        'M': { 'kg': '1.989e30', 'M_☉': '1' },
        'v': { 'm/s': '30000', 'km/s': '30' },
        'r': { 'meters': '6.37e6', 'km': '6371' },
        'd': { 'meters': '1.5e11', 'parsecs': '1', 'AU': '1' },
        'R': { 'meters': '6.96e8', 'km': '696000' },
        'L': { 'W': '3.828e26', 'L_☉': '1' },
        'F': { 'W/m²': '1361', 'W/m²': '1e-10' },
        'T': { 'Kelvin': '5778', 'K': '6000' },
        'λmax': { 'meters': '5e-7', 'nm': '500' },
        'θ': { 'radians': '0.01', 'arcseconds': '206265' },
        'p': { 'arcseconds': '0.1', 'radians': '1e-6' },
        'H₀': { 'km/(s·Mpc)': '70' },
        'g': { 'm/s²': '9.81' },
        'ρ': { 'kg/m³': '5500' },
        'P': { 'seconds': '86400', 'years': '1' },
        'P_rot': { 'seconds': '86400', 'hours': '24' }
    };
    
    const unitKey = unit.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (examples[symbol] && examples[symbol][unit]) {
        return examples[symbol][unit];
    }
    // Try to find any example for this symbol
    if (examples[symbol]) {
        const firstKey = Object.keys(examples[symbol])[0];
        return examples[symbol][firstKey];
    }
    return null;
}

// Get variable-specific instruction text
function getVariableInstruction(variable, formula, isWillSolve) {
    const symbol = variable.symbol;
    const name = variable.name;
    const description = variable.description;
    const exampleValue = getExampleValue(symbol, variable.unit);
    
    let instruction = '';
    
    if (isWillSolve) {
        // Instruction when this variable will be solved
        instruction = `💡 <strong>Solving for ${symbol} (${name}):</strong> `;
        
        // Add formula-specific context
        const formulaId = formula.id;
        switch (formulaId) {
            case 'kepler_third_law':
                if (symbol === 'T') {
                    instruction += `Enter the semi-major axis (a) and central mass (M) to calculate the orbital period. For example, Earth's orbit: a = 1.5×10¹¹ m, M = 1.99×10³⁰ kg.`;
                } else if (symbol === 'a') {
                    instruction += `Enter the orbital period (T) and central mass (M) to find the semi-major axis. For example, a 1-year orbit around the Sun: T = 3.16×10⁷ s, M = 1.99×10³⁰ kg.`;
                } else if (symbol === 'M') {
                    instruction += `Enter the orbital period (T) and semi-major axis (a) to determine the central mass. This is useful for finding stellar masses from planetary orbits.`;
                }
                break;
                
            case 'orbital_velocity':
                if (symbol === 'v') {
                    instruction += `Enter the orbital radius (r) and central mass (M) to calculate orbital speed. For Earth: r = 1.5×10¹¹ m, M = 1.99×10³⁰ kg gives v ≈ 30 km/s.`;
                } else if (symbol === 'r') {
                    instruction += `Enter the orbital velocity (v) and central mass (M) to find the orbital radius. Higher velocities mean closer orbits.`;
                } else if (symbol === 'M') {
                    instruction += `Enter the orbital velocity (v) and radius (r) to determine the central mass. This is how we measure stellar masses.`;
                }
                break;
                
            case 'escape_velocity':
                if (symbol === 'v_esc') {
                    instruction += `Enter the radius (r) and mass (M) to find escape velocity. For Earth: r = 6.37×10⁶ m, M = 5.97×10²⁴ kg gives v_esc ≈ 11.2 km/s.`;
                } else if (symbol === 'r') {
                    instruction += `Enter escape velocity (v_esc) and mass (M) to find the radius. Larger masses require larger escape velocities.`;
                } else if (symbol === 'M') {
                    instruction += `Enter escape velocity (v_esc) and radius (r) to determine the mass. This helps characterize planetary and stellar bodies.`;
                }
                break;
                
            case 'angular_size':
                if (symbol === 'θ') {
                    instruction += `Enter the physical diameter (d) and distance (D) to calculate angular size. For the Moon: d = 3.47×10⁶ m, D = 3.84×10⁸ m gives θ ≈ 0.009 rad.`;
                } else if (symbol === 'd') {
                    instruction += `Enter the angular size (θ) and distance (D) to find the physical diameter. Useful for determining sizes of distant objects.`;
                } else if (symbol === 'D') {
                    instruction += `Enter the angular size (θ) and physical diameter (d) to calculate distance. This is the basis of parallax and angular size distance measurements.`;
                }
                break;
                
            case 'distance_modulus':
                if (symbol === 'm') {
                    instruction += `Enter absolute magnitude (M) and distance (d) to find apparent magnitude. Brighter stars have lower (more negative) magnitudes.`;
                } else if (symbol === 'M') {
                    instruction += `Enter apparent magnitude (m) and distance (d) to find absolute magnitude. This tells you the star's intrinsic brightness.`;
                } else if (symbol === 'd') {
                    instruction += `Enter apparent magnitude (m) and absolute magnitude (M) to calculate distance. The difference m - M is called the distance modulus.`;
                }
                break;
                
            case 'luminosity':
                if (symbol === 'L') {
                    instruction += `Enter radius (R) and temperature (T) to calculate luminosity. For the Sun: R = 6.96×10⁸ m, T = 5778 K gives L = 3.83×10²⁶ W.`;
                } else if (symbol === 'R') {
                    instruction += `Enter luminosity (L) and temperature (T) to find the radius. Larger, hotter stars are more luminous.`;
                } else if (symbol === 'T') {
                    instruction += `Enter luminosity (L) and radius (R) to determine temperature. This is the Stefan-Boltzmann law.`;
                }
                break;
                
            case 'hubble_law':
                if (symbol === 'v') {
                    instruction += `Enter distance (d) and Hubble constant (H₀) to find recessional velocity. For d = 100 Mpc and H₀ = 70 km/(s·Mpc), v = 7000 km/s.`;
                } else if (symbol === 'd') {
                    instruction += `Enter recessional velocity (v) and Hubble constant (H₀) to calculate distance. This measures how far galaxies are based on their redshift.`;
                } else if (symbol === 'H₀') {
                    instruction += `Enter recessional velocity (v) and distance (d) to determine the Hubble constant. Current value is approximately 70 km/(s·Mpc).`;
                }
                break;
                
            case 'wiens_law':
                if (symbol === 'λmax') {
                    instruction += `Enter temperature (T) to find peak wavelength. For the Sun (T = 5778 K), λmax ≈ 500 nm (visible light). Hotter objects peak at shorter wavelengths.`;
                } else if (symbol === 'T') {
                    instruction += `Enter peak wavelength (λmax) to determine temperature. This is how we measure stellar temperatures from spectra.`;
                }
                break;
                
            case 'parallax_distance_arcsec':
                if (symbol === 'd') {
                    instruction += `Enter parallax angle (p) in arcseconds to find distance in parsecs. For p = 0.1 arcsec, d = 10 parsecs. This is the fundamental distance measurement.`;
                } else if (symbol === 'p') {
                    instruction += `Enter distance (d) in parsecs to find parallax angle. Closer stars have larger parallax angles.`;
                }
                break;
                
            case 'binary_white_dwarf':
                if (symbol === 'P') {
                    instruction += `Enter the semi-major axis (a) and both white dwarf masses (M₁, M₂) to calculate orbital period. Binary white dwarfs are important sources of gravitational waves.`;
                } else if (symbol === 'a') {
                    instruction += `Enter the orbital period (P) and both white dwarf masses (M₁, M₂) to find the semi-major axis. Close binaries emit gravitational waves.`;
                } else if (symbol === 'M1' || symbol === 'M2') {
                    instruction += `Enter the orbital period (P), semi-major axis (a), and the other white dwarf mass to determine this mass. White dwarfs typically have masses 0.5-1.4 M☉.`;
                }
                break;
                
            case 'white_dwarf_merger_timescale':
                if (symbol === 't_merge') {
                    instruction += `Enter the semi-major axis (a) and both white dwarf masses (M₁, M₂) to calculate merger timescale. Typical timescales range from millions to billions of years.`;
                } else if (symbol === 'a') {
                    instruction += `Enter the merger timescale (t_merge) and both white dwarf masses (M₁, M₂) to find the required semi-major axis. Closer binaries merge faster.`;
                }
                break;
                
            case 'flux_from_luminosity':
                if (symbol === 'F') {
                    instruction += `Enter luminosity (L) and distance (d) to calculate observed flux. Flux decreases as 1/d² (inverse square law).`;
                } else if (symbol === 'L') {
                    instruction += `Enter observed flux (F) and distance (d) to find intrinsic luminosity. This tells you how bright the source really is.`;
                } else if (symbol === 'd') {
                    instruction += `Enter luminosity (L) and observed flux (F) to determine distance. This is the basis of standard candle distance measurements.`;
                }
                break;
                
            default:
                // Generic instruction
                if (exampleValue) {
                    instruction += `Enter values for all other variables to calculate ${name}. Example value for ${symbol}: ${exampleValue} ${variable.unit}.`;
                } else {
                    instruction += `Enter values for all other variables to calculate ${name}. ${description}`;
                }
                break;
        }
    } else {
        // Instruction when this variable is provided
        instruction = `💡 <strong>About ${symbol} (${name}):</strong> `;
        instruction += description;
        if (exampleValue) {
            instruction += ` Typical values: around ${exampleValue} ${variable.unit}.`;
        }
    }
    
    return instruction;
}

// Update visual indicators for which variable will be solved
function updateSolveIndicators() {
    if (!currentFormula) return;
    
    // Get list of constant symbols to exclude
    const constantSymbols = new Set();
    if (currentFormula.constants) {
        Object.keys(currentFormula.constants).forEach(key => {
            constantSymbols.add(key);
            if (key === 'pi' || key === 'π') constantSymbols.add('π');
            if (key === 'G') constantSymbols.add('G');
            if (key === 'c') constantSymbols.add('c');
            if (key === 'σ' || key === 'sigma') constantSymbols.add('σ');
        });
    }
    
    const userVariables = currentFormula.variables.filter(v => !constantSymbols.has(v.symbol));
    
    // Count how many variables have values
    let filledCount = 0;
    let emptyVar = null;
    const variableStates = [];
    
    userVariables.forEach(variable => {
        const baseUnit = variable.unit;
        const alternativeUnits = UnitConverter.getAlternativeUnits(baseUnit);
        
        let hasValue = false;
        for (const unit of alternativeUnits) {
            const inputId = `var-${variable.symbol}-${unit.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const input = document.getElementById(inputId);
            if (input) {
                const value = input.value.trim();
                if (value && value.toLowerCase() !== 'null') {
                    hasValue = true;
                    break;
                }
            }
        }
        
        variableStates.push({
            variable: variable,
            hasValue: hasValue
        });
        
        if (hasValue) {
            filledCount++;
        } else {
            emptyVar = variable;
        }
        
        // Update hint visibility
        const hint = document.querySelector(`.solve-hint[data-symbol="${variable.symbol}"]`);
        if (hint) {
            if (hasValue) {
                hint.style.display = 'none';
            } else {
                hint.style.display = 'inline';
                if (filledCount === userVariables.length - 1) {
                    hint.textContent = '← Will solve for this';
                    hint.classList.add('will-solve');
                } else {
                    hint.textContent = 'Leave empty to solve';
                    hint.classList.remove('will-solve');
                }
            }
        }
    });
    
    // Update instruction banner based on current state
    updateInstructionBanner(variableStates, emptyVar, filledCount, userVariables.length);
}

// Update the instruction banner with variable-specific information
function updateInstructionBanner(variableStates, emptyVar, filledCount, totalVars) {
    const instructionDiv = document.getElementById('calculator-instructions');
    if (!instructionDiv || !currentFormula) return;
    
    let instructionHTML = '';
    
    if (filledCount === 0) {
        // No values entered yet
        instructionHTML = `💡 <strong>Getting started:</strong> Enter values for ${totalVars - 1} variables, leaving one empty to solve for it. You can also mark variables as "N/A" to get a symbolic expression. Each variable has specific examples and context shown below.`;
    } else if (filledCount === totalVars - 1 && emptyVar) {
        // Ready to solve - show instruction for the variable being solved
        instructionHTML = getVariableInstruction(emptyVar, currentFormula, true);
    } else if (filledCount === totalVars) {
        // All filled - need to clear one
        instructionHTML = `💡 <strong>All variables filled:</strong> Clear one variable (or set to "null") to solve for it. The calculator needs exactly one unknown variable.`;
    } else {
        // Partially filled - show info about what's missing
        const missingVars = variableStates.filter(vs => !vs.hasValue);
        if (missingVars.length === 1) {
            instructionHTML = getVariableInstruction(missingVars[0].variable, currentFormula, true);
        } else {
            const missingNames = missingVars.map(vs => vs.variable.symbol).join(', ');
            instructionHTML = `💡 <strong>Progress:</strong> You've entered ${filledCount} of ${totalVars} variables. Still need values for: ${missingNames}. Leave one empty to solve for it.`;
        }
    }
    
    instructionDiv.innerHTML = `<p>${instructionHTML}</p>`;
}

// Update graph interpretation content
function updateGraphInterpretation() {
    const contentDiv = document.getElementById('graph-interpretation-content');
    if (!contentDiv || !currentFormula) {
        if (contentDiv) {
            contentDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No formula selected. Please select a formula from the main page.</p>';
        }
        return;
    }
    
    // Generate interpretation content based on the formula
    let interpretationHTML = '<div class="interpretation-section">';
    interpretationHTML += `<h4>Understanding the Graph for: ${currentFormula.name}</h4>`;
    interpretationHTML += `<div class="formula-display-interpretation"><strong>Formula:</strong> ${currentFormula.equation}</div>`;
    
    // Add general interpretation guidance
    interpretationHTML += '<div class="interpretation-guide">';
    interpretationHTML += '<h5>How to Read This Graph</h5>';
    interpretationHTML += '<ul class="interpretation-list">';
    interpretationHTML += '<li><strong>X-Axis:</strong> Represents the independent variable (the variable you vary).</li>';
    interpretationHTML += '<li><strong>Y-Axis:</strong> Represents the dependent variable (the result you\'re calculating).</li>';
    interpretationHTML += '<li><strong>Curve Shape:</strong> Shows how the relationship changes - linear, exponential, inverse, etc.</li>';
    interpretationHTML += '<li><strong>Steepness:</strong> Indicates how sensitive the result is to changes in the input variable.</li>';
    interpretationHTML += '</ul>';
    interpretationHTML += '</div>';
    
    // Add formula-specific interpretation
    const formulaSpecific = getFormulaSpecificInterpretation(currentFormula);
    if (formulaSpecific) {
        interpretationHTML += '<div class="interpretation-formula-specific">';
        interpretationHTML += formulaSpecific;
        interpretationHTML += '</div>';
    }
    
    // Add tips
    interpretationHTML += '<div class="interpretation-tips">';
    interpretationHTML += '<h5>Tips for Using This Graph</h5>';
    interpretationHTML += '<ul class="interpretation-list">';
    interpretationHTML += '<li>Leave one variable as "null" in the Calculator tab to see how it varies with other variables.</li>';
    interpretationHTML += '<li>Use the graph to estimate values before calculating exact results.</li>';
    interpretationHTML += '<li>Observe the shape to understand the mathematical relationship (linear, quadratic, inverse, etc.).</li>';
    interpretationHTML += '<li>Check for asymptotes, intercepts, and other key features that reveal physical meaning.</li>';
    interpretationHTML += '</ul>';
    interpretationHTML += '</div>';
    
    interpretationHTML += '</div>';
    
    contentDiv.innerHTML = interpretationHTML;
}

// Get formula-specific interpretation content
function getFormulaSpecificInterpretation(formula) {
    const formulaId = formula.id;
    let content = '';
    
    switch (formulaId) {
        case 'angular_size':
            content = '<h5>Angular Size Graph</h5>';
            content += '<p>This graph shows how angular size (θ) changes with distance (D) or physical size (d).</p>';
            content += '<ul><li>As distance increases, angular size decreases (inverse relationship).</li>';
            content += '<li>The curve approaches zero as distance becomes very large.</li>';
            content += '<li>For a fixed distance, larger objects have larger angular sizes.</li></ul>';
            break;
            
        case 'orbital_velocity':
            content = '<h5>Orbital Velocity Graph Interpretation</h5>';
            content += '<p><strong>What this graph shows:</strong> This graph displays orbital velocity (v) as a function of orbital radius (r) for a given central mass (M).</p>';
            content += '<h6>Key Features to Observe:</h6>';
            content += '<ul class="interpretation-list">';
            content += '<li><strong>Inverse Square Root Relationship:</strong> Velocity decreases as radius increases, following v = √(GM/r). The curve is steep near the origin and flattens as radius increases.</li>';
            content += '<li><strong>Physical Meaning:</strong> Objects closer to the central mass orbit faster. This is why inner planets orbit the Sun faster than outer planets.</li>';
            content += '<li><strong>Asymptotic Behavior:</strong> As radius approaches infinity, velocity approaches zero. As radius approaches zero, velocity approaches infinity (though physically limited).</li>';
            content += '<li><strong>Kepler\'s Laws:</strong> This curve demonstrates Kepler\'s second law - planets sweep equal areas in equal times, requiring faster speeds at smaller distances.</li>';
            content += '</ul>';
            content += '<h6>How to Use This Graph:</h6>';
            content += '<ul class="interpretation-list">';
            content += '<li>Enter values for M (central mass) and leave r as null to see how velocity changes with distance.</li>';
            content += '<li>Try different values of M to see how more massive objects require higher orbital velocities at the same distance.</li>';
            content += '<li>Notice how small changes in radius near the central mass cause large changes in velocity.</li>';
            content += '<li>Compare this graph with escape velocity to understand the difference between orbital and escape speeds.</li>';
            content += '</ul>';
            break;
            
        case 'escape_velocity':
            content = '<h5>Escape Velocity Graph</h5>';
            content += '<p>This graph shows escape velocity as a function of distance from the central mass.</p>';
            content += '<ul><li>Escape velocity decreases with distance (inverse square root relationship).</li>';
            content += '<li>Closer objects need higher velocities to escape.</li>';
            content += '<li>The curve is steeper than orbital velocity for the same conditions.</li></ul>';
            break;
            
        case 'hubble_law':
            content = '<h5>Hubble Law Graph</h5>';
            content += '<p>This graph shows the linear relationship between recessional velocity and distance.</p>';
            content += '<ul><li>The graph is a straight line (linear relationship).</li>';
            content += '<li>The slope represents the Hubble constant (H₀).</li>';
            content += '<li>Farther galaxies recede faster, indicating universe expansion.</li></ul>';
            break;
            
        case 'wiens_law':
            content = '<h5>Wien\'s Law Graph</h5>';
            content += '<p>This graph shows peak wavelength as a function of temperature.</p>';
            content += '<ul><li>Peak wavelength decreases as temperature increases (inverse relationship).</li>';
            content += '<li>Hotter objects emit shorter wavelengths (bluer light).</li>';
            content += '<li>The curve shows the relationship between temperature and blackbody radiation.</li></ul>';
            break;
            
        case 'flux_from_luminosity':
            content = '<h5>Flux from Luminosity Graph</h5>';
            content += '<p>This graph shows how flux decreases with distance from a light source.</p>';
            content += '<ul><li>Flux decreases as the square of distance (inverse square law).</li>';
            content += '<li>The curve drops rapidly at first, then more slowly.</li>';
            content += '<li>This demonstrates the inverse square law for light intensity.</li></ul>';
            break;
            
            case 'kepler_third_law':
            content = '<h5>Kepler\'s Third Law Graph Interpretation</h5>';
            content += '<p><strong>What this graph shows:</strong> This graph displays the relationship between orbital period (T) and semi-major axis (a) for a given central mass (M), following T² = (4π²/GM) × a³.</p>';
            content += '<h6>Key Features to Observe:</h6>';
            content += '<ul class="interpretation-list">';
            content += '<li><strong>Power Law Relationship:</strong> Period squared is proportional to semi-major axis cubed. This creates a curve that starts shallow and becomes steeper.</li>';
            content += '<li><strong>Physical Meaning:</strong> Larger orbits have significantly longer periods. Doubling the orbital radius increases the period by about 2.8 times (2^1.5).</li>';
            content += '<li><strong>Mass Dependence:</strong> For a given semi-major axis, more massive central objects result in shorter orbital periods.</li>';
            content += '<li><strong>Kepler\'s Discovery:</strong> This relationship was discovered by Johannes Kepler and applies to all bound orbits, from planets to binary stars.</li>';
            content += '</ul>';
            content += '<h6>How to Use This Graph:</h6>';
            content += '<ul class="interpretation-list">';
            content += '<li>Enter values for M (central mass) and leave T or a as null to see the relationship.</li>';
            content += '<li>Try different masses to see how the curve changes - more massive objects create steeper curves.</li>';
            content += '<li>Notice how small changes in semi-major axis near the origin cause large changes in period.</li>';
            content += '<li>Compare with real planetary data - inner planets have shorter periods than outer planets.</li>';
            content += '</ul>';
            break;
            
        case 'doppler_shift':
            content = '<h5>Doppler Shift Graph</h5>';
            content += '<p>This graph shows how wavelength shift depends on velocity.</p>';
            content += '<ul><li>Positive velocities (receding) cause redshift (positive shift).</li>';
            content += '<li>Negative velocities (approaching) cause blueshift (negative shift).</li>';
            content += '<li>The relationship is linear for non-relativistic speeds.</li></ul>';
            break;
            
        case 'parallax_distance_radians':
        case 'parallax_distance_arcsec':
            content = '<h5>Parallax Distance Graph</h5>';
            content += '<p>This graph shows distance as a function of parallax angle.</p>';
            content += '<ul><li>Distance is inversely proportional to parallax angle.</li>';
            content += '<li>Smaller parallax angles correspond to greater distances.</li>';
            content += '<li>The curve demonstrates the fundamental relationship in stellar distance measurement.</li></ul>';
            break;
            
        case 'flux_temperature':
            content = '<h5>Flux-Temperature Graph</h5>';
            content += '<p>This graph shows how flux depends on temperature (Stefan-Boltzmann law).</p>';
            content += '<ul><li>Flux increases as the fourth power of temperature.</li>';
            content += '<li>The curve rises very steeply, showing strong temperature dependence.</li>';
            content += '<li>Small temperature changes cause large flux changes.</li></ul>';
            break;
            
        default:
            // Generic interpretation for formulas without specific handlers
            content = '<h5>General Graph Interpretation</h5>';
            content += '<p>This graph visualizes the mathematical relationship described by the formula.</p>';
            content += '<ul><li>Observe the overall shape to understand the type of relationship.</li>';
            content += '<li>Look for key features: intercepts, asymptotes, maxima, minima.</li>';
            content += '<li>Use the graph to understand how variables influence each other.</li></ul>';
            break;
    }
    
    return content;
}

// Initialize standalone Desmos calculator for main page
function initMainDesmosCalculator() {
    const container = document.getElementById('main-desmos-graph');
    if (!container) {
        console.error('Main Desmos container not found');
        return false;
    }

    // Check if container is visible
    const tab = container.closest('.main-tab-content');
    if (tab && !tab.classList.contains('active')) {
        console.warn('Desmos container is in hidden tab');
        return false;
    }

    // Ensure container has dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('Desmos container has no dimensions, waiting...');
        setTimeout(() => initMainDesmosCalculator(), 200);
        return false;
    }

    // Destroy existing calculator if it exists
    if (mainDesmosCalculator) {
        try {
            mainDesmosCalculator.destroy();
        } catch (e) {
            console.warn('Error destroying existing Desmos calculator:', e);
        }
        mainDesmosCalculator = null;
    }

    // Clear any error messages
    container.innerHTML = '';

    try {
        // Initialize full-featured Desmos calculator (with keypad and expressions enabled)
        mainDesmosCalculator = Desmos.GraphingCalculator(container, {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            showGrid: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y'
        });
        console.log('Main Desmos calculator initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing main Desmos calculator:', error);
        if (container) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;"><p>Error initializing Desmos calculator: ' + error.message + '</p><p style="font-size: 0.9em; color: #999;">Please refresh the page.</p></div>';
        }
        return false;
    }
}

