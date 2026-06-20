import React, { useState } from "react";
import { Goal } from "../types/index.js";
import { Target, Calendar, PlusCircle, Trash2, ShieldAlert } from "lucide-react";

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: {
    title: string;
    description: string;
    category: "transportation" | "food" | "energy" | "waste" | "overall";
    targetValue: number;
    unit: string;
    deadline: string;
  }) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal, onDeleteGoal }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"transportation" | "food" | "energy" | "waste" | "overall">("transportation");
  const [targetValue, setTargetValue] = useState<number | "">("");
  const [unit, setUnit] = useState("km");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const handleCategoryChange = (cat: "transportation" | "food" | "energy" | "waste" | "overall") => {
    setCategory(cat);
    // Set default units based on category
    if (cat === "transportation") setUnit("km");
    else if (cat === "food") setUnit("meals");
    else if (cat === "energy") setUnit("kWh");
    else if (cat === "waste") setUnit("kg");
    else setUnit("kg CO2");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Please fill in the title and description");
      return;
    }
    if (targetValue === "" || isNaN(targetValue) || targetValue <= 0) {
      setError("Please enter a positive target threshold");
      return;
    }
    if (!deadline) {
      setError("Please select a target deadline");
      return;
    }
    if (new Date(deadline) <= new Date()) {
      setError("Deadline must be a future date");
      return;
    }

    onAddGoal({
      title,
      description,
      category,
      targetValue: parseFloat(targetValue.toString()),
      unit,
      deadline,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setTargetValue("");
    setDeadline("");
  };

  return (
    <div className="dashboard-grid" id="goals-panel" role="tabpanel" aria-labelledby="tab-goals">
      {/* 1. Goal Creator Form */}
      <div className="col-5 glass-panel">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Target size={20} style={{ color: "var(--accent-emerald)" }} />
          <h3>Create Sustainability Goal</h3>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "10px", borderRadius: "8px", color: "var(--accent-rose)", display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <ShieldAlert size={16} />
              <span style={{ fontSize: "0.85rem" }}>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="goal-title" className="form-label">Goal Title</label>
            <input
              id="goal-title"
              type="text"
              className="form-control"
              placeholder="e.g. Reduce Car Travel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="goal-desc" className="form-label">Description</label>
            <textarea
              id="goal-desc"
              rows={2}
              className="form-control"
              placeholder="Describe how you will achieve this target..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ resize: "none" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="goal-cat" className="form-label">Category</label>
            <select
              id="goal-cat"
              className="form-control"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
            >
              <option value="transportation">Transportation</option>
              <option value="food">Food Habits</option>
              <option value="energy">Energy Conservation</option>
              <option value="waste">Waste & Recycling</option>
              <option value="overall">Overall Carbon Footprint</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goal-target" className="form-label">
              Target Budget / Threshold ({unit})
            </label>
            <input
              id="goal-target"
              type="number"
              className="form-control"
              placeholder="e.g. 50"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value === "" ? "" : parseFloat(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="goal-deadline" className="form-label">Deadline</label>
            <input
              id="goal-deadline"
              type="date"
              className="form-control"
              value={deadline}
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <PlusCircle size={18} />
            Set Goal
          </button>
        </form>
      </div>

      {/* 2. Goals List */}
      <div className="col-7 glass-panel">
        <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Active & Completed Goals</h3>
        {goals.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            No goals defined yet. Use the form to set a sustainability target!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "550px", overflowY: "auto", paddingRight: "4px" }}>
            {goals.map((goal) => {
              // Standard progress computation
              const progressRatio = goal.targetValue > 0 ? goal.currentValue / goal.targetValue : 0;
              const percentage = Math.min(100, Math.round(progressRatio * 100));

              // Determine bar color theme
              const barColor = goal.isCompleted
                ? "progress-emerald"
                : goal.category === "transportation"
                ? "progress-blue"
                : goal.category === "food"
                ? "progress-rose"
                : "progress-amber";

              return (
                <div
                  key={goal.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "16px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "99px",
                          background: goal.isCompleted ? "var(--accent-emerald-glow)" : "rgba(255,255,255,0.05)",
                          color: goal.isCompleted ? "var(--accent-emerald)" : "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}
                      >
                        {goal.isCompleted ? "Completed" : "Active"}
                      </span>
                      <h4 style={{ fontSize: "1.05rem", marginTop: "6px" }}>{goal.title}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "2px" }}>
                        {goal.description}
                      </p>
                    </div>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "6px" }}
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label="Delete goal"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Progress tracker info */}
                  <div style={{ marginTop: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>
                        Progress: <strong>{goal.currentValue}</strong> / {goal.targetValue} {goal.unit}
                      </span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="progress-container" style={{ height: "6px" }}>
                      <div className={`progress-bar ${barColor}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "10px" }}>
                    <Calendar size={12} />
                    <span>Target Date: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
