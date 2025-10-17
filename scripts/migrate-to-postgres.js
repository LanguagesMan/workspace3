#!/usr/bin/env node
/**
 * 🔄 MIGRATE FROM SQLITE TO POSTGRES
 * 
 * This script helps migrate data from SQLite to Postgres (Supabase)
 * 
 * Usage:
 *   1. Set up your .env with both DATABASE_URLs:
 *      DATABASE_URL_SQLITE="file:./dev.db"
 *      DATABASE_URL="postgresql://..."
 *   
 *   2. Run: node scripts/migrate-to-postgres.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Step 1: Initialize Prisma migrations for Postgres
 */
async function initializePostgresMigrations() {
    log('\n📦 Step 1: Initializing Postgres migrations...', 'blue');
    
    const { execSync } = require('child_process');
    
    try {
        // Create initial migration
        log('Creating initial migration...', 'cyan');
        execSync('npx prisma migrate dev --name init --create-only', { 
            stdio: 'inherit',
            env: { ...process.env }
        });
        
        log('✅ Migration files created', 'green');
        log('Review migration files in prisma/migrations/', 'yellow');
        
        return true;
    } catch (error) {
        log(`❌ Error creating migrations: ${error.message}`, 'red');
        return false;
    }
}

/**
 * Step 2: Apply migrations to Postgres
 */
async function applyMigrations() {
    log('\n🚀 Step 2: Applying migrations to Postgres...', 'blue');
    
    const { execSync } = require('child_process');
    
    try {
        execSync('npx prisma migrate deploy', { 
            stdio: 'inherit',
            env: { ...process.env }
        });
        
        log('✅ Migrations applied successfully', 'green');
        return true;
    } catch (error) {
        log(`❌ Error applying migrations: ${error.message}`, 'red');
        return false;
    }
}

/**
 * Step 3: Export data from SQLite
 */
async function exportFromSQLite() {
    log('\n📤 Step 3: Exporting data from SQLite...', 'blue');
    
    const sqliteUrl = process.env.DATABASE_URL_SQLITE || 'file:./dev.db';
    const prisma = new PrismaClient({
        datasources: { db: { url: sqliteUrl } }
    });
    
    try {
        const data = {
            users: await prisma.user.findMany(),
            words: await prisma.word.findMany(),
            articles: await prisma.savedArticle.findMany(),
            sessions: await prisma.learningSession.findMany(),
            achievements: await prisma.achievement.findMany(),
            progress: await prisma.progress.findMany(),
            // Add more models as needed
        };
        
        // Save to JSON file
        const exportPath = path.join(__dirname, 'sqlite-export.json');
        fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
        
        log(`✅ Exported data to ${exportPath}`, 'green');
        log(`Total records:`, 'cyan');
        Object.entries(data).forEach(([model, records]) => {
            log(`  - ${model}: ${records.length} records`, 'cyan');
        });
        
        await prisma.$disconnect();
        return data;
    } catch (error) {
        log(`❌ Error exporting data: ${error.message}`, 'red');
        await prisma.$disconnect();
        return null;
    }
}

/**
 * Step 4: Import data to Postgres
 */
async function importToPostgres(data) {
    log('\n📥 Step 4: Importing data to Postgres...', 'blue');
    
    const prisma = new PrismaClient();
    
    try {
        // Import in order (respecting foreign keys)
        log('Importing users...', 'cyan');
        for (const user of data.users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: user,
                create: user
            });
        }
        
        log('Importing words...', 'cyan');
        for (const word of data.words) {
            await prisma.word.upsert({
                where: { id: word.id },
                update: word,
                create: word
            });
        }
        
        log('Importing articles...', 'cyan');
        for (const article of data.articles) {
            await prisma.savedArticle.upsert({
                where: { id: article.id },
                update: article,
                create: article
            });
        }
        
        log('Importing learning sessions...', 'cyan');
        for (const session of data.sessions) {
            await prisma.learningSession.upsert({
                where: { id: session.id },
                update: session,
                create: session
            });
        }
        
        log('✅ Data imported successfully', 'green');
        await prisma.$disconnect();
        return true;
    } catch (error) {
        log(`❌ Error importing data: ${error.message}`, 'red');
        await prisma.$disconnect();
        return false;
    }
}

/**
 * Step 5: Verify migration
 */
async function verifyMigration() {
    log('\n✅ Step 5: Verifying migration...', 'blue');
    
    const prisma = new PrismaClient();
    
    try {
        const userCount = await prisma.user.count();
        const wordCount = await prisma.word.count();
        const articleCount = await prisma.savedArticle.count();
        
        log('Record counts in Postgres:', 'cyan');
        log(`  - Users: ${userCount}`, 'cyan');
        log(`  - Words: ${wordCount}`, 'cyan');
        log(`  - Articles: ${articleCount}`, 'cyan');
        
        await prisma.$disconnect();
        return true;
    } catch (error) {
        log(`❌ Error verifying migration: ${error.message}`, 'red');
        await prisma.$disconnect();
        return false;
    }
}

/**
 * Main migration flow
 */
async function main() {
    log('═══════════════════════════════════════════════════', 'blue');
    log('    🔄 SQLITE TO POSTGRES MIGRATION TOOL', 'blue');
    log('═══════════════════════════════════════════════════', 'blue');
    
    // Check prerequisites
    if (!process.env.DATABASE_URL) {
        log('❌ Error: DATABASE_URL not set (Postgres connection)', 'red');
        process.exit(1);
    }
    
    if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
        log('❌ Error: DATABASE_URL must be a Postgres connection string', 'red');
        process.exit(1);
    }
    
    log('\n⚠️  WARNING: This will:', 'yellow');
    log('  1. Create new migrations for Postgres', 'yellow');
    log('  2. Apply migrations to your Postgres database', 'yellow');
    log('  3. Export data from SQLite', 'yellow');
    log('  4. Import data to Postgres', 'yellow');
    log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Run migration steps
    const step1 = await initializePostgresMigrations();
    if (!step1) {
        log('\n❌ Migration failed at step 1', 'red');
        process.exit(1);
    }
    
    const step2 = await applyMigrations();
    if (!step2) {
        log('\n❌ Migration failed at step 2', 'red');
        process.exit(1);
    }
    
    const data = await exportFromSQLite();
    if (!data) {
        log('\n❌ Migration failed at step 3', 'red');
        process.exit(1);
    }
    
    const step4 = await importToPostgres(data);
    if (!step4) {
        log('\n❌ Migration failed at step 4', 'red');
        process.exit(1);
    }
    
    await verifyMigration();
    
    log('\n═══════════════════════════════════════════════════', 'green');
    log('    ✅ MIGRATION COMPLETED SUCCESSFULLY!', 'green');
    log('═══════════════════════════════════════════════════', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Test your application with Postgres', 'cyan');
    log('  2. Update DATABASE_URL in production (.env)', 'cyan');
    log('  3. Remove DATABASE_URL_SQLITE from .env', 'cyan');
    log('  4. Deploy to production', 'cyan');
}

// Run migration
if (require.main === module) {
    main().catch((error) => {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
}

module.exports = { main };

