// Calculation Engine

class FormulaCalculator {
    constructor(formula) {
        this.formula = formula;
    }

    // Solve for a specific variable given the other values
    solve(variableValues) {
        const nullVars = [];
        const providedVars = {};

        // Separate null and provided variables
        for (const varDef of this.formula.variables) {
            const symbol = varDef.symbol;
            const value = variableValues[symbol];
            
            if (value === null || value === '' || value === 'null' || value === undefined) {
                nullVars.push(symbol);
            } else {
                // If already a number, use it; otherwise try to parse
                let numValue;
                if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
                    numValue = value;
                } else {
                    numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        throw new Error(`Invalid number for ${symbol}: ${value}`);
                    }
                }
                providedVars[symbol] = numValue;
            }
        }

        // Check that exactly one variable is null
        if (nullVars.length === 0) {
            throw new Error('At least one variable must be null (unknown)');
        }
        if (nullVars.length > 1) {
            throw new Error(`Only one variable can be unknown. Found ${nullVars.length} null values: ${nullVars.join(', ')}`);
        }

        const unknownVar = nullVars[0];
        const result = this.solveForVariable(unknownVar, providedVars);
        
        return {
            variable: unknownVar,
            value: result,
            unit: this.formula.variables.find(v => v.symbol === unknownVar)?.unit || ''
        };
    }

    // Solve for a specific variable based on the formula
    solveForVariable(unknownVar, knownVars) {
        const formulaId = this.formula.id;
        
        // Merge constants with known variables
        const vars = { ...this.formula.constants || {}, ...knownVars };
        
        switch (formulaId) {
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
            
            default:
                throw new Error(`Solver not implemented for formula: ${formulaId}`);
        }
    }

    // Individual formula solvers
    solveKeplerThirdLaw(unknownVar, vars) {
        const { T, a, M, G } = vars;
        
        if (unknownVar === 'T') {
            // T = √((4π²/GM) × a³)
            return Math.sqrt((4 * Math.PI * Math.PI / (G * M)) * (a * a * a));
        } else if (unknownVar === 'a') {
            // a = ∛(T² × GM / 4π²)
            return Math.cbrt((T * T * G * M) / (4 * Math.PI * Math.PI));
        } else if (unknownVar === 'M') {
            // M = (4π² × a³) / (G × T²)
            return (4 * Math.PI * Math.PI * a * a * a) / (G * T * T);
        }
    }

    solveOrbitalVelocity(unknownVar, vars) {
        const { v, r, M, G } = vars;
        
        if (unknownVar === 'v') {
            // v = √(GM/r)
            return Math.sqrt((G * M) / r);
        } else if (unknownVar === 'r') {
            // r = GM/v²
            return (G * M) / (v * v);
        } else if (unknownVar === 'M') {
            // M = rv²/G
            return (r * v * v) / G;
        }
    }

    solveEscapeVelocity(unknownVar, vars) {
        const { v_esc, r, M, G } = vars;
        
        if (unknownVar === 'v_esc') {
            // v_esc = √(2GM/r)
            return Math.sqrt((2 * G * M) / r);
        } else if (unknownVar === 'r') {
            // r = 2GM/v_esc²
            return (2 * G * M) / (v_esc * v_esc);
        } else if (unknownVar === 'M') {
            // M = rv_esc²/(2G)
            return (r * v_esc * v_esc) / (2 * G);
        }
    }

    solveDistanceModulus(unknownVar, vars) {
        const { m, M, d } = vars;
        
        if (unknownVar === 'm') {
            // m = M + 5 log₁₀(d) - 5
            return M + 5 * Math.log10(d) - 5;
        } else if (unknownVar === 'M') {
            // M = m - 5 log₁₀(d) + 5
            return m - 5 * Math.log10(d) + 5;
        } else if (unknownVar === 'd') {
            // d = 10^((m - M + 5)/5)
            return Math.pow(10, (m - M + 5) / 5);
        }
    }

    solveLuminosity(unknownVar, vars) {
        const L = vars.L;
        const R = vars.R;
        const T = vars.T;
        const sigma = vars.σ;
        
        if (unknownVar === 'L') {
            // L = 4πR²σT⁴
            return 4 * Math.PI * R * R * sigma * Math.pow(T, 4);
        } else if (unknownVar === 'R') {
            // R = √(L/(4πσT⁴))
            return Math.sqrt(L / (4 * Math.PI * sigma * Math.pow(T, 4)));
        } else if (unknownVar === 'T') {
            // T = (L/(4πR²σ))^(1/4)
            return Math.pow(L / (4 * Math.PI * R * R * sigma), 0.25);
        }
    }

    solveHubbleLaw(unknownVar, vars) {
        const v = vars.v;
        const H0 = vars["H₀"];
        const d = vars.d;
        
        if (unknownVar === 'v') {
            // v = H₀ × d
            return H0 * d;
        } else if (unknownVar === 'H₀') {
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
        
        if (unknownVar === 'd') {
            // d = 1 / p
            return 1 / p;
        } else if (unknownVar === 'p') {
            // p = 1 / d
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
        
        // R ∝ 1 / M^(1/3), so R = k / M^(1/3)
        // For calculation, we use R = k / M^(1/3) where k is a constant
        // Since it's proportional, we can only solve if we have a reference point
        // For simplicity, we'll use R = R0 * (M0/M)^(1/3) where R0 and M0 are reference values
        // But since we don't have a reference, we'll just solve the relationship
        if (unknownVar === 'R') {
            // R = k / M^(1/3), but k is unknown, so we return a proportional value
            // Actually, we need at least one known R-M pair to solve this
            throw new Error('White dwarf mass-radius relation requires a reference point. Cannot solve with only one variable.');
        } else if (unknownVar === 'M') {
            // M = (k/R)^3, but k is unknown
            throw new Error('White dwarf mass-radius relation requires a reference point. Cannot solve with only one variable.');
        }
    }

    solveWiensLaw(unknownVar, vars) {
        const { λmax, T, b } = vars;
        
        if (unknownVar === 'λmax') {
            // λmax = b / T
            return b / T;
        } else if (unknownVar === 'T') {
            // T = b / λmax
            return b / λmax;
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
}

