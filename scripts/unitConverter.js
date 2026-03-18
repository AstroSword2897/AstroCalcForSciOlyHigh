/**
 * UnitConverter: robust, category-aware unit conversion utility.
 * Handles canonicalization, category validation, temperature offsets, and context-aware conversions.
 * 
 * FIXED: Single source of truth, proper temperature handling, unified conversion system
 */

class UnitConverter {
    // Canonical mapping: all aliases map to one canonical unit
    static canonicalUnits = {
        // Distance
        'm': 'm', 'meters': 'm', 'metre': 'm', 'metres': 'm',
        'km': 'km', 'kilometer': 'km', 'kilometers': 'km', 'kilometre': 'km', 'kilometres': 'km',
        'cm': 'cm', 'centimeter': 'cm', 'centimeters': 'cm', 'centimetre': 'cm', 'centimetres': 'cm',
        'mm': 'mm', 'millimeter': 'mm', 'millimeters': 'mm', 'millimetre': 'mm', 'millimetres': 'mm',
        'μm': 'μm', 'micrometer': 'μm', 'micrometers': 'μm', 'micrometre': 'μm', 'micrometres': 'μm',
        'nm': 'nm', 'nanometer': 'nm', 'nanometers': 'nm', 'nanometre': 'nm', 'nanometres': 'nm',
        'AU': 'AU', 'astronomical unit': 'AU', 'astronomical units': 'AU', 'au': 'AU',
        'pc': 'pc', 'parsec': 'pc', 'parsecs': 'pc',
        'ly': 'ly', 'light-year': 'ly', 'light-years': 'ly', 'lightyear': 'ly', 'lightyears': 'ly',
        
        // Mass
        'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg', 'kilogramme': 'kg', 'kilogrammes': 'kg',
        'g': 'g', 'gram': 'g', 'grams': 'g', 'gramme': 'g', 'grammes': 'g',
        'M☉': 'M☉', 'M_☉': 'M☉', 'M_sun': 'M☉', 'm☉': 'M☉', 'm_☉': 'M☉', 'm_sun': 'M☉', 'Solar Masses': 'M☉',
        'M_earth': 'M_earth', 'M⊕': 'M_earth', 'mearth': 'M_earth', 'm_earth': 'M_earth',
        
        // Time
        's': 's', 'sec': 's', 'secs': 's', 'second': 's', 'seconds': 's',
        'min': 'min', 'minute': 'min', 'minutes': 'min', 'mins': 'min',
        'h': 'h', 'hr': 'h', 'hrs': 'h', 'hour': 'h', 'hours': 'h',
        'day': 'day', 'days': 'day', 'd': 'day',
        'yr': 'yr', 'y': 'yr', 'year': 'yr', 'years': 'yr',
        
        // Temperature
        'K': 'K', 'Kelvin': 'K',
        '°C': '°C', 'C': '°C', 'Celsius': '°C',
        '°F': '°F', 'F': '°F', 'Fahrenheit': '°F',
        
        // Velocity
        'm/s': 'm/s', 'meters per second': 'm/s',
        'km/s': 'km/s', 'kilometers per second': 'km/s',
        'km/h': 'km/h', 'kilometers per hour': 'km/h',
        
        // Energy/Power
        'W': 'W', 'Watts': 'W', 'watt': 'W',
        'J': 'J', 'Joule': 'J', 'Joules': 'J',
        'erg': 'erg', 'ergs': 'erg',
        'eV': 'eV', 'electronvolt': 'eV', 'electron-volt': 'eV', 'electron-volts': 'eV',
        'L☉': 'L☉', 'L_☉': 'L☉', 'L_sun': 'L☉', 'Solar Luminosities': 'L☉',
        'erg/s': 'erg/s', 'ergs per second': 'erg/s',
        
        // Flux
        'W/m²': 'W/m²', 'Watts per square meter': 'W/m²',
        'erg/(s·cm²)': 'erg/(s·cm²)', 'ergs per second per cm²': 'erg/(s·cm²)',
        
        // Frequency
        'Hz': 'Hz', 'Hertz': 'Hz',
        'kHz': 'kHz', 'kilohertz': 'kHz',
        'MHz': 'MHz', 'megahertz': 'MHz',
        'GHz': 'GHz', 'gigahertz': 'GHz',
        
        // Density
        'kg/m³': 'kg/m³', 'kilograms per cubic meter': 'kg/m³',
        'g/cm³': 'g/cm³', 'grams per cubic centimeter': 'g/cm³',
        
        // Angles
        'rad': 'rad', 'radian': 'rad', 'radians': 'rad',
        'deg': 'deg', 'degree': 'deg', 'degrees': 'deg', '°': 'deg'
    };

