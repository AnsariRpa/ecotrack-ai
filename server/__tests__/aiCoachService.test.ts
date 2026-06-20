import { describe, it, expect } from "vitest";
import { generateRecommendations } from "../src/services/aiCoachService.js";
import { Activity } from "@prisma/client";

describe("AI Coach Service", () => {
  it("should generate recommendations when car travel is high", () => {
    const mockActivities: Activity[] = [
      {
        id: "1",
        userId: "u1",
        category: "transportation",
        type: "car",
        amount: 80,
        unit: "km",
        carbonTons: 14.4,
        date: new Date(),
        createdAt: new Date(),
      },
    ];

    const recs = generateRecommendations(mockActivities);
    const transitAdvice = recs.find((r) => r.title === "Opt for Public Transit or Carpooling");
    
    expect(transitAdvice).toBeDefined();
    expect(transitAdvice?.potentialSaving).toBeGreaterThan(0);
  });

  it("should generate beef advice when beef logs are high", () => {
    const mockActivities: Activity[] = [
      {
        id: "2",
        userId: "u1",
        category: "food",
        type: "beef",
        amount: 3,
        unit: "meals",
        carbonTons: 21.6,
        date: new Date(),
        createdAt: new Date(),
      },
    ];

    const recs = generateRecommendations(mockActivities);
    const beefAdvice = recs.find((r) => r.title === "Introduce Meatless Mondays");
    
    expect(beefAdvice).toBeDefined();
    expect(beefAdvice?.potentialSaving).toBe(Math.round(3 * (7.2 - 0.6) * 100) / 100);
  });

  it("should provide default recommendations if logs are empty", () => {
    const recs = generateRecommendations([]);
    expect(recs.length).toBe(4);
    expect(recs.some((r) => r.category === "transportation")).toBe(true);
    expect(recs.some((r) => r.category === "food")).toBe(true);
    expect(recs.some((r) => r.category === "energy")).toBe(true);
    expect(recs.some((r) => r.category === "waste")).toBe(true);
  });
});
