-- Verso by exímIA — Database Schema
-- Execute no Supabase SQL Editor

-- ============================================
-- Tabela articles
-- ============================================
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  pillar TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  publish_date TIMESTAMPTZ,
  author TEXT NOT NULL DEFAULT 'eximIA',
  hero_image TEXT,
  reading_time INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_pillar ON articles(pillar);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_publish_date ON articles(publish_date DESC);

-- ============================================
-- Tabela api_keys
-- ============================================
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'api',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true
);

-- ============================================
-- Trigger updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Visitantes anônimos: apenas artigos publicados
CREATE POLICY "Public read published" ON articles
  FOR SELECT USING (status = 'published');

-- Usuários autenticados: acesso total
CREATE POLICY "Authenticated full access" ON articles
  FOR ALL USING (auth.role() = 'authenticated');

-- api_keys: sem acesso público
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON api_keys
  FOR ALL USING (false);

-- ============================================
-- Storage bucket para imagens
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública para o bucket
CREATE POLICY "Public read article images" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

-- Política de upload para usuários autenticados
CREATE POLICY "Authenticated upload article images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- Política de delete para usuários autenticados
CREATE POLICY "Authenticated delete article images" ON storage.objects
  FOR DELETE USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

-- ============================================
-- Seed: artigo existente (opcional, executar depois)
-- ============================================
-- INSERT INTO articles (slug, title, excerpt, pillar, tags, publish_date, author, hero_image, reading_time, status, sources, content)
-- VALUES (...);
