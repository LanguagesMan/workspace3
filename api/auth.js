/**
 * 🔐 AUTHENTICATION API
 * 
 * Endpoints for user authentication
 */

const express = require('express');
const router = express.Router();
const authSystem = require('../lib/auth-system');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const mixpanel = require('../lib/mixpanel-analytics');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const result = await authSystem.register(req.body);

        // Track user signup in Mixpanel
        if (result.success && result.user) {
            mixpanel.trackUserSignup(result.user.id, {
                source: 'web',
                email_verified: false,
                language_level: req.body.languageLevel || 'unknown',
                device_type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
            });
        }

        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authSystem.login(email, password);

        // Track user login in Mixpanel
        if (result.success && result.user) {
            mixpanel.trackUserLogin(result.user.id, {
                device_type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
                login_method: 'email_password'
            });
        }

        res.json(result);
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await authSystem.refreshAccessToken(refreshToken);
        res.json(result);
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await authSystem.logout(refreshToken);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        const result = await authSystem.verifyEmail(token);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authSystem.requestPasswordReset(email);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const result = await authSystem.resetPassword(token, newPassword);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/change-password
 * Change password (authenticated)
 */
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await authSystem.changePassword(req.userId, currentPassword, newPassword);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', requireAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { name, nativeLanguage, learningLanguage } = req.body;
        
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                name: name || undefined,
                nativeLanguage: nativeLanguage || undefined,
                learningLanguage: learningLanguage || undefined
            }
        });

        const { passwordHash, ...sanitized } = user;

        res.json({
            success: true,
            user: sanitized
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

