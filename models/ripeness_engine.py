"""
FruityVision AI - Ripeness Detection Engine
Hybrid YOLOv12 (detection) + ViT (classification)
Simulates 2026 stack with mock models
"""

import io
import time
import numpy as np
from PIL import Image
from typing import List, Tuple, Optional
from dataclasses import dataclass

# PyTorch for mock inference
try:
    import torch
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


class MockYOLOv12:
    """Mock YOLOv12 detector - simulates fruit bounding box detection"""
    
    def __init__(self, conf_threshold: float = 0.5):
        self.conf_threshold = conf_threshold
    
    def detect(self, image: Image.Image) -> List[Tuple[int, int, int, int, float]]:
        """
        Returns list of (x1, y1, x2, y2, confidence) for each detected fruit.
        Mock: simulates 1-3 detections based on image size.
        """
        w, h = image.size
        # Simulate detection - place 1-2 boxes in the center region
        boxes = []
        n_detections = min(3, max(1, (w * h) // (200 * 200)))
        
        for i in range(n_detections):
            center_x = w * (0.3 + 0.4 * i / max(1, n_detections - 1))
            center_y = h * 0.5
            box_w = w * 0.25
            box_h = h * 0.4
            x1 = int(max(0, center_x - box_w / 2))
            y1 = int(max(0, center_y - box_h / 2))
            x2 = int(min(w, center_x + box_w / 2))
            y2 = int(min(h, center_y + box_h / 2))
            conf = 0.85 + np.random.uniform(0, 0.12)
            boxes.append((x1, y1, x2, y2, float(conf)))
        
        return boxes


class MockViTForRipeness:
    """Mock ViT for image classification - simulates ripeness state"""
    
    RIPENESS_STATES = ["Unripe", "Semi-Ripe", "Ripe", "Over-Ripe"]
    
    def __init__(self):
        pass
    
    def classify(self, image: Image.Image) -> Tuple[str, float, List[float]]:
        """
        Returns (ripeness_state, confidence, class_probs)
        Mock: uses color histogram to simulate ripeness (darker = more ripe)
        """
        img = np.array(image)
        if len(img.shape) == 2:
            img = np.stack([img] * 3, axis=-1)
        mean_brightness = np.mean(img)
        mean_saturation = np.std(img[..., :3])
        
        # Simulate: darker + more variance = more ripe
        if mean_brightness < 80:
            state_idx = 3  # Over-Ripe
        elif mean_brightness < 120:
            state_idx = 2  # Ripe
        elif mean_brightness < 160:
            state_idx = 1  # Semi-Ripe
        else:
            state_idx = 0  # Unripe
        
        # Add slight randomness
        state_idx = min(3, max(0, state_idx + np.random.randint(-1, 2)))
        
        probs = np.random.dirichlet([1, 1, 1, 1])
        probs[state_idx] += 0.5
        probs = probs / probs.sum()
        conf = float(probs[state_idx])
        state = self.RIPENESS_STATES[state_idx]
        
        return state, conf, probs.tolist()


class MockNecroticAttentionMap:
    """Simulates attention map for necrotic spot patterns in Over-Ripe fruits"""
    
    def generate(self, image: Image.Image) -> List[dict]:
        """
        Returns list of {"x": int, "y": int, "intensity": float} for hot spots.
        Mock: simulates 2-5 necrotic regions.
        """
        w, h = image.size
        spots = []
        n_spots = np.random.randint(2, 6)
        
        for _ in range(n_spots):
            x = int(np.random.uniform(0.2 * w, 0.8 * w))
            y = int(np.random.uniform(0.2 * h, 0.8 * h))
            intensity = float(np.random.uniform(0.6, 0.95))
            spots.append({"x": x, "y": y, "intensity": intensity})
        
        return spots


@dataclass
class FruitDetection:
    bbox: Tuple[int, int, int, int]
    ripeness: str
    confidence: float
    ripeness_score: float  # 0-100
    necrotic_spots: Optional[List[dict]] = None


class RipenessEngine:
    """
    Main engine: YOLO detect -> crop -> ViT classify
    Over-Ripe: add mock necrotic spot attention map
    """
    
    def __init__(self):
        self.yolo = MockYOLOv12()
        self.vit = MockViTForRipeness()
        self.necrotic = MockNecroticAttentionMap()
    
    def analyze(self, image_bytes: bytes) -> dict:
        """
        Full pipeline: detect fruits, classify ripeness, check over-ripe for necrotic spots.
        Returns dict with detections, ripeness meter (0-100), and batch counts.
        """
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        t0 = time.perf_counter()
        
        # Step 1: YOLO detection
        boxes = self.yolo.detect(image)
        yolo_time = (time.perf_counter() - t0) * 1000
        
        detections = []
        ripeness_scores = []
        
        for x1, y1, x2, y2, det_conf in boxes:
            crop = image.crop((x1, y1, x2, y2))
            
            # Step 2: ViT ripeness classification
            t1 = time.perf_counter()
            ripeness_state, vit_conf, probs = self.vit.classify(crop)
            vit_time = (time.perf_counter() - t1) * 1000
            
            # Ripeness score 0-100 (Unripe=0, Over-Ripe=100)
            state_to_score = {"Unripe": 15, "Semi-Ripe": 40, "Ripe": 70, "Over-Ripe": 95}
            ripeness_score = state_to_score.get(ripeness_state, 50)
            ripeness_scores.append(ripeness_score)
            
            # Step 3: Over-Ripe -> necrotic spot check
            necrotic_spots = None
            if ripeness_state == "Over-Ripe":
                necrotic_spots = self.necrotic.generate(crop)
            
            detections.append({
                "bbox": [x1, y1, x2, y2],
                "ripeness": ripeness_state,
                "confidence": round(det_conf, 3),
                "ripeness_score": ripeness_score,
                "ripeness_confidence": round(vit_conf, 3),
                "necrotic_spots": necrotic_spots,
            })
        
        # Overall ripeness meter (average of detections, or 50 if none)
        ripeness_meter = round(sum(ripeness_scores) / len(ripeness_scores), 1) if ripeness_scores else 50.0
        
        # Batch counts for Industrialist view
        counts = {"Unripe": 0, "Semi-Ripe": 0, "Ripe": 0, "Over-Ripe": 0}
        for d in detections:
            counts[d["ripeness"]] = counts.get(d["ripeness"], 0) + 1
        
        total_time = (time.perf_counter() - t0) * 1000
        
        avg_det_conf = sum(d["confidence"] for d in detections) / len(detections) if detections else 0
        avg_vit_conf = sum(d["ripeness_confidence"] for d in detections) / len(detections) if detections else 0
        
        return {
            "detections": detections,
            "ripeness_meter": ripeness_meter,
            "counts": counts,
            "inference_time_ms": round(total_time, 2),
            "model_confidence_log": {
                "yolo": {"confidence": avg_det_conf, "time_ms": yolo_time},
                "vit": {"confidence": avg_vit_conf, "time_ms": vit_time},
            }
        }
