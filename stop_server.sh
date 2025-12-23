#!/bin/bash
# Stop HTTP server on port 8000

PORT=8000
PID_FILE="/tmp/astrocalc_server_${PORT}.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Stopping server (PID: $PID)..."
        kill "$PID" 2>/dev/null
        sleep 1
        if ps -p "$PID" > /dev/null 2>&1; then
            kill -9 "$PID" 2>/dev/null
        fi
        echo "✅ Server stopped"
    else
        echo "Server not running"
    fi
    rm -f "$PID_FILE"
else
    echo "PID file not found"
fi

# Also kill any process on port 8000
lsof -ti:$PORT | xargs kill -9 2>/dev/null
