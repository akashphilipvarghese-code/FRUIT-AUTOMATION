import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { GradeData } from "@/types/grade";

/**
 * GET /api/history
 * Returns persisted grading history from SQLite.
 */
export async function GET() {
  try {
    const records = await prisma.gradeRecord.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    const history: GradeData[] = records.map((r) => ({
      id: r.id,
      grade: r.grade as GradeData["grade"],
      overallScore: r.overallScore,
      size: r.size,
      color: r.color,
      ripeness: r.ripeness,
      defects: r.defects,
      imageUrl: r.imageBase64
        ? `data:image/jpeg;base64,${r.imageBase64}`
        : "",
      timestamp: r.timestamp,
      fruitType: r.fruitType as GradeData["fruitType"],
      surfaceDefectPercentage: r.surfaceDefectPercentage,
      area: r.area,
      perimeter: r.perimeter,
    }));

    return NextResponse.json(history);
  } catch (e) {
    console.error("/api/history error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load history" },
      { status: 500 }
    );
  }
}
