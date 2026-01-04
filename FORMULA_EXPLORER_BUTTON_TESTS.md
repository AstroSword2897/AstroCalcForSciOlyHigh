# Formula Explorer Button Test Suite

## Overview

This comprehensive test suite validates all interactive buttons in the Formula Explorer component. It uses Playwright for end-to-end browser testing.

## Test Coverage

### 1. View Mode Buttons (`.explorer-view-mode-btn`)
- ✅ Switch to search mode
- ✅ Switch to categories mode
- ✅ Switch to relationships mode
- ✅ Switch to calculator mode
- ✅ Clear calculation result when leaving calculator mode

### 2. Category Buttons (`.explorer-category-btn`)
- ✅ Toggle category selection
- ✅ Filter formulas by selected category

### 3. Formula Item Buttons (`.explorer-formula-item`)
- ✅ Select a formula when clicked
- ✅ Reset variable values when selecting a new formula
- ✅ Reset calculation result when selecting a new formula

### 4. Use Formula Button (`.explorer-use-formula-btn`)
- ✅ Call `selectFormula()` when clicked
- ✅ Switch to formulas tab when clicked

### 5. Related Formula Buttons (`.explorer-related-formula-btn`)
- ✅ Select related formula when clicked

### 6. Calculate Button (`.explorer-calculate-btn`)
- ✅ Perform calculation when clicked
- ✅ Handle missing inputs gracefully
- ✅ Handle invalid input gracefully

### 7. Copy Result Button (`.explorer-copy-btn`)
- ✅ Copy result to clipboard when clicked
- ✅ Not copy when result has error
- ✅ Show temporary "Copied!" feedback

### 8. Integration Tests
- ✅ Complete workflow: search → select → calculate → copy

## Running the Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests
```bash
npx playwright test tests/formula-explorer-buttons.test.js
```

### Run Specific Test Suite
```bash
# View Mode Buttons only
npx playwright test tests/formula-explorer-buttons.test.js -g "View Mode Buttons"

# Calculate Button only
npx playwright test tests/formula-explorer-buttons.test.js -g "Calculate Button"
```

### Run in UI Mode (Interactive)
```bash
npx playwright test tests/formula-explorer-buttons.test.js --ui
```

### Run with Debugging
```bash
# Run with Playwright Inspector
npx playwright test tests/formula-explorer-buttons.test.js --debug

# Run in headed mode (see browser)
npx playwright test tests/formula-explorer-buttons.test.js --headed
```

### Run Specific Browser
```bash
# Chrome only
npx playwright test tests/formula-explorer-buttons.test.js --project=chromium

# Firefox only
npx playwright test tests/formula-explorer-buttons.test.js --project=firefox

# Safari only
npx playwright test tests/formula-explorer-buttons.test.js --project=webkit
```

## Test Structure

Each test follows this pattern:

1. **Setup**: Navigate to app, wait for initialization, switch to Explorer tab
2. **Action**: Interact with button/element
3. **Assertion**: Verify expected behavior (state change, UI update, function call)

## Button Behavior Matrix

| Button | Selector | State Updated | Panel Updated | Special Behavior |
|--------|----------|---------------|---------------|-------------------|
| View Mode | `.explorer-view-mode-btn` | `viewMode` | Left & Right panel | Clears calculator result if leaving calc mode |
| Category | `.explorer-category-btn` | `selectedCategory` | Formula list | Toggle on/off |
| Formula Item | `.explorer-formula-item` | `selectedFormula`, `variableValues`, `calculationResult` | Right panel | Resets variable inputs |
| Use Formula | `.explorer-use-formula-btn` | N/A | N/A | Calls `selectFormula()`, switches tab |
| Related Formula | `.explorer-related-formula-btn` | `selectedFormula` | Right panel | Selects related formula |
| Calculate | `.explorer-calculate-btn` | `calculationResult` | Result box | Runs calculation, handles errors |
| Copy Result | `.explorer-copy-btn` | `copied` | Result box | Copies to clipboard, shows feedback |

## Expected State Changes

### View Mode Switching
- `formulaExplorerState.viewMode` updates to: `'search'`, `'categories'`, `'relationships'`, or `'calculator'`
- Left panel updates to show appropriate UI (search input, category list, etc.)
- Right panel updates based on mode
- If leaving calculator mode: `calculationResult` is cleared

### Category Selection
- `formulaExplorerState.selectedCategory` toggles between `null` and category name
- Formula list filters to show only formulas in selected category
- Category button gets/removes `active` class

### Formula Selection
- `formulaExplorerState.selectedFormula` updates to selected formula object
- `formulaExplorerState.variableValues` resets to `{}`
- `formulaExplorerState.calculationResult` resets to `null`
- Right panel displays formula details
- Formula item gets `active` class

### Calculation
- `formulaExplorerState.calculationResult` updates with result object
- Result display shows formatted result or error message
- Handles edge cases: missing inputs, invalid input, division by zero, etc.

### Copy to Clipboard
- `formulaExplorerState.copied` toggles to `true`, then back to `false` after 2 seconds
- Clipboard contains result text (if valid result)
- UI shows "✓ Copied!" feedback temporarily

## Troubleshooting

### Tests Fail with "Element not found"
- Ensure the app is fully loaded before tests run
- Check that `#formula-explorer-container` exists
- Verify Formula Explorer is initialized (`initFormulaExplorer()` called)

### Clipboard Tests Fail
- Ensure browser has clipboard permissions
- Some test environments may not support clipboard API
- Tests gracefully handle clipboard API unavailability

### Timing Issues
- Tests include `waitForTimeout()` calls to allow UI updates
- If tests are flaky, increase timeout values
- Use `page.waitForSelector()` for more reliable waiting

### Mock Functions Not Working
- Ensure global functions (`selectFormula`, `switchMainTab`) exist
- Check that mocks are set up before button clicks
- Verify function calls in browser console

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Formula Explorer Tests
  run: |
    npm install
    npx playwright install --with-deps
    npx playwright test tests/formula-explorer-buttons.test.js
```

## Maintenance

When adding new buttons or changing button behavior:

1. Add corresponding test case in appropriate `test.describe()` block
2. Update this documentation with new button details
3. Update the Button Behavior Matrix table
4. Run tests to ensure they pass

## Related Files

- `scripts/formulaExplorer.js` - Implementation of Formula Explorer
- `tests/formula-explorer-buttons.test.js` - Test suite (this file)
- `playwright.config.js` - Playwright configuration

