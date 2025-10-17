#!/bin/bash

# 📊 LANGFLIX MONITORING SETUP SCRIPT
# Agent 1 Infrastructure Engineer

set -e

echo "📊 Setting up Langflix monitoring and backup strategy..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Create monitoring configuration
log "📊 Creating monitoring configuration..."

# Uptime monitoring script
cat > scripts/uptime-monitor.js << 'EOF'
#!/usr/bin/env node

/**
 * Uptime Monitor for Langflix
 * Checks server health every 5 minutes
 */

const https = require('https');
const http = require('http');

const config = {
    url: process.env.MONITOR_URL || 'http://localhost:3001',
    interval: 5 * 60 * 1000, // 5 minutes
    timeout: 10000, // 10 seconds
    alertEmail: process.env.ALERT_EMAIL,
    webhookUrl: process.env.SLACK_WEBHOOK_URL
};

function checkHealth() {
    const startTime = Date.now();
    
    const request = (config.url.startsWith('https') ? https : http).get(config.url + '/api/health', {
        timeout: config.timeout
    }, (res) => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode === 200) {
            console.log(`✅ Health check passed (${responseTime}ms)`);
            logMetric('health_check', { status: 'success', response_time: responseTime });
        } else {
            console.error(`❌ Health check failed with status ${res.statusCode}`);
            sendAlert(`Server returned status ${res.statusCode}`);
        }
    });
    
    request.on('error', (err) => {
        console.error(`❌ Health check failed: ${err.message}`);
        sendAlert(`Server is down: ${err.message}`);
    });
    
    request.on('timeout', () => {
        console.error('❌ Health check timed out');
        sendAlert('Server health check timed out');
        request.destroy();
    });
}

function sendAlert(message) {
    if (config.webhookUrl) {
        const payload = {
            text: `🚨 Langflix Alert: ${message}`,
            channel: '#alerts',
            username: 'Langflix Monitor'
        };
        
        const https = require('https');
        const data = JSON.stringify(payload);
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = https.request(config.webhookUrl, options);
        req.write(data);
        req.end();
    }
    
    console.error(`🚨 ALERT: ${message}`);
}

function logMetric(name, data) {
    // Log metrics to console (can be extended to send to monitoring service)
    console.log(`📊 Metric: ${name}`, data);
}

// Start monitoring
console.log('📊 Starting uptime monitoring...');
checkHealth(); // Initial check
setInterval(checkHealth, config.interval);
EOF

success "Uptime monitor script created"

# Database backup script
cat > scripts/backup-database.sh << 'EOF'
#!/bin/bash

# Database backup script for Langflix
# Runs daily via cron

set -e

BACKUP_DIR="/tmp/langflix-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/langflix_backup_$DATE.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env ]; then
    source .env
fi

echo "🗄️ Creating database backup..."

