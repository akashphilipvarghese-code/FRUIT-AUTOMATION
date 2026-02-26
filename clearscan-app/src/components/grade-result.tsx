import { useMemo } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { FruitType } from "../types/fruit-types";

export interface GradeData {
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

const FRUIT_LABELS: Record<FruitType, string> = {
  apple: "Apple", mango: "Mango", orange: "Orange", banana: "Banana",
  strawberry: "Strawberry", grape: "Grape", auto: "Auto",
};

interface GradeResultProps {
  data: GradeData;
}

export function GradeResult({ data }: GradeResultProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDash = useMemo(() => (data.overallScore / 100) * circumference, [data.overallScore, circumference]);
  const pass = data.grade === "A" || data.grade === "B";

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
          <img src={data.imageUrl} alt="Graded fruit" className="w-full aspect-square object-contain" />
          <div className="absolute inset-4 border-2 border-[#FF8C00] rounded-lg pointer-events-none" />
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#FF8C00]/90 text-black text-sm font-medium rounded">
            {FRUIT_LABELS[data.fruitType]}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#FF8C00" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${strokeDash} ${circumference}`} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{data.overallScore}</span>
              <span className="text-gray-500 text-sm">Quality Score</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            {pass ? <CheckCircle className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
            <span className={`text-xl font-bold ${pass ? "text-green-500" : "text-red-500"}`}>Grade {data.grade}</span>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-[#FF8C00] font-medium mb-2">Size</h3>
          <p className="text-white font-mono text-lg">{data.size}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-[#FF8C00] font-medium mb-2">Color</h3>
          <p className="text-white font-mono text-lg">{data.color}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-[#FF8C00] font-medium mb-2">Ripeness</h3>
          <p className="text-white font-mono text-lg">{data.ripeness}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-[#FF8C00] font-medium mb-2">Defects</h3>
          <p className="text-white font-mono text-lg">{data.defects}%</p>
        </div>
      </div>
    </div>
  );
}
