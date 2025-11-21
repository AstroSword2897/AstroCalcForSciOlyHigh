@echo off
REM Simple batch script to create a distribution package of AstroCalc (Windows)

echo 📦 Creating AstroCalc Distribution Package...
echo.

set VERSION=2.1
set PACKAGE_NAME=AstroCalc-v%VERSION%
set CURRENT_DIR=%~dp0

echo 📁 Creating package structure...
if exist "%PACKAGE_NAME%" rmdir /s /q "%PACKAGE_NAME%"
mkdir "%PACKAGE_NAME%"

echo 📋 Copying files...
copy "index.html" "%PACKAGE_NAME%\" >nul
copy "README.md" "%PACKAGE_NAME%\" >nul
if exist "DOWNLOAD_INSTRUCTIONS.md" copy "DOWNLOAD_INSTRUCTIONS.md" "%PACKAGE_NAME%\" >nul

REM Copy scripts directory
if exist "scripts" (
    echo   Copying scripts/...
    xcopy /E /I /Y "scripts" "%PACKAGE_NAME%\scripts\" >nul
)

REM Copy styles directory
if exist "styles" (
    echo   Copying styles/...
    xcopy /E /I /Y "styles" "%PACKAGE_NAME%\styles\" >nul
)

REM Copy libs directory (for offline MathJax)
if exist "libs" (
    echo   Copying libs/ (offline dependencies)...
    xcopy /E /I /Y "libs" "%PACKAGE_NAME%\libs\" >nul
)

echo.
echo 🗜️  Creating ZIP archive...
powershell -Command "Compress-Archive -Path '%PACKAGE_NAME%' -DestinationPath '%PACKAGE_NAME%.zip' -Force"

REM Cleanup temporary directory
rmdir /s /q "%PACKAGE_NAME%"

echo.
echo ✅ Package created successfully!
echo 📦 File: %CURRENT_DIR%%PACKAGE_NAME%.zip
echo.
echo 📋 Package contents:
echo    - index.html
echo    - scripts/ (all files)
echo    - styles/ (all files)
echo    - libs/ (MathJax for offline use)
echo    - README.md
echo    - DOWNLOAD_INSTRUCTIONS.md
echo.
echo 🚀 Ready to share!
pause

