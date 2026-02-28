import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-auth";
import { revalidatePath } from "next/cache";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// POST /api/v1/articles/[slug]/publish
export async function POST(request: NextRequest, ctx: RouteContext) {
  const auth = await validateApiKey(request);
  if (!auth.valid) return auth.response;

  const { slug } = await ctx.params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .update({
      status: "published",
      publish_date: new Date().toISOString(),
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Article not found" },
      { status: 400 }
    );
  }

  // Trigger ISR revalidation
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  revalidatePath(`/pillars/${data.pillar}`);

  return NextResponse.json({
    article: data,
    revalidated: true,
  });
}
