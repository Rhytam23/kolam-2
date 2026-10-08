from __future__ import annotations

import re

import cv2
import numpy as np
from fastapi.testclient import TestClient

import main
from drawing import colour_masks, tidy_layers
from enhance import assess, repair
from tests.test_drawing import FLOOR, RICE, petals
from vectorize import trace_mask

client = TestClient(main.app)


def rasterise(path: str, size: tuple[int, int]) -> np.ndarray:
    """Draws an 'M..C..Z' path back into a mask, sampling every Bezier segment."""
    h, w = size
    canvas = np.zeros((h, w), bool)
    for loop in filter(None, path.split('M')):
        nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', loop)]
        start = np.array(nums[:2])
        pts, cur = [start], start
        for i in range(2, len(nums), 6):
            c1, c2, end = (np.array(nums[i + k:i + k + 2]) for k in (0, 2, 4))
            for t in np.linspace(0, 1, 9)[1:]:
                pts.append((1 - t) ** 3 * cur + 3 * (1 - t) ** 2 * t * c1 + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * end)
            cur = end
        poly = (np.array(pts) * [w, h]).astype(np.int32)
        one = np.zeros((h, w), np.uint8)
        cv2.fillPoly(one, [poly], 1)
        canvas ^= one.astype(bool)     # even-odd: holes cancel out
    return canvas


def iou(a: np.ndarray, b: np.ndarray) -> float:
    return float((a & b).sum() / max((a | b).sum(), 1))


def test_trace_is_smooth_and_faithful():
    mask = np.zeros((400, 400), np.uint8)
    cv2.circle(mask, (200, 200), 120, 1, -1)
    path = trace_mask(mask)
    assert 'C' in path
    assert path.count('C') < 60          # a circle needs few curve segments, not hundreds of tiny lines
    assert iou(rasterise(path, mask.shape), mask > 0) > 0.97


def test_trace_keeps_corners_sharp():
    mask = np.zeros((300, 300), np.uint8)
    mask[60:240, 80:220] = 1
    assert iou(rasterise(trace_mask(mask), mask.shape), mask > 0) > 0.97


def test_clean_photo_is_left_alone():
    img = petals(8, background=FLOOR, ink=RICE)
    assert assess(img)['problems'] == []
    assert repair(img)[1] == []


def test_shadowed_blurred_noisy_photo_is_repaired():
    img = petals(8, background=FLOOR, ink=RICE)
    shade = np.linspace(0.4, 1.0, img.shape[1])[None, :, None]
    noise = np.random.default_rng(3).normal(0, 16, img.shape)
    soft = cv2.GaussianBlur(img, (0, 0), 2.2).astype(np.float64)
    bad = np.clip(soft * shade + noise, 0, 255).astype(np.uint8)
    before = assess(bad)
    assert {'uneven light', 'noise'} <= set(before['problems'])
    fixed, fixes = repair(bad, before)
    assert fixes
    assert assess(fixed)['score'] > before['score']


def test_api_reports_what_it_repaired():
    img = petals(8, background=FLOOR, ink=RICE)
    shade = np.linspace(0.4, 1.0, img.shape[1])[None, :, None]
    bad = (img * shade).astype(np.uint8)
    body = client.post('/api/analyze', files={'file': ('k.png', cv2.imencode('.png', bad)[1].tobytes(), 'image/png')},
                       data={'grid': 'false'}).json()
    assert body['quality']['fixes'] and body['quality']['scoreAfter'] > body['quality']['score']
    assert body['image'].startswith('data:image/jpeg')


