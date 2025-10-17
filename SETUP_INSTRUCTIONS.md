# 🚀 LANGFLIX SETUP INSTRUCTIONS
**Phase 1, Day 1-2: Get Your App Running**

## ⚡ QUICK START (30 Minutes)

Your server is failing to start because critical environment variables are missing. Follow these steps **in order** to get your app running.

### Step 1: Generate Secrets (DONE ✅)
I've already generated these for you:
```bash
JWT_SECRET="z1Wicec5JVpiw0POfqfoS13w1IEpKDSzkwxnzOycLwA="
SESSION_SECRET="NUNtqwYHJ7I2f6uPJmWBTvofHDdMfwdfy066x1s6QXs="
```

### Step 2: Create .env File (DO THIS NOW)

Create a file called `.env` in your project root (`/Users/mindful/_projects/workspace3/.env`) with this content:

```bash
# ==========================================
# SERVER CONFIGURATION
# ==========================================
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3001"
JWT_SECRET="z1Wicec5JVpiw0POfqfoS13w1IEpKDSzkwxnzOycLwA="
SESSION_SECRET="NUNtqwYHJ7I2f6uPJmWBTvofHDdMfwdfy066x1s6QXs="

# ==========================================
# REQUIRED: DATABASE (Neon PostgreSQL)
# ==========================================
DATABASE_URL="postgresql://user:password@host.neon.tech/langflix?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@host.neon.tech/langflix?sslmode=require"

# ==========================================
# REQUIRED: SUPABASE
# ==========================================
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ==========================================
# REQUIRED: OPENAI
# ==========================================
OPENAI_API_KEY="sk-proj-your-key-here"

# ==========================================
# REQUIRED: STRIPE (Test Mode)
# ==========================================
STRIPE_SECRET_KEY="sk_test_your-key-here"
STRIPE_PUBLISHABLE_KEY="pk_test_your-key-here"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# ==========================================
# OPTIONAL (Already Configured)
# ==========================================
PERPLEXITY_API_KEY="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"

# Leave these empty for now
DEEPL_API_KEY=""
GOOGLE_TRANSLATE_API_KEY=""
GOOGLE_TTS_API_KEY=""
FIRECRAWL_API_KEY=""
SENTRY_DSN=""

ENABLE_AI_GENERATION="true"
ENABLE_PREMIUM_FEATURES="true"
ENABLE_ANALYTICS="true"
```

---

## 📋 NOW DO THESE 4 CRITICAL TASKS

### Task 1: Set Up Neon PostgreSQL (15 minutes)

**Why:** Your database to store users, vocabulary, progress

**Steps:**
1. Go to https://console.neon.tech/
2. Sign up (use GitHub login for speed)
3. Click **"Create Project"**
4. Name it: `langflix-mvp`
5. Region: Choose closest to you
6. Click **"Create Project"**
7. Copy the connection string (it looks like: `postgresql://username:password@ep-xxx.neon.tech/langflix?sslmode=require`)
8. In your `.env` file, replace both `DATABASE_URL` and `DIRECT_DATABASE_URL` with this connection string

**Test it works:**
```bash
cd /Users/mindful/_projects/workspace3
npx prisma db push
```

You should see: ✅ "Your database is now in sync with your schema"

---

### Task 2: Set Up Supabase (10 minutes)

**Why:** Authentication system (signup, login, sessions)

