# Global MCP Mandate - Always-On Tools for All Projects

## 🎯 Core Principle

**These MCP tools are MANDATORY and ALWAYS ACTIVE across ALL projects and ALL Claude Code sessions. Zero exceptions.**

---

## 🔧 Required MCP Servers (User Scope - Global)

### 1. Ref MCP (`@upstash/ref`)

**Purpose**: Cross-project reference management, pattern reuse, and architectural consistency

**Why Ref > Context7**:
- Explicit reference storage (not just semantic search)
- Project-agnostic code snippets library
- Version-controlled pattern catalog
- Direct code reuse across projects

**Installation** (User scope - applies to ALL projects):
```bash
# Install globally for all Claude Code projects
npm install -g @upstash/ref
```

**Configuration** (`~/.config/claude-code/mcp_servers.json`):
```json
{
  "ref": {
    "command": "npx",
    "args": ["-y", "@upstash/ref"],
    "env": {
      "UPSTASH_REDIS_REST_URL": "your_upstash_redis_url",
      "UPSTASH_REDIS_REST_TOKEN": "your_upstash_token"
    }
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS query Ref BEFORE planning
- **SIMPLER MODE**: Use for quick pattern lookups
- **Integration**: Reuse verified patterns from past projects

**Example**:
```javascript
// Before implementing any feature, check Ref
const reusablePatterns = await mcp__ref__search({
  query: "OAuth2 authentication implementation",
  tags: ["security", "auth", "production-tested"],
  minQualityScore: 9  // Only use proven patterns
});

// Use verified patterns in planning
const plan = generatePlanBasedOn(reusablePatterns);

