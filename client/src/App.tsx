import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar.js";
import { DashboardView } from "./components/DashboardView.js";
import { TrackerView } from "./components/TrackerView.js";
import { AnalyticsView } from "./components/AnalyticsView.js";
import { GoalsView } from "./components/GoalsView.js";
import { AICoachView } from "./components/AICoachView.js";
import { EducationHubView } from "./components/EducationHubView.js";
import { AchievementsView } from "./components/AchievementsView.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { api } from "./services/api.js";
import { Activity, Goal, Achievement, Recommendation, EducationHubFact, DashboardSummary } from "./types/index.js";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [facts, setFacts] = useState<EducationHubFact[]>([]);
  
  // Loading flags
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [loadingCoach, setLoadingCoach] = useState(true);
  const [loadingFacts, setLoadingFacts] = useState(true);

  // Toast Queue
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Initial Boot loader
  useEffect(() => {
    refreshSummary();
    refreshActivities();
    refreshGoals();
    refreshAchievements();
    refreshCoachAdvice();
    refreshEducationFacts();
  }, []);

  const refreshSummary = async () => {
    try {
      setLoadingSummary(true);
      const data = await api.getSummary();
      setSummary(data);
    } catch (e: any) {
      console.error(e);
      addToast(e.message || "Failed to load dashboard summary data", "error");
    } finally {
      setLoadingSummary(false);
    }
  };

  const refreshActivities = async () => {
    try {
      const data = await api.getActivities();
      setActivities(data);
    } catch (e: any) {
      console.error(e);
    }
  };

  const refreshGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (e: any) {
      console.error(e);
    }
  };

  const refreshAchievements = async () => {
    try {
      setLoadingAchievements(true);
      const data = await api.getAchievements();
      setAchievements(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const refreshCoachAdvice = async () => {
    try {
      setLoadingCoach(true);
      const data = await api.getCoachAdvice();
      setRecommendations(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingCoach(false);
    }
  };

  const refreshEducationFacts = async () => {
    try {
      setLoadingFacts(true);
      const data = await api.getEducationFacts();
      setFacts(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingFacts(false);
    }
  };

  // Adding Activities
  const handleAddActivity = async (payload: {
    category: "transportation" | "food" | "energy" | "waste";
    type: string;
    amount: number;
    date: string;
  }) => {
    try {
      const response = await api.createActivity(payload);
      addToast(`Logged ${payload.type} activity successfully!`, "success");
      
      // Notify if any badge got unlocked
      if (response.unlockedBadges && response.unlockedBadges.length > 0) {
        response.unlockedBadges.forEach((badgeName) => {
          addToast(`🏆 Achievement Unlocked: ${badgeName}!`, "success");
        });
        refreshAchievements();
      }

      // Re-trigger global sync
      refreshSummary();
      refreshActivities();
      refreshGoals();
      refreshCoachAdvice();
    } catch (e: any) {
      addToast(e.message || "Failed to log activity", "error");
    }
  };

  // Deleting Activities
  const handleDeleteActivity = async (id: string) => {
    try {
      await api.deleteActivity(id);
      addToast("Activity log removed successfully.", "info");
      refreshSummary();
      refreshActivities();
      refreshGoals();
      refreshCoachAdvice();
    } catch (e: any) {
      addToast(e.message || "Failed to delete activity", "error");
    }
  };

  // Adding Goals
  const handleAddGoal = async (payload: {
    title: string;
    description: string;
    category: "transportation" | "food" | "energy" | "waste" | "overall";
    targetValue: number;
    unit: string;
    deadline: string;
  }) => {
    try {
      await api.createGoal(payload);
      addToast(`Goal "${payload.title}" created.`, "success");
      refreshSummary();
      refreshGoals();
    } catch (e: any) {
      addToast(e.message || "Failed to create goal", "error");
    }
  };

  // Deleting Goals
  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      addToast("Goal removed.", "info");
      refreshSummary();
      refreshGoals();
    } catch (e: any) {
      addToast(e.message || "Failed to delete goal", "error");
    }
  };

  // Committing AI recommendations directly to goals
  const handleCommitRecommendation = async (rec: Recommendation) => {
    try {
      // Calculate target date (7 days from now)
      const targetDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const payload = {
        title: rec.title,
        description: rec.content,
        category: rec.category as any,
        targetValue: rec.potentialSaving,
        unit: "kg CO2",
        deadline: targetDeadline,
      };

      await api.createGoal(payload);
      addToast(`Committed! Added target "${rec.title}" to active goals.`, "success");
      refreshSummary();
      refreshGoals();
    } catch (e: any) {
      addToast(e.message || "Failed to convert recommendation to goal", "error");
    }
  };

  // Render Panel Views
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            summary={summary}
            loading={loadingSummary}
            onTabChange={setActiveTab}
            onDeleteActivity={handleDeleteActivity}
          />
        );
      case "tracker":
        return (
          <TrackerView
            activities={activities}
            onAddActivity={handleAddActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        );
      case "analytics":
        return <AnalyticsView activities={activities} />;
      case "goals":
        return (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        );
      case "coach":
        return (
          <AICoachView
            recommendations={recommendations}
            loading={loadingCoach}
            onRefresh={refreshCoachAdvice}
            onCommitToGoal={handleCommitRecommendation}
          />
        );
      case "education":
        return <EducationHubView facts={facts} loading={loadingFacts} />;
      case "achievements":
        return <AchievementsView unlockedAchievements={achievements} loading={loadingAchievements} />;
      default:
        return <p>Section Not Found</p>;
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* Skip-link for screen reader keyboard accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Global Navigation */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="main-content" id="main-content" tabIndex={-1}>
          {renderTabContent()}
        </main>

        {/* Dynamic Float Notification Toasts */}
        <div className="toast-container" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast">
              {toast.type === "error" ? (
                <AlertCircle size={18} style={{ color: "var(--accent-rose)" }} />
              ) : (
                <CheckCircle2 size={18} style={{ color: "var(--accent-emerald)" }} />
              )}
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
