# Maintenance

## Routine
| Task | How |
|---|---|
| Update dependencies | `npm outdated` / `npm update`; `pip list --outdated`. Then run all checks ([TESTING.md](TESTING.md)) before merging |
| Review limits | Watch `/api/health` counters ([ANALYTICS.md](ANALYTICS.md)); adjust `MAX_CONCURRENT`, `MAX_WAITING`, `RATE_LIMIT_PER_MINUTE` ([ENVIRONMENT.md](ENVIRONMENT.md)) |
| Release a visible change to installed apps | Bump the cache name in `public/sw.js` (`chittara-v3`) |
| Refresh the sitemap | Set `SITE_URL` and rebuild; `sitemap.xml` is generated at build time |
| Review translations | `src/lib/i18n.tsx`; ask native speakers to check Bengali, Tamil, Telugu and Hindi labels |
| Update the privacy page | If data handling changes, edit `public/privacy.html` and its "Last updated" date |

## Changing content
- Art-form facts, colours, designs, titles and addresses: `src/data/traditions.ts` (a test checks every route has a title and description).
- Design presets: `src/data/designs.ts`. Colour sets and traditional materials: `src/lib/colours.ts`.
- Heading typeface per script: `src/lib/fonts.ts` (add the `@fontsource` import in `src/main.tsx` for a new script).

## Tuning the photo reading
- Photo repair thresholds: top of `backend/enhance.py`.
- Colour and ink decisions: top of `backend/drawing.py` (`WORK_SIDE`, `HIGH_SIDE`, `INK_LEVELS`, `GROUND_SHADE`).
- Outline detail: `backend/vectorize.py` (`MAX_PATH_POINTS`, `epsilon`, `edge_sigma`).
- After any change, run the fidelity tests (`backend/tests/test_fidelity.py`) and compare a few real photos side by side.

## Secrets and accounts
None to rotate: the app uses no keys, tokens or databases.
