# 🏃 SOLVIX – Quick Start Guide

This document provides concise instructions for setting up and running the **SOLVIX – Kolam AI** project locally.

---

## 🏗️ 1. Frontend Setup
Ensure you have **Node.js** (v18+) installed.

```bash
# Navigate to project root
npm install

# Start the Vite development server
npm run dev
```
> [!NOTE]
> The frontend will be accessible at: **`http://localhost:3000`**

---

## ⚙️ 2. Backend Setup
Ensure you have **Python 3.10+** (v3.10+) and **pip** installed.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI/OpenCV server
python main.py
```
> [!NOTE]
> The backend API will be accessible at: **`http://localhost:8000`**

---

## 🛠️ Optional Configuration
Create a `.env.local` file in the project root to override the default API endpoint if needed:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🏗️ 3. Production Build
To generate a production-ready application bundle:

```bash
# From the project root
npm run build
```
> [!TIP]
> This command will generate a optimized bundle in the `/dist` directory.

---
<p align="center">
  <b>Bridging Tradition and Intelligence</b>
</p>
