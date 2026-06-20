import React from "react";
import { LayoutDashboard, PenTool, BarChart3, Target, Award, BookOpen, BrainCircuit } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tracker", label: "Tracker", icon: PenTool },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "goals", label: "Goals", icon: Target },
    { id: "coach", label: "AI Coach", icon: BrainCircuit },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "achievements", label: "Achievements", icon: Award },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand" aria-label="EcoTrack AI home">
          <span style={{ fontSize: "1.5rem" }} role="img" aria-label="seedling">🌱</span>
          <span className="gradient-text">EcoTrack AI</span>
        </div>
        <nav role="navigation" aria-label="Main navigation">
          <ul className="nav-links" role="tablist">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.id} role="presentation">
                  <button
                    role="tab"
                    aria-selected={activeTab === link.id}
                    aria-controls={`${link.id}-panel`}
                    id={`tab-${link.id}`}
                    className={`nav-button ${activeTab === link.id ? "active" : ""}`}
                    onClick={() => setActiveTab(link.id)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{link.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};
