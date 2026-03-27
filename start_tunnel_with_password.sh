#!/bin/bash
# Start tunnel with password protection

PORT=8000
PASSWORD=${1:-""}

if [ -z "$PASSWORD" ]; then
    echo "🔒 To add password protection, provide a password:"
    echo "   ./start_tunnel_with_password.sh YOUR_PASSWORD"
    echo ""
    echo "Current tunnel (no password):"
    echo "   URL: https://eleven-women-look.loca.lt"
    echo ""
    echo "⚠️  Note: Localtunnel doesn't support password protection directly."
    echo "   For password protection, use ngrok instead."
    exit 1
fi

echo "⚠️  Localtunnel doesn't support password protection."
echo ""
echo "For password protection, use ngrok:"
echo "  1. Install: brew install ngrok/ngrok/ngrok"
echo "  2. Sign up: https://dashboard.ngrok.com"
echo "  3. Configure: ngrok config add-authtoken YOUR_TOKEN"
echo "  4. Run: ngrok http 8000 --basic-auth='username:$PASSWORD'"
echo ""
echo "Current tunnel (no password, open access):"
echo "   URL: https://eleven-women-look.loca.lt"

