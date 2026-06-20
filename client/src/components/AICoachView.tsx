import React, { useState } from "react";
import { Recommendation } from "../types/index.js";
import { BrainCircuit, Sparkles, RefreshCcw, CheckCircle2, ShieldAlert } from "lucide-react";

interface AICoachViewProps {
  recommendations: Recommendation[];
  loading: boolean;
  onRefresh: () => void;
  onCommitToGoal: (rec: Recommendation) => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  recommendations,
  loading,
  onRefresh,
  onCommitToGoal,
}) => {
  const [committedIds, setCommittedIds] = useState<Set<string>>(new Set());

  const handleCommit = (rec: Recommendation) => {
    onCommitToGoal(rec);
    setCommittedIds((prev) => {
      const next = new Set(prev);
      next.add(rec.id);
      return next;
    });
  };

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
    <div className="dashboard-grid" id="coach-panel" role="tabpanel" aria-labelledby="tab-coach">
      {/* 1. Header Banner */}
      <div className="col-12 glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "var(--accent-emerald-glow)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <BrainCircuit size={28} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>AI Carbon Coach</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Tailored suggestions generated from analyzing your recent 7-day logs.
            </p>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh coaching advice"
        >
          <RefreshCcw size={16} className={loading ? "spin-animation" : ""} />
          {loading ? "Analyzing..." : "Refresh Insights"}
        </button>
      </div>

      {/* 2. Insights List */}
      <div className="col-12" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }} className="glass-panel" aria-live="polite">
            <Sparkles size={36} style={{ color: "var(--accent-emerald)", marginBottom: "12px" }} className="pulse-animation" />
            <h3>AI Coach is analyzing your activity logs...</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
              Evaluating transit choices, meals, appliance usage, and waste diversion rates.
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }} className="glass-panel">
            <ShieldAlert size={36} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <h3>No carbon recommendations found</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
              Click "Refresh Insights" to let the AI Coach analyze your logs and generate suggestions.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {recommendations.map((rec) => {
              const isCommitted = committedIds.has(rec.id);
              return (
                <div
                  key={rec.id}
                  className={`glass-panel advice-card advice-${rec.category}`}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div className="advice-header">
                      <span className={`advice-badge badge-${rec.category}`}>
                        {getCategoryEmoji(rec.category)} {rec.category}
                      </span>
                      <span className="advice-saving">
                        Save {rec.potentialSaving} kg CO2eq
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", marginTop: "8px" }}>
                      {rec.title}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.45, marginBottom: "20px" }}>
                      {rec.content}
                    </p>
                  </div>

                  <button
                    className={`btn ${isCommitted ? "btn-secondary" : "btn-primary"}`}
                    style={{ width: "100%", justifyContent: "center", pointerEvents: isCommitted ? "none" : "auto" }}
                    onClick={() => handleCommit(rec)}
                  >
                    {isCommitted ? (
                      <>
                        <CheckCircle2 size={16} style={{ color: "var(--accent-emerald)" }} />
                        Committed to Goals
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Commit to Goal
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Embedded CSS for loading animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .pulse-animation {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
