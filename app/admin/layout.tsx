"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Image,
  LogOut,
  ExternalLink,
  Home,
  Users,
  UserPen,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EximiaLogoFull } from "@/components/EximiaLogoFull";
import { ToastProvider } from "@/components/admin/Toast";
import { useLocale } from "@/components/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

const NAV_ITEMS: { href: string; labelKey: TranslationKey; icon: typeof Home }[] = [
  { href: "/admin", labelKey: "admin.dashboard", icon: Home },
  { href: "/admin/articles", labelKey: "admin.nav.articles", icon: FileText },
  { href: "/admin/authors", labelKey: "admin.nav.authors", icon: UserPen },
  { href: "/admin/media", labelKey: "admin.nav.media", icon: Image },
  { href: "/admin/subscribers", labelKey: "admin.nav.subscribers", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
    return (
      <>
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-2.5 group" onClick={onNavClick}>
            <span className="text-sm font-semibold uppercase tracking-[0.25em]">
              Verso
            </span>
            <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted">
              by
            </span>
            <EximiaLogoFull height={11} className="text-muted transition-colors group-hover:text-primary" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-elevated hover:text-primary"
                }`}
              >
                <item.icon size={16} />
                {t(item.labelKey)}
              </Link>
            );
          })}

          {/* Separador + Ver site */}
          <div className="!mt-3 border-t border-border/50 pt-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-primary"
            >
              <ExternalLink size={16} />
              {t("admin.nav.viewSite")}
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-primary"
          >
            <LogOut size={16} />
            {t("admin.nav.logout")}
          </button>
        </div>
      </>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface md:flex">
          <SidebarContent />
        </aside>

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-3 top-3 z-40 rounded-md border border-border bg-surface p-2 text-muted md:hidden"
          aria-label={t("admin.nav.openMenu")}
        >
          <Menu size={20} />
        </button>

        {/* Mobile overlay sidebar */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar panel */}
            <aside className="fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-surface md:hidden animate-in slide-in-from-left duration-200">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-2 top-3 rounded-md p-1.5 text-muted hover:text-primary"
                aria-label={t("admin.nav.closeMenu")}
              >
                <X size={18} />
              </button>
              <SidebarContent onNavClick={() => setSidebarOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 p-6 pt-14 md:ml-56 md:pt-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
