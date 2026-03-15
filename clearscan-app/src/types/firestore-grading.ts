import type { GradeData } from "../components/grade-result";
import type { GeoPoint, Timestamp } from "firebase/firestore";

/** Firestore document for gradings collection */
export interface GradingDocument {
  grade: GradeData["grade"];
  overallScore: number;
  size: number;
  color: number;
  ripeness: number;
  defects: number;
  imageUrl: string; // Storage URL after upload
  fruitType: GradeData["fruitType"];
  surfaceDefectPercentage: number;
  area: number;
  perimeter: number;
  transactionStatus: "pending" | "sold";
  createdAt: Timestamp;
  /** GPS as GeoPoint for proximity queries */
  location?: GeoPoint;
  /** Serialized seller for traceability */
  seller?: {
    name: string;
    location: GeoPoint;
  };
  /** Serialized buyer for traceability */
  buyer?: {
    name: string;
    location: GeoPoint;
  };
  /** User-set price per kg, synced in real-time */
  estimatedPricePerKg?: number;
  fruitCount?: number;
  totalBatchWeight?: number;
  totalBatchValue?: number;
}
