import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { generateNotesBodySchema } from "@/lib/validation";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GENERATE_NOTES_SYSTEM_PROMPT, getGenerateNotesUserPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = generateNotesBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { messages, problemContext, userApiKey, language } = parsed.data;

  const cleanedMessages = messages.map((message: any) => ({
    role: message.role,
    content: message.content,
  }));

  // Get user's provider preference
  const userId = await getUserIdFromRequest(req);
  let apiKey = userApiKey;
  let provider: "groq" | "openai" = "groq";
  let baseUrl: string | undefined;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiProvider: true, groqApiKey: true, openaiApiKey: true },
    });

    if (user) {
      provider = (user.aiProvider === "openai" ? "openai" : "groq") as
        | "groq"
        | "openai";
      if (!apiKey) {
        apiKey =
          provider === "openai"
            ? user.openaiApiKey || undefined
            : user.groqApiKey || undefined;
      }
    }
  }

  if (provider === "openai") {
    baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    apiKey = apiKey || process.env.OPENAI_API_KEY;
  } else {
    baseUrl = process.env.GROQ_BASE_URL;
    apiKey = apiKey || process.env.GROQ_API_KEY;
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key available" },
      { status: 400 },
    );
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
  });

  const response = await client.chat.completions.create({
    model: process.env.AI_MODEL!,
    messages: [
      { role: "system", content: GENERATE_NOTES_SYSTEM_PROMPT },
      ...cleanedMessages,
      {
        role: "user",
        content: getGenerateNotesUserPrompt(problemContext.title, language || "cpp"),
      },
    ],
    response_format: { type: "json_object" },
  });

  return NextResponse.json(
    JSON.parse(response.choices[0].message.content || "{}"),
  );
}
