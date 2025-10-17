-- Migration: Ingestion Logs Table
-- Created: 2024-10-16
-- Purpose: Track content ingestion pipeline runs and statistics

CREATE TABLE IF NOT EXISTS ingestion_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Content counts
    videos_ingested INTEGER DEFAULT 0,
    articles_ingested INTEGER DEFAULT 0,
    podcasts_ingested INTEGER DEFAULT 0,
    clips_created INTEGER DEFAULT 0,
    items_enriched INTEGER DEFAULT 0,
    
    -- Execution stats
    duration_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Detailed results
    details JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX idx_ingestion_logs_timestamp ON ingestion_logs(timestamp DESC);
CREATE INDEX idx_ingestion_logs_success ON ingestion_logs(success);
CREATE INDEX idx_ingestion_logs_created_at ON ingestion_logs(created_at DESC);

-- Comments
COMMENT ON TABLE ingestion_logs IS 'Tracks nightly content ingestion pipeline execution';
COMMENT ON COLUMN ingestion_logs.details IS 'Full JSON result object from ingestion run';
COMMENT ON COLUMN ingestion_logs.duration_ms IS 'Total execution time in milliseconds';

-- Sample query to get ingestion summary for last 7 days
-- SELECT 
--     DATE(timestamp) as date,
--     SUM(videos_ingested) as total_videos,
--     SUM(articles_ingested) as total_articles,
--     SUM(podcasts_ingested) as total_podcasts,
--     SUM(clips_created) as total_clips,
--     AVG(duration_ms) as avg_duration_ms
-- FROM ingestion_logs
-- WHERE timestamp >= NOW() - INTERVAL '7 days'
-- GROUP BY DATE(timestamp)
-- ORDER BY date DESC;


