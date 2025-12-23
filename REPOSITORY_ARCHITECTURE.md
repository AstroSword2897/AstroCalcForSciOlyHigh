# Repository Architecture & Test Suite Documentation

**Date:** December 23, 2025

> **🚀 Quick Start:** New to the repo? Start with [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md) for the essentials.  
> **📋 Quick Reference:** Need file locations? See [`CRITICAL_FILES_REFERENCE.md`](./CRITICAL_FILES_REFERENCE.md) for at-a-glance info.

---

## 📁 Repository Structure

```
AstroCalcForSciOlyHigh/
│
├── 📄 index.html                    # Main application entry point
├── 📄 manifest.json                 # PWA manifest
├── 📄 sw.js                         # Service worker (offline support)
│
├── 📂 scripts/                      # Core application code
│   ├── calculator.js               # Calculation engine (5,072 lines, 82 solvers)
│   ├── formulas.js                 # Formula database (191 formulas, 9,286 lines)
│   ├── ui.js                       # UI controller (10,310 lines)
│   ├── unitConverter.js            # Unit conversion system
│   ├── expressionParser.js         # Safe expression parsing
│   ├── safeExpressionEvaluator.js  # Security layer
│   ├── unitParser.js               # Unit parsing
│   ├── dimensionalAnalysis.js      # Dimensional analysis
│   ├── formula-search.js           # Search engine
│   ├── frqSupport.js               # FRQ support & confidence scoring
│   ├── enhancedOfflineGraph.js    # Graph manager V2
│   ├── formulaGraphConfig.js       # Graph configurations
│   ├── classification.js           # Stellar classification
│   ├── formulaExplorer.js          # Formula explorer
│   ├── multiStepSolver.js         # Multi-step problem solver
│   ├── quickNav.js                 # Quick navigation
│   ├── offlineGraphManager.js      # Graph manager V1
│   ├── graphManager.js             # Graph manager (legacy)
│   ├── utils.js                    # Utility functions
│   ├── accessibility.js            # Accessibility features
│   ├── diagnostics.js              # Diagnostic tools
│   ├── integrationTest.js          # Integration tests
│   ├── formulaVerification.js      # Formula verification
│   ├── codeQualityAudit.js         # Code quality checks
│   ├── standaloneGraphCalculator.js # Standalone graph calculator
│   ├── enhance_all_formulas.js     # Formula enhancement script
│   ├── 📂 events/
│   │   └── event-manager.js        # Event management system
│   ├── 📂 search/
│   │   └── formula-search.js       # Search engine implementation
│   ├── 📂 state/
│   │   └── app-state.js            # Application state management
│   └── 📂 utils/
│       └── dom.js                  # DOM utilities
│
├── 📂 tests/                        # Test suites
│   ├── 📄 comprehensive_calculator_tests.js    # Browser: All formulas (3 tests each)
│   ├── 📄 real_astrophysics_scenarios.js       # Browser/Node: 15 real-world scenarios
│   ├── 📄 run_ui_refactor_tests.js            # Browser: UI function tests (30 tests)
│   ├── 📄 test_config.js                      # Centralized test configuration
│   ├── 📄 validate_test_cases.js              # Test case validation
│   ├── 📄 conceptNetwork_tests.js             # Concept network tests
│   ├── 📄 astrophysics-question-accuracy.js   # Question matching tests
│   ├── 📄 execute_production_tests.js         # Production test execution
│   ├── 📄 production_test_runner.js          # Production test runner
│   ├── 📄 production-verification-harness.js # Verification harness
│   ├── 📄 professional-grade-suite.js       # Professional test suite
│   ├── 📄 astro-verifier.js                   # Astrophysics verifier
│   ├── 📄 confidence.test.js                  # Confidence score tests
│   ├── 📄 enhanced_offline_graph.js           # Graph tests
│   ├── 📄 ui_refactor_tests.js                # UI refactor tests (alternative)
│   ├── 📄 searchTestHarness.js                # Search test harness
│   ├── 📄 generate_test_cases.py              # Test case generator (Python)
│   ├── 📄 generate_weighted_concepts.py       # Concept generator (Python)
│   ├── 📄 search_test_cases.json              # Search test cases
│   ├── 📄 weighted_concept_mapping.json       # Concept mappings
│   ├── 📄 playwright.config.js                # Playwright configuration
│   ├── 📄 calculator.spec.js                  # Playwright: Calculator tests
│   ├── 📄 calculator_10x.spec.js              # Playwright: 10x consecutive tests
│   ├── 📄 navigation.spec.js                  # Playwright: Navigation tests
│   ├── 📄 search.spec.js                      # Playwright: Search tests
│   ├── 📄 README.md                           # Test documentation
│   │
│   ├── 📄 run_production_tests.html           # 🎯 MAIN TEST INTERFACE (Browser)
│   ├── 📄 run_tests_8_times.html             # Browser: 8 consecutive UI tests
│   ├── 📄 run_tests_verification.html         # Browser: Test verification
│   ├── 📄 run_concept_network_tests.html      # Browser: Concept network tests
│   ├── 📄 runSearchTests.html                 # Browser: Search tests
│   ├── 📄 production_test_interface.html      # Browser: Production interface
│   ├── 📄 ui_refactor_test_harness.html       # Browser: UI refactor harness
│   ├── 📄 test_graph_v2.html                  # Browser: Graph V2 tests
│   └── 📄 run_tests_node.js                   # Node.js: Graph/concept tests
│
├── 📂 styles/                       # CSS styling
│   └── main.css                     # Main stylesheet
│
├── 📂 libs/                         # Third-party libraries
│   └── mathjax/                     # MathJax for LaTeX rendering
│
├── 📂 react-app/                    # React application (if used)
│   └── src/
│       └── lib/
│           └── __tests__/          # React component tests
│
├── 📄 test_calculator_direct.js    # 🎯 Node.js: Direct calculator tests
├── 📄 run_tests_8_times.js         # Node.js: 8 consecutive test wrapper
├── 📄 test_suite.js                 # General test suite
├── 📄 run_all_tests_comprehensive.js # Comprehensive test runner
│
└── 📄 *.md                          # Documentation files (40+ markdown files)

```

