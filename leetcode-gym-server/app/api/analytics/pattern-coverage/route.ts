import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * GET /api/analytics/pattern-coverage
 * Returns average confidence per pattern (for heatmap)
 */
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.log.findMany({
      where: { userId },
      select: { category: true, confidence: true },
    });

    // Group by category and calculate average confidence
    const patternMap = new Map<string, { totalConfidence: number; count: number }>();

    for (const log of logs) {
      const category = log.category || "General";
      const existing = patternMap.get(category) || { totalConfidence: 0, count: 0 };
      patternMap.set(category, {
        totalConfidence: existing.totalConfidence + log.confidence,
        count: existing.count + 1,
      });
    }

    // Convert to array with average confidence
    const patterns = Array.from(patternMap.entries()).map(([pattern, data]) => ({
      pattern,
      avgConfidence: data.count > 0 ? data.totalConfidence / data.count : 0,
      count: data.count,
    }));

    // Sort by pattern name
    patterns.sort((a, b) => a.pattern.localeCompare(b.pattern));

    return NextResponse.json({ patterns });
  } catch (e) {
    console.error("Pattern coverage error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
