"""Principles that apply to every floor-art style (kolam, rangoli, alpana, mandana, muggulu …),
with or without a dot grid: radial symmetry, the colour palette, and a traced vector copy.
"""
from __future__ import annotations

import cv2
import numpy as np

from enhance import is_clean_graphic
from vectorize import trace_mask as trace

WORK_SIDE = 900          # images are reduced to this size for colour work
MAX_COLOURS = 8
SMOOTH = 0.0            # blur (in source pixels) applied to clean drawings before deciding colours
INK_BIAS = 0.38         # how far from the ground to the ink a pixel must be to count as ink
GROUND_SHADE = 70       # a photo colour this close to the ground colour is a shade of the ground (shadow), not a drawing
HIGH_SIDE = 1500         # the long side colours are decided at, after enlarging, so edges land between pixels
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


def _core_colour(image: np.ndarray, mask: np.ndarray, fallback: np.ndarray, ground: np.ndarray) -> np.ndarray:
    """The true colour of a drawn layer. Thin strokes blur into the floor, so the cluster centre (and even
    the middle of the stroke) looks washed out; the pixels furthest from the floor colour keep the real colour."""
    pixels = image[mask.astype(bool)]
    if len(pixels) < 5:
        return fallback
    away = np.linalg.norm(pixels.astype(np.float32) - ground, axis=1)
    strongest = pixels[away >= np.percentile(away, 80)]
    return np.median(strongest, axis=0)


def colour_layers(image_bgr: np.ndarray) -> tuple[list[dict], list[dict]]:
    """Main colours (with the share of the picture each covers) and a traced, filled layer per colour."""
    palette, masks = colour_masks(image_bgr)
    layers = [{'color': colour, 'path': path} for colour, mask in masks if (path := trace(mask))]
    return palette, layers


def colour_masks(image_bgr: np.ndarray) -> tuple[list[dict], list[tuple[str, np.ndarray]]]:
    """Main colours and one binary mask per drawn (non-ground) colour, big areas first.

    The real colours are found first. Every pixel then goes to the nearest real colour, so the
    anti-aliased pixels along thin lines are never lost, and the picture is enlarged (cubic) before
    that decision so the edges fall between pixels, as they do in the original drawing.
    """
    h, w = image_bgr.shape[:2]
    graphic = is_clean_graphic(image_bgr)
    scale = min(1.0, WORK_SIDE / max(h, w))
    small = image_bgr if scale == 1.0 else cv2.resize(image_bgr, (max(1, round(w * scale)), max(1, round(h * scale))), interpolation=cv2.INTER_AREA)
    if not graphic:
        small = cv2.bilateralFilter(small, 7, 40, 7)   # photos carry noise; clean drawings must keep their thin lines
    pixels = small.reshape(-1, 3).astype(np.float32)

    cv2.setRNGSeed(7)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    # Learn the colours from a sample (fast), then give every pixel its nearest colour (exact).
    sample = pixels if len(pixels) <= FIT_SAMPLE else pixels[np.random.default_rng(7).choice(len(pixels), FIT_SAMPLE, replace=False)]
    k = min(MAX_COLOURS, len(sample))
    _, _, centres = cv2.kmeans(sample, k, None, criteria, 2, cv2.KMEANS_PP_CENTERS)
    labels = _nearest(pixels, centres)

    # Merge near-identical colours (lighting gradients split one colour into two clusters).
    for a in range(k):
        for b in range(a + 1, k):
            if np.linalg.norm(centres[a] - centres[b]) < 30:
                labels[labels == b] = a
                centres[b] = centres[a]
    labels = labels.reshape(small.shape[:2])

    counts = {int(c): int(np.sum(labels == c)) for c in np.unique(labels)}
    total = labels.size
    min_share = 0.0015 if graphic else 0.004

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

    real = [c for c in sorted(counts, key=counts.get, reverse=True) if counts[c] / total >= min_share and not is_blend(c)]
    if not real:
        real = [max(counts, key=counts.get)]
    real_centres = centres[real].astype(np.float32)

    # Enlarge before deciding, so a stroke one pixel wide still has a width of several pixels.
    factor = int(np.clip(round(HIGH_SIDE / max(small.shape[:2])), 1, 4))
    big = small if factor == 1 else cv2.resize(small, None, fx=factor, fy=factor, interpolation=cv2.INTER_CUBIC)
    if graphic and SMOOTH > 0:
        # Scan and compression speckle would make ragged edges; a light blur at the enlarged size removes it.
        big = cv2.GaussianBlur(big, (0, 0), SMOOTH * factor)
    hi = _decide(big, real_centres, graphic)

    border = np.concatenate([hi[0], hi[-1], hi[:, 0], hi[:, -1]])
    border_share = {int(c): float(np.mean(border == c)) for c in np.unique(border)}
    ground = real_centres[max(border_share, key=border_share.get)]
    palette, layers = [], []
    for index in np.argsort([-int(np.sum(hi == i)) for i in range(len(real))]):
        share = float(np.mean(hi == index))
        if share == 0:
            continue
        background = border_share.get(int(index), 0) >= 0.3
        # In a photo, uneven light splits the floor into darker and lighter shades of one colour: not a design.
        if not graphic and np.linalg.norm(real_centres[index] - ground) < GROUND_SHADE:
            background = True
        colour = _hex(real_centres[index])
        mask = None
        if not background:
            mask = (hi == index).astype(np.uint8)
            if not graphic:
                mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((2 * factor, 2 * factor), np.uint8))
                colour = _hex(_core_colour(big, mask, real_centres[index], ground))
        palette.append({'hex': colour, 'share': round(share, 3), 'background': background})
        if mask is not None:
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


