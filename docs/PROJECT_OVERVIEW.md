# Project overview

Chittara reads floor art (kolam, rangoli, alpana and relatives) from a photo, shows the design's principles, redraws it as clean vector art, and teaches a person to draw it by hand. It is an open-source, independent student project, not an official Government of India website.

## What it does
- **Read a photo** of a design. Dot designs (kolam, muggulu) are read as a dot grid and a mirror-curve; free-hand designs (alpana, mandana and others) are traced as smooth curves in their real colours, with a "tidied" copy. Poor photos are repaired first, and the result shows how closely it matches the picture.
- **Draw it yourself:** a step-by-step guide (ground, dots, lines in order, colour) and a Practice mode where you tap dots in order.
- **Design studio:** dot kolams, round designs (lotus, alpana, pookalam...) and straight-line designs, with each tradition's own colours.
- **Eleven art forms**, each with its own page, colours, heading typeface and facts: kolam, muggulu, rangoli, alpana, pookalam, mandana, aipan, aripan, jhoti chita, chowk purana, chittara (`src/data/traditions.ts`).
- **Languages:** interface labels in English, Bengali, Tamil, Telugu and Hindi (navigation and photo reader only; `src/lib/i18n.tsx`).
- **Installable and offline:** studio, guide and practice work offline once visited (`public/sw.js`). Reading a photo always needs the server.
- **Share:** export SVG, PNG or `.kolam.json`; designs are saved in the browser.

## Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind 3, self-hosted fonts |
| Backend | Python 3.12, FastAPI, OpenCV (headless), NumPy, Pillow |
| Tests | Vitest (frontend), pytest (backend) |
| Hosting | One Docker image on Render (free plan by default) |
| CI | GitHub Actions: typecheck, tests, build, Docker build |

## Not included, on purpose
No accounts, database, analytics, cookies or admin panel. See [DATABASE.md](DATABASE.md), [ANALYTICS.md](ANALYTICS.md) and [ADMIN_GUIDE.md](ADMIN_GUIDE.md).

## Status
Version 1.0.0. Open work is listed in [CLIENT_HANDOVER.md](CLIENT_HANDOVER.md); history is in [../CHANGELOG.md](../CHANGELOG.md).
