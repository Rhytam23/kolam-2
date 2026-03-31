from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

PRESET_CONFIGS = {
    'balanced': {
        'adaptive_block': 31,
        'adaptive_c': -2,
        'min_area_scale': 0.000015,
        'max_area_scale': 0.0035,
        'merge_radius': 0.018,
        'neighbor_limit': 0.22,
    },
    'clean-scan': {
        'adaptive_block': 25,
        'adaptive_c': -1,
        'min_area_scale': 0.00001,
        'max_area_scale': 0.0025,
        'merge_radius': 0.014,
        'neighbor_limit': 0.18,
    },
    'phone-photo': {
        'adaptive_block': 35,
        'adaptive_c': -3,
        'min_area_scale': 0.00002,
        'max_area_scale': 0.004,
        'merge_radius': 0.022,
        'neighbor_limit': 0.26,
    },
    'noisy-background': {
        'adaptive_block': 41,
        'adaptive_c': -4,
        'min_area_scale': 0.00003,
        'max_area_scale': 0.003,
        'merge_radius': 0.02,
        'neighbor_limit': 0.24,
    },
}


def order_points(points: np.ndarray) -> np.ndarray:
    rect = np.zeros((4, 2), dtype='float32')
    s = points.sum(axis=1)
    rect[0] = points[np.argmin(s)]
    rect[2] = points[np.argmax(s)]

    diff = np.diff(points, axis=1)
    rect[1] = points[np.argmin(diff)]
    rect[3] = points[np.argmax(diff)]
    return rect


