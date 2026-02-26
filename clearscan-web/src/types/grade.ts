import type { FruitType } from "./fruit-types";

export interface GradeData {
  id?: string;
  grade: "A" | "B" | "C" | "D";
  overallScore: number;
  size: number;
  color: number;
  ripeness: number;
  defects: number;
  imageUrl: string;
  timestamp: Date;
  fruitType: FruitType;
  surfaceDefectPercentage: number;
  area: number;
  perimeter: number;
}
