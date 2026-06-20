/**
 * AnalyticsView — Carbon Analytics & Gemini-Powered Forecasting
 *
 * Three-panel analytics view:
 * 1. Stacked bar chart — 7-day historical emissions by category
 * 2. Category pie chart — 30-day emission share breakdown
 * 3. Forecast line chart — 7-day and 30-day projected emissions (Gemini AI)
 */
import React, { useMemo, useState, useEffect } from "react";
import { Activity, ForecastResponse } from "../types/index.js";
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
  Area,
  AreaChart,
} from "recharts";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  ShieldAlert,
  RefreshCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { api } from "../services/api.js";

interface AnalyticsViewProps {
  activities: Activity[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ activities }) => {
  const [forecastDays, setForecastDays] = useState<7 | 30>(7);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Load forecast on mount and when forecastDays changes
  useEffect(() => {
    fetchForecast(forecastDays);
  }, [forecastDays]);

  const fetchForecast = async (days: 7 | 30) => {
    try {
      setLoadingForecast(true);
      const data = await api.getForecast(days);
      setForecastData(data);
    } catch (e) {
      console.warn("[AnalyticsView] Forecast fetch failed:", e);
    } finally {
      setLoadingForecast(false);
    }
  };

  // 1. Process data for Stacked Bar Chart (past 7 days)
  const weeklyTrendData = useMemo(() => {
    const dataMap: Record<string, Record<string, number>> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { weekday: "short" });
      dataMap[dateString] = { transportation: 0, food: 0, energy: 0, waste: 0 };
    }

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    activities.forEach((act) => {
      const actDate = new Date(act.date);
      if (actDate >= sevenDaysAgo) {
        const dayName = actDate.toLocaleDateString(undefined, { weekday: "short" });
        if (dataMap[dayName]) {
          const val = Math.max(0, act.carbonTons);
          dataMap[dayName][act.category] =
            Math.round((dataMap[dayName][act.category] + val) * 10) / 10;
        }
      }
    });

    return Object.entries(dataMap).map(([date, categories]) => ({ date, ...categories }));
  }, [activities]);

  // 2. Process data for Category Pie Chart (past 30 days)
  const pieData = useMemo(() => {
    const totals: Record<string, number> = {
      transportation: 0,
      food: 0,
      energy: 0,
      waste: 0,
    };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    activities.forEach((act) => {
      if (new Date(act.date) >= thirtyDaysAgo && totals[act.category] !== undefined) {
        totals[act.category] += Math.max(0, act.carbonTons);
      }
    });

    const colorsMap: Record<string, string> = {
      transportation: "#3b82f6",
      food: "#ef4444",
      energy: "#f59e0b",
      waste: "#10b981",
    };

    return Object.entries(totals)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value * 100) / 100,
        color: colorsMap[name],
      }))
      .filter((item) => item.value > 0);
  }, [activities]);

  // 3. Prepare forecast chart data
  const forecastChartData = useMemo(() => {
    if (!forecastData?.forecast?.dailyBreakdown) return [];
    return forecastData.forecast.dailyBreakdown.map((d) => ({
      date: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      projected: Math.round(d.projectedKgCO2 * 100) / 100,
      confidence: Math.round(d.confidence * 100),
    }));
  }, [forecastData]);

  const trendIcon = forecastData?.forecast?.trend;

  if (activities.length === 0 && !forecastData) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }} className="glass-panel">
        <ShieldAlert size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
        <h3 style={{ marginBottom: "8px" }}>No activity data to analyse</h3>
        <p style={{ color: "var(--text-secondary)" }}>
          Log activities in the Tracker tab to see your carbon analytics and AI-generated forecasts.
        </p>
      </div>
    );
  }

  const highestCategory = pieData.reduce(
    (prev, curr) => (prev.value > curr.value ? prev : curr),
    { name: "None", value: 0, color: "" }
  );

  const totalPieEmissions = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div
      className="dashboard-grid"
      id="analytics-panel"
      role="tabpanel"
      aria-labelledby="tab-analytics"
    >
      {/* Screen reader summary */}
      <div className="col-12 skip-link" tabIndex={0} style={{ position: "static", width: "auto" }}>
        <span>
          Analytics summary: Your top emitter in the past 30 days is {highestCategory.name} at{" "}
          {highestCategory.value} kg CO₂.
          {forecastData &&
            ` The ${forecastDays}-day forecast projects ${forecastData.forecast.projectedTotalKgCO2.toFixed(1)} kg total.`}
        </span>
      </div>

      {/* ── Row 1: Weekly Bar Chart + Pie Chart ───────────────────────── */}

      {/* Stacked Bar Chart */}
      <div className="col-8 glass-panel" style={{ minHeight: "380px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <BarChart3 size={20} style={{ color: "var(--accent-blue)" }} />
          <h3>Weekly Emission Trends (kg CO₂eq)</h3>
        </div>
        <div style={{ flex: 1, minHeight: "280px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrendData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
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
              <Bar dataKey="transportation" name="Transportation" stackId="a" fill="#3b82f6" />
              <Bar dataKey="food" name="Food" stackId="a" fill="#ef4444" />
              <Bar dataKey="energy" name="Energy" stackId="a" fill="#f59e0b" />
              <Bar dataKey="waste" name="Waste" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="col-4 glass-panel" style={{ minHeight: "380px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <PieIcon size={20} style={{ color: "var(--accent-emerald)" }} />
          <h3>Category Share (30 Days)</h3>
        </div>
        {pieData.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No emissions in the past 30 days.</p>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
                    formatter={(value) => [`${value} kg CO₂eq`, "Footprint"]}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
              {pieData.map((item, index) => (
                <div
                  key={index}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", alignItems: "center" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>
                    {item.value} kg ({Math.round((item.value / totalPieEmissions) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Row 2: Forecast Chart (Full Width) ────────────────────────── */}
      <div className="col-12 glass-panel" style={{ minHeight: "360px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={20} style={{ color: "#a5b4fc" }} />
            <h3>Projected Carbon Trend</h3>
            {forecastData?.forecast?.aiGenerated && (
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: "20px",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#a5b4fc",
                }}
              >
                🤖 Gemini Pro
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Trend badge */}
            {forecastData?.forecast?.trend && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background:
                    trendIcon === "improving"
                      ? "rgba(16,185,129,0.12)"
                      : trendIcon === "worsening"
                      ? "rgba(239,68,68,0.12)"
                      : "rgba(245,158,11,0.12)",
                  color:
                    trendIcon === "improving"
                      ? "var(--accent-emerald)"
                      : trendIcon === "worsening"
                      ? "var(--accent-rose)"
                      : "var(--accent-amber)",
                }}
              >
                {trendIcon === "improving" ? <ArrowDown size={12} /> : trendIcon === "worsening" ? <ArrowUp size={12} /> : <Minus size={12} />}
                {forecastData.forecast.trend}
              </span>
            )}
            {/* Period selector */}
            <div style={{ display: "flex", gap: "4px" }}>
              {([7, 30] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setForecastDays(d)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderColor: forecastDays === d ? "#a5b4fc" : "var(--border-color)",
                    background: forecastDays === d ? "rgba(99,102,241,0.2)" : "transparent",
                    color: forecastDays === d ? "#a5b4fc" : "var(--text-secondary)",
                  }}
                  aria-pressed={forecastDays === d}
                >
                  {d}d
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchForecast(forecastDays)}
              disabled={loadingForecast}
              className="btn btn-secondary"
              aria-label="Refresh forecast"
              style={{ padding: "5px 10px" }}
            >
              <RefreshCcw size={14} className={loadingForecast ? "spin-animation" : ""} />
            </button>
          </div>
        </div>

        {loadingForecast ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }} aria-live="polite">
            <Sparkles size={32} className="pulse-animation" style={{ color: "#a5b4fc" }} />
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Generating AI forecast...</p>
          </div>
        ) : forecastChartData.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Forecast unavailable. Log activities to enable trend analysis.</p>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastChartData} margin={{ top: 8, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} unit=" kg" />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value: number) => [`${value} kg CO₂`, "Projected"]}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  name="Projected kg CO₂"
                  stroke="#a5b4fc"
                  strokeWidth={2.5}
                  fill="url(#forecastGradient)"
                  dot={{ fill: "#a5b4fc", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Forecast Summary Metrics */}
        {forecastData && !loadingForecast && (
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Projected Total
              </p>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#a5b4fc" }}>
                {forecastData.forecast.projectedTotalKgCO2.toFixed(1)} kg
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Goal Achievement
              </p>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color:
                    forecastData.forecast.goalAchievementProbability >= 70
                      ? "var(--accent-emerald)"
                      : forecastData.forecast.goalAchievementProbability >= 40
                      ? "var(--accent-amber)"
                      : "var(--accent-rose)",
                }}
              >
                {forecastData.forecast.goalAchievementProbability}%
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Data Points Used
              </p>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {forecastData.historicalDataPoints}
              </p>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {forecastData?.forecast?.insights && forecastData.forecast.insights.length > 0 && !loadingForecast && (
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {forecastData.forecast.insights.map((insight, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "10px 12px",
                  background: "rgba(165,180,252,0.06)",
                  borderRadius: "8px",
                  border: "1px solid rgba(165,180,252,0.12)",
                }}
              >
                <Sparkles size={14} style={{ color: "#a5b4fc", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
        .pulse-animation { animation: pulse 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
