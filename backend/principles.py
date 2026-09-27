"""Identify the design principles of a pulli kolam from its dots and strokes.

Pipeline:
1. ``infer_lattice``  – fit an affine dot lattice (spacing, angle, rows × cols, which cells hold dots).
2. ``stroke_mask``    – binarise the drawing so ink is 1.
3. ``infer_design``   – look at every port between two neighbouring dots and decide whether the
                        strands cross there ('x'), turn back around each dot ('p') or join the two
                        dots ('j'). Together with the lattice this fully describes the kolam, so the
                        frontend can recreate it and count its loops.
4. ``image_symmetry`` – mirror / rotation similarity of the drawing itself (also works for free-hand kolams).
"""
from __future__ import annotations

import cv2
import numpy as np

MAX_LATTICE_SIDE = 25


def infer_lattice(dots: list[dict], width: int, height: int) -> dict | None:
    if len(dots) < 4:
        return None

    size = np.array([width, height], dtype=np.float64)
    points = np.array([[d['x'], d['y']] for d in dots], dtype=np.float64) * size

    diff = points[:, None, :] - points[None, :, :]
    dist = np.hypot(diff[..., 0], diff[..., 1])
    np.fill_diagonal(dist, np.inf)
    spacing = float(np.median(dist.min(axis=1)))
    if spacing <= 0:
        return None

    # Dominant lattice direction: neighbour vectors are 90° apart, so average 4θ.
    neighbours = diff[(dist < 1.35 * spacing)]
    theta = np.arctan2(neighbours[:, 1], neighbours[:, 0])
    angle = float(np.angle(np.mean(np.exp(4j * theta))) / 4)

    c, s = np.cos(-angle), np.sin(-angle)
    rotated = points @ np.array([[c, -s], [s, c]]).T / spacing
    offset = np.angle(np.mean(np.exp(2j * np.pi * rotated), axis=0)) / (2 * np.pi)
    index = np.round(rotated - offset)

    # Refine with an affine fit (handles aspect ratio and mild perspective), then re-index.
    for _ in range(2):
        design_matrix = np.c_[index, np.ones(len(index))]
        affine, *_ = np.linalg.lstsq(design_matrix, points, rcond=None)
        if abs(np.linalg.det(affine[:2])) < 1e-9:
            return None
        index = np.round((points - affine[2]) @ np.linalg.inv(affine[:2]))

    error = np.linalg.norm(np.c_[index, np.ones(len(index))] @ affine - points, axis=1) / spacing
    inliers = error < 0.3
    fit = float(inliers.mean())
    if fit < 0.5:
        return None

    index = index[inliers].astype(int)
    first = index.min(axis=0)
    index -= first
    cols, rows = (index.max(axis=0) + 1).tolist()
    if max(rows, cols) > MAX_LATTICE_SIDE:
        return None

    mask = np.zeros((rows, cols), dtype=bool)
    mask[index[:, 1], index[:, 0]] = True
    origin = affine[2] + first[0] * affine[0] + first[1] * affine[1]
    u, v = affine[0], affine[1]

    return {
        'rows': rows,
        'cols': cols,
        'mask': [''.join('1' if cell else '0' for cell in row) for row in mask],
        'origin': {'x': float(origin[0] / width), 'y': float(origin[1] / height)},
        'u': {'x': float(u[0] / width), 'y': float(u[1] / height)},
        'v': {'x': float(v[0] / width), 'y': float(v[1] / height)},
        'angle': round(float(np.degrees(np.arctan2(u[1], u[0]))), 1),
        'spacing': round(float(np.hypot(*u)), 1),
        'fit': round(fit, 3),
    }


