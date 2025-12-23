# AstroCalc Refactoring Plan

## 🎯 Priority 1: Critical Fixes (Immediate)

### ✅ 1. Fix Immediate Error
- [x] Add error handling to `getExampleValue` calls
- [x] Add input validation to `getExampleValue` function

### 2. Remove eval() Security Risk
**Status**: 🔴 Critical
**Files**: `scripts/ui.js`, `scripts/safeExpressionEvaluator.js`
**Action**: Replace with math.js parser

```javascript
// BEFORE (DANGEROUS)
const parsed = safeEvaluateExpression(evalExpression, allValues, {...});

// AFTER (SAFE)
import * as math from 'mathjs';
function safeEvaluate(expression, scope) {
  try {
    return math.evaluate(expression, scope);
  } catch (e) {
    throw new ValidationError('expression', `Invalid expression: ${e.message}`);
  }
}
```

### 3. Fix Memory Leaks
**Status**: 🔴 Critical
**Action**: Implement lifecycle management

```javascript
class ComponentLifecycle {
  constructor() {
    this.listeners = [];
    this.timeouts = [];
    this.intervals = [];
  }
  
  addEventListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    this.listeners.push({ target, event, handler, options });
  }
  
  setTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    this.timeouts.push(id);
    return id;
  }
  
  destroy() {
    this.listeners.forEach(({ target, event, handler }) => {
      target.removeEventListener(event, handler);
    });
    this.timeouts.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
  }
}
```

## 🎯 Priority 2: Architecture Refactor

### 4. Split 7000+ Line File
**Status**: 🟡 High Priority
**Target Structure**:

```
scripts/
├── ui/
│   ├── core/
│   │   ├── StateManager.js      # Centralized state
│   │   └── LifecycleManager.js # Memory leak prevention
│   ├── rendering/
│   │   ├── FormulaCards.js     # Card rendering
│   │   ├── SearchResults.js    # Search UI
│   │   └── VariableInputs.js    # Input fields
│   ├── state/
│   │   ├── CalculatorState.js   # Calculator state
│   │   └── FormulaState.js     # Formula selection
│   ├── utils/
│   │   ├── Parsing.js           # Input parsing
│   │   ├── Validation.js        # Input validation
│   │   └── Formatting.js        # Display formatting
│   └── events/
│       ├── Navigation.js         # Tab switching
│       └── Calculation.js       # Calculation events
└── ui.js (main entry point, <200 lines)
```

### 5. State Management
**Status**: 🟡 High Priority
**Pattern**: Centralized state with events

```javascript
class UIState {
  constructor() {
    this.currentFormula = null;
    this.calculator = null;
    this.graphManager = null;
    this.listeners = new Map();
  }
  
  setFormula(formula) {
    this.currentFormula = formula;
    this.notify('formulaChanged', formula);
  }
  
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }
  
  notify(event, data) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
  
  reset() {
    this.cleanup();
    this.currentFormula = null;
    this.calculator = null;
    this.graphManager = null;
  }
  
  cleanup() {
    // Cleanup resources
  }
}

const uiState = new UIState();
```

### 6. Standardize Error Handling
**Status**: 🟡 High Priority

```javascript
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.field = field;
    this.name = 'ValidationError';
  }
}

class CalculationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.context = context;
    this.name = 'CalculationError';
  }
}

// Consistent error handling
function parseNumericValue(input, unit = null) {
  if (input === null || input === undefined) {
    throw new ValidationError('input', 'Input cannot be null or undefined');
  }
  // ... parsing logic
}
```

## 🎯 Priority 3: Code Quality

### 7. Remove Comment Noise
**Status**: 🟢 Medium Priority
**Action**: Remove historical comments, keep only "why" comments

### 8. DOM Reference Caching
**Status**: 🟢 Medium Priority

```javascript
class DOMRefs {
  constructor() {
    this.cache = new Map();
  }
  
  get(id) {
    if (!this.cache.has(id)) {
      const element = document.getElementById(id);
      if (element) {
        this.cache.set(id, element);
      }
    }
    return this.cache.get(id);
  }
  
  invalidate(id) {
    this.cache.delete(id);
  }
  
  invalidateAll() {
    this.cache.clear();
  }
}

const dom = new DOMRefs();
```

### 9. Replace Callback Hell with async/await
**Status**: 🟢 Medium Priority

```javascript
// BEFORE
setTimeout(() => {
  if (graphContainer && graphContainer.offsetWidth === 0) {
    setTimeout(() => {
      if (!initialized) {
        setTimeout(() => { ... }, 200);
      }
    }, 50);
  }
}, 100);

// AFTER
async function waitForElement(element, timeout = 1000) {
  const start = Date.now();
  while (element.offsetWidth === 0) {
    if (Date.now() - start > timeout) {
      throw new Error('Element not visible within timeout');
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
```

### 10. Use Optional Chaining
**Status**: 🟢 Low Priority

```javascript
// BEFORE
if (formulaList) {
  if (formulaList.dataset) {
    if (formulaList.dataset.delegationSetup) { ... }
  }
}

// AFTER
if (formulaList?.dataset?.delegationSetup) { ... }
```

## 📋 Implementation Order

1. ✅ Fix immediate error (getExampleValue)
2. Remove eval() - Replace with math.js
3. Implement lifecycle management
4. Split ui.js into modules (start with rendering)
5. Implement state management
6. Standardize error handling
7. Code quality improvements

## 🧪 Testing Strategy

- Unit tests for each module
- Integration tests for state management
- E2E tests for critical user flows
- Performance tests for rendering

## 📊 Success Metrics

- **File size**: <500 lines per file
- **Cyclomatic complexity**: <10 per function
- **Test coverage**: >80%
- **Memory leaks**: 0
- **Security vulnerabilities**: 0

