/**
 * 🚀 SUPABASE SETUP SCRIPT
 * 
 * Applies migrations and validates database setup
 */

require('dotenv').config();
const { supabase, isConfigured } = require('../lib/supabase-client');
const fs = require('fs');
const path = require('path');

async function setupSupabase() {
    console.log('🚀 Starting Supabase setup...\n');

    // Check if Supabase is configured
    if (!isConfigured()) {
        console.error('❌ Supabase is not configured!');
        console.error('   Please create a .env file with:');
        console.error('   - SUPABASE_URL=your_project_url');
        console.error('   - SUPABASE_ANON_KEY=your_anon_key\n');
        console.error('   See ENV_TEMPLATE.md for instructions');
        process.exit(1);
    }

    console.log('✅ Supabase configured\n');

    // Test connection
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('count')
            .limit(1);

        if (error) throw error;
        console.log('✅ Connection successful\n');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('   Make sure your Supabase project is running');
        process.exit(1);
    }

    // Check required tables
    console.log('Checking required tables...');
    const requiredTables = [
        'user_preferences',
        'user_content_interactions',
        'user_collections'
    ];

    for (const table of requiredTables) {
        try {
            const { error } = await supabase
                .from(table)
                .select('count')
                .limit(1);

            if (error) {
                console.error(`❌ Table "${table}" not found`);
                console.error('   Run migration: supabase/migrations/add_user_preferences.sql');
            } else {
                console.log(`✅ Table "${table}" exists`);
            }
        } catch (error) {
            console.error(`❌ Error checking table "${table}":`, error.message);
        }
    }

    // Create articles table if it doesn't exist
    console.log('\n📰 Setting up articles table...');
    
    const articlesSchema = `
-- Articles cache table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_english TEXT,
  content TEXT,
  content_english TEXT,
  excerpt TEXT,
  excerpt_english TEXT,
  image_url TEXT,
  category TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  article_url TEXT,
  difficulty TEXT, -- A1, A2, B1, B2, C1, C2
  
  -- Analysis data
  total_words INT,
  unique_words INT,
  cefr_level TEXT,
  difficulty_score FLOAT,
  
  -- Metadata
  published_at TIMESTAMPTZ,
  fetch_time TIMESTAMPTZ DEFAULT NOW(),
  full_content TEXT, -- For Firecrawl deep scraping
  has_full_content BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_article_id ON articles(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_difficulty ON articles(difficulty);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_fetch_time ON articles(fetch_time);

-- Translations cache table
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text TEXT NOT NULL,
  target_text TEXT NOT NULL,
  source_lang TEXT NOT NULL DEFAULT 'es',
  target_lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_text, source_lang, target_lang)
);

CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(source_text, source_lang, target_lang);
`;

    console.log('Schema for articles table:');
    console.log(articlesSchema);
    console.log('\n⚠️  Note: You need to run this SQL in your Supabase SQL editor:');
    console.log('   1. Go to https://app.supabase.com/project/_/sql/new');
    console.log('   2. Paste the schema above');
    console.log('   3. Click "Run"');
    console.log('\n   Or run: supabase db push (if using Supabase CLI)');

    console.log('\n✨ Setup complete!');
    console.log('   Next steps:');
    console.log('   1. Apply the articles table schema above');
    console.log('   2. Start the server: npm start');
    console.log('   3. Test the articles feed: http://localhost:3001/discover-articles.html');
}

// Run setup
setupSupabase().catch(error => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
});

