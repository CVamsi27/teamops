# **TeamOps**

> A **modern, full-stack team collaboration platform** built with **Next.js 15, NestJS, WebSockets, and PostgreSQL**.
> Designed to showcase **scalable architecture**, **real-time communication**, and **modern development practices**.

![TeamOps Banner](https://dummyimage.com/1200x300/000/fff&text=TeamOps+-+Modern+Team+Collaboration+Platform)

---

## **✨ Overview**

**TeamOps** is a comprehensive **team management and collaboration platform** that streamlines project coordination, task management, and real-time communication. Built with modern technologies and designed for scalability, it demonstrates best practices in full-stack development, microservices architecture, and cloud-native deployment.

### **🎯 Key Highlights**

- 🚀 **Modern Tech Stack** — Next.js 15, NestJS, TypeScript, Prisma
- ⚡ **Real-Time Features** — WebSockets, live notifications, instant updates
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

### **📚 Documentation**

- 📖 [Complete Setup Guide](docs/README.md)
- 🏗️ [Architecture Overview](docs/ARCHITECTURE.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT_STEPS.md)
- 🔧 [Render Deployment](docs/RENDER_DEPLOYMENT.md)

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

### **🎯 Current Features (v1.0)**

- 🔐 **Authentication & Authorization** — JWT + Google OAuth integration
- 👥 **Team Management** — Create teams, invite members via email, role-based access
- 📋 **Project & Task Management** — Full CRUD operations, priorities, deadlines
- 🔔 **Real-Time Notifications** — Live updates via WebSockets
- 💬 **Live Chat** — Real-time team communication
- 📊 **Activity Dashboard** — Track team progress and activity feeds
- 🗂️ **File Management** — Task attachments and project files
- 📅 **Google Calendar Integration** — Sync tasks with calendar events
- 🎨 **Modern UI** — Responsive design with dark/light mode support

### **🔧 Technical Features**

- ⚡ **Monorepo Architecture** — Efficient code sharing and management
- 🔄 **Event-Driven Design** — Kafka integration for scalable messaging
- 📱 **Responsive Design** — Mobile-first, cross-platform compatibility
- 🛡️ **Security** — CORS protection, JWT validation, input sanitization
- 🎭 **Role-Based Access** — Admin, Member, Viewer permissions
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

## **📅 Roadmap**

### **v1.0 – MVP** ✅

- ✅ User authentication & team management
- ✅ Project & task CRUD operations
- ✅ Real-time notifications via WebSockets
- ✅ Basic chat functionality
- ✅ Google Calendar integration

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

- **Vercel**: $0/month (Recommended)
- **Railway**: $0 for first few months
- **Render**: $0/month forever

### **CI/CD Ready**

- ✅ GitHub Actions configured
- ✅ Automatic testing on PR
- ✅ Optional auto-deploy to production
- ✅ Zero-config setup

📖 **[Complete Documentation →](docs/README.md)**
📖 **[🏗️ Architecture Overview →](docs/ARCHITECTURE.md)**
📖 **[Quick Deployment Guide →](docs/DEPLOYMENT_STEPS.md)**
📖 **[Free Cloud Setup →](docs/FREE_CLOUD_SETUP.md)**
📖 **[GitHub Actions Setup →](docs/ACTIONS_SETUP.md)**

---

## **🚀 Tech Stack**

| Layer               | Technology                                                               | Purpose                                        |
| ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| **Frontend**        | [Next.js 15](https://nextjs.org/) + TypeScript + TailwindCSS + ShadCN UI | Fast, SEO-friendly, responsive UI              |
| **Backend**         | [Nest.js](https://nestjs.com/) + TypeScript                              | Microservices-based API backend                |
| **Database**        | PostgreSQL + Prisma ORM                                                  | Relational database with schema-based modeling |
| **Event Streaming** | Apache Kafka                                                             | Real-time events & notifications               |
| **Auth**            | NextAuth.js + JWT                                                        | Secure authentication & authorization          |
| **Caching**         | Redis                                                                    | Session storage & faster response times        |
| **Deployment**      | Vercel (frontend), Railway/Render (backend), Neon (database)             | Cloud-native scalable infra                    |
| **Testing**         | Jest + React Testing Library                                             | Unit & integration testing                     |
| **CI/CD**           | GitHub Actions                                                           | Automated testing & deployments                |
| **Docs**            | Storybook + OpenAPI                                                      | Component & API documentation                  |

---

## **⚡ Features**

### **MVP (v1.0)**

- 🔑 **Authentication** — JWT + OAuth login/signup
- 👥 **Team Management** — Create teams, invite members, assign roles
- 📌 **Project & Task Management** — Create projects, tasks, priorities, and deadlines
- 🔔 **Real-Time Notifications** — Powered by **Kafka + WebSockets**
- � **Live Communication** — Real-time updates via **WebSockets**
- �📊 **Dashboard** — See projects, tasks, and team stats in one place

---

## **🏗️ System Architecture**

### **High-Level Design (HLD)**

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
                                    │   + Redis       │
                                    │   + Kafka       │
                                    └─────────────────┘
```

- **Frontend** → Next.js app (Vercel)
- **Backend** → NestJS API (Railway/Render)
- **Database** → PostgreSQL (Neon)
- **Cache** → Redis (Upstash)
- **Events** → Kafka (Upstash)

---

### **Low-Level Design (LLD)**

#### **Frontend (Next.js) - `apps/web`**

```
apps/web/
 ├── app/                  # Next.js 13+ app directory
 │   ├── dashboard/        # Dashboard pages
 │   ├── projects/         # Project management
 │   ├── tasks/           # Task management
 │   └── profile/         # User profile
 ├── components/          # Reusable UI components
 ├── hooks/              # Custom React hooks
 ├── lib/                # Utilities and services
 └── styles/             # CSS and styling
```

#### **Backend (NestJS) - `apps/api`**

```
apps/api/
 ├── src/
 │   ├── modules/
 │   │   ├── auth/        # Authentication service
 │   │   ├── user/        # User management
 │   │   ├── team/        # Team management
 │   │   ├── project/     # Project service
 │   │   ├── task/        # Task service
 │   │   └── notification/ # Notification service
 │   ├── common/          # Shared utilities
 │   └── infrastructure/  # Database, Kafka, etc.
 └── prisma/              # Database schema
```

---

## **📅 Roadmap**

### **v1.0 – MVP**

- ✅ Authentication & Authorization
- ✅ Team & Project Management
- ✅ Task CRUD + Deadlines
- ✅ Real-time Notifications
- ✅ Dashboard UI

### **v2.0 – Advanced Collaboration**

- 💬 Live Chat + Comments
- 📆 Google Calendar & Slack Integration
- 🗓️ Project Timelines & Gantt Charts
- ⚡ **Full Kafka Integration** — Event-driven architecture for real-time features

### **v3.0 – Enterprise Features**

- 📊 **Advanced Analytics** → Burndown charts, velocity, performance KPIs
- 🔄 **Custom Workflows** → Define unique task pipelines per team
- 🏢 **Multi-Tenancy Support** → Separate data for multiple organizations
- 🛡️ **Role-Based API Access** → More granular permissions

### **v4.0 – AI-Powered Productivity**

- 🤖 **AI Task Suggestions** → Based on past activity and patterns
- 📅 **AI-Generated Project Timelines** → Intelligent project planning
- 🔔 **Predictive Alerts** → Early warnings for delayed tasks

### **v5.0 – Open Source Focus**

- 📜 **Fully Documented API** → Complete OpenAPI/Swagger documentation
- 🤝 **Contributor-Friendly Guide** → Easy onboarding for open source contributors
- 🐳 **Docker-Based Setup** → Quick development environment setup

---

## **🛠️ Installation & Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/CVamsi27/teamops.git
cd teamops
```

### **2. Setup Environment Variables**

Create `.env` files for **frontend** and **backend**:

#### **Frontend `.env`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

#### **Backend `.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/teamops
KAFKA_BROKER=localhost:9092
JWT_SECRET=your_secret
AWS_ACCESS_KEY=xxx
AWS_SECRET_KEY=xxx
AWS_BUCKET=teamops-files
```

### **3. Install Dependencies**

```bash
# Install all dependencies (frontend + backend)
pnpm install
```

### **4. Run Development Servers**

```bash
# Start both frontend and backend
npm run dev

# This starts:
# - Frontend: http://localhost:3000 (Next.js)
# - Backend: http://localhost:3001 (NestJS)
```

---

## **🌎 Deployment**

### **Free Cloud Deployment**

- **Frontend** → [Vercel](https://vercel.com) (Free)
- **Backend** → [Railway](https://railway.app) or [Render](https://render.com) (Free)
- **Database** → [Neon](https://neon.tech) (Free PostgreSQL)
- **Cache & Events** → [Upstash](https://upstash.com) (Free Redis + Kafka)

### **Alternative: Enterprise**

- **Backend** → AWS ECS/EKS, Google Cloud Run
- **Database** → AWS RDS, Google Cloud SQL
- **File Storage** → AWS S3, Google Cloud Storage

---

## ** License**

MIT © [Vamsi Krishna](https://github.com/CVamsi27)
