# Google Services Usage Report

## Overview

EcoTrack AI integrates four core Google Cloud services to deliver a production-grade carbon footprint awareness platform. Each service is integrated with graceful fallback logic to ensure local development works without credentials, while demonstrating real cloud-native capability.

---

## 1. Google Gemini Pro (Generative AI)

**Service:** Gemini 1.5 Pro via `@google/generative-ai` SDK  
**Integration File:** [`/server/src/services/geminiService.ts`](../server/src/services/geminiService.ts)

### What It Does

#### Explainable AI Coaching
Gemini Pro analyses each user's 7-day activity log and generates structured JSON recommendations containing:
- **Reasoning** — why this specific tip was selected based on the data
- **Behaviour Insight** — what the user's behaviour pattern reveals
- **Reduction Method** — specific technology or approach to implement
- **Sustainability Impact** — environmental benefits beyond CO₂
- **Actionable Steps** — 3 concrete actions achievable within 7 days
- **Confidence Level** — high/medium/low based on data density

#### Carbon Forecasting
Gemini Pro analyses a 30-day historical emissions time series and projects future emissions:
- **7-day and 30-day projections** with daily breakdown
- **Trend classification** — improving / stable / worsening
- **Goal achievement probability** — percentage likelihood of hitting the user's target
- **Natural language insights** — 3 contextual observations about the user's pattern

### Prompt Engineering Strategy

The Gemini prompts are:
1. **Structured** — require JSON output with specific schema
2. **Data-grounded** — include actual user metrics in every prompt
3. **Constrained** — specify exact rules (4 recs, N forecast days, confidence levels)
4. **Error-resilient** — output is parsed with regex to extract JSON from markdown code blocks

### Fallback
When `GEMINI_API_KEY` is not set, `geminiService.ts` falls back to the deterministic rule-based engine in the same file, maintaining identical API contract.

---

## 2. Firebase Authentication

**Service:** Firebase Admin SDK  
**Integration File:** [`/server/src/middleware/auth.ts`](../server/src/middleware/auth.ts)

### What It Does

- Validates Firebase ID tokens from the `Authorization: Bearer <token>` header on every API route
- Extracts user identity (`uid`, `email`, `name`) from verified tokens
- Attaches `req.user` to all downstream controllers
- Supports **three credential modes** for different deployment environments:
  1. `FIREBASE_SERVICE_ACCOUNT_JSON` — full JSON credential
  2. `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` — individual variables
  3. Application Default Credentials — Cloud Run IAM-managed auth

### Fallback
When `FIREBASE_PROJECT_ID` is absent, the middleware attaches a deterministic developer user (`dev-user-001`) to all requests, enabling zero-config local development.

---

## 3. Google Cloud Run

**Service:** Cloud Run (Serverless Container Platform)  
**Integration Files:** [`/Dockerfile`](../Dockerfile), [`/cloudbuild.yaml`](../cloudbuild.yaml)

### What It Does

- Hosts the full-stack EcoTrack AI application as a **containerised service**
- Provides **automatic HTTPS**, load balancing, and auto-scaling to zero
- Manages environment secrets via Cloud Run's secret injection
- Integrates with Cloud Build for CI/CD on every repository push

### Dockerfile Design

The `Dockerfile` uses a **multi-stage build**:
1. **Stage 1 (`build-server`)** — compiles TypeScript server with `tsc`, generates Prisma client
2. **Stage 2 (`build-client`)** — compiles React/Vite SPA to static assets
3. **Stage 3 (`runner`)** — minimal production image serving compiled output

This produces a lean final image (~180 MB) with no build-time dependencies.

### Cloud Run Configuration

```yaml
# Recommended deployment settings
service: ecotrack-ai
platform: managed
region: us-central1
memory: 512Mi
cpu: 1
min-instances: 0
max-instances: 10
concurrency: 80
```

---

## 4. Google Artifact Registry

**Service:** Artifact Registry (Container Image Repository)  
**Integration File:** [`/cloudbuild.yaml`](../cloudbuild.yaml)

### What It Does

- Stores versioned Docker images built by Cloud Build
- Tagged with both commit SHA and `latest` for rollback capability
- Integrated with Cloud Run deployment pipeline for atomic releases

### Image Tagging Strategy

```
us-central1-docker.pkg.dev/${PROJECT_ID}/ecotrack-ai/app:latest
us-central1-docker.pkg.dev/${PROJECT_ID}/ecotrack-ai/app:${COMMIT_SHA}
```

---

## Google Services Integration Summary

| Service | SDK / API | Purpose | Fallback |
|---------|-----------|---------|---------|
| Gemini 1.5 Pro | `@google/generative-ai` | Explainable coaching + forecasting | Rule-based engine |
| Firebase Auth | `firebase-admin` | JWT token verification | Dev mock user |
| Cloud Run | `gcloud run deploy` | Production hosting | `npm run dev` |
| Artifact Registry | Docker + Cloud Build | Image versioning | Local Docker build |

---

## Business Value of Google Services

| Feature | Without Google | With Google |
|---------|---------------|-------------|
| AI Coaching | Static tips | Personalised, data-driven, explainable |
| Forecasting | None | 7/30-day trend projections with probability |
| Authentication | None | Multi-tenant Firebase identity |
| Deployment | Manual | Automated CI/CD, zero-downtime rollouts |
| Scalability | Single process | 0→∞ auto-scaling |

---

## Environment Variables Reference

```env
# Required for Gemini AI features
GEMINI_API_KEY=AIza...

# Required for Firebase Authentication
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# Alternative: Full service account JSON
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Database (local: SQLite, production: PostgreSQL)
DATABASE_URL=file:./dev.db
```
