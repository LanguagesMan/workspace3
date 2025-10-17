/**
 * 🗄️ DATABASE CONFIGURATION MODULE
 * 
 * Handles database connection, pooling, and Prisma client initialization
 * Supports both Supabase/Postgres (production) and SQLite (development)
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

/**
 * Validate database configuration
 */
function validateDatabaseConfig() {
    const errors = [];
    
    if (!process.env.DATABASE_URL) {
        errors.push('DATABASE_URL is required');
    }
    
    const isProduction = process.env.NODE_ENV === 'production';
    const isPostgres = process.env.DATABASE_URL?.startsWith('postgresql://');
    
    if (isProduction && !isPostgres) {
        errors.push('Production environment requires PostgreSQL (DATABASE_URL must start with postgresql://)');
    }
    
    if (isPostgres && !process.env.DIRECT_DATABASE_URL) {
        console.warn('⚠️  Warning: DIRECT_DATABASE_URL not set. Migrations may require direct connection.');
    }
    
    if (errors.length > 0) {
        throw new Error(`Database configuration errors:\n  - ${errors.join('\n  - ')}`);
    }
}

/**
 * Initialize Prisma Client with proper configuration
 */
function createPrismaClient() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const prisma = new PrismaClient({
        log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: isDevelopment ? 'pretty' : 'minimal',
    });
    
    // Graceful shutdown
    process.on('beforeExit', async () => {
        await prisma.$disconnect();
    });
    
    return prisma;
}

/**
 * Initialize Supabase client (if configured)
 */
function createSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️  Supabase not configured (SUPABASE_URL and SUPABASE_ANON_KEY required)');
        return null;
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

/**
 * Test database connection
 */
async function testDatabaseConnection(prisma) {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Get database info
 */
async function getDatabaseInfo(prisma) {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const isPostgres = dbUrl?.startsWith('postgresql://');
        const isSQLite = dbUrl?.startsWith('file:');
        
        let info = {
            type: isPostgres ? 'PostgreSQL' : isSQLite ? 'SQLite' : 'Unknown',
            environment: process.env.NODE_ENV || 'development',
            connected: false
        };
        
        if (isPostgres) {
            // Get Postgres version
            const result = await prisma.$queryRaw`SELECT version()`;
            info.version = result[0]?.version;
        }
        
        info.connected = await testDatabaseConnection(prisma);
        
        return info;
    } catch (error) {
        return {
            type: 'Unknown',
            environment: process.env.NODE_ENV || 'development',
            connected: false,
            error: error.message
        };
    }
}

/**
 * Initialize database (validates config and creates clients)
 */
function initializeDatabase() {
    validateDatabaseConfig();
    
    const prisma = createPrismaClient();
    const supabase = createSupabaseClient();
    
    return {
        prisma,
        supabase,
        testConnection: () => testDatabaseConnection(prisma),
        getInfo: () => getDatabaseInfo(prisma)
    };
}

// Export singleton instance
let db = null;

function getDatabase() {
    if (!db) {
        db = initializeDatabase();
    }
    return db;
}

module.exports = {
    getDatabase,
    initializeDatabase,
    createPrismaClient,
    createSupabaseClient,
    validateDatabaseConfig,
    testDatabaseConnection,
    getDatabaseInfo
};

