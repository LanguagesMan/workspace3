# 📋 What You Need To Do (Takes 5 Minutes)

## ✅ Good News!
Your Supabase credentials work! I've already set them up in your app.

## ⚠️ One Thing Missing
You need to create one database table. Here's how:

---

## 🎯 DO THIS NOW:

### 1️⃣ Open Supabase SQL Editor
Go to this URL:
```
https://app.supabase.com/project/uejiwteujraxczrxbqff/sql
```

### 2️⃣ Copy This SQL
Open the file **`SETUP_DATABASE.sql`** in this folder and copy ALL the text.

Or copy this:
```sql
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

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication"
    ON public.user_profiles FOR INSERT
    WITH CHECK (true);
```

### 3️⃣ Paste and Run
- Paste the SQL into the SQL Editor
- Click the green "Run" button
- You should see "Success. No rows returned"

### 4️⃣ Enable Email Auth
- In Supabase, go to: **Authentication** → **Providers**
- Make sure **Email** is turned ON (green toggle)

---

## ✅ THEN TEST IT:

Open your browser to:
```
http://localhost:3001/discover-articles.html
```

1. Click "Sign In" button (top right)
2. Click "Sign Up" tab
3. Enter email and password
4. Click "Create Account"

You should see "Account created! Check your email"

---

## 🧪 Or Run This Test:
```bash
node test-auth-quick.js
```

This will tell you if everything is working!

---

## ✅ What I Already Did For You:
- ✅ Installed all authentication code
- ✅ Configured your Supabase credentials in the app
- ✅ Set up security (rate limiting, CORS, etc.)
- ✅ Created beautiful login/signup modal
- ✅ Made guest mode work (you can browse without login)

## ⏳ What You Need To Do:
- ⏳ Run the SQL (2 minutes)
- ⏳ Enable email auth (1 minute)  
- ⏳ Test it (2 minutes)

**Total time:** 5 minutes

---

🎉 **You're almost done!** Just run that SQL and you're good to go!

