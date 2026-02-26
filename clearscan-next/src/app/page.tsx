"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Scan, History, Shield, Settings } from "lucide-react";
import { CameraView } from "@/components/CameraView";
import { ScanningLaser } from "@/components/ScanningLaser";
import { CompareResult } from "@/components/CompareResult";

export type CompareResponse = {
  ripeness_stage: string;
  confidence: number;
  top_3_similar: Array<{
    path: string;
    label: string;
    similarity: number;
    image_base64?: string;
  }>;
  error?: string;
  demo_mode?: boolean;
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{ url: string; result: CompareResponse }>>([]);

  useEffect(() => setMounted(true), []);

  const handleCapture = useCallback(async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setCapturedUrl(url);
    setCompareResult(null);
    setIsScanning(true);
  }, []);

  // After laser animation, call /compare and show result
  useEffect(() => {
    if (!isScanning || !capturedUrl) return;
    const timer = setTimeout(async () => {
      try {
        const formData = new FormData();
        const res = await fetch(capturedUrl);
        const blob = await res.blob();
        formData.append("file", blob, "capture.jpg");
        const apiRes = await fetch("/api/compare", {
          method: "POST",
          body: formData,
        });
        const data: CompareResponse = await apiRes.json();
        setCompareResult(data);
        setHistory((prev) => [{ url: capturedUrl, result: data }, ...prev]);
      } catch (e) {
        setCompareResult({
          ripeness_stage: "Unknown",
          confidence: 0,
          top_3_similar: [],
          error: "Comparison failed. Is the backend running?",
        });
      }
      setIsScanning(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, [isScanning, capturedUrl]);

  const handleReset = useCallback(() => {
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setCompareResult(null);
    setIsScanning(false);
  }, [capturedUrl]);

  const showCamera = !capturedUrl && !isScanning && !compareResult;
  const showLaser = capturedUrl && isScanning;

  return (
    <div
      className="min-h-screen bg-black relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(26, 26, 26, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(26, 26, 26, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight text-white">
            ClearScan <span className="text-[#FF8C00]">AI</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-[#FF8C00] hover:border-[#FF8C00] transition-colors"
              title="History"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-[#FF8C00] hover:border-[#FF8C00] transition-colors"
              title="Admin"
            >
              <Shield className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-[#FF8C00] hover:border-[#FF8C00] transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {!mounted ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading…</p>
            </div>
          </div>
        ) : showHistory ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-[#FF8C00] text-sm flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-[#FF8C00] font-medium">Scan History</h2>
            {history.length === 0 ? (
              <p className="text-gray-500 text-sm">No scans yet.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 p-3 rounded-lg border border-gray-800 bg-gray-900/50"
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-white font-medium">{item.result.ripeness_stage}</p>
                      <p className="text-gray-500 text-sm">
                        {(item.result.confidence * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : showLaser ? (
          <ScanningLaser imageUrl={capturedUrl!} />
        ) : compareResult ? (
          <CompareResult
            capturedImageUrl={capturedUrl!}
            result={compareResult}
            onNewScan={handleReset}
          />
        ) : showCamera ? (
          <CameraView onCapture={handleCapture} />
        ) : null}
      </main>

      <footer className="border-t border-gray-800 mt-auto py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between text-xs text-gray-500">
          <span>© 2026 ClearScan AI</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Online
          </span>
        </div>
      </footer>
    </div>
  );
}
