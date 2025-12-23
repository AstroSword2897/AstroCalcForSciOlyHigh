#!/bin/bash
# Run all calculator tests

echo "🧪 Running All Calculator Tests"
echo "================================"
echo ""

# Start server on port 8000
echo "Starting server on port 8000..."
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

echo "✅ Server started (PID: $SERVER_PID)"
echo ""
echo "📊 Test Interfaces Available:"
echo "  - Calculator Tests: http://localhost:8000/tests/run_production_tests.html"
echo "  - Concept Network: http://localhost:8000/tests/run_concept_network_tests.html"
echo "  - Graph Tests: http://localhost:8000/tests/test_graph_v2.html"
echo ""
echo "Press Ctrl+C to stop server"
echo ""

# Wait for user interrupt
trap "kill $SERVER_PID 2>/dev/null; exit" INT TERM
wait $SERVER_PID
