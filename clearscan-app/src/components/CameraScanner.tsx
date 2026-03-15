import { useRef } from "react";

type Props = {
  onCapture?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  className?: string;
};

/**
 * Camera-based scanner for live fruit capture.
 * Placeholder – implement with getUserMedia / canvas capture as needed.
 */
export function CameraScanner({ onCapture: _onCapture, onError, className = "" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStart = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      onError?.(new Error("Camera not supported"));
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => onError?.(err));
  };

  return (
    <div className={className}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black" />
      <button
        type="button"
        onClick={handleStart}
        className="mt-2 px-4 py-2 rounded-lg bg-[#FF8C00] text-black font-medium"
      >
        Start camera
      </button>
    </div>
  );
}
