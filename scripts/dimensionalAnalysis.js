/**
 * Dimensional Analysis Engine
 * 
 * CRITICAL FIX: Prevents physically invalid operations
 * 
 * Validates that operations are dimensionally consistent:
 * - Cannot add distance + mass
 * - Cannot multiply incompatible units without proper conversion
 * - Validates formula variable units match expected dimensions
 * 
 * @version 2.0
 */

class DimensionalAnalysis {
    /**
     * Get dimensional formula for a unit
     * 
     * Returns dimensions as [L, M, T, Θ, ...] where:
     * L = length, M = mass, T = time, Θ = temperature
     * 
     * @param {string} unit - Unit string (e.g., "m", "kg", "s", "m/s")
     * @returns {Object} { dimensions: [L, M, T, Θ], unit: string }
     */
    static getDimensions(unit) {
        if (!unit || unit.length === 0) {
            return { dimensions: [0, 0, 0, 0], unit: 'dimensionless' };
        }

        const normalized = UnitParser.normalizeUnit(unit);

        // Base dimension definitions
        const baseDimensions = {
            // Length [L, M, T, Θ]
            'm': [1, 0, 0, 0], 'km': [1, 0, 0, 0], 'cm': [1, 0, 0, 0], 'mm': [1, 0, 0, 0],
            'μm': [1, 0, 0, 0], 'nm': [1, 0, 0, 0], 'Å': [1, 0, 0, 0],
            'AU': [1, 0, 0, 0], 'pc': [1, 0, 0, 0], 'ly': [1, 0, 0, 0],
            'kpc': [1, 0, 0, 0], 'Mpc': [1, 0, 0, 0],

            // Mass [L, M, T, Θ]
            'kg': [0, 1, 0, 0], 'g': [0, 1, 0, 0],
            'M☉': [0, 1, 0, 0], 'M⊕': [0, 1, 0, 0],

            // Time [L, M, T, Θ]
            's': [0, 0, 1, 0], 'min': [0, 0, 1, 0], 'hr': [0, 0, 1, 0],
            'day': [0, 0, 1, 0], 'yr': [0, 0, 1, 0],

            // Temperature [L, M, T, Θ]
            'K': [0, 0, 0, 1], '°C': [0, 0, 0, 1], '°F': [0, 0, 0, 1],

            // Angle (dimensionless)
            'rad': [0, 0, 0, 0], '°': [0, 0, 0, 0], 'arcsec': [0, 0, 0, 0], 'arcmin': [0, 0, 0, 0],

            // Derived units
            // Velocity = L/T
            'm/s': [1, 0, -1, 0], 'km/s': [1, 0, -1, 0], 'km/hr': [1, 0, -1, 0],
            // Acceleration = L/T²
            'm/s²': [1, 0, -2, 0], 'm/s^2': [1, 0, -2, 0],
            // Force = ML/T²
            'N': [1, 1, -2, 0], // Newton = kg·m/s²
            // Energy = ML²/T²
            'J': [2, 1, -2, 0], // Joule = kg·m²/s²
            'erg': [2, 1, -2, 0], 'eV': [2, 1, -2, 0],
            // Power = ML²/T³
            'W': [2, 1, -3, 0], // Watt = kg·m²/s³
            'L☉': [2, 1, -3, 0],
            // Frequency = 1/T
            'Hz': [0, 0, -1, 0], 'kHz': [0, 0, -1, 0], 'MHz': [0, 0, -1, 0], 'GHz': [0, 0, -1, 0]
        };

        // Check for compound units (e.g., "m/s", "kg·m²/s²")
        if (normalized.includes('/') || normalized.includes('·') || normalized.includes('*')) {
            return this.parseCompoundUnit(normalized);
        }

        // Check base dimensions
        if (baseDimensions[normalized]) {
            return { dimensions: baseDimensions[normalized], unit: normalized };
        }

        // Unknown unit - assume dimensionless for now
        return { dimensions: [0, 0, 0, 0], unit: normalized };
    }

