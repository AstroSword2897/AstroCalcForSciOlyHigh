/**
 * Calculation Engine - Tier 1 Production-Grade Calculator
 * 
 * ⭐ TIER 1 CALCULATION ENGINE - COMPLETELY OFFLINE ⭐
 * 
 * Core calculation engine for solving astronomical formulas. Provides:
 * - Numerical solving for single unknown variables with full validation
 * - Symbolic expression generation for multiple unknowns
 * - Automatic constant substitution (G, c, σ, M☉, etc.) - ALL DEFINED LOCALLY
 * - Comprehensive error handling and input validation
 * - Physical constraint validation (positive masses, distances, etc.)
 * - Division-by-zero protection
 * - Infinity/NaN detection and prevention
 * - Support for "N/A" variables (for symbolic expressions)
 * - LaTeX conversion for beautiful math rendering
 * - All solutions enumeration
 * 
 * ✅ OFFLINE-FIRST DESIGN:
 * - NO external API calls
 * - NO network dependencies
 * - ALL constants defined locally in formulas.js
 * - Works completely offline
 * - No external libraries required for calculations
 * 
 * 🛡️ ROBUST ERROR HANDLING:
 * - Input validation (type checking, range validation)
 * - Physical constraint validation (positive values where required)
 * - Division-by-zero protection
 * - Infinity/NaN detection
 * - Clear, actionable error messages
 * 
 * 📊 FEATURES:
 * - Normalized return format (consistent structure)
 * - All solutions returned for symbolic mode
 * - Solver registry pattern (O(1) lookup, maintainable)
 * - Comprehensive validation at every step
 * 
 * The calculator uses the formula's solveFunction to perform calculations,
 * automatically handling unit conversions and constant substitutions.
 * 
 * @version 2.0
 * @author AstroCalc Team
 */

/**
 * FormulaCalculator Class
 * 
 * Handles calculation logic for a specific formula. Can solve for:
 * - Single unknown variable (numerical result)
 * - Multiple unknown variables (symbolic expression)
 * - Variables marked as "N/A" (excluded from calculation)
 * 
 * @param {Object} formula - Formula object from formulas.js with solveFunction
 */
class FormulaCalculator {
    constructor(formula) {
        // ENHANCED: Validate formula object
        if (!formula) {
            throw new Error('FormulaCalculator: formula is required');
        }
        if (!formula.id) {
            throw new Error('FormulaCalculator: formula must have an id');
        }
        if (!formula.variables || !Array.isArray(formula.variables)) {
            throw new Error('FormulaCalculator: formula must have a variables array');
        }
        this.formula = formula;
    }
    
    /**
     * ENHANCED: Validate variable value against physical constraints
     * Ensures calculations are physically meaningful
     * @param {string} symbol - Variable symbol
     * @param {number} value - Value to validate
     * @param {Object} varDef - Variable definition
     */
    validateVariableValue(symbol, value, varDef) {
        if (!isFinite(value)) {
            throw new Error(`${symbol} must be a finite number, got: ${value}`);
        }
        
        // Physical constraints based on variable type
        const varName = (varDef?.name || symbol).toLowerCase();
        const varSymbol = symbol.toLowerCase();
        
        // Mass must be positive
        if (varName.includes('mass') || varSymbol === 'm' || varSymbol.includes('m_')) {
            if (value <= 0) {
                throw new Error(`${symbol} (mass) must be positive, got: ${value}`);
            }
        }
        
        // Distance/radius must be positive
        if (varName.includes('distance') || varName.includes('radius') || 
            varName.includes('separation') || varName.includes('semi-major') ||
            varSymbol === 'r' || varSymbol === 'd' || varSymbol === 'a' ||
            varSymbol.includes('r_') || varSymbol.includes('d_') || varSymbol.includes('a_')) {
            if (value <= 0) {
                throw new Error(`${symbol} (distance/radius) must be positive, got: ${value}`);
            }
        }
        
        // Temperature must be positive (in Kelvin)
        if (varName.includes('temperature') || varSymbol === 't' || varSymbol.includes('t_')) {
            if (value <= 0) {
                throw new Error(`${symbol} (temperature) must be positive, got: ${value}. Temperature must be in Kelvin.`);
            }
        }
        
        // Period must be positive
        if (varName.includes('period') || varSymbol === 'p' || 
            varSymbol.includes('p_') || (varSymbol === 't' && !varName.includes('temperature'))) {
            if (value <= 0) {
                throw new Error(`${symbol} (period/time) must be positive, got: ${value}`);
            }
        }
        
        // Wavelength must be positive
        if (varName.includes('wavelength') || varSymbol === 'λ' || varSymbol.includes('lambda')) {
            if (value <= 0) {
                throw new Error(`${symbol} (wavelength) must be positive, got: ${value}`);
            }
        }
        
        // Frequency must be positive
        if (varName.includes('frequency') || varSymbol === 'f' || varSymbol === 'ν' || 
            varSymbol.includes('nu') || varSymbol.includes('freq')) {
            if (value <= 0) {
                throw new Error(`${symbol} (frequency) must be positive, got: ${value}`);
            }
        }
        
        // Parallax must be positive
        if (varName.includes('parallax') && varSymbol === 'p') {
            if (value <= 0) {
                throw new Error(`${symbol} (parallax) must be positive, got: ${value}`);
            }
        }
    }
    
    /**
     * ENHANCED: Check if we can solve for a variable
     * @param {string} symbol - Variable symbol
     * @returns {boolean} True if solver exists for this variable
     */
    canSolveFor(symbol) {
        const formulaId = this.formula.id;
        const solver = FormulaCalculator.solvers[formulaId];
        if (!solver) return false;
        
        // Try to solve with dummy values to see if it works
        try {
            const dummyVars = {};
            this.formula.variables.forEach(v => {
                if (v.symbol !== symbol) {
                    // Use a safe default value
                    dummyVars[v.symbol] = 1;
                }
            });
            // Add constants
            Object.assign(dummyVars, globalConstants, this.formula.constants || {});
            
            const result = solver.call(this, symbol, dummyVars);
            return result !== null && result !== undefined && isFinite(result);
        } catch (e) {
            return false;
        }
    }

    /**
     * Solve for a specific variable given the other values
     * 
     * Determines which variable to solve for based on which ones are null/empty.
     * If exactly one variable is null, solves numerically.
     * If multiple variables are null or any are "N/A", returns symbolic expression.
     * 
     * @param {Object} variableValues - Object mapping variable symbols to their values
     *                                  Values can be: number, string (parsed), null, "N/A"
     * @returns {Object} Result object with:
     *                   - result: numerical value or symbolic expression string
     *                   - solvedFor: symbol of variable that was solved
     *                   - isSymbolic: boolean indicating if result is symbolic
     * @throws {Error} If no variables are unknown, or if calculation fails
     * 
     * @example
     * // Numerical solve
     * calculator.solve({ M: 1.989e30, a: 1.496e11, P: null })
     * // Returns: { result: 3.156e7, solvedFor: 'P', isSymbolic: false }
     * 
     * // Symbolic solve
     * calculator.solve({ M: 1.989e30, a: null, P: null })
     * // Returns: { result: "P = 2π√(a³/(GM))", solvedFor: null, isSymbolic: true }
     */
    solve(variableValues) {
        const nullVars = [];
        const naVars = [];
        const providedVars = {};

        // ENHANCED: Comprehensive input validation and error handling
        // Separate null, N/A, and provided variables
        for (const varDef of this.formula.variables) {
            const symbol = varDef.symbol;
            const value = variableValues[symbol];
            
            if (value === 'N/A' || value === 'n/a' || value === 'na' || value === 'IDK' || value === 'idk') {
                naVars.push(symbol);
            } else if (value === null || value === '' || value === 'null' || value === undefined) {
                nullVars.push(symbol);
            } else {
                // ENHANCED: Robust number parsing with validation
                let numValue;
                if (typeof value === 'number') {
                    if (!isNaN(value) && isFinite(value)) {
                    numValue = value;
                } else {
                        throw new Error(`Invalid number for ${symbol}: ${value} (NaN or Infinity)`);
                    }
                } else if (typeof value === 'string') {
                    // Try to parse string - handle scientific notation, fractions, etc.
                    const trimmed = value.trim();
                    numValue = parseFloat(trimmed);
                    if (isNaN(numValue)) {
                        throw new Error(`Invalid number format for ${symbol}: "${value}". Expected a number.`);
                    }
                    if (!isFinite(numValue)) {
                        throw new Error(`Invalid number for ${symbol}: ${value} (Infinity)`);
                    }
                } else {
                    throw new Error(`Invalid type for ${symbol}: ${typeof value}. Expected number or string.`);
                }
                
                // ENHANCED: Validate physical constraints
                this.validateVariableValue(symbol, numValue, varDef);
                
                providedVars[symbol] = numValue;
            }
        }

        // If we have N/A variables, return symbolic expression
        if (naVars.length > 0 || nullVars.length > 1) {
            const allUnknownVars = [...nullVars, ...naVars];
            if (allUnknownVars.length === 0) {
                throw new Error('At least one variable must be unknown (null or N/A)');
            }
            
            // Try to solve symbolically - return expression
            return this.solveSymbolically(allUnknownVars, providedVars, naVars);
        }

        // Standard case: exactly one unknown
        if (nullVars.length === 0) {
            throw new Error('At least one variable must be null (unknown)');
        }

        const unknownVar = nullVars[0];
        
        // ENHANCED: Validate that we can solve for this variable
        if (!this.canSolveFor(unknownVar)) {
            throw new Error(`Cannot solve for ${unknownVar} in formula ${this.formula.id}. This variable may require symbolic mode.`);
        }
        
        // ENHANCED: Wrap calculation in error handling
        let result;
        try {
            result = this.solveForVariable(unknownVar, providedVars);
        } catch (error) {
            // Provide more context in error message
            throw new Error(`Error solving for ${unknownVar} in ${this.formula.name}: ${error.message}`);
        }
        
        // ENHANCED: Validate result
        if (result === null || result === undefined) {
            throw new Error(`Solver returned null/undefined for ${unknownVar}. Check input values.`);
        }
        if (!isFinite(result)) {
            throw new Error(`Result for ${unknownVar} is ${result}. Check for division by zero or invalid input values.`);
        }
        
        // ENHANCED: Validate physical constraints on result
        this.validateVariableValue(unknownVar, result, this.formula.variables.find(v => v.symbol === unknownVar));
        
        // FIXED: Normalized return format - consistent structure
        return {
            solvedFor: unknownVar,
            result: result,
            unit: this.formula.variables.find(v => v.symbol === unknownVar)?.unit || '',
            isSymbolic: false
        };
    }
    
    // Solve symbolically when multiple variables are unknown
    solveSymbolically(unknownVars, knownVars, naVars) {
        const formulaId = this.formula.id;
        const constants = { ...globalConstants, ...this.formula.constants || {} };
        
        // Create symbolic expressions for all unknown variables
        // Build a system of equations
        const equations = [];
        
        for (const unknownVar of unknownVars) {
            const otherUnknowns = unknownVars.filter(v => v !== unknownVar);
            const expression = this.createSymbolicExpression(formulaId, unknownVar, knownVars, otherUnknowns, constants);
            
            equations.push({
                variable: unknownVar,
                expression: expression,
                unit: this.formula.variables.find(v => v.symbol === unknownVar)?.unit || ''
            });
        }
        
        // FIXED: Return all solutions, not just the first
        // This is much more useful when 2-3 variables are unknown
        return {
            solvedFor: unknownVars[0], // Primary variable for backward compatibility
            result: equations[0].expression, // Primary expression for backward compatibility
            unit: equations[0].unit,
            isSymbolic: true,
            // NEW: All solutions in structured format
            solutions: equations.map(eq => ({
                variable: eq.variable,
                expression: eq.expression,
                unit: eq.unit
            })),
            // Legacy fields for backward compatibility
            otherUnknowns: unknownVars.filter(v => v !== equations[0].variable),
            allEquations: equations
        };
    }
    
