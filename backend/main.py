from __future__ import annotations

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

from config import MAX_UPLOAD_BYTES, get_allowed_origins
from detection import deskew_if_needed, detect_dots, estimate_confidence

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/')
async def root():
    return {'message': 'Kolam Analyzer API is running'}


@app.get('/health')
async def health():
    return {'status': 'ok'}


@app.post('/analyze')
async def analyze_kolam(
    file: UploadFile = File(...),
    preset: str = Form('balanced'),
    deskew: bool = Form(True),
):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')

    try:
        contents = await file.read(MAX_UPLOAD_BYTES + 1)
        if len(contents) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail='File too large')

        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail='Could not process image')

        if deskew:
            img = deskew_if_needed(img)

        height, width, _ = img.shape
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        dots = detect_dots(gray, width, height, preset)
        confidence = estimate_confidence(len(dots), preset)

        return {
            'width': width,
            'height': height,
            'dots': dots,
            'preset': preset,
            'confidence': confidence,
            'message': (
                f'Detected {len(dots)} potential dots using the {preset} preset '
                'with denoising, threshold blending, blob fallback, and geometric cleanup.'
            ),
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail='Analysis pipeline failed')


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=8000)
