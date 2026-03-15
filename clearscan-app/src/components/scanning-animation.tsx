import { useEffect, useState } from "react";
import { ScanLine, Database, MapPin, Zap, Check } from "lucide-react";

type ScanStatus = "idle" | "scanning" | "completed";

const STAGES = [
  { id: "analyze", label: "Analyzing image...", icon: ScanLine },
  { id: "metrics", label: "Processing metrics...", icon: Database },
  { id: "location", label: "Capturing location...", icon: MapPin },
  { id: "report", label: "Generating report...", icon: Zap },
] as const;

interface ScanningAnimationProps {
  imageUrl: string;
}

export function ScanningAnimation({ imageUrl }: ScanningAnimationProps) {
  const [status, setStatus] = useState<ScanStatus>("scanning");
  const [progress, setProgress] = useState(0);
  const [completedStage, setCompletedStage] = useState(-1);
  const [staggerVisible, setStaggerVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStaggerVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setStatus("scanning");
    setProgress(0);
    setCompletedStage(-1);
    const durationMs = 2500;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(98, (elapsed / durationMs) * 98);
      setProgress(p);
      if (p >= 72) setCompletedStage(3);
      else if (p >= 48) setCompletedStage(2);
      else if (p >= 24) setCompletedStage(1);
      else if (p >= 6) setCompletedStage(0);
    }, 80);
    return () => clearInterval(interval);
  }, [imageUrl]);

  return (
    <div
      className="min-h-[70vh] bg-[#050505] text-white font-sans flex flex-col overflow-hidden relative"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
      {/* Orange corner brackets framing scan area */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 sm:p-8">
        <div className="relative w-full max-w-2xl aspect-[4/3] rounded-lg border-2 border-[#f97316] shadow-[0_0_30px_rgba(249,115,22,0.3)]">
          <img
            src={imageUrl}
            alt="Scanning"
            className="absolute inset-0 w-full h-full object-contain rounded-lg bg-black/50"
          />
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-l-2 border-t-2 border-[#f97316]" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-r-2 border-t-2 border-[#f97316]" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-2 border-b-2 border-[#f97316]" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-2 border-b-2 border-[#f97316]" />
        </div>
      </div>

      {/* Top: Scanning Progress bar */}
      <div className="relative z-10 px-4 pt-6 sm:px-6">
        <p className="text-sm font-medium text-white/90 mb-2">Scanning Progress</p>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden max-w-2xl">
          <div
            className="h-full bg-[#f97316] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/60 mt-1">{Math.round(progress)}%</p>
      </div>

      {/* 4-Stage status cards - staggered below the frame */}
      <div className="relative z-10 flex-1 px-4 py-6 sm:px-6 flex flex-col justify-center max-w-md mx-auto w-full space-y-3">
        {STAGES.map((stage, index) => {
          const isCompleted = completedStage >= index;
          const isActive = completedStage === index && status === "scanning" && index === 3;
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              className={`
                flex items-center gap-4 p-4 rounded-xl border-2 bg-black/40 backdrop-blur-sm
                transition-all duration-500 ease-out
                ${staggerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                ${isCompleted && !isActive ? "border-[#22c55e]" : isActive ? "border-[#f97316]" : "border-white/10"}
              `}
              style={{ transitionDelay: staggerVisible ? `${index * 120}ms` : "0ms" }}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isCompleted && !isActive ? "bg-[#22c55e]/20 text-[#22c55e]" : isActive ? "bg-[#f97316]/20 text-[#f97316]" : "bg-white/5 text-white/50"
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className="flex-1 font-medium text-white">{stage.label}</span>
              {isActive && (
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f97316] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#f97316] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[#f97316] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer: AI Neural Network Active pill */}
      <div className="relative z-10 pb-8 flex justify-center">
        <span
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-amber-200 bg-black/50 border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          AI Neural Network Active
        </span>
      </div>
    </div>
  );
}
