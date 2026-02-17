import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { generateNotesBodySchema } from "@/lib/validation";

const SYSTEM_PROMPT = `
You are an expert algorithm summarizer. 
Given a coding problem and conversation history, extract the key details for a revision flashcard.
Output strictly valid JSON.

Format:
{
  "category": "Pattern Name (e.g. Sliding Window, DFS)",
  "approach": "One sentence simple explanation of the trick used.",
  "complexity": "Time: O(?), Space: O(?)",
  "codeSnippet": "Only the critical 3-5 lines of code logic.",
  "optimalSolution": "FULL COMPLETE OPTIMAL SOLUTION CODE (Boilerplate included) in the requested language."
}
`;

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
      { status: 400 }
    );
  }
  const { messages, problemContext, userApiKey, language } = parsed.data;

  const cleanedMessages = messages.map((message: any) => ({
      role: message.role,
      content: message.content,
  }));

  const client = new OpenAI({
    apiKey: userApiKey || process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL,
  });

  const response = await client.chat.completions.create({
    model: process.env.AI_MODEL!,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...cleanedMessages,
      {
        role: "user",
        content: `Summarize the solution for: ${problemContext.title}. PREFERRED LANGUAGE: ${language || "cpp"}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return NextResponse.json(
    JSON.parse(response.choices[0].message.content || "{}"),
  );
}