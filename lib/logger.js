/**
 * 📝 STRUCTURED LOGGING WITH PINO
 * 
 * Production-grade logging system with:
 * - Structured JSON logs
 * - Log levels (trace, debug, info, warn, error, fatal)
 * - Automatic request tracking
 * - Error serialization
 * - Pretty printing in development
 */

const pino = require('pino');

/**
 * Create logger instance
 */
function createLogger() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const logLevel = process.env.LOG_LEVEL || 'info';
    
    const options = {
        level: logLevel,
        timestamp: pino.stdTimeFunctions.isoTime,
        
        // Pretty print in development
        ...(isDevelopment && {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                    singleLine: false,
                }
            }
        }),
        
        // Add context
        base: {
            env: process.env.NODE_ENV || 'development',
            app: 'langflix',
        },
        
        // Serialize errors properly
        serializers: {
            err: pino.stdSerializers.err,
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res,
        },
    };
    
    return pino(options);
}

/**
 * Express middleware for request logging
 */
function createRequestLogger(logger) {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // Log request
        logger.info({
            type: 'request',
            method: req.method,
            url: req.url,
            userAgent: req.get('user-agent'),
            ip: req.ip,
        }, 'Incoming request');
        
        // Log response when finished
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
            
            logger[logLevel]({
                type: 'response',
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration,
            }, 'Request completed');
        });
        
        next();
    };
}

/**
 * Create child logger with context
 */
function createChildLogger(logger, context) {
    return logger.child(context);
}

/**
 * Log with structured data
 */
function logWithContext(logger, level, message, context = {}) {
    logger[level](context, message);
}

// Create singleton logger instance
const logger = createLogger();

module.exports = {
    logger,
    createLogger,
    createRequestLogger,
    createChildLogger,
    logWithContext,
};

