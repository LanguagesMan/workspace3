# 🎯 MCP Smart Testing and Monitoring System

A comprehensive Model Context Protocol (MCP) system for intelligent testing, monitoring, and quality assurance.

## 🚀 Overview

This system provides **eyes-on-glass coverage** through intelligent MCP orchestration, combining:

- **Playwright MCP** - Persona flows, guided journeys, and regression testing
- **Serena MCP** - Audit logs, telemetry analysis, and weight adjustments
- **Firecrawl MCP** - Content QA, compliance monitoring, and metadata verification
- **GitHub MCP** - Architectural guidelines and schema drift checks
- **Integration Suites** - Comprehensive regression testing and visual diffs

## 📁 System Components

### 🎭 Playwright MCP (`playwright-persona-flows.js`)
**Eyes-on-glass coverage with persona flows and guided journeys**

**Features:**
- **Persona Flows**: Beginner/Intermediate/Advanced user journeys
- **Guided Journey**: Article→Video→Quiz learning paths
- **Regression Suites**: TikTok video feed, LangFlix app, visual diffs
- **Auto-load QA artifacts**: Screenshots, traces, evidence collection

**Usage:**
```bash
node playwright-persona-flows.js
```

**Output:**
- Screenshots: `evidence/playwright-tests/[timestamp]/`
- Videos: `evidence/playwright-tests/[timestamp]/videos/`
- Reports: `evidence/playwright-tests/[timestamp]/final-report.json`

### 🔍 Serena MCP (`serena-analysis-mcp.js`)
**Audit logs and telemetry analysis**

**Features:**
- **Log Analysis**: Parse Sentry/Pino logs, flag spikes
- **Ranking Debug**: Inspect ranking debug endpoints for anomalies
- **Weight Adjustments**: Suggest weight adjustments based on engagement stats
- **Anomaly Detection**: Performance degradation, engagement drops, API spikes

**Usage:**
```bash
node serena-analysis-mcp.js
```

**Output:**
- Analysis: `evidence/serena-analysis/[timestamp]/`
- Reports: `evidence/serena-analysis/[timestamp]/serena-analysis-report.json`

### 🔥 Firecrawl MCP (`firecrawl-content-qa.js`)
**Content QA and compliance monitoring**

**Features:**
- **Content Crawling**: Periodically crawl new articles/news
- **Metadata Verification**: Verify ingestion metadata
- **Compliance Checking**: Cross-check licensing markers
- **Dashboard Updates**: Update compliance dashboard

**Usage:**
```bash
node firecrawl-content-qa.js
```

**Output:**
- Crawled Content: `evidence/firecrawl-qa/[timestamp]/`
- Compliance: `evidence/firecrawl-qa/[timestamp]/compliance-dashboard.json`

### 🐙 GitHub MCP (`github-static-review.js`)
**Architectural guidelines and schema drift checks**

**Features:**
- **Architecture Enforcement**: No direct file access bypassing service layer
- **Schema Drift Checks**: Ensure migrations keep Supabase in sync
- **Type Safety**: TypeScript types required for API endpoints
- **Error Handling**: Proper error handling requirements

**Usage:**
```bash
node github-static-review.js
```

**Output:**
- Reviews: `evidence/github-review/[timestamp]/`
- Reports: `evidence/github-review/[timestamp]/github-review-report.json`

### 🧪 Integration Test Suites (`integration-test-suites.js`)
**Regression testing and visual diffs**

**Features:**
- **TikTok Video Feed**: Vertical scroll physics, gesture controls, autoplay
- **LangFlix App**: User auth, video playback, quiz functionality
- **Visual Diffs**: Cross-browser testing (Chromium, Firefox, WebKit)
- **Performance Metrics**: Load times, paint metrics, accessibility

**Usage:**
```bash
node integration-test-suites.js
```

**Output:**
- Screenshots: `evidence/integration-tests/[timestamp]/`
- Reports: `evidence/integration-tests/[timestamp]/integration-test-report.json`

### 🎯 MCP Orchestration (`mcp-orchestration.js`)
**Smart orchestration of all MCPs**

**Features:**
- **Smart Sequencing**: Run MCPs in priority order with dependency management
- **Health Monitoring**: MCP health dashboard and performance metrics
- **Failure Recovery**: Handle MCP failures gracefully
- **Comprehensive Reporting**: Orchestration reports and recommendations

**Usage:**
```bash
# Run all MCPs
node mcp-orchestration.js

# Run specific MCPs
node mcp-orchestration.js --subset playwright-persona-flows,serena-analysis
```

**Output:**
- Orchestration: `evidence/mcp-orchestration/[timestamp]/`
- Health Dashboard: `evidence/mcp-orchestration/[timestamp]/mcp-health-dashboard.json`

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+ 
- Playwright browsers installed
- Firecrawl API key
- GitHub token (optional)
- Supabase CLI (optional)

### Installation
```bash
# Install dependencies
npm install playwright firefox webkit node-fetch

# Install Playwright browsers
npx playwright install

# Set environment variables
export FIRECRAWL_API_KEY="your_firecrawl_api_key"
export GITHUB_TOKEN="your_github_token"
export APP_URL="http://localhost:3000"
```

### Quick Start
```bash
# Run all MCPs
node mcp-orchestration.js

# Run specific MCP
node playwright-persona-flows.js

# Check MCP health
node mcp-orchestration.js --health
```

