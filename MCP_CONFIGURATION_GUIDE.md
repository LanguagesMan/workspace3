# 🔌 MCP CONFIGURATION GUIDE - Windsurf Cascade

**Purpose**: Configure MCPs globally in Windsurf for maximum AI power  
**MCPs to Add**: Serena, GitHub, Playwright  
**Date**: October 14, 2025

---

## 🎯 WHY USE MCPs?

### Serena MCP
**Purpose**: Extended AI capabilities and tools  
**Use Cases**:
- Enhanced code generation
- Better understanding of project structure
- Improved refactoring suggestions
- Context-aware completions

### GitHub MCP
**Purpose**: Access best code from GitHub repos  
**Use Cases**:
- Find best practices from top projects
- Copy implementations from successful apps
- Learn from open source leaders
- Compare our code with industry standards

### Playwright MCP
**Purpose**: Advanced web scraping and testing  
**Use Cases**:
- Scrape Spanish news sites
- Test our application automatically
- Generate screenshots for documentation
- Automate browser interactions

---

## 🔧 GLOBAL CONFIGURATION STEPS

### Step 1: Access Windsurf Settings

1. Open Windsurf Cascade
2. Go to Settings (⌘,) or Preferences
3. Navigate to "Extensions" or "MCP Servers"

### Step 2: Add MCPs to Global Config

**Location**: `~/.windsurf/settings.json` or via UI

**Configuration**:
```json
{
  "mcpServers": {
    "serena": {
      "command": "npx",
      "args": ["-y", "@serenaai/mcp-server"],
      "env": {
        "SERENA_API_KEY": "${SERENA_API_KEY}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "env": {}
    }
  }
}
```

### Step 3: Set Environment Variables

**Create `.env` in home directory**:
```bash
# ~/.env or ~/.zshrc / ~/.bashrc

# Serena AI
export SERENA_API_KEY="your_serena_api_key_here"

# GitHub Personal Access Token
# Create at: https://github.com/settings/tokens
export GITHUB_TOKEN="ghp_your_github_token_here"
```

**For GitHub Token**:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`, `read:user`
4. Generate and copy token
5. Add to `.env`

### Step 4: Restart Windsurf

1. Close Windsurf completely
2. Reopen Windsurf
3. MCPs should auto-load
4. Verify in Cascade sidebar

---

## 🚀 USING MCPs IN THIS PROJECT

### Use Case 1: Scrape Spanish News Sites (Playwright)

**Goal**: Get real-time content from Spanish websites

**Example Command**:
```javascript
// Via Cascade chat
"Use Playwright MCP to scrape El País homepage for latest articles"

// What it does:
- Opens elpais.com
- Extracts article titles, descriptions, links
- Returns structured data
- We add to our feed
```

**Implementation**:
```javascript
// In lib/web-scraper.js
const { chromium } = require('playwright');

async function scrapeElPais() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://elpais.com');
    
    const articles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('article')).map(el => ({
            title: el.querySelector('h2')?.textContent,
            description: el.querySelector('p')?.textContent,
            url: el.querySelector('a')?.href,
            image: el.querySelector('img')?.src
        }));
    });
    
    await browser.close();
    return articles;
}
```

### Use Case 2: Find Best Code (GitHub MCP)

**Goal**: Learn from best Spanish learning apps

**Example Command**:
```
"GitHub MCP: Find best implementations of spaced repetition algorithms"

// What it does:
- Searches GitHub for "spaced repetition" with 1000+ stars
- Analyzes top repos
- Extracts best code snippets
- Shows implementation patterns
```

**Apps to Study**:
- Anki (spaced repetition)
- Duolingo (gamification)
- Memrise (flashcards)
- LingQ (reading)

**Example Request**:
```bash
# Via Cascade
"Show me how Anki implements SM-2 algorithm in their codebase"

