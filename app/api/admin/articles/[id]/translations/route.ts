import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTranslationsForArticle, upsertTranslation, publishTranslation } from "@/lib/translations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const translations = await getTranslationsForArticle(id);
  return NextResponse.json({ translations });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { locale, action, title, excerpt, content } = body;

  if (!locale || !["en", "es"].includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  if (action === "publish") {
    const ok = await publishTranslation(id, locale);
    if (!ok) {
      return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  // Update translation content
  if (title || excerpt || content) {
    const translation = await upsertTranslation(id, locale, {
      title: title ?? "",
      excerpt: excerpt ?? "",
      content: content ?? "",
      translatedBy: "human",
      status: "draft",
    });
    if (!translation) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
    return NextResponse.json({ translation });
  }

  return NextResponse.json({ error: "No action specified" }, { status: 400 });
}
