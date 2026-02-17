import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { logPostBodySchema } from "@/lib/validation";

const getNextDate = (confidence: number) => {
  const days = confidence === 1 ? 1 : confidence === 2 ? 3 : 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

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
      { status: 400 }
    );
  }

  const data = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const log = await prisma.log.create({
      data: {
        userId,
        slug: data.slug,
        title: data.title,
        difficulty: "Medium",
        confidence: data.confidence,
        nextReviewAt: getNextDate(data.confidence),
        category: data.category ?? "General",
        approach: data.approach ?? null,
        complexity: data.complexity ?? null,
        codeSnippet: data.codeSnippet ?? null,
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
      { status: 500 }
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
    200
  );
  const cursor = searchParams.get("cursor") || undefined;

  try {
    const logs = await prisma.log.findMany({
      where: { userId },
      orderBy: { nextReviewAt: "asc" },
      take: limit + 1,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
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
      { status: 500 }
    );
  }
}
