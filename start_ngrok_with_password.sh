#!/bin/bash
# Start ngrok with custom password protection

PORT=8000
USERNAME=${1:-"admin"}
PASSWORD=${2:-"calculator2024"}

echo "🔒 Setting up ngrok with custom password..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok >/dev/null 2>&1; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Installing ngrok..."
    brew install ngrok/ngrok/ngrok
    
    if ! command -v ngrok >/dev/null 2>&1; then
        echo ""
        echo "⚠️  Installation may require manual setup"
        echo "   1. Download from: https://ngrok.com/download"
        echo "   2. Or sign up at: https://dashboard.ngrok.com"
        exit 1
    fi
fi

# Check if ngrok is configured
if ! ngrok config check >/dev/null 2>&1; then
    echo "⚠️  ngrok is not configured"
    echo ""
    echo "You need to:"
    echo "   1. Sign up at: https://dashboard.ngrok.com (free)"
    echo "   2. Get your authtoken from the dashboard"
    echo "   3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    echo "After that, run this script again."
    exit 1
fi

# Check if server is running
if ! lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Server not running on port $PORT"
    echo "Starting server..."
    ./start_server.sh
    sleep 2
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting ngrok tunnel with password protection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Access Details:"
echo "   Username: $USERNAME"
echo "   Password: $PASSWORD"
echo ""
echo "🌐 Public URL will appear below..."
echo "   (Press Ctrl+C to stop)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start ngrok with basic auth
ngrok http $PORT --basic-auth="$USERNAME:$PASSWORD"