def stroke_mask(gray: np.ndarray, dark_ink: bool = True) -> np.ndarray:
    """Binary ink mask (1 = ink)."""
    source = cv2.bitwise_not(gray) if dark_ink else gray
    _, mask = cv2.threshold(cv2.GaussianBlur(source, (3, 3), 0), 0, 1, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return cv2.dilate(mask.astype(np.uint8), np.ones((3, 3), np.uint8))


def ink_is_dark(gray: np.ndarray, dots: list[dict]) -> bool:
    """True if the dots (which are ink) are darker than their surroundings."""
    h, w = gray.shape
    points = np.array([[d['x'] * w, d['y'] * h] for d in dots]) if dots else np.zeros((0, 2))
    return _ink(stroke_mask(gray, True), points) >= _ink(stroke_mask(gray, False), points)


def _ink(mask: np.ndarray, points: np.ndarray) -> float:
    h, w = mask.shape
    xs = np.round(points[:, 0]).astype(int)
    ys = np.round(points[:, 1]).astype(int)
    inside = (xs >= 0) & (xs < w) & (ys >= 0) & (ys < h)
    if not len(points):
        return 0.0
    values = np.zeros(len(points))
    values[inside] = mask[ys[inside], xs[inside]]
    return float(values.mean())


def infer_design(lattice: dict, mask: np.ndarray) -> tuple[dict, float]:
    """Classify every port between neighbouring dots. Returns the design and a 0–1 clarity score."""
    h, w = mask.shape
    scale = np.array([w, h], dtype=np.float64)
    origin = np.array([lattice['origin']['x'], lattice['origin']['y']]) * scale
    u = np.array([lattice['u']['x'], lattice['u']['y']]) * scale
    v = np.array([lattice['v']['x'], lattice['v']['y']]) * scale
    rows, cols, dots = lattice['rows'], lattice['cols'], lattice['mask']

    offsets = np.linspace(0.1, 0.3, 5)
    ring = np.array([[np.cos(a), np.sin(a)] for a in np.linspace(0, 2 * np.pi, 8, endpoint=False)]) * 0.06
    clarity: list[float] = []

    def classify(i: float, j: float, axis: np.ndarray) -> str:
        across = np.array([-axis[1], axis[0]])
        to_px = lambda pts: origin + pts[:, :1] * u + pts[:, 1:] * v  # noqa: E731
        port = np.array([i, j])
        centre = _ink(mask, to_px(np.vstack([port, port + ring])))
        along = _ink(mask, to_px(np.vstack([port + t * axis for t in offsets] + [port - t * axis for t in offsets])))
        side = _ink(mask, to_px(np.vstack([port + t * across for t in offsets] + [port - t * across for t in offsets])))
        if centre >= 0.5 and centre >= max(along, side):
            clarity.append(min(1.0, centre - min(along, side) + 0.5))
            return 'x'
        clarity.append(min(1.0, abs(along - side) * 2))
        return 'p' if along >= side else 'j'

    horizontal = np.array([1.0, 0.0])
    vertical = np.array([0.0, 1.0])
    h_ports = [
        ''.join(classify(i + 0.5, j, horizontal) if dots[j][i] == '1' == dots[j][i + 1] else '.' for i in range(cols - 1))
        for j in range(rows)
    ]
    v_ports = [
        ''.join(classify(i, j + 0.5, vertical) if dots[j][i] == '1' == dots[j + 1][i] else '.' for i in range(cols))
        for j in range(rows - 1)
    ]
    design = {'rows': rows, 'cols': cols, 'mask': dots, 'h': h_ports, 'v': v_ports}
    return design, (float(np.mean(clarity)) if clarity else 1.0)


def image_symmetry(mask: np.ndarray) -> dict | None:
    ys, xs = np.nonzero(mask)
    if len(xs) < 20:
        return None
    # Downsample and soften so thin lines a pixel apart still count as matching.
    crop = mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.float32)
    crop = cv2.GaussianBlur(cv2.resize(crop, (64, 64), interpolation=cv2.INTER_AREA), (5, 5), 0)

    def iou(other: np.ndarray) -> float:
        return round(float(np.minimum(crop, other).sum() / np.maximum(crop, other).sum()), 3)

    return {
        'mirrorVertical': iou(np.fliplr(crop)),
        'mirrorHorizontal': iou(np.flipud(crop)),
        'rotation180': iou(np.rot90(crop, 2)),
        'rotation90': iou(np.rot90(crop, 1)),
        'diagonal': iou(crop.T),
    }