---

## 🧪 Test Suite Locations & Purposes

### **Browser-Based Tests** (Open in browser at `http://localhost:8000/tests/...`)

#### 1. **`run_production_tests.html`** 🎯 **MAIN TEST INTERFACE**
   - **Location:** `tests/run_production_tests.html`
   - **Purpose:** Comprehensive production test interface
   - **Tests:**
     - Calculator tests (all formulas)
     - Real astrophysics scenarios
     - UI refactor tests
     - Search tests
     - Validation tests
   - **How to run:**
     ```bash
     python3 -m http.server 8000
     open http://localhost:8000/tests/run_production_tests.html
     ```
   - **Functions available:**
     - `runCalculatorOnly()` - Run calculator tests
     - `runRealAstrophysicsTests()` - Run astrophysics scenarios
     - `runUIRefactorTests()` - Run UI tests

#### 2. **`run_tests_8_times.html`** 🎯 **UI TESTS 8 TIMES**
   - **Location:** `tests/run_tests_8_times.html`
   - **Purpose:** Run UI refactor tests 8 times consecutively
   - **Tests:** 30 UI function tests (parseNumericValue, safeEvaluateExpression, etc.)
   - **How to run:**
     ```bash
     open http://localhost:8000/tests/run_tests_8_times.html
     ```
   - **Auto-runs:** Yes, automatically runs 8 times on page load

#### 3. **`run_concept_network_tests.html`**
   - **Location:** `tests/run_concept_network_tests.html`
   - **Purpose:** Concept network and semantic search tests
   - **Tests:** Concept vector tests, semantic distance, weighted influence

#### 4. **`runSearchTests.html`**
   - **Location:** `tests/runSearchTests.html`
   - **Purpose:** Search engine tests
   - **Tests:** Formula search, confidence scoring, query matching

#### 5. **`test_graph_v2.html`**
   - **Location:** `tests/test_graph_v2.html`
   - **Purpose:** Graph system V2 tests
   - **Tests:** Graph rendering, adaptive sampling, device pixel ratio

#### 6. **`ui_refactor_test_harness.html`**
   - **Location:** `tests/ui_refactor_test_harness.html`
   - **Purpose:** UI refactor test harness with visual results
   - **Tests:** UI function tests with export functionality

---

### **Node.js Tests** (Run with `node ...`)

#### 1. **`test_calculator_direct.js`** 🎯 **MAIN NODE TEST**
   - **Location:** Root directory
   - **Purpose:** Direct calculator engine testing (no browser)
   - **Tests:** 236 tests (79 formulas × 3 test cases each)
   - **How to run:**
     ```bash
     node test_calculator_direct.js --single-run
     ```
   - **Features:**
     - Tests all formulas with solvers
     - Standard, edge, and alternate solve cases
     - 100% pass rate verification

#### 2. **`run_tests_8_times.js`** 🎯 **8 CONSECUTIVE NODE TESTS**
   - **Location:** Root directory
   - **Purpose:** Run calculator tests 8 times consecutively
   - **How to run:**
     ```bash
     node run_tests_8_times.js
     ```
   - **Calls:** `test_calculator_direct.js --single-run` 8 times
   - **Verifies:** All 8 runs achieve 100% pass rate

