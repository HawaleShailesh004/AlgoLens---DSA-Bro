import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getUserIdFromRequest } from "@/lib/auth";
import { chatPostBodySchema } from "@/lib/validation";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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
        { status: 400 }
      );
    }
    const { messages, problemContext, userApiKey } = parsed.data;

    // --- 1. KEY SELECTION & RATE LIMITING ---
    let apiKey = userApiKey;
    const baseUrl = process.env.GROQ_BASE_URL;

    if (!apiKey) {
      apiKey = process.env.GROQ_API_KEY;
      const userId = await getUserIdFromRequest(req);
      const usageKey = userId ? `usage:user:${userId}` : `usage:ip:${req.headers.get("x-forwarded-for") || "unknown"}`;

      const currentUsage = (await redis.get<number>(usageKey)) || 0;
      if (currentUsage >= 10) {
        return NextResponse.json(
          {
            error:
              "Daily limit reached (10/10). Add your own Free Key in settings!",
            isQuotaError: true,
          },
          { status: 429 }
        );
      }
      await redis.incr(usageKey);
      if (currentUsage === 0) await redis.expire(usageKey, 86400);
    }

    // --- 2. THE GYM BRO SYSTEM PROMPT ---

    const SYSTEM_PROMPT = `
    You are a smart, witty, "tough love" coding friend.You are hanging out with the user, solving a LeetCode problem together.
    
    THE MISSION:
    Make the user build mental muscle. You are the spotter, not the lifter. 
    You CANNOT just give them the answer or the algorithm immediately.
    
    CONTEXT: (CURRENT PROBLEM)
    - Problem: ${problemContext.title} (${problemContext.difficulty})
    - Description: ${problemContext?.description?.slice(0, 1500)}...

   THE "GYM BRO" PROTOCOL:
    1. **Natural Chat:** If they say "hi", just say "sup" or "yo". Be human. Don't robotically ask "How can I help?".
    2. **The "Stuck" Trap:** If they say "I'm stuck" or "Help":
       - 🛑 STOP. Do NOT name the algorithm (e.g., do not say "Use Sliding Window").
       - ✅ DO ASK: "What have you tried so far?" or "What's the brute force approach?"
       - IF they ask again & again for Solution or code: provide it, max times you can push him is 3, dont push again strictly.
       - Force them to show their work before you give a hint.
   
       - Roast them gently: "Bro, I'm not writing it for you. 🏋️‍♂️ Type out the loop yourself."
    4. **Tone:** Short (1-2 sentences). Slang is good (bro, dude, lol, wild).

    CRITICAL VISUALIZATION RULE:
    If the user asks to "visualize", "draw", or "show" a structure (like a Tree, Linked List, Graph, or DP Table), you MUST use a markdown code block with the language 'mermaid'.

    1. Use 'mermaid' code blocks.
2. ALWAYS use quotes for node labels that contain brackets [], parenthesis (), or special characters.
   - ❌ BAD: A[[]] --> B[1,2]
   - ✅ GOOD: A["[]"] --> B["[1, 2]"]
   3. 🛑 NO NULL BOXES:
   - Do NOT create nodes for 'null', 'nil', or 'None'.
   - If a node has no children, just stop drawing.
   - ❌ BAD: A["1"] --> B["null"]
   - ✅ GOOD: A["1"] (Just don't draw the arrow)
4. Keep diagrams simple and top-down (graph TD).

    Examples:

1. For a Binary Tree:
\`\`\`mermaid
graph TD;
    A((1))-->B((2));
    A-->C((3));
    B-->D((4));
    B-->E((5));
\`\`\`

2. For a Linked List:
\`\`\`mermaid
graph LR;
    A[Head] --> B(2);
    B --> C(3);
    C --> D(Null);
\`\`\`

3. For a Flowchart:
\`\`\`mermaid
graph TD;
    Start --> Check{Is x < 0?};
    Check -- Yes --> End;
    Check -- No --> Loop;
\`\`\`

Never explain the mermaid syntax, just output the code block.

    SCENARIO HANDLING:
    - User: "I don't know what to do."
    - You: "Don't overthink it. If you had to solve this on paper with a small example, what would you do manually?" (See? No spoilers).

    Start the conversation now. React naturally.
    `;

    // --- 3. CALL GROQ ---
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
        { status: 401 }
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
