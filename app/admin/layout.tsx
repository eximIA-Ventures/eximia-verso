"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Image,
  LogOut,
  ExternalLink,
  Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EximiaLogoFull } from "@/components/EximiaLogoFull";

const NAV_ITEMS = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/articles", label: "Artigos", icon: FileText },
  { href: "/admin/media", label: "Media", icon: Image },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-border bg-surface">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/admin" className="flex items-center gap-2.5 group">
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
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-elevated hover:text-primary"
                }`}
              >
                <item.icon size={16} />
                {item.label}
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
              Ver site
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
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6">{children}</main>
    </div>
  );
}
