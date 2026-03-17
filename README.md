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
- `POST /compare` — **ClearScan AI:** Compare image to fruit_dataset (Unripe, Semi-ripe, Ripe); returns ripeness stage, confidence, top 3 similar images. Uses **HybridFruitNet** (PyTorch) when available, else MobileNetV2 + dataset or demo.
- `POST /analyze/batch` — Batch upload multiple images
- `GET /users` — Admin: list users
- `GET /confidence-logs` — Admin: model confidence logs
- `GET /scan-history` — Scan history

## HybridFruitNet integration

When [HybridFruitNet](https://github.com/your-org/HybridFruitNet) is installed as a sibling of FruityVisionAI (e.g. both under `Desktop/`), the backend uses it for `POST /compare` ripeness inference. Place HybridFruitNet at `../HybridFruitNet` relative to FruityVisionAI, or set `HYBRID_FRUIT_NET_PATH` to its directory. Ensure `weights/best.pt` exists in HybridFruitNet for inference. Backend falls back to CompareEngine (dataset) or demo if HybridFruitNet is unavailable.

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

**Ready out of the box:** If `backend/data/compare_features.npz` is missing, the backend runs in **demo mode** (MobileNetV2 still loads; compare returns image-based mock ripeness so the app works immediately). Add a dataset and export features for real comparison.

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

## Push to GitHub

The repo is already initialized with an initial commit. To add it to GitHub:

1. **Create a new repository** on [github.com](https://github.com/new):
   - Name it (e.g. `FruityVisionAI` or `clearscan-ai`).
   - Do **not** add a README, .gitignore, or license (they already exist).

2. **Add the remote and push:**
   ```bash
   cd /path/to/FruityVisionAI
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

3. If you use SSH:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
