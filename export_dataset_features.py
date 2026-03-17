#!/usr/bin/env python3
"""
Export dataset feature vectors for ClearScan AI /compare.
Run once with your fruit_dataset (Unripe, Semi-ripe, Ripe). Saves backend/data/compare_features.npz.
"""

import argparse
from pathlib import Path
import numpy as np

VALID_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# Optional TensorFlow/Keras - required to export real features
try:
    from PIL import Image
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    from tensorflow.keras.preprocessing.image import img_to_array
    from tensorflow.keras.models import Model

    TF_AVAILABLE = True
except Exception:
    TF_AVAILABLE = False

IMG_SIZE = (224, 224)

BACKEND_DATA = Path(__file__).resolve().parent / "backend" / "data"

STAGES = ("Unripe", "Semi-ripe", "Ripe")


def _fruit_from_path(dataset_root: Path, image_path: Path) -> str:
    """
    Expect: <dataset_root>/<stage>/<fruit>/<filename>
    If fruit is missing, return "Unknown".
    """
    try:
        rel = image_path.resolve().relative_to(dataset_root.resolve())
        parts = rel.parts
        if len(parts) >= 2 and parts[0] in STAGES:
            return parts[1]
    except Exception:
        pass
    return "Unknown"


def load_dataset(data_dir: Path):
    """Load image paths and labels from data_dir. Subfolders = class names."""
    data_dir = Path(data_dir)
    if not data_dir.is_dir():
        raise FileNotFoundError(f"Dataset directory not found: {data_dir}")

    image_paths = []
    labels = []
    for subdir in sorted(data_dir.iterdir()):
        if not subdir.is_dir() or subdir.name.startswith("."):
            continue
        label = subdir.name
        for f in subdir.rglob("*"):
            if f.is_file() and f.suffix.lower() in VALID_SUFFIXES and not f.name.startswith("."):
                image_paths.append(str(f))
                labels.append(label)

    if not image_paths:
        raise ValueError(
            f"No images found in {data_dir}. Expected subfolders with images (e.g. Unripe, Semi-ripe, Ripe)."
        )
    return np.array(image_paths), np.array(labels)


def _load_and_preprocess_image(path: str, target_size=IMG_SIZE):
    img = Image.open(path).convert("RGB")
    img = img.resize(target_size, Image.BILINEAR)
    arr = img_to_array(img)
    arr = np.expand_dims(arr, axis=0)
    arr = preprocess_input(arr)
    return arr


def _extract_features_mobilenetv2(image_paths: np.ndarray, batch_size: int = 32):
    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
        pooling=None,
    )
    model = Model(inputs=base.input, outputs=base.output)

    features_list = []
    n = len(image_paths)
    for start in range(0, n, batch_size):
        end = min(start + batch_size, n)
        batch = np.vstack([_load_and_preprocess_image(p) for p in image_paths[start:end]])
        feats = model.predict(batch, verbose=0)
        features_list.append(feats)

    return np.vstack(features_list)


def _flatten_features(features: np.ndarray):
    return np.mean(features, axis=(1, 2))


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
    parser.add_argument(
        "--max-per-class",
        type=int,
        default=1500,
        help="Cap images per class for faster export (default: 1500). Use 0 for no cap.",
    )
    args = parser.parse_args()

    dataset_dir = Path(args.dataset_dir)
    if not dataset_dir.is_dir():
        raise FileNotFoundError(f"Dataset not found: {dataset_dir}")

    if not TF_AVAILABLE:
        raise RuntimeError(
            "TensorFlow + PIL are required to export compare_features.npz. "
            "Install them (see backend/requirements.txt), then rerun."
        )

    print("Loading dataset...")
    image_paths, labels = load_dataset(dataset_dir)
    # Use absolute paths so backend can read images
    image_paths = np.array([str(Path(p).resolve()) for p in image_paths])
    classes = np.unique(labels)

    if args.max_per_class and args.max_per_class > 0:
        kept_paths = []
        kept_labels = []
        for c in classes:
            mask = labels == c
            p = image_paths[mask]
            # deterministic: sorted order
            p = np.array(sorted(p.tolist()))
            if len(p) > args.max_per_class:
                p = p[: args.max_per_class]
            kept_paths.append(p)
            kept_labels.append(np.array([c] * len(p)))
        image_paths = np.concatenate(kept_paths)
        labels = np.concatenate(kept_labels)

    print(f"  {len(image_paths)} images, classes: {classes}")

    # Fruit label inferred from path: fruit_dataset/<stage>/<fruit>/<file>
    image_fruits = np.array(
        [_fruit_from_path(dataset_dir, Path(p)) for p in image_paths],
        dtype=object,
    )

    print("Extracting features with MobileNetV2...")
    features = _extract_features_mobilenetv2(image_paths, batch_size=32)
    vectors = _flatten_features(features)
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
        image_fruits=image_fruits,
        image_vectors=vectors,
    )
    print(f"Saved: {npz_path}")
    print("Restart the backend to use /compare.")


if __name__ == "__main__":
    main()
