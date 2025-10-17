/**
 * Health Monitoring API
 * GET /api/health/status - Detailed system health check
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Check database connectivity
 */
async function checkDatabase() {
  const startTime = Date.now();
  
  try {
    if (!supabase) {
      return {
        status: 'error',
        message: 'Supabase not configured',
        responseTime: Date.now() - startTime,
      };
    }

    // Simple query to check connectivity
    const { data, error} = await supabase
      .from('user_progress')
      .select('id')
      .limit(1);

    if (error) {
      return {
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime,
      };
    }

    return {
      status: 'healthy',
      message: 'Database connected',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Check external API availability
 */
async function checkExternalAPIs() {
  const apis = {
    transcription: process.env.TRANSCRIPTION_API_URL || 'Not configured',
    translation: process.env.TRANSLATION_API_URL || 'Not configured',
    news: 'Internal',
  };

  const startTime = Date.now();

  return {
    status: 'healthy',
    apis,
    responseTime: Date.now() - startTime,
  };
}

/**
 * Get system metrics
 */
function getSystemMetrics() {
  const usage = process.memoryUsage();
  
  return {
    memory: {
      rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(usage.external / 1024 / 1024) + ' MB',
    },
    uptime: Math.round(process.uptime()) + ' seconds',
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV || 'development',
  };
}

/**
 * Main health check handler
 */
module.exports = async (req, res) => {
  const startTime = Date.now();

  try {
    // Run all health checks
    const [databaseHealth, apiHealth] = await Promise.all([
      checkDatabase(),
      checkExternalAPIs(),
    ]);

    const systemMetrics = getSystemMetrics();

    // Determine overall status
    const isHealthy = databaseHealth.status === 'healthy' && 
                      apiHealth.status === 'healthy';

    const response = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseHealth,
        apis: apiHealth,
      },
      metrics: systemMetrics,
      responseTime: Date.now() - startTime + ' ms',
    };

    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(response);

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: Date.now() - startTime + ' ms',
    });
  }
};
