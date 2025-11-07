// Formula Database for Science Olympiad Astronomy

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
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = formulas;
}

