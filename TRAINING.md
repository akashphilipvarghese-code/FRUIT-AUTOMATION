# ClearScan AI – Enable Real Grading (Train Your Dataset)

**Why grading wasn’t working:** The backend had **no dataset** and **no `compare_features.npz`**, so it ran in demo mode (random ripeness). The backend needs a folder with **Unripe**, **Semi-ripe**, **Ripe** subfolders and a one-time export to create `backend/data/compare_features.npz`.

A **sample dataset** is included (`fruit_dataset/` with one image per class). Features have been exported to `backend/data/compare_features.npz`. **Restart the backend** so grading uses this dataset. For better results, replace the sample images with real fruit photos.

## 0. (Optional) Use the sample dataset

From the project root:

```bash
python create_sample_dataset.py   # creates fruit_dataset/Unripe, Semi-ripe, Ripe with one image each
python export_dataset_features.py fruit_dataset
```

Then restart the backend. Grading will use the sample dataset (replace with real images for better results).

## 1. Prepare your own dataset

Create a folder with **three subfolders** named exactly:

- `Unripe` – images of unripe fruit  
- `Semi-ripe` – images of semi-ripe fruit  
- `Ripe` – images of ripe fruit  

Example layout:

```
fruit_dataset/
├── Unripe/
│   ├── img1.jpg
│   └── ...
├── Semi-ripe/
│   ├── img1.jpg
│   └── ...
└── Ripe/
    ├── img1.jpg
    └── ...
```

Use JPG, PNG, or similar. More images per class = better grading.

## 2. Install training dependencies

From the **FruityVisionAI** folder:

```bash
cd /Users/sid/Desktop/FruityVisionAI
pip install -r requirements-train.txt
```

(This installs TensorFlow and scikit-learn if needed.)

## 3. Export features for ClearScan

Run once, pointing at your dataset folder:

```bash
cd /Users/sid/Desktop/FruityVisionAI
python export_dataset_features.py /path/to/your/fruit_dataset
```

Example if your folder is on the Desktop:

```bash
python export_dataset_features.py ~/Desktop/fruit_dataset
```

This creates `backend/data/compare_features.npz`.

## 4. Restart the backend

Stop the running backend (Ctrl+C in the terminal where `python main.py` is running), then start it again:

```bash
cd backend
python main.py
```

## 5. Use the app

Open **http://localhost:8000**, log in, and scan or upload an image. You should now get:

- **Ripeness stage** from your dataset (Unripe / Semi-ripe / Ripe)  
- **Confidence** from similarity to your images  
- **Closest match** – a similar image from your dataset  

If you still see “Demo mode” or “Data not trained”, check that `backend/data/compare_features.npz` exists and that you restarted the backend after exporting.
