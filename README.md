# EcoTrack AI - Carbon Footprint Awareness & Behavior Change Platform

EcoTrack AI is a production-ready, fullstack Carbon Footprint Awareness Platform designed to empower individuals to track their daily environmental impact, understand their carbon footprint, visualize emission trends, receive personalized recommendations, and build environmentally responsible habits.

This project is built using a clean fullstack architecture with React/TypeScript on the frontend and Node/Express/Prisma/PostgreSQL on the backend, optimized for fast rendering, security, WCAG accessibility compliance, and single-container cloud deployment.

---

## 🏗️ Architecture Overview

The repository follows clean architecture principles, separating the UI layer, business/service logic, and database transactions:

```
ecotrack-ai/
├── client/                     # Frontend Application (Vite + React + TS)
│   ├── src/
│   │   ├── components/         # Reusable Accessible UI Views
│   │   ├── services/           # Typed Fetch API Wrapper
│   │   ├── types/              # Domain TypeScript Typings
│   │   ├── index.css           # Vanilla CSS Design System & Variables
│   │   └── __tests__/          # JSDOM Component Tests (Vitest)
│   ├── index.html              # Entry HTML with custom fonts & SEO
│   └── vite.config.ts          # Vite & Vitest configurations
│
├── server/                     # Backend API & DB Layer (Node.js + Express + TS)
│   ├── src/
│   │   ├── config/             # Configurable Emission Factors
│   │   ├── controllers/        # Express Request Handlers
│   │   ├── middleware/         # Input Validation & Secure Error Handlers
│   │   ├── routes/             # API Endpoints
│   │   ├── services/           # Calculation & Recommendation Engines
│   │   └── __tests__/          # Unit Test Suites (Vitest)
│   ├── prisma/                 # PostgreSQL Prisma Schema & Database Seeder
│   └── tsconfig.json           # Strict ESM TS Settings
│
├── Dockerfile                  # Multi-Stage Build serving Client via Express
├── docker-compose.yml          # Local orchestration (App + Postgres DB)
└── package.json                # Workspace script orchestrator
```

### Deployment Strategy
In production, the application runs inside a single Docker container. The React client compiles to static HTML/JS assets which are copied directly into the Express server's public directory and served statically. This design:
1. Eliminates Cross-Origin Resource Sharing (CORS) complexities.
2. Minimizes CPU/memory overhead by utilizing a single lightweight container.
3. Simplifies Cloud Run routing and orchestration.

---

## 🌟 Core Features

### 1. User Dashboard
* **Dynamic Impact Metrics:** Displays daily, weekly, and monthly carbon footprints in kilograms of CO2 equivalent (kg CO2eq).
* **Sustainability Rating:** A dynamic rating scale (A to E) based on weekly daily average footprint compared to sustainable targets.
* **Goal Indicators:** Shows progress rates across active targets.
* **Badges Grid:** Previews unlocked badges and total earned Eco Points.

### 2. Daily Activity Tracking
Users can log environmental activities across four core domains:
* **Transportation:** Car travel, cycling, bus, train, flights, and walking.
* **Food Habits:** Vegan, vegetarian, poultry, beef, and seafood meals.
* **Energy Consumption:** Electricity (kWh), Air Conditioning (hours), and appliances.
* **Waste & Recycling:** General waste disposal, sorted recyclables, and composting.

> [!TIP]
> **Live CO2 Estimation:** The Tracker input forms calculate and display the estimated carbon impact in real time before submission, educating the user on the consequences of their inputs immediately.

### 3. Recharts Analytics
* **Weekly Category Stack:** Renders stacked bar charts showing daily category emissions.
* **Category Contribution:** Renders a doughnut chart displaying the relative contribution of each category over the last 30 days.
* **Accessible Legends:** Charts are fully keyboard-navigable and contain textual screen-reader summaries.

### 4. AI Carbon Coach
* **Personalized Audits:** Processes user logs over the last 7 days to identify the highest emission areas.
* **Actionable Advice:** Generates custom tips with calculated potential carbon savings (e.g., swapping commute types or beef meals).
* **Goal Commitment:** Users can click "Commit to Goal" on any recommendation to instantly add a corresponding target and deadline to their active goals.

