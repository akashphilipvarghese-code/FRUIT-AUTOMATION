"use client";

import { useState, useRef } from "react";
import axios from "axios";
import QualityReport, {
  mapApiToQualityReport,
} from "@/components/QualityReport";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type BatchResult = {
  results: Array<{
    ripeness_meter?: number;
    detections?: Array<{ ripeness_score?: number; confidence?: number }>;
    counts?: Record<string, number>;
  }>;
  total_counts: Record<string, number>;
};

export default function IndustrialistView() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const images = selected.filter((f) => f.type.startsWith("image/"));
    setFiles(images);
    setPreviews(images.map((f) => URL.createObjectURL(f)));
    setResult(null);
    setError(null);
  };

  const handleBatchUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await axios.post(`${API_URL}/analyze/batch`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Batch upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeNew = () => {
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setError(null);
    fileInputRef.current?.click();
  };

  const counts = result?.total_counts || {
    Unripe: 0,
    "Semi-Ripe": 0,
    Ripe: 0,
    "Over-Ripe": 0,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        Industrialist View — Batch Analytics
      </h1>

      {!result ? (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
            >
              Choose Multiple Images
            </button>
            {files.length > 0 && (
              <p className="mt-4 text-slate-600">{files.length} image(s) selected</p>
            )}
          </div>

          <button
            onClick={handleBatchUpload}
            disabled={files.length === 0 || loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? "Analyzing..." : "Analyze Batch"}
          </button>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Batch Summary</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left">
                    Ripeness
                  </th>
                  <th className="border border-slate-300 px-4 py-2 text-right">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Unripe</td>
                  <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                    {counts.Unripe}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2">Semi-Ripe</td>
                  <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                    {counts["Semi-Ripe"]}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Ripe</td>
                  <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                    {counts.Ripe}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2">Over-Ripe</td>
                  <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                    {counts["Over-Ripe"]}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-slate-500 mt-2">
              Total fruits analyzed: {Object.values(counts).reduce((a, b) => a + b, 0)}
            </p>
          </div>

          {/* Grid of Quality Report cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.results.map((r, i) => {
              const reportData = mapApiToQualityReport(r, previews[i] ?? null);
              return (
                <QualityReport
                  key={i}
                  data={reportData}
                  imageUrl={previews[i]}
                  compact
                />
              );
            })}
          </div>

          <button
            onClick={handleGradeNew}
            className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            Grade New Batch
          </button>
        </div>
      )}
    </div>
  );
}
