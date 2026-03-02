-- Verso by exímIA — Article Translations (i18n)
-- Tradução automática de artigos via IA

-- ============================================
-- Tabela article_translations
-- ============================================
CREATE TABLE article_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'es')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'needs_review')),
  translated_at TIMESTAMPTZ DEFAULT now(),
  translated_by TEXT DEFAULT 'ai',
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, locale)
);

-- Indexes
CREATE INDEX idx_article_translations_article ON article_translations(article_id);
CREATE INDEX idx_article_translations_locale ON article_translations(locale);
CREATE INDEX idx_article_translations_status ON article_translations(status);

-- Trigger updated_at (reusa função existente)
CREATE TRIGGER article_translations_updated_at
  BEFORE UPDATE ON article_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;

-- Público lê apenas traduções publicadas
CREATE POLICY "Public read published translations" ON article_translations
  FOR SELECT USING (status = 'published');

-- Autenticados: acesso total
CREATE POLICY "Authenticated full access translations" ON article_translations
  FOR ALL USING (auth.role() = 'authenticated');
