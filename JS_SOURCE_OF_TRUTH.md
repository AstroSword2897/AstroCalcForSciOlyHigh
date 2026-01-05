# JS Source of Truth

Decision: JavaScript is the authoritative runtime source. TypeScript is currently not built or loaded.

- `index.html` loads only `.js` files.
- No build step emits JS from TS (`tsconfig` has noEmit).
- Partial TS migration is paused; `.ts` / `.d.ts` are considered legacy for now.

If/when you reintroduce TypeScript:
- Commit to a build pipeline (Vite/tsc).
- Remove duplicate `.js` sources in favor of compiled outputs.
- Update `index.html` to load compiled artifacts.

