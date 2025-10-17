# 🚀 LANGFLIX QUICK START GUIDE

**Status:** Infrastructure Complete - Ready for External Service Setup  
**Time to Deploy:** 1-2 hours

---

## ✅ WHAT'S ALREADY DONE

- ✅ Server infrastructure working (825 videos loaded)
- ✅ Database schema ready (28 models)
- ✅ 50+ API endpoints functional
- ✅ CI/CD pipeline configured
- ✅ Deployment scripts ready
- ✅ Monitoring infrastructure created
- ✅ Security hardening complete

---

## 🎯 WHAT YOU NEED TO DO

### Step 1: Set Up External Services (1-2 hours)

#### A. Neon PostgreSQL (30 min) - REQUIRED
```bash
1. Go to: https://console.neon.tech/
2. Create account → New project "langflix-mvp"
3. Copy connection string
4. Update .env:
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   DIRECT_DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

#### B. Supabase Authentication (20 min) - REQUIRED
```bash
1. Go to: https://supabase.com/dashboard
2. Create account → New project "langflix-auth"
3. Go to Settings > API
4. Copy these to .env:
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

#### C. OpenAI API (15 min) - REQUIRED
```bash
1. Go to: https://platform.openai.com/api-keys
2. Create new API key
3. Add $50 credit (required for testing)
4. Update .env:
   OPENAI_API_KEY="sk-proj-your-key"
```

#### D. Stripe Payments (20 min) - REQUIRED
```bash
1. Go to: https://dashboard.stripe.com/
2. Create account
3. Get test keys from Developers > API keys
4. Update .env:
   STRIPE_SECRET_KEY="sk_test_your-key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
```

### Step 2: Verify Setup (5 min)

```bash
# Check environment
npm run setup:check

# Should see all ✅ green checkmarks

# Run database migrations
npx prisma db push

# Start server
npm run start:server

# Test in browser
open http://localhost:3001
```

### Step 3: Deploy to Production (30 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Or use automated script
./scripts/deploy.sh --production
```

#### Add Environment Variables in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Copy all variables from `.env` file
3. Redeploy if needed

---

## 📚 FULL DOCUMENTATION

- **Infrastructure Setup**: `INFRASTRUCTURE_SETUP_GUIDE.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Completion Report**: `AGENT_1_INFRASTRUCTURE_COMPLETE.md`
- **Source of Truth**: `LANGFLIX_SOURCE.md`

---

## 🆘 TROUBLESHOOTING

### Server Won't Start
```bash
# Kill existing process
lsof -ti:3001 | xargs kill -9

# Check environment
npm run setup:check

# Check logs
tail -f logs/server.log
```

### Database Issues
```bash
# Fix schema
npx prisma generate
npx prisma db push

# Open database browser
npx prisma studio
```

### Missing Environment Variables
```bash
# Check what's missing
npm run setup:check

# See TROUBLESHOOTING.md for specific issues
```

---

## ✨ SUCCESS CRITERIA

When everything is working, you should see:

```bash
npm run setup:check
# Output:
✅ NODE_ENV: Configured
✅ PORT: Configured
✅ JWT_SECRET: Configured
✅ SESSION_SECRET: Configured
✅ DATABASE_URL: Configured
✅ SUPABASE_URL: Configured
✅ SUPABASE_ANON_KEY: Configured
✅ SUPABASE_SERVICE_ROLE_KEY: Configured
✅ OPENAI_API_KEY: Configured
✅ STRIPE_SECRET_KEY: Configured
✅ STRIPE_PUBLISHABLE_KEY: Configured
✅ Database connection successful!

✨ ALL REQUIRED SERVICES CONFIGURED!
```

---

## 🎉 NEXT STEPS AFTER DEPLOYMENT

1. **Test the app**: Open deployed URL
2. **Set up monitoring**: Run `./scripts/setup-monitoring.sh`
3. **Configure alerts**: Add Slack webhook to .env
4. **Start Agent 2**: Content ingestion pipeline
5. **Invite beta testers**: Share the URL!

---

**Need Help?** Check `TROUBLESHOOTING.md` or review the complete guide in `DEPLOYMENT_GUIDE.md`

🚀 **Let's ship this!**


