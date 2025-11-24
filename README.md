# 🌌 AstroCalc - Science Olympiad Astronomy Formula Calculator

A comprehensive, interactive web application for calculating astronomy and astrophysics formulas, designed specifically for Science Olympiad competitors and astronomy enthusiasts. Features **193+ formulas** with advanced search, FRQ support, and zero-time-waste navigation.

## ✨ Key Features

### ⚡ **Zero-Time-Waste Navigation**
- **Keyboard Shortcuts**: Full keyboard navigation for power users
  - `Cmd/Ctrl + K` - Instant search focus
  - `Cmd/Ctrl + /` - Command palette
  - `1-4` - Switch tabs instantly
  - `↑/↓` - Navigate formula cards
  - `Enter` - Open selected formula
  - `Esc` - Quick navigation back
  - `?` - Show all shortcuts
- **Type-to-Search**: Start typing anywhere to search instantly
- **Quick Links**: Jump to related formulas with one click
- **Command Palette**: Instant formula search and actions
- **50ms Search**: Ultra-fast search with minimal delay

### 🎯 **Free Response Question (FRQ) Support System**
- **Confidence Scoring**: Visual confidence badges (0-100%) for search results
- **Dynamic Usage Instructions**: Step-by-step guidance tailored to each formula
- **Contextual Hints**: Problem type detection, key concepts, approach steps
- **Graph Interpretation**: Formula-specific graph reading guides
- **Application Problem Support**: Handles multi-step, expression derivation, and scenario-based problems
- **Multi-Part Problem Handling**: Detects and guides through interconnected sub-questions (a, b, c, d, e)
- **Calculus Support**: Guidance for derivatives, chain rule, and integration problems
- **Concept Matching**: Universal matching for ANY astrophysics question, even remotely related concepts

### 🔍 **Advanced Natural Language Search**
- **Smart Question Matching**: Ask questions in natural language (e.g., "what is the distance to a star", "how to calculate escape velocity")
- **Confidence Scores**: Each result shows match confidence with detailed metrics
- **Explorer-Style Results**: Two-panel layout with formula list and detailed view
- **Intent Detection**: Understands what you're trying to find (calculate, find, determine, etc.)
- **Question Pattern Matching**: 250+ question patterns mapped to specific formulas
- **Concept Extraction**: Automatically identifies physics/astronomy concepts
- **Hierarchical Concept Network**: Expands queries using parent-child-sibling relationships
- **Semantic Matching**: Lightweight NLP with cosine similarity for conceptual matching
- **Result Limiting**: Shows only top 50 most relevant formulas, sorted by confidence

### 📊 **Formula Calculator**
- **Multi-Variable Solving**: Enter values for all variables except one to solve for it
- **Symbolic Results**: Use "N/A" option to get expressions with unentered variables
- **Systems of Equations**: Automatically generates systems of equations for multiple unknowns
- **Global Constants**: Automatically applies physical constants (G, c, σ, M☉, L☉, R☉, AU, π)
- **Unit Conversion**: Automatic unit conversion with multiple unit options per variable
- **Expression Parsing**: Supports mathematical expressions in input fields
- **Visual Indicators**: Highlights which variable will be solved
- **Example Values**: Placeholders show example values for each variable

### 📈 **Interactive Graphing**
- **Desmos Integration**: Real-time formula visualization using Desmos Graphing Calculator
- **Dynamic Updates**: Graphs update automatically as you change input values
- **Formula-Specific Graphs**: Custom graph types for different formula categories
- **Graph Interpretation**: Formula-specific tips and guidance for understanding graphs
- **Dual Graph Support**: Separate graphs for main calculator and interpretation sections
- **Auto-Scaling**: Automatic bounds calculation for optimal graph display

### 🔗 **Formula Interlinking & Quick Access**
- **Related Formulas**: Shows formulas related through:
  - Prerequisites (formulas needed to understand this one)
  - Derived From (formulas this is derived from)
  - Related To (conceptually related formulas)
  - Uses (formulas that use this one)
  - Generalizes/Specializes (more general or specific versions)
- **Quick Links on Cards**: One-click access to top 3 related formulas
- **Cross-Concept Reinforcement**: Displays formulas connected through shared concepts
- **Auto-Discovery**: Automatically discovers relationships based on shared variables and concepts

### 🌟 **Stellar Classification**
- **HR Diagram Classification**: Classify stars based on temperature and luminosity
- **Spectral Type Determination**: Get spectral type from stellar properties
- **White Dwarf Classification**: Support for DA, DB, DC, DO, DQ, DZ, DX types
- **Protostar/YSO Classification**: Classify young stellar objects

