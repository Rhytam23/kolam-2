from __future__ import annotations

import cv2
import numpy as np
from fastapi.testclient import TestClient

import config
import main
from tests.test_principles import crossing_kolam

client = TestClient(main.app)


def post(img, **data):
    body = cv2.imencode('.png', img)[1].tobytes()
    return client.post('/api/analyze', files={'file': ('k.png', body, 'image/png')}, data=data)


def test_repeated_photo_is_served_from_cache(monkeypatch):
    calls = []
    real = main.run_analysis
    monkeypatch.setattr(main, 'run_analysis', lambda *a: calls.append(1) or real(*a))
    img = crossing_kolam(3, 3)
    first, second = post(img), post(img)
    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()
    assert len(calls) == 1


def test_huge_picture_is_refused(monkeypatch):
    monkeypatch.setattr(config, 'MAX_PIXELS', 1000)
    assert post(crossing_kolam(3, 3)).status_code == 413


def test_big_photo_is_reduced_before_reading(monkeypatch):
    monkeypatch.setattr(config, 'MAX_SIDE', 300)
    img = cv2.resize(crossing_kolam(3, 3), (900, 900), interpolation=cv2.INTER_NEAREST)
    body = post(img, grid='false').json()
    assert max(body['width'], body['height']) <= 300


def test_busy_server_asks_to_retry(monkeypatch):
    monkeypatch.setattr(config, 'MAX_WAITING', 0)
    res = post(crossing_kolam(3, 3))
    assert res.status_code == 503 and res.headers['retry-after']


def test_forwarded_header_cannot_dodge_the_limit(monkeypatch):
    monkeypatch.setattr(config, 'RATE_LIMIT_PER_MINUTE', 2)
    img = cv2.imencode('.png', crossing_kolam(2, 2))[1].tobytes()
    codes = [client.post('/api/analyze', files={'file': ('k.png', img + bytes([i]), 'image/png')},
                         headers={'x-forwarded-for': f'6.6.6.{i}, 10.0.0.1'}).status_code for i in range(3)]
    assert codes[-1] == 429


def test_failed_analysis_is_logged_and_reported(monkeypatch, caplog):
    def boom(*a):
        raise RuntimeError('x')
    monkeypatch.setattr(main, 'run_analysis', boom)
    assert post(crossing_kolam(3, 3)).status_code == 500
    assert 'analysis pipeline failed' in caplog.text
