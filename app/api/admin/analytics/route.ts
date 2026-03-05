import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  const { searchParams } = new URL(request.url);
  const period = parseInt(searchParams.get("period") ?? "30", 10);
  const articleId = searchParams.get("articleId") ?? undefined;

  // Summary per article
  const { data: summary } = await supabase.rpc("get_analytics_summary", {
    p_days: period,
  });

  // Trend data (all articles or specific one)
  const { data: trend } = await supabase.rpc("get_analytics_trend", {
    p_article_id: articleId ?? null,
    p_days: period,
  });

  // Totals
  const totals = (summary ?? []).reduce(
    (acc: { views: number; uniqueVisitors: number; avgReadTime: number; shares: number; count: number }, row: { total_views: number; total_unique_visitors: number; avg_read_time: number | null; total_shares: number }) => ({
      views: acc.views + (row.total_views ?? 0),
      uniqueVisitors: acc.uniqueVisitors + (row.total_unique_visitors ?? 0),
      avgReadTime: acc.avgReadTime + (row.avg_read_time ?? 0),
      shares: acc.shares + (row.total_shares ?? 0),
      count: acc.count + 1,
    }),
    { views: 0, uniqueVisitors: 0, avgReadTime: 0, shares: 0, count: 0 }
  );

  if (totals.count > 0) {
    totals.avgReadTime = Math.round(totals.avgReadTime / totals.count);
  }

  return NextResponse.json({
    summary: summary ?? [],
    trend: trend ?? [],
    totals,
  });
}
