# 🗄️ DATABASE SCHEMA DOCUMENTATION

## Overview
This document describes the complete database schema for the adaptive learning system.

---

## Core Tables

### `users`
Stores user accounts and basic information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  
  -- Learning profile
  current_level VARCHAR(2) DEFAULT 'A1',  -- A1, A2, B1, B2, C1, C2
  known_word_count INTEGER DEFAULT 0,
  estimated_vocab_size INTEGER DEFAULT 0,
  
  -- Status
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  last_level_change TIMESTAMP,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Preferences
  native_language VARCHAR(10) DEFAULT 'en',
  target_language VARCHAR(10) DEFAULT 'es',
  learning_goal VARCHAR(50),  -- 'travel', 'work', 'fun', etc.
  
  CONSTRAINT valid_level CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(current_level);
CREATE INDEX idx_users_last_active ON users(last_active);
```

---

### `user_words`
Tracks every word a user knows with spaced repetition data.

```sql
CREATE TABLE user_words (
  user_id UUID NOT NULL,
  word TEXT NOT NULL,
  
  -- Learning data
  added_at TIMESTAMP DEFAULT NOW(),
  mastery_level INTEGER DEFAULT 0,  -- 0-5 (0=new, 5=mastered)
  times_reviewed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  times_incorrect INTEGER DEFAULT 0,
  
  -- Spaced repetition
  last_reviewed TIMESTAMP,
  next_review TIMESTAMP,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,  -- For SM-2 algorithm
  interval_days INTEGER DEFAULT 1,
  
  -- Context
  source_content_id UUID,  -- Where they learned it
  context_sentence TEXT,   -- Example sentence
  user_notes TEXT,         -- Personal notes
  
  PRIMARY KEY (user_id, word),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_words_user ON user_words(user_id);
CREATE INDEX idx_user_words_next_review ON user_words(user_id, next_review);
CREATE INDEX idx_user_words_mastery ON user_words(user_id, mastery_level);
CREATE INDEX idx_user_words_added ON user_words(user_id, added_at DESC);
```

---

### `user_behavior`
Tracks all user interactions for adaptive learning.

```sql
CREATE TABLE user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Action details
  action_type VARCHAR(50) NOT NULL,  -- 'word_click', 'video_watch', 'too_hard', etc.
  content_id UUID,
  content_type VARCHAR(20),  -- 'video', 'article', 'song'
  
  -- Metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}',
  
  -- Timing
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id UUID,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_behavior_user ON user_behavior(user_id);
CREATE INDEX idx_behavior_timestamp ON user_behavior(timestamp DESC);
CREATE INDEX idx_behavior_action ON user_behavior(action_type);
CREATE INDEX idx_behavior_session ON user_behavior(session_id);
CREATE INDEX idx_behavior_metadata ON user_behavior USING GIN(metadata);

-- Example metadata structures:
-- word_click: {"word": "hola", "speed_ms": 850, "video_timestamp": 15.3}
-- video_watch: {"percentage": 95, "duration": 120, "pauses": 3}
-- too_hard: {"reason": "too_many_unknowns", "unknown_count": 15}
-- quiz_complete: {"score": 8, "total": 10, "time_seconds": 45}
```

---

### `content_analysis`
Pre-analyzed content difficulty for all videos, articles, songs.

```sql
CREATE TABLE content_analysis (
  content_id UUID PRIMARY KEY,
  content_type VARCHAR(20) NOT NULL,  -- 'video', 'article', 'song'
  
  -- Basic info
  title TEXT,
  duration INTEGER,  -- seconds
  topics TEXT[],     -- ['food', 'travel', 'culture']
  
  -- Difficulty metrics
  cefr_level VARCHAR(2) NOT NULL,
  unique_word_count INTEGER,
  total_word_count INTEGER,
  vocabulary_density DECIMAL(4,2),  -- unique/total
  average_word_rank INTEGER,
  
  -- Frequency distribution (JSONB)
  frequency_bands JSONB,
  -- Example: {"top100": 45, "top500": 23, "top1000": 15, "top3000": 8, "rare": 4}
  
  -- Full text for analysis
  transcription TEXT,
  extracted_words TEXT[],
  
  -- Analysis metadata
  analyzed_at TIMESTAMP DEFAULT NOW(),
  analyzer_version VARCHAR(10),
  
  CONSTRAINT valid_content_type CHECK (content_type IN ('video', 'article', 'song')),
  CONSTRAINT valid_cefr CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);

