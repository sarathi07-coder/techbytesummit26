# 🧪 ReagentWatch: AI-Powered Autonomous Secondary School Chemical Safety & Reagent Super-Tracker

> **Winner / Showcase Project for TechByte Summit 2026**  
> Autonomous Chemical Degradation Tracking, WebGL 3D Spatial Twin, PubChem Live Verification, Multi-tier Role Auth (Teacher ➔ Headmaster ➔ DEO), and LangGraph Human-In-The-Loop Safety System for Secondary School Laboratories.

---

## 🌟 Overview & Key Pillars

In secondary school laboratories across the district, hazardous chemical degradation (ether peroxide crystallization, deliquescence, container corrosion, pressure bulges) often goes unnoticed until dangerous accidents occur. **ReagentWatch** provides a complete end-to-end institutional safety network:

1. **Deterministic Chemistry Degradation Engine**:
   - Calculates real-time risk scores (0–100) combining humidity telemetry, power cut frequencies, seal condition, and post-open days.
   - Built-in peroxide formation timelines (Group A, B, C peroxide formers like Diethyl Ether, 2-Propanol, THF).
2. **WebGL 3D Spatial Digital Twin**:
   - Interactive Three.js 3D laboratory cabinet & shelf viewer with dynamic camera focus on flagged bottles, spatial coordinates, and spill lip warnings.
3. **Multimodal AI Vision Inspector**:
   - Google Gemini Vision analysis detecting peroxide crystal rims, cap bulges, fuming degradation, and discolored reagents.
4. **Algorithmic CAS Number Modulo-10 Checksum**:
   - Validates vendor reagent labeling and rejects counterfeit/fraudulent vendor chemicals before onboarding.
5. **Human-In-The-Loop (HITL) Safety Approvals via LangGraph**:
   - High-hazard quarantines and disposal workflows require role-based quorum authorization before execution.
6. **Zero-Cost Emergency WhatsApp Escalation Feed**:
   - Instant two-way dispatch links (`wa.me` native + OpenWA webhook integration) routing real-time crisis alerts to District Hazmat Officers and Fire Squads.
7. **3-Tier Institutional Role Hierarchy**:
   - **Science Teacher / Lab Custodian**: Daily inventory, barcode scanning, incident logging, and storage reassignments.
   - **Headmaster / Principal**: Quorum approvals, school compliance audit trails, and risk grading.
   - **District Hazmat Officer (DEO)**: Geospatial GPS hazard sweep, cross-school risk heatmaps, and priority disposal routes.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons + Canvas-Confetti
- **3D Graphics**: Three.js (WebGL 3D Cabinet & Bottle Digital Twin)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **AI Vision & Copilot**: Google Gemini 1.5 Pro / Flash & RAG SDS Safety Copilot
- **Live NIH Registry**: PubChem PUG REST API
- **Testing**: DevOps Verification Harness (`scripts/devops-test.sh`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- npm or pnpm

### 2. Installation
```bash
git clone https://github.com/sarathi07-coder/techbytesummit26.git
cd techbytesummit26
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your keys:
```bash
cp .env.example .env.local
```

Fill in:
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 4. Database Setup
Apply the schema in [docs/DATABASE_SCHEMA.sql](docs/DATABASE_SCHEMA.sql) to your Supabase SQL Editor:
- Creates `schools`, `chemical_bottles`, `degradation_events`, `lab_alerts`, and `langgraph_authorizations` tables.
- Seeds initial schools, bottles, and compatibility matrices.

### 5. Run the Application
```bash
# Start development server
npm run dev

# Or build & start production server
npm run build
npm run start
```
Visit `http://localhost:3000` in your browser.

---

## 🧪 DevOps & Verification Testing
Run the automated 12-point system verification test suite:
```bash
./scripts/devops-test.sh
```

---

## 👥 Contributors & Acknowledgements
- **Author**: Parthasarathi ([@sarathi07-coder](https://github.com/sarathi07-coder))
- Built for the **TechByte Summit 2026** Hackathon
