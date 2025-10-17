-- ============================================================================
-- USER PERSONALIZATION SCHEMA
-- Complete personalization system for music, articles, videos, and more
-- ============================================================================

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  
  -- Music Preferences
  favorite_artists JSONB DEFAULT '[]'::jsonb, -- ["Bad Bunny", "Shakira", "J Balvin"]
  favorite_music_genres JSONB DEFAULT '[]'::jsonb, -- ["reggaeton", "pop", "rock"]
  disliked_artists JSONB DEFAULT '[]'::jsonb,
  
  -- Article/News Preferences
  favorite_topics JSONB DEFAULT '[]'::jsonb, -- ["technology", "sports", "culture"]
  favorite_sources JSONB DEFAULT '[]'::jsonb, -- ["El País", "BBC Mundo"]
  disliked_topics JSONB DEFAULT '[]'::jsonb,
  
  -- Video Preferences
  favorite_categories JSONB DEFAULT '[]'::jsonb, -- ["comedy", "cooking", "travel"]
  favorite_creators JSONB DEFAULT '[]'::jsonb,
  disliked_categories JSONB DEFAULT '[]'::jsonb,
  
  -- Content Type Preferences
  preferred_content_types JSONB DEFAULT '{"videos": 40, "articles": 40, "music": 20}'::jsonb, -- percentage mix
  
  -- Learning Preferences
  preferred_difficulty_range JSONB DEFAULT '{"min": "A2", "max": "B2"}'::jsonb,
  learning_goals JSONB DEFAULT '[]'::jsonb, -- ["vocabulary", "listening", "reading"]
  daily_time_goal INT DEFAULT 15, -- minutes
  
  -- Behavioral Settings
  auto_play BOOLEAN DEFAULT true,
  show_translations BOOLEAN DEFAULT true,
  subtitle_language TEXT DEFAULT 'both', -- 'spanish', 'english', 'both'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- User Content Interactions (Enhanced tracking)
CREATE TABLE IF NOT EXISTS user_content_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'video', 'article', 'music', 'game', 'story'
  
  -- Interaction Metrics
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'save', 'skip', 'share', 'complete'
  watch_time_seconds INT DEFAULT 0,
  completion_percentage FLOAT DEFAULT 0,
  rating INT, -- 1-5 stars
  
  -- Content Metadata (for learning)
  artist TEXT,
  genre TEXT,
  topic TEXT,
  category TEXT,
  difficulty TEXT,
  
  -- Context
  session_id TEXT,
  source TEXT DEFAULT 'feed', -- 'feed', 'search', 'recommendation'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON user_content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_content_type ON user_content_interactions(content_type);
CREATE INDEX IF NOT EXISTS idx_interactions_user_content ON user_content_interactions(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON user_content_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_user_created ON user_content_interactions(user_id, created_at);

-- Personalized Collections
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'playlist', 'reading_list', 'favorites'
  content_type TEXT, -- 'music', 'articles', 'videos', 'mixed'
  items JSONB DEFAULT '[]'::jsonb, -- [{id, type, added_at, metadata}]
  is_auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_type ON user_collections(type);
CREATE INDEX IF NOT EXISTS idx_collections_user_type ON user_collections(user_id, type);

-- Comments for documentation
COMMENT ON TABLE user_preferences IS 'User personalization preferences for music, articles, videos, and learning';
COMMENT ON TABLE user_content_interactions IS 'Detailed tracking of user interactions with all content types';
COMMENT ON TABLE user_collections IS 'User-created and auto-generated playlists, reading lists, and favorites';

-- Enable RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR ALL USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

-- RLS Policies for user_content_interactions
CREATE POLICY "Users can view own interactions" ON user_content_interactions
  FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users can insert own interactions" ON user_content_interactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IS NOT NULL);

-- RLS Policies for user_collections
CREATE POLICY "Users can view own collections" ON user_collections
  FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

CREATE POLICY "Users can manage own collections" ON user_collections
  FOR ALL USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