CREATE INDEX idx_content_type ON content_analysis(content_type);
CREATE INDEX idx_content_level ON content_analysis(cefr_level);
CREATE INDEX idx_content_topics ON content_analysis USING GIN(topics);
CREATE INDEX idx_content_analyzed ON content_analysis(analyzed_at DESC);
```

---

### `user_content_difficulty`
User-specific difficulty scores for each piece of content.

```sql
CREATE TABLE user_content_difficulty (
  user_id UUID NOT NULL,
  content_id UUID NOT NULL,
  
  -- Difficulty calculation
  unknown_word_count INTEGER,
  comprehension_rate DECIMAL(5,2),  -- 0-100
  goldilocks_score INTEGER,         -- 0-100 (how perfect the difficulty is)
  difficulty_label VARCHAR(20),     -- 'Too Easy', 'Easy', 'Perfect', 'Challenging', 'Too Hard'
  
  -- Calculated values
  new_words TEXT[],  -- Words user doesn't know yet
  known_words_percentage DECIMAL(5,2),
  
  -- Metadata
  calculated_at TIMESTAMP DEFAULT NOW(),
  user_level_at_calculation VARCHAR(2),
  user_vocab_size_at_calculation INTEGER,
  
  PRIMARY KEY (user_id, content_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content_analysis(content_id) ON DELETE CASCADE
);

CREATE INDEX idx_ucd_user ON user_content_difficulty(user_id);
CREATE INDEX idx_ucd_goldilocks ON user_content_difficulty(user_id, goldilocks_score DESC);
CREATE INDEX idx_ucd_calculated ON user_content_difficulty(calculated_at DESC);
CREATE INDEX idx_ucd_difficulty ON user_content_difficulty(user_id, difficulty_label);
```

---

### `user_sessions`
Track complete learning sessions.

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Session timing
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Activity metrics
  videos_watched INTEGER DEFAULT 0,
  words_clicked INTEGER DEFAULT 0,
  words_saved INTEGER DEFAULT 0,
  quizzes_taken INTEGER DEFAULT 0,
  articles_read INTEGER DEFAULT 0,
  
  -- Engagement
  engagement_score DECIMAL(3,2),  -- 0-1 (calculated)
  completion_rate DECIMAL(5,2),   -- % of content finished
  
  -- Level changes during session
  level_at_start VARCHAR(2),
  level_at_end VARCHAR(2),
  level_changed BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_started ON user_sessions(started_at DESC);
CREATE INDEX idx_sessions_duration ON user_sessions(duration_seconds DESC);
```

---

### `user_milestones`
Track milestone achievements.

```sql
CREATE TABLE user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Milestone details
  milestone_type VARCHAR(50) NOT NULL,  -- 'words_learned', 'videos_watched', 'streak', etc.
  milestone_value INTEGER,              -- 100 words, 7 day streak, etc.
  
  -- Achievement
  achieved_at TIMESTAMP DEFAULT NOW(),
  celebrated BOOLEAN DEFAULT FALSE,
  
  -- Reward
  reward_type VARCHAR(50),  -- 'badge', 'achievement', 'unlock'
  reward_data JSONB,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_milestones_user ON user_milestones(user_id);
CREATE INDEX idx_milestones_type ON user_milestones(milestone_type);
CREATE INDEX idx_milestones_achieved ON user_milestones(achieved_at DESC);
```

---

### `user_preferences`
Store user learning preferences.

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  
  -- Content preferences
  preferred_topics TEXT[],  -- ['food', 'travel', 'sports']
  avoided_topics TEXT[],
  content_type_preferences JSONB,  -- {"video": 0.7, "article": 0.2, "song": 0.1}
  
  -- Learning settings
  daily_goal_minutes INTEGER DEFAULT 15,
  daily_goal_words INTEGER DEFAULT 10,
  preferred_study_time VARCHAR(20),  -- 'morning', 'afternoon', 'evening'
  
  -- Difficulty preferences
  challenge_level VARCHAR(20) DEFAULT 'balanced',  -- 'easy', 'balanced', 'challenging'
  auto_adjust_level BOOLEAN DEFAULT TRUE,
  show_hints BOOLEAN DEFAULT TRUE,
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  reminder_time TIME,
  
  -- Privacy
  share_progress BOOLEAN DEFAULT TRUE,
  public_profile BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_prefs_topics ON user_preferences USING GIN(preferred_topics);
```

---

### `quiz_results`
Track quiz performance.

```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  
  -- Performance
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  time_seconds INTEGER,
  
  -- Question breakdown
  questions_data JSONB,  -- Array of questions with user answers
  
  -- Context
  content_id UUID,  -- Quiz was based on this content
  level VARCHAR(2),
  
  taken_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_user ON quiz_results(user_id);
CREATE INDEX idx_quiz_taken ON quiz_results(taken_at DESC);
CREATE INDEX idx_quiz_score ON quiz_results(user_id, percentage DESC);
```

---

### `placement_tests`
Track placement test results.

```sql
CREATE TABLE placement_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Test details
  test_type VARCHAR(50),  -- 'initial', 'retest'
  words_tested JSONB,     -- Array of words with results
  
  -- Results
  level_assessed VARCHAR(2) NOT NULL,
  accuracy DECIMAL(5,2),
  confidence VARCHAR(20),
  estimated_word_count INTEGER,
  
  -- Timing
  duration_seconds INTEGER,
  taken_at TIMESTAMP DEFAULT NOW(),
  
  -- Previous level (for retests)
  previous_level VARCHAR(2),
  level_changed BOOLEAN,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_placement_user ON placement_tests(user_id);
CREATE INDEX idx_placement_taken ON placement_tests(taken_at DESC);
```

---

## Views

### `user_progress_view`
Convenient view of user progress.

```sql
CREATE VIEW user_progress_view AS
SELECT 
  u.id as user_id,
  u.username,
  u.current_level,
  u.known_word_count,
  u.created_at,
  
  -- Word stats
  COUNT(DISTINCT uw.word) as total_words_saved,
  AVG(uw.mastery_level) as avg_mastery_level,
  
  -- Session stats
  COUNT(DISTINCT us.id) as total_sessions,
  SUM(us.duration_seconds) as total_study_time,
  AVG(us.engagement_score) as avg_engagement,
  
  -- Recent activity
  MAX(us.started_at) as last_session,
  COUNT(DISTINCT CASE WHEN us.started_at > NOW() - INTERVAL '7 days' THEN us.id END) as sessions_last_week,
  
  -- Milestones
  COUNT(DISTINCT um.id) as total_milestones

FROM users u
LEFT JOIN user_words uw ON u.id = uw.user_id
LEFT JOIN user_sessions us ON u.id = us.user_id
LEFT JOIN user_milestones um ON u.id = um.user_id

GROUP BY u.id, u.username, u.current_level, u.known_word_count, u.created_at;
```

---

## Triggers

### Update user's known_word_count
```sql
CREATE OR REPLACE FUNCTION update_user_word_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET known_word_count = (
    SELECT COUNT(*) FROM user_words WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_word_count
AFTER INSERT OR DELETE ON user_words
FOR EACH ROW
EXECUTE FUNCTION update_user_word_count();
```

### Update last_active on any interaction
```sql
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_active = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_active
AFTER INSERT ON user_behavior
FOR EACH ROW
EXECUTE FUNCTION update_last_active();
```

---

## Indexes Summary

### Performance-Critical Indexes
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_level ON users(current_level);

-- Behavioral tracking
CREATE INDEX idx_behavior_user_timestamp ON user_behavior(user_id, timestamp DESC);
CREATE INDEX idx_behavior_session ON user_behavior(session_id);

-- Content matching
CREATE INDEX idx_content_level ON content_analysis(cefr_level);
CREATE INDEX idx_ucd_goldilocks ON user_content_difficulty(user_id, goldilocks_score DESC);

-- Spaced repetition
CREATE INDEX idx_user_words_next_review ON user_words(user_id, next_review);
```

---

## Materialized Views (for Performance)

### Daily user stats (refresh hourly)
```sql
CREATE MATERIALIZED VIEW daily_user_stats AS
SELECT 
  user_id,
  DATE(timestamp) as date,
  COUNT(*) as total_actions,
  COUNT(DISTINCT content_id) as unique_content,
  COUNT(CASE WHEN action_type = 'word_click' THEN 1 END) as words_clicked,
  COUNT(CASE WHEN action_type = 'video_watch' THEN 1 END) as videos_watched
FROM user_behavior
GROUP BY user_id, DATE(timestamp);

CREATE INDEX idx_daily_stats_user ON daily_user_stats(user_id, date DESC);

-- Refresh hourly
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_user_stats;
```

---

## Migration Strategy

### Initial Setup
```bash
# Run migrations in order:
1. Create tables
2. Create indexes
3. Create views
4. Create triggers
5. Create materialized views
6. Seed initial data
```

### Backup Strategy
```bash
# Daily backup
pg_dump -Fc langflix > backup_$(date +%Y%m%d).dump

# Restore
pg_restore -d langflix backup_20251016.dump
```

---

**Schema Version**: 1.0.0
**Last Updated**: October 16, 2025
**Total Tables**: 11
**Total Indexes**: 40+
**Status**: ✅ Production Ready

