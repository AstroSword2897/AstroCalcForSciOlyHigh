# 🌌 AstroCalc - Science Olympiad Astronomy Calculator

**A comprehensive, offline-first astronomy formula calculator for Science Olympiad competitions with modern modular architecture.**

[![Offline-First](https://img.shields.io/badge/Offline-First-green)](https://github.com)
[![No AI Required](https://img.shields.io/badge/No%20AI-Required-blue)](https://github.com)
[![191 Formulas](https://img.shields.io/badge/Formulas-191-orange)](https://github.com)
[![71 Solvers](https://img.shields.io/badge/Solvers-71-yellow)](https://github.com)
[![Modular Architecture](https://img.shields.io/badge/Architecture-Modular-purple)](https://github.com)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen)](https://github.com)

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

# Run Playwright tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run specific test
npx playwright test tests/calculator-final.spec.js
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
├── tests/                   # 🆕 Comprehensive test suite
│   ├── calculator-final.spec.js # Working calculator tests
│   ├── property-based.test.ts  # Property-based testing
│   ├── integration.test.ts     # Integration tests
│   ├── accessibility.test.ts    # Accessibility tests
│   ├── performance.test.ts      # Performance tests
│   └── page-load.spec.js        # Page load verification
├── styles/
│   └── main.css              # Application styles (with command palette fixes)
├── docs/                    # 🆕 Documentation
│   ├── ARCHITECTURE_PLAN.md  # Modernization strategy
│   └── TEST_RESULTS_SUMMARY.md # Test analysis
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

### 🆕 Modern Test Infrastructure

```bash
# Install Playwright
npm install

# Run all tests
npx playwright test

# Run with UI for debugging
npx playwright test --ui

# Run specific test file
npx playwright test tests/calculator-final.spec.js

# Run with specific browser
npx playwright test --project=chromium

# Generate report
npx playwright test --reporter=html
```

### Test Suites

1. **Calculator Tests** - Symbolic/numeric solving, N/A support
2. **Property-Based Tests** - Fuzz testing with seeded randomness
3. **Integration Tests** - Full system integration verification
4. **Accessibility Tests** - ARIA compliance and keyboard navigation
5. **Performance Tests** - Search response, calculation speed
6. **Page Load Tests** - DOM readiness and component initialization

### 🎯 Recent Test Fixes

- ✅ **Fixed search input visibility** - `#command-palette-input` now visible
- ✅ **Fixed formula card clickability** - Removed overlay blocking
- ✅ **Fixed duplicate calculate buttons** - Strict mode violations resolved
- ✅ **Updated test selectors** - Correct DOM element targeting
- ✅ **Fixed test synchronization** - Proper timing and state management

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
- **Search not working**: Check if `#command-palette-input` is visible (CSS fixed)
- **Formula cards not clickable**: Check for overlay blocking (pointer-events fixed)
- **Tests failing**: Ensure correct selectors and timing (updated in latest version)

**Debug Tools:**
- Use browser dev tools to check console logs
- Run `tests/page-load.spec.js` to verify basic functionality
- Check `TEST_RESULTS_SUMMARY.md` for known issues

---

**Built with ❤️ for Science Olympiad Astronomy**

**🆕 Latest Update**: Modern modular architecture, comprehensive test suite, symbolic solver fixes
