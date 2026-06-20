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