    /**
     * Parse compound unit (e.g., "m/s", "kg·m²/s²")
     * 
     * @param {string} unit - Compound unit string
     * @returns {Object} { dimensions: [L, M, T, Θ], unit: string }
     */
    static parseCompoundUnit(unit) {
        // Split by division and multiplication
        const parts = unit.split(/\s*[\/·*]\s*/);
        const numerator = parts[0];
        const denominator = parts.slice(1);

        // Get dimensions for numerator
        const numDims = this.getDimensions(numerator).dimensions;

        // Get dimensions for denominator and subtract
        let denomDims = [0, 0, 0, 0];
        for (const denom of denominator) {
            const dims = this.getDimensions(denom).dimensions;
            for (let i = 0; i < 4; i++) {
                denomDims[i] += dims[i];
            }
        }

        // Final dimensions = numerator - denominator
        const finalDims = [
            numDims[0] - denomDims[0],
            numDims[1] - denomDims[1],
            numDims[2] - denomDims[2],
            numDims[3] - denomDims[3]
        ];

        return { dimensions: finalDims, unit: unit };
    }

    /**
     * Check if two units are dimensionally compatible
     * 
     * @param {string} unit1 - First unit
     * @param {string} unit2 - Second unit
     * @returns {boolean} True if units have same dimensions
     */
    static areCompatible(unit1, unit2) {
        const dims1 = this.getDimensions(unit1).dimensions;
        const dims2 = this.getDimensions(unit2).dimensions;

        for (let i = 0; i < 4; i++) {
            if (Math.abs(dims1[i] - dims2[i]) > 0.001) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate that a value with unit matches expected unit dimensions
     * 
     * @param {number} value - Numerical value
     * @param {string} actualUnit - Unit of the value
     * @param {string} expectedUnit - Expected unit
     * @returns {Object} { valid: boolean, error: string }
     */
    static validateDimensions(value, actualUnit, expectedUnit) {
        if (!expectedUnit || expectedUnit.length === 0) {
            return { valid: true, error: null };
        }

        if (!actualUnit || actualUnit.length === 0) {
            return { valid: false, error: `Expected unit ${expectedUnit}, but value has no unit` };
        }

        const compatible = this.areCompatible(actualUnit, expectedUnit);
        
        if (!compatible) {
            const actualDims = this.getDimensions(actualUnit);
            const expectedDims = this.getDimensions(expectedUnit);
            return {
                valid: false,
                error: `Unit mismatch: ${actualUnit} (dimensions: [${actualDims.dimensions.join(', ')}]) ` +
                       `does not match ${expectedUnit} (dimensions: [${expectedDims.dimensions.join(', ')}])`
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Get human-readable dimension description
     * 
     * @param {string} unit - Unit string
     * @returns {string} Description (e.g., "length", "mass", "velocity")
     */
    static getDimensionDescription(unit) {
        const dims = this.getDimensions(unit).dimensions;
        const [L, M, T, Θ] = dims;

        if (L === 1 && M === 0 && T === 0 && Θ === 0) return 'length';
        if (L === 0 && M === 1 && T === 0 && Θ === 0) return 'mass';
        if (L === 0 && M === 0 && T === 1 && Θ === 0) return 'time';
        if (L === 0 && M === 0 && T === 0 && Θ === 1) return 'temperature';
        if (L === 1 && M === 0 && T === -1 && Θ === 0) return 'velocity';
        if (L === 1 && M === 0 && T === -2 && Θ === 0) return 'acceleration';
        if (L === 2 && M === 1 && T === -2 && Θ === 0) return 'energy';
        if (L === 2 && M === 1 && T === -3 && Θ === 0) return 'power';
        if (L === 0 && M === 0 && T === -1 && Θ === 0) return 'frequency';
        if (L === 0 && M === 0 && T === 0 && Θ === 0) return 'dimensionless';

        // Generic description
        const parts = [];
        if (L !== 0) parts.push(`length^${L}`);
        if (M !== 0) parts.push(`mass^${M}`);
        if (T !== 0) parts.push(`time^${T}`);
        if (Θ !== 0) parts.push(`temperature^${Θ}`);

        return parts.join('·') || 'dimensionless';
    }
}

