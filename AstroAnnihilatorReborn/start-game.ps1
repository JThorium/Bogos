Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Astro Annihilator Reborn..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Current directory before change:" -ForegroundColor Yellow
Write-Host (Get-Location).Path -ForegroundColor Gray
Write-Host ""

Write-Host "Changing to script directory..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
Write-Host ""

Write-Host "Current directory after change:" -ForegroundColor Yellow
Write-Host (Get-Location).Path -ForegroundColor Gray
Write-Host ""

Write-Host "Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "Checking if npm is installed..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "The server will open in your browser at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "Server stopped." -ForegroundColor Yellow
}

Read-Host "Press Enter to exit" 