# Migration Plan: Finish the Modern Rewrite

## Current State

✅ **Done:**
- 28 TypeScript modules extracted
- Modular architecture in place
- File size reduced (10,927 → 94 lines in ui.js)

❌ **Issues:**
- TypeScript and JavaScript mixed without build system
- Can't load .ts files directly in browser
- 50+ global variables still exist
- Dependency injection pattern is wrong
- No ES modules

---

## Phase 1: Build System Setup ✅

**Status:** COMPLETE

- ✅ Created `package.json` with Vite
- ✅ Created `vite.config.ts`
- ✅ Updated `tsconfig.json` for ES modules
- ✅ Created `scripts/app/App.ts` (proper orchestrator)
- ✅ Created `scripts/main.ts` (ES module entry point)

**Next:** Run `npm install`

---

## Phase 2: Convert Core Files to TypeScript (1 week)

### Priority 1: Critical Files
- [ ] `scripts/calculator.js` → `scripts/calculator.ts`
- [ ] `scripts/formulas.js` → `scripts/formulas.ts` (export formulas as ES module)
- [ ] `scripts/unitConverter.js` → `scripts/unitConverter.ts`
- [ ] `scripts/classification.js` → `scripts/classification.ts`

### Priority 2: Utility Files
- [ ] `scripts/expressionParser.js` → `scripts/expressionParser.ts`
- [ ] `scripts/unitParser.js` → `scripts/unitParser.ts`
- [ ] `scripts/dimensionalAnalysis.ts` (already TS, verify exports)

### Priority 3: Feature Files
- [ ] `scripts/formulaExplorer.js` → `scripts/formulaExplorer.ts`
- [ ] `scripts/enhancedOfflineGraph.js` → `scripts/enhancedOfflineGraph.ts`
- [ ] `scripts/frqSupport.js` → `scripts/frqSupport.ts`

---

## Phase 3: Remove Globals (3 days)

### Step 1: Convert Global Variables to Exports
```typescript
// Before (calculator.js)
var calculator = null;

// After (calculator.ts)
export class FormulaCalculator {
    // ...
}
```

### Step 2: Update All Imports
```typescript
// Before
const calc = window.calculator;

// After
import { FormulaCalculator } from './calculator';
const calc = new FormulaCalculator(formula);
```

### Step 3: Remove Window Exports
```typescript
// Before
window.parseNumericValue = parseNumericValue;

// After
export function parseNumericValue() { }
```

---

## Phase 4: Fix Dependency Injection (2 days)

### Current (Wrong):
```typescript
constructor(options: {
    CalculatorClass: any;  // Passing class
    UnitConverter: any;    // Passing singleton
}) {
    this.calculator = new options.CalculatorClass();
}
```

### Fixed:
```typescript
constructor(dependencies: {
    calculator: FormulaCalculator;  // Instance
    unitConverter: UnitConverter;   // Instance
}) {
    this.calculator = dependencies.calculator;
}
```

---

## Phase 5: Update index.html (1 day)

### Before:
```html
<script src="scripts/calculator.js"></script>
<script src="scripts/ui.js"></script>
```

### After:
```html
<script type="module" src="/scripts/main.ts"></script>
```

Or after build:
```html
<script type="module" src="/dist/assets/main.[hash].js"></script>
```

---

## Phase 6: Delete Compatibility Layer (1 day)

Remove:
- `scripts/ui.js` (replaced by `scripts/main.ts`)
- `scripts/ui/UIModuleOrchestrator.ts` (replaced by `scripts/app/App.ts`)
- All `window.*` exports
- All global variable declarations

---

## Timeline

- **Phase 1:** ✅ Complete (Build system)
- **Phase 2:** 1 week (Convert to TS)
- **Phase 3:** 3 days (Remove globals)
- **Phase 4:** 2 days (Fix DI)
- **Phase 5:** 1 day (Update HTML)
- **Phase 6:** 1 day (Delete legacy)

**Total: ~3 weeks**

---

## Success Criteria

✅ All files are TypeScript
✅ No global variables
✅ ES modules everywhere
✅ Proper dependency injection
✅ Build system working
✅ Single bundle output
✅ No compatibility layer

---

## Commands

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

