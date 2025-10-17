#!/bin/bash
# 📊 Verify Analytics System Installation

echo "📊 Analytics System - Installation Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success=0
failures=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((success++))
    else
        echo -e "${RED}❌${NC} $1 (MISSING)"
        ((failures++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        ((success++))
    else
        echo -e "${RED}❌${NC} $1/ (MISSING)"
        ((failures++))
    fi
}

echo "Checking Database Schema..."
check_file "prisma/schema.prisma"

echo ""
echo "Checking Core Files..."
check_file "lib/analytics-engine.js"
check_file "lib/user-profiler.js"
check_dir "api/analytics"
check_file "api/analytics/index.js"

echo ""
echo "Checking UI Files..."
check_file "public/progress-dashboard.html"
check_file "public/preference-setup.html"

echo ""
echo "Checking Test Files..."
check_file "tests/analytics-complete.spec.js"

echo ""
echo "Checking Documentation..."
check_file "ANALYTICS_SYSTEM_IMPLEMENTATION.md"
check_file "ANALYTICS_QUICK_START.md"
check_file "ANALYTICS_COMPLETE_SUMMARY.md"

echo ""
echo "Checking Scripts..."
check_file "scripts/apply-analytics-migration.sh"

echo ""
echo "================================================"
echo -e "Results: ${GREEN}${success} passed${NC}, ${RED}${failures} failed${NC}"
echo ""

if [ $failures -eq 0 ]; then
    echo -e "${GREEN}🎉 All files present! Analytics system is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Apply migration: ./scripts/apply-analytics-migration.sh"
    echo "  2. Start server: npm start"
    echo "  3. Visit: http://localhost:3000/progress-dashboard.html"
    echo "  4. Run tests: npx playwright test tests/analytics-complete.spec.js"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some files are missing. Please check the installation.${NC}"
    echo ""
    exit 1
fi

