"use client";

import { Scan } from "lucide-react";
import type { CompareResponse } from "@/app/page";

type Props = {
  capturedImageUrl: string;
  result: CompareResponse;
  onNewScan: () => void;
};

export function CompareResult({ capturedImageUrl, result, onNewScan }: Props) {
  const closest = result.top_3_similar[0];
  const closestImageUrl = closest?.image_base64
    ? `data:image/jpeg;base64,${closest.image_base64}`
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900/50">
          <p className="text-center text-xs text-gray-500 py-2 border-b border-gray-800">
            Captured
          </p>
          <img
            src={capturedImageUrl}
            alt="Your capture"
            className="w-full aspect-square object-cover"
          />
        </div>
        <div className="rounded-xl overflow-hidden border border-[#FF8C00]/50 bg-gray-900/50">
          <p className="text-center text-xs text-[#FF8C00] py-2 border-b border-gray-800">
            Closest match
          </p>
          {closestImageUrl ? (
            <img
              src={closestImageUrl}
              alt={closest?.label ?? "Match"}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square flex flex-col items-center justify-center text-gray-500 text-sm gap-1 bg-gray-900/80">
              <span>No dataset match</span>
              {result.demo_mode && (
                <span className="text-xs text-[#FF8C00]/80">Demo mode — add fruit_dataset for real comparison</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-2">
        <p className="text-gray-500 text-sm">Ripeness stage</p>
        <p className="text-[#FF8C00] font-semibold text-lg">{result.ripeness_stage}</p>
        <p className="text-gray-500 text-sm">Confidence</p>
        <p className="text-white font-medium">
          {(result.confidence * 100).toFixed(1)}%
        </p>
        {result.error && (
          <p className="text-amber-400 text-sm">{result.error}</p>
        )}
      </div>

      {result.top_3_similar.length > 1 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-gray-500 text-sm mb-2">Top 3 similar</p>
          <div className="flex gap-2">
            {result.top_3_similar.map((item, i) => (
              <div key={i} className="flex-1 text-center">
                {item.image_base64 ? (
                  <img
                    src={`data:image/jpeg;base64,${item.image_base64}`}
                    alt={item.label}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-800"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg border border-gray-800 bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                    —
                  </div>
                )}
                <p className="text-[#FF8C00] text-xs mt-1">{item.label}</p>
                <p className="text-gray-500 text-xs">{(item.similarity * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNewScan}
        className="w-full py-4 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#FF8C00]/30"
      >
        <Scan className="w-5 h-5" />
        Analyze New Sample
      </button>
    </div>
  );
}
