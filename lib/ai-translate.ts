import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish (Latin American)",
};

const translationSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
});

export async function translateArticle(
  article: { title: string; excerpt: string; content: string },
  targetLocale: "en" | "es"
): Promise<{ result: z.infer<typeof translationSchema>; model: string }> {
  const modelId = "gpt-4o-mini";
  const targetLanguage = LOCALE_NAMES[targetLocale];

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const { object } = await generateObject({
    model: openai(modelId),
    schema: translationSchema,
    prompt: `Translate the following article from Brazilian Portuguese to ${targetLanguage}.

RULES:
- Preserve ALL MDX/Markdown structure: headings (#, ##, ###), bold (**), italic (*), links [text](url), code blocks, images ![alt](url), lists, blockquotes
- Preserve technical terms, brand names, and proper nouns as-is (e.g., "exímIA", "Verso", API names)
- Use natural, editorial ${targetLanguage} — not literal translation. The tone should feel like it was originally written in ${targetLanguage}
- Keep the same level of formality as the original (professional, analytical)
- Do NOT add or remove content. Translate what exists

ARTICLE TITLE:
${article.title}

ARTICLE EXCERPT:
${article.excerpt}

ARTICLE CONTENT:
${article.content}`,
  });

  return { result: object, model: modelId };
}
