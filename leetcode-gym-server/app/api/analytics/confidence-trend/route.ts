import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * GET /api/analytics/confidence-trend
 * Returns rolling 14-day average confidence
 */
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const logs = await prisma.log.findMany({
      where: {
        userId,
        reviewedAt: { gte: fourteenDaysAgo },
      },
      select: { reviewedAt: true, confidence: true },
      orderBy: { reviewedAt: "asc" },
    });

    // Group by date and calculate daily averages
    const dailyMap = new Map<string, { totalConfidence: number; count: number }>();

    for (const log of logs) {
      const dateKey = log.reviewedAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const existing = dailyMap.get(dateKey) || { totalConfidence: 0, count: 0 };
      dailyMap.set(dateKey, {
        totalConfidence: existing.totalConfidence + log.confidence,
        count: existing.count + 1,
      });
    }

    // Convert to array with average confidence
    const trend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        avgConfidence: data.count > 0 ? data.totalConfidence / data.count : 0,
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ trend });
  } catch (e) {
    console.error("Confidence trend error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