#### 3. **`run_tests_node.js`**
   - **Location:** `tests/run_tests_node.js`
   - **Purpose:** Graph and concept network tests in Node.js
   - **Tests:** Graph manager, concept network

---

### **Playwright Tests** (Run with `npx playwright test`)

#### 1. **`calculator.spec.js`**
   - **Location:** `tests/calculator.spec.js`
   - **Purpose:** E2E calculator tests
   - **Tests:** Calculator UI, formula solving, error handling

#### 2. **`calculator_10x.spec.js`**
   - **Location:** `tests/calculator_10x.spec.js`
   - **Purpose:** Run calculator tests until 100% achieved 10 times
   - **Tests:** Uses `run_production_tests.html` interface

#### 3. **`navigation.spec.js`**
   - **Location:** `tests/navigation.spec.js`
   - **Purpose:** Keyboard navigation tests
   - **Tests:** Shortcuts, tab navigation, keyboard controls

#### 4. **`search.spec.js`**
   - **Location:** `tests/search.spec.js`
   - **Purpose:** Search engine E2E tests
   - **Tests:** Search accuracy, confidence scoring, query matching

---

### **Test Configuration Files**

#### 1. **`test_config.js`** 🎯 **CENTRALIZED CONFIG**
   - **Location:** `tests/test_config.js`
   - **Purpose:** Centralized test configuration
   - **Contains:**
     - Physical constants (G, c, σ, M☉, etc.)
     - Formula-specific configs
     - Tolerance settings
     - Test thresholds
   - **Used by:** `comprehensive_calculator_tests.js`

---

## 🔄 System Architecture Flow

### **Application Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│              (index.html - Browser)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UI Components (Tabs, Cards, Inputs, Calculator)     │  │
│  │  - Formula Cards                                      │  │
│  │  - Search Input                                       │  │
│  │  - Calculator Interface                              │  │
│  │  - Graph Visualization                               │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER (ui.js)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Search & Ranking Engine                             │  │
│  │  - filterAndRenderFormulas()                          │  │
│  │  - calculateSearchScore()                             │  │
│  │  - Multi-layer scoring                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  UI Orchestration                                     │  │
│  │  - Event handling                                     │  │
│  │  - Tab navigation                                    │  │
│  │  - Formula rendering                                 │  │
│  │  - Memory management                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────┬───────────────────────┬─────────────────────┘
                │                       │
                ▼                       ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│   BUSINESS LOGIC LAYER    │  │    FEATURE MODULES        │
│                           │  │                           │
│  ┌─────────────────────┐ │  │  ┌─────────────────────┐ │
│  │ Calculator Engine   │ │  │  │ FRQ Support        │ │
│  │ (calculator.js)    │ │  │  │ (frqSupport.js)     │ │
│  │                     │ │  │  │ - Confidence scores│ │
│  │ - FormulaCalculator │ │  │  │ - Question match   │ │
│  │ - 82 solvers        │ │  │  └─────────────────────┘ │
│  │ - Safe evaluation   │ │  │  ┌─────────────────────┐ │
│  └─────────────────────┘ │  │  │ Search Engine       │ │
│  ┌─────────────────────┐ │  │  │ (formula-search.js)│ │
│  │ Unit Converter      │ │  │  │ - Concept network  │ │
│  │ (unitConverter.js)  │ │  │  │ - Semantic search  │ │
│  └─────────────────────┘ │  │  └─────────────────────┘ │
│  ┌─────────────────────┐ │  │  ┌─────────────────────┐ │
│  │ Expression Parser   │ │  │  │ Graph Manager      │ │
│  │ (expressionParser)  │ │  │  │ (enhancedOffline)  │ │
│  └─────────────────────┘ │  │  └─────────────────────┘ │
└───────────────┬───────────┘  └───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Formula Database (formulas.js)                       │  │
│  │ - 191 formulas                                      │  │
│  │ - 16 categories                                     │  │
│  │ - Concept network (139 concepts)                    │  │
│  │ - Formula relationships                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### **Calculation Flow (Detailed)**