def deskew_if_needed(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return image

    largest = max(contours, key=cv2.contourArea)
    perimeter = cv2.arcLength(largest, True)
    approx = cv2.approxPolyDP(largest, 0.02 * perimeter, True)

    if len(approx) != 4:
        return image

    pts = approx.reshape(4, 2).astype('float32')
    rect = order_points(pts)
    (tl, tr, br, bl) = rect

    width_a = np.linalg.norm(br - bl)
    width_b = np.linalg.norm(tr - tl)
    max_width = int(max(width_a, width_b))

    height_a = np.linalg.norm(tr - br)
    height_b = np.linalg.norm(tl - bl)
    max_height = int(max(height_a, height_b))

    if max_width < 50 or max_height < 50:
        return image

    destination = np.array([
        [0, 0],
        [max_width - 1, 0],
        [max_width - 1, max_height - 1],
        [0, max_height - 1],
    ], dtype='float32')

    matrix = cv2.getPerspectiveTransform(rect, destination)
    warped = cv2.warpPerspective(image, matrix, (max_width, max_height))
    return warped


def preprocess_image(gray: np.ndarray, preset: str) -> tuple[np.ndarray, np.ndarray]:
    config = PRESET_CONFIGS.get(preset, PRESET_CONFIGS['balanced'])

    if np.mean(gray) > 150:
        gray = cv2.bitwise_not(gray)

    normalized = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
    bilateral = cv2.bilateralFilter(normalized, 9, 75, 75)
    denoised = cv2.medianBlur(bilateral, 5)
    denoised = cv2.GaussianBlur(denoised, (5, 5), 0)

    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    adaptive = cv2.adaptiveThreshold(
        enhanced,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        config['adaptive_block'],
        config['adaptive_c'],
    )

    _, otsu = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    kernel_small = np.ones((3, 3), np.uint8)
    kernel_medium = np.ones((5, 5), np.uint8)
    kernel_large = np.ones((7, 7), np.uint8)

    adaptive_cleaned = cv2.morphologyEx(adaptive, cv2.MORPH_OPEN, kernel_small, iterations=1)
    adaptive_cleaned = cv2.morphologyEx(adaptive_cleaned, cv2.MORPH_CLOSE, kernel_medium, iterations=2)
    adaptive_cleaned = cv2.morphologyEx(adaptive_cleaned, cv2.MORPH_DILATE, kernel_small, iterations=1)

    otsu_cleaned = cv2.morphologyEx(otsu, cv2.MORPH_OPEN, kernel_small, iterations=1)
    otsu_cleaned = cv2.morphologyEx(otsu_cleaned, cv2.MORPH_CLOSE, kernel_large, iterations=1)

    return adaptive_cleaned, otsu_cleaned


def contour_candidates(mask: np.ndarray, width: int, height: int, preset: str) -> list[dict]:
    config = PRESET_CONFIGS.get(preset, PRESET_CONFIGS['balanced'])
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    image_area = width * height
    min_area = max(8, int(image_area * config['min_area_scale']))
    max_area = max(450, int(image_area * config['max_area_scale']))

    candidates: list[dict] = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < min_area or area > max_area:
            continue

        perimeter = cv2.arcLength(cnt, True)
        if perimeter == 0:
            continue

        circularity = (4 * np.pi * area) / (perimeter * perimeter)
        if circularity < 0.16:
            continue

        x, y, w, h = cv2.boundingRect(cnt)
        aspect_ratio = w / float(h) if h else 0
        if aspect_ratio < 0.35 or aspect_ratio > 2.8:
            continue

        M = cv2.moments(cnt)
        if M['m00'] == 0:
            continue

        cx = float(M['m10'] / M['m00'])
        cy = float(M['m01'] / M['m00'])

        candidates.append({
            'x': cx / width,
            'y': cy / height,
            'area': area,
            'score': circularity,
        })

    return candidates


def blob_candidates(mask: np.ndarray, width: int, height: int, preset: str) -> list[dict]:
    config = PRESET_CONFIGS.get(preset, PRESET_CONFIGS['balanced'])
    params = cv2.SimpleBlobDetector_Params()
    params.filterByArea = True
    params.minArea = max(8, (width * height) * config['min_area_scale'])
    params.maxArea = max(500, (width * height) * (config['max_area_scale'] + 0.0005))
    params.filterByCircularity = True
    params.minCircularity = 0.2
    params.filterByInertia = False
    params.filterByConvexity = False
    params.filterByColor = True
    params.blobColor = 255

    detector = cv2.SimpleBlobDetector_create(params)
    keypoints = detector.detect(mask)

    candidates = []
    for kp in keypoints:
        candidates.append({
            'x': kp.pt[0] / width,
            'y': kp.pt[1] / height,
            'area': np.pi * (kp.size / 2) ** 2,
            'score': kp.size,
        })
    return candidates


def dedupe_candidates(candidates: list[dict], preset: str) -> list[dict]:
    config = PRESET_CONFIGS.get(preset, PRESET_CONFIGS['balanced'])
    merged: list[dict] = []
    for candidate in sorted(candidates, key=lambda c: c.get('score', 0), reverse=True):
        exists = False
        for kept in merged:
            distance = np.sqrt((candidate['x'] - kept['x']) ** 2 + (candidate['y'] - kept['y']) ** 2)
            if distance < config['merge_radius']:
                exists = True
                break
        if not exists:
            merged.append(candidate)
    return merged


def suppress_outliers(candidates: list[dict]) -> list[dict]:
    if len(candidates) <= 3:
        return candidates

    points = np.array([[c['x'], c['y']] for c in candidates], dtype=np.float32)
    centroid = np.mean(points, axis=0)
    distances = np.linalg.norm(points - centroid, axis=1)
    median_distance = float(np.median(distances)) or 1.0

    filtered = []
    for candidate, distance in zip(candidates, distances):
        if distance <= median_distance * 4.5:
            filtered.append(candidate)

    return filtered


def spacing_consistency_filter(candidates: list[dict], preset: str) -> list[dict]:
    config = PRESET_CONFIGS.get(preset, PRESET_CONFIGS['balanced'])
    if len(candidates) < 4:
        return [{'x': c['x'], 'y': c['y']} for c in candidates]

    points = np.array([[c['x'], c['y']] for c in candidates], dtype=np.float32)
    accepted = []

    for idx, point in enumerate(points):
        distances = np.linalg.norm(points - point, axis=1)
        distances = distances[distances > 0]
        nearest = np.sort(distances)[:4]
        if len(nearest) == 0:
            continue
        if np.median(nearest) < config['neighbor_limit']:
            accepted.append({'x': candidates[idx]['x'], 'y': candidates[idx]['y']})

    return accepted if accepted else [{'x': c['x'], 'y': c['y']} for c in candidates]


def limit_candidates(candidates: list[dict], max_points: int = 220) -> list[dict]:
    trimmed = sorted(candidates, key=lambda c: c.get('score', 0), reverse=True)[:max_points]
    return [{'x': c['x'], 'y': c['y']} for c in trimmed]


def estimate_confidence(dot_count: int, preset: str) -> float:
    baseline = {
        'clean-scan': 0.88,
        'balanced': 0.78,
        'phone-photo': 0.7,
        'noisy-background': 0.62,
    }.get(preset, 0.75)

    if dot_count < 4:
        return max(0.2, baseline - 0.35)
    if dot_count > 180:
        return max(0.25, baseline - 0.2)
    return min(0.97, baseline + 0.05)


def detect_dots(gray: np.ndarray, width: int, height: int, preset: str) -> list[dict]:
    adaptive_mask, otsu_mask = preprocess_image(gray, preset)

    candidates = []
    candidates.extend(contour_candidates(adaptive_mask, width, height, preset))
    candidates.extend(contour_candidates(otsu_mask, width, height, preset))
    candidates.extend(blob_candidates(adaptive_mask, width, height, preset))
    candidates.extend(blob_candidates(otsu_mask, width, height, preset))

    merged = dedupe_candidates(candidates, preset)
    filtered = suppress_outliers(merged)
    filtered = spacing_consistency_filter(filtered, preset)
    return limit_candidates(filtered)


@app.get('/')
async def root():
    return {'message': 'Kolam Analyzer API is running'}


@app.post('/analyze')
async def analyze_kolam(
    file: UploadFile = File(...),
    preset: str = Form('balanced'),
    deskew: bool = Form(True),
):
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')

    try:
        contents = await file.read()
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
            'message': f'Detected {len(dots)} potential dots using the {preset} preset with denoising, threshold blending, blob fallback, and geometric cleanup.',
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
