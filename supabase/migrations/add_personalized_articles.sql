-- ============================================================================
-- PERSONALIZED ARTICLES SYSTEM
-- For smart, TikTok-style personalized feed
-- ============================================================================

-- Table: personalized_articles
-- Stores user-specific adapted articles
CREATE TABLE IF NOT EXISTS personalized_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  original_article_id TEXT,
  
  -- Adapted content
  adapted_title TEXT,
  adapted_content TEXT NOT NULL,
  
  -- Scoring & metadata
  difficulty_level TEXT,
  user_vocabulary_count INT DEFAULT 0,
  score FLOAT DEFAULT 0,
  
  -- Engagement tracking
  engagement_clicks INT DEFAULT 0,
  engagement_saves INT DEFAULT 0,
  engagement_shares INT DEFAULT 0,
  engagement_time_spent INT DEFAULT 0, -- seconds
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_engaged TIMESTAMPTZ
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_personalized_user ON personalized_articles(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_personalized_score ON personalized_articles(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_personalized_expires ON personalized_articles(expires_at);

-- Table: article_engagement
-- Tracks user engagement with articles for recommendations
CREATE TABLE IF NOT EXISTS article_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  category TEXT,
  
  -- Engagement metrics
  time_spent INT DEFAULT 0, -- seconds
  saved BOOLEAN DEFAULT false,
  liked BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  
  -- Timestamp
  engaged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for engagement
CREATE INDEX IF NOT EXISTS idx_engagement_user ON article_engagement(user_id, engaged_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_category ON article_engagement(user_id, category);

-- Comments for documentation
COMMENT ON TABLE personalized_articles IS 'Stores adapted articles personalized for each user';
COMMENT ON COLUMN personalized_articles.user_vocabulary_count IS 'Number of user learning words used in adaptation';
COMMENT ON COLUMN personalized_articles.score IS 'Personalization score based on interests, level, engagement';
COMMENT ON COLUMN personalized_articles.expires_at IS 'When article expires (typically 24 hours)';

COMMENT ON TABLE article_engagement IS 'Tracks user engagement with articles to improve recommendations';
COMMENT ON COLUMN article_engagement.time_spent IS 'Time spent reading article in seconds';

-- Enable RLS
ALTER TABLE personalized_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own personalized articles
CREATE POLICY "Users can view own personalized articles" ON personalized_articles
  FOR SELECT USING (true); -- Public for now, can restrict later

CREATE POLICY "Service can insert personalized articles" ON personalized_articles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update personalized articles" ON personalized_articles
  FOR UPDATE USING (true);

-- RLS Policies: Engagement tracking
CREATE POLICY "Users can view own engagement" ON article_engagement
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own engagement" ON article_engagement
  FOR INSERT WITH CHECK (true);