```
User Input
    │
    ▼
┌─────────────────────────────────────┐
│  UI Layer (ui.js)                   │
│  - parseNumericValue()              │
│  - Input validation                 │
│  - Unit parsing                     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Unit Converter (unitConverter.js)   │
│  - Normalize units                  │
│  - Convert to SI base units         │
│  - Validate dimensions              │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Formula Calculator (calculator.js)  │
│  ┌───────────────────────────────┐  │
│  │ 1. Find formula               │  │
│  │ 2. Select solver               │  │
│  │    - Check solver registry     │  │
│  │    - Fallback to generic       │  │
│  │ 3. Normalize variables         │  │
│  │ 4. Validate inputs             │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 5. Execute calculation         │  │
│  │    - Safe expression eval      │  │
│  │    - Physical constraints     │  │
│  │    - Error handling            │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Result Validation                  │
│  - Check for NaN/Infinity           │
│  - Physical constraint checks       │
│  - Dimensional analysis             │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Unit Converter (formatting)        │
│  - Convert to display units         │
│  - Format for readability          │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  UI Layer (display)                 │
│  - Show result                      │
│  - Update graph (if enabled)        │
│  - Display errors (if any)          │
└─────────────────────────────────────┘
```

---

### **Search Flow (Detailed)**

```
User Query
    │
    ▼
┌─────────────────────────────────────┐
│  Search Engine (formula-search.js)  │
│  ┌───────────────────────────────┐  │
│  │ 1. Parse query                 │  │
│  │    - Extract keywords          │  │
│  │    - Identify concepts         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 2. Multi-layer matching        │  │
│  │    - Direct ID match           │  │
│  │    - Question pattern match    │  │
│  │    - Concept network search    │  │
│  │    - Keyword matching          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 3. Scoring & Ranking          │  │
│  │    - Weighted concept scores   │  │
│  │    - Semantic distance         │  │
│  │    - Confidence calculation    │  │
│  └───────────────────────────────┘  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  UI Layer (display results)          │
│  - Render formula cards             │
│  - Show confidence scores            │
│  - Highlight matches                │
└─────────────────────────────────────┘
```

---

## 🧪 Test Execution Flow

### **Browser Test Flow**

```
Browser Opens HTML Test File
    │
    ▼
┌─────────────────────────────────────┐
│  Load Scripts (in order)            │
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
│  Wait for Functions to Expose       │
│  - Multiple retry attempts          │
│  - eval() fallbacks                 │
│  - setTimeout delays                │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Execute Tests                      │
│  - runCalculatorOnly()              │
│  - runRealAstrophysicsTests()       │
│  - UIRefactorTests.run()            │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Display Results                    │
│  - Pass/fail indicators             │
│  - Statistics                       │
│  - Error details                    │
└─────────────────────────────────────┘
```

### **Node.js Test Flow**

```
Node.js Executes test_calculator_direct.js
    │
    ▼
┌─────────────────────────────────────┐
│  Mock Browser Environment            │
│  - global.window                     │
│  - global.document                   │
│  - global.location                   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Load Formulas                      │
│  - Read formulas.js                  │
│  - Modify for Node.js                │
│  - eval() to load                    │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Load Calculator                     │
│  - Read calculator.js                │
│  - eval() to load                    │
│  - Verify FormulaCalculator exists   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Generate Test Cases                │
│  - For each formula (3 tests)       │
│  - Standard, edge, alternate       │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Execute Tests                       │
│  - Create FormulaCalculator         │
│  - Run solve()                       │
│  - Validate results                  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Report Results                      │
│  - Pass/fail counts                  │
│  - Category breakdown                │
│  - Exit code (0 = success)          │
└─────────────────────────────────────┘
```

---

## 📊 Test File Summary

| Test File | Location | Type | Purpose | Tests |
|-----------|----------|------|---------|-------|
| `comprehensive_calculator_tests.js` | `tests/` | Browser | All formulas (3 each) | ~573 tests |
| `real_astrophysics_scenarios.js` | `tests/` | Browser/Node | Real-world scenarios | 15 tests |
| `run_ui_refactor_tests.js` | `tests/` | Browser | UI functions | 30 tests |
| `test_calculator_direct.js` | Root | Node.js | Direct calculator tests | 236 tests |
| `run_tests_8_times.js` | Root | Node.js | 8 consecutive runs | Wrapper |
| `run_production_tests.html` | `tests/` | Browser | Main test interface | All tests |
| `run_tests_8_times.html` | `tests/` | Browser | UI tests 8x | 30 tests × 8 |
| `calculator.spec.js` | `tests/` | Playwright | E2E calculator | Multiple |
| `calculator_10x.spec.js` | `tests/` | Playwright | 10x consecutive | Wrapper |

---

## 🚀 Quick Start Guide

### **Run Browser Tests**

```bash
# 1. Start server
python3 -m http.server 8000

# 2. Open test interface
open http://localhost:8000/tests/run_production_tests.html

# 3. Click test buttons in UI
```

### **Run Node.js Tests**

```bash
# Single run
node test_calculator_direct.js --single-run

# 8 consecutive runs
node run_tests_8_times.js
```

### **Run Playwright Tests**

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test
```

---

**Status:** Complete repository architecture documentation