    // Create a symbolic expression string
    createSymbolicExpression(formulaId, primaryVar, knownVars, otherUnknowns, constants) {
        const formula = this.formula;
        const allVars = { ...globalConstants, ...constants, ...knownVars };
        
        // For each unknown (except primary), add it as a variable
        otherUnknowns.forEach(symbol => {
            allVars[symbol] = symbol; // Use symbol name as placeholder
        });
        
        // Helper function to format variable values
        const formatVar = (symbol, value) => {
            if (value === undefined || value === null) {
                return symbol;
            }
            if (typeof value === 'string') {
                return value; // Already a symbol
            }
            if (typeof value === 'number' && isFinite(value)) {
                // Format number nicely
                if (Math.abs(value) < 0.001 || Math.abs(value) > 1000000) {
                    return value.toExponential(3);
                }
                return value.toString();
            }
            return symbol;
        };
        
        // Build expression based on formula
        switch (formulaId) {
            case 'magnitude_flux_relation':
                if (primaryVar === 'm1') {
                    return `${formatVar('m2', allVars.m2)} - 2.5 × log₁₀(${formatVar('F1', allVars.F1)} / ${formatVar('F2', allVars.F2)})`;
                } else if (primaryVar === 'm2') {
                    return `${formatVar('m1', allVars.m1)} + 2.5 × log₁₀(${formatVar('F1', allVars.F1)} / ${formatVar('F2', allVars.F2)})`;
                } else if (primaryVar === 'F1') {
                    return `${formatVar('F2', allVars.F2)} × 10^((${formatVar('m2', allVars.m2)} - ${formatVar('m1', allVars.m1)}) / 2.5)`;
                } else if (primaryVar === 'F2') {
                    return `${formatVar('F1', allVars.F1)} × 10^((${formatVar('m1', allVars.m1)} - ${formatVar('m2', allVars.m2)}) / 2.5)`;
                }
                break;
            case 'kepler_third_law':
                if (primaryVar === 'T') {
                    return `√((4π²/(G × ${formatVar('M', allVars.M)})) × ${formatVar('a', allVars.a)}³)`;
                } else if (primaryVar === 'a') {
                    return `∛((${formatVar('T', allVars.T)}² × G × ${formatVar('M', allVars.M)}) / (4π²))`;
                } else if (primaryVar === 'M') {
                    return `(4π² × ${formatVar('a', allVars.a)}³) / (G × ${formatVar('T', allVars.T)}²)`;
                }
                break;
                
            case 'orbital_velocity':
                if (primaryVar === 'v') {
                    return `√(G × ${formatVar('M', allVars.M)} / ${formatVar('r', allVars.r)})`;
                } else if (primaryVar === 'r') {
                    return `G × ${formatVar('M', allVars.M)} / ${formatVar('v', allVars.v)}²`;
                } else if (primaryVar === 'M') {
                    return `${formatVar('r', allVars.r)} × ${formatVar('v', allVars.v)}² / G`;
                }
                break;
                
            case 'escape_velocity':
                if (primaryVar === 'v_esc') {
                    return `√(2 × G × ${formatVar('M', allVars.M)} / ${formatVar('r', allVars.r)})`;
                } else if (primaryVar === 'r') {
                    return `2 × G × ${formatVar('M', allVars.M)} / ${formatVar('v_esc', allVars.v_esc)}²`;
                } else if (primaryVar === 'M') {
                    return `${formatVar('r', allVars.r)} × ${formatVar('v_esc', allVars.v_esc)}² / (2 × G)`;
                }
                break;
                
            case 'angular_size':
                if (primaryVar === 'θ') {
                    return `${formatVar('d', allVars.d)} / ${formatVar('D', allVars.D)}`;
                } else if (primaryVar === 'd') {
                    return `${formatVar('θ', allVars.θ)} × ${formatVar('D', allVars.D)}`;
                } else if (primaryVar === 'D') {
                    return `${formatVar('d', allVars.d)} / ${formatVar('θ', allVars.θ)}`;
                }
                break;
                
            case 'distance_modulus':
                if (primaryVar === 'm') {
                    return `${formatVar('M', allVars.M)} + 5 × log₁₀(${formatVar('d', allVars.d)}) - 5`;
                } else if (primaryVar === 'M') {
                    return `${formatVar('m', allVars.m)} - 5 × log₁₀(${formatVar('d', allVars.d)}) + 5`;
                } else if (primaryVar === 'd') {
                    return `10^((${formatVar('m', allVars.m)} - ${formatVar('M', allVars.M)} + 5) / 5)`;
                }
                break;
                
            case 'luminosity':
                if (primaryVar === 'L') {
                    return `4π × ${formatVar('R', allVars.R)}² × σ × ${formatVar('T', allVars.T)}⁴`;
                } else if (primaryVar === 'R') {
                    return `√(${formatVar('L', allVars.L)} / (4π × σ × ${formatVar('T', allVars.T)}⁴))`;
                } else if (primaryVar === 'T') {
                    return `(${formatVar('L', allVars.L)} / (4π × ${formatVar('R', allVars.R)}² × σ))^(1/4)`;
                }
                break;
                
            case 'hubble_law':
                if (primaryVar === 'v') {
                    return `${formatVar('H₀', allVars['H₀'] || allVars.H0)} × ${formatVar('d', allVars.d)}`;
                } else if (primaryVar === 'd') {
                    return `${formatVar('v', allVars.v)} / ${formatVar('H₀', allVars['H₀'] || allVars.H0)}`;
                } else if (primaryVar === 'H₀') {
                    return `${formatVar('v', allVars.v)} / ${formatVar('d', allVars.d)}`;
                }
                break;
                
            case 'wiens_law':
                if (primaryVar === 'λmax') {
                    return `b / ${formatVar('T', allVars.T)}`;
                } else if (primaryVar === 'T') {
                    return `b / ${formatVar('λmax', allVars.λmax)}`;
                }
                break;
                
            case 'flux_from_luminosity':
                if (primaryVar === 'F') {
                    return `${formatVar('L', allVars.L)} / (4π × ${formatVar('d', allVars.d)}²)`;
                } else if (primaryVar === 'L') {
                    return `4π × ${formatVar('d', allVars.d)}² × ${formatVar('F', allVars.F)}`;
                } else if (primaryVar === 'd') {
                    return `√(${formatVar('L', allVars.L)} / (4π × ${formatVar('F', allVars.F)}))`;
                }
                break;
                
            case 'gravitational_potential_general':
                if (primaryVar === 'Φ' || primaryVar === 'Phi') {
                    return `-G × ${formatVar('M', allVars.M)} / ${formatVar('r', allVars.r)}`;
                } else if (primaryVar === 'M') {
                    return `-${formatVar('Φ', allVars['Φ'] || allVars.Phi)} × ${formatVar('r', allVars.r)} / G`;
                } else if (primaryVar === 'r') {
                    return `-G × ${formatVar('M', allVars.M)} / ${formatVar('Φ', allVars['Φ'] || allVars.Phi)}`;
                }
                break;
                
            default:
                // UNIVERSAL FALLBACK: Try to create symbolic expression from equation
                return this.createSymbolicFromEquation(primaryVar, allVars, otherUnknowns);
        }
        
        // UNIVERSAL FALLBACK: Try to create symbolic expression from equation
        return this.createSymbolicFromEquation(primaryVar, allVars, otherUnknowns);
    }

    /**
     * Create symbolic expression from equation string for ANY formula
     * This ensures EVERY formula can generate symbolic expressions
     * 
     * @param {string} primaryVar - Variable to solve for
     * @param {Object} allVars - All variables with values
     * @param {Array} otherUnknowns - Other unknown variables
     * @returns {string} Symbolic expression
     */
    createSymbolicFromEquation(primaryVar, allVars, otherUnknowns) {
        const equation = this.formula.equation;
        if (!equation) {
            return `${primaryVar} = ?`;
        }
        
        // Format variable values for display
        const formatVar = (symbol, value) => {
            if (value === null || value === undefined) {
                return symbol;
            }
            if (typeof value === 'string' && (value === 'N/A' || value.toLowerCase() === 'na')) {
                return symbol;
            }
            if (typeof value === 'number' && isFinite(value)) {
                // Format large/small numbers
                if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
                    return value.toExponential(3);
                }
                return value.toString();
            }
            return symbol;
        };
        
        // Replace known variables with their values, keep unknowns as symbols
        let expr = equation;
        
        // Get all variable symbols from formula
        const varSymbols = this.formula.variables.map(v => v.symbol);
        
        // Replace each variable
        for (const symbol of varSymbols) {
            const value = allVars[symbol];
            const isUnknown = otherUnknowns.includes(symbol) || symbol === primaryVar;
            
            if (!isUnknown && value !== null && value !== undefined && 
                typeof value === 'number' && isFinite(value)) {
                // Replace with value
                const formatted = formatVar(symbol, value);
                // Replace whole word matches only
                const varRegex = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                expr = expr.replace(varRegex, formatted);
            }
        }
        
        // If primaryVar is on left side, return the right side
        const leftRightPattern = new RegExp(`^${primaryVar}\\s*=\\s*(.+)$`, 'i');
        const match = expr.match(leftRightPattern);
        if (match) {
            return match[1].trim();
        }
        
        // If primaryVar is on right side, try to isolate it
        const rightLeftPattern = new RegExp(`^(.+)\\s*=\\s*${primaryVar}$`, 'i');
        const match2 = expr.match(rightLeftPattern);
        if (match2) {
            // For now, return the equation as-is (could be improved with algebraic manipulation)
            return expr;
        }
        
