import React from "react";
import { Achievement } from "../types/index.js";
import { Award, Lock, CheckCircle2 } from "lucide-react";

interface AchievementsViewProps {
  unlockedAchievements: Achievement[];
  loading: boolean;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ unlockedAchievements, loading }) => {
  // Predefined master list of system badges
  const masterBadges = [
    {
      code: "GREEN_COMMUTER",
      name: "Green Commuter",
      description: "Logged a walking, cycling, or train activity for 5 consecutive days.",
      icon: "🚲",
    },
    {
      code: "PLANT_PIONEER",
      name: "Plant-Based Pioneer",
      description: "Logged 10 vegan or vegetarian meals.",
      icon: "🌿",
    },
    {
      code: "ENERGY_SAVER",
      name: "Energy Saver",
      description: "Logged 10+ electricity activities keeping consumption under 300 kWh.",
      icon: "⚡",
    },
    {
      code: "ZERO_WASTE",
      name: "Zero Waste Hero",
      description: "Log at least 5 composting or recycling activities.",
      icon: "🗑️",
    },
  ];

  // Calculate points
  const pointsPerBadge = 500;
  const totalPoints = unlockedAchievements.length * pointsPerBadge;
  
  // Calculate Level
  let level = 1;
  if (unlockedAchievements.length >= 2) level = 2;
  if (unlockedAchievements.length >= 4) level = 3;

  const nextLevelBadgeTarget = level * 2;
  const levelProgress = Math.min(100, Math.round((unlockedAchievements.length / nextLevelBadgeTarget) * 100));

  return (
    <div className="dashboard-grid" id="achievements-panel" role="tabpanel" aria-labelledby="tab-achievements">
      {/* Gamification summary panel */}
      <div className="col-12 glass-panel" style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
        <div
          style={{
            background: "var(--accent-amber-glow)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--accent-amber)"
          }}
        >
          <Award size={40} style={{ color: "var(--accent-amber)" }} />
        </div>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h2 style={{ fontSize: "1.5rem" }}>Sustain Level {level}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>
            Earn points by logging habits and unlocking sustainability achievements.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="progress-container" style={{ flex: 1, height: "8px" }} aria-label={`Level Progress: ${levelProgress}%`}>
              <div className="progress-bar progress-amber" style={{ width: `${levelProgress}%` }}></div>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {unlockedAchievements.length} / {nextLevelBadgeTarget} Badges
            </span>
          </div>
        </div>
        <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-color)", paddingLeft: "24px" }} className="points-container">
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Score
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--accent-emerald)" }}>
            {totalPoints}
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Eco Points</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="col-12">
        <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Environmental Achievement Badges</h3>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }} aria-live="polite">
            <p style={{ color: "var(--text-secondary)" }}>Verifying achievements...</p>
          </div>
        ) : (
          <div className="badges-grid">
            {masterBadges.map((badge) => {
              const unlockedInfo = unlockedAchievements.find((u) => u.badgeCode === badge.code);
              const isUnlocked = !!unlockedInfo;

              return (
                <div key={badge.code} className={`badge-card ${isUnlocked ? "unlocked" : "locked"}`}>
                  <div className="badge-icon">
                    {badge.icon}
                  </div>
                  <h4 className="badge-name">{badge.name}</h4>
                  <p className="badge-desc">{badge.description}</p>
                  
                  <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem" }}>
                    {isUnlocked ? (
                      <>
                        <CheckCircle2 size={12} style={{ color: "var(--accent-emerald)" }} />
                        <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                          Unlocked {new Date(unlockedInfo.unlockedAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock size={12} style={{ color: "var(--text-muted)" }} />
                        <span style={{ color: "var(--text-muted)" }}>Locked</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .points-container {
            border-left: none !important;
            padding-left: 0 !important;
            margin-top: 10px;
            width: 100%;
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
};
