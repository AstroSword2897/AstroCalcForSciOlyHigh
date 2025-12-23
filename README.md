# 🌌 AstroCalc - Science Olympiad Astronomy Calculator

**A comprehensive, offline-first astronomy formula calculator for Science Olympiad competitions.**

[![Offline-First](https://img.shields.io/badge/Offline-First-green)](https://github.com)
[![No AI Required](https://img.shields.io/badge/No%20AI-Required-blue)](https://github.com)
[![191 Formulas](https://img.shields.io/badge/Formulas-191-orange)](https://github.com)
[![71 Solvers](https://img.shields.io/badge/Solvers-71-yellow)](https://github.com)

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/AstroCalcForSciOlyHigh.git
cd AstroCalcForSciOlyHigh

# Start local server (port 8000)
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Production Deployment

The app works completely offline - just serve the files via any web server.

## ✨ Features

### 🧮 Calculator Engine
- **191 Astronomy Formulas** - Comprehensive coverage of Science Olympiad topics
- **71 Implemented Solvers** - Production-grade calculation engine
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

### 📊 Graph System
- **Enhanced Offline Graph Manager V2** - Fully offline, no external dependencies
- **Formula-Specific Graphs** - Each formula has its own designated graph configuration
- **Interactive Features** - Click-to-set values, hover tooltips, calculated point highlighting
- **Adaptive Sampling** - Recursive subdivision for high-quality curves
- **Resize Handling** - Debounced resize with error handling
- **Device Pixel Ratio** - Crisp rendering on high-DPI displays

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
│   ├── calculator.js          # Calculation engine (71 solvers)
│   ├── ui.js                  # UI controller and search engine
│   ├── enhancedOfflineGraph.js # Graph manager V2
│   ├── formulaGraphConfig.js  # Formula-specific graph configs
│   ├── unitConverter.js      # Unit conversion system
│   ├── expressionParser.js    # Expression parsing
│   └── ...                    # Additional utilities
├── tests/
│   ├── comprehensive_calculator_tests.js  # Calculator test suite
│   ├── conceptNetwork_tests.js           # Concept network tests
│   ├── run_production_tests.html         # Production test interface
│   └── ...                               # Additional test suites
├── styles/
│   └── main.css              # Application styles
└── libs/
    └── mathjax/              # MathJax for LaTeX rendering
```

## 🧪 Testing

### Run Calculator Tests

```bash
# Start server
python3 -m http.server 8000

# Open test interface
open http://localhost:8000/tests/run_production_tests.html
```

### Test Suites

1. **Calculator Tests** - Tests all 71 formulas with solvers (3 tests each)
2. **Concept Network Tests** - Dimensional integrity, weighted influence, stress tests
3. **Search Engine Tests** - 5,000 search queries with weighted concept scoring
4. **Integration Tests** - Full system integration verification

### Test Coverage

- ✅ **Calculator**: 213 tests (71 formulas × 3)
- ✅ **Concept Network**: 16 test categories
- ✅ **Search Engine**: 5,000 test queries
- ✅ **Integration**: Full system tests

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

- **System Architecture**: See `SYSTEM_ARCHITECTURE.md`
- **Testing Plan**: See `COMPREHENSIVE_TESTING_PLAN.md`
- **Graph System**: See `GRAPH_SYSTEM_ENHANCEMENTS.md`
- **Formula Config**: See `scripts/formulaGraphConfig.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is for Science Olympiad Astronomy competition use.

## 🙏 Acknowledgments

- Science Olympiad Astronomy rules and formulas
- MathJax for LaTeX rendering
- All contributors and testers

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for Science Olympiad Astronomy**
