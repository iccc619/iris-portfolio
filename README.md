# Iris Wang Portfolio — Scratch Prototype

A dependency-free first trial of Iris Wang's multidisciplinary portfolio, built directly in the scratch workspace without creating a Git repository.

## Run
```bash
npm run dev
```
Then open `http://localhost:4173`.

## Checks
```bash
npm run lint
npm run build
```

`npm run build` creates a deployable static copy in `dist/`.

## Structure
- `data/projects.json` — central content/accent/project configuration.
- `assets/site.css` — design system, editorial grids, responsive and reduced-motion states.
- `assets/site.js` — shared navigation/footer, filtering, project rendering and reading progress.
- `work/<slug>/index.html` — seeded route shells for all eleven projects.
- `ASSET_INVENTORY.md` — current source-asset availability and placeholder policy.

## Asset handoff
When real assets arrive, extend the project data with media objects and replace the shared `media()` placeholder renderer. Do not hard-code project assets into route files.
