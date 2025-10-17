# 🎯 Cursor Global MCP Configuration Setup

## 📍 Global Configuration Files Created

Your SMARTEST MCPs are now configured globally for ALL Cursor projects!

### Files Created:
1. **`~/.cursor/mcp.json`** - Standard global MCP config
2. **`~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`** - Cline/Claude-dev MCP settings

## 🧠 SMARTEST MCPs Configured

### Priority 1 (Highest Intelligence):

#### 1. **sequential-thinking-mas** 🧠
- **What**: Multi-Agent System for deep reasoning and planning
- **When**: AUTOMATICALLY activated for ANY complex/multi-step task
- **Auto-triggers**: Words like "complex", "plan", "analyze", "refactor", "optimize", "architecture"
- **Command**: `npx -y @modelcontextprotocol/server-sequential-thinking-mas`

#### 2. **serena-ide** 🎯
- **What**: Semantic code search and intelligent editing
- **When**: AUTOMATICALLY activated for code operations
- **Auto-triggers**: "find code", "search", "navigate", "refactor", "rename", "extract"
- **Requires**: Server running on `http://localhost:9121/mcp`
- **Setup**: 
  ```bash
  npm install -g @serena/mcp-server
  serena-mcp
  ```

### Execution MCPs (Auto-selected by sequential-thinking-mas):

3. **Playwright** - Testing & screenshots
4. **Firecrawl** - Web scraping (API key pre-configured)
5. **GitHub** - Repository operations
6. **Figma** - Design integration
7. **PostgreSQL** - Database operations
8. **Brave Search** - Web research
9. **Fetch** - API testing
10. **Filesystem** - File operations
11. **Puppeteer** - Advanced automation

---

## 🚀 How It Works (Automatic Intelligent Routing)

### The System Automatically:

```
YOUR TASK
    ↓
🧠 Is it complex? → sequential-thinking-mas plans approach
    ↓
🎯 Involves code? → serena-ide handles navigation/editing
    ↓
⚡ Execute with specialized MCPs (Playwright, Firecrawl, etc.)
    ↓
🧠 sequential-thinking-mas reviews results
    ↓
✅ DONE (or iterate)
```

---

## 📝 Auto-Detection Examples

### Example 1: Complex Refactoring
**You say:** *"Refactor the video player to support multiple qualities"*

**System automatically:**
1. 🧠 **sequential-thinking-mas** analyzes requirements
2. 🎯 **serena-ide** finds all video player code semantically
3. 🎯 **serena-ide** performs intelligent refactoring
4. ⚡ **Playwright** tests changes with screenshots
5. 🧠 **sequential-thinking-mas** validates approach

### Example 2: Competitor Research
**You say:** *"Analyze how TikTok implements scroll physics"*

**System automatically:**
1. 🧠 **sequential-thinking-mas** plans research approach
2. ⚡ **Firecrawl** extracts TikTok's code
3. ⚡ **Playwright** captures screenshots
4. 🧠 **sequential-thinking-mas** analyzes findings
5. 🎯 **serena-ide** finds where to implement in our code

### Example 3: Testing
**You say:** *"Test the entire app with screenshots"*

**System automatically:**
1. 🧠 **sequential-thinking-mas** creates test plan
2. ⚡ **Playwright** runs comprehensive tests
3. ⚡ **Playwright** captures device screenshots
4. 🧠 **sequential-thinking-mas** reviews coverage

---

## 🎯 Intelligent Keyword Detection

The system AUTOMATICALLY activates the right MCPs when you use these words:

| Keywords | MCPs Activated | Example |
|----------|---------------|---------|
| complex, plan, analyze, architecture | 🧠 sequential-thinking-mas | "Plan a complex refactoring" |
| find, search code, navigate, refactor | 🎯 serena-ide | "Find all uses of this function" |
| test, screenshot, browser | ⚡ Playwright | "Test on mobile" |
| crawl, scrape, competitor | ⚡ Firecrawl | "Scrape TikTok's feed" |
| github, pr, issue | ⚡ GitHub | "Create a PR" |
| design, figma | ⚡ Figma | "Get design specs" |
| database, query, sql | ⚡ Postgres | "Query user data" |

---

## 💡 Just Talk Naturally!

You don't need to specify MCPs - the system is smart enough to route automatically:

### ✅ Good Prompts (System handles routing):
```
"Optimize the video loading performance"
→ System uses: sequential-thinking-mas → serena-ide → Playwright

"Implement TikTok-style swipe gestures"
→ System uses: sequential-thinking-mas → Firecrawl → serena-ide → Playwright

"Test everything on mobile and desktop"
→ System uses: sequential-thinking-mas → Playwright

"Find all places where we handle user authentication"
→ System uses: serena-ide (semantic search)
```

