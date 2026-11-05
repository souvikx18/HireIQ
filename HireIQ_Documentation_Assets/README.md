# HireIQ Documentation Assets & Academic Deliverables

**Project Name:** HireIQ  
**Project Title:** AI Resume Scanning and Skill Gapping  
**Team Name:** ERROR 404  
**Academic Year:** 2026–2027  
**Submission Version:** 2.4.0 (Enterprise Academic Edition)

---

## Deliverables Summary

This directory contains the complete technical documentation and visual assets for the HireIQ Project-Based Learning (PBL) submission:

1. **`HireIQ_PBL_Report.docx`** (1.99 MB)  
   - Complete, editable Microsoft Word academic submission document formatted to university standards (A4, 1-inch margins, custom academic styles, cover page, bonafide certificate, declaration, abstract, table of contents, 15 complete chapters, testing tables, references, and appendices).
   - Contains all 13 real application screenshots embedded directly with formal captions and cross-references.

2. **`HireIQ_PBL_Report.pdf`** (2.38 MB)  
   - Final, publication-ready PDF document compiled with high-fidelity typography, vector-sharp diagrams, and embedded visual figures.

3. **`HireIQ_Documentation_Assets/screenshots/`**  
   - High-resolution (1440x900) PNG captures directly taken from the running HireIQ platform:
     - `fig01_hireiq_landing_page.png` — HireIQ Public Landing Page & AI Talent Acquisition Portal
     - `fig02_authentication_portal.png` — Role-Based Authentication Interface with Quick Demo Selector
     - `fig03_recruiter_dashboard.png` — Recruiter Executive Talent Console & Real-Time Operational Telemetry
     - `fig04_resume_upload_engine.png` — Multi-Format AI Resume Ingestion & PDF Parser Interface
     - `fig05_candidate_database.png` — Candidate Management Table & Pipeline Stage Lifecycle Inventory
     - `fig06_job_roles_management.png` — Corporate Job Roles & Competency Architecture Console
     - `fig07_skill_gap_analysis.png` — Workforce Skill Gap Analysis & Deficit Distribution Console
     - `fig08_reports_analytics.png` — Recruitment Analytics & Date-Filtered Executive Report Generator
     - `fig09_settings_skill_benchmarks.png` — Company Hiring Criteria & Skill Benchmark Threshold Manager
     - `fig10_settings_security_audit.png` — Admin Security Center & Immutable System Audit Trail Log
     - `fig11_candidate_dashboard.png` — Candidate Career Console & Real-Time ATS Readiness Dashboard
     - `fig12_candidate_resume_checker.png` — Candidate Split-View ATS Resume Auditor & Compliance Inspector
     - `fig13_ai_chatbot_modal.png` — Integrated AI Career Copilot & Real-Time Interview Guidance Assistant

---

## System Architecture at a Glance

- **Presentation Layer:** React 19.2 + Vite 8.3 Single-Page Application (Port 5173)
- **Application Gateway:** Node.js 24 + Express 4.21 REST API (Port 5000)
- **AI Processing Microservice:** Python 3.14 + FastAPI 0.135 + Google Gemini 2.5 Flash API (Port 8000)
- **Persistence Layer:** Prisma ORM 6.4 with dynamic SQLite (`dev.db`) and PostgreSQL support

