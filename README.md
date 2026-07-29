# AstroCalc

Offline-first astronomy formula calculator for Science Olympiad. Search formulas, enter known values (with units), and solve for unknowns in the browser — no build step required.

## Quick start

```bash
# Install test/tooling deps (optional for just running the app)
npm install

# Serve the app from the repo root
./start_server.sh
# or
npm run dev
```

Open [http://localhost:8000](http://localhost:8000).

Expose to the internet (starts the local server if needed):

```bash
./expose_server.sh              # default: cloudflared
./expose_server.sh ngrok
./expose_server.sh localtunnel
```

## How it works

```
index.html
  → classic scripts (formulas.js, calculator.js, units, …)
  → scripts/ui/ui/init.js (ES module)
       → UIModuleOrchestrator
            → SearchEngine, CalculationOrchestrator, ExpertSystem, …
  → sw.js (offline precache)
```

| Piece | Path | Role |
|--------|------|------|
| Formula database | `scripts/formulas.js` | Formula definitions + concept metadata |
| Calculator | `scripts/calculator.js` | Algebraic / symbolic solve, safe evaluation |
| UI bootstrap | `scripts/ui/ui/init.js` | Wires modular UI |
| Expert system | `scripts/ui/ui/modules/expert/ExpertSystem.js` | Question → formula routing |
| Styles | `styles/main.css` | App UI |
| Service worker | `sw.js` | Offline shell; **bump `CACHE_VERSION` to publish asset updates** |

**JavaScript is the runtime source of truth.** The app is served as static files from the repo root. TypeScript is used only for Playwright configs/specs (`npm run type-check`). There is no Vite production build.

## Tests

```bash
npm test                 # Playwright suite
npm run ci:expert        # Expert system + coverage
npm run test:offline     # Offline / PWA
npm run verify:offline-precache
npm run verify:formulas
```

Focused exam-style Node checks:

```bash
node tests/exam_subparts_node_runner.cjs
```

## Docs

- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) — day-to-day files and commands
- [ARCHITECTURE.md](ARCHITECTURE.md) — multi-step solver design (aspirational layers; see note inside)
- [CALCULATOR_INPUT_SPECIFICATION.md](CALCULATOR_INPUT_SPECIFICATION.md) — calculator input contracts

## License / use

Built for Science Olympiad astronomy practice. Use offline in competition environments where network access is restricted.
