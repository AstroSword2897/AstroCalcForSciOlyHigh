// Formula Database for Science Olympiad Astronomy

// Global physical constants (used across all formulas)
var globalConstants = {
    G: 6.67430e-11,           // Gravitational constant in m³/(kg·s²)
    c: 2.99792458e8,          // Speed of light in m/s
    σ: 5.670374419e-8,       // Stefan-Boltzmann constant in W/(m²·K⁴)
    sigma: 5.670374419e-8,    // Alternative name for Stefan-Boltzmann constant
    h: 6.62607015e-34,        // Planck constant in J·s
    k: 1.380649e-23,          // Boltzmann constant in J/K
    e: 1.602176634e-19,       // Elementary charge in C
    m_e: 9.1093837015e-31,   // Electron mass in kg
    σ_T: 6.6524587158e-29,    // Thomson cross-section in m²
    L_sun: 3.828e26,          // Solar luminosity in W
    M_sun: 1.989e30,          // Solar mass in kg
    R_sun: 6.96e8,            // Solar radius in m
    AU: 1.496e11,             // Astronomical Unit in m
    pi: Math.PI,              // Pi
    π: Math.PI                // Pi (Greek letter)
};

// Formula categories mapping
var formulaCategories = {
    'Orbital Mechanics': [
        'kepler_third_law', 'kepler_third_law_solar', 'orbital_velocity', 'escape_velocity',
        'tidal_force', 'roche_limit', 'orbital_energy', 'vis_viva', 'center_of_mass',
        'kepler_third_law_binary', 'rotational_velocity', 'hill_radius', 'synodic_period',
        'angular_momentum_elliptical', 'tidal_locking_timescale'
    ],
    'Radiation & Stellar Properties': [
        'luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'wiens_law',
        'flux_temperature', 'distance_modulus', 'magnitude_flux_relation', 'stellar_lifetime',
        'mass_luminosity_relation', 'hr_color_index', 'hr_absolute_magnitude', 'chandrasekhar_limit',
        'white_dwarf_mass_radius', 'blackbody_radiation', 'binary_white_dwarf',
        'white_dwarf_orbital_decay', 'white_dwarf_merger_timescale', 'planck_relation',
        'equivalent_width', 'luminosity_function', 'jeans_mass'
    ],
    'Telescopes & Optics': [
        'angular_size', 'light_gathering_power', 'magnification', 'f_ratio', 'angular_resolution'
    ],
    'Cosmology & Relativity': [
        'hubble_law', 'friedmann_equation', 'critical_density', 'schwarzschild_radius',
        'time_dilation', 'length_contraction', 'parallax_distance_radians', 'parallax_distance_arcsec',
        'cosmic_redshift', 'lookback_time', 'density_parameter', 'angular_diameter_distance',
        'luminosity_distance', 'einstein_radius'
    ],
    'Doppler & Spectroscopy': [
        'doppler_shift', 'doppler_shift_approx'
    ],
    'Planetary Science & Exoplanets': [
        'surface_gravity', 'average_density', 'planetary_equilibrium_temperature',
        'greenhouse_effect', 'albedo'
    ],
    'High Energy Astrophysics': [
        'max_gamma_bohm', 'cooling_break_gamma', 'cooling_break_frequency',
        'synchrotron_cooling_timescale', 'synchrotron_power', 'magnetic_energy_density',
        'power_law_spectrum', 'spectral_index'
    ],
    'Stellar Structure': [
        'hydrostatic_balance'
    ]
};

