from __future__ import annotations

import cv2
import numpy as np

from drawing import colour_layers, radial_symmetry
from principles import stroke_mask

FLOOR = (40, 50, 120)      # BGR brick-red floor
RICE = (240, 240, 240)     # rice-flour white
MARIGOLD = (30, 160, 230)


def petals(n: int, extra_blob: bool = False, background=(255, 255, 255), ink=(20, 20, 20)) -> np.ndarray:
    img = np.full((600, 700, 3), background, np.uint8)
    for k in range(n):
        a = 2 * np.pi * k / n + 0.3
        centre = (int(350 + 150 * np.cos(a)), int(300 + 150 * np.sin(a)))
        cv2.ellipse(img, centre, (90, 35), float(np.degrees(a)), 0, 360, ink, 6)
    if extra_blob:
        cv2.circle(img, (120, 480), 50, ink, 6)
    return img


def order(img: np.ndarray, dark_ink: bool = True) -> int:
    return radial_symmetry(stroke_mask(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), dark_ink))['order']


def test_radial_symmetry_counts_petals():
    for n in (3, 5, 6, 8):
        assert order(petals(n)) == n


def test_radial_symmetry_rejects_lopsided_drawing():
    assert order(petals(5, extra_blob=True)) == 1


def test_rings_are_circular():
    img = np.full((500, 500, 3), 255, np.uint8)
    for r in (60, 120, 180):
        cv2.circle(img, (250, 250), r, (20, 20, 20), 5)
    assert radial_symmetry(stroke_mask(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)))['circular']


def test_palette_and_layers_of_a_floor_alpana():
    img = petals(8, background=FLOOR, ink=RICE)
    cv2.circle(img, (350, 300), 30, MARIGOLD, -1)
    palette, layers = colour_layers(img)
    assert palette[0]['background'] and palette[0]['share'] > 0.8
    colours = [p['hex'] for p in palette]
    assert len(colours) == 3  # floor, rice flour, marigold; no anti-aliasing blends
    assert all(layer['path'].startswith('M') for layer in layers)
    assert len(layers) == 2
    assert order(img, dark_ink=False) == 8
