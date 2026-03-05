-- Analytics tables + RPC functions for Verso Content Platform
-- Dual-table: raw event log + daily aggregates for fast queries

-- 1. Raw page views
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  referrer text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_article ON page_views(article_id);
CREATE INDEX idx_page_views_created ON page_views(created_at);

-- 2. Engagement events (read_time, scroll_depth, share_click)
CREATE TABLE IF NOT EXISTS engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('read_time', 'scroll_depth', 'share_click')),
  value numeric NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_engagement_article ON engagement_events(article_id);
CREATE INDEX idx_engagement_type ON engagement_events(event_type);

-- 3. Daily aggregates
CREATE TABLE IF NOT EXISTS article_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  day date NOT NULL,
  views int NOT NULL DEFAULT 0,
  unique_visitors int NOT NULL DEFAULT 0,
  avg_read_time numeric NOT NULL DEFAULT 0,
  avg_scroll_depth numeric NOT NULL DEFAULT 0,
  shares int NOT NULL DEFAULT 0,
  UNIQUE(article_id, day)
);

CREATE INDEX idx_analytics_daily_article ON article_analytics_daily(article_id);
CREATE INDEX idx_analytics_daily_day ON article_analytics_daily(day);

-- RLS: raw tables blocked for anon, daily readable by authenticated
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_analytics_daily ENABLE ROW LEVEL SECURITY;

-- No public/anon policies on raw tables — only service role can write
-- Daily aggregates readable by authenticated users (admin panel)
CREATE POLICY "Authenticated read daily analytics"
  ON article_analytics_daily FOR SELECT
  TO authenticated
  USING (true);

-- RPC: record_page_view
CREATE OR REPLACE FUNCTION record_page_view(
  p_article_id uuid,
  p_visitor_id text,
  p_session_id text,
  p_referrer text DEFAULT NULL,
  p_country text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_is_unique boolean;
BEGIN
  -- Check if this visitor already viewed today BEFORE inserting
  SELECT NOT EXISTS (
    SELECT 1 FROM page_views
    WHERE article_id = p_article_id
      AND visitor_id = p_visitor_id
      AND created_at::date = v_today
    LIMIT 1
  ) INTO v_is_unique;

  -- Insert raw event
  INSERT INTO page_views (article_id, visitor_id, session_id, referrer, country)
  VALUES (p_article_id, p_visitor_id, p_session_id, p_referrer, p_country);

  -- Upsert daily aggregate
  INSERT INTO article_analytics_daily (article_id, day, views, unique_visitors)
  VALUES (p_article_id, v_today, 1, CASE WHEN v_is_unique THEN 1 ELSE 0 END)
  ON CONFLICT (article_id, day)
  DO UPDATE SET
    views = article_analytics_daily.views + 1,
    unique_visitors = article_analytics_daily.unique_visitors + CASE WHEN v_is_unique THEN 1 ELSE 0 END;
END;
$$;

-- RPC: record_engagement
CREATE OR REPLACE FUNCTION record_engagement(
  p_article_id uuid,
  p_visitor_id text,
  p_session_id text,
  p_event_type text,
  p_value numeric,
  p_metadata jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_avg numeric;
  v_count int;
BEGIN
  -- Insert raw event
  INSERT INTO engagement_events (article_id, visitor_id, session_id, event_type, value, metadata)
  VALUES (p_article_id, p_visitor_id, p_session_id, p_event_type, p_value, p_metadata);

  -- Update daily aggregate based on event type
  IF p_event_type = 'read_time' THEN
    SELECT AVG(value), COUNT(*) INTO v_avg, v_count
    FROM engagement_events
    WHERE article_id = p_article_id
      AND event_type = 'read_time'
      AND created_at::date = v_today;

    INSERT INTO article_analytics_daily (article_id, day, avg_read_time)
    VALUES (p_article_id, v_today, v_avg)
    ON CONFLICT (article_id, day)
    DO UPDATE SET avg_read_time = v_avg;

  ELSIF p_event_type = 'scroll_depth' THEN
    SELECT AVG(value), COUNT(*) INTO v_avg, v_count
    FROM engagement_events
    WHERE article_id = p_article_id
      AND event_type = 'scroll_depth'
      AND created_at::date = v_today;

    INSERT INTO article_analytics_daily (article_id, day, avg_scroll_depth)
    VALUES (p_article_id, v_today, v_avg)
    ON CONFLICT (article_id, day)
    DO UPDATE SET avg_scroll_depth = v_avg;

  ELSIF p_event_type = 'share_click' THEN
    INSERT INTO article_analytics_daily (article_id, day, shares)
    VALUES (p_article_id, v_today, 1)
    ON CONFLICT (article_id, day)
    DO UPDATE SET shares = article_analytics_daily.shares + 1;
  END IF;
END;
$$;

-- RPC: get_analytics_summary (for dashboard)
CREATE OR REPLACE FUNCTION get_analytics_summary(p_days int DEFAULT 30)
RETURNS TABLE (
  article_id uuid,
  total_views bigint,
  total_unique_visitors bigint,
  avg_read_time numeric,
  avg_scroll_depth numeric,
  total_shares bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    d.article_id,
    SUM(d.views)::bigint AS total_views,
    SUM(d.unique_visitors)::bigint AS total_unique_visitors,
    ROUND(AVG(NULLIF(d.avg_read_time, 0)), 1) AS avg_read_time,
    ROUND(AVG(NULLIF(d.avg_scroll_depth, 0)), 1) AS avg_scroll_depth,
    SUM(d.shares)::bigint AS total_shares
  FROM article_analytics_daily d
  WHERE d.day >= CURRENT_DATE - p_days
  GROUP BY d.article_id;
$$;

-- RPC: get_analytics_trend (for charts)
CREATE OR REPLACE FUNCTION get_analytics_trend(
  p_article_id uuid DEFAULT NULL,
  p_days int DEFAULT 30
)
RETURNS TABLE (
  day date,
  views bigint,
  unique_visitors bigint,
  avg_read_time numeric,
  shares bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    d.day,
    SUM(d.views)::bigint AS views,
    SUM(d.unique_visitors)::bigint AS unique_visitors,
    ROUND(AVG(NULLIF(d.avg_read_time, 0)), 1) AS avg_read_time,
    SUM(d.shares)::bigint AS shares
  FROM article_analytics_daily d
  WHERE d.day >= CURRENT_DATE - p_days
    AND (p_article_id IS NULL OR d.article_id = p_article_id)
  GROUP BY d.day
  ORDER BY d.day;
$$;
