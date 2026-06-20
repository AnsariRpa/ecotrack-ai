import React, { useState, useMemo } from "react";
import { EducationHubFact } from "../types/index.js";
import { BookOpen, Search, HelpCircle, ShieldAlert } from "lucide-react";

interface EducationHubViewProps {
  facts: EducationHubFact[];
  loading: boolean;
}

export const EducationHubView: React.FC<EducationHubViewProps> = ({ facts, loading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Topics" },
    { id: "transportation", label: "Transportation" },
    { id: "food", label: "Food Habits" },
    { id: "energy", label: "Energy" },
    { id: "waste", label: "Waste & Recycling" },
  ];

  // Real-time filtering
  const filteredFacts = useMemo(() => {
    return facts.filter((fact) => {
      const matchesCategory = activeCategory === "all" || fact.category === activeCategory;
      const matchesSearch =
        fact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fact.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [facts, activeCategory, searchQuery]);

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
    <div className="dashboard-grid" id="education-panel" role="tabpanel" aria-labelledby="tab-education">
      {/* Search and Category Filters Row */}
      <div className="col-12 glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={20} style={{ color: "var(--accent-emerald)" }} />
            <h3>Education & Sustainability Hub</h3>
          </div>

          <div style={{ position: "relative", minWidth: "260px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search environmental facts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px" }}
              aria-label="Search environmental facts"
            />
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
            />
          </div>
        </div>

        <div className="tabs-header" style={{ marginBottom: 0 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`tab-link ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Facts Card Grid */}
      <div className="col-8">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }} className="glass-panel" aria-live="polite">
            <p style={{ color: "var(--text-secondary)" }}>Loading environmental repository...</p>
          </div>
        ) : filteredFacts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }} className="glass-panel">
            <ShieldAlert size={36} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <h3>No environmental facts found</h3>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
              Try adjusting your filters or search keywords.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredFacts.map((fact) => (
              <article
                key={fact.id}
                className="glass-panel"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "99px",
                      background: "rgba(255,255,255,0.05)",
                      textTransform: "capitalize"
                    }}
                  >
                    {getCategoryEmoji(fact.category)} {fact.category}
                  </span>
                </div>
                <h4 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>{fact.title}</h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.55 }}>
                  {fact.content}
                </p>
                {fact.source && (
                  <footer style={{ marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Source: <cite>{fact.source}</cite>
                  </footer>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Trivia Block */}
      <div className="col-4 glass-panel" style={{ height: "fit-content" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <HelpCircle size={20} style={{ color: "var(--accent-amber)" }} />
          <h3>Carbon Footprint 101</h3>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px" }}>
          A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by our actions.
        </p>
        <div
          style={{
            background: "var(--accent-amber-glow)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "0.8rem",
            lineHeight: 1.45,
            color: "var(--text-primary)"
          }}
        >
          <strong>Did You Know?</strong> The average carbon footprint for a person in the United States is about 16 tons per year. Globally, the average is closer to 4 tons. To avoid a 2°C rise in global temperatures, the average global carbon footprint per year needs to drop to under 2 tons by 2050.
        </div>
      </div>
    </div>
  );
};
