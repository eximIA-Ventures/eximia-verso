import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getServerLocale } from "@/lib/get-server-locale";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();

  const descriptions: Record<string, string> = {
    pt: "Pesquisa verificada sobre como IA está redefinindo estratégia, negócios e mercados. Para quem decide, não para quem assiste.",
    en: "Verified research on how AI is reshaping strategy, business and markets. For those who decide, not those who watch.",
    es: "Investigación verificada sobre cómo la IA está redefiniendo estrategia, negocios y mercados. Para quien decide, no para quien mira.",
  };

  const ogLocales: Record<string, string> = {
    pt: "pt_BR",
    en: "en_US",
    es: "es_ES",
  };

  const description = descriptions[locale];

  return {
    metadataBase: new URL("https://verso.eximiaventures.com.br"),
    title: {
      default: "Verso by exímIA",
      template: "%s | Verso",
    },
    description,
    authors: [{ name: "Hugo Capitelli" }],
    openGraph: {
      type: "website",
      locale: ogLocales[locale],
      siteName: "Verso by exímIA",
      title: "Verso by exímIA",
      description,
      url: "https://verso.eximiaventures.com.br",
    },
    twitter: {
      card: "summary_large_image",
      title: "Verso by exímIA",
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const htmlLang = locale === "pt" ? "pt-BR" : locale;

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-primary font-body antialiased">
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <Header />
            <main>{children}</main>
            <Footer />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
