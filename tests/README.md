# AstroCalc Test Suite

Playwright tests for search, calculator, expert system, navigation, and offline PWA behavior.

## Setup

```bash
npm install
npx playwright install
```

Playwright starts `python3 -m http.server 8000` automatically (`playwright.config.ts`).

## Run

```bash
npm test
npm run ci:expert
npm run test:offline
npm run verify:offline-precache
```

Focused Node exam checks:

```bash
node tests/exam_subparts_node_runner.cjs
```
