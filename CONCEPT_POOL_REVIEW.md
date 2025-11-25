# Concept Pool Review

This document lists all concepts and terms used for concept extraction and matching in the FRQ support system.

## 1. Domain-Related Concepts (Auto-added when domain detected)

### Distance Domain
**Keywords:** distance, parallax, modulus, apparent magnitude, absolute magnitude, luminosity distance, angular size, redshift distance, extinction, how far, how distant, distance to, away from

**Related Concepts:** distance modulus, parallax, angular size, redshift, luminosity distance, angular diameter distance, comoving distance, extinction, apparent magnitude, absolute magnitude, standard candle

### Temperature Domain
**Keywords:** temperature, wien, wavelength, peak wavelength, spectrum peak, blackbody, stefan-boltzmann, luminosity, effective temperature, surface temperature, how hot, temperature of

**Related Concepts:** wien displacement law, stefan-boltzmann law, blackbody radiation, effective temperature, surface temperature, color temperature, spectral type, luminosity class

### Orbital Domain
**Keywords:** orbital, orbit, period, semi-major axis, kepler, orbital velocity, orbital energy, orbital decay, binary, eccentricity, periapsis, apoapsis, orbital distance, how does it orbit

**Related Concepts:** kepler third law, orbital period, semi-major axis, orbital velocity, orbital energy, vis viva, escape velocity, orbital decay, binary system, eccentricity

### Transit Domain
**Keywords:** transit, transit depth, inclination, orbital inclination, transit method, planet radius, star radius, impact parameter, transit duration

**Related Concepts:** transit depth, orbital inclination, semi-major axis, planet radius, star radius, impact parameter, transit duration, orbital period

### Magnitude Domain
**Keywords:** magnitude, apparent magnitude, absolute magnitude, brightness, flux, luminosity, distance modulus, extinction, absorption

**Related Concepts:** apparent magnitude, absolute magnitude, distance modulus, flux, luminosity, extinction, absorption, standard candle

### White Dwarf Domain
**Keywords:** white dwarf, white dwarf, wd, degenerate, chandrasekhar, white dwarf mass, white dwarf radius, white dwarf merger

**Related Concepts:** white dwarf, chandrasekhar limit, degenerate matter, white dwarf mass, white dwarf radius, white dwarf merger, type ia supernova

---

## 2. Compound Concepts (Extracted First - Preserves Context)

### Radiation and Emission Terms
- emission power
- synchrotron power
- radiation power
- radiative power
- blackbody radiation
- thermal radiation
- emission spectrum
- absorption spectrum
- emission line
- absorption line
- spectral line
- line profile

### Orbital Mechanics Terms
- orbital mechanics
- orbital motion
- orbital dynamics
- orbital period
- orbital velocity
- orbital energy
- orbital decay
- orbital distance

### Distance-Related Terms
- distance modulus
- luminosity distance
- angular diameter distance
- comoving distance
- standard candle
- cepheid
- supernova distance
- redshift distance

### Magnitude and Extinction Terms
- apparent magnitude
- absolute magnitude
- extinction
- absorption
- reddening

### Exoplanet and Transit Terms
- transit depth
- orbital inclination
- orbital distance
- semi-major axis
- transit method
- radial velocity
- exoplanet detection
- planet radius
- star radius
- impact parameter
- transit duration
- transit timing

### Binary and Multiple System Terms
- binary system
- multiple system
- triple system
- quadruple system
- binary star
- multiple star
- triple star
- quadruple star
- binary orbit
- multiple orbit
- triple orbit
- quadruple orbit
- binary separation
- multiple separation
- triple separation
- quadruple separation
- binary period
- multiple period
- triple period
- quadruple period

---

## 3. Single-Word Astrophysics Terms (Only if not part of compound)

### Basic Physics Terms
- orbital
- period
- velocity
- mass
- distance
- energy
- temperature
- luminosity
- magnitude
- binary
- stellar
- cosmological
- redshift
- parallax
- gravity
- force
- acceleration
- frequency
- wavelength
- spectrum
- radiation
- flux
- brightness
- radius
- density
- pressure
- evolution
- fusion
- nuclear

### Astronomical Objects
- black hole
- white dwarf
- neutron star
- pulsar
- quasar
- galaxy
- nebula
- supernova
- exoplanet
- planet
- star
- sun
- moon
- asteroid
- comet

### Scientists/Laws
- kepler
- hubble
- doppler
- wien
- stefan
- boltzmann
- saha
- chandrasekhar
- schwarzschild
- einstein
- relativistic
- quantum

### Other Terms
- transit
- inclination
- eccentricity
- orbital plane
- line of sight
- interstellar medium
- ism
- dust
- gas
- binary eccentricity
- multiple eccentricity
- triple eccentricity
- quadruple eccentricity

---

## 4. Concepts from Formula Definitions

All concepts defined in each formula's `concepts` array are also extracted if they appear in the question.

---

## 5. Variable Names and Descriptions

Variable names and descriptions from formula definitions are checked, and key terms are extracted:
- inclination
- orbital distance
- transit depth
- semi-major axis
- eccentricity
- radius
- period

---

## 6. Relationship Phrases

When these phrases are detected, variables are extracted:
- "in terms of"
- "as a function of"
- "expression for"
- "simplified expression"

---

## Notes

1. **Compound concepts are checked FIRST** - This preserves context (e.g., "emission power" is extracted as a unit, not "emission" + "power")

2. **Single words are only extracted if not part of a compound** - Prevents false matches

3. **Domain detection adds related concepts automatically** - When a domain is detected, all its related concepts are added to the search

4. **Concept hierarchy expansion** - Concepts are expanded through parent-child-sibling relationships in the concept hierarchy

5. **Formula concepts are dynamic** - Concepts from all 193+ formulas are checked dynamically

---

## Issues to Review

1. Are there missing compound concepts that should be added?
2. Are there single-word terms that are too generic and causing false matches?
3. Are domain-related concepts comprehensive enough?
4. Should certain terms be removed or restricted?

