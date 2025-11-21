#!/bin/bash
# Simple script to create a distribution package of AstroCalc

echo "📦 Creating AstroCalc Distribution Package..."
echo ""

# Get the current directory name
DIR_NAME=$(basename "$PWD")
VERSION="2.1"
PACKAGE_NAME="AstroCalc-v${VERSION}"

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)
PACKAGE_DIR="${TEMP_DIR}/${PACKAGE_NAME}"

echo "📁 Creating package structure..."
mkdir -p "${PACKAGE_DIR}"

# Copy required files
echo "📋 Copying files..."
cp index.html "${PACKAGE_DIR}/"
cp README.md "${PACKAGE_DIR}/"
cp DOWNLOAD_INSTRUCTIONS.md "${PACKAGE_DIR}/" 2>/dev/null || echo "  (DOWNLOAD_INSTRUCTIONS.md not found, skipping)"

# Copy scripts directory
if [ -d "scripts" ]; then
    echo "  Copying scripts/..."
    cp -r scripts "${PACKAGE_DIR}/"
fi

# Copy styles directory
if [ -d "styles" ]; then
    echo "  Copying styles/..."
    cp -r styles "${PACKAGE_DIR}/"
fi

# Copy libs directory (for offline MathJax)
if [ -d "libs" ]; then
    echo "  Copying libs/ (offline dependencies)..."
    cp -r libs "${PACKAGE_DIR}/"
fi

# Create ZIP file
echo ""
echo "🗜️  Creating ZIP archive..."
cd "${TEMP_DIR}"
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}" > /dev/null

# Move ZIP to original directory
mv "${PACKAGE_NAME}.zip" "${OLDPWD}/"

# Cleanup
rm -rf "${TEMP_DIR}"

echo ""
echo "✅ Package created successfully!"
echo "📦 File: ${OLDPWD}/${PACKAGE_NAME}.zip"
echo ""
echo "📋 Package contents:"
echo "   - index.html"
echo "   - scripts/ (all files)"
echo "   - styles/ (all files)"
echo "   - libs/ (MathJax for offline use)"
echo "   - README.md"
echo "   - DOWNLOAD_INSTRUCTIONS.md"
echo ""
echo "🚀 Ready to share!"