def _decide(big: np.ndarray, centres: np.ndarray, graphic: bool) -> np.ndarray:
    """The colour of every pixel of the enlarged picture. With two colours, a pixel counts as the second (the
    drawn one) once it is INK_BIAS of the way from the ground to it: thin lines are lighter than their true
    colour after anti-aliasing, so halfway would lose them."""
    flat = big.reshape(-1, 3).astype(np.float32)
    if graphic and len(centres) == 2:
        # Which of the two is the ground is not known yet: the one most pixels are nearest to.
        votes = _nearest(flat[::7], centres)
        ground = int(np.argmax(np.bincount(votes, minlength=2)))
        a, b = centres[ground], centres[1 - ground]
        axis = b - a
        t = ((flat - a) @ axis) / max(float(axis @ axis), 1e-6)
        return np.where(t > INK_BIAS, 1 - ground, ground).astype(np.int32).reshape(big.shape[:2])
    return _nearest(flat, centres).reshape(big.shape[:2])


def _nearest(pixels: np.ndarray, centres: np.ndarray) -> np.ndarray:
    """Index of the nearest colour for every pixel, one colour at a time to keep memory small."""
    best = np.full(len(pixels), np.inf, dtype=np.float32)
    labels = np.zeros(len(pixels), dtype=np.int32)
    for i, centre in enumerate(centres):
        distance = ((pixels - centre) ** 2).sum(axis=1)
        closer = distance < best
        labels[closer], best[closer] = i, distance[closer]
    return labels


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


def trace_fidelity(image_bgr: np.ndarray, masks: list[tuple[str, np.ndarray]], palette: list[dict]) -> float | None:
    """How closely the drawn colours match the picture, 0 to 1: the share of the picture's pixels whose colour
    decision (ground or one of the drawn colours) the traced layers reproduce, scored on the layers' own grid."""
    if not masks:
        return None
    h, w = masks[0][1].shape
    small = cv2.resize(image_bgr, (w, h), interpolation=cv2.INTER_AREA)
    ground = next((p for p in palette if p['background']), None)
    colours = [m[0] for m in masks]
    hexes = ([ground['hex']] if ground else []) + colours
    centres = np.array([[int(hx[5:7], 16), int(hx[3:5], 16), int(hx[1:3], 16)] for hx in hexes], np.float32)
    truth = _nearest(small.reshape(-1, 3).astype(np.float32), centres).reshape(h, w)
    predicted = np.zeros((h, w), np.int32)            # 0 = ground when there is one
    offset = 1 if ground else 0
    for i, (_, mask) in enumerate(masks):
        predicted[mask.astype(bool)] = i + offset
    # Edge pixels are blended and ambiguous in the source; judge only pixels at least 2 px away from any edge.
    edge = cv2.dilate(cv2.Canny(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY), 40, 120), np.ones((5, 5), np.uint8)) > 0
    # Thin features are all edge, so they would never be judged: count them too, at a lower weight.
    weight = np.where(edge, 0.35, 1.0)
    return round(float((weight * (truth == predicted)).sum() / weight.sum()), 3)
