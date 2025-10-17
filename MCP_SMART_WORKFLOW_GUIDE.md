# 🧠 MCP Smart Workflow Guide for Cursor

## 🎯 Overview

This guide configures Cursor to intelligently use Model Context Protocol (MCP) servers for maximum productivity. MCPs extend Cursor's capabilities with specialized tools for testing, research, design, and automation.

## 📦 Installed MCPs

### 1. **Playwright MCP** - Browser Automation & Testing
**When to Use:**
- ✅ Running E2E tests with screenshots
- ✅ Visual regression testing
- ✅ Browser automation tasks
- ✅ Performance monitoring
- ✅ Mobile viewport testing

**Smart Commands:**
```bash
# Run test with screenshots
"Test the entire app flow and capture screenshots"

# Visual regression
"Compare current UI with previous screenshots"

# Mobile testing
"Test mobile responsiveness with screenshots on iPhone and Android"
```

### 2. **Firecrawl MCP** - Intelligent Web Scraping
**API Key:** `fc-5c92f42486554494b59214b4fc48a38b`

**When to Use:**
- ✅ Research competitor features
- ✅ Extract code examples from top apps
- ✅ Analyze UI/UX patterns
- ✅ Gather design inspiration
- ✅ Scrape documentation sites

**Smart Commands:**
```bash
# Crawl competitor
"Crawl TikTok's feed implementation and extract scroll behavior code"

# Extract patterns
"Use Firecrawl to analyze Duolingo's gamification UI patterns"

# Get examples
"Scrape GitHub trending repos for video player implementations"
```

**Top Sites to Crawl:**
- TikTok/Instagram/YouTube (video feed patterns)
- Duolingo/Babbel (learning mechanics)
- GitHub trending (code examples)
- Dribbble/Awwwards (design patterns)

### 3. **GitHub MCP** - Repository Operations
**When to Use:**
- ✅ Creating/managing issues
- ✅ Pull request operations
- ✅ Repository search
- ✅ Code review workflows
- ✅ Branch management

**Smart Commands:**
```bash
# Create issue
"Create a GitHub issue for implementing adaptive difficulty"

# Search repos
"Search GitHub for React video player with subtitle support"

# PR operations
"Create PR for the new quiz system features"
```

### 4. **Figma MCP** - Design Integration
**When to Use:**
- ✅ Implementing designs
- ✅ Exporting design assets
- ✅ Reading design tokens
- ✅ Component inspection
- ✅ Design-to-code conversion

**Smart Commands:**
```bash
# Extract specs
"Get spacing and color tokens from Figma design"

# Export assets
"Export all icons from the Figma components page"

# Implement design
"Implement the new feed card design from Figma"
```

### 5. **PostgreSQL/Supabase MCP** - Database Operations
**When to Use:**
- ✅ Complex SQL queries
- ✅ Schema inspection
- ✅ Database migrations
- ✅ Data analysis
- ✅ Query optimization

**Smart Commands:**
```bash
# Query analysis
"Analyze user engagement data from the last 30 days"

# Schema changes
"Add adaptive difficulty tracking tables to the database"

# Optimization
"Optimize the video recommendations query"
```

### 6. **Filesystem MCP** - Advanced File Operations
**When to Use:**
- ✅ Recursive file search
- ✅ Batch file operations
- ✅ Project structure analysis
- ✅ File watching

### 7. **Brave Search MCP** - Research & Documentation
**When to Use:**
- ✅ Finding best practices
- ✅ API documentation lookup
- ✅ Real-time information
- ✅ Competitive research

### 8. **Fetch MCP** - API Testing
**When to Use:**
- ✅ Testing API endpoints
- ✅ HTTP requests
- ✅ Webhook testing
- ✅ Response parsing

### 9. **Puppeteer MCP** - Advanced Automation
**When to Use:**
- ✅ Advanced web scraping
- ✅ PDF generation
- ✅ Performance profiling
- ✅ Network interception

---

## 🎭 Smart Workflow Patterns

### Pattern 1: Testing Workflow
```
1. Use Playwright to run tests
2. Capture screenshots automatically
3. Use Fetch to verify API responses
4. Generate visual regression reports
5. Use GitHub to create issues for failures
```

**Example:**
```bash
"Run E2E tests with Playwright, capture screenshots of all pages, 
test the API endpoints, and create GitHub issues for any failures"
```

### Pattern 2: Competitive Research
```
1. Use Brave Search to find top competitors
2. Use Firecrawl to extract their features
3. Capture screenshots with Playwright
4. Use Puppeteer for dynamic content
5. Document findings in GitHub issues
```

**Example:**
```bash
"Research how TikTok implements their scroll physics. 
Use Brave to find technical articles, Firecrawl to extract 
code examples, and Playwright to capture their UX flow"
```

### Pattern 3: Design Implementation
```
1. Use Figma to get design specs
2. Implement components
3. Use Playwright to screenshot implementation
4. Compare with Figma designs
5. Create PR with GitHub MCP
```

