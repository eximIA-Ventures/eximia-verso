import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/articles — lista todos os artigos (admin, bypassa RLS)
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, pillar, status, featured, updated_at")
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

  const { data, error } = await supabase
    .from("articles")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
