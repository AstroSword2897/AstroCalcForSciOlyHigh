/**
 * Formula-Specific Graph Configuration
 * 
 * Each formula has its own designated graph configuration:
 * - Which variable to graph (x-axis)
 * - Default bounds for each variable type
 * - Graph appearance settings
 * - Formula-specific rendering options
 * 
 * This ensures graphs match their formula cards properly.
 */

/**
 * Formula-specific graph configurations
 * Maps formula ID to graph settings
 */
const FORMULA_GRAPH_CONFIG = {
    // Orbital Mechanics
    'kepler_third_law': {
        defaultVariable: 'a', // Semi-major axis
        bounds: {
            a: { min: 1e10, max: 1e13 }, // 0.1 AU to 100 AU
            P: { min: 86400, max: 3.156e8 }, // 1 day to 10 years
            M: { min: 1e29, max: 1e32 } // 0.05 to 50 solar masses
        },
        description: 'Orbital period vs semi-major axis (Kepler\'s Third Law)',
        axisLabels: { x: 'Semi-major Axis (m)', y: 'Orbital Period (s)' }
    },
    
    'kepler_third_law_solar': {
        defaultVariable: 'a',
        bounds: {
            a: { min: 1e10, max: 1e13 },
            P: { min: 86400, max: 3.156e8 }
        },
        description: 'Orbital period vs semi-major axis (Solar System)',
        axisLabels: { x: 'Semi-major Axis (m)', y: 'Orbital Period (s)' }
    },
    
    'orbital_velocity': {
        defaultVariable: 'r',
        bounds: {
            v: { min: 0, max: 1e5 },
            r: { min: 1e6, max: 1e12 },
            M: { min: 1e23, max: 1e31 }
        },
        description: 'Orbital velocity vs orbital radius',
        axisLabels: { x: 'Orbital Radius (m)', y: 'Orbital Velocity (m/s)' }
    },
    
    'escape_velocity': {
        defaultVariable: 'r',
        bounds: {
            v_esc: { min: 0, max: 1e6 },
            r: { min: 1e6, max: 1e12 },
            M: { min: 1e23, max: 1e31 }
        },
        description: 'Escape velocity vs radius',
        axisLabels: { x: 'Radius (m)', y: 'Escape Velocity (m/s)' }
    },
    
    // Radiation & Stellar Properties
    'wiens_law': {
        defaultVariable: 'T',
        bounds: {
            lambda_max: { min: 1e-9, max: 1e-3 },
            T: { min: 100, max: 1e6 }
        },
        description: 'Peak wavelength vs temperature (Wien\'s Law)',
        axisLabels: { x: 'Temperature (K)', y: 'Peak Wavelength (m)' }
    },
    
    'stefan_boltzmann_law': {
        defaultVariable: 'T',
        bounds: {
            L: { min: 1e20, max: 1e40 },
            R: { min: 1e6, max: 1e12 },
            T: { min: 100, max: 1e6 }
        },
        description: 'Luminosity vs temperature (Stefan-Boltzmann)',
        axisLabels: { x: 'Temperature (K)', y: 'Luminosity (W)' }
    },
    
    'luminosity': {
        defaultVariable: 'R',
        bounds: {
            L: { min: 1e20, max: 1e40 },
            R: { min: 1e6, max: 1e12 },
            T: { min: 1000, max: 1e6 }
        },
        description: 'Luminosity vs radius',
        axisLabels: { x: 'Radius (m)', y: 'Luminosity (W)' }
    },
    
    'distance_modulus': {
        defaultVariable: 'd',
        bounds: {
            m: { min: -10, max: 30 },
            M: { min: -10, max: 20 },
            d: { min: 0.1, max: 1e7 } // 0.1 to 10M parsecs
        },
        description: 'Distance modulus vs distance',
        axisLabels: { x: 'Distance (parsecs)', y: 'Distance Modulus' }
    },
    
    // Cosmology
    'hubble_law': {
        defaultVariable: 'd',
        bounds: {
            v: { min: 0, max: 3e5 },
            d: { min: 0, max: 1e26 },
            H0: { min: 50, max: 100 }
        },
        description: 'Recession velocity vs distance (Hubble\'s Law)',
        axisLabels: { x: 'Distance (m)', y: 'Recession Velocity (m/s)' }
    },
    
    'schwarzschild_radius': {
        defaultVariable: 'M',
        bounds: {
            r_s: { min: 0, max: 1e12 },
            M: { min: 1e29, max: 1e32 }
        },
        description: 'Schwarzschild radius vs mass',
        axisLabels: { x: 'Mass (kg)', y: 'Schwarzschild Radius (m)' }
    },
    
    // Doppler & Spectroscopy
    'doppler_shift': {
        defaultVariable: 'v',
        bounds: {
            lambda_obs: { min: 1e-9, max: 1e-3 },
            lambda_rest: { min: 1e-9, max: 1e-3 },
            v: { min: -1e6, max: 1e6 }
        },
        description: 'Observed wavelength vs velocity (Doppler shift)',
        axisLabels: { x: 'Velocity (m/s)', y: 'Observed Wavelength (m)' }
    },
    
    'doppler_shift_approx': {
        defaultVariable: 'v',
        bounds: {
            lambda_obs: { min: 1e-9, max: 1e-3 },
            lambda_rest: { min: 1e-9, max: 1e-3 },
            v: { min: -1e4, max: 1e4 }
        },
        description: 'Observed wavelength vs velocity (non-relativistic)',
        axisLabels: { x: 'Velocity (m/s)', y: 'Observed Wavelength (m)' }
    },
    
    // Planetary Science
    'surface_gravity': {
        defaultVariable: 'r',
        bounds: {
            g: { min: 0, max: 1e3 },
            r: { min: 1e6, max: 1e12 },
            M: { min: 1e23, max: 1e31 }
        },
        description: 'Surface gravity vs radius',
        axisLabels: { x: 'Radius (m)', y: 'Surface Gravity (m/s²)' }
    },
    
    'planetary_equilibrium_temperature': {
        defaultVariable: 'a',
        bounds: {
            T_eq: { min: 0, max: 2000 },
            a: { min: 1e10, max: 1e13 },
            L_star: { min: 1e20, max: 1e40 },
            A: { min: 0, max: 1 }
        },
        description: 'Equilibrium temperature vs orbital distance',
        axisLabels: { x: 'Orbital Distance (m)', y: 'Temperature (K)' }
    },
    
    // High Energy Astrophysics
    'synchrotron_power': {
        defaultVariable: 'gamma',
        bounds: {
            P: { min: 1e-30, max: 1e-10 },
            gamma: { min: 1, max: 1e6 },
            B: { min: 1e-12, max: 1 }
        },
        description: 'Synchrotron power vs Lorentz factor',
        axisLabels: { x: 'Lorentz Factor', y: 'Power (W)' }
    },
    
    // Stellar Structure
    'mass_luminosity_relation': {
        defaultVariable: 'M',
        bounds: {
            L: { min: 1e20, max: 1e40 },
            M: { min: 1e29, max: 1e32 }
        },
        description: 'Luminosity vs mass (Mass-Luminosity Relation)',
        axisLabels: { x: 'Mass (kg)', y: 'Luminosity (W)' }
    },
    
    'stellar_lifetime': {
        defaultVariable: 'M',
        bounds: {
            t: { min: 1e6, max: 1e18 },
            M: { min: 1e29, max: 1e32 },
            L: { min: 1e20, max: 1e40 }
        },
        description: 'Stellar lifetime vs mass',
        axisLabels: { x: 'Mass (kg)', y: 'Lifetime (s)' }
    }
};

