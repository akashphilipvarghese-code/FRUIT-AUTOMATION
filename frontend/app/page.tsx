"use client";

import { useState, useRef } from "react";
import axios from "axios";
import QualityReport, {
  mapApiToQualityReport,
} from "@/components/QualityReport";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CustomerView() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{
    ripeness_meter: number;
    detections: Array<{
      bbox: number[];
      ripeness: string;
      confidence: number;
      ripeness_score: number;
    }>;
    counts?: Record<string, number>;
    inference_time_ms: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeNew = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    fileInputRef.current?.click();
  };

  const qualityData =
    result && preview
      ? mapApiToQualityReport(result, preview)
      : null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        Customer View — Quality Assessment
      </h1>

      {!result ? (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
            >
              Choose Image
            </button>
            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? "Analyzing..." : "Analyze Ripeness"}
          </button>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      ) : (
        <QualityReport
          data={qualityData ?? undefined}
          imageUrl={preview}
          onGradeNew={handleGradeNew}
        />
      )}
    </div>
  );
}
