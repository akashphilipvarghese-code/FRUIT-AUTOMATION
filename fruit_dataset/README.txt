Sample dataset for ClearScan AI.
Replace sample.jpg in each folder with real fruit images (Unripe, Semi-ripe, Ripe).

For best results, use 10+ images per folder so all three stages (Unripe, Semi-ripe, Ripe) are detected well.

If you have the **FruitNetDataset** in `~/Downloads/FruitNetDataset`, you can import it into this folder:

1) Import (symlinks by default; use `--copy` to copy files):
   `python import_fruitnet_into_fruit_dataset.py --fruitnet ~/Downloads/FruitNetDataset --out fruit_dataset`

2) Export features:
   `python export_dataset_features.py fruit_dataset`

3) Restart the backend.

Then run: python export_dataset_features.py fruit_dataset
Then restart the backend.
