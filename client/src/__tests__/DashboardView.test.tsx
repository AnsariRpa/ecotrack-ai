import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DashboardView } from "../components/DashboardView.tsx";
import { DashboardSummary } from "../types/index.ts";

vi.mock("lucide-react", () => ({
  Trash2: () => <span data-testid="trash-icon" />,
  ShieldAlert: () => <span data-testid="shield-icon" />,
  Award: () => <span data-testid="award-icon" />,
  Footprint: () => <span data-testid="footprint-icon" />,
  Sparkles: () => <span data-testid="sparkles-icon" />,
  PlusCircle: () => <span data-testid="plus-icon" />,
}));

const mockSummary: DashboardSummary = {
  scores: {
    daily: 12.4,
    weekly: 84.8,
    monthly: 320.5,
  },
  rating: "B",
  breakdown: [
    { name: "Transportation", value: 35 },
    { name: "Food", value: 25 },
    { name: "Energy", value: 40 },
    { name: "Waste", value: 0 },
  ],
  goals: {
    total: 4,
    completed: 2,
    percentage: 50,
  },
  badgeCount: 2,
  recentActivities: [
    {
      id: "a1",
      userId: "u1",
      category: "transportation",
      type: "car",
      amount: 20,
      unit: "km",
      carbonTons: 3.6,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ],
};

describe("DashboardView Component", () => {
  it("renders daily, weekly, and monthly scores", () => {
    const handleTabChange = vi.fn();
    const handleDeleteActivity = vi.fn();
    
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        onTabChange={handleTabChange}
        onDeleteActivity={handleDeleteActivity}
      />
    );

    expect(screen.getByText("12.4")).toBeDefined();
    expect(screen.getByText("84.8")).toBeDefined();
    expect(screen.getByText("320.5")).toBeDefined();
    expect(screen.getByText("Jane Doe")).toBeDefined();
  });

  it("renders goals completion percentage", () => {
    const handleTabChange = vi.fn();
    const handleDeleteActivity = vi.fn();
    
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        onTabChange={handleTabChange}
        onDeleteActivity={handleDeleteActivity}
      />
    );

    expect(screen.getByText("50% Completed")).toBeDefined();
  });

  it("shows loading message when loading state is true", () => {
    const handleTabChange = vi.fn();
    const handleDeleteActivity = vi.fn();
    
    render(
      <DashboardView
        summary={null}
        loading={true}
        onTabChange={handleTabChange}
        onDeleteActivity={handleDeleteActivity}
      />
    );

    expect(screen.getByText("Analyzing your environmental footprint...")).toBeDefined();
  });
});