**Steps:**
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Name: `langflix-auth`
4. Database Password: Generate strong password (save it)
5. Region: Same as Neon
6. Click **"Create Project"** (takes 2-3 minutes)
7. Once ready, go to **Settings** → **API**
8. Copy these 3 values:
   - Project URL → Put in `SUPABASE_URL`
   - `anon` `public` key → Put in `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → Put in `SUPABASE_SERVICE_ROLE_KEY`

---

### Task 3: Set Up OpenAI API (5 minutes)

**Why:** AI features (translation, conversation partner, story generation)

**Steps:**
1. Go to https://platform.openai.com/api-keys
2. Sign in (or create account)
3. Click **"Create new secret key"**
4. Name: `langflix-mvp`
5. Copy the key (starts with `sk-proj-...`)
6. Put it in `OPENAI_API_KEY` in your `.env`
7. **IMPORTANT:** Add credit to your account
   - Go to Settings → Billing
   - Add at least **$50** (you'll use ~$5-10 for testing)

---

### Task 4: Set Up Stripe (10 minutes)

**Why:** Accept payments ($4.99/month subscriptions)

**Steps:**
1. Go to https://dashboard.stripe.com/register
2. Sign up
3. **Stay in TEST MODE** (toggle at top says "Test mode")
4. Go to **Developers** → **API Keys**
5. Copy these 2:
   - Publishable key (starts with `pk_test_`) → `STRIPE_PUBLISHABLE_KEY`
   - Secret key (starts with `sk_test_`) → `STRIPE_SECRET_KEY`
6. For webhook secret (do later when deploying):
   - For now, put: `whsec_placeholder` in `STRIPE_WEBHOOK_SECRET`

---

## ✅ TEST EVERYTHING WORKS

After filling in all 4 required sections in your `.env` file, run:

```bash
cd /Users/mindful/_projects/workspace3

# 1. Generate Prisma client
npx prisma generate

# 2. Push database schema
npx prisma db push

# 3. Start server
npm run start:server
```

**Expected output:**
```
✅ Loaded 687 videos from Langfeed
✅ Loaded 138 videos from reels
🎬 TOTAL: 825 videos loaded
✅ Database connected successfully
🚀 Server listening on port 3001
```

**Open in browser:**
- http://localhost:3001

You should see the video feed load!

---

## 🐛 TROUBLESHOOTING

### "JWT_SECRET environment variable is required"
- You didn't create the `.env` file
- Or you didn't copy the JWT_SECRET correctly

### "Supabase not configured"
- Check your Supabase keys are correct
- Make sure you copied `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`

### "Database connection failed"
- Check your `DATABASE_URL` is correct
- Make sure Neon database is running
- Test connection with: `npx prisma studio`

### "OpenAI API Error: 401 Unauthorized"
- Your API key is wrong
- Or you haven't added credit to your account

### Videos don't load
- Check: http://localhost:3001/api/health/status
- You should see `"status": "healthy"`

---

## 📊 WHAT HAPPENS NEXT

Once your server starts without errors:

✅ **Today (30 min):** Fill in the 4 required API keys above  
✅ **Tomorrow (2 hours):** Test all features (videos, vocabulary, games)  
✅ **Day 3-4 (4 hours):** Deploy to Vercel production  
✅ **Day 5-7 (6 hours):** Set up Stripe checkout, test payments  
✅ **Week 2 (ongoing):** Recruit 100 beta users  

---

## 💰 COSTS (First Month)

- **Neon PostgreSQL:** $0 (free tier up to 10GB)
- **Supabase:** $0 (free tier up to 50K users)
- **OpenAI:** ~$50-100 (for testing + first users)
- **Stripe:** $0 (test mode is free)
- **Vercel:** $0 (hobby plan)
- **Domain:** $12/year (optional)

**Total: ~$50-100 for Month 1**

---

## 🆘 NEED HELP?

1. **Check logs:** Look for specific error messages
2. **Test each service individually:**
   ```bash
   # Test database
   npx prisma studio
   
   # Test server health
   curl http://localhost:3001/api/health/status
   ```
3. **Read ENV_TEMPLATE.txt** for more details on each variable

---

## 🎯 YOUR MISSION TODAY

**DO NOT SKIP THESE:**

- [ ] Create `.env` file with the content above
- [ ] Sign up for Neon PostgreSQL, get connection string
- [ ] Sign up for Supabase, get 3 API keys
- [ ] Sign up for OpenAI, get API key, add $50 credit
- [ ] Sign up for Stripe, get 2 test API keys
- [ ] Run `npx prisma db push`
- [ ] Run `npm run start:server`
- [ ] Open http://localhost:3001 and see videos load

**Time required:** 1 hour (if you focus)

**Once done:** Your app will be RUNNING locally and you can start testing features!

---

Generated: October 16, 2025
Next step after this: Test all features → Deploy to Vercel → Beta launch

