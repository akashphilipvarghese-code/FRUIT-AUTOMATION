"""
HybridFruitNet datasets — categorized by source.
- fruits360: Kaggle Fruits360, YOLO format, folder-per-class
- fruitnet_quality: FruitNetDataset (Good/Bad/Mixed quality by fruit)
"""

from .fruits360 import Fruits360Dataset, get_fruits360_classes, FRUITS360_TO_OUR, RIPENESS_MAP
from .fruitnet_quality import FruitNetQualityDataset, FRUITNET_QUALITY_TO_RIPENESS, FRUITNET_FRUIT_TO_CLASS

__all__ = [
    "Fruits360Dataset",
    "FruitNetQualityDataset",
    "get_fruits360_classes",
    "FRUITS360_TO_OUR",
    "RIPENESS_MAP",
    "FRUITNET_QUALITY_TO_RIPENESS",
    "FRUITNET_FRUIT_TO_CLASS",
]
