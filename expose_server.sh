#!/bin/bash
# Expose local server to the internet using tunneling services
# Usage: ./expose_server.sh [ngrok|localtunnel|cloudflared]

PORT=8000
METHOD=${1:-ngrok}

# Check if server is running
if ! lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Server not running on port $PORT"
    echo ""
    echo "Starting server first..."
    ./start_server.sh
    sleep 2
    echo ""
fi

echo "🌐 Exposing server on port $PORT to the internet..."
echo "   Method: $METHOD"
echo "   Full calculator functionality will be available"
echo ""

case $METHOD in
    ngrok)
        if ! command -v ngrok >/dev/null 2>&1; then
            echo "❌ ngrok is not installed"
            echo ""
            echo "Install ngrok:"
            echo "  macOS: brew install ngrok/ngrok/ngrok"
            echo "  Or download from: https://ngrok.com/download"
            echo ""
            echo "After installation, sign up at https://dashboard.ngrok.com"
            echo "Then run: ngrok config add-authtoken YOUR_AUTH_TOKEN"
            exit 1
        fi
        echo "🚀 Starting ngrok tunnel..."
        echo "   Public URL will be shown below"
        echo "   Press Ctrl+C to stop"
        echo ""
        ngrok http $PORT
        ;;
    
    localtunnel)
        if ! command -v lt >/dev/null 2>&1; then
            echo "❌ localtunnel is not installed"
            echo ""
            echo "Install localtunnel:"
            echo "  npm install -g localtunnel"
            echo ""
            exit 1
        fi
        echo "🚀 Starting localtunnel..."
        echo "   Public URL will be shown below"
        echo "   Press Ctrl+C to stop"
        echo ""
        lt --port $PORT
        ;;
    
    cloudflared)
        if ! command -v cloudflared >/dev/null 2>&1; then
            echo "❌ cloudflared is not installed"
            echo ""
            echo "Install cloudflared:"
            echo "  macOS: brew install cloudflare/cloudflare/cloudflared"
            echo "  Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
            echo ""
            exit 1
        fi
        echo "🚀 Starting Cloudflare tunnel..."
        echo "   Public URL will be shown below"
        echo "   Press Ctrl+C to stop"
        echo ""
        cloudflared tunnel --url http://localhost:$PORT
        ;;
    
    *)
        echo "❌ Unknown method: $METHOD"
        echo ""
        echo "Available methods:"
        echo "  ngrok        - Most popular, requires signup"
        echo "  localtunnel  - Free, no signup required"
        echo "  cloudflared  - Free from Cloudflare"
        echo ""
        echo "Usage: ./expose_server.sh [ngrok|localtunnel|cloudflared]"
        exit 1
        ;;
esac

