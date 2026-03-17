"""
Optional compare engine using HybridFruitNet.
When HybridFruitNet is available (sibling dir or HYBRID_FRUIT_NET_PATH),
/compare can use it for ripeness inference.
"""

import os
from pathlib import Path

# HybridFruitNet is typically a sibling of FruityVisionAI (e.g. both on Desktop)
_BACKEND_DIR = Path(__file__).resolve().parent
_FRUITY_ROOT = _BACKEND_DIR.parent
_DEFAULT_HYBRID_PATH = _FRUITY_ROOT.parent / "HybridFruitNet"


def get_hybrid_compare():
    """Return compare(image_bytes) -> dict if HybridFruitNet is available, else None."""
    hybrid_path = os.environ.get("HYBRID_FRUIT_NET_PATH") or str(_DEFAULT_HYBRID_PATH)
    hybrid_path = Path(hybrid_path)
    if not hybrid_path.is_dir():
        return None
    try:
        import sys
        if str(hybrid_path) not in sys.path:
            sys.path.insert(0, str(hybrid_path))
        from compare_api import compare
        return compare
    except Exception:
        return None
