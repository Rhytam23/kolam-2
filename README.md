# SOLVIX – Kolam AI

SOLVIX is a React + TypeScript + FastAPI project for analyzing, correcting, generating, and explaining traditional Kolam patterns.

It combines:
- **computer-vision-based dot detection**
- **interactive manual correction tools**
- **procedural Kolam generation**
- **educational walkthroughs**
- **workspace save/load/export/import flow**

## Current capabilities

### Analyzer
- upload PNG/JPEG kolam images
- detection presets:
  - `balanced`
  - `clean-scan`
  - `phone-photo`
  - `noisy-background`
- optional perspective correction
- confidence estimate
- click to add/remove dots
- drag to reposition dots
- undo / redo
- zoom
- auto-snap to cleaner lattice
- export overlay PNG

### Workspace
- save workspace snapshots in browser storage
- load saved workspaces
- delete saved workspaces
- export workspace JSON
- import workspace JSON

### Generator
- procedural Kolam generation
- shared analyzer reference overlay
- SVG export
- workflow comparison details

### Walkthrough
- animated Kolam construction explanation
- reflects active workspace state

## Tech stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- FastAPI
- OpenCV
- NumPy
- python-multipart

## Project structure

```text
E:\kolam-2
├── backend/
│   ├── main.py
│   └── requirements.txt
├── components/
│   ├── ui/
│   ├── KolamAnalyzer.tsx
│   ├── KolamGenerator.tsx
│   ├── KolamWalkthrough.tsx
│   ├── KolamContext.tsx
│   └── ...other sections
├── utils/
│   └── kolamLogic.ts
├── App.tsx
├── index.tsx
├── index.css
├── index.html
├── package.json
└── vite.config.ts
```

## How to run

## 1. Frontend

From `E:\kolam-2`:

```bash
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:3000`

## 2. Backend

From `E:\kolam-2\backend`:

```bash
pip install -r requirements.txt
python main.py
```

Backend runs on:
- `http://localhost:8000`

## Optional frontend environment

Create `.env.local` in `E:\kolam-2` if you want to override the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Production build

From `E:\kolam-2`:

```bash
npm run build
```

## Important notes

- detection is **real**, not random
- detection is still **prototype-grade**, not perfect for every photo
- noisy, skewed, or cluttered images may still require manual correction
- best results come from clear, high-contrast kolam images

## Suggested next future improvements

- stronger lattice inference
- generated-vs-detected visual compare mode
- backend debug mask preview
- sample test dataset
- more generator styles and pattern families

## Summary

SOLVIX is now a strong interactive prototype for:
- **analyzing kolam images**
- **correcting dot maps**
- **saving reusable pattern workspaces**
- **generating procedural references**
- **explaining Kolam construction**