### 📚 **Formula Categories (193+ Formulas)**
- **Orbital Mechanics**: Kepler's laws, orbital velocity, escape velocity, vis-viva equation, binary systems
- **Radiation & Stellar Properties**: Luminosity, flux, magnitude, Wien's law, Stefan-Boltzmann
- **Telescopes & Optics**: Angular resolution, light gathering power, magnification
- **Cosmology & Relativity**: Hubble's law, redshift, lookback time, Schwarzschild radius
- **Doppler & Spectroscopy**: Doppler shift, equivalent width, spectral analysis
- **Planetary Science & Exoplanets**: Hill radius, synodic period, equilibrium temperature, transit depth
- **High Energy Astrophysics**: Synchrotron radiation, cooling timescales, gamma-ray physics
- **Stellar Structure**: Hydrostatic balance, stellar lifetime, mass-luminosity relation

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for MathJax and Desmos API)
- No installation required - runs entirely in the browser

### Quick Download & Use (Recommended)

**Easiest Method:**
1. Download the entire project folder as a ZIP file
2. Extract it to any location on your computer
3. Double-click `index.html` to open in your browser
4. That's it! The calculator works immediately

**For Best Experience (Optional):**
Use a local web server for optimal performance:

```bash
# Navigate to the project folder, then:

# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Sharing the Calculator

To share with others:
1. Create a ZIP file containing all project files
2. Share the ZIP file (via email, cloud storage, etc.)
3. Recipients extract and open `index.html`

**See `DOWNLOAD_INSTRUCTIONS.md` for detailed sharing guide.**

### Installation (For Developers)

1. Clone the repository:
```bash
git clone https://github.com/AstroSword2897/AstroCalcForSciOlyHigh.git
cd AstroCalcForSciOlyHigh
```

2. Open `index.html` in your web browser, or serve it using a local web server (see above)

## 📖 Usage

### Quick Start Guide

1. **Search**: Press `Cmd/Ctrl + K` or start typing to search
2. **Navigate**: Use arrow keys to browse formulas, Enter to open
3. **Calculate**: Enter values, leave one empty, click Calculate
4. **Related**: Click quick links on cards to jump to related formulas
5. **Help**: Press `?` to see all keyboard shortcuts

### Searching for Formulas

1. Type your question in the search bar (e.g., "find temperature from spectrum", "orbital decay rate")
2. Results show confidence scores and match details
3. Click on any formula card to open the calculator
4. Use Explorer-style two-panel view for detailed browsing

### Using the Calculator

1. Enter values for all variables except the one you want to solve for
2. Leave one variable empty (or type "N/A") to solve for it
3. Click "Calculate" to see the result
4. Use the "N/A" checkbox to get symbolic expressions instead of errors

### FRQ Support Features

When viewing a formula, you'll see:
- **Usage Instructions**: Step-by-step guide tailored to the formula
- **Contextual Hints**: Problem type, key concepts, approach steps
- **Graph Interpretation**: How to read and use the graph
- **Confidence Score**: How well the formula matches your question
- **Related Concepts**: Connected topics and formulas

### Viewing Graphs

1. Select a formula and enter some values
2. Click the "Graph" tab to see an interactive visualization
3. Click "Graph Interpretation" for formula-specific tips and guidance

### Classification Tool

1. Click the "Classification" tab
2. Enter stellar temperature and luminosity
3. Get spectral type and HR diagram classification

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Focus search |
| `Cmd/Ctrl + /` | Open command palette |
| `1-4` | Switch tabs |
| `↑/↓` | Navigate formula cards |
| `Enter` | Open selected formula |
| `Esc` | Go back / Close modals |
| `?` | Show help overlay |
| Type letters | Start searching instantly |

## 🏗️ Project Structure

```
AstroCalcForSciOlyHigh/
├── index.html                  # Main HTML file
├── scripts/
│   ├── ui.js                   # UI logic, search, formula rendering
│   ├── calculator.js           # Formula calculation engine
│   ├── formulas.js             # 193+ formula definitions
│   ├── frqSupport.js           # FRQ support system
│   ├── quickNav.js             # Quick navigation & keyboard shortcuts
│   ├── graphManager.js         # Desmos graph integration
│   ├── formulaExplorer.js      # Formula explorer interface
│   ├── unitConverter.js        # Unit conversion utilities
│   ├── expressionParser.js     # Mathematical expression parsing
│   ├── classification.js       # Stellar classification tool
│   └── utils.js                # Utility functions
├── styles/
│   └── main.css                # All styling
└── README.md                   # This file
```

## 🔧 Technical Details

### Search Algorithm
- **Multi-Layer Scoring**: Combines exact matches, concept matches, question patterns, and semantic similarity
- **Confidence Scoring**: 0-100% confidence with detailed match metrics
- **Relevance Ranking**: Formulas scored from 0-1000+ points based on match quality
- **Filtering**: Only shows formulas with score ≥ 100 or strong matches (name/question pattern)
- **Result Limiting**: Displays top 50 results maximum
- **Caching**: Concept expansion and metadata caching for performance

### FRQ Support System
- **Data-Driven**: Formula metadata stored in JSON structure
- **Intelligent Fallbacks**: Structure-based guidance when metadata unavailable
- **Step Numbering**: Reliable step counter (no duplicates/skips)
- **Accumulation**: Graph interpretations accumulate for multi-feature formulas
- **Intermediate Results**: Stores computed values for multi-step problems
- **Priority System**: Metadata → Formula-specific → Structure-based → Generic

### Formula Metadata
Each formula includes:
- `id`: Unique identifier
- `name`: Human-readable name
- `description`: Detailed explanation
- `equation`: Mathematical formula
- `primaryUseCase`: Main purpose (e.g., "temperature from wavelength")
- `specificity`: 1-10 rating for how specific the formula is
- `questionPatterns`: Array of common questions that match this formula
- `concepts`: Array of physics/astronomy concepts
- `keywords`: Searchable keywords
- `variables`: Array of variable definitions with units
- `constants`: Physical constants used
- `relationships`: Links to related formulas
- `frqMetadata`: FRQ support data (instructions, hints, graph interpretation)

### Graph System
- Uses Desmos Graphing Calculator API
- Automatically converts formulas to Desmos expressions
- Handles Unicode symbols (π, σ, √, etc.)
- Calculates appropriate bounds for visualization
- Supports caching for performance

## 📝 Formula List

The application includes **193+ astronomy and astrophysics formulas** covering:
- Orbital mechanics and celestial dynamics
- Stellar physics and evolution
- Cosmology and general relativity
- Spectroscopy and Doppler effects
- Planetary science and exoplanets
- High-energy astrophysics
- Telescope optics and resolution
- Binary systems and gravitational waves
- Exoplanet detection and transit methods

## 🎨 Features in Detail

### Smart Search Examples
- "find temperature from spectrum" → Wien's Displacement Law (high confidence)
- "how fast does a planet orbit" → Orbital Velocity formula
- "what velocity to escape" → Escape Velocity formula
- "distance to star" → Parallax Distance, Distance Modulus formulas
- "orbital decay rate" → White Dwarf Orbital Decay (with calculus guidance)
- "transit depth inclination" → Transit Depth with application problem support

### FRQ Problem Types Supported
- **Direct Questions**: "What is the period?"
- **Application Problems**: "Given that all three members line up..."
- **Multi-Step Problems**: Problems requiring multiple calculations
- **Expression Derivation**: "Provide a simplified expression for..."
- **Relationship Problems**: "Express X in terms of Y"
- **Graph-Based Problems**: Radial velocity graphs, spectrum graphs, light curves
- **Calculus Problems**: Derivatives, chain rule, integration
- **Multi-Part Problems**: Interconnected sub-questions (a, b, c, d, e)

### Symbolic Calculation
Instead of errors when variables are missing, you can:
- Type "N/A" in any input field
- Check the "Mark as N/A" checkbox
- Get symbolic expressions like: `T = b / λmax` instead of an error

### Related Formulas
When viewing a formula, you'll see:
- **Quick Links**: Top 3 related formulas on each card
- **Prerequisites**: Formulas you should understand first
- **Derived From**: Formulas this builds upon
- **Related To**: Conceptually similar formulas
- **Uses This**: Formulas that use this one
- **Cross-Concept Reinforced**: Formulas connected through shared concepts

## 🎯 Performance Optimizations

- **50ms Search Debounce**: Ultra-fast search response
- **Result Caching**: Concept expansion and metadata caching
- **Lazy Loading**: Formulas loaded on demand
- **Debounced Rendering**: Smooth UI updates
- **Virtual Scrolling**: Efficient rendering of large lists
- **Memoization**: Cached function results

## 🐛 Known Issues

None currently. Please report issues via GitHub Issues.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available for educational use.

## 🙏 Acknowledgments

- Desmos Graphing Calculator for graph visualization
- Science Olympiad Astronomy community for formula requirements
- All contributors and testers

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Version**: 3.0  
**Last Updated**: 2025  
**Status**: Active Development  
**Formulas**: 193+  
**Features**: FRQ Support, Quick Navigation, Advanced Search, Graph Interpretation
