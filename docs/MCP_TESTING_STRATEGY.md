# 🧪 MCP Testing Strategy - Complete QA Coverage

**Reference**: Based on `/Users/mindful/.claude/CLAUDE.md` global instructions

---

## 🎯 Core MCP Testing Framework

### 1. **Playwright MCP** - Eyes-On-Glass Coverage

**Primary Tool**: Core visual and functional testing

#### Usage Scenarios:

##### A. Persona Flow Testing
```javascript
// Test beginner user journey
await playright.startServer();
await playright.test({
  persona: 'beginner',
  flow: ['onboarding', 'first-article', 'video-watch', 'word-save']
});

// Test intermediate user
await playright.test({
  persona: 'intermediate',
  flow: ['article-read', 'quiz-complete', 'achievement-unlock']
});

// Test advanced user
await playright.test({
  persona: 'advanced',
  flow: ['advanced-article', 'speed-reading', 'export-to-anki']
});
```

##### B. Guided-Mode Journey
```javascript
// Test complete guided journey: article → video → quiz
await playright.test({
  mode: 'guided',
  sequence: [
    'article-comprehension',
    'video-reinforcement',
    'quiz-validation',
    'progress-update'
  ]
});
```

##### C. Regression Suites
```javascript
// Existing test files
await playright.runSuite('tests/tiktok-video-feed.spec.js');
await playright.runSuite('tests/langflix-app.spec.js');
await playright.runSuite('tests/complete-app-test.spec.js');

// Visual diff testing
await playright.compareScreenshots({
  baseline: 'screenshots/baseline/',
  current: 'screenshots/current/',
  threshold: 0.01  // 1% diff tolerance
});
```

##### D. Autoload QA Artifacts
```javascript
// Automatically capture on failure
await playright.onFailure(async (test) => {
  await test.screenshot({ path: `screenshots/failures/${test.name}.png` });
  await test.trace({ path: `traces/${test.name}.zip` });
  await test.video({ path: `videos/${test.name}.webm` });
});
```

**Test Execution**:
```bash
# Start Playwright MCP server
npx playwright test --headed  # Visual mode
npx playwright test --trace on  # With trace artifacts
npx playwright show-report  # View results
```

---

### 2. **Serena (Analysis) MCP** - Log & Telemetry Audit

**Purpose**: Analyze logs, telemetry, and engagement metrics

#### Usage Scenarios:

##### A. Parse Logs for Spikes
```javascript
// Audit Sentry/Pino logs
await serena.parseLogs({
  source: 'sentry',
  timeRange: 'last-24h',
  flagSpikes: true,
  threshold: '10x-above-baseline'
});

// Example output:
// ⚠️ Spike detected: 429 errors increased 15x in last hour
// ⚠️ Anomaly: Video load time spiked from 200ms to 2s
```

##### B. Inspect Ranking Debug Endpoints
```javascript
// Check feed algorithm performance
await serena.inspectEndpoint({
  url: '/api/debug/ranking',
  metrics: ['click-through-rate', 'time-on-video', 'completion-rate']
});

// Flag anomalies
// ⚠️ Anomaly: CTR dropped 30% for intermediate users
// ✅ Normal: Advanced user engagement stable
```

##### C. Suggest Weight Adjustments
```javascript
// Analyze engagement stats and recommend changes
await serena.analyzeEngagement({
  period: 'last-7-days',
  userLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
});

// Example output:
// 📊 Recommendation: Increase video weight for A1 users (engagement +40% vs articles)
// 📊 Recommendation: Reduce quiz frequency for C1 users (drop-off spike)
```

**Implementation**:
```bash
# Query Serena MCP for log analysis
serena analyze --logs ./logs/production.log --period 24h
serena audit --endpoint /api/feed/videos --threshold 10x
serena recommend --metric engagement --level A1
```

---

### 3. **Firecrawl MCP** - Content QA

**Purpose**: Crawl and verify content ingestion

#### Usage Scenarios:

##### A. Periodically Crawl New Content
```javascript
// Crawl new articles/news
await firecrawl.crawl({
  sources: [
    'https://elpais.com',
    'https://bbc.com/mundo',
    'https://cnn.com/espanol'
  ],
  frequency: 'daily',
  verifyMetadata: true
});

// Verify ingestion
await firecrawl.verifyIngestion({
  expectedFields: ['title', 'content', 'level', 'category', 'source'],
  requiredQuality: 'high'
});
```

