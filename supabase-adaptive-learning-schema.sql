-- SUPABASE ADAPTIVE LEARNING SCHEMA
-- Tables for tracking user progress, word interactions, and level adjustments

-- 1. Word Interactions Table
-- Tracks every word click for adaptive difficulty adjustment
CREATE TABLE IF NOT EXISTS word_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    video_id TEXT,
    word_difficulty TEXT, -- CEFR level (A1-C2)
    word_rank INTEGER, -- Frequency rank (1-10000)
    context_sentence TEXT,
    clicked_at TIMESTAMP DEFAULT NOW(),
    session_id TEXT, -- Group clicks by session
    response_time_ms INTEGER -- Time to click (interaction speed)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_word_interactions_user ON word_interactions(user_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_word_interactions_word ON word_interactions(word, user_id);

-- 2. User Level History Table
-- Track level changes over time
CREATE TABLE IF NOT EXISTS user_level_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_level TEXT,
    new_level TEXT,
    reason TEXT, -- Why level changed (e.g., "high click rate on difficult words")
    adjustment_type TEXT, -- 'manual', 'auto', 'assessment'
    confidence DECIMAL(3,2), -- 0.00-1.00
    metrics JSONB, -- Store analysis data
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_level_history_user ON user_level_history(user_id, changed_at DESC);

-- 3. User Profiles Table (enhanced)
-- Store current level and learning preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_level TEXT DEFAULT 'A2', -- Current CEFR level
    target_level TEXT, -- User's goal level
    assessment_completed BOOLEAN DEFAULT FALSE,
    assessment_score INTEGER,
    learning_pace TEXT DEFAULT 'normal', -- 'slow', 'normal', 'fast'
    preferred_speed DECIMAL(3,2) DEFAULT 1.0, -- Video playback speed
    daily_goal INTEGER DEFAULT 5, -- Videos per day
    total_words_saved INTEGER DEFAULT 0,
    total_videos_watched INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);

-- 4. Video Progress Table
-- Track which videos user watched and their performance
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    watched_duration INTEGER, -- Seconds watched
    total_duration INTEGER, -- Total video length
    completion_rate DECIMAL(3,2), -- 0.00-1.00
    word_clicks_count INTEGER DEFAULT 0,
    speed_used DECIMAL(3,2) DEFAULT 1.0,
    struggled BOOLEAN DEFAULT FALSE, -- Auto-detected struggle
    liked BOOLEAN DEFAULT FALSE,
    watched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_progress_user ON video_progress(user_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress(video_id);

-- 5. Adaptive Recommendations Table
-- Store system recommendations for future analysis
CREATE TABLE IF NOT EXISTS adaptive_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type TEXT, -- 'level_adjustment', 'speed_change', 'video_recommendation'
    current_state JSONB,
    recommended_action JSONB,
    user_followed BOOLEAN DEFAULT FALSE,
    outcome TEXT, -- 'improved', 'no_change', 'worsened'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON adaptive_recommendations(user_id, created_at DESC);

-- 6. Learning Sessions Table
-- Track individual learning sessions
CREATE TABLE IF NOT EXISTS learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    videos_watched INTEGER DEFAULT 0,
    words_clicked INTEGER DEFAULT 0,
    total_duration_seconds INTEGER DEFAULT 0,
    avg_completion_rate DECIMAL(3,2),
    struggled BOOLEAN DEFAULT FALSE,
    device_type TEXT,
    browser TEXT
);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id, session_start DESC);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE word_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view their own word interactions"
    ON word_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own word interactions"
    ON word_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own level history"
    ON user_level_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level history"
    ON user_level_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own video progress"
    ON video_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video progress"
    ON video_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recommendations"
    ON adaptive_recommendations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions"
    ON learning_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON learning_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Functions for automatic level adjustment

-- Function: Calculate user's recommended level based on recent interactions
CREATE OR REPLACE FUNCTION calculate_recommended_level(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_recent_clicks INTEGER;
    v_avg_difficulty DECIMAL;
    v_current_level TEXT;
    v_recommended_level TEXT;
BEGIN
    -- Get current level
    SELECT current_level INTO v_current_level
    FROM user_profiles
    WHERE user_id = p_user_id;

    -- Get recent click metrics (last 50 interactions)
    SELECT
        COUNT(*),
        AVG(CASE word_difficulty
            WHEN 'A1' THEN 1
            WHEN 'A2' THEN 2
            WHEN 'B1' THEN 3
            WHEN 'B2' THEN 4
            WHEN 'C1' THEN 5
            WHEN 'C2' THEN 6
        END)
    INTO v_recent_clicks, v_avg_difficulty
    FROM (
        SELECT word_difficulty
        FROM word_interactions
        WHERE user_id = p_user_id
        ORDER BY clicked_at DESC
        LIMIT 50
    ) recent;

    -- Decision logic
    IF v_recent_clicks < 10 THEN
        RETURN v_current_level; -- Not enough data
    END IF;

    -- If clicking many hard words, lower level
    IF v_avg_difficulty > 4 AND v_recent_clicks > 25 THEN
        RETURN CASE v_current_level
            WHEN 'C2' THEN 'C1'
            WHEN 'C1' THEN 'B2'
            WHEN 'B2' THEN 'B1'
            WHEN 'B1' THEN 'A2'
            WHEN 'A2' THEN 'A1'
            ELSE 'A1'
        END;
    END IF;

    -- If clicking few easy words, raise level
    IF v_avg_difficulty < 2 AND v_recent_clicks < 5 THEN
        RETURN CASE v_current_level
            WHEN 'A1' THEN 'A2'
            WHEN 'A2' THEN 'B1'
            WHEN 'B1' THEN 'B2'
            WHEN 'B2' THEN 'C1'
            WHEN 'C1' THEN 'C2'
            ELSE 'C2'
        END;
    END IF;

    RETURN v_current_level;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update user profile on word interaction
CREATE OR REPLACE FUNCTION check_level_adjustment()
RETURNS TRIGGER AS $$
DECLARE
    v_interaction_count INTEGER;
    v_recommended_level TEXT;
BEGIN
    -- Check every 50 interactions
    SELECT COUNT(*) INTO v_interaction_count
    FROM word_interactions
    WHERE user_id = NEW.user_id;

    IF v_interaction_count % 50 = 0 THEN
        v_recommended_level := calculate_recommended_level(NEW.user_id);

        -- Insert recommendation
        INSERT INTO adaptive_recommendations (
            user_id,
            recommendation_type,
            current_state,
            recommended_action
        ) VALUES (
            NEW.user_id,
            'level_adjustment',
            jsonb_build_object('current_level', (SELECT current_level FROM user_profiles WHERE user_id = NEW.user_id)),
            jsonb_build_object('recommended_level', v_recommended_level)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_level_adjustment
    AFTER INSERT ON word_interactions
    FOR EACH ROW
    EXECUTE FUNCTION check_level_adjustment();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_word_interactions_session ON word_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_completion ON video_progress(completion_rate);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(current_level);

-- Comments
COMMENT ON TABLE word_interactions IS 'Tracks every word clicked by users for adaptive difficulty';
COMMENT ON TABLE user_level_history IS 'Historical record of user level changes';
COMMENT ON TABLE user_profiles IS 'User learning profiles and preferences';
COMMENT ON TABLE video_progress IS 'Tracks video watching behavior';
COMMENT ON TABLE adaptive_recommendations IS 'System recommendations for user improvement';
COMMENT ON TABLE learning_sessions IS 'Individual learning sessions';