def test_tidy_restores_a_missing_petal():
    full = petals(8, background=FLOOR, ink=RICE)
    damaged = full.copy()
    cx, cy = full.shape[1] // 2, full.shape[0] // 2
    damaged[: cy - 40, cx - 60: cx + 60] = FLOOR     # wipe out the top petal's outer part
    _, masks = colour_masks(damaged)
    radial = {'order': 8, 'score': 0.9, 'circular': False}
    ink = (cv2.cvtColor(full, cv2.COLOR_BGR2GRAY) > 128).astype(np.uint8)
    shape = masks[0][1].shape
    y1 = int(shape[0] * (cy - 40) / full.shape[0])
    x0, x1 = int(shape[1] * (cx - 60) / full.shape[1]), int(shape[1] * (cx + 60) / full.shape[1])
    top = (slice(0, y1), slice(x0, x1))   # the wiped part of the picture
    plain = sum(m[top].sum() for _, m in masks)
    tidy = tidy_layers(masks, radial, ink)
    restored = sum(rasterise(layer['path'], shape)[top].sum() for layer in tidy)
    assert restored > plain * 3 and restored > 100


def lace_mandala(size: int = 230) -> np.ndarray:
    """White-on-red lacework with 1-2 px strokes, like a scanned printed mandala."""
    big = np.zeros((size * 4, size * 4), np.uint8)
    c = size * 2
    for r in (0.9, 0.78, 0.62, 0.45, 0.3):
        cv2.circle(big, (c, c), int(r * c), 255, 5)
    for k in range(24):
        a = 2 * np.pi * k / 24
        cv2.ellipse(big, (int(c + 0.7 * c * np.cos(a)), int(c + 0.7 * c * np.sin(a))), (int(0.12 * c), int(0.04 * c)), float(np.degrees(a)), 0, 360, 255, 4)
        cv2.circle(big, (int(c + 0.52 * c * np.cos(a + 0.13)), int(c + 0.52 * c * np.sin(a + 0.13))), 6, 255, -1)
    cv2.circle(big, (c, c), int(0.12 * c), 255, -1)
    ink = cv2.resize(big, (size, size), interpolation=cv2.INTER_AREA).astype(np.float32) / 255      # anti-aliased
    ground, white = np.array((0, 0, 150), np.float32), np.array((250, 250, 250), np.float32)
    return (ground + (white - ground) * ink[..., None]).astype(np.uint8)


def test_thin_lace_keeps_its_coverage_and_is_not_repaired():
    img = lace_mandala()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    ink_share = float(((gray - gray.min()) / (gray.max() - gray.min())).mean())   # how much ink the picture holds, edges counted by their lightness
    body = client.post('/api/analyze', files={'file': ('m.png', cv2.imencode('.png', img)[1].tobytes(), 'image/png')},
                       data={'grid': 'false'}).json()
    assert body['quality']['fixes'] == []
    assert len(body['layers']) == 1                       # no extra layer for the in-between pixels
    traced = rasterise(body['layers'][0]['path'], (img.shape[0] * 3, img.shape[1] * 3)).mean()
    assert abs(traced - ink_share) < 0.015                # thin lace neither lost (was -40%) nor swollen (was +10%)
    assert body['quality']['fidelity'] > 0.9


def test_trace_matches_the_source_closely():
    img = lace_mandala()
    body = client.post('/api/analyze', files={'file': ('m.png', cv2.imencode('.png', img)[1].tobytes(), 'image/png')},
                       data={'grid': 'false'}).json()
    h, w = img.shape[:2]
    mask = rasterise(body['layers'][0]['path'], (h * 3, w * 3))
    gray = cv2.resize(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (w * 3, h * 3), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    original = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    assert iou(mask, gray > (original.min() + original.max()) / 2) > 0.8   # 1-2 px strokes: one pixel of offset costs a lot of IoU


def test_gaps_between_fine_lines_stay_open():
    """Swollen strokes close the small red gaps between lines: the traced picture must keep about as many."""
    img = lace_mandala()
    body = client.post('/api/analyze', files={'file': ('m.png', cv2.imencode('.png', img)[1].tobytes(), 'image/png')},
                       data={'grid': 'false'}).json()
    h, w = img.shape[:2]
    gaps = lambda m: cv2.connectedComponents((~m).astype(np.uint8), connectivity=4)[0]
    source = cv2.resize(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (w * 3, h * 3), interpolation=cv2.INTER_CUBIC) > 147
    traced = rasterise(body['layers'][0]['path'], (h * 3, w * 3))
    assert gaps(traced) >= 0.9 * gaps(source)