##### B. Cross-Check Licensing
```javascript
// Check licensing markers
await firecrawl.checkLicensing({
  sources: ['scraped-articles'],
  verifyAttribution: true,
  checkCopyright: true
});

// Update compliance dashboard
await firecrawl.updateCompliance({
  dashboard: '/admin/compliance',
  status: 'all-clear'
});
```

**API Integration**:
```bash
# Use Firecrawl API (key: fc-5c92f42486554494b59214b4fc48a38b)
curl -X POST https://api.firecrawl.dev/v0/scrape \
  -H "Authorization: Bearer fc-5c92f42486554494b59214b4fc48a38b" \
  -d '{"url": "https://elpais.com/..."}' \
  | jq '.metadata'
```

---

### 4. **GitHub MCP** - Static Review

**Purpose**: Enforce architecture and schema integrity

#### Usage Scenarios:

##### A. Enforce Architectural Guidelines
```javascript
// Check for direct file access violations
await github.enforceRules({
  rule: 'no-direct-file-access',
  pattern: 'fs.readFile|fs.writeFile',
  exclude: ['lib/services/file-service.js']
});

// Enforce service layer usage
await github.enforceRules({
  rule: 'use-service-layer',
  pattern: 'import.*from.*lib/((?!services).)*',
  message: 'Must use service layer, not direct access'
});
```

##### B. Schema Drift Checks
```javascript
// Ensure migrations are in sync with Supabase
await github.checkSchemaDrift({
  local: 'prisma/schema.prisma',
  remote: 'supabase://production',
  autoFix: false
});

// Run migration checks
await github.runMigrations({
  verify: true,
  dryRun: true
});
```

**GitHub Actions Integration**:
```yaml
# .github/workflows/static-review.yml
name: Static Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run GitHub MCP
        run: |
          github-mcp enforce-architecture
          github-mcp check-schema-drift
          github-mcp verify-migrations
```

---

## 🔄 Complete Testing Workflow

### Daily Automated Testing
```bash
# 1. Playwright MCP - Regression suite
npx playwright test tests/*.spec.js --trace on

# 2. Serena MCP - Log analysis
serena analyze --logs production --period 24h

# 3. Firecrawl MCP - Content verification
firecrawl verify --sources all --period 24h

# 4. GitHub MCP - Schema check
github-mcp check-schema-drift
```

### Pre-Deployment Checklist
```bash
# 1. Full Playwright suite with personas
npx playwright test --grep "persona|guided|regression"

# 2. Serena engagement analysis
serena recommend --all-levels

# 3. Firecrawl content audit
firecrawl audit --comprehensive

# 4. GitHub architecture review
github-mcp enforce-all-rules

# 5. Visual regression
npx playwright test --update-snapshots
```

### Post-Deployment Monitoring
```bash
# 1. Serena real-time monitoring
serena monitor --live --alerts

# 2. Playwright smoke tests
npx playwright test tests/smoke/*.spec.js

# 3. Firecrawl content health
firecrawl health-check

# 4. GitHub schema validation
github-mcp validate-production-schema
```

---

## 📊 MCP Integration Matrix

| MCP | Primary Use | Frequency | Automation |
|-----|-------------|-----------|------------|
| **Playwright** | Visual/Functional Testing | Every PR + Nightly | ✅ CI/CD |
| **Serena** | Log Analysis & Metrics | Hourly | ✅ Scheduled |
| **Firecrawl** | Content QA | Daily | ✅ Cron |
| **GitHub** | Static Review | Every PR | ✅ CI/CD |

---

## 🎯 Success Metrics

### Playwright MCP
- ✅ 100% test pass rate
- ✅ <5% visual diff tolerance
- ✅ All personas tested

### Serena MCP
- ✅ Zero log spikes >10x baseline
- ✅ Engagement recommendations applied
- ✅ Anomaly detection <1min

### Firecrawl MCP
- ✅ 100% metadata validation
- ✅ Zero licensing violations
- ✅ Content freshness <24h

### GitHub MCP
- ✅ Zero architecture violations
- ✅ Schema in sync
- ✅ All migrations verified

---

**Last Updated**: 2025-10-16
**Reference**: `/Users/mindful/.claude/CLAUDE.md`
