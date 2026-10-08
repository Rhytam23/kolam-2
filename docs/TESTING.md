# Testing

## Run everything
```bash
npm run typecheck        # TypeScript
npm test                 # Vitest (frontend)
npm run build            # production build
cd backend && pip install -r requirements-dev.txt && python -m pytest -q
```
CI (`.github/workflows/ci.yml`) runs the same checks and a Docker build on every push and pull request.

## What is covered
| Area | Files |
|---|---|
| Mirror-curve engine, symmetry, single line | `src/utils/kolamLogic.test.ts` |
| Round designs and guide dots | `src/utils/radial.test.ts` |
| Straight-line designs | `src/utils/geometric.test.ts` |
| Practice mode, including designs read from photos | `src/utils/practice.test.ts` |
| Guide dots and anchors for traced designs | `src/utils/traced.test.ts` |
| Art forms, routes, titles | `src/data/traditions.test.ts` |
| `.kolam.json` files | `src/lib/kolamFile.test.ts` |
| Interface languages fall back and are complete | `src/lib/i18n.test.ts` |
| Dot detection, lattice, crossings, symmetry | `backend/tests/test_principles.py`, `test_drawing.py` |
| API behaviour (limits, presets, page titles, security headers) | `backend/tests/test_api.py` |
| Queue, cache, size limits, forwarded-for rate limit, repaired photo never cached | `backend/tests/test_hardening.py` |
| Photo repair, thin-lace fidelity, gaps stay open, tidy restores petals | `backend/tests/test_fidelity.py` |

Backend tests use synthetic pictures only (no real photos in the repo).

## Adding a fidelity case
1. Add a generator for the picture to `backend/tests/test_fidelity.py` (see `lace_mandala`).
2. Post it to `/api/analyze` with `grid=false`.
3. Assert the traced ink share and `quality.fidelity`. Use the `rasterise` helper to draw the returned paths back into a mask.

## Checking a real photo by eye
Run the app ([SETUP.md](SETUP.md)), upload the photo on a reader page, and use the **Compare with photo** slider and the "Matches your picture" score. Do not commit photos of people.

## Not covered
React components are not unit-tested (no testing-library), and there is no automated browser test or load test.
