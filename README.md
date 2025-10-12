# **TeamOps**

> A **full-stack, event-driven team management platform** built to showcase **Next.js, Nest.js, Kafka, AWS, and PostgreSQL** expertise.
> Open-sourced to demonstrate **scalable architecture**, **clean code practices**, and **modern DevOps workflows**.

![TeamOps Banner](https://dummyimage.com/1200x300/000/fff&text=TeamOps+-+Full+Stack+Collaboration+Platform)

---

## ** Overview**

**TeamOps** is a **collaboration and team management platform** designed to streamline how teams manage **projects, tasks, and communication**.
It demonstrates **modern full-stack development skills** with **microservices, real-time updates, open-source standards, and cloud-native deployment**.

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
- 📊 **Dashboard** — See projects, tasks, and team stats in one place

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

### **v3.0 – Enterprise Features**

- 📊 Advanced Analytics (burndown, velocity, KPIs)
- 🏢 Multi-Tenancy Support
- 🛡️ Role-Based API Access Control

### **v4.0 – AI-Powered Productivity**

- 🤖 AI Task Suggestions
- 📅 AI Project Timeline Generation
- 🔔 Predictive Alerts for Delays

### **v5.0 – Open Source Focus**

- 📜 Contributor-Friendly Guide
- 🐳 Dockerized Setup
- 🔌 OpenAPI + GraphQL Docs

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
