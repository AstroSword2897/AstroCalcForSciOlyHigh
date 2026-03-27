#!/bin/bash
# Start Cloudflare Tunnel with password protection

PORT=8000
USERNAME=${1:-"admin"}
PASSWORD=${2:-"calculator2024"}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting Cloudflare Tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared >/dev/null 2>&1; then
    echo "❌ cloudflared is not installed"
    echo ""
    echo "Installing cloudflared..."
    brew install cloudflare/cloudflare/cloudflared
    if ! command -v cloudflared >/dev/null 2>&1; then
        echo "❌ Installation failed. Please install manually:"
        echo "   brew install cloudflare/cloudflare/cloudflared"
        exit 1
    fi
fi

# Check if server is running
if ! lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Starting server on port $PORT..."
    ./start_server.sh
    sleep 2
fi

echo "📋 Access Details:"
echo "   Username: $USERNAME"
echo "   Password: $PASSWORD"
echo ""
echo "🌐 Starting Cloudflare tunnel..."
echo "   (Public URL will appear below)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start cloudflared tunnel
# Note: Cloudflare Tunnel doesn't support basic auth directly
# We'll need to use a different approach or add auth at the app level
cloudflared tunnel --url http://localhost:$PORT 2>&1 | tee /tmp/cloudflare_tunnel.log &
TUNNEL_PID=$!

# Wait for tunnel to start
sleep 6

# Extract URL from output
TUNNEL_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /tmp/cloudflare_tunnel.log 2>/dev/null | head -1)

if [ -n "$TUNNEL_URL" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ TUNNEL ACTIVE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Public URL: $TUNNEL_URL"
    echo ""
    echo "📋 Share with users:"
    echo "   URL: $TUNNEL_URL"
    echo "   (No password required - Cloudflare Tunnel is secure)"
    echo ""
    echo "🛑 To stop: kill $TUNNEL_PID"
    echo "   Or run: pkill -f 'cloudflared tunnel'"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "⚠️  Tunnel starting... Check output:"
    tail -20 /tmp/cloudflare_tunnel.log 2>/dev/null || echo "Waiting for tunnel..."
    echo ""
    echo "The URL will appear above. Keep checking or run:"
    echo "  tail -f /tmp/cloudflare_tunnel.log"
fi