/**
 * Get graph configuration for a formula
 * @param {string|Object} formula - Formula ID or formula object
 * @returns {Object|null} Graph configuration or null
 */
function getFormulaGraphConfig(formula) {
    const formulaId = typeof formula === 'string' ? formula : (formula?.id);
    if (!formulaId) return null;
    
    return FORMULA_GRAPH_CONFIG[formulaId] || null;
}

/**
 * Get default variable to graph for a formula
 * @param {Object} formula - Formula object
 * @returns {string|null} Variable symbol to graph
 */
function getDefaultGraphVariable(formula) {
    const config = getFormulaGraphConfig(formula);
    if (config && config.defaultVariable) {
        return config.defaultVariable;
    }
    
    // Fallback: use first variable without a value
    if (formula.variables && formula.variables.length > 0) {
        return formula.variables[0].symbol;
    }
    
    return null;
}

/**
 * Get bounds for a specific variable in a formula
 * @param {Object} formula - Formula object
 * @param {string} variableSymbol - Variable symbol
 * @returns {Object|null} Bounds object {min, max} or null
 */
function getVariableBounds(formula, variableSymbol) {
    const config = getFormulaGraphConfig(formula);
    if (config && config.bounds && config.bounds[variableSymbol]) {
        return config.bounds[variableSymbol];
    }
    
    // Fallback: use heuristics based on variable name
    const varName = variableSymbol.toLowerCase();
    if (varName.includes('distance') || varName === 'd' || varName === 'r' || varName === 'a') {
        return { min: 0, max: 1e12 };
    }
    if (varName.includes('mass') || varName === 'm' || varName === 'M') {
        return { min: 1e20, max: 1e31 };
    }
    if (varName.includes('temperature') || varName === 't' || varName === 'T') {
        return { min: 1, max: 1e5 };
    }
    if (varName.includes('wavelength') || varName.includes('lambda')) {
        return { min: 1e-12, max: 1e-4 };
    }
    if (varName.includes('velocity') || varName === 'v') {
        return { min: -1e5, max: 1e5 };
    }
    if (varName.includes('period') || varName === 'p' || varName === 'P') {
        return { min: 0, max: 1e8 };
    }
    if (varName.includes('luminosity') || varName === 'l' || varName === 'L') {
        return { min: 1e-10, max: 1e40 };
    }
    
    return { min: -10, max: 10 }; // Default
}

