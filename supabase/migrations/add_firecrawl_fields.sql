-- ============================================================================
-- ADD FIRECRAWL DEEP SCRAPING FIELDS
-- For storing full article content scraped via Firecrawl
-- ============================================================================

-- Add Firecrawl-specific fields to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS full_content TEXT,
ADD COLUMN IF NOT EXISTS full_content_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS full_content_metadata JSONB,
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scrape_status TEXT CHECK (scrape_status IN ('pending', 'success', 'failed', 'paywall'));

-- Add index for scrape status
CREATE INDEX IF NOT EXISTS idx_articles_scrape_status ON articles(scrape_status);
CREATE INDEX IF NOT EXISTS idx_articles_scraped_at ON articles(scraped_at DESC);

-- Comments for documentation
COMMENT ON COLUMN articles.full_content IS 'Full article content scraped via Firecrawl (clean text)';
COMMENT ON COLUMN articles.full_content_images IS 'Array of image objects with URLs and alt text';
COMMENT ON COLUMN articles.full_content_metadata IS 'Article metadata from Firecrawl (author, dates, etc.)';
COMMENT ON COLUMN articles.word_count IS 'Word count of full article content';
COMMENT ON COLUMN articles.scraped_at IS 'When the article was scraped via Firecrawl';
COMMENT ON COLUMN articles.scrape_status IS 'Status of Firecrawl scraping: pending, success, failed, or paywall';

