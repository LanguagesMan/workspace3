/**
 * 🗄️ SETUP ADAPTIVE SYSTEM DATABASE
 * Runs the database migrations for the genius adaptive system
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uejiwteujraxczrxbqff.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaml3dGV1anJheGN6cnhicWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDMxMzksImV4cCI6MjA3NTUxOTEzOX0.iva8q5bMcLHfqd6niXqB_i-i-VrPmKLNGr9eiiPwZHQ';

async function setupDatabase() {
    console.log('🗄️  Setting up Genius Adaptive System database...\n');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    try {
        // Read SQL schema
        const schemaSQL = fs.readFileSync('supabase-genius-adaptive-schema.sql', 'utf8');
        
        console.log('📝 Schema file loaded');
        console.log('📊 Creating tables...\n');
        
        // Note: Supabase doesn't support direct SQL execution via JS client
        // This script serves as documentation. Run manually:
        console.log('⚠️  Please run the schema manually using one of these methods:\n');
        console.log('Method 1: Supabase Dashboard');
        console.log('  1. Go to https://supabase.com/dashboard');
        console.log('  2. Select your project');
        console.log('  3. Go to SQL Editor');
        console.log('  4. Paste contents of supabase-genius-adaptive-schema.sql');
        console.log('  5. Click "Run"\n');
        
        console.log('Method 2: Command Line (if you have psql)');
        console.log('  psql $DATABASE_URL < supabase-genius-adaptive-schema.sql\n');
        
        console.log('Method 3: Supabase CLI');
        console.log('  supabase db push\n');
        
        console.log('📚 Tables to be created:');
        console.log('  1. user_adaptive_profile - User level & metrics');
        console.log('  2. behavioral_interactions - User interaction tracking');
        console.log('  3. content_difficulty_cache - Content difficulty scores');
        console.log('  4. user_word_knowledge - Individual word tracking');
        console.log('  5. level_change_history - Level adjustment history');
        console.log('  6. user_milestones - Achievement tracking');
        console.log('  7. content_user_feedback - User feedback on content\n');
        
        console.log('✅ Setup guide displayed');
        console.log('📄 Schema file: supabase-genius-adaptive-schema.sql\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };

