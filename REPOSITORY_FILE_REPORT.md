# Repository File Report
## Complete Documentation of All Files

Generated: $(date)

---

## 📁 Root Directory Files

### `index.html`
**Purpose**: Main application entry point
**Function**: 
- HTML structure for the entire calculator application
- Loads all scripts in correct dependency order
- Contains all UI elements (formula selection, calculator, graph, classification tabs)
- Registers service worker for offline functionality
- Includes diagnostic tools and accessibility features

### `manifest.json`
**Purpose**: PWA (Progressive Web App) manifest
**Function**: Defines app metadata for installation and offline use

### `README.md`
**Purpose**: Project documentation
**Function**: Overview, setup instructions, features

---

## 📁 Scripts Directory

### Core Application Files

#### `scripts/formulas.js` (9,740 lines)
**Purpose**: Formula database
**Function**: 
- Contains all astronomical formulas with variables, equations, descriptions
- Defines formula categories and concept hierarchies
- Includes formula-specific presets and constants
- Exports `formulas` array, `formulaCategories`, `globalConstants`, `FORMULA_INSTRUCTIONS`

#### `scripts/calculator.js`
**Purpose**: Core calculation engine
**Function**:
- `FormulaCalculator` class that solves formulas
- Handles numeric and symbolic calculations
- Error propagation and precision handling
- Unit conversion integration

#### `scripts/unitConverter.js`
**Purpose**: Unit conversion system
**Function**: Converts between different units (meters, kilometers, solar masses, etc.)

#### `scripts/unitParser.js`
**Purpose**: Parse unit strings
**Function**: Extracts units from input strings (e.g., "5 km" → 5, "km")

#### `scripts/expressionParser.js`
**Purpose**: Parse mathematical expressions
**Function**: Safely evaluates expressions like "2*pi", "1e10", handles scientific notation

#### `scripts/dimensionalAnalysis.js`
**Purpose**: Dimensional analysis validation
**Function**: Checks if calculations have correct physical dimensions

#### `scripts/classification.js`
**Purpose**: Stellar classification system
**Function**: 
- `StellarClassifier` class
- Classifies stars based on temperature, luminosity class
- Handles white dwarf types and protostars

#### `scripts/formulaExplorer.js`
**Purpose**: Formula exploration interface
**Function**: Interactive tree view of formulas organized by category

#### `scripts/enhancedOfflineGraph.js`
**Purpose**: Enhanced offline graph manager (V2)
**Function**:
- `EnhancedOfflineGraphManagerV2` class
- Canvas-based graph rendering (works offline)
- Handles formula visualization, calculated points, error bands

#### `scripts/offlineGraphManager.js`
**Purpose**: Basic offline graph manager (V1)
**Function**: Fallback graph manager using HTML5 Canvas

#### `scripts/graphManager.js`
**Purpose**: Online graph manager (Desmos)
**Function**: Integration with Desmos API (requires internet)

#### `scripts/formulaGraphConfig.js`
**Purpose**: Graph configuration
**Function**: Defines which formulas should auto-graph and graph settings

#### `scripts/frqSupport.js`
**Purpose**: Free Response Question support
**Function**: Helps with multi-step problem solving

#### `scripts/quickNav.js`
**Purpose**: Quick navigation
**Function**: Keyboard shortcuts and quick access features

#### `scripts/accessibility.js`
**Purpose**: Accessibility features
**Function**: Reduced motion, high contrast, keyboard navigation

#### `scripts/utils.js`
**Purpose**: General utilities
**Function**: Helper functions used throughout the app

#### `scripts/safeExpressionEvaluator.js`
**Purpose**: Safe expression evaluation
**Function**: Evaluates expressions without using `eval()` (security)

#### `scripts/precisionCalculator.js`
**Purpose**: Precision handling
**Function**: Manages significant figures and rounding

#### `scripts/errorPropagation.js`
**Purpose**: Error propagation
**Function**: Calculates uncertainty in derived quantities

#### `scripts/accuracyEnhancements.js`
**Purpose**: Accuracy improvements
**Function**: Enhances calculation accuracy with confidence intervals

#### `scripts/performanceOptimizer.js`
**Purpose**: Performance optimization
**Function**: Caching, debouncing, performance monitoring

#### `scripts/calculationCache.js`
**Purpose**: Calculation caching
**Function**: Caches calculation results for performance

#### `scripts/moduleInitializer.js`
**Purpose**: Module initialization tracking
**Function**: Tracks which modules have loaded

---

## 📁 Scripts/UI Directory

### Main UI File

#### `scripts/ui.js` (318 lines - CLEANED)
**Purpose**: Thin UI orchestrator
**Function**:
- Delegates to modular architecture
- Provides backward compatibility wrappers
- Basic initialization and global function exposure
- Fallback rendering if modules unavailable

### Core Modules (`scripts/ui/core/`)

