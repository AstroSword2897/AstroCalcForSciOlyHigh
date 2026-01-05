# TS Cleanup Plan (Decision: JS as source of truth unless build is reintroduced)

## Current state
- Runtime loads only `.js` (see `index.html`), no build step runs.
- 70+ `.ts` and 20+ `.d.ts` files remain from a partial migration.
- `tsconfig.json` has `noEmit: true`; TypeScript is not producing runtime JS.

## Recommendation
- Declare JavaScript as the source of truth until a build step is adopted.
- Remove unused `.ts` and `.d.ts` to reduce confusion and maintenance cost.
- Reintroduce TypeScript only when you commit to a build pipeline (tsc/Vite).

## Cleanup steps (if accepting JS-only)
1) Delete all `.ts` and `.d.ts` files under `scripts/` that have a `.js` counterpart.
2) Keep only the `.js` files that are loaded by `index.html`.
3) Remove TypeScript-specific devDependencies if not needed (`typescript`, `ts-node`).
4) Simplify `tsconfig.json` or archive it for future use.

## Alternative (if you want TS later)
- Keep `.ts` and `.d.ts` but add a proper build:
  - Set `noEmit: false` in `tsconfig`.
  - Use Vite/tsc to emit compiled `.js` to `dist/`.
  - Update `index.html` to load compiled outputs (not sources).

## Why this matters
- Partial TS adds friction: duplicate files, diverging sources, unclear authority.
- JS-only keeps the codebase lean and aligns with current runtime.
- You can always reintroduce TS when you commit to a build step.

