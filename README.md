# HireIQ

An intelligent recruitment and talent evaluation platform featuring automated ATS resume screening, skill gap analysis, candidate speed-screening, and an AI-assisted hiring copilot.

---

## Overview

Modern hiring teams are inundated with hundreds of applicants per job opening, leading to evaluation fatigue, subjective bias, and delayed hiring decisions. At the same time, job seekers struggle to understand why their resumes fail automated applicant tracking systems (ATS).

**HireIQ** bridges this gap by providing a full-stack, two-sided recruitment platform:

- **For Recruiters & Hiring Managers:** Provides a unified command center to publish job descriptions, parse resumes at scale, evaluate candidates against objective benchmarks, perform keyboard-first speed screening, review skill gaps, and interact with a contextual AI recruitment assistant.
- **For Job Candidates:** Offers a self-service portal featuring an interactive ATS resume checker, visual match score metrics, identified missing skills, and prioritized learning roadmaps.

---

## Features

### Recruiter & Talent Acquisition Portal
- **Automated Resume Parsing:** Upload and extract structured data from resumes in PDF, DOCX, and TXT formats.
- **ATS Scoring & Compatibility Matching:** Calculates overall ATS match percentage, skill coverage, and semantic alignment against job requirements.
- **Keyboard-Driven Speed Screening:** Rapid candidate triaging using dedicated hotkeys (`J` Next, `K` Previous, `S` Shortlist, `R` Reject) and inline status toggling.
- **Skill Gap & Benchmark Analysis:** Visual breakdown of technical, tool, domain, and soft skill proficiencies compared against company benchmarks.
- **Job Role Management:** Create, configure, and maintain open job requisitions with required vs. preferred criteria and experience thresholds.
- **Interactive Command Palette:** Global spotlight navigation (`Cmd+K` / `Ctrl+K`) to jump directly across routes, candidates, and portal actions.
- **AI Recruiter Copilot:** Contextual chat assistant capable of answering questions about candidate pools, evaluating requirements, and providing hiring guidance.
- **Analytics & Reporting:** Key hiring pipeline metrics including candidate volume, shortlist rates, review status distribution, and interview conversion ratios.

### Candidate Experience Portal
- **Interactive ATS Resume Checker:** Instant upload and evaluation showing overall ATS score, keyword extraction, and score breakdown.
- **Skill Gap Roadmaps:** Clear identification of missing qualifications, prioritized skill deficiencies, and suggested areas of improvement.
- **Candidate Dashboard:** Centralized view of submitted applications, review progress, and status indicators.

### Architecture & System Design
- **Dual Database Flexibility:** Runs out-of-the-box on SQLite for rapid zero-dependency local development, with seamless switching to PostgreSQL for production.
- **AI Microservice with Graceful Fallback:** Dedicated Python FastAPI service powered by Google Gemini, equipped with deterministic heuristic fallback when an API key is not configured.
- **Multi-Layered Security:** Helmet security headers, rate limiting (Express Rate Limit & SlowAPI), JWT token authentication with token revocation, input validation via Zod and Pydantic v2, and non-root Docker execution.
- **Fully Responsive & Polished UX:** Accessible mobile off-canvas drawer navigation, optimized assets, smooth scrolling via Lenis, and dark-mode glassmorphism styling.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, Lenis Smooth Scroll |
| **Styling & UI** | CSS3 Custom Properties, Responsive Flexbox/Grid, Glassmorphic UI |
| **Backend API** | Node.js 20, Express 4, Prisma ORM 6, Zod, Multer |
| **AI Microservice** | Python 3.11, FastAPI 0.111, Pydantic v2, Uvicorn, SlowAPI |
| **AI & NLP** | Google Generative AI (Gemini 1.5), spaCy, PyPDF, python-docx, pdf-parse, mammoth |
| **Database** | PostgreSQL 16 (Production / Docker) & SQLite (Local Development) |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs, Helmet, Express Rate Limit, SlowAPI |
| **Testing** | Vitest (Backend Node.js API), Pytest (Python AI Microservice) |
| **Containerization** | Docker, Docker Compose, Nginx Alpine |

---

## Project Structure

