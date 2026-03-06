import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { OpenAI } from "openai";
import {
  READINESS_DIAGNOSIS_SYSTEM_PROMPT,
  getReadinessDiagnosisUserPrompt,
} from "@/lib/prompts";

/**
 * GET /api/analytics/readiness-score
 * Calculates interview readiness score (0-100) based on multiple factors
 */
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.log.findMany({
      where: { userId },
      select: {
        category: true,
        confidence: true,
        nextReviewAt: true,
        reviewedAt: true,
      },
    });

    if (logs.length === 0) {
      return NextResponse.json({
        score: 0,
        breakdown: {
          patternCoverage: 0,
          srsHealth: 0,
          confidenceTrajectory: 0,
          recency: 0,
          consistency: 0,
        },
        diagnosis: "Start solving problems to get your readiness score!",
      });
    }

    // 1. Pattern Coverage (30 points)
    const corePatterns = [
      "Arrays",
      "Two Pointers",
      "Sliding Window",
      "Binary Search",
      "Dynamic Programming",
      "Graph",
      "Tree",
      "Heap",
      "Backtracking",
      "Greedy",
      "Hashing",
      "String",
      "Math",
      "Bit Manipulation",
    ];

    const solvedPatterns = new Set(
      logs.map((l) => l.category || "General").filter((c) => corePatterns.includes(c))
    );
    const patternCoverage = Math.min(30, (solvedPatterns.size / corePatterns.length) * 30);

    // 2. SRS Health (25 points)
    const now = new Date();
    const overdue = logs.filter((l) => new Date(l.nextReviewAt) < now).length;
    const total = logs.length;
    const overdueRatio = total > 0 ? overdue / total : 1;
    const srsHealth = Math.max(0, 25 * (1 - overdueRatio * 0.5)); // Penalize overdue problems

    // 3. Confidence Trajectory (25 points)
    // Group logs by week and calculate average confidence per week
    const logsByWeek = new Map<number, number[]>();
    logs.forEach((log) => {
      const week = Math.floor(
        (now.getTime() - new Date(log.reviewedAt).getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      if (week <= 4) {
        // Last 4 weeks
        const confidences = logsByWeek.get(week) || [];
        confidences.push(log.confidence);
        logsByWeek.set(week, confidences);
      }
    });

    let confidenceTrajectory = 12.5; // Default middle score
    if (logsByWeek.size >= 2) {
      const weeks = Array.from(logsByWeek.keys()).sort((a, b) => a - b);
      const recentWeek = weeks[0];
      const olderWeek = weeks[weeks.length - 1];

      const recentAvg =
        logsByWeek.get(recentWeek)!.reduce((a, b) => a + b, 0) /
        logsByWeek.get(recentWeek)!.length;
      const olderAvg =
        logsByWeek.get(olderWeek)!.reduce((a, b) => a + b, 0) /
        logsByWeek.get(olderWeek)!.length;

      const trend = recentAvg - olderAvg;
      confidenceTrajectory = 12.5 + Math.min(12.5, Math.max(-12.5, trend * 6.25)); // Scale trend to 0-25
    }

    // 4. Recency (10 points)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = logs.filter((l) => new Date(l.reviewedAt) >= weekAgo);
    const recency = recentLogs.length >= 3 ? 10 : 0;

    // 5. Consistency (10 points)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeDays = new Set(
      logs
        .filter((l) => new Date(l.reviewedAt) >= thirtyDaysAgo)
        .map((l) => new Date(l.reviewedAt).toDateString())
    ).size;
    const consistency = Math.min(10, (activeDays / 20) * 10); // 20+ days = 10 points

    const totalScore = Math.round(
      patternCoverage + srsHealth + confidenceTrajectory + recency + consistency
    );

    // Generate diagnosis using AI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiProvider: true, groqApiKey: true, openaiApiKey: true },
    });

    let diagnosis = "";
    if (user) {
      let apiKey: string | undefined;
      let provider: "groq" | "openai" = "groq";
      let baseUrl: string | undefined;

      provider = (user.aiProvider === "openai" ? "openai" : "groq") as "groq" | "openai";
      apiKey = provider === "openai" ? user.openaiApiKey || undefined : user.groqApiKey || undefined;

      if (provider === "openai") {
        baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
        apiKey = apiKey || process.env.OPENAI_API_KEY;
      } else {
        baseUrl = process.env.GROQ_BASE_URL;
        apiKey = apiKey || process.env.GROQ_API_KEY;
      }

      if (apiKey) {
        try {
          const client = new OpenAI({
            apiKey: apiKey,
            baseURL: baseUrl,
          });

          const weakPatterns = Array.from(
            new Set(logs.map((l) => l.category || "General"))
          ).filter((p) => !corePatterns.includes(p) || !solvedPatterns.has(p));

          const response = await client.chat.completions.create({
            model: process.env.AI_MODEL!,
            messages: [
              { role: "system", content: READINESS_DIAGNOSIS_SYSTEM_PROMPT },
              {
                role: "user",
                content: getReadinessDiagnosisUserPrompt({
                  totalScore,
                  patternCoverage,
                  solvedPatternsSize: solvedPatterns.size,
                  corePatternsLength: corePatterns.length,
                  srsHealth,
                  overdue,
                  total,
                  confidenceTrajectory,
                  recency,
                  recentLogsLength: recentLogs.length,
                  consistency,
                  activeDays,
                  weakPatterns,
                }),
              },
            ],
            temperature: 0.7,
            max_tokens: 100,
          });

          diagnosis = response.choices[0].message.content?.trim() || "";
        } catch (e) {
          console.error("AI diagnosis generation failed:", e);
        }
      }
    }

    // Fallback diagnosis if AI fails
    if (!diagnosis) {
      if (totalScore >= 80) {
        diagnosis = "You're interview-ready! Keep maintaining your practice streak.";
      } else if (totalScore >= 60) {
        diagnosis = "You're getting close! Focus on weak patterns and reduce overdue reviews.";
      } else if (patternCoverage < 15) {
        diagnosis = `Focus on covering more patterns. You've only solved ${solvedPatterns.size} of ${corePatterns.length} core patterns.`;
      } else if (overdueRatio > 0.3) {
        diagnosis = `You have ${overdue} overdue problems. Review them to improve your SRS health.`;
      } else {
        diagnosis = "Keep practicing consistently! Solve at least 3 problems per week.";
      }
    }

    return NextResponse.json({
      score: totalScore,
      breakdown: {
        patternCoverage: Math.round(patternCoverage * 10) / 10,
        srsHealth: Math.round(srsHealth * 10) / 10,
        confidenceTrajectory: Math.round(confidenceTrajectory * 10) / 10,
        recency: Math.round(recency * 10) / 10,
        consistency: Math.round(consistency * 10) / 10,
      },
      diagnosis,
      details: {
        solvedPatterns: Array.from(solvedPatterns),
        totalPatterns: corePatterns.length,
        overdueCount: overdue,
        totalProblems: total,
        recentProblems: recentLogs.length,
        activeDays,
      },
    });
  } catch (e) {
    console.error("Readiness score error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
