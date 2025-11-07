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
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    throw new Error(`Invalid number for ${symbol}: ${value}`);
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
}

