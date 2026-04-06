/**
 * UnitConverter: robust, category-aware unit conversion utility.
 * Handles canonicalization, category validation, temperature offsets, and context-aware conversions.
 *
 * Physical constants: SI (c, eV), IAU 2012 (AU), parsec = AU / (1″ in radians), Julian light-year.
 */

/** IAU 2012 astronomical unit (exact definition, meters). */
const AU_METERS = 149597870700;
/** 1 pc: distance at which 1 AU subtends 1″ — AU × (180×3600/π) = AU × (648000/π). */
const PARSEC_METERS = AU_METERS * (648000 / Math.PI);
/** 1 megaparsec in metres (Hubble-law conversions). */
const MEGAPARSEC_METERS = 1e6 * PARSEC_METERS;
/** 1 km/(s·Mpc) → s⁻¹ (Hubble parameter unit). */
const KM_S_MPC_TO_INV_S = 1000 / MEGAPARSEC_METERS;
/** Julian light-year: c × 365.25 d (common astrophysics convention). */
const LIGHT_YEAR_METERS = 299792458 * 365.25 * 86400;
/** Julian year in seconds (365.25 × 86400). */
const JULIAN_YEAR_SECONDS = 365.25 * 86400;

/** IAU 2015 nominal solar mass (kg) — same as M☉ conversion; used for globalConstants / formulas. */
const NOMINAL_SOLAR_MASS_KG = 1.988409870440e30;
/** Nominal solar luminosity (W) — IAU working value, matches globalConstants L_sun. */
const NOMINAL_SOLAR_LUMINOSITY_W = 3.828e26;
/** IAU 2015 nominal solar radius (m) — same as R☉ conversion. */
const NOMINAL_SOLAR_RADIUS_M = 695700000;

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
        'R☉': 'R☉', 'R_☉': 'R☉', 'R_sun': 'R☉', 'r_sun': 'R☉', 'RSun': 'R☉',
        'Solar Radii': 'R☉', 'solar radii': 'R☉', 'solar radius': 'R☉', 'Solar radius': 'R☉',
        
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
        'rad/s': 'rad/s', 'radians per second': 'rad/s', 'radian per second': 'rad/s',
        'deg/s': 'deg/s', 'degrees per second': 'deg/s',
        
        // Energy/Power
        'W': 'W', 'Watts': 'W', 'watt': 'W',
        'J': 'J', 'Joule': 'J', 'Joules': 'J',
        'erg': 'erg', 'ergs': 'erg',
        'eV': 'eV', 'electronvolt': 'eV', 'electron-volt': 'eV', 'electron-volts': 'eV',
        // Angular momentum / action (same dimensions: kg·m²/s ≡ J·s)
        'J·s': 'J·s', 'J s': 'J·s', 'J*s': 'J·s',
        'kg·m²/s': 'J·s', 'kg m^2/s': 'J·s', 'kg·m2/s': 'J·s',
        'erg·s': 'erg·s', 'erg s': 'erg·s',
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
        
        // Acceleration
        'm/s²': 'm/s²', 'm/s2': 'm/s²', 'm s^-2': 'm/s²',
        'cm/s²': 'cm/s²', 'cm/s2': 'cm/s²',
        
        // Density
        'kg/m³': 'kg/m³', 'kilograms per cubic meter': 'kg/m³',
        'g/cm³': 'g/cm³', 'grams per cubic centimeter': 'g/cm³',
        
        // Angles
        'rad': 'rad', 'radian': 'rad', 'radians': 'rad',
        'deg': 'deg', 'degree': 'deg', 'degrees': 'deg', '°': 'deg',
        'arcmin': 'arcmin', 'arcminute': 'arcmin', 'arcminutes': 'arcmin',
        'arcsec': 'arcsec', 'arcsecond': 'arcsec', 'arcseconds': 'arcsec',
        'Å': 'Å', 'Angstrom': 'Å', 'angstrom': 'Å', 'ångström': 'Å', 'Angstroms': 'Å',
        'Mpc': 'Mpc', 'megaparsec': 'Mpc', 'megaparsecs': 'Mpc',
        // Hubble constant style (dimension 1/time; convertible with Hz)
        'km/(s·Mpc)': 'km/(s·Mpc)',
        'km/s/Mpc': 'km/(s·Mpc)',
        'km s^-1 Mpc^-1': 'km/(s·Mpc)',
        // Area
        'm²': 'm²',
        'm^2': 'm²',
        'km²': 'km²',
        'km^2': 'km²',
        'cm²': 'cm²',
        'cm^2': 'cm²',
        // Force / pressure / energy density / B-field
        'N': 'N',
        'Newton': 'N',
        'newton': 'N',
        'dyn': 'dyn',
        'dyne': 'dyn',
        'Pa': 'Pa',
        'pascal': 'Pa',
        'Pascal': 'Pa',
        'J/m³': 'J/m³',
        'J/m^3': 'J/m³',
        'T': 'T',
        'Tesla': 'T',
        'tesla': 'T',
        'G': 'G',
        'Gauss': 'G',
        'gauss': 'G',
        // Gravitational constant G in SI-derived form
        'm³/(kg·s²)': 'm³/(kg·s²)',
        'm^3/(kg*s^2)': 'm³/(kg·s²)',
        'm³/kg/s²': 'm³/(kg·s²)',
        // Stefan–Boltzmann coefficient (σ) unit
        'W/(m²·K⁴)': 'W/(m²·K⁴)',
        'W/(m^2*K^4)': 'W/(m²·K⁴)',
        'W/(m^2 K^4)': 'W/(m²·K⁴)',
        'dimensionless': 'dimensionless',
        'mag': 'mag',
        'magnitude': 'mag'
    };

    // Category for each canonical unit
    static unitCategory = {
        // Distance
        'm': 'distance', 'km': 'distance', 'cm': 'distance', 'mm': 'distance',
        'μm': 'distance', 'nm': 'distance', 'AU': 'distance', 'pc': 'distance', 'ly': 'distance',
        'Mpc': 'distance', 'Å': 'distance', 'R☉': 'distance',
        
        // Mass
        'kg': 'mass', 'g': 'mass', 'M☉': 'mass', 'M_earth': 'mass',
        
        // Time
        's': 'time', 'min': 'time', 'h': 'time', 'day': 'time', 'yr': 'time',
        
        // Temperature
        'K': 'temperature', '°C': 'temperature', '°F': 'temperature',
        
        // Velocity
        'm/s': 'velocity', 'km/s': 'velocity', 'km/h': 'velocity',
        
        // Angular speed (ω = dθ/dt)
        'rad/s': 'angular_speed', 'deg/s': 'angular_speed',
        
        // Angular momentum / action
        'J·s': 'angular_momentum', 'erg·s': 'angular_momentum',
        
        // Acceleration
        'm/s²': 'acceleration', 'cm/s²': 'acceleration',
        
        // Energy/Power
        'W': 'power', 'J': 'energy', 'erg': 'energy', 'eV': 'energy',
        'L☉': 'power', 'erg/s': 'power',
        
        // Flux
        'W/m²': 'flux', 'erg/(s·cm²)': 'flux',
        
        // Frequency / inverse time (Hubble H₀ in km/s/Mpc shares dimensions with Hz)
        'Hz': 'frequency',
        'kHz': 'frequency',
        'MHz': 'frequency',
        'GHz': 'frequency',
        'km/(s·Mpc)': 'frequency',
        
        // Area
        'm²': 'area',
        'km²': 'area',
        'cm²': 'area',
        
        // Force
        'N': 'force',
        'dyn': 'force',
        
        // Pressure / volumetric energy density (same SI dimensions as Pa)
        'Pa': 'pressure',
        'J/m³': 'pressure',
        
        // Magnetic flux density
        'T': 'magnetic_B',
        'G': 'magnetic_B',
        
        // Gravitational constant G (SI unit of G)
        'm³/(kg·s²)': 'grav_G',
        
        // Stefan–Boltzmann coefficient σ
        'W/(m²·K⁴)': 'sigma_sb',
        
        // Density
        'kg/m³': 'density', 'g/cm³': 'density',
        
        // Angles
        'rad': 'angle', 'deg': 'angle', 'arcmin': 'angle', 'arcsec': 'angle',
        'dimensionless': 'dimensionless',
        'mag': 'dimensionless'
    };

    // Base unit per category
    static baseUnit = {
        'distance': 'm',
        'mass': 'kg',
        'time': 's',
        'temperature': 'K',
        'velocity': 'm/s',
        'angular_speed': 'rad/s',
        'angular_momentum': 'J·s',
        'acceleration': 'm/s²',
        'power': 'W',
        'energy': 'J',
        'flux': 'W/m²',
        'frequency': 'Hz',
        'density': 'kg/m³',
        'angle': 'rad',
        'area': 'm²',
        'force': 'N',
        'pressure': 'Pa',
        'magnetic_B': 'T',
        'grav_G': 'm³/(kg·s²)',
        'sigma_sb': 'W/(m²·K⁴)',
        'dimensionless': 'dimensionless'
    };

    // Conversion factors to category SI bases (linear). Non-SI units → multiply by factor to get base.
    static conversionFactors = {
        // Distance → meters
        'km': 1e3,
        'cm': 0.01,
        'mm': 0.001,
        'μm': 1e-6,
        'nm': 1e-9,
        'AU': AU_METERS,
        'pc': PARSEC_METERS,
        'Mpc': 1e6 * PARSEC_METERS,
        'ly': LIGHT_YEAR_METERS,
        'Å': 1e-10,
        'R☉': NOMINAL_SOLAR_RADIUS_M,
        
        // Mass → kg
        'g': 0.001,
        'M☉': NOMINAL_SOLAR_MASS_KG,
        'M_earth': 5.9721684356e24,
        
        // Time → seconds
        'min': 60,
        'h': 3600,
        'day': 86400,
        'yr': JULIAN_YEAR_SECONDS,
        
        // Velocity → m/s
        'km/s': 1000,
        'km/h': 1000 / 3600,
        
        // Angular speed → rad/s
        'deg/s': Math.PI / 180,
        
        // Angular momentum → J·s (= kg·m²/s)
        'erg·s': 1e-7,
        
        // Acceleration → m/s²
        'cm/s²': 0.01,
        
        // Energy → J
        'erg': 1e-7,
        'eV': 1.602176634e-19,
        
        // Power → W
        'L☉': NOMINAL_SOLAR_LUMINOSITY_W,
        'erg/s': 1e-7,
        
        // Flux to W/m²
        'erg/(s·cm²)': 0.001,
        
        // Frequency to Hz (including Hubble-law form)
        'km/(s·Mpc)': KM_S_MPC_TO_INV_S,
        'kHz': 1e3,
        'MHz': 1e6,
        'GHz': 1e9,
        
        // Area → m²
        'km²': 1e6,
        'cm²': 1e-4,
        
        // Force → N
        'dyn': 1e-5,
        
        // Pressure / energy density → Pa
        'J/m³': 1,
        
        // Magnetic field → T
        'G': 1e-4,
        
        // Density to kg/m³
        'g/cm³': 1000,
        
        // Angles to radians
        'deg': Math.PI / 180,
        'arcmin': Math.PI / (180 * 60),
        'arcsec': Math.PI / (180 * 3600),

        // Dimensionless / magnitude (no scaling)
        'dimensionless': 1,
        'mag': 1
    };

    /**
     * Get canonical form of unit
     * BACKWARD COMPATIBILITY: Also supports getCanonicalUnit() alias
     */
    static getCanonical(unit) {
        if (!unit) return '';
        const normalized = unit.trim();
        
        // First, try exact match (handles special characters like M☉, °C)
        if (UnitConverter.canonicalUnits[normalized]) {
            return UnitConverter.canonicalUnits[normalized];
        }
        
        // For case-insensitive matching, only lowercase if no special characters
        // Special characters: ☉, °, μ, ², ³, /, ·, etc.
        const hasSpecialChars = /[☉°μ²³/·_⊕]/.test(normalized);
        
        if (!hasSpecialChars) {
            const lower = normalized.toLowerCase();
            // Try lowercase match
            if (UnitConverter.canonicalUnits[lower]) {
                return UnitConverter.canonicalUnits[lower];
            }
            // Try case-insensitive search
            for (const [alias, canonical] of Object.entries(UnitConverter.canonicalUnits)) {
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
        return UnitConverter.getCanonical(unit);
    }

    /**
     * Map formula-database spellings (e.g. "parsecs", "years", "meters") to canonical symbols
     * so each formula’s intended base unit matches UnitConverter (not confused with SI labels only).
     */
    static normalizeFormulaUnit(unit) {
        if (unit == null) {
            return '';
        }
        const raw = String(unit).trim();
        if (!raw) {
            return '';
        }
        const lower = raw.toLowerCase();
        const spaced = lower.replace(/\s+/g, ' ').trim();
        const alias = {
            parsecs: 'pc',
            parsec: 'pc',
            years: 'yr',
            year: 'yr',
            seconds: 's',
            second: 's',
            meters: 'm',
            meter: 'm',
            metres: 'm',
            metre: 'm',
            kilograms: 'kg',
            kilogram: 'kg',
            radians: 'rad',
            radian: 'rad',
            kelvin: 'K',
            magnitude: 'mag',
            angstrom: 'Å',
            ångström: 'Å',
            arcseconds: 'arcsec',
            arcsecond: 'arcsec',
            arcminutes: 'arcmin',
            arcminute: 'arcmin',
            megaparsecs: 'Mpc',
            megaparsec: 'Mpc',
            'light years': 'ly',
            'light-years': 'ly',
            lightyears: 'ly',
            'light year': 'ly',
            'm or au': 'm',
            'm or AU': 'm',
            'kg or m☉': 'kg',
            'kg or msun': 'kg',
            'solar radii': 'R☉',
            'solar radius': 'R☉',
            'solar radii (r☉)': 'R☉',
            'particles/energy': 'dimensionless',
            varies: 'dimensionless',
            'energy units': 'J',
            'n/a²': 'dimensionless',
            'n/a^2': 'dimensionless',
            '0 to 1': 'dimensionless',
            angstroms: 'Å',
            tesla: 'T',
            pascal: 'Pa',
            newton: 'N',
            gauss: 'G',
            hertz: 'Hz',
            'km/s/mpc': 'km/(s·Mpc)',
            'km/s /mpc': 'km/(s·Mpc)'
        };
        if (alias[spaced]) {
            return alias[spaced];
        }
        if (alias[lower]) {
            return alias[lower];
        }
        const c = UnitConverter.getCanonical(raw);
        return c || raw;
    }

    /**
     * Get category for a unit
     */
    static getUnitCategory(unit) {
        const canonical = UnitConverter.getCanonical(unit);
        return UnitConverter.unitCategory[canonical] || null;
    }

    /**
     * Get base unit for a category
     */
    static getBaseUnitForCategory(category) {
        return UnitConverter.baseUnit[category] || null;
    }

    /**
     * One-line note: formula units vs SI. Conversions in this app use SI-derived definitions
     * (e.g. time → seconds, length → metres) even when the formula states yr, AU, pc, etc.
     */
    static getSiBaseContextForUnit(unit) {
        const c = UnitConverter.getCanonical(unit);
        const cat = UnitConverter.getUnitCategory(c);
        if (!cat) {
            return '';
        }
        const si = UnitConverter.baseUnit[cat];
        if (cat === 'time') {
            return (
                `Formula unit for this variable: ${c} (yr, s, …). Internally, time converts through seconds ` +
                `(Julian yr = 365.25×86400 s = ${JULIAN_YEAR_SECONDS} s).`
            );
        }
        if (cat === 'distance') {
            return (
                `This variable’s formula unit is ${c} (e.g. pc, AU, ly, m). Per-field hints (value × … → …) convert ` +
                `into that formula unit, not “into metres” unless this card uses m. AU, pc, ly, and m are linked ` +
                `via fixed SI lengths (IAU AU; parsec definition; ly = c×Julian yr).`
            );
        }
        if (cat === 'temperature') {
            return (
                `Kelvin (K) is an SI base unit (thermodynamic temperature). °C/°F convert through K. ` +
                `K is not a “time scale”; it does not relate to years or AU except in separate formulas.`
            );
        }
        if (cat === 'mass') {
            return `SI mass base: kilogram (kg). M☉ and M⊕ convert from fixed kg values.`;
        }
        if (cat === 'velocity') {
            return `SI velocity combines m and s: m/s. km/s and km/h convert through metres and seconds.`;
        }
        if (cat === 'energy') {
            return `SI energy base: joule (J). eV and erg convert to J.`;
        }
        if (cat === 'power') {
            return `SI power base: watt (W). L☉ and erg/s convert to W.`;
        }
        if (cat === 'frequency') {
            return (
                `SI frequency base: hertz (Hz) = 1/s. Astrophysical Hubble units km/(s·Mpc) share this ` +
                `dimension and convert using a fixed megaparsec length in metres.`
            );
        }
        if (cat === 'area') {
            return `Area base: m². km² and cm² convert by powers of ten.`;
        }
        if (cat === 'force') {
            return `Force base: newton (N). dyn (cgs) converts via 1 dyn = 10⁻⁵ N.`;
        }
        if (cat === 'pressure') {
            return `Pressure base: pascal (Pa). J/m³ has the same dimensions as Pa (energy density).`;
        }
        if (cat === 'magnetic_B') {
            return `Magnetic field base: tesla (T). Gauss: 1 G = 10⁻⁴ T.`;
        }
        if (cat === 'grav_G') {
            return `This is the SI-derived unit of Newton’s constant G (m³·kg⁻¹·s⁻²).`;
        }
        if (cat === 'sigma_sb') {
            return `Stefan–Boltzmann constant σ carries units W·m⁻²·K⁻⁴.`;
        }
        if (cat === 'angle') {
            return `SI plane angle base: radian (rad). Degrees, arcminutes, and arcseconds convert via π/180 and factors of 60.`;
        }
        if (cat === 'angular_speed') {
            return `Angular speed base: rad/s. deg/s converts via π/180.`;
        }
        if (cat === 'angular_momentum') {
            return `Angular momentum uses J·s (same dimensions as kg·m²/s). erg·s converts via 10⁻⁷ J/erg.`;
        }
        if (cat === 'acceleration') {
            return `Acceleration base: m/s². cm/s² converts via 0.01.`;
        }
        if (cat === 'density') {
            return `SI mass/volume uses kg and m³.`;
        }
        if (cat === 'flux') {
            return `Radiative flux here converts to W/m² (SI).`;
        }
        if (cat === 'dimensionless') {
            return (
                `This variable is dimensionless (ratios, magnitudes, etc.). It is not length, time, or temperature—` +
                `do not mix with metres, seconds, or kelvins unless the formula explicitly combines them.`
            );
        }
        return `SI base for this category: ${si}.`;
    }

    /**
     * FIXED: Convert value from one unit to another
     * CRITICAL: Prefers direct conversions, handles temperature correctly, avoids broken chaining
     */
    static convert(value, fromUnit, toUnit) {
        if (typeof value !== 'number' || !isFinite(value)) {
            UnitConverter._logWarn(`convert: Invalid value ${value}, expected finite number`);
            return null;
        }
        
        if (!fromUnit || !toUnit) {
            return value;
        }
        
        const from = UnitConverter.getCanonical(fromUnit);
        const to = UnitConverter.getCanonical(toUnit);
        
        if (from === to) return value;

        const catFrom = UnitConverter.unitCategory[from];
        const catTo = UnitConverter.unitCategory[to];

        // Must be same category (or compatible)
        if (!catFrom || !catTo || catFrom !== catTo) {
            // Special case: energy and power are related (J and W)
            if ((catFrom === 'energy' && catTo === 'power') || (catFrom === 'power' && catTo === 'energy')) {
                // Allow conversion between energy and power (they're dimensionally related)
                // This is a special case - normally we'd use dimensional analysis
            } else {
                UnitConverter._logWarn(`Cannot convert ${from} (${catFrom}) to ${to} (${catTo}) - incompatible categories`);
                return null;
            }
        }

        // Temperature special handling (offset-based, cannot use linear chaining)
        if (catFrom === 'temperature') {
            return UnitConverter._convertTemperature(value, from, to);
        }

        // Linear conversion via base unit
        const base = UnitConverter.baseUnit[catFrom];
        if (!base) {
            UnitConverter._logWarn(`No base unit defined for category: ${catFrom}`);
            return null;
        }
        
        // Convert from -> base
        const valueInBase = from === base ? value : value * (UnitConverter.conversionFactors[from] || 1);
        
        // Convert base -> to
        const factorTo = to === base ? 1 : 1 / (UnitConverter.conversionFactors[to] || 1);
        
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
            UnitConverter._logWarn(`Unknown temperature unit: ${from}`);
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
            UnitConverter._logWarn(`Unknown temperature unit: ${to}`);
            return kelvin;
        }
    }

    /**
     * Convert a value from any unit to the base unit
     * BACKWARD COMPATIBILITY: Required by CalculationOrchestrator
     */
    static convertToBase(value, fromUnit, baseUnit) {
        if (typeof value !== 'number' || !isFinite(value)) {
            UnitConverter._logWarn(`convertToBase: Invalid value ${value}`);
            return value;
        }
        
        if (!fromUnit || !baseUnit) {
            return value;
        }
        
        const canonicalFrom = UnitConverter.getCanonical(fromUnit);
        const canonicalBase = UnitConverter.getCanonical(baseUnit);
        
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
        const catFrom = UnitConverter.getUnitCategory(canonicalFrom);
        const catBase = UnitConverter.getUnitCategory(canonicalBase);
        
        // Temperature requires special handling
        if (catFrom === 'temperature' || catBase === 'temperature') {
            return UnitConverter._convertTemperature(value, canonicalFrom, canonicalBase);
        }
        
        // Must be same category
        if (!catFrom || !catBase || catFrom !== catBase) {
            UnitConverter._logWarn(`convertToBase: Incompatible categories: ${catFrom} → ${catBase}`);
            return value;
        }

        // Delegate to convert() so the formula "base" unit can be any canonical unit in the
        // category (e.g. pc, ly, AU), not only the SI category base (m). Previously this
        // only multiplied by factors to meters, which broke pc-based formulas and wrong UI hints.
        const converted = UnitConverter.convert(value, fromUnit, baseUnit);
        if (converted === null || !isFinite(converted)) {
            UnitConverter._logWarn(`convertToBase: convert() failed for ${fromUnit} → ${baseUnit}`);
            return value;
        }
        return converted;
    }

    /**
     * Short hint for UI: how a numeric value in `fromUnit` maps to `baseUnit`.
     * Non-base fields should show the applied multiplier (not an implicit ×1).
     */
    static getConversionHintToBase(fromUnit, baseUnit) {
        if (!fromUnit || !baseUnit) return '';
        const cFrom = UnitConverter.getCanonical(fromUnit);
        const cBase = UnitConverter.getCanonical(baseUnit);
        if (!cFrom || !cBase || cFrom === cBase) return '';

        const catFrom = UnitConverter.getUnitCategory(cFrom);
        const catBase = UnitConverter.getUnitCategory(cBase);
        const baseLabel = UnitConverter.formatUnit(baseUnit);
        const targetPhrase =
            baseLabel && baseLabel !== cBase ? `${cBase} (${baseLabel})` : cBase;

        if (catFrom === 'temperature' && catBase === 'temperature' && cBase === 'K') {
            if (cFrom === '°C') return `value × 1 + 273.15 → ${targetPhrase}`;
            if (cFrom === '°F') return `(value + 459.67) × 5/9 → ${targetPhrase}`;
        }

        if (!catFrom || !catBase || catFrom !== catBase) return '';

        const factor = UnitConverter.convert(1, fromUnit, baseUnit);
        if (typeof factor !== 'number' || !isFinite(factor)) return '';

        const fmt =
            Math.abs(factor) >= 1e8 || (Math.abs(factor) < 1e-6 && factor !== 0)
                ? factor.toExponential(6)
                : Number(factor.toPrecision(12)).toString();
        return `value × ${fmt} → ${targetPhrase}`;
    }

    /**
     * Get alternative units for a given base unit
     * BACKWARD COMPATIBILITY: Required by UI components
     */
    static getAlternativeUnits(baseUnit) {
        if (baseUnit == null || String(baseUnit).trim() === '') {
            return [];
        }
        const raw = String(baseUnit).trim();
        const normalized =
            typeof UnitConverter.normalizeFormulaUnit === 'function' ? UnitConverter.normalizeFormulaUnit(raw) : raw;
        const canonical = UnitConverter.getCanonical(normalized || raw);
        const category = UnitConverter.unitCategory[canonical];

        if (!category) {
            return [canonical];
        }

        const alternatives = Object.entries(UnitConverter.unitCategory)
            .filter(([, cat]) => cat === category)
            .map(([unit]) => unit);

        const result = [canonical, ...alternatives.filter((u) => u !== canonical)];
        return [...new Set(result)];
    }

    /**
     * Convert and format a value with its unit.
     * By default may pick a friendlier unit in the same category (e.g. m → km).
     * For formula-defined quantities, pass `{ formulaUnit: true }` so the declared
     * unit from the formula is kept (pc, M☉, yr, …), not the universal SI base.
     *
     * @param {*} value
     * @param {string} unit - Declared unit the value is expressed in (formula base for that variable)
     * @param {object|string} [options] - If string, treated as legacy: convert `value` from `unit` to this target unit
     * @param {boolean} [options.formulaUnit] - Keep display in `unit` (no auto pick)
     * @param {boolean} [options.lockDeclaredUnit] - Same as formulaUnit
     */
    static convertAndFormat(value, unit, options = {}) {
        if (typeof options === 'string') {
            const toUnit = options;
            const c = UnitConverter.convert(value, unit, toUnit);
            if (c !== null && Number.isFinite(c)) {
                return {
                    value: c,
                    unit: UnitConverter.getCanonical(toUnit),
                    original: { value, unit }
                };
            }
            return { value, unit: UnitConverter.getCanonical(unit), original: { value, unit } };
        }

        const opts = options && typeof options === 'object' ? options : {};
        const keepDeclared =
            opts.formulaUnit === true ||
            opts.lockDeclaredUnit === true ||
            opts.skipAutoUnitSelection === true;

        const canonical = UnitConverter.getCanonical(unit);
        const category = UnitConverter.getUnitCategory(canonical);

        if (!category) {
            return { value, unit: canonical, original: { value, unit } };
        }

        if (keepDeclared) {
            return {
                value,
                unit: canonical,
                original: { value, unit }
            };
        }

        const alternatives = UnitConverter.getAlternativeUnits(canonical);

        let bestUnit = canonical;
        let bestValue = value;

        for (const altUnit of alternatives) {
            if (altUnit === canonical) continue;

            const converted = UnitConverter.convert(value, canonical, altUnit);
            if (converted !== null && isFinite(converted)) {
                const absConverted = Math.abs(converted);
                const absBest = Math.abs(bestValue);

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
            original: { value, unit }
        };
    }

    /**
     * Format unit nicely
     */
    static formatUnit(unit) {
        const canonical = UnitConverter.getCanonical(unit);
        const names = {
            // Distance
            'm': 'meters', 'km': 'kilometers', 'cm': 'centimeters', 'mm': 'millimeters',
            'μm': 'micrometers', 'nm': 'nanometers',
            'AU': 'Astronomical Units', 'pc': 'parsecs', 'ly': 'light-years', 'Mpc': 'megaparsecs',
            'Å': 'ångströms', 'R☉': 'Solar Radii',
            
            // Mass
            'kg': 'kilograms', 'g': 'grams', 'M☉': 'Solar Masses', 'M_earth': 'Earth Masses',
            
            // Time
            's': 'seconds', 'min': 'minutes', 'h': 'hours', 'day': 'days', 'yr': 'years',
            
            // Temperature
            'K': 'Kelvin', '°C': 'Celsius', '°F': 'Fahrenheit',
            
            // Velocity
            'm/s': 'meters per second', 'km/s': 'kilometers per second', 'km/h': 'kilometers per hour',
            'rad/s': 'radians per second', 'deg/s': 'degrees per second',
            
            // Energy/Power
            'W': 'Watts', 'J': 'Joules', 'J·s': 'joule-seconds (angular momentum)', 'erg': 'ergs', 'erg·s': 'erg-seconds',
            'eV': 'electron-volts',
            'L☉': 'Solar Luminosities', 'erg/s': 'ergs per second',
            
            // Flux
            'W/m²': 'Watts per square meter', 'erg/(s·cm²)': 'ergs per second per cm²',
            
            // Frequency / Hubble
            'Hz': 'Hertz',
            'kHz': 'kilohertz',
            'MHz': 'megahertz',
            'GHz': 'gigahertz',
            'km/(s·Mpc)': 'km per second per megaparsec (Hubble unit)',
            
            // Area / mechanics / EM / constants
            'm²': 'square meters',
            'km²': 'square kilometers',
            'cm²': 'square centimeters',
            'N': 'Newtons',
            'dyn': 'dynes',
            'Pa': 'Pascals',
            'J/m³': 'joules per cubic meter',
            'T': 'Tesla',
            'G': 'Gauss',
            'm³/(kg·s²)': 'SI unit of gravitational constant G',
            'W/(m²·K⁴)': 'Stefan–Boltzmann σ coefficient unit',
            
            // Density
            'kg/m³': 'kg/m³', 'g/cm³': 'g/cm³',
            
            // Acceleration
            'm/s²': 'meters per second squared', 'cm/s²': 'centimeters per second squared',
            
            // Angles
            'rad': 'radians', 'deg': 'degrees', 'arcmin': 'arcminutes', 'arcsec': 'arcseconds',
            
            // Other
            'mag': 'magnitudes',
            'dimensionless': 'dimensionless (pure number)'
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
            for (const [unit, cat] of Object.entries(UnitConverter.unitCategory)) {
                if (!categoryMap[cat]) {
                    categoryMap[cat] = [];
                }
                categoryMap[cat].push(unit);
            }
            return categoryMap;
        }
        
        return Object.entries(UnitConverter.unitCategory)
            .filter(([unit, cat]) => cat === category)
            .map(([unit]) => unit);
    }

    /**
     * Get conversions for a unit (for display/formatting)
     * BACKWARD COMPATIBILITY: May be used by some components
     * DERIVED from conversionFactors (single source of truth)
     */
    static getConversions(unit, context = undefined) {
        const canonical = UnitConverter.getCanonical(unit);
        const category = UnitConverter.getUnitCategory(canonical);
        
        if (!category) {
            return null;
        }
        
        const base = UnitConverter.baseUnit[category];
        const alternatives = UnitConverter.getAlternativeUnits(canonical);
        
        // Generate conversion list from conversionFactors
        const conversions = [];
        for (const altUnit of alternatives) {
            if (altUnit === canonical) continue;
            
            // Calculate factor: canonical -> altUnit
            const factor = UnitConverter.convert(1, canonical, altUnit);
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

    /**
     * Instance delegates (FormulaCalculator and shims may use `new UnitConverter()`).
     * Static methods stay the source of truth; instances forward so `.getCanonical` etc. never appear missing.
     */
    getCanonical(unit) {
        return UnitConverter.getCanonical(unit);
    }

    convert(value, fromUnit, toUnit) {
        return UnitConverter.convert(value, fromUnit, toUnit);
    }

    convertToBase(value, fromUnit, baseUnit) {
        return UnitConverter.convertToBase(value, fromUnit, baseUnit);
    }

    getAlternativeUnits(baseUnit) {
        return UnitConverter.getAlternativeUnits(baseUnit);
    }

    getUnitCategory(unit) {
        return UnitConverter.getUnitCategory(unit);
    }

    formatUnit(unit) {
        return UnitConverter.formatUnit(unit);
    }

    formatNumber(value, options) {
        return UnitConverter.formatNumber(value, options);
    }

    getConversionHintToBase(fromUnit, baseUnit) {
        return UnitConverter.getConversionHintToBase(fromUnit, baseUnit);
    }

    convertAndFormat(value, unit, options) {
        return UnitConverter.convertAndFormat(value, unit, options);
    }

    getSiBaseContextForUnit(unit) {
        return UnitConverter.getSiBaseContextForUnit(unit);
    }

    normalizeFormulaUnit(unit) {
        return UnitConverter.normalizeFormulaUnit(unit);
    }
}

// Ensure ES-module / embedded runtimes see the same global as classic `<script>` tags.
if (typeof globalThis !== 'undefined') {
    globalThis.UnitConverter = UnitConverter;
}
if (typeof window !== 'undefined') {
    window.UnitConverter = UnitConverter;
}
