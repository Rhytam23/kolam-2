from __future__ import annotations

import cv2
import numpy as np

from classify import SLUGS, classify, straightness
from drawing import colour_masks, radial_symmetry
from principles import stroke_mask
from main import run_analysis


def top(img: np.ndarray) -> dict:
    ok, buf = cv2.imencode('.png', img)
    return run_analysis(buf.tobytes(), 'balanced', False, None, False)['resemblance']


def fan(img, n, colours, radius=150, centre=(350, 300), width=8, rings=False):
    for k in range(n):
        a = 2 * np.pi * k / n
        c = (int(centre[0] + radius * np.cos(a)), int(centre[1] + radius * np.sin(a)))
        cv2.ellipse(img, c, (90, 38), float(np.degrees(a)), 0, 360, colours[k % len(colours)], width)
    if rings:
        for r in (60, 220):
            cv2.circle(img, centre, r, colours[0], width)
    return img


def test_dot_grid_with_curves_is_kolam():
    img = np.full((640, 640, 3), 30, np.uint8)
    for j in range(7):
        for i in range(7):
            cv2.circle(img, (110 + i * 70, 110 + j * 70), 6, (245, 245, 245), -1)
    for j in range(6):
        for i in range(6):
            cv2.circle(img, (145 + i * 70, 145 + j * 70), 24, (245, 245, 245), 3)
    result = top(img)
    assert result['ranked'][0]['slug'] == 'kolam'


def test_white_lines_on_black_is_jhoti_chita():
    img = np.full((600, 700, 3), 18, np.uint8)
    fan(img, 8, [(245, 245, 245)])
    assert top(img)['ranked'][0]['slug'] == 'jhoti-chita'


def test_yellow_ground_is_chittara():
    img = np.full((600, 700, 3), (60, 205, 250), np.uint8)    # turmeric yellow (BGR)
    fan(img, 6, [(20, 20, 150), (30, 30, 30)])
    assert top(img)['ranked'][0]['slug'] == 'chittara'


def test_coloured_rings_and_petals_is_pookalam_or_rangoli():
    img = np.full((600, 700, 3), (170, 170, 170), np.uint8)
    fan(img, 12, [(0, 215, 255), (30, 60, 220), (40, 160, 40), (20, 120, 250)], rings=True, width=14)
    assert top(img)['ranked'][0]['slug'] in ('pookalam', 'rangoli')


def test_square_four_fold_is_chowk_purana():
    img = np.full((600, 600, 3), (200, 200, 200), np.uint8)
    for k, c in enumerate([(0, 0, 220), (0, 200, 255), (200, 40, 30), (40, 160, 40)]):
        cv2.rectangle(img, (60 + k * 40, 60 + k * 40), (540 - k * 40, 540 - k * 40), c, 14)
    cv2.line(img, (60, 60), (540, 540), (0, 0, 220), 10)
    cv2.line(img, (540, 60), (60, 540), (200, 40, 30), 10)
    assert top(img)['ranked'][0]['slug'] == 'chowk-purana'


def test_white_zigzag_on_red_earth_is_mandana():
    img = np.full((600, 700, 3), (40, 60, 150), np.uint8)
    pts = np.array([[60 + 40 * i, 200 if i % 2 else 240] for i in range(16)], np.int32)
    cv2.polylines(img, [pts], False, (245, 245, 245), 8)
    cv2.polylines(img, [pts + [0, 140]], False, (245, 245, 245), 8)
    for i in range(0, 600, 60):
        cv2.line(img, (i, 500), (i + 60, 560), (245, 245, 245), 8)
    assert top(img)['ranked'][0]['slug'] in ('mandana', 'aipan')


def test_result_shape_is_always_valid():
    img = np.full((400, 400, 3), 200, np.uint8)
    for photo in (np.full((400, 400, 3), 200, np.uint8), np.random.default_rng(1).integers(0, 255, (400, 400, 3), dtype=np.uint8)):
        res = top(photo)
        if res is None:
            continue
        assert len(res['ranked']) <= 3 and all(x['slug'] in SLUGS for x in res['ranked'])
        assert isinstance(res['sure'], bool)


def test_straightness_tells_squares_from_circles():
    sq = np.full((400, 400, 3), 255, np.uint8)
    cv2.rectangle(sq, (60, 60), (340, 340), (0, 0, 0), 8)
    ci = np.full((400, 400, 3), 255, np.uint8)
    cv2.circle(ci, (200, 200), 140, (0, 0, 0), 8)
    assert straightness(sq) > 0.7 > 0.4 > straightness(ci) - 0.0 or straightness(sq) > straightness(ci) + 0.3


def test_blank_picture_has_nothing_to_compare():
    assert top(np.full((300, 300, 3), 255, np.uint8)) == {'ranked': [], 'sure': False}


def test_tiny_picture_is_refused_politely():
    from fastapi.testclient import TestClient
    import main
    ok, buf = cv2.imencode('.png', np.zeros((5, 5, 3), np.uint8))
    r = TestClient(main.app).post('/api/analyze', files={'file': ('t.png', buf.tobytes(), 'image/png')})
    assert r.status_code == 422 and 'too small' in r.json()['detail']
