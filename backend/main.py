from __future__ import annotations

import asyncio
import base64
import hashlib
import html
import io
import json
import logging
import mimetypes
import re
import time
from collections import OrderedDict, deque
from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np
from fastapi import APIRouter, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

import config
from config import ALLOWED_TYPES, MAX_DOTS, MAX_UPLOAD_BYTES, PORT, STATIC_DIR, get_allowed_origins
from detection import PRESET_CONFIGS, deskew_if_needed, detect_dots
from drawing import colour_masks, radial_symmetry, tidy_layers, trace_fidelity
from enhance import assess, repair, retake_tips
from vectorize import trace_mask
from principles import image_symmetry, infer_design, infer_lattice, ink_is_dark, stroke_mask

log = logging.getLogger('chittara')

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

def client_ip(request: Request) -> str:
    """The visitor's address. Behind a hosting proxy it is the last X-Forwarded-For entry (the one the
    proxy added); earlier entries are written by the visitor and cannot be trusted."""
    if config.TRUST_PROXY:
        forwarded = request.headers.get('x-forwarded-for', '')
        parts = [p.strip() for p in forwarded.split(',') if p.strip()]
        if parts:
            return parts[-1]
    return request.client.host if request.client else 'unknown'


# Photo reading is CPU-bound: a small pool does the work off the event loop, so pages and the health
# check keep answering while photos are read.
_executor = ThreadPoolExecutor(max_workers=max(1, config.MAX_CONCURRENT), thread_name_prefix='analyze')
_slots: asyncio.Semaphore | None = None
_waiting = 0
_cache: OrderedDict[str, dict] = OrderedDict()
_stats = {'analyzed': 0, 'cached': 0, 'busy': 0, 'failed': 0, 'seconds': 0.0}


def _busy(detail: str = 'Many people are reading photos right now. Please try again in a few seconds.') -> JSONResponse:
    _stats['busy'] += 1
    return JSONResponse({'detail': detail}, status_code=503, headers={'Retry-After': '10'})


def cache_get(key: str) -> dict | None:
    hit = _cache.get(key)
    if hit is not None:
        _cache.move_to_end(key)
    return hit


def cache_put(key: str, value: dict) -> None:
    _cache[key] = value
    _cache.move_to_end(key)
    while len(_cache) > config.CACHE_ENTRIES:
        _cache.popitem(last=False)


def check_pixels(contents: bytes) -> None:
    """Refuses pictures that would need huge memory, by reading only the size from the file header."""
    try:
        with Image.open(io.BytesIO(contents)) as probe:
            width, height = probe.size
    except Exception:
        raise HTTPException(status_code=400, detail='Could not read the image')
    if width * height > config.MAX_PIXELS:
        raise HTTPException(status_code=413, detail='That picture is very large. Please use a smaller photo.')


app = FastAPI(title='Chittara API')
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
)
api = APIRouter(prefix='/api')


@api.get('/health')
async def health():
    return {'status': 'ok', 'maxUploadBytes': MAX_UPLOAD_BYTES, 'allowedTypes': ALLOWED_TYPES,
            'waiting': _waiting, 'stats': {**_stats, 'seconds': round(_stats['seconds'], 1)}}


def parse_dots(raw: str) -> list[dict]:
    try:
        items = json.loads(raw)
        dots = [{'x': float(d['x']), 'y': float(d['y'])} for d in items]
    except (ValueError, TypeError, KeyError):
        raise HTTPException(status_code=422, detail='dots must be a JSON list of {x, y} objects')
    if len(dots) > MAX_DOTS or not all(0 <= d['x'] <= 1 and 0 <= d['y'] <= 1 for d in dots):
        raise HTTPException(status_code=422, detail=f'dots must hold at most {MAX_DOTS} points inside the image')
    return dots


def run_analysis(contents: bytes, preset: str, deskew: bool, manual_dots: list[dict] | None, grid: bool) -> dict:
    """Reads one photo. Blocking and CPU-heavy: always call it from the worker pool."""
    img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail='Could not read the image')
    longest = max(img.shape[:2])
    if longest > config.MAX_SIDE:
        factor = config.MAX_SIDE / longest
        img = cv2.resize(img, None, fx=factor, fy=factor, interpolation=cv2.INTER_AREA)

    corrected = False
    if deskew:
        img, corrected = deskew_if_needed(img)

    # Poor photos are repaired first. For dot designs both versions are read and the better reading wins.
    quality = assess(img)
    fixes: list[str] = []
    repaired = img
    if quality['problems']:
        repaired, fixes = repair(img, quality, config.MAX_SIDE)

    def read_dots(picture: np.ndarray):
        """Best dot reading of a picture over both ink polarities: (score, dark_ink, dots)."""
        gray_ = cv2.cvtColor(picture, cv2.COLOR_BGR2GRAY)
        h_, w_ = gray_.shape
        readings = []
        for dark in (True, False):
            candidate = detect_dots(gray_, w_, h_, preset, dark)
            fit = infer_lattice(candidate, w_, h_)
            readings.append(((fit['fit'] if fit else 0.01) * len(candidate), dark, candidate))
        return max(readings, key=lambda r: r[0])

    found, dark_ink = [], True
    if manual_dots is not None:
        found = manual_dots
        if fixes:
            img = repaired
        dark_ink = ink_is_dark(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), manual_dots)
    elif grid:
        best = read_dots(img)
        if fixes:
            retry = read_dots(repaired)
            if retry[0] > best[0] * 1.05:
                best, img = retry, repaired
            else:
                fixes = []  # the repair did not help this reading, so the original is kept
        _, dark_ink, found = best
    elif fixes:
        # Free-hand designs have no reading to compare, so keep the repair only if the photo measures better.
        if assess(repaired)['score'] > quality['score']:
            img = repaired
        else:
            fixes = []

    height, width = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lattice = infer_lattice(found, width, height) if found else None
    if lattice is None:
        # No dot grid to go by: the drawing is the thinner of the two tones.
        dark_ink = bool(stroke_mask(gray, True).mean() <= stroke_mask(gray, False).mean())
    ink = stroke_mask(gray, dark_ink)
    design, clarity = infer_design(lattice, ink) if lattice else (None, 0.0)
    radial = radial_symmetry(ink)
    palette, masks = colour_masks(img)
    layers = [{'color': colour, 'path': path} for colour, mask in masks if (path := trace_mask(mask))]
    tidied = tidy_layers(masks, radial, ink) if lattice is None and masks else []
    after = assess(img) if fixes else quality
    fidelity = trace_fidelity(img, masks, palette) if masks else None

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
        'tidied': tidied,
        'quality': {
            'score': quality['score'], 'problems': quality['problems'], 'fixes': fixes,
            'scoreAfter': after['score'], 'tips': retake_tips(after['problems']), 'fidelity': fidelity,
        },
    }
    if corrected or fixes:
        ok, jpeg = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if ok:
            response['image'] = 'data:image/jpeg;base64,' + base64.b64encode(jpeg.tobytes()).decode()
    return response


