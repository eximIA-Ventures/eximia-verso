export type Locale = "pt" | "en" | "es";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const translations = {
  pt: {
    // Header
    "nav.insights": "Insights",
    "nav.manifesto": "Manifesto",

    // Hero
    "hero.tagline": "Verso by exímIA",
    "hero.title.line1": "A perspectiva que",
    "hero.title.line2": "falta no seu feed.",
    "hero.subtitle":
      "Pesquisa verificada sobre IA aplicada a estratégia, negócios e mercados. Para quem decide, não para quem assiste.",

    // Insights page
    "insights.label": "Biblioteca",
    "insights.title": "Insights",
    "insights.description":
      "Pesquisa verificada para quem decide. Cada insight é construído sobre dados com fonte, não sobre o consenso confortável do feed.",
    "insights.search": "Buscar insights...",
    "insights.sort.newest": "Mais recentes",
    "insights.sort.oldest": "Mais antigos",
    "insights.sort.reading": "Tempo de leitura",
    "insights.all": "Todos",
    "insights.empty.search": "Nenhum insight encontrado para essa busca.",
    "insights.empty.pillar": "Território em construção. Primeiros insights em breve.",
    "insights.empty.default": "Os bastidores estão em movimento.",
    "insights.read": "Ler insight",
    "insights.featured": "Em destaque",
    "insights.recent": "Insights recentes",
    "insights.viewAll": "Ver todos",
    "insights.count_one": "insight",
    "insights.count_other": "insights",

    // Article
    "article.share": "Compartilhar",
    "article.sources": "Verificação",
    "article.share.copied": "Copiado!",
    "article.share.instagram": "Instagram Stories",
    "article.share.instaCopied": "Link copiado! Cole no Stories",
    "article.share.copyLink": "Copiar link",
    "article.min": "min",

    // Footer
    "footer.description":
      "Pesquisa verificada sobre IA aplicada a negócios, estratégia e mercados. Cada dado tem fonte. Cada opinião tem fundamento.",
    "footer.nav": "Navegação",
    "footer.social": "Social",
    "footer.rights": "Todos os direitos reservados.",

    // 404
    "notFound.title": "Você encontrou o limite do mapa",
    "notFound.description":
      "Esta página não existe — mas as que existem foram escritas com mais cuidado do que a maioria.",
    "notFound.back": "Voltar ao início",

    // Error
    "error.label": "Erro",
    "error.title": "Algo saiu do previsto",
    "error.description": "Um erro inesperado ocorreu. Tente recarregar a página ou voltar ao início.",
    "error.retry": "Tentar novamente",
    "error.back": "Voltar ao início",

    // Admin
    "admin.login.error": "Credenciais inválidas.",

    // About
    "about.tagline": "Manifesto",
    "about.title": "Por que Verso existe",
    "about.cta": "Acompanhe onde você já está.",

    // Newsletter
    "newsletter.tagline": "Fique à frente",
    "newsletter.title": "Receba os próximos insights antes de todo mundo.",
    "newsletter.description":
      "Pesquisa verificada sobre IA, negócios e estratégia direto no seu email. Sem hype. Sem press release reciclado.",
    "newsletter.placeholder": "Seu melhor email",
    "newsletter.cta": "Assinar",
    "newsletter.success": "Bem-vindo ao Verso.",
    "newsletter.error": "Algo deu errado. Tente novamente.",
    "newsletter.duplicate": "Você já faz parte.",

    // Why Verso
    "why.title": "Por que Verso",
    "why.research.title": "Pesquisa verificada",
    "why.research.description":
      "Cada dado tem fonte. Cada número é rastreável. Nada de achismo disfarçado de insight.",
    "why.decision.title": "Decisão, não informação",
    "why.decision.description":
      "Escrevemos para quem precisa agir, não para quem quer apenas se manter atualizado.",
    "why.territory.title": "Quatro territórios",
    "why.territory.description":
      "IA & estratégia, negócios, tecnologia e mercado — pela lente de quem decide.",

    // Methodology
    "method.title": "Como pesquisamos",
    "method.step1": "Fontes primárias",
    "method.step2": "Dados verificados",
    "method.step3": "Perspectivas cruzadas",
    "method.step4": "Posição fundamentada",

    // Pillar pages
    "pillars.back": "Todos os insights",
    "pillars.empty": "Território em exploração. Primeiros insights em breve.",
  },
  en: {
    "nav.insights": "Insights",
    "nav.manifesto": "Manifesto",

    "hero.tagline": "Verso by exímIA",
    "hero.title.line1": "The perspective",
    "hero.title.line2": "missing from your feed.",
    "hero.subtitle":
      "Verified research on AI applied to strategy, business and markets. For those who decide, not those who watch.",

    "insights.label": "Library",
    "insights.title": "Insights",
    "insights.description":
      "Verified research for decision-makers. Each insight is built on sourced data, not on the comfortable consensus of your feed.",
    "insights.search": "Search insights...",
    "insights.sort.newest": "Newest",
    "insights.sort.oldest": "Oldest",
    "insights.sort.reading": "Reading time",
    "insights.all": "All",
    "insights.empty.search": "No insights found for this search.",
    "insights.empty.pillar": "Territory under construction. First insights coming soon.",
    "insights.empty.default": "Behind the scenes, things are in motion.",
    "insights.read": "Read insight",
    "insights.featured": "Featured",
    "insights.recent": "Recent insights",
    "insights.viewAll": "View all",
    "insights.count_one": "insight",
    "insights.count_other": "insights",

    "article.share": "Share",
    "article.sources": "Sources",
    "article.share.copied": "Copied!",
    "article.share.instagram": "Instagram Stories",
    "article.share.instaCopied": "Link copied! Paste in Stories",
    "article.share.copyLink": "Copy link",
    "article.min": "min",

    "footer.description":
      "Verified research on AI applied to business, strategy and markets. Every data point has a source. Every opinion has a foundation.",
    "footer.nav": "Navigation",
    "footer.social": "Social",
    "footer.rights": "All rights reserved.",

    "notFound.title": "You've reached the edge of the map",
    "notFound.description":
      "This page doesn't exist — but the ones that do were written with more care than most.",
    "notFound.back": "Back to home",

    "error.label": "Error",
    "error.title": "Something went wrong",
    "error.description": "An unexpected error occurred. Try reloading the page or go back home.",
    "error.retry": "Try again",
    "error.back": "Back to home",

    "admin.login.error": "Invalid credentials.",

    "about.tagline": "Manifesto",
    "about.title": "Why Verso exists",
    "about.cta": "Follow where you already are.",

    "newsletter.tagline": "Stay ahead",
    "newsletter.title": "Get the next insights before everyone else.",
    "newsletter.description":
      "Verified research on AI, business and strategy straight to your inbox. No hype. No recycled press releases.",
    "newsletter.placeholder": "Your best email",
    "newsletter.cta": "Subscribe",
    "newsletter.success": "Welcome to Verso.",
    "newsletter.error": "Something went wrong. Try again.",
    "newsletter.duplicate": "You're already in.",

    "why.title": "Why Verso",
    "why.research.title": "Verified research",
    "why.research.description":
      "Every data point has a source. Every number is traceable. No guesswork disguised as insight.",
    "why.decision.title": "Decision, not information",
    "why.decision.description":
      "We write for those who need to act, not for those who just want to stay updated.",
    "why.territory.title": "Four territories",
    "why.territory.description":
      "AI & strategy, business, technology and markets — through the lens of decision-makers.",

    "method.title": "How we research",
    "method.step1": "Primary sources",
    "method.step2": "Verified data",
    "method.step3": "Cross-checked perspectives",
    "method.step4": "Grounded position",

    "pillars.back": "All insights",
    "pillars.empty": "Territory under exploration. First insights coming soon.",
  },
  es: {
    "nav.insights": "Insights",
    "nav.manifesto": "Manifiesto",

    "hero.tagline": "Verso by exímIA",
    "hero.title.line1": "La perspectiva que",
    "hero.title.line2": "falta en tu feed.",
    "hero.subtitle":
      "Investigación verificada sobre IA aplicada a estrategia, negocios y mercados. Para quien decide, no para quien mira.",

    "insights.label": "Biblioteca",
    "insights.title": "Insights",
    "insights.description":
      "Investigación verificada para quienes deciden. Cada insight se construye sobre datos con fuente, no sobre el consenso cómodo del feed.",
    "insights.search": "Buscar insights...",
    "insights.sort.newest": "Más recientes",
    "insights.sort.oldest": "Más antiguos",
    "insights.sort.reading": "Tiempo de lectura",
    "insights.all": "Todos",
    "insights.empty.search": "No se encontraron insights para esta búsqueda.",
    "insights.empty.pillar": "Territorio en construcción. Primeros insights próximamente.",
    "insights.empty.default": "Detrás de escena, las cosas se mueven.",
    "insights.read": "Leer insight",
    "insights.featured": "Destacado",
    "insights.recent": "Insights recientes",
    "insights.viewAll": "Ver todos",
    "insights.count_one": "insight",
    "insights.count_other": "insights",

    "article.share": "Compartir",
    "article.sources": "Verificación",
    "article.share.copied": "¡Copiado!",
    "article.share.instagram": "Instagram Stories",
    "article.share.instaCopied": "¡Link copiado! Pégalo en Stories",
    "article.share.copyLink": "Copiar link",
    "article.min": "min",

    "footer.description":
      "Investigación verificada sobre IA aplicada a negocios, estrategia y mercados. Cada dato tiene fuente. Cada opinión tiene fundamento.",
    "footer.nav": "Navegación",
    "footer.social": "Social",
    "footer.rights": "Todos los derechos reservados.",

    "notFound.title": "Encontraste el límite del mapa",
    "notFound.description":
      "Esta página no existe — pero las que existen fueron escritas con más cuidado que la mayoría.",
    "notFound.back": "Volver al inicio",

    "error.label": "Error",
    "error.title": "Algo salió mal",
    "error.description": "Ocurrió un error inesperado. Intenta recargar la página o volver al inicio.",
    "error.retry": "Intentar de nuevo",
    "error.back": "Volver al inicio",

    "admin.login.error": "Credenciales inválidas.",

    "about.tagline": "Manifiesto",
    "about.title": "Por qué existe Verso",
    "about.cta": "Síguenos donde ya estás.",

    "newsletter.tagline": "Adelántate",
    "newsletter.title": "Recibe los próximos insights antes que todos.",
    "newsletter.description":
      "Investigación verificada sobre IA, negocios y estrategia directo a tu email. Sin hype. Sin notas de prensa recicladas.",
    "newsletter.placeholder": "Tu mejor email",
    "newsletter.cta": "Suscribirse",
    "newsletter.success": "Bienvenido a Verso.",
    "newsletter.error": "Algo salió mal. Inténtalo de nuevo.",
    "newsletter.duplicate": "Ya eres parte.",

    "why.title": "Por qué Verso",
    "why.research.title": "Investigación verificada",
    "why.research.description":
      "Cada dato tiene fuente. Cada número es rastreable. Nada de suposiciones disfrazadas de insight.",
    "why.decision.title": "Decisión, no información",
    "why.decision.description":
      "Escribimos para quienes necesitan actuar, no para quienes solo quieren estar al día.",
    "why.territory.title": "Cuatro territorios",
    "why.territory.description":
      "IA y estrategia, negocios, tecnología y mercados — por la lente de quien decide.",

    "method.title": "Cómo investigamos",
    "method.step1": "Fuentes primarias",
    "method.step2": "Datos verificados",
    "method.step3": "Perspectivas cruzadas",
    "method.step4": "Posición fundamentada",

    "pillars.back": "Todos los insights",
    "pillars.empty": "Territorio en exploración. Primeros insights próximamente.",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["pt"];

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.pt[key] ?? key;
}
