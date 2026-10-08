# Handover checklist

For whoever takes over the project. It contains no credentials; the app needs none.

## What you receive
- Repository: https://github.com/Rhytam23/kolam-2 (`main` is the live branch; feature branches are merged into it).
- One Docker image serving the web app and API ([DEPLOYMENT.md](DEPLOYMENT.md)).
- This documentation set; start with [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) and [SETUP.md](SETUP.md).

## Accounts you need
| Account | For |
|---|---|
| GitHub (repository access) | Code, pull requests, CI |
| Render (or another Docker host) | Running the service; connect the repository and pick the `main` branch |

No database, email, analytics, payment or API-key accounts exist.

## First day
1. Run it locally ([SETUP.md](SETUP.md)) and run all checks ([TESTING.md](TESTING.md)).
2. Deploy or confirm the Render service; set `SITE_URL` ([ENVIRONMENT.md](ENVIRONMENT.md)).
3. Check `/api/health`, read a sample photo, open each art form page.
4. Confirm the privacy page and terms (`public/privacy.html`, `public/terms.html`) match your organisation's details.

## Where things live
| To change | Edit |
|---|---|
| Art forms, facts, colours, routes, titles | `src/data/traditions.ts` |
| Starting designs | `src/data/designs.ts` |
| Interface text in other languages | `src/lib/i18n.tsx` |
| Photo reading and tracing | `backend/` ([ARCHITECTURE.md](ARCHITECTURE.md)) |
| Look and feel | `src/index.css`, `tailwind.config.js` ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) |

## Known limits
- A photo can only be traced as finely as it holds detail; very small, blurry or shadowed photos give lower fidelity. Use the on-screen score and tips.
- Dot grids are capped at 25 x 25 and must be rectangular or diamond.
- The free hosting plan sleeps and has one shared CPU; many simultaneous photos queue.
- The cache and rate limiter are per process ([DATABASE.md](DATABASE.md)).
- Interface translations cover only navigation and the photo reader and were not reviewed by native speakers.
- There are no component or load tests ([TESTING.md](TESTING.md)).

## Open work
- A motif library (lotus, conch, fish, paddy, footprints) so "tidy" can replace noisy shapes with clean ones.
- A full redesign of the landing, studio and per-tradition ornaments, and more translated text.
- Per-art-form instruction wording (painted with fingertips, geru ground, flower petals) in the drawing guide; some text is still generic.
- Better handling of photos taken at a steep angle without a visible sheet.

## Support
Issues: https://github.com/Rhytam23/kolam-2/issues. Licence: proprietary, all rights reserved (`LICENSE`); reuse needs the owner's written permission, see `/legal.html`.
