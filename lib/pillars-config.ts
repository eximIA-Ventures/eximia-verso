import type { Pillar } from "./types";
import type { Locale } from "./i18n";

export const PILLARS: Pillar[] = [
  {
    id: "ai-strategy",
    name: "IA & Estratégia",
    description:
      "Ferramentas mudam a cada trimestre. Vantagem competitiva não. Aqui, como direcionar IA com estratégia real.",
    icon: "brain",
    color: "accent",
  },
  {
    id: "business",
    name: "Negócios & Empreendedorismo",
    description:
      "Modelos de negócio, decisões sob incerteza e o que muda quando IA entra na equação.",
    icon: "bar-chart-3",
    color: "accent-alt",
  },
  {
    id: "technology",
    name: "Tecnologia & Inovação",
    description:
      "Tendências que importam, ferramentas que funcionam e como adotar inovação sem hype.",
    icon: "zap",
    color: "amber",
  },
  {
    id: "market-trends",
    name: "Mercado & Tendências",
    description:
      "Sinais de mercado, macrotendências e o que os dados dizem antes do consenso chegar.",
    icon: "trending-up",
    color: "green",
  },
];

const PILLAR_I18N: Record<string, Record<string, { name: string; description: string }>> = {
  "ai-strategy": {
    en: {
      name: "AI & Strategy",
      description: "Tools change every quarter. Competitive advantage doesn't. Here, how to direct AI with real strategy.",
    },
    es: {
      name: "IA & Estrategia",
      description: "Las herramientas cambian cada trimestre. La ventaja competitiva no. Aquí, cómo dirigir la IA con estrategia real.",
    },
  },
  business: {
    en: {
      name: "Business & Entrepreneurship",
      description: "Business models, decisions under uncertainty and what changes when AI enters the equation.",
    },
    es: {
      name: "Negocios & Emprendimiento",
      description: "Modelos de negocio, decisiones bajo incertidumbre y lo que cambia cuando la IA entra en la ecuación.",
    },
  },
  technology: {
    en: {
      name: "Technology & Innovation",
      description: "Trends that matter, tools that work and how to adopt innovation without hype.",
    },
    es: {
      name: "Tecnología & Innovación",
      description: "Tendencias que importan, herramientas que funcionan y cómo adoptar la innovación sin hype.",
    },
  },
  "market-trends": {
    en: {
      name: "Market & Trends",
      description: "Market signals, macro trends and what the data says before consensus arrives.",
    },
    es: {
      name: "Mercado & Tendencias",
      description: "Señales de mercado, macrotendencias y lo que dicen los datos antes de que llegue el consenso.",
    },
  },
};

export function getPillarById(id: string, locale: Locale = "pt"): Pillar | undefined {
  const pillar = PILLARS.find((p) => p.id === id);
  if (!pillar) return undefined;
  if (locale === "pt") return pillar;

  const i18n = PILLAR_I18N[id]?.[locale];
  if (!i18n) return pillar;

  return { ...pillar, name: i18n.name, description: i18n.description };
}

export function getPillarName(id: string, locale: Locale = "pt"): string {
  const pillar = getPillarById(id, locale);
  return pillar?.name ?? id;
}

export function getPillarDescription(id: string, locale: Locale = "pt"): string {
  const pillar = getPillarById(id, locale);
  return pillar?.description ?? "";
}
