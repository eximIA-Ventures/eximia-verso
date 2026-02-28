-- Rename pillar: agribusiness → market-trends
-- Safe: only updates rows that still use the old ID

UPDATE articles
SET pillar = 'market-trends'
WHERE pillar = 'agribusiness';
