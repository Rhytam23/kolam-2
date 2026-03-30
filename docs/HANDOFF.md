# 🤝 SOLVIX – Kolam AI Project Handoff

This document provides a technical overview and transition guide for developers taking over the **SOLVIX – Kolam AI** project.

---

## 📌 Project Overview
SOLVIX is an interactive platform designed to bridge traditional Kolam (Rangoli) geometric art with modern technology. It uses **Computer Vision (OpenCV)** to analyze physical patterns and **Procedural Generation** to recreate them digitally.

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS.
- **Backend**: FastAPI, Python 3.10+, OpenCV, NumPy.
- **Repository**: [Rhytam23/kolam-2](https://github.com/Rhytam23/kolam-2) (Initialized & Synced).

---

## 📂 Architecture & Organization
The project has been reorganized into a standardized, clean structure:

| Directory | Purpose |
| :--- | :--- |
| **`src/`** | All frontend source code (components, hooks, utils, styles). |
| **`backend/`** | FastAPI server and Python-based image processing logic. |
| **`docs/`** | Technical documentation, project summaries, and handoff guides. |
| **`scripts/`** | Utility scripts for maintenance and deployment. |
| **`public/`** | Static assets and marketing banners. |

### Key Source Files:
- **`src/main.tsx`**: Application entry point.
- **`src/App.tsx`**: Root component managing core layout and global navigation.
- **`src/components/KolamAnalyzer.tsx`**: Core logic for image analysis and dot detection.
- **`src/components/KolamGenerator.tsx`**: Procedural generation and SVG export logic.
- **`src/utils/kolamLogic.ts`**: Shared geometric calculations and data structures.
- **`backend/main.py`**: OpenCV-powered API endpoints for computer vision tasks.

---

## 🚀 Environment Setup

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
*Accessible at: `http://localhost:3000`*

### 2. Backend Setup
```bash
cd backend
# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```
*Accessible at: `http://localhost:8000`*

---

## 🛠️ Technical Considerations
- **Image Processing**: The backend uses OpenCV for dot detection. Detection is "real" (not mock) and varies based on the chosen preset (`balanced`, `clean-scan`, `phone-photo`, `noisy-background`).
- **State Management**: The application uses a custom `KolamProvider` (in `src/components/KolamContext.tsx`) to manage the active workspace and dot-map state across components.
- **Persistence**: Workspaces are saved to `LocalStorage` as JSON snapshots, allowing users to return to their work later.

---

## 📝 Recent Improvements (Current State)
- ✅ **Reorganized Filing Structure**: Clean separation of source, docs, and scripts.
- ✅ **Standardized Entry Points**: Renamed and moved files to follow React/Vite conventions.
- ✅ **Git Integration**: Repository initialized and pushed to GitHub.
- ✅ **Redesigned Documentation**: Updated `README.md` and `HANDOFF.md` with premium aesthetics.

---

## 🔮 Future Roadmap
1. **Lattice Inference Extension**: Improve the algorithm's ability to "guess" missing dots in noisy images.
2. **Side-by-Side Comparison**: Implement a visual overlay comparing the detected dot-map with the generated procedural pattern.
3. **Template Library**: Add a set of standard Kolam templates for users to learn from.

---

> [!IMPORTANT]
> Always verify that the **Backend URL** in the frontend's environment configuration matches the actual running state of the FastAPI server.

---
<p align="center">
  <b>Developed by the SOLVIX – Kolam AI Team</b>
</p>
