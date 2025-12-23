# Critical Files Reference - At-a-Glance

**Last Updated:** December 23, 2025  
**Purpose:** Quick reference for the files you'll actually touch

---

## 🎯 **Core Application (4 files)**

| File | Purpose | When to Edit |
|------|---------|--------------|
| `index.html` | Main entry point | UI structure changes |
| `scripts/formulas.js` | Formula database | Adding/modifying formulas |
| `scripts/calculator.js` | Calculation engine | Adding solvers, fixing calculations |
| `scripts/ui.js` | UI controller | Search, rendering, user interactions |

---

## 🧪 **Primary Test Files (2 files)**

| File | Type | Command | When to Use |
|------|------|---------|-------------|
| `test_calculator_direct.js` | Node.js | `node test_calculator_direct.js --single-run` | Quick verification, CI/CD |
| `tests/run_production_tests.html` | Browser | Open in browser | Full integration testing |

---

## 🔧 **Support Files (Only if needed)**

| File | Purpose | When to Use |
|------|---------|-------------|
| `scripts/unitConverter.js` | Unit conversions | Adding new units |
| `scripts/expressionParser.js` | Safe expression parsing | Security/parsing issues |
| `scripts/safeExpressionEvaluator.js` | Security layer | Code injection prevention |
| `tests/test_config.js` | Test configuration | Changing test tolerances |

---

## 📊 **Test Execution Matrix**

| Test Type | File | Command | Tests What |
|-----------|------|---------|------------|
| **Calculator (Node)** | `test_calculator_direct.js` | `node test_calculator_direct.js --single-run` | All formulas (236 tests) |
| **Calculator (Browser)** | `tests/run_production_tests.html` | Click button | UI + Calculator integration |
| **UI Functions** | `tests/run_ui_refactor_tests.js` | Via browser | 30 UI function tests |
| **Real Scenarios** | `tests/real_astrophysics_scenarios.js` | Via browser | 15 real-world problems |
| **8 Consecutive** | `run_tests_8_times.js` | `node run_tests_8_times.js` | Production verification |

---

## 🚨 **Common Issues & Fixes**

| Issue | File to Check | Fix |
|-------|---------------|-----|
| Syntax error | `scripts/calculator.js` | `node --check scripts/calculator.js` |
| Formula not found | `scripts/formulas.js` | Check formula ID matches |
| Solver not working | `scripts/calculator.js` | Check solver registration |
| UI not updating | `scripts/ui.js` | Check event listeners |
| Tests failing | `test_calculator_direct.js` | Check console output |

---

## 📈 **File Size & Complexity**

| File | Lines | Complexity | Edit Frequency |
|------|-------|------------|----------------|
| `scripts/formulas.js` | ~9,286 | Low (data) | High (adding formulas) |
| `scripts/ui.js` | ~10,310 | High (logic) | Medium (UI changes) |
| `scripts/calculator.js` | ~5,072 | Medium (solvers) | Low (bug fixes) |
| `test_calculator_direct.js` | ~1,200 | Medium (test logic) | Low (test updates) |

---

## 🎓 **Learning Path**

### **Beginner**
1. `index.html` - See structure
2. `scripts/formulas.js` - Understand formula format
3. `test_calculator_direct.js` - Run tests

### **Intermediate**
1. `scripts/calculator.js` - How solvers work
2. `scripts/ui.js` - UI flow
3. `tests/run_production_tests.html` - Browser testing

### **Advanced**
1. `scripts/expressionParser.js` - AST parsing
2. `scripts/safeExpressionEvaluator.js` - Security
3. `tests/test_config.js` - Test configuration

---

## ⚡ **Quick Commands Cheat Sheet**

```bash
# Syntax check
node --check scripts/calculator.js
node --check scripts/formulas.js

# Run tests
node test_calculator_direct.js --single-run
node run_tests_8_times.js

# Start server
python3 -m http.server 8000

# Open browser tests
open http://localhost:8000/tests/run_production_tests.html
```

---

## 🔍 **Finding Things**

| What You Need | Where to Look |
|---------------|---------------|
| Formula definition | `scripts/formulas.js` (search by ID) |
| Solver implementation | `scripts/calculator.js` (search `solve*`) |
| UI behavior | `scripts/ui.js` (search function name) |
| Test configuration | `tests/test_config.js` |
| Unit conversions | `scripts/unitConverter.js` |
| Error handling | `scripts/calculator.js` (CalculationError class) |

---

## ✅ **Pre-Deployment Checklist**

- [ ] `node test_calculator_direct.js --single-run` passes
- [ ] `node run_tests_8_times.js` passes (all 8 runs)
- [ ] Browser tests pass (`run_production_tests.html`)
- [ ] No syntax errors (`node --check` on all scripts)
- [ ] Hard refresh browser to clear cache

---

**That's it.** These are the files that matter for 95% of work.

