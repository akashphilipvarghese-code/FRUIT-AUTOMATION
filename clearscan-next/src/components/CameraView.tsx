"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Scan } from "lucide-react";

type Props = { onCapture: (blob: Blob) => void };

export function CameraView({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator?.mediaDevices) {
      setError("Camera not available in this context");
      return;
    }
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "environment", // back camera on phone
      },
      audio: false,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch((err) => {
        setError(err.message || "Camera access denied");
      });
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
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

  if (error) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
        <p className="text-gray-400 mb-4">{error}</p>
        <p className="text-sm text-gray-500">Use a device with a camera and allow access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] max-h-[70vh] rounded-xl overflow-hidden border-2 border-gray-800 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <span className="text-gray-500">Starting camera…</span>
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
