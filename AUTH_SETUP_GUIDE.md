# 🔐 Authentication Setup Guide

This guide will walk you through setting up Supabase authentication for your application.

## Prerequisites

1. A Supabase account (free tier works great!)
2. Node.js installed
3. The application codebase

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `langflix` (or your choice)
   - Database password: (generate a strong password)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUz...` (long string)
   - **service_role key**: `eyJhbGciOiJIUz...` (secret key - keep this private!)
3. Copy these values

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_JWT_SECRET=your-jwt-secret-here
   ```

   > **Note**: The JWT secret can be found in Settings → API → JWT Settings → JWT Secret

3. Update the app URL:
   ```env
   APP_URL=http://localhost:3001
   ```

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste the following SQL:

```sql
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profiles
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create vocabulary table (for saved words)
CREATE TABLE IF NOT EXISTS public.vocabulary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    translation TEXT,
    context TEXT,
    difficulty TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    last_reviewed TIMESTAMPTZ,
    review_count INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0
);

-- Enable RLS on vocabulary
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policies for vocabulary
CREATE POLICY "Users can view their own vocabulary"
    ON public.vocabulary
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary"
    ON public.vocabulary
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary"
    ON public.vocabulary
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary"
    ON public.vocabulary
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_vocabulary_user_id ON public.vocabulary(user_id);
CREATE INDEX idx_vocabulary_word ON public.vocabulary(word);
```

4. Click "Run" to execute the query

## Step 5: Configure Authentication Providers

### Email Authentication (Already enabled by default)

Email authentication is enabled by default in Supabase.

### Google OAuth (Optional)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find "Google" and click "Enable"
3. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Paste the credentials in Supabase and save

## Step 6: Update Frontend Configuration

1. Open `public/discover-articles.html`
2. Find this section (around line 1458):
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
3. Replace with your actual Supabase URL and anon key

## Step 7: Test the Authentication System

1. Start your server:
   ```bash
   npm start
   ```

2. Open your browser to `http://localhost:3001/discover-articles.html`

3. Test the following:
   - ✅ Click "Sign In" button
   - ✅ Try signing up with a new email
   - ✅ Check your email for verification link
   - ✅ Try logging in with verified account
   - ✅ Check if user profile shows in header
   - ✅ Try logging out
   - ✅ Test "Forgot Password" flow

## Step 8: Configure Email Templates (Optional)

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Customize the templates:
   - Confirm Signup
   - Invite User
   - Magic Link
   - Reset Password

## Security Best Practices

### ✅ DO's

- ✅ **Keep service_role key secret** - Never expose it in frontend code
- ✅ **Use HTTPS in production** - Always use SSL/TLS
- ✅ **Enable RLS** - Row Level Security is essential
- ✅ **Validate user input** - Always validate on backend
- ✅ **Use strong passwords** - Enforce minimum 8 characters
- ✅ **Enable email verification** - Users must verify email
- ✅ **Implement rate limiting** - Already configured in server.js
- ✅ **Use environment variables** - Never hardcode secrets
- ✅ **Regular backups** - Supabase does this automatically
- ✅ **Monitor logs** - Check Supabase logs regularly

### ❌ DON'Ts

- ❌ **Don't commit .env file** - It's in .gitignore for a reason
- ❌ **Don't disable RLS** - Unless you know what you're doing
- ❌ **Don't expose service_role key** - Only use on backend
- ❌ **Don't trust frontend data** - Always validate server-side
- ❌ **Don't skip CSRF protection** - Use tokens for sensitive operations
- ❌ **Don't store sensitive data without encryption**
- ❌ **Don't use weak passwords** - Enforce strong password policy

## API Endpoints

Once set up, you have access to these authentication endpoints:

### Public Endpoints

```bash
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
POST /api/auth/reset-password
GET  /api/auth/session
```

### Protected Endpoints (Require Authentication)

```bash
GET  /api/auth/me
POST /api/auth/update-password
GET  /api/user/profile (example of protected route)
```

## Common Issues & Solutions

### Issue: "Invalid API key"
**Solution**: Check that your SUPABASE_ANON_KEY is correct and matches your project

### Issue: "CORS error"
**Solution**: Make sure APP_URL in .env matches your frontend URL

### Issue: "Row Level Security violation"
**Solution**: Check your RLS policies in Supabase SQL Editor

### Issue: "Email not sending"
**Solution**: Check Supabase email rate limits (60/hour on free tier)

### Issue: "Google OAuth not working"
**Solution**: Verify redirect URIs match exactly in Google Console

## Testing with cURL

Test authentication without the frontend:

```bash
# Sign up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","learningLevel":"B1"}'

# Sign in
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user info (replace TOKEN with actual token)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Production Deployment

Before deploying to production:

1. ✅ Set `NODE_ENV=production` in your environment
2. ✅ Use HTTPS for all connections
3. ✅ Update `APP_URL` to your production domain
4. ✅ Configure proper CORS origins
5. ✅ Enable Supabase custom domain (optional)
6. ✅ Set up monitoring and alerts
7. ✅ Enable Supabase backup policies
8. ✅ Review and test all RLS policies
9. ✅ Set up proper error logging (e.g., Sentry)
10. ✅ Test password reset flow end-to-end

## Support

If you encounter issues:

1. Check Supabase docs: https://supabase.com/docs/guides/auth
2. Check Supabase logs in dashboard
3. Enable debug mode: `LOG_LEVEL=debug` in .env
4. Check browser console for errors
5. Review server logs: `npm start`

## Next Steps

- 📚 Implement user preferences and settings
- 🎯 Add social login providers (Twitter, Facebook, etc.)
- 🔔 Set up push notifications
- 📊 Implement analytics tracking
- 🎨 Customize email templates
- 🔐 Add 2FA (two-factor authentication)
- 👥 Implement user roles and permissions

---

**🎉 Congratulations!** Your authentication system is now set up and ready to use!

