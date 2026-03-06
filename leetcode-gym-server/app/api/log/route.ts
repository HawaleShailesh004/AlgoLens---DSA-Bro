import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { logPostBodySchema } from "@/lib/validation";
import { calculateSM2, getInitialSRS } from "@/lib/srs";

export async function POST(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = logPostBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Check if this is a re-review (existing log for same slug)
    const existingLog = await prisma.log.findFirst({
      where: {
        userId,
        slug: data.slug,
      },
      orderBy: { reviewedAt: "desc" },
    });

    let srsData: {
      easeFactor: number;
      lastInterval: number | null;
      nextReviewAt: Date;
    };

    if (
      existingLog &&
      existingLog.easeFactor !== null &&
      existingLog.lastInterval !== null
    ) {
      // Re-review: use SM-2 with existing ease factor and interval
      const srsResult = calculateSM2(
        data.confidence,
        existingLog.easeFactor,
        existingLog.lastInterval,
      );
      srsData = {
        easeFactor: srsResult.easeFactor,
        lastInterval: srsResult.interval,
        nextReviewAt: srsResult.nextReviewAt,
      };
    } else {
      // First time logging this problem: use initial SRS values
      const initial = getInitialSRS();
      const srsResult = calculateSM2(
        data.confidence,
        initial.easeFactor,
        initial.lastInterval,
      );
      srsData = {
        easeFactor: srsResult.easeFactor,
        lastInterval: srsResult.interval,
        nextReviewAt: srsResult.nextReviewAt,
      };
    }

    const log = await prisma.log.create({
      data: {
        userId,
        slug: data.slug,
        title: data.title,
        difficulty: "Medium",
        confidence: data.confidence,
        nextReviewAt: srsData.nextReviewAt,
        easeFactor: srsData.easeFactor,
        lastInterval: srsData.lastInterval,
        category: data.category ?? "General",
        approach: data.approach ?? null,
        complexity: data.complexity ?? null,
        codeSnippet: data.codeSnippet ?? null,
        keyInsight: data.keyInsight ?? null,
        mnemonic: data.mnemonic ?? null,
        timeTaken: data.timeTaken ?? null,
        timeLimit: data.timeLimit ?? null,
        metTimeLimit: data.metTimeLimit ?? null,
        language: data.language ?? null,
        solution: data.solution ?? data.optimalSolution ?? null,
      },
    });
    return NextResponse.json(log);
  } catch (e) {
    console.error("Log create error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || "100", 10)),
    200,
  );
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const logs = await prisma.log.findMany({
      where: { userId },
      orderBy: { nextReviewAt: "asc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = logs.length > limit;
    const items = hasMore ? logs.slice(0, limit) : logs;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      items,
      nextCursor,
      hasMore: !!nextCursor,
    });
  } catch (e) {
    console.error("Log list error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 },
    );
  }
}
