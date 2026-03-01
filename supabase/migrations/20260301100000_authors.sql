-- Verso by exímIA — Authors System
-- Evolução da tabela authors existente + junction table para multi-autores

-- ============================================
-- Evoluir tabela authors (já existe com schema antigo)
-- ============================================
ALTER TABLE authors ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE authors ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'author';
ALTER TABLE authors ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE authors ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- Gerar slugs para rows existentes que não têm
UPDATE authors SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9 ]', '', 'g'), ' +', '-', 'g'))
WHERE slug IS NULL;

-- Tornar slug NOT NULL
ALTER TABLE authors ALTER COLUMN slug SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- Trigger updated_at (reusa função existente)
DROP TRIGGER IF EXISTS authors_updated_at ON authors;
CREATE TRIGGER authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Junction table article_authors
-- ============================================
CREATE TABLE IF NOT EXISTS article_authors (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'author',
  position INT DEFAULT 0,
  PRIMARY KEY (article_id, author_id)
);

CREATE INDEX IF NOT EXISTS idx_article_authors_article ON article_authors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_author ON article_authors(author_id);

-- ============================================
-- RLS Policies (idempotentes)
-- ============================================
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'authors' AND policyname = 'Public read authors') THEN
    CREATE POLICY "Public read authors" ON authors FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_authors' AND policyname = 'Public read article_authors') THEN
    CREATE POLICY "Public read article_authors" ON article_authors FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'authors' AND policyname = 'Authenticated manage authors') THEN
    CREATE POLICY "Authenticated manage authors" ON authors FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'article_authors' AND policyname = 'Authenticated manage article_authors') THEN
    CREATE POLICY "Authenticated manage article_authors" ON article_authors FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ============================================
-- Seed: Hugo Capitelli (se não existir)
-- ============================================
INSERT INTO authors (slug, name, bio, role)
VALUES (
  'hugo-capitelli',
  'Hugo Capitelli',
  'Fundador da exímIA Ventures. Estrategista de IA e empreendedor.',
  'founder'
)
ON CONFLICT (slug) DO NOTHING;

-- Vincular artigos existentes ao Hugo (que não têm vínculo ainda)
INSERT INTO article_authors (article_id, author_id, role, position)
SELECT a.id, au.id, 'author', 0
FROM articles a, authors au
WHERE au.slug = 'hugo-capitelli'
  AND NOT EXISTS (
    SELECT 1 FROM article_authors aa WHERE aa.article_id = a.id
  );
