# Architecture Overview

## System Design

TeamOps follows a **clean separation** between frontend and backend:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │◄───────────────►│   Backend       │
│   (Next.js)     │                 │   (NestJS)      │
│   Port: 3000    │                 │   Port: 3001    │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   PostgreSQL    │
                                    │   (Database)    │
                                    └─────────────────┘
```

## Applications

### **Frontend: `apps/web`**

- **Technology**: Next.js 15 + TypeScript + TailwindCSS
- **Port**: 3000
- **Purpose**: User interface, routing, client-side logic
- **API Calls**: Makes HTTP requests to NestJS backend on port 3001

### **Backend: `apps/api`**

- **Technology**: NestJS + TypeScript + Prisma ORM
- **Port**: 3001
- **Purpose**: API endpoints, business logic, database operations
- **Features**:
  - Authentication & Authorization
  - Team Management
  - Task Management
  - Notification System
  - Database Operations

## Data Flow

1. **User Interaction**: User interacts with Next.js frontend (port 3000)
2. **API Request**: Frontend makes HTTP request to NestJS backend (port 3001)
3. **Processing**: Backend processes request, interacts with database
4. **Response**: Backend returns JSON response to frontend
5. **UI Update**: Frontend updates UI based on response

## Environment Configuration

```bash
# Frontend calls backend API with /api prefix
NEXT_PUBLIC_API_URL="http://localhost:3001/api"  # Points to NestJS backend
```

## Development Workflow

```bash
# Start both applications
npm run dev

# This runs:
# - Frontend on http://localhost:3000
# - Backend on http://localhost:3001
```

## Benefits of This Architecture

1. **Separation of Concerns**: Frontend handles UI, backend handles business logic
2. **Scalability**: Backend and frontend can be scaled independently
3. **Technology Flexibility**: Can use different hosting for frontend vs backend
4. **Team Development**: Frontend and backend teams can work independently
5. **Production Ready**: Industry-standard microservices approach

## Deployment Options

### **Option 1: Separate Deployment (Recommended)**

- **Frontend**: Deploy to Vercel (static hosting)
- **Backend**: Deploy to Railway/Render (API hosting)
- **Database**: Neon PostgreSQL

### **Option 2: Full Stack Platform**

- **Both**: Deploy to Railway (full-stack hosting)
- **Database**: Railway PostgreSQL

## API Documentation

The NestJS backend provides RESTful endpoints with `/api` prefix:

- **Health**: `GET /api/health`
- **Authentication**: `/api/auth/*`
- **Teams**: `/api/teams/*`
- **Projects**: `/api/projects/*`
- **Tasks**: `/api/tasks/*`
- **Notifications**: `/api/notifications/*`
- **Dashboard**: `/api/dashboard`

See the NestJS controllers in `apps/api/src/modules/` for complete API documentation.