#### `scripts/ui/core/LifecycleManager.js`
**Purpose**: Lifecycle management
**Function**: Tracks and cleans up event listeners, timeouts, intervals

#### `scripts/ui/core/StateManager.js`
**Purpose**: State management
**Function**: Centralized state storage and retrieval

#### `scripts/ui/core/IntegrationHelpers.js`
**Purpose**: Integration helpers
**Function**: Provides backward-compatible wrappers for new modules

### State Management (`scripts/ui/state/`)

#### `scripts/ui/state/UIStateManager.js`
**Purpose**: UI state management
**Function**: Manages current formula, calculator, graph manager state

### Event Management (`scripts/ui/events/`)

#### `scripts/ui/events/EventHandlers.js`
**Purpose**: Event handlers
**Function**: Centralized event handling logic

### Utilities (`scripts/ui/utils/`)

#### `scripts/ui/utils/DOMRefs.js`
**Purpose**: DOM element caching
**Function**: Caches DOM queries using WeakMap for performance

#### `scripts/ui/utils/ErrorHandler.js`
**Purpose**: Error handling
**Function**: Standardized error display and logging

#### `scripts/ui/utils/SafeMathEvaluator.js`
**Purpose**: Safe math evaluation
**Function**: Tokenizer/parser-based evaluation (no eval())

### Rendering Modules (`scripts/ui/rendering/`)

#### `scripts/ui/rendering/FormulaCards.js`
**Purpose**: Formula card rendering
**Function**: Renders formula cards in the formula list

#### `scripts/ui/rendering/SearchResults.js`
**Purpose**: Search results rendering
**Function**: Renders search results with scores and highlights

#### `scripts/ui/rendering/VariableInputs.js`
**Purpose**: Variable input rendering
**Function**: Renders input fields for formula variables

#### `scripts/ui/rendering/ResultDisplay.js`
**Purpose**: Result display
**Function**: Displays calculation results with formatting

#### `scripts/ui/rendering/MathJaxRenderer.js`
**Purpose**: MathJax rendering
**Function**: Handles MathJax rendering for equations

#### `scripts/ui/rendering/FormulaPresets.js`
**Purpose**: Formula preset rendering
**Function**: Renders preset buttons for formulas

#### `scripts/ui/rendering/ClassificationDisplay.js`
**Purpose**: Classification display
**Function**: Displays stellar classification results

### Feature Modules (`scripts/ui/modules/`)

#### Search Module (`scripts/ui/modules/search/`)

##### `scripts/ui/modules/search/interfaces.ts`
**Purpose**: TypeScript interfaces for search
**Function**: Defines types for SearchCache, SemanticSearchSystem, etc.

##### `scripts/ui/modules/search/Scorer.ts`
**Purpose**: Formula scoring logic
**Function**: Scores formulas against search queries (name, description, concepts, etc.)

##### `scripts/ui/modules/search/SearchEngine.ts`
**Purpose**: Search orchestration
**Function**: 
- Coordinates search with caching
- Uses Scorer for ranking
- Handles search history and validation

#### Calculation Module (`scripts/ui/modules/calculation/`)

##### `scripts/ui/modules/calculation/CalculationOrchestrator.ts`
**Purpose**: Calculation orchestration
**Function**:
- Collects variable values from DOM
- Validates inputs
- Calls FormulaCalculator
- Displays results
- Updates graphs
- Tracks calculation history

#### Tab Management (`scripts/ui/modules/tabs/`)

##### `scripts/ui/modules/tabs/TabManager.ts`
**Purpose**: Tab switching logic
**Function**:
- Switches between main tabs (Formulas, Explorer, Classification)
- Switches between sub-tabs (Calculator, Graph, Classification)
- Handles visibility and initialization
- Retry logic for tab initialization

#### Graph Module (`scripts/ui/modules/graph/`)

##### `scripts/ui/modules/graph/GraphCoordinator.ts`
**Purpose**: Graph coordination
**Function**:
- Ensures graph manager is initialized
- Updates graphs with formula data
- Handles graph tab activation
- Queues updates to prevent race conditions
- Retry logic with exponential backoff

#### Formula Selection (`scripts/ui/modules/formula/`)

##### `scripts/ui/modules/formula/FormulaSelector.ts`
**Purpose**: Formula selection handling
**Function**:
- Handles formula card clicks
- Initializes calculator for selected formula
- Renders variable inputs
- Renders formula presets
- Updates UI state

#### Event Coordination (`scripts/ui/modules/events/`)

##### `scripts/ui/modules/events/EventCoordinator.ts`
**Purpose**: Event listener management
**Function**:
- Sets up all event listeners
- Handles back button, tab buttons, calculate button
- Classification button handlers
- Formula card click delegation
- Cleanup on navigation

#### Utilities (`scripts/ui/modules/utils/`)

