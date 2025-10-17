# 🏗️ Infrastructure & Database Setup Guide

Complete guide for setting up production infrastructure for Langflix.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Secret Management](#secret-management)
- [Database Setup](#database-setup)
- [CI/CD Configuration](#cicd-configuration)
- [Observability](#observability)
- [Deployment](#deployment)

---

## Prerequisites

### Required Accounts

1. **Supabase** (Database)
   - Sign up: https://supabase.com
   - Create new project
   - Note: Database URL, Anon Key, Service Key

2. **OpenAI** (AI Services)
   - Sign up: https://platform.openai.com
   - Create API key
   - Add billing method

3. **Sentry** (Error Tracking)
   - Sign up: https://sentry.io
   - Create project
   - Get DSN

4. **Vercel** (Deployment - Optional)
   - Sign up: https://vercel.com
   - Install Vercel CLI: `npm install -g vercel`

### Development Tools

```bash
# Install Node.js 18+
nvm install 18
nvm use 18

# Install dependencies
npm install

# Install Prisma CLI globally (optional)
npm install -g prisma
```

---

## Secret Management

### 1. Environment Variables Setup

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Fill in Critical Variables

**🔴 CRITICAL (Required for startup):**

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/db"

# Authentication
JWT_SECRET="generate-with-openssl-rand-base64-32"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SECRET_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# AI Services
OPENAI_API_KEY="sk-your-openai-key"
```

**🟡 HIGH (Recommended):**

```env
# Translation
DEEPL_API_KEY="your-deepl-key"

# Monitoring
SENTRY_DSN="https://your-dsn@sentry.io/project"
```

**🟢 OPTIONAL (Enhances features):**

See `.env.example` for complete list.

### 3. Generate Secrets

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

### 4. Secret Management Tools (Production)

**Option A: Doppler**

```bash
# Install Doppler CLI
brew install doppler

# Login
doppler login

# Setup project
doppler setup

# Run with Doppler
doppler run -- npm start
```

**Option B: 1Password**

```bash
# Install 1Password CLI
brew install --cask 1password-cli

# Sign in
op signin

# Load secrets
eval $(op signin)
```

**Option C: AWS Secrets Manager**

```bash
# Install AWS CLI
brew install awscli

# Configure
aws configure

# Create secret
aws secretsmanager create-secret \
  --name langflix/production \
  --secret-string file://.env
```

---

## Database Setup

### 1. Supabase Project Setup

1. Go to https://supabase.com/dashboard
2. Create new project
3. Choose region closest to your users
4. Wait for database provisioning (~2 minutes)

### 2. Get Connection Strings

**Connection Pooler (Recommended for serverless):**

```
postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true
```

**Direct Connection (For migrations):**

```
postgresql://postgres:[password]@[host]:5432/postgres
```

### 3. Configure Environment

Update `.env`:

```env
DATABASE_URL="postgresql://postgres:your-password@db.your-project.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
```

### 4. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

### 5. Verify Connection

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Connected'))
  .catch(e => console.error('❌ Error:', e))
  .finally(() => prisma.\$disconnect());
"
```

### 6. Migrate from SQLite (If applicable)

If you have existing SQLite data:

```bash
# Set both connection strings in .env
DATABASE_URL_SQLITE="file:./dev.db"
DATABASE_URL="postgresql://..."

# Run migration script
node scripts/migrate-to-postgres.js
```

---

## CI/CD Configuration

### 1. GitHub Secrets Setup

Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:

```
VERCEL_TOKEN           # Vercel deployment token
VERCEL_ORG_ID          # Vercel organization ID
VERCEL_PROJECT_ID      # Vercel project ID
PRODUCTION_URL         # Production URL for health checks
DATABASE_URL           # Production database URL (if running migrations in CI)
SENTRY_AUTH_TOKEN      # Sentry authentication token (optional)
```

### 2. Get Vercel Tokens

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Get project info
cat .vercel/project.json

# Create token: https://vercel.com/account/tokens
```

### 3. Configure Workflows

The CI/CD pipeline includes:

- ✅ Security scanning
- ✅ Secret validation
- ✅ Unit tests
- ✅ Integration tests (Playwright)
- ✅ Database migration checks
- ✅ Automatic deployment
- ✅ Health checks

### 4. Environment Variables in Vercel

Add all environment variables to Vercel:

```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add OPENAI_API_KEY production
# ... etc

# Or via Dashboard: https://vercel.com/your-project/settings/environment-variables
```

### 5. Test CI/CD Pipeline

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make small change
echo "# CI Test" >> README.md

# Push to trigger CI
git add .
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline

# Watch Actions: https://github.com/your-repo/actions
```

---

## Observability

### 1. Sentry Setup

**Create Project:**

1. Go to https://sentry.io
2. Create new project → Node.js
3. Copy DSN

**Configure:**

```env
SENTRY_DSN="https://your-key@o123.ingest.sentry.io/456"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACES_SAMPLE_RATE="0.1"
```

**Test:**

```bash
node -e "
require('dotenv').config();
const { initializeSentry, captureMessage } = require('./lib/sentry-config');
initializeSentry();
captureMessage('Test message from setup', 'info');
console.log('✅ Check Sentry dashboard for test message');
"
```

### 2. Logging with Pino

Install dependencies:

```bash
npm install pino pino-pretty
```

**Usage:**

```javascript
const { logger } = require('./lib/logger');

logger.info('Server started');
logger.error({ err: error }, 'Failed to connect');
```

**View Logs:**

```bash
# Development (pretty)
npm run dev

# Production (JSON)
NODE_ENV=production npm start | pino-pretty
```

### 3. Health Endpoint

**Test locally:**

```bash
curl http://localhost:3001/api/health | jq
```

**Response:**

```json
{
  "status": "healthy",
  "uptime": 3600,
  "database": {
    "connected": true,
    "type": "PostgreSQL"
  },
  "memory": {
    "heapUsed": 45,
    "heapTotal": 60,
    "unit": "MB"
  },
  "services": {
    "openai": true,
    "deepl": true,
    "sentry": true
  }
}
```

### 4. Monitoring Setup

**Uptime Monitoring:**

- UptimeRobot: https://uptimerobot.com (Free)
- Pingdom: https://pingdom.com
- Better Uptime: https://betteruptime.com

**Configure:**

1. Add health endpoint: `https://your-app.vercel.app/api/health`
2. Set check interval: 5 minutes
3. Configure alerts (email/Slack)

**Application Performance:**

- Sentry Performance: Enable in config
- Vercel Analytics: Automatic
- Custom metrics: Use Pino + Sentry

---

## Deployment

### 1. Vercel Deployment (Recommended)

**First-time setup:**

```bash
# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Automatic deployment:**

- Push to `main` triggers production deployment
- Pull requests get preview deployments
- See: `.github/workflows/ci-production.yml`

### 2. Docker Deployment

**Build image:**

```bash
docker build -t langflix:latest .
```

**Run container:**

```bash
docker run -d \
  --name langflix \
  -p 3001:3001 \
  --env-file .env \
  langflix:latest
```

**Using docker-compose:**

```bash
docker-compose up -d
```

### 3. Traditional Server Deployment

**Using PM2:**

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs langflix

# Restart
pm2 restart langflix

# Startup script
pm2 startup
pm2 save
```

### 4. Post-Deployment Checklist

- [ ] Verify health endpoint: `curl https://your-app.com/api/health`
- [ ] Check database connection
- [ ] Test authentication (signup/login)
- [ ] Verify Sentry is receiving events
- [ ] Check logs for errors
- [ ] Test critical user flows
- [ ] Monitor performance in Vercel/Sentry
- [ ] Set up uptime monitoring

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset

# Check migrations
npx prisma migrate status
```

### Secret Management Issues

```bash
# Verify secrets are loaded
node -e "console.log(Object.keys(process.env).filter(k => k.includes('API')))"

# Check .env file
cat .env | grep -v "^#" | grep -v "^$"
```

### CI/CD Issues

```bash
# Test locally
npm ci
npm run build
npm test

# Check GitHub Actions logs
# Go to: https://github.com/your-repo/actions
```

### Deployment Issues

```bash
# Check Vercel logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod --force
```

---

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.env` (in `.gitignore`)
   - Use `.env.example` for templates

2. **Rotate secrets regularly**
   - JWT secrets: Every 90 days
   - API keys: When team members leave
   - Database passwords: Quarterly

3. **Use strong secrets**
   - Minimum 32 characters
   - Use `openssl rand -base64 32`

4. **Separate environments**
   - Development: `.env.local`
   - Staging: `.env.staging`
   - Production: Vercel/Doppler

5. **Monitor for leaks**
   - GitHub Actions: TruffleHog
   - Pre-commit hooks: git-secrets

6. **Principle of least privilege**
   - Use read-only keys when possible
   - Limit API key scopes
   - Use service accounts

---

## Next Steps

1. ✅ Complete this infrastructure setup
2. ✅ Test in development
3. ✅ Deploy to staging (if available)
4. ✅ Run full test suite
5. ✅ Deploy to production
6. ✅ Monitor for 24 hours
7. ✅ Set up alerting
8. ✅ Document runbooks

---

## Support

- **Documentation**: `/docs`
- **Issues**: GitHub Issues
- **Slack**: #infrastructure (if applicable)

---

**Last Updated**: October 2025
**Maintained By**: Infrastructure Team

