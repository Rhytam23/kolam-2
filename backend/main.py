from __future__ import annotations

import base64
import json
import mimetypes
import time
from collections import deque

import cv2
import numpy as np
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import config
from config import ALLOWED_TYPES, MAX_DOTS, MAX_UPLOAD_BYTES, PORT, STATIC_DIR, get_allowed_origins
from detection import PRESET_CONFIGS, deskew_if_needed, detect_dots
from drawing import colour_layers, radial_symmetry
from principles import image_symmetry, infer_design, infer_lattice, ink_is_dark, stroke_mask

# So phones recognise the app manifest when the site is installed to the home screen.
mimetypes.add_type('application/manifest+json', '.webmanifest')

# The page loads nothing from other sites: scripts, styles, fonts and images all come from here.
CONTENT_SECURITY_POLICY = '; '.join([
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
])

# When each visitor last had a photo read, for the per-minute limit. Kept in memory only.
_recent: dict[str, deque[float]] = {}


def check_rate_limit(visitor: str) -> None:
    now = time.monotonic()
    if len(_recent) > 10_000:
        # Forget visitors who have been quiet for a minute, so the table stays small.
        for key in [k for k, q in _recent.items() if not q or now - q[-1] > 60]:
            del _recent[key]
    times = _recent.setdefault(visitor, deque())
    while times and now - times[0] > 60:
        times.popleft()
    if len(times) >= config.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(status_code=429, detail='Too many photos in a short time. Please wait a minute and try again.')
    times.append(now)

app = FastAPI(title='SOLVIX Kolam API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)
api = APIRouter(prefix='/api')


@api.get('/health')
async def health():
    return {'status': 'ok', 'maxUploadBytes': MAX_UPLOAD_BYTES, 'allowedTypes': ALLOWED_TYPES}


def parse_dots(raw: str) -> list[dict]:
    try:
        items = json.loads(raw)
        dots = [{'x': float(d['x']), 'y': float(d['y'])} for d in items]
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=422, detail='dots must be a JSON list of {x, y} objects')
    if len(dots) > MAX_DOTS or not all(0 <= d['x'] <= 1 and 0 <= d['y'] <= 1 for d in dots):
        raise HTTPException(status_code=422, detail=f'dots must hold at most {MAX_DOTS} points inside the image')
    return dots


@api.post('/analyze')
async def analyze_kolam(
    request: Request,
    file: UploadFile = File(...),
    preset: str = Form('balanced'),
    deskew: bool = Form(True),
    dots: str | None = Form(None),
):
    check_rate_limit(request.client.host if request.client else 'unknown')
    if preset not in PRESET_CONFIGS:
        raise HTTPException(status_code=422, detail=f'Unknown preset. Use one of: {", ".join(PRESET_CONFIGS)}')
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail='Upload a PNG, JPEG or WebP image')

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f'Image is larger than {MAX_UPLOAD_BYTES // (1024 * 1024)} MB')
    manual_dots = parse_dots(dots) if dots is not None else None

    img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail='Could not read the image')

    try:
        corrected = False
        if deskew:
            img, corrected = deskew_if_needed(img)
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Kolams are drawn dark-on-light (paper) or light-on-dark (rice flour on a floor).
        if manual_dots is not None:
            found, dark_ink = manual_dots, ink_is_dark(gray, manual_dots)
        else:
            readings = []
            for dark in (True, False):
                candidate = detect_dots(gray, width, height, preset, dark)
                fit = infer_lattice(candidate, width, height)
                readings.append(((fit['fit'] if fit else 0.01) * len(candidate), dark, candidate))
            _, dark_ink, found = max(readings, key=lambda r: r[0])
        lattice = infer_lattice(found, width, height)
        if lattice is None:
            # No dot grid to go by: the drawing is the thinner of the two tones.
            dark_ink = bool(stroke_mask(gray, True).mean() <= stroke_mask(gray, False).mean())
        ink = stroke_mask(gray, dark_ink)
        design, clarity = infer_design(lattice, ink) if lattice else (None, 0.0)
        radial = radial_symmetry(ink)
        palette, layers = colour_layers(img)
    except Exception:
        raise HTTPException(status_code=500, detail='Analysis pipeline failed')

    if lattice:
        confidence = round(lattice['fit'] * (0.5 + 0.5 * clarity), 2)
        message = (
            f'Found {len(found)} dots on a {lattice["rows"]}×{lattice["cols"]} lattice '
            f'({lattice["fit"]:.0%} of dots fit it) and read how the strands pass between them.'
        )
    else:
        confidence = None  # the confidence describes the dot-grid reading, which does not apply here
        shape = f' with {radial["order"]}-fold radial symmetry' if radial and radial['order'] > 1 else ''
        message = (f'No regular dot grid, so this looks like a free-hand design (alpana, rangoli, mandana style){shape}. '
                   'Its colours and outline have been traced so you can redraw it.')

    response = {
        'width': width,
        'height': height,
        # Without a grid, detected "dots" are just specks; keep only dots the user placed.
        'dots': found if lattice or manual_dots is not None else [],
        'preset': preset,
        'confidence': confidence,
        'message': message,
        'lattice': lattice,
        'design': design,
        'symmetry': image_symmetry(ink),
        'radial': radial,
        'palette': palette,
        'layers': layers,
    }
    if corrected:
        ok, jpeg = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if ok:
            response['image'] = 'data:image/jpeg;base64,' + base64.b64encode(jpeg.tobytes()).decode()
    return response


app.include_router(api)


@app.middleware('http')
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    headers = response.headers
    headers.setdefault('X-Content-Type-Options', 'nosniff')
    headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
    headers.setdefault('X-Frame-Options', 'DENY')
    headers.setdefault('Permissions-Policy', 'geolocation=(), microphone=(), payment=(), usb=()')
    headers.setdefault('Content-Security-Policy', CONTENT_SECURITY_POLICY)
    if request.url.scheme == 'https':
        headers.setdefault('Strict-Transport-Security', 'max-age=31536000')
    if request.url.path == '/sw.js':
        # Browsers must always check for a new version of the offline worker.
        headers['Cache-Control'] = 'no-cache'
    return response

if STATIC_DIR.is_dir():
    app.mount('/', StaticFiles(directory=STATIC_DIR, html=True), name='app')


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=PORT)
