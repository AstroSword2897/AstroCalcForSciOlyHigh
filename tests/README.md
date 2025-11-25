# AstroCalc Test Suite

Comprehensive system-level testing for all AstroCalc features.

## Setup

1. Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

2. Start the local server:
```bash
python3 -m http.server 8000
```

3. Run tests:
```bash
npx playwright test
```

## Test Structure

- `navigation.spec.js` - Zero-time-waste navigation tests
- `search.spec.js` - Advanced search and confidence scoring
- `calculator.spec.js` - Calculator engine tests
- `frq.spec.js` - FRQ support system tests (to be added)
- `graph.spec.js` - Graph system tests (to be added)
- `classification.spec.js` - Classification tests (to be added)

## Running Specific Tests

```bash
# Run only navigation tests
npx playwright test navigation

# Run in headed mode
npx playwright test --headed

# Run with debug
npx playwright test --debug
```

## Test Coverage

The test suite covers:
- ✅ Keyboard shortcuts (Cmd/Ctrl+K, /, 1-4, arrows, Enter, Esc)
- ✅ Type-to-search
- ✅ Search accuracy and confidence scoring
- ✅ Domain-based formula boosting
- ✅ Calculator numerical solving
- ✅ Symbolic solving (N/A mode)
- ✅ Error handling
- ✅ Quick links
- ✅ Performance (search speed)

## Diagnostics Tool

For module-level verification, use `diagnostics.html`:
1. Open `diagnostics.html` in browser
2. Click "Run All Tests"
3. Review results and red flags

