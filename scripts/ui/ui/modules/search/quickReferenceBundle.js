/**
 * Curated formula IDs for Olympiad / intro astrophysics “quick reference” searches.
 * Matched when the user types phrases like “cheat sheet” or “quick reference”.
 */
export const QUICK_REFERENCE_QUERY_RE =
    /cheat\s*sheet|quick\s*reference|essential\s*formulas?|astronomy\s*quick|astrophysics\s*quick|mental\s*shortcuts|formula\s*reference\s*sheet/i;

/** @param {string} queryLower normalized lowercase query */
export function matchesQuickReferenceQuery(queryLower) {
    return QUICK_REFERENCE_QUERY_RE.test(String(queryLower || ''));
}

/**
 * One-card-per-topic style bundle: orbits, gravity/BH, SR, photometry, waves/Doppler/cosmology.
 * Keep in sync with formulas.js ids.
 */
export const QUICK_REFERENCE_FORMULA_IDS = new Set([
    'centripetal_force',
    'centripetal_acceleration',
    'period_circular',
    'velocity_ratio_orbital',
    'orbital_velocity',
    'escape_velocity',
    'escape_orbital_velocity_ratio',
    'gravitational_potential_energy',
    'kinetic_energy_translational',
    'orbital_energy_simple',
    'potential_energy_per_mass',
    'schwarzschild_radius',
    'schwarzschild_per_solar_mass',
    'photon_sphere',
    'isco',
    'black_hole_density',
    'gamma_factor',
    'relativistic_energy',
    'relativistic_kinetic',
    'relativistic_momentum',
    'energy_momentum_relation',
    'relativistic_doppler',
    'apparent_magnitude_flux',
    'flux_ratio_magnitude',
    'distance_modulus',
    'luminosity_from_flux_distance',
    'flux_from_luminosity',
    'transit_depth',
    'photon_momentum_energy',
    'de_broglie_wavelength',
    'refractive_index',
    'diffraction_limit_rayleigh',
    'doppler_shift_approx',
    'doppler_velocity_wavelength',
    'observed_wavelength_redshift',
    'observed_frequency_redshift',
    'redshift_definition',
    'redshift_velocity_relativistic',
    'redshift_scale_factor',
    'kepler_third_law',
    'kepler_third_law_solar',
    'total_energy_virial'
]);
