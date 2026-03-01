import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { generate } from "@/lib/image-engine";

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  let body: { prompt?: string; width?: number; height?: number; provider?: "together" | "openai" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.prompt) {
    return NextResponse.json(
      { error: "Missing required field: prompt" },
      { status: 400 }
    );
  }

  try {
    const results = await generate({
      prompt: body.prompt,
      width: body.width,
      height: body.height,
      provider: body.provider,
    });

    return NextResponse.json({
      prompt: body.prompt,
      provider: body.provider ?? "together",
      total: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
