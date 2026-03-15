/**
 * Firebase configuration for ClearScan AI
 * Set VITE_FIREBASE_* in .env for your project
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  enableIndexedDbPersistence,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirestoreDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!db) {
    db = getFirestore(firebaseApp);
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Firestore persistence: multiple tabs open");
      } else if (err.code === "unimplemented") {
        console.warn("Firestore persistence: not supported");
      }
    });
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!storage) {
    storage = getStorage(firebaseApp);
  }
  return storage;
}

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}
