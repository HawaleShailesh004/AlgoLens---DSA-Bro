import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * GET /api/analytics/weak-spots
 * Returns top 3 patterns with lowest average confidence
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
    const patterns = Array.from(patternMap.entries())
      .map(([pattern, data]) => ({
        pattern,
        avgConfidence: data.count > 0 ? data.totalConfidence / data.count : 0,
        count: data.count,
      }))
      .filter(p => p.count > 0) // Only patterns with at least one solve
      .sort((a, b) => a.avgConfidence - b.avgConfidence) // Sort by lowest confidence first
      .slice(0, 3); // Top 3

    return NextResponse.json({ weakSpots: patterns });
  } catch (e) {
    console.error("Weak spots error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
