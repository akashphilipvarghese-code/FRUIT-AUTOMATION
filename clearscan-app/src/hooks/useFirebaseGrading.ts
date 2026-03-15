import { useState, useCallback } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  type UploadResult,
} from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  GeoPoint,
  type DocumentReference,
} from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage, isFirebaseConfigured } from "../lib/firebase";
import type { GradeData } from "../components/GradeResult";
import type { GradingDocument } from "../types/firestore-grading";

export type FirebaseGradingStatus =
  | "idle"
  | "saving"
  | "sync_complete"
  | "upload_failed"
  | "firestore_failed";

export interface UseFirebaseGradingResult {
  /** Whether Firebase is configured and available */
  isConfigured: boolean;
  /** Current sync status */
  status: FirebaseGradingStatus;
  /** Error message when status is upload_failed or firestore_failed */
  error: string | null;
  /** Firestore document ID after successful save */
  docId: string | null;
  /** Save a new grading: upload image to Storage, create Firestore doc */
  saveGrading: (
    data: GradeData,
    imageFile: File | Blob,
    fileName?: string
  ) => Promise<DocumentReference | null>;
  /** Update price in Firestore (debounced by caller) */
  updatePrice: (docId: string, pricePerKg: number) => Promise<void>;
}

function toGeoPoint(loc: { latitude: number; longitude: number }): GeoPoint {
  return new GeoPoint(loc.latitude, loc.longitude);
}

function buildGradingDoc(
  data: GradeData,
  storageImageUrl: string
): Omit<GradingDocument, "createdAt"> {
  const base: Omit<GradingDocument, "createdAt"> = {
    grade: data.grade,
    overallScore: data.overallScore,
    size: data.size,
    color: data.color,
    ripeness: data.ripeness,
    defects: data.defects,
    imageUrl: storageImageUrl,
    fruitType: data.fruitType,
    surfaceDefectPercentage: data.surfaceDefectPercentage,
    area: data.area,
    perimeter: data.perimeter,
    transactionStatus: "pending",
    estimatedPricePerKg: data.estimatedPricePerKg,
    fruitCount: data.fruitCount,
    totalBatchWeight: data.totalBatchWeight,
    totalBatchValue: data.totalBatchValue,
  };
  if (data.location) {
    (base as GradingDocument).location = toGeoPoint(data.location);
  }
  if (data.seller) {
    (base as GradingDocument).seller = {
      name: data.seller.name,
      location: toGeoPoint(data.seller.location),
    };
  }
  if (data.buyer) {
    (base as GradingDocument).buyer = {
      name: data.buyer.name,
      location: toGeoPoint(data.buyer.location),
    };
  }
  return base;
}

export function useFirebaseGrading(): UseFirebaseGradingResult {
  const [status, setStatus] = useState<FirebaseGradingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  const saveGrading = useCallback(
    async (
      data: GradeData,
      imageFile: File | Blob,
      fileName?: string
    ): Promise<DocumentReference | null> => {
      const db = getFirestoreDb();
      const storage = getFirebaseStorage();
      if (!db || !storage) {
        setStatus("idle");
        setError("Firebase not configured");
        return null;
      }

      setStatus("saving");
      setError(null);

      const ts = Date.now();
      const safeName = fileName || "scan";
      const ext = imageFile instanceof File ? (imageFile.name.split(".").pop() || "jpg") : "jpg";
      const storagePath = `fruit_scans/${ts}_${safeName}.${ext}`;

      try {
        // 1. Upload image to Storage
        const storageRef = ref(storage, storagePath);
        const blob = imageFile instanceof File ? imageFile : imageFile;
        const uploadResult: UploadResult = await uploadBytes(storageRef, blob);
        const storageImageUrl = await getDownloadURL(uploadResult.ref);

        // 2. Create Firestore document
        const docData = buildGradingDoc(data, storageImageUrl);
        const docRef = await addDoc(collection(db, "gradings"), {
          ...docData,
          createdAt: serverTimestamp(),
        });

        setDocId(docRef.id);
        setStatus("sync_complete");
        return docRef;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("storage") || msg.includes("upload")) {
          setStatus("upload_failed");
        } else {
          setStatus("firestore_failed");
        }
        setError(msg);
        return null;
      }
    },
    []
  );

  const updatePrice = useCallback(async (id: string, pricePerKg: number) => {
    const db = getFirestoreDb();
    if (!db) return;
    try {
      await updateDoc(doc(db, "gradings", id), {
        estimatedPricePerKg: pricePerKg,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("firestore_failed");
    }
  }, []);

  return {
    isConfigured: configured,
    status,
    error,
    docId,
    saveGrading,
    updatePrice,
  };
}
