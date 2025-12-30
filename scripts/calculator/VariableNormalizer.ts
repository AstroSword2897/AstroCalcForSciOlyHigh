/**
 * VariableNormalizer - Normalizes variable names for consistent handling
 * Handles Unicode Greek letters, subscripts, and alternative naming conventions
 */

export class VariableNormalizer {
    /**
     * Mapping of alternative variable names to canonical forms
     */
    static readonly MAPPINGS: Record<string, string> = {
        // Hubble constant variants
        'H₀': 'H0',
        'H_0': 'H0',
        'H_zero': 'H0',
        
        // Greek letters to ASCII
        'λ': 'lambda',
        'λmax': 'lambda_max',
        'λ_obs': 'lambda_obs',
        'λ_rest': 'lambda_rest',
        
        'ρ': 'rho',
        'ρ_c': 'rho_c',
        'ρ_M': 'rho_M',
        'ρ_m': 'rho_m',
        
        'σ': 'sigma',
        'σ_T': 'sigma_T',
        'σT': 'sigma_T',
        'σ_t': 'sigma_t',
        
        'τ': 'tau',
        'θ': 'theta',
        'θ_E': 'theta_E',
        
        'α': 'alpha',
        'β': 'beta',
        'γ': 'gamma',
        'γmax': 'gamma_max',
        'γb': 'gamma_b',
        
        'Δ': 'Delta',
        "Δt'": 'delta_t_prime',
        'delta_t_prime': 'delta_t_prime',
        'ΔT_GH': 'delta_T_GH',
        'delta_T_GH': 'delta_T_GH',
        
        'Ω': 'Omega',
        'Φ': 'Phi',
        'φ': 'phi',
        
        // Subscript variants
        'M_☉': 'M_sun',
        'M☉': 'M_sun',
        'M_sun': 'M_sun',
        'M_⊕': 'M_earth',
        'M_earth': 'M_earth',
        'R_☉': 'R_sun',
        'R☉': 'R_sun',
        'R_sun': 'R_sun',
        'L_☉': 'L_sun',
        'L☉': 'L_sun',
        'L_sun': 'L_sun',
        
        // Common physics variables
        'νb': 'nu_b',
        'ν_b': 'nu_b',
        'T_eq': 'T_eq',
        'R_s': 'R_s',
        'M_Ch': 'M_Ch',
        'B_V': 'B_V',
        'B-V': 'B_V',
        'M_V': 'M_V',
        'M-V': 'M_V',
        "L'": 'L_prime',
        'L_prime': 'L_prime',
        'dP_dr': 'dP_dr',
        'da_dt': 'da_dt',
        't_merge': 't_merge',
        't_syn': 't_syn',
        't_age': 't_age',
        'P_syn': 'P_syn',
        'P_rot': 'P_rot',
        'U_B': 'U_B',
        'v_esc': 'v_esc',
        'R_H': 'R_H',
        'M_J': 'M_J',
        'D_A': 'D_A',
        'D_L': 'D_L',
        'E_total': 'E_total',
    };
    
    /**
     * Normalize a single variable name to its canonical form
     */
    static normalize(varName: string): string {
        if (!varName || typeof varName !== 'string') {
            return varName;
        }
        
        // Check direct mapping first
        if (this.MAPPINGS[varName]) {
            return this.MAPPINGS[varName];
        }
        
        // Handle case-insensitive matching for common patterns
        const lowerVarName = varName.toLowerCase();
        for (const [key, value] of Object.entries(this.MAPPINGS)) {
            if (key.toLowerCase() === lowerVarName) {
                return value;
            }
        }
        
        // Return original if no mapping found
        return varName;
    }
    
    /**
     * Normalize all keys in a variables object
     */
    static normalizeObject<T>(vars: Record<string, T>): Record<string, T> {
        if (!vars || typeof vars !== 'object') {
            return vars;
        }
        
        const normalized: Record<string, T> = {};
        for (const [key, value] of Object.entries(vars)) {
            const normalizedKey = this.normalize(key);
            normalized[normalizedKey] = value;
        }
        
        return normalized;
    }
    
    /**
     * Get value with fallback to original key (for backward compatibility)
     */
    static getWithFallback<T>(vars: Record<string, T>, key: string): T | undefined {
        const normalized = this.normalize(key);
        return vars[normalized] ?? vars[key];
    }
    
    /**
     * Get all possible variants of a variable name
     */
    static getVariants(canonicalName: string): string[] {
        const variants = [canonicalName];
        for (const [key, value] of Object.entries(this.MAPPINGS)) {
            if (value === canonicalName && key !== canonicalName) {
                variants.push(key);
            }
        }
        return variants;
    }
}

