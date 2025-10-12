# TeamOps - Quick Vercel Setup Guide

## 🚀 Manual Vercel Deployment (Recommended)

Since the automated script requires interactive login, here's how to deploy manually:

### Step 1: Setup Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Install Vercel CLI globally: `npm i -g vercel`
3. Login: `vercel login`

### Step 2: Deploy from Web Directory
```bash
cd apps/web
vercel
```

### Step 3: Setup Vercel Databases
After your project is created on Vercel:

1. **Go to Vercel Dashboard** → Your Project → Storage
2. **Create Postgres Database**: 
   - Click "Create Database" → "Postgres"
   - Name: `teamops-db`
   - Connect to project
3. **Create KV Store**:
   - Click "Create Database" → "KV" 
   - Name: `teamops-cache`
   - Connect to project
4. **Create Blob Storage**:
   - Click "Create Database" → "Blob"
   - Name: `teamops-storage`
   - Connect to project

### Step 4: Set Environment Variables
In your Vercel project settings → Environment Variables:

```bash
# Will be auto-set when you connect databases:
POSTGRES_URL=          # Auto-generated
KV_REST_API_URL=       # Auto-generated  
KV_REST_API_TOKEN=     # Auto-generated
BLOB_READ_WRITE_TOKEN= # Auto-generated

# Manual setup:
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### Step 5: Deploy
```bash
vercel --prod
```

## 🏃‍♂️ Quick Test Locally

You can test the API routes locally right now:

```bash
cd apps/web
npm run dev
```

### Test Endpoints:
- **Health Check**: `GET http://localhost:3001/api/health`
- **Register**: `POST http://localhost:3001/api/auth/register`
  ```json
  {
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
  }
  ```
- **Login**: `POST http://localhost:3001/api/auth/login`
  ```json
  {
    "email": "test@example.com", 
    "password": "password"
  }
  ```
- **Get User**: `GET http://localhost:3001/api/auth/profile`
- **Get Teams**: `GET http://localhost:3001/api/teams`

## 📊 What's Working Now:

✅ **Authentication System**:
- JWT token creation and validation
- Password hashing with bcrypt
- Secure HTTP-only cookies
- Password strength validation
- Email format validation

✅ **Mock Database Layer**:
- User registration and login
- Teams CRUD operations
- Development-friendly mock responses

✅ **API Routes**:
- `http://localhost:3001/api/health` - Health check (NestJS backend)
- `http://localhost:3001/api/auth/*` - Authentication endpoints
- `http://localhost:3001/api/teams` - Teams management

✅ **Architecture**:
- Clean separation: Frontend (port 3000) + Backend (port 3001)
- NestJS backend with proper services and controllers
- PostgreSQL database with Prisma ORM

## 🔄 Next Steps After Vercel Deployment:

1. **Connect Real Database**: Replace mock DB with actual Vercel Postgres queries
2. **Add More API Routes**: Projects, tasks, notifications, etc.
3. **Frontend Integration**: Update your existing components to use new API
4. **Testing**: Test all functionality in production environment

## 💰 Vercel Pricing Estimate:

- **Hobby (Free)**: Perfect for testing
  - 100GB bandwidth
  - Serverless functions included
  - 1 concurrent build

- **Pro ($20/month)**: Production ready
  - 1TB bandwidth  
  - Faster builds
  - Team collaboration
  - Analytics included

**Additional costs**:
- Postgres: ~$20/month (shared resources)
- KV Store: ~$5/month
- Blob Storage: ~$10/month

**Total**: ~$55/month (vs $100+ for AWS)

## 🚀 Benefits You'll Get:

- **Instant Scaling**: Auto-scales to zero cost when not used
- **Global CDN**: Sub-100ms response times worldwide
- **Zero Ops**: No servers to manage or maintain
- **Git Integration**: Deploy on every push
- **Preview Deployments**: Test changes before going live
- **Built-in Monitoring**: Performance analytics included

The foundation is ready! Just need to complete the Vercel setup manually.