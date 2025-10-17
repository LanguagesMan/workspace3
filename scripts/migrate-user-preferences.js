/**
 * 🔄 USER PREFERENCES MIGRATION SCRIPT
 * 
 * Analyzes existing user engagement history and infers initial preferences:
 * - Favorite artists from music interactions
 * - Favorite topics from article reads
 * - Favorite categories from video watches
 * - Preferred difficulty level from successful completions
 */

const { createClient } = require('@supabase/supabase-js');
const preferenceLearning = require('../lib/preference-learning-engine');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in environment variables');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all unique user IDs from engagement events
 */
async function getAllUsers() {
    try {
        const { data, error } = await supabase
            .from('engagement_events')
            .select('user_id')
            .not('user_id', 'is', null);

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        // Get unique user IDs
        const uniqueUsers = [...new Set(data.map(row => row.user_id))];
        console.log(`📊 Found ${uniqueUsers.length} unique users with engagement history`);
        
        return uniqueUsers;

    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

/**
 * Check if user already has preferences
 */
async function hasPreferences(userId) {
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('id')
            .eq('user_id', userId)
            .single();

        return !error && data !== null;

    } catch (error) {
        return false;
    }
}

/**
 * Migrate a single user's preferences
 */
async function migrateUser(userId) {
    try {
        // Check if already has preferences
        if (await hasPreferences(userId)) {
            console.log(`ℹ️  User ${userId} already has preferences, skipping`);
            return { skipped: true };
        }

        console.log(`🔄 Migrating preferences for user ${userId}...`);

        // Use preference learning engine to analyze and create preferences
        const result = await preferenceLearning.analyzeAndUpdatePreferences(userId);

        if (result.success) {
            console.log(`✅ Successfully migrated preferences for user ${userId}`);
            return { success: true, updates: result.updates };
        } else {
            console.log(`⚠️  Could not migrate user ${userId}: ${result.message || result.error}`);
            return { success: false, reason: result.message || result.error };
        }

    } catch (error) {
        console.error(`❌ Error migrating user ${userId}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Main migration function
 */
async function runMigration() {
    console.log('🚀 Starting user preferences migration...\n');

    // Get all users
    const users = await getAllUsers();

    if (users.length === 0) {
        console.log('No users found to migrate');
        return;
    }

    console.log(`Found ${users.length} users to process\n`);

    // Migrate each user
    const results = {
        total: users.length,
        migrated: 0,
        skipped: 0,
        failed: 0
    };

    for (let i = 0; i < users.length; i++) {
        const userId = users[i];
        console.log(`\n[${i + 1}/${users.length}] Processing user ${userId}...`);

        const result = await migrateUser(userId);

        if (result.skipped) {
            results.skipped++;
        } else if (result.success) {
            results.migrated++;
        } else {
            results.failed++;
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users:     ${results.total}`);
    console.log(`✅ Migrated:      ${results.migrated}`);
    console.log(`ℹ️  Skipped:       ${results.skipped} (already had preferences)`);
    console.log(`❌ Failed:        ${results.failed}`);
    console.log('='.repeat(60));

    if (results.migrated > 0) {
        console.log('\n✅ Migration completed successfully!');
        console.log('Users can now see personalized content based on their history.');
    } else {
        console.log('\n⚠️  No new preferences were created.');
        console.log('All users either already had preferences or had insufficient data.');
    }
}

/**
 * Dry run - show what would be migrated without actually doing it
 */
async function dryRun() {
    console.log('🔍 Running DRY RUN (no changes will be made)...\n');

    const users = await getAllUsers();

    if (users.length === 0) {
        console.log('No users found');
        return;
    }

    console.log(`Found ${users.length} users\n`);

    let newUsers = 0;
    let existingUsers = 0;

    for (const userId of users) {
        const hasPrefs = await hasPreferences(userId);
        if (hasPrefs) {
            existingUsers++;
            console.log(`✓ ${userId} - already has preferences`);
        } else {
            newUsers++;
            console.log(`→ ${userId} - would create preferences`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 DRY RUN SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users:           ${users.length}`);
    console.log(`Would create for:      ${newUsers}`);
    console.log(`Already have prefs:    ${existingUsers}`);
    console.log('='.repeat(60));
}

// Command line interface
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const isHelp = args.includes('--help') || args.includes('-h');

if (isHelp) {
    console.log(`
🔄 User Preferences Migration Script

Usage:
  node scripts/migrate-user-preferences.js [options]

Options:
  --dry-run, -d    Show what would be migrated without making changes
  --help, -h       Show this help message

Examples:
  node scripts/migrate-user-preferences.js --dry-run   # Preview migration
  node scripts/migrate-user-preferences.js             # Run migration
    `);
    process.exit(0);
}

// Run migration or dry run
if (isDryRun) {
    dryRun()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Error in dry run:', error);
            process.exit(1);
        });
} else {
    runMigration()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Error in migration:', error);
            process.exit(1);
        });
}

