# 🌐 SOLVIX – Project Executive Summary

This document provides a high-level summary of the **SOLVIX – Kolam AI** project, its capabilities, and its current architectural state.

---

## 🎯 Vision & Objective
SOLVIX is an advanced prototype designed for the **analysis, proceduralization, and education** of traditional Kolam geometry. It aims to bridge cultural heritage with modern AI and Computer Vision technologies.

### Core Capabilities:
- **Analyze**: Detect intricate dot-maps from physical photographs.
- **Correct**: Interactive tools to refine detected geometry.
- **Generate**: Procedurally reconstruct Kolams from analyzed lattices.
- **Persist**: Save and export workspaces for continuous research.

---

## 🏗️ Technical Architecture

### Frontend Layer
- **Framework**: React 19 + TypeScript + Vite.
- **State Management**: Context API (`KolamProvider`) for cross-feature synchronization.
- **Styling**: Tailwind CSS with custom glassmorphic UI components.
- **Visualization**: Modular SVG, Canvas API, and CSS-driven animations for walkthroughs.

### Backend Layer
- **Server**: FastAPI (Python 3.10+).
- **Processing**: OpenCV & NumPy driving a multi-stage computer vision pipeline.
- **Logic**: Custom dot-centroid detection and lattice-snap algorithms.

---

## 📂 System Organization
The project follows a clean, modern filing structure:

- **`src/`**: All frontend logic, components, and hooks.
- **`backend/`**: CV processing engine and REST endpoints.
- **`docs/`**: Technical debt, handoffs, and project summaries.
- **`public/`**: Static assets and premium marketing graphics.
- **`scripts/`**: Maintenance and deployment utility scripts.

---

## ✅ Current Project State
The project is a **successful, high-fidelity prototype** with all core features fully operational.

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Dot Detection** | 🟢 Ready | Sub-pixel accuracy with built-in noise handling. |
| **Manual Correction** | 🟢 Ready | Undo/redo, drag-and-snap, and lattice inference. |
| **Workspace Export** | 🟢 Ready | JSON-based snapshots with import/export support. |
| **Procedural Art** | 🟢 Ready | Dynamic SVG generation from active lattices. |
| **Git Synchronization**| 🟢 Ready | Fully tracked and pushed to [Rhytam23/kolam-2](https://github.com/Rhytam23/kolam-2). |

---

## ⚠️ Important Considerations
- **Environment**: Backend URLs should be configured in `.env.local` for custom deployments.
- **Image Quality**: Best results are achieved with clear, high-contrast images.
- **Lattice Inference**: Currently handles basic grids; advanced pattern prediction is ongoing.

---
<p align="center">
  <b>Bridging Heritage and Intelligence through SOLVIX</b>
</p>