```
HireIQ/
├── ai_service/                  # Python FastAPI AI Microservice
│   ├── api/v1/                  # Endpoints (health, resume analysis, AI chat)
│   ├── core/                    # App configuration, security middleware, exception handlers
│   ├── schemas/                 # Pydantic v2 request/response schemas
│   ├── services/                # Document parsing, Gemini AI integration, skill matching
│   └── tests/                   # Pytest test suite
│
├── server/                      # Node.js Express REST API
│   ├── prisma/                  # Prisma schema and database seed script
│   ├── scripts/                 # Utility scripts (switch-db, clean-test-data)
│   ├── src/
│   │   ├── config/              # Environment config & Prisma client
│   │   ├── middleware/          # JWT auth, role validation, error handling
│   │   ├── routes/              # Express API route modules
│   │   ├── utils/               # Structured responses, logger
│   │   └── server.js            # Express application entry point
│   └── tests/                   # Vitest automated test suite
│
├── src/                         # React 19 Frontend Application
│   ├── components/              # Shared UI components (Header, Sidebar, AIChatbot, etc.)
│   ├── context/                 # AuthContext (JWT management & role handling)
│   ├── hooks/                   # Custom hooks (usePageSEO, responsive listeners)
│   ├── pages/                   # Application views & dashboards
│   │   ├── Candidate/           # Candidate portal (Dashboard, ResumeChecker)
│   │   ├── Candidates.jsx       # Recruiter candidate screening table
│   │   ├── Index.jsx            # Recruiter analytics dashboard
│   │   ├── JobRole.jsx          # Job role management
│   │   ├── SkillGapAnalysis.jsx # Skill matrix analysis
│   │   └── NotFound.jsx         # Custom 404 page
│   ├── css/                     # Component and page stylesheets
│   ├── App.jsx                  # Root client-side routing & layouts
│   └── main.jsx                 # React entry point
│
├── docker-compose.yml           # Full-stack container orchestration
├── Dockerfile                   # Frontend build + Nginx production container
├── Dockerfile.python            # AI microservice container
├── requirements.txt             # Python microservice dependencies
├── package.json                 # Frontend dependencies & workspace scripts
└── .env.example                 # Environment configuration template
```

---

## Getting Started

### Prerequisites

Ensure the following runtimes and tools are installed on your system:

- **Node.js**: `v20.x LTS` or higher
- **npm**: `v9.x` or higher
- **Python**: `3.11+` (Required for the AI microservice)
- **Git**: `2.x`
- **Docker & Docker Compose**: (Optional, for containerized execution)

---

### Installation & Local Setup

#### 1. Clone Repository & Setup Environment

```powershell
git clone https://github.com/souvikx18/HireIQ.git
cd HireIQ
Copy-Item .env.example .env
```

#### 2. Option A: Run Full Stack via Docker (Recommended)

To build and spin up PostgreSQL, the Node.js API, the FastAPI AI microservice, and the Nginx-hosted frontend with a single command:

```powershell
docker compose up --build -d
```

Service URLs:
- **Frontend Application:** http://localhost:80
- **Node.js Express API:** http://localhost:5000
- **FastAPI AI Microservice:** http://localhost:8000
- **FastAPI OpenAPI Docs:** http://localhost:8000/docs
- **PostgreSQL Database:** localhost:5432

To stop all containers:
```powershell
docker compose down
```

---

#### 3. Option B: Run Services Locally (Development Mode)

##### Step 1: Backend Server (Node.js + Prisma)
The backend uses SQLite by default for zero-setup local execution:

```powershell
cd server
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```
The Node.js server starts at `http://localhost:5000`.

*Note: To switch between SQLite and PostgreSQL locally, run:*
```powershell
npm run db:use-postgres   # Configures schema for PostgreSQL
npm run db:use-sqlite     # Configures schema for SQLite
```

##### Step 2: AI Microservice (Python FastAPI)
In a separate terminal window from the project root:

```powershell
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies and spaCy language model
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Launch the FastAPI service
uvicorn ai_service.main:app --reload --port 8000
```
The AI service starts at `http://localhost:8000` (API documentation accessible at `/docs`).

##### Step 3: Frontend Client (React + Vite)
In a third terminal window from the project root:

```powershell
npm install
npm run dev
```
The frontend dev server starts at `http://localhost:5173`.

---

## Environment Variables

Configure the following variables in your `.env` file located in the root directory:

