import { DashboardSummary, Activity, Goal, Achievement, Recommendation, EducationHubFact } from "../types/index.js";

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const errMsg = payload?.error?.message || payload?.errors?.[0]?.message || "API request failed";
    throw new Error(errMsg);
  }

  // Handle case where we delete and response does not contain data field, but returns general body
  if (payload.data === undefined) {
    return payload as T;
  }

  return payload.data as T;
}

export const api = {
  // Summary
  getSummary: (): Promise<DashboardSummary> => fetchJson<DashboardSummary>("/summary"),

  // Activities
  getActivities: (category?: string): Promise<Activity[]> => {
    const url = category ? `/activities?category=${category}` : "/activities";
    return fetchJson<Activity[]>(url);
  },
  createActivity: (
    activity: Omit<Activity, "id" | "userId" | "carbonTons" | "createdAt" | "unit">
  ): Promise<{ data: Activity; unlockedBadges: string[] }> => {
    return fetchJson<{ data: Activity; unlockedBadges: string[] }>("/activities", {
      method: "POST",
      body: JSON.stringify(activity),
    });
  },
  deleteActivity: (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>(`/activities/${id}`, {
      method: "DELETE",
    });
  },

  // Goals
  getGoals: (): Promise<Goal[]> => fetchJson<Goal[]>("/goals"),
  createGoal: (
    goal: Omit<Goal, "id" | "userId" | "currentValue" | "isCompleted" | "createdAt">
  ): Promise<Goal> => {
    return fetchJson<Goal>("/goals", {
      method: "POST",
      body: JSON.stringify(goal),
    });
  },
  deleteGoal: (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>(`/goals/${id}`, {
      method: "DELETE",
    });
  },

  // Achievements
  getAchievements: (): Promise<Achievement[]> => fetchJson<Achievement[]>("/achievements"),

  // AI Carbon Coach Recommendations
  getCoachAdvice: (): Promise<Recommendation[]> => fetchJson<Recommendation[]>("/coach/advice"),

  // Education Hub Facts
  getEducationFacts: (category?: string): Promise<EducationHubFact[]> => {
    const url = category ? `/education?category=${category}` : "/education";
    return fetchJson<EducationHubFact[]>(url);
  },
};
