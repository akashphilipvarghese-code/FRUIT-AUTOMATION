import type { GradeData } from "./GradeResult";

type Props = {
  data: GradeData;
  className?: string;
};

/**
 * Summary quality report view.
 * Placeholder – extend with charts/export as needed.
 */
export function QualityReport({ data, className = "" }: Props) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Quality Report
      </h3>
      <p className="text-white font-medium">Grade {data.grade} — Score {data.overallScore}/100</p>
      <p className="text-gray-500 text-sm mt-1">{data.fruitType}</p>
    </div>
  );
}
