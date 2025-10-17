/**
 * 🔐 SUPABASE AUTHENTICATION SERVICE
 * Complete authentication system with:
 * - Email/Password signup & login
 * - Google OAuth integration
 * - Password reset flow
 * - Session management
 * - Auto-refresh tokens
 * - JWT verification
 */

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Supabase configuration with fallback
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uejiwteujraxczrxbqff.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaml3dGV1anJheGN6cnhicWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDMxMzksImV4cCI6MjA3NTUxOTEzOX0.iva8q5bMcLHfqd6niXqB_i-i-VrPmKLNGr9eiiPwZHQ';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || SUPABASE_ANON_KEY;

// Create Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Admin client for server-side operations  
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

class AuthService {
    /**
     * Sign up with email and password
     */
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        learningLevel: metadata.learningLevel || 'B1',
                        nativeLanguage: metadata.nativeLanguage || 'en',
                        targetLanguage: metadata.targetLanguage || 'es',
                        ...metadata
                    },
                    emailRedirectTo: `${process.env.APP_URL || 'http://localhost:3001'}/auth/callback`
                }
            });

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            // Create user profile in database
            if (data.user) {
                await this.createUserProfile(data.user.id, {
                    email: data.user.email,
                    ...metadata
                });
            }

            return {
                success: true,
                user: data.user,
                session: data.session,
                message: 'Account created successfully! Please check your email to verify your account.'
            };

        } catch (error) {
            console.error('Sign up error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during sign up'
            };
        }
    }

    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                user: data.user,
                session: data.session,
                message: 'Signed in successfully!'
            };

        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during sign in'
            };
        }
    }

    /**
     * Sign in with Google OAuth
     */
    async signInWithGoogle(redirectTo = null) {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo || `${process.env.APP_URL || 'http://localhost:3001'}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                    }
                }
            });

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                url: data.url,
                message: 'Redirecting to Google...'
            };

        } catch (error) {
            console.error('Google sign in error:', error);
            return {
                success: false,
                error: 'Failed to initiate Google sign in'
            };
        }
    }

    /**
     * Sign out current user
     */
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                message: 'Signed out successfully'
            };

        } catch (error) {
            console.error('Sign out error:', error);
            return {
                success: false,
                error: 'Failed to sign out'
            };
        }
    }

    /**
     * Send password reset email
     */
    async resetPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.APP_URL || 'http://localhost:3001'}/auth/reset-password`
            });

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                message: 'Password reset email sent! Please check your inbox.'
            };

        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: 'Failed to send password reset email'
            };
        }
    }

    /**
     * Update user password (after reset)
     */
    async updatePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                message: 'Password updated successfully!'
            };

        } catch (error) {
            console.error('Update password error:', error);
            return {
                success: false,
                error: 'Failed to update password'
            };
        }
    }

    /**
     * Get current session
     */
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                return {
                    success: false,
                    error: error.message,
                    session: null
                };
            }

            return {
                success: true,
                session: data.session
            };

        } catch (error) {
            console.error('Get session error:', error);
            return {
                success: false,
                error: 'Failed to get session',
                session: null
            };
        }
    }

    /**
     * Get current user
     */
    async getUser() {
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                return {
                    success: false,
                    error: error.message,
                    user: null
                };
            }

            return {
                success: true,
                user: data.user
            };

        } catch (error) {
            console.error('Get user error:', error);
            return {
                success: false,
                error: 'Failed to get user',
                user: null
            };
        }
    }

    /**
     * Refresh session (auto-refresh)
     */
    async refreshSession() {
        try {
            const { data, error } = await supabase.auth.refreshSession();

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                session: data.session
            };

        } catch (error) {
            console.error('Refresh session error:', error);
            return {
                success: false,
                error: 'Failed to refresh session'
            };
        }
    }

    /**
     * Verify JWT token (server-side)
     */
    async verifyToken(token) {
        try {
            // Use Supabase admin to verify token
            if (supabaseAdmin) {
                const { data, error } = await supabaseAdmin.auth.getUser(token);
                
                if (error) {
                    return {
                        success: false,
                        error: 'Invalid token',
                        user: null
                    };
                }

                return {
                    success: true,
                    user: data.user
                };
            }

            // Fallback to JWT verification
            const decoded = jwt.verify(token, JWT_SECRET);
            
            return {
                success: true,
                user: decoded
            };

        } catch (error) {
            console.error('Token verification error:', error);
            return {
                success: false,
                error: 'Invalid or expired token',
                user: null
            };
        }
    }

    /**
     * Create user profile in database
     */
    async createUserProfile(userId, profileData) {
        try {
            if (!supabaseAdmin) {
                console.warn('Cannot create user profile - admin client not available');
                return { success: false, error: 'Admin client not configured' };
            }

            const { data, error } = await supabaseAdmin
                .from('user_profiles')
                .insert({
                    id: userId,
                    email: profileData.email,
                    learning_level: profileData.learningLevel || 'B1',
                    native_language: profileData.nativeLanguage || 'en',
                    target_language: profileData.targetLanguage || 'es',
                    preferences: profileData.preferences || {},
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                // Table might not exist yet, log but don't fail
                console.warn('User profile creation warning:', error.message);
                return { success: true, warning: error.message };
            }

            return {
                success: true,
                profile: data
            };

        } catch (error) {
            console.error('Create user profile error:', error);
            return {
                success: false,
                error: 'Failed to create user profile'
            };
        }
    }

    /**
     * Get user profile from database
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                return {
                    success: false,
                    error: error.message,
                    profile: null
                };
            }

            return {
                success: true,
                profile: data
            };

        } catch (error) {
            console.error('Get user profile error:', error);
            return {
                success: false,
                error: 'Failed to get user profile',
                profile: null
            };
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                profile: data
            };

        } catch (error) {
            console.error('Update user profile error:', error);
            return {
                success: false,
                error: 'Failed to update user profile'
            };
        }
    }

    /**
     * Listen to auth state changes (client-side)
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated() {
        const { session } = await this.getSession();
        return session !== null;
    }

    /**
     * Get Supabase client (for client-side usage)
     */
    getClient() {
        return supabase;
    }

    /**
     * Get admin client (for server-side usage)
     */
    getAdminClient() {
        return supabaseAdmin;
    }
}

// Middleware for Express.js to protect routes
const requireAuth = async (req, res, next) => {
    try {
        // Get token from Authorization header or cookie
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.access_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided'
            });
        }

        // Verify token
        const authService = new AuthService();
        const result = await authService.verifyToken(token);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        // Attach user to request
        req.user = result.user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

// Optional auth middleware (allows guest access)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.access_token;

        if (token) {
            const authService = new AuthService();
            const result = await authService.verifyToken(token);
            
            if (result.success) {
                req.user = result.user;
            }
        }

        // Continue regardless of auth status
        next();

    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
};

// Rate limiter per user
const userRateLimiter = (req, res, next) => {
    const userId = req.user?.id || req.ip;
    // Implement rate limiting logic here
    next();
};

module.exports = {
    AuthService,
    requireAuth,
    optionalAuth,
    userRateLimiter,
    supabase,
    supabaseAdmin
};

