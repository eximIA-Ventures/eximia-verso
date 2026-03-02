"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import { Search, Download, Trash2, Users } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export default function SubscribersPage() {
  const { t } = useLocale();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();

  async function loadSubscribers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, subscribed_at")
      .order("subscribed_at", { ascending: false });

    if (error) {
      toast.error(t("admin.subscribers.loadError"));
      setLoading(false);
      return;
    }
    setSubscribers((data ?? []) as Subscriber[]);
    setLoading(false);
  }

  useEffect(() => {
    loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = subscribers.filter((s) =>
    search ? s.email.toLowerCase().includes(search.toLowerCase()) : true
  );

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remover ${email} da lista?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(t("admin.subscribers.removeError"));
      return;
    }

    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    toast.success(t("admin.subscribers.removed"));
  }

  function exportCSV() {
    const header = "email,subscribed_at";
    const rows = subscribers.map(
      (s) => `${s.email},${new Date(s.subscribed_at).toISOString()}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${subscribers.length} ${t("admin.subscribers.exported")}`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {t("admin.subscribers")}
          </h1>
          <p className="text-sm text-muted">
            {subscribers.length} {t("admin.subscribers.count")}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-primary transition-colors hover:bg-elevated disabled:opacity-50"
        >
          <Download size={14} />
          {t("admin.subscribers.export")}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.subscribers.search")}
          className="w-full rounded-lg border border-border bg-surface py-2 pl-8 pr-3 text-sm text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="px-4 py-16 text-center text-sm text-muted">
            {t("admin.subscribers.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16">
            <Users size={24} className="text-muted" />
            <p className="text-sm text-muted">
              {subscribers.length === 0
                ? t("admin.subscribers.empty")
                : t("admin.subscribers.noResults")}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("admin.subscribers.colEmail")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("admin.subscribers.colDate")}
                </th>
                <th className="px-4 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-elevated"
                >
                  <td className="px-4 py-3 text-sm">{s.email}</td>
                  <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(s.id, s.email)}
                      className="rounded p-1 text-muted transition-colors hover:text-red-400"
                      title={t("admin.subscribers.remove")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