@api.post('/analyze')
async def analyze_kolam(
    request: Request,
    file: UploadFile = File(...),
    preset: str = Form('balanced'),
    deskew: bool = Form(True),
    dots: str | None = Form(None),
    grid: bool = Form(True),
):
    """Reads a design from a photo. grid=false skips the dot-grid search, for art forms drawn without dots."""
    global _slots, _waiting
    check_rate_limit(client_ip(request))
    if preset not in PRESET_CONFIGS:
        raise HTTPException(status_code=422, detail=f'Unknown preset. Use one of: {", ".join(PRESET_CONFIGS)}')
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail='Upload a PNG, JPEG or WebP image')

    contents = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f'Image is larger than {MAX_UPLOAD_BYTES // (1024 * 1024)} MB')
    manual_dots = parse_dots(dots) if dots is not None else None
    check_pixels(contents)

    key = hashlib.sha256(contents + json.dumps([preset, deskew, manual_dots, grid]).encode()).hexdigest()
    hit = cache_get(key)
    if hit is not None:
        _stats['cached'] += 1
        return hit

    if _slots is None:
        _slots = asyncio.Semaphore(max(1, config.MAX_CONCURRENT))
    if _waiting >= config.MAX_WAITING:
        return _busy()
    _waiting += 1
    try:
        await asyncio.wait_for(_slots.acquire(), timeout=config.QUEUE_WAIT_SECONDS)
    except asyncio.TimeoutError:
        return _busy()
    finally:
        _waiting -= 1

    started = time.monotonic()
    try:
        loop = asyncio.get_running_loop()
        work = loop.run_in_executor(_executor, run_analysis, contents, preset, deskew, manual_dots, grid)
        response = await asyncio.wait_for(work, timeout=config.ANALYSIS_TIMEOUT_SECONDS)
    except HTTPException:
        raise
    except asyncio.TimeoutError:
        _stats['failed'] += 1
        log.warning('analysis timed out after %.0fs', config.ANALYSIS_TIMEOUT_SECONDS)
        return _busy('That photo took too long to read. Try a smaller or clearer picture.')
    except Exception:
        _stats['failed'] += 1
        log.exception('analysis pipeline failed')
        raise HTTPException(status_code=500, detail='Analysis pipeline failed')
    finally:
        _slots.release()
    _stats['analyzed'] += 1
    _stats['seconds'] += time.monotonic() - started
    cache_put(key, response)
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

def page_html(template: str, title: str, description: str) -> str:
    """The app's index.html, titled and described for one page, so shared links show the right text."""
    t, d = html.escape(title, quote=True), html.escape(description, quote=True)
    out = re.sub(r'<title>.*?</title>', f'<title>{t}</title>', template, count=1, flags=re.S)
    for attr, value in (('name="description"', d), ('property="og:title"', t), ('property="og:description"', d),
                        ('name="twitter:title"', t), ('name="twitter:description"', d)):
        out = re.sub(rf'(<meta {attr} content=")[^"]*(")', lambda m: m.group(1) + value + m.group(2), out, count=1)
    return out


def add_page_routes(static_dir) -> None:
    """Answer every page of the app (/, /kolam, /kolam/read-a-photo, ...) with index.html; see routes.json from the build."""
    routes_file, index_file = static_dir / 'routes.json', static_dir / 'index.html'
    if not (routes_file.is_file() and index_file.is_file()):
        return
    template = index_file.read_text(encoding='utf-8')
    for route in json.loads(routes_file.read_text(encoding='utf-8')):
        body = page_html(template, route['title'], route['description'])
        app.add_api_route(route['path'], lambda body=body: HTMLResponse(body), methods=['GET'], include_in_schema=False)
        # Ahead of the static files mounted at '/', which would otherwise answer first.
        app.router.routes.insert(0, app.router.routes.pop())


if STATIC_DIR.is_dir():
    add_page_routes(STATIC_DIR)
    app.mount('/', StaticFiles(directory=STATIC_DIR, html=True), name='app')


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=PORT)
