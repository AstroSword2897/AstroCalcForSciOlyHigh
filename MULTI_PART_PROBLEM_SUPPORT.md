# Multi-Part Problem Support

## 🎯 Overview

The FRQ support system now handles **complex multi-part exam questions** with interconnected parts, graph-based problems, and calculus requirements (derivatives, chain rule, integration).

## ✨ Key Features

### 1. **Multi-Part Question Detection**

The system automatically detects:
- **Part letters**: a, b, c, d, e
- **References to previous parts**: "from part a", "using #16"
- **Interconnected problems**: Parts that build on each other

**Example:**
```
Question: "b. What is the total orbital energy of this system? (2)"
Detected:
- isMultiPart: true
- partLetter: 'b'
- referencesPrevious: true (may use results from part a)
```

### 2. **Graph-Based Problem Support**

Handles questions with graphs:
- **Radial velocity graphs**: Extract velocities, period, amplitude
- **Spectrum graphs**: Identify lines, wavelengths, shifts
- **Light curves**: Transit depth, duration, period

**Example:**
```
Question: "This is the radial velocity graph of a system of two white dwarves."
Detected:
- hasGraph: true
- graphType: 'radial_velocity'
Guidance: Extract Va, Vb, period P from graph
```

### 3. **Calculus Problem Support**

Detects and guides:
- **Derivative problems**: "rate of", "d/dt", "dr/dt"
- **Chain rule problems**: "dr/dt" when given "dE/dt"
- **Integration problems**: "how long", "merger time"

**Example:**
```
Question: "What is the rate of orbital decay?"
Detected:
- requiresDerivative: true
- requiresChainRule: true
Guidance: Use chain rule: dr/dt = (dr/dE) × (dE/dt)
```

### 4. **Formula Integration Guidance**

For multi-part problems, provides:
- Which formulas to use in sequence
- How to use results from previous parts
- Step-by-step calculation guidance

## 📊 Example: Complex Multi-Part Problem

### Question 16 (from exam)

**Part a:** "Given that the total mass of the system is 1.5 M⊙, what is the period of the white dwarves?"

**System Analysis:**
- Detects: Multi-part (part a), references graph (radial velocity)
- Extracts: Total mass given, need to find period
- Guidance:
  1. Extract velocities from radial velocity graph
  2. Use center of mass: MaVa + MbVb = 0
  3. Calculate total velocity: V = Va + Vb
  4. Use orbital geometry: d = VP/(2π)
  5. Apply Kepler's third law: (Ma+Mb) = d³/P²
  6. Solve for period P

**Part b:** "What is the total orbital energy of this system?"

**System Analysis:**
- Detects: Multi-part (part b), references previous (part a)
- Guidance:
  1. Use period from part a
  2. Use separation from part a (or calculate from period)
  3. Apply orbital energy: E = -GMaMb/(2a)
  4. Use masses from part a (or calculate from velocities)

**Part c:** "What is the rate of orbital decay of the two white dwarfs?"

**System Analysis:**
- Detects: Multi-part (part c), requires derivative, requires chain rule
- Guidance:
  1. Start with orbital energy: E = -GMaMb/(2a)
  2. Find dE/da = GMaMb/(2a²)
  3. Use chain rule: da/dt = (da/dE) × (dE/dt)
  4. da/dE = 2a²/(GMaMb) (inverse of dE/da)
  5. Multiply by given dE/dt formula
  6. Simplify to get da/dt

**Part d:** "How long will it take these two white dwarves to merge?"

**System Analysis:**
- Detects: Multi-part (part d), requires integration, uses part c
- Guidance:
  1. Use da/dt from part c
  2. Rearrange: dt/da = 1/(da/dt)
  3. Integrate: t = ∫[a₀ to 0] dt/da da
  4. For power-law: t ∝ a₀^4
  5. Calculate numerical value

**Part e:** "What type of supernova will this collision result in?"