```env
# ── Server Configuration ─────────────────────────────────────
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# ── Database Connection ──────────────────────────────────────
# Default for local development: SQLite
DATABASE_URL="file:./dev.db"
# For production or Docker: PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/hireiq?schema=public"

# ── JWT Authentication ───────────────────────────────────────
# Generate secure, high-entropy 64-character strings for production
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# ── AI Services ──────────────────────────────────────────────
# Optional: Live Google Gemini API Key (if omitted, service runs in heuristic fallback)
GEMINI_API_KEY=your_gemini_api_key_here

# ── Python AI Microservice Configuration ─────────────────────
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_WORKERS=2
AI_SERVICE_CORS_ORIGINS=http://localhost:5173,http://localhost:5000,http://localhost:80
INTERNAL_API_KEY=your_optional_internal_service_token
```

---

## Available Scripts

### Root Project (`/`)

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server on port 5173 |
| `npm run build` | Builds production-optimized frontend bundle into `dist/` |
| `npm run preview` | Previews the production frontend build locally |
| `npm run lint` | Runs `oxlint` code analysis across frontend files |
| `npm run server:dev` | Runs the Node.js backend in development mode |
| `npm run server:test` | Runs the Vitest automated test suite for the backend |
| `npm run server:seed` | Re-seeds the backend database with default roles and skills |
| `npm run server:use-postgres` | Switches Prisma schema provider to PostgreSQL |
| `npm run server:use-sqlite` | Switches Prisma schema provider to SQLite |

### Backend (`/server`)

| Command | Action |
|---|---|
| `npm run dev` | Runs backend via Node with hot environment reloading |
| `npm run test` | Executes backend Vitest unit & integration test suites |
| `npm run db:generate` | Generates Prisma Client from current schema |
| `npm run db:push` | Pushes schema definition directly to database |
| `npm run db:seed` | Populates database with default roles, skills, and admin accounts |
| `npm run db:clean` | Removes test accounts and restores clean system state |

### AI Microservice (`/ai_service`)

| Command | Action |
|---|---|
| `pytest` | Runs Python unit and integration test suite |
| `uvicorn ai_service.main:app --port 8000` | Launches the FastAPI ASGI service |

---

## Key API Endpoints

### Node.js REST API (Port 5000)

- `GET  /api/health` — Service health probe and database connectivity check
- `POST /api/auth/register` — Register a candidate or recruiter account
- `POST /api/auth/login` — Authenticate credentials and issue JWT access token
- `POST /api/auth/refresh` — Refresh expired access token using refresh token
- `GET  /api/candidates` — Fetch candidate list with filtering, sorting, and pagination
- `PATCH /api/candidates/:id/status` — Update candidate status (`SHORTLISTED`, `REJECTED`, etc.)
- `GET  /api/jobs` — Retrieve all active job requisitions
- `POST /api/jobs` — Create new job requisition with custom criteria
- `GET  /api/analytics/dashboard` — Retrieve aggregate hiring pipeline statistics
- `POST /api/resumes/upload` — Upload resume file (PDF/DOCX) for extraction and analysis
- `GET  /api/skills` — Fetch organization skill benchmarks and taxonomy

### Python AI Microservice (Port 8000)

- `GET  /health` — Microservice liveness check
- `GET  /ready` — Microservice readiness check (validates parser and model initialization)
- `POST /api/v1/resume/analyze` — Parse resume document, extract skills, and generate ATS score
- `POST /api/v1/resume/match` — Match candidate resume profile against target job description
- `POST /api/v1/chat/message` — Context-aware AI copilot conversation completion

---

## Testing

### Backend Unit & Integration Tests
Run automated Vitest suites covering authentication, candidate workflows, job applications, and skill evaluations:

```powershell
cd server
npm test
```

### AI Microservice Tests
Run automated Pytest suites verifying health probes, parsing services, and response validation:

```powershell
pytest
```

---

## Known Limitations

- **OCR for Scanned Resumes:** The default resume parser uses native text extraction (`pdf-parse`, `pypdf`, `python-docx`). Scanned image-only PDFs require the optional Tesseract OCR binary to be installed on the host system (pre-configured in the Dockerfile).
- **Gemini API Rate Quotas:** Free-tier Google Gemini API keys are subject to Google's requests-per-minute (RPM) limits. The system automatically switches to deterministic scoring heuristics if the API quota is exceeded or unavailable.

---

## License

This project is licensed under the [MIT License](LICENSE).
