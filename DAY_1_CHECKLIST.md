# ✅ DAY 1 ACTION CHECKLIST
**Phase 1: Fix Foundation - Database & Environment Setup**

**Time estimate:** 2-3 hours  
**Goal:** Get server running with database connected

---

## 🎯 MISSION: Fix the 4 Critical Blockers

Your server is currently failing because of missing environment variables. The terminal output shows:

```
Error: JWT_SECRET environment variable is required
⚠️ Supabase credentials not found
⚠️ Perplexity API key not found
```

---

## ⚡ STEP-BY-STEP INSTRUCTIONS

### ☐ Step 1: Create .env File (5 minutes)

**What:** Create a new file called `.env` in your project root

**Where:** `/Users/mindful/_projects/workspace3/.env`

**How:**
1. Open your code editor
2. Create new file: `.env`
3. Copy the template from `SETUP_INSTRUCTIONS.md`
4. Save the file

**Content to use:**
```bash
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3001"
JWT_SECRET="z1Wicec5JVpiw0POfqfoS13w1IEpKDSzkwxnzOycLwA="
SESSION_SECRET="NUNtqwYHJ7I2f6uPJmWBTvofHDdMfwdfy066x1s6QXs="

DATABASE_URL="postgresql://user:password@host.neon.tech/langflix?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@host.neon.tech/langflix?sslmode=require"

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

OPENAI_API_KEY="sk-proj-your-key-here"

STRIPE_SECRET_KEY="sk_test_your-key-here"
STRIPE_PUBLISHABLE_KEY="pk_test_your-key-here"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"

PERPLEXITY_API_KEY="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"
```

---

### ☐ Step 2: Set Up Neon PostgreSQL (15 minutes)

**What:** Your database to store users, vocabulary, progress

**Go to:** https://console.neon.tech/

**Steps:**
1. ☐ Click "Sign up" (use GitHub for fastest signup)
2. ☐ Click "Create Project"
3. ☐ Name: `langflix-mvp`
4. ☐ Region: Choose closest to your location
5. ☐ Click "Create Project"
6. ☐ Wait ~30 seconds for database to spin up
7. ☐ Look for "Connection string" on dashboard
8. ☐ Click "Copy" button next to connection string
9. ☐ Paste it in your `.env` file in BOTH places:
   - `DATABASE_URL="postgresql://..."`
   - `DIRECT_DATABASE_URL="postgresql://..."`

**What it looks like:**
```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/langflix?sslmode=require
```

**Verify it works:**
```bash
cd /Users/mindful/_projects/workspace3
npx prisma db push
```

**Expected:** "✅ Your database is now in sync with your schema"

---

### ☐ Step 3: Set Up Supabase Authentication (10 minutes)

**What:** Handles user signup, login, sessions

**Go to:** https://supabase.com/dashboard

**Steps:**
1. ☐ Click "Start your project"
2. ☐ Sign in with GitHub
3. ☐ Click "New project"
4. ☐ Organization: Create new one if needed
5. ☐ Name: `langflix-auth`
6. ☐ Database Password: Click "Generate password" (save it somewhere!)
7. ☐ Region: Same as Neon (for speed)
8. ☐ Click "Create new project"
9. ☐ Wait ~2 minutes for project to be ready (get coffee ☕)
10. ☐ Once ready, click on project name
11. ☐ Go to Settings (gear icon) → API
12. ☐ Copy 3 values:

**Value 1 - Project URL:**
- Look for "Project URL" section
- Copy the URL (looks like: `https://abcdefg.supabase.co`)
- Paste in `.env` as `SUPABASE_URL`

**Value 2 - Anon Public Key:**
- Look for "Project API keys" section
- Find the `anon` `public` key
- Click "Copy"
- Paste in `.env` as `SUPABASE_ANON_KEY`

**Value 3 - Service Role Secret Key:**
- Same section
- Find the `service_role` `secret` key
- Click "Reveal" then "Copy"
- Paste in `.env` as `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Important:** Keep the service role key secret! Don't commit to git.

---

### ☐ Step 4: Set Up OpenAI API (5 minutes)

**What:** Powers AI features (conversation partner, story generation, translations)

**Go to:** https://platform.openai.com/api-keys

**Steps:**
1. ☐ Sign in (or create account)
2. ☐ Click "Create new secret key"
3. ☐ Name: `langflix-mvp`
4. ☐ Permissions: "All" (default)
5. ☐ Click "Create secret key"
6. ☐ **COPY IT NOW** (you can't see it again!)
7. ☐ Paste in `.env` as `OPENAI_API_KEY`

**Add Credits:**
1. ☐ Go to Settings → Billing
2. ☐ Click "Add payment method"
3. ☐ Add credit card
4. ☐ Buy $50 credits (you'll use ~$5-10 for MVP testing)

**Why you need credits:** OpenAI requires a paid account for API access. Don't worry, $50 will last months for testing.

---

### ☐ Step 5: Set Up Stripe Payments (10 minutes)

**What:** Accept $4.99/month subscription payments

**Go to:** https://dashboard.stripe.com/register

**Steps:**
1. ☐ Sign up for account
2. ☐ Fill in business info (you can use personal info for now)
3. ☐ **IMPORTANT:** Make sure you're in "Test mode" (toggle at top of dashboard)
4. ☐ Go to Developers → API keys
5. ☐ Copy "Publishable key" (starts with `pk_test_`)
   - Paste in `.env` as `STRIPE_PUBLISHABLE_KEY`
6. ☐ Copy "Secret key" (starts with `sk_test_`)
   - Paste in `.env` as `STRIPE_SECRET_KEY`

**Webhook Secret:**
- For now, just put `whsec_placeholder` in `STRIPE_WEBHOOK_SECRET`
- We'll set up webhooks later when deploying

---

### ☐ Step 6: Verify Everything (5 minutes)

**Run validation script:**
```bash
cd /Users/mindful/_projects/workspace3
node scripts/validate-environment.js
```

**Expected output:**
```
✅ NODE_ENV: Configured
✅ JWT_SECRET: Configured
✅ DATABASE_URL: Configured
✅ SUPABASE_URL: Configured
✅ OPENAI_API_KEY: Configured
✅ STRIPE_SECRET_KEY: Configured
✅ Database connection successful!

