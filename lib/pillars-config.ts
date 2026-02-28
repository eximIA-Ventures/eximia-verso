import type { Pillar } from "./types";

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
    id: "agribusiness",
    name: "Agronegócio & Inovação",
    description:
      "Onde tecnologia encontra o campo. AgTech, dados no agro e o futuro da cadeia produtiva.",
    icon: "wheat",
    color: "green",
  },
];

export function getPillarById(id: string): Pillar | undefined {
  return PILLARS.find((p) => p.id === id);
}
