-- ============================================
-- SIMPLE DATABASE SETUP FOR AUTHENTICATION
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    learning_level TEXT DEFAULT 'B1',
    native_language TEXT DEFAULT 'en',
    target_language TEXT DEFAULT 'es',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Allow new users to be created
CREATE POLICY "Enable insert for authentication"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (true);

-- Done! Your database is ready for authentication.

