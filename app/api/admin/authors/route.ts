import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/authors — lista todos os autores
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/authors — criar autor
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("authors")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
