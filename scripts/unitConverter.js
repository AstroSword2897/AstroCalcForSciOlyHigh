/**
 * Unit Conversion Utilities
 * 
 * Provides unit conversion functionality for astronomical calculations.
 * Handles conversions between different unit systems (SI, astronomical units, etc.)
 * and automatically selects the most appropriate unit for display.
 * 
 * Supported conversions:
 * - Distance: m, km, AU, pc, ly, etc.
 * - Mass: kg, M☉ (solar masses), etc.
 * - Time: s, min, hr, day, yr, etc.
 * - Temperature: K, °C, °F (with offset handling)
 * - Energy: J, erg, eV, etc.
 * - And many more...
 */

/**
 * UnitConverter Class
 * 
 * Static utility class for unit conversions. All methods are static.
 * 
 * CLEANUP: Uses canonical units - single "true" representation for each unit.
 * Aliases are supported for input parsing but normalized to canonical form.
 */
class UnitConverter {
    /**
     * Canonical unit mapping - maps all aliases to their canonical form
     * Aliases are used for parsing but never appear in output lists
     */
    static canonicalUnits = {
        // Distance
        'm': 'm',
        'meters': 'm',
        'km': 'km',
        'AU': 'AU',
        'pc': 'pc',
        'parsecs': 'pc',
        'ly': 'ly',
        'light-years': 'ly',
        
        // Mass
        'kg': 'kg',
        'kilograms': 'kg',
        'g': 'g',
        'grams': 'g',
        'M☉': 'M☉',
        'M_☉': 'M☉',
        'M_sun': 'M☉',
        'm☉': 'M☉',
        'm_☉': 'M☉',
        'm_sun': 'M☉',
        'Solar Masses': 'M☉',
        'M_earth': 'M_earth',
        
        // Time
        's': 's',
        'seconds': 's',
        'min': 'min',
        'minutes': 'min',
        'h': 'h',
        'hours': 'h',
        'day': 'day',
        'days': 'day',
        'yr': 'yr',
        'years': 'yr',
        'y': 'yr',
        
        // Velocity
        'm/s': 'm/s',
        'meters per second': 'm/s',
        'km/s': 'km/s',
        'km/h': 'km/h',
        
        // Luminosity / Power
        'W': 'W',
        'Watts': 'W',
        'L☉': 'L☉',
        'L_☉': 'L☉',
        'L_sun': 'L☉',
        'Solar Luminosities': 'L☉',
        'erg/s': 'erg/s',
        
        // Flux
        'W/m²': 'W/m²',
        'Watts per square meter': 'W/m²',
        'erg/(s·cm²)': 'erg/(s·cm²)',
        
        // Temperature
        'K': 'K',
        'Kelvin': 'K',
        '°C': '°C',
        'Celsius': '°C',
        'C': '°C',
        '°F': '°F',
        'Fahrenheit': '°F',
        'F': '°F',
        
        // Wavelength
        'nm': 'nm',
        'nanometers': 'nm',
        'μm': 'μm',
        'micrometers': 'μm',
        'mm': 'mm',
        'millimeters': 'mm',
        'cm': 'cm',
        'centimeters': 'cm',
        
        // Frequency
        'Hz': 'Hz',
        'Hertz': 'Hz',
        'kHz': 'kHz',
        'MHz': 'MHz',
        'GHz': 'GHz',
        
        // Density
        'kg/m³': 'kg/m³',
        'kilograms per cubic meter': 'kg/m³',
        'g/cm³': 'g/cm³',
        
        // Angles
        'rad': 'rad',
        'radians': 'rad',
        'deg': 'deg',
        'degrees': 'deg',
        '°': 'deg'
    };
    
