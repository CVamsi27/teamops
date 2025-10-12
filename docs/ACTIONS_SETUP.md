# GitHub Actions Setup Guide

## Required Secrets Configuration

To enable automated deployments with GitHub Actions, you need to configure the following secrets in your GitHub repository.

⚠️ **Note**: You may see lint warnings about "Context access might be invalid" for secrets in the workflow file. These warnings are normal and will disappear once you add the secrets to your repository.

### How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## 🚀 Vercel Deployment Secrets

### Required for Vercel Deployment:

#### `VERCEL_TOKEN`
- **Description**: Personal Access Token for Vercel CLI
- **How to get**: 
  1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
  2. Create new token
  3. Copy the token value

#### `VERCEL_ORG_ID`
- **Description**: Your Vercel organization/team ID
- **How to get**:
  ```bash
  # Install Vercel CLI locally
  npm install -g vercel
  
  # Login and link project
  vercel login
  cd apps/web
  vercel link
  
  # Get org ID from .vercel/project.json
  cat .vercel/project.json
  ```

#### `VERCEL_PROJECT_ID`
- **Description**: Your Vercel project ID
- **How to get**: Same as above, found in `.vercel/project.json`

#### `VERCEL_TEAM_ID` (Optional)
- **Description**: Team ID if deploying to a team account
- **How to get**: Same as above, or from Vercel dashboard URL

---

## 🔄 Alternative: Render.com Deployment Secrets

### Required for Render Deployment:

#### `RENDER_SERVICE_ID`
- **Description**: Service ID from Render dashboard
- **How to get**:
  1. Create service on [Render.com](https://render.com)
  2. Copy service ID from URL or dashboard

#### `RENDER_API_KEY`
- **Description**: API key for Render deployments
- **How to get**:
  1. Go to [Render Account Settings](https://dashboard.render.com/account)
  2. Generate new API key

---

## 🔍 Optional Secrets

#### `DEPLOYMENT_URL`
- **Description**: Your production deployment URL for health checks
- **Default**: `https://teamops.vercel.app`
- **Example**: `https://your-app.vercel.app`

---

## 🚦 Environment Setup

The workflow will automatically:

✅ **Run tests and linting** on every push and PR
✅ **Deploy to production** on pushes to main branch
✅ **Run security audits** on dependencies
✅ **Perform health checks** after deployment

### Manual Deployment (if CI/CD not needed)

If you prefer manual deployments, you can disable the workflow by:

1. Renaming the file: `.github/workflows/deploy.yml.disabled`
2. Or deleting the file entirely
3. Use manual commands: `npm run deploy:vercel`

---

## 🛠️ Local Testing

Test your workflow configuration locally:

```bash
# Test build process
pnpm install
pnpm lint
pnpm build

# Test deployment
npm run deploy:vercel

# Test health checks
curl https://your-app.vercel.app
curl https://your-app.vercel.app/api/health
```

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. **Vercel Token Invalid**
```
Error: Invalid token
```
**Solution**: Regenerate token in Vercel dashboard

#### 2. **Project Not Linked**
```
Error: Project not found
```
**Solution**: Run `vercel link` in `apps/web` directory

#### 3. **Build Failures**
```
Error: Build failed
```
**Solution**: Test build locally with `pnpm build`

#### 4. **Missing Secrets**
```
Error: Secret not found
```
**Solution**: Add all required secrets in GitHub repository settings

---

## 🎯 Minimal Setup (Optional)

If you want a simpler workflow without all secrets, create this minimal version:

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
        with:
          version: '10'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
```

This minimal version only runs tests and builds, without automated deployment.