✨ ALL REQUIRED SERVICES CONFIGURED!
```

**If you see ❌ errors:**
- Double-check your `.env` file
- Make sure no typos in API keys
- Ensure keys don't have extra spaces

---

### ☐ Step 7: Initialize Database (5 minutes)

**Generate Prisma client:**
```bash
npx prisma generate
```

**Push schema to database:**
```bash
npx prisma db push
```

**Expected output:**
```
🚀 Your database is now in sync with your schema.
✔ Generated Prisma Client
```

**Open database browser (optional):**
```bash
npx prisma studio
```
This opens http://localhost:5555 where you can see your database tables.

---

### ☐ Step 8: Start Server (2 minutes)

**Start the server:**
```bash
npm run start:server
```

**Expected output:**
```
✅ Loaded 687 videos from Langfeed
✅ Loaded 138 videos from reels
🎬 TOTAL: 825 videos loaded
✅ Database connected successfully
✅ Supabase authentication ready
🚀 Server listening on port 3001
```

**If you see errors:**
- Read the error message carefully
- Most common: Wrong API key or database URL
- Run `node scripts/validate-environment.js` again

---

### ☐ Step 9: Test in Browser (2 minutes)

**Open these URLs:**

1. **Health Check:**
   - http://localhost:3001/api/health/status
   - Should see: `{"status":"healthy"}`

2. **Video Feed:**
   - http://localhost:3001
   - Should see: Video player with Spanish videos

3. **AI Discover:**
   - http://localhost:3001/discover-articles.html
   - Should see: Spanish news articles

**If videos don't load:**
- Check browser console for errors (F12)
- Check server logs in terminal
- Make sure videos folder exists: `/Users/mindful/_projects/workspace3/public/videos/langfeed/`

---

## 🎉 SUCCESS CRITERIA

You're done with Day 1 when ALL these are true:

- ✅ `.env` file created with all 4 required services
- ✅ `node scripts/validate-environment.js` shows all green ✅
- ✅ `npx prisma db push` succeeds
- ✅ `npm run start:server` starts without errors
- ✅ http://localhost:3001 shows video feed
- ✅ http://localhost:3001/api/health/status returns healthy

---

## 📊 WHAT YOU'VE ACCOMPLISHED

After completing Day 1:
- ✅ Database connected (can store users, vocabulary, progress)
- ✅ Authentication ready (users can sign up)
- ✅ AI features enabled (conversation partner, translations)
- ✅ Payments ready (can test subscriptions)
- ✅ Server running locally (can test all features)

---

## 📅 WHAT'S NEXT

**Tomorrow (Day 2):**
- Test all features (videos, vocabulary, games)
- Fix any bugs you find
- Verify everything works on mobile

**Day 3-4:**
- Deploy to Vercel
- Test live URL
- Set up analytics

**Week 2:**
- Recruit 100 beta users
- Launch beta program

---

## 🆘 TROUBLESHOOTING

### "Cannot find module '@prisma/client'"
**Fix:**
```bash
npx prisma generate
```

### "Database connection failed"
**Fix:**
- Check `DATABASE_URL` in `.env`
- Make sure Neon database is running
- Test connection: `npx prisma studio`

### "JWT_SECRET environment variable is required"
**Fix:**
- Make sure `.env` file exists
- Check `JWT_SECRET` is set
- Restart server after creating `.env`

### Videos show but don't play
**Fix:**
- Check video files exist: `ls public/videos/langfeed/ | head`
- Check browser console for errors
- Try a different browser

### Can't access http://localhost:3001
**Fix:**
- Make sure server is running
- Check terminal for errors
- Try: http://127.0.0.1:3001 instead

---

## ⏱️ TIME TRACKER

**Estimated times:**
- Create .env: 5 min
- Neon setup: 15 min
- Supabase setup: 10 min
- OpenAI setup: 5 min
- Stripe setup: 10 min
- Verify + test: 10 min

**Total: ~1 hour**

---

## 💰 COSTS SO FAR

- Neon: $0 (free tier)
- Supabase: $0 (free tier)
- OpenAI: $50 (one-time setup)
- Stripe: $0 (test mode free)

**Total spent: $50**

---

**Status:** Phase 1, Day 1 of 8-week plan  
**Next milestone:** Day 2 - Test all features  
**End goal:** $2M seed funding in 8 weeks

Let's build this! 🚀

