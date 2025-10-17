/**
 * 🔐 AUTHENTICATION SYSTEM
 * 
 * Complete JWT-based authentication with OAuth support
 * Password hashing, session management, refresh tokens
 */

const jwt = require('jsonwebtoken');
let bcrypt;
try {
    bcrypt = require('bcryptjs');
} catch (error) {
    console.warn('⚠️ bcryptjs not found, using crypto-based fallback hasher');
    bcrypt = require('./utils/bcrypt-fallback');
}
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuthSystem {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
        if (!this.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is required. Generate with: openssl rand -base64 32');
        }
        this.JWT_EXPIRES_IN = '7d';
        this.REFRESH_TOKEN_EXPIRES_IN = '30d';
        this.SALT_ROUNDS = 12;
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} User and tokens
     */
    async register(userData) {
        try {
            const { email, password, name, nativeLanguage = 'en', learningLanguage = 'es' } = userData;

            // Validate input
            if (!email || !password || !name) {
                throw new Error('Email, password, and name are required');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash,
                    name,
                    nativeLanguage,
                    learningLanguage,
                    level: 'A1', // Start at beginner level
                    verified: false,
                    createdAt: new Date()
                }
            });

            // Generate verification token
            const verificationToken = this.generateVerificationToken();
            await prisma.verificationToken.create({
                data: {
                    userId: user.id,
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                }
            });

            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = await this.generateRefreshToken(user.id);

            console.log(`✅ User registered: ${email}`);

            return {
                success: true,
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken,
                verificationToken
            };

        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object} User and tokens
     */
    async login(email, password) {
        try {
            // Find user
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Check password
            const validPassword = await bcrypt.compare(password, user.passwordHash);
            if (!validPassword) {
                throw new Error('Invalid email or password');
            }

            // Update last login
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });

            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = await this.generateRefreshToken(user.id);

            console.log(`✅ User logged in: ${email}`);

            return {
                success: true,
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Object} New access token
     */
    async refreshAccessToken(refreshToken) {
        try {
            // Find refresh token in database
            const tokenRecord = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true }
            });

            if (!tokenRecord) {
                throw new Error('Invalid refresh token');
            }

            if (tokenRecord.expiresAt < new Date()) {
                throw new Error('Refresh token expired');
            }

            if (tokenRecord.revoked) {
                throw new Error('Refresh token has been revoked');
            }

            // Generate new access token
            const accessToken = this.generateAccessToken(tokenRecord.user);

            return {
                success: true,
                accessToken
            };

        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }

    /**
     * Logout user (revoke refresh token)
     * @param {string} refreshToken - Refresh token to revoke
     */
    async logout(refreshToken) {
        try {
            await prisma.refreshToken.update({
                where: { token: refreshToken },
                data: { revoked: true }
            });

            return { success: true, message: 'Logged out successfully' };

        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    /**
     * Verify email with token
     * @param {string} token - Verification token
     */
    async verifyEmail(token) {
        try {
            const verificationToken = await prisma.verificationToken.findUnique({
                where: { token }
            });

            if (!verificationToken) {
                throw new Error('Invalid verification token');
            }

            if (verificationToken.expiresAt < new Date()) {
                throw new Error('Verification token expired');
            }

            // Update user as verified
            await prisma.user.update({
                where: { id: verificationToken.userId },
                data: { verified: true }
            });

            // Delete used token
            await prisma.verificationToken.delete({
                where: { token }
            });

            return { success: true, message: 'Email verified successfully' };

        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     */
    async requestPasswordReset(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                // Don't reveal if user exists
                return { success: true, message: 'If email exists, reset link has been sent' };
            }

            // Generate reset token
            const resetToken = this.generateVerificationToken();
            await prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    token: resetToken,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
                }
            });

            console.log(`🔑 Password reset requested for: ${email}`);

            return {
                success: true,
                message: 'Password reset link sent',
                resetToken // In production, send via email instead
            };

        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     */
    async resetPassword(token, newPassword) {
        try {
            const resetToken = await prisma.passwordResetToken.findUnique({
                where: { token }
            });

            if (!resetToken) {
                throw new Error('Invalid reset token');
            }

            if (resetToken.expiresAt < new Date()) {
                throw new Error('Reset token expired');
            }

            if (!this.validatePassword(newPassword)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            // Hash new password
            const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            // Update password
            await prisma.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash }
            });

            // Delete used token
            await prisma.passwordResetToken.delete({
                where: { token }
            });

            // Revoke all refresh tokens for security
            await prisma.refreshToken.updateMany({
                where: { userId: resetToken.userId },
                data: { revoked: true }
            });

            return { success: true, message: 'Password reset successfully' };

        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    /**
     * Change password (authenticated)
     * @param {string} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Verify current password
            const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!validPassword) {
                throw new Error('Current password is incorrect');
            }

            if (!this.validatePassword(newPassword)) {
                throw new Error('New password must be at least 8 characters with uppercase, lowercase, and number');
            }

            // Hash new password
            const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

            // Update password
            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash }
            });

            return { success: true, message: 'Password changed successfully' };

        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    }

    /**
     * Verify access token and get user
     * @param {string} token - Access token
     * @returns {Object} User data
     */
    async verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            return this.sanitizeUser(user);

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    // =========================
    // HELPER METHODS
    // =========================

    /**
     * Generate JWT access token
     */
    generateAccessToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                email: user.email,
                level: user.level
            },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    /**
     * Generate refresh token
     */
    async generateRefreshToken(userId) {
        const token = crypto.randomBytes(64).toString('hex');
        
        await prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        });

        return token;
    }

    /**
     * Generate verification token
     */
    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        // At least 8 characters, one uppercase, one lowercase, one number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    }

    /**
     * Remove sensitive data from user object
     */
    sanitizeUser(user) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
}

module.exports = new AuthSystem();
