"""
Fruits360 Dataset Loader with Mosaic & MixUp Augmentation
Supports: Kaggle Fruits360, custom YOLO-format, classification folders
"""

import random
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset
from pathlib import Path
from typing import Optional, Tuple, List, Dict
import albumentations as A
from albumentations.pytorch import ToTensorV2


# Fruits360 class mapping (subset for our 12 fruits)
FRUITS360_TO_OUR = {
    "Apple": 0, "Banana": 1, "Coffee": 2, "Peach": 3, "Dates": 4, "Strawberry": 5,
    "Orange": 6, "Grape": 7, "Mango": 8, "Cherry": 9, "Lemon": 10, "Avocado": 11,
    # Aliases
    "Apple Braeburn": 0, "Apple Golden": 0, "Apple Granny Smith": 0, "Apple Red": 0,
    "Banana Red": 1, "Banana": 1,
    "Peach": 3, "Peach 2": 3,
    "Strawberry": 5, "Strawberry 2": 5,
    "Orange": 6,
    "Grape White": 7, "Grape White 2": 7, "Grape": 7,
    "Mango": 8, "Mango 2": 8,
    "Cherry": 9, "Cherry 2": 9,
    "Lemon": 10, "Lemon 2": 10,
    "Avocado": 11,
    "Avocado Ripe": 11,
}
RIPENESS_MAP = {"unripe": 0, "semi_ripe": 1, "ripe": 2, "overripe": 3}


def get_fruits360_classes(data_root: Path) -> Dict[str, int]:
    """Build class map from Fruits360 folder structure"""
    train_path = data_root / "Training"
    if not train_path.exists():
        train_path = data_root / "train"
    if not train_path.exists():
        return FRUITS360_TO_OUR
    classes = {}
    for i, name in enumerate(sorted(train_path.iterdir())):
        if name.is_dir():
            base = name.name.split()[0] if " " in name.name else name.name
            classes[name.name] = FRUITS360_TO_OUR.get(base, min(i, 11))
    return classes


