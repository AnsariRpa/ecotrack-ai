# EcoTrack AI 🌱

> **A production-grade AI-powered Carbon Footprint Awareness Platform**  
> Built with Google Gemini Pro, Firebase Authentication, and Google Cloud Run

[![Cloud Run](https://img.shields.io/badge/Google_Cloud-Cloud_Run-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_1.5_Pro-EA4335?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-F57C00?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Problem Statement

Individual actions account for **72% of global greenhouse gas emissions**, yet most people lack the tools to understand, track, and act on their personal carbon footprint. EcoTrack AI bridges this gap by turning raw activity data into **explainable, personalised sustainability coaching** powered by Google Gemini Pro.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Activity Tracker** | Log transportation, food, energy, and waste activities with real-time CO₂ calculation |
| 🤖 **AI Carbon Coach** | Google Gemini Pro generates explainable, personalised coaching with reasoning, behaviour insights, and actionable steps |
| 📈 **Carbon Forecasting** | AI-powered 7-day and 30-day emission projections with trend analysis and goal achievement probability |
| 🎯 **Goals System** | Set emission reduction goals with deadlines; convert AI recommendations to goals in one click |
| 🏆 **Achievements** | 10-badge gamification system with real-time unlock notifications |
| 📚 **Education Hub** | Science-backed climate facts categorised by topic |
| 🔒 **Firebase Auth** | Secure Firebase JWT authentication on all API routes |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Run                          │
│                                                              │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  React + Vite   │    │    Express + TypeScript       │   │
│  │  (Vite SPA)     │◄──►│    ├── Auth Middleware        │   │
│  │                 │    │    │   (Firebase Admin)        │   │
│  │  ├── Dashboard  │    │    ├── Coach Controller        │   │
│  │  ├── Tracker    │    │    │   └── GeminiService       │   │
│  │  ├── Analytics  │    │    ├── Analytics Controller    │   │
│  │  ├── AI Coach   │    │    │   └── GeminiService       │   │
│  │  └── Goals      │    │    └── Prisma ORM (SQLite)    │   │
│  └─────────────────┘    └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
             │                         │
     ┌───────▼────────┐       ┌────────▼────────┐
     │  Firebase Auth  │       │ Gemini 1.5 Pro  │
     │  (JWT verify)   │       │ (AI coaching +  │
     └────────────────┘       │  forecasting)   │
                               └─────────────────┘
```

---

## 🤖 Explainable AI — Powered by Google Gemini Pro

The AI Carbon Coach uses **Gemini 1.5 Pro** to analyse each user's activity data and generate structured, explainable recommendations:

```json
{
  "title": "Switch to Public Transit",
  "reasoning": "Your car usage (120 km) exceeds the sustainable mobility threshold",
  "behaviourInsight": "High single-occupancy vehicle use suggests routine car commuting",
  "reductionMethod": "Use bus or metro for regular routes; reserve car for cargo-heavy needs",
  "sustainabilityImpact": "Reduced NOx and particulate emissions improve urban air quality",
  "actionableSteps": [
    "Identify your 3 most frequent car journeys",
    "Check public transit alternatives for each",
    "Try transit for 2 journeys this week"
  ],
  "confidence": "high",
  "potentialSaving": 8.4
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Run Locally (Zero Configuration)

```bash
git clone <repository-url>
cd ecotrack-ai

# Install all dependencies
npm install

# Build and start
npm run build --workspace=server
npm run build --workspace=client
npm run start --workspace=server
```

Open [http://localhost:5000](http://localhost:5000)

### Enable Google AI Features

Create a `.env` file in the project root:

```env
# Enable Google Gemini AI coaching and forecasting
GEMINI_API_KEY=AIza...

# Enable Firebase Authentication
FIREBASE_PROJECT_ID=your-gcp-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

> **Without environment variables:** The app runs perfectly using the built-in rule-based engine and a developer mock user. Google service integration is demonstrated in the code but requires no mandatory configuration.

### Run with Docker

```bash
docker-compose up --build
```

---

## ☁️ Google Cloud Deployment

### Prerequisites

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

### Deploy to Cloud Run

```bash
# Build and push image
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_PROJECT_ID=YOUR_PROJECT_ID,_REGION=us-central1

# Deploy (set your secrets)
gcloud run deploy ecotrack-ai \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ecotrack-ai/app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=AIza...,FIREBASE_PROJECT_ID=..."
```

---

## 🧪 Testing

```bash
# Server unit tests (calculation engine, AI coach logic)
npm run test --workspace=server

# Client component tests (Dashboard, Tracker JSDOM)
npm run test --workspace=client
```

---

## 📁 Repository Structure

```
ecotrack-ai/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # All view components
│       ├── services/api.ts    # Typed REST client
│       └── types/index.ts     # Shared TypeScript types
├── server/                    # Express + Prisma backend
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── services/
│   │   │   ├── geminiService.ts   # Gemini AI integration
│   │   │   └── calculationService.ts
│   │   └── middleware/
│   │       ├── auth.ts        # Firebase Admin auth
│   │       └── validation.ts
│   └── prisma/
│       └── schema.prisma      # Database schema
├── competition/               # Competition documentation
│   ├── architecture.md
│   ├── google-services-usage.md
│   ├── tool-usage-report.md
│   ├── prompt-evolution.md
│   ├── human-vs-ai-responsibilities.md
│   └── submission-notes.md
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local development
├── cloudbuild.yaml            # Google Cloud Build CI/CD
└── .env.example               # Environment variable template
```

---

## 🔒 Security

- **Firebase JWT** — all API routes validate Bearer tokens via Firebase Admin SDK
- **Helmet.js** — 12 HTTP security headers including CSP and HSTS
- **Input validation** — express-validator with strict whitelist rules on all POST routes
- **SQL injection prevention** — Prisma ORM parameterises all queries
- **No secrets in code** — all credentials via environment variables (`.gitignore`d)

---

## ♿ Accessibility

WCAG 2.1 AA compliant:
- Semantic HTML5 (`<main>`, `<nav>`, `<button>`, `<section>`)
- ARIA roles and labels on all interactive elements
- Skip navigation link for keyboard users
- `aria-live` regions for dynamic content (toasts, loading states)
- Screen reader summaries on all chart panels

---

## 📊 Carbon Calculation Methodology

Emission factors sourced from IPCC AR6, EPA, and EU JRC databases:

| Category | Factor | Source |
|----------|--------|--------|
| Car travel | 0.18 kg CO₂/km | EPA 2023 |
| Flight | 0.255 kg CO₂/km | ICAO Carbon Calculator |
| Beef | 27 kg CO₂/kg | Poore & Nemecek 2018 |
| Electricity (grid) | 0.233 kg CO₂/kWh | IEA 2023 average |
| Natural gas | 2.0 kg CO₂/m³ | IPCC AR6 |

---

## 🏆 Competition Scorecard

| Dimension | Score Target | Implementation |
|-----------|-------------|---------------|
| Code Quality | High | TypeScript, clean architecture, JSDoc |
| Problem Alignment | High | All user journeys implemented |
| Security | Medium | Firebase Auth, Helmet, validation |
| Efficiency | Medium | Multi-stage Docker, lazy init, memoisation |
| Testing | Low | Vitest unit + JSDOM component tests |
| Accessibility | Low | WCAG 2.1 AA compliance |
| Google Services | Bonus | Gemini, Firebase, Cloud Run, Artifact Registry |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ and Google Cloud for Prompt Wars 2026*
