# GitHub Actions Workflows

This directory contains automated CI/CD workflows for TeamOps.

## 📁 Files Overview

### `deploy.yml` (Active)

- **Purpose**: Main CI/CD workflow
- **Triggers**: Push to main, Pull requests
- **Features**:
  - ✅ Automated testing and linting
  - ✅ Build verification
  - ✅ Security audit
  - ✅ Optional Vercel deployment (if secrets configured)
  - ✅ Manual deployment instructions

### `deploy-advanced.yml.example` (Template)

- **Purpose**: Advanced workflow with multiple deployment options
- **Features**:
  - ✅ Comprehensive testing with database
  - ✅ Vercel deployment
  - ✅ Render.com deployment option
  - ✅ Health checks
  - ✅ Security scanning
- **Setup**: Requires more secrets configuration

### `ACTIONS_SETUP.md`

- **Purpose**: Complete setup guide for GitHub Actions
- **Contains**: Step-by-step instructions for configuring secrets

## 🚀 Current Workflow (`deploy.yml`)

### What it does:

1. **Always runs** (no secrets required):
   - Install dependencies
   - Run linting
   - Build applications
   - Security audit

2. **Conditionally runs** (if Vercel secrets configured):
   - Deploy to Vercel automatically
   - Show success message

3. **Provides guidance** (if no Vercel secrets):
   - Shows manual deployment commands
   - Links to setup instructions

### Zero-Config Experience:

- Works immediately after cloning
- No secrets required for basic CI
- Provides clear next steps for deployment
- Lint warnings about secrets are normal until secrets are added

## 🔧 Setup Options

### Option 1: Minimal (Current Default)

- No setup required
- Manual deployments
- Perfect for getting started

### Option 2: Automated Deployment

- Add Vercel secrets (see `ACTIONS_SETUP.md`)
- Automatic deployments on push to main
- Production-ready CI/CD

### Option 3: Advanced (Use template)

- Copy `deploy-advanced.yml.example` to `deploy.yml`
- Configure all secrets
- Full enterprise CI/CD pipeline

## 🎯 Quick Start

### For immediate use:

```bash
# Current workflow works out of the box
git push origin main
# Check Actions tab in GitHub
```

### For automatic deployment:

1. Read `ACTIONS_SETUP.md`
2. Add required Vercel secrets
3. Push to main branch
4. Automatic deployment! 🚀

## 🛠️ Customization

### To modify the workflow:

1. Edit `.github/workflows/deploy.yml`
2. Test locally with `pnpm build` and `pnpm lint`
3. Commit and push to see changes

### To use advanced features:

1. Copy example: `cp deploy-advanced.yml.example deploy.yml`
2. Follow `ACTIONS_SETUP.md` for secret configuration
3. Customize as needed

The current setup prioritizes ease of use while providing a clear path to production-ready CI/CD!
