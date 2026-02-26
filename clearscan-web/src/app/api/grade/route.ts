import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { GradeData } from "@/types/grade";
import type { FruitType } from "@/types/fruit-types";

const FRUIT_TYPES: FruitType[] = ["apple", "mango", "orange", "banana", "strawberry", "grape"];

/**
 * POST /api/grade
 * Simulates fruit analysis. Structure ready to swap for FastAPI backend later.
 * Body: FormData with "file" (image) and optional "fruitType" (auto | apple | ...).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fruitTypeParam = (formData.get("fruitType") as string) || "auto";

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "No image or invalid file type" },
        { status: 400 }
      );
    }

    // Mock analysis (replace with fetch to FastAPI when backend is ready)
    const detectedFruitType: FruitType =
      fruitTypeParam === "auto"
        ? FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)]
        : (fruitTypeParam as FruitType);

    const size = Math.floor(Math.random() * 20) + 80;
    const color = Math.floor(Math.random() * 25) + 75;
    const ripeness = Math.floor(Math.random() * 30) + 70;
    const defects = Math.floor(Math.random() * 25) + 75;
    const overallScore = Math.round((size + color + ripeness + defects) / 4);

    let grade: "A" | "B" | "C" | "D";
    if (overallScore >= 90) grade = "A";
    else if (overallScore >= 80) grade = "B";
    else if (overallScore >= 70) grade = "C";
    else grade = "D";

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const record = await prisma.gradeRecord.create({
      data: {
        grade,
        overallScore,
        size,
        color,
        ripeness,
        defects,
        imageBase64: base64,
        fruitType: detectedFruitType,
        surfaceDefectPercentage: Math.floor(Math.random() * 15) + 2,
        area: Math.floor(Math.random() * 50) + 25,
        perimeter: Math.floor(Math.random() * 30) + 15,
      },
    });

    const result: GradeData = {
      id: record.id,
      grade,
      overallScore,
      size,
      color,
      ripeness,
      defects,
      imageUrl: dataUrl,
      timestamp: record.timestamp,
      fruitType: detectedFruitType,
      surfaceDefectPercentage: record.surfaceDefectPercentage,
      area: record.area,
      perimeter: record.perimeter,
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error("/api/grade error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Grading failed" },
      { status: 500 }
    );
  }
}