# Or
"What gamification techniques does Duolingo use? Find in their repo"
```

### Use Case 3: Enhanced AI (Serena MCP)

**Goal**: Better code suggestions and refactoring

**Example Commands**:
```
"Serena: Optimize our personalization algorithm for performance"
"Serena: Suggest improvements to our user profiler"
"Serena: Find security vulnerabilities in our API endpoints"
```

---

## 📊 MCP USAGE EXAMPLES FOR THIS PROJECT

### Example 1: Scrape Reddit for Spanish Content

**Request to Cascade**:
```
Using Playwright MCP, scrape r/Spanish subreddit for:
- Top 10 posts this week
- Extract titles, content, upvotes
- Filter for learning resources
- Add to our content aggregator
```

**Expected Output**:
```javascript
{
  source: 'Reddit',
  posts: [
    {
      title: 'Best way to practice Spanish speaking?',
      url: 'https://reddit.com/r/Spanish/...',
      upvotes: 234,
      comments: 56,
      content: '...'
    }
  ]
}
```

### Example 2: Find Best Personalization Algorithms

**Request to Cascade**:
```
GitHub MCP: Find top repos implementing content recommendation:
- Collaborative filtering
- Content-based filtering
- Hybrid approaches
- Used by Netflix, Spotify, YouTube
Show me their algorithm implementations
```

**Learning From**:
- Surprise (Python recommender library)
- LightFM (hybrid recommender)
- Implicit (collaborative filtering)
- Spotlight (deep learning recommendations)

### Example 3: Auto-Generate Tests

**Request to Cascade**:
```
Using Playwright MCP:
1. Generate test for AI Discover feed
2. Test article loading
3. Test audio player
4. Test personalization
5. Take screenshots at each step
```

**Auto-Generated Test**:
```javascript
test('AI Discover Feed', async ({ page }) => {
    await page.goto('http://localhost:3001/discover-ai.html');
    await expect(page.locator('.article-card')).toBeVisible();
    await page.locator('.action-btn').first().click();
    await expect(page.locator('.audio-player')).toBeVisible();
    await page.screenshot({ path: 'discover-test.png' });
});
```

---

## 🎯 BEST PRACTICES

### DO:
✅ Use GitHub MCP to study successful apps  
✅ Use Playwright MCP for scraping news sites  
✅ Use Serena MCP for code optimization  
✅ Always attribute code sources  
✅ Test scraped data before using  
✅ Respect robots.txt and rate limits  

### DON'T:
❌ Violate GitHub repos' licenses  
❌ Scrape without permission/rate limiting  
❌ Copy code without understanding  
❌ Overload external APIs  
❌ Skip testing MCP-generated code  

---

## 🔐 SECURITY & PRIVACY

### API Keys Protection
- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Monitor usage limits

### GitHub Token Scopes
- Only grant necessary permissions
- Use fine-grained tokens when possible
- Revoke if compromised

### Playwright Scraping
- Respect robots.txt
- Use delays between requests
- Don't scrape user data
- Follow website ToS

---

## 📈 MONITORING MCP USAGE

### Track in Cascade
- See MCP calls in sidebar
- Monitor response times
- Check error rates
- Optimize slow calls

### Usage Limits
- GitHub API: 5,000 requests/hour
- Playwright: No limit (run locally)
- Serena: Check plan limits

---

## 🚀 ADVANCED CONFIGURATION

### Custom MCP Servers

**Create your own**:
```javascript
// custom-spanish-mcp.js
module.exports = {
  name: 'spanish-content',
  tools: {
    scrapeSpanishNews: async () => {
      // Your custom scraper
    },
    translateContent: async (text) => {
      // Your custom translator
    }
  }
};
```

**Add to Windsurf**:
```json
{
  "mcpServers": {
    "spanish-content": {
      "command": "node",
      "args": ["./custom-spanish-mcp.js"]
    }
  }
}
```

### Chaining MCPs

**Example Workflow**:
```
1. GitHub MCP → Find best Spanish learning apps
2. Playwright MCP → Scrape their features
3. Serena MCP → Suggest improvements for our app
4. Cascade → Implement improvements
```

---

## ✅ VERIFICATION CHECKLIST

After configuring MCPs:

- [ ] Windsurf recognizes all 3 MCPs
- [ ] Can call GitHub MCP (test: search repos)
- [ ] Can call Playwright MCP (test: navigate page)
- [ ] Can call Serena MCP (test: ask question)
- [ ] Environment variables loaded
- [ ] API tokens valid
- [ ] No errors in console

**Test Commands**:
```
# In Cascade chat:
"GitHub MCP: search for 'spaced repetition' repos"
"Playwright MCP: navigate to google.com and take screenshot"
"Serena MCP: explain our personalization algorithm"
```

---

## 🎓 LEARNING RESOURCES

### GitHub MCP
- Docs: https://github.com/modelcontextprotocol/servers
- Examples: Search for "language learning" repos
- Best practices: Fork and study code

### Playwright MCP
- Docs: https://playwright.dev
- Scraping guide: https://playwright.dev/docs/scraping
- Best practices: Respect rate limits

### Serena MCP
- Docs: https://serena.ai/docs
- Examples: Code optimization, refactoring
- Best practices: Review suggestions before applying

---

## 🎉 READY TO USE!

With MCPs configured, you can now:

✅ **Find best code** from top Spanish learning apps  
✅ **Scrape real content** from Spanish websites  
✅ **Get AI help** for optimization and refactoring  
✅ **Automate testing** with Playwright  
✅ **Learn from leaders** in language learning  

**Next**: Use these MCPs to build the remaining $1B features!

---

**Configuration Status**: ⏳ Pending (requires API keys)  
**Testing Status**: ⏳ Pending (after configuration)  
**Documentation**: ✅ Complete

Let's configure these MCPs and unlock maximum AI power! 🚀

