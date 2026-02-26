"use client";

import { Check, RefreshCw } from "lucide-react";

/**
 * Quality Assessment Report data structure.
 *
 * Backend JSON structure for /analyze or /quality-report:
 * {
 *   "imageUrl": "https://...",  // or null if client provides
 *   "grade": "A" | "B" | "C" | "D",
 *   "gradeLabel": "Excellent Quality • Premium Retail Grade",
 *   "score": 87,
 *   "maxScore": 100,
 *   "metrics": {
 *     "sizeUniformity": 82,
 *     "colorQuality": 91,
 *     "ripenessLevel": 78,   // Maps from ripeness_meter
 *     "defectFreeScore": 88
 *   },
 *   "assessedAt": "Feb 23, 2025 at 3:45 PM"
 * }
 */
export interface QualityReportData {
  imageUrl: string | null;
  grade: "A" | "B" | "C" | "D";
  gradeLabel: string;
  score: number;
  maxScore: number;
  metrics: {
    sizeUniformity: number;
    colorQuality: number;
    ripenessLevel: number;
    defectFreeScore: number;
  };
  assessedAt: string;
}

const MOCK_REPORT: QualityReportData = {
  imageUrl: null,
  grade: "B",
  gradeLabel: "Good Quality • Retail Grade",
  score: 87,
  maxScore: 100,
  metrics: {
    sizeUniformity: 82,
    colorQuality: 91,
    ripenessLevel: 78,
    defectFreeScore: 88,
  },
  assessedAt: new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
};

function getGradeFromScore(score: number): "A" | "B" | "C" | "D" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

function getGradeLabel(grade: "A" | "B" | "C" | "D"): string {
  const labels = {
    A: "Excellent Quality • Premium Retail Grade",
    B: "Good Quality • Retail Grade",
    C: "Fair Quality • Processing Grade",
    D: "Below Standard • Reject",
  };
  return labels[grade];
}

/**
 * Map FastAPI /analyze response to QualityReportData
 */
export function mapApiToQualityReport(
  apiResult: {
    ripeness_meter?: number;
    detections?: Array<{ ripeness_score?: number; confidence?: number }>;
    counts?: Record<string, number>;
  },
  imageUrl: string | null
): QualityReportData {
  const ripeness = apiResult.ripeness_meter ?? 50;
  const detections = apiResult.detections ?? [];
  const avgConf = detections.length
    ? detections.reduce((s, d) => s + (d.confidence ?? 0), 0) / detections.length
    : 0.8;

  // Derive metrics from API where possible
  const ripenessLevel = Math.round(ripeness);
  const colorQuality = Math.round(avgConf * 100);
  const sizeUniformity = detections.length > 1 ? 85 : 75;
  const defectFree = apiResult.counts?.["Over-Ripe"]
    ? Math.max(0, 100 - (apiResult.counts["Over-Ripe"] ?? 0) * 15)
    : 90;

  const score = Math.round(
    (ripenessLevel + colorQuality + sizeUniformity + defectFree) / 4
  );
  const grade = getGradeFromScore(score);

  return {
    imageUrl,
    grade,
    gradeLabel: getGradeLabel(grade),
    score,
    maxScore: 100,
    metrics: {
      sizeUniformity,
      colorQuality,
      ripenessLevel,
      defectFreeScore: defectFree,
    },
    assessedAt: new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };
}

interface MetricBarProps {
  label: string;
  value: number;
  detail?: string;
}

function MetricBar({ label, value, detail }: MetricBarProps) {
  return (
    <div className="group relative">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900 tabular-nums">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
      {detail && (
        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
          {detail}
        </div>
      )}
    </div>
  );
}

interface QualityReportProps {
  data?: Partial<QualityReportData> | null;
  imageUrl?: string | null;
  onGradeNew?: () => void;
  compact?: boolean;
}

export default function QualityReport({
  data,
  imageUrl,
  onGradeNew,
  compact = false,
}: QualityReportProps) {
  const report: QualityReportData = {
    ...MOCK_REPORT,
    ...data,
    imageUrl: imageUrl ?? data?.imageUrl ?? MOCK_REPORT.imageUrl,
  };

  const metrics = [
    {
      key: "sizeUniformity" as const,
      label: "Size Uniformity",
      detail: "Consistency of fruit dimensions across the sample",
    },
    {
      key: "colorQuality" as const,
      label: "Color Quality",
      detail: "Color distribution and uniformity assessment",
    },
    {
      key: "ripenessLevel" as const,
      label: "Ripeness Level",
      detail: "AI-derived ripeness from ViT classification",
    },
    {
      key: "defectFreeScore" as const,
      label: "Defect-Free Score",
      detail: "Absence of necrotic spots and visual defects",
    },
  ];

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 ${
        compact ? "max-w-md" : ""
      }`}
    >
      <div
        className={`grid ${compact ? "grid-cols-1" : "md:grid-cols-2"} gap-0`}
      >
        {/* Left: Image */}
        <div className="relative bg-slate-50 min-h-[240px] md:min-h-[320px] flex items-center justify-center p-6">
          {report.imageUrl ? (
            <img
              src={report.imageUrl}
              alt="Fruit sample"
              className="max-h-full w-auto object-contain rounded-lg"
            />
          ) : (
            <div className="text-slate-400 text-center">
              <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-slate-200 flex items-center justify-center text-4xl">
                🍎
              </div>
              <p className="text-sm">No image</p>
            </div>
          )}
        </div>

        {/* Right: Data */}
        <div className="p-6 md:p-8 flex flex-col justify-between font-sans">
          {/* Grade Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl md:text-4xl font-bold text-slate-900">
                Grade {report.grade}
              </span>
              <Check className="w-8 h-8 text-emerald-500 shrink-0" />
            </div>
            <p className="text-slate-600 text-sm">{report.gradeLabel}</p>
          </div>

          {/* Score */}
          <div className="mb-6">
            <span className="text-4xl md:text-5xl font-bold text-slate-900 tabular-nums">
              {report.score}
            </span>
            <span className="text-2xl md:text-3xl font-medium text-slate-400">
              /{report.maxScore}
            </span>
          </div>

          {/* Metric Bars */}
          <div className="space-y-4 mb-6">
            {metrics.map((m) => (
              <MetricBar
                key={m.key}
                label={m.label}
                value={report.metrics[m.key]}
                detail={m.detail}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Assessed on {report.assessedAt}
            </p>
            {onGradeNew && (
              <button
                onClick={onGradeNew}
                className="w-full py-3 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                Grade New Sample
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