class Fruits360Dataset(Dataset):
    """
    Fruits360 loader with Mosaic & MixUp
    Supports both classification (folder per class) and detection (YOLO format)
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
        is_detection: bool = False,
        max_boxes: int = 120
    ):
        self.data_root = Path(data_root)
        self.img_size = img_size
        self.split = split
        self.use_mosaic = use_mosaic and split == "train"
        self.use_mixup = use_mixup and split == "train"
        self.mosaic_prob = mosaic_prob
        self.mixup_prob = mixup_prob
        self.is_detection = is_detection
        self.max_boxes = max_boxes

        self.samples: List[Tuple[str, int, Optional[np.ndarray]]] = []
        self.class_map = get_fruits360_classes(self.data_root)
        self._load_samples()

        bbox_params = A.BboxParams(format='yolo', label_fields=['labels']) if is_detection else None
        self.base_tf = A.Compose([
            A.Resize(img_size, img_size),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ], bbox_params=bbox_params)

        self.train_tf = A.Compose([
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.2),
            A.RandomBrightnessContrast(p=0.3),
            A.HueSaturationValue(p=0.2),
            A.GaussNoise(p=0.1),
            A.Resize(img_size, img_size),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ], bbox_params=bbox_params)

    def _load_samples(self):
        train_path = self.data_root / "Training" if (self.data_root / "Training").exists() else self.data_root / "train"
        test_path = self.data_root / "Test" if (self.data_root / "Test").exists() else self.data_root / "test"
        base = test_path if self.split == "val" or self.split == "test" else train_path

        if not base.exists():
            self.samples = [(str(self.data_root / "placeholder.jpg"), 0, None)]
            return

        for cls_dir in base.iterdir():
            if not cls_dir.is_dir():
                continue
            cls_name = cls_dir.name
            cid = self.class_map.get(cls_name, 0)
            if isinstance(cid, str):
                cid = 0
            for f in cls_dir.glob("*.jpg"):
                self.samples.append((str(f), cid, None))
            for f in cls_dir.glob("*.png"):
                self.samples.append((str(f), cid, None))

        if self.is_detection:
            img_dir = self.data_root / "images" / self.split
            lbl_dir = self.data_root / "labels" / self.split
            if img_dir.exists() and lbl_dir.exists():
                self.samples = []
                for f in img_dir.glob("*"):
                    if f.suffix.lower() in ('.jpg', '.jpeg', '.png'):
                        lbl = lbl_dir / (f.stem + ".txt")
                        if lbl.exists():
                            boxes = self._load_yolo_labels(lbl)
                            self.samples.append((str(f), -1, boxes))

    def _load_yolo_labels(self, path: Path) -> np.ndarray:
        boxes = []
        with open(path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 5:
                    c, x, y, w, h = int(parts[0]), *map(float, parts[1:5])
                    boxes.append([c, x, y, w, h])
        return np.array(boxes, dtype=np.float32) if boxes else np.zeros((0, 5))

    def _load_image(self, path: str) -> Tuple[np.ndarray, Optional[np.ndarray], int]:
        img = cv2.imread(path)
        if img is None:
            img = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        boxes = None
        cid = 0
        for p, c, b in self.samples:
            if p == path:
                cid = c
                boxes = b
                break
        return img, boxes, cid

    def _mosaic(self, indices: List[int]) -> Tuple[np.ndarray, np.ndarray, Optional[np.ndarray]]:
        s = self.img_size
        half = s // 2
        out_img = np.zeros((s, s, 3), dtype=np.uint8)
        all_boxes = []
        all_labels = []

        for i, idx in enumerate(indices):
            path, cid, boxes = self.samples[idx % len(self.samples)]
            img, _, _ = self._load_image(path)
            img = cv2.resize(img, (half, half))
            if i == 0:
                out_img[:half, :half] = img
            elif i == 1:
                out_img[:half, half:] = img
            elif i == 2:
                out_img[half:, :half] = img
            else:
                out_img[half:, half:] = img
            if boxes is not None and len(boxes) > 0:
                for b in boxes:
                    c, x, y, w, h = b
                    if i == 0:
                        x, y = x * 0.5, y * 0.5
                    elif i == 1:
                        x, y = 0.5 + x * 0.5, y * 0.5
                    elif i == 2:
                        x, y = x * 0.5, 0.5 + y * 0.5
                    else:
                        x, y = 0.5 + x * 0.5, 0.5 + y * 0.5
                    w, h = w * 0.5, h * 0.5
                    all_boxes.append([x, y, w, h])
                    all_labels.append(int(c))
            elif not self.is_detection:
                all_labels.append(int(cid) if isinstance(cid, int) else 0)

        if all_boxes:
            boxes_out = np.array(all_boxes, dtype=np.float32)
            labels_out = np.array(all_labels, dtype=np.int64)
        else:
            boxes_out = np.zeros((0, 4))
            labels_out = np.array(all_labels, dtype=np.int64) if all_labels else np.array([0], dtype=np.int64)

        return out_img, labels_out, boxes_out if len(boxes_out) > 0 else None

    def _mixup(self, img1: np.ndarray, img2: np.ndarray, lam: float) -> np.ndarray:
        return (lam * img1 + (1 - lam) * img2).astype(np.uint8)

    def __len__(self) -> int:
        return len(self.samples) if self.samples else 1

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        if self.use_mosaic and random.random() < self.mosaic_prob and len(self.samples) >= 4:
            indices = [idx] + random.sample(range(len(self.samples)), 3)
            indices = [i % len(self.samples) for i in indices]
            img, labels, boxes = self._mosaic(indices)
            cid = labels[0] if len(labels) > 0 else 0
        else:
            path, cid, boxes = self.samples[idx % len(self.samples)]
            img, _, _ = self._load_image(path)
            labels = np.array([cid], dtype=np.int64)
            if boxes is not None and len(boxes) > 0:
                boxes = boxes[:, 1:5]
            else:
                boxes = None

        if self.use_mixup and random.random() < self.mixup_prob and len(self.samples) > 1:
            idx2 = random.randint(0, len(self.samples) - 1)
            path2, cid2, _ = self.samples[idx2]
            img2, _, _ = self._load_image(path2)
            img2 = cv2.resize(img2, (img.shape[1], img.shape[0]))
            lam = random.random() * 0.4 + 0.3
            img = self._mixup(img, img2, lam)
            labels = np.array([cid, cid2], dtype=np.int64)

        tf = self.train_tf if self.split == "train" else self.base_tf
        if self.is_detection and boxes is not None and len(boxes) > 0:
            labels_yolo = labels
            transformed = tf(image=img, bboxes=boxes, labels=labels_yolo)
            img = transformed["image"]
            boxes = np.array(transformed["bboxes"]) if transformed["bboxes"] else np.zeros((0, 4))
            labels = np.array(transformed["labels"], dtype=np.int64)
        else:
            transformed = tf(image=img)
            img = transformed["image"]
            boxes = np.zeros((0, 4))
            labels = np.array(labels, dtype=np.int64)

        n = len(boxes)
        if n < self.max_boxes:
            boxes = np.pad(boxes, ((0, self.max_boxes - n), (0, 0)), constant_values=0)
            labels = np.pad(labels, (0, self.max_boxes - n), constant_values=-1)
        else:
            boxes = boxes[:self.max_boxes]
            labels = labels[:self.max_boxes]

        return {
            "image": img,
            "boxes": torch.from_numpy(boxes).float(),
            "labels": torch.from_numpy(labels).long(),
            "n_boxes": min(n, self.max_boxes),
            "ripeness": torch.tensor(2, dtype=torch.long)
        }
