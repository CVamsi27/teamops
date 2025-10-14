# 🚀 TeamOps Deployment Guide

This guide provides step-by-step instructions for deploying TeamOps using free cloud services.

## 📋 Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ installed
- [x] Git repository access
- [x] Terminal/Command line access

## 🎯 Choose Your Deployment Strategy

### Option 1: Vercel Only (Recommended for MVP)

**Best for**: Quick deployment, simple setup, $0 cost
**Architecture**: Next.js with API routes

### Option 2: Vercel + Railway (Backend Separation)

**Best for**: Microservices, traditional separation
**Architecture**: Next.js frontend + NestJS backend

### Option 3: Render.com (100% Free Forever)

**Best for**: Long-term free hosting
**Architecture**: Full-stack on Render

---

## 🚀 Option 1: Vercel Only Deployment

### Step 1: Prepare Your Environment

```bash
# Clone and setup project
git clone https://github.com/CVamsi27/teamops.git
cd teamops
npm install

# Copy environment template
cp .env.example .env.local
```

### Step 2: Set Up Free Services

#### 2a. Neon Database (Already Done ✅)

Skip this step since you mentioned Neon is already set up.

#### 2b. Upstash Redis

1. Visit [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create Redis Database:
   - Click "Create Database"
   - Choose region closest to your users
   - Select "Free" plan (10K requests/day)
   - Name: `teamops-cache`
4. Copy credentials to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

#### 2c. Upstash Kafka

1. In Upstash Console, go to Kafka section
2. Create Kafka Cluster:
   - Click "Create Cluster"
   - Choose same region as Redis
   - Select "Free" plan (10K messages/day)
   - Name: `teamops-events`
3. Create Topics:
   - `notifications`
   - `task-events`
   - `project-events`
4. Copy credentials to `.env.local`:
   ```bash
   UPSTASH_KAFKA_REST_URL=https://xxx.upstash.io
   UPSTASH_KAFKA_REST_TOKEN=your-token
   ```

### Step 3: Configure Environment Variables

Edit `.env.local` with your actual values:

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/db"

# Cache (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Message Queue (Upstash Kafka)
UPSTASH_KAFKA_REST_URL="https://xxx.upstash.io"
UPSTASH_KAFKA_REST_TOKEN="your-kafka-token"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Application
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Optional: Google Calendar
GOOGLE_CALENDAR_CLIENT_ID="your-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-client-secret"
```

### Step 4: Test Locally

```bash
# Start development server
npm run dev

# Test in another terminal
npm run test:cache
npm run test:notifications

# Verify at http://localhost:3000
```

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
npm run deploy:vercel

# Follow prompts:
# 1. "Set up and deploy?" → Yes
# 2. "Which scope?" → Your account
# 3. "Link to existing project?" → No
# 4. "Project name?" → teamops
# 5. "Directory?" → apps/web
```

### Step 6: Configure Production Environment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project → Settings → Environment Variables
3. Add all variables from `.env.local`:
   - `DATABASE_URL`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `UPSTASH_KAFKA_REST_URL`
   - `UPSTASH_KAFKA_REST_TOKEN`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_API_URL` (set to your Vercel URL)

### Step 7: Redeploy with Environment Variables

```bash
# Redeploy to apply environment variables
vercel --prod
```

### ✅ Verification

- [ ] Visit your Vercel URL
- [ ] Test user registration/login
- [ ] Create a team/project
- [ ] Check notifications work
- [ ] Verify cache is working

---

## 🚀 Option 2: Vercel + Railway Deployment

### Step 1: Prepare Backend for Railway

```bash
# Ensure Railway CLI is installed
npm install -g @railway/cli

# Login to Railway
railway login
```

### Step 2: Deploy Backend to Railway

```bash
# Create new Railway project
railway new teamops-api

# Link to project
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DATABASE_URL="your-neon-url"
railway variables set UPSTASH_REDIS_REST_URL="your-redis-url"
railway variables set UPSTASH_REDIS_REST_TOKEN="your-redis-token"
railway variables set UPSTASH_KAFKA_REST_URL="your-kafka-url"
railway variables set UPSTASH_KAFKA_REST_TOKEN="your-kafka-token"
railway variables set JWT_SECRET="your-jwt-secret"

# Deploy backend
npm run deploy:railway
```

### Step 3: Deploy Frontend to Vercel

```bash
# Get your Railway backend URL
railway domain

# Update .env.local
NEXT_PUBLIC_API_URL="https://your-backend.railway.app"

# Deploy frontend
npm run deploy:vercel
```

### Step 4: Configure Cross-Origin

Update Vercel environment variables:

- `NEXT_PUBLIC_API_URL` → Your Railway backend URL

---

## 🚀 Option 3: Render.com Deployment

### Step 1: Automated Setup

```bash
# Run interactive deployment wizard
npm run deploy:free

# Choose option 3 (Render.com)
```

### Step 2: Manual Render Setup

1. Visit [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository
4. Create Web Service:
   - **Name**: `teamops`
   - **Build Command**: `cd apps/web && npm install && npm run build`
   - **Start Command**: `cd apps/web && npm start`
   - **Environment**: Node

### Step 3: Configure Environment Variables

In Render Dashboard → Your Service → Environment:

```bash
NODE_ENV=production
DATABASE_URL=your-neon-url
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
UPSTASH_KAFKA_REST_URL=your-kafka-url
UPSTASH_KAFKA_REST_TOKEN=your-kafka-token
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

### Step 4: Deploy

Render will automatically deploy when you push to your main branch.

---

## 🔧 Quick Deployment Commands

```bash
# Automated deployment (recommended)
npm run deploy:free

# Manual deployments
npm run deploy:vercel          # Vercel only
npm run deploy:railway         # Railway backend
```

## 🧪 Testing Your Deployment

### Test Frontend

```bash
curl https://your-app.vercel.app
```

### Test Backend API

```bash
# Test backend health (if deployed separately)
curl https://your-api.railway.app/api/health

# Test authentication endpoint
curl https://your-api.railway.app/api/auth/profile
```

### Test Full Stack Integration

Visit your frontend URL and:

1. **Register/Login** - Test authentication flow
2. **Create Team** - Test team management
3. **Create Project** - Test project functionality
4. **Create Task** - Test task management
5. **Check Notifications** - Test real-time features

## 🔍 Monitoring & Debugging

### Check Logs

**Vercel:**

```bash
vercel logs https://your-app.vercel.app
```

**Railway:**

```bash
railway logs
```

**Render:**

- Check logs in Render Dashboard

### Common Issues & Solutions

#### 1. Environment Variables Not Loading

```bash
# Vercel: Check dashboard → Settings → Environment Variables
# Redeploy after adding variables
vercel --prod
```

#### 2. Database Connection Issues

```bash
# Verify DATABASE_URL format
# Check Neon database is active
# Ensure IP allowlist includes deployment platform
```

#### 3. Upstash Connection Errors

```bash
# Verify URLs and tokens in Upstash Console
# Check regions match your deployment location
# Test connection locally first
```

#### 4. CORS Issues (Split Deployment)

```bash
# Ensure NEXT_PUBLIC_API_URL points to correct backend
# Check backend CORS configuration
# Verify both services are deployed
```

## 📊 Deployment Comparison

| Feature         | Vercel Only   | Vercel + Railway | Render.com     |
| --------------- | ------------- | ---------------- | -------------- |
| **Setup Time**  | 15 minutes    | 30 minutes       | 20 minutes     |
| **Free Tier**   | Forever       | 2-3 months       | Forever        |
| **Complexity**  | Simple        | Medium           | Simple         |
| **Scalability** | High          | Very High        | Medium         |
| **Best For**    | MVP, Startups | Enterprise       | Long-term free |

## 🎉 Success Checklist

- [ ] Service accounts created (Upstash, Vercel/Railway/Render)
- [ ] Environment variables configured
- [ ] Local testing successful
- [ ] Deployment completed without errors
- [ ] Production URL accessible
- [ ] User registration/login works
- [ ] Database operations work
- [ ] Cache is functioning
- [ ] Kafka events are publishing
- [ ] All API endpoints respond correctly

## 🆘 Need Help?

1. **Check logs** first using the monitoring commands above
2. **Verify environment variables** are set correctly
3. **Test locally** to isolate deployment vs code issues
4. **Check service status** pages:
   - [Vercel Status](https://vercel-status.com)
   - [Railway Status](https://railway.statuspage.io)
   - [Render Status](https://status.render.com)
   - [Upstash Status](https://status.upstash.com)

## 🔄 Updating Your Deployment

```bash
# For all platforms, simply:
git add .
git commit -m "your changes"
git push

# Most platforms auto-deploy on push
# For manual redeployment:
npm run deploy:vercel    # or your chosen platform
```

Your TeamOps application is now live and ready for users! 🚀
