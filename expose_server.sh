#!/bin/bash
# Expose the local AstroCalc static server to the internet.
# Usage: ./expose_server.sh [ngrok|localtunnel|cloudflared]
#
# Starts ./start_server.sh on port 8000 if needed, then opens a tunnel.
# Prefer cloudflared for a quick free URL with no signup.

set -euo pipefail

PORT=8000
METHOD=${1:-cloudflared}
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! lsof -ti:"$PORT" > /dev/null 2>&1; then
    echo "Server not running on port $PORT — starting..."
    ./start_server.sh
    sleep 2
fi

echo "Exposing http://localhost:$PORT via $METHOD"
echo "Press Ctrl+C to stop the tunnel."
echo ""

case "$METHOD" in
    ngrok)
        if ! command -v ngrok >/dev/null 2>&1; then
            echo "ngrok is not installed."
            echo "  macOS: brew install ngrok/ngrok/ngrok"
            echo "  Then:  ngrok config add-authtoken YOUR_AUTH_TOKEN"
            exit 1
        fi
        # Print any active tunnel password page if ngrok shows one in the browser UI.
        echo "Public URL appears in the ngrok terminal UI (and http://127.0.0.1:4040)."
        ngrok http "$PORT"
        ;;

    localtunnel)
        if ! command -v lt >/dev/null 2>&1; then
            echo "localtunnel is not installed. Install with: npm install -g localtunnel"
            exit 1
        fi
        lt --port "$PORT"
        ;;

    cloudflared)
        if ! command -v cloudflared >/dev/null 2>&1; then
            echo "cloudflared is not installed."
            echo "  macOS: brew install cloudflare/cloudflare/cloudflared"
            exit 1
        fi
        cloudflared tunnel --url "http://localhost:$PORT"
        ;;

    *)
        echo "Unknown method: $METHOD"
        echo "Usage: ./expose_server.sh [ngrok|localtunnel|cloudflared]"
        exit 1
        ;;
esac
