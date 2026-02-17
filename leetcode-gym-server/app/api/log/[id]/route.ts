import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

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
