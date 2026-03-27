#!/bin/bash
# Start tunnel and show URL immediately

PORT=8000

echo "🚀 Starting tunnel for port $PORT..."
echo ""

# Start tunnel in background and capture URL
lt --port $PORT > /tmp/tunnel_output.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel to start and get URL
sleep 4

# Extract URL from output
TUNNEL_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.loca\.lt' /tmp/tunnel_output.log 2>/dev/null | head -1)

if [ -n "$TUNNEL_URL" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ TUNNEL ACTIVE!"
    echo ""
    echo "🌐 Public URL: $TUNNEL_URL"
    echo ""
    echo "📋 Share this URL with anyone to give them full access to your calculator!"
    echo ""
    echo "🛑 To stop: kill $TUNNEL_PID"
    echo "   Or run: pkill -f 'lt --port'"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Tunnel is running in background. Check /tmp/tunnel_output.log for details."
else
    echo "⚠️  Tunnel starting... Check output:"
    cat /tmp/tunnel_output.log 2>/dev/null || echo "Waiting for tunnel to initialize..."
    echo ""
    echo "The URL will appear above. Keep this terminal open or check:"
    echo "  tail -f /tmp/tunnel_output.log"
fi

