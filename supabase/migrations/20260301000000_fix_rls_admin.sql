-- Fix: permitir leitura de todos os artigos (incluindo drafts)
-- A restrição published-only será feita no app, não no banco
DROP POLICY IF EXISTS "Public read published" ON articles;
CREATE POLICY "Public read all articles" ON articles
  FOR SELECT USING (true);
