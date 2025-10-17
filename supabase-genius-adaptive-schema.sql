/**
 * 🎯 GENIUS ADAPTIVE LEARNING DATABASE SCHEMA
 * Stores user profiles, behavioral data, and content difficulty cache
 */

-- ==================== USER ADAPTIVE PROFILES ====================
CREATE TABLE IF NOT EXISTS user_adaptive_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Current Level
    current_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    previous_level VARCHAR(10),
    known_word_count INTEGER NOT NULL DEFAULT 0,
    
    -- Behavioral Metrics
    click_speed_avg INTEGER, -- Average click speed in milliseconds
    completion_rate_avg DECIMAL(5,2), -- Average completion rate as percentage
    quiz_score_avg DECIMAL(5,2), -- Average quiz score as percentage
    
    -- User Feedback Counters
    too_hard_clicks INTEGER NOT NULL DEFAULT 0,
    too_easy_clicks INTEGER NOT NULL DEFAULT 0,
    
    -- Progression Tracking
    last_level_change TIMESTAMP WITH TIME ZONE,
    progression_velocity DECIMAL(8,2), -- Words learned per day
    streak_days INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX idx_user_adaptive_profile_user_id ON user_adaptive_profile(user_id);
CREATE INDEX idx_user_adaptive_profile_level ON user_adaptive_profile(current_level);

-- ==================== BEHAVIORAL INTERACTIONS ====================
CREATE TABLE IF NOT EXISTS behavioral_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Interaction Details
    interaction_type VARCHAR(50) NOT NULL, -- 'word_click', 'completion', 'button_click', 'quiz', etc.
    content_id VARCHAR(255),
    
    -- Specific Data (stored as JSONB for flexibility)
    interaction_data JSONB,
    
    -- Computed Signals
    signal VARCHAR(50), -- 'fast_learner', 'struggling', 'perfect', etc.
    confidence VARCHAR(20), -- 'low', 'medium', 'high', 'very_high'
    
    -- Timestamps
    interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_behavioral_interactions_user_id ON behavioral_interactions(user_id);
CREATE INDEX idx_behavioral_interactions_type ON behavioral_interactions(interaction_type);
CREATE INDEX idx_behavioral_interactions_timestamp ON behavioral_interactions(interaction_timestamp);

-- ==================== CONTENT DIFFICULTY CACHE ====================
CREATE TABLE IF NOT EXISTS content_difficulty_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'video', 'article', 'audio', etc.
    
    -- Difficulty Metrics
    difficulty_level VARCHAR(10) NOT NULL, -- 'A1', 'A2', 'B1', etc.
    total_words INTEGER,
    unique_words INTEGER,
    avg_word_frequency DECIMAL(10,2),
    avg_word_length DECIMAL(5,2),
    
    -- Goldilocks Scores by Level (stored as JSONB)
    goldilocks_scores JSONB, -- { "A1": 45, "A2": 85, "B1": 95, ... }
    unknown_word_counts JSONB, -- { "A1": 15, "A2": 7, "B1": 3, ... }
    
    -- Cache Management
    cache_version INTEGER NOT NULL DEFAULT 1,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(content_id, content_type)
);

-- Add indexes
CREATE INDEX idx_content_difficulty_content_id ON content_difficulty_cache(content_id);
CREATE INDEX idx_content_difficulty_level ON content_difficulty_cache(difficulty_level);

-- ==================== USER WORD KNOWLEDGE ====================
CREATE TABLE IF NOT EXISTS user_word_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Word Details
    word VARCHAR(255) NOT NULL,
    word_rank INTEGER, -- Frequency rank (1-10000)
    word_level VARCHAR(10), -- CEFR level
    
    -- Learning Status
    status VARCHAR(50) NOT NULL DEFAULT 'learning', -- 'learning', 'mastered', 'reviewing'
    confidence_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    
    -- SRS (Spaced Repetition System) Integration
    ease_factor DECIMAL(5,2) DEFAULT 2.5,
    interval INTEGER DEFAULT 0, -- Days until next review
    repetitions INTEGER DEFAULT 0,
    
    -- Interaction Tracking
    times_seen INTEGER DEFAULT 0,
    times_clicked INTEGER DEFAULT 0,
    times_translated INTEGER DEFAULT 0,
    avg_translation_time INTEGER, -- Milliseconds
    
    -- Timestamps
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    next_review_at TIMESTAMP WITH TIME ZONE,
    mastered_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, word)
);

