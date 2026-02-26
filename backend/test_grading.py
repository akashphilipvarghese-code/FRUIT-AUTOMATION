#!/usr/bin/env python3
"""
Run the grading (compare) process from the backend without starting the HTTP server.
Tests get_compare_engine() and engine.compare(image_bytes) directly.
"""
import os
import sys
from pathlib import Path

# Run from backend directory so main.py is importable
_backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(_backend_dir))
# Also add project root for compare_engine (if real engine loads)
sys.path.insert(0, str(_backend_dir.parent))
os.chdir(_backend_dir)

# Create minimal test image
from PIL import Image
import io

def main():
    print("Creating test image (224x224)...")
    img = Image.new("RGB", (224, 224), color=(120, 80, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    image_bytes = buf.getvalue()
    print(f"  Image size: {len(image_bytes)} bytes")

    print("Loading compare engine (grading)...")
    from main import get_compare_engine
    engine = get_compare_engine()
    print("  Engine loaded.")

    print("Running grading (compare)...")
    result = engine.compare(image_bytes)
    print("  Result:")
    print(f"    ripeness_stage: {result.get('ripeness_stage')}")
    print(f"    confidence: {result.get('confidence')}")
    print(f"    top_3_similar: {len(result.get('top_3_similar', []))} items")
    print(f"    demo_mode: {result.get('demo_mode')}")
    if result.get("error"):
        print(f"    error: {result['error']}")
    print("Grading process completed successfully.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
