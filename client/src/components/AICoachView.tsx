/**
 * AICoachView — Explainable AI Carbon Coaching Panel
 *
 * Renders personalised sustainability recommendations from the Gemini AI
 * with full explainability: reasoning, behavioural insights, reduction
 * methods, sustainability impact, and step-by-step action plans.
 *
 * Falls back gracefully when recommendations come from the rule engine.
 */
import React, { useState } from "react";
import { Recommendation } from "../types/index.js";
import {
  BrainCircuit,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Leaf,
  Zap,
  BadgeCheck,
} from "lucide-react";

interface AICoachViewProps {
  recommendations: Recommendation[];
  loading: boolean;
  onRefresh: () => void;
  onCommitToGoal: (rec: Recommendation) => void;
}

const CONFIDENCE_COLORS = {
  high: "var(--accent-emerald)",
  medium: "var(--accent-amber)",
  low: "var(--accent-rose)",
};

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case "transportation": return "🚲";
    case "food": return "🌿";
    case "energy": return "⚡";
    case "waste": return "♻️";
    default: return "🌱";
  }
};

export const AICoachView: React.FC<AICoachViewProps> = ({
  recommendations,
  loading,
  onRefresh,
  onCommitToGoal,
}) => {
  const [committedIds, setCommittedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleCommit = (rec: Recommendation) => {
    onCommitToGoal(rec);
    setCommittedIds((prev) => {
      const next = new Set(prev);
      next.add(rec.id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAiPowered = recommendations.some((r) => r.aiGenerated);

  return (
    <div className="dashboard-grid" id="coach-panel" role="tabpanel" aria-labelledby="tab-coach">
      {/* ── Header Banner ─────────────────────────────────────────────── */}
      <div
        className="col-12 glass-panel"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "var(--accent-emerald-glow)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <BrainCircuit size={28} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "4px" }}>AI Carbon Coach</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {isAiPowered
                ? "✨ Powered by Google Gemini Pro — personalised explainable coaching"
                : "Personalised insights from your 7-day activity analysis"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {isAiPowered && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "20px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#a5b4fc",
              }}
            >
              🤖 Gemini Pro
            </span>
          )}
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
      </div>

      {/* ── Recommendations ───────────────────────────────────────────── */}
      <div className="col-12" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }} className="glass-panel" aria-live="polite">
            <Sparkles size={40} style={{ color: "var(--accent-emerald)", marginBottom: "16px" }} className="pulse-animation" />
            <h3 style={{ marginBottom: "8px" }}>AI Coach is analysing your footprint...</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "420px", margin: "0 auto" }}>
              Evaluating transport choices, meal patterns, energy usage, and waste habits. Generating personalised explainable recommendations.
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px" }} className="glass-panel">
            <ShieldAlert size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h3 style={{ marginBottom: "8px" }}>No recommendations yet</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Click "Refresh Insights" to let the AI Coach analyse your logs and generate personalised suggestions.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
            {recommendations.map((rec) => {
              const isCommitted = committedIds.has(rec.id);
              const isExpanded = expandedIds.has(rec.id);
              const hasExplainability = rec.reasoning || rec.actionableSteps?.length;
              const confColor = rec.confidence ? CONFIDENCE_COLORS[rec.confidence] : CONFIDENCE_COLORS.medium;

              return (
                <div
                  key={rec.id}
                  className={`glass-panel advice-card advice-${rec.category}`}
                  style={{ display: "flex", flexDirection: "column" }}
                  role="article"
                  aria-label={`Recommendation: ${rec.title}`}
                >
                  {/* Card Header */}
                  <div className="advice-header">
                    <span className={`advice-badge badge-${rec.category}`}>
                      {getCategoryEmoji(rec.category)} {rec.category}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {rec.confidence && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: confColor }}>
                          ● {rec.confidence} confidence
                        </span>
                      )}
                      <span className="advice-saving">Save {rec.potentialSaving} kg CO₂</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h3 style={{ fontSize: "1.1rem", margin: "10px 0 8px" }}>{rec.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px" }}>
                    {rec.content}
                  </p>

                  {/* ── Explainability Panel ─────────────────── */}
                  {hasExplainability && (
                    <>
                      <button
                        onClick={() => toggleExpand(rec.id)}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          marginBottom: "12px",
                          width: "100%",
                        }}
                        aria-expanded={isExpanded}
                        aria-controls={`explain-${rec.id}`}
                      >
                        <Lightbulb size={14} style={{ color: "var(--accent-amber)" }} />
                        {isExpanded ? "Hide" : "Show"} AI Reasoning & Action Plan
                        {isExpanded ? <ChevronUp size={14} style={{ marginLeft: "auto" }} /> : <ChevronDown size={14} style={{ marginLeft: "auto" }} />}
                      </button>

                      {isExpanded && (
                        <div
                          id={`explain-${rec.id}`}
                          style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}
                          aria-label="AI Explanation Details"
                        >
                          {/* Reasoning */}
                          {rec.reasoning && (
                            <div style={{ background: "rgba(99,102,241,0.08)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(99,102,241,0.15)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <BrainCircuit size={13} style={{ color: "#a5b4fc" }} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>Why This Recommendation</span>
                              </div>
                              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{rec.reasoning}</p>
                            </div>
                          )}

                          {/* Behaviour Insight */}
                          {rec.behaviourInsight && (
                            <div style={{ background: "rgba(245,158,11,0.08)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(245,158,11,0.15)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <Zap size={13} style={{ color: "var(--accent-amber)" }} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-amber)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Behaviour Insight</span>
                              </div>
                              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{rec.behaviourInsight}</p>
                            </div>
                          )}

                          {/* Reduction Method */}
                          {rec.reductionMethod && (
                            <div style={{ background: "rgba(16,185,129,0.08)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(16,185,129,0.15)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <Target size={13} style={{ color: "var(--accent-emerald)" }} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reduction Method</span>
                              </div>
                              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{rec.reductionMethod}</p>
                            </div>
                          )}

                          {/* Sustainability Impact */}
                          {rec.sustainabilityImpact && (
                            <div style={{ background: "rgba(52,211,153,0.06)", borderRadius: "8px", padding: "12px", border: "1px solid rgba(52,211,153,0.12)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <Leaf size={13} style={{ color: "#6ee7b7" }} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sustainability Impact</span>
                              </div>
                              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{rec.sustainabilityImpact}</p>
                            </div>
                          )}

                          {/* Actionable Steps */}
                          {rec.actionableSteps && rec.actionableSteps.length > 0 && (
                            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "12px", border: "1px solid var(--border-color)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                                <BadgeCheck size={13} style={{ color: "#93c5fd" }} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actionable Steps</span>
                              </div>
                              <ol style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                {rec.actionableSteps.map((step, i) => (
                                  <li key={i} style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Commit Button */}
                  <button
                    className={`btn ${isCommitted ? "btn-secondary" : "btn-primary"}`}
                    style={{ width: "100%", justifyContent: "center", marginTop: "auto", pointerEvents: isCommitted ? "none" : "auto" }}
                    onClick={() => handleCommit(rec)}
                    disabled={isCommitted}
                    aria-label={isCommitted ? `Already committed to goal: ${rec.title}` : `Commit to goal: ${rec.title}`}
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

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.12); }
        }
        .pulse-animation { animation: pulse 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
