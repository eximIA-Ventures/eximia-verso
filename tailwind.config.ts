import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        elevated: "rgb(var(--c-elevated) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "accent-alt": "rgb(var(--c-accent-alt) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgb(var(--c-primary))",
            "--tw-prose-headings": "rgb(var(--c-primary))",
            "--tw-prose-links": "rgb(var(--c-accent))",
            "--tw-prose-bold": "rgb(var(--c-primary))",
            "--tw-prose-quotes": "rgb(var(--c-muted))",
            "--tw-prose-code": "rgb(var(--c-accent))",
            "--tw-prose-hr": "rgb(var(--c-border))",
            "--tw-prose-th-borders": "rgb(var(--c-border))",
            "--tw-prose-td-borders": "rgb(var(--c-border))",
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
