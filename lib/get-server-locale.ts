import { cookies } from "next/headers";
import type { Locale } from "./i18n";

const VALID_LOCALES: Locale[] = ["pt", "en", "es"];

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("verso-locale")?.value;
  if (raw && VALID_LOCALES.includes(raw as Locale)) {
    return raw as Locale;
  }
  return "pt";
}
