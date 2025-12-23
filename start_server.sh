#!/bin/bash
# Start HTTP server on port 8000 for AstroCalc

PORT=8000
PID_FILE="/tmp/astrocalc_server_${PORT}.pid"
LOG_FILE="/tmp/astrocalc_server_${PORT}.log"

# Kill existing server on port 8000
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Stopping existing server (PID: $OLD_PID)..."
        kill "$OLD_PID" 2>/dev/null
        sleep 1
    fi
fi

# Also check for any process on port 8000
lsof -ti:$PORT | xargs kill -9 2>/dev/null

# Start server
cd "$(dirname "$0")"
echo "🚀 Starting HTTP server on port $PORT..."
python3 -m http.server $PORT > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

sleep 2

# Check if server started
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "✅ Server started successfully!"
    echo "   PID: $SERVER_PID"
    echo "   Port: $PORT"
    echo "   Log: $LOG_FILE"
    echo ""
    echo "🌐 Calculator URLs:"
    echo "   Main: http://localhost:$PORT"
    echo "   Tests: http://localhost:$PORT/tests/run_production_tests.html"
    echo ""
    echo "To stop: kill $SERVER_PID"
    echo "Or run: ./stop_server.sh"
    
    # Try to open browser
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:$PORT"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:$PORT"
    fi
else
    echo "❌ Failed to start server"
    echo "Check log: $LOG_FILE"
    cat "$LOG_FILE"
    exit 1
fi
