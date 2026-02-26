#!/usr/bin/env python3
"""
Fruit Ripeness Classifier Training Script
- Load custom dataset: Unripe, Semi-ripe, Ripe subfolders
- Extract features with MobileNetV2 (TensorFlow/Keras)
- Train and compare: SVM, Random Forest, KNN (Scikit-Learn)
- Evaluate: Accuracy and F1-Score comparison table
- Save best deployment model as best_fruit_model.h5 (Keras)
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report

# TensorFlow/Keras
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.utils import to_categorical

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
RANDOM_STATE = 42
CLASS_NAMES = ["Ripe", "Semi-ripe", "Unripe"]  # folder names, order for one-hot


VALID_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def _load_from_dir(data_dir: Path, label: str, image_paths: list, labels: list):
    """Recursively add images: files get current label, subdirs recurse with subdir name as label."""
    data_dir = Path(data_dir)
    for f in data_dir.iterdir():
        if f.is_file() and f.suffix.lower() in VALID_SUFFIXES:
            image_paths.append(str(f))
            labels.append(label)
        elif f.is_dir() and not f.name.startswith("."):
            _load_from_dir(f, f.name, image_paths, labels)


def load_dataset(data_dir: Path, recursive: bool = False):
    """Load image paths and labels from data_dir. Subfolders = class names.
    If recursive=True, recurse into nested folders (e.g. .../MANGO QUALITY GRADING/G1 -> label G1).
    """
    data_dir = Path(data_dir)
    if not data_dir.is_dir():
        raise FileNotFoundError(f"Dataset directory not found: {data_dir}")

    image_paths = []
    labels = []

    if recursive:
        _load_from_dir(data_dir, data_dir.name, image_paths, labels)
    else:
        for subdir in data_dir.iterdir():
            if not subdir.is_dir() or subdir.name.startswith("."):
                continue
            label = subdir.name
            for f in subdir.iterdir():
                if f.is_file() and f.suffix.lower() in VALID_SUFFIXES:
                    image_paths.append(str(f))
                    labels.append(label)
            # One level of recursion: subdir might contain more subdirs (e.g. G1, G2)
            if not any(subdir.iterdir()):
                continue
            for inner in subdir.iterdir():
                if inner.is_dir() and not inner.name.startswith("."):
                    for f in inner.iterdir():
                        if f.is_file() and f.suffix.lower() in VALID_SUFFIXES:
                            image_paths.append(str(f))
                            labels.append(inner.name)

    if not image_paths:
        raise ValueError(
            f"No images found in {data_dir}. "
            "Expected subfolders with images (e.g. Unripe, Semi-ripe, Ripe or G1, G2, ...)."
        )

    return np.array(image_paths), np.array(labels)


def load_dataset_from_project(project_dir: Path):
    """Load from project folder using both 'DataSet' and 'New DataSet' inside it."""
    project_dir = Path(project_dir)
    image_paths = []
    labels = []

    for folder_name in ("DataSet", "New DataSet"):
        folder = project_dir / folder_name
        if not folder.is_dir():
            continue
        paths, lbls = load_dataset(folder, recursive=True)
        image_paths.append(paths)
        labels.append(lbls)

    if not image_paths:
        raise ValueError(
            f"No 'DataSet' or 'New DataSet' folder found in {project_dir}, or they contain no images."
        )
    return np.concatenate(image_paths), np.concatenate(labels)


def load_and_preprocess_image(path: str, target_size=IMG_SIZE):
    """Load image and preprocess for MobileNetV2."""
    img = Image.open(path).convert("RGB")
    img = img.resize(target_size, Image.BILINEAR)
    arr = img_to_array(img)
    arr = np.expand_dims(arr, axis=0)
    arr = preprocess_input(arr)
    return arr


def extract_features_mobilenetv2(image_paths: np.ndarray, batch_size: int = 32):
    """Build MobileNetV2 (no top) and extract features for all images."""
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
        batch = np.vstack(
            [load_and_preprocess_image(p) for p in image_paths[start:end]]
        )
        feats = model.predict(batch, verbose=0)
        features_list.append(feats)

    return np.vstack(features_list)


def flatten_features(features: np.ndarray):
    """Global average pooling over feature maps -> 1D vector per sample."""
    return np.mean(features, axis=(1, 2))


def main():
    parser = argparse.ArgumentParser(
        description="Train fruit ripeness classifier (MobileNetV2 + SVM/RF/KNN)"
    )
    parser.add_argument(
        "dataset_dir",
        type=str,
        nargs="?",
        default="dataset",
        help="Path to dataset root, or project folder if --project is used",
    )
    parser.add_argument(
        "--project",
        action="store_true",
        help="Use both 'DataSet' and 'New DataSet' folders inside the given path (e.g. Desktop/project)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="models",
        help="Directory to save best_fruit_model.h5 (default: models)",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=15,
        help="Epochs for Keras fine-tune model (default: 15)",
    )
    parser.add_argument(
        "--fast",
        action="store_true",
        help="Fast run: max 40 images per class, 5 epochs (for quick testing)",
    )
    args = parser.parse_args()

    if args.fast:
        args.epochs = 5

    project_or_dataset = Path(args.dataset_dir)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "best_fruit_model.h5"

    print("=" * 60)
    print("Fruit Ripeness Classifier Training")
    print("=" * 60)

    # -------------------------------------------------------------------------
    # 1. LOAD DATA
    # -------------------------------------------------------------------------
    print("\n[1] Loading dataset...")
    if args.project:
        image_paths, labels = load_dataset_from_project(project_or_dataset)
        print(f"    Using both folders in: {project_or_dataset}")
    else:
        image_paths, labels = load_dataset(project_or_dataset)
    # Subsample for --fast (max per class)
    if args.fast:
        from collections import defaultdict
        by_label = defaultdict(list)
        for p, lbl in zip(image_paths, labels):
            by_label[lbl].append(p)
        max_per_class = 40
        image_paths = []
        labels = []
        for lbl, paths in by_label.items():
            keep = paths[:max_per_class] if len(paths) > max_per_class else paths
            image_paths.extend(keep)
            labels.extend([lbl] * len(keep))
        image_paths = np.array(image_paths)
        labels = np.array(labels)
        print(f"    Fast mode: using {len(image_paths)} images (max {max_per_class} per class)")

    n_samples = len(image_paths)
    print(f"    Found {n_samples} images")

    # Drop classes with only 1 sample (stratified split needs >= 2 per class)
    from collections import Counter
    counts = Counter(labels)
    valid_labels = {lbl for lbl, c in counts.items() if c >= 2}
    if len(valid_labels) < len(counts):
        mask = np.array([lbl in valid_labels for lbl in labels])
        image_paths = image_paths[mask]
        labels = labels[mask]
        print(f"    Dropped classes with <2 samples: {len(image_paths)} images, {len(valid_labels)} classes")

    le = LabelEncoder()
    y = le.fit_transform(labels)
    n_classes = len(le.classes_)
    print(f"    Classes: {list(le.classes_)}")

    # -------------------------------------------------------------------------
    # 2. EXTRACT FEATURES (MobileNetV2)
    # -------------------------------------------------------------------------
    print("\n[2] Extracting features with MobileNetV2...")
    features = extract_features_mobilenetv2(image_paths, batch_size=BATCH_SIZE)
    X = flatten_features(features)
    print(f"    Feature shape: {X.shape}")

    # Train/test split (same indices for all classifiers and Keras)
    indices = np.arange(len(y))
    i_train, i_test = train_test_split(
        indices, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    X_train, X_test = X[i_train], X[i_test]
    y_train, y_test = y[i_train], y[i_test]

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # -------------------------------------------------------------------------
    # 3. TRAIN & COMPARE: SVM, Random Forest, KNN
    # -------------------------------------------------------------------------
    print("\n[3] Training SVM, Random Forest, KNN...")

    models = {
        "SVM": SVC(kernel="rbf", C=10.0, gamma="scale", random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(
            n_estimators=100, max_depth=20, random_state=RANDOM_STATE
        ),
        "KNN": KNeighborsClassifier(n_neighbors=5, weights="distance"),
    }

    results = []
    for name, clf in models.items():
        clf.fit(X_train_s, y_train)
        y_pred = clf.predict(X_test_s)
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted")
        results.append((name, acc, f1))

    # -------------------------------------------------------------------------
    # 4. EVALUATE: Comparison table
    # -------------------------------------------------------------------------
    print("\n[4] Comparison (Accuracy & F1-Score)")
    print("-" * 50)
    print(f"{'Classifier':<20} {'Accuracy':>12} {'F1-Score':>12}")
    print("-" * 50)
    for name, acc, f1 in results:
        print(f"{name:<20} {acc:>11.4f} {f1:>11.4f}")
    print("-" * 50)

    # -------------------------------------------------------------------------
    # 5. Keras model (for .h5 export) and save best
    # -------------------------------------------------------------------------
    print("\n[5] Training Keras model (MobileNetV2 + Dense) for export...")

    # Load images for Keras using same train/test indices
    X_img_all = np.vstack(
        [load_and_preprocess_image(p) for p in image_paths]
    )
    y_cat = to_categorical(y, num_classes=n_classes)
    X_img_train = X_img_all[i_train]
    X_img_test = X_img_all[i_test]
    y_train_cat = y_cat[i_train]
    y_test_cat = y_cat[i_test]

    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False
    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation="relu")(x)
    x = Dropout(0.4)(x)
    out = Dense(n_classes, activation="softmax")(x)
    keras_model = Model(inputs=base.input, outputs=out)
    keras_model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    keras_model.fit(
        X_img_train,
        y_train_cat,
        validation_data=(X_img_test, y_test_cat),
        epochs=args.epochs,
        batch_size=BATCH_SIZE,
        verbose=1,
    )

    y_pred_keras = np.argmax(keras_model.predict(X_img_test, verbose=0), axis=1)
    y_test_idx = np.argmax(y_test_cat, axis=1)
    keras_acc = accuracy_score(y_test_idx, y_pred_keras)
    keras_f1 = f1_score(y_test_idx, y_pred_keras, average="weighted")

    results.append(("Keras (MobileNetV2+Dense)", keras_acc, keras_f1))

    # Full comparison table including Keras
    print("\n[4] Full comparison (Accuracy & F1-Score)")
    print("-" * 50)
    print(f"{'Classifier':<25} {'Accuracy':>12} {'F1-Score':>12}")
    print("-" * 50)
    for name, acc, f1 in results:
        print(f"{name:<25} {acc:>11.4f} {f1:>11.4f}")
    print("-" * 50)
    best_name = max(results, key=lambda x: (x[1], x[2]))[0]
    print(f"Best overall: {best_name}")

    print("\nClassification report (Keras):")
    print(classification_report(y_test_idx, y_pred_keras, target_names=le.classes_))

    # -------------------------------------------------------------------------
    # 6. SAVE best_fruit_model.h5
    # -------------------------------------------------------------------------
    keras_model.save(model_path, save_format="h5")
    print(f"\n[6] Saved Keras model to: {model_path}")

    # Save label encoder for inference (same order as model output)
    np.save(output_dir / "label_classes.npy", le.classes_)
    print(f"    Saved label classes to: {output_dir / 'label_classes.npy'}")

    print("\nDone. Use best_fruit_model.h5 in ClearScan AI for inference.")


if __name__ == "__main__":
    main()
