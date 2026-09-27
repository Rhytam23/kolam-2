# 🌀 SOLVIX – Kolam AI
> **Bridging Ancient Geometry with Advanced Artificial Intelligence**

SOLVIX is a comprehensive **React + TypeScript + FastAPI** platform designed to analyze, proceduralize, and celebrate the intricate art of traditional **Kolam** (Rangoli). By combining computer vision, interactive geometry tools, and educational walkthroughs, SOLVIX brings traditional heritage into the digital age.

---

## ✨ Key Features

### 🔍 Intelligent Analyzer
- **CV-Powered Detection**: Advanced dot-detection algorithms for balanced scans, phone photos, and noisy backgrounds.
- **Manual Correction**: Precision tools for adding, removing, and repositioning dots with perspective correction.
- **Lattice Lattice Inference**: Automatic snapping and confidence estimation for cleaner pattern generation.

### 🎨 Procedural Generator
- **Algorithm-to-Art**: Dynamically generate Kolam patterns based on detected lattice structures.
- **Reference Overlays**: Compare generated patterns against the original analyzer reference.
- **Vector Exports**: Export high-quality SVG and PNG versions of your creations.

### 📂 Workspace Management
- **Persistence**: Save and load snapshots directly in your browser's local storage.
- **Portability**: Import and export workspaces as JSON for collaborative analysis.

### 🎓 Educational Walkthroughs
- **Dynamic Construction**: Animated explanations showing how specific Kolams are built step-by-step.
- **Context-Aware**: Walkthroughs adapt in real-time to your active workspace dot-map.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | FastAPI, OpenCV, NumPy |
| **Visualization** | SVG, Canvas API, Procedural Math |
| **Storage** | LocalStorage API, Workspace JSON Export |

---

## 📂 Project Structure

```text
kolam-2/
├── src/               # Main source code
│   ├── components/    # Reusable UI components & feature logic
│   ├── utils/         # Core geometric & procedural logic
│   ├── App.tsx        # Main application entry point
│   ├── main.tsx       # Vite entry point
│   └── index.css      # Global styles & Tailwind directives
├── backend/           # FastAPI backend server
│   ├── main.py        # API endpoints & OpenCV logic
│   └── requirements.txt
├── docs/              # Project documentation & summaries
├── public/            # Static assets & banners
├── package.json       # Dependencies & NPM scripts
└── vite.config.ts     # Project configuration
```

---

## 🚀 Getting Started

### 1. Frontend Development
Ensure you have **Node.js** installed.

```bash
# Navigate to root
npm install
npm run dev
```
> [!NOTE]
> The frontend will be accessible at `http://localhost:3000`.

### 2. Backend Setup
Ensure you have **Python 3.10+** installed.

```bash
# Navigate to backend directory
cd backend
pip install -r requirements.txt
python main.py
```
> [!NOTE]
> The backend will be accessible at `http://localhost:8000`.

### 3. Environment Variables
Copy `.env.example` to `.env.local` in the project root if you need to point the frontend at a
backend running somewhere other than `http://localhost:8000`:

```bash
cp .env.example .env.local
```

`.env.local` sets `VITE_API_BASE_URL`; it's gitignored, so your local value is never committed.

---

## 🔮 Roadmap
- [ ] **Advanced Lattice Inference**: Stronger pattern prediction from sparse dot sets.
- [ ] **Visual Comparison Mode**: Side-by-side "detected vs. generated" comparison overlays.
- [ ] **Extended Styles**: Support for varied regional styles and pattern families.
- [ ] **Dataset Export**: Tooling to contribute your corrected dot-maps to a shared open-source Kolam dataset.

---

## 📜 License
MIT — see [LICENSE](LICENSE). Project created as part of the SOLVIX – Kolam AI initiative.

---
<p align="center">
  <b>Built with ❤️ by the SOLVIX Team</b>
</p>

