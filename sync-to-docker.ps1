# Sync Changes to C:\Projects\aexy

# This script copies all updated files from OneDrive to C:\Projects\aexy

Write-Host "Syncing deployment files to C:\Projects\aexy..." -ForegroundColor Cyan

$source = "C:\Users\rahul\OneDrive\Desktop\Projects\aexy"
$dest = "C:\Projects\aexy"

# Files to copy
$files = @(
    "DEPLOYMENT.md",
    "README.md",
    "DEPLOYMENT_SUMMARY.md",
    "QUICK_DEPLOY.md",
    ".env.example",
    ".dockerignore",
    "deploy.sh",
    "deploy.ps1",
    "docker-compose.prod.yaml",
    "docker-compose.yaml",
    "backend\Dockerfile",
    "backend\railway.json",
    "backend\src\server.ts",
    "backend\src\services\websocketService.ts",
    "backend\package.json",
    "frontend\Dockerfile",
    "frontend\railway.json",
    ".github\workflows\ci-cd.yml"
)

foreach ($file in $files) {
    $srcFile = Join-Path $source $file
    $destFile = Join-Path $dest $file
    
    if (Test-Path $srcFile) {
        $destDir = Split-Path $destFile -Parent
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item -Path $srcFile -Destination $destFile -Force
        Write-Host "✓ Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✓ Sync complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd C:\Projects\aexy"
Write-Host "2. Review changes: git status"
Write-Host "3. Commit: git add . && git commit -m 'Prepare for deployment'"
Write-Host "4. Push: git push origin main"
Write-Host "5. Deploy using .\deploy.ps1"
