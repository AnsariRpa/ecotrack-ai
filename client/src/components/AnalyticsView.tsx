import React, { useMemo } from "react";
import { Activity } from "../types/index.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, PieChart as PieIcon, ShieldAlert } from "lucide-react";

interface AnalyticsViewProps {
  activities: Activity[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ activities }) => {
  // 1. Process data for Stacked Bar Chart (past 7 days)
  const weeklyTrendData = useMemo(() => {
    const dataMap: Record<string, Record<string, number>> = {};
    const now = new Date();
    
    // Initialize past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { weekday: "short" });
      dataMap[dateString] = {
        transportation: 0,
        food: 0,
        energy: 0,
        waste: 0,
      };
    }

    // Populate with actual activities in the last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    activities.forEach((act) => {
      const actDate = new Date(act.date);
      if (actDate >= sevenDaysAgo) {
        const dayName = actDate.toLocaleDateString(undefined, { weekday: "short" });
        if (dataMap[dayName]) {
          // Keep waste carbon impact positive for stacking, or treat as offset.
          // Storing positive contribution to overall load is cleaner for stacked graphs.
          const val = Math.max(0, act.carbonTons);
          dataMap[dayName][act.category] = Math.round((dataMap[dayName][act.category] + val) * 10) / 10;
        }
      }
    });

    return Object.entries(dataMap).map(([date, categories]) => ({
      date,
      ...categories,
    }));
  }, [activities]);

  // 2. Process data for Category Pie Chart (past 30 days)
  const pieData = useMemo(() => {
    const totals: Record<string, number> = {
      transportation: 0,
      food: 0,
      energy: 0,
      waste: 0,
    };
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    activities.forEach((act) => {
      const actDate = new Date(act.date);
      if (actDate >= thirtyDaysAgo) {
        if (totals[act.category] !== undefined) {
          // Exclude negative emissions (offsets) in pie share to keep slices clean
          totals[act.category] += Math.max(0, act.carbonTons);
        }
      }
    });

    const colorsMap: Record<string, string> = {
      transportation: "#3b82f6", // blue
      food: "#ef4444",           // rose
      energy: "#f59e0b",         // amber
      waste: "#10b981",          // emerald
    };

    return Object.entries(totals)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value * 100) / 100,
        color: colorsMap[name],
      }))
      .filter((item) => item.value > 0);
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }} className="glass-panel">
        <ShieldAlert size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
        <h3>No activity records to analyze</h3>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Please go to the Tracker tab and log some activities to view carbon footprint charts.
        </p>
      </div>
    );
  }

  // Calculate descriptive summary for screen-readers
  const highestCategory = pieData.reduce((prev, current) => (prev.value > current.value ? prev : current), { name: "None", value: 0 });

  return (
    <div className="dashboard-grid" id="analytics-panel" role="tabpanel" aria-labelledby="tab-analytics">
      {/* Descriptive summary for screen-readers */}
      <div className="col-12 skip-link" tabIndex={0} style={{ position: "static", width: "auto" }}>
        <span>
          Screen reader summary: Weekly footprint charts show your daily carbon trends. Your primary emitter in the past 30 days is {highestCategory.name} with {highestCategory.value} kg CO2 equivalent.
        </span>
      </div>

      {/* 1. Stacked Weekly Trend Chart */}
      <div className="col-8 glass-panel" style={{ minHeight: "400px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <BarChart3 size={20} style={{ color: "var(--accent-blue)" }} />
          <h3>Weekly Emission Trends (kg CO2eq)</h3>
        </div>
        <div style={{ flex: 1, minHeight: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="transportation" name="Transportation" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="food" name="Food" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="energy" name="Energy" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="waste" name="Waste" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Monthly Category Distribution (Pie Chart) */}
      <div className="col-4 glass-panel" style={{ minHeight: "400px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <PieIcon size={20} style={{ color: "var(--accent-emerald)" }} />
          <h3>Category Share (Past 30 Days)</h3>
        </div>
        {pieData.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No emissions logged in past 30 days.</p>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} kg CO2eq`, "Footprint"]}
                    contentStyle={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
              {pieData.map((item, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }}></span>
                    <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{item.value} kg ({Math.round((item.value / pieData.reduce((acc, i) => acc + i.value, 0)) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
