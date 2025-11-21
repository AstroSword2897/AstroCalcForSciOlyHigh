# 🌌 AstroCalc - Science Olympiad Astronomy Formula Calculator

A comprehensive, interactive web application for calculating astronomy and astrophysics formulas, designed specifically for Science Olympiad competitors and astronomy enthusiasts.

## ✨ Features

### 🔍 Advanced Natural Language Search
- **Smart Question Matching**: Ask questions in natural language (e.g., "what is the distance to a star", "how to calculate escape velocity")
- **Intent Detection**: Understands what you're trying to find (calculate, find, determine, etc.)
- **Directionality Recognition**: Recognizes "find X FROM Y" vs "find Y FROM X" for precise matching
- **Primary Use Case Matching**: Each formula has a main purpose (e.g., "temperature from wavelength")
- **Specificity Scoring**: High-specificity formulas rank higher for exact matches
- **Context-Aware Filtering**: Reduces scores for overly generic matches
- **Question Pattern Matching**: 250+ question patterns mapped to specific formulas
- **Concept Extraction**: Automatically identifies physics/astronomy concepts
- **Synonym Expansion**: 200+ concept synonyms for better matching
- **Hierarchical Concept Network**: Expands queries using parent-child-sibling relationships
- **Triple-Layer Cross-Concept Reinforcement**: Concept-to-concept, concept-to-formula, and formula-to-formula relationships
- **Semantic Matching**: Lightweight NLP with cosine similarity for conceptual matching
- **Usage Frequency Tracking**: Frequently searched terms get boosted in rankings
- **Result Limiting**: Shows only top 30 most relevant formulas, sorted by score

### 📊 Formula Calculator
- **Multi-Variable Solving**: Enter values for all variables except one to solve for it
- **Symbolic Results**: Use "N/A" option to get expressions with unentered variables
- **Systems of Equations**: Automatically generates systems of equations for multiple unknowns
- **Global Constants**: Automatically applies physical constants (G, c, σ, M☉, L☉, R☉, AU, π)
- **Unit Conversion**: Automatic unit conversion with multiple unit options per variable
- **Expression Parsing**: Supports mathematical expressions in input fields
- **Visual Indicators**: Highlights which variable will be solved
- **Example Values**: Placeholders show example values for each variable

### 📈 Interactive Graphing
- **Desmos Integration**: Real-time formula visualization using Desmos Graphing Calculator
- **Dynamic Updates**: Graphs update automatically as you change input values
- **Formula-Specific Graphs**: Custom graph types for different formula categories
- **Graph Interpretation**: Formula-specific tips and guidance for understanding graphs
- **Dual Graph Support**: Separate graphs for main calculator and interpretation sections
- **Auto-Scaling**: Automatic bounds calculation for optimal graph display

### 🔗 Formula Interlinking
- **Related Formulas**: Shows formulas related through:
  - Prerequisites (formulas needed to understand this one)
  - Derived From (formulas this is derived from)
  - Related To (conceptually related formulas)
  - Uses (formulas that use this one)
  - Generalizes/Specializes (more general or specific versions)
- **Cross-Concept Reinforcement**: Displays formulas connected through shared concepts
- **Auto-Discovery**: Automatically discovers relationships based on shared variables and concepts

### 🌟 Stellar Classification
- **HR Diagram Classification**: Classify stars based on temperature and luminosity
- **Spectral Type Determination**: Get spectral type from stellar properties

### 📚 Formula Categories
- **Orbital Mechanics**: Kepler's laws, orbital velocity, escape velocity, vis-viva equation
- **Radiation & Stellar Properties**: Luminosity, flux, magnitude, Wien's law, Stefan-Boltzmann
- **Telescopes & Optics**: Angular resolution, light gathering power, magnification
- **Cosmology & Relativity**: Hubble's law, redshift, lookback time, Schwarzschild radius
- **Doppler & Spectroscopy**: Doppler shift, equivalent width, spectral analysis
- **Planetary Science & Exoplanets**: Hill radius, synodic period, equilibrium temperature
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
python -m http.server 8000

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
git clone https://github.com/yourusername/AstroCalcForSciOlyHigh.git
cd AstroCalcForSciOlyHigh
```

2. Open `index.html` in your web browser, or serve it using a local web server (see above)

## 📖 Usage

### Searching for Formulas
1. Type your question in the search bar (e.g., "find temperature from spectrum")
2. Results are automatically filtered and sorted by relevance
3. Click on any formula card to open the calculator

### Using the Calculator
1. Enter values for all variables except the one you want to solve for
2. Leave one variable empty (or type "N/A") to solve for it
3. Click "Calculate" to see the result
4. Use the "N/A" checkbox to get symbolic expressions instead of errors

### Viewing Graphs
1. Select a formula and enter some values
2. Click the "Graph" tab to see an interactive visualization
3. Click "Graph Interpretation" for formula-specific tips and guidance

### Classification Tool
1. Click the "Classification" tab
2. Enter stellar temperature and luminosity
3. Get spectral type and HR diagram classification

## 🏗️ Project Structure

```
AstroCalcForSciOlyHigh/
├── index.html              # Main HTML file
├── scripts/
│   ├── ui.js               # UI logic, search, formula rendering
│   ├── calculator.js       # Formula calculation engine
│   ├── formulas.js         # Formula definitions and relationships
│   ├── graphManager.js     # Desmos graph integration
│   ├── unitConverter.js    # Unit conversion utilities
│   ├── expressionParser.js # Mathematical expression parsing
│   └── classification.js   # Stellar classification tool
├── styles/
│   └── main.css            # All styling
└── README.md               # This file
```

## 🔧 Technical Details

### Search Algorithm
- **Multi-Layer Scoring**: Combines exact matches, concept matches, question patterns, and semantic similarity
- **Relevance Ranking**: Formulas scored from 0-1000+ points based on match quality
- **Filtering**: Only shows formulas with score ≥ 100 or strong matches (name/question pattern)
- **Result Limiting**: Displays top 30 results maximum

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

### Graph System
- Uses Desmos Graphing Calculator API
- Automatically converts formulas to Desmos expressions
- Handles Unicode symbols (π, σ, √, etc.)
- Calculates appropriate bounds for visualization
- Supports caching for performance

## 📝 Formula List

The application includes 70+ astronomy and astrophysics formulas covering:
- Orbital mechanics and celestial dynamics
- Stellar physics and evolution
- Cosmology and general relativity
- Spectroscopy and Doppler effects
- Planetary science and exoplanets
- High-energy astrophysics
- Telescope optics and resolution

## 🎨 Features in Detail

### Smart Search Examples
- "find temperature from spectrum" → Wien's Displacement Law (high score)
- "how fast does a planet orbit" → Orbital Velocity formula
- "what velocity to escape" → Escape Velocity formula
- "distance to star" → Parallax Distance, Distance Modulus formulas

### Symbolic Calculation
Instead of errors when variables are missing, you can:
- Type "N/A" in any input field
- Check the "Mark as N/A" checkbox
- Get symbolic expressions like: `T = b / λmax` instead of an error

### Related Formulas
When viewing a formula, you'll see:
- **Prerequisites**: Formulas you should understand first
- **Derived From**: Formulas this builds upon
- **Related To**: Conceptually similar formulas
- **Uses This**: Formulas that use this one
- **Cross-Concept Reinforced**: Formulas connected through shared concepts

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

**Version**: 2.1  
**Last Updated**: 2025  
**Status**: Active Development