**System Analysis:**
- Detects: Multi-part (part e), conceptual question
- Guidance: Type Ia supernova (white dwarf merger)

### Question 17

**Part a:** "How fast is the system moving from Earth?"

**System Analysis:**
- Detects: Graph-based (spectrum), requires redshift calculation
- Guidance:
  1. Identify spectral line from graph (e.g., Si II at 640nm)
  2. Find rest wavelength (e.g., 615nm)
  3. Calculate redshift: z = (λ_obs - λ_rest)/λ_rest
  4. For non-relativistic: v = c × z

**Part b:** "Is the value from (a.) reasonable?"

**System Analysis:**
- Detects: Multi-part (part b), references part a, uses parallax
- Guidance:
  1. Use velocity from part a
  2. Calculate distance using Hubble's law: d = v/H₀
  3. Compare with parallax distance: d = 1/p (in parsecs)
  4. Check if values are consistent

### Question 18

**Part a:** "What is the temperature of the white dwarfs?"

**System Analysis:**
- Detects: Graph-based (spectrum), uses Wien's law
- Guidance:
  1. Identify peak wavelength from spectrum (e.g., 14.5nm)
  2. Apply Wien's law: T = 2.898×10⁻³ / λ_max
  3. Calculate temperature

**Part b:** "What is the apparent magnitude of the system?"

**System Analysis:**
- Detects: Multi-part (part b), multi-step calculation
- Guidance:
  1. Use mass-radius relation for white dwarfs: R/R☉ = 0.012(M/M☉)^(-1/3)
  2. Calculate radii for both white dwarfs
  3. Use Stefan-Boltzmann: L = 4πR²σT⁴
  4. Calculate absolute magnitude from luminosity
  5. Use distance modulus: m = M + 5log₁₀(d) - 5
  6. Add extinction: A_V = 1.8 mag/kpc × d(kpc)
  7. Final: m_apparent = m + A_V

**Part c:** "How would it orbit the white dwarves?"

**System Analysis:**
- Detects: Conceptual question about orbital mechanics
- Guidance: Wide elliptical orbit around center of mass of both white dwarfs

**Part d:** "Provide a simplified expression for the inclination in terms of its orbital distance."

**System Analysis:**
- Detects: Application problem, requires expression, relationship problem
- Guidance: (Already covered in APPLICATION_PROBLEM_SUPPORT.md)

**Part e:** "What will be the temperature of the white dwarfs at the time of collision?"

**System Analysis:**
- Detects: Multi-part (part e), uses merger time from previous question
- Guidance:
  1. Use merger time from question 16 part d
  2. Apply cooling law (if applicable)
  3. Calculate final temperature

## 🔧 Technical Implementation

### Enhanced Question Analysis

```javascript
analyzeQuestionType(questionText) {
    // Detects:
    // - Multi-part questions (a, b, c, d, e)
    // - Graph-based questions (radial velocity, spectrum)
    // - Calculus requirements (derivative, chain rule, integration)
    // - References to previous parts
}
```

### Formula-Specific Enhancements

Enhanced formulas:
- `white_dwarf_orbital_decay`: Chain rule guidance
- `white_dwarf_merger_timescale`: Integration guidance
- `radial_velocity_wavelength`: Graph extraction guidance
- `transit_depth`: Multi-body system guidance

## ✅ Benefits

1. **Comprehensive Coverage**: Handles all types of exam questions
2. **Graph Support**: Extracts data from graphs automatically
3. **Calculus Guidance**: Step-by-step derivative and integration help
4. **Multi-Part Integration**: Connects related parts of problems
5. **Real Exam Ready**: Handles actual exam question formats

## 🚀 Usage

The system automatically:
- Detects multi-part questions
- Identifies graph requirements
- Provides calculus guidance
- Connects related parts
- Guides through complex derivations

**Works seamlessly with existing search and FRQ support!**