    /**
     * Get canonical form of a unit
     * @param {string} unit - Unit string (can be alias or canonical)
     * @returns {string} Canonical unit form
     */
    static getCanonicalUnit(unit) {
        if (!unit) return unit;
        // ENHANCED: Strip symbols and normalize before lookup
        const normalized = unit.trim().replace(/°/g, '°'); // Preserve degree symbol
        // Try exact match first
        if (this.canonicalUnits[normalized]) {
            return this.canonicalUnits[normalized];
        }
        // Try case-insensitive match
        const lower = normalized.toLowerCase();
        for (const [alias, canonical] of Object.entries(this.canonicalUnits)) {
            if (alias.toLowerCase() === lower) {
                return canonical;
            }
        }
        // Return as-is if not found (might be a valid unit we don't have mapped)
        return unit;
    }
    
    /**
     * ENHANCED: Unit category mapping for validation and base unit determination
     * Maps each canonical unit to its category (distance, mass, time, etc.)
     */
    static unitCategory = {
        // Distance
        'm': 'distance', 'km': 'distance', 'AU': 'distance', 'pc': 'distance', 'ly': 'distance',
        'cm': 'distance', 'mm': 'distance', 'μm': 'distance', 'nm': 'distance',
        
        // Mass
        'kg': 'mass', 'g': 'mass', 'M☉': 'mass', 'M_earth': 'mass',
        
        // Time
        's': 'time', 'min': 'time', 'h': 'time', 'day': 'time', 'yr': 'time',
        
        // Velocity
        'm/s': 'velocity', 'km/s': 'velocity', 'km/h': 'velocity',
        
        // Temperature
        'K': 'temperature', '°C': 'temperature', '°F': 'temperature',
        
        // Energy/Power
        'W': 'power', 'L☉': 'power', 'erg/s': 'power',
        
        // Flux
        'W/m²': 'flux', 'erg/(s·cm²)': 'flux',
        
        // Frequency
        'Hz': 'frequency', 'kHz': 'frequency', 'MHz': 'frequency', 'GHz': 'frequency',
        
        // Density
        'kg/m³': 'density', 'g/cm³': 'density',
        
        // Angles
        'rad': 'angle', 'deg': 'angle',
        
        // Wavelength (special case - same as distance but different context)
        // Note: 'm', 'nm', 'μm', 'mm', 'cm' can be wavelength when context is 'wavelength'
    };
    
    /**
     * ENHANCED: Base unit for each category
     * Used for consistent conversion via base units
     */
    static categoryBaseUnit = {
        'distance': 'm',
        'mass': 'kg',
        'time': 's',
        'velocity': 'm/s',
        'temperature': 'K',
        'power': 'W',
        'flux': 'W/m²',
        'frequency': 'Hz',
        'density': 'kg/m³',
        'angle': 'rad'
    };
    
    /**
     * Get category for a unit
     * @param {string} unit - Canonical unit
     * @returns {string|null} Category name or null if unknown
     */
    static getUnitCategory(unit) {
        const canonical = this.getCanonicalUnit(unit);
        return this.unitCategory[canonical] || null;
    }
    
    /**
     * ENHANCED: Get base unit for a category
     * @param {string} category - Category name
     * @returns {string|null} Base unit or null if unknown
     */
    static getBaseUnitForCategory(category) {
        return this.categoryBaseUnit[category] || null;
    }
    
