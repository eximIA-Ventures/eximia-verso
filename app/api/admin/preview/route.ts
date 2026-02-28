import { NextRequest, NextResponse } from "next/server";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ html: "" });
    }

    // Strip MDX-specific syntax (imports, JSX components) for preview
    const cleaned = content
      .replace(/^import\s+.*$/gm, "")
      .replace(/<[A-Z][A-Za-z]*\s*\/>/g, "")
      .replace(/<[A-Z][A-Za-z]*[^>]*>[\s\S]*?<\/[A-Z][A-Za-z]*>/g, "");

    const result = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(cleaned);

    return NextResponse.json({ html: String(result) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao compilar MDX";
    return NextResponse.json(
      { html: `<p style="color:#f87171">Erro de sintaxe: ${message}</p>` },
      { status: 200 }
    );
  }
}
