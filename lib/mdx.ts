import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeExternalLinks from "rehype-external-links";
import GithubSlugger from "github-slugger";
import type { ReactElement } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugger.slug(text);
    items.push({ id, text, level });
  }
  return items;
}

export async function renderMDX(source: string): Promise<ReactElement> {
  try {
    const { content } = await compileMDX({
      source,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeExternalLinks,
              { target: "_blank", rel: ["noopener", "noreferrer"] },
            ],
            [
              rehypePrettyCode,
              {
                theme: "one-dark-pro",
                keepBackground: true,
              },
            ],
          ],
        },
      },
    });
    return content;
  } catch (err) {
    console.error("[Verso] MDX render error:", err);
    const React = await import("react");
    return React.createElement(
      "div",
      { className: "rounded-md border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400" },
      React.createElement("p", { className: "font-semibold mb-2" }, "Erro ao renderizar conteudo"),
      React.createElement("p", { className: "text-muted" }, "O conteudo MDX deste artigo contem um erro de sintaxe. Edite o artigo no painel admin para corrigir."),
    );
  }
}