var formulas = [
    {
        id: "kepler_third_law",
        name: "Kepler's Third Law",
        description: "Relates the orbital period to the semi-major axis of an orbit. Fundamental law of planetary motion connecting revolution time, orbital distance, and central mass. Essential for calculating orbital mechanics, binary systems, exoplanet detection, and celestial dynamics. Applies to elliptical orbits, circular orbits, and binary star systems.",
        equation: "T² = (4π²/GM) × a³",
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
        relationships: {
            prerequisites: [], // Formulas needed to understand this one
            derivedFrom: [], // Formulas this is derived from
            relatedTo: ["orbital_velocity", "escape_velocity", "vis_viva", "orbital_energy", "kepler_third_law_binary", "kepler_third_law_solar"], // Related formulas
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
        description: "The velocity of an object in circular orbit around a central body. Calculates the speed required for stable circular motion under gravitational influence. Essential for orbital mechanics, satellite dynamics, binary systems, and exoplanet characterization. Related to centripetal force, angular velocity, and orbital energy.",
        equation: "v = √(GM/r)",
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
            relatedTo: ["kepler_third_law", "orbital_velocity", "surface_gravity", "vis_viva", "orbital_energy"],
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
        description: "Minimum velocity needed to escape the gravitational pull of a body. Critical speed for breaking free from gravitational binding. Essential for rocket science, space missions, stellar evolution, and compact object physics. Related to surface gravity, orbital velocity, and gravitational potential energy.",
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
        relationships: {
            prerequisites: ["surface_gravity"],
            derivedFrom: ["surface_gravity"],
            relatedTo: ["kepler_third_law", "orbital_velocity", "surface_gravity", "vis_viva", "orbital_energy"],
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
        id: "distance_modulus",
        name: "Distance Modulus",
        description: "Relates apparent magnitude, absolute magnitude, and distance. Fundamental distance indicator in astronomy connecting observed brightness, intrinsic luminosity, and stellar distance. Essential for cosmic distance ladder, stellar classification, and extragalactic astronomy. Accounts for interstellar extinction and reddening.",
        equation: "m - M = 5 log₁₀(d) - 5",
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
        }
    },
    {
        id: "luminosity",
        name: "Stellar Luminosity",
        description: "Relates luminosity to radius and temperature (Stefan-Boltzmann Law). Fundamental stellar physics connecting total energy output, stellar size, and surface temperature. Essential for stellar evolution, HR diagram, mass-luminosity relation, and stellar classification. Applies to blackbody radiation, stellar atmospheres, and radiative transfer.",
        equation: "L = 4πR²σT⁴",
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
            σ: 5.670374419e-8  // Stefan-Boltzmann constant in W/(m²·K⁴)
        },
        relationships: {
            prerequisites: [],
            derivedFrom: [],
            relatedTo: ["distance_modulus", "magnitude_flux_relation", "flux_from_luminosity", "hr_absolute_magnitude", "mass_luminosity_relation", "stellar_lifetime"],
            uses: ["distance_modulus", "magnitude_flux_relation"],
            generalizes: [],
            specializes: []
        }
    },
    {
        id: "hubble_law",
        name: "Hubble's Law",
        description: "Relates recessional velocity to distance in an expanding universe. Fundamental cosmological law connecting galaxy motion, cosmic expansion, and cosmic distance. Essential for cosmology, big bang theory, dark energy, and large-scale structure. Basis for luminosity distance, lookback time, and cosmic age calculations.",
        equation: "v = H₀ × d",
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
            "H₀": 70  // Approximate value in km/(s·Mpc)
        },
        relationships: {
            prerequisites: ["doppler_shift", "cosmic_redshift"],
            derivedFrom: [],
            relatedTo: ["cosmic_redshift", "doppler_shift", "luminosity_distance", "lookback_time", "angular_diameter_distance"],
            uses: ["luminosity_distance", "lookback_time"],
            generalizes: [],
            specializes: []
        }
    },
    {
        id: "surface_gravity",
        name: "Surface Gravity",
        description: "Gravitational acceleration at the surface of a body. Fundamental planetary and stellar physics connecting mass, radius, and surface gravitational field strength. Essential for planetary science, exoplanet characterization, stellar structure, and compact object physics. Related to escape velocity, orbital velocity, and tidal forces.",
        equation: "g = GM/r²",
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
        }
    },
    {
        id: "angular_size",
        name: "Angular Size",
        description: "Relates physical size, distance, and angular diameter. Fundamental geometric relationship connecting linear dimensions, angular measurements, and observer distance. Essential for telescope observations, stellar radius determination, planetary imaging, and angular resolution calculations. Applies to small angle approximation and parallax measurements.",
        equation: "θ = d / D",
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
                description: "Actual size of the object, linear diameter, physical size. Related to radius, surface area, and volume. Determines angular size when combined with distance."
            },
            {
                symbol: "D",
                name: "Distance",
                unit: "meters",
                description: "Distance to the object, observer distance, stellar distance, planetary distance. Related to parallax, distance modulus, and luminosity distance. Determines angular size and apparent brightness."
            }
        ]
    },
    {
        id: "parallax_distance_radians",
        name: "Parallax Distance (Radians)",
        description: "Calculates distance to a star using parallax angle in radians (general form)",
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
            AU: 1.496e11  // 1 Astronomical Unit in meters
        }
    },
    {
        id: "parallax_distance_arcsec",
        name: "Parallax Distance (Arcseconds)",
        description: "Calculates distance to a star using parallax angle in arcseconds (small angle approximation)",
        equation: "d ≈ 1 / p",
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
        ]
    },
    {
        id: "max_gamma_bohm",
        name: "Maximum Gamma (Bohm Limit)",
        description: "Maximum Lorentz factor from acceleration vs. loss, based on Bohm limit approximation",
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
            σT: 6.6524587158e-29  // Thomson cross-section in m²
        }
    },
    {
        id: "cooling_break_gamma",
        name: "Cooling Break Lorentz Factor",
        description: "Break Lorentz factor where electrons have cooled significantly due to synchrotron radiation",
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
            m_e: 9.1093837015e-31,  // Electron mass in kg
            c: 2.99792458e8,  // Speed of light in m/s
            σ_T: 6.6524587158e-29  // Thomson cross-section in m²
        }
    },
    {
        id: "cooling_break_frequency",
        name: "Cooling Break Frequency",
        description: "Break frequency corresponding to the cooling break Lorentz factor",
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
            m_e: 9.1093837015e-31,  // Electron mass in kg
            c: 2.99792458e8  // Speed of light in m/s
        }
    },
    {
        id: "synchrotron_cooling_timescale",
        name: "Synchrotron Cooling Timescale",
        description: "Characteristic time for an electron to lose energy via synchrotron radiation",
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
            m_e: 9.1093837015e-28,  // Electron mass in grams (CGS)
            c: 2.99792458e10,  // Speed of light in cm/s (CGS)
            σ_T: 6.6524587158e-25  // Thomson cross-section in cm² (CGS)
        }
    },
    {
        id: "synchrotron_power",
        name: "Synchrotron Power",
        description: "Power radiated by a relativistic electron via synchrotron radiation",
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
            σ_T: 6.6524587158e-29,  // Thomson cross-section in m²
            c: 2.99792458e8  // Speed of light in m/s
        }
    },
    {
        id: "magnetic_energy_density",
        name: "Magnetic Energy Density",
        description: "Energy density stored in a magnetic field",
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
        id: "power_law_spectrum",
        name: "Power-Law Energy Spectrum",
        description: "Differential number of particles per unit energy as a function of energy",
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
        description: "Relates power-law index to spectral index",
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
        description: "Maximum stable mass for a white dwarf (order-of-magnitude)",
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
            "M_☉": 1.989e30  // Solar mass in kg
        }
    },
    {
        id: "white_dwarf_mass_radius",
        name: "White Dwarf Mass-Radius Relation",
        description: "Non-relativistic approximation: radius inversely proportional to cube root of mass",
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
        description: "Relates peak wavelength of blackbody radiation to temperature. Use this to find temperature from spectrum peak.",
        equation: "λmax = b / T",
        primaryUseCase: "temperature from wavelength",
        specificity: 10,
        questionPatterns: [
            "find temperature from spectrum",
            "temperature from light",
            "temperature from wavelength",
            "what temperature from color",
            "spectrum to temperature",
            "temperature based on spectrum",
            "temperature from light spectrum"
        ],
        variables: [
            {
                symbol: "λmax",
                name: "Peak Wavelength",
                unit: "meters",
                description: "Wavelength at peak emission"
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
        description: "Pressure gradient balancing gravitational force in stellar interiors",
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
        }
    },
    {
        id: "kepler_third_law_binary",
        name: "Kepler's Third Law (Binary System)",
        description: "Orbital period for a binary system",
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
        }
    },
    {
        id: "rotational_velocity",
        name: "Rotational Velocity",
        description: "Equatorial rotational velocity of a rotating body",
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
        ]
    },
    {
        id: "average_density",
        name: "Average Density",
        description: "Average density of a spherical body",
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
        ]
    },
    {
        id: "flux_from_luminosity",
        name: "Flux from Luminosity",
        description: "Observed flux based on intrinsic luminosity and distance",
        equation: "F = L / (4πd²)",
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
        ]
    },
    {
        id: "magnitude_flux_relation",
        name: "Magnitude-Flux Relation",
        description: "Compares brightness between two stars based on their magnitudes",
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
        description: "Relates brightness to luminosity and distance",
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
        description: "Relates observed wavelength shift to velocity",
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
        description: "Approximate formula for Doppler shift",
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
        id: "flux_temperature",
        name: "Flux from Temperature (Stefan-Boltzmann)",
        description: "Total flux from temperature (Stefan-Boltzmann law)",
        equation: "F = σT⁴",
        primaryUseCase: "flux from temperature",
        specificity: 6,
        questionPatterns: [
            "flux from temperature",
            "total radiation",
            "energy output temperature"
        ],
        variables: [
            {
                symbol: "F",
                name: "Flux",
                unit: "W/m²",
                description: "Radiative flux"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Blackbody temperature"
            }
        ],
        constants: {
            "σ": 5.670e-8
        }
    },
    {
        id: "light_gathering_power",
        name: "Light Gathering Power",
        description: "Ratio of light gathering ability of telescope to human eye",
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
        description: "Magnification power of a telescope",
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
        description: "Focal ratio of a telescope",
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
        description: "Tidal force between two bodies",
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
        id: "orbital_energy",
        name: "Orbital Energy",
        description: "Total energy of an orbiting body",
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
        }
    },
    {
        id: "vis_viva",
        name: "Vis Viva Equation",
        description: "Velocity at any point in an elliptical orbit",
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
        }
    },
    {
        id: "center_of_mass",
        name: "Center of Mass (Binary System)",
        description: "Center of mass position in a binary star system",
        equation: "M₁ × r₁ = M₂ × r₂, a = r₁ + r₂",
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
            "M_sun": 1.989e30,
            factor: 1e10,
            exponent: 2.5
        }
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
        }
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
        description: "Event horizon radius of a black hole",
        equation: "R_s = (2GM) / c²",
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
        equation: "B_λ(T) = (2hc² / λ⁵) × (1 / (e^(hc/(λkT)) - 1))",
        primaryUseCase: "full spectrum calculation",
        specificity: 8,
        questionPatterns: [
            "blackbody spectrum",
            "spectral radiance",
            "planck distribution",
            "full spectrum from temperature"
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
            h: 6.626e-34,
            c: 2.998e8,
            k: 1.381e-23,
            factor: 2
        }
    },
    {
        id: "binary_white_dwarf",
        name: "Binary White Dwarf System",
        description: "Orbital period and separation for a binary white dwarf system",
        equation: "P² = (4π²a³) / (G(M₁ + M₂))",
        variables: [
            {
                symbol: "P",
                name: "Orbital Period",
                unit: "seconds",
                description: "Orbital period of the binary system"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Semi-major axis of the binary orbit"
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
            G: 6.67430e-11
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
        }
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
        }
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
        }
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
        id: "angular_momentum_elliptical",
        name: "Angular Momentum (Elliptical)",
        description: "Momentum for elliptical orbit with eccentricity e",
        equation: "L = m_r × √(GMa(1 - e²))",
        variables: [
            {
                symbol: "L",
                name: "Angular Momentum",
                unit: "kg·m²/s",
                description: "Angular momentum of the orbit"
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
                symbol: "e",
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
        id: "cosmic_redshift",
        name: "Cosmic Redshift",
        description: "Stretching of light due to universe expansion",
        equation: "z = (λ_obs - λ_emit) / λ_emit",
        variables: [
            {
                symbol: "z",
                name: "Redshift",
                unit: "dimensionless",
                description: "Cosmological redshift parameter"
            },
            {
                symbol: "λ_obs",
                name: "Observed Wavelength",
                unit: "meters",
                description: "Wavelength as observed on Earth"
            },
            {
                symbol: "λ_emit",
                name: "Emitted Wavelength",
                unit: "meters",
                description: "Wavelength when emitted by the source"
            }
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
        }
    }
];

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
        this.buildConceptNetwork();
        this.buildConceptFormulaMapping();
        this.reinforceAllLayers();
    },
    
    // Build Layer 1: Concept-to-Concept Network
    buildConceptNetwork: function() {
        // Get concept hierarchy from UI
        if (typeof getConceptHierarchy === 'function') {
            const hierarchy = getConceptHierarchy();
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
    },
    
    // Build Layer 2: Concept-to-Formula Mapping
    buildConceptFormulaMapping: function() {
        this.conceptFormulaMap = {};
        
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
        });
    },
    
    // Cross-reinforce all three layers
    reinforceAllLayers: function() {
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
    if (typeof getConceptHierarchy === 'function') {
        // Wait for concept hierarchy to be available
        setTimeout(() => {
            crossConceptReinforcement.initialize();
        }, 100);
    } else {
        // Initialize immediately if hierarchy is already available
        crossConceptReinforcement.initialize();
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formulas, formulaRelationships };
}

