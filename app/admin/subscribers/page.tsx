"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/admin/Toast";
import { Search, Download, Trash2, Users } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export default function SubscribersPage() {
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
      toast.error("Erro ao carregar subscribers");
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
      toast.error("Erro ao remover subscriber");
      return;
    }

    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subscriber removido");
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
    toast.success(`${subscribers.length} subscribers exportados`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-muted">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-primary transition-colors hover:bg-elevated disabled:opacity-50"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email..."
          className="w-full rounded-lg border border-border bg-surface py-2 pl-8 pr-3 text-sm text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="px-4 py-16 text-center text-sm text-muted">
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16">
            <Users size={24} className="text-muted" />
            <p className="text-sm text-muted">
              {subscribers.length === 0
                ? "Nenhum subscriber ainda."
                : "Nenhum subscriber encontrado."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Inscrito em
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
                      title="Remover"
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
