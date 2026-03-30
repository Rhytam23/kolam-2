# 📜 Project Changelog: SOLVIX – Kolam AI

All notable changes to the **SOLVIX** project are documented in this file.

---

## [1.1.0] - 2026-03-30
### 🏗️ Architecture & Organization
- **Refactoring**: Reorganized the entire project structure into `src/`, `docs/`, and `scripts/` directories.
- **Standards**: Renamed entry points (e.g., `index.tsx` → `main.tsx`) to align with modern Vite/React conventions.
- **Deployment**: Initialized Git repository and pushed to GitHub ([Rhytam23/kolam-2](https://github.com/Rhytam23/kolam-2)).
- **Documentation**: Completely redesigned `README.md`, `HANDOFF.md`, and all supporting documentation with a premium aesthetic.

## [1.0.0] - 2026-03-25 (Initial Prototype Release)
### 🔍 Core Analyzer
- **Detection Presets**: Introduced `balanced`, `clean-scan`, `phone-photo`, and `noisy-background` modes.
- **Interaction**: Added click-to-add/remove, drag-to-reposition, and auto-snap lattice tools.
- **Visualization**: Implemented perspective correction, confidence estimates, and high-quality overlays.

### ⚙️ Backend Processing
- **OpenCV Pipeline**: Developed a multi-stage denoising, thresholding, and morphology cleanup engine.
- **Reliability**: Added blob detection fallbacks and outlier filtering for inconsistent photo environments.

### 🎨 Procedural Generator
- **Geometry Engine**: Created a procedural Kolam generator synced with the analyzer's dot-map.
- **Exporting**: Enabled SVG and high-resolution PNG exports for digital recreations.

### 📂 Workspace System
- **Persistence**: Implemented browser LocalStorage for workspace snapshots.
- **Portability**: Added JSON import/export functionality for collaborative research.

---

> [!NOTE]
> Future versions will focus on stronger lattice inference and automated benchmarking.
