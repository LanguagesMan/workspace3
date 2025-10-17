/**
 * 🏥 COMPREHENSIVE HEALTH CHECK ENDPOINT
 * 
 * Provides detailed system health information for monitoring and debugging
 */

const { getDatabase } = require('../../lib/database-config');
const os = require('os');

/**
 * Get system health status
 */
async function getHealthStatus() {
    const startTime = Date.now();
    
    try {
        const db = getDatabase();
        
        // Database health
        const dbConnected = await db.testConnection();
        const dbInfo = await db.getInfo();
        
        // System metrics
        const memory = process.memoryUsage();
        const uptime = process.uptime();
        
        // Build health object
        const health = {
            status: dbConnected ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(uptime),
            environment: process.env.NODE_ENV || 'development',
            
            // Version info
            version: {
                node: process.version,
                app: require('../../package.json').version,
            },
            
            // Database
            database: {
                connected: dbConnected,
                type: dbInfo.type,
                ...dbInfo,
            },
            
            // Memory
            memory: {
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
                rss: Math.round(memory.rss / 1024 / 1024),
                external: Math.round(memory.external / 1024 / 1024),
                unit: 'MB',
            },
            
            // System
            system: {
                platform: process.platform,
                arch: process.arch,
                cpus: os.cpus().length,
                loadAvg: os.loadavg(),
                freeMemory: Math.round(os.freemem() / 1024 / 1024),
                totalMemory: Math.round(os.totalmem() / 1024 / 1024),
            },
            
            // Services status
            services: {
                openai: !!process.env.OPENAI_API_KEY,
                deepl: !!process.env.DEEPL_API_KEY,
                sentry: !!process.env.SENTRY_DSN,
                supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
            },
            
            // Response time
            responseTime: Date.now() - startTime,
        };
        
        return health;
    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            responseTime: Date.now() - startTime,
        };
    }
}

/**
 * Express route handler
 */
async function healthCheckHandler(req, res) {
    try {
        const health = await getHealthStatus();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message,
        });
    }
}

/**
 * Simple liveness probe (for k8s/docker)
 */
function livenessHandler(req, res) {
    res.status(200).json({ alive: true });
}

/**
 * Readiness probe (checks if app can serve traffic)
 */
async function readinessHandler(req, res) {
    try {
        const db = getDatabase();
        const connected = await db.testConnection();
        
        if (connected) {
            res.status(200).json({ ready: true });
        } else {
            res.status(503).json({ ready: false, reason: 'database_unavailable' });
        }
    } catch (error) {
        res.status(503).json({ ready: false, reason: error.message });
    }
}

module.exports = {
    getHealthStatus,
    healthCheckHandler,
    livenessHandler,
    readinessHandler,
};