**Example:**
```bash
"Get the new video card design from Figma, implement it, 
take screenshots, and create a PR with before/after comparison"
```

### Pattern 4: Database Development
```
1. Use Postgres to inspect current schema
2. Write migration SQL
3. Test on development database
4. Use Filesystem to organize migrations
5. Create PR with GitHub MCP
```

**Example:**
```bash
"Add user progress tracking to the database. Inspect current schema,
create migration, test it, and prepare a PR"
```

### Pattern 5: Feature Development from Competition
```
1. Firecrawl competitor site for feature
2. Brave Search for implementation best practices
3. Figma for design specifications
4. Implement feature
5. Playwright for testing with screenshots
6. GitHub for PR creation
```

**Example:**
```bash
"Implement Duolingo-style streak system. Crawl Duolingo with Firecrawl,
research best practices, check our Figma designs, implement, 
test with Playwright, and create PR"
```

---

## 🚀 Quick Start Commands

### Testing
```bash
# Comprehensive test with screenshots
"Test all core features with Playwright and capture screenshots"

# Mobile testing
"Test on iPhone 14 Pro and Samsung Galaxy S23 viewports"

# Visual regression
"Compare current screenshots with baseline in screenshots folder"
```

### Research & Scraping
```bash
# Crawl competitor
"Use Firecrawl to crawl instagram.com/reels and extract their video player code"

# Batch crawl
"Crawl these sites with Firecrawl: duolingo.com, babbel.com, memrise.com 
and extract their gamification patterns"

# Get examples
"Find the top 5 React video player repos on GitHub and extract their core implementation"
```

### Design to Code
```bash
# Full workflow
"Get the feed redesign from Figma, implement it, and test with screenshots"

# Asset export
"Export all SVG icons from Figma and optimize them"
```

### Database
```bash
# Analysis
"Query user engagement metrics for the past month and create visualizations"

# Schema update
"Add tables for the new vocabulary review system and create migration"
```

---

## 🎯 Intelligent Auto-Detection

The MCP configuration automatically detects when to use specific MCPs based on:

### Keywords
- "test", "screenshot" → Playwright
- "crawl", "scrape", "competitor" → Firecrawl
- "github", "pr", "issue" → GitHub
- "design", "figma" → Figma
- "database", "query", "sql" → Postgres
- "search", "research" → Brave Search

### File Patterns
- `*.spec.ts`, `*.test.js` → Playwright
- `*.sql`, `schema.prisma` → Postgres
- Figma URLs in prompts → Figma

### Task Context
- Mentions of testing → Playwright + Fetch
- Mentions of competitors → Firecrawl + Brave Search
- Mentions of design → Figma + Playwright
- Database operations → Postgres + Filesystem

---

## 📸 Screenshot & Evidence Collection

### Automatic Screenshot Capture
```bash
# Full app screenshots
"Capture screenshots of all main pages"

# Specific sections
"Screenshot the video feed, quiz, and profile sections"

# Comparison screenshots
"Take before and after screenshots of the navigation changes"

# Mobile + Desktop
"Capture screenshots on desktop, tablet, and mobile viewports"
```

### Evidence for QA
```bash
# Feature validation
"Test the new streak system and provide screenshot evidence"

# Bug reporting
"Reproduce the subtitle timing bug and capture screenshots"

# Performance monitoring
"Run performance tests and capture metrics with screenshots"
```

---

## 🎨 Firecrawl Advanced Usage

### Structured Data Extraction
```javascript
// Auto-configured in MCP, use natural language:
"Use Firecrawl to extract TikTok's video card HTML structure and CSS"

"Crawl dribbble.com/shots and extract the top 10 video player designs"

"Scrape the React documentation for useEffect best practices"
```

### Batch Crawling
```bash
# Multiple sites
"Crawl these sites with Firecrawl and compare their onboarding flows:
- duolingo.com
- babbel.com  
- busuu.com
Create a comparison document with screenshots"
```

### Code Extraction
```bash
# Extract implementations
"Use Firecrawl to find and extract scroll physics implementations from:
- tiktok.com (mobile web)
- instagram.com/reels
- youtube.com/shorts
Compare their approaches"
```

---

## 🧪 Playwright Testing Patterns

### Visual Regression Testing
```javascript
// Auto-triggered by test files, or use:
"Create visual regression tests for all main components"

"Update baseline screenshots after design changes"

"Compare current UI against production screenshots"
```

### E2E Flow Testing
```bash
# Complete user flows
"Test the full learning flow: signup → onboarding → watch video → take quiz → see results"

# Edge cases
"Test offline behavior with screenshots of error states"

# Performance
"Run performance tests and capture lighthouse scores"
```

### Cross-Browser Testing
```bash
"Test on Chrome, Firefox, and Safari with screenshots"

"Test mobile Safari and Chrome on iOS viewports"
```

---

## 📊 Database Operations

### Query & Analysis
```sql
-- Use natural language with Postgres MCP:
"Show me users who completed more than 5 videos this week"

"Analyze vocabulary retention rates by difficulty level"

"Find videos with the highest completion rates"
```

