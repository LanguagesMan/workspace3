-- Supabase Schema for Adaptive Language Learning Platform
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL, -- Auth user ID or temp ID
    cefr_level TEXT NOT NULL DEFAULT 'A2',
    known_words JSONB DEFAULT '[]'::jsonb,
    learning_words JSONB DEFAULT '[]'::jsonb,
    recent_mistakes JSONB DEFAULT '[]'::jsonb,
    interest_tags JSONB DEFAULT '[]'::jsonb,
    reading_speed INTEGER DEFAULT 150, -- words per minute
    session_goal INTEGER DEFAULT 15, -- minutes per day
    streak_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_cefr_level ON profiles(cefr_level);

-- ============================================
-- USER WORDS (SRS System)
-- ============================================
CREATE TABLE IF NOT EXISTS user_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    lemma TEXT NOT NULL, -- Lemmatized word
    original_word TEXT, -- Original form seen
    translation TEXT,
    language TEXT DEFAULT 'es',
    status TEXT DEFAULT 'learning', -- learning, reviewing, mastered
    ease_factor REAL DEFAULT 2.5, -- SM-2 algorithm
    interval_days INTEGER DEFAULT 1,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    times_reviewed INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lemma, language)
);

CREATE INDEX idx_user_words_user_id ON user_words(user_id);
CREATE INDEX idx_user_words_next_review ON user_words(next_review_at);
CREATE INDEX idx_user_words_status ON user_words(status);

-- ============================================
-- CONTENT FEATURES (Pre-computed metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS content_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id TEXT UNIQUE NOT NULL, -- External ID (video ID, article URL, etc.)
    content_type TEXT NOT NULL, -- video, article, news, music
    title TEXT,
    description TEXT,
    tokens JSONB, -- Array of tokens
    lemmas JSONB, -- Array of lemmatized words
    total_words INTEGER,
    unique_words INTEGER,
    target_level TEXT, -- A1, A2, B1, B2, C1, C2
    difficulty_score REAL, -- 0-1
    tags JSONB DEFAULT '[]'::jsonb,
    source TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_features_content_id ON content_features(content_id);
CREATE INDEX idx_content_features_target_level ON content_features(target_level);
CREATE INDEX idx_content_features_content_type ON content_features(content_type);
CREATE INDEX idx_content_features_published_at ON content_features(published_at DESC);

-- ============================================
-- ENGAGEMENT EVENTS (User interactions)
-- ============================================
CREATE TABLE IF NOT EXISTS engagement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    event_type TEXT NOT NULL, -- impression, watch, save, share, skip, complete
    watch_time_pct REAL, -- 0-1
    replay_count INTEGER DEFAULT 0,
    skip_speed REAL, -- seconds to skip
    scroll_depth REAL, -- 0-1 for articles
    saved BOOLEAN DEFAULT FALSE,
    shared BOOLEAN DEFAULT FALSE,
    metadata JSONB, -- Additional event data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_engagement_user_id ON engagement_events(user_id);
CREATE INDEX idx_engagement_content_id ON engagement_events(content_id);
CREATE INDEX idx_engagement_event_type ON engagement_events(event_type);
CREATE INDEX idx_engagement_created_at ON engagement_events(created_at DESC);

-- ============================================
-- SESSIONS (Learning sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    items_viewed INTEGER DEFAULT 0,
    items_completed INTEGER DEFAULT 0,
    words_saved INTEGER DEFAULT 0,
    srs_reviews INTEGER DEFAULT 0,
    streak_maintained BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at DESC);

-- ============================================
-- ACHIEVEMENTS (Gamification)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    achievement_type TEXT NOT NULL, -- streak_7, words_100, level_up, etc.
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    xp_reward INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_words_updated_at BEFORE UPDATE ON user_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_features_updated_at BEFORE UPDATE ON content_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can view own words" ON user_words
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own words" ON user_words
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own words" ON user_words
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Content features are public (read-only)
CREATE POLICY "Content features are public" ON content_features
    FOR SELECT USING (true);

-- Engagement events: users can insert and view own
CREATE POLICY "Users can insert own engagement" ON engagement_events
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can view own engagement" ON engagement_events
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Sessions: users can view and insert own
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Achievements: users can view own
CREATE POLICY "Users can view own achievements" ON achievements
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Example profile
INSERT INTO profiles (user_id, cefr_level, known_words, interest_tags)
VALUES (
    'default_user',
    'A2',
    '["hola", "tengo", "casa", "comer", "agua"]'::jsonb,
    '["news", "culture", "food", "travel"]'::jsonb
) ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE profiles IS 'User learning profiles with CEFR level and vocabulary';
COMMENT ON TABLE user_words IS 'Spaced repetition system (SRS) word tracking';
COMMENT ON TABLE content_features IS 'Pre-computed content metadata for ranking';
COMMENT ON TABLE engagement_events IS 'User interaction events for personalization';
COMMENT ON TABLE sessions IS 'Learning session tracking for analytics';
COMMENT ON TABLE achievements IS 'Gamification achievements and rewards';
