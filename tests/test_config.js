/**
 * Centralized Test Configuration
 * All constants, formula-specific configs, and test parameters in one place
 * 
 * Version: 1.0.0
 * Date: December 23, 2025
 */

// ============================================================================
// PHYSICAL CONSTANTS (SI units, consistent across all tests)
// ============================================================================

const TEST_CONSTANTS = {
    // Fundamental constants — CODATA 2022 / SI 2019 (aligned with scripts/formulas.js)
    G: 6.67430e-11,              // CODATA 2022 (m³/(kg·s²))
    c: 2.99792458e8,              // SI exact (m/s)
    sigma: 5.6703744191844294e-8, // SI exact Stefan-Boltzmann (W/(m²·K⁴))
    h: 6.62607015e-34,            // SI exact (J·s)
    k: 1.380649e-23,              // SI exact (J/K)
    
    // Solar system constants
    M_sun: 1.988409870440e30,     // IAU nominal solar mass (kg); matches M☉ conversions
    L_sun: 3.828e26,              // Solar luminosity (W)
    R_sun: 695700000,             // IAU nominal solar radius (m); matches R☉
    
    // Astronomical units (consistent precision)
    AU: 149597870700,             // IAU 2012 exact astronomical unit (m)
    pc: 3.085677581e16,           // Parsec (m) - consistent precision
    ly: 9.461e15,                 // Light-year (m)
    
    // Earth constants
    M_earth: 5.972e24,            // Earth mass (kg)
    R_earth: 6.371e6,             // Earth radius (m)
    
    // Typical values for test generation
    T_sun: 5778,                  // Solar temperature (K)
    v_earth_orbital: 29780,      // Earth's orbital velocity (m/s)
    F_solar_constant: 1361,       // Solar constant (W/m²)
    lambda_visible: 500e-9,       // Visible wavelength (m)
    parallax_typical: 0.1,        // Typical parallax (arcsec)
    redshift_typical: 0.1,        // Typical redshift
    period_year: 3.15576e7,       // 1 year in seconds
    period_day: 86400,            // 1 day in seconds
};

// ============================================================================
// FORMULA-SPECIFIC CONFIGURATION
// ============================================================================

/**
 * Preferred variables to solve for (formula-specific)
 * Some formulas are better tested by solving for specific variables
 */
const PREFERRED_SOLVE_VARS = {
    kepler_third_law_binary: 'P',
    vis_viva: 'v',
    synodic_period: 'P_syn',
    jeans_mass: 'M_J',
    angular_momentum_elliptical: 'L',
    friedmann_equation: 'H',
    hr_absolute_magnitude: 'M_V',
    orbital_energy: 'E',
    hydrostatic_balance: 'dP_dr',
    power_law_spectrum: 'N',
    period_luminosity_relation_cepheid: 'M_V',
    white_dwarf_orbital_decay: 'da_dt',
    orbital_decay_gravitational_radiation: 'da/dt',
    gravitational_potential_general: 'Φ'
};

/**
 * Formula-specific test value generators
 * Returns test values for a formula, or null to use generic generator
 */
const FORMULA_SPECIFIC_VALUES = {
    power_law_spectrum: () => ({
        N: 100,
        K: 10,
        E: 2.0,  // E ≠ 1 (avoids division by zero)
        p: 2.5
    }),
    
    magnitude_flux_relation: () => ({
        m1: 0,
        m2: 1,
        F1: 100,
        F2: 50
    }),
    
    orbital_energy: () => ({
        E: -1e30,  // Negative for bound orbit
        M: TEST_CONSTANTS.M_sun,
        m: TEST_CONSTANTS.M_earth,
        a: TEST_CONSTANTS.AU
    }),
    
    hydrostatic_balance: () => ({
        dP_dr: -1000,  // Negative for hydrostatic equilibrium
        M: TEST_CONSTANTS.M_sun,
        ρ: 1400,  // Density (kg/m³)
        r: TEST_CONSTANTS.R_sun
    }),
    
    white_dwarf_mass_radius: () => ({
        M: 0.6 * TEST_CONSTANTS.M_sun,
        R: 0.01 * TEST_CONSTANTS.R_sun
    })
};

/**
 * Tolerance configuration per formula type
 */
const TOLERANCE_CONFIG = {
    // Exact formulas - very tight tolerance
    exact: {
        tolerance: 0.001,  // 0.1%
        justification: 'Exact formula; tolerance accounts for numerical precision only',
        formulas: [
            'kepler', 'schwarzschild', 'escape_velocity', 'orbital_velocity',
            'surface_gravity', 'wiens_law', 'luminosity', 'parallax'
        ]
    },
    
    // Empirical relations - looser tolerance
    empirical: {
        tolerance: 0.05,  // 5%
        justification: 'Empirical relation; tolerance accounts for observational scatter',
        formulas: [
            'cepheid', 'period_luminosity', 'mass_luminosity', 'stellar_lifetime'
        ]
    },
    
    // Logarithmic quantities - absolute tolerance
    logarithmic: {
        tolerance: 0.5,  // 0.5 magnitude absolute
        justification: 'Logarithmic quantity; use absolute tolerance (0.5 mag)',
        useAbsoluteTolerance: true,
        formulas: [
            'magnitude', 'distance_modulus', 'absolute_magnitude', 'apparent_magnitude'
        ]
    },
    
    // Default tolerance
    default: {
        tolerance: 0.01,  // 1%
        justification: 'Default tolerance for general formulas'
    }
};

// ============================================================================
// TEST THRESHOLDS
// ============================================================================

const TEST_THRESHOLDS = {
    UNREASONABLE_RESULT: 1e50,      // Results larger than this are unreasonable
    VERY_SMALL_VALUE: 1e-60,       // Values smaller than this are suspicious
    VERY_LARGE_VALUE: 1e60,        // Values larger than this are suspicious
    ZERO_THRESHOLD: 1e-15          // Values smaller than this treated as zero for tolerance
};

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TEST_CONSTANTS,
        PREFERRED_SOLVE_VARS,
        FORMULA_SPECIFIC_VALUES,
        TOLERANCE_CONFIG,
        TEST_THRESHOLDS
    };
}

if (typeof window !== 'undefined') {
    window.TestConfig = {
        TEST_CONSTANTS,
        PREFERRED_SOLVE_VARS,
        FORMULA_SPECIFIC_VALUES,
        TOLERANCE_CONFIG,
        TEST_THRESHOLDS
    };
}

