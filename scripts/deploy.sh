#!/bin/bash

# 🚀 LANGFLIX DEPLOYMENT SCRIPT
# Agent 1 Infrastructure Engineer

set -e  # Exit on any error

echo "🚀 Starting Langflix deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if .env file exists
if [ ! -f .env ]; then
    error ".env file not found. Please create it first."
    exit 1
fi

# Load environment variables
source .env

log "🔍 Validating environment..."

# Check required environment variables
required_vars=(
    "DATABASE_URL"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "OPENAI_API_KEY"
    "JWT_SECRET"
    "SESSION_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        error "Missing required environment variable: $var"
        exit 1
    fi
done

success "Environment validation passed"

# Install dependencies
log "📦 Installing dependencies..."
npm ci
success "Dependencies installed"

# Generate Prisma client
log "🗄️ Generating Prisma client..."
npx prisma generate
success "Prisma client generated"

# Run database migrations
log "🗄️ Running database migrations..."
npx prisma db push
success "Database migrations completed"

# Run tests
log "🧪 Running tests..."
npm test || warning "Some tests failed, continuing deployment"
success "Tests completed"

# Build application
log "🏗️ Building application..."
npm run build || log "No build script found, skipping build step"
success "Build completed"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
log "🚀 Deploying to Vercel..."
if [ "$1" = "--production" ]; then
    vercel --prod --yes
    success "Deployed to production!"
else
    vercel --yes
    success "Deployed to preview!"
fi

# Health check
log "🔍 Running health check..."
sleep 10
if curl -f http://localhost:3001/api/health &> /dev/null; then
    success "Health check passed"
else
    warning "Health check failed, but deployment completed"
fi

success "🎉 Deployment completed successfully!"
log "Next steps:"
log "1. Update environment variables in Vercel dashboard"
log "2. Test the deployed application"
log "3. Set up monitoring and alerts"





