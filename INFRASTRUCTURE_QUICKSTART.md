# 🚀 Infrastructure Quick Start

**Get your Langflix instance running in 10 minutes!**

---

## ⚡ Fast Track Setup

### 1. Install Dependencies (1 min)

```bash
npm install
```

### 2. Configure Secrets (3 min)

```bash
# Copy template
cp .env.example .env

# Edit .env and add these CRITICAL secrets:
# DATABASE_URL=postgresql://...
# JWT_SECRET=$(openssl rand -base64 32)
# OPENAI_API_KEY=sk-...
# SUPABASE_URL=https://...
# SUPABASE_ANON_KEY=...
# SUPABASE_SECRET_KEY=...
```

### 3. Setup Database (2 min)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Server (1 min)

```bash
npm run dev
```

### 5. Verify (30 sec)

```bash
curl http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "healthy",
  "database": { "connected": true }
}
```

---

## 🔴 Minimum Required Secrets

Only these are **CRITICAL** to start:

```env
DATABASE_URL="postgresql://..."           # Get from Supabase
JWT_SECRET="32-char-random-string"        # Generate: openssl rand -base64 32
OPENAI_API_KEY="sk-..."                   # Get from OpenAI
SUPABASE_URL="https://..."                # From Supabase dashboard
SUPABASE_ANON_KEY="..."                   # From Supabase dashboard
SUPABASE_SECRET_KEY="..."                 # From Supabase dashboard
```

---

## 🟡 Recommended Secrets

Add these for production:

```env
DEEPL_API_KEY="..."          # Better translations
SENTRY_DSN="https://..."     # Error tracking
ELEVENLABS_API_KEY="..."     # Text-to-speech
```

---

## 📊 Quick Checks

**Database working?**
```bash
npx prisma studio
# Opens browser at localhost:5555
```

**Logs working?**
```bash
npm run dev
# Should see pretty colored logs
```

**Health endpoint?**
```bash
curl http://localhost:3001/api/health | jq
```

**Tests passing?**
```bash
npm test
```

---

## 🚨 Common Issues

### "JWT_SECRET is required"
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
echo "JWT_SECRET=your-generated-secret" >> .env
```

### "Database connection failed"
```bash
# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npx prisma studio
```

### "Module not found: pino"
```bash
npm install
```

---

## 📚 Full Documentation

- **Complete Setup**: [docs/INFRASTRUCTURE_SETUP.md](docs/INFRASTRUCTURE_SETUP.md)
- **Environment Variables**: [.env.example](.env.example)
- **Implementation Report**: [docs/AGENT_1_IMPLEMENTATION_COMPLETE.md](docs/AGENT_1_IMPLEMENTATION_COMPLETE.md)

---

## 🎯 Next Steps

1. ✅ Get health endpoint returning `"healthy"`
2. ✅ Create test user in Prisma Studio
3. ✅ Test authentication endpoints
4. ✅ Deploy to Vercel
5. ✅ Set up monitoring (Sentry)

---

## 🆘 Need Help?

- **GitHub Issues**: Report bugs/questions
- **Documentation**: [docs/](docs/)
- **Health Check**: `curl localhost:3001/api/health`

---

**Ready to build something amazing! 🚀**

