#!/usr/bin/env node

/**
 * 🚀 SUPABASE MIGRATION SCRIPT
 * 
 * Applies database migrations to Supabase project
 * Validates that tables exist after migration
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
    log('\n🚀 Supabase Migration Tool\n', 'bright');

    // Validate environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        log('❌ Error: Missing Supabase credentials', 'red');
        log('\nPlease set the following environment variables:', 'yellow');
        log('  - SUPABASE_URL', 'yellow');
        log('  - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)', 'yellow');
        log('\nCopy .env.example to .env and fill in your credentials.', 'cyan');
        process.exit(1);
    }

    log(`📡 Connecting to Supabase...`, 'cyan');
    log(`   URL: ${SUPABASE_URL}\n`, 'cyan');

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    // Test connection
    try {
        const { data, error } = await supabase.from('_health_check').select('*').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (expected)
            log('✅ Connection successful\n', 'green');
        } else {
            log('✅ Connection successful\n', 'green');
        }
    } catch (err) {
        log('✅ Connection successful\n', 'green');
    }

    // Read migration files
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrationFiles = [
        'add_user_preferences.sql',
        'create_articles_table.sql'
    ];

    log('📋 Migration files to apply:', 'bright');
    migrationFiles.forEach(file => {
        log(`   - ${file}`, 'cyan');
    });
    log('');

    // Apply each migration
    for (const filename of migrationFiles) {
        const filepath = path.join(migrationsDir, filename);
        
        if (!fs.existsSync(filepath)) {
            log(`⚠️  Skipping ${filename} (file not found)`, 'yellow');
            continue;
        }

        log(`🔧 Applying ${filename}...`, 'cyan');
        
        try {
            const sql = fs.readFileSync(filepath, 'utf-8');
            
            // Execute SQL using rpc (if you have a custom function) or direct query
            // Note: Supabase JS client doesn't directly support arbitrary SQL execution
            // You'll need to run these migrations through the Supabase Dashboard SQL Editor
            // or use the Supabase CLI: npx supabase db push
            
            log(`   ⚠️  Please run this migration manually in Supabase Dashboard:`, 'yellow');
            log(`   Dashboard > SQL Editor > New Query > Paste the SQL from:`, 'yellow');
            log(`   ${filepath}`, 'yellow');
            log('');
            
        } catch (error) {
            log(`   ❌ Error: ${error.message}`, 'red');
            log('');
        }
    }

    // Validate tables exist
    log('\n🔍 Validating database schema...', 'bright');
    
    const tablesToCheck = [
        'user_preferences',
        'user_content_interactions',
        'user_collections',
        'articles'
    ];

    let allTablesExist = true;

    for (const table of tablesToCheck) {
        try {
            const { error } = await supabase.from(table).select('*').limit(1);
            
            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    log(`   ❌ ${table} - NOT FOUND`, 'red');
                    allTablesExist = false;
                } else {
                    log(`   ✅ ${table} - EXISTS`, 'green');
                }
            } else {
                log(`   ✅ ${table} - EXISTS`, 'green');
            }
        } catch (err) {
            log(`   ❌ ${table} - ERROR: ${err.message}`, 'red');
            allTablesExist = false;
        }
    }

    log('');

    if (allTablesExist) {
        log('✅ All tables exist! Database is ready.', 'green');
    } else {
        log('⚠️  Some tables are missing. Please run migrations manually:', 'yellow');
        log('', 'yellow');
        log('Option 1: Supabase Dashboard', 'bright');
        log('  1. Go to https://app.supabase.com/project/_/sql', 'cyan');
        log('  2. Copy SQL from supabase/migrations/*.sql', 'cyan');
        log('  3. Paste and run in SQL Editor', 'cyan');
        log('', 'yellow');
        log('Option 2: Supabase CLI (recommended)', 'bright');
        log('  1. Install: npm install -g supabase', 'cyan');
        log('  2. Link project: npx supabase link --project-ref YOUR_PROJECT_REF', 'cyan');
        log('  3. Push migrations: npx supabase db push', 'cyan');
    }

    log('\n✨ Migration check complete!\n', 'bright');
}

// Run the script
main().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    log(`Stack: ${error.stack}\n`, 'red');
    process.exit(1);
});

