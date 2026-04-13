from __future__ import annotations

import os
import sys
import unittest

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import get_allowed_origins
from detection import estimate_confidence, order_points


class DetectionTests(unittest.TestCase):
    def test_order_points_returns_expected_corners(self) -> None:
        points = np.array([[10, 10], [100, 12], [98, 99], [12, 101]], dtype='float32')
        rect = order_points(points)

        self.assertTrue(np.allclose(rect[0], [10, 10]))
        self.assertTrue(np.allclose(rect[1], [100, 12]))
        self.assertTrue(np.allclose(rect[2], [98, 99]))
        self.assertTrue(np.allclose(rect[3], [12, 101]))

    def test_estimate_confidence_respects_preset_baselines(self) -> None:
        self.assertGreater(estimate_confidence(20, 'clean-scan'), estimate_confidence(20, 'noisy-background'))

    def test_allowed_origins_defaults_to_localhosts(self) -> None:
        previous = os.environ.get('CORS_ORIGINS')
        try:
            os.environ.pop('CORS_ORIGINS', None)
            origins = get_allowed_origins()
        finally:
            if previous is None:
                os.environ.pop('CORS_ORIGINS', None)
            else:
                os.environ['CORS_ORIGINS'] = previous

        self.assertIn('http://localhost:3000', origins)
        self.assertIn('http://127.0.0.1:3000', origins)


if __name__ == '__main__':
    unittest.main()
