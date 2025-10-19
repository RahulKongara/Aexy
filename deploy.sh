#!/bin/bash

# Aexy Deployment Helper Script

echo "🚀 Aexy Deployment Helper"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Creating .env from .env.example..."
    cp .env.example .env
    print_info "Please edit .env file with your actual values"
    exit 1
fi

# Menu
echo "Select deployment option:"
echo "1. Build and test locally with Docker"
echo "2. Deploy to Railway"
echo "3. Deploy to Render"
echo "4. Build production images"
echo "5. Run database migrations"
echo "6. Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        print_info "Building and starting with Docker Compose..."
        docker-compose up --build
        ;;
    2)
        print_info "Deploying to Railway..."
        if ! command -v railway &> /dev/null; then
            print_error "Railway CLI not installed"
            print_info "Install with: npm i -g @railway/cli"
            exit 1
        fi
        print_info "Make sure you're logged in: railway login"
        railway up
        print_success "Deployed to Railway!"
        ;;
    3)
        print_info "Deploying to Render..."
        print_info "Please follow these steps:"
        echo "1. Go to https://render.com"
        echo "2. Create new Web Service"
        echo "3. Connect your GitHub repository"
        echo "4. Configure environment variables"
        print_success "Visit https://render.com to complete deployment"
        ;;
    4)
        print_info "Building production Docker images..."
        docker build -t aexy-backend:prod ./backend
        docker build -t aexy-frontend:prod ./frontend
        print_success "Production images built!"
        ;;
    5)
        print_info "Running database migrations..."
        cd backend
        npx prisma migrate deploy
        cd ..
        print_success "Migrations completed!"
        ;;
    6)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

print_success "Done!"
