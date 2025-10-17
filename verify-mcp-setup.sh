#!/bin/bash

# 🔍 MCP Configuration Verification Script
# Verifies that all MCP configurations are properly set up

echo "🔍 Verifying Cursor MCP Configuration..."
echo ""
echo "=========================================="
echo ""

# Function to check if file exists and show status
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "✅ $description"
        echo "   📁 $file"
        return 0
    else
        echo "❌ $description"
        echo "   📁 $file (NOT FOUND)"
        return 1
    fi
}

# Function to check if serena is running
check_serena() {
    if lsof -Pi :9121 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ Serena MCP Server is running on port 9121"
        return 0
    else
        echo "❌ Serena MCP Server is NOT running"
        echo "   Run: ./setup-serena.sh to start it"
        return 1
    fi
}

# Check global configuration files
echo "📋 Checking Global Configuration Files:"
echo ""

check_file "$HOME/.cursor/mcp.json" "Global MCP config (~/.cursor/mcp.json)"
global_cursor=$?

check_file "$HOME/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json" "Cline MCP settings"
cline_settings=$?

check_file "$HOME/.cursorrules" "Global Cursor rules (~/.cursorrules)"
cursorrules=$?

echo ""
echo "=========================================="
echo ""
echo "📋 Checking Project Configuration Files:"
echo ""

check_file "$(pwd)/.cursor/mcp-config.json" "Project MCP config (.cursor/mcp-config.json)"
project_config=$?

echo ""
echo "=========================================="
echo ""
echo "🔧 Checking MCP Services:"
echo ""

# Check Serena
check_serena
serena_status=$?

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js installed: $(node --version)"
    node_status=0
else
    echo "❌ Node.js not found (required for npx-based MCPs)"
    node_status=1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm installed: $(npm --version)"
    npm_status=0
else
    echo "❌ npm not found"
    npm_status=1
fi

echo ""
echo "=========================================="
echo ""
echo "🔑 Checking Environment Variables:"
echo ""

# Check environment variables
check_env() {
    local var=$1
    local description=$2
    
    if [ -n "${!var}" ]; then
        echo "✅ $description ($var)"
        return 0
    else
        echo "⚠️  $description ($var) - Not set (optional)"
        return 1
    fi
}

check_env "GITHUB_TOKEN" "GitHub token"
check_env "FIGMA_TOKEN" "Figma token"
check_env "BRAVE_API_KEY" "Brave Search API key"
check_env "DATABASE_URL" "Database URL"

echo ""
echo "=========================================="
echo ""
echo "📊 Configuration Summary:"
echo ""

total_checks=0
passed_checks=0

# Count checks
if [ $global_cursor -eq 0 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $cline_settings -eq 0 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $cursorrules -eq 0 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $project_config -eq 0 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $serena_status -eq 0 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $node_status -eq 0 ]; then ((passed_checks++)); fi; ((total_checks++))
if [ $npm_status -eq 0 ]; then ((passed_checks++)); fi; ((total_checks++))

echo "Configuration checks: $passed_checks/$total_checks passed"
echo ""

if [ $passed_checks -eq $total_checks ]; then
    echo "🎉 PERFECT! All configurations are set up correctly!"
    echo ""
    echo "✅ Your Cursor is configured with the SMARTEST MCPs:"
    echo "   🧠 sequential-thinking-mas (Deep reasoning & planning)"
    echo "   🎯 serena-ide (Semantic code operations)"
    echo "   ⚡ Playwright, Firecrawl, GitHub, Figma, and more!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Restart Cursor if you haven't already"
    echo "   2. Start coding with natural language!"
    echo "   3. Try: 'Plan how to optimize video loading performance'"
elif [ $passed_checks -ge 5 ]; then
    echo "✅ GOOD! Core configurations are set up."
    echo ""
    echo "⚠️  Optional improvements:"
    if [ $serena_status -ne 0 ]; then
        echo "   - Run ./setup-serena.sh to enable semantic code operations"
    fi
    echo "   - Set environment variables for additional MCPs (optional)"
    echo ""
    echo "📝 You can start using Cursor now!"
else
    echo "⚠️  NEEDS ATTENTION! Some required configurations are missing."
    echo ""
    echo "🔧 Recommended actions:"
    if [ $global_cursor -ne 0 ]; then
        echo "   - Verify ~/.cursor/mcp.json exists"
    fi
    if [ $node_status -ne 0 ]; then
        echo "   - Install Node.js from https://nodejs.org/"
    fi
    if [ $serena_status -ne 0 ]; then
        echo "   - Run ./setup-serena.sh to set up Serena"
    fi
fi

echo ""
echo "=========================================="
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: CURSOR_GLOBAL_MCP_SETUP.md"
echo "   - Workflow Guide: MCP_SMART_WORKFLOW_GUIDE.md"
echo "   - Quick Start: MCP_QUICK_START.md"
echo ""
echo "🆘 Need help?"
echo "   - Check logs: tail -f /tmp/serena-mcp.log"
echo "   - Restart Cursor completely"
echo "   - Verify MCP settings in Cursor: Settings → Extensions → MCP"
echo ""

