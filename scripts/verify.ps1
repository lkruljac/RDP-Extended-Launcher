# Verify Tauri Project Setup
# Run this to check if everything is configured correctly.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tauri Project Verification            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the app directory relative to this script
$appDir = Join-Path $PSScriptRoot "..\app"
Set-Location $appDir

$errors = @()

# Confirm we landed in the right place
if (-not (Test-Path "src-tauri/Cargo.toml")) {
    Write-Host "❌ Error: app/src-tauri/Cargo.toml not found. Check repository structure." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directory structure verified" -ForegroundColor Green

# Check Rust files exist
$rustFiles = @(
    "src-tauri/src/main.rs",
    "src-tauri/src/commands.rs",
    "src-tauri/src/monitor.rs",
    "src-tauri/src/rdp.rs",
    "src-tauri/src/models.rs"
)

Write-Host ""
Write-Host "Checking Rust backend files..." -ForegroundColor Yellow
foreach ($file in $rustFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
        $errors += $file
    }
}

# Check frontend files exist
$frontendFiles = @(
    "src/App.tsx",
    "src/TitleBar.tsx",
    "src/api.ts",
    "src/profileStore.ts",
    "src/types.ts",
    "src/main.tsx",
    "index.html"
)

Write-Host ""
Write-Host "Checking React frontend files..." -ForegroundColor Yellow
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
        $errors += $file
    }
}

# Check config files
$configFiles = @(
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "src-tauri/tauri.conf.json",
    "src-tauri/Cargo.toml"
)

Write-Host ""
Write-Host "Checking configuration files..." -ForegroundColor Yellow
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
        $errors += $file
    }
}

# Check if node_modules exists
Write-Host ""
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed (node_modules exists)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencies not installed yet" -ForegroundColor Yellow
    Write-Host "   Run: npm install" -ForegroundColor White
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verification Complete                  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "✅ All files present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to run:" -ForegroundColor White
    Write-Host "  npm install     # If not done yet" -ForegroundColor Cyan
    Write-Host "  npm run tauri dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ Found $($errors.Count) issue(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Missing files:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host ""
