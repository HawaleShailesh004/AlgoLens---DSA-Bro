import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

/**
 * GET /api/analytics/streak
 * Returns current streak and longest streak
 */
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.log.findMany({
      where: { userId },
      select: { reviewedAt: true },
      orderBy: { reviewedAt: "desc" },
    });

    if (logs.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastLogDate: null,
      });
    }

    // Get unique dates (YYYY-MM-DD)
    const uniqueDates = new Set<string>();
    for (const log of logs) {
      const dateKey = log.reviewedAt.toISOString().split("T")[0];
      uniqueDates.add(dateKey);
    }

    const sortedDates = Array.from(uniqueDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const dateStr = checkDate.toISOString().split("T")[0];
      const logDateStr = sortedDates[i].toISOString().split("T")[0];

      if (logDateStr === dateStr) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return NextResponse.json({
      currentStreak,
      longestStreak,
      lastLogDate: sortedDates[0]?.toISOString().split("T")[0] || null,
    });
  } catch (e) {
    console.error("Streak error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
