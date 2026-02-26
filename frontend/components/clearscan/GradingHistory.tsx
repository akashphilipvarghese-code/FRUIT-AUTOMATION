"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { GradeData } from "./grade-result";

const FRUIT_LABELS: Record<string, string> = {
  apple: "Apple",
  mango: "Mango",
  orange: "Orange",
  banana: "Banana",
  strawberry: "Strawberry",
  grape: "Grape",
  auto: "Auto",
};

interface GradingHistoryProps {
  history: GradeData[];
  onSelectItem: (item: GradeData) => void;
  isAdmin?: boolean;
}

export function GradingHistory({
  history,
  onSelectItem,
  isAdmin = false,
}: GradingHistoryProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.toLowerCase();
    return history.filter(
      (r) =>
        FRUIT_LABELS[r.fruitType]?.toLowerCase().includes(q) ||
        r.grade.toLowerCase().includes(q) ||
        String(r.overallScore).includes(q)
    );
  }, [history, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by fruit or grade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FF8C00] outline-none"
        />
      </div>

      <div className="rounded-xl border border-gray-800 overflow-hidden bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Preview
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Date
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Fruit
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Grade
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Score
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No history yet.
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <img
                        src={row.imageUrl}
                        alt=""
                        className="w-14 h-14 object-cover rounded border border-gray-800"
                      />
                    </td>
                    <td className="py-4 px-4 text-white font-mono text-sm">
                      {row.timestamp.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-[#FF8C00] font-medium">
                      {FRUIT_LABELS[row.fruitType] ?? row.fruitType}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={
                          row.grade === "A" || row.grade === "B"
                            ? "text-green-500"
                            : "text-amber-500"
                        }
                      >
                        {row.grade}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white font-mono font-medium">
                      {row.overallScore}%
                    </td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => onSelectItem(row)}
                        className="text-[#FF8C00] hover:underline text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
