// Formula database for astronomy calculations

// Global physical constants — CODATA 2022 recommended (NIST) where applicable;
// SI 2019 exact values for c, h, k, e, σ; G from CODATA 2022; AU = IAU 2012 exact definition (m).
var globalConstants = {
    G: 6.67430e-11,           // CODATA 2022 — gravitational constant (m³/(kg·s²))
    c: 2.99792458e8,          // SI exact — speed of light (m/s)
    σ: 5.6703744191844294e-8, // SI exact — Stefan-Boltzmann constant (W/(m²·K⁴))
    sigma: 5.6703744191844294e-8,
    h: 6.62607015e-34,        // SI exact — Planck constant (J·s)
    k: 1.380649e-23,          // SI exact — Boltzmann constant (J/K)
    e: 1.602176634e-19,       // SI exact — elementary charge (C)
    m_e: 9.1093837139e-31,   // CODATA 2022 — electron mass (kg)
    σ_T: 6.6524587321e-29,    // CODATA 2022 — Thomson cross-section (m²); 0.66524587321 barn
    L_sun: 3.828e26,          // Nominal solar luminosity (W); same as L☉ in unitConverter
    M_sun: 1.988409870440e30, // Nominal solar mass (kg); same as M☉ in unitConverter (IAU)
    R_sun: 695700000,         // Nominal solar radius (m); same as R☉ in unitConverter (IAU 2015)
    AU: 149597870700,         // IAU 2012 exact astronomical unit (m)
    pi: Math.PI,              // Pi
    π: Math.PI                // Pi (Greek letter)
};

// Formula categories mapping
var formulaCategories = {
    'Orbital Mechanics': [
        'kepler_third_law', 'kepler_third_law_solar', 'orbital_velocity', 'escape_velocity', 'escape_orbital_velocity_ratio',
        'tidal_force', 'roche_limit', 'roche_limit_rigid', 'periapsis_from_apoapsis', 'roche_lobe_spherical', 'L1_point_approximation', 'orbital_energy', 'vis_viva', 'center_of_mass',
        'kepler_third_law_binary', 'kepler_binary_solar_units', 'rotational_velocity', 'hill_radius', 'synodic_period',
        'angular_momentum_elliptical', 'kepler_second_law_area_rate', 'eccentricity_from_area_rate', 'velocity_from_orbital_energy', 'perihelion_aphelion', 'aphelion_distance', 'tidal_locking_timescale', 'newton_gravitational_force',
        'weight', 'centripetal_force', 'centripetal_acceleration', 'period_circular',
        'gravitational_potential_energy', 'orbital_energy_simple', 'potential_energy_per_mass',
        'velocity_ratio_orbital', 'orbital_period_general', 'semi_latus_rectum',
        'eccentricity_apoapsis_periapsis', 'orbital_energy_eccentricity',
        'angular_momentum_circular', 'apsidal_momentum_conservation', 'orbital_speed_circular', 'angular_velocity_orbit',
        'tidal_acceleration_differential', 'gravitational_wave_frequency_binary_approx', 'light_travel_time',
        'kinetic_energy_translational',
        'tidal_disruption_radius_scaling'
    ],
    'Radiation & Stellar Properties': [
        'luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'wiens_law',
        'stefan_boltzmann_law', 'stefan_boltzmann_luminosity_ratio', 'planck_blackbody_nu_frequency', 'rayleigh_jeans_B_nu',
        'distance_modulus', 'magnitude_flux_relation', 'stellar_lifetime', 'solar_lifetime_efficiency',
        'mass_luminosity_relation', 'hr_color_index', 'hr_absolute_magnitude',
        'white_dwarf_mass_radius', 'blackbody_radiation',
        'white_dwarf_orbital_decay', 'white_dwarf_merger_timescale', 'planck_relation',
        'equivalent_width', 'luminosity_function', 'jeans_mass', 'intensity',
        'photon_momentum_energy', 'de_broglie_wavelength', 'apparent_magnitude_flux', 'apparent_magnitude_from_luminosity_distance',
        'flux_ratio_magnitude', 'absolute_magnitude_luminosity', 'brightness_luminosity',
        'magnitude_difference_flux', 'magnitude_change_flux_ratio', 'distance_from_magnitude', 'distance_modulus_with_extinction', 'luminosity_absolute_magnitude',
        'absolute_magnitude_from_distance', 'flux_from_magnitude', 'luminosity_from_flux_distance',
        'brightness_ratio_magnitude', 'brightness_ratio_times_brighter', 'bolometric_magnitude', 'color_index_ub',
        'interstellar_reddening', 'energy_density_radiation', 'photon_number_density',
        'momentum_transfer_radiation',
        'thermal_doppler_broadening'
    ],
    'Telescopes & Optics': [
        'angular_size', 'angular_separation_arcsec', 'linear_separation_from_angular', 'radian_arcsecond_conversion',
        'degree_to_arcminute', 'arcminute_to_arcsecond', 'illuminated_area_phase', 'light_gathering_power', 'magnification', 'f_ratio', 'angular_resolution',
        'refractive_index', 'diffraction_limit', 'diffraction_limit_rayleigh'
    ],
    'Cosmology & Relativity': [
        'hubble_law', 'hubble_time', 'friedmann_equation', 'critical_density', 'schwarzschild_radius',
        'time_dilation', 'length_contraction', 'parallax_distance_radians', 'parallax_distance_arcsec', 'parallax_from_distance', 'parallax_to_light_years',
        'redshift_definition', 'redshift_velocity_relativistic', 'lookback_time', 'density_parameter', 'angular_diameter_distance',
        'luminosity_distance', 'einstein_radius', 'matter_density_parameter',
        'vacuum_energy_density_parameter', 'curvature_density_parameter', 'scale_factor_redshift',
        'redshift_peculiar_velocity', 'comoving_distance', 'proper_distance_current',
        'distance_modulus_high_redshift', 'gravitational_redshift', 'accretion_efficiency',
        'eddington_luminosity', 'time_dilation_gravitational', 'horizon_area',
        'photon_energy_flat_space', 'gamma_factor', 'relativistic_energy',
        'relativistic_kinetic', 'relativistic_momentum', 'energy_momentum_relation',
        'gravitational_redshift_simple', 'black_hole_density', 'schwarzschild_per_solar_mass',
        'photon_sphere', 'isco', 'relativistic_doppler'
    ],
    'Doppler & Spectroscopy': [
        'doppler_shift', 'doppler_shift_approx', 'doppler_wavelength_ratio',
        'doppler_velocity_wavelength', 'redshift_definition', 'redshift_velocity_low', 'redshift_velocity_relativistic',
        'observed_wavelength_redshift', 'observed_frequency_redshift', 'wavelength_shift_redshift',
        'redshift_scale_factor', 'radial_velocity_frequency', 'radial_velocity_wavelength'
    ],
    'Planetary Science & Exoplanets': [
        'surface_gravity', 'average_density', 'planetary_equilibrium_temperature',
        'greenhouse_effect', 'albedo', 'transit_depth', 'radial_velocity_amplitude',
        'planet_density'
    ],
    'High Energy Astrophysics': [
        'max_gamma_bohm', 'cooling_break_gamma', 'cooling_break_frequency',
        'synchrotron_cooling_timescale', 'synchrotron_power', 'magnetic_energy_density', 'magnetic_pressure_si',
        'power_law_spectrum', 'spectral_index', 'synchrotron_frequency',
        'cyclotron_frequency', 'alfven_speed', 'gravitational_wave_quadrupole_luminosity',
        'pulsar_light_cylinder', 'pulsar_polar_cap_angle', 'radiation_force_thomson_luminosity',
        'alfven_mach_number'
    ],
    'Stellar Structure': [
        'hydrostatic_balance', 'central_pressure_approximate', 'stellar_mass_central_temperature',
        'ideal_gas_pressure', 'radiation_pressure_stellar', 'average_stellar_temperature',
        'nuclear_energy_generation', 'thermal_time', 'convection_criterion', 'opacity_general',
        'optical_depth', 'scale_height_isothermal', 'photospheric_pressure_optical_depth', 'radiation_transport', 'mass_loss_rate', 'total_energy_virial', 'virial_temperature_gas', 'virial_velocity_dispersion', 'kelvin_helmholtz_timescale_exact', 'luminosity_infall', 'accretion_luminosity', 'temperature_from_luminosity_radius_solar',
        'radiative_transport_temperature_gradient', 'stellar_pulsation_mechanics', 'kappa_mechanism_mira',
        'pulsation_period_scaling', 'luminosity_fractional_amplitude_pulsation', 'magnitude_variation_pulsation', 'period_luminosity_relation_cepheid', 'period_luminosity_cepheid_classical', 'bolometric_correction', 'extinction_correction_rv',
        'binary_mass_ratio_velocity', 'flux_change_magnitude_difference', 'pulsating_star_radius_change',
        'nuclear_fusion_mass_defect', 'nebula_age_expansion', 'orbital_decay_gravitational_radiation',
        'stellar_mass_continuity', 'stellar_luminosity_shell', 'bondi_accretion_rate',
        'rayleigh_taylor_growth_rate', 'kelvin_helmholtz_growth_rate', 'type_ia_snr_peak_time_diffusion',
        'stellar_gravity_dynamical_time', 'adiabatic_gradient_ideal_gas', 'compact_object_keplerian_breakup_omega',
        'photon_diffusion_time_optical_depth', 'supernova_luminosity_kinetic_diffusion'
    ],
    'Line Radiation & Excitation': [
        'boltzmann_equation', 'saha_equation', 'einstein_coefficient', 'zeeman_splitting', 'extinction_relation',
        'dust_mass_approximate', 'dust_to_gas_ratio', 'thermal_energy_cloud', 'sound_speed',
        'magnetic_flux_freezing', 'bremsstrahlung_luminosity', 'stromgren_radius',
        'recombination_time', 'total_mass_cloud', 'column_density', 'gas_kinetic_temperature'
    ],
    'Galactic Dynamics & Dark Matter': [
        'galaxy_rotation_velocity', 'mass_enclosed_rotation', 'surface_brightness',
        'globular_cluster_mass', 'dark_matter_density', 'dark_matter_mass_fraction',
        'velocity_dispersion', 'two_body_relaxation', 'crossing_time', 'm_sigma_relation',
        'schwarzschild_radius_smbh', 'tully_fisher_relation', 'faber_jackson_relation',
        'jeans_length', 'gravitational_potential_general', 'toomre_q_criterion',
        'alfven_speed', 'bondi_accretion_rate'
    ],
    'Binary Systems & Exoplanets': [
        'mass_function', 'binary_total_mass', 'stellar_activity_index',
        'light_travel_time', 'center_of_mass', 'kepler_third_law_binary', 'orbital_speed_circular',
        'doppler_wavelength_ratio', 'doppler_velocity_wavelength'
    ],
    'Optical Depth & Scattering': [
        'optical_depth_scattering'
    ]
};

var formulas = [
    {
        id: "kepler_third_law",
        name: "Kepler's Third Law",
        description: "Relates orbital period T to semi-major axis a and central mass M. Equivalent forms: T² = 4π²a³/(GM) and T = 2π√(a³/(GM)). Binary total mass: use kepler_third_law_binary with M₁+M₂.",
        equation: "T² = (4π²/GM) × a³",
        solveFor: {
            a: "a = (T^2 * G * M / (4 * pi^2))^(1/3)",
            T: "T = sqrt((4 * pi^2 / (G * M)) * a^3)",
            M: "M = (4 * pi^2 * a^3) / (G * T^2)"
        },
        concepts: ["kepler", "kepler third law", "orbital period", "semi-major axis", "orbital mechanics", "planetary motion", "binary systems", "exoplanets", "celestial mechanics", "revolution", "orbit", "gravitational force", "central mass", "elliptical orbit", "circular orbit", "orbital elements", "keplerian elements"],
        keywords: ["period", "revolution", "orbit time", "orbital distance", "mass", "gravity", "planetary", "stellar", "binary", "exoplanet", "celestial", "mechanics", "dynamics"],
        variables: [
            {
                symbol: "T",
                name: "Orbital Period",
                unit: "seconds",
                description: "Time for one complete orbit, revolution period, orbital cycle time. Related to orbital velocity, angular frequency, and orbital energy."
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Half the longest diameter of the elliptical orbit, average orbital distance, semi-major axis. Related to orbital distance, aphelion, perihelion, and eccentricity."
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of the central body (e.g., star, planet, black hole). Determines gravitational force, orbital velocity, and escape velocity. Related to stellar mass, planetary mass, and compact object mass."
            }
        ],
        constants: {
            G: 6.67430e-11  // Gravitational constant in m³/(kg·s²)
        },
        presets: [
            {
                name: "Earth Orbit",
                description: "Calculate orbital period for Earth's orbit around the Sun",
                values: { a: 149597870700, M: 1.988409870440e30 } // 1 AU (IAU 2012), Solar mass
            },
            {
                name: "Moon Orbit",
                description: "Calculate orbital period for Moon's orbit around Earth",
                values: { a: 3.844e8, M: 5.972e24 } // Moon distance, Earth mass
            },
            {
                name: "Jupiter Orbit",
                description: "Calculate orbital period for Jupiter's orbit around the Sun",
                values: { a: 7.785e11, M: 1.988409870440e30 } // Jupiter distance, Solar mass
            }
        ],
        relationships: {
            prerequisites: [], // Formulas needed to understand this one
            derivedFrom: [], // Formulas this is derived from
            relatedTo: ["orbital_velocity", "escape_velocity", "vis_viva", "orbital_energy", "kepler_third_law_binary", "kepler_third_law_solar", "gravitational_wave_quadrupole_luminosity", "angular_momentum_circular", "flux_from_luminosity"], // Related formulas
            uses: ["orbital_velocity"], // Formulas that use this one
            generalizes: ["kepler_third_law_solar", "kepler_third_law_binary"], // More specific versions
            specializes: [] // More general version
        },
        questionPatterns: [
            "how long does it take to orbit",
            "what is the orbital period",
            "how long is the orbital period",
            "calculate orbital period",
            "find orbital period",
            "period of orbit",
            "orbital period calculation",
            "how long planet orbits",
            "revolution time",
            "orbital cycle time",
            "time for one orbit"
        ]
    },
    {
        id: "orbital_velocity",
        name: "Orbital Velocity",
        description: "Circular orbit speed v = √(GM/r). Often used with Kepler III and vis-viva.",
        equation: "v = √(GM/r)",
        solveFor: {
            r: "r = G * M / v^2",
            M: "M = v^2 * r / G"
        },
        concepts: ["orbital velocity", "velocity", "circular orbit", "orbital mechanics", "gravitational motion", "centripetal force", "angular velocity", "orbital speed", "circular motion", "satellite", "binary systems", "exoplanets"],
        keywords: ["speed", "motion", "orbit", "circular", "gravitational", "centripetal", "angular", "revolution", "rotation", "satellite", "planet", "star"],
        variables: [
            {
                symbol: "v",
                name: "Orbital Velocity",
                unit: "m/s",
                description: "Speed of the orbiting object, tangential velocity, circular orbital speed. Related to angular velocity, rotational velocity, and escape velocity. Determines orbital period and kinetic energy."
            },
            {
                symbol: "r",
                name: "Orbital Radius",
                unit: "meters",
                description: "Distance from center of central body to orbiting object, orbital separation, semi-major axis for circular orbits. Related to orbital distance, apogee, perigee, and hill radius."
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of the central body, stellar mass, planetary mass. Determines gravitational acceleration, escape velocity, and orbital period. Related to surface gravity and tidal forces."
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["surface_gravity"],
            derivedFrom: ["surface_gravity"],
            relatedTo: ["kepler_third_law", "escape_velocity", "escape_orbital_velocity_ratio", "surface_gravity", "vis_viva", "orbital_energy", "angular_momentum_circular", "kepler_third_law_binary", "compact_object_keplerian_breakup_omega"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "how fast does it orbit",
            "what is the orbital velocity",
            "speed of orbit",
            "how fast planet moves",
            "orbital speed calculation",
            "velocity around",
            "circular orbit speed",
            "calculate orbital velocity",
            "find orbital speed",
            "orbital velocity calculation",
            "speed in circular orbit",
            "how fast satellite orbits"
        ]
    },
    {
        id: "escape_velocity",
        name: "Escape Velocity",
        description: "Minimum speed to escape from radius r: v_esc = √(2GM/r) (same physics for planets and stars).",
        equation: "v_esc = √(2GM/r)",
        concepts: ["escape velocity", "velocity", "gravity", "gravitational escape", "binding energy", "surface gravity", "orbital velocity", "rocket science", "space missions", "stellar evolution", "compact objects", "black holes", "white dwarfs"],
        keywords: ["escape", "break free", "gravitational field", "binding", "potential energy", "rocket", "launch", "spacecraft", "planet", "star", "black hole"],
        variables: [
            {
                symbol: "v_esc",
                name: "Escape Velocity",
                unit: "m/s",
                description: "Velocity required to escape gravitational field, minimum launch speed, breakaway velocity. Related to orbital velocity (√2 times faster), surface gravity, and gravitational binding energy."
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from center of the body, surface radius, stellar radius, planetary radius. Determines gravitational field strength and escape energy. Related to surface gravity and tidal forces."
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of the body, stellar mass, planetary mass, compact object mass. Determines gravitational force, surface gravity, and escape energy. Related to density and gravitational acceleration."
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        presets: [
            {
                name: "Earth Escape",
                description: "Calculate escape velocity from Earth's surface",
                values: { r: 6.371e6, M: 5.972e24 } // Earth radius, Earth mass
            },
            {
                name: "Moon Escape",
                description: "Calculate escape velocity from Moon's surface",
                values: { r: 1.737e6, M: 7.342e22 } // Moon radius, Moon mass
            },
            {
                name: "Sun Escape",
                description: "Calculate escape velocity from Sun's surface",
                values: { r: 6.957e8, M: 1.988409870440e30 } // Solar radius, Solar mass
            }
        ],
        relationships: {
            prerequisites: ["surface_gravity"],
            derivedFrom: ["surface_gravity"],
            relatedTo: ["kepler_third_law", "orbital_velocity", "escape_orbital_velocity_ratio", "surface_gravity", "vis_viva", "orbital_energy", "schwarzschild_radius", "potential_energy_per_mass", "accretion_luminosity", "bondi_accretion_rate"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "what velocity to escape",
            "how fast to escape gravity",
            "escape velocity calculation",
            "calculate escape velocity",
            "find escape velocity",
            "velocity needed to escape",
            "minimum speed to escape",
            "how fast escape planet",
            "break free from gravity",
            "escape gravitational field",
            "launch velocity",
            "rocket escape speed"
        ]
    },
    {
        id: "escape_orbital_velocity_ratio",
        name: "Escape vs Circular Orbit Speed (Same Radius)",
        description: "At the same distance r from a mass M: circular orbit speed v_orb = √(GM/r) and escape speed v_esc = √(2GM/r), so v_esc = √2 × v_orb. Olympiad shortcut when comparing escape to orbit without reusing G and M.",
        equation: "v_esc = √(2) * v_orb",
        solveFor: {
            v_esc: "v_esc = √(2) * v_orb",
            v_orb: "v_orb = v_esc / √(2)"
        },
        concepts: ["escape velocity", "orbital velocity", "circular orbit", "olympiad astronomy", "science olympiad astronomy"],
        keywords: ["sqrt 2 orbital", "escape twice circular", "v esc v orb", "kepler shortcut"],
        variables: [
            { symbol: "v_esc", name: "Escape Speed", unit: "m/s", description: "Escape velocity at radius r" },
            { symbol: "v_orb", name: "Circular Orbit Speed", unit: "m/s", description: "Circular orbital speed at the same r" }
        ],
        relationships: {
            prerequisites: ["orbital_velocity", "escape_velocity"],
            derivedFrom: ["orbital_velocity", "escape_velocity"],
            relatedTo: ["orbital_velocity", "escape_velocity", "vis_viva", "orbital_energy"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "escape velocity sqrt 2 orbital",
            "v esc versus v orbit",
            "circular orbit compared to escape",
            "sqrt 2 times orbital speed"
        ]
    },
    {
        id: "distance_modulus",
        name: "Distance Modulus",
        description: "Relates apparent magnitude, absolute magnitude, and distance. Fundamental distance indicator in astronomy connecting observed brightness, intrinsic luminosity, and stellar distance. Essential for cosmic distance ladder, stellar classification, and extragalactic astronomy. Accounts for interstellar extinction and reddening.",
        equation: "m - M = 5 log10(d) - 5",
        solveFor: {
            d: "d = 10^((m - M + 5) / 5)",
            m: "m = M + 5 * log10(d) - 5",
            M: "M = m - 5 * log10(d) + 5"
        },
        concepts: ["distance modulus", "magnitude", "apparent magnitude", "absolute magnitude", "distance", "cosmic distance ladder", "standard candle", "stellar classification", "extinction", "reddening", "luminosity", "brightness", "photometry"],
        keywords: ["distance", "magnitude", "brightness", "luminosity", "parsec", "standard candle", "distance ladder", "extinction", "reddening", "photometry", "stellar", "galaxy"],
        variables: [
            {
                symbol: "m",
                name: "Apparent Magnitude",
                unit: "magnitude",
                description: "Brightness as seen from Earth, observed magnitude, photometric magnitude. Affected by distance, extinction, and reddening. Related to flux, luminosity, and distance modulus."
            },
            {
                symbol: "M",
                name: "Absolute Magnitude",
                unit: "magnitude",
                description: "Intrinsic brightness at 10 parsecs, standard distance magnitude, luminosity indicator. Used for stellar classification, HR diagram, and distance calculations. Related to luminosity, effective temperature, and stellar evolution."
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "parsecs",
                description: "Distance to the star, stellar distance, parallax distance. Can be calculated from parallax, distance modulus, or luminosity distance. Related to parallax, redshift, and lookback time."
            }
        ],
        relationships: {
            prerequisites: ["parallax_distance_arcsec", "parallax_distance_radians"],
            derivedFrom: [],
            relatedTo: ["magnitude_flux_relation", "luminosity", "hr_absolute_magnitude", "luminosity_distance", "angular_diameter_distance"],
            uses: ["luminosity", "hr_absolute_magnitude"],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "distance modulus",
            "distance from magnitude",
            "magnitude distance",
            "find distance from magnitude",
            "calculate distance magnitude",
            "distance ladder",
            "standard candle distance",
            "magnitude to distance",
            "distance from absolute magnitude",
            "apparent absolute magnitude distance",
            "what is the apparent magnitude",
            "apparent magnitude with extinction",
            "magnitude after extinction",
            "apparent magnitude system",
            "apparent magnitude extinction",
            "magnitude interstellar extinction",
            "m - M = -5 + 5 log10(d)",
            "distance in pc from apparent and absolute magnitude",
            "Type Ia supernova distance absolute magnitude -19.3"
        ]
    },
    {
        id: "luminosity",
        name: "Stellar Luminosity",
        description: "Stefan–Boltzmann for a sphere: L = 4πR²σT⁴. Relative solar form: stefan_boltzmann_luminosity_ratio.",
        equation: "L = 4πR²σT⁴",
        solveFor: {
            R: "R = sqrt(L / (4 * pi * σ * T^4))",
            T: "T = (L / (4 * pi * R^2 * σ))^(1/4)"
        },
        concepts: ["luminosity", "stellar luminosity", "stefan-boltzmann", "blackbody radiation", "stellar evolution", "hr diagram", "mass-luminosity relation", "stellar classification", "effective temperature", "surface temperature", "stellar radius", "radiative transfer", "energy output", "power"],
        keywords: ["luminosity", "brightness", "power", "energy", "star", "stellar", "temperature", "radius", "blackbody", "stefan-boltzmann", "hr diagram", "evolution", "classification"],
        variables: [
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Total power output of the star, bolometric luminosity, stellar energy output. Related to absolute magnitude, flux, and distance. Determines stellar lifetime, mass-luminosity relation, and evolutionary stage."
            },
            {
                symbol: "R",
                name: "Radius",
                unit: "meters",
                description: "Radius of the star, stellar radius, photospheric radius. Related to angular size, distance, and surface area. Determines surface gravity, escape velocity, and stellar classification."
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Surface temperature of the star, effective temperature, photospheric temperature. Related to spectral type, color index, and Wien's law. Determines blackbody spectrum, peak wavelength, and stellar classification."
            }
        ],
        constants: {
            σ: 5.6703744191844294e-8  // SI exact Stefan-Boltzmann constant (W/(m²·K⁴))
        },
        presets: [
            {
                name: "Sun",
                description: "Calculate luminosity for the Sun",
                values: { R: 6.957e8, T: 5778 } // Solar radius, Solar temperature
            },
            {
                name: "Sirius A",
                description: "Calculate luminosity for Sirius A (brightest star)",
                values: { R: 1.711e9, T: 9940 } // Sirius radius, temperature
            },
            {
                name: "Betelgeuse",
                description: "Calculate luminosity for Betelgeuse (red supergiant)",
                values: { R: 8.8e11, T: 3600 } // Betelgeuse radius, temperature
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["distance_modulus", "magnitude_flux_relation", "flux_from_luminosity", "hr_absolute_magnitude", "mass_luminosity_relation", "stellar_lifetime"],
            uses: ["distance_modulus", "magnitude_flux_relation"],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "what is the luminosity",
            "stellar luminosity",
            "luminosity of star",
            "how bright is the star",
            "star luminosity",
            "calculate luminosity",
            "find luminosity",
            "luminosity from temperature radius",
            "stefan boltzmann luminosity",
            "temperature from luminosity and radius",
            "given radius 2.7 R sun luminosity temperature"
        ]
    },
    {
        id: "temperature_from_luminosity_radius_solar",
        name: "Temperature from Luminosity and Radius (Solar Units)",
        description: "Effective temperature from L and R in solar units: L/L☉ = (R/R☉)² (T/T☉)⁴ ⇒ T = T☉ (L/L☉)^(1/4) / (R/R☉)^(1/2). T☉ ≈ 5778 K.",
        equation: "T = 5778 * (L_ratio^0.25) / (R_ratio^0.5)",
        concepts: ["temperature", "luminosity", "radius", "stellar", "Stefan-Boltzmann", "solar units"],
        keywords: ["temperature from luminosity radius", "given radius luminosity temperature kelvin", "2.7 R sun temperature"],
        variables: [
            { symbol: "T", name: "Temperature", unit: "K", description: "Effective temperature" },
            { symbol: "L_ratio", name: "L/L☉", unit: "dimensionless", description: "Luminosity in solar units" },
            { symbol: "R_ratio", name: "R/R☉", unit: "dimensionless", description: "Radius in solar units" }
        ],
        constants: { T_sun: 5778 },
        questionPatterns: [
            "temperature from luminosity radius solar",
            "radius 2.7 R sun luminosity 46.8 temperature",
            "stellar temperature from L and R"
        ]
    },
    {
        id: "stefan_boltzmann_luminosity_ratio",
        name: "Stefan–Boltzmann (Luminosity Ratios vs Solar)",
        description: "Hierarchy: Stellar atmospheres → Blackbody emission → Stefan–Boltzmann scaling.\n\n(1) Physical meaning: L/L☉ = (R/R☉)² (T/T☉)⁴ expresses total radiative output vs the Sun when both stars are treated as blackbodies — area (∝ R²) times σT⁴.\n\n(2) When to use: HR-diagram reasoning, comparing two stars in solar units, quick luminosity estimates from (R,T) changes.\n\n(3) Intuition: Temperature wins decisively (fourth power); small ΔT can dominate over modest ΔR.\n\n(4) Pairs with luminosity (absolute form) and temperature_from_luminosity_radius_solar.\n\nNote: Ratios are dimensionless — the result unit picker stays in dimensionless form.",
        equation: "L_ratio = R_ratio^2 * T_ratio^4",
        solveFor: {
            L_ratio: "L_ratio = R_ratio^2 * T_ratio^4",
            R_ratio: "R_ratio = sqrt(L_ratio / T_ratio^4)",
            T_ratio: "T_ratio = (L_ratio / R_ratio^2)^(1/4)"
        },
        concepts: ["stefan-boltzmann", "luminosity", "radius", "temperature", "solar units"],
        keywords: ["L over L sun", "R R sun T T sun fourth", "stefan boltzmann ratio", "hr diagram luminosity temperature radius"],
        variables: [
            { symbol: "L_ratio", name: "L/L☉", unit: "dimensionless", description: "Luminosity relative to Sun" },
            { symbol: "R_ratio", name: "R/R☉", unit: "dimensionless", description: "Radius relative to Sun" },
            { symbol: "T_ratio", name: "T/T☉", unit: "dimensionless", description: "Effective temperature relative to Sun (T☉ ≈ 5778 K)" }
        ],
        relationships: {
            prerequisites: ["luminosity"],
            derivedFrom: ["luminosity"],
            relatedTo: ["luminosity", "stefan_boltzmann_law", "temperature_from_luminosity_radius_solar", "wiens_law"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "luminosity ratio radius temperature solar",
            "L Lsun R Rsun T Tsun",
            "stefan boltzmann relative solar"
        ]
    },
    {
        id: "hubble_law",
        name: "Hubble's Law",
        description: "Relates recessional velocity to distance in an expanding universe. Fundamental cosmological law connecting galaxy motion, cosmic expansion, and cosmic distance. Essential for cosmology, big bang theory, dark energy, and large-scale structure. Basis for luminosity distance, lookback time, and cosmic age calculations.",
        equation: "v = H₀ × d",
        solveFor: {
            d: "d = v / H₀",
            "H₀": "H₀ = v / d"
        },
        concepts: ["hubble", "hubble law", "hubble constant", "cosmology", "cosmic expansion", "big bang", "redshift", "recessional velocity", "luminosity distance", "lookback time", "dark energy", "cosmic distance", "galaxy", "universe"],
        keywords: ["hubble", "expansion", "cosmology", "universe", "galaxy", "redshift", "velocity", "distance", "big bang", "dark energy", "cosmic", "recessional"],
        variables: [
            {
                symbol: "v",
                name: "Recessional Velocity",
                unit: "km/s",
                description: "Speed at which galaxy is moving away, expansion velocity, cosmological velocity. Related to redshift, doppler shift, and cosmic expansion. Determines lookback time and cosmic distance."
            },
            {
                symbol: "H₀",
                name: "Hubble Constant",
                unit: "km/(s·Mpc)",
                description: "Rate of expansion of the universe, hubble parameter, expansion rate. Related to cosmic age, critical density, and dark energy. Determines luminosity distance and lookback time."
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "Mpc",
                description: "Distance to the galaxy, luminosity distance, comoving distance. Related to redshift, lookback time, and cosmic scale factor. Used in cosmic distance ladder and standard candle calibration."
            }
        ],
        constants: {
            "H₀": 69.8  // km/(s·Mpc), common in coursework and labs
        },
        relationships: {
            prerequisites: ["doppler_shift", "redshift_definition"],
            derivedFrom: [],
            relatedTo: ["redshift_definition", "doppler_shift", "luminosity_distance", "lookback_time", "angular_diameter_distance"],
            uses: ["luminosity_distance", "lookback_time"],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "hubble law",
            "hubble constant",
            "recessional velocity",
            "velocity from distance",
            "distance from velocity",
            "cosmic expansion",
            "galaxy velocity",
            "how fast is galaxy moving",
            "hubble distance",
            "calculate hubble distance",
            "velocity at which supernova appears to be receding",
            "recessing from the observer"
        ]
    },
    {
        id: "hubble_time",
        name: "Hubble Time",
        description: "Rough time since recession began assuming constant expansion: t ≈ 1/H₀. With H₀ in km/s/Mpc, t_sec = 3.086×10¹⁹ / H₀ (1 Mpc = 3.086×10¹⁹ km). E.g. H₀ = 67.4 ⇒ t ≈ 4.58×10¹⁷ s ≈ 1.45×10¹⁰ yr.",
        equation: "t_sec = 3.086e19 / H0",
        concepts: ["hubble time", "cosmic age", "expansion", "lookback time"],
        keywords: ["hubble time", "time since galaxy began receding", "1 over H0"],
        variables: [
            { symbol: "t_sec", name: "Time", unit: "seconds", description: "Hubble time (÷ 3.156e7 for years)" },
            { symbol: "H0", name: "Hubble Constant", unit: "km/(s·Mpc)", description: "H₀" }
        ],
        questionPatterns: [
            "time since galaxy began receding",
            "estimate time constant recession",
            "hubble time years"
        ]
    },
    {
        id: "surface_gravity",
        name: "Surface Gravity",
        description: "Surface gravitational acceleration g = GM/R².",
        equation: "g = GM/r²",
        solveFor: {
            r: "r = sqrt(G * M / g)",
            M: "M = g * r^2 / G"
        },
        concepts: ["surface gravity", "gravity", "gravitational acceleration", "planetary science", "exoplanets", "stellar structure", "compact objects", "escape velocity", "orbital velocity", "tidal forces", "planetary mass", "stellar mass"],
        keywords: ["gravity", "acceleration", "gravitational", "surface", "planet", "star", "exoplanet", "mass", "radius", "gravitational field"],
        variables: [
            {
                symbol: "g",
                name: "Surface Gravity",
                unit: "m/s²",
                description: "Acceleration due to gravity at surface, gravitational field strength, surface acceleration. Related to escape velocity (v_esc = √(2gr)), orbital velocity, and weight. Determines atmospheric retention and planetary habitability."
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of the body, planetary mass, stellar mass, compact object mass. Determines gravitational force, escape velocity, and orbital period. Related to density, volume, and gravitational potential."
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radius of the body, surface radius, planetary radius, stellar radius. Determines surface area, volume, and gravitational field strength. Related to angular size, distance, and surface gravity."
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        questionPatterns: [
            "surface gravity",
            "what is the gravity",
            "gravitational acceleration",
            "gravity at surface",
            "surface gravitational field",
            "calculate surface gravity",
            "find surface gravity",
            "gravity of planet",
            "gravity of star",
            "radius from surface gravity and mass",
            "acceleration due to gravity g GM r squared",
            "what is the radius given g and M"
        ]
    },
    {
        id: "angular_size",
        name: "Angular Size",
        description: "Small-angle approximation: θ = d/D (θ in radians, d = linear size, D = distance).",
        equation: "θ = d / D",
        solveFor: {
            d: "d = θ * D",
            D: "D = d / θ"
        },
        concepts: ["angular size", "angular diameter", "angular resolution", "telescope", "observations", "stellar radius", "planetary imaging", "parallax", "small angle approximation", "geometry", "distance", "size"],
        keywords: ["angular", "size", "diameter", "resolution", "telescope", "observation", "distance", "geometry", "parallax", "small angle"],
        variables: [
            {
                symbol: "θ",
                name: "Angular Size",
                unit: "radians",
                description: "Angular diameter as seen from observer, angular extent, subtended angle. Related to angular resolution, seeing, and diffraction limit. Used in stellar radius determination and planetary imaging."
            },
            {
                symbol: "d",
                name: "Physical Diameter",
                unit: "meters",
                description: "Actual size of the object, linear diameter, physical size. Related to radius, surface area, and volume. Determines angular size when combined with distance. Formula base is SI metres; AU, pc, ly, etc. convert into metres before solving."
            },
            {
                symbol: "D",
                name: "Distance",
                unit: "meters",
                description: "Distance to the object, observer distance, stellar distance, planetary distance. Related to parallax, distance modulus, and luminosity distance. Formula base is SI metres; use alternate unit fields and values convert before solve."
            }
        ],
        questionPatterns: [
            "angular size",
            "angular diameter",
            "what is the angular size",
            "angular size of object",
            "calculate angular size",
            "find angular size",
            "angular diameter distance",
            "how big does it appear",
            "angular distance between two stars",
            "angular distance RR Lyrae white dwarf",
            "separation 0.67 AU distance parsecs angular"
        ]
    },
    {
        id: "angular_separation_arcsec",
        name: "Angular Separation (Arcseconds)",
        description: "Angular separation in arcseconds from linear separation and distance. θ_arcsec = 206265 × (linear / distance) with both in the same length unit (formula base: metres). 206265 arcsec/rad. E.g. Mira A–B: 100 AU at 300 ly ⇒ θ ≈ 1.1\".",
        equation: "theta_arcsec = 206265 * (linear / distance)",
        concepts: ["angular separation", "arcseconds", "resolution", "binary", "linear separation", "binary separation"],
        keywords: ["angular separation arcsec", "arcseconds from linear distance", "Mira A Mira B angular", "linear separation and distance", "binary angular separation"],
        variables: [
            { symbol: "theta_arcsec", name: "Angular Separation", unit: "arcsec", description: "θ in arcseconds" },
            { symbol: "linear", name: "Linear Separation", unit: "m", description: "Physical separation (e.g. AU × 1.5e11 m/AU). Same length unit as distance after conversion to formula base (m)." },
            { symbol: "distance", name: "Distance", unit: "m", description: "Distance to system. Formula base is metres; other columns convert before solve." }
        ],
        constants: { arcsec_per_rad: 206265 },
        questionPatterns: [
            "angular separation in arcseconds",
            "angular separation arcsec",
            "is this detectable ground-based",
            "Mira A Mira B angular separation",
            "linear separation and distance to binary",
            "find angular separation from linear separation and distance"
        ]
    },
    {
        id: "linear_separation_from_angular",
        name: "Linear Separation from Angular (Arcsec)",
        description: "Physical separation from angular separation in arcseconds and distance. linear = θ_arcsec × distance / 206265 (distance in m gives linear in m; formula base is metres). E.g. 0.052\" at 490 ly ⇒ ~7.79 AU.",
        equation: "linear = theta_arcsec * distance / 206265",
        concepts: ["angular size", "linear separation", "arcsec", "binary separation", "physical separation"],
        keywords: ["linear separation from angular", "distance in AU from arcsec", "Siwarha Betelgeuse separation AU", "physical separation from angular separation"],
        variables: [
            { symbol: "linear", name: "Linear Separation", unit: "m", description: "Physical separation (same units as distance after conversion to formula base, metres)." },
            { symbol: "theta_arcsec", name: "Angular Separation", unit: "arcsec", description: "θ in arcseconds" },
            { symbol: "distance", name: "Distance", unit: "m", description: "Distance to system. Formula base is metres; other columns convert before solve." }
        ],
        constants: { arcsec_per_rad: 206265 },
        questionPatterns: [
            "corresponding distance in AU",
            "linear separation from angular",
            "0.052 arcsec distance AU",
            "separation in AU from arcsec",
            "physical separation from angular separation",
            "physical separation in AU from angular separation"
        ]
    },
    {
        id: "radian_arcsecond_conversion",
        name: "Radians ↔ Arcseconds",
        description: "Hierarchy: Plane angle → DMS-style astronomy units.\n\n(1) Physical meaning: Converts between radians and arcseconds using 1 rad = 180/π degrees = 206264.806… arcseconds (often rounded as 206265).\n\n(2) When to use: Parallax, resolution limits, converting small-angle formula outputs (θ=d/D in rad) to arcseconds for comparison with observations.\n\n(3) Intuition: Arcseconds are tiny; large arcsecond counts mean you left radians unsquared or missed a factor.\n\n(4) Sits between angular_size and angular_separation_arcsec.\n\nUnit picker: When the solved variable is in rad, you can switch to deg or arcmin; for arcsec results, switch to rad/deg/arcmin.",
        equation: "theta_arcsec = theta_rad * 206265",
        solveFor: {
            theta_arcsec: "theta_arcsec = theta_rad * 206265",
            theta_rad: "theta_rad = theta_arcsec / 206265"
        },
        concepts: ["radians", "arcseconds", "angular conversion", "small angle"],
        keywords: ["radian to arcsecond", "206265", "arcsec per radian", "convert small angle radians to arcsec"],
        variables: [
            { symbol: "theta_arcsec", name: "Angle (arcseconds)", unit: "arcsec", description: "Angle in arcseconds" },
            { symbol: "theta_rad", name: "Angle (radians)", unit: "rad", description: "Angle in radians" }
        ],
        constants: { arcsec_per_rad: 206265 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["angular_size", "angular_separation_arcsec", "linear_separation_from_angular", "diffraction_limit_rayleigh"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["convert radian to arcsecond", "206265 radians arcseconds", "radians to arcsec"]
    },
    {
        id: "degree_to_arcminute",
        name: "Degrees to Arcminutes",
        description: "Hierarchy: Angle subdivision → sexagesimal step 1 of 2.\n\n(1) Physical meaning: 1° = 60′ (arcminutes). Converts between whole-degree style angles and arcminute notation.\n\n(2) When to use: Field-of-view calculations, lunar/solar diameter in deg→′, converting catalog angles.\n\n(3) Intuition: Combine with arcminute_to_arcsecond for full 1° = 3600″.\n\n(4) Chain with radian_arcsecond_conversion when mixing rad and DMS.\n\nUnit picker: deg ↔ rad ↔ arcmin ↔ arcsec when solving for angular variables.",
        equation: "arcmin = deg * 60",
        solveFor: {
            arcmin: "arcmin = deg * 60",
            deg: "deg = arcmin / 60"
        },
        concepts: ["angular units", "degrees", "arcminutes"],
        keywords: ["degrees to arcminutes", "60 arcmin per degree", "sexagesimal degrees arcminutes"],
        variables: [
            { symbol: "deg", name: "Degrees", unit: "deg", description: "Angle in degrees" },
            { symbol: "arcmin", name: "Arcminutes", unit: "arcmin", description: "Angle in arcminutes" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["arcminute_to_arcsecond", "radian_arcsecond_conversion", "angular_size"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["degrees to arcminutes", "convert degrees arcmin"]
    },
    {
        id: "arcminute_to_arcsecond",
        name: "Arcminutes to Arcseconds",
        description: "Hierarchy: Angle subdivision → sexagesimal step 2 of 2.\n\n(1) Physical meaning: 1′ = 60″. Completes the degree–arcminute–arcsecond ladder (1° = 3600″).\n\n(2) When to use: Telescope resolution quoted in arcseconds after starting from arcminutes; double-star separations.\n\n(3) Intuition: Always multiply going to smaller units, divide when climbing the ladder.\n\n(4) Pairs with degree_to_arcminute and radian_arcsecond_conversion.\n\nUnit picker: arcmin ↔ arcsec ↔ deg ↔ rad depending on solved variable.",
        equation: "arcsec = arcmin * 60",
        solveFor: {
            arcsec: "arcsec = arcmin * 60",
            arcmin: "arcmin = arcsec / 60"
        },
        concepts: ["angular units", "arcminutes", "arcseconds"],
        keywords: ["arcminute to arcsecond", "60 arcsec per arcmin", "arcminutes arcseconds conversion"],
        variables: [
            { symbol: "arcmin", name: "Arcminutes", unit: "arcmin", description: "Angle in arcminutes" },
            { symbol: "arcsec", name: "Arcseconds", unit: "arcsec", description: "Angle in arcseconds" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["degree_to_arcminute", "radian_arcsecond_conversion", "angular_separation_arcsec"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["arcminutes to arcseconds", "convert arcmin arcsec"]
    },
    {
        id: "brightness_ratio_times_brighter",
        name: "Brightness Ratio (Times Brighter from Magnitudes)",
        description: "How many times brighter object 1 is than object 2 from absolute (or apparent) magnitudes. ratio = 100^((M₂−M₁)/5) = 10^(0.4×(M₂−M₁)). E.g. Betelgeuse M=−6, Sirwarha M=3.044 ⇒ 4145× brighter.",
        equation: "ratio = 10^(0.4 * (M_faint - M_bright))",
        concepts: ["brightness ratio", "magnitude", "times brighter", "photometry"],
        keywords: ["how many times brighter", "times brighter magnitude", "Betelgeuse Sirwarha brighter"],
        variables: [
            { symbol: "ratio", name: "Brightness Ratio", unit: "dimensionless", description: "Factor by which brighter star is brighter" },
            { symbol: "M_faint", name: "Magnitude of Fainter", unit: "mag", description: "Absolute or apparent mag of fainter object" },
            { symbol: "M_bright", name: "Magnitude of Brighter", unit: "mag", description: "Absolute or apparent mag of brighter object" }
        ],
        questionPatterns: [
            "how many times brighter",
            "times brighter than",
            "Betelgeuse than Sirwarha",
            "brightness ratio from magnitude"
        ]
    },
    {
        id: "parallax_distance_radians",
        name: "Parallax Distance (Radians)",
        description: "Calculates distance to a star using parallax angle in radians (general form). Parallax is the apparent shift in position of a nearby star against distant background stars as Earth orbits the Sun. This trigonometric method uses the parallax angle measured in radians to determine stellar distances. Essential for measuring distances to nearby stars, calibrating the cosmic distance ladder, and understanding stellar positions. The parallax method is the foundation of astrometry and distance measurement in astronomy. Works for any parallax angle but is most accurate for nearby stars with measurable parallax.",
        equation: "d = 1 AU / tan(p)",
        variables: [
            {
                symbol: "d",
                name: "Distance",
                unit: "AU",
                description: "Distance from Earth to the star"
            },
            {
                symbol: "p",
                name: "Parallax Angle",
                unit: "radians",
                description: "Parallax angle of the star"
            }
        ],
        constants: {
            AU: 149597870700  // IAU 2012 exact astronomical unit (m)
        },
        questionPatterns: [
            "parallax distance radians",
            "distance from parallax radians",
            "parallax to distance",
            "distance using parallax",
            "calculate distance parallax",
            "find distance parallax"
        ]
    },
    {
        id: "parallax_distance_arcsec",
        name: "Parallax Distance (Arcseconds)",
        description: "Calculates distance to a star using parallax angle in arcseconds (small angle approximation). The most commonly used form of the parallax distance formula, where distance in parsecs equals 1 divided by parallax in arcseconds. This formula uses the small angle approximation (tan(p) ≈ p for small angles) which is highly accurate for stellar parallaxes. Essential for measuring distances to nearby stars, determining stellar absolute magnitudes, and calibrating the cosmic distance ladder. One parsec (pc) is defined as the distance at which a star has a parallax of 1 arcsecond. This is the standard method used by space missions like Hipparcos and Gaia for precise stellar distance measurements.",
        equation: "d = 1 / p",
        solveFor: { p: "p = 1 / d" },
        variables: [
            {
                symbol: "d",
                name: "Distance",
                unit: "parsecs",
                description: "Distance from Earth to the star"
            },
            {
                symbol: "p",
                name: "Parallax Angle",
                unit: "arcseconds",
                description: "Parallax angle of the star"
            }
        ],
        questionPatterns: [
            "parallax distance",
            "distance from parallax",
            "parallax to distance",
            "distance using parallax arcseconds",
            "calculate distance parallax",
            "find distance parallax",
            "parallax 0.005",
            "distance from 0.005 parallax",
            "is parallax reasonable",
            "star moved 8 milliarcseconds",
            "parallax 8 mas",
            "distance from 8 milliarcseconds",
            "parallax over 6 months",
            "stellar parallax distance",
            "parallax measurement",
            "how far is star from parallax",
            "parallax angle to parsecs",
            "milliarcsecond parallax",
            "parallax distance calculation",
            "RS Puppis parallax 0.563 mas",
            "parallax 0.563 mas find distance",
            "bolometric luminosity distance from parallax",
            "parallax angle from distance",
            "calculate parallax from distance",
            "70 parsecs parallax",
            "star 70 parsecs parallax arcseconds",
            "distance in pc from parallax",
            "parallax milliarcseconds to parsecs",
            "spectroscopic parallax d = 1/p",
            "parallax 0.412 milliarcseconds how far in pc",
            "convert parallax to distance parsecs"
        ]
    },
    {
        id: "parallax_from_distance",
        name: "Parallax from Distance",
        description: "Parallax angle in arcseconds from distance in parsecs. p = 1/d. E.g. 70 pc ⇒ p = 1/70 = 0.0143 arcsec.",
        equation: "p = 1 / d",
        concepts: ["parallax", "distance", "arcseconds", "parsec"],
        keywords: ["parallax from distance", "parallax angle arcseconds", "p equals 1 over d"],
        variables: [
            { symbol: "p", name: "Parallax", unit: "arcsec", description: "Parallax angle" },
            { symbol: "d", name: "Distance", unit: "parsecs", description: "Distance to star" }
        ],
        questionPatterns: [
            "parallax angle in arcseconds",
            "calculate parallax from distance",
            "star 70 parsecs parallax"
        ]
    },
    {
        id: "parallax_to_light_years",
        name: "Distance from Parallax (Light Years)",
        description: "Distance in light years from parallax in arcseconds. d_pc = 1/p, and 1 pc ≈ 3.26 ly, so d_ly = 3.26/p. E.g. p = 20 mas = 0.02 arcsec ⇒ d = 163 ly.",
        equation: "d_ly = 3.26 / p",
        concepts: ["parallax", "distance", "light years", "parsec"],
        keywords: ["parallax light years", "distance in light years", "parallax to light years"],
        variables: [
            { symbol: "d_ly", name: "Distance", unit: "light years", description: "Distance in light years" },
            { symbol: "p", name: "Parallax", unit: "arcseconds", description: "Parallax angle (e.g. 20 mas = 0.02)" }
        ],
        constants: { pc_to_ly: 3.26 },
        questionPatterns: [
            "distance in light years",
            "parallax 20 milliarcseconds light years",
            "calculate distance light years parallax"
        ]
    },
    {
        id: "max_gamma_bohm",
        name: "Maximum Gamma (Bohm Limit)",
        description: "Maximum Lorentz factor from acceleration vs. loss, based on Bohm limit approximation. Determines the highest relativistic gamma factor that can be achieved by a charged particle in a magnetic field before energy losses from synchrotron radiation balance the acceleration. Critical for understanding particle acceleration in astrophysical environments like supernova remnants, active galactic nuclei, and gamma-ray bursts. The Bohm limit represents the maximum efficiency for diffusive shock acceleration, where particles can be accelerated up to this energy before radiative losses become dominant. Essential for modeling high-energy astrophysical sources and understanding the physics of cosmic ray acceleration.",
        equation: "γmax ≈ √(6πε / (σT B ξ))",
        variables: [
            {
                symbol: "γmax",
                name: "Maximum Lorentz Factor",
                unit: "dimensionless",
                description: "Maximum relativistic gamma factor"
            },
            {
                symbol: "B",
                name: "Magnetic Field Strength",
                unit: "Tesla",
                description: "Strength of the magnetic field"
            },
            {
                symbol: "ξ",
                name: "Efficiency Parameter",
                unit: "dimensionless",
                description: "Dimensionless efficiency parameter"
            }
        ],
        constants: {
            e: 1.602176634e-19,  // Elementary charge in Coulombs
            σT: 6.6524587321e-29  // Thomson cross-section in m²
        }
    },
    {
        id: "cooling_break_gamma",
        name: "Cooling Break Lorentz Factor",
        description: "Break Lorentz factor where electrons have cooled significantly due to synchrotron radiation. Represents the critical energy at which relativistic electrons in a magnetic field have lost a significant fraction of their energy through synchrotron cooling. This break energy marks the transition in the synchrotron spectrum where the electron energy distribution changes due to cooling effects. Essential for modeling synchrotron spectra from astrophysical sources like supernova remnants, pulsar wind nebulae, and active galactic nuclei. The cooling break appears as a characteristic feature in the observed spectrum and provides information about the magnetic field strength, source age, and electron energy distribution.",
        equation: "γb = (6π m_e c) / (σ_T B² t_age)",
        variables: [
            {
                symbol: "γb",
                name: "Break Lorentz Factor",
                unit: "dimensionless",
                description: "Lorentz factor at the cooling break"
            },
            {
                symbol: "B",
                name: "Magnetic Field Strength",
                unit: "Tesla",
                description: "Strength of the magnetic field"
            },
            {
                symbol: "t_age",
                name: "System Age",
                unit: "seconds",
                description: "Age of the system"
            }
        ],
        constants: {
            m_e: 9.1093837139e-31,  // Electron mass in kg
            c: 2.99792458e8,  // Speed of light in m/s
            σ_T: 6.6524587321e-29  // Thomson cross-section in m²
        }
    },
    {
        id: "cooling_break_frequency",
        name: "Cooling Break Frequency",
        description: "Break frequency corresponding to the cooling break Lorentz factor. The characteristic frequency in the synchrotron spectrum where the spectral index changes due to electron cooling. This frequency marks where electrons with the cooling break Lorentz factor emit their peak synchrotron radiation. Essential for interpreting observed synchrotron spectra from astrophysical sources, determining magnetic field strengths, and understanding the evolution of high-energy particle populations. The break frequency provides a direct observational signature of synchrotron cooling and can be used to estimate source parameters like magnetic field strength and age.",
        equation: "νb = (3eB / (4π m_e c)) × γb²",
        variables: [
            {
                symbol: "νb",
                name: "Break Frequency",
                unit: "Hz",
                description: "Frequency at the cooling break"
            },
            {
                symbol: "B",
                name: "Magnetic Field Strength",
                unit: "Tesla",
                description: "Strength of the magnetic field"
            },
            {
                symbol: "γb",
                name: "Break Lorentz Factor",
                unit: "dimensionless",
                description: "Lorentz factor at the cooling break"
            }
        ],
        constants: {
            e: 1.602176634e-19,  // Elementary charge in Coulombs
            m_e: 9.1093837139e-31,  // Electron mass in kg
            c: 2.99792458e8  // Speed of light in m/s
        }
    },
    {
        id: "synchrotron_cooling_timescale",
        name: "Synchrotron Cooling Timescale",
        description: "Characteristic time for an electron to lose energy via synchrotron radiation. The timescale over which a relativistic electron loses a significant fraction of its energy through synchrotron emission in a magnetic field. This cooling timescale determines how long high-energy electrons can maintain their energy before radiative losses become dominant. Essential for understanding the evolution of synchrotron sources, modeling time-dependent spectra, and determining the maximum energy that electrons can reach in astrophysical environments. Shorter cooling timescales indicate stronger magnetic fields or higher electron energies, leading to more rapid energy loss and spectral evolution.",
        equation: "t_syn = (6π m_e c) / (σ_T B² γ)",
        variables: [
            {
                symbol: "t_syn",
                name: "Cooling Timescale",
                unit: "seconds",
                description: "Time for electron to lose most of its energy"
            },
            {
                symbol: "B",
                name: "Magnetic Field Strength",
                unit: "Gauss",
                description: "Strength of the magnetic field (in Gauss for this formula)"
            },
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Relativistic Lorentz factor of the electron"
            }
        ],
        constants: {
            m_e: 9.1093837139e-28,  // Electron mass in grams (CGS)
            c: 2.99792458e10,  // Speed of light in cm/s (CGS)
            σ_T: 6.6524587321e-25  // Thomson cross-section in cm² (CGS)
        }
    },
    {
        id: "synchrotron_power",
        name: "Synchrotron Power",
        description: "Power radiated by a relativistic electron via synchrotron radiation. The total electromagnetic power emitted by a relativistic charged particle (typically an electron) as it spirals in a magnetic field. Synchrotron radiation is the dominant energy loss mechanism for high-energy electrons in magnetic fields and produces the characteristic non-thermal spectra observed from many astrophysical sources. Essential for understanding energy losses in particle accelerators, modeling emission from supernova remnants, pulsar wind nebulae, active galactic nuclei, and gamma-ray bursts. The power scales with the square of the electron's Lorentz factor and the square of the magnetic field strength, making it extremely important for high-energy astrophysics.",
        equation: "P_syn = (4/3) σ_T c U_B γ²",
        variables: [
            {
                symbol: "P_syn",
                name: "Synchrotron Power",
                unit: "W",
                description: "Power radiated by the electron"
            },
            {
                symbol: "U_B",
                name: "Magnetic Energy Density",
                unit: "J/m³",
                description: "Energy density of the magnetic field"
            },
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Relativistic Lorentz factor"
            }
        ],
        constants: {
            σ_T: 6.6524587321e-29,  // Thomson cross-section in m²
            c: 2.99792458e8  // Speed of light in m/s
        }
    },
    {
        id: "magnetic_energy_density",
        name: "Magnetic Energy Density",
        description: "Energy density stored in a magnetic field. The energy per unit volume contained in a magnetic field, representing the stored potential energy that can be converted to other forms. Essential for understanding magnetic field energetics in astrophysical contexts like pulsar magnetospheres, accretion disks, and interstellar medium. The magnetic energy density determines the strength of magnetic effects and plays a crucial role in magnetohydrodynamics, plasma physics, and high-energy astrophysics. Related to synchrotron radiation, particle acceleration, and magnetic field dynamics.",
        equation: "U_B = B² / (8π)",
        variables: [
            {
                symbol: "U_B",
                name: "Magnetic Energy Density",
                unit: "J/m³",
                description: "Energy density of the magnetic field"
            },
            {
                symbol: "B",
                name: "Magnetic Field Strength",
                unit: "Tesla",
                description: "Strength of the magnetic field"
            }
        ]
    },
    {
        id: "magnetic_pressure_si",
        name: "Magnetic Pressure (SI)",
        description: "Magnetic pressure in SI units. In magnetostatic balance, magnetic fields contribute pressure PB = B²/(2μ0). Useful for white dwarf magnetic asymmetry and atmosphere balance.",
        equation: "P_B = B^2 / (2 * mu_0)",
        concepts: ["magnetic pressure", "magnetic field", "pressure balance", "white dwarf", "magnetism"],
        keywords: ["magnetic pressure", "B squared over 2 mu0", "pressure from magnetic field", "delta B pressure"],
        variables: [
            { symbol: "P_B", name: "Magnetic Pressure", unit: "Pa", description: "Pressure contributed by magnetic field" },
            { symbol: "B", name: "Magnetic Field Strength", unit: "Tesla", description: "Magnetic field strength" },
            { symbol: "mu_0", name: "Vacuum Permeability", unit: "N/A²", description: "Magnetic constant μ0" }
        ],
        constants: {
            mu_0: 1.25663706212e-6
        },
        questionPatterns: [
            "magnetic pressure",
            "pressure balance magnetic field",
            "delta B from pressure difference",
            "white dwarf magnetic asymmetry"
        ]
    },
    {
        id: "zeeman_splitting",
        name: "Zeeman Splitting (Approximate)",
        description: "Approximate Zeeman splitting of a spectral line in Angstroms for field strength in Gauss. Often used for hydrogen lines: Δλ ≈ 4.7×10^-13 λ₀² B. Useful for bounding magnetic fields from non-detection of line splitting.",
        equation: "delta_lambda = 4.7e-13 * lambda_0^2 * B",
        concepts: ["zeeman splitting", "magnetic field", "spectral line splitting", "hydrogen lines", "spectroscopy"],
        keywords: ["zeeman splitting", "H alpha splitting", "upper bound magnetic field", "lambda squared B"],
        variables: [
            { symbol: "delta_lambda", name: "Line Splitting", unit: "Angstrom", description: "Observed splitting of line" },
            { symbol: "lambda_0", name: "Rest Wavelength", unit: "Angstrom", description: "Rest wavelength of the line" },
            { symbol: "B", name: "Magnetic Field Strength", unit: "Gauss", description: "Magnetic field in Gauss" }
        ],
        questionPatterns: [
            "zeeman splitting",
            "H alpha zeeman splitting",
            "upper bound delta B",
            "spectral resolution 10 angstrom"
        ]
    },
    {
        id: "power_law_spectrum",
        name: "Power-Law Energy Spectrum",
        description: "Differential number of particles per unit energy as a function of energy. Describes the energy distribution of particles in a population, typically following a power-law spectrum. Essential for modeling particle populations in astrophysical sources like cosmic rays, supernova remnants, active galactic nuclei, and gamma-ray bursts. The power-law index determines the spectral shape and provides information about acceleration mechanisms, cooling processes, and source evolution. Critical for interpreting observed spectra and understanding particle acceleration physics in high-energy astrophysical environments.",
        equation: "N(E) = K E^(-p)",
        variables: [
            {
                symbol: "N",
                name: "Spectral Density",
                unit: "particles/energy",
                description: "Number of particles per unit energy at energy E"
            },
            {
                symbol: "K",
                name: "Normalization Constant",
                unit: "varies",
                description: "Constant of proportionality"
            },
            {
                symbol: "E",
                name: "Energy",
                unit: "energy units",
                description: "Energy at which spectral density is evaluated"
            },
            {
                symbol: "p",
                name: "Power-Law Index",
                unit: "dimensionless",
                description: "Exponent describing steepness of spectrum"
            }
        ]
    },
    {
        id: "spectral_index",
        name: "Spectral Index",
        description: "Relates power-law index to spectral index. Connects the particle energy distribution index (p) to the observed synchrotron spectral index (α). This relationship is fundamental for interpreting synchrotron spectra from astrophysical sources. The spectral index describes how flux density changes with frequency, while the power-law index describes the particle energy distribution. Essential for modeling synchrotron emission from supernova remnants, pulsar wind nebulae, active galactic nuclei, and gamma-ray bursts. The relationship assumes isotropic pitch angle distribution and provides a direct link between particle physics and observed radiation.",
        equation: "α = (p - 1) / 2",
        variables: [
            {
                symbol: "α",
                name: "Spectral Index",
                unit: "dimensionless",
                description: "Spectral index of flux density"
            },
            {
                symbol: "p",
                name: "Power-Law Index",
                unit: "dimensionless",
                description: "Power-law index of particle spectrum"
            }
        ]
    },
    {
        id: "chandrasekhar_limit",
        name: "Chandrasekhar Limit",
        description: "Maximum stable mass for a white dwarf (order-of-magnitude). The Chandrasekhar limit represents the maximum mass that can be supported by electron degeneracy pressure against gravitational collapse. White dwarfs above this mass will collapse into neutron stars or black holes. This fundamental limit is approximately 1.4 solar masses and is critical for understanding stellar evolution, supernova Type Ia progenitors, and compact object formation. The limit depends on composition and represents a key milestone in stellar evolution theory. Essential for modeling white dwarf structure, supernova physics, and binary star evolution.",
        equation: "M_Ch ≈ 1.4 M_☉",
        variables: [
            {
                symbol: "M_Ch",
                name: "Chandrasekhar Mass",
                unit: "M_☉",
                description: "Maximum stable white dwarf mass"
            }
        ],
        constants: {
            "M_☉": 1.988409870440e30  // Solar mass in kg
        }
    },
    {
        id: "white_dwarf_mass_radius",
        name: "White Dwarf Mass-Radius Relation",
        description: "Non-relativistic approximation: radius inversely proportional to cube root of mass. Describes how white dwarf radius decreases as mass increases, a consequence of electron degeneracy pressure. This inverse relationship means more massive white dwarfs are smaller and denser. Essential for understanding white dwarf structure, stellar evolution endpoints, and compact object physics. The relationship breaks down near the Chandrasekhar limit where relativistic effects become important. Critical for modeling white dwarf cooling, mass-radius observations, and binary white dwarf systems.",
        equation: "R ∝ 1 / M^(1/3)",
        variables: [
            {
                symbol: "R",
                name: "Radius",
                unit: "meters",
                description: "Radius of the white dwarf"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of the white dwarf"
            }
        ]
    },
    {
        id: "wiens_law",
        name: "Wien's Displacement Law",
        description: "Relates peak wavelength of blackbody radiation to temperature. Wien's Displacement Law states that the wavelength at which a blackbody emits the most radiation is inversely proportional to its temperature. This fundamental law allows determination of stellar temperatures from observed spectra, color indices, and peak emission wavelengths. Essential for stellar classification, blackbody radiation analysis, and understanding the relationship between temperature and spectral characteristics. The law applies to all blackbody sources including stars, planets, and laboratory sources. Critical for interpreting stellar spectra, determining effective temperatures, and understanding the connection between temperature and observed color.",
        equation: "λmax = b / T",
        solveFor: { T: "T = b / λmax" },
        primaryUseCase: "temperature from wavelength",
        specificity: 10,
        concepts: ["temperature", "wien's law", "wien displacement", "wien", "peak wavelength", "blackbody radiation", "blackbody", "stellar temperature", "effective temperature", "surface temperature", "color temperature", "spectral classification", "stellar classification", "spectrum", "wavelength", "emission", "radiation", "thermal radiation"],
        keywords: ["wien", "displacement", "peak", "wavelength", "temperature", "blackbody", "spectrum", "stellar", "emission", "thermal", "radiation", "classification"],
        questionPatterns: [
            "find temperature from spectrum",
            "temperature from light",
            "temperature from wavelength",
            "what temperature from color",
            "spectrum to temperature",
            "temperature based on spectrum",
            "temperature from light spectrum",
            "peak wavelength",
            "wavelength at peak emission",
            "calculate peak wavelength",
            "find peak wavelength",
            "wien displacement law",
            "wien law",
            "peak wavelength temperature",
            "wavelength of maximum emission",
            "peak wavelength nanometers",
            "wavelength peak blackbody",
            "peak emission wavelength",
            "calculate wavelength from temperature",
            "wien constant",
            "frequency from wavelength",
            "peak frequency",
            "em spectrum region",
            "peak wavelength 400 nm temperature",
            "peak wavelength nanometers temperature kelvin",
            "temperature of star in K from emission spectra",
            "identify peak wavelength temperature",
            "lambda max T 2.898e-3"
        ],
        variables: [
            {
                symbol: "λmax",
                name: "Peak Wavelength",
                unit: "meters",
                description: "Wavelength at peak emission (400 nm = 4e-7 m)"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Surface temperature"
            }
        ],
        constants: {
            b: 2.898e-3  // Wien's displacement constant in m·K
        }
    },
    {
        id: "hydrostatic_balance",
        name: "Hydrostatic Balance",
        description: "Pressure gradient balancing gravitational force in stellar interiors. Hydrostatic equilibrium is the fundamental condition that maintains stellar structure, where the outward pressure gradient exactly balances the inward gravitational force at every point in the star. This equilibrium condition is essential for stellar structure models, determining how pressure, density, and temperature vary with radius. Critical for understanding stellar interiors, stellar evolution, and the stability of stars. The equation forms the basis of stellar structure calculations and is used in conjunction with equations of state, energy transport, and nuclear energy generation to model stellar properties.",
        equation: "dP/dr = -GM(r)ρ(r) / r²",
        variables: [
            {
                symbol: "dP_dr",
                name: "Pressure Gradient",
                unit: "Pa/m",
                description: "Change in pressure with radius"
            },
            {
                symbol: "M",
                name: "Enclosed Mass",
                unit: "kg",
                description: "Mass enclosed within radius r"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Density at radius r"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radial distance from center"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: [
                "stellar_mass_continuity",
                "stellar_luminosity_shell",
                "radiative_transport_temperature_gradient",
                "central_pressure_approximate",
                "convection_criterion",
                "ideal_gas_pressure"
            ],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "hydrostatic balance",
            "pressure gradient stellar",
            "stellar pressure gradient",
            "pressure balance star",
            "hydrostatic equilibrium",
            "stellar structure pressure",
            "calculate pressure gradient"
        ]
    },
    {
        id: "kepler_third_law_binary",
        name: "Kepler's Third Law (Binary System)",
        description: "Binary form: P² = 4π²a³ / (G(M₁+M₂)). Same as replacing M with total mass in Kepler III. Use with center_of_mass for individual distances.",
        equation: "P² = (4π²a³) / (G(M₁ + M₂))",
        variables: [
            {
                symbol: "P",
                name: "Orbital Period",
                unit: "seconds",
                description: "Time for one complete orbit"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of the orbit"
            },
            {
                symbol: "M1",
                name: "Mass of Primary",
                unit: "kg",
                description: "Mass of the first body"
            },
            {
                symbol: "M2",
                name: "Mass of Secondary",
                unit: "kg",
                description: "Mass of the second body"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        questionPatterns: [
            "kepler third law binary",
            "orbital period binary",
            "period binary system",
            "binary orbital period",
            "kepler binary",
            "period from masses binary",
            "calculate period binary"
        ]
    },
    {
        id: "gravitational_wave_frequency_binary_approx",
        name: "Gravitational-Wave Frequency (Binary, Order of Magnitude)",
        description: "Hierarchy: Relativity / compact objects → GW emission → binary quadrupole cartoon.\n\n(1) Physical meaning: For a circular binary, the dominant GW frequency is often quoted as ~2/T because the mass quadrupole moment returns to the same orientation twice per orbit (order-of-magnitude; harmonics and merger dynamics differ).\n\n(2) When to use: Estimating f from orbital period for BBH/BNS binaries, interpreting LIGO-style “chirp” back-of-envelope before merger.\n\n(3) Intuition: Higher orbital frequency (shorter T) → higher GW frequency scaling.\n\n(4) Combine with kepler_third_law_binary for a–M–T links. Not valid for final inspiral/plunge without numerical GR.\n\nUnit picker: Hz ↔ kHz ↔ MHz where applicable.",
        equation: "f_gw = 2 / T",
        solveFor: {
            f_gw: "f_gw = 2 / T",
            T: "T = 2 / f_gw"
        },
        concepts: ["gravitational waves", "binary", "orbital period", "frequency"],
        keywords: ["gravitational wave frequency", "f equals 2 over T", "GW frequency binary", "ligo order of magnitude frequency"],
        variables: [
            { symbol: "f_gw", name: "GW Frequency (approx.)", unit: "Hz", description: "Order-of-magnitude gravitational-wave frequency" },
            { symbol: "T", name: "Orbital Period", unit: "s", description: "Orbital period of the binary" }
        ],
        relationships: {
            prerequisites: ["kepler_third_law_binary"],
            derivedFrom: [],
            relatedTo: ["kepler_third_law_binary", "orbital_period_general", "schwarzschild_radius"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["gravitational wave frequency binary", "f gw 2 over T", "GW frequency order of magnitude"]
    },
    {
        id: "kepler_binary_solar_units",
        name: "Kepler's Third Law (Binary, Solar Units)",
        description: "For a binary system: P² = a³ / M_total when P is in years, a in AU, and M_total in solar masses. So a³ = P² × M_total, a = (P² × M_total)^(1/3). E.g. Betelgeuse–Sirwarha: P = 2170/365 yr, M = 16.6 M☉ ⇒ a ≈ 8.37 AU.",
        equation: "a = (P^2 * M_total)^(1/3)",
        concepts: ["kepler", "binary", "semi-major axis", "period", "solar units"],
        keywords: ["kepler binary solar", "semi-major axis binary years AU", "P squared a cubed M"],
        variables: [
            { symbol: "a", name: "Semi-major Axis", unit: "AU", description: "Semi-major axis of orbit" },
            { symbol: "P", name: "Orbital Period", unit: "years", description: "Period in years" },
            { symbol: "M_total", name: "Total Mass", unit: "M☉", description: "Sum of masses in solar masses" }
        ],
        questionPatterns: [
            "semi-major axis binary AU",
            "P squared a cubed M total",
            "determine semi-major axis binary",
            "Betelgeuse Sirwarha semi-major axis"
        ]
    },
    {
        id: "rotational_velocity",
        name: "Rotational Velocity",
        description: "Equatorial rotational velocity of a rotating body. The linear speed at the equator of a rotating astronomical object, calculated from the rotation period and radius. Essential for understanding stellar rotation, planetary rotation, and the effects of rotation on stellar structure and evolution. Rotation affects stellar evolution, magnetic field generation, and can lead to stellar flattening at high rotation rates. Critical for interpreting spectroscopic observations, understanding stellar activity, and modeling rotating stellar atmospheres. Related to angular momentum, rotational energy, and centrifugal effects.",
        equation: "v = (2πR) / P_rot",
        variables: [
            {
                symbol: "v",
                name: "Rotational Velocity",
                unit: "m/s",
                description: "Speed at the equator"
            },
            {
                symbol: "R",
                name: "Radius",
                unit: "meters",
                description: "Radius of the body"
            },
            {
                symbol: "P_rot",
                name: "Rotational Period",
                unit: "seconds",
                description: "Time for one complete rotation"
            }
        ],
        questionPatterns: [
            "rotational velocity",
            "rotation speed",
            "how fast does it rotate",
            "equatorial rotation speed",
            "rotational speed",
            "calculate rotational velocity",
            "find rotational velocity",
            "rotation velocity"
        ]
    },
    {
        id: "average_density",
        name: "Average Density",
        description: "Average density of a spherical body. The total mass divided by the volume of a spherical object, providing a fundamental physical property. Essential for understanding planetary composition, stellar structure, and compact object physics. Density determines whether an object is rocky, gaseous, or degenerate matter. Critical for planetary science, stellar evolution, and understanding the internal structure of astronomical objects. Used to classify planets, determine stellar types, and understand the physics of white dwarfs and neutron stars.",
        equation: "ρ = 3M / (4πR³)",
        variables: [
            {
                symbol: "ρ",
                name: "Average Density",
                unit: "kg/m³",
                description: "Average density of the body"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of the body"
            },
            {
                symbol: "R",
                name: "Radius",
                unit: "meters",
                description: "Radius of the body"
            }
        ],
        questionPatterns: [
            "average density",
            "what is the density",
            "density of object",
            "calculate density",
            "find density",
            "mean density",
            "bulk density",
            "density from mass volume"
        ]
    },
    {
        id: "flux_from_luminosity",
        name: "Flux from Luminosity",
        description: "Observed flux based on intrinsic luminosity and distance. The inverse square law for light, relating the observed flux (power per unit area) to the intrinsic luminosity and distance. As light travels outward from a source, it spreads over an increasing area, causing flux to decrease with the square of distance. Essential for determining stellar luminosities from observed fluxes, calculating distances, and understanding how brightness relates to intrinsic properties. Fundamental to the cosmic distance ladder and stellar astronomy. Critical for interpreting observations and connecting observed brightness to physical properties of astronomical sources.",
        equation: "F = L / (4πd²)",
        solveFor: {
            L: "L = F * 4 * pi * d^2",
            d: "d = sqrt(L / (4 * pi * F))"
        },
        variables: [
            {
                symbol: "F",
                name: "Observed Flux",
                unit: "W/m²",
                description: "Power received per unit area"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Total power emitted"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "meters",
                description: "Distance to the source"
            }
        ],
        questionPatterns: [
            "flux from luminosity",
            "subsequent flux",
            "bolometric luminosity and flux",
            "find flux from luminosity and distance",
            "F L 4 pi d squared"
        ]
    },
    {
        id: "magnitude_change_flux_ratio",
        name: "Magnitude Change from Flux Ratio (Extinction)",
        description: "Change in magnitude when flux is reduced (e.g. by extinction). Δm = -2.5 log₁₀(F/F₀). If brightness decreases 25%, F = 0.75 F₀, so Δm = -2.5 log₁₀(0.75). Used to correct distance when extinction is known.",
        equation: "delta_m = -2.5 * log10(F / F_0)",
        concepts: ["extinction", "magnitude", "flux ratio", "reddening", "distance correction"],
        keywords: ["magnitude change extinction", "brightness reduced 25%", "new estimate distance extinction", "delta m flux ratio", "flux ratio into magnitude change", "brightness drops percent"],
        variables: [
            { symbol: "delta_m", name: "Change in Magnitude", unit: "mag", description: "Δm (positive = dimmer)" },
            { symbol: "F", name: "Observed Flux", unit: "W/m²", description: "Flux after extinction" },
            { symbol: "F_0", name: "Unabsorbed Flux", unit: "W/m²", description: "Flux without extinction" }
        ],
        questionPatterns: [
            "brightness decreased 25%",
            "extinction reduces brightness",
            "new estimate distance extinction",
            "change in magnitude flux ratio",
            "flux ratio into a magnitude change",
            "brightness drops to 75 percent"
        ]
    },
    {
        id: "illuminated_area_phase",
        name: "Illuminated Area vs Orbital Phase",
        description: "Apparent lit area of a planet (or hemisphere) as seen by observer, as function of normalized orbital phase φ (0 to 1). A = π R² cos(π φ). Phase 0 = planet between star and observer (full lit face).",
        equation: "A = pi * R^2 * cos(pi * phi)",
        concepts: ["phase", "illuminated area", "orbital phase", "planet", "geometry"],
        keywords: ["illuminated area", "area lit phase", "orbital phase area", "Mr. Brightside"],
        variables: [
            { symbol: "A", name: "Lit Area", unit: "m²", description: "Apparent illuminated area" },
            { symbol: "R", name: "Planet Radius", unit: "m", description: "Radius of planet" },
            { symbol: "phi", name: "Orbital Phase", unit: "0 to 1", description: "Normalized phase (0 = between star and observer)" }
        ],
        constants: { pi: Math.PI },
        questionPatterns: [
            "area that appears lit",
            "illuminated area orbital phase",
            "expression for area lit phase",
            "half lit planet area phase"
        ]
    },
    {
        id: "magnitude_flux_relation",
        name: "Magnitude-Flux Relation",
        description: "Compares brightness between two stars based on their magnitudes. The fundamental relationship between magnitude differences and flux ratios in astronomy. The magnitude scale is logarithmic, where a difference of 5 magnitudes corresponds to a factor of 100 in flux. Essential for comparing stellar brightnesses, determining flux ratios from magnitude differences, and understanding the magnitude system. The negative sign indicates that brighter objects have smaller (more negative) magnitudes. Critical for photometry, stellar classification, and interpreting magnitude measurements in astronomy.",
        equation: "m₁ - m₂ = -2.5 log₁₀(F₁/F₂)",
        variables: [
            {
                symbol: "m1",
                name: "Magnitude of Star 1",
                unit: "magnitude",
                description: "Apparent magnitude of first star"
            },
            {
                symbol: "m2",
                name: "Magnitude of Star 2",
                unit: "magnitude",
                description: "Apparent magnitude of second star"
            },
            {
                symbol: "F1",
                name: "Flux of Star 1",
                unit: "W/m²",
                description: "Observed flux of first star"
            },
            {
                symbol: "F2",
                name: "Flux of Star 2",
                unit: "W/m²",
                description: "Observed flux of second star"
            }
        ]
    },
    {
        id: "inverse_square_law_brightness",
        name: "Inverse Square Law (Brightness)",
        description: "Relates brightness to luminosity and distance. The inverse square law expressing how observed brightness decreases with distance from a luminous source. Brightness (observed flux) equals luminosity divided by the surface area of a sphere at distance d. Essential for determining distances from known luminosities, calculating luminosities from observed brightnesses, and understanding how distance affects observed properties. Fundamental to stellar astronomy, extragalactic astronomy, and the cosmic distance ladder. Critical for interpreting observations and connecting intrinsic and observed properties of astronomical sources.",
        equation: "b = L / (4πd²)",
        variables: [
            {
                symbol: "b",
                name: "Brightness",
                unit: "W/m²",
                description: "Observed brightness"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Total power output of the source"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "meters",
                description: "Distance to the source"
            }
        ],
        constants: {
            pi: Math.PI
        }
    },
    {
        id: "doppler_shift",
        name: "Doppler Shift",
        description: "Relates observed wavelength shift to velocity. The Doppler effect for light, where motion toward or away from an observer causes a shift in observed wavelength. Blueshift (shorter wavelength) indicates motion toward the observer, while redshift (longer wavelength) indicates motion away. Essential for measuring stellar radial velocities, detecting exoplanets via the radial velocity method, determining galaxy recession velocities, and understanding cosmic expansion. Critical for spectroscopy, exoplanet detection, and cosmology. The formula applies to non-relativistic velocities; for high speeds, relativistic corrections are needed.",
        equation: "(λ_obs - λ_rest) / λ_rest = v / c",
        variables: [
            {
                symbol: "λ_obs",
                name: "Observed Wavelength",
                unit: "meters",
                description: "Wavelength as observed"
            },
            {
                symbol: "λ_rest",
                name: "Rest Wavelength",
                unit: "meters",
                description: "Wavelength at rest"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Radial velocity"
            }
        ],
        constants: {
            c: 2.998e8
        }
    },
    {
        id: "doppler_shift_approx",
        name: "Doppler Shift (Approximate)",
        description: "Approximate formula for Doppler shift. Simplified version of the Doppler effect for non-relativistic velocities, where the velocity is directly proportional to the fractional wavelength shift. This approximation is valid when velocities are much less than the speed of light. Essential for measuring stellar radial velocities, detecting exoplanets, and determining galaxy motions. Used extensively in spectroscopy and radial velocity measurements. For high velocities approaching the speed of light, the full relativistic Doppler formula must be used.",
        equation: "v = c × (Δλ / λ)",
        variables: [
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Radial velocity"
            },
            {
                symbol: "Δλ",
                name: "Change in Wavelength",
                unit: "meters",
                description: "Wavelength shift"
            },
            {
                symbol: "λ",
                name: "Wavelength",
                unit: "meters",
                description: "Rest wavelength"
            }
        ],
        constants: {
            c: 2.998e8
        }
    },
    {
        id: "stefan_boltzmann_law",
        name: "Stefan-Boltzmann Law",
        description: "Fundamental law of blackbody radiation relating total energy flux to temperature. The Stefan-Boltzmann law states that the total energy radiated per unit surface area of a blackbody per unit time is proportional to the fourth power of the blackbody's temperature. This is one of the most important laws in astrophysics and thermal physics. The law applies to all blackbody sources including stars, planets, and laboratory sources. Essential for stellar physics, blackbody radiation, thermal physics, planetary science, and understanding energy output from astronomical objects. The fourth-power dependence means small temperature changes produce large flux changes, making temperature the dominant factor in determining radiative output. Critical for determining stellar effective temperatures, calculating planetary thermal emission, understanding stellar evolution, and interpreting observed fluxes. Used extensively in stellar structure models, planetary science, and thermal physics. The Stefan-Boltzmann constant (σ = 5.670374419 × 10⁻⁸ W/(m²·K⁴)) is a fundamental physical constant derived from quantum mechanics and statistical physics.",
        equation: "F = σT⁴",
        primaryUseCase: "calculate flux from temperature using Stefan-Boltzmann law, determine temperature from observed flux, understand blackbody radiation",
        specificity: 10,
        concepts: ["stefan-boltzmann", "stefan boltzmann law", "blackbody radiation", "thermal radiation", "energy flux", "temperature", "radiative flux", "stellar physics", "thermal physics", "energy output", "blackbody", "radiation law", "effective temperature", "surface temperature", "stellar classification", "planetary science", "thermal emission", "bolometric flux", "radiative transfer", "stellar evolution", "hr diagram"],
        keywords: ["stefan-boltzmann", "stefan boltzmann", "blackbody", "thermal radiation", "energy flux", "temperature", "radiation law", "stellar", "flux", "energy output", "bolometric", "thermal emission", "effective temperature", "surface temperature", "radiative", "blackbody radiation", "fourth power", "temperature flux"],
        questionPatterns: [
            "stefan boltzmann law",
            "stefan-boltzmann law",
            "what is the stefan boltzmann law",
            "calculate flux from temperature",
            "energy flux temperature",
            "blackbody radiation flux",
            "thermal radiation flux",
            "stefan boltzmann constant",
            "total energy radiated",
            "flux from temperature",
            "temperature from flux",
            "blackbody flux",
            "thermal flux",
            "radiative flux temperature",
            "how to calculate flux from temperature",
            "find flux from temperature",
            "determine flux from temperature",
            "energy output temperature",
            "stellar flux temperature",
            "planetary flux temperature",
            "power radiated",
            "calculate power radiated",
            "emissivity power",
            "power from radius temperature",
            "luminosity from radius temperature",
            "total power output",
            "radiated power watts",
            "energy radiated per second",
            "power radiated by object",
            "calculate radiated power",
            "stefan boltzmann power",
            "luminosity stefan boltzmann"
        ],
        variables: [
            {
                symbol: "F",
                name: "Flux",
                unit: "W/m²",
                description: "Total energy flux, radiative flux, energy radiated per unit area per unit time. The total power per unit area emitted by a blackbody. Also called bolometric flux when integrated over all wavelengths. Essential for determining stellar effective temperatures and understanding energy output."
            },
            {
                symbol: "σ",
                name: "Stefan-Boltzmann Constant",
                unit: "W/(m²·K⁴)",
                description: "Stefan-Boltzmann constant, fundamental physical constant relating flux to temperature. Value: 5.670374419 × 10⁻⁸ W/(m²·K⁴). Derived from fundamental constants including Planck's constant, speed of light, and Boltzmann's constant. One of the most important constants in thermal physics and astrophysics."
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of the blackbody, effective temperature, surface temperature. Must be in Kelvin for the formula to work correctly. The fourth-power dependence means temperature is the dominant factor in determining flux. Small temperature changes produce large flux changes."
            }
        ],
        constants: {
            "σ": 5.6703744191844294e-8  // SI exact Stefan-Boltzmann constant (W/(m²·K⁴))
        },
        relationships: {
            prerequisites: ["wiens_law", "planck_relation"],
            derivedFrom: ["planck_relation"],
            relatedTo: ["luminosity", "wiens_law", "planck_relation", "blackbody_radiation", "planck_blackbody_nu_frequency", "rayleigh_jeans_B_nu", "energy_density_radiation", "stellar_lifetime", "hr_color_index", "hr_absolute_magnitude", "planetary_equilibrium_temperature", "flux_from_luminosity", "mass_luminosity_relation", "distance_modulus"],
            uses: ["wiens_law", "planck_relation"],
            generalizes: [],
            specializes: []
        },
        frqMetadata: {
            commonMistakes: [
                "Forgetting to convert temperature to Kelvin (using Celsius or Fahrenheit)",
                "Using the wrong power (using T² or T³ instead of T⁴)",
                "Confusing flux (F) with luminosity (L)",
                "Not accounting for surface area when calculating total power",
                "Mixing up the Stefan-Boltzmann constant value or units"
            ],
            exampleScenarios: [
                "Calculate the flux from a star given its effective temperature",
                "Determine the temperature of a planet from its thermal emission",
                "Compare energy output between stars of different temperatures",
                "Calculate how flux changes with temperature",
                "Determine stellar radius from luminosity and temperature"
            ],
            solutionSteps: [
                "Identify what you're solving for (flux F or temperature T)",
                "Ensure temperature is in Kelvin",
                "Use the Stefan-Boltzmann constant: σ = 5.670 × 10⁻⁸ W/(m²·K⁴)",
                "For flux: F = σT⁴",
                "For temperature: T = (F/σ)^(1/4)",
                "Check units and order of magnitude"
            ],
            contextNotes: [
                "This is the fundamental law for blackbody radiation",
                "The fourth-power dependence is critical - small temperature changes cause large flux changes",
                "Essential for understanding stellar physics and planetary thermal emission",
                "Often used in combination with luminosity formula: L = 4πR²σT⁴"
            ]
        }
    },
    {
        id: "light_gathering_power",
        name: "Light Gathering Power",
        description: "Ratio of light gathering ability of telescope to human eye. Compares the light-collecting power of a telescope to the human eye, showing how much brighter objects appear through a telescope. Light gathering power scales with the square of the diameter ratio, meaning a telescope with twice the diameter collects four times as much light. Essential for understanding telescope performance, comparing different telescope sizes, and determining the limiting magnitude of observations. Critical for telescope selection, observation planning, and understanding the advantages of larger apertures in astronomy.",
        equation: "LGP = (D_obj / D_eye)²",
        variables: [
            {
                symbol: "LGP",
                name: "Light Gathering Power",
                unit: "dimensionless",
                description: "Light gathering power ratio"
            },
            {
                symbol: "D_obj",
                name: "Objective Diameter",
                unit: "meters",
                description: "Diameter of telescope objective"
            },
            {
                symbol: "D_eye",
                name: "Eye Diameter",
                unit: "meters",
                description: "Diameter of human eye pupil"
            }
        ]
    },
    {
        id: "magnification",
        name: "Telescope Magnification",
        description: "Magnification power of a telescope. The angular magnification provided by a telescope, determined by the ratio of objective to eyepiece focal lengths. Magnification determines how much larger objects appear compared to the naked eye. Essential for understanding telescope performance, selecting appropriate eyepieces, and planning observations. Higher magnification provides larger images but reduces field of view and brightness. Critical for telescope design, observation planning, and understanding the trade-offs between magnification, field of view, and image brightness.",
        equation: "M = f_obj / f_eye",
        variables: [
            {
                symbol: "M",
                name: "Magnification",
                unit: "dimensionless",
                description: "Magnification power"
            },
            {
                symbol: "f_obj",
                name: "Objective Focal Length",
                unit: "meters",
                description: "Focal length of objective lens/mirror"
            },
            {
                symbol: "f_eye",
                name: "Eyepiece Focal Length",
                unit: "meters",
                description: "Focal length of eyepiece"
            }
        ]
    },
    {
        id: "f_ratio",
        name: "f-ratio",
        description: "Focal ratio of a telescope. The f-number or f-ratio, defined as the focal length divided by the aperture diameter. Determines the speed of a telescope (how fast it collects light) and affects image brightness and field of view. Lower f-ratios (faster systems) provide brighter images and wider fields of view, while higher f-ratios (slower systems) provide higher magnification and narrower fields. Essential for understanding telescope characteristics, comparing different telescope designs, and selecting appropriate instruments for specific observations. Critical for astrophotography, where f-ratio affects exposure times and image quality.",
        equation: "f_ratio = f / D",
        variables: [
            {
                symbol: "f_ratio",
                name: "Focal Ratio",
                unit: "dimensionless",
                description: "Focal ratio (f-number)"
            },
            {
                symbol: "f",
                name: "Focal Length",
                unit: "meters",
                description: "Focal length of telescope"
            },
            {
                symbol: "D",
                name: "Diameter",
                unit: "meters",
                description: "Diameter of aperture"
            }
        ]
    },
    {
        id: "angular_resolution",
        name: "Angular Resolution",
        description: "Minimum angular separation resolvable by a telescope",
        equation: "θ = 1.22 × (λ / D)",
        variables: [
            {
                symbol: "θ",
                name: "Angular Resolution",
                unit: "radians",
                description: "Minimum resolvable angle"
            },
            {
                symbol: "λ",
                name: "Wavelength",
                unit: "meters",
                description: "Wavelength of light"
            },
            {
                symbol: "D",
                name: "Diameter",
                unit: "meters",
                description: "Diameter of aperture"
            }
        ],
        constants: {
            factor: 1.22
        }
    },
    {
        id: "kepler_third_law_solar",
        name: "Kepler's Third Law (Solar System)",
        description: "Simplified form for solar system objects (P in years, a in AU)",
        equation: "P² = a³",
        variables: [
            {
                symbol: "P",
                name: "Orbital Period",
                unit: "years",
                description: "Orbital period in years"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "AU",
                description: "Semi-major axis in Astronomical Units"
            }
        ]
    },
    {
        id: "tidal_force",
        name: "Tidal Force",
        description: "Tidal force between two bodies. For Roche limit balance: tidal force (difference between star's pull at planet center vs surface) equals planet's gravity on a parcel. Tidal difference ≈ GMμ/(R−r)² − GMμ/R²; with 1/(R−r)² ≈ (1/R²)(1 + 2r/R) gives GMμ/R²(1+2r/R) − GMμ/R² = Gmμ/r² ⇒ R = r(2M/m)^(1/3).",
        equation: "F_tidal = (2GMmR) / d³",
        variables: [
            {
                symbol: "F_tidal",
                name: "Tidal Force",
                unit: "N",
                description: "Tidal force"
            },
            {
                symbol: "M",
                name: "Primary Mass",
                unit: "kg",
                description: "Mass of primary body"
            },
            {
                symbol: "m",
                name: "Secondary Mass",
                unit: "kg",
                description: "Mass of secondary body"
            },
            {
                symbol: "R",
                name: "Primary Radius",
                unit: "meters",
                description: "Radius of primary body"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "meters",
                description: "Distance between centers"
            }
        ],
        constants: {
            G: 6.67430e-11
        }
    },
    {
        id: "tidal_acceleration_differential",
        name: "Tidal Acceleration (Differential Gravity, Order of Magnitude)",
        description: "Hierarchy: Gravity → Tides → Field gradient across extended bodies.\n\n(1) Physical meaning: a_tidal ~ 2GMd_obj/r³ estimates the difference in gravitational acceleration between two sides of an object of extent d_obj at distance r from mass M.\n\n(2) When to use: Ocean tides (conceptually), tidal locking, disruption / spaghettification estimates, Roche-style reasoning when a force scaling is enough.\n\n(3) Intuition: Tides fall off as 1/r³ (force difference), steeper than Newton’s 1/r² monopole.\n\n(4) Order-of-magnitude tidal estimates. Pairs with tidal_force and roche_limit_rigid.\n\nFinal answer unit picker: m/s² ↔ cm/s².",
        equation: "a_tidal = 2 * G * M * d_obj / r^3",
        concepts: ["tidal force", "differential gravity", "tidal acceleration", "extended object", "binary"],
        keywords: ["tidal acceleration", "2GMd over r cubed", "tidal force size d", "differential gravity approximation", "spaghettification order of magnitude"],
        variables: [
            { symbol: "a_tidal", name: "Tidal Acceleration Scale", unit: "m/s²", description: "Order-of-magnitude tidal (differential) acceleration" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "Newton's constant" },
            { symbol: "M", name: "Perturber Mass", unit: "kg", description: "Mass of the body producing the tide" },
            { symbol: "d_obj", name: "Object Size", unit: "m", description: "Linear extent of the object (e.g. diameter) across the field" },
            { symbol: "r", name: "Separation", unit: "m", description: "Distance from perturber center to the object (center of mass)" }
        ],
        constants: { G: 6.67430e-11 },
        relationships: {
            prerequisites: ["newton_gravitational_force"],
            derivedFrom: [],
            relatedTo: ["tidal_force", "roche_limit", "roche_limit_rigid", "schwarzschild_radius", "tidal_disruption_radius_scaling"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "tidal acceleration approximation",
            "tidal force 2GMd r cubed",
            "differential gravity across object"
        ]
    },
    {
        id: "roche_limit",
        name: "Roche Limit",
        description: "Minimum distance for a rigid body to avoid tidal disruption",
        equation: "d = R × (2 × (ρ_M / ρ_m))^(1/3)",
        variables: [
            {
                symbol: "d",
                name: "Roche Limit",
                unit: "meters",
                description: "Minimum safe distance"
            },
            {
                symbol: "R",
                name: "Primary Radius",
                unit: "meters",
                description: "Radius of primary body"
            },
            {
                symbol: "ρ_M",
                name: "Primary Density",
                unit: "kg/m³",
                description: "Density of primary body"
            },
            {
                symbol: "ρ_m",
                name: "Secondary Density",
                unit: "kg/m³",
                description: "Density of secondary body"
            }
        ],
        constants: {
            factor: 2
        }
    },
    {
        id: "roche_limit_rigid",
        name: "Roche Limit (Rigid Body, in Masses)",
        description: "Minimum distance R from star (mass M) for a rigid planet (mass m, radius r) to avoid tidal disruption. Balance: tidal force = planet gravity on surface. R = r × (2M/m)^(1/3). Use when given M, m, and r.",
        equation: "R = r * (2*M/m)^(1/3)",
        concepts: ["roche limit", "tidal disruption", "rigid body", "tidal force", "planet"],
        keywords: ["roche limit rigid", "minimum R distance", "tidal disruption distance", "planet ripped apart"],
        variables: [
            { symbol: "R", name: "Roche Limit (Distance)", unit: "m", description: "Minimum distance from star center to planet center" },
            { symbol: "r", name: "Planet Radius", unit: "m", description: "Radius of the planet" },
            { symbol: "M", name: "Star Mass", unit: "kg", description: "Mass of the star" },
            { symbol: "m", name: "Planet Mass", unit: "kg", description: "Mass of the planet" }
        ],
        questionPatterns: [
            "minimum R distance tidal",
            "roche limit in terms of M m r",
            "compute minimum R within which matter pulled off",
            "planet get ripped apart distance"
        ]
    },
    {
        id: "periapsis_from_apoapsis",
        name: "Periapsis from Apoapsis and Eccentricity",
        description: "Periapsis distance from apoapsis and eccentricity. r_peri = r_apo × (1−e)/(1+e). Equivalently r_apo = a(1+e), r_peri = a(1−e).",
        equation: "r_peri = r_apo * (1 - ecc) / (1 + ecc)",
        solveFor: {
            r_peri: "r_peri = r_apo * (1 - ecc) / (1 + ecc)",
            r_apo: "r_apo = r_peri * (1 + ecc) / (1 - ecc)",
            ecc: "ecc = (r_apo - r_peri) / (r_apo + r_peri)"
        },
        concepts: ["periapsis", "apoapsis", "eccentricity", "orbit", "elliptical orbit"],
        keywords: ["periapsis from apoapsis", "apoapsis periapsis eccentricity", "r peri r apo"],
        variables: [
            { symbol: "r_peri", name: "Periapsis Distance", unit: "m or AU", description: "Closest distance to focus" },
            { symbol: "r_apo", name: "Apoapsis Distance", unit: "m or AU", description: "Farthest distance from focus" },
            { symbol: "ecc", displaySymbol: "e", name: "Eccentricity", unit: "dimensionless", description: "Orbital eccentricity" }
        ],
        questionPatterns: [
            "periapsis from apoapsis",
            "apoapsis 25 AU eccentricity periapsis",
            "periapsis in AU"
        ]
    },
    {
        id: "perihelion_aphelion",
        name: "Perihelion and Aphelion from a and e",
        description: "Perihelion (closest) and aphelion (farthest) distances from semi-major axis a and eccentricity e. r_peri = a(1−e), r_ap = a(1+e). Use same units for a (e.g. AU or m).",
        equation: "r_peri = a*(1 - ecc)",
        concepts: ["perihelion", "aphelion", "semi-major axis", "eccentricity", "orbit"],
        keywords: ["perihelion aphelion", "rp ra from a e", "closest farthest distance orbit"],
        variables: [
            { symbol: "r_peri", name: "Perihelion Distance", unit: "m or AU", description: "Closest distance to focus" },
            { symbol: "a", name: "Semi-major Axis", unit: "m or AU", description: "Semi-major axis" },
            { symbol: "ecc", displaySymbol: "e", name: "Eccentricity", unit: "dimensionless", description: "Orbital eccentricity" }
        ],
        questionPatterns: [
            "perihelion aphelion distances",
            "calculate perihelion aphelion meters",
            "eccentricity 0.148 semi-major axis 3 AU"
        ]
    },
    {
        id: "aphelion_distance",
        name: "Aphelion Distance",
        description: "Aphelion (farthest) distance: r_ap = a(1+e).",
        equation: "r_ap = a*(1 + ecc)",
        concepts: ["aphelion", "semi-major axis", "eccentricity", "orbit"],
        keywords: ["aphelion distance", "farthest distance orbit"],
        variables: [
            { symbol: "r_ap", name: "Aphelion Distance", unit: "m or AU", description: "Farthest distance" },
            { symbol: "a", name: "Semi-major Axis", unit: "m or AU", description: "Semi-major axis" },
            { symbol: "ecc", displaySymbol: "e", name: "Eccentricity", unit: "dimensionless", description: "Eccentricity" }
        ],
        questionPatterns: [
            "aphelion distance",
            "ra equals a times 1 plus e"
        ]
    },
    {
        id: "roche_lobe_spherical",
        name: "Roche Lobe Radius (Spherical Approximation)",
        description: "Approximate Roche lobe as sphere: r/d = max(f1, f2). f1 = 0.38 + 0.2 log₁₀(m/M), f2 = 0.46224 (m/M/(1+m/M))^(1/3). Use for mass-transfer binaries (e.g. white dwarf + red giant).",
        equation: "r = d * max(0.38 + 0.2*log10(m/M), 0.46224*((m/M)/(1+m/M))^(1/3))",
        concepts: ["roche lobe", "binary", "mass transfer", "Lagrangian", "accretion"],
        keywords: ["roche lobe radius", "roche lobe spherical", "radius of roche lobe", "f1 f2"],
        variables: [
            { symbol: "r", name: "Roche Lobe Radius", unit: "m or AU", description: "Radius of Roche lobe (same units as d)" },
            { symbol: "d", name: "Separation", unit: "m or AU", description: "Separation between the two bodies" },
            { symbol: "m", name: "Mass of Secondary", unit: "kg or M☉", description: "Less massive body (e.g. white dwarf)" },
            { symbol: "M", name: "Mass of Primary", unit: "kg or M☉", description: "More massive body (e.g. red giant)" }
        ],
        questionPatterns: [
            "radius of roche lobe",
            "roche lobe spherical",
            "find roche lobe radius",
            "roche lobe binary"
        ]
    },
    {
        id: "L1_point_approximation",
        name: "L1 Lagrangian Point (M ≫ m)",
        description: "Distance from secondary (mass m) to L1 point, for M ≫ m and d−r ≈ r. r = d ((M−m)/M)^(1/3). Teardrop Roche lobe apex.",
        equation: "r = d * ((M - m)/M)^(1/3)",
        concepts: ["L1", "Lagrangian point", "Roche lobe", "binary", "equilibrium"],
        keywords: ["L1 point", "Lagrangian L1", "apex roche lobe", "L1 distance"],
        variables: [
            { symbol: "r", name: "L1 Distance from Secondary", unit: "m or AU", description: "Distance from mass m to L1" },
            { symbol: "d", name: "Separation", unit: "m or AU", description: "Separation between bodies" },
            { symbol: "M", name: "Primary Mass", unit: "kg or M☉", description: "Larger mass" },
            { symbol: "m", name: "Secondary Mass", unit: "kg or M☉", description: "Smaller mass" }
        ],
        questionPatterns: [
            "L1 Lagrangian point",
            "apex roche lobe",
            "find L1 point",
            "M much greater than m L1"
        ]
    },
    {
        id: "orbital_energy",
        name: "Orbital Energy",
        description: "Bound two-body orbit: total mechanical energy E = −GMm/(2a). Use with K = ½mv² and U = −GMm/r.",
        equation: "E = -GMm / (2a)",
        variables: [
            {
                symbol: "E",
                name: "Orbital Energy",
                unit: "J",
                description: "Total orbital energy"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of central body"
            },
            {
                symbol: "m",
                name: "Orbiting Mass",
                unit: "kg",
                description: "Mass of orbiting body"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of orbit"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        questionPatterns: [
            "what is the total orbital energy",
            "orbital energy of system",
            "energy of orbit",
            "total energy binary system",
            "orbital energy calculation",
            "energy binary system",
            "total orbital energy",
            "calculate orbital energy",
            "find orbital energy",
            "orbital energy"
        ]
    },
    {
        id: "vis_viva",
        name: "Vis Viva Equation",
        description: "Speed at distance r on an ellipse: v² = GM(2/r − 1/a). Central to energy and orbit calculations.",
        equation: "v² = GM × ((2/r) - (1/a))",
        variables: [
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Orbital velocity"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of central body"
            },
            {
                symbol: "r",
                name: "Distance",
                unit: "meters",
                description: "Current distance from central body"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of orbit"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        questionPatterns: [
            "vis viva equation",
            "velocity elliptical orbit",
            "velocity at point in orbit",
            "orbital velocity elliptical",
            "velocity from distance",
            "calculate velocity orbit",
            "find velocity orbit",
            "orbital velocity binary km/s",
            "orbital velocity relative to primary",
            "Sirwarha orbital velocity"
        ]
    },
    {
        id: "velocity_from_orbital_energy",
        name: "Velocity from Orbital Energy Conservation",
        description: "Speed at one point in an orbit from speed and distance at another. From ½mv₁² − GMm/r₁ = ½mv₂² − GMm/r₂: v₂² = v₁² + 2GM(1/r₂ − 1/r₁). Use for comets (e.g. at perihelion vs aphelion).",
        equation: "v2 = sqrt(v1^2 + 2*G*M*(1/r2 - 1/r1))",
        concepts: ["orbital energy", "conservation of energy", "vis viva", "comet", "elliptical orbit"],
        keywords: ["velocity from energy conservation", "comet speed at aphelion", "speed when distance from sun"],
        variables: [
            { symbol: "v2", name: "Velocity at Point 2", unit: "m/s", description: "Speed at distance r2" },
            { symbol: "v1", name: "Velocity at Point 1", unit: "m/s", description: "Speed at distance r1" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Central Mass", unit: "kg", description: "e.g. Sun mass" },
            { symbol: "r2", name: "Distance at Point 2", unit: "m", description: "Distance from central body" },
            { symbol: "r1", name: "Distance at Point 1", unit: "m", description: "Distance from central body" }
        ],
        constants: { G: 6.67430e-11 },
        questionPatterns: [
            "speed when 6e12 m from sun",
            "comet elliptical orbit speed",
            "velocity from energy conservation orbit"
        ]
    },
    {
        id: "center_of_mass",
        name: "Center of Mass (Binary System)",
        description: "Center of mass position in a binary star system. Standard form: M₁r₁ = M₂r₂ (distances from the barycenter). Often used with separation a = r₁ + r₂ (semi-major axis of relative orbit).",
        equation: "M1 * r1 = M2 * r2",
        variables: [
            {
                symbol: "M1",
                name: "Mass 1",
                unit: "kg",
                description: "Mass of first star"
            },
            {
                symbol: "M2",
                name: "Mass 2",
                unit: "kg",
                description: "Mass of second star"
            },
            {
                symbol: "r1",
                name: "Distance 1",
                unit: "meters",
                description: "Distance of star 1 from center of mass"
            },
            {
                symbol: "r2",
                name: "Distance 2",
                unit: "meters",
                description: "Distance of star 2 from center of mass"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Total semi-major axis"
            }
        ],
        questionPatterns: [
            "center of mass binary",
            "center of mass binary system",
            "position center of mass",
            "binary center of mass",
            "center of mass position",
            "find center of mass",
            "calculate center of mass"
        ]
    },
    {
        id: "stellar_lifetime",
        name: "Stellar Lifetime",
        description: "Approximate main sequence lifetime of a star",
        equation: "τ ≈ 10¹⁰ × (M_sun / M)^2.5",
        variables: [
            {
                symbol: "τ",
                name: "Lifetime",
                unit: "years",
                description: "Main sequence lifetime"
            },
            {
                symbol: "M_sun",
                name: "Solar Mass",
                unit: "kg",
                description: "Mass of the Sun"
            },
            {
                symbol: "M",
                name: "Stellar Mass",
                unit: "kg",
                description: "Mass of the star"
            }
        ],
        constants: {
            "M_sun": 1.988409870440e30,
            factor: 1e10,
            exponent: 2.5
        },
        questionPatterns: [
            "stellar lifetime",
            "how long does a star live",
            "main sequence lifetime",
            "star lifetime",
            "how long star lives",
            "stellar age",
            "star age",
            "lifetime of star",
            "calculate stellar lifetime"
        ]
    },
    {
        id: "solar_lifetime_efficiency",
        name: "Solar Lifetime with Fusion Efficiency",
        description: "Calculate stellar lifetime based on mass-to-energy conversion efficiency, hydrogen mass fraction, and available hydrogen. Essential for understanding solar evolution, proton-proton chain efficiency, and stellar energy generation. Accounts for the fact that only a fraction of hydrogen is available for fusion in the stellar core.",
        equation: "t = (ε × f_H × f_available × M × c²) / L",
        concepts: ["solar lifetime", "stellar lifetime", "proton-proton chain", "fusion efficiency", "mass-energy conversion", "hydrogen burning", "stellar evolution", "nuclear fusion", "energy generation", "solar age"],
        keywords: ["solar lifetime", "proton-proton chain", "fusion efficiency", "mass-energy conversion", "hydrogen fraction", "stellar lifetime efficiency", "solar age", "fusion lifetime", "hydrogen burning lifetime"],
        variables: [
            {
                symbol: "t",
                name: "Lifetime",
                unit: "seconds",
                description: "Stellar lifetime based on available fusion fuel. Time until hydrogen fuel is exhausted."
            },
            {
                symbol: "ε",
                name: "Mass-to-Energy Efficiency",
                unit: "dimensionless",
                description: "Efficiency of mass-to-energy conversion in fusion reactions. For proton-proton chain, typically 0.007 (0.7%)."
            },
            {
                symbol: "f_H",
                name: "Hydrogen Mass Fraction",
                unit: "dimensionless",
                description: "Fraction of stellar mass composed of hydrogen. For the Sun, approximately 0.7346 (73.46%)."
            },
            {
                symbol: "f_available",
                name: "Available Hydrogen Fraction",
                unit: "dimensionless",
                description: "Fraction of hydrogen available for fusion. Only hydrogen in the hot core can fuse, typically ~0.1 (10%) for main sequence stars."
            },
            {
                symbol: "M",
                name: "Stellar Mass",
                unit: "kg",
                description: "Total mass of the star. For the Sun, 1.989×10³⁰ kg."
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum, 2.998×10⁸ m/s."
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Stellar luminosity, energy output rate. For the Sun, 3.828×10²⁶ W."
            }
        ],
        constants: {
            c: 2.99792458e8,
            M_sun: 1.988409870440e30,
            L_sun: 3.828e26,
            epsilon_pp_chain: 0.007,
            f_H_sun: 0.7346,
            f_available_sun: 0.1
        },
        relationships: {
            prerequisites: ["nuclear_fusion_mass_defect", "luminosity"],
            derivedFrom: ["nuclear_fusion_mass_defect"],
            relatedTo: ["stellar_lifetime", "nuclear_fusion_mass_defect", "luminosity", "nuclear_energy_generation"],
            uses: [],
            generalizes: [],
            specializes: ["stellar_lifetime"]
        },
        questionPatterns: [
            "solar lifetime",
            "proton-proton chain lifetime",
            "fusion efficiency lifetime",
            "solar age from fusion",
            "hydrogen burning lifetime",
            "stellar lifetime with efficiency",
            "mass-energy conversion lifetime",
            "calculate solar lifetime",
            "sun lifetime",
            "proton proton chain efficiency",
            "estimate lifetime of sun",
            "solar lifetime seconds"
        ]
    },
    {
        id: "mass_luminosity_relation",
        name: "Mass-Luminosity Relation",
        description: "Luminosity as a function of mass for main sequence stars",
        equation: "L ≈ M^3.5",
        variables: [
            {
                symbol: "L",
                name: "Luminosity",
                unit: "L_☉",
                description: "Luminosity in solar units"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "M_☉",
                description: "Mass in solar units"
            }
        ],
        constants: {
            exponent: 3.5
        },
        questionPatterns: [
            "mass luminosity relation",
            "luminosity from mass",
            "mass to luminosity",
            "luminosity mass relation",
            "calculate luminosity from mass",
            "find luminosity from mass",
            "main sequence luminosity",
            "1.6 solar masses luminosity",
            "Sirwarha main sequence luminosity"
        ]
    },
    {
        id: "hr_color_index",
        name: "HR Diagram Color Index",
        description: "Color index from B and V band fluxes",
        equation: "B - V = -2.5 × log₁₀(F_B / F_V) + C",
        variables: [
            {
                symbol: "B_V",
                name: "Color Index",
                unit: "magnitude",
                description: "B minus V color index"
            },
            {
                symbol: "F_B",
                name: "B Band Flux",
                unit: "W/m²",
                description: "Flux in B (blue) band"
            },
            {
                symbol: "F_V",
                name: "V Band Flux",
                unit: "W/m²",
                description: "Flux in V (visual) band"
            },
            {
                symbol: "C",
                name: "Constant",
                unit: "magnitude",
                description: "Calibration constant"
            }
        ],
        constants: {
            factor: -2.5
        }
    },
    {
        id: "hr_absolute_magnitude",
        name: "HR Diagram Absolute Magnitude",
        description: "Absolute visual magnitude from luminosity",
        equation: "M_V = -2.5 × log₁₀(L / L_sun) + 4.83",
        variables: [
            {
                symbol: "M_V",
                name: "Absolute Magnitude",
                unit: "magnitude",
                description: "Absolute visual magnitude"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Stellar luminosity"
            },
            {
                symbol: "L_sun",
                name: "Solar Luminosity",
                unit: "W",
                description: "Solar luminosity"
            }
        ],
        constants: {
            "L_sun": 3.828e26,
            factor: -2.5,
            offset: 4.83
        }
    },
    {
        id: "friedmann_equation",
        name: "Friedmann Equation",
        description: "Relates Hubble parameter to density parameters",
        equation: "(H² / H₀²) = Ω_m × a^(-3) + Ω_r × a^(-4) + Ω_Λ",
        variables: [
            {
                symbol: "H",
                name: "Hubble Parameter",
                unit: "km/(s·Mpc)",
                description: "Hubble parameter"
            },
            {
                symbol: "H0",
                name: "Hubble Constant",
                unit: "km/(s·Mpc)",
                description: "Present-day Hubble constant"
            },
            {
                symbol: "Ω_m",
                name: "Matter Density Parameter",
                unit: "dimensionless",
                description: "Density parameter for matter"
            },
            {
                symbol: "Ω_r",
                name: "Radiation Density Parameter",
                unit: "dimensionless",
                description: "Density parameter for radiation"
            },
            {
                symbol: "Ω_Λ",
                name: "Dark Energy Density Parameter",
                unit: "dimensionless",
                description: "Density parameter for dark energy"
            },
            {
                symbol: "a",
                name: "Scale Factor",
                unit: "dimensionless",
                description: "Cosmic scale factor"
            }
        ]
    },
    {
        id: "critical_density",
        name: "Critical Density",
        description: "Critical density for a flat universe",
        equation: "ρ_c = (3H₀²) / (8πG)",
        variables: [
            {
                symbol: "ρ_c",
                name: "Critical Density",
                unit: "kg/m³",
                description: "Critical density"
            },
            {
                symbol: "H0",
                name: "Hubble Constant",
                unit: "km/(s·Mpc)",
                description: "Hubble constant"
            }
        ],
        constants: {
            G: 6.67430e-11,
            factor: 3,
            pi: Math.PI
        }
    },
    {
        id: "schwarzschild_radius",
        name: "Schwarzschild Radius",
        description: "Non-rotating black hole event horizon: R_s = 2GM/c².",
        equation: "R_s = 2 * G * M / c^2",
        variables: [
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of the black hole"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.998e8,
            factor: 2
        }
    },
    {
        id: "time_dilation",
        name: "Time Dilation",
        description: "Time dilation in special relativity",
        equation: "Δt' = Δt / √(1 - (v² / c²))",
        variables: [
            {
                symbol: "Δt'",
                name: "Dilated Time",
                unit: "seconds",
                description: "Time as measured in moving frame"
            },
            {
                symbol: "Δt",
                name: "Proper Time",
                unit: "seconds",
                description: "Time as measured in rest frame"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Relative velocity"
            }
        ],
        constants: {
            c: 2.998e8
        }
    },
    {
        id: "length_contraction",
        name: "Length Contraction",
        description: "Length contraction in special relativity",
        equation: "L' = L × √(1 - (v² / c²))",
        variables: [
            {
                symbol: "L'",
                name: "Contracted Length",
                unit: "meters",
                description: "Length as measured in moving frame"
            },
            {
                symbol: "L",
                name: "Proper Length",
                unit: "meters",
                description: "Length as measured in rest frame"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Relative velocity"
            }
        ],
        constants: {
            c: 2.998e8
        }
    },
    {
        id: "planetary_equilibrium_temperature",
        name: "Planetary Equilibrium Temperature",
        description: "Equilibrium temperature of a planet",
        equation: "T_eq = T_star × √(R_star / (2a)) × (1 - A)^(1/4)",
        variables: [
            {
                symbol: "T_eq",
                name: "Equilibrium Temperature",
                unit: "Kelvin",
                description: "Planetary equilibrium temperature"
            },
            {
                symbol: "T_star",
                name: "Star Temperature",
                unit: "Kelvin",
                description: "Effective temperature of star"
            },
            {
                symbol: "R_star",
                name: "Star Radius",
                unit: "meters",
                description: "Radius of the star"
            },
            {
                symbol: "a",
                name: "Orbital Distance",
                unit: "meters",
                description: "Distance from star to planet"
            },
            {
                symbol: "A",
                name: "Albedo",
                unit: "dimensionless",
                description: "Planetary albedo (0-1)"
            }
        ],
        constants: {
            factor: 2
        }
    },
    {
        id: "greenhouse_effect",
        name: "Greenhouse Effect",
        description: "Temperature difference due to greenhouse effect",
        equation: "ΔT_GH = T_surface - T_eq",
        variables: [
            {
                symbol: "ΔT_GH",
                name: "Greenhouse Temperature Difference",
                unit: "Kelvin",
                description: "Temperature increase from greenhouse effect"
            },
            {
                symbol: "T_surface",
                name: "Surface Temperature",
                unit: "Kelvin",
                description: "Actual surface temperature"
            },
            {
                symbol: "T_eq",
                name: "Equilibrium Temperature",
                unit: "Kelvin",
                description: "Equilibrium temperature without greenhouse"
            }
        ]
    },
    {
        id: "albedo",
        name: "Albedo",
        description: "Reflectivity of a surface",
        equation: "A = F_reflected / F_incident",
        variables: [
            {
                symbol: "A",
                name: "Albedo",
                unit: "dimensionless",
                description: "Albedo (0-1)"
            },
            {
                symbol: "F_reflected",
                name: "Reflected Flux",
                unit: "W/m²",
                description: "Reflected radiative flux"
            },
            {
                symbol: "F_incident",
                name: "Incident Flux",
                unit: "W/m²",
                description: "Incident radiative flux"
            }
        ]
    },
    {
        id: "blackbody_radiation",
        name: "Blackbody Radiation (Planck's Law)",
        description: "Complete spectral radiance formula for blackbody radiation",
        equation: "B_λ(T) = (2hc² / λ⁵) × (1 / (exp(hc/(λkT)) - 1))",
        primaryUseCase: "full spectrum calculation",
        specificity: 8,
        concepts: ["blackbody radiation", "planck law", "planck distribution", "spectral radiance", "blackbody spectrum", "thermal spectrum"],
        keywords: ["blackbody", "planck", "spectral radiance", "radiance", "spectrum", "thermal radiation"],
        questionPatterns: [
            "blackbody spectrum",
            "spectral radiance",
            "planck distribution",
            "full spectrum from temperature",
            "blackbody radiation formula for spectral radiance"
        ],
        variables: [
            {
                symbol: "B_λ",
                name: "Spectral Radiance",
                unit: "W/(m³·sr)",
                description: "Spectral radiance"
            },
            {
                symbol: "λ",
                name: "Wavelength",
                unit: "meters",
                description: "Wavelength"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Blackbody temperature"
            }
        ],
        constants: {
            h: 6.62607015e-34,
            c: 2.998e8,
            k: 1.381e-23,
            factor: 2
        }
    },
    {
        id: "white_dwarf_orbital_decay",
        name: "White Dwarf Binary Orbital Decay",
        description: "Rate of orbital decay due to gravitational wave emission in a binary white dwarf system",
        equation: "da/dt = -64G³(M₁M₂(M₁+M₂)) / (5c⁵a³)",
        variables: [
            {
                symbol: "da_dt",
                name: "Orbital Decay Rate",
                unit: "m/s",
                description: "Rate of change of semi-major axis (negative = shrinking)"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Current semi-major axis"
            },
            {
                symbol: "M1",
                name: "White Dwarf Mass 1",
                unit: "kg",
                description: "Mass of the first white dwarf"
            },
            {
                symbol: "M2",
                name: "White Dwarf Mass 2",
                unit: "kg",
                description: "Mass of the second white dwarf"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8
        },
        questionPatterns: [
            "what is the rate of orbital decay",
            "orbital decay rate",
            "rate of orbital decay",
            "how fast is orbit shrinking",
            "orbital decay due to gravitational radiation",
            "rate of orbital decay white dwarf",
            "gravitational radiation decay rate",
            "da dt orbital decay",
            "orbital shrinking rate",
            "decay rate binary system"
        ]
    },
    {
        id: "white_dwarf_merger_timescale",
        name: "White Dwarf Merger Timescale",
        description: "Time until two white dwarfs merge due to gravitational wave emission",
        equation: "t_merge = (5c⁵a⁴) / (256G³M₁M₂(M₁+M₂))",
        variables: [
            {
                symbol: "t_merge",
                name: "Merger Timescale",
                unit: "seconds",
                description: "Time until the white dwarfs merge"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Current semi-major axis"
            },
            {
                symbol: "M1",
                name: "White Dwarf Mass 1",
                unit: "kg",
                description: "Mass of the first white dwarf"
            },
            {
                symbol: "M2",
                name: "White Dwarf Mass 2",
                unit: "kg",
                description: "Mass of the second white dwarf"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8
        },
        questionPatterns: [
            "how long will it take to merge",
            "merger timescale",
            "time until merger",
            "how long until white dwarves merge",
            "merger time binary",
            "time until white dwarf merger",
            "when will white dwarves merge",
            "merger timescale binary",
            "coalescence time",
            "gravitational wave merger time",
            "how long will these two white dwarves merge",
            "time to merge white dwarves"
        ]
    },
    {
        id: "hill_radius",
        name: "Hill Radius",
        description: "Sphere of gravitational influence of planet in orbit",
        equation: "R_H = a × (m / (3M))^(1/3)",
        variables: [
            {
                symbol: "R_H",
                name: "Hill Radius",
                unit: "meters",
                description: "Radius of gravitational influence"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Orbital distance"
            },
            {
                symbol: "m",
                name: "Planet Mass",
                unit: "kg",
                description: "Mass of the planet"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of the central body (e.g., star)"
            }
        ],
        constants: {
            factor: 1/3
        }
    },
    {
        id: "synodic_period",
        name: "Synodic Period",
        description: "Time between successive conjunctions of two orbiting bodies",
        equation: "1/P_syn = |1/P₁ - 1/P₂|",
        variables: [
            {
                symbol: "P_syn",
                name: "Synodic Period",
                unit: "seconds",
                description: "Time between successive conjunctions"
            },
            {
                symbol: "P₁",
                name: "Period 1",
                unit: "seconds",
                description: "Orbital period of first body"
            },
            {
                symbol: "P₂",
                name: "Period 2",
                unit: "seconds",
                description: "Orbital period of second body"
            }
        ]
    },
    {
        id: "jeans_mass",
        name: "Jeans Mass",
        description: "Minimum cloud mass for gravitational collapse (approximate)",
        equation: "M_J ≈ ((5kT) / (Gμm_H))^(3/2) / ρ^(1/2)",
        variables: [
            {
                symbol: "M_J",
                name: "Jeans Mass",
                unit: "kg",
                description: "Minimum mass for collapse"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "K",
                description: "Cloud temperature"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Cloud density"
            },
            {
                symbol: "μ",
                name: "Mean Molecular Weight",
                unit: "dimensionless",
                description: "Average molecular weight (typically ~2.3 for molecular clouds)"
            }
        ],
        constants: {
            G: 6.67430e-11,
            k: 1.380649e-23,
            m_H: 1.6735575e-27  // Proton mass (approximate for hydrogen atom)
        },
        concepts: ["Jeans mass", "gravitational collapse", "molecular cloud", "minimum mass", "temperature", "density"],
        keywords: ["Jeans mass", "minimum mass collapse", "cloud temperature density", "M_J T rho"],
        questionPatterns: [
            "Jeans mass temperature density",
            "minimum mass for cloud to collapse",
            "how does Jeans mass depend on T and rho",
            "M_J T^(3/2) rho^(-1/2)"
        ]
    },
    {
        id: "luminosity_function",
        name: "Luminosity Function (Simplified)",
        description: "Approximate distribution of stellar luminosities (Salpeter IMF)",
        equation: "N(L) ∝ L^(-1.35)",
        variables: [
            {
                symbol: "N",
                name: "Number of Stars",
                unit: "dimensionless",
                description: "Number of stars with luminosity L"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Stellar luminosity"
            }
        ],
        constants: {
            exponent: -1.35
        }
    },
    {
        id: "planck_relation",
        name: "Planck Relation (Photon Energy)",
        description: "Photon energy",
        equation: "E = hf = hc / λ",
        variables: [
            {
                symbol: "E",
                name: "Photon Energy",
                unit: "J",
                description: "Energy of a photon"
            },
            {
                symbol: "f",
                name: "Frequency",
                unit: "Hz",
                description: "Frequency of the photon"
            },
            {
                symbol: "λ",
                name: "Wavelength",
                unit: "meters",
                description: "Wavelength of the photon"
            }
        ],
        constants: {
            h: 6.62607015e-34,
            c: 2.99792458e8
        }
    },
    {
        id: "equivalent_width",
        name: "Equivalent Width",
        description: "Measures spectral line strength (can be used approximately as sum of absorption)",
        equation: "W_λ ≈ ∫ ((F_c - F_λ) / F_c) dλ",
        variables: [
            {
                symbol: "W_λ",
                name: "Equivalent Width",
                unit: "meters",
                description: "Width of equivalent rectangular absorption"
            },
            {
                symbol: "F_c",
                name: "Continuum Flux",
                unit: "W/m²",
                description: "Flux of the continuum"
            },
            {
                symbol: "F_λ",
                name: "Line Flux",
                unit: "W/m²",
                description: "Flux in the spectral line"
            }
        ]
    },
    {
        id: "einstein_radius",
        name: "Einstein Radius (Microlensing)",
        description: "Angular scale of lensing",
        equation: "θ_E = √((4GM D_LS) / (c² D_L D_S))",
        variables: [
            {
                symbol: "θ_E",
                name: "Einstein Radius",
                unit: "radians",
                description: "Angular Einstein radius"
            },
            {
                symbol: "M",
                name: "Lens Mass",
                unit: "kg",
                description: "Mass of the lensing object"
            },
            {
                symbol: "D_LS",
                name: "Lens-Source Distance",
                unit: "meters",
                description: "Distance from lens to source"
            },
            {
                symbol: "D_L",
                name: "Lens Distance",
                unit: "meters",
                description: "Distance to the lens"
            },
            {
                symbol: "D_S",
                name: "Source Distance",
                unit: "meters",
                description: "Distance to the source"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8
        }
    },
    {
        id: "tidal_locking_timescale",
        name: "Tidal Locking Timescale",
        description: "Approximate rotational synchronization (rough estimate)",
        equation: "t_lock ∝ (ωa⁶IQ) / (3Gm_p²R⁵)",
        variables: [
            {
                symbol: "t_lock",
                name: "Tidal Locking Timescale",
                unit: "seconds",
                description: "Time to achieve tidal locking"
            },
            {
                symbol: "ω",
                name: "Angular Velocity",
                unit: "rad/s",
                description: "Initial angular velocity"
            },
            {
                symbol: "a",
                name: "Orbital Distance",
                unit: "meters",
                description: "Semi-major axis"
            },
            {
                symbol: "I",
                name: "Moment of Inertia",
                unit: "kg·m²",
                description: "Moment of inertia of the body"
            },
            {
                symbol: "Q",
                name: "Tidal Quality Factor",
                unit: "dimensionless",
                description: "Tidal dissipation factor"
            },
            {
                symbol: "m_p",
                name: "Planet Mass",
                unit: "kg",
                description: "Mass of the planet"
            },
            {
                symbol: "R",
                name: "Planet Radius",
                unit: "meters",
                description: "Radius of the planet"
            }
        ],
        constants: {
            G: 6.67430e-11,
            factor: 1/3
        }
    },
    {
        id: "angular_momentum_circular",
        name: "Angular Momentum (Circular Orbit)",
        description: "Hierarchy: Mechanics → Orbital dynamics → Conserved quantities.\n\n(1) Physical meaning: L = m v r is the rotational momentum of a point mass in circular motion about a focus. It measures how strongly the orbit resists collapsing inward when no external torque acts.\n\n(2) When to use: Planetary/satellite circular orbits, face-on binary components, accretion-disk order-of-magnitude reasoning, comet speed changes (pair with elliptical L for full story).\n\n(3) Intuition: If r increases and L is fixed, v must decrease — same physics as fast motion near perihelion and slow near aphelion (see apsidal_momentum_conservation).\n\n(4) Comparing speeds at different radii, maneuver/accretion reasoning (elliptical form: angular_momentum_elliptical).\n\nUnit note: L is stored as J·s (equivalent to kg·m²/s); use the result unit picker for erg·s if needed.",
        equation: "L = m * v * r",
        solveFor: {
            L: "L = m * v * r",
            m: "m = L / (v * r)",
            v: "v = L / (m * r)",
            r: "r = L / (m * v)"
        },
        concepts: ["angular momentum", "circular orbit", "orbital mechanics", "conservation"],
        keywords: ["L equals mvr", "angular momentum circular", "m v r orbit", "conserved angular momentum circular orbit"],
        variables: [
            { symbol: "L", name: "Angular Momentum", unit: "J·s", description: "Magnitude L = mvr; same dimensions as kg·m²/s (joule-second)" },
            { symbol: "m", name: "Mass", unit: "kg", description: "Mass of the orbiting body (or reduced mass μ for two-body)" },
            { symbol: "v", name: "Orbital Speed", unit: "m/s", description: "Tangential speed" },
            { symbol: "r", name: "Orbital Radius", unit: "m", description: "Distance from focus (circular orbit radius)" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["angular_momentum_elliptical", "apsidal_momentum_conservation", "orbital_velocity", "kepler_second_law_area_rate"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["angular momentum circular orbit", "L equals m v r", "find L from m v r"]
    },
    {
        id: "apsidal_momentum_conservation",
        name: "Periapsis / Apoapsis (r v Product)",
        description: "Hierarchy: Mechanics → Central-force orbits → Angular momentum conservation at apses.\n\n(1) Physical meaning: At periapsis and apoapsis the position vector is perpendicular to velocity, so L = m r v at each apex. Conservation gives r_peri v_peri = r_apo v_apo (same orbiting mass).\n\n(2) When to use: Elliptical orbits, comets, spacecraft gravity assists, when two of (r_peri, v_peri, r_apo, v_apo) are known.\n\n(3) Intuition: Small r → large v; connects directly to Kepler’s second law (equal areas in equal times).\n\n(4) Velocity at aphelion/perihelion, speed ratios. Chains well with vis_viva and perihelion_aphelion.",
        equation: "r_peri * v_peri = r_apo * v_apo",
        solveFor: {
            v_peri: "v_peri = r_apo * v_apo / r_peri",
            v_apo: "v_apo = r_peri * v_peri / r_apo",
            r_peri: "r_peri = r_apo * v_apo / v_peri",
            r_apo: "r_apo = r_peri * v_peri / v_apo"
        },
        concepts: ["angular momentum", "periapsis", "apoapsis", "ellipse", "conservation"],
        keywords: ["rp vp ra va", "periapsis apoapsis velocity", "r v product orbit", "kepler second law angular momentum"],
        variables: [
            { symbol: "r_peri", name: "Periapsis Distance", unit: "m", description: "Radius at closest approach" },
            { symbol: "v_peri", name: "Speed at Periapsis", unit: "m/s", description: "Instantaneous speed at periapsis" },
            { symbol: "r_apo", name: "Apoapsis Distance", unit: "m", description: "Radius at farthest point" },
            { symbol: "v_apo", name: "Speed at Apoapsis", unit: "m/s", description: "Instantaneous speed at apoapsis" }
        ],
        relationships: {
            prerequisites: ["angular_momentum_circular"],
            derivedFrom: ["angular_momentum_circular"],
            relatedTo: ["vis_viva", "perihelion_aphelion", "angular_momentum_elliptical", "kepler_second_law_area_rate"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["periapsis apoapsis velocity", "rp vp equals ra va", "speed at aphelion perihelion"]
    },
    {
        id: "orbital_speed_circular",
        name: "Orbital Speed from Period (Circular)",
        description: "Hierarchy: Kinematics → Uniform circular motion → Orbit circumference.\n\n(1) Physical meaning: v = 2πr / T is tangential speed from path length divided by period (no dynamics — pure geometry).\n\n(2) When to use: Planets, satellites, circular binary components, pulsars when treated as circular motion at radius r.\n\n(3) Intuition: Shorter T at fixed r means higher v.\n\n(4) v from P and r; compare speeds. Combine with angular_velocity_orbit (ω = 2π/T) via v = ω r, and with orbital_velocity when gravity sets v.",
        equation: "v = 2 * pi * r / T",
        solveFor: {
            v: "v = 2 * pi * r / T",
            r: "r = v * T / (2 * pi)",
            T: "T = 2 * pi * r / v"
        },
        concepts: ["orbital speed", "binary", "circular orbit", "period"],
        keywords: ["v equals 2 pi r over T", "orbital speed from period", "binary orbital velocity", "circumference over period orbit"],
        variables: [
            { symbol: "v", name: "Orbital Speed", unit: "m/s", description: "Tangential speed" },
            { symbol: "r", name: "Orbit Radius", unit: "m", description: "Radius of circular path" },
            { symbol: "T", name: "Orbital Period", unit: "s", description: "Time for one full orbit" }
        ],
        constants: { pi: Math.PI },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["angular_velocity_orbit", "orbital_velocity", "kepler_third_law", "kepler_third_law_binary", "period_circular"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["orbital velocity 2 pi r over T", "speed from period radius", "binary star speed"]
    },
    {
        id: "angular_velocity_orbit",
        name: "Angular Velocity (Mean Motion)",
        description: "Hierarchy: Rotational kinematics → Mean motion n or ω.\n\n(1) Physical meaning: ω = 2π/T is how fast the position angle advances (rad/s) for uniform circular motion.\n\n(2) When to use: Pulsar spin, planetary rotation period, galaxy/pattern speeds when modeled as rigid rotation.\n\n(3) Intuition: Link linear and angular motion with v = ω r (use orbital_speed_circular for v from r and T).\n\n(4) Period ↔ ω. Result unit picker: rad/s ↔ deg/s.\n\nNote: rotational_velocity uses equator v = 2πR/P_rot for a spinning body — same geometry, different symbol set.",
        equation: "omega = 2 * pi / T",
        solveFor: {
            omega: "omega = 2 * pi / T",
            T: "T = 2 * pi / omega"
        },
        concepts: ["angular velocity", "mean motion", "period", "rotation"],
        keywords: ["omega equals 2 pi over T", "angular frequency orbit", "mean motion", "pulsar rotation omega"],
        variables: [
            { symbol: "omega", name: "Angular Velocity", unit: "rad/s", description: "Radians per second (use unit picker for deg/s)" },
            { symbol: "T", name: "Period", unit: "s", description: "Time for one revolution" }
        ],
        constants: { pi: Math.PI },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["orbital_speed_circular", "rotational_velocity", "kepler_third_law"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["angular velocity from period", "omega 2 pi T", "mean motion"]
    },
    {
        id: "angular_momentum_elliptical",
        name: "Angular Momentum (Elliptical)",
        description: "Hierarchy: Same as angular_momentum_circular, specialized to bound ellipses.\n\nL = μ√(GMa(1−e²)) with reduced mass μ (m_r here). Use with apsidal_momentum_conservation and vis_viva. L reported in J·s (≡ kg·m²/s).",
        equation: "L = m_r × √(GMa(1 - ecc²))",
        variables: [
            {
                symbol: "L",
                name: "Angular Momentum",
                unit: "J·s",
                description: "Angular momentum; joule-second ≡ kg·m²/s"
            },
            {
                symbol: "m_r",
                name: "Reduced Mass",
                unit: "kg",
                description: "Reduced mass of the system"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of the central body"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of the ellipse"
            },
            {
                symbol: "ecc",
                displaySymbol: "e",
                name: "Eccentricity",
                unit: "dimensionless",
                description: "Orbital eccentricity (0 = circle, <1 = ellipse)"
            }
        ],
        constants: {
            G: 6.67430e-11
        }
    },
    {
        id: "kepler_second_law_area_rate",
        name: "Kepler's Second Law (Area Rate)",
        description: "Equal area swept per unit time. C = dA/dt = (1/2) r v_θ constant; v_θ = r dθ/dt. Leads to conservation of angular momentum L = μ r v_θ.",
        equation: "C = (1/2) * r * v_theta",
        concepts: ["kepler second law", "equal area", "area rate", "angular momentum", "orbit"],
        keywords: ["kepler second law", "sweep equal area", "area per unit time", "C r v theta"],
        variables: [
            { symbol: "C", name: "Area Rate Constant", unit: "m²/s", description: "dA/dt, constant along orbit" },
            { symbol: "r", name: "Orbital Radius", unit: "m", description: "Distance from focus" },
            { symbol: "v_theta", name: "Tangential Velocity", unit: "m/s", description: "r dθ/dt" }
        ],
        questionPatterns: [
            "kepler second law",
            "equal area per unit time",
            "show C equals half r v theta",
            "area rate constant orbit"
        ]
    },
    {
        id: "eccentricity_from_area_rate",
        name: "Eccentricity from Area Rate (Kepler II)",
        description: "Eccentricity e in terms of area rate C, central mass M, and semi-major axis a. From C = L/(2μ) and L = μ √(GM a (1−e²)).",
        equation: "ecc = sqrt(1 - 4*C^2/(G*M*a))",
        concepts: ["eccentricity", "kepler second law", "area rate", "orbital mechanics"],
        keywords: ["e in terms of C M a", "eccentricity from C", "find e area rate"],
        variables: [
            { symbol: "ecc", displaySymbol: "e", name: "Eccentricity", unit: "dimensionless", description: "Orbital eccentricity" },
            { symbol: "C", name: "Area Rate", unit: "m²/s", description: "dA/dt" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Central Mass", unit: "kg", description: "Mass of central body" },
            { symbol: "a", name: "Semi-major Axis", unit: "m", description: "Semi-major axis" }
        ],
        constants: { G: 6.67430e-11 },
        questionPatterns: [
            "find e in terms of M a and C",
            "eccentricity from area rate",
            "e from C Kepler"
        ]
    },
    {
        id: "lookback_time",
        name: "Lookback Time (Approximate)",
        description: "Time since light was emitted",
        equation: "t ≈ d / c",
        variables: [
            {
                symbol: "t",
                name: "Lookback Time",
                unit: "seconds",
                description: "Time since light was emitted"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "meters",
                description: "Distance to the source"
            }
        ],
        constants: {
            c: 2.99792458e8
        }
    },
    {
        id: "light_travel_time",
        name: "Light Travel Time",
        description: "Hierarchy: Special relativity / observation → Light propagation in vacuum.\n\n(1) Physical meaning: t = d/c is the delay for light to traverse path length d; underpins radar/ranging and “how long ago” we see an event.\n\n(2) When to use: Pulsar timing, binary light-travel delays, solar system light-time (e.g. ~8.3 min Sun–Earth), order-of-magnitude delays in compact binaries.\n\n(3) Intuition: Larger d always means later arrival; c is the conversion between distance and time in vacuum.\n\n(4) Pairs with doppler_wavelength_ratio and lookback_time (cosmological wording).\n\nUnit picker: time in s ↔ min ↔ h ↔ day ↔ yr; distance in m ↔ AU ↔ ly when solving for d.",
        equation: "t = d / c",
        solveFor: {
            t: "t = d / c",
            d: "d = c * t",
            c: "c = d / t"
        },
        concepts: ["speed of light", "light travel", "time delay", "binary"],
        keywords: ["light travel time", "d over c", "time for light cross distance", "light time delay binary", "sun to earth light minutes"],
        variables: [
            { symbol: "t", name: "Time", unit: "s", description: "Light-crossing time" },
            { symbol: "d", name: "Distance", unit: "m", description: "Path length in vacuum" },
            { symbol: "c", name: "Speed of Light", unit: "m/s", description: "c in vacuum" }
        ],
        constants: { c: 2.99792458e8 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["lookback_time", "doppler_wavelength_ratio", "doppler_velocity_wavelength", "parallax_distance_arcsec"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["light travel time", "how long light takes", "d over c time"]
    },
    {
        id: "density_parameter",
        name: "Density Parameter",
        description: "Ratio of actual density to critical",
        equation: "Ω = ρ / ρ_c",
        variables: [
            {
                symbol: "Ω",
                name: "Density Parameter",
                unit: "dimensionless",
                description: "Ratio of actual to critical density"
            },
            {
                symbol: "ρ",
                name: "Actual Density",
                unit: "kg/m³",
                description: "Actual mass density of the universe"
            },
            {
                symbol: "ρ_c",
                name: "Critical Density",
                unit: "kg/m³",
                description: "Critical density for flat universe"
            }
        ]
    },
    {
        id: "angular_diameter_distance",
        name: "Angular Diameter Distance",
        description: "Relates physical size to observed angular size",
        equation: "D_A = D / θ",
        variables: [
            {
                symbol: "D_A",
                name: "Angular Diameter Distance",
                unit: "meters",
                description: "Distance based on angular size"
            },
            {
                symbol: "D",
                name: "Physical Size",
                unit: "meters",
                description: "Physical diameter of the object"
            },
            {
                symbol: "θ",
                name: "Angular Size",
                unit: "radians",
                description: "Observed angular diameter"
            }
        ]
    },
    {
        id: "luminosity_distance",
        name: "Luminosity Distance",
        description: "Distance from observed flux and known luminosity",
        equation: "D_L = √(L / (4πF))",
        concepts: ["luminosity distance", "distance from luminosity and flux", "inverse square law", "observed flux", "intrinsic luminosity"],
        keywords: ["luminosity distance", "observed flux", "known luminosity", "distance from flux", "distance from luminosity"],
        variables: [
            {
                symbol: "D_L",
                name: "Luminosity Distance",
                unit: "meters",
                description: "Distance based on luminosity and flux"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Intrinsic luminosity of the source"
            },
            {
                symbol: "F",
                name: "Observed Flux",
                unit: "W/m²",
                description: "Flux observed on Earth"
            }
        ],
        constants: {
            π: Math.PI
        },
        questionPatterns: [
            "luminosity distance",
            "distance from luminosity and observed flux",
            "known luminosity observed flux distance",
            "inverse square law distance"
        ]
    },
    // ============================================================
    // COSMOLOGY & RELATIVISTIC GRAVITY FORMULAS (1-15)
    // ============================================================
    {
        id: "matter_density_parameter",
        name: "Matter Density Parameter",
        description: "Ratio of matter density to critical density. Fundamental cosmological parameter describing the contribution of matter (baryonic and dark matter) to the total energy density of the universe. Essential for understanding cosmic structure formation, galaxy evolution, and the fate of the universe. Related to density parameter, critical density, and Friedmann equations.",
        equation: "Ω_M = ρ_M / ρ_c",
        concepts: ["matter density parameter", "cosmology", "critical density", "dark matter", "baryonic matter", "cosmic structure", "friedmann equation", "universe evolution", "density parameter"],
        keywords: ["matter", "density", "parameter", "cosmology", "dark matter", "baryonic", "critical density", "universe", "cosmic", "structure"],
        variables: [
            {
                symbol: "Ω_M",
                name: "Matter Density Parameter",
                unit: "dimensionless",
                description: "Ratio of matter density to critical density, matter contribution to universe"
            },
            {
                symbol: "ρ_M",
                name: "Matter Density",
                unit: "kg/m³",
                description: "Total matter density including baryonic and dark matter"
            },
            {
                symbol: "ρ_c",
                name: "Critical Density",
                unit: "kg/m³",
                description: "Critical density for flat universe, determines universe geometry"
            }
        ],
        relationships: {
            prerequisites: ["density_parameter"],
            derivedFrom: ["density_parameter"],
            relatedTo: ["density_parameter", "vacuum_energy_density_parameter", "curvature_density_parameter", "friedmann_equation"],
            uses: [],
            generalizes: [],
            specializes: ["density_parameter"]
        },
        questionPatterns: [
            "what is matter density parameter",
            "calculate matter density parameter",
            "matter contribution to universe",
            "matter density ratio"
        ]
    },
    {
        id: "vacuum_energy_density_parameter",
        name: "Vacuum Energy (Dark Energy) Density Parameter",
        description: "Ratio of vacuum energy density (dark energy) to critical density. Fundamental cosmological parameter describing dark energy contribution to cosmic expansion. Essential for understanding accelerated expansion, cosmic fate, and dark energy equation of state. Related to cosmological constant, dark energy, and Friedmann equations.",
        equation: "Ω_Λ = ρ_Λ / ρ_c",
        concepts: ["vacuum energy", "dark energy", "cosmological constant", "cosmic acceleration", "density parameter", "critical density", "friedmann equation", "universe expansion", "cosmology"],
        keywords: ["dark energy", "vacuum energy", "cosmological constant", "density parameter", "acceleration", "expansion", "cosmology", "universe"],
        variables: [
            {
                symbol: "Ω_Λ",
                name: "Dark Energy Density Parameter",
                unit: "dimensionless",
                description: "Ratio of dark energy density to critical density, vacuum energy contribution"
            },
            {
                symbol: "ρ_Λ",
                name: "Vacuum Energy Density",
                unit: "kg/m³",
                description: "Energy density of vacuum, dark energy density, cosmological constant contribution"
            },
            {
                symbol: "ρ_c",
                name: "Critical Density",
                unit: "kg/m³",
                description: "Critical density for flat universe"
            }
        ],
        relationships: {
            prerequisites: ["density_parameter"],
            derivedFrom: ["density_parameter"],
            relatedTo: ["density_parameter", "matter_density_parameter", "curvature_density_parameter", "friedmann_equation", "hubble_law"],
            uses: [],
            generalizes: [],
            specializes: ["density_parameter"]
        },
        questionPatterns: [
            "what is dark energy density parameter",
            "calculate vacuum energy parameter",
            "dark energy contribution",
            "cosmological constant density"
        ]
    },
    {
        id: "curvature_density_parameter",
        name: "Curvature Density Parameter",
        description: "Curvature contribution to total density parameter. Determines universe geometry (flat, open, closed). Fundamental cosmological parameter connecting matter, dark energy, and spatial curvature. Essential for understanding universe geometry, cosmic topology, and Friedmann equations. Related to density parameters and critical density.",
        equation: "Ω_k = 1 - Ω_M - Ω_Λ",
        concepts: ["curvature", "universe geometry", "spatial curvature", "flat universe", "open universe", "closed universe", "density parameter", "cosmology", "friedmann equation"],
        keywords: ["curvature", "geometry", "flat", "open", "closed", "universe", "density parameter", "cosmology", "spatial"],
        variables: [
            {
                symbol: "Ω_k",
                name: "Curvature Density Parameter",
                unit: "dimensionless",
                description: "Curvature contribution, determines universe geometry (0=flat, >0=open, <0=closed)"
            },
            {
                symbol: "Ω_M",
                name: "Matter Density Parameter",
                unit: "dimensionless",
                description: "Matter contribution to total density"
            },
            {
                symbol: "Ω_Λ",
                name: "Dark Energy Density Parameter",
                unit: "dimensionless",
                description: "Dark energy contribution to total density"
            }
        ],
        relationships: {
            prerequisites: ["density_parameter", "matter_density_parameter", "vacuum_energy_density_parameter"],
            derivedFrom: ["density_parameter"],
            relatedTo: ["density_parameter", "matter_density_parameter", "vacuum_energy_density_parameter", "friedmann_equation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "what is curvature parameter",
            "calculate universe curvature",
            "is universe flat or curved",
            "curvature density parameter"
        ]
    },
    {
        id: "scale_factor_redshift",
        name: "Scale Factor a(t) Relation to Redshift z",
        description: "Relates cosmic scale factor to redshift. Fundamental cosmological relationship connecting expansion history, cosmic time, and observed redshift. Essential for understanding cosmic evolution, lookback time, and distance measurements. Scale factor describes universe size relative to present, redshift measures expansion since emission.",
        equation: "a = 1 / (1 + z)",
        concepts: ["scale factor", "redshift", "cosmic expansion", "cosmology", "lookback time", "cosmic time", "universe evolution", "cosmic distance"],
        keywords: ["scale factor", "redshift", "expansion", "cosmology", "universe", "cosmic", "time", "evolution"],
        variables: [
            {
                symbol: "a",
                name: "Scale Factor",
                unit: "dimensionless",
                description: "Cosmic scale factor, universe size relative to present (a=1 today, a<1 in past)"
            },
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Cosmological redshift, measures expansion since light emission"
            }
        ],
        relationships: {
            prerequisites: ["redshift_definition"],
            derivedFrom: ["redshift_definition"],
            relatedTo: ["redshift_definition", "hubble_law", "lookback_time", "luminosity_distance"],
            uses: ["lookback_time", "luminosity_distance"],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "what is scale factor from redshift",
            "calculate scale factor",
            "universe size from redshift",
            "scale factor relation"
        ]
    },
    {
        id: "redshift_peculiar_velocity",
        name: "Redshift from Peculiar Velocity (Non-Relativistic)",
        description: "Doppler redshift from peculiar motion (non-relativistic approximation). Describes redshift due to local motion rather than cosmic expansion. Essential for distinguishing cosmological redshift from Doppler effects, galaxy dynamics, and velocity measurements. Applies when velocities are much less than speed of light.",
        equation: "z = v_pec / c",
        concepts: ["redshift", "peculiar velocity", "doppler shift", "galaxy motion", "local motion", "non-relativistic", "velocity"],
        keywords: ["redshift", "peculiar velocity", "doppler", "motion", "velocity", "galaxy", "non-relativistic"],
        variables: [
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Doppler redshift from peculiar motion"
            },
            {
                symbol: "v_pec",
                name: "Peculiar Velocity",
                unit: "m/s",
                description: "Velocity relative to Hubble flow, local motion, peculiar motion"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["doppler_shift"],
            derivedFrom: ["doppler_shift"],
            relatedTo: ["doppler_shift", "redshift_definition", "hubble_law"],
            uses: [],
            generalizes: [],
            specializes: ["doppler_shift"]
        },
        questionPatterns: [
            "redshift from peculiar velocity",
            "doppler redshift calculation",
            "peculiar motion redshift",
            "local velocity redshift"
        ]
    },
    {
        id: "comoving_distance",
        name: "Comoving Distance χ (General)",
        description: "Comoving distance in cosmology, distance that remains constant with cosmic expansion. Fundamental cosmological distance measure that accounts for universe expansion. Essential for understanding cosmic geometry, large-scale structure, and distance measurements. Related to proper distance, luminosity distance, and angular diameter distance.",
        equation: "χ = D_M / a",
        concepts: ["comoving distance", "cosmology", "cosmic distance", "proper distance", "expansion", "universe geometry", "distance measure"],
        keywords: ["comoving", "distance", "cosmology", "cosmic", "expansion", "geometry", "universe"],
        variables: [
            {
                symbol: "χ",
                name: "Comoving Distance",
                unit: "meters",
                description: "Comoving distance, distance that doesn't change with expansion"
            },
            {
                symbol: "D_M",
                name: "Proper Distance",
                unit: "meters",
                description: "Proper distance at time of measurement, physical distance"
            },
            {
                symbol: "a",
                name: "Scale Factor",
                unit: "dimensionless",
                description: "Cosmic scale factor at time of measurement"
            }
        ],
        relationships: {
            prerequisites: ["scale_factor_redshift"],
            derivedFrom: [],
            relatedTo: ["proper_distance_current", "luminosity_distance", "angular_diameter_distance", "scale_factor_redshift"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "what is comoving distance",
            "calculate comoving distance",
            "comoving distance from proper distance",
            "cosmic distance measure"
        ]
    },
    {
        id: "proper_distance_current",
        name: "Proper Distance (Current Time)",
        description: "Proper distance at current cosmic time, equal to comoving distance today. Physical distance between objects at present epoch. Fundamental cosmological distance measure. Essential for understanding cosmic structure, galaxy distributions, and distance measurements. At current time, proper distance equals comoving distance.",
        equation: "D_p(t_0) = χ",
        concepts: ["proper distance", "comoving distance", "cosmology", "cosmic distance", "current time", "present epoch", "distance measure"],
        keywords: ["proper distance", "comoving", "cosmology", "distance", "current time", "present"],
        variables: [
            {
                symbol: "D_p(t_0)",
                name: "Proper Distance (Current Time)",
                unit: "meters",
                description: "Proper distance at present epoch, physical distance today"
            },
            {
                symbol: "χ",
                name: "Comoving Distance",
                unit: "meters",
                description: "Comoving distance, equals proper distance at current time"
            }
        ],
        relationships: {
            prerequisites: ["comoving_distance"],
            derivedFrom: ["comoving_distance"],
            relatedTo: ["comoving_distance", "luminosity_distance", "angular_diameter_distance"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "proper distance at current time",
            "distance today",
            "present distance",
            "current proper distance"
        ]
    },
    {
        id: "distance_modulus_high_redshift",
        name: "Distance Modulus at High Redshift (Approximate)",
        description: "Distance modulus formula for high-redshift objects. Relates distance to magnitude difference, accounting for cosmological effects. Essential for extragalactic distance measurements, standard candles, and cosmic distance ladder. Approximate form valid for high-redshift sources where cosmological corrections become important.",
        equation: "μ = 5 log₁₀ (D_L / 10 pc)",
        concepts: ["distance modulus", "luminosity distance", "magnitude", "high redshift", "extragalactic", "standard candle", "cosmic distance ladder"],
        keywords: ["distance modulus", "luminosity distance", "magnitude", "redshift", "extragalactic", "standard candle"],
        variables: [
            {
                symbol: "μ",
                name: "Distance Modulus",
                unit: "magnitude",
                description: "Distance modulus, difference between apparent and absolute magnitude"
            },
            {
                symbol: "D_L",
                name: "Luminosity Distance",
                unit: "parsecs",
                description: "Luminosity distance, accounts for cosmological effects"
            }
        ],
        relationships: {
            prerequisites: ["distance_modulus", "luminosity_distance"],
            derivedFrom: ["distance_modulus"],
            relatedTo: ["distance_modulus", "luminosity_distance", "magnitude_flux_relation"],
            uses: [],
            generalizes: [],
            specializes: ["distance_modulus"]
        },
        questionPatterns: [
            "distance modulus high redshift",
            "extragalactic distance modulus",
            "cosmological distance modulus",
            "high z distance modulus"
        ]
    },
    {
        id: "gravitational_redshift",
        name: "Gravitational Redshift (General)",
        description: "Redshift due to gravitational field near massive objects. Fundamental relativistic effect where light loses energy climbing out of gravitational potential well. Essential for black hole physics, compact objects, and tests of general relativity. Describes wavelength shift for light escaping strong gravitational fields.",
        equation: "λ_obs / λ_emit = (1 - R_s / r)^(-1/2)",
        concepts: ["gravitational redshift", "general relativity", "black hole", "compact object", "schwarzschild radius", "redshift", "gravitational field"],
        keywords: ["gravitational redshift", "redshift", "black hole", "general relativity", "schwarzschild", "compact object", "gravity"],
        variables: [
            {
                symbol: "λ_obs",
                name: "Observed Wavelength",
                unit: "meters",
                description: "Wavelength observed at infinity, redshifted wavelength"
            },
            {
                symbol: "λ_emit",
                name: "Emitted Wavelength",
                unit: "meters",
                description: "Wavelength emitted near massive object, rest frame wavelength"
            },
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius, Schwarzschild radius, 2GM/c²"
            },
            {
                symbol: "r",
                name: "Radial Distance",
                unit: "meters",
                description: "Distance from center of massive object, emission radius"
            }
        ],
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: [],
            relatedTo: ["schwarzschild_radius", "time_dilation_gravitational", "redshift_definition"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "gravitational redshift",
            "redshift from black hole",
            "gravitational wavelength shift",
            "redshift near massive object"
        ]
    },
    {
        id: "accretion_efficiency",
        name: "Accretion Efficiency (Radiative Efficiency)",
        description: "Efficiency of converting rest mass energy to radiation in accretion processes. Fundamental parameter for accretion physics, black hole growth, and high-energy astrophysics. Describes how efficiently accreting matter converts gravitational potential energy to radiation. Essential for understanding quasar luminosity, AGN physics, and accretion disk models.",
        equation: "ε = E_rad / (M c²)",
        concepts: ["accretion", "efficiency", "radiative efficiency", "black hole", "accretion disk", "quasar", "AGN", "energy conversion", "rest mass energy"],
        keywords: ["accretion", "efficiency", "radiative", "black hole", "quasar", "AGN", "energy", "conversion"],
        variables: [
            {
                symbol: "ε",
                name: "Accretion Efficiency",
                unit: "dimensionless",
                description: "Radiative efficiency, fraction of rest mass converted to radiation"
            },
            {
                symbol: "E_rad",
                name: "Radiated Energy",
                unit: "J",
                description: "Total energy radiated during accretion"
            },
            {
                symbol: "M",
                name: "Accreted Mass",
                unit: "kg",
                description: "Mass that has been accreted"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["eddington_luminosity", "schwarzschild_radius"],
            uses: ["eddington_luminosity"],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "accretion efficiency",
            "radiative efficiency",
            "accretion energy conversion",
            "black hole accretion efficiency"
        ]
    },
    {
        id: "eddington_luminosity",
        name: "Eddington Luminosity (Maximum Luminosity from Accretion)",
        description: "Maximum luminosity achievable through spherical accretion when radiation pressure balances gravity. Fundamental limit for accretion-powered sources. Essential for understanding quasar physics, AGN luminosity limits, black hole growth, and stellar evolution. When exceeded, radiation pressure drives away accreting material.",
        equation: "L_Edd = 4π G M m_p c / σ_T",
        concepts: ["eddington luminosity", "accretion", "radiation pressure", "black hole", "quasar", "AGN", "luminosity limit", "accretion limit", "maximum luminosity"],
        keywords: ["eddington", "luminosity", "maximum", "accretion", "radiation pressure", "quasar", "AGN", "black hole", "limit"],
        variables: [
            {
                symbol: "L_Edd",
                name: "Eddington Luminosity",
                unit: "W",
                description: "Maximum luminosity from accretion, Eddington limit"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of accreting object, black hole mass, stellar mass"
            },
            {
                symbol: "m_p",
                name: "Proton Mass",
                unit: "kg",
                description: "Mass of proton, typical accreting particle mass"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            },
            {
                symbol: "σ_T",
                name: "Thomson Cross-Section",
                unit: "m²",
                description: "Thomson scattering cross-section for electron"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8,
            m_p: 1.67262192369e-27,
            σ_T: 6.6524587321e-29
        },
        relationships: {
            prerequisites: ["accretion_efficiency"],
            derivedFrom: [],
            relatedTo: ["accretion_efficiency", "luminosity", "schwarzschild_radius"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "what is eddington luminosity",
            "calculate eddington limit",
            "maximum accretion luminosity",
            "eddington luminosity limit"
        ]
    },
    {
        id: "time_dilation_gravitational",
        name: "Time Dilation near a Black Hole",
        description: "Time dilation due to strong gravitational field near black hole. Fundamental relativistic effect where time runs slower in strong gravitational fields. Essential for black hole physics, general relativity tests, and compact object observations. Describes how time intervals differ between observers at different gravitational potentials.",
        equation: "Δt = Δt_0 (1 - R_s / r)^(-1/2)",
        concepts: ["time dilation", "gravitational time dilation", "general relativity", "black hole", "schwarzschild radius", "relativistic effects", "compact object"],
        keywords: ["time dilation", "gravitational", "black hole", "general relativity", "schwarzschild", "relativistic", "time"],
        variables: [
            {
                symbol: "Δt",
                name: "Dilated Time",
                unit: "seconds",
                description: "Time interval as measured at infinity, dilated time"
            },
            {
                symbol: "Δt_0",
                name: "Proper Time",
                unit: "seconds",
                description: "Time interval as measured near black hole, local proper time"
            },
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius, Schwarzschild radius"
            },
            {
                symbol: "r",
                name: "Radial Distance",
                unit: "meters",
                description: "Distance from black hole center, observer radius"
            }
        ],
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: [],
            relatedTo: ["schwarzschild_radius", "gravitational_redshift", "time_dilation"],
            uses: [],
            generalizes: [],
            specializes: ["time_dilation"]
        },
        questionPatterns: [
            "time dilation near black hole",
            "gravitational time dilation",
            "time dilation from gravity",
            "black hole time dilation"
        ]
    },
    {
        id: "horizon_area",
        name: "Horizon Area of a Black Hole",
        description: "Surface area of black hole event horizon. Fundamental property related to black hole entropy and thermodynamics. Essential for black hole physics, Hawking radiation, and information paradox. Horizon area is proportional to black hole entropy in black hole thermodynamics.",
        equation: "A_H = 4π R_s²",
        concepts: ["black hole", "event horizon", "horizon area", "schwarzschild radius", "black hole entropy", "black hole thermodynamics", "hawking radiation"],
        keywords: ["horizon", "area", "black hole", "event horizon", "schwarzschild", "entropy", "thermodynamics"],
        variables: [
            {
                symbol: "A_H",
                name: "Horizon Area",
                unit: "m²",
                description: "Surface area of event horizon, black hole horizon area"
            },
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius, Schwarzschild radius"
            }
        ],
        constants: {
            π: Math.PI
        },
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: ["schwarzschild_radius"],
            relatedTo: ["schwarzschild_radius"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "black hole horizon area",
            "event horizon area",
            "calculate horizon area",
            "black hole surface area"
        ]
    },
    {
        id: "photon_energy_flat_space",
        name: "Energy of a Photon in Flat Space",
        description: "Energy of a photon in flat spacetime (special relativity). Fundamental relationship between photon energy and momentum. Essential for particle physics, quantum mechanics, and relativistic kinematics. Describes photon energy-momentum relationship in absence of gravitational fields.",
        equation: "E = pc",
        concepts: ["photon", "energy", "momentum", "special relativity", "quantum mechanics", "particle physics", "relativistic kinematics"],
        keywords: ["photon", "energy", "momentum", "special relativity", "quantum", "particle"],
        variables: [
            {
                symbol: "E",
                name: "Photon Energy",
                unit: "J",
                description: "Energy of the photon"
            },
            {
                symbol: "p",
                name: "Photon Momentum",
                unit: "kg·m/s",
                description: "Momentum of the photon"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["planck_relation"],
            derivedFrom: [],
            relatedTo: ["planck_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "photon energy from momentum",
            "energy momentum relation photon",
            "photon energy flat space",
            "relativistic photon energy"
        ]
    },
    // ============================================================
    // STELLAR STRUCTURE & STELLAR ATMOSPHERE FORMULAS (16-28)
    // ============================================================
    {
        id: "central_pressure_approximate",
        name: "Central Pressure (Approximate)",
        description: "Approximate central pressure in stellar interiors. Fundamental stellar structure relation connecting mass, radius, and central pressure. Essential for understanding stellar equilibrium, hydrostatic balance, and stellar evolution. Proportional relationship based on dimensional analysis of hydrostatic equilibrium.",
        equation: "P_c ∝ G M² / R⁴",
        concepts: ["central pressure", "stellar structure", "hydrostatic equilibrium", "stellar interior", "pressure", "stellar evolution", "stellar mass", "stellar radius"],
        keywords: ["central pressure", "stellar", "structure", "hydrostatic", "equilibrium", "interior", "pressure"],
        variables: [
            {
                symbol: "P_c",
                name: "Central Pressure",
                unit: "Pa",
                description: "Pressure at stellar center, central pressure"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "M",
                name: "Stellar Mass",
                unit: "kg",
                description: "Total mass of the star"
            },
            {
                symbol: "R",
                name: "Stellar Radius",
                unit: "meters",
                description: "Radius of the star"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["hydrostatic_balance"],
            derivedFrom: ["hydrostatic_balance"],
            relatedTo: ["hydrostatic_balance", "luminosity", "stellar_mass_central_temperature"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "central pressure star",
            "stellar central pressure",
            "calculate central pressure",
            "pressure at star center"
        ]
    },
    {
        id: "stellar_mass_central_temperature",
        name: "Stellar Mass from Central Temperature (General)",
        description: "Relationship between stellar mass and central temperature. Fundamental scaling relation connecting mass, central temperature, central density, and gravitational constant. Essential for understanding stellar structure, nuclear burning, and stellar evolution. Describes how stellar mass scales with central conditions.",
        equation: "M ∝ (T_c² / (ρ_c G³))^(1/2)",
        concepts: ["stellar mass", "central temperature", "central density", "stellar structure", "nuclear burning", "stellar evolution", "scaling relations"],
        keywords: ["stellar mass", "central temperature", "central density", "stellar structure", "nuclear", "evolution"],
        variables: [
            {
                symbol: "M",
                name: "Stellar Mass",
                unit: "kg",
                description: "Total mass of the star"
            },
            {
                symbol: "T_c",
                name: "Central Temperature",
                unit: "Kelvin",
                description: "Temperature at stellar center"
            },
            {
                symbol: "ρ_c",
                name: "Central Density",
                unit: "kg/m³",
                description: "Density at stellar center"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["central_pressure_approximate"],
            derivedFrom: ["central_pressure_approximate"],
            relatedTo: ["central_pressure_approximate", "hydrostatic_balance", "mass_luminosity_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "stellar mass from central temperature",
            "mass central temperature relation",
            "calculate stellar mass",
            "mass temperature scaling"
        ]
    },
    {
        id: "ideal_gas_pressure",
        name: "Ideal Gas Pressure",
        description: "Pressure from ideal gas law in stellar interiors. Fundamental equation of state for stellar matter. Essential for stellar structure, hydrostatic equilibrium, and equation of state. Describes pressure from thermal motion of particles in stellar interiors.",
        equation: "P_gas = n k T",
        concepts: ["ideal gas", "pressure", "equation of state", "stellar interior", "thermal pressure", "gas law", "particle density"],
        keywords: ["ideal gas", "pressure", "equation of state", "stellar", "thermal", "gas law"],
        variables: [
            {
                symbol: "P_gas",
                name: "Gas Pressure",
                unit: "Pa",
                description: "Pressure from ideal gas, thermal pressure"
            },
            {
                symbol: "n",
                name: "Number Density",
                unit: "m⁻³",
                description: "Number density of particles, particle density"
            },
            {
                symbol: "k",
                name: "Boltzmann Constant",
                unit: "J/K",
                description: "Boltzmann constant"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of the gas"
            }
        ],
        constants: {
            k: 1.380649e-23
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["radiation_pressure_stellar", "hydrostatic_balance"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "ideal gas pressure",
            "gas pressure calculation",
            "thermal pressure",
            "pressure from temperature"
        ]
    },
    {
        id: "radiation_pressure_stellar",
        name: "Radiation Pressure",
        description: "Pressure from radiation field in stellar interiors. Fundamental pressure component in hot stellar interiors. Essential for stellar structure, especially in massive stars and stellar cores. Radiation pressure becomes important at high temperatures and can exceed gas pressure.",
        equation: "P_rad = (1/3) a T⁴",
        concepts: ["radiation pressure", "stellar interior", "blackbody radiation", "pressure", "equation of state", "stellar structure", "high temperature"],
        keywords: ["radiation pressure", "stellar", "blackbody", "pressure", "radiation"],
        variables: [
            {
                symbol: "P_rad",
                name: "Radiation Pressure",
                unit: "Pa",
                description: "Pressure from radiation field"
            },
            {
                symbol: "a",
                name: "Radiation Constant",
                unit: "J/(m³·K⁴)",
                description: "Radiation constant, a = 4σ/c"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of the radiation field"
            }
        ],
        constants: {
            a: 7.5657232501369285e-16  // Radiation constant a = 4σ/c (SI exact σ, c)
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["ideal_gas_pressure", "luminosity", "hydrostatic_balance"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "radiation pressure",
            "pressure from radiation",
            "calculate radiation pressure",
            "stellar radiation pressure"
        ]
    },
    {
        id: "average_stellar_temperature",
        name: "Average Stellar Temperature",
        description: "Average temperature scaling relation for stars. Fundamental stellar structure relation connecting mass, radius, mean molecular weight, and average temperature. Essential for understanding stellar structure, energy transport, and stellar classification. Describes how average temperature scales with stellar properties.",
        equation: "T_avg ∝ G M μ m_H / (k R)",
        concepts: ["average temperature", "stellar temperature", "stellar structure", "mean molecular weight", "stellar mass", "stellar radius", "scaling relations"],
        keywords: ["average temperature", "stellar", "temperature", "structure", "mean molecular weight", "scaling"],
        variables: [
            {
                symbol: "T_avg",
                name: "Average Temperature",
                unit: "Kelvin",
                description: "Average temperature throughout the star"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "M",
                name: "Stellar Mass",
                unit: "kg",
                description: "Total mass of the star"
            },
            {
                symbol: "R",
                name: "Stellar Radius",
                unit: "meters",
                description: "Radius of the star"
            },
            {
                symbol: "μ",
                name: "Mean Molecular Weight",
                unit: "dimensionless",
                description: "Average mass per particle in units of hydrogen mass"
            },
            {
                symbol: "m_H",
                name: "Hydrogen Mass",
                unit: "kg",
                description: "Mass of hydrogen atom"
            },
            {
                symbol: "k",
                name: "Boltzmann Constant",
                unit: "J/K",
                description: "Boltzmann constant"
            }
        ],
        constants: {
            G: 6.67430e-11,
            m_H: 1.6735575e-27,
            k: 1.380649e-23
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["luminosity", "central_pressure_approximate"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "average stellar temperature",
            "stellar temperature scaling",
            "calculate average temperature",
            "temperature mass relation"
        ]
    },
    {
        id: "nuclear_energy_generation",
        name: "Nuclear Energy Generation Rate (General)",
        description: "General form for nuclear energy generation rate in stellar interiors. Fundamental relation describing how nuclear burning rate depends on density and temperature. Essential for stellar evolution, nuclear burning, and stellar lifetime calculations. Temperature dependence varies with nuclear reaction type.",
        equation: "ε ∝ ρ T^ν",
        concepts: ["nuclear energy", "energy generation", "nuclear burning", "stellar interior", "stellar evolution", "nuclear reactions", "temperature dependence"],
        keywords: ["nuclear", "energy generation", "burning", "stellar", "nuclear reactions", "temperature"],
        variables: [
            {
                symbol: "ε",
                name: "Energy Generation Rate",
                unit: "W/kg",
                description: "Energy generation rate per unit mass, nuclear burning rate"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Mass density"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature"
            },
            {
                symbol: "ν",
                name: "Temperature Exponent",
                unit: "dimensionless",
                description: "Temperature dependence exponent, varies with reaction type"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["luminosity", "stellar_lifetime", "thermal_time"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "nuclear energy generation",
            "energy generation rate",
            "nuclear burning rate",
            "stellar energy generation"
        ]
    },
    {
        id: "thermal_time",
        name: "Thermal Time (Kelvin-Helmholtz Timescale)",
        description: "Timescale for star to radiate away its gravitational potential energy. Fundamental stellar evolution timescale describing how long a star can shine from gravitational contraction. Essential for pre-main-sequence evolution, stellar formation, and energy budget. Also called Kelvin-Helmholtz timescale.",
        equation: "t_KH ∝ G M² / (R L)",
        concepts: ["thermal time", "kelvin-helmholtz", "timescale", "stellar evolution", "gravitational contraction", "pre-main-sequence", "energy timescale"],
        keywords: ["thermal time", "kelvin-helmholtz", "timescale", "stellar evolution", "contraction", "energy"],
        variables: [
            {
                symbol: "t_KH",
                name: "Thermal Time",
                unit: "seconds",
                description: "Kelvin-Helmholtz timescale, thermal timescale"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "M",
                name: "Stellar Mass",
                unit: "kg",
                description: "Total mass of the star"
            },
            {
                symbol: "R",
                name: "Stellar Radius",
                unit: "meters",
                description: "Radius of the star"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Stellar luminosity"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["luminosity"],
            derivedFrom: [],
            relatedTo: ["luminosity", "stellar_lifetime", "nuclear_energy_generation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "thermal time",
            "kelvin-helmholtz timescale",
            "contraction timescale",
            "gravitational energy timescale"
        ]
    },
    {
        id: "kelvin_helmholtz_timescale_exact",
        name: "Kelvin–Helmholtz Timescale (Exact)",
        description: "Time for a star to radiate its gravitational binding energy at current luminosity. t = 3 G M² / (10 R L). Same as thermal time with factor 3/10 from virial (E = |U| = 3GM²/(10R)). Sun: ~9 million years.",
        equation: "t = 3 * G * M^2 / (10 * R * L)",
        concepts: ["kelvin-helmholtz", "gravitational contraction", "stellar evolution", "protostar", "thermal time"],
        keywords: ["kelvin helmholtz years", "sun last gravitational contraction", "how many years gravitational contraction"],
        variables: [
            { symbol: "t", name: "Timescale", unit: "s", description: "KH timescale (convert to years: ÷ 3.156e7)" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Mass", unit: "kg", description: "Stellar mass" },
            { symbol: "R", name: "Radius", unit: "m", description: "Stellar radius" },
            { symbol: "L", name: "Luminosity", unit: "W", description: "Luminosity" }
        ],
        constants: { G: 6.67430e-11 },
        questionPatterns: [
            "how many years sun last gravitational contraction",
            "kelvin helmholtz exact",
            "sun gravitational contraction years"
        ]
    },
    {
        id: "luminosity_infall",
        name: "Luminosity from Infalling Matter",
        description: "Luminosity generated by matter falling onto a star (e.g. Kelvin–Helmholtz meteor/comet theory). L = ε G M ṁ / R. From ΔU = GMm/R (d→∞), power = ε × (GMṁ/R).",
        equation: "L = epsilon * G * M * m_dot / R",
        concepts: ["infall", "accretion", "luminosity", "gravitational potential energy", "meteor comet"],
        keywords: ["infalling matter luminosity", "rate of infalling matter", "L epsilon G M m dot R"],
        variables: [
            { symbol: "L", name: "Luminosity", unit: "W", description: "Generated luminosity" },
            { symbol: "epsilon", name: "Efficiency", unit: "dimensionless", description: "Fraction of GPE converted to radiation" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Central Mass", unit: "kg", description: "Mass of star" },
            { symbol: "m_dot", name: "Mass Infall Rate", unit: "kg/s", description: "dm/dt" },
            { symbol: "R", name: "Radius", unit: "m", description: "Radius of star" }
        ],
        constants: { G: 6.67430e-11 },
        questionPatterns: [
            "rate of infalling matter",
            "luminosity from infalling matter",
            "energy released infalling mass",
            "generate sun luminosity infall"
        ]
    },
    {
        id: "accretion_luminosity",
        name: "Accretion Luminosity (L = G M ṁ / R)",
        description: "Luminosity from accretion onto a compact object. From dU/dt = −G M ṁ / R, released power L = G M ṁ / R. Used for white dwarf or neutron star accreting from companion (e.g. Mira B).",
        equation: "L = G * M * m_dot / R",
        concepts: ["accretion", "luminosity", "white dwarf", "accretion disk", "Mira B"],
        keywords: ["accretion luminosity", "Mira B accretes", "dU dt G M m dot R"],
        variables: [
            { symbol: "L", name: "Luminosity", unit: "W", description: "Accretion luminosity" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Accretor Mass", unit: "kg", description: "Mass of WD/NS" },
            { symbol: "m_dot", name: "Accretion Rate", unit: "kg/s", description: "Mass accretion rate" },
            { symbol: "R", name: "Accretor Radius", unit: "m", description: "Radius of accretor" }
        ],
        constants: { G: 6.67430e-11 },
        questionPatterns: [
            "accretion luminosity",
            "apparent magnitude Mira B accretion",
            "luminosity from accretion rate"
        ]
    },
    {
        id: "apparent_magnitude_from_luminosity_distance",
        name: "Apparent Magnitude from Luminosity and Distance",
        description: "Apparent magnitude from luminosity L, distance d, and solar reference. m = m_sun − 2.5 log₁₀(F/F_sun), with F = L/(4πd²). Solar constant F_sun ≈ 1400 W/m², m_sun = −26.74.",
        equation: "m = m_sun - 2.5*log10((L/(4*pi*d^2))/F_sun)",
        concepts: ["apparent magnitude", "luminosity", "distance", "solar constant", "flux"],
        keywords: ["apparent magnitude from luminosity distance", "solar constant 1400", "Sirwarha apparent magnitude"],
        variables: [
            { symbol: "m", name: "Apparent Magnitude", unit: "mag", description: "Apparent magnitude" },
            { symbol: "m_sun", name: "Solar Apparent Magnitude", unit: "mag", description: "Typically −26.74" },
            { symbol: "L", name: "Luminosity", unit: "W", description: "Stellar luminosity" },
            { symbol: "d", name: "Distance", unit: "m", description: "Distance to star" },
            { symbol: "F_sun", name: "Solar Constant", unit: "W/m²", description: "≈ 1400 W/m²" }
        ],
        constants: { pi: Math.PI, m_sun: -26.74, F_sun: 1400 },
        questionPatterns: [
            "apparent magnitude from luminosity distance",
            "solar constant 1400 apparent magnitude",
            "Sirwarha apparent magnitude",
            "distance 490 ly apparent magnitude"
        ]
    },
    {
        id: "convection_criterion",
        name: "Convection Criterion (Schwarzschild Criterion)",
        description: "Criterion for convective instability in stellar interiors. Fundamental condition determining when energy transport occurs via convection rather than radiation. Essential for stellar structure, energy transport, and stellar evolution. Convection occurs when temperature gradient exceeds adiabatic gradient.",
        equation: "|dT/dr|_actual > |dT/dr|_adiabatic",
        concepts: ["convection", "schwarzschild criterion", "energy transport", "stellar interior", "convective instability", "temperature gradient", "adiabatic"],
        keywords: ["convection", "schwarzschild", "criterion", "energy transport", "stellar", "temperature gradient", "adiabatic"],
        variables: [
            {
                symbol: "dT/dr",
                name: "Temperature Gradient",
                unit: "K/m",
                description: "Rate of temperature change with radius, temperature gradient"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["luminosity", "hydrostatic_balance"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "convection criterion",
            "schwarzschild criterion",
            "when does convection occur",
            "convective instability"
        ]
    },
    {
        id: "opacity_general",
        name: "Opacity (General Relation)",
        description: "General relation for opacity in stellar atmospheres. Fundamental property describing how effectively matter absorbs and scatters radiation. Essential for stellar structure, radiative transfer, and stellar atmospheres. Opacity determines mean free path of photons and energy transport efficiency.",
        equation: "κ = σ / m",
        concepts: ["opacity", "radiative transfer", "stellar atmosphere", "absorption", "scattering", "mean free path", "cross-section"],
        keywords: ["opacity", "radiative transfer", "stellar atmosphere", "absorption", "scattering", "cross-section"],
        variables: [
            {
                symbol: "κ",
                name: "Opacity",
                unit: "m²/kg",
                description: "Opacity, mass absorption coefficient"
            },
            {
                symbol: "σ",
                name: "Cross-Section",
                unit: "m²",
                description: "Interaction cross-section, scattering cross-section"
            },
            {
                symbol: "m",
                name: "Particle Mass",
                unit: "kg",
                description: "Mass of interacting particle"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["optical_depth", "radiation_transport", "luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "opacity",
            "calculate opacity",
            "mass absorption coefficient",
            "stellar opacity"
        ]
    },
    {
        id: "optical_depth",
        name: "Optical Depth",
        description: "Optical depth along a path through absorbing/scattering material. Fundamental quantity in radiative transfer describing how opaque a medium is. Essential for stellar atmospheres, radiative transfer, and spectroscopy. Optical depth determines whether material is optically thick or thin.",
        equation: "τ = ∫ κ ρ ds",
        // Numeric/symbolic solving uses the common constant-coefficients approximation:
        // ∫ κ ρ ds ≈ κ ρ s
        // This enables solving for any of (τ, κ, ρ, s) consistently while units are handled elsewhere.
        solveFor: {
            "τ": "τ = κ * ρ * s",
            "κ": "κ = τ / (ρ * s)",
            "ρ": "ρ = τ / (κ * s)",
            "s": "s = τ / (κ * ρ)"
        },
        concepts: ["optical depth", "radiative transfer", "stellar atmosphere", "opacity", "absorption", "optically thick", "optically thin", "mean free path"],
        keywords: ["optical depth", "radiative transfer", "opacity", "absorption", "optically thick", "optically thin"],
        variables: [
            {
                symbol: "τ",
                name: "Optical Depth",
                unit: "dimensionless",
                description: "Optical depth, measure of opacity along path"
            },
            {
                symbol: "κ",
                name: "Opacity",
                unit: "m²/kg",
                description: "Mass absorption coefficient, opacity"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Mass density"
            },
            {
                symbol: "s",
                name: "Path Length",
                unit: "meters",
                description: "Distance along path through material"
            }
        ],
        relationships: {
            prerequisites: ["opacity_general"],
            derivedFrom: ["opacity_general"],
            relatedTo: ["opacity_general", "radiation_transport", "luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "optical depth",
            "calculate optical depth",
            "opacity along path",
            "radiative transfer optical depth"
        ]
    },
    {
        id: "scale_height_isothermal",
        name: "Isothermal Scale Height",
        description: "Pressure scale height in hydrostatic equilibrium for an isothermal atmosphere. Combining dP/dz = -ρg with the ideal gas law gives H = k_B T / (m g). Lighter gases have larger scale heights than heavier gases.",
        equation: "H = k_B * T / (m * g)",
        concepts: ["scale height", "hydrostatic equilibrium", "ideal gas", "atmosphere", "white dwarf"],
        keywords: ["scale height", "hydrogen helium atmosphere", "hydrostatic equilibrium atmosphere", "H equals kT over mg"],
        variables: [
            { symbol: "H", name: "Scale Height", unit: "m", description: "Characteristic vertical pressure/density scale height" },
            { symbol: "k_B", name: "Boltzmann Constant", unit: "J/K", description: "Boltzmann constant" },
            { symbol: "T", name: "Temperature", unit: "K", description: "Atmospheric temperature" },
            { symbol: "m", name: "Particle Mass", unit: "kg", description: "Mean particle mass" },
            { symbol: "g", name: "Surface Gravity", unit: "m/s²", description: "Gravitational acceleration" }
        ],
        constants: {
            k_B: 1.380649e-23
        },
        questionPatterns: [
            "scale height",
            "hydrogen helium atmosphere scale height",
            "derive H from hydrostatic equilibrium",
            "Janus scale height"
        ]
    },
    {
        id: "photospheric_pressure_optical_depth",
        name: "Photospheric Gas Pressure from Optical Depth",
        description: "Approximate gas pressure at a photosphere from hydrostatic balance and optical depth. Since dτ = κρ dz and dP/dz = -ρg, one gets dP/dτ = g/κ and therefore P ≈ gτ/κ at optical depth τ.",
        equation: "P_gas = g * tau / kappa",
        concepts: ["photospheric pressure", "optical depth", "opacity", "hydrostatic equilibrium", "stellar atmosphere"],
        keywords: ["photospheric gas pressure", "dP d tau", "tau equals 2/3 pressure", "rosseland opacity pressure"],
        variables: [
            { symbol: "P_gas", name: "Gas Pressure", unit: "Pa", description: "Gas pressure at optical depth tau" },
            { symbol: "g", name: "Surface Gravity", unit: "m/s²", description: "Gravitational acceleration" },
            { symbol: "tau", name: "Optical Depth", unit: "dimensionless", description: "Optical depth, often 2/3 at photosphere" },
            { symbol: "kappa", name: "Opacity", unit: "m²/kg", description: "Rosseland opacity or mass absorption coefficient" }
        ],
        questionPatterns: [
            "photospheric gas pressure",
            "integrate dP d tau",
            "tau 2/3 gas pressure",
            "rosseland opacity 0.02 1 plus X"
        ]
    },
    {
        id: "radiation_transport",
        name: "Radiation Transport Equation (Intensity Change)",
        description: "Equation describing how radiation intensity changes along a path. Fundamental radiative transfer equation describing absorption and emission. Essential for stellar atmospheres, radiative transfer, and spectroscopy. Describes how intensity changes due to absorption and emission processes.",
        equation: "dI_ν / ds = -κ_ν ρ I_ν + j_ν ρ",
        concepts: ["radiative transfer", "radiation transport", "intensity", "stellar atmosphere", "absorption", "emission", "opacity", "spectroscopy"],
        keywords: ["radiative transfer", "radiation transport", "intensity", "absorption", "emission", "opacity", "spectroscopy"],
        variables: [
            {
                symbol: "I_ν",
                name: "Specific Intensity",
                unit: "W/(m²·Hz·sr)",
                description: "Radiation intensity per unit frequency and solid angle"
            },
            {
                symbol: "κ_ν",
                name: "Frequency-Dependent Opacity",
                unit: "m²/kg",
                description: "Opacity at frequency ν, mass absorption coefficient"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Mass density"
            },
            {
                symbol: "j_ν",
                name: "Emission Coefficient",
                unit: "W/(kg·Hz·sr)",
                description: "Emission coefficient, emissivity per unit mass"
            },
            {
                symbol: "s",
                name: "Path Length",
                unit: "meters",
                description: "Distance along radiation path"
            }
        ],
        relationships: {
            prerequisites: ["opacity_general", "optical_depth"],
            derivedFrom: [],
            relatedTo: ["opacity_general", "optical_depth", "luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "radiation transport",
            "radiative transfer equation",
            "intensity change",
            "radiation equation"
        ]
    },
    {
        id: "mass_loss_rate",
        name: "Mass Loss Rate (General Form)",
        description: "General form for stellar mass loss rate. Fundamental relation describing mass loss from stellar winds. Essential for stellar evolution, especially for massive stars and evolved stars. Mass loss affects stellar lifetime, evolution, and final state. Related to luminosity and wind velocity.",
        equation: "Ṁ ∝ L / (v_w c)",
        concepts: ["mass loss", "stellar wind", "mass loss rate", "stellar evolution", "stellar winds", "wind velocity", "luminosity"],
        keywords: ["mass loss", "stellar wind", "wind", "mass loss rate", "stellar evolution", "luminosity"],
        variables: [
            {
                symbol: "Ṁ",
                name: "Mass Loss Rate",
                unit: "kg/s",
                description: "Rate of mass loss, mass loss per unit time"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Stellar luminosity"
            },
            {
                symbol: "v_w",
                name: "Wind Velocity",
                unit: "m/s",
                description: "Velocity of stellar wind"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["luminosity"],
            derivedFrom: [],
            relatedTo: ["luminosity", "stellar_lifetime"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "mass loss rate",
            "stellar wind mass loss",
            "calculate mass loss",
            "wind mass loss"
        ]
    },
    {
        id: "total_energy_virial",
        name: "Total Energy of a Star (Virial Theorem, General)",
        description: "Total energy of a star from virial theorem. Fundamental relationship between total energy and gravitational energy. Essential for stellar structure, stellar equilibrium, and energy budget. Virial theorem relates kinetic and potential energy in bound systems.",
        equation: "E_total = -E_grav / 2",
        concepts: ["virial theorem", "total energy", "gravitational energy", "stellar structure", "stellar equilibrium", "energy budget", "bound system"],
        keywords: ["virial", "total energy", "gravitational energy", "stellar", "equilibrium", "energy"],
        variables: [
            {
                symbol: "E_total",
                name: "Total Energy",
                unit: "J",
                description: "Total energy of the star"
            },
            {
                symbol: "E_grav",
                name: "Gravitational Energy",
                unit: "J",
                description: "Gravitational potential energy, binding energy"
            }
        ],
        relationships: {
            prerequisites: ["orbital_energy"],
            derivedFrom: [],
            relatedTo: ["orbital_energy", "thermal_time", "luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "total energy star",
            "virial theorem",
            "stellar total energy",
            "gravitational energy relation"
        ]
    },
    {
        id: "virial_temperature_gas",
        name: "Virial Temperature (Gas Cloud)",
        description: "Temperature at which a spherical gas cloud is in virial equilibrium: 2K + U = 0. U = -3GM²/(5R), K = (3/2)(M/μ)k_B T. So T_vir = G M μ / (5 k_B R). Used for star-forming clouds.",
        equation: "T_vir = G * M * mu / (5 * k_B * R)",
        concepts: ["virial theorem", "virial temperature", "gas cloud", "star formation", "equilibrium", "collapse"],
        keywords: ["virial temperature", "virialized cloud", "T vir", "gas cloud equilibrium"],
        variables: [
            { symbol: "T_vir", name: "Virial Temperature", unit: "K", description: "Equilibrium temperature" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Cloud Mass", unit: "kg", description: "Total mass of cloud" },
            { symbol: "mu", name: "Mean Particle Mass", unit: "kg", description: "Mean mass per particle μ" },
            { symbol: "k_B", name: "Boltzmann Constant", unit: "J/K", description: "k_B" },
            { symbol: "R", name: "Cloud Radius", unit: "m", description: "Radius of cloud" }
        ],
        constants: { G: 6.67430e-11, k_B: 1.380649e-23 },
        questionPatterns: [
            "virial temperature",
            "solve for T vir",
            "virial theorem gas cloud",
            "2K plus U equals zero temperature"
        ]
    },
    {
        id: "virial_velocity_dispersion",
        name: "Virial Velocity Dispersion",
        description: "Velocity dispersion for virial equilibrium. K = (3/2) M σ², U = -3GM²/(5R), 2K + U = 0 ⇒ σ_vir = sqrt(G M / (5 R)).",
        equation: "sigma_vir = sqrt(G * M / (5 * R))",
        concepts: ["virial theorem", "velocity dispersion", "gas cloud", "star formation"],
        keywords: ["virial velocity dispersion", "sigma vir", "velocity dispersion virial"],
        variables: [
            { symbol: "sigma_vir", name: "Virial Velocity Dispersion", unit: "m/s", description: "σ_vir" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Cloud Mass", unit: "kg", description: "Total mass" },
            { symbol: "R", name: "Cloud Radius", unit: "m", description: "Radius" }
        ],
        constants: { G: 6.67430e-11 },
        questionPatterns: [
            "virial velocity dispersion",
            "solve for sigma vir",
            "velocity dispersion virial"
        ]
    },
    {
        id: "radiative_transport_temperature_gradient",
        name: "Radiative Transport Temperature Gradient",
        description: "Temperature gradient in stellar interiors due to radiative energy transport. Fundamental equation describing how temperature changes with radius in radiative zones. Essential for stellar structure, especially in Mira-type stars and other evolved stars. Describes energy transport via radiation in stellar interiors. Important for understanding stellar structure and energy flow.",
        equation: "dT(r) / dr = - (3κ(r)ρ(r)L(r)) / (16πacr²T³(r))",
        concepts: ["radiative transport", "temperature gradient", "stellar interior", "energy transport", "radiation", "stellar structure", "mira stars", "evolved stars", "opacity", "luminosity"],
        keywords: ["radiative transport", "temperature gradient", "stellar interior", "energy transport", "radiation", "mira", "opacity", "luminosity"],
        variables: [
            {
                symbol: "dT/dr",
                name: "Temperature Gradient",
                unit: "K/m",
                description: "Rate of temperature change with radius, temperature gradient"
            },
            {
                symbol: "κ",
                name: "Opacity",
                unit: "m²/kg",
                description: "Mass absorption coefficient, opacity at radius r"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Mass density at radius r"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Luminosity at radius r, energy flux"
            },
            {
                symbol: "a",
                name: "Radiation Constant",
                unit: "J/(m³·K⁴)",
                description: "Radiation density constant, a = 4σ/c"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radial distance from stellar center"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature at radius r"
            }
        ],
        constants: {
            a: 7.5657232501369285e-16,  // Radiation constant a = 4σ/c (SI exact σ, c)
            c: 2.99792458e8,
            π: Math.PI
        },
        relationships: {
            prerequisites: ["opacity_general", "luminosity"],
            derivedFrom: ["radiation_transport"],
            relatedTo: ["radiation_transport", "opacity_general", "luminosity", "convection_criterion"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "radiative transport temperature gradient",
            "temperature gradient stellar interior",
            "radiative energy transport",
            "mira star temperature gradient",
            "stellar temperature gradient"
        ]
    },
    {
        id: "stellar_pulsation_mechanics",
        name: "Stellar Pulsation Mechanics (Radial Oscillations)",
        description: "Linear adiabatic wave equation for radial stellar pulsations. Fundamental equation describing stellar oscillations and variability, especially in Mira-type variable stars. Essential for understanding pulsating stars, variable stars, and stellar oscillations. Describes how stellar shells oscillate radially, driving the variability mechanism. The κ-mechanism operates in Mira-type stars where partial ionization of helium increases opacity during compression, driving pulsations.",
        equation: "d²ξ(r,t) / dt² = - (1 / ρ(r)) ∇P' - ∇Φ'",
        concepts: ["stellar pulsation", "radial oscillations", "variable stars", "mira stars", "pulsating stars", "stellar oscillations", "kappa mechanism", "opacity mechanism", "pressure perturbation", "gravitational potential", "radial displacement"],
        keywords: ["stellar pulsation", "radial oscillations", "variable stars", "mira", "pulsating", "oscillations", "kappa mechanism", "opacity mechanism"],
        variables: [
            {
                symbol: "ξ",
                name: "Radial Displacement",
                unit: "meters",
                description: "Radial displacement of a shell at radius r and time t"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radial distance from stellar center"
            },
            {
                symbol: "t",
                name: "Time",
                unit: "seconds",
                description: "Time"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Mass density at radius r"
            },
            {
                symbol: "P'",
                name: "Pressure Perturbation",
                unit: "Pa",
                description: "Pressure perturbation from equilibrium, pressure variation"
            },
            {
                symbol: "Φ'",
                name: "Gravitational Potential Perturbation",
                unit: "m²/s²",
                description: "Gravitational potential perturbation, potential variation"
            }
        ],
        relationships: {
            prerequisites: ["hydrostatic_balance"],
            derivedFrom: [],
            relatedTo: ["hydrostatic_balance", "opacity_general", "radiative_transport_temperature_gradient"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "stellar pulsation",
            "radial oscillations",
            "mira star pulsation",
            "variable star pulsation",
            "stellar oscillations",
            "kappa mechanism",
            "opacity mechanism"
        ]
    },
    {
        id: "kappa_mechanism_mira",
        name: "κ-Mechanism (Mira-Type Stars)",
        description: "Opacity mechanism driving pulsations in Mira-type variable stars. Fundamental mechanism where partial ionization of helium increases opacity during compression, creating a driving force for stellar pulsations. Essential for understanding Mira variability, long-period variable stars, and stellar pulsation mechanics. In Mira-type stars, the κ-mechanism operates in layers where partial ionization occurs, with opacity increasing during compression (δκ/κ > 0), which traps radiation and drives the pulsation. The outer envelope is fully convective, and convection couples strongly to the pulsation mechanism.",
        equation: "δκ / κ > 0 during compression",
        concepts: ["kappa mechanism", "opacity mechanism", "mira stars", "variable stars", "pulsating stars", "stellar pulsation", "helium ionization", "opacity variation", "pulsation driving", "convection", "mixing length theory"],
        keywords: ["kappa mechanism", "opacity mechanism", "mira", "variable stars", "pulsation", "helium ionization", "opacity", "convection"],
        variables: [
            {
                symbol: "κ",
                name: "Opacity",
                unit: "m²/kg",
                description: "Mass absorption coefficient, opacity"
            },
            {
                symbol: "δκ",
                name: "Opacity Perturbation",
                unit: "m²/kg",
                description: "Change in opacity due to compression/expansion"
            }
        ],
        relationships: {
            prerequisites: ["opacity_general", "stellar_pulsation_mechanics"],
            derivedFrom: [],
            relatedTo: ["opacity_general", "stellar_pulsation_mechanics", "radiative_transport_temperature_gradient", "convection_criterion"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "kappa mechanism",
            "opacity mechanism",
            "mira kappa mechanism",
            "pulsation driving mechanism",
            "helium ionization opacity",
            "mira star mechanism"
        ]
    },
    {
        id: "pulsation_period_scaling",
        name: "Radial Pulsation Period Scaling",
        description: "Dimensional scaling for radial pulsation periods. For a self-gravitating star, the dynamical timescale gives P ∝ sqrt(R^3 / (G M)), so P ∝ G^(-1/2) M^(-1/2) R^(3/2). This corresponds to fundamental radial pulsation scaling.",
        equation: "P = sqrt(R^3 / (G * M))",
        concepts: ["pulsation period", "mira", "radial mode", "dynamical timescale", "stellar oscillation"],
        keywords: ["pulsation period scaling", "P proportional sqrt R cubed over GM", "Mira dimensional analysis"],
        variables: [
            { symbol: "P", name: "Pulsation Period", unit: "s", description: "Characteristic radial pulsation period" },
            { symbol: "R", name: "Radius", unit: "m", description: "Stellar radius" },
            { symbol: "G", name: "Gravitational Constant", unit: "m^3/(kg s^2)", description: "Gravitational constant" },
            { symbol: "M", name: "Mass", unit: "kg", description: "Stellar mass" }
        ],
        constants: {
            G: 6.67430e-11
        },
        questionPatterns: [
            "mira pulsation dimensional analysis",
            "P proportional G a M b R c",
            "radial pulsation period scaling"
        ]
    },
    {
        id: "luminosity_fractional_amplitude_pulsation",
        name: "Fractional Luminosity Amplitude from Radius-Temperature Coupling",
        description: "First-order luminosity amplitude for a pulsating star when ΔT/T = -γ ΔR/R. Since L ∝ R^2 T^4, one gets ΔL/L ≈ (2 - 4γ) ΔR/R to first order.",
        equation: "L_frac = (2 - 4 * gamma) * R_frac",
        concepts: ["luminosity amplitude", "pulsation", "mira", "fractional amplitude", "stefan-boltzmann"],
        keywords: ["fractional luminosity amplitude", "2 minus 4 gamma", "delta L over L", "Mira luminosity amplitude"],
        variables: [
            { symbol: "L_frac", name: "Fractional Luminosity Amplitude", unit: "dimensionless", description: "Approximate ΔL/L amplitude" },
            { symbol: "gamma", name: "Radius-Temperature Coupling", unit: "dimensionless", description: "γ in ΔT/T = -γ ΔR/R" },
            { symbol: "R_frac", name: "Fractional Radius Amplitude", unit: "dimensionless", description: "ΔR/R amplitude" }
        ],
        questionPatterns: [
            "fractional luminosity amplitude",
            "delta T over T equals minus gamma delta R over R",
            "2 minus 4 gamma R"
        ]
    },
    {
        id: "magnitude_variation_pulsation",
        name: "Magnitude Variation for Pulsation (First Order)",
        description: "First-order magnitude variation for a pulsating star with radius curve R(t). Using ΔM ≈ -(2.5/ln10) ΔL/L, ΔM is sometimes written proportional to (4γ - 2) R cos(ωt + φ) in simplified treatments.",
        equation: "delta_M = (4 * gamma - 2) * R_amp * cos(omega * t + phi)",
        concepts: ["magnitude variation", "pulsation", "mira", "light curve", "phase"],
        keywords: ["magnitude variation pulsation", "delta MK", "4 gamma minus 2", "light curve phase radius curve"],
        variables: [
            { symbol: "delta_M", name: "Magnitude Variation", unit: "mag", description: "First-order magnitude variation" },
            { symbol: "gamma", name: "Radius-Temperature Coupling", unit: "dimensionless", description: "γ parameter" },
            { symbol: "R_amp", name: "Fractional Radius Amplitude", unit: "dimensionless", description: "Amplitude R" },
            { symbol: "omega", name: "Angular Frequency", unit: "rad/s", description: "ω = 2π/P" },
            { symbol: "t", name: "Time", unit: "s", description: "Time" },
            { symbol: "phi", name: "Phase", unit: "rad", description: "Phase offset" }
        ],
        questionPatterns: [
            "delta MK pulsation",
            "magnitude variation in terms of gamma omega phi",
            "in phase or out of phase with radius curve"
        ]
    },
    {
        id: "period_luminosity_relation_cepheid",
        name: "Period-Luminosity Relation (Cepheids)",
        description: "Luminosity as a function of pulsation period for classical Cepheid variable stars. Fundamental relation used as a standard candle for distance measurement. Essential for extragalactic distance measurements and cosmic distance ladder. Classical Cepheids follow a well-defined period-luminosity relation, making them excellent distance indicators. The relation is logarithmic: longer period Cepheids are more luminous.",
        equation: "M_V = -2.76 × log₁₀(P) - 1.4",
        concepts: ["period luminosity relation", "cepheid", "variable stars", "standard candle", "distance measurement", "cosmic distance ladder", "pulsating stars"],
        keywords: ["period luminosity", "cepheid", "variable star", "standard candle", "distance", "pulsation period"],
        variables: [
            {
                symbol: "M_V",
                name: "Absolute Visual Magnitude",
                unit: "magnitude",
                description: "Absolute visual magnitude of the Cepheid"
            },
            {
                symbol: "P",
                name: "Pulsation Period",
                unit: "days",
                description: "Period of pulsation in days"
            }
        ],
        relationships: {
            prerequisites: ["distance_modulus"],
            derivedFrom: [],
            relatedTo: ["distance_modulus", "luminosity", "stellar_pulsation_mechanics"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "period luminosity relation",
            "cepheid period luminosity",
            "cepheid distance",
            "standard candle cepheid",
            "calculate cepheid luminosity from period",
            "Cepheid variable light curve distance in pc",
            "Mv = -2.2 log10(P) - 2.05",
            "absolute magnitude from Cepheid period in days"
        ]
    },
    {
        id: "period_luminosity_cepheid_classical",
        name: "Period-Luminosity (Classical Cepheid, M from P)",
        description: "Absolute visual magnitude from pulsation period (days): M_V = -2.43(log₁₀(P) - 1) - 4.05. Solve for P: log₁₀(P) = 1 - (M_V + 4.05)/2.43.",
        equation: "M_V = -2.43*(log10(P) - 1) - 4.05",
        concepts: ["cepheid", "period luminosity", "RS Puppis", "pulsation period", "absolute magnitude"],
        keywords: ["RS Puppis", "cepheid period from magnitude", "absolute magnitude -5.7 period", "classical cepheid period"],
        variables: [
            { symbol: "M_V", name: "Absolute Visual Magnitude", unit: "mag", description: "Absolute magnitude" },
            { symbol: "P", name: "Pulsation Period", unit: "days", description: "Period in days" }
        ],
        questionPatterns: [
            "absolute magnitude RS Puppis period",
            "cepheid pulsation period from magnitude",
            "what is pulsation period cepheid"
        ]
    },
    {
        id: "bolometric_correction",
        name: "Bolometric Correction",
        description: "Correction from visual magnitude to bolometric magnitude. Accounts for energy radiated outside the visible band. Essential for accurate luminosity determination from magnitude measurements. Bolometric correction depends on stellar temperature and spectral type. Negative for hot stars (most energy in UV), positive for cool stars (most energy in IR).",
        equation: "M_bol = M_V + BC",
        concepts: ["bolometric correction", "bolometric magnitude", "visual magnitude", "luminosity", "stellar classification", "magnitude system"],
        keywords: ["bolometric correction", "bolometric magnitude", "visual magnitude", "magnitude correction"],
        variables: [
            {
                symbol: "M_bol",
                name: "Bolometric Magnitude",
                unit: "magnitude",
                description: "Absolute bolometric magnitude, total energy output"
            },
            {
                symbol: "M_V",
                name: "Visual Magnitude",
                unit: "magnitude",
                description: "Absolute visual magnitude"
            },
            {
                symbol: "BC",
                name: "Bolometric Correction",
                unit: "magnitude",
                description: "Correction factor, typically negative for hot stars"
            }
        ],
        relationships: {
            prerequisites: ["distance_modulus"],
            derivedFrom: [],
            relatedTo: ["distance_modulus", "luminosity", "hr_absolute_magnitude"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "bolometric correction",
            "bolometric magnitude",
            "visual to bolometric",
            "calculate bolometric magnitude"
        ]
    },
    {
        id: "extinction_correction_rv",
        name: "Extinction Correction with RV",
        description: "Extinction correction using total-to-selective extinction ratio RV. Accounts for wavelength-dependent extinction in interstellar medium. Essential for accurate distance and magnitude measurements. RV = AV / E(B-V) describes how extinction varies with wavelength. Typical value RV = 3.1 for Milky Way, but can vary with dust properties.",
        equation: "A_V = R_V × E(B - V)",
        concepts: ["extinction", "interstellar dust", "reddening", "color excess", "RV ratio", "wavelength dependent extinction"],
        keywords: ["extinction", "RV", "reddening", "color excess", "interstellar dust", "AV"],
        variables: [
            {
                symbol: "A_V",
                name: "Visual Extinction",
                unit: "magnitude",
                description: "Extinction in visual band"
            },
            {
                symbol: "R_V",
                name: "Total-to-Selective Extinction Ratio",
                unit: "dimensionless",
                description: "Ratio AV/E(B-V), typically 3.1 for Milky Way"
            },
            {
                symbol: "E(B - V)",
                name: "Color Excess",
                unit: "magnitude",
                description: "Reddening, B-V color excess"
            }
        ],
        constants: {
            R_V: 3.1  // Typical value for Milky Way
        },
        relationships: {
            prerequisites: ["interstellar_reddening"],
            derivedFrom: [],
            relatedTo: ["interstellar_reddening", "extinction_relation", "distance_modulus"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "extinction correction",
            "RV extinction",
            "calculate AV from color excess",
            "interstellar extinction RV"
        ]
    },
    {
        id: "binary_mass_ratio_velocity",
        name: "Binary Mass Ratio from Velocity Amplitudes",
        description: "Mass ratio of binary system components from radial velocity semi-amplitudes. Fundamental relation for spectroscopic binaries. Essential for determining individual stellar masses in binary systems. For circular orbits, the mass ratio equals the inverse ratio of velocity amplitudes. This allows determination of individual masses when combined with total mass.",
        equation: "M₁ / M₂ = K₂ / K₁",
        concepts: ["binary stars", "mass ratio", "radial velocity", "spectroscopic binary", "stellar masses", "velocity amplitude"],
        keywords: ["binary mass ratio", "velocity amplitude", "spectroscopic binary", "radial velocity", "mass ratio"],
        variables: [
            {
                symbol: "M₁",
                name: "Primary Mass",
                unit: "kg",
                description: "Mass of primary star"
            },
            {
                symbol: "M₂",
                name: "Secondary Mass",
                unit: "kg",
                description: "Mass of secondary star"
            },
            {
                symbol: "K₁",
                name: "Primary Velocity Amplitude",
                unit: "m/s",
                description: "Semi-amplitude of radial velocity for primary star"
            },
            {
                symbol: "K₂",
                name: "Secondary Velocity Amplitude",
                unit: "m/s",
                description: "Semi-amplitude of radial velocity for secondary star"
            }
        ],
        relationships: {
            prerequisites: ["kepler_third_law_binary"],
            derivedFrom: [],
            relatedTo: ["kepler_third_law_binary", "center_of_mass", "doppler_shift"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "binary mass ratio",
            "velocity amplitude mass ratio",
            "spectroscopic binary mass",
            "calculate mass from velocity"
        ]
    },
    {
        id: "flux_change_magnitude_difference",
        name: "Flux Change from Magnitude Difference",
        description: "Flux ratio from magnitude difference. Fundamental relation connecting observed brightness changes to actual energy flux changes. Essential for analyzing variable stars, transits, and brightness variations. The logarithmic nature of magnitudes means equal magnitude differences correspond to equal flux ratios, regardless of absolute brightness.",
        equation: "F₂ / F₁ = 10^(-0.4 × Δm)",
        concepts: ["magnitude", "flux", "brightness", "variable stars", "magnitude difference", "flux ratio"],
        keywords: ["magnitude difference", "flux change", "brightness change", "magnitude flux", "variable star brightness"],
        variables: [
            {
                symbol: "F₂",
                name: "Flux 2",
                unit: "W/m²",
                description: "Flux at time 2 or for object 2"
            },
            {
                symbol: "F₁",
                name: "Flux 1",
                unit: "W/m²",
                description: "Flux at time 1 or for object 1"
            },
            {
                symbol: "Δm",
                name: "Magnitude Difference",
                unit: "magnitude",
                description: "Difference in magnitudes, m₂ - m₁"
            }
        ],
        relationships: {
            prerequisites: ["magnitude_flux_relation"],
            derivedFrom: ["magnitude_flux_relation"],
            relatedTo: ["magnitude_flux_relation", "distance_modulus"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "flux change magnitude",
            "magnitude difference flux",
            "how much fainter",
            "brightness change magnitude",
            "calculate flux ratio from magnitude"
        ]
    },
    {
        id: "pulsating_star_radius_change",
        name: "Radius Change from Flux Change (Pulsating Star)",
        description: "Radius change for pulsating star with constant temperature. For pulsating stars behaving as blackbodies with constant temperature, flux changes are due solely to radius variations. Essential for analyzing Cepheids, RR Lyrae, and other pulsating variables. If temperature is constant, flux scales as radius squared.",
        equation: "R₂ / R₁ = √(F₂ / F₁)",
        concepts: ["pulsating stars", "radius change", "flux change", "variable stars", "cepheid", "blackbody", "constant temperature"],
        keywords: ["pulsating star", "radius change", "flux change", "cepheid radius", "variable star radius"],
        variables: [
            {
                symbol: "R₂",
                name: "Radius 2",
                unit: "meters",
                description: "Radius at maximum or time 2"
            },
            {
                symbol: "R₁",
                name: "Radius 1",
                unit: "meters",
                description: "Radius at minimum or time 1"
            },
            {
                symbol: "F₂",
                name: "Flux 2",
                unit: "W/m²",
                description: "Flux at maximum or time 2"
            },
            {
                symbol: "F₁",
                name: "Flux 1",
                unit: "W/m²",
                description: "Flux at minimum or time 1"
            }
        ],
        relationships: {
            prerequisites: ["luminosity", "stefan_boltzmann_law"],
            derivedFrom: ["luminosity"],
            relatedTo: ["luminosity", "stefan_boltzmann_law", "stellar_pulsation_mechanics"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "pulsating star radius",
            "radius change flux",
            "cepheid radius change",
            "variable star radius variation"
        ]
    },
    {
        id: "nuclear_fusion_mass_defect",
        name: "Nuclear Fusion Mass Defect",
        description: "Energy released from nuclear fusion via mass defect. Fundamental relation for stellar energy generation. Essential for understanding stellar fusion, hydrogen burning, and stellar lifetimes. When four hydrogen atoms fuse to form one helium atom, mass is converted to energy according to E=mc². The mass defect is the difference between initial and final masses.",
        equation: "E = Δm × c²",
        concepts: ["nuclear fusion", "mass defect", "stellar energy", "hydrogen burning", "einstein mass energy", "nuclear reactions"],
        keywords: ["nuclear fusion", "mass defect", "energy release", "hydrogen fusion", "stellar energy", "einstein"],
        variables: [
            {
                symbol: "E",
                name: "Energy Released",
                unit: "J",
                description: "Energy released from fusion reaction"
            },
            {
                symbol: "Δm",
                name: "Mass Defect",
                unit: "kg",
                description: "Mass difference, mass lost in reaction"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8,
            mass_defect_4H_to_He: 0.028,  // Atomic mass units
            mass_defect_4H_to_He_kg: 4.65e-29,  // In kg (for 4H → He)
            energy_4H_to_He_MeV: 26.7,  // In MeV
            energy_4H_to_He_J: 4.3e-12  // In Joules
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["nuclear_energy_generation", "stellar_lifetime", "luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "nuclear fusion energy",
            "mass defect",
            "hydrogen fusion energy",
            "energy from fusion",
            "einstein mass energy"
        ]
    },
    {
        id: "nebula_age_expansion",
        name: "Nebula Age from Expansion",
        description: "Age of expanding nebula from radius and expansion velocity. Estimates time since nebula formation or ejection. Essential for understanding planetary nebulae, supernova remnants, and stellar evolution timescales. Assumes constant expansion velocity, which is reasonable for many cases.",
        equation: "t = r / v",
        concepts: ["nebula age", "expansion", "planetary nebula", "supernova remnant", "stellar evolution", "expansion velocity"],
        keywords: ["nebula age", "expansion age", "planetary nebula age", "supernova remnant age"],
        variables: [
            {
                symbol: "t",
                name: "Age",
                unit: "seconds",
                description: "Age of the nebula"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Current radius of the nebula"
            },
            {
                symbol: "v",
                name: "Expansion Velocity",
                unit: "m/s",
                description: "Expansion velocity of nebula"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["stellar_lifetime", "mass_loss_rate"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "nebula age",
            "expansion age",
            "planetary nebula age",
            "how old is nebula",
            "supernova remnant age"
        ]
    },
    {
        id: "orbital_decay_gravitational_radiation",
        name: "Orbital Decay Rate (Gravitational Radiation)",
        description: "Rate of orbital decay due to gravitational wave emission. Describes how binary systems lose orbital energy to gravitational radiation. Essential for understanding binary white dwarf mergers, neutron star binaries, and gravitational wave sources. The decay rate depends on masses, separation, and orbital period. General relativity predicts energy loss to gravitational waves causes orbital decay.",
        equation: "da/dt = - (64/5) × (G³ / c⁵) × (M₁ M₂ (M₁ + M₂) / a³)",
        concepts: ["orbital decay", "gravitational radiation", "gravitational waves", "binary systems", "general relativity", "energy loss"],
        keywords: ["orbital decay", "gravitational radiation", "gravitational waves", "binary decay", "orbital energy loss"],
        variables: [
            {
                symbol: "da/dt",
                name: "Orbital Decay Rate",
                unit: "m/s",
                description: "Rate of change of semi-major axis, negative for decay"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            },
            {
                symbol: "M₁",
                name: "Primary Mass",
                unit: "kg",
                description: "Mass of first object"
            },
            {
                symbol: "M₂",
                name: "Secondary Mass",
                unit: "kg",
                description: "Mass of second object"
            },
            {
                symbol: "a",
                name: "Semi-Major Axis",
                unit: "meters",
                description: "Orbital separation, semi-major axis"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["kepler_third_law_binary", "orbital_energy"],
            derivedFrom: [],
            relatedTo: ["kepler_third_law_binary", "orbital_energy", "white_dwarf_orbital_decay", "gravitational_wave_quadrupole_luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "orbital decay",
            "gravitational radiation",
            "gravitational wave decay",
            "binary merger timescale",
            "orbital energy loss"
        ]
    },
    // ============================================================
    // LINE RADIATION AND EXCITATION FORMULAS (29-44)
    // ============================================================
    {
        id: "boltzmann_equation",
        name: "Boltzmann Equation (Level Population Ratio)",
        description: "Ratio of population in two energy levels at thermal equilibrium. Fundamental statistical mechanics relation describing level populations in thermal equilibrium. Essential for spectroscopy, stellar atmospheres, and atomic physics. Describes how atoms distribute among energy levels based on temperature and energy differences.",
        equation: "N_2 / N_1 = (g_2 / g_1) × exp(-(E_2 - E_1) / kT)",
        concepts: ["boltzmann", "level population", "thermal equilibrium", "statistical mechanics", "spectroscopy", "stellar atmosphere", "atomic physics", "energy levels"],
        keywords: ["boltzmann", "level population", "thermal equilibrium", "spectroscopy", "energy levels", "atomic"],
        variables: [
            {
                symbol: "N_2",
                name: "Population Level 2",
                unit: "dimensionless",
                description: "Number of atoms in upper energy level"
            },
            {
                symbol: "N_1",
                name: "Population Level 1",
                unit: "dimensionless",
                description: "Number of atoms in lower energy level"
            },
            {
                symbol: "g_2",
                name: "Degeneracy Level 2",
                unit: "dimensionless",
                description: "Statistical weight, degeneracy of upper level"
            },
            {
                symbol: "g_1",
                name: "Degeneracy Level 1",
                unit: "dimensionless",
                description: "Statistical weight, degeneracy of lower level"
            },
            {
                symbol: "E_2",
                name: "Energy Level 2",
                unit: "J",
                description: "Energy of upper level"
            },
            {
                symbol: "E_1",
                name: "Energy Level 1",
                unit: "J",
                description: "Energy of lower level"
            },
            {
                symbol: "k",
                name: "Boltzmann Constant",
                unit: "J/K",
                description: "Boltzmann constant"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of the system"
            }
        ],
        constants: {
            k: 1.380649e-23
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["saha_equation", "einstein_coefficient"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "boltzmann equation",
            "level population ratio",
            "thermal equilibrium population",
            "energy level population"
        ]
    },
    {
        id: "saha_equation",
        name: "Saha Equation (Ionization Fraction)",
        description: "Fraction of atoms in ionized state at thermal equilibrium. Fundamental statistical mechanics relation describing ionization equilibrium. Essential for stellar atmospheres, spectroscopy, and plasma physics. Describes how ionization depends on temperature, density, and ionization potential.",
        equation: "N_ion / N_neutral = (2 / n_e) × (2π m_e k T / h²)^(3/2) × exp(-χ / kT)",
        concepts: ["saha", "ionization", "ionization fraction", "thermal equilibrium", "stellar atmosphere", "spectroscopy", "plasma", "ionization potential"],
        keywords: ["saha", "ionization", "ionization fraction", "stellar atmosphere", "plasma", "ionization potential"],
        variables: [
            {
                symbol: "N_ion",
                name: "Ionized Population",
                unit: "dimensionless",
                description: "Number of ionized atoms"
            },
            {
                symbol: "N_neutral",
                name: "Neutral Population",
                unit: "dimensionless",
                description: "Number of neutral atoms"
            },
            {
                symbol: "n_e",
                name: "Electron Density",
                unit: "m⁻³",
                description: "Number density of free electrons"
            },
            {
                symbol: "m_e",
                name: "Electron Mass",
                unit: "kg",
                description: "Mass of electron"
            },
            {
                symbol: "k",
                name: "Boltzmann Constant",
                unit: "J/K",
                description: "Boltzmann constant"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature"
            },
            {
                symbol: "h",
                name: "Planck Constant",
                unit: "J·s",
                description: "Planck constant"
            },
            {
                symbol: "χ",
                name: "Ionization Potential",
                unit: "J",
                description: "Ionization energy, energy to remove electron"
            }
        ],
        constants: {
            m_e: 9.1093837139e-31,
            k: 1.380649e-23,
            h: 6.62607015e-34
        },
        relationships: {
            prerequisites: ["boltzmann_equation"],
            derivedFrom: [],
            relatedTo: ["boltzmann_equation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "saha equation",
            "ionization fraction",
            "ionization equilibrium",
            "calculate ionization"
        ]
    },
    {
        id: "einstein_coefficient",
        name: "Einstein Coefficient (Spontaneous Emission)",
        description: "Rate of spontaneous emission from excited atomic level. Fundamental quantum mechanics relation describing atomic transitions. Essential for spectroscopy, stellar atmospheres, and radiative processes. Describes probability of spontaneous photon emission from excited state.",
        equation: "A_21 = (64π⁴ ν³ / (3c³)) × |μ_21|²",
        concepts: ["einstein coefficient", "spontaneous emission", "atomic transitions", "quantum mechanics", "spectroscopy", "radiative processes", "transition probability"],
        keywords: ["einstein coefficient", "spontaneous emission", "atomic transitions", "quantum", "spectroscopy", "emission"],
        variables: [
            {
                symbol: "A_21",
                name: "Einstein A Coefficient",
                unit: "s⁻¹",
                description: "Spontaneous emission rate, transition probability"
            },
            {
                symbol: "ν",
                name: "Frequency",
                unit: "Hz",
                description: "Frequency of emitted photon"
            },
            {
                symbol: "μ_21",
                name: "Dipole Moment",
                unit: "C·m",
                description: "Transition dipole moment, matrix element"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8,
            π: Math.PI
        },
        relationships: {
            prerequisites: ["boltzmann_equation"],
            derivedFrom: [],
            relatedTo: ["boltzmann_equation", "planck_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "einstein coefficient",
            "spontaneous emission rate",
            "transition probability",
            "atomic emission rate"
        ]
    },
    {
        id: "extinction_relation",
        name: "Extinction Relation (Visual Magnitude)",
        description: "Extinction correction for visual magnitude due to interstellar dust. Fundamental relation accounting for dust absorption and scattering. Essential for distance measurements, stellar classification, and photometry. Extinction dims and reddens starlight passing through interstellar medium.",
        equation: "m_V = m_V,0 + A_V",
        concepts: ["extinction", "interstellar dust", "magnitude", "visual magnitude", "dust absorption", "reddening", "photometry", "distance measurement"],
        keywords: ["extinction", "dust", "magnitude", "visual", "interstellar", "absorption", "reddening"],
        variables: [
            {
                symbol: "m_V",
                name: "Observed Visual Magnitude",
                unit: "magnitude",
                description: "Apparent visual magnitude including extinction"
            },
            {
                symbol: "m_V,0",
                name: "Intrinsic Visual Magnitude",
                unit: "magnitude",
                description: "True visual magnitude without extinction"
            },
            {
                symbol: "A_V",
                name: "Visual Extinction",
                unit: "magnitude",
                description: "Extinction in visual band, absorption magnitude"
            }
        ],
        relationships: {
            prerequisites: ["distance_modulus"],
            derivedFrom: [],
            relatedTo: ["distance_modulus", "interstellar_reddening"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "extinction magnitude",
            "visual extinction",
            "dust extinction",
            "interstellar extinction"
        ]
    },
    {
        id: "dust_mass_approximate",
        name: "Mass of Interstellar Dust (Approximate)",
        description: "Approximate mass of interstellar dust in a region. Fundamental relation for interstellar medium studies. Essential for understanding dust content, star formation, and ISM composition. Dust mass scales with gas mass and metallicity.",
        equation: "M_dust ∝ M_gas × Z",
        concepts: ["dust mass", "interstellar dust", "interstellar medium", "ISM", "star formation", "metallicity", "gas mass"],
        keywords: ["dust", "mass", "interstellar", "ISM", "metallicity", "gas"],
        variables: [
            {
                symbol: "M_dust",
                name: "Dust Mass",
                unit: "kg",
                description: "Total mass of interstellar dust"
            },
            {
                symbol: "M_gas",
                name: "Gas Mass",
                unit: "kg",
                description: "Total mass of interstellar gas"
            },
            {
                symbol: "Z",
                name: "Metallicity",
                unit: "dimensionless",
                description: "Metallicity, abundance of heavy elements"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["dust_to_gas_ratio", "extinction_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "dust mass",
            "interstellar dust mass",
            "calculate dust mass",
            "dust content"
        ]
    },
    {
        id: "dust_to_gas_ratio",
        name: "Dust-to-Gas Mass Ratio (General)",
        description: "Ratio of dust mass to gas mass in interstellar medium. Fundamental ISM property describing dust content. Essential for interstellar medium studies, star formation, and galactic evolution. Typical value is about 0.01 (1% dust by mass).",
        equation: "M_dust / M_gas ≈ 0.01",
        concepts: ["dust to gas ratio", "interstellar medium", "ISM", "dust", "gas", "star formation", "metallicity"],
        keywords: ["dust", "gas", "ratio", "interstellar", "ISM", "mass ratio"],
        variables: [
            {
                symbol: "M_dust",
                name: "Dust Mass",
                unit: "kg",
                description: "Mass of interstellar dust"
            },
            {
                symbol: "M_gas",
                name: "Gas Mass",
                unit: "kg",
                description: "Mass of interstellar gas"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["dust_mass_approximate", "extinction_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "dust to gas ratio",
            "dust gas mass ratio",
            "ISM dust ratio",
            "dust fraction"
        ]
    },
    {
        id: "thermal_energy_cloud",
        name: "Thermal Energy of a Cloud",
        description: "Thermal energy content of an interstellar cloud. Fundamental energy component in ISM physics. Essential for cloud stability, gravitational collapse, and star formation. Thermal energy competes with gravitational energy in determining cloud stability.",
        equation: "E_thermal = (3/2) N k T",
        concepts: ["thermal energy", "interstellar cloud", "ISM", "cloud stability", "star formation", "gravitational collapse", "energy"],
        keywords: ["thermal energy", "cloud", "interstellar", "ISM", "stability", "star formation"],
        variables: [
            {
                symbol: "E_thermal",
                name: "Thermal Energy",
                unit: "J",
                description: "Total thermal energy of the cloud"
            },
            {
                symbol: "N",
                name: "Number of Particles",
                unit: "dimensionless",
                description: "Total number of particles in cloud"
            },
            {
                symbol: "k",
                name: "Boltzmann Constant",
                unit: "J/K",
                description: "Boltzmann constant"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of the cloud"
            }
        ],
        constants: {
            k: 1.380649e-23
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["jeans_length", "sound_speed"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "thermal energy cloud",
            "cloud thermal energy",
            "ISM thermal energy",
            "calculate thermal energy"
        ]
    },
    {
        id: "sound_speed",
        name: "Sound Speed in a Gas",
        description: "Speed of sound waves in a gas. Fundamental property describing wave propagation and pressure support. Essential for ISM physics, cloud dynamics, and star formation. Sound speed determines pressure support against gravitational collapse.",
        equation: "c_s = √(γ k T / μ m_H)",
        concepts: ["sound speed", "sound waves", "ISM", "pressure support", "cloud dynamics", "star formation", "wave propagation"],
        keywords: ["sound speed", "sound", "ISM", "pressure", "waves", "dynamics"],
        variables: [
            {
                symbol: "c_s",
                name: "Sound Speed",
                unit: "m/s",
                description: "Speed of sound in the gas"
            },
            {
                symbol: "γ",
                name: "Adiabatic Index",
                unit: "dimensionless",
                description: "Ratio of specific heats, adiabatic index"
            },
            {
                symbol: "k",
                name: "Boltzmann Constant",
                unit: "J/K",
                description: "Boltzmann constant"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of the gas"
            },
            {
                symbol: "μ",
                name: "Mean Molecular Weight",
                unit: "dimensionless",
                description: "Average mass per particle in units of hydrogen mass"
            },
            {
                symbol: "m_H",
                name: "Hydrogen Mass",
                unit: "kg",
                description: "Mass of hydrogen atom"
            }
        ],
        constants: {
            k: 1.380649e-23,
            m_H: 1.6735575e-27
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["thermal_energy_cloud", "jeans_length"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "sound speed",
            "calculate sound speed",
            "gas sound speed",
            "ISM sound speed"
        ]
    },
    {
        id: "magnetic_flux_freezing",
        name: "Magnetic Flux (Flux Freezing)",
        description: "Magnetic flux conservation in highly conducting plasma (flux freezing). Fundamental MHD principle describing magnetic field behavior in plasmas. Essential for ISM physics, star formation, and magnetohydrodynamics. In highly conducting plasma, magnetic field lines are frozen into the fluid.",
        equation: "Φ_B = B × A = constant",
        concepts: ["magnetic flux", "flux freezing", "magnetohydrodynamics", "MHD", "ISM", "plasma", "magnetic field", "star formation"],
        keywords: ["magnetic flux", "flux freezing", "MHD", "magnetohydrodynamics", "plasma", "magnetic field"],
        variables: [
            {
                symbol: "Φ_B",
                name: "Magnetic Flux",
                unit: "Wb",
                description: "Magnetic flux, magnetic field times area"
            },
            {
                symbol: "B",
                name: "Magnetic Field",
                unit: "Tesla",
                description: "Magnetic field strength"
            },
            {
                symbol: "A",
                name: "Area",
                unit: "m²",
                description: "Area perpendicular to magnetic field"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["magnetic_energy_density"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "magnetic flux",
            "flux freezing",
            "magnetic flux conservation",
            "frozen flux"
        ]
    },
    {
        id: "bremsstrahlung_luminosity",
        name: "Bremsstrahlung Luminosity (Thermal Bremsstrahlung)",
        description: "Luminosity from thermal bremsstrahlung radiation. Fundamental emission mechanism in hot plasmas. Essential for HII regions, supernova remnants, and high-energy astrophysics. Bremsstrahlung occurs when free electrons are decelerated by ions.",
        equation: "L_br ∝ n_e n_i T^(1/2) V",
        concepts: ["bremsstrahlung", "thermal bremsstrahlung", "free-free emission", "HII regions", "plasma", "emission", "supernova remnants"],
        keywords: ["bremsstrahlung", "free-free", "emission", "HII", "plasma", "thermal"],
        variables: [
            {
                symbol: "L_br",
                name: "Bremsstrahlung Luminosity",
                unit: "W",
                description: "Luminosity from bremsstrahlung radiation"
            },
            {
                symbol: "n_e",
                name: "Electron Density",
                unit: "m⁻³",
                description: "Number density of free electrons"
            },
            {
                symbol: "n_i",
                name: "Ion Density",
                unit: "m⁻³",
                description: "Number density of ions"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of the plasma"
            },
            {
                symbol: "V",
                name: "Volume",
                unit: "m³",
                description: "Volume of emitting region"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["luminosity", "stromgren_radius"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "bremsstrahlung luminosity",
            "free-free emission",
            "thermal bremsstrahlung",
            "bremsstrahlung radiation"
        ]
    },
    {
        id: "synchrotron_frequency",
        name: "Characteristic Synchrotron Frequency",
        description: "Characteristic frequency of synchrotron radiation from relativistic electrons. Fundamental frequency for synchrotron emission. Essential for radio astronomy, high-energy astrophysics, and particle acceleration. Frequency depends on electron energy and magnetic field strength.",
        equation: "ν_syn = (3e B / (4π m_e c)) × γ²",
        concepts: ["synchrotron", "synchrotron frequency", "radio astronomy", "relativistic electrons", "magnetic field", "particle acceleration"],
        keywords: ["synchrotron", "frequency", "radio", "relativistic", "electrons", "magnetic field"],
        variables: [
            {
                symbol: "ν_syn",
                name: "Synchrotron Frequency",
                unit: "Hz",
                description: "Characteristic synchrotron frequency"
            },
            {
                symbol: "B",
                name: "Magnetic Field",
                unit: "Tesla",
                description: "Magnetic field strength"
            },
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Relativistic Lorentz factor of electron"
            },
            {
                symbol: "e",
                name: "Elementary Charge",
                unit: "C",
                description: "Charge of electron"
            },
            {
                symbol: "m_e",
                name: "Electron Mass",
                unit: "kg",
                description: "Mass of electron"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            e: 1.602176634e-19,
            m_e: 9.1093837139e-31,
            c: 2.99792458e8,
            π: Math.PI
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["synchrotron_power", "synchrotron_cooling_timescale"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "synchrotron frequency",
            "characteristic synchrotron frequency",
            "calculate synchrotron frequency",
            "synchrotron emission frequency"
        ]
    },
    {
        id: "stromgren_radius",
        name: "Strömgren Radius (Size of H II Region)",
        description: "Radius of HII region around an ionizing source. Fundamental size scale for photoionized regions. Essential for HII region physics, star formation, and ISM structure. Strömgren sphere is the region where ionization balances recombination.",
        equation: "R_S = (3 N_ion / (4π n² α))^(1/3)",
        concepts: ["stromgren radius", "HII region", "photoionization", "ionization", "recombination", "ISM", "star formation"],
        keywords: ["stromgren", "HII", "ionization", "photoionization", "recombination", "ISM"],
        variables: [
            {
                symbol: "R_S",
                name: "Strömgren Radius",
                unit: "meters",
                description: "Radius of HII region, Strömgren sphere radius"
            },
            {
                symbol: "N_ion",
                name: "Ionizing Photon Rate",
                unit: "s⁻¹",
                description: "Rate of ionizing photons emitted"
            },
            {
                symbol: "n",
                name: "Number Density",
                unit: "m⁻³",
                description: "Number density of atoms"
            },
            {
                symbol: "α",
                name: "Recombination Coefficient",
                unit: "m³/s",
                description: "Recombination rate coefficient"
            }
        ],
        constants: {
            π: Math.PI
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["recombination_time", "bremsstrahlung_luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "stromgren radius",
            "HII region size",
            "ionization radius",
            "photoionization radius"
        ]
    },
    {
        id: "recombination_time",
        name: "Recombination Time",
        description: "Characteristic time for recombination in ionized gas. Fundamental timescale for HII region evolution. Essential for HII region physics, photoionization, and ISM evolution. Describes how long it takes for ionized gas to recombine.",
        equation: "t_rec = 1 / (n α)",
        concepts: ["recombination", "recombination time", "HII region", "ionization", "timescale", "ISM"],
        keywords: ["recombination", "time", "HII", "ionization", "timescale"],
        variables: [
            {
                symbol: "t_rec",
                name: "Recombination Time",
                unit: "seconds",
                description: "Characteristic recombination timescale"
            },
            {
                symbol: "n",
                name: "Number Density",
                unit: "m⁻³",
                description: "Number density of particles"
            },
            {
                symbol: "α",
                name: "Recombination Coefficient",
                unit: "m³/s",
                description: "Recombination rate coefficient"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["stromgren_radius"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "recombination time",
            "calculate recombination time",
            "HII recombination",
            "ionization timescale"
        ]
    },
    {
        id: "total_mass_cloud",
        name: "Total Mass of a Cloud (General)",
        description: "Total mass of an interstellar cloud. Fundamental property for cloud stability and star formation. Essential for ISM physics, gravitational collapse, and star formation studies. Mass determines whether cloud can collapse under gravity.",
        equation: "M = ∫ ρ dV",
        concepts: ["cloud mass", "interstellar cloud", "ISM", "star formation", "gravitational collapse", "cloud stability"],
        keywords: ["cloud", "mass", "interstellar", "ISM", "star formation", "collapse"],
        variables: [
            {
                symbol: "M",
                name: "Total Mass",
                unit: "kg",
                description: "Total mass of the cloud"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Mass density"
            },
            {
                symbol: "V",
                name: "Volume",
                unit: "m³",
                description: "Volume of the cloud"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["jeans_length", "thermal_energy_cloud"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "cloud mass",
            "total mass cloud",
            "interstellar cloud mass",
            "calculate cloud mass"
        ]
    },
    {
        id: "column_density",
        name: "Column Density",
        description: "Number of particles per unit area along a line of sight. Fundamental quantity for absorption and emission studies. Essential for ISM physics, spectroscopy, and extinction studies. Column density determines optical depth and absorption strength.",
        equation: "N = ∫ n ds",
        concepts: ["column density", "ISM", "absorption", "spectroscopy", "optical depth", "line of sight"],
        keywords: ["column density", "ISM", "absorption", "spectroscopy", "optical depth"],
        variables: [
            {
                symbol: "N",
                name: "Column Density",
                unit: "m⁻²",
                description: "Number of particles per unit area, column density"
            },
            {
                symbol: "n",
                name: "Number Density",
                unit: "m⁻³",
                description: "Number density of particles"
            },
            {
                symbol: "s",
                name: "Path Length",
                unit: "meters",
                description: "Distance along line of sight"
            }
        ],
        relationships: {
            prerequisites: ["optical_depth"],
            derivedFrom: [],
            relatedTo: ["optical_depth", "extinction_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "column density",
            "calculate column density",
            "line of sight density",
            "particle column"
        ]
    },
    {
        id: "gas_kinetic_temperature",
        name: "Gas Kinetic Temperature",
        description: "Kinetic temperature of gas from thermal motion. Fundamental temperature measure for ISM and stellar atmospheres. Essential for ISM physics, stellar atmospheres, and spectroscopy. Kinetic temperature describes random motion of particles.",
        equation: "T_kin = (2/3) × (E_kin / k)",
        concepts: ["kinetic temperature", "gas temperature", "ISM", "stellar atmosphere", "thermal motion", "temperature"],
        keywords: ["kinetic temperature", "gas temperature", "ISM", "thermal", "temperature"],
        variables: [
            {
                symbol: "T_kin",
                name: "Kinetic Temperature",
                unit: "Kelvin",
                description: "Kinetic temperature from thermal motion"
            },
            {
                symbol: "E_kin",
                name: "Kinetic Energy",
                unit: "J",
                description: "Average kinetic energy per particle"
            },
            {
                symbol: "k",
                name: "Boltzmann Constant",
                unit: "J/K",
                description: "Boltzmann constant"
            }
        ],
        constants: {
            k: 1.380649e-23
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["thermal_energy_cloud", "sound_speed"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "kinetic temperature",
            "gas kinetic temperature",
            "calculate kinetic temperature",
            "thermal temperature"
        ]
    },
    // ============================================================
    // GALACTIC DYNAMICS & DARK MATTER FORMULAS (45-61)
    // ============================================================
    {
        id: "galaxy_rotation_velocity",
        name: "Galaxy Rotation Velocity (Non-Keplerian)",
        description: "Rotation velocity in galaxy (non-Keplerian due to dark matter). Fundamental galactic dynamics relation describing flat rotation curves. Essential for dark matter studies, galactic structure, and rotation curve analysis. Dark matter halo causes rotation velocity to remain constant with radius.",
        equation: "v_rot = √(G M(r) / r)",
        concepts: ["galaxy rotation", "rotation curve", "dark matter", "galactic dynamics", "rotation velocity", "dark matter halo", "flat rotation curve"],
        keywords: ["rotation", "galaxy", "dark matter", "rotation curve", "galactic", "velocity"],
        variables: [
            {
                symbol: "v_rot",
                name: "Rotation Velocity",
                unit: "m/s",
                description: "Orbital velocity in galaxy, rotation speed"
            },
            {
                symbol: "M(r)",
                name: "Mass Enclosed",
                unit: "kg",
                description: "Total mass within radius r, including dark matter"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from galactic center"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["orbital_velocity"],
            derivedFrom: ["orbital_velocity"],
            relatedTo: ["orbital_velocity", "mass_enclosed_rotation", "dark_matter_density"],
            uses: [],
            generalizes: [],
            specializes: ["orbital_velocity"]
        },
        questionPatterns: [
            "galaxy rotation velocity",
            "rotation curve",
            "galactic rotation",
            "rotation speed galaxy"
        ]
    },
    {
        id: "orbital_period_general",
        name: "Orbital Period (General)",
        description: "Orbital period for any bound orbit. Fundamental dynamical timescale. Essential for galactic dynamics, binary systems, and orbital mechanics. Period depends on semi-major axis and total mass.",
        equation: "P = 2π √(a³ / (G M))",
        concepts: ["orbital period", "orbital mechanics", "galactic dynamics", "binary systems", "dynamical timescale"],
        keywords: ["orbital period", "period", "orbit", "galactic", "binary", "dynamical"],
        variables: [
            {
                symbol: "P",
                name: "Orbital Period",
                unit: "seconds",
                description: "Time for one complete orbit"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of orbit"
            },
            {
                symbol: "M",
                name: "Total Mass",
                unit: "kg",
                description: "Total mass of system"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11,
            π: Math.PI
        },
        relationships: {
            prerequisites: ["kepler_third_law"],
            derivedFrom: ["kepler_third_law"],
            relatedTo: ["kepler_third_law", "galaxy_rotation_velocity"],
            uses: [],
            generalizes: [],
            specializes: ["kepler_third_law"]
        },
        questionPatterns: [
            "orbital period",
            "calculate orbital period",
            "period of orbit",
            "orbital timescale"
        ]
    },
    {
        id: "mass_enclosed_rotation",
        name: "Mass enclosed M(r) (from Rotation Curve)",
        description: "Mass enclosed within radius r from rotation curve. Fundamental method for measuring galactic mass distribution. Essential for dark matter studies, galactic structure, and mass determination. Rotation curve directly measures enclosed mass including dark matter.",
        equation: "M(r) = v² r / G",
        concepts: ["mass enclosed", "rotation curve", "dark matter", "galactic mass", "mass distribution", "galactic structure"],
        keywords: ["mass enclosed", "rotation curve", "dark matter", "galactic mass", "mass distribution"],
        variables: [
            {
                symbol: "M(r)",
                name: "Mass Enclosed",
                unit: "kg",
                description: "Total mass within radius r"
            },
            {
                symbol: "v",
                name: "Rotation Velocity",
                unit: "m/s",
                description: "Orbital velocity at radius r"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from center"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["galaxy_rotation_velocity"],
            derivedFrom: ["galaxy_rotation_velocity"],
            relatedTo: ["galaxy_rotation_velocity", "dark_matter_density"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "mass enclosed from rotation",
            "galactic mass from rotation curve",
            "calculate enclosed mass",
            "mass within radius"
        ]
    },
    {
        id: "surface_brightness",
        name: "Surface Brightness (Exponential Disk)",
        description: "Surface brightness profile for exponential disk galaxy. Fundamental galactic structure relation describing stellar distribution. Essential for galactic structure, disk galaxies, and surface photometry. Exponential profile is characteristic of disk galaxies.",
        equation: "I(r) = I_0 * exp(-r / h)",
        concepts: ["surface brightness", "exponential disk", "galactic structure", "disk galaxy", "stellar distribution", "photometry"],
        keywords: ["surface brightness", "exponential", "disk", "galactic", "structure", "photometry"],
        variables: [
            {
                symbol: "I(r)",
                name: "Surface Brightness",
                unit: "W/m²",
                description: "Surface brightness at radius r"
            },
            {
                symbol: "I_0",
                name: "Central Surface Brightness",
                unit: "W/m²",
                description: "Surface brightness at center"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from galactic center"
            },
            {
                symbol: "h",
                name: "Scale Length",
                unit: "meters",
                description: "Exponential scale length, characteristic radius"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "surface brightness",
            "exponential disk",
            "galactic surface brightness",
            "disk brightness profile"
        ]
    },
    {
        id: "globular_cluster_mass",
        name: "Mass of a Globular Cluster (Virial Theorem Applied)",
        description: "Mass determination for globular cluster using virial theorem. Fundamental method for measuring cluster masses. Essential for stellar dynamics, cluster evolution, and mass-to-light ratios. Virial theorem relates kinetic and potential energy.",
        equation: "M = (3 σ² R) / G",
        concepts: ["globular cluster", "virial theorem", "cluster mass", "stellar dynamics", "mass determination", "velocity dispersion"],
        keywords: ["globular cluster", "virial", "cluster mass", "stellar dynamics", "velocity dispersion"],
        variables: [
            {
                symbol: "M",
                name: "Cluster Mass",
                unit: "kg",
                description: "Total mass of globular cluster"
            },
            {
                symbol: "σ",
                name: "Velocity Dispersion",
                unit: "m/s",
                description: "Velocity dispersion, spread in velocities"
            },
            {
                symbol: "R",
                name: "Cluster Radius",
                unit: "meters",
                description: "Characteristic radius of cluster"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["total_energy_virial"],
            derivedFrom: ["total_energy_virial"],
            relatedTo: ["total_energy_virial", "velocity_dispersion"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "globular cluster mass",
            "cluster mass virial",
            "calculate cluster mass",
            "virial mass cluster"
        ]
    },
    {
        id: "dark_matter_density",
        name: "Dark Matter Density Profile (General NFW Form ρ ∝ r⁻¹)",
        description: "Dark matter density profile (NFW form at small radii). Fundamental dark matter halo profile describing density distribution. Essential for dark matter studies, galactic structure, and cosmological simulations. NFW profile is characteristic of cold dark matter halos.",
        equation: "ρ_DM ∝ r⁻¹",
        concepts: ["dark matter", "density profile", "NFW profile", "dark matter halo", "galactic structure", "cosmology"],
        keywords: ["dark matter", "density profile", "NFW", "halo", "galactic"],
        variables: [
            {
                symbol: "ρ_DM",
                name: "Dark Matter Density",
                unit: "kg/m³",
                description: "Dark matter density at radius r"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from halo center"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["galaxy_rotation_velocity", "mass_enclosed_rotation", "dark_matter_mass_fraction"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "dark matter density",
            "NFW profile",
            "dark matter halo",
            "dark matter distribution"
        ]
    },
    {
        id: "dark_matter_mass_fraction",
        name: "Dark Matter Mass Fraction (Approximate in a Halo)",
        description: "Fraction of total mass in dark matter halo. Fundamental property describing dark matter dominance. Essential for dark matter studies, galactic structure, and cosmology. Dark matter typically dominates total mass in galaxies.",
        equation: "f_DM = M_DM / (M_DM + M_baryon) ≈ 0.9",
        concepts: ["dark matter", "mass fraction", "dark matter halo", "galactic mass", "baryonic matter", "cosmology"],
        keywords: ["dark matter", "mass fraction", "halo", "baryonic", "galactic"],
        variables: [
            {
                symbol: "f_DM",
                name: "Dark Matter Fraction",
                unit: "dimensionless",
                description: "Fraction of mass in dark matter"
            },
            {
                symbol: "M_DM",
                name: "Dark Matter Mass",
                unit: "kg",
                description: "Mass in dark matter"
            },
            {
                symbol: "M_baryon",
                name: "Baryonic Mass",
                unit: "kg",
                description: "Mass in baryonic matter (stars, gas)"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["dark_matter_density", "mass_enclosed_rotation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "dark matter fraction",
            "dark matter mass fraction",
            "dark matter dominance",
            "fraction dark matter"
        ]
    },
    {
        id: "velocity_dispersion",
        name: "Velocity Dispersion (General)",
        description: "Velocity dispersion in stellar system. Fundamental measure of random motion and kinetic energy. Essential for stellar dynamics, cluster physics, and mass determination. Velocity dispersion measures spread in velocities.",
        equation: "σ² = <(v - <v>)²>",
        concepts: ["velocity dispersion", "stellar dynamics", "random motion", "kinetic energy", "cluster physics", "mass determination"],
        keywords: ["velocity dispersion", "dispersion", "stellar dynamics", "random motion", "kinetic"],
        variables: [
            {
                symbol: "σ",
                name: "Velocity Dispersion",
                unit: "m/s",
                description: "Velocity dispersion, spread in velocities"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Individual particle velocity"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["globular_cluster_mass", "m_sigma_relation", "two_body_relaxation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "velocity dispersion",
            "calculate velocity dispersion",
            "stellar velocity dispersion",
            "dispersion velocity"
        ]
    },
    {
        id: "two_body_relaxation",
        name: "Two-Body Relaxation Time",
        description: "Timescale for two-body encounters to randomize velocities. Fundamental timescale for stellar dynamics and cluster evolution. Essential for cluster physics, stellar dynamics, and relaxation processes. Two-body encounters cause velocity distribution to evolve toward equilibrium.",
        equation: "t_relax ∝ (N / ln N) × t_cross",
        concepts: ["two-body relaxation", "relaxation time", "stellar dynamics", "cluster evolution", "encounters", "equilibrium"],
        keywords: ["relaxation", "two-body", "stellar dynamics", "cluster", "encounters", "equilibrium"],
        variables: [
            {
                symbol: "t_relax",
                name: "Relaxation Time",
                unit: "seconds",
                description: "Two-body relaxation timescale"
            },
            {
                symbol: "N",
                name: "Number of Stars",
                unit: "dimensionless",
                description: "Number of stars in system"
            },
            {
                symbol: "t_cross",
                name: "Crossing Time",
                unit: "seconds",
                description: "Dynamical crossing time"
            }
        ],
        relationships: {
            prerequisites: ["crossing_time"],
            derivedFrom: [],
            relatedTo: ["crossing_time", "velocity_dispersion"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "relaxation time",
            "two-body relaxation",
            "stellar relaxation",
            "cluster relaxation"
        ]
    },
    {
        id: "crossing_time",
        name: "Crossing Time (Dynamical Time)",
        description: "Characteristic time to cross a stellar system. Fundamental dynamical timescale. Essential for stellar dynamics, cluster evolution, and timescale comparisons. Crossing time sets basic timescale for system evolution.",
        equation: "t_cross = R / σ",
        concepts: ["crossing time", "dynamical time", "stellar dynamics", "cluster", "timescale", "evolution"],
        keywords: ["crossing time", "dynamical time", "stellar dynamics", "cluster", "timescale"],
        variables: [
            {
                symbol: "t_cross",
                name: "Crossing Time",
                unit: "seconds",
                description: "Time to cross system, dynamical time"
            },
            {
                symbol: "R",
                name: "System Radius",
                unit: "meters",
                description: "Characteristic radius of system"
            },
            {
                symbol: "σ",
                name: "Velocity Dispersion",
                unit: "m/s",
                description: "Velocity dispersion"
            }
        ],
        relationships: {
            prerequisites: ["velocity_dispersion"],
            derivedFrom: [],
            relatedTo: ["velocity_dispersion", "two_body_relaxation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "crossing time",
            "dynamical time",
            "calculate crossing time",
            "system crossing time"
        ]
    },
    {
        id: "m_sigma_relation",
        name: "M-σ Relation (SMBH Mass to Bulge Velocity Dispersion)",
        description: "Relation between supermassive black hole mass and bulge velocity dispersion. Fundamental correlation in galactic nuclei. Essential for black hole growth, galaxy evolution, and co-evolution studies. SMBH mass correlates with host galaxy bulge properties.",
        equation: "M_BH ∝ σ^α",
        concepts: ["M-sigma relation", "supermassive black hole", "SMBH", "velocity dispersion", "galactic bulge", "black hole mass", "galaxy evolution"],
        keywords: ["M-sigma", "supermassive black hole", "SMBH", "velocity dispersion", "bulge", "black hole"],
        variables: [
            {
                symbol: "M_BH",
                name: "Black Hole Mass",
                unit: "kg",
                description: "Mass of supermassive black hole"
            },
            {
                symbol: "σ",
                name: "Velocity Dispersion",
                unit: "m/s",
                description: "Velocity dispersion of galactic bulge"
            },
            {
                symbol: "α",
                name: "Power Law Index",
                unit: "dimensionless",
                description: "Power law exponent, typically ~4-5"
            }
        ],
        relationships: {
            prerequisites: ["velocity_dispersion", "schwarzschild_radius"],
            derivedFrom: [],
            relatedTo: ["velocity_dispersion", "schwarzschild_radius", "schwarzschild_radius_smbh"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "M-sigma relation",
            "black hole mass velocity dispersion",
            "SMBH mass relation",
            "M sigma relation"
        ]
    },
    {
        id: "schwarzschild_radius_smbh",
        name: "Schwarzschild Radius for SMBH (Same Form)",
        description: "Event horizon radius for supermassive black hole. Same formula as stellar-mass black holes, just larger scale. Essential for AGN physics, quasar studies, and black hole observations. Event horizon size scales with mass.",
        equation: "R_s = 2 G M_BH / c²",
        concepts: ["schwarzschild radius", "supermassive black hole", "SMBH", "event horizon", "AGN", "quasar"],
        keywords: ["schwarzschild", "supermassive black hole", "SMBH", "event horizon", "AGN"],
        variables: [
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius"
            },
            {
                symbol: "M_BH",
                name: "Black Hole Mass",
                unit: "kg",
                description: "Mass of supermassive black hole"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: ["schwarzschild_radius"],
            relatedTo: ["schwarzschild_radius", "m_sigma_relation"],
            uses: [],
            generalizes: [],
            specializes: ["schwarzschild_radius"]
        },
        questionPatterns: [
            "SMBH schwarzschild radius",
            "supermassive black hole radius",
            "AGN event horizon",
            "quasar schwarzschild radius"
        ]
    },
    {
        id: "tully_fisher_relation",
        name: "Tully-Fisher Relation (Spiral Galaxies)",
        description: "Relation between rotation velocity and luminosity in spiral galaxies. Fundamental distance indicator and scaling relation. Essential for extragalactic distance measurements, galactic structure, and cosmology. Rotation velocity correlates with total luminosity.",
        equation: "L ∝ v_rot^α",
        concepts: ["tully-fisher", "spiral galaxy", "rotation velocity", "luminosity", "distance indicator", "scaling relation", "extragalactic"],
        keywords: ["tully-fisher", "spiral", "rotation", "luminosity", "distance", "scaling"],
        variables: [
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Total luminosity of spiral galaxy"
            },
            {
                symbol: "v_rot",
                name: "Rotation Velocity",
                unit: "m/s",
                description: "Maximum rotation velocity"
            },
            {
                symbol: "α",
                name: "Power Law Index",
                unit: "dimensionless",
                description: "Power law exponent, typically ~3-4"
            }
        ],
        relationships: {
            prerequisites: ["luminosity", "galaxy_rotation_velocity"],
            derivedFrom: [],
            relatedTo: ["luminosity", "galaxy_rotation_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "tully-fisher relation",
            "spiral galaxy luminosity",
            "rotation luminosity relation",
            "tully fisher"
        ]
    },
    {
        id: "faber_jackson_relation",
        name: "Faber-Jackson Relation (Elliptical Galaxies)",
        description: "Relation between velocity dispersion and luminosity in elliptical galaxies. Fundamental distance indicator and scaling relation. Essential for extragalactic distance measurements, galactic structure, and elliptical galaxy studies. Velocity dispersion correlates with total luminosity.",
        equation: "L ∝ σ^α",
        concepts: ["faber-jackson", "elliptical galaxy", "velocity dispersion", "luminosity", "distance indicator", "scaling relation", "extragalactic"],
        keywords: ["faber-jackson", "elliptical", "velocity dispersion", "luminosity", "distance", "scaling"],
        variables: [
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Total luminosity of elliptical galaxy"
            },
            {
                symbol: "σ",
                name: "Velocity Dispersion",
                unit: "m/s",
                description: "Central velocity dispersion"
            },
            {
                symbol: "α",
                name: "Power Law Index",
                unit: "dimensionless",
                description: "Power law exponent, typically ~4"
            }
        ],
        relationships: {
            prerequisites: ["luminosity", "velocity_dispersion"],
            derivedFrom: [],
            relatedTo: ["luminosity", "velocity_dispersion", "tully_fisher_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "faber-jackson relation",
            "elliptical galaxy luminosity",
            "velocity dispersion luminosity",
            "faber jackson"
        ]
    },
    {
        id: "jeans_length",
        name: "Jeans Length (Gravitational Stability)",
        description: "Critical length scale for gravitational instability. Fundamental scale for cloud collapse and star formation. Essential for ISM physics, star formation, and gravitational collapse. Clouds larger than Jeans length are gravitationally unstable.",
        equation: "λ_J = √(π c_s² / (G ρ))",
        concepts: ["jeans length", "gravitational instability", "cloud collapse", "star formation", "ISM", "stability", "critical scale"],
        keywords: ["jeans length", "gravitational instability", "collapse", "star formation", "ISM", "stability"],
        variables: [
            {
                symbol: "λ_J",
                name: "Jeans Length",
                unit: "meters",
                description: "Critical length for gravitational instability"
            },
            {
                symbol: "c_s",
                name: "Sound Speed",
                unit: "m/s",
                description: "Sound speed in the gas"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "ρ",
                name: "Density",
                unit: "kg/m³",
                description: "Mass density"
            }
        ],
        constants: {
            G: 6.67430e-11,
            π: Math.PI
        },
        relationships: {
            prerequisites: ["sound_speed"],
            derivedFrom: [],
            relatedTo: ["sound_speed", "thermal_energy_cloud", "jeans_mass"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "jeans length",
            "gravitational instability",
            "cloud collapse scale",
            "critical length collapse"
        ]
    },
    {
        id: "gravitational_potential_general",
        name: "Gravitational Potential (General)",
        description: "Gravitational potential energy per unit mass. Fundamental quantity in gravitational dynamics. Essential for orbital mechanics, galactic dynamics, and gravitational physics. Potential determines gravitational force and orbital motion.",
        equation: "Φ = -G M / r",
        concepts: ["gravitational potential", "potential energy", "orbital mechanics", "galactic dynamics", "gravity", "force"],
        keywords: ["gravitational potential", "potential", "orbital", "galactic", "gravity"],
        variables: [
            {
                symbol: "Φ",
                name: "Gravitational Potential",
                unit: "J/kg",
                description: "Gravitational potential energy per unit mass"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass creating the potential"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from mass"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["orbital_energy", "escape_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "gravitational potential",
            "calculate potential",
            "potential energy",
            "gravitational potential energy"
        ]
    },
    {
        id: "toomre_q_criterion",
        name: "Toomre Q Criterion (Disk Stability, simplified)",
        description: "Criterion for gravitational stability of rotating disk. Fundamental stability condition for galactic disks and protoplanetary disks. Essential for disk stability, star formation, and planet formation. Q > 1 means disk is stable against axisymmetric perturbations.",
        equation: "Q = (σ_R κ) / (π G Σ)",
        concepts: ["toomre Q", "disk stability", "galactic disk", "protoplanetary disk", "gravitational stability", "epicyclic frequency"],
        keywords: ["toomre", "Q criterion", "disk stability", "galactic", "protoplanetary", "stability"],
        variables: [
            {
                symbol: "Q",
                name: "Toomre Q Parameter",
                unit: "dimensionless",
                description: "Stability parameter, Q > 1 is stable"
            },
            {
                symbol: "σ_R",
                name: "Radial Velocity Dispersion",
                unit: "m/s",
                description: "Velocity dispersion in radial direction"
            },
            {
                symbol: "κ",
                name: "Epicyclic Frequency",
                unit: "rad/s",
                description: "Epicyclic frequency, orbital frequency"
            },
            {
                symbol: "Σ",
                name: "Surface Density",
                unit: "kg/m²",
                description: "Surface mass density of disk"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11,
            π: Math.PI
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["jeans_length", "galaxy_rotation_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "toomre Q",
            "disk stability",
            "Q criterion",
            "galactic disk stability"
        ]
    },
    // ============================================================
    // BASIC GRAVITY & MECHANICS FORMULAS
    // ============================================================
    {
        id: "newton_gravitational_force",
        name: "Newton's Law of Universal Gravitation",
        description: "Gravitational force between two masses: F = G m₁ m₂ / r² (same as F = GMm/r² in two-body notation). Core for orbital mechanics.",
        equation: "F = G * m₁ * m₂ / r^2",
        concepts: ["newton", "gravitational force", "gravity", "universal gravitation", "force", "attraction", "orbital mechanics"],
        keywords: ["newton", "gravitational force", "gravity", "force", "attraction", "universal"],
        variables: [
            {
                symbol: "F",
                name: "Gravitational Force",
                unit: "N",
                description: "Force of gravitational attraction between two masses"
            },
            {
                symbol: "m₁",
                name: "Mass 1",
                unit: "kg",
                description: "Mass of first object"
            },
            {
                symbol: "m₂",
                name: "Mass 2",
                unit: "kg",
                description: "Mass of second object"
            },
            {
                symbol: "r",
                name: "Distance",
                unit: "meters",
                description: "Distance between centers of masses"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["surface_gravity", "orbital_velocity", "escape_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "gravitational force",
            "newton law gravitation",
            "force between masses",
            "calculate gravitational force"
        ]
    },
    {
        id: "weight",
        name: "Weight",
        description: "Weight of an object due to gravity. Force of gravity on an object. Essential for mechanics, planetary science, and gravitational physics. Weight equals mass times gravitational acceleration.",
        equation: "w = mg",
        concepts: ["weight", "gravity", "force", "gravitational force", "mass", "acceleration"],
        keywords: ["weight", "gravity", "force", "mass", "gravitational"],
        variables: [
            {
                symbol: "w",
                name: "Weight",
                unit: "N",
                description: "Weight, force of gravity on object"
            },
            {
                symbol: "m",
                name: "Mass",
                unit: "kg",
                description: "Mass of the object"
            },
            {
                symbol: "g",
                name: "Gravitational Acceleration",
                unit: "m/s²",
                description: "Acceleration due to gravity, gravitational field strength"
            }
        ],
        relationships: {
            prerequisites: ["surface_gravity"],
            derivedFrom: ["surface_gravity"],
            relatedTo: ["surface_gravity", "newton_gravitational_force"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "weight",
            "calculate weight",
            "force of gravity",
            "gravitational force on object"
        ]
    },
    {
        id: "centripetal_force",
        name: "Centripetal Force",
        description: "Force required for circular motion. Force directed toward center of circular path. Essential for orbital mechanics, circular motion, and rotational dynamics. Centripetal force keeps objects in circular orbits.",
        equation: "F = mv² / r",
        concepts: ["centripetal force", "circular motion", "orbital mechanics", "force", "rotation", "centripetal"],
        keywords: ["centripetal", "force", "circular motion", "orbit", "rotation"],
        variables: [
            {
                symbol: "F",
                name: "Centripetal Force",
                unit: "N",
                description: "Force toward center, centripetal force"
            },
            {
                symbol: "m",
                name: "Mass",
                unit: "kg",
                description: "Mass of object in circular motion"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Tangential velocity, orbital speed"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radius of circular path, orbital radius"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["orbital_velocity", "centripetal_acceleration"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "centripetal force",
            "force for circular motion",
            "calculate centripetal force",
            "circular motion force"
        ]
    },
    {
        id: "centripetal_acceleration",
        name: "Centripetal Acceleration",
        description: "Acceleration toward center in circular motion. Acceleration required for circular path. Essential for orbital mechanics, circular motion, and rotational dynamics. Centripetal acceleration keeps objects moving in circles.",
        equation: "a_c = v² / r",
        concepts: ["centripetal acceleration", "circular motion", "orbital mechanics", "acceleration", "rotation"],
        keywords: ["centripetal acceleration", "circular motion", "acceleration", "orbit"],
        variables: [
            {
                symbol: "a_c",
                name: "Centripetal Acceleration",
                unit: "m/s²",
                description: "Acceleration toward center"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Tangential velocity, orbital speed"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radius of circular path"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["centripetal_force", "orbital_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "centripetal acceleration",
            "acceleration circular motion",
            "calculate centripetal acceleration",
            "circular acceleration"
        ]
    },
    {
        id: "period_circular",
        name: "Period for Circular Motion",
        description: "Period of circular motion. Time for one complete revolution. Essential for orbital mechanics, circular motion, and rotational dynamics. Period relates to velocity and radius.",
        equation: "P = 2πr / v",
        concepts: ["period", "circular motion", "orbital period", "revolution", "rotation"],
        keywords: ["period", "circular", "revolution", "rotation", "orbital period"],
        variables: [
            {
                symbol: "P",
                name: "Period",
                unit: "seconds",
                description: "Time for one complete revolution"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radius of circular path"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Tangential velocity, orbital speed"
            }
        ],
        constants: {
            π: Math.PI
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["kepler_third_law", "orbital_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "period circular motion",
            "revolution period",
            "time for one orbit",
            "circular period"
        ]
    },
    {
        id: "gravitational_potential_energy",
        name: "Gravitational Potential Energy",
        description: "Potential energy in gravitational field. Energy stored due to position in gravitational field. Essential for orbital mechanics, escape velocity, and energy conservation. Negative because work is needed to separate masses.",
        equation: "U = -GMm / r",
        concepts: ["gravitational potential energy", "potential energy", "gravity", "energy", "orbital mechanics"],
        keywords: ["potential energy", "gravitational", "energy", "gravity"],
        variables: [
            {
                symbol: "U",
                name: "Potential Energy",
                unit: "J",
                description: "Gravitational potential energy"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of central body"
            },
            {
                symbol: "m",
                name: "Object Mass",
                unit: "kg",
                description: "Mass of object in field"
            },
            {
                symbol: "r",
                name: "Distance",
                unit: "meters",
                description: "Distance from center of mass"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["orbital_energy", "escape_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "gravitational potential energy",
            "potential energy gravity",
            "calculate potential energy",
            "energy in gravitational field"
        ]
    },
    {
        id: "kinetic_energy_translational",
        name: "Kinetic Energy",
        description: "Hierarchy: Classical mechanics → Energy accounting → Orbital mechanics.\n\n(1) Physical meaning: K = ½mv² is energy stored in bulk motion (non-relativistic).\n\n(2) When to use: Impact scenarios, linking speeds to energies, splitting orbital energy into K+U, escape-speed derivations.\n\n(3) Intuition: Quadratic in v — doubling speed quadruples K.\n\n(4) Often bundled with U = −GMm/r and E = −GMm/(2a). Use vis_viva when r changes along an orbit.\n\nUnit picker: J ↔ eV ↔ erg for K; m/s ↔ km/s for v; kg ↔ M☉ for m.",
        equation: "K = 0.5 * m * v^2",
        solveFor: {
            K: "K = 0.5 * m * v^2",
            m: "m = 2 * K / v^2",
            v: "v = sqrt(2 * K / m)"
        },
        concepts: ["kinetic energy", "mechanics", "orbital energy"],
        keywords: ["kinetic energy", "one half m v squared", "K equals mv2", "orbital kinetic energy"],
        variables: [
            { symbol: "K", name: "Kinetic Energy", unit: "J", description: "Translational kinetic energy" },
            { symbol: "m", name: "Mass", unit: "kg", description: "Mass of the object" },
            { symbol: "v", name: "Speed", unit: "m/s", description: "Speed magnitude" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["gravitational_potential_energy", "orbital_energy", "orbital_energy_simple", "escape_velocity", "vis_viva"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["kinetic energy", "half m v squared", "calculate K from m and v"]
    },
    {
        id: "orbital_energy_simple",
        name: "Orbital Energy (Simple Form)",
        description: "Total energy in circular orbit. Sum of kinetic and potential energy. Essential for orbital mechanics, escape velocity, and energy conservation. Negative for bound orbits.",
        equation: "E_orbit = -GMm / (2r)",
        concepts: ["orbital energy", "energy", "orbital mechanics", "bound orbit", "circular orbit"],
        keywords: ["orbital energy", "energy", "orbit", "bound"],
        variables: [
            {
                symbol: "E_orbit",
                name: "Orbital Energy",
                unit: "J",
                description: "Total energy in orbit"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of central body"
            },
            {
                symbol: "m",
                name: "Orbiting Mass",
                unit: "kg",
                description: "Mass of orbiting object"
            },
            {
                symbol: "r",
                name: "Orbital Radius",
                unit: "meters",
                description: "Radius of circular orbit"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["orbital_energy"],
            derivedFrom: ["orbital_energy"],
            relatedTo: ["orbital_energy", "gravitational_potential_energy", "escape_velocity"],
            uses: [],
            generalizes: [],
            specializes: ["orbital_energy"]
        },
        questionPatterns: [
            "orbital energy circular",
            "energy in orbit",
            "calculate orbital energy",
            "bound orbit energy"
        ]
    },
    {
        id: "potential_energy_per_mass",
        name: "Gravitational Potential per Unit Mass",
        description: "Gravitational potential energy per unit mass. Potential energy divided by mass. Essential for orbital mechanics and gravitational physics. Describes potential field strength.",
        equation: "U/m = -GM / r",
        concepts: ["gravitational potential", "potential per mass", "gravity", "orbital mechanics"],
        keywords: ["gravitational potential", "potential", "per mass", "gravity"],
        variables: [
            {
                symbol: "U/m",
                name: "Potential per Mass",
                unit: "J/kg",
                description: "Gravitational potential energy per unit mass"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of central body"
            },
            {
                symbol: "r",
                name: "Distance",
                unit: "meters",
                description: "Distance from center"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["gravitational_potential_energy"],
            derivedFrom: ["gravitational_potential_energy"],
            relatedTo: ["gravitational_potential_energy", "gravitational_potential_general"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "gravitational potential per mass",
            "potential per unit mass",
            "potential field",
            "potential energy per mass"
        ]
    },
    {
        id: "velocity_ratio_orbital",
        name: "Velocity Ratio at Different Radii",
        description: "Ratio of orbital velocities at different radii. Compares speeds at different orbital distances. Essential for orbital mechanics and comparative analysis. Velocity inversely proportional to square root of radius.",
        equation: "v₁ / v₂ = √(r₂ / r₁)",
        concepts: ["orbital velocity", "velocity ratio", "orbital mechanics", "comparative", "radius"],
        keywords: ["velocity ratio", "orbital velocity", "different radii", "comparative"],
        variables: [
            {
                symbol: "v₁",
                name: "Velocity 1",
                unit: "m/s",
                description: "Orbital velocity at radius r₁"
            },
            {
                symbol: "v₂",
                name: "Velocity 2",
                unit: "m/s",
                description: "Orbital velocity at radius r₂"
            },
            {
                symbol: "r₁",
                name: "Radius 1",
                unit: "meters",
                description: "First orbital radius"
            },
            {
                symbol: "r₂",
                name: "Radius 2",
                unit: "meters",
                description: "Second orbital radius"
            }
        ],
        relationships: {
            prerequisites: ["orbital_velocity"],
            derivedFrom: ["orbital_velocity"],
            relatedTo: ["orbital_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "velocity ratio different radii",
            "compare orbital velocities",
            "velocity at different distances",
            "orbital speed comparison"
        ]
    },
    // ============================================================
    // LIGHT, WAVES & PHOTONS FORMULAS
    // ============================================================
    {
        id: "intensity",
        name: "Intensity",
        description: "Intensity as power per unit area. Energy flux, power per unit area. Essential for radiation, optics, and photometry. Describes how much power passes through a given area.",
        equation: "I = P / A",
        concepts: ["intensity", "power", "area", "flux", "radiation", "optics", "photometry"],
        keywords: ["intensity", "power", "area", "flux", "radiation"],
        variables: [
            {
                symbol: "I",
                name: "Intensity",
                unit: "W/m²",
                description: "Intensity, power per unit area"
            },
            {
                symbol: "P",
                name: "Power",
                unit: "W",
                description: "Total power"
            },
            {
                symbol: "A",
                name: "Area",
                unit: "m²",
                description: "Area through which power passes"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["flux_from_luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "intensity",
            "power per area",
            "calculate intensity",
            "energy flux"
        ]
    },
    {
        id: "photon_momentum_energy",
        name: "Photon Momentum from Energy",
        description: "Momentum of photon from its energy. Relativistic momentum for photons. Essential for quantum mechanics, radiation pressure, and particle physics. Photons have momentum despite zero rest mass.",
        equation: "p = E / c",
        concepts: ["photon", "momentum", "energy", "relativistic", "quantum mechanics", "radiation pressure"],
        keywords: ["photon", "momentum", "energy", "relativistic", "quantum"],
        variables: [
            {
                symbol: "p",
                name: "Photon Momentum",
                unit: "kg·m/s",
                description: "Momentum of the photon"
            },
            {
                symbol: "E",
                name: "Photon Energy",
                unit: "J",
                description: "Energy of the photon"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["planck_relation"],
            derivedFrom: ["planck_relation"],
            relatedTo: ["planck_relation", "photon_energy_flat_space", "de_broglie_wavelength"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "photon momentum",
            "momentum from energy",
            "calculate photon momentum",
            "relativistic photon momentum"
        ]
    },
    {
        id: "de_broglie_wavelength",
        name: "De Broglie Wavelength",
        description: "Wavelength associated with particle momentum. Wave-particle duality. Essential for quantum mechanics and particle physics. All particles have associated wavelength.",
        equation: "p = h / λ",
        concepts: ["de broglie", "wavelength", "momentum", "quantum mechanics", "wave-particle duality"],
        keywords: ["de broglie", "wavelength", "momentum", "quantum", "wave-particle"],
        variables: [
            {
                symbol: "p",
                name: "Momentum",
                unit: "kg·m/s",
                description: "Momentum of particle"
            },
            {
                symbol: "h",
                name: "Planck Constant",
                unit: "J·s",
                description: "Planck constant"
            },
            {
                symbol: "λ",
                name: "Wavelength",
                unit: "meters",
                description: "De Broglie wavelength"
            }
        ],
        constants: {
            h: 6.62607015e-34
        },
        relationships: {
            prerequisites: ["planck_relation"],
            derivedFrom: ["planck_relation"],
            relatedTo: ["planck_relation", "photon_momentum_energy"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "de broglie wavelength",
            "particle wavelength",
            "calculate de broglie",
            "quantum wavelength"
        ]
    },
    {
        id: "refractive_index",
        name: "Index of Refraction",
        description: "Ratio of light speed in vacuum to speed in medium. Describes how light slows in materials. Essential for optics, refraction, and lens design. Determines bending of light at interfaces.",
        equation: "n = c / v",
        concepts: ["refractive index", "refraction", "optics", "light speed", "medium"],
        keywords: ["refractive index", "refraction", "optics", "light speed"],
        variables: [
            {
                symbol: "n",
                name: "Refractive Index",
                unit: "dimensionless",
                description: "Index of refraction"
            },
            {
                symbol: "c",
                name: "Speed of Light (Vacuum)",
                unit: "m/s",
                description: "Speed of light in vacuum"
            },
            {
                symbol: "v",
                name: "Speed of Light (Medium)",
                unit: "m/s",
                description: "Speed of light in the medium"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["angular_resolution"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "refractive index",
            "index of refraction",
            "calculate refractive index",
            "light speed in medium"
        ]
    },
    {
        id: "diffraction_limit",
        name: "Diffraction Limit (Angular Resolution)",
        description: "Order-of-magnitude diffraction limit θ ~ λ/D. For circular aperture, the Rayleigh criterion is θ ≈ 1.22 λ/D (see diffraction_limit_rayleigh).",
        equation: "θ = λ / D",
        concepts: ["diffraction limit", "angular resolution", "telescope", "optics", "imaging", "resolution"],
        keywords: ["diffraction limit", "angular resolution", "telescope", "resolution", "optics"],
        variables: [
            {
                symbol: "θ",
                name: "Angular Resolution",
                unit: "radians",
                description: "Minimum resolvable angle, diffraction limit"
            },
            {
                symbol: "λ",
                name: "Wavelength",
                unit: "meters",
                description: "Wavelength of light"
            },
            {
                symbol: "D",
                name: "Aperture Diameter",
                unit: "meters",
                description: "Diameter of telescope aperture or lens"
            }
        ],
        relationships: {
            prerequisites: ["angular_resolution"],
            derivedFrom: ["angular_resolution"],
            relatedTo: ["angular_resolution", "angular_size", "diffraction_limit_rayleigh"],
            uses: [],
            generalizes: [],
            specializes: ["angular_resolution"]
        },
        questionPatterns: [
            "diffraction limit",
            "angular resolution limit",
            "telescope resolution",
            "minimum resolvable angle"
        ]
    },
    {
        id: "diffraction_limit_rayleigh",
        name: "Rayleigh Criterion (Telescope Resolution)",
        description: "Hierarchy: Wave optics → Diffraction → Telescope performance.\n\n(1) Physical meaning: θ ≈ 1.22 λ/D is the angular radius of the Airy disk for a circular aperture — the classic Rayleigh resolution criterion.\n\n(2) When to use: Comparing telescopes, estimating smallest resolvable separation, converting λ and D to θ then to physical size with angular_size.\n\n(3) Intuition: Bigger D or shorter λ → sharper images (smaller θ).\n\n(4) Compare to diffraction_limit (θ~λ/D) for factor-of-1.22 checks.\n\nUnit picker: θ in rad ↔ deg ↔ arcmin ↔ arcsec; λ in m ↔ nm ↔ Å; D in m ↔ cm.",
        equation: "theta = 1.22 * lambda / D",
        solveFor: {
            theta: "theta = 1.22 * lambda / D",
            lambda: "lambda = theta * D / 1.22",
            D: "D = 1.22 * lambda / theta"
        },
        concepts: ["diffraction", "rayleigh criterion", "telescope", "angular resolution"],
        keywords: ["rayleigh criterion", "1.22 lambda over D", "telescope diffraction", "airy disk resolution"],
        variables: [
            { symbol: "theta", name: "Angular Resolution", unit: "rad", description: "Minimum resolvable angle" },
            { symbol: "lambda", name: "Wavelength", unit: "m", description: "Wavelength of light" },
            { symbol: "D", name: "Aperture Diameter", unit: "m", description: "Telescope diameter" }
        ],
        relationships: {
            prerequisites: ["diffraction_limit"],
            derivedFrom: ["diffraction_limit"],
            relatedTo: ["diffraction_limit", "angular_size", "angular_resolution", "radian_arcsecond_conversion"],
            uses: [],
            generalizes: [],
            specializes: ["diffraction_limit"]
        },
        questionPatterns: ["rayleigh criterion", "1.22 lambda D", "telescope resolution diffraction"]
    },
    {
        id: "apparent_magnitude_flux",
        name: "Apparent Magnitude from Flux",
        description: "Apparent magnitude calculated from observed flux. Magnitude scale based on flux measurements. Essential for photometry, stellar classification, and distance measurements. Logarithmic scale where brighter objects have smaller magnitudes.",
        equation: "m = -2.5 log₁₀(F)",
        concepts: ["apparent magnitude", "magnitude", "flux", "photometry", "brightness", "stellar classification"],
        keywords: ["apparent magnitude", "magnitude", "flux", "photometry", "brightness"],
        variables: [
            {
                symbol: "m",
                name: "Apparent Magnitude",
                unit: "magnitude",
                description: "Apparent magnitude, observed brightness"
            },
            {
                symbol: "F",
                name: "Observed Flux",
                unit: "W/m²",
                description: "Flux observed from Earth"
            }
        ],
        relationships: {
            prerequisites: ["magnitude_flux_relation"],
            derivedFrom: ["magnitude_flux_relation"],
            relatedTo: ["magnitude_flux_relation", "distance_modulus"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "apparent magnitude from flux",
            "magnitude from flux",
            "calculate magnitude",
            "brightness magnitude"
        ]
    },
    {
        id: "flux_ratio_magnitude",
        name: "Flux Ratio from Magnitude Difference",
        description: "Ratio of fluxes from magnitude difference. Compares brightness of two objects. Essential for photometry and comparative studies. Magnitude difference directly relates to flux ratio.",
        equation: "F₁ / F₂ = 10^(0.4(m₂ - m₁))",
        concepts: ["flux ratio", "magnitude", "brightness", "photometry", "comparative"],
        keywords: ["flux ratio", "magnitude", "brightness", "photometry", "comparative"],
        variables: [
            {
                symbol: "F₁",
                name: "Flux 1",
                unit: "W/m²",
                description: "Flux from first object"
            },
            {
                symbol: "F₂",
                name: "Flux 2",
                unit: "W/m²",
                description: "Flux from second object"
            },
            {
                symbol: "m₁",
                name: "Magnitude 1",
                unit: "magnitude",
                description: "Apparent magnitude of first object"
            },
            {
                symbol: "m₂",
                name: "Magnitude 2",
                unit: "magnitude",
                description: "Apparent magnitude of second object"
            }
        ],
        relationships: {
            prerequisites: ["magnitude_flux_relation"],
            derivedFrom: ["magnitude_flux_relation"],
            relatedTo: ["magnitude_flux_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "flux ratio from magnitude",
            "compare brightness",
            "flux difference",
            "magnitude to flux ratio"
        ]
    },
    {
        id: "absolute_magnitude_luminosity",
        name: "Absolute Magnitude from Luminosity",
        description: "Absolute magnitude difference from luminosity ratio. Compares intrinsic brightness of stars. Essential for stellar classification, HR diagram, and distance measurements. Absolute magnitude relates to intrinsic luminosity.",
        equation: "M₁ - M₂ = -2.5 log₁₀(L₁ / L₂)",
        concepts: ["absolute magnitude", "luminosity", "stellar classification", "HR diagram", "intrinsic brightness"],
        keywords: ["absolute magnitude", "luminosity", "stellar", "HR diagram", "intrinsic"],
        variables: [
            {
                symbol: "M₁",
                name: "Absolute Magnitude 1",
                unit: "magnitude",
                description: "Absolute magnitude of first star"
            },
            {
                symbol: "M₂",
                name: "Absolute Magnitude 2",
                unit: "magnitude",
                description: "Absolute magnitude of second star"
            },
            {
                symbol: "L₁",
                name: "Luminosity 1",
                unit: "W",
                description: "Luminosity of first star"
            },
            {
                symbol: "L₂",
                name: "Luminosity 2",
                unit: "W",
                description: "Luminosity of second star"
            }
        ],
        relationships: {
            prerequisites: ["luminosity", "distance_modulus"],
            derivedFrom: ["distance_modulus"],
            relatedTo: ["luminosity", "distance_modulus", "hr_absolute_magnitude"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "absolute magnitude from luminosity",
            "magnitude luminosity relation",
            "compare stellar luminosities",
            "intrinsic brightness comparison"
        ]
    },
    {
        id: "brightness_luminosity",
        name: "Brightness from Luminosity",
        description: "Brightness (flux) received from luminous source. Inverse square law for brightness. Essential for distance measurements, photometry, and stellar observations. Brightness decreases with distance squared.",
        equation: "B = L / (4πd²)",
        concepts: ["brightness", "flux", "luminosity", "distance", "inverse square law", "photometry"],
        keywords: ["brightness", "flux", "luminosity", "distance", "inverse square"],
        variables: [
            {
                symbol: "B",
                name: "Brightness",
                unit: "W/m²",
                description: "Brightness, flux received, apparent brightness"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Intrinsic luminosity, total power output"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "meters",
                description: "Distance to source"
            }
        ],
        constants: {
            π: Math.PI
        },
        relationships: {
            prerequisites: ["flux_from_luminosity"],
            derivedFrom: ["flux_from_luminosity"],
            relatedTo: ["flux_from_luminosity", "luminosity", "inverse_square_law_brightness"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "brightness from luminosity",
            "flux from luminosity",
            "calculate brightness",
            "apparent brightness"
        ]
    },
    {
        id: "magnitude_difference_flux",
        name: "Magnitude Difference from Flux Ratio",
        description: "Magnitude difference from flux ratio. Compares brightness using magnitude scale. Essential for photometry and stellar observations. Magnitude difference is proportional to log of flux ratio.",
        equation: "m₂ - m₁ = -2.5 log(F₂ / F₁)",
        concepts: ["magnitude difference", "flux ratio", "brightness", "photometry"],
        keywords: ["magnitude difference", "flux ratio", "brightness", "photometry"],
        variables: [
            {
                symbol: "m₁",
                name: "Magnitude 1",
                unit: "magnitude",
                description: "Apparent magnitude of first object"
            },
            {
                symbol: "m₂",
                name: "Magnitude 2",
                unit: "magnitude",
                description: "Apparent magnitude of second object"
            },
            {
                symbol: "F₁",
                name: "Flux 1",
                unit: "W/m²",
                description: "Flux from first object"
            },
            {
                symbol: "F₂",
                name: "Flux 2",
                unit: "W/m²",
                description: "Flux from second object"
            }
        ],
        relationships: {
            prerequisites: ["magnitude_flux_relation"],
            derivedFrom: ["magnitude_flux_relation"],
            relatedTo: ["magnitude_flux_relation", "flux_ratio_magnitude"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "magnitude difference",
            "compare magnitudes",
            "flux to magnitude",
            "brightness difference"
        ]
    },
    {
        id: "distance_from_magnitude",
        name: "Distance from Magnitude",
        description: "Distance calculated from apparent and absolute magnitude. Distance modulus solved for distance. Essential for distance measurements and stellar classification. Requires knowing both apparent and absolute magnitude. Type Ia supernovae: M ≈ −19.3 (standard candle). RR Lyrae: M ≈ +0.75.",
        equation: "d = 10^((m - M + 5) / 5)",
        concepts: ["distance", "magnitude", "distance modulus", "distance measurement", "stellar classification", "standard candle", "Type Ia", "RR Lyrae"],
        keywords: ["distance", "magnitude", "distance modulus", "parsec", "Type Ia supernova", "RR Lyrae", "how far"],
        variables: [
            {
                symbol: "d",
                name: "Distance",
                unit: "parsecs",
                description: "Distance to the star"
            },
            {
                symbol: "m",
                name: "Apparent Magnitude",
                unit: "magnitude",
                description: "Observed apparent magnitude"
            },
            {
                symbol: "M",
                name: "Absolute Magnitude",
                unit: "magnitude",
                description: "Intrinsic absolute magnitude"
            }
        ],
        presets: [
            { name: "Type Ia Supernova", description: "Standard candle M ≈ −19.3", values: { M: -19.3 } },
            { name: "RR Lyrae", description: "RR Lyrae absolute magnitude ≈ +0.75", values: { M: 0.75 } }
        ],
        relationships: {
            prerequisites: ["distance_modulus"],
            derivedFrom: ["distance_modulus"],
            relatedTo: ["distance_modulus", "parallax_distance_arcsec"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "distance from magnitude",
            "calculate distance magnitude",
            "distance modulus distance",
            "parsec from magnitude",
            "distance to the supernova",
            "find distance Type Ia",
            "apparent magnitude 10 supernova",
            "how far RR Lyrae",
            "RR Lyrae apparent magnitude 6.7 how far"
        ]
    },
    {
        id: "distance_modulus_with_extinction",
        name: "Distance Modulus with Extinction",
        description: "Distance when extinction A_V is present: m − M − A_V = 5 log₁₀(d) − 5, so d = 10^((m − M − A_V + 5)/5) pc. For Mpc: d_Mpc = d_pc / 10^6. Type Ia: M_V ≈ −19.3.",
        equation: "d = 10^((m - M - A_V + 5) / 5)",
        concepts: ["distance modulus", "extinction", "A_V", "standard candle", "Type Ia"],
        keywords: ["distance modulus including extinction", "extinction 0.40 distance", "distance supernova Mpc"],
        variables: [
            { symbol: "d", name: "Distance", unit: "parsecs", description: "Distance (divide by 1e6 for Mpc)" },
            { symbol: "m", name: "Apparent Magnitude", unit: "mag", description: "Observed magnitude" },
            { symbol: "M", name: "Absolute Magnitude", unit: "mag", description: "Intrinsic magnitude" },
            { symbol: "A_V", name: "V-band Extinction", unit: "mag", description: "Total extinction in magnitudes" }
        ],
        questionPatterns: [
            "distance modulus including extinction",
            "distance to supernova Mpc",
            "Type Ia apparent 15.4 extinction 0.40",
            "dust extinction distance"
        ]
    },
    {
        id: "luminosity_absolute_magnitude",
        name: "Luminosity from Absolute Magnitude",
        description: "Luminosity proportional to absolute magnitude. Relates intrinsic brightness to magnitude scale. Essential for stellar classification and HR diagram. More luminous stars have smaller (more negative) absolute magnitudes.",
        equation: "L ∝ 10^(-0.4M)",
        concepts: ["luminosity", "absolute magnitude", "stellar classification", "HR diagram", "intrinsic brightness"],
        keywords: ["luminosity", "absolute magnitude", "stellar", "HR diagram"],
        variables: [
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Intrinsic luminosity"
            },
            {
                symbol: "M",
                name: "Absolute Magnitude",
                unit: "magnitude",
                description: "Absolute magnitude"
            }
        ],
        relationships: {
            prerequisites: ["luminosity", "distance_modulus"],
            derivedFrom: ["distance_modulus"],
            relatedTo: ["luminosity", "distance_modulus", "absolute_magnitude_luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "luminosity from absolute magnitude",
            "magnitude to luminosity",
            "intrinsic brightness magnitude",
            "luminosity magnitude relation"
        ]
    },
    {
        id: "absolute_magnitude_from_distance",
        name: "Absolute Magnitude from Distance",
        description: "Absolute magnitude calculated from apparent magnitude and distance. Distance modulus solved for absolute magnitude. Essential for stellar classification and distance measurements. Requires apparent magnitude and distance.",
        equation: "M = m - 5 log(d / 10)",
        concepts: ["absolute magnitude", "apparent magnitude", "distance", "distance modulus", "stellar classification"],
        keywords: ["absolute magnitude", "apparent magnitude", "distance", "distance modulus"],
        variables: [
            {
                symbol: "M",
                name: "Absolute Magnitude",
                unit: "magnitude",
                description: "Intrinsic absolute magnitude"
            },
            {
                symbol: "m",
                name: "Apparent Magnitude",
                unit: "magnitude",
                description: "Observed apparent magnitude"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "parsecs",
                description: "Distance to the star"
            }
        ],
        relationships: {
            prerequisites: ["distance_modulus"],
            derivedFrom: ["distance_modulus"],
            relatedTo: ["distance_modulus", "distance_from_magnitude"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "absolute magnitude from distance",
            "calculate absolute magnitude",
            "intrinsic magnitude",
            "magnitude at 10 parsecs"
        ]
    },
    {
        id: "flux_from_magnitude",
        name: "Flux from Magnitude",
        description: "Flux calculated from apparent magnitude. Inverse of magnitude calculation. Essential for photometry and flux measurements. Converts magnitude scale to physical flux units.",
        equation: "F = F₀ 10^(-m / 2.5)",
        concepts: ["flux", "magnitude", "photometry", "brightness"],
        keywords: ["flux", "magnitude", "photometry", "brightness"],
        variables: [
            {
                symbol: "F",
                name: "Flux",
                unit: "W/m²",
                description: "Observed flux"
            },
            {
                symbol: "F₀",
                name: "Reference Flux",
                unit: "W/m²",
                description: "Reference flux for magnitude zero"
            },
            {
                symbol: "m",
                name: "Apparent Magnitude",
                unit: "magnitude",
                description: "Apparent magnitude"
            }
        ],
        relationships: {
            prerequisites: ["magnitude_flux_relation"],
            derivedFrom: ["magnitude_flux_relation"],
            relatedTo: ["magnitude_flux_relation", "apparent_magnitude_flux"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "flux from magnitude",
            "magnitude to flux",
            "calculate flux",
            "brightness flux"
        ]
    },
    {
        id: "luminosity_from_flux_distance",
        name: "Luminosity from Flux and Distance",
        description: "Luminosity calculated from observed flux and distance. Inverse square law solved for luminosity. Essential for stellar physics and distance measurements. Requires flux measurement and known distance.",
        equation: "L = 4πd² F",
        concepts: ["luminosity", "flux", "distance", "inverse square law", "stellar physics"],
        keywords: ["luminosity", "flux", "distance", "inverse square", "stellar"],
        variables: [
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Intrinsic luminosity, total power output"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "meters",
                description: "Distance to source"
            },
            {
                symbol: "F",
                name: "Observed Flux",
                unit: "W/m²",
                description: "Flux observed from Earth"
            }
        ],
        constants: {
            π: Math.PI
        },
        relationships: {
            prerequisites: ["luminosity", "flux_from_luminosity"],
            derivedFrom: ["flux_from_luminosity"],
            relatedTo: ["luminosity", "flux_from_luminosity", "brightness_luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "luminosity from flux",
            "calculate luminosity",
            "intrinsic luminosity",
            "power output from flux",
            "inverse square law luminosity",
            "L = F times 4 pi d squared",
            "luminosity from energy flux and distance",
            "supernova remnant luminosity from flux"
        ]
    },
    {
        id: "brightness_ratio_magnitude",
        name: "Brightness Ratio from Magnitude Difference",
        description: "Ratio of brightnesses from magnitude difference. Compares apparent brightness of objects. Essential for photometry and comparative studies. Magnitude difference directly relates to brightness ratio.",
        equation: "m₂ - m₁ = -2.5 log₁₀(B₂ / B₁)",
        concepts: ["brightness ratio", "magnitude", "photometry", "comparative"],
        keywords: ["brightness ratio", "magnitude", "photometry", "comparative"],
        variables: [
            {
                symbol: "m₁",
                name: "Magnitude 1",
                unit: "magnitude",
                description: "Apparent magnitude of first object"
            },
            {
                symbol: "m₂",
                name: "Magnitude 2",
                unit: "magnitude",
                description: "Apparent magnitude of second object"
            },
            {
                symbol: "B₁",
                name: "Brightness 1",
                unit: "W/m²",
                description: "Brightness of first object"
            },
            {
                symbol: "B₂",
                name: "Brightness 2",
                unit: "W/m²",
                description: "Brightness of second object"
            }
        ],
        relationships: {
            prerequisites: ["magnitude_flux_relation"],
            derivedFrom: ["magnitude_flux_relation"],
            relatedTo: ["magnitude_flux_relation", "magnitude_difference_flux"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "brightness ratio from magnitude",
            "compare brightness",
            "magnitude to brightness",
            "brightness difference"
        ]
    },
    // ============================================================
    // ADDITIONAL DOPPLER SHIFT VARIATIONS
    // ============================================================
    {
        id: "doppler_wavelength_ratio",
        name: "Doppler Shift Wavelength Ratio",
        description: "Non-relativistic spectroscopic Doppler: Δλ/λ = v/c. See doppler_velocity_wavelength to solve for v.",
        equation: "Δλ / λ = v / c",
        concepts: ["doppler shift", "wavelength", "redshift", "blueshift", "radial velocity", "spectroscopy"],
        keywords: ["doppler", "wavelength", "redshift", "blueshift", "radial velocity"],
        variables: [
            {
                symbol: "Δλ",
                name: "Wavelength Shift",
                unit: "meters",
                description: "Change in wavelength, observed minus rest"
            },
            {
                symbol: "λ",
                name: "Rest Wavelength",
                unit: "meters",
                description: "Wavelength in rest frame"
            },
            {
                symbol: "v",
                name: "Radial Velocity",
                unit: "m/s",
                description: "Velocity along line of sight, radial velocity"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["doppler_shift"],
            derivedFrom: ["doppler_shift"],
            relatedTo: ["doppler_shift", "doppler_shift_approx"],
            uses: [],
            generalizes: [],
            specializes: ["doppler_shift"]
        },
        questionPatterns: [
            "doppler wavelength shift",
            "wavelength shift velocity",
            "redshift from velocity",
            "doppler wavelength"
        ]
    },
    {
        id: "doppler_velocity_wavelength",
        name: "Velocity from Doppler Wavelength Shift",
        description: "Radial velocity calculated from wavelength shift. Inverse of Doppler shift. Essential for radial velocity measurements and motion detection. Requires measuring wavelength shift.",
        equation: "v = c (Δλ / λ)",
        concepts: ["doppler shift", "radial velocity", "wavelength", "redshift", "blueshift", "spectroscopy"],
        keywords: ["doppler", "radial velocity", "wavelength", "redshift", "velocity"],
        variables: [
            {
                symbol: "v",
                name: "Radial Velocity",
                unit: "m/s",
                description: "Velocity along line of sight"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            },
            {
                symbol: "Δλ",
                name: "Wavelength Shift",
                unit: "meters",
                description: "Change in wavelength"
            },
            {
                symbol: "λ",
                name: "Rest Wavelength",
                unit: "meters",
                description: "Wavelength in rest frame"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["doppler_shift"],
            derivedFrom: ["doppler_shift"],
            relatedTo: ["doppler_shift", "doppler_wavelength_ratio"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "velocity from doppler",
            "radial velocity wavelength",
            "calculate velocity doppler",
            "doppler velocity"
        ]
    },
    {
        id: "redshift_definition",
        name: "Redshift Definition",
        description: "Redshift as fractional wavelength change. Fundamental definition of redshift. Essential for cosmology, spectroscopy, and distance measurements. Redshift measures expansion and motion.",
        equation: "z = (λ_obs - λ_emit) / λ_emit",
        concepts: ["redshift", "wavelength", "cosmology", "spectroscopy", "expansion"],
        keywords: ["redshift", "wavelength", "cosmology", "expansion"],
        variables: [
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Redshift, fractional wavelength change"
            },
            {
                symbol: "λ_obs",
                name: "Observed Wavelength",
                unit: "meters",
                description: "Wavelength observed on Earth"
            },
            {
                symbol: "λ_emit",
                name: "Emitted Wavelength",
                unit: "meters",
                description: "Wavelength emitted by source"
            }
        ],
        relationships: {
            prerequisites: ["redshift_definition"],
            derivedFrom: [],
            relatedTo: ["redshift_definition", "doppler_shift", "scale_factor_redshift"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "redshift definition",
            "calculate redshift",
            "wavelength redshift",
            "redshift from wavelengths"
        ]
    },
    {
        id: "redshift_velocity_low",
        name: "Redshift to Velocity (Low z Approximation)",
        description: "Velocity from redshift for low redshifts. Non-relativistic approximation. Essential for nearby objects and low-redshift cosmology. Valid when z << 1.",
        equation: "v ≈ cz",
        concepts: ["redshift", "velocity", "low redshift", "non-relativistic", "cosmology"],
        keywords: ["redshift", "velocity", "low redshift", "non-relativistic"],
        variables: [
            {
                symbol: "v",
                name: "Recessional Velocity",
                unit: "m/s",
                description: "Recessional velocity, expansion velocity"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            },
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Redshift (low z approximation)"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["redshift_definition", "hubble_law"],
            derivedFrom: ["redshift_definition"],
            relatedTo: ["redshift_definition", "hubble_law", "redshift_peculiar_velocity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "velocity from redshift",
            "redshift to velocity",
            "low redshift velocity",
            "recessional velocity redshift",
            "calculate blueshift",
            "blueshift galaxy approaching",
            "miles per second blueshift"
        ]
    },
    {
        id: "redshift_velocity_relativistic",
        name: "Recessional Velocity from Redshift (Relativistic)",
        description: "Recessional velocity from redshift using special relativity. Use when z is not small (e.g. wavelength doubles). Formula: v/c = ((1+z)² − 1) / ((1+z)² + 1). Classical z = v/c gives unphysical v ≥ c for large z.",
        equation: "v = c * (((1 + z)^2 - 1) / ((1 + z)^2 + 1))",
        concepts: ["relativistic redshift", "recessional velocity", "special relativity", "doppler", "high redshift", "supernova"],
        keywords: ["relativistic redshift", "velocity from redshift", "recessional velocity", "relativistic doppler", "why relativistic necessary", "wavelength redshift to velocity"],
        variables: [
            { symbol: "v", name: "Recessional Velocity", unit: "m/s", description: "Recessional velocity of the source" },
            { symbol: "c", name: "Speed of Light", unit: "m/s", description: "Speed of light in vacuum" },
            { symbol: "z", name: "Redshift", unit: "dimensionless", description: "Redshift z = (λ_obs − λ_emit) / λ_emit" }
        ],
        constants: { c: 2.99792458e8 },
        questionPatterns: [
            "recessional velocity relativistic",
            "relativistic redshift velocity",
            "supernova redshift 4000 8000 angstroms",
            "velocity from wavelength shift relativistic",
            "why relativistic corrections necessary"
        ]
    },
    {
        id: "observed_wavelength_redshift",
        name: "Observed Wavelength from Redshift",
        description: "Observed wavelength calculated from redshift. Wavelength stretched by expansion. Essential for cosmology and spectroscopy. Observed wavelength is longer than emitted.",
        equation: "λ_obs = (1 + z) λ_emit",
        concepts: ["redshift", "wavelength", "cosmology", "spectroscopy", "expansion"],
        keywords: ["redshift", "wavelength", "observed", "cosmology"],
        variables: [
            {
                symbol: "λ_obs",
                name: "Observed Wavelength",
                unit: "meters",
                description: "Wavelength observed on Earth"
            },
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Redshift"
            },
            {
                symbol: "λ_emit",
                name: "Emitted Wavelength",
                unit: "meters",
                description: "Wavelength emitted by source"
            }
        ],
        relationships: {
            prerequisites: ["redshift_definition"],
            derivedFrom: ["redshift_definition"],
            relatedTo: ["redshift_definition", "scale_factor_redshift"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "observed wavelength from redshift",
            "wavelength redshift",
            "calculate observed wavelength",
            "redshift wavelength"
        ]
    },
    {
        id: "observed_frequency_redshift",
        name: "Observed Frequency from Redshift",
        description: "Observed frequency calculated from redshift. Frequency reduced by expansion. Essential for cosmology and spectroscopy. Observed frequency is lower than emitted.",
        equation: "f_obs = f_emit / (1 + z)",
        concepts: ["redshift", "frequency", "cosmology", "spectroscopy", "expansion"],
        keywords: ["redshift", "frequency", "observed", "cosmology"],
        variables: [
            {
                symbol: "f_obs",
                name: "Observed Frequency",
                unit: "Hz",
                description: "Frequency observed on Earth"
            },
            {
                symbol: "f_emit",
                name: "Emitted Frequency",
                unit: "Hz",
                description: "Frequency emitted by source"
            },
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Redshift"
            }
        ],
        relationships: {
            prerequisites: ["redshift_definition", "planck_relation"],
            derivedFrom: ["redshift_definition"],
            relatedTo: ["redshift_definition", "observed_wavelength_redshift", "planck_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "observed frequency from redshift",
            "frequency redshift",
            "calculate observed frequency",
            "redshift frequency"
        ]
    },
    {
        id: "wavelength_shift_redshift",
        name: "Wavelength Shift from Redshift",
        description: "Wavelength shift calculated from redshift. Change in wavelength due to expansion. Essential for spectroscopy and cosmology. Wavelength shift equals redshift times rest wavelength.",
        equation: "Δλ = λ₀ z",
        concepts: ["redshift", "wavelength shift", "spectroscopy", "cosmology"],
        keywords: ["redshift", "wavelength shift", "spectroscopy"],
        variables: [
            {
                symbol: "Δλ",
                name: "Wavelength Shift",
                unit: "meters",
                description: "Change in wavelength"
            },
            {
                symbol: "λ₀",
                name: "Rest Wavelength",
                unit: "meters",
                description: "Wavelength in rest frame"
            },
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Redshift"
            }
        ],
        relationships: {
            prerequisites: ["redshift_definition"],
            derivedFrom: ["redshift_definition"],
            relatedTo: ["redshift_definition", "observed_wavelength_redshift"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "wavelength shift from redshift",
            "calculate wavelength shift",
            "redshift wavelength change",
            "wavelength change"
        ]
    },
    {
        id: "redshift_scale_factor",
        name: "Redshift and Scale Factor Relation",
        description: "Relation between redshift and cosmic scale factor. Fundamental cosmological relation. Essential for cosmology and universe evolution. Redshift directly relates to scale factor.",
        equation: "1 + z = a_now / a_emit",
        concepts: ["redshift", "scale factor", "cosmology", "universe evolution", "expansion"],
        keywords: ["redshift", "scale factor", "cosmology", "expansion"],
        variables: [
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Redshift"
            },
            {
                symbol: "a_now",
                name: "Scale Factor (Now)",
                unit: "dimensionless",
                description: "Cosmic scale factor today (a=1)"
            },
            {
                symbol: "a_emit",
                name: "Scale Factor (Emission)",
                unit: "dimensionless",
                description: "Cosmic scale factor when light was emitted"
            }
        ],
        relationships: {
            prerequisites: ["scale_factor_redshift"],
            derivedFrom: ["scale_factor_redshift"],
            relatedTo: ["scale_factor_redshift", "redshift_definition"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "redshift scale factor",
            "scale factor from redshift",
            "redshift expansion",
            "cosmic scale factor redshift"
        ]
    },
    {
        id: "radial_velocity_frequency",
        name: "Radial Velocity from Frequency Shift",
        description: "Radial velocity from frequency shift. Doppler effect in frequency domain. Essential for spectroscopy and radial velocity measurements. Frequency shift relates to velocity.",
        equation: "v_r = (Δf / f) c",
        concepts: ["radial velocity", "doppler shift", "frequency", "spectroscopy"],
        keywords: ["radial velocity", "doppler", "frequency", "spectroscopy"],
        variables: [
            {
                symbol: "v_r",
                name: "Radial Velocity",
                unit: "m/s",
                description: "Velocity along line of sight"
            },
            {
                symbol: "Δf",
                name: "Frequency Shift",
                unit: "Hz",
                description: "Change in frequency"
            },
            {
                symbol: "f",
                name: "Rest Frequency",
                unit: "Hz",
                description: "Frequency in rest frame"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["doppler_shift"],
            derivedFrom: ["doppler_shift"],
            relatedTo: ["doppler_shift", "doppler_velocity_wavelength"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "radial velocity from frequency",
            "velocity frequency shift",
            "doppler frequency",
            "frequency doppler velocity"
        ]
    },
    {
        id: "radial_velocity_wavelength",
        name: "Radial Velocity from Wavelength Shift",
        description: "Radial velocity from wavelength shift. Doppler effect in wavelength domain. Essential for spectroscopy and radial velocity measurements. Wavelength shift relates to velocity.",
        equation: "v_r = (Δλ / λ) c",
        concepts: ["radial velocity", "doppler shift", "wavelength", "spectroscopy"],
        keywords: ["radial velocity", "doppler", "wavelength", "spectroscopy"],
        variables: [
            {
                symbol: "v_r",
                name: "Radial Velocity",
                unit: "m/s",
                description: "Velocity along line of sight"
            },
            {
                symbol: "Δλ",
                name: "Wavelength Shift",
                unit: "meters",
                description: "Change in wavelength"
            },
            {
                symbol: "λ",
                name: "Rest Wavelength",
                unit: "meters",
                description: "Wavelength in rest frame"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["doppler_shift"],
            derivedFrom: ["doppler_shift"],
            relatedTo: ["doppler_shift", "doppler_velocity_wavelength"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "radial velocity from wavelength",
            "velocity wavelength shift",
            "doppler wavelength velocity",
            "wavelength doppler velocity",
            "how fast is the system moving",
            "how fast is system moving from earth",
            "velocity from spectrum",
            "how fast from earth",
            "system velocity from earth",
            "radial velocity from spectrum"
        ]
    },
    // ============================================================
    // RELATIVISTIC FORMULAS
    // ============================================================
    {
        id: "gamma_factor",
        name: "Lorentz Factor (Gamma)",
        description: "Lorentz factor for relativistic motion. Factor describing time dilation and length contraction. Essential for special relativity, high-speed motion, and relativistic physics. Gamma increases as velocity approaches speed of light.",
        equation: "γ = 1 / √(1 - (v/c)²)",
        concepts: ["gamma", "lorentz factor", "special relativity", "relativistic", "time dilation", "length contraction"],
        keywords: ["gamma", "lorentz factor", "relativistic", "special relativity"],
        variables: [
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Lorentz factor, gamma"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Relative velocity"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["time_dilation"],
            derivedFrom: [],
            relatedTo: ["time_dilation", "length_contraction", "relativistic_energy"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "lorentz factor",
            "gamma factor",
            "relativistic factor",
            "calculate gamma"
        ]
    },
    {
        id: "relativistic_energy",
        name: "Relativistic Total Energy",
        description: "Total energy in special relativity. Includes rest energy and kinetic energy. Essential for particle physics, high-energy astrophysics, and relativistic mechanics. Energy increases with velocity.",
        equation: "E = γmc²",
        concepts: ["relativistic energy", "special relativity", "total energy", "rest energy", "particle physics"],
        keywords: ["relativistic energy", "total energy", "special relativity", "rest energy"],
        variables: [
            {
                symbol: "E",
                name: "Total Energy",
                unit: "J",
                description: "Total relativistic energy"
            },
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Lorentz factor"
            },
            {
                symbol: "m",
                name: "Rest Mass",
                unit: "kg",
                description: "Rest mass of particle"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["gamma_factor"],
            derivedFrom: [],
            relatedTo: ["gamma_factor", "relativistic_kinetic", "energy_momentum_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "relativistic energy",
            "total energy relativity",
            "calculate relativistic energy",
            "energy special relativity"
        ]
    },
    {
        id: "relativistic_kinetic",
        name: "Relativistic Kinetic Energy",
        description: "Kinetic energy in special relativity. Energy of motion for relativistic particles. Essential for particle physics and high-energy astrophysics. Kinetic energy is total energy minus rest energy.",
        equation: "K = (γ - 1)mc²",
        concepts: ["relativistic kinetic energy", "kinetic energy", "special relativity", "particle physics"],
        keywords: ["relativistic kinetic", "kinetic energy", "special relativity"],
        variables: [
            {
                symbol: "K",
                name: "Kinetic Energy",
                unit: "J",
                description: "Relativistic kinetic energy"
            },
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Lorentz factor"
            },
            {
                symbol: "m",
                name: "Rest Mass",
                unit: "kg",
                description: "Rest mass of particle"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["relativistic_energy"],
            derivedFrom: ["relativistic_energy"],
            relatedTo: ["relativistic_energy", "gamma_factor"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "relativistic kinetic energy",
            "kinetic energy relativity",
            "calculate relativistic kinetic",
            "kinetic special relativity"
        ]
    },
    {
        id: "relativistic_momentum",
        name: "Relativistic Momentum",
        description: "Momentum in special relativity. Momentum increases with velocity and gamma factor. Essential for particle physics and relativistic mechanics. Momentum approaches infinity as velocity approaches c.",
        equation: "p = γmv",
        concepts: ["relativistic momentum", "momentum", "special relativity", "particle physics"],
        keywords: ["relativistic momentum", "momentum", "special relativity"],
        variables: [
            {
                symbol: "p",
                name: "Momentum",
                unit: "kg·m/s",
                description: "Relativistic momentum"
            },
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Lorentz factor"
            },
            {
                symbol: "m",
                name: "Rest Mass",
                unit: "kg",
                description: "Rest mass of particle"
            },
            {
                symbol: "v",
                name: "Velocity",
                unit: "m/s",
                description: "Relative velocity"
            }
        ],
        relationships: {
            prerequisites: ["gamma_factor"],
            derivedFrom: [],
            relatedTo: ["gamma_factor", "energy_momentum_relation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "relativistic momentum",
            "momentum relativity",
            "calculate relativistic momentum",
            "momentum special relativity"
        ]
    },
    {
        id: "energy_momentum_relation",
        name: "Energy-Momentum Relation",
        description: "Fundamental relation between energy and momentum in relativity. Connects total energy, momentum, and rest mass. Essential for particle physics and relativistic mechanics. Valid for all particles including photons.",
        equation: "E² = (pc)² + (mc²)²",
        concepts: ["energy momentum", "special relativity", "particle physics", "relativistic", "fundamental relation"],
        keywords: ["energy momentum", "special relativity", "particle physics", "fundamental"],
        variables: [
            {
                symbol: "E",
                name: "Total Energy",
                unit: "J",
                description: "Total relativistic energy"
            },
            {
                symbol: "p",
                name: "Momentum",
                unit: "kg·m/s",
                description: "Relativistic momentum"
            },
            {
                symbol: "m",
                name: "Rest Mass",
                unit: "kg",
                description: "Rest mass"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["relativistic_energy", "relativistic_momentum"],
            derivedFrom: ["relativistic_energy"],
            relatedTo: ["relativistic_energy", "relativistic_momentum", "photon_energy_flat_space"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "energy momentum relation",
            "relativistic energy momentum",
            "calculate energy from momentum",
            "energy momentum relativity"
        ]
    },
    {
        id: "gravitational_redshift_simple",
        name: "Gravitational Redshift (Simple Form)",
        description: "Gravitational redshift in weak field limit. Simplified form for weak gravitational fields. Essential for general relativity tests and compact objects. Valid when gravitational field is weak.",
        equation: "z_grav = GM / (rc²)",
        concepts: ["gravitational redshift", "general relativity", "redshift", "gravity", "weak field"],
        keywords: ["gravitational redshift", "redshift", "general relativity", "gravity"],
        variables: [
            {
                symbol: "z_grav",
                name: "Gravitational Redshift",
                unit: "dimensionless",
                description: "Gravitational redshift"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of gravitating body"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from center"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["gravitational_redshift"],
            derivedFrom: ["gravitational_redshift"],
            relatedTo: ["gravitational_redshift", "schwarzschild_radius"],
            uses: [],
            generalizes: [],
            specializes: ["gravitational_redshift"]
        },
        questionPatterns: [
            "gravitational redshift simple",
            "weak field redshift",
            "gravity redshift",
            "redshift from gravity"
        ]
    },
    {
        id: "black_hole_density",
        name: "Black Hole Average Density",
        description: "Average density of a black hole. Density decreases with mass. Essential for black hole physics and compact objects. Larger black holes have lower average density.",
        equation: "ρ = (3c⁶) / (32πG³M²)",
        concepts: ["black hole", "density", "schwarzschild radius", "compact object", "black hole physics"],
        keywords: ["black hole", "density", "schwarzschild", "compact object"],
        variables: [
            {
                symbol: "ρ",
                name: "Average Density",
                unit: "kg/m³",
                description: "Average density of black hole"
            },
            {
                symbol: "M",
                name: "Black Hole Mass",
                unit: "kg",
                description: "Mass of black hole"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            G: 6.67430e-11,
            c: 2.99792458e8,
            π: Math.PI
        },
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: ["schwarzschild_radius"],
            relatedTo: ["schwarzschild_radius", "horizon_area"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "black hole density",
            "calculate black hole density",
            "density black hole",
            "black hole average density"
        ]
    },
    {
        id: "schwarzschild_per_solar_mass",
        name: "Schwarzschild Radius per Solar Mass",
        description: "Schwarzschild radius scaling with solar mass. Useful approximation for black hole sizes. Essential for black hole physics and quick calculations. Each solar mass adds about 3 km to Schwarzschild radius.",
        equation: "R_s = 3 km × (M / M☉)",
        concepts: ["schwarzschild radius", "black hole", "solar mass", "event horizon", "scaling"],
        keywords: ["schwarzschild", "black hole", "solar mass", "event horizon", "scaling"],
        variables: [
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius"
            },
            {
                symbol: "M",
                name: "Black Hole Mass",
                unit: "kg",
                description: "Mass of black hole"
            },
            {
                symbol: "M☉",
                name: "Solar Mass",
                unit: "kg",
                description: "Mass of the Sun"
            }
        ],
        constants: {
            M_sun: 1.988409870440e30
        },
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: ["schwarzschild_radius"],
            relatedTo: ["schwarzschild_radius"],
            uses: [],
            generalizes: [],
            specializes: ["schwarzschild_radius"]
        },
        questionPatterns: [
            "schwarzschild radius solar mass",
            "black hole radius scaling",
            "event horizon solar mass",
            "schwarzschild per solar mass"
        ]
    },
    {
        id: "photon_sphere",
        name: "Photon Sphere Radius",
        description: "Radius of photon sphere around black hole. Circular orbit for photons. Essential for black hole physics and light paths. Photons can orbit at this radius.",
        equation: "r = 1.5 R_s",
        concepts: ["photon sphere", "black hole", "light paths", "orbits", "general relativity"],
        keywords: ["photon sphere", "black hole", "light paths", "orbits"],
        variables: [
            {
                symbol: "r",
                name: "Photon Sphere Radius",
                unit: "meters",
                description: "Radius of photon sphere"
            },
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius"
            }
        ],
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: [],
            relatedTo: ["schwarzschild_radius", "isco"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "photon sphere",
            "photon orbit radius",
            "light orbit black hole",
            "photon sphere radius"
        ]
    },
    {
        id: "isco",
        name: "Innermost Stable Circular Orbit (ISCO)",
        description: "Innermost stable circular orbit around black hole. Closest stable orbit for massive particles. Essential for accretion disk physics and black hole observations. ISCO is at 3 Schwarzschild radii.",
        equation: "r = 3 R_s",
        concepts: ["ISCO", "innermost stable orbit", "black hole", "accretion disk", "stable orbit"],
        keywords: ["ISCO", "innermost stable", "black hole", "accretion", "stable orbit"],
        variables: [
            {
                symbol: "r",
                name: "ISCO Radius",
                unit: "meters",
                description: "Radius of innermost stable circular orbit"
            },
            {
                symbol: "R_s",
                name: "Schwarzschild Radius",
                unit: "meters",
                description: "Event horizon radius"
            }
        ],
        relationships: {
            prerequisites: ["schwarzschild_radius"],
            derivedFrom: [],
            relatedTo: ["schwarzschild_radius", "photon_sphere", "accretion_efficiency"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "ISCO",
            "innermost stable orbit",
            "stable orbit black hole",
            "accretion disk radius"
        ]
    },
    {
        id: "relativistic_doppler",
        name: "Relativistic Doppler Shift",
        description: "Doppler shift including relativistic effects. Full relativistic formula for wavelength shift. Essential for high-speed objects and relativistic spectroscopy. Includes both classical and relativistic terms.",
        equation: "1 + z = γ(1 + v/c)",
        concepts: ["relativistic doppler", "doppler shift", "special relativity", "redshift", "high speed"],
        keywords: ["relativistic doppler", "doppler", "special relativity", "redshift"],
        variables: [
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Doppler redshift"
            },
            {
                symbol: "γ",
                name: "Lorentz Factor",
                unit: "dimensionless",
                description: "Lorentz factor"
            },
            {
                symbol: "v",
                name: "Radial Velocity",
                unit: "m/s",
                description: "Velocity along line of sight"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["doppler_shift", "gamma_factor"],
            derivedFrom: ["doppler_shift"],
            relatedTo: ["doppler_shift", "gamma_factor"],
            uses: [],
            generalizes: [],
            specializes: ["doppler_shift"]
        },
        questionPatterns: [
            "relativistic doppler",
            "doppler relativity",
            "high speed doppler",
            "relativistic redshift"
        ]
    },
    // ============================================================
    // EXOPLANET & BINARY SYSTEM FORMULAS (Finishing)
    // ============================================================
    {
        id: "transit_depth",
        name: "Transit Depth (Fractional Drop in Flux)",
        description: "Fractional drop in flux during planetary transit. Measures planet-to-star size ratio. Essential for exoplanet detection and characterization. Transit depth equals square of planet-to-star radius ratio.",
        equation: "δ = (R_p / R_s)²",
        concepts: ["transit", "transit depth", "exoplanet", "planetary transit", "flux drop", "exoplanet detection"],
        keywords: ["transit", "transit depth", "exoplanet", "planetary", "flux drop"],
        variables: [
            {
                symbol: "δ",
                name: "Transit Depth",
                unit: "dimensionless",
                description: "Fractional drop in flux during transit"
            },
            {
                symbol: "R_p",
                name: "Planet Radius",
                unit: "meters",
                description: "Radius of the planet"
            },
            {
                symbol: "R_s",
                name: "Star Radius",
                unit: "meters",
                description: "Radius of the star"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["average_density", "planetary_equilibrium_temperature"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "transit depth",
            "planetary transit",
            "exoplanet transit",
            "flux drop transit",
            "transit depth inclination",
            "inclination from transit depth",
            "exoplanet radius from transit",
            "planet radius from light curve",
            "transit light curve",
            "calculate planet radius",
            "transit depth calculation",
            "flux decrease transit",
            "relative brightness transit",
            "transit depth from flux",
            "planet size from transit",
            "exoplanet detection transit",
            "secondary transit",
            "primary transit",
            "transit duration",
            "eccentricity from transit",
            "planet inclination",
            "inclination planet",
            "transit depth planet",
            "simplified expression inclination"
        ]
    },
    {
        id: "radial_velocity_amplitude",
        name: "Radial Velocity Amplitude (Simplified)",
        description: "Radial velocity amplitude for exoplanet detection. Measures stellar wobble from planet. Essential for exoplanet detection and mass determination. Amplitude depends on planet mass, star mass, and orbital parameters. The full equation is K = (2πG/P)^(1/3) × (M_p sin i) / (M_s^(2/3) × (M_s + M_p)^(1/3)) for circular orbits.",
        equation: "K = (2πG/P)^(1/3) × (M_p sin i) / (M_s^(2/3) × (M_s + M_p)^(1/3))",
        concepts: ["radial velocity", "exoplanet", "stellar wobble", "exoplanet detection", "planet mass", "orbital parameters", "doppler wobble", "radial velocity curve", "planet mass determination", "inclination", "orbital period"],
        keywords: ["radial velocity", "exoplanet", "stellar wobble", "detection", "planet mass", "radial velocity amplitude", "doppler wobble", "v_max", "radial velocity curve", "planet mass from radial velocity", "orbital speed from radial velocity"],
        variables: [
            {
                symbol: "K",
                name: "Radial Velocity Amplitude",
                unit: "m/s",
                description: "Amplitude of radial velocity variation"
            },
            {
                symbol: "M_p",
                name: "Planet Mass",
                unit: "kg",
                description: "Mass of the planet"
            },
            {
                symbol: "M_s",
                name: "Star Mass",
                unit: "kg",
                description: "Mass of the star"
            },
            {
                symbol: "i",
                name: "Inclination",
                unit: "radians",
                description: "Orbital inclination angle"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of orbit"
            }
        ],
        relationships: {
            prerequisites: ["kepler_third_law"],
            derivedFrom: [],
            relatedTo: ["kepler_third_law", "doppler_shift"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "radial velocity amplitude",
            "exoplanet radial velocity",
            "stellar wobble",
            "radial velocity exoplanet",
            "planet mass from radial velocity",
            "orbital speed from radial velocity",
            "v_max radial velocity",
            "radial velocity curve",
            "doppler wobble",
            "calculate planet mass",
            "find planet mass",
            "planet mass from v_max",
            "orbital speed planet",
            "planet velocity from radial velocity",
            "exoplanet detection radial velocity",
            "radial velocity method",
            "planet mass determination",
            "inclination radial velocity",
            "sin i radial velocity"
        ]
    },
    {
        id: "planet_density",
        name: "Planet Density",
        description: "Density of a planet. Mass divided by volume. Essential for exoplanet characterization and planetary science. Density reveals planet composition and structure.",
        equation: "ρ_p = M_p / ((4/3) π R_p³)",
        concepts: ["planet density", "exoplanet", "planetary science", "density", "composition"],
        keywords: ["planet density", "exoplanet", "planetary", "density", "composition"],
        variables: [
            {
                symbol: "ρ_p",
                name: "Planet Density",
                unit: "kg/m³",
                description: "Average density of the planet"
            },
            {
                symbol: "M_p",
                name: "Planet Mass",
                unit: "kg",
                description: "Mass of the planet"
            },
            {
                symbol: "R_p",
                name: "Planet Radius",
                unit: "meters",
                description: "Radius of the planet"
            }
        ],
        constants: {
            π: Math.PI
        },
        relationships: {
            prerequisites: ["average_density"],
            derivedFrom: ["average_density"],
            relatedTo: ["average_density", "transit_depth"],
            uses: [],
            generalizes: [],
            specializes: ["average_density"]
        },
        questionPatterns: [
            "planet density",
            "exoplanet density",
            "calculate planet density",
            "planetary density"
        ]
    },
    {
        id: "mass_function",
        name: "Mass Function (Spectroscopic Binaries)",
        description: "Mass function for spectroscopic binary systems. Lower limit on companion mass. Essential for binary star studies and mass determination. Mass function provides minimum mass when inclination is unknown.",
        equation: "f(M) = (M₂³ sin³ i) / (M₁ + M₂)² ∝ P K₁³",
        concepts: ["mass function", "binary stars", "spectroscopic binary", "mass determination", "binary systems"],
        keywords: ["mass function", "binary", "spectroscopic", "mass determination"],
        variables: [
            {
                symbol: "f(M)",
                name: "Mass Function",
                unit: "kg",
                description: "Mass function, lower limit on companion mass"
            },
            {
                symbol: "M₁",
                name: "Mass of Star 1",
                unit: "kg",
                description: "Mass of primary star"
            },
            {
                symbol: "M₂",
                name: "Mass of Star 2",
                unit: "kg",
                description: "Mass of secondary star"
            },
            {
                symbol: "i",
                name: "Inclination",
                unit: "radians",
                description: "Orbital inclination angle"
            },
            {
                symbol: "P",
                name: "Orbital Period",
                unit: "seconds",
                description: "Orbital period"
            },
            {
                symbol: "K₁",
                name: "Velocity of Star 1",
                unit: "m/s",
                description: "Radial velocity amplitude of primary"
            }
        ],
        relationships: {
            prerequisites: ["kepler_third_law_binary"],
            derivedFrom: ["kepler_third_law_binary"],
            relatedTo: ["kepler_third_law_binary", "radial_velocity_amplitude"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "mass function",
            "binary mass function",
            "spectroscopic binary mass",
            "mass function binary"
        ]
    },
    {
        id: "binary_total_mass",
        name: "Total Mass of a Binary System (from Kepler's Third Law)",
        description: "Total mass of binary system from orbital period and separation. Kepler's third law for binary systems. Essential for binary star studies and mass determination. Requires period and semi-major axis.",
        equation: "M₁ + M₂ = (4π² a³) / (G P²)",
        concepts: ["binary mass", "kepler third law", "binary stars", "mass determination", "orbital mechanics"],
        keywords: ["binary mass", "kepler", "binary stars", "mass determination"],
        variables: [
            {
                symbol: "M₁",
                name: "Mass of Star 1",
                unit: "kg",
                description: "Mass of primary star"
            },
            {
                symbol: "M₂",
                name: "Mass of Star 2",
                unit: "kg",
                description: "Mass of secondary star"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of relative orbit"
            },
            {
                symbol: "P",
                name: "Orbital Period",
                unit: "seconds",
                description: "Orbital period"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11,
            π: Math.PI
        },
        relationships: {
            prerequisites: ["kepler_third_law_binary"],
            derivedFrom: ["kepler_third_law_binary"],
            relatedTo: ["kepler_third_law_binary", "mass_function"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "binary total mass",
            "binary system mass",
            "calculate binary mass",
            "kepler binary mass"
        ]
    },
    {
        id: "semi_latus_rectum",
        name: "Semi-Latus Rectum (General Conic Section)",
        description: "Semi-latus rectum for elliptical orbits. Parameter describing orbit shape. Essential for orbital mechanics and conic sections. Relates to semi-major axis and eccentricity.",
        equation: "p = a(1 - ecc²)",
        concepts: ["semi-latus rectum", "orbital mechanics", "conic sections", "eccentricity", "ellipse"],
        keywords: ["semi-latus rectum", "orbital mechanics", "eccentricity", "ellipse"],
        variables: [
            {
                symbol: "p",
                name: "Semi-Latus Rectum",
                unit: "meters",
                description: "Semi-latus rectum, orbit parameter"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of orbit"
            },
            {
                symbol: "ecc",
                displaySymbol: "e",
                name: "Eccentricity",
                unit: "dimensionless",
                description: "Orbital eccentricity"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["orbital_energy", "vis_viva"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "semi-latus rectum",
            "orbit parameter",
            "conic section parameter",
            "ellipse parameter"
        ]
    },
    {
        id: "eccentricity_apoapsis_periapsis",
        name: "Eccentricity (Apoapsis/Periapsis relation)",
        description: "Eccentricity from apoapsis and periapsis distances. Measures orbit elongation. Essential for orbital mechanics and orbit characterization. Eccentricity ranges from 0 (circle) to 1 (parabola).",
        equation: "ecc = (r_a - r_p) / (r_a + r_p)",
        concepts: ["eccentricity", "orbital mechanics", "apoapsis", "periapsis", "orbit shape"],
        keywords: ["eccentricity", "orbital mechanics", "apoapsis", "periapsis", "orbit"],
        variables: [
            {
                symbol: "ecc",
                displaySymbol: "e",
                name: "Eccentricity",
                unit: "dimensionless",
                description: "Orbital eccentricity"
            },
            {
                symbol: "r_a",
                name: "Apoapsis Distance",
                unit: "meters",
                description: "Distance at farthest point, aphelion for planets"
            },
            {
                symbol: "r_p",
                name: "Periapsis Distance",
                unit: "meters",
                description: "Distance at closest point, perihelion for planets"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["orbital_energy", "vis_viva", "semi_latus_rectum"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "eccentricity from distances",
            "calculate eccentricity",
            "orbit eccentricity",
            "ellipse eccentricity",
            "apoapsis periapsis formula",
            "r_a r_p eccentricity"
        ]
    },
    {
        id: "orbital_energy_eccentricity",
        name: "Orbital Energy (Eccentricity Form)",
        description: "Orbital energy in terms of semi-major axis. Energy depends only on semi-major axis, not eccentricity. Essential for orbital mechanics and energy conservation. Negative for bound orbits.",
        equation: "E = -(G M m) / (2a)",
        concepts: ["orbital energy", "orbital mechanics", "semi-major axis", "bound orbit", "energy"],
        keywords: ["orbital energy", "orbital mechanics", "semi-major axis", "energy"],
        variables: [
            {
                symbol: "E",
                name: "Orbital Energy",
                unit: "J",
                description: "Total orbital energy"
            },
            {
                symbol: "M",
                name: "Mass of Central Body",
                unit: "kg",
                description: "Mass of central object"
            },
            {
                symbol: "m",
                name: "Mass of Orbiting Body",
                unit: "kg",
                description: "Mass of orbiting object"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of orbit"
            },
            {
                symbol: "G",
                name: "Gravitational Constant",
                unit: "m³/(kg·s²)",
                description: "Newton's gravitational constant"
            }
        ],
        constants: {
            G: 6.67430e-11
        },
        relationships: {
            prerequisites: ["orbital_energy"],
            derivedFrom: ["orbital_energy"],
            relatedTo: ["orbital_energy", "orbital_energy_simple"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "orbital energy semi-major axis",
            "energy from semi-major axis",
            "orbital energy calculation",
            "bound orbit energy"
        ]
    },
    {
        id: "stellar_activity_index",
        name: "Stellar Activity Index (R'_HK)",
        description: "Stellar activity index measuring chromospheric activity. Indicator of stellar magnetic activity. Essential for stellar physics and exoplanet studies. Activity affects radial velocity measurements.",
        equation: "R'_HK ∝ F_core / F_bolo",
        concepts: ["stellar activity", "chromospheric activity", "magnetic activity", "stellar physics", "exoplanets"],
        keywords: ["stellar activity", "chromospheric", "magnetic activity", "stellar"],
        variables: [
            {
                symbol: "R'_HK",
                name: "Stellar Activity Index",
                unit: "dimensionless",
                description: "Activity index, measure of chromospheric activity"
            },
            {
                symbol: "F_core",
                name: "Core Flux",
                unit: "W/m²",
                description: "Flux in calcium H and K lines"
            },
            {
                symbol: "F_bolo",
                name: "Bolometric Flux",
                unit: "W/m²",
                description: "Total bolometric flux"
            }
        ],
        relationships: {
            prerequisites: ["luminosity"],
            derivedFrom: [],
            relatedTo: ["luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "stellar activity index",
            "chromospheric activity",
            "stellar magnetic activity",
            "activity index"
        ]
    },
    {
        id: "bolometric_magnitude",
        name: "Bolometric Magnitude (From Luminosity)",
        description: "Bolometric magnitude from luminosity. Absolute magnitude including all wavelengths. Essential for stellar classification and luminosity measurements. Bolometric magnitude accounts for all emitted radiation.",
        equation: "M_bol - M_bol,sun = -2.5 log₁₀(L / L_sun)",
        concepts: ["bolometric magnitude", "absolute magnitude", "luminosity", "stellar classification", "all wavelengths"],
        keywords: ["bolometric magnitude", "absolute magnitude", "luminosity", "stellar"],
        variables: [
            {
                symbol: "M_bol",
                name: "Bolometric Magnitude",
                unit: "magnitude",
                description: "Absolute bolometric magnitude"
            },
            {
                symbol: "M_bol,sun",
                name: "Sun's Bolometric Magnitude",
                unit: "magnitude",
                description: "Solar bolometric magnitude"
            },
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Stellar luminosity"
            },
            {
                symbol: "L_sun",
                name: "Sun's Luminosity",
                unit: "W",
                description: "Solar luminosity"
            }
        ],
        constants: {
            L_sun: 3.828e26
        },
        relationships: {
            prerequisites: ["luminosity", "distance_modulus"],
            derivedFrom: ["distance_modulus"],
            relatedTo: ["luminosity", "distance_modulus", "absolute_magnitude_luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "bolometric magnitude",
            "absolute bolometric magnitude",
            "magnitude from luminosity",
            "bolometric magnitude luminosity"
        ]
    },
    {
        id: "color_index_ub",
        name: "Color Index U - B (General)",
        description: "Color index in U and B photometric bands. Measures stellar color and temperature. Essential for stellar classification and HR diagram. Color index relates to effective temperature.",
        equation: "U - B = m_U - m_B",
        concepts: ["color index", "photometry", "stellar classification", "HR diagram", "temperature", "U band", "B band"],
        keywords: ["color index", "U-B", "photometry", "stellar", "temperature"],
        variables: [
            {
                symbol: "U - B",
                name: "Color Index",
                unit: "magnitude",
                description: "U minus B color index"
            },
            {
                symbol: "m_U",
                name: "U-band Magnitude",
                unit: "magnitude",
                description: "Apparent magnitude in U band"
            },
            {
                symbol: "m_B",
                name: "B-band Magnitude",
                unit: "magnitude",
                description: "Apparent magnitude in B band"
            }
        ],
        relationships: {
            prerequisites: ["hr_color_index"],
            derivedFrom: [],
            relatedTo: ["hr_color_index", "interstellar_reddening"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "color index U-B",
            "U-B color",
            "stellar color index",
            "photometric color"
        ]
    },
    {
        id: "interstellar_reddening",
        name: "Interstellar Reddening",
        description: "Reddening due to interstellar dust. Difference between observed and intrinsic color. Essential for distance measurements and stellar classification. Dust scatters blue light more than red.",
        equation: "E(B - V) = (B - V)_obs - (B - V)_0",
        concepts: ["interstellar reddening", "reddening", "dust", "extinction", "color", "distance measurement"],
        keywords: ["reddening", "interstellar", "dust", "extinction", "color"],
        variables: [
            {
                symbol: "E(B - V)",
                name: "Color Excess",
                unit: "magnitude",
                description: "Reddening, color excess"
            },
            {
                symbol: "(B - V)_obs",
                name: "Observed B-V Color",
                unit: "magnitude",
                description: "Observed color index"
            },
            {
                symbol: "(B - V)_0",
                name: "Intrinsic B-V Color",
                unit: "magnitude",
                description: "True color index without reddening"
            }
        ],
        relationships: {
            prerequisites: ["extinction_relation"],
            derivedFrom: [],
            relatedTo: ["extinction_relation", "color_index_ub"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "interstellar reddening",
            "reddening",
            "color excess",
            "dust reddening"
        ]
    },
    {
        id: "energy_density_radiation",
        name: "Energy Density of Radiation",
        description: "Energy density in radiation field. Energy per unit volume. Essential for stellar interiors, blackbody radiation, and radiative transfer. Energy density scales with temperature to fourth power.",
        equation: "u_rad = a T⁴",
        concepts: ["energy density", "radiation", "blackbody", "stellar interior", "radiative transfer"],
        keywords: ["energy density", "radiation", "blackbody", "stellar"],
        variables: [
            {
                symbol: "u_rad",
                name: "Energy Density",
                unit: "J/m³",
                description: "Energy density of radiation"
            },
            {
                symbol: "a",
                name: "Radiation Constant",
                unit: "J/(m³·K⁴)",
                description: "Radiation constant, a = 4σ/c"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of radiation field"
            }
        ],
        constants: {
            a: 7.5657232501369285e-16
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["luminosity", "radiation_pressure_stellar"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "energy density radiation",
            "radiation energy density",
            "blackbody energy density",
            "radiative energy density"
        ]
    },
    {
        id: "photon_number_density",
        name: "Photon Number Density (Blackbody)",
        description: "Number density of photons in blackbody radiation. Photons per unit volume. Essential for stellar interiors and radiative transfer. Photon density scales with temperature cubed.",
        equation: "n_γ ∝ T³",
        concepts: ["photon density", "blackbody", "stellar interior", "radiative transfer", "photons"],
        keywords: ["photon density", "blackbody", "stellar", "photons"],
        variables: [
            {
                symbol: "n_γ",
                name: "Photon Number Density",
                unit: "m⁻³",
                description: "Number of photons per unit volume"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Temperature of blackbody"
            }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["luminosity", "energy_density_radiation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "photon number density",
            "photon density",
            "blackbody photons",
            "radiative photon density"
        ]
    },
    {
        id: "momentum_transfer_radiation",
        name: "Momentum Transfer from Radiation (Radiation Pressure)",
        description: "Radiation pressure from momentum transfer. Pressure from photon momentum. Essential for stellar interiors, accretion, and high-energy astrophysics. Radiation pressure equals flux divided by speed of light.",
        equation: "P_rad = F / c",
        concepts: ["radiation pressure", "momentum transfer", "photons", "stellar interior", "accretion"],
        keywords: ["radiation pressure", "momentum", "photons", "stellar"],
        variables: [
            {
                symbol: "P_rad",
                name: "Radiation Pressure",
                unit: "Pa",
                description: "Pressure from radiation"
            },
            {
                symbol: "F",
                name: "Flux",
                unit: "W/m²",
                description: "Radiation flux"
            },
            {
                symbol: "c",
                name: "Speed of Light",
                unit: "m/s",
                description: "Speed of light in vacuum"
            }
        ],
        constants: {
            c: 2.99792458e8
        },
        relationships: {
            prerequisites: ["radiation_pressure_stellar"],
            derivedFrom: [],
            relatedTo: ["radiation_pressure_stellar", "photon_momentum_energy"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: [
            "radiation pressure flux",
            "momentum transfer radiation",
            "photon pressure",
            "radiation pressure momentum"
        ]
    },
    {
        id: "optical_depth_scattering",
        name: "Optical Depth for Scattering",
        description: "Optical depth for scattering processes. Measure of opacity for scattering. Essential for radiative transfer and stellar atmospheres. Optical depth determines scattering efficiency.",
        equation: "τ_sc = N σ_sc",
        concepts: ["optical depth", "scattering", "radiative transfer", "opacity", "stellar atmosphere"],
        keywords: ["optical depth", "scattering", "radiative transfer", "opacity"],
        variables: [
            {
                symbol: "τ_sc",
                name: "Optical Depth (Scattering)",
                unit: "dimensionless",
                description: "Optical depth for scattering"
            },
            {
                symbol: "N",
                name: "Column Density",
                unit: "m⁻²",
                description: "Number of particles per unit area"
            },
            {
                symbol: "σ_sc",
                name: "Scattering Cross-Section",
                unit: "m²",
                description: "Scattering cross-section per particle"
            }
        ],
        relationships: {
            prerequisites: ["optical_depth"],
            derivedFrom: ["optical_depth"],
            relatedTo: ["optical_depth", "column_density"],
            uses: [],
            generalizes: [],
            specializes: ["optical_depth"]
        },
        questionPatterns: [
            "optical depth scattering",
            "scattering optical depth",
            "calculate scattering depth",
            "scattering opacity"
        ]
    },
    // --- Reference pack: competition / undergraduate astrophysics (bridges to existing laws) ---
    {
        id: "planck_blackbody_nu_frequency",
        name: "Planck Law (Spectral Radiance B_ν)",
        description: "Blackbody spectral radiance per unit frequency (W·sr⁻¹·m⁻²·Hz⁻¹). Same physics as wavelength form; use for ν-space problems. Competition trigger: spectral shape, peak frequency, Rayleigh–Jeans vs Wien limits.",
        equation: "B_nu = (2 * h * nu^3 / c^2) / (exp(h * nu / (k * T)) - 1)",
        concepts: ["blackbody radiation", "planck law", "spectral radiance", "thermal radiation", "radiation physics", "science olympiad astronomy"],
        keywords: ["planck B nu", "blackbody frequency", "spectral radiance nu", "thermal spectrum"],
        variables: [
            { symbol: "B_nu", name: "Spectral Radiance B_ν", unit: "W/(m²·sr·Hz)", description: "Radiance per unit frequency" },
            { symbol: "nu", name: "Frequency", unit: "Hz", description: "Electromagnetic frequency" },
            { symbol: "T", name: "Temperature", unit: "Kelvin", description: "Blackbody temperature" }
        ],
        constants: { h: 6.62607015e-34, c: 2.99792458e8, k: 1.380649e-23 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["blackbody_radiation", "rayleigh_jeans_B_nu", "wiens_law", "stefan_boltzmann_law"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["planck law frequency", "blackbody B nu", "spectral radiance per hz"]
    },
    {
        id: "rayleigh_jeans_B_nu",
        name: "Rayleigh–Jeans Law (B_ν, low frequency)",
        description: "Long-wavelength / low-frequency limit of Planck: B_ν ≈ 2kTν²/c². Trigger: hν ≪ kT, radio / long-λ tails.",
        equation: "B_nu = 2 * k * T * nu^2 / c^2",
        concepts: ["rayleigh jeans", "blackbody", "low frequency limit", "thermal radiation", "science olympiad astronomy"],
        keywords: ["rayleigh jeans", "B nu low frequency", "radio blackbody limit"],
        variables: [
            { symbol: "B_nu", name: "Spectral Radiance B_ν", unit: "W/(m²·sr·Hz)", description: "RJ spectral radiance" },
            { symbol: "T", name: "Temperature", unit: "Kelvin", description: "Temperature" },
            { symbol: "nu", name: "Frequency", unit: "Hz", description: "Frequency" }
        ],
        constants: { k: 1.380649e-23, c: 2.99792458e8 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["planck_blackbody_nu_frequency", "blackbody_radiation", "wiens_law"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["rayleigh jeans law", "low frequency blackbody"]
    },
    {
        id: "stellar_mass_continuity",
        name: "Mass Continuity (Spherical Shell)",
        description: "Structure equation: mass enclosed increases with shell thickness — dM/dr = 4πr²ρ. Links density profile to enclosed mass M(r).",
        equation: "dM_dr = 4 * pi * r^2 * rho",
        concepts: ["stellar structure", "mass continuity", "hydrostatic equilibrium", "shell model", "science olympiad astronomy"],
        keywords: ["dM dr", "mass continuity", "enclosed mass gradient", "stellar structure equation"],
        variables: [
            { symbol: "dM_dr", name: "dM/dr", unit: "kg/m", description: "Mass gradient with radius" },
            { symbol: "r", name: "Radius", unit: "meters", description: "Radial coordinate" },
            { symbol: "rho", name: "Density", unit: "kg/m³", description: "Mass density at r" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["hydrostatic_balance", "stellar_luminosity_shell", "average_density", "central_pressure_approximate"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["mass continuity star", "dM dr 4 pi r squared rho"]
    },
    {
        id: "stellar_luminosity_shell",
        name: "Energy Generation (Luminosity Gradient)",
        description: "Local luminosity from nuclear energy generation ε: dL/dr = 4πr²ρε. Standard stellar structure relation alongside hydrostatic and continuity.",
        equation: "dL_dr = 4 * pi * r^2 * rho * epsilon_gen",
        concepts: ["stellar structure", "energy generation", "nuclear burning", "luminosity gradient", "science olympiad astronomy"],
        keywords: ["dL dr", "luminosity gradient", "epsilon nuclear", "stellar energy generation"],
        variables: [
            { symbol: "dL_dr", name: "dL/dr", unit: "W/m", description: "Luminosity gradient with radius" },
            { symbol: "r", name: "Radius", unit: "meters", description: "Radial coordinate" },
            { symbol: "rho", name: "Density", unit: "kg/m³", description: "Mass density" },
            { symbol: "epsilon_gen", name: "Energy Generation Rate ε", unit: "W/kg", description: "Power released per unit mass (nuclear)" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["stellar_mass_continuity", "nuclear_energy_generation", "hydrostatic_balance", "radiative_transport_temperature_gradient"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["dL dr stellar", "luminosity shell energy generation"]
    },
    {
        id: "cyclotron_frequency",
        name: "Cyclotron Angular Frequency",
        description: "Non-relativistic gyration: ω_c = qB/m. Trigger: charged particle in uniform B, Larmor motion, plasma diagnostics.",
        equation: "omega_c = q * B / m",
        concepts: ["cyclotron", "magnetic field", "plasma physics", "larmor", "science olympiad astronomy"],
        keywords: ["cyclotron frequency", "gyrofrequency", "q B over m", "larmor frequency"],
        variables: [
            { symbol: "omega_c", name: "Cyclotron Angular Frequency ω_c", unit: "rad/s", description: "Angular gyration frequency" },
            { symbol: "q", name: "Charge", unit: "C", description: "Particle charge" },
            { symbol: "B", name: "Magnetic Field", unit: "Tesla", description: "Magnetic field strength" },
            { symbol: "m", name: "Mass", unit: "kg", description: "Particle mass" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["zeeman_splitting", "synchrotron_frequency", "magnetic_pressure_si", "alfven_speed"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["cyclotron frequency", "gyrofrequency", "omega c q B m"]
    },
    {
        id: "alfven_speed",
        name: "Alfvén Speed (SI, ideal MHD)",
        description: "Characteristic MHD wave speed v_A = B/√(μ₀ρ). Gaussian form B/√(4πρ) is equivalent in cgs units; here SI with μ₀. Trigger: magnetic support in ISM, jets, reconnection scales.",
        equation: "v_A = B / sqrt(mu_0 * rho)",
        concepts: ["alfven wave", "MHD", "magnetic field", "plasma", "interstellar medium", "science olympiad astronomy"],
        keywords: ["alfven speed", "alfven velocity", "MHD wave speed", "B over root mu0 rho"],
        variables: [
            { symbol: "v_A", name: "Alfvén Speed", unit: "m/s", description: "Alfvén velocity" },
            { symbol: "B", name: "Magnetic Field", unit: "Tesla", description: "Field strength" },
            { symbol: "rho", name: "Mass Density", unit: "kg/m³", description: "Plasma mass density" },
            { symbol: "mu_0", name: "Vacuum Permeability μ₀", unit: "N/A²", description: "Permeability of free space" }
        ],
        constants: { mu_0: 1.25663706212e-6 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["magnetic_pressure_si", "magnetic_energy_density", "sound_speed", "cyclotron_frequency"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["alfven speed", "alfven velocity", "MHD alfven"]
    },
    {
        id: "bondi_accretion_rate",
        name: "Bondi–Hoyle Accretion Rate (Order-of-Magnitude)",
        description: "Spherical Bondi capture scaling: Ṁ ∝ G²M²ρ/c_s³ (exact prefactor depends on γ; this is the standard competition form). Use with sound_speed for c_s. Trigger: accretion onto compact object from ambient medium.",
        equation: "Mdot = 4 * pi * G^2 * M^2 * rho / (c_s^3)",
        concepts: ["bondi accretion", "accretion", "compact objects", "interstellar medium", "science olympiad astronomy"],
        keywords: ["bondi accretion", "bondi hoyle", "accretion rate ambient", "M dot bondi"],
        variables: [
            { symbol: "Mdot", name: "Accretion Rate Ṁ", unit: "kg/s", description: "Mass accretion rate (order-of-magnitude)" },
            { symbol: "M", name: "Point Mass", unit: "kg", description: "Accretor mass" },
            { symbol: "rho", name: "Ambient Density", unit: "kg/m³", description: "Gas density far from accretor" },
            { symbol: "c_s", name: "Sound Speed", unit: "m/s", description: "Isothermal sound speed of ambient gas" }
        ],
        constants: { G: 6.67430e-11 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["accretion_luminosity", "eddington_luminosity", "sound_speed", "newton_gravitational_force", "schwarzschild_radius"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["bondi accretion", "bondi capture rate", "accretion from ism"]
    },
    {
        id: "gravitational_wave_quadrupole_luminosity",
        name: "Gravitational-Wave Luminosity (Quadrupole, Leading Order)",
        description: "Power radiated in GWs for circular binary: P = (32/5)(G⁴/c⁵)(m₁m₂)²(m₁+m₂)/a⁵. Pairs with orbital_decay_gravitational_radiation (da/dt).",
        equation: "P_GW = (32/5) * (G^4 / c^5) * (M1^2 * M2^2 * (M1 + M2)) / a^5",
        concepts: ["gravitational waves", "binary systems", "quadrupole radiation", "general relativity", "science olympiad astronomy"],
        keywords: ["gravitational wave power", "GW luminosity", "binary GW energy loss", "quadrupole formula"],
        variables: [
            { symbol: "P_GW", name: "GW Power P", unit: "W", description: "Gravitational-wave luminosity" },
            { symbol: "M1", name: "Mass m₁", unit: "kg", description: "First component mass" },
            { symbol: "M2", name: "Mass m₂", unit: "kg", description: "Second component mass" },
            { symbol: "a", name: "Semi-major Axis", unit: "meters", description: "Orbital separation (circular approx.)" }
        ],
        constants: { G: 6.67430e-11, c: 2.99792458e8 },
        relationships: {
            prerequisites: ["kepler_third_law_binary"],
            derivedFrom: [],
            relatedTo: ["orbital_decay_gravitational_radiation", "white_dwarf_orbital_decay", "white_dwarf_merger_timescale", "kepler_third_law_binary", "orbital_energy"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["gravitational wave luminosity", "GW power binary", "quadrupole gravitational radiation"]
    },
    {
        id: "thermal_doppler_broadening",
        name: "Thermal Doppler Line Width (Non-relativistic)",
        description: "Gaussian thermal broadening: Δλ ≈ λ√(2kT/(mc²)). Trigger: spectral line width from thermal motion.",
        equation: "delta_lambda = lambda * sqrt(2 * k * T / (m * c^2))",
        concepts: ["spectral line", "thermal broadening", "doppler", "spectroscopy", "science olympiad astronomy"],
        keywords: ["thermal broadening", "line width temperature", "doppler width", "delta lambda thermal"],
        variables: [
            { symbol: "delta_lambda", name: "Δλ", unit: "meters", description: "Line width (FWHM-style scaling)" },
            { symbol: "lambda", name: "Rest Wavelength λ", unit: "meters", description: "Line center wavelength" },
            { symbol: "T", name: "Temperature", unit: "Kelvin", description: "Thermal temperature" },
            { symbol: "m", name: "Particle Mass", unit: "kg", description: "Emitter mass (e.g. atom)" }
        ],
        constants: { k: 1.380649e-23, c: 2.99792458e8 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["doppler_shift", "doppler_shift_approx", "gas_kinetic_temperature", "boltzmann_equation"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["thermal line broadening", "spectral line width temperature", "doppler broadening"]
    },
    // --- Olympiad / exam crash-course: neutron stars, tides, MHD, SN Ia (scaling + solvable forms) ---
    {
        id: "pulsar_light_cylinder",
        name: "Pulsar Light Cylinder Radius",
        description: "Corotation limit: field lines past R_LC cannot close inside the magnetosphere at rigid rotation. R_LC = c/Ω with Ω the spin angular velocity (rad/s). Trigger: pulsar wind, open field lines, polar cap geometry.",
        equation: "R_LC = c / omega_spin",
        concepts: ["pulsar", "neutron star", "light cylinder", "magnetosphere", "rotation", "science olympiad astronomy"],
        keywords: ["light cylinder", "pulsar R_LC", "c over omega", "corotation radius"],
        variables: [
            { symbol: "R_LC", name: "Light Cylinder Radius R_LC", unit: "meters", description: "Radius where corotation speed would reach c" },
            { symbol: "c", name: "Speed of Light", unit: "m/s", description: "Vacuum speed of light" },
            { symbol: "omega_spin", name: "Spin Angular Velocity Ω", unit: "rad/s", description: "Neutron star rotation rate" }
        ],
        constants: { c: 2.99792458e8 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["pulsar_polar_cap_angle", "rotational_velocity", "cyclotron_frequency", "alfven_speed"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["light cylinder pulsar", "R_LC c omega", "pulsar corotation radius"]
    },
    {
        id: "pulsar_polar_cap_angle",
        name: "Pulsar Polar Cap Angle (Dipole Order-of-Magnitude)",
        description: "Last closed field lines: polar cap angular size θ_pc ~ √(R_star/R_LC) (radians). Pairs with light cylinder for lighthouse / beam geometry estimates.",
        equation: "theta_pc = sqrt(R_star / R_LC)",
        concepts: ["pulsar", "polar cap", "magnetic dipole", "neutron star", "science olympiad astronomy"],
        keywords: ["polar cap angle", "pulsar theta pc", "dipole light cylinder"],
        variables: [
            { symbol: "theta_pc", name: "Polar Cap Angle θ_pc", unit: "rad", description: "Half-opening angle scale (order-of-magnitude)" },
            { symbol: "R_star", name: "Neutron Star Radius", unit: "meters", description: "Stellar radius" },
            { symbol: "R_LC", name: "Light Cylinder Radius", unit: "meters", description: "From R_LC = c/Ω" }
        ],
        relationships: {
            prerequisites: ["pulsar_light_cylinder"],
            derivedFrom: [],
            relatedTo: ["pulsar_light_cylinder", "magnetic_pressure_si", "synchrotron_power"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["polar cap pulsar", "theta pc sqrt R over R_LC"]
    },
    {
        id: "tidal_disruption_radius_scaling",
        name: "Tidal Disruption Distance Scaling (Density Form)",
        description: "When tidal acceleration ~ self-gravity, characteristic distance scales as d ∝ (M/ρ)^(1/3): denser objects survive closer to the same perturber mass M. Order-of-magnitude; omits shape factors. Pairs with tidal_acceleration_differential and Roche limits.",
        equation: "d = (M / rho)^(1/3)",
        solveFor: {
            d: "d = (M / rho)^(1/3)",
            M: "M = rho * d^3",
            rho: "rho = M / d^3"
        },
        concepts: ["tidal disruption", "tidal force", "neutron star", "black hole", "density", "science olympiad astronomy"],
        keywords: ["tidal disruption radius", "M over rho one third", "spaghettification scale", "density survival"],
        variables: [
            { symbol: "d", name: "Characteristic Distance d", unit: "meters", description: "Disruption / survival distance scale" },
            { symbol: "M", name: "Perturber Mass M", unit: "kg", description: "Tidal perturber (e.g. SMBH) mass" },
            { symbol: "rho", name: "Object Average Density ρ", unit: "kg/m³", description: "Mean density of disrupted body" }
        ],
        relationships: {
            prerequisites: ["tidal_acceleration_differential"],
            derivedFrom: [],
            relatedTo: ["tidal_acceleration_differential", "roche_limit", "roche_limit_rigid", "surface_gravity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["tidal disruption density", "M rho one third tidal", "survive closer denser"]
    },
    {
        id: "radiation_force_thomson_luminosity",
        name: "Radiation Force (Thomson, Spherical Luminosity)",
        description: "Force on cross-section σ at distance r from isotropic luminosity L: F = Lσ/(4πr²c). Compare to gravity via σ/m (Eddington / line-driving). Trigger: radiation pressure vs gravity.",
        equation: "F_rad = L * sigma / (4 * pi * r^2 * c)",
        concepts: ["radiation pressure", "thomson scattering", "eddington", "luminosity", "science olympiad astronomy"],
        keywords: ["radiation force", "L sigma over r squared c", "thomson force", "radiation vs gravity"],
        variables: [
            { symbol: "F_rad", name: "Radiation Force", unit: "N", description: "Force from photon momentum transfer" },
            { symbol: "L", name: "Luminosity", unit: "W", description: "Isotropic source luminosity" },
            { symbol: "sigma", name: "Cross Section σ", unit: "m²", description: "Interaction cross section (e.g. Thomson)" },
            { symbol: "r", name: "Distance", unit: "meters", description: "Radius from source" }
        ],
        constants: { c: 2.99792458e8, pi: Math.PI },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["eddington_luminosity", "momentum_transfer_radiation", "flux_from_luminosity", "accretion_luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["radiation force luminosity", "thomson force L sigma", "radiation pressure cross section"]
    },
    {
        id: "rayleigh_taylor_growth_rate",
        name: "Rayleigh–Taylor Growth Rate (Inviscid Scaling)",
        description: "Interface instability when dense fluid accelerates into lighter fluid: γ_RT ~ √(gk). k = 2π/λ. Large λ → small k → slower growth (exam scaling).",
        equation: "gamma_RT = sqrt(g * k)",
        concepts: ["rayleigh taylor", "supernova remnant", "fluid instability", "science olympiad astronomy"],
        keywords: ["rayleigh taylor growth", "sqrt g k", "SNR instability"],
        variables: [
            { symbol: "gamma_RT", name: "Growth Rate γ_RT", unit: "Hz", description: "Instability growth rate (1/s)" },
            { symbol: "g", name: "Effective Acceleration g", unit: "m/s²", description: "Effective gravity / acceleration at interface" },
            { symbol: "k", name: "Wavenumber k", unit: "rad/m", description: "Spatial wavenumber (2π/λ)" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["kelvin_helmholtz_growth_rate", "sound_speed", "hydrostatic_balance"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["rayleigh taylor", "RT instability growth", "sqrt g k instability"]
    },
    {
        id: "kelvin_helmholtz_growth_rate",
        name: "Kelvin–Helmholtz Growth Rate (Shear Scaling)",
        description: "Shear instability at velocity jump Δv across interface: γ_KH ~ k Δv. Small wavelengths (large k) grow quickly. Compare γ_KH to γ_RT by scale.",
        equation: "gamma_KH = k * dv",
        concepts: ["kelvin helmholtz", "shear instability", "nebula", "science olympiad astronomy"],
        keywords: ["kelvin helmholtz growth", "k delta v", "shear instability"],
        variables: [
            { symbol: "gamma_KH", name: "Growth Rate γ_KH", unit: "Hz", description: "Shear instability growth rate" },
            { symbol: "k", name: "Wavenumber k", unit: "rad/m", description: "Spatial wavenumber" },
            { symbol: "dv", name: "Velocity Shear Δv", unit: "m/s", description: "Velocity difference across interface" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["rayleigh_taylor_growth_rate", "sound_speed", "alfven_speed"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["kelvin helmholtz", "KH instability", "shear k delta v"]
    },
    {
        id: "alfven_mach_number",
        name: "Alfvén Mach Number",
        description: "M_A = v/v_A. M_A < 1: magnetic stresses dominate; M_A > 1: flow dominates. Pairs with alfven_speed.",
        equation: "M_A = v / v_A",
        concepts: ["alfven mach", "MHD", "plasma", "science olympiad astronomy"],
        keywords: ["alfven mach number", "v over v_A", "MHD mach"],
        variables: [
            { symbol: "M_A", name: "Alfvén Mach Number", unit: "dimensionless", description: "Flow speed relative to Alfvén speed" },
            { symbol: "v", name: "Flow Speed", unit: "m/s", description: "Plasma or shock speed" },
            { symbol: "v_A", name: "Alfvén Speed", unit: "m/s", description: "Characteristic MHD wave speed" }
        ],
        relationships: {
            prerequisites: ["alfven_speed"],
            derivedFrom: [],
            relatedTo: ["alfven_speed", "magnetic_pressure_si", "sound_speed"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["alfven mach", "M_A MHD", "v over alfven speed"]
    },
    {
        id: "type_ia_snr_peak_time_diffusion",
        name: "Type Ia Peak Time (Photon Diffusion Scaling)",
        description: "Homologous expansion with diffusion: peak when t_diff ~ t_exp. Scaling t_peak ~ √(κM/(cv)) with κ opacity, M ejecta mass, v expansion speed. Trigger: SN Ia light curve width–luminosity context.",
        equation: "t_peak = sqrt(kappa * M / (c * v))",
        concepts: ["type Ia supernova", "photon diffusion", "light curve", "opacity", "science olympiad astronomy"],
        keywords: ["SN Ia peak time", "diffusion time supernova", "kappa M over c v"],
        variables: [
            { symbol: "t_peak", name: "Peak Time t_peak", unit: "s", description: "Characteristic rise/peak timescale" },
            { symbol: "kappa", name: "Opacity κ", unit: "m²/kg", description: "Rosseland-mean or effective opacity" },
            { symbol: "M", name: "Ejecta Mass", unit: "kg", description: "Ejecta mass scale" },
            { symbol: "c", name: "Speed of Light", unit: "m/s", description: "c" },
            { symbol: "v", name: "Expansion Speed", unit: "m/s", description: "Homologous expansion velocity" }
        ],
        constants: { c: 2.99792458e8 },
        relationships: {
            prerequisites: ["optical_depth"],
            derivedFrom: [],
            relatedTo: [
                "optical_depth",
                "chandrasekhar_limit",
                "flux_from_luminosity",
                "radiation_transport",
                "photon_diffusion_time_optical_depth",
                "supernova_luminosity_kinetic_diffusion"
            ],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["type Ia light curve", "SN Ia diffusion peak", "supernova peak time opacity"]
    },
    {
        id: "stellar_gravity_dynamical_time",
        name: "Gravity Dynamical Time (ρ scaling)",
        description: "Order-of-magnitude timescale for self-gravity of uniform-density matter: t_dyn ~ 1/√(Gρ). Compare to diffusion, nuclear, and thermal times in Olympiad ‘which process wins?’ problems. Related to free-fall and pulsation scaling.",
        equation: "t_dyn = 1 / sqrt(G * rho)",
        concepts: ["dynamical time", "stellar structure", "gravity", "collapse", "timescale", "science olympiad astronomy"],
        keywords: ["dynamical time", "one over sqrt G rho", "free fall timescale", "core collapse scale"],
        variables: [
            { symbol: "t_dyn", name: "Dynamical Time t_dyn", unit: "s", description: "Characteristic gravitational timescale" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "rho", name: "Density ρ", unit: "kg/m³", description: "Typical or mean density" }
        ],
        constants: { G: 6.67430e-11 },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["average_density", "hydrostatic_balance", "jeans_mass", "type_ia_snr_peak_time_diffusion", "supernova_luminosity_kinetic_diffusion"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["dynamical time density", "t dyn G rho", "gravity timescale star"]
    },
    {
        id: "adiabatic_gradient_ideal_gas",
        name: "Adiabatic Gradient (Ideal Gas, ∇_ad)",
        description: "Logarithmic adiabatic temperature–pressure gradient for an ideal gas: ∇_ad = (γ−1)/γ. Monatomic non-relativistic: γ = 5/3 → ∇_ad = 2/5. Used with Schwarzschild criterion for convection vs radiation (convection_criterion).",
        equation: "nabla_ad = (gamma_gas - 1) / gamma_gas",
        concepts: ["adiabatic gradient", "convection", "stellar structure", "ideal gas", "science olympiad astronomy"],
        keywords: ["nabla ad", "adiabatic gradient ideal gas", "gamma minus one over gamma"],
        variables: [
            { symbol: "nabla_ad", name: "∇_ad", unit: "dimensionless", description: "Adiabatic d ln T / d ln P (dimensionless)" },
            { symbol: "gamma_gas", name: "Adiabatic Index γ", unit: "dimensionless", description: "Ratio of specific heats C_p/C_v" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["convection_criterion", "sound_speed", "ideal_gas_pressure", "radiative_transport_temperature_gradient"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["adiabatic gradient", "nabla ad convection", "gamma ideal gas star"]
    },
    {
        id: "compact_object_keplerian_breakup_omega",
        name: "Keplerian Breakup Angular Speed (Massive Sphere)",
        description: "Order-of-magnitude maximum rigid spin before mass shedding: Ω ~ √(GM/R³) (same scaling as orbital angular speed at the equator). Applies to neutron stars / compact bodies in competition estimates.",
        equation: "omega_k = sqrt(G * M / R^3)",
        concepts: ["neutron star", "rotation", "breakup", "compact objects", "science olympiad astronomy"],
        keywords: ["breakup spin", "omega sqrt GM R3", "keplerian spin limit"],
        variables: [
            { symbol: "omega_k", name: "Angular Speed Ω", unit: "rad/s", description: "Keplerian / breakup-scale rotation rate" },
            { symbol: "G", name: "Gravitational Constant", unit: "m³/(kg·s²)", description: "G" },
            { symbol: "M", name: "Mass", unit: "kg", description: "Stellar / remnant mass" },
            { symbol: "R", name: "Radius", unit: "meters", description: "Equatorial radius" }
        ],
        constants: { G: 6.67430e-11 },
        relationships: {
            prerequisites: ["surface_gravity"],
            derivedFrom: [],
            relatedTo: ["surface_gravity", "orbital_velocity", "pulsar_light_cylinder", "alfven_speed"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["neutron star max spin", "breakup angular velocity", "sqrt GM over R cubed omega"]
    },
    {
        id: "photon_diffusion_time_optical_depth",
        name: "Photon Diffusion Time (τ, Slab Scale)",
        description: "Random-walk escape time scaling: t_diff ~ τ R / c for optical depth τ and thickness R. Pairs with optical_depth and Type Ia diffusion arguments.",
        equation: "t_diff = tau * R / c",
        concepts: ["photon diffusion", "optical depth", "supernova", "radiative transfer", "science olympiad astronomy"],
        keywords: ["diffusion time tau R c", "random walk photon", "optical depth diffusion"],
        variables: [
            { symbol: "t_diff", name: "Diffusion Time", unit: "s", description: "Photon diffusion timescale" },
            { symbol: "tau", name: "Optical Depth τ", unit: "dimensionless", description: "Effective optical depth through ejecta" },
            { symbol: "R", name: "Scale Radius", unit: "meters", description: "Characteristic thickness or radius" }
        ],
        constants: { c: 2.99792458e8 },
        relationships: {
            prerequisites: ["optical_depth"],
            derivedFrom: [],
            relatedTo: ["optical_depth", "type_ia_snr_peak_time_diffusion", "radiation_transport", "supernova_luminosity_kinetic_diffusion"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["photon diffusion time", "tau R over c", "diffusion optical depth"]
    },
    {
        id: "supernova_luminosity_kinetic_diffusion",
        name: "Supernova Luminosity (Kinetic ÷ Diffusion Scaling)",
        description: "Order-of-magnitude luminosity when internal energy leaks on diffusion time: L ~ E_kin / t_diff. Useful for comparing SN cooling/diffusion-limited emission scales in exam reasoning.",
        equation: "L_SN = E_kin / t_diff",
        concepts: ["supernova", "luminosity", "diffusion", "ejecta", "science olympiad astronomy"],
        keywords: ["supernova luminosity kinetic", "E kin over t diff", "diffusion limited luminosity"],
        variables: [
            { symbol: "L_SN", name: "Luminosity L", unit: "W", description: "Emergent luminosity scale" },
            { symbol: "E_kin", name: "Kinetic Energy", unit: "J", description: "Ejecta kinetic energy scale" },
            { symbol: "t_diff", name: "Diffusion Time", unit: "s", description: "Photon escape / diffusion time" }
        ],
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["photon_diffusion_time_optical_depth", "type_ia_snr_peak_time_diffusion", "stellar_gravity_dynamical_time", "luminosity"],
            uses: [],
            generalizes: [],
            specializes: []
        },
        questionPatterns: ["supernova luminosity diffusion", "L Ekin tdiff", "ejecta energy luminosity"]
    }
];

// Formula confidence research metadata
// Purpose: distinguish first-principles laws from approximations, empirical fits,
// and rough heuristics so search ranking and UI confidence can reflect formula reliability.
const FORMULA_CONFIDENCE_OVERRIDES = {
    hubble_law: 82,
    lookback_time: 74,
    doppler_shift_approx: 82,
    redshift_velocity_low: 82,
    redshift_peculiar_velocity: 82,
    distance_modulus_high_redshift: 74,
    roche_limit: 80,
    roche_limit_rigid: 82,
    roche_lobe_spherical: 74,
    L1_point_approximation: 70,
    kepler_second_law_area_rate: 94,
    eccentricity_from_area_rate: 90,
    stellar_lifetime: 74,
    solar_lifetime_efficiency: 78,
    kelvin_helmholtz_timescale_exact: 80,
    luminosity_infall: 80,
    accretion_luminosity: 88,
    virial_temperature_gas: 82,
    virial_velocity_dispersion: 82,
    mass_luminosity_relation: 76,
    period_luminosity_relation_cepheid: 78,
    period_luminosity_cepheid_classical: 78,
    bolometric_correction: 76,
    white_dwarf_mass_radius: 72,
    chandrasekhar_limit: 74,
    hr_color_index: 72,
    stellar_activity_index: 70,
    tully_fisher_relation: 76,
    faber_jackson_relation: 76,
    m_sigma_relation: 76,
    max_gamma_bohm: 68,
    cooling_break_gamma: 70,
    cooling_break_frequency: 74,
    thermal_time: 80,
    bondi_accretion_rate: 84,
    rayleigh_jeans_B_nu: 88,
    stellar_mass_continuity: 94,
    stellar_luminosity_shell: 90,
    gravitational_wave_quadrupole_luminosity: 92,
    escape_orbital_velocity_ratio: 96,
    pulsar_light_cylinder: 90,
    pulsar_polar_cap_angle: 70,
    tidal_disruption_radius_scaling: 68,
    radiation_force_thomson_luminosity: 88,
    rayleigh_taylor_growth_rate: 72,
    kelvin_helmholtz_growth_rate: 72,
    alfven_mach_number: 90,
    type_ia_snr_peak_time_diffusion: 74,
    stellar_gravity_dynamical_time: 72,
    adiabatic_gradient_ideal_gas: 90,
    compact_object_keplerian_breakup_omega: 82,
    photon_diffusion_time_optical_depth: 86,
    supernova_luminosity_kinetic_diffusion: 70
};

function inferFormulaConfidenceScore(formula) {
    if (!formula) return 85;

    if (Object.prototype.hasOwnProperty.call(FORMULA_CONFIDENCE_OVERRIDES, formula.id)) {
        return FORMULA_CONFIDENCE_OVERRIDES[formula.id];
    }

    const text = [
        formula.name || '',
        formula.description || '',
        formula.equation || '',
        ...(formula.keywords || []),
        ...(formula.concepts || [])
    ].join(' ').toLowerCase();

    const equation = String(formula.equation || '').toLowerCase();

    // Heuristics:
    // 96 = exact/definitional or first-principles relation within its stated model
    // 84 = controlled approximation or limited-domain formula
    // 76 = empirical/calibrated relation
    // 68 = rough heuristic, proportionality, or order-of-magnitude estimate
    if (
        equation.includes('∝') ||
        /\border[- ]of[- ]magnitude\b|\brough\b|\bheuristic\b|\bgeneral nfw form\b/.test(text)
    ) {
        return 68;
    }

    if (
        /\bempirical\b|\bperiod-luminosity\b|\bmass-luminosity\b|\btully-fisher\b|\bfaber-jackson\b|\bm-sigma\b|\bbolometric correction\b|\bactivity index\b/.test(text)
    ) {
        return 76;
    }

    if (
        /\bapproximate\b|\bapproximation\b|\bsimplified\b|\bsmall angle\b|\bnon-relativistic\b|\bvalid when\b|\bassuming\b|\btypical\b|\bcommon value\b|\bspherical approximation\b|\brigid body\b|\bcurrent value\b|\blow z\b|\bhigh-redshift\b/.test(text)
    ) {
        return 84;
    }

    return 96;
}

function inferFormulaConfidenceTier(score) {
    if (score >= 94) return 'exact';
    if (score >= 80) return 'approximation';
    if (score >= 74) return 'empirical';
    return 'heuristic';
}

function inferFormulaConfidenceRationale(tier) {
    switch (tier) {
        case 'exact':
            return 'First-principles or definitional relation within the stated model.';
        case 'approximation':
            return 'Standard approximation with stated assumptions or limited validity range.';
        case 'empirical':
            return 'Calibrated from observations or model-dependent stellar relations.';
        default:
            return 'Heuristic, proportional, or rough-order estimate; use with caution.';
    }
}

function computeFormulaSearchWeight(score) {
    // Keep weighting modest so relevance still dominates query matching.
    return Math.max(0.85, Math.min(1.10, 1 + ((score - 85) / 200)));
}

function applyFormulaConfidenceResearch(formula) {
    const score = inferFormulaConfidenceScore(formula);
    const tier = inferFormulaConfidenceTier(score);

    formula.formulaConfidence = score;
    formula.confidenceTier = tier;
    formula.confidenceRationale = inferFormulaConfidenceRationale(tier);
    formula.searchWeight = computeFormulaSearchWeight(score);

    return formula;
}

formulas.forEach(applyFormulaConfidenceResearch);

// IDs hidden from the main formula card grid (still available to search/solver/tests)
var EXCLUDED_FORMULA_CARD_IDS = new Set([
    'chandrasekhar_limit',
    'roche_limit',
    'roche_limit_rigid',
    'diffraction_limit',
    'max_gamma_bohm'
]);
if (typeof window !== 'undefined') {
    window.EXCLUDED_FORMULA_CARD_IDS = EXCLUDED_FORMULA_CARD_IDS;
}

// Formula Relationship Infrastructure
// Builds and maintains interconnections between formulas
var formulaRelationships = {
    // Build relationship graph from formula metadata
    buildRelationshipGraph: function() {
        const graph = {};
        formulas.forEach(formula => {
            if (!formula.relationships) {
                formula.relationships = {
                    prerequisites: [],
                    derivedFrom: [],
                    relatedTo: [],
                    uses: [],
                    generalizes: [],
                    specializes: []
                };
            }
            graph[formula.id] = {
                formula: formula,
                incoming: [],
                outgoing: [],
                bidirectional: []
            };
        });
        
        // Build graph edges
        formulas.forEach(formula => {
            if (formula.relationships) {
                const node = graph[formula.id];
                
                // Process all relationship types
                ['prerequisites', 'derivedFrom', 'relatedTo', 'uses', 'generalizes', 'specializes'].forEach(relType => {
                    if (formula.relationships[relType]) {
                        formula.relationships[relType].forEach(targetId => {
                            const target = graph[targetId];
                            if (target) {
                                if (relType === 'relatedTo') {
                                    // Bidirectional
                                    if (!node.bidirectional.includes(targetId)) {
                                        node.bidirectional.push(targetId);
                                    }
                                    if (!target.bidirectional.includes(formula.id)) {
                                        target.bidirectional.push(formula.id);
                                    }
                                } else if (relType === 'prerequisites' || relType === 'derivedFrom' || relType === 'specializes') {
                                    // Incoming to this formula
                                    if (!node.incoming.includes(targetId)) {
                                        node.incoming.push(targetId);
                                    }
                                    if (!target.outgoing.includes(formula.id)) {
                                        target.outgoing.push(formula.id);
                                    }
                                } else {
                                    // Outgoing from this formula
                                    if (!node.outgoing.includes(targetId)) {
                                        node.outgoing.push(targetId);
                                    }
                                    if (!target.incoming.includes(formula.id)) {
                                        target.incoming.push(formula.id);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
        
        return graph;
    },
    
    // Get all related formulas for a given formula
    getRelatedFormulas: function(formulaId) {
        const formula = formulas.find(f => f.id === formulaId);
        if (!formula || !formula.relationships) {
            return {
                prerequisites: [],
                derivedFrom: [],
                relatedTo: [],
                uses: [],
                generalizes: [],
                specializes: [],
                all: []
            };
        }
        
        const rels = formula.relationships;
        const allRelated = new Set();
        
        // Collect all related formula IDs
        ['prerequisites', 'derivedFrom', 'relatedTo', 'uses', 'generalizes', 'specializes'].forEach(relType => {
            if (rels[relType]) {
                rels[relType].forEach(id => allRelated.add(id));
            }
        });
        
        return {
            prerequisites: rels.prerequisites || [],
            derivedFrom: rels.derivedFrom || [],
            relatedTo: rels.relatedTo || [],
            uses: rels.uses || [],
            generalizes: rels.generalizes || [],
            specializes: rels.specializes || [],
            all: Array.from(allRelated)
        };
    },
    
    // Get formulas that use a given variable or concept
    findFormulasByVariable: function(variableSymbol) {
        return formulas.filter(f => 
            f.variables && f.variables.some(v => 
                v.symbol.toLowerCase() === variableSymbol.toLowerCase() ||
                v.name.toLowerCase().includes(variableSymbol.toLowerCase())
            )
        ).map(f => f.id);
    },
    
    // Get formulas by shared concepts
    findFormulasByConcepts: function(concepts) {
        if (!Array.isArray(concepts)) concepts = [concepts];
        const conceptSet = new Set(concepts.map(c => c.toLowerCase()));
        
        return formulas.filter(f => {
            if (!f.concepts) return false;
            return f.concepts.some(c => conceptSet.has(c.toLowerCase()));
        }).map(f => f.id);
    },
    
    // Auto-discover relationships based on shared variables and concepts
    autoDiscoverRelationships: function() {
        formulas.forEach(formula => {
            if (!formula.relationships) {
                formula.relationships = {
                    prerequisites: [],
                    derivedFrom: [],
                    relatedTo: [],
                    uses: [],
                    generalizes: [],
                    specializes: []
                };
            }
            
            // Find formulas with shared variables
            const sharedVarFormulas = new Set();
            formula.variables.forEach(v => {
                const related = this.findFormulasByVariable(v.symbol);
                related.forEach(id => {
                    if (id !== formula.id) {
                        sharedVarFormulas.add(id);
                    }
                });
            });
            
            // Find formulas with shared concepts
            if (formula.concepts) {
                const sharedConceptFormulas = this.findFormulasByConcepts(formula.concepts);
                sharedConceptFormulas.forEach(id => {
                    if (id !== formula.id) {
                        sharedVarFormulas.add(id);
                    }
                });
            }
            
            // Add to relatedTo if not already there
            sharedVarFormulas.forEach(id => {
                if (!formula.relationships.relatedTo.includes(id)) {
                    formula.relationships.relatedTo.push(id);
                }
            });
        });
    },
    
    // Get relationship path between two formulas
    findPath: function(fromId, toId, maxDepth = 5) {
        const graph = this.buildRelationshipGraph();
        const visited = new Set();
        const queue = [{ id: fromId, path: [fromId], depth: 0 }];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.id === toId) {
                return current.path;
            }
            
            if (current.depth >= maxDepth || visited.has(current.id)) {
                continue;
            }
            
            visited.add(current.id);
            const node = graph[current.id];
            
            if (node) {
                [...node.outgoing, ...node.bidirectional].forEach(nextId => {
                    if (!visited.has(nextId)) {
                        queue.push({
                            id: nextId,
                            path: [...current.path, nextId],
                            depth: current.depth + 1
                        });
                    }
                });
            }
        }
        
        return null; // No path found
    }
};

// Triple-Layered Cross-Concept Reinforcement System
// Layer 1: Concept-to-Concept relationships
// Layer 2: Concept-to-Formula relationships
// Layer 3: Formula-to-Formula relationships
var crossConceptReinforcement = {
    // Layer 1: Concept-to-Concept Network
    conceptNetwork: {},
    
    // Layer 2: Concept-to-Formula Mapping
    conceptFormulaMap: {},
    
    // Layer 3: Formula-to-Formula Graph (uses formulaRelationships)
    
    // Initialize all three layers
    initialize: function() {
        // Only initialize if getConceptHierarchy is available (silently skip if not)
        if (typeof getConceptHierarchy !== 'function') {
            return; // Don't log anything - it's optional
        }
        console.log('[Cross-Concept Reinforcement] Initializing triple-layered system...');
        this.buildConceptNetwork();
        this.buildConceptFormulaMapping();
        this.reinforceAllLayers();
        console.log('[Cross-Concept Reinforcement] ✅ Initialized successfully');
        console.log(`[Cross-Concept Reinforcement] Layer 1: ${Object.keys(this.conceptNetwork).length} concepts`);
        console.log(`[Cross-Concept Reinforcement] Layer 2: ${Object.keys(this.conceptFormulaMap).length} concept-formula mappings`);
    },
    
    // Build Layer 1: Concept-to-Concept Network
    buildConceptNetwork: function() {
        // Get concept hierarchy from UI
        if (typeof getConceptHierarchy === 'function') {
            const hierarchy = getConceptHierarchy();
            if (hierarchy && Object.keys(hierarchy).length > 0) {
                console.log(`[Cross-Concept Reinforcement] Building Layer 1 from ${Object.keys(hierarchy).length} concepts`);
                this.conceptNetwork = {};
                
                // Build bidirectional concept relationships
                Object.keys(hierarchy).forEach(concept => {
                    const node = hierarchy[concept];
                    if (!this.conceptNetwork[concept]) {
                        this.conceptNetwork[concept] = {
                            relatedConcepts: new Set(),
                            parentConcepts: new Set(),
                            childConcepts: new Set(),
                            siblingConcepts: new Set(),
                            crossReferences: new Set()
                        };
                }
                
                // Add parent
                if (node.parent) {
                    this.conceptNetwork[concept].parentConcepts.add(node.parent);
                    if (!this.conceptNetwork[node.parent]) {
                        this.conceptNetwork[node.parent] = {
                            relatedConcepts: new Set(),
                            parentConcepts: new Set(),
                            childConcepts: new Set(),
                            siblingConcepts: new Set(),
                            crossReferences: new Set()
                        };
                    }
                    this.conceptNetwork[node.parent].childConcepts.add(concept);
                }
                
                // Add children
                if (node.children) {
                    node.children.forEach(child => {
                        this.conceptNetwork[concept].childConcepts.add(child);
                        if (!this.conceptNetwork[child]) {
                            this.conceptNetwork[child] = {
                                relatedConcepts: new Set(),
                                parentConcepts: new Set(),
                                childConcepts: new Set(),
                                siblingConcepts: new Set(),
                                crossReferences: new Set()
                            };
                        }
                        this.conceptNetwork[child].parentConcepts.add(concept);
                    });
                }
                
                // Add siblings
                if (node.siblings) {
                    node.siblings.forEach(sibling => {
                        this.conceptNetwork[concept].siblingConcepts.add(sibling);
                        if (!this.conceptNetwork[sibling]) {
                            this.conceptNetwork[sibling] = {
                                relatedConcepts: new Set(),
                                parentConcepts: new Set(),
                                childConcepts: new Set(),
                                siblingConcepts: new Set(),
                                crossReferences: new Set()
                            };
                        }
                        this.conceptNetwork[sibling].siblingConcepts.add(concept);
                    });
                }
                
                // Add cross-references
                if (node.related) {
                    node.related.forEach(related => {
                        this.conceptNetwork[concept].crossReferences.add(related);
                        if (!this.conceptNetwork[related]) {
                            this.conceptNetwork[related] = {
                                relatedConcepts: new Set(),
                                parentConcepts: new Set(),
                                childConcepts: new Set(),
                                siblingConcepts: new Set(),
                                crossReferences: new Set()
                            };
                        }
                        this.conceptNetwork[related].crossReferences.add(concept);
                    });
                }
            });
            
            // Build comprehensive related concepts set
            Object.keys(this.conceptNetwork).forEach(concept => {
                const node = this.conceptNetwork[concept];
                [...node.parentConcepts, ...node.childConcepts, 
                 ...node.siblingConcepts, ...node.crossReferences].forEach(related => {
                    node.relatedConcepts.add(related);
                });
            });
        }
        }
    },
    
    // Build Layer 2: Concept-to-Formula Mapping
    buildConceptFormulaMapping: function() {
        this.conceptFormulaMap = {};
        let mappedFormulas = 0;
        
        formulas.forEach(formula => {
            // Map concepts to formulas
            if (formula.concepts && Array.isArray(formula.concepts)) {
                formula.concepts.forEach(concept => {
                    const conceptKey = concept.toLowerCase();
                    if (!this.conceptFormulaMap[conceptKey]) {
                        this.conceptFormulaMap[conceptKey] = new Set();
                    }
                    this.conceptFormulaMap[conceptKey].add(formula.id);
                });
            }
            
            // Map keywords to formulas
            if (formula.keywords && Array.isArray(formula.keywords)) {
                formula.keywords.forEach(keyword => {
                    const keywordKey = keyword.toLowerCase();
                    if (!this.conceptFormulaMap[keywordKey]) {
                        this.conceptFormulaMap[keywordKey] = new Set();
                    }
                    this.conceptFormulaMap[keywordKey].add(formula.id);
                });
            }
            if (formula.concepts || formula.keywords) {
                mappedFormulas++;
            }
        });
        console.log(`[Cross-Concept Reinforcement] Layer 2: Mapped ${mappedFormulas} formulas to concepts`);
    },
    
    // Cross-reinforce all three layers
    reinforceAllLayers: function() {
        console.log('[Cross-Concept Reinforcement] Reinforcing all three layers...');
        // Reinforcement 1: If concepts are related, their formulas should be related
        Object.keys(this.conceptNetwork).forEach(concept => {
            const relatedConcepts = Array.from(this.conceptNetwork[concept].relatedConcepts);
            const conceptFormulas = Array.from(this.conceptFormulaMap[concept.toLowerCase()] || []);
            
            relatedConcepts.forEach(relatedConcept => {
                const relatedFormulas = Array.from(this.conceptFormulaMap[relatedConcept.toLowerCase()] || []);
                
                // Link formulas that share related concepts
                conceptFormulas.forEach(formulaId1 => {
                    relatedFormulas.forEach(formulaId2 => {
                        if (formulaId1 !== formulaId2) {
                            const formula1 = formulas.find(f => f.id === formulaId1);
                            if (formula1 && formula1.relationships) {
                                if (!formula1.relationships.relatedTo.includes(formulaId2)) {
                                    formula1.relationships.relatedTo.push(formulaId2);
                                }
                            }
                        }
                    });
                });
            });
        });
        
        // Reinforcement 2: If formulas are related, their concepts should be linked
        formulas.forEach(formula => {
            if (formula.relationships && formula.relationships.relatedTo) {
                formula.relationships.relatedTo.forEach(relatedFormulaId => {
                    const relatedFormula = formulas.find(f => f.id === relatedFormulaId);
                    if (relatedFormula && relatedFormula.concepts && formula.concepts) {
                        // Cross-link concepts from related formulas
                        formula.concepts.forEach(concept1 => {
                            relatedFormula.concepts.forEach(concept2 => {
                                const concept1Key = concept1.toLowerCase();
                                const concept2Key = concept2.toLowerCase();
                                
                                if (concept1Key !== concept2Key) {
                                    if (this.conceptNetwork[concept1Key]) {
                                        this.conceptNetwork[concept1Key].crossReferences.add(concept2Key);
                                    }
                                    if (this.conceptNetwork[concept2Key]) {
                                        this.conceptNetwork[concept2Key].crossReferences.add(concept1Key);
                                    }
                                }
                            });
                        });
                    }
                });
            }
        });
        
        // Reinforcement 3: Shared variables create concept and formula links
        formulas.forEach(formula1 => {
            formulas.forEach(formula2 => {
                if (formula1.id !== formula2.id) {
                    const sharedVars = formula1.variables.filter(v1 => 
                        formula2.variables.some(v2 => 
                            v1.symbol.toLowerCase() === v2.symbol.toLowerCase() ||
                            v1.name.toLowerCase() === v2.name.toLowerCase()
                        )
                    );
                    
                    if (sharedVars.length > 0) {
                        // Link formulas
                        if (!formula1.relationships) {
                            formula1.relationships = {
                                prerequisites: [],
                                derivedFrom: [],
                                relatedTo: [],
                                uses: [],
                                generalizes: [],
                                specializes: []
                            };
                        }
                        if (!formula1.relationships.relatedTo.includes(formula2.id)) {
                            formula1.relationships.relatedTo.push(formula2.id);
                        }
                        
                        // Link concepts through shared variables
                        sharedVars.forEach(v => {
                            const varName = v.name.toLowerCase();
                            const varSymbol = v.symbol.toLowerCase();
                            
                            if (formula1.concepts && formula2.concepts) {
                                formula1.concepts.forEach(c1 => {
                                    formula2.concepts.forEach(c2 => {
                                        if (c1.toLowerCase() !== c2.toLowerCase()) {
                                            const c1Key = c1.toLowerCase();
                                            const c2Key = c2.toLowerCase();
                                            
                                            if (this.conceptNetwork[c1Key]) {
                                                this.conceptNetwork[c1Key].crossReferences.add(c2Key);
                                            }
                                            if (this.conceptNetwork[c2Key]) {
                                                this.conceptNetwork[c2Key].crossReferences.add(c1Key);
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
            });
        });
        console.log('[Cross-Concept Reinforcement] ✅ All layers reinforced');
    },
    
    // Get reinforced relationships for a concept
    getReinforcedConcepts: function(concept) {
        const conceptKey = concept.toLowerCase();
        const node = this.conceptNetwork[conceptKey];
        if (!node) return [];
        
        const allRelated = new Set();
        [...node.parentConcepts, ...node.childConcepts, 
         ...node.siblingConcepts, ...node.crossReferences].forEach(c => allRelated.add(c));
        
        return Array.from(allRelated);
    },
    
    // Get reinforced formulas for a concept (Layer 2 + Layer 3)
    getReinforcedFormulas: function(concept) {
        const conceptKey = concept.toLowerCase();
        const directFormulas = Array.from(this.conceptFormulaMap[conceptKey] || []);
        const relatedConcepts = this.getReinforcedConcepts(concept);
        const reinforcedFormulas = new Set(directFormulas);
        
        // Add formulas from related concepts
        relatedConcepts.forEach(relatedConcept => {
            const relatedFormulas = Array.from(this.conceptFormulaMap[relatedConcept.toLowerCase()] || []);
            relatedFormulas.forEach(f => reinforcedFormulas.add(f));
        });
        
        // Add formulas related to direct formulas (Layer 3 reinforcement)
        directFormulas.forEach(formulaId => {
            const relationships = formulaRelationships.getRelatedFormulas(formulaId);
            relationships.all.forEach(relatedId => reinforcedFormulas.add(relatedId));
        });
        
        return Array.from(reinforcedFormulas);
    },
    
    // Get cross-layer path from concept to formula
    findConceptToFormulaPath: function(concept, targetFormulaId) {
        const conceptKey = concept.toLowerCase();
        const conceptFormulas = Array.from(this.conceptFormulaMap[conceptKey] || []);
        
        // Direct connection
        if (conceptFormulas.includes(targetFormulaId)) {
            return [{ type: 'direct', concept, formula: targetFormulaId }];
        }
        
        // Through related concepts
        const relatedConcepts = this.getReinforcedConcepts(concept);
        for (const relatedConcept of relatedConcepts) {
            const relatedFormulas = Array.from(this.conceptFormulaMap[relatedConcept.toLowerCase()] || []);
            if (relatedFormulas.includes(targetFormulaId)) {
                return [
                    { type: 'concept', from: concept, to: relatedConcept },
                    { type: 'formula', concept: relatedConcept, formula: targetFormulaId }
                ];
            }
        }
        
        // Through formula relationships
        for (const formulaId of conceptFormulas) {
            const path = formulaRelationships.findPath(formulaId, targetFormulaId);
            if (path) {
                return [
                    { type: 'formula', concept, formula: formulaId },
                    ...path.slice(1).map(id => ({ type: 'formula-relation', formula: id }))
                ];
            }
        }
        
        return null;
    },
    
    // Get comprehensive reinforcement score
    getReinforcementScore: function(concept, formulaId) {
        let score = 0;
        const conceptKey = concept.toLowerCase();
        
        // Layer 2: Direct concept-formula mapping
        const directFormulas = Array.from(this.conceptFormulaMap[conceptKey] || []);
        if (directFormulas.includes(formulaId)) {
            score += 100;
        }
        
        // Layer 1 + Layer 2: Related concepts' formulas
        const relatedConcepts = this.getReinforcedConcepts(concept);
        relatedConcepts.forEach(relatedConcept => {
            const relatedFormulas = Array.from(this.conceptFormulaMap[relatedConcept.toLowerCase()] || []);
            if (relatedFormulas.includes(formulaId)) {
                score += 50;
            }
        });
        
        // Layer 3: Formula relationships
        directFormulas.forEach(formulaId1 => {
            const relationships = formulaRelationships.getRelatedFormulas(formulaId1);
            if (relationships.all.includes(formulaId)) {
                score += 30;
            }
        });
        
        return score;
    }
};

    // Auto-discover relationships on load
if (typeof formulas !== 'undefined' && formulas.length > 0) {
    formulaRelationships.autoDiscoverRelationships();
    
    // Initialize cross-concept reinforcement after relationships are built
    // PRODUCTION: only initialize when the concept hierarchy API exists; avoid noisy retry logs.
    // Check if getConceptHierarchy exists before attempting initialization
    if (typeof getConceptHierarchy === 'function') {
        setTimeout(() => {
            try {
                // Double-check it still exists (might have been removed)
                if (typeof getConceptHierarchy === 'function') {
                    crossConceptReinforcement.initialize();
                }
            } catch (e) {
                // Silently skip if initialization fails - not critical for app functionality
            }
        }, 100);
    }
    // If getConceptHierarchy doesn't exist, don't log anything - it's optional
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formulas, formulaRelationships };
}

