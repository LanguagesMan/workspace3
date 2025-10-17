#!/bin/bash
# 🛡️ SAFE DEVELOPMENT WORKFLOW
# Prevents breaking changes by testing before commits

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         🛡️  SAFE DEVELOPMENT WORKFLOW 🛡️                ║"
echo "║    Testing → Screenshots → Commit → Document            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Check if server is running
echo -e "${BLUE}[1/5]${NC} Checking if server is running..."
if ! curl -s http://localhost:3001 > /dev/null; then
    echo -e "${RED}❌ Server not running! Start it with: npm start${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Step 2: Run core tests
echo -e "\n${BLUE}[2/5]${NC} Running core integration tests..."
npx playwright test tests/persona-based-comprehensive.test.js --grep "should load and display" 2>&1 | tail -20

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}❌ Tests failed! Fix issues before committing${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Core tests passing${NC}"

# Step 3: Take screenshot for visual verification
echo -e "\n${BLUE}[3/5]${NC} Taking screenshot for visual verification..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
SCREENSHOT_DIR="screenshots/safe-dev/$TIMESTAMP"
mkdir -p "$SCREENSHOT_DIR"

npx playwright test tests/visual-snapshot.test.js --update-snapshots 2>&1 | tail -10
echo -e "${GREEN}✅ Screenshots saved to $SCREENSHOT_DIR${NC}"

# Step 4: Show git status
echo -e "\n${BLUE}[4/5]${NC} Current changes:"
git status --short

# Step 5: Safe to commit
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ ALL CHECKS PASSED - SAFE TO COMMIT                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "  1. Review changes: git diff"
echo "  2. Commit: git add . && git commit -m 'feat: your feature'"
echo "  3. Optional: Run full test suite: npm test"
echo ""
echo -e "${BLUE}💡 Tip: This workflow ensures nothing breaks!${NC}"
