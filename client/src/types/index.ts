export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  category: "transportation" | "food" | "energy" | "waste";
  type: string;
  amount: number;
  unit: string;
  carbonTons: number; // Stored in kg CO2 equivalent
  date: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "transportation" | "food" | "energy" | "waste" | "overall";
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeCode: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  category: string;
  title: string;
  content: string;
  potentialSaving: number;
  isImplemented: boolean;
  createdAt: string;
  // Explainable AI fields (populated by Gemini or fallback engine)
  reasoning?: string;
  behaviourInsight?: string;
  reductionMethod?: string;
  sustainabilityImpact?: string;
  actionableSteps?: string[];
  confidence?: "high" | "medium" | "low";
  aiGenerated?: boolean;
}

export interface EducationHubFact {
  id: string;
  category: string;
  title: string;
  content: string;
  source?: string;
  createdAt: string;
}

export interface DashboardSummary {
  scores: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  rating: string;
  breakdown: Array<{ name: string; value: number }>;
  goals: {
    total: number;
    completed: number;
    percentage: number;
  };
  badgeCount: number;
  recentActivities: Activity[];
}

// ── Forecasting Types ────────────────────────────────────────────────────────

export interface DailyForecast {
  date: string;
  projectedKgCO2: number;
  confidence: number;
}

export interface CarbonForecast {
  forecastDays: number;
  projectedTotalKgCO2: number;
  dailyBreakdown: DailyForecast[];
  goalAchievementProbability: number;
  trend: "improving" | "stable" | "worsening";
  insights: string[];
  aiGenerated: boolean;
}

export interface ForecastResponse {
  forecast: CarbonForecast;
  activeGoal: {
    id: string;
    title: string;
    targetValue: number;
    unit: string;
    deadline: string;
  } | null;
  historicalDataPoints: number;
  analysedPeriodDays: number;
}
