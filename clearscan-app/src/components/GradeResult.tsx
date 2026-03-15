import {
  Award,
  Ruler,
  Palette,
  Droplet,
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Scan,
  Users,
  Download,
  Check,
  Cloud,
} from "lucide-react";
import type { FruitType, Location, TraceabilityParty } from "../types/fruit-types";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFirebaseGrading } from "../hooks/useFirebaseGrading";
import { useDebounce } from "../hooks/useDebounce";

export interface IndividualGrade {
  grade: "A" | "B" | "C" | "D";
  overallScore: number;
  size: number;
  color: number;
  ripeness: number;
  defects: number;
}

export interface GradeData {
  grade: "A" | "B" | "C" | "D";
  overallScore: number;
  size: number;
  color: number;
  ripeness: number;
  defects: number;
  imageUrl: string;
  timestamp: Date;
  fruitType: FruitType;
  surfaceDefectPercentage: number;
  area: number;
  perimeter: number;
  location?: Location;
  estimatedPricePerKg?: number;
  /** Seller (origin) for transaction traceability */
  seller?: TraceabilityParty;
  /** Buyer (target) for transaction traceability */
  buyer?: TraceabilityParty;
  fruitCount?: number;
  batchGrades?: IndividualGrade[];
  totalBatchWeight?: number;
  totalBatchValue?: number;
}

interface GradeResultProps {
  data: GradeData;
  /** Original image file for new scans - triggers Firebase upload */
  imageFile?: File;
  onAnalyzeNewSample?: () => void;
  onFindBuyers?: () => void;
  onExport?: () => void;
}

const gradeColors = {
  A: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500" },
  B: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500" },
  C: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500" },
  D: { bg: "bg-red-500", text: "text-red-500", border: "border-red-500" },
};

const progressBarColors = [
  { icon: Ruler, label: "Size", valueKey: "size" as const, barColor: "bg-blue-500" },
  { icon: Palette, label: "Color", valueKey: "color" as const, barColor: "bg-purple-500" },
  { icon: Droplet, label: "Ripeness", valueKey: "ripeness" as const, barColor: "bg-emerald-500" },
  { icon: Award, label: "Quality", valueKey: "defects" as const, barColor: "bg-amber-500" },
];

function formatGps(loc: Location): string {
  const lat = loc.latitude >= 0 ? `${loc.latitude.toFixed(4)}° N` : `${Math.abs(loc.latitude).toFixed(4)}° S`;
  const lon = loc.longitude >= 0 ? `${loc.longitude.toFixed(4)}° E` : `${Math.abs(loc.longitude).toFixed(4)}° W`;
  return `${lat}, ${lon}`;
}

const defaultSeller: TraceabilityParty = {
  name: "Origin Farm",
  location: { latitude: 8.5241, longitude: 76.9366 },
};
const defaultBuyer: TraceabilityParty = {
  name: "Target Buyer",
  location: { latitude: 8.4833, longitude: 76.9167 },
};

/** AlertCircle theme for Firebase errors - matches Surface Defects styling */
const FIREBASE_ERROR_STYLE =
  "rounded-xl border border-red-500/50 bg-red-500/10 p-4 sm:p-5 flex items-center gap-2";