    // Category for each canonical unit
    static unitCategory = {
        // Distance
        'm': 'distance', 'km': 'distance', 'cm': 'distance', 'mm': 'distance', 
        'μm': 'distance', 'nm': 'distance', 'AU': 'distance', 'pc': 'distance', 'ly': 'distance',
        
        // Mass
        'kg': 'mass', 'g': 'mass', 'M☉': 'mass', 'M_earth': 'mass',
        
        // Time
        's': 'time', 'min': 'time', 'h': 'time', 'day': 'time', 'yr': 'time',
        
        // Temperature
        'K': 'temperature', '°C': 'temperature', '°F': 'temperature',
        
        // Velocity
        'm/s': 'velocity', 'km/s': 'velocity', 'km/h': 'velocity',
        
        // Energy/Power
        'W': 'power', 'J': 'energy', 'erg': 'energy', 'eV': 'energy',
        'L☉': 'power', 'erg/s': 'power',
        
        // Flux
        'W/m²': 'flux', 'erg/(s·cm²)': 'flux',
        
        // Frequency
        'Hz': 'frequency', 'kHz': 'frequency', 'MHz': 'frequency', 'GHz': 'frequency',
        
        // Density
        'kg/m³': 'density', 'g/cm³': 'density',
        
        // Angles
        'rad': 'angle', 'deg': 'angle'
    };

    // Base unit per category
    static baseUnit = {
        'distance': 'm',
        'mass': 'kg',
        'time': 's',
        'temperature': 'K',
        'velocity': 'm/s',
        'power': 'W',
        'energy': 'J',
        'flux': 'W/m²',
        'frequency': 'Hz',
        'density': 'kg/m³',
        'angle': 'rad'
    };

    // Conversion factors to base units (linear) - SINGLE SOURCE OF TRUTH
    static conversionFactors = {
        // Distance to meters
        'km': 1e3,
        'cm': 0.01,
        'mm': 0.001,
        'μm': 1e-6,
        'nm': 1e-9,
        'AU': 1.496e11,
        'pc': 3.085677581e16,
        'ly': 9.461e15,
        
        // Mass to kg
        'g': 0.001,
        'M☉': 1.989e30,
        'M_earth': 5.972e24,
        
        // Time to seconds
        'min': 60,
        'h': 3600,
        'day': 86400,
        'yr': 3.156e7,
        
        // Velocity to m/s
        'km/s': 1000,
        'km/h': 0.277778,
        
        // Energy to Joules (base unit)
        'erg': 1e-7,        // 1 erg = 1e-7 J
        'eV': 1.602176634e-19,  // 1 eV = 1.602176634e-19 J
        
        // Power to Watts
        'L☉': 3.828e26,
        'erg/s': 1e-7,
        
        // Flux to W/m²
        'erg/(s·cm²)': 0.001,
        
        // Frequency to Hz
        'kHz': 1e3,
        'MHz': 1e6,
        'GHz': 1e9,
        
        // Density to kg/m³
        'g/cm³': 1000,
        
        // Angles to radians
        'deg': Math.PI / 180
    };

    /**
     * Get canonical form of unit
     * BACKWARD COMPATIBILITY: Also supports getCanonicalUnit() alias
     */
    static getCanonical(unit) {
        if (!unit) return '';
        const normalized = unit.trim();
        
        // First, try exact match (handles special characters like M☉, °C)
        if (this.canonicalUnits[normalized]) {
            return this.canonicalUnits[normalized];
        }
        
        // For case-insensitive matching, only lowercase if no special characters
        // Special characters: ☉, °, μ, ², ³, /, ·, etc.
        const hasSpecialChars = /[☉°μ²³/·_⊕]/.test(normalized);
        
        if (!hasSpecialChars) {
            const lower = normalized.toLowerCase();
            // Try lowercase match
            if (this.canonicalUnits[lower]) {
                return this.canonicalUnits[lower];
            }
            // Try case-insensitive search
            for (const [alias, canonical] of Object.entries(this.canonicalUnits)) {
                if (alias.toLowerCase() === lower) {
                    return canonical;
                }
            }
        }
        
        // If still not found, return as-is (unknown unit)
        return normalized;
    }
    
