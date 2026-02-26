#!/usr/bin/env python3
"""
Export dataset feature vectors for ClearScan AI /compare.
Run once with your fruit_dataset (Unripe, Semi-ripe, Ripe). Saves backend/data/compare_features.npz.
"""

import argparse
from pathlib import Path
import numpy as np

# Reuse training script helpers
from train_ripeness_classifier import (
    load_dataset,
    load_and_preprocess_image,
    extract_features_mobilenetv2,
    flatten_features,
    IMG_SIZE,
)

BACKEND_DATA = Path(__file__).resolve().parent / "backend" / "data"


def main():
    parser = argparse.ArgumentParser(description="Export MobileNetV2 features for ClearScan compare")
    parser.add_argument(
        "dataset_dir",
        type=str,
        nargs="?",
        default="fruit_dataset",
        help="Path to dataset root with Unripe, Semi-ripe, Ripe subfolders",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=str(BACKEND_DATA),
        help="Output directory for compare_features.npz",
    )
    args = parser.parse_args()

    dataset_dir = Path(args.dataset_dir)
    if not dataset_dir.is_dir():
        raise FileNotFoundError(f"Dataset not found: {dataset_dir}")

    print("Loading dataset...")
    image_paths, labels = load_dataset(dataset_dir)
    # Use absolute paths so backend can read images
    image_paths = np.array([str(Path(p).resolve()) for p in image_paths])
    print(f"  {len(image_paths)} images, classes: {np.unique(labels)}")

    print("Extracting features with MobileNetV2...")
    features = extract_features_mobilenetv2(image_paths, batch_size=32)
    vectors = flatten_features(features)
    print(f"  Shape: {vectors.shape}")

    # Class means (average feature vector per class)
    class_means = {}
    for c in np.unique(labels):
        mask = labels == c
        class_means[str(c)] = np.mean(vectors[mask], axis=0)

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)
    npz_path = out_dir / "compare_features.npz"
    np.savez(
        npz_path,
        class_means=class_means,
        image_paths=image_paths,
        image_labels=labels,
        image_vectors=vectors,
    )
    print(f"Saved: {npz_path}")
    print("Restart the backend to use /compare.")


if __name__ == "__main__":
    main()
