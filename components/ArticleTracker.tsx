"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

interface ArticleTrackerProps {
  articleId: string;
  slug: string;
}

export function ArticleTracker({ articleId }: ArticleTrackerProps) {
  const sentPageView = useRef(false);
  const maxScroll = useRef(0);
  const readTime = useRef(0);
  const visible = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const sentFinal = useRef(false);

  useEffect(() => {
    // Page view — once per mount
    if (!sentPageView.current) {
      sentPageView.current = true;
      track([{ type: "page_view", articleId }]);
    }

    // Scroll tracking (throttled)
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const pct = Math.round((scrollTop / docHeight) * 100);
          if (pct > maxScroll.current) {
            maxScroll.current = pct;
          }
        }
      }, 500);
    };

    // Read time with Visibility API
    const handleVisibility = () => {
      visible.current = document.visibilityState === "visible";
    };

    timerRef.current = setInterval(() => {
      if (visible.current) {
        readTime.current += 1;
      }
    }, 1000);

    // Send final data on unload
    const sendFinal = () => {
      if (sentFinal.current) return;
      sentFinal.current = true;

      const events = [];
      if (readTime.current > 0) {
        events.push({ type: "read_time" as const, articleId, value: readTime.current });
      }
      if (maxScroll.current > 0) {
        events.push({ type: "scroll_depth" as const, articleId, value: maxScroll.current });
      }
      if (events.length > 0) {
        track(events, true); // useBeacon
      }
    };

    const handleBeforeUnload = () => sendFinal();
    const handleVisibilityUnload = () => {
      if (document.visibilityState === "hidden") sendFinal();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityUnload);

    // Listen for share events
    const handleShare = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      track([{
        type: "share_click",
        articleId,
        value: 1,
        metadata: { platform: detail?.platform ?? "unknown" },
      }]);
    };
    document.addEventListener("verso:share", handleShare);

    return () => {
      clearTimeout(scrollTimeout);
      clearInterval(timerRef.current);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityUnload);
      document.removeEventListener("verso:share", handleShare);
    };
  }, [articleId]);

  return null;
}
