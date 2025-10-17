#!/bin/bash

# 🎯 MCP Smart Testing and Monitoring System - Quick Start
# 
# This script provides easy access to all MCP functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "🔍 Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) ✓"
    
    # Check if required files exist
    REQUIRED_FILES=(
        "playwright-persona-flows.js"
        "serena-analysis-mcp.js"
        "firecrawl-content-qa.js"
        "github-static-review.js"
        "integration-test-suites.js"
        "mcp-orchestration.js"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file not found: $file"
            exit 1
        fi
    done
    print_success "All required files present ✓"
    
    # Check environment variables
    if [ -z "$FIRECRAWL_API_KEY" ]; then
        print_warning "FIRECRAWL_API_KEY not set. Some MCPs may not work properly."
    else
        print_success "FIRECRAWL_API_KEY set ✓"
    fi
    
    if [ -z "$APP_URL" ]; then
        print_warning "APP_URL not set. Defaulting to http://localhost:3000"
        export APP_URL="http://localhost:3000"
    else
        print_success "APP_URL set to $APP_URL ✓"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_header "📦 Installing Dependencies"
    
    if [ ! -f "package.json" ]; then
        print_status "Creating package.json..."
        cat > package.json << EOF
{
  "name": "mcp-smart-testing",
  "version": "1.0.0",
  "description": "MCP Smart Testing and Monitoring System",
  "main": "mcp-orchestration.js",
  "scripts": {
    "start": "node mcp-orchestration.js",
    "playwright": "node playwright-persona-flows.js",
    "serena": "node serena-analysis-mcp.js",
    "firecrawl": "node firecrawl-content-qa.js",
    "github": "node github-static-review.js",
    "integration": "node integration-test-suites.js",
    "health": "node mcp-orchestration.js --health"
  },
  "dependencies": {
    "playwright": "^1.40.0",
    "node-fetch": "^2.6.7"
  }
}
EOF
    fi
    
    print_status "Installing Node.js dependencies..."
    npm install --silent
    
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
    
    print_success "Dependencies installed ✓"
}

# Function to run all MCPs
run_all_mcps() {
    print_header "🚀 Running All MCPs"
    
    print_status "Starting MCP orchestration..."
    node mcp-orchestration.js
    
    if [ $? -eq 0 ]; then
        print_success "All MCPs completed successfully!"
    else
        print_error "Some MCPs failed. Check the logs for details."
        exit 1
    fi
}

# Function to run specific MCP
run_specific_mcp() {
    local mcp_name="$1"
    
    case "$mcp_name" in
        "playwright"|"playwright-persona-flows")
            print_header "🎭 Running Playwright MCP"
            node playwright-persona-flows.js
            ;;
        "serena"|"serena-analysis")
            print_header "🔍 Running Serena MCP"
            node serena-analysis-mcp.js
            ;;
        "firecrawl"|"firecrawl-content-qa")
            print_header "🔥 Running Firecrawl MCP"
            node firecrawl-content-qa.js
            ;;
        "github"|"github-static-review")
            print_header "🐙 Running GitHub MCP"
            node github-static-review.js
            ;;
        "integration"|"integration-test-suites")
            print_header "🧪 Running Integration Test Suites"
            node integration-test-suites.js
            ;;
        *)
            print_error "Unknown MCP: $mcp_name"
            print_status "Available MCPs: playwright, serena, firecrawl, github, integration"
            exit 1
            ;;
    esac
}

# Function to show health status
show_health() {
    print_header "📊 MCP Health Status"
    
    if [ -f "mcp-orchestration.js" ]; then
        node mcp-orchestration.js --health
    else
        print_error "MCP orchestration file not found"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo -e "${CYAN}🎯 MCP Smart Testing and Monitoring System${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  all                    Run all MCPs (default)"
    echo "  playwright            Run Playwright MCP (persona flows, guided journeys)"
    echo "  serena                Run Serena MCP (audit logs, telemetry analysis)"
    echo "  firecrawl             Run Firecrawl MCP (content QA, compliance)"
    echo "  github                Run GitHub MCP (architectural guidelines, schema drift)"
    echo "  integration           Run Integration Test Suites (regression testing)"
    echo "  health                Show MCP health status"
    echo "  install               Install dependencies"
    echo "  check                 Check prerequisites"
    echo "  help                  Show this help message"
    echo ""
    echo "Options:"
    echo "  --subset MCP1,MCP2   Run specific MCPs (e.g., playwright,serena)"
    echo "  --health             Show health status"
    echo ""
    echo "Examples:"
    echo "  $0 all                           # Run all MCPs"
    echo "  $0 playwright                    # Run only Playwright MCP"
    echo "  $0 --subset playwright,serena    # Run specific MCPs"
    echo "  $0 health                         # Show health status"
    echo "  $0 install                       # Install dependencies"
    echo ""
    echo "Environment Variables:"
    echo "  FIRECRAWL_API_KEY    Firecrawl API key (required for content QA)"
    echo "  APP_URL              Application URL (default: http://localhost:3000)"
    echo "  GITHUB_TOKEN         GitHub token (optional for GitHub MCP)"
    echo "  DATABASE_URL         Database URL (optional for database operations)"
}

# Function to run MCP subset
run_mcp_subset() {
    local mcps="$1"
    print_header "🔄 Running MCP Subset: $mcps"
    
    IFS=',' read -ra MCP_ARRAY <<< "$mcps"
    for mcp in "${MCP_ARRAY[@]}"; do
        run_specific_mcp "$mcp"
    done
}

# Main script logic
main() {
    print_header "🎯 MCP Smart Testing and Monitoring System"
    
    case "${1:-all}" in
        "all")
            check_prerequisites
            install_dependencies
            run_all_mcps
            ;;
        "playwright"|"serena"|"firecrawl"|"github"|"integration")
            check_prerequisites
            install_dependencies
            run_specific_mcp "$1"
            ;;
        "health")
            show_health
            ;;
        "install")
            install_dependencies
            ;;
        "check")
            check_prerequisites
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "--subset")
            if [ -z "$2" ]; then
                print_error "No MCPs specified for subset"
                exit 1
            fi
            check_prerequisites
            install_dependencies
            run_mcp_subset "$2"
            ;;
        "--health")
            show_health
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
