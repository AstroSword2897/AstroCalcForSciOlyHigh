# 🌌 AstroCalc - Science Olympiad Astronomy Calculator

**A comprehensive, offline-first astronomy formula calculator for Science Olympiad competitions with modern modular architecture.**

[![Offline-First](https://img.shields.io/badge/Offline-First-green)](https://github.com)
[![No AI Required](https://img.shields.io/badge/No%20AI-Required-blue)](https://github.com)
[![191 Formulas](https://img.shields.io/badge/Formulas-191-orange)](https://github.com)
[![71 Solvers](https://img.shields.io/badge/Solvers-71-yellow)](https://github.com)
[![Modular Architecture](https://img.shields.io/badge/Architecture-Modular-purple)](https://github.com)
[![Tests Passing](https://img.shields.io/badge/Tests-58%2F58%20Passing-brightgreen)](https://github.com)

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/AstroSword2897/AstroCalcForSciOlyHigh.git
cd AstroCalcForSciOlyHigh

# Start local server (port 8001 recommended)
python3 -m http.server 8001

# Open in browser
open http://localhost:8001
```

### Testing

```bash
# Install dependencies
npm install

# Run all tests (58 tests passing)
npx playwright test

# Run tests with UI for debugging
npx playwright test --ui

# Run specific test file
npx playwright test tests/calculator.spec.js

# Run with specific browser
npx playwright test --project=chromium

# Generate HTML report
npx playwright test --reporter=html
```

### Production Deployment

The app works completely offline - just serve the files via any web server.

## ✨ Features

### 🧮 Calculator Engine
- **191 Astronomy Formulas** - Comprehensive coverage of Science Olympiad topics
- **71 Implemented Solvers** - Production-grade calculation engine
- **Symbolic & Numeric Solving** - Advanced symbolic solver with N/A support
- **Offline-First** - No network dependencies, works completely offline
- **Unit Conversion** - Automatic unit conversion and validation
- **Dimensional Analysis** - Physical constraint validation
- **Error Handling** - Robust error handling and validation

### 🔍 Search Engine
- **Multi-Signal Scoring** - Keyword density, concept dependency, units, equation form
- **233 Weighted Concepts** - Advanced concept network with 10,000 connections
- **Natural Language** - Understands questions like "how to calculate escape velocity"
- **Confidence Scores** - Detailed confidence breakdown per result
- **Context Propagation** - Cross-concept reinforcement
- **Command Palette** - Modern search interface with keyboard navigation

### 🎯 Expert System (Question → Formula)
- **Deterministic Rule-Based** - No AI/ML models, fully predictable
- **Question Detection** - Automatically routes question-like queries through ExpertSystem
- **Single Formula Selection** - Returns the single best formula for non-calculus problems
- **Confidence Calibration** - Tiers: ≥80% (strong), 60-79% (good), 40-59% (moderate), <40% (weak/rejected)
- **Refusal Handling** - Cleanly rejects ambiguous, vague, multi-formula, or calculus questions
- **Explanation Determinism** - Byte-for-byte identical explanations for same input

### 📊 Graph System
- **Enhanced Offline Graph Manager V2** - Fully offline, no external dependencies
- **Formula-Specific Graphs** - Each formula has its own designated graph configuration
- **Interactive Features** - Click-to-set values, hover tooltips, calculated point highlighting
- **Adaptive Sampling** - Recursive subdivision for high-quality curves
- **Resize Handling** - Debounced resize with error handling
- **Device Pixel Ratio** - Crisp rendering on high-DPI displays

### 🏗️ Modern Architecture
- **Modular UI System** - Replaced monolithic 10k+ line file with modular architecture
- **TypeScript Migration** - Type safety with modern tooling
- **Service-Oriented** - Clean separation of concerns
- **Memory Leak Prevention** - WeakMap, LifecycleManager, proper cleanup
- **Performance Optimized** - LRU caching, batch rendering, requestAnimationFrame

### ♿ Accessibility
- **ARIA Labels** - Screen reader support for all interactive elements
- **Keyboard Navigation** - Full keyboard accessibility
- **Focus Indicators** - Visible focus styles for better navigation
- **Semantic HTML** - Proper element roles and structure

### 🎯 Formula Categories
- **Orbital Mechanics** - Kepler's laws, orbital velocity, escape velocity
- **Radiation & Stellar Properties** - Luminosity, Wien's law, Stefan-Boltzmann
- **Cosmology & Relativity** - Hubble's law, Schwarzschild radius, time dilation
- **Doppler & Spectroscopy** - Doppler shift, redshift, wavelength calculations
- **Planetary Science** - Surface gravity, equilibrium temperature, albedo
- **High Energy Astrophysics** - Synchrotron radiation, gamma factors
- **Stellar Structure** - Mass-luminosity relation, stellar lifetime
- **Telescopes & Optics** - Angular resolution, magnification, f-ratio

## 📁 Project Structure

```
AstroCalcForSciOlyHigh/
├── index.html                 # Main application entry point
├── scripts/
│   ├── formulas.js            # 191 formula definitions
│   ├── calculator.ts          # TypeScript calculation engine (71 solvers)
│   ├── ui/                    # 🆕 Modular UI system
│   │   ├── init.js            # UI initialization
│   │   ├── UIModuleOrchestrator.js # Main orchestrator
│   │   ├── modules/           # Feature modules
│   │   │   ├── search/        # Search engine
│   │   │   ├── calculation/   # Calculator abstraction
│   │   │   ├── formula/       # Formula management
│   │   │   ├── events/        # Event coordination
│   │   │   └── utils/         # Utilities
│   │   ├── rendering/         # Rendering modules
│   │   ├── state/            # State management
│   │   └── types/            # TypeScript definitions
│   ├── enhancedOfflineGraph.js # Graph manager V2
│   ├── offlineGraphManager.ts  # TypeScript graph manager (optimized)
│   ├── formulaGraphConfig.js  # Formula-specific graph configs
│   ├── unitConverter.js      # Unit conversion system
│   ├── expressionParser.js    # Expression parsing
│   ├── types/                # TypeScript type definitions
│   │   ├── formula.ts        # Formula types
│   │   └── calculator.ts      # Calculator types
│   └── utils/                # Shared utilities
├── tests/                   # 🆕 Comprehensive test suite (58 tests)
│   ├── calculator.spec.js    # Calculator tests (command palette)
│   ├── search.spec.js        # Search engine tests
│   ├── navigation.spec.js    # Navigation tests
│   ├── confidence.test.js    # Confidence scoring tests
│   ├── accessibility.test.ts # Accessibility tests
│   ├── performance.test.ts  # Performance tests
│   └── integration.test.ts   # Integration tests
├── styles/
│   └── main.css              # Application styles (with command palette fixes)
├── docs/                    # 🆕 Documentation
│   ├── ARCHITECTURE_PLAN.md  # Modernization strategy
│   └── TEST_RESULTS_SUMMARY.md # Test analysis
├── playwright.config.js      # 🆕 ES module configuration
└── libs/
    └── mathjax/              # MathJax for LaTeX rendering
```

## 🏗️ Architecture

### 🆕 Modular UI System (2024 Update)

The legacy monolithic `ui.js` (10,000+ lines) has been replaced with a modern modular architecture:

#### **Core Modules**
- **UIModuleOrchestrator** - Main coordinator with dependency injection
- **SearchEngine** - Production-grade search with LRU cache
- **CalculationOrchestrator** - Calculator abstraction layer
- **FormulaSelector** - Formula management and selection
- **EventCoordinator** - Type-safe event management
- **TabManager** - Tab navigation system

#### **Services**
- **SearchService** - Encapsulates search algorithms and scoring
- **FormulaService** - Formula management and state
- **StateService** - Centralized state with Pub/Sub pattern
- **EventBus** - Decoupled component communication

#### **Performance Features**
- **Virtual Scrolling** - For large formula lists
- **Lazy Loading** - Components loaded on-demand
- **Memoization** - Cache expensive calculations
- **Debounced Search** - Reduce API calls during typing
- **RequestAnimationFrame** - Smooth animations

### TypeScript Migration
The codebase is being migrated to TypeScript for:
- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete, refactoring, navigation
- **Performance**: Optimized modules with WeakMap, LRU cache, batch rendering
- **Memory Safety**: Automatic cleanup, no memory leaks

### Core Modules (TypeScript)
- **LifecycleManager**: Tracks and cleans up all event listeners, timers, observers
- **StateManager**: Centralized state management
- **DOMRefs**: DOM element caching with WeakMap (prevents memory leaks)
- **ErrorHandler**: Standardized error handling
- **SearchModule**: Production-grade search with LRU cache, pluggable scorers
- **EventManager**: Type-safe event management with automatic cleanup
- **CleanupManager**: Centralized timer/interval tracking

### Memory Leak Prevention
- ✅ **WeakMap** for DOM element references (auto-cleanup)
- ✅ **LifecycleManager** tracks all event listeners
- ✅ **CleanupManager** tracks all timers/intervals
- ✅ **MutationObserver** for automatic cache invalidation
- ✅ **Proper cleanup** methods on all modules

## 🧪 Testing

### 🆕 Test Infrastructure (58 Tests Passing)

```bash
# Install Playwright
npm install

# Run all tests
npx playwright test

# Run with UI for debugging
npx playwright test --ui

# Run specific test file
npx playwright test tests/calculator.spec.js

# Run with specific browser
npx playwright test --project=chromium

# Generate HTML report
npx playwright test --reporter=html
```

### Test Suites (58 Total)

1. **Calculator Tests** (4) - Symbolic/numeric solving, N/A support
2. **Search Tests** (8) - Command palette, natural language, confidence scoring
3. **Navigation Tests** (10) - Keyboard navigation, tab switching
4. **Confidence Tests** (11) - Scoring algorithm, edge cases
5. **Accessibility Tests** (4) - ARIA compliance, focus indicators
6. **Performance Tests** (2) - Search response, calculation speed
7. **Integration Tests** (9) - End-to-end workflows

### 🎯 Recent Bug Fixes (Jan 2025)

- ✅ **Fixed solveSymbolically method** - Added missing method to FormulaCalculator
- ✅ **Updated all test selectors** - Migrated from #formula-search to #command-palette-input
- ✅ **Added accessibility attributes** - ARIA labels, roles, tabindex on all interactive elements
- ✅ **Enhanced focus styles** - Visible focus indicators for keyboard navigation
- ✅ **Fixed GraphCoordinator** - Replaced retry logic with readiness gating
- ✅ **Fixed playwright config** - Converted to ES modules for compatibility
- ✅ **Cleaned up codebase** - Removed 36+ unused/duplicate files

### Test Coverage

- ✅ **Calculator**: Symbolic/numeric solving, N/A handling
- ✅ **Search Engine**: Command palette, natural language
- ✅ **UI Components**: Formula cards, tabs, inputs
- ✅ **Integration**: End-to-end workflows
- ✅ **Accessibility**: Screen readers, keyboard navigation

## 🎨 Graph System

### Features

- **Formula-Specific Configuration** - Each formula has designated graph settings
- **Interactive** - Click graph to set input values
- **Calculated Point Highlighting** - Shows result point after calculation
- **Adaptive Sampling** - 50-600 points based on curve complexity
- **Offline Rendering** - HTML5 Canvas, no external dependencies

### Usage

```javascript
// Graph automatically updates when formula is selected
selectFormula(formula);

// Graph shows calculated point after calculation
performCalculation();

// Click graph to set input values
// (automatic integration)
```

## 🔧 Configuration

### Graph Configuration

Each formula can have custom graph settings in `scripts/formulaGraphConfig.js`:

```javascript
'kepler_third_law': {
    defaultVariable: 'a',  // Variable to graph
    bounds: {
        a: { min: 1e10, max: 1e13 },
        P: { min: 86400, max: 3.156e8 }
    },
    axisLabels: { x: 'Semi-major Axis (m)', y: 'Orbital Period (s)' }
}
```

## 📊 Performance

- **Search Response**: < 10ms per query
- **Calculation Speed**: < 1ms per formula
- **Graph Rendering**: 60fps with requestAnimationFrame throttling
- **Memory Usage**: Bounded caches, proper cleanup

## 🛡️ Security

- **XSS Protection** - HTML escaping, safe expression evaluation
- **Input Validation** - Type checking, range validation
- **Expression Sanitization** - Whitelist-based evaluation
- **No Eval** - Safe expression parsing (consider expr-eval for production)

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 📝 Development

### Adding a New Formula

1. Add formula definition to `scripts/formulas.js`
2. Add solver function to `scripts/calculator.js` (FormulaCalculator.solvers)
3. Add graph configuration to `scripts/formulaGraphConfig.js` (optional)
4. Run tests to verify

### Adding Graph Configuration

```javascript
// In scripts/formulaGraphConfig.js
'formula_id': {
    defaultVariable: 'x',
    bounds: {
        x: { min: 0, max: 100 },
        y: { min: 0, max: 1000 }
    },
    axisLabels: { x: 'X Label', y: 'Y Label' },
    description: 'Graph description'
}
```

## 🚀 Deployment

### Static Hosting

The app is a static site - deploy to any static host:

- **GitHub Pages**: Enable in repository settings
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect repository
- **Any Web Server**: Serve files via HTTP

### Service Worker

A service worker (`sw.js`) is included for offline support. Ensure HTTPS in production.

## 📚 Documentation

- **🆕 Architecture Plan**: See `ARCHITECTURE_PLAN.md` - Modernization strategy
- **🆕 Test Results**: See `TEST_RESULTS_SUMMARY.md` - Comprehensive test analysis
- **System Architecture**: See `SYSTEM_ARCHITECTURE.md`
- **Testing Plan**: See `COMPREHENSIVE_TESTING_PLAN.md`
- **Graph System**: See `GRAPH_SYSTEM_ENHANCEMENTS.md`
- **Formula Config**: See `scripts/formulaGraphConfig.js`

### 🎯 Expert System Confidence Tiers

The Expert System uses deterministic confidence scoring with clear tiers:

- **≥80% (Strong)** - Exact canonical questions (e.g., "What is the orbital period of a satellite 7000 km above Earth?")
- **60-79% (Good)** - Paraphrased but clear questions (e.g., "How to find escape velocity")
- **40-59% (Moderate)** - Partial or less specific questions (e.g., "period from orbit distance")
- **<40% (Weak/Rejected)** - Ambiguous, vague, or multi-formula questions

The system **refuses** questions that:
- Involve calculus (derivatives, integrals, rates of change)
- Are too ambiguous to map to a single formula
- Request multiple formulas simultaneously
- Are not physics/astrophysics related

See `tests/expert-system.test.js` for confidence calibration tests.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (`npx playwright test`)
5. Submit a pull request

### 🆕 Contributing Guidelines

- Follow the modular architecture patterns
- Add TypeScript types for new features
- Include tests for new functionality
- Update documentation
- Ensure proper cleanup in modules

## 📄 License

This project is for Science Olympiad Astronomy competition use.

## 🙏 Acknowledgments

- Science Olympiad Astronomy rules and formulas
- MathJax for LaTeX rendering
- Playwright for modern testing infrastructure
- All contributors and testers

## 📞 Support

For issues or questions, please open an issue on GitHub.

### 🆕 Troubleshooting

**Common Issues:**
- **Search not working**: Check if `#command-palette-input` is visible
- **Formula cards not clickable**: Check for overlay blocking
- **Tests failing**: Ensure correct selectors and timing
- **Graph not initializing**: Check readiness gating logs

**Debug Tools:**
- Use browser dev tools to check console logs
- Run specific test files to isolate issues
- Check for [GraphCoordinator] warnings in console

---

**Built with ❤️ for Science Olympiad Astronomy**

**🆕 Latest Update (Jan 2025)**: 
- ✅ All 58 tests passing
- ✅ Command palette search interface
- ✅ Accessibility improvements (ARIA, focus)
- ✅ Symbolic solver bug fixes
- ✅ Modular architecture stabilization
