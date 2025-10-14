# GitHub Actions Deployment Workflows

This document explains the different deployment workflows available for TeamOps and how to configure them.

## 📁 Available Workflows

### 1. `deploy.yml` - **Main Workflow (Default)**

- **Purpose**: Basic CI/CD with build, test, and deployment status
- **Best for**: General development and Render auto-deployment
- **Triggers**: Push to `main`, Pull Requests
- **Actions**:
  - ✅ Runs tests and linting
  - ✅ Builds applications
  - ✅ Shows deployment status and instructions
  - ✅ Works with Render's automatic deployment via `render.yaml`

### 2. `deploy-render.yml` - **Render Deployment**

- **Purpose**: Full Render deployment with health checks
- **Best for**: Automated Render deployments with monitoring
- **Triggers**: Push to `main`, Pull Requests
- **Actions**:
  - ✅ Complete CI/CD pipeline
  - ✅ Triggers Render deployment via API
  - ✅ Health checks for API and Web services
  - ✅ Deployment notifications

### 3. `deploy-vercel-railway.yml` - **Split Deployment**

- **Purpose**: Deploy web to Vercel, API to Railway
- **Best for**: Separating frontend and backend deployments
- **Triggers**: Push to `main`, Pull Requests
- **Actions**:
  - ✅ Deploys web app to Vercel
  - ✅ Deploys API to Railway
  - ✅ Integration testing
  - ✅ Health checks for both services

---

## 🚀 Deployment Strategies

### **Strategy 1: Render (Recommended for Free Tier)**

**Pros:**

- ✅ Single platform for both web and API
- ✅ Zero configuration deployment
- ✅ Free tier includes both services
- ✅ Automatic HTTPS and custom domains
- ✅ Built-in health checks

**Setup:**

1. Use `deploy.yml` or `deploy-render.yml`
2. Connect GitHub repo to Render
3. Render auto-deploys using `render.yaml`

```bash
# No additional setup required
# Render detects render.yaml automatically
```

### **Strategy 2: Vercel + Railway (Best Performance)**

**Pros:**

- ✅ Vercel: Excellent for Next.js (Edge Network)
- ✅ Railway: Great for APIs (Fast deployment)
- ✅ Independent scaling
- ✅ Better geographic distribution

**Setup:**

1. Use `deploy-vercel-railway.yml`
2. Configure secrets (see below)

```bash
# Vercel secrets
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_TEAM_ID (optional)

# Railway secrets
RAILWAY_TOKEN
RAILWAY_SERVICE_NAME (optional)
```

---

## 🔧 Configuration

### **Repository Secrets**

Add these in **Settings → Secrets and variables → Actions**:

#### **For Render Deployment:**

```bash
# Optional - for API-triggered deployments
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID=your_render_service_id
```

#### **For Vercel Deployment:**

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
VERCEL_TEAM_ID=your_team_id  # Optional
```

#### **For Railway Deployment:**

```bash
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_NAME=teamops-api  # Optional
```

### **Repository Variables**

Add these in **Settings → Secrets and variables → Actions → Variables**:

```bash
# Render URLs
RENDER_API_URL=https://teamops-api.onrender.com
RENDER_WEB_URL=https://teamops-web.onrender.com

# Vercel + Railway URLs
VERCEL_WEB_URL=https://teamops.vercel.app
RAILWAY_API_URL=https://teamops-api.up.railway.app

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

---

## 🎯 Choosing the Right Workflow

### **Use `deploy.yml` if:**

- ✅ You want simple CI/CD
- ✅ Using Render's automatic deployment
- ✅ Don't need advanced health checks
- ✅ Prefer minimal configuration

### **Use `deploy-render.yml` if:**

- ✅ Want full Render automation
- ✅ Need health checks and monitoring
- ✅ Want API-triggered deployments
- ✅ Need deployment notifications

### **Use `deploy-vercel-railway.yml` if:**

- ✅ Want best performance (Vercel Edge)
- ✅ Need independent service scaling
- ✅ Want to separate frontend/backend deployments
- ✅ Have budget for premium features

---

## 🛠️ Manual Deployment Commands

If workflows fail or you need manual deployment:

```bash
# Render (via render.yaml)
git push origin main  # Auto-deploys

# Vercel
cd apps/web && vercel --prod

# Railway
cd apps/api && railway up

# All platforms
npm run deploy:free  # Interactive wizard
```

---

## 🔍 Monitoring Deployments

### **Render:**

- Dashboard: https://dashboard.render.com
- Logs: Available in Render dashboard
- Health: `https://your-service.onrender.com/api/health`

### **Vercel:**

- Dashboard: https://vercel.com/dashboard
- Deployments: Shows in GitHub Actions and Vercel
- Analytics: Available in Vercel dashboard

### **Railway:**

- Dashboard: https://railway.app/dashboard
- Logs: Real-time in Railway dashboard
- Metrics: Built-in monitoring

---

## 🐛 Troubleshooting

### **Build Failures:**

1. Check lint errors: `pnpm lint`
2. Check TypeScript: `pnpm build`
3. Update dependencies: `pnpm update`

### **Deployment Failures:**

1. Verify environment variables
2. Check service logs in platform dashboard
3. Ensure secrets are correctly set
4. Try manual deployment first

### **Health Check Failures:**

1. Services might be starting up (wait 60s)
2. Check if endpoints exist: `/api/health`
3. Verify environment variables in deployment
4. Check CORS settings for cross-origin requests

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TeamOps Deployment Guide](./DEPLOYMENT_STEPS.md)

---

## 🔄 Workflow Updates

To switch between workflows:

1. **Disable current workflow:**

   ```bash
   # Rename to disable
   mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
   ```

2. **Enable new workflow:**

   ```bash
   # Copy and rename desired workflow
   cp .github/workflows/deploy-render.yml .github/workflows/deploy.yml
   ```

3. **Configure secrets** as needed for the new workflow

4. **Test** with a push to main branch

This flexible setup allows you to choose the deployment strategy that best fits your needs! 🚀
