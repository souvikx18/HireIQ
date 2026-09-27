<div align="center">

# 🚀 HireIQ

**AI-Powered Recruitment Intelligence Platform**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*Smart screening. Zero bias. Instant shortlisting.*

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start (Docker)](#-quick-start-docker)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## 🎯 Project Overview

HireIQ is a **full-stack AI recruitment platform** that streamlines the hiring pipeline for both recruiters and job candidates.

| Feature | Description |
|---|---|
| 🤖 **AI Resume Screening** | Gemini-powered ATS score with skill gap analysis |
| ⚡ **Speed Screening** | Keyboard-first candidate review (J/K/S/R hotkeys) |
| 🔍 **Command Palette** | Cmd+K spotlight search across the entire platform |
| 📊 **Analytics Dashboard** | Real-time shortlist & interview rate metrics |
| 🌙 **Dark Mode** | Full dark-mode support with glassmorphism UI |
| 🤝 **AI Copilot** | Context-aware recruiter chatbot with smooth scroll |
| 📄 **Resume Checker** | Animated ATS score dial + privacy-first analysis |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client Browser                  │
│           React 19 + Vite  (port 5173)              │
└──────────────────────┬──────────────────────────────┘
                       │ REST / JSON
          ┌────────────▼────────────┐
          │   Node.js / Express API  │
          │   Prisma ORM  (port 5000)│
          └──────┬──────────┬───────┘
                 │          │
        ┌────────▼──┐  ┌────▼────────────┐
        │ PostgreSQL │  │ Python FastAPI   │
        │   (5432)   │  │ AI Microservice  │
        └────────────┘  │   (port 8000)   │
                        │ Gemini · spaCy  │
                        └─────────────────┘
```

---

## ✅ Prerequisites

| Tool | Minimum Version | Install |
|---|---|---|
| **Git** | 2.x | [git-scm.com](https://git-scm.com) |
| **Node.js** | 20.x LTS | [nodejs.org](https://nodejs.org) |
| **npm** | 9.x | Bundled with Node |
| **Python** | 3.11+ | [python.org](https://python.org) |
| **Docker** | 24.x | [docker.com](https://docker.com/get-started) |
| **Docker Compose** | v2.x | Bundled with Docker Desktop |
| **PostgreSQL** | 16 (or use Docker) | Via Docker compose |

---

## 🐳 Quick Start (Docker)

> The fastest way to run the **full stack** locally.

### 1. Clone the repository

```bash
git clone https://github.com/souvikx18/HireIQ.git
cd HireIQ
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your actual values (see Environment Variables section)
```

### 3. Build and run all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend API (Node) | http://localhost:5000 |
| AI Microservice (Python) | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

### 4. Stop all services

```bash
docker compose down
# To also remove volumes (database data):
docker compose down -v
```

---

## 💻 Local Development Setup

### Frontend (React + Vite)

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev
# → http://localhost:5173
```

### Backend (Node.js + Express + Prisma)

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Run database migrations
npx prisma migrate dev

# 4. Generate Prisma client
npx prisma generate

# 5. Start the API server
node src/server.js
# → http://localhost:5000
```

### AI Microservice (Python + FastAPI)

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate it
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download spaCy language model
python -m spacy download en_core_web_sm

# 5. Start the FastAPI service
uvicorn ai_service.main:app --reload --port 8000
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# ── Database ────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/hireiq

# ── JWT Auth ─────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# ── Google AI (Gemini) ───────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ── Python AI Service ────────────────────────
AI_SERVICE_URL=http://localhost:8000

# ── Node Server ──────────────────────────────
PORT=5000
NODE_ENV=development

# ── Frontend (Vite) ──────────────────────────
VITE_API_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

> [!CAUTION]
> Never commit real secrets. Add `.env` to `.gitignore`.

---

## 📡 API Reference

### Node.js Backend (port 5000)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register candidate or recruiter | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT | ❌ |
| `GET` | `/api/candidates` | List all candidates | ✅ Recruiter |
| `GET` | `/api/candidates/:id` | Get candidate profile | ✅ |
| `PATCH` | `/api/candidates/:id/status` | Update shortlist/reject status | ✅ Recruiter |
| `GET` | `/api/jobs` | List job postings | ✅ |
| `POST` | `/api/jobs` | Create job posting | ✅ Recruiter |
| `GET` | `/api/dashboard/stats` | Recruiter analytics | ✅ Recruiter |

### Python AI Microservice (port 8000)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |
| `POST` | `/api/resume/analyze` | Analyze resume, return ATS score + skill gaps |
| `POST` | `/api/resume/match` | Match resume to job description |
| `POST` | `/api/chat/message` | AI copilot chat completion |

Full interactive docs at **http://localhost:8000/docs** (Swagger UI).

---

## 📁 Project Structure

```
HireIQ/
├── 📄 README.md                  # This file
├── 📄 requirements.txt           # Python AI service dependencies
├── 🐳 Dockerfile                 # Frontend — Node 20 → Nginx
├── 🐳 Dockerfile.python          # AI Microservice — Python 3.11
├── 🐳 docker-compose.yml         # Full stack orchestration
├── 📄 package.json               # Frontend npm config
├── 📄 vite.config.js             # Vite build config
├── 📄 index.html                 # Entry HTML (Google Fonts)
│
├── src/                          # React 19 Frontend
│   ├── App.jsx                   # Root router + global components
│   ├── main.jsx                  # Vite entry + SmoothScroll wrapper
│   ├── index.css                 # Global tokens, Lenis, shimmer
│   │
│   ├── components/
│   │   ├── Header.jsx            # Top nav + ⌘K trigger
│   │   ├── Sidebar.jsx           # Role-aware sidebar
│   │   ├── AIChatbot.jsx         # Floating AI copilot
│   │   ├── CommandPalette.jsx    # Cmd+K spotlight search
│   │   ├── SmoothScroll.jsx      # Lenis inertial scroll wrapper
│   │   └── common/
│   │       └── Skeleton.jsx      # Shimmer skeleton components
│   │
│   ├── pages/
│   │   ├── Index.jsx             # Recruiter dashboard
│   │   ├── Candidates.jsx        # Speed-screening table
│   │   ├── Setting.jsx           # Settings (full dark mode)
│   │   └── Candidate/
│   │       ├── CandidateDashboard.jsx
│   │       ├── ResumeChecker.jsx # ATS dial + privacy badge
│   │       └── ...
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # JWT auth + role state
│   │
│   └── css/                      # Per-page CSS files
│       ├── style.css             # CSS custom properties
│       ├── Candidates.css
│       ├── setting.css
│       ├── chatbot.css
│       └── header-common.css
│
└── server/                       # Node.js Express Backend
    ├── 🐳 Dockerfile             # Node 20 Alpine, port 5000
    ├── package.json
    └── src/
        ├── server.js             # Express entry point
        ├── routes/               # API route handlers
        ├── middleware/           # JWT auth middleware
        └── prisma/
            └── schema.prisma     # Database schema
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m "feat: your feature description"`
4. Push to branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

<div align="center">

Built with ❤️ by the HireIQ Team · [GitHub](https://github.com/souvikx18/HireIQ)

</div>