/**
 * Get axis labels for a formula graph
 * @param {Object} formula - Formula object
 * @param {string} xVar - X-axis variable symbol
 * @param {string} yVar - Y-axis variable symbol
 * @returns {Object} Axis labels {x, y}
 */
function getAxisLabels(formula, xVar, yVar) {
    const config = getFormulaGraphConfig(formula);
    if (config && config.axisLabels) {
        return config.axisLabels;
    }
    
    // Fallback: generate from variable names
    const xVarObj = formula.variables?.find(v => v.symbol === xVar);
    const yVarObj = formula.variables?.find(v => v.symbol === yVar);
    
    return {
        x: xVarObj ? `${xVarObj.name} (${xVarObj.unit || ''})` : `${xVar}`,
        y: yVarObj ? `${yVarObj.name} (${yVarObj.unit || ''})` : `${yVar}`
    };
}

/**
 * Check if a formula should have a graph
 * @param {Object} formula - Formula object
 * @returns {boolean} True if formula should be graphed
 */
function shouldGraphFormula(formula) {
    if (!formula || !formula.variables || formula.variables.length < 2) {
        return false;
    }
    
    // Check if formula has a solver
    if (typeof FormulaCalculator !== 'undefined' && 
        FormulaCalculator.solvers && 
        formula.id && 
        FormulaCalculator.solvers[formula.id]) {
        return true;
    }
    
    // Check if formula has solveFunction or equation
    if (formula.solveFunction || formula.equation) {
        return true;
    }
    
    return false;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.FORMULA_GRAPH_CONFIG = FORMULA_GRAPH_CONFIG;
    window.getFormulaGraphConfig = getFormulaGraphConfig;
    window.getDefaultGraphVariable = getDefaultGraphVariable;
    window.getVariableBounds = getVariableBounds;
    window.getAxisLabels = getAxisLabels;
    window.shouldGraphFormula = shouldGraphFormula;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FORMULA_GRAPH_CONFIG,
        getFormulaGraphConfig,
        getDefaultGraphVariable,
        getVariableBounds,
        getAxisLabels,
        shouldGraphFormula
    };
}
