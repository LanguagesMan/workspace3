# 🔧 Admin Guide - VIDA Language Learning Platform

Complete guide for system administrators and platform managers.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Installation & Setup](#installation--setup)
3. [Configuration](#configuration)
4. [Database Management](#database-management)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [Content Management](#content-management)
7. [User Management](#user-management)
8. [Security](#security)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

### Architecture

```
┌─────────────────┐
│   Vercel Edge   │
│     Network     │
└────────┬────────┘
         │
┌────────▼────────┐
│  Express.js API │
│   (Node.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ Supa │  │ Sentry│
│ base │  │       │
└──────┘  └───────┘
```

### Technology Stack

- **Frontend**: Vanilla JavaScript (no framework)
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **Analytics**: Vercel Analytics + Custom tracking
- **Monitoring**: Sentry
- **Hosting**: Vercel (recommended)

### System Requirements

**Minimum:**
- Node.js 16+
- 512MB RAM
- 1GB disk space

**Recommended:**
- Node.js 18+
- 2GB RAM
- 10GB disk space
- CDN for media files

---

## Installation & Setup

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workspace3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Copy the URL and keys to `.env`
   - Run database migrations

5. **Run migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

### Environment Variables

Required variables in `.env`:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
PORT=3001
NODE_ENV=development

# Monitoring (Optional but recommended)
SENTRY_DSN=https://your-sentry-dsn

# External APIs (Optional)
TRANSCRIPTION_API_URL=https://api.transcription.com
TRANSCRIPTION_API_KEY=your-key
TRANSLATION_API_URL=https://api.translation.com
TRANSLATION_API_KEY=your-key
```

---

## Configuration

### Server Configuration

Edit `server.js` for server settings:

```javascript
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// CORS settings
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

### Database Configuration

Configure connection pooling in Supabase:

1. Go to Supabase Dashboard → Settings → Database
2. Set **Connection pooling**: Enabled
3. **Pool size**: 15 (adjust based on traffic)
4. **Idle timeout**: 10 minutes

### Analytics Configuration

**Vercel Analytics:**
- Enable in Vercel dashboard
- No code changes needed

**Custom Analytics:**
Edit `lib/usage-analytics.js`:

```javascript
const analyticsInstance = new UsageAnalytics(
  supabaseUrl,
  supabaseKey,
  {
    batchSize: 10,        // Events per batch
    flushInterval: 5000,  // Flush every 5 seconds
  }
);
```

---

## Database Management

### Schema Overview

Main tables:
- `user_progress` - User learning data
- `vocabulary` - Saved vocabulary
- `usage_analytics` - Analytics events
- `articles` - News articles
- `videos` - Video content
- `quiz_results` - Quiz scores

### Running Migrations

**Apply all migrations:**
```bash
npm run db:migrate
```

**Create new migration:**
```bash
# Create SQL file in supabase/migrations/
# Name format: YYYYMMDD_description.sql
```

**Rollback migration:**
```bash
# Execute rollback SQL manually in Supabase SQL editor
```

### Database Backups

**Automatic backups** (Supabase Pro):
- Daily backups enabled by default
- 7-day retention
- Point-in-time recovery available

**Manual backup:**
```bash
# Using pg_dump
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -b \
  -v \
  -f "backup_$(date +%Y%m%d).dump"
```

**Restore from backup:**
```bash
pg_restore -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -v backup_20251015.dump
```

### Data Maintenance

**Clean old analytics data (>90 days):**

```sql
DELETE FROM usage_analytics 
WHERE timestamp < NOW() - INTERVAL '90 days';
```

**Optimize tables:**

```sql
VACUUM ANALYZE user_progress;
VACUUM ANALYZE usage_analytics;
VACUUM ANALYZE vocabulary;
```

**Check table sizes:**

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Monitoring & Analytics

### Health Monitoring

**Check system health:**
```bash
curl http://localhost:3001/api/health/status
```

**Monitor continuously:**
```bash
watch -n 30 'curl -s http://localhost:3001/api/health/status | jq'
```

### Sentry Error Tracking

**Access Sentry dashboard:**
1. Log in to sentry.io
2. Select your project
3. View errors, performance, and releases

**Key metrics to monitor:**
- Error rate
- Response time
- User impact
- Release health

### Custom Analytics

**View analytics in Supabase:**

```sql
-- Daily active users
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) as dau
FROM usage_analytics
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Most popular content
SELECT 
  event_data->>'article_id' as article_id,
  COUNT(*) as views
FROM usage_analytics
WHERE event_type = 'article_read'
GROUP BY article_id
ORDER BY views DESC
LIMIT 10;

-- User engagement
SELECT 
  user_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT event_type) as event_types,
  MAX(timestamp) as last_activity
FROM usage_analytics
GROUP BY user_id
ORDER BY total_events DESC
LIMIT 100;
```

### Performance Monitoring

**Monitor API response times:**

```javascript
// Add to server.js
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

**Check memory usage:**

```bash
node --expose-gc server.js

# In Node REPL:
const used = process.memoryUsage();
console.log(`Heap: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
```

---

## Content Management

### Adding Videos

1. **Upload video file** to `/public/videos/`
2. **Generate transcription:**
   ```bash
   npm run transcribe
   ```
3. **Add metadata** to database:
   ```sql
   INSERT INTO videos (title, url, language, category, transcription)
   VALUES ('Spanish Lesson 1', '/videos/lesson-1.mp4', 'es', 'education', '{...}');
   ```

### Adding Articles

1. **Create article** in Supabase:
   ```sql
   INSERT INTO articles (title, content, summary, language, difficulty, category)
   VALUES (
     'El Clima en España',
     'Full article content...',
     'Summary...',
     'es',
     'intermediate',
     'weather'
   );
   ```

2. **Or use API:**
   ```bash
   curl -X POST http://localhost:3001/api/articles \
     -H "Content-Type: application/json" \
     -d '{"title":"...","content":"...","language":"es"}'
   ```

### Content Moderation

**Review flagged content:**

```sql
SELECT * FROM content_reports 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

**Remove inappropriate content:**

```sql
UPDATE videos 
SET status = 'removed', 
    removed_reason = 'inappropriate'
WHERE id = 'video_id';
```

---

## User Management

### User Administration

**View user statistics:**

```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE last_sign_in > NOW() - INTERVAL '7 days') as active_7d,
  COUNT(*) FILTER (WHERE last_sign_in > NOW() - INTERVAL '30 days') as active_30d
FROM auth.users;
```

**Find inactive users:**

```sql
SELECT id, email, last_sign_in
FROM auth.users
WHERE last_sign_in < NOW() - INTERVAL '90 days'
ORDER BY last_sign_in DESC;
```

**Reset user progress:**

```sql
DELETE FROM user_progress WHERE user_id = 'user_id';
DELETE FROM vocabulary WHERE user_id = 'user_id';
DELETE FROM quiz_results WHERE user_id = 'user_id';
```

### User Support

**Common support tasks:**

1. **Reset password:**
   - Use Supabase dashboard → Authentication → Users
   - Click user → Send password reset email

2. **Unlock account:**
   ```sql
   UPDATE auth.users 
   SET banned_until = NULL 
   WHERE id = 'user_id';
   ```

3. **Merge duplicate accounts:**
   ```sql
   -- Transfer data from old to new account
   UPDATE vocabulary SET user_id = 'new_id' WHERE user_id = 'old_id';
   UPDATE user_progress SET user_id = 'new_id' WHERE user_id = 'old_id';
   -- Delete old account
   DELETE FROM auth.users WHERE id = 'old_id';
   ```

---

## Security

### Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to git
   - Use different keys for dev/staging/prod
   - Rotate keys every 90 days

2. **Database Security**
   - Enable RLS (Row Level Security)
   - Use service role key only on backend
   - Regular security audits

3. **API Security**
   - Rate limiting enabled
   - Input validation on all endpoints
   - CORS properly configured
   - SQL injection prevention

### Access Control

**Admin roles in Supabase:**

```sql
-- Create admin role
CREATE ROLE admin_user;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin_user;

-- Assign user to role
GRANT admin_user TO specific_user;
```

### Security Monitoring

**Monitor failed login attempts:**

```sql
SELECT 
  email,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM auth.audit_log_entries
WHERE action = 'user_signedin' 
  AND result = 'failure'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY email
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;
```

### Secrets Rotation

**Rotate Supabase keys:**

1. Go to Supabase Dashboard → Settings → API
2. Click "Generate new key"
3. Update all deployments with new key
4. Revoke old key after 24 hours

**Rotate Sentry DSN:**

1. Create new project or key in Sentry
2. Update `SENTRY_DSN` in environment
3. Deploy changes
4. Remove old project/key

---

## Backup & Recovery

### Backup Strategy

**What to backup:**
- Database (daily)
- Media files (weekly)
- Configuration files
- Environment variables (encrypted)

**Backup locations:**
- Primary: Supabase automatic backups
- Secondary: AWS S3 or similar
- Tertiary: Local encrypted backups

### Disaster Recovery

**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 24 hours

**Recovery steps:**

1. **Database restoration:**
   ```bash
   pg_restore -d postgres backup.dump
   ```

2. **Verify data integrity:**
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM articles;
   SELECT COUNT(*) FROM videos;
   ```

3. **Test critical features:**
   - User login
   - Video playback
   - Article reading
   - Quiz functionality

4. **Monitor for issues:**
   - Check error logs
   - Monitor user reports
   - Watch analytics

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Symptom:** "Connection timeout" or "Too many connections"

**Solution:**
```javascript
// Increase connection pool
const supabase = createClient(url, key, {
  db: { poolSize: 20 }
});
```

#### High Memory Usage

**Symptom:** Server crashes or slow performance

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Or use PM2 with memory limits
pm2 start server.js --max-memory-restart 2G
```

#### Slow API Responses

**Symptom:** API calls taking >1 second

**Solution:**
1. Add database indexes
2. Enable query caching
3. Use CDN for static assets
4. Optimize N+1 queries

#### Analytics Not Recording

**Symptom:** No data in analytics table

**Solution:**
```sql
-- Check table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'usage_analytics'
);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'usage_analytics';
```

### Debug Mode

**Enable verbose logging:**

```javascript
// In server.js
if (process.env.DEBUG) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    next();
  });
}
```

**Run with debug mode:**
```bash
DEBUG=true npm start
```

### Getting Help

**Internal escalation:**
1. Check error logs and Sentry
2. Review recent deployments
3. Check system health endpoint
4. Contact development team

**External support:**
- **Supabase**: support@supabase.io
- **Vercel**: support@vercel.com
- **Sentry**: support@sentry.io

---

## Maintenance Schedule

### Daily Tasks
- ✅ Check system health endpoint
- ✅ Review error logs in Sentry
- ✅ Monitor user reports

### Weekly Tasks
- ✅ Review analytics reports
- ✅ Check database performance
- ✅ Update content library
- ✅ Review and moderate flagged content

### Monthly Tasks
- ✅ Database optimization (VACUUM)
- ✅ Review and update dependencies
- ✅ Security audit
- ✅ Backup verification
- ✅ Review user feedback

### Quarterly Tasks
- ✅ Rotate API keys
- ✅ Review access controls
- ✅ Capacity planning
- ✅ Disaster recovery drill

---

## Performance Benchmarks

### Target Metrics

- **API Response Time**: <200ms (p95)
- **Database Query Time**: <50ms (p95)
- **Page Load Time**: <2s (p95)
- **Uptime**: 99.9%
- **Error Rate**: <0.1%

### Monitoring Tools

- **Vercel Analytics**: Page performance
- **Sentry**: Error tracking
- **Supabase Dashboard**: Database metrics
- **Custom Analytics**: User behavior

---

## Changelog & Updates

Keep track of system changes:

```markdown
## 2025-10-15
- Added production monitoring (Sentry + Vercel Analytics)
- Created comprehensive documentation
- Added health monitoring endpoint
- Implemented usage analytics system

## 2025-10-14
- Deployed transcription system
- Added dual-language subtitles
- Improved video performance
```

---

## Contact

**Platform Admin Team:**
- **Email**: admin@vida-learning.com
- **Slack**: #vida-admin
- **On-call**: +1-555-VIDA-911

**Emergency Contacts:**
- **Database Issues**: db-team@vida-learning.com
- **Security Issues**: security@vida-learning.com
- **Infrastructure**: ops@vida-learning.com

---

**Last Updated**: October 15, 2025
**Document Version**: 1.0

