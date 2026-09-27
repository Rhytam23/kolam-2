"""Principles that apply to every floor-art style (kolam, rangoli, alpana, mandana, muggulu …),
with or without a dot grid: radial symmetry, the colour palette, and a traced vector copy.
"""
from __future__ import annotations

import cv2
import numpy as np

WORK_SIDE = 360          # images are reduced to this size for colour work
MAX_COLOURS = 6
MAX_PATH_POINTS = 2500   # per colour layer; keeps the response small


def radial_symmetry(mask: np.ndarray) -> dict | None:
    """Largest N for which the drawing looks the same after turning it by 360°/N (like an N-petal alpana)."""
    ys, xs = np.nonzero(mask)
    if len(xs) < 50:
        return None
    # Turn around the centre of the ink, which is the centre of any rotationally symmetric design.
    cx, cy = xs.mean(), ys.mean()
    radius = float(np.percentile(np.hypot(xs - cx, ys - cy), 99))
    if radius < 10:
        return None
    scale = 128 / radius
    small = cv2.GaussianBlur(cv2.resize(mask.astype(np.float32), None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA), (7, 7), 0)
    polar = cv2.warpPolar(small, (128, 720), (cx * scale, cy * scale), 128, cv2.WARP_POLAR_LINEAR)[:, 6:]
    loose = cv2.dilate(polar, np.ones((5, 5), np.float32))  # tolerate hand-drawn wobble
    total = max(float(polar.sum()), 1e-6)
    scores = {n: float(np.minimum(polar, np.roll(loose, round(720 / n), axis=0)).sum() / total) for n in range(2, 17)}

    if min(scores.values()) >= 0.9:
        return {'order': 0, 'score': round(min(scores.values()), 3), 'circular': True}
    # N-fold symmetry implies symmetry for every divisor of N, so require those too.
    orders = [n for n in scores if scores[n] >= 0.85 and all(scores[d] >= 0.8 for d in range(2, n) if n % d == 0)]
    order = max(orders) if orders else 1
    return {'order': order, 'score': round(scores.get(order, 1.0), 3), 'circular': False}


def _hex(bgr: np.ndarray) -> str:
    b, g, r = (int(round(c)) for c in bgr)
    return f'#{r:02x}{g:02x}{b:02x}'


def trace(mask: np.ndarray) -> str:
    """Outline a binary mask as an SVG path in 0–1 coordinates (draw with fill-rule="evenodd")."""
    h, w = mask.shape
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    contours = [c for c in contours if cv2.contourArea(c) >= 12]
    epsilon = 0.8
    while True:
        simplified = [cv2.approxPolyDP(c, epsilon, True) for c in contours]
        if sum(len(c) for c in simplified) <= MAX_PATH_POINTS or epsilon > 8:
            break
        epsilon *= 1.6
    parts = []
    for c in simplified:
        if len(c) < 3:
            continue
        pts = c[:, 0, :].astype(np.float64) / [w, h]
        parts.append('M' + 'L'.join(f'{x:.4f} {y:.4f}' for x, y in pts) + 'Z')
    return ''.join(parts)


def colour_layers(image_bgr: np.ndarray) -> tuple[list[dict], list[dict]]:
    """Main colours (with the share of the picture each covers) and a traced, filled layer per colour."""
    h, w = image_bgr.shape[:2]
    scale = WORK_SIDE / max(h, w)
    small = cv2.resize(image_bgr, (max(1, round(w * scale)), max(1, round(h * scale))), interpolation=cv2.INTER_AREA)
    small = cv2.bilateralFilter(small, 7, 40, 7)
    pixels = small.reshape(-1, 3).astype(np.float32)

    cv2.setRNGSeed(7)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    k = min(MAX_COLOURS, len(pixels))
    _, labels, centres = cv2.kmeans(pixels, k, None, criteria, 2, cv2.KMEANS_PP_CENTERS)
    labels = labels.ravel()

    # Merge near-identical colours (lighting gradients split one colour into two clusters).
    for a in range(k):
        for b in range(a + 1, k):
            if np.linalg.norm(centres[a] - centres[b]) < 30:
                labels[labels == b] = a
                centres[b] = centres[a]
    labels = labels.reshape(small.shape[:2])

    border = np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    border_share = {int(c): float(np.mean(border == c)) for c in np.unique(border)}
    counts = {int(c): int(np.sum(labels == c)) for c in np.unique(labels)}
    total = labels.size

    def is_blend(c: int) -> bool:
        """Anti-aliased edges form clusters lying between two bigger colours; they are not real colours."""
        bigger = [b for b in counts if counts[b] > counts[c]]
        for i, a in enumerate(bigger):
            for b in bigger[i + 1:]:
                ab = centres[b] - centres[a]
                t = np.clip(np.dot(centres[c] - centres[a], ab) / max(np.dot(ab, ab), 1e-6), 0, 1)
                if np.linalg.norm(centres[a] + t * ab - centres[c]) < 25:
                    return True
        return False

    palette, layers = [], []
    for c in sorted(counts, key=counts.get, reverse=True):
        share = counts[c] / total
        if share < 0.004 or is_blend(c):
            continue
        background = border_share.get(c, 0) >= 0.3
        colour = _hex(centres[c])
        palette.append({'hex': colour, 'share': round(share, 3), 'background': background})
        if not background:
            mask = cv2.morphologyEx((labels == c).astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
            path = trace(mask)
            if path:
                layers.append({'color': colour, 'path': path})
    if palette and not any(p['background'] for p in palette):
        palette[0]['background'] = True
        layers = [layer for layer in layers if layer['color'] != palette[0]['hex']]
    # Uneven light can split the floor into several shades; report it as one ground colour.
    grounds = [p for p in palette if p['background']]
    if grounds:
        grounds[0]['share'] = round(sum(p['share'] for p in grounds), 3)
        palette = [grounds[0]] + [p for p in palette if not p['background']]
    # Draw big areas first so thin lines end up on top.
    return palette, layers[::-1]
