#!/bin/bash
# Quick setup for ngrok with custom password

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 NGROK QUICK SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Step 1: Get your ngrok authtoken"
echo "   1. Go to: https://dashboard.ngrok.com"
echo "   2. Sign up (free) or log in"
echo "   3. Copy your authtoken from the dashboard"
echo ""

read -p "Enter your ngrok authtoken: " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

echo ""
echo "🔧 Configuring ngrok..."
ngrok config add-authtoken "$AUTH_TOKEN"

if [ $? -eq 0 ]; then
    echo "✅ ngrok configured successfully!"
    echo ""
    echo "🚀 Now you can start the tunnel with:"
    echo "   ./start_ngrok_with_password.sh [username] [password]"
    echo ""
    echo "   Example: ./start_ngrok_with_password.sh admin mypassword123"
    echo ""
else
    echo "❌ Configuration failed. Please check your token."
    exit 1
fi

