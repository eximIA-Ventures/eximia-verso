import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { translateArticle } from "@/lib/ai-translate";
import { upsertTranslation } from "@/lib/translations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const locale = body.locale as "en" | "es";
  const force = body.force === true;

  if (!locale || !["en", "es"].includes(locale)) {
    return NextResponse.json(
      { error: "Invalid locale. Must be 'en' or 'es'" },
      { status: 400 }
    );
  }

  // Check if translation already exists (unless force)
  if (!force) {
    const { data: existing } = await supabase
      .from("article_translations")
      .select("id")
      .eq("article_id", id)
      .eq("locale", locale)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Translation already exists. Use force: true to retranslate." },
        { status: 409 }
      );
    }
  }

  // Fetch original article
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("title, excerpt, content")
    .eq("id", id)
    .single();

  if (articleError || !article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const { result, model } = await translateArticle(
      {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
      },
      locale
    );

    const translation = await upsertTranslation(id, locale, {
      title: result.title,
      excerpt: result.excerpt,
      content: result.content,
      translatedBy: "ai",
      modelUsed: model,
      status: "draft",
    });

    if (!translation) {
      return NextResponse.json(
        { error: "Failed to save translation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ translation });
  } catch (err) {
    console.error("Translation error:", err);
    return NextResponse.json(
      { error: `Translation failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
