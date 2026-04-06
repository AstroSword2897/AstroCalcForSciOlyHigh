/**
 * Formula Search Engine Module
 * Extracted from ui.js for better modularity and maintainability
 * 
 * Provides:
 * - Advanced search scoring algorithms
 * - Natural language query parsing
 * - Concept hierarchy expansion
 * - Question pattern matching
 * - Topic-based relevance scoring
 * 
 * This module handles the search logic only - rendering is handled by ui.js
 */

/**
 * Formula Search Engine
 * Handles all search-related logic including scoring, parsing, and matching
 */
class FormulaSearchEngine {
    constructor(options = {}) {
        this.cache = options.cache || null; // Search cache (LRU or Map)
        this.formulas = options.formulas || [];
        this.formulaCategories = options.formulaCategories || {};
        this.getConceptHierarchy = options.getConceptHierarchy || (() => ({}));
        
        // Core concept dictionary for high-signal term matching
        this.coreConceptMap = {
            distance: ['distance', 'parallax', 'luminosity distance', 'distance modulus', 'angular size', 'baseline'],
            brightness: ['brightness', 'flux', 'luminosity', 'magnitude', 'apparent magnitude', 'absolute magnitude'],
            temperature: ['temperature', 'thermal', 'effective temperature', 'surface temperature', 'wien', 'stefan', 'blackbody'],
            mass: ['mass', 'weight', 'chandrasekhar', 'jeans mass', 'barycenter'],
            gravity: ['gravity', 'gravitational', 'surface gravity', 'escape velocity', 'g force'],
            velocity: ['velocity', 'speed', 'orbital velocity', 'escape velocity', 'rotational velocity', 'doppler', 'redshift'],
            period: ['period', 'orbital period', 'synodic', 'rotation period', 'time', 'lifetime'],
            size: ['radius', 'diameter', 'size', 'semi-major axis', 'aperture'],
            energy: ['energy', 'power', 'luminosity', 'photon energy', 'radiation'],
            density: ['density', 'optical depth', 'column density', 'surface brightness']
        };
        
        // Initialize question patterns (large mapping)
        this.initializeQuestionPatterns();
    }
    
