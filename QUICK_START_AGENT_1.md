# 🚀 Quick Start - Agent 1 Backend

**Branch:** `agent-1-backend`  
**Time:** 15-30 minutes

## 1️⃣ Setup Environment (5 min)

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your_anon_key_here
```

**Get Credentials:**
1. Go to https://app.supabase.com
2. Select your project (or create new)
3. Settings > API
4. Copy `Project URL` and `anon public` key

## 2️⃣ Run Migrations (10 min)

```bash
# Option A: Supabase Dashboard (easiest)
# 1. Go to https://app.supabase.com/project/_/sql
# 2. Copy SQL from: supabase/migrations/add_user_preferences.sql
# 3. Paste and Run
# 4. Repeat for: supabase/migrations/create_articles_table.sql

# Option B: Validate with script
npm run db:validate
```

## 3️⃣ Test Integration (5 min)

```bash
# Run integration tests
npm run test:backend

# Should see:
# ✅ SUPABASE_URL is set
# ✅ SUPABASE_ANON_KEY is set
# ✅ Supabase client configured
# ✅ Query user_preferences table
# ✅ Query articles table
# Success Rate: 100%
```

## 4️⃣ Start Server (2 min)

```bash
# Start the server
npm start

# Server should start on http://localhost:3000
```

## 5️⃣ Test Endpoints (3 min)

```bash
# Test articles feed
curl "http://localhost:3000/api/articles/feed?userId=test&limit=5"

# Should return:
# {
#   "success": true,
#   "articles": [...],
#   "count": 5
# }

# Test article analysis
curl -X POST http://localhost:3000/api/articles/analyze \
  -H "Content-Type: application/json" \
  -d '{"articleText":"Hola, ¿cómo estás? Esta es una prueba."}'

# Should return:
# {
#   "success": true,
#   "analysis": {
#     "cefrLevel": "A2",
#     ...
#   }
# }
```

## 🎯 Success Checklist

- [ ] `.env` file created with real credentials
- [ ] Migrations run successfully
- [ ] `npm run test:backend` shows 100% pass rate
- [ ] Server starts without errors
- [ ] Articles endpoint returns data
- [ ] Articles cached in Supabase database

## 🚨 Common Issues

### "Supabase credentials not found"
→ Make sure `.env` exists and has real values (not placeholders)

### "Table does not exist"
→ Run migrations in Supabase Dashboard SQL Editor

### "Server not running"
→ Start with `npm start`, then re-run tests

### "No articles returned"
→ First request takes 10-30s (fetching RSS). Subsequent requests are instant.

## 📚 Full Documentation

See `BACKEND_SETUP_GUIDE.md` for complete details.

## 🎉 Next Steps

Once everything works:

```bash
# Commit changes
git add .
git commit -m "feat: integrate Supabase backend with article caching"

# Push to branch
git push origin agent-1-backend

# Create pull request to merge into main
```

---

**Questions?** See `BACKEND_SETUP_GUIDE.md` or `AGENT_1_BACKEND_COMPLETE.md`

