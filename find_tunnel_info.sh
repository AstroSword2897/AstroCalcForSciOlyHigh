#!/bin/bash
# Find tunnel URL and password

echo "🔍 Locating tunnel information..."
echo ""

# Kill existing tunnels
pkill -f 'lt --port' 2>/dev/null
sleep 1

echo "🚀 Starting tunnel to capture password..."
echo "   (Password appears in the output below)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start tunnel and show first 50 lines of output
lt --port 8000 2>&1 | head -50 &
TUNNEL_PID=$!

sleep 6

# Try to get URL and any password info
TUNNEL_URL=$(ps aux | grep "lt --port" | grep -v grep | head -1)
if [ -n "$TUNNEL_URL" ]; then
    echo ""
    echo "✅ Tunnel is running (PID: $TUNNEL_PID)"
    echo ""
    echo "📋 The password should have appeared in the output above."
    echo "   Look for a line containing 'password' or check the tunnel output."
    echo ""
    echo "💡 Tip: The password is usually shown right after the URL when the tunnel starts."
    echo ""
    echo "🛑 To see live output, run: lt --port 8000"
    echo "   (The password will be displayed in that terminal)"
else
    echo "⚠️  Tunnel may not have started. Try running manually:"
    echo "   lt --port 8000"
fi

