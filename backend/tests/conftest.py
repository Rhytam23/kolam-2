import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


import pytest


@pytest.fixture(autouse=True)
def reset_rate_limit():
    """Each test starts with a clean per-minute photo count."""
    import main
    main._recent.clear()
    main._cache.clear()
    yield
