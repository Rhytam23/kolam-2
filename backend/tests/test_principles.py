from __future__ import annotations

import cv2
import numpy as np
import pytest

from detection import detect_dots, order_points
from principles import image_symmetry, infer_design, infer_lattice, stroke_mask

SPACING = 60
MARGIN = 80


def canvas(rows: int, cols: int) -> np.ndarray:
    return np.full((2 * MARGIN + (rows - 1) * SPACING, 2 * MARGIN + (cols - 1) * SPACING), 255, np.uint8)


def at(i: float, j: float) -> tuple[int, int]:
    return int(MARGIN + i * SPACING), int(MARGIN + j * SPACING)


def draw_dots(img: np.ndarray, cells: list[tuple[int, int]]) -> None:
    for i, j in cells:
        cv2.circle(img, at(i, j), 6, 0, -1)


def crossing_kolam(rows: int, cols: int, diamond: bool = False) -> np.ndarray:
    """Every dot enclosed by a diamond, so every inner port is a crossing."""
    img = canvas(rows, cols)
    c = (rows - 1) / 2
    cells = [(i, j) for j in range(rows) for i in range(cols) if not diamond or abs(i - c) + abs(j - c) <= c]
    draw_dots(img, cells)
    for i, j in cells:
        diamond = np.array([at(i, j - 0.5), at(i + 0.5, j), at(i, j + 0.5), at(i - 0.5, j)], np.int32)
        cv2.polylines(img, [diamond], True, 0, 3)
    return img


def dots_of(cells: list[tuple[float, float]], shape: tuple[int, int]) -> list[dict]:
    h, w = shape
    return [{'x': at(i, j)[0] / w, 'y': at(i, j)[1] / h} for i, j in cells]


def pair_lattice(img: np.ndarray) -> dict:
    h, w = img.shape
    return {
        'rows': 1, 'cols': 2, 'mask': ['11'],
        'origin': {'x': at(0, 0)[0] / w, 'y': at(0, 0)[1] / h},
        'u': {'x': SPACING / w, 'y': 0}, 'v': {'x': 0, 'y': SPACING / h},
    }


def test_lattice_of_square_grid():
    img = canvas(4, 5)
    cells = [(i, j) for j in range(4) for i in range(5)]
    lattice = infer_lattice(dots_of(cells, img.shape), img.shape[1], img.shape[0])
    assert (lattice['rows'], lattice['cols']) == (4, 5)
    assert lattice['fit'] == 1
    assert abs(lattice['angle']) < 1
    assert lattice['mask'] == ['11111'] * 4
    assert lattice['spacing'] == pytest.approx(SPACING, abs=1)


def test_lattice_of_diamond_arrangement():
    img = canvas(5, 5)
    cells = [(i, j) for j in range(5) for i in range(5) if abs(i - 2) + abs(j - 2) <= 2]
    lattice = infer_lattice(dots_of(cells, img.shape), img.shape[1], img.shape[0])
    assert [row.count('1') for row in lattice['mask']] == [1, 3, 5, 3, 1]


def test_lattice_of_rotated_grid():
    rng = np.random.default_rng(0)
    angle = np.radians(30)
    rot = np.array([[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]])
    pts = np.array([[i, j] for j in range(4) for i in range(4)], float) @ rot.T * 50 + 300
    pts += rng.normal(0, 1.5, pts.shape)
    lattice = infer_lattice([{'x': x / 600, 'y': y / 600} for x, y in pts], 600, 600)
    assert (lattice['rows'], lattice['cols']) == (4, 4)
    assert lattice['angle'] % 90 == pytest.approx(30, abs=2)


def test_no_lattice_for_scattered_points():
    rng = np.random.default_rng(1)
    pts = rng.uniform(0, 1, (30, 2))
    assert infer_lattice([{'x': x, 'y': y} for x, y in pts], 500, 500) is None


def test_crossings_are_recognised_and_enclosed_dots_detected():
    img = crossing_kolam(3, 3)
    found = detect_dots(img, img.shape[1], img.shape[0], 'clean-scan')
    assert len(found) == 9
    lattice = infer_lattice(found, img.shape[1], img.shape[0])
    design, clarity = infer_design(lattice, stroke_mask(img))
    assert design['h'] == ['xx'] * 3
    assert design['v'] == ['xxx'] * 2
    assert clarity > 0.5


def test_diamond_kolam_keeps_its_tip_dots():
    img = crossing_kolam(5, 5, diamond=True)
    found = detect_dots(img, img.shape[1], img.shape[0], 'balanced')
    lattice = infer_lattice(found, img.shape[1], img.shape[0])
    assert [row.count('1') for row in lattice['mask']] == [1, 3, 5, 3, 1]


def test_turn_back_and_join_mirrors():
    apart = canvas(1, 2)
    draw_dots(apart, [(0, 0), (1, 0)])
    for i in (0, 1):
        cv2.circle(apart, at(i, 0), int(0.38 * SPACING), 0, 3)
    design, _ = infer_design(pair_lattice(apart), stroke_mask(apart))
    assert design['h'] == ['p']

    joined = canvas(1, 2)
    draw_dots(joined, [(0, 0), (1, 0)])
    cv2.ellipse(joined, at(0.5, 0), (int(0.8 * SPACING), int(0.25 * SPACING)), 0, 0, 360, 0, 3)
    design, _ = infer_design(pair_lattice(joined), stroke_mask(joined))
    assert design['h'] == ['j']


def test_image_symmetry_of_symmetric_drawing():
    sym = image_symmetry(stroke_mask(crossing_kolam(3, 3)))
    assert min(sym.values()) > 0.9


def test_order_points_returns_expected_corners():
    rect = order_points(np.array([[10, 10], [100, 12], [98, 99], [12, 101]], dtype='float32'))
    assert np.allclose(rect, [[10, 10], [100, 12], [98, 99], [12, 101]])