    /**
     * Initialize question pattern mappings
     * Maps common question phrases to relevant formulas
     */
    initializeQuestionPatterns() {
        this.questionPatterns = {
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
            'distance to star': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance', 'angular_size_distance'],
                score: 650
            },
            'distance to': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 500
            },
            'find distance': {
                formulas: ['parallax_distance_radians', 'parallax_distance_arcsec', 'distance_modulus', 'luminosity_distance'],
                score: 400
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
            'temperature from wavelength': {
                formulas: ['wiens_law'],
                score: 500
            },
            
            // Period questions
            'how long': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'stellar_lifetime', 'synodic_period', 'white_dwarf_merger_timescale'],
                score: 400
            },
            'what is the period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'synodic_period', 'binary_white_dwarf'],
                score: 400
            },
            'orbital period': {
                formulas: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary', 'binary_white_dwarf'],
                score: 500
            },
            // Practice-test / SciOly question phrases
            'distance to the supernova': { formulas: ['distance_from_magnitude', 'distance_modulus'], score: 600 },
            'type ia': { formulas: ['distance_from_magnitude', 'distance_modulus'], score: 550 },
            'recessional velocity': { formulas: ['hubble_law', 'redshift_velocity_relativistic', 'redshift_velocity_low'], score: 500 },
            'classical redshift': { formulas: ['doppler_shift', 'doppler_velocity_wavelength', 'redshift_definition'], score: 500 },
            'relativistic redshift': { formulas: ['redshift_velocity_relativistic', 'relativistic_doppler'], score: 550 },
            'kepler second law': { formulas: ['kepler_second_law_area_rate', 'angular_momentum_elliptical', 'eccentricity_from_area_rate'], score: 550 },
            'equal area': { formulas: ['kepler_second_law_area_rate', 'angular_momentum_elliptical'], score: 500 },
            'roche lobe': { formulas: ['roche_lobe_spherical', 'L1_point_approximation', 'roche_limit'], score: 550 },
            'L1 lagrangian': { formulas: ['L1_point_approximation', 'roche_lobe_spherical'], score: 550 },
            'RR Lyrae': { formulas: ['distance_from_magnitude', 'distance_modulus'], score: 500 },
            'RS Puppis': { formulas: ['period_luminosity_cepheid_classical', 'period_luminosity_relation_cepheid', 'parallax_distance_arcsec', 'luminosity', 'flux_from_luminosity'], score: 500 },
            'cepheid pulsation': { formulas: ['period_luminosity_relation_cepheid', 'period_luminosity_cepheid_classical'], score: 500 },
            'stellar lifetime': { formulas: ['stellar_lifetime', 'solar_lifetime_efficiency'], score: 500 },
            'exhaust all energy': { formulas: ['solar_lifetime_efficiency', 'stellar_lifetime'], score: 500 },
            'mass luminosity': { formulas: ['mass_luminosity_relation', 'luminosity'], score: 450 },
            'bolometric luminosity': { formulas: ['luminosity_absolute_magnitude', 'luminosity', 'flux_from_luminosity'], score: 500 },
            'parallax luminosity flux': { formulas: ['parallax_distance_arcsec', 'luminosity_absolute_magnitude', 'flux_from_luminosity'], score: 450 },
            'angular distance between': { formulas: ['angular_size'], score: 500 },
            'min max luminosity': { formulas: ['luminosity', 'stefan_boltzmann_law'], score: 450 },
            'roche limit': { formulas: ['roche_limit_rigid', 'roche_limit', 'tidal_force'], score: 550 },
            'periapsis apoapsis': { formulas: ['periapsis_from_apoapsis', 'eccentricity_apoapsis_periapsis'], score: 500 },
            'tidal force balance': { formulas: ['tidal_force', 'roche_limit_rigid'], score: 500 },
            'virial temperature': { formulas: ['virial_temperature_gas', 'total_energy_virial'], score: 550 },
            'virial velocity dispersion': { formulas: ['virial_velocity_dispersion', 'virial_temperature_gas'], score: 550 },
            'virialized cloud': { formulas: ['virial_temperature_gas', 'virial_velocity_dispersion', 'total_energy_virial'], score: 500 },
            'distance in light years': { formulas: ['parallax_to_light_years', 'parallax_distance_arcsec'], score: 500 },
            'parallax light years': { formulas: ['parallax_to_light_years'], score: 550 },
            'extinction 25%': { formulas: ['magnitude_change_flux_ratio', 'distance_from_magnitude'], score: 500 },
            'brightness decreased': { formulas: ['magnitude_change_flux_ratio'], score: 500 },
            'illuminated area': { formulas: ['illuminated_area_phase', 'angular_size'], score: 500 },
            'area lit phase': { formulas: ['illuminated_area_phase'], score: 550 },
            'pulsar glitch': { formulas: ['rotational_velocity'], score: 400 },
            'rotational kinetic energy': { formulas: ['rotational_velocity'], score: 400 },
            // Mason Invitational 2025
            'speckle imaging': { formulas: ['angular_resolution'], score: 350 },
            'how many times brighter': { formulas: ['brightness_ratio_times_brighter', 'flux_ratio_magnitude', 'mass_luminosity_relation'], score: 500 },
            'betelgeuse sirwarha': { formulas: ['brightness_ratio_times_brighter', 'mass_luminosity_relation', 'hr_absolute_magnitude', 'apparent_magnitude_from_luminosity_distance', 'linear_separation_from_angular', 'kepler_binary_solar_units', 'vis_viva'], score: 500 },
            'solar constant': { formulas: ['apparent_magnitude_from_luminosity_distance', 'flux_from_luminosity'], score: 500 },
            'distance in AU from arcsec': { formulas: ['linear_separation_from_angular', 'angular_size'], score: 500 },
            'semi-major axis binary': { formulas: ['kepler_binary_solar_units', 'kepler_third_law_binary'], score: 500 },
            'orbital velocity km/s': { formulas: ['vis_viva', 'orbital_velocity'], score: 450 },
            'infalling matter': { formulas: ['luminosity_infall', 'gravitational_potential_energy'], score: 500 },
            'rate of infalling matter': { formulas: ['luminosity_infall'], score: 550 },
            'gravitational contraction': { formulas: ['kelvin_helmholtz_timescale_exact', 'thermal_time'], score: 500 },
            'kelvin helmholtz': { formulas: ['kelvin_helmholtz_timescale_exact', 'thermal_time'], score: 550 },
            'sun last gravitational': { formulas: ['kelvin_helmholtz_timescale_exact'], score: 500 },
            'mira luminosity': { formulas: ['flux_change_magnitude_difference', 'brightness_ratio_times_brighter', 'luminosity'], score: 450 },
            'mira variable': { formulas: ['flux_change_magnitude_difference', 'brightness_ratio_times_brighter', 'stellar_pulsation_mechanics'], score: 450 },
            'angular separation arcsec': { formulas: ['angular_separation_arcsec', 'linear_separation_from_angular'], score: 500 },
            'mira B accretion': { formulas: ['accretion_luminosity', 'apparent_magnitude_from_luminosity_distance'], score: 500 },
            'accretion luminosity': { formulas: ['accretion_luminosity', 'eddington_luminosity'], score: 500 },
            // Purdue 2026
            'parallax angle arcseconds': { formulas: ['parallax_from_distance', 'parallax_distance_arcsec'], score: 500 },
            '70 parsecs parallax': { formulas: ['parallax_from_distance'], score: 550 },
            'peak wavelength 400 nm': { formulas: ['wiens_law'], score: 550 },
            'blueshift': { formulas: ['doppler_shift', 'redshift_velocity_low', 'redshift_definition'], score: 500 },
            'galaxy approaching': { formulas: ['doppler_shift', 'redshift_velocity_low'], score: 500 },
            'comet elliptical orbit': { formulas: ['velocity_from_orbital_energy', 'vis_viva'], score: 500 },
            'speed when 6e12 m': { formulas: ['velocity_from_orbital_energy'], score: 550 },
            'perihelion aphelion distances meters': { formulas: ['perihelion_aphelion', 'aphelion_distance'], score: 500 },
            'eccentricity 0.148 semi-major axis 3': { formulas: ['perihelion_aphelion', 'aphelion_distance', 'kepler_binary_solar_units'], score: 500 },
            'orbital period 3 years mass system': { formulas: ['kepler_binary_solar_units', 'kepler_third_law_binary'], score: 500 },
            'velocity at aphelion': { formulas: ['vis_viva', 'aphelion_distance'], score: 500 },
            'distance modulus including extinction': { formulas: ['distance_modulus_with_extinction', 'distance_from_magnitude'], score: 550 },
            'Type Ia extinction': { formulas: ['distance_modulus_with_extinction'], score: 500 },
            'distance supernova Mpc': { formulas: ['distance_modulus_with_extinction'], score: 500 },
            'proton-proton chain lifetime': { formulas: ['solar_lifetime_efficiency', 'stellar_lifetime'], score: 500 },
            'lifetime of the sun seconds': { formulas: ['solar_lifetime_efficiency'], score: 500 },
            'hubble time': { formulas: ['hubble_time', 'hubble_law'], score: 500 },
            'time since galaxy began receding': { formulas: ['hubble_time'], score: 550 },
            'H0 from v and d': { formulas: ['hubble_law'], score: 450 },
            'cepheid-based distance H0': { formulas: ['hubble_law'], score: 450 },
            'temperature from luminosity radius': { formulas: ['temperature_from_luminosity_radius_solar', 'luminosity'], score: 500 },
            'radius 2.7 R sun temperature': { formulas: ['temperature_from_luminosity_radius_solar'], score: 550 },
            // Core astrophysics reference / undergraduate competition bundle
            'science olympiad astronomy': {
                formulas: [
                    'kepler_third_law', 'orbital_velocity', 'escape_velocity', 'vis_viva', 'orbital_energy',
                    'stefan_boltzmann_law', 'luminosity', 'wiens_law', 'mass_luminosity_relation', 'stellar_lifetime',
                    'flux_from_luminosity', 'distance_modulus', 'doppler_shift', 'redshift_definition',
                    'schwarzschild_radius', 'eddington_luminosity', 'gravitational_redshift', 'chandrasekhar_limit',
                    'total_energy_virial', 'hubble_law', 'critical_density', 'jeans_mass', 'alfven_speed',
                    'accretion_luminosity', 'planck_blackbody_nu_frequency', 'bondi_accretion_rate',
                    'gravitational_wave_quadrupole_luminosity', 'thermal_doppler_broadening',
                    'pulsar_light_cylinder', 'pulsar_polar_cap_angle', 'tidal_disruption_radius_scaling',
                    'radiation_force_thomson_luminosity', 'rayleigh_taylor_growth_rate', 'kelvin_helmholtz_growth_rate',
                    'alfven_mach_number', 'type_ia_snr_peak_time_diffusion', 'tidal_acceleration_differential',
                    'stellar_gravity_dynamical_time', 'adiabatic_gradient_ideal_gas', 'compact_object_keplerian_breakup_omega',
                    'photon_diffusion_time_optical_depth', 'supernova_luminosity_kinetic_diffusion', 'hydrostatic_balance'
                ],
                score: 420
            },
            'undergraduate astrophysics': {
                formulas: [
                    'friedmann_equation', 'critical_density', 'hubble_law', 'hydrostatic_balance',
                    'stellar_mass_continuity', 'stellar_luminosity_shell', 'radiative_transport_temperature_gradient',
                    'newton_gravitational_force', 'kepler_third_law_binary', 'cyclotron_frequency'
                ],
                score: 400
            },
            'bondi accretion': { formulas: ['bondi_accretion_rate', 'accretion_luminosity', 'sound_speed'], score: 520 },
            'alfven speed': { formulas: ['alfven_speed', 'magnetic_pressure_si', 'sound_speed'], score: 520 },
            'rayleigh jeans': { formulas: ['rayleigh_jeans_B_nu', 'planck_blackbody_nu_frequency', 'blackbody_radiation'], score: 500 },
            'thermal broadening': { formulas: ['thermal_doppler_broadening', 'doppler_shift', 'gas_kinetic_temperature'], score: 500 },
            'gravitational wave luminosity': { formulas: ['gravitational_wave_quadrupole_luminosity', 'orbital_decay_gravitational_radiation'], score: 550 },
            // MIT 2026
            'lyman alpha': { formulas: ['zeeman_splitting'], score: 250 },
            'white dwarf merger time': { formulas: ['white_dwarf_merger_timescale'], score: 550 },
            'gravitational wave merger time': { formulas: ['white_dwarf_merger_timescale'], score: 550 },
            'scale height': { formulas: ['scale_height_isothermal', 'hydrostatic_balance'], score: 550 },
            'hydrogen helium atmosphere': { formulas: ['scale_height_isothermal', 'photospheric_pressure_optical_depth'], score: 500 },
            'photospheric gas pressure': { formulas: ['photospheric_pressure_optical_depth', 'optical_depth'], score: 550 },
            'rosseland opacity': { formulas: ['photospheric_pressure_optical_depth', 'opacity_general'], score: 500 },
            'zeeman splitting': { formulas: ['zeeman_splitting', 'magnetic_pressure_si'], score: 550 },
            'upper bound delta B': { formulas: ['zeeman_splitting', 'magnetic_pressure_si'], score: 500 },
            'magnetic asymmetry': { formulas: ['magnetic_pressure_si', 'photospheric_pressure_optical_depth'], score: 500 },
            'mira pulsation': { formulas: ['pulsation_period_scaling', 'stellar_pulsation_mechanics', 'magnitude_variation_pulsation'], score: 500 },
            'fractional luminosity amplitude': { formulas: ['luminosity_fractional_amplitude_pulsation'], score: 550 },
            'delta MK': { formulas: ['magnitude_variation_pulsation'], score: 550 },
            'in phase or out of phase': { formulas: ['magnitude_variation_pulsation'], score: 500 },
            'spectral index': { formulas: ['spectral_index'], score: 500 },
            'synchrotron emission': { formulas: ['spectral_index', 'synchrotron_power'], score: 500 },
            'blackbody radio spectral index': { formulas: ['spectral_index'], score: 400 },
            'neutron star': { formulas: ['pulsar_light_cylinder', 'surface_gravity', 'escape_velocity', 'chandrasekhar_limit'], score: 520 },
            'pulsar': { formulas: ['pulsar_light_cylinder', 'pulsar_polar_cap_angle', 'cyclotron_frequency'], score: 520 },
            'tidal disruption': { formulas: ['tidal_disruption_radius_scaling', 'tidal_acceleration_differential', 'roche_limit'], score: 520 },
            'rayleigh taylor': { formulas: ['rayleigh_taylor_growth_rate', 'sound_speed'], score: 500 },
            'kelvin helmholtz': { formulas: ['kelvin_helmholtz_growth_rate', 'sound_speed'], score: 500 },
            'type ia': { formulas: ['type_ia_snr_peak_time_diffusion', 'chandrasekhar_limit', 'optical_depth'], score: 520 },
            'supernova light curve': { formulas: ['type_ia_snr_peak_time_diffusion', 'optical_depth', 'stefan_boltzmann_law'], score: 500 },
            // Core Olympiad “math systems” (binder toolkit): gravity, orbits, stars, photometry, cosmology
            'olympiad toolkit': {
                formulas: [
                    'newton_gravitational_force', 'orbital_velocity', 'escape_velocity', 'escape_orbital_velocity_ratio',
                    'kepler_third_law', 'kepler_third_law_solar', 'apsidal_momentum_conservation', 'perihelion_aphelion',
                    'eccentricity_apoapsis_periapsis', 'orbital_energy', 'vis_viva',
                    'stefan_boltzmann_law', 'stefan_boltzmann_luminosity_ratio', 'flux_from_luminosity',
                    'distance_modulus', 'flux_ratio_magnitude', 'absolute_magnitude_luminosity',
                    'parallax_distance_arcsec', 'doppler_shift_approx', 'wiens_law', 'planck_relation',
                    'hubble_law', 'average_density', 'surface_gravity', 'hill_radius',
                    'photon_momentum_energy', 'temperature_from_luminosity_radius_solar',
                    'transit_depth', 'schwarzschild_radius'
                ],
                score: 480
            },
            'mathematical toolkit astronomy': {
                formulas: [
                    'kepler_third_law', 'orbital_velocity', 'escape_velocity', 'escape_orbital_velocity_ratio',
                    'kepler_third_law_solar', 'stefan_boltzmann_law', 'stefan_boltzmann_luminosity_ratio',
                    'distance_modulus', 'parallax_distance_arcsec', 'doppler_shift_approx', 'hubble_law'
                ],
                score: 460
            },
            'problem triggers': {
                formulas: ['perihelion_aphelion', 'apsidal_momentum_conservation', 'flux_ratio_magnitude', 'wiens_law', 'kepler_third_law_solar'],
                score: 420
            },
            'stellar structure equations': {
                formulas: [
                    'stellar_mass_continuity', 'hydrostatic_balance', 'stellar_luminosity_shell',
                    'radiative_transport_temperature_gradient', 'adiabatic_gradient_ideal_gas', 'convection_criterion',
                    'central_pressure_approximate', 'mass_luminosity_relation', 'stellar_gravity_dynamical_time'
                ],
                score: 500
            },
            'supernova diffusion': {
                formulas: [
                    'type_ia_snr_peak_time_diffusion', 'photon_diffusion_time_optical_depth',
                    'supernova_luminosity_kinetic_diffusion', 'stellar_gravity_dynamical_time', 'optical_depth'
                ],
                score: 520
            }
        };
    }
    
    /**
     * Search formulas with advanced scoring
     * @param {string} searchTerm - Search query
     * @param {Array} formulas - Array of formulas to search
     * @returns {Array} Array of scored formulas sorted by relevance
     */
    search(searchTerm, formulas = null) {
        const formulasToSearch = formulas || this.formulas;
        if (!searchTerm || !searchTerm.trim() || formulasToSearch.length === 0) {
            return [];
        }
        
        const searchLower = searchTerm.toLowerCase().trim();
        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
        
        if (searchWords.length === 0) {
            return [];
        }
        
        // Check cache first
        if (this.cache) {
            const cached = this.cache.get(searchLower);
            if (cached) {
                return cached;
            }
        }
        
        // Score all formulas
        const scoredFormulas = formulasToSearch.map(formula => {
            const scoreData = this.calculateSearchScore(formula, searchLower, searchWords);
            return {
                formula,
                score: scoreData.score,
                metrics: scoreData.metrics,
                topicRelevanceScore: scoreData.topicRelevanceScore || 0,
                contextScore: scoreData.contextScore || 0
            };
        });
        
        // Filter and sort
        let filtered = scoredFormulas.filter(item => {
            // Always show name matches
            if (item.metrics.nameMatch) return true;
            
            // Show formulas with strong matches or topic relevance
            const hasStrongMatch = item.metrics.questionPatternMatch || item.metrics.conceptMatch;
            const hasAnyMatch = item.metrics.descriptionMatch || item.metrics.variableMatch || item.metrics.categoryMatch;
            const hasTopicRelevance = (item.topicRelevanceScore && item.topicRelevanceScore > 100) || 
                                     (item.contextScore && item.contextScore > 100);
            
            return item.score > 0 || hasStrongMatch || hasAnyMatch || hasTopicRelevance;
        });
        
        // Normalize scores
        const maxCombinedScore = Math.max(
            ...filtered.map(item => item.score + (item.topicRelevanceScore || 0) + (item.contextScore || 0)),
            1
        );
        
        filtered.forEach(item => {
            const combinedScore = item.score + (item.topicRelevanceScore || 0) + (item.contextScore || 0);
            item.normalizedScore = (combinedScore / maxCombinedScore) * 1000;
        });
        
        // Sort by normalized score
        filtered.sort((a, b) => {
            const aHasBoth = (a.score > 0 || a.metrics.nameMatch || a.metrics.conceptMatch) && 
                            (a.topicRelevanceScore > 100 || a.contextScore > 100);
            const bHasBoth = (b.score > 0 || b.metrics.nameMatch || b.metrics.conceptMatch) && 
                            (b.topicRelevanceScore > 100 || b.contextScore > 100);
            
            if (aHasBoth && !bHasBoth) return -1;
            if (bHasBoth && !aHasBoth) return 1;
            
            return b.normalizedScore - a.normalizedScore;
        });
        
        // Limit results
        const results = filtered.slice(0, 50);
        
        // Cache results
        if (this.cache) {
            this.cache.set(searchLower, results);
        }
        
        return results;
    }
    
    /**
     * Calculate search relevance score for a formula
     * @param {Object} formula - Formula object
     * @param {string} searchLower - Lowercase search term
     * @param {Array} searchWords - Array of search words
     * @returns {Object} Score data with metrics
     */
    calculateSearchScore(formula, searchLower, searchWords) {
        let score = 0;
        const nameLower = formula.name.toLowerCase();
        const descLower = formula.description.toLowerCase();
        const eqLower = formula.equation.toLowerCase();
        
        // Initialize metrics
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
            dynamicBoost: 0,
            intentMatch: false,
            targetMatch: false,
            sourceMatch: false,
            formulaConfidence: formula.formulaConfidence || 85,
            confidenceTier: formula.confidenceTier || 'approximation',
            confidenceRationale: formula.confidenceRationale || ''
        };
        
        // Parse query
        const parsedQuery = this.parseNaturalLanguageQuery(searchLower, searchWords);
        metrics.originalConcepts = [...parsedQuery.concepts];
        
        // Expand concepts using hierarchy
        const expandedConcepts = this.expandConceptsWithHierarchy(parsedQuery.concepts);
        parsedQuery.concepts = expandedConcepts;
        metrics.expandedConcepts = expandedConcepts;
        
        // Exact name match (highest priority)
        const normalizedName = nameLower.replace(/[''"]/g, "'");
        const normalizedSearch = searchLower.replace(/[''"]/g, "'");
        
        if (normalizedName === normalizedSearch) {
            score += 10000;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Exact name match');
        } else if (normalizedName.startsWith(normalizedSearch)) {
            score += 5000;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Name starts with search term');
        } else if (normalizedName.includes(normalizedSearch)) {
            score += 2000;
            metrics.nameMatch = true;
            metrics.matchReasons.push('Name contains search term');
        }
        
        // Check if all search words appear in name
        const allWordsInName = searchWords.every(word => {
            const normalizedWord = word.replace(/[''"]/g, "'");
            return normalizedName.includes(normalizedWord);
        });
        if (allWordsInName && !metrics.nameMatch) {
            score += searchWords.length >= 2 ? 3000 : 2500;
            metrics.nameMatch = true;
            metrics.matchReasons.push(`All search words found in name: "${searchWords.join(' ')}"`);
        }
        
        // Question pattern matching (hardcoded phrase -> formula IDs)
        const questionMatch = this.matchQuestionToFormula(formula, parsedQuery, searchLower, searchWords);
        score += questionMatch.score;
        if (questionMatch.score > 0) {
            metrics.questionPatternMatch = true;
            metrics.matchReasons.push(`Question pattern match: ${questionMatch.reason || 'high relevance'}`);
        }
        
        // Per-formula questionPatterns: when user types main part of a question, boost this formula
        if (formula.questionPatterns && Array.isArray(formula.questionPatterns)) {
            for (const pattern of formula.questionPatterns) {
                const pl = (pattern || '').toLowerCase();
                if (pl.length < 2) continue;
                if (searchLower.includes(pl)) {
                    score += 500;
                    metrics.questionPatternMatch = true;
                    metrics.matchReasons.push(`Question phrase match: "${pattern}"`);
                    break;
                }
                if (pl.includes(searchLower) && searchLower.length >= 4) {
                    score += 350;
                    metrics.questionPatternMatch = true;
                    metrics.matchReasons.push(`Question phrase contains query: "${pattern}"`);
                    break;
                }
            }
        }
        
        // Description matching
        if (descLower.includes(searchLower)) {
            score += 150;
            metrics.descriptionMatch = true;
        }
        
        // Concept matching
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
        
        // Variable matching
        if (formula.variables && Array.isArray(formula.variables)) {
            formula.variables.forEach(v => {
                const varSymbol = v.symbol.toLowerCase();
                const varName = v.name.toLowerCase();
                
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
            });
        }
        
        // Category matching
        for (const [category, ids] of Object.entries(this.formulaCategories)) {
            if (ids.includes(formula.id)) {
                const categoryLower = category.toLowerCase();
                if (categoryLower === searchLower) {
                    score += 150;
                    metrics.categoryMatch = true;
                } else if (categoryLower.includes(searchLower)) {
                    score += 80;
                    metrics.categoryMatch = true;
                }
                break;
            }
        }
        
        // Topic-based relevance scoring
        let topicRelevanceScore = 0;
        let contextScore = 0;
        
        // Context pattern matching
        const contextPatterns = {
            'finding_distance': ['distance', 'how far', 'away', 'parallax', 'modulus'],
            'finding_temperature': ['temperature', 'hot', 'wien', 'blackbody', 'effective temp'],
            'finding_velocity': ['velocity', 'speed', 'orbital', 'escape', 'rotational'],
            'finding_mass': ['mass', 'weight', 'chandrasekhar', 'jeans', 'stellar mass'],
            'finding_luminosity': ['luminosity', 'brightness', 'flux', 'magnitude', 'power'],
            'finding_period': ['period', 'time', 'orbital period', 'lifetime', 'age'],
            'finding_size': ['radius', 'size', 'diameter', 'angular size', 'scale']
        };
        
        for (const [context, keywords] of Object.entries(contextPatterns)) {
            const contextMatches = keywords.filter(kw => searchLower.includes(kw)).length;
            if (contextMatches > 0) {
                const formulaText = `${nameLower} ${descLower}`.toLowerCase();
                const formulaContextMatches = keywords.filter(kw => formulaText.includes(kw)).length;
                
                if (formulaContextMatches > 0) {
                    let baseContextScore = 250 * (contextMatches + formulaContextMatches);
                    
                    if (formula.primaryUseCase) {
                        const useCaseLower = formula.primaryUseCase.toLowerCase();
                        if (context === 'finding_temperature' && useCaseLower.includes('temperature')) {
                            baseContextScore += 500;
                            metrics.matchReasons.push(`Primary use case match: ${formula.primaryUseCase}`);
                        } else if (context === 'finding_distance' && useCaseLower.includes('distance')) {
                            baseContextScore += 500;
                            metrics.matchReasons.push(`Primary use case match: ${formula.primaryUseCase}`);
                        }
                    }
                    
                    const specificity = formula.specificity || 5;
                    if (specificity >= 9) {
                        baseContextScore += 300;
                        metrics.matchReasons.push(`High specificity boost (${specificity}/10)`);
                    } else if (specificity >= 7) {
                        baseContextScore += 150;
                    }
                    
                    contextScore += baseContextScore;
                    metrics.matchReasons.push(`Context match: ${context.replace('_', ' ')}`);
                }
            }
        }
        
        // Precision scoring
        const precisionScore = this.calculatePrecisionScore(formula, parsedQuery, searchLower);
        score += precisionScore.score;
        if (precisionScore.score > 0) {
            metrics.matchReasons.push(precisionScore.reason);
        }
        
        // Generic penalty
        const penalty = this.calculateGenericPenalty(formula, parsedQuery, score);
        score -= penalty;
        score = Math.max(0, score);
        if (penalty > 0) {
            metrics.matchReasons.push(`Generic match penalty: -${penalty} points`);
        }
        
        // Modest per-formula reliability weighting
        if (score > 0) {
            score = Math.round(score * (formula.searchWeight || 1));
        }

        // Combine scores
        const combinedScore = score + topicRelevanceScore + contextScore;
        
        return {
            score: Math.max(score, combinedScore),
            metrics,
            topicRelevanceScore,
            contextScore
        };
    }
    
    /**
     * Parse natural language query to extract intent and concepts
     * @param {string} searchLower - Lowercase search term
     * @param {Array} searchWords - Array of search words
     * @returns {Object} Parsed query with intent, concepts, etc.
     */
    parseNaturalLanguageQuery(searchLower, searchWords) {
        const result = {
            intent: 'search',
            concepts: [],
            coreConcepts: [],
            variables: [],
            actions: [],
            direction: null,
            sourceConcepts: [],
            targetConcepts: []
        };
        
        // Detect core concepts
        const detectedCoreConcepts = this.detectCoreConcepts(searchLower);
        if (detectedCoreConcepts.length > 0) {
            result.coreConcepts = detectedCoreConcepts;
            result.concepts.push(...detectedCoreConcepts);
        }
        
        // Detect intent
        const actionWords = {
            'calculate': ['calculate', 'compute', 'find', 'determine', 'solve', 'work out', 'figure out'],
            'find': ['find', 'get', 'obtain', 'discover', 'locate'],
            'determine': ['determine', 'figure', 'establish', 'ascertain'],
            'convert': ['convert', 'transform', 'change'],
            'relate': ['relate', 'connect', 'link', 'relationship', 'between']
        };
        
        for (const [intent, words] of Object.entries(actionWords)) {
            if (words.some(word => searchLower.includes(word))) {
                result.intent = intent;
                result.actions.push(intent);
                break;
            }
        }
        
        // Extract physics/astronomy terms (simplified - full version has comprehensive dictionary)
        const physicsTerms = {
            'velocity': ['velocity', 'speed', 'v', 'how fast', 'rate of motion'],
            'distance': ['distance', 'd', 'how far', 'separation', 'away'],
            'temperature': ['temperature', 'temp', 'hot', 'thermal', 'effective temperature'],
            'luminosity': ['luminosity', 'l', 'brightness', 'how bright', 'intrinsic brightness'],
            'mass': ['mass', 'm', 'weight', 'how heavy', 'stellar mass'],
            'period': ['period', 'p', 'time', 'how long', 'duration'],
            'wavelength': ['wavelength', 'lambda', 'λ', 'color', 'frequency'],
            'kepler': ['kepler', 'orbital', 'orbit', 'elliptical', 'kepler law']
        };
        
        for (const [concept, synonyms] of Object.entries(physicsTerms)) {
            for (const syn of synonyms) {
                const synLower = syn.toLowerCase();
                if (searchLower === synLower || searchLower.includes(synLower)) {
                    result.concepts.push(concept);
                    break;
                }
            }
        }
        
        result.concepts = [...new Set(result.concepts)];
        
        return result;
    }
    
    /**
     * Detect core concepts from search query
     * @param {string} searchLower - Lowercase search term
     * @returns {Array} Array of detected core concepts
     */
    detectCoreConcepts(searchLower) {
        const matches = new Set();
        
        Object.entries(this.coreConceptMap).forEach(([core, terms]) => {
            for (const term of terms) {
                const termLower = term.toLowerCase();
                const escapedTerm = termLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const wordBoundaryRegex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
                if (wordBoundaryRegex.test(searchLower) || searchLower.includes(termLower)) {
                    matches.add(core);
                    break;
                }
            }
        });
        
        return Array.from(matches);
    }
    
    /**
     * Expand concepts using hierarchical relationships
     * @param {Array} concepts - Initial concepts
     * @returns {Array} Expanded concepts
     */
    expandConceptsWithHierarchy(concepts) {
        const hierarchy = this.getConceptHierarchy();
        const expanded = new Set(concepts);
        
        concepts.forEach(concept => {
            const node = hierarchy[concept];
            if (node) {
                if (node.parent) expanded.add(node.parent);
                if (node.children && Array.isArray(node.children)) {
                    node.children.forEach(child => expanded.add(child));
                }
                if (node.siblings && Array.isArray(node.siblings)) {
                    node.siblings.forEach(sibling => expanded.add(sibling));
                }
                if (node.related && Array.isArray(node.related)) {
                    node.related.forEach(related => expanded.add(related));
                }
            }
        });
        
        return Array.from(expanded);
    }
    
    /**
     * Match question patterns to formulas
     * @param {Object} formula - Formula object
     * @param {Object} parsedQuery - Parsed query
     * @param {string} searchLower - Lowercase search term
     * @param {Array} searchWords - Array of search words
     * @returns {Object} Match score and reason
     */
    matchQuestionToFormula(formula, parsedQuery, searchLower, searchWords) {
        let score = 0;
        let reason = '';
        
        for (const [pattern, data] of Object.entries(this.questionPatterns)) {
            if (searchLower.includes(pattern) && data.formulas.includes(formula.id)) {
                score = Math.max(score, data.score);
                reason = pattern;
            }
        }
        
        return { score, reason };
    }
    
    /**
     * Calculate precision score for formula matching
     * @param {Object} formula - Formula object
     * @param {Object} parsedQuery - Parsed query
     * @param {string} searchLower - Lowercase search term
     * @returns {Object} Precision score and reason
     */
    calculatePrecisionScore(formula, parsedQuery, searchLower) {
        let score = 0;
        let reason = '';
        
        const primaryUseCase = formula.primaryUseCase || '';
        const primaryUseLower = primaryUseCase.toLowerCase();
        
        // Primary use case bonus
        if (primaryUseCase && searchLower.includes(primaryUseLower.replace(/\s+/g, '.*'))) {
            score += 500;
            reason = `✨ Primary use case match: ${primaryUseCase}`;
        }
        
        // Specificity bonus
        const specificity = formula.specificity || 5;
        if (specificity >= 8) {
            const conceptMatches = parsedQuery.concepts.filter(c => 
                formula.concepts && formula.concepts.some(fc => 
                    fc.toLowerCase().includes(c) || c.includes(fc.toLowerCase())
                )
            ).length;
            
            if (conceptMatches >= 3) {
                score += 200 * (specificity / 10);
                reason = `🔗 Strong concept match (${conceptMatches} concepts, specificity ${specificity}/10)`;
            }
        }
        
        return { score, reason };
    }
    
    /**
     * Calculate penalty for overly generic matches
     * @param {Object} formula - Formula object
     * @param {Object} parsedQuery - Parsed query
     * @param {number} currentScore - Current score
     * @returns {number} Penalty amount
     */
    calculateGenericPenalty(formula, parsedQuery, currentScore) {
        let penalty = 0;
        
        const specificity = formula.specificity || 5;
        const conceptMatches = parsedQuery.concepts.filter(c => 
            formula.concepts && formula.concepts.some(fc => 
                fc.toLowerCase().includes(c) || c.includes(fc.toLowerCase())
            )
        ).length;
        
        if (specificity < 7 && conceptMatches > 2 && currentScore > 500) {
            penalty = Math.round(currentScore * 0.3);
        }
        
        if (conceptMatches >= 3 && !formula.primaryUseCase) {
            penalty += 100;
        }
        
        if (parsedQuery.direction && !formula.primaryUseCase) {
            penalty += 150;
        }
        
        return penalty;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.FormulaSearchEngine = FormulaSearchEngine;
}

