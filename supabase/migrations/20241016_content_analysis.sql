-- ============================================
-- CONTENT ANALYSIS TABLES
-- Store analyzed difficulty for all content
-- ============================================

-- Content Analysis Table (Pre-computed for all videos/articles/songs)
CREATE TABLE IF NOT EXISTS content_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'song')),
    
    -- CEFR Classification
    cefr_level TEXT NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    difficulty_label TEXT, -- 'Beginner', 'Intermediate', etc.
    
    -- Word Analysis
    total_words INTEGER NOT NULL,
    unique_word_count INTEGER NOT NULL,
    average_word_rank REAL,
    vocabulary_density REAL,
    
    -- Frequency Bands (JSON for flexibility)
    frequency_bands JSONB DEFAULT '{}'::jsonb,
    -- Example: {"top100": 45, "top500": 120, "top1000": 80, "top3000": 150, "top5000": 50, "rare": 30}
    
    -- Metadata
    file_name TEXT,
    title TEXT,
    duration_seconds INTEGER,
    
    -- Analysis metadata
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Full text index for search
    content_text TEXT,
    
    CONSTRAINT valid_word_counts CHECK (unique_word_count <= total_words)
);

-- Indexes for fast queries
CREATE INDEX idx_content_analysis_type ON content_analysis(content_type);
CREATE INDEX idx_content_analysis_level ON content_analysis(cefr_level);
CREATE INDEX idx_content_analysis_content_id ON content_analysis(content_id);
CREATE INDEX idx_content_analysis_avg_rank ON content_analysis(average_word_rank);

-- Composite index for level-based filtering
CREATE INDEX idx_content_analysis_type_level ON content_analysis(content_type, cefr_level);

-- ============================================
-- USER CONTENT DIFFICULTY (Personalized)
-- Calculate how hard each piece of content is FOR EACH USER
-- ============================================

CREATE TABLE IF NOT EXISTS user_content_difficulty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    content_id TEXT NOT NULL,
    
    -- User-specific metrics
    unknown_word_count INTEGER NOT NULL,
    comprehension_rate REAL NOT NULL, -- 0-100 percentage
    goldilocks_score REAL NOT NULL,   -- 0-100 how perfect the difficulty is
    difficulty_label TEXT,             -- 'Too Easy', 'Perfect', 'Too Hard', etc.
    
    -- Preview of new words they'll learn
    new_words_preview JSONB DEFAULT '[]'::jsonb,
    -- Example: ["palabra1", "palabra2", "palabra3", ...]
    
    -- Track if user interacted with content
    watched BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint
    UNIQUE(user_id, content_id)
);

-- Indexes for user-specific queries
CREATE INDEX idx_user_content_difficulty_user ON user_content_difficulty(user_id);
CREATE INDEX idx_user_content_difficulty_goldilocks ON user_content_difficulty(goldilocks_score DESC);
CREATE INDEX idx_user_content_difficulty_user_score ON user_content_difficulty(user_id, goldilocks_score DESC);

-- Composite index for feed sorting
CREATE INDEX idx_user_content_difficulty_user_comp ON user_content_difficulty(user_id, comprehension_rate);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get optimal content for user
CREATE OR REPLACE FUNCTION get_optimal_content_for_user(
    p_user_id TEXT,
    p_content_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    content_id TEXT,
    content_type TEXT,
    cefr_level TEXT,
    comprehension_rate REAL,
    goldilocks_score REAL,
    difficulty_label TEXT,
    title TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.content_id,
        ca.content_type,
        ca.cefr_level,
        ucd.comprehension_rate,
        ucd.goldilocks_score,
        ucd.difficulty_label,
        ca.title
    FROM content_analysis ca
    LEFT JOIN user_content_difficulty ucd 
        ON ca.content_id = ucd.content_id 
        AND ucd.user_id = p_user_id
    WHERE (p_content_type IS NULL OR ca.content_type = p_content_type)
    ORDER BY 
        COALESCE(ucd.goldilocks_score, 50) DESC,
        ca.cefr_level ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to update user content difficulty
CREATE OR REPLACE FUNCTION update_user_content_difficulty()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_user_content_difficulty_timestamp
    BEFORE UPDATE ON user_content_difficulty
    FOR EACH ROW
    EXECUTE FUNCTION update_user_content_difficulty();

CREATE TRIGGER update_content_analysis_timestamp
    BEFORE UPDATE ON content_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_user_content_difficulty();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Content difficulty distribution
CREATE OR REPLACE VIEW content_difficulty_distribution AS
SELECT 
    content_type,
    cefr_level,
    COUNT(*) as count,
    ROUND(AVG(average_word_rank)) as avg_word_rank,
    ROUND(AVG(unique_word_count)) as avg_unique_words
FROM content_analysis
GROUP BY content_type, cefr_level
ORDER BY content_type, cefr_level;

-- View: User learning progression
CREATE OR REPLACE VIEW user_learning_progression AS
SELECT 
    ucd.user_id,
    COUNT(DISTINCT ucd.content_id) as total_content,
    COUNT(DISTINCT CASE WHEN ucd.watched THEN ucd.content_id END) as watched_count,
    ROUND(AVG(ucd.comprehension_rate)::numeric, 2) as avg_comprehension,
    ROUND(AVG(ucd.goldilocks_score)::numeric, 2) as avg_goldilocks_score
FROM user_content_difficulty ucd
GROUP BY ucd.user_id;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE content_analysis IS 'Pre-computed difficulty analysis for all content (videos, articles, songs)';
COMMENT ON TABLE user_content_difficulty IS 'Personalized difficulty metrics showing how hard content is for each specific user';
COMMENT ON COLUMN content_analysis.frequency_bands IS 'JSON object with word count in each frequency band (top100, top500, top1000, top3000, top5000, rare)';
COMMENT ON COLUMN user_content_difficulty.goldilocks_score IS 'Score 0-100 indicating how perfect the difficulty is for the user (100 = perfect goldilocks zone of 85-95% comprehension)';

