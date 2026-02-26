"use client";

import { useCallback } from "react";
import { Upload, Camera } from "lucide-react";
import type { FruitType } from "@/types/fruit-types";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFruitType: FruitType;
  onFruitTypeChange: (fruit: FruitType) => void;
  onCameraScan: () => void;
}

const FRUIT_OPTIONS: FruitType[] = [
  "apple",
  "mango",
  "orange",
  "banana",
  "strawberry",
  "grape",
  "auto",
];

export function UploadZone({
  onFileSelect,
  selectedFruitType,
  onFruitTypeChange,
  onCameraScan,
}: UploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2 font-medium">
          Fruit type
        </label>
        <select
          value={selectedFruitType}
          onChange={(e) => onFruitTypeChange(e.target.value as FruitType)}
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent outline-none"
        >
          {FRUIT_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f === "auto" ? "Auto Detect" : f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-[#FF8C00] rounded-xl p-12 text-center bg-gray-900/50 transition-colors hover:bg-[#FF8C00]/5"
      >
        <Upload className="w-12 h-12 text-[#FF8C00] mx-auto mb-4" />
        <p className="text-white font-medium mb-1">Drop image here</p>
        <p className="text-gray-500 text-sm mb-6">or click to browse</p>
        <label className="inline-block bg-[#FF8C00] text-black font-medium px-6 py-3 rounded-lg cursor-pointer hover:bg-[#FF8C00]/90 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
          Upload Image
        </label>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCameraScan}
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#FF8C00] text-[#FF8C00] font-medium rounded-lg hover:bg-[#FF8C00]/10 transition-colors"
        >
          <Camera className="w-5 h-5" />
          Camera Scan
        </button>
      </div>
    </div>
  );
}