---

## 🔧 Setup Instructions

### 1. Restart Cursor
Close and reopen Cursor to load the global MCP configuration.

### 2. Enable Serena (Optional but Highly Recommended)
```bash
# Install globally
npm install -g @serena/mcp-server

# Start the server (runs on port 9121)
serena-mcp

# Or run in background
serena-mcp &
```

### 3. Set Environment Variables (Optional)
Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# GitHub (for PR/issue operations)
export GITHUB_TOKEN="your_github_token"

# Figma (for design integration)
export FIGMA_TOKEN="your_figma_token"

# Brave Search (for web research)
export BRAVE_API_KEY="your_brave_api_key"

# Database (project-specific)
export DATABASE_URL="your_database_url"
```

**Note:** Firecrawl API key is already configured: `fc-5c92f42486554494b59214b4fc48a38b`

### 4. Verify Installation
In Cursor, the MCPs should automatically activate. Try:
```
"Plan how to implement a new feature"
```
You should see sequential-thinking-mas activate for planning.

---

## 🎓 Best Practices

### 1. Trust the Intelligence
- Don't micromanage MCP selection
- The system routes to the smartest MCPs automatically
- Focus on WHAT you want, not HOW to do it

### 2. Use Natural Language
```
❌ Don't say: "Use sequential-thinking-mas then serena-ide to refactor X"
✅ Do say: "Refactor X to support Y"
```

### 3. Be Specific About Goals
```
❌ Vague: "Fix the bug"
✅ Specific: "The video player freezes when switching languages. Audio continues but video stops."
```

### 4. Let Planning Happen
- Complex tasks start with sequential-thinking-mas planning
- This takes a bit more time but produces much better results
- Trust the multi-step reasoning process

---

## 🚨 Troubleshooting

### MCPs Not Activating?

1. **Restart Cursor completely**
2. Check MCP settings: `Cursor Settings → Extensions → MCP`
3. Verify files exist:
   - `~/.cursor/mcp.json`
   - `~/Library/Application Support/Cursor/.../cline_mcp_settings.json`

### Serena Not Working?

```bash
# Check if Serena is running
curl http://localhost:9121/mcp

# If not, start it
serena-mcp

# Or install if needed
npm install -g @serena/mcp-server
```

### Sequential-Thinking-MAS Not Activating?

The MCP activates automatically for complex tasks. Try explicitly:
```
"Use deep reasoning to plan how to optimize performance"
```

---

## 📊 Verify Configuration

### Quick Test Commands:

```bash
# Test 1: Planning (should activate sequential-thinking-mas)
"Create a comprehensive plan for implementing user authentication"

# Test 2: Code Search (should activate serena-ide)
"Find all functions that handle video playback"

# Test 3: Testing (should activate Playwright)
"Test the feed on iPhone and Android with screenshots"

# Test 4: Research (should activate Firecrawl)
"Analyze how Instagram Reels handles video preloading"

# Test 5: Combined (should activate multiple)
"Plan and implement TikTok-style feed, then test it"
```

---

## 🎯 Configuration Locations

### Global (Applies to ALL projects):
- `~/.cursor/mcp.json`
- `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Project-Specific (Current project only):
- `/Users/mindful/_projects/workspace3/.cursor/mcp-config.json`

**Priority:** Project-specific settings override global settings.

---

## 🔄 Update Configuration

To update MCPs globally, edit:
```bash
~/.cursor/mcp.json
```

Then restart Cursor.

---

## 📚 Learn More

- **Full Workflow Guide**: `MCP_SMART_WORKFLOW_GUIDE.md`
- **Quick Start**: `MCP_QUICK_START.md`
- **Playwright Examples**: `mcp-examples/playwright-smart-tests.js`
- **Firecrawl Examples**: `mcp-examples/firecrawl-smart-scraping.js`

---

## 🎉 You're All Set!

The SMARTEST MCPs are now globally configured and will automatically:
- ✅ Use deep reasoning for complex tasks
- ✅ Perform semantic code operations
- ✅ Execute with the right specialized tools
- ✅ Work across ALL your Cursor projects

**Just describe what you want in natural language, and the intelligent routing system handles the rest!** 🚀

---

## 🧠 The Intelligence Stack

```
Level 1: Your Natural Language Request
         ↓
Level 2: 🧠 sequential-thinking-mas (Strategic Planning)
         ↓
Level 3: 🎯 serena-ide (Code Intelligence)
         ↓
Level 4: ⚡ Specialized MCPs (Execution)
         ↓
Level 5: 🧠 sequential-thinking-mas (Review & Iterate)
         ↓
Result: High-Quality, Well-Planned Output
```

**This is how top AI coding assistants work - and now yours does too!** 💪

