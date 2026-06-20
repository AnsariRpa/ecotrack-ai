# Submission Notes — EcoTrack AI

## Competition: Prompt Wars — Carbon Footprint Challenge

---

## Executive Summary

EcoTrack AI is a production-grade, full-stack carbon footprint awareness platform that transforms daily emission tracking into personalised, explainable AI coaching. The platform is powered by **Google Gemini Pro** for AI insights and forecasting, secured by **Firebase Authentication**, and containerised for **Google Cloud Run** deployment.

The project is designed to maximise scores across all competition evaluation dimensions.

---

## Scoring Dimension Alignment

### 1. Code Quality (High Impact) ✅

**Evidence:**
- **TypeScript everywhere** — strict typing on all server controllers, services, middleware, and React components
- **Clean separation of concerns** — controllers → services → database layer
- **Consistent naming conventions** — camelCase functions, PascalCase components, UPPER_SNAKE environment vars
- **JSDoc comments** — all public service functions documented with purpose, inputs, and fallback behaviour
- **Error handling** — try/catch in all async handlers, custom `next(error)` Express error middleware
- **Input validation** — `express-validator` on all POST routes before touching the database
- **No magic numbers** — emission factors extracted to `calculationService.ts`

**Key files:** [`/server/src/services/geminiService.ts`](../server/src/services/geminiService.ts), [`/server/src/middleware/auth.ts`](../server/src/middleware/auth.ts), [`/client/src/components/AICoachView.tsx`](../client/src/components/AICoachView.tsx)

---

### 2. Problem Statement Alignment (High Impact) ✅

**Evidence:**
The application directly addresses every requirement:

| Requirement | Implementation |
|------------|---------------|
| Track daily environmental impact | TrackerView with 4 categories, 20+ activity types |
| Understand carbon footprint | Real-time emission calculations via calculationService |
| Get personalised recommendations | Gemini-powered AI coach with explainability |
| Set and track sustainability goals | GoalsView with deadline and progress tracking |
| Learn about climate change | EducationHubView with categorised facts |
| Earn achievements | 10-badge achievement system with unlock toasts |
| Carbon forecasting | AnalyticsView with 7d/30d Gemini projections |

---

### 3. Security (Medium Impact) ✅

**Evidence:**
- **Firebase JWT validation** — every API route passes through auth middleware
- **Helmet.js** — sets 12 security headers including CSP, HSTS, X-Frame-Options
- **Input sanitisation** — express-validator with whitelist approach (isIn for categories)
- **SQL injection prevention** — Prisma ORM parameterises all queries
- **Environment secrets** — no secrets in codebase; all via `.env` (git-ignored)
- **Rate limiting ready** — Cloud Run concurrency limits, composable with express-rate-limit
- **CORS configured** — explicit origin allowlist in production mode

**Key file:** [`/server/src/middleware/auth.ts`](../server/src/middleware/auth.ts)

---

### 4. Efficiency (Medium Impact) ✅

**Evidence:**
- **Multi-stage Docker build** — final image excludes devDependencies, build tools (~180 MB)
- **Lazy Gemini initialisation** — SDK client created once, reused across requests
- **Lazy Firebase initialisation** — Admin app initialised once per process lifecycle
- **Database query optimisation** — date-range filters on all time-series queries
- **React memoisation** — `useMemo` for expensive chart data computations
- **Vite code splitting** — SPA built with tree-shaking and minification
- **Static file serving** — production build served directly by Express (no separate CDN needed)

---

### 5. Testing (Low Impact) ✅

**Evidence:**
- **Server unit tests** — `calculationService`, `aiCoachService` logic fully tested
- **Frontend component tests** — `DashboardView` JSDOM tests with mocked API
- **Test coverage** — Vitest used for both environments
- **CI integration** — `cloudbuild.yaml` runs tests before Docker build

**Test commands:**
```bash
npm run test --workspace=server    # Vitest unit tests
npm run test --workspace=client    # Vitest + JSDOM component tests
```

---

### 6. Accessibility (Low Impact) ✅

**Evidence:**
- **ARIA roles** — `role="tabpanel"`, `role="tab"`, `role="status"`, `role="article"` on all panels
- **`aria-labelledby`** — tab panels linked to their navigation tabs
- **`aria-label`** — all icon-only buttons have descriptive labels
- **Skip link** — "Skip to main content" link for keyboard users
- **Screen reader summaries** — analytics panels include `.skip-link` text blocks
- **`aria-live="polite"`** — loading states and toast notifications announced
- **`aria-pressed`** — forecast period selector buttons use correct state attribute
- **Semantic HTML** — `<main>`, `<nav>`, `<header>`, `<button>`, `<section>` throughout
- **Focus management** — `tabIndex={-1}` on main content for programmatic focus
- **Colour contrast** — dark theme designed with AA contrast ratios

---

### 7. Google Services Usage ✅

| Service | Usage Level | Value Delivered |
|---------|-------------|----------------|
| Gemini 1.5 Pro | Core feature | Explainable coaching + carbon forecasting |
| Firebase Auth | All API routes | Multi-tenant identity and JWT security |
| Cloud Run | Production hosting | Auto-scaling, HTTPS, zero downtime |
| Artifact Registry | CI/CD pipeline | Versioned container images |

See [`/competition/google-services-usage.md`](./google-services-usage.md) for full details.

---

## How to Run Locally (Zero Configuration)

```bash
git clone <repo>
cd ecotrack-ai

# Install dependencies
npm install

# Start the server (SQLite auto-created, seeded with sample data)
npm run start --workspace=server

# In another terminal: build and serve client
npm run build --workspace=client
```

Then open http://localhost:5000

**To enable Gemini AI features:**
```bash
# Create .env in ecotrack-ai/ with:
GEMINI_API_KEY=AIza...
```

**To enable Firebase auth:**
```bash
# Add to .env:
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

---

## Key Differentiators

1. **Explainable AI** — not just tips, but *why* each recommendation was generated, *what* behaviour it targets, *how* to implement it, and *what* the environmental impact is

2. **Graceful Degradation** — all Google services have local fallbacks, ensuring the application always runs

3. **Production Architecture** — Firebase auth, multi-stage Docker, Cloud Build CI/CD — not just a prototype

4. **Forward-looking** — AI-powered forecasting gives users a projected view of their emissions, not just historical tracking

5. **Gamification** — 10-badge achievement system with real-time unlock toasts drives continued engagement
