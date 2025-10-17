-- ============================================================================
-- ARTICLES SYSTEM SCHEMA
-- Tables for articles feed, caching, and translations
-- ============================================================================

-- Articles cache table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_english TEXT,
  content TEXT,
  content_english TEXT,
  excerpt TEXT,
  excerpt_english TEXT,
  image_url TEXT,
  category TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  article_url TEXT,
  difficulty TEXT, -- A1, A2, B1, B2, C1, C2
  
  -- Analysis data
  total_words INT,
  unique_words INT,
  cefr_level TEXT,
  difficulty_score FLOAT,
  
  -- Metadata
  published_at TIMESTAMPTZ,
  fetch_time TIMESTAMPTZ DEFAULT NOW(),
  full_content TEXT, -- For Firecrawl deep scraping
  has_full_content BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_article_id ON articles(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_difficulty ON articles(difficulty);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_fetch_time ON articles(fetch_time);

COMMENT ON TABLE articles IS 'Cached articles from RSS feeds with difficulty analysis';

-- Translations cache table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text TEXT NOT NULL,
  target_text TEXT NOT NULL,
  source_lang TEXT NOT NULL DEFAULT 'es',
  target_lang TEXT NOT NULL DEFAULT 'en',
  provider TEXT DEFAULT 'libretranslate', -- libretranslate, deepl, google
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_text, source_lang, target_lang)
);

CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(source_text, source_lang, target_lang);
CREATE INDEX IF NOT EXISTS idx_translations_created ON translations(created_at);

COMMENT ON TABLE translations IS 'Translation cache to reduce API calls and improve performance';

-- Enable RLS (Row Level Security)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles (public read)
CREATE POLICY "Anyone can view articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Service can insert articles" ON articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update articles" ON articles
  FOR UPDATE USING (true);

-- RLS Policies for translations (public read)
CREATE POLICY "Anyone can view translations" ON translations
  FOR SELECT USING (true);

CREATE POLICY "Service can insert translations" ON translations
  FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for articles table
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

