// Formula Database for Science Olympiad Astronomy

// Formula categories mapping
var formulaCategories = {
    'Orbital Mechanics': [
        'kepler_third_law', 'kepler_third_law_solar', 'orbital_velocity', 'escape_velocity',
        'tidal_force', 'roche_limit', 'orbital_energy', 'vis_viva', 'center_of_mass',
        'kepler_third_law_binary', 'rotational_velocity'
    ],
    'Radiation & Stellar Properties': [
        'luminosity', 'flux_from_luminosity', 'inverse_square_law_brightness', 'wiens_law',
        'flux_temperature', 'distance_modulus', 'magnitude_flux_relation', 'stellar_lifetime',
        'mass_luminosity_relation', 'hr_color_index', 'hr_absolute_magnitude', 'chandrasekhar_limit',
        'white_dwarf_mass_radius', 'blackbody_radiation'
    ],
    'Telescopes & Optics': [
        'angular_size', 'light_gathering_power', 'magnification', 'f_ratio', 'angular_resolution'
    ],
    'Cosmology & Relativity': [
        'hubble_law', 'friedmann_equation', 'critical_density', 'schwarzschild_radius',
        'time_dilation', 'length_contraction', 'parallax_distance_radians', 'parallax_distance_arcsec'
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
        description: "Relates the orbital period to the semi-major axis of an orbit",
        equation: "T² = (4π²/GM) × a³",
        variables: [
            {
                symbol: "T",
                name: "Orbital Period",
                unit: "seconds",
                description: "Time for one complete orbit"
            },
            {
                symbol: "a",
                name: "Semi-major Axis",
                unit: "meters",
                description: "Half the longest diameter of the elliptical orbit"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of the central body (e.g., star, planet)"
            }
        ],
        constants: {
            G: 6.67430e-11  // Gravitational constant in m³/(kg·s²)
        }
    },
    {
        id: "orbital_velocity",
        name: "Orbital Velocity",
        description: "The velocity of an object in circular orbit around a central body",
        equation: "v = √(GM/r)",
        variables: [
            {
                symbol: "v",
                name: "Orbital Velocity",
                unit: "m/s",
                description: "Speed of the orbiting object"
            },
            {
                symbol: "r",
                name: "Orbital Radius",
                unit: "meters",
                description: "Distance from center of central body to orbiting object"
            },
            {
                symbol: "M",
                name: "Central Mass",
                unit: "kg",
                description: "Mass of the central body"
            }
        ],
        constants: {
            G: 6.67430e-11
        }
    },
    {
        id: "escape_velocity",
        name: "Escape Velocity",
        description: "Minimum velocity needed to escape the gravitational pull of a body",
        equation: "v_esc = √(2GM/r)",
        variables: [
            {
                symbol: "v_esc",
                name: "Escape Velocity",
                unit: "m/s",
                description: "Velocity required to escape gravitational field"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Distance from center of the body"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of the body"
            }
        ],
        constants: {
            G: 6.67430e-11
        }
    },
    {
        id: "distance_modulus",
        name: "Distance Modulus",
        description: "Relates apparent magnitude, absolute magnitude, and distance",
        equation: "m - M = 5 log₁₀(d) - 5",
        variables: [
            {
                symbol: "m",
                name: "Apparent Magnitude",
                unit: "magnitude",
                description: "Brightness as seen from Earth"
            },
            {
                symbol: "M",
                name: "Absolute Magnitude",
                unit: "magnitude",
                description: "Intrinsic brightness at 10 parsecs"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "parsecs",
                description: "Distance to the star"
            }
        ]
    },
    {
        id: "luminosity",
        name: "Stellar Luminosity",
        description: "Relates luminosity to radius and temperature (Stefan-Boltzmann Law)",
        equation: "L = 4πR²σT⁴",
        variables: [
            {
                symbol: "L",
                name: "Luminosity",
                unit: "W",
                description: "Total power output of the star"
            },
            {
                symbol: "R",
                name: "Radius",
                unit: "meters",
                description: "Radius of the star"
            },
            {
                symbol: "T",
                name: "Temperature",
                unit: "Kelvin",
                description: "Surface temperature of the star"
            }
        ],
        constants: {
            σ: 5.670374419e-8  // Stefan-Boltzmann constant in W/(m²·K⁴)
        }
    },
    {
        id: "hubble_law",
        name: "Hubble's Law",
        description: "Relates recessional velocity to distance in an expanding universe",
        equation: "v = H₀ × d",
        variables: [
            {
                symbol: "v",
                name: "Recessional Velocity",
                unit: "km/s",
                description: "Speed at which galaxy is moving away"
            },
            {
                symbol: "H₀",
                name: "Hubble Constant",
                unit: "km/(s·Mpc)",
                description: "Rate of expansion of the universe"
            },
            {
                symbol: "d",
                name: "Distance",
                unit: "Mpc",
                description: "Distance to the galaxy"
            }
        ],
        constants: {
            "H₀": 70  // Approximate value in km/(s·Mpc)
        }
    },
    {
        id: "surface_gravity",
        name: "Surface Gravity",
        description: "Gravitational acceleration at the surface of a body",
        equation: "g = GM/r²",
        variables: [
            {
                symbol: "g",
                name: "Surface Gravity",
                unit: "m/s²",
                description: "Acceleration due to gravity at surface"
            },
            {
                symbol: "M",
                name: "Mass",
                unit: "kg",
                description: "Mass of the body"
            },
            {
                symbol: "r",
                name: "Radius",
                unit: "meters",
                description: "Radius of the body"
            }
        ],
        constants: {
            G: 6.67430e-11
        }
    },
    {
        id: "angular_size",
        name: "Angular Size",
        description: "Relates physical size, distance, and angular diameter",
        equation: "θ = d / D",
        variables: [
            {
                symbol: "θ",
                name: "Angular Size",
                unit: "radians",
                description: "Angular diameter as seen from observer"
            },
            {
                symbol: "d",
                name: "Physical Diameter",
                unit: "meters",
                description: "Actual size of the object"
            },
            {
                symbol: "D",
                name: "Distance",
                unit: "meters",
                description: "Distance to the object"
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
        description: "Relates peak wavelength of blackbody radiation to temperature",
        equation: "λmax = b / T",
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
        description: "Flux from a blackbody at temperature T",
        equation: "F = σT⁴",
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
        name: "Blackbody Radiation",
        description: "Spectral radiance of a blackbody",
        equation: "B_λ(T) = (2hc² / λ⁵) × (1 / (e^(hc/(λkT)) - 1))",
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
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = formulas;
}

