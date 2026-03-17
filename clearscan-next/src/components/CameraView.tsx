"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Scan } from "lucide-react";

type Props = { onCapture: (blob: Blob) => void };

export function CameraView({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setRequesting(true);
    setStarted(true);
    try {
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera not available in this browser/context");
      }
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (err: any) {
      const name = err?.name as string | undefined;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError("Camera permission blocked. Click the lock icon in the address bar and allow Camera.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setError("No camera found (or it’s busy). Try another device or close other apps using the camera.");
      } else {
        setError(err?.message || "Camera access failed");
      }
      setReady(false);
    } finally {
      setRequesting(false);
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !ready || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.92
    );
  }, [ready, onCapture]);

  const onPickFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const blob = file.slice(0, file.size, file.type || "image/jpeg");
      onCapture(blob);
    },
    [onCapture]
  );

  if (error) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
        <p className="text-gray-400 mb-4">{error}</p>
        <div className="space-y-3">
          <button
            onClick={startCamera}
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-200 hover:border-[#FF8C00] hover:text-[#FF8C00] transition-colors"
          >
            Try again
          </button>
          <label className="block w-full py-3 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-semibold cursor-pointer">
            Upload image instead
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-xs text-gray-500">
            Tip: use <span className="text-gray-400">http://localhost:3000</span> (not 0.0.0.0) for camera access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] max-h-[70vh] rounded-xl overflow-hidden border-2 border-gray-800 bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {(!started || !ready) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center space-y-3 px-6">
              <p className="text-gray-400">
                {!started ? "Click to enable your camera." : requesting ? "Requesting camera permission…" : "Starting camera…"}
              </p>
              {!ready && (
                <button
                  onClick={startCamera}
                  disabled={requesting}
                  className="px-4 py-2 rounded-lg bg-[#FF8C00] hover:bg-[#FF8C00]/90 disabled:opacity-50 text-black font-semibold"
                >
                  {requesting ? "Enabling…" : "Enable camera"}
                </button>
              )}
              <label className="block text-sm text-gray-300 underline underline-offset-4 cursor-pointer">
                Upload an image instead
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={capture}
        disabled={!ready}
        className="w-full py-4 rounded-xl bg-[#FF8C00] hover:bg-[#FF8C00]/90 disabled:opacity-50 text-black font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#FF8C00]/30 transition-all"
      >
        <Scan className="w-6 h-6" />
        Capture
      </button>
    </div>
  );
}
