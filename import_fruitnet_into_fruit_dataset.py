#!/usr/bin/env python3
"""
Import FruitNetDataset into FruityVisionAI/fruit_dataset in the format expected by ClearScan /compare:
  fruit_dataset/
    Unripe/
    Semi-ripe/
    Ripe/

FruitNetDataset layout (as provided):
  Bad Quality_Fruits/   -> mapped to Unripe
  Mixed Qualit_Fruits/  -> mapped to Semi-ripe
  Good Quality_Fruits/  -> mapped to Ripe

By default this script creates symlinks (fast, no duplication). Use --copy to copy files instead.
"""

from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path
from typing import Iterable, Tuple


VALID_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def _iter_images(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in VALID_SUFFIXES and not p.name.startswith("."):
            yield p


def _safe_name(s: str) -> str:
    return "".join(c if c.isalnum() or c in ("-", "_", ".") else "_" for c in s).strip("_")


def _fruit_from_folder(folder: str) -> str:
    # Apple_Bad -> Apple, Orange_Good -> Orange, Banana -> Banana
    if "_" in folder:
        return folder.rsplit("_", 1)[0]
    return folder


def _stage_sources(fruitnet_root: Path) -> Tuple[Tuple[str, Path], ...]:
    return (
        ("Unripe", fruitnet_root / "Bad Quality_Fruits"),
        ("Semi-ripe", fruitnet_root / "Mixed Qualit_Fruits"),
        ("Ripe", fruitnet_root / "Good Quality_Fruits"),
    )


def _ensure_empty_dir(path: Path, wipe: bool) -> None:
    path.mkdir(parents=True, exist_ok=True)
    if wipe:
        for child in path.iterdir():
            if child.is_symlink() or child.is_file():
                child.unlink()
            elif child.is_dir():
                shutil.rmtree(child)


def _link_or_copy(src: Path, dst: Path, copy_files: bool) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists() or dst.is_symlink():
        return
    if copy_files:
        shutil.copy2(src, dst)
    else:
        # Use relative symlink when possible (keeps workspace portable)
        try:
            rel = os.path.relpath(src, start=dst.parent)
            dst.symlink_to(rel)
        except Exception:
            dst.symlink_to(src)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import FruitNetDataset into fruit_dataset/{Unripe,Semi-ripe,Ripe} for ClearScan /compare"
    )
    parser.add_argument(
        "--fruitnet",
        type=str,
        default=str(Path.home() / "Downloads" / "FruitNetDataset"),
        help="Path to FruitNetDataset root (default: ~/Downloads/FruitNetDataset)",
    )
    parser.add_argument(
        "--out",
        type=str,
        default=str(Path(__file__).resolve().parent / "fruit_dataset"),
        help="Output fruit_dataset directory (default: FruityVisionAI/fruit_dataset)",
    )
    parser.add_argument(
        "--copy",
        action="store_true",
        help="Copy files instead of creating symlinks",
    )
    parser.add_argument(
        "--wipe",
        action="store_true",
        help="Delete existing stage folders before importing",
    )
    args = parser.parse_args()

    fruitnet_root = Path(args.fruitnet).expanduser().resolve()
    out_root = Path(args.out).expanduser().resolve()

    if not fruitnet_root.is_dir():
        raise FileNotFoundError(f"FruitNetDataset folder not found: {fruitnet_root}")

    # Create stage dirs
    for stage, _src in _stage_sources(fruitnet_root):
        _ensure_empty_dir(out_root / stage, wipe=args.wipe)

    total = 0
    for stage, src_dir in _stage_sources(fruitnet_root):
        if not src_dir.is_dir():
            print(f"Skipping missing folder: {src_dir}")
            continue

        # Preserve fruit category as subfolder to avoid filename collisions.
        for fruit_dir in sorted([p for p in src_dir.iterdir() if p.is_dir() and not p.name.startswith(".")]):
            fruit_name = _safe_name(_fruit_from_folder(fruit_dir.name))
            for img in _iter_images(fruit_dir):
                dst = out_root / stage / fruit_name / img.name
                _link_or_copy(img, dst, copy_files=bool(args.copy))
                total += 1

    print(f"Imported {total} images into: {out_root}")
    print("Next run:")
    print(f"  python export_dataset_features.py \"{out_root}\"")
    print("Then restart the backend to use /compare.")


if __name__ == "__main__":
    main()