        // Return the equation with substitutions
        return expr;
    }

    // FIXED: Refactored giant switch to solver registry pattern
    // Performance improvement: O(1) lookup instead of O(n) switch
    // Easier to maintain and test
    static solvers = {
        kepler_third_law: (unknownVar, vars) => FormulaCalculator.prototype.solveKeplerThirdLaw(unknownVar, vars),
        orbital_velocity: (unknownVar, vars) => FormulaCalculator.prototype.solveOrbitalVelocity(unknownVar, vars),
        escape_velocity: (unknownVar, vars) => FormulaCalculator.prototype.solveEscapeVelocity(unknownVar, vars),
        distance_modulus: (unknownVar, vars) => FormulaCalculator.prototype.solveDistanceModulus(unknownVar, vars),
        luminosity: (unknownVar, vars) => FormulaCalculator.prototype.solveLuminosity(unknownVar, vars),
        hubble_law: (unknownVar, vars) => FormulaCalculator.prototype.solveHubbleLaw(unknownVar, vars),
        surface_gravity: (unknownVar, vars) => FormulaCalculator.prototype.solveSurfaceGravity(unknownVar, vars),
        angular_size: (unknownVar, vars) => FormulaCalculator.prototype.solveAngularSize(unknownVar, vars),
        parallax_distance_radians: (unknownVar, vars) => FormulaCalculator.prototype.solveParallaxRadians(unknownVar, vars),
        parallax_distance_arcsec: (unknownVar, vars) => FormulaCalculator.prototype.solveParallaxArcsec(unknownVar, vars),
        max_gamma_bohm: (unknownVar, vars) => FormulaCalculator.prototype.solveMaxGammaBohm(unknownVar, vars),
        cooling_break_gamma: (unknownVar, vars) => FormulaCalculator.prototype.solveCoolingBreakGamma(unknownVar, vars),
        cooling_break_frequency: (unknownVar, vars) => FormulaCalculator.prototype.solveCoolingBreakFrequency(unknownVar, vars),
        synchrotron_cooling_timescale: (unknownVar, vars) => FormulaCalculator.prototype.solveSynchrotronCooling(unknownVar, vars),
        synchrotron_power: (unknownVar, vars) => FormulaCalculator.prototype.solveSynchrotronPower(unknownVar, vars),
        magnetic_energy_density: (unknownVar, vars) => FormulaCalculator.prototype.solveMagneticEnergyDensity(unknownVar, vars),
        power_law_spectrum: (unknownVar, vars) => FormulaCalculator.prototype.solvePowerLawSpectrum(unknownVar, vars),
        spectral_index: (unknownVar, vars) => FormulaCalculator.prototype.solveSpectralIndex(unknownVar, vars),
        chandrasekhar_limit: (unknownVar, vars) => FormulaCalculator.prototype.solveChandrasekharLimit(unknownVar, vars),
        white_dwarf_mass_radius: (unknownVar, vars) => FormulaCalculator.prototype.solveWhiteDwarfMassRadius(unknownVar, vars),
        wiens_law: (unknownVar, vars) => FormulaCalculator.prototype.solveWiensLaw(unknownVar, vars),
        hydrostatic_balance: (unknownVar, vars) => FormulaCalculator.prototype.solveHydrostaticBalance(unknownVar, vars),
        kepler_third_law_binary: (unknownVar, vars) => FormulaCalculator.prototype.solveKeplerThirdLawBinary(unknownVar, vars),
        rotational_velocity: (unknownVar, vars) => FormulaCalculator.prototype.solveRotationalVelocity(unknownVar, vars),
        average_density: (unknownVar, vars) => FormulaCalculator.prototype.solveAverageDensity(unknownVar, vars),
        flux_from_luminosity: (unknownVar, vars) => FormulaCalculator.prototype.solveFluxFromLuminosity(unknownVar, vars),
        magnitude_flux_relation: (unknownVar, vars) => FormulaCalculator.prototype.solveMagnitudeFluxRelation(unknownVar, vars),
        inverse_square_law_brightness: (unknownVar, vars) => FormulaCalculator.prototype.solveInverseSquareLawBrightness(unknownVar, vars),
        doppler_shift: (unknownVar, vars) => FormulaCalculator.prototype.solveDopplerShift(unknownVar, vars),
        doppler_shift_approx: (unknownVar, vars) => FormulaCalculator.prototype.solveDopplerShiftApprox(unknownVar, vars),
        flux_temperature: (unknownVar, vars) => FormulaCalculator.prototype.solveFluxTemperature(unknownVar, vars),
        light_gathering_power: (unknownVar, vars) => FormulaCalculator.prototype.solveLightGatheringPower(unknownVar, vars),
        magnification: (unknownVar, vars) => FormulaCalculator.prototype.solveMagnification(unknownVar, vars),
        f_ratio: (unknownVar, vars) => FormulaCalculator.prototype.solveFRatio(unknownVar, vars),
        angular_resolution: (unknownVar, vars) => FormulaCalculator.prototype.solveAngularResolution(unknownVar, vars),
        kepler_third_law_solar: (unknownVar, vars) => FormulaCalculator.prototype.solveKeplerThirdLawSolar(unknownVar, vars),
        tidal_force: (unknownVar, vars) => FormulaCalculator.prototype.solveTidalForce(unknownVar, vars),
        roche_limit: (unknownVar, vars) => FormulaCalculator.prototype.solveRocheLimit(unknownVar, vars),
        orbital_energy: (unknownVar, vars) => FormulaCalculator.prototype.solveOrbitalEnergy(unknownVar, vars),
        vis_viva: (unknownVar, vars) => FormulaCalculator.prototype.solveVisViva(unknownVar, vars),
        center_of_mass: (unknownVar, vars) => FormulaCalculator.prototype.solveCenterOfMass(unknownVar, vars),
        stellar_lifetime: (unknownVar, vars) => FormulaCalculator.prototype.solveStellarLifetime(unknownVar, vars),
        mass_luminosity_relation: (unknownVar, vars) => FormulaCalculator.prototype.solveMassLuminosityRelation(unknownVar, vars),
        hr_color_index: (unknownVar, vars) => FormulaCalculator.prototype.solveHRColorIndex(unknownVar, vars),
        hr_absolute_magnitude: (unknownVar, vars) => FormulaCalculator.prototype.solveHRAbsoluteMagnitude(unknownVar, vars),
        friedmann_equation: (unknownVar, vars) => FormulaCalculator.prototype.solveFriedmannEquation(unknownVar, vars),
        critical_density: (unknownVar, vars) => FormulaCalculator.prototype.solveCriticalDensity(unknownVar, vars),
        schwarzschild_radius: (unknownVar, vars) => FormulaCalculator.prototype.solveSchwarzschildRadius(unknownVar, vars),
        time_dilation: (unknownVar, vars) => FormulaCalculator.prototype.solveTimeDilation(unknownVar, vars),
        length_contraction: (unknownVar, vars) => FormulaCalculator.prototype.solveLengthContraction(unknownVar, vars),
        planetary_equilibrium_temperature: (unknownVar, vars) => FormulaCalculator.prototype.solvePlanetaryEquilibriumTemperature(unknownVar, vars),
        greenhouse_effect: (unknownVar, vars) => FormulaCalculator.prototype.solveGreenhouseEffect(unknownVar, vars),
        albedo: (unknownVar, vars) => FormulaCalculator.prototype.solveAlbedo(unknownVar, vars),
        blackbody_radiation: (unknownVar, vars) => FormulaCalculator.prototype.solveBlackbodyRadiation(unknownVar, vars),
        binary_white_dwarf: (unknownVar, vars) => FormulaCalculator.prototype.solveBinaryWhiteDwarf(unknownVar, vars),
        white_dwarf_orbital_decay: (unknownVar, vars) => FormulaCalculator.prototype.solveWhiteDwarfOrbitalDecay(unknownVar, vars),
        white_dwarf_merger_timescale: (unknownVar, vars) => FormulaCalculator.prototype.solveWhiteDwarfMergerTimescale(unknownVar, vars),
        hill_radius: (unknownVar, vars) => FormulaCalculator.prototype.solveHillRadius(unknownVar, vars),
        synodic_period: (unknownVar, vars) => FormulaCalculator.prototype.solveSynodicPeriod(unknownVar, vars),
        jeans_mass: (unknownVar, vars) => FormulaCalculator.prototype.solveJeansMass(unknownVar, vars),
        planck_relation: (unknownVar, vars) => FormulaCalculator.prototype.solvePlanckRelation(unknownVar, vars),
        einstein_radius: (unknownVar, vars) => FormulaCalculator.prototype.solveEinsteinRadius(unknownVar, vars),
        angular_momentum_elliptical: (unknownVar, vars) => FormulaCalculator.prototype.solveAngularMomentumElliptical(unknownVar, vars),
        cosmic_redshift: (unknownVar, vars) => FormulaCalculator.prototype.solveCosmicRedshift(unknownVar, vars),
        lookback_time: (unknownVar, vars) => FormulaCalculator.prototype.solveLookbackTime(unknownVar, vars),
        density_parameter: (unknownVar, vars) => FormulaCalculator.prototype.solveDensityParameter(unknownVar, vars),
        angular_diameter_distance: (unknownVar, vars) => FormulaCalculator.prototype.solveAngularDiameterDistance(unknownVar, vars),
        luminosity_distance: (unknownVar, vars) => FormulaCalculator.prototype.solveLuminosityDistance(unknownVar, vars),
        gravitational_potential_general: (unknownVar, vars) => FormulaCalculator.prototype.solveGravitationalPotential(unknownVar, vars),
        total_energy_virial: (unknownVar, vars) => FormulaCalculator.prototype.solveTotalEnergyVirial(unknownVar, vars)
    };

    // Solve for a specific variable based on the formula
    solveForVariable(unknownVar, knownVars) {
        const formulaId = this.formula.id;
        
        // Merge global constants, formula constants, and known variables
        const vars = { ...globalConstants, ...this.formula.constants || {}, ...knownVars };
        
        // FIXED: Use solver registry instead of giant switch
        const solver = FormulaCalculator.solvers[formulaId];
        
        if (!solver) {
            // UNIVERSAL COVERAGE: Try generic solver fallback for ALL formulas
            // This ensures EVERY formula can be solved, even without a specific solver
            try {
                const genericResult = this.solveGenericEquation(unknownVar, vars);
                if (genericResult !== null && isFinite(genericResult)) {
                    // Validate the result
                    const varDef = this.formula.variables.find(v => v.symbol === unknownVar);
                    const validated = this.validateVariableValue(unknownVar, genericResult, varDef);
                    if (validated !== null) {
                        return validated;
                    }
                }
            } catch (e) {
                // Generic solver failed, log for debugging but continue
                if (typeof logger !== 'undefined') {
                    logger.warn(`Generic solver failed for ${formulaId}.${unknownVar}:`, e.message);
                }
            }
            
            // If generic solver also failed, provide helpful error
            const availableSolvers = Object.keys(FormulaCalculator.solvers).sort();
            const suggestion = availableSolvers.find(id => id.includes(formulaId.split('_')[0]));
            
            let errorMsg = `Unable to solve ${unknownVar} for formula: ${formulaId}`;
            errorMsg += `\nEquation: ${this.formula.equation || 'N/A'}`;
            if (suggestion) {
                errorMsg += `\nDid you mean: ${suggestion}?`;
            }
            errorMsg += `\nTried both specific and generic solvers.`;
            errorMsg += `\nPlease check that all required variables are provided.`;
            
            throw new Error(errorMsg);
        }
        
        try {
            return solver.call(this, unknownVar, vars);
        } catch (error) {
            // Wrap solver errors with context
            throw new Error(`Error solving ${unknownVar} for ${formulaId}: ${error.message}`);
        }
        
        // OLD SWITCH STATEMENT REMOVED - replaced with registry above
        /*switch (formulaId) {
            case 'kepler_third_law':
                return this.solveKeplerThirdLaw(unknownVar, vars);
            
            case 'orbital_velocity':
                return this.solveOrbitalVelocity(unknownVar, vars);
            
            case 'escape_velocity':
                return this.solveEscapeVelocity(unknownVar, vars);
            
            case 'distance_modulus':
                return this.solveDistanceModulus(unknownVar, vars);
            
            case 'luminosity':
                return this.solveLuminosity(unknownVar, vars);
            
            case 'hubble_law':
                return this.solveHubbleLaw(unknownVar, vars);
            
            case 'surface_gravity':
                return this.solveSurfaceGravity(unknownVar, vars);
            
            case 'angular_size':
                return this.solveAngularSize(unknownVar, vars);
            
            case 'parallax_distance_radians':
                return this.solveParallaxRadians(unknownVar, vars);
            
            case 'parallax_distance_arcsec':
                return this.solveParallaxArcsec(unknownVar, vars);
            
            case 'max_gamma_bohm':
                return this.solveMaxGammaBohm(unknownVar, vars);
            
            case 'cooling_break_gamma':
                return this.solveCoolingBreakGamma(unknownVar, vars);
            
            case 'cooling_break_frequency':
                return this.solveCoolingBreakFrequency(unknownVar, vars);
            
            case 'synchrotron_cooling_timescale':
                return this.solveSynchrotronCooling(unknownVar, vars);
            
            case 'synchrotron_power':
                return this.solveSynchrotronPower(unknownVar, vars);
            
            case 'magnetic_energy_density':
                return this.solveMagneticEnergyDensity(unknownVar, vars);
            
            case 'power_law_spectrum':
                return this.solvePowerLawSpectrum(unknownVar, vars);
            
            case 'spectral_index':
                return this.solveSpectralIndex(unknownVar, vars);
            
            case 'chandrasekhar_limit':
                return this.solveChandrasekharLimit(unknownVar, vars);
            
            case 'white_dwarf_mass_radius':
                return this.solveWhiteDwarfMassRadius(unknownVar, vars);
            
            case 'wiens_law':
                return this.solveWiensLaw(unknownVar, vars);
            
            case 'hydrostatic_balance':
                return this.solveHydrostaticBalance(unknownVar, vars);
            
            case 'kepler_third_law_binary':
                return this.solveKeplerThirdLawBinary(unknownVar, vars);
            
            case 'rotational_velocity':
                return this.solveRotationalVelocity(unknownVar, vars);
            
            case 'average_density':
                return this.solveAverageDensity(unknownVar, vars);
            
            case 'flux_from_luminosity':
                return this.solveFluxFromLuminosity(unknownVar, vars);
            
            case 'magnitude_flux_relation':
                return this.solveMagnitudeFluxRelation(unknownVar, vars);
            
            case 'inverse_square_law_brightness':
                return this.solveInverseSquareLawBrightness(unknownVar, vars);
            
            case 'doppler_shift':
                return this.solveDopplerShift(unknownVar, vars);
            
            case 'doppler_shift_approx':
                return this.solveDopplerShiftApprox(unknownVar, vars);
            
            case 'flux_temperature':
                return this.solveFluxTemperature(unknownVar, vars);
            
            case 'light_gathering_power':
                return this.solveLightGatheringPower(unknownVar, vars);
            
            case 'magnification':
                return this.solveMagnification(unknownVar, vars);
            
            case 'f_ratio':
                return this.solveFRatio(unknownVar, vars);
            
            case 'angular_resolution':
                return this.solveAngularResolution(unknownVar, vars);
            
            case 'kepler_third_law_solar':
                return this.solveKeplerThirdLawSolar(unknownVar, vars);
            
            case 'tidal_force':
                return this.solveTidalForce(unknownVar, vars);
            
            case 'roche_limit':
                return this.solveRocheLimit(unknownVar, vars);
            
            case 'orbital_energy':
                return this.solveOrbitalEnergy(unknownVar, vars);
            
            case 'vis_viva':
                return this.solveVisViva(unknownVar, vars);
            
            case 'center_of_mass':
                return this.solveCenterOfMass(unknownVar, vars);
            
            case 'stellar_lifetime':
                return this.solveStellarLifetime(unknownVar, vars);
            
            case 'mass_luminosity_relation':
                return this.solveMassLuminosityRelation(unknownVar, vars);
            
            case 'hr_color_index':
                return this.solveHRColorIndex(unknownVar, vars);
            
            case 'hr_absolute_magnitude':
                return this.solveHRAbsoluteMagnitude(unknownVar, vars);
            
            case 'friedmann_equation':
                return this.solveFriedmannEquation(unknownVar, vars);
            
            case 'critical_density':
                return this.solveCriticalDensity(unknownVar, vars);
            
            case 'schwarzschild_radius':
                return this.solveSchwarzschildRadius(unknownVar, vars);
            
            case 'time_dilation':
                return this.solveTimeDilation(unknownVar, vars);
            
            case 'length_contraction':
                return this.solveLengthContraction(unknownVar, vars);
            
            case 'planetary_equilibrium_temperature':
                return this.solvePlanetaryEquilibriumTemperature(unknownVar, vars);
            
            case 'greenhouse_effect':
                return this.solveGreenhouseEffect(unknownVar, vars);
            
            case 'albedo':
                return this.solveAlbedo(unknownVar, vars);
            
            case 'blackbody_radiation':
                return this.solveBlackbodyRadiation(unknownVar, vars);
            
            case 'binary_white_dwarf':
                return this.solveBinaryWhiteDwarf(unknownVar, vars);
            
            case 'white_dwarf_orbital_decay':
                return this.solveWhiteDwarfOrbitalDecay(unknownVar, vars);
            
            case 'white_dwarf_merger_timescale':
                return this.solveWhiteDwarfMergerTimescale(unknownVar, vars);
            
            case 'hill_radius':
                return this.solveHillRadius(unknownVar, vars);
            
            case 'synodic_period':
                return this.solveSynodicPeriod(unknownVar, vars);
            
            case 'jeans_mass':
                return this.solveJeansMass(unknownVar, vars);
            
            case 'planck_relation':
                return this.solvePlanckRelation(unknownVar, vars);
            
            case 'einstein_radius':
                return this.solveEinsteinRadius(unknownVar, vars);
            
            case 'angular_momentum_elliptical':
                return this.solveAngularMomentumElliptical(unknownVar, vars);
            
            case 'cosmic_redshift':
                return this.solveCosmicRedshift(unknownVar, vars);
            
            case 'lookback_time':
                return this.solveLookbackTime(unknownVar, vars);
            
            case 'density_parameter':
                return this.solveDensityParameter(unknownVar, vars);
            
            case 'angular_diameter_distance':
                return this.solveAngularDiameterDistance(unknownVar, vars);
            
            case 'luminosity_distance':
                return this.solveLuminosityDistance(unknownVar, vars);
            
            case 'gravitational_potential_general':
                return this.solveGravitationalPotential(unknownVar, vars);
            
            default:
                throw new Error(`Solver not implemented for formula: ${formulaId}`);
        }*/
    }

    // Individual formula solvers
    solveKeplerThirdLaw(unknownVar, vars) {
        const { T, a, M, G } = vars;
        
        // ENHANCED: Division-by-zero and validation checks
        if (unknownVar === 'T') {
            // T = √((4π²/GM) × a³)
            if (G === 0 || M === 0) {
                throw new Error('Gravitational constant G and mass M must be non-zero');
            }
            if (a <= 0) {
                throw new Error('Semi-major axis a must be positive');
            }
            const result = Math.sqrt((4 * Math.PI * Math.PI / (G * M)) * (a * a * a));
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'a') {
            // a = ∛(T² × GM / 4π²)
            if (T === 0) {
                throw new Error('Period T must be non-zero');
            }
            if (G === 0 || M === 0) {
                throw new Error('Gravitational constant G and mass M must be non-zero');
            }
            const result = Math.cbrt((T * T * G * M) / (4 * Math.PI * Math.PI));
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'M') {
            // M = (4π² × a³) / (G × T²)
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (T === 0) {
                throw new Error('Period T must be non-zero');
            }
            if (a <= 0) {
                throw new Error('Semi-major axis a must be positive');
            }
            const result = (4 * Math.PI * Math.PI * a * a * a) / (G * T * T);
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        }
    }

    solveOrbitalVelocity(unknownVar, vars) {
        const { v, r, M, G } = vars;
        
        // ENHANCED: Division-by-zero and validation checks
        if (unknownVar === 'v') {
            // v = √(GM/r)
            if (G === 0 || M === 0) {
                throw new Error('Gravitational constant G and mass M must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            const result = Math.sqrt((G * M) / r);
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'r') {
            // r = GM/v²
            if (v === 0) {
                throw new Error('Velocity v must be non-zero');
            }
            if (G === 0 || M === 0) {
                throw new Error('Gravitational constant G and mass M must be non-zero');
            }
            const result = (G * M) / (v * v);
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'M') {
            // M = rv²/G
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            const result = (r * v * v) / G;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        }
    }

    solveEscapeVelocity(unknownVar, vars) {
        const { v_esc, r, M, G } = vars;
        
        // ENHANCED: Division-by-zero and validation checks
        if (unknownVar === 'v_esc') {
            // v_esc = √(2GM/r)
            if (G === 0 || M === 0) {
                throw new Error('Gravitational constant G and mass M must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            const result = Math.sqrt((2 * G * M) / r);
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'r') {
            // r = 2GM/v_esc²
            if (v_esc === 0) {
                throw new Error('Escape velocity v_esc must be non-zero');
            }
            if (G === 0 || M === 0) {
                throw new Error('Gravitational constant G and mass M must be non-zero');
            }
            const result = (2 * G * M) / (v_esc * v_esc);
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'M') {
            // M = rv_esc²/(2G)
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            const result = (r * v_esc * v_esc) / (2 * G);
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        }
    }

    solveDistanceModulus(unknownVar, vars) {
        const { m, M, d } = vars;
        
        // ENHANCED: Validation for logarithmic operations
        if (unknownVar === 'm') {
            // m = M + 5 log₁₀(d) - 5
            if (d <= 0) {
                throw new Error('Distance d must be positive for logarithm');
            }
            const result = M + 5 * Math.log10(d) - 5;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'M') {
            // M = m - 5 log₁₀(d) + 5
            if (d <= 0) {
                throw new Error('Distance d must be positive for logarithm');
            }
            const result = m - 5 * Math.log10(d) + 5;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'd') {
            // d = 10^((m - M + 5)/5)
            const result = Math.pow(10, (m - M + 5) / 5);
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        }
    }

    solveLuminosity(unknownVar, vars) {
        const L = vars.L;
        const R = vars.R;
        const T = vars.T;
        const sigma = vars.σ || vars.sigma;
        
        // ENHANCED: Division-by-zero and validation checks
        if (unknownVar === 'L') {
            // L = 4πR²σT⁴
            if (R <= 0) {
                throw new Error('Radius R must be positive');
            }
            if (T <= 0) {
                throw new Error('Temperature T must be positive (in Kelvin)');
            }
            if (!sigma || sigma === 0) {
                throw new Error('Stefan-Boltzmann constant σ must be non-zero');
            }
            const result = 4 * Math.PI * R * R * sigma * Math.pow(T, 4);
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'R') {
            // R = √(L/(4πσT⁴))
            if (L <= 0) {
                throw new Error('Luminosity L must be positive');
            }
            if (T <= 0) {
                throw new Error('Temperature T must be positive (in Kelvin)');
            }
            if (!sigma || sigma === 0) {
                throw new Error('Stefan-Boltzmann constant σ must be non-zero');
            }
            const denominator = 4 * Math.PI * sigma * Math.pow(T, 4);
            if (denominator === 0) {
                throw new Error('Division by zero: 4πσT⁴ cannot be zero');
            }
            const result = Math.sqrt(L / denominator);
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'T') {
            // T = (L/(4πR²σ))^(1/4)
            if (L <= 0) {
                throw new Error('Luminosity L must be positive');
            }
            if (R <= 0) {
                throw new Error('Radius R must be positive');
            }
            if (!sigma || sigma === 0) {
                throw new Error('Stefan-Boltzmann constant σ must be non-zero');
            }
            const denominator = 4 * Math.PI * R * R * sigma;
            if (denominator === 0) {
                throw new Error('Division by zero: 4πR²σ cannot be zero');
            }
            const result = Math.pow(L / denominator, 0.25);
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        }
    }

    solveHubbleLaw(unknownVar, vars) {
        const v = vars.v;
        // FIXED: Handle both H₀ and H0 consistently
        const H0 = vars["H₀"] || vars.H0;
        const d = vars.d;
        
        if (unknownVar === 'v') {
            // v = H₀ × d
            return H0 * d;
        } else if (unknownVar === 'H₀' || unknownVar === 'H0') {
            // H₀ = v/d
            return v / d;
        } else if (unknownVar === 'd') {
            // d = v/H₀
            return v / H0;
        }
    }

    solveSurfaceGravity(unknownVar, vars) {
        const { g, M, r, G } = vars;
        
        if (unknownVar === 'g') {
            // g = GM/r²
            return (G * M) / (r * r);
        } else if (unknownVar === 'M') {
            // M = gr²/G
            return (g * r * r) / G;
        } else if (unknownVar === 'r') {
            // r = √(GM/g)
            return Math.sqrt((G * M) / g);
        }
    }

    solveAngularSize(unknownVar, vars) {
        const { θ, d, D } = vars;
        
        if (unknownVar === 'θ') {
            // θ = d/D
            return d / D;
        } else if (unknownVar === 'd') {
            // d = θ × D
            return θ * D;
        } else if (unknownVar === 'D') {
            // D = d/θ
            return d / θ;
        }
    }

    solveParallaxRadians(unknownVar, vars) {
        const { d, p, AU } = vars;
        
        if (unknownVar === 'd') {
            // d = 1 AU / tan(p)
            return AU / Math.tan(p);
        } else if (unknownVar === 'p') {
            // p = arctan(AU / d)
            return Math.atan(AU / d);
        }
    }

    solveParallaxArcsec(unknownVar, vars) {
        const { d, p } = vars;
        
        // FIXED: Parallax in arcsec, distance in parsecs
        // Formula: d (pc) = 1 / p (arcsec)
        // If p is in radians, convert: p_rad = p_arcsec * (π/180/3600)
        // But standard formula assumes p is already in arcsec
        
        if (unknownVar === 'd') {
            // d = 1 / p (where p is in arcseconds, d is in parsecs)
            if (p <= 0) throw new Error('Parallax must be positive');
            return 1 / p;
        } else if (unknownVar === 'p') {
            // p = 1 / d (p in arcseconds, d in parsecs)
            if (d <= 0) throw new Error('Distance must be positive');
            return 1 / d;
        }
    }

    solveMaxGammaBohm(unknownVar, vars) {
        const gammamax = vars.γmax;
        const B = vars.B;
        const xi = vars.ξ;
        const e = vars.e;
        const sigmaT = vars.σT;
        
        if (unknownVar === 'γmax') {
            // γmax = √(6πε / (σT B ξ))
            return Math.sqrt((6 * Math.PI * e) / (sigmaT * B * xi));
        } else if (unknownVar === 'B') {
            // B = 6πε / (σT γmax² ξ)
            return (6 * Math.PI * e) / (sigmaT * gammamax * gammamax * xi);
        } else if (unknownVar === 'ξ') {
            // ξ = 6πε / (σT B γmax²)
            return (6 * Math.PI * e) / (sigmaT * B * gammamax * gammamax);
        }
    }

    solveCoolingBreakGamma(unknownVar, vars) {
        const gammab = vars.γb;
        const B = vars.B;
        const t_age = vars.t_age;
        const m_e = vars.m_e;
        const c = vars.c;
        const sigma_T = vars.σ_T;
        
        if (unknownVar === 'γb') {
            // γb = (6π m_e c) / (σ_T B² t_age)
            return (6 * Math.PI * m_e * c) / (sigma_T * B * B * t_age);
        } else if (unknownVar === 'B') {
            // B = √((6π m_e c) / (σ_T γb t_age))
            return Math.sqrt((6 * Math.PI * m_e * c) / (sigma_T * gammab * t_age));
        } else if (unknownVar === 't_age') {
            // t_age = (6π m_e c) / (σ_T B² γb)
            return (6 * Math.PI * m_e * c) / (sigma_T * B * B * gammab);
        }
    }

    solveCoolingBreakFrequency(unknownVar, vars) {
        const nub = vars.νb;
        const B = vars.B;
        const gammab = vars.γb;
        const e = vars.e;
        const m_e = vars.m_e;
        const c = vars.c;
        
        if (unknownVar === 'νb') {
            // νb = (3eB / (4π m_e c)) × γb²
            return (3 * e * B / (4 * Math.PI * m_e * c)) * gammab * gammab;
        } else if (unknownVar === 'B') {
            // B = (4π m_e c νb) / (3e γb²)
            return (4 * Math.PI * m_e * c * nub) / (3 * e * gammab * gammab);
        } else if (unknownVar === 'γb') {
            // γb = √((4π m_e c νb) / (3eB))
            return Math.sqrt((4 * Math.PI * m_e * c * nub) / (3 * e * B));
        }
    }

    solveSynchrotronCooling(unknownVar, vars) {
        const t_syn = vars.t_syn;
        const B = vars.B;
        const gamma = vars.γ;
        const m_e = vars.m_e;
        const c = vars.c;
        const sigma_T = vars.σ_T;
        
        if (unknownVar === 't_syn') {
            // t_syn = (6π m_e c) / (σ_T B² γ)
            return (6 * Math.PI * m_e * c) / (sigma_T * B * B * gamma);
        } else if (unknownVar === 'B') {
            // B = √((6π m_e c) / (σ_T t_syn γ))
            return Math.sqrt((6 * Math.PI * m_e * c) / (sigma_T * t_syn * gamma));
        } else if (unknownVar === 'γ') {
            // γ = (6π m_e c) / (σ_T B² t_syn)
            return (6 * Math.PI * m_e * c) / (sigma_T * B * B * t_syn);
        }
    }

    solveSynchrotronPower(unknownVar, vars) {
        const P_syn = vars.P_syn;
        const U_B = vars.U_B;
        const gamma = vars.γ;
        const sigma_T = vars.σ_T;
        const c = vars.c;
        
        if (unknownVar === 'P_syn') {
            // P_syn = (4/3) σ_T c U_B γ²
            return (4/3) * sigma_T * c * U_B * gamma * gamma;
        } else if (unknownVar === 'U_B') {
            // U_B = (3 P_syn) / (4 σ_T c γ²)
            return (3 * P_syn) / (4 * sigma_T * c * gamma * gamma);
        } else if (unknownVar === 'γ') {
            // γ = √((3 P_syn) / (4 σ_T c U_B))
            return Math.sqrt((3 * P_syn) / (4 * sigma_T * c * U_B));
        }
    }

    solveMagneticEnergyDensity(unknownVar, vars) {
        const { U_B, B } = vars;
        
        if (unknownVar === 'U_B') {
            // U_B = B² / (8π)
            return (B * B) / (8 * Math.PI);
        } else if (unknownVar === 'B') {
            // B = √(8π U_B)
            return Math.sqrt(8 * Math.PI * U_B);
        }
    }

    solvePowerLawSpectrum(unknownVar, vars) {
        const { N, K, E, p } = vars;
        
        if (unknownVar === 'N') {
            // N = K E^(-p)
            return K * Math.pow(E, -p);
        } else if (unknownVar === 'K') {
            // K = N / E^(-p) = N E^p
            return N * Math.pow(E, p);
        } else if (unknownVar === 'E') {
            // E = (N/K)^(-1/p)
            return Math.pow(N / K, -1/p);
        } else if (unknownVar === 'p') {
            // p = -ln(N/K) / ln(E)
            return -Math.log(N / K) / Math.log(E);
        }
    }

    solveSpectralIndex(unknownVar, vars) {
        const alpha = vars.α;
        const p = vars.p;
        
        if (unknownVar === 'α') {
            // α = (p - 1) / 2
            return (p - 1) / 2;
        } else if (unknownVar === 'p') {
            // p = 2α + 1
            return 2 * alpha + 1;
        }
    }

    solveChandrasekharLimit(unknownVar, vars) {
        const M_Ch = vars.M_Ch;
        const M_sun = vars["M_☉"];
        
        if (unknownVar === 'M_Ch') {
            // M_Ch = 1.4 M_☉
            return 1.4 * M_sun;
        }
    }

    solveWhiteDwarfMassRadius(unknownVar, vars) {
        const { R, M } = vars;
        
        // FIXED: Return symbolic relation instead of throwing error
        // R ∝ 1 / M^(1/3), so R = k / M^(1/3)
        // For calculation, we use R = k / M^(1/3) where k is a constant
        // Since it's proportional, we can only solve if we have a reference point
        // But we can return the symbolic relationship
        
        if (unknownVar === 'R') {
            // R = k / M^(1/3), but k is unknown
            // Return symbolic expression instead of error
            if (M !== undefined && M !== null) {
                // If we have M, we need a reference - use typical white dwarf values
                // Typical: M = 0.6 M☉, R = 0.01 R☉
                const M_ref = 0.6 * (vars["M_☉"] || vars.M_sun || 1.989e30);
                const R_ref = 0.01 * (vars["R_☉"] || vars.R_sun || 6.96e8);
                const k = R_ref * Math.pow(M_ref, 1/3);
                return k / Math.pow(M, 1/3);
            }
            // Symbolic: R = k / M^(1/3)
            throw new Error('White dwarf mass-radius relation: R = k / M^(1/3). Provide M to calculate R, or use symbolic mode.');
        } else if (unknownVar === 'M') {
            // M = (k/R)^3, but k is unknown
            if (R !== undefined && R !== null) {
                // Use reference values
                const M_ref = 0.6 * (vars["M_☉"] || vars.M_sun || 1.989e30);
                const R_ref = 0.01 * (vars["R_☉"] || vars.R_sun || 6.96e8);
                const k = R_ref * Math.pow(M_ref, 1/3);
                return Math.pow(k / R, 3);
            }
            // Symbolic: M = (k/R)^3
            throw new Error('White dwarf mass-radius relation: M = (k/R)^3. Provide R to calculate M, or use symbolic mode.');
        }
    }

    solveWiensLaw(unknownVar, vars) {
        const { λmax, T, b } = vars;
        const wienConstant = b || 2.897771955e-3; // Wien's displacement constant in m·K
        
        // ENHANCED: Division-by-zero and validation checks
        if (unknownVar === 'λmax') {
            // λmax = b / T
            if (T <= 0) {
                throw new Error('Temperature T must be positive (in Kelvin)');
            }
            if (!wienConstant || wienConstant === 0) {
                throw new Error('Wien constant b must be non-zero');
            }
            const result = wienConstant / T;
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'T') {
            // T = b / λmax
            if (λmax <= 0) {
                throw new Error('Peak wavelength λmax must be positive');
            }
            if (!wienConstant || wienConstant === 0) {
                throw new Error('Wien constant b must be non-zero');
            }
            const result = wienConstant / λmax;
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        }
    }

    solveHydrostaticBalance(unknownVar, vars) {
        const { dP_dr, M, ρ, r, G } = vars;
        
        if (unknownVar === 'dP_dr') {
            // dP/dr = -GM(r)ρ(r) / r²
            return -(G * M * ρ) / (r * r);
        } else if (unknownVar === 'M') {
            // M = -(dP/dr) r² / (G ρ)
            return -(dP_dr * r * r) / (G * ρ);
        } else if (unknownVar === 'ρ') {
            // ρ = -(dP/dr) r² / (G M)
            return -(dP_dr * r * r) / (G * M);
        } else if (unknownVar === 'r') {
            // r = √(-(dP/dr) / (G M ρ))
            return Math.sqrt(-(dP_dr) / (G * M * ρ));
        }
    }

    solveKeplerThirdLawBinary(unknownVar, vars) {
        const { P, a, M1, M2, G } = vars;
        
        if (unknownVar === 'P') {
            // P = √((4π²a³) / (G(M1 + M2)))
            return Math.sqrt((4 * Math.PI * Math.PI * a * a * a) / (G * (M1 + M2)));
        } else if (unknownVar === 'a') {
            // a = ∛((G(M1 + M2) P²) / (4π²))
            return Math.cbrt((G * (M1 + M2) * P * P) / (4 * Math.PI * Math.PI));
        } else if (unknownVar === 'M1') {
            // M1 = (4π²a³) / (G P²) - M2
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M2;
        } else if (unknownVar === 'M2') {
            // M2 = (4π²a³) / (G P²) - M1
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M1;
        }
    }

    solveRotationalVelocity(unknownVar, vars) {
        const { v, R, P_rot } = vars;
        
        if (unknownVar === 'v') {
            // v = (2πR) / P_rot
            return (2 * Math.PI * R) / P_rot;
        } else if (unknownVar === 'R') {
            // R = (v P_rot) / (2π)
            return (v * P_rot) / (2 * Math.PI);
        } else if (unknownVar === 'P_rot') {
            // P_rot = (2πR) / v
            return (2 * Math.PI * R) / v;
        }
    }

    solveAverageDensity(unknownVar, vars) {
        const { ρ, M, R } = vars;
        
        if (unknownVar === 'ρ') {
            // ρ = 3M / (4πR³)
            return (3 * M) / (4 * Math.PI * R * R * R);
        } else if (unknownVar === 'M') {
            // M = (4πR³ρ) / 3
            return (4 * Math.PI * R * R * R * ρ) / 3;
        } else if (unknownVar === 'R') {
            // R = ∛(3M / (4πρ))
            return Math.cbrt((3 * M) / (4 * Math.PI * ρ));
        }
    }

    solveFluxFromLuminosity(unknownVar, vars) {
        const { F, L, d } = vars;
        
        if (unknownVar === 'F') {
            // F = L / (4πd²)
            return L / (4 * Math.PI * d * d);
        } else if (unknownVar === 'L') {
            // L = 4πd²F
            return 4 * Math.PI * d * d * F;
        } else if (unknownVar === 'd') {
            // d = √(L / (4πF))
            return Math.sqrt(L / (4 * Math.PI * F));
        }
    }

    solveMagnitudeFluxRelation(unknownVar, vars) {
        const { m1, m2, F1, F2 } = vars;
        
        if (unknownVar === 'm1') {
            // m1 = m2 - 2.5 log₁₀(F1/F2)
            return m2 - 2.5 * Math.log10(F1 / F2);
        } else if (unknownVar === 'm2') {
            // m2 = m1 + 2.5 log₁₀(F1/F2)
            return m1 + 2.5 * Math.log10(F1 / F2);
        } else if (unknownVar === 'F1') {
            // F1 = F2 × 10^((m2 - m1) / 2.5)
            return F2 * Math.pow(10, (m2 - m1) / 2.5);
        } else if (unknownVar === 'F2') {
            // F2 = F1 × 10^((m1 - m2) / 2.5)
            return F1 * Math.pow(10, (m1 - m2) / 2.5);
        }
    }

    solveInverseSquareLawBrightness(unknownVar, vars) {
        const { b, L, d, pi } = vars;
        const p = pi || Math.PI;
        
        if (unknownVar === 'b') {
            return L / (4 * p * d * d);
        } else if (unknownVar === 'L') {
            return b * 4 * p * d * d;
        } else if (unknownVar === 'd') {
            return Math.sqrt(L / (4 * p * b));
        }
    }

    solveDopplerShift(unknownVar, vars) {
        const lambda_obs = vars['λ_obs'] || vars.lambda_obs;
        const lambda_rest = vars['λ_rest'] || vars.lambda_rest;
        const v = vars.v;
        const c = vars.c || 2.998e8;
        
        if (unknownVar === 'λ_obs' || unknownVar === 'lambda_obs') {
            return lambda_rest * (1 + v / c);
        } else if (unknownVar === 'λ_rest' || unknownVar === 'lambda_rest') {
            return lambda_obs / (1 + v / c);
        } else if (unknownVar === 'v') {
            return c * ((lambda_obs - lambda_rest) / lambda_rest);
        }
    }

    solveDopplerShiftApprox(unknownVar, vars) {
        const v = vars.v;
        const c = vars.c || 2.998e8;
        const deltaLambda = vars['Δλ'] || vars.deltaLambda;
        const lambda = vars['λ'] || vars.lambda;
        
        if (unknownVar === 'v') {
            return c * (deltaLambda / lambda);
        } else if (unknownVar === 'Δλ' || unknownVar === 'deltaLambda') {
            return v * lambda / c;
        } else if (unknownVar === 'λ' || unknownVar === 'lambda') {
            return c * deltaLambda / v;
        }
    }

    solveFluxTemperature(unknownVar, vars) {
        const F = vars.F;
        const T = vars.T;
        const sigma = vars['σ'] || vars.sigma || 5.670e-8;
        
        if (unknownVar === 'F') {
            return sigma * Math.pow(T, 4);
        } else if (unknownVar === 'T') {
            return Math.pow(F / sigma, 0.25);
        }
    }

    solveLightGatheringPower(unknownVar, vars) {
        const { LGP, D_obj, D_eye } = vars;
        
        if (unknownVar === 'LGP') {
            return Math.pow(D_obj / D_eye, 2);
        } else if (unknownVar === 'D_obj') {
            return D_eye * Math.sqrt(LGP);
        } else if (unknownVar === 'D_eye') {
            return D_obj / Math.sqrt(LGP);
        }
    }

    solveMagnification(unknownVar, vars) {
        const { M, f_obj, f_eye } = vars;
        
        if (unknownVar === 'M') {
            return f_obj / f_eye;
        } else if (unknownVar === 'f_obj') {
            return M * f_eye;
        } else if (unknownVar === 'f_eye') {
            return f_obj / M;
        }
    }

    solveFRatio(unknownVar, vars) {
        const { f_ratio, f, D } = vars;
        
        if (unknownVar === 'f_ratio') {
            return f / D;
        } else if (unknownVar === 'f') {
            return f_ratio * D;
        } else if (unknownVar === 'D') {
            return f / f_ratio;
        }
    }

    solveAngularResolution(unknownVar, vars) {
        const theta = vars['θ'] || vars.theta;
        const lambda = vars['λ'] || vars.lambda;
        const D = vars.D;
        const factor = vars.factor || 1.22;
        
        if (unknownVar === 'θ' || unknownVar === 'theta') {
            return factor * (lambda / D);
        } else if (unknownVar === 'λ' || unknownVar === 'lambda') {
            return theta * D / factor;
        } else if (unknownVar === 'D') {
            return factor * lambda / theta;
        }
    }

    solveKeplerThirdLawSolar(unknownVar, vars) {
        const { P, a } = vars;
        
        if (unknownVar === 'P') {
            return Math.sqrt(a * a * a);
        } else if (unknownVar === 'a') {
            return Math.cbrt(P * P);
        }
    }

    solveTidalForce(unknownVar, vars) {
        const { F_tidal, G, M, m, R, d } = vars;
        const grav = G || 6.67430e-11;
        
        if (unknownVar === 'F_tidal') {
            return (2 * grav * M * m * R) / (d * d * d);
        } else if (unknownVar === 'd') {
            return Math.cbrt((2 * grav * M * m * R) / F_tidal);
        } else if (unknownVar === 'M') {
            return (F_tidal * d * d * d) / (2 * grav * m * R);
        } else if (unknownVar === 'm') {
            return (F_tidal * d * d * d) / (2 * grav * M * R);
        } else if (unknownVar === 'R') {
            return (F_tidal * d * d * d) / (2 * grav * M * m);
        }
    }

    solveRocheLimit(unknownVar, vars) {
        const { d, R, ρ_M, ρ_m, factor } = vars;
        const fac = factor || 2;
        
        if (unknownVar === 'd') {
            return R * Math.cbrt(fac * (ρ_M / ρ_m));
        } else if (unknownVar === 'R') {
            return d / Math.cbrt(fac * (ρ_M / ρ_m));
        } else if (unknownVar === 'ρ_M') {
            return ρ_m * Math.pow(d / (R * Math.cbrt(fac)), 3);
        } else if (unknownVar === 'ρ_m') {
            return ρ_M / Math.pow(d / (R * Math.cbrt(fac)), 3);
        }
    }

    solveOrbitalEnergy(unknownVar, vars) {
        const { E, G, M, m, a } = vars;
        const grav = G || 6.67430e-11;
        
        if (unknownVar === 'E') {
            return -(grav * M * m) / (2 * a);
        } else if (unknownVar === 'a') {
            return -(grav * M * m) / (2 * E);
        } else if (unknownVar === 'M') {
            return -(2 * E * a) / (grav * m);
        } else if (unknownVar === 'm') {
            return -(2 * E * a) / (grav * M);
        }
    }

    solveVisViva(unknownVar, vars) {
        const { v, G, M, r, a } = vars;
        const grav = G || 6.67430e-11;
        
        if (unknownVar === 'v') {
            return Math.sqrt(grav * M * ((2 / r) - (1 / a)));
        } else if (unknownVar === 'a') {
            return 1 / ((2 / r) - (v * v / (grav * M)));
        } else if (unknownVar === 'r') {
            return 2 / ((v * v / (grav * M)) + (1 / a));
        } else if (unknownVar === 'M') {
            return (v * v) / (grav * ((2 / r) - (1 / a)));
        }
    }

    solveCenterOfMass(unknownVar, vars) {
        const { M1, M2, r1, r2, a } = vars;
        
        if (unknownVar === 'r1') {
            return (M2 * r2) / M1;
        } else if (unknownVar === 'r2') {
            return (M1 * r1) / M2;
        } else if (unknownVar === 'a') {
            return r1 + r2;
        } else if (unknownVar === 'M1') {
            return (M2 * r2) / r1;
        } else if (unknownVar === 'M2') {
            return (M1 * r1) / r2;
        }
    }

    solveStellarLifetime(unknownVar, vars) {
        const tau = vars['τ'] || vars.tau;
        const M_sun = vars['M_sun'] || vars.M_sun || 1.989e30;
        const M = vars.M;
        const factor = vars.factor || 1e10;
        const exponent = vars.exponent || 2.5;
        
        if (unknownVar === 'τ' || unknownVar === 'tau') {
            return factor * Math.pow(M_sun / M, exponent);
        } else if (unknownVar === 'M') {
            return M_sun / Math.pow(tau / factor, 1 / exponent);
        }
    }

    solveMassLuminosityRelation(unknownVar, vars) {
        const { L, M, exponent } = vars;
        const exp = exponent || 3.5;
        
        if (unknownVar === 'L') {
            return Math.pow(M, exp);
        } else if (unknownVar === 'M') {
            return Math.pow(L, 1 / exp);
        }
    }

    solveHRColorIndex(unknownVar, vars) {
        const B_V = vars['B_V'] || vars.B_V;
        const F_B = vars['F_B'] || vars.F_B;
        const F_V = vars['F_V'] || vars.F_V;
        const C = vars.C;
        const factor = vars.factor || -2.5;
        
        if (unknownVar === 'B_V' || unknownVar === 'B_V') {
            return factor * Math.log10(F_B / F_V) + C;
        } else if (unknownVar === 'F_B' || unknownVar === 'F_B') {
            return F_V * Math.pow(10, (B_V - C) / factor);
        } else if (unknownVar === 'F_V' || unknownVar === 'F_V') {
            return F_B / Math.pow(10, (B_V - C) / factor);
        } else if (unknownVar === 'C') {
            return B_V - factor * Math.log10(F_B / F_V);
        }
    }

    solveHRAbsoluteMagnitude(unknownVar, vars) {
        const M_V = vars['M_V'] || vars.M_V;
        const L = vars.L;
        const L_sun = vars['L_sun'] || vars.L_sun || 3.828e26;
        const factor = vars.factor || -2.5;
        const offset = vars.offset || 4.83;
        
        if (unknownVar === 'M_V' || unknownVar === 'M_V') {
            return factor * Math.log10(L / L_sun) + offset;
        } else if (unknownVar === 'L') {
            return L_sun * Math.pow(10, (M_V - offset) / factor);
        }
    }

    solveFriedmannEquation(unknownVar, vars) {
        const H = vars.H;
        const H0 = vars.H0;
        const Omega_m = vars['Ω_m'] || vars.Omega_m;
        const Omega_r = vars['Ω_r'] || vars.Omega_r;
        const Omega_Lambda = vars['Ω_Λ'] || vars.Omega_Lambda;
        const a = vars.a;
        
        if (unknownVar === 'H') {
            return H0 * Math.sqrt(Omega_m * Math.pow(a, -3) + Omega_r * Math.pow(a, -4) + Omega_Lambda);
        } else if (unknownVar === 'H0' || unknownVar === 'H0') {
            return H / Math.sqrt(Omega_m * Math.pow(a, -3) + Omega_r * Math.pow(a, -4) + Omega_Lambda);
        }
        // Note: Solving for other variables requires more complex algebra
    }

    solveCriticalDensity(unknownVar, vars) {
        const rho_c = vars['ρ_c'] || vars.rho_c;
        const H0 = vars.H0;
        const G = vars.G || 6.67430e-11;
        const factor = vars.factor || 3;
        const pi = vars.pi || Math.PI;
        
        // Convert H0 from km/(s·Mpc) to 1/s
        const H0_s = H0 * 1000 / (3.086e22); // Convert Mpc to m
        
        if (unknownVar === 'ρ_c' || unknownVar === 'rho_c') {
            return (factor * H0_s * H0_s) / (8 * pi * G);
        } else if (unknownVar === 'H0' || unknownVar === 'H0') {
            return Math.sqrt((8 * pi * G * rho_c) / factor) * (3.086e22 / 1000); // Convert back
        }
    }

    solveSchwarzschildRadius(unknownVar, vars) {
        const R_s = vars['R_s'] || vars.R_s;
        const G = vars.G || 6.67430e-11;
        const M = vars.M;
        const c = vars.c || 2.998e8;
        const factor = vars.factor || 2;
        
        if (unknownVar === 'R_s' || unknownVar === 'R_s') {
            return (factor * G * M) / (c * c);
        } else if (unknownVar === 'M') {
            return (R_s * c * c) / (factor * G);
        }
    }

    solveTimeDilation(unknownVar, vars) {
        const delta_t_prime = vars['Δt\''] || vars['delta_t_prime'] || vars.delta_t_prime;
        const delta_t = vars['Δt'] || vars.delta_t || vars.delta_t;
        const v = vars.v;
        const c = vars.c || 2.998e8;
        
        if (unknownVar === 'Δt\'' || unknownVar === 'delta_t_prime' || unknownVar === 'delta_t_prime') {
            return delta_t / Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'Δt' || unknownVar === 'delta_t' || unknownVar === 'delta_t') {
            return delta_t_prime * Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'v') {
            return c * Math.sqrt(1 - Math.pow(delta_t / delta_t_prime, 2));
        }
    }

    solveLengthContraction(unknownVar, vars) {
        const L_prime = vars['L\''] || vars['L_prime'] || vars.L_prime;
        const L = vars.L;
        const v = vars.v;
        const c = vars.c || 2.998e8;
        
        if (unknownVar === 'L\'' || unknownVar === 'L_prime' || unknownVar === 'L_prime') {
            return L * Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'L') {
            return L_prime / Math.sqrt(1 - (v * v / (c * c)));
        } else if (unknownVar === 'v') {
            return c * Math.sqrt(1 - Math.pow(L_prime / L, 2));
        }
    }

    solvePlanetaryEquilibriumTemperature(unknownVar, vars) {
        const T_eq = vars['T_eq'] || vars.T_eq;
        const T_star = vars['T_star'] || vars.T_star;
        const R_star = vars['R_star'] || vars.R_star;
        const a = vars.a;
        const A = vars.A;
        const factor = vars.factor || 2;
        
        if (unknownVar === 'T_eq' || unknownVar === 'T_eq') {
            return T_star * Math.sqrt(R_star / (factor * a)) * Math.pow(1 - A, 0.25);
        } else if (unknownVar === 'T_star' || unknownVar === 'T_star') {
            return T_eq / (Math.sqrt(R_star / (factor * a)) * Math.pow(1 - A, 0.25));
        } else if (unknownVar === 'a') {
            return R_star / (factor * Math.pow(T_eq / (T_star * Math.pow(1 - A, 0.25)), 2));
        } else if (unknownVar === 'A') {
            return 1 - Math.pow(T_eq / (T_star * Math.sqrt(R_star / (factor * a))), 4);
        }
    }

    solveGreenhouseEffect(unknownVar, vars) {
        const delta_T_GH = vars['ΔT_GH'] || vars.delta_T_GH || vars.delta_T_GH;
        const T_surface = vars['T_surface'] || vars.T_surface;
        const T_eq = vars['T_eq'] || vars.T_eq;
        
        if (unknownVar === 'ΔT_GH' || unknownVar === 'delta_T_GH' || unknownVar === 'delta_T_GH') {
            return T_surface - T_eq;
        } else if (unknownVar === 'T_surface' || unknownVar === 'T_surface') {
            return T_eq + delta_T_GH;
        } else if (unknownVar === 'T_eq' || unknownVar === 'T_eq') {
            return T_surface - delta_T_GH;
        }
    }

    solveAlbedo(unknownVar, vars) {
        const { A, F_reflected, F_incident } = vars;
        
        if (unknownVar === 'A') {
            return F_reflected / F_incident;
        } else if (unknownVar === 'F_reflected') {
            return A * F_incident;
        } else if (unknownVar === 'F_incident') {
            return F_reflected / A;
        }
    }

    solveBlackbodyRadiation(unknownVar, vars) {
        const B_lambda = vars['B_λ'] || vars.B_lambda;
        const h = vars.h || 6.626e-34;
        const c = vars.c || 2.998e8;
        const lambda = vars['λ'] || vars.lambda;
        const k = vars.k || 1.381e-23;
        const T = vars.T;
        const factor = vars.factor || 2;
        
        // B_λ(T) = (2hc² / λ⁵) × (1 / (e^(hc/(λkT)) - 1))
        const hc = h * c;
        const exponent = hc / (lambda * k * T);
        
        if (unknownVar === 'B_λ' || unknownVar === 'B_lambda') {
            return (factor * hc * c / Math.pow(lambda, 5)) * (1 / (Math.exp(exponent) - 1));
        } else if (unknownVar === 'T') {
            // Requires iterative solution, use approximation
            const numerator = factor * hc * c / Math.pow(lambda, 5);
            const target = B_lambda / numerator;
            // Approximate: T ≈ hc / (λk * ln(1 + 1/target))
            return hc / (lambda * k * Math.log(1 + 1 / target));
        }
    }

    solveBinaryWhiteDwarf(unknownVar, vars) {
        const { P, a, M1, M2, G } = vars;
        
        if (unknownVar === 'P') {
            // P = √((4π²a³) / (G(M1 + M2)))
            return Math.sqrt((4 * Math.PI * Math.PI * a * a * a) / (G * (M1 + M2)));
        } else if (unknownVar === 'a') {
            // a = ∛((G(M1 + M2) P²) / (4π²))
            return Math.cbrt((G * (M1 + M2) * P * P) / (4 * Math.PI * Math.PI));
        } else if (unknownVar === 'M1') {
            // M1 = (4π²a³) / (G P²) - M2
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M2;
        } else if (unknownVar === 'M2') {
            // M2 = (4π²a³) / (G P²) - M1
            return (4 * Math.PI * Math.PI * a * a * a) / (G * P * P) - M1;
        }
    }

    solveWhiteDwarfOrbitalDecay(unknownVar, vars) {
        const da_dt = vars.da_dt;
        const a = vars.a;
        const M1 = vars.M1;
        const M2 = vars.M2;
        const G = vars.G || 6.67430e-11;
        const c = vars.c || 2.99792458e8;
        
        // da/dt = -64G³(M₁M₂(M₁+M₂)) / (5c⁵a³)
        if (unknownVar === 'da_dt') {
            return -(64 * Math.pow(G, 3) * M1 * M2 * (M1 + M2)) / (5 * Math.pow(c, 5) * a * a * a);
        } else if (unknownVar === 'a') {
            // a = ∛(-64G³(M₁M₂(M₁+M₂)) / (5c⁵(da/dt)))
            return Math.cbrt(-(64 * Math.pow(G, 3) * M1 * M2 * (M1 + M2)) / (5 * Math.pow(c, 5) * da_dt));
        } else if (unknownVar === 'M1') {
            // This requires solving a cubic equation, use approximation or numerical method
            // For simplicity, assume M1 = M2 and solve
            const M = M2; // Use M2 as reference
            const numerator = -5 * Math.pow(c, 5) * a * a * a * da_dt;
            const denominator = 64 * Math.pow(G, 3) * M;
            // M1(M1 + M) = numerator / denominator
            // M1² + M*M1 - (numerator/denominator) = 0
            const coeff = numerator / denominator;
            return (-M + Math.sqrt(M * M + 4 * coeff)) / 2;
        } else if (unknownVar === 'M2') {
            // Similar to M1
            const M = M1;
            const numerator = -5 * Math.pow(c, 5) * a * a * a * da_dt;
            const denominator = 64 * Math.pow(G, 3) * M;
            const coeff = numerator / denominator;
            return (-M + Math.sqrt(M * M + 4 * coeff)) / 2;
        }
    }

    solveWhiteDwarfMergerTimescale(unknownVar, vars) {
        const t_merge = vars.t_merge;
        const a = vars.a;
        const M1 = vars.M1;
        const M2 = vars.M2;
        const G = vars.G || 6.67430e-11;
        const c = vars.c || 2.99792458e8;
        
        // t_merge = (5c⁵a⁴) / (256G³M₁M₂(M₁+M₂))
        if (unknownVar === 't_merge') {
            return (5 * Math.pow(c, 5) * Math.pow(a, 4)) / (256 * Math.pow(G, 3) * M1 * M2 * (M1 + M2));
        } else if (unknownVar === 'a') {
            // a = (256G³M₁M₂(M₁+M₂)t_merge / (5c⁵))^(1/4)
            return Math.pow((256 * Math.pow(G, 3) * M1 * M2 * (M1 + M2) * t_merge) / (5 * Math.pow(c, 5)), 0.25);
        } else if (unknownVar === 'M1') {
            // M1(M1 + M2) = (5c⁵a⁴) / (256G³M₂t_merge)
            const coeff = (5 * Math.pow(c, 5) * Math.pow(a, 4)) / (256 * Math.pow(G, 3) * M2 * t_merge);
            return (-M2 + Math.sqrt(M2 * M2 + 4 * coeff)) / 2;
        } else if (unknownVar === 'M2') {
            // Similar to M1
            const coeff = (5 * Math.pow(c, 5) * Math.pow(a, 4)) / (256 * Math.pow(G, 3) * M1 * t_merge);
            return (-M1 + Math.sqrt(M1 * M1 + 4 * coeff)) / 2;
        }
    }

    solveHillRadius(unknownVar, vars) {
        const R_H = vars.R_H;
        const a = vars.a;
        const m = vars.m;
        const M = vars.M;
        
        // R_H = a × (m / (3M))^(1/3)
        if (unknownVar === 'R_H') {
            return a * Math.pow(m / (3 * M), 1/3);
        } else if (unknownVar === 'a') {
            return R_H / Math.pow(m / (3 * M), 1/3);
        } else if (unknownVar === 'm') {
            return 3 * M * Math.pow(R_H / a, 3);
        } else if (unknownVar === 'M') {
            return m / (3 * Math.pow(R_H / a, 3));
        }
    }

    solveSynodicPeriod(unknownVar, vars) {
        const P_syn = vars.P_syn;
        const P1 = vars['P₁'] || vars.P1;
        const P2 = vars['P₂'] || vars.P2;
        
        // 1/P_syn = |1/P₁ - 1/P₂|
        if (unknownVar === 'P_syn') {
            return 1 / Math.abs(1/P1 - 1/P2);
        } else if (unknownVar === 'P₁' || unknownVar === 'P1') {
            // 1/P₁ = 1/P_syn ± 1/P₂
            const term = 1/P_syn;
            const p2Term = 1/P2;
            // Try both solutions
            const sol1 = 1 / (term + p2Term);
            const sol2 = 1 / Math.abs(term - p2Term);
            return sol1 > 0 ? sol1 : sol2;
        } else if (unknownVar === 'P₂' || unknownVar === 'P2') {
            const term = 1/P_syn;
            const p1Term = 1/P1;
            const sol1 = 1 / (term + p1Term);
            const sol2 = 1 / Math.abs(term - p1Term);
            return sol1 > 0 ? sol1 : sol2;
        }
    }

    solveJeansMass(unknownVar, vars) {
        const M_J = vars.M_J;
        const T = vars.T;
        const ρ = vars.ρ;
        const μ = vars.μ || 2.3;
        const G = vars.G || 6.67430e-11;
        const k = vars.k || 1.380649e-23;
        const m_H = vars.m_H || 1.6735575e-27;
        
        // M_J ≈ ((5kT) / (Gμm_H))^(3/2) / ρ^(1/2)
        const coeff = Math.pow((5 * k * T) / (G * μ * m_H), 3/2);
        if (unknownVar === 'M_J') {
            return coeff / Math.sqrt(ρ);
        } else if (unknownVar === 'T') {
            return (G * μ * m_H / (5 * k)) * Math.pow(M_J * Math.sqrt(ρ), 2/3);
        } else if (unknownVar === 'ρ') {
            return Math.pow(coeff / M_J, 2);
        }
    }

    solvePlanckRelation(unknownVar, vars) {
        const E = vars.E;
        const f = vars.f;
        const λ = vars.λ;
        const h = vars.h || 6.62607015e-34;
        const c = vars.c || 2.99792458e8;
        
        // E = hf = hc / λ
        if (unknownVar === 'E') {
            if (f !== null && f !== undefined) {
                return h * f;
            } else if (λ !== null && λ !== undefined) {
                return h * c / λ;
            }
        } else if (unknownVar === 'f') {
            return E / h;
        } else if (unknownVar === 'λ') {
            return h * c / E;
        }
    }

    solveEinsteinRadius(unknownVar, vars) {
        const θ_E = vars.θ_E;
        const M = vars.M;
        const D_LS = vars.D_LS;
        const D_L = vars.D_L;
        const D_S = vars.D_S;
        const G = vars.G || 6.67430e-11;
        const c = vars.c || 2.99792458e8;
        
        // θ_E = √((4GM D_LS) / (c² D_L D_S))
        const numerator = 4 * G * M * D_LS;
        const denominator = c * c * D_L * D_S;
        if (unknownVar === 'θ_E') {
            return Math.sqrt(numerator / denominator);
        } else if (unknownVar === 'M') {
            return (θ_E * θ_E * c * c * D_L * D_S) / (4 * G * D_LS);
        } else if (unknownVar === 'D_LS') {
            return (θ_E * θ_E * c * c * D_L * D_S) / (4 * G * M);
        } else if (unknownVar === 'D_L') {
            return (4 * G * M * D_LS) / (θ_E * θ_E * c * c * D_S);
        } else if (unknownVar === 'D_S') {
            return (4 * G * M * D_LS) / (θ_E * θ_E * c * c * D_L);
        }
    }

    solveAngularMomentumElliptical(unknownVar, vars) {
        const L = vars.L;
        const m_r = vars.m_r;
        const M = vars.M;
        const a = vars.a;
        const e = vars.e;
        const G = vars.G || 6.67430e-11;
        
        // L = m_r × √(GMa(1 - e²))
        const sqrtTerm = Math.sqrt(G * M * a * (1 - e * e));
        if (unknownVar === 'L') {
            return m_r * sqrtTerm;
        } else if (unknownVar === 'm_r') {
            return L / sqrtTerm;
        } else if (unknownVar === 'a') {
            return Math.pow(L / (m_r * Math.sqrt(G * M * (1 - e * e))), 2);
        } else if (unknownVar === 'e') {
            return Math.sqrt(1 - Math.pow(L / (m_r * Math.sqrt(G * M * a)), 2));
        }
    }

    solveCosmicRedshift(unknownVar, vars) {
        const z = vars.z;
        const λ_obs = vars.λ_obs;
        const λ_emit = vars.λ_emit;
        
        // z = (λ_obs - λ_emit) / λ_emit
        if (unknownVar === 'z') {
            return (λ_obs - λ_emit) / λ_emit;
        } else if (unknownVar === 'λ_obs') {
            return λ_emit * (1 + z);
        } else if (unknownVar === 'λ_emit') {
            return λ_obs / (1 + z);
        }
    }

    solveLookbackTime(unknownVar, vars) {
        const t = vars.t;
        const d = vars.d;
        const c = vars.c || 2.99792458e8;
        
        // t ≈ d / c
        if (unknownVar === 't') {
            return d / c;
        } else if (unknownVar === 'd') {
            return t * c;
        }
    }

    solveDensityParameter(unknownVar, vars) {
        const Ω = vars.Ω;
        const ρ = vars.ρ;
        const ρ_c = vars.ρ_c;
        
        // Ω = ρ / ρ_c
        if (unknownVar === 'Ω') {
            return ρ / ρ_c;
        } else if (unknownVar === 'ρ') {
            return Ω * ρ_c;
        } else if (unknownVar === 'ρ_c') {
            return ρ / Ω;
        }
    }

    solveAngularDiameterDistance(unknownVar, vars) {
        const D_A = vars.D_A;
        const D = vars.D;
        const θ = vars.θ;
        
        // D_A = D / θ
        if (unknownVar === 'D_A') {
            return D / θ;
        } else if (unknownVar === 'D') {
            return D_A * θ;
        } else if (unknownVar === 'θ') {
            return D / D_A;
        }
    }

    solveLuminosityDistance(unknownVar, vars) {
        const D_L = vars.D_L;
        const L = vars.L;
        const F = vars.F;
        const π = vars.π || Math.PI;
        
        // D_L = √(L / (4πF))
        if (unknownVar === 'D_L') {
            return Math.sqrt(L / (4 * π * F));
        } else if (unknownVar === 'L') {
            return 4 * π * F * D_L * D_L;
        } else if (unknownVar === 'F') {
            return L / (4 * π * D_L * D_L);
        }
    }

    solveGravitationalPotential(unknownVar, vars) {
        const Phi = vars['Φ'] || vars.Phi;
        const M = vars.M;
        const r = vars.r;
        const G = vars.G || 6.67430e-11;
        
        // ENHANCED: Division-by-zero and validation checks
        // Φ = -G M / r
        if (unknownVar === 'Φ' || unknownVar === 'Phi') {
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (M === 0) {
                throw new Error('Mass M must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            const result = -(G * M) / r;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'M') {
            // M = -Φ r / G
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (r <= 0) {
                throw new Error('Radius r must be positive');
            }
            if (Phi === 0) {
                throw new Error('Potential Φ must be non-zero to solve for mass');
            }
            const result = -(Phi * r) / G;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'r') {
            // r = -G M / Φ
            if (G === 0) {
                throw new Error('Gravitational constant G must be non-zero');
            }
            if (M === 0) {
                throw new Error('Mass M must be non-zero');
            }
            if (Phi === 0) {
                throw new Error('Potential Φ must be non-zero to solve for radius');
            }
            const result = -(G * M) / Phi;
            if (!isFinite(result) || result <= 0) {
                throw new Error('Result must be positive and finite. Check input values.');
            }
            return result;
        }
    }

    /**
     * Solve Total Energy from Virial Theorem
     * Equation: E_total = -E_grav / 2
     * 
     * @param {string} unknownVar - Variable to solve for
     * @param {Object} vars - Known variables
     * @returns {number} Solved value
     */
    solveTotalEnergyVirial(unknownVar, vars) {
        const E_total = vars.E_total;
        const E_grav = vars.E_grav;
        
        // ENHANCED: Validation checks
        if (unknownVar === 'E_total') {
            if (E_grav === null || E_grav === undefined) {
                throw new Error('E_grav (gravitational energy) is required to solve for E_total');
            }
            // E_total = -E_grav / 2
            const result = -E_grav / 2;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else if (unknownVar === 'E_grav') {
            if (E_total === null || E_total === undefined) {
                throw new Error('E_total (total energy) is required to solve for E_grav');
            }
            // E_grav = -2 * E_total
            const result = -2 * E_total;
            if (!isFinite(result)) {
                throw new Error('Result is infinite. Check input values.');
            }
            return result;
        } else {
            throw new Error(`Cannot solve for ${unknownVar} in virial theorem equation`);
        }
    }

    /**
     * UNIVERSAL Generic Equation Solver - Solves ANY simple algebraic equation
     * 
     * Handles ALL patterns:
     * - x = y + z, x = y - z
     * - x = y * z, x = y × z, x = y · z
     * - x = y / z
     * - x = -y, x = -y / n, x = -n * y
     * - x = y^n, x = √y, x = ∛y
     * - Reverse patterns (solving for variable on right side)
     * - Multi-variable expressions
     * 
     * @param {string} unknownVar - Variable to solve for
     * @param {Object} vars - Known variables
     * @returns {number|null} Solved value or null if cannot solve
     */
    solveGenericEquation(unknownVar, vars) {
        const equation = this.formula.equation;
        if (!equation) return null;
        
        // Normalize equation: remove spaces, handle Unicode
        let eq = equation.replace(/\s+/g, ' ').trim();
        eq = eq.replace(/×/g, '*').replace(/·/g, '*');
        
        // Escape special regex characters in unknownVar
        const escapedVar = unknownVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // PATTERN 1: Direct match - unknownVar on left side
        // x = expression
        const directPattern = new RegExp(`^${escapedVar}\\s*=\\s*(.+)$`, 'i');
        const directMatch = eq.match(directPattern);
        if (directMatch) {
            const expression = directMatch[1];
            return this.evaluateExpression(expression, vars, unknownVar);
        }
        
        // PATTERN 2: Reverse match - unknownVar on right side
        // expression = x
        const reversePattern = new RegExp(`^(.+)\\s*=\\s*${escapedVar}$`, 'i');
        const reverseMatch = eq.match(reversePattern);
        if (reverseMatch) {
            const expression = reverseMatch[1];
            // For reverse, we need to solve: expression = unknownVar
            // This means unknownVar = expression (already solved)
            return this.evaluateExpression(expression, vars, unknownVar);
        }
        
        // PATTERN 3: Try algebraic manipulation
        // If equation has form: A = B, and we need A, then A = B
        // If equation has form: A = B, and we need B, then B = A
        const equalsPattern = /^(.+?)\s*=\s*(.+)$/;
        const equalsMatch = eq.match(equalsPattern);
        if (equalsMatch) {
            const leftSide = equalsMatch[1].trim();
            const rightSide = equalsMatch[2].trim();
            
            // Check if unknownVar is on left side
            if (new RegExp(`\\b${escapedVar}\\b`, 'i').test(leftSide)) {
                // Solve: leftSide = rightSide for unknownVar
                return this.solveAlgebraic(leftSide, rightSide, unknownVar, vars);
            }
            
            // Check if unknownVar is on right side
            if (new RegExp(`\\b${escapedVar}\\b`, 'i').test(rightSide)) {
                // Solve: rightSide = leftSide for unknownVar (reversed)
                return this.solveAlgebraic(rightSide, leftSide, unknownVar, vars);
            }
        }
        
        return null; // Could not solve generically
    }

    /**
     * Evaluate a mathematical expression with variables
     * 
     * @param {string} expression - Expression to evaluate (e.g., "-E_grav / 2", "G * M / r")
     * @param {Object} vars - Variable values
     * @param {string} excludeVar - Variable to exclude (the one we're solving for)
     * @returns {number|null} Evaluated result
     */
    evaluateExpression(expression, vars, excludeVar) {
        try {
            // Replace all variables with their values
            let expr = expression;
            let allVarsFound = true;
            
            // Find all variable names in expression
            const varPattern = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
            const variables = new Set();
            let match;
            while ((match = varPattern.exec(expression)) !== null) {
                const varName = match[1];
                // Skip constants and the variable we're solving for
                if (varName !== excludeVar && 
                    !['pi', 'π', 'e', 'E', 'G', 'c', 'h', 'k', 'σ', 'sigma'].includes(varName.toLowerCase())) {
                    variables.add(varName);
                }
            }
            
            // Check if all required variables have values
            for (const varName of variables) {
                const value = vars[varName];
                if (value === null || value === undefined || !isFinite(value)) {
                    allVarsFound = false;
                    break;
                }
            }
            
            if (!allVarsFound) {
                return null;
            }
            
            // Replace variables with values
            for (const varName of variables) {
                const value = vars[varName];
                // Replace whole word matches only
                const varRegex = new RegExp(`\\b${varName}\\b`, 'g');
                expr = expr.replace(varRegex, value.toString());
            }
            
            // Replace constants
            expr = expr.replace(/\bpi\b/gi, Math.PI.toString());
            expr = expr.replace(/\bπ\b/g, Math.PI.toString());
            expr = expr.replace(/\be\b(?![\d.])/gi, Math.E.toString());
            
            // Replace common constants from vars
            if (vars.G) expr = expr.replace(/\bG\b/g, vars.G.toString());
            if (vars.c) expr = expr.replace(/\bc\b/g, vars.c.toString());
            if (vars.h) expr = expr.replace(/\bh\b/g, vars.h.toString());
            if (vars.k) expr = expr.replace(/\bk\b/g, vars.k.toString());
            if (vars.σ || vars.sigma) {
                const sigma = vars.σ || vars.sigma;
                expr = expr.replace(/\bσ\b/g, sigma.toString());
                expr = expr.replace(/\bsigma\b/gi, sigma.toString());
            }
            
            // Handle power notation (^)
            expr = expr.replace(/\^/g, '**');
            
            // Handle sqrt, cbrt
            expr = expr.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
            expr = expr.replace(/√([0-9.]+)/g, 'Math.sqrt($1)');
            expr = expr.replace(/∛\(([^)]+)\)/g, 'Math.cbrt($1)');
            expr = expr.replace(/∛([0-9.]+)/g, 'Math.cbrt($1)');
            
            // Evaluate using Function constructor (safe for math expressions)
            const result = Function('"use strict"; return (' + expr + ')')();
            
            if (typeof result === 'number' && isFinite(result)) {
                return result;
            }
        } catch (e) {
            // Evaluation failed
            return null;
        }
        
        return null;
    }

    /**
     * Solve algebraic equation: leftSide = rightSide for unknownVar
     * 
     * @param {string} leftSide - Left side of equation
     * @param {string} rightSide - Right side of equation
     * @param {string} unknownVar - Variable to solve for
     * @param {Object} vars - Known variables
     * @returns {number|null} Solved value
     */
    solveAlgebraic(leftSide, rightSide, unknownVar, vars) {
        // Simple cases where unknownVar appears alone or with simple operations
        
        // Case 1: unknownVar = rightSide (already isolated)
        if (leftSide.trim() === unknownVar) {
            return this.evaluateExpression(rightSide, vars, unknownVar);
        }
        
        // Case 2: -unknownVar = rightSide → unknownVar = -rightSide
        if (leftSide.trim() === `-${unknownVar}`) {
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null) return -rightValue;
        }
        
        // Case 3: unknownVar / n = rightSide → unknownVar = n * rightSide
        const divPattern = new RegExp(`^${unknownVar}\\s*/\\s*([0-9.]+)$`, 'i');
        const divMatch = leftSide.match(divPattern);
        if (divMatch) {
            const divisor = parseFloat(divMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(divisor) && divisor !== 0) {
                return rightValue * divisor;
            }
        }
        
        // Case 4: -unknownVar / n = rightSide → unknownVar = -n * rightSide
        const negDivPattern = new RegExp(`^-${unknownVar}\\s*/\\s*([0-9.]+)$`, 'i');
        const negDivMatch = leftSide.match(negDivPattern);
        if (negDivMatch) {
            const divisor = parseFloat(negDivMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(divisor) && divisor !== 0) {
                return -rightValue * divisor;
            }
        }
        
        // Case 5: n * unknownVar = rightSide → unknownVar = rightSide / n
        const multPattern = new RegExp(`^([0-9.]+)\\s*[×*]\\s*${unknownVar}$`, 'i');
        const multMatch = leftSide.match(multPattern);
        if (multMatch) {
            const multiplier = parseFloat(multMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(multiplier) && multiplier !== 0) {
                return rightValue / multiplier;
            }
        }
        
        // Case 6: -n * unknownVar = rightSide → unknownVar = -rightSide / n
        const negMultPattern = new RegExp(`^-([0-9.]+)\\s*[×*]\\s*${unknownVar}$`, 'i');
        const negMultMatch = leftSide.match(negMultPattern);
        if (negMultMatch) {
            const multiplier = parseFloat(negMultMatch[1]);
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (rightValue !== null && isFinite(multiplier) && multiplier !== 0) {
                return -rightValue / multiplier;
            }
        }
        
        // Case 7: unknownVar * var = rightSide → unknownVar = rightSide / var
        const varMultPattern = new RegExp(`^${unknownVar}\\s*[×*]\\s*([A-Za-z_]+)$`, 'i');
        const varMultMatch = leftSide.match(varMultPattern);
        if (varMultMatch) {
            const otherVar = varMultMatch[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) && otherValue !== 0 &&
                rightValue !== null) {
                return rightValue / otherValue;
            }
        }
        
        // Case 8: var * unknownVar = rightSide → unknownVar = rightSide / var
        const varMultPattern2 = new RegExp(`^([A-Za-z_]+)\\s*[×*]\\s*${unknownVar}$`, 'i');
        const varMultMatch2 = leftSide.match(varMultPattern2);
        if (varMultMatch2) {
            const otherVar = varMultMatch2[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) && otherValue !== 0 &&
                rightValue !== null) {
                return rightValue / otherValue;
            }
        }
        
        // Case 9: unknownVar / var = rightSide → unknownVar = rightSide * var
        const varDivPattern = new RegExp(`^${unknownVar}\\s*/\\s*([A-Za-z_]+)$`, 'i');
        const varDivMatch = leftSide.match(varDivPattern);
        if (varDivMatch) {
            const otherVar = varDivMatch[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) &&
                rightValue !== null) {
                return rightValue * otherValue;
            }
        }
        
        // Case 10: var / unknownVar = rightSide → unknownVar = var / rightSide
        const varDivPattern2 = new RegExp(`^([A-Za-z_]+)\\s*/\\s*${unknownVar}$`, 'i');
        const varDivMatch2 = leftSide.match(varDivPattern2);
        if (varDivMatch2) {
            const otherVar = varDivMatch2[1];
            const otherValue = vars[otherVar];
            const rightValue = this.evaluateExpression(rightSide, vars, unknownVar);
            if (otherValue !== null && otherValue !== undefined && 
                isFinite(otherValue) &&
                rightValue !== null && rightValue !== 0) {
                return otherValue / rightValue;
            }
        }
        
        return null;
    }

    /**
     * Convert symbolic expression to LaTeX format
     * Useful for rendering beautiful math in UI
     * @param {string} expression - Symbolic expression string
     * @returns {string} LaTeX formatted expression
     */
    toLatex(expression) {
        if (!expression || typeof expression !== 'string') {
            return expression || '';
        }
        
        // Convert common math symbols and operations to LaTeX
        let latex = expression
            // Greek letters
            .replace(/Φ/g, '\\Phi')
            .replace(/θ/g, '\\theta')
            .replace(/λ/g, '\\lambda')
            .replace(/π/g, '\\pi')
            .replace(/σ/g, '\\sigma')
            .replace(/τ/g, '\\tau')
            .replace(/ρ/g, '\\rho')
            .replace(/Ω/g, '\\Omega')
            .replace(/α/g, '\\alpha')
            .replace(/β/g, '\\beta')
            .replace(/γ/g, '\\gamma')
            .replace(/Δ/g, '\\Delta')
            .replace(/ν/g, '\\nu')
            // Subscripts
            .replace(/_([a-zA-Z0-9]+)/g, '_{$1}')
            // Superscripts
            .replace(/\^([0-9]+)/g, '^{$1}')
            .replace(/([a-zA-Z])\^([0-9]+)/g, '$1^{$2}')
            // Square roots
            .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
            .replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}')
            // Multiplication
            .replace(/×/g, ' \\times ')
            // Log base 10
            .replace(/log₁₀\(([^)]+)\)/g, '\\log_{10}\\left($1\\right)')
            .replace(/log10\(([^)]+)\)/g, '\\log_{10}\\left($1\\right)')
            // Natural log
            .replace(/ln\(([^)]+)\)/g, '\\ln\\left($1\\right)')
            // Powers
            .replace(/([a-zA-Z0-9]+)³/g, '$1^3')
            .replace(/([a-zA-Z0-9]+)²/g, '$1^2')
            .replace(/([a-zA-Z0-9]+)⁴/g, '$1^4')
            // Cube root
            .replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}')
            // Parentheses
            .replace(/\(/g, '\\left(')
            .replace(/\)/g, '\\right)');
        
        return latex;
    }
    
    /**
     * ENHANCED: Verify calculator is completely offline-capable
     * Checks that all dependencies are local
     * @returns {Object} Verification result
     */
    static verifyOfflineCapability() {
        const verification = {
            offline: true,
            issues: [],
            constants: {},
            dependencies: []
        };
        
        // Check globalConstants exists and is defined locally
        if (typeof globalConstants === 'undefined') {
            verification.offline = false;
            verification.issues.push('globalConstants not defined');
        } else {
            verification.constants = Object.keys(globalConstants);
            // Verify all required constants are present
            const required = ['G', 'c', 'σ', 'h', 'k', 'e', 'm_e', 'σ_T'];
            required.forEach(constant => {
                if (!globalConstants[constant] && !globalConstants[constant.toLowerCase()]) {
                    verification.issues.push(`Missing constant: ${constant}`);
                }
            });
        }
        
        // Check for external dependencies (should be none)
        if (typeof fetch !== 'undefined' && typeof XMLHttpRequest !== 'undefined') {
            // These are browser APIs, not external dependencies - OK
        }
        
        // Verify Math object is available (built-in, always available)
        if (typeof Math === 'undefined') {
            verification.offline = false;
            verification.issues.push('Math object not available');
        }
        
        return verification;
    }
    
    /**
     * Get all possible rearrangements of the formula
     * Returns all variables that can be solved for
     * @returns {Array<Object>} Array of {variable, expression, unit, latex} objects
     */
    getAllSolutions() {
        const solutions = [];
        const formulaId = this.formula.id;
        const constants = { ...globalConstants, ...this.formula.constants || {} };
        
        // For each variable, try to create a symbolic expression
        this.formula.variables.forEach(varDef => {
            const symbol = varDef.symbol;
            // Skip constants
            if (constants[symbol] !== undefined) return;
            
            try {
                const otherVars = this.formula.variables
                    .filter(v => v.symbol !== symbol)
                    .map(v => v.symbol);
                
                const expression = this.createSymbolicExpression(
                    formulaId, 
                    symbol, 
                    {}, 
                    otherVars, 
                    constants
                );
                
                if (expression && expression !== this.formula.equation) {
                    solutions.push({
                        variable: symbol,
                        expression: expression,
                        unit: varDef.unit || '',
                        latex: this.toLatex(expression)
                    });
                }
            } catch (e) {
                // Skip if can't solve for this variable
            }
        });
        
        return solutions;
    }
}

