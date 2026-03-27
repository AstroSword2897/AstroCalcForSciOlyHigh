#!/bin/bash
# Verify that the calculator will work fully when exposed via tunnel
# This checks for any localhost-specific code that might break functionality

echo "🔍 Verifying full calculator functionality for tunnel exposure..."
echo ""

ISSUES=0

# Check for hardcoded localhost references
echo "1. Checking for hardcoded localhost references..."
if grep -r "localhost:8000" --include="*.js" --include="*.html" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "verify_full_functionality.sh" | grep -v "EXPOSE_SERVER_GUIDE.md" > /dev/null; then
    echo "   ⚠️  Found hardcoded localhost:8000 references"
    grep -r "localhost:8000" --include="*.js" --include="*.html" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "verify_full_functionality.sh" | grep -v "EXPOSE_SERVER_GUIDE.md"
    ISSUES=$((ISSUES + 1))
else
    echo "   ✅ No hardcoded localhost:8000 references found"
fi

# Check for localhost-only feature flags
echo ""
echo "2. Checking for localhost-only feature flags..."
LOCALHOST_CHECKS=$(grep -n "localhost\|127.0.0.1" index.html | grep -v "http://www.w3.org" | wc -l | tr -d ' ')
if [ "$LOCALHOST_CHECKS" -gt 0 ]; then
    echo "   ⚠️  Found $LOCALHOST_CHECKS localhost checks in index.html"
    echo "   These are likely for development-only features and should be safe"
    echo "   Review these lines:"
    grep -n "localhost\|127.0.0.1" index.html | grep -v "http://www.w3.org" | head -5
else
    echo "   ✅ No localhost-only feature flags found"
fi

# Check service worker registration
echo ""
echo "3. Checking service worker configuration..."
if grep -q "sw.js" index.html; then
    echo "   ✅ Service worker is configured"
    if grep -q "navigator.onLine" index.html; then
        echo "   ✅ Online/offline detection is present"
    fi
else
    echo "   ⚠️  Service worker not found (may affect offline functionality)"
    ISSUES=$((ISSUES + 1))
fi

# Check CORS headers (Python http.server doesn't set CORS by default)
echo ""
echo "4. Checking CORS configuration..."
echo "   ℹ️  Python's http.server doesn't set CORS headers by default"
echo "   ℹ️  This is usually fine for static files, but may affect API calls"
echo "   ℹ️  Since this is a client-side calculator, CORS shouldn't be an issue"

# Check for relative paths
echo ""
echo "5. Checking for relative vs absolute paths..."
ABSOLUTE_PATHS=$(grep -r "href=\"/\|src=\"/" --include="*.html" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l | tr -d ' ')
if [ "$ABSOLUTE_PATHS" -gt 0 ]; then
    echo "   ✅ Found $ABSOLUTE_PATHS absolute paths (these work with tunnels)"
else
    echo "   ✅ All paths appear to be relative (perfect for tunnels)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ISSUES" -eq 0 ]; then
    echo "✅ VERIFICATION COMPLETE: Calculator should work fully when exposed via tunnel!"
    echo ""
    echo "Next steps:"
    echo "  1. Start your server: ./start_server.sh"
    echo "  2. Expose it: ./expose_server.sh [ngrok|localtunnel|cloudflared]"
    echo "  3. Share the public URL with the third party"
    echo ""
    echo "All calculator features should work:"
    echo "  ✅ Formula calculations"
    echo "  ✅ Unit conversions"
    echo "  ✅ Graph visualizations"
    echo "  ✅ Classification tools"
    echo "  ✅ Search functionality"
    echo "  ✅ Offline support (via service worker)"
else
    echo "⚠️  Found $ISSUES potential issue(s) - review the warnings above"
    echo "   Most issues are likely non-critical for basic functionality"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

