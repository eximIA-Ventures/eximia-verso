import Anthropic from "@anthropic-ai/sdk";

interface TranslationResult {
  title: string;
  excerpt: string;
  content: string;
}

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish (Latin American)",
};

export async function translateArticle(
  article: { title: string; excerpt: string; content: string },
  targetLocale: "en" | "es"
): Promise<{ result: TranslationResult; model: string }> {
  const client = new Anthropic();
  const model = "claude-sonnet-4-20250514";
  const targetLanguage = LOCALE_NAMES[targetLocale];

  const message = await client.messages.create({
    model,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Translate the following article from Brazilian Portuguese to ${targetLanguage}.

RULES:
- Preserve ALL MDX/Markdown structure: headings (#, ##, ###), bold (**), italic (*), links [text](url), code blocks, images ![alt](url), lists, blockquotes
- Preserve technical terms, brand names, and proper nouns as-is (e.g., "exímIA", "Verso", API names)
- Use natural, editorial ${targetLanguage} — not literal translation. The tone should feel like it was originally written in ${targetLanguage}
- Keep the same level of formality as the original (professional, analytical)
- Do NOT add or remove content. Translate what exists
- Return ONLY a JSON object with keys: title, excerpt, content

ARTICLE TITLE:
${article.title}

ARTICLE EXCERPT:
${article.excerpt}

ARTICLE CONTENT:
${article.content}

Return the translation as a JSON object with keys "title", "excerpt", "content". No markdown code fence, just the raw JSON.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON from response — handle potential code fences
  const jsonStr = text
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(jsonStr) as TranslationResult;

  return { result: parsed, model };
}
