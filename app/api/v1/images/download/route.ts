import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { download } from "@/lib/image-engine";
import type { ImageProvider } from "@/lib/image-engine";

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  let body: { imageUrl?: string; provider?: ImageProvider; fileName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.imageUrl) {
    return NextResponse.json(
      { error: "Missing required field: imageUrl" },
      { status: 400 }
    );
  }

  try {
    const result = await download({
      imageUrl: body.imageUrl,
      provider: body.provider ?? "unsplash",
      fileName: body.fileName,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