### Schema Management
```bash
# Migration workflow
"Create a migration to add user streak tracking"

"Add indexes to improve video recommendation queries"

"Set up tables for the new achievement system"
```

---

## 🔄 Combined Workflow Examples

### Example 1: Implement Competitor Feature
```bash
"I want to implement TikTok's double-tap to like animation.
1. Use Firecrawl to analyze their implementation
2. Search GitHub for React animation examples
3. Check if we have designs in Figma
4. Implement the feature
5. Test with Playwright and capture screenshots
6. Create a PR with evidence"
```

### Example 2: Performance Optimization
```bash
"Optimize video loading performance:
1. Use Playwright to profile current performance
2. Use Brave Search to find best practices
3. Use Firecrawl to see how YouTube optimizes video loading
4. Implement optimizations
5. Test and compare performance metrics
6. Document results in GitHub"
```

### Example 3: Design System Update
```bash
"Update our design system:
1. Get latest design tokens from Figma
2. Update CSS variables
3. Use Filesystem to update all component files
4. Test with Playwright on all pages
5. Capture before/after screenshots
6. Create PR with visual comparison"
```

---

## 🎓 Best Practices

### 1. Always Capture Evidence
- Use Playwright screenshots for visual proof
- Document API responses
- Save scraped data for reference
- Keep baseline screenshots updated

### 2. Combine MCPs Intelligently
- Don't use Puppeteer if Playwright can do it
- Use Firecrawl for structured extraction, Puppeteer for complex automation
- Combine research (Brave) with deep-dive (Firecrawl)

### 3. Automate Repetitive Tasks
- Create test suites that run automatically
- Schedule regular competitor analysis
- Set up automated screenshot comparisons
- Use GitHub Actions with MCP workflows

### 4. Document Everything
- Use GitHub issues to track findings
- Create markdown reports with screenshots
- Save scraped code examples
- Maintain comparison documents

---

## 🚨 Common Use Cases

### Testing
```bash
"Run all E2E tests with screenshots"
"Test mobile responsiveness across devices"
"Validate API endpoints are working"
"Check for console errors in production"
```

### Research
```bash
"Analyze top 5 language learning apps"
"Find best practices for video subtitle timing"
"Extract scroll physics from popular apps"
"Research gamification patterns"
```

### Development
```bash
"Implement feature X based on Figma designs"
"Add database tables for feature Y"
"Optimize query performance"
"Create PR with full documentation"
```

### Quality Assurance
```bash
"Validate all features are working"
"Capture evidence for stakeholder review"
"Compare our implementation with competitors"
"Generate comprehensive test reports"
```

---

## 📝 Configuration Files

### Main Config
- `.cursor/mcp-config.json` - MCP server configuration

### Environment Variables Required
```env
# GitHub
GITHUB_TOKEN=your_github_token

# Figma (optional)
FIGMA_TOKEN=your_figma_token

# Brave Search (optional)
BRAVE_API_KEY=your_brave_key

# Database
DATABASE_URL=your_postgres_connection_string
```

### Firecrawl API Key
Already configured: `fc-5c92f42486554494b59214b4fc48a38b`

---

## 🎯 Quick Reference

| Task | Primary MCP | Secondary MCP | Example Command |
|------|------------|---------------|-----------------|
| UI Testing | Playwright | - | "Test feed with screenshots" |
| API Testing | Fetch | Playwright | "Test all API endpoints" |
| Competitor Research | Firecrawl | Brave Search | "Analyze TikTok's feed" |
| Code Examples | Firecrawl | GitHub | "Find video player examples" |
| Design Implementation | Figma | Playwright | "Implement new design" |
| Database Work | Postgres | Filesystem | "Add new tables" |
| Web Scraping | Firecrawl | Puppeteer | "Scrape site structure" |
| Documentation | Brave Search | Firecrawl | "Find best practices" |

---

## 🎬 Getting Started

1. **Verify Installation**: MCPs are configured in `.cursor/mcp-config.json`
2. **Set Environment Variables**: Add tokens to your environment
3. **Start Using**: Just describe your task naturally in Cursor
4. **MCPs Auto-Select**: Configuration automatically uses the right tools

---

## 💡 Pro Tips

1. **Be Specific**: "Screenshot the feed on mobile" is better than "test feed"
2. **Combine Actions**: "Crawl, analyze, and implement" in one command
3. **Request Evidence**: Always ask for screenshots and proof
4. **Iterate Fast**: Use MCPs to quickly test and validate ideas
5. **Learn from Best**: Use Firecrawl to study top apps regularly

---

## 🔗 Resources

- [Playwright Docs](https://playwright.dev)
- [Firecrawl API](https://firecrawl.dev)
- [MCP Documentation](https://modelcontextprotocol.io)
- [GitHub CLI](https://cli.github.com)
- [Figma API](https://www.figma.com/developers/api)

---

**Remember**: The MCPs are configured to work intelligently. Just describe what you want to do naturally, and Cursor will automatically use the right tools! 🚀

