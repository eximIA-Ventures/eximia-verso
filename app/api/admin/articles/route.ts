import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/articles — lista todos os artigos (admin, bypassa RLS)
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, pillar, status, featured, updated_at, article_translations(locale, status)")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/articles — criar artigo
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createAdminClient();

  // Extrair author_ids antes de inserir
  const { author_ids, ...articleData } = body;

  const { data, error } = await supabase
    .from("articles")
    .insert(articleData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Vincular autores
  if (author_ids && author_ids.length > 0) {
    const links = author_ids.map((authorId: string, idx: number) => ({
      article_id: data.id,
      author_id: authorId,
      role: "author",
      position: idx,
    }));

    await supabase.from("article_authors").insert(links);
  }

  return NextResponse.json(data, { status: 201 });
}
