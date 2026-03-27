# Unit Conversion Bug Analysis

## Problem
User reports:
- **Input**: `a = 12 kilometers`, `M = 2 solar masses`
- **Display**: `Known values: a = 12 meters, M = 2 kg`
- **Expected**: `Known values: a = 12000 meters, M = 3.978e30 kg`

## Root Cause Analysis

### Current Flow
1. User enters `12` in the `km` input field (which has `data-unit="km"`)
2. `parseInputValue()` reads `data-unit` attribute → should get `"km"`
3. `convertToBase(12, "km", "m")` should return `12000`
4. `formatKnownValue()` displays the value with base unit label

### Potential Issues

#### Issue 1: Wrong Input Field Being Read
If `resolveInputElement()` returns the base unit input field (meters) instead of the km input field, then:
- `data-unit` would be `"m"` (base unit)
- `inputUnit === baseUnit` → no conversion happens
- Result: `12` stays as `12` (meters)

#### Issue 2: Unit Not Being Read Correctly
If `input.getAttribute('data-unit')` returns `null` or empty:
- Falls back to `variable.unit` (base unit)
- `inputUnit === baseUnit` → no conversion happens
- Result: `12` stays as `12` (meters)

#### Issue 3: Conversion Happening But Wrong Value Stored
If conversion happens but the wrong value is stored in `knownVars`:
- Conversion: `12 km → 12000 m` ✅
- Storage: `knownVars.a = 12` ❌ (should be `12000`)
- Display: `a = 12 meters` ❌

## Solution

### Fix 1: Ensure Correct Input Field is Selected
`resolveInputElement()` should prioritize inputs with values in non-base units:
1. First, check all unit inputs for the variable
2. If multiple have values, prefer non-base unit inputs
3. Only use base unit input if it's the only one with a value

### Fix 2: Add Explicit Conversion Logging
Add detailed logging in `parseInputValue()` to track:
- Which input field was selected
- What `data-unit` value was read
- What the base unit is
- Whether conversion was needed
- What the converted value is

### Fix 3: Verify Unit Conversion Factors
Ensure `convertToBase()` has correct factors:
- `km → m`: `1000` ✅
- `M☉ → kg`: `1.989e30` ✅

### Fix 4: Display Verification
Add logging in `formatKnownValue()` to show:
- Input value before conversion
- Converted value
- Unit label being used

## Testing

Test cases:
1. Enter `12` in km input → should show `12000 meters`
2. Enter `2` in solar mass input → should show `3.978e30 kg`
3. Enter `12` in base unit input → should show `12 meters` (no conversion)
4. Enter values in multiple unit inputs → should use the first non-empty, prefer non-base

## Expected Console Output (After Fix)

```
[CalculationOrchestrator] parseInputValue for a:
  rawValue: "12"
  inputUnit: "km"
  baseUnit: "m"
  needsConversion: true
[CalculationOrchestrator] Converting a: 12 km → base unit (m)
[CalculationOrchestrator] ✅ Converted a: 12 km = 12000 m
[FormulaCalculator] formatKnownValue: a = 12000 m
```

