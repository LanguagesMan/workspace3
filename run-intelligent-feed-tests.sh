#!/bin/bash

# 🧠 INTELLIGENT FEED SYSTEM - COMPLETE TEST RUNNER
# Runs all tests to validate adaptive learning system

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🧠 INTELLIGENT FEED SYSTEM - COMPLETE TEST SUITE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo ""
    echo "▶ Running: $test_name"
    echo "────────────────────────────────────────────────────────"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval $test_command; then
        echo -e "${GREEN}✅ PASSED${NC}: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED${NC}: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# ═══════════════════════════════════════════════════════════
# 1. UNIT TESTS
# ═══════════════════════════════════════════════════════════

echo "📦 PART 1: UNIT TESTS"
echo ""

run_test "Intelligent Feed Validation" "node tests/intelligent-feed-validation.test.js"

run_test "Adaptive Feed System" "node tests/adaptive-feed-system.test.js"

# ═══════════════════════════════════════════════════════════
# 2. E2E TESTS (Optional - requires Playwright)
# ═══════════════════════════════════════════════════════════

if command -v npx &> /dev/null; then
    echo ""
    echo "🌐 PART 2: END-TO-END TESTS"
    echo ""
    
    # Check if Playwright is installed
    if [ -d "node_modules/@playwright" ]; then
        run_test "Adaptive Feed E2E" "npx playwright test tests/adaptive-feed-e2e.spec.js --reporter=line"
        
        run_test "Smart Recommendations E2E" "npx playwright test tests/smart-recommendations.spec.js --reporter=line"
    else
        echo -e "${YELLOW}⚠️  Skipping E2E tests - Playwright not installed${NC}"
        echo "   Install with: npm install --save-dev @playwright/test"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping E2E tests - Node.js not found${NC}"
fi

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📊 TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Total Tests:   $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:        $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed:        $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo -e "  ${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "  Your intelligent feed system is working perfectly."
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "✨ The system demonstrates:"
    echo "   ✓ Smart video difficulty ranking"
    echo "   ✓ Accurate level matching"
    echo "   ✓ Responsive feedback loops"
    echo "   ✓ Word-based prioritization"
    echo "   ✓ Adaptive learning over time"
    echo ""
    echo "🚀 Your feed is ready to deliver personalized, intelligent content!"
    echo ""
    exit 0
else
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo -e "  ${RED}⚠️  SOME TESTS FAILED${NC}"
    echo "  Review the errors above to improve the system."
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    exit 1
fi

