"""
FruityVision AI - FastAPI Backend
/analyze endpoint for image uploads
"""

import sys
import os
from pathlib import Path

# Add models to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import json

from database import init_db, get_db, ScanHistory, ModelConfidenceLog, User
from models.ripeness_engine import RipenessEngine

# Compare engine: use demo-only by default so server never crashes (no TensorFlow load).
# When backend/data/compare_features.npz exists, we try to load the real engine on first /compare.
_compare_engine = None
_compare_engine_tried = False

def _make_demo_engine():
    import random
    class _DemoEngine:
        def compare(self, _bytes):
            return {
                "ripeness_stage": random.choice(["Unripe", "Semi-ripe", "Ripe"]),
                "confidence": round(0.7 + random.random() * 0.2, 4),
                "top_3_similar": [],
                "error": None,
                "demo_mode": True,
            }
    return _DemoEngine()

def get_compare_engine():
    global _compare_engine, _compare_engine_tried
    if _compare_engine is not None:
        return _compare_engine
    if not _compare_engine_tried:
        _compare_engine_tried = True
        # 1) Try existing CompareEngine (MobileNetV2 + dataset)
        npz_path = Path(__file__).resolve().parent / "data" / "compare_features.npz"
        if npz_path.is_file():
            try:
                from compare_engine import CompareEngine
                eng = CompareEngine()
                if eng.is_ready:
                    _compare_engine = eng
                    return _compare_engine
            except Exception:
                pass
        # 2) Try HybridFruitNet (PyTorch detection + ripeness) if available
        try:
            from hybrid_compare_engine import get_hybrid_compare
            hybrid_compare = get_hybrid_compare()
            if hybrid_compare is not None:
                _compare_engine = _HybridFruitNetAdapter(hybrid_compare)
                return _compare_engine
        except Exception:
            pass
    _compare_engine = _make_demo_engine()
    return _compare_engine


class _HybridFruitNetAdapter:
    """Wraps HybridFruitNet compare(image_bytes) -> dict for get_compare_engine()."""
    def __init__(self, compare_fn):
        self._compare = compare_fn

    def compare(self, image_bytes: bytes) -> dict:
        return self._compare(image_bytes)

