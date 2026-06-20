# Prompt Evolution

## Overview

This document traces the evolution of prompts used throughout the EcoTrack AI development process — both the prompts used to direct the Antigravity AI agent and the prompts embedded in the application itself for Gemini AI features.

---

## Part 1: Agent Development Prompts

### Phase 1 — Initial Project Specification

**Prompt v1 (Initial):**
> "Build a complete production-ready web application called EcoTrack AI. Build a Carbon Footprint Awareness Platform that helps individuals track daily environmental impact..."

**Outcome:** Successfully bootstrapped fullstack app with Express backend, React frontend, Prisma/SQLite, Docker. Core features functional.

**Gap identified:** No Google Cloud services, no real AI, weak documentation.

---

### Phase 2 — Audit and Upgrade Direction

**Prompt v2 (Upgrade Direction):**
> "Perform a complete repository audit and upgrade the project so that it maximises scoring against the competition evaluation framework. Focus on: Real Gemini AI integration, Firebase Auth, Cloud Run deployment, Explainable AI output, Carbon Forecasting."

**Outcome:** Created comprehensive implementation plan with dual-DB strategy and graceful fallback architecture.

**Key refinement:** The agent proposed the graceful fallback pattern (rule engine when no API key) — human approved as the optimal approach for judged demos.

---

### Phase 3 — Specific Feature Direction

**Prompt v3 (Feature Focus):**
> "The AI Carbon Coach must be explainable — providing reasoning, impact, benefits. The app must support forecasting (7/30/monthly)."

**Outcome:** Gemini service with structured explainability fields (reasoning, behaviourInsight, reductionMethod, sustainabilityImpact, actionableSteps).

---

## Part 2: Gemini Feature Prompts (Embedded in Application)

### AI Coach Prompt — Evolution

**v1 (Early draft):**
```
Generate sustainability recommendations for a user with these emissions:
- Transportation: X kg CO2
- Food: Y kg CO2
Return a list of tips.
```
**Problem:** Free-text output, inconsistent format, no quantitative savings estimates.

---

**v2 (Structured JSON):**
```
Generate 4 sustainability recommendations as JSON:
[{"category": "...", "title": "...", "content": "...", "potentialSaving": 0}]
```
**Problem:** Gemini sometimes wrapped JSON in markdown code blocks (`\`\`\`json`), causing JSON.parse failures.

---

**v3 (Current — production):**
```
You are an expert sustainability coach AI analysing a user's carbon footprint data.

User Activity Summary (last 7 days):
- Total activities logged: X
- Total CO₂ emissions: X.XX kg
- Transportation: X.XX kg CO₂ (N activities)
[...full category breakdown...]
- Top activity types: [type (Nx), ...]

Generate exactly 4 personalised, explainable sustainability recommendations in STRICT JSON format.
Each recommendation must be specific to this user's data patterns.

Return ONLY a JSON array with this exact structure:
\`\`\`json
[
  {
    "category": "transportation|food|energy|waste",
    "title": "Short, actionable title (max 8 words)",
    "content": "Specific 2-sentence coaching message referencing the user's actual data",
    "potentialSaving": <number: estimated kg CO₂ saved per week>,
    "reasoning": "Why this recommendation was generated based on the data patterns",
    "behaviourInsight": "What this data reveals about the user's current habits",
    "reductionMethod": "Specific method or technology to achieve the reduction",
    "sustainabilityImpact": "Broader environmental benefit beyond CO₂",
    "actionableSteps": ["Step 1", "Step 2", "Step 3"],
    "confidence": "high|medium|low"
  }
]
\`\`\`

Rules:
- Base every insight on the actual numbers provided
- If a category has 0 emissions, suggest preventative behaviours
- Prioritise the highest-emission categories
- Make actionableSteps concrete and achievable within 7 days
```

**Key improvements in v3:**
1. **Persona** — "expert sustainability coach AI" sets the tone
2. **Actual data injection** — all metrics included in prompt context
3. **Explicit constraint** — "STRICT JSON format", "exactly 4", "max 8 words"
4. **Schema enforcement** — full type annotations including union types for enums
5. **Business rules** — prevent empty-category recommendations, prioritisation logic
6. **Robustness** — response parsed with regex to handle markdown code block wrappers

---

### Forecast Prompt — Evolution

**v1 (Simple):**
```
Forecast my carbon emissions for the next 7 days based on: avg=8 kg/day.
```
**Problem:** Generic output, not grounded in actual user data.

---

**v2 (Current — production):**
```
You are a carbon footprint forecasting AI. Analyse the emission trend and forecast future emissions.

Historical Daily Emissions (most recent 14 days):
  2026-06-13: 12.450 kg CO₂
  2026-06-14: 8.200 kg CO₂
  [...]

Average daily emissions: 9.832 kg CO₂/day
Forecast window: 7 days
User's daily emission target: 6.500 kg CO₂

Generate a 7-day emission forecast using trend analysis.
Identify if the user is improving, stable, or worsening.

Return ONLY valid JSON matching this structure:
\`\`\`json
{
  "projectedTotalKgCO2": <number>,
  "dailyBreakdown": [
    { "date": "YYYY-MM-DD", "projectedKgCO2": <number>, "confidence": <0-1> }
  ],
  "goalAchievementProbability": <0-100 percentage>,
  "trend": "improving|stable|worsening",
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}
\`\`\`

Rules:
- dailyBreakdown must have exactly 7 entries starting from tomorrow
- Apply realistic trend modelling (linear + noise)
- goalAchievementProbability should be 50 if no target is set
- insights must reference actual data patterns observed
```

**Key improvements:**
1. **Real time-series data** injected per user
2. **Target-aware** probability calculation
3. **Structured output** with confidence intervals per day
4. **Validated rules** preventing hallucinated baselines

---

## Key Prompt Engineering Lessons

| Lesson | Application |
|--------|-------------|
| Always inject actual data | All prompts include real user metrics |
| Specify output format explicitly | JSON schema with types, not just "return JSON" |
| Use code fences in the expected output | Prevents Gemini from adding extra prose |
| Add explicit rules section | Handles edge cases (no data, zero categories) |
| Parse defensively | Regex extraction handles markdown-wrapped JSON |
| Use personas | "expert sustainability coach" improves response quality |
