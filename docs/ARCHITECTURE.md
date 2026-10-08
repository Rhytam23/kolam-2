# Architecture

One container serves the built web app and the API on the same port. FastAPI (`backend/main.py`) answers `/api/*`, each page address with a titled `index.html`, and everything else from `dist/`.

```text
Browser (React)                      FastAPI (backend/main.py)
  shrink photo to 1600 px  ──POST /api/analyze──▶  guards ▶ cache ▶ queue ▶ worker pool
  show result, guide, practice  ◀── JSON ───────  run_analysis(): repair ▶ read ▶ trace
```

## The photo pipeline (`POST /api/analyze`)
1. **Guards:** per-visitor rate limit, type and byte limits, a pixel limit read from the file header, then a cache lookup (same photo and settings returns the cached answer; a response containing a repaired photo is never cached).
2. **Queue:** at most `MAX_CONCURRENT` photos are read at once and `MAX_WAITING` may wait. Beyond that the server answers `503` with `Retry-After`; the web app retries by itself (`src/lib/api.ts`).
3. **Reduce and straighten:** long side reduced to `MAX_SIDE`; a sheet photographed at an angle is flattened (`backend/detection.py`).
4. **Photo repair** (`backend/enhance.py`): blur, flat contrast, uneven light (a fitted lighting plane), grain, glare and small size are measured and only the needed fixes applied. Clean drawings are never smoothed or sharpened (only a shadow across the whole sheet is removed). For dot designs both versions are read and the better reading wins.
5. **Reading:** dot designs go through dot detection, lattice fit and strand reading (`detection.py`, `principles.py`); the rest is traced.
6. **Tracing** (`backend/drawing.py`, `backend/vectorize.py`): real colours are found first and every pixel goes to the nearest one, so anti-aliased pixels on thin lines are not lost. Colours are decided on an enlarged picture; for two-colour drawings the ink level is chosen by drawing each candidate, shrinking it back and keeping the closest. Outlines become cubic Béziers with sharp corners kept and are grown by the half pixel the contour finder loses. A **tidied** copy smooths wobbles and restores petals of turning patterns by majority vote.
7. **Quality:** the response reports the photo score before and after, what was fixed, retake tips, and `fidelity` (the trace drawn back at the picture's size, compared with the picture).

## Frontend
| Path | Role |
|---|---|
| `src/data/traditions.ts` | The 11 art forms, themes, routes, titles |
| `src/pages/` | Landing, tradition pages, readers, studio, about |
| `src/components/` | Analyzer, generator, draw guide, practice, header/footer |
| `src/utils/kolamLogic.ts` | Mirror-curve engine (tracing, symmetry, single line) |
| `src/utils/radial.ts`, `geometric.ts` | Round and straight-line designs |
| `src/utils/traced.ts` | Guide dots and drawing order for designs read from photos |
| `src/utils/practice.ts` | Practice plans for every kind of design |
| `src/lib/` | API client, router, theme, fonts, i18n, `.kolam.json` helpers |

## Backend
| File | Role |
|---|---|
| `main.py` | App, limits, queue, cache, security headers, page routes |
| `config.py` | Environment settings ([ENVIRONMENT.md](ENVIRONMENT.md)) |
| `enhance.py` | Photo quality check and repair |
| `detection.py`, `principles.py` | Dots, lattice, crossings and turns, symmetry |
| `drawing.py`, `vectorize.py` | Palette, colour layers, tidy copy, Bézier outlines, fidelity |

## Limits
No method reproduces every photo exactly; a picture can only be traced as finely as it holds detail. Dot grids are capped at 25×25. State lives in memory and the browser only ([DATABASE.md](DATABASE.md)).
