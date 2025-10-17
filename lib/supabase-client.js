/**
 * 🎯 SUPABASE CLIENT FOR NODE.JS BACKEND
 * Enhanced version for server-side operations
 */

// Load environment variables
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // For admin operations

// Validate credentials
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not found in environment variables. Database features will be limited.');
    console.warn('   Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
}

// Create Supabase client for public operations
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false, // Server-side doesn't need session persistence
        autoRefreshToken: false,
    },
}) : null;

// Create admin client for privileged operations (if service role key is available)
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
}) : null;

/**
 * Check if Supabase is configured
 */
function isConfigured() {
    return supabase !== null;
}

/**
 * Get Supabase client (public)
 */
function getClient() {
    if (!supabase) {
        throw new Error('Supabase is not configured. Please set environment variables.');
    }
    return supabase;
}

/**
 * Get admin client (for privileged operations)
 */
function getAdminClient() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client is not configured. Please set SUPABASE_SERVICE_ROLE_KEY.');
    }
    return supabaseAdmin;
}

module.exports = {
    supabase,
    supabaseAdmin,
    isConfigured,
    getClient,
    getAdminClient
};

