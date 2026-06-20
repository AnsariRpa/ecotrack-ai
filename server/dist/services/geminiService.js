/**
 * GeminiService - Google Gemini AI Integration for EcoTrack AI
 *
 * Provides:
 *  1. Explainable AI coaching recommendations via Gemini Pro
 *  2. Carbon emission forecasting (7-day and 30-day projections)
 *
 * Falls back gracefully to rule-based logic when GEMINI_API_KEY is absent,
 * ensuring zero-config local execution while demonstrating production GCP usage.
 */
// ── Lazy Gemini Client Initialisation ───────────────────────────────────────
let genAI = null; // eslint-disable-line @typescript-eslint/no-explicit-any
async function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        return null;
    if (!genAI) {
        try {
            // Dynamic import to avoid hard crash when package not present in minimal builds
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            genAI = new GoogleGenerativeAI(apiKey);
            console.log("[GeminiService] Gemini AI client initialised successfully.");
        }
        catch (err) {
            console.warn("[GeminiService] Failed to initialise Gemini client:", err);
            return null;
        }
    }
    return genAI;
}
// ── Explainable AI Recommendations ──────────────────────────────────────────
/**
 * Generates explainable, personalised sustainability coaching recommendations
 * using Google Gemini Pro. Returns structured JSON with detailed reasoning,
 * behavioural insights, and actionable steps for each tip.
 *
 * Falls back to deterministic rule engine when API key is not configured.
 */
export async function generateExplainableRecommendations(activities) {
    const client = await getGeminiClient();
    if (!client) {
        console.log("[GeminiService] No API key – using rule-based fallback.");
        return generateFallbackRecommendations(activities);
    }
    try {
        const activitySummary = buildActivitySummary(activities);
        const prompt = buildCoachPrompt(activitySummary);
        const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Extract JSON from code block if present
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const jsonText = jsonMatch[1] ?? text;
        const parsed = JSON.parse(jsonText.trim());
        // Mark every recommendation as AI-generated and validate shape
        return parsed
            .slice(0, 4)
            .map((rec) => ({ ...rec, aiGenerated: true }))
            .filter((r) => r.category && r.title && r.content);
    }
    catch (error) {
        console.error("[GeminiService] Recommendation generation failed:", error);
        return generateFallbackRecommendations(activities);
    }
}
function buildActivitySummary(activities) {
    const catTotals = {
        transportation: { kgCO2: 0, count: 0 },
        food: { kgCO2: 0, count: 0 },
        energy: { kgCO2: 0, count: 0 },
        waste: { kgCO2: 0, count: 0 },
    };
    const typeCounts = {};
    activities.forEach((a) => {
        const cat = catTotals[a.category];
        if (cat) {
            cat.kgCO2 += a.carbonTons;
            cat.count += 1;
        }
        typeCounts[a.type] = (typeCounts[a.type] ?? 0) + 1;
    });
    return {
        totalActivities: activities.length,
        totalKgCO2: activities.reduce((s, a) => s + a.carbonTons, 0),
        categoryBreakdown: catTotals,
        topActivityTypes: Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count })),
        periodDays: 7,
    };
}
function buildCoachPrompt(summary) {
    return `You are an expert sustainability coach AI analysing a user's carbon footprint data.

User Activity Summary (last ${summary.periodDays} days):
- Total activities logged: ${summary.totalActivities}
- Total CO₂ emissions: ${summary.totalKgCO2.toFixed(2)} kg
- Transportation: ${summary.categoryBreakdown.transportation.kgCO2.toFixed(2)} kg CO₂ (${summary.categoryBreakdown.transportation.count} activities)
- Food: ${summary.categoryBreakdown.food.kgCO2.toFixed(2)} kg CO₂ (${summary.categoryBreakdown.food.count} activities)
- Energy: ${summary.categoryBreakdown.energy.kgCO2.toFixed(2)} kg CO₂ (${summary.categoryBreakdown.energy.count} activities)
- Waste: ${summary.categoryBreakdown.waste.kgCO2.toFixed(2)} kg CO₂ (${summary.categoryBreakdown.waste.count} activities)
- Top activity types: ${summary.topActivityTypes.map((t) => `${t.type} (${t.count}x)`).join(", ")}

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
    "sustainabilityImpact": "Broader environmental benefit beyond CO₂ (biodiversity, water, etc.)",
    "actionableSteps": ["Step 1", "Step 2", "Step 3"],
    "confidence": "high|medium|low"
  }
]
\`\`\`

Rules:
- Base every insight on the actual numbers provided
- If a category has 0 emissions, suggest preventative behaviours
- Prioritise the highest-emission categories
- Make actionableSteps concrete and achievable within 7 days`;
}
// ── Carbon Forecasting ───────────────────────────────────────────────────────
/**
 * Uses Gemini AI to analyse historical emission trends and generate
 * data-driven carbon forecasts for 7-day and 30-day windows.
 */
