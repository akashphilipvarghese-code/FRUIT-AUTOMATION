# FruityVision AI

Fruit Ripeness Detection System using Hybrid YOLOv12 + Vision Transformer (ViT) architecture.

## Architecture

- **Detection**: Mock YOLOv12 — detects fruit bounding boxes
- **Classification**: Mock ViT — classifies ripeness: Unripe, Semi-Ripe, Ripe, Over-Ripe
- **Over-Ripe**: Mock attention map for necrotic spot patterns

## Quick Start — ClearScan AI (no Node/npm)

**One server, one URL:**

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Open **http://localhost:8000** in your browser. You get the ClearScan UI: camera, Capture button, laser scan, then side-by-side comparison (Captured vs Closest match) and ripeness + confidence. No npm or Node required.

**Grading is demo until you train your dataset.** See **[TRAINING.md](TRAINING.md)** for steps: prepare Unripe / Semi-ripe / Ripe folders, run `export_dataset_features.py`, restart backend.

### Optional: Next.js frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the full FruityVision app (Customer, Industrialist, Admin).

### Environment

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Views

| Role | View | Features |
|------|------|----------|
| **Customer** | `/` | Camera/image upload, Ripeness Meter (0–100%) |
| **Industrialist** | `/industrialist` | Batch analytics table (Unripe, Semi-Ripe, Ripe, Over-Ripe counts) |
| **Admin** | `/admin` | User management, model confidence logs |

## API

- `POST /analyze` — Upload image, get ripeness results
- `POST /compare` — **ClearScan AI:** Compare image to fruit_dataset (Unripe, Semi-ripe, Ripe); returns ripeness stage, confidence, top 3 similar images. Uses dataset-backed CompareEngine first when ready, then HybridFruitNet (PyTorch), then demo.
- `POST /analyze/batch` — Batch upload multiple images
- `GET /users` — Admin: list users
- `GET /confidence-logs` — Admin: model confidence logs
- `GET /scan-history` — Scan history

### Compare API contract and local smoke checks

Engine selection is lazy and cached for the process lifetime: dataset-backed CompareEngine (if the feature archive exists and the engine is ready), then HybridFruitNet, then the random demo engine. Restart the backend after adding model assets.

With the backend running, these requests exercise the explicit validation branches without needing model weights:

```bash
curl -s -X POST http://localhost:8000/compare
curl -s -F 'file=@README.md;type=text/plain' http://localhost:8000/compare
curl -s -F 'file=@/dev/null;filename=empty.png;type=image/png' http://localhost:8000/compare
```

Run the second command from the repository root. The third command assumes a Unix-like shell. Expected responses are HTTP 200 with `ripeness_stage: "Unknown"`, zero confidence, an empty similarity list, and respectively `error: "No image uploaded"`, `"File must be an image"`, or `"Empty image"`. Check the JSON error field, not only the HTTP status. The demo engine explicitly sets `demo_mode: true`; validation errors set it to false, which does not imply successful real inference. These checks do not validate model accuracy.

## HybridFruitNet integration

When [HybridFruitNet](https://github.com/your-org/HybridFruitNet) is installed as a sibling of FruityVisionAI (e.g. both under `Desktop/`), the backend can use it for `POST /compare` ripeness inference when the dataset-backed CompareEngine is unavailable. Place HybridFruitNet at `../HybridFruitNet` relative to FruityVisionAI, or set `HYBRID_FRUIT_NET_PATH` to its directory. Ensure `weights/best.pt` exists in HybridFruitNet for inference. The backend falls back to demo if neither real engine is available.

## Training a Ripeness Classifier (ClearScan)

To train your own **Unripe / Semi-ripe / Ripe** classifier with MobileNetV2 + SVM/RF/KNN and export a Keras model for the ClearScan landing page:

1. **Dataset layout:** Put images in a folder with three subfolders:
   ```
   dataset/
   ├── Unripe/    # images
   ├── Semi-ripe/ # images
   └── Ripe/      # images
   ```

2. **Install training deps:**  
   `pip install -r requirements-train.txt`

3. **Run training:**  
   `python train_ripeness_classifier.py [dataset_dir] [--output models] [--epochs 15]`

4. **Output:**  
   - Comparison table: Accuracy and F1-Score for SVM, Random Forest, KNN, and the Keras model  
   - **`models/best_fruit_model.h5`** — Keras model (MobileNetV2 + Dense) for inference  
   - **`models/label_classes.npy`** — Class names for decoding predictions  

Use `best_fruit_model.h5` and `label_classes.npy` in your ClearScan AI backend or frontend for ripeness inference.

## ClearScan AI — Fruit Quality Comparison (Full-Stack)

**Ready out of the box:** If neither dataset-backed comparison nor HybridFruitNet is available, the backend uses a lightweight demo engine. It returns a randomly selected ripeness label and synthetic confidence, not an image-derived prediction. Add a dataset and export features for real comparison.

1. **Run backend:**  
   `cd backend && pip install -r requirements.txt && python main.py`  
   Then `POST /compare` accepts an image and returns `ripeness_stage`, `confidence`, and `top_3_similar`.

2. **Run ClearScan Next.js app:**  
   ```bash
   cd clearscan-next
   npm install
   npm run dev
   ```
   Open http://localhost:3000. Use **Capture** (orange); after the laser animation you get **Captured vs Closest match** and ripeness + confidence. Theme: black and `#FF8C00`; Lucide icons (Scan, History, Admin).

3. **Optional — real comparison:** Export dataset features once (folder with `Unripe/`, `Semi-ripe/`, `Ripe/`):
   ```bash
   pip install -r requirements-train.txt
   python export_dataset_features.py /path/to/fruit_dataset
   ```
   Restart the backend; `/compare` will use your dataset and return top-3 similar images.

## Project Structure

```
FruityVisionAI/
├── backend/          # FastAPI
│   ├── main.py       # /analyze, /compare
│   ├── compare_engine.py  # MobileNetV2 + cosine similarity vs dataset
│   ├── data/         # compare_features.npz (from export_dataset_features.py)
│   ├── database.py
│   └── requirements.txt
├── clearscan-next/   # ClearScan AI — Next.js camera + compare UI (black/orange)
├── frontend/         # Next.js + Tailwind (Customer, Industrialist, Admin)
├── models/
├── export_dataset_features.py  # Precompute features from fruit_dataset for /compare
├── train_ripeness_classifier.py
└── requirements-train.txt
```

## Engineering verification and limitations

This is a research and demonstration prototype, **not a validated production grading system**.

- The YOLOv12 and ViT components described above are currently **mock implementations** in the documented architecture. Do not interpret their outputs as trained-model accuracy.
- The `/compare` endpoint can use HybridFruitNet when its weights are configured, dataset-derived features when available, or a **demo fallback**. Results from the demo path are not scientific predictions.
- To run dataset-backed comparisons, follow the feature export and model setup instructions above.
- For reproducible evaluation, record the dataset source, class balance, train/validation/test split, random seed, per-class precision/recall/F1, confusion matrix, and representative failure cases. These results have **not yet been established in this README**.
- Do not upload personal images, private client data, or licensed model weights without permission.

## Development roadmap

1. Separate mock/demo and real-inference responses with an explicit machine-readable mode field.
2. Add repeatable unit and API tests for inference selection and invalid image uploads.
3. Create a held-out dataset evaluation script and publish measured results with methodology.
4. Verify CI and deployment configuration before making production-readiness claims.
