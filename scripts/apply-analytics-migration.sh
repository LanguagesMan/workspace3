#!/bin/bash
# 📊 Analytics System - Database Migration Script
# This script applies the analytics schema changes to the database

echo "📊 Analytics System - Database Migration"
echo "========================================"
echo ""
echo "⚠️  WARNING: This will modify your database schema."
echo "    Make sure you have a backup if running in production!"
echo ""

# Check if in development
if [ "$NODE_ENV" = "production" ]; then
    echo "❌ ERROR: This script should not be run in production!"
    echo "   Please use 'npx prisma migrate deploy' for production."
    exit 1
fi

echo "🔍 Checking Prisma installation..."
if ! command -v npx &> /dev/null; then
    echo "❌ ERROR: npx not found. Please install Node.js first."
    exit 1
fi

echo "✅ Prisma found"
echo ""

# Option 1: Create migration (recommended)
echo "📝 Creating new migration for analytics tables..."
echo ""
npx prisma migrate dev --name add_analytics_tables

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📊 New tables created:"
    echo "   - DailyActivity (daily user metrics)"
    echo "   - UserInterestCategory (7 interest categories)"
    echo "   - ContentEngagement (interaction tracking)"
    echo ""
    echo "🎉 Analytics system is ready to use!"
    echo ""
    echo "Next steps:"
    echo "  1. Start the server: npm start"
    echo "  2. View dashboard: http://localhost:3000/progress-dashboard.html"
    echo "  3. Run tests: npx playwright test tests/analytics-complete.spec.js"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "This might be due to drift in your database."
    echo "You have two options:"
    echo ""
    echo "Option 1 (Recommended): Reset database (LOSES ALL DATA)"
    echo "  npx prisma migrate reset --force"
    echo ""
    echo "Option 2: Manually resolve drift"
    echo "  1. Check prisma/migrations directory"
    echo "  2. Resolve conflicts manually"
    echo "  3. Run: npx prisma migrate deploy"
    echo ""
    exit 1
fi


