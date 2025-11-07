# AstroCalc Structure & Architecture

## Project Overview
An interactive calculator for Science Olympiad High School astronomy formulas where users can:
- Browse a list of available formulas
- Select a formula
- Input variable values (or "null" for missing values)
- Calculate results based on provided inputs

## Technology Stack Options

### Option 1: Web Application (Recommended)
- **Frontend**: HTML/CSS/JavaScript (Vanilla or React/Vue)
- **Deployment**: Static site (GitHub Pages, Netlify, Vercel)
- **Pros**: Cross-platform, easy to share, no installation needed

### Option 2: Desktop Application
- **Framework**: Electron (JavaScript) or Python (Tkinter/PyQt)
- **Pros**: Native feel, offline capability

### Option 3: Python Script/CLI
- **Framework**: Python with input prompts
- **Pros**: Simple, fast to develop

## Data Structure

### Formula Definition
```json
{
  "id": "kepler_third_law",
  "name": "Kepler's Third Law",
  "description": "Relates orbital period to semi-major axis",
  "formula": "T² = (4π²/GM) × a³",
  "variables": [
    {
      "symbol": "T",
      "name": "Orbital Period",
      "unit": "seconds",
      "description": "Time for one complete orbit"
    },
    {
      "symbol": "a",
      "name": "Semi-major Axis",
      "unit": "meters",
      "description": "Half the longest diameter of the orbit"
    },
    {
      "symbol": "M",
      "name": "Central Mass",
      "unit": "kg",
      "description": "Mass of the central body"
    }
  ],
  "solver": {
    "type": "function",
    "code": "function solve(vars) { ... }"
  }
}
```

## Application Flow

1. **Formula Selection Screen**
   - Display list of all available formulas
   - Show formula name, description, and key variables
   - User clicks on a formula

2. **Input Screen**
   - Display the formula visually
   - Show all variables with input fields
   - User enters known values
   - User enters "null" for unknown values
   - "Calculate" button

3. **Calculation Logic**
   - Identify which variable needs to be solved (only one "null")
   - Rearrange formula to solve for that variable
   - Perform calculation
   - Display result with units

4. **Result Screen**
   - Show the solved value
   - Option to go back and modify inputs
   - Option to select another formula

## File Structure

```
AstroCalcForSciOlyHigh/
├── README.md
├── STRUCTURE.md (this file)
├── index.html (or main entry point)
├── styles/
│   └── main.css
├── scripts/
│   ├── formulas.js (formula definitions)
│   ├── calculator.js (calculation logic)
│   └── ui.js (user interface logic)
├── data/
│   └── formulas.json (formula database)
└── assets/
    └── (any images/icons)
```

## Formula Categories (Science Olympiad Astronomy)

1. **Orbital Mechanics**
   - Kepler's Laws
   - Orbital velocity
   - Escape velocity
   - Hohmann transfer

2. **Stellar Properties**
   - Luminosity
   - Apparent/Bolometric magnitude
   - Distance modulus
   - Stellar mass-radius relationship

3. **Cosmology**
   - Hubble's Law
   - Redshift
   - Distance calculations

4. **Planetary Science**
   - Surface gravity
   - Atmospheric scale height
   - Tidal forces

5. **Optics/Telescopes**
   - Magnification
   - Resolution
   - Light gathering power

## Implementation Phases

### Phase 1: Core Structure
- [ ] Set up project structure
- [ ] Create formula data model
- [ ] Implement basic UI layout
- [ ] Create formula list display

### Phase 2: Input System
- [ ] Build input form for variables
- [ ] Implement "null" handling
- [ ] Add input validation

### Phase 3: Calculation Engine
- [ ] Implement formula solver
- [ ] Handle unit conversions
- [ ] Error handling for invalid inputs

### Phase 4: Formula Library
- [ ] Add 10-20 common formulas
- [ ] Test each formula
- [ ] Add descriptions and units

### Phase 5: Polish
- [ ] Improve UI/UX
- [ ] Add formula search/filter
- [ ] Add favorites/bookmarks
- [ ] Export/import functionality

## Key Design Decisions Needed

1. **Technology Choice**: Web app vs Desktop vs CLI?
2. **Formula Storage**: JSON file vs JavaScript objects vs Database?
3. **Solver Approach**: 
   - Pre-written solver functions for each formula?
   - Symbolic math library (like math.js)?
   - Manual rearrangement of formulas?
4. **UI Style**: Simple/minimal vs feature-rich?
5. **Unit Handling**: Automatic conversion vs manual?

## Questions to Consider

- Should formulas support multiple unknowns (solve for any variable)?
- Do we need unit conversion (e.g., km to m, years to seconds)?
- Should we save calculation history?
- Do we need to show step-by-step solutions?
- Should formulas be editable by users?

---

**Next Steps**: 
1. Choose technology stack
2. Decide on formula storage format
3. Create initial formula list
4. Build MVP with 3-5 formulas to test the concept

