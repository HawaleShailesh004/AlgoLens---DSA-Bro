import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getUserIdFromRequest } from "@/lib/auth";
import { chatPostBodySchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getChatSystemPromptNormal, getChatSystemPromptInterview } from "@/lib/prompts";

// Initialize Redis only if credentials are available (trim to avoid .env quotes/spaces)
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()?.replace(/^["']|["']$/g, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()?.replace(/^["']|["']$/g, "");
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

let redis: Redis | null = getRedisClient();

// One-time startup ping: log if Redis is reachable (empty Redis is fine; we create keys on first incr)
if (redis) {
  redis
    .ping()
    .then(() => console.log("[Redis] Connected. Rate limiting enabled."))
    .catch((err: unknown) =>
      console.warn("[Redis] Startup ping failed, rate limits will be skipped until connection works:", (err as Error)?.message ?? err)
    );
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const parsed = chatPostBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const {
      messages,
      problemContext,
      userApiKey,
      mode = "normal",
    } = parsed.data;
    const isInterviewMode = mode === "interview";

    // --- 1. KEY SELECTION & RATE LIMITING ---
    const userId = await getUserIdFromRequest(req);
    let apiKey = userApiKey;
    let provider: "groq" | "openai" = "groq";
    let baseUrl: string | undefined;

    // Get user's provider preference and API keys
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { aiProvider: true, groqApiKey: true, openaiApiKey: true },
        });

        if (user) {
          provider = (user.aiProvider === "openai" ? "openai" : "groq") as
            | "groq"
            | "openai";

          // Use user's API key if available
          if (!apiKey) {
            apiKey =
              provider === "openai"
                ? user.openaiApiKey || undefined
                : user.groqApiKey || undefined;
          }
        }
      } catch (dbError: any) {
        // Database connection failed - log warning but continue with defaults
        console.warn(
          "Database connection failed, using default settings:",
          dbError?.message || dbError,
        );
        // Continue without user preferences - will use default provider and shared API key
      }
    }

    // Set base URL based on provider
    if (provider === "openai") {
      baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    } else {
      baseUrl = process.env.GROQ_BASE_URL;
    }

    // If no user API key, use shared key and apply rate limiting
    if (!apiKey) {
      apiKey =
        provider === "openai"
          ? process.env.OPENAI_API_KEY
          : process.env.GROQ_API_KEY;

      // Rate limiting when using shared API key (requires Redis) — commented out for now
      // if (redis) {
      //   try {
      //     const usageKey = userId
      //       ? `usage:user:${userId}`
      //       : `usage:ip:${req.headers.get("x-forwarded-for") || "unknown"}`;

      //     const currentUsage = (await redis.get<number>(usageKey)) || 0;
      //     const limit = userId ? 50 : 10; // Higher limit for logged-in users

      //     if (currentUsage >= limit) {
      //       return NextResponse.json(
      //         {
      //           error: `Daily limit reached (${limit}/${limit}). Add your own API key in settings!`,
      //           isQuotaError: true,
      //         },
      //         { status: 429 },
      //       );
      //     }
      //     await redis.incr(usageKey);
      //     if (currentUsage === 0) await redis.expire(usageKey, 86400);
      //   } catch (redisError) {
      //     console.warn(
      //       "Rate limit check failed, allowing request:",
      //       (redisError as Error)?.message ?? redisError,
      //     );
      //   }
      // }
    }

    // --- 2. SYSTEM PROMPT (Normal vs Interview Mode) ---

    const SYSTEM_PROMPT = isInterviewMode
      ? getChatSystemPromptInterview(problemContext)
      : getChatSystemPromptNormal(problemContext);

    // --- 3. CALL AI PROVIDER ---
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

    const cleanedMessages = messages.map((message: any) => {
      return {
        role: message.role,
        content: message.content,
      };
    });

    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL!,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...cleanedMessages,
      ],
      max_tokens: 1500,
      temperature: 0.6,
      stream: true,
    });

    // Create a ReadableStream to send data chunk by chunk
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) controller.enqueue(new TextEncoder().encode(content));
        }
        controller.close();
      },
    });

    return new NextResponse(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("______________________");
    console.error("❌ BACKEND ERROR:", error);
    console.error("______________________");
    // Handle Invalid User Key
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API Key provided." },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
