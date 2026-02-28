import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LocaleProvider } from "@/components/LocaleProvider";

export const metadata: Metadata = {
  title: {
    default: "Verso by exímIA",
    template: "%s | Verso",
  },
  description:
    "Pesquisa verificada sobre como IA está redefinindo estratégia, negócios e mercados. Para quem decide, não para quem assiste.",
  authors: [{ name: "exímIA" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Verso by exímIA",
    title: "Verso by exímIA",
    description:
      "Pesquisa verificada sobre como IA está redefinindo estratégia, negócios e mercados.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
          <LocaleProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