    // Backward compatibility alias
    static getCanonicalUnit(unit) {
        return this.getCanonical(unit);
    }

    /**
     * Get category for a unit
     */
    static getUnitCategory(unit) {
        const canonical = this.getCanonical(unit);
        return this.unitCategory[canonical] || null;
    }

    /**
     * Get base unit for a category
     */
    static getBaseUnitForCategory(category) {
        return this.baseUnit[category] || null;
    }

    /**
     * FIXED: Convert value from one unit to another
     * CRITICAL: Prefers direct conversions, handles temperature correctly, avoids broken chaining
     */
    static convert(value, fromUnit, toUnit) {
        if (typeof value !== 'number' || !isFinite(value)) {
            this._logWarn(`convert: Invalid value ${value}, expected finite number`);
            return null;
        }
        
        if (!fromUnit || !toUnit) {
            return value;
        }
        
        const from = this.getCanonical(fromUnit);
        const to = this.getCanonical(toUnit);
        
        if (from === to) return value;

        const catFrom = this.unitCategory[from];
        const catTo = this.unitCategory[to];

        // Must be same category (or compatible)
        if (!catFrom || !catTo || catFrom !== catTo) {
            // Special case: energy and power are related (J and W)
            if ((catFrom === 'energy' && catTo === 'power') || (catFrom === 'power' && catTo === 'energy')) {
                // Allow conversion between energy and power (they're dimensionally related)
                // This is a special case - normally we'd use dimensional analysis
            } else {
                this._logWarn(`Cannot convert ${from} (${catFrom}) to ${to} (${catTo}) - incompatible categories`);
                return null;
            }
        }

        // Temperature special handling (offset-based, cannot use linear chaining)
        if (catFrom === 'temperature') {
            return this._convertTemperature(value, from, to);
        }

        // Linear conversion via base unit
        const base = this.baseUnit[catFrom];
        if (!base) {
            this._logWarn(`No base unit defined for category: ${catFrom}`);
            return null;
        }
        
        // Convert from -> base
        const valueInBase = from === base ? value : value * (this.conversionFactors[from] || 1);
        
        // Convert base -> to
        const factorTo = to === base ? 1 : 1 / (this.conversionFactors[to] || 1);
        
        return valueInBase * factorTo;
    }

    /**
     * Temperature conversion with offsets
     * CRITICAL: All temperature conversions go through Kelvin
     */
    static _convertTemperature(value, from, to) {
        let kelvin;
        
        // Convert to Kelvin first
        if (from === 'K') {
            kelvin = value;
        } else if (from === '°C' || from === '°c') {
            kelvin = value + 273.15;
        } else if (from === '°F' || from === '°f') {
            kelvin = (value + 459.67) * 5/9;
        } else {
            this._logWarn(`Unknown temperature unit: ${from}`);
            return value;
        }

        // Convert from Kelvin to target
        if (to === 'K') {
            return kelvin;
        } else if (to === '°C' || to === '°c') {
            return kelvin - 273.15;
        } else if (to === '°F' || to === '°f') {
            return kelvin * 9/5 - 459.67;
        } else {
            this._logWarn(`Unknown temperature unit: ${to}`);
            return kelvin;
        }
    }