##### `scripts/ui/modules/utils/CalculationUtils.ts`
**Purpose**: Calculation utilities
**Function**: 
- `parseNumericValue`: Parse numbers from strings
- `safeEvaluateExpression`: Safe expression evaluation
- `replaceVariables`: Replace variables in expressions

##### `scripts/ui/modules/utils/FormattingUtils.ts`
**Purpose**: Formatting utilities
**Function**: 
- `displayError`: Display error messages
- `displayResult`: Display calculation results
- `formatNumber`: Format numbers with precision
- `escapeHtml`: Escape HTML for security

### Orchestrator

#### `scripts/ui/UIModuleOrchestrator.ts`
**Purpose**: Main orchestrator
**Function**:
- Initializes all modules
- Wires dependencies together
- Exposes functions globally for backward compatibility
- Coordinates module interactions

#### `scripts/ui/init.ts`
**Purpose**: UI initialization
**Function**: Auto-initializes orchestrator when DOM is ready

### Migration (`scripts/ui/migration/`)

#### `scripts/ui/migration/UIMigrationBridge.js`
**Purpose**: Migration bridge
**Function**: Enables gradual migration from legacy code to modules

---

## 📁 Scripts/Events Directory

#### `scripts/events/EventManager.ts`
**Purpose**: Event management system
**Function**: Centralized event bus for component communication

#### `scripts/events/EventBus.ts`
**Purpose**: Event bus implementation
**Function**: Pub/sub pattern for events

#### `scripts/events/event-manager.js`
**Purpose**: Legacy event manager
**Function**: Backward compatibility for old event system

---

## 📁 Scripts/Types Directory

#### `scripts/types/formula.ts`
**Purpose**: TypeScript type definitions
**Function**: Defines interfaces for Formula, Variable, CalculationResult, SearchResult, etc.

---

## 📁 Scripts/Utils Directory

#### `scripts/utils/dom.js`
**Purpose**: DOM utilities
**Function**: DOM caching, batching, visibility helpers

#### `scripts/utils/CleanupManager.js`
**Purpose**: Cleanup management
**Function**: Tracks and cleans up resources

---

## 📁 Scripts/Search Directory

#### `scripts/search/formula-search.js`
**Purpose**: Semantic search system
**Function**: Advanced search with concept matching and semantic understanding

---

## 📁 Scripts/State Directory

#### `scripts/state/app-state.js`
**Purpose**: Application state
**Function**: Global application state management

---

## 📁 Tests Directory

#### `tests/integrationTest.js`
**Purpose**: Integration tests
**Function**: Tests that all modules work together

#### `tests/run_production_tests.html`
**Purpose**: Production test suite
**Function**: Comprehensive browser-based testing

---

## 📁 Styles Directory

#### `styles/main.css`
**Purpose**: Main stylesheet
**Function**: All CSS styling for the application

---

## 📁 Other Files

### TypeScript Configuration

#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration
**Function**: Defines compilation options for TypeScript files

### Documentation

#### `INTEGRATION_COMPLETE.md`
**Purpose**: Integration documentation
**Function**: Documents completed integration work

#### `MODULAR_DESIGN_COMPLETE.md`
**Purpose**: Modular design documentation
**Function**: Documents the modular architecture

#### `REPOSITORY_FILE_REPORT.md` (this file)
**Purpose**: File documentation
**Function**: Comprehensive report of all files

---

## 📊 Statistics

- **Total Files**: ~100+ files
- **TypeScript Modules**: 28 modules
- **JavaScript Files**: 50+ files
- **Lines of Code**: 
  - `formulas.js`: 9,740 lines (data)
  - `ui.js`: 318 lines (down from 10,927)
  - All modules: ~5,000 lines total

---

## 🎯 Architecture Overview

### Modular Structure
1. **Core**: Lifecycle, State, Integration
2. **Modules**: Search, Calculation, Tabs, Graph, Formula, Events, Utils
3. **Rendering**: FormulaCards, SearchResults, VariableInputs, ResultDisplay, etc.
4. **Orchestrator**: Wires everything together

### Data Flow
1. User interacts with UI
2. EventCoordinator captures events
3. Appropriate module handles logic
4. Rendering modules update DOM
5. StateManager tracks state

### Key Principles
- **Separation of Concerns**: Each module has single responsibility
- **Dependency Injection**: Modules receive dependencies
- **Type Safety**: TypeScript for all new code
- **Backward Compatibility**: Legacy code still works
- **Performance**: Caching, debouncing, optimization

---

## 🔍 Quick Reference

### Need to find...
- **Formula data**: `scripts/formulas.js`
- **Calculation logic**: `scripts/calculator.js`
- **Search**: `scripts/ui/modules/search/`
- **UI rendering**: `scripts/ui/rendering/`
- **Event handling**: `scripts/ui/modules/events/`
- **State management**: `scripts/ui/state/`
- **Graph rendering**: `scripts/enhancedOfflineGraph.js`
- **Type definitions**: `scripts/types/formula.ts`

---

*Last updated: $(date)*

