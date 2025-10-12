# TeamOps Render Deployment Guide

## Prerequisites

1. **Neon Database** (Free tier)
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Upstash Redis** (Optional but recommended)
   - Sign up at [upstash.com](https://upstash.com)
   - Create a Redis database
   - Copy REST URL and Token

3. **Upstash Kafka** (Optional)
   - Create a Kafka cluster on Upstash
   - Copy REST URL and Token

4. **Google OAuth** (Optional - for Google integrations)
   - Set up OAuth credentials in Google Cloud Console
   - Get Client ID and Secret

## Deployment Steps

### 1. Fork/Clone Repository
```bash
git clone https://github.com/your-username/teamops.git
cd teamops
```

### 2. Create Render Account
- Sign up at [render.com](https://render.com)
- Connect your GitHub repository

### 3. Deploy Using render.yaml
1. In Render dashboard, click "New" → "Blueprint"
2. Connect your repository
3. Render will automatically detect `render.yaml`
4. Click "Apply"

### 4. Set Environment Variables
In Render dashboard, set these required variables:

#### API Service (teamops-api)
```bash
DATABASE_URL=postgresql://your-neon-connection-string
UPSTASH_REDIS_REST_URL=https://your-redis-url (optional)
UPSTASH_REDIS_REST_TOKEN=your-redis-token (optional)
UPSTASH_KAFKA_REST_URL=https://your-kafka-url (optional)
UPSTASH_KAFKA_REST_TOKEN=your-kafka-token (optional)
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
GOOGLE_CALENDAR_CLIENT_ID=your-calendar-client-id (optional)
GOOGLE_CALENDAR_CLIENT_SECRET=your-calendar-secret (optional)
```

#### Web Service (teamops-web)
No additional variables needed - all are pre-configured in render.yaml

### 5. Database Setup
```bash
# After API service is deployed, run migrations
# This will be done automatically during the build process
```

### 6. Verify Deployment
- API Health Check: `https://teamops-api.onrender.com/api/health`
- Web App: `https://teamops-web.onrender.com`

## Build Configuration

The `render.yaml` is optimized for:
- **pnpm** package manager for faster builds
- **Monorepo** structure with proper filtering
- **Prisma** database generation
- **Turbo** build system
- **Health checks** for monitoring

## Free Tier Limitations

Render free tier includes:
- 750 hours/month of runtime
- Services sleep after 15 minutes of inactivity
- Cold start delays (10-30 seconds)
- 512MB RAM per service

## Troubleshooting

### Build Issues
1. Check build logs in Render dashboard
2. Ensure all dependencies are in package.json
3. Verify pnpm lockfile is committed

### Runtime Issues
1. Check environment variables are set
2. Verify database connection string
3. Check service logs for errors

### Cold Starts
- First request after sleep may take 30+ seconds
- Consider upgrading to paid plan for always-on services

## Monitoring

- Health endpoint: `/api/health`
- Render provides basic monitoring
- Set up external monitoring for production use

## Upgrading

To upgrade from free tier:
1. Go to service settings in Render
2. Change plan to paid tier
3. Benefits: no sleep, faster builds, more resources

## Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- TeamOps Issues: [GitHub Issues](https://github.com/your-repo/issues)