# Calculator Input Specification

## Overview

This document defines the **complete input format specification** for the AstroCalc scientific calculator. The system uses a universal scientific calculator approach with automatic unit conversion, expression parsing, and implicit multiplication support.

---

## 1. Numeric Input Formats

### 1.1 Simple Numbers
- **Integers**: `2`, `100`, `-5`, `0`
- **Decimals**: `3.14`, `0.001`, `-2.5`, `.5`
- **Scientific Notation**: `1e10`, `2.5e-3`, `1.989e30`, `-1.5e-6`

**Examples:**
```
2
3.14159
-5.5
1.5e11
2.5e-3
```

---

## 2. Mathematical Expressions

### 2.1 Basic Operations
- **Addition**: `5+3`, `x+2`
- **Subtraction**: `10-2`, `x-5`
- **Multiplication**: `2*3`, `5*x` (explicit `*` required)
- **Division**: `10/2`, `x/5`

### 2.2 Power Operations
- **Exponentiation**: `2^3`, `10**2`, `r^2`
  - ⚠️ **Important**: `^` is **custom-parsed as exponentiation** (not JavaScript's bitwise XOR)
  - `**` is the native JavaScript exponentiation operator
  - Both are normalized to `**` internally

**Examples:**
```
2^3        → 8
10**2      → 100
r^2        → r²
(2+3)^2    → 25
```

### 2.3 Implicit Multiplication
- **Supported patterns**:
  - Number followed by variable: `2pi`, `3G`, `4π`
  - Variable followed by variable: `GM`, `rM` (when both are known)
  - Number followed by parentheses: `3(x+1)`, `2(5+3)`
  - Variable followed by parentheses: `x(y+2)`

**Examples:**
```
2GM        → 2*G*M
4π         → 4*π
3(x+1)     → 3*(x+1)
(2+3)(5-1) → (2+3)*(5-1)
```

**Note**: Implicit multiplication is expanded **before** evaluation, enabling formulas like `2GM/r` to work correctly.

---

## 3. Mathematical Constants

### 3.1 Supported Constants
- **`pi`** or **`π`** → `Math.PI` (3.141592653589793...)
- **`e`** → `Math.E` (2.718281828459045...)

**Examples:**
```
pi         → 3.14159...
π          → 3.14159...
e          → 2.71828...
2*pi       → 6.28318...
e^2        → 7.38905...
```

---

## 4. Scientific Functions

### 4.1 Trigonometric Functions
- **`sin(x)`** → `Math.sin(x)` (radians)
- **`cos(x)`** → `Math.cos(x)` (radians)
- **`tan(x)`** → `Math.tan(x)` (radians)
- **`asin(x)`** → `Math.asin(x)` (returns radians)
- **`acos(x)`** → `Math.acos(x)` (returns radians)
- **`atan(x)`** → `Math.atan(x)` (returns radians)

**Examples:**
```
sin(pi/2)  → 1
cos(0)     → 1
tan(pi/4)  → 1
asin(1)    → 1.5708... (π/2)
```

### 4.2 Logarithmic Functions
- **`log(x)`** → `Math.log10(x)` ⚠️ **Custom behavior: base-10**
- **`log10(x)`** → `Math.log10(x)` (base-10)
- **`log2(x)`** → `Math.log2(x)` (base-2)
- **`ln(x)`** → `Math.log(x)` (natural log, base-e)

**⚠️ Critical Note**: 
- In **native JavaScript**, `Math.log(x)` is the **natural logarithm** (base-e).
- In **this calculator**, `log(x)` is **custom-parsed to mean base-10** (scientific calculator standard).
- Use `ln(x)` explicitly for natural logarithm.

**Examples:**
```
log(100)   → 2        (base-10: 10² = 100)
log10(100) → 2        (base-10: 10² = 100)
log2(8)    → 3        (base-2: 2³ = 8)
ln(e)      → 1        (natural log: e¹ = e)
```

### 4.3 Other Functions
- **`sqrt(x)`** or **`√(x)`** → `Math.sqrt(x)` (square root)
- **`exp(x)`** → `Math.exp(x)` (e^x)
- **`pow(x, y)`** → `Math.pow(x, y)` (x^y)
- **`abs(x)`** → `Math.abs(x)` (absolute value)
- **`floor(x)`** → `Math.floor(x)` (round down)
- **`ceil(x)`** → `Math.ceil(x)` (round up)
- **`round(x)`** → `Math.round(x)` (nearest integer)

**Examples:**
```
sqrt(16)        → 4
√(25)           → 5
exp(2)          → 7.38905...
pow(2, 3)       → 8
abs(-5)         → 5
floor(3.7)      → 3
ceil(3.2)       → 4
round(3.5)      → 4
```

---

## 5. Fractions

### 5.1 Simple Fractions
- **`1/2`**, **`3/4`**, **`5/3`**

### 5.2 Fractions with Constants
- **`pi/4`**, **`2*pi/3`**, **`e/2`**

**Examples:**
```
1/2        → 0.5
pi/4       → 0.785398...
2*pi/3     → 2.09439...
```

---

## 6. Angle Input (with Automatic Conversion)

### 6.1 Supported Formats
- **Degrees**: `90°`, `45deg`, `180 degrees`
- **Radians**: `pi/2`, `1.5708` (when unit is radians)

**Automatic Conversion**:
- If the formula expects **radians** and you input **degrees**, conversion is automatic.
- If the formula expects **degrees** and you input **radians**, conversion is automatic.

**Examples:**
```
90°        → 1.5708... (if formula expects radians)
pi/2       → 90 (if formula expects degrees)
45deg      → 0.7854... (if formula expects radians)
```

---

## 7. Unknown/Empty Values

### 7.1 Supported Formats
- **Empty field**: `""` (blank input)
- **Explicit null**: `null`
- **N/A variants**: `N/A`, `na`, `NA`, `idk`

**Behavior**:
- These values indicate **"solve for this variable"**
- The calculator will attempt to solve for the unknown variable algebraically or numerically.

**Examples:**
```
""         → Unknown (solve for this)
null       → Unknown
N/A        → Unknown
na         → Unknown
idk        → Unknown
```

---

## 8. Unit-Aware Input

### 8.1 Automatic Unit Conversion
- Input values are **automatically converted** to the formula's **base unit**.
- The system reads the `data-unit` attribute from input fields.
- Conversion happens **before** calculation.

**Examples:**
```
Input: 12 km
Formula expects: meters (m)
Result: 12000 m (converted automatically)

Input: 2 days
Formula expects: seconds (s)
Result: 172800 s (converted automatically)
```

### 8.2 Unit Conversion Process
1. Parse numeric value from input
2. Read unit from input field (`data-unit` attribute)
3. Convert to formula's base unit using `UnitConverter`
4. Use converted value in calculation

---

## 9. Complex Nested Expressions

### 9.1 Supported Nesting
- **Parentheses**: `(2+3)*4`, `sin(pi/2)`
- **Nested functions**: `sqrt(sin(pi/2))`, `log10(exp(2))`
- **Mixed operations**: `2*pi*r + 3*G*M/r^2`

**Examples:**
```
(2+3)*4              → 20
sin(pi/2)            → 1
sqrt(sin(pi/2))      → 1
log10(exp(2))        → 0.8686...
2*pi*6371000         → 40030173.59...
-2.76*log10(2) - 1.4 → -2.23...
```

---

## 10. Processing Pipeline

### 10.1 Input Processing Flow
```
User Input
    ↓
1. Expression Parsing (ExpressionParser.parse)
    - Normalize Unicode operators (× → *, ÷ → /)
    - Parse numeric values, expressions, constants
    - Handle angle conversion (degrees ↔ radians)
    ↓
2. Implicit Multiplication Expansion
    - Expand 2GM → 2*G*M
    - Expand 4π → 4*π
    - Expand 3(x+1) → 3*(x+1)
    ↓
3. Scientific Function Normalization
    - Normalize all functions to Math.* format
    - log(x) → Math.log10(x)
    - sin(x) → Math.sin(x)
    - sqrt(x) → Math.sqrt(x)
    ↓
4. Unit Conversion
    - Convert input unit to formula's base unit
    - Validate conversion succeeded
    ↓
5. Validation
    - Reject NaN, Infinity
    - Ensure finite numbers
    - Validate syntax
    ↓
6. Calculation
    - Substitute variables and constants
    - Evaluate using universal scientific calculator (Math.*)
    - Return numeric result
```

### 10.2 Validation Rules
- ✅ **Accepts**: Finite numbers, valid expressions, proper syntax
- ❌ **Rejects**: 
  - `NaN` (Not a Number)
  - `Infinity` or `-Infinity`
  - Syntactically invalid expressions
  - Division by zero (caught during evaluation)
  - Invalid function calls

---

## 11. Error Handling

### 11.1 Common Errors
- **Invalid syntax**: `2++3`, `sin(`, `log()`
- **Undefined variables**: Using variables not in the formula
- **Unit conversion failure**: Incompatible units
- **Division by zero**: Caught during evaluation
- **Invalid function arguments**: `sqrt(-1)` (in real numbers)

### 11.2 Error Messages
- Clear, user-friendly error messages
- Points to the specific input field causing the issue
- Suggests valid input formats

---

## 12. Examples

### 12.1 Simple Calculation
```
Input: P = 2
Formula: M_V = -2.76 * log10(P) - 1.4
Result: M_V = -2.23
```

### 12.2 With Unit Conversion
```
Input: r = 12 km
Formula: v = sqrt(2GM/r)  (expects meters)
Process: 12 km → 12000 m
Result: v = [calculated value]
```

### 12.3 With Expression
```
Input: θ = 90°
Formula: sin(θ)  (expects radians)
Process: 90° → π/2 radians
Result: sin(π/2) = 1
```

### 12.4 Solving for Unknown
```
Input: M = 5.97e24, r = 6.37e6, v = [empty]
Formula: v = sqrt(2GM/r)
Result: v = 11186 m/s (solved for v)
```

---

## 13. Implementation Notes

### 13.1 Custom Behaviors
- **`log(x)` means base-10** (not natural log like JavaScript's `Math.log`)
- **`^` is exponentiation** (not bitwise XOR)
- **Implicit multiplication** is supported (unlike standard JavaScript)

### 13.2 Universal Scientific Calculator
- All functions normalize to `Math.*` format
- Consistent evaluation across all formulas
- Multiple fallback evaluators for robustness

---

## 14. Testing Recommendations

### 14.1 Edge Cases to Test
- Very large numbers: `1e30`, `1e-30`
- Negative numbers: `-5`, `-3.14`
- Zero: `0`
- Fractions: `1/3`, `22/7`
- Nested expressions: `sqrt(sin(pi/2))`
- Implicit multiplication: `2GM`, `4πr²`
- Unit conversions: `12 km → m`, `2 days → s`
- Angle conversions: `90° → radians`, `pi/2 → degrees`

### 14.2 Invalid Inputs to Test
- `NaN`, `Infinity`
- Empty strings in required fields
- Invalid syntax: `2++3`, `sin(`
- Undefined variables
- Incompatible units

---

## Summary

The calculator accepts:
- ✅ Numbers (integers, decimals, scientific notation)
- ✅ Mathematical expressions (+, -, *, /, ^, **)
- ✅ Constants (pi, e, π)
- ✅ Scientific functions (sin, cos, log, sqrt, etc.)
- ✅ Implicit multiplication (2GM, 4π, 3(x+1))
- ✅ Fractions (1/2, pi/4)
- ✅ Angles with automatic conversion (90°, pi/2)
- ✅ Unit-aware values (auto-converted to base units)
- ✅ Unknown values (empty, null, N/A for solving)

The system uses a **universal scientific calculator approach** with automatic normalization, unit conversion, and robust error handling.

