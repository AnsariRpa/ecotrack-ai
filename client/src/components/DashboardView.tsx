import React from "react";
import { DashboardSummary } from "../types/index.js";
import { Trash2, ShieldAlert, Award, Footprints, Sparkles, PlusCircle } from "lucide-react";

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onTabChange: (tab: string) => void;
  onDeleteActivity: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  loading,
  onTabChange,
  onDeleteActivity,
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }} aria-live="polite">
        <p style={{ color: "var(--text-secondary)" }}>Analyzing your environmental footprint...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }} className="glass-panel">
        <ShieldAlert size={48} style={{ color: "var(--accent-rose)", marginBottom: "16px" }} />
        <h3>Failed to load dashboard summary</h3>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Please make sure the database is pre-seeded and running correctly.
        </p>
      </div>
    );
  }

  const { scores, rating, goals, badgeCount, recentActivities } = summary;

  // Rating descriptions
  const ratingDetails: Record<string, { label: string; desc: string }> = {
    A: { label: "Climate Champion", desc: "Your footprint matches the sustainable global targets (< 12 kg CO2eq/day)." },
    B: { label: "Eco Conscious", desc: "Great effort! Slightly above optimal targets but below average (12-22 kg CO2eq/day)." },
    C: { label: "Moderate Impact", desc: "Your footprint matches average household emissions (22-35 kg CO2eq/day)." },
    D: { label: "High Impact", desc: "Significant opportunities exist to reduce emissions (35-50 kg CO2eq/day)." },
    E: { label: "Heavy Footprint", desc: "Exceeds daily sustainable averages (> 50 kg CO2eq/day). Try switching commutes!" },
  };

  const currentRating = ratingDetails[rating] || ratingDetails["C"];

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "transportation": return "🚲";
      case "food": return "🌿";
      case "energy": return "⚡";
      case "waste": return "🗑️";
      default: return "🌱";
    }
  };

  return (
    <div className="dashboard-grid" id="dashboard-panel" role="tabpanel" aria-labelledby="tab-dashboard">
      {/* 1. Header Banner */}
      <div className="col-12 glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "4px" }}>
            Welcome back, <span className="gradient-text">Jane Doe</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Here is your carbon footprint breakdown and weekly sustainability summary.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onTabChange("tracker")}
          aria-label="Log new activity"
        >
          <PlusCircle size={18} />
          Log New Activity
        </button>
      </div>

      {/* 2. Metrics Cards Row */}
      <div className="col-12 metrics-row">
        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span>DAILY IMPACT</span>
            <Footprints size={16} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div className="metric-value">{scores.daily}</div>
          <div className="metric-unit">kg CO2eq logged today</div>
          <div className="metric-footer">
            <span style={{ color: "var(--accent-emerald)" }}>Target: &lt;15 kg</span>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span>WEEKLY IMPACT</span>
            <Footprints size={16} style={{ color: "var(--accent-blue)" }} />
          </div>
          <div className="metric-value">{scores.weekly}</div>
          <div className="metric-unit">kg CO2eq past 7 days</div>
          <div className="metric-footer">
            <span>Avg: {(scores.weekly / 7).toFixed(1)} kg / day</span>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span>MONTHLY IMPACT</span>
            <Footprints size={16} style={{ color: "var(--accent-amber)" }} />
          </div>
          <div className="metric-value">{scores.monthly}</div>
          <div className="metric-unit">kg CO2eq past 30 days</div>
          <div className="metric-footer">
            <span>Equivalent to {Math.round(scores.monthly * 0.045)} trees planted</span>
          </div>
        </div>
      </div>

      {/* 3. Rating & Goals Widget */}
      <div className="col-8 glass-panel" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px", flexWrap: "wrap" }}>
          <div className={`rating-circle rating-${rating}`} aria-label={`Sustainability Rating: ${rating}`}>
            {rating}
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "4px" }}>{currentRating.label} Rating</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{currentRating.desc}</p>
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Weekly Sustainability Goals</h3>
            <span style={{ fontSize: "0.9rem", color: "var(--accent-emerald)", fontWeight: 600 }}>
              {goals.percentage}% Completed
            </span>
          </div>
          <div className="progress-container" aria-label={`Goals progress: ${goals.percentage}%`}>
            <div
              className="progress-bar progress-emerald"
              style={{ width: `${goals.percentage}%` }}
            ></div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "6px" }}>
            You have completed <strong>{goals.completed}</strong> out of <strong>{goals.total}</strong> active targets.
          </p>
          <button
            className="btn btn-secondary"
            style={{ marginTop: "12px", padding: "6px 12px", fontSize: "0.8rem" }}
            onClick={() => onTabChange("goals")}
          >
            Manage Goals
          </button>
        </div>
      </div>

      {/* 4. Achievements Mini Panel */}
      <div className="col-4 glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", justifySelf: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Badges & Milestones</h3>
            <Award size={20} style={{ color: "var(--accent-amber)" }} />
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Keep logging sustainable activities to unlock rare badges!
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "10px 0" }}>
            {badgeCount > 0 ? (
              Array.from({ length: Math.min(3, badgeCount) }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--accent-emerald-glow)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem"
                  }}
                  title="Unlocked badge"
                >
                  {i === 0 ? "🌿" : i === 1 ? "🚲" : "⚡"}
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No badges unlocked yet.</p>
            )}
          </div>
        </div>
        <button
          className="btn btn-secondary"
          style={{ width: "100%", padding: "8px", fontSize: "0.8rem" }}
          onClick={() => onTabChange("achievements")}
        >
          View All {badgeCount} Badges
        </button>
      </div>

      {/* 5. Recent Logs List */}
      <div className="col-8 glass-panel">
        <h3 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Recent Activity Logs</h3>
        {recentActivities.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No activities logged in this period.</p>
        ) : (
          <div className="activity-list">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-info">
                  <div className={`activity-icon-container bg-${act.category}`}>
                    {getCategoryEmoji(act.category)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", textTransform: "capitalize" }}>
                      {act.type} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 400 }}>({act.amount} {act.unit})</span>
                    </h4>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(act.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: act.carbonTons > 0 ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                    {act.carbonTons > 0 ? `+${act.carbonTons}` : act.carbonTons} kg CO2eq
                  </span>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "6px" }}
                    onClick={() => onDeleteActivity(act.id)}
                    aria-label={`Delete ${act.type} activity`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. AI Carbon Coach Quick Tip widget */}
      <div className="col-4 glass-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Sparkles size={20} style={{ color: "var(--accent-emerald)" }} />
            <h3 style={{ fontSize: "1.1rem" }}>AI Coach Insights</h3>
          </div>
          <div
            className="advice-card advice-energy"
            style={{
              padding: "12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-color)",
              borderLeft: "4px solid var(--accent-emerald)",
              borderRadius: "0 8px 8px 0"
            }}
          >
            <h4 style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "4px" }}>
              Swap Beef with Poultry
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", lineHeight: 1.4 }}>
              Beef generates 3x the carbon of chicken. Swapping just one serving saves up to 4.8 kg CO2eq.
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "10px", fontSize: "0.85rem", marginTop: "16px" }}
          onClick={() => onTabChange("coach")}
        >
          Open AI Carbon Coach
        </button>
      </div>
    </div>
  );
};
