# RDP Extended - Setup Script
# Run this from anywhere; it will automatically find the app directory.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RDP Extended - Setup                  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the app directory relative to this script
$appDir = Join-Path $PSScriptRoot "..\app"
Set-Location $appDir

Write-Host "✅ Working in: $appDir" -ForegroundColor Green
Write-Host ""
Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install from: https://nodejs.org/" -ForegroundColor Yellow
    $needsInstall = $true
}

# Check Rust
Write-Host "2. Checking Rust..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version
    Write-Host "   ✅ Rust found: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Rust not found!" -ForegroundColor Red
    Write-Host "   Please install from: https://rustup.rs/" -ForegroundColor Yellow
    $needsInstall = $true
}

Write-Host ""

if ($needsInstall) {
    Write-Host "❌ Missing prerequisites. Please install the required tools and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installing Dependencies...            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install npm dependencies
Write-Host "Installing Node.js packages (this may take a few minutes)..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!                       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Start development server:" -ForegroundColor White
Write-Host "     npm run tauri dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Build production release:" -ForegroundColor White
Write-Host "     npm run tauri build" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Output will be in:" -ForegroundColor White
Write-Host "     src-tauri\target\release\rdp-extended.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Note: First Rust compilation takes 5-10 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 See docs/ in the repo root for detailed documentation" -ForegroundColor White
Write-Host ""
