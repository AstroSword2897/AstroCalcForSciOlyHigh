# Manual Test Instructions

## Test: Period-Luminosity Relation Numeric Calculation

### Steps:

1. **Open the calculator**: http://localhost:8000

2. **Search for the formula**:
   - Click in the search box at the top
   - Type: "period luminosity cepheid"
   - Click on the formula card that appears

3. **Enter input value**:
   - Find the input field for "P" (Pulsation Period)
   - Enter: `2` (days)
   - Leave "M_V" (Absolute Visual Magnitude) empty

4. **Click Calculate button**

5. **Verify the result**:
   - ✅ **PASS**: You should see a **numeric result** like "M_V = -2.33" (or similar)
   - ❌ **FAIL**: If you see a symbolic expression like "M_V = -2.76 × log₁₀(2) - 1.4" instead of the computed number

### Expected Calculation:
- Formula: M_V = -2.76 × log₁₀(P) - 1.4
- With P = 2: M_V = -2.76 × log₁₀(2) - 1.4
- log₁₀(2) ≈ 0.3010
- M_V = -2.76 × 0.3010 - 1.4
- M_V ≈ -0.831 - 1.4
- **M_V ≈ -2.23** (approximately)

### Quick Console Test:

Open browser console (F12) and paste:

```javascript
// Find the formula
const formula = formulas.find(f => f.id === 'period_luminosity_relation_cepheid');
console.log('Formula:', formula?.name);

// Create calculator
const calculator = new FormulaCalculator(formula, {
    unitConverter: UnitConverter ? new UnitConverter() : null,
    mathEvaluator: SafeExpressionEvaluator || null
});

// Test with P = 2
const result = calculator.solve({ P: 2, M_V: null });
console.log('Result:', result);
console.log('Is numeric?', !result.isSymbolic && typeof result.result === 'number');
console.log('Value:', result.result);

// Expected: approximately -2.23
const expected = -2.76 * Math.log10(2) - 1.4;
console.log('Expected:', expected);
console.log('Match?', Math.abs(result.result - expected) < 0.01);
```