-- Add indexes
CREATE INDEX idx_user_word_knowledge_user_id ON user_word_knowledge(user_id);
CREATE INDEX idx_user_word_knowledge_word ON user_word_knowledge(word);
CREATE INDEX idx_user_word_knowledge_status ON user_word_knowledge(status);
CREATE INDEX idx_user_word_knowledge_next_review ON user_word_knowledge(next_review_at);

-- ==================== LEVEL CHANGE HISTORY ====================
CREATE TABLE IF NOT EXISTS level_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Level Change
    old_level VARCHAR(10) NOT NULL,
    new_level VARCHAR(10) NOT NULL,
    
    -- Reason & Context
    reason TEXT,
    trigger VARCHAR(50), -- 'quiz_score', 'too_hard_button', 'completion_rate', etc.
    confidence VARCHAR(20),
    
    -- Supporting Data
    supporting_data JSONB, -- Behavioral signals at time of change
    
    -- Timestamps
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_level_change_history_user_id ON level_change_history(user_id);
CREATE INDEX idx_level_change_history_changed_at ON level_change_history(changed_at);

-- ==================== MILESTONES ====================
CREATE TABLE IF NOT EXISTS user_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Milestone Details
    milestone_type VARCHAR(50) NOT NULL, -- 'word_count', 'level_up', 'streak', etc.
    milestone_value INTEGER NOT NULL, -- e.g., 100 for "100 words learned"
    
    -- Display
    title VARCHAR(255),
    message TEXT,
    emoji VARCHAR(10),
    reward VARCHAR(50), -- 'badge', 'achievement', etc.
    
    -- Status
    achieved BOOLEAN DEFAULT true,
    celebrated BOOLEAN DEFAULT false, -- Has user seen the celebration?
    
    -- Timestamps
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    celebrated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX idx_user_milestones_type ON user_milestones(milestone_type);
CREATE INDEX idx_user_milestones_celebrated ON user_milestones(celebrated);

-- ==================== CONTENT USER FEEDBACK ====================
CREATE TABLE IF NOT EXISTS content_user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    
    -- Feedback Type
    feedback_type VARCHAR(50) NOT NULL, -- 'too_hard', 'too_easy', 'perfect', 'not_interested'
    user_level_at_time VARCHAR(10),
    
    -- Context
    completion_percentage DECIMAL(5,2),
    new_word_count INTEGER,
    
    -- Action Taken
    action_taken TEXT, -- Description of what system did in response
    
    -- Timestamps
    feedback_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_content_user_feedback_user_id ON content_user_feedback(user_id);
CREATE INDEX idx_content_user_feedback_content_id ON content_user_feedback(content_id);
CREATE INDEX idx_content_user_feedback_type ON content_user_feedback(feedback_type);

-- ==================== HELPER FUNCTIONS ====================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_adaptive_profile_updated_at
    BEFORE UPDATE ON user_adaptive_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_difficulty_cache_updated_at
    BEFORE UPDATE ON content_difficulty_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_word_knowledge_updated_at
    BEFORE UPDATE ON user_word_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS
ALTER TABLE user_adaptive_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_user_feedback ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view their own adaptive profile"
    ON user_adaptive_profile FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own adaptive profile"
    ON user_adaptive_profile FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adaptive profile"
    ON user_adaptive_profile FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"
    ON behavioral_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
    ON behavioral_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own word knowledge"
    ON user_word_knowledge FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own word knowledge"
    ON user_word_knowledge FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own level history"
    ON level_change_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own milestones"
    ON user_milestones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
    ON user_milestones FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
    ON content_user_feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
    ON content_user_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Content difficulty cache is public (read-only for all authenticated users)
CREATE POLICY "Content difficulty cache is readable by all"
    ON content_difficulty_cache FOR SELECT
    TO authenticated
    USING (true);

-- ==================== SAMPLE DATA (for testing) ====================

-- This will be populated automatically as users interact with the system
-- No need for initial data

COMMENT ON TABLE user_adaptive_profile IS 'Stores user adaptive learning profiles with behavioral metrics';
COMMENT ON TABLE behavioral_interactions IS 'Tracks all user interactions for adaptive learning';
COMMENT ON TABLE content_difficulty_cache IS 'Caches difficulty scores for content to avoid recalculation';
COMMENT ON TABLE user_word_knowledge IS 'Tracks individual word knowledge and mastery for each user';
COMMENT ON TABLE level_change_history IS 'Records all level changes with reasons and context';
COMMENT ON TABLE user_milestones IS 'Tracks user milestones and achievements';
COMMENT ON TABLE content_user_feedback IS 'Stores direct user feedback on content difficulty';