### 5. Education Hub
* **Searchable Repository:** Users can search and filter environmental facts and sustainability tips by category.
* **Trivia Block:** Features interactive did-you-know sustainability blocks detailing international climate targets.

### 6. Gamification & Achievements
* **Dynamic Badges:** Tracks milestones like *Green Commuter* (5 consecutive days of low-carbon transit) or *Plant-Based Pioneer* (10 plant meals logged).
* **Eco Points:** Unlocking badges awards points, elevating the user's sustainability level.

---

## ⚙️ Local Development Setup

### Prerequisites
* **Node.js:** v20.x or higher
* **PostgreSQL:** Running instance (or use Docker Compose)

### Running via Docker Compose (Recommended)
You can launch the entire stack (Database + Application) with a single command:
```bash
docker-compose up --build
```
The application will be accessible at [http://localhost:8080](http://localhost:8080).

### Manual Setup
1. **Install Root and Workspace Dependencies:**
   ```bash
   npm install
   ```
2. **Setup Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` to supply your local PostgreSQL database connection string.

3. **Prisma Setup & Seeding:**
   Run migrations and seed the database with mock activities, badges, and facts:
   ```bash
   npx prisma migrate dev --schema=server/prisma/schema.prisma
   npx prisma db seed --schema=server/prisma/schema.prisma
   ```

4. **Launch Dev Servers:**
   Launch both frontend (port 3000) and backend (port 5000) concurrently:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

The repository uses **Vitest** for testing:

* **Backend Unit Tests:** Validates carbon calculation equations and the AI Coach's recommendation rules:
  ```bash
  npm run test --workspace=server
  ```
* **Frontend Component Tests:** Renders components inside a JSDOM environment using React Testing Library to verify state updates:
  ```bash
  npm run test --workspace=client
  ```

---

## ☁️ Google Cloud Run Deployment

To deploy the application to Google Cloud Run:

1. **Enable Artifact Registry and Cloud Run:**
   ```bash
   gcloud services enable artifactregistry.googleapis.com run.googleapis.com
   ```
2. **Create Artifact Registry Repository:**
   ```bash
   gcloud artifacts repositories create ecotrack-repo \
       --repository-format=docker \
       --location=us-central1
   ```
3. **Build & Submit Container Image:**
   ```bash
   gcloud builds submit --tag us-central1-docker.pkg.dev/[PROJECT_ID]/ecotrack-repo/ecotrack-app:latest .
   ```
4. **Deploy to Cloud Run:**
   Supply database credentials as environment variables.
   ```bash
   gcloud run deploy ecotrack-app \
       --image us-central1-docker.pkg.dev/[PROJECT_ID]/ecotrack-repo/ecotrack-app:latest \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated \
       --set-env-vars="DATABASE_URL=postgresql://[DB_USER]:[DB_PASS]@[DB_HOST]/[DB_NAME]?sslmode=require,NODE_ENV=production"
   ```

---

## 🔒 Security & Accessibility Compliance

### Security Measures
* **Input Validation:** Endpoints validate input structure using `express-validator` to block corrupted data payloads.
* **SQL Injection & XSS Shield:** Prisma ORM parameterizes queries by default. XSS is mitigated via Helmet headers, safe DOM rendering practices in React, and script-source restrictions in the Content Security Policy (CSP).
* **Error Containment:** Global Express error middleware formats errors into clean JSON, hiding stack traces in production to prevent directory listing disclosures.

### Accessibility (WCAG 2.1 AA)
* **Semantic Layout:** Structured with HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<article>`).
* **ARIA Indicators:** Navigational tabs include `role="tablist"`, `role="tab"`, and `aria-selected` to reflect active views.
* **Keyboard Navigation:** An accessibility skip-link allows keyboard users to bypass navigation menus. Tab indices are defined for scrollable sections, and focused elements render with a high-contrast emerald outline (`:focus-visible`).
* **Color Contrast:** All texts, buttons, and badges meet the 4.5:1 WCAG contrast ratio against dark background slates.
