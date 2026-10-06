"""Principles that apply to every floor-art style (kolam, rangoli, alpana, mandana, muggulu …),
with or without a dot grid: radial symmetry, the colour palette, and a traced vector copy.
"""
from __future__ import annotations

import cv2
import numpy as np

from vectorize import trace_mask as trace

WORK_SIDE = 640          # images are reduced to this size for colour work
MAX_COLOURS = 8
FIT_SAMPLE = 60_000      # pixels the colours are learned from; every pixel is then given its nearest colour


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


def colour_layers(image_bgr: np.ndarray) -> tuple[list[dict], list[dict]]:
    """Main colours (with the share of the picture each covers) and a traced, filled layer per colour."""
    palette, masks = colour_masks(image_bgr)
    layers = [{'color': colour, 'path': path} for colour, mask in masks if (path := trace(mask))]
    return palette, layers


def colour_masks(image_bgr: np.ndarray) -> tuple[list[dict], list[tuple[str, np.ndarray]]]:
    """Main colours and one binary mask per drawn (non-ground) colour, big areas first."""
    h, w = image_bgr.shape[:2]
    scale = WORK_SIDE / max(h, w)
    small = cv2.resize(image_bgr, (max(1, round(w * scale)), max(1, round(h * scale))), interpolation=cv2.INTER_AREA)
    small = cv2.bilateralFilter(small, 7, 40, 7)
    pixels = small.reshape(-1, 3).astype(np.float32)

    cv2.setRNGSeed(7)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    # Learn the colours from a sample (fast), then give every pixel its nearest colour (exact).
    sample = pixels if len(pixels) <= FIT_SAMPLE else pixels[np.random.default_rng(7).choice(len(pixels), FIT_SAMPLE, replace=False)]
    k = min(MAX_COLOURS, len(sample))
    _, _, centres = cv2.kmeans(sample, k, None, criteria, 2, cv2.KMEANS_PP_CENTERS)
    nearest = np.full(len(pixels), np.inf, dtype=np.float32)
    labels = np.zeros(len(pixels), dtype=np.int32)
    for i, centre in enumerate(centres):  # one colour at a time keeps memory small
        distance = ((pixels - centre) ** 2).sum(axis=1)
        closer = distance < nearest
        labels[closer], nearest[closer] = i, distance[closer]

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
            layers.append((colour, mask))
    if palette and not any(p['background'] for p in palette):
        palette[0]['background'] = True
        layers = [layer for layer in layers if layer[0] != palette[0]['hex']]
    # Uneven light can split the floor into several shades; report it as one ground colour.
    grounds = [p for p in palette if p['background']]
    if grounds:
        grounds[0]['share'] = round(sum(p['share'] for p in grounds), 3)
        palette = [grounds[0]] + [p for p in palette if not p['background']]
    # Draw big areas first so thin lines end up on top.
    return palette, layers[::-1]


def _rotated(mask: np.ndarray, centre: tuple[float, float], degrees: float) -> np.ndarray:
    matrix = cv2.getRotationMatrix2D(centre, degrees, 1.0)
    return cv2.warpAffine(mask.astype(np.float32), matrix, (mask.shape[1], mask.shape[0]), flags=cv2.INTER_LINEAR)


def tidy_layers(masks: list[tuple[str, np.ndarray]], radial: dict | None, ink: np.ndarray | None = None) -> list[dict]:
    """A cleaner copy of the traced design: wobbles smoothed away and, when the design is a turning
    pattern (a mandala-like alpana or rangoli), every petal made to match the others by majority vote."""
    order = radial['order'] if radial and not radial.get('circular') and radial['order'] >= 3 and radial['score'] >= 0.85 else 0
    centre = None
    if order and ink is not None:
        ys, xs = np.nonzero(ink)
        if len(xs) > 50:
            # The mask used for the symmetry reading was drawn at the picture's size, so scale to the colour masks.
            sy, sx = masks[0][1].shape[0] / ink.shape[0], masks[0][1].shape[1] / ink.shape[1]
            centre = (float(xs.mean()) * sx, float(ys.mean()) * sy)
    layers = []
    for colour, mask in masks:
        work = mask.astype(np.float32)
        if order and centre:
            votes = sum(_rotated(work, centre, 360.0 * i / order) for i in range(order)) / order
            work = (votes >= 0.5).astype(np.float32)
        path = trace(work > 0.5, min_area=20, smooth=1.6)
        if path:
            layers.append({'color': colour, 'path': path})
    return layers
