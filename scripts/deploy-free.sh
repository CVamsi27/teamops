#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 TeamOps Free Cloud Deployment Setup"
echo "======================================"

# Check if required tools are installed
if ! command -v vercel &> /dev/null; then
    log_info "Installing Vercel CLI..."
    npm install -g vercel
fi

if ! command -v railway &> /dev/null; then
    log_info "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Menu for deployment choice
echo ""
echo "Choose your deployment strategy:"
echo "1. Vercel + Railway (Frontend + Backend separation)"
echo "2. Render.com (100% Free)"
echo ""
read -p "Enter your choice (1-2): " choice

case $choice in
    1)
        log_info "Setting up Vercel + Railway deployment..."
        
        # Deploy backend to Railway
        log_info "Deploying backend to Railway..."
        railway login
        railway new teamops-api
        railway link
        
        # Set Railway environment variables
        log_info "Setting Railway environment variables..."
        railway variables set NODE_ENV=production
        railway variables set PORT=3001
        
        # Deploy backend
        railway up
        
        # Get Railway URL
        RAILWAY_URL=$(railway domain)
        log_info "Backend deployed to: $RAILWAY_URL"
        
        # Deploy frontend to Vercel
        log_info "Deploying frontend to Vercel..."
        cd apps/web
        vercel --prod
        cd ../..
        
        log_success "Split deployment completed!"
        ;;
        
    2)
        log_info "Setting up Render.com deployment..."
        
        log_info "Creating Render deployment configuration..."
        log_warning "Please:"
        log_warning "1. Create a Render account at https://render.com"
        log_warning "2. Connect your GitHub repository"
        log_warning "3. Use the render.yaml file for deployment"
        log_warning "4. Set up environment variables in Render dashboard"
        
        log_success "Render configuration created!"
        ;;
        
    *)
        log_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
log_success "Deployment setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up Neon PostgreSQL: https://neon.tech"
echo "2. Set up Upstash Redis: https://upstash.com"
echo "3. Set up Upstash Kafka: https://upstash.com"
echo "4. Configure environment variables"
echo "5. Test your deployment"
echo ""
echo "📚 Documentation:"
echo "• Vercel: https://vercel.com/docs"
echo "• Railway: https://docs.railway.app"
echo "• Render: https://render.com/docs"
echo "• Neon: https://neon.tech/docs"
echo "• Upstash: https://docs.upstash.com"
echo "• TeamOps Docs: ./docs/README.md"