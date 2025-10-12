#!/bin/bash

# Vercel Deployment Script for TeamOps
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    print_success "Vercel CLI is available"
}

# Install required packages for Vercel deployment
install_vercel_packages() {
    print_status "Installing Vercel packages..."
    
    cd apps/web
    
    # Check if packages are already installed
    if ! npm list @vercel/postgres &> /dev/null; then
        npm install @vercel/postgres
    fi
    
    if ! npm list @vercel/kv &> /dev/null; then
        npm install @vercel/kv
    fi
    
    if ! npm list @vercel/blob &> /dev/null; then
        npm install @vercel/blob
    fi
    
    if ! npm list jose &> /dev/null; then
        npm install jose
    fi
    
    if ! npm list bcryptjs &> /dev/null; then
        npm install bcryptjs
    fi
    
    if ! npm list @types/bcryptjs &> /dev/null; then
        npm install -D @types/bcryptjs
    fi
    
    cd ../..
    print_success "Vercel packages installed"
}

# Setup Vercel project
setup_vercel_project() {
    print_status "Setting up Vercel project..."
    
    cd apps/web
    
    if [ ! -f ".vercel/project.json" ]; then
        print_status "Linking to Vercel project..."
        vercel link
    else
        print_success "Already linked to Vercel project"
    fi
    
    cd ../..
}

# Create Vercel databases
setup_vercel_databases() {
    print_status "Setting up Vercel databases..."
    
    cd apps/web
    
    # Create Postgres database
    print_status "Creating Vercel Postgres database..."
    vercel postgres create teamops-db || print_warning "Postgres database might already exist"
    
    # Create KV store
    print_status "Creating Vercel KV store..."
    vercel kv create teamops-cache || print_warning "KV store might already exist"
    
    # Create Blob storage
    print_status "Creating Vercel Blob storage..."
    vercel blob create teamops-storage || print_warning "Blob storage might already exist"
    
    cd ../..
    print_success "Vercel databases configured"
}

# Set environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    cd apps/web
    
    # Set JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    vercel env add JWT_SECRET production <<< "$JWT_SECRET"
    vercel env add JWT_SECRET preview <<< "$JWT_SECRET"
    vercel env add JWT_SECRET development <<< "$JWT_SECRET"
    
    print_success "Environment variables configured"
    print_warning "Make sure to link your Postgres, KV, and Blob storage in Vercel dashboard"
    
    cd ../..
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    cd apps/web
    
    # Deploy to production
    vercel --prod
    
    print_success "Deployment completed!"
    
    cd ../..
}

# Run database migrations (if needed)
run_migrations() {
    print_status "Database migrations..."
    print_warning "You'll need to run migrations manually once your database is connected"
    print_warning "Use: npx prisma migrate deploy"
}

# Show post-deployment steps
show_post_deployment() {
    print_success "🚀 TeamOps deployed to Vercel!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to your Vercel dashboard"
    echo "2. Link your Postgres database to the project"
    echo "3. Link your KV store to the project" 
    echo "4. Link your Blob storage to the project"
    echo "5. Run database migrations: npx prisma migrate deploy"
    echo "6. Test your application"
    echo ""
    echo "🔗 Useful links:"
    echo "• Vercel Dashboard: https://vercel.com/dashboard"
    echo "• Postgres: https://vercel.com/dashboard/stores/postgres"
    echo "• KV: https://vercel.com/dashboard/stores/kv"
    echo "• Blob: https://vercel.com/dashboard/stores/blob"
}

# Main execution
main() {
    print_status "🚀 Starting Vercel deployment for TeamOps..."
    
    check_vercel_cli
    install_vercel_packages
    setup_vercel_project
    setup_vercel_databases
    setup_environment
    deploy_to_vercel
    run_migrations
    show_post_deployment
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --setup-only)
            SETUP_ONLY=true
            shift
            ;;
        --deploy-only)
            DEPLOY_ONLY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--setup-only] [--deploy-only]"
            echo "Deploy TeamOps to Vercel with full-stack setup"
            echo ""
            echo "Options:"
            echo "  --setup-only    Only setup databases and environment"
            echo "  --deploy-only   Only deploy (skip setup)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [ "$SETUP_ONLY" = true ]; then
    print_status "Running setup only..."
    check_vercel_cli
    install_vercel_packages
    setup_vercel_project
    setup_vercel_databases
    setup_environment
    show_post_deployment
elif [ "$DEPLOY_ONLY" = true ]; then
    print_status "Running deployment only..."
    check_vercel_cli
    deploy_to_vercel
else
    main
fi