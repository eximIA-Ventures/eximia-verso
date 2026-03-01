-- Verso by exímIA — Authors System
-- Tabela de autores + junction table para multi-autores

-- ============================================
-- Tabela authors
-- ============================================
CREATE TABLE authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  role TEXT DEFAULT 'author',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_authors_slug ON authors(slug);

-- Trigger updated_at (reusa função existente)
CREATE TRIGGER authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Junction table article_authors
-- ============================================
CREATE TABLE article_authors (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'author',
  position INT DEFAULT 0,
  PRIMARY KEY (article_id, author_id)
);

CREATE INDEX idx_article_authors_article ON article_authors(article_id);
CREATE INDEX idx_article_authors_author ON article_authors(author_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Public read authors" ON authors
  FOR SELECT USING (true);

CREATE POLICY "Public read article_authors" ON article_authors
  FOR SELECT USING (true);

-- Escrita autenticada
CREATE POLICY "Authenticated manage authors" ON authors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated manage article_authors" ON article_authors
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Seed: Hugo Capitelli
-- ============================================
INSERT INTO authors (slug, name, bio, role)
VALUES (
  'hugo-capitelli',
  'Hugo Capitelli',
  'Fundador da exímIA Ventures. Estrategista de IA e empreendedor.',
  'founder'
);

-- Vincular artigos existentes ao Hugo
INSERT INTO article_authors (article_id, author_id, role, position)
SELECT a.id, au.id, 'author', 0
FROM articles a, authors au
WHERE au.slug = 'hugo-capitelli';

-- Adicionar coluna featured se não existir
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
