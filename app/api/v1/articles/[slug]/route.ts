import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-auth";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/v1/articles/[slug]
export async function GET(request: NextRequest, ctx: RouteContext) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  const { slug } = await ctx.params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ article: data });
}

// PUT /api/v1/articles/[slug]
export async function PUT(request: NextRequest, ctx: RouteContext) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  const { slug } = await ctx.params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updatePayload: Record<string, unknown> = {};
  const allowedFields = [
    "title", "slug", "excerpt", "content", "pillar", "tags",
    "author", "hero_image", "reading_time", "status", "sources",
    "publish_date",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updatePayload[field] = body[field];
    }
  }

  const { data, error } = await supabase
    .from("articles")
    .update(updatePayload)
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ article: data });
}

// DELETE /api/v1/articles/[slug]
export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  const { slug } = await ctx.params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("articles").delete().eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ deleted: true });
}
