/**
 * 🔐 AUTHENTICATION MIDDLEWARE
 * 
 * Middleware for protecting routes and validating tokens
 */

const authSystem = require('../lib/auth-system');

/**
 * Require authentication
 * Middleware that requires valid JWT token
 */
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token and get user
        const user = await authSystem.verifyAccessToken(token);
        
        // Attach user to request
        req.user = user;
        req.userId = user.id;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            error: error.message || 'Invalid or expired token'
        });
    }
}

/**
 * Optional authentication
 * Middleware that attaches user if token is valid, but doesn't require it
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const user = await authSystem.verifyAccessToken(token);
            req.user = user;
            req.userId = user.id;
        }

        next();

    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
}

/**
 * Require email verification
 * Middleware that checks if user's email is verified
 */
function requireVerified(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (!req.user.verified) {
        return res.status(403).json({
            success: false,
            error: 'Email verification required'
        });
    }

    next();
}

/**
 * Require admin role
 * Middleware that checks if user is an admin
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    next();
}

/**
 * Rate limiting per user
 * More lenient rate limiting for authenticated users
 */
function userRateLimit(maxRequests = 500, windowMs = 15 * 60 * 1000) {
    const userRequests = new Map();

    return (req, res, next) => {
        const identifier = req.userId || req.ip;
        const now = Date.now();

        if (!userRequests.has(identifier)) {
            userRequests.set(identifier, []);
        }

        const requests = userRequests.get(identifier);
        
        // Remove old requests outside the window
        const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests, please try again later'
            });
        }

        recentRequests.push(now);
        userRequests.set(identifier, recentRequests);

        next();
    };
}

module.exports = {
    requireAuth,
    optionalAuth,
    requireVerified,
    requireAdmin,
    userRateLimit
};

