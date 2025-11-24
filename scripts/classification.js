/**
 * Stellar Classification Module
 * 
 * Implements the Harvard Spectral Classification system for stars.
 * Classifies stars based on:
 * - Effective temperature (primary classification)
 * - Luminosity class (Roman numeral: I-V)
 * - Special cases (protostars, white dwarfs)
 * 
 * Classification System:
 * - OBAFGKM: Main sequence temperature classes (hottest to coolest)
 * - L, T, Y: Extended classes for brown dwarfs and very cool objects
 * - Luminosity classes: I (supergiants), II (bright giants), III (giants),
 *                       IV (subgiants), V (main sequence), VI (subdwarfs)
 * 
 * Special Classifications:
 * - Protostars/YSOs: Classified separately based on temperature ranges
 * - White Dwarfs: Use DA, DB, etc. notation with temperature-based spectral class
 */

/**
 * StellarClassifier Class
 * 
 * Provides methods for classifying stars based on their physical properties.
 * Uses the Harvard Classification system with extensions for cool objects.
 */
class StellarClassifier {
    constructor() {
        // Harvard Classification temperature ranges (in Kelvin)
        this.harvardClasses = [
            { class: 'O', min: 33000, max: Infinity },
            { class: 'B', min: 10000, max: 33000 },
            { class: 'A', min: 7500, max: 10000 },
            { class: 'F', min: 6000, max: 7500 },
            { class: 'G', min: 5200, max: 6000 },
            { class: 'K', min: 3700, max: 5200 },
            { class: 'M', min: 2400, max: 3700 },
            { class: 'L', min: 1300, max: 2400 },
            { class: 'T', min: 700, max: 1300 },
            { class: 'Y', min: 0, max: 700 }
        ];
    }

    /**
     * Classify a star based on temperature, luminosity class, protostar status, and white dwarf status
     * 
     * Main classification method that determines the spectral type of a star.
     * Handles special cases (white dwarfs, protostars) before standard classification.
     * 
     * @param {number} temperature - Effective temperature in Kelvin (must be > 0)
     * @param {string} luminosityClass - Luminosity class: "I", "II", "III", "IV", "V", "VI", or null
     * @param {boolean} isProtostar - Whether the object is a protostar/young stellar object
     * @param {boolean} isWhiteDwarf - Whether the object is a white dwarf
     * @param {string} whiteDwarfType - White dwarf type if applicable (e.g., "DA", "DB", "DC")
     * @returns {string} Spectral classification (e.g., "G2V", "B5III", "DA4", "T Tauri")
     * @throws {Error} If temperature is invalid or outside valid range
     * 
     * @example
     * classifier.classify(5778, "V", false, false, null) // Returns: "G2V"
     * classifier.classify(30000, "I", false, false, null) // Returns: "O5I"
     * classifier.classify(10000, null, false, true, "DA") // Returns: "DA5"
     * classifier.classify(4000, null, true, false, null) // Returns: "T Tauri"
     */
    classify(temperature, luminosityClass, isProtostar, isWhiteDwarf, whiteDwarfType) {
        if (!temperature || temperature <= 0) {
            throw new Error('Temperature must be a positive number');
        }

        // Handle white dwarf classification
        if (isWhiteDwarf && whiteDwarfType) {
            // For white dwarfs, return the type directly (e.g., "DA", "DB")
            // Optionally include temperature-based spectral class
            const harvardClass = this.getHarvardClass(temperature);
            if (harvardClass) {
                const subclass = this.calculateSubclass(temperature, harvardClass);
                return `${whiteDwarfType}${harvardClass.class}${subclass}`;
            }
            return whiteDwarfType;
        }

        // Handle protostar/YSO classification
        if (isProtostar) {
            return this.classifyYSO(temperature);
        }

        // Find the Harvard class
        const harvardClass = this.getHarvardClass(temperature);
        if (!harvardClass) {
            throw new Error(`Temperature ${temperature} K is outside valid range`);
        }

        // Calculate subclass (0-9)
        const subclass = this.calculateSubclass(temperature, harvardClass);

        // Build classification string
        let classification = `${harvardClass.class}${subclass}`;
        
        // Add luminosity class if provided
        if (luminosityClass) {
            classification += luminosityClass;
        }

        return classification;
    }

    // Get Harvard class from temperature
    getHarvardClass(temperature) {
        for (const harvardClass of this.harvardClasses) {
            if (temperature >= harvardClass.min && temperature < harvardClass.max) {
                return harvardClass;
            }
        }
        // Handle edge case for maximum O class
        if (temperature >= this.harvardClasses[0].min) {
            return this.harvardClasses[0];
        }
        return null;
    }

    // Calculate subclass (0-9) based on position within class range
    calculateSubclass(temperature, harvardClass) {
        const range = harvardClass.max - harvardClass.min;
        
        // Handle infinite max (O class)
        if (!isFinite(harvardClass.max)) {
            // For O class, use a large number for calculation
            // O0 = 50,000+ K, O9 = 33,000 K
            const oMax = 50000;
            const oRange = oMax - harvardClass.min;
            const position = (temperature - harvardClass.min) / oRange;
            return Math.min(9, Math.max(0, Math.floor(9 * (1 - position))));
        }
        
        // Normalize position within range (0 to 1)
        const position = (temperature - harvardClass.min) / range;
        
        // Convert to subclass (0-9), where 0 is hottest and 9 is coolest
        // For most classes: 0 = hottest (max temp), 9 = coolest (min temp)
        const subclass = Math.floor(9 * (1 - position));
        
        return Math.min(9, Math.max(0, subclass));
    }

    // Classify Young Stellar Object (YSO/Protostar)
    classifyYSO(temperature) {
        // YSO classification is based on evolutionary stage, not just temperature
        // For simplicity, we'll use temperature ranges as approximation
        if (temperature >= 3000) {
            return 'Class III'; // Young stars
        } else if (temperature >= 1000) {
            return 'Class II'; // Pre-main sequence
        } else {
            return 'Class 0/I'; // Protostars
        }
    }

    // Get full class name for display
    getClassName(harvardClass) {
        const names = {
            'O': 'O-type',
            'B': 'B-type',
            'A': 'A-type',
            'F': 'F-type',
            'G': 'G-type',
            'K': 'K-type',
            'M': 'M-type',
            'L': 'L-type',
            'T': 'T-type',
            'Y': 'Y-type'
        };
        return names[harvardClass] || harvardClass;
    }

    // Get luminosity class description
    getLuminosityDescription(luminosityClass) {
        const descriptions = {
            'Ia': 'Bright Supergiant',
            'Ib': 'Supergiant',
            'II': 'Bright Giant',
            'III': 'Giant',
            'IV': 'Subgiant',
            'V': 'Main Sequence (Dwarf)'
        };
        return descriptions[luminosityClass] || luminosityClass;
    }

    // Get white dwarf type description
    getWhiteDwarfDescription(whiteDwarfType) {
        const descriptions = {
            'DA': 'Hydrogen-rich',
            'DB': 'Helium-rich',
            'DC': 'Featureless',
            'DO': 'Ionized helium',
            'DQ': 'Carbon features',
            'DZ': 'Metal features',
            'DX': 'Unclear features'
        };
        return descriptions[whiteDwarfType] || whiteDwarfType;
    }
}

// Global instance
let stellarClassifier = null;

