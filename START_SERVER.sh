#!/bin/bash

# Kill any existing servers
echo "🛑 Stopping any existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 2

# Start server
echo "🚀 Starting server on port 3001..."
cd /Users/mindful/_projects/workspace3
PORT=3001 npm start

echo "✅ Server started! Open: http://localhost:3001/discover-articles.html"

