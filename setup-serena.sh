#!/bin/bash

# 🎯 Serena MCP Server Setup Script
# Sets up and starts Serena IDE for semantic code operations

echo "🎯 Setting up Serena MCP Server for Cursor..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install Serena MCP Server globally
echo "📦 Installing @serena/mcp-server globally..."
npm install -g @serena/mcp-server

if [ $? -eq 0 ]; then
    echo "✅ Serena MCP Server installed successfully!"
else
    echo "❌ Failed to install Serena MCP Server"
    exit 1
fi

echo ""

# Check if Serena is already running
if lsof -Pi :9121 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Serena is already running on port 9121"
    echo ""
    read -p "Kill existing process and restart? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Stopping existing Serena process..."
        lsof -ti:9121 | xargs kill -9
        sleep 2
    else
        echo "✅ Keeping existing Serena process running"
        exit 0
    fi
fi

# Start Serena in the background
echo "🚀 Starting Serena MCP Server on port 9121..."
nohup serena-mcp > /tmp/serena-mcp.log 2>&1 &
SERENA_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if lsof -Pi :9121 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Serena MCP Server is running! (PID: $SERENA_PID)"
    echo "   URL: http://localhost:9121/mcp"
    echo "   Logs: /tmp/serena-mcp.log"
    echo ""
    echo "🎉 Serena is ready for Cursor!"
    echo ""
    echo "📝 To stop Serena later:"
    echo "   kill $SERENA_PID"
    echo "   or: lsof -ti:9121 | xargs kill"
    echo ""
    echo "📝 To view logs:"
    echo "   tail -f /tmp/serena-mcp.log"
else
    echo "❌ Failed to start Serena MCP Server"
    echo "   Check logs: cat /tmp/serena-mcp.log"
    exit 1
fi

# Test the connection
echo "🧪 Testing connection..."
if curl -s http://localhost:9121/mcp > /dev/null; then
    echo "✅ Connection test successful!"
else
    echo "⚠️  Connection test failed, but server appears to be running"
    echo "   This might be normal if the endpoint doesn't respond to basic GET requests"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Restart Cursor to load the MCP configuration"
echo "2. Start coding - Serena will automatically handle semantic code operations!"
echo "3. Try: 'Find all functions that handle video playback'"
echo ""

