# Setup

## Prerequisites
- Node.js 20 or newer (CI and Docker use 22)
- Python 3.10 or newer (CI and Docker use 3.12)
- Optional: Docker

## Run with Docker
```bash
docker build -t chittara .
docker run -p 8000:8000 chittara
```
Open http://localhost:8000. The container serves the app and the API.

## Run for development
```bash
# terminal 1: API on :8000
cd backend
pip install -r requirements.txt
python main.py

# terminal 2: web app on :3000 (proxies /api to :8000)
npm install
npm run dev
```
Open http://localhost:3000.

## Check it works
```bash
curl http://localhost:8000/api/health        # {"status":"ok", ...}
```
In the app, open **Read a photo** and press **Try a sample**.

## Checks before you commit
```bash
npm run typecheck && npm test && npm run build
cd backend && pip install -r requirements-dev.txt && python -m pytest -q
```

Settings are environment variables; see [ENVIRONMENT.md](ENVIRONMENT.md). Problems: [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