// After successful implementation, store for future reuse
await mcp__ref__store({
  name: "OAuth2_GitHub_JWT_Implementation",
  code: finalImplementation,
  tags: ["auth", "oauth2", "github", "jwt"],
  qualityScore: criticScore,
  projects: ["workspace3"],
  documentation: "Production-tested OAuth2 with GitHub + JWT..."
});
```

---

### 2. Serena MCP (Semantic Code Editing)

**Purpose**: IDE-like code manipulation with 93% token reduction

**Configuration** (Already set up):
```json
{
  "serena": {
    "command": "/tmp/serena/.venv/bin/serena-mcp-server",
    "args": ["--context", "ide-assistant", "--project", "${PROJECT_ROOT}"]
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: PRIMARY tool for ALL code edits
- **SIMPLER MODE**: Skip (too heavy for simple queries)
- **Token Savings**: 93% reduction vs Read+Edit

**Usage Rules**:
```javascript
// ❌ NEVER DO THIS (wasteful)
await Read({ file_path: "auth.js" });  // 10,000 tokens
await Edit({ old_string: "...", new_string: "..." });  // High risk

// ✅ ALWAYS DO THIS (efficient)
await mcp__serena__find_symbol({ name: "handleAuth" });  // 50 tokens
await mcp__serena__replace_symbol_body({
  symbol: "handleAuth",
  new_body: "// New implementation"
});  // 500 tokens
```

---

### 3. Playwright MCP (`@executeautomation/playwright-mcp-server`)

**Purpose**: Visual testing, screenshot comparison, UI validation

**Configuration** (Already set up):
```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@executeautomation/playwright-mcp-server"]
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS run after UI changes
- **Screenshot Comparison**: MANDATORY for visual features
- **Top App Benchmarking**: REQUIRED for quality parity

**Critical Workflow** (ALWAYS execute for UI features):
```javascript
// Step 1: Implement feature
await implementFeature();

// Step 2: Screenshot YOUR implementation
const ourScreenshot = await mcp__playwright__screenshot({
  url: "http://localhost:3002/video-feed",
  path: "./screenshots/our-version.png"
});

// Step 3: Screenshot TOP COMPETING APP (TikTok, Instagram, etc.)
const topAppScreenshot = await mcp__playwright__screenshot({
  url: "https://tiktok.com/@trending",  // Or Instagram, YouTube Shorts, etc.
  path: "./screenshots/tiktok-reference.png"
});

// Step 4: Visual comparison (mandatory quality gate)
const comparison = await compareScreenshots({
  ours: ourScreenshot,
  reference: topAppScreenshot,
  acceptableVariance: 5  // 5% visual difference max
});

if (comparison.difference > 5) {
  console.log("❌ FAIL: Visual quality below TikTok standard");
  console.log(`Differences: ${comparison.issues}`);
  // Iterate until visual parity achieved
}
```

---

### 4. Sequential Thinking MCP

**Purpose**: Structured Chain-of-Thought reasoning for MCTS planning

**Configuration** (Already set up):
```json
{
  "sequential-thinking": {
    "command": "/opt/homebrew/bin/mcp-server-sequential-thinking",
    "args": []
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS use for planning
- **SIMPLER MODE**: NEVER use (too expensive)
- **MCTS**: Required for exploring alternative plans

---

### 5. Qdrant MCP (Vector Database)

**Purpose**: Persistent memory, RAG, learning from past trajectories

**Configuration** (Already set up):
```json
{
  "qdrant": {
    "command": "uvx",
    "args": ["mcp-server-qdrant"],
    "env": {
      "QDRANT_URL": "http://localhost:6333",
      "COLLECTION_NAME": "claude_code_knowledge"
    }
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS check for similar past solutions
- **Learning**: Store successful trajectories (Critic score ≥9)
- **Cross-Project Learning**: Query patterns from all projects

---

### 6. Supabase MCP

**Purpose**: Database operations, authentication, real-time subscriptions, edge functions

**Why Supabase Essential**:
- Centralized backend for ALL projects
- Real-time data synchronization
- Built-in authentication and authorization
- Vector similarity search (perfect with Qdrant)
- Edge functions for serverless backend logic

**Installation** (User scope):
```bash
npm install -g @modelcontextprotocol/server-supabase
```

**Configuration** (`~/.config/claude-code/mcp_servers.json`):
```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-supabase"],
    "env": {
      "SUPABASE_URL": "https://your-project.supabase.co",
      "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
    }
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS use for database operations
- **User Data**: Store user profiles, progress, achievements
- **Real-time**: Subscribe to data changes
- **Vector Search**: Combine with Qdrant for semantic search

**Example**:
```javascript
// Before implementing database schema
const existingSchema = await mcp__supabase__get_schema({
  tables: ["users", "vocabulary", "progress"]
});

// Execute migration
await mcp__supabase__execute_sql({
  query: `
    CREATE TABLE vocabulary_learned (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id),
      word TEXT NOT NULL,
      learned_at TIMESTAMP DEFAULT NOW(),
      review_count INT DEFAULT 0
    );
  `
});

// Query with real-time subscription
await mcp__supabase__subscribe({
  table: "vocabulary_learned",
  event: "INSERT",
  callback: async (newWord) => {
    // Update UI in real-time when user learns new word
  }
});
```

---

### 7. Firecrawl MCP (`@mendable/firecrawl-mcp`)

**Purpose**: AUTOMATIC competitive intelligence gathering by crawling top apps BEFORE implementing ANY feature

**Why Firecrawl is CRITICAL**:
- Real-time scraping of top competing apps (TikTok, Duolingo, Instagram)
- Extract UI patterns, interaction flows, UX decisions
- Benchmarking data for quality comparison
- MUST be used BEFORE planning any user-facing feature

**Configuration** (Already set up):
```json
{
  "firecrawl": {
    "command": "npx",
    "args": ["-y", "@mendable/firecrawl-mcp"],
    "env": {
      "FIRECRAWL_API_KEY": "fc-5c92f42486554494b59214b4fc48a38b"
    }
  }
}
```

**MANDATORY AUTOMATIC CRAWLING TRIGGERS**:

The system MUST automatically invoke Firecrawl when detecting these intent patterns:

```javascript
const AUTO_CRAWL_TRIGGERS = {
  // Video feed features
  "video.*feed|infinite.*scroll|video.*player": {
    sites: [
      "https://tiktok.com/@trending",
      "https://instagram.com/reels",
      "https://youtube.com/shorts"
    ],
    extract: ["scroll_mechanics", "video_transitions", "engagement_buttons"]
  },

  // Gamification features
  "gamif|achievement|badge|streak|xp|level": {
    sites: [
      "https://duolingo.com",
      "https://memrise.com",
      "https://www.khanacademy.org"
    ],
    extract: ["achievement_ui", "progress_tracking", "reward_animations"]
  },

  // Vocabulary/learning features
  "vocabulary|flashcard|quiz|review|spaced.*repetition": {
    sites: [
      "https://duolingo.com/learn",
      "https://quizlet.com",
      "https://ankiweb.net"
    ],
    extract: ["card_design", "review_flow", "feedback_mechanisms"]
  },

  // Social features
  "share|social|friend|leaderboard": {
    sites: [
      "https://duolingo.com/leaderboards",
      "https://strava.com",
      "https://fitbit.com"
    ],
    extract: ["social_widgets", "sharing_ui", "leaderboard_design"]
  },

  // Onboarding/auth
  "onboard|signup|login|auth|oauth": {
    sites: [
      "https://duolingo.com",
      "https://notion.so",
      "https://figma.com"
    ],
    extract: ["onboarding_flow", "auth_ui", "welcome_screens"]
  }
};
```

**Automatic Workflow**:
```javascript
async function autoFirecrawl(userRequest) {
  // 1. Detect if Firecrawl needed
  for (const [pattern, config] of Object.entries(AUTO_CRAWL_TRIGGERS)) {
    if (new RegExp(pattern, 'i').test(userRequest)) {
      console.log(`🔥 Auto-triggering Firecrawl for: ${pattern}`);

      // 2. Crawl all relevant sites in parallel
      const crawlResults = await Promise.all(
        config.sites.map(url =>
          mcp__firecrawl__firecrawl_scrape({
            url: url,
            extract: config.extract,
            screenshot: true,
            formats: ["markdown", "html"]
          })
        )
      );

      // 3. Save to competitive intelligence database
      await saveCompetitiveIntel({
        feature: pattern,
        sites: config.sites,
        data: crawlResults,
        timestamp: new Date().toISOString()
      });

      // 4. Use in planning
      return crawlResults;
    }
  }

  return null;  // No auto-crawl needed
}
```

**Example Usage** (Automatic):
```javascript
// User: "Add video sharing to the feed"
// System AUTOMATICALLY detects "video" + "share" triggers

// 1. Auto-crawls TikTok, Instagram, YouTube for sharing UI
const competitiveUI = await autoFirecrawl("Add video sharing to the feed");

// 2. Extracts patterns:
// - TikTok: Bottom-right share button with slide-up modal
// - Instagram: Airplane icon, direct message integration
// - YouTube: Share icon with platform picker

// 3. Uses in MCTS planning:
const plan = await planWithMCTS({
  task: "Add video sharing",
  competitiveIntel: competitiveUI,
  bestPractices: extractBestPractices(competitiveUI)
});

// Result: Implementation matches top app patterns automatically
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS crawl top 3 apps BEFORE planning user-facing features
- **Research**: Extract UI patterns, UX flows, design systems
- **Benchmarking**: Compare implementation to top apps
- **Quality Gate**: Reject if doesn't match crawled patterns

**API Key**: `fc-5c92f42486554494b59214b4fc48a38b` (Already configured)

---

### 8. Stripe MCP

**Purpose**: Payment processing, subscription management, revenue optimization

**Why Stripe Essential**:
- Monetization for premium features
- Subscription management (monthly/annual plans)
- One-time payments (lifetime access)
- Usage-based billing
- Revenue analytics

**Installation** (User scope):
```bash
npm install -g @modelcontextprotocol/server-stripe
```

**Configuration** (`~/.config/claude-code/mcp_servers.json`):
```json
{
  "stripe": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-stripe"],
    "env": {
      "STRIPE_SECRET_KEY": "sk_test_...",
      "STRIPE_PUBLISHABLE_KEY": "pk_test_..."
    }
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS use for payment features
- **Premium Features**: Gate content behind subscriptions
- **Analytics**: Track MRR, churn, LTV

**Example**:
```javascript
// Create subscription product
await mcp__stripe__create_product({
  name: "Premium Learning Plan",
  description: "Unlimited vocabulary, AI tutoring, advanced analytics",
  prices: [
    { amount: 999, interval: "month" },  // $9.99/month
    { amount: 9900, interval: "year" }   // $99/year (17% discount)
  ]
});

// Check subscription status
const subscription = await mcp__stripe__get_subscription({
  customerId: user.stripeCustomerId
});

if (subscription.status === "active") {
  // Unlock premium features
}
```

---

### 9. Vercel MCP

**Purpose**: Deployment, serverless functions, edge computing, analytics

**Why Vercel Essential**:
- Zero-config deployments
- Edge functions for global performance
- Analytics and real user monitoring
- Preview deployments for every PR
- Automatic HTTPS and CDN

**Installation** (User scope):
```bash
npm install -g @modelcontextprotocol/server-vercel
```

**Configuration** (`~/.config/claude-code/mcp_servers.json`):
```json
{
  "vercel": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-vercel"],
    "env": {
      "VERCEL_TOKEN": "your_vercel_token",
      "VERCEL_PROJECT_ID": "your_project_id",
      "VERCEL_ORG_ID": "your_org_id"
    }
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS deploy to Vercel after integration
- **Preview Deployments**: Automatic for every PR
- **Production**: Deploy after Critic approval
- **Analytics**: Monitor real user performance

**Example**:
```javascript
// Deploy to preview environment
const deployment = await mcp__vercel__create_deployment({
  project: "workspace3",
  target: "preview",
  source: "github",
  gitBranch: currentBranch
});

console.log(`Preview: ${deployment.url}`);

// After approval, promote to production
await mcp__vercel__promote_to_production({
  deploymentId: deployment.id
});

// Check analytics
const analytics = await mcp__vercel__get_analytics({
  projectId: "workspace3",
  period: "7d"
});

console.log(`Page views: ${analytics.pageViews}`);
console.log(`Avg load time: ${analytics.avgLoadTime}ms`);
```

**Integration with GitHub**:
- PR created → Vercel preview deployed automatically
- PR approved → Vercel production deployed
- Comments on PR with preview URL

---

### 10. GitHub MCP

**Purpose**: PR creation, issue management, CI/CD

**Configuration** (Already set up):
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
    }
  }
}
```

**Mandatory Usage**:
- **GENIUS MODE**: ALWAYS create PR after integration
- **Issue Tracking**: Link commits to issues
- **CI/CD**: Trigger workflows automatically

---

## 🎨 Visual Quality Mandate (CRITICAL)

### Always Compare to Top Apps

**RULE: For ANY visual feature, ALWAYS screenshot top 3 competing apps and compare.**

#### Step-by-Step Visual Quality Process

```javascript
async function ensureVisualParity(featureName, ourURL, topApps) {
  console.log(`🎨 Visual Quality Check: ${featureName}`);

  // 1. Screenshot OUR implementation
  const ourScreenshot = await mcp__playwright__screenshot({
    url: ourURL,
    path: `./screenshots/audit/${featureName}-ours.png`,
    fullPage: true
  });

  // 2. Screenshot TOP 3 APPS
  const topScreenshots = [];
  for (const app of topApps) {
    const screenshot = await mcp__playwright__screenshot({
      url: app.url,
      path: `./screenshots/competitive/${app.name}-${featureName}.png`,
      fullPage: true
    });
    topScreenshots.push({ name: app.name, path: screenshot.path });
  }

  // 3. Visual comparison analysis
  const analysis = await analyzeVisualQuality({
    ours: ourScreenshot,
    references: topScreenshots,
    criteria: [
      "scroll_smoothness",
      "animation_quality",
      "button_positioning",
      "color_contrast",
      "spacing_consistency",
      "loading_states",
      "error_states"
    ]
  });

  // 4. Quality gate
  if (analysis.overallScore < 9.0) {
    console.log("❌ VISUAL QUALITY BELOW STANDARD");
    console.log(`Score: ${analysis.overallScore}/10`);
    console.log("Issues:");
    for (const issue of analysis.issues) {
      console.log(`  - ${issue.category}: ${issue.description}`);
      console.log(`    Reference: ${issue.topAppExample}`);
    }

    // 5. Iterate until quality achieved
    throw new Error("Visual parity not achieved. Iterate on design.");
  }

  console.log("✅ VISUAL QUALITY MATCHES TOP APPS");
  return analysis;
}
```

#### Mandatory Top Apps for Comparison

**Language Learning App Context**:
1. **Duolingo** (`https://duolingo.com`)
   - Screenshot: Gamification, progress tracking, lesson UI
   - Benchmark: User engagement patterns, achievement systems

2. **TikTok** (`https://tiktok.com`)
   - Screenshot: Video feed, scroll mechanics, engagement buttons
   - Benchmark: Infinite scroll smoothness, video transitions

3. **Instagram Reels** (`https://instagram.com/reels`)
   - Screenshot: Short-form video UI, interaction patterns
   - Benchmark: Button positioning, visual polish

**Always-On Comparison Matrix**:
```javascript
const MANDATORY_COMPARISONS = {
  "video_feed": {
    topApps: ["tiktok", "instagram_reels", "youtube_shorts"],
    criteria: ["scroll_snap", "transition_smoothness", "loading_skeleton"]
  },
  "gamification": {
    topApps: ["duolingo", "memrise", "babbel"],
    criteria: ["achievement_badges", "progress_bars", "streak_visualization"]
  },
  "vocabulary_review": {
    topApps: ["duolingo", "anki", "quizlet"],
    criteria: ["card_design", "swipe_mechanics", "feedback_animations"]
  }
};
```

---

## 🚀 Global Activation Checklist

### For Current Project (workspace3)

✅ Already configured:
- Sequential Thinking MCP
- Serena MCP
- Playwright MCP
- Qdrant MCP
- GitHub MCP

⚠️ TODO:
- [ ] Add Ref MCP (`@upstash/ref`)
- [ ] Configure Upstash Redis credentials
- [ ] Add Supabase MCP (`@modelcontextprotocol/server-supabase`)
- [ ] Configure Supabase URL and service role key
- [ ] Set up automatic screenshot comparison workflow
- [ ] Create `.claude/competitive-benchmarks.json` with top app URLs
- [ ] Initialize Ref library with current project's proven patterns
- [ ] Connect Supabase vector search with Qdrant for hybrid RAG

### For ALL Future Projects (Global Setup)

**Edit global MCP config** (`~/.config/claude-code/mcp_servers.json`):

```bash
# 1. Open global config
code ~/.config/claude-code/mcp_servers.json

# 2. Add Ref MCP (if not present)
{
  "ref": {
    "command": "npx",
    "args": ["-y", "@upstash/ref"],
    "env": {
      "UPSTASH_REDIS_REST_URL": "your_upstash_url",
      "UPSTASH_REDIS_REST_TOKEN": "your_upstash_token"
    }
  }
}

# 3. Add Supabase MCP
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-supabase"],
    "env": {
      "SUPABASE_URL": "https://your-project.supabase.co",
      "SUPABASE_SERVICE_ROLE_KEY": "your_key"
    }
  }
}

# 4. Ensure all others are at USER scope (not project-specific)
# - sequential-thinking
# - playwright
# - github
# - qdrant
# - supabase
```

**Verify global availability**:
```bash
# Check MCP servers are loaded
claude mcp list --scope user

# Expected output:
# ✅ sequential-thinking
# ✅ serena
# ✅ playwright
# ✅ qdrant
# ✅ github
# ✅ ref
```

---

## 🎯 Workflow Integration (MANDATORY)

### GENIUS MODE Workflow (Enhanced with MCP Tools)

```javascript
async function executeGeniusMode(userRequest) {
  // STEP 0: Ref MCP - Retrieve reusable patterns from all projects
  console.log("🔍 Querying Ref for proven patterns...");
  const reusablePatterns = await mcp__ref__search({
    query: userRequest,
    tags: ["production-tested", "high-quality"],
    minQualityScore: 8,
    limit: 5
  });

  // STEP 1: Qdrant - Check for past solutions
  console.log("📚 Checking Qdrant for successful trajectories...");
  const pastSolutions = await mcp__qdrant__qdrant_find({
    collection: "successful_trajectories",
    query: userRequest,
    limit: 5
  });

  // STEP 2: Sequential Thinking - MCTS Planning
  console.log("🧠 Planning with MCTS...");
  const plan = await planWithMCTS({
    task: userRequest,
    reusablePatterns: reusablePatterns,
    pastSolutions: pastSolutions,
    explorationBudget: 5
  });

  // STEP 3: Human Approval
  await waitForApproval(plan);

  // STEP 4: Serena - Code Implementation
  console.log("⚙️ Implementing with Serena semantic editing...");
  for (const step of plan.steps) {
    if (step.type === "code") {
      await mcp__serena__replace_symbol_body({
        symbol: step.targetSymbol,
        new_body: step.implementation
      });
    }
  }

  // STEP 5: Playwright - Visual Testing (IF UI feature)
  if (plan.affectsUI) {
    console.log("🎨 Visual quality check with top apps...");
    await ensureVisualParity(
      plan.featureName,
      "http://localhost:3002",
      plan.topAppsToCompare
    );
  }

  // STEP 6: GitHub - Create PR
  console.log("📤 Creating pull request...");
  const prResult = await mcp__github__create_pull_request({
    title: plan.title,
    body: generatePRBody(plan, reusablePatterns, pastSolutions)
  });

  // STEP 7: Ref MCP - Store pattern for future reuse
  console.log("📚 Storing proven pattern in Ref...");
  await mcp__ref__store({
    name: `${plan.featureName}_${Date.now()}`,
    code: finalImplementation,
    tags: plan.tags,
    qualityScore: criticScore,
    projects: ["workspace3"],
    documentation: generateDocumentation(plan),
    relatedPRs: [prResult.url]
  });

  // STEP 8: Qdrant - Store successful trajectory
  console.log("💾 Logging to Qdrant for future learning...");
  await mcp__qdrant__qdrant_store({
    collection: "successful_trajectories",
    text: JSON.stringify({
      task: userRequest,
      plan: plan,
      reusablePatterns: reusablePatterns,
      outcome: "success",
      refId: refStoreResult.id
    })
  });
}
```

---

## 📊 Quality Gates (ALWAYS ENFORCED)

### 1. Ref MCP Gate
```
IF implementing new feature:
  MUST query Ref for reusable patterns
  MUST check for proven implementations from past projects
  MUST prioritize patterns with quality score ≥8
  MUST store successful implementation in Ref after completion
```

### 2. Serena Gate
```
IF modifying code:
  MUST use Serena (not Read+Edit)
  MUST target specific symbols
  MUST verify token savings >80%
```

### 3. Playwright Gate
```
IF affects UI:
  MUST screenshot implementation
  MUST screenshot top 3 competing apps
  MUST achieve visual parity score ≥9.0/10
  MUST verify on multiple devices (mobile, tablet, desktop)
```

### 4. Qdrant Gate
```
IF task successful + Critic score ≥9:
  MUST store trajectory in Qdrant
  MUST tag with project, complexity, patterns used
  MUST be retrievable for future RAG
```

---

## 🔒 Non-Negotiable Rules

**RULE 1**: Ref MCP MUST be queried before ANY implementation
**RULE 2**: Firecrawl MUST auto-crawl top 3 apps for ALL user-facing features
**RULE 3**: Serena MUST be used for ALL code edits (no exceptions)
**RULE 4**: Playwright MUST screenshot compare for ALL UI features
**RULE 5**: Supabase MUST be used for ALL database operations
**RULE 6**: Stripe MUST be used for ALL payment/subscription features
**RULE 7**: Vercel MUST deploy previews for ALL PRs
**RULE 8**: Ref MCP MUST store ALL successful patterns (Critic ≥8)
**RULE 9**: Qdrant MUST store ALL successful trajectories (Critic ≥9)
**RULE 10**: GitHub MUST receive PR for ALL completed features
**RULE 11**: Sequential Thinking MUST be used for ALL GENIUS planning

**Violation of these rules = SYSTEM FAILURE**

---

## 🌐 Making This Truly Global

### Option 1: User-Scope MCP Servers (Recommended)

**Already done for**:
- ✅ sequential-thinking
- ✅ playwright
- ✅ qdrant
- ✅ github

**TODO**:
- [ ] Add context7 to `~/.config/claude-code/mcp_servers.json`
- [ ] Make serena project-agnostic (use `${PROJECT_ROOT}` variable)

### Option 2: System-Wide Enforcement (Enterprise)

**For absolute guarantee** (if you're admin):
```bash
# Create enterprise-level config
sudo mkdir -p /etc/claude-code
sudo vim /etc/claude-code/managed-mcp.json

# Add all required MCP servers
# This config CANNOT be overridden by user or project settings
```

### Option 3: Template for New Projects

**Create `.claude/` template**:
```bash
# 1. Create reusable template
mkdir -p ~/.claude-template/
cp -r .claude/* ~/.claude-template/

# 2. For each new project
cd ~/new-project
cp -r ~/.claude-template .claude/

# 3. Update project-specific paths
# (Serena project path, etc.)
```

---

## ✅ Verification

**Test that system is globally active**:

```javascript
// Test 1: Ref MCP available
await mcp__ref__search({ query: "test" });
// Expected: Returns reusable patterns from all projects

// Test 2: Serena available
await mcp__serena__find_symbol({ name: "main" });
// Expected: Finds symbols in current project

// Test 3: Playwright available
await mcp__playwright__screenshot({ url: "https://google.com" });
// Expected: Screenshot saved

// Test 4: Sequential Thinking available
await mcp__sequential_thinking__sequentialthinking({
  thought: "test",
  thoughtNumber: 1,
  totalThoughts: 1,
  nextThoughtNeeded: false
});
// Expected: Structured thought output

// Test 5: Qdrant available
await mcp__qdrant__qdrant_find({ collection: "test", query: "test" });
// Expected: Search results (even if empty)

// Test 6: GitHub available
await mcp__github__get_user();
// Expected: GitHub user info
```

---

**Status**: MANDATORY for ALL projects, ALL sessions, ZERO exceptions.

**Last Updated**: 2025-10-13
**Version**: 1.0
**Enforcement Level**: CRITICAL
