@echo off
echo Starting Astro Annihilator Reborn...
echo.
cd /d "%~dp0"
echo Changed to directory: %CD%
echo.
echo Installing dependencies if needed...
npm install
echo.
echo Starting development server...
npm run dev
pause 