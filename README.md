# **TeamOps**

> A **full-stack, event-driven team management platform** built to showcase **Next.js, Nest.js, Kafka, AWS, and PostgreSQL** expertise.
> Open-sourced to demonstrate **scalable architecture**, **clean code practices**, and **modern DevOps workflows**.

![TeamOps Banner](https://dummyimage.com/1200x300/000/fff&text=TeamOps+-+Full+Stack+Collaboration+Platform)

---

## ** Overview**

**TeamOps** is a **collaboration and team management platform** designed to streamline how teams manage **projects, tasks, and communication**.
It demonstrates **modern full-stack development skills** with **microservices, real-time updates, open-source standards, and cloud-native deployment**.

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
| **Deployment**      | Vercel (frontend), AWS ECS/Lambda (backend), RDS (database)              | Cloud-native scalable infra                    |
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

- **Frontend** → Next.js app on Vercel
- **API Gateway** → Nest.js Gateway Service
- **Microservices** → User, Team, Task, Notification, File Services
- **Database** → PostgreSQL + Prisma ORM
- **Event Streaming** → Kafka for inter-service communication
- **Deployment** → AWS ECS for services, RDS for DB, S3 for file storage

---

### **Low-Level Design (LLD)**

#### **Frontend (Next.js)**

```
/teamops-frontend
 ├── app/
 │   ├── dashboard/
 │   ├── projects/
 │   ├── tasks/
 │   ├── profile/
 ├── components/
 ├── hooks/
 ├── lib/
 ├── utils/
 ├── styles/
 ├── tests/
```

#### **Backend (Nest.js)**

```
/teamops-backend
 ├── apps/
 │   ├── api-gateway/
 │   ├── user-service/
 │   ├── team-service/
 │   ├── task-service/
 │   ├── notification-service/
 ├── libs/
 │   ├── common/
 │   ├── kafka/
 │   ├── prisma/
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
# Frontend
cd teamops-frontend
pnpm install

# Backend
cd teamops-backend
pnpm install
```

### **4. Run Development Servers**

```bash
# Frontend
pnpm dev

# Backend
pnpm start:dev
```

---

## **🌎 Deployment**

- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [AWS ECS](https://aws.amazon.com/ecs/)
- **Database** → [AWS RDS](https://aws.amazon.com/rds/)
- **File Storage** → [AWS S3](https://aws.amazon.com/s3/)

---

## ** License**

MIT © [Vamsi Krishna](https://github.com/CVamsi27)
