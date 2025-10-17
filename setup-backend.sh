#!/bin/bash
# 🚀 Backend Setup Script - Makes everything work!

echo "🎯 Setting up your backend..."
echo ""

# Create .env file
echo "📝 Creating .env file with your credentials..."
cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://uejiwteujraxczrxbqff.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaml3dGV1anJheGN6cnhicWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDMxMzksImV4cCI6MjA3NTUxOTEzOX0.iva8q5bMcLHfqd6niXqB_i-i-VrPmKLNGr9eiiPwZHQ

# Firecrawl API
FIRECRAWL_API_KEY=fc-5c92f42486554494b59214b4fc48a38b

# Translation API
LIBRETRANSLATE_API_URL=https://libretranslate.com/translate

# Application
NODE_ENV=development
PORT=3000
EOF

echo "✅ .env file created!"
echo ""

echo "🔧 Installing dependencies..."
npm install --silent

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run migrations in Supabase Dashboard"
echo "   2. Start server with: npm start"
echo ""

