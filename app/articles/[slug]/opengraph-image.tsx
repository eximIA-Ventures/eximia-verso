import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const alt = "Verso by exímIA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ArticleOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createAdminClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, pillar, author, hero_image, article_authors(position, authors(name, avatar_url))")
    .eq("slug", slug)
    .single();

  const title = article?.title ?? "Verso by exímIA";
  const excerpt = article?.excerpt ?? "";
  const pillar = article?.pillar ?? "";
  const heroImage = article?.hero_image ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articleAuthors = ((article as any)?.article_authors ?? [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((aa: any) => aa.authors) as { name: string; avatar_url: string | null }[];

  const author = articleAuthors.length > 0
    ? articleAuthors.map((a) => a.name).join(", ")
    : (article?.author ?? "Hugo Capitelli");

  const pillarLabels: Record<string, string> = {
    "ai-strategy": "IA & Estratégia",
    business: "Negócios & Empreendedorismo",
    technology: "Tecnologia",
    "market-trends": "Tendências de Mercado",
  };

  const pillarLabel = pillarLabels[pillar] ?? pillar;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
          padding: 60,
          position: "relative",
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        {/* Hero image background */}
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark overlay for readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: heroImage
              ? "linear-gradient(135deg, rgba(10,10,10,0.88) 0%, rgba(26,26,46,0.82) 50%, rgba(22,33,62,0.85) 100%)"
              : "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          }}
        />

        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            flex: 1,
          }}
        >
          {/* Top: Pillar tag */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                fontSize: 14,
                color: "#a78bfa",
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                fontWeight: 600,
                background: "rgba(0,0,0,0.4)",
                padding: "6px 12px",
                borderRadius: 6,
              }}
            >
              {pillarLabel}
            </div>
          </div>

          {/* Center: Title + Excerpt */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              flex: 1,
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 80 ? 36 : title.length > 50 ? 42 : 48,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                margin: 0,
                maxWidth: 1000,
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </h1>
            {excerpt && (
              <p
                style={{
                  fontSize: 20,
                  color: "#d0d0e0",
                  lineHeight: 1.5,
                  margin: 0,
                  maxWidth: 800,
                  textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                }}
              >
                {excerpt.length > 120 ? excerpt.slice(0, 120) + "..." : excerpt}
              </p>
            )}
          </div>

          {/* Bottom: Author + Brand */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {(articleAuthors.length > 0 ? articleAuthors.slice(0, 3) : [{ name: author, avatar_url: null }]).map((a, i) => (
                  <div
                    key={i}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "white",
                      marginLeft: i > 0 ? -8 : 0,
                      border: "2px solid #0a0a0a",
                      overflow: "hidden",
                    }}
                  >
                    {a.avatar_url ? (
                      <img src={a.avatar_url} alt="" width={36} height={36} style={{ objectFit: "cover" }} />
                    ) : (
                      a.name.charAt(0)
                    )}
                  </div>
                ))}
              </div>
              <span
                style={{
                  fontSize: 16,
                  color: "#e0e0e0",
                  fontWeight: 500,
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {author}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                V
              </div>
              <span
                style={{
                  fontSize: 16,
                  color: "#aaa",
                  fontWeight: 500,
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                verso.eximiaventures.com.br
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
