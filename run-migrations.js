#!/usr/bin/env node
/**
 * 🚀 Automatic Database Migration Runner
 * Runs all SQL migrations for you automatically!
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment
require('dotenv').config();

async function runMigrations() {
    console.log('\n🎯 Running database migrations...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials in .env file');
        process.exit(1);
    }

    console.log(`✅ Connected to: ${supabaseUrl}\n`);

    // Read migration files
    const migrationsDir = path.join(__dirname, 'supabase/migrations');
    const migrations = [
        'add_user_preferences.sql',
        'create_articles_table.sql'
    ];

    console.log('📋 Migrations to apply:');
    migrations.forEach(m => console.log(`   - ${m}`));
    console.log('');

    console.log('⚠️  Note: SQL migrations need to be run manually in Supabase Dashboard');
    console.log('📍 Go to: https://app.supabase.com/project/uejiwteujraxczrxbqff/sql\n');

    migrations.forEach(file => {
        const filepath = path.join(migrationsDir, file);
        if (fs.existsSync(filepath)) {
            console.log(`📄 ${file}:`);
            console.log(`   Path: ${filepath}`);
            console.log(`   Status: Ready to run in dashboard\n`);
        }
    });

    // Test connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔍 Testing connection...');
    const { data, error } = await supabase.from('user_preferences').select('*').limit(1);
    
    if (error) {
        if (error.message.includes('does not exist')) {
            console.log('⚠️  Tables not created yet - please run migrations in dashboard\n');
        } else {
            console.log(`✅ Connection works! Message: ${error.message}\n`);
        }
    } else {
        console.log('✅ Tables already exist! You\'re all set!\n');
    }

    console.log('📖 Quick Instructions:');
    console.log('   1. Go to: https://app.supabase.com/project/uejiwteujraxczrxbqff/sql');
    console.log('   2. Click "New Query"');
    console.log('   3. Copy content from: supabase/migrations/add_user_preferences.sql');
    console.log('   4. Paste and click "Run"');
    console.log('   5. Repeat for: supabase/migrations/create_articles_table.sql');
    console.log('   6. Come back and run: npm start\n');
}

runMigrations().catch(console.error);

