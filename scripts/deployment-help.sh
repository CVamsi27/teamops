#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         TeamOps Deployment           ║${NC}"
echo -e "${CYAN}║           Quick Start               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🚀 Available Deployment Commands:${NC}"
echo ""

echo -e "${GREEN}📋 Setup & Help:${NC}"
echo "  npm run deploy:help          - Show detailed deployment guide"
echo "  npm run setup:all            - Setup all required services"
echo "  npm run setup:upstash        - Setup Upstash Redis & Kafka"
echo "  npm run setup:neon           - Setup Neon PostgreSQL"
echo ""

echo -e "${GREEN}🚀 Deployment Options:${NC}"
echo "  npm run deploy:free          - Interactive deployment wizard"
echo "  npm run deploy:vercel        - Deploy to Vercel (Recommended)"
echo "  npm run deploy:railway       - Deploy backend to Railway"
echo ""

echo -e "${GREEN}🧪 Testing Commands:${NC}"
echo "  npm run test:cache           - Test Redis cache functionality"
echo "  npm run test:notifications   - Test notification system"
echo "  npm run test:events          - Test event publishing"
echo "  npm run test:kafka           - Test Kafka message publishing"
echo "  npm run test:kafka:all       - Test all Kafka event types"
echo ""

echo -e "${GREEN}🔧 Development:${NC}"
echo "  npm run dev                  - Start development server"
echo "  npm run build               - Build for production"
echo "  npm run prisma:studio        - Open database admin"
echo ""

echo -e "${YELLOW}💡 Quick Deployment Steps:${NC}"
echo ""
echo "1. Copy environment template:"
echo "   ${CYAN}cp .env.example .env.local${NC}"
echo ""
echo "2. Setup free services (follow links):"
echo "   ${CYAN}npm run setup:all${NC}"
echo ""
echo "3. Configure your .env.local with actual credentials"
echo ""
echo "4. Test locally:"
echo "   ${CYAN}npm run dev${NC}"
echo ""
echo "5. Deploy:"
echo "   ${CYAN}npm run deploy:free${NC}"
echo ""

echo -e "${BLUE}📚 For detailed instructions, run:${NC}"
echo "   ${CYAN}cat docs/README.md${NC}"
echo "   ${CYAN}cat docs/DEPLOYMENT_STEPS.md${NC}"
echo ""

echo -e "${RED}⚠️  Prerequisites:${NC}"
echo "• Node.js 18+ installed"
echo "• Git repository access"
echo "• Free accounts: Vercel, Upstash, Neon"
echo ""

echo -e "${GREEN}🎯 Recommended for beginners: npm run deploy:free${NC}"