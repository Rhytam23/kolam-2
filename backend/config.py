from __future__ import annotations

import os
from pathlib import Path


def get_allowed_origins() -> list[str]:
    """Extra origins allowed to call the API (only needed when the frontend is hosted elsewhere)."""
    raw = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
    return [origin.strip() for origin in raw.split(',') if origin.strip()]


MAX_UPLOAD_BYTES = int(os.getenv('MAX_UPLOAD_BYTES', str(8 * 1024 * 1024)))
ALLOWED_TYPES = ('image/png', 'image/jpeg', 'image/webp')
MAX_DOTS = 600

# The built frontend (npm run build). When present it is served at "/", so one process runs the whole app.
STATIC_DIR = Path(os.getenv('STATIC_DIR', Path(__file__).resolve().parent.parent / 'dist'))
PORT = int(os.getenv('PORT', '8000'))
