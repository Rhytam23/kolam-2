from __future__ import annotations

import json

import cv2
import numpy as np
from fastapi.testclient import TestClient

import main
from tests.test_principles import crossing_kolam

client = TestClient(main.app)


def upload(img, name: str = 'k.png', kind: str = 'image/png', **data):
    body = cv2.imencode('.png', img)[1].tobytes() if not isinstance(img, bytes) else img
    return client.post('/api/analyze', files={'file': (name, body, kind)}, data=data)


def test_health():
    body = client.get('/api/health').json()
    assert body['status'] == 'ok'
    assert 'image/png' in body['allowedTypes']


def test_analyze_recreates_design():
    res = upload(crossing_kolam(3, 3), preset='clean-scan')
    assert res.status_code == 200
    body = res.json()
    assert body['lattice']['rows'] == 3
    assert body['design']['h'] == ['xx'] * 3
    assert body['confidence'] > 0.7
    assert 'image' not in body


def test_analyze_with_corrected_dots():
    img = crossing_kolam(3, 3)
    first = upload(img).json()
    res = upload(img, dots=json.dumps(first['dots'][:-1]))
    assert res.status_code == 200
    assert len(res.json()['dots']) == len(first['dots']) - 1


def test_rejects_bad_input():
    img = crossing_kolam(2, 2)
    assert upload(img, preset='nope').status_code == 422
    assert upload(img, name='k.gif', kind='image/gif').status_code == 415
    assert upload(img, dots='[{"x": 5, "y": 0}]').status_code == 422
    assert upload(b'0' * (main.MAX_UPLOAD_BYTES + 1)).status_code == 413
    assert upload(b'not an image').status_code == 400


def test_light_ink_on_dark_ground():
    floor = 255 - crossing_kolam(3, 3)  # rice-flour kolam on a dark floor
    body = upload(floor).json()
    assert body['lattice']['rows'] == 3
    assert body['design']['h'] == ['xx'] * 3
    again = upload(floor, dots=json.dumps(body['dots'])).json()
    assert again['design'] == body['design']


def test_perspective_correction_returns_corrected_image():
    paper = cv2.cvtColor(crossing_kolam(4, 4), cv2.COLOR_GRAY2BGR)
    h, w = paper.shape[:2]
    corners = np.float32([[120, 90], [600, 140], [560, 620], [90, 580]])
    warp = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), corners)
    photo = cv2.warpPerspective(paper, warp, (700, 700), dst=np.full((700, 700, 3), 40, np.uint8),
                                borderMode=cv2.BORDER_TRANSPARENT)
    body = upload(photo).json()
    assert (body['lattice']['rows'], body['lattice']['cols']) == (4, 4)
    assert body['image'].startswith('data:image/jpeg;base64,')
    assert 'image' not in upload(photo, deskew='false').json()


def test_diamond_kolam_is_not_mistaken_for_a_sheet():
    body = upload(crossing_kolam(5, 5, diamond=True)).json()
    assert 'image' not in body
    assert [row.count('1') for row in body['lattice']['mask']] == [1, 3, 5, 3, 1]


def test_free_hand_design_gets_radial_symmetry_and_colours():
    from tests.test_drawing import FLOOR, RICE, petals
    body = upload(petals(8, background=FLOOR, ink=RICE)).json()
    assert body['lattice'] is None
    assert body['radial']['order'] == 8
    assert body['palette'][0]['background']
    assert body['layers']
    assert '8-fold' in body['message']


def test_limits_photos_per_minute(monkeypatch):
    monkeypatch.setattr(main.config, 'RATE_LIMIT_PER_MINUTE', 2)
    img = np.full((64, 64, 3), 255, np.uint8)
    assert upload(img).status_code != 429
    assert upload(img).status_code != 429
    third = upload(img)
    assert third.status_code == 429
    assert 'wait a minute' in third.json()['detail']


def test_security_headers():
    headers = client.get('/api/health').headers
    assert headers['x-content-type-options'] == 'nosniff'
    assert headers['x-frame-options'] == 'DENY'
    assert "default-src 'self'" in headers['content-security-policy']


def test_each_page_has_its_own_address_and_title(tmp_path):
    (tmp_path / 'index.html').write_text(
        '<html><head><title>Home</title><meta name="description" content="x" />'
        '<meta property="og:title" content="Home" /></head><body></body></html>', encoding='utf-8')
    (tmp_path / 'routes.json').write_text(json.dumps([
        {'path': '/test-alpana', 'title': 'Alpana (আলপনা) · Chittara', 'description': 'Rice paste on red earth & more'},
    ]), encoding='utf-8')
    main.add_page_routes(tmp_path)
    page = client.get('/test-alpana')
    assert page.status_code == 200
    assert '<title>Alpana (আলপনা) · Chittara</title>' in page.text
    assert 'content="Rice paste on red earth &amp; more"' in page.text
    assert '<meta property="og:title" content="Alpana (আলপনা) · Chittara" />' in page.text
    assert client.get('/api/health').status_code == 200
