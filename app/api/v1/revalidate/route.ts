import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// POST /api/v1/revalidate — on-demand ISR revalidation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug as string | undefined;

    // Revalidar páginas principais
    revalidatePath("/");
    revalidatePath("/articles");

    if (slug) {
      revalidatePath(`/articles/${slug}`);
    }

    // Revalidar todas as pillar pages
    const pillars = ["ai-strategy", "business", "technology", "agribusiness"];
    for (const p of pillars) {
      revalidatePath(`/pillars/${p}`);
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
