import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface TrackEventPayload {
  type: "page_view" | "read_time" | "scroll_depth" | "share_click";
  articleId: string;
  visitorId: string;
  sessionId: string;
  value?: number;
  metadata?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events: TrackEventPayload[] = body.events;

    if (!Array.isArray(events) || events.length === 0 || events.length > 20) {
      return NextResponse.json({ error: "Invalid events" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Extract country from headers (Vercel/Cloudflare)
    const country =
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      null;

    const referrer = request.headers.get("referer") ?? null;

    for (const event of events) {
      if (!event.articleId || !event.visitorId || !event.sessionId) continue;

      if (event.type === "page_view") {
        await supabase.rpc("record_page_view", {
          p_article_id: event.articleId,
          p_visitor_id: event.visitorId,
          p_session_id: event.sessionId,
          p_referrer: referrer,
          p_country: country,
        });
      } else {
        await supabase.rpc("record_engagement", {
          p_article_id: event.articleId,
          p_visitor_id: event.visitorId,
          p_session_id: event.sessionId,
          p_event_type: event.type,
          p_value: event.value ?? 0,
          p_metadata: event.metadata ?? null,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
