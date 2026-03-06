import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { calculateSM2 } from "@/lib/srs";
import { z } from "zod";

const updateLogSchema = z.object({
  confidence: z.number().int().min(1).max(3).optional(),
});

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const log = await prisma.log.findFirst({
    where: { id, userId },
  });
  if (!log) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }
  return NextResponse.json(log);
}

/**
 * PATCH /api/log/[id] - Update log (typically for re-reviewing)
 * Updates confidence and recalculates SRS schedule using SM-2
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  
  // Find existing log
  const existingLog = await prisma.log.findFirst({
    where: { id, userId },
  });
  
  if (!existingLog) {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { confidence } = parsed.data;

  try {
    // If confidence is provided, recalculate SRS schedule
    if (confidence !== undefined) {
      const currentEaseFactor = existingLog.easeFactor ?? 2.5;
      const currentLastInterval = existingLog.lastInterval;
      
      const srsResult = calculateSM2(confidence, currentEaseFactor, currentLastInterval);

      const updatedLog = await prisma.log.update({
        where: { id },
        data: {
          confidence,
          reviewedAt: new Date(),
          nextReviewAt: srsResult.nextReviewAt,
          easeFactor: srsResult.easeFactor,
          lastInterval: srsResult.interval,
        },
      });

      return NextResponse.json(updatedLog);
    }

    // If no confidence update, just return existing log
    return NextResponse.json(existingLog);
  } catch (e) {
    console.error("Log update error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
