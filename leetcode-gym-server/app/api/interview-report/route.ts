import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  INTERVIEW_REPORT_SYSTEM_PROMPT,
  getInterviewReportUserPrompt,
} from "@/lib/prompts";

const interviewReportSchema = z.object({
  conversationHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  problemContext: z.object({
    title: z.string(),
    difficulty: z.string().optional(),
    description: z.string().optional(),
  }),
  timeTaken: z.number(), // Total seconds
  hintCount: z.number(),
  communicationTranscript: z.string().optional(),
});

/**
 * POST /api/interview-report
 * Generates interview performance report from conversation transcript
 */
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

  const parsed = interviewReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { conversationHistory, problemContext, timeTaken, hintCount, communicationTranscript } = parsed.data;

  try {
    // Get user's AI provider preference
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiProvider: true, groqApiKey: true, openaiApiKey: true },
    });

    let apiKey: string | undefined;
    let baseUrl: string | undefined;
    let provider: "groq" | "openai" = "groq";

    if (user) {
      provider = (user.aiProvider === "openai" ? "openai" : "groq") as "groq" | "openai";
      apiKey = provider === "openai" ? user.openaiApiKey || undefined : user.groqApiKey || undefined;
    }

    if (provider === "openai") {
      baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      apiKey = apiKey || process.env.OPENAI_API_KEY;
    } else {
      baseUrl = process.env.GROQ_BASE_URL;
      apiKey = apiKey || process.env.GROQ_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json({ error: "No API key available" }, { status: 400 });
    }

    const client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    // Calculate time breakdown (rough estimates)
    const readingTime = Math.min(300, Math.floor(timeTaken * 0.1)); // ~10% for reading, max 5min
    const codingTime = Math.max(0, timeTaken - readingTime - 60); // Rest minus buffer
    const debuggingTime = Math.max(0, timeTaken - readingTime - codingTime);

    const reportPrompt = getInterviewReportUserPrompt({
      problemContext,
      timeTaken,
      hintCount,
      communicationTranscript,
      conversationHistory,
      readingTime,
      codingTime,
      debuggingTime,
    });

    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL!,
      messages: [
        { role: "system", content: INTERVIEW_REPORT_SYSTEM_PROMPT },
        { role: "user", content: reportPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const reportContent = response.choices[0].message.content;
    if (!reportContent) {
      return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }

    const report = JSON.parse(reportContent);

    return NextResponse.json(report);
  } catch (e) {
    console.error("Interview report error:", e);
    return NextResponse.json(
      { error: "Server error", message: (e as Error).message },
      { status: 500 }
    );
  }
}
