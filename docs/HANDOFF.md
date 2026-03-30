# HANDOFF.md

## Project handoff

Project path:
`E:\kolam-2`

## What is included

This project is now a working Kolam analysis and generation prototype with:

- React + TypeScript frontend
- FastAPI + OpenCV backend
- image upload and dot detection
- manual correction workflow
- workspace save/load/export/import
- procedural generator
- animated walkthrough
- updated documentation

## How to run

### Frontend
From the project root:

```bash
npm install
npm run dev
```

### Backend
From `backend`:

```bash
pip install -r requirements.txt
python main.py
```

## Frontend URL
- `http://localhost:3000`

## Backend URL
- `http://localhost:8000`

## Key files

- `README.md`
- `PROJECT_SUMMARY.md`
- `CHANGES.md`
- `TODO.md`
- `backend/main.py`
- `components/KolamAnalyzer.tsx`
- `components/KolamGenerator.tsx`
- `components/KolamContext.tsx`

## Notes

- Frontend build was verified successfully.
- This folder is not currently a git repository, so changes were not committed.
- Detection quality is much stronger than before, but still prototype-grade rather than perfect for all real-world images.

## Recommended next step

Run both frontend and backend locally, then test with:
- a clean scan
- a phone photo
- a noisy image

and compare how each preset behaves.
