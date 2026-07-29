# Quick Start Guide

## Files that matter

| File | Purpose |
|------|---------|
| `index.html` | App entry — open via local server |
| `scripts/formulas.js` | Formula database |
| `scripts/calculator.js` | Calculation engine |
| `scripts/ui/ui/init.js` | UI bootstrap (ES module) |
| `scripts/ui/ui/UIModuleOrchestrator.js` | Search, calculate, tabs, expert wiring |
| `styles/main.css` | UI styles |
| `sw.js` | Offline service worker (`CACHE_VERSION`) |

## Run

```bash
./start_server.sh
# → http://localhost:8000

./stop_server.sh

./expose_server.sh cloudflared   # optional public URL
```

Or: `npm run dev` (same static server on port 8000).

## Test

```bash
npm test
npm run ci:expert
npm run verify:offline-precache
```

## Flow

1. Server serves `index.html` and scripts from the repo root.
2. Search / command palette → `SearchEngine` scores formulas.
3. Select a formula → variable inputs render.
4. Calculate → `CalculationOrchestrator` + `FormulaCalculator` solve with unit conversion.
5. Service worker caches the shell so refresh works offline after the first online visit.

## Offline updates

Query strings on asset URLs are ignored by the service worker (`ignoreSearch`). To force clients to pick up CSS/JS changes, bump `CACHE_VERSION` in `sw.js`.
