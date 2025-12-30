# AstroCalc Architecture - Multi-Step Solver

## Core Principle

> **Do NOT make FormulaCalculator smarter. Make something above it smarter.**

## Layer Architecture

### Layer 1: FormulaCalculator (FROZEN - DO NOT MODIFY)

**Role**: Atomic single-equation solver

**Responsibilities**:
- ✅ Algebraic isolation (linear, power, inverse, sign-aware)
- ✅ Symbolic fallback when values are missing
- ✅ Unicode physics notation handling
- ✅ Constant resolution
- ✅ Safe evaluation (no `Function`, no `eval`)
- ✅ Variable detection
- ✅ Exhaustive rearrangement discovery
    
**What it does NOT do**:
- ❌ Multi-step orchestration
- ❌ Context awareness
- ❌ Sanity checking
- ❌ Path explanation

**Status**: **FROZEN** - This is the trusted atomic solver. No algebra logic goes here.

---

### Layer 2: SolveContext (Memory & Traceability)

**Role**: Provides memory and traceability for multi-step problems

**Responsibilities**:
- Store known (initial) and derived (computed) variables
- Maintain execution trace
- Collect warnings
- Provide explanation hooks

**API**:
```javascript
const context = new SolveContext({ m: 2.5, d: 2.5, A: 0 });
context.get('m');           // Get variable value
context.set('M', 5.51, {   // Store derived value with metadata
    formula: 'distance_modulus',
    inputs: { m: 2.5, d: 2.5, A: 0 }
});
context.warn('Sanity check failed');
context.getAll();           // Get all variables
```

**Key Features**:
- Separates known from derived values
- Full traceability (what was computed when)
- Metadata attached to each derived value

---

### Layer 3: Explicit Solve Steps (No Guessing)

**Role**: Define intentional solve paths

**Format**:
```javascript
const steps = [
    {
        output: 'M',
        formulaId: 'distance_modulus',
        inputs: ['m', 'd', 'A'],
        sanity: (M) => M > -30 && M < 30,  // Optional sanity check
        description: 'Calculate absolute magnitude'
    },
    {
        output: 'L',
        formulaId: 'luminosity_absolute_magnitude',
        inputs: ['M'],
        sanity: (L) => L > 0,
        description: 'Calculate luminosity'
    }
];
```

**Key Principles**:
- ✅ Explicit - no inference, no guessing
- ✅ One formula per step
- ✅ Clear input/output dependencies
- ✅ Optional sanity checks per step
- ❌ No regex inference
- ❌ No silent wrong paths

---

### Layer 4: MultiStepSolver (Thin Orchestrator)

**Role**: Orchestrates execution - nothing else

**Responsibilities**:
- Validate step definitions
- Collect inputs from context
- Delegate to FormulaCalculator
- Apply sanity checks
- Store results in context
- Fail fast on errors

**What it does NOT do**:
- ❌ Algebra logic (delegates to FormulaCalculator)
- ❌ Guessing (requires explicit steps)
- ❌ Inference (requires explicit inputs)

**API**:
```javascript
const solver = new MultiStepSolver(formulas);
const context = new SolveContext({ m: 2.5, d: 2.5, A: 0 });
solver.solve(steps, context);
// context now contains all results
```

**Execution Flow**:
1. Validate step definition
2. Get formula from registry
3. Collect inputs from context
4. Delegate to FormulaCalculator
5. Validate result
6. Apply sanity check (if provided)
7. Store in context with metadata

---

## Why This Architecture?

### Problem A: Algebra Explosion (SOLVED)

**Before**: Adding patterns to `solveAlgebraic()` increases complexity exponentially

**After**: No algebra logic in MultiStepSolver - delegates to FormulaCalculator

### Problem B: No Global State Awareness (SOLVED)

**Before**: Solver knows about one equation, nothing about why it's called

**After**: SolveContext provides memory and traceability

### Problem C: No Multi-Step Explainability (SOLVED)

**Before**: Can solve a formula, cannot explain a solution path

**After**: Full trace in context.trace with metadata

---

## Usage Examples

### Example 1: Luminosity from Apparent Magnitude

```javascript
// Create context with initial values
const context = new SolveContext({
    m: 2.5,    // apparent magnitude
    d: 2.5,    // parsecs
    A: 0       // extinction
});

// Create solver
const solver = new MultiStepSolver(formulas);

// Execute solve plan
solver.solve(CommonSolvePlans.luminosityFromApparentMagnitude, context);

// Access results
console.log(context.get('L'));  // Luminosity
console.log(context.get('M'));  // Absolute magnitude
console.log(context.trace);     // Full execution trace
console.log(context.warnings);  // Any sanity warnings
```

### Example 2: Custom Solve Plan

```javascript
const customSteps = [
    {
        output: 'M',
        formulaId: 'distance_modulus',
        inputs: ['m', 'd'],
        sanity: (M) => M > -30 && M < 30,
        description: 'Calculate absolute magnitude'
    },
    {
        output: 'L',
        formulaId: 'luminosity_absolute_magnitude',
        inputs: ['M'],
        sanity: (L) => L > 0,
        description: 'Calculate luminosity'
    }
];

const context = new SolveContext({ m: 5.0, d: 10 });
const solver = new MultiStepSolver(formulas);
solver.solve(customSteps, context);
```

---

## Design Principles

### 1. Explicit over Implicit
- Solve graphs are explicit, not inferred
- No guessing, no regex inference
- Every step is intentional

### 2. Fail Fast
- Errors caught immediately
- No silent failures
- Clear error messages

### 3. Show Work
- Every step logged in context.trace
- Full metadata attached
- Human-readable explanations

### 4. Verify Everything
- Sanity checks at each step
- Physical constraints enforced
- Warnings collected (don't stop execution)

### 5. Thin Orchestration
- MultiStepSolver is thin - delegates to FormulaCalculator
- No algebra logic in orchestration layer
- Clear separation of concerns

---

## File Structure

```
scripts/
├── calculator.js          # Layer 1: Atomic solver (FROZEN)
├── multiStepSolver.js    # Layers 2-4: Context + Orchestrator
└── formulas.js           # Formula definitions

test_complex_problems.html # Test interface
```

---

## Status

✅ **Architecture Complete**
- FormulaCalculator: Frozen (atomic solver)
- SolveContext: Implemented (memory & traceability)
- Explicit Solve Steps: Defined (no guessing)
- MultiStepSolver: Thin orchestrator (delegates to FormulaCalculator)

✅ **Benefits Achieved**
- No algebra explosion (delegates to FormulaCalculator)
- Global state awareness (SolveContext)
- Multi-step explainability (context.trace)
- Physics-aware sanity checks
- Transparent reasoning

---

## Next Steps (Optional Enhancements)

**Not yet implemented** (but architecture supports):
- Auto-topological sorting of formula graphs
- Multiple valid solve paths with scoring
- Symbolic unit checking
- Confidence flags for assumptions
- Graph visualization

**Current focus**: Keep architecture clean, don't add complexity until needed.