    /**
     * ENHANCED: List units by category
     * @param {string} category - Category name (optional, returns all if not provided)
     * @returns {Object} Map of category to array of units, or array of units for specific category
     */
    static listUnitsByCategory(category = null) {
        const categoryMap = {};
        
        // Build category map
        for (const [unit, cat] of Object.entries(this.unitCategory)) {
            if (!categoryMap[cat]) {
                categoryMap[cat] = [];
            }
            categoryMap[cat].push(unit);
        }
        
        if (category) {
            return categoryMap[category] || [];
        }
        
        return categoryMap;
    }
    /**
     * Convert and format a value with its unit
     * 
     * Automatically selects the best unit for display based on the value's magnitude.
     * For example, a very large distance will be converted to parsecs or light-years
     * instead of meters.
     * 
     * @param {number} value - The numerical value to convert
     * @param {string} unit - The current unit of the value (e.g., "m", "kg", "s")
     * @param {Object} options - Optional configuration
     * @param {string} options.context - Context hint: 'distance', 'wavelength', or undefined (auto-detect)
     * @param {number} options.precision - Precision for formatting (default: auto)
     * @returns {Object} Object with:
     *                   - value: converted numerical value
     *                   - unit: new unit string
     *                   - factor: conversion factor used (if conversion occurred)
     *                   - original: original value and unit (if conversion occurred)
     * 
     * @example
     * UnitConverter.convertAndFormat(1.496e11, "m")
     * // Returns: { value: 1, unit: "AU", factor: 1.496e11, original: { value: 1.496e11, unit: "m" } }
     * 
     * UnitConverter.convertAndFormat(5e-7, "m", { context: 'wavelength' })
     * // Returns: { value: 500, unit: "nm", factor: 1e9, original: { value: 5e-7, unit: "m" } }
     * 
     * UnitConverter.convertAndFormat(100, "°C", { precision: 2 })
     * // Returns: { value: 373.15, unit: "K", factor: 1, offset: -273.15, ... }
     */
    static convertAndFormat(value, unit, options = {}) {
        // CLEANUP: Normalize unit to canonical form
        const canonicalUnit = this.getCanonicalUnit(unit);
        const context = options.context || this._detectContext(value, canonicalUnit);
        const conversions = this.getConversions(canonicalUnit, context);
        if (!conversions || conversions.length === 0) {
            return { value: value, unit: canonicalUnit };
        }

        // Find the best conversion (most appropriate unit)
        let bestConversion = null;

        for (const conv of conversions) {
            let convertedValue = value * conv.factor;
            // Handle offset for temperature conversions
            if (conv.offset !== undefined) {
                convertedValue = convertedValue + conv.offset;
            }
            // Use conversion if value is in a reasonable range
            if (convertedValue >= conv.minValue && convertedValue <= conv.maxValue) {
                bestConversion = {
                    value: convertedValue,
                    unit: conv.unit,
                    factor: conv.factor,
                    original: { value: value, unit: unit }
                };
                break;
            }
        }

        // If no conversion found, try the first one if value is very large/small
        if (!bestConversion && conversions.length > 0) {
            const firstConv = conversions[0];
            let convertedValue = value * firstConv.factor;
            if (firstConv.offset !== undefined) {
                convertedValue = convertedValue + firstConv.offset;
            }
            if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
                bestConversion = {
                    value: convertedValue,
                    unit: firstConv.unit,
                    factor: firstConv.factor,
                    original: { value: value, unit: unit }
                };
            }
        }

