import React, { useState, useEffect } from "react";
import { Activity } from "../types/index.js";
import { Calendar, PlusCircle, Trash2, ShieldAlert } from "lucide-react";

interface TrackerViewProps {
  activities: Activity[];
  onAddActivity: (activity: {
    category: "transportation" | "food" | "energy" | "waste";
    type: string;
    amount: number;
    date: string;
  }) => void;
  onDeleteActivity: (id: string) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  activities,
  onAddActivity,
  onDeleteActivity,
}) => {
  const [category, setCategory] = useState<"transportation" | "food" | "energy" | "waste">("transportation");
  const [type, setType] = useState("car");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [estimatedEmissions, setEstimatedEmissions] = useState(0);

  // Replicated emission factors for frontend live calculation
  const factors: Record<string, Record<string, { factor: number; unit: string }>> = {
    transportation: {
      car: { factor: 0.18, unit: "km" },
      bike: { factor: 0.0, unit: "km" },
      bus: { factor: 0.08, unit: "km" },
      train: { factor: 0.04, unit: "km" },
      flight: { factor: 0.25, unit: "km" },
      walking: { factor: 0.0, unit: "km" },
    },
    food: {
      vegetarian: { factor: 1.2, unit: "meals" },
      vegan: { factor: 0.6, unit: "meals" },
      poultry: { factor: 2.4, unit: "meals" },
      beef: { factor: 7.2, unit: "meals" },
      seafood: { factor: 3.1, unit: "meals" },
    },
    energy: {
      electricity: { factor: 0.45, unit: "kWh" },
      ac: { factor: 0.8, unit: "hours" },
      appliance: { factor: 0.2, unit: "hours" },
    },
    waste: {
      recycling: { factor: -0.5, unit: "kg" },
      general: { factor: 1.0, unit: "kg" },
      composting: { factor: -0.2, unit: "kg" },
    },
  };

  // Sync default type when category changes
  useEffect(() => {
    const firstType = Object.keys(factors[category])[0];
    setType(firstType);
    setAmount("");
    setError("");
  }, [category]);

  // Update live estimate on type/amount change
  useEffect(() => {
    if (amount === "" || isNaN(amount) || amount <= 0) {
      setEstimatedEmissions(0);
      return;
    }
    const rate = factors[category][type]?.factor || 0;
    const est = amount * rate;
    setEstimatedEmissions(Math.round(est * 100) / 100);
  }, [category, type, amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (amount === "" || isNaN(amount) || amount <= 0) {
      setError("Please enter a positive numeric value for amount");
      return;
    }

    onAddActivity({
      category,
      type,
      amount: parseFloat(amount.toString()),
      date,
    });

    setAmount("");
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "transportation": return "🚲";
      case "food": return "🌿";
      case "energy": return "⚡";
      case "waste": return "🗑️";
      default: return "🌱";
    }
  };

  const currentUnit = factors[category][type]?.unit || "";

  // Filter activities matching the current active category
  const filteredActivities = activities.filter((act) => act.category === category);

  return (
    <div className="dashboard-grid" id="tracker-panel" role="tabpanel" aria-labelledby="tab-tracker">
      {/* Form Card */}
      <div className="col-6 glass-panel">
        <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Log Daily Activities</h3>
        
        {/* Category Selector Tabs */}
        <div className="tabs-header">
          {(["transportation", "food", "energy", "waste"] as const).map((cat) => (
            <button
              key={cat}
              className={`tab-link ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
              type="button"
            >
              <span style={{ marginRight: "4px" }}>{getCategoryEmoji(cat)}</span>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "10px", borderRadius: "8px", color: "var(--accent-rose)", display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <ShieldAlert size={16} />
              <span style={{ fontSize: "0.85rem" }}>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="activity-type" className="form-label">Activity Type</label>
            <select
              id="activity-type"
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {Object.keys(factors[category]).map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="activity-amount" className="form-label">
              Amount ({currentUnit})
            </label>
            <input
              id="activity-amount"
              type="number"
              step="any"
              className="form-control"
              placeholder={`Enter amount in ${currentUnit}...`}
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="activity-date" className="form-label">Date</label>
            <div style={{ position: "relative" }}>
              <input
                id="activity-date"
                type="date"
                className="form-control"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Live CO2 calculation estimator */}
          <div
            style={{
              background: estimatedEmissions > 0 ? "rgba(239, 68, 68, 0.05)" : "rgba(16, 185, 129, 0.05)",
              border: `1px dashed ${estimatedEmissions > 0 ? "var(--accent-rose)" : "var(--accent-emerald)"}`,
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "20px",
              textAlign: "center"
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              Est. Carbon Footprint
            </p>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-display)", color: estimatedEmissions > 0 ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
              {estimatedEmissions > 0 ? `+${estimatedEmissions}` : estimatedEmissions} kg CO2eq
            </span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <PlusCircle size={18} />
            Log Activity
          </button>
        </form>
      </div>

      {/* History Card */}
      <div className="col-6 glass-panel">
        <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Category Logs</h3>
        {filteredActivities.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            No activities logged under {category} yet. Use the form to add one.
          </p>
        ) : (
          <div className="activity-list" style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
            {filteredActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className="activity-info">
                  <div className={`activity-icon-container bg-${category}`}>
                    {getCategoryEmoji(category)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.9rem", textTransform: "capitalize" }}>
                      {act.type} <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>({act.amount} {act.unit})</span>
                    </h4>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                      {new Date(act.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: act.carbonTons > 0 ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                    {act.carbonTons > 0 ? `+${act.carbonTons}` : act.carbonTons} kg
                  </span>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "6px" }}
                    onClick={() => onDeleteActivity(act.id)}
                    aria-label={`Delete activity`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
