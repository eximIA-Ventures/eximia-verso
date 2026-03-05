"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TrendPoint {
  day: string;
  views: number;
  unique_visitors: number;
  avg_read_time: number | null;
  shares: number;
}

interface AnalyticsChartProps {
  data: TrendPoint[];
  labels: {
    views: string;
    uniqueVisitors: string;
    avgReadTime: string;
    shares: string;
  };
}

export function AnalyticsChart({ data, labels }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted">
        Sem dados para o periodo selecionado.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    dayLabel: new Date(d.day + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-accent, #6366f1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-accent, #6366f1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #333)" vertical={false} />
        <XAxis
          dataKey="dayLabel"
          tick={{ fill: "var(--color-muted, #888)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-muted, #888)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface, #1a1a1a)",
            border: "1px solid var(--color-border, #333)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--color-primary, #fff)", fontWeight: 600, marginBottom: 4 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={((value: any, name: any) => {
            const label =
              name === "views" ? labels.views
              : name === "unique_visitors" ? labels.uniqueVisitors
              : name === "shares" ? labels.shares
              : String(name ?? "");
            return [value ?? 0, label];
          }) as never}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="var(--color-accent, #6366f1)"
          strokeWidth={2}
          fill="url(#viewsGrad)"
          name="views"
        />
        <Area
          type="monotone"
          dataKey="unique_visitors"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#visitorsGrad)"
          name="unique_visitors"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
