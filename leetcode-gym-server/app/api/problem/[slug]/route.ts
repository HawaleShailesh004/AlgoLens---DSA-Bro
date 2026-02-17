import { NextResponse } from "next/server";

const query = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      titleSlug
      difficulty
      content
      exampleTestcases
      codeSnippets {
        lang
        langSlug
        code
      }
    }
  }
`;

export async function GET(request: Request, context: any) {
  const { slug } = await context.params;
  console.log("slug", slug);

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: {
          titleSlug: slug,
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      return NextResponse.json(
        { error: "LeetCode API error", details: result.errors },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data.question);
  } catch (err) {
    console.error("LeetCode fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 },
    );
  }
}
