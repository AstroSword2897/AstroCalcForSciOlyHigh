#!/bin/bash
# Extract password from localtunnel connection

PORT=8000
LOG_FILE="/tmp/tunnel_password_extract.log"

echo "🔍 Extracting tunnel password..."
echo ""

# Kill existing
pkill -f 'lt --port' 2>/dev/null
sleep 2

# Start tunnel and capture ALL output including stderr
echo "🚀 Starting tunnel and capturing password..."
lt --port $PORT > "$LOG_FILE" 2>&1 &
TUNNEL_PID=$!

# Wait for connection
sleep 8

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FULL TUNNEL OUTPUT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$LOG_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Extract URL
URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.loca\.lt' "$LOG_FILE" | head -1)

# Try to find password in various formats
PASSWORD=$(grep -iE "password|tunnel.*pass|pass.*tunnel" "$LOG_FILE" | grep -oE '[a-zA-Z0-9]{6,}' | head -1)

if [ -n "$URL" ]; then
    echo ""
    echo "🌐 TUNNEL URL: $URL"
    echo ""
fi

if [ -n "$PASSWORD" ]; then
    echo "🔑 PASSWORD FOUND: $PASSWORD"
    echo ""
else
    echo "⚠️  Password not found in standard output."
    echo ""
    echo "💡 The password is usually shown when the tunnel first connects."
    echo "   It may appear as a random string after 'password:' or similar."
    echo ""
    echo "📝 Check the output above for any password-related text."
    echo ""
    echo "🔄 If password isn't shown, you can:"
    echo "   1. Run: lt --port 8000 (in a terminal to see it interactively)"
    echo "   2. Or check the tunnel page - password might be in the URL or page source"
fi

echo ""
echo "🛑 Tunnel PID: $TUNNEL_PID (run 'kill $TUNNEL_PID' to stop)"

