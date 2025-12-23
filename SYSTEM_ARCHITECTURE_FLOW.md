# System Architecture Flow - Detailed

**Date:** December 23, 2025

---

## 🔄 Complete System Flow

### **1. Application Initialization Flow**

```
Browser Loads index.html
    │
    ▼
┌─────────────────────────────────────┐
│  Script Loading (Sequential)        │
│  1. formulas.js                     │
│     - Defines 191 formulas          │
│     - Creates concept network       │
│     - Sets up relationships         │
│  2. utils.js                       │
│     - Utility functions             │
│  3. unitConverter.js                │
│     - Unit conversion system        │
│  4. expressionParser.js             │
│     - Safe expression parsing       │
│  5. calculator.js                   │
│     - FormulaCalculator class       │
│     - 82 solvers registered         │
│  6. ui.js                           │
│     - UI controller                 │
│     - Search engine                 │
│     - Event handlers                │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  DOM Ready                          │
│  - Initialize UI components         │
│  - Set up event listeners           │
│  - Render initial formula list      │
│  - Initialize graph manager         │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Application Ready                  │
│  - User can search                  │
│  - User can calculate               │
│  - User can view graphs             │
└─────────────────────────────────────┘
```

---

### **2. User Search Flow**

```
User Types Query
    │
    ▼
┌─────────────────────────────────────┐
│  UI Layer (ui.js)                   │
│  - Debounce (200ms)                 │
│  - filterAndRenderFormulas()        │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Search Engine (formula-search.js)   │
│  ┌───────────────────────────────┐  │
│  │ 1. Parse Query                 │  │
│  │    - Extract keywords          │  │
│  │    - Identify concepts         │  │
│  │    - Normalize input           │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 2. Multi-Layer Matching        │  │
│  │    a) Direct ID match          │  │
│  │    b) Question pattern match   │  │
│  │    c) Concept network search   │  │
│  │    d) Keyword matching        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 3. Scoring                     │  │
│  │    - Name match score          │  │
│  │    - Concept dependency score  │  │
│  │    - Semantic distance score   │  │
│  │    - Keyword density score     │  │
│  │    - Unit match score          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 4. Confidence Calculation      │  │
│  │    - Weighted sum              │  │
│  │    - Normalize to 0-100        │  │
│  │    - Apply domain boosting     │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  UI Layer (Render Results)          │
│  - Sort by confidence score         │
│  - Render formula cards             │
│  - Display confidence indicators     │
│  - Highlight matches                │
└─────────────────────────────────────┘
```

---

### **3. Calculation Flow (Step-by-Step)**

```
User Clicks Formula Card
    │
    ▼
┌─────────────────────────────────────┐
│  UI Layer (ui.js)                   │
│  - Set currentFormula               │
│  - Switch to Calculator tab          │
│  - Render formula details           │
│  - Create input fields              │
└───────────────┬─────────────────────┘
                │
                ▼
User Enters Values & Clicks Calculate
    │
    ▼
┌─────────────────────────────────────┐
│  UI Layer - Input Processing        │
│  ┌───────────────────────────────┐  │
│  │ parseNumericValue()            │  │
│  │ - Parse string input           │  │
│  │ - Extract number               │  │
│  │ - Detect units                 │  │
│  │ - Handle scientific notation   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Unit Parser (unitParser.js)     │  │
│  │ - Parse "1.496e11 m"            │  │
│  │ - Extract value: 1.496e11       │  │
│  │ - Extract unit: "m"             │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Unit Converter (unitConverter.js)   │
│  ┌───────────────────────────────┐  │
│  │ Normalize Units                │  │
│  │ - Convert to canonical form    │  │
│  │ - Convert to SI base units     │  │
│  │ - Validate dimensions          │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Formula Calculator (calculator.js)  │
│  ┌───────────────────────────────┐  │
│  │ 1. Create Calculator Instance  │  │
│  │    const calc = new            │  │
│  │        FormulaCalculator(      │  │
│  │          formula               │  │
│  │        )                        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 2. Normalize Variables         │  │
│  │    - Handle Unicode (λ, σ, etc)│  │
│  │    - Handle subscripts         │  │
│  │    - Map aliases               │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 3. Validate Inputs             │  │
│  │    - Check required vars       │  │
│  │    - Check physical constraints│  │
│  │    - Check for NaN/Infinity    │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 4. Select Solver               │  │
│  │    - Check solver registry     │  │
│  │    - Find specialized solver   │  │
│  │    - Fallback to generic       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 5. Execute Calculation         │  │
│  │    - Call solver function      │  │
│  │    - Or use generic solver      │  │
│  │    - Safe expression eval      │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 6. Validate Result             │  │
│  │    - Check for NaN/Infinity    │  │
│  │    - Check physical constraints│  │
│  │    - Check dimensional units   │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Unit Converter (Formatting)         │
│  - Convert result to display units  │
│  - Format for readability           │
│  - Add unit labels                  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  UI Layer (Display Result)          │
│  - Show result in calculator        │
│  - Update graph (if enabled)        │
│  - Show errors (if any)              │
└─────────────────────────────────────┘
```

---

### **4. Solver Selection Flow**

