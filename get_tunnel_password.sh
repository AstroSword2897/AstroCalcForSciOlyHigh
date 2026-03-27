#!/bin/bash
# Get the tunnel password (which is your public IP address)

echo "🔑 Getting Tunnel Password..."
echo ""

# The password is your public IP address
PASSWORD=$(curl -s https://loca.lt/mytunnelpassword)

if [ -n "$PASSWORD" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ TUNNEL PASSWORD FOUND!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔑 Password: $PASSWORD"
    echo ""
    echo "📋 This is your public IP address"
    echo "   Share this password with users who want to access your calculator"
    echo ""
    
    # Get current tunnel URL
    TUNNEL_URL=$(ps aux | grep "lt --port 8000" | grep -v grep | head -1)
    if [ -n "$TUNNEL_URL" ]; then
        URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.loca\.lt' /tmp/tunnel_full_output.log 2>/dev/null | tail -1)
        if [ -z "$URL" ]; then
            URL="https://tough-crews-hear.loca.lt"  # Current tunnel
        fi
        echo "🌐 Tunnel URL: $URL"
        echo ""
        echo "📤 Share with users:"
        echo "   URL: $URL"
        echo "   Password: $PASSWORD"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "⚠️  Could not retrieve password"
    echo "   Try visiting: https://loca.lt/mytunnelpassword"
fi