app = FastAPI(title="FruityVision AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine and DB
engine = RipenessEngine()
init_db()


class AnalyzeResponse(BaseModel):
    detections: List[dict]
    ripeness_meter: float
    counts: dict
    fruit_counts: Optional[dict] = None
    inference_time_ms: float
    scan_id: Optional[int] = None


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_image(file: UploadFile = File(...)):
    """Accept image upload, run YOLO + ViT pipeline, return ripeness results."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    result = engine.analyze(contents)
    
    # Store in DB (optional - for demo we skip user_id)
    db = next(get_db())
    try:
        scan = ScanHistory(
            scan_type="single",
            results=json.dumps(result)
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        
        # Log model confidence
        conf_log = result.get("model_confidence_log", {})
        for model_name, data in conf_log.items():
            log = ModelConfidenceLog(
                scan_id=scan.id,
                model_name=model_name,
                confidence=data.get("confidence", 0),
                inference_time_ms=data.get("time_ms")
            )
            db.add(log)
        db.commit()
        
        return AnalyzeResponse(
            detections=result["detections"],
            ripeness_meter=result["ripeness_meter"],
            counts=result["counts"],
            inference_time_ms=result["inference_time_ms"],
            scan_id=scan.id
        )
    finally:
        db.close()


@app.post("/analyze/batch")
async def analyze_batch(files: List[UploadFile] = File(..., description="Multiple image files")):
    """Batch analysis for Industrialist view."""
    results = []
    total_counts = {"Unripe": 0, "Semi-Ripe": 0, "Ripe": 0, "Over-Ripe": 0}
    
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            continue
        contents = await file.read()
        result = engine.analyze(contents)
        results.append(result)
        for k, v in result["counts"].items():
            total_counts[k] = total_counts.get(k, 0) + v
    
    return {"results": results, "total_counts": total_counts}


@app.get("/users")
async def list_users():
    """Admin: list users."""
    db = next(get_db())
    try:
        users = db.query(User).all()
        return [{"id": u.id, "email": u.email, "name": u.name, "role": u.role} for u in users]
    finally:
        db.close()


@app.get("/confidence-logs")
async def get_confidence_logs(limit: int = 50):
    """Admin: model confidence logs."""
    db = next(get_db())
    try:
        logs = db.query(ModelConfidenceLog).order_by(ModelConfidenceLog.created_at.desc()).limit(limit).all()
        return [{"id": l.id, "model": l.model_name, "confidence": l.confidence, "time_ms": l.inference_time_ms} for l in logs]
    finally:
        db.close()


@app.get("/scan-history")
async def get_scan_history(limit: int = 20):
    """Scan history for dashboard."""
    db = next(get_db())
    try:
        scans = db.query(ScanHistory).order_by(ScanHistory.created_at.desc()).limit(limit).all()
        return [{"id": s.id, "scan_type": s.scan_type, "created_at": str(s.created_at)} for s in scans]
    finally:
        db.close()


@app.post("/compare")
async def compare_image(file: Optional[UploadFile] = File(None)):
    """
    ClearScan AI: compare uploaded image to fruit_dataset (Unripe, Semi-ripe, Ripe).
    Returns ripeness_stage, confidence, and top 3 similar images from dataset.
    Always returns 200 with JSON so the frontend never sees "Failed to fetch" from server errors.
    """
    try:
        if file is None:
            return {
                "ripeness_stage": "Unknown",
                "confidence": 0,
                "top_3_similar": [],
                "error": "No image uploaded",
                "demo_mode": False,
            }
        if not file.content_type or not file.content_type.startswith("image/"):
            return {
                "ripeness_stage": "Unknown",
                "confidence": 0,
                "top_3_similar": [],
                "error": "File must be an image",
                "demo_mode": False,
            }
        contents = await file.read()
        if not contents:
            return {
                "ripeness_stage": "Unknown",
                "confidence": 0,
                "top_3_similar": [],
                "error": "Empty image",
                "demo_mode": False,
            }
        engine = get_compare_engine()
        result = engine.compare(contents)
        return result
    except Exception as e:
        return {
            "ripeness_stage": "Unknown",
            "confidence": 0,
            "top_3_similar": [],
            "error": "Server error: " + str(e),
            "demo_mode": False,
        }


@app.get("/health")
async def health():
    return {"status": "ok"}


# Serve frontend at / : prefer built clearscan-app (React with new GradeResult), else standalone HTML
_BACKEND_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_DIR.parent
_CLEARSCAN_APP_DIST = _PROJECT_ROOT / "clearscan-app" / "dist"
_CLEARSCAN_HTML = _PROJECT_ROOT / "clearscan_standalone.html"
_STANDALONE_HTML = _PROJECT_ROOT / "frontend_standalone.html"
_GRADE_DEMO_HTML = _PROJECT_ROOT / "grade_result_demo.html"


@app.get("/demo", response_class=HTMLResponse)
async def serve_grade_demo():
    """Serve the new industrial grade dashboard demo (no npm build required)."""
    if _GRADE_DEMO_HTML.is_file():
        r = FileResponse(_GRADE_DEMO_HTML)
        r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        return r
    return HTMLResponse("<h1>Demo not found</h1><p>grade_result_demo.html missing.</p>", status_code=404)


if _CLEARSCAN_APP_DIST.is_dir() and (_CLEARSCAN_APP_DIST / "index.html").is_file():
    # Serve built React app (clearscan-app) so new GradeResult UI is shown at localhost:8000
    app.mount("/", StaticFiles(directory=str(_CLEARSCAN_APP_DIST), html=True), name="spa")
else:
    @app.get("/", response_class=HTMLResponse)
    async def serve_frontend():
        """Fallback: standalone HTML when clearscan-app has not been built."""
        if _CLEARSCAN_HTML.is_file():
            r = FileResponse(_CLEARSCAN_HTML)
            r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            r.headers["Pragma"] = "no-cache"
            return r
        if _STANDALONE_HTML.is_file():
            return FileResponse(_STANDALONE_HTML)
        return HTMLResponse(
            "<h1>FruityVision AI</h1><p>Backend running. Build the React app to see the new UI: <code>cd clearscan-app && npm run build</code></p>"
        )


if __name__ == "__main__":
    import uvicorn
    import socket
    port = 8000
    for p in [8000, 8001, 8002]:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(("0.0.0.0", p))
            sock.close()
            port = p
            break
        except OSError:
            continue
    print("ClearScan AI: http://localhost:%s" % port)
    uvicorn.run(app, host="0.0.0.0", port=port)