export async function generateCarbonForecast(activities, forecastDays = 7, targetKgCO2PerDay) {
    const client = await getGeminiClient();
    if (!client) {
        return generateFallbackForecast(activities, forecastDays, targetKgCO2PerDay);
    }
    try {
        const historicalData = buildHistoricalTimeSeries(activities);
        const prompt = buildForecastPrompt(historicalData, forecastDays, targetKgCO2PerDay);
        const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
        const jsonText = jsonMatch[1] ?? text;
        const parsed = JSON.parse(jsonText.trim());
        return { ...parsed, aiGenerated: true, forecastDays };
    }
    catch (error) {
        console.error("[GeminiService] Forecast generation failed:", error);
        return generateFallbackForecast(activities, forecastDays, targetKgCO2PerDay);
    }
}
function buildHistoricalTimeSeries(activities) {
    const dailyMap = {};
    activities.forEach((act) => {
        const day = new Date(act.date).toISOString().split("T")[0];
        dailyMap[day] = (dailyMap[day] ?? 0) + act.carbonTons;
    });
    return Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, kgCO2]) => ({ date, kgCO2 }));
}
function buildForecastPrompt(history, forecastDays, targetKgCO2PerDay) {
    const historyText = history
        .slice(-14)
        .map((h) => `  ${h.date}: ${h.kgCO2.toFixed(3)} kg CO₂`)
        .join("\n");
    const avgDaily = history.length > 0 ? history.reduce((s, h) => s + h.kgCO2, 0) / history.length : 8.0;
    return `You are a carbon footprint forecasting AI. Analyse the emission trend and forecast future emissions.

Historical Daily Emissions (most recent 14 days):
${historyText || "  No historical data available – use global average of 8 kg/day"}

Average daily emissions: ${avgDaily.toFixed(3)} kg CO₂/day
Forecast window: ${forecastDays} days
${targetKgCO2PerDay ? `User's daily emission target: ${targetKgCO2PerDay} kg CO₂` : "No target set"}

Generate a ${forecastDays}-day emission forecast using trend analysis.
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
- dailyBreakdown must have exactly ${forecastDays} entries starting from tomorrow
- Apply realistic trend modelling (linear + noise)
- goalAchievementProbability should be 50 if no target is set
- insights must reference actual data patterns observed`;
}
// ── Rule-Based Fallback Implementations ─────────────────────────────────────
function generateFallbackRecommendations(activities) {
    const recommendations = [];
    const catTotals = { transportation: 0, food: 0, energy: 0, waste: 0 };
    activities.forEach((a) => {
        if (catTotals[a.category] !== undefined)
            catTotals[a.category] += a.carbonTons;
    });
    const carKm = activities
        .filter((a) => a.category === "transportation" && a.type === "car")
        .reduce((s, a) => s + a.amount, 0);
    if (carKm > 50) {
        recommendations.push({
            category: "transportation",
            title: "Switch to Public Transit",
            content: `You logged ${carKm.toFixed(0)} km by car this week. Public transport could cut your transit emissions by up to 60%.`,
            potentialSaving: Math.round(carKm * (0.18 - 0.08) * 100) / 100,
            reasoning: "Your car usage is significantly above the sustainable mobility threshold of 50 km/week.",
            behaviourInsight: "High single-occupancy vehicle use suggests routine car commuting or errands by car.",
            reductionMethod: "Use bus, metro, or tram for regular routes; reserve car for cargo-heavy or accessibility needs.",
            sustainabilityImpact: "Reduced particulate matter and NOx emissions improve urban air quality and public health.",
            actionableSteps: [
                "Identify your 3 most frequent car journeys",
                "Check public transit alternatives for each",
                "Try transit for 2 journeys this week",
            ],
            confidence: "high",
            aiGenerated: false,
        });
    }
    const beefCount = activities
        .filter((a) => a.category === "food" && a.type === "beef")
        .reduce((s, a) => s + a.amount, 0);
    if (beefCount >= 2) {
        recommendations.push({
            category: "food",
            title: "Replace 2 Beef Meals with Plant-Based",
            content: `You logged ${beefCount} beef meals. Beef emits ~27x more CO₂ than plant proteins — substituting just 2 meals makes a measurable impact.`,
            potentialSaving: Math.round(beefCount * (7.2 - 0.6) * 100) / 100,
            reasoning: `Beef production accounts for ${catTotals.food.toFixed(1)} kg of your food emissions this week.`,
            behaviourInsight: "Regular beef consumption is the single highest-impact dietary carbon factor.",
            reductionMethod: "Substitute with lentils, chickpeas, tofu, or mycoprotein alternatives like Quorn.",
            sustainabilityImpact: "Reduces methane emissions from livestock and land use for feed crops, protecting biodiversity.",
            actionableSteps: [
                "Plan 2 plant-based dinners for next week",
                "Try a lentil curry or tofu stir-fry",
                "Track the CO₂ saving in the app",
            ],
            confidence: "high",
            aiGenerated: false,
        });
    }
    const elecKwh = activities
        .filter((a) => a.category === "energy" && a.type === "electricity")
        .reduce((s, a) => s + a.amount, 0);
    if (elecKwh > 30) {
        recommendations.push({
            category: "energy",
            title: "Eliminate Standby 'Vampire' Power",
            content: `Your ${elecKwh.toFixed(0)} kWh electricity usage includes up to 10% from standby devices. Power strips with switches can eliminate this instantly.`,
            potentialSaving: Math.round(elecKwh * 0.1 * 100) / 100,
            reasoning: "Electricity usage exceeds the 30 kWh weekly efficiency threshold.",
            behaviourInsight: "High electricity logs suggest always-on devices or inefficient appliances.",
            reductionMethod: "Install smart power strips or use scheduled outlet timers for entertainment systems.",
            sustainabilityImpact: "Reduced peak demand lowers reliance on gas peaker plants that spike grid carbon intensity.",
            actionableSteps: [
                "Audit all devices left on standby",
                "Install a smart power strip on your TV/entertainment setup",
                "Enable sleep mode on all computers",
            ],
            confidence: "medium",
            aiGenerated: false,
        });
    }
    const generalWaste = activities
        .filter((a) => a.category === "waste" && a.type === "general")
        .reduce((s, a) => s + a.amount, 0);
    if (generalWaste > 3) {
        recommendations.push({
            category: "waste",
            title: "Start a Simple 3-Bin Sorting System",
            content: `You generated ${generalWaste.toFixed(1)} kg of general waste. Sorting into recyclables, organics, and landfill can divert 60% from landfill.`,
            potentialSaving: Math.round(generalWaste * 0.6 * 1.2 * 100) / 100,
            reasoning: "High general waste volume indicates mixed disposal — recyclables and organics are going to landfill.",
            behaviourInsight: "Most households dispose of 40-60% recyclable or compostable material as general waste.",
            reductionMethod: "Introduce a kitchen compost bin for food scraps and dedicated containers for plastic, glass, paper.",
            sustainabilityImpact: "Composting diverts organic methane from landfill; recycling reduces virgin material extraction.",
            actionableSteps: [
                "Place a small compost bin on your kitchen counter",
                "Add a second bin for plastic/glass recycling",
                "Check your local council's recycling guidelines",
            ],
            confidence: "high",
            aiGenerated: false,
        });
    }
    // Fill with sensible defaults for any missing categories so we always return 4
    const DEFAULTS = [
        {
            category: "transportation",
            title: "Walk or Cycle for Trips Under 3 km",
            content: "For short local trips, active travel produces zero emissions, saves fuel costs, and improves cardiovascular health.",
            potentialSaving: 2.5,
            reasoning: "Short car trips have disproportionate per-km emissions due to cold engine starts.",
            behaviourInsight: "Many daily errands are within easy walking or cycling distance.",
            reductionMethod: "Use Google Maps cycling or walking mode to plan active routes.",
            sustainabilityImpact: "Zero-emission travel reduces urban congestion and noise pollution.",
            actionableSteps: [
                "Identify your nearest grocery store walking distance",
                "Plan one cycling trip this week",
                "Invest in a lock and lights if cycling regularly",
            ],
            confidence: "medium",
            aiGenerated: false,
        },
        {
            category: "food",
            title: "Try a Plant-Based Meal This Week",
            content: "Plant-based meals produce up to 10× fewer emissions than beef. Even one meal swap per week compounds into meaningful annual savings.",
            potentialSaving: 4.2,
            reasoning: "Diet is responsible for about 26% of global greenhouse gas emissions.",
            behaviourInsight: "Most people eat meat at nearly every meal without considering lower-impact alternatives.",
            reductionMethod: "Explore lentil soups, bean burritos, or tofu stir-fries as high-protein meat alternatives.",
            sustainabilityImpact: "Plant-rich diets reduce land use, freshwater consumption, and biodiversity loss.",
            actionableSteps: [
                "Choose one evening this week for a plant-based dinner",
                "Browse a vegan recipe site for beginner-friendly ideas",
                "Log the swap in EcoTrack to see your CO₂ saving",
            ],
            confidence: "medium",
            aiGenerated: false,
        },
        {
            category: "energy",
            title: "Switch to LED Lighting Throughout Your Home",
            content: "LED bulbs use 75% less energy than incandescent and last 25× longer. Replacing 10 bulbs can save 200 kWh/year.",
            potentialSaving: 3.8,
            reasoning: "Lighting accounts for ~15% of household electricity use globally.",
            behaviourInsight: "Many homes still use inefficient halogen or incandescent bulbs.",
            reductionMethod: "Replace highest-use fixtures first — kitchen, living room, desk lamps.",
            sustainabilityImpact: "Reduced electricity demand lowers reliance on fossil-fuel peaker plants.",
            actionableSteps: [
                "Count non-LED bulbs in your home",
                "Purchase warm-white LED equivalents from a local hardware store",
                "Replace the 5 most-used fixtures this weekend",
            ],
            confidence: "medium",
            aiGenerated: false,
        },
        {
            category: "waste",
            title: "Start Composting Kitchen Food Scraps",
            content: "Food waste in landfill generates methane — 28× more potent than CO₂ over 100 years. A countertop compost bin takes 30 seconds to set up.",
            potentialSaving: 1.8,
            reasoning: "Food waste is the 3rd largest source of human-caused greenhouse gas emissions.",
            behaviourInsight: "The average household wastes 30% of the food it buys.",
            reductionMethod: "Use a sealed countertop bin for fruit/vegetable scraps; empty weekly to a council composting site.",
            sustainabilityImpact: "Compost returns nutrients to soil, reducing the need for synthetic fertilisers.",
            actionableSteps: [
                "Place a small bin next to your sink for scraps",
                "Find your nearest compost drop-off or garden bed",
                "Track waste reduction in the app this week",
            ],
            confidence: "low",
            aiGenerated: false,
        },
    ];
    for (const def of DEFAULTS) {
        if (recommendations.length >= 4)
            break;
        if (!recommendations.some((r) => r.category === def.category)) {
            recommendations.push(def);
        }
    }
    return recommendations.slice(0, 4);
}
function generateFallbackForecast(activities, forecastDays, targetKgCO2PerDay) {
    const dailyMap = {};
    activities.forEach((a) => {
        const day = new Date(a.date).toISOString().split("T")[0];
        dailyMap[day] = (dailyMap[day] ?? 0) + a.carbonTons;
    });
    const dailyValues = Object.values(dailyMap);
    const avgDaily = dailyValues.length > 0
        ? dailyValues.reduce((s, v) => s + v, 0) / dailyValues.length
        : 8.0; // global average
    // Compute simple linear trend
    const n = dailyValues.length;
    let trend = "stable";
    if (n >= 3) {
        const recent = dailyValues.slice(-Math.ceil(n / 2));
        const older = dailyValues.slice(0, Math.floor(n / 2));
        const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
        const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;
        if (recentAvg < olderAvg * 0.9)
            trend = "improving";
        else if (recentAvg > olderAvg * 1.1)
            trend = "worsening";
    }
    // Generate daily forecast with slight trend adjustment
    const trendFactor = trend === "improving" ? 0.97 : trend === "worsening" ? 1.03 : 1.0;
    const dailyBreakdown = Array.from({ length: forecastDays }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        const projectedKgCO2 = Math.max(0, avgDaily * Math.pow(trendFactor, i) + (Math.random() - 0.5) * avgDaily * 0.1);
        return {
            date: date.toISOString().split("T")[0],
            projectedKgCO2: Math.round(projectedKgCO2 * 100) / 100,
            confidence: Math.max(0.4, 0.9 - i * 0.02),
        };
    });
    const projectedTotalKgCO2 = dailyBreakdown.reduce((s, d) => s + d.projectedKgCO2, 0);
    let goalAchievementProbability = 50;
    if (targetKgCO2PerDay) {
        const projectedAvg = projectedTotalKgCO2 / forecastDays;
        const ratio = targetKgCO2PerDay / projectedAvg;
        goalAchievementProbability = Math.min(95, Math.max(5, Math.round(ratio * 50)));
    }
    return {
        forecastDays,
        projectedTotalKgCO2: Math.round(projectedTotalKgCO2 * 100) / 100,
        dailyBreakdown,
        goalAchievementProbability,
        trend,
        insights: [
            `Your average daily emission is ${avgDaily.toFixed(1)} kg CO₂ — ${avgDaily < 6 ? "below" : avgDaily < 10 ? "near" : "above"} the global average of 8 kg/day.`,
            trend === "improving"
                ? "Your emissions have been trending downward — keep it up!"
                : trend === "worsening"
                    ? "Your emissions are increasing. Consider reviewing recent high-impact activities."
                    : "Your emissions are relatively stable. Small changes now can create big reductions.",
            `Over the next ${forecastDays} days, you are projected to emit ${projectedTotalKgCO2.toFixed(1)} kg CO₂ total.`,
        ],
        aiGenerated: false,
    };
}
