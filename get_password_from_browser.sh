#!/bin/bash
# Instructions to get the tunnel password

PORT=8000
CURRENT_URL=$(ps aux | grep "lt --port $PORT" | grep -v grep | head -1)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 HOW TO GET THE TUNNEL PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get current tunnel URL
if [ -n "$CURRENT_URL" ]; then
    # Extract URL from process or get latest
    URL=$(lt --port $PORT 2>&1 | grep -oE 'https://[a-zA-Z0-9-]+\.loca\.lt' | head -1)
    
    if [ -z "$URL" ]; then
        # Try to get from log
        URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.loca\.lt' /tmp/tunnel_full_output.log 2>/dev/null | tail -1)
    fi
    
    if [ -z "$URL" ]; then
        URL="https://dirty-socks-ask.loca.lt"  # Fallback to last known
    fi
else
    echo "⚠️  No active tunnel found. Starting one..."
    pkill -f 'lt --port' 2>/dev/null
    sleep 2
    lt --port $PORT > /tmp/tunnel_url.log 2>&1 &
    sleep 5
    URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.loca\.lt' /tmp/tunnel_url.log | head -1)
fi

if [ -n "$URL" ]; then
    echo "🌐 Current Tunnel URL: $URL"
    echo ""
    echo "📋 METHOD 1: View in Browser (Easiest)"
    echo "   1. Open this URL in your browser: $URL"
    echo "   2. The password will be displayed on the warning page"
    echo "   3. Copy the password and share it with users"
    echo ""
    echo "📋 METHOD 2: Check Terminal Output"
    echo "   Run this command in a new terminal:"
    echo "   lt --port 8000"
    echo "   (The password appears in the output when tunnel connects)"
    echo ""
    echo "📋 METHOD 3: Extract from Page Source"
    echo "   The password is usually shown in the page HTML"
    echo "   Visit the URL and view page source (Cmd+Option+U on Mac)"
    echo ""
else
    echo "⚠️  Could not determine tunnel URL"
    echo "   Start tunnel manually: lt --port 8000"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 TIP: The password is a random string shown on the localtunnel warning page"
echo "   It's different for each tunnel session"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