        return bestConversion || { value: value, unit: canonicalUnit };
    }

    /**
     * FIXED: Detect context for 'm' unit (distance vs wavelength)
     * Uses value magnitude to determine if it's likely a wavelength
     */
    static _detectContext(value, unit) {
        if (unit !== 'm') return undefined;
        
        const absValue = Math.abs(value);
        // Wavelengths are typically in the range 1e-9 to 1e-3 meters
        if (absValue >= 1e-9 && absValue <= 1e-3) {
            return 'wavelength';
        }
        // Large values are likely distances
        if (absValue >= 1) {
            return 'distance';
        }
        return undefined; // Ambiguous, default to distance
    }
    
    // Get available conversions for a unit
    // FIXED: Handles context-aware conversions for 'm' (distance vs wavelength)
    // CLEANUP: Normalizes unit to canonical form first
    static getConversions(unit, context = undefined) {
        // Normalize to canonical form
        const canonical = this.getCanonicalUnit(unit);
        
        // FIXED: Separate conversion maps for distance and wavelength contexts
        const distanceConversions = {
            // Distance (large scale)
            'm': [
                { unit: 'km', factor: 1e-3, minValue: 1, maxValue: 1e12 },
                { unit: 'AU', factor: 6.68459e-12, minValue: 1e8, maxValue: 1e15 },
                { unit: 'ly', factor: 1.057e-16, minValue: 1e15, maxValue: 1e20 },
                { unit: 'pc', factor: 3.24078e-17, minValue: 1e15, maxValue: 1e20 }
            ]
        };
        
        const wavelengthConversions = {
            // Wavelength (small scale)
            'm': [
                { unit: 'nm', factor: 1e9, minValue: 1e-9, maxValue: 1e-6 },
                { unit: 'μm', factor: 1e6, minValue: 1e-6, maxValue: 1e-3 },
                { unit: 'mm', factor: 1000, minValue: 1e-3, maxValue: 1 },
                { unit: 'cm', factor: 100, minValue: 1e-2, maxValue: 1 }
            ]
        };
        
        const conversionMap = {
            // Angles
            'rad': [
                { unit: 'deg', factor: 180 / Math.PI, minValue: 0, maxValue: 2 * Math.PI }
            ],
            'deg': [
                { unit: 'rad', factor: Math.PI / 180, minValue: 0, maxValue: 360 }
            ],
            
            // Distance (default for 'm' when context is 'distance' or undefined)
            ...distanceConversions,
            
            'pc': [
                { unit: 'ly', factor: 3.26156, minValue: 0.1, maxValue: 1e6 },
                { unit: 'AU', factor: 206265, minValue: 0.001, maxValue: 1000 }
            ],
            'AU': [
                { unit: 'km', factor: 1.496e8, minValue: 0.001, maxValue: 1000 }
            ],

            // Time
            's': [
                { unit: 'min', factor: 1/60, minValue: 60, maxValue: 3600 },
                { unit: 'h', factor: 1/3600, minValue: 3600, maxValue: 86400 },
                { unit: 'day', factor: 1/86400, minValue: 86400, maxValue: 31536000 },
                { unit: 'yr', factor: 3.17098e-8, minValue: 31536000, maxValue: 1e15 }
            ],

            // Mass
            'kg': [
                { unit: 'M☉', factor: 5.02785e-31, minValue: 1e29, maxValue: 1e32 },
                { unit: 'M_earth', factor: 1.67443e-25, minValue: 1e23, maxValue: 1e26 },
                { unit: 'g', factor: 1000, minValue: 0.001, maxValue: 1 }
            ],

            // Velocity
            'm/s': [
                { unit: 'km/s', factor: 1e-3, minValue: 1000, maxValue: 1e8 },
                { unit: 'km/h', factor: 3.6, minValue: 0.1, maxValue: 1000 }
            ],

            // Energy/Flux
            'W/m²': [
                { unit: 'erg/(s·cm²)', factor: 1000, minValue: 0.001, maxValue: 1 }
            ],
            'W': [
                { unit: 'L☉', factor: 2.612e-27, minValue: 1e25, maxValue: 1e28 },
                { unit: 'erg/s', factor: 1e7, minValue: 0.001, maxValue: 1 }
            ],

            // Temperature
            'K': [
                { unit: '°C', factor: 1, offset: -273.15, minValue: 0, maxValue: 1e6 },
                { unit: '°F', factor: 9/5, offset: -459.67, minValue: 0, maxValue: 1e6 }
            ],
            '°C': [
                { unit: 'K', factor: 1, offset: 273.15, minValue: -273.15, maxValue: 1e6 },
                { unit: '°F', factor: 9/5, offset: 32, minValue: -273.15, maxValue: 1e6 }
            ],
            '°F': [
                { unit: 'K', factor: 5/9, offset: 255.372, minValue: -459.67, maxValue: 1e6 },
                { unit: '°C', factor: 5/9, offset: -160/9, minValue: -459.67, maxValue: 1e6 }
            ],

            // Frequency
            'Hz': [
                { unit: 'kHz', factor: 1e-3, minValue: 1000, maxValue: 1e6 },
                { unit: 'MHz', factor: 1e-6, minValue: 1e6, maxValue: 1e9 },
                { unit: 'GHz', factor: 1e-9, minValue: 1e9, maxValue: 1e12 }
            ],

            // Density
            'kg/m³': [
                { unit: 'g/cm³', factor: 1e-3, minValue: 0.001, maxValue: 10000 }
            ],

            // Pressure gradient
            'Pa/m': [
                { unit: 'atm/m', factor: 9.86923e-6, minValue: 1e5, maxValue: 1e10 }
            ]
        };

        // FIXED: Handle context-aware 'm' conversions
        if (canonical === 'm') {
            if (context === 'wavelength') {
                return wavelengthConversions['m'];
            }
            // Default to distance conversions
            return distanceConversions['m'];
        }

        // CLEANUP: Use canonical unit for lookup
        // Try exact match with canonical unit first
        if (conversionMap[canonical]) {
            return conversionMap[canonical];
        }
        
        // Fallback: try normalized lowercase
        const normalizedUnit = canonical.toLowerCase().replace(/\s+/g, '').replace(/·/g, '');
        if (conversionMap[normalizedUnit]) {
            return conversionMap[normalizedUnit];
        }

        // Try partial matches as last resort
        for (const [key, value] of Object.entries(conversionMap)) {
            if (normalizedUnit.includes(key) || key.includes(normalizedUnit)) {
                return value;
            }
        }

        return null;
    }

    // Format a number with appropriate precision
    // ENHANCED: Configurable thresholds for scientific notation
    static formatNumber(value, options = {}) {
        if (value === 0) return '0';
        
        const absValue = Math.abs(value);
        
        // ENHANCED: Configurable thresholds
        const largeThreshold = options.largeThreshold || 1e6;
        const smallThreshold = options.smallThreshold || 1e-3;
        const precision = options.precision || 4;
        
        // Use scientific notation for very large or very small numbers
        if (absValue >= largeThreshold || (absValue < smallThreshold && absValue > 0)) {
            return value.toExponential(precision);
        }
        
        // Determine appropriate decimal places
        if (absValue >= 1000) {
            return value.toFixed(2);
        } else if (absValue >= 1) {
            return value.toFixed(4);
        } else {
            return value.toFixed(6);
        }
    }

    // Get full unit name with proper formatting
    static formatUnit(unit) {
        // CLEANUP: First normalize to canonical form
        const canonical = this.getCanonicalUnit(unit);
        
        const unitMap = {
            // Distance
            'm': 'meters',
            'km': 'kilometers',
            'AU': 'Astronomical Units',
            'pc': 'parsecs',
            'ly': 'light-years',
            
            // Mass
            'kg': 'kilograms',
            'g': 'grams',
            'M☉': 'Solar Masses',
            'M_earth': 'Earth Masses',
            
            // Time
            's': 'seconds',
            'min': 'minutes',
            'h': 'hours',
            'day': 'days',
            'yr': 'years',
            
            // Velocity
            'm/s': 'meters per second',
            'km/s': 'kilometers per second',
            'km/h': 'kilometers per hour',
            
            // Luminosity / Power
            'W': 'Watts',
            'L☉': 'Solar Luminosities',
            'erg/s': 'ergs per second',
            
            // Flux
            'W/m²': 'Watts per square meter',
            'erg/(s·cm²)': 'ergs per second per square centimeter',
            
            // Temperature
            'K': 'Kelvin',
            '°C': 'Celsius',
            '°F': 'Fahrenheit',
            
            // Wavelength
            'nm': 'nanometers',
            'μm': 'micrometers',
            'mm': 'millimeters',
            'cm': 'centimeters',
            
            // Frequency
            'Hz': 'Hertz',
            'kHz': 'kilohertz',
            'MHz': 'megahertz',
            'GHz': 'gigahertz',
            
            // Density
            'kg/m³': 'kilograms per cubic meter',
            'g/cm³': 'grams per cubic centimeter',
            
            // Angles
            'rad': 'radians',
            'deg': 'degrees',
            
            // Other
            'J': 'Joules',
            'Pa': 'Pascals',
            'magnitude': 'magnitude',
            'mag': 'magnitude',
            'dimensionless': 'dimensionless',
            'arcseconds': 'arcseconds',
            'arcsec': 'arcseconds',
            'Gauss': 'Gauss',
            'Tesla': 'Tesla',
            'G': 'Gauss',
            'T': 'Tesla'
        };

        return unitMap[canonical] || canonical;
    }

    // Get alternative units for a given base unit
    // CLEANUP: Returns only canonical units, no aliases
    static getAlternativeUnits(baseUnit) {
        // First, normalize to canonical form
        const canonical = this.getCanonicalUnit(baseUnit);
        
        const alternativesMap = {
            // Distance
            'm': ['m', 'km', 'AU', 'pc', 'ly'],
            'km': ['m', 'km', 'AU', 'pc', 'ly'],
            'AU': ['m', 'km', 'AU', 'pc', 'ly'],
            'pc': ['m', 'km', 'AU', 'pc', 'ly'],
            'ly': ['m', 'km', 'AU', 'pc', 'ly'],
            
            // Mass
            'kg': ['kg', 'g', 'M☉', 'M_earth'],
            'g': ['g', 'kg', 'M☉', 'M_earth'],
            'M☉': ['M☉', 'kg', 'M_earth'],
            'M_earth': ['M_earth', 'kg', 'M☉'],
            
            // Time
            's': ['s', 'min', 'h', 'day', 'yr'],
            'min': ['s', 'min', 'h', 'day', 'yr'],
            'h': ['s', 'min', 'h', 'day', 'yr'],
            'day': ['s', 'min', 'h', 'day', 'yr'],
            'yr': ['s', 'min', 'h', 'day', 'yr'],
            
            // Velocity
            'm/s': ['m/s', 'km/s', 'km/h'],
            'km/s': ['m/s', 'km/s', 'km/h'],
            'km/h': ['m/s', 'km/s', 'km/h'],
            
            // Luminosity / Power
            'W': ['W', 'L☉', 'erg/s'],
            'L☉': ['L☉', 'W', 'erg/s'],
            'erg/s': ['erg/s', 'W', 'L☉'],
            
            // Flux
            'W/m²': ['W/m²', 'erg/(s·cm²)'],
            'erg/(s·cm²)': ['erg/(s·cm²)', 'W/m²'],
            
            // Temperature
            'K': ['K', '°C', '°F'],
            '°C': ['°C', 'K', '°F'],
            '°F': ['°F', 'K', '°C'],
            
            // Wavelength
            'nm': ['nm', 'μm', 'mm', 'cm'],
            'μm': ['nm', 'μm', 'mm', 'cm'],
            'mm': ['nm', 'μm', 'mm', 'cm'],
            'cm': ['nm', 'μm', 'mm', 'cm'],
            
            // Frequency
            'Hz': ['Hz', 'kHz', 'MHz', 'GHz'],
            'kHz': ['Hz', 'kHz', 'MHz', 'GHz'],
            'MHz': ['Hz', 'kHz', 'MHz', 'GHz'],
            'GHz': ['Hz', 'kHz', 'MHz', 'GHz'],
            
            // Density
            'kg/m³': ['kg/m³', 'g/cm³'],
            'g/cm³': ['kg/m³', 'g/cm³'],
            
            // Angles
            'rad': ['rad', 'deg'],
            'deg': ['rad', 'deg']
        };
        
        // Get alternatives for canonical unit
        let alternatives = alternativesMap[canonical];
        
        // ENHANCED: Context-aware unit selection for distance vs wavelength
        // If baseUnit is 'm' or 'meters' and context suggests wavelength, use small units
        // This is handled in UI layer, but we can provide both sets here
        // For now, default to distance units for 'm'
        if (canonical === 'm' && !alternatives) {
            // Default to distance units (large scale)
            alternatives = ['m', 'km', 'AU', 'pc', 'ly'];
        }
        
        // If no alternatives found, return just the canonical unit
        if (!alternatives) {
            return [canonical];
        }
        
        // Return unique list with canonical unit first, then alternatives
        // Remove duplicates and ensure canonical is first
        const allUnits = [canonical, ...alternatives.filter(u => u !== canonical)];
        return [...new Set(allUnits)];
    }

    // Convert a value from any unit to the base unit
    static convertToBase(value, fromUnit, baseUnit) {
        // Input validation
        if (typeof value !== 'number' || !isFinite(value)) {
            this._logWarn(`convertToBase: Invalid value ${value}`);
            return value; // Return as-is for invalid values
        }
        if (!fromUnit || !baseUnit) {
            return value;
        }
        
        // CLEANUP: Normalize both units to canonical form
        const canonicalFrom = this.getCanonicalUnit(fromUnit);
        const canonicalBase = this.getCanonicalUnit(baseUnit);
        
        // If already in base unit (canonical forms match), return as is
        if (canonicalFrom === canonicalBase) {
            return value;
        }

        // Conversion factors to base units
        // CLEANUP: Uses canonical units only
        const conversionFactors = {
            // Distance to meters
            'km': 1000,
            'AU': 1.496e11,
            'pc': 3.086e16,
            'ly': 9.461e15,
            'cm': 0.01,
            'mm': 0.001,
            'μm': 1e-6,
            'nm': 1e-9,
            
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
            
            // Luminosity to W
            'L☉': 3.828e26,
            'erg/s': 1e-7,
            
            // Flux to W/m²
            'erg/(s·cm²)': 0.001,
            
            // Temperature to Kelvin
            '°C': 1,  // Add 273.15 offset
            '°F': 5/9,  // Add 459.67 offset, then multiply by 5/9
            
            // Frequency to Hz
            'kHz': 1000,
            'MHz': 1e6,
            'GHz': 1e9,
            
            // Density to kg/m³
            'g/cm³': 1000,
            
            // Angles to radians
            'deg': Math.PI / 180
        };

        // CLEANUP: Use canonical unit for conversion lookup
        const normalizedFrom = canonicalFrom.toLowerCase().trim();
        let factor = conversionFactors[normalizedFrom] || conversionFactors[canonicalFrom];
        
        // ENHANCED: Handle temperature conversion with explicit offset
        // Temperature conversions use offset, not just factor
        if ((canonicalFrom === '°C' || normalizedFrom === '°c') && 
            (canonicalBase === 'K' || canonicalBase.toLowerCase() === 'k')) {
            // Celsius to Kelvin: K = °C + 273.15
            return value + 273.15;
        }
        
        // Handle reverse temperature conversion (Kelvin to Celsius)
        if ((canonicalFrom === 'K' || canonicalFrom.toLowerCase() === 'k') && 
            (canonicalBase === '°C' || canonicalBase === '°c')) {
            // Kelvin to Celsius: °C = K - 273.15
            return value - 273.15;
        }
        
        // If no factor found, try reverse lookup
        if (factor === undefined) {
            // Try to find reverse conversion
            const reverseConversions = {
                'm': { 'km': 0.001, 'AU': 6.68459e-12, 'pc': 3.24078e-17 },
                'kg': { 'g': 1000, 'M☉': 5.02785e-31, 'M_earth': 1.67443e-25 },
                's': { 'min': 1/60, 'h': 1/3600, 'day': 1/86400, 'yr': 3.17098e-8 }
            };
            
            const baseNorm = canonicalBase.toLowerCase();
            if (reverseConversions[baseNorm] && reverseConversions[baseNorm][normalizedFrom]) {
                factor = 1 / reverseConversions[baseNorm][normalizedFrom];
            }
        }
        
        if (factor === undefined) {
            this._logWarn(`No conversion factor found from ${fromUnit} (${canonicalFrom}) to ${baseUnit} (${canonicalBase}), using value as-is`);
            return value;
        }
        
        return value * factor;
    }

    /**
     * ENHANCED: Convert a value from one unit to another
     * OPTIMIZED: Uses category-aware base unit conversion for robustness
     * 
     * @param {number} value - Value to convert
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @returns {number|null} Converted value, or null if conversion not possible
     * 
     * @example
     * UnitConverter.convert(50, 'km', 'm') // Returns: 50000
     * UnitConverter.convert(1, 'AU', 'pc') // Returns: 4.848e-6
     * UnitConverter.convert(100, '°C', 'K') // Returns: 373.15
     * UnitConverter.convert(212, '°F', '°C') // Returns: 100
     */
    static convert(value, fromUnit, toUnit) {
        // Input validation
        if (typeof value !== 'number' || !isFinite(value)) {
            this._logWarn(`convert: Invalid value ${value}, expected finite number`);
            return null;
        }
        
        if (!fromUnit || !toUnit) {
            return value;
        }
        
        // CLEANUP: Normalize to canonical units
        const canonicalFrom = this.getCanonicalUnit(fromUnit);
        const canonicalTo = this.getCanonicalUnit(toUnit);
        
        // If units are the same (canonical forms match), return as-is
        if (canonicalFrom === canonicalTo) {
            return value;
        }

        // ENHANCED: Category-aware validation
        const categoryFrom = this.getUnitCategory(canonicalFrom);
        const categoryTo = this.getUnitCategory(canonicalTo);
        
        // Check if units are in same category (required for conversion)
        if (categoryFrom && categoryTo && categoryFrom !== categoryTo) {
            // Special case: distance and wavelength share the same units but different context
            if (!((categoryFrom === 'distance' && categoryTo === 'distance') || 
                  (canonicalFrom === 'm' && canonicalTo === 'm'))) {
                this._logWarn(`Cannot convert ${canonicalFrom} (${categoryFrom}) to ${canonicalTo} (${categoryTo}) - incompatible categories`);
                return null;
            }
        }
        
        // ENHANCED: Optional DimensionalAnalysis check (if available)
        if (typeof DimensionalAnalysis !== 'undefined') {
            try {
                const compatible = DimensionalAnalysis.areCompatible(canonicalFrom, canonicalTo);
                if (!compatible) {
                    this._logWarn(`Cannot convert ${canonicalFrom} to ${canonicalTo} - incompatible dimensions`);
                    return null;
                }
            } catch (e) {
                // If DimensionalAnalysis fails, continue with category check
                this._logWarn(`DimensionalAnalysis check failed, using category validation: ${e.message}`);
            }
        }

        // OPTIMIZED: Category-aware base unit conversion
        // Convert via base unit for the category (more reliable than trying all base units)
        if (categoryFrom && categoryFrom === categoryTo) {
            const baseUnit = this.getBaseUnitForCategory(categoryFrom);
            if (baseUnit && baseUnit !== canonicalFrom && baseUnit !== canonicalTo) {
                try {
                    // Convert: from -> base -> to
                    const toBase = this.convertToBase(value, canonicalFrom, baseUnit);
                    if (toBase !== value && isFinite(toBase)) {
                        // Convert from base to target (reverse of convertToBase)
                        const fromBase = this.convertToBase(1, baseUnit, canonicalTo);
                        if (fromBase !== 1 && isFinite(fromBase)) {
                            return toBase / fromBase;
                        }
                    }
                } catch (e) {
                    // Fall through to direct conversion methods
                }
            }
        }

        // Try direct conversion first (fromConversions -> toUnit)
        const fromConversions = this.getConversions(canonicalFrom);
        if (fromConversions && fromConversions.length > 0) {
            for (const conv of fromConversions) {
                const convTargetCanonical = this.getCanonicalUnit(conv.unit);
                if (convTargetCanonical === canonicalTo) {
                    let converted = value * conv.factor;
                    if (conv.offset !== undefined) {
                        converted = converted + conv.offset;
                    }
                    return converted;
                }
            }
        }

        // Try reverse conversion (toConversions -> fromUnit)
        const toConversions = this.getConversions(canonicalTo);
        if (toConversions && toConversions.length > 0) {
            for (const conv of toConversions) {
                const convTargetCanonical = this.getCanonicalUnit(conv.unit);
                if (convTargetCanonical === canonicalFrom) {
                    let converted = value / conv.factor;
                    if (conv.offset !== undefined) {
                        converted = converted - conv.offset;
                    }
                    return converted;
                }
            }
        }
        
        // If no conversion found, return null
        this._logWarn(`No conversion found from ${canonicalFrom} to ${canonicalTo}`);
        return null;
    }
    
    /**
     * ENHANCED: Unified logging method
     * Uses logger if available, otherwise falls back to console
     */
    static _logWarn(message) {
        if (typeof logger !== 'undefined' && logger.warn) {
            logger.warn(message);
        } else {
            console.warn(`[UnitConverter] ${message}`);
        }
    }
}

