import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const LOG_LINES = [
  "Initializing sensors...",
  "Extracting Color Features...",
  "Analyzing Texture...",
  "Computing Geometric Data...",
  "Running quality classifier...",
  "Generating report...",
];

interface ScanningAnimationProps {
  imageUrl: string;
}

export function ScanningAnimation({ imageUrl }: ScanningAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const durationMs = 2500;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(p);
      setLogIndex(Math.min(LOG_LINES.length - 1, Math.floor((p / 100) * LOG_LINES.length)));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
        <img src={imageUrl} alt="Scanning" className="w-full h-full min-h-[280px] object-contain" />
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-0 right-0 h-1 bg-[#FF8C00] rounded-full shadow-[0_0_20px_8px_rgba(255,140,0,0.6)] transition-all duration-150"
            style={{ top: `${progress}%` }}
          />
        </div>
      </div>
      <div className="w-full lg:w-96 flex flex-col rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="text-gray-500 text-sm ml-2 font-mono">scan.log</span>
        </div>
        <div className="flex-1 p-4 font-mono text-sm text-[#FF8C00] min-h-[200px]">
          {LOG_LINES.slice(0, logIndex + 1).map((line, i) => (
            <div key={i} className="mb-1">
              <span className="text-gray-500">&gt;&gt;</span> {line}
            </div>
          ))}
          {progress < 100 && <span className="inline-block w-2 h-4 bg-[#FF8C00] animate-pulse" />}
        </div>
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#FF8C00] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-gray-400 text-xs mt-2 font-mono">Progress: {Math.round(progress)}%</p>
        </div>
      </div>
      {progress < 100 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#FF8C00] font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </div>
      )}
    </div>
  );
}
