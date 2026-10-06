"""Turns a binary mask into smooth SVG outlines: corners stay sharp, curves become cubic Béziers."""
from __future__ import annotations

import cv2
import numpy as np

MAX_PATH_POINTS = 3000     # anchor points per colour layer; keeps the response small
CORNER_DEGREES = 62.0      # a turn sharper than this stays a corner


def _corners(pts: np.ndarray) -> np.ndarray:
    prev, nxt = np.roll(pts, 1, axis=0), np.roll(pts, -1, axis=0)
    a, b = pts - prev, nxt - pts
    na, nb = np.linalg.norm(a, axis=1), np.linalg.norm(b, axis=1)
    cos = np.einsum('ij,ij->i', a, b) / np.maximum(na * nb, 1e-9)
    return np.degrees(np.arccos(np.clip(cos, -1, 1))) > CORNER_DEGREES


def bezier_loop(pts: np.ndarray, scale: np.ndarray) -> str:
    """One closed outline as 'M x y C ... Z' (Catmull-Rom curve through the points, straight into corners)."""
    n = len(pts)
    corner = _corners(pts)
    tangent = (np.roll(pts, -1, axis=0) - np.roll(pts, 1, axis=0)) / 2.0
    out = [f'M{pts[0, 0] * scale[0]:.4f} {pts[0, 1] * scale[1]:.4f}']
    for i in range(n):
        j = (i + 1) % n
        chord = pts[j] - pts[i]
        c1 = pts[i] + (chord if corner[i] else tangent[i]) / 3.0
        c2 = pts[j] - (chord if corner[j] else tangent[j]) / 3.0
        out.append('C' + ' '.join(f'{v:.4f}' for v in (*(c1 * scale), *(c2 * scale), *(pts[j] * scale))))
    return ''.join(out) + 'Z'


def trace_mask(mask: np.ndarray, min_area: float = 12.0, smooth: float = 0.0) -> str:
    """Outline a binary mask as a smooth SVG path in 0-1 coordinates (draw with fill-rule="evenodd").

    smooth > 0 blurs the mask first, giving rounder, tidier shapes (used for the 'tidied' version).
    """
    h, w = mask.shape
    work = mask.astype(np.uint8)
    if smooth > 0:
        work = (cv2.GaussianBlur(work.astype(np.float32), (0, 0), smooth) > 0.5).astype(np.uint8)
    contours, _ = cv2.findContours(work, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    contours = [c for c in contours if cv2.contourArea(c) >= min_area and len(c) >= 6]
    # Curves need far fewer anchors than straight polygons: simplify gently, more if the budget demands.
    epsilon = 0.9 + smooth * 0.4
    while True:
        simplified = [cv2.approxPolyDP(c, epsilon, True)[:, 0, :].astype(np.float64) for c in contours]
        if sum(len(c) for c in simplified) <= MAX_PATH_POINTS or epsilon > 10:
            break
        epsilon *= 1.4
    scale = np.array([1.0 / w, 1.0 / h])
    # Contour pixels are pixel centres; shift by half a pixel so the outline hugs the shape's edge.
    return ''.join(bezier_loop(c + 0.5, scale) for c in simplified if len(c) >= 3)
