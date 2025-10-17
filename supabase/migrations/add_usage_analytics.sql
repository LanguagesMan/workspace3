-- Create usage_analytics table for tracking user behavior
CREATE TABLE IF NOT EXISTS usage_analytics (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_id TEXT,
    session_id TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    viewport_size TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_timestamp ON usage_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_session_id ON usage_analytics(session_id);

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_usage_analytics_event_data ON usage_analytics USING GIN (event_data);

-- Add RLS policies
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role has full access to usage_analytics"
    ON usage_analytics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow users to read their own analytics
CREATE POLICY "Users can read their own analytics"
    ON usage_analytics
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()::text);

-- Allow anon to insert analytics (for tracking before auth)
CREATE POLICY "Anyone can insert analytics"
    ON usage_analytics
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Create a view for daily analytics summary
CREATE OR REPLACE VIEW daily_analytics_summary AS
SELECT 
    DATE(timestamp) as date,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM usage_analytics
GROUP BY DATE(timestamp), event_type
ORDER BY date DESC, event_count DESC;

-- Grant access to the view
GRANT SELECT ON daily_analytics_summary TO authenticated, service_role;

