# Quick Start Guide - Critical Files Only

**For:** New developers, quick troubleshooting, day-to-day usage  
**Goal:** Get you productive in 5 minutes

---

## 🎯 **The 5 Files You Actually Need**

### **1. Main Application**
- **`index.html`** - Open this in browser. Everything starts here.
- **`scripts/ui.js`** - UI controller (search, rendering, events)
- **`scripts/calculator.js`** - Calculation engine (82 solvers)
- **`scripts/formulas.js`** - Formula database (191 formulas)

### **2. Testing**
- **`test_calculator_direct.js`** - Run calculator tests: `node test_calculator_direct.js --single-run`
- **`tests/run_production_tests.html`** - Browser test interface (open in browser)

---

## 🚀 **Quick Commands**

```bash
# Start server
python3 -m http.server 8000

# Run Node.js tests (quick check)
node test_calculator_direct.js --single-run

# Run 8 consecutive tests (full verification)
node run_tests_8_times.js

# Open browser tests
open http://localhost:8000/tests/run_production_tests.html
```

---

## 📁 **File Structure (Simplified)**

```
AstroCalcForSciOlyHigh/
├── index.html              # 🎯 START HERE
├── scripts/
│   ├── ui.js              # UI controller
│   ├── calculator.js      # Calculation engine
│   └── formulas.js        # Formula database
├── test_calculator_direct.js  # Node.js tests
└── tests/
    └── run_production_tests.html  # Browser tests
```

**Everything else is:** Support files, legacy code, or advanced features.

---

## 🔧 **How It Works (30-Second Version)**

1. **User opens `index.html`** → Browser loads scripts
2. **User searches/formula** → `ui.js` handles it
3. **User calculates** → `calculator.js` solves it
4. **Formulas come from** → `formulas.js`

**That's it.** Everything else is optimization, testing, or edge cases.

---

## 🧪 **Testing (What Actually Matters)**

### **Node.js Tests** (Fast, reliable)
```bash
node test_calculator_direct.js --single-run
```
- Tests all 79 formulas with solvers
- 3 tests each (standard, edge, alternate solve)
- **236 total tests**
- Exit code 0 = success

### **Browser Tests** (Full integration)
```
http://localhost:8000/tests/run_production_tests.html
```
- Click "Calculator Tests Only" button
- Tests UI integration + calculator
- Shows pass/fail in browser

### **8 Consecutive Tests** (Production verification)
```bash
node run_tests_8_times.js
```
- Runs Node.js tests 8 times
- All must pass 100% to succeed
- Use before deployment

---

## 🐛 **Troubleshooting**

### **Tests failing?**
1. Check `calculator.js` syntax: `node --check scripts/calculator.js`
2. Check `formulas.js` syntax: `node --check scripts/formulas.js`
3. Hard refresh browser (Cmd+Shift+R) to clear cache

### **FormulaCalculator not found?**
- Browser cache issue → Hard refresh
- Script loading order → Check console errors
- Syntax error → Check `calculator.js` line numbers in console

### **UI functions not exposed?**
- Check `scripts/ui.js` for `window.functionName = ...`
- Check browser console for exposure errors
- Ensure `ui.js` loads before test scripts

---

## 📊 **Key Metrics**

- **191 formulas** in database
- **82 specialized solvers** in calculator
- **236 Node.js tests** (79 formulas × 3 tests)
- **30 UI tests** (browser only)
- **15 real astrophysics scenarios** (browser/Node)

---

## 🎓 **For New Developers**

### **Day 1: Understand the Core**
1. Read `index.html` structure
2. Understand `scripts/formulas.js` format (one formula object)
3. See how `scripts/calculator.js` solves formulas
4. Run `test_calculator_direct.js` to verify

### **Day 2: Add a Formula**
1. Add entry to `scripts/formulas.js`
2. Add solver to `scripts/calculator.js` (if needed)
3. Run tests to verify
4. Test in browser

### **Day 3: UI Changes**
1. Modify `scripts/ui.js` for UI behavior
2. Test in browser
3. Run `tests/run_ui_refactor_tests.js` (browser)

---

## ⚠️ **What to Ignore (For Now)**

- `tests/` folder complexity (use `run_production_tests.html` only)
- Multiple graph managers (use `enhancedOfflineGraph.js` if needed)
- Legacy files (anything with "old", "backup", "v1" in name)
- Python scripts (test generators, not core)
- Playwright tests (E2E, run separately)
- Service worker (`sw.js` - PWA feature, optional)

---

## 🔐 **Security Note**

- **`scripts/safeExpressionEvaluator.js`** - Prevents code injection
- **`scripts/expressionParser.js`** - AST-based parsing (safe)
- Calculator uses these automatically - no action needed

---

## 📝 **File Naming Conventions**

- **`scripts/*.js`** - Core application code
- **`tests/*.js`** - Test suites (Node.js compatible)
- **`tests/*.html`** - Browser test interfaces
- **`tests/*.spec.js`** - Playwright E2E tests

---

## 🎯 **Success Criteria**

**You're productive when:**
- ✅ You can run `test_calculator_direct.js` successfully
- ✅ You can add a formula and see it work
- ✅ You can modify UI behavior in `ui.js`
- ✅ You understand the 3-file core: `formulas.js` → `calculator.js` → `ui.js`

**Everything else is optimization.**

---

**Need more detail?** See `REPOSITORY_ARCHITECTURE.md` for comprehensive documentation.

