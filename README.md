# **TeamOps**

> A **modern, full-stack team collaboration platform** built with **Next.js 15, NestJS, WebSockets, and PostgreSQL**.
> Designed to showcase **scalable architecture**, **intelligent task management**, **real-time communication**, and **modern development practices**.

![TeamOps Banner](https://dummyimage.com/1200x300/000/fff&text=TeamOps+-+Modern+Team+Collaboration+Platform)

---

## **✨ Overview**

**TeamOps** is a comprehensive **team management and collaboration platform** that streamlines project coordination, task management, and real-time communication with smart assignment and workload distribution. Built with modern technologies and designed for scalability, it demonstrates best practices in full-stack development, microservices architecture, and cloud-native deployment.

### **🎯 Key Highlights**

- 🚀 **Modern Tech Stack** — Next.js 15, NestJS, TypeScript, Prisma
- ⚡ **Real-Time Features** — WebSockets, live notifications, instant updates
- 🎯 **Intelligent Task Assignment** — Auto-assign tasks to creator, permission-based reassignment
- 📊 **Workload Distribution** — Visual team workload analytics and metrics
- 🏗️ **Scalable Architecture** — Microservices, event-driven design
- 🌐 **Cloud-Native** — Optimized for Render, Vercel, and modern hosting
- 🔒 **Enterprise-Ready** — JWT auth, role-based access, data security

---

## **🚀 Quick Start**

### **🎬 One-Click Deploy**

```bash
# Clone and setup
git clone https://github.com/CVamsi27/teamops.git
cd teamops
cp .env.example .env
pnpm install

# Start development
pnpm dev
```

### **☁️ Free Cloud Deployment**

- **🌐 Frontend**: [Vercel](https://vercel.com) - Auto-deploy from GitHub
- **⚙️ Backend**: [Render](https://render.com) - Uses included `render.yaml`
- **🗄️ Database**: [Neon](https://neon.tech) - Serverless PostgreSQL
- **💾 Cache/Events**: [Upstash](https://upstash.com) - Redis & Kafka (optional)

## **📚 Documentation Reference**

- 📖 [Complete Setup Guide](docs/README.md) — Development environment setup
- 🏗️ [Architecture Overview](docs/ARCHITECTURE.md) — System design and structure
- 🚀 [Deployment Guide](docs/DEPLOYMENT_STEPS.md) — Production deployment steps
- 🔧 [Render Deployment](docs/RENDER_DEPLOYMENT.md) — Render-specific setup
- 🔐 [GitHub Actions Guide](docs/GITHUB_ACTIONS_GUIDE.md) — CI/CD automation
- 📧 [SMTP Setup Guide](docs/SMTP_SETUP.md) — Email configuration
- 🎯 [Phase 2 Enhancements](PHASE_2_ENHANCEMENTS.md) — Task assignment features

---

## **🛠️ Tech Stack**

| Layer               | Technology                                                               | Purpose                          |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| **Frontend**        | [Next.js 15](https://nextjs.org/) + TypeScript + TailwindCSS + shadcn/ui | Modern React framework with SSR  |
| **Backend**         | [NestJS](https://nestjs.com/) + TypeScript + Prisma ORM                  | Scalable Node.js microservices   |
| **Database**        | [PostgreSQL](https://www.postgresql.org/) + [Neon](https://neon.tech)    | Serverless PostgreSQL database   |
| **Real-Time**       | [Socket.IO](https://socket.io/) + WebSockets                             | Live notifications & updates     |
| **Authentication**  | JWT + Google OAuth + Passport.js                                         | Secure user authentication       |
| **Caching**         | [Upstash Redis](https://upstash.com/) (optional)                         | Performance optimization         |
| **Events**          | [Upstash Kafka](https://upstash.com/) (optional)                         | Event-driven architecture        |
| **Deployment**      | [Render](https://render.com/) + [Vercel](https://vercel.com/)            | Cloud-native hosting             |
| **Package Manager** | [pnpm](https://pnpm.io/) + [Turbo](https://turbo.build/)                 | Efficient monorepo management    |
| **Email**           | SMTP + Nodemailer                                                        | Team invitations & notifications |

---

## **⚡ Features**

### **🎯 Phase 1 - Core Features (v1.0)** ✅

- 🔐 **Authentication & Authorization** — JWT + Google OAuth integration
- 👥 **Team Management** — Create teams, invite members via email, role-based access
- 📋 **Project & Task Management** — Full CRUD operations, priorities, deadlines
- 🔔 **Real-Time Notifications** — Live updates via WebSockets
- 💬 **Live Chat** — Real-time team communication
- 📊 **Activity Dashboard** — Track team progress and activity feeds
- 🗂️ **File Management** — Task attachments and project files
- 📅 **Google Calendar Integration** — Sync tasks with calendar events
- 🎨 **Modern UI** — Responsive design with dark/light mode support

### **🎯 Phase 2 - Task Assignment & Collaboration (v1.1)** ✅ NEW

- 🎯 **Smart Task Assignment** — Tasks default to creator, explicit assignment optional
- 🔐 **Permission-Based Reassignment** — Only LEAD/CONTRIBUTOR members can reassign tasks
- 🔔 **Assignment Notifications** — Real-time alerts when tasks are assigned/unassigned
- 👥 **Auto-Membership** — Creator auto-added as LEAD to projects, ADMIN to teams
- 📊 **Workload Distribution** — Visual analytics showing task counts per team member by status (TODO/IN_PROGRESS/DONE)
- 📈 **Team Statistics** — Member metrics including total tasks, average workload

### **🔧 Technical Features**

- ⚡ **Monorepo Architecture** — Efficient code sharing and management
- 🔄 **Event-Driven Design** — Kafka integration for scalable messaging
- 📱 **Responsive Design** — Mobile-first, cross-platform compatibility
- 🛡️ **Security** — CORS protection, JWT validation, input sanitization
- 🎭 **Role-Based Access** — LEAD, CONTRIBUTOR, REVIEWER, VIEWER permissions
- 📊 **Workload Analytics** — Aggregated metrics and visualization
- 📈 **Performance** — Redis caching, optimized queries, CDN assets

---

## **🏗️ Architecture**

### **System Overview**

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Frontend      │◄───────────────────►│   Backend       │
│   (Next.js)     │                     │   (NestJS)      │
│   Port: 3000    │                     │   Port: 3001    │
└─────────────────┘                     └─────────────────┘
                                                 │
                                                 ▼
                           ┌──────────────────────────────────┐
                           │        External Services         │
                           │  • PostgreSQL (Neon)           │
                           │  • Redis Cache (Upstash)       │
                           │  • Kafka Events (Upstash)      │
                           │  • SMTP Email Service          │
                           └──────────────────────────────────┘
```

### **Project Structure**

```
teamops/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules
│   │   │   │   ├── auth/       # Authentication
│   │   │   │   ├── user/       # User management
│   │   │   │   ├── team/       # Team operations
│   │   │   │   ├── project/    # Project management
│   │   │   │   ├── task/       # Task operations
│   │   │   │   ├── chat/       # Real-time chat
│   │   │   │   ├── notification/ # Notifications
│   │   │   │   └── integration/ # External APIs
│   │   │   ├── common/         # Shared utilities
│   │   │   └── infrastructure/ # Database, WebSocket setup
│   │   └── prisma/             # Database schema & migrations
│   └── web/                    # Next.js Frontend
│       ├── app/                # App router pages
│       ├── components/         # Reusable UI components
│       ├── hooks/              # Custom React hooks
│       └── lib/                # Utilities & API clients
├── packages/                   # Shared packages
│   ├── ui/                     # Shared UI components
│   ├── api/                    # Shared types & interfaces
│   └── typescript-config/      # TypeScript configurations
├── docs/                       # Documentation
└── scripts/                    # Deployment scripts
```

---

---

## **🎯 Task Assignment & Collaboration System**

### **Smart Task Assignment**

Tasks in TeamOps feature intelligent assignment management:

- **Auto-Assignment**: Tasks are automatically assigned to their creator
- **Explicit Assignment**: Users can assign tasks to team members with permission checks
- **Permission Control**: Only LEAD and CONTRIBUTOR members can reassign tasks
- **Notifications**: Real-time notifications when tasks are assigned or reassigned
- **Workload Tracking**: Built-in analytics to monitor team member workloads

### **API Endpoints**

```bash
# Assign task to member (requires LEAD/CONTRIBUTOR role)
PATCH /api/tasks/:taskId
{
  "assigneeId": "user-id"
}

# Get workload distribution for project
GET /api/tasks/workload/:projectId
Response:
[
  {
    "userId": "id",
    "name": "John Doe",
    "email": "john@example.com",
    "totalTasks": 5,
    "todoCount": 2,
    "inProgressCount": 2,
    "doneCount": 1
  }
]
```

### **Permission Model**

| Role | Can Assign | Can Reassign | Can View Workload |
| --- | --- | --- | --- |
| **LEAD** | ✅ | ✅ | ✅ |
| **CONTRIBUTOR** | ✅ | ✅ | ✅ |
| **REVIEWER** | ❌ | ❌ | ✅ |
| **VIEWER** | ❌ | ❌ | ✅ |

### **Frontend Components**

- **Workload Distribution View** — Visual bar chart showing team member tasks by status
- **Task Assignment Selector** — Dropdown to assign/reassign tasks
- **Task Filters** — Filter tasks by assignee (My Tasks, Team Tasks, etc.)

### **Event Notifications**

When tasks are assigned or reassigned:

```json
{
  "type": "task_assigned",
  "taskId": "task-123",
  "assigneeId": "user-456",
  "projectId": "project-789",
  "assignedBy": "user-001",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

## **📅 Development Roadmap**

### **v1.0 – MVP** ✅ COMPLETE

- ✅ User authentication & team management
- ✅ Project & task CRUD operations
- ✅ Real-time notifications via WebSockets
- ✅ Basic chat functionality
- ✅ Google Calendar integration

### **v1.1 – Task Assignment & Collaboration** ✅ COMPLETE

- ✅ Smart task assignment (default to creator)
- ✅ Auto-membership for projects/teams
- ✅ Permission-based task reassignment
- ✅ Assignment change notifications
- ✅ Workload distribution analytics

### **v1.2 – Advanced Task Management** 🚀 IN PROGRESS

- 🔄 **Assignee filters** → Filter tasks by assignee ("My Tasks", "Team Tasks", etc.)
- 🔄 **Bulk reassignment** → Select multiple tasks and reassign in batch
- 🔄 **Assignment history** → Track who assigned tasks and when
- 🔄 **@mention notifications** → Notify users when mentioned in comments
- 🔄 **Task templates** → Create templates with pre-assigned members

### **v2.0 – Enhanced Collaboration**

- 💬 **Advanced Chat Features** → Threads, file sharing, emoji reactions
- 📆 **Integration Hub** → Slack, Microsoft Teams, Jira connectors
- 🗓️ **Project Timelines** → Gantt charts, milestone tracking
- ⚡ **Full Kafka Integration** → Event-driven architecture expansion

### **v3.0 – Enterprise Features**

- 📊 **Advanced Analytics** → Burndown charts, velocity tracking, performance KPIs
- 🔄 **Custom Workflows** → Define unique task pipelines per team
- 🏢 **Multi-Tenancy Support** → Separate data for multiple organizations
- 🛡️ **Role-Based API Access** → Granular permissions and access control

### **v4.0 – AI-Powered Productivity**

- 🤖 **AI Task Suggestions** → Smart recommendations based on past activity
- 📅 **AI-Generated Project Timelines** → Intelligent project planning
- 🔔 **Predictive Alerts** → Early warnings for potential delays
- 📈 **Smart Analytics** → AI-driven insights and productivity recommendations

### **v5.0 – Open Source Focus**

- 📜 **Complete API Documentation** → OpenAPI/Swagger specifications
- 🤝 **Contributor Guide** → Easy onboarding for open source contributors
- 🐳 **Docker Setup** → Containerized development environment
- 🔌 **Plugin System** → Extensible architecture for third-party integrations

---

## **📚 Documentation Reference**

---

## **🛠️ Development Setup**

### **Prerequisites**

- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL database (local or Neon)

### **1. Clone & Install**

```bash
git clone https://github.com/CVamsi27/teamops.git
cd teamops
pnpm install
```

### **2. Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configurations
# Required: DATABASE_URL, JWT_SECRET
# Optional: Google OAuth, Redis, Kafka, SMTP
```

### **3. Database Setup**

```bash
# Generate Prisma client
cd apps/api && pnpm exec prisma generate

# Run migrations
pnpm exec prisma migrate dev

# (Optional) Seed sample data
pnpm exec prisma db seed
```

### **4. Start Development**

```bash
# Start both frontend and backend
pnpm dev

# Or start individually:
pnpm dev:web    # Frontend only (port 3000)
pnpm dev:api    # Backend only (port 3001)
```

### **5. Access Application**

- 🌐 **Frontend**: http://localhost:3000
- ⚙️ **Backend API**: http://localhost:3001/api
- 📊 **Database Studio**: `pnpm prisma:studio`

---

## **☁️ Production Deployment**

### **Render (Recommended - Free Tier)**

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repository to Render
# 3. Render auto-detects render.yaml configuration
# 4. Set environment variables in Render dashboard
```

**Required Environment Variables:**

```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_id (optional)
GOOGLE_CLIENT_SECRET=your_google_oauth_secret (optional)
```

### **Alternative Deployments**

- **Vercel + Railway**: Frontend on Vercel, API on Railway
- **AWS**: ECS/EKS for containers, RDS for database
- **Google Cloud**: Cloud Run + Cloud SQL
- **Self-hosted**: Docker Compose setup available

---

## **🤝 Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**

- TypeScript for type safety
- ESLint + Prettier for code formatting
- Jest for testing
- Conventional commits for git messages

---

## **📄 License**

MIT © [Vamsi Krishna](https://github.com/CVamsi27)

---

## **🔗 Links**

- 🌐 **Live Demo**: [Coming Soon]
- 📚 **Documentation**: [docs/](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/CVamsi27/teamops/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/CVamsi27/teamops/discussions)
- 📧 **Contact**: [vamsi@example.com](mailto:vamsi@example.com)

## 🚀 **Quick Start Deployment**

### **One-Command Deployment**

```bash
# Interactive deployment wizard
npm run deploy:free
```

### **Quick Setup**

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Get deployment help
npm run deploy:guide

# 3. Setup services (follow the links)
npm run setup:all

# 4. Test locally
npm run dev

# 5. Deploy to production
npm run deploy:vercel
```

### **Free Hosting Options**

- **Vercel**: $0/month (Recommended for Frontend)
- **Render**: $0/month forever (Recommended for Backend)
- **Railway**: Pay-as-you-go (Alternative)
- **Neon**: Free PostgreSQL database
- **Upstash**: Free Redis + Kafka (optional)

### **CI/CD Ready**

- ✅ GitHub Actions configured
- ✅ Automatic testing on PR
- ✅ Optional auto-deploy to production
- ✅ Zero-config setup

---

## **� Quick Links**

� **[Complete Documentation →](docs/README.md)**
🏗️ **[Architecture Overview →](docs/ARCHITECTURE.md)**
� **[Deployment Guide →](docs/DEPLOYMENT_STEPS.md)**
� **[GitHub Actions Setup →](docs/GITHUB_ACTIONS_GUIDE.md)**
📧 **[SMTP Email Setup →](docs/SMTP_SETUP.md)**
🎯 **[Phase 2 Task Features →](PHASE_2_ENHANCEMENTS.md)**

---
