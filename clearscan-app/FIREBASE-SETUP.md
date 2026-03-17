# Firebase Setup for ClearScan AI

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Firestore Database** and **Storage**

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

Get your config from Firebase Console → Project Settings → General → Your apps.

## 3. Firestore rules (gradings collection)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gradings/{docId} {
      allow read, write: if request.auth != null;
      // Or for demo: allow read, write: if true;
    }
  }
}
```

## 4. Storage rules (fruit_scans)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /fruit_scans/{allPaths=**} {
      allow read, write: if request.auth != null;
      // Or for demo: allow read, write: if true;
    }
  }
}
```

## 5. Offline persistence

Firestore IndexedDB persistence is enabled automatically in `src/lib/firebase.ts`. Scans in low-connectivity farm areas are cached locally and synced when online.

## Data structure

- **Storage**: `fruit_scans/{timestamp}_{fileName}.{ext}`
- **Firestore** `gradings` collection:
  - `grade`, `overallScore`, `size`, `color`, `ripeness`, `defects`
  - `imageUrl` (Storage URL)
  - `createdAt` (serverTimestamp)
  - `transactionStatus`: `'pending' | 'sold'`
  - `location`: GeoPoint (for proximity queries)
  - `seller`, `buyer`: `{ name, location: GeoPoint }`
  - `estimatedPricePerKg` (debounced sync from UI)
