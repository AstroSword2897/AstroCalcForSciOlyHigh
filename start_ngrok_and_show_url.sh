#!/bin/bash
# Start ngrok and show the URL immediately

PORT=8000
USERNAME=${1:-"admin"}
PASSWORD=${2:-"calculator2024"}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Starting ngrok tunnel with password protection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Access Details:"
echo "   Username: $USERNAME"
echo "   Password: $PASSWORD"
echo ""

# Check if server is running
if ! lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Starting server on port $PORT..."
    ./start_server.sh
    sleep 2
fi

# Start ngrok in background
echo "🌐 Starting ngrok..."
ngrok http $PORT --basic-auth="$USERNAME:$PASSWORD" > /tmp/ngrok_output.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 5

# Get the public URL from ngrok API
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

if [ -n "$PUBLIC_URL" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ TUNNEL ACTIVE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Public URL: $PUBLIC_URL"
    echo ""
    echo "📋 Share with users:"
    echo "   URL: $PUBLIC_URL"
    echo "   Username: $USERNAME"
    echo "   Password: $PASSWORD"
    echo ""
    echo "🛑 To stop: kill $NGROK_PID"
    echo "   Or run: pkill -f 'ngrok http'"
    echo ""
    echo "📊 View traffic: http://localhost:4040"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "⚠️  Tunnel starting... Checking status..."
    sleep 3
    PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)
    
    if [ -n "$PUBLIC_URL" ]; then
        echo "✅ Public URL: $PUBLIC_URL"
        echo "   Username: $USERNAME"
        echo "   Password: $PASSWORD"
    else
        echo "❌ Could not get URL. Check ngrok output:"
        echo "   tail -f /tmp/ngrok_output.log"
        echo ""
        echo "Or view ngrok web interface: http://localhost:4040"
    fi
fi

