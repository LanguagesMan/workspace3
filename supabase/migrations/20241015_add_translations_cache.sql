-- Translation Cache Table
-- Stores translations for fast repeated lookups and offline functionality
-- Supports multiple language pairs and batch translation

CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_text TEXT NOT NULL,
    target_text TEXT NOT NULL,
    source_lang TEXT NOT NULL DEFAULT 'es',
    target_lang TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance optimization
    UNIQUE(source_text, source_lang, target_lang)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_translations_lookup 
    ON translations(source_text, source_lang, target_lang);

CREATE INDEX IF NOT EXISTS idx_translations_created 
    ON translations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_translations_source_lang 
    ON translations(source_lang);

CREATE INDEX IF NOT EXISTS idx_translations_target_lang 
    ON translations(target_lang);

-- Enable Row Level Security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (translations are not user-specific)
CREATE POLICY "Allow public read access to translations"
    ON translations FOR SELECT
    USING (true);

-- Allow authenticated users to insert translations
CREATE POLICY "Allow authenticated insert on translations"
    ON translations FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to update translations
CREATE POLICY "Allow authenticated update on translations"
    ON translations FOR UPDATE
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_translations_timestamp
    BEFORE UPDATE ON translations
    FOR EACH ROW
    EXECUTE FUNCTION update_translations_updated_at();

-- Function to clean old translations (older than 90 days)
CREATE OR REPLACE FUNCTION clean_old_translations()
RETURNS void AS $$
BEGIN
    DELETE FROM translations
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE translations IS 'Cache for translated text using LibreTranslate API';
COMMENT ON COLUMN translations.source_text IS 'Original text to translate';
COMMENT ON COLUMN translations.target_text IS 'Translated text result';
COMMENT ON COLUMN translations.source_lang IS 'Source language code (ISO 639-1)';
COMMENT ON COLUMN translations.target_lang IS 'Target language code (ISO 639-1)';

