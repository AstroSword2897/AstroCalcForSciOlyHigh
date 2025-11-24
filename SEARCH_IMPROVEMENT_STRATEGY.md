# Strategic Search Improvement Plan

## Overview
This document outlines a comprehensive strategy to improve natural language question matching across ALL formula categories in AstroCalc.

## Current State Analysis

### Statistics
- **Total Formulas:** ~193
- **Formulas with questionPatterns:** ~128 (66%)
- **Formulas missing questionPatterns:** ~65 (34%)
- **Search System Components:**
  1. Question pattern matching (ui.js)
  2. Concept-based matching
  3. Keyword matching
  4. Semantic similarity
  5. Hierarchical concept expansion

### Identified Gaps

1. **Missing Question Patterns**
   - Binary white dwarf formulas
   - Orbital energy formula
   - Many specialized formulas
   - Transit depth and exoplanet formulas
   - Extinction/magnitude formulas

2. **Limited Question Variations**
   - Current patterns are too specific
   - Missing common question phrasings
   - Not handling "what is", "calculate", "find", "determine" variations
   - Missing context-aware matching (e.g., "period of white dwarves" vs "period of planet")

3. **Graph Support Gaps**
   - Many formulas lack graph visualizations
   - No graphs for binary systems
   - Missing specialized visualizations

## Strategic Approach

### Phase 1: Comprehensive Question Pattern Addition

#### Strategy for Each Formula Category

1. **Orbital Mechanics (32 formulas)**
   - Add patterns for: period, velocity, energy, decay, merger
   - Include variations: "what is", "calculate", "find", "how long", "how fast"
   - Context-aware: "white dwarf period" vs "planet period"

2. **Radiation & Stellar Properties (24 formulas)**
   - Temperature questions: "what is temperature", "temperature of", "how hot"
   - Magnitude questions: "apparent magnitude", "absolute magnitude", "magnitude from"
   - Luminosity questions: "how bright", "luminosity of", "energy output"

3. **Cosmology & Relativity (26 formulas)**
   - Redshift questions: "redshift", "how fast moving", "velocity from redshift"
   - Distance questions: "distance to", "how far", "parallax"
   - Time questions: "lookback time", "age of universe"

4. **Doppler & Spectroscopy (8 formulas)**
   - Velocity questions: "radial velocity", "how fast", "velocity from spectrum"
   - Wavelength questions: "wavelength shift", "doppler shift"

5. **Planetary Science & Exoplanets (7 formulas)**
   - Transit questions: "transit depth", "planet size", "inclination"
   - Temperature questions: "planet temperature", "equilibrium temperature"

6. **High Energy Astrophysics (7 formulas)**
   - Specialized patterns for synchrotron, cooling, gamma factors

7. **Stellar Structure (13 formulas)**
   - Pressure, temperature, lifetime questions

8. **Telescopes & Optics (7 formulas)**
   - Resolution, magnification, light gathering questions

### Phase 2: Enhanced Question Pattern Matching

#### Improvements to ui.js matchQuestionToFormula()

1. **Multi-word Pattern Matching**
   - Match partial patterns: "period of white dwarves" → matches "period" + "white dwarf"
   - Weight by specificity: exact matches > partial matches

2. **Context Extraction**
   - Extract object type: "white dwarf", "planet", "star", "galaxy"
   - Extract quantity: "period", "velocity", "energy", "temperature"
   - Match formula to context

3. **Question Type Detection**
   - "What is X" → find X
   - "Calculate X" → find X
   - "How long until X" → time-related
   - "How fast is X" → velocity-related
   - "What is the rate of X" → derivative/rate

4. **Directionality Recognition**
   - "Find X from Y" vs "Find Y from X"
   - Match to formula's primaryUseCase

### Phase 3: Graph Support Enhancement

1. **Add Graph Support for Missing Formulas**
   - Binary systems: orbital period vs separation
   - Orbital energy: energy vs separation
   - Merger timescale: time vs separation
   - Transit depth: depth vs inclination

2. **Specialized Visualizations**
   - Radial velocity curves
   - Light curves
   - HR diagrams

## Implementation Plan

### Step 1: Add Question Patterns to All Formulas
- [ ] Binary white dwarf formulas (3 formulas)
- [ ] Orbital energy formula
- [ ] Transit depth and exoplanet formulas
- [ ] Extinction/magnitude formulas
- [ ] All other missing formulas

### Step 2: Enhance Question Pattern Matching
- [ ] Improve multi-word matching
- [ ] Add context extraction
- [ ] Add question type detection
- [ ] Improve directionality recognition

### Step 3: Add Graph Support
- [ ] Binary system graphs
- [ ] Energy graphs
- [ ] Transit graphs
- [ ] Other specialized graphs

### Step 4: Testing
- [ ] Test with example questions from images
- [ ] Test with various phrasings
- [ ] Verify graph functionality

## Question Pattern Template

For each formula, add patterns covering:

```javascript
questionPatterns: [
    // Direct questions
    "what is [quantity]",
    "calculate [quantity]",
    "find [quantity]",
    "determine [quantity]",
    
    // How questions
    "how [adjective] is [object]",
    "how long until [event]",
    "how fast is [object]",
    
    // Context-specific
    "[quantity] of [object]",
    "[quantity] from [input]",
    
    // Specialized
    "[formula-specific patterns]"
]
```

## Examples

### Binary White Dwarf Period
```javascript
questionPatterns: [
    "what is the period of the white dwarves",
    "period of white dwarf binary",
    "orbital period white dwarf",
    "how long do white dwarves take to orbit",
    "white dwarf orbital period",
    "binary white dwarf period",
    "given total mass what is period"
]
```

### Orbital Energy
```javascript
questionPatterns: [
    "what is the total orbital energy",
    "orbital energy of system",
    "energy of orbit",
    "total energy binary system",
    "orbital energy calculation"
]
```

### Orbital Decay Rate
```javascript
questionPatterns: [
    "what is the rate of orbital decay",
    "orbital decay rate",
    "rate of orbital decay",
    "how fast is orbit shrinking",
    "orbital decay due to gravitational radiation"
]
```

### Merger Timescale
```javascript
questionPatterns: [
    "how long will it take to merge",
    "merger timescale",
    "time until merger",
    "how long until white dwarves merge",
    "merger time binary"
]
```

### Radial Velocity
```javascript
questionPatterns: [
    "how fast is the system moving",
    "radial velocity",
    "velocity from spectrum",
    "how fast from earth",
    "system velocity from earth"
]
```

### Temperature from Spectrum
```javascript
questionPatterns: [
    "what is the temperature of the white dwarfs",
    "temperature from spectrum",
    "temperature from light",
    "white dwarf temperature"
]
```

### Apparent Magnitude with Extinction
```javascript
questionPatterns: [
    "what is the apparent magnitude",
    "apparent magnitude with extinction",
    "magnitude after extinction",
    "apparent magnitude system"
]
```

### Transit Depth and Inclination
```javascript
questionPatterns: [
    "transit depth",
    "inclination from transit depth",
    "planet inclination",
    "transit depth inclination"
]
```

## Success Metrics

1. **Coverage:** 100% of formulas have question patterns
2. **Matching:** Questions from examples match correct formulas
3. **Ranking:** Correct formula appears in top 3 results
4. **Graphs:** All major formulas have graph support

## Next Steps

1. Implement question patterns for all missing formulas
2. Enhance question matching algorithm
3. Add graph support
4. Test and refine

