import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { search } from "@/lib/image-engine";
import type { ImageProvider } from "@/lib/image-engine";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  const perPage = parseInt(url.searchParams.get("per_page") ?? "10");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const orientation = url.searchParams.get("orientation") as
    | "landscape"
    | "portrait"
    | "squarish"
    | null;
  const providersParam = url.searchParams.get("providers");
  const providers = providersParam
    ? (providersParam.split(",") as ImageProvider[])
    : undefined;

  try {
    const results = await search({
      query,
      perPage,
      page,
      orientation: orientation ?? undefined,
      providers,
    });

    return NextResponse.json({
      query,
      total: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