export function GradeResult({
  data,
  imageFile,
  onAnalyzeNewSample,
  onFindBuyers,
  onExport,
}: GradeResultProps) {
  const initialPrice =
    data.estimatedPricePerKg?.toString() ?? "";
  const [userPrice, setUserPrice] = useState<string>(initialPrice);
  const gradeStyle = gradeColors[data.grade];
  const savedOnce = useRef(false);

  const {
    isConfigured,
    status,
    error,
    docId,
    saveGrading,
    updatePrice,
  } = useFirebaseGrading();

  const debouncedPrice = useDebounce(userPrice, 600);

  // Sync price to Firestore when docId exists and user has entered a valid price
  useEffect(() => {
    if (!docId || !isConfigured) return;
    const num = parseFloat(debouncedPrice);
    if (!Number.isNaN(num) && num >= 0) {
      updatePrice(docId, num);
    }
  }, [docId, debouncedPrice, isConfigured, updatePrice]);

  // Save to Firebase on mount when we have a new scan with image file
  useEffect(() => {
    if (!imageFile || !isConfigured || savedOnce.current) return;
    savedOnce.current = true;
    const fileName = imageFile.name.replace(/\.[^/.]+$/, "") || "scan";
    saveGrading(data, imageFile, fileName);
  }, [imageFile, data, isConfigured, saveGrading]);

  const getSuggestedPriceRange = () => {
    const ranges = {
      A: { min: 4.0, max: 5.5 },
      B: { min: 3.0, max: 4.5 },
      C: { min: 2.0, max: 3.5 },
      D: { min: 1.0, max: 2.5 },
    };
    return ranges[data.grade];
  };
  const suggestedRange = getSuggestedPriceRange();
  const seller = data.seller ?? defaultSeller;
  const buyer = data.buyer ?? defaultBuyer;

  const showSavingOverlay = isConfigured && imageFile && status === "saving";
  const syncComplete = status === "sync_complete";
  const hasFirebaseError = status === "upload_failed" || status === "firestore_failed";

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      {/* Saving to Cloud overlay - Framer Motion pulse */}
      <AnimatePresence>
        {showSavingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-4 rounded-2xl border border-amber-500/30 bg-[#0a0a0a] px-8 py-6 shadow-[0_0_40px_rgba(249,115,22,0.2)]"
            >
              <Cloud className="w-12 h-12 text-amber-500" />
              <p className="text-lg font-semibold text-white">Saving to Cloud...</p>
              <p className="text-sm text-gray-400">Offline persistence enabled</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Firebase error - AlertCircle theme (matches Surface Defects) */}
        {hasFirebaseError && error && (
          <section className={FIREBASE_ERROR_STYLE}>
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-500">
                {status === "upload_failed" ? "Upload failed" : "Sync failed"}
              </p>
              <p className="text-xs text-red-400/90 mt-0.5">{error}</p>
            </div>
          </section>
        )}

        {/* Grade header + image row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="aspect-square sm:aspect-video lg:aspect-[4/3] relative bg-[#0a0a0a]">
              <img
                src={data.imageUrl}
                alt="Analyzed fruit"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${gradeStyle.bg} text-black`}
                >
                  Grade {data.grade}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Overall Score</p>
            <p className={`text-4xl sm:text-5xl font-bold ${gradeStyle.text}`}>
              {data.overallScore}
              <span className="text-2xl font-normal text-gray-500">/100</span>
            </p>
            <p className="text-gray-400 capitalize mt-2">{data.fruitType}</p>
            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${gradeStyle.bg} transition-all duration-700`}
                style={{ width: `${data.overallScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Four-stage progress: Size, Color, Ripeness, Quality */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Analysis Progress
          </h3>
          <div className="space-y-4">
            {progressBarColors.map(({ icon: Icon, label, valueKey, barColor }) => (
              <div key={valueKey} className="flex items-center gap-3 sm:gap-4">
                <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-white tabular-nums">
                      {data[valueKey]}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#0a0a0a] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-700`}
                      style={{ width: `${data[valueKey]}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics grid: 2x2 — Surface Defects, Area, Perimeter, Analyzed */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Surface Defects</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {data.surfaceDefectPercentage}%
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Area</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {data.area} cm²
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Perimeter</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {data.perimeter} cm
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Analyzed</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white tabular-nums">
              {data.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </section>

        {/* Transaction Traceability: Seller (Origin) + Buyer (Target) */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Transaction Traceability
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Seller (Origin)
              </p>
              <p className="font-semibold text-white mb-2">{seller.name}</p>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {formatGps(seller.location)}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Buyer (Target)
              </p>
              <p className="font-semibold text-white mb-2">{buyer.name}</p>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {formatGps(buyer.location)}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing: Suggested Range + Input + Actions */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Valuation
            </h3>
          </div>

          {/* Suggested Range gradient bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Suggested Range (Grade {data.grade})</span>
              <span className="text-green-500 font-medium">
                ${suggestedRange.min.toFixed(2)} – ${suggestedRange.max.toFixed(2)}/kg
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden bg-[#0a0a0a]">
              <div
                className="h-full w-full rounded-full bg-gradient-to-r from-yellow-500 via-green-500 to-emerald-500"
                aria-hidden
              />
            </div>
          </div>

          {/* Large bold price input - debounced sync to Firestore */}
          <div className="mb-6">
            <label className="block text-sm text-gray-500 mb-2">
              Set Your Price per kg
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={userPrice}
                onChange={(e) => setUserPrice(e.target.value)}
                placeholder={data.estimatedPricePerKg?.toFixed(2) ?? suggestedRange.min.toFixed(2)}
                className="w-full pl-10 pr-14 py-4 sm:py-5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-xl sm:text-2xl font-bold placeholder:text-gray-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                /kg
              </span>
            </div>
          </div>

          {/* Button group: Analyze New Sample (orange), Find Buyers (green border), Export (square) with Sync Complete checkmark */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAnalyzeNewSample}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm sm:text-base transition-colors"
            >
              <Scan className="w-4 h-4" />
              Analyze New Sample
            </button>
            <button
              type="button"
              onClick={onFindBuyers}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-green-500 text-green-500 hover:bg-green-500/10 font-semibold text-sm sm:text-base transition-colors"
            >
              <Users className="w-4 h-4" />
              Find Buyers
            </button>
            <button
              type="button"
              onClick={onExport}
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors ${
                syncComplete
                  ? "border-green-500 bg-green-500/20 text-green-500"
                  : "border-gray-500/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5"
              }`}
              title={syncComplete ? "Sync Complete" : "Export"}
              aria-label={syncComplete ? "Sync Complete" : "Export"}
            >
              {syncComplete ? (
                <Check className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
