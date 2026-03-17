"""
FruitNet Quality Dataset Loader
FruitNetDataset layout: Bad Quality_Fruits / Good Quality_Fruits / Mixed Qualit_Fruits
  each with fruit subfolders: Apple_Bad, Orange_Good, Banana, etc.
Maps: Good -> ripe, Bad -> overripe, Mixed -> semi_ripe. Fruit name -> class id.
"""

import random
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset
from pathlib import Path
from typing import Tuple, List, Dict
import albumentations as A
from albumentations.pytorch import ToTensorV2


# Quality folder name -> ripeness index (unripe=0, semi_ripe=1, ripe=2, overripe=3)
FRUITNET_QUALITY_TO_RIPENESS = {
    "good": 2,   # Good Quality_Fruits -> ripe
    "bad": 3,    # Bad Quality_Fruits -> overripe
    "mixed": 1,  # Mixed Qualit_Fruits -> semi_ripe
}

# Fruit name (from folder) -> HybridFruitNet class id (0-11)
# Config: apple, banana, coffee, peach, date, strawberry, orange, grape, mango, cherry, lemon, avocado
FRUITNET_FRUIT_TO_CLASS = {
    "Apple": 0,
    "Banana": 1,
    "Orange": 6,
    "Lemon": 10,
    "Lime": 10,   # map Lime to Lemon
    "Guava": 8,   # map to mango
    "Pomegranate": 4,  # map to date
}


def _parse_fruit_from_folder(folder_name: str) -> str:
    """e.g. Orange_Good -> Orange, Apple_Bad -> Apple, Banana -> Banana"""
    if "_" in folder_name:
        return folder_name.rsplit("_", 1)[0]
    return folder_name


def _quality_from_parent_dir(parent_name: str) -> int:
    """Parent dir name -> ripeness index."""
    name = parent_name.lower().replace(" ", "_")
    if "good" in name:
        return FRUITNET_QUALITY_TO_RIPENESS["good"]
    if "bad" in name:
        return FRUITNET_QUALITY_TO_RIPENESS["bad"]
    if "mixed" in name or "qualit" in name:  # Mixed Qualit_Fruits
        return FRUITNET_QUALITY_TO_RIPENESS["mixed"]
    return 2  # default ripe


