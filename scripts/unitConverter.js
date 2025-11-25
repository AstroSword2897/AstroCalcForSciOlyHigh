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
 */
class UnitConverter {
    /**
     * Convert and format a value with its unit
     * 
     * Automatically selects the best unit for display based on the value's magnitude.
     * For example, a very large distance will be converted to parsecs or light-years
     * instead of meters.
     * 
     * @param {number} value - The numerical value to convert
     * @param {string} unit - The current unit of the value (e.g., "m", "kg", "s")
     * @returns {Object} Object with:
     *                   - value: converted numerical value
     *                   - unit: new unit string
     *                   - factor: conversion factor used (if conversion occurred)
     *                   - original: original value and unit (if conversion occurred)
     * 
     * @example
     * UnitConverter.convertAndFormat(1.496e11, "m")
     * // Returns: { value: 1, unit: "AU", factor: 1.496e11, original: { value: 1.496e11, unit: "m" } }
     */
    static convertAndFormat(value, unit) {
        const conversions = this.getConversions(unit);
        if (!conversions || conversions.length === 0) {
            return { value: value, unit: unit };
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

        return bestConversion || { value: value, unit: unit };
    }

    // Get available conversions for a unit
    static getConversions(unit) {
        const conversionMap = {
            // Angles
            'radians': [
                { unit: 'degrees', factor: 180 / Math.PI, minValue: 0, maxValue: 2 * Math.PI }
            ],
            'rad': [
                { unit: 'degrees', factor: 180 / Math.PI, minValue: 0, maxValue: 2 * Math.PI }
            ],
            'degrees': [
                { unit: 'radians', factor: Math.PI / 180, minValue: 0, maxValue: 360 }
            ],
            'deg': [
                { unit: 'radians', factor: Math.PI / 180, minValue: 0, maxValue: 360 }
            ],
            
            // Distance
            'meters': [
                { unit: 'km', factor: 1e-3, minValue: 1, maxValue: 1e12 },
                { unit: 'AU', factor: 6.68459e-12, minValue: 1e8, maxValue: 1e15 },
                { unit: 'light-years', factor: 1.057e-16, minValue: 1e15, maxValue: 1e20 },
                { unit: 'parsecs', factor: 3.24078e-17, minValue: 1e15, maxValue: 1e20 }
            ],
            'm': [
                { unit: 'km', factor: 1e-3, minValue: 1, maxValue: 1e12 },
                { unit: 'AU', factor: 6.68459e-12, minValue: 1e8, maxValue: 1e15 },
                { unit: 'light-years', factor: 1.057e-16, minValue: 1e15, maxValue: 1e20 },
                { unit: 'parsecs', factor: 3.24078e-17, minValue: 1e15, maxValue: 1e20 }
            ],
            'parsecs': [
                { unit: 'light-years', factor: 3.26156, minValue: 0.1, maxValue: 1e6 },
                { unit: 'AU', factor: 206265, minValue: 0.001, maxValue: 1000 }
            ],
            'pc': [
                { unit: 'light-years', factor: 3.26156, minValue: 0.1, maxValue: 1e6 },
                { unit: 'AU', factor: 206265, minValue: 0.001, maxValue: 1000 }
            ],
            'AU': [
                { unit: 'km', factor: 1.496e8, minValue: 0.001, maxValue: 1000 },
                { unit: 'light-minutes', factor: 8.317, minValue: 0.1, maxValue: 10000 }
            ],

            // Time
            'seconds': [
                { unit: 'minutes', factor: 1/60, minValue: 60, maxValue: 3600 },
                { unit: 'hours', factor: 1/3600, minValue: 3600, maxValue: 86400 },
                { unit: 'days', factor: 1/86400, minValue: 86400, maxValue: 31536000 },
                { unit: 'years', factor: 3.17098e-8, minValue: 31536000, maxValue: 1e15 }
            ],
            's': [
                { unit: 'minutes', factor: 1/60, minValue: 60, maxValue: 3600 },
                { unit: 'hours', factor: 1/3600, minValue: 3600, maxValue: 86400 },
                { unit: 'days', factor: 1/86400, minValue: 86400, maxValue: 31536000 },
                { unit: 'years', factor: 3.17098e-8, minValue: 31536000, maxValue: 1e15 }
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
            'Kelvin': [
                { unit: '°C', factor: 1, offset: -273.15, minValue: 0, maxValue: 1e6 }
            ],
            'K': [
                { unit: '°C', factor: 1, offset: -273.15, minValue: 0, maxValue: 1e6 }
            ],

            // Wavelength
            'meters': [
                { unit: 'nm', factor: 1e9, minValue: 1e-9, maxValue: 1e-6 },
                { unit: 'μm', factor: 1e6, minValue: 1e-6, maxValue: 1e-3 },
                { unit: 'mm', factor: 1000, minValue: 1e-3, maxValue: 1 }
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

        // Normalize unit string (remove spaces, handle variations)
        const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '').replace(/·/g, '');
        
        // Try exact match first
        if (conversionMap[normalizedUnit]) {
            return conversionMap[normalizedUnit];
        }

        // Try partial matches
        for (const [key, value] of Object.entries(conversionMap)) {
            if (normalizedUnit.includes(key) || key.includes(normalizedUnit)) {
                return value;
            }
        }

        return null;
    }

    // Format a number with appropriate precision
    static formatNumber(value) {
        if (value === 0) return '0';
        
        const absValue = Math.abs(value);
        
        // Use scientific notation for very large or very small numbers
        if (absValue >= 1e6 || (absValue < 1e-3 && absValue > 0)) {
            return value.toExponential(4);
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
        // Normalize solar mass variants to M☉
        if (unit === 'M_☉' || unit === 'm☉' || unit === 'm_☉' || unit === 'M_sun' || unit === 'm_sun') {
            unit = 'M☉';
        }
        
        const unitMap = {
            'm': 'meters',
            's': 'seconds',
            'kg': 'kilograms',
            'W': 'Watts',
            'M☉': 'Solar Masses',
            'M_☉': 'Solar Masses',  // Same as M☉
            'J': 'Joules',
            'K': 'Kelvin',
            'Hz': 'Hertz',
            'Pa': 'Pascals',
            'M☉': 'Solar Masses',
            'M_earth': 'Earth Masses',
            'L☉': 'Solar Luminosities',
            'AU': 'Astronomical Units',
            'pc': 'parsecs',
            'km/s': 'kilometers per second',
            'm/s': 'meters per second',
            'm/s²': 'meters per second squared',
            'W/m²': 'Watts per square meter',
            'kg/m³': 'kilograms per cubic meter',
            'magnitude': 'magnitude',
            'mag': 'magnitude',
            'dimensionless': 'dimensionless',
            'arcseconds': 'arcseconds',
            'arcsec': 'arcseconds',
            'radians': 'radians',
            'rad': 'radians',
            'Gauss': 'Gauss',
            'Tesla': 'Tesla',
            'G': 'Gauss',
            'T': 'Tesla'
        };

        return unitMap[unit] || unit;
    }

    // Get alternative units for a given base unit
    static getAlternativeUnits(baseUnit) {
        const alternativeUnitsMap = {
            // Distance
            'meters': ['m', 'km', 'AU', 'pc', 'light-years', 'ly'],
            'm': ['meters', 'km', 'AU', 'pc', 'light-years', 'ly'],
            
            // Mass
            'kg': ['kilograms', 'g', 'M☉', 'M_☉', 'M_sun', 'M_earth'],
            'kilograms': ['kg', 'g', 'M☉', 'M_☉', 'M_sun', 'M_earth'],
            'M☉': ['M_☉', 'M_sun', 'm☉', 'm_☉', 'Solar Masses', 'kg'],
            'M_☉': ['M☉', 'M_sun', 'm☉', 'm_☉', 'Solar Masses', 'kg'],  // Same as M☉
            'Solar Masses': ['M☉', 'M_☉', 'M_sun', 'kg'],
            
            // Time
            'seconds': ['s', 'minutes', 'hours', 'days', 'years'],
            's': ['seconds', 'minutes', 'hours', 'days', 'years'],
            'years': ['y', 'yr', 'seconds', 'days'],
            
            // Velocity
            'm/s': ['meters per second', 'km/s', 'km/h'],
            
            // Luminosity/Power
            'W': ['Watts', 'L☉', 'L_sun', 'erg/s'],
            
            // Flux
            'W/m²': ['Watts per square meter', 'erg/(s·cm²)'],
            
            // Temperature
            'Kelvin': ['K', '°C', 'Celsius'],
            'K': ['Kelvin', '°C', 'Celsius'],
            
            // Wavelength
            'meters': ['m', 'nm', 'μm', 'mm', 'cm'],
            
            // Frequency
            'Hz': ['Hertz', 'kHz', 'MHz', 'GHz'],
            
            // Density
            'kg/m³': ['kilograms per cubic meter', 'g/cm³'],
            
            // Angles
            'radians': ['rad', 'degrees', 'deg', '°'],
            'rad': ['radians', 'degrees', 'deg', '°']
        };

        const normalized = baseUnit.toLowerCase().trim();
        const alternatives = alternativeUnitsMap[normalized] || alternativeUnitsMap[baseUnit] || [];
        
        // Return unique list including base unit
        const allUnits = [baseUnit, ...alternatives];
        return [...new Set(allUnits)];
    }

    // Convert a value from any unit to the base unit
    static convertToBase(value, fromUnit, baseUnit) {
        // Input validation
        if (typeof value !== 'number' || !isFinite(value)) {
            if (typeof logger !== 'undefined') {
                logger.warn(`UnitConverter.convertToBase: Invalid value ${value}`);
            }
            return value; // Return as-is for invalid values
        }
        if (!fromUnit || !baseUnit) {
            return value;
        }
        
        // If already in base unit, return as is
        if (fromUnit === baseUnit || fromUnit.toLowerCase() === baseUnit.toLowerCase()) {
            return value;
        }

        // Conversion factors to base units
        const conversionFactors = {
            // Distance to meters
            'km': 1000,
            'AU': 1.496e11,
            'pc': 3.086e16,
            'parsecs': 3.086e16,
            'light-years': 9.461e15,
            'ly': 9.461e15,
            'cm': 0.01,
            'mm': 0.001,
            'μm': 1e-6,
            'nm': 1e-9,
            
            // Mass to kg
            'g': 0.001,
            'grams': 0.001,
            'M☉': 1.989e30,
            'M_☉': 1.989e30,  // Same as M☉
            'm☉': 1.989e30,   // Same as M☉ (lowercase)
            'm_☉': 1.989e30,  // Same as M☉ (lowercase with underscore)
            'M_sun': 1.989e30,
            'm_sun': 1.989e30, // Same as M_sun (lowercase)
            'M_earth': 5.972e24,
            
            // Time to seconds
            'minutes': 60,
            'hours': 3600,
            'days': 86400,
            'years': 3.156e7,
            'y': 3.156e7,
            'yr': 3.156e7,
            
            // Velocity to m/s
            'km/s': 1000,
            'km/h': 0.277778,
            
            // Luminosity to W
            'L☉': 3.828e26,
            'L_☉': 3.828e26,
            'L_sun': 3.828e26,
            'erg/s': 1e-7,
            
            // Flux to W/m²
            'erg/(s·cm²)': 0.001,
            
            // Temperature to Kelvin
            '°C': 1,  // Add 273.15 offset
            'Celsius': 1,  // Add 273.15 offset
            'C': 1,  // Add 273.15 offset
            
            // Frequency to Hz
            'kHz': 1000,
            'MHz': 1e6,
            'GHz': 1e9,
            
            // Density to kg/m³
            'g/cm³': 1000,
            
            // Angles to radians
            'degrees': Math.PI / 180,
            'deg': Math.PI / 180,
            '°': Math.PI / 180
        };

        const normalizedFrom = fromUnit.toLowerCase().trim();
        let factor = conversionFactors[normalizedFrom] || conversionFactors[fromUnit];
        
        // Handle temperature conversion (Celsius to Kelvin)
        if ((normalizedFrom === '°c' || normalizedFrom === 'celsius' || normalizedFrom === 'c') && 
            (baseUnit.toLowerCase() === 'kelvin' || baseUnit.toLowerCase() === 'k')) {
            return value + 273.15;
        }
        
        // Handle reverse temperature conversion (Kelvin to Celsius) - shouldn't happen for convertToBase
        if (factor === undefined) {
            // Try to find reverse conversion
            const reverseConversions = {
                'meters': { 'km': 0.001, 'AU': 6.68459e-12, 'pc': 3.24078e-17 },
                'kg': { 'g': 1000, 'M☉': 5.02785e-31, 'M_earth': 1.67443e-25 },
                'seconds': { 'minutes': 1/60, 'hours': 1/3600, 'days': 1/86400, 'years': 3.17098e-8 }
            };
            
            const baseNorm = baseUnit.toLowerCase();
            if (reverseConversions[baseNorm] && reverseConversions[baseNorm][normalizedFrom]) {
                factor = 1 / reverseConversions[baseNorm][normalizedFrom];
            }
        }
        
        if (factor === undefined) {
            console.warn(`No conversion factor found from ${fromUnit} to ${baseUnit}, using value as-is`);
            return value;
        }
        
        return value * factor;
    }

    /**
     * Convert a value from one unit to another
     * 
     * CRITICAL FIX: Enables unit conversion for parsed inputs
     * 
     * @param {number} value - Value to convert
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @returns {number|null} Converted value, or null if conversion not possible
     * 
     * @example
     * UnitConverter.convert(50, 'km', 'm') // Returns: 50000
     * UnitConverter.convert(1, 'AU', 'pc') // Returns: 4.848e-6
     */
    static convert(value, fromUnit, toUnit) {
        // Input validation
        if (typeof value !== 'number' || !isFinite(value)) {
            if (typeof logger !== 'undefined') {
                logger.warn(`UnitConverter.convert: Invalid value ${value}, expected finite number`);
            }
            return null;
        }
        
        if (!fromUnit || !toUnit || fromUnit === toUnit) {
            return value;
        }

        // Normalize units
        const normalizedFrom = typeof UnitParser !== 'undefined' ? UnitParser.normalizeUnit(fromUnit) : fromUnit;
        const normalizedTo = typeof UnitParser !== 'undefined' ? UnitParser.normalizeUnit(toUnit) : toUnit;

        // Check if units are in same category
        if (typeof DimensionalAnalysis !== 'undefined') {
            const compatible = DimensionalAnalysis.areCompatible(normalizedFrom, normalizedTo);
            if (!compatible) {
                if (typeof logger !== 'undefined') {
                    logger.warn(`Cannot convert ${normalizedFrom} to ${normalizedTo} - incompatible dimensions`);
                } else {
                    console.warn(`Cannot convert ${normalizedFrom} to ${normalizedTo} - incompatible dimensions`);
                }
                return null;
            }
        }

        // Try direct conversion first (fromConversions -> toUnit)
        const fromConversions = this.getConversions(normalizedFrom);
        if (fromConversions && fromConversions.length > 0) {
            for (const conv of fromConversions) {
                if (conv.unit === normalizedTo) {
                    let converted = value * conv.factor;
                    if (conv.offset !== undefined) {
                        converted = converted + conv.offset;
                    }
                    return converted;
                }
            }
        }

        // Try reverse conversion (toConversions -> fromUnit)
        const toConversions = this.getConversions(normalizedTo);
        if (toConversions && toConversions.length > 0) {
            for (const conv of toConversions) {
                if (conv.unit === normalizedFrom) {
                    let converted = value / conv.factor;
                    if (conv.offset !== undefined) {
                        converted = converted - conv.offset;
                    }
                    return converted;
                }
            }
        }

        // If no conversion found, return null
        if (typeof logger !== 'undefined') {
            logger.warn(`No conversion found from ${normalizedFrom} to ${normalizedTo}`);
        }
        return null;
    }
}