    /**
     * Convert a value from any unit to the base unit
     * BACKWARD COMPATIBILITY: Required by CalculationOrchestrator
     */
    static convertToBase(value, fromUnit, baseUnit) {
        if (typeof value !== 'number' || !isFinite(value)) {
            this._logWarn(`convertToBase: Invalid value ${value}`);
            return value;
        }
        
        if (!fromUnit || !baseUnit) {
            return value;
        }
        
        const canonicalFrom = this.getCanonical(fromUnit);
        const canonicalBase = this.getCanonical(baseUnit);
        
        // CRITICAL: Sanity check - units should NOT be collapsed
        if (canonicalFrom === canonicalBase && value !== 0 && fromUnit !== baseUnit) {
            console.error(`[UnitConverter] ❌ UNITS COLLAPSED! Likely canonicalization bug:`, {
                fromUnit,
                baseUnit,
                canonicalFrom,
                canonicalBase,
                value
            });
        }
        
        // If already in base unit, return as-is
        if (canonicalFrom === canonicalBase) {
            return value;
        }

        // Get categories
        const catFrom = this.getUnitCategory(canonicalFrom);
        const catBase = this.getUnitCategory(canonicalBase);
        
        // Temperature requires special handling
        if (catFrom === 'temperature' || catBase === 'temperature') {
            return this._convertTemperature(value, canonicalFrom, canonicalBase);
        }
        
        // Must be same category
        if (!catFrom || !catBase || catFrom !== catBase) {
            this._logWarn(`convertToBase: Incompatible categories: ${catFrom} → ${catBase}`);
            return value;
        }
        
        // Linear conversion
        // Check if fromUnit is the base unit (shouldn't happen, but handle it)
        if (canonicalFrom === this.baseUnit[catFrom]) {
            // We're converting FROM the base unit TO the base unit? This shouldn't happen
            // But if it does, return as-is
            this._logWarn(`convertToBase: fromUnit ${fromUnit} is already the base unit for category ${catFrom}`);
            return value;
        }
        
        const factor = this.conversionFactors[canonicalFrom];
        if (factor === undefined) {
            this._logWarn(`No conversion factor found for ${canonicalFrom} → ${canonicalBase}. Available factors: ${Object.keys(this.conversionFactors).join(', ')}`);
            return value;
        }
        
        // Factor represents: 1 canonicalFrom = factor * baseUnit
        // So to convert value * canonicalFrom to baseUnit: value * factor
        const convertedValue = value * factor;
        console.log(`[UnitConverter] ✅ convertToBase: ${value} ${fromUnit} (${canonicalFrom}) → ${convertedValue} ${baseUnit} (factor: ${factor})`);
        return convertedValue;
    }

    /**
     * Get alternative units for a given base unit
     * BACKWARD COMPATIBILITY: Required by UI components
     */
    static getAlternativeUnits(baseUnit) {
        const canonical = this.getCanonical(baseUnit);
        const category = this.unitCategory[canonical];
        
        if (!category) {
            return [canonical];
        }
        
        // Get all units in the same category
        const alternatives = Object.entries(this.unitCategory)
            .filter(([unit, cat]) => cat === category)
            .map(([unit]) => unit);
        
        // Ensure canonical unit is first
        const result = [canonical, ...alternatives.filter(u => u !== canonical)];
        return [...new Set(result)];
    }

    /**
     * Convert and format a value with its unit
     * BACKWARD COMPATIBILITY: Required by some UI components
     * Automatically selects the best unit for display based on the value's magnitude
     */
    static convertAndFormat(value, unit, options = {}) {
        const canonical = this.getCanonical(unit);
        const category = this.getUnitCategory(canonical);
        
        if (!category) {
            return { value: value, unit: canonical };
        }
        
        // Get all alternative units
        const alternatives = this.getAlternativeUnits(canonical);
        
        // Find the best unit for display (closest to 1-1000 range)
        let bestUnit = canonical;
        let bestValue = value;
        
        for (const altUnit of alternatives) {
            if (altUnit === canonical) continue;
            
            const converted = this.convert(value, canonical, altUnit);
            if (converted !== null && isFinite(converted)) {
                const absConverted = Math.abs(converted);
                const absBest = Math.abs(bestValue);
                
                // Prefer values in 0.1 to 1000 range
                if (absConverted >= 0.1 && absConverted <= 1000) {
                    if (absBest < 0.1 || absBest > 1000 || 
                        (absConverted >= 0.1 && absConverted < absBest)) {
                        bestUnit = altUnit;
                        bestValue = converted;
                    }
                }
            }
        }
        
        return {
            value: bestValue,
            unit: bestUnit,
            original: { value: value, unit: unit }
        };
    }