# Create backup (PostgreSQL)
if [ ! -z "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    echo "✅ Database backup created: $BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup compressed: $BACKUP_FILE.gz"
    
    # Upload to S3 (if configured)
    if [ ! -z "$AWS_S3_BUCKET" ]; then
        aws s3 cp "$BACKUP_FILE.gz" "s3://$AWS_S3_BUCKET/backups/"
        echo "✅ Backup uploaded to S3"
    fi
    
    # Clean up old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
    echo "✅ Old backups cleaned up"
else
    echo "⚠️ No DATABASE_URL found, skipping backup"
fi

echo "🗄️ Database backup completed"
EOF

chmod +x scripts/backup-database.sh
success "Database backup script created"

# Performance monitoring script
cat > scripts/performance-monitor.js << 'EOF'
#!/usr/bin/env node

/**
 * Performance Monitor for Langflix
 * Tracks response times and resource usage
 */

const os = require('os');
const fs = require('fs');

function getSystemMetrics() {
    const loadAvg = os.loadavg();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const uptime = os.uptime();
    
    return {
        timestamp: new Date().toISOString(),
        load_average: loadAvg,
        memory: {
            free: freeMem,
            total: totalMem,
            used_percent: ((totalMem - freeMem) / totalMem) * 100
        },
        uptime: uptime,
        cpu_count: os.cpus().length
    };
}

function logPerformanceMetrics() {
    const metrics = getSystemMetrics();
    console.log('📊 Performance metrics:', JSON.stringify(metrics, null, 2));
    
    // Log to file
    const logFile = 'logs/performance.log';
    fs.appendFileSync(logFile, JSON.stringify(metrics) + '\n');
}

// Run every 5 minutes
setInterval(logPerformanceMetrics, 5 * 60 * 1000);
console.log('📊 Performance monitoring started...');
EOF

success "Performance monitor script created"

# Create logs directory
mkdir -p logs
success "Logs directory created"

# Setup cron jobs
log "⏰ Setting up cron jobs..."

# Create cron configuration
cat > scripts/cron-setup.sh << 'EOF'
#!/bin/bash

# Add cron jobs for monitoring and backups

# Add uptime monitoring (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $(pwd) && node scripts/uptime-monitor.js >> logs/uptime.log 2>&1") | crontab -

# Add database backup (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./scripts/backup-database.sh >> logs/backup.log 2>&1") | crontab -

# Add performance monitoring (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $(pwd) && node scripts/performance-monitor.js >> logs/performance.log 2>&1") | crontab -

echo "✅ Cron jobs configured"
echo "📋 Current cron jobs:"
crontab -l
EOF

chmod +x scripts/cron-setup.sh
success "Cron setup script created"

# Security audit script
cat > scripts/security-audit.sh << 'EOF'
#!/bin/bash

# Security audit script for Langflix
# Checks for common security issues

echo "🔒 Running security audit..."

# Check for exposed secrets
echo "🔍 Checking for exposed secrets..."
if grep -r "sk-proj-" . --exclude-dir=node_modules --exclude-dir=.git; then
    echo "⚠️ Potential API keys found in code"
else
    echo "✅ No exposed API keys found"
fi

# Check file permissions
echo "🔍 Checking file permissions..."
find . -name "*.env*" -exec ls -la {} \;
find . -name "*.key" -exec ls -la {} \;

# Check for outdated dependencies
echo "🔍 Checking for security vulnerabilities..."
npm audit --audit-level moderate || echo "⚠️ Some vulnerabilities found"

# Check for hardcoded credentials
echo "🔍 Checking for hardcoded credentials..."
if grep -r "password.*=" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md"; then
    echo "⚠️ Potential hardcoded passwords found"
else
    echo "✅ No hardcoded passwords found"
fi

echo "🔒 Security audit completed"
EOF

chmod +x scripts/security-audit.sh
success "Security audit script created"

# Create monitoring dashboard configuration
cat > monitoring/dashboard.json << 'EOF'
{
  "title": "Langflix Monitoring Dashboard",
  "panels": [
    {
      "title": "Server Health",
      "type": "health",
      "endpoint": "/api/health",
      "interval": "5m"
    },
    {
      "title": "Response Time",
      "type": "graph",
      "endpoint": "/api/metrics/response-time",
      "interval": "1m"
    },
    {
      "title": "Database Connections",
      "type": "graph",
      "endpoint": "/api/metrics/db-connections",
      "interval": "1m"
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "endpoint": "/api/metrics/errors",
      "interval": "1m"
    },
    {
      "title": "User Activity",
      "type": "graph",
      "endpoint": "/api/metrics/users",
      "interval": "5m"
    }
  ]
}
EOF

success "Monitoring dashboard configuration created"

log "📊 Monitoring setup completed!"
log ""
log "Next steps:"
log "1. Run: ./scripts/cron-setup.sh (to enable monitoring)"
log "2. Configure Slack webhook URL in .env:"
log "   SLACK_WEBHOOK_URL=https://hooks.slack.com/..."
log "3. Set up UptimeRobot for external monitoring"
log "4. Configure Sentry for error tracking"
log "5. Test monitoring scripts:"
log "   node scripts/uptime-monitor.js"
log "   node scripts/performance-monitor.js"
log ""
success "🎉 Monitoring infrastructure ready!"