class FruitNetQualityDataset(Dataset):
    """
    Loads FruitNetDataset (Good/Bad/Mixed quality folders with fruit subfolders).
    Returns same format as Fruits360Dataset: image, boxes, labels, n_boxes, ripeness.
    Classification only (no detection boxes).
    """

    def __init__(
        self,
        data_root: str,
        img_size: int = 640,
        split: str = "train",
        use_mosaic: bool = True,
        use_mixup: bool = True,
        mosaic_prob: float = 0.5,
        mixup_prob: float = 0.2,
        max_boxes: int = 120,
        train_ratio: float = 0.85,
    ):
        self.data_root = Path(data_root)
        self.img_size = img_size
        self.split = split
        self.use_mosaic = use_mosaic and split == "train"
        self.use_mixup = use_mixup and split == "train"
        self.mosaic_prob = mosaic_prob
        self.mixup_prob = mixup_prob
        self.max_boxes = max_boxes
        self.train_ratio = train_ratio

        # (path, class_id, ripeness_id)
        self.samples: List[Tuple[str, int, int]] = []
        self._load_samples()

        self.base_tf = A.Compose([
            A.Resize(img_size, img_size),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])
        self.train_tf = A.Compose([
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.2),
            A.RandomBrightnessContrast(p=0.3),
            A.HueSaturationValue(p=0.2),
            A.GaussNoise(p=0.1),
            A.Resize(img_size, img_size),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])

    def _load_samples(self):
        # Expected top-level: "Bad Quality_Fruits", "Good Quality_Fruits", "Mixed Qualit_Fruits"
        quality_dirs = [
            self.data_root / "Bad Quality_Fruits",
            self.data_root / "Good Quality_Fruits",
            self.data_root / "Mixed Qualit_Fruits",
        ]
        all_paths: List[Tuple[str, int, int]] = []

        for qdir in quality_dirs:
            if not qdir.is_dir():
                continue
            ripeness = _quality_from_parent_dir(qdir.name)
            for fruit_dir in qdir.iterdir():
                if not fruit_dir.is_dir():
                    continue
                fruit_name = _parse_fruit_from_folder(fruit_dir.name)
                cid = FRUITNET_FRUIT_TO_CLASS.get(fruit_name, 0)
                for f in fruit_dir.glob("*.jpg"):
                    all_paths.append((str(f), cid, ripeness))
                for f in fruit_dir.glob("*.jpeg"):
                    all_paths.append((str(f), cid, ripeness))
                for f in fruit_dir.glob("*.png"):
                    all_paths.append((str(f), cid, ripeness))

        if not all_paths:
            self.samples = [(str(self.data_root / "placeholder.jpg"), 0, 2)]
            return

        all_paths.sort(key=lambda x: x[0])
        n = len(all_paths)
        n_train = int(n * self.train_ratio)
        if self.split == "train":
            self.samples = all_paths[:n_train]
        else:
            self.samples = all_paths[n_train:]

    def _load_image(self, path: str) -> np.ndarray:
        img = cv2.imread(path)
        if img is None:
            img = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    def _mosaic(self, indices: List[int]) -> Tuple[np.ndarray, np.ndarray, int]:
        s = self.img_size
        half = s // 2
        out_img = np.zeros((s, s, 3), dtype=np.uint8)
        labels_list = []
        ripeness_primary = 2

        for i, idx in enumerate(indices):
            path, cid, rip = self.samples[idx % len(self.samples)]
            img = self._load_image(path)
            img = cv2.resize(img, (half, half))
            if i == 0:
                out_img[:half, :half] = img
            elif i == 1:
                out_img[:half, half:] = img
            elif i == 2:
                out_img[half:, :half] = img
            else:
                out_img[half:, half:] = img
            labels_list.append(cid)
            if i == 0:
                ripeness_primary = rip

        labels_out = np.array(labels_list, dtype=np.int64)
        return out_img, labels_out, ripeness_primary

    def _mixup(self, img1: np.ndarray, img2: np.ndarray, lam: float) -> np.ndarray:
        return (lam * img1 + (1 - lam) * img2).astype(np.uint8)

    def __len__(self) -> int:
        return len(self.samples) if self.samples else 1

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        if self.use_mosaic and random.random() < self.mosaic_prob and len(self.samples) >= 4:
            indices = [idx] + random.sample(range(len(self.samples)), 3)
            indices = [i % len(self.samples) for i in indices]
            img, labels, ripeness = self._mosaic(indices)
            cid = int(labels[0])
        else:
            path, cid, ripeness = self.samples[idx % len(self.samples)]
            img = self._load_image(path)
            labels = np.array([cid], dtype=np.int64)

        if self.use_mixup and random.random() < self.mixup_prob and len(self.samples) > 1:
            idx2 = random.randint(0, len(self.samples) - 1)
            path2, cid2, _ = self.samples[idx2]
            img2 = self._load_image(path2)
            img2 = cv2.resize(img2, (img.shape[1], img.shape[0]))
            lam = random.random() * 0.4 + 0.3
            img = self._mixup(img, img2, lam)
            labels = np.array([cid, cid2], dtype=np.int64)

        tf = self.train_tf if self.split == "train" else self.base_tf
        transformed = tf(image=img)
        img = transformed["image"]
        labels = np.array(labels, dtype=np.int64)

        n = 0
        boxes = np.zeros((self.max_boxes, 4), dtype=np.float32)
        if len(labels) < self.max_boxes:
            labels = np.pad(labels, (0, self.max_boxes - len(labels)), constant_values=-1)
        else:
            labels = labels[:self.max_boxes]

        return {
            "image": img,
            "boxes": torch.from_numpy(boxes).float(),
            "labels": torch.from_numpy(labels).long(),
            "n_boxes": n,
            "ripeness": torch.tensor(ripeness, dtype=torch.long),
        }
