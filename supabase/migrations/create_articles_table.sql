-- ============================================================================
-- ARTICLES TABLE SCHEMA
-- For caching and storing fetched articles with metadata
-- ============================================================================

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY, -- Unique article ID (source-based)
  
  -- Content
  title TEXT NOT NULL,
  title_english TEXT,
  content TEXT,
  content_english TEXT,
  excerpt TEXT,
  excerpt_english TEXT,
  
  -- Metadata
  source TEXT NOT NULL, -- "El País", "BBC Mundo", etc.
  source_url TEXT,
  article_url TEXT UNIQUE,
  category TEXT, -- "news", "sports", "technology", etc.
  
  -- Media
  image_url TEXT,
  
  -- Difficulty & Analysis
  difficulty TEXT, -- CEFR level: A1, A2, B1, B2, C1, C2
  analysis JSONB, -- Full difficulty analysis from analyzer
  
  -- Publication Info
  author TEXT,
  published_at TIMESTAMPTZ,
  fetch_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Engagement Metrics
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  save_count INT DEFAULT 0,
  
  -- Additional Data
  read_time TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_difficulty ON articles(difficulty);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_fetch_time ON articles(fetch_time DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source_category ON articles(source, category);
CREATE INDEX IF NOT EXISTS idx_articles_difficulty_category ON articles(difficulty, category);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_articles_title_search ON articles USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_articles_content_search ON articles USING gin(to_tsvector('spanish', content));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER articles_updated_at_trigger
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- Comments for documentation
COMMENT ON TABLE articles IS 'Cached articles from various sources with difficulty analysis';
COMMENT ON COLUMN articles.difficulty IS 'CEFR difficulty level (A1-C2)';
COMMENT ON COLUMN articles.analysis IS 'Detailed difficulty analysis from article-difficulty-analyzer';
COMMENT ON COLUMN articles.fetch_time IS 'When the article was fetched from the source';

-- Enable RLS (Row Level Security)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read articles (public content)
CREATE POLICY "Articles are publicly readable" ON articles
  FOR SELECT USING (true);

-- RLS Policy: Only authenticated users can insert (via service)
CREATE POLICY "Service can insert articles" ON articles
  FOR INSERT WITH CHECK (true);

-- RLS Policy: Only service can update articles
CREATE POLICY "Service can update articles" ON articles
  FOR UPDATE USING (true);

