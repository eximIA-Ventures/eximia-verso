import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/admin/upload — upload imagem para Supabase Storage
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const fileName = formData.get("fileName") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const name = fileName || `upload-${Date.now()}.${file.name.split(".").pop()}`;

  const { error: uploadError } = await supabase.storage
    .from("article-images")
    .upload(name, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage
    .from("article-images")
    .getPublicUrl(name);

  return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
}