    /**
     * Format unit nicely
     */
    static formatUnit(unit) {
        const canonical = this.getCanonical(unit);
        const names = {
            // Distance
            'm': 'meters', 'km': 'kilometers', 'cm': 'centimeters', 'mm': 'millimeters',
            'μm': 'micrometers', 'nm': 'nanometers',
            'AU': 'Astronomical Units', 'pc': 'parsecs', 'ly': 'light-years',
            
            // Mass
            'kg': 'kilograms', 'g': 'grams', 'M☉': 'Solar Masses', 'M_earth': 'Earth Masses',
            
            // Time
            's': 'seconds', 'min': 'minutes', 'h': 'hours', 'day': 'days', 'yr': 'years',
            
            // Temperature
            'K': 'Kelvin', '°C': 'Celsius', '°F': 'Fahrenheit',
            
            // Velocity
            'm/s': 'meters per second', 'km/s': 'kilometers per second', 'km/h': 'kilometers per hour',
            
            // Energy/Power
            'W': 'Watts', 'J': 'Joules', 'erg': 'ergs', 'eV': 'electron-volts',
            'L☉': 'Solar Luminosities', 'erg/s': 'ergs per second',
            
            // Flux
            'W/m²': 'Watts per square meter', 'erg/(s·cm²)': 'ergs per second per cm²',
            
            // Frequency
            'Hz': 'Hertz', 'kHz': 'kilohertz', 'MHz': 'megahertz', 'GHz': 'gigahertz',
            
            // Density
            'kg/m³': 'kg/m³', 'g/cm³': 'g/cm³',
            
            // Angles
            'rad': 'radians', 'deg': 'degrees'
        };
        
        return names[canonical] || canonical;
    }

    /**
     * List units by category
     * BACKWARD COMPATIBILITY: May be used by some components
     */
    static listUnitsByCategory(category = null) {
        if (!category) {
            const categoryMap = {};
            for (const [unit, cat] of Object.entries(this.unitCategory)) {
                if (!categoryMap[cat]) {
                    categoryMap[cat] = [];
                }
                categoryMap[cat].push(unit);
            }
            return categoryMap;
        }
        
        return Object.entries(this.unitCategory)
            .filter(([unit, cat]) => cat === category)
            .map(([unit]) => unit);
    }

    /**
     * Get conversions for a unit (for display/formatting)
     * BACKWARD COMPATIBILITY: May be used by some components
     * DERIVED from conversionFactors (single source of truth)
     */
    static getConversions(unit, context = undefined) {
        const canonical = this.getCanonical(unit);
        const category = this.getUnitCategory(canonical);
        
        if (!category) {
            return null;
        }
        
        const base = this.baseUnit[category];
        const alternatives = this.getAlternativeUnits(canonical);
        
        // Generate conversion list from conversionFactors
        const conversions = [];
        for (const altUnit of alternatives) {
            if (altUnit === canonical) continue;
            
            // Calculate factor: canonical -> altUnit
            const factor = this.convert(1, canonical, altUnit);
            if (factor !== null && isFinite(factor)) {
                conversions.push({
                    unit: altUnit,
                    factor: factor,
                    minValue: 0.001,
                    maxValue: 1e15
                });
            }
        }
        
        return conversions.length > 0 ? conversions : null;
    }

    /**
     * Format number with Desmos-like precision (high precision, no spurious digits).
     * Uses up to 15 significant figures; scientific notation for |x| outside [1e-6, 1e10].
     * Strips trailing zeros after the decimal.
     */
    static formatNumber(value, options = {}) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            return String(value);
        }
        const sigFigs = options.significantFigures != null ? options.significantFigures : 15;
        if (value === 0) return '0';
        const abs = Math.abs(value);
        // Scientific for very large or very small
        if (abs >= 1e10 || (abs < 1e-6 && abs > 0)) {
            const exp = value.toExponential(sigFigs - 1);
            return exp.replace(/(\.\d*?)0+e/, '$1e');
        }
        // Decimal form: enough digits for sigFigs, then strip trailing zeros
        const magnitude = Math.floor(Math.log10(abs)) + 1;
        const decimals = Math.max(0, sigFigs - magnitude);
        let s = value.toFixed(decimals);
        if (s.indexOf('.') !== -1) s = s.replace(/\.?0+$/, '');
        return s;
    }

    /**
     * Unified logging method
     */
    static _logWarn(message) {
        if (typeof logger !== 'undefined' && logger.warn) {
            logger.warn(message);
        } else {
            console.warn(`[UnitConverter] ${message}`);
        }
    }
}
