# Aexy Deployment Helper Script (PowerShell)

Write-Host "🚀 Aexy Deployment Helper" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "ℹ Creating .env from .env.example..." -ForegroundColor Blue
    Copy-Item .env.example .env
    Write-Host "ℹ Please edit .env file with your actual values" -ForegroundColor Blue
    exit 1
}

# Menu
Write-Host "Select deployment option:" -ForegroundColor Yellow
Write-Host "1. Build and test locally with Docker"
Write-Host "2. Deploy to Railway"
Write-Host "3. Deploy to Render"
Write-Host "4. Build production images"
Write-Host "5. Run database migrations"
Write-Host "6. Generate JWT Secret"
Write-Host "7. Exit"
Write-Host ""
$choice = Read-Host "Enter your choice (1-7)"

switch ($choice) {
    1 {
        Write-Host "ℹ Building and starting with Docker Compose..." -ForegroundColor Blue
        docker-compose up --build
    }
    2 {
        Write-Host "ℹ Deploying to Railway..." -ForegroundColor Blue
        if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
            Write-Host "✗ Railway CLI not installed" -ForegroundColor Red
            Write-Host "ℹ Install with: npm i -g @railway/cli" -ForegroundColor Blue
            exit 1
        }
        Write-Host "ℹ Make sure you're logged in: railway login" -ForegroundColor Blue
        railway up
        Write-Host "✓ Deployed to Railway!" -ForegroundColor Green
    }
    3 {
        Write-Host "ℹ Deploying to Render..." -ForegroundColor Blue
        Write-Host "Please follow these steps:" -ForegroundColor Yellow
        Write-Host "1. Go to https://render.com"
        Write-Host "2. Create new Web Service"
        Write-Host "3. Connect your GitHub repository"
        Write-Host "4. Configure environment variables"
        Write-Host "✓ Visit https://render.com to complete deployment" -ForegroundColor Green
    }
    4 {
        Write-Host "ℹ Building production Docker images..." -ForegroundColor Blue
        docker build -t aexy-backend:prod ./backend
        docker build -t aexy-frontend:prod ./frontend
        Write-Host "✓ Production images built!" -ForegroundColor Green
    }
    5 {
        Write-Host "ℹ Running database migrations..." -ForegroundColor Blue
        Set-Location backend
        npx prisma migrate deploy
        Set-Location ..
        Write-Host "✓ Migrations completed!" -ForegroundColor Green
    }
    6 {
        Write-Host "ℹ Generating JWT Secret..." -ForegroundColor Blue
        $bytes = New-Object byte[] 32
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $rng.GetBytes($bytes)
        $secret = [Convert]::ToBase64String($bytes)
        Write-Host ""
        Write-Host "Your JWT Secret:" -ForegroundColor Yellow
        Write-Host $secret -ForegroundColor Green
        Write-Host ""
        Write-Host "Add this to your .env file as JWT_SECRET=$secret" -ForegroundColor Blue
    }
    7 {
        Write-Host "ℹ Exiting..." -ForegroundColor Blue
        exit 0
    }
    default {
        Write-Host "✗ Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✓ Done!" -ForegroundColor Green