```
FormulaCalculator.solve() Called
    │
    ▼
┌─────────────────────────────────────┐
│  Determine Unknown Variable          │
│  - Find null/undefined value         │
│  - Validate exactly one unknown     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Check Solver Registry               │
│  FormulaCalculator.solvers[formulaId]│
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
┌───────────────┐  ┌───────────────┐
│ Solver Found   │  │ No Solver     │
│                │  │               │
│ Use Specialized│  │ Use Generic   │
│ Solver         │  │ Solver        │
│                │  │               │
│ - Exact        │  │ - Parse       │
│ - Optimized    │  │   equation   │
│ - Validated    │  │ - Rearrange   │
│                │  │ - Solve       │
└───────┬───────┘  └───────┬───────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Execute Calculation                 │
│  - Call solver function              │
│  - Pass normalized variables         │
│  - Return result                      │
└─────────────────────────────────────┘
```

---

### **5. Test Execution Flow**

#### **Browser Test Flow**

```
Open Test HTML File
    │
    ▼
┌─────────────────────────────────────┐
│  Load Scripts (Sequential)           │
│  1. formulas.js                     │
│  2. calculator.js                   │
│  3. ui.js                           │
│  4. comprehensive_calculator_tests  │
│  5. real_astrophysics_scenarios     │
│  6. run_ui_refactor_tests           │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Wait for Functions                  │
│  - Multiple setTimeout retries       │
│  - eval() fallbacks                 │
│  - Function exposure checks          │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  User Clicks Test Button             │
│  - runCalculatorOnly()               │
│  - runRealAstrophysicsTests()       │
│  - UIRefactorTests.run()            │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Test Execution                      │
│  ┌───────────────────────────────┐  │
│  │ For each formula/test:         │  │
│  │ 1. Generate test case          │  │
│  │ 2. Create FormulaCalculator    │  │
│  │ 3. Run solve()                  │  │
│  │ 4. Validate result              │  │
│  │ 5. Check tolerance              │  │
│  │ 6. Record pass/fail             │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Display Results                     │
│  - Update statistics                 │
│  - Show pass/fail indicators         │
│  - Display errors                    │
│  - Update progress bar                │
└─────────────────────────────────────┘
```

#### **Node.js Test Flow**

```
Node.js Executes Script
    │
    ▼
┌─────────────────────────────────────┐
│  Mock Browser Environment            │
│  - global.window = {...}             │
│  - global.document = {...}           │
│  - global.location = {...}           │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Load Formulas                       │
│  - fs.readFileSync('formulas.js')    │
│  - Modify for Node.js                │
│  - eval() to execute                 │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Load Calculator                     │
│  - fs.readFileSync('calculator.js')   │
│  - eval() to execute                 │
│  - Verify FormulaCalculator exists   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Generate Test Cases                 │
│  - For each formula:                 │
│    * Standard test case              │
│    * Edge test case                  │
│    * Alternate solve case            │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Execute Tests                       │
│  - Create FormulaCalculator         │
│  - Call solve()                      │
│  - Validate result                   │
│  - Record pass/fail                  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Report Results                      │
│  - Print to console                  │
│  - Show statistics                   │
│  - Exit with code (0 = success)     │
└─────────────────────────────────────┘
```

---

## 📍 Test File Locations & Access

### **Browser Tests** (Open in browser)

| Test File | URL | Purpose |
|-----------|-----|---------|
| **Main Test Interface** | `http://localhost:8000/tests/run_production_tests.html` | 🎯 All tests in one interface |
| UI Tests 8x | `http://localhost:8000/tests/run_tests_8_times.html` | UI refactor tests (8 runs) |
| Concept Network | `http://localhost:8000/tests/run_concept_network_tests.html` | Concept network tests |
| Search Tests | `http://localhost:8000/tests/runSearchTests.html` | Search engine tests |
| Graph Tests | `http://localhost:8000/tests/test_graph_v2.html` | Graph system tests |
| UI Harness | `http://localhost:8000/tests/ui_refactor_test_harness.html` | UI test harness |

### **Node.js Tests** (Run in terminal)

| Test File | Command | Purpose |
|-----------|---------|---------|
| **Direct Calculator** | `node test_calculator_direct.js --single-run` | 🎯 Calculator engine tests |
| **8 Consecutive** | `node run_tests_8_times.js` | 🎯 8 consecutive runs |
| Graph/Concept | `node tests/run_tests_node.js` | Graph & concept tests |

### **Playwright Tests** (E2E)

| Test File | Command | Purpose |
|-----------|---------|---------|
| Calculator | `npx playwright test calculator` | E2E calculator tests |
| Calculator 10x | `npx playwright test calculator_10x` | 10 consecutive runs |
| Navigation | `npx playwright test navigation` | Keyboard navigation |
| Search | `npx playwright test search` | Search engine E2E |

---

## 🧪 Test Execution Commands

### **Quick Start**

```bash
# 1. Start server
python3 -m http.server 8000

# 2. Run Node.js tests (quick)
node test_calculator_direct.js --single-run

# 3. Run 8 consecutive Node.js tests
node run_tests_8_times.js

# 4. Open browser tests
open http://localhost:8000/tests/run_production_tests.html
```

---

**Status:** Complete system architecture flow documented

