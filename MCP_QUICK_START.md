# 🚀 MCP Quick Start for Cursor

## ⚡ 30-Second Setup

1. **Configuration is Ready**: `.cursor/mcp-config.json` is configured
2. **Firecrawl API Key**: Already set (`fc-5c92f42486554494b59214b4fc48a38b`)
3. **Start Using**: Just describe what you want in natural language

## 🎯 Instant Commands

### Testing with Playwright
```
"Test the entire app with screenshots on mobile and desktop"
"Capture visual regression screenshots of all sections"
"Run E2E tests and generate evidence report"
```

### Research with Firecrawl
```
"Crawl TikTok and extract their feed scroll implementation"
"Analyze Duolingo's gamification patterns with screenshots"
"Batch crawl top 5 language apps and compare features"
```

### GitHub Operations
```
"Create a GitHub issue for the new feature"
"Search GitHub for React video player examples"
"Create PR for the quiz system changes"
```

### Database Work
```
"Query user engagement data from last 30 days"
"Add adaptive difficulty tables to schema"
"Optimize video recommendation queries"
```

## 📱 Common Workflows

### 1. Test Everything
```
"Run comprehensive tests:
1. Test all pages with Playwright
2. Capture screenshots on iPhone, Android, Desktop
3. Check API endpoints with Fetch
4. Generate evidence report with all screenshots"
```

### 2. Learn from Competitors
```
"Analyze TikTok's implementation:
1. Use Firecrawl to extract their scroll code
2. Use Playwright to capture their UX flow
3. Compare with our implementation
4. Create improvement recommendations"
```

### 3. Implement from Design
```
"Implement new feature:
1. Get specs from Figma
2. Extract design tokens
3. Implement components
4. Test with Playwright screenshots
5. Create PR with evidence"
```

### 4. Performance Optimization
```
"Optimize video loading:
1. Use Brave Search for best practices
2. Use Firecrawl to see how YouTube optimizes
3. Implement improvements
4. Test performance with Playwright
5. Compare before/after metrics"
```

## 🎓 Learn by Example

### Example 1: Test Mobile UI
**Say:**
```
"Test our video feed on iPhone 14 Pro and capture screenshots"
```

**MCP Does:**
- Launches Playwright
- Sets iPhone 14 Pro viewport
- Navigates to feed
- Captures full-page screenshots
- Saves to `screenshots/mcp-tests/`

### Example 2: Research Competitor
**Say:**
```
"Use Firecrawl to analyze Instagram Reels video player and extract the double-tap like animation code"
```

**MCP Does:**
- Uses Firecrawl API
- Crawls Instagram Reels
- Extracts relevant code
- Downloads assets
- Creates structured report

### Example 3: Batch Testing
**Say:**
```
"Test all sections (home, feed, quiz, profile) on desktop and mobile with screenshots"
```

**MCP Does:**
- Tests each section
- Captures on multiple viewports
- Organizes screenshots by section
- Generates comparison report

### Example 4: Get Code Examples
**Say:**
```
"Find the top 5 React video player repos on GitHub and extract subtitle implementation examples"
```

**MCP Does:**
- Searches GitHub
- Identifies top repos
- Extracts relevant code
- Creates comparison document

## 🔥 Power Commands

### Comprehensive App Audit
```
"Complete app audit:
1. Test all features with Playwright
2. Capture screenshots on 5 devices
3. Check console errors
4. Test API endpoints
5. Run accessibility checks
6. Generate comprehensive report with all evidence"
```

### Competitive Deep Dive
```
"Deep analysis of TikTok, Instagram Reels, YouTube Shorts:
1. Use Firecrawl to extract video player code
2. Use Playwright to capture UX flows
3. Extract scroll physics implementations
4. Compare subtitle systems
5. Document gesture controls
6. Create implementation guide"
```

### Feature Parity Check
```
"Compare our app with Duolingo:
1. Crawl Duolingo with Firecrawl
2. Extract their gamification UI
3. Screenshot our equivalent features
4. Create side-by-side comparison
5. Generate feature gap analysis
6. Recommend improvements"
```

## 📊 Evidence Collection

All MCP operations automatically:
- ✅ Capture screenshots
- ✅ Save structured data
- ✅ Generate reports
- ✅ Organize in dated folders
- ✅ Create comparison documents

### Output Locations
- Screenshots: `screenshots/mcp-tests/`
- Evidence: `evidence/`
- Research: `research-data/`
- Reports: `evidence/*.json`

## 🎯 Smart Auto-Detection

MCPs automatically activate when you mention:

| Keyword | MCP Used | Example |
|---------|----------|---------|
| "test", "screenshot" | Playwright | "Test the feed" |
| "crawl", "scrape" | Firecrawl | "Crawl TikTok" |
| "github", "pr" | GitHub | "Create PR" |
| "figma", "design" | Figma | "Get design specs" |
| "query", "database" | Postgres | "Query users" |
| "search", "research" | Brave Search | "Research best practices" |

## 💡 Pro Tips

1. **Be Specific**: "Test feed on iPhone 14 Pro" vs "test feed"
2. **Combine MCPs**: "Crawl and test TikTok implementation"
3. **Request Evidence**: Always ask for screenshots
4. **Batch Operations**: Test multiple things at once
5. **Compare**: "Compare our app with [competitor]"

## 🚨 Troubleshooting

### If MCP doesn't activate:
1. Use explicit command: "Use Playwright to..."
2. Check file extension (*.spec.ts auto-triggers)
3. Mention specific MCP by name

### If tests fail:
```
"Debug the test failure with detailed logs and screenshots"
```

### If scraping blocked:
```
"Use Puppeteer as fallback to crawl [site]"
```

## 🎬 Ready to Start!

Just type natural commands like:
- "Test everything with screenshots"
- "Crawl TikTok and analyze their feed"
- "Compare our app with Duolingo"
- "Find video player examples on GitHub"

**The MCPs handle all the complexity automatically!** 🎉

---

## 📚 Full Documentation
- **Complete Guide**: `MCP_SMART_WORKFLOW_GUIDE.md`
- **Config File**: `.cursor/mcp-config.json`
- **Playwright Examples**: `mcp-examples/playwright-smart-tests.js`
- **Firecrawl Examples**: `mcp-examples/firecrawl-smart-scraping.js`

