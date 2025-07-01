@echo off
echo ========================================
echo Starting Astro Annihilator Reborn...
echo ========================================
echo.

echo Current directory before change:
echo %CD%
echo.

echo Changing to script directory...
cd /d "%~dp0"
echo.

echo Current directory after change:
echo %CD%
echo.

echo Checking if Node.js is installed...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo.

echo Checking if npm is installed...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Dependencies installed successfully!
echo.

echo Starting development server...
echo The server will open in your browser at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm run dev

echo.
echo Server stopped.
pause 