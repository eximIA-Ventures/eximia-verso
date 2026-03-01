import { ImageResponse } from "next/og";

export const alt = "Verso by exímIA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
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

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "white",
            }}
          >
            V
          </div>
          <span
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Verso
          </span>
          <span
            style={{
              fontSize: 20,
              color: "#a78bfa",
              fontWeight: 500,
              marginLeft: 4,
            }}
          >
            by exímIA
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 24,
            color: "#a0a0b0",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Pesquisa verificada sobre como IA está redefinindo estratégia, negócios e mercados.
        </p>

        {/* Bottom tag */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            gap: 24,
            fontSize: 14,
            color: "#6366f1",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
          }}
        >
          <span>IA & Estratégia</span>
          <span style={{ color: "#444" }}>|</span>
          <span>Negócios</span>
          <span style={{ color: "#444" }}>|</span>
          <span>Tecnologia</span>
          <span style={{ color: "#444" }}>|</span>
          <span>Mercados</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
