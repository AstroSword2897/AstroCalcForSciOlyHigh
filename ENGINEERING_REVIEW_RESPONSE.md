# 🔥 Engineering Review Response & Fix Plan

## Executive Summary

This document addresses the comprehensive engineering review with prioritized fixes and implementation plan.

## Priority Classification

- **P0 (Critical)**: Breaks functionality, causes wrong answers, or system instability
- **P1 (High)**: Significantly improves accuracy, usability, or maintainability
- **P2 (Medium)**: Nice-to-have improvements and polish

---

## P0: Critical Fixes (Must Fix Now)

### 1. Unit System Implementation ⚠️ CRITICAL

**Problem**: User enters `50 km`, system treats as `50`, gives wrong answers silently.

**Solution**: Full unit parser + converter + dimensional analysis

**Implementation Plan**:
1. Create `UnitParser` class to extract units from input strings
2. Create `UnitConverter` with comprehensive unit database
3. Add dimensional analysis to prevent invalid operations
4. Integrate into `ExpressionParser` and `FormulaCalculator`

**Files to Create/Modify**:
- `scripts/unitParser.js` (NEW)
- `scripts/unitConverter.js` (ENHANCE)
- `scripts/dimensionalAnalysis.js` (NEW)
- `scripts/calculator.js` (INTEGRATE)
- `scripts/expressionParser.js` (INTEGRATE)

**Status**: 🚧 In Progress

---

### 2. Variable Constraints & Validation ⚠️ CRITICAL

**Problem**: No validation for negative radius, zero mass, invalid wavelength ranges.

**Solution**: Comprehensive constraint system

**Implementation Plan**:
1. Add `constraints` field to variable definitions
2. Implement constraint checking in `validateVariableValue()`
3. Add domain-specific range validation
4. Provide clear error messages

**Example Structure**:
```javascript
{
  symbol: 'r',
  constraints: {
    positive: true,
    nonzero: true,
    min: 0,
    max: Infinity,
    domainRanges: {
      'stellar_radius': { min: 6.96e6, max: 1e12 }, // meters
      'orbital_radius': { min: 1e6, max: 1e15 }
    }
  }
}
```

**Files to Modify**:
- `scripts/formulas.js` (ADD constraints)
- `scripts/calculator.js` (ENHANCE validation)

**Status**: 📋 Planned

---

### 3. Metadata Validation Script ⚠️ CRITICAL

**Problem**: One typo breaks entire system. No validation of metadata structure.

**Solution**: Comprehensive validation script

**Implementation Plan**:
1. Create `scripts/validateMetadata.js`
2. Validate:
   - Formula structure completeness
   - Variable definitions
   - Relationship bidirectional consistency
   - Concept hierarchy integrity
   - Constant definitions
   - Unused fields detection
3. Run on build/load

**Files to Create**:
- `scripts/validateMetadata.js` (NEW)
- `package.json` (ADD validation script)

**Status**: 📋 Planned

---

## P1: High Priority Improvements

### 4. Graph Engine Physical Limits

**Problem**: Graphs explode with extreme values, no log scale, no physical boundaries.

**Solution**: 
- Axis constraints based on physical limits
- Logarithmic scale option
- Visual error bands
- Adaptive sampling

**Status**: 📋 Planned

---

### 5. Domain Engine Override Table

**Problem**: Mixed queries break, no priority overrides.

**Solution**:
- Domain override table for keywords
- Multi-domain scoring with proportional confidence
- Context-aware domain detection

**Status**: 📋 Planned

---

### 6. Relationship Typing

**Problem**: All relationships treated identically.

**Solution**: Add relationship types:
- `derived-from`
- `requires`
- `inverse-of`
- `commonly-paired-with`
- `shares-variables-with`
- `used-in-frqs-together`

**Status**: 📋 Planned

---

### 7. FRQ Dynamic Chaining

**Problem**: FRQ guidance is static, can't chain multi-part solutions.

**Solution**:
- Parameterized FRQ templates
- Dynamic reasoning chains
- Multi-part binding (part b uses part a result)

**Status**: 📋 Planned

---

## P2: Medium Priority

### 8. Search Re-ranking
### 9. Expression Parsing Test Suite
### 10. UX Polish (inline descriptions, error messages, history, dark mode)

---

## Implementation Order

1. ✅ **Unit System** (P0) - STARTING NOW
2. **Constraints** (P0)
3. **Metadata Validator** (P0)
4. **Graph Limits** (P1)
5. **Domain Override** (P1)
6. **Relationship Typing** (P1)
7. **FRQ Chaining** (P1)
8. **Search Re-ranking** (P2)
9. **Expression Tests** (P2)
10. **UX Polish** (P2)

---

## Next Steps

Starting with **Unit System** implementation as it's the most critical for preventing wrong answers.

