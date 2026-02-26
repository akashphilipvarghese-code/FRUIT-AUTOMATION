#!/usr/bin/env python3
"""Copy fruit images from Desktop/Project into FruityVisionAI/fruit_dataset (Unripe, Semi-ripe, Ripe)."""
import re
import shutil
from pathlib import Path

DESKTOP = Path("/Users/sid/Desktop")
PROJECT = DESKTOP / "Project" / "DataSet"
OUT = DESKTOP / "FruityVisionAI" / "fruit_dataset"
SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for sub in ("Unripe", "Semi-ripe", "Ripe"):
        (OUT / sub).mkdir(exist_ok=True)

    # Kesar Mango/Big: map by filename
    km = PROJECT / "Kesar Mango" / "Big"
    if km.is_dir():
        for f in km.iterdir():
            if not f.is_file() or f.suffix.lower() not in SUFFIXES:
                continue
            name = f.name.lower()
            if "unripe" in name or "mixunripe" in name:
                shutil.copy2(f, OUT / "Unripe" / f.name)
            elif "partially" in name or "partiallyripe" in name:
                shutil.copy2(f, OUT / "Semi-ripe" / f.name)
            elif "ripe" in name or "mixripe" in name:
                shutil.copy2(f, OUT / "Ripe" / f.name)

    # MANGO QUALITY GRADING: G1,G2=Unripe, G3-G5=Semi-ripe, G6-G9=Ripe
    mqg = PROJECT / "MANGO QUALITY GRADING"
    if mqg.is_dir():
        for g in ("G1", "G2"):
            folder = mqg / g
            if folder.is_dir():
                for f in folder.iterdir():
                    if f.is_file() and f.suffix.lower() in SUFFIXES:
                        shutil.copy2(f, OUT / "Unripe" / f"{g}_{f.name}")
        for g in ("G3", "G4", "G5"):
            folder = mqg / g
            if folder.is_dir():
                for f in folder.iterdir():
                    if f.is_file() and f.suffix.lower() in SUFFIXES:
                        shutil.copy2(f, OUT / "Semi-ripe" / f"{g}_{f.name}")
        for g in ("G6", "G7", "G8", "G9"):
            folder = mqg / g
            if folder.is_dir():
                for f in folder.iterdir():
                    if f.is_file() and f.suffix.lower() in SUFFIXES:
                        shutil.copy2(f, OUT / "Ripe" / f"{g}_{f.name}")

    u = len(list((OUT / "Unripe").iterdir()))
    s = len(list((OUT / "Semi-ripe").iterdir()))
    r = len(list((OUT / "Ripe").iterdir()))
    print(f"Done. Unripe: {u}, Semi-ripe: {s}, Ripe: {r}")


if __name__ == "__main__":
    main()
