-- GAME SCORES TABLE FOR LANGUAGE LEARNING GAMES
-- Stores scores, leaderboards, and achievements

-- 1. Game Scores Table
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL, -- 'matching', 'speedRound', 'fillBlank', 'listening', 'wordBuilder'
    score INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    time_spent_seconds INTEGER,
    accuracy_percentage DECIMAL(5,2),
    words_practiced INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    played_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON game_scores(game_type, score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_leaderboard ON game_scores(played_at DESC, score DESC);

-- 2. Daily Challenges Table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL UNIQUE,
    game_type TEXT NOT NULL,
    target_score INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 50,
    badge_reward TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date DESC);

-- 3. User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_icon TEXT,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC);

-- 4. User Game Stats Table (aggregated stats)
CREATE TABLE IF NOT EXISTS user_game_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    total_games_played INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_played_date DATE,
    matching_best_score INTEGER DEFAULT 0,
    matching_games_played INTEGER DEFAULT 0,
    speed_best_score INTEGER DEFAULT 0,
    speed_games_played INTEGER DEFAULT 0,
    story_best_score INTEGER DEFAULT 0,
    story_games_played INTEGER DEFAULT 0,
    listening_best_score INTEGER DEFAULT 0,
    listening_games_played INTEGER DEFAULT 0,
    builder_best_score INTEGER DEFAULT 0,
    builder_games_played INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_stats ENABLE ROW LEVEL SECURITY;

-- Policies for game_scores
CREATE POLICY "Users can view their own game scores"
    ON game_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game scores"
    ON game_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for daily_challenges (public read)
CREATE POLICY "Anyone can view daily challenges"
    ON daily_challenges FOR SELECT
    TO authenticated
    USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for user_game_stats
CREATE POLICY "Users can view their own game stats"
    ON user_game_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own game stats"
    ON user_game_stats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game stats"
    ON user_game_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function: Update user game stats after inserting a score
CREATE OR REPLACE FUNCTION update_user_game_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user_game_stats
    INSERT INTO user_game_stats (
        user_id,
        total_xp,
        total_games_played,
        last_played_date
    ) VALUES (
        NEW.user_id,
        NEW.xp_earned,
        1,
        CURRENT_DATE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_xp = user_game_stats.total_xp + NEW.xp_earned,
        total_games_played = user_game_stats.total_games_played + 1,
        last_played_date = CURRENT_DATE,
        updated_at = NOW();

    -- Update game-specific stats
    IF NEW.game_type = 'matching' THEN
        UPDATE user_game_stats SET
            matching_games_played = matching_games_played + 1,
            matching_best_score = GREATEST(matching_best_score, NEW.score)
        WHERE user_id = NEW.user_id;
    ELSIF NEW.game_type = 'speedRound' THEN
        UPDATE user_game_stats SET
            speed_games_played = speed_games_played + 1,
            speed_best_score = GREATEST(speed_best_score, NEW.score)
        WHERE user_id = NEW.user_id;
    ELSIF NEW.game_type = 'fillBlank' THEN
        UPDATE user_game_stats SET
            story_games_played = story_games_played + 1,
            story_best_score = GREATEST(story_best_score, NEW.score)
        WHERE user_id = NEW.user_id;
    ELSIF NEW.game_type = 'listening' THEN
        UPDATE user_game_stats SET
            listening_games_played = listening_games_played + 1,
            listening_best_score = GREATEST(listening_best_score, NEW.score)
        WHERE user_id = NEW.user_id;
    ELSIF NEW.game_type = 'wordBuilder' THEN
        UPDATE user_game_stats SET
            builder_games_played = builder_games_played + 1,
            builder_best_score = GREATEST(builder_best_score, NEW.score)
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats after score insertion
CREATE TRIGGER trigger_update_game_stats
    AFTER INSERT ON game_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_user_game_stats();

-- Function: Calculate and update streak
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_yesterday DATE;
    v_last_played DATE;
    v_current_streak INTEGER;
BEGIN
    v_yesterday := CURRENT_DATE - INTERVAL '1 day';

    SELECT last_played_date, current_streak
    INTO v_last_played, v_current_streak
    FROM user_game_stats
    WHERE user_id = NEW.user_id;

    IF v_last_played = v_yesterday THEN
        -- Continue streak
        UPDATE user_game_stats SET
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1)
        WHERE user_id = NEW.user_id;
    ELSIF v_last_played < v_yesterday THEN
        -- Streak broken, reset to 1
        UPDATE user_game_stats SET
            current_streak = 1
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for streak calculation
CREATE TRIGGER trigger_update_streak
    AFTER INSERT ON game_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_streak();

-- Function: Get daily leaderboard
CREATE OR REPLACE FUNCTION get_daily_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    rank INTEGER,
    user_id UUID,
    total_score BIGINT,
    games_played BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY SUM(score) DESC)::INTEGER AS rank,
        game_scores.user_id,
        SUM(score) AS total_score,
        COUNT(*)::BIGINT AS games_played
    FROM game_scores
    WHERE DATE(played_at) = CURRENT_DATE
    GROUP BY game_scores.user_id
    ORDER BY total_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get game-specific leaderboard
CREATE OR REPLACE FUNCTION get_game_leaderboard(p_game_type TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    rank INTEGER,
    user_id UUID,
    best_score INTEGER,
    games_played BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY MAX(score) DESC)::INTEGER AS rank,
        game_scores.user_id,
        MAX(score) AS best_score,
        COUNT(*)::BIGINT AS games_played
    FROM game_scores
    WHERE game_type = p_game_type
    GROUP BY game_scores.user_id
    ORDER BY best_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Seed initial daily challenges
INSERT INTO daily_challenges (challenge_date, game_type, target_score, xp_reward, badge_reward)
VALUES
    (CURRENT_DATE, 'speedRound', 15, 100, '⚡ Speed Master'),
    (CURRENT_DATE + INTERVAL '1 day', 'matching', 80, 100, '🃏 Memory Champion'),
    (CURRENT_DATE + INTERVAL '2 days', 'listening', 8, 100, '🎧 Ear Expert'),
    (CURRENT_DATE + INTERVAL '3 days', 'wordBuilder', 9, 100, '🔤 Word Wizard'),
    (CURRENT_DATE + INTERVAL '4 days', 'fillBlank', 60, 100, '📖 Story Teller')
ON CONFLICT (challenge_date) DO NOTHING;

-- Comments
COMMENT ON TABLE game_scores IS 'Stores individual game scores for all game types';
COMMENT ON TABLE daily_challenges IS 'Daily challenges with XP and badge rewards';
COMMENT ON TABLE user_achievements IS 'User achievement unlocks and badges';
COMMENT ON TABLE user_game_stats IS 'Aggregated game statistics per user';
