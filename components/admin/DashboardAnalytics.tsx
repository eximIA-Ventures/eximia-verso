"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, Eye } from "lucide-react";
import { AnalyticsChart } from "./AnalyticsChart";
import type { AnalyticsSummary, AnalyticsTrendPoint, AnalyticsTotals } from "@/lib/types";

interface AnalyticsLabels {
  views: string;
  uniqueVisitors: string;
  avgReadTime: string;
  shares: string;
  trend: string;
  topArticles: string;
  period7: string;
  period30: string;
  period90: string;
}

interface DashboardAnalyticsProps {
  labels: AnalyticsLabels;
  articleTitles: Record<string, string>;
}

export function DashboardAnalytics({ labels, articleTitles }: DashboardAnalyticsProps) {
  const [period, setPeriod] = useState(30);
  const [summary, setSummary] = useState<AnalyticsSummary[]>([]);
  const [trend, setTrend] = useState<AnalyticsTrendPoint[]>([]);
  const [totals, setTotals] = useState<AnalyticsTotals>({ views: 0, uniqueVisitors: 0, avgReadTime: 0, shares: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary ?? []);
        setTrend(data.trend ?? []);
        setTotals(data.totals ?? { views: 0, uniqueVisitors: 0, avgReadTime: 0, shares: 0, count: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const topArticles = [...summary]
    .sort((a, b) => (b.total_views ?? 0) - (a.total_views ?? 0))
    .slice(0, 5);

  const formatReadTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* Analytics stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <Eye size={16} className="text-accent" />
            <span className="text-xs text-muted">{labels.views} ({period}d)</span>
          </div>
          <p className="text-2xl font-bold">{loading ? "—" : totals.views.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock size={16} className="text-green-400" />
            <span className="text-xs text-muted">{labels.avgReadTime}</span>
          </div>
          <p className="text-2xl font-bold">{loading ? "—" : formatReadTime(totals.avgReadTime)}</p>
        </div>
      </div>

      {/* Trend chart */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-muted" />
            <h3 className="text-sm font-medium">{labels.trend}</h3>
          </div>
          <div className="flex gap-1 rounded-lg border border-border bg-bg p-0.5">
            {([
              { value: 7, label: labels.period7 },
              { value: 30, label: labels.period30 },
              { value: 90, label: labels.period90 },
            ]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  period === value
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted">...</div>
        ) : (
          <AnalyticsChart
            data={trend as AnalyticsTrendPoint[]}
            labels={{
              views: labels.views,
              uniqueVisitors: labels.uniqueVisitors,
              avgReadTime: labels.avgReadTime,
              shares: labels.shares,
            }}
          />
        )}
      </div>

      {/* Top articles */}
      {topArticles.length > 0 && (
        <div className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-medium">{labels.topArticles}</h3>
          </div>
          <div className="divide-y divide-border">
            {topArticles.map((item, i) => (
              <div key={item.article_id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted w-4">{i + 1}</span>
                  <span className="text-sm truncate">
                    {articleTitles[item.article_id] ?? item.article_id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-xs text-muted">
                  <span>{item.total_views?.toLocaleString() ?? 0} views</span>
                  {item.avg_read_time != null && item.avg_read_time > 0 && (
                    <span>{formatReadTime(Math.round(item.avg_read_time))}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
