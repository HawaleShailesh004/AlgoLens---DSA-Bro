import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export type QuickPromptItem = { label: string; text: string };

/** GET /api/settings — return user settings (mask API key). */
export async function GET(req: Request) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredLanguage: true,
      groqApiKey: true,
      quickPrompts: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let quickPrompts: QuickPromptItem[] = [];
  if (user.quickPrompts) {
    try {
      quickPrompts = JSON.parse(user.quickPrompts) as QuickPromptItem[];
      if (!Array.isArray(quickPrompts)) quickPrompts = [];
    } catch {
      quickPrompts = [];
    }
  }

  return NextResponse.json({
    preferredLanguage: user.preferredLanguage ?? "cpp",
    groqApiKey: user.groqApiKey
      ? `${user.groqApiKey.slice(0, 6)}••••${user.groqApiKey.slice(-4)}`
      : null,
    groqApiKeySet: !!user.groqApiKey,
    quickPrompts,
  });
}

/** PATCH /api/settings — update preferredLanguage, groqApiKey, quickPrompts. */
export async function PATCH(req: Request) {
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

  const b = body as Record<string, unknown>;
  const preferredLanguage =
    typeof b.preferredLanguage === "string" ? b.preferredLanguage : undefined;
  const groqApiKey =
    b.groqApiKey === null || b.groqApiKey === ""
      ? null
      : typeof b.groqApiKey === "string"
        ? b.groqApiKey.trim() || null
        : undefined;
  let quickPrompts: string | null | undefined;
  if (Array.isArray(b.quickPrompts)) {
    const arr = b.quickPrompts as unknown[];
    const valid = arr.every(
      (x) =>
        typeof x === "object" &&
        x !== null &&
        "label" in x &&
        "text" in x &&
        typeof (x as { label: unknown }).label === "string" &&
        typeof (x as { text: unknown }).text === "string"
    );
    quickPrompts = valid ? JSON.stringify(arr) : undefined;
  } else {
    quickPrompts = undefined;
  }

  const data: Record<string, unknown> = {};
  if (preferredLanguage !== undefined) data.preferredLanguage = preferredLanguage;
  if (groqApiKey !== undefined) data.groqApiKey = groqApiKey;
  if (quickPrompts !== undefined) data.quickPrompts = quickPrompts;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "No changes" });
  }

  await prisma.user.update({
    where: { id: userId },
    data: data as Record<string, string | null>,
  });

  return NextResponse.json({ message: "Settings updated" });
}
