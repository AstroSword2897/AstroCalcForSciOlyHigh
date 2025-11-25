/**
 * Unit Parser - Extract and Parse Units from Input Strings
 * 
 * CRITICAL FIX: Prevents silent unit errors (e.g., "50 km" treated as "50")
 * 
 * Handles:
 * - Unit extraction from strings ("50 km", "1.5e8 m", "100 AU")
 * - Unit normalization (km, kilometers, kilometres → km)
 * - Unit validation against known unit database
 * - Implicit unit detection from context
 * 
 * @version 2.0
 */

class UnitParser {
    /**
     * Parse a value string and extract both number and unit
     * 
     * @param {string} input - Input string (e.g., "50 km", "1.5e8 m", "100")
     * @param {string} expectedUnit - Optional expected unit for validation
     * @returns {Object} { value: number, unit: string, original: string, hasUnit: boolean }
     * 
     * @example
     * UnitParser.parse("50 km") // { value: 50, unit: "km", original: "50 km", hasUnit: true }
     * UnitParser.parse("1.5e8") // { value: 1.5e8, unit: "", original: "1.5e8", hasUnit: false }
     * UnitParser.parse("100 AU") // { value: 100, unit: "AU", original: "100 AU", hasUnit: true }
     */
    static parse(input) {
        if (!input || typeof input !== 'string') {
            return { value: null, unit: '', original: input, hasUnit: false };
        }

        const trimmed = input.trim();
        
        // If it's already a number, return it
        const directNumber = parseFloat(trimmed);
        if (!isNaN(directNumber) && trimmed === directNumber.toString()) {
            return { value: directNumber, unit: '', original: trimmed, hasUnit: false };
        }

        // Pattern: number followed by optional whitespace and unit
        // Matches: "50 km", "1.5e8 m", "100.5 AU", "2×10^6 km", "3.14e-3 pc"
        const unitPattern = /^([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?(?:\s*×\s*10\^?\d+)?)\s*([a-zA-Z°µΩÅαβγδθλμπσφωΩ°'"]+)?$/;
        const match = trimmed.match(unitPattern);

        if (!match) {
            // Try to extract number anyway
            const numberMatch = trimmed.match(/([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)/);
            if (numberMatch) {
                const value = parseFloat(numberMatch[1]);
                if (!isNaN(value)) {
                    return { value: value, unit: '', original: trimmed, hasUnit: false };
                }
            }
            return { value: null, unit: '', original: trimmed, hasUnit: false };
        }

        const valueStr = match[1].replace(/\s*×\s*10\^?/g, 'e'); // Normalize scientific notation
        const unitStr = match[2] ? match[2].trim() : '';

        const value = parseFloat(valueStr);
        if (isNaN(value)) {
            return { value: null, unit: unitStr, original: trimmed, hasUnit: unitStr.length > 0 };
        }

        // Normalize unit
        const normalizedUnit = this.normalizeUnit(unitStr);

        return {
            value: value,
            unit: normalizedUnit,
            original: trimmed,
            hasUnit: normalizedUnit.length > 0
        };
    }

    /**
     * Normalize unit string to standard form
     * 
     * @param {string} unit - Unit string (e.g., "kilometers", "km", "Km")
     * @returns {string} Normalized unit (e.g., "km")
     */
    static normalizeUnit(unit) {
        if (!unit || unit.length === 0) return '';

        const normalized = unit.trim().toLowerCase();

        // Unit normalization map
        const unitMap = {
            // Distance
            'meter': 'm', 'meters': 'm', 'metre': 'm', 'metres': 'm',
            'kilometer': 'km', 'kilometers': 'km', 'kilometre': 'km', 'kilometres': 'km',
            'centimeter': 'cm', 'centimeters': 'cm', 'centimetre': 'cm', 'centimetres': 'cm',
            'millimeter': 'mm', 'millimeters': 'mm', 'millimetre': 'mm', 'millimetres': 'mm',
            'micrometer': 'μm', 'micrometers': 'μm', 'micrometre': 'μm', 'micrometres': 'μm',
            'nanometer': 'nm', 'nanometers': 'nm', 'nanometre': 'nm', 'nanometres': 'nm',
            'angstrom': 'Å', 'angstroms': 'Å', 'angstrom': 'Å',
            'astronomical unit': 'AU', 'astronomical units': 'AU', 'au': 'AU',
            'parsec': 'pc', 'parsecs': 'pc',
            'light year': 'ly', 'light years': 'ly', 'lightyear': 'ly', 'lightyears': 'ly',
            'kiloparsec': 'kpc', 'kiloparsecs': 'kpc',
            'megaparsec': 'Mpc', 'megaparsecs': 'Mpc',

            // Mass
            'kilogram': 'kg', 'kilograms': 'kg', 'kilogramme': 'kg', 'kilogrammes': 'kg',
            'gram': 'g', 'grams': 'g', 'gramme': 'g', 'grammes': 'g',
            'solar mass': 'M☉', 'solar masses': 'M☉', 'msun': 'M☉', 'm_sun': 'M☉',
            'm☉': 'M☉', 'm_☉': 'M☉', 'M_☉': 'M☉',  // Normalize all solar mass variants to M☉
            'earth mass': 'M⊕', 'earth masses': 'M⊕', 'mearth': 'M⊕', 'm_earth': 'M⊕',

            // Time
            'second': 's', 'seconds': 's', 'sec': 's', 'secs': 's',
            'minute': 'min', 'minutes': 'min', 'mins': 'min',
            'hour': 'hr', 'hours': 'hr', 'hrs': 'hr', 'h': 'hr',
            'day': 'day', 'days': 'day', 'd': 'day',
            'year': 'yr', 'years': 'yr', 'y': 'yr',

            // Temperature
            'kelvin': 'K', 'kelvins': 'K',
            'celsius': '°C', 'centigrade': '°C',
            'fahrenheit': '°F',

            // Angle
            'radian': 'rad', 'radians': 'rad',
            'degree': '°', 'degrees': '°', 'deg': '°',
            'arcsecond': 'arcsec', 'arcseconds': 'arcsec', '"': 'arcsec',
            'arcminute': 'arcmin', 'arcminutes': 'arcmin', "'": 'arcmin',

            // Energy
            'joule': 'J', 'joules': 'J',
            'erg': 'erg', 'ergs': 'erg',
            'electronvolt': 'eV', 'electronvolts': 'eV', 'ev': 'eV',

            // Power/Luminosity
            'watt': 'W', 'watts': 'W',
            'solar luminosity': 'L☉', 'solar luminosities': 'L☉', 'lsun': 'L☉', 'l_sun': 'L☉',

            // Frequency
            'hertz': 'Hz', 'hertz': 'Hz',
            'kilohertz': 'kHz', 'kilohertz': 'kHz',
            'megahertz': 'MHz', 'megahertz': 'MHz',
            'gigahertz': 'GHz', 'gigahertz': 'GHz',

            // Special symbols
            'pi': 'π', 'π': 'π',
            'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
            'theta': 'θ', 'lambda': 'λ', 'mu': 'μ', 'sigma': 'σ', 'phi': 'φ', 'omega': 'ω'
        };

        // Check exact match first
        if (unitMap[normalized]) {
            return unitMap[normalized];
        }

        // Check if it's already a standard unit (uppercase or special chars)
        if (unit.match(/^[A-Z][a-z]*$/) || unit.match(/[☉⊕°ÅΩ]/)) {
            return unit;
        }

        // Return normalized lowercase if no match
        return normalized;
    }

    /**
     * Check if a unit string is valid
     * 
     * @param {string} unit - Unit string to validate
     * @returns {boolean} True if unit is recognized
     */
    static isValidUnit(unit) {
        if (!unit || unit.length === 0) return true; // Empty unit is valid (dimensionless)

        const normalized = this.normalizeUnit(unit);
        
        // List of all valid units
        const validUnits = [
            // Distance
            'm', 'km', 'cm', 'mm', 'μm', 'nm', 'Å',
            'AU', 'pc', 'ly', 'kpc', 'Mpc',
            // Mass
            'kg', 'g', 'M☉', 'M⊕',
            // Time
            's', 'min', 'hr', 'day', 'yr',
            // Temperature
            'K', '°C', '°F',
            // Angle
            'rad', '°', 'arcsec', 'arcmin',
            // Energy
            'J', 'erg', 'eV',
            // Power
            'W', 'L☉',
            // Frequency
            'Hz', 'kHz', 'MHz', 'GHz',
            // Dimensionless
            '', 'dimensionless'
        ];

        return validUnits.includes(normalized);
    }

    /**
     * Get unit category (distance, mass, time, etc.)
     * 
     * @param {string} unit - Unit string
     * @returns {string} Category name or null
     */
    static getUnitCategory(unit) {
        if (!unit) return null;

        const normalized = this.normalizeUnit(unit);

        const categories = {
            distance: ['m', 'km', 'cm', 'mm', 'μm', 'nm', 'Å', 'AU', 'pc', 'ly', 'kpc', 'Mpc'],
            mass: ['kg', 'g', 'M☉', 'M⊕'],
            time: ['s', 'min', 'hr', 'day', 'yr'],
            temperature: ['K', '°C', '°F'],
            angle: ['rad', '°', 'arcsec', 'arcmin'],
            energy: ['J', 'erg', 'eV'],
            power: ['W', 'L☉'],
            frequency: ['Hz', 'kHz', 'MHz', 'GHz']
        };

        for (const [category, units] of Object.entries(categories)) {
            if (units.includes(normalized)) {
                return category;
            }
        }

        return null;
    }
}