## 📊 Output Structure

```
evidence/
├── playwright-tests/
│   └── [timestamp]/
│       ├── screenshots/
│       ├── videos/
│       └── final-report.json
├── serena-analysis/
│   └── [timestamp]/
│       └── serena-analysis-report.json
├── firecrawl-qa/
│   └── [timestamp]/
│       ├── compliance-dashboard.json
│       └── firecrawl-qa-report.json
├── github-review/
│   └── [timestamp]/
│       └── github-review-report.json
├── integration-tests/
│   └── [timestamp]/
│       ├── screenshots/
│       └── integration-test-report.json
└── mcp-orchestration/
    └── [timestamp]/
        ├── mcp-orchestration-report.json
        └── mcp-health-dashboard.json
```

## 🎯 Smart Usage Patterns

### 1. Eyes-on-Glass Coverage
```bash
# Comprehensive visual testing
node playwright-persona-flows.js
```
- Tests all user personas (beginner/intermediate/advanced)
- Captures screenshots on multiple devices
- Records video evidence
- Generates detailed reports

### 2. Log Analysis and Monitoring
```bash
# Analyze logs and detect anomalies
node serena-analysis-mcp.js
```
- Parses Sentry/Pino logs
- Detects performance spikes
- Suggests weight adjustments
- Monitors ranking algorithms

### 3. Content Quality Assurance
```bash
# Crawl and verify content
node firecrawl-content-qa.js
```
- Crawls new articles and news
- Verifies metadata and licensing
- Updates compliance dashboard
- Generates quality reports

### 4. Architecture and Schema Validation
```bash
# Check architectural guidelines
node github-static-review.js
```
- Enforces architectural patterns
- Checks schema drift
- Validates type safety
- Reviews error handling

### 5. Regression Testing
```bash
# Run comprehensive regression tests
node integration-test-suites.js
```
- Tests TikTok-style video feed
- Validates LangFlix app functionality
- Performs visual diff testing
- Measures performance metrics

## 🔧 Configuration

### Environment Variables
```bash
# Required
export FIRECRAWL_API_KEY="fc-your-api-key"
export APP_URL="http://localhost:3000"

# Optional
export GITHUB_TOKEN="your-github-token"
export DATABASE_URL="your-database-url"
export BRAVE_API_KEY="your-brave-api-key"
```

### MCP Configuration
The system automatically detects and uses the existing MCP configuration in `.cursor/mcp-config.json`.

## 📈 Monitoring and Health

### Health Dashboard
```bash
# Generate health dashboard
node mcp-orchestration.js --health
```

**Health Metrics:**
- Overall system health score
- Individual MCP performance
- Reliability metrics
- Trend analysis
- Alert generation

### Performance Monitoring
- MCP execution times
- Success/failure rates
- Resource utilization
- Dependency health

## 🚨 Troubleshooting

### Common Issues

**1. Playwright Browser Issues**
```bash
# Reinstall browsers
npx playwright install
```

**2. Firecrawl API Issues**
```bash
# Check API key
echo $FIRECRAWL_API_KEY
```

**3. MCP Dependencies**
```bash
# Check MCP status
node mcp-orchestration.js --status
```

**4. Permission Issues**
```bash
# Fix file permissions
chmod +x mcp-examples/*.js
```

### Debug Mode
```bash
# Run with debug logging
DEBUG=mcp* node mcp-orchestration.js
```

## 🎓 Best Practices

### 1. Regular Monitoring
- Run orchestration daily
- Monitor health dashboard
- Review failure reports
- Update MCP configurations

### 2. Performance Optimization
- Optimize slow MCPs
- Use parallel execution where possible
- Cache results when appropriate
- Monitor resource usage

### 3. Error Handling
- Implement retry logic
- Handle dependency failures
- Log errors appropriately
- Generate actionable reports

### 4. Maintenance
- Update MCP dependencies
- Review and update configurations
- Clean up old evidence files
- Monitor system health

## 📚 Advanced Usage

### Custom MCP Sequences
```javascript
// Create custom orchestration
const orchestration = new MCPOrchestration();
await orchestration.runMCPSubset([
  'playwright-persona-flows',
  'serena-analysis'
]);
```

### Health Monitoring
```javascript
// Generate health dashboard
const dashboard = await orchestration.generateHealthDashboard();
console.log('Health Score:', dashboard.health.overall.score);
```

### Performance Analysis
```javascript
// Analyze MCP performance
const metrics = orchestration.calculatePerformanceMetrics();
console.log('Average Duration:', metrics.average);
```

## 🔮 Future Enhancements

- **AI-Powered Analysis**: Machine learning for anomaly detection
- **Real-time Monitoring**: Live MCP health monitoring
- **Automated Remediation**: Self-healing MCP failures
- **Advanced Reporting**: Interactive dashboards and visualizations
- **Integration APIs**: REST APIs for MCP orchestration
- **Cloud Deployment**: Containerized MCP deployment

## 📞 Support

For issues, questions, or contributions:

1. Check the troubleshooting section
2. Review the health dashboard
3. Examine the orchestration reports
4. Create detailed issue reports with evidence

## 📄 License

This MCP system is part of the LangFlix project and follows the same licensing terms.

---

**🎯 Smart Testing and Monitoring System - Powered by MCP Intelligence**
