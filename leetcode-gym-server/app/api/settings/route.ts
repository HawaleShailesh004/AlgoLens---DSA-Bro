import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsPatchSchema = z.object({
  preferredLanguage: z.string().optional(),
  aiProvider: z.enum(["groq", "openai"]).optional(),
  groqApiKey: z.string().nullable().optional(),
  openaiApiKey: z.string().nullable().optional(),
  quickPrompts: z.array(z.object({
    label: z.string(),
    text: z.string(),
  })).optional(),
});

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          preferredLanguage: true,
          aiProvider: true,
          quickPrompts: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const quickPrompts = user.quickPrompts
        ? (JSON.parse(user.quickPrompts) as { label: string; text: string }[])
        : [];
      return NextResponse.json({
        preferredLanguage: user.preferredLanguage,
        aiProvider: user.aiProvider,
        quickPrompts,
      });
    } catch (dbError: any) {
      console.error("Database error in GET /api/settings:", dbError);
      return NextResponse.json(
        { error: "Database connection failed", message: dbError?.message || "Unable to fetch settings" },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
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

    const parsed = settingsPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.preferredLanguage !== undefined && { preferredLanguage: data.preferredLanguage }),
          ...(data.aiProvider !== undefined && { aiProvider: data.aiProvider }),
          ...(data.groqApiKey !== undefined && { groqApiKey: data.groqApiKey }),
          ...(data.openaiApiKey !== undefined && { openaiApiKey: data.openaiApiKey }),
          ...(data.quickPrompts !== undefined && { quickPrompts: JSON.stringify(data.quickPrompts) }),
        },
        select: {
          preferredLanguage: true,
          aiProvider: true,
          quickPrompts: true,
        },
      });

      const quickPromptsOut = updated.quickPrompts
        ? (JSON.parse(updated.quickPrompts) as { label: string; text: string }[])
        : [];
      return NextResponse.json({
        preferredLanguage: updated.preferredLanguage,
        aiProvider: updated.aiProvider,
        quickPrompts: quickPromptsOut,
      });
    } catch (dbError: any) {
      console.error("Database error in PATCH /api/settings:", dbError);
      return NextResponse.json(
        { error: "Database connection failed", message: dbError?.message || "Unable to update settings" },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Error in PATCH /api/settings:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error?.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
