import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-auth";

// GET /api/v1/articles — listar artigos
export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  const supabase = createAdminClient();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const pillar = url.searchParams.get("pillar");
  const limit = parseInt(url.searchParams.get("limit") ?? "50");

  let query = supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (pillar) query = query.eq("pillar", pillar);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data });
}

// POST /api/v1/articles — criar artigo
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? "",
      content: body.content ?? "",
      pillar: body.pillar,
      tags: body.tags ?? [],
      author: body.author ?? "eximIA",
      hero_image: body.hero_image ?? null,
      reading_time: body.reading_time ?? 0,
      status: body.status ?? "draft",
      sources: body.sources ?? [],
      publish_date: body.publish_date ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ article: data }, { status: 201 });
}
