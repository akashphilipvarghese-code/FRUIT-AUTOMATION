#!/usr/bin/env python3
"""
Create a minimal fruit_dataset so ClearScan export can run.
Structure: fruit_dataset/Unripe, Semi-ripe, Ripe with one image each.
Replace these with real fruit images for proper grading.
"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise

ROOT = Path(__file__).resolve().parent
DATASET_DIR = ROOT / "fruit_dataset"
CLASSES = ["Unripe", "Semi-ripe", "Ripe"]
SIZE = (224, 224)


def main():
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    for i, cls in enumerate(CLASSES):
        subdir = DATASET_DIR / cls
        subdir.mkdir(parents=True, exist_ok=True)
        # Minimal image: different color per class so features differ
        r = 80 + i * 60
        g = 60 + i * 40
        b = 40
        img = Image.new("RGB", SIZE, color=(r, g, b))
        out = subdir / "sample.jpg"
        img.save(out, "JPEG", quality=85)
        print(f"  Created {out}")
    readme = DATASET_DIR / "README.txt"
    readme.write_text(
        "Sample dataset for ClearScan AI.\n"
        "Replace sample.jpg in each folder with real fruit images (Unripe, Semi-ripe, Ripe).\n"
        "Then run: python export_dataset_features.py fruit_dataset\n"
        "Then restart the backend.\n"
    )
    print(f"Created {DATASET_DIR}")
    print("Next: python export_dataset_features.py fruit_dataset")
    print("Then restart the backend for real grading.")


if __name__ == "__main__":
    main()